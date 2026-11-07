import * as THREE from 'three';
import { CARDS, RARITY, type CardDef } from './catalog';
import { backTex, faceTexture } from './faces';
import { radialTexture } from '../fx';
import { beamMaterial } from '../world/structures';
import type { DayInfo, DealEntry, DealSpawn } from './daily';
import type { Game } from '../game';

// ---------------------------------------------------------------------------
// Binder: what you've collected, saved in localStorage.
// ---------------------------------------------------------------------------

const STORE_KEY = 'wildcard-isle:v1';

type SaveData = {
  v: 1;
  cards: Record<string, { count: number; first: string }>;
  days: Record<string, number[]>;
};

function emptySave(): SaveData {
  return { v: 1, cards: {}, days: {} };
}

export class Binder {
  private data: SaveData;
  private storageOk = true;

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STORE_KEY);
    } catch (err) {
      this.storageOk = false;
      console.warn('[binder] localStorage blocked; progress lasts this session only', err);
      return emptySave();
    }
    if (!raw) return emptySave();
    try {
      const parsed = JSON.parse(raw) as SaveData;
      if (parsed.v !== 1 || typeof parsed.cards !== 'object' || typeof parsed.days !== 'object') {
        throw new Error(`unexpected shape (v=${String((parsed as { v?: unknown }).v)})`);
      }
      console.info(`[binder] loaded ${Object.keys(parsed.cards).length} cards`);
      return parsed;
    } catch (err) {
      console.error('[binder] save data unreadable; starting a fresh binder. Raw value:', raw, err);
      return emptySave();
    }
  }

  private save(): void {
    if (!this.storageOk) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.data));
    } catch (err) {
      this.storageOk = false;
      console.warn('[binder] could not save progress', err);
    }
  }

  owned(no: number): number {
    return this.data.cards[String(no)]?.count ?? 0;
  }

  firstFound(no: number): string | null {
    return this.data.cards[String(no)]?.first ?? null;
  }

  uniqueCount(): number {
    return Object.keys(this.data.cards).length;
  }

  /** Returns true if this is the first copy. */
  add(card: CardDef, dayKey: string): boolean {
    const key = String(card.no);
    const entry = this.data.cards[key];
    if (entry) {
      entry.count++;
      this.save();
      return false;
    }
    this.data.cards[key] = { count: 1, first: dayKey };
    this.save();
    return true;
  }

  collectedToday(dayKey: string): Set<number> {
    return new Set(this.data.days[dayKey] ?? []);
  }

  markDeal(dayKey: string, index: number): void {
    const list = this.data.days[dayKey] ?? [];
    if (!list.includes(index)) list.push(index);
    this.data.days[dayKey] = list;
    this.save();
  }

  reset(): void {
    this.data = emptySave();
    this.save();
    console.info('[binder] reset');
  }
}

// ---------------------------------------------------------------------------
// Pickups: floating, spinning cards in the world.
// ---------------------------------------------------------------------------

type Pickup = {
  card: CardDef;
  dealIndex: number; // -1 for critter drops
  cotd: boolean;
  base: THREE.Vector3;
  group: THREE.Group;
  mesh: THREE.Mesh;
  glow: THREE.Sprite;
  beam: THREE.Mesh | null;
  state: 'idle' | 'pulled' | 'taken';
  t: number;
  phase: number;
  from: THREE.Vector3;
  pullT: number;
  pullDur: number;
};

const PICK_RADIUS = 1.7;
const cardGeo = new THREE.BoxGeometry(0.9, 1.26, 0.035);

export class Cards {
  readonly binder = new Binder();
  /** Today's whole deal across all lands (for the hand strip and binder). */
  readonly deal: DealEntry[];
  readonly group = new THREE.Group();
  private readonly pickups: Pickup[] = [];
  private readonly collected: Set<number>;
  private readonly day: DayInfo;
  private readonly edgeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd36b').multiplyScalar(1.4) });
  private readonly backMat = new THREE.MeshBasicMaterial({ map: backTex() });
  private readonly faceMats = new Map<number, THREE.MeshBasicMaterial>();
  private readonly beamMats: THREE.ShaderMaterial[] = [];
  private readonly tmp = new THREE.Vector3();
  private readonly chest = new THREE.Vector3();

