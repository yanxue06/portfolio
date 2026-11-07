import * as THREE from 'three';
import { clamp, damp } from '../util/math';

// The player character: a traveler in a teal jacket with a long red scarf and a
// satchel for the card binder. Built from primitives, toon-shaded, with an
// inverted-hull outline so it reads clearly against the grass.

const OUTLINE = 0.018;

let gradientMap: THREE.DataTexture | null = null;
function toonGradient(): THREE.DataTexture {
  if (gradientMap) return gradientMap;
  const data = new Uint8Array([110, 190, 255]);
  gradientMap = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.needsUpdate = true;
  return gradientMap;
}

const outlineMaterial = new THREE.MeshBasicMaterial({ color: '#1d1a26', side: THREE.BackSide });
outlineMaterial.onBeforeCompile = (shader) => {
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `vec3 transformed = vec3(position) + normal * ${OUTLINE.toFixed(4)};`,
  );
};

const materials = new Map<string, THREE.MeshToonMaterial>();
function toon(color: string): THREE.MeshToonMaterial {
  let m = materials.get(color);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: toonGradient() });
    materials.set(color, m);
  }
  return m;
}

function part(geo: THREE.BufferGeometry, color: string, outline = true): THREE.Mesh {
  const mesh = new THREE.Mesh(geo, toon(color));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (outline) {
    const shell = new THREE.Mesh(geo, outlineMaterial);
    shell.castShadow = false;
    mesh.add(shell);
  }
  return mesh;
}

/** Capsule whose top cap sits at the origin, hanging down -y (for limbs). */
function limbGeo(radius: number, length: number): THREE.BufferGeometry {
  const g = new THREE.CapsuleGeometry(radius, length, 6, 12);
  g.translate(0, -(length / 2 + radius), 0);
  return g;
}

const COLORS = {
  jacket: '#1f9e89',
  jacketDark: '#17796a',
  pants: '#2f3550',
  skin: '#f3c9a6',
  hair: '#2d2433',
  scarf: '#e5484d',
  leather: '#7a4b2a',
  boot: '#4a2f1e',
  eye: '#1b1b2a',
  blush: '#f2a3a3',
  gold: '#e8b84a',
};

export type AvatarPose = {
  speed: number; // horizontal speed m/s
  grounded: boolean;
  vy: number;
  swimming: boolean;
  cast: number; // 0..1, right arm thrown forward
  land: number; // 0..1, landing squash
  dive: boolean;
};

export class Avatar {
  readonly root = new THREE.Group();
  private readonly body = new THREE.Group();
  private readonly hips = new THREE.Group();
  private readonly torso = new THREE.Group();
  private readonly head = new THREE.Group();
  private readonly armL = new THREE.Group();
  private readonly armR = new THREE.Group();
  private readonly elbowL = new THREE.Group();
  private readonly elbowR = new THREE.Group();
  private readonly legL = new THREE.Group();
  private readonly legR = new THREE.Group();
  private readonly kneeL = new THREE.Group();
  private readonly kneeR = new THREE.Group();
  private readonly scarfTail = new THREE.Group();
  readonly handR = new THREE.Object3D();
  private phase = 0;
  private time = 0;
  private air = 0;
  private swim = 0;

