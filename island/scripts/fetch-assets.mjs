// Downloads the CC0 art the game uses into public/assets/ (skips files that already exist).
// Usage: node scripts/fetch-assets.mjs, then node scripts/optimize-assets.mjs
// Downloads are the full-size originals; optimize-assets.mjs shrinks them to what ships.
// Sources and licenses are listed in ASSETS.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Relative to this script, so running it from the repo root can't write into the site's public/.
const ROOT = fileURLToPath(new URL('../public/assets/', import.meta.url));
const UA = { 'User-Agent': 'wildcard-isle-asset-fetch/0.1' };

const HDRIS = [
  'kloofendal_48d_partly_cloudy_puresky',
  'syferfontein_18d_clear_puresky',
  'kloofendal_38d_partly_cloudy_puresky',
  'belfast_sunset_puresky',
];

const TEXTURES = [
  // meadow
  'aerial_grass_rock', 'forest_ground_04', 'aerial_rocks_02', 'coast_sand_01', 'cobblestone_floor_04',
  // desert
  'sand_01', 'sandstone_cracks', 'cracked_red_ground', 'sandy_gravel', 'red_sandstone_pavement',
  // snow
  'snow_02', 'dark_rock', 'winter_leaves', 'gravel_ground_01', 'cobblestone_floor_08',
  // marsh
  'brown_mud_02', 'brown_mud_leaves_01', 'rock_pitted_mossy', 'mud_forest', 'stone_wall_04',
  // buildings
  'plastered_wall_04', 'clay_roof_tiles', 'wood_planks', 'white_sandstone_bricks',
];
const MAPS = ['diff', 'nor_gl', 'arm'];

const CHARACTERS = [
  'HairSample_Male', 'Sakurada_Fumiriya', 'Vita', 'Sendagaya_Shino', 'Victoria_Rubin', 'Vivi',
];

const jobs = [];
for (const id of HDRIS) {
  jobs.push({ url: `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/${id}_2k.hdr`, out: `hdri/${id}_2k.hdr` });
}
for (const id of TEXTURES) {
  for (const map of MAPS) {
    jobs.push({ url: `https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/${id}/${id}_${map}_1k.jpg`, out: `textures/${id}_${map}_1k.jpg` });
  }
}
jobs.push({ url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg', out: 'textures/waternormals.jpg' });
for (const name of CHARACTERS) {
  jobs.push({ url: `https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/beta/${name}.vrm`, out: `characters/${name}.vrm` });
}
jobs.push({ url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Xbot.glb', out: 'anims/Xbot.glb' });

async function fetchOne(job) {
  const dest = path.join(ROOT, job.out);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return 'skip';
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(job.url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${job.url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return `${(buf.length / 1e6).toFixed(1)}MB`;
}

let done = 0;
let failed = 0;
let downloaded = 0;
const queue = [...jobs];
async function worker() {
  while (queue.length) {
    const job = queue.shift();
    try {
      const r = await fetchOne(job);
      done++;
      if (r !== 'skip') {
        downloaded++;
        console.log(`[assets] ${job.out} ${r}`);
      }
    } catch (err) {
      failed++;
      console.error(`[assets] FAILED ${job.out}: ${err.message}`);
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
console.log(`[assets] ${done} ok, ${failed} failed, ${jobs.length} total`);
if (downloaded) console.log(`[assets] ${downloaded} new file(s) are full size. Next: node scripts/optimize-assets.mjs`);
process.exit(failed ? 1 : 0);
