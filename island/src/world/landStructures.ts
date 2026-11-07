import * as THREE from 'three';
import { GeoBuilder, displace, gradientY, mat4 } from './geo';
import { boxCollider, circleCollider, type ColliderGrid } from './collision';
import {
  buildSummit,
  buildThreshold,
  buildTown,
  glow,
  setHousePalette,
  setSurfaces,
  surfaces,
  type CardSpots,
  type Structures,
} from './structures';
import { FROSTVEIL_LAKE_LEVEL } from './lands/frostveil';
import { SUNSCAR_MESAS } from './lands/sunscar';
import { mulberry32 } from '../util/math';
import type { Island, Spot } from './terrain';
import type { Surfaces } from './surfaces';
import type { TreeInstance } from './trees';

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, name: string): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  m.name = name;
  return m;
}

// ---------------------------------------------------------------------------------
// Sunscar: adobe town, a natural sandstone arch, an obelisk on the tallest mesa.
// ---------------------------------------------------------------------------------

export function buildSunscarStructures(island: Island, colliders: ColliderGrid, surf: Surfaces): Structures {
  setSurfaces(surf);
  setHousePalette(['#e8c99a', '#dcb17d', '#f0d8b0', '#d9a878', '#e6c08e'], ['#2a7f8f', '#b5482f', '#3b5fa8', '#c58a2b'], '#2a8f86');
  const L = island.landmarks;
  const rng = mulberry32(911);
  const group = new THREE.Group();
  group.name = 'structures-sunscar';
  const spots: CardSpots = { town: [], landmark: [], summit: [] };
  const updateGate = buildThreshold(L, colliders, rng, group);
  const town = buildTown(L, island, colliders, rng, group, spots.town);

  // Natural arch: two weathered legs and a sagging span, all sandstone.
  const A = L.extra.arch;
  const b = new GeoBuilder(rng);
  const rot = 0.6;
  const at = (lx: number, ly: number, lz: number, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) =>
    new THREE.Matrix4().multiplyMatrices(mat4(A.x, A.y, A.z, rot), mat4(lx, ly, lz, ry, sx, sy, sz, rx, rz));
  const sand = gradientY('#b9784a', '#e2a670', A.y, A.y + 20);
  for (const side of [-1, 1]) {
    const leg = displace(new THREE.CylinderGeometry(2.6, 4.2, 15, 12, 6), 0.35, side + 3);
    b.add(leg, sand, at(side * 10, 7.5, 0, 0, 1, 1, 0.75, 0, side * 0.12), 0.05);
    const p = new THREE.Vector3(side * 10, 0, 0).applyMatrix4(new THREE.Matrix4().makeRotationY(rot));
    colliders.add(circleCollider(A.x + p.x, A.z + p.z, 3.4, A.y - 1, A.y + 14.5, 'arch-leg'));
  }
  const span = displace(new THREE.TorusGeometry(10, 2.8, 10, 24, Math.PI), 0.3, 9);
  b.add(span, sand, at(0, 13.5, 0, 0, 1, 0.55, 0.8), 0.05);
  const archTop = new THREE.Vector3(0, 0, 0).applyMatrix4(new THREE.Matrix4().makeRotationY(rot));
  colliders.add(boxCollider(A.x + archTop.x, A.z + archTop.z, 9, 2.2, rot, A.y + 15.4, A.y + 16.4, 'arch-top'));
  spots.landmark.push({ x: A.x + archTop.x, y: A.y + 17.6, z: A.z + archTop.z });
  group.add(mesh(b.build(), surf.brick, 'arch'));

  // Obelisk on the tallest mesa, card spots on every mesa top.
  let tallest = 0;
  SUNSCAR_MESAS.forEach((m, i) => {
    const top = L.extra[`mesa${i}`];
    spots.landmark.push({ x: top.x + 4, y: top.y + 1.3, z: top.z - 3 });
    if (top.y > L.extra[`mesa${tallest}`].y) tallest = i;
    void m;
  });
  const T = L.extra[`mesa${tallest}`];
  const ob = new GeoBuilder(rng);
  ob.add(new THREE.CylinderGeometry(0.9, 1.4, 10, 4), gradientY('#8a5a3a', '#d8a06a', T.y, T.y + 10), mat4(T.x, T.y + 5, T.z, Math.PI / 4), 0.04);
  ob.add(new THREE.ConeGeometry(0.95, 1.6, 4), '#e8b84a', mat4(T.x, T.y + 10.8, T.z, Math.PI / 4));
  group.add(mesh(ob.build(), surf.brick, 'obelisk'));
  colliders.add(circleCollider(T.x, T.z, 1.3, T.y - 1, T.y + 10, 'obelisk'));
  spots.summit.push({ x: T.x + 3, y: T.y + 1.3, z: T.z + 3 });

  return {
    group,
    spots,
    islets: [],
    exclusions: [
      { x: L.gate.x, z: L.gate.z, r: 17 },
      { x: L.town.x, z: L.town.z, r: L.town.r + 4 },
      { x: A.x, z: A.z, r: 16 },
    ],
    fountain: town.fountain,
    update(_dt, time) {
      updateGate(time);
      town.update(time);
    },
  };
}

