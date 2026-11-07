import { createNoise2D, fbm, ridged } from '../noise';
import { clamp, smoothstep } from '../../util/math';
import { coastProfile, continent, findCoastRadius, gauss, highestNear, layerOver, resetShade, spiralUp, towards, wiggle } from './common';
import { LAYER, type Flat, type LandGen, type Landmarks, type Point, type ShadeIn, type ShadeOut } from './types';

// Frostveil: a jagged snow island. Two ridged peaks, pine valleys, a frozen
// lake you can walk across, and Hearthhold, a timber village by the shore.

const R = 300;
const SEA_FLOOR = -18;
const PEAK_A = { x: -40, z: -90 };
const PEAK_B = { x: 110, z: -30 };
const LAKE = { x: -110, z: 60 };
const LAKE_LEVEL = 5.2;
const GATE_AT = { x: 28, z: 92 };
const SPIRE_AT = { x: 160, z: 70 };
const TOWN_ANGLE = Math.PI / 2 - 0.35;

const nA = createNoise2D(301);
const nB = createNoise2D(302);
const nC = createNoise2D(303);
const nHills = createNoise2D(304);
const nRidge = createNoise2D(305);
const nForest = createNoise2D(306);
const nPath = createNoise2D(307);
const nEdge = createNoise2D(308);
const nGlade = createNoise2D(309);
const nStand = createNoise2D(310);

function baseHeight(x: number, z: number): number {
  const c = continent(x, z, R, 92, nA, nB, nC);
  let h = coastProfile(c, SEA_FLOOR, 1.4, 7);
  const land = smoothstep(0.02, 0.3, c);
  if (land > 0) {
    h += land * (fbm(nHills, x * 0.009, z * 0.009, 4) * 0.5 + 0.5) * 14;
    const a = gauss(x, z, PEAK_A.x, PEAK_A.z, 55);
    const b = gauss(x, z, PEAK_B.x, PEAK_B.z, 45);
    h += land * (a * 70 + b * 52);
    h += land * Math.pow(Math.max(a, b), 0.7) * ridged(nRidge, x * 0.014, z * 0.014, 4) * 26;
    // A bowl for the frozen lake: the ice sits at LAKE_LEVEL over anything lower.
    const bowl = gauss(x, z, LAKE.x, LAKE.z, 26);
    h -= land * bowl * 16;
  }
  return h;
}

function landmarks(): Landmarks {
  const summit = highestNear(baseHeight, PEAK_A.x, PEAK_A.z, 40);
  summit.y -= 0.6;
  const seaX = Math.cos(TOWN_ANGLE);
  const seaZ = Math.sin(TOWN_ANGLE);
  const townDist = findCoastRadius(baseHeight, TOWN_ANGLE) - 44;
  const peakB = highestNear(baseHeight, PEAK_B.x, PEAK_B.z, 30);
  return {
    gate: { x: GATE_AT.x, y: baseHeight(GATE_AT.x, GATE_AT.z), z: GATE_AT.z },
    town: { x: seaX * townDist, y: 5.5, z: seaZ * townDist, r: 38, seaX, seaZ },
    summit,
    extra: {
      lake: { x: LAKE.x, y: LAKE_LEVEL, z: LAKE.z },
      spire: { x: SPIRE_AT.x, y: baseHeight(SPIRE_AT.x, SPIRE_AT.z), z: SPIRE_AT.z },
      peakB,
    },
  };
}

function flats(L: Landmarks): Flat[] {
  return [
    { x: L.town.x, z: L.town.z, r: L.town.r, blend: 22, h: L.town.y },
    { x: L.gate.x, z: L.gate.z, r: 15, blend: 16, h: L.gate.y },
    { x: L.extra.spire.x, z: L.extra.spire.z, r: 10, blend: 10, h: L.extra.spire.y },
    { x: L.summit.x, z: L.summit.z, r: 4.5, blend: 7, h: L.summit.y },
  ];
}

function paths(L: Landmarks): Point[][] {
  const T = L.gate;
  const town = L.town;
  const townIn = { x: town.x - town.seaX * (town.r - 4), z: town.z - town.seaZ * (town.r - 4) };
  const foot = towards(L.summit, T, 104);
  const lakeShore = towards(L.extra.lake, T, 32);
  return [
    wiggle([T, townIn], nPath, 21, 8),
    wiggle([T, foot], nPath, 22, 10).concat(spiralUp(foot, L.summit, 5.6, 30).slice(1)),
    wiggle([T, lakeShore], nPath, 23, 9),
    wiggle([T, towards(L.extra.spire, T, 10)], nPath, 24, 9),
  ];
}

function stoneAt(x: number, z: number, L: Landmarks): number {
  let s = 1 - smoothstep(12.5, 14.5, Math.hypot(x - L.gate.x, z - L.gate.z));
  s = Math.max(s, (1 - smoothstep(L.town.r - 8, L.town.r + 1, Math.hypot(x - L.town.x, z - L.town.z))) * 0.85);
  return s;
}

function forestValue(x: number, z: number): number {
  return fbm(nForest, x * 0.0075 - 30, z * 0.0075 + 12, 3);
}

function shade(i: ShadeIn, L: Landmarks, out: ShadeOut): void {
  resetShade(out);
  const { h, slope } = i;
  // Pine woods with ragged edges and a few open snowy glades, rather than smooth blobs.
  const ragged = forestValue(i.x, i.z) + fbm(nEdge, i.x * 0.03, i.z * 0.03, 2) * 0.08;
  const glade = smoothstep(0.67, 0.75, fbm(nGlade, i.x * 0.02, i.z * 0.02, 2) * 0.5 + 0.5);
  // Thick stands and airy woodland. The mask carries tree density (defs.ts places by it), so the
  // needle litter only shows where pines actually stand.
  const stand = 0.45 + 0.55 * smoothstep(0.3, 0.7, fbm(nStand, i.x * 0.03, i.z * 0.03, 2) * 0.5 + 0.5);
  // The gate's clearing and the village's outskirts are open snow.
  const clearing =
    smoothstep(16, 44, Math.hypot(i.x - L.gate.x, i.z - L.gate.z)) *
    smoothstep(L.town.r + 2, L.town.r + 24, Math.hypot(i.x - L.town.x, i.z - L.town.z));
  out.forest =
    smoothstep(0.02, 0.28, ragged) *
    (1 - 0.9 * glade) *
    stand *
    clearing *
    smoothstep(3, 6, h) *
    (1 - smoothstep(38, 52, h)) *
    (1 - i.stone) *
    (1 - i.path);
  out.rock = clamp(smoothstep(0.34, 0.52, slope) + smoothstep(64, 80, h) * 0.3, 0, 1) * (h > 0.6 ? 1 : 0.4);
  layerOver(out, LAYER.secondary, out.forest * 0.55 + (i.n2 > 0.75 ? (i.n2 - 0.75) * 1.6 : 0));
  layerOver(out, LAYER.shore, 1 - smoothstep(0.9, 2.2, h));
  layerOver(out, LAYER.rock, out.rock);
  layerOver(out, LAYER.secondary, i.path * 0.85);
  layerOver(out, LAYER.paving, i.stone);
  out.grass = 0;
}

export const frostveilGen: LandGen = {
  id: 'frostveil',
  seaFloor: SEA_FLOOR,
  baseHeight,
  landmarks,
  flats,
  paths,
  stoneAt,
  shade,
};

export const FROSTVEIL_LAKE_LEVEL = LAKE_LEVEL;
