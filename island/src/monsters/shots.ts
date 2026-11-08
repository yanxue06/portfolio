import * as THREE from 'three';
import { foesNear, foeCenter, type Foe } from '../foes';
import { clamp } from '../util/math';
import type { Game } from '../game';

// Everything monsters throw. Every shot in flight is one point in a single THREE.Points, so
// a sky full of orbs is still one draw call; trails go through the shared spark pool. Seed
// pods also get a landing marker on the ground, so a careful player always sees them coming.
// A shot that touches an active Bubble Ward turns around and flies home at whoever fired it.

const MAX_SHOTS = 48;
const WARD_COLOR = new THREE.Color('#8cffc1');
const WARD_RADIUS = 1.55;
const POD_GRAVITY = 20;

export type ShotKind = 'orb' | 'pod';

type Marker = { ring: THREE.Mesh; fill: THREE.Mesh; ringMat: THREE.MeshBasicMaterial; fillMat: THREE.MeshBasicMaterial; age: number; life: number; radius: number; live: boolean };

type Shot = {
  kind: ShotKind;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  age: number;
  life: number;
  gravity: number;
  radius: number;
  damage: number;
  blast: number; // pods: the radius their burst hurts within
  color: THREE.Color;
  size: number;
  owner: Foe | null;
  reflected: boolean;
  marker: Marker | null;
};

const VERT = /* glsl */ `
attribute float aSize;
attribute vec3 aColor;
uniform float uScale;
varying vec3 vColor;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(aSize * uScale / max(-mv.z, 0.1), 3.0, 110.0);
  vColor = aColor;
}
`;

// a hot white core inside a colored halo: reads against bright desert sky and dark woods,
// with or without bloom (low has none)
const FRAG = /* glsl */ `
varying vec3 vColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;
  float core = smoothstep(0.46, 0.2, d);
  float halo = (1.0 - d) * (1.0 - d);
  vec3 col = mix(vColor * (0.6 + halo * 1.4), vec3(2.2), core);
  gl_FragColor = vec4(col, max(core, halo * 0.9));
}
`;

const ringGeo = new THREE.RingGeometry(0.88, 1, 48).rotateX(-Math.PI / 2);
const discGeo = new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2);
const UP = new THREE.Vector3(0, 1, 0);

export class Shots {
  readonly points: THREE.Points;
  private readonly list: Shot[] = [];
  private readonly markers: Marker[] = [];
  private readonly group: THREE.Group;
  private readonly aPos: THREE.BufferAttribute;
  private readonly aCol: THREE.BufferAttribute;
  private readonly aSize: THREE.BufferAttribute;
  private readonly near: Foe[] = [];
  private readonly tmp = new THREE.Vector3();
  private readonly tmp2 = new THREE.Vector3();
  private readonly n = new THREE.Vector3();
  private warned = false;

