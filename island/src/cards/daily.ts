import * as THREE from 'three';
import { CARDS, RARITY, type CardDef, type Habitat } from './catalog';
import { hashString, mulberry32 } from '../util/math';
import type { World } from '../world/world';
import type { Spot } from '../world/terrain';
import type { LandId } from '../world/lands/types';

// The daily deal: everyone on the same calendar day gets the same cards in the
// same places (like a daily puzzle). One Card of the Day (rare or mythic, any
// land) plus PER_LAND cards in each of the four lands. Day 1 is the launch date.
const LAUNCH = { y: 2026, m: 11, d: 6 };
export const PER_LAND = 5;
const LAND_ORDER: LandId[] = ['isle', 'sunscar', 'frostveil', 'mistmoor'];

export type DayInfo = { key: string; number: number; label: string };
export type DealEntry = { index: number; card: CardDef; cotd: boolean; land: LandId };
export type DealSpawn = DealEntry & { pos: Spot };

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function dayInfo(override: string | null): DayInfo {
  let date = new Date();
  if (override) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(override);
    if (!m) throw new Error(`[daily] bad ?day= value "${override}" (want YYYY-MM-DD)`);
    date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const dayMs = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const launchMs = Date.UTC(LAUNCH.y, LAUNCH.m - 1, LAUNCH.d);
  const number = Math.floor((dayMs - launchMs) / 86400000) + 1;
  const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return { key, number, label };
}

function weightedPick<T>(items: T[], weight: (t: T) => number, rng: () => number): T {
  let total = 0;
  for (const it of items) total += weight(it);
  let r = rng() * total;
  for (const it of items) {
    r -= weight(it);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

/** Which cards go to which land today. Positions are resolved per land when it loads. */
export function dealFor(day: DayInfo): DealEntry[] {
  const rng = mulberry32(hashString(`wildcard-isle:${day.key}`));
  const entries: DealEntry[] = [];
  const special = CARDS.filter((c) => c.rarity === 'rare' || c.rarity === 'mythic');
  const cotd = weightedPick(special, (c) => (c.rarity === 'rare' ? 1 : 0.45), rng);
  entries.push({ index: 0, card: cotd, cotd: true, land: cotd.land });
  for (const land of LAND_ORDER) {
    const pool = CARDS.filter((c) => c.land === land && c.rarity !== 'mythic' && c.no !== cotd.no);
    const counts = new Map<number, number>();
    let added = 0;
    while (added < PER_LAND) {
      const card = weightedPick(pool, (c) => RARITY[c.rarity].weight, rng);
      const n = counts.get(card.no) ?? 0;
      if (n >= (card.rarity === 'common' ? 2 : 1)) continue;
      counts.set(card.no, n + 1);
      entries.push({ index: entries.length, card, cotd: false, land });
      added++;
    }
  }
  console.info(`[deal] ${day.key} (day ${day.number}): ${entries.length} cards; card of the day #${cotd.no} ${cotd.name} in ${cotd.land}`);
  return entries;
}

type Rule = (x: number, z: number, h: number, slope: number, forest: number, stone: number) => boolean;

function openRule(world: World, habitat: Habitat): Rule {
  const summitY = world.landmarks.summit.y;
  if (habitat === 'meadow') return (_x, _z, h, slope, forest, stone) => h > 2.6 && h < 30 && forest < 0.15 && stone < 0.05 && slope < 0.3;
  if (habitat === 'beach') return (_x, _z, h, slope, _f, stone) => h > 0.35 && h < 2.1 && slope < 0.3 && stone < 0.05;
  if (habitat === 'forest') return (_x, _z, h, _s, forest) => forest > 0.5 && h > 1.5;
  if (habitat === 'mountain') return (_x, _z, h) => h > 30 && h < 78;
  if (habitat === 'high') return (_x, _z, h, slope) => h > Math.max(7, summitY * 0.35) && slope < 0.55;
  return (_x, _z, h, slope, _f, stone) => h > 0.8 && slope < 0.45 && stone < 0.05;
}

function sampleOpen(world: World, habitat: Habitat, rng: () => number, taken: Spot[]): Spot {
  const island = world.island;
  const rule = openRule(world, habitat);
  const n = new THREE.Vector3();
  for (let tries = 0; tries < 1500; tries++) {
    const x = (rng() * 2 - 1) * 320;
    const z = (rng() * 2 - 1) * 320;
    const h = island.heightAt(x, z);
    const slope = 1 - island.normalAt(x, z, n).y;
    const forest = island.sample(island.forestMask, x, z);
    const stone = island.sample(island.stoneMask, x, z);
    if (!rule(x, z, h, slope, forest, stone)) continue;
    let crowded = false;
    for (const t of taken) {
      if ((t.x - x) ** 2 + (t.z - z) ** 2 < 24 * 24) {
        crowded = true;
        break;
      }
    }
    if (crowded) continue;
    return { x, y: world.groundAt(x, z, 1000, 0.5) + 1.3, z };
  }
  throw new Error(`[daily] could not place a ${habitat} card on ${world.land.id} in 1500 tries`);
}

function spotList(world: World, habitat: Habitat): Spot[] | null {
  const s = world.structures.spots;
  if (habitat === 'town') return s.town ?? null;
  if (habitat === 'summit') return s.summit ?? null;
  if (habitat === 'ruins') return s.ruins ?? null;
  if (habitat === 'sky') return s.sky ?? null;
  if (habitat === 'landmark') return s.landmark ?? null;
  return null;
}

/** Positions for this land's share of the deal. Deterministic per day and land. */
export function placeDeal(entries: DealEntry[], day: DayInfo, world: World): DealSpawn[] {
  const rng = mulberry32(hashString(`wildcard-isle:${day.key}:${world.land.id}`));
  const taken: Spot[] = [];
  const out: DealSpawn[] = [];
  for (const e of entries) {
    if (e.land !== world.land.id) continue;
    const list = spotList(world, e.card.habitat);
    let pos: Spot;
    if (list && list.length) {
      const free = list.filter((p) => !taken.includes(p));
      const pool = free.length ? free : list;
      pos = pool[Math.floor(rng() * pool.length)];
    } else {
      pos = sampleOpen(world, e.card.habitat, rng, taken);
    }
    taken.push(pos);
    out.push({ ...e, pos });
  }
  return out;
}
