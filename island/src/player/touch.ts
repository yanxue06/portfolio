// On-screen controls for phones and tablets. The left part of the screen is a thumb stick,
// dragging anywhere on the right looks around (two fingers pinch to zoom), there's a jump
// button, and the spell cards in the HUD become buttons. Everything feeds the same Input the
// keyboard and mouse do, so the player, camera and spells never know which one you used.
import { SPELLS } from '../spells';
import { uiIcon } from '../hud/icons';
import type { Input } from './input';

const STICK_R = 50; // how far (px) the knob travels from the base
const DEAD = 0.12; // share of the travel that does nothing, so a resting thumb doesn't creep
const LOOK = 2.6; // drag px -> mouse px (the camera's sensitivity is tuned for a mouse)
const LOOK_Y = 0.8; // vertical drags count a bit less, so a sideways swipe doesn't tilt the view
const PINCH = 3; // change in finger spread (px) -> wheel units
const STICK_SHARE = 0.42; // the left part of the screen that belongs to the stick

/** Phones and tablets: a coarse main pointer, or touch with no mouse or trackpad at all. */
export function prefersTouch(): boolean {
  return matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints > 0 && !matchMedia('(any-pointer: fine)').matches);
}

type Held = { code: string; el: HTMLElement };

export class TouchControls {
  on = false;
  onPause: () => void = () => {};
  onMap: () => void = () => {};
  onBinder: () => void = () => {};
  private readonly input: Input;
  private readonly root: HTMLElement;
  private stick: HTMLDivElement | null = null;
  private knob: HTMLDivElement | null = null;
  private stickId = -1;
  private baseX = 0;
  private baseY = 0;
  private readonly looks = new Map<number, { x: number; y: number }>();
  private spread = 0;
  private readonly held = new Map<number, Held>();

  constructor(input: Input, root: HTMLElement) {
    this.input = input;
    this.root = root;
  }

  /** Builds the controls. Safe to call twice; the first touch on a laptop can turn them on late. */
  enable(): void {
    if (this.on) return;
    this.on = true;
    this.input.touch = true;
    document.documentElement.classList.add('touch');

    const layer = document.createElement('div');
    layer.className = 't-layer';
    this.root.prepend(layer); // first child: every other HUD element sits on top of it

    const stick = document.createElement('div');
    stick.className = 't-stick';
    stick.innerHTML = '<div class="t-knob"></div>';
    this.stick = stick;
    this.knob = stick.querySelector<HTMLDivElement>('.t-knob');

    const jump = button('t-btn t-jump', 'Jump', uiIcon('jump'));
    const corner = document.createElement('div');
    corner.className = 't-corner';
    const pause = button('t-btn', 'Pause', uiIcon('pause'));
    const map = button('t-btn', 'World map', uiIcon('map'));
    const binder = button('t-btn', 'Binder', uiIcon('binder'));
    corner.append(pause, map, binder);
    const hint = document.createElement('div');
    hint.className = 't-rotate';
    hint.innerHTML = `${uiIcon('rotate')}<span>Turn your phone sideways for the best view</span>`;
    this.root.append(stick, jump, corner, hint);

    layer.addEventListener('pointerdown', (e) => this.layerDown(e));
    window.addEventListener('pointermove', (e) => this.move(e));
    window.addEventListener('pointerup', (e) => this.up(e));
    window.addEventListener('pointercancel', (e) => this.up(e));
    window.addEventListener('blur', () => this.reset());
    document.addEventListener('visibilitychange', () => this.reset());

    this.hold(jump, 'Space');
    for (const def of SPELLS) {
      const slot = this.root.querySelector<HTMLElement>(`.spellbar .slot-${def.id}`);
      if (!slot) throw new Error(`[touch] no spell slot for ${def.id}`);
      this.hold(slot, def.keys[0]); // Spark's key is held to keep firing, the rest cast on the press
    }
    tap(pause, () => this.onPause());
    tap(map, () => this.onMap());
    tap(binder, () => this.onBinder());
    // the hand and the minimap are the natural things to poke at, so they open what they show
    const hand = this.root.querySelector<HTMLElement>('.hand');
    const minimap = this.root.querySelector<HTMLElement>('.map-wrap');
    if (hand) tap(hand, () => this.onBinder());
    if (minimap) tap(minimap, () => this.onMap());
    console.info('[touch] controls on');
  }

