// Keyboard + mouse state, polled once per frame. Edge-triggered presses are
// collected between frames so a quick tap never gets lost. The touch controls
// feed the same state (virtual keys plus an analog stick), so nothing downstream
// cares which one you used.
const BLOCK_DEFAULT = new Set(['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export class Input {
  readonly down = new Set<string>();
  readonly pressed = new Set<string>();
  readonly released = new Set<string>();
  mouseDX = 0;
  mouseDY = 0;
  wheel = 0;
  readonly mouseDown = [false, false, false];
  readonly mousePressed = [false, false, false];
  locked = false;
  /** The touch stick: x to the right, y forward, each -1..1, already past the dead zone. 0 when idle. */
  stickX = 0;
  stickY = 0;
  /** True once the touch controls are on. Pointer lock is never asked for then. */
  touch = false;
  private readonly canvas: HTMLCanvasElement;
  // on-screen buttons let go before the frame saw them down; these get released after it does
  private readonly lateUp = new Set<string>();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener('keydown', (e) => {
      if (isTyping(e.target)) return; // the name box gets the keys, not the game
      if (BLOCK_DEFAULT.has(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.down.add(e.code);
      this.pressed.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this.down.delete(e.code);
      this.released.add(e.code);
    });
    window.addEventListener('blur', () => {
      this.down.clear();
      this.mouseDown.fill(false);
      this.stickX = 0;
      this.stickY = 0;
    });
    canvas.addEventListener('mousedown', (e) => {
      if (e.button > 2) return;
      this.mouseDown[e.button] = true;
      this.mousePressed[e.button] = true;
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button > 2) return;
      this.mouseDown[e.button] = false;
    });
    window.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      this.mouseDX += e.movementX;
      this.mouseDY += e.movementY;
    });
    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.wheel += e.deltaY;
      },
      { passive: false },
    );
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.canvas;
      console.info(`[input] pointer lock ${this.locked ? 'on' : 'off'}`);
    });
  }

  requestLock(): void {
    // phones have nothing to lock, and iOS Safari doesn't even have the method
    if (this.locked || this.touch || typeof this.canvas.requestPointerLock !== 'function') return;
    const result = this.canvas.requestPointerLock() as unknown;
    if (result instanceof Promise) {
      result.catch((err: unknown) => console.warn('[input] pointer lock refused:', err));
    }
  }

  /** A virtual key going down, from an on-screen button. */
  press(code: string): void {
    this.lateUp.delete(code);
    if (!this.down.has(code)) this.pressed.add(code);
    this.down.add(code);
  }

  /** A virtual key coming up. A tap shorter than a frame still gets one frame held down. */
  release(code: string): void {
    if (!this.down.has(code)) return;
    if (this.pressed.has(code)) {
      this.lateUp.add(code);
      return;
    }
    this.down.delete(code);
    this.released.add(code);
  }

  isDown(code: string): boolean {
    return this.down.has(code);
  }

  wasPressed(code: string): boolean {
    return this.pressed.has(code);
  }

  wasReleased(code: string): boolean {
    return this.released.has(code);
  }

  endFrame(): void {
    this.pressed.clear();
    this.released.clear();
    this.mousePressed.fill(false);
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.wheel = 0;
    for (const code of this.lateUp) {
      this.down.delete(code);
      this.released.add(code);
    }
    this.lateUp.clear();
  }
}

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
}
