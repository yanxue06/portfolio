import { createNoise2D, fbm, ridged } from '../noise';
import { clamp, smoothstep } from '../../util/math';
import {
  angleDiff,
  coastProfile,
  continent,
  findCoastRadius,
  gauss,
  highestNear,
  layerOver,
  resetShade,
  spiralUp,
  towards,
  wiggle,
} from './common';
import { LAYER, type Flat, type LandGen, type Landmarks, type Point, type ShadeIn, type ShadeOut } from './types';

// Wildcard Isle: the starting island. Green meadows, a crag-topped peak, a
// harbor town on the south coast, a lighthouse on the east cliffs.

const R = 300;
const SEA_FLOOR = -16;
const MOUNTAIN = { x: 40, z: -70 };
const SHOULDER = { x: 118, z: -126 };
const HIGHLAND = { x: -178, z: 12 };
const LAKE = { x: 102, z: 58 };
const GATE_AT = { x: -26, z: 96 };
const TOWN_ANGLE = Math.PI / 2 + 0.1;
const CLIFF_ANGLE = -0.22;

const nA = createNoise2D(101);
const nB = createNoise2D(102);
const nC = createNoise2D(103);
const nHills = createNoise2D(104);
const nRidge = createNoise2D(105);
const nForest = createNoise2D(106);
const nPath = createNoise2D(109);
const nRock = createNoise2D(110);
const nEdge = createNoise2D(111);
const nGlade = createNoise2D(112);
const nTuft = createNoise2D(113);
const nStand = createNoise2D(114);

function baseHeight(x: number, z: number): number {
  const c = continent(x, z, R, 62, nA, nB, nC);
  let h = coastProfile(c, SEA_FLOOR);
  const land = smoothstep(0.02, 0.28, c);
  if (land > 0) {
    h += land * (fbm(nHills, x * 0.0105, z * 0.0105, 4) * 0.5 + 0.5) * 10;
    const m = gauss(x, z, MOUNTAIN.x, MOUNTAIN.z, 50);
    h += land * m * 62;
    h += land * Math.pow(m, 0.9) * ridged(nRidge, x * 0.011, z * 0.011, 3) * 17;
    h += land * Math.pow(m, 2.5) * ridged(nRock, x * 0.045, z * 0.045, 2) * 7;
    h += land * gauss(x, z, SHOULDER.x, SHOULDER.z, 32) * 24;
    h += land * gauss(x, z, HIGHLAND.x, HIGHLAND.z, 46) * 8;
    h -= land * gauss(x, z, LAKE.x, LAKE.z, 24) * 18;
  }
  const cliff = Math.exp(-Math.pow(angleDiff(Math.atan2(z, x), CLIFF_ANGLE) / 0.36, 2));
  if (cliff > 0.01) h += cliff * smoothstep(-0.004, 0.03, c) * 12;
  return h;
}

function landmarks(): Landmarks {
  const summit = highestNear(baseHeight, MOUNTAIN.x, MOUNTAIN.z, 36);
  summit.y -= 0.6;
  const seaX = Math.cos(TOWN_ANGLE);
  const seaZ = Math.sin(TOWN_ANGLE);
  const townDist = findCoastRadius(baseHeight, TOWN_ANGLE) - 50;
  const town = { x: seaX * townDist, y: 3.2, z: seaZ * townDist, r: 44, seaX, seaZ };
  const lhDist = findCoastRadius(baseHeight, CLIFF_ANGLE) - 11;
  const lx = Math.cos(CLIFF_ANGLE) * lhDist;
  const lz = Math.sin(CLIFF_ANGLE) * lhDist;
  return {
    gate: { x: GATE_AT.x, y: baseHeight(GATE_AT.x, GATE_AT.z), z: GATE_AT.z },
    town,
    summit,
    extra: {
      lighthouse: { x: lx, y: baseHeight(lx, lz), z: lz },
      ruins: { x: HIGHLAND.x, y: baseHeight(HIGHLAND.x, HIGHLAND.z), z: HIGHLAND.z },
      lake: { x: LAKE.x, y: 0, z: LAKE.z },
      mountain: { x: MOUNTAIN.x, y: 0, z: MOUNTAIN.z },
    },
  };
}

function flats(L: Landmarks): Flat[] {
  const lh = L.extra.lighthouse;
  const ru = L.extra.ruins;
  return [
    { x: L.town.x, z: L.town.z, r: L.town.r, blend: 20, h: L.town.y },
    { x: L.gate.x, z: L.gate.z, r: 15, blend: 16, h: L.gate.y },
    { x: ru.x, z: ru.z, r: 24, blend: 18, h: ru.y },
    { x: lh.x, z: lh.z, r: 9, blend: 9, h: lh.y },
    { x: L.summit.x, z: L.summit.z, r: 4.5, blend: 7, h: L.summit.y },
  ];
}

