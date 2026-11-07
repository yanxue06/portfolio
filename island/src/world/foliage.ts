import * as THREE from 'three';
import type { QualitySettings } from '../quality';
import { GRID, WORLD, HALF, type Island } from './terrain';
import { GRID_UV_GLSL } from './glsl';
import { circleCollider, type ColliderGrid } from './collision';
import { mulberry32 } from '../util/math';
import { Forest, type TreeInstance } from './trees';
import { Rocks, type RockPlacement } from './rocks';
import { Props, type PropKind, type PropPlacement } from './props';
import type { GrassDef, LandDef } from './lands/defs';
import type { LayerSet, Sky } from './assets';

// ---------------------------------------------------------------------------
// Grass + flowers: one instanced draw each. Blades live in a square window
// that follows the player and wraps around (toroidally), so the grass looks
// infinite while only ~100k blades exist. Height and density come from the
// island's grid textures, sampled in the vertex shader.
// ---------------------------------------------------------------------------

type FieldKind = 'grass' | 'flowers';

function bladeGeometry(): THREE.BufferGeometry {
  const width = 0.075;
  const ys = [0, 0.32, 0.64];
  const pos: number[] = [];
  for (const y of ys) {
    const w = width * Math.pow(1 - y, 0.8) * 0.5;
    pos.push(-w, y, y * y * 0.18, w, y, y * y * 0.18);
  }
  pos.push(0, 1, 0.18);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(pos.length).fill(0).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  geo.setIndex([0, 1, 2, 2, 1, 3, 2, 3, 4, 4, 3, 5, 4, 5, 6]);
  return geo;
}

function flowerGeometry(): THREE.BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  const quad = (a: number[], b: number[], c: number[], d: number[]) => {
    const base = pos.length / 3;
    pos.push(...a, ...b, ...c, ...d);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };
  // stem (t = y, 0..0.7)
  quad([-0.018, 0, 0], [0.018, 0, 0], [0.012, 0.7, 0], [-0.012, 0.7, 0]);
  // Petals: a five-point star fan, slightly cupped (t > 0.7 is colored as petal).
  const center = pos.length / 3;
  pos.push(0, 0.74, 0);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const r = i % 2 === 0 ? 0.095 : 0.04;
    pos.push(Math.cos(a) * r, i % 2 === 0 ? 0.79 : 0.75, Math.sin(a) * r);
  }
  for (let i = 0; i < 10; i++) idx.push(center, center + 1 + i, center + 1 + ((i + 1) % 10));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(pos.length).fill(0).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  geo.setIndex(idx);
  return geo;
}

export type Field = {
  mesh: THREE.Mesh;
  update(time: number, center: THREE.Vector3, player: THREE.Vector3): void;
  /** Draws this share (0..1) of the blades. Offsets are random, so any prefix is an even thinning. */
  setDensity(share: number): void;
};

