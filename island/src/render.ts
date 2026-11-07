import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { N8AOPass } from 'n8ao';
import type { QualitySettings } from './quality';

/**
 * The color grade (saturation, a warm tint, a vignette) folded into three's OutputPass, ahead of
 * its tone mapping and sRGB step. It used to be a pass of its own: one more full-screen read and
 * write of a half-float buffer every frame, which is real time on a laptop GPU. OutputPass keeps
 * tracking the renderer's exposure (each land sets its own) and tone mapping as before.
 */
function gradedOutputPass(): OutputPass {
  const pass = new OutputPass();
  Object.assign(pass.uniforms, {
    uSaturation: { value: 1.08 },
    uVignette: { value: 0.7 },
    uWarmth: { value: new THREE.Vector3(1.02, 1.0, 0.98) },
  });
  const read = 'gl_FragColor = texture2D( tDiffuse, vUv );';
  const src = pass.material.fragmentShader;
  if (!src.includes(read) || !src.includes('uniform sampler2D tDiffuse;')) {
    throw new Error('three changed OutputShader: re-fit the grade in render.ts');
  }
  pass.material.fragmentShader = src
    .replace('uniform sampler2D tDiffuse;', 'uniform sampler2D tDiffuse;\nuniform float uSaturation;\nuniform float uVignette;\nuniform vec3 uWarmth;')
    .replace(
      read,
      `${read}
      float gradeL = dot( gl_FragColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
      gl_FragColor.rgb = mix( vec3( gradeL ), gl_FragColor.rgb, uSaturation ) * uWarmth;
      vec2 gradeD = vUv - 0.5;
      gl_FragColor.rgb *= clamp( 1.0 - dot( gradeD, gradeD ) * uVignette, 0.0, 1.0 );`,
    );
  return pass;
}

export type Renderer = {
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  bloom: UnrealBloomPass;
  ao: N8AOPass;
  resize(): void;
  render(): void;
  /** Applies a preset's renderer parts: pixel ratio cap, AO, bloom, anti-aliasing. */
  setQuality(q: QualitySettings): void;
  /** Dynamic resolution: 1 = full, 0.65 = 65% of the capped pixel ratio. */
  setScale(scale: number): void;
  readonly scale: number;
};

export function createRenderer(
  container: HTMLElement,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  initial: QualitySettings,
): Renderer {
  let pixelCap = initial.pixelRatio;
  let scale = 1;
  const ratio = () => Math.min(window.devicePixelRatio, pixelCap) * scale;
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(ratio());
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.info.autoReset = false;
  container.appendChild(renderer.domElement);

  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const target = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType });
  const composer = new EffectComposer(renderer, target);
  // N8AO renders the scene itself and adds ambient occlusion. With AO off, a plain RenderPass does it.
  const plain = new RenderPass(scene, camera);
  composer.addPass(plain);
  const ao = new N8AOPass(scene, camera, size.x, size.y);
  ao.configuration.aoRadius = 2.2;
  ao.configuration.distanceFalloff = 1.0;
  ao.configuration.intensity = 2.6;
  ao.configuration.gammaCorrection = false;
  // AO was a third of the whole frame at full resolution. At half resolution it costs half as
  // much and looks the same, even zoomed in on contact shadows. This needs patches/n8ao@2.0.1.patch:
  // stock n8ao hands three r187 a render target it can't bind and the renderer stalls.
  ao.configuration.halfRes = true;
  ao.setQualityMode('Medium');
  composer.addPass(ao);
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.36, 0.5, 2.4);
  composer.addPass(bloom);
  composer.addPass(gradedOutputPass());
  const smaa = new SMAAPass();
  composer.addPass(smaa);

  function resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(ratio());
    renderer.setSize(w, h);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(w, h);
  }
  window.addEventListener('resize', resize);

  function setQuality(q: QualitySettings): void {
    pixelCap = q.pixelRatio;
    plain.enabled = q.ao === 'off';
    ao.enabled = q.ao !== 'off';
    // fewer samples for 'low', on top of half resolution
    if (q.ao === 'medium') ao.setQualityMode('Medium');
    else if (q.ao === 'low') ao.setQualityMode('Performance');
    bloom.enabled = q.bloom;
    smaa.enabled = q.smaa;
    resize();
  }
  setQuality(initial);

  const gl = renderer.getContext();
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
  console.info(`[render] ${size.x}x${size.y} @${renderer.getPixelRatio()}x, gpu: ${gpu}`);

  return {
    renderer,
    composer,
    bloom,
    ao,
    resize,
    render() {
      renderer.info.reset();
      composer.render();
    },
    setQuality,
    setScale(s: number) {
      scale = s;
      resize();
    },
    get scale() {
      return scale;
    },
  };
}