function paths(L: Landmarks): Point[][] {
  const T = L.gate;
  const town = L.town;
  const townNorth = { x: town.x - town.seaX * (town.r - 4), z: town.z - town.seaZ * (town.r - 4) };
  const townEast = { x: town.x + town.seaZ * (town.r - 4), z: town.z - town.seaX * (town.r - 4) };
  const foot = towards(L.summit, T, 96);
  const ruinsEdge = towards(L.extra.ruins, T, 20);
  const lh = L.extra.lighthouse;
  const lhMid = { x: (townEast.x + lh.x) * 0.46, z: (townEast.z + lh.z) * 0.46 };
  const lhEnd = towards(lh, lhMid, 8);
  return [
    wiggle([T, townNorth], nPath, 1, 7),
    wiggle([T, foot], nPath, 2, 9).concat(spiralUp(foot, L.summit, 5.2, 28).slice(1)),
    wiggle([T, ruinsEdge], nPath, 3, 9),
    wiggle([townEast, lhMid, lhEnd], nPath, 4, 8),
  ];
}

function stoneAt(x: number, z: number, L: Landmarks): number {
  let s = 1 - smoothstep(12.5, 14.5, Math.hypot(x - L.gate.x, z - L.gate.z));
  s = Math.max(s, (1 - smoothstep(L.town.r - 6, L.town.r + 1, Math.hypot(x - L.town.x, z - L.town.z))) * 0.95);
  const ru = L.extra.ruins;
  const overgrowth = 0.55 + 0.45 * (nRock(x * 0.15, z * 0.15) * 0.5 + 0.5);
  s = Math.max(s, (1 - smoothstep(13, 21, Math.hypot(x - ru.x, z - ru.z))) * 0.8 * overgrowth);
  const lh = L.extra.lighthouse;
  s = Math.max(s, 1 - smoothstep(6, 8.5, Math.hypot(x - lh.x, z - lh.z)));
  return s;
}

function forestValue(x: number, z: number): number {
  const n = fbm(nForest, x * 0.0072 + 50, z * 0.0072 - 20, 3);
  return n + 0.3 * clamp((-x * 0.6 - z * 0.8) / 240, -1, 1);
}

function shade(i: ShadeIn, L: Landmarks, out: ShadeOut): void {
  resetShade(out);
  const { h, slope } = i;
  // Woods with ragged, lobed edges and a few sunny glades inside, rather than smooth blobs.
  const ragged = forestValue(i.x, i.z) + fbm(nEdge, i.x * 0.03, i.z * 0.03, 2) * 0.09;
  const glade = smoothstep(0.66, 0.74, fbm(nGlade, i.x * 0.02, i.z * 0.02, 2) * 0.5 + 0.5);
  // Thick stands and airy woodland. The mask carries tree density (defs.ts places by it), so where
  // trees thin out the forest floor gives way to grass instead of lying bare.
  const stand = 0.45 + 0.55 * smoothstep(0.3, 0.7, fbm(nStand, i.x * 0.03, i.z * 0.03, 2) * 0.5 + 0.5);
  // The gate's clearing and the town's outskirts are meadow.
  const clearing =
    smoothstep(16, 44, Math.hypot(i.x - L.gate.x, i.z - L.gate.z)) *
    smoothstep(L.town.r + 2, L.town.r + 26, Math.hypot(i.x - L.town.x, i.z - L.town.z));
  out.forest =
    smoothstep(0.05, 0.3, ragged) *
    (1 - 0.9 * glade) *
    stand *
    clearing *
    smoothstep(2.4, 4.0, h) *
    (1 - smoothstep(34, 46, h)) *
    (1 - i.stone) *
    (1 - i.path);
  out.rock = Math.max(smoothstep(0.3, 0.48, slope), smoothstep(42, 56, h) * 0.9) * (h > 0.5 ? 1 : 0.3);
  layerOver(out, LAYER.secondary, out.forest * 0.75 + (i.n2 > 0.72 ? (i.n2 - 0.72) * 1.5 : 0));
  layerOver(out, LAYER.shore, 1 - smoothstep(1.3, 2.4, h));
  layerOver(out, LAYER.rock, out.rock);
  layerOver(out, LAYER.secondary, i.path * 0.95);
  layerOver(out, LAYER.paving, i.stone);
  // Grass grows in drifts: lush swaths and thinner, shorter patches instead of an even carpet.
  // It thins under the canopy and gives the gate plaza a short, trodden verge.
  const drift = 0.3 + 0.7 * smoothstep(0.34, 0.62, fbm(nTuft, i.x * 0.06, i.z * 0.06, 2) * 0.5 + 0.5);
  const trodden = 0.45 + 0.55 * smoothstep(15, 28, Math.hypot(i.x - L.gate.x, i.z - L.gate.z));
  out.grass =
    smoothstep(1.9, 2.7, h) *
    (1 - smoothstep(0.2, 0.55, out.rock)) *
    (1 - smoothstep(0.08, 0.45, i.path)) *
    (1 - smoothstep(0.05, 0.35, i.stone)) *
    (1 - out.forest * 0.7) *
    drift *
    trodden;
}

export const isleGen: LandGen = {
  id: 'isle',
  seaFloor: SEA_FLOOR,
  baseHeight,
  landmarks,
  flats,
  paths,
  stoneAt,
  shade,
};
