import type * as THREE from 'three';
import type { Game } from './game';

// Anything a spell can hit: jellyhops and monsters. Spells only ever see this shape, so a new
// kind of creature joins the fight by filling it in and being listed in game.foes.

/** What landed the blow. Armored monsters care: some only crack under a Thunderclap. */
export type HitKind = 'spark' | 'clap' | 'reflect';

export type Foe = {
  /** Feet for walkers, the body itself for flyers (their lift is 0). */
  pos: THREE.Vector3;
  /** Height of the body's center above pos. */
  lift: number;
  radius: number;
  alive: boolean;
  hit(amount: number, from: THREE.Vector3, knock: number, kind: HitKind, game: Game): void;
};

export function foeCenter(f: Foe, out: THREE.Vector3): THREE.Vector3 {
  return out.set(f.pos.x, f.pos.y + f.lift, f.pos.z);
}

/** Living foes whose body reaches within `radius` of a point. Reuses `out`. */
export function foesNear(foes: readonly Foe[], p: THREE.Vector3, radius: number, out: Foe[]): Foe[] {
  out.length = 0;
  for (const f of foes) {
    if (!f.alive) continue;
    const dx = f.pos.x - p.x;
    const dy = f.pos.y + f.lift - p.y;
    const dz = f.pos.z - p.z;
    const reach = radius + f.radius;
    if (dx * dx + dy * dy + dz * dz < reach * reach) out.push(f);
  }
  return out;
}
