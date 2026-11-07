# CLAUDE.md (island/)

Wildcard Isle is a browser game built with Three.js r187, TypeScript 7 and Vite 8, run with bun. This folder is a self-contained project inside the portfolio repo. It has its own package.json, bun.lock, build and Vercel project (Root Directory `island`, domain island.yxue.ca). It never imports from the personal site at the repo root, and the site never imports from it.

It runs entirely in the browser: no server, no database, no API routes. Saves go in `localStorage`.

## What it is: an original fan game

Wildcard Isle is an unofficial, non-commercial fan game inspired by the Greed Island arc of *Hunter × Hunter*. It borrows the idea (a game-world island, a numbered card binder, one-shot spell cards, an aura meter) and none of the material.

- **Everything you add is original.** Names, characters, cards, spells, lands, towns, dialogue and art. Never use a name, character, card, spell or place from the series, including in comments, test data, file names and commit messages.
- **The fan disclaimer stays.** It is at the top of `README.md`, in `DISCLAIMER` in `src/hud/hud.ts` (title and pause screens), and in the meta description in `index.html`. In the game and its code, those are the only places the series is named.
- Third-party art needs a license that allows this use, recorded in `ASSETS.md`.

## Commands

```bash
bun install
bun run dev        # http://localhost:5174 (--strictPort: exits if the port is taken)
bun run build      # scripts/check-lfs.mjs, then tsc --noEmit, then vite build -> dist/
bun run preview    # serves dist/ at http://localhost:4174
bun run typecheck  # tsc --noEmit
```

The personal site at the repo root uses Vite's default ports (5173 dev, 4173 preview), so the game uses 5174 and 4174. Every test script defaults to `http://localhost:5174`. Set `URL=` to point one somewhere else.

## Code map

| Path | What it does |
|---|---|
| `src/main.ts` | Boot, game loop, modes (intro, select, play, binder, map, paused, loading), character select, land travel, sun placement, `window.__isle` |
| `src/world/lands/` | One generator per land (`isle`, `sunscar`, `frostveil`, `mistmoor`): height, landmarks, paths, shading. `defs.ts` is the registry |
| `src/world/` | `world.ts` builds a land and answers physics queries. `assets.ts` loads HDR skies and texture arrays. Also terrain, ez-tree forests, grass, rocks, props, water, buildings, weather particles, colliders |
| `src/characters/` | The six travelers. `roster.ts` (names, perks, model and portrait paths), `vrmModel.ts` (VRM load and cleanup), `retarget.ts` (Mixamo clips onto VRM bones), `poseLayers.ts`, `vrmAvatar.ts`. `lab.ts` runs `tools/character-lab.html` |
| `src/player/` | Input, the movement controller (`player.ts`), the touch controls (`touch.ts`), and the primitive stand-in body (`avatar.ts`) that `?char=none` uses |
| `src/cards/` | The 60-card catalog, canvas-drawn card faces, the daily deal (`daily.ts`), pickups and the binder save (`cards.ts`) |
| `src/hud/` | HUD, minimap, binder, world map, character select, loading screen, and the pause screen with the Graphics picker |
| `src/quality.ts` | The `high`, `medium` and `low` presets, a first guess from the GPU's name, and the `Governor` |
| `src/render.ts` | Renderer and post chain: N8AO at half resolution (or a plain RenderPass when AO is off), bloom, the output pass with the color grade folded in, SMAA |
| `src/spells.ts` `critters.ts` `fx.ts` `sfx.ts` `camera.ts` `regions.ts` | Spell table and casting, jellyhops, particles, synthesized sound (no audio files), orbit camera, named areas |

The governor samples fps in 2 s windows during play. Under 42 fps it lowers the render scale in steps of 0.1, down to 0.65. If the game is still slow after that, it drops the preset one step, but only when the player picked Auto. Above 56 fps for 6 s it raises the render scale again. It never raises the preset.

## Testing through `window.__isle`

When boot finishes, `main.ts` sets `window.__isle` with `ready: true`. The scripts drive the game through it: `state()`, `teleport(x, z)`, `look`, `lookAt`, `pitch`, `travel(land)`, `cast(spell)` (refills aura and clears the cooldown), `pick(id)`, `setMode`, `setQuality`, `holdResolution(true)` (pauses the governor), `landmarks`, `house()`, `stairs()`, `islets`, `cotd()`, `scatterCards`, `critterAhead`, and `three` (`scene`, `sun`, `renderer`, `composer`) for perf experiments. The character lab has its own handle, `window.__lab`.

| URL flag | Effect |
|---|---|
| `?autoplay` | Test mode: skips the title and character select, never asks for pointer lock |
| `?char=none` | The stand-in body with every perk at 1. Physics baselines need it |
| `?char=<id>` `?land=<id>` `?day=YYYY-MM-DD` `?name=` | Traveler, starting land, which day's deal, player name |
| `?quality=low\|medium\|high\|auto` | Forces a preset for this visit. Otherwise: the saved pick, then a guess from the GPU |
| `?touch` | Turns the touch controls on, for trying them on a desktop. Phones and tablets get them anyway |
| `?uncapped` | Turns off the medium/low frame cap, so a script can measure raw speed with vsync off |