export function createField(island: Island, kind: FieldKind, count: number, size: number, seed: number, look: GrassDef): Field {
  const rng = mulberry32(seed);
  const blade = kind === 'grass' ? bladeGeometry() : flowerGeometry();
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = blade.index;
  geo.setAttribute('position', blade.getAttribute('position'));
  geo.setAttribute('normal', blade.getAttribute('normal'));
  const offsets = new Float32Array(count * 2);
  const params = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    offsets[i * 2] = rng() * size;
    offsets[i * 2 + 1] = rng() * size;
    params[i * 4] = rng() * Math.PI * 2; // rotation
    params[i * 4 + 1] = 0.6 + rng() * 0.7; // height scale
    params[i * 4 + 2] = rng(); // tint / phase
    params[i * 4 + 3] = rng(); // density threshold
  }
  geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 2));
  geo.setAttribute('aParams', new THREE.InstancedBufferAttribute(params, 4));
  geo.instanceCount = count;

  const uniforms = {
    uTime: { value: 0 },
    uCenter: { value: new THREE.Vector2() },
    uSize: { value: size },
    uHeight: { value: island.heightTexture },
    uMask: { value: island.grassTexture },
    uWorld: { value: WORLD },
    uGridN: { value: GRID },
    uPlayer: { value: new THREE.Vector3() },
    uBladeHeight: { value: kind === 'grass' ? look.height : 0.6 },
    uDensity: { value: kind === 'grass' ? look.density : look.flowers },
    uBase: { value: new THREE.Color(look.base) },
    uTip: { value: new THREE.Color(look.tip) },
    uTip2: { value: new THREE.Color(look.tip2) },
    uPetals: {
      value: [
        new THREE.Color('#ffffff'),
        new THREE.Color('#ffd84d'),
        new THREE.Color('#ff8fc7'),
        new THREE.Color('#b59cff'),
        new THREE.Color('#ffa552'),
      ],
    },
  };

  const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 1, metalness: 0 });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        attribute vec2 aOffset;
        attribute vec4 aParams;
        uniform float uTime;
        uniform vec2 uCenter;
        uniform float uSize;
        uniform sampler2D uHeight;
        uniform sampler2D uMask;
        uniform float uWorld;
        uniform float uGridN;
        uniform vec3 uPlayer;
        uniform float uBladeHeight;
        uniform float uDensity;
        varying float vGrassT;
        varying float vGrassTint;
        ${GRID_UV_GLSL}`,
      )
      .replace(
        '#include <beginnormal_vertex>',
        `vec2 gBase = uCenter - 0.5 * uSize;
        vec2 gXZ = gBase + mod(aOffset - gBase, uSize);
        vec2 gUv = wi_gridUv(gXZ, uWorld, uGridN);
        float gGround = texture2D(uHeight, gUv).r;
        float gMask = texture2D(uMask, gUv).r;
        float gDist = length(gXZ - uCenter) / (0.5 * uSize);
        // Toward the window edge each blade shrinks away over a long stretch (a third of the window
        // radius), so a step only changes it a little. Where it ends is jittered per blade, so the
        // edge is ragged instead of a clean circle that visibly travels with you. Every blade is
        // gone before the window edge, so wrapping never shows.
        float gReach = 0.86 + 0.14 * fract(aParams.x * 7.31 + aParams.z * 3.17);
        float gFade = 1.0 - smoothstep(gReach - 0.34, gReach, gDist);
        float gKeep = step(aParams.w, gMask * uDensity);
        float gCamNear = smoothstep(0.6, 2.4, length(gXZ - cameraPosition.xz));
        float gScale = aParams.y * gFade * gKeep * (0.55 + 0.45 * gMask) * gCamNear;
        float gT = position.y;
        vGrassT = gT;
        vGrassTint = aParams.z;
        float gCa = cos(aParams.x);
        float gSa = sin(aParams.x);
        float gWidth = gScale > 0.0001 ? 0.5 + 0.5 * gScale : 0.0;
        float gLx = position.x * gWidth;
        float gLz = position.z * gWidth;
        vec3 gRot = vec3(gLx * gCa - gLz * gSa, position.y * uBladeHeight * gScale, gLx * gSa + gLz * gCa);
        float gWind = sin(uTime * 1.6 + aParams.z * 6.2831 + gXZ.x * 0.12 + gXZ.y * 0.09) * 0.6
                    + sin(uTime * 2.9 + gXZ.x * 0.37 - gXZ.y * 0.21) * 0.25;
        vec2 gBend = vec2(0.82, 0.57) * (gWind * 0.3 + 0.12) * gT * gT * gScale;
        vec2 gAway = gXZ - uPlayer.xz;
        float gPd = length(gAway);
        float gPush = (1.0 - smoothstep(0.2, 1.6, gPd)) * (1.0 - step(2.2, abs(uPlayer.y - gGround)));
        gBend += (gAway / max(gPd, 0.001)) * gPush * 0.8 * gT * gT * gScale;
        vec3 grassPos = vec3(gXZ.x + gRot.x + gBend.x, gGround + gRot.y - dot(gBend, gBend) * 0.3, gXZ.y + gRot.z + gBend.y);
        vec3 objectNormal = normalize(vec3(gBend.x * 0.6, 1.0, gBend.y * 0.6));`,
      )
      .replace('#include <begin_vertex>', 'vec3 transformed = grassPos;');

    const colorCode =
      kind === 'grass'
        ? `vec3 gTipCol = mix(uTip, uTip2, smoothstep(0.62, 1.0, vGrassTint));
           diffuseColor.rgb = mix(uBase, gTipCol, smoothstep(0.0, 1.0, vGrassT));`
        : `int gIdx = int(floor(vGrassTint * 4.999));
           vec3 gPetal = uPetals[0];
           if (gIdx == 1) gPetal = uPetals[1];
           if (gIdx == 2) gPetal = uPetals[2];
           if (gIdx == 3) gPetal = uPetals[3];
           if (gIdx == 4) gPetal = uPetals[4];
           diffuseColor.rgb = vGrassT > 0.7 ? gPetal : mix(uBase, uTip, vGrassT);`;
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform vec3 uBase;
        uniform vec3 uTip;
        uniform vec3 uTip2;
        uniform vec3 uPetals[5];
        varying float vGrassT;
        varying float vGrassTint;`,
      )
      .replace('#include <color_fragment>', `#include <color_fragment>\n${colorCode}`)
      .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\nnormal = normalize(vNormal);');
  };
  mat.customProgramCacheKey = () => `field-${kind}`;

  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  mesh.name = kind;
  return {
    mesh,
    update(time, center, player) {
      uniforms.uTime.value = time;
      uniforms.uCenter.value.set(center.x, center.z);
      uniforms.uPlayer.value.copy(player);
    },
    setDensity(share) {
      geo.instanceCount = Math.max(1, Math.round(count * Math.min(1, Math.max(0, share))));
    },
  };
}

