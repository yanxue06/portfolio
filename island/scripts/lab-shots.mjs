// Headless screenshots of the character lab (tools/character-lab.html) via window.__lab.
// Usage: node scripts/lab-shots.mjs [shotName ...]   (dev server must be running)
// Env: URL (default http://localhost:5174/tools/character-lab.html), OUT (default ./shots/lab), W, H
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const URL = process.env.URL ?? 'http://localhost:5174/tools/character-lab.html';
const OUT = process.env.OUT ?? path.resolve('shots/lab');
const W = Number(process.env.W ?? 1600);
const H = Number(process.env.H ?? 900);
fs.mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'],
});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('console', (m) => {
  const text = m.text();
  if (m.type() === 'error') errors.push(text);
  if (m.type() === 'error' || m.type() === 'warning' || text.startsWith('[')) console.log(`  [page:${m.type()}] ${text}`);
});
page.on('response', (r) => {
  if (r.status() >= 400) console.log(`  [http ${r.status()}] ${r.url()}`);
});
page.on('pageerror', (e) => {
  errors.push(String(e));
  console.log(`  [pageerror] ${e}`);
});

// The lead edits shared modules while this runs; Vite would hot-reload the lab mid-shot.
// Answer the HMR websocket ourselves (connected, silent) so the page never reloads.
await page.routeWebSocket(/.*/, () => {});
let navigations = 0;
page.on('framenavigated', (frame) => {
  if (frame === page.mainFrame()) navigations++;
});

await page.goto(URL);
await page.waitForFunction(() => window.__lab?.ready === true || window.__lab?.error, null, { timeout: 180000 });
const failure = await page.evaluate(() => window.__lab.error);
if (failure) {
  console.log(`lab failed to start:\n${failure}`);
  await browser.close();
  process.exit(1);
}

const lab = (fn, ...args) => page.evaluate(([f, a]) => window.__lab[f](...a), [fn, args]);
const wait = (ms) => page.waitForTimeout(ms);
const snap = async (name) => {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  const f = await lab('frameInfo');
  console.log(`saved ${file}  calls=${f.calls} tris=${f.triangles}`);
};
/** Tiles PNG frames into one sheet with ffmpeg if it is installed; keeps the frames either way. */
const tile = (frames, out, columns) => {
  try {
    const rows = Math.ceil(frames.length / columns);
    const inputs = frames.flatMap((f) => ['-i', f]);
    const filter = `${frames.map((_, i) => `[${i}:v]`).join('')}xstack=inputs=${frames.length}:layout=${frames
      .map((_, i) => `${(i % columns) === 0 ? '0' : Array.from({ length: i % columns }, () => 'w0').join('+')}_${Math.floor(i / columns) === 0 ? '0' : Array.from({ length: Math.floor(i / columns) }, () => 'h0').join('+')}`)
      .join('|')}`;
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filter, out]);
    console.log(`saved ${out} (${frames.length} frames, ${columns}x${rows})`);
  } catch (err) {
    console.log(`(no contact sheet for ${out}: ${String(err).split('\n')[0]}; frames kept)`);
  }
};
/**
 * Captures `frames` evenly spaced poses across one gait cycle at `speed`, cropped to the
 * character, and tiles them. Uses fixed steps, so the phases are exact.
 */
