import { clamp } from '../util/math';

// Colliders are vertical prisms: a circle or a rotated box footprint, spanning
// [bottom, top] in y. That covers trees, rocks, houses, pillars and floating
// islets, and keeps every query a few lines of arithmetic.
export type Collider = {
  kind: 'circle' | 'box';
  x: number;
  z: number;
  r: number; // circle radius, or bounding radius for a box
  hw: number; // box half width (local x)
  hd: number; // box half depth (local z)
  cos: number;
  sin: number;
  bottom: number;
  top: number;
  tag: string;
  stamp: number;
};

export function circleCollider(x: number, z: number, r: number, bottom: number, top: number, tag: string): Collider {
  return { kind: 'circle', x, z, r, hw: 0, hd: 0, cos: 1, sin: 0, bottom, top, tag, stamp: 0 };
}

/** rot matches Object3D.rotation.y of the mesh the box belongs to. */
export function boxCollider(
  x: number,
  z: number,
  hw: number,
  hd: number,
  rot: number,
  bottom: number,
  top: number,
  tag: string,
): Collider {
  return {
    kind: 'box',
    x,
    z,
    r: Math.hypot(hw, hd),
    hw,
    hd,
    cos: Math.cos(rot),
    sin: Math.sin(rot),
    bottom,
    top,
    tag,
    stamp: 0,
  };
}

/** Is (x, z) inside the footprint, grown by margin? */
export function footprintContains(c: Collider, x: number, z: number, margin: number): boolean {
  const dx = x - c.x;
  const dz = z - c.z;
  if (c.kind === 'circle') return dx * dx + dz * dz <= (c.r + margin) * (c.r + margin);
  const lx = c.cos * dx - c.sin * dz;
  const lz = c.sin * dx + c.cos * dz;
  return Math.abs(lx) <= c.hw + margin && Math.abs(lz) <= c.hd + margin;
}

export type PushResult = { x: number; z: number; nx: number; nz: number; hit: boolean };

/** Pushes a circle of radius pr at (x, z) out of the collider footprint. */
export function pushOut(c: Collider, x: number, z: number, pr: number, out: PushResult): PushResult {
  out.x = x;
  out.z = z;
  out.nx = 0;
  out.nz = 0;
  out.hit = false;
  const dx = x - c.x;
  const dz = z - c.z;
  if (c.kind === 'circle') {
    const minD = c.r + pr;
    const d2 = dx * dx + dz * dz;
    if (d2 >= minD * minD) return out;
    const d = Math.sqrt(d2);
    const nx = d > 1e-5 ? dx / d : 1;
    const nz = d > 1e-5 ? dz / d : 0;
    out.x = c.x + nx * minD;
    out.z = c.z + nz * minD;
    out.nx = nx;
    out.nz = nz;
    out.hit = true;
    return out;
  }
  const lx = c.cos * dx - c.sin * dz;
  const lz = c.sin * dx + c.cos * dz;
  const qx = clamp(lx, -c.hw, c.hw);
  const qz = clamp(lz, -c.hd, c.hd);
  const ox = lx - qx;
  const oz = lz - qz;
  const d2 = ox * ox + oz * oz;
  if (d2 >= pr * pr) return out;
  let nlx: number;
  let nlz: number;
  let lnx: number;
  let lnz: number;
  if (d2 > 1e-8) {
    const d = Math.sqrt(d2);
    lnx = ox / d;
    lnz = oz / d;
    nlx = qx + lnx * pr;
    nlz = qz + lnz * pr;
  } else {
    // Center is inside the box: leave along the shallowest axis.
    const penX = c.hw - Math.abs(lx);
    const penZ = c.hd - Math.abs(lz);
    if (penX < penZ) {
      lnx = lx >= 0 ? 1 : -1;
      lnz = 0;
      nlx = lnx * (c.hw + pr);
      nlz = lz;
    } else {
      lnx = 0;
      lnz = lz >= 0 ? 1 : -1;
      nlx = lx;
      nlz = lnz * (c.hd + pr);
    }
  }
  // Back to world space (inverse of the rotation above).
  out.x = c.x + c.cos * nlx + c.sin * nlz;
  out.z = c.z - c.sin * nlx + c.cos * nlz;
  out.nx = c.cos * lnx + c.sin * lnz;
  out.nz = -c.sin * lnx + c.cos * lnz;
  out.hit = true;
  return out;
}

/** Uniform-grid spatial hash over collider footprints. */
export class ColliderGrid {
  readonly all: Collider[] = [];
  private cells = new Map<number, Collider[]>();
  private readonly size = 8;
  private stamp = 0;

  add(c: Collider): Collider {
    this.all.push(c);
    const x0 = Math.floor((c.x - c.r) / this.size);
    const x1 = Math.floor((c.x + c.r) / this.size);
    const z0 = Math.floor((c.z - c.r) / this.size);
    const z1 = Math.floor((c.z + c.r) / this.size);
    for (let iz = z0; iz <= z1; iz++) {
      for (let ix = x0; ix <= x1; ix++) {
        const key = (ix + 4096) * 8192 + (iz + 4096);
        let list = this.cells.get(key);
        if (!list) {
          list = [];
          this.cells.set(key, list);
        }
        list.push(c);
      }
    }
    return c;
  }

  /** Colliders whose bounding circle may touch the query circle. Reuses `out`. */
  query(x: number, z: number, radius: number, out: Collider[]): Collider[] {
    out.length = 0;
    this.stamp++;
    const x0 = Math.floor((x - radius) / this.size);
    const x1 = Math.floor((x + radius) / this.size);
    const z0 = Math.floor((z - radius) / this.size);
    const z1 = Math.floor((z + radius) / this.size);
    for (let iz = z0; iz <= z1; iz++) {
      for (let ix = x0; ix <= x1; ix++) {
        const list = this.cells.get((ix + 4096) * 8192 + (iz + 4096));
        if (!list) continue;
        for (const c of list) {
          if (c.stamp === this.stamp) continue;
          c.stamp = this.stamp;
          const dx = c.x - x;
          const dz = c.z - z;
          const reach = c.r + radius;
          if (dx * dx + dz * dz <= reach * reach) out.push(c);
        }
      }
    }
    return out;
  }
}
