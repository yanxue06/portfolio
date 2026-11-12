# CLAUDE.md

This repo holds two separate sites that deploy as two separate Vercel projects:

| Folder | What it is | Vercel project root | Domain |
|---|---|---|---|
| `/` (repo root) | Personal site, v3 | `.` | yxue.ca |
| `island/` | Greed Island simulation (browser game) | `island` | island.yxue.ca |

They share a Git repo and nothing else. Neither one imports from the other.

```
portfolio/
├── CLAUDE.md          ← this file
├── index.html         ← personal site entry (meta, favicons)
├── src/               ← personal site code
│   ├── main.tsx       ← fonts, analytics, LazyMotion, click tracking
│   ├── App.tsx        ← scroll-driven cream/navy theme morph
│   ├── components/    ← one file per section + the scene pieces
│   └── lib/hits.ts    ← client side of the visit/click counter
├── api/hits.ts        ← Vercel Function for the counter (Vercel Blob)
├── public/            ← favicons, logos, project banners
├── screenshots/       ← design snapshots (v5–v12), not used by the build
└── island/            ← the game; self-contained, has its own CLAUDE.md
```

## Personal site (repo root)

### Commands

```bash
bun install
bun run dev       # http://localhost:5173
bun run build     # tsc -b, then vite build → dist/
bun run preview
```

npm works too. Plain `bun run dev` does not serve `/api`; the counter quietly shows nothing. Use `vercel dev` when you need to test `api/hits.ts`.

### Stack

- Vite 5, React 18, TypeScript in strict mode with `noUnusedLocals` and `noUnusedParameters`. Unused imports fail the build.
- Tailwind 3. Brand tokens in `tailwind.config.js`: cream `#F2ECDE`, navy `#0F1E3A`, gold `#C4A35C`.
- Fonts are self-hosted through `@fontsource` (Archivo Variable, Space Mono) and imported in `main.tsx`. The README's mention of Google Fonts is out of date.
- `@vercel/analytics` and `@vercel/speed-insights` are injected in `main.tsx`.

### Rules that are easy to break

- **Use `m.*`, never `motion.*`.** The app runs inside `<LazyMotion features={domAnimation} strict>`. A `motion.div` throws at runtime in dev; production builds strip that check. This keeps framer-motion's full renderer out of the first chunk.
- **Keep shaders lazy.** `@paper-design/shaders-react` (`MeshGradient`, `Water`, `SimplexNoise`) is only ever loaded with `lazy(() => import(...))` behind `Suspense`. Never import it at the top of a file.
- **Color through the theme variables.** `App.tsx` animates `--ink` and `--muted` (and the background) as you scroll. Components use the `ink`, `muted` and `hairline` classes or `var(--ink)`, not hard-coded navy or cream.
- **The hero is the one exception.** It paints its own cream and pins `--ink`/`--muted`, because the page under it is already navy: its land ends in navy and runs straight into `#about`. The nav lives inside the hero (not fixed) for the same reason.
- **Section ids are load-bearing.** `App.tsx` measures `#about`, `#work` and `#footer` to place the color crossfades. Renaming or removing one breaks the morph.
- **Respect reduced motion.** Every animated component checks `useReducedMotion()`. The fallback is the `.static-blocks` class in `index.css`. Keep both working.

### The counter (`api/hits.ts` + `src/lib/hits.ts`)

- Records visits, clicks and likes. The only total the page displays is the like count on the heart button in `Hero.tsx`.
- Every visit, click batch and like batch is written as its own immutable blob (`v/<uuid>`, `c/<n>-<uuid>`, `l/<n>-<uuid>`), and totals come from listing them.
- Do not turn this into a read-modify-write counter. Vercel Blob overwrites are eventually consistent, so a single counter file loses counts under concurrent writes.
- It needs `BLOB_READ_WRITE_TOKEN`, which Vercel sets on the project once a Blob store is connected.
- Browser storage keys: `yx-visited` (sessionStorage) and `yx-likes` (localStorage).

### Style

- Comments are lowercase and conversational, and they explain why, not what. Match that.
- Commit messages are lowercase, one line, describing the change in plain words (e.g. "the favicon is just the sun now — bare gradient orb, no tile").

## Greed Island sim (`island/`)

- Has its own `package.json`, lockfile, build and `CLAUDE.md`. Read `island/CLAUDE.md` before working in it.
- Builds to `island/dist/`. Runs fully in the browser, with no server and no database. Saves go in browser storage.
- Lives on its own origin (island.yxue.ca), so its storage never mixes with the personal site's.

## Keeping the two apart

- The root `tsconfig.json` and `tailwind.config.js` only look at `src/` and `index.html`. Keep it that way so the site's build never touches `island/`.
- Don't add a root workspace or a shared package. If both sides need the same thing, copy it.
- Large binary assets for the game (textures, models, audio) go under `island/` and are tracked with Git LFS if they get big.

## Deploying (Vercel)

Both projects deploy from `main` on every push. An Ignored Build Step on each one skips the build when nothing on its side changed (exit 0 means skip):

| Project | Root Directory | Ignored Build Step |
|---|---|---|
| yxue.ca | `.` | `git diff --quiet "${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}" HEAD -- . ':(exclude)island'` |
| island.yxue.ca | `island` | `git diff --quiet "${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}" HEAD -- .` |

Each project's ignore step lives in `ignoreCommand` in its `vercel.json` (with an `echo` of the base commit in front, for the build log). It diffs against the last deployed commit when Vercel provides one, and falls back to `HEAD^`. Plain `HEAD^` only sees the last commit in a push, so a push that ends with a site-only commit would skip an island change made earlier in the same push.

Hobby plan: 100 GB/month of bandwidth is shared by both sites, so keep the game's download size in check.
