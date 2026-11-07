import * as THREE from 'three';
import { VRMUtils, type VRM } from '@pixiv/three-vrm';
import type { AvatarPose } from '../player/avatar';
import { clamp, damp, lerp, smoothstep } from '../util/math';
import type { CharacterDef } from './roster';
import { locomotionFor, measureGait, preloadAnimationSource, type GaitInfo, type LocomotionSet } from './retarget';
import { loadVrm, prepareVrm, type PrepReport } from './vrmModel';
import { applyAir, applyCast, applyDive, applyLanding, applyLean, applyStride, applySwim, buildRig, type Rig } from './poseLayers';

// A playable anime character: a VRoid VRM driven by retargeted Mixamo idle/walk/run
// clips, with procedural layers on top for jumping, landing, swimming, diving and
// casting. Drop-in for the block Avatar: same root/handR/animate(dt, pose) surface.

/** Sea surface above the avatar root while swimming. Player floats its feet at FLOAT_Y = -1.05, sea at y = 0. */
const SWIM_WATERLINE = 1.05;
/** Player's swim speed (SWIM in player.ts), used to scale the stroke. */
const SWIM_SPEED = 4.2;
/** A root jump bigger than this in one frame is a teleport (Skip, respawn). Falls top out near 3 m per frame. */
const TELEPORT_DISTANCE = 4;

/** Below this speed (m/s) the character stands. */
const IDLE_SPEED = 0.15;
/** Playback-rate limits. Inside them, rate = speed / clip ground speed and the feet do not slide. */
const WALK_RATE_MIN = 0.65;
const WALK_RATE_MAX = 1.5;
const RUN_RATE_MIN = 0.75;
/** Past this run cadence the stride lengthens first (up to STRIDE_MAX), then cadence climbs to RUN_RATE_MAX. */
const RUN_RATE_COMFORT = 2.0;
const STRIDE_MAX = 1.3;
const RUN_RATE_MAX = 2.8;

export type ExpressionName = 'happy' | 'surprised' | 'angry' | 'neutral';
type Emotion = Exclude<ExpressionName, 'neutral'>;
type FaceSlot = Emotion | 'blink';
const EMOTIONS: Emotion[] = ['happy', 'surprised', 'angry'];
/** VRM 1.0 preset names first, then the VRM 0.x / VRoid names they may appear under. */
const FACE_ALIASES: Record<FaceSlot, string[]> = {
  blink: ['blink'],
  happy: ['happy', 'joy'],
  surprised: ['surprised', 'surprise'],
  angry: ['angry', 'anger'],
};

export type VrmAvatarStats = {
  loadMs: number; // total, fetch to ready
  parseMs: number; // fetch + glTF/VRM parse + texture decode
  prepMs: number; // VRMUtils passes, merging, outlines
  animMs: number; // retargeting + gait measurement (near 0 when cached)
  triangles: number; // main pass, outline shells included
  drawCalls: number; // main pass, outline shells included; the shadow pass adds about as many again
  drawCallsAsShipped: number; // before merging hair primitives
  meshes: number;
  textureMB: number; // uncompressed RGBA size of the textures, mipmaps included
  height: number;
  walkSpeed: number; // ground speed of the walk clip at 1x, m/s
  runSpeed: number; // ground speed of the run clip at 1x, m/s
};

type Timings = { start: number; parse: number; prep: number; anim: number };

export type GaitSet = {
  walk: GaitInfo;
  run: GaitInfo;
  /** Ground covered per run cycle with the full STRIDE_MAX sprint stride, relative to 1x (measured). */
  strideGain: number;
};

const strideGainCache = new Map<string, number>();

/**
 * Measures how much ground the run covers with the sprint stride on this model. A 1.3x
 * thigh swing does not give 1.3x ground (the foot leaves the ground earlier), so the
 * cadence math uses this measured number. Cached per model URL like the clips.
 */
function strideGainFor(modelUrl: string, vrm: VRM, locomotion: LocomotionSet): number {
  const cached = strideGainCache.get(modelUrl);
  if (cached !== undefined) return cached;
  const rig = buildRig(vrm);
  const boosted = measureGait(vrm, locomotion.run, () => applyStride(rig, STRIDE_MAX));
  const gain = boosted.groundSpeed / locomotion.runGait.groundSpeed;
  strideGainCache.set(modelUrl, gain);
  console.info(`[vrm] ${modelUrl}: ${STRIDE_MAX}x sprint stride covers ${gain.toFixed(2)}x the ground per run cycle`);
  return gain;
}

