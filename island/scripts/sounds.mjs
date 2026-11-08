// Renders every sound offline (no speakers needed) through the game's own synth and master level,
// and prints each one's peak, loudness and length, the monster sounds next to the older ones.
// Also writes the monster sounds, in order, to one WAV you can play: OUT/monster-sounds.wav.
// Usage: node scripts/sounds.mjs   (dev server must be running)
// Fails if a sound is silent or clips.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
const DIR = process.env.OUT ?? path.resolve('shots');
fs.mkdirSync(DIR, { recursive: true });
const OUT = path.join(DIR, 'monster-sounds.wav');
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.routeWebSocket(/.*/, () => {});
await page.goto(process.env.URL ?? 'http://localhost:5174/?autoplay=1&char=none&monsters=off');
await page.waitForFunction(() => window.__isle?.ready === true, null, { timeout: 90000 });
const names = [
  ['old', 'spark'], ['old', 'hit'], ['old', 'pop'], ['old', 'clap'], ['old', 'hurt'], ['old', 'pickup', 'rare'],
  ['new', 'orbCharge'], ['new', 'orbFire'], ['new', 'orbHit'], ['new', 'lob'], ['new', 'podBurst'], ['new', 'spores'],
  ['new', 'armored'], ['new', 'rumble'], ['new', 'crash'], ['new', 'reveal'], ['new', 'bite'], ['new', 'beat'], ['new', 'reflect'],
];
const result = await page.evaluate(async (names) => {
  const s = window.__isle.sfx;
  const rate = 44100;
  const noise = new AudioBuffer({ length: rate, sampleRate: rate, numberOfChannels: 1 });
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const saved = { ctx: s.ctx, master: s.master, noiseBuffer: s.noiseBuffer, muted: s.muted };
  const out = [];
  const reel = [];
  for (const [age, name, arg] of names) {
    const off = new OfflineAudioContext(1, rate * 2.2, rate);
    s.ctx = off;
    s.master = off.createGain();
    s.master.gain.value = 0.32; // the game's master level
    s.master.connect(off.destination);
    s.noiseBuffer = noise;
    s.muted = false;
    arg === undefined ? s[name]() : s[name](arg);
    const buf = await off.startRendering();
    const x = buf.getChannelData(0);
    let peak = 0, sum = 0, last = 0;
    for (let i = 0; i < x.length; i++) {
      const a = Math.abs(x[i]);
      if (a > peak) peak = a;
      sum += x[i] * x[i];
      if (a > 0.003) last = i;
    }
    const lengthS = last / rate;
    const rms = Math.sqrt(sum / Math.max(1, last));
    out.push({ age, name, peakDb: 20 * Math.log10(peak || 1e-9), rmsDb: 20 * Math.log10(rms || 1e-9), lengthS });
    if (age === 'new') reel.push(Array.from(x.subarray(0, Math.min(x.length, last + rate * 0.35))));
  }
  Object.assign(s, saved);
  return { out, reel };
}, names);
const bad = [];
for (const r of result.out) {
  console.log(`${r.age}  ${r.name.padEnd(10)} peak ${r.peakDb.toFixed(1).padStart(6)} dBFS  rms ${r.rmsDb.toFixed(1).padStart(6)} dB  ${r.lengthS.toFixed(2)} s`);
  if (r.peakDb < -60) bad.push(`${r.name} is silent`);
  if (r.peakDb > -1) bad.push(`${r.name} clips`);
}
// one mono 16-bit WAV of the new sounds, in order
const samples = result.reel.flat();
const buf = Buffer.alloc(44 + samples.length * 2);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + samples.length * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(44100, 24); buf.writeUInt32LE(88200, 28);
buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(samples.length * 2, 40);
samples.forEach((v, i) => buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), 44 + i * 2));
fs.writeFileSync(OUT, buf);
console.log(`wrote ${OUT} (${(samples.length / 44100).toFixed(1)} s)`);
await browser.close();
console.log(bad.length ? `\nproblems:\n - ${bad.join('\n - ')}` : 'every sound plays, none clips');
process.exit(bad.length ? 1 : 0);
