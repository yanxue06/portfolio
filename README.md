# yxue.ca — v3

Personal site rebuild. Golden-hour cliff scene, warm rustic palette, lowercase copy, hand-drawn SVG banners per project. Three sections: hero, about, work.

## Run it

```bash
bun install
bun run dev      # http://localhost:5173
bun run build    # type-check + production bundle in dist/
```

npm works too if Bun isn't around.

## Stack

Vite + React 18 + TypeScript, Tailwind 3, framer-motion for animation, lucide-react for icons. Fonts: Almarai (global) and Instrument Serif italic (accents), loaded from Google Fonts in `index.html`. Visuals are inline SVG except `public/banners/` (flux + buildspace banners taken from the old yanxue06.github.io repo) and `public/logos/` (photon/bitgo/hongmall from the old repo, uwaterloo seal from Wikipedia).

## How it's put together

- `src/components/CliffScene.tsx` — the whole hero backdrop is one hand-written SVG: sunset gradient, half-set sun, layered ridges, pines, streak clouds, and a kid sitting off the cliff edge with a backpack and a glowing laptop. `preserveAspectRatio="xMidYMax slice"` keeps the kid and sun in frame when mobile crops the sides. Decorations stay below y≈450 / right of x≈950 so they never touch the hero text.
- `src/components/banners.tsx` — six project banners. flux + buildspace are the real images from the old site (Yan's call: the originals stay, even though flux.webp is 8KB and soft at card size); the other four are hand-coded SVG: terminal window with a ★ in the titlebar (git-semantic), purple constellation (obsidian-mcp), typing bubble + 1.3K★ (imessage-kit), the game in a mac window (flappy code).
- `src/components/Hero.tsx` — scene + name + tagline + footnote. The asterisk gets answered.
- `src/components/About.tsx` — warm card, serif-italic heading, per-character scroll reveal, "where i've been" rows.
- `src/components/Work.tsx` — bento grid on a night gradient, ordered by weight: buildspace wide on top, git-semantic + obsidian-mcp tall side by side, then flux / imessage-kit / flappy compact 3-across. Emphasis comes from position and size only — no badges or labels. Copy and numbers come from the resume in `~/Desktop/Job Automation/data/resume.tex`.
- `src/components/WordsPullUp.tsx` / `WordsPullUpMultiStyle.tsx` — staggered word pull-up used by the headings.

## Interactions

- Scroll parallax: CliffScene's layers (sky/sun, clouds+birds, far range, mid hills) are `motion.g` groups driven by the hero's `useScroll`; the cliff and kid stay anchored. Hero text translates up and fades as you leave.
- Mouse parallax: the whole scene drifts a few px against the cursor (spring-smoothed, desktop only).
- The "say hello" pill is magnetic — it leans toward the cursor.
- Work cards lift on hover (framer spring) with a slow banner zoom and border/shadow shift; experience rows tint and their logos scale; nav links get an underline sweep.
- Everything checks `prefers-reduced-motion` except the tiny CSS loops (sun glow, bird drift, screen flicker).

## Notes

- Words inside the pull-up spans are joined with U+00A0 (non-breaking space), written as a unicode escape in the JSX. A plain space collapses inside `inline-block` and the words fuse together; don't "simplify" it.
- The kid's coordinates live around x 566-630, y 575-680 in CliffScene's 1440x900 viewBox — nudge there if the pose ever needs adjusting.
- iMessage-Kit lives at github.com/photon-hq/imessage-kit (found via the resume). Photon's backing is Google, Vercel + Sequoia — per Yan, June 2026; the resume's "YC + Sequoia" line is outdated.

## Screenshots

Latest verification shots live in `screenshots/` (desktop hero, kid close-up, project cards, mobile).
