import * as THREE from 'three';
import { GeoBuilder, displace } from '../world/geo';
import { backTex } from '../cards/faces';
import { radialTexture } from '../fx';
import { RARITY } from '../cards/catalog';
import { mulberry32 } from '../util/math';
import type { LandId } from '../world/lands/types';

// Monster bodies, built from code (no model files to download). Each monster is two to four
// meshes, so a handful on screen costs a handful of draw calls. Moving parts that don't need
// their own transform (wings, petals) are morph targets on one mesh: the GPU blends between
// two poses, one draw call. The geometry is built once per land and shared by every copy.

export type Tint = {
  glow: string; // lantern flame, orbs, eyes
  paper: string;
  wingA: string; // wing root
  wingB: string; // wing tip
  plant: string;
  plantTip: string;
  pod: string;
  shell: string;
  shellTop: string; // moss, sand or snow on a Rumbleback's back
  skin: string;
};

export const TINTS: Record<LandId, Tint> = {
  isle: { glow: '#ff8a2e', paper: '#e8643a', wingA: '#4a2236', wingB: '#ffc98a', plant: '#3f7a35', plantTip: '#d8473a', pod: '#d7ff5a', shell: '#7d7568', shellTop: '#6f9a4a', skin: '#8a6d55' },
  sunscar: { glow: '#ffc23d', paper: '#e8a23a', wingA: '#5a2e14', wingB: '#ffe3a0', plant: '#5f8a3a', plantTip: '#ff8a3c', pod: '#ffb347', shell: '#b07a52', shellTop: '#e0b47a', skin: '#9a6a44' },
  frostveil: { glow: '#6fd2ff', paper: '#5fa8d8', wingA: '#1e3552', wingB: '#e0f4ff', plant: '#3d6b6a', plantTip: '#6fb8ff', pod: '#9fe8ff', shell: '#8a96a8', shellTop: '#f4f8ff', skin: '#6e7c90' },
  mistmoor: { glow: '#a8ff6b', paper: '#7cc048', wingA: '#2e1a3e', wingB: '#e0c4ff', plant: '#4a5a2a', plantTip: '#b060ff', pod: '#c08aff', shell: '#5e5a4a', shellTop: '#4f6a3a', skin: '#6a5a48' },
};

const tmpColor = new THREE.Color();

function mat(x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx): THREE.Matrix4 {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ'));
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(sx, sy, sz));
}

/** Two builds of the same parts in the same order: the second's positions become a morph target. */
function withMorph(base: THREE.BufferGeometry, pose: THREE.BufferGeometry, radius: number): THREE.BufferGeometry {
  const a = base.getAttribute('position');
  const b = pose.getAttribute('position');
  if (a.count !== b.count) throw new Error(`[monsters] morph pose has ${b.count} vertices, base has ${a.count}`);
  base.morphAttributes.position = [b];
  base.morphAttributes.normal = [pose.getAttribute('normal')];
  base.morphTargetsRelative = false;
  // the pose can reach past the base's bounds; culling uses this sphere
  base.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), radius);
  return base;
}

// --- Lanternwing: a paper lantern with moth wings and one big eye ---------------------------

const LANTERN_RINGS = 17;

function lanternBody(t: Tint): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < LANTERN_RINGS; i++) {
    const y = -0.52 + (1.04 * i) / (LANTERN_RINGS - 1);
    const k = y / 0.52;
    pts.push(new THREE.Vector2(0.15 + 0.36 * Math.sqrt(Math.max(0, 1 - k * k)), y));
  }
  const b = new GeoBuilder(mulberry32(7));
  const paper = new THREE.Color(t.paper);
  const step = 1.04 / (LANTERN_RINGS - 1);
  // alternate rings a shade darker: soft ribs where the paper folds
  b.add(new THREE.LatheGeometry(pts, 16), (_x, y, _z, out) => {
    const ring = Math.round((y + 0.52) / step);
    out.copy(paper).multiplyScalar(ring % 2 ? 0.8 : 1);
  });
  return b.build();
}

