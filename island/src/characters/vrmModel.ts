import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MToonMaterial, MToonMaterialOutlineWidthMode, VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm';

// Loading and one-time cleanup of a VRM so it is cheap to draw and reads well in the
// game: fewer draw calls, a visible cel outline at gameplay distance, shadows on.

/**
 * Outline width as a fraction of half the screen height (MToon "screenCoordinates").
 * 0.003 is about 1.35 px on a 900 px tall canvas at any distance. The VRoid files ship
 * world-space outlines of 0.75 mm, which are sub-pixel at the game camera's 8.5 m.
 */
export const OUTLINE_SCREEN_WIDTH = 0.003;
/** Hair ships with no outline at all; it gets one so the silhouette reads against grass. */
const HAIR_OUTLINE_COLOR = new THREE.Color(0.32, 0.28, 0.32);

export type DrawStats = {
  meshes: number;
  drawCalls: number; // per main pass, outlines included (the shadow pass draws the same groups again)
  triangles: number; // per main pass, outlines included
};

/** Fetches and parses a .vrm file. Throws with the URL on any failure. */
export async function loadVrm(url: string): Promise<VRM> {
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  let gltf;
  try {
    gltf = await loader.loadAsync(url);
  } catch (err) {
    throw new Error(`[vrm] failed to load ${url}: ${err instanceof Error ? err.message : String(err)}`);
  }
  const vrm = gltf.userData.vrm as VRM | undefined;
  if (!vrm) throw new Error(`[vrm] ${url} parsed as glTF but has no VRM extension`);
  return vrm;
}

function meshesOf(root: THREE.Object3D): THREE.Mesh[] {
  const out: THREE.Mesh[] = [];
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) out.push(obj as THREE.Mesh);
  });
  return out;
}

export function countDrawStats(root: THREE.Object3D): DrawStats {
  let drawCalls = 0;
  let triangles = 0;
  const meshes = meshesOf(root);
  for (const mesh of meshes) {
    if (!mesh.visible) continue;
    const geometry = mesh.geometry;
    const total = geometry.index ? geometry.index.count : geometry.getAttribute('position').count;
    if (Array.isArray(mesh.material) && geometry.groups.length > 0) {
      for (const group of geometry.groups) {
        drawCalls++;
        triangles += Math.min(group.count, total - group.start) / 3;
      }
    } else {
      drawCalls++;
      triangles += total / 3;
    }
  }
  return { meshes: meshes.length, drawCalls, triangles: Math.round(triangles) };
}

/** True when mergeGeometries() would accept these (checked here so it never logs an error). */
function canMerge(geometries: THREE.BufferGeometry[]): boolean {
  const first = geometries[0];
  const names = Object.keys(first.attributes).sort().join(',');
  for (const geometry of geometries) {
    if (Object.keys(geometry.attributes).sort().join(',') !== names) return false;
    if (Object.keys(geometry.morphAttributes).length > 0) return false;
    if ((geometry.index === null) !== (first.index === null)) return false;
    for (const name of Object.keys(first.attributes)) {
      const a = first.getAttribute(name) as THREE.BufferAttribute;
      const b = geometry.getAttribute(name) as THREE.BufferAttribute;
      if (a.itemSize !== b.itemSize || a.normalized !== b.normalized) return false;
      if (a.array.constructor !== b.array.constructor) return false;
      if ((a as unknown as THREE.InterleavedBufferAttribute).isInterleavedBufferAttribute) return false;
      if ((b as unknown as THREE.InterleavedBufferAttribute).isInterleavedBufferAttribute) return false;
    }
  }
  return true;
}

/**
 * VRoid splits hair into 48-114 primitives that share one or two materials, so each
 * strand group is its own draw call. After combineSkeletons() every primitive shares
 * one skeleton and bind matrix, so primitives with the same single, opaque material and
 * no morph targets can be merged into one skinned mesh without changing the result.
 */
