// Touch controls on phone-sized screens: the real menus by tap, then the stick, camera drags,
// pinch zoom, jump and double jump, the spell cards and the menu buttons, all read back through
// window.__isle. Ends with a layout check: nothing overlaps or runs off screen, either way up.
// Chromium (Pixel 7) gets real touches over CDP. WebKit (iPhone 15) gets real taps, but Playwright
// has no WebKit API for a finger that holds or drags, so those are pointer events sent in the page.
// Usage: node scripts/touch.mjs   (dev server must be running; ENGINES=chromium or webkit runs one)
import { chromium, webkit, devices } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.URL ?? 'http://localhost:5174/?monsters=off'; // no monster interferes with the stick and jump distances
const OUT = process.env.OUT ?? './shots';
const ENGINES = (process.env.ENGINES ?? 'chromium,webkit').split(',');
mkdirSync(OUT, { recursive: true });

const results = [];
const errors = [];
const check = (name, ok, detail) => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${detail}`);
};

// Chromium: real touch points. CDP wants every finger that's still down on each event, and an
// empty list to lift the last ones.
function cdpFingers(cdp) {
  const live = new Map();
  const points = () => [...live.entries()].map(([id, p]) => ({ id, x: p.x, y: p.y }));
  return {
    async down(id, x, y) {
      live.set(id, { x, y });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points() });
    },
    async move(id, x, y) {
      live.set(id, { x, y });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points() });
    },
    async up(id) {
      live.delete(id);
      if (live.size) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points() });
      else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    },
  };
}

// WebKit: pointer events aimed at whatever is under the finger, as a touchscreen would deliver them.
function pageFingers(page) {
  const send = (type, id, x = 0, y = 0) => page.evaluate(([t, i, px, py]) => window.__finger(t, i, px, py), [type, id, x, y]);
  return { down: (id, x, y) => send('down', id, x, y), move: (id, x, y) => send('move', id, x, y), up: (id) => send('up', id) };
}
function fingerShim() {
  const held = new Map();
  window.__finger = (type, id, x, y) => {
    const was = held.get(id);
    const el = type === 'down' ? document.elementFromPoint(x, y) : was?.el;
    if (!el) throw new Error(`no element under finger ${id} at ${x},${y}`);
    const at = type === 'up' ? was : { el, x, y };
    if (type === 'up') held.delete(id);
    else held.set(id, at);
    el.dispatchEvent(new PointerEvent(`pointer${type}`, { pointerId: 100 + id, pointerType: 'touch', isPrimary: id === 1, clientX: at.x, clientY: at.y, bubbles: true, cancelable: true, composed: true }));
  };
}

async function run(engine) {
  const isChrome = engine === 'chromium';
  const tag = isChrome ? 'pixel7' : 'iphone15';
  const browser = isChrome
    ? await chromium.launch({ channel: 'chrome', headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal'] })
    : await webkit.launch({ headless: true });
  const landscape = devices[isChrome ? 'Pixel 7 landscape' : 'iPhone 15 landscape'];
  const portrait = devices[isChrome ? 'Pixel 7' : 'iPhone 15'];
  const ctx = await browser.newContext({ ...landscape });
  if (!isChrome) await ctx.addInitScript(fingerShim);
  const page = await ctx.newPage();
  await page.routeWebSocket(/.*/, () => {});
  page.on('pageerror', (e) => errors.push(`${tag}: ${e}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`${tag}: ${m.text()}`));
  await page.goto(BASE);
  await page.waitForFunction(() => window.__isle?.ready === true, null, { timeout: 90000 });
  await page.waitForTimeout(1500);
  const fingers = isChrome ? cdpFingers(await ctx.newCDPSession(page)) : pageFingers(page);
  const isle = (fn, ...args) => page.evaluate(([f, a]) => window.__isle[f](...a), [fn, args]);
  const state = () => isle('state');
  const wait = (ms) => page.waitForTimeout(ms);
  const center = (sel) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel);
  async function hold(id, at, ms) {
    await fingers.down(id, at.x, at.y);
    await wait(ms);
    await fingers.up(id);
  }
  async function sampleMaxY(ms) {
    let maxY = -Infinity;
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      maxY = Math.max(maxY, (await state()).pos[1]);
      await wait(16);
    }
    return maxY;
  }
  const flatSpot = async () => {
    const L = await page.evaluate(() => window.__isle.landmarks);
    await isle('teleport', L.gate.x + 40, L.gate.z - 25);
    await isle('look', 0, -0.2, 8);
    await wait(700);
    return state();
  };

  // --- the menus, by tap ---
  await page.tap('.overlay.intro .enter');
  await page.waitForFunction(() => window.__isle.state().mode === 'select', null, { timeout: 30000 });
  const on = (await state()).touch;
  check(`${tag}: touch controls on`, on === true, `touch=${on}`);
  await page.tap('.pick[data-id="momo"]');
  await page.waitForFunction(() => window.__isle.character().wearing === 'momo', null, { timeout: 90000 });
  await page.tap('.overlay.select .sel-input');
  await page.keyboard.type('Yan');
  await page.tap('.overlay.select .begin');
  await wait(1800);
  const afterBegin = await state();
  const who = await isle('character');
  check(`${tag}: title, select, name, play by tap`, afterBegin.mode === 'play' && who.name === 'Yan' && who.wearing === 'momo', `mode=${afterBegin.mode} name=${who.name} wearing=${who.wearing}`);

  const vp = page.viewportSize();
  const stick = { x: 110, y: vp.height - 95 };

  // --- the stick: forward walks, the rim runs ---
  let s0 = await flatSpot();
  await fingers.down(1, stick.x, stick.y);
  await fingers.move(1, stick.x, stick.y - 30);
  await wait(1500);
  await fingers.up(1);
  await wait(600);
  let s1 = await state();
  const walkDx = s1.pos[0] - s0.pos[0];
  const walkDz = s1.pos[2] - s0.pos[2];
  const walk = Math.hypot(walkDx, walkDz);
  check(`${tag}: stick walks forward`, walk > 5 && walk < 12 && walkDz < -4 && Math.abs(walkDx) < 2, `moved ${walk.toFixed(1)}m (dx ${walkDx.toFixed(1)}, dz ${walkDz.toFixed(1)}) in 1.5s at 60% tilt`);
  s0 = await flatSpot();
  await fingers.down(1, stick.x, stick.y);
  await fingers.move(1, stick.x + 35, stick.y - 35);
  await fingers.move(1, stick.x + 50, stick.y - 50); // past the rim: the base trails, full tilt
  await wait(1500);
  await fingers.up(1);
  await wait(600);
  s1 = await state();
  const run = Math.hypot(s1.pos[0] - s0.pos[0], s1.pos[2] - s0.pos[2]);
  check(`${tag}: stick at the rim runs`, run > walk * 1.35 && s1.pos[0] - s0.pos[0] > 3, `moved ${run.toFixed(1)}m vs ${walk.toFixed(1)}m walking, diagonally (dx ${(s1.pos[0] - s0.pos[0]).toFixed(1)})`);
  const idle = await state();
  check(`${tag}: lifting the thumb stops`, Math.hypot(idle.vel[0], idle.vel[2]) < 0.5, `speed ${Math.hypot(idle.vel[0], idle.vel[2]).toFixed(2)} m/s after release`);

  // --- the camera: drag on the right looks, a pinch zooms ---
  let a = await state();
  const look = { x: vp.width * 0.68, y: vp.height * 0.45 };
  await fingers.down(2, look.x, look.y);
  for (let i = 1; i <= 10; i++) await fingers.move(2, look.x - i * 15, look.y + i * 4);
  await fingers.up(2);
  await wait(200);
  let b = await state();
  check(`${tag}: drag turns the camera`, Math.abs(b.yaw - a.yaw) > 0.5 && b.pitch !== a.pitch, `yaw ${a.yaw.toFixed(2)} -> ${b.yaw.toFixed(2)}, pitch ${a.pitch.toFixed(2)} -> ${b.pitch.toFixed(2)}`);
  a = b;
  await fingers.down(2, look.x - 30, look.y);
  await fingers.down(3, look.x + 30, look.y);
  for (let i = 1; i <= 8; i++) {
    await fingers.move(2, look.x - 30 - i * 8, look.y);
    await fingers.move(3, look.x + 30 + i * 8, look.y);
  }
  await fingers.up(3);
  await fingers.up(2);
  await wait(200);
  b = await state();
  check(`${tag}: pinch zooms in`, b.zoom < a.zoom * 0.85 && Math.abs(b.yaw - a.yaw) < 0.05, `camera distance ${a.zoom.toFixed(1)} -> ${b.zoom.toFixed(1)}m, yaw held at ${b.yaw.toFixed(2)}`);
  await isle('look', 0, -0.2, 8);

  // --- jump, and jump again in the air ---
  const jump = await center('.t-jump');
  s0 = await flatSpot();
  let [peak] = await Promise.all([sampleMaxY(1300), hold(4, jump, 320)]);
  const single = peak - s0.pos[1];
  check(`${tag}: jump button jumps`, single > 1.5, `rose ${single.toFixed(2)}m`);
  s0 = await flatSpot();
  [peak] = await Promise.all([
    sampleMaxY(1700),
    (async () => {
      await hold(4, jump, 220);
      await wait(120);
      await hold(4, jump, 260);
    })(),
  ]);
  const twice = peak - s0.pos[1];
  check(`${tag}: second tap in the air double jumps`, twice > single + 0.8, `rose ${twice.toFixed(2)}m vs ${single.toFixed(2)}m for one jump`);

  // --- spell cards: a tap casts, holding Spark keeps firing ---
  await flatSpot();
  await isle('look', 0, 0.15, 8); // Skip won't blink into rising ground, so aim it a little up
  await wait(1500); // aura back to full
  await page.tap('.spellbar .slot-skip');
  await wait(60);
  const cd = (await state()).cooldowns.skip;
  check(`${tag}: tapping a spell card casts it`, cd > 0.3, `Skip cooldown ${cd.toFixed(2)}s right after the tap`);
  await flatSpot();
  await wait(2000);
  const aura0 = (await state()).aura;
  await hold(5, await center('.spellbar .slot-spark'), 800);
  const aura1 = (await state()).aura;
  check(`${tag}: holding Spark keeps firing`, aura0 - aura1 > 8, `aura ${aura0.toFixed(0)} -> ${aura1.toFixed(0)} over 0.8s (6 a shot, 14/s back)`);

  // --- the menu buttons ---
  const modeAfter = async (sel) => {
    await page.tap(sel);
    await wait(350);
    return (await state()).mode;
  };
  const paused = await modeAfter('.t-corner button[aria-label="Pause"]');
  const resumed = await modeAfter('.overlay.pause .resume');
  const mapped = await modeAfter('.t-corner button[aria-label="World map"]');
  const mapClosed = await modeAfter('.overlay.worldmap .close');
  const bound = await modeAfter('.hud .hand');
  const bindClosed = await modeAfter('.overlay.binder .close');
  const viaMinimap = await modeAfter('.hud .map-wrap');
  await modeAfter('.overlay.worldmap .close');
  check(
    `${tag}: pause, map and binder by tap`,
    paused === 'paused' && resumed === 'play' && mapped === 'map' && mapClosed === 'play' && bound === 'binder' && bindClosed === 'play' && viaMinimap === 'map',
    `pause=${paused} resume=${resumed} map=${mapped} close=${mapClosed} hand=${bound} close=${bindClosed} minimap=${viaMinimap}`,
  );

  // --- layout: every control on screen, none on top of another, either way up ---
  await isle('previewFoe', true); // the monster bar at its tallest, so it gets checked too
  const sizes = [['landscape', landscape.viewport], ['portrait', portrait.viewport]];
  if (isChrome) sizes.push(['844x390', { width: 844, height: 390 }], ['390x844', { width: 390, height: 844 }]);
  for (const [name, size] of sizes) {
    await page.setViewportSize(size);
    await wait(600);
    const clash = await page.evaluate(() => {
      const parts = ['.hud-tl', '.map-wrap', '.region-label', '.t-corner', '.spellbar', '.t-jump', '.t-stick', '.foe'];
      const rects = parts.map((s) => [s, document.querySelector(s).getBoundingClientRect()]);
      const out = [];
      for (const [s, r] of rects) {
        if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) out.push(`${s} off screen`);
      }
      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const [sa, p] = rects[i];
          const [sb, q] = rects[j];
          if (p.left < q.right && q.left < p.right && p.top < q.bottom && q.top < p.bottom) out.push(`${sa} overlaps ${sb}`);
        }
      }
      return out;
    });
    check(`${tag}: ${name} ${size.width}x${size.height} layout`, clash.length === 0, clash.length ? clash.join(', ') : 'nothing overlaps or runs off screen');
    await page.screenshot({ path: `${OUT}/touch-${tag}-${name}.png` });
  }
  await browser.close();
}

for (const engine of ENGINES) await run(engine);
const failed = results.filter((r) => !r.ok);
if (errors.length) console.log(`\nconsole errors:\n - ${errors.join('\n - ')}`);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length || errors.length ? 1 : 0);
