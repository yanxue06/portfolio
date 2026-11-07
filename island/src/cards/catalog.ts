import type { LandId } from '../world/lands/types';

// The binder: 60 numbered cards across four lands. All names, art and text are
// original to this fan project. Habitat decides where in its land a card is dealt.

export type Rarity = 'common' | 'uncommon' | 'rare' | 'mythic';
export type Habitat =
  | 'meadow'
  | 'beach'
  | 'forest'
  | 'mountain'
  | 'town'
  | 'ruins'
  | 'sky'
  | 'summit'
  | 'open'
  | 'high'
  | 'landmark';

export type CardDef = {
  no: number;
  name: string;
  rarity: Rarity;
  habitat: Habitat;
  emoji: string;
  flavor: string;
  land: LandId;
};

type Raw = Omit<CardDef, 'land'>;

const ISLE_CARDS: Raw[] = [
  { no: 1, name: 'Lantern Moth', rarity: 'common', habitat: 'meadow', emoji: '🦋', flavor: 'Glows brighter near anything you would rather keep secret.' },
  { no: 2, name: 'Saltglass Shell', rarity: 'common', habitat: 'beach', emoji: '🐚', flavor: "Hold it to your ear and it hums tomorrow's weather." },
  { no: 3, name: 'Hearth Seed', rarity: 'common', habitat: 'meadow', emoji: '🌱', flavor: 'Plant it anywhere and a warm room slowly grows around it.' },
  { no: 4, name: 'Whistling Stone', rarity: 'common', habitat: 'mountain', emoji: '🪨', flavor: 'Skips across water forever if you throw it just right.' },
  { no: 5, name: "Tidecaller's Bell", rarity: 'uncommon', habitat: 'beach', emoji: '🔔', flavor: "One ring pulls the sea back an arm's length." },
  { no: 6, name: 'Mossback Tortoise', rarity: 'common', habitat: 'forest', emoji: '🐢', flavor: 'Carries a small, well-kept garden. Do not rush it.' },
  { no: 7, name: 'Ember Apple', rarity: 'common', habitat: 'forest', emoji: '🍎', flavor: 'Stays warm all winter. Never eat it in one bite.' },
  { no: 8, name: 'Cloud Loom', rarity: 'rare', habitat: 'sky', emoji: '☁️', flavor: 'Weaves fog into cloth light enough to fly as a kite.' },
  { no: 9, name: 'Echo Lily', rarity: 'common', habitat: 'meadow', emoji: '🪷', flavor: 'Repeats the last kind thing anyone said near it.' },
  { no: 10, name: 'Sundial Key', rarity: 'uncommon', habitat: 'ruins', emoji: '🗝️', flavor: 'Opens any door on the island, but only at noon.' },
  { no: 11, name: 'Gilded Beetle', rarity: 'common', habitat: 'forest', emoji: '🪲', flavor: 'Polishes every coin it finds and keeps the best ones.' },
  { no: 12, name: 'Wishing Coin', rarity: 'uncommon', habitat: 'town', emoji: '🪙', flavor: 'Always comes back to the hand that threw it. Eventually.' },
  { no: 13, name: 'Driftwood Crown', rarity: 'uncommon', habitat: 'beach', emoji: '👑', flavor: 'Fits whoever found it first, and nobody after.' },
  { no: 14, name: 'Starfall Pear', rarity: 'uncommon', habitat: 'meadow', emoji: '🍐', flavor: 'Ripens only on nights with a meteor shower.' },
  { no: 15, name: 'Mirror Koi', rarity: 'common', habitat: 'town', emoji: '🐟', flavor: 'Swims in reflections, never in the water itself.' },
  { no: 16, name: 'Thunder Acorn', rarity: 'uncommon', habitat: 'forest', emoji: '⚡', flavor: 'Plant it and the oak grows in one very loud second.' },
  { no: 17, name: 'Paper Crane Map', rarity: 'rare', habitat: 'ruins', emoji: '🗺️', flavor: 'Folds itself toward wherever you meant to go.' },
  { no: 18, name: 'Fogbottle', rarity: 'common', habitat: 'beach', emoji: '🫙', flavor: 'A whole morning, corked. Uncork it to disappear.' },
  { no: 19, name: 'Ironbark Shield', rarity: 'uncommon', habitat: 'forest', emoji: '🛡️', flavor: 'Bark that turns a blade and grows back by Tuesday.' },
  { no: 20, name: 'Lullaby Conch', rarity: 'common', habitat: 'beach', emoji: '🎶', flavor: 'Puts the loudest thing nearby gently to sleep.' },
  { no: 21, name: 'Sand of Yesterday', rarity: 'rare', habitat: 'ruins', emoji: '🏜️', flavor: 'A pinch makes the last minute happen again, slower.' },
  { no: 22, name: 'Moonmilk Flask', rarity: 'uncommon', habitat: 'mountain', emoji: '🥛', flavor: 'Mends any bruise. Tastes like cold light.' },
  { no: 23, name: 'Prism Feather', rarity: 'rare', habitat: 'sky', emoji: '🪶', flavor: 'Splits sunlight into seven quieter colors.' },
  { no: 24, name: 'Rootheart', rarity: 'uncommon', habitat: 'forest', emoji: '🌳', flavor: 'Beats once a season, and every tree on the isle hears it.' },
  { no: 25, name: 'Glassblown Fox', rarity: 'rare', habitat: 'meadow', emoji: '🦊', flavor: 'Clear as a window. Only seen when it wants to be.' },
  { no: 26, name: "Wanderer's Compass", rarity: 'common', habitat: 'town', emoji: '🧭', flavor: "Points at the nearest card you don't own yet." },
  { no: 27, name: 'Never-Melt Ice', rarity: 'uncommon', habitat: 'mountain', emoji: '🧊', flavor: 'Cold forever, wet never.' },
  { no: 28, name: "Dragon's Hiccup", rarity: 'common', habitat: 'town', emoji: '🌶️', flavor: 'One bite and you breathe sparks for an hour.' },
  { no: 29, name: "Tollkeeper's Seal", rarity: 'mythic', habitat: 'sky', emoji: '🔏', flavor: 'Proof you paid the island everything it asked.' },
  { no: 30, name: 'The Last Card', rarity: 'mythic', habitat: 'summit', emoji: '🃏', flavor: 'Nobody knows what it does. Nobody has finished the binder.' },
];

