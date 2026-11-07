import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

// Loads and caches the art the lands share: HDR skies (background + image-based
// lighting), packed ground texture arrays, and single textures (water, walls).

export type Sky = {
  id: string;
  background: THREE.DataTexture;
  environment: THREE.Texture;
  rotation: number; // apply as scene.backgroundRotation.y / environmentRotation.y
  sunDir: THREE.Vector3; // unit vector toward the sun, after rotation
  sunColor: THREE.Color;
  horizon: THREE.Color; // average sky color just above the horizon (fog)
  zenith: THREE.Color;
};

export type LayerSet = {
  albedo: THREE.DataArrayTexture; // rgb = albedo (sRGB-encoded), a = roughness
  normal: THREE.DataArrayTexture; // rgb = GL normal, a = ambient occlusion
  average: THREE.Color[]; // mean albedo per layer (minimap colors), linear
};

const TEX_SIZE = 1024;

function luminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

async function loadBitmap(url: string): Promise<ImageBitmap> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`[assets] ${res.status} loading ${url} (run: node scripts/fetch-assets.mjs)`);
  return createImageBitmap(await res.blob());
}

function pixels(bitmap: ImageBitmap, ctx: OffscreenCanvasRenderingContext2D): Uint8ClampedArray {
  ctx.clearRect(0, 0, TEX_SIZE, TEX_SIZE);
  ctx.drawImage(bitmap, 0, 0, TEX_SIZE, TEX_SIZE);
  return ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE).data;
}

export class Assets {
  private readonly pmrem: THREE.PMREMGenerator;
  private readonly skies = new Map<string, Promise<Sky>>();
  private readonly layerSets = new Map<string, Promise<LayerSet>>();
  private readonly textures = new Map<string, Promise<THREE.Texture>>();
  private readonly maxAnisotropy: number;

  constructor(renderer: THREE.WebGLRenderer) {
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  }

  /** sunAzimuth: where the sun should appear, as atan2(z, x). The sky is rotated to put it there. */
  sky(id: string, sunAzimuth: number): Promise<Sky> {
    const key = `${id}@${sunAzimuth.toFixed(3)}`;
    let p = this.skies.get(key);
    if (!p) {
      p = this.loadSky(id, sunAzimuth);
      this.skies.set(key, p);
    }
    return p;
  }

  private async loadSky(id: string, sunAzimuth: number): Promise<Sky> {
    const t0 = performance.now();
    const loader = new HDRLoader();
    loader.setDataType(THREE.FloatType);
    const tex = await loader.loadAsync(`/assets/hdri/${id}_2k.hdr`);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    const img = tex.image as { data: Float32Array; width: number; height: number };
    const { data, width, height } = img;

    // Brightest pixel = the sun. Rows run top (sky) to bottom in the file.
    let best = -1;
    let bestIdx = 0;
    for (let y = 0; y < height / 2; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const l = luminance(data[i], data[i + 1], data[i + 2]);
        if (l > best) {
          best = l;
          bestIdx = y * width + x;
        }
      }
    }
    const sx = bestIdx % width;
    const sy = Math.floor(bestIdx / width);
    const u = (sx + 0.5) / width;
    const v = 1 - (sy + 0.5) / height;
    const lon0 = (u - 0.5) * Math.PI * 2;
    // three samples the background at R(-rotation) * dir, so the sun shows up at lon0 - rotation.
    const rotation = lon0 - sunAzimuth;
    const lon = sunAzimuth;
    const lat = (v - 0.5) * Math.PI;
    const sunDir = new THREE.Vector3(Math.cos(lon) * Math.cos(lat), Math.sin(lat), Math.sin(lon) * Math.cos(lat)).normalize();
    // Keep the light a little above the horizon even for sunset skies (shadows stay sane).
    if (sunDir.y < 0.12) {
      sunDir.y = 0.12;
      sunDir.normalize();
    }

