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