  /** Lets go of everything: the stick, the view, held buttons. Called when play stops. */
  reset(): void {
    this.endStick();
    this.looks.clear();
    for (const h of this.held.values()) {
      this.input.release(h.code);
      h.el.classList.remove('down');
    }
    this.held.clear();
  }

  private hold(el: HTMLElement, code: string): void {
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.held.set(e.pointerId, { code, el });
      this.input.press(code);
      el.classList.add('down');
    });
  }

  private layerDown(e: PointerEvent): void {
    e.preventDefault();
    if (e.clientX < window.innerWidth * STICK_SHARE && this.stickId === -1) {
      this.stickId = e.pointerId;
      // keep the base far enough from the screen's edges that the knob has room to travel
      this.baseX = Math.max(STICK_R + 10, e.clientX);
      this.baseY = Math.min(window.innerHeight - STICK_R - 10, Math.max(STICK_R + 10, e.clientY));
      this.stick?.classList.add('held');
      this.placeStick();
      this.moveStick(e.clientX, e.clientY);
      return;
    }
    this.looks.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.looks.size === 2) this.spread = this.lookSpread();
  }

  private move(e: PointerEvent): void {
    if (e.pointerId === this.stickId) {
      this.moveStick(e.clientX, e.clientY);
      return;
    }
    const p = this.looks.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    if (this.looks.size >= 2) {
      const s = this.lookSpread();
      this.input.wheel -= (s - this.spread) * PINCH; // fingers apart zooms in
      this.spread = s;
      return;
    }
    this.input.mouseDX += dx * LOOK;
    this.input.mouseDY += dy * LOOK * LOOK_Y;
  }

  private up(e: PointerEvent): void {
    if (e.pointerId === this.stickId) this.endStick();
    if (this.looks.delete(e.pointerId) && this.looks.size === 2) this.spread = this.lookSpread();
    const h = this.held.get(e.pointerId);
    if (h) {
      this.held.delete(e.pointerId);
      this.input.release(h.code);
      h.el.classList.remove('down');
    }
  }

  private moveStick(x: number, y: number): void {
    let dx = x - this.baseX;
    let dy = y - this.baseY;
    const len = Math.hypot(dx, dy);
    if (len > STICK_R) {
      // the base trails the thumb, so sliding past the rim never strands you far from it
      this.baseX += (dx / len) * (len - STICK_R);
      this.baseY += (dy / len) * (len - STICK_R);
      dx = x - this.baseX;
      dy = y - this.baseY;
      this.placeStick();
    }
    const tilt = Math.min(1, Math.hypot(dx, dy) / STICK_R);
    const live = tilt < DEAD ? 0 : (tilt - DEAD) / (1 - DEAD);
    const k = tilt > 0 ? live / (tilt * STICK_R) : 0;
    this.input.stickX = dx * k;
    this.input.stickY = -dy * k; // up the screen is forward
    if (this.knob) this.knob.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    this.stick?.classList.toggle('run', live > 0.9);
  }

  private placeStick(): void {
    if (!this.stick) return;
    this.stick.style.left = `${(this.baseX - STICK_R).toFixed(1)}px`;
    this.stick.style.top = `${(this.baseY - STICK_R).toFixed(1)}px`;
    this.stick.style.bottom = 'auto';
  }

  private endStick(): void {
    this.stickId = -1;
    this.input.stickX = 0;
    this.input.stickY = 0;
    if (!this.stick) return;
    this.stick.classList.remove('held', 'run');
    this.stick.style.left = '';
    this.stick.style.top = '';
    this.stick.style.bottom = '';
    if (this.knob) this.knob.style.transform = '';
  }

  private lookSpread(): number {
    const [a, b] = [...this.looks.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }
}

function button(className: string, label: string, icon: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = className;
  b.type = 'button';
  b.setAttribute('aria-label', label);
  b.innerHTML = icon;
  return b;
}

function tap(el: HTMLElement, fn: () => void): void {
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    fn();
  });
}