// ---------------------------------------------------------------------------------
// Frostveil: timber village with snowy pitched roofs, a frozen lake, an ice spire.
// ---------------------------------------------------------------------------------

function cabin(b: GeoBuilder, roof: GeoBuilder, colliders: ColliderGrid, x: number, y: number, z: number, rot: number, w: number, d: number, h: number, spots: Spot[]): void {
  const m = mat4(x, y, z, rot);
  const at = (lx: number, ly: number, lz: number, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) =>
    new THREE.Matrix4().multiplyMatrices(m, mat4(lx, ly, lz, ry, sx, sy, sz, rx, rz));
  b.add(new THREE.BoxGeometry(w + 0.4, 0.7, d + 0.4), '#6f6a62', at(0, 0.35, 0));
  b.add(new THREE.BoxGeometry(w, h, d), '#a8784a', at(0, 0.7 + h / 2, 0), 0.04);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(new THREE.BoxGeometry(0.4, h + 0.2, 0.4), '#5a3d26', at(sx * (w / 2), 0.7 + h / 2, sz * (d / 2)));
  b.add(new THREE.BoxGeometry(1.2, 2.1, 0.12), '#5a2f22', at(0, 1.75, d / 2 + 0.06));
  for (const sx of [-1, 1]) b.add(new THREE.BoxGeometry(0.9, 0.9, 0.1), '#ffd58a', at(sx * (w / 2 - 1.2), 2.4, d / 2 + 0.06));
  // Pitched roof: two slabs, snow on top, gable ends.
  const pitch = 0.62;
  const half = w / 2 + 0.6;
  const slab = half / Math.cos(pitch);
  const ridgeY = 0.7 + h + Math.tan(pitch) * half;
  for (const side of [-1, 1]) {
    roof.add(new THREE.BoxGeometry(slab, 0.28, d + 1.2), '#5b3a2a', at((side * half) / 2, (0.7 + h + ridgeY) / 2, 0, 0, 1, 1, 1, 0, -side * pitch));
    b.add(new THREE.BoxGeometry(slab, 0.22, d + 1.3), '#f4f7fb', at((side * half) / 2, (0.7 + h + ridgeY) / 2 + 0.22, 0, 0, 1, 1, 1, 0, -side * pitch));
  }
  const gable = new THREE.BufferGeometry();
  gable.setAttribute('position', new THREE.Float32BufferAttribute([-w / 2, 0, 0, w / 2, 0, 0, 0, ridgeY - 0.7 - h, 0], 3));
  gable.computeVertexNormals();
  for (const sz of [-1, 1]) b.add(gable.clone(), '#9c6e44', at(0, 0.7 + h, sz * (d / 2 + 0.01), sz > 0 ? 0 : Math.PI));
  b.add(new THREE.BoxGeometry(0.7, 2.2, 0.7), '#6f6a62', at(w / 2 - 1, ridgeY - 0.4, -d / 4));
  colliders.add(boxCollider(x, z, w / 2 + 0.25, d / 2 + 0.25, rot, y - 1, y + 0.7 + h, 'cabin'));
  colliders.add(boxCollider(x, z, w / 4, d / 2, rot, y + h, ridgeY + y - 0.4, 'cabin-roof'));
  spots.push({ x, y: y + ridgeY + 1.3, z });
}

