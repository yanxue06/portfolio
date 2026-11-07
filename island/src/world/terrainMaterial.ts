import * as THREE from 'three';
import { NOISE_GLSL } from './glsl';
import type { LayerSet } from './assets';

export type TerrainLook = {
  scales: number[]; // meters per texture tile, per layer
  tints: THREE.Color[]; // albedo multiplier per layer
  rough: number[]; // roughness multiplier per layer
  triplanar: number; // layer index projected on all three axes (cliffs)
};

// PBR terrain: MeshStandardMaterial (so IBL, shadows and fog all work) with the
// albedo/normal/roughness/AO replaced by a 5-layer splat of real textures.
// Splat weights come from vertex attributes; transitions are sharpened with
// each layer's AO channel so grass creeps into rock cracks instead of fading.
export function createTerrainMaterial(set: LayerSet, look: TerrainLook): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 });
  const uniforms = {
    uTAlb: { value: set.albedo },
    uTNrm: { value: set.normal },
    uTScale: { value: look.scales },
    uTTint: { value: look.tints },
    uTRough: { value: look.rough },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        attribute vec4 aSplatA;
        attribute float aSplatB;
        varying vec3 vTW;
        varying vec3 vTN;
        varying vec4 vSA;
        varying float vSB;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vTW = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vTN = normalize(mat3(modelMatrix) * objectNormal);
        vSA = aSplatA;
        vSB = aSplatB;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2DArray uTAlb;
        uniform sampler2DArray uTNrm;
        uniform float uTScale[5];
        uniform vec3 uTTint[5];
        uniform float uTRough[5];
        varying vec3 vTW;
        varying vec3 vTN;
        varying vec4 vSA;
        varying float vSB;
        ${NOISE_GLSL}

        // Planar (top-down) sample with a second rotated, larger tile mixed in to break repetition.
        void tPlanar(int layer, vec3 p, vec3 n, float macro, out vec4 alb, out vec3 nrmW, out float ao) {
          float s = uTScale[layer];
          vec2 uv1 = p.xz / s;
          vec2 uv2 = mat2(0.8, -0.6, 0.6, 0.8) * p.xz / (s * 3.3) + vec2(0.37, 0.71);
          float L = float(layer);
          vec4 a1 = texture(uTAlb, vec3(uv1, L));
          vec4 a2 = texture(uTAlb, vec3(uv2, L));
          vec4 n1 = texture(uTNrm, vec3(uv1, L));
          vec4 n2 = texture(uTNrm, vec3(uv2, L));
          float k = 0.25 + 0.4 * macro;
          alb = mix(a1, a2, k);
          vec4 nn = mix(n1, n2, k);
          vec3 tn = nn.xyz * 2.0 - 1.0;
          vec3 T = normalize(vec3(1.0, 0.0, 0.0) - n * n.x);
          vec3 B = cross(n, T);
          nrmW = normalize(T * tn.x + B * tn.y + n * tn.z);
          ao = nn.w;
        }

        // Triplanar sample for cliffs: no stretching on steep faces (UDN normal blend).
        void tTriplanar(int layer, vec3 p, vec3 n, out vec4 alb, out vec3 nrmW, out float ao) {
          float s = uTScale[layer];
          float L = float(layer);
          vec3 w = pow(abs(n), vec3(4.0));
          w /= (w.x + w.y + w.z);
          vec4 ax = texture(uTAlb, vec3(p.zy / s, L));
          vec4 ay = texture(uTAlb, vec3(p.xz / s, L));
          vec4 az = texture(uTAlb, vec3(p.xy / s, L));
          vec4 nx = texture(uTNrm, vec3(p.zy / s, L));
          vec4 ny = texture(uTNrm, vec3(p.xz / s, L));
          vec4 nz = texture(uTNrm, vec3(p.xy / s, L));
          alb = ax * w.x + ay * w.y + az * w.z;
          vec3 tx = nx.xyz * 2.0 - 1.0;
          vec3 ty = ny.xyz * 2.0 - 1.0;
          vec3 tz = nz.xyz * 2.0 - 1.0;
          tx = vec3(tx.xy + n.zy, n.x);
          ty = vec3(ty.xy + n.xz, n.y);
          tz = vec3(tz.xy + n.xy, n.z);
          nrmW = normalize(tx.zyx * w.x + ty.xzy * w.y + tz.xyz * w.z);
          ao = nx.w * w.x + ny.w * w.y + nz.w * w.z;
        }`,
      )
      .replace(
        '#include <map_fragment>',
        `float tW[5];
        tW[0] = vSA.x; tW[1] = vSA.y; tW[2] = vSA.z; tW[3] = vSA.w; tW[4] = vSB;
        vec3 tN = normalize(vTN);
        float tMacro = wi_noise(vTW.xz * 0.018) * 0.65 + wi_noise(vTW.xz * 0.004) * 0.35;
        vec4 tAlbedo = vec4(0.0);
        vec3 tNormalW = vec3(0.0);
        float tAO = 0.0;
        float tSum = 0.0;
        for (int i = 0; i < 5; i++) {
          if (tW[i] < 0.003) continue;
          vec4 la; vec3 ln; float lao;
          if (i == ${look.triplanar}) tTriplanar(i, vTW, tN, la, ln, lao);
          else tPlanar(i, vTW, tN, tMacro, la, ln, lao);
          // Height-ish blend: bright AO (raised detail) wins the transition.
          float hw = tW[i] * pow(0.35 + lao, 4.0);
          tAlbedo += vec4(la.rgb * uTTint[i], la.a * uTRough[i]) * hw;
          tNormalW += ln * hw;
          tAO += lao * hw;
          tSum += hw;
        }
        tAlbedo /= max(tSum, 1e-4);
        tAO /= max(tSum, 1e-4);
        tNormalW = normalize(tNormalW + tN * 0.15);
        float tVar = 0.86 + 0.28 * wi_noise(vTW.xz * 0.006 + 13.0);
        diffuseColor.rgb = tAlbedo.rgb * tVar;
        float tRough = clamp(tAlbedo.a, 0.08, 1.0);`,
      )
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = tRough;')
      .replace(
        '#include <normal_fragment_maps>',
        'normal = normalize((viewMatrix * vec4(tNormalW, 0.0)).xyz);',
      )
      .replace(
        '#include <aomap_fragment>',
        `float tOcc = mix(1.0, tAO, 0.75);
        reflectedLight.indirectDiffuse *= tOcc;
        reflectedLight.indirectSpecular *= tOcc;`,
      );
  };
  mat.customProgramCacheKey = () => `terrain-tri${look.triplanar}`;
  return mat;
}
