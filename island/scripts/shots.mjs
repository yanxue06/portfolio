// Headless screenshot runner. Drives the game through window.__isle and saves PNGs.
// Usage: node scripts/shots.mjs [shotName ...]   (dev server must be running)
// Env: URL (default http://localhost:5174/?autoplay=1), OUT (default ./shots), W, H
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const URL = process.env.URL ?? 'http://localhost:5174/?autoplay=1';
const OUT = process.env.OUT ?? path.resolve('shots');
const W = Number(process.env.W ?? 1600);
const H = Number(process.env.H ?? 900);
fs.mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('console', (m) => {
  const text = m.text();
  if (m.type() === 'error') errors.push(text);
  if (m.type() === 'error' || m.type() === 'warning' || text.startsWith('[')) console.log(`  [page:${m.type()}] ${text}`);
});
page.on('pageerror', (e) => {
  errors.push(String(e));
  console.log(`  [pageerror] ${e}`);
});

await page.goto(URL);
await page.waitForFunction(() => window.__isle?.ready === true, null, { timeout: 60000 });
await page.waitForTimeout(2500);
await page.waitForFunction(() => window.__isle?.ready === true, null, { timeout: 60000 });
await page.waitForTimeout(1500);

const isle = (fn, ...args) => page.evaluate(([f, a]) => window.__isle[f](...a), [fn, args]);
const wait = (ms) => page.waitForTimeout(ms);
const snap = async (name) => {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  const s = await isle('state');
  console.log(
    `saved ${file}  fps=${s.fps} calls=${s.calls} tris=${s.triangles} pos=${s.pos.map((v) => v.toFixed(1)).join(',')}`,
  );
};
const frame = async (x, z, lookX, lookZ, pitch, dist) => {
  await isle('teleport', x, z);
  await isle('lookAt', lookX, lookZ);
  await isle('pitch', pitch, dist);
};

const L = await page.evaluate(() => window.__isle.landmarks);

