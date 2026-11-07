import type * as THREE from 'three';
import type { World } from './world/world';
import type { Player } from './player/player';
import type { Input } from './player/input';
import type { CameraRig } from './camera';
import type { Fx } from './fx';
import type { Sfx } from './sfx';
import type { Cards } from './cards/cards';
import type { Critters } from './critters';
import type { Spells } from './spells';
import type { Hud } from './hud/hud';
import type { DayInfo } from './cards/daily';

export type Mode = 'intro' | 'select' | 'play' | 'paused' | 'binder' | 'map' | 'loading';

/** Every system, in one bag. Systems receive this in update() instead of importing each other. */
export type Game = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  rig: CameraRig;
  input: Input;
  world: World;
  player: Player;
  fx: Fx;
  sfx: Sfx;
  cards: Cards;
  critters: Critters;
  spells: Spells;
  hud: Hud;
  day: DayInfo;
  time: number;
  mode: Mode;
  testMode: boolean;
};
