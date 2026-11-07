import type * as THREE from 'three';
import type { World } from './world/world';

export type Region = { id: string; name: string; sub: string };

function near(pos: THREE.Vector3, p: { x: number; z: number } | undefined, r: number): boolean {
  if (!p) return false;
  return (pos.x - p.x) ** 2 + (pos.z - p.z) ** 2 < r * r;
}

function isle(world: World, pos: THREE.Vector3, swimming: boolean): Region {
  const L = world.landmarks;
  const island = world.island;
  if (near(pos, L.gate, 22)) return { id: 'gate', name: 'The Threshold', sub: 'Where every player arrives' };
  if (near(pos, L.town, L.town.r + 10)) return { id: 'town', name: 'Tally Harbor', sub: 'Cards, trades, and the best fish on the isle' };
  if (near(pos, L.extra.lighthouse, 32)) return { id: 'lighthouse', name: 'Beacon Bluff', sub: 'The light that brought you here' };
  if (near(pos, L.extra.ruins, 34)) return { id: 'ruins', name: 'Old Mint Ruins', sub: 'Where the island first struck its cards' };
  for (const it of world.structures.islets) {
    if (near(pos, it, it.r + 4) && pos.y > it.y - 3) return { id: 'sky', name: 'Sky Shoals', sub: 'Islands that forgot to stay down' };
  }
  const h = island.heightAt(pos.x, pos.z);
  if (swimming && h < -4) return { id: 'sea', name: 'Open Water', sub: 'The isle is behind you' };
  if (near(pos, L.extra.lake, 42)) return { id: 'lake', name: 'Meadowmere', sub: 'Still water, loud frogs' };
  if (h > 42 || near(pos, L.summit, 30)) return { id: 'peak', name: 'Ante Peak', sub: 'The whole island, all at once' };
  if (island.sample(island.forestMask, pos.x, pos.z) > 0.4) return { id: 'forest', name: 'Whisperwood', sub: 'The trees trade secrets after dark' };
  if (h < 2.4) return { id: 'shore', name: 'Saltglass Shore', sub: 'Bring a jar for the shells' };
  return { id: 'meadows', name: 'The Wild Meadows', sub: 'Wide open, and full of jellyhops' };
}

function sunscar(world: World, pos: THREE.Vector3, swimming: boolean): Region {
  const L = world.landmarks;
  const h = world.island.heightAt(pos.x, pos.z);
  if (near(pos, L.gate, 22)) return { id: 'gate', name: 'Sunscar Gate', sub: 'The sand remembers every footstep' };
  if (near(pos, L.town, L.town.r + 10)) return { id: 'town', name: 'Dustwell', sub: 'Water is the only currency that never fakes' };
  if (near(pos, L.extra.arch, 26)) return { id: 'arch', name: 'The Hollow Arch', sub: 'The wind took a thousand years to make it' };
  if (near(pos, L.extra.oasis, 40)) return { id: 'oasis', name: 'Glassmere Oasis', sub: 'Shade, at last' };
  if (swimming && h < -4) return { id: 'sea', name: 'Open Water', sub: 'The dunes are behind you' };
  if (h > 14) return { id: 'mesa', name: 'The Tablelands', sub: 'Climb up. The view is the prize' };
  if (h < 2) return { id: 'shore', name: 'Saltpan Shore', sub: 'Even the waves look thirsty' };
  return { id: 'dunes', name: 'The Dune Sea', sub: 'Every crest looks like the last one' };
}

function frostveil(world: World, pos: THREE.Vector3, swimming: boolean): Region {
  const L = world.landmarks;
  const island = world.island;
  const h = island.heightAt(pos.x, pos.z);
  if (near(pos, L.gate, 22)) return { id: 'gate', name: 'Frostveil Gate', sub: 'Your breath arrives a second before you do' };
  if (near(pos, L.town, L.town.r + 10)) return { id: 'town', name: 'Hearthhold', sub: 'Every door here is warm' };
  if (near(pos, L.extra.lake, 46)) return { id: 'lake', name: 'The Frozen Mirror', sub: 'Mind your footing' };
  if (near(pos, L.extra.spire, 22)) return { id: 'spire', name: 'Spire of Rime', sub: 'It hums when nobody is listening' };
  if (swimming && h < -4) return { id: 'sea', name: 'Cold Water', sub: 'Get out. Get out now' };
  if (h > 40) return { id: 'peaks', name: 'The Teeth', sub: 'Nothing up here wants company' };
  if (island.sample(island.forestMask, pos.x, pos.z) > 0.4) return { id: 'forest', name: 'Needlewood', sub: 'Snow falls quieter under the pines' };
  if (h < 2) return { id: 'shore', name: 'The Grey Shore', sub: 'Ice floes come and go' };
  return { id: 'snowfields', name: 'The Snowfields', sub: 'Footprints fill in behind you' };
}

function mistmoor(world: World, pos: THREE.Vector3, swimming: boolean): Region {
  const L = world.landmarks;
  const island = world.island;
  const h = island.heightAt(pos.x, pos.z);
  if (near(pos, L.gate, 22)) return { id: 'gate', name: 'Mistmoor Gate', sub: 'The sun is always setting here' };
  if (near(pos, L.town, L.town.r + 12)) return { id: 'town', name: 'Lanternfen', sub: 'Keep to the boardwalks' };
  if (near(pos, L.extra.tree, 26)) return { id: 'tree', name: 'The Old Heart', sub: 'Older than the cards themselves' };
  if (near(pos, L.extra.shrine, 22)) return { id: 'shrine', name: 'The Drowned Shrine', sub: 'Someone still leaves flowers' };
  if (swimming && h < -3) return { id: 'sea', name: 'Dark Water', sub: 'Something big moved down there' };
  if (h > 6) return { id: 'rocks', name: 'Mossback Rocks', sub: 'High and dry, for once' };
  if (island.sample(island.forestMask, pos.x, pos.z) > 0.4) return { id: 'hollows', name: 'The Glowhollows', sub: 'The mushrooms are watching, kindly' };
  if (h < 1) return { id: 'reeds', name: 'The Reedbeds', sub: 'Wet boots are a way of life' };
  return { id: 'fen', name: 'The Fen', sub: 'Every pool reflects a different sky' };
}

/** Named area for the location banner, checked from most specific to least. */
export function regionAt(world: World, pos: THREE.Vector3, swimming: boolean): Region {
  const id = world.land.id;
  if (id === 'sunscar') return sunscar(world, pos, swimming);
  if (id === 'frostveil') return frostveil(world, pos, swimming);
  if (id === 'mistmoor') return mistmoor(world, pos, swimming);
  return isle(world, pos, swimming);
}