const _v = new THREE.Vector3();

function fract(x: number): number {
  return x - Math.floor(x);
}

function resolveFaceSlots(vrm: VRM, id: string): Record<FaceSlot, string | null> {
  const slots: Record<FaceSlot, string | null> = { blink: null, happy: null, surprised: null, angry: null };
  const manager = vrm.expressionManager;
  if (!manager) {
    console.warn(`[vrm] ${id}: model has no expressions; blinking and setExpression() are disabled`);
    return slots;
  }
  const available = manager.expressions.map((e) => e.expressionName);
  for (const slot of Object.keys(slots) as FaceSlot[]) {
    for (const alias of FACE_ALIASES[slot]) {
      const match = available.find((name) => name.toLowerCase() === alias);
      if (match) {
        slots[slot] = match;
        break;
      }
    }
  }
  console.info(
    `[vrm] ${id} expressions: ${available.join(', ')} -> blink=${slots.blink} happy=${slots.happy} surprised=${slots.surprised} angry=${slots.angry}`,
  );
  return slots;
}

/**
 * GPU size of the model's textures. Cloned materials clone their textures, but the clones
 * share one image (one GPU upload), so count distinct images.
 */
function textureMegabytes(root: THREE.Object3D): number {
  const seen = new Set<{ width?: number; height?: number }>();
  root.traverse((obj) => {
    const material = (obj as THREE.Mesh).material;
    if (!material) return;
    const list = Array.isArray(material) ? material : [material];
    for (const m of list) {
      const uniforms = (m as THREE.ShaderMaterial).uniforms ?? {};
      for (const uniform of Object.values(uniforms)) {
        const value = (uniform as { value: unknown }).value;
        if (value instanceof THREE.Texture && value.image) seen.add(value.image as { width?: number; height?: number });
      }
    }
  });
  let bytes = 0;
  for (const image of seen) {
    if (image.width && image.height) bytes += image.width * image.height * 4 * 1.33;
  }
  return bytes / (1024 * 1024);
}

export class VrmAvatar {
  readonly def: CharacterDef;
  readonly vrm: VRM;
  /** Player sets position (feet) and rotation.y (facing; 0 looks along +Z). */
  readonly root = new THREE.Group();
  /** Palm of the right hand, tracked every frame. Read it with getWorldPosition(). */
  readonly handR = new THREE.Object3D();
  /** Top of the model (hair included) above the feet, meters, measured in the T-pose. */
  readonly height: number;
  readonly stats: VrmAvatarStats;
  /** Ground speed and timing of the walk and run clips on this model. */
  readonly gait: GaitSet;

  private readonly rig: Rig;
  private readonly mixer: THREE.AnimationMixer;
  private readonly idleAction: THREE.AnimationAction;
  private readonly walkAction: THREE.AnimationAction;
  private readonly runAction: THREE.AnimationAction;
  private readonly face: Record<FaceSlot, string | null>;
  private readonly warned = new Set<string>();

  private gaitPhase = 0;
  private stride = 1; // sprint stride multiplier, already weighted by how much the run clip shows
  private swimPhase = 0;
  private air = 0;
  private airTime = 0;
  private rise = 0.5;
  private swim = 0;
  private dive = 0;
  private wasSwimming = false;
  private wasDiving = false;
  private emotion: Emotion | null = null;
  private emotionLeft = 0;
  private readonly emotionWeights: Record<Emotion, number> = { happy: 0, surprised: 0, angry: 0 };
  private blinkClock = 1.5 + Math.random() * 2.5;
  private blinkTime = -1;
  private readonly lastRootPos = new THREE.Vector3();
  private hasLastRootPos = false;
  private disposed = false;

  /**
   * Loads the character's VRM, prepares it and binds idle/walk/run. The Xbot animation
   * source is fetched in parallel on first use; clips are cached per model.
   */
  static async load(def: CharacterDef): Promise<VrmAvatar> {
    const t0 = performance.now();
    console.info(`[vrm] loading ${def.id} "${def.name}" from ${def.model}`);
    preloadAnimationSource();
    const vrm = await loadVrm(def.model);
    const t1 = performance.now();
    const prep = prepareVrm(vrm);
    const t2 = performance.now();
    const locomotion = await locomotionFor(def.model, vrm);
    const strideGain = strideGainFor(def.model, vrm, locomotion);
    const t3 = performance.now();
    const timings: Timings = { start: t0, parse: t1 - t0, prep: t2 - t1, anim: t3 - t2 };
    return new VrmAvatar(def, vrm, locomotion, strideGain, prep, timings);
  }

