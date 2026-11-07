import { createNoise2D, fbm, ridged } from '../noise';
import { smoothstep } from '../../util/math';
import { coastProfile, continent, findCoastRadius, gauss, layerOver, resetShade, towards, wiggle } from './common';
import { LAYER, type Flat, type LandGen, type Landmarks, type Point, type ShadeIn, type ShadeOut } from './types';

// Mistmoor: a low marsh at golden hour. Dozens of shallow pools, reed beds,
// mossy outcrops, a giant old tree on the central rise, and Lanternfen, a
// village of huts on stilts over the western shallows.

const R = 290;
const SEA_FLOOR = -10;
const RISE = { x: 20, z: -30 };
const GATE_AT = { x: 64, z: 70 };
const SHRINE = { x: 120, z: -110 };
const TOWN_ANGLE = Math.PI + 0.15;
const OUTCROPS = [
  { x: -90, z: -120, s: 22, h: 16 },
  { x: 150, z: 20, s: 18, h: 12 },
  { x: -40, z: 140, s: 16, h: 10 },
];

const nA = createNoise2D(401);
const nB = createNoise2D(402);
const nC = createNoise2D(403);
const nPool = createNoise2D(404);
const nHum = createNoise2D(405);
const nRock = createNoise2D(406);
const nPath = createNoise2D(407);
const nForest = createNoise2D(408);
const nEdge = createNoise2D(409);
const nReed = createNoise2D(410);
const nStand = createNoise2D(411);

function baseHeight(x: number, z: number): number {
  const c = continent(x, z, R, 64, nA, nB, nC);
  let h = coastProfile(c, SEA_FLOOR, 1.2, 2.4);
  const land = smoothstep(0.02, 0.26, c);
  if (land > 0) {
    h += land * (fbm(nHum, x * 0.03, z * 0.03, 3) * 0.5 + 0.5) * 1.6;
    const pool = smoothstep(0.52, 0.7, fbm(nPool, x * 0.011, z * 0.011, 3) * 0.5 + 0.5);
    h -= land * pool * 3.6;
    h += land * gauss(x, z, RISE.x, RISE.z, 30) * 9;
    for (const o of OUTCROPS) h += land * gauss(x, z, o.x, o.z, o.s) * o.h * (0.7 + 0.6 * ridged(nRock, x * 0.05, z * 0.05, 3));
  }
  return h;
}

function landmarks(): Landmarks {
  const seaX = Math.cos(TOWN_ANGLE);
  const seaZ = Math.sin(TOWN_ANGLE);
  const townDist = findCoastRadius(baseHeight, TOWN_ANGLE) - 26;
  return {
    gate: { x: GATE_AT.x, y: Math.max(1.6, baseHeight(GATE_AT.x, GATE_AT.z)), z: GATE_AT.z },
    town: { x: seaX * townDist, y: -0.7, z: seaZ * townDist, r: 34, seaX, seaZ },
    summit: { x: OUTCROPS[0].x, y: baseHeight(OUTCROPS[0].x, OUTCROPS[0].z), z: OUTCROPS[0].z },
    extra: {
      tree: { x: RISE.x, y: baseHeight(RISE.x, RISE.z), z: RISE.z },
      shrine: { x: SHRINE.x, y: Math.max(1.6, baseHeight(SHRINE.x, SHRINE.z)), z: SHRINE.z },
      outcrop0: { x: OUTCROPS[0].x, y: baseHeight(OUTCROPS[0].x, OUTCROPS[0].z), z: OUTCROPS[0].z },
      outcrop1: { x: OUTCROPS[1].x, y: baseHeight(OUTCROPS[1].x, OUTCROPS[1].z), z: OUTCROPS[1].z },
    },
  };
}