const SUNSCAR_CARDS: Raw[] = [
  { no: 31, name: 'Glass Scorpion', rarity: 'common', habitat: 'open', emoji: '🦂', flavor: 'Its sting is just a very sharp opinion.' },
  { no: 32, name: 'Mirage Ticket', rarity: 'common', habitat: 'open', emoji: '🎫', flavor: "Admits one to a place that isn't there." },
  { no: 33, name: 'Sunstone Shard', rarity: 'common', habitat: 'high', emoji: '🔆', flavor: 'Warm to the touch long after dark.' },
  { no: 34, name: 'Thirsty Compass', rarity: 'common', habitat: 'town', emoji: '💧', flavor: 'Always points at the nearest water.' },
  { no: 35, name: 'Dune Drum', rarity: 'uncommon', habitat: 'open', emoji: '🥁', flavor: 'Played by the wind every evening at dusk.' },
  { no: 36, name: 'Camelthorn Cup', rarity: 'uncommon', habitat: 'town', emoji: '🏺', flavor: 'Never spills, not even upside down.' },
  { no: 37, name: 'Oasis Lantern', rarity: 'uncommon', habitat: 'landmark', emoji: '🏮', flavor: 'Lights only for travelers who are lost.' },
  { no: 38, name: 'Copper Sun Disc', rarity: 'rare', habitat: 'landmark', emoji: '🌞', flavor: 'Struck in a mint no map remembers.' },
  { no: 39, name: 'Mesa Eagle Plume', rarity: 'rare', habitat: 'high', emoji: '🦅', flavor: 'Dropped from higher than any mesa.' },
  { no: 40, name: 'Sunken Sun Coin', rarity: 'mythic', habitat: 'summit', emoji: '🌅', flavor: 'The first coin the island ever paid out.' },
];

const FROSTVEIL_CARDS: Raw[] = [
  { no: 41, name: 'Snow Hare Charm', rarity: 'common', habitat: 'open', emoji: '🐇', flavor: 'Lands softly, every single time.' },
  { no: 42, name: 'Pine Lantern', rarity: 'common', habitat: 'open', emoji: '🌲', flavor: 'A cone that glows when the cold sets in.' },
  { no: 43, name: 'Icicle Quill', rarity: 'common', habitat: 'high', emoji: '✒️', flavor: 'Writes in frost on any window.' },
  { no: 44, name: 'Hearth Mitten', rarity: 'common', habitat: 'town', emoji: '🧤', flavor: 'Always warm, never matched.' },
  { no: 45, name: 'Northern Bell', rarity: 'uncommon', habitat: 'open', emoji: '🛎️', flavor: 'Rings a minute before the snow falls.' },
  { no: 46, name: 'Frozen Echo', rarity: 'uncommon', habitat: 'landmark', emoji: '🔮', flavor: 'Holds one shout, forever.' },
  { no: 47, name: 'Sledge Runner', rarity: 'uncommon', habitat: 'town', emoji: '🛷', flavor: 'Faster downhill than common sense.' },
  { no: 48, name: 'Aurora Thread', rarity: 'rare', habitat: 'landmark', emoji: '🧵', flavor: 'Stitch it into a coat and the coat glows green.' },
  { no: 49, name: 'Wolf-Moon Medal', rarity: 'rare', habitat: 'high', emoji: '🌕', flavor: 'Awarded by no one, to the bravest.' },
  { no: 50, name: 'Crown of Hoarfrost', rarity: 'mythic', habitat: 'summit', emoji: '❄️', flavor: 'Melts only for the rightful head.' },
];