const strip = async (name, id, speed, clipName, camera, crop) => {
  await reset();
  await lab('only', [id]);
  await lab('place', id, 0, 0, 0);
  await lab('camera', ...camera);
  await lab('fixedStep', 1 / 60);
  await lab('pose', id, { speed });
  await wait(1500);
  await lab('pause', true);
  const gait = await lab('gait', id);
  const clip = gait[clipName];
  const stats = (await lab('stats')).find((s) => s.id === id);
  // Mirrors VrmAvatar.updateLocomotion: cadence up to 2x, then the measured stride gain, then cadence again.
  let rate = speed / clip.groundSpeed;
  if (clipName === 'run' && rate > 2.0 && gait.strideGain > 1.02) {
    const needed = speed / (clip.groundSpeed * 2.0);
    const stride = Math.min(1.3, Math.max(1, 1 + ((needed - 1) / (gait.strideGain - 1)) * 0.3));
    rate = speed / (clip.groundSpeed * (1 + ((gait.strideGain - 1) * (stride - 1)) / 0.3));
  }
  const cycle = clip.duration / rate;
  const frames = [];
  const count = 6;
  for (let i = 0; i < count; i++) {
    if (i > 0) await lab('step', 10, cycle / count / 10);
    await wait(80);
    const file = path.join(OUT, `${name}-${i}.png`);
    await page.screenshot({ path: file, clip: crop });
    frames.push(file);
  }
  console.log(`${name}: ${id} at ${speed} m/s, ${clipName} rate ${rate.toFixed(2)}x, cycle ${cycle.toFixed(3)} s (${stats.height} m tall)`);
  tile(frames, path.join(OUT, `${name}.png`), 3);
  await lab('pause', false);
  await lab('fixedStep', null);
};

/** Resets every character to idle at its home spot, all visible, live time. */
const reset = async () => {
  await lab('pause', false);
  await lab('fixedStep', null);
  await lab('resetPoses');
  await lab('home');
  await lab('only', null);
  await lab('outlines', true);
};

await lab('hud', false);
await wait(1500); // spring bones settle, blink timers spread out

const stats = await lab('stats');
console.log('\nper-character stats:');
console.table(stats.map((s) => ({ id: s.id, loadMs: s.loadMs, parseMs: s.parseMs, animMs: s.animMs, tris: s.triangles, calls: s.drawCalls, shipped: s.drawCallsAsShipped, texMB: s.textureMB, height: s.height, walk: s.walkSpeed, run: s.runSpeed })));

