import * as THREE from 'three';
import { Tree } from '@dgreenheck/ez-tree';
import { mat4 } from './geo';

// Realistic forests: EZ-Tree generates branching trees with real bark and leaf
// textures. Near trees are full instanced geometry; farther ones are impostors:
// flat cards showing that same tree, photographed at load from FRAMES angles
// around it (color + normals), so they turn with the view like a real tree and
// are lit by the same sun and sky as the 3D ones.
//
// Nothing ever switches in one frame. Each tree's 3D version and its card trade
// places over a band of distance with a screen-door dither (the two use opposite
// pixels of one pattern, so any pixel shows one or the other, never both), and
// cards fade out the same way at the far edge. The fades are worked out on the
// GPU from the live camera, so the CPU lists only decide what gets drawn, never
// what you see.

export type TreeVariantDef = {
  preset: string; // EZ-Tree preset name, e.g. 'Oak Medium'
  seed: number;
  height: number; // meters
  barkTint?: string;
  leafTint?: string;
  leaves?: boolean; // false = dead tree
  leafScale?: number;
};

export type TreeInstance = { variant: number; x: number; y: number; z: number; rot: number; scale: number };

const NEAR = 78;
const FAR = 900;
/** Impostor photos per tree, evenly spaced around it. */
const FRAMES = 8;
/** Longest side of one impostor photo, in pixels. */
const FRAME_PX = 256;
/** Lists are rebuilt after the camera moves this far; the fades leave this much slack so nothing visible is ever missing. */
const RESORT = 1.5;
/** 3D <-> card crossfade band (m), capped by a share of the near distance on low settings. */
const BAND = 10;
/**
 * Small variants (bushes) are tiny on screen long before `near`, so their 3D range follows their
 * height: 14 m of range per metre of height, never under 28 m. Full-size trees stay at `near`.
 */
const RANGE_PER_METRE = 14;
const SMALL_MIN_RANGE = 28;
/** Share of the far distance over which cards fade out at the edge. */
const RING = 0.1;
/**
 * Impostor light scale (direct, indirect). A 3D canopy shades itself in the shadow map and gets
 * N8AO; a card can't, so unscaled it lit 1.45-2.2x brighter than the trees it stands in for.
 * Fitted on the isle from four view directions, to impostor/3D luminance 0.8-1.2. Without tree
 * shadows (the low preset, which also has no AO) the 3D trees are brighter, so cards are too.
 */
const SHADE = { shadows: [0.25, 0.65], noShadows: [0.7, 0.85] } as const;

type FadeUniforms = {
  /** x..y: the 3D tree fades out (and its card fades in); z..w: the card fades out at the far edge. */
  uTreeFade: { value: THREE.Vector4 };
};

type Variant = {
  bark: THREE.BufferGeometry;
  leaves: THREE.BufferGeometry | null;
  barkMat: THREE.MeshStandardMaterial;
  leafMat: THREE.MeshStandardMaterial | null;
  barkDepth: THREE.MeshDepthMaterial;
  leafDepth: THREE.MeshDepthMaterial | null;
  impostorMat: THREE.MeshStandardMaterial;
  albedo: THREE.WebGLRenderTarget;
  normals: THREE.WebGLRenderTarget;
  fade: FadeUniforms;
  nearBark: THREE.InstancedMesh;
  nearLeaves: THREE.InstancedMesh | null;
  far: THREE.InstancedMesh;
  /** Instance matrices (16 floats each) and positions, built once. */
  matrices: Float32Array;
  xs: Float32Array;
  zs: Float32Array;
  /** Variant height (m), which sets how far small ones stay 3D. */
  height: number;
  /** Current list radii (m): the 3D list, and the card list's inner and outer edges. */
  nearList: number;
  farFrom: number;
  farTo: number;
};

const windUniforms = { uTreeTime: { value: 0 } };

/** 4x4 ordered dither, fixed to the screen so a fading tree holds still instead of crawling. */
const DITHER_GLSL = /* glsl */ `
float wiDither(vec2 p) {
  ivec2 q = ivec2(p) & 3;
  int a = q.x ^ q.y;
  int v = ((a & 1) << 3) | ((q.y & 1) << 2) | (a & 2) | ((q.y >> 1) & 1); // Bayer 4x4, by bits
  return (float(v) + 0.5) / 16.0;
}`;

