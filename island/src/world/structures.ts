import * as THREE from 'three';
import { GeoBuilder, displace, gradientY, mat4 } from './geo';
import type { Surfaces } from './surfaces';
import { boxCollider, circleCollider, type ColliderGrid } from './collision';
import type { Island, Landmarks, Spot } from './terrain';
import type { Exclusion } from './foliage';
import { mulberry32 } from '../util/math';
import { backTex } from '../cards/faces';

export type CardSpots = Record<string, Spot[]>;

export type Islet = { x: number; y: number; z: number; r: number };

/** Set at the start of a build; every builder in this file dresses its meshes with these. */
let surf: Surfaces;
export function setSurfaces(s: Surfaces): void {
  surf = s;
}
export function surfaces(): Surfaces {
  return surf;
}

export type Structures = {
  extraTrees?: import('./trees').TreeInstance[];
  group: THREE.Group;
  spots: CardSpots;
  islets: Islet[];
  exclusions: Exclusion[];
  fountain: THREE.Vector3;
  update(dt: number, time: number): void;
};

// --- shared materials -------------------------------------------------------

export function glow(hex: string, intensity: number): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(intensity) });
}

const beamVertex = /* glsl */ `
varying vec2 vUv;
varying float vFacing;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * normal);
  vFacing = abs(dot(n, normalize(-mv.xyz)));
  gl_Position = projectionMatrix * mv;
}
`;
const beamFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;
uniform float uTime;
uniform float uInvert;
varying vec2 vUv;
varying float vFacing;
void main() {
  float t = clamp(mix(vUv.y, 1.0 - vUv.y, uInvert), 0.0, 1.0);
  float a = pow(t, 1.7) * uStrength * smoothstep(0.0, 0.7, vFacing);
  a *= 0.82 + 0.18 * sin(uTime * 2.4 + vUv.y * 18.0);
  gl_FragColor = vec4(uColor, a);
}
`;

export function beamMaterial(hex: string, strength: number, invert: boolean): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(hex).multiplyScalar(2.2) },
      uStrength: { value: strength },
      uTime: { value: 0 },
      uInvert: { value: invert ? 1 : 0 },
    },
    vertexShader: beamVertex,
    fragmentShader: beamFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

// --- Threshold: the stone ring where every player arrives ---------------------

export function buildThreshold(
  L: Landmarks,
  colliders: ColliderGrid,
  rng: () => number,
  group: THREE.Group,
): (time: number) => void {
  const T = L.gate;
  const b = new GeoBuilder(rng);
  b.add(new THREE.CylinderGeometry(10.6, 11.2, 1.2, 56), gradientY('#857f72', '#b3ac9c', T.y - 0.6, T.y + 0.6), mat4(T.x, T.y - 0.1, T.z));
  b.add(new THREE.CylinderGeometry(2.6, 2.9, 0.45, 40), '#cfc8b8', mat4(T.x, T.y + 0.72, T.z));
  colliders.add(circleCollider(T.x, T.z, 10.9, T.y - 2, T.y + 0.5, 'threshold'));
  colliders.add(circleCollider(T.x, T.z, 2.8, T.y - 2, T.y + 0.95, 'dais'));
  // Flagstone seams: thin darker radial lines.
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.add(new THREE.BoxGeometry(0.08, 0.04, 7.6), '#a39d8e', mat4(T.x + Math.cos(a) * 6.8, T.y + 0.51, T.z + Math.sin(a) * 6.8, -a + Math.PI / 2));
  }
  const stones: Array<{ x: number; z: number; a: number }> = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = T.x + Math.cos(a) * 13.2;
    const z = T.z + Math.sin(a) * 13.2;
    const h = 4.6 + rng() * 1.4;
    const stone = new THREE.CylinderGeometry(0.7, 1.0, h, 4, 3);
    stone.rotateY(Math.PI / 4);
    displace(stone, 0.06, i);
    const ground = T.y - 0.2;
    b.add(stone, gradientY('#6f7881', '#a8b2bb', ground, ground + h), mat4(x, ground + h / 2, z, -a + Math.PI / 2, 1, 1, 0.62, (rng() - 0.5) * 0.08, (rng() - 0.5) * 0.08), 0.05);
    colliders.add(circleCollider(x, z, 0.85, ground - 1, ground + h, 'standing-stone'));
    stones.push({ x, z, a });
  }
  const mesh = new THREE.Mesh(b.build(), surf.brick);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Glowing inlays and runes
  const runeMat = glow('#7fe9ff', 3.2);
  const inlay = new THREE.Group();
  for (const [r0, r1] of [
    [6.0, 6.3],
    [9.6, 9.8],
  ]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 96), runeMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(T.x, T.y + 0.53, T.z);
    inlay.add(ring);
  }
  for (const s of stones) {
    const rune = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.5, 0.06), runeMat);
    const inward = Math.atan2(T.x - s.x, T.z - s.z);
    rune.position.set(s.x + Math.sin(inward) * 0.42, T.y + 2.6, s.z + Math.cos(inward) * 0.42);
    rune.rotation.y = inward;
    inlay.add(rune);
  }
  group.add(inlay);

  // Floating rings over the dais + a faint column of light.
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.08, 10, 80), glow('#ffd36b', 3.5));
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.06, 10, 64), glow('#7fe9ff', 3.5));
  ringA.position.set(T.x, T.y + 4.4, T.z);
  ringB.position.copy(ringA.position);
  group.add(ringA, ringB);
  const columnMat = beamMaterial('#9eefff', 0.09, true);
  const column = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 46, 32, 1, true), columnMat);
  column.position.set(T.x, T.y + 23.5, T.z);
  column.renderOrder = 6;
  group.add(column);

  return (time) => {
    ringA.rotation.set(Math.PI / 2 + Math.sin(time * 0.6) * 0.35, time * 0.7, 0);
    ringB.rotation.set(Math.PI / 2 + Math.cos(time * 0.5) * 0.4, -time * 1.1, 0.3);
    ringA.position.y = T.y + 4.4 + Math.sin(time * 1.2) * 0.15;
    ringB.position.y = ringA.position.y;
    columnMat.uniforms.uTime.value = time;
  };
}

// --- Tally Harbor ---------------------------------------------------------------

export type Frame = { cx: number; cz: number; y: number; ex: number; ez: number; sx: number; sz: number; theta: number };

export function toWorld(f: Frame, u: number, v: number): [number, number] {
  return [f.cx + f.ex * u + f.sx * v, f.cz + f.ez * u + f.sz * v];
}

let WALLS = ['#f4efe4', '#f3e2bf', '#f2d4c2', '#dfe9ec', '#efe6d6', '#f6dca8', '#e5d6c8'];
let ACCENTS = ['#2d6cdf', '#1f8f7a', '#c9562f', '#e3a92b', '#3a4fb8'];
let DOME = '#2f62c9';
export function setHousePalette(walls: string[], accents: string[], dome: string): void {
  WALLS = walls;
  ACCENTS = accents;
  DOME = dome;
}

export type HouseOpts = { w: number; d: number; h: number; upper: boolean; dome: boolean; stairs: boolean; bloom: boolean };

function addWindow(b: GeoBuilder, m: THREE.Matrix4, x: number, y: number, z: number, rot: number, accent: string): void {
  const local = (lx: number, ly: number, lz: number, w: number, h: number, d: number, color: string) => {
    const g = new THREE.BoxGeometry(w, h, d);
    const offset = new THREE.Matrix4().makeRotationY(rot).multiply(mat4(lx, ly, lz));
    b.add(g, color, new THREE.Matrix4().multiplyMatrices(m, new THREE.Matrix4().makeTranslation(x, y, z).multiply(offset)));
  };
  local(0, 0, 0, 0.95, 1.1, 0.12, '#24405f');
  local(-0.72, 0, 0.02, 0.42, 1.1, 0.1, accent);
  local(0.72, 0, 0.02, 0.42, 1.1, 0.1, accent);
  local(0, -0.62, 0.05, 1.2, 0.12, 0.26, '#d9cdb7');
}

export function buildHouse(
  b: GeoBuilder,
  colliders: ColliderGrid,
  rng: () => number,
  wx: number,
  wz: number,
  y0: number,
  rot: number,
  o: HouseOpts,
  roofSpots: Spot[],
): void {
  const m = mat4(wx, y0, wz, rot);
  const at = (lx: number, ly: number, lz: number, ry = 0, sx = 1, sy = 1, sz = 1) =>
    new THREE.Matrix4().multiplyMatrices(m, mat4(lx, ly, lz, ry, sx, sy, sz));
  const wall = WALLS[Math.floor(rng() * WALLS.length)];
  const accent = ACCENTS[Math.floor(rng() * ACCENTS.length)];
  const { w, d, h } = o;

  b.add(new THREE.BoxGeometry(w, h, d), wall, at(0, h / 2, 0), 0.015);
  b.add(new THREE.BoxGeometry(w + 0.14, 0.4, d + 0.14), '#d6cab3', at(0, 0.2, 0));
  b.add(new THREE.BoxGeometry(w + 0.34, 0.36, d + 0.34), '#e4dac7', at(0, h + 0.18, 0));
  // Door with frame and a little awning.
  const doorX = (rng() - 0.5) * (w - 2.6);
  b.add(new THREE.BoxGeometry(1.6, 2.5, 0.1), '#d3c5ab', at(doorX, 1.25, d / 2 + 0.02));
  b.add(new THREE.BoxGeometry(1.2, 2.2, 0.14), accent, at(doorX, 1.1, d / 2 + 0.05));
  b.add(new THREE.BoxGeometry(0.1, 0.1, 0.06), '#e8b84a', at(doorX + 0.4, 1.1, d / 2 + 0.14));
  if (rng() < 0.5) b.add(new THREE.BoxGeometry(2.0, 0.08, 0.9), accent, new THREE.Matrix4().multiplyMatrices(at(doorX, 2.65, d / 2 + 0.4), new THREE.Matrix4().makeRotationX(0.35)));

  // Windows on front and sides.
  const rows = h >= 5.5 ? [2.6, h - 1.4] : [2.6];
  for (const wy of rows) {
    const wxFront = doorX > 0 ? doorX - 2.4 : doorX + 2.4;
    if (Math.abs(wxFront) < w / 2 - 0.9) addWindow(b, m, wxFront, wy, d / 2 + 0.06, 0, accent);
    addWindow(b, m, w / 2 + 0.06, wy, 0, Math.PI / 2, accent);
    addWindow(b, m, -w / 2 - 0.06, wy, 0, -Math.PI / 2, accent);
  }
  if (o.bloom) {
    for (let i = 0; i < 7; i++) {
      const g = new THREE.IcosahedronGeometry(0.32 + rng() * 0.2, 0);
      b.add(g, i % 3 === 0 ? '#3b7a2e' : '#e0408a', at(w / 2 - 0.3 + (rng() - 0.5) * 0.6, h - 0.2 - rng() * 1.4, d / 2 - rng() * 1.6), 0.08);
    }
  }

  const yaw = rot;
  colliders.add(boxCollider(wx, wz, w / 2 + 0.12, d / 2 + 0.12, yaw, y0 - 1, y0 + h + 0.36, 'house'));
  let roofTop = h + 0.36;

  if (o.upper) {
    const w2 = Math.max(3.2, w * 0.58);
    const d2 = Math.max(3.2, d * 0.55);
    const h2 = 3.0;
    const ox = (rng() - 0.5) * (w - w2) * 0.8;
    const oz = -(d - d2) / 2 + 0.2;
    b.add(new THREE.BoxGeometry(w2, h2, d2), wall, at(ox, h + 0.36 + h2 / 2, oz), 0.015);
    b.add(new THREE.BoxGeometry(w2 + 0.3, 0.32, d2 + 0.3), '#e4dac7', at(ox, h + 0.36 + h2 + 0.16, oz));
    b.add(new THREE.BoxGeometry(1.0, 1.9, 0.12), accent, at(ox, h + 0.36 + 0.95, oz + d2 / 2 + 0.05));
    const p = new THREE.Vector3(ox, 0, oz).applyMatrix4(new THREE.Matrix4().makeRotationY(yaw));
    colliders.add(boxCollider(wx + p.x, wz + p.z, w2 / 2 + 0.1, d2 / 2 + 0.1, yaw, y0 + h + 0.3, y0 + h + 0.36 + h2 + 0.32, 'house-upper'));
    roofTop = h + 0.36 + h2 + 0.32;
    roofSpots.push({ x: wx + p.x, y: y0 + roofTop + 1.3, z: wz + p.z });
  } else if (o.dome) {
    const r = Math.min(w, d) * 0.3;
    b.add(new THREE.CylinderGeometry(r, r, 0.7, 24), wall, at(0, h + 0.36 + 0.35, 0));
    b.add(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), DOME, at(0, h + 0.36 + 0.7, 0), 0.03);
    b.add(new THREE.SphereGeometry(0.16, 10, 8), '#e8b84a', at(0, h + 0.36 + 0.7 + r + 0.1, 0));
    colliders.add(circleCollider(wx, wz, r, y0 + h + 0.3, y0 + h + 0.36 + 0.7 + r * 0.75, 'dome'));
    roofSpots.push({ x: wx + Math.sin(yaw) * (d / 2 - 0.8), y: y0 + h + 0.36 + 1.3, z: wz + Math.cos(yaw) * (d / 2 - 0.8) });
  } else {
    roofSpots.push({ x: wx, y: y0 + roofTop + 1.3, z: wz });
  }

  if (o.stairs) {
    const top = h + 0.36;
    const n = Math.ceil(top / 0.46);
    const sh = top / n;
    const run = d + 1.6;
    const sd = run / n;
    for (let k = 1; k <= n; k++) {
      const lz = d / 2 + 1.6 - (k - 0.5) * sd;
      const lx = w / 2 + 0.75;
      b.add(new THREE.BoxGeometry(1.3, sh * k, sd + 0.02), '#e9e0cf', at(lx, (sh * k) / 2, lz), 0.02);
      const p = new THREE.Vector3(lx, 0, lz).applyMatrix4(new THREE.Matrix4().makeRotationY(yaw));
      colliders.add(boxCollider(wx + p.x, wz + p.z, 0.65, sd / 2 + 0.01, yaw, y0 - 1, y0 + sh * k, 'stair'));
    }
  }
}

export function stripedCanopy(b: GeoBuilder, m: THREE.Matrix4, color: string): void {
  for (let i = 0; i < 6; i++) {
    const g = new THREE.BoxGeometry(0.62, 0.08, 3.4);
    const local = mat4(-1.55 + i * 0.62, 0, 0);
    b.add(g, i % 2 ? '#fbf6ec' : color, new THREE.Matrix4().multiplyMatrices(m, local));
  }
}

export function buildTown(
  L: Landmarks,
  island: Island,
  colliders: ColliderGrid,
  rng: () => number,
  group: THREE.Group,
  spots: Spot[],
): { update: (time: number) => void; fountain: THREE.Vector3 } {
  const t = L.town;
  const f: Frame = {
    cx: t.x,
    cz: t.z,
    y: t.y,
    ex: t.seaZ,
    ez: -t.seaX,
    sx: t.seaX,
    sz: t.seaZ,
    theta: Math.atan2(t.seaX, t.seaZ),
  };
  const y0 = t.y;
  const b = new GeoBuilder(rng);
  const wood = new GeoBuilder(rng);
  const glowBits = new GeoBuilder(rng);

  // Plaza paving in rings + the fountain.
  const ringColors = ['#e9dfcc', '#dacdb5', '#e9dfcc', '#d3c4a8'];
  [13, 9.5, 6.5, 4.2].forEach((r, i) => {
    b.add(new THREE.CylinderGeometry(r, r, 0.3 + i * 0.01, 48), ringColors[i], mat4(t.x, y0 + 0.02 + i * 0.005, t.z));
  });
  colliders.add(circleCollider(t.x, t.z, 13, y0 - 1, y0 + 0.17, 'plaza'));
  b.add(new THREE.CylinderGeometry(3.4, 3.7, 0.95, 40), gradientY('#cbbfa8', '#efe7d8', y0, y0 + 1), mat4(t.x, y0 + 0.47, t.z));
  b.add(new THREE.CylinderGeometry(0.38, 0.5, 2.4, 16), '#e6dccb', mat4(t.x, y0 + 1.6, t.z));
  b.add(new THREE.CylinderGeometry(1.3, 0.45, 0.45, 24), '#efe7d8', mat4(t.x, y0 + 2.7, t.z));
  colliders.add(circleCollider(t.x, t.z, 3.6, y0 - 1, y0 + 0.95, 'fountain'));
  colliders.add(circleCollider(t.x, t.z, 0.6, y0 - 1, y0 + 2.9, 'fountain-column'));
  const pool = new THREE.Mesh(
    new THREE.CylinderGeometry(3.05, 3.05, 0.1, 40),
    new THREE.MeshLambertMaterial({ color: '#62d6e0', emissive: new THREE.Color('#1d6f86'), transparent: true, opacity: 0.85 }),
  );
  pool.position.set(t.x, y0 + 0.86, t.z);
  group.add(pool);
  // Golden card statue spinning over the fountain.
  const statueMat = [
    new THREE.MeshLambertMaterial({ color: '#e8b84a' }),
    new THREE.MeshLambertMaterial({ color: '#e8b84a' }),
    new THREE.MeshLambertMaterial({ color: '#e8b84a' }),
    new THREE.MeshLambertMaterial({ color: '#e8b84a' }),
    new THREE.MeshBasicMaterial({ map: backTex() }),
    new THREE.MeshBasicMaterial({ map: backTex() }),
  ];
  const statue = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.6, 0.08), statueMat);
  statue.position.set(t.x, y0 + 3.9, t.z);
  statue.castShadow = true;
  group.add(statue);
  spots.push({ x: t.x + f.sx * 2, y: y0 + 2.2, z: t.z + f.sz * 2 });

  // Houses on a jittered grid, kept off the plaza and the two streets.
  const roofSpots: Spot[] = [];
  const shop = { u: -17, v: -13 };
  let houses = 0;
  for (let v = -38; v <= 38; v += 10.5) {
    for (let u = -38; u <= 38; u += 10.5) {
      const ju = u + (rng() - 0.5) * 2.4;
      const jv = v + (rng() - 0.5) * 2.4;
      const dist = Math.hypot(ju, jv);
      if (dist < 19 || dist > 38) continue;
      if (Math.abs(ju) < 7 || Math.abs(jv) < 7) continue;
      if (Math.hypot(ju - shop.u, jv - shop.v) < 11) continue;
      if (rng() < 0.12) continue;
      const [wx, wz] = toWorld(f, ju, jv);
      if (island.heightAt(wx, wz) < y0 - 0.5) continue;
      let phi: number;
      if (Math.abs(ju) < Math.abs(jv)) phi = ju > 0 ? -Math.PI / 2 : Math.PI / 2;
      else phi = jv > 0 ? Math.PI : 0;
      phi += (rng() - 0.5) * 0.12;
      const upper = rng() < 0.35;
      const dome = !upper && rng() < 0.22;
      buildHouse(b, colliders, rng, wx, wz, y0, f.theta + phi, {
        w: 6 + rng() * 3,
        d: 6 + rng() * 2.5,
        h: 4.2 + rng() * 2.2,
        upper,
        dome,
        stairs: !upper && !dome && rng() < 0.45,
        bloom: rng() < 0.4,
      }, roofSpots);
      houses++;
    }
  }

  // The card shop faces the plaza: bigger, with a sign and a giant card on the roof.
  const [sx, sz] = toWorld(f, shop.u, shop.v);
  const shopRot = f.theta + Math.atan2(-shop.u, -shop.v);
  buildHouse(b, colliders, rng, sx, sz, y0, shopRot, { w: 11, d: 9, h: 7, upper: false, dome: false, stairs: true, bloom: true }, roofSpots);
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 128;
  const sctx = signCanvas.getContext('2d');
  if (!sctx) throw new Error('[town] sign: 2d context unavailable');
  sctx.fillStyle = '#152049';
  sctx.fillRect(0, 0, 512, 128);
  sctx.strokeStyle = '#e8b84a';
  sctx.lineWidth = 8;
  sctx.strokeRect(6, 6, 500, 116);
  sctx.fillStyle = '#ffd36b';
  sctx.font = '800 50px Cinzel, Georgia, serif';
  sctx.textAlign = 'center';
  sctx.textBaseline = 'middle';
  sctx.fillText('THE OPEN BINDER', 256, 54);
  sctx.font = '700 20px Nunito, sans-serif';
  sctx.fillStyle = '#f6f1e4';
  sctx.fillText('cards  ·  trades  ·  binders', 256, 98);
  const signTex = new THREE.CanvasTexture(signCanvas);
  signTex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.4), new THREE.MeshBasicMaterial({ map: signTex }));
  sign.position.set(sx + Math.sin(shopRot) * 4.62, y0 + 4.3, sz + Math.cos(shopRot) * 4.62);
  sign.rotation.y = shopRot;
  group.add(sign);
  const bigCard = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.1, 0.12), statueMat);
  bigCard.position.set(sx, y0 + 7.36 + 2.4, sz);
  bigCard.castShadow = true;
  group.add(bigCard);

  // Market stalls between the streets.
  const canopyColors = ['#d9483b', '#1f8f7a', '#e3a92b', '#3a4fb8'];
  [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].forEach((a, i) => {
    const u = Math.cos(a) * 16;
    const v = Math.sin(a) * 16;
    const [wx, wz] = toWorld(f, u, v);
    const rot = f.theta + Math.atan2(-u, -v);
    const m = mat4(wx, y0, wz, rot);
    const at = (lx: number, ly: number, lz: number) => new THREE.Matrix4().multiplyMatrices(m, mat4(lx, ly, lz));
    for (const [px, pz] of [
      [-1.6, -1.1],
      [1.6, -1.1],
      [-1.6, 1.1],
      [1.6, 1.1],
    ]) {
      wood.add(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), '#7a5a3a', at(px, 1.3, pz));
    }
    wood.add(new THREE.BoxGeometry(3.4, 0.9, 1.2), '#b98a57', at(0, 0.45, 0.5), 0.04);
    stripedCanopy(b, new THREE.Matrix4().multiplyMatrices(at(0, 2.75, 0), new THREE.Matrix4().makeRotationX(-0.18)), canopyColors[i]);
    for (let k = 0; k < 5; k++) {
      const fruit = ['#ff5a4e', '#ffb13b', '#8fd14f', '#ff8fc7', '#ffd84d'][k];
      b.add(new THREE.SphereGeometry(0.16, 8, 6), fruit, at(-1.2 + k * 0.6, 1.02, 0.5));
    }
    colliders.add(boxCollider(wx, wz, 1.8, 1.3, rot, y0 - 1, y0 + 2.8, 'stall'));
    spots.push({ x: wx, y: y0 + 4.1, z: wz });
  });

  // Lamp posts with glowing lanterns.
  const lamp = (u: number, v: number) => {
    const [wx, wz] = toWorld(f, u, v);
    b.add(new THREE.CylinderGeometry(0.08, 0.12, 3.4, 8), '#2f3440', mat4(wx, y0 + 1.7, wz));
    b.add(new THREE.BoxGeometry(0.42, 0.08, 0.42), '#2f3440', mat4(wx, y0 + 3.45, wz));
    glowBits.add(new THREE.BoxGeometry(0.28, 0.4, 0.28), '#ffffff', mat4(wx, y0 + 3.7, wz));
    b.add(new THREE.ConeGeometry(0.3, 0.3, 4), '#2f3440', mat4(wx, y0 + 4.05, wz, Math.PI / 4));
    colliders.add(circleCollider(wx, wz, 0.18, y0 - 1, y0 + 4, 'lamp'));
  };
  for (let v = -36; v <= 36; v += 12) {
    if (Math.abs(v) < 16) continue;
    lamp(-5.2, v);
    lamp(5.2, v + 6);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    lamp(Math.cos(a) * 14.6, Math.sin(a) * 14.6);
  }

  // Pier into the harbor, plus moored boats.
  const pierStart = 38;
  const pierLen = 48;
  const [p0x, p0z] = toWorld(f, 0, pierStart);
  const deckY = Math.max(island.heightAt(p0x, p0z), 2.2) + 0.2;
  for (let k = 0; k < pierLen; k += 1.2) {
    const [px, pz] = toWorld(f, 0, pierStart + k);
    wood.add(new THREE.BoxGeometry(4.6, 0.18, 1.08), k % 2.4 < 1.2 ? '#a77d52' : '#b88c5f', mat4(px, deckY, pz, f.theta), 0.05);
  }
  for (let k = 0; k <= pierLen; k += 6) {
    for (const side of [-2.1, 2.1]) {
      const [px, pz] = toWorld(f, side, pierStart + k);
      const floor = Math.min(island.heightAt(px, pz), deckY - 1);
      const len = deckY + 0.6 - floor;
      wood.add(new THREE.CylinderGeometry(0.18, 0.2, len, 8), '#6e5236', mat4(px, floor + len / 2, pz));
    }
  }
  const [pcx, pcz] = toWorld(f, 0, pierStart + pierLen / 2);
  colliders.add(boxCollider(pcx, pcz, 2.3, pierLen / 2, f.theta, deckY - 1.2, deckY + 0.09, 'pier'));
  const [pex, pez] = toWorld(f, 0, pierStart + pierLen - 2);
  spots.push({ x: pex, y: deckY + 1.3, z: pez });

  const boats: Array<{ mesh: THREE.Mesh; phase: number; baseY: number }> = [];
  const boatColors = ['#d9483b', '#2d6cdf', '#f2efe8'];
  [18, 30, 42].forEach((k, i) => {
    const side = i % 2 ? -1 : 1;
    const [bx, bz] = toWorld(f, side * 6.2, pierStart + k);
    const bb = new GeoBuilder(rng);
    const hull = new THREE.CylinderGeometry(1.1, 1.1, 4.6, 12, 1, false, -Math.PI / 2, Math.PI);
    hull.rotateX(Math.PI / 2);
    bb.add(hull, boatColors[i], mat4(0, 0, 0, 0, 1, 0.75, 1));
    bb.add(new THREE.BoxGeometry(1.9, 0.1, 4.2), '#b88c5f', mat4(0, 0.02, 0));
    bb.add(new THREE.CylinderGeometry(0.06, 0.06, 3.6, 6), '#6e5236', mat4(0, 1.8, 0.3));
    const sail = new THREE.BufferGeometry();
    sail.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.5, 0.35, 0, 3.4, 0.35, 0, 0.5, -1.6], 3));
    sail.computeVertexNormals();
    bb.add(sail, '#fbf6ec', mat4(0, 0, 0));
    const mesh = new THREE.Mesh(bb.build(), new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.6 }));
    mesh.position.set(bx, 0.15, bz);
    mesh.rotation.y = f.theta;
    mesh.castShadow = true;
    group.add(mesh);
    boats.push({ mesh, phase: i * 1.7, baseY: 0.15 });
  });

  const townMesh = new THREE.Mesh(b.build(), surf.masonry);
  const woodMesh = new THREE.Mesh(wood.build(), surf.wood);
  woodMesh.castShadow = true;
  woodMesh.receiveShadow = true;
  group.add(woodMesh);
  townMesh.castShadow = true;
  townMesh.receiveShadow = true;
  townMesh.name = 'town';
  group.add(townMesh);
  const lanterns = new THREE.Mesh(glowBits.build(), new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color('#ffc66b').multiplyScalar(2.6) }));
  group.add(lanterns);

  for (const s of roofSpots) spots.push(s);
  console.info(`[town] ${houses + 1} buildings, ${roofSpots.length} roof spots, pier deck at y=${deckY.toFixed(1)}`);

  return {
    fountain: new THREE.Vector3(t.x, y0 + 2.9, t.z),
    update(time) {
      statue.rotation.y = time * 0.8;
      statue.position.y = y0 + 3.9 + Math.sin(time * 1.4) * 0.12;
      bigCard.rotation.y = -time * 0.5;
      for (const boat of boats) {
        boat.mesh.position.y = boat.baseY + Math.sin(time * 1.1 + boat.phase) * 0.12;
        boat.mesh.rotation.z = Math.sin(time * 0.9 + boat.phase) * 0.05;
        boat.mesh.rotation.x = Math.sin(time * 0.7 + boat.phase * 2) * 0.03;
      }
    },
  };
}

// --- Beacon Bluff lighthouse -----------------------------------------------------

function buildLighthouse(L: Landmarks, colliders: ColliderGrid, rng: () => number, group: THREE.Group): (time: number) => void {
  const P = L.extra.lighthouse;
  const b = new GeoBuilder(rng);
  const base = P.y - 0.3;
  b.add(new THREE.CylinderGeometry(4.4, 5.0, 2.6, 32), gradientY('#9d968a', '#c9c2b4', base, base + 2.6), mat4(P.x, base + 1.3, P.z), 0.03);
  colliders.add(circleCollider(P.x, P.z, 4.75, base - 1, base + 2.6, 'lighthouse-base'));
  // Steps up the base, on the side facing inland.
  const inward = Math.atan2(-P.x, -P.z);
  for (let k = 1; k <= 5; k++) {
    const d = 5.0 + (5 - k) * 0.8 + 0.4;
    const x = P.x + Math.sin(inward) * d;
    const z = P.z + Math.cos(inward) * d;
    b.add(new THREE.BoxGeometry(2.4, 0.52 * k, 0.82), '#b3ac9e', mat4(x, base + (0.52 * k) / 2, z, inward));
    colliders.add(boxCollider(x, z, 1.2, 0.41, inward, base - 1, base + 0.52 * k, 'lighthouse-step'));
  }
  const towerH = 18;
  const tower = new THREE.CylinderGeometry(2.0, 2.9, towerH, 32, 12);
  const towerBase = base + 2.6;
  b.add(
    tower,
    (_x, y, _z, out) => {
      const band = Math.floor((y - towerBase) / 3);
      out.set(band % 2 === 0 ? '#f2efe8' : '#d24a43');
    },
    mat4(P.x, towerBase + towerH / 2, P.z),
  );
  colliders.add(circleCollider(P.x, P.z, 2.9, towerBase - 0.1, towerBase + towerH, 'lighthouse-tower'));
  const top = towerBase + towerH;
  b.add(new THREE.CylinderGeometry(3.1, 3.1, 0.4, 32), '#3b3f4a', mat4(P.x, top + 0.2, P.z));
  colliders.add(circleCollider(P.x, P.z, 3.1, top - 0.2, top + 0.4, 'lighthouse-gallery'));
  b.add(new THREE.TorusGeometry(2.95, 0.06, 6, 40), '#3b3f4a', new THREE.Matrix4().multiplyMatrices(mat4(P.x, top + 1.25, P.z), new THREE.Matrix4().makeRotationX(Math.PI / 2)));
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.add(new THREE.CylinderGeometry(0.04, 0.04, 0.85, 4), '#3b3f4a', mat4(P.x + Math.cos(a) * 2.95, top + 0.82, P.z + Math.sin(a) * 2.95));
  }
  b.add(new THREE.ConeGeometry(2.1, 1.9, 24), '#c23b35', mat4(P.x, top + 3.65, P.z));
  b.add(new THREE.SphereGeometry(0.2, 10, 8), '#e8b84a', mat4(P.x, top + 4.7, P.z));
  const mesh = new THREE.Mesh(b.build(), surf.masonry);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2.3, 20), glow('#ffe7a0', 3.4));
  lamp.position.set(P.x, top + 1.55, P.z);
  group.add(lamp);
  const beamMat = beamMaterial('#fff1c2', 0.22, false);
  const beams = new THREE.Group();
  beams.position.copy(lamp.position);
  for (const dir of [1, -1]) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(6, 80, 32, 1, true), beamMat);
    cone.geometry.translate(0, -40, 0);
    cone.rotation.z = (dir * Math.PI) / 2;
    cone.renderOrder = 6;
    beams.add(cone);
  }
  group.add(beams);
  return (time) => {
    beams.rotation.y = time * 0.55;
    beamMat.uniforms.uTime.value = time;
  };
}

// --- Old Mint ruins ------------------------------------------------------------

function buildRuins(L: Landmarks, colliders: ColliderGrid, rng: () => number, group: THREE.Group, spots: Spot[]): void {
  const R = L.extra.ruins;
  const b = new GeoBuilder(rng);
  const rot = 0.35;
  const m = mat4(R.x, R.y, R.z, rot);
  const at = (lx: number, ly: number, lz: number, ry = 0, rx = 0, rz = 0) =>
    new THREE.Matrix4().multiplyMatrices(m, mat4(lx, ly, lz, ry, 1, 1, 1, rx, rz));
  const world = (lx: number, lz: number) => new THREE.Vector3(lx, 0, lz).applyMatrix4(m);

  // Floor slabs with gaps.
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      if (rng() < 0.22) continue;
      const lift = rng() * 0.25;
      const lx = i * 4.2;
      const lz = j * 4.2;
      b.add(new THREE.BoxGeometry(3.9, 0.5, 3.9), rng() < 0.3 ? '#a9ab86' : '#cbc2ab', at(lx, 0.25 + lift, lz, 0, (rng() - 0.5) * 0.04, (rng() - 0.5) * 0.04), 0.06);
      const p = world(lx, lz);
      colliders.add(boxCollider(p.x, p.z, 1.95, 1.95, rot, R.y - 1, R.y + 0.5 + lift, 'slab'));
    }
  }
  // Colonnade
  let tallest: Spot = { x: R.x, y: R.y, z: R.z };
  for (const lz of [-6.5, 6.5]) {
    for (let k = 0; k < 6; k++) {
      const lx = -12.5 + k * 5;
      const h = rng() < 0.4 ? 8 : 2.5 + rng() * 5;
      b.add(new THREE.CylinderGeometry(0.72, 0.84, h, 14), gradientY('#7d8f58', '#d8cfb8', R.y, R.y + 3), at(lx, h / 2, lz), 0.04);
      if (h >= 7.9) b.add(new THREE.BoxGeometry(2.0, 0.5, 2.0), '#d8cfb8', at(lx, h + 0.25, lz), 0.04);
      const p = world(lx, lz);
      const capTop = h >= 7.9 ? h + 0.5 : h;
      colliders.add(circleCollider(p.x, p.z, h >= 7.9 ? 1.0 : 0.85, R.y - 1, R.y + capTop, 'column'));
      if (R.y + capTop > tallest.y) tallest = { x: p.x, y: R.y + capTop + 1.3, z: p.z };
    }
  }
  spots.push(tallest);
  // Fallen columns
  for (let k = 0; k < 3; k++) {
    const len = 5 + rng() * 2;
    const lx = -6 + k * 7;
    const lz = (rng() - 0.5) * 4;
    const ry = (rng() - 0.5) * 1.2;
    b.add(new THREE.CylinderGeometry(0.75, 0.75, len, 14), gradientY('#8a9a63', '#d0c7b0', R.y, R.y + 1.5), at(lx, 0.75 + 0.5, lz, ry, 0, Math.PI / 2), 0.04);
    const p = world(lx, lz);
    colliders.add(boxCollider(p.x, p.z, len / 2, 0.75, rot + ry, R.y - 1, R.y + 2.0, 'fallen-column'));
  }
  // Arch
  for (const lz of [-3.6, 3.6]) {
    b.add(new THREE.BoxGeometry(1.6, 9, 1.6), gradientY('#7d8f58', '#d8cfb8', R.y, R.y + 4), at(-17.5, 4.5, lz), 0.03);
    const p = world(-17.5, lz);
    colliders.add(boxCollider(p.x, p.z, 0.8, 0.8, rot, R.y - 1, R.y + 9, 'arch-pillar'));
  }
  b.add(new THREE.BoxGeometry(1.9, 1.4, 9.4), '#d8cfb8', at(-17.5, 9.7, 0), 0.03);
  const archTop = world(-17.5, 0);
  colliders.add(boxCollider(archTop.x, archTop.z, 0.95, 4.7, rot, R.y + 9, R.y + 10.4, 'arch-lintel'));
  spots.push({ x: archTop.x, y: R.y + 10.4 + 1.3, z: archTop.z });
  // The giant stone coin the Old Mint is named for.
  const coinM = at(18, 3.2, 0, Math.PI / 2, 1.3, 0);
  b.add(new THREE.CylinderGeometry(4.2, 4.2, 0.9, 48), '#b49a63', coinM, 0.03);
  b.add(new THREE.TorusGeometry(3.5, 0.2, 8, 48), '#8f7a4c', new THREE.Matrix4().multiplyMatrices(coinM, new THREE.Matrix4().makeTranslation(0, 0.5, 0).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))));
  b.add(new THREE.TorusGeometry(3.5, 0.2, 8, 48), '#8f7a4c', new THREE.Matrix4().multiplyMatrices(coinM, new THREE.Matrix4().makeTranslation(0, -0.5, 0).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))));
  const coinP = world(18, 0);
  colliders.add(boxCollider(coinP.x, coinP.z, 0.6, 4.0, rot, R.y - 1, R.y + 6.8, 'coin'));
  spots.push({ x: R.x, y: R.y + 1.8, z: R.z });

  const mesh = new THREE.Mesh(b.build(), surf.brick);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = 'ruins';
  group.add(mesh);
}

// --- Sky Shoals: floating islets spiraling up around Ante Peak --------------------

function buildIslets(
  L: Landmarks,
  island: Island,
  colliders: ColliderGrid,
  rng: () => number,
  group: THREE.Group,
  spots: Spot[],
): { islets: Islet[]; update: (time: number) => void } {
  const S = L.summit;
  const T = L.gate;
  const a0 = Math.atan2(T.z - S.z, T.x - S.x) + 0.55;
  const islets: Islet[] = [];
  // First islet floats a double-jump above the slope at ~36m.
  const radiusAtHeight = (a: number, target: number) => {
    let lo = 4;
    let hi = 150;
    for (let it = 0; it < 30; it++) {
      const mid = (lo + hi) / 2;
      const h = island.heightAt(S.x + Math.cos(a) * mid, S.z + Math.sin(a) * mid);
      if (h > target) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  let a = a0;
  for (let i = 0; i < 7; i++) {
    const y = 39 + i * 6.2;
    const r = Math.max(radiusAtHeight(a, y - 9), 12) + (i === 0 ? 4 : 2);
    const x = S.x + Math.cos(a) * r;
    const z = S.z + Math.sin(a) * r;
    const size = i === 6 ? 6.5 : 4.2 + rng() * 1.6;
    islets.push({ x, y, z, r: size });
    a += 10.5 / r;
  }

  const b = new GeoBuilder(rng);
  const crystals: THREE.Mesh[] = [];
  const crystalMat = glow('#8ff3ff', 2.8);
  for (let i = 0; i < islets.length; i++) {
    const it = islets[i];
    const top = new THREE.CylinderGeometry(it.r, it.r * 0.94, 1.1, 18);
    b.add(top, (_x, y, _z, out) => out.set(y > it.y + 0.45 ? '#79b84c' : '#8a6a46'), mat4(it.x, it.y, it.z), 0.04);
    const under = displace(new THREE.ConeGeometry(it.r * 0.94, it.r * 1.8, 10, 3), 0.35, i + 10);
    under.rotateX(Math.PI);
    b.add(under, gradientY('#5e5246', '#8a7a64', it.y - it.r * 1.8, it.y), mat4(it.x, it.y - 0.55 - it.r * 0.9, it.z), 0.06);
    for (let k = 0; k < 3; k++) {
      const ra = rng() * Math.PI * 2;
      const rr = it.r * (0.4 + rng() * 0.4);
      b.add(displace(new THREE.IcosahedronGeometry(0.45 + rng() * 0.35, 0), 0.1, k), '#9a9184', mat4(it.x + Math.cos(ra) * rr, it.y + 0.6, it.z + Math.sin(ra) * rr, 0, 1, 0.7, 1));
    }
    // Grass tufts and a few flowers so the tops aren't bare plates.
    b.add(new THREE.CylinderGeometry(it.r * 0.72, it.r * 0.78, 0.06, 18), '#86c450', mat4(it.x, it.y + 0.56, it.z), 0.05);
    for (let k = 0; k < 30; k++) {
      const ta = rng() * Math.PI * 2;
      const tr = Math.sqrt(rng()) * it.r * 0.88;
      const tx = it.x + Math.cos(ta) * tr;
      const tz = it.z + Math.sin(ta) * tr;
      for (let blade = 0; blade < 3; blade++) {
        const h = 0.45 + rng() * 0.4;
        b.add(
          new THREE.ConeGeometry(0.07, h, 3),
          rng() < 0.5 ? '#5f9f3a' : '#9ccf5a',
          mat4(tx + (rng() - 0.5) * 0.25, it.y + 0.55 + h / 2, tz + (rng() - 0.5) * 0.25, rng() * 6, 1, 1, 1, (rng() - 0.5) * 0.7, (rng() - 0.5) * 0.7),
        );
      }
    }
    const petals = ['#ffffff', '#ffd84d', '#ff8fc7', '#b59cff'];
    for (let k = 0; k < 12; k++) {
      const fa = rng() * Math.PI * 2;
      const fr = Math.sqrt(rng()) * it.r * 0.8;
      b.add(new THREE.IcosahedronGeometry(0.11, 0), petals[k % petals.length], mat4(it.x + Math.cos(fa) * fr, it.y + 0.78, it.z + Math.sin(fa) * fr));
    }
    if (i % 2 === 1) {
      b.add(new THREE.CylinderGeometry(0.13, 0.2, 1.8, 6), '#6b4a2f', mat4(it.x + it.r * 0.45, it.y + 1.45, it.z));
      b.add(displace(new THREE.IcosahedronGeometry(1.05, 1), 0.15, i), gradientY('#3a7a2c', '#7dbb4f', it.y + 1.5, it.y + 3.6), mat4(it.x + it.r * 0.45, it.y + 2.7, it.z, 0, 1, 0.85, 1), 0.06);
    }
    colliders.add(circleCollider(it.x, it.z, it.r * 0.95, it.y - it.r * 1.3, it.y + 0.55, 'islet'));
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), crystalMat);
    crystal.scale.set(0.7, 1.4, 0.7);
    crystal.position.set(it.x, it.y - it.r * 1.85 - 1.2, it.z);
    group.add(crystal);
    crystals.push(crystal);
    spots.push({ x: it.x, y: it.y + 0.55 + 1.3, z: it.z });
  }
  // A small gate on the highest islet: where the Tollkeeper's Seal waits on lucky days.
  const last = islets[islets.length - 1];
  for (const side of [-1.7, 1.7]) b.add(new THREE.BoxGeometry(0.55, 3.2, 0.55), '#d8cfb8', mat4(last.x + side, last.y + 2.15, last.z));
  b.add(new THREE.BoxGeometry(4.3, 0.45, 0.8), '#c23b35', mat4(last.x, last.y + 3.95, last.z));
  const mesh = new THREE.Mesh(b.build(), surf.masonry);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = 'islets';
  group.add(mesh);
  console.info(`[islets] ${islets.length} islets from y=${islets[0].y.toFixed(0)} to y=${last.y.toFixed(0)}`);
  return {
    islets,
    update(time) {
      crystals.forEach((c, i) => {
        c.rotation.y = time * 0.8 + i;
        c.position.y = islets[i].y - islets[i].r * 1.85 - 1.2 + Math.sin(time * 1.3 + i) * 0.3;
      });
    },
  };
}

// --- Summit cairn ---------------------------------------------------------------

export function buildSummit(L: Landmarks, colliders: ColliderGrid, rng: () => number, group: THREE.Group): (time: number) => void {
  const S = L.summit;
  const b = new GeoBuilder(rng);
  const rocks: Array<[number, number, number, number]> = [
    [0, 0.5, 0, 1.0],
    [0.15, 1.35, 0.05, 0.75],
    [-0.05, 2.0, 0, 0.5],
  ];
  for (const [x, y, z, r] of rocks) {
    b.add(displace(new THREE.IcosahedronGeometry(r, 0), 0.12 * r, x + y), '#8f877b', mat4(S.x + x - 2.2, S.y + y, S.z + z, rng() * 3, 1, 0.75, 1), 0.08);
  }
  b.add(new THREE.CylinderGeometry(0.06, 0.07, 4.6, 6), '#5a3d26', mat4(S.x + 1.6, S.y + 2.3, S.z - 0.6));
  colliders.add(circleCollider(S.x - 2.2, S.z, 1.0, S.y - 1, S.y + 2.3, 'cairn'));
  const mesh = new THREE.Mesh(b.build(), surf.brick);
  mesh.castShadow = true;
  group.add(mesh);
  const flagGeo = new THREE.PlaneGeometry(1.7, 1.0, 8, 1);
  flagGeo.translate(0.85, 0, 0);
  const flag = new THREE.Mesh(flagGeo, new THREE.MeshLambertMaterial({ color: '#e5484d', side: THREE.DoubleSide }));
  flag.position.set(S.x + 1.6, S.y + 4.05, S.z - 0.6);
  group.add(flag);
  const pos = flagGeo.getAttribute('position') as THREE.BufferAttribute;
  const baseX = Float32Array.from({ length: pos.count }, (_, i) => pos.getX(i));
  return (time) => {
    for (let i = 0; i < pos.count; i++) {
      const x = baseX[i];
      pos.setZ(i, Math.sin(time * 6 - x * 3.2) * 0.12 * x);
    }
    pos.needsUpdate = true;
    flag.rotation.y = Math.sin(time * 0.6) * 0.3 + 0.6;
  };
}

// ---------------------------------------------------------------------------------

export function buildIsleStructures(island: Island, colliders: ColliderGrid, surfaces: Surfaces): Structures {
  surf = surfaces;
  const t0 = performance.now();
  const L = island.landmarks;
  const rng = mulberry32(777);
  const group = new THREE.Group();
  group.name = 'structures';
  setHousePalette(['#f4efe4', '#f3e2bf', '#f2d4c2', '#dfe9ec', '#efe6d6', '#f6dca8', '#e5d6c8'], ['#2d6cdf', '#1f8f7a', '#c9562f', '#e3a92b', '#3a4fb8'], '#2f62c9');
  const spots: CardSpots = { town: [], ruins: [], sky: [], summit: [{ x: L.summit.x, y: L.summit.y + 1.3, z: L.summit.z + 1.5 }] };

  const updateThreshold = buildThreshold(L, colliders, rng, group);
  const town = buildTown(L, island, colliders, rng, group, spots.town);
  const updateLighthouse = buildLighthouse(L, colliders, rng, group);
  buildRuins(L, colliders, rng, group, spots.ruins);
  const sky = buildIslets(L, island, colliders, rng, group, spots.sky);
  const updateSummit = buildSummit(L, colliders, rng, group);

  const exclusions: Exclusion[] = [
    { x: L.gate.x, z: L.gate.z, r: 17 },
    { x: L.town.x, z: L.town.z, r: L.town.r + 4 },
    { x: L.extra.ruins.x, z: L.extra.ruins.z, r: 27 },
    { x: L.extra.lighthouse.x, z: L.extra.lighthouse.z, r: 13 },
    { x: L.summit.x, z: L.summit.z, r: 7 },
  ];
  console.info(`[structures] built in ${(performance.now() - t0).toFixed(0)}ms, ${colliders.all.length} colliders so far`);

  return {
    group,
    spots,
    islets: sky.islets,
    exclusions,
    fountain: town.fountain,
    update(_dt, time) {
      updateThreshold(time);
      town.update(time);
      updateLighthouse(time);
      sky.update(time);
      updateSummit(time);
    },
  };
}
