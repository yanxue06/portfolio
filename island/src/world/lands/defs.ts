import { isleGen } from './isle';
import { SUNSCAR_MESAS, sunscarGen } from './sunscar';
import { frostveilGen } from './frostveil';
import { mistmoorGen } from './mistmoor';
import { PathIndex } from './common';
import { createNoise2D, fbm, type Noise2D } from '../noise';
import { clamp, smoothstep } from '../../util/math';
import type { LandGen, LandId, Landmarks } from './types';
import type { TreeVariantDef } from '../trees';
import type { PlaceCandidate, PlaceResult } from '../foliage';

// ---------------------------------------------------------------------------
// Placement helpers. Nature clumps: groves, copses, boulder fields and stands
// of cactus or mushrooms, with open ground between. Each land thresholds a few
// smooth noise fields to decide where those clumps are, then thins everything
// near paths, the gate and the town so arrival and roads stay uncluttered.
// ---------------------------------------------------------------------------

/** Smooth 0..1 noise with blobs about 1/freq meters across (median 0.5, top 10% above ~0.73). */
function field(n: Noise2D, x: number, z: number, freq: number): number {
  return fbm(n, x * freq, z * freq, 2) * 0.5 + 0.5;
}

/**
 * 0 right beside a path, the gate plaza or the town, rising to 1 well away from them.
 * Built on first use from the land's own landmarks and paths (the same ones the terrain uses).
 */
function clearance(gen: LandGen, gateReach: number, townReach: number): (x: number, z: number) => number {
  let L: Landmarks | null = null;
  const paths = new PathIndex();
  return (x, z) => {
    if (!L) {
      L = gen.landmarks();
      for (const p of gen.paths(L)) paths.add(p);
    }
    const verge = smoothstep(3, 8, paths.query(x, z)); // PathIndex is exact out to 8 m
    const gate = smoothstep(19, 19 + gateReach, Math.hypot(x - L.gate.x, z - L.gate.z));
    const town = smoothstep(L.town.r + 4, L.town.r + 4 + townReach, Math.hypot(x - L.town.x, z - L.town.z));
    return verge * gate * town;
  };
}

/**
 * 0 at the outer edge of a forest mask, 1 in its thickest stands. The land's shade() folds stand
 * density into the mask (about 0.45 in airy woodland, 1 in thick stands), so this is tree density.
 */
function depth(forest: number): number {
  return smoothstep(0.08, 0.8, forest);
}

/** 1 in the sunny band along a forest's edge, where shrubs crowd; 0 in open ground and under the canopy. */
function margin(forest: number): number {
  return smoothstep(0.03, 0.2, forest) * (1 - smoothstep(0.3, 0.6, forest));
}

export type LayerDef = { tex: string; scale: number; tint: string; rough: number };

export type GrassDef = {
  base: string;
  tip: string;
  tip2: string;
  height: number;
  density: number;
  flowers: number; // 0 = none
  count: number;
};

export type AmbientKind = 'pollen' | 'dust' | 'snow' | 'fireflies';

export type LandDef = {
  id: LandId;
  name: string;
  title: string;
  blurb: string;
  accent: string;
  gen: LandGen;
  sky: {
    hdri: string;
    sunAzimuth: number; // where the sun should sit, atan2(z, x)
    env: number; // image-based light strength
    bg: number; // background brightness
    sun: number; // directional light strength
    hemi: number; // fill light strength (keeps anime characters readable)
    exposure: number;
    fogNear: number;
    fogFar: number;
  };
  water: { shallow: string; deep: string; foam: string; foamAmount: number };
  /** Optional fixed fog color (otherwise taken from the sky's horizon). */
  fogColor?: string;
  layers: [LayerDef, LayerDef, LayerDef, LayerDef, LayerDef];
  grass: GrassDef | null;
  trees: TreeVariantDef[];
  /** Decides what grows at a scatter point (null = nothing). Variants index into `trees`. */
  place(c: PlaceCandidate): PlaceResult;
  rockCap: number; // 0..1 how much base ground (moss/sand/snow) settles on boulders
  ambient: AmbientKind;
  critter: { a: string; b: string; c: string; d: string };
};