    // Sun color: average around the hottest pixel, normalized.
    const sunColor = new THREE.Color(0, 0, 0);
    let n = 0;
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        const yy = Math.min(height - 1, Math.max(0, sy + dy));
        const xx = (sx + dx + width) % width;
        const i = (yy * width + xx) * 4;
        sunColor.r += data[i];
        sunColor.g += data[i + 1];
        sunColor.b += data[i + 2];
        n++;
      }
    }
    const maxC = Math.max(sunColor.r, sunColor.g, sunColor.b) || 1;
    sunColor.setRGB(sunColor.r / maxC, sunColor.g / maxC, sunColor.b / maxC);

    // Horizon and zenith colors for fog and water tinting.
    const band = (v0: number, v1: number) => {
      const c = new THREE.Color(0, 0, 0);
      let count = 0;
      const y0 = Math.floor((1 - v1) * height);
      const y1 = Math.floor((1 - v0) * height);
      for (let y = y0; y < y1; y++) {
        for (let x = 0; x < width; x += 4) {
          const i = (y * width + x) * 4;
          c.r += Math.min(data[i], 4);
          c.g += Math.min(data[i + 1], 4);
          c.b += Math.min(data[i + 2], 4);
          count++;
        }
      }
      return c.setRGB(c.r / count, c.g / count, c.b / count);
    };
    const horizon = band(0.505, 0.54);
    const zenith = band(0.85, 0.98);

    // Cap the sun's raw radiance (often thousands) so bloom can't smear it across
    // the screen. The directional light carries the sun's real strength instead.
    const CAP = 10;
    let capped = 0;
    for (let i = 0; i < data.length; i += 4) {
      const m = Math.max(data[i], data[i + 1], data[i + 2]);
      if (m <= CAP) continue;
      const k = CAP / m;
      data[i] *= k;
      data[i + 1] *= k;
      data[i + 2] *= k;
      capped++;
    }
    tex.needsUpdate = true;
    const environment = this.pmrem.fromEquirectangular(tex).texture;
    console.info(
      `[assets] sky ${id}: sun dir (${sunDir.x.toFixed(2)}, ${sunDir.y.toFixed(2)}, ${sunDir.z.toFixed(2)}), ` +
        `horizon #${horizon.getHexString()}, ${capped} sun pixels capped, ${(performance.now() - t0).toFixed(0)}ms`,
    );
    return { id, background: tex, environment, rotation, sunDir, sunColor, horizon, zenith };
  }

  /** Five Poly Haven texture sets packed into two texture arrays. */
  layers(ids: string[]): Promise<LayerSet> {
    const key = ids.join('|');
    let p = this.layerSets.get(key);
    if (!p) {
      p = this.loadLayers(ids);
      this.layerSets.set(key, p);
    }
    return p;
  }

  private async loadLayers(ids: string[]): Promise<LayerSet> {
    const t0 = performance.now();
    const canvas = new OffscreenCanvas(TEX_SIZE, TEX_SIZE);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('[assets] OffscreenCanvas 2d unavailable');
    const layerBytes = TEX_SIZE * TEX_SIZE * 4;
    const albedo = new Uint8Array(layerBytes * ids.length);
    const normal = new Uint8Array(layerBytes * ids.length);
    const average: THREE.Color[] = [];
    const maps = await Promise.all(
      ids.map((id) =>
        Promise.all(['diff', 'nor_gl', 'arm'].map((m) => loadBitmap(`/assets/textures/${id}_${m}_1k.jpg`))),
      ),
    );
    for (let layer = 0; layer < ids.length; layer++) {
      const [diff, nor, arm] = maps[layer];
      const d = pixels(diff, ctx).slice();
      const nn = pixels(nor, ctx).slice();
      const a = pixels(arm, ctx);
      const base = layer * layerBytes;
      let sr = 0;
      let sg = 0;
      let sb = 0;
      for (let p = 0; p < TEX_SIZE * TEX_SIZE; p++) {
        const o = p * 4;
        albedo[base + o] = d[o];
        albedo[base + o + 1] = d[o + 1];
        albedo[base + o + 2] = d[o + 2];
        albedo[base + o + 3] = a[o + 1]; // roughness
        normal[base + o] = nn[o];
        normal[base + o + 1] = nn[o + 1];
        normal[base + o + 2] = nn[o + 2];
        normal[base + o + 3] = a[o]; // ambient occlusion
        if ((p & 63) === 0) {
          sr += d[o];
          sg += d[o + 1];
          sb += d[o + 2];
        }
      }
      const count = (TEX_SIZE * TEX_SIZE) / 64;
      average.push(new THREE.Color().setRGB(sr / count / 255, sg / count / 255, sb / count / 255, THREE.SRGBColorSpace));
      for (const bmp of maps[layer]) bmp.close();
    }
    const make = (bytes: Uint8Array, srgb: boolean) => {
      const t = new THREE.DataArrayTexture(bytes, TEX_SIZE, TEX_SIZE, ids.length);
      t.format = THREE.RGBAFormat;
      t.type = THREE.UnsignedByteType;
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = true;
      t.anisotropy = Math.min(8, this.maxAnisotropy);
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.needsUpdate = true;
      return t;
    };
    console.info(`[assets] layers ${ids.join(', ')} packed in ${(performance.now() - t0).toFixed(0)}ms`);
    return { albedo: make(albedo, true), normal: make(normal, false), average };
  }

  /** A single repeating texture (e.g. water normals, a wall's diffuse map). */
  texture(url: string, srgb: boolean): Promise<THREE.Texture> {
    let p = this.textures.get(url);
    if (!p) {
      p = new THREE.TextureLoader().loadAsync(url).then((t) => {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        t.anisotropy = Math.min(8, this.maxAnisotropy);
        return t;
      });
      this.textures.set(url, p);
    }
    return p;
  }
}