function flats(L: Landmarks): Flat[] {
  return [
    { x: L.town.x, z: L.town.z, r: L.town.r, blend: 16, h: L.town.y },
    { x: L.gate.x, z: L.gate.z, r: 15, blend: 14, h: L.gate.y },
    { x: L.extra.shrine.x, z: L.extra.shrine.z, r: 13, blend: 10, h: L.extra.shrine.y },
    { x: L.extra.tree.x, z: L.extra.tree.z, r: 12, blend: 14, h: L.extra.tree.y },
  ];
}

function paths(L: Landmarks): Point[][] {
  const T = L.gate;
  return [
    wiggle([T, towards(L.extra.tree, T, 14)], nPath, 31, 10),
    wiggle([T, towards(L.extra.shrine, T, 14)], nPath, 32, 10),
    wiggle([towards(L.extra.tree, T, 14), towards(L.town, L.extra.tree, L.town.r + 2)], nPath, 33, 12),
  ];
}

function stoneAt(x: number, z: number, L: Landmarks): number {
  let s = 1 - smoothstep(12.5, 14.5, Math.hypot(x - L.gate.x, z - L.gate.z));
  s = Math.max(s, 1 - smoothstep(10.5, 12.5, Math.hypot(x - L.extra.shrine.x, z - L.extra.shrine.z)));
  return s;
}

function shade(i: ShadeIn, L: Landmarks, out: ShadeOut): void {
  resetShade(out);
  const { h, slope } = i;
  const wet = 1 - smoothstep(0.3, 1.3, h);
  // Fewer, more distinct wooded hollows with ragged edges; the rest stays open fen. The mask carries
  // tree density (defs.ts places by it): thick stands and airy ones, and open ground at the gate.
  const hollow = fbm(nForest, i.x * 0.009, i.z * 0.009, 3) + fbm(nEdge, i.x * 0.03, i.z * 0.03, 2) * 0.08;
  const stand = 0.45 + 0.55 * smoothstep(0.3, 0.7, fbm(nStand, i.x * 0.035, i.z * 0.035, 2) * 0.5 + 0.5);
  const clearing = smoothstep(16, 42, Math.hypot(i.x - L.gate.x, i.z - L.gate.z));
  out.forest = smoothstep(0.12, 0.38, hollow) * stand * clearing * smoothstep(0.6, 1.6, h) * (1 - i.stone) * (1 - i.path);
  out.rock = Math.max(smoothstep(0.3, 0.5, slope), smoothstep(7, 11, h) * smoothstep(0.1, 0.3, slope));
  layerOver(out, LAYER.secondary, out.forest * 0.6 + i.n1 * 0.25);
  layerOver(out, LAYER.shore, wet);
  layerOver(out, LAYER.rock, out.rock);
  layerOver(out, LAYER.secondary, i.path * 0.9);
  layerOver(out, LAYER.paving, i.stone);
  const nearTown = 1 - smoothstep(L.town.r - 4, L.town.r + 4, Math.hypot(i.x - L.town.x, i.z - L.town.z));
  // Reeds love the water's edge; drier ground gets thinner grass. They stand in beds with open
  // mud between, and thin out where people walk in from the gate.
  const beds = 0.25 + 0.75 * smoothstep(0.36, 0.6, fbm(nReed, i.x * 0.05, i.z * 0.05, 2) * 0.5 + 0.5);
  const trodden = 0.4 + 0.6 * smoothstep(15, 30, Math.hypot(i.x - L.gate.x, i.z - L.gate.z));
  out.grass =
    (smoothstep(-0.5, 0.4, h) * (1 - smoothstep(1.4, 3.0, h)) * 1.0 + smoothstep(1.4, 3.0, h) * 0.45) *
    (1 - out.rock) *
    (1 - i.stone) *
    (1 - smoothstep(0.1, 0.5, i.path)) *
    (1 - nearTown) *
    beds *
    trodden;
}

export const mistmoorGen: LandGen = {
  id: 'mistmoor',
  seaFloor: SEA_FLOOR,
  baseHeight,
  landmarks,
  flats,
  paths,
  stoneAt,
  shade,
};