| Script | What it checks | Success |
|---|---|---|
| `physics.mjs` | Walk and sprint distance, jump and double-jump height, landing, a house wall blocks, outside stairs reach the roof, swimming offshore, standing on an islet, all five spells cast, Ren's +10% speed | `15/15 checks passed` |
| `flow.mjs` | The real menus, no `?autoplay`: title, select, pick Momo, type a name, play, binder, close, pause, resume. The pick and name are saved | `no console errors` |
| `lands.mjs` | Travels to all four lands and screenshots each gate, town and summit | `no console errors` |
| `touch.mjs` | Pixel 7 in Chromium and iPhone 15 in WebKit: menus by tap, stick walk and run, camera drag, pinch, jump, double jump, spell cards, pause/map/binder buttons, and that nothing overlaps either way up | `30/30 checks passed` |
| `shots.mjs` | Screenshots of named scenes, e.g. `node scripts/shots.mjs spawn map cotd` | look at the PNGs |
| `perf.mjs` | fps per preset with the governor paused and the frame cap off. `W=3840 H=2160` makes even a fast GPU pixel-bound, the way a laptop GPU is at 1080p. `GPU=swiftshader` renders on the CPU, too slow for its fps to mean much | read the numbers; compare two builds in alternating runs, because single runs vary by about 8% |
| `lab-shots.mjs` | The character lab at `/tools/character-lab.html`: lineup, gait strips, expressions, foot slip, benchmark | `no console errors` |

- Every script needs `bun run dev` running. All but `perf.mjs` exit 1 on a failed check or any console error.
- Screenshots go to `OUT` (default `./shots/`, gitignored).
- To test the production build: `bun run build && bun run preview`, then `URL='http://localhost:4174/?autoplay=1&char=none' node scripts/physics.mjs`.
- The first run after starting a fresh dev server can die when Vite reloads the page to optimize dependencies. Run it again before you debug anything.

## Assets

- `public/assets/` holds the third-party art: HDR skies, PBR textures, six VRM characters, the Xbot animation clips. Sources and licenses are in `ASSETS.md`. `node scripts/fetch-assets.mjs` downloads it.
- It is committed with **Git LFS** (see `.gitattributes`). Install git-lfs and run `git lfs install` before the first `git add` of `public/assets/`, and check `git lfs ls-files` before committing. Without LFS, git stores the files as plain blobs, and once pushed they stay in the history.
- `public/portraits/` (six small JPEGs) is checked in as plain git.
- The code loads art from absolute paths (`/assets/...`, `/portraits/...`), so the game must be served from the root of a domain, not from a subpath.

## Deploying

- Vercel project with Root Directory `island`, domain island.yxue.ca. `vercel.json` sets the Vite preset, `bun install`, `bun run build` and the `dist` output.
- Ship through git pushes. A `vercel deploy` from this folder uploads the source, art included (63 MB), and Vercel's limits page lists a 100 MB cap for CLI uploads on Hobby.
- **Ignored Build Step:** `git diff --quiet "${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}" HEAD -- .` (`ignoreCommand` in `vercel.json`) runs inside `island/`, and exit 0 skips the build. It diffs against the last deployed commit, so island changes anywhere in a push get built; it falls back to `HEAD^` when Vercel doesn't provide one. If a deploy is ever wrongly skipped, redeploy with "Use project's Ignore Build Step" unchecked.
- **Git LFS has to be on** in the project's settings (Settings > Git), followed by a redeploy. With it off the build gets LFS pointer files, and `scripts/check-lfs.mjs` fails the build rather than ship a game with no art.
- **Cache headers** (in `vercel.json`):
  - `.js` and `.css` files at the top level of `/assets/` are Vite's hashed bundles: `max-age=31536000, immutable`.
  - Everything in a subfolder of `/assets/`, and `/portraits/`: `max-age=604800, must-revalidate`, a week and then a cheap revalidation.
  - `index.html` keeps Vercel's default and is always revalidated, so a deploy shows up on the next load.
  - Keep `public/assets/` to subfolders. A `.js` or `.css` file at its top level would be cached for a year.
  - Changing a file under `public/assets/` in place? Returning players can keep the old copy for a week. If the code depends on the new bytes, give the file a new name.
  - Vercel strips `stale-while-revalidate` from `Cache-Control` before it reaches the browser, so don't build on it.
- **Download budget.** Hobby's 100 GB a month is shared with yxue.ca. A first visit costs about 19 MB as Vercel serves it (16 MB gzip-everything, measured on a preview), so the plan covers roughly 5,000 first visits a month before the personal site takes its share. Each extra land adds about 10 MB. Where the bytes go:
  - Each character model is 3 to 4.5 MB after `scripts/optimize-assets.mjs`, and the select screen downloads every traveler you click. Trying all six costs about 21 MB.
  - Vercel compresses only an allowlist of types, so `.vrm`, `.glb` and `.hdr` ship raw.
  - The JS bundle is 5.3 MB (3.4 MB gzipped). About 4 MB of it is bark and leaf textures that `@dgreenheck/ez-tree` inlines as base64.
  - Each HDR sky is 4 to 5.5 MB, and every land you travel to loads its own.
  - Returning visits mostly come from the browser cache.
