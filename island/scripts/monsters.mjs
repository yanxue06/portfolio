// Monster checks: each kind attacks, each one's trick works, beaten ones drop better cards, the
// safe zones hold, and every land spawns its share. Drives the real AI through window.__isle,
// one monster at a time (the rest are benched) with the jellyhops off the board.
// Usage: node scripts/monsters.mjs   (dev server must be running)
import { chromium } from 'playwright-core';

const URL = process.env.URL ?? 'http://localhost:5174/?autoplay=1&char=none';
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.routeWebSocket(/.*/, () => {});
await page.goto(URL);
await page.waitForFunction(() => window.__isle?.ready === true, null, { timeout: 90000 });
await page.waitForTimeout(2000);

const isle = (fn, ...args) => page.evaluate(([f, a]) => window.__isle[f](...a), [fn, args]);
const state = () => isle('state');
const wait = (ms) => page.waitForTimeout(ms);
const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${detail}`);
};
/** Polls until fn() returns something truthy, or gives up after ms. */
async function until(fn, ms, every = 40) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const v = await fn();
    if (v) return v;
    await wait(every);
  }
  return null;
}
const monster = async (id) => (await isle('monsters')).find((m) => m.id === id);
const firstOf = async (kind) => (await isle('monsters')).find((m) => m.kind === kind);

await isle('holdResolution', true);
await isle('benchCritters');

// --- every land has its monsters, none in a safe zone ---------------------------------------
const list = await isle('monsters');
const count = (kind) => list.filter((m) => m.kind === kind).length;
let homesSafe = 0;
for (const m of list) if (await isle('safe', m.anchor[0], m.anchor[2])) homesSafe++;
check(
  'isle spawns 4 lanternwings, 3 thornmortars, 2 rumblebacks, 3 snapjacks',
  count('lanternwing') === 4 && count('thornmortar') === 3 && count('rumbleback') === 2 && count('snapjack') === 3,
  `${list.length} monsters`,
);
check('no monster lives in the Gate plaza or the town', homesSafe === 0, `${homesSafe} home(s) inside a safe zone`);

// the arena: the first Rumbleback's home (open ground, out of the safe zones)
const [ax, , az] = (await firstOf('rumbleback')).anchor;
const stage = async (kind, playerDx, playerDz) => {
  const m = await firstOf(kind);
  await isle('isolateMonster', m.id);
  await isle('placeMonster', kind, ax, az);
  await isle('teleport', ax + playerDx, az + playerDz);
  await isle('heal');
  await isle('lookAt', ax, az);
  return m.id;
};

// --- Lanternwing: shoots, and Bubble Ward sends the shots home -----------------------------
let id = await stage('lanternwing', 13, 0);
const shot = await until(async () => (await state()).shots > 0, 7000);
await wait(1500);
let s = await state();
check('a Lanternwing shoots at you', shot !== null && s.hp < 100, `shots seen=${shot !== null} hp=${s.hp.toFixed(0)}`);

id = await stage('lanternwing', 13, 0);
const beatenBefore = (await state()).monstersBeaten;
const cardsBefore = (await isle('pickups')).length;
const charging = await until(async () => (await monster(id)).state === 'charge', 7000);
await isle('cast', 'ward');
const burst = await until(async () => !(await monster(id)).alive, 4000);
s = await state();
check('Bubble Ward bounces its shots back and bursts it', charging !== null && burst !== null && s.hp === 100, `charged=${charging !== null} burst=${burst !== null} hp=${s.hp.toFixed(0)} beaten=${s.monstersBeaten - beatenBefore}`);

// --- beaten monsters drop better cards ----------------------------------------------------------
const drops = (await isle('pickups')).slice(cardsBefore);
const own = drops.find((c) => c.no === 61);
const land = drops.find((c) => c.no !== 61);
check(
  'a first Lanternwing drops its own card plus an uncommon or rare',
  drops.length === 2 && own !== undefined && land !== undefined && (land.rarity === 'uncommon' || land.rarity === 'rare'),
  drops.map((c) => `#${c.no} ${c.rarity}`).join(', ') || 'no drops',
);
await isle('teleport', ax + 4, az);
await isle('cast', 'lodestar');
await wait(1500);
check('its card lands in the binder', (await isle('owned', 61)) === 1, `owned #61 x${await isle('owned', 61)}`);