export function buildFrostveilStructures(island: Island, colliders: ColliderGrid, surf: Surfaces): Structures {
  setSurfaces(surf);
  const L = island.landmarks;
  const rng = mulberry32(912);
  const group = new THREE.Group();
  group.name = 'structures-frostveil';
  const spots: CardSpots = { town: [], landmark: [], summit: [] };
  const updateGate = buildThreshold(L, colliders, rng, group);
  const updateSummit = buildSummit(L, colliders, rng, group);
  spots.summit.push({ x: L.summit.x, y: L.summit.y + 1.3, z: L.summit.z + 1.5 });

  // Hearthhold: cabins in a loose ring facing a central bonfire square.
  const t = L.town;
  const walls = new GeoBuilder(rng);
  const roofs = new GeoBuilder(rng);
  const lanterns = new GeoBuilder(rng);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + rng() * 0.2;
    const r = 18 + (i % 2) * 9 + rng() * 3;
    const x = t.x + Math.cos(a) * r;
    const z = t.z + Math.sin(a) * r;
    if (island.heightAt(x, z) < t.y - 1.5) continue;
    const face = Math.atan2(t.x - x, t.z - z);
    cabin(walls, roofs, colliders, x, t.y, z, face, 6 + rng() * 2, 7 + rng() * 2, 3.4 + rng() * 0.8, spots.town);
  }
  // Bonfire + lantern posts.
  const fire = new GeoBuilder(rng);
  for (let i = 0; i < 6; i++) fire.add(new THREE.CylinderGeometry(0.16, 0.2, 2.2, 6), '#4a2f1e', mat4(t.x, t.y + 0.4, t.z, (i / 6) * Math.PI, 1, 1, 1, 1.1, 0));
  fire.add(new THREE.CylinderGeometry(2.2, 2.4, 0.5, 18), '#5f5a52', mat4(t.x, t.y + 0.25, t.z));
  colliders.add(circleCollider(t.x, t.z, 2.4, t.y - 1, t.y + 0.5, 'fire-ring'));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = t.x + Math.cos(a) * 11;
    const z = t.z + Math.sin(a) * 11;
    fire.add(new THREE.CylinderGeometry(0.09, 0.12, 3.2, 6), '#2f3440', mat4(x, t.y + 1.6, z));
    lanterns.add(new THREE.BoxGeometry(0.3, 0.42, 0.3), '#ffffff', mat4(x, t.y + 3.4, z));
    colliders.add(circleCollider(x, z, 0.18, t.y - 1, t.y + 3.6, 'lamp'));
  }
  group.add(mesh(walls.build(), surf.wood, 'cabins'), mesh(roofs.build(), surf.roof, 'cabin-roofs'), mesh(fire.build(), surf.masonry, 'square'));
  group.add(new THREE.Mesh(lanterns.build(), new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color('#ffc66b').multiplyScalar(2.8) })));
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.4, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff9a3c').multiplyScalar(4), transparent: true, opacity: 0.85 }));
  flame.position.set(t.x, t.y + 1.6, t.z);
  group.add(flame);

  // Frozen lake: a walkable sheet of ice wherever the bowl dips below the lake level.
  const lake = L.extra.lake;
  const ice = new THREE.Mesh(
    new THREE.CircleGeometry(46, 64).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: '#cfe9f7', roughness: 0.08, metalness: 0.0, transparent: true, opacity: 0.9 }),
  );
  ice.position.set(lake.x, FROSTVEIL_LAKE_LEVEL, lake.z);
  ice.receiveShadow = true;
  ice.name = 'ice';
  group.add(ice);
  colliders.add(circleCollider(lake.x, lake.z, 44, FROSTVEIL_LAKE_LEVEL - 6, FROSTVEIL_LAKE_LEVEL, 'ice'));
  spots.landmark.push({ x: lake.x, y: FROSTVEIL_LAKE_LEVEL + 1.3, z: lake.z });

  // Ice spire: a cluster of glowing crystal shards.
  const S = L.extra.spire;
  const crystalMat = new THREE.MeshStandardMaterial({ color: '#bfe8ff', emissive: new THREE.Color('#3aa8ff'), emissiveIntensity: 0.9, roughness: 0.12, transparent: true, opacity: 0.88 });
  const cg = new GeoBuilder(rng);
  for (let i = 0; i < 9; i++) {
    const a = rng() * Math.PI * 2;
    const r = i === 0 ? 0 : 1.5 + rng() * 2.5;
    const hgt = i === 0 ? 16 : 5 + rng() * 7;
    cg.add(new THREE.OctahedronGeometry(1, 0), '#ffffff', mat4(S.x + Math.cos(a) * r, S.y + hgt * 0.45, S.z + Math.sin(a) * r, rng() * 3, 1.1, hgt * 0.55, 1.1, (rng() - 0.5) * 0.35, (rng() - 0.5) * 0.35));
  }
  const spire = new THREE.Mesh(cg.build(), crystalMat);
  spire.castShadow = true;
  group.add(spire);
  colliders.add(circleCollider(S.x, S.z, 2.2, S.y - 1, S.y + 15, 'spire'));
  spots.landmark.push({ x: S.x + 4, y: S.y + 1.3, z: S.z });
  const pB = L.extra.peakB;
  spots.landmark.push({ x: pB.x, y: pB.y + 1.3, z: pB.z });

  return {
    group,
    spots,
    islets: [],
    exclusions: [
      { x: L.gate.x, z: L.gate.z, r: 17 },
      { x: t.x, z: t.z, r: t.r + 4 },
      { x: lake.x, z: lake.z, r: 40 },
      { x: S.x, z: S.z, r: 10 },
      { x: L.summit.x, z: L.summit.z, r: 7 },
    ],
    fountain: new THREE.Vector3(t.x, t.y + 2, t.z),
    update(_dt, time) {
      updateGate(time);
      updateSummit(time);
      flame.scale.set(1 + Math.sin(time * 13) * 0.08, 1 + Math.sin(time * 9.3) * 0.15, 1 + Math.cos(time * 11) * 0.08);
      crystalMat.emissiveIntensity = 0.8 + Math.sin(time * 1.4) * 0.25;
    },
  };
}