  private constructor(def: CharacterDef, vrm: VRM, locomotion: LocomotionSet, strideGain: number, prep: PrepReport, timings: Timings) {
    this.def = def;
    this.vrm = vrm;
    this.root.name = `vrm:${def.id}`;
    this.root.add(vrm.scene);
    this.rig = buildRig(vrm);
    this.gait = { walk: locomotion.walkGait, run: locomotion.runGait, strideGain };

    // Spells spawn bolts at the palm: halfway from the wrist to the middle finger's base.
    this.handR.name = 'handR';
    const middle = vrm.humanoid.getNormalizedBoneNode('rightMiddleProximal');
    if (middle) {
      this.handR.position.copy(middle.position).multiplyScalar(0.5);
    } else {
      console.warn(`[vrm] ${def.id}: no rightMiddleProximal bone, handR sits 4 cm past the wrist`);
      this.handR.position.set(-0.04 * this.rig.forwardSign, 0, 0);
    }
    this.rig.rightHand.add(this.handR);

    this.mixer = new THREE.AnimationMixer(vrm.scene);
    this.idleAction = this.mixer.clipAction(locomotion.idle);
    this.walkAction = this.mixer.clipAction(locomotion.walk);
    this.runAction = this.mixer.clipAction(locomotion.run);
    for (const action of [this.idleAction, this.walkAction, this.runAction]) {
      action.play();
      action.weight = 0;
    }
    this.idleAction.weight = 1;
    this.idleAction.time = Math.random() * locomotion.idle.duration; // so a crowd doesn't breathe in sync
    // Walk and run share one gait phase and are positioned by hand each frame.
    this.walkAction.timeScale = 0;
    this.runAction.timeScale = 0;

    this.face = resolveFaceSlots(vrm, def.id);

    vrm.scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(vrm.scene);
    if (Math.abs(box.min.y) > 0.05) console.warn(`[vrm] ${def.id}: lowest point is ${box.min.y.toFixed(3)} m, expected the feet at 0`);
    this.height = box.max.y;

    this.stats = {
      loadMs: Math.round(performance.now() - timings.start),
      parseMs: Math.round(timings.parse),
      prepMs: Math.round(timings.prep),
      animMs: Math.round(timings.anim),
      triangles: prep.after.triangles,
      drawCalls: prep.after.drawCalls,
      drawCallsAsShipped: prep.before.drawCalls,
      meshes: prep.after.meshes,
      textureMB: Math.round(textureMegabytes(vrm.scene)),
      height: Number(this.height.toFixed(3)),
      walkSpeed: Number(locomotion.walkGait.groundSpeed.toFixed(2)),
      runSpeed: Number(locomotion.runGait.groundSpeed.toFixed(2)),
    };
    const s = this.stats;
    console.info(
      `[vrm] ${def.id} "${def.name}" ready in ${s.loadMs} ms (fetch+parse ${s.parseMs}, prep ${s.prepMs}, anims ${s.animMs}): ` +
        `${s.triangles.toLocaleString()} tris incl. outlines, ${s.drawCalls} draw calls (${s.drawCallsAsShipped} as shipped, ` +
        `${prep.mergedAway} hair primitives merged, ${prep.outlinesSwitched} outlines to screen space, ${prep.outlinesAdded} hair outlines added), ` +
        `${s.meshes} meshes, ~${s.textureMB} MB textures, ${s.height.toFixed(2)} m tall, walk ${s.walkSpeed} m/s, run ${s.runSpeed} m/s at 1x`,
    );
  }