// --- Thornmortar: armored shut, soft open, Thunderclap always cracks it -------------------------
id = await stage('thornmortar', 42, 0); // far enough that it stays calm and shut
await wait(700);
let r = await isle('hitMonster', id, 1, 'spark');
const shutHp = r.hp;
await isle('forceMonster', id, 'open');
await wait(150);
r = await isle('hitMonster', id, 1, 'spark');
const openHp = r.hp;
r = await isle('hitMonster', id, 2, 'clap');
check('a shut Thornmortar shrugs off Spark, an open one or a Thunderclap hurts it', shutHp === 6 && openHp === 5 && r.hp === 3, `shut ${shutHp}/6, open ${openHp}, after clap ${r.hp}`);

id = await stage('thornmortar', 12, 3);
const podUp = await until(async () => (await state()).shots > 0, 7000);
const hpBefore = (await state()).hp;
const landed = await until(async () => (await state()).hp <= hpBefore - 16, 3000);
check('its seed pod lands where you stood', podUp !== null && landed !== null, `pod=${podUp !== null} hp ${hpBefore.toFixed(0)} -> ${(await state()).hp.toFixed(0)}`);

// --- Rumbleback: armored, dazed when it crashes, runs you over if you stand there -------------
id = await stage('rumbleback', 44, 0);
await wait(400);
r = await isle('hitMonster', id, 1, 'spark');
const armored = 24 - r.hp;
await isle('forceMonster', id, 'dazed');
r = await isle('hitMonster', id, 1, 'spark');
const dazed = 24 - armored - r.hp;
check('a Rumbleback takes a quarter from Spark, two and a half times while dazed', Math.abs(armored - 0.25) < 1e-6 && Math.abs(dazed - 2.5) < 1e-6, `armored -${armored}, dazed -${dazed}`);

// a tree between it and you: it charges straight into the trunk
const tree = await isle('nearest', 'tree', ax, az);
let lane = null;
for (let k = 0; k < 16 && !lane; k++) {
  const a = (k / 16) * Math.PI * 2;
  const dx = Math.cos(a);
  const dz = Math.sin(a);
  const from = { x: tree.x + dx * 12, z: tree.z + dz * 12 };
  const stop = { x: tree.x + dx * (tree.r + 1.6), z: tree.z + dz * (tree.r + 1.6) };
  if (await isle('safe', from.x, from.z)) continue;
  if ((await isle('ground', from.x, from.z)) < 1 || (await isle('ground', tree.x - dx * 3, tree.z - dz * 3)) < 0.5) continue;
  if (await isle('clear', from.x, from.z, stop.x, stop.z)) lane = { from, dx, dz };
}
if (!lane) check('a Rumbleback crashes into a tree and is dazed', false, `no clear 12 m lane to the tree at (${tree.x.toFixed(0)}, ${tree.z.toFixed(0)})`);
else {
  const m = await firstOf('rumbleback');
  await isle('isolateMonster', m.id);
  await isle('placeMonster', 'rumbleback', lane.from.x, lane.from.z);
  await isle('teleport', tree.x - lane.dx * 3, tree.z - lane.dz * 3);
  await isle('heal');
  await isle('forceMonster', m.id, 'notice');
  const rolled = await until(async () => (await monster(m.id)).state === 'roll', 4000);
  const crashed = await until(async () => (await monster(m.id)).state === 'dazed', 4000);
  const at = await monster(m.id);
  const toTree = Math.hypot(at.pos[0] - tree.x, at.pos[2] - tree.z);
  check('a Rumbleback crashes into a tree and is dazed', rolled !== null && crashed !== null && toTree < tree.r + 2.2, `rolled=${rolled !== null} dazed=${crashed !== null} stopped ${toTree.toFixed(1)}m from the trunk`);
}

