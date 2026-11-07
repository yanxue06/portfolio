// Shrinks the downloaded art in public/assets/ in place, so a first visit to island.yxue.ca
// stays near 20 MB (the Hobby plan's 100 GB/month of bandwidth is shared with yxue.ca).
//
//   node scripts/fetch-assets.mjs              # downloads anything missing (full-size originals)
//   node scripts/optimize-assets.mjs           # shrinks them in place; finished files are skipped
//   node scripts/optimize-assets.mjs --check   # exits 1 if any file still needs it
//
// Needs macOS `sips` for JPEG encoding and resizing. GLB, VRM and PNG work uses Node
// built-ins only. Each finished file carries a marker (a JPEG comment, or asset.extras in a
// GLB), which is how a re-run knows to skip it. What it does to each file, and why: ASSETS.md.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const MARK = 'wildcard-isle optimize-assets v1';
const SIPS = '/usr/bin/sips';
// Scratch files for sips: a fresh folder in the OS temp dir per run, removed when the run
// ends. Never inside public/ (that folder ships).
let TMP = '';

// sips quality is Apple's 0-100 scale, not libjpeg's: sips 60 is about libjpeg q86, 70 about
// q90, 75 about q93. Chroma '444' keeps full color resolution, which data maps need (normal
// X/Y and ARM's AO sit in red and green); '420' is the usual layout for color.
// File names keep their _1k suffix because the game builds the URLs from it.
// Picked by A/B screenshots against the originals (ASSETS.md has the numbers).
const BUILDING_SETS = ['plastered_wall_04', 'white_sandstone_bricks', 'wood_planks', 'clay_roof_tiles']; // src/world/surfaces.ts
const TEXTURE_RECIPES = [
  { match: /_diff_1k\.jpg$/, size: 1024, chroma: '420', quality: 70, label: 'diffuse, 1024 px, 4:2:0, sips q70' },
  // Buildings tile every ~2 m, so 512 px is still about one texel per screen pixel at the
  // closest the camera gets (3.5 m). They load as plain textures, not through the packer.
  {
    match: new RegExp(`^(${BUILDING_SETS.join('|')})_nor_gl_1k\\.jpg$`),
    size: 512,
    chroma: '420',
    quality: 75,
    label: 'building normal, 512 px, 4:2:0, sips q75',
  },
  // Terrain normals keep 1024 px: at 512 the packer in src/world/assets.ts upsamples them back
  // to 1024 and the near ground visibly loses relief.
  { match: /_nor_gl_1k\.jpg$/, size: 1024, chroma: '444', quality: 60, label: 'terrain normal, 1024 px, 4:4:4, sips q60' },
  // AO and roughness are soft; 512 px is indistinguishable in game once chroma stays 4:4:4.
  { match: /_arm_1k\.jpg$/, size: 512, chroma: '444', quality: 60, label: 'arm, 512 px, 4:4:4, sips q60' },
  // waternormals.jpg is left alone: 250 kB, and its finest ripple layer is already near 1:1.
];

// VRM characters: embedded images capped at 1024 px (thumbnail 256 px, never loaded:
// three-vrm's needThumbnailImage defaults to false). Images whose alpha matters stay PNG.
const VRM_IMAGE = { maxSize: 1024, thumbnailSize: 256, colorQuality: 75, normalQuality: 80, thumbnailQuality: 60 };
// Lossless PNG wins over JPEG unless it costs more than this factor in bytes.
const PNG_PREFERENCE = 1.25;

// Xbot.glb supplies animation only. src/characters/retarget.ts removes its meshes right after
// loading, looks clips up by these names, and reads quaternion tracks plus the hips position.
const ANIMATION_CLIPS = ['idle', 'walk', 'run'];
const ANIMATION_ROOT_BONE = 'mixamorig:Hips';

// --------------------------------------------------------------------------------------------
// small helpers

const run = promisify(execFile);
const mb = (n) => `${(n / 1e6).toFixed(2)} MB`;
const kb = (n) => `${Math.round(n / 1024)} kB`;

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile()) yield p;
  }
}

async function sips(argv) {
  try {
    await run(SIPS, argv, { maxBuffer: 1 << 22 });
  } catch (err) {
    throw new Error(`[optimize] sips ${argv.join(' ')} failed: ${err.stderr || err.message}`);
  }
}

/** Replaces `file` with `data` without ever leaving a half-written file in public/. */
function replaceFile(file, data) {
  const tmp = path.join(TMP, `replace-${path.basename(file)}`);
  fs.writeFileSync(tmp, data);
  try {
    fs.renameSync(tmp, file);
  } catch (err) {
    if (err.code !== 'EXDEV') throw err;
    fs.copyFileSync(tmp, file); // tmpdir on another volume
  }
}

async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: size }, worker));
  return results;
}

// --------------------------------------------------------------------------------------------
// JPEG: header segments only (sips does the pixel work)

/** Header segments up to the image data, as [marker, start, end) triples. */
function jpegSegments(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error('not a JPEG');
  const out = [];
  let p = 2;
  while (p + 4 <= buf.length) {
    if (buf[p] !== 0xff) throw new Error(`bad JPEG segment at byte ${p}`);
    while (buf[p + 1] === 0xff) p++; // fill bytes
    const marker = buf[p + 1];
    if (marker === 0xda) break; // start of scan: the rest is image data
    const end = p + 2 + buf.readUInt16BE(p + 2);
    out.push([marker, p, end]);
    p = end;
  }
  return out;
}

function jpegHasMark(buf) {
  for (const [marker, start, end] of jpegSegments(buf)) {
    if (marker === 0xfe && buf.toString('latin1', start + 4, end).startsWith('wildcard-isle optimize-assets')) return true;
  }
  return false;
}

