// A bot plays each monster fight with real keys: aims, holds Spark, strafes, and reacts to tells the
// way a player who knows the trick would. Two styles per monster: "still" stands and shoots; "moving"
// strafes, waits for openings and sidesteps a charge. Prints time to win, damage taken and deaths.
// Its aim is perfect (it snaps to the target), so a person takes longer than these times.
// Usage: node scripts/playtest.mjs   (dev server must be running)
// Env: URL, ROUNDS (2), KINDS (all four), STYLES (still,moving), TRACE=1 prints the fight every 0.5 s
// Fails if a fight runs out the clock or the "moving" style dies, or on any console error.
import { chromium } from 'playwright-core';

const URL = process.env.URL ?? 'http://localhost:5174/?autoplay=1&char=none';
const ROUNDS = Number(process.env.ROUNDS ?? 2);
const STYLES = (process.env.STYLES ?? 'still,moving').split(',');
const problems = [];
const KINDS = (process.env.KINDS ?? 'lanternwing,thornmortar,rumbleback,snapjack').split(',');
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.routeWebSocket(/.*/, () => {});
await page.goto(URL);
await page.waitForFunction(() => window.__isle?.ready === true, null, { timeout: 90000 });
await page.waitForTimeout(1500);
const isle = (fn, ...args) => page.evaluate(([f, a]) => window.__isle[f](...a), [fn, args]);
await isle('holdResolution', true);
await isle('benchCritters');
const [ax, , az] = (await isle('monsters')).find((m) => m.kind === 'rumbleback').anchor;
const L = await page.evaluate(() => window.__isle.landmarks);

// one tick: everything the bot needs, in a single round trip
const look = () =>
  page.evaluate(() => {
    const s = window.__isle.state();
    return { s, list: window.__isle.monsters() };
  });

const keys = new Set();
async function hold(code, on) {
  if (on && !keys.has(code)) {
    keys.add(code);
    await page.keyboard.down(code);
  } else if (!on && keys.has(code)) {
    keys.delete(code);
    await page.keyboard.up(code);
  }
}
async function release() {
  for (const k of [...keys]) await hold(k, false);
}

