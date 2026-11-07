import * as THREE from 'three';
import type { AmbientKind } from './lands/defs';
import type { World } from './world';
import { GRID, WORLD } from './terrain';
import { GRID_UV_GLSL } from './glsl';
import { hashString, mulberry32 } from '../util/math';

// Weather you can feel: snowfall in Frostveil, blowing dust in Sunscar, pollen on Wildcard
// Isle, fireflies over Mistmoor. One Points draw per land; every particle's motion is worked
// out on the GPU from time and a few random numbers, so the CPU only integrates the wind.
//
// Particles live in world space. A box of world space is tiled around the camera (the same
// trick the grass ring uses): walking never moves a particle, so near ones slide past faster
// than far ones, and a particle that leaves one side of the box comes back on the other. Each
// one is faded to zero before it reaches the box edge (a ring fade, plus top and bottom fades
// for snow), so the wrap never shows. They also fade out in the last few metres before the
// lens, and the on-screen size is capped as a share of the frame height.

const VERT = /* glsl */ `
#define TAU 6.28318530718
attribute vec4 aRand;
attribute vec4 aRand2;
uniform float uTime;
uniform vec3 uCenter;
uniform vec2 uWind;
uniform float uBox;
uniform float uSpan;
uniform float uBelow;
uniform float uSize;
uniform float uCapPx;
uniform float uViewH;
uniform sampler2D uHeight;
uniform sampler2D uGrass;
uniform float uWorld;
uniform float uGridN;
varying float vAlpha;
${GRID_UV_GLSL}

float groundAt(vec2 xz) {
  return texture2D(uHeight, wi_gridUv(xz, uWorld, uGridN)).r;
}

// Tiles a world-space point into the box centred on the camera.
vec2 wrapXZ(vec2 p) {
  vec2 lo = uCenter.xz - 0.5 * uBox;
  return lo + mod(p - lo, uBox);
}

void main() {
  float t = uTime;
  vec3 world;
  float alpha;
  float size = uSize;
  float ph = aRand2.x * TAU;
#if KIND == 0
  // Snow: falls 0.6-1.3 m/s, sways on its own, drifts with the shared wind.
  float fall = mix(0.6, 1.3, 0.65 * aRand.y + 0.35 * aRand.x);
  float rate = mix(0.6, 1.5, aRand.z);
  float amp = mix(0.06, 0.3, aRand.w);
  vec2 sway = amp * vec2(sin(t * rate + ph), sin(t * rate * 0.73 + ph * 1.9 + 1.1));
  world.xz = wrapXZ(position.xz * uBox + uWind + sway);
  float bottom = uCenter.y - uBelow;
  world.y = bottom + mod(position.y * uSpan - fall * t - bottom, uSpan);
  alpha = mix(0.55, 1.0, aRand2.y);
  alpha *= smoothstep(0.0, 2.5, world.y - bottom) * smoothstep(0.0, 3.5, bottom + uSpan - world.y);
  size *= 0.55 + 0.9 * aRand.x * aRand.x;
#elif KIND == 1
  // Dust: low over the sand, carried by gusty wind, swirling, kicked up and settling again.
  vec2 rates = mix(vec2(0.35), vec2(0.9), aRand.zw);
  vec2 eddy = mix(0.25, 0.8, aRand2.y) * vec2(sin(t * rates.x + ph), sin(t * rates.y + ph * 1.7 + 2.0));
  vec2 own = (aRand2.zw - 0.5) * 0.8;
  world.xz = wrapXZ(position.xz * uBox + uWind + own * t + eddy);
  float g = 0.4 * groundAt(world.xz)
    + 0.15 * (groundAt(world.xz + vec2(3.0, 0.0)) + groundAt(world.xz - vec2(3.0, 0.0))
    + groundAt(world.xz + vec2(0.0, 3.0)) + groundAt(world.xz - vec2(0.0, 3.0)));
  float lift = mix(0.12, 2.2, position.y * position.y * position.y) + 0.18 * sin(t * mix(0.8, 1.6, aRand.x) + ph);
  world.y = max(g, 0.0) + max(lift, 0.08);
  float life = sin(3.14159265 * fract(t / mix(3.5, 7.5, aRand.y) + aRand2.x));
  alpha = life * life * mix(0.5, 1.0, aRand.x);
  size *= mix(0.6, 1.4, aRand.x);
#elif KIND == 2
  // Pollen: a few motes wandering on a light breeze, catching the light now and then.
  vec2 rates = mix(vec2(0.25), vec2(0.8), aRand.zw);
  vec2 wander = mix(0.5, 1.5, aRand2.y) * vec2(sin(t * rates.x + ph), cos(t * rates.y + ph * 1.3));
  world.xz = wrapXZ(position.xz * uBox + uWind + wander);
  world.y = max(groundAt(world.xz), 0.0) + mix(0.4, 4.5, position.y) + 0.3 * sin(t * mix(0.3, 0.7, aRand.y) + ph * 2.1);
  alpha = mix(0.45, 1.0, aRand2.z) * (0.75 + 0.25 * sin(t * mix(1.0, 2.2, aRand2.w) + ph * 3.0));
  size *= mix(0.7, 1.3, aRand.x);
#else
  // Fireflies: hover 0.3-3 m over grass, reeds or water and wander slowly around a home spot.
  vec2 rates = mix(vec2(0.2), vec2(0.55), aRand.zw);
  float reach = mix(0.5, 1.3, aRand2.y);
  vec2 wander = reach * vec2(sin(t * rates.x + ph) + 0.4 * sin(t * rates.y * 2.1 + ph * 2.3),
                             cos(t * rates.y + ph * 1.3) + 0.4 * cos(t * rates.x * 1.7 + ph * 0.7));
  world.xz = wrapXZ(position.xz * uBox + uWind + wander);
  vec2 uv = wi_gridUv(world.xz, uWorld, uGridN);
  float hover = mix(0.4, 2.7, position.y) + 0.25 * sin(t * (0.4 + aRand.z) + ph * 1.7);
  world.y = max(texture2D(uHeight, uv).r, 0.0) + max(hover, 0.3);
  // Only near cover: none over bare ground, rock, paths or open water.
  float need = 0.02 + 0.18 * aRand2.z;
  float present = smoothstep(need, need + 0.1, texture2D(uGrass, uv).r);
  // Soft blink: a quick swell, a slower fade, then dark for a while.
  float cycle = fract(t / mix(2.8, 6.5, aRand.y) + aRand2.w);
  float glow = smoothstep(0.0, 0.1, cycle) * (1.0 - smoothstep(0.45, 0.75, cycle));
  alpha = present * glow;
  size *= mix(0.75, 1.25, aRand.x);
#endif
  vec4 mv = viewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;
  // Gone before the box edge, where the wrap happens.
  float ring = length(world.xz - uCenter.xz) / (0.5 * uBox);
  alpha *= 1.0 - smoothstep(0.6, 0.97, ring);
  // Gone in the last metres before the lens: no giant blobs.
  alpha *= smoothstep(1.0, 3.0, length(mv.xyz));
  // Perspective size in pixels, capped; sizes are given for a 1080-pixel-tall frame.
  float ref = uViewH / 1080.0;
  float px = min(size * projectionMatrix[1][1] * 0.5 * uViewH / max(-mv.z, 0.01), uCapPx * ref);
  // Below about a pixel, keep the point one pixel wide and fade it instead (no shimmer).
  float minPx = max(1.0, 1.25 * ref);
  alpha *= min(px / minPx, 1.0);
  vAlpha = alpha;
  gl_PointSize = alpha > 0.002 ? max(px, minPx) : 0.0;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float d2 = dot(c, c);
  if (d2 > 1.0) discard;
#if KIND == 3
  float a = (exp(-d2 * 9.0) + 0.22 * exp(-d2 * 2.2)) * (1.0 - d2); // bright core, faint halo
#else
  float a = 1.0 - smoothstep(0.2, 1.0, d2);
#endif
  gl_FragColor = vec4(uColor, a * vAlpha * uOpacity);
}
`;