/** The source's ICC profile, as its APP2 segments verbatim (multi-segment profiles included). */
function jpegIccSegments(buf) {
  return jpegSegments(buf)
    .filter(([marker, start]) => marker === 0xe2 && buf.toString('latin1', start + 4, start + 15) === 'ICC_PROFILE')
    .map(([, start, end]) => buf.subarray(start, end));
}

/**
 * Drops metadata segments (APP1-APP13, APP15: Exif, XMP, Photoshop, sips' own ICC) and adds
 * our comment and the source's ICC profile. Keeps APP0 (JFIF) and APP14 (Adobe, which tells
 * decoders the color transform). sips never converts pixels on its own, so the source profile
 * still describes them: each browser renders the new file the way it rendered the original.
 * That matters for winter_leaves_diff, whose camera profile Chrome applies and Safari ignores.
 */
function jpegFinish(buf, comment, icc = []) {
  const parts = [buf.subarray(0, 2)];
  const extra = [...(comment === undefined ? [] : [comSegment(comment)]), ...icc];
  let added = extra.length === 0;
  let p = 2;
  for (const [marker, start, end] of jpegSegments(buf)) {
    const isApp = marker >= 0xe0 && marker <= 0xef;
    if (isApp && marker !== 0xe0 && marker !== 0xee) {
      p = end;
      continue;
    }
    parts.push(buf.subarray(start, end));
    p = end;
    if (!added && marker === 0xe0) {
      parts.push(...extra);
      added = true;
    }
  }
  if (!added) parts.splice(1, 0, ...extra);
  parts.push(buf.subarray(p));
  return Buffer.concat(parts);
}

/** '444' when every component is sampled at full resolution, '420' for 2x2 luma, else the raw factors. */
function jpegChroma(buf) {
  let p = 2;
  while (p + 4 <= buf.length) {
    while (buf[p + 1] === 0xff) p++;
    const marker = buf[p + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const comps = buf[p + 9];
      const factors = [];
      for (let c = 0; c < comps; c++) factors.push(buf[p + 11 + c * 3]);
      if (factors.every((f) => f === 0x11)) return '444';
      if (factors[0] === 0x22 && factors.slice(1).every((f) => f === 0x11)) return '420';
      return factors.map((f) => f.toString(16)).join(',');
    }
    p += 2 + buf.readUInt16BE(p + 2);
  }
  return 'unknown';
}

function comSegment(text) {
  const body = Buffer.from(text, 'latin1');
  const head = Buffer.from([0xff, 0xfe, 0, 0]);
  head.writeUInt16BE(body.length + 2, 2);
  return Buffer.concat([head, body]);
}

// --------------------------------------------------------------------------------------------
// PNG decode/encode (8-bit, non-interlaced: what VRoid exports)

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Decodes to { w, h, data: RGBA bytes }. Throws on PNGs this decoder does not handle. */
export function decodePng(buf) {
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error('not a PNG');
  let p = 8;
  let w = 0, h = 0, depth = 0, colorType = 0, interlace = 0;
  let palette = null, transparency = null;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('latin1', p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      depth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'PLTE') palette = data;
    else if (type === 'tRNS') transparency = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (depth !== 8 || interlace !== 0 || !channels) {
    throw new Error(`unsupported PNG (bit depth ${depth}, color type ${colorType}, interlace ${interlace})`);
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * channels;
  const px = Buffer.alloc(stride * h);
  let prev = Buffer.alloc(stride);
  for (let y = 0, rp = 0; y < h; y++) {
    const filter = raw[rp++];
    const line = raw.subarray(rp, rp + stride);
    rp += stride;
    const cur = px.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev[x];
      const c = x >= channels ? prev[x - channels] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const pa = Math.abs(b - c);
        const pb = Math.abs(a - c);
        const pc = Math.abs(a + b - 2 * c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      } else if (filter !== 0) throw new Error(`bad PNG filter ${filter}`);
      cur[x] = v & 255;
    }
    prev = cur;
  }
  const out = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    let r, g, b, alpha = 255;
    if (colorType === 6) {
      r = px[i * 4]; g = px[i * 4 + 1]; b = px[i * 4 + 2]; alpha = px[i * 4 + 3];
    } else if (colorType === 2) {
      r = px[i * 3]; g = px[i * 3 + 1]; b = px[i * 3 + 2];
      if (transparency?.length >= 6 && r === transparency.readUInt16BE(0) && g === transparency.readUInt16BE(2) && b === transparency.readUInt16BE(4)) alpha = 0;
    } else if (colorType === 3) {
      const k = px[i];
      r = palette[k * 3]; g = palette[k * 3 + 1]; b = palette[k * 3 + 2];
      alpha = transparency && k < transparency.length ? transparency[k] : 255;
    } else if (colorType === 4) {
      r = g = b = px[i * 2]; alpha = px[i * 2 + 1];
    } else {
      r = g = b = px[i];
      if (transparency?.length >= 2 && px[i] === transparency.readUInt16BE(0)) alpha = 0;
    }
    out[i * 4] = r; out[i * 4 + 1] = g; out[i * 4 + 2] = b; out[i * 4 + 3] = alpha;
  }
  return { w, h, data: out };
}

function pngChunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([head.subarray(4), data])) >>> 0, 0);
  return Buffer.concat([head, data, crc]);
}

