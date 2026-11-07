import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { VRM, VRMHumanBoneName } from '@pixiv/three-vrm';

// Retargets Mixamo clips (from three.js's Xbot.glb) onto a VRM's normalized humanoid,
// the same way three-vrm's official Mixamo example does:
//
//   normalizedLocal = parentRestWorld * mixamoLocal * inverse(restWorld)
//
// Normalized VRM bones have identity rest rotations in a T-pose, so this turns each
// Mixamo local rotation into "rotation away from the T-pose". Xbot's rest pose is a
// T-pose facing +Z (checked: left arm along +X, toes along +Z), the same frame the
// formula assumes. VRM 0.x rigs face -Z, so their tracks get a 180 degree turn about Y
// (negate quaternion x and z).

export const ANIMATION_SOURCE_URL = '/assets/anims/Xbot.glb';

/** Mixamo bone name (as sanitized by GLTFLoader: "mixamorig:Hips" -> "mixamorigHips") to VRM bone. */
const MIXAMO_TO_VRM: Record<string, VRMHumanBoneName> = {
  mixamorigHips: 'hips',
  mixamorigSpine: 'spine',
  mixamorigSpine1: 'chest',
  mixamorigSpine2: 'upperChest',
  mixamorigNeck: 'neck',
  mixamorigHead: 'head',
  mixamorigLeftShoulder: 'leftShoulder',
  mixamorigLeftArm: 'leftUpperArm',
  mixamorigLeftForeArm: 'leftLowerArm',
  mixamorigLeftHand: 'leftHand',
  mixamorigLeftHandThumb1: 'leftThumbMetacarpal',
  mixamorigLeftHandThumb2: 'leftThumbProximal',
  mixamorigLeftHandThumb3: 'leftThumbDistal',
  mixamorigLeftHandIndex1: 'leftIndexProximal',
  mixamorigLeftHandIndex2: 'leftIndexIntermediate',
  mixamorigLeftHandIndex3: 'leftIndexDistal',
  mixamorigLeftHandMiddle1: 'leftMiddleProximal',
  mixamorigLeftHandMiddle2: 'leftMiddleIntermediate',
  mixamorigLeftHandMiddle3: 'leftMiddleDistal',
  mixamorigLeftHandRing1: 'leftRingProximal',
  mixamorigLeftHandRing2: 'leftRingIntermediate',
  mixamorigLeftHandRing3: 'leftRingDistal',
  mixamorigLeftHandPinky1: 'leftLittleProximal',
  mixamorigLeftHandPinky2: 'leftLittleIntermediate',
  mixamorigLeftHandPinky3: 'leftLittleDistal',
  mixamorigRightShoulder: 'rightShoulder',
  mixamorigRightArm: 'rightUpperArm',
  mixamorigRightForeArm: 'rightLowerArm',
  mixamorigRightHand: 'rightHand',
  mixamorigRightHandThumb1: 'rightThumbMetacarpal',
  mixamorigRightHandThumb2: 'rightThumbProximal',
  mixamorigRightHandThumb3: 'rightThumbDistal',
  mixamorigRightHandIndex1: 'rightIndexProximal',
  mixamorigRightHandIndex2: 'rightIndexIntermediate',
  mixamorigRightHandIndex3: 'rightIndexDistal',
  mixamorigRightHandMiddle1: 'rightMiddleProximal',
  mixamorigRightHandMiddle2: 'rightMiddleIntermediate',
  mixamorigRightHandMiddle3: 'rightMiddleDistal',
  mixamorigRightHandRing1: 'rightRingProximal',
  mixamorigRightHandRing2: 'rightRingIntermediate',
  mixamorigRightHandRing3: 'rightRingDistal',
  mixamorigRightHandPinky1: 'rightLittleProximal',
  mixamorigRightHandPinky2: 'rightLittleIntermediate',
  mixamorigRightHandPinky3: 'rightLittleDistal',
  mixamorigLeftUpLeg: 'leftUpperLeg',
  mixamorigLeftLeg: 'leftLowerLeg',
  mixamorigLeftFoot: 'leftFoot',
  mixamorigLeftToeBase: 'leftToes',
  mixamorigRightUpLeg: 'rightUpperLeg',
  mixamorigRightLeg: 'rightLowerLeg',
  mixamorigRightFoot: 'rightFoot',
  mixamorigRightToeBase: 'rightToes',
};

