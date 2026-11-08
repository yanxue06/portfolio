import * as THREE from 'three';
import { CARDS, cardByNo, isBestiary, type CardDef } from '../cards/catalog';
import type { Foe, HitKind } from '../foes';
import { clamp, damp, dampAngle, hashString, mulberry32 } from '../util/math';
import { Shots } from './shots';
import {
  RUMBLE_PIVOT,
  TINTS,
  lanternKit,
  lanternModel,
  mortarKit,
  mortarModel,
  rumbleKit,
  rumbleModel,
  snapKit,
  snapModel,
  type LanternKit,
  type LanternModel,
  type MortarKit,
  type MortarModel,
  type RumbleKit,
  type RumbleModel,
  type SnapKit,
  type SnapModel,
  type Tint,
} from './models';
import type { World } from '../world/world';
import type { Collider } from '../world/collision';
import type { Game } from '../game';

// Monsters: tougher than jellyhops, and each one has a trick to beating it. They roam every
// land in its own colors, fight back from range, and drop better cards: always an uncommon or
// rare from the land, and sometimes the monster itself as a bestiary card (the first one of a
// kind always is). They stay out of the Gate plaza and the town, so there is always somewhere
// safe to stand.
//
// Cost: a monster farther than SLEEP from the player is hidden and skipped, so only the few
// nearby ever think or draw. Each is two to four meshes; every shot in the air is one point
// in a single draw call (shots.ts).

export type MonsterKind = 'lanternwing' | 'thornmortar' | 'rumbleback' | 'snapjack';

export type MonsterDef = {
  kind: MonsterKind;
  name: string;
  card: number; // its bestiary card
  hp: number;
  count: number; // per land
  respawn: number; // seconds after it's beaten
  rare: number; // chance the land card it drops is rare (otherwise uncommon)
  tip: string; // the trick, shown the first time you fight one
};

export const BESTIARY: Record<MonsterKind, MonsterDef> = {
  lanternwing: { kind: 'lanternwing', name: 'Lanternwing', card: 61, hp: 10, count: 4, respawn: 80, rare: 0.35, tip: 'Shoots in threes. Keep moving, or bounce its shots back with Bubble Ward.' },
  thornmortar: { kind: 'thornmortar', name: 'Thornmortar', card: 62, hp: 14, count: 3, respawn: 80, rare: 0.35, tip: "Lobs seeds where you stand. It's only soft while open, but Thunderclap cracks it any time." },
  rumbleback: { kind: 'rumbleback', name: 'Rumbleback', card: 63, hp: 30, count: 2, respawn: 110, rare: 1, tip: 'Rolls at you. Step aside so it crashes into a tree or a rock, then hit its belly.' },
  snapjack: { kind: 'snapjack', name: 'Snapjack', card: 64, hp: 10, count: 3, respawn: 90, rare: 0.6, tip: 'Hides as a card. Real cards show a face and a dot on your map. Lodestar drags it out.' },
};

const KINDS: MonsterKind[] = ['lanternwing', 'thornmortar', 'rumbleback', 'snapjack'];

const SAFE_GATE = 55; // no monster lives or fights this close to a land's Gate
const SAFE_TOWN = 12; // ...or this far past the edge of its town
const SLEEP = 115; // farther than this from the player: hidden, and no thinking
const HOVER = 4.4; // a Lanternwing's height over the ground when idle
const ORB_SPEED = 18;
const ROLL_SPEED = 19;
const DAZE = 3.2;
const BESTIARY_AGAIN = 0.2; // chance a monster you already have the card of turns into another

/** When the HUD first showed each kind's tip this session (so it only teaches once). */
const tipShownAt = new Map<MonsterKind, number>();

type State =
  | 'idle'
  | 'charge'
  | 'fire'
  | 'opening'
  | 'open'
  | 'closing'
  | 'bristle'
  | 'notice'
  | 'windup'
  | 'roll'
  | 'skid'
  | 'dazed'
  | 'recover'
  | 'disguised'
  | 'tremble'
  | 'chase'
  | 'return'
  | 'yanked'
  | 'stunned';

type Base = Foe & {
  id: number;
  def: MonsterDef;
  group: THREE.Group;
  anchor: THREE.Vector3; // home, on the ground
  vel: THREE.Vector3;
  hp: number;
  state: State;
  t: number; // seconds in the current state
  cd: number; // attack cooldown
  facing: number;
  flash: number;
  respawnAt: number;
  engaged: boolean;
  lastHit: number; // game.time the player last hit it, for the HUD
  phase: number;
};

type Lanternwing = Base & { kind: 'lanternwing'; model: LanternModel; orbit: number; orbitDir: number; volley: number; glow: number };
type Thornmortar = Base & { kind: 'thornmortar'; model: MortarModel; gape: number; bristleCd: number };
type Rumbleback = Base & {
  kind: 'rumbleback';
  model: RumbleModel;
  dir: THREE.Vector3;
  speed: number;
  spin: number;
  flip: number;
  curl: number;
  travelled: number;
  struck: boolean;
  wander: THREE.Vector3;
  wanderT: number;
};
type Snapjack = Base & {
  kind: 'snapjack';
  model: SnapModel;
  fold: number; // 0 = a flat card, 1 = folded into a mouth
  gape: number;
  grounded: boolean;
  hopT: number;
  biteCd: number;
  lostT: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
};

export type Monster = Lanternwing | Thornmortar | Rumbleback | Snapjack;

export type FoeInfo = { id: number; name: string; frac: number; status: string; tone: '' | 'good' | 'bad'; tip: string };

type Status = { text: string; tone: FoeInfo['tone'] };
// fixed objects, so asking for a status every frame makes no garbage
const QUIET: Status = { text: '', tone: '' };
const STATUS = {
  charging: { text: 'Charging', tone: 'bad' },
  firing: { text: 'Firing', tone: '' },
  bristle: { text: 'Bristling: back off', tone: 'bad' },
  open: { text: 'Open: hit it now', tone: 'good' },
  armored: { text: 'Armored', tone: 'bad' },
  dazed: { text: 'Dazed: hit it now', tone: 'good' },
  windup: { text: 'Winding up', tone: 'bad' },
  rolling: { text: 'Rolling', tone: 'bad' },
  stunned: { text: 'Stunned: hit it now', tone: 'good' },
} satisfies Record<string, Status>;

export class Monsters {
  readonly list: Monster[] = [];
  readonly group = new THREE.Group();
  readonly shots: Shots;
  /** Smoothed milliseconds per update, for perf checks. */
  ms = 0;
  beaten = 0;
  private focus: Monster | null = null;
  private readonly world: World;
  private readonly tint: Tint;
  private readonly rng: () => number;
  private readonly lanternKit: LanternKit;
  private readonly mortarKit: MortarKit;
  private readonly rumbleKit: RumbleKit;
  private readonly snapKit: SnapKit;
  private readonly pools: Record<'uncommon' | 'rare', CardDef[]>;
  private readonly chest = new THREE.Vector3();
  private readonly tmp = new THREE.Vector3();
  private readonly tmp2 = new THREE.Vector3();
  private readonly tmp3 = new THREE.Vector3();
  private readonly n = new THREE.Vector3();
  private readonly cols: Collider[] = [];
  private readonly marks: Array<{ x: number; z: number }> = [];
  private readonly markPool: Array<{ x: number; z: number }> = [];
  private readonly info: FoeInfo = { id: -1, name: '', frac: 1, status: '', tone: '', tip: '' };