/** Fastest the particle box follows the camera (m/s); sprinting is about 11. */
const CENTER_SPEED = 30;
/** A camera jump longer than this (m) is a teleport: the box snaps instead of sliding. */
const CENTER_SNAP = 20;

/** Shared wind: a base heading and speed, with slow gusts and veering (rate scales both). */
type Wind = { angle: number; speed: number; gust: number; veer: number; rate: number };

type Look = {
  id: number; // KIND define in the shaders
  count: number; // particles at density 1
  box: number; // side of the box tiled around the camera (m)
  span: number; // snow only: height of the falling layer (m)
  below: number; // snow only: how far that layer reaches below the camera (m)
  size: number; // world diameter of a typical particle (m)
  capPx: number; // largest on-screen size, in pixels of a 1080-tall frame
  color: string;
  intensity: number; // above 1 pushes additive particles into bloom
  opacity: number;
  additive: boolean;
  wind: Wind;
};

const LOOKS: Record<AmbientKind, Look> = {
  snow: {
    id: 0, count: 1650, box: 46, span: 16, below: 5.5, size: 0.08, capPx: 7, color: '#f2f6ff', intensity: 1.35, opacity: 0.9, additive: false,
    wind: { angle: 0.6, speed: 0.55, gust: 0.6, veer: 0.5, rate: 1 },
  },
  dust: {
    id: 1, count: 360, box: 48, span: 0, below: 0, size: 0.06, capPx: 5, color: '#ffe9c4', intensity: 1.15, opacity: 0.6, additive: false,
    wind: { angle: 2.3, speed: 4.5, gust: 0.45, veer: 0.3, rate: 2.5 },
  },
  pollen: {
    id: 2, count: 150, box: 40, span: 0, below: 0, size: 0.04, capPx: 4, color: '#fff3c4', intensity: 1.8, opacity: 0.75, additive: true,
    wind: { angle: -0.4, speed: 0.35, gust: 0.5, veer: 0.8, rate: 0.8 },
  },
  fireflies: {
    id: 3, count: 216, box: 40, span: 0, below: 0, size: 0.11, capPx: 10, color: '#d4ff6a', intensity: 3.2, opacity: 1.0, additive: true,
    wind: { angle: 1.2, speed: 0.1, gust: 0.5, veer: 1.0, rate: 0.5 },
  },
};

