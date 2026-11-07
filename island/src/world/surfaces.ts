import * as THREE from 'three';
import type { Assets } from './assets';

// Vertex-colored architecture with real surface detail: a scanned texture is
// projected triplanar in world space and used as a *relative* detail (divided
// by its own average color), so the building keeps its painted color but gains
// plaster grain, mortar lines or wood grain, plus the matching normal map.

export type Surfaces = {
  masonry: THREE.MeshStandardMaterial; // plaster walls, stone, paving
  brick: THREE.MeshStandardMaterial; // sandstone / stone blocks
  wood: THREE.MeshStandardMaterial; // planks, posts, boats
  roof: THREE.MeshStandardMaterial; // clay tiles
  dispose(): void;
};

function detailMaterial(diff: THREE.Texture, nrm: THREE.Texture, scale: number, strength: number, roughness: number, bump: number): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness, metalness: 0 });
  const uniforms = {
    uSDiff: { value: diff },
    uSNrm: { value: nrm },
    uSScale: { value: scale },
    uSStrength: { value: strength },
    uSBump: { value: bump },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSW;\nvarying vec3 vSN;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        mat4 sM = modelMatrix;
        #ifdef USE_INSTANCING
          sM = modelMatrix * instanceMatrix;
        #endif
        vSW = (sM * vec4(transformed, 1.0)).xyz;
        vSN = normalize(mat3(sM) * objectNormal);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2D uSDiff;
        uniform sampler2D uSNrm;
        uniform float uSScale;
        uniform float uSStrength;
        uniform float uSBump;
        varying vec3 vSW;
        varying vec3 vSN;`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        vec3 sN = normalize(vSN);
        vec3 sWt = pow(abs(sN), vec3(4.0));
        sWt /= (sWt.x + sWt.y + sWt.z);
        vec3 sP = vSW / uSScale;
        vec3 sDx = texture2D(uSDiff, sP.zy).rgb;
        vec3 sDy = texture2D(uSDiff, sP.xz).rgb;
        vec3 sDz = texture2D(uSDiff, sP.xy).rgb;
        vec3 sAvg = textureLod(uSDiff, vec2(0.5), 12.0).rgb + 0.02;
        vec3 sDetail = (sDx * sWt.x + sDy * sWt.y + sDz * sWt.z) / sAvg;
        diffuseColor.rgb *= mix(vec3(1.0), sDetail, uSStrength);
        vec3 sTx = texture2D(uSNrm, sP.zy).xyz * 2.0 - 1.0;
        vec3 sTy = texture2D(uSNrm, sP.xz).xyz * 2.0 - 1.0;
        vec3 sTz = texture2D(uSNrm, sP.xy).xyz * 2.0 - 1.0;
        sTx = vec3(sTx.xy * uSBump + sN.zy, sN.x);
        sTy = vec3(sTy.xy * uSBump + sN.xz, sN.y);
        sTz = vec3(sTz.xy * uSBump + sN.xy, sN.z);
        vec3 sNormalW = normalize(sTx.zyx * sWt.x + sTy.xzy * sWt.y + sTz.xyz * sWt.z);`,
      )
      .replace('#include <normal_fragment_maps>', 'normal = normalize((viewMatrix * vec4(sNormalW, 0.0)).xyz);');
  };
  mat.customProgramCacheKey = () => `surface-${diff.uuid}`;
  return mat;
}

export async function loadSurfaces(assets: Assets): Promise<Surfaces> {
  const tex = (id: string, map: string, srgb: boolean) => assets.texture(`/assets/textures/${id}_${map}_1k.jpg`, srgb);
  const [pd, pn, bd, bn, wd, wn, rd, rn] = await Promise.all([
    tex('plastered_wall_04', 'diff', true),
    tex('plastered_wall_04', 'nor_gl', false),
    tex('white_sandstone_bricks', 'diff', true),
    tex('white_sandstone_bricks', 'nor_gl', false),
    tex('wood_planks', 'diff', true),
    tex('wood_planks', 'nor_gl', false),
    tex('clay_roof_tiles', 'diff', true),
    tex('clay_roof_tiles', 'nor_gl', false),
  ]);
  const masonry = detailMaterial(pd, pn, 2.4, 0.85, 0.92, 0.9);
  const brick = detailMaterial(bd, bn, 2.2, 0.9, 0.9, 1.0);
  const wood = detailMaterial(wd, wn, 1.6, 0.95, 0.8, 1.0);
  const roof = detailMaterial(rd, rn, 1.8, 0.95, 0.75, 1.0);
  return {
    masonry,
    brick,
    wood,
    roof,
    dispose() {
      masonry.dispose();
      brick.dispose();
      wood.dispose();
      roof.dispose();
    },
  };
}