  constructor(scene: THREE.Scene, deal: DealEntry[], here: DealSpawn[], day: DayInfo) {
    this.deal = deal;
    this.day = day;
    this.group.name = 'cards';
    scene.add(this.group);
    this.collected = this.binder.collectedToday(day.key);
    for (const s of here) {
      if (this.collected.has(s.index)) continue;
      this.spawn(s.card, new THREE.Vector3(s.pos.x, s.pos.y, s.pos.z), s.index, s.cotd);
    }
    console.info(`[cards] ${this.pickups.length} of ${here.length} cards dealt to this land are still out (${deal.length} across all lands)`);
  }

  /** Leaving a land: remove its pickups (the binder and today's progress persist). */
  dispose(): void {
    this.group.removeFromParent();
    for (const m of this.faceMats.values()) m.dispose();
    for (const m of this.beamMats) m.dispose();
    this.pickups.length = 0;
  }

  private faceMat(card: CardDef): THREE.MeshBasicMaterial {
    let m = this.faceMats.get(card.no);
    if (!m) {
      m = new THREE.MeshBasicMaterial({ map: faceTexture(card) });
      this.faceMats.set(card.no, m);
    }
    return m;
  }

  private spawn(card: CardDef, at: THREE.Vector3, dealIndex: number, cotd: boolean): Pickup {
    const r = RARITY[card.rarity];
    const group = new THREE.Group();
    group.position.copy(at);
    const face = this.faceMat(card);
    const mesh = new THREE.Mesh(cardGeo, [this.edgeMat, this.edgeMat, this.edgeMat, this.edgeMat, face, this.backMat]);
    mesh.castShadow = true;
    group.add(mesh);
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: radialTexture(),
        color: new THREE.Color(r.color).multiplyScalar(cotd ? 1.5 : card.rarity === 'common' ? 0.55 : 0.85),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    const size = cotd ? 3.6 : card.rarity === 'common' ? 2.2 : 2.7;
    glow.scale.set(size, size, size);
    glow.renderOrder = 9;
    group.add(glow);
    let beam: THREE.Mesh | null = null;
    if (cotd || card.rarity === 'rare' || card.rarity === 'mythic') {
      const mat = beamMaterial(cotd ? '#fff3c4' : r.color, cotd ? 0.55 : 0.4, true);
      this.beamMats.push(mat);
      beam = new THREE.Mesh(new THREE.CylinderGeometry(cotd ? 0.55 : 0.4, cotd ? 0.55 : 0.4, 90, 16, 1, true), mat);
      beam.position.y = 45 - 0.6;
      beam.renderOrder = 8;
      group.add(beam);
    }
    this.group.add(group);
    const p: Pickup = {
      card,
      dealIndex,
      cotd,
      base: at.clone(),
      group,
      mesh,
      glow,
      beam,
      state: 'idle',
      t: 0,
      phase: Math.random() * Math.PI * 2,
      from: new THREE.Vector3(),
      pullT: 0,
      pullDur: 0.6,
    };
    this.pickups.push(p);
    return p;
  }

  /** A critter popped and left a card behind. */
  drop(card: CardDef, at: THREE.Vector3): void {
    const p = this.spawn(card, at.clone().add(new THREE.Vector3(0, 0.9, 0)), -1, false);
    p.state = 'idle';
    console.info(`[cards] drop #${card.no} ${card.name}`);
  }

  /** Lodestar: every idle card within radius flies to the player. Returns how many. */
  pullAll(center: THREE.Vector3, radius: number): number {
    let n = 0;
    for (const p of this.pickups) {
      if (p.state !== 'idle') continue;
      const d = p.group.position.distanceTo(center);
      if (d > radius) continue;
      p.state = 'pulled';
      p.from.copy(p.group.position);
      p.pullT = 0;
      p.pullDur = 0.45 + d / 70;
      n++;
    }
    console.info(`[cards] lodestar pulled ${n} card(s)`);
    return n;
  }

  /** Uncollected deal cards, for the minimap and HUD. */
  remaining(): Array<{ x: number; z: number; rarity: CardDef['rarity']; cotd: boolean }> {
    const out: Array<{ x: number; z: number; rarity: CardDef['rarity']; cotd: boolean }> = [];
    for (const p of this.pickups) {
      if (p.state === 'taken') continue;
      out.push({ x: p.group.position.x, z: p.group.position.z, rarity: p.card.rarity, cotd: p.cotd });
    }
    return out;
  }