const SWAY_GLSL = /* glsl */ `
float tPh = tBase.x * 0.11 + tBase.z * 0.13;
float tH = max(position.y, 0.0);
float tSway = sin(uTreeTime * 1.3 + tPh + position.y * 0.2) * 0.012 * tH
            + sin(uTreeTime * 3.7 + position.x * 1.7 + position.z * 1.3) * 0.035;
transformed.x += tSway;
transformed.z += tSway * 0.6;`;

/** Keeps alpha-tested leaves from thinning out as their texture shrinks down the mip chain (and shimmering as they do). */
const LEAF_ALPHA_GLSL = /* glsl */ `
#ifdef USE_MAP
  vec2 tTs = vec2(textureSize(map, 0));
  vec2 tDx = dFdx(vMapUv * tTs);
  vec2 tDy = dFdy(vMapUv * tTs);
  float tLod = 0.5 * log2(max(max(dot(tDx, tDx), dot(tDy, tDy)), 1e-6));
  diffuseColor.a *= 1.0 + max(tLod, 0.0) * 0.25;
#endif`;

/**
 * Near-tree material patch: fades the whole tree out with the dither between uTreeFade.x and .y
 * (distance from the live camera), skips trees that are fully gone, and for leaves adds the wind
 * sway and the mip alpha fix. On a depth material it makes a fading tree's shadow fade with it,
 * kept cheap: leaf shadows get the dither only (no sway, as before), and bark shadows shrink to
 * the trunk base instead, since a discard in a depth-only shader turns off the GPU's
 * hidden-surface removal.
 */