/** RGBA in, PNG out: RGBA when withAlpha, else RGB. Per-row filter chosen by smallest sum. */
export function encodePng({ w, h, data }, withAlpha, level = 9) {
  const channels = withAlpha ? 4 : 3;
  const stride = w * channels;
  const rows = Buffer.alloc((stride + 1) * h);
  let prev = Buffer.alloc(stride);
  const candidates = Array.from({ length: 5 }, () => Buffer.alloc(stride));
  for (let y = 0; y < h; y++) {
    const line = Buffer.alloc(stride);
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < channels; c++) line[x * channels + c] = data[(y * w + x) * 4 + c];
    }
    let best = 0;
    let bestScore = Infinity;
    for (let f = 0; f < 5; f++) {
      const out = candidates[f];
      let score = 0;
      for (let x = 0; x < stride; x++) {
        const a = x >= channels ? line[x - channels] : 0;
        const b = prev[x];
        const c = x >= channels ? prev[x - channels] : 0;
        let pred = 0;
        if (f === 1) pred = a;
        else if (f === 2) pred = b;
        else if (f === 3) pred = (a + b) >> 1;
        else if (f === 4) {
          const pa = Math.abs(b - c);
          const pb = Math.abs(a - c);
          const pc = Math.abs(a + b - 2 * c);
          pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        }
        const v = (line[x] - pred) & 255;
        out[x] = v;
        score += v < 128 ? v : 256 - v;
      }
      if (score < bestScore) {
        bestScore = score;
        best = f;
      }
    }
    rows[y * (stride + 1)] = best;
    candidates[best].copy(rows, y * (stride + 1) + 1);
    prev = line;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = withAlpha ? 6 : 2;
  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(rows, { level, memLevel: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const SRGB_TO_LINEAR = Float64Array.from({ length: 256 }, (_, i) => {
  const c = i / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
});

function linearToSrgb8(v) {
  const c = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, Math.round(c * 255)));
}

/**
 * Half size with a 2x2 box filter, which is what the GPU's next mip level holds anyway.
 * Color is averaged in linear light (srgb = true); normal maps and data as stored. Color
 * under transparent texels doesn't bleed into visible ones (weighted by alpha).
 */
export function halve(img, srgb) {
  const W = img.w >> 1;
  const H = img.h >> 1;
  const s = img.data;
  const o = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i0 = (2 * y * img.w + 2 * x) * 4;
      const i1 = i0 + 4;
      const i2 = i0 + img.w * 4;
      const i3 = i2 + 4;
      const a0 = s[i0 + 3], a1 = s[i1 + 3], a2 = s[i2 + 3], a3 = s[i3 + 3];
      const aSum = a0 + a1 + a2 + a3;
      const oi = (y * W + x) * 4;
      for (let c = 0; c < 3; c++) {
        const v0 = srgb ? SRGB_TO_LINEAR[s[i0 + c]] : s[i0 + c];
        const v1 = srgb ? SRGB_TO_LINEAR[s[i1 + c]] : s[i1 + c];
        const v2 = srgb ? SRGB_TO_LINEAR[s[i2 + c]] : s[i2 + c];
        const v3 = srgb ? SRGB_TO_LINEAR[s[i3 + c]] : s[i3 + c];
        const v = aSum > 0 ? (v0 * a0 + v1 * a1 + v2 * a2 + v3 * a3) / aSum : (v0 + v1 + v2 + v3) / 4;
        o[oi + c] = srgb ? linearToSrgb8(v) : Math.round(v);
      }
      o[oi + 3] = (aSum + 2) >> 2;
    }
  }
  return { w: W, h: H, data: o };
}

function hasTransparency(img) {
  for (let i = 3; i < img.data.length; i += 4) if (img.data[i] < 255) return true;
  return false;
}

async function jpegFromPixels(img, quality, name) {
  const src = path.join(TMP, `${name}.png`);
  const dst = path.join(TMP, `${name}.jpg`);
  fs.writeFileSync(src, encodePng(img, false, 1));
  await sips(['-s', 'format', 'jpeg', '-s', 'formatOptions', String(quality), src, '--out', dst]);
  return jpegFinish(fs.readFileSync(dst));
}

async function decodeImage(bytes, mimeType, name) {
  if (mimeType === 'image/png') return decodePng(bytes);
  if (mimeType === 'image/jpeg') {
    const src = path.join(TMP, `${name}-in.jpg`);
    const dst = path.join(TMP, `${name}-in.png`);
    fs.writeFileSync(src, bytes);
    await sips(['-s', 'format', 'png', src, '--out', dst]);
    return decodePng(fs.readFileSync(dst));
  }
  throw new Error(`unsupported image type ${mimeType}`);
}

// --------------------------------------------------------------------------------------------
// GLB container

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;
const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
const COMPONENT_BYTES = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const FLOAT = 5126;
const UNSIGNED_SHORT = 5123;
const UNSIGNED_INT = 5125;
const ELEMENT_ARRAY_BUFFER = 34963;

export function readGlb(buf, file) {
  if (buf.length < 20 || buf.readUInt32LE(0) !== GLB_MAGIC) throw new Error(`[optimize] ${file} is not a GLB`);
  if (buf.readUInt32LE(4) !== 2) throw new Error(`[optimize] ${file}: GLB version ${buf.readUInt32LE(4)}, expected 2`);
  const total = Math.min(buf.readUInt32LE(8), buf.length);
  let off = 12;
  let json = null;
  let bin = Buffer.alloc(0);
  while (off + 8 <= total) {
    const len = buf.readUInt32LE(off);
    const type = buf.readUInt32LE(off + 4);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === CHUNK_JSON) json = JSON.parse(data.toString('utf8'));
    else if (type === CHUNK_BIN) bin = data;
    else throw new Error(`[optimize] ${file}: unknown GLB chunk 0x${type.toString(16)}, refusing to drop it`);
    off += 8 + len;
  }
  if (!json) throw new Error(`[optimize] ${file}: no JSON chunk`);
  if ((json.buffers ?? []).length > 1 || json.buffers?.[0]?.uri !== undefined) {
    throw new Error(`[optimize] ${file}: external buffers are not supported`);
  }
  return { json, bin };
}