function lanternFrame(t: Tint, flap: boolean): THREE.BufferGeometry {
  const b = new GeoBuilder(mulberry32(8));
  const wood = '#4a3426';
  b.add(new THREE.CylinderGeometry(0.16, 0.2, 0.07, 14), wood, mat(0, 0.55, 0));
  b.add(new THREE.CylinderGeometry(0.2, 0.16, 0.07, 14), wood, mat(0, -0.55, 0));
  b.add(new THREE.TorusGeometry(0.07, 0.02, 6, 14), wood, mat(0, 0.66, 0));
  b.add(new THREE.SphereGeometry(0.05, 8, 6), '#c23b2e', mat(0, -0.62, 0));
  b.add(new THREE.ConeGeometry(0.07, 0.34, 7), '#c23b2e', mat(0, -0.8, 0, Math.PI));
  // the eye, painted on the front, and its glint
  b.add(new THREE.SphereGeometry(0.25, 16, 12), '#fff3dc', mat(0, 0.04, 0.47, 0, 0, 0, 1, 0.8, 0.3));
  b.add(new THREE.SphereGeometry(0.15, 14, 10), '#1d1420', mat(0, 0.03, 0.53, 0, 0, 0, 1, 1.05, 0.35));
  b.add(new THREE.SphereGeometry(0.045, 8, 6), '#ffffff', mat(-0.05, 0.09, 0.585));
  b.add(new THREE.BoxGeometry(0.42, 0.07, 0.08), wood, mat(0.01, 0.29, 0.47, -0.25, 0, 0.16));
  for (const side of [-1, 1]) {
    b.add(new THREE.ConeGeometry(0.012, 0.32, 4), wood, mat(side * 0.09, 0.74, 0.02, 0, 0, -side * 0.5));
    b.add(new THREE.SphereGeometry(0.03, 6, 5), t.wingB, mat(side * 0.17, 0.88, 0.02));
  }
  // wings: one moth wing, placed twice. Flap pose folds them back and up.
  const sweep = flap ? 1.05 : 0.18;
  const lift = flap ? 0.7 : 0.2;
  const a = new THREE.Color(t.wingA);
  const tip = new THREE.Color(t.wingB);
  for (const side of [-1, 1]) {
    const place = new THREE.Matrix4()
      .makeTranslation(side * 0.13, 0.06, -0.33)
      .multiply(new THREE.Matrix4().makeRotationY(side > 0 ? sweep : Math.PI - sweep))
      .multiply(new THREE.Matrix4().makeRotationZ(lift));
    const attach = new THREE.Vector3(side * 0.13, 0.06, -0.33);
    const shade = (dim: number) => (x: number, y: number, z: number, out: THREE.Color) => {
      const d = Math.hypot(x - attach.x, y - attach.y, z - attach.z);
      const k = Math.min(1, Math.max(0, (d - 0.05) / 0.75));
      out.copy(a).lerp(tip, k * k * (3 - 2 * k)).multiplyScalar(dim);
    };
    const fore = new THREE.CircleGeometry(1, 20).scale(0.64, 0.34, 1).rotateZ(0.34).translate(0.58, 0.2, 0);
    const hind = new THREE.CircleGeometry(1, 16).scale(0.44, 0.28, 1).rotateZ(-0.4).translate(0.42, -0.2, 0);
    b.add(fore.applyMatrix4(place), shade(1));
    b.add(hind.applyMatrix4(place), shade(0.8));
    for (const dz of [0.006, -0.006]) {
      const k = Math.sign(dz);
      b.add(new THREE.CircleGeometry(0.11, 12).translate(0.72, 0.28, dz).applyMatrix4(place), t.glow);
      b.add(new THREE.CircleGeometry(0.06, 10).translate(0.72, 0.28, dz + k * 0.004).applyMatrix4(place), '#1d1420');
    }
  }
  return b.build();
}

export type LanternKit = { body: THREE.BufferGeometry; frame: THREE.BufferGeometry; frameMat: THREE.MeshLambertMaterial };

export function lanternKit(t: Tint): LanternKit {
  const frame = withMorph(lanternFrame(t, false), lanternFrame(t, true), 1.7);
  return { body: lanternBody(t), frame, frameMat: new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }) };
}

export type LanternModel = { group: THREE.Group; tilt: THREE.Group; body: THREE.Mesh; bodyMat: THREE.MeshLambertMaterial; frame: THREE.Mesh };

