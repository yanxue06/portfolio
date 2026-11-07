import { createNoise2D, fbm, ridged } from '../noise';
import { smoothstep } from '../../util/math';
import { coastProfile, continent, findCoastRadius, gauss, layerOver, resetShade, towards, wiggle } from './common';
import { LAYER, type Flat, type LandGen, type Landmarks, type Point, type ShadeIn, type ShadeOut } from './types';

// Sunscar Expanse: wind-combed dunes, flat-topped sandstone mesas you can climb,
// an oasis lagoon and Dustwell, an adobe trading town on the south shore.

const R = 292;
const SEA_FLOOR = -14;
const GATE_AT = { x: 34, z: 54 };
const OASIS = { x: -24, z: 118 };
const ARCH = { x: -118, z: 62 };
const TOWN_ANGLE = Math.PI / 2 + 0.42;
const WIND = 0.38;
const MESAS = [
  { x: -142, z: -78, r: 40, h: 30 },
  { x: 112, z: -112, r: 34, h: 42 },
  { x: 150, z: 70, r: 26, h: 24 },
  { x: -20, z: -150, r: 30, h: 34 },
];

const nA = createNoise2D(201);
const nB = createNoise2D(202);
const nC = createNoise2D(203);
const nDune = createNoise2D(204);
const nSwell = createNoise2D(205);
const nMesa = createNoise2D(206);
const nPath = createNoise2D(207);
const nFlat = createNoise2D(208);

function dunes(x: number, z: number): number {
  const u = x * Math.cos(WIND) + z * Math.sin(WIND);
  const v = -x * Math.sin(WIND) + z * Math.cos(WIND);
  return ridged(nDune, u * 0.021, v * 0.0065, 3) * 8.5 + (fbm(nSwell, x * 0.006, z * 0.006, 3) * 0.5 + 0.5) * 6;
}

function mesaLift(x: number, z: number, base: number): number {
  let h = base;
  for (const m of MESAS) {
    const d = Math.hypot(x - m.x, z - m.z) + fbm(nMesa, x * 0.045, z * 0.045, 3) * 7;
    if (d > m.r + 22) continue;
    const cliff = smoothstep(m.r + 6, m.r - 1, d);
    const ledge = smoothstep(m.r + 18, m.r + 12, d);
    h = Math.max(h, 4 + m.h * cliff, 4 + m.h * 0.42 * ledge);
  }
  return h;
}

function baseHeight(x: number, z: number): number {
  const c = continent(x, z, R, 70, nA, nB, nC);
  let h = coastProfile(c, SEA_FLOOR, 1.6, 4);
  const land = smoothstep(0.02, 0.3, c);
  if (land > 0) {
    h += land * dunes(x, z);
    h = Math.max(h, mesaLift(x, z, h) * land + h * (1 - land));
    h -= land * gauss(x, z, OASIS.x, OASIS.z, 19) * 15;
  }
  return h;
}

function landmarks(): Landmarks {
  let summit = { x: MESAS[1].x, y: -Infinity, z: MESAS[1].z };
  for (const m of MESAS) {
    const y = baseHeight(m.x, m.z);
    if (y > summit.y) summit = { x: m.x, y, z: m.z };
  }
  const seaX = Math.cos(TOWN_ANGLE);
  const seaZ = Math.sin(TOWN_ANGLE);
  const townDist = findCoastRadius(baseHeight, TOWN_ANGLE) - 46;
  const extra: Landmarks['extra'] = {
    oasis: { x: OASIS.x, y: 0, z: OASIS.z },
    arch: { x: ARCH.x, y: baseHeight(ARCH.x, ARCH.z), z: ARCH.z },
  };
  MESAS.forEach((m, i) => {
    extra[`mesa${i}`] = { x: m.x, y: baseHeight(m.x, m.z), z: m.z };
  });
  return {
    gate: { x: GATE_AT.x, y: baseHeight(GATE_AT.x, GATE_AT.z), z: GATE_AT.z },
    town: { x: seaX * townDist, y: 3.4, z: seaZ * townDist, r: 40, seaX, seaZ },
    summit,
    extra,
  };
}

function flats(L: Landmarks): Flat[] {
  const out: Flat[] = [
    { x: L.town.x, z: L.town.z, r: L.town.r, blend: 22, h: L.town.y },
    { x: L.gate.x, z: L.gate.z, r: 15, blend: 18, h: L.gate.y },
    { x: L.extra.arch.x, z: L.extra.arch.z, r: 16, blend: 14, h: L.extra.arch.y },
  ];
  for (let i = 0; i < MESAS.length; i++) {
    const m = L.extra[`mesa${i}`];
    out.push({ x: m.x, z: m.z, r: MESAS[i].r * 0.55, blend: 8, h: m.y });
  }
  return out;
}

function paths(L: Landmarks): Point[][] {
  const T = L.gate;
  const town = L.town;
  const townNorth = { x: town.x - town.seaX * (town.r - 4), z: town.z - town.seaZ * (town.r - 4) };
  const oasisEdge = towards(L.extra.oasis, T, 26);
  const archEdge = towards(L.extra.arch, T, 14);
  return [
    wiggle([T, townNorth], nPath, 11, 10),
    wiggle([T, oasisEdge], nPath, 12, 8),
    wiggle([oasisEdge, archEdge], nPath, 13, 12),
  ];
}

function stoneAt(x: number, z: number, L: Landmarks): number {
  let s = 1 - smoothstep(12.5, 14.5, Math.hypot(x - L.gate.x, z - L.gate.z));
  s = Math.max(s, (1 - smoothstep(L.town.r - 6, L.town.r + 1, Math.hypot(x - L.town.x, z - L.town.z))) * 0.95);
  return s;
}

function shade(i: ShadeIn, L: Landmarks, out: ShadeOut): void {
  resetShade(out);
  const { h, slope } = i;
  const nearOasis = 1 - smoothstep(24, 46, Math.hypot(i.x - L.extra.oasis.x, i.z - L.extra.oasis.z));
  const basin = smoothstep(0.55, 0.8, fbm(nFlat, i.x * 0.012, i.z * 0.012, 2) * 0.5 + 0.5) * (1 - smoothstep(6, 10, h)) * (1 - smoothstep(0.08, 0.2, slope));
  out.rock = Math.max(smoothstep(0.32, 0.5, slope), smoothstep(16, 22, h) * smoothstep(0.08, 0.25, slope));
  layerOver(out, LAYER.secondary, basin * 0.9 + nearOasis * 0.5);
  layerOver(out, LAYER.shore, 1 - smoothstep(0.8, 1.8, h));
  layerOver(out, LAYER.rock, out.rock);
  layerOver(out, LAYER.secondary, i.path * 0.9);
  layerOver(out, LAYER.paving, i.stone);
  out.forest = nearOasis * smoothstep(0.4, 1.6, h);
  out.grass = (basin * 0.4 + nearOasis * 0.9) * smoothstep(1.0, 2.0, h) * (1 - out.rock) * (1 - i.stone) * (1 - smoothstep(0.1, 0.5, i.path));
}

export const sunscarGen: LandGen = {
  id: 'sunscar',
  seaFloor: SEA_FLOOR,
  baseHeight,
  landmarks,
  flats,
  paths,
  stoneAt,
  shade,
};

export const SUNSCAR_MESAS = MESAS;
