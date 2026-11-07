# Assets and licenses

Everything under `public/assets/` comes from the sources below. `node scripts/fetch-assets.mjs` downloads the full-size originals, `node scripts/optimize-assets.mjs` shrinks them in place, and the shrunk files are the ones committed (Git LFS, see `.gitattributes`). The six character portraits in `public/portraits/` are checked in as plain git. They are renders of the models below.

| What | Where it comes from | License |
| --- | --- | --- |
| Sky HDRIs: `kloofendal_48d_partly_cloudy_puresky`, `syferfontein_18d_clear_puresky`, `kloofendal_38d_partly_cloudy_puresky`, `belfast_sunset_puresky` | [Poly Haven](https://polyhaven.com/hdris) | CC0 |
| Ground, rock and building textures (24 sets: diffuse, normal, AO/rough/metal) | [Poly Haven](https://polyhaven.com/textures) | CC0 |
| Character models: 6 VRoid sample avatars (`HairSample_Male`, `Sakurada_Fumiriya`, `Vita`, `Sendagaya_Shino`, `Victoria_Rubin`, `Vivi`) | pixiv VRoid Studio samples, mirrored at [madjin/vrm-samples](https://github.com/madjin/vrm-samples) | CC0. Each file's VRM meta says `licenseName: CC0`, commercial use allowed, usable by everyone. Checked on Nov 6 2026. The shipped files are re-encoded copies (smaller textures, same meta). |
| Animation clips: idle, walk, run | `Xbot.glb` from the [three.js examples](https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf), originally from Adobe Mixamo. The shipped file keeps only these three clips. | Mixamo terms: royalty free inside a project, not for resale or redistribution as standalone files |
| Water normal map | `waternormals.jpg` from the three.js examples | three.js repo (MIT) |
| Trees | [`@dgreenheck/ez-tree`](https://github.com/dgreenheck/ez-tree) (npm), which bundles its own bark and leaf textures | MIT |
| Fonts: Cinzel, Nunito | Google Fonts | SIL Open Font License |

The character names, bios and perks are original to this project. The Hunter × Hunter fan disclaimer in the README covers the inspiration. No art, names or designs come from the series.

## Download size

island.yxue.ca shares the Hobby plan's 100 GB a month with yxue.ca, so the art is shrunk before it ships.

| | Originals | Shipped |
| --- | --- | --- |
| First visit (title screen, default land, default character preload) | 42.7 MB | 16.2 MB |
| The same on Vercel, which serves `.vrm`, `.glb` and `.hdr` uncompressed | 47.6 MB | 19.0 MB |
| Each extra land (its terrain textures and sky) | 17.7 MB (19.6 on Vercel) | 8.5 MB (10.3 on Vercel) |
| All six characters (the select screen loads each one you click) | 101 MB | 21.5 MB |
| `public/assets/` on disk | 180 MB | 63 MB |

Measured on a production build with `vite preview`, summing `encodedBodySize` of every resource after the title screen settles, then again after `__isle.travel('mistmoor')`. The preview server gzips `.vrm` and `.hdr`; Vercel's CDN only compresses an allowlist of MIME types (JS, CSS, HTML, JSON, SVG and similar), so the Vercel rows count those files at full size. What's left of a first visit is mostly not art in this folder: the JS bundle (3.4 MB gzipped, about 2.9 MB of it ez-tree's inlined bark and leaf textures) and the land's HDR sky (4.2 to 5.5 MB).

### Running it

```bash
node scripts/fetch-assets.mjs              # downloads missing originals (full size)
node scripts/optimize-assets.mjs           # shrinks them in place, about 75 s
node scripts/optimize-assets.mjs --check   # exits 1 if any file still needs it
```

- **It needs macOS.** JPEG decoding, encoding and the color handling go through `sips` (`/usr/bin/sips`). PNG decoding and encoding, resizing and the GLB/VRM rewriting use Node built-ins only, so there's nothing to install. It won't run on Vercel's Linux build machines, which is fine: the shrunk files are what's committed.
- **Re-runs skip finished files.** Each output carries a marker: a JPEG comment, or `asset.extras.optimizedBy` in a GLB/VRM. The output is deterministic, so the same originals always give byte-identical files.
- **To change the recipe,** edit the constants at the top of the script, move `public/assets/` to the trash, then fetch and optimize again. The marker means it won't redo a file it already shrank, and it always works from the originals.

### What it does to each file

| Files | Change | Why it doesn't show |
| --- | --- | --- |
| `textures/*_diff_1k.jpg` | Re-encoded at 1024 px, 4:2:0, sips quality 70 (about libjpeg q90) | The originals are q95 to q99. Terrain layers are tinted, blended and mipmapped on top |
| Terrain `*_nor_gl_1k.jpg` | 1024 px, 4:4:4, sips quality 60 (about libjpeg q86) | 4:4:4 keeps the X and Y components at full resolution. At 512 px the ground near the camera visibly lost relief in A/B shots, because the packer in `src/world/assets.ts` upsamples every layer back to 1024 |
| Building normals (`plastered_wall_04`, `white_sandstone_bricks`, `wood_planks`, `clay_roof_tiles`, from `src/world/surfaces.ts`) | 512 px, 4:2:0, sips quality 75 | The triplanar detail tiles every ~2 m, so 512 px is still about one texel per screen pixel at the closest camera distance (3.5 m) |
| `*_arm_1k.jpg` | 512 px, 4:4:4, sips quality 60 | AO and roughness are soft. 4:4:4 matters: AO lives in the red channel, and 4:2:0 halves its resolution |
| `characters/*.vrm` | Embedded images capped at 1024 px (2048 px body, normal and outfit maps halved). JPEG wherever alpha can't matter (opaque materials, or alpha all 255); PNG, losslessly re-compressed, where it does. The unused 2048 px thumbnail goes to 256 px. Morph targets become sparse accessors and triangle indices 16-bit | Every extension (the `VRM` block included) is byte-for-byte unchanged, and loading through `src/characters/vrmModel.ts` gives bit-identical geometry, morph targets, materials, bones, expressions and spring bones |
| `anims/Xbot.glb` | Keeps idle, walk and run, with their rotation tracks plus the hips translation. Drops the meshes, skin, materials and the other four clips | That is all `src/characters/retarget.ts` reads. The rest pose and all 204 kept tracks load bit-identical |
| `hdri/*.hdr`, `textures/waternormals.jpg` | Untouched | Halving the sky would blur the background. The water map is small and already near 1:1 |

- **File names don't change.** The game builds these URLs, so the `_1k` names stay even where a file is now 512 px.
- **Resizing uses a 2x2 box filter,** the same filter the GPU uses to build its next mip level. It doesn't use `sips -z`, which rescales 4:2:0 JPEGs in the DCT domain with a different, sharper filter.
- **Each texture keeps its source ICC profile**, and other metadata is dropped. sips never changes pixel values on its own, so the profile still describes them and every browser renders the new file the way it rendered the original. This matters for `winter_leaves_diff`: its profile is a camera (input) profile that Chrome applies, which makes the texture about 20 levels brighter than its raw pixel values. macOS's ColorSync ignores the profile, so Safari probably shows the raw values (not checked in Safari). Stripping the profile would have darkened Frostveil in Chrome.