// --- Wildcard Isle: pine woods and oak woods, open meadows with the odd copse ----------------

const isleNoise = {
  species: createNoise2D(1102), // which species a wood is made of
  copse: createNoise2D(1103), // copses out in the meadows
  stones: createNoise2D(1104), // boulder fields
  shrubs: createNoise2D(1105), // where the edge shrubs bunch up
};
const isleOpen = clearance(isleGen, 28, 24);

/**
 * A wood's tree. `species` is a broad noise field, so each wood is mostly one kind: pine stands up
 * high and where it is high, aspen groves where it is low, oak and ash between. `u` is uniform 0..1.
 */
function isleTree(c: PlaceCandidate, u: number, species: number, grow: number): PlaceResult {
  const pine = 0.04 + 0.92 * clamp(smoothstep(0.5, 0.64, species) + smoothstep(16, 26, c.h), 0, 1);
  if (u < pine) return { kind: 'tree', variant: 3, scale: (0.75 + c.r2 * 0.5) * grow, trunk: 0.32 };
  const v = (u - pine) / (1 - pine);
  const aspen = 0.08 + 0.8 * smoothstep(0.42, 0.32, species);
  if (v < aspen) return { kind: 'tree', variant: 2, scale: (0.8 + c.r2 * 0.35) * grow, trunk: 0.3 };
  const w = (v - aspen) / (1 - aspen);
  if (w < 0.55) return { kind: 'tree', variant: 0, scale: (0.85 + c.r2 * 0.4) * grow, trunk: 0.45 };
  if (w < 0.8) return { kind: 'tree', variant: 1, scale: (0.85 + c.r2 * 0.3) * grow, trunk: 0.4 };
  return { kind: 'tree', variant: 4, scale: (0.9 + c.r2 * 0.3) * grow, trunk: 0.6 };
}

function isleBush(c: PlaceCandidate, u: number): PlaceResult {
  return { kind: 'tree', variant: u < 0.5 ? 5 : 6, scale: 0.7 + c.r2 * 0.6, trunk: 0 };
}

function islePlace(c: PlaceCandidate): PlaceResult {
  if (c.h < 0.4) return null;
  const open = isleOpen(c.x, c.z);
  if (open < 0.01) return null;
  const stones = field(isleNoise.stones, c.x, c.z, 0.05);
  // Beach: clean sand, with boulders gathered on a few rocky points.
  if (c.h < 2.3) {
    const p = 0.16 * smoothstep(0.68, 0.78, stones) * open;
    return c.r < p ? { kind: 'rock', scale: 0.35 + c.r2 * 0.8 } : null;
  }
  // Crags: scree in clusters below the cliffs, and the odd hardy pine.
  if (c.rock > 0.45) {
    const pRock = 0.12 * (0.15 + 0.85 * smoothstep(0.45, 0.68, stones)) * open;
    if (c.r < pRock) return { kind: 'rock', scale: 0.6 + c.r2 * 2.2 };
    if (c.r < pRock + 0.025 * open && c.h < 60) return { kind: 'tree', variant: 3, scale: 0.65 + c.r2 * 0.35, trunk: 0.32 };
    return null;
  }
  const species = field(isleNoise.species, c.x, c.z, 0.011);
  // Woods: thick stands and airy patches, bigger trees deep inside, shrubs along the sunny edge.
  if (c.forest > 0.03) {
    const deep = depth(c.forest);
    const pTree = 0.44 * deep * open;
    if (c.r < pTree) return isleTree(c, c.r / pTree, species, 0.85 + 0.2 * deep);
    const shrubby = smoothstep(0.42, 0.62, field(isleNoise.shrubs, c.x, c.z, 0.06));
    const pShrub = (0.24 * margin(c.forest) + 0.02 * deep) * shrubby * open;
    if (c.r < pTree + pShrub) return isleBush(c, (c.r - pTree) / pShrub);
    if (c.forest > 0.3) return null;
  }
  // Meadows: wide open grass. A copse here and there with shrubs round its rim, a lone oak, a few
  // boulders lying together.
  const copse = field(isleNoise.copse, c.x, c.z, 0.045);
  const pTree = (0.34 * smoothstep(0.76, 0.82, copse) + 0.0009) * open;
  if (c.r < pTree) {
    const u = c.r / pTree;
    if (c.h > 26) return { kind: 'tree', variant: 3, scale: 0.75 + c.r2 * 0.4, trunk: 0.32 };
    if (u < 0.45) return { kind: 'tree', variant: 0, scale: 0.85 + c.r2 * 0.4, trunk: 0.45 };
    if (u < 0.75) return { kind: 'tree', variant: 4, scale: 0.9 + c.r2 * 0.35, trunk: 0.6 };
    return { kind: 'tree', variant: 1, scale: 0.85 + c.r2 * 0.3, trunk: 0.4 };
  }
  const pShrub = (0.2 * smoothstep(0.7, 0.76, copse) * (1 - smoothstep(0.8, 0.84, copse)) + 0.0005) * open;
  if (c.r < pTree + pShrub) return isleBush(c, (c.r - pTree) / pShrub);
  const pRock = (0.08 * smoothstep(0.78, 0.86, stones) + 0.0006) * open;
  if (c.r < pTree + pShrub + pRock) {
    const u = (c.r - pTree - pShrub) / pRock;
    return { kind: 'rock', scale: u < 0.2 ? 2.0 + c.r2 * 1.6 : 0.4 + c.r2 * 0.9 };
  }
  return null;
}