  /** Per frame, after the Player has placed root. Same contract as the block Avatar. */
  animate(dt: number, pose: AvatarPose): void {
    if (this.disposed) throw new Error(`[vrm] animate() called on disposed avatar ${this.def.id}`);
    this.updateBlendState(dt, pose);
    this.updateLocomotion(dt, pose.speed);
    this.mixer.update(dt);

    const grounded = (1 - this.air) * (1 - this.swim);
    applyStride(this.rig, 1 + (this.stride - 1) * grounded);
    applyLean(this.rig, this.sprintLean(pose.speed) * grounded);
    applyLanding(this.rig, pose.land * (1 - this.swim));
    applyAir(this.rig, this.air, this.rise);
    applySwim(this.rig, this.swim, this.swimPhase, clamp(pose.speed / SWIM_SPEED, 0, 1), SWIM_WATERLINE);
    applyDive(this.rig, this.dive);
    applyCast(this.rig, pose.cast);

    this.updateFace(dt);
    this.vrm.update(dt); // normalized -> raw bones, expressions, spring bones (hair, skirts)
    this.resetSpringsAfterTeleport();
  }

  /**
   * Shows an emotion for `seconds`, fading in and out. 'neutral' clears it right away.
   * Expressions the model lacks are ignored with one console warning per name.
   */
  setExpression(name: ExpressionName, seconds: number): void {
    if (name === 'neutral') {
      if (this.emotion) console.info(`[vrm] ${this.def.id} expression ${this.emotion} -> neutral`);
      this.emotion = null;
      this.emotionLeft = 0;
      return;
    }
    if (!this.face[name]) {
      this.warnOnce(name, `[vrm] ${this.def.id} has no "${name}" expression; setExpression ignored`);
      return;
    }
    this.emotion = name;
    this.emotionLeft = Math.max(0, seconds);
    console.info(`[vrm] ${this.def.id} expression -> ${name} for ${this.emotionLeft.toFixed(1)} s`);
  }

  /** Frees GPU geometry, materials and textures. The avatar is unusable afterwards. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.vrm.scene);
    this.root.removeFromParent();
    VRMUtils.deepDispose(this.vrm.scene);
    console.info(`[vrm] disposed ${this.def.id}`);
  }

  private warnOnce(key: string, message: string): void {
    if (this.warned.has(key)) return;
    this.warned.add(key);
    console.warn(message);
  }

  private updateBlendState(dt: number, pose: AvatarPose): void {
    const inAir = !pose.grounded && !pose.swimming;
    this.airTime = inAir ? this.airTime + dt : 0;
    // Ignore a frame or two off the ground on bumps; a real jump has upward speed right away.
    const airborne = inAir && (this.airTime > 0.08 || pose.vy > 2 || pose.dive);
    this.air = damp(this.air, airborne ? 1 : 0, 14, dt);
    this.rise = damp(this.rise, clamp(0.5 + pose.vy / 12, 0, 1), 10, dt);
    this.swim = damp(this.swim, pose.swimming ? 1 : 0, 6, dt);
    this.dive = damp(this.dive, pose.dive ? 1 : 0, 16, dt);
    const strokesPerSecond = lerp(0.45, 0.9, clamp(pose.speed / SWIM_SPEED, 0, 1));
    this.swimPhase = fract(this.swimPhase + dt * strokesPerSecond);

    if (pose.swimming !== this.wasSwimming) {
      console.info(`[vrm] ${this.def.id} ${pose.swimming ? 'swimming' : 'out of the water'}`);
      this.wasSwimming = pose.swimming;
    }
    if (pose.dive !== this.wasDiving) {
      if (pose.dive) console.info(`[vrm] ${this.def.id} diving`);
      this.wasDiving = pose.dive;
    }
  }

  /**
   * Blends idle -> walk -> run by speed. Walk and run follow one shared gait phase,
   * aligned on left-foot contact, so blending between them never crosses the legs.
   * Each clip's rate is speed / its measured ground speed, so planted feet don't slide.
   * Sprinting past RUN_RATE_COMFORT lengthens the stride before raising cadence further;
   * only past both limits do the feet slide (momo, the smallest model, at 11 m/s).
   */
  private updateLocomotion(dt: number, speed: number): void {
    const walk = this.gait.walk;
    const run = this.gait.run;
    const walkFull = walk.groundSpeed * 0.6;
    const runStart = walk.groundSpeed * 1.1;
    const runFull = Math.max(runStart + 0.5, run.groundSpeed * 0.9);
    const moving = smoothstep(IDLE_SPEED, walkFull, speed);
    const running = smoothstep(runStart, runFull, speed);
    const idleWeight = 1 - moving;
    const walkWeight = moving * (1 - running);
    const runWeight = moving * running;

    const walkRate = clamp(speed / walk.groundSpeed, WALK_RATE_MIN, WALK_RATE_MAX);
    let runRate = speed / run.groundSpeed;
    let stride = 1;
    const gain = this.gait.strideGain;
    if (runRate > RUN_RATE_COMFORT && gain > 1.02) {
      // Lengthen the stride enough to hold the comfort cadence, interpolating the
      // measured gain between 1x and STRIDE_MAX, then set the cadence from what it covers.
      const needed = speed / (run.groundSpeed * RUN_RATE_COMFORT);
      stride = clamp(1 + ((needed - 1) / (gain - 1)) * (STRIDE_MAX - 1), 1, STRIDE_MAX);
      const covered = run.groundSpeed * (1 + ((gain - 1) * (stride - 1)) / (STRIDE_MAX - 1));
      runRate = speed / covered;
    }
    runRate = clamp(runRate, RUN_RATE_MIN, RUN_RATE_MAX);
    this.stride = 1 + (stride - 1) * runWeight;
    let cyclesPerSecond = WALK_RATE_MIN / walk.duration;
    const moveWeight = walkWeight + runWeight;
    if (moveWeight > 1e-4) {
      cyclesPerSecond = ((walkWeight * walkRate) / walk.duration + (runWeight * runRate) / run.duration) / moveWeight;
    }
    this.gaitPhase = fract(this.gaitPhase + dt * cyclesPerSecond);
    this.walkAction.time = fract(this.gaitPhase + walk.contactPhase) * walk.duration;
    this.runAction.time = fract(this.gaitPhase + run.contactPhase) * run.duration;
    this.idleAction.weight = idleWeight;
    this.walkAction.weight = walkWeight;
    this.runAction.weight = runWeight;
  }

