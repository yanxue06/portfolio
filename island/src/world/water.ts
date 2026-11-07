import * as THREE from 'three';
import { NOISE_GLSL, GRID_UV_GLSL } from './glsl';
import { GRID, WORLD, type Island } from './terrain';
import type { Sky } from './assets';

const vertexShader = /* glsl */ `
varying vec3 vWorld;
#include <fog_pars_vertex>
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uShallow;
uniform vec3 uDeep;
uniform vec3 uFoam;
uniform float uFoamAmount;
uniform sampler2D uHeight;
uniform sampler2D uNormals;
uniform sampler2D uEnv;
uniform mat3 uEnvRot;
uniform float uEnvIntensity;
uniform float uWorld;
uniform float uGridN;
uniform float uSeaFloor;
varying vec3 vWorld;
#include <fog_pars_fragment>
${NOISE_GLSL}
${GRID_UV_GLSL}

float terrainHeight(vec2 xz) {
  vec2 uv = wi_gridUv(xz, uWorld, uGridN);
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return uSeaFloor;
  return texture2D(uHeight, uv).r;
}

vec3 envSample(vec3 d) {
  d = uEnvRot * d;
  vec2 uv = vec2(atan(d.z, d.x) * 0.15915494309 + 0.5, asin(clamp(d.y, -1.0, 1.0)) * 0.31830988618 + 0.5);
  return min(texture2D(uEnv, uv).rgb, vec3(24.0)) * uEnvIntensity;
}

vec3 waterNormal(vec2 p, float strength) {
  vec3 n1 = texture2D(uNormals, p * 0.031 + vec2(uTime * 0.011, uTime * 0.006)).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(uNormals, p * 0.083 + vec2(-uTime * 0.017, uTime * 0.012)).xyz * 2.0 - 1.0;
  vec3 n3 = texture2D(uNormals, p * 0.0093 + vec2(uTime * 0.004, -uTime * 0.0035)).xyz * 2.0 - 1.0;
  vec3 n = n1 + n2 * 0.55 + n3 * 0.9;
  return normalize(vec3(n.x * strength, n.z, n.y * strength));
}

void main() {
  vec2 p = vWorld.xz;
  float depth = max(0.0, -terrainHeight(p));
  float camDist = length(cameraPosition - vWorld);
  float strength = mix(0.75, 0.18, smoothstep(60.0, 900.0, camDist));
  vec3 N = waterNormal(p, strength);
  vec3 V = normalize(cameraPosition - vWorld);
  float NdV = clamp(dot(N, V), 0.0, 1.0);
  float fresnel = 0.02 + 0.98 * pow(1.0 - NdV, 5.0);

  vec3 R = reflect(-V, N);
  R.y = abs(R.y) * 0.9 + 0.02;
  vec3 reflection = envSample(normalize(R));

  float shallowK = smoothstep(0.0, 9.0, depth);
  vec3 body = mix(uShallow, uDeep, shallowK);
  // light scattered up through shallow water, stronger facing the sun
  body *= 0.75 + 0.5 * max(dot(uSunDir, vec3(0.0, 1.0, 0.0)), 0.0);
  vec3 col = mix(body, reflection, fresnel);

  vec3 H = normalize(uSunDir + V);
  float NdH = max(dot(N, H), 0.0);
  col += uSunColor * (pow(NdH, 900.0) * 14.0 + pow(NdH, 90.0) * 0.35);

  float lip = smoothstep(0.32, 0.0, depth);
  float band = smoothstep(1.4, 0.1, depth);
  float roll = sin(depth * 6.0 - uTime * 1.6 + wi_noise(p * 0.35) * 5.0) * 0.5 + 0.5;
  float foam = clamp(lip + band * smoothstep(0.62, 0.95, roll) * 0.7, 0.0, 1.0);
  foam *= (0.6 + 0.4 * wi_noise(p * 2.1 + uTime * 0.3)) * uFoamAmount;
  col = mix(col, uFoam, foam * 0.8);

  float alpha = mix(0.38, 0.97, smoothstep(0.0, 4.0, depth));
  alpha = max(alpha, foam * 0.9);
  alpha = max(alpha, fresnel);
  gl_FragColor = vec4(col, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`;

export type Water = {
  mesh: THREE.Mesh;
  update(time: number): void;
  dispose(): void;
};

export function createWater(
  island: Island,
  sky: Sky,
  colors: { shallow: string; deep: string; foam: string; foamAmount: number },
  normals: THREE.Texture,
  envIntensity: number,
): Water {
  const envRot = new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationY(-sky.rotation));
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3() },
      uSunColor: { value: new THREE.Color() },
      uShallow: { value: new THREE.Color(colors.shallow) },
      uDeep: { value: new THREE.Color(colors.deep) },
      uFoam: { value: new THREE.Color(colors.foam) },
      uFoamAmount: { value: colors.foamAmount },
      uHeight: { value: null },
      uNormals: { value: null },
      uEnv: { value: null },
      uEnvRot: { value: envRot },
      uEnvIntensity: { value: envIntensity },
      uWorld: { value: WORLD },
      uGridN: { value: GRID },
      uSeaFloor: { value: island.seaFloor },
    },
  ]);
  // merge() clones values; point at the shared objects.
  uniforms.uHeight.value = island.heightTexture;
  uniforms.uNormals.value = normals;
  uniforms.uEnv.value = sky.background;
  uniforms.uSunDir.value = sky.sunDir;
  uniforms.uSunColor.value = sky.sunColor;
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, fog: true });
  const geo = new THREE.PlaneGeometry(5000, 5000, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 1;
  mesh.name = 'water';
  return {
    mesh,
    update(time) {
      uniforms.uTime.value = time;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };
}