export function writeGlb(json, bin) {
  const text = Buffer.from(JSON.stringify(json), 'utf8');
  const textPad = Buffer.alloc((4 - (text.length % 4)) % 4, 0x20);
  const binPad = Buffer.alloc((4 - (bin.length % 4)) % 4, 0);
  const jsonLength = text.length + textPad.length;
  const binLength = bin.length + binPad.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(GLB_MAGIC, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonLength + (binLength ? 8 + binLength : 0), 8);
  const jsonHead = Buffer.alloc(8);
  jsonHead.writeUInt32LE(jsonLength, 0);
  jsonHead.writeUInt32LE(CHUNK_JSON, 4);
  const parts = [header, jsonHead, text, textPad];
  if (binLength) {
    const binHead = Buffer.alloc(8);
    binHead.writeUInt32LE(binLength, 0);
    binHead.writeUInt32LE(CHUNK_BIN, 4);
    parts.push(binHead, bin, binPad);
  }
  return Buffer.concat(parts);
}

function glbIsMarked(json) {
  return json.asset?.extras?.optimizedBy === MARK;
}

function markGlb(json, notes) {
  json.asset.extras = { ...(json.asset.extras ?? {}), optimizedBy: MARK, optimizeNotes: notes };
}

/** This script only knows binary data referenced from accessors and images. Anything else stops it. */
function assertKnownBufferViewRefs(json, file) {
  const known = /^\.(accessors\[\d+\](\.sparse\.(indices|values))?|images\[\d+\])\.bufferView$/;
  const stack = [[json, '']];
  while (stack.length) {
    const [node, at] = stack.pop();
    if (Array.isArray(node)) node.forEach((v, i) => stack.push([v, `${at}[${i}]`]));
    else if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        const here = `${at}.${key}`;
        if (key === 'bufferView' && !known.test(here)) {
          throw new Error(`[optimize] ${file}: binary data referenced from ${here}, which this script doesn't handle`);
        }
        stack.push([value, here]);
      }
    }
  }
}

/**
 * Turns bufferView indices into objects ({ def, data }) so views can be replaced, added and
 * dropped freely; pack() turns them back into indices and lays out the new buffer.
 */
function unpackViews(json, bin) {
  const views = (json.bufferViews ?? []).map((v) => {
    const start = v.byteOffset ?? 0;
    const def = { ...v };
    delete def.buffer;
    delete def.byteOffset;
    delete def.byteLength;
    return { def, data: bin.subarray(start, start + v.byteLength) };
  });
  for (const acc of json.accessors ?? []) {
    if (acc.bufferView !== undefined) acc.bufferView = views[acc.bufferView];
    if (acc.sparse) {
      acc.sparse.indices.bufferView = views[acc.sparse.indices.bufferView];
      acc.sparse.values.bufferView = views[acc.sparse.values.bufferView];
    }
  }
  for (const img of json.images ?? []) if (img.bufferView !== undefined) img.bufferView = views[img.bufferView];
  return views;
}

function pack(json, views) {
  const used = new Set();
  for (const acc of json.accessors ?? []) {
    if (acc.bufferView) used.add(acc.bufferView);
    if (acc.sparse) used.add(acc.sparse.indices.bufferView).add(acc.sparse.values.bufferView);
  }
  for (const img of json.images ?? []) if (img.bufferView) used.add(img.bufferView);
  const order = views.filter((v) => used.has(v));
  const index = new Map(order.map((v, i) => [v, i]));
  const parts = [];
  let offset = 0;
  json.bufferViews = order.map((v) => {
    const pad = (4 - (offset % 4)) % 4;
    if (pad) parts.push(Buffer.alloc(pad));
    offset += pad;
    const def = { buffer: 0, byteOffset: offset, byteLength: v.data.length, ...v.def };
    parts.push(v.data);
    offset += v.data.length;
    return def;
  });
  const tail = (4 - (offset % 4)) % 4;
  if (tail) parts.push(Buffer.alloc(tail));
  const bin = Buffer.concat(parts);
  for (const acc of json.accessors ?? []) {
    if (acc.bufferView) acc.bufferView = index.get(acc.bufferView);
    if (acc.sparse) {
      acc.sparse.indices.bufferView = index.get(acc.sparse.indices.bufferView);
      acc.sparse.values.bufferView = index.get(acc.sparse.values.bufferView);
    }
  }
  for (const img of json.images ?? []) if (img.bufferView) img.bufferView = index.get(img.bufferView);
  if (json.bufferViews.length === 0) delete json.bufferViews;
  json.buffers = bin.length ? [{ byteLength: bin.length }] : undefined;
  if (!json.buffers) delete json.buffers;
  return bin;
}

/** Bounds-checks every view, accessor and sparse block, so a bad rewrite never replaces a file. */
function validateGlb(json, bin, file) {
  const fail = (msg) => {
    throw new Error(`[optimize] ${file}: rewrite failed validation: ${msg}`);
  };
  const views = json.bufferViews ?? [];
  views.forEach((v, i) => {
    if (v.buffer !== 0 || v.byteOffset % 4 !== 0 || v.byteOffset + v.byteLength > bin.length) fail(`bufferView ${i} out of bounds`);
  });
  (json.accessors ?? []).forEach((acc, i) => {
    const size = COMPONENTS[acc.type] * COMPONENT_BYTES[acc.componentType];
    if (!size) fail(`accessor ${i} has an unknown type`);
    if (acc.bufferView !== undefined) {
      const v = views[acc.bufferView];
      if (!v) fail(`accessor ${i} points at a missing bufferView`);
      const stride = v.byteStride ?? size;
      if ((acc.byteOffset ?? 0) + stride * (acc.count - 1) + size > v.byteLength) fail(`accessor ${i} overruns its bufferView`);
    }
    if (acc.sparse) {
      const iv = views[acc.sparse.indices.bufferView];
      const vv = views[acc.sparse.values.bufferView];
      if (!iv || !vv) fail(`accessor ${i} sparse views missing`);
      if (acc.sparse.count * COMPONENT_BYTES[acc.sparse.indices.componentType] > iv.byteLength) fail(`accessor ${i} sparse indices overrun`);
      if (acc.sparse.count * size > vv.byteLength) fail(`accessor ${i} sparse values overrun`);
    }
  });
  (json.images ?? []).forEach((img, i) => {
    if (img.bufferView !== undefined && !views[img.bufferView]) fail(`image ${i} points at a missing bufferView`);
  });
}

