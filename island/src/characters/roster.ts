// The playable cast. Every model is a CC0 VRoid sample avatar (license checked in
// each file's VRM meta), so names, titles and bios here are all original.

export type CharacterId = 'ren' | 'haru' | 'nova' | 'shion' | 'lumi' | 'momo';

/** Numeric multipliers applied by gameplay code. 1 means "no change". */
export type CharacterPerks = {
  speed: number; // walk and run speed
  jump: number; // jump velocity
  skipRange: number; // Skip (blink) distance
  lodestarRadius: number; // Lodestar pull radius
  auraRegen: number; // aura regeneration rate
  wardDuration: number; // Bubble Ward duration
  sparkDamage: number; // Spark Shot damage (base damage is 1)
};

export type CharacterDef = {
  id: CharacterId;
  name: string;
  title: string;
  bio: string;
  model: string; // VRM 0.x file under public/
  portrait: string; // 384 px JPEG face shot, checked in under public/portraits/
  auraColor: string; // hex, unique per character
  perks: CharacterPerks;
  perkLabel: string; // one short line for the character select screen
};

const NO_PERKS: CharacterPerks = {
  speed: 1,
  jump: 1,
  skipRange: 1,
  lodestarRadius: 1,
  auraRegen: 1,
  wardDuration: 1,
  sparkDamage: 1,
};

function perks(changes: Partial<CharacterPerks>): CharacterPerks {
  return { ...NO_PERKS, ...changes };
}

export const ROSTER: readonly CharacterDef[] = [
  {
    id: 'ren',
    name: 'Ren Asagiri',
    title: 'The Pathfinder',
    bio: 'Ren has never taken the same trail twice and does not plan to start now. If there is a shortcut on this island, he has already run it.',
    model: '/assets/characters/HairSample_Male.vrm',
    portrait: '/portraits/ren.jpg',
    auraColor: '#3fb6ff',
    perks: perks({ speed: 1.1 }),
    perkLabel: '+10% walk and run speed',
  },
  {
    id: 'haru',
    name: 'Haru Sakurada',
    title: 'The Deep Breath',
    bio: 'Haru naps in sunbeams and insists it counts as training. Annoyingly, his aura refills faster than anyone else’s.',
    model: '/assets/characters/Sakurada_Fumiriya.vrm',
    portrait: '/portraits/haru.jpg',
    auraColor: '#ff8a3d',
    perks: perks({ auraRegen: 1.35 }),
    perkLabel: '+35% aura regen',
  },
  {
    id: 'nova',
    name: 'Nova',
    title: 'The Phase Step',
    bio: 'Nova treats walls as suggestions and distance as a rumor. Blink and you will miss her, which is how she likes it.',
    model: '/assets/characters/Vita.vrm',
    portrait: '/portraits/nova.jpg',
    auraColor: '#a98bff',
    perks: perks({ skipRange: 1.4 }),
    perkLabel: '+40% Skip range',
  },
  {
    id: 'shion',
    name: 'Shion Kurose',
    title: 'The Card Sense',
    bio: 'Shion can hear a card flutter from across the bay. Her Lodestar reaches farther than anyone thinks is fair.',
    model: '/assets/characters/Sendagaya_Shino.vrm',
    portrait: '/portraits/shion.jpg',
    auraColor: '#ffd23f',
    perks: perks({ lodestarRadius: 1.5 }),
    perkLabel: '+50% Lodestar radius',
  },
  {
    id: 'lumi',
    name: 'Lumi Rubin',
    title: 'The Sharpshot',
    bio: 'Lumi rarely needs a second shot, and she will tell you so. Her sparks land twice as hard as everyone else’s.',
    model: '/assets/characters/Victoria_Rubin.vrm',
    portrait: '/portraits/lumi.jpg',
    auraColor: '#ff5c9e',
    perks: perks({ sparkDamage: 2 }),
    perkLabel: 'Spark Shot deals 2 damage',
  },
  {
    id: 'momo',
    name: 'Momo Hinata',
    title: 'The Guardian',
    bio: 'Momo is small, stubborn and very hard to knock over. Her Bubble Ward holds long after everyone else’s has popped.',
    model: '/assets/characters/Vivi.vrm',
    portrait: '/portraits/momo.jpg',
    auraColor: '#4fe3b0',
    perks: perks({ wardDuration: 1.6 }),
    perkLabel: '+60% Ward duration',
  },
];

export const DEFAULT_CHARACTER_ID: CharacterId = 'ren';

/** Looks a character up by id. Throws on an unknown id (a typo should fail loudly). */
export function characterById(id: string): CharacterDef {
  for (const def of ROSTER) {
    if (def.id === id) return def;
  }
  throw new Error(`[roster] unknown character id "${id}" (known: ${ROSTER.map((d) => d.id).join(', ')})`);
}
