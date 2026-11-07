import * as THREE from 'three';
import { createNoise2D, fbm } from './noise';
import { clamp, lerp, smoothstep, linearToSrgb } from '../util/math';
import { applyFlats, CELL, GRID, HALF, PathIndex, VERTS, WORLD } from './lands/common';
import { createTerrainMaterial, setTerrainLite, type TerrainLook } from './terrainMaterial';
import type { LayerSet } from './assets';
import type { LandGen, Landmarks, Point, ShadeOut } from './lands/types';

export { WORLD, GRID, VERTS, CELL, HALF };
export type { Landmarks, Point };
export type { Spot } from './lands/types';

const nColor = createNoise2D(107);
const nDry = createNoise2D(108);
/** Ground tiles per side: GRID / TILES = 48 cells, about 95 m. Must divide GRID. */
const TILES = 8;

export type Island = {
  gen: LandGen;
  seaFloor: number;
  heights: Float32Array;
  normals: Float32Array;
  pathMask: Float32Array;
  stoneMask: Float32Array;
  forestMask: Float32Array;
  grassMask: Float32Array;
  rockMask: Float32Array;
  landmarks: Landmarks;
  paths: Point[][];
  /** The ground: a group of tiles named 'terrain' that share one set of vertex buffers. */
  mesh: THREE.Group;
  heightTexture: THREE.DataTexture;
  grassTexture: THREE.DataTexture;
  minimap: HTMLCanvasElement;
  /** Low preset: the cheaper terrain shader (see setTerrainLite). */
  setLite(lite: boolean): void;
  heightAt(x: number, z: number): number;
  normalAt(x: number, z: number, out: THREE.Vector3): THREE.Vector3;
  sample(arr: Float32Array, x: number, z: number): number;
  dispose(): void;
};