/** Tightly packed copy of an accessor's elements (throws on interleaved data). */
function accessorArray(acc) {
  const n = COMPONENTS[acc.type];
  const size = n * COMPONENT_BYTES[acc.componentType];
  const view = acc.bufferView;
  if (view.def.byteStride && view.def.byteStride !== size) return null;
  const start = acc.byteOffset ?? 0;
  const bytes = new Uint8Array(view.data.subarray(start, start + acc.count * size)); // copy, so it's aligned
  if (acc.componentType === FLOAT) return new Float32Array(bytes.buffer);
  if (acc.componentType === UNSIGNED_INT) return new Uint32Array(bytes.buffer);
  if (acc.componentType === UNSIGNED_SHORT) return new Uint16Array(bytes.buffer);
  return null;
}

// --------------------------------------------------------------------------------------------
// VRM characters

// VRM 0.x MToon texture slots. Color slots may become JPEG; _BumpMap is a normal map. Every
// other slot (_OutlineWidthTexture, _ShadingGradeTexture, _ReceiveShadowTexture,
// _UvAnimMaskTexture, anything unknown) is treated as data and left byte for byte.
const MTOON_COLOR = new Set(['_MainTex', '_ShadeTexture', '_EmissionMap', '_SphereAdd', '_RimTexture']);
const MTOON_NORMAL = new Set(['_BumpMap']);

/** What each embedded image is used for, read from the glTF materials and the VRM extension. */
function imageRoles(json) {
  const roles = (json.images ?? []).map(() => ({ color: false, normal: false, data: false, thumbnail: false, alphaBase: false }));
  const imageOf = (t) => (typeof t === 'number' && t >= 0 ? json.textures?.[t]?.source : undefined);
  const set = (t, key) => {
    const i = imageOf(t);
    if (i !== undefined && roles[i]) roles[i][key] = true;
  };
  const vrm = json.extensions?.VRM;
  const props = vrm?.materialProperties ?? [];
  const materials = json.materials ?? [];
  // A material whose base color alpha can matter: glTF says MASK/BLEND, or MToon is cutout/transparent.
  const usesAlpha = (m, mp) =>
    (m?.alphaMode ?? 'OPAQUE') !== 'OPAQUE' ||
    (mp?.floatProperties?._BlendMode ?? 0) !== 0 ||
    Object.keys(mp?.keywordMap ?? {}).some((k) => /_ALPHA(TEST|BLEND|PREMULTIPLY)_ON/.test(k) && mp.keywordMap[k]);
  materials.forEach((m, i) => {
    const pbr = m.pbrMetallicRoughness ?? {};
    const mp = props.find((p) => p.name === m.name) ?? props[i];
    set(pbr.baseColorTexture?.index, 'color');
    if (usesAlpha(m, mp)) set(pbr.baseColorTexture?.index, 'alphaBase');
    set(m.emissiveTexture?.index, 'color');
    set(m.normalTexture?.index, 'normal');
    set(pbr.metallicRoughnessTexture?.index, 'data');
    set(m.occlusionTexture?.index, 'data');
  });
  props.forEach((mp, i) => {
    const m = materials.find((x) => x.name === mp.name) ?? materials[i];
    for (const [slot, t] of Object.entries(mp.textureProperties ?? {})) {
      if (MTOON_NORMAL.has(slot)) set(t, 'normal');
      else if (MTOON_COLOR.has(slot)) set(t, 'color');
      else set(t, 'data');
      if (slot === '_MainTex' && usesAlpha(m, mp)) set(t, 'alphaBase');
    }
  });
  if (typeof vrm?.meta?.texture === 'number') set(vrm.meta.texture, 'thumbnail');
  // Any texture reference outside the places above (another extension, VRM 1.0 MToon, a
  // texture with its own extensions) marks the image as data: left alone.
  const handled = /^\.materials\[\d+\]\.(pbrMetallicRoughness\.(baseColorTexture|metallicRoughnessTexture)|normalTexture|occlusionTexture|emissiveTexture)$/;
  const stack = [[json, '']];
  while (stack.length) {
    const [node, at] = stack.pop();
    if (Array.isArray(node)) node.forEach((v, i) => stack.push([v, `${at}[${i}]`]));
    else if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        const here = `${at}.${key}`;
        if (/texture/i.test(key) && value && typeof value === 'object' && typeof value.index === 'number' && !handled.test(here)) set(value.index, 'data');
        stack.push([value, here]);
      }
    }
  }
  (json.textures ?? []).forEach((t) => {
    if (t.extensions && roles[t.source]) roles[t.source].data = true;
  });
  return roles;
}

