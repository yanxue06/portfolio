import * as THREE from 'three';
import { CARDS, type CardDef, type Habitat } from './cards/catalog';
import { backTex } from './cards/faces';
import { clamp, damp, dampAngle, hashString, mulberry32 } from './util/math';
import type { World } from './world/world';
import type { Game } from './game';
import type { Foe } from './foes';

// Jellyhops: wobbly jelly critters that each swallowed a card. Pop one with a
// spell and the card drops out. They hop around their home turf and chase you
// if you get close.

type Home = 'meadow' | 'beach' | 'forest' | 'mountain';

let COLORS: Record<Home, string> = {
  meadow: '#8de05a',
  beach: '#4fd3e0',
  forest: '#b07ae0',
  mountain: '#f0a65a',
};
const COUNTS: Record<Home, number> = { meadow: 11, beach: 6, forest: 7, mountain: 4 };
const MAX_HP = 3;
const RADIUS = 0.7;

export type Critter = Foe & {
  id: number;
  home: Home;
  group: THREE.Group;
  body: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  anchor: THREE.Vector3;
  hp: number;
  alive: boolean;
  chasing: boolean;
  grounded: boolean;
  hopTimer: number;
  squash: number;
  flash: number;
  contactCd: number;
  respawnAt: number;
  facing: number;
};

const bodyGeo = new THREE.SphereGeometry(0.66, 28, 20);
const eyeGeo = new THREE.SphereGeometry(0.15, 14, 10);
const pupilGeo = new THREE.SphereGeometry(0.075, 10, 8);
const shineGeo = new THREE.SphereGeometry(0.11, 10, 8);
const innerCardGeo = new THREE.PlaneGeometry(0.34, 0.48);
const eyeMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
const pupilMat = new THREE.MeshBasicMaterial({ color: '#1b1b2a' });
const shineMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff').multiplyScalar(1.6) });

function dropTable(home: Home, land: string): CardDef[] {
  const plain = (c: CardDef) => c.habitat !== 'bounty' && (c.rarity === 'common' || c.rarity === 'uncommon');
  if (land !== 'isle') return CARDS.filter((c) => c.land === land && plain(c));
  const habitat: Habitat = home;
  return CARDS.filter((c) => c.land === 'isle' && c.habitat === habitat && plain(c));
}

export class Critters {
  readonly list: Critter[] = [];
  readonly group = new THREE.Group();
  private readonly rng: () => number;
  private readonly world: World;
  private readonly tmp = new THREE.Vector3();
  popped = 0;

  constructor(scene: THREE.Scene, world: World, dayKey: string) {
    this.world = world;
    const c = world.land.critter;
    COLORS = { meadow: c.a, beach: c.b, forest: c.c, mountain: c.d };
    this.rng = mulberry32(hashString(`critters:${dayKey}:${world.land.id}`));
    this.group.name = 'critters';
    scene.add(this.group);
    let id = 0;
    for (const home of Object.keys(COUNTS) as Home[]) {
      for (let i = 0; i < COUNTS[home]; i++) this.list.push(this.make(id++, home));
    }
    console.info(`[critters] ${this.list.length} jellyhops on ${world.land.id}`);
  }

  dispose(): void {
    this.group.removeFromParent();
    for (const c of this.list) c.mat.dispose();
  }

  private findSpot(home: Home, avoid: THREE.Vector3 | null): THREE.Vector3 {
    const island = this.world.island;
    const gate = this.world.landmarks.gate;
    for (let tries = 0; tries < 800; tries++) {
      const x = (this.rng() * 2 - 1) * 310;
      const z = (this.rng() * 2 - 1) * 310;
      const h = island.heightAt(x, z);
      const forest = island.sample(island.forestMask, x, z);
      const stone = island.sample(island.stoneMask, x, z);
      let ok = false;
      // Strict habitat first; after 400 tries any dry, open ground will do (marsh and desert are odd shapes).
      if (tries > 400) ok = h > 0.8 && stone < 0.05;
      else if (home === 'meadow') ok = h > 2.5 && h < 26 && forest < 0.2 && stone < 0.05;
      else if (home === 'beach') ok = h > 0.5 && h < 2.4 && stone < 0.05;
      else if (home === 'forest') ok = forest > 0.45;
      else ok = h > 28 && h < 60;
      if (!ok) continue;
      if (Math.hypot(gate.x - x, gate.z - z) < 32) continue; // never on arrival
      if (avoid && Math.hypot(avoid.x - x, avoid.z - z) < 35) continue;
      return new THREE.Vector3(x, h, z);
    }
    throw new Error(`[critters] no room for a ${home} jellyhop`);
  }