/** Bones the retarget cannot do without. Missing one means the rig is not usable. */
const REQUIRED_BONES: VRMHumanBoneName[] = [
  'hips',
  'spine',
  'chest',
  'upperChest',
  'neck',
  'head',
  'leftUpperArm',
  'leftLowerArm',
  'leftHand',
  'rightUpperArm',
  'rightLowerArm',
  'rightHand',
  'leftUpperLeg',
  'leftLowerLeg',
  'leftFoot',
  'leftToes',
  'rightUpperLeg',
  'rightLowerLeg',
  'rightFoot',
  'rightToes',
];

type AnimationSource = {
  scene: THREE.Group;
  clips: THREE.AnimationClip[];
  hipsRestHeight: number; // world-space hips height of Xbot at rest, in meters
};

/** How a locomotion clip moves over the ground when played at rate 1 on one model. */
export type GaitInfo = {
  duration: number; // seconds per full cycle (two steps)
  groundSpeed: number; // m/s the planted foot travels backward, i.e. the speed with no foot slide
  contactPhase: number; // 0..1 phase where the left foot touches down (used to sync walk and run)
  dutyFactor: number; // fraction of the cycle a foot is planted
};

export type LocomotionSet = {
  idle: THREE.AnimationClip;
  walk: THREE.AnimationClip;
  run: THREE.AnimationClip;
  walkGait: GaitInfo;
  runGait: GaitInfo;
};

let sourcePromise: Promise<AnimationSource> | null = null;
const setCache = new Map<string, LocomotionSet>();

/** Loads Xbot.glb once; every character shares it. */
function loadAnimationSource(): Promise<AnimationSource> {
  if (sourcePromise === null) {
    sourcePromise = fetchAnimationSource();
    // Don't cache a failure: the next load gets a fresh attempt (and a fresh, loud error).
    sourcePromise.catch(() => {
      sourcePromise = null;
    });
  }
  return sourcePromise;
}

/** Starts fetching Xbot.glb without waiting, so it downloads alongside the first VRM. */
export function preloadAnimationSource(): void {
  void loadAnimationSource().catch(() => {
    // The error surfaces (loudly) from locomotionFor(), which awaits a fresh attempt.
  });
}

async function fetchAnimationSource(): Promise<AnimationSource> {
  const t0 = performance.now();
  let gltf;
  try {
    gltf = await new GLTFLoader().loadAsync(ANIMATION_SOURCE_URL);
  } catch (err) {
    throw new Error(`[vrm] could not load animation source ${ANIMATION_SOURCE_URL}: ${String(err)}`);
  }
  // Only the skeleton is needed. Drop Xbot's meshes so their buffers can be collected.
  const meshes: THREE.Object3D[] = [];
  gltf.scene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) meshes.push(obj);
  });
  for (const mesh of meshes) mesh.removeFromParent();
  gltf.scene.updateMatrixWorld(true);

  const hips = gltf.scene.getObjectByName('mixamorigHips');
  if (!hips) throw new Error(`[vrm] ${ANIMATION_SOURCE_URL} has no mixamorigHips bone`);
  const hipsRestHeight = hips.getWorldPosition(new THREE.Vector3()).y;
  if (!(hipsRestHeight > 0.1)) throw new Error(`[vrm] ${ANIMATION_SOURCE_URL} hips height ${hipsRestHeight} looks wrong`);

  const names = gltf.animations.map((c) => `${c.name} ${c.duration.toFixed(2)}s`).join(', ');
  console.info(`[vrm] animation source loaded in ${(performance.now() - t0).toFixed(0)} ms: ${names}; hips ${hipsRestHeight.toFixed(3)} m`);
  return { scene: gltf.scene, clips: gltf.animations, hipsRestHeight };
}

function requireNormalizedBone(vrm: VRM, name: VRMHumanBoneName): THREE.Object3D {
  const node = vrm.humanoid.getNormalizedBoneNode(name);
  if (!node) throw new Error(`[vrm] model is missing required humanoid bone "${name}"`);
  return node;
}

/** Throws if the rig lacks a bone that walk/run/idle (and the pose layers) depend on. */
export function assertRetargetableRig(vrm: VRM): void {
  for (const name of REQUIRED_BONES) requireNormalizedBone(vrm, name);
}

/**
 * Converts one Xbot clip into a clip that drives `vrm`'s normalized bones.
 * Keeps rotation tracks and the hips height. Hips x/z are pinned to the rest pose so
 * the character stays on its root; Mixamo bone translations and scales are dropped
 * because VRM bone lengths differ from Mixamo's.
 */
