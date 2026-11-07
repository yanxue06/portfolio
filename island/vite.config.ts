import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // One chunk is fine for a single-page game, but it is ~5.3 MB: about 4 MB of that is the
    // bark and leaf textures @dgreenheck/ez-tree inlines as base64. The limit stays low so the
    // warning keeps saying so. Vite writes this chunk into dist/assets/ next to the copied art
    // from public/assets/; vercel.json tells them apart (top-level .js/.css vs subfolders).
    chunkSizeWarningLimit: 900,
  },
});
