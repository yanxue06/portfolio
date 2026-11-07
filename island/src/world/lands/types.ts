export type LandId = 'isle' | 'sunscar' | 'frostveil' | 'mistmoor';

export type Point = { x: number; z: number };
export type Spot = { x: number; y: number; z: number };
export type Flat = { x: number; z: number; r: number; blend: number; h: number };
export type Town = Spot & { r: number; seaX: number; seaZ: number };

/** Places every land has, plus land-specific ones in `extra`. */
export type Landmarks = {
  gate: Spot;
  town: Town;
  summit: Spot;
  extra: Record<string, Spot>;
};

/** What the land generator sees for one grid vertex. */
export type ShadeIn = {
  x: number;
  z: number;
  h: number;
  slope: number; // 0 flat .. 1 vertical
  path: number; // 0..1 on a path
  stone: number; // 0..1 paved
  n1: number; // fine variation noise 0..1
  n2: number; // broad variation noise 0..1
};

/** What covers that vertex. w = splat weights for the 5 ground layers (summing to 1). */
export type ShadeOut = {
  w: Float32Array;
  forest: number;
  grass: number;
  rock: number;
};

/**
 * Ground layers, same slots in every land:
 * 0 base ground, 1 secondary (paths, forest floor), 2 rock (triplanar), 3 shore, 4 paving.
 */
export const LAYER = { base: 0, secondary: 1, rock: 2, shore: 3, paving: 4 } as const;

export type LandGen = {
  id: LandId;
  seaFloor: number;
  baseHeight(x: number, z: number): number;
  landmarks(): Landmarks;
  flats(L: Landmarks): Flat[];
  paths(L: Landmarks): Point[][];
  stoneAt(x: number, z: number, L: Landmarks): number;
  shade(i: ShadeIn, L: Landmarks, out: ShadeOut): void;
};
