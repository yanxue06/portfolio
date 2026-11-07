import { fbm, type Noise2D } from '../noise';
import { clamp, lerp, smoothstep } from '../../util/math';
import type { Flat, Point, ShadeOut } from './types';

export const WORLD = 760;
export const GRID = 384;
export const VERTS = GRID + 1;
export const CELL = WORLD / GRID;
export const HALF = WORLD / 2;

export function gauss(x: number, z: number, cx: number, cz: number, sigma: number): number {
  const dx = x - cx;
  const dz = z - cz;
  return Math.exp(-(dx * dx + dz * dz) / (2 * sigma * sigma));
}

export function angleDiff(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** > 0 on land, < 0 at sea; roughly "distance to coast / radius". Warped for an organic outline. */
export function continent(x: number, z: number, radius: number, warp: number, nA: Noise2D, nB: Noise2D, nC: Noise2D): number {
  const wx = x + fbm(nA, x * 0.0032, z * 0.0032, 3) * warp;
  const wz = z + fbm(nB, x * 0.0032 + 31.7, z * 0.0032 - 17.3, 3) * warp;
  const r = Math.hypot(wx, wz) / radius;
  return 1 - r + fbm(nC, x * 0.013, z * 0.013, 2) * 0.022;
}

/** Shelf -> beach -> lowland. */
export function coastProfile(c: number, seaFloor: number, beachTop = 1.9, lowland = 6): number {
  if (c <= 0) return -0.6 + (seaFloor + 0.6) * smoothstep(0, -0.15, c);
  if (c <= 0.045) return -0.6 + (c / 0.045) * (beachTop + 0.6);
  return beachTop + (lowland - beachTop) * smoothstep(0.045, 0.24, c);
}

export function applyFlats(h: number, x: number, z: number, flats: Flat[]): number {
  for (const f of flats) {
    const d = Math.hypot(x - f.x, z - f.z);
    if (d > f.r + f.blend) continue;
    h = lerp(h, f.h, smoothstep(f.r + f.blend, f.r, d));
  }
  return h;
}

export function findCoastRadius(height: (x: number, z: number) => number, angle: number): number {
  const dx = Math.cos(angle);
  const dz = Math.sin(angle);
  let lastLand = 0;
  for (let r = 40; r < 470; r += 1) {
    if (height(dx * r, dz * r) > 0.3) lastLand = r;
    else if (lastLand > 0 && r - lastLand > 30) break;
  }
  if (lastLand === 0) throw new Error(`[land] no coast found along angle ${angle.toFixed(2)}`);
  return lastLand;
}

export function highestNear(height: (x: number, z: number) => number, cx: number, cz: number, r: number): { x: number; y: number; z: number } {
  let best = { x: cx, y: -Infinity, z: cz };
  for (let dz = -r; dz <= r; dz += 2) {
    for (let dx = -r; dx <= r; dx += 2) {
      const h = height(cx + dx, cz + dz);
      if (h > best.y) best = { x: cx + dx, y: h, z: cz + dz };
    }
  }
  return best;
}

/** Adds a gentle meander to a polyline. Control points stay exactly put. */
export function wiggle(points: Point[], noise: Noise2D, seed: number, amp: number): Point[] {
  const out: Point[] = [];
  for (let s = 0; s < points.length - 1; s++) {
    const a = points[s];
    const b = points[s + 1];
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    const steps = Math.max(1, Math.ceil(len / 9));
    const nx = -(b.z - a.z) / len;
    const nz = (b.x - a.x) / len;
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const off = noise(seed + s * 7.1 + t * len * 0.025, seed * 0.37) * amp * Math.sin(t * Math.PI);
      out.push({ x: a.x + (b.x - a.x) * t + nx * off, z: a.z + (b.z - a.z) * t + nz * off });
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

export function spiralUp(foot: Point, top: Point, turns: number, steps: number): Point[] {
  const a0 = Math.atan2(foot.z - top.z, foot.x - top.x);
  const r0 = Math.hypot(foot.x - top.x, foot.z - top.z);
  const pts: Point[] = [];
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const a = a0 + turns * t;
    const r = lerp(r0, 4, Math.pow(t, 0.85));
    pts.push({ x: top.x + Math.cos(a) * r, z: top.z + Math.sin(a) * r });
  }
  return pts;
}

export function towards(from: Point, to: Point, dist: number): Point {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const len = Math.hypot(dx, dz);
  return { x: from.x + (dx / len) * dist, z: from.z + (dz / len) * dist };
}

/** Writes splat weights by layering: each call blends `amount` of layer k over what's there. */
export function layerOver(out: ShadeOut, k: number, amount: number): void {
  const a = clamp(amount, 0, 1);
  if (a <= 0) return;
  for (let i = 0; i < 5; i++) out.w[i] *= 1 - a;
  out.w[k] += a;
}

export function resetShade(out: ShadeOut): void {
  out.w.fill(0);
  out.w[0] = 1;
  out.forest = 0;
  out.grass = 0;
  out.rock = 0;
}

/** Bucketed segment lookup so every grid vertex only checks nearby path pieces. */
export class PathIndex {
  private segs: number[] = [];
  private buckets = new Map<number, number[]>();
  private readonly size = 16;
  hitX = 0;
  hitZ = 0;

  add(path: Point[]): void {
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const id = this.segs.length / 4;
      this.segs.push(a.x, a.z, b.x, b.z);
      const pad = 8;
      const x0 = Math.floor((Math.min(a.x, b.x) - pad + HALF) / this.size);
      const x1 = Math.floor((Math.max(a.x, b.x) + pad + HALF) / this.size);
      const z0 = Math.floor((Math.min(a.z, b.z) - pad + HALF) / this.size);
      const z1 = Math.floor((Math.max(a.z, b.z) + pad + HALF) / this.size);
      for (let bz = z0; bz <= z1; bz++) {
        for (let bx = x0; bx <= x1; bx++) {
          const key = bx * 1000 + bz;
          let list = this.buckets.get(key);
          if (!list) {
            list = [];
            this.buckets.set(key, list);
          }
          list.push(id);
        }
      }
    }
  }

  /** Distance to the nearest path (Infinity if none nearby). Sets hitX/hitZ. */
  query(x: number, z: number): number {
    const key = Math.floor((x + HALF) / this.size) * 1000 + Math.floor((z + HALF) / this.size);
    const list = this.buckets.get(key);
    if (!list) return Infinity;
    let best = Infinity;
    for (const id of list) {
      const ax = this.segs[id * 4];
      const az = this.segs[id * 4 + 1];
      const dx = this.segs[id * 4 + 2] - ax;
      const dz = this.segs[id * 4 + 3] - az;
      const len2 = dx * dx + dz * dz;
      let t = len2 > 0 ? ((x - ax) * dx + (z - az) * dz) / len2 : 0;
      t = clamp(t, 0, 1);
      const cx = ax + dx * t;
      const cz = az + dz * t;
      const d = Math.hypot(x - cx, z - cz);
      if (d < best) {
        best = d;
        this.hitX = cx;
        this.hitZ = cz;
      }
    }
    return best;
  }
}