  constructor() {
    this.root.name = 'avatar';
    this.root.add(this.body);
    this.body.add(this.hips);
    this.hips.position.y = 0.86;

    // Pelvis + torso
    const pelvis = part(new THREE.CapsuleGeometry(0.21, 0.08, 6, 14), COLORS.pants);
    pelvis.scale.set(1.05, 1, 0.8);
    pelvis.position.y = 0.02;
    this.hips.add(pelvis);

    this.hips.add(this.torso);
    this.torso.position.y = 0.06;
    const chest = part(new THREE.CapsuleGeometry(0.25, 0.3, 6, 16), COLORS.jacket);
    chest.scale.set(1, 1, 0.78);
    chest.position.y = 0.3;
    this.torso.add(chest);

    const belt = part(new THREE.CylinderGeometry(0.235, 0.235, 0.07, 18), COLORS.leather, false);
    belt.scale.set(1, 1, 0.82);
    belt.position.y = 0.02;
    this.torso.add(belt);

    const strap = part(new THREE.BoxGeometry(0.06, 0.62, 0.02), COLORS.leather, false);
    strap.position.set(0, 0.3, 0.2);
    strap.rotation.z = 0.72;
    this.torso.add(strap);

    const satchel = part(new THREE.BoxGeometry(0.1, 0.24, 0.3), COLORS.leather);
    satchel.position.set(0.29, 0.02, 0.0);
    this.torso.add(satchel);
    const binder = part(new THREE.BoxGeometry(0.035, 0.2, 0.24), COLORS.gold, false);
    binder.position.set(0.345, 0.04, 0.0);
    this.torso.add(binder);

    const hood = part(new THREE.SphereGeometry(0.2, 14, 10), COLORS.jacketDark);
    hood.scale.set(1.35, 0.62, 0.85);
    hood.position.set(0, 0.6, -0.15);
    this.torso.add(hood);

    // Scarf: a ring around the neck plus a tail that streams behind.
    const scarf = part(new THREE.TorusGeometry(0.17, 0.065, 8, 20), COLORS.scarf);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 0.6;
    this.torso.add(scarf);
    this.scarfTail.position.set(0.06, 0.6, -0.17);
    this.torso.add(this.scarfTail);
    const tailGeo = new THREE.BoxGeometry(0.13, 0.62, 0.04);
    tailGeo.translate(0, -0.31, 0);
    const tail = part(tailGeo, COLORS.scarf);
    this.scarfTail.add(tail);

    // Head
    this.torso.add(this.head);
    this.head.position.y = 0.62;
    const skull = part(new THREE.SphereGeometry(0.25, 20, 16), COLORS.skin);
    skull.position.y = 0.13;
    this.head.add(skull);
    const hair = part(new THREE.SphereGeometry(0.268, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.56), COLORS.hair);
    hair.position.set(0, 0.15, -0.015);
    hair.rotation.x = -0.18;
    this.head.add(hair);
    const fringe = part(new THREE.CapsuleGeometry(0.06, 0.2, 4, 8), COLORS.hair);
    fringe.position.set(-0.07, 0.29, 0.19);
    fringe.rotation.set(0.3, 0, 1.15);
    this.head.add(fringe);
    for (const side of [-1, 1]) {
      const eye = part(new THREE.SphereGeometry(0.036, 10, 8), COLORS.eye, false);
      eye.scale.set(0.8, 1.25, 0.6);
      eye.position.set(side * 0.085, 0.12, 0.228);
      this.head.add(eye);
      const blush = part(new THREE.SphereGeometry(0.04, 10, 8), COLORS.blush, false);
      blush.scale.set(1.2, 0.6, 0.3);
      blush.position.set(side * 0.15, 0.06, 0.2);
      this.head.add(blush);
    }

    // Arms
    for (const [arm, elbow, side] of [
      [this.armL, this.elbowL, 1],
      [this.armR, this.elbowR, -1],
    ] as const) {
      arm.position.set(side * 0.33, 0.5, 0);
      this.torso.add(arm);
      arm.add(part(limbGeo(0.085, 0.22), COLORS.jacket));
      elbow.position.y = -0.38;
      arm.add(elbow);
      elbow.add(part(limbGeo(0.075, 0.2), COLORS.jacket));
      const hand = part(new THREE.SphereGeometry(0.075, 12, 10), COLORS.skin);
      hand.position.y = -0.37;
      elbow.add(hand);
      if (side === -1) {
        this.handR.position.y = -0.4;
        elbow.add(this.handR);
      }
    }

    // Legs
    for (const [leg, knee, side] of [
      [this.legL, this.kneeL, 1],
      [this.legR, this.kneeR, -1],
    ] as const) {
      leg.position.set(side * 0.12, 0, 0);
      this.hips.add(leg);
      leg.add(part(limbGeo(0.1, 0.24), COLORS.pants));
      knee.position.y = -0.42;
      leg.add(knee);
      knee.add(part(limbGeo(0.09, 0.26), COLORS.pants));
      const boot = part(new THREE.BoxGeometry(0.17, 0.14, 0.28), COLORS.boot);
      boot.position.set(0, -0.4, 0.04);
      knee.add(boot);
    }
  }

