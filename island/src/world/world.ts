import * as THREE from 'three';
import type { QualitySettings } from '../quality';
import { buildIsland, type Island, type Landmarks } from './terrain';
import { createWater, type Water } from './water';
import { ColliderGrid, footprintContains, pushOut, type Collider, type PushResult } from './collision';

const CAMERA_SEES_THROUGH = new Set(['tree', 'lamp', 'mushroom-stem', 'mushroom-cap']);
import { buildIsleStructures, type Structures } from './structures';
import { buildFrostveilStructures, buildMistmoorStructures, buildSunscarStructures } from './landStructures';
import { createFoliage, type Foliage } from './foliage';
import { loadSurfaces, type Surfaces } from './surfaces';
import { treeTexturesReady } from './trees';
import type { Assets, Sky } from './assets';
import type { LandDef } from './lands/defs';

/** Feet can step up onto anything at most this much higher (stairs, curbs). */
export const STEP_UP = 0.55;

export type Atmosphere = {
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  renderer: THREE.WebGLRenderer;
};

function buildStructures(land: LandDef, island: Island, colliders: ColliderGrid, surfaces: Surfaces): Structures {
  if (land.id === 'isle') return buildIsleStructures(island, colliders, surfaces);
  if (land.id === 'sunscar') return buildSunscarStructures(island, colliders, surfaces);
  if (land.id === 'frostveil') return buildFrostveilStructures(island, colliders, surfaces);
  if (land.id === 'mistmoor') return buildMistmoorStructures(island, colliders, surfaces);
  throw new Error(`[world] no structures for land ${String(land.id)}`);
}

export class World {
  readonly land: LandDef;
  readonly island: Island;
  readonly landmarks: Landmarks;
  readonly colliders: ColliderGrid;
  readonly sky: Sky;
  readonly water: Water;
  readonly structures: Structures;
  readonly foliage: Foliage;
  readonly surfaces: Surfaces;
  readonly root = new THREE.Group();
  /** Collider the last groundAt() call landed on (null = terrain). */
  standingOn: Collider | null = null;
  private readonly near: Collider[] = [];
  private readonly push: PushResult = { x: 0, z: 0, nx: 0, nz: 0, hit: false };
  private readonly updaters: Array<(dt: number, time: number) => void> = [];

  private constructor(parts: {
    land: LandDef;
    island: Island;
    colliders: ColliderGrid;
    sky: Sky;
    water: Water;
    structures: Structures;
    foliage: Foliage;
    surfaces: Surfaces;
  }) {
    this.land = parts.land;
    this.island = parts.island;
    this.landmarks = parts.island.landmarks;
    this.colliders = parts.colliders;
    this.sky = parts.sky;
    this.water = parts.water;
    this.structures = parts.structures;
    this.foliage = parts.foliage;
    this.surfaces = parts.surfaces;
    this.root.name = `world-${parts.land.id}`;
    this.root.add(this.island.mesh, this.water.mesh, this.structures.group, this.foliage.group);
  }

  static async create(renderer: THREE.WebGLRenderer, land: LandDef, assets: Assets): Promise<World> {
    const t0 = performance.now();
    const [sky, layers, surfaces, waterNormals] = await Promise.all([
      assets.sky(land.sky.hdri, land.sky.sunAzimuth),
      assets.layers(land.layers.map((l) => l.tex)),
      loadSurfaces(assets),
      assets.texture('/assets/textures/waternormals.jpg', false),
      treeTexturesReady(land.trees.map((t) => t.preset)),
    ]);
    const island = buildIsland(land.gen, layers, {
      scales: land.layers.map((l) => l.scale),
      tints: land.layers.map((l) => new THREE.Color(l.tint)),
      rough: land.layers.map((l) => l.rough),
      triplanar: 2,
    });
    const colliders = new ColliderGrid();
    const structures = buildStructures(land, island, colliders, surfaces);
    const foliage = createFoliage(renderer, land, island, layers, sky, colliders, structures.exclusions, structures.extraTrees ?? []);
    const water = createWater(island, sky, land.water, waterNormals, land.sky.env);
    console.info(`[world] fog ${land.fogColor ?? 'from sky'}, water foam ${land.water.foamAmount}`);
    const world = new World({ land, island, colliders, sky, water, structures, foliage, surfaces });
    console.info(`[world] ${land.name} ready in ${(performance.now() - t0).toFixed(0)}ms, ${colliders.all.length} colliders`);
    return world;
  }