  constructor(scene: THREE.Scene, world: World, dayKey: string, enabled: boolean, pointScale: { value: number }) {
    this.world = world;
    this.tint = TINTS[world.land.id];
    this.rng = mulberry32(hashString(`monsters:${dayKey}:${world.land.id}`));
    this.group.name = 'monsters';
    scene.add(this.group);
    this.shots = new Shots(this.group, pointScale);
    this.lanternKit = lanternKit(this.tint);
    this.mortarKit = mortarKit(this.tint);
    this.rumbleKit = rumbleKit(this.tint);
    this.snapKit = snapKit();
    const land = world.land.id;
    const pool = (r: CardDef['rarity']) => CARDS.filter((c) => c.land === land && !isBestiary(c) && c.rarity === r);
    this.pools = { uncommon: pool('uncommon'), rare: pool('rare') };
    if (this.pools.uncommon.length === 0 || this.pools.rare.length === 0) throw new Error(`[monsters] ${land} has no uncommon or rare cards to drop`);
    if (enabled) {
      let id = 0;
      for (const kind of KINDS) {
        for (let i = 0; i < BESTIARY[kind].count; i++) this.list.push(this.make(id++, kind));
      }
    }
    console.info(`[monsters] ${this.list.length} on ${land}${enabled ? '' : ' (turned off by ?monsters=off)'}`);
  }

  dispose(): void {
    this.group.removeFromParent();
    this.shots.dispose();
    for (const m of this.list) {
      if (m.kind === 'lanternwing') m.model.bodyMat.dispose();
      else if (m.kind === 'thornmortar') {
        m.model.plantMat.dispose();
        m.model.coreMat.dispose();
      } else if (m.kind === 'rumbleback') m.model.shellMat.dispose();
      else m.model.glow.material.dispose();
    }
    const L = this.lanternKit;
    const M = this.mortarKit;
    const R = this.rumbleKit;
    const S = this.snapKit;
    for (const d of [L.body, L.frame, L.frameMat, M.plant, M.core, R.shell, R.limbs, R.glow, R.limbMat, R.glowMat, S.top, S.bottom, S.topExtras, S.bottomExtras, S.cardMat, S.extrasMat]) d.dispose();
  }

  // --- spawning -----------------------------------------------------------------------

  /** Inside the Gate plaza or the town, where nothing attacks. */
  safeAt(x: number, z: number, margin = 0): boolean {
    const L = this.world.landmarks;
    if (Math.hypot(x - L.gate.x, z - L.gate.z) < SAFE_GATE + margin) return true;
    return Math.hypot(x - L.town.x, z - L.town.z) < L.town.r + SAFE_TOWN + margin;
  }

  private crowded(x: number, z: number, r: number): boolean {
    for (const m of this.list) if (Math.hypot(m.anchor.x - x, m.anchor.z - z) < r) return true;
    return false;
  }

  private findSpot(kind: MonsterKind, avoid: THREE.Vector3 | null): THREE.Vector3 {
    const island = this.world.island;
    for (let tries = 0; tries < 1500; tries++) {
      const x = (this.rng() * 2 - 1) * 300;
      const z = (this.rng() * 2 - 1) * 300;
      const h = island.heightAt(x, z);
      if (h < 1.2 || this.safeAt(x, z, 14)) continue;
      const relaxed = tries > 800; // odd shapes (marsh, desert): after a while any dry, open ground will do
      const slope = 1 - island.normalAt(x, z, this.n).y;
      const forest = island.sample(island.forestMask, x, z);
      const stone = island.sample(island.stoneMask, x, z);
      let ok: boolean;
      if (kind === 'lanternwing') ok = slope < 0.7;
      else if (kind === 'thornmortar') ok = slope < 0.3 && stone < 0.05 && (relaxed || forest < 0.55);
      // a Rumbleback wants room to roll and something nearby to crash into
      else if (kind === 'rumbleback') ok = slope < 0.2 && stone < 0.05 && (relaxed || (forest < 0.35 && this.world.colliders.query(x, z, 22, this.cols).length >= 4));
      else ok = slope < 0.4 && stone < 0.05;
      if (!ok) continue;
      if (avoid && Math.hypot(avoid.x - x, avoid.z - z) < 70) continue;
      if (this.crowded(x, z, 26)) continue;
      if (this.world.solidAt(x, h + 0.8, z, kind === 'rumbleback' ? 1.6 : 1)) continue; // not inside a tree, rock or house
      return new THREE.Vector3(x, h, z);
    }
    throw new Error(`[monsters] no room for a ${kind} on ${this.world.land.id}`);
  }

  private base(id: number, kind: MonsterKind, spot: THREE.Vector3): Omit<Base, 'pos' | 'lift' | 'radius'> {
    const def = BESTIARY[kind];
    return {
      id,
      def,
      group: new THREE.Group(),
      anchor: spot.clone(),
      vel: new THREE.Vector3(),
      hp: def.hp,
      state: kind === 'snapjack' ? 'disguised' : 'idle',
      t: 0,
      cd: 1,
      facing: this.rng() * Math.PI * 2,
      flash: 0,
      respawnAt: 0,
      engaged: false,
      lastHit: -100,
      phase: this.rng() * Math.PI * 2,
      alive: true,
      hit: () => {},
    };
  }

  private make(id: number, kind: MonsterKind): Monster {
    const spot = this.findSpot(kind, null);
    const b = this.base(id, kind, spot);
    let m: Monster;
    if (kind === 'lanternwing') {
      const model = lanternModel(this.lanternKit, this.tint);
      m = { ...b, kind, model, group: model.group, pos: spot.clone().setY(spot.y + HOVER), lift: 0, radius: 0.62, orbit: this.rng() * Math.PI * 2, orbitDir: this.rng() < 0.5 ? -1 : 1, volley: 0, glow: 0 };
    } else if (kind === 'thornmortar') {
      const model = mortarModel(this.mortarKit, this.tint);
      m = { ...b, kind, model, group: model.group, pos: spot.clone(), lift: 1, radius: 0.78, gape: 0, bristleCd: 0 };
    } else if (kind === 'rumbleback') {
      const model = rumbleModel(this.rumbleKit);
      m = { ...b, kind, model, group: model.group, pos: spot.clone(), lift: RUMBLE_PIVOT, radius: 1.25, dir: new THREE.Vector3(0, 0, 1), speed: 0, spin: 0, flip: 0, curl: 0, travelled: 0, struck: false, wander: spot.clone(), wanderT: 0 };
    } else {
      const model = snapModel(this.snapKit);
      m = { ...b, kind, model, group: model.group, pos: spot.clone(), lift: 1.3, radius: 0.62, fold: 0, gape: 0, grounded: true, hopT: 0, biteCd: 0, lostT: 0, from: new THREE.Vector3(), to: new THREE.Vector3() };
    }
    const self = m;
    m.hit = (amount, from, knock, how, game) => this.hit(self, amount, from, knock, how, game);
    m.group.name = kind;
    this.group.add(m.group);
    this.pose(m, 0);
    return m;
  }

  private respawn(m: Monster, game: Game): void {
    const spot = this.findSpot(m.kind, game.player.pos);
    this.reset(m, spot);
    console.info(`[monsters] a ${m.def.name} came back on ${this.world.land.id}`);
  }

