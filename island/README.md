# Wildcard Isle

A browser game where four lands deal a new hand of cards every day. You pick one of six travelers and cross between the lands through the Gates. Each day you look for 21 cards, pop jellyhops for spares, and use spell cards to get around. Progress lives in a 60-slot binder.

> **Fan game disclaimer.** Wildcard Isle is an unofficial, non-commercial fan project inspired by Greed Island from *Hunter × Hunter* by Yoshihiro Togashi. It is not affiliated with or endorsed by the creator, Shueisha, VIZ Media or the anime studios. It borrows the *idea*: a game-world island, a numbered card binder, one-shot spell cards and an aura meter. It borrows none of the material. Every name, character, card, location and piece of art here is original or openly licensed (see [ASSETS.md](ASSETS.md)).

The game lives in the `island/` folder of [yanxue06/portfolio](https://github.com/yanxue06/portfolio), next to the personal site at the repo root. It has its own package.json, lockfile and build, and it deploys to island.yxue.ca as its own Vercel project. It runs entirely in the browser: no server, no database, and saves go in `localStorage`.

## Run it

```bash
cd island
bun install
bun run dev        # http://localhost:5174
bun run build      # LFS check, type-check, production bundle in dist/
bun run preview    # serves dist/ at http://localhost:4174
```

The ports are 5174 and 4174 because the personal site at the repo root uses Vite's defaults, 5173 and 4173.

The art under `public/assets/` (CC0 skies, textures and character models) is stored with Git LFS. Install [git-lfs](https://git-lfs.com) before you clone, or run `git lfs pull` afterwards. `node scripts/fetch-assets.mjs` downloads the art from its original sources instead (see [ASSETS.md](ASSETS.md)).

URL flags:

- `?land=sunscar` starts in another land.
- `?char=lumi` picks a character.
- `?day=2026-11-20` previews another day's deal.
- `?quality=low` forces a graphics preset for this visit (`low`, `medium`, `high` or `auto`). Without it the game uses your saved pick, or guesses from the GPU and lowers the render scale, then the preset, if the frame rate drops.
- `?autoplay` skips the title and character screens (the test scripts use it). Add `&char=none` to play with the plain stand-in body and no perks.

## The lands

| Land | Look | Town |
| --- | --- | --- |
| Wildcard Isle | meadows, pine woods, a crag, a lighthouse, ruins, floating Sky Shoals | Tally Harbor |
| Sunscar Expanse | wind-combed dunes, four mesas, an oasis, a stone arch | Dustwell |
| Frostveil | snow peaks, pine valleys, a frozen lake, an ice spire | Hearthhold |
| Mistmoor | golden-hour marsh, reed beds, glowing mushrooms, a giant old tree | Lanternfen, on stilts |

Press **T** for the world map and travel to any land. Each land deals 5 cards a day, plus the Card of the Day in one of them.

## The travelers

Six characters, each with one perk:

| Name | Perk |
| --- | --- |
| Ren | +10% walk and run speed |
| Haru | +35% aura regen |
| Nova | +40% Skip range |
| Shion | +50% Lodestar radius |
| Lumi | Spark Shot deals 2 damage |
| Momo | +60% Ward duration |

The models are CC0 VRoid samples. The names, bios and perks are original. Your pick is saved in `localStorage`.

## Controls

| Key | Action |
| --- | --- |
| W A S D | Move (camera-relative) |
| Shift | Sprint |
| Space | Jump, press again in the air to double jump |
| Mouse / wheel | Orbit camera / zoom |
| LMB or 1 | **Spark Shot**: aura bolt that curves toward critters |
| Q | **Skip**: blink 13 m where you look; refreshes your air jump |
| E | **Bubble Ward**: 5 s shield, critters bounce off |
| R | **Lodestar**: pulls every card within 45 m to you |
| F | **Thunderclap**: ground slam; cast mid-air to dive first |
| H | **Homeward**: stand still 1.5 s to return to this land's Gate |
| T | World map and travel |
| Tab / B | Binder |
| M | Mute |

## How a day works

`src/cards/daily.ts` seeds an RNG with the local date, so everyone gets the same deal on the same day. The deal is one **Card of the Day** (always rare or mythic, marked by a tall beam) plus 5 cards per land. Cards are placed by habitat: meadow, shore, forest, high ground, towns, landmarks. Collected cards and today's finds are saved in `localStorage`. The binder's "Copy today's result" button produces a shareable grid.

## Code map

```
src/
  main.ts              boot, game loop, modes, character select, land travel, debug handle
  quality.ts           graphics presets, a first guess from the GPU, the frame-rate governor
  render.ts            renderer + post: N8AO ambient occlusion, bloom, grade, ACES, SMAA
  camera.ts            third-person orbit camera with terrain collision
  fx.ts sfx.ts         particles and a WebAudio synth (no audio files)
  spells.ts            spell table + cast dispatch (reads the character's perks)
  critters.ts          jellyhops: hop AI, contact damage, card drops
  regions.ts           named areas per land for the location banner
  characters/          roster, VRM loading, Mixamo clips retargeted to VRM bones, pose layers
  world/
    lands/             one generator per land (height, landmarks, paths, shading) + defs.ts registry
    world.ts           builds a land (sky, terrain, structures, foliage, water) + physics queries
    assets.ts          HDRI skies (sun direction, fog color) and PBR texture arrays
    terrain.ts         heightfield, masks, minimap
    terrainMaterial.ts 5-layer PBR splat shader with triplanar rock
    trees.ts           ez-tree forests: instanced near trees, baked impostors far away
    rocks.ts props.ts  rocks with moss/sand/snow caps; cacti, mushrooms, lily pads
    foliage.ts         GPU grass and flowers, placement rules per land
    structures.ts      Gate, Tally Harbor, lighthouse, ruins, Sky Shoals, summit
    landStructures.ts  Dustwell, Hearthhold, Lanternfen and their landmarks
    water.ts ambient.ts collision.ts
  player/              input, controller (coyote time, jump buffer, double jump, swim), stand-in body
  cards/               catalog (60 cards), card faces, daily deal, pickups + binder save
  hud/                 HUD, minimap, binder, world map, character select, loading screen, graphics menu
tools/character-lab.html   standalone page for tuning character animation (dev server only)
scripts/
  fetch-assets.mjs     downloads the CC0 art into public/assets/
  check-lfs.mjs        fails the build if public/ holds Git LFS pointer files instead of art
  physics.mjs          movement checks (speeds, jumps, walls, stairs, swim, spells, a perk)
  flow.mjs             title -> character select -> play -> binder -> pause -> resume
  lands.mjs            travels to every land and screenshots the gate, town and a high view
  shots.mjs            headless Chrome screenshots of named scenes
  perf.mjs             frame rate per graphics preset
  lab-shots.mjs        screenshots of the character lab
```

The test scripts drive the game through `window.__isle`. Start `bun run dev` first: they default to `http://localhost:5174`, and `URL=` points them somewhere else.

```bash
node scripts/physics.mjs
node scripts/flow.mjs
OUT=./shots node scripts/lands.mjs
OUT=./shots node scripts/shots.mjs spawn map cotd
```

## Deploy

island.yxue.ca is a Vercel project with its Root Directory set to `island`. `vercel.json` sets the build (`bun install`, `bun run build`, output `dist`), the cache headers, and an Ignored Build Step that skips the build when the last commit didn't touch `island/`. Git LFS has to be turned on in the project's Git settings. Without it the build gets pointer files instead of the art, and `check-lfs.mjs` stops the build.