const shots = {
  async lineup() {
    await reset();
    await lab('camera', 3.6, 1.6, 7.4, 0.35, 0.9, 0, 34);
    await wait(1200);
    await snap('lineup');
  },
  async portraits() {
    await reset();
    await lab('only', ['ren']);
    await lab('place', 'ren', 0, 0, 0);
    await lab('camera', 0.35, 1.52, 1.25, 0, 1.45, 0, 30);
    await wait(900);
    await snap('portrait-ren');
    await lab('home');
    await lab('only', ['lumi']);
    await lab('place', 'lumi', 0, 0, 0);
    await lab('expression', 'lumi', 'happy', 3);
    await lab('camera', -0.3, 1.46, 1.2, 0, 1.4, 0, 30);
    await wait(900);
    await snap('portrait-lumi-happy');
  },
  async walk() {
    await reset();
    await lab('only', ['shion']);
    await lab('place', 'shion', 0, 0, 0);
    const gait = await lab('gait', 'shion');
    await lab('pose', 'shion', { speed: gait.walk.groundSpeed });
    await lab('camera', 4.2, 1.0, 0, 0, 0.85, 0, 30);
    await wait(1500);
    await lab('pause', true);
    await snap('walk-profile');
    await lab('pause', false);
  },
  async run() {
    await reset();
    await lab('only', ['ren']);
    await lab('place', 'ren', 0, 0, 0);
    await lab('pose', 'ren', { speed: 6.5 });
    await lab('camera', 4.4, 1.0, 0, 0, 0.9, 0, 30);
    await wait(1500);
    await lab('pause', true);
    await snap('run-profile');
    await lab('pause', false);
    await lab('pose', 'ren', { speed: 11 });
    await wait(1200);
    await lab('pause', true);
    await snap('sprint-profile');
    await lab('pause', false);
  },
  async jump() {
    await reset();
    await lab('only', ['nova']);
    await lab('place', 'nova', 0, 0, 0.3);
    await lab('pose', 'nova', { speed: 6.5, grounded: false, vy: 5 });
    await lab('camera', 3.2, 1.4, 2.6, 0, 0.9, 0, 35);
    await wait(600);
    await snap('jump');
    await lab('pose', 'nova', { vy: -7 });
    await wait(500);
    await snap('fall');
  },
  async cast() {
    await reset();
    await lab('only', ['lumi']);
    await lab('place', 'lumi', 0, 0, 0);
    await lab('pose', 'lumi', { cast: 1 });
    await lab('camera', 2.6, 1.5, 2.4, 0, 1.05, 0.2, 35);
    await wait(700);
    await snap('cast');
  },
  async swim() {
    await reset();
    await lab('only', ['momo']);
    await lab('place', 'momo', 0, 0, 0);
    await lab('pose', 'momo', { swimming: true, grounded: false, speed: 4.2 });
    await lab('camera', 2.8, 1.6, 1.6, 0, 0.8, 0, 35);
    await wait(1600);
    await snap('swim');
    // Same pose with the sea drawn at the height the Player floats a swimmer at.
    await lab('water', true);
    await lab('camera', 3.0, 1.9, 2.2, 0, 0.95, 0, 35);
    await snap('swim-waterline');
    await lab('pose', 'momo', { speed: 0 });
    await wait(1500);
    await snap('swim-treading');
    await lab('water', false);
  },
  async land() {
    await reset();
    await lab('only', ['haru']);
    await lab('place', 'haru', 0, 0, 0);
    await lab('pose', 'haru', { land: 1 });
    await lab('camera', 3.0, 1.3, 2.4, 0, 0.9, 0, 35);
    await wait(300);
    await snap('land');
  },
  async dive() {
    await reset();
    await lab('only', ['nova']);
    await lab('place', 'nova', 0, 0, 0);
    await lab('pose', 'nova', { grounded: false, vy: -20, dive: true });
    await lab('camera', 3.0, 1.4, 2.4, 0, 1.0, 0, 35);
    await wait(500);
    await snap('dive');
  },
  async walkcycle() {
    await strip('walkcycle', 'shion', 1.45, 'walk', [4.2, 1.0, 0, 0, 0.85, 0, 30], { x: 560, y: 60, width: 480, height: 820 });
  },
  async runcycle() {
    await strip('runcycle', 'ren', 6.5, 'run', [4.6, 1.0, 0, 0, 0.9, 0, 30], { x: 500, y: 60, width: 600, height: 820 });
  },
  async sprintcycle() {
    await strip('sprintcycle', 'ren', 11, 'run', [4.6, 1.0, 0, 0, 0.9, 0, 30], { x: 500, y: 60, width: 600, height: 820 });
  },
  async gameview() {
    await reset();
    await lab('only', ['ren']);
    await lab('place', 'ren', 0, 0, 0.6);
    await lab('pose', 'ren', { speed: 6.5 });
    await lab('gameCamera', 'ren', 0.6 + Math.PI - 0.9);
    await wait(1200);
    await snap('gameview-run');
    // 1:1 crop around the character: what the outline and shading look like at 8.5 m.
    await lab('pause', true);
    await wait(100);
    await page.screenshot({ path: path.join(OUT, 'gameview-run-crop.png'), clip: { x: 560, y: 330, width: 380, height: 330 } });
    await lab('outlines', false);
    await wait(100);
    await page.screenshot({ path: path.join(OUT, 'gameview-run-crop-no-outline.png'), clip: { x: 560, y: 330, width: 380, height: 330 } });
    await lab('outlines', true);
    await lab('pause', false);
    console.log('saved gameview-run-crop.png and gameview-run-crop-no-outline.png');
  },
  /** The lineup under the lighting main.ts uses now (hemisphere 0.6, sun 3.0) instead of the brief's 1.3 / 2.9. */
  async lighting() {
    await reset();
    await lab('lights', 0.6, 3.0);
    await lab('camera', 3.6, 1.6, 7.4, 0.35, 0.9, 0, 34);
    await wait(900);
    await snap('lineup-hemi0.6-sun3');
    await lab('lights', 1.3, 2.9);
  },
  async expressions() {
    await reset();
    await lab('only', ['nova']);
    await lab('place', 'nova', 0, 0, 0);
    await lab('camera', 0.0, 1.45, 0.95, 0, 1.43, 0, 26);
    const frames = [];
    for (const name of ['neutral', 'happy', 'surprised', 'angry']) {
      await lab('expression', 'nova', name, 5);
      await wait(700);
      const file = path.join(OUT, `expression-${name}.png`);
      await page.screenshot({ path: file, clip: { x: 560, y: 120, width: 480, height: 560 } });
      frames.push(file);
    }
    await lab('expression', 'nova', 'neutral', 0);
    tile(frames, path.join(OUT, 'expressions.png'), 4);
  },
  /** handR must sit on the RIGHT palm: facing +Z the character's right is -X. */
  async handr() {
    await reset();
    await lab('pose', 'lumi', { cast: 1 });
    await wait(700);
    const home = (await lab('stats')).findIndex((s) => s.id === 'lumi');
    const hand = await lab('handR', 'lumi');
    const feet = await lab('feet', 'lumi');
    console.log(`handR while casting (lumi at x=${((home - 2.5) * 1.2).toFixed(2)}): ${hand.map((v) => v.toFixed(3)).join(', ')}`);
    console.log(`  (root space feet for scale: L toe ${feet[0].map((v) => v.toFixed(2))}, R toe ${feet[2].map((v) => v.toFixed(2))})`);
    await lab('pose', 'lumi', { cast: 0 });
    await wait(700);
    const rest = await lab('handR', 'lumi');
    console.log(`handR at idle: ${rest.map((v) => v.toFixed(3)).join(', ')}`);
  },
  async castrun() {
    await reset();
    await lab('only', ['lumi']);
    await lab('place', 'lumi', 0, 0, 0);
    await lab('pose', 'lumi', { speed: 6.5, cast: 1 });
    await lab('camera', 3.2, 1.3, 3.0, 0, 0.95, 0.3, 32);
    await wait(1300);
    await lab('pause', true);
    await snap('cast-running');
    await lab('pause', false);
    await lab('pose', 'lumi', { speed: 6.5, cast: 1, grounded: false, vy: 3 });
    await wait(700);
    await lab('pause', true);
    await snap('cast-airborne');
    await lab('pause', false);
  },
  async teleport() {
    await reset();
    await lab('only', ['shion']);
    await lab('place', 'shion', 0, 0, 0);
    await wait(500);
    await lab('place', 'shion', 0, -13, 0); // a Skip-sized jump in one frame
    await wait(400);
    await lab('place', 'shion', 0, 0, 0);
    await lab('camera', 2.6, 1.4, 2.6, 0, 1.0, 0, 35);
    await wait(250);
    await snap('teleport-after');
  },
  async slip() {
    await reset();
    await lab('fixedStep', 1 / 60);
    const cases = [['ren', 1.54], ['ren', 3.5], ['ren', 6.5], ['ren', 11], ['momo', 6.5], ['momo', 11], ['haru', 6.5], ['haru', 11]];
    for (const [id, speed] of cases) {
      const r = await lab('measureSlip', id, speed, 2);
      console.log(`slip ${id} @ ${speed} m/s: ${r.meanSlip} m/s (${(r.slipRatio * 100).toFixed(1)}%), ${r.plantedSamples} planted samples`);
      await lab('pose', id, { speed: 0 });
    }
    await lab('fixedStep', null);
  },
  async benchmark() {
    await reset();
    for (const id of ['ren', 'haru', 'nova', 'shion', 'lumi', 'momo']) {
      const ms = await lab('benchmark', id, 600);
      console.log(`animate() ${id}: ${ms} ms/frame`);
    }
  },
  async dispose() {
    await reset();
    const r = await lab('reload', 'momo');
    console.log(`dispose/reload momo: before ${JSON.stringify(r.before)} afterDispose ${JSON.stringify(r.afterDispose)} afterReload ${JSON.stringify(r.afterReload)} (reload ${r.loadMs} ms, anim ${r.animMs} ms)`);
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
  const before = navigations;
  await fn();
  if (navigations !== before) throw new Error(`the lab page reloaded during shot "${name}"; its screenshots are not trustworthy, rerun it`);
}

await browser.close();
if (errors.length) {
  console.log(`\n${errors.length} console error(s):`);
  for (const e of errors.slice(0, 20)) console.log(' -', e);
  process.exit(1);
}
console.log('\nno console errors');
