// Travels to every land and screenshots its gate, town and highest point.
// Usage: node scripts/lands.mjs [landId ...]   (dev server must be running)
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.env.OUT ?? path.resolve('shots');
fs.mkdirSync(OUT, { recursive: true });
const errors = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('console', (m) => {
  const t = m.text();
  if (m.type() === 'error') errors.push(t);
  if (m.type() === 'error' || /^\[(land|travel|world|deal|props|ambient)\]/.test(t)) console.log(`  [page:${m.type()}] ${t}`);
});
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(process.env.URL ?? 'http://localhost:5174/?autoplay=1');
await page.waitForFunction(() => window.__isle?.ready === true, null, { timeout: 90000 });
await page.waitForTimeout(2500);
await page.waitForFunction(() => window.__isle?.ready === true, null, { timeout: 90000 });

const isle = (fn, ...args) => page.evaluate(([f, a]) => window.__isle[f](...a), [fn, args]);
const wait = (ms) => page.waitForTimeout(ms);
const snap = async (name) => {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  const s = await isle('state');
  console.log(`saved ${name}.png  fps=${s.fps} calls=${s.calls} tris=${(s.triangles / 1e6).toFixed(2)}M region=${s.region}`);
};
const frame = async (x, z, lx, lz, pitch, dist) => {
  await isle('teleport', x, z);
  await isle('lookAt', lx, lz);
  await isle('pitch', pitch, dist);
};

const lands = process.argv.slice(2).length ? process.argv.slice(2) : ['isle', 'sunscar', 'frostveil', 'mistmoor'];
for (const id of lands) {
  const t0 = Date.now();
  await page.evaluate((id) => window.__isle.travel(id), id);
  await page.waitForFunction(() => !window.__isle.state().loading, null, { timeout: 90000 });
  console.log(`-- ${id} loaded in ${Date.now() - t0}ms`);
  await wait(1500);
  const L = await page.evaluate(() => window.__isle.landmarks);
  await isle('pitch', -0.12, 9); // the view a player gets on arrival
  await wait(1200);
  await snap(`${id}-gate`);
  const t = L.town;
  await frame(t.x - t.seaX * (t.r + 14), t.z - t.seaZ * (t.r + 14), t.x, t.z, -0.18, 11);
  await wait(1200);
  await snap(`${id}-town`);
  await frame(L.summit.x, L.summit.z, L.gate.x, L.gate.z, -0.3, 15);
  await wait(1500);
  await snap(`${id}-high`);
}
await browser.close();
if (errors.length) {
  console.log(`\n${errors.length} console error(s):\n - ${errors.slice(0, 10).join('\n - ')}`);
  process.exit(1);
}
console.log('\nno console errors');
