import * as THREE from 'three';
import { HABITAT, RARITY, cardNo, type CardDef } from './catalog';

// Card art is drawn once on a canvas and reused as a texture (3D pickups) and
// as a data URL (HUD, binder). 320x448 keeps the real 63x88mm card ratio.
export const CARD_W = 320;
export const CARD_H = 448;

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  return lines;
}

function newCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('[faces] 2d context unavailable');
  return [canvas, ctx];
}

function drawFace(card: CardDef): HTMLCanvasElement {
  const [canvas, ctx] = newCanvas();
  const r = RARITY[card.rarity];
  const hab = HABITAT[card.habitat];

  // Frame
  const frame = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  frame.addColorStop(0, r.frameA);
  frame.addColorStop(0.5, r.frameB);
  frame.addColorStop(1, r.frameA);
  roundRect(ctx, 0, 0, CARD_W, CARD_H, 24);
  ctx.fillStyle = frame;
  ctx.fill();
  roundRect(ctx, 11, 11, CARD_W - 22, CARD_H - 22, 16);
  ctx.fillStyle = '#141a2e';
  ctx.fill();

  // Header
  ctx.textBaseline = 'middle';
  ctx.font = '800 22px Nunito, sans-serif';
  ctx.fillStyle = '#ffe3a1';
  ctx.textAlign = 'left';
  ctx.fillText(cardNo(card.no), 26, 36);
  ctx.beginPath();
  ctx.arc(CARD_W - 40, 36, 15, 0, Math.PI * 2);
  ctx.fillStyle = r.color;
  ctx.fill();
  ctx.font = '900 17px Nunito, sans-serif';
  ctx.fillStyle = '#141a2e';
  ctx.textAlign = 'center';
  ctx.fillText(r.letter, CARD_W - 40, 37);

  // Art window
  const ax = 24;
  const ay = 58;
  const aw = CARD_W - 48;
  const ah = 214;
  ctx.save();
  roundRect(ctx, ax, ay, aw, ah, 14);
  ctx.clip();
  const art = ctx.createRadialGradient(CARD_W / 2, ay + ah * 0.45, 10, CARD_W / 2, ay + ah * 0.5, aw * 0.75);
  art.addColorStop(0, hab.a);
  art.addColorStop(1, hab.b);
  ctx.fillStyle = art;
  ctx.fillRect(ax, ay, aw, ah);
  // soft light rays
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + card.no;
    ctx.beginPath();
    ctx.moveTo(CARD_W / 2, ay + ah / 2);
    ctx.lineTo(CARD_W / 2 + Math.cos(a) * 300, ay + ah / 2 + Math.sin(a) * 300);
    ctx.lineTo(CARD_W / 2 + Math.cos(a + 0.18) * 300, ay + ah / 2 + Math.sin(a + 0.18) * 300);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.font = `118px ${EMOJI_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  ctx.fillText(card.emoji, CARD_W / 2, ay + ah / 2 + 6);
  ctx.restore();
  roundRect(ctx, ax, ay, aw, ah, 14);
  ctx.strokeStyle = 'rgba(255, 227, 161, 0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Name (shrinks to fit)
  let size = 27;
  ctx.font = `700 ${size}px Cinzel, Georgia, serif`;
  while (ctx.measureText(card.name).width > CARD_W - 50 && size > 16) {
    size -= 1;
    ctx.font = `700 ${size}px Cinzel, Georgia, serif`;
  }
  ctx.fillStyle = '#fff6df';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(card.name, CARD_W / 2, 302);
  ctx.fillStyle = 'rgba(255, 227, 161, 0.45)';
  ctx.fillRect(60, 324, CARD_W - 120, 1.5);

  // Flavor
  ctx.font = 'italic 600 16px Nunito, sans-serif';
  ctx.fillStyle = 'rgba(240, 235, 220, 0.86)';
  const lines = wrapLines(ctx, card.flavor, CARD_W - 64, 3);
  lines.forEach((line, i) => ctx.fillText(line, CARD_W / 2, 350 + i * 22));

  // Footer
  ctx.font = '800 13px Nunito, sans-serif';
  ctx.fillStyle = 'rgba(255, 227, 161, 0.75)';
  ctx.textAlign = 'left';
  ctx.fillText(hab.label.toUpperCase(), 28, CARD_H - 30);
  ctx.textAlign = 'right';
  ctx.fillStyle = r.color;
  ctx.fillText(r.label.toUpperCase(), CARD_W - 28, CARD_H - 30);
  return canvas;
}

function drawBack(): HTMLCanvasElement {
  const [canvas, ctx] = newCanvas();
  const frame = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  frame.addColorStop(0, '#ffe7a3');
  frame.addColorStop(0.5, '#c9962e');
  frame.addColorStop(1, '#ffe7a3');
  roundRect(ctx, 0, 0, CARD_W, CARD_H, 24);
  ctx.fillStyle = frame;
  ctx.fill();
  const bg = ctx.createRadialGradient(CARD_W / 2, CARD_H / 2, 20, CARD_W / 2, CARD_H / 2, 300);
  bg.addColorStop(0, '#2a3a78');
  bg.addColorStop(1, '#0f1530');
  roundRect(ctx, 11, 11, CARD_W - 22, CARD_H - 22, 16);
  ctx.fillStyle = bg;
  ctx.fill();

  // Diamond lattice
  ctx.save();
  roundRect(ctx, 11, 11, CARD_W - 22, CARD_H - 22, 16);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255, 215, 120, 0.12)';
  ctx.lineWidth = 1.5;
  for (let i = -CARD_H; i < CARD_W + CARD_H; i += 26) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + CARD_H, CARD_H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i, CARD_H);
    ctx.lineTo(i + CARD_H, 0);
    ctx.stroke();
  }
  ctx.restore();

  // Seal
  const cx = CARD_W / 2;
  const cy = CARD_H / 2 - 10;
  ctx.beginPath();
  ctx.arc(cx, cy, 78, 0, Math.PI * 2);
  ctx.fillStyle = '#121a3d';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#e8b84a';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 64, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(232, 184, 74, 0.6)';
  ctx.stroke();
  // four-point star
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? 54 : 14;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 215, 120, 0.25)';
  ctx.fill();
  ctx.font = '800 64px Cinzel, Georgia, serif';
  ctx.fillStyle = '#ffd36b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('W', cx, cy + 4);

  ctx.font = '700 17px Cinzel, Georgia, serif';
  ctx.fillStyle = 'rgba(255, 227, 161, 0.85)';
  ctx.fillText('WILDCARD ISLE', cx, CARD_H - 62);
  return canvas;
}

const faceCanvases = new Map<number, HTMLCanvasElement>();
const faceTextures = new Map<number, THREE.CanvasTexture>();
const faceUrls = new Map<number, string>();
let backCanvas: HTMLCanvasElement | null = null;
let backTexture: THREE.CanvasTexture | null = null;
let backUrl: string | null = null;

function faceCanvas(card: CardDef): HTMLCanvasElement {
  let c = faceCanvases.get(card.no);
  if (!c) {
    c = drawFace(card);
    faceCanvases.set(card.no, c);
  }
  return c;
}

function toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function faceTexture(card: CardDef): THREE.CanvasTexture {
  let t = faceTextures.get(card.no);
  if (!t) {
    t = toTexture(faceCanvas(card));
    faceTextures.set(card.no, t);
  }
  return t;
}

export function faceUrl(card: CardDef): string {
  let u = faceUrls.get(card.no);
  if (!u) {
    u = faceCanvas(card).toDataURL('image/png');
    faceUrls.set(card.no, u);
  }
  return u;
}

export function backTex(): THREE.CanvasTexture {
  if (!backCanvas) backCanvas = drawBack();
  if (!backTexture) backTexture = toTexture(backCanvas);
  return backTexture;
}

export function backDataUrl(): string {
  if (!backCanvas) backCanvas = drawBack();
  if (!backUrl) backUrl = backCanvas.toDataURL('image/png');
  return backUrl;
}

/** Wait (briefly) for the UI fonts so canvas text doesn't bake in a fallback face. */
export async function loadCardFonts(): Promise<void> {
  const wanted = ['700 27px Cinzel', '800 64px Cinzel', '800 22px Nunito', 'italic 600 16px Nunito', '900 17px Nunito'];
  const timeout = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 3000));
  const result = await Promise.race([Promise.all(wanted.map((f) => document.fonts.load(f))).then(() => 'ok' as const), timeout]);
  if (result === 'timeout') console.warn('[faces] fonts did not load within 3s; card text uses fallback fonts');
  else console.info('[faces] card fonts ready');
}
