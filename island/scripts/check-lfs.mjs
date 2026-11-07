// Fails the build when public/ holds Git LFS pointer files instead of the real art.
// That is what a build sees when the Vercel project's Git LFS setting is off, or when the
// GitHub LFS quota has run out: the build would pass and ship a game with no models or skies.
// Usage: node scripts/check-lfs.mjs   (the first step of `bun run build`)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));
const HEADER = 'version https://git-lfs.github.com/spec/v1';

/** Every file under dir, depth first. */
function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile()) yield p;
  }
}

const pointers = [];
if (fs.existsSync(PUBLIC)) {
  const head = Buffer.alloc(HEADER.length);
  for (const file of walk(PUBLIC)) {
    const fd = fs.openSync(file, 'r');
    const n = fs.readSync(fd, head, 0, head.length, 0);
    fs.closeSync(fd);
    if (n === head.length && head.toString('latin1') === HEADER) pointers.push(path.relative(PUBLIC, file));
  }
}

if (pointers.length) {
  console.error(`[check-lfs] ${pointers.length} file(s) in public/ are Git LFS pointers, not the art itself:`);
  for (const p of pointers.slice(0, 5)) console.error(`  public/${p}`);
  if (pointers.length > 5) console.error(`  ...and ${pointers.length - 5} more`);
  console.error('[check-lfs] On Vercel: enable Git LFS in the project settings (Settings > Git), then redeploy.');
  console.error('[check-lfs] Also check the GitHub LFS bandwidth quota. Locally: install git-lfs, then `git lfs pull`.');
  process.exit(1);
}
