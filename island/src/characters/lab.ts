import * as THREE from 'three';
import { MToonMaterial } from '@pixiv/three-vrm';
import { createRenderer } from '../render';
import { PRESETS } from '../quality';
import type { AvatarPose } from '../player/avatar';
import { ROSTER, characterById, type CharacterDef } from './roster';
import { VrmAvatar, type ExpressionName } from './vrmAvatar';

// Character lab (tools/character-lab.html): all six characters side by side on grass,
// lit like the game (same hemisphere + sun, same renderer and post chain). Everything
// is drivable through window.__lab for scripts/lab-shots.mjs.

const SUN_DIR = new THREE.Vector3(0.6, 0.55, 0.5).normalize(); // src/world/sky.ts sunDir
const SPACING = 1.2;

type Slot = {
  def: CharacterDef;
  avatar: VrmAvatar;
  pose: AvatarPose;
  home: THREE.Vector3;
  reloading: boolean; // disposed and waiting for its replacement: skip it
};

type SlipResult = {
  id: string;
  speed: number;
  seconds: number;
  plantedSamples: number;
  meanSlip: number; // m/s a planted foot moves over the ground
  slipRatio: number; // meanSlip / speed
};

type SlipProbe = {
  slot: Slot;
  speed: number;
  startTime: number; // samples start after the blend has settled
  endTime: number;
  t: number[];
  feet: { y: number[]; z: number[] }[];
  resolve: (r: SlipResult) => void;
};

function element(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`[lab] #${id} missing from character-lab.html`);
  return el;
}

function restPose(): AvatarPose {
  return { speed: 0, grounded: true, vy: 0, swimming: false, cast: 0, land: 0, dive: false };
}

const app = element('app');
const hud = element('hud');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#b9d7f0');
scene.fog = new THREE.Fog('#c3dcf0', 260, 1900);
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.05, 500);
const view = createRenderer(app, scene, camera, { ...PRESETS.high, pixelRatio: 2 });
view.resize();

const hemi = new THREE.HemisphereLight('#d4e9ff', '#5d6b3c', 1.3);
const sun = new THREE.DirectionalLight('#fff1d6', 2.9);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -48;
sun.shadow.camera.right = 48;
sun.shadow.camera.top = 48;
sun.shadow.camera.bottom = -48;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 420;
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.05;
sun.position.copy(SUN_DIR).multiplyScalar(180);
sun.target.position.set(0, 0, 0);
scene.add(hemi, sun, sun.target);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(90, 72).rotateX(-Math.PI / 2),
  new THREE.MeshStandardMaterial({ color: '#79a54c', roughness: 1, metalness: 0 }),
);
ground.receiveShadow = true;
scene.add(ground);

// Stand-in sea for checking the swim pose: the Player floats its feet 1.05 m below the
// surface (FLOAT_Y = -1.05 in player.ts, sea at y = 0), so the surface sits 1.05 m above
// a swimming character's root.
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 12).rotateX(-Math.PI / 2),
  new THREE.MeshStandardMaterial({ color: '#1f6f99', roughness: 0.25, transparent: true, opacity: 0.82, depthWrite: false }),
);
water.position.y = 1.05;
water.visible = false;
scene.add(water);

const slots: Slot[] = [];
let paused = false;
let fixedDt: number | null = null;
let timeScale = 1;
let animTime = 0;
let probe: SlipProbe | null = null;
const tmp = new THREE.Vector3();

function slotFor(id: string): Slot {
  const slot = slots.find((s) => s.def.id === id);
  if (!slot) throw new Error(`[lab] no character "${id}" loaded (have: ${slots.map((s) => s.def.id).join(', ')})`);
  return slot;
}

function setCamera(px: number, py: number, pz: number, tx: number, ty: number, tz: number, fov = 35): void {
  camera.position.set(px, py, pz);
  camera.fov = fov;
  camera.updateProjectionMatrix();
  camera.lookAt(tx, ty, tz);
}

