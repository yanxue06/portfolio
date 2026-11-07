import type { SpellId } from '../spells';

// 24x24 line icons for the spell cards.
export const SPELL_ICONS: Record<SpellId, string> = {
  spark: '<path d="M12 2.5 L13.9 10.1 L21.5 12 L13.9 13.9 L12 21.5 L10.1 13.9 L2.5 12 L10.1 10.1 Z" fill="currentColor"/>',
  skip: '<path d="M4 5.5 L10.5 12 L4 18.5 M12 5.5 L18.5 12 L12 18.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  ward: '<path d="M12 2.8 L20.2 7.4 V16.6 L12 21.2 L3.8 16.6 V7.4 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
  lodestar: '<path d="M6.5 3.5 V12.5 a5.5 5.5 0 0 0 11 0 V3.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M4.8 3.5 H8.2 M15.8 3.5 H19.2" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  clap: '<path d="M13.5 2.5 L5 13.2 H11 L10 21.5 L19 10.2 H13 Z" fill="currentColor"/>',
  homeward: '<path d="M3.5 11.5 L12 4 L20.5 11.5 M6.5 9.5 V19.5 H17.5 V9.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 19.5 V14.5 H13.5 V19.5" fill="none" stroke="currentColor" stroke-width="2"/>',
};

export function iconSvg(id: SpellId): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${SPELL_ICONS[id]}</svg>`;
}

// 24x24 line icons for the touch buttons, drawn to sit with the spell icons above.
const UI_ICONS = {
  jump: '<path d="M5.5 13.5 L12 7 L18.5 13.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 18.5 H15.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity="0.6"/>',
  pause: '<path d="M9 6 V18 M15 6 V18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  map: '<path d="M3.5 6.5 L9 4.5 L15 6.5 L20.5 4.5 V17.5 L15 19.5 L9 17.5 L3.5 19.5 Z M9 4.5 V17.5 M15 6.5 V19.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>',
  binder: '<rect x="4" y="6.5" width="10" height="14" rx="2" transform="rotate(-9 9 13.5)" fill="none" stroke="currentColor" stroke-width="1.9"/><rect x="10" y="3.5" width="10" height="14" rx="2" transform="rotate(8 15 10.5)" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.9"/>',
  rotate: '<rect x="7" y="3" width="10" height="18" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.8" transform="rotate(-90 12 12)"/><path d="M4.5 7.5 a8.5 8.5 0 0 1 6 -4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M9.2 2.2 L10.6 3.6 L9.2 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
} as const;

export function uiIcon(id: keyof typeof UI_ICONS): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${UI_ICONS[id]}</svg>`;
}