async function shrinkImage(json, i, role, name) {
  const img = json.images[i];
  if (role.data || img.bufferView === undefined || img.uri !== undefined) return null;
  if (!role.color && !role.normal && !role.thumbnail) return null; // not referenced by anything
  const original = img.bufferView.data;
  if (original.length < 4096) return null;
  let px;
  try {
    px = await decodeImage(original, img.mimeType, name);
  } catch (err) {
    console.warn(`[optimize]   ${name}: left as is (${err.message})`);
    return null;
  }
  const thumbnailOnly = role.thumbnail && !role.color && !role.normal;
  const maxSize = thumbnailOnly ? VRM_IMAGE.thumbnailSize : VRM_IMAGE.maxSize;
  const keepAlpha = role.alphaBase && hasTransparency(px);
  const from = `${px.w}x${px.h}`;
  let resized = false;
  while (Math.max(px.w, px.h) > maxSize && px.w % 2 === 0 && px.h % 2 === 0) {
    px = halve(px, !role.normal);
    resized = true;
  }
  const png = encodePng(px, keepAlpha);
  let best = { mimeType: 'image/png', data: png };
  if (!keepAlpha) {
    const quality = thumbnailOnly ? VRM_IMAGE.thumbnailQuality : role.normal ? VRM_IMAGE.normalQuality : VRM_IMAGE.colorQuality;
    const jpeg = await jpegFromPixels(px, quality, name);
    if (png.length > jpeg.length * PNG_PREFERENCE) best = { mimeType: 'image/jpeg', data: jpeg };
  }
  if (!resized && best.data.length >= original.length) return null;
  const kind = thumbnailOnly ? 'thumbnail' : role.normal ? 'normal' : keepAlpha ? 'color+alpha' : 'color';
  return { ...best, note: `${img.name ?? `image ${i}`} (${kind}) ${from} ${img.mimeType.slice(6)} ${kb(original.length)} -> ${px.w}x${px.h} ${best.mimeType.slice(6)} ${kb(best.data.length)}` };
}

/** Dense morph target deltas (mostly zeros in VRoid faces) become sparse accessors. Lossless. */
function sparsifyMorphTargets(json, views) {
  const seen = new Set();
  let before = 0;
  let after = 0;
  for (const mesh of json.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      for (const target of prim.targets ?? []) {
        for (const a of Object.values(target)) {
          if (seen.has(a)) continue;
          seen.add(a);
          const acc = json.accessors[a];
          if (acc.sparse || !acc.bufferView || acc.componentType !== FLOAT || acc.normalized) continue;
          const values = accessorArray(acc);
          if (!values) continue;
          const n = COMPONENTS[acc.type];
          const rows = [];
          for (let i = 0; i < acc.count; i++) {
            for (let c = 0; c < n; c++) {
              if (values[i * n + c] !== 0) {
                rows.push(i);
                break;
              }
            }
          }
          const wide = acc.count > 65535;
          const dense = acc.count * n * 4;
          const sparse = rows.length * ((wide ? 4 : 2) + n * 4);
          before += dense;
          if (sparse >= dense) {
            after += dense;
            continue;
          }
          after += sparse;
          delete acc.bufferView;
          delete acc.byteOffset;
          if (rows.length === 0) continue; // no bufferView and no sparse block: all zeros
          const indices = wide ? Uint32Array.from(rows) : Uint16Array.from(rows);
          const picked = new Float32Array(rows.length * n);
          rows.forEach((row, k) => {
            for (let c = 0; c < n; c++) picked[k * n + c] = values[row * n + c];
          });
          const indexView = { def: {}, data: Buffer.from(indices.buffer) };
          const valueView = { def: {}, data: Buffer.from(picked.buffer) };
          views.push(indexView, valueView);
          acc.sparse = {
            count: rows.length,
            indices: { bufferView: indexView, componentType: wide ? UNSIGNED_INT : UNSIGNED_SHORT },
            values: { bufferView: valueView },
          };
        }
      }
    }
  }
  return { before, after };
}

/** 32-bit triangle indices that fit in 16 bits are stored as 16-bit. Lossless. */
function shrinkIndices(json, views) {
  const seen = new Set();
  let before = 0;
  let after = 0;
  for (const mesh of json.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      const a = prim.indices;
      if (a === undefined || seen.has(a)) continue;
      seen.add(a);
      const acc = json.accessors[a];
      if (acc.componentType !== UNSIGNED_INT || acc.sparse || !acc.bufferView) continue;
      const values = accessorArray(acc);
      if (!values) continue;
      let max = 0;
      for (const v of values) if (v > max) max = v;
      before += values.length * 4;
      if (max >= 0xffff) {
        after += values.length * 4; // 0xFFFF is WebGL 2's primitive restart index for 16-bit
        continue;
      }
      const view = { def: { target: ELEMENT_ARRAY_BUFFER }, data: Buffer.from(Uint16Array.from(values).buffer) };
      views.push(view);
      acc.bufferView = view;
      acc.componentType = UNSIGNED_SHORT;
      delete acc.byteOffset;
      after += values.length * 2;
    }
  }
  return { before, after };
}