/** Same placement math as CameraRig.update (src/camera.ts), minus terrain checks. */
function setGameCamera(id: string, yaw: number, pitch = -0.22, dist = 8.5): void {
  const p = slotFor(id).avatar.root.position;
  const cp = Math.cos(pitch);
  const fx = -Math.sin(yaw) * cp;
  const fy = Math.sin(pitch);
  const fz = -Math.cos(yaw) * cp;
  const ax = p.x + Math.cos(yaw) * 0.55;
  const ay = p.y + 1.55;
  const az = p.z - Math.sin(yaw) * 0.55;
  setCamera(ax - fx * dist, ay - fy * dist, az - fz * dist, ax, ay, az, 60);
  camera.lookAt(ax - fx * dist + fx * 10, ay - fy * dist + fy * 10, az - fz * dist + fz * 10);
}

function memory(): { geometries: number; textures: number; programs: number } {
  const info = view.renderer.info;
  return { geometries: info.memory.geometries, textures: info.memory.textures, programs: info.programs?.length ?? -1 };
}

function sampleProbe(): void {
  if (!probe || animTime < probe.startTime) return;
  const avatar = probe.slot.avatar;
  probe.t.push(animTime);
  const names = ['leftToes', 'rightToes'] as const;
  for (let f = 0; f < 2; f++) {
    const node = avatar.vrm.humanoid.getNormalizedBoneNode(names[f]);
    if (!node) throw new Error(`[lab] ${avatar.def.id} has no ${names[f]}`);
    node.getWorldPosition(tmp);
    avatar.root.worldToLocal(tmp);
    probe.feet[f].y.push(tmp.y);
    probe.feet[f].z.push(tmp.z);
  }
  if (animTime < probe.endTime) return;

  // A planted foot should move backward under the body at exactly the travel speed.
  const slips: number[] = [];
  for (const foot of probe.feet) {
    const minY = Math.min(...foot.y);
    for (let i = 0; i + 1 < probe.t.length; i++) {
      // Same planted test as measureGait: low AND moving backward under the body
      // (the swinging toe dips to ~1.5 cm mid-swing, so height alone is not enough).
      const low = foot.y[i] < minY + 0.02 && foot.y[i + 1] < minY + 0.02;
      const dt = probe.t[i + 1] - probe.t[i];
      if (!low || dt <= 0) continue;
      const relative = (foot.z[i + 1] - foot.z[i]) / dt;
      if (relative >= 0) continue;
      slips.push(Math.abs(probe.speed + relative));
    }
  }
  const meanSlip = slips.reduce((a, b) => a + b, 0) / Math.max(1, slips.length);
  const result: SlipResult = {
    id: avatar.def.id,
    speed: probe.speed,
    seconds: Number((probe.t[probe.t.length - 1] - probe.t[0]).toFixed(2)),
    plantedSamples: slips.length,
    meanSlip: Number(meanSlip.toFixed(3)),
    slipRatio: Number((meanSlip / Math.max(1e-6, probe.speed)).toFixed(3)),
  };
  console.info(`[lab] foot slip ${result.id} @ ${result.speed} m/s: ${result.meanSlip} m/s (${(result.slipRatio * 100).toFixed(1)}%)`);
  const done = probe.resolve;
  probe = null;
  done(result);
}

function advance(dt: number): void {
  animTime += dt;
  for (const slot of slots) {
    if (!slot.reloading) slot.avatar.animate(dt, slot.pose);
  }
  sampleProbe();
}

function updateHud(): void {
  if (hud.style.display === 'none') return;
  const lines = slots.map((s) => {
    const st = s.avatar.stats;
    return `${s.def.name.padEnd(14)} ${String(st.loadMs).padStart(5)} ms  ${String(st.triangles).padStart(6)} tris  ${String(st.drawCalls).padStart(3)} calls  ${st.height.toFixed(2)} m`;
  });
  const info = view.renderer.info.render;
  hud.textContent = `Character lab  ${info.calls} calls, ${info.triangles.toLocaleString()} tris this frame\n${lines.join('\n')}`;
}