  constructor(group: THREE.Group, scale: { value: number }) {
    this.group = group;
    const geo = new THREE.BufferGeometry();
    this.aPos = new THREE.BufferAttribute(new Float32Array(MAX_SHOTS * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.aCol = new THREE.BufferAttribute(new Float32Array(MAX_SHOTS * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.aSize = new THREE.BufferAttribute(new Float32Array(MAX_SHOTS), 1).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', this.aPos);
    geo.setAttribute('aColor', this.aCol);
    geo.setAttribute('aSize', this.aSize);
    geo.setDrawRange(0, 0);
    this.points = new THREE.Points(
      geo,
      new THREE.ShaderMaterial({ uniforms: { uScale: scale }, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }),
    );
    this.points.frustumCulled = false;
    this.points.renderOrder = 12;
    this.points.name = 'monster-shots';
    group.add(this.points);
  }

  get count(): number {
    return this.list.length;
  }

  dispose(): void {
    this.points.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
    for (const m of this.markers) {
      m.ringMat.dispose();
      m.fillMat.dispose();
    }
  }

  /** Drops every shot and marker (the player died, or the land is changing). */
  clear(): void {
    for (const s of this.list) if (s.marker) this.release(s.marker);
    this.list.length = 0;
  }

  private add(s: Shot): boolean {
    if (this.list.length >= MAX_SHOTS) {
      if (!this.warned) console.warn(`[shots] ${MAX_SHOTS} shots in the air; dropping new ones`);
      this.warned = true;
      return false;
    }
    this.list.push(s);
    return true;
  }

  /** A straight shot. */
  orb(from: THREE.Vector3, vel: THREE.Vector3, owner: Foe, color: string, damage: number): void {
    this.add({ kind: 'orb', pos: from.clone(), vel: vel.clone(), age: 0, life: 3, gravity: 0, radius: 0.32, damage, blast: 0, color: new THREE.Color(color).multiplyScalar(1.6), size: 0.75, owner, reflected: false, marker: null });
  }

  /** A lobbed seed pod that lands on `target` after `flight` seconds, with a marker where it will land. */
  pod(from: THREE.Vector3, target: THREE.Vector3, flight: number, owner: Foe, color: string, damage: number, blast: number, game: Game): void {
    const vel = this.ballistic(from, target, flight, new THREE.Vector3());
    const marker = this.mark(target, blast, flight, game);
    const ok = this.add({ kind: 'pod', pos: from.clone(), vel, age: 0, life: flight + 0.6, gravity: POD_GRAVITY, radius: 0.36, damage, blast, color: new THREE.Color(color).multiplyScalar(1.4), size: 0.9, owner, reflected: false, marker });
    if (!ok) this.release(marker);
  }

  private ballistic(from: THREE.Vector3, to: THREE.Vector3, t: number, out: THREE.Vector3): THREE.Vector3 {
    return out.set((to.x - from.x) / t, (to.y - from.y + 0.5 * POD_GRAVITY * t * t) / t, (to.z - from.z) / t);
  }

  private mark(at: THREE.Vector3, radius: number, life: number, game: Game): Marker {
    let m = this.markers.find((k) => !k.live);
    if (!m) {
      const common = { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 };
      const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff5a3c').multiplyScalar(1.6), ...common });
      const fillMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff7a4a'), opacity: 0.22, ...common });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      const fill = new THREE.Mesh(discGeo, fillMat);
      ring.renderOrder = 11;
      fill.renderOrder = 11;
      this.group.add(ring, fill);
      m = { ring, fill, ringMat, fillMat, age: 0, life: 1, radius: 1, live: false };
      this.markers.push(m);
    }
    // lie along the slope, a hand's width up, so it reads on hillsides too
    game.world.island.normalAt(at.x, at.z, this.n);
    for (const o of [m.ring, m.fill]) {
      o.position.set(at.x, at.y + 0.12, at.z);
      o.quaternion.setFromUnitVectors(UP, this.n);
      o.visible = true;
    }
    m.ring.scale.setScalar(radius);
    m.fill.scale.setScalar(0.01);
    m.age = 0;
    m.life = life;
    m.radius = radius;
    m.live = true;
    return m;
  }

  private release(m: Marker): void {
    m.live = false;
    m.ring.visible = false;
    m.fill.visible = false;
  }

  /** Nearest point on the player's body (a vertical segment) to p, as a distance. */
  private playerGap(p: THREE.Vector3, game: Game): number {
    const pl = game.player.pos;
    const y = clamp(p.y, pl.y + 0.25, pl.y + 1.55);
    return Math.hypot(p.x - pl.x, p.y - y, p.z - pl.z);
  }

  private reflect(s: Shot, game: Game): void {
    s.reflected = true;
    s.color.copy(WARD_COLOR).multiplyScalar(1.8);
    s.age = 0;
    const owner = s.owner && s.owner.alive ? s.owner : null;
    if (s.kind === 'orb') {
      if (owner) s.vel.copy(foeCenter(owner, this.tmp).sub(s.pos).normalize().multiplyScalar(26));
      else s.vel.multiplyScalar(-1.3);
      s.life = 2.5;
      s.damage = 5; // two of a volley sent home burst a Lanternwing
    } else {
      // knocked back the way it came: a short lob onto whoever planted it
      const to = owner ? owner.pos : this.tmp.copy(s.pos).addScaledVector(s.vel, -0.6).setY(game.world.heightAt(s.pos.x, s.pos.z));
      this.ballistic(s.pos, to, 0.85, s.vel);
      s.life = 1.1;
      s.damage = 3;
      if (s.marker) this.release(s.marker);
      s.marker = null;
    }
    const at = this.tmp2.copy(s.pos);
    game.fx.flash(at, '#8cffc1', 2.4, 0.22, 2.6);
    game.fx.burst(at, '#8cffc1', 14, 4, 0.26, 0.35, 0, 3);
    game.sfx.reflect();
    console.info(`[shots] ward bounced a ${s.kind} back`);
  }

  private explode(s: Shot, game: Game, struck: Foe | null): void {
    const fx = game.fx;
    const player = game.player;
    const dist = player.pos.distanceTo(s.pos);
    const vol = clamp(1.3 - dist / 40, 0.12, 1);
    if (s.kind === 'orb') {
      fx.burst(s.pos, s.color, 16, 5, 0.3, 0.42, 3, 1.8);
      fx.flash(s.pos, '#ffffff', 2, 0.18, 1.6);
      if (struck) struck.hit(s.damage, s.pos, 8, 'reflect', game);
      else if (!s.reflected && this.playerGap(s.pos, game) < 0.45 + s.radius + 0.05) player.hurt(s.damage, s.pos.x, s.pos.z);
      game.sfx.orbHit(vol);
    } else {
      const ground = this.tmp.set(s.pos.x, game.world.heightAt(s.pos.x, s.pos.z) + 0.15, s.pos.z);
      if (ground.y > s.pos.y) ground.y = s.pos.y;
      fx.ring(ground, s.reflected ? '#8cffc1' : '#ffb347', 0.4, s.blast, 0.4, 2.6);
      fx.burst(s.pos, s.color, 30, 7, 0.34, 0.55, 9, 1.8);
      fx.dustPuff(ground, 10, s.blast * 1.2, 0.7);
      fx.flash(s.pos, '#fff0c0', s.blast * 1.4, 0.24, 2);
      if (s.reflected) {
        foesNear(game.foes, s.pos, s.blast, this.near);
        for (const f of this.near) f.hit(s.damage, s.pos, 10, 'reflect', game);
      } else if (this.playerGap(s.pos, game) < s.blast) {
        player.hurt(s.damage, s.pos.x, s.pos.z);
      }
      if (dist < 12) fx.shake(0.25);
      game.sfx.podBurst(vol);
      if (s.marker) this.release(s.marker);
      s.marker = null;
    }
  }

  /** Steps one shot; returns true when it is spent. */
  private step(s: Shot, dt: number, game: Game): boolean {
    const player = game.player;
    const world = game.world;
    if (s.reflected && s.kind === 'orb' && s.owner && s.owner.alive) {
      const want = foeCenter(s.owner, this.tmp).sub(s.pos).normalize().multiplyScalar(26);
      s.vel.lerp(want, 1 - Math.exp(-6 * dt));
    }
    const sub = s.vel.lengthSq() * dt * dt > 0.16 ? 3 : 2; // never skip more than ~0.4 m between checks
    const h = dt / sub;
    for (let k = 0; k < sub; k++) {
      s.vel.y -= s.gravity * h;
      s.pos.addScaledVector(s.vel, h);
      if (!s.reflected) {
        if (player.wardActive && player.hp > 0) {
          const dx = s.pos.x - player.pos.x;
          const dy = s.pos.y - (player.pos.y + 0.95);
          const dz = s.pos.z - player.pos.z;
          if (dx * dx + dy * dy + dz * dz < (WARD_RADIUS + s.radius) ** 2) {
            this.reflect(s, game);
            continue;
          }
        }
        if (player.hp > 0 && this.playerGap(s.pos, game) < 0.45 + s.radius) {
          this.explode(s, game, null);
          return true;
        }
      } else {
        foesNear(game.foes, s.pos, s.radius, this.near);
        if (this.near.length > 0) {
          this.explode(s, game, this.near[0]);
          return true;
        }
      }
      if (world.solidAt(s.pos.x, s.pos.y, s.pos.z, 0.05)) {
        this.explode(s, game, null);
        return true;
      }
    }
    s.age += dt;
    if (s.age > s.life) {
      if (s.kind === 'pod') this.explode(s, game, null);
      else game.fx.burst(s.pos, s.color, 8, 2.5, 0.24, 0.3, 0, 1.6);
      return true;
    }
    game.fx.mote(s.pos, s.color, s.size * 0.55, 0.3, 0.25, 0, 1.4);
    return false;
  }

  update(dt: number, game: Game): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const s = this.list[i];
      if (this.step(s, dt, game)) this.list.splice(i, 1);
    }
    for (const m of this.markers) {
      if (!m.live) continue;
      m.age += dt;
      const k = Math.min(1, m.age / m.life);
      m.ringMat.opacity = 0.55 + 0.35 * Math.sin(m.age * 16);
      m.fill.scale.setScalar(Math.max(0.01, m.radius * k));
      m.fillMat.opacity = 0.16 + 0.2 * k;
      if (m.age > m.life + 0.4) this.release(m);
    }
    const p = this.aPos.array as Float32Array;
    const c = this.aCol.array as Float32Array;
    const z = this.aSize.array as Float32Array;
    const n = this.list.length;
    for (let i = 0; i < n; i++) {
      const s = this.list[i];
      const pulse = 1 + 0.12 * Math.sin(s.age * 30 + i);
      p[i * 3] = s.pos.x;
      p[i * 3 + 1] = s.pos.y;
      p[i * 3 + 2] = s.pos.z;
      c[i * 3] = s.color.r;
      c[i * 3 + 1] = s.color.g;
      c[i * 3 + 2] = s.color.b;
      z[i] = s.size * pulse;
    }
    for (const a of [this.aPos, this.aCol]) {
      a.clearUpdateRanges();
      a.addUpdateRange(0, n * 3);
      a.needsUpdate = true;
    }
    this.aSize.clearUpdateRanges();
    this.aSize.addUpdateRange(0, n);
    this.aSize.needsUpdate = true;
    this.points.geometry.setDrawRange(0, n);
  }
}