const MISTMOOR_CARDS: Raw[] = [
  { no: 51, name: 'Firefly Jar', rarity: 'common', habitat: 'open', emoji: '✨', flavor: 'Twelve fireflies, one shared opinion.' },
  { no: 52, name: 'Bog Lotus', rarity: 'common', habitat: 'open', emoji: '🌸', flavor: "Blooms only where it shouldn't." },
  { no: 53, name: 'Reed Flute', rarity: 'common', habitat: 'town', emoji: '🎋', flavor: "Plays the marsh's own tune." },
  { no: 54, name: 'Moss Snail', rarity: 'common', habitat: 'open', emoji: '🐌', flavor: 'Carries the slowest secrets on the isle.' },
  { no: 55, name: 'Mushroom Lantern', rarity: 'uncommon', habitat: 'open', emoji: '🍄', flavor: "Glows brighter when you're kind to it." },
  { no: 56, name: 'Heron Plume', rarity: 'uncommon', habitat: 'high', emoji: '🦢', flavor: 'Points north when held loosely.' },
  { no: 57, name: 'Stilt-Walker Boots', rarity: 'uncommon', habitat: 'town', emoji: '👢', flavor: "You'll never get your socks wet again." },
  { no: 58, name: 'Wisp in a Bottle', rarity: 'rare', habitat: 'landmark', emoji: '💫', flavor: 'Follows you home if you let it.' },
  { no: 59, name: 'Heartwood Seed', rarity: 'rare', habitat: 'summit', emoji: '🌰', flavor: 'Grows a tree with a door in it.' },
  { no: 60, name: 'Lantern of the First Night', rarity: 'mythic', habitat: 'landmark', emoji: '🕯️', flavor: 'Lit before the island had a name.' },
];

export const CARDS: CardDef[] = [
  ...ISLE_CARDS.map((c) => ({ ...c, land: 'isle' as const })),
  ...SUNSCAR_CARDS.map((c) => ({ ...c, land: 'sunscar' as const })),
  ...FROSTVEIL_CARDS.map((c) => ({ ...c, land: 'frostveil' as const })),
  ...MISTMOOR_CARDS.map((c) => ({ ...c, land: 'mistmoor' as const })),
];

export const RARITY: Record<Rarity, { label: string; letter: string; color: string; frameA: string; frameB: string; weight: number }> = {
  common: { label: 'Common', letter: 'C', color: '#c9ced8', frameA: '#e9edf3', frameB: '#9aa3b2', weight: 3 },
  uncommon: { label: 'Uncommon', letter: 'U', color: '#5fe0a6', frameA: '#9ff0c8', frameB: '#2f9e72', weight: 1.6 },
  rare: { label: 'Rare', letter: 'R', color: '#6aa8ff', frameA: '#a9cbff', frameB: '#4361d8', weight: 0.55 },
  mythic: { label: 'Mythic', letter: 'M', color: '#ffcf4d', frameA: '#fff0a8', frameB: '#d9881c', weight: 0.3 },
};

export const HABITAT: Record<Habitat, { label: string; hint: string; a: string; b: string }> = {
  meadow: { label: 'Meadow', hint: 'Dealt in the open grass of Meadowmere.', a: '#c8f08a', b: '#4f9a3c' },
  beach: { label: 'Shore', hint: 'Dealt on the sand of Saltglass Shore.', a: '#ffe9b0', b: '#3fb6c4' },
  forest: { label: 'Forest', hint: 'Dealt under the trees of Whisperwood.', a: '#9fd68a', b: '#245c33' },
  mountain: { label: 'Mountain', hint: 'Dealt on the high rock of Ante Peak.', a: '#e6e1d8', b: '#7a7266' },
  town: { label: 'Town', hint: 'Dealt somewhere in Tally Harbor. Check the roofs.', a: '#fff1d8', b: '#d9824a' },
  ruins: { label: 'Ruins', hint: 'Dealt in the Old Mint ruins, often up high.', a: '#efe2bf', b: '#8f7a52' },
  sky: { label: 'Sky', hint: 'Dealt on the Sky Shoals floating around Ante Peak.', a: '#e8f4ff', b: '#7aa7ff' },
  summit: { label: 'Summit', hint: 'Only ever dealt at the highest point of its land.', a: '#ffffff', b: '#a7b4c9' },
  open: { label: 'Wilds', hint: 'Dealt somewhere out in the open country.', a: '#f3e6c4', b: '#9a8a62' },
  high: { label: 'Heights', hint: 'Dealt up high: cliff tops, ledges and peaks.', a: '#e8f0ff', b: '#6c7fa8' },
  landmark: { label: 'Landmark', hint: "Dealt at one of the land's landmarks.", a: '#fff0cf', b: '#b4853f' },
};

export function cardNo(no: number): string {
  return `No.${String(no).padStart(3, '0')}`;
}

export function cardByNo(no: number): CardDef {
  const card = CARDS.find((c) => c.no === no);
  if (!card) throw new Error(`[cards] no card #${no}`);
  return card;
}
