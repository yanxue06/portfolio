import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { GeoBuilder, gradientY, mat4 } from './geo';
import { mulberry32 } from '../util/math';

// Small instanced things that aren't trees: cacti, giant mushrooms, lily pads.
// Each prop kind is one geometry + one material, drawn as a single InstancedMesh.

export type PropKind = 'cactus' | 'mushroom' | 'mushroomGlow' | 'lily';
export type PropPlacement = { kind: PropKind; x: number; y: number; z: number; rot: number; scale: number };

function cactusGeometry(): THREE.BufferGeometry {
  const b = new GeoBuilder(mulberry32(91));
  const ribbed = (r: number, len: number) => {
    let g: THREE.BufferGeometry = new THREE.CapsuleGeometry(r, len, 6, 16);
    g.deleteAttribute('uv');
    g = mergeVertices(g);
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const a = Math.atan2(z, x);
      const k = 1 + Math.cos(a * 8) * 0.07;
      pos.setXYZ(i, x * k, pos.getY(i), z * k);
    }
    g.computeVertexNormals();
    return g;
  };
  const green = gradientY('#3c5a2c', '#6f8c4a', 0, 6);
  b.add(ribbed(0.42, 4.6), green, mat4(0, 2.6, 0));
  b.add(ribbed(0.28, 1.4), green, mat4(0.75, 2.2, 0, 0, 1, 1, 1, 0, -Math.PI / 2));
  b.add(ribbed(0.28, 1.8), green, mat4(1.25, 3.2, 0));
  b.add(ribbed(0.25, 1.0), green, mat4(-0.62, 3.0, 0, 0, 1, 1, 1, 0, Math.PI / 2));
  b.add(ribbed(0.25, 1.3), green, mat4(-1.05, 3.8, 0));
  return b.build();
}

function mushroomGeometry(): THREE.BufferGeometry {
  const b = new GeoBuilder(mulberry32(92));
  const stem = new THREE.CylinderGeometry(0.32, 0.5, 3.4, 14, 4);
  b.add(stem, gradientY('#b9ad97', '#efe6d4', 0, 3.4), mat4(0, 1.7, 0));
  const cap = new THREE.SphereGeometry(1.9, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
  b.add(cap, gradientY('#5b2a6e', '#a24bb8', 3.2, 5.2), mat4(0, 3.25, 0, 0, 1, 0.62, 1));
  // Spots: tiny flattened bumps, so a low-poly sphere reads the same (36 triangles each instead of 80).
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const r = 0.9 + (i % 3) * 0.3;
    b.add(new THREE.SphereGeometry(0.17, 6, 4), '#f3e9ff', mat4(Math.cos(a) * r, 3.25 + 1.18 * Math.sqrt(1 - (r / 1.9) ** 2), Math.sin(a) * r, 0, 1, 0.5, 1));
  }
  return b.build();
}

function mushroomGlowGeometry(): THREE.BufferGeometry {
  const ring = new THREE.RingGeometry(0.55, 1.85, 32);
  ring.rotateX(Math.PI / 2);
  ring.translate(0, 3.22, 0);
  return ring;
}

/** A small raft of pads: one big, a few smaller ones drifting off it, each notch turned its own way. */
function lilyGeometry(): THREE.BufferGeometry {
  const b = new GeoBuilder(mulberry32(93));
  const pads = [
    { x: 0, z: 0, r: 0.75, turn: 0.3, color: '#3f6b2e' },
    { x: 1.1, z: 0.35, r: 0.42, turn: 2.2, color: '#4b7a34' },
    { x: -0.5, z: 1.0, r: 0.34, turn: 4.1, color: '#355f27' },
    { x: -0.75, z: -0.8, r: 0.5, turn: 5.4, color: '#46722f' },
  ];
  pads.forEach((p, k) => {
    const g = new THREE.CircleGeometry(p.r, 16, p.turn, Math.PI * 2 - 0.6);
    g.rotateX(-Math.PI / 2);
    b.add(g, p.color, mat4(p.x, k * 0.004, p.z)); // a few mm apart so touching pads never flicker
  });
  return b.build();
}

const DEFS: Record<PropKind, { geometry: () => THREE.BufferGeometry; material: () => THREE.Material; shadow: boolean }> = {
  cactus: { geometry: cactusGeometry, material: () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 }), shadow: true },
  mushroom: { geometry: mushroomGeometry, material: () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 }), shadow: true },
  mushroomGlow: {
    geometry: mushroomGlowGeometry,
    material: () => new THREE.MeshBasicMaterial({ color: new THREE.Color('#7ff2ff').multiplyScalar(3.2), side: THREE.DoubleSide }),
    shadow: false,
  },
  lily: { geometry: lilyGeometry, material: () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, side: THREE.DoubleSide }), shadow: false },
};

/** How much each copy's brightness may differ (0.1 = +/-10%), so repeats don't look stamped out. */
const TINT_JITTER: Record<PropKind, number> = { cactus: 0.12, mushroom: 0.1, mushroomGlow: 0.3, lily: 0.14 };

/** Stable 0..1 hash of a position: the same prop gets the same tint on every load. */
function hash01(x: number, z: number, salt: number): number {
  const h = Math.sin(x * 12.9898 + z * 78.233 + salt * 37.719) * 43758.5453;
  return h - Math.floor(h);
}

export class Props {
  readonly group = new THREE.Group();
  private readonly owned: Array<{ geo: THREE.BufferGeometry; mat: THREE.Material; mesh: THREE.InstancedMesh }> = [];

  constructor(placements: PropPlacement[]) {
    this.group.name = 'props';
    const byKind = new Map<PropKind, PropPlacement[]>();
    for (const p of placements) {
      let list = byKind.get(p.kind);
      if (!list) {
        list = [];
        byKind.set(p.kind, list);
      }
      list.push(p);
    }
    const tint = new THREE.Color();
    for (const [kind, list] of byKind) {
      const def = DEFS[kind];
      const geo = def.geometry();
      const mat = def.material();
      const mesh = new THREE.InstancedMesh(geo, mat, list.length);
      const jitter = TINT_JITTER[kind];
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        mesh.setMatrixAt(i, mat4(p.x, p.y, p.z, p.rot, p.scale));
        // Brightness varies per copy; a slight warm/cool lean keeps neighbors from matching exactly.
        const v = 1 + (hash01(p.x, p.z, 1) * 2 - 1) * jitter;
        const lean = (hash01(p.x, p.z, 2) * 2 - 1) * jitter * 0.35;
        tint.setRGB(v * (1 + lean), v, v * (1 - lean));
        mesh.setColorAt(i, tint);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.castShadow = def.shadow;
      mesh.receiveShadow = true;
      mesh.computeBoundingSphere();
      mesh.name = `props-${kind}`;
      this.group.add(mesh);
      this.owned.push({ geo, mat, mesh });
    }
    if (placements.length) console.info(`[props] ${placements.length} props: ${[...byKind.keys()].join(', ')}`);
  }

  dispose(): void {
    for (const o of this.owned) {
      o.geo.dispose();
      o.mat.dispose();
      o.mesh.dispose();
    }
  }
}
