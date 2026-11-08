// Movement checks: drives the player with real key events and reads back positions.
// Usage: node scripts/physics.mjs   (dev server must be running)
// Runs with ?char=none so every perk is 1; the last check wears a character and measures its perk.
import { chromium } from 'playwright-core';

const URL = process.env.URL ?? 'http://localhost:5174/?autoplay=1&char=none&monsters=off'; // baselines: nothing shoots the player mid-measurement
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(URL);
await page.waitForFunction(() => window.__isle?.ready === true, null, { timeout: 60000 });
await page.waitForTimeout(2500);
await page.waitForFunction(() => window.__isle?.ready === true, null, { timeout: 60000 });
await page.waitForTimeout(1000);

const isle = (fn, ...args) => page.evaluate(([f, a]) => window.__isle[f](...a), [fn, args]);
const state = () => isle('state');
const wait = (ms) => page.waitForTimeout(ms);
const L = await page.evaluate(() => window.__isle.landmarks);
const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${detail}`);
};
async function sampleMaxY(ms) {
  let maxY = -Infinity;
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const s = await state();
    maxY = Math.max(maxY, s.pos[1]);
    await wait(16);
  }
  return maxY;
}
async function settle() {
  await wait(700);
  return state();
}
const flat = { x: L.gate.x + 40, z: L.gate.z - 25 };

// 1. Walk
await isle('teleport', flat.x, flat.z);
await isle('look', 0, -0.2, 8);
let s0 = await settle();
await page.keyboard.down('KeyW');
await wait(2000);
await page.keyboard.up('KeyW');
let s1 = await settle();
let d = Math.hypot(s1.pos[0] - s0.pos[0], s1.pos[2] - s0.pos[2]);
check('walk 2s', d > 10 && d < 16, `moved ${d.toFixed(1)}m (walk speed 6.5 m/s)`);
const walkBase = d;

// 2. Sprint
s0 = s1;
await page.keyboard.down('ShiftLeft');
await page.keyboard.down('KeyW');
await wait(2000);
await page.keyboard.up('KeyW');
await page.keyboard.up('ShiftLeft');
s1 = await settle();
d = Math.hypot(s1.pos[0] - s0.pos[0], s1.pos[2] - s0.pos[2]);
check('sprint 2s', d > 17 && d < 26, `moved ${d.toFixed(1)}m (sprint 11 m/s)`);

// 3. Jump
await isle('teleport', flat.x, flat.z);
s0 = await settle();
await page.keyboard.down('Space');
let maxY = await sampleMaxY(700);
await page.keyboard.up('Space');
let rise = maxY - s0.pos[1];
check('jump height', rise > 1.8 && rise < 2.8, `apex ${rise.toFixed(2)}m`);
s1 = await settle();
check('lands again', s1.grounded && Math.abs(s1.pos[1] - s0.pos[1]) < 0.3, `grounded=${s1.grounded} y=${s1.pos[1].toFixed(2)}`);

// 4. Double jump
s0 = await settle();
await page.keyboard.down('Space');
await wait(320);
await page.keyboard.up('Space');
await wait(40);
await page.keyboard.down('Space');
maxY = await sampleMaxY(800);
await page.keyboard.up('Space');
rise = maxY - s0.pos[1];
check('double jump height', rise > 3.2 && rise < 5.2, `apex ${rise.toFixed(2)}m`);
await settle();

// 5. Wall: walk into a house and stop at its wall.
const house = await isle('house');
// Start 6m out along the house's local +z (its front), walking back toward it.
const fx = house.sin, fz = house.cos;
const startX = house.x + fx * (house.hd + 6), startZ = house.z + fz * (house.hd + 6);
await isle('teleport', startX, startZ);
await isle('look', Math.atan2(fx, fz), -0.2, 8);
await settle();
await page.keyboard.down('KeyW');
await wait(2500);
await page.keyboard.up('KeyW');
s1 = await settle();
const lx = house.cos * (s1.pos[0] - house.x) - house.sin * (s1.pos[2] - house.z);
const lz = house.sin * (s1.pos[0] - house.x) + house.cos * (s1.pos[2] - house.z);
const inside = Math.abs(lx) < house.hw - 0.05 && Math.abs(lz) < house.hd - 0.05;
check('house wall blocks', !inside, `local (${lx.toFixed(2)}, ${lz.toFixed(2)}) vs half size (${house.hw.toFixed(2)}, ${house.hd.toFixed(2)})`);

// 6. Stairs up to a roof
const st = await isle('stairs');
await isle('teleport', st.x, st.z);
await isle('look', Math.atan2(-st.dirX, -st.dirZ), -0.25, 8);
await settle();
await page.keyboard.down('KeyW');
let best = -Infinity;
for (let i = 0; i < 20; i++) {
  await wait(100);
  best = Math.max(best, (await state()).pos[1]);
}
await page.keyboard.up('KeyW');
check('climb outside stairs', best > st.topY - 0.6, `reached y=${best.toFixed(2)}, roof at ${st.topY.toFixed(2)} (${st.steps} steps)`);

// 7. Swim offshore
await isle('teleport', L.town.x + L.town.seaX * 95 + L.town.seaZ * 25, L.town.z + L.town.seaZ * 95 - L.town.seaX * 25);
s1 = await settle();
await wait(800);
s1 = await state();
check('swims in deep water', s1.swimming && s1.pos[1] > -1.6 && s1.pos[1] < -0.5, `swimming=${s1.swimming} y=${s1.pos[1].toFixed(2)}`);

// 8. Stand on an islet
const islets = await page.evaluate(() => window.__isle.islets);
const it = islets[0];
await isle('teleport', it.x, it.z);
s1 = await settle();
check('stands on islet', s1.grounded && Math.abs(s1.pos[1] - (it.y + 0.55)) < 0.3, `y=${s1.pos[1].toFixed(2)} islet top ${(it.y + 0.55).toFixed(2)}`);

// 9. Spells don't throw and spend aura
for (const id of ['spark', 'skip', 'ward', 'lodestar', 'clap']) {
  const ok = await isle('cast', id);
  await wait(250);
  check(`cast ${id}`, ok === true, `returned ${ok}`);
}

// 10. A character perk changes movement: Ren walks 10% faster
const wearing = await isle('pick', 'ren');
const perks = (await isle('character')).perks;
await isle('teleport', flat.x, flat.z);
await isle('look', 0, -0.2, 8);
s0 = await settle();
await page.keyboard.down('KeyW');
await wait(2000);
await page.keyboard.up('KeyW');
s1 = await settle();
d = Math.hypot(s1.pos[0] - s0.pos[0], s1.pos[2] - s0.pos[2]);
const ratio = d / walkBase;
check('character perk: speed', wearing === 'ren' && perks.speed === 1.1 && ratio > 1.05 && ratio < 1.15, `wearing ${wearing}, walked ${d.toFixed(1)}m vs ${walkBase.toFixed(1)}m baseline (x${ratio.toFixed(3)})`);

await browser.close();
const failed = results.filter((r) => !r.ok);
if (errors.length) console.log(`\nconsole errors:\n - ${errors.join('\n - ')}`);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length || errors.length ? 1 : 0);
