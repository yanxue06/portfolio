// Frame rate per graphics preset, at full resolution (the governor is paused).
// Usage: node scripts/perf.mjs                      real GPU
//        GPU=swiftshader node scripts/perf.mjs      software rendering: a stand-in for a weak computer
// Env: URL (default http://localhost:5174/), LEVELS (default "high,medium,low"), W, H
import { chromium } from 'playwright-core';

const soft = process.env.GPU === 'swiftshader';
// Uncapped: no vsync, no 60 fps limit, so the fps difference between presets shows on a fast GPU too.
const uncap = ['--disable-gpu-vsync', '--disable-frame-rate-limit'];
const args = soft ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', ...uncap] : ['--ignore-gpu-blocklist', '--use-angle=metal', ...uncap];
const levels = (process.env.LEVELS ?? 'high,medium,low').split(',');
const W = Number(process.env.W ?? 1280);
const H = Number(process.env.H ?? 720);
const base = process.env.URL ?? 'http://localhost:5174/';
const browser = await chromium.launch({ channel: 'chrome', headless: true, args });
const page = await browser.newPage({ viewport: { width: W, height: H } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`${base}?autoplay=1&quality=high`);
await page.waitForFunction(() => window.__isle?.ready === true, null, { timeout: 300000 });
await page.waitForTimeout(2500);
await page.waitForFunction(() => window.__isle?.ready === true, null, { timeout: 300000 });
const q = await page.evaluate(() => window.__isle.quality());
console.log(`gpu: ${q.gpu}  (auto would pick ${q.detected})  viewport ${W}x${H}`);
await page.evaluate(() => window.__isle.holdResolution(true));
const L = await page.evaluate(() => window.__isle.landmarks);
for (const level of levels) {
  await page.evaluate((l) => window.__isle.setQuality(l), level);
  await page.evaluate(() => window.__isle.holdResolution(true));
  // A busy view: look from the gate toward the summit across trees and grass.
  await page.evaluate(([x, z, sx, sz]) => { const s = window.__isle; s.teleport(x, z); s.lookAt(sx, sz); s.pitch(-0.15, 7); }, [L.gate.x, L.gate.z + 6, L.summit.x, L.summit.z]);
  await page.waitForTimeout(soft ? 9000 : 3000);
  const samples = [];
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(soft ? 2500 : 1000);
    samples.push(await page.evaluate(() => window.__isle.state()));
  }
  const s = samples[samples.length - 1];
  const fps = samples.reduce((a, b) => a + b.fps, 0) / samples.length;
  if (process.env.BREAKDOWN) console.log('   ', (await page.evaluate(() => window.__isle.breakdown())).join(' | '));
  console.log(`${level.padEnd(7)} ${fps.toFixed(1).padStart(5)} fps   ${(1000 / Math.max(fps, 0.01)).toFixed(0).padStart(5)} ms/frame   calls ${String(s.calls).padStart(4)}   triangles ${(s.triangles / 1e6).toFixed(2)}M`);
}
await browser.close();
console.log(errors.length ? `errors:\n - ${errors.slice(0, 5).join('\n - ')}` : 'no console errors');
