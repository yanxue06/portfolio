import * as THREE from 'three';
import { radialTexture } from './fx';
import { clamp, damp } from './util/math';
import { foeCenter, foesNear, type Foe } from './foes';
import type { Game } from './game';

// Spell cards. One table describes every spell; cast() dispatches on the id.

export type SpellId = 'spark' | 'skip' | 'ward' | 'lodestar' | 'clap' | 'homeward';

export type SpellDef = {
  id: SpellId;
  name: string;
  keys: string[];
  keyLabel: string;
  cost: number;
  cooldown: number;
  color: string;
  blurb: string;
};

export const SPELLS: SpellDef[] = [
  { id: 'spark', name: 'Spark Shot', keys: ['Digit1'], keyLabel: 'LMB', cost: 6, cooldown: 0.22, color: '#7fe9ff', blurb: 'A bolt of aura that curves toward critters and monsters.' },
  { id: 'skip', name: 'Skip', keys: ['KeyQ', 'Digit2'], keyLabel: 'Q', cost: 18, cooldown: 0.9, color: '#c39bff', blurb: 'Blink 13m where you look. Refreshes your air jump.' },
  { id: 'ward', name: 'Bubble Ward', keys: ['KeyE', 'Digit3'], keyLabel: 'E', cost: 30, cooldown: 9, color: '#8cffc1', blurb: 'Five seconds where nothing hurts, critters bounce off and shots fly back.' },
  { id: 'lodestar', name: 'Lodestar', keys: ['KeyR', 'Digit4'], keyLabel: 'R', cost: 25, cooldown: 7, color: '#ffd36b', blurb: 'Pulls every card within 45m into your hands.' },
  { id: 'clap', name: 'Thunderclap', keys: ['KeyF', 'Digit5'], keyLabel: 'F', cost: 32, cooldown: 4, color: '#ff8a5c', blurb: 'Slam the ground. Cast it in the air to dive first.' },
  { id: 'homeward', name: 'Homeward', keys: ['KeyH'], keyLabel: 'H', cost: 0, cooldown: 20, color: '#9ef0ff', blurb: 'Stand still for 1.5s to return to the Threshold.' },
];

const SPELL_BY_ID = new Map(SPELLS.map((s) => [s.id, s]));

type Bolt = {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  age: number;
  target: Foe | null;
  core: THREE.Mesh;
  glow: THREE.Sprite;
};

const WARD_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec3 vP;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  vP = position;
  gl_Position = projectionMatrix * mv;
}
`;
const WARD_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uFade;
varying vec3 vN;
varying vec3 vV;
varying vec3 vP;
void main() {
  float rim = pow(1.0 - clamp(abs(dot(vN, vV)), 0.0, 1.0), 2.2);
  float bands = 0.5 + 0.5 * sin(vP.y * 9.0 - uTime * 4.0);
  float hex = step(0.92, fract(vP.x * 2.2 + vP.y * 1.27)) + step(0.92, fract(vP.z * 2.2 - vP.y * 1.27));
  float a = (rim * 0.9 + 0.08 + bands * 0.06 + hex * 0.12) * uFade;
  gl_FragColor = vec4(uColor, a);
}
`;

