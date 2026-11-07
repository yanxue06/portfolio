import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { createNoise2D } from './noise';
import { mat4 } from './geo';
import type { LayerSet } from './assets';

// Boulders: smooth procedural shapes wearing the land's scanned rock texture
// (triplanar, so nothing stretches), with moss/sand/snow settling on top.

export type RockPlacement = { variant: number; x: number; y: number; z: number; rot: number; sx: number; sy: number; sz: number };

const nA = createNoise2D(501);
const nB = createNoise2D(502);
const nC = createNoise2D(503);

function noise3(x: number, y: number, z: number): number {
  return (nA(x, y) + nB(y, z) + nC(z, x)) / 3;
}

export function rockGeometry(seed: number): THREE.BufferGeometry {
  let geo: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, 5);
  geo.deleteAttribute('uv');
  geo.deleteAttribute('normal');
  geo = mergeVertices(geo);
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const o = seed * 17.31;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    let r = 1 + 0.38 * noise3(x * 0.9 + o, y * 0.9, z * 0.9 - o) + 0.14 * noise3(x * 2.6 - o, y * 2.6 + o, z * 2.6) + 0.05 * noise3(x * 7, y * 7, z * 7 + o);
    // Chisel a few flat-ish planes so it reads as rock, not a potato.
    const facet = Math.abs(noise3(x * 1.4 + 9, y * 1.4, z * 1.4 + o));
    r -= facet * facet * 0.25;
    let ny = y * r;
    if (ny < -0.25) ny = -0.25 + (ny + 0.25) * 0.35; // flattened base
    pos.setXYZ(i, x * r, ny, z * r);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

export function createRockMaterial(set: LayerSet, rockLayer: number, capLayer: number, scale: number, cap: number, tint: THREE.Color): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 });
  const uniforms = {
    uRAlb: { value: set.albedo },
    uRNrm: { value: set.normal },
    uRScale: { value: scale },
    uRCap: { value: cap },
    uRTint: { value: tint },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRW;\nvarying vec3 vRN;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        mat4 rM = modelMatrix;
        #ifdef USE_INSTANCING
          rM = modelMatrix * instanceMatrix;
        #endif
        vRW = (rM * vec4(transformed, 1.0)).xyz;
        vRN = normalize(mat3(rM) * objectNormal);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2DArray uRAlb;
        uniform sampler2DArray uRNrm;
        uniform float uRScale;
        uniform float uRCap;
        uniform vec3 uRTint;
        varying vec3 vRW;
        varying vec3 vRN;
        void rTri(float layer, float s, vec3 p, vec3 n, out vec4 alb, out vec3 nw, out float ao) {
          vec3 w = pow(abs(n), vec3(4.0));
          w /= (w.x + w.y + w.z);
          vec4 ax = texture(uRAlb, vec3(p.zy / s, layer));
          vec4 ay = texture(uRAlb, vec3(p.xz / s, layer));
          vec4 az = texture(uRAlb, vec3(p.xy / s, layer));
          vec4 nx = texture(uRNrm, vec3(p.zy / s, layer));
          vec4 ny = texture(uRNrm, vec3(p.xz / s, layer));
          vec4 nz = texture(uRNrm, vec3(p.xy / s, layer));
          alb = ax * w.x + ay * w.y + az * w.z;
          vec3 tx = nx.xyz * 2.0 - 1.0;
          vec3 ty = ny.xyz * 2.0 - 1.0;
          vec3 tz = nz.xyz * 2.0 - 1.0;
          tx = vec3(tx.xy + n.zy, n.x);
          ty = vec3(ty.xy + n.xz, n.y);
          tz = vec3(tz.xy + n.xy, n.z);
          nw = normalize(tx.zyx * w.x + ty.xzy * w.y + tz.xyz * w.z);
          ao = nx.w * w.x + ny.w * w.y + nz.w * w.z;
        }`,
      )
      .replace(
        '#include <map_fragment>',
        `vec3 rN = normalize(vRN);
        vec4 rA; vec3 rNw; float rAO;
        rTri(${rockLayer.toFixed(1)}, uRScale, vRW, rN, rA, rNw, rAO);
        vec4 cA; vec3 cNw; float cAO;
        rTri(${capLayer.toFixed(1)}, uRScale * 0.7, vRW, rN, cA, cNw, cAO);
        float rCapK = smoothstep(0.5, 0.85, rNw.y) * uRCap;
        rCapK = clamp(rCapK * (0.6 + cAO), 0.0, 1.0);
        diffuseColor.rgb = mix(rA.rgb * uRTint, cA.rgb, rCapK);
        float rRough = mix(rA.a, cA.a, rCapK);
        vec3 rNormalW = normalize(mix(rNw, cNw, rCapK));
        float rOcc = mix(rAO, cAO, rCapK);`,
      )
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = clamp(rRough, 0.2, 1.0);')
      .replace('#include <normal_fragment_maps>', 'normal = normalize((viewMatrix * vec4(rNormalW, 0.0)).xyz);')
      .replace(
        '#include <aomap_fragment>',
        `reflectedLight.indirectDiffuse *= mix(1.0, rOcc, 0.8);
        reflectedLight.indirectSpecular *= mix(1.0, rOcc, 0.8);`,
      );
  };
  mat.customProgramCacheKey = () => `rock-${rockLayer}-${capLayer}`;
  return mat;
}

export class Rocks {
  readonly group = new THREE.Group();
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly material: THREE.MeshStandardMaterial;

  constructor(set: LayerSet, placements: RockPlacement[], opts: { variants: number; scale: number; cap: number; tint: string; capLayer: number }) {
    this.group.name = 'rocks';
    this.material = createRockMaterial(set, 2, opts.capLayer, opts.scale, opts.cap, new THREE.Color(opts.tint));
    for (let v = 0; v < opts.variants; v++) {
      const geo = rockGeometry(v + 1);
      this.geometries.push(geo);
      const list = placements.filter((p) => p.variant === v);
      if (list.length === 0) continue;
      const mesh = new THREE.InstancedMesh(geo, this.material, list.length);
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        mesh.setMatrixAt(i, mat4(p.x, p.y, p.z, p.rot, p.sx, p.sy, p.sz));
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.computeBoundingSphere();
      this.group.add(mesh);
    }
    console.info(`[rocks] ${placements.length} boulders in ${opts.variants} shapes`);
  }

  dispose(): void {
    for (const g of this.geometries) g.dispose();
    this.material.dispose();
    for (const c of this.group.children) (c as THREE.InstancedMesh).dispose();
  }
}