// ---------------------------------------------------------------------------------
// Mistmoor: stilt village on boardwalks, a mossy stone shrine, the giant tree.
// ---------------------------------------------------------------------------------

export function buildMistmoorStructures(island: Island, colliders: ColliderGrid, surf: Surfaces): Structures {
  setSurfaces(surf);
  const L = island.landmarks;
  const rng = mulberry32(913);
  const group = new THREE.Group();
  group.name = 'structures-mistmoor';
  const spots: CardSpots = { town: [], landmark: [], summit: [] };
  const updateGate = buildThreshold(L, colliders, rng, group);

  // Lanternfen: huts on stilts linked by boardwalks over the shallows.
  const t = L.town;
  const deck = 1.7;
  const wood = new GeoBuilder(rng);
  const roofs = new GeoBuilder(rng);
  const lanterns = new GeoBuilder(rng);
  const huts: Array<{ x: number; z: number }> = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rng() * 0.3;
    const r = 12 + (i % 3) * 7 + rng() * 2;
    huts.push({ x: t.x + Math.cos(a) * r, z: t.z + Math.sin(a) * r });
  }
  const plank = (x0: number, z0: number, x1: number, z1: number) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const rot = Math.atan2(x1 - x0, z1 - z0);
    const cx = (x0 + x1) / 2;
    const cz = (z0 + z1) / 2;
    wood.add(new THREE.BoxGeometry(2.2, 0.16, len), '#8a6a46', mat4(cx, deck, cz, rot), 0.06);
    for (let k = 0; k <= len; k += 4) {
      const px = x0 + ((x1 - x0) * k) / len;
      const pz = z0 + ((z1 - z0) * k) / len;
      for (const side of [-1, 1]) {
        const ox = Math.cos(rot) * side * 1.0;
        const oz = -Math.sin(rot) * side * 1.0;
        wood.add(new THREE.CylinderGeometry(0.11, 0.13, 3.4, 6), '#4f3b27', mat4(px + ox, deck - 1.6, pz + oz));
      }
    }
    colliders.add(boxCollider(cx, cz, 1.1, len / 2, rot, deck - 1.2, deck + 0.08, 'boardwalk'));
  };
  // Hub platform + walks to every hut, plus a walk to dry land.
  wood.add(new THREE.CylinderGeometry(6, 6, 0.3, 24), '#8f6e48', mat4(t.x, deck - 0.05, t.z), 0.05);
  colliders.add(circleCollider(t.x, t.z, 6, deck - 1.2, deck + 0.1, 'hub'));
  for (const h of huts) plank(t.x, t.z, h.x, h.z);
  const shoreDir = Math.atan2(-t.seaX, -t.seaZ);
  plank(t.x, t.z, t.x - t.seaX * (t.r + 10), t.z - t.seaZ * (t.r + 10));
  void shoreDir;
  for (const h of huts) {
    const w = 5 + rng() * 1.5;
    const rot = Math.atan2(t.x - h.x, t.z - h.z);
    const m = mat4(h.x, deck, h.z, rot);
    const at = (lx: number, ly: number, lz: number, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) =>
      new THREE.Matrix4().multiplyMatrices(m, mat4(lx, ly, lz, ry, sx, sy, sz, rx, rz));
    wood.add(new THREE.BoxGeometry(w + 1.4, 0.2, w + 1.4), '#7d5f3e', at(0, 0, 0));
    wood.add(new THREE.CylinderGeometry(w * 0.5, w * 0.55, 2.8, 8), '#9a7a52', at(0, 1.5, 0), 0.05);
    roofs.add(new THREE.ConeGeometry(w * 0.82, 2.8, 8), '#6e6a3a', at(0, 4.3, 0), 0.06);
    lanterns.add(new THREE.BoxGeometry(0.28, 0.36, 0.28), '#ffffff', at(0, 2.2, w * 0.56));
    colliders.add(circleCollider(h.x, h.z, w * 0.55, deck - 1, deck + 2.9, 'hut'));
    colliders.add(boxCollider(h.x, h.z, (w + 1.4) / 2, (w + 1.4) / 2, rot, deck - 1.2, deck + 0.1, 'hut-deck'));
    spots.town.push({ x: h.x, y: deck + 4.4 + 1.3, z: h.z });
  }
  group.add(mesh(wood.build(), surf.wood, 'stilts'), mesh(roofs.build(), surf.roof, 'hut-roofs'));
  group.add(new THREE.Mesh(lanterns.build(), new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color('#ffcf7a').multiplyScalar(3) })));

  // Shrine: a ring of mossy stones around a low altar.
  const S = L.extra.shrine;
  const st = new GeoBuilder(rng);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const x = S.x + Math.cos(a) * 9;
    const z = S.z + Math.sin(a) * 9;
    const h = 3 + rng() * 2.2;
    st.add(displace(new THREE.CylinderGeometry(0.7, 1.0, h, 5, 3), 0.08, i), gradientY('#4f5a3a', '#8c9179', S.y, S.y + h), mat4(x, S.y + h / 2 - 0.2, z, a, 1, 1, 0.7, (rng() - 0.5) * 0.15, (rng() - 0.5) * 0.15), 0.06);
    colliders.add(circleCollider(x, z, 0.85, S.y - 1, S.y + h - 0.2, 'shrine-stone'));
  }
  st.add(new THREE.CylinderGeometry(2.4, 2.8, 1.1, 18), '#7b7f6a', mat4(S.x, S.y + 0.5, S.z), 0.05);
  colliders.add(circleCollider(S.x, S.z, 2.7, S.y - 1, S.y + 1.1, 'altar'));
  group.add(mesh(st.build(), surf.brick, 'shrine'));
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 2), glow('#9fffd2', 3.2));
  orb.position.set(S.x, S.y + 2.4, S.z);
  group.add(orb);
  spots.landmark.push({ x: S.x + 1, y: S.y + 2.4, z: S.z + 1 });

  // The giant tree on the central rise (rendered by the forest system).
  const T = L.extra.tree;
  const extraTrees: TreeInstance[] = [{ variant: 0, x: T.x, y: T.y - 0.5, z: T.z, rot: 0.4, scale: 1 }];
  colliders.add(circleCollider(T.x, T.z, 3.6, T.y - 1, T.y + 16, 'giant-tree'));
  spots.summit.push({ x: T.x + 6, y: T.y + 1.3, z: T.z + 6 });
  for (const k of ['outcrop0', 'outcrop1']) {
    const o = L.extra[k];
    spots.landmark.push({ x: o.x, y: island.heightAt(o.x, o.z) + 1.3, z: o.z });
  }

  return {
    group,
    spots,
    islets: [],
    exclusions: [
      { x: L.gate.x, z: L.gate.z, r: 17 },
      { x: t.x, z: t.z, r: t.r + 6 },
      { x: S.x, z: S.z, r: 13 },
      { x: T.x, z: T.z, r: 12 },
    ],
    fountain: new THREE.Vector3(t.x, deck + 2, t.z),
    extraTrees,
    update(_dt, time) {
      updateGate(time);
      orb.position.y = S.y + 2.4 + Math.sin(time * 1.6) * 0.25;
    },
  };
}

export { surfaces };
