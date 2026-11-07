import * as THREE from 'three';
import type { VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
import { lerp } from '../util/math';

// Procedural pose layers applied on top of the AnimationMixer output, on the VRM's
// normalized bones. Normalized bones have identity rotation in the T-pose, so a local
// rotation means the same thing on every model.
//
// Every angle below is written for a body facing +Z (left = +X, up = +Y):
//   legs:  x < 0 swings the leg forward, lower leg x > 0 bends the knee
//   spine: x > 0 bends forward, y > 0 turns the right shoulder forward
//   arms:  rest along +X (left) / -X (right); z lowers or raises them, y swings them
//          forward or back about the vertical
// VRM 0.x rigs face -Z in their own space. Turning a rotation 180 degrees about Y just
// negates its X and Z angles, which bodyRotation() does when rig.flip is set.

const TAU = Math.PI * 2;
const LAND_BEND = 0.55; // hip flexion (rad) at full landing squash; the knee bends twice that

export type Rig = {
  flip: boolean;
  forwardSign: number; // +1 if the rig faces +Z in its own space, -1 for VRM 0.x
  hips: THREE.Object3D;
  spine: THREE.Object3D;
  chest: THREE.Object3D;
  upperChest: THREE.Object3D;
  neck: THREE.Object3D;
  head: THREE.Object3D;
  leftShoulder: THREE.Object3D | null;
  rightShoulder: THREE.Object3D | null;
  leftUpperArm: THREE.Object3D;
  leftLowerArm: THREE.Object3D;
  leftHand: THREE.Object3D;
  rightUpperArm: THREE.Object3D;
  rightLowerArm: THREE.Object3D;
  rightHand: THREE.Object3D;
  leftUpperLeg: THREE.Object3D;
  leftLowerLeg: THREE.Object3D;
  leftFoot: THREE.Object3D;
  rightUpperLeg: THREE.Object3D;
  rightLowerLeg: THREE.Object3D;
  rightFoot: THREE.Object3D;
  rightFingers: THREE.Object3D[];
  hipsRest: THREE.Vector3; // normalized hips position in the T-pose
  legLength: number; // hip joint to ankle, meters
  torsoLength: number; // hips to neck, meters
};

const RIGHT_FINGERS: VRMHumanBoneName[] = [
  'rightThumbMetacarpal',
  'rightThumbProximal',
  'rightThumbDistal',
  'rightIndexProximal',
  'rightIndexIntermediate',
  'rightIndexDistal',
  'rightMiddleProximal',
  'rightMiddleIntermediate',
  'rightMiddleDistal',
  'rightRingProximal',
  'rightRingIntermediate',
  'rightRingDistal',
  'rightLittleProximal',
  'rightLittleIntermediate',
  'rightLittleDistal',
];

function bone(vrm: VRM, name: VRMHumanBoneName): THREE.Object3D {
  const node = vrm.humanoid.getNormalizedBoneNode(name);
  if (!node) throw new Error(`[vrm] model is missing humanoid bone "${name}"`);
  return node;
}

/** Collects the normalized bones the layers drive. Call before any animation runs (reads the rest pose). */
export function buildRig(vrm: VRM): Rig {
  const flip = vrm.meta.metaVersion === '0';
  const rightFingers: THREE.Object3D[] = [];
  for (const name of RIGHT_FINGERS) {
    const node = vrm.humanoid.getNormalizedBoneNode(name);
    if (node) rightFingers.push(node);
  }
  const spine = bone(vrm, 'spine');
  const chest = bone(vrm, 'chest');
  const upperChest = bone(vrm, 'upperChest');
  const neck = bone(vrm, 'neck');
  const leftLowerLeg = bone(vrm, 'leftLowerLeg');
  const leftFoot = bone(vrm, 'leftFoot');
  const torso = new THREE.Vector3().add(spine.position).add(chest.position).add(upperChest.position).add(neck.position);
  return {
    flip,
    forwardSign: flip ? -1 : 1,
    hips: bone(vrm, 'hips'),
    spine,
    chest,
    upperChest,
    neck,
    head: bone(vrm, 'head'),
    leftShoulder: vrm.humanoid.getNormalizedBoneNode('leftShoulder'),
    rightShoulder: vrm.humanoid.getNormalizedBoneNode('rightShoulder'),
    leftUpperArm: bone(vrm, 'leftUpperArm'),
    leftLowerArm: bone(vrm, 'leftLowerArm'),
    leftHand: bone(vrm, 'leftHand'),
    rightUpperArm: bone(vrm, 'rightUpperArm'),
    rightLowerArm: bone(vrm, 'rightLowerArm'),
    rightHand: bone(vrm, 'rightHand'),
    leftUpperLeg: bone(vrm, 'leftUpperLeg'),
    leftLowerLeg,
    leftFoot,
    rightUpperLeg: bone(vrm, 'rightUpperLeg'),
    rightLowerLeg: bone(vrm, 'rightLowerLeg'),
    rightFoot: bone(vrm, 'rightFoot'),
    rightFingers,
    hipsRest: bone(vrm, 'hips').position.clone(),
    legLength: leftLowerLeg.position.length() + leftFoot.position.length(),
    torsoLength: torso.length(),
  };
}

const _euler = new THREE.Euler();
const _q = new THREE.Quaternion();

/** Euler angles for a +Z-facing body, turned into a rotation in this rig's own space. */
function bodyRotation(rig: Rig, x: number, y: number, z: number, order: THREE.EulerOrder): THREE.Quaternion {
  const s = rig.flip ? -1 : 1;
  _euler.set(x * s, y, z * s, order);
  return _q.setFromEuler(_euler);
}

/** Adds a rotation on top of the current pose, in the bone's parent frame. */
function turn(rig: Rig, node: THREE.Object3D, x: number, y: number, z: number): void {
  node.quaternion.premultiply(bodyRotation(rig, x, y, z, 'XYZ'));
}

/** Blends the bone from its current pose toward a target given as body-space Euler angles. */
function blendToward(rig: Rig, node: THREE.Object3D, weight: number, x: number, y: number, z: number, order: THREE.EulerOrder = 'XYZ'): void {
  if (weight <= 0) return;
  node.quaternion.slerp(bodyRotation(rig, x, y, z, order), Math.min(1, weight));
}

/** Scales a rotation's angle by k (k > 1 extrapolates past it; Quaternion.slerp clamps at 1). */
function scaleRotation(q: THREE.Quaternion, k: number): void {
  if (q.w < 0) q.set(-q.x, -q.y, -q.z, -q.w);
  const half = Math.acos(Math.min(1, q.w));
  const s = Math.sin(half);
  if (s < 1e-6) return;
  const f = Math.sin(half * k) / s;
  q.set(q.x * f, q.y * f, q.z * f, Math.cos(half * k));
}

/**
 * Longer strides for sprinting: the thighs swing `stride` times further, the knees a
 * little more, and the hips sit slightly lower. Without foot IK the planted foot traces a
 * shallower arc, so a 1.3x swing covers only ~1.16-1.27x the ground (measured per model at
 * load) and contact gets shorter: a quick, tapping sprint instead of frantic cadence.
 */
export function applyStride(rig: Rig, stride: number): void {
  if (stride <= 1.001) return;
  scaleRotation(rig.leftUpperLeg.quaternion, stride);
  scaleRotation(rig.rightUpperLeg.quaternion, stride);
  // Measured on ren/haru/momo: scaling the knee as much as the thigh costs ground gain
  // (1.12x vs 1.19x on ren) for a slightly higher heel kick; a quarter of it is the balance.
  const knee = 1 + (stride - 1) * 0.25;
  scaleRotation(rig.leftLowerLeg.quaternion, knee);
  scaleRotation(rig.rightLowerLeg.quaternion, knee);
  // The longer swing lifts the foot at both ends of the stance; a small drop keeps the
  // mid-stance toe at ground level without sinking it.
  rig.hips.position.y -= rig.legLength * 0.12 * (stride - 1);
}

/** Extra forward lean when sprinting faster than the run clip was made for. */
export function applyLean(rig: Rig, lean: number): void {
  if (lean <= 0.001) return;
  turn(rig, rig.spine, lean * 0.6, 0, 0);
  turn(rig, rig.chest, lean * 0.4, 0, 0);
}

/** Knees bend and the hips drop on touchdown. Feet stay flat and under the hips. */
export function applyLanding(rig: Rig, land: number): void {
  if (land <= 0.001) return;
  const a = LAND_BEND * Math.min(1, land);
  turn(rig, rig.leftUpperLeg, -a, 0, 0);
  turn(rig, rig.rightUpperLeg, -a, 0, 0);
  turn(rig, rig.leftLowerLeg, 2 * a, 0, 0);
  turn(rig, rig.rightLowerLeg, 2 * a, 0, 0);
  turn(rig, rig.leftFoot, -a, 0, 0);
  turn(rig, rig.rightFoot, -a, 0, 0);
  turn(rig, rig.spine, a * 0.45, 0, 0);
  rig.hips.position.y -= rig.legLength * (1 - Math.cos(a));
}

/**
 * Airborne: knees tuck and arms go out. `rise` is 1 while going up fast and 0 while
 * falling, so the legs reach down for the landing on the way down.
 */
export function applyAir(rig: Rig, air: number, rise: number): void {
  if (air <= 0.001) return;
  const r = rise;
  blendToward(rig, rig.hips, air, 0.05, 0, 0);
  rig.hips.position.y += (rig.hipsRest.y - rig.hips.position.y) * Math.min(1, air);
  blendToward(rig, rig.spine, air, 0.06, 0, 0);
  blendToward(rig, rig.leftUpperLeg, air, lerp(-0.35, -1.1, r), 0, 0.06);
  blendToward(rig, rig.leftLowerLeg, air, lerp(0.55, 1.55, r), 0, 0);
  blendToward(rig, rig.rightUpperLeg, air, lerp(-0.05, -0.4, r), 0, -0.06);
  blendToward(rig, rig.rightLowerLeg, air, lerp(0.4, 1.0, r), 0, 0);
  blendToward(rig, rig.leftFoot, air, 0.35, 0, 0);
  blendToward(rig, rig.rightFoot, air, 0.35, 0, 0);
  blendToward(rig, rig.leftUpperArm, air, 0, lerp(-0.15, -0.45, r), lerp(-0.25, -0.75, r), 'YZX');
  blendToward(rig, rig.rightUpperArm, air, 0, lerp(0.15, 0.45, r), lerp(0.25, 0.75, r), 'YZX');
  blendToward(rig, rig.leftLowerArm, air, 0, -0.5, 0);
  blendToward(rig, rig.rightLowerArm, air, 0, 0.5, 0);
}

/** Elbow bend through one crawl stroke: bent on the recovery over the water, long on the pull. */
function crawlElbow(armAngle: number): number {
  const s = Math.sin(armAngle);
  return s > 0 ? 0.25 + 1.0 * s : 0.25;
}

/**
 * Front crawl. The body lies forward from the hips with the shoulders at `waterline`
 * (meters above the root), each arm turns a full circle half a turn apart, legs flutter.
 * `phase` counts strokes (0..1 per stroke); `move` is 0 when floating in place, 1 at swim speed.
 */
export function applySwim(rig: Rig, swim: number, phase: number, move: number, waterline: number): void {
  if (swim <= 0.001) return;
  const w = Math.min(1, swim);
  const pitch = lerp(0.5, 1.2, move);
  const cycle = phase * TAU;
  const roll = Math.sin(cycle) * 0.22 * move;

  blendToward(rig, rig.hips, w, pitch, roll, 0);
  const hipsY = waterline - 0.08 - rig.torsoLength * Math.cos(pitch);
  const hipsZ = rig.hipsRest.z - rig.forwardSign * 0.3 * Math.sin(pitch);
  rig.hips.position.y += (hipsY - rig.hips.position.y) * w;
  rig.hips.position.z += (hipsZ - rig.hips.position.z) * w;
  blendToward(rig, rig.spine, w, -0.05, 0, 0);
  blendToward(rig, rig.chest, w, -0.05, 0, 0);
  blendToward(rig, rig.upperChest, w, 0, 0, 0);
  blendToward(rig, rig.neck, w, -pitch * 0.35, -roll * 0.5, 0);
  blendToward(rig, rig.head, w, -pitch * 0.4, -roll * 0.5, 0);

  const left = cycle;
  const right = cycle + Math.PI;
  if (rig.leftShoulder) blendToward(rig, rig.leftShoulder, w, 0, 0, 0);
  if (rig.rightShoulder) blendToward(rig, rig.rightShoulder, w, 0, 0, 0);
  blendToward(rig, rig.leftUpperArm, w, left, 0, -Math.PI / 2);
  blendToward(rig, rig.rightUpperArm, w, right, 0, Math.PI / 2);
  blendToward(rig, rig.leftLowerArm, w, 0, -crawlElbow(left), 0);
  blendToward(rig, rig.rightLowerArm, w, 0, crawlElbow(right), 0);
  blendToward(rig, rig.leftHand, w, 0, 0, 0);
  blendToward(rig, rig.rightHand, w, 0, 0, 0);

  const kick = cycle * 3;
  const size = 0.3 * (0.4 + 0.6 * move);
  blendToward(rig, rig.leftUpperLeg, w, Math.sin(kick) * size + 0.08, 0, 0.04);
  blendToward(rig, rig.rightUpperLeg, w, -Math.sin(kick) * size + 0.08, 0, -0.04);
  blendToward(rig, rig.leftLowerLeg, w, 0.25 + 0.25 * Math.max(0, Math.sin(kick + 1.2)), 0, 0);
  blendToward(rig, rig.rightLowerLeg, w, 0.25 + 0.25 * Math.max(0, -Math.sin(kick + 1.2)), 0, 0);
  blendToward(rig, rig.leftFoot, w, 0.85, 0, 0);
  blendToward(rig, rig.rightFoot, w, 0.85, 0, 0);
}

/**
 * Thunderclap dive: the body pitches into the drop and both arms thrust forward and
 * down toward the landing spot (about 20 degrees below horizontal), legs trailing.
 */
export function applyDive(rig: Rig, dive: number): void {
  if (dive <= 0.001) return;
  blendToward(rig, rig.hips, dive, 0.2, 0, 0);
  blendToward(rig, rig.spine, dive, 0.2, 0, 0);
  blendToward(rig, rig.chest, dive, 0.1, 0, 0);
  blendToward(rig, rig.neck, dive, -0.2, 0, 0);
  blendToward(rig, rig.head, dive, -0.15, 0, 0);
  if (rig.leftShoulder) blendToward(rig, rig.leftShoulder, dive, 0, 0, 0);
  if (rig.rightShoulder) blendToward(rig, rig.rightShoulder, dive, 0, 0, 0);
  blendToward(rig, rig.leftUpperArm, dive, 0, -1.35, -0.35, 'YZX');
  blendToward(rig, rig.rightUpperArm, dive, 0, 1.35, 0.35, 'YZX');
  blendToward(rig, rig.leftLowerArm, dive, 0, -0.1, 0);
  blendToward(rig, rig.rightLowerArm, dive, 0, 0.1, 0);
  blendToward(rig, rig.leftHand, dive, 0, 0, 0);
  blendToward(rig, rig.rightHand, dive, 0, 0, 0);
  blendToward(rig, rig.leftUpperLeg, dive, 0.15, 0, 0.04);
  blendToward(rig, rig.rightUpperLeg, dive, 0.05, 0, -0.04);
  blendToward(rig, rig.leftLowerLeg, dive, 0.45, 0, 0);
  blendToward(rig, rig.rightLowerLeg, dive, 0.25, 0, 0);
  blendToward(rig, rig.leftFoot, dive, 0.5, 0, 0);
  blendToward(rig, rig.rightFoot, dive, 0.5, 0, 0);
}

/**
 * Spell cast: the torso turns the right shoulder forward and the right arm thrusts
 * straight out along the facing (+Z) at shoulder height, palm open and forward.
 * The arm's aim compensates for the torso twist so it points along the facing.
 */
export function applyCast(rig: Rig, cast: number): void {
  if (cast <= 0.001) return;
  const k = Math.min(1, cast);
  const twist = 0.34 * k;
  turn(rig, rig.spine, 0, twist * 0.3, 0);
  turn(rig, rig.chest, 0, twist * 0.35, 0);
  turn(rig, rig.upperChest, 0, twist * 0.35, 0);
  turn(rig, rig.neck, 0, -twist * 0.5, 0);
  turn(rig, rig.head, 0, -twist * 0.5, 0);

  if (rig.rightShoulder) blendToward(rig, rig.rightShoulder, k, 0, 0, 0);
  blendToward(rig, rig.rightUpperArm, k, 0, Math.PI / 2 - 0.34, -0.06, 'YZX');
  blendToward(rig, rig.rightLowerArm, k, 0, 0, 0);
  blendToward(rig, rig.rightHand, k, 0, 0, -1.05);
  for (const finger of rig.rightFingers) blendToward(rig, finger, k * 0.85, 0, 0, 0);

  blendToward(rig, rig.leftUpperArm, k * 0.6, 0, 0.3, -1.2, 'YZX');
  blendToward(rig, rig.leftLowerArm, k * 0.6, 0, -0.6, 0);
}