export const ISLE: LandDef = {
  id: 'isle',
  name: 'Wildcard Isle',
  title: 'The First Deal',
  blurb: 'Rolling meadows, a harbor town and a crag you can see from anywhere.',
  accent: '#8fd36a',
  gen: isleGen,
  sky: {
    hdri: 'kloofendal_48d_partly_cloudy_puresky',
    sunAzimuth: 0.72,
    env: 0.75,
    bg: 1.0,
    sun: 2.8,
    hemi: 0.55,
    exposure: 1.0,
    fogNear: 180,
    fogFar: 1500,
  },
  water: { shallow: '#3fc6bd', deep: '#14507f', foam: '#f4f9ff', foamAmount: 1 },
  layers: [
    { tex: 'aerial_grass_rock', scale: 7, tint: '#a6c77a', rough: 1.0 },
    { tex: 'forest_ground_04', scale: 5, tint: '#e2d8c8', rough: 1.0 },
    { tex: 'aerial_rocks_02', scale: 11, tint: '#e8e4dc', rough: 1.0 },
    { tex: 'coast_sand_01', scale: 5, tint: '#fff4de', rough: 1.0 },
    { tex: 'cobblestone_floor_04', scale: 3.4, tint: '#f2ece2', rough: 1.0 },
  ],
  grass: { base: '#1f3d14', tip: '#6e9a3a', tip2: '#a6a552', height: 0.5, density: 1, flowers: 0.1, count: 160000 },
  trees: [
    { preset: 'Oak Medium', seed: 11, height: 11 },
    { preset: 'Ash Medium', seed: 23, height: 13 },
    { preset: 'Aspen Medium', seed: 37, height: 14 },
    { preset: 'Pine Medium', seed: 41, height: 15 },
    { preset: 'Oak Large', seed: 53, height: 15 },
    { preset: 'Bush 1', seed: 61, height: 2.2 },
    { preset: 'Bush 2', seed: 67, height: 1.8 },
  ],
  place: islePlace,
  rockCap: 0.55,
  ambient: 'pollen',
  critter: { a: '#8de05a', b: '#4fd3e0', c: '#b07ae0', d: '#f0a65a' },
};

// --- Sunscar: bare dunes, mesas with rubble aprons, an oasis, cactus in a few stands -----------

const sunNoise = {
  stand: createNoise2D(1201), // cactus stands
  scrub: createNoise2D(1202), // scrub patches
  stones: createNoise2D(1203), // where fallen blocks pile up
};
const sunOpen = clearance(sunscarGen, 24, 20);

/** 0..1: the rubble apron below a mesa's cliffs, where blocks fall and desert plants find water. */
function mesaApron(x: number, z: number): number {
  let best = 0;
  for (const m of SUNSCAR_MESAS) {
    const d = Math.hypot(x - m.x, z - m.z) - m.r;
    best = Math.max(best, smoothstep(10, 18, d) * (1 - smoothstep(30, 56, d)));
  }
  return best;
}