// ---------------------------------------------------------------------------
// Trees, bushes, rocks: instanced meshes placed from the island masks.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Trees, bushes and boulders, scattered by the land's own rules.
// ---------------------------------------------------------------------------

export type Exclusion = { x: number; z: number; r: number };

export type PlaceCandidate = {
  x: number;
  z: number;
  h: number;
  forest: number;
  rock: number;
  path: number;
  stone: number;
  slope: number;
  r: number; // uniform random
  r2: number; // uniform random
};

export type PlaceResult =
  | { kind: 'tree'; variant: number; scale: number; trunk: number }
  | { kind: 'rock'; scale: number }
  | { kind: 'prop'; prop: PropKind; scale: number; trunk: number; onWater?: boolean }
  | null;

export type Foliage = {
  group: THREE.Group;
  forest: Forest;
  rocks: Rocks;
  props: Props;
  grass: Field | null;
  flowers: Field | null;
  counts: Record<string, number>;
  update(time: number, focus: THREE.Vector3, camera: THREE.Vector3): void;
  setQuality(q: QualitySettings): void;
  dispose(): void;
};

export function createFoliage(
  renderer: THREE.WebGLRenderer,
  land: LandDef,
  island: Island,
  layers: LayerSet,
  _sky: Sky, // unused since impostors are lit live; kept so world.ts's call stays valid
  colliders: ColliderGrid,
  exclusions: Exclusion[],
  extraTrees: TreeInstance[] = [],
): Foliage {
  const t0 = performance.now();
  const rng = mulberry32(4242);
  const trees: TreeInstance[] = [];
  const rocks: RockPlacement[] = [];
  const props: PropPlacement[] = [];
  const excluded = (x: number, z: number, pad: number): boolean => {
    for (const e of exclusions) {
      const dx = x - e.x;
      const dz = z - e.z;
      if (dx * dx + dz * dz < (e.r + pad) * (e.r + pad)) return true;
    }
    return false;
  };

  const spacing = 4.4;
  const n = new THREE.Vector3();
  for (let gz = -HALF + 2; gz < HALF - 2; gz += spacing) {
    for (let gx = -HALF + 2; gx < HALF - 2; gx += spacing) {
      const x = gx + (rng() - 0.5) * spacing * 0.85;
      const z = gz + (rng() - 0.5) * spacing * 0.85;
      const r = rng();
      const r2 = rng();
      const h = island.heightAt(x, z);
      if (h < -1.6) continue;
      const path = island.sample(island.pathMask, x, z);
      const stone = island.sample(island.stoneMask, x, z);
      if (path > 0.02 || stone > 0.15) continue;
      if (excluded(x, z, 2)) continue;
      island.normalAt(x, z, n);
      const res = land.place({
        x,
        z,
        h,
        forest: island.sample(island.forestMask, x, z),
        rock: island.sample(island.rockMask, x, z),
        path,
        stone,
        slope: 1 - n.y,
        r,
        r2,
      });
      if (!res) continue;
      if (res.kind === 'prop') {
        const y = res.onWater ? 0.03 : h - 0.05;
        const rot = rng() * Math.PI * 2;
        props.push({ kind: res.prop, x, y, z, rot, scale: res.scale });
        if (res.prop === 'mushroom') {
          props.push({ kind: 'mushroomGlow', x, y, z, rot, scale: res.scale });
          colliders.add(circleCollider(x, z, 0.45 * res.scale, y - 1, y + 3.0 * res.scale, 'mushroom-stem'));
          colliders.add(circleCollider(x, z, 1.8 * res.scale, y + 3.0 * res.scale, y + 4.3 * res.scale, 'mushroom-cap'));
        } else if (res.trunk > 0) {
          colliders.add(circleCollider(x, z, res.trunk * res.scale, y - 1, y + 5 * res.scale, res.prop));
        }
        continue;
      }
      if (res.kind === 'tree') {
        const y = h - 0.15;
        trees.push({ variant: res.variant, x, y, z, rot: rng() * Math.PI * 2, scale: res.scale });
        if (res.trunk > 0) colliders.add(circleCollider(x, z, res.trunk * res.scale, y - 1, y + 40, 'tree'));
      } else {
        const s = res.scale;
        const sx = s * (0.8 + rng() * 0.5);
        const sy = s * (0.55 + rng() * 0.35);
        const sz = s * (0.8 + rng() * 0.5);
        const y = h - sy * 0.2;
        rocks.push({ variant: Math.floor(rng() * 4), x, y, z, rot: rng() * Math.PI * 2, sx, sy, sz });
        if (s > 0.8) colliders.add(circleCollider(x, z, Math.max(sx, sz) * 0.85, y - 2, y + sy * 0.85, 'rock'));
      }
    }
  }

  const group = new THREE.Group();
  group.name = 'foliage';
  for (const t of extraTrees) trees.push(t);
  const forest = new Forest(renderer, land.trees, trees);
  const propsMesh = new Props(props);
  const boulders = new Rocks(layers, rocks, { variants: 4, scale: land.layers[2].scale * 0.45, cap: land.rockCap, tint: land.layers[2].tint, capLayer: 0 });
  group.add(forest.group, boulders.group, propsMesh.group);

  let grass: Field | null = null;
  let flowers: Field | null = null;
  if (land.grass) {
    grass = createField(island, 'grass', land.grass.count, 62, 7, land.grass);
    group.add(grass.mesh);
    if (land.grass.flowers > 0) {
      flowers = createField(island, 'flowers', 9000, 70, 8, land.grass);
      group.add(flowers.mesh);
    }
  }

  const counts = { trees: trees.length, rocks: rocks.length, props: props.length };
  console.info(`[foliage] ${land.id}: ${JSON.stringify(counts)} placed in ${(performance.now() - t0).toFixed(0)}ms`);
  return {
    group,
    forest,
    rocks: boulders,
    props: propsMesh,
    grass,
    flowers,
    counts,
    update(time, focus, camera) {
      forest.update(camera, time);
      grass?.update(time, focus, focus);
      flowers?.update(time, focus, focus);
    },
    setQuality(q) {
      forest.setQuality(q.treeNear, q.treeFar, q.treeShadows);
      grass?.setDensity(q.grass);
      if (flowers) flowers.mesh.visible = q.flowers;
    },
    dispose() {
      forest.dispose();
      boulders.dispose();
      propsMesh.dispose();
      for (const f of [grass, flowers]) {
        if (!f) continue;
        f.mesh.geometry.dispose();
        (f.mesh.material as THREE.Material).dispose();
      }
    },
  };
}