  /** Procedural animation: walk/run cycle, jump tuck, swim, cast. */
  animate(dt: number, pose: AvatarPose): void {
    this.time += dt;
    const t = this.time;
    const run = clamp(pose.speed / 6.5, 0, 1.7);
    this.phase += dt * (2.2 + pose.speed * 1.15);
    this.air = damp(this.air, pose.grounded || pose.swimming ? 0 : 1, 14, dt);
    this.swim = damp(this.swim, pose.swimming ? 1 : 0, 6, dt);

    const s = Math.sin(this.phase);
    const c = Math.cos(this.phase);
    const stride = Math.min(run, 1.25) * 0.72;

    // Ground cycle
    let legL = s * stride;
    let legR = -s * stride;
    let kneeL = Math.max(0, -c) * stride * 1.3 + 0.05;
    let kneeR = Math.max(0, c) * stride * 1.3 + 0.05;
    let armL = -s * stride * 0.85;
    let armR = s * stride * 0.85;
    let elbow = -0.25 - run * 0.35;
    let bob = Math.abs(s) * 0.055 * Math.min(run, 1.2) - 0.02 * run;
    let lean = run * 0.12;
    const breathe = Math.sin(t * 2.1) * 0.012 * (1 - Math.min(run, 1));

    // Air pose: blend toward a tucked jump.
    const rising = clamp(pose.vy / 8, -1, 1);
    legL = legL * (1 - this.air) + this.air * -(0.55 + rising * 0.2);
    legR = legR * (1 - this.air) + this.air * 0.25;
    kneeL = kneeL * (1 - this.air) + this.air * 0.9;
    kneeR = kneeR * (1 - this.air) + this.air * 0.5;
    armL = armL * (1 - this.air) + this.air * -0.6;
    armR = armR * (1 - this.air) + this.air * -0.6;
    elbow = elbow * (1 - this.air) + this.air * -0.9;
    bob = bob * (1 - this.air);
    if (pose.dive) {
      legL = -0.2;
      legR = -0.2;
      kneeL = 0.2;
      kneeR = 0.2;
      armL = -2.6;
      armR = -2.6;
      elbow = -0.1;
    }

    // Landing squash
    bob -= pose.land * 0.16;
    kneeL += pose.land * 0.6;
    kneeR += pose.land * 0.6;
    legL -= pose.land * 0.35;
    legR -= pose.land * 0.35;

    // Swim: body horizontal, breaststroke arms, flutter legs.
    if (this.swim > 0.01) {
      const w = this.swim;
      const stroke = Math.sin(t * 4.2);
      legL = legL * (1 - w) + w * Math.sin(t * 8) * 0.35;
      legR = legR * (1 - w) + w * -Math.sin(t * 8) * 0.35;
      armL = armL * (1 - w) + w * (-2.4 + stroke * 0.7);
      armR = armR * (1 - w) + w * (-2.4 + stroke * 0.7);
      lean = lean * (1 - w) + w * 1.15;
    }

    this.legL.rotation.x = legL;
    this.legR.rotation.x = legR;
    this.kneeL.rotation.x = kneeL;
    this.kneeR.rotation.x = kneeR;
    this.armL.rotation.x = armL;
    this.armR.rotation.x = armR;
    this.armL.rotation.z = 0.12 + this.air * 0.45;
    this.armR.rotation.z = -0.12 - this.air * 0.45;
    this.elbowL.rotation.x = elbow;
    this.elbowR.rotation.x = elbow;

    // Cast overrides the right arm: thrown straight forward.
    if (pose.cast > 0.001) {
      const k = pose.cast;
      this.armR.rotation.x = this.armR.rotation.x * (1 - k) + -1.55 * k;
      this.armR.rotation.z = this.armR.rotation.z * (1 - k) + 0.1 * k;
      this.elbowR.rotation.x = this.elbowR.rotation.x * (1 - k) + -0.05 * k;
      this.torso.rotation.y = -0.35 * k;
    } else {
      this.torso.rotation.y = 0;
    }

    this.hips.position.y = 0.86 + bob;
    this.body.rotation.x = lean;
    this.body.position.y = this.swim * -0.55;
    this.torso.scale.y = 1 + breathe;
    this.head.rotation.x = -lean * 0.6 + Math.sin(t * 1.3) * 0.02;
    this.scarfTail.rotation.x = 0.35 + Math.min(pose.speed, 12) * 0.09 + Math.sin(t * 9 + this.phase) * 0.12 * run + this.air * 0.5;
    this.scarfTail.rotation.z = Math.sin(t * 5.3) * 0.08 * (0.3 + run);
  }
}