async function optimizeVrm(file) {
  const original = fs.readFileSync(file);
  const { json, bin } = readGlb(original, file);
  if (glbIsMarked(json)) return { file, before: original.length, after: original.length, skipped: true };
  assertKnownBufferViewRefs(json, file);
  const counts = JSON.stringify(['nodes', 'meshes', 'materials', 'textures', 'images', 'accessors', 'skins'].map((k) => json[k]?.length ?? 0));
  const extensions = JSON.stringify(json.extensions);
  const views = unpackViews(json, bin);
  const roles = imageRoles(json);
  const notes = [];
  let imagesBefore = 0;
  let imagesAfter = 0;
  for (let i = 0; i < (json.images ?? []).length; i++) {
    const img = json.images[i];
    const size = img.bufferView?.data.length ?? 0;
    imagesBefore += size;
    const result = await shrinkImage(json, i, roles[i], `${path.basename(file, '.vrm')}-img${i}`);
    if (!result) {
      imagesAfter += size;
      continue;
    }
    const view = { def: {}, data: result.data };
    views.push(view);
    img.bufferView = view;
    img.mimeType = result.mimeType;
    imagesAfter += result.data.length;
    notes.push(result.note);
  }
  const morphs = sparsifyMorphTargets(json, views);
  const indices = shrinkIndices(json, views);
  markGlb(json, `images capped at ${VRM_IMAGE.maxSize} px (thumbnail ${VRM_IMAGE.thumbnailSize}), sparse morph targets, 16-bit indices`);
  const newBin = pack(json, views);
  validateGlb(json, newBin, file);
  // the VRM extension and every array count must come through untouched
  if (JSON.stringify(json.extensions) !== extensions) throw new Error(`[optimize] ${file}: VRM extension changed during rewrite`);
  const countsAfter = JSON.stringify(['nodes', 'meshes', 'materials', 'textures', 'images', 'accessors', 'skins'].map((k) => json[k]?.length ?? 0));
  if (countsAfter !== counts) throw new Error(`[optimize] ${file}: object counts changed ${counts} -> ${countsAfter}`);
  const out = writeGlb(json, newBin);
  readGlb(out, file); // parses back
  replaceFile(file, out);
  return {
    file,
    before: original.length,
    after: out.length,
    details: [
      `images ${mb(imagesBefore)} -> ${mb(imagesAfter)}`,
      ...notes.map((n) => `  ${n}`),
      `morph targets ${mb(morphs.before)} -> ${mb(morphs.after)} (sparse), triangle indices ${mb(indices.before)} -> ${mb(indices.after)} (16-bit)`,
    ],
  };
}

// --------------------------------------------------------------------------------------------
// Xbot.glb (animation clips)

async function optimizeAnimations(file) {
  const original = fs.readFileSync(file);
  const { json, bin } = readGlb(original, file);
  if (glbIsMarked(json)) return { file, before: original.length, after: original.length, skipped: true };
  assertKnownBufferViewRefs(json, file);
  const names = (json.animations ?? []).map((a) => a.name);
  const missing = ANIMATION_CLIPS.filter((c) => !names.includes(c));
  if (missing.length) throw new Error(`[optimize] ${file}: no clip named ${missing.join(', ')} (has ${names.join(', ')})`);
  const hips = (json.nodes ?? []).findIndex((n) => n.name === ANIMATION_ROOT_BONE);
  if (hips < 0) throw new Error(`[optimize] ${file}: no ${ANIMATION_ROOT_BONE} node`);
  const views = unpackViews(json, bin);

  // Meshes, skin and materials go; the nodes stay (now empty), so the bone hierarchy,
  // rest pose and every node index are unchanged.
  const nodeCount = json.nodes.length;
  for (const node of json.nodes) {
    delete node.mesh;
    delete node.skin;
  }
  for (const key of ['meshes', 'skins', 'materials', 'textures', 'images', 'samplers']) delete json[key];

  json.animations = json.animations.filter((a) => ANIMATION_CLIPS.includes(a.name));
  const kept = [];
  for (const anim of json.animations) {
    const channels = anim.channels.filter((ch) => ch.target.path === 'rotation' || (ch.target.path === 'translation' && ch.target.node === hips));
    if (!channels.some((ch) => ch.target.node === hips && ch.target.path === 'translation')) {
      throw new Error(`[optimize] ${file}: clip ${anim.name} has no hips translation track`);
    }
    const samplers = [];
    const remap = new Map();
    for (const ch of channels) {
      if (!remap.has(ch.sampler)) {
        remap.set(ch.sampler, samplers.length);
        samplers.push(anim.samplers[ch.sampler]);
      }
      ch.sampler = remap.get(ch.sampler);
    }
    kept.push(`${anim.name} ${anim.channels.length}->${channels.length} tracks`);
    anim.channels = channels;
    anim.samplers = samplers;
  }

  // Accessors are rebuilt from what the clips reference. Identical keyframe-time arrays
  // (every bone in a clip shares one) are stored once.
  const accessors = [];
  const byContent = new Map();
  const newViews = [];
  const take = (a, share) => {
    const acc = json.accessors[a];
    const values = accessorArray(acc);
    if (!values) throw new Error(`[optimize] ${file}: accessor ${a} is interleaved or not float`);
    const data = Buffer.from(values.buffer);
    const key = share ? `${acc.componentType}:${acc.type}:${crypto.createHash('sha1').update(data).digest('hex')}` : null;
    if (key && byContent.has(key)) return byContent.get(key);
    const view = { def: {}, data };
    newViews.push(view);
    const out = { ...acc, bufferView: view };
    delete out.byteOffset;
    accessors.push(out);
    if (key) byContent.set(key, accessors.length - 1);
    return accessors.length - 1;
  };
  for (const anim of json.animations) {
    for (const s of anim.samplers) {
      s.input = take(s.input, true);
      s.output = take(s.output, false);
    }
  }
  json.accessors = accessors;
  markGlb(json, `kept clips ${ANIMATION_CLIPS.join(', ')} (rotation tracks + hips translation); meshes and skin removed`);
  const newBin = pack(json, newViews);
  validateGlb(json, newBin, file);
  if (json.nodes.length !== nodeCount) throw new Error(`[optimize] ${file}: node count changed`);
  const out = writeGlb(json, newBin);
  readGlb(out, file);
  replaceFile(file, out);
  const dropped = names.filter((n) => !ANIMATION_CLIPS.includes(n));
  return { file, before: original.length, after: out.length, details: [`kept ${kept.join(', ')}; dropped meshes, skin and clips ${dropped.join(', ')}`] };
}

// --------------------------------------------------------------------------------------------
// textures (Poly Haven jpg sets)