export function lanternModel(kit: LanternKit, t: Tint): LanternModel {
  const group = new THREE.Group();
  const tilt = new THREE.Group();
  group.add(tilt);
  const bodyMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: new THREE.Color(t.glow), emissiveIntensity: 0.35 });
  const body = new THREE.Mesh(kit.body, bodyMat);
  body.castShadow = true;
  const frame = new THREE.Mesh(kit.frame, kit.frameMat);
  tilt.add(body, frame);
  return { group, tilt, body, bodyMat, frame };
}

// --- Thornmortar: a rooted seed-pod plant; five thorned petals close over a glowing core ---

const PETALS = 5;

function mortarPlant(t: Tint, open: boolean): THREE.BufferGeometry {
  const b = new GeoBuilder(mulberry32(11));
  const plant = new THREE.Color(t.plant);
  const tip = new THREE.Color(t.plantTip);
  const earth = new THREE.Color('#3b2a1e');
  const mound = displace(new THREE.SphereGeometry(0.8, 14, 9), 0.07, 3).scale(1, 0.42, 1).translate(0, 0.05, 0);
  b.add(mound, (_x, y, _z, out) => out.copy(earth).lerp(plant, Math.min(1, Math.max(0, (y + 0.1) / 0.45))), undefined, 0.06);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.35;
    b.add(new THREE.CylinderGeometry(0.03, 0.11, 0.9, 6), '#4a3a26', mat(Math.sin(a) * 0.62, 0.08, Math.cos(a) * 0.62, Math.PI / 2 - 0.22, a, 0));
  }
  b.add(new THREE.CylinderGeometry(0.24, 0.36, 0.55, 12), plant.clone().multiplyScalar(0.85), mat(0, 0.45, 0));
  for (let i = 0; i < PETALS; i++) {
    const turn = (i / PETALS) * Math.PI * 2;
    const hinge = new THREE.Vector3(0, 0.68, open ? 0.26 : 0.36);
    const pose = new THREE.Matrix4()
      .makeRotationY(turn)
      .multiply(new THREE.Matrix4().makeTranslation(hinge.x, hinge.y, hinge.z))
      .multiply(new THREE.Matrix4().makeRotationX(open ? 1.05 : -0.3));
    hinge.applyMatrix4(new THREE.Matrix4().makeRotationY(turn));
    const petal = new THREE.SphereGeometry(1, 12, 8).scale(0.27, 0.53, 0.07).translate(0, 0.53, 0);
    // greener at the hinge, paler toward the tip
    b.add(petal.applyMatrix4(pose), (x, y, z, out) => {
      const d = Math.hypot(x - hinge.x, y - hinge.y, z - hinge.z);
      out.copy(plant).lerp(tip, Math.min(1, d / 1.06));
    });
    for (const h of [0.24, 0.46, 0.68, 0.88]) {
      b.add(new THREE.ConeGeometry(0.05, 0.22, 5).rotateX(Math.PI / 2).translate(0, h, 0.09).applyMatrix4(pose), '#f3ead2');
    }
  }
  return b.build();
}

export type MortarKit = { plant: THREE.BufferGeometry; core: THREE.BufferGeometry };

export function mortarKit(t: Tint): MortarKit {
  // the base's colors come from the closed pose; only positions and normals come from the open one
  return { plant: withMorph(mortarPlant(t, false), mortarPlant(t, true), 1.9), core: new THREE.SphereGeometry(0.27, 16, 12).translate(0, 1.05, 0) };
}

export type MortarModel = { group: THREE.Group; plant: THREE.Mesh; plantMat: THREE.MeshLambertMaterial; core: THREE.Mesh; coreMat: THREE.MeshBasicMaterial };

export function mortarModel(kit: MortarKit, t: Tint): MortarModel {
  const group = new THREE.Group();
  const plantMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const plant = new THREE.Mesh(kit.plant, plantMat);
  plant.castShadow = true;
  const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(t.pod) });
  const core = new THREE.Mesh(kit.core, coreMat);
  group.add(plant, core);
  return { group, plant, plantMat, core, coreMat };
}

// --- Rumbleback: an armored boulder of a beast that curls up and rolls --------------------

