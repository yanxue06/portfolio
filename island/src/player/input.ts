// Keyboard + mouse state, polled once per frame. Edge-triggered presses are
// collected between frames so a quick tap never gets lost.
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
  private readonly canvas: HTMLCanvasElement;

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
    if (this.locked) return;
    const result = this.canvas.requestPointerLock() as unknown;
    if (result instanceof Promise) {
      result.catch((err: unknown) => console.warn('[input] pointer lock refused:', err));
    }
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
  }
}

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
}