  dealStatus(): Array<{ card: CardDef; cotd: boolean; found: boolean; land: DealEntry['land'] }> {
    return this.deal.map((s) => ({ card: s.card, cotd: s.cotd, found: this.collected.has(s.index), land: s.land }));
  }

  get foundToday(): number {
    return this.collected.size;
  }

  private collect(p: Pickup, game: Game): void {
    p.state = 'taken';
    this.group.remove(p.group);
    const idx = this.pickups.indexOf(p);
    if (idx >= 0) this.pickups.splice(idx, 1);
    const isNew = this.binder.add(p.card, this.day.key);
    if (p.dealIndex >= 0) {
      this.collected.add(p.dealIndex);
      this.binder.markDeal(this.day.key, p.dealIndex);
    }
    const color = RARITY[p.card.rarity].color;
    this.chest.copy(game.player.pos).add(this.tmp.set(0, 1.2, 0));
    game.fx.burst(this.chest, color, p.cotd ? 70 : 34, 7, 0.32, 0.8, 2, 3.5);
    game.fx.flash(this.chest, color, p.cotd ? 7 : 4, 0.45, 2.5);
    game.fx.ring(game.player.pos.clone().add(this.tmp.set(0, 0.15, 0)), color, 0.5, p.cotd ? 9 : 4.5, 0.6, 2.2);
    game.sfx.pickup(p.cotd ? 'mythic' : p.card.rarity);
    game.player.avatar.setExpression?.(p.cotd ? 'surprised' : 'happy', p.cotd ? 2.2 : 1.4);
    game.hud.cardToast(p.card, isNew, p.cotd);
    console.info(
      `[card] +#${p.card.no} ${p.card.name} (${p.card.rarity}${p.cotd ? ', card of the day' : ''}${isNew ? ', NEW' : ''}) ` +
        `binder ${this.binder.uniqueCount()}/${CARDS.length}, today ${this.foundToday}/${this.deal.length}`,
    );
  }

  update(dt: number, game: Game): void {
    const player = game.player;
    this.chest.set(player.pos.x, player.pos.y + 1.1, player.pos.z);
    for (const m of this.beamMats) m.uniforms.uTime.value = game.time;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.t += dt;
      if (p.state === 'idle') {
        p.group.position.set(p.base.x, p.base.y + Math.sin(p.t * 2 + p.phase) * 0.16, p.base.z);
        p.mesh.rotation.y = p.t * 1.7 + p.phase;
        p.glow.material.opacity = 0.75 + 0.25 * Math.sin(p.t * 3 + p.phase);
        const dx = player.pos.x - p.base.x;
        const dz = player.pos.z - p.base.z;
        const dy = player.pos.y + 0.9 - p.base.y;
        if (dx * dx + dz * dz < PICK_RADIUS * PICK_RADIUS && Math.abs(dy) < 2.3) {
          p.state = 'pulled';
          p.from.copy(p.group.position);
          p.pullT = 0;
          p.pullDur = 0.22;
        }
      } else if (p.state === 'pulled') {
        p.pullT += dt;
        const k = Math.min(1, p.pullT / p.pullDur);
        const e = k * k * (3 - 2 * k);
        // Quadratic bezier arcing up and over into the player's hands.
        const midX = (p.from.x + this.chest.x) / 2;
        const midZ = (p.from.z + this.chest.z) / 2;
        const midY = Math.max(p.from.y, this.chest.y) + Math.min(7, p.from.distanceTo(this.chest) * 0.25);
        const a = (1 - e) * (1 - e);
        const b = 2 * (1 - e) * e;
        const c = e * e;
        p.group.position.set(
          a * p.from.x + b * midX + c * this.chest.x,
          a * p.from.y + b * midY + c * this.chest.y,
          a * p.from.z + b * midZ + c * this.chest.z,
        );
        p.mesh.rotation.y += dt * 14;
        const s = 1 - e * 0.6;
        p.group.scale.setScalar(s);
        if (p.beam) p.beam.visible = false;
        if (Math.random() < 0.6) game.fx.mote(p.group.position, RARITY[p.card.rarity].color, 0.3, 0.4, 0.4, 0);
        if (k >= 1) this.collect(p, game);
      }
    }
  }
}