export const RUMBLE_PIVOT = 1.0; // its shell's center; the pose group turns about this point

function rumbleShell(t: Tint): THREE.BufferGeometry {
  const b = new GeoBuilder(mulberry32(21));
  const stone = new THREE.Color(t.shell);
  const top = new THREE.Color(t.shellTop);
  const shell = displace(new THREE.IcosahedronGeometry(1, 3), 0.07, 5).scale(1.15, 0.78, 1.35);
  b.add(shell, (_x, y, _z, out) => out.copy(stone).lerp(top, Math.min(1, Math.max(0, (y - 0.3) / 0.4))), undefined, 0.1);
  for (let i = 0; i < 4; i++) {
    const z = -0.75 + i * 0.5;
    b.add(new THREE.ConeGeometry(0.2, 0.45, 5), stone.clone().multiplyScalar(0.78), mat(0, 0.78 - Math.abs(z) * 0.18, z, -0.35), 0.08);
  }
  return b.build();
}

function rumbleLimbs(t: Tint): THREE.BufferGeometry {
  const b = new GeoBuilder(mulberry32(22));
  const skin = new THREE.Color(t.skin);
  const bone = '#e8dcc0';
  b.add(new THREE.SphereGeometry(0.5, 14, 10), skin, mat(0, -0.12, 1.3, 0, 0, 0, 0.95, 0.78, 1));
  b.add(new THREE.SphereGeometry(0.32, 12, 8), skin.clone().multiplyScalar(1.15), mat(0, -0.28, 1.72, 0, 0, 0, 1, 0.8, 0.9));
  b.add(new THREE.ConeGeometry(0.11, 0.46, 8), bone, mat(0, -0.05, 1.95, Math.PI / 2 - 0.55));
  for (const side of [-1, 1]) {
    b.add(new THREE.ConeGeometry(0.08, 0.42, 7), bone, mat(side * 0.32, 0.18, 1.4, -0.35, 0, -side * 0.55));
    for (const fz of [-1, 1]) {
      b.add(new THREE.CylinderGeometry(0.2, 0.25, 0.55, 9), skin, mat(side * 0.68, -0.7, fz * 0.62));
      b.add(new THREE.SphereGeometry(0.27, 10, 8), skin.clone().multiplyScalar(0.8), mat(side * 0.68, -0.95, fz * 0.62 + 0.06, 0, 0, 0, 1, 0.55, 1.25));
    }
  }
  b.add(new THREE.ConeGeometry(0.12, 0.5, 7), skin, mat(0, -0.25, -1.45, -Math.PI / 2 - 0.4));
  return b.build();
}

function rumbleGlow(t: Tint): THREE.BufferGeometry {
  const b = new GeoBuilder(mulberry32(23));
  const glow = new THREE.Color(t.glow).multiplyScalar(2.2);
  for (const side of [-1, 1]) b.add(new THREE.SphereGeometry(0.075, 8, 6), glow, mat(side * 0.24, 0.0, 1.68));
  // the soft belly: hidden against the ground until it lands on its back
  b.add(new THREE.CircleGeometry(0.72, 24), new THREE.Color('#ff8a4a').multiplyScalar(1.8), mat(0, -0.74, 0, Math.PI / 2));
  return b.build();
}

export type RumbleKit = { shell: THREE.BufferGeometry; limbs: THREE.BufferGeometry; glow: THREE.BufferGeometry; limbMat: THREE.MeshLambertMaterial; glowMat: THREE.MeshBasicMaterial };

export function rumbleKit(t: Tint): RumbleKit {
  return {
    shell: rumbleShell(t),
    limbs: rumbleLimbs(t),
    glow: rumbleGlow(t),
    limbMat: new THREE.MeshLambertMaterial({ vertexColors: true }),
    glowMat: new THREE.MeshBasicMaterial({ vertexColors: true }),
  };
}

export type RumbleModel = { group: THREE.Group; pose: THREE.Group; shell: THREE.Mesh; shellMat: THREE.MeshLambertMaterial; limbs: THREE.Mesh; glow: THREE.Mesh };