  private reset(m: Monster, spot: THREE.Vector3): void {
    m.anchor.copy(spot);
    m.hp = m.def.hp;
    m.alive = true;
    m.engaged = false;
    m.state = m.kind === 'snapjack' ? 'disguised' : 'idle';
    m.t = 0;
    m.cd = 0.6;
    m.flash = 0;
    m.vel.set(0, 0, 0);
    m.group.visible = true;
    if (m.kind === 'lanternwing') {
      m.pos.copy(spot).setY(spot.y + HOVER);
      m.volley = 0;
      m.glow = 0;
    } else if (m.kind === 'thornmortar') {
      m.pos.copy(spot);
      m.gape = 0;
    } else if (m.kind === 'rumbleback') {
      m.pos.copy(spot);
      m.flip = 0;
      m.curl = 0;
      m.speed = 0;
      m.wander.copy(spot);
    } else {
      m.pos.copy(spot);
      m.lift = 1.3;
      m.radius = 0.62;
      m.fold = 0;
      m.gape = 0;
      m.grounded = true;
    }
    this.pose(m, 0);
  }

  // --- shared AI helpers ----------------------------------------------------------------

  /** The player can be fought from here: alive, out of the safe zones, within range. */
  private fightable(m: Monster, game: Game, range: number): boolean {
    const p = game.player;
    if (p.hp <= 0 || game.mode !== 'play') return false;
    if (this.safeAt(p.pos.x, p.pos.z)) return false;
    if (Math.abs(p.pos.y - m.pos.y) > 16) return false;
    return Math.hypot(p.pos.x - m.pos.x, p.pos.z - m.pos.z) < range;
  }

  /** Clear line between two points: no terrain, tree, rock or wall in the way. */
  private sees(a: THREE.Vector3, b: THREE.Vector3): boolean {
    const d = a.distanceTo(b);
    const steps = Math.min(24, Math.ceil(d / 1.5));
    for (let i = 1; i < steps; i++) {
      this.tmp3.lerpVectors(a, b, i / steps);
      if (this.world.solidAt(this.tmp3.x, this.tmp3.y, this.tmp3.z, 0.05)) return false;
    }
    return true;
  }

  private engage(m: Monster, game: Game): void {
    if (m.engaged) return;
    m.engaged = true;
    m.cd = Math.min(m.cd, 0.7 + this.rng() * 0.5);
    console.info(`[monsters] ${m.def.name} #${m.id} spotted you (${this.dist(m, game).toFixed(0)}m)`);
  }

  private disengage(m: Monster): void {
    m.engaged = false;
  }

  private dist(m: Monster, game: Game): number {
    return Math.hypot(game.player.pos.x - m.pos.x, game.player.pos.z - m.pos.z);
  }

  private vol(m: Monster, game: Game): number {
    return clamp(1.25 - this.dist(m, game) / 45, 0.1, 1);
  }

  private yawTo(m: Monster, x: number, z: number): number {
    return Math.atan2(x - m.pos.x, z - m.pos.z);
  }

  // --- hits and drops ---------------------------------------------------------------------

  private hit(m: Monster, amount: number, from: THREE.Vector3, knock: number, how: HitKind, game: Game): void {
    if (!m.alive) return;
    this.focus = m;
    m.lastHit = game.time;
    let mult = 1;
    if (m.kind === 'thornmortar' && how === 'spark' && m.gape < 0.35) {
      this.deflect(m, from, game);
      this.engage(m, game);
      return;
    }
    if (m.kind === 'rumbleback') {
      if (m.state === 'dazed') mult = 2.5;
      else if (m.state === 'skid' || m.state === 'recover') mult = 1;
      else mult = how === 'reflect' ? 1 : 0.25;
      if (mult < 1) this.deflect(m, from, game);
    }
    if (m.kind === 'snapjack') {
      if (m.state === 'stunned') mult = 2;
      if (m.state === 'disguised' || m.state === 'tremble') this.reveal(m, game, false);
    }
    m.hp -= amount * mult;
    m.flash = 0.12;
    const dx = m.pos.x - from.x;
    const dz = m.pos.z - from.z;
    const len = Math.hypot(dx, dz) || 1;
    if (m.kind === 'lanternwing') {
      m.vel.x += (dx / len) * knock * 0.6;
      m.vel.z += (dz / len) * knock * 0.6;
      m.vel.y += 1.5;
    } else if (m.kind === 'snapjack' && m.state !== 'yanked' && m.state !== 'stunned' && knock >= 10) {
      // only a big blow (a Thunderclap) bowls it over; Spark fire can't hold it off forever
      m.vel.set((dx / len) * knock * 0.5, 3.5, (dz / len) * knock * 0.5);
      m.grounded = false;
    }
    if (mult >= 1) game.sfx.hit();
    this.engage(m, game);
    if (m.hp <= 0) this.beat(m, game);
  }

  /** Armor: the blow glances off with a ping and does little or nothing. */
  private deflect(m: Monster, from: THREE.Vector3, game: Game): void {
    const at = this.tmp.copy(from);
    game.fx.burst(at, '#e8eef8', 10, 4, 0.22, 0.25, 4, 2.6);
    game.fx.flash(at, '#ffffff', 1.2, 0.12, 2);
    game.sfx.armored(this.vol(m, game));
  }