async function optimizeTexture(file, recipe) {
  const original = fs.readFileSync(file);
  if (jpegHasMark(original)) return { file, before: original.length, after: original.length, skipped: true };
  const base = path.join(TMP, path.basename(file, '.jpg'));
  // Through PNG on purpose: from a JPEG source sips keeps that file's chroma layout (several
  // Poly Haven diffuse maps are 4:4:4); from a PNG it writes standard 4:2:0. Resizing is our
  // box filter, not sips -z: on 4:2:0 sources sips scales in the DCT domain, a different and
  // sharper filter than the mip levels the GPU builds.
  await sips(['-s', 'format', 'png', file, '--out', `${base}.png`]);
  let source = `${base}.png`;
  let img = decodePng(fs.readFileSync(source));
  const resized = img.w > recipe.size;
  if (resized) {
    while (img.w > recipe.size && img.w % 2 === 0 && img.h % 2 === 0) img = halve(img, false);
    source = `${base}-small.png`;
    fs.writeFileSync(source, encodePng(img, false, 1));
  }
  if (recipe.chroma === '444') {
    // sips only writes 4:4:4 at quality 100, and keeps a JPEG source's layout when it
    // re-encodes one, so a near-lossless 4:4:4 file goes in between.
    await sips(['-s', 'format', 'jpeg', '-s', 'formatOptions', '100', source, '--out', `${base}-444.jpg`]);
    source = `${base}-444.jpg`;
  }
  await sips(['-s', 'format', 'jpeg', '-s', 'formatOptions', String(recipe.quality), source, '--out', `${base}.jpg`]);
  const encoded = fs.readFileSync(`${base}.jpg`);
  if (jpegChroma(encoded) !== recipe.chroma) {
    throw new Error(`[optimize] ${path.basename(file)}: sips wrote chroma ${jpegChroma(encoded)}, expected ${recipe.chroma}`);
  }
  const icc = jpegIccSegments(original);
  let out = jpegFinish(encoded, `${MARK}: ${recipe.label}`, icc);
  if (!resized && out.length >= original.length) out = jpegFinish(original, `${MARK}: kept original (re-encode was not smaller)`, icc);
  replaceFile(file, out);
  return { file, before: original.length, after: out.length, details: [recipe.label] };
}

// --------------------------------------------------------------------------------------------

function plan(root) {
  const jobs = [];
  for (const file of walk(path.join(root, 'textures'))) {
    const recipe = TEXTURE_RECIPES.find((r) => r.match.test(path.basename(file)));
    if (recipe) jobs.push({ kind: 'texture', file, recipe });
  }
  for (const file of walk(path.join(root, 'characters'))) if (file.endsWith('.vrm')) jobs.push({ kind: 'vrm', file });
  for (const file of walk(path.join(root, 'anims'))) if (file.endsWith('.glb')) jobs.push({ kind: 'anim', file });
  return jobs;
}

function isDone(job) {
  const buf = fs.readFileSync(job.file);
  if (job.kind === 'texture') return jpegHasMark(buf);
  // the JSON chunk is enough
  const len = buf.readUInt32LE(12);
  return glbIsMarked(JSON.parse(buf.subarray(20, 20 + len).toString('utf8')));
}

function folderSize(dir) {
  let total = 0;
  for (const file of walk(dir)) total += fs.statSync(file).size;
  return total;
}

async function main() {
  const args = process.argv.slice(2);
  const rootFlag = args.indexOf('--root');
  const root = rootFlag >= 0 ? path.resolve(args[rootFlag + 1]) : fileURLToPath(new URL('../public/assets/', import.meta.url));
  const jobs = plan(root);
  if (jobs.length === 0) {
    console.error(`[optimize] nothing under ${root}. Run node scripts/fetch-assets.mjs first.`);
    process.exit(1);
  }

  if (args.includes('--check')) {
    const todo = jobs.filter((j) => !isDone(j));
    for (const j of todo) console.log(`[optimize] not optimized: ${path.relative(root, j.file)}`);
    console.log(`[optimize] --check: ${todo.length} of ${jobs.length} files still need node scripts/optimize-assets.mjs`);
    process.exit(todo.length ? 1 : 0);
  }

  if (process.platform !== 'darwin' || !fs.existsSync(SIPS)) {
    console.error('[optimize] needs macOS `sips` (/usr/bin/sips) for JPEG encoding and resizing. Run it on a Mac.');
    process.exit(1);
  }
  TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'wildcard-isle-optimize-'));
  const sizeBefore = folderSize(root);
  const t0 = Date.now();
  const results = [];
  try {
    const textures = jobs.filter((j) => j.kind === 'texture');
    results.push(...(await pool(textures, 6, (j) => optimizeTexture(j.file, j.recipe))));
    for (const j of jobs.filter((x) => x.kind === 'vrm')) results.push(await optimizeVrm(j.file));
    for (const j of jobs.filter((x) => x.kind === 'anim')) results.push(await optimizeAnimations(j.file));
  } finally {
    fs.rmSync(TMP, { recursive: true, force: true }); // only this run's own scratch folder
  }

  let skipped = 0;
  for (const r of results) {
    if (r.skipped) {
      skipped++;
      continue;
    }
    const big = r.before > 1e6 ? mb : kb;
    console.log(`[optimize] ${path.relative(root, r.file)}: ${big(r.before)} -> ${big(r.after)}`);
    if (!r.file.endsWith('.jpg')) for (const d of r.details ?? []) console.log(`[optimize]   ${d}`);
  }
  const sizeAfter = folderSize(root);
  console.log(
    `[optimize] ${results.length - skipped} files rewritten, ${skipped} already done; ` +
      `public/assets ${mb(sizeBefore)} -> ${mb(sizeAfter)} in ${((Date.now() - t0) / 1000).toFixed(0)} s`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