export class Spells {
  readonly cooldowns: Record<SpellId, number> = { spark: 0, skip: 0, ward: 0, lodestar: 0, clap: 0, homeward: 0 };
  readonly group = new THREE.Group();
  wardTime = 0;
  private wardTotal = 5;
  channel = 0; // homeward channel progress in seconds (0 = idle)
  private bolts: Bolt[] = [];
  private readonly ward: THREE.Mesh;
  private readonly wardUniforms = { uColor: { value: new THREE.Color('#8cffc1').multiplyScalar(2.2) }, uTime: { value: 0 }, uFade: { value: 0 } };
  private divePending = false;
  private readonly boltGeo = new THREE.SphereGeometry(0.17, 12, 10);
  private readonly boltMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#bff6ff').multiplyScalar(4) });
  private readonly tmp = new THREE.Vector3();
  private readonly tmp2 = new THREE.Vector3();
  private readonly near: Foe[] = [];
  private readonly hand = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.group.name = 'spells';
    scene.add(this.group);
    this.ward = new THREE.Mesh(
      new THREE.SphereGeometry(1.55, 40, 28),
      new THREE.ShaderMaterial({
        uniforms: this.wardUniforms,
        vertexShader: WARD_VERT,
        fragmentShader: WARD_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.ward.visible = false;
    this.ward.renderOrder = 12;
    this.group.add(this.ward);
  }

  /** Aim point under the crosshair: first terrain or foe hit along the camera ray. */
  private aimPoint(game: Game, out: THREE.Vector3): THREE.Vector3 {
    const origin = game.camera.position;
    const f = game.rig.forward;
    const start = Math.max(2, game.rig.dist - 0.5);
    for (let t = start; t < 170; t += 0.8) {
      out.set(origin.x + f.x * t, origin.y + f.y * t, origin.z + f.z * t);
      if (out.y < game.world.heightAt(out.x, out.z)) return out;
      for (const c of game.foes) {
        if (!c.alive) continue;
        foeCenter(c, this.tmp2);
        const r = Math.max(1.05, c.radius + 0.35);
        if (this.tmp2.distanceToSquared(out) < r * r) return out.copy(this.tmp2);
      }
    }
    return out.set(origin.x + f.x * 170, origin.y + f.y * 170, origin.z + f.z * 170);
  }

  private deny(def: SpellDef, game: Game, reason: string): void {
    game.sfx.denied();
    game.hud.denied(def.id, reason);
  }

  tryCast(id: SpellId, game: Game): boolean {
    const def = SPELL_BY_ID.get(id);
    if (!def) throw new Error(`[spells] unknown spell ${id}`);
    const player = game.player;
    if (player.hp <= 0) return false;
    if (this.cooldowns[id] > 0) {
      if (id !== 'spark') this.deny(def, game, 'Recharging');
      return false;
    }
    if (player.aura < def.cost) {
      this.deny(def, game, 'Not enough aura');
      return false;
    }
    let ok = false;
    if (id === 'spark') ok = this.castSpark(game);
    else if (id === 'skip') ok = this.castSkip(game);
    else if (id === 'ward') ok = this.castWard(game);
    else if (id === 'lodestar') ok = this.castLodestar(game);
    else if (id === 'clap') ok = this.castClap(game);
    else if (id === 'homeward') ok = this.castHomeward(game);
    if (!ok) return false;
    player.aura -= def.cost;
    this.cooldowns[id] = def.cooldown;
    game.hud.cast(id);
    if (id !== 'spark') console.info(`[spell] ${def.name} (aura ${player.aura.toFixed(0)})`);
    return true;
  }

  // --- Spark Shot -------------------------------------------------------------
  private castSpark(game: Game): boolean {
    const aim = this.aimPoint(game, this.tmp);
    const player = game.player;
    player.avatar.handR.getWorldPosition(this.hand);
    const dir = this.tmp2.subVectors(aim, this.hand).normalize();
    player.castPose(Math.atan2(dir.x, dir.z));
    // Lock onto the foe closest to the aim line.
    let target: Foe | null = null;
    let best = Math.cos(0.22);
    for (const c of game.foes) {
      if (!c.alive) continue;
      const to = foeCenter(c, new THREE.Vector3()).sub(this.hand);
      const d = to.length();
      if (d > 50) continue;
      const dot = to.divideScalar(d).dot(dir);
      if (dot > best) {
        best = dot;
        target = c;
      }
    }
    const core = new THREE.Mesh(this.boltGeo, this.boltMat);
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: radialTexture(), color: new THREE.Color('#7fe9ff').multiplyScalar(2.4), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
    );
    glow.scale.setScalar(1.5);
    core.position.copy(this.hand);
    glow.position.copy(this.hand);
    core.renderOrder = 12;
    glow.renderOrder = 12;
    this.group.add(core, glow);
    this.bolts.push({ pos: this.hand.clone(), vel: dir.clone().multiplyScalar(54), age: 0, target, core, glow });
    game.fx.flash(this.hand, '#7fe9ff', 1.6, 0.18, 2.5);
    game.sfx.spark();
    return true;
  }

  private explodeBolt(b: Bolt, game: Game, hitCritter: boolean): void {
    game.fx.burst(b.pos, '#7fe9ff', hitCritter ? 30 : 16, hitCritter ? 7 : 4.5, 0.3, 0.5, 6, 3.2);
    game.fx.flash(b.pos, '#bff6ff', hitCritter ? 2.6 : 1.6, 0.22, 2.6);
    this.group.remove(b.core, b.glow);
    b.glow.material.dispose();
  }

  private updateBolts(dt: number, game: Game): void {
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const b = this.bolts[i];
      b.age += dt;
      if (b.target && b.target.alive) {
        const want = foeCenter(b.target, this.tmp).sub(b.pos).normalize().multiplyScalar(54);
        b.vel.lerp(want, 1 - Math.exp(-7 * dt));
      }
      let done = false;
      for (let s = 0; s < 3 && !done; s++) {
        b.pos.addScaledVector(b.vel, dt / 3);
        foesNear(game.foes, b.pos, 0.3, this.near);
        if (this.near.length > 0) {
          this.near[0].hit(game.player.perks.sparkDamage, b.pos, 6, 'spark', game);
          this.explodeBolt(b, game, true);
          done = true;
          break;
        }
        if (!done && game.world.solidAt(b.pos.x, b.pos.y, b.pos.z, 0.1)) {
          this.explodeBolt(b, game, false);
          done = true;
        }
      }
      if (!done && b.age > 1.5) {
        this.explodeBolt(b, game, false);
        done = true;
      }
      if (done) {
        this.bolts.splice(i, 1);
        continue;
      }
      b.core.position.copy(b.pos);
      b.glow.position.copy(b.pos);
      game.fx.mote(b.pos, '#7fe9ff', 0.32, 0.32, 0.5, 0, 2.8);
      game.fx.mote(b.pos, '#ffffff', 0.18, 0.2, 0.3, 0, 2.2);
    }
  }