- **GitHub LFS quota.** The free plan includes 10 GiB of LFS bandwidth a month, and each Vercel build downloads the art from GitHub's LFS storage (about 63 MB today, so roughly 160 builds a month). Vercel clones the repo before the Ignored Build Step runs (a skipped build's log shows the clone first), so count every push to main, not just island builds. Whether a skipped build pulls the LFS files wasn't measured; GitHub's usage API needs the `user` scope. With no payment method on the account, running out turns LFS off until the next month, and `check-lfs.mjs` fails every build until then.

## Gotchas

- **AO runs at half resolution thanks to `patches/n8ao@2.0.1.patch`.** Stock n8ao 2.0.1 gives its half-res buffer a `.texture` getter that returns an array; three r187 can't bind that, and one bad frame leaves the renderer stuck. The patch deletes the getter (n8ao itself reads `.textures[i]`). bun applies it on every install through `patchedDependencies` in package.json, Vercel included. Upgrading n8ao or three? Check half-res still runs before you drop the patch.
- **Rendering cost, and the rules that keep it low.** Measured on the M5 Pro: half-res AO cut a third of the high preset's frame. These parts skip work the camera can't see:
  - **Terrain:** 8×8 tile meshes sharing one set of vertex buffers (`terrain.ts`), so three.js frustum-culls each tile. `island.mesh` is a Group.
  - **Near trees:** `Forest.cull()` reorders each 3D list every frame: on-screen trees first, then trees only the shadow map sees. `onBeforeRender` draws the first stretch and `onBeforeShadow` the first two, so a tree behind you still casts its shadow. Never set `nearBark.count` or `nearLeaves.count` anywhere else.
  - **Grass and flowers:** one draw each, in an order sorted for culling (`createField`). Blades sit in 20 random density buckets, each in Z-order over the window. The vertex shader drops blades past the fade or outside `uFrustum` before any other work. `setDensity` moves in steps of 1/20.
  - **Second cameras:** the culling uses the *main* camera. If you add another camera that draws the scene (a mirror, a portal, a photo mode), grass and near trees outside the main view will be missing from it.
  - **Low preset:** `terrainLite` reads each terrain layer once instead of twice, and cliffs from one face instead of three.
  - **Frame cap:** medium and low skip frames on 120 Hz and faster screens (`capFrames`, `MIN_FRAME_MS` in main.ts).
  - **Menus:** pause, binder and map hold the last frame instead of redrawing it. Anything that should still move behind a menu has to reset `stillFrames`.
- **Keep the hemisphere light.** MToon, the material on the VRM characters, ignores `scene.environment`, so the sky's image-based light never reaches them. The hemisphere light in `main.ts`, retuned per land in `World.applyAtmosphere`, is their only fill light. Remove it or zero it and the characters lose their fill.
- **The sun's shadow camera is texel-snapped.** `placeSun` in `main.ts` moves it in whole shadow-map texels so shadow edges hold still as you walk. Resizing the frustum or the map is fine. Dropping the snap brings the shimmer back.
- **Headless Chrome needs the real GPU.** Launch Playwright with `channel: 'chrome'` and `--use-angle=metal` (the scripts also pass `--ignore-gpu-blocklist`). Without them Chrome renders in software and the fps numbers mean nothing.
- **Block the HMR websocket while files are being edited.** Vite reloads a test page when a file it uses changes, which wrecks a run while another session edits `src/`. Call `await page.routeWebSocket(/.*/, () => {})` before `page.goto`. `lab-shots.mjs` does this.
- **Physics tests run with `?char=none`.** The stand-in body has every perk at 1, so the distances are baselines. The last check puts on Ren on purpose to measure his perk.
- **`public/portraits/` is checked in.** The character select shows these before any model loads, and they stay in plain git, not LFS.
- **Touch controls only exist on touch-first devices.** `prefersTouch()` in `src/player/touch.ts` (a coarse pointer, or touch with no mouse) or the first touch on the page turns them on and adds `touch` to `<html>`. Every touch style is under `.touch`, so a desktop never sees them. They feed `Input` the way keys do: `input.press(code)` / `input.release(code)` for buttons (a tap shorter than a frame still counts), and `input.stickX/stickY` for the analog stick. Pointer lock is skipped on touch, since iOS Safari doesn't have it.
- **Saves are versioned.** The binder lives in `localStorage` under `wildcard-isle:v1`. If its shape changes without a migration, `cards.ts` throws the save away and the player starts over, and renaming the key does the same. The other keys are `wildcard-isle:character`, `wildcard-isle:name` and `wildcard-isle:quality`.
- **The daily deal is a pure function of the date and the catalog.** `dealFor` in `cards/daily.ts` seeds an RNG with the date and draws from `CARDS`. Editing the catalog or the draw order reshuffles every day's deal, today's included, and the save records today's finds as positions in that deal. Check a change with `?day=` before shipping it.