async function fight(kind, style) {
  const first = (await isle('monsters')).find((m) => m.kind === kind);
  await isle('isolateMonster', first.id);
  const start = { lanternwing: 14, thornmortar: 15, rumbleback: 16, snapjack: 15 }[kind];
  await isle('placeMonster', kind, ax, az);
  await isle('teleport', ax + start, az);
  await isle('heal');
  await isle('lookAt', ax, az);
  await page.waitForTimeout(300);
  const t0 = Date.now();
  let lastHp = 100;
  let lost = 0;
  let deaths = 0;
  let minHp = 100;
  let strafe = 'KeyD';
  let strafeAt = Date.now();
  let dodgeUntil = 0;
  let outcome = 'timeout';
  let auraSpent = 0;
  let lastAura = 100;
  while (Date.now() - t0 < 45000) {
    const { s, list } = await look();
    const m = list.find((k) => k.id === first.id);
    if (process.env.TRACE && Date.now() - (globalThis.__tr ?? 0) > 500) {
      globalThis.__tr = Date.now();
      console.log(`   t=${((Date.now() - t0) / 1000).toFixed(1)} ${m.state} hp=${m.hp} dist=${Math.hypot(m.pos[0] - s.pos[0], m.pos[2] - s.pos[2]).toFixed(1)} dy=${(m.pos[1] - s.pos[1]).toFixed(1)} me=${s.hp.toFixed(0)} aura=${s.aura.toFixed(0)}`);
    }
    if (!m.alive) {
      outcome = 'won';
      break;
    }
    if (s.hp < lastHp) lost += lastHp - s.hp;
    if (s.aura < lastAura) auraSpent += lastAura - s.aura;
    lastAura = s.aura;
    minHp = Math.min(minHp, s.hp);
    // dealt out: the game sends you back to the Gate at full health
    if (Math.hypot(s.pos[0] - L.gate.x, s.pos[2] - (L.gate.z + 6)) < 2 && s.hp === 100 && lastHp < 100) {
      deaths++;
      await release();
      await isle('teleport', ax + start, az);
    }
    lastHp = s.hp;

    // aim at its body
    const cy = m.pos[1] + (kind === 'lanternwing' ? 0 : kind === 'rumbleback' ? 1 : kind === 'thornmortar' ? 1.05 : 0.45);
    const dx = m.pos[0] - s.pos[0];
    const dz = m.pos[2] - s.pos[2];
    const flat = Math.hypot(dx, dz);
    await isle('lookAt', m.pos[0], m.pos[2]);
    await isle('pitch', Math.max(-0.6, Math.min(0.6, Math.atan2(cy - (s.pos[1] + 1.55), flat + 6))), 6.8);

    // when shooting is worth it
    let shoot = true;
    if (style === 'moving') {
      if (kind === 'thornmortar') shoot = m.state === 'opening' || m.state === 'open' || m.state === 'closing';
      if (kind === 'rumbleback') shoot = m.state === 'dazed' || m.state === 'skid' || m.state === 'recover';
      if (kind === 'snapjack') shoot = m.state !== 'disguised';
    }
    if (kind === 'snapjack' && m.state === 'disguised') shoot = false; // nobody shoots a card they think is real
    await hold('Digit1', shoot && s.aura >= 6);

    // movement
    if (style === 'still') {
      // walk up to a "card" like anyone would, then stand and shoot
      await hold('KeyW', kind === 'snapjack' && m.state === 'disguised');
      continue;
    }
    const now = Date.now();
    if (kind === 'snapjack') {
      await hold('KeyW', m.state === 'disguised');
      await hold('KeyS', m.state === 'chase' && flat < 6);
      await hold('KeyD', false);
      await hold('KeyA', false);
      continue;
    }
    if (kind === 'rumbleback' && m.state === 'windup' && now > dodgeUntil && flat < 24) {
      // the red line is down: pick a side and keep going until it has rolled past
      dodgeUntil = now + 1800;
      strafeAt = now + 1800;
      strafe = strafe === 'KeyD' ? 'KeyA' : 'KeyD';
    }
    if (now - strafeAt > 1300 && now > dodgeUntil) {
      strafe = strafe === 'KeyD' ? 'KeyA' : 'KeyD';
      strafeAt = now;
    }
    await hold('KeyD', strafe === 'KeyD');
    await hold('KeyA', strafe === 'KeyA');
    // keep the range a ranged fight wants
    await hold('KeyW', kind !== 'rumbleback' && flat > 18);
    await hold('KeyS', flat < 9 && kind !== 'rumbleback');
  }
  await release();
  const secs = (Date.now() - t0) / 1000;
  return { outcome, secs, lost, minHp, deaths, sparks: Math.round(auraSpent / 6) };
}

for (const kind of KINDS) {
  for (const style of STYLES) {
    for (let r = 0; r < ROUNDS; r++) {
      const f = await fight(kind, style);
      if (f.outcome !== 'won') problems.push(`${kind} ${style}: ${f.outcome}`);
      if (style === 'moving' && f.deaths > 0) problems.push(`${kind} moving: died ${f.deaths}x`);
      console.log(`${kind.padEnd(12)} ${style.padEnd(7)} ${f.outcome.padEnd(7)} ${f.secs.toFixed(1).padStart(5)} s   hp lost ${String(Math.round(f.lost)).padStart(4)}  lowest ${String(Math.round(f.minHp)).padStart(3)}  deaths ${f.deaths}  ~${f.sparks} sparks`);
    }
  }
}
await browser.close();
if (errors.length) console.log(`\nconsole errors:\n - ${errors.join('\n - ')}`);
console.log(problems.length ? `\nproblems:\n - ${problems.join('\n - ')}` : '\nevery fight won, no deaths playing the tricks');
process.exit(problems.length || errors.length ? 1 : 0);