  // --- Skip (blink) ----------------------------------------------------------------
  private castSkip(game: Game): boolean {
    const player = game.player;
    const world = game.world;
    const pitch = clamp(game.rig.pitch + 0.15, -0.3, 0.7);
    const dir = this.tmp2.set(-Math.sin(game.rig.yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(game.rig.yaw) * Math.cos(pitch));
    const start = new THREE.Vector3(player.pos.x, player.pos.y + 0.9, player.pos.z);
    const end = start.clone();
    const probe = new THREE.Vector3();
    const range = 13 * player.perks.skipRange;
    let reach = 0; // whole half-metre steps, so the 1.5 m minimum can't flip on float rounding between browsers
    let lift = 0; // the path rides up over ground it would dig into, so a blink aimed a little down or uphill still goes the distance
    for (let d = 0.5; d <= range; d += 0.5) {
      probe.copy(start).addScaledVector(dir, d);
      probe.y += lift;
      const feet = probe.y - 0.9;
      const floor = world.groundAt(probe.x, probe.z, feet + 0.6, 0.35);
      if (floor > feet && floor - feet <= 0.6) {
        lift += floor - feet;
        probe.y += floor - feet;
      }
      const blocked =
        world.solidAt(probe.x, probe.y, probe.z, 0.35) ||
        world.solidAt(probe.x, probe.y - 0.75, probe.z, 0.35) ||
        world.solidAt(probe.x, probe.y + 0.75, probe.z, 0.35);
      if (blocked) break;
      end.copy(probe);
      reach = d;
    }
    if (reach < 1.5) return false;
    const from = player.pos.clone().add(new THREE.Vector3(0, 0.9, 0));
    player.pos.set(end.x, end.y - 0.9, end.z);
    const ground = world.groundAt(player.pos.x, player.pos.z, player.pos.y, 0.42);
    if (player.pos.y < ground) player.pos.y = ground;
    player.vel.y = Math.max(player.vel.y, 1.5);
    player.vel.x += dir.x * 4;
    player.vel.z += dir.z * 4;
    player.grounded = false;
    player.refreshAirJump();
    player.castPose(Math.atan2(dir.x, dir.z));
    const to = player.pos.clone().add(new THREE.Vector3(0, 0.9, 0));
    game.fx.streak(from, to, '#a77bff', 0.22, 0.1, 1.6);
    for (let k = 0; k <= 18; k++) {
      const p = this.tmp.lerpVectors(from, to, k / 18);
      game.fx.mote(p, k % 3 === 0 ? '#ffffff' : '#c39bff', 0.42, 0.35 + k * 0.01, 0.5, 0.2, 2.6);
    }
    game.fx.burst(from, '#c39bff', 26, 4, 0.34, 0.5, -2, 3);
    game.fx.burst(to, '#e2d2ff', 30, 6, 0.34, 0.55, 2, 3);
    game.fx.flash(to, '#c39bff', 3, 0.3, 2.4);
    game.rig.fovBoost = 9;
    game.sfx.skip();
    return true;
  }

  // --- Bubble Ward -------------------------------------------------------------------
  private castWard(game: Game): boolean {
    this.wardTime = 5 * game.player.perks.wardDuration;
    this.wardTotal = this.wardTime;
    game.player.wardActive = true;
    game.fx.ring(game.player.pos.clone().add(new THREE.Vector3(0, 0.2, 0)), '#8cffc1', 0.6, 4, 0.5, 2.5);
    game.fx.burst(game.player.pos.clone().add(new THREE.Vector3(0, 1, 0)), '#8cffc1', 24, 4, 0.3, 0.6, -1, 2.6);
    game.sfx.ward();
    return true;
  }

  // --- Lodestar ------------------------------------------------------------------------
  private castLodestar(game: Game): boolean {
    const p = game.player.pos;
    const radius = 45 * game.player.perks.lodestarRadius;
    const pulled = game.cards.pullAll(p, radius);
    const yanked = game.monsters.yank(p.clone().setY(p.y + 1), radius, game);
    game.fx.ring(p.clone().add(new THREE.Vector3(0, 0.25, 0)), '#ffd36b', 1, radius, 1.0, 2.6);
    game.fx.ring(p.clone().add(new THREE.Vector3(0, 0.35, 0)), '#fff1c2', 0.5, 20, 0.7, 2.2);
    game.fx.burst(p.clone().add(new THREE.Vector3(0, 1.2, 0)), '#ffd36b', 40, 6, 0.36, 0.9, -1.5, 3);
    game.player.castPose(game.player.facing);
    game.sfx.lodestar();
    if (yanked > 0) game.hud.notice(yanked > 1 ? `Lodestar dragged out ${yanked} Snapjacks!` : 'Lodestar dragged out a Snapjack!');
    else if (pulled === 0) game.hud.notice(`Lodestar found no cards within ${Math.round(radius)}m`);
    return true;
  }

  // --- Thunderclap -----------------------------------------------------------------------
  private castClap(game: Game): boolean {
    const player = game.player;
    const height = player.pos.y - game.world.groundAt(player.pos.x, player.pos.z, player.pos.y, 0.42);
    if (!player.grounded && height > 2.2) {
      player.diving = true;
      player.vel.set(0, -44, 0);
      this.divePending = true;
      game.fx.burst(player.pos.clone().add(new THREE.Vector3(0, 1, 0)), '#ff8a5c', 18, 3, 0.3, 0.4, -6, 3);
      return true;
    }
    this.slam(game, 7.5);
    return true;
  }

  private slam(game: Game, radius: number): void {
    const p = game.player.pos;
    const at = new THREE.Vector3(p.x, p.y + 0.2, p.z);
    game.fx.ring(at, '#ff8a5c', 0.6, radius, 0.5, 3);
    game.fx.ring(at.clone().setY(at.y + 0.1), '#fff0d0', 0.4, radius * 0.6, 0.35, 2.4);
    game.fx.dustPuff(at, 26, radius * 1.1, 1.2);
    game.fx.burst(at.clone().setY(at.y + 0.4), '#ffb37a', 40, 9, 0.36, 0.55, 12, 3);
    game.fx.flash(at.clone().setY(at.y + 0.6), '#ffcf9a', radius * 0.9, 0.3, 2.6);
    game.fx.shake(0.75);
    game.sfx.clap();
    foesNear(game.foes, p, radius, this.near);
    for (const c of this.near) c.hit(2, p, 12, 'clap', game);
    console.info(`[spell] slam r=${radius} hit ${this.near.length} foe(s)`);
  }

  // --- Homeward ---------------------------------------------------------------------------
  private castHomeward(game: Game): boolean {
    this.channel = 0.0001;
    game.sfx.channel();
    game.hud.notice('Channeling Homeward… hold still');
    return true;
  }

  private updateChannel(dt: number, game: Game): void {
    if (this.channel <= 0) return;
    const player = game.player;
    const moving = Math.hypot(player.vel.x, player.vel.z) > 1.2 || !player.grounded;
    if (moving) {
      this.channel = 0;
      this.cooldowns.homeward = 2;
      game.hud.notice('Homeward interrupted');
      console.info('[spell] homeward interrupted');
      return;
    }
    this.channel += dt;
    const a = this.channel * 9;
    for (let k = 0; k < 2; k++) {
      const ang = a + k * Math.PI;
      game.fx.mote(this.tmp.set(player.pos.x + Math.cos(ang) * 1.1, player.pos.y + this.channel * 1.3, player.pos.z + Math.sin(ang) * 1.1), '#9ef0ff', 0.35, 0.7, 0.2, 1.2, 2.8);
    }
    if (this.channel < 1.5) return;
    this.channel = 0;
    const from = player.pos.clone().add(new THREE.Vector3(0, 1, 0));
    game.fx.burst(from, '#9ef0ff', 50, 6, 0.36, 0.8, -3, 3);
    const T = game.world.landmarks.gate;
    player.spawnAt(T.x, T.z + 6, game.world);
    game.rig.snap(player.pos);
    const to = player.pos.clone().add(new THREE.Vector3(0, 1, 0));
    game.fx.burst(to, '#9ef0ff', 60, 7, 0.36, 0.9, 2, 3);
    game.fx.ring(player.pos.clone().add(new THREE.Vector3(0, 0.6, 0)), '#9ef0ff', 0.5, 8, 0.7, 2.5);
    game.sfx.home();
    console.info('[spell] homeward: back at the Threshold');
  }

  update(dt: number, game: Game, controls: boolean): void {
    const input = game.input;
    for (const id of Object.keys(this.cooldowns) as SpellId[]) this.cooldowns[id] = Math.max(0, this.cooldowns[id] - dt);

    if (controls) {
      for (const def of SPELLS) {
        if (def.id === 'spark') continue;
        if (def.keys.some((k) => input.wasPressed(k))) this.tryCast(def.id, game);
      }
      const fire = input.isDown('Digit1') || (input.locked && input.mouseDown[0]);
      if (fire) this.tryCast('spark', game);
    }

    this.updateBolts(dt, game);
    this.updateChannel(dt, game);

    if (this.divePending && game.player.grounded) {
      this.divePending = false;
      this.slam(game, 10);
    }
    if (this.divePending && game.player.swimming) this.divePending = false;
    if (game.player.diving) game.fx.mote(game.player.pos.clone().add(new THREE.Vector3(0, 1.2, 0)), '#ff8a5c', 0.5, 0.25, 0.8, 4, 3);

    // Ward bubble
    if (this.wardTime > 0) {
      this.wardTime -= dt;
      const t = this.wardTotal - this.wardTime;
      const pop = Math.min(1, t / 0.18);
      const fade = this.wardTime < 0.5 ? this.wardTime / 0.5 : 1;
      this.ward.visible = true;
      this.ward.position.set(game.player.pos.x, game.player.pos.y + 0.95, game.player.pos.z);
      this.ward.scale.setScalar((0.6 + 0.4 * pop) * (1 + Math.sin(game.time * 6) * 0.025));
      this.wardUniforms.uFade.value = fade * pop;
      this.wardUniforms.uTime.value = game.time;
      if (this.wardTime <= 0) {
        game.player.wardActive = false;
        this.ward.visible = false;
        console.info('[spell] ward faded');
      }
    }

    game.rig.fovBoost = damp(game.rig.fovBoost, 0, 5, dt);
  }
}
