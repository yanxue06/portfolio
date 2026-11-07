import * as THREE from 'three';
import { Avatar, type AvatarPose } from './avatar';
import type { Input } from './input';
import type { World } from '../world/world';
import { clamp, damp, dampAngle } from '../util/math';

export const PLAYER_RADIUS = 0.42;
export const PLAYER_HEIGHT = 1.75;

const WALK = 6.5;
const RUN = 11;
const SWIM = 4.2;
const JUMP_V = 11.5;
const AIR_JUMP_V = 10.5;
const GRAVITY_UP = 30;
const GRAVITY_DOWN = 40;
const GRAVITY_CUT = 62; // jump released early: shorter hop
const MAX_GRADE = 1.35; // rise/run the player can walk up (~53 degrees)
const SWIM_DEPTH = 1.25;
const FLOAT_Y = -1.05;
const WORLD_EDGE = 440;

/** Anything that can wear the player's body: the procedural Avatar or a loaded VRM character. */
export type AvatarLike = {
  root: THREE.Object3D;
  handR: THREE.Object3D;
  /** Standing height in meters, when known (VRM characters measure theirs). */
  height?: number;
  animate(dt: number, pose: AvatarPose): void;
  /** Optional face (VRM characters): a short emotion that fades back to neutral. */
  setExpression?(name: 'happy' | 'surprised' | 'angry' | 'neutral', seconds: number): void;
};

/** Character perks: multipliers, 1 = baseline. */
export type Perks = {
  speed: number;
  jump: number;
  skipRange: number;
  lodestarRadius: number;
  auraRegen: number;
  wardDuration: number;
  sparkDamage: number;
};

export const BASE_PERKS: Perks = { speed: 1, jump: 1, skipRange: 1, lodestarRadius: 1, auraRegen: 1, wardDuration: 1, sparkDamage: 1 };

export type PlayerEvents = {
  jump(p: Player): void;
  airJump(p: Player): void;
  land(p: Player, impact: number): void;
  step(p: Player): void;
  hurt(p: Player, amount: number): void;
  died(p: Player): void;
};

export class Player {
  readonly pos = new THREE.Vector3();
  readonly vel = new THREE.Vector3();
  avatar: AvatarLike = new Avatar();
  perks: Perks = { ...BASE_PERKS };
  facing = 0;
  grounded = false;
  swimming = false;
  hp = 100;
  readonly maxHp = 100;
  aura = 100;
  readonly maxAura = 100;
  diving = false;
  wardActive = false;
  private airJump = true;
  private coyote = 0;
  private jumpBuffer = 0;
  private land = 0;
  private castBlend = 0;
  private castHold = 0;
  private castYaw = 0;
  private lastHurt = -100;
  private stepClock = 0;
  private time = 0;
  private readonly events: PlayerEvents;

  constructor(events: PlayerEvents) {
    this.events = events;
  }

  spawnAt(x: number, z: number, world: World): void {
    this.pos.set(x, world.groundAt(x, z, 1000, PLAYER_RADIUS), z);
    this.vel.set(0, 0, 0);
    this.grounded = true;
    this.diving = false;
    console.info(`[player] spawn at (${x.toFixed(1)}, ${this.pos.y.toFixed(1)}, ${z.toFixed(1)})`);
  }

  /** Spells call this so the right arm swings out toward the aim. */
  castPose(yaw: number): void {
    this.castHold = 0.32;
    this.castYaw = yaw;
  }

  /** Re-arms the air jump (blink and pads use this). */
  refreshAirJump(): void {
    this.airJump = true;
  }