let last = performance.now();
let hudClock = 0;
function frame(now: number): void {
  requestAnimationFrame(frame);
  const raw = Math.min((now - last) / 1000, 1 / 20);
  last = now;
  if (!paused) advance((fixedDt ?? raw) * timeScale);
  view.render();
  hudClock += raw;
  if (hudClock > 0.5) {
    hudClock = 0;
    updateHud();
  }
}

const lab = {
  ready: false,
  error: null as string | null,
  ids: ROSTER.map((d) => d.id),
  stats() {
    return slots.map((s) => ({ id: s.def.id, name: s.def.name, ...s.avatar.stats }));
  },
  gait(id: string) {
    return slotFor(id).avatar.gait;
  },
  /** The VrmAvatar itself, for poking at from the console. */
  avatar(id: string) {
    return slotFor(id).avatar;
  },
  pose(id: string, changes: Partial<AvatarPose>) {
    Object.assign(slotFor(id).pose, changes);
  },
  poseAll(changes: Partial<AvatarPose>) {
    for (const s of slots) Object.assign(s.pose, changes);
  },
  resetPoses() {
    for (const s of slots) Object.assign(s.pose, restPose());
  },
  /** Shows only these characters (null: all). */
  only(ids: string[] | null) {
    for (const s of slots) s.avatar.root.visible = ids === null || ids.includes(s.def.id);
  },
  place(id: string, x: number, z: number, yaw: number) {
    const root = slotFor(id).avatar.root;
    root.position.set(x, 0, z);
    root.rotation.y = yaw;
  },
  home() {
    for (const s of slots) {
      s.avatar.root.position.copy(s.home);
      s.avatar.root.rotation.y = 0;
    }
  },
  camera: setCamera,
  gameCamera: setGameCamera,
  pause(on: boolean) {
    paused = on;
  },
  /** Fixed animation step per rendered frame (null: real time). Makes captures repeatable. */
  fixedStep(dt: number | null) {
    fixedDt = dt;
  },
  /** Advances n frames of `dt` seconds while paused. */
  step(n: number, dt = 1 / 60) {
    for (let i = 0; i < n; i++) advance(dt);
  },
  timeScale(x: number) {
    timeScale = x;
  },
  lights(hemiIntensity: number, sunIntensity: number) {
    hemi.intensity = hemiIntensity;
    sun.intensity = sunIntensity;
    console.info(`[lab] lights: hemisphere ${hemiIntensity}, sun ${sunIntensity}`);
  },
  water(on: boolean) {
    water.visible = on;
  },
  bloom(on: boolean) {
    view.bloom.enabled = on;
  },
  outlines(on: boolean) {
    for (const s of slots) {
      s.avatar.root.traverse((obj) => {
        const material = (obj as THREE.Mesh).material;
        if (!Array.isArray(material)) return;
        for (const m of material) if (m instanceof MToonMaterial && m.isOutline) m.visible = on;
      });
    }
  },
  expression(id: string, name: ExpressionName, seconds: number) {
    slotFor(id).avatar.setExpression(name, seconds);
  },
  /** Root-space [x, y, z] of left toes, left ankle, right toes, right ankle (+Z is forward). */
  feet(id: string) {
    const avatar = slotFor(id).avatar;
    const names = ['leftToes', 'leftFoot', 'rightToes', 'rightFoot'] as const;
    return names.map((name) => {
      const node = avatar.vrm.humanoid.getNormalizedBoneNode(name);
      if (!node) throw new Error(`[lab] ${id} has no ${name}`);
      return avatar.root.worldToLocal(node.getWorldPosition(new THREE.Vector3())).toArray();
    });
  },
  handR(id: string) {
    return slotFor(id).avatar.handR.getWorldPosition(new THREE.Vector3()).toArray();
  },
  hud(on: boolean) {
    hud.style.display = on ? '' : 'none';
  },
  frameInfo() {
    const r = view.renderer.info.render;
    return { calls: r.calls, triangles: r.triangles };
  },
  memory,
  /** Average cost of one animate() call (mixer + pose layers + vrm.update), in ms. */
  benchmark(id: string, frames = 600) {
    const slot = slotFor(id);
    const wasPaused = paused;
    paused = true;
    const pose: AvatarPose = { ...restPose(), speed: 6.5 };
    const t0 = performance.now();
    for (let i = 0; i < frames; i++) slot.avatar.animate(1 / 60, pose);
    const ms = (performance.now() - t0) / frames;
    paused = wasPaused;
    console.info(`[lab] ${id} animate(): ${ms.toFixed(3)} ms per frame over ${frames} frames (running)`);
    return Number(ms.toFixed(3));
  },
  /** Moves the character at `speed` (in place) for `seconds` and reports how much planted feet slide. */
  measureSlip(id: string, speed: number, seconds = 2): Promise<SlipResult> {
    if (probe) throw new Error('[lab] a slip measurement is already running');
    const slot = slotFor(id);
    slot.pose.speed = speed;
    slot.pose.grounded = true;
    return new Promise((resolve) => {
      const startTime = animTime + 0.5;
      probe = { slot, speed, startTime, endTime: startTime + seconds, t: [], feet: [{ y: [], z: [] }, { y: [], z: [] }], resolve };
    });
  },
  /** Disposes a character, loads it again into the same spot, and reports GPU memory at each step. */
  async reload(id: string) {
    const slot = slotFor(id);
    view.render();
    const before = memory();
    slot.reloading = true;
    slot.avatar.dispose();
    view.render();
    const afterDispose = memory();
    const avatar = await VrmAvatar.load(characterById(id));
    avatar.root.position.copy(slot.home);
    scene.add(avatar.root);
    slot.avatar = avatar;
    slot.reloading = false;
    view.render();
    const afterReload = memory();
    console.info(`[lab] reload ${id}: before ${JSON.stringify(before)} after dispose ${JSON.stringify(afterDispose)} after reload ${JSON.stringify(afterReload)}`);
    return { before, afterDispose, afterReload, loadMs: avatar.stats.loadMs, animMs: avatar.stats.animMs };
  },
};
(window as unknown as { __lab: typeof lab }).__lab = lab;