  /** Extra forward lean once the run clip is sped well past its natural speed. */
  private sprintLean(speed: number): number {
    const run = this.gait.run.groundSpeed;
    return smoothstep(run * 1.5, run * 2.8, speed) * 0.14;
  }

  private updateFace(dt: number): void {
    const manager = this.vrm.expressionManager;
    if (!manager) return;
    if (this.emotion) {
      this.emotionLeft -= dt;
      if (this.emotionLeft <= 0) {
        console.info(`[vrm] ${this.def.id} expression ${this.emotion} finished`);
        this.emotion = null;
      }
    }
    for (const emotion of EMOTIONS) {
      this.emotionWeights[emotion] = damp(this.emotionWeights[emotion], this.emotion === emotion ? 1 : 0, 10, dt);
      const name = this.face[emotion];
      if (name) manager.setValue(name, this.emotionWeights[emotion]);
    }

    // Blink every 2-5 s (sometimes twice), 0.2 s per blink. Happy and surprised faces
    // already shape the eyes, so blinking is held back while they show.
    this.blinkClock -= dt;
    if (this.blinkClock <= 0 && this.blinkTime < 0) {
      this.blinkTime = 0;
      this.blinkClock = Math.random() < 0.15 ? 0.3 : 2 + Math.random() * 3;
    }
    let blink = 0;
    if (this.blinkTime >= 0) {
      this.blinkTime += dt;
      const t = this.blinkTime;
      if (t < 0.07) blink = t / 0.07;
      else if (t < 0.1) blink = 1;
      else if (t < 0.2) blink = 1 - (t - 0.1) / 0.1;
      else this.blinkTime = -1;
    }
    const eyesBusy = clamp(this.emotionWeights.happy + this.emotionWeights.surprised, 0, 1);
    if (this.face.blink) manager.setValue(this.face.blink, blink * (1 - eyesBusy));
  }

  /** Spring bones would whip across the map after a teleport; snap them to rest instead. */
  private resetSpringsAfterTeleport(): void {
    this.root.getWorldPosition(_v);
    const jump = this.hasLastRootPos ? _v.distanceTo(this.lastRootPos) : 0;
    if (!this.hasLastRootPos || jump > TELEPORT_DISTANCE) {
      this.vrm.springBoneManager?.reset();
      if (this.hasLastRootPos) console.info(`[vrm] ${this.def.id} moved ${jump.toFixed(1)} m in one frame; spring bones reset`);
    }
    this.lastRootPos.copy(_v);
    this.hasLastRootPos = true;
  }
}