function retargetClip(source: AnimationSource, clipName: string, vrm: VRM): THREE.AnimationClip {
  const clip = THREE.AnimationClip.findByName(source.clips, clipName);
  if (!clip) {
    throw new Error(`[vrm] clip "${clipName}" not in ${ANIMATION_SOURCE_URL} (has: ${source.clips.map((c) => c.name).join(', ')})`);
  }
  const isVrm0 = vrm.meta.metaVersion === '0';
  const hipsRest = vrm.humanoid.normalizedRestPose.hips?.position;
  if (!hipsRest) throw new Error('[vrm] normalized rest pose has no hips position');
  const heightScale = hipsRest[1] / source.hipsRestHeight;

  const tracks: THREE.KeyframeTrack[] = [];
  const restWorldInverse = new THREE.Quaternion();
  const parentRestWorld = new THREE.Quaternion();
  const q = new THREE.Quaternion();
  const v = new THREE.Vector3();
  const skipped: string[] = [];

  for (const track of clip.tracks) {
    const parsed = THREE.PropertyBinding.parseTrackName(track.name);
    const mixamoName = parsed.nodeName;
    const property = parsed.propertyName;
    const boneName = MIXAMO_TO_VRM[mixamoName];
    if (!boneName) continue; // finger tips, eyes, *_End bones: no VRM counterpart
    const vrmNode = vrm.humanoid.getNormalizedBoneNode(boneName);
    if (!vrmNode) {
      if (property === 'quaternion') skipped.push(boneName);
      continue;
    }
    if (THREE.PropertyBinding.sanitizeNodeName(vrmNode.name) !== vrmNode.name) {
      throw new Error(`[vrm] normalized bone name "${vrmNode.name}" has characters the animation system cannot address`);
    }
    const mixamoNode = source.scene.getObjectByName(mixamoName);
    if (!mixamoNode || !mixamoNode.parent) throw new Error(`[vrm] ${ANIMATION_SOURCE_URL} has a track for missing bone ${mixamoName}`);

    if (property === 'quaternion') {
      mixamoNode.getWorldQuaternion(restWorldInverse).invert();
      mixamoNode.parent.getWorldQuaternion(parentRestWorld);
      const values = new Float32Array(track.values.length);
      for (let i = 0; i < track.values.length; i += 4) {
        q.fromArray(track.values, i);
        q.premultiply(parentRestWorld).multiply(restWorldInverse);
        if (isVrm0) {
          q.x = -q.x;
          q.z = -q.z;
        }
        q.toArray(values, i);
      }
      tracks.push(new THREE.QuaternionKeyframeTrack(`${vrmNode.name}.quaternion`, track.times.slice(), values));
    } else if (property === 'position' && boneName === 'hips') {
      const parentWorld = mixamoNode.parent.matrixWorld;
      const values = new Float32Array(track.values.length);
      for (let i = 0; i < track.values.length; i += 3) {
        v.fromArray(track.values, i).applyMatrix4(parentWorld);
        values[i] = hipsRest[0];
        values[i + 1] = v.y * heightScale;
        values[i + 2] = hipsRest[2];
      }
      tracks.push(new THREE.VectorKeyframeTrack(`${vrmNode.name}.position`, track.times.slice(), values));
    }
  }

  if (skipped.length > 0) console.info(`[vrm] ${clipName}: model has no ${skipped.join(', ')}; those tracks were skipped`);
  return new THREE.AnimationClip(clipName, clip.duration, tracks);
}

/**
 * Plays `clip` on the model at N evenly spaced times and watches the toes. While a foot
 * is planted it moves backward relative to the body at exactly the ground speed the clip
 * was authored for, so playback rate = actualSpeed / groundSpeed keeps feet from sliding.
 * A foot counts as planted when it is within 2 cm of its lowest point AND moving backward;
 * the height test alone also catches the swinging toe, which dips to ~1.5 cm mid-swing.
 * `adjustPose` runs after the clip is applied at each sample (to measure a pose layer).
 * Leaves the model in its rest pose.
 */