// Each shot positions the player/camera, waits for things to settle, then snaps.
const shots = {
  async spawn() {
    await frame(L.gate.x, L.gate.z + 6, L.summit.x, L.summit.z, -0.16, 9);
    await wait(900);
    await snap('spawn');
  },
  async overview() {
    await frame(L.summit.x, L.summit.z, L.town.x, L.town.z, -0.32, 16);
    await wait(1200);
    await snap('overview');
  },
  async town() {
    await frame(L.town.x, L.town.z - 30, L.town.x, L.town.z, -0.12, 10);
    await wait(1000);
    await snap('town');
  },
  async beach() {
    const x = L.town.x + L.town.seaZ * 70;
    const z = L.town.z - L.town.seaX * 70 + 20;
    await frame(x, z, x + L.town.seaX * 50, z + L.town.seaZ * 50, -0.1, 9);
    await wait(1000);
    await snap('beach');
  },
  async jump() {
    await frame(L.gate.x + 20, L.gate.z - 10, L.summit.x, L.summit.z, -0.2, 8);
    await wait(400);
    await page.keyboard.down('KeyW');
    await wait(500);
    await page.keyboard.down('Space');
    await wait(220);
    await snap('jump');
    await page.keyboard.up('Space');
    await page.keyboard.up('KeyW');
    await wait(600);
  },
  async lighthouse() {
    await frame(L.extra.lighthouse.x - 40, L.extra.lighthouse.z + 10, L.extra.lighthouse.x, L.extra.lighthouse.z, -0.1, 10);
    await wait(1000);
    await snap('lighthouse');
  },
  async ruins() {
    await frame(L.extra.ruins.x + 30, L.extra.ruins.z + 8, L.extra.ruins.x, L.extra.ruins.z, -0.12, 10);
    await wait(1000);
    await snap('ruins');
  },
  async intro() {
    await isle('setMode', 'intro');
    await wait(1500);
    await snap('intro');
    await isle('setMode', 'play');
  },
  async hud() {
    await frame(L.gate.x + 30, L.gate.z - 40, L.summit.x, L.summit.z, -0.14, 8);
    await wait(1200);
    await snap('hud');
  },
  async spark() {
    await frame(L.gate.x + 40, L.gate.z - 30, L.summit.x, L.summit.z, -0.12, 7);
    await isle('critterAhead', 11);
    await wait(500);
    await isle('cast', 'spark');
    await wait(90);
    await isle('cast', 'spark');
    await wait(110);
    await snap('spark');
    await wait(700);
  },
  async skip() {
    await frame(L.gate.x + 40, L.gate.z - 50, L.summit.x, L.summit.z, -0.05, 9);
    await wait(400);
    await isle('cast', 'skip');
    await wait(70);
    await snap('skip');
    await wait(600);
  },
  async ward() {
    await frame(L.gate.x + 50, L.gate.z - 20, L.summit.x, L.summit.z, -0.18, 6.5);
    await wait(300);
    await isle('cast', 'ward');
    await wait(450);
    await snap('ward');
    await wait(400);
  },
  async clap() {
    await frame(L.gate.x + 30, L.gate.z - 60, L.summit.x, L.summit.z, -0.32, 10);
    await isle('critterAhead', 4);
    await wait(400);
    await isle('cast', 'clap');
    await wait(140);
    await snap('clap');
    await wait(600);
  },
  async lodestar() {
    await frame(L.gate.x + 60, L.gate.z - 10, L.summit.x, L.summit.z, -0.38, 13);
    await isle('scatterCards', 9, 13);
    await wait(900);
    await snap('cards');
    await isle('cast', 'lodestar');
    await wait(380);
    await snap('lodestar');
    await wait(1200);
  },
  async map() {
    await isle('setMode', 'map');
    await wait(700);
    await snap('map');
    await isle('setMode', 'play');
  },
  async binder() {
    await isle('setMode', 'binder');
    await wait(700);
    await snap('binder');
    await isle('setMode', 'play');
  },
  async cotd() {
    let c = await page.evaluate(() => window.__isle.cotd());
    if (c.x === null) {
      await isle('travel', c.land); // the Card of the Day is in another land today
      await wait(1500);
      c = await page.evaluate(() => window.__isle.cotd());
    }
    await frame(c.x + 26, c.z + 26, c.x, c.z, -0.05, 8);
    await wait(1200);
    await snap('cotd');
  },
  async critter() {
    await frame(L.gate.x + 40, L.gate.z - 30, L.summit.x, L.summit.z, -0.12, 5.5);
    await isle('critterAhead', 4.5);
    const s = await isle('state');
    await page.evaluate(() => {
      const st = window.__isle.state();
      void st;
    });
    await isle('look', Math.atan2(-(L.summit.x - s.pos[0]), -(L.summit.z - s.pos[2])) + 0.55, -0.1, 5.5);
    await wait(900);
    await snap('critter');
  },
  async card() {
    await frame(L.gate.x + 44, L.gate.z - 34, L.summit.x, L.summit.z, -0.08, 4.2);
    await page.evaluate(() => {
      const s = window.__isle;
      s.scatterCards(1, 2.6);
    });
    await isle('lookAt', L.gate.x + 46.6, L.gate.z - 34);
    await isle('pitch', -0.05, 4.2);
    await wait(900);
    await snap('card');
  },
  async shore() {
    const x = L.town.x + L.town.seaZ * 40 + L.town.seaX * 52;
    const z = L.town.z - L.town.seaX * 40 + L.town.seaZ * 52;
    await frame(x, z, x + L.town.seaZ * 60, z - L.town.seaX * 60, -0.08, 7);
    await wait(1000);
    await snap('shore');
  },
  async islets() {
    const it = await page.evaluate(() => window.__isle.islets);
    const a = it[2];
    await frame(a.x, a.z, L.gate.x, L.gate.z, -0.25, 12);
    await wait(1200);
    await snap('islets');
  },
};

const wanted = process.argv.slice(2);
const names = wanted.length ? wanted : Object.keys(shots);
for (const name of names) {
  const fn = shots[name];
  if (!fn) {
    console.log(`unknown shot "${name}" (known: ${Object.keys(shots).join(', ')})`);
    continue;
  }
  await fn();
}

await browser.close();
if (errors.length) {
  console.log(`\n${errors.length} console error(s):`);
  for (const e of errors.slice(0, 20)) console.log(' -', e);
  process.exit(1);
}
console.log('\nno console errors');