function patchNear(mat: THREE.Material, view: { value: THREE.Vector3 }, fade: FadeUniforms, leaves: boolean): void {
  const depth = (mat as THREE.MeshDepthMaterial).isMeshDepthMaterial === true;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTreeTime = windUniforms.uTreeTime;
    shader.uniforms.uViewPos = view;
    shader.uniforms.uTreeFade = fade.uTreeFade;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTreeTime;
        uniform vec3 uViewPos;
        uniform vec4 uTreeFade;
        flat varying float vTreeFade;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec3 tBase = vec3(0.0);
        float tDist = 0.0;
        #ifdef USE_INSTANCING
          tBase = instanceMatrix[3].xyz;
          tDist = length(tBase.xz - uViewPos.xz);
        #endif
        vTreeFade = 1.0 - smoothstep(uTreeFade.x, uTreeFade.y, tDist);
        ${leaves && !depth ? SWAY_GLSL : ''}
        ${!leaves && depth ? 'transformed *= vTreeFade; // bark shadow shrinks away: no discard keeps the depth pass fast' : ''}`,
      )
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        if (vTreeFade <= 0.0) gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // gone: no pixels`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        flat varying float vTreeFade;
        ${DITHER_GLSL}`,
      )
      .replace(
        '#include <alphatest_fragment>',
        `${leaves && !depth ? LEAF_ALPHA_GLSL : ''}
        #include <alphatest_fragment>
        ${!leaves && depth ? '' : 'if (wiDither(gl_FragCoord.xy) >= vTreeFade) discard;'}`,
      );
  };
  const kind = depth ? 'depth' : 'color';
  mat.customProgramCacheKey = () => `tree-near-${kind}-${leaves ? 'leaves' : 'bark'}`;
}

/**
 * Impostor card: faces the camera around its vertical axis and shows the baked photo nearest the
 * view angle (blending the two nearest, so it turns smoothly). Lit like any MeshStandardMaterial
 * using the baked normals, so it matches the 3D trees in any light.
 */
function impostorMaterial(
  albedo: THREE.Texture,
  normals: THREE.Texture,
  framePx: THREE.Vector2,
  view: { value: THREE.Vector3 },
  fade: FadeUniforms,
  shade: { value: THREE.Vector2 },
): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0 });
  const step = ((Math.PI * 2) / FRAMES).toFixed(8);
  const frames = FRAMES.toFixed(1);
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uAlbedo = { value: albedo };
    shader.uniforms.uNormals = { value: normals };
    shader.uniforms.uFramePx = { value: framePx };
    shader.uniforms.uViewPos = view;
    shader.uniforms.uTreeFade = fade.uTreeFade;
    shader.uniforms.uShade = shade;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform vec3 uViewPos;
        uniform vec4 uTreeFade;
        varying vec2 vBUv;
        flat varying float vBFrame;
        flat varying vec3 vBRight;
        flat varying vec3 vBFront;
        flat varying float vBNear;
        flat varying float vBRing;`,
      )
      .replace(
        '#include <project_vertex>',
        `vec3 bCenter = instanceMatrix[3].xyz;
        float bScale = length(instanceMatrix[0].xyz);
        vec2 bTo = cameraPosition.xz - bCenter.xz;
        vec2 bDir = bTo / max(length(bTo), 1e-4);
        vBRight = vec3(bDir.y, 0.0, -bDir.x);
        vBFront = vec3(bDir.x, 0.0, bDir.y);
        // Which photo: the view direction in the tree's own frame (undo its Y rotation).
        float bRot = atan(-instanceMatrix[0].z, instanceMatrix[0].x);
        vBFrame = mod((atan(bDir.x, bDir.y) - bRot) / ${step}, ${frames});
        vBUv = uv;
        float bDist = length(bCenter.xz - uViewPos.xz);
        vBNear = 1.0 - smoothstep(uTreeFade.x, uTreeFade.y, bDist);
        vBRing = 1.0 - smoothstep(uTreeFade.z, uTreeFade.w, bDist);
        vec3 bWorld = bCenter + vBRight * position.x * bScale + vec3(0.0, position.y * bScale, 0.0);
        vec4 mvPosition = viewMatrix * vec4(bWorld, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        if (vBNear >= 1.0 || vBRing <= 0.0) gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // not shown: no pixels`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2D uAlbedo;
        uniform sampler2D uNormals;
        uniform vec2 uFramePx;
        uniform vec2 uShade;
        varying vec2 vBUv;
        flat varying float vBFrame;
        flat varying vec3 vBRight;
        flat varying vec3 vBFront;
        flat varying float vBNear;
        flat varying float vBRing;
        ${DITHER_GLSL}
        // A baked normal is in its photo's camera frame; turn it by d (photo angle minus view angle).
        vec3 wiPhotoNormal(vec4 enc, float d) {
          vec3 n = enc.rgb / max(enc.a, 1e-4) * 2.0 - 1.0;
          float c = cos(d);
          float s = sin(d);
          return vec3(n.x * c + n.z * s, n.y, -n.x * s + n.z * c);
        }`,
      )
      .replace(
        '#include <map_fragment>',
        `float bF0 = floor(vBFrame);
        float bW = vBFrame - bF0;
        float bF1 = mod(bF0 + 1.0, ${frames});
        vec2 bUv0 = vec2((bF0 + vBUv.x) / ${frames}, vBUv.y);
        vec2 bUv1 = vec2((bF1 + vBUv.x) / ${frames}, vBUv.y);
        vec4 bA0 = texture(uAlbedo, bUv0);
        vec4 bA1 = texture(uAlbedo, bUv1);
        float bAlpha = mix(bA0.a, bA1.a, bW);
        // The atlas is premultiplied (cleared to transparent black), so divide the coverage back out.
        diffuseColor.rgb = mix(bA0.rgb, bA1.rgb, bW) / max(bAlpha, 1e-4);
        diffuseColor.rgb = mix(vec3(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722))), diffuseColor.rgb, 0.85); // 3D canopies read less saturated
        vec3 bNa = wiPhotoNormal(texture(uNormals, bUv0), -bW * ${step});
        vec3 bNb = wiPhotoNormal(texture(uNormals, bUv1), (1.0 - bW) * ${step});
        vec3 bNl = normalize(bNa * ((1.0 - bW) * bA0.a) + bNb * (bW * bA1.a) + vec3(0.0, 0.0, 1e-4));
        vec3 bNormalW = normalize(bNl.x * vBRight + vec3(0.0, bNl.y, 0.0) + bNl.z * vBFront);
        vec2 bDx = dFdx(vBUv * uFramePx);
        vec2 bDy = dFdy(vBUv * uFramePx);
        float bLod = 0.5 * log2(max(max(dot(bDx, bDx), dot(bDy, bDy)), 1e-6));
        bAlpha *= 1.0 + max(bLod, 0.0) * 0.25;`,
      )
      .replace(
        '#include <alphatest_fragment>',
        `float bT = wiDither(gl_FragCoord.xy);
        if (bAlpha < 0.5 || bT < vBNear || bT >= vBRing) discard;`,
      )
      .replace('#include <normal_fragment_maps>', 'normal = normalize((viewMatrix * vec4(bNormalW, 0.0)).xyz);')
      .replace(
        '#include <aomap_fragment>',
        `// A card has no canopy to shade itself: stand in for the 3D tree's self-shadowing (direct)
        // and ambient occlusion (indirect).
        reflectedLight.directDiffuse *= uShade.x;
        reflectedLight.directSpecular *= uShade.x;
        reflectedLight.indirectDiffuse *= uShade.y;
        reflectedLight.indirectSpecular *= uShade.y;
        #include <aomap_fragment>`,
      );
  };
  mat.customProgramCacheKey = () => 'tree-impostor';
  return mat;
}

