import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type ColorFn = (x: number, y: number, z: number, out: THREE.Color) => void;

const tmpEuler = new THREE.Euler();
const tmpQuat = new THREE.Quaternion();
const tmpPos = new THREE.Vector3();
const tmpScale = new THREE.Vector3();

/** Matrix from position, Y rotation, scale and optional X/Z tilt. */
export function mat4(
  x: number,
  y: number,
  z: number,
  ry = 0,
  sx = 1,
  sy = sx,
  sz = sx,
  rx = 0,
  rz = 0,
): THREE.Matrix4 {
  tmpEuler.set(rx, ry, rz, 'YXZ');
  tmpQuat.setFromEuler(tmpEuler);
  return new THREE.Matrix4().compose(tmpPos.set(x, y, z), tmpQuat, tmpScale.set(sx, sy, sz));
}

/**
 * Lumpy-ifies a geometry. Offsets are a function of position, so vertices that
 * share a position (non-indexed faces) move together and no cracks open.
 */
export function displace(geo: THREE.BufferGeometry, amount: number, seed: number): THREE.BufferGeometry {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 4.13) * 43758.5453;
    const n = (h - Math.floor(h)) * 2 - 1;
    const len = Math.hypot(x, y, z) || 1;
    const k = 1 + (n * amount) / len;
    pos.setXYZ(i, x * k, y * k, z * k);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Collects vertex-colored pieces and merges them into one geometry (one draw call). */
export class GeoBuilder {
  private parts: THREE.BufferGeometry[] = [];
  private readonly rng: () => number;
  private readonly color = new THREE.Color();

  constructor(rng: () => number) {
    this.rng = rng;
  }

  get size(): number {
    return this.parts.length;
  }

  /**
   * color: a flat color, or a function of the transformed vertex position.
   * jitter: per-face brightness variation (0.08 = +/-8%) for a hand-made look.
   */
  add(geo: THREE.BufferGeometry, color: THREE.ColorRepresentation | ColorFn, matrix?: THREE.Matrix4, jitter = 0): this {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    for (const name of Object.keys(g.attributes)) {
      if (name !== 'position' && name !== 'normal') g.deleteAttribute(name);
    }
    if (matrix) g.applyMatrix4(matrix);
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const fn = typeof color === 'function' ? (color as ColorFn) : null;
    if (!fn) this.color.set(color as THREE.ColorRepresentation);
    for (let i = 0; i < pos.count; i += 3) {
      const j = jitter > 0 ? 1 + (this.rng() * 2 - 1) * jitter : 1;
      for (let v = i; v < i + 3 && v < pos.count; v++) {
        if (fn) fn(pos.getX(v), pos.getY(v), pos.getZ(v), this.color);
        colors[v * 3] = this.color.r * j;
        colors[v * 3 + 1] = this.color.g * j;
        colors[v * 3 + 2] = this.color.b * j;
      }
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.parts.push(g);
    return this;
  }

  build(): THREE.BufferGeometry {
    if (this.parts.length === 0) throw new Error('[geo] build() with no parts');
    const merged = mergeGeometries(this.parts, false);
    if (!merged) throw new Error('[geo] mergeGeometries failed (attribute mismatch)');
    for (const p of this.parts) p.dispose();
    this.parts = [];
    merged.computeBoundingSphere();
    merged.computeBoundingBox();
    return merged;
  }
}

/** Vertical gradient between two colors over [y0, y1] (after transform). */
export function gradientY(bottom: THREE.ColorRepresentation, top: THREE.ColorRepresentation, y0: number, y1: number): ColorFn {
  const a = new THREE.Color(bottom);
  const b = new THREE.Color(top);
  return (_x, y, _z, out) => {
    const t = Math.min(1, Math.max(0, (y - y0) / (y1 - y0)));
    out.copy(a).lerp(b, t);
  };
}

export const vertexColorMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });
export const vertexColorFlatMaterial = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