function sunscarPlace(c: PlaceCandidate): PlaceResult {
  if (c.h < -0.2) return null;
  const open = sunOpen(c.x, c.z);
  if (open < 0.01) return null;
  // The oasis stays lush: shade trees with scrub between them.
  if (c.forest > 0.3 && c.h > 0.6) {
    if (c.r < 0.22 * c.forest * open) return { kind: 'tree', variant: 0, scale: 0.8 + c.r2 * 0.5, trunk: 0.35 };
    if (c.r < 0.3 * open) return { kind: 'tree', variant: 2, scale: 0.8 + c.r2 * 0.6, trunk: 0 };
  }
  if (c.h < 1.2) return null;
  const stones = field(sunNoise.stones, c.x, c.z, 0.045);
  if (c.rock > 0.45) {
    const p = 0.1 * (0.15 + 0.85 * smoothstep(0.45, 0.68, stones)) * open;
    return c.r < p ? { kind: 'rock', scale: 0.7 + c.r2 * 2.6 } : null;
  }
  // Open desert. Plants and rubble gather on the mesa aprons and in a few stands; dune crests stay bare.
  const apron = mesaApron(c.x, c.z);
  const stand = field(sunNoise.stand, c.x, c.z, 0.02);
  const inStand = smoothstep(0.76, 0.82, stand);
  const pCactus = (0.2 * inStand * (0.45 + 0.55 * apron) + 0.0004) * open;
  if (c.r < pCactus) return { kind: 'prop', prop: 'cactus', scale: 0.55 + 0.4 * inStand + c.r2 * 0.5, trunk: 0.5 };
  const scrubby = smoothstep(0.6, 0.72, field(sunNoise.scrub, c.x, c.z, 0.05));
  const pScrub = (0.07 * scrubby * (0.25 + 0.75 * apron) + 0.0006) * open;
  if (c.r < pCactus + pScrub) return { kind: 'tree', variant: 2, scale: 0.6 + c.r2 * 0.5, trunk: 0 };
  const pSnag = (0.004 * (0.3 + 0.7 * scrubby) * (1 - 0.6 * apron)) * open;
  if (c.r < pCactus + pScrub + pSnag) return { kind: 'tree', variant: 1, scale: 0.8 + c.r2 * 0.5, trunk: 0.3 };
  const pRock = (0.07 * apron * smoothstep(0.5, 0.66, stones) + 0.0008) * open;
  if (c.r < pCactus + pScrub + pSnag + pRock) return { kind: 'rock', scale: 0.4 + c.r2 * (0.8 + 1.4 * apron) };
  return null;
}

export const SUNSCAR: LandDef = {
  id: 'sunscar',
  name: 'Sunscar Expanse',
  title: 'The Long Afternoon',
  blurb: 'Wind-combed dunes, mesas to climb, an oasis, and the adobe market of Dustwell.',
  accent: '#f0b45a',
  gen: sunscarGen,
  sky: { hdri: 'syferfontein_18d_clear_puresky', sunAzimuth: 2.5, env: 0.75, bg: 1.0, sun: 3.4, hemi: 0.45, exposure: 0.95, fogNear: 220, fogFar: 1700 },
  water: { shallow: '#45cdbd', deep: '#155e7c', foam: '#fbf6ea', foamAmount: 1 },
  layers: [
    { tex: 'sand_01', scale: 6, tint: '#f6dcae', rough: 1.0 },
    { tex: 'cracked_red_ground', scale: 6, tint: '#f2d2b0', rough: 1.0 },
    { tex: 'sandstone_cracks', scale: 9, tint: '#f0b98a', rough: 1.0 },
    { tex: 'sandy_gravel', scale: 4, tint: '#fff0dc', rough: 1.0 },
    { tex: 'red_sandstone_pavement', scale: 3.2, tint: '#ffe6d0', rough: 1.0 },
  ],
  grass: { base: '#4a4423', tip: '#b0a058', tip2: '#d8c27a', height: 0.42, density: 0.85, flowers: 0, count: 90000 },
  trees: [
    { preset: 'Ash Small', seed: 71, height: 7, leafTint: '#b8c48a' },
    { preset: 'Oak Small', seed: 73, height: 6, leaves: false, barkTint: '#d9c8b0' },
    { preset: 'Bush 3', seed: 79, height: 1.6, leafTint: '#a39a62' },
  ],
  place: sunscarPlace,
  rockCap: 0.5,
  ambient: 'dust',
  critter: { a: '#f0c060', b: '#e07848', c: '#d8a0e0', d: '#ffd890' },
};