async function loadAll(): Promise<void> {
  const t0 = performance.now();
  for (let i = 0; i < ROSTER.length; i++) {
    const def = ROSTER[i];
    hud.textContent = `Loading ${def.name} (${i + 1}/${ROSTER.length})...`;
    const avatar = await VrmAvatar.load(def);
    const home = new THREE.Vector3((i - (ROSTER.length - 1) / 2) * SPACING, 0, 0);
    avatar.root.position.copy(home);
    scene.add(avatar.root);
    slots.push({ def, avatar, pose: restPose(), home, reloading: false });
  }
  // Compile every shader before the first visible frame so timing logs stay honest.
  const tc = performance.now();
  await view.renderer.compileAsync(scene, camera);
  console.info(`[lab] ${slots.length} characters in ${(performance.now() - t0).toFixed(0)} ms (shader compile ${(performance.now() - tc).toFixed(0)} ms)`);
  lab.ready = true;
  updateHud();
}

setCamera(3.4, 1.55, 6.2, -0.2, 0.95, 0);
requestAnimationFrame(frame);
loadAll().catch((err: unknown) => {
  const message = err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err);
  console.error('[lab] failed', err);
  lab.error = message;
  hud.classList.add('error');
  hud.textContent = `Character lab failed\n\n${message}`;
});