export function measureGait(vrm: VRM, clip: THREE.AnimationClip, adjustPose?: () => void): GaitInfo {
  const SAMPLES = 120;
  const PLANTED_EPSILON = 0.02; // m above the foot's lowest point that still counts as planted
  const forwardSign = vrm.meta.metaVersion === '0' ? -1 : 1; // VRM 0.x rigs face -Z locally
  const rigRoot = vrm.humanoid.normalizedHumanBonesRoot;
  const feet = [requireNormalizedBone(vrm, 'leftToes'), requireNormalizedBone(vrm, 'rightToes')];

  const mixer = new THREE.AnimationMixer(vrm.scene);
  const action = mixer.clipAction(clip);
  action.play();
  const toRig = new THREE.Matrix4();
  const p = new THREE.Vector3();
  const heights: number[][] = [[], []];
  const forwards: number[][] = [[], []];
  for (let i = 0; i < SAMPLES; i++) {
    mixer.setTime((i / SAMPLES) * clip.duration);
    if (adjustPose) adjustPose();
    vrm.scene.updateMatrixWorld(true);
    toRig.copy(rigRoot.matrixWorld).invert();
    for (let f = 0; f < 2; f++) {
      feet[f].getWorldPosition(p).applyMatrix4(toRig);
      heights[f].push(p.y);
      forwards[f].push(p.z * forwardSign);
    }
  }
  action.stop();
  mixer.uncacheRoot(vrm.scene);
  vrm.humanoid.resetNormalizedPose();
  vrm.scene.updateMatrixWorld(true);

  const dt = clip.duration / SAMPLES;
  const speeds: number[] = [];
  let plantedCount = 0;
  let contactPhase = 0;
  for (let f = 0; f < 2; f++) {
    const planted = plantedSamples(heights[f], forwards[f], PLANTED_EPSILON);
    for (let i = 0; i < SAMPLES; i++) {
      if (!planted[i]) continue;
      plantedCount++;
      speeds.push(-(forwards[f][(i + 1) % SAMPLES] - forwards[f][i]) / dt);
    }
    if (f === 0) contactPhase = longestRunStart(planted) / SAMPLES;
  }
  if (speeds.length < 4) throw new Error(`[vrm] could not find planted feet in clip "${clip.name}"`);
  speeds.sort((a, b) => a - b);
  const groundSpeed = speeds[Math.floor(speeds.length / 2)];
  return { duration: clip.duration, groundSpeed, contactPhase, dutyFactor: plantedCount / (2 * SAMPLES) };
}

/** Per cyclic sample: low (both ends of the step near the lowest point) and moving backward. */
function plantedSamples(heights: number[], forwards: number[], epsilon: number): boolean[] {
  const n = heights.length;
  const minY = Math.min(...heights);
  const planted: boolean[] = [];
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    const low = heights[i] < minY + epsilon && heights[next] < minY + epsilon;
    const backward = forwards[next] < forwards[i];
    planted.push(low && backward);
  }
  return planted;
}

/** Index where the longest run of `true` starts, treating the array as a loop (the stance). */
function longestRunStart(flags: boolean[]): number {
  const n = flags.length;
  let bestStart = 0;
  let bestLength = 0;
  for (let i = 0; i < n; i++) {
    const prev = (i + n - 1) % n;
    if (!flags[i] || flags[prev]) continue; // not the start of a run
    let length = 0;
    while (length < n && flags[(i + length) % n]) length++;
    if (length > bestLength) {
      bestLength = length;
      bestStart = i;
    }
  }
  return bestStart;
}

/**
 * Idle/walk/run clips retargeted onto this model, plus their measured ground speeds.
 * Cached per model URL: every load of the same file has the same bone names and
 * proportions, so switching back to a character reuses the work.
 * Must be called before the model is animated (gait measurement poses the rig).
 */
export async function locomotionFor(modelUrl: string, vrm: VRM): Promise<LocomotionSet> {
  const cached = setCache.get(modelUrl);
  if (cached) {
    console.info(`[vrm] reusing retargeted clips for ${modelUrl}`);
    return cached;
  }
  assertRetargetableRig(vrm);
  const source = await loadAnimationSource();
  const t0 = performance.now();
  const idle = retargetClip(source, 'idle', vrm);
  const walk = retargetClip(source, 'walk', vrm);
  const run = retargetClip(source, 'run', vrm);
  const walkGait = measureGait(vrm, walk);
  const runGait = measureGait(vrm, run);
  const set: LocomotionSet = { idle, walk, run, walkGait, runGait };
  setCache.set(modelUrl, set);
  console.info(
    `[vrm] retargeted idle/walk/run onto ${modelUrl} in ${(performance.now() - t0).toFixed(0)} ms; ` +
      `walk ${walkGait.groundSpeed.toFixed(2)} m/s per ${walkGait.duration.toFixed(2)} s cycle, ` +
      `run ${runGait.groundSpeed.toFixed(2)} m/s per ${runGait.duration.toFixed(2)} s cycle`,
  );
  return set;
}