// --- Frostveil: pine woods filling the valleys, thinning toward the treeline ------------------

const frostNoise = {
  islands: createNoise2D(1302), // small tree islands out on the snowfields
  stones: createNoise2D(1303), // boulder fields
};
const frostOpen = clearance(frostveilGen, 26, 22);

/** Valley pines are big and mixed; near the treeline (alt -> 1) they are fewer, smaller and younger. */
function frostPine(c: PlaceCandidate, u: number, deep: number, alt: number): PlaceResult {
  const grow = (0.85 + 0.2 * deep) * (1 - 0.25 * alt);
  const large = 0.3 * (1 - alt);
  const small = 0.22 + 0.4 * alt;
  if (u < large) return { kind: 'tree', variant: 1, scale: (0.8 + c.r2 * 0.4) * grow, trunk: 0.38 };
  if (u < large + small) return { kind: 'tree', variant: 2, scale: (0.8 + c.r2 * 0.6) * grow, trunk: 0.25 };
  return { kind: 'tree', variant: 0, scale: (0.8 + c.r2 * 0.5) * grow, trunk: 0.32 };
}

function frostveilPlace(c: PlaceCandidate): PlaceResult {
  if (c.h < 0.8) return null;
  const open = frostOpen(c.x, c.z);
  if (open < 0.01) return null;
  const stones = field(frostNoise.stones, c.x, c.z, 0.045);
  // Crags and screes: boulders in fields below the rock, bare rock between.
  if (c.rock > 0.45) {
    const p = 0.15 * (0.25 + 0.75 * smoothstep(0.45, 0.68, stones)) * open;
    return c.r < p ? { kind: 'rock', scale: 0.7 + c.r2 * 2.2 } : null;
  }
  const alt = smoothstep(22, 46, c.h);
  if (c.forest > 0.03) {
    const deep = depth(c.forest);
    const pTree = 0.48 * deep * (1 - 0.6 * alt) * open;
    if (c.r < pTree) return frostPine(c, c.r / pTree, deep, alt);
    if (c.forest > 0.3) return null;
  }
  // Snowfields: open white ground with a few islands of young pines, a lone dead aspen,
  // and boulders lying together.
  const island = field(frostNoise.islands, c.x, c.z, 0.05);
  const pTree = (0.3 * smoothstep(0.76, 0.82, island) + 0.0012) * open;
  if (c.r < pTree) {
    const u = c.r / pTree;
    if (u < 0.15) return { kind: 'tree', variant: 3, scale: 0.8 + c.r2 * 0.5, trunk: 0.25 };
    if (u < 0.35) return { kind: 'tree', variant: 0, scale: 0.7 + c.r2 * 0.4, trunk: 0.32 };
    return { kind: 'tree', variant: 2, scale: 0.7 + c.r2 * 0.6, trunk: 0.25 };
  }
  const pRock = (0.08 * smoothstep(0.78, 0.86, stones) + 0.0008) * open;
  if (c.r < pTree + pRock) return { kind: 'rock', scale: 0.5 + c.r2 * 1.2 };
  return null;
}