  private make(id: number, home: Home): Critter {
    const color = new THREE.Color(COLORS[home]);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.18,
      metalness: 0,
      transparent: true,
      opacity: 0.9,
      emissive: color.clone().multiplyScalar(0.22),
    });
    const group = new THREE.Group();
    const body = new THREE.Mesh(bodyGeo, mat);
    body.castShadow = true;
    group.add(body);
    const inner = new THREE.Mesh(innerCardGeo, new THREE.MeshBasicMaterial({ map: backTex(), side: THREE.DoubleSide }));
    inner.position.set(0, 0.05, 0);
    inner.rotation.set(0.2, 0.5, 0.15);
    body.add(inner);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(side * 0.23, 0.2, 0.6);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(0, 0.0, 0.1);
      eye.add(pupil);
      body.add(eye);
    }
    const shine = new THREE.Mesh(shineGeo, shineMat);
    shine.position.set(-0.28, 0.42, 0.3);
    shine.scale.set(1, 0.6, 1);
    body.add(shine);
    const pos = this.findSpot(home, null);
    group.position.copy(pos);
    this.group.add(group);
    const c: Critter = {
      id,
      home,
      group,
      body,
      mat,
      pos,
      vel: new THREE.Vector3(),
      anchor: pos.clone(),
      hp: MAX_HP,
      alive: true,
      chasing: false,
      grounded: true,
      hopTimer: this.rng() * 1.5,
      squash: 0,
      flash: 0,
      contactCd: 0,
      respawnAt: 0,
      facing: this.rng() * Math.PI * 2,
      radius: RADIUS,
      lift: 0.55,
      hit: (amount, from, knock, _kind, game) => this.damage(c, amount, from, knock, game),
    };
    return c;
  }

  /** Living critters whose body is within `radius` of a point. */
  near(p: THREE.Vector3, radius: number, out: Critter[]): Critter[] {
    out.length = 0;
    for (const c of this.list) {
      if (!c.alive) continue;
      if (c.pos.distanceToSquared(p) < (radius + c.radius) * (radius + c.radius)) out.push(c);
    }
    return out;
  }

  center(c: Critter, out: THREE.Vector3): THREE.Vector3 {
    return out.set(c.pos.x, c.pos.y + 0.55, c.pos.z);
  }

  damage(c: Critter, amount: number, from: THREE.Vector3, knock: number, game: Game): void {
    if (!c.alive) return;
    c.hp -= amount;
    c.flash = 0.14;
    const dx = c.pos.x - from.x;
    const dz = c.pos.z - from.z;
    const len = Math.hypot(dx, dz) || 1;
    c.vel.set((dx / len) * knock, 4 + knock * 0.4, (dz / len) * knock);
    c.grounded = false;
    c.chasing = true;
    game.sfx.hit();
    if (c.hp > 0) return;
    this.pop(c, game);
  }

  private pop(c: Critter, game: Game): void {
    c.alive = false;
    c.group.visible = false;
    c.respawnAt = game.time + 25;
    this.popped++;
    const center = this.center(c, this.tmp);
    game.fx.burst(center, COLORS[c.home], 46, 8, 0.42, 0.75, 6, 2.6);
    game.fx.flash(center, '#ffffff', 3.2, 0.3, 2.2);
    game.fx.ring(new THREE.Vector3(c.pos.x, c.pos.y + 0.1, c.pos.z), COLORS[c.home], 0.4, 3.2, 0.45, 2);
    game.sfx.pop();
    const table = dropTable(c.home, this.world.land.id);
    if (table.length > 0 && Math.random() < 0.75) {
      const weights = table.map((t) => (t.rarity === 'common' ? 3 : 1));
      let r = Math.random() * weights.reduce((a, b) => a + b, 0);
      let pick = table[0];
      for (let i = 0; i < table.length; i++) {
        r -= weights[i];
        if (r <= 0) {
          pick = table[i];
          break;
        }
      }
      game.cards.drop(pick, c.pos);
    }
    console.info(`[critters] popped #${c.id} (${c.home}), ${this.popped} total`);
  }

  private respawn(c: Critter, game: Game): void {
    const spot = this.findSpot(c.home, game.player.pos);
    c.pos.copy(spot);
    c.anchor.copy(spot);
    c.vel.set(0, 0, 0);
    c.hp = MAX_HP;
    c.alive = true;
    c.chasing = false;
    c.group.visible = true;
    c.squash = 1;
  }

  update(dt: number, game: Game): void {
    const player = game.player;
    const world = this.world;
    for (const c of this.list) {
      if (!c.alive) {
        if (game.time > c.respawnAt) this.respawn(c, game);
        continue;
      }
      const toPlayerX = player.pos.x - c.pos.x;
      const toPlayerZ = player.pos.z - c.pos.z;
      const distPlayer = Math.hypot(toPlayerX, toPlayerZ);
      const dy = Math.abs(player.pos.y - c.pos.y);
      if (!c.chasing && distPlayer < 13 && dy < 5 && player.hp > 0) c.chasing = true;
      if (c.chasing && (distPlayer > 24 || dy > 8)) c.chasing = false;

      // Hop when grounded.
      c.hopTimer -= dt;
      if (c.grounded && c.hopTimer <= 0) {
        let dirX: number;
        let dirZ: number;
        if (c.chasing) {
          dirX = toPlayerX / (distPlayer || 1);
          dirZ = toPlayerZ / (distPlayer || 1);
        } else {
          const homeDx = c.anchor.x - c.pos.x;
          const homeDz = c.anchor.z - c.pos.z;
          const homeDist = Math.hypot(homeDx, homeDz);
          if (homeDist > 20) {
            dirX = homeDx / homeDist;
            dirZ = homeDz / homeDist;
          } else {
            const a = Math.random() * Math.PI * 2;
            dirX = Math.cos(a);
            dirZ = Math.sin(a);
          }
        }
        // Don't hop into the sea.
        if (world.heightAt(c.pos.x + dirX * 3, c.pos.z + dirZ * 3) < 0.4) {
          dirX = -dirX;
          dirZ = -dirZ;
        }
        const speed = c.chasing ? 5.2 : 2.6;
        c.vel.set(dirX * speed, c.chasing ? 7.5 : 6, dirZ * speed);
        c.grounded = false;
        c.hopTimer = c.chasing ? 0.45 + Math.random() * 0.25 : 1.1 + Math.random() * 1.4;
        c.facing = Math.atan2(dirX, dirZ);
      }

      // Physics
      if (!c.grounded) c.vel.y -= 24 * dt;
      c.pos.addScaledVector(c.vel, dt);
      const ground = world.groundAt(c.pos.x, c.pos.z, c.pos.y, 0.5);
      if (c.pos.y <= ground) {
        if (!c.grounded) c.squash = clamp(-c.vel.y / 10, 0.3, 1);
        c.pos.y = ground;
        c.vel.set(0, 0, 0);
        c.grounded = true;
      }
      if (ground < -0.2) {
        // Washed into the water: bob back toward home.
        c.pos.y = Math.max(c.pos.y, -0.2);
        c.vel.x = (c.anchor.x - c.pos.x) * 0.2;
        c.vel.z = (c.anchor.z - c.pos.z) * 0.2;
      }

      // Contact with the player
      c.contactCd -= dt;
      if (distPlayer < 1.3 && dy < 1.6 && c.contactCd <= 0 && player.hp > 0) {
        c.contactCd = 1.0;
        if (player.wardActive) {
          this.damage(c, 0, player.pos, 10, game);
          game.fx.ring(new THREE.Vector3(c.pos.x, c.pos.y + 0.6, c.pos.z), '#8cffc1', 0.5, 2.2, 0.35, 2.5);
        } else {
          player.hurt(9, c.pos.x, c.pos.z);
          c.vel.set(-toPlayerX * 2, 5, -toPlayerZ * 2);
          c.grounded = false;
        }
      }

      // Visuals: squash & stretch, wobble, hit flash.
      c.squash = damp(c.squash, 0, 9, dt);
      const stretch = c.grounded ? -c.squash * 0.35 : clamp(c.vel.y / 14, -0.25, 0.3);
      const wobble = Math.sin(game.time * 9 + c.id) * 0.03;
      const sy = 0.84 * (1 + stretch + wobble);
      const sxz = 1 / Math.sqrt(Math.max(0.4, 1 + stretch + wobble));
      c.body.scale.set(sxz, sy, sxz);
      c.body.position.y = 0.66 * sy;
      c.flash = Math.max(0, c.flash - dt);
      c.mat.emissive.set(c.flash > 0 ? '#ffffff' : COLORS[c.home]).multiplyScalar(c.flash > 0 ? 0.9 : 0.22);
      c.group.position.copy(c.pos);
      c.group.rotation.y = dampAngle(c.group.rotation.y, c.facing, 8, dt);
    }
  }
}
