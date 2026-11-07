// Graphics quality: three presets, a first guess from the GPU's name, and a governor that
// watches the real frame rate and backs off (render scale first, then the preset) when a
// machine can't keep up. Everything here can change while the game runs.

export type QualityLevel = 'low' | 'medium' | 'high';
export type QualityChoice = 'auto' | QualityLevel;

export type QualitySettings = {
  level: QualityLevel;
  pixelRatio: number; // cap on devicePixelRatio
  shadowMap: number; // sun shadow map resolution
  treeShadows: boolean; // near trees cast shadows (the leaves are most of the shadow pass)
  ao: 'medium' | 'low' | 'off'; // screen-space ambient occlusion
  bloom: boolean;
  smaa: boolean; // anti-aliasing
  grass: number; // share of grass blades drawn, 0..1
  flowers: boolean;
  treeNear: number; // trees closer than this (m) are full geometry
  treeFar: number; // trees closer than this (m) are drawn at all, as flat impostors past treeNear
  capFrames: boolean; // on a 120 Hz+ screen draw every other frame (main.ts MIN_FRAME_MS)
  terrainLite: boolean; // half the terrain's texture reads: no anti-tiling second sample, one cliff face
};

export const PRESETS: Record<QualityLevel, QualitySettings> = {
  high: { level: 'high', pixelRatio: 1.5, shadowMap: 4096, treeShadows: true, ao: 'medium', bloom: true, smaa: true, grass: 1, flowers: true, treeNear: 78, treeFar: 900, capFrames: false, terrainLite: false },
  medium: { level: 'medium', pixelRatio: 1, shadowMap: 2048, treeShadows: true, ao: 'low', bloom: true, smaa: true, grass: 0.55, flowers: true, treeNear: 52, treeFar: 650, capFrames: true, terrainLite: false },
  low: { level: 'low', pixelRatio: 1, shadowMap: 1024, treeShadows: false, ao: 'off', bloom: false, smaa: false, grass: 0.25, flowers: false, treeNear: 30, treeFar: 420, capFrames: true, terrainLite: true },
};

export const LEVELS: QualityLevel[] = ['high', 'medium', 'low'];

const CHOICE_KEY = 'wildcard-isle:quality';

export function savedChoice(): QualityChoice {
  try {
    const v = localStorage.getItem(CHOICE_KEY);
    if (v === 'auto' || v === 'low' || v === 'medium' || v === 'high') return v;
  } catch {
    // storage blocked: fall through to auto
  }
  return 'auto';
}

export function saveChoice(choice: QualityChoice): void {
  try {
    localStorage.setItem(CHOICE_KEY, choice);
  } catch {
    // not saved; auto comes back next visit
  }
}

/**
 * First guess from the GPU's name. It only has to be roughly right: the governor corrects
 * it within a few seconds of play. Phones and tablets always start low.
 */
export function detectLevel(gpu: string, cores: number, mobile: boolean): QualityLevel {
  const g = gpu.toLowerCase();
  if (mobile) return 'low';
  if (/swiftshader|llvmpipe|software|microsoft basic/.test(g)) return 'low';
  if (/intel.*(hd|uhd) graphics|intel\(r\) (hd|uhd)/.test(g)) return 'low';
  if (/nvidia|geforce|quadro|rtx|radeon rx|radeon pro|apple m\d+ (pro|max|ultra)/.test(g)) return 'high';
  if (/iris|radeon|vega|apple m\d|apple gpu|intel.*arc/.test(g)) return 'medium';
  return cores >= 8 ? 'medium' : 'low';
}

/** The GPU's name, from a throwaway WebGL context (the real renderer isn't made yet). */
export function gpuName(): string {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
  if (!gl) return 'no webgl';
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return name;
}

export function isMobile(): boolean {
  const ua = navigator.userAgent;
  return /Android|iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

/**
 * Watches frame rate in 2 s windows while playing. Slow (< 42 fps): drop the render scale by
 * 10% down to 65%, then step the preset down (auto mode only). Fast again (> 56 fps for 6 s):
 * raise the render scale back. The preset is never raised automatically, so it can't flicker.
 */
export class Governor {
  scale = 1;
  private time = 0;
  private frames = 0;
  private warmup = 3;
  private slow = 0;
  private fast = 0;
  private readonly onScale: (scale: number) => void;
  private readonly onDrop: () => boolean;

  constructor(onScale: (scale: number) => void, onDrop: () => boolean) {
    this.onScale = onScale;
    this.onDrop = onDrop;
  }

  /** Ignore the next few seconds (shader compiles after a land loads or settings change). */
  settle(seconds = 3): void {
    this.warmup = seconds;
    this.time = 0;
    this.frames = 0;
  }

  sample(rawDt: number): void {
    if (this.warmup > 0) {
      this.warmup -= rawDt;
      return;
    }
    this.time += rawDt;
    this.frames++;
    if (this.time < 2) return;
    const fps = this.frames / this.time;
    this.time = 0;
    this.frames = 0;
    if (fps < 42) {
      this.fast = 0;
      if (this.scale > 0.65 + 1e-6) {
        this.scale = Math.max(0.65, this.scale - 0.1);
        console.info(`[quality] ${fps.toFixed(0)} fps: render scale -> ${this.scale.toFixed(2)}`);
        this.onScale(this.scale);
        this.settle(1);
      } else if (++this.slow >= 2) {
        this.slow = 0;
        if (this.onDrop()) {
          this.scale = 0.85;
          this.onScale(this.scale);
          this.settle(3);
        }
      }
    } else if (fps > 56) {
      this.slow = 0;
      if (this.scale < 1 && ++this.fast >= 3) {
        this.fast = 0;
        this.scale = Math.min(1, this.scale + 0.1);
        console.info(`[quality] ${fps.toFixed(0)} fps: render scale -> ${this.scale.toFixed(2)}`);
        this.onScale(this.scale);
        this.settle(1);
      }
    } else {
      this.slow = 0;
      this.fast = 0;
    }
  }
}