export const FROSTVEIL: LandDef = {
  id: 'frostveil',
  name: 'Frostveil',
  title: 'The Cold Hand',
  blurb: 'Snow peaks, pine valleys, a frozen lake to slide across, and Hearthhold by the sea.',
  accent: '#9fd8ff',
  gen: frostveilGen,
  sky: { hdri: 'kloofendal_38d_partly_cloudy_puresky', sunAzimuth: 1.1, env: 0.8, bg: 0.95, sun: 2.6, hemi: 0.5, exposure: 0.92, fogNear: 140, fogFar: 1200 },
  water: { shallow: '#3a8f9a', deep: '#0e3a55', foam: '#eef6ff', foamAmount: 0.8 },
  layers: [
    { tex: 'snow_02', scale: 7, tint: '#ffffff', rough: 0.9 },
    { tex: 'winter_leaves', scale: 5, tint: '#d9d2c8', rough: 1.0 },
    { tex: 'dark_rock', scale: 10, tint: '#c8ccd2', rough: 1.0 },
    { tex: 'gravel_ground_01', scale: 4, tint: '#d8dde2', rough: 1.0 },
    { tex: 'cobblestone_floor_08', scale: 3.2, tint: '#e6e8ea', rough: 1.0 },
  ],
  grass: null,
  trees: [
    { preset: 'Pine Medium', seed: 81, height: 15, leafTint: '#b9cbbd' },
    { preset: 'Pine Large', seed: 83, height: 19, leafTint: '#c8d6cc' },
    { preset: 'Pine Small', seed: 87, height: 8, leafTint: '#c2d2c4' },
    { preset: 'Aspen Small', seed: 89, height: 9, leaves: false, barkTint: '#e8e8e8' },
  ],
  place: frostveilPlace,
  rockCap: 0.95,
  ambient: 'snow',
  critter: { a: '#bfe6ff', b: '#9fb8ff', c: '#e0f0ff', d: '#88d8ff' },
};

// --- Mistmoor: open fen and reed beds, wooded hollows, a few glowing mushroom clusters ---------

const moorNoise = {
  shrooms: createNoise2D(1402), // the few spots where glowing mushrooms cluster
  lilies: createNoise2D(1403), // which pools carry lily pads
  stones: createNoise2D(1404), // boulder fields
  scrub: createNoise2D(1405), // where the edge shrubs bunch up
};
const moorOpen = clearance(mistmoorGen, 24, 22);
/** Same seed and scale as the pool carve in mistmoor.ts baseHeight. */
const moorPoolNoise = createNoise2D(404);

/** 1 inside one of the moor's inland pools; 0 on the open sea and in lagoons along the coast. */
function moorPool(x: number, z: number): number {
  const carve = smoothstep(0.52, 0.7, fbm(moorPoolNoise, x * 0.011, z * 0.011, 3) * 0.5 + 0.5);
  return carve * smoothstep(250, 225, Math.hypot(x, z));
}

function mistmoorPlace(c: PlaceCandidate): PlaceResult {
  if (c.h < -1.6) return null;
  const open = moorOpen(c.x, c.z);
  if (open < 0.01) return null;
  // Lily pads drift in colonies on some of the moor's pools (never the salt sea); the other pools
  // stay clear and mirror the sky.
  if (c.h < -0.15) {
    const colony = smoothstep(0.56, 0.62, field(moorNoise.lilies, c.x, c.z, 0.018));
    const p = 0.42 * colony * smoothstep(0.35, 0.7, moorPool(c.x, c.z)) * open;
    return c.r < p ? { kind: 'prop', prop: 'lily', scale: 0.75 + c.r2 * 0.5, trunk: 0, onWater: true } : null;
  }
  const stones = field(moorNoise.stones, c.x, c.z, 0.05);
  if (c.rock > 0.45) {
    const p = 0.2 * (0.35 + 0.65 * smoothstep(0.45, 0.68, stones)) * open;
    return c.r < p ? { kind: 'rock', scale: 0.6 + c.r2 * 2.2 } : null;
  }
  // Wooded hollows. Waterlogged edges kill trees, so snags stand where a hollow meets the wet.
  if (c.forest > 0.03) {
    const deep = depth(c.forest);
    const pTree = 0.36 * deep * open;
    if (c.r < pTree) {
      const snag = 0.06 + 0.5 * (1 - smoothstep(0.7, 1.7, c.h));
      if (c.r / pTree < snag) return { kind: 'tree', variant: 2, scale: 0.75 + c.r2 * 0.55, trunk: 0.3 };
      return { kind: 'tree', variant: 1, scale: (0.8 + c.r2 * 0.5) * (0.85 + 0.2 * deep), trunk: 0.4 };
    }
    // Glowing mushrooms in a few tight clusters in the hollows' damp shade; the biggest sit mid-cluster.
    const spot = field(moorNoise.shrooms, c.x, c.z, 0.025);
    const inSpot = smoothstep(0.76, 0.82, spot);
    const pShroom = 0.65 * inSpot * smoothstep(0.08, 0.35, c.forest) * open;
    if (c.r < pTree + pShroom) return { kind: 'prop', prop: 'mushroom', scale: 0.5 + 0.45 * inSpot + c.r2 * 0.45, trunk: 0.45 };
    const shrubby = smoothstep(0.45, 0.62, field(moorNoise.scrub, c.x, c.z, 0.06));
    const pShrub = (0.2 * margin(c.forest) + 0.02 * deep) * shrubby * open;
    if (c.r < pTree + pShroom + pShrub) return { kind: 'tree', variant: 3, scale: 0.7 + c.r2 * 0.6, trunk: 0 };
    if (c.forest > 0.3) return null;
  }
  // Open fen: reeds and pools. A dead snag by the water now and then, the odd shrub, stones lying together.
  const pSnag = 0.0035 * (1 - smoothstep(0.8, 1.8, c.h)) * open;
  if (c.r < pSnag) return { kind: 'tree', variant: 2, scale: 0.7 + c.r2 * 0.5, trunk: 0.3 };
  const pShrub = (0.1 * smoothstep(0.73, 0.79, field(moorNoise.scrub, c.x, c.z, 0.06)) + 0.0004) * open;
  if (c.r < pSnag + pShrub) return { kind: 'tree', variant: 3, scale: 0.7 + c.r2 * 0.5, trunk: 0 };
  const pRock = (0.08 * smoothstep(0.78, 0.86, stones) + 0.0006) * open;
  if (c.r < pSnag + pShrub + pRock) return { kind: 'rock', scale: 0.5 + c.r2 * 1.2 };
  return null;
}