export class Ambient {
  readonly points: THREE.Points;
  private readonly kind: AmbientKind;
  private readonly look: Look;
  private readonly uniforms: Record<string, THREE.IUniform>;
  private readonly wind = new THREE.Vector2(); // current shared wind velocity (m/s)
  private readonly drift = new THREE.Vector2(); // integrated wind offset, kept inside one box
  private readonly center = new THREE.Vector3(); // where the box is tiled around (trails the camera)
  private centered = false;
  private readonly viewport = new THREE.Vector4();

  constructor(kind: AmbientKind, world: World) {
    this.kind = kind;
    this.look = LOOKS[kind];
    const look = this.look;
    const n = look.count;
    // Seeded so every visit (and every screenshot) gets the same weather.
    const rng = mulberry32(hashString(`ambient-${kind}`));
    const unit = new Float32Array(n * 3); // spot in the box, 0..1 on each axis
    const rand = new Float32Array(n * 4);
    const rand2 = new Float32Array(n * 4);
    for (let i = 0; i < unit.length; i++) unit[i] = rng();
    for (let i = 0; i < rand.length; i++) {
      rand[i] = rng();
      rand2[i] = rng();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(unit, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));
    geo.setAttribute('aRand2', new THREE.BufferAttribute(rand2, 4));

    this.uniforms = {
      uTime: { value: 0 },
      uCenter: { value: this.center },
      uWind: { value: this.drift },
      uBox: { value: look.box },
      uSpan: { value: look.span },
      uBelow: { value: look.below },
      uSize: { value: look.size },
      uCapPx: { value: look.capPx },
      uViewH: { value: 1080 },
      uHeight: { value: world.island.heightTexture },
      uGrass: { value: world.island.grassTexture },
      uWorld: { value: WORLD },
      uGridN: { value: GRID },
      uColor: { value: new THREE.Color(look.color).multiplyScalar(look.intensity) },
      uOpacity: { value: look.opacity },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      defines: { KIND: look.id },
      transparent: true,
      depthWrite: false,
      blending: look.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false; // positions come from the shader
    this.points.matrixAutoUpdate = false; // the shader writes world positions directly
    this.points.renderOrder = 9;
    this.points.name = `ambient-${kind}`;
    // The frame height can change without setViewport (the governor's render scale, a preset's
    // pixel ratio, post-processing targets), so read the live viewport right before drawing.
    this.points.onBeforeRender = (renderer) => {
      renderer.getCurrentViewport(this.viewport);
      if (this.viewport.w > 0) this.uniforms.uViewH.value = this.viewport.w;
    };
    console.info(`[ambient] ${kind}: ${n} particles in a ${look.box} m box, one draw`);
  }

  /** Frame height in pixels. Field of view comes from the camera's projection at draw time. */
  setViewport(heightPx: number, fovDeg: number): void {
    if (!(heightPx > 0)) {
      console.warn(`[ambient] ignoring viewport height ${heightPx} (fov ${fovDeg}); the next draw reads the real one`);
      return;
    }
    this.uniforms.uViewH.value = heightPx;
  }

  /** Share of particles drawn, 0..1 (low graphics presets draw fewer). */
  setDensity(share: number): void {
    if (!Number.isFinite(share)) throw new Error(`[ambient] bad density ${share}`);
    const s = Math.min(1, Math.max(0, share));
    const drawn = Math.round(this.look.count * s);
    this.points.geometry.setDrawRange(0, drawn);
    console.info(`[ambient] ${this.kind}: density ${s.toFixed(2)}, ${drawn}/${this.look.count} drawn`);
  }

  update(dt: number, time: number, camera: THREE.Vector3): void {
    const w = this.look.wind;
    const t = time * w.rate;
    const speed = w.speed * (1 + w.gust * (0.65 * Math.sin(t * 0.11 + 0.4) + 0.35 * Math.sin(t * 0.29 + 1.3)));
    const angle = w.angle + w.veer * (0.7 * Math.sin(t * 0.031) + 0.3 * Math.sin(t * 0.083 + 0.7));
    this.wind.set(Math.cos(angle) * speed, Math.sin(angle) * speed);
    // Particles are tiled every box length, so the offset can wrap without anything moving.
    const box = this.look.box;
    this.drift.x = (((this.drift.x + this.wind.x * dt) % box) + box) % box;
    this.drift.y = (((this.drift.y + this.wind.y * dt) % box) + box) % box;
    // Shader motion is a function of time; as a float32 it stays smooth for hours of play.
    this.uniforms.uTime.value = time;
    // The box follows the camera at up to CENTER_SPEED. The camera rig can jump a few metres in
    // one frame when it pulls in behind a tree; letting the box catch up over a few frames keeps
    // the wrap edge sliding smoothly, so nothing visible wraps. Real teleports snap.
    const gap = this.center.distanceTo(camera);
    const step = CENTER_SPEED * dt;
    if (!this.centered || gap > CENTER_SNAP) {
      this.center.copy(camera);
      this.centered = true;
    } else if (gap > step) {
      this.center.lerp(camera, step / gap);
    } else {
      this.center.copy(camera);
    }
  }

  dispose(): void {
    this.points.removeFromParent();
    this.points.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
  }
}