export function rumbleModel(kit: RumbleKit): RumbleModel {
  const group = new THREE.Group();
  const pose = new THREE.Group();
  pose.position.y = RUMBLE_PIVOT;
  group.add(pose);
  const shellMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const shell = new THREE.Mesh(kit.shell, shellMat);
  shell.castShadow = true;
  const limbs = new THREE.Mesh(kit.limbs, kit.limbMat);
  limbs.castShadow = true;
  const glow = new THREE.Mesh(kit.glow, kit.glowMat);
  pose.add(shell, limbs, glow);
  return { group, pose, shell, shellMat, limbs, glow };
}

// --- Snapjack: a card that folds in half into a mouth ---------------------------------------

const GOLD_UV = [0.5, 0.989]; // a texel on the card back's gold frame, for the edges and teeth

/** One half of a card, hinged on the card's middle line (y = 0). The card back shows on both faces. */
function cardHalf(top: boolean): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(0.9, 0.63, 0.035);
  g.translate(0, top ? 0.315 : -0.315, 0);
  const uv = g.getAttribute('uv') as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) {
    const face = Math.floor(i / 4); // px, nx, py, ny, pz, nz
    if (face < 4) {
      uv.setXY(i, GOLD_UV[0], GOLD_UV[1]);
      continue;
    }
    const v = uv.getY(i);
    uv.setY(i, top ? 0.5 + v * 0.5 : v * 0.5);
  }
  g.clearGroups();
  return g;
}

function snapExtras(top: boolean): THREE.BufferGeometry {
  const b = new GeoBuilder(mulberry32(top ? 31 : 32));
  const ivory = new THREE.Color('#fff4dc');
  const edge = top ? 0.6 : -0.6;
  for (let i = 0; i < 6; i++) {
    const x = -0.36 + i * 0.144;
    b.add(new THREE.ConeGeometry(0.045, 0.13, 4).rotateX(Math.PI / 2).translate(x, edge, 0.075), ivory);
  }
  if (top) {
    const red = new THREE.Color('#ff3b4a').multiplyScalar(2.4);
    for (const side of [-1, 1]) b.add(new THREE.SphereGeometry(0.07, 10, 8), red, mat(side * 0.18, 0.17, -0.04, 0, 0, 0, 1, 1, 0.6));
  }
  return b.build();
}

export type SnapKit = { top: THREE.BufferGeometry; bottom: THREE.BufferGeometry; topExtras: THREE.BufferGeometry; bottomExtras: THREE.BufferGeometry; cardMat: THREE.MeshBasicMaterial; extrasMat: THREE.MeshBasicMaterial };

export function snapKit(): SnapKit {
  return {
    top: cardHalf(true),
    bottom: cardHalf(false),
    topExtras: snapExtras(true),
    bottomExtras: snapExtras(false),
    cardMat: new THREE.MeshBasicMaterial({ map: backTex() }),
    extrasMat: new THREE.MeshBasicMaterial({ vertexColors: true }),
  };
}

export type SnapModel = { group: THREE.Group; top: THREE.Mesh; bottom: THREE.Mesh; extras: THREE.Mesh[]; glow: THREE.Sprite };

export function snapModel(kit: SnapKit): SnapModel {
  const group = new THREE.Group();
  const top = new THREE.Mesh(kit.top, kit.cardMat);
  const bottom = new THREE.Mesh(kit.bottom, kit.cardMat);
  top.castShadow = true;
  bottom.castShadow = true;
  const topExtras = new THREE.Mesh(kit.topExtras, kit.extrasMat);
  const bottomExtras = new THREE.Mesh(kit.bottomExtras, kit.extrasMat);
  top.add(topExtras);
  bottom.add(bottomExtras);
  // the same soft glow an uncommon card has, so it passes for one from a distance
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTexture(),
      color: tmpColor.set(RARITY.uncommon.color).multiplyScalar(0.85),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    }),
  );
  glow.scale.setScalar(2.7);
  glow.renderOrder = 9;
  group.add(top, bottom, glow);
  return { group, top, bottom, extras: [topExtras, bottomExtras], glow };
}

/** Everything a land's monsters share, freed in one go when the land unloads. */
export function disposeKits(...geos: Array<THREE.BufferGeometry | THREE.Material>): void {
  for (const g of geos) g.dispose();
}