export function buildIsland(gen: LandGen, layers: LayerSet, look: TerrainLook): Island {
  const t0 = performance.now();
  const landmarks = gen.landmarks();
  const flats = gen.flats(landmarks);
  const paths = gen.paths(landmarks);
  const pathIndex = new PathIndex();
  for (const p of paths) pathIndex.add(p);

  const n = VERTS * VERTS;
  const heights = new Float32Array(n);
  const pathMask = new Float32Array(n);
  const stoneMask = new Float32Array(n);
  const forestMask = new Float32Array(n);
  const grassMask = new Float32Array(n);
  const rockMask = new Float32Array(n);
  const normals = new Float32Array(n * 3);
  const positions = new Float32Array(n * 3);
  const splatA = new Float32Array(n * 4);
  const splatB = new Float32Array(n);

  // Heights. Paths cut a bench into slopes so they stay walkable.
  for (let j = 0; j < VERTS; j++) {
    const z = -HALF + j * CELL;
    for (let i = 0; i < VERTS; i++) {
      const x = -HALF + i * CELL;
      const k = j * VERTS + i;
      let h = gen.baseHeight(x, z);
      const pd = pathIndex.query(x, z);
      if (pd < 5.5) {
        const cx = pathIndex.hitX;
        const cz = pathIndex.hitZ;
        const centerH = Math.max(1.2, applyFlats(gen.baseHeight(cx, cz), cx, cz, flats));
        h = lerp(h, centerH, (1 - smoothstep(2.2, 5.5, pd)) * 0.85);
      }
      h = applyFlats(h, x, z, flats);
      heights[k] = h;
      pathMask[k] = pd < 3.2 ? 1 - smoothstep(1.3, 3.0, pd) : 0;
      positions[k * 3] = x;
      positions[k * 3 + 1] = h;
      positions[k * 3 + 2] = z;
    }
  }

  for (let j = 0; j < VERTS; j++) {
    for (let i = 0; i < VERTS; i++) {
      const k = j * VERTS + i;
      const h = heights[k];
      const hl = i > 0 ? heights[k - 1] : h;
      const hr = i < GRID ? heights[k + 1] : h;
      const hd = j > 0 ? heights[k - VERTS] : h;
      const hu = j < GRID ? heights[k + VERTS] : h;
      const nx = hl - hr;
      const ny = 2 * CELL;
      const nz = hd - hu;
      const len = Math.hypot(nx, ny, nz);
      normals[k * 3] = nx / len;
      normals[k * 3 + 1] = ny / len;
      normals[k * 3 + 2] = nz / len;
    }
  }

  // Ground cover: the land decides the splat weights and masks.
  const out: ShadeOut = { w: new Float32Array(5), forest: 0, grass: 0, rock: 0 };
  for (let j = 0; j < VERTS; j++) {
    const z = -HALF + j * CELL;
    for (let i = 0; i < VERTS; i++) {
      const x = -HALF + i * CELL;
      const k = j * VERTS + i;
      const stone = gen.stoneAt(x, z, landmarks);
      gen.shade(
        {
          x,
          z,
          h: heights[k],
          slope: 1 - normals[k * 3 + 1],
          path: pathMask[k],
          stone,
          n1: fbm(nColor, x * 0.03, z * 0.03, 2) * 0.5 + 0.5,
          n2: fbm(nDry, x * 0.008, z * 0.008, 2) * 0.5 + 0.5,
        },
        landmarks,
        out,
      );
      splatA[k * 4] = out.w[0];
      splatA[k * 4 + 1] = out.w[1];
      splatA[k * 4 + 2] = out.w[2];
      splatA[k * 4 + 3] = out.w[3];
      splatB[k] = out.w[4];
      stoneMask[k] = stone;
      forestMask[k] = out.forest;
      rockMask[k] = out.rock;
      grassMask[k] = clamp(out.grass, 0, 1);
    }
  }

  // One grid, drawn as TILES x TILES tiles that share its vertex buffers. Each tile has its own
  // slice of the index and its own bounds, so three.js skips the tiles off screen. As a single
  // mesh the whole island was drawn every frame, the half behind the camera included.
  const attrs = {
    position: new THREE.BufferAttribute(positions, 3),
    normal: new THREE.BufferAttribute(normals, 3),
    aSplatA: new THREE.BufferAttribute(splatA, 4),
    aSplatB: new THREE.BufferAttribute(splatB, 1),
  };
  const material = createTerrainMaterial(layers, look);
  const mesh = new THREE.Group();
  mesh.name = 'terrain';
  const tileGeos: THREE.BufferGeometry[] = [];
  const box = new THREE.Box3();
  for (let tj = 0; tj < TILES; tj++) {
    for (let ti = 0; ti < TILES; ti++) {
      const i0 = (ti * GRID) / TILES;
      const i1 = ((ti + 1) * GRID) / TILES;
      const j0 = (tj * GRID) / TILES;
      const j1 = ((tj + 1) * GRID) / TILES;
      // Triangulation must match heightAt(): cell diagonal runs b-d.
      const indices = new Uint32Array((i1 - i0) * (j1 - j0) * 6);
      let w = 0;
      let lo = Infinity;
      let hi = -Infinity;
      for (let j = j0; j < j1; j++) {
        for (let i = i0; i < i1; i++) {
          const a = j * VERTS + i;
          const b = a + VERTS;
          const c = a + VERTS + 1;
          const d = a + 1;
          indices[w++] = a;
          indices[w++] = b;
          indices[w++] = d;
          indices[w++] = b;
          indices[w++] = c;
          indices[w++] = d;
        }
      }
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const y = heights[j * VERTS + i];
          lo = Math.min(lo, y);
          hi = Math.max(hi, y);
        }
      }
      const geo = new THREE.BufferGeometry();
      for (const [name, attr] of Object.entries(attrs)) geo.setAttribute(name, attr);
      geo.setIndex(new THREE.BufferAttribute(indices, 1));
      box.min.set(-HALF + i0 * CELL, lo, -HALF + j0 * CELL);
      box.max.set(-HALF + i1 * CELL, hi, -HALF + j1 * CELL);
      geo.boundingBox = box.clone();
      geo.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
      const tile = new THREE.Mesh(geo, material);
      tile.receiveShadow = true;
      tile.castShadow = false;
      tile.name = 'terrain';
      tile.matrixAutoUpdate = false; // never moves
      mesh.add(tile);
      tileGeos.push(geo);
    }
  }

  const halfData = new Uint16Array(n);
  for (let k = 0; k < n; k++) halfData[k] = THREE.DataUtils.toHalfFloat(heights[k]);
  const heightTexture = new THREE.DataTexture(halfData, VERTS, VERTS, THREE.RedFormat, THREE.HalfFloatType);
  heightTexture.minFilter = THREE.LinearFilter;
  heightTexture.magFilter = THREE.LinearFilter;
  heightTexture.unpackAlignment = 1;
  heightTexture.needsUpdate = true;

  const grassData = new Uint8Array(n);
  for (let k = 0; k < n; k++) grassData[k] = Math.round(clamp(grassMask[k], 0, 1) * 255);
  const grassTexture = new THREE.DataTexture(grassData, VERTS, VERTS, THREE.RedFormat, THREE.UnsignedByteType);
  grassTexture.minFilter = THREE.LinearFilter;
  grassTexture.magFilter = THREE.LinearFilter;
  grassTexture.unpackAlignment = 1;
  grassTexture.needsUpdate = true;

  function heightAt(x: number, z: number): number {
    const fx = (x + HALF) / CELL;
    const fz = (z + HALF) / CELL;
    if (fx < 0 || fz < 0 || fx >= GRID || fz >= GRID) return gen.seaFloor;
    const i = Math.floor(fx);
    const j = Math.floor(fz);
    const u = fx - i;
    const v = fz - j;
    const k = j * VERTS + i;
    const ha = heights[k];
    const hb = heights[k + VERTS];
    const hc = heights[k + VERTS + 1];
    const hd = heights[k + 1];
    if (u + v <= 1) return ha + (hd - ha) * u + (hb - ha) * v;
    return hc + (hb - hc) * (1 - u) + (hd - hc) * (1 - v);
  }

  function sample(arr: Float32Array, x: number, z: number): number {
    const fx = clamp((x + HALF) / CELL, 0, GRID - 0.0001);
    const fz = clamp((z + HALF) / CELL, 0, GRID - 0.0001);
    const i = Math.floor(fx);
    const j = Math.floor(fz);
    const u = fx - i;
    const v = fz - j;
    const k = j * VERTS + i;
    return lerp(lerp(arr[k], arr[k + 1], u), lerp(arr[k + VERTS], arr[k + VERTS + 1], u), v);
  }

  function normalAt(x: number, z: number, outN: THREE.Vector3): THREE.Vector3 {
    const e = 0.75;
    return outN.set(heightAt(x - e, z) - heightAt(x + e, z), 2 * e, heightAt(x, z - e) - heightAt(x, z + e)).normalize();
  }

  const minimap = drawMinimap(heights, normals, splatA, splatB, layers.average.map((c, i) => c.clone().multiply(look.tints[i])));
  console.info(`[terrain] ${gen.id}: ${VERTS}x${VERTS} grid in ${(performance.now() - t0).toFixed(0)}ms`);

  return {
    gen,
    seaFloor: gen.seaFloor,
    heights,
    normals,
    pathMask,
    stoneMask,
    forestMask,
    grassMask,
    rockMask,
    landmarks,
    paths,
    mesh,
    heightTexture,
    grassTexture,
    minimap,
    heightAt,
    normalAt,
    sample,
    setLite(lite) {
      setTerrainLite(material, lite);
    },
    dispose() {
      for (const g of tileGeos) g.dispose();
      material.dispose();
      heightTexture.dispose();
      grassTexture.dispose();
    },
  };
}

