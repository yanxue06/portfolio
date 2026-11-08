export const TAU = Math.PI * 2;

export function clamp(v: number, lo: number, hi: number): number {
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** GLSL-style smoothstep. Reversed edges (e0 > e1) give a falling ramp. */
export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Frame-rate independent approach toward a target. */
export function damp(current: number, target: number, rate: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-rate * dt));
}

/** Into [-PI, PI]. Arithmetic, not a loop: a huge angle must never stall a frame. */
export function wrapAngle(a: number): number {
  if (a >= -Math.PI && a <= Math.PI) return a;
  return a - TAU * Math.floor((a + Math.PI) / TAU);
}

export function dampAngle(current: number, target: number, rate: number, dt: number): number {
  const diff = wrapAngle(target - current);
  return current + diff * (1 - Math.exp(-rate * dt));
}

/** Small seeded PRNG. Same seed, same sequence, on every machine. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a. Used to turn a date string into a seed. */
export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function linearToSrgb(v: number): number {
  if (v <= 0.0031308) return 12.92 * v;
  return 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

/** Yaw whose forward vector (-sin, -cos) points from a to b. */
export function yawToward(ax: number, az: number, bx: number, bz: number): number {
  return Math.atan2(-(bx - ax), -(bz - az));
}

export function easeOutCubic(t: number): number {
  const u = 1 - clamp(t, 0, 1);
  return 1 - u * u * u;
}

export function easeInOutCubic(t: number): number {
  const x = clamp(t, 0, 1);
  if (x < 0.5) return 4 * x * x * x;
  const u = -2 * x + 2;
  return 1 - (u * u * u) / 2;
}