function mergeSiblingPrimitives(root: THREE.Object3D): number {
  const parents = new Set<THREE.Object3D>();
  root.traverse((obj) => {
    if ((obj as THREE.SkinnedMesh).isSkinnedMesh && obj.parent) parents.add(obj.parent);
  });
  let removed = 0;
  for (const parent of parents) {
    const byMaterial = new Map<THREE.Material, THREE.SkinnedMesh[]>();
    for (const child of parent.children) {
      const mesh = child as THREE.SkinnedMesh;
      if (!mesh.isSkinnedMesh || Array.isArray(mesh.material)) continue;
      if (mesh.material.transparent) continue;
      if (Object.keys(mesh.geometry.morphAttributes).length > 0) continue;
      const list = byMaterial.get(mesh.material) ?? [];
      list.push(mesh);
      byMaterial.set(mesh.material, list);
    }
    for (const [material, meshes] of byMaterial) {
      if (meshes.length < 2) continue;
      const first = meshes[0];
      const sameBinding = meshes.every(
        (m) =>
          m.skeleton === first.skeleton &&
          m.bindMatrix.equals(first.bindMatrix) &&
          m.position.equals(first.position) &&
          m.quaternion.equals(first.quaternion) &&
          m.scale.equals(first.scale),
      );
      const geometries = meshes.map((m) => m.geometry);
      if (!sameBinding || !canMerge(geometries)) {
        console.warn(`[vrm] could not merge ${meshes.length} primitives of "${material.name}" (different skeleton or attributes); leaving them separate`);
        continue;
      }
      const merged = mergeGeometries(geometries, false);
      const mesh = new THREE.SkinnedMesh(merged, material);
      mesh.name = `${first.name} (merged ${meshes.length})`;
      mesh.renderOrder = first.renderOrder;
      mesh.position.copy(first.position);
      mesh.quaternion.copy(first.quaternion);
      mesh.scale.copy(first.scale);
      mesh.bind(first.skeleton, first.bindMatrix);
      parent.add(mesh);
      for (const old of meshes) {
        old.removeFromParent();
        old.geometry.dispose();
      }
      removed += meshes.length - 1;
    }
  }
  return removed;
}

/** Switches the model's own outlines to screen space and adds one to outline-less hair. */
function setUpOutlines(root: THREE.Object3D): { switched: number; added: number } {
  let switched = 0;
  let added = 0;
  for (const mesh of meshesOf(root)) {
    if (Array.isArray(mesh.material)) {
      for (const material of mesh.material) {
        if (material instanceof MToonMaterial && material.isOutline) {
          material.outlineWidthMode = MToonMaterialOutlineWidthMode.ScreenCoordinates;
          material.outlineWidthFactor = OUTLINE_SCREEN_WIDTH;
          switched++;
        }
      }
      continue;
    }
    const surface = mesh.material;
    if (!(surface instanceof MToonMaterial) || surface.transparent) continue;
    if (!/hair/i.test(surface.name)) continue;
    const outline = surface.clone();
    outline.name = `${surface.name} (Outline)`;
    outline.isOutline = true;
    outline.side = THREE.BackSide;
    outline.outlineWidthMode = MToonMaterialOutlineWidthMode.ScreenCoordinates;
    outline.outlineWidthFactor = OUTLINE_SCREEN_WIDTH;
    outline.outlineColorFactor = HAIR_OUTLINE_COLOR.clone();
    outline.outlineLightingMixFactor = 1; // a darker shade of the lit hair, not flat black
    mesh.material = [surface, outline];
    const count = mesh.geometry.index ? mesh.geometry.index.count : mesh.geometry.getAttribute('position').count;
    mesh.geometry.clearGroups();
    mesh.geometry.addGroup(0, count, 0);
    mesh.geometry.addGroup(0, count, 1);
    added++;
  }
  return { switched, added };
}

export type PrepReport = {
  before: DrawStats;
  after: DrawStats;
  mergedAway: number;
  outlinesSwitched: number;
  outlinesAdded: number;
};

/**
 * One-time cleanup after loading, in the order three-vrm recommends, then our own
 * passes. Leaves the model facing +Z with its feet at the origin.
 */
export function prepareVrm(vrm: VRM): PrepReport {
  VRMUtils.removeUnnecessaryVertices(vrm.scene);
  VRMUtils.combineSkeletons(vrm.scene);
  VRMUtils.combineMorphs(vrm);
  VRMUtils.rotateVRM0(vrm);
  const before = countDrawStats(vrm.scene);
  const mergedAway = mergeSiblingPrimitives(vrm.scene);
  const outlines = setUpOutlines(vrm.scene);
  for (const mesh of meshesOf(vrm.scene)) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) mesh.frustumCulled = false;
  }
  vrm.scene.updateMatrixWorld(true);
  return {
    before,
    after: countDrawStats(vrm.scene),
    mergedAway,
    outlinesSwitched: outlines.switched,
    outlinesAdded: outlines.added,
  };
}
