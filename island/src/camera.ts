import * as THREE from 'three';
import type { Input } from './player/input';
import type { World } from './world/world';
import { clamp, damp } from './util/math';

const SENSITIVITY = 0.0022;
const SHOULDER = 0.55;
const BASE_FOV = 60;

/** Third-person orbit camera: mouse orbits, wheel zooms, terrain never blocks the view. */
export class CameraRig {
  yaw = 0;
  pitch = -0.22;
  dist = 6.8;
  targetDist = 6.8;
  fovBoost = 0;
  readonly camera: THREE.PerspectiveCamera;
  readonly target = new THREE.Vector3();
  readonly forward = new THREE.Vector3();
  private shake = 0;
  private time = 0;
  /** Height above the feet the camera aims at; set per character (about 85% of their height). */
  lookHeight = 1.55;
  /** Current camera distance after occlusion: snaps in when blocked, eases back out. */
  private pull = 6.8;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  snap(playerPos: THREE.Vector3): void {
    this.target.set(playerPos.x, playerPos.y + this.lookHeight, playerPos.z);
    this.dist = this.targetDist;
    this.pull = this.targetDist;
  }

  /** How far back the camera can sit along a view direction before a hill or a building gets in the way. */
  private reach(world: World, ax: number, ay: number, az: number, fx: number, fy: number, fz: number, dist: number): number {
    const steps = 24;
    for (let i = 1; i <= steps; i++) {
      const t = (i / steps) * dist;
      if (world.blocksCamera(ax - fx * t, ay - fy * t, az - fz * t)) return Math.max(1.4, t - 0.6);
    }
    return dist;
  }

  /** The yaw nearest `base` (up to 90 degrees off, in 15 degree steps) with a clear view of the player. */
  clearYaw(world: World, playerPos: THREE.Vector3, base: number): number {
    const cp = Math.cos(this.pitch);
    const fy = Math.sin(this.pitch);
    const ay = playerPos.y + this.lookHeight;
    for (let k = 0; k <= 12; k++) {
      const yaw = base + (k % 2 === 1 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 12);
      const ax = playerPos.x + Math.cos(yaw) * SHOULDER;
      const az = playerPos.z - Math.sin(yaw) * SHOULDER;
      const clear = this.reach(world, ax, ay, az, -Math.sin(yaw) * cp, fy, -Math.cos(yaw) * cp, this.targetDist) >= this.targetDist;
      if (clear) return yaw;
    }
    return base;
  }

  addShake(amount: number): void {
    this.shake = Math.min(1.2, this.shake + amount);
  }

  handleInput(input: Input): void {
    this.yaw -= input.mouseDX * SENSITIVITY;
    this.pitch = clamp(this.pitch - input.mouseDY * SENSITIVITY, -1.2, 0.62);
    if (input.wheel !== 0) this.targetDist = clamp(this.targetDist * Math.exp(input.wheel * 0.0012), 3.5, 24);
  }

  update(dt: number, playerPos: THREE.Vector3, world: World): void {
    this.time += dt;
    this.target.x = damp(this.target.x, playerPos.x, 20, dt);
    this.target.z = damp(this.target.z, playerPos.z, 20, dt);
    this.target.y = damp(this.target.y, playerPos.y + this.lookHeight, 10, dt);
    this.dist = damp(this.dist, this.targetDist, 8, dt);

    const cp = Math.cos(this.pitch);
    const fx = -Math.sin(this.yaw) * cp;
    const fy = Math.sin(this.pitch);
    const fz = -Math.cos(this.yaw) * cp;
    this.forward.set(fx, fy, fz);
    const rx = Math.cos(this.yaw);
    const rz = -Math.sin(this.yaw);
    const ax = this.target.x + rx * SHOULDER;
    const ay = this.target.y;
    const az = this.target.z + rz * SHOULDER;

    // Pull the camera in when a hill or a building blocks the view; ease back out once clear.
    const open = this.reach(world, ax, ay, az, fx, fy, fz, this.dist);
    this.pull = open < this.pull ? damp(this.pull, open, 22, dt) : damp(this.pull, open, 5, dt);
    const d = this.pull;
    let cx = ax - fx * d;
    let cy = ay - fy * d;
    let cz = az - fz * d;
    cy = Math.max(cy, world.heightAt(cx, cz) + 0.45, -0.6);

    if (this.shake > 0.001) {
      const s = this.shake * this.shake * 0.35;
      cx += Math.sin(this.time * 61) * s;
      cy += Math.sin(this.time * 47 + 1.3) * s;
      cz += Math.sin(this.time * 53 + 2.1) * s;
      this.shake = damp(this.shake, 0, 6, dt);
    }

    this.camera.position.set(cx, cy, cz);
    this.camera.lookAt(cx + fx * 10, cy + fy * 10, cz + fz * 10);
    const fov = damp(this.camera.fov, BASE_FOV + this.fovBoost, 6, dt);
    if (Math.abs(fov - this.camera.fov) > 0.01) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }
}