/** Draws the first n instances and uploads only those matrices. */
function setInstances(mesh: THREE.InstancedMesh, n: number): void {
  mesh.count = n;
  if (n === 0) return;
  mesh.instanceMatrix.clearUpdateRanges();
  mesh.instanceMatrix.addUpdateRange(0, n * 16);
  mesh.instanceMatrix.needsUpdate = true;
}

/** Leaves lit like a soft volume: normals point out from the canopy center. */
function sphereNormals(geo: THREE.BufferGeometry): void {
  geo.computeBoundingBox();
  const box = geo.boundingBox;
  if (!box) throw new Error('[trees] leaf geometry has no bounds');
  const center = box.getCenter(new THREE.Vector3());
  center.y -= (box.max.y - box.min.y) * 0.15;
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const normals = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).sub(center).normalize();
    normals[i * 3] = v.x;
    normals[i * 3 + 1] = v.y * 0.8 + 0.2;
    normals[i * 3 + 2] = v.z;
  }
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
}

/** Bake material: writes the tree's albedo (mode 0) or its view-space normal (mode 1). */
function bakeMaterial(map: THREE.Texture | null, tint: THREE.Color, cut: number, side: THREE.Side): THREE.ShaderMaterial {
  if (map) map.updateMatrix();
  return new THREE.ShaderMaterial({
    side,
    uniforms: {
      uMap: { value: map },
      uMapMatrix: { value: map ? map.matrix : new THREE.Matrix3() },
      uHasMap: { value: map ? 1 : 0 },
      uTint: { value: tint },
      uCut: { value: cut },
      uMode: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform mat3 uMapMatrix;
      varying vec2 vUv;
      varying vec3 vN;
      void main() {
        vUv = (uMapMatrix * vec3(uv, 1.0)).xy;
        vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uHasMap;
      uniform vec3 uTint;
      uniform float uCut;
      uniform float uMode;
      varying vec2 vUv;
      varying vec3 vN;
      void main() {
        vec4 t = vec4(1.0);
        // Leaves sample the top mip: the photo is small, and the blurred mips would wipe out their alpha.
        if (uHasMap > 0.5) t = uCut > 0.0 ? textureLod(uMap, vUv, 0.0) : texture(uMap, vUv);
        if (t.a < uCut) discard;
        if (uMode < 0.5) {
          gl_FragColor = vec4(t.rgb * uTint, 1.0);
        } else {
          vec3 n = normalize(vN) * (gl_FrontFacing ? 1.0 : -1.0); // two-sided leaves flip, as in game
          gl_FragColor = vec4(n * 0.5 + 0.5, 1.0);
        }
      }`,
  });
}

/** EZ-Tree decodes its bark/leaf textures asynchronously; wait until a sample tree's maps are ready. */
function textureReady(t: THREE.Texture | null): boolean {
  if (!t) return true;
  const img = t.image as HTMLImageElement | undefined;
  return !!img && (img.complete === undefined || (img.complete && img.naturalWidth > 0));
}

export async function treeTexturesReady(presets: string[]): Promise<void> {
  const t0 = performance.now();
  const maps: Array<THREE.Texture | null> = [];
  for (const preset of presets) {
    const tree = new Tree();
    tree.loadPreset(preset);
    const b = tree.branchesMesh.material as THREE.MeshPhongMaterial;
    const l = tree.leavesMesh.material as THREE.MeshPhongMaterial;
    maps.push(b.map, b.normalMap, b.aoMap, l.map);
    tree.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) mesh.geometry.dispose();
    });
  }
  while (!maps.every(textureReady)) {
    if (performance.now() - t0 > 15000) throw new Error('[trees] bark/leaf textures did not load within 15s');
    await new Promise((r) => setTimeout(r, 30));
  }
  console.info(`[trees] textures ready in ${(performance.now() - t0).toFixed(0)}ms`);
}

export class Forest {
  readonly group = new THREE.Group();
  private readonly variants: Variant[] = [];
  private readonly lastCamera = new THREE.Vector3(1e9, 0, 0);
  private readonly view = { value: new THREE.Vector3() };
  /** Impostor light scale (direct, indirect); see SHADE. */
  private readonly shade = { value: new THREE.Vector2(1, 1) };
  private near = NEAR;
  private far = FAR;
  private nearCount = 0;

  constructor(renderer: THREE.WebGLRenderer, defs: TreeVariantDef[], instances: TreeInstance[]) {
    const t0 = performance.now();
    this.group.name = 'forest';
    this.group.userData.forest = this; // test handle: scripts reach the forest through the scene
    const byVariant: TreeInstance[][] = defs.map(() => []);
    for (const inst of instances) byVariant[inst.variant].push(inst);
    for (let i = 0; i < defs.length; i++) {
      this.variants.push(this.buildVariant(renderer, defs[i], byVariant[i]));
    }
    this.setQuality(NEAR, FAR, true);
    let tris = 0;
    for (const v of this.variants) {
      const triCount = (g: THREE.BufferGeometry | null) => (g ? (g.index ? g.index.count : g.getAttribute('position').count) / 3 : 0);
      tris += triCount(v.bark) + triCount(v.leaves);
    }
    console.info(
      `[trees] ${defs.length} variants (${Math.round(tris / defs.length)} tris avg), ${instances.length} trees, ${FRAMES}-angle impostors, built in ${(performance.now() - t0).toFixed(0)}ms`,
    );
  }

  private buildVariant(renderer: THREE.WebGLRenderer, def: TreeVariantDef, instances: TreeInstance[]): Variant {
    const tree = new Tree();
    tree.loadPreset(def.preset);
    tree.options.seed = def.seed;
    // Real-time budget: thin out sections, radial segments and leaf cards, then make leaves bigger to compensate.
    const br = tree.options.branch as unknown as { sections: Record<string, number>; segments: Record<string, number> };
    for (const k of Object.keys(br.sections)) br.sections[k] = Math.max(2, Math.round(br.sections[k] * 0.6));
    for (const k of Object.keys(br.segments)) br.segments[k] = Math.max(3, Math.round(br.segments[k] * 0.7));
    tree.options.leaves.count = Math.max(1, Math.round(tree.options.leaves.count * 0.55));
    tree.options.leaves.size *= 1.3 * (def.leafScale ?? 1);
    if (def.leaves === false) tree.options.leaves.count = 0;
    tree.generate();

    const srcBarkMat = tree.branchesMesh.material as THREE.MeshPhongMaterial;
    const srcLeafMat = tree.leavesMesh.material as THREE.MeshPhongMaterial;
    const bark = tree.branchesMesh.geometry.clone();
    bark.computeBoundingBox();
    const box = bark.boundingBox;
    if (!box) throw new Error(`[trees] ${def.preset} produced no geometry`);
    const leafGeo = def.leaves === false ? null : tree.leavesMesh.geometry.clone();
    const fullBox = box.clone();
    if (leafGeo) {
      leafGeo.computeBoundingBox();
      if (leafGeo.boundingBox) fullBox.union(leafGeo.boundingBox);
    }
    const scale = def.height / Math.max(0.001, fullBox.max.y - fullBox.min.y);
    const fit = new THREE.Matrix4().makeScale(scale, scale, scale);
    bark.applyMatrix4(fit);
    if (leafGeo) {
      leafGeo.applyMatrix4(fit);
      sphereNormals(leafGeo);
    }
    fullBox.applyMatrix4(fit);

    const barkTint = new THREE.Color(def.barkTint ?? '#ffffff');
    const leafTint = new THREE.Color(def.leafTint ?? '#ffffff');
    const barkMat = new THREE.MeshStandardMaterial({
      map: srcBarkMat.map,
      normalMap: srcBarkMat.normalMap,
      aoMap: srcBarkMat.aoMap,
      roughness: 0.92,
      color: barkTint,
    });
    let leafMat: THREE.MeshStandardMaterial | null = null;
    if (leafGeo) {
      leafMat = new THREE.MeshStandardMaterial({
        map: srcLeafMat.map,
        alphaTest: 0.5,
        side: THREE.DoubleSide,
        roughness: 0.8,
        color: leafTint,
      });
    }

    // Impostor photos, taken before the source tree is thrown away.
    const bake = this.bakeImpostor(renderer, bark, srcBarkMat.map, barkTint, leafGeo, srcLeafMat.map, leafTint, fullBox);
    tree.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) mesh.geometry.dispose();
    });

    const fade: FadeUniforms = { uTreeFade: { value: new THREE.Vector4() } };
    patchNear(barkMat, this.view, fade, false);
    if (leafMat) patchNear(leafMat, this.view, fade, true);
    // Shadow casters get the same fade, so a tree's shadow fades out with it.
    const barkDepth = new THREE.MeshDepthMaterial();
    patchNear(barkDepth, this.view, fade, false);
    let leafDepth: THREE.MeshDepthMaterial | null = null;
    if (leafMat) {
      leafDepth = new THREE.MeshDepthMaterial();
      patchNear(leafDepth, this.view, fade, true);
    }
    const impostorMat = impostorMaterial(bake.albedo.texture, bake.normals.texture, bake.framePx, this.view, fade, this.shade);

    // Instance matrices are fixed; the lists below just copy them around.
    const matrices = new Float32Array(instances.length * 16);
    const xs = new Float32Array(instances.length);
    const zs = new Float32Array(instances.length);
    for (let i = 0; i < instances.length; i++) {
      const t = instances[i];
      mat4(t.x, t.y, t.z, t.rot, t.scale).toArray(matrices, i * 16);
      xs[i] = t.x;
      zs[i] = t.z;
    }

    const cap = Math.max(1, instances.length);
    const nearBark = new THREE.InstancedMesh(bark, barkMat, cap);
    nearBark.customDepthMaterial = barkDepth;
    nearBark.castShadow = true;
    nearBark.receiveShadow = true;
    nearBark.frustumCulled = false;
    nearBark.count = 0;
    let nearLeaves: THREE.InstancedMesh | null = null;
    if (leafGeo && leafMat && leafDepth) {
      nearLeaves = new THREE.InstancedMesh(leafGeo, leafMat, cap);
      nearLeaves.customDepthMaterial = leafDepth;
      nearLeaves.castShadow = true;
      nearLeaves.receiveShadow = true;
      nearLeaves.frustumCulled = false;
      nearLeaves.count = 0;
    }
    const quad = new THREE.PlaneGeometry(bake.width, bake.height);
    quad.translate(0, bake.height / 2 + bake.bottom, 0);
    const far = new THREE.InstancedMesh(quad, impostorMat, cap);
    far.frustumCulled = false;
    far.count = 0;
    this.group.add(nearBark, far);
    if (nearLeaves) this.group.add(nearLeaves);
    return {
      bark,
      leaves: leafGeo,
      barkMat,
      leafMat,
      barkDepth,
      leafDepth,
      impostorMat,
      albedo: bake.albedo,
      normals: bake.normals,
      fade,
      nearBark,
      nearLeaves,
      far,
      matrices,
      xs,
      zs,
      height: def.height,
      nearList: 0,
      farFrom: 0,
      farTo: 0,
    };
  }

  /**
   * Photographs the tree from FRAMES angles in one render: FRAMES copies stand side by side, each
   * turned so the orthographic camera sees it from the next angle. One pass writes albedo, a
   * second writes normals. (One render per target matters: three discards the multisampled
   * buffer after each resolve, so several renders into regions of one target would lose work.)
   */
  private bakeImpostor(
    renderer: THREE.WebGLRenderer,
    bark: THREE.BufferGeometry,
    barkMap: THREE.Texture | null,
    barkTint: THREE.Color,
    leaves: THREE.BufferGeometry | null,
    leafMap: THREE.Texture | null,
    leafTint: THREE.Color,
    box: THREE.Box3,
  ): { albedo: THREE.WebGLRenderTarget; normals: THREE.WebGLRenderTarget; framePx: THREE.Vector2; width: number; height: number; bottom: number } {
    // Widest reach from the trunk at any angle, so every photo fits the same card.
    let reach = 0;
    for (const g of leaves ? [bark, leaves] : [bark]) {
      const p = g.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) reach = Math.max(reach, Math.hypot(p.getX(i), p.getZ(i)));
    }
    const bottom = box.min.y;
    const height = (box.max.y - box.min.y) * 1.02;
    let width = 2 * reach * 1.04;
    let wPx: number;
    let hPx: number;
    if (height >= width) {
      hPx = FRAME_PX;
      wPx = Math.ceil((FRAME_PX * width) / height);
    } else {
      wPx = FRAME_PX;
      hPx = Math.ceil((FRAME_PX * height) / width);
    }
    width = (wPx * height) / hPx; // square pixels

    const scene = new THREE.Scene();
    const barkBake = bakeMaterial(barkMap, barkTint, 0, THREE.FrontSide);
    const leafBake = leaves ? bakeMaterial(leafMap, leafTint, 0.5, THREE.DoubleSide) : null;
    for (let i = 0; i < FRAMES; i++) {
      const slot = new THREE.Group();
      slot.position.x = (i + 0.5) * width - (FRAMES * width) / 2;
      slot.rotation.y = -(i * Math.PI * 2) / FRAMES; // photo i = the tree seen from angle i in its own frame
      slot.add(new THREE.Mesh(bark, barkBake));
      if (leaves && leafBake) slot.add(new THREE.Mesh(leaves, leafBake));
      scene.add(slot);
    }
    const cam = new THREE.OrthographicCamera((-FRAMES * width) / 2, (FRAMES * width) / 2, bottom + height, bottom, 1, 400);
    cam.position.set(0, 0, 150);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();

    // Kept atlases: plain textures with mipmaps, no depth. The photo itself is taken in a 4x MSAA
    // scratch target and copied over, so the multisampled buffers don't stay allocated per tree.
    const atlas = (colorSpace: THREE.ColorSpace) =>
      new THREE.WebGLRenderTarget(FRAMES * wPx, hPx, {
        colorSpace,
        depthBuffer: false,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter,
      });
    const albedo = atlas(THREE.SRGBColorSpace);
    const normals = atlas(THREE.NoColorSpace);
    const prevTarget = renderer.getRenderTarget();
    const prevClear = renderer.getClearColor(new THREE.Color());
    const prevAlpha = renderer.getClearAlpha();
    renderer.setClearColor(0x000000, 0);
    for (const [dst, mode, colorSpace] of [
      [albedo, 0, THREE.SRGBColorSpace],
      [normals, 1, THREE.NoColorSpace],
    ] as const) {
      barkBake.uniforms.uMode.value = mode;
      if (leafBake) leafBake.uniforms.uMode.value = mode;
      const scratch = new THREE.WebGLRenderTarget(FRAMES * wPx, hPx, {
        samples: 4,
        colorSpace,
        generateMipmaps: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      });
      renderer.setRenderTarget(scratch);
      renderer.clear();
      renderer.render(scene, cam);
      renderer.initRenderTarget(dst);
      renderer.copyTextureToTexture(scratch.texture, dst.texture); // also builds dst's mipmaps
      scratch.dispose();
    }
    renderer.setRenderTarget(prevTarget);
    renderer.setClearColor(prevClear, prevAlpha);
    barkBake.dispose();
    leafBake?.dispose();
    return { albedo, normals, framePx: new THREE.Vector2(wPx, hPx), width, height, bottom };
  }

  /** Feeds the live camera to the fades every frame; rebuilds the draw lists after the camera has moved RESORT m. */
  update(camera: THREE.Vector3, time: number): void {
    windUniforms.uTreeTime.value = time;
    this.view.value.copy(camera);
    const dx = camera.x - this.lastCamera.x;
    const dz = camera.z - this.lastCamera.z;
    if (dx * dx + dz * dz < RESORT * RESORT) return;
    this.lastCamera.copy(camera);
    this.sort(camera.x, camera.z);
  }

  /**
   * Draw lists for a camera at (cx, cz). They only bound the work: the shaders decide what shows,
   * from the live camera. Every radius carries RESORT of slack, so until the next sort each list
   * still holds every tree that can be visible.
   */
  private sort(cx: number, cz: number): void {
    let near = 0;
    for (const v of this.variants) {
      const nl2 = v.nearList * v.nearList;
      const ff2 = v.farFrom * v.farFrom;
      const ft2 = v.farTo * v.farTo;
      const src = v.matrices;
      const nearArr = v.nearBark.instanceMatrix.array as Float32Array;
      const leafArr = v.nearLeaves ? (v.nearLeaves.instanceMatrix.array as Float32Array) : null;
      const farArr = v.far.instanceMatrix.array as Float32Array;
      let n = 0;
      let f = 0;
      for (let i = 0; i < v.xs.length; i++) {
        const ddx = v.xs[i] - cx;
        const ddz = v.zs[i] - cz;
        const d2 = ddx * ddx + ddz * ddz;
        if (d2 >= ft2) continue;
        const o = i * 16;
        if (d2 < nl2) {
          const t = n * 16;
          for (let k = 0; k < 16; k++) nearArr[t + k] = src[o + k];
          if (leafArr) for (let k = 0; k < 16; k++) leafArr[t + k] = src[o + k];
          n++;
        }
        if (d2 >= ff2) {
          const t = f * 16;
          for (let k = 0; k < 16; k++) farArr[t + k] = src[o + k];
          f++;
        }
      }
      setInstances(v.nearBark, n);
      if (v.nearLeaves) setInstances(v.nearLeaves, n);
      setInstances(v.far, f);
      near += n;
    }
    this.nearCount = near;
  }

  /** Quality: how far full trees and impostors reach, and whether near trees cast shadows. */
  setQuality(near: number, far: number, shadows: boolean): void {
    this.near = Math.min(near, NEAR); // cost guard: full trees never reach past NEAR
    this.far = far;
    // The 3D list stops at the variant's near distance (same cost as a hard cut there). Within it,
    // a tree is fully 3D up to `gone - band` and fully a card from `gone` on, where
    // gone = near - RESORT, so a tree still in its fade is always in the list until the next sort.
    const ringFrom = this.far * (1 - RING);
    for (const v of this.variants) {
      const near = Math.min(this.near, Math.max(SMALL_MIN_RANGE, v.height * RANGE_PER_METRE));
      const gone = near - RESORT;
      const band = Math.min(BAND, near * 0.3);
      v.fade.uTreeFade.value.set(gone - band, gone, ringFrom, this.far);
      v.nearList = near;
      v.farFrom = Math.max(0, gone - band - RESORT);
      v.farTo = this.far + RESORT;
      v.nearBark.castShadow = shadows;
      if (v.nearLeaves) v.nearLeaves.castShadow = shadows;
    }
    const [direct, indirect] = shadows ? SHADE.shadows : SHADE.noShadows;
    this.shade.value.set(direct, indirect);
    this.lastCamera.set(1e9, 0, 0); // re-sort on the next update
  }

  get nearTrees(): number {
    return this.nearCount;
  }

  dispose(): void {
    for (const v of this.variants) {
      v.bark.dispose();
      v.leaves?.dispose();
      v.barkMat.dispose();
      v.leafMat?.dispose();
      v.barkDepth.dispose();
      v.leafDepth?.dispose();
      v.impostorMat.dispose();
      v.albedo.dispose();
      v.normals.dispose();
      v.far.geometry.dispose();
      v.nearBark.dispose();
      v.nearLeaves?.dispose();
      v.far.dispose();
    }
  }
}