  private beat(m: Monster, game: Game): void {
    m.alive = false;
    m.engaged = false;
    m.group.visible = false;
    m.respawnAt = game.time + m.def.respawn;
    if (this.focus === m) this.focus = null;
    this.beaten++;
    const center = this.tmp.set(m.pos.x, m.pos.y + m.lift, m.pos.z);
    const color = m.kind === 'thornmortar' ? this.tint.pod : m.kind === 'rumbleback' ? this.tint.shell : m.kind === 'snapjack' ? '#ffd36b' : this.tint.glow;
    game.fx.burst(center, color, 60, 9, 0.44, 0.85, 6, 2.8);
    game.fx.burst(center, '#ffffff', 24, 6, 0.3, 0.5, 2, 3);
    game.fx.flash(center, '#ffffff', 4.5, 0.35, 2.4);
    const ground = Math.max(this.world.groundAt(m.pos.x, m.pos.z, m.pos.y + 1, 0.3), 0.1);
    game.fx.ring(this.tmp2.set(m.pos.x, ground + 0.15, m.pos.z), color, 0.5, 5, 0.55, 2.4);
    game.fx.shake(0.3);
    game.sfx.beat(this.vol(m, game));

    // always a land card, uncommon or rare
    const rarity = this.rng() < m.def.rare ? 'rare' : 'uncommon';
    const pool = this.pools[rarity];
    const land = pool[Math.floor(this.rng() * pool.length)];
    const sideX = Math.cos(m.facing) * 0.9;
    const sideZ = -Math.sin(m.facing) * 0.9;
    game.cards.drop(land, this.tmp2.set(m.pos.x + sideX, ground, m.pos.z + sideZ));
    // and sometimes the monster itself
    const owned = game.cards.binder.owned(m.def.card) > 0;
    const turned = !owned || this.rng() < BESTIARY_AGAIN;
    if (turned) game.cards.drop(cardByNo(m.def.card), this.tmp2.set(m.pos.x - sideX, ground, m.pos.z - sideZ));
    game.hud.notice(turned ? `The ${m.def.name} turned into a card!` : `${m.def.name} beaten`);
    console.info(`[monsters] beat ${m.def.name} #${m.id}: dropped #${land.no} ${land.name} (${rarity})${turned ? ` and its own card #${m.def.card}` : ''}`);
  }

  // --- per kind ------------------------------------------------------------------------------

  private lanternwing(m: Lanternwing, dt: number, game: Game): void {
    const player = game.player;
    const world = this.world;
    m.t += dt;
    m.cd -= dt;
    const center = this.tmp.copy(m.pos);
    if (!m.engaged) {
      if (this.fightable(m, game, 30) && this.sees(center, this.chest)) this.engage(m, game);
    } else if (!this.fightable(m, game, 48) || Math.hypot(m.pos.x - m.anchor.x, m.pos.z - m.anchor.z) > 85) {
      this.disengage(m);
      if (m.state !== 'idle') m.state = 'idle';
    }

    // where it wants to be: circling you at range, or drifting around home
    let tx: number;
    let tz: number;
    let ty: number;
    if (m.engaged) {
      m.orbit += dt * 0.32 * m.orbitDir;
      tx = player.pos.x + Math.cos(m.orbit) * 14;
      tz = player.pos.z + Math.sin(m.orbit) * 14;
      ty = Math.max(world.heightAt(tx, tz) + 4.6, player.pos.y + 3.4);
    } else {
      m.orbit += dt * 0.16 * m.orbitDir;
      tx = m.anchor.x + Math.cos(m.orbit) * 7;
      tz = m.anchor.z + Math.sin(m.orbit) * 7;
      ty = world.heightAt(tx, tz) + HOVER;
    }

    if (m.state === 'charge') {
      m.glow = Math.min(1, m.t / 0.6);
      if (m.t >= 0.6) {
        m.state = 'fire';
        m.t = 0;
        m.volley = 3;
        m.cd = 0;
      }
    } else if (m.state === 'fire') {
      if (m.cd <= 0 && m.volley > 0) {
        this.fireOrb(m, game);
        m.volley--;
        m.cd = 0.17;
      }
      if (m.volley === 0 && m.cd <= 0) {
        m.state = 'idle';
        m.cd = 2.3 + this.rng() * 0.9;
      }
    } else if (m.engaged && m.cd <= 0) {
      if (this.sees(center, this.chest)) {
        m.state = 'charge';
        m.t = 0;
        game.sfx.orbCharge(this.vol(m, game));
      } else m.cd = 0.6;
    }
    if (m.state !== 'charge' && m.state !== 'fire') m.glow = damp(m.glow, 0, 6, dt);

    // fly there, slowing to a hover while it shoots
    const holding = m.state === 'charge' || m.state === 'fire';
    let wx = tx - m.pos.x;
    let wy = ty - m.pos.y;
    let wz = tz - m.pos.z;
    const wl = Math.hypot(wx, wy, wz) || 1;
    const speed = holding ? 0 : 6.5 * Math.min(1, wl / 4);
    wx = (wx / wl) * speed;
    wy = (wy / wl) * speed;
    wz = (wz / wl) * speed;
    m.vel.x = damp(m.vel.x, wx, 2.5, dt);
    m.vel.y = damp(m.vel.y, wy, 2.5, dt);
    m.vel.z = damp(m.vel.z, wz, 2.5, dt);
    m.pos.addScaledVector(m.vel, dt);
    const floor = world.groundAt(m.pos.x, m.pos.z, m.pos.y, 0.6) + 2.2;
    if (m.pos.y < floor) {
      m.pos.y = damp(m.pos.y, floor, 8, dt);
      if (m.vel.y < 0) m.vel.y = 0;
    }
    if (world.solidAt(m.pos.x, m.pos.y, m.pos.z, 0.6)) m.pos.y += 5 * dt; // rise out of a canopy or a roof

    const yaw = m.engaged ? this.yawTo(m, player.pos.x, player.pos.z) : Math.atan2(m.vel.x, m.vel.z);
    if (m.engaged || Math.hypot(m.vel.x, m.vel.z) > 0.3) m.facing = dampAngle(m.facing, yaw, 5, dt);
    this.pose(m, game.time);
    if (this.rng() < dt * 2.5) game.fx.mote(this.tmp2.set(m.pos.x, m.pos.y - 0.7, m.pos.z), this.tint.glow, 0.22, 0.6, 0.3, -0.6, 2.2);
  }

  private fireOrb(m: Lanternwing, game: Game): void {
    const player = game.player;
    const from = this.tmp2.set(m.pos.x + Math.sin(m.facing) * 0.55, m.pos.y + 0.05, m.pos.z + Math.cos(m.facing) * 0.55);
    const flight = from.distanceTo(this.chest) / ORB_SPEED;
    // leads a moving target by half: strafing still dodges, standing still never does
    const aim = this.tmp3.set(this.chest.x + player.vel.x * flight * 0.5, this.chest.y, this.chest.z + player.vel.z * flight * 0.5);
    const vel = aim.sub(from).normalize().multiplyScalar(ORB_SPEED);
    this.shots.orb(from, vel, m, this.tint.glow, 11);
    game.fx.flash(from, this.tint.glow, 1.6, 0.15, 2.4);
    game.sfx.orbFire(this.vol(m, game));
  }

  private thornmortar(m: Thornmortar, dt: number, game: Game): void {
    const player = game.player;
    m.t += dt;
    m.cd -= dt;
    m.bristleCd -= dt;
    const core = this.tmp.set(m.pos.x, m.pos.y + 1.05, m.pos.z);
    const d = this.dist(m, game);
    const dy = player.pos.y - m.pos.y;
    if (!m.engaged) {
      if (this.fightable(m, game, 36) && this.sees(core, this.chest)) this.engage(m, game);
    } else if (!this.fightable(m, game, 52)) this.disengage(m);

    if (m.state === 'idle') {
      m.gape = damp(m.gape, 0, 10, dt);
      if (m.engaged && d < 4.4 && Math.abs(dy) < 2.6 && m.bristleCd <= 0) {
        m.state = 'bristle';
        m.t = 0;
      } else if (m.engaged && m.cd <= 0) {
        if (this.sees(core, this.chest)) {
          m.state = 'opening';
          m.t = 0;
        } else m.cd = 0.7;
      }
    } else if (m.state === 'opening') {
      m.gape = Math.min(1, m.t / 0.55);
      if (m.t >= 0.55) {
        this.lobPod(m, game);
        m.state = 'open';
        m.t = 0;
      }
    } else if (m.state === 'open') {
      m.gape = 1;
      if (m.t >= 0.9) {
        m.state = 'closing';
        m.t = 0;
      }
    } else if (m.state === 'closing') {
      m.gape = Math.max(0, 1 - m.t / 0.35);
      if (m.t >= 0.35) {
        m.state = 'idle';
        m.cd = 1.4 + this.rng() * 0.9;
      }
    } else if (m.state === 'bristle') {
      m.gape = damp(m.gape, 0.22, 12, dt);
      if (m.t >= 0.5) {
        this.spores(m, game);
        m.state = 'idle';
        m.bristleCd = 3.2;
        m.cd = Math.max(m.cd, 0.8);
      }
    }
    if (m.engaged) m.facing = dampAngle(m.facing, this.yawTo(m, player.pos.x, player.pos.z), 2, dt);
    this.pose(m, game.time);
  }

  private lobPod(m: Thornmortar, game: Game): void {
    const player = game.player;
    const from = this.tmp2.set(m.pos.x, m.pos.y + 1.45, m.pos.z);
    const d = this.dist(m, game);
    const flight = clamp(0.85 + d / 30, 0.95, 1.7);
    const tx = player.pos.x + player.vel.x * flight * 0.45;
    const tz = player.pos.z + player.vel.z * flight * 0.45;
    const target = this.tmp3.set(tx, this.world.groundAt(tx, tz, player.pos.y + 1.5, 0.3), tz);
    this.shots.pod(from, target, flight, m, this.tint.pod, 16, 2.6, game);
    game.fx.burst(from, this.tint.plantTip, 14, 3, 0.26, 0.5, 2, 2.2);
    game.sfx.lob(this.vol(m, game));
  }

  /** Too close: a ring of spores bursts out of the bud. */
  private spores(m: Thornmortar, game: Game): void {
    const at = this.tmp2.set(m.pos.x, m.pos.y + 0.3, m.pos.z);
    game.fx.ring(at, this.tint.plantTip, 0.6, 4.6, 0.45, 2.6);
    game.fx.burst(this.tmp2.set(m.pos.x, m.pos.y + 1, m.pos.z), this.tint.plantTip, 40, 8, 0.32, 0.5, 1, 2.4);
    game.sfx.spores(this.vol(m, game));
    const p = game.player;
    if (p.hp > 0 && Math.hypot(p.pos.x - m.pos.x, p.pos.z - m.pos.z) < 4.6 && Math.abs(p.pos.y - m.pos.y) < 2.6) p.hurt(12, m.pos.x, m.pos.z);
  }

  private rumbleback(m: Rumbleback, dt: number, game: Game): void {
    const player = game.player;
    const world = this.world;
    m.t += dt;
    m.cd -= dt;
    const eye = this.tmp.set(m.pos.x, m.pos.y + 1.2, m.pos.z);
    const busy = m.state === 'roll' || m.state === 'skid' || m.state === 'dazed' || m.state === 'recover';
    if (!m.engaged) {
      if (this.fightable(m, game, 28) && this.sees(eye, this.chest)) this.engage(m, game);
    } else if (!busy && !this.fightable(m, game, 46)) {
      this.disengage(m);
      if (m.state === 'notice' || m.state === 'windup') m.state = 'idle';
    }

    if (m.state === 'idle') {
      m.wanderT -= dt;
      if (m.wanderT <= 0) {
        const a = this.rng() * Math.PI * 2;
        const r = 3 + this.rng() * 6;
        m.wander.set(m.anchor.x + Math.cos(a) * r, 0, m.anchor.z + Math.sin(a) * r);
        m.wanderT = 4 + this.rng() * 3;
      }
      const wx = m.wander.x - m.pos.x;
      const wz = m.wander.z - m.pos.z;
      const wl = Math.hypot(wx, wz);
      if (wl > 1 && !m.engaged) {
        const nx = m.pos.x + (wx / wl) * 1.6 * dt;
        const nz = m.pos.z + (wz / wl) * 1.6 * dt;
        if (world.heightAt(nx, nz) > 0.4 && !world.solidAt(nx, world.heightAt(nx, nz) + 0.9, nz, 1.1)) {
          m.pos.set(nx, world.heightAt(nx, nz), nz);
          m.facing = dampAngle(m.facing, Math.atan2(wx, wz), 3, dt);
        } else m.wanderT = 0;
      }
      if (m.engaged && m.cd <= 0) {
        m.state = 'notice';
        m.t = 0;
      }
    } else if (m.state === 'notice') {
      m.facing = dampAngle(m.facing, this.yawTo(m, player.pos.x, player.pos.z), 6, dt);
      if (m.t >= 0.45) {
        m.state = 'windup';
        m.t = 0;
        game.sfx.rumble(this.vol(m, game));
        const from = this.tmp2.set(m.pos.x, m.pos.y + 0.2, m.pos.z);
        const to = this.tmp3.set(m.pos.x + Math.sin(m.facing) * 14, m.pos.y + 0.2, m.pos.z + Math.cos(m.facing) * 14);
        game.fx.streak(from, to, '#ff5a3c', 0.95, 0.35, 1.8);
      }
    } else if (m.state === 'windup') {
      // tracks you until just before it lets go
      if (m.t < 0.6) m.facing = dampAngle(m.facing, this.yawTo(m, player.pos.x, player.pos.z), 9, dt);
      if (Math.floor(m.t / 0.24) !== Math.floor((m.t - dt) / 0.24)) {
        game.fx.dustPuff(this.tmp2.set(m.pos.x + Math.sin(m.facing) * 0.9, m.pos.y, m.pos.z + Math.cos(m.facing) * 0.9), 5, 2.2, 0.55);
      }
      if (m.t >= 0.95) {
        m.state = 'roll';
        m.t = 0;
        m.speed = 6;
        m.travelled = 0;
        m.struck = false;
        m.dir.set(Math.sin(m.facing), 0, Math.cos(m.facing));
      }
    } else if (m.state === 'roll') {
      m.curl = damp(m.curl, 1, 14, dt);
      m.speed = Math.min(ROLL_SPEED, m.speed + 40 * dt);
      if (m.t < 0.45) {
        // a little homing early on, so standing still is never safe; a step aside always is
        const want = this.yawTo(m, player.pos.x, player.pos.z);
        const now = Math.atan2(m.dir.x, m.dir.z);
        let diff = want - now;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const turn = clamp(diff, -0.22 * dt, 0.22 * dt);
        m.dir.set(Math.sin(now + turn), 0, Math.cos(now + turn));
        m.facing = now + turn;
      }
      const end = this.roll(m, m.speed * dt, true);
      m.spin += (m.speed * dt) / 1.05;
      this.rollHits(m, game);
      if (end === 'crash') this.crash(m, game);
      else if (end === 'stop' || m.t > 1.9 || m.travelled > 36) {
        m.state = 'skid';
        m.t = 0;
      }
      if (this.rng() < dt * 12) game.fx.dustPuff(this.tmp2.set(m.pos.x, m.pos.y, m.pos.z), 2, 1.4, 0.6);
    } else if (m.state === 'skid') {
      m.speed = damp(m.speed, 0, 5, dt);
      this.roll(m, m.speed * dt, false);
      m.spin += (m.speed * dt) / 1.05;
      if (m.speed > 4) this.rollHits(m, game);
      if (m.t >= 0.8) {
        m.state = 'recover';
        m.t = 0;
      }
    } else if (m.state === 'dazed') {
      m.flip = Math.min(1, m.t / 0.35);
      if (this.rng() < dt * 14) {
        const a = game.time * 6 + this.rng();
        game.fx.mote(this.tmp2.set(m.pos.x + Math.cos(a) * 0.9, m.pos.y + 2.2, m.pos.z + Math.sin(a) * 0.9), '#fff3a0', 0.3, 0.45, 0.2, 0.4, 2.6);
      }
      if (m.t >= DAZE) {
        m.state = 'recover';
        m.t = 0;
      }
    } else if (m.state === 'recover') {
      m.flip = damp(m.flip, 0, 9, dt);
      if (m.t >= 0.6) {
        m.state = 'idle';
        m.flip = 0;
        m.cd = 1 + this.rng() * 0.6;
      }
    }
    if (m.state !== 'roll' && m.state !== 'skid') {
      m.curl = damp(m.curl, 0, m.state === 'dazed' ? 14 : 6, dt);
      const full = Math.PI * 2;
      m.spin = damp(m.spin, Math.round(m.spin / full) * full, 8, dt); // settle the shell back upright
    }
    this.pose(m, game.time);
  }

  /** Moves a rolling Rumbleback forward; says why it stopped, if it did. */
  private roll(m: Rumbleback, dist: number, canCrash: boolean): 'ok' | 'crash' | 'stop' {
    const world = this.world;
    while (dist > 0) {
      const step = Math.min(0.3, dist);
      dist -= step;
      const nx = m.pos.x + m.dir.x * step;
      const nz = m.pos.z + m.dir.z * step;
      const h = world.heightAt(nx, nz);
      if (h < 0.25) return 'stop'; // the shore: it won't roll into the sea
      const blocked = world.solidAt(nx + m.dir.x * 1.05, h + 0.9, nz + m.dir.z * 1.05, 0.25) || h - m.pos.y > 0.32;
      if (blocked) return canCrash ? 'crash' : 'stop';
      m.pos.set(nx, h, nz);
      m.travelled += step;
    }
    return 'ok';
  }

  private rollHits(m: Rumbleback, game: Game): void {
    const p = game.player;
    if (m.struck || p.hp <= 0) return;
    const cy = m.pos.y + RUMBLE_PIVOT;
    const y = clamp(cy, p.pos.y + 0.25, p.pos.y + 1.55);
    if (Math.hypot(p.pos.x - m.pos.x, y - cy, p.pos.z - m.pos.z) > 1.15 + 0.45) return;
    m.struck = true;
    if (p.wardActive) {
      // it bounces off the bubble as if it hit a wall
      p.hurt(0, m.pos.x, m.pos.z);
      game.fx.ring(this.tmp2.set(p.pos.x, p.pos.y + 0.9, p.pos.z), '#8cffc1', 0.6, 3, 0.35, 2.6);
      if (m.state === 'roll') this.crash(m, game);
      return;
    }
    p.hurt(26, m.pos.x, m.pos.z);
    p.vel.x += m.dir.x * 9;
    p.vel.z += m.dir.z * 9;
    p.vel.y = Math.max(p.vel.y, 8);
    game.fx.shake(0.6);
    console.info(`[monsters] Rumbleback #${m.id} ran you over`);
  }

  private crash(m: Rumbleback, game: Game): void {
    m.state = 'dazed';
    m.t = 0;
    m.speed = 0;
    const front = this.tmp2.set(m.pos.x + m.dir.x * 1.1, m.pos.y + 0.9, m.pos.z + m.dir.z * 1.1);
    game.fx.burst(front, this.tint.shell, 34, 7, 0.36, 0.6, 12, 1.6);
    game.fx.burst(front, '#fff3a0', 12, 4, 0.26, 0.4, 0, 2.6);
    game.fx.dustPuff(this.tmp3.set(m.pos.x, m.pos.y, m.pos.z), 12, 3.5, 0.9);
    const d = this.dist(m, game);
    if (d < 25) game.fx.shake(0.6 * (1 - d / 25));
    game.sfx.crash(this.vol(m, game));
    console.info(`[monsters] Rumbleback #${m.id} crashed and is dazed`);
  }

  private snapjack(m: Snapjack, dt: number, game: Game): void {
    const player = game.player;
    const world = this.world;
    m.t += dt;
    m.biteCd -= dt;
    const dx = player.pos.x - m.pos.x;
    const dz = player.pos.z - m.pos.z;
    const d = Math.hypot(dx, dz);
    if (m.state === 'disguised') {
      if (d < 5 && Math.abs(player.pos.y - m.pos.y) < 2.6 && this.fightable(m, game, 6)) {
        m.state = 'tremble';
        m.t = 0;
      }
    } else if (m.state === 'tremble') {
      if (m.t >= 0.45) this.reveal(m, game, true);
    } else if (m.state === 'chase' || m.state === 'return') {
      if (m.state === 'chase') {
        m.lostT = this.fightable(m, game, 26) ? 0 : m.lostT + dt;
        if (m.lostT > 3) {
          m.state = 'return';
          m.t = 0;
          m.engaged = false;
        }
      }
      const home = m.state === 'return';
      const gx = home ? m.anchor.x - m.pos.x : dx;
      const gz = home ? m.anchor.z - m.pos.z : dz;
      const gl = Math.hypot(gx, gz) || 1;
      m.hopT -= dt;
      if (m.grounded && m.hopT <= 0 && gl > 0.8) {
        m.vel.set((gx / gl) * 8.5, 5.4, (gz / gl) * 8.5);
        m.grounded = false;
        m.hopT = 0.36;
        m.gape = 1;
      }
      m.facing = dampAngle(m.facing, Math.atan2(gx, gz), 10, dt);
      if (home && gl < 1.4 && m.grounded) {
        // back to its post, folded flat and whole again
        m.state = 'disguised';
        m.t = 0;
        m.hp = m.def.hp;
        m.lift = 1.3;
        m.radius = 0.62;
        m.vel.set(0, 0, 0);
        m.pos.copy(m.anchor);
      }
      if (!home && m.biteCd <= 0 && player.hp > 0) {
        const cy = m.pos.y + 0.45;
        const y = clamp(cy, player.pos.y + 0.25, player.pos.y + 1.55);
        const bx = m.pos.x + Math.sin(m.facing) * 0.35;
        const bz = m.pos.z + Math.cos(m.facing) * 0.35;
        if (Math.hypot(player.pos.x - bx, y - cy, player.pos.z - bz) < 1.05) {
          m.biteCd = 0.9;
          m.gape = 0;
          player.hurt(14, m.pos.x, m.pos.z);
          game.sfx.bite(this.vol(m, game));
        }
      }
    } else if (m.state === 'yanked') {
      const k = Math.min(1, m.t / 0.55);
      const e = k * k * (3 - 2 * k);
      const arc = Math.sin(k * Math.PI) * Math.min(6, m.from.distanceTo(m.to) * 0.2);
      m.pos.lerpVectors(m.from, m.to, e);
      m.pos.y += arc;
      if (k >= 1) {
        m.state = 'stunned';
        m.t = 0;
        m.grounded = false;
        m.vel.set(0, 0, 0);
        game.fx.dustPuff(this.tmp2.copy(m.pos), 6, 2, 0.5);
      }
    } else if (m.state === 'stunned') {
      m.gape = 0.55 + Math.sin(game.time * 9) * 0.08;
      if (this.rng() < dt * 10) {
        const a = game.time * 6;
        game.fx.mote(this.tmp2.set(m.pos.x + Math.cos(a) * 0.5, m.pos.y + 1.1, m.pos.z + Math.sin(a) * 0.5), '#fff3a0', 0.26, 0.4, 0.2, 0.3, 2.6);
      }
      if (m.t >= 2.4) {
        m.state = 'chase';
        m.t = 0;
        m.engaged = true;
      }
    }

    // hopping physics once it's out of disguise
    const loose = m.state === 'chase' || m.state === 'return' || m.state === 'stunned';
    if (loose) {
      if (!m.grounded) m.vel.y -= 24 * dt;
      m.pos.addScaledVector(m.vel, dt);
      const ground = world.groundAt(m.pos.x, m.pos.z, m.pos.y, 0.45);
      if (m.pos.y <= ground) {
        m.pos.y = ground;
        // still rising means the slope came up to meet it: ride up the hill instead of stopping dead
        if (m.vel.y <= 0) {
          m.vel.set(0, 0, 0);
          m.grounded = true;
        }
      }
      if (ground < -0.3) {
        // into the water: paddle back toward home
        m.pos.y = Math.max(m.pos.y, -0.3);
        m.vel.x = (m.anchor.x - m.pos.x) * 0.3;
        m.vel.z = (m.anchor.z - m.pos.z) * 0.3;
      }
    }
    if (m.state !== 'stunned') m.gape = damp(m.gape, 0, 7, dt);
    const hidden = m.state === 'disguised' || m.state === 'tremble';
    m.fold = damp(m.fold, hidden ? 0 : 1, hidden ? 10 : 12, dt);
    this.pose(m, game.time);
  }

  private reveal(m: Snapjack, game: Game, lunge: boolean): void {
    const player = game.player;
    m.state = 'chase';
    m.t = 0;
    m.lostT = 0;
    m.lift = 0.6;
    m.radius = 0.78;
    m.pos.set(m.anchor.x, m.anchor.y + 0.85, m.anchor.z);
    m.grounded = false;
    m.engaged = true;
    const dx = player.pos.x - m.pos.x;
    const dz = player.pos.z - m.pos.z;
    const l = Math.hypot(dx, dz) || 1;
    m.facing = Math.atan2(dx, dz);
    m.vel.set(lunge ? (dx / l) * 7 : 0, lunge ? 5.5 : 3, lunge ? (dz / l) * 7 : 0);
    m.gape = 1;
    const at = this.tmp2.set(m.anchor.x, m.anchor.y + 1.3, m.anchor.z);
    game.fx.burst(at, '#ffd36b', 30, 6, 0.3, 0.5, 6, 2.6);
    game.fx.flash(at, '#ff6a5c', 2.6, 0.25, 2.4);
    game.sfx.reveal(this.vol(m, game));
    console.info(`[monsters] a card was a Snapjack (#${m.id})`);
  }

  /** Lodestar pulls every card in reach, and a Snapjack can't help coming along. Returns how many. */
  yank(center: THREE.Vector3, radius: number, game: Game): number {
    let n = 0;
    const p = game.player;
    for (const m of this.list) {
      if (m.kind !== 'snapjack' || !m.alive || m.state === 'yanked') continue;
      const disguised = m.state === 'disguised' || m.state === 'tremble';
      const y = disguised ? m.anchor.y + 1.3 : m.pos.y + 0.45;
      const x = disguised ? m.anchor.x : m.pos.x;
      const z = disguised ? m.anchor.z : m.pos.z;
      if (Math.hypot(x - center.x, y - center.y, z - center.z) > radius) continue;
      if (disguised) this.reveal(m, game, false);
      m.from.set(x, y - 0.45, z);
      const fx = -Math.sin(game.rig.yaw);
      const fz = -Math.cos(game.rig.yaw);
      const tx = p.pos.x + fx * 2.6;
      const tz = p.pos.z + fz * 2.6;
      m.to.set(tx, this.world.groundAt(tx, tz, p.pos.y + 1, 0.45), tz);
      m.state = 'yanked';
      m.t = 0;
      m.engaged = true;
      this.focus = m;
      m.lastHit = game.time;
      n++;
    }
    if (n > 0) console.info(`[monsters] lodestar dragged out ${n} Snapjack(s)`);
    return n;
  }

  // --- drawing --------------------------------------------------------------------------

  /** Copies a monster's state onto its meshes. */
  private pose(m: Monster, time: number): void {
    const flash = m.flash > 0;
    if (m.kind === 'lanternwing') {
      const M = m.model;
      M.group.position.set(m.pos.x, m.pos.y + Math.sin(time * 2.2 + m.phase) * 0.16, m.pos.z);
      M.group.rotation.y = m.facing;
      const fwd = m.vel.x * Math.sin(m.facing) + m.vel.z * Math.cos(m.facing);
      M.tilt.rotation.x = clamp(fwd * 0.05, -0.3, 0.3);
      M.tilt.rotation.z = Math.sin(time * 1.3 + m.phase) * 0.06;
      const shake = m.state === 'charge' ? m.glow * 0.04 : 0;
      M.tilt.position.set(Math.sin(time * 71) * shake, 0, Math.cos(time * 53) * shake);
      const flap = m.state === 'charge' || m.state === 'fire' ? 19 : 12;
      const infl = M.frame.morphTargetInfluences;
      if (infl) infl[0] = 0.5 + 0.5 * Math.sin(time * flap + m.phase);
      M.bodyMat.emissive.set(flash ? '#ffffff' : this.tint.glow);
      M.bodyMat.emissiveIntensity = flash ? 1.4 : 0.35 + m.glow * 1.4 + Math.sin(time * 17 + m.phase) * 0.05;
    } else if (m.kind === 'thornmortar') {
      const M = m.model;
      const shake = m.state === 'bristle' ? 0.05 : m.state === 'opening' ? 0.015 : 0;
      M.group.position.set(m.pos.x + Math.sin(time * 61) * shake, m.pos.y, m.pos.z + Math.cos(time * 47) * shake);
      M.group.rotation.y = m.facing;
      const infl = M.plant.morphTargetInfluences;
      if (infl) infl[0] = m.gape;
      const bright = 0.5 + m.gape * 1.9 + (m.state === 'opening' ? Math.sin(m.t * 40) * 0.15 : 0);
      M.coreMat.color.set(this.tint.pod).multiplyScalar(flash ? 3 : bright);
      M.core.scale.setScalar(1 + m.gape * 0.15 + Math.sin(time * 3 + m.phase) * 0.03);
      M.plantMat.emissive.set(flash ? '#ffffff' : '#000000');
      M.plantMat.emissiveIntensity = flash ? 0.7 : 0;
    } else if (m.kind === 'rumbleback') {
      const M = m.model;
      const hop = m.state === 'dazed' && m.t < 0.35 ? Math.sin((m.t / 0.35) * Math.PI) * 0.8 : 0;
      M.group.position.set(m.pos.x, m.pos.y - 0.22 * m.flip + hop, m.pos.z);
      M.group.rotation.y = m.facing;
      M.pose.rotation.z = m.flip * Math.PI;
      M.pose.rotation.x = m.state === 'windup' ? -0.2 * Math.min(1, m.t / 0.3) + Math.sin(m.t * 30) * 0.02 : 0;
      M.shell.rotation.x = m.spin;
      const c = m.curl;
      M.shell.scale.set(1 + c * (1 / 1.15 - 1) * 1.02, 1 + c * (1 / 0.78 - 1), 1 + c * (1 / 1.35 - 1) * 1.02);
      const tucked = c > 0.5;
      M.limbs.visible = !tucked;
      M.glow.visible = !tucked;
      const walking = m.state === 'idle' && !m.engaged;
      M.limbs.rotation.z = walking ? Math.sin(time * 9 + m.phase) * 0.05 : 0;
      M.limbs.rotation.x = m.state === 'dazed' ? Math.sin(time * 22) * 0.07 : 0;
      M.shellMat.emissive.set(flash ? '#ffffff' : '#000000');
      M.shellMat.emissiveIntensity = flash ? 0.8 : 0;
    } else {
      const M = m.model;
      const hidden = m.state === 'disguised' || m.state === 'tremble';
      if (hidden) {
        // passes for a card: same height, bob and spin as the real ones
        const jitter = m.state === 'tremble' ? 0.06 : 0;
        M.group.position.set(m.anchor.x + Math.sin(time * 67) * jitter, m.anchor.y + 1.3 + Math.sin(time * 2 + m.phase) * 0.16, m.anchor.z + Math.cos(time * 59) * jitter);
        M.group.rotation.set(0, time * 1.7 + m.phase, m.state === 'tremble' ? Math.sin(time * 55) * 0.14 : 0);
      } else {
        M.group.position.set(m.pos.x, m.pos.y + 0.45, m.pos.z);
        M.group.rotation.set(0, m.facing, 0);
      }
      // a card's size while it pretends, a bit bigger once it's a mouth, so it reads down in the grass
      M.group.scale.setScalar(1 + 0.3 * m.fold);
      const shut = Math.PI / 2 - m.gape * 0.62;
      M.top.rotation.x = m.fold * shut;
      M.bottom.rotation.x = -m.fold * shut;
      const showTeeth = m.fold > 0.3;
      for (const e of M.extras) e.visible = showTeeth;
      M.glow.visible = hidden;
      if (hidden) M.glow.material.opacity = 0.75 + 0.25 * Math.sin(time * 3 + m.phase);
    }
  }

  update(dt: number, game: Game): void {
    const t0 = performance.now();
    const player = game.player;
    this.chest.set(player.pos.x, player.pos.y + 1.1, player.pos.z);
    for (const m of this.list) {
      if (!m.alive) {
        if (game.time > m.respawnAt) this.respawn(m, game);
        continue;
      }
      const far = Math.hypot(m.pos.x - player.pos.x, m.pos.z - player.pos.z) > SLEEP;
      if (far) {
        m.group.visible = false;
        if (m.engaged) this.disengage(m);
        continue;
      }
      m.group.visible = true;
      m.flash = Math.max(0, m.flash - dt);
      if (m.kind === 'lanternwing') this.lanternwing(m, dt, game);
      else if (m.kind === 'thornmortar') this.thornmortar(m, dt, game);
      else if (m.kind === 'rumbleback') this.rumbleback(m, dt, game);
      else this.snapjack(m, dt, game);
    }
    this.shots.update(dt, game);
    this.ms = this.ms * 0.95 + (performance.now() - t0) * 0.05;
  }

  /** The player died or left: everyone calms down and every shot in the air is gone. */
  calm(): void {
    for (const m of this.list) {
      m.engaged = false;
      if (m.kind === 'lanternwing' && m.state !== 'idle') m.state = 'idle';
    }
    this.shots.clear();
  }

  // --- HUD ----------------------------------------------------------------------------------

  private status(m: Monster): Status {
    if (m.kind === 'lanternwing') return m.state === 'charge' ? STATUS.charging : m.state === 'fire' ? STATUS.firing : QUIET;
    if (m.kind === 'thornmortar') {
      if (m.state === 'bristle') return STATUS.bristle;
      return m.gape > 0.35 ? STATUS.open : STATUS.armored;
    }
    if (m.kind === 'rumbleback') {
      if (m.state === 'dazed') return STATUS.dazed;
      if (m.state === 'windup') return STATUS.windup;
      if (m.state === 'roll') return STATUS.rolling;
      if (m.state === 'skid' || m.state === 'recover') return QUIET;
      return STATUS.armored;
    }
    return m.state === 'stunned' ? STATUS.stunned : QUIET;
  }

  /** The monster the HUD should show: the one you hit last, else the nearest one fighting you. */
  focusInfo(game: Game): FoeInfo | null {
    let best: Monster | null = null;
    if (this.focus && this.focus.alive && game.time - this.focus.lastHit < 5) best = this.focus;
    else {
      let bestD = 34;
      for (const m of this.list) {
        if (!m.alive || !m.engaged) continue;
        if (m.kind === 'snapjack' && (m.state === 'disguised' || m.state === 'tremble')) continue;
        const d = this.dist(m, game);
        if (d < bestD) {
          bestD = d;
          best = m;
        }
      }
    }
    if (!best) return null;
    if (!tipShownAt.has(best.kind)) tipShownAt.set(best.kind, game.time);
    const shown = tipShownAt.get(best.kind) ?? game.time;
    const s = this.status(best);
    const info = this.info; // one object, refilled each frame
    info.id = best.id;
    info.name = best.def.name;
    info.frac = clamp(best.hp / best.def.hp, 0, 1);
    info.status = s.text;
    info.tone = s.tone;
    info.tip = game.time - shown < 8 ? best.def.tip : '';
    return info;
  }

  /** Monsters out in the open, for the minimap. A Snapjack in disguise never shows. */
  markers(game: Game): Array<{ x: number; z: number }> {
    this.marks.length = 0;
    for (const m of this.list) {
      if (!m.alive) continue;
      if (m.kind === 'snapjack' && (m.state === 'disguised' || m.state === 'tremble')) continue;
      if (this.dist(m, game) > 80) continue;
      const k = this.marks.length;
      if (k === this.markPool.length) this.markPool.push({ x: 0, z: 0 });
      const p = this.markPool[k];
      p.x = m.pos.x;
      p.z = m.pos.z;
      this.marks.push(p);
    }
    return this.marks;
  }

  // --- test handles ---------------------------------------------------------------------

  debugList(): Array<{ id: number; kind: MonsterKind; state: State; hp: number; alive: boolean; engaged: boolean; pos: number[]; anchor: number[] }> {
    return this.list.map((m) => ({ id: m.id, kind: m.kind, state: m.state, hp: m.hp, alive: m.alive, engaged: m.engaged, pos: m.pos.toArray(), anchor: m.anchor.toArray() }));
  }

  /** Test handle: benches every monster not listed (gone until unbenched), so one can be tested alone. */
  isolate(keep: number[]): void {
    for (const m of this.list) {
      if (keep.includes(m.id)) {
        if (!m.alive) this.reset(m, m.anchor);
        continue;
      }
      m.alive = false;
      m.engaged = false;
      m.group.visible = false;
      m.respawnAt = Infinity;
    }
    this.shots.clear();
  }

  /** Test handle: jumps a monster straight into a state (e.g. a Rumbleback to 'dazed'). */
  force(id: number, state: State): void {
    const m = this.list.find((k) => k.id === id);
    if (!m) throw new Error(`[monsters] no monster ${id}`);
    m.state = state;
    m.t = 0;
    if (m.kind === 'snapjack' && state !== 'disguised' && state !== 'tremble') {
      m.lift = 0.6;
      m.radius = 0.78;
    }
  }

  /** Moves the first monster of a kind to (x, z) as if it lived there, fresh and calm. */
  place(kind: MonsterKind, x: number, z: number): number {
    const m = this.list.find((k) => k.kind === kind);
    if (!m) throw new Error(`[monsters] no ${kind} on ${this.world.land.id}`);
    this.reset(m, new THREE.Vector3(x, this.world.heightAt(x, z), z));
    return m.id;
  }
}