  hurt(amount: number, fromX: number, fromZ: number): void {
    if (this.hp <= 0) return;
    const taken = this.wardActive ? 0 : amount;
    const dx = this.pos.x - fromX;
    const dz = this.pos.z - fromZ;
    const len = Math.hypot(dx, dz) || 1;
    this.vel.x += (dx / len) * 9;
    this.vel.z += (dz / len) * 9;
    this.vel.y = Math.max(this.vel.y, 5);
    this.grounded = false;
    if (taken <= 0) return;
    this.hp = Math.max(0, this.hp - taken);
    this.lastHurt = this.time;
    this.events.hurt(this, taken);
    if (this.hp <= 0) this.events.died(this);
  }

  update(dt: number, input: Input, cameraYaw: number, world: World, controls: boolean): void {
    this.time += dt;

    // --- Desired horizontal motion, relative to the camera ---
    let ix = 0;
    let iz = 0;
    if (controls) {
      if (input.isDown('KeyW') || input.isDown('ArrowUp')) iz += 1;
      if (input.isDown('KeyS') || input.isDown('ArrowDown')) iz -= 1;
      if (input.isDown('KeyD') || input.isDown('ArrowRight')) ix += 1;
      if (input.isDown('KeyA') || input.isDown('ArrowLeft')) ix -= 1;
    }
    const fx = -Math.sin(cameraYaw);
    const fz = -Math.cos(cameraYaw);
    const rx = Math.cos(cameraYaw);
    const rz = -Math.sin(cameraYaw);
    let mx = fx * iz + rx * ix;
    let mz = fz * iz + rz * ix;
    const mlen = Math.hypot(mx, mz);
    if (mlen > 0) {
      mx /= mlen;
      mz /= mlen;
    }
    const sprint = controls && (input.isDown('ShiftLeft') || input.isDown('ShiftRight'));
    let speed = (sprint ? RUN : WALK) * this.perks.speed;
    if (this.swimming) speed = SWIM;
    if (this.diving) speed = 0;
    const accel = this.grounded || this.swimming ? 12 : 3.2;
    this.vel.x = damp(this.vel.x, mx * speed, accel, dt);
    this.vel.z = damp(this.vel.z, mz * speed, accel, dt);

    // --- Jumping: coyote time + input buffer, one extra jump in the air ---
    if (controls && input.wasPressed('Space')) this.jumpBuffer = 0.13;
    this.jumpBuffer -= dt;
    this.coyote = this.grounded ? 0.12 : this.coyote - dt;
    if (this.jumpBuffer > 0 && !this.diving) {
      if (this.coyote > 0 || this.swimming) {
        this.vel.y = this.swimming ? 8.5 : JUMP_V * this.perks.jump;
        this.grounded = false;
        this.coyote = 0;
        this.jumpBuffer = 0;
        this.airJump = true;
        this.events.jump(this);
      } else if (this.airJump) {
        this.vel.y = AIR_JUMP_V * this.perks.jump;
        this.airJump = false;
        this.jumpBuffer = 0;
        this.events.airJump(this);
      }
    }

    // --- Gravity ---
    if (!this.grounded && !this.swimming && !this.diving) {
      let g = this.vel.y > 0 ? GRAVITY_UP : GRAVITY_DOWN;
      if (this.vel.y > 0 && !(controls && input.isDown('Space'))) g = GRAVITY_CUT;
      this.vel.y = Math.max(this.vel.y - g * dt, -60);
    }

    // --- Horizontal integration in small steps, with walls and steep slopes ---
    const travel = Math.hypot(this.vel.x, this.vel.z) * dt;
    const steps = Math.max(1, Math.ceil(travel / 0.3));
    const sdt = dt / steps;
    for (let s = 0; s < steps; s++) {
      const ox = this.pos.x;
      const oz = this.pos.z;
      this.pos.x += this.vel.x * sdt;
      this.pos.z += this.vel.z * sdt;
      if (this.grounded && world.standingOn === null) {
        const rise = world.heightAt(this.pos.x, this.pos.z) - world.heightAt(ox, oz);
        const run = Math.hypot(this.pos.x - ox, this.pos.z - oz);
        if (run > 1e-4 && rise / run > MAX_GRADE) {
          this.pos.x = ox;
          this.pos.z = oz;
          this.vel.x *= 0.4;
          this.vel.z *= 0.4;
        }
      }
      world.resolveCapsule(this.pos, PLAYER_RADIUS, PLAYER_HEIGHT, this.vel);
    }
    const edge = Math.hypot(this.pos.x, this.pos.z);
    if (edge > WORLD_EDGE) {
      this.pos.x *= WORLD_EDGE / edge;
      this.pos.z *= WORLD_EDGE / edge;
    }

    // --- Vertical integration ---
    const wasGrounded = this.grounded;
    const fallSpeed = -this.vel.y;
    this.pos.y += this.vel.y * dt;
    const ceiling = world.ceilingAt(this.pos.x, this.pos.z, this.pos.y, PLAYER_RADIUS);
    if (this.vel.y > 0 && this.pos.y + PLAYER_HEIGHT > ceiling) {
      this.pos.y = ceiling - PLAYER_HEIGHT;
      this.vel.y = 0;
    }
    const ground = world.groundAt(this.pos.x, this.pos.z, this.pos.y, PLAYER_RADIUS);
    if (this.pos.y <= ground) {
      this.pos.y = ground;
      if (!wasGrounded) {
        this.land = Math.max(this.land, clamp(fallSpeed / 26, 0, 1));
        this.events.land(this, fallSpeed);
      }
      this.vel.y = 0;
      this.grounded = true;
      this.airJump = true;
      this.diving = false;
    } else if (wasGrounded && this.vel.y <= 0 && this.pos.y - ground < 0.6) {
      this.pos.y = ground; // stick to the ground walking downhill
      this.vel.y = 0;
      this.grounded = true;
    } else {
      this.grounded = false;
    }

    // --- Water: float at the surface once it's deeper than the chest ---
    const depth = -world.heightAt(this.pos.x, this.pos.z);
    const wasSwimming = this.swimming;
    this.swimming = depth > SWIM_DEPTH && this.pos.y < FLOAT_Y + 0.5 && world.standingOn === null;
    if (this.swimming) {
      this.diving = false;
      this.grounded = false;
      this.airJump = true;
      this.vel.y = damp(this.vel.y, (FLOAT_Y - this.pos.y) * 5, 8, dt);
      if (!wasSwimming) console.info('[player] swimming');
    }

    if (this.pos.y < -40) {
      console.warn('[player] fell out of the world, respawning');
      this.events.died(this);
    }

    // --- Regen ---
    this.aura = Math.min(this.maxAura, this.aura + 14 * this.perks.auraRegen * dt);
    if (this.time - this.lastHurt > 4) this.hp = Math.min(this.maxHp, this.hp + 6 * dt);

    // --- Facing + animation ---
    const hspeed = Math.hypot(this.vel.x, this.vel.z);
    this.castHold -= dt;
    this.castBlend = damp(this.castBlend, this.castHold > 0 ? 1 : 0, 18, dt);
    if (this.castHold > 0) this.facing = dampAngle(this.facing, this.castYaw, 20, dt);
    else if (mlen > 0.1 && hspeed > 0.5) this.facing = dampAngle(this.facing, Math.atan2(mx, mz), 12, dt);
    this.land = damp(this.land, 0, 7, dt);

    if (this.grounded && hspeed > 1) {
      this.stepClock += dt * (1.4 + hspeed * 0.18);
      if (this.stepClock > 1) {
        this.stepClock = 0;
        this.events.step(this);
      }
    }

    this.avatar.root.position.copy(this.pos);
    this.avatar.root.rotation.y = this.facing;
    this.avatar.animate(dt, {
      speed: hspeed,
      grounded: this.grounded,
      vy: this.vel.y,
      swimming: this.swimming,
      cast: this.castBlend,
      land: this.land,
      dive: this.diving,
    });
  }
}