export const MISTMOOR: LandDef = {
  id: 'mistmoor',
  name: 'Mistmoor',
  title: 'The Last Light',
  blurb: 'A golden-hour marsh of reeds and pools, glowing mushrooms, and a tree older than the cards.',
  accent: '#c79bff',
  gen: mistmoorGen,
  sky: { hdri: 'belfast_sunset_puresky', sunAzimuth: -2.6, env: 0.85, bg: 0.8, sun: 2.4, hemi: 0.45, exposure: 1.0, fogNear: 50, fogFar: 900 },
  water: { shallow: '#3f5a3c', deep: '#16281f', foam: '#d9d2b4', foamAmount: 0.18 },
  fogColor: '#8f8698',
  layers: [
    { tex: 'brown_mud_leaves_01', scale: 5, tint: '#cfd6b0', rough: 1.0 },
    { tex: 'mud_forest', scale: 5, tint: '#d8d0c0', rough: 1.0 },
    { tex: 'rock_pitted_mossy', scale: 8, tint: '#e0e6d0', rough: 1.0 },
    { tex: 'brown_mud_02', scale: 4, tint: '#d8ccb8', rough: 0.55 },
    { tex: 'stone_wall_04', scale: 3, tint: '#d0d6c4', rough: 1.0 },
  ],
  grass: { base: '#1d2a12', tip: '#5d6f30', tip2: '#9a8a48', height: 1.25, density: 0.95, flowers: 0.03, count: 170000 },
  trees: [
    { preset: 'Oak Large', seed: 91, height: 46, leafTint: '#8fae6a' },
    { preset: 'Ash Medium', seed: 93, height: 13, leafTint: '#7f9a5c' },
    { preset: 'Aspen Small', seed: 95, height: 9, leaves: false, barkTint: '#a8a090' },
    { preset: 'Bush 2', seed: 97, height: 2.2, leafTint: '#7f9a5c' },
  ],
  place: mistmoorPlace,
  rockCap: 0.6,
  ambient: 'fireflies',
  critter: { a: '#7fe0b0', b: '#c08aff', c: '#ffd36b', d: '#6fd0ff' },
};

export const LANDS: LandDef[] = [ISLE, SUNSCAR, FROSTVEIL, MISTMOOR];

export function landById(id: LandId): LandDef {
  const land = LANDS.find((l) => l.id === id);
  if (!land) throw new Error(`[lands] unknown land ${id}`);
  return land;
}