const MAP_SIZE = 256;
const SHALLOW = [0x6c / 255, 0xd8 / 255, 0xcf / 255];
const DEEP = [0x23 / 255, 0x6a / 255, 0xa3 / 255];

function drawMinimap(
  heights: Float32Array,
  normals: Float32Array,
  splatA: Float32Array,
  splatB: Float32Array,
  avg: THREE.Color[],
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = MAP_SIZE;
  canvas.height = MAP_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('[terrain] minimap: 2d context unavailable');
  const img = ctx.createImageData(MAP_SIZE, MAP_SIZE);
  for (let py = 0; py < MAP_SIZE; py++) {
    for (let px = 0; px < MAP_SIZE; px++) {
      const i = Math.min(GRID, Math.round(((px + 0.5) / MAP_SIZE) * GRID));
      const j = Math.min(GRID, Math.round(((py + 0.5) / MAP_SIZE) * GRID));
      const k = j * VERTS + i;
      const h = heights[k];
      let r = 0;
      let g = 0;
      let b = 0;
      if (h < 0) {
        const t = smoothstep(0, 9, -h);
        r = lerp(SHALLOW[0], DEEP[0], t);
        g = lerp(SHALLOW[1], DEEP[1], t);
        b = lerp(SHALLOW[2], DEEP[2], t);
      } else {
        const ws = [splatA[k * 4], splatA[k * 4 + 1], splatA[k * 4 + 2], splatA[k * 4 + 3], splatB[k]];
        for (let l = 0; l < 5; l++) {
          r += avg[l].r * ws[l];
          g += avg[l].g * ws[l];
          b += avg[l].b * ws[l];
        }
        const shade = clamp(normals[k * 3] * -0.55 + normals[k * 3 + 1] * 0.75 + normals[k * 3 + 2] * -0.37, 0, 1);
        const f = 0.7 + 0.6 * shade;
        r = linearToSrgb(r) * f * 1.15;
        g = linearToSrgb(g) * f * 1.15;
        b = linearToSrgb(b) * f * 1.15;
      }
      const o = (py * MAP_SIZE + px) * 4;
      img.data[o] = clamp(r, 0, 1) * 255;
      img.data[o + 1] = clamp(g, 0, 1) * 255;
      img.data[o + 2] = clamp(b, 0, 1) * 255;
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}