  /** Sky, image-based light, sun, fill light, fog and exposure for this land. */
  applyAtmosphere(scene: THREE.Scene, a: Atmosphere): void {
    const s = this.land.sky;
    scene.background = this.sky.background;
    scene.backgroundRotation.set(0, this.sky.rotation, 0);
    scene.backgroundIntensity = s.bg;
    scene.environment = this.sky.environment;
    scene.environmentRotation.set(0, this.sky.rotation, 0);
    scene.environmentIntensity = s.env;
    const fogColor = this.land.fogColor ? new THREE.Color(this.land.fogColor) : this.sky.horizon.clone().multiplyScalar(s.bg);
    // Keep haze below white so distant land fades instead of bleaching.
    const lum = 0.2126 * fogColor.r + 0.7152 * fogColor.g + 0.0722 * fogColor.b;
    if (lum > 0.75) fogColor.multiplyScalar(0.75 / lum);
    scene.fog = new THREE.Fog(fogColor, s.fogNear, s.fogFar);
    a.sun.color.copy(this.sky.sunColor);
    a.sun.intensity = s.sun;
    a.hemi.color.copy(this.sky.zenith).lerp(new THREE.Color('#ffffff'), 0.5);
    a.hemi.groundColor.set('#5d6b3c');
    a.hemi.intensity = s.hemi;
    a.renderer.toneMappingExposure = s.exposure;
  }

  /** Register a per-frame animation for decor (boats, beacons, rings...). */
  onUpdate(fn: (dt: number, time: number) => void): void {
    this.updaters.push(fn);
  }

  update(dt: number, time: number, camera: THREE.Camera, focus: THREE.Vector3): void {
    this.water.update(time);
    this.structures.update(dt, time);
    this.foliage.update(time, focus, camera.position);
    for (const fn of this.updaters) fn(dt, time);
  }

  dispose(): void {
    this.root.removeFromParent();
    this.island.dispose();
    this.water.dispose();
    this.foliage.dispose();
    this.root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry.dispose();
    });
    console.info(`[world] disposed ${this.land.id}`);
  }

  heightAt(x: number, z: number): number {
    return this.island.heightAt(x, z);
  }

  /** Highest surface under (x, z) that feet at height y can stand on. */
  groundAt(x: number, z: number, feetY: number, radius: number): number {
    let ground = this.island.heightAt(x, z);
    this.standingOn = null;
    this.colliders.query(x, z, radius, this.near);
    for (const c of this.near) {
      if (c.top <= ground) continue;
      if (feetY < c.top - STEP_UP) continue;
      if (!footprintContains(c, x, z, radius * 0.35)) continue;
      ground = c.top;
      this.standingOn = c;
    }
    return ground;
  }

  /** Lowest overhang above feet at y (Infinity if open sky). */
  ceilingAt(x: number, z: number, feetY: number, radius: number): number {
    let ceiling = Infinity;
    this.colliders.query(x, z, radius, this.near);
    for (const c of this.near) {
      if (c.bottom <= feetY + 0.4) continue;
      if (!footprintContains(c, x, z, -radius * 0.2)) continue;
      if (c.bottom < ceiling) ceiling = c.bottom;
    }
    return ceiling;
  }

  /** Pushes a standing capsule out of solid colliders and kills velocity into them. */
  resolveCapsule(pos: THREE.Vector3, radius: number, height: number, vel: THREE.Vector3): boolean {
    let hit = false;
    this.colliders.query(pos.x, pos.z, radius + 0.5, this.near);
    for (const c of this.near) {
      if (pos.y >= c.top - STEP_UP) continue;
      if (pos.y + height <= c.bottom) continue;
      if (pos.y + height - c.bottom < 0.5 && vel.y > 0) continue;
      pushOut(c, pos.x, pos.z, radius, this.push);
      if (!this.push.hit) continue;
      hit = true;
      pos.x = this.push.x;
      pos.z = this.push.z;
      const vn = vel.x * this.push.nx + vel.z * this.push.nz;
      if (vn < 0) {
        vel.x -= vn * this.push.nx;
        vel.z -= vn * this.push.nz;
      }
    }
    return hit;
  }

  /** Is a point inside any solid collider? Used by blink and projectiles. */
  /** Applies a quality preset's world parts (trees, grass, flowers). */
  applyQuality(q: QualitySettings): void {
    this.foliage.setQuality(q);
  }

  /** Camera occlusion: terrain plus colliders, except thin ones (trunks, lamps, stems) that would make it jump. */
  blocksCamera(x: number, y: number, z: number): boolean {
    if (y < this.island.heightAt(x, z) + 0.45) return true;
    this.colliders.query(x, z, 0.3, this.near);
    for (const c of this.near) {
      if (CAMERA_SEES_THROUGH.has(c.tag) || y < c.bottom || y > c.top + 0.3) continue;
      if (footprintContains(c, x, z, 0.3)) return true;
    }
    return false;
  }

  solidAt(x: number, y: number, z: number, radius: number): boolean {
    if (y < this.island.heightAt(x, z)) return true;
    this.colliders.query(x, z, radius, this.near);
    for (const c of this.near) {
      if (y < c.bottom || y > c.top) continue;
      if (footprintContains(c, x, z, radius)) return true;
    }
    return false;
  }
}
