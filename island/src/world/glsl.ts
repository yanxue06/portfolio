/** Shared GLSL helpers. Prefixed wi_ so they never collide with three's chunks. */
export const NOISE_GLSL = /* glsl */ `
float wi_hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float wi_noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = wi_hash(i);
  float b = wi_hash(i + vec2(1.0, 0.0));
  float c = wi_hash(i + vec2(0.0, 1.0));
  float d = wi_hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float wi_fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    s += a * wi_noise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return s / 0.96875;
}
`;

/** Maps world xz to the island grid texture uv (texel-center exact). */
export const GRID_UV_GLSL = /* glsl */ `
vec2 wi_gridUv(vec2 xz, float worldSize, float gridN) {
  return ((xz + 0.5 * worldSize) / worldSize * gridN + 0.5) / (gridN + 1.0);
}
`;