// out in the open, standing still, you get run over
let open = null;
for (let k = 0; k < 16 && !open; k++) {
  const a = (k / 16) * Math.PI * 2;
  const p = { x: ax + Math.cos(a) * 13, z: az + Math.sin(a) * 13 };
  if (await isle('safe', p.x, p.z)) continue;
  if (await isle('clear', ax, az, p.x, p.z)) open = p;
}
if (!open) check('a Rumbleback runs you over if you stand still', false, 'no clear 13 m lane from the arena');
else {
  id = await stage('rumbleback', open.x - ax, open.z - az);
  await isle('forceMonster', id, 'notice');
  const hit = await until(async () => (await state()).hp <= 74, 5000);
  check('a Rumbleback runs you over if you stand still', hit !== null, `hp ${(await state()).hp.toFixed(0)}`);
}

// --- Snapjack: passes for a card, bites, and Lodestar drags it out -----------------------------
id = await stage('snapjack', 15, 0);
await wait(400);
const hiddenMarks = await isle('marks');
const dealt = (await isle('pickups')).length;
await isle('teleport', ax + 3.2, az);
const sprang = await until(async () => (await monster(id)).state === 'chase', 3000);
const bit = await until(async () => (await state()).hp < 100, 4000);
const shownMarks = await isle('marks');
check(
  'a Snapjack hides as a card (no map dot), springs when you get close, and bites',
  hiddenMarks === 0 && sprang !== null && bit !== null && shownMarks === 1 && (await isle('pickups')).length === dealt,
  `dots hidden=${hiddenMarks} shown=${shownMarks} sprang=${sprang !== null} hp=${(await state()).hp.toFixed(0)}`,
);

id = await stage('snapjack', 20, 0);
await wait(400);
await isle('cast', 'lodestar');
const yanked = await until(async () => (await monster(id)).state === 'yanked', 1500, 20);
const stunned = await until(async () => (await monster(id)).state === 'stunned', 2000);
const near = await monster(id);
const p = (await state()).pos;
const gap = Math.hypot(near.pos[0] - p[0], near.pos[2] - p[2]);
check('Lodestar drags a hidden Snapjack out and leaves it stunned at your feet', yanked !== null && stunned !== null && gap < 4.5, `yanked=${yanked !== null} stunned=${stunned !== null} ${gap.toFixed(1)}m away`);

// --- safe zones: nothing fights at the Gate --------------------------------------------------
const L = await page.evaluate(() => window.__isle.landmarks);
const lw = await firstOf('lanternwing');
await isle('isolateMonster', lw.id);
await isle('placeMonster', 'lanternwing', L.gate.x + 12, L.gate.z);
await isle('teleport', L.gate.x, L.gate.z + 6);
await isle('heal');
await wait(4000);
s = await state();
check('nothing attacks inside the Gate plaza', s.shots === 0 && s.hp === 100, `shots=${s.shots} hp=${s.hp.toFixed(0)}`);
check('the monster AI costs well under a millisecond a frame', s.monsterMs < 0.5, `${s.monsterMs} ms`);

// --- the other lands spawn theirs ------------------------------------------------------------
for (const landId of ['sunscar', 'frostveil', 'mistmoor']) {
  await page.evaluate((l) => window.__isle.travel(l), landId);
  await until(async () => !(await state()).loading && (await state()).land === landId, 60000, 200);
  const here = await isle('monsters');
  check(`${landId} spawns its 12 monsters`, here.length === 12, `${here.length} monsters`);
}

await browser.close();
const failed = results.filter((x) => !x.ok);
if (errors.length) console.log(`\nconsole errors:\n - ${errors.join('\n - ')}`);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length || errors.length ? 1 : 0);
