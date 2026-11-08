import type { Rarity } from './cards/catalog';

// Tiny WebAudio synth: every sound is generated, no audio files to ship.
export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  muted = false;

  /** Browsers only allow audio after a user gesture; call from one. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext;
    if (!Ctor) {
      console.warn('[sfx] WebAudio unavailable; running silent');
      return;
    }
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.32;
    this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate;
    this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    console.info('[sfx] audio unlocked');
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.32;
    console.info(`[sfx] ${this.muted ? 'muted' : 'unmuted'}`);
    return this.muted;
  }

  private tone(freq: number, dur: number, type: OscillatorType, gain: number, slideTo = 0, delay = 0): void {
    if (!this.ctx || !this.master || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo > 0) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private noise(dur: number, gain: number, freq: number, q: number, slideTo = 0, delay = 0): void {
    if (!this.ctx || !this.master || !this.noiseBuffer || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, t);
    if (slideTo > 0) filter.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    filter.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(this.master);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  jump(): void {
    this.noise(0.16, 0.35, 900, 0.8, 2400);
  }
  airJump(): void {
    this.noise(0.2, 0.3, 1400, 1.2, 4200);
    this.tone(660, 0.18, 'sine', 0.12, 1320);
  }
  land(impact: number): void {
    if (impact < 6) return;
    this.noise(0.12, Math.min(0.5, impact / 40), 420, 0.9, 160);
  }
  step(): void {
    this.noise(0.05, 0.06, 1800 + Math.random() * 600, 1.5);
  }
  spark(): void {
    this.tone(980, 0.14, 'triangle', 0.16, 420);
    this.noise(0.08, 0.1, 5200, 2);
  }
  hit(): void {
    this.tone(320, 0.12, 'square', 0.1, 140);
  }
  pop(): void {
    this.tone(520, 0.08, 'sine', 0.25, 1400);
    this.noise(0.18, 0.2, 2600, 1.2, 600);
  }
  skip(): void {
    this.tone(400, 0.22, 'sine', 0.18, 1800);
    this.noise(0.22, 0.18, 3000, 2, 8000);
  }
  ward(): void {
    [523, 659, 784].forEach((f, i) => this.tone(f, 0.6, 'sine', 0.1, 0, i * 0.03));
  }
  lodestar(): void {
    [440, 554, 659, 880, 1109].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.1, 0, i * 0.05));
  }
  clap(): void {
    this.tone(90, 0.45, 'sine', 0.55, 38);
    this.noise(0.35, 0.45, 600, 0.6, 120);
  }
  home(): void {
    [392, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.4, 'sine', 0.09, 0, i * 0.07));
  }
  channel(): void {
    this.tone(220, 1.5, 'sine', 0.06, 440);
  }
  pickup(rarity: Rarity): void {
    const sets: Record<Rarity, number[]> = {
      common: [784, 1046],
      uncommon: [659, 880, 1175],
      rare: [523, 784, 1046, 1568],
      mythic: [392, 523, 784, 1046, 1568, 2093],
    };
    sets[rarity].forEach((f, i) => this.tone(f, 0.32, 'triangle', 0.13, 0, i * 0.07));
  }
  denied(): void {
    this.tone(180, 0.12, 'square', 0.06, 150);
  }

  // --- monsters. v is 0..1, quieter the farther away it happened ---
  // the three warnings (charge, rumble, reveal) sit a few dB above the rest: they're cues to react to
  orbCharge(v = 1): void {
    this.tone(300, 0.55, 'sine', 0.12 * v, 900);
  }
  orbFire(v = 1): void {
    this.tone(720, 0.16, 'triangle', 0.1 * v, 260);
    this.noise(0.1, 0.06 * v, 2400, 1.5, 900);
  }
  orbHit(v = 1): void {
    this.noise(0.14, 0.16 * v, 1600, 1.2, 500);
  }
  lob(v = 1): void {
    this.tone(150, 0.22, 'sine', 0.22 * v, 70);
    this.noise(0.18, 0.12 * v, 500, 1, 200);
  }
  podBurst(v = 1): void {
    this.noise(0.32, 0.3 * v, 1100, 0.8, 180);
    this.tone(110, 0.3, 'sine', 0.22 * v, 50);
  }
  spores(v = 1): void {
    this.noise(0.4, 0.22 * v, 2600, 0.7, 900);
  }
  armored(v = 1): void {
    this.tone(2600, 0.09, 'sine', 0.08 * v);
    this.tone(3900, 0.07, 'sine', 0.05 * v, 0, 0.01);
  }
  rumble(v = 1): void {
    this.noise(0.9, 0.55 * v, 140, 0.9, 90);
    this.tone(70, 0.9, 'sawtooth', 0.09 * v, 55);
  }
  crash(v = 1): void {
    this.tone(80, 0.5, 'sine', 0.5 * v, 34);
    this.noise(0.45, 0.45 * v, 700, 0.6, 120);
    [1800, 2300, 2000].forEach((f, i) => this.tone(f, 0.12, 'triangle', 0.05 * v, f * 1.3, 0.35 + i * 0.13));
  }
  reveal(v = 1): void {
    this.noise(0.18, 0.28 * v, 3200, 2, 1200);
    this.tone(400, 0.18, 'square', 0.08 * v, 900, 0.06);
  }
  bite(v = 1): void {
    this.noise(0.06, 0.25 * v, 2600, 1.4);
    this.tone(220, 0.08, 'square', 0.08 * v, 120);
  }
  beat(v = 1): void {
    this.tone(520, 0.1, 'sine', 0.22 * v, 1500);
    this.noise(0.3, 0.2 * v, 2200, 1, 500);
    [784, 1046, 1318].forEach((f, i) => this.tone(f, 0.28, 'triangle', 0.08 * v, 0, 0.08 + i * 0.06));
  }
  reflect(): void {
    this.tone(1200, 0.16, 'sine', 0.12, 2200);
    this.tone(1800, 0.2, 'triangle', 0.06, 2600, 0.03);
  }
  hurt(): void {
    this.tone(160, 0.2, 'sawtooth', 0.12, 90);
  }
  ui(): void {
    this.tone(880, 0.06, 'sine', 0.08);
  }
}
