import './style.css';
import * as THREE from 'three';
import { createRenderer } from './render';
import { PRESETS, LEVELS, Governor, detectLevel, gpuName, isMobile, savedChoice, saveChoice, type QualityChoice, type QualityLevel, type QualitySettings } from './quality';
import { World } from './world/world';
import { Assets } from './world/assets';
import { landById, LANDS } from './world/lands/defs';
import { Ambient } from './world/ambient';
import { Player, type AvatarLike, type PlayerEvents } from './player/player';
import { ROSTER, DEFAULT_CHARACTER_ID, characterById, type CharacterId } from './characters/roster';
import { VrmAvatar } from './characters/vrmAvatar';
import { Input } from './player/input';
import { CameraRig } from './camera';
import { Fx } from './fx';
import { Sfx } from './sfx';
import { Cards } from './cards/cards';
import { CARDS } from './cards/catalog';
import { dayInfo, dealFor, placeDeal, type DealSpawn } from './cards/daily';
import { loadCardFonts } from './cards/faces';
import { Critters } from './critters';
import { Spells, type SpellId } from './spells';
import { Hud } from './hud/hud';
import { regionAt, type Region } from './regions';
import { easeInOutCubic, yawToward } from './util/math';
import type { Game, Mode } from './game';
import type { LandId } from './world/lands/types';

const LAND_ICON: Record<LandId, string> = { isle: '🏝️', sunscar: '🏜️', frostveil: '🏔️', mistmoor: '🌾' };
const DUST_COLOR: Record<LandId, string> = { isle: '#c9bf9f', sunscar: '#dcc497', frostveil: '#eef3f8', mistmoor: '#8f8467' };
/** Share of weather particles drawn per preset. */
const AMBIENT_SHARE: Record<QualityLevel, number> = { high: 1, medium: 0.75, low: 0.5 };

async function boot(): Promise<void> {
  const t0 = performance.now();
  const params = new URLSearchParams(location.search);
  const testMode = params.has('autoplay');
  // Graphics: ?quality= wins for this visit, then the saved pick, then auto (a guess from the GPU's name).
  const qualityParam = params.get('quality');
  let qualityChoice: QualityChoice =
    qualityParam === 'auto' || qualityParam === 'low' || qualityParam === 'medium' || qualityParam === 'high' ? qualityParam : savedChoice();
  const gpu = gpuName();
  const detected = detectLevel(gpu, navigator.hardwareConcurrency ?? 4, isMobile());
  let quality: QualitySettings = PRESETS[qualityChoice === 'auto' ? detected : qualityChoice];
  console.info(`[quality] gpu "${gpu}": auto would pick ${detected}; using ${quality.level} (${qualityChoice})`);
  const day = dayInfo(params.get('day'));
  const startLand = (params.get('land') ?? 'isle') as LandId;
  if (!LANDS.some((l) => l.id === startLand)) throw new Error(`[boot] unknown ?land=${startLand}`);

  const app = document.getElementById('app');
  if (!app) throw new Error('[boot] #app missing from index.html');
  await loadCardFonts();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 4000);
  const view = createRenderer(app, scene, camera, quality);

  const hemi = new THREE.HemisphereLight('#d4e9ff', '#5d6b3c', 0.6);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff1d6', 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(quality.shadowMap, quality.shadowMap);
  const sc = sun.shadow.camera;
  sc.left = -60;
  sc.right = 60;
  sc.top = 60;
  sc.bottom = -60;
  sc.near = 1;
  sc.far = 500;
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);

  const assets = new Assets(view.renderer);
  const fx = new Fx(scene);
  const sfx = new Sfx();
  const input = new Input(view.renderer.domElement);
  const rig = new CameraRig(camera);
  const deal = dealFor(day);
  const spells = new Spells(scene);
  const hud = new Hud(app, day, document.createElement('canvas'));

  // Player events turn movement into feedback (dust, rings, sounds, shake).
  const feet = new THREE.Vector3();
  let respawn: (p: Player) => void = () => {};
  const events: PlayerEvents = {
    jump: (p) => {
      fx.dustPuff(feet.copy(p.pos), 4, 2.0, 0.32);
      sfx.jump();
    },
    airJump: (p) => {
      feet.set(p.pos.x, p.pos.y + 0.1, p.pos.z);
      fx.ring(feet, auraColor, 0.3, 2.4, 0.35, 2.4);
      fx.burst(feet, auraColor, 14, 3, 0.26, 0.45, -1, 2.6);
      sfx.airJump();
    },
    land: (p, impact) => {
      if (impact > 12) fx.dustPuff(feet.copy(p.pos), Math.min(9, Math.round(impact / 3)), Math.min(4, impact / 7), 0.42);
      if (impact > 24) rig.addShake(Math.min(0.5, impact / 90));
      sfx.land(impact);
    },
    step: (p) => {
      if (Math.hypot(p.vel.x, p.vel.z) > 9) fx.dustPuff(feet.copy(p.pos), 1, 0.8, 0.26);
      sfx.step();
    },
    hurt: (p) => {
      p.avatar.setExpression?.('angry', 0.9);
      hud.hurt();
      sfx.hurt();
      rig.addShake(0.35);
    },
    died: (p) => respawn(p),
  };
  const player = new Player(events);
  scene.add(player.avatar.root);
  let auraColor = '#c8fbff';

  // --- characters -----------------------------------------------------------------------
  // Models load on demand and are cached by id, so flipping between picks is instant.
  // Starting the game frees every model except the one you chose.
  const CHAR_KEY = 'wildcard-isle:character';
  const models = new Map<CharacterId, Promise<VrmAvatar>>();
  let picked: CharacterId = savedCharacter();
  let wearing: CharacterId | null = null;

  function savedCharacter(): CharacterId {
    const fromUrl = params.get('char');
    if (fromUrl && fromUrl !== 'none') return characterById(fromUrl).id;
    try {
      const v = localStorage.getItem(CHAR_KEY);
      if (v && ROSTER.some((c) => c.id === v)) return v as CharacterId;
    } catch {
      // storage blocked (private window): fall back to the default
    }
    return DEFAULT_CHARACTER_ID;
  }

  function model(id: CharacterId): Promise<VrmAvatar> {
    const cached = models.get(id);
    if (cached) return cached;
    const t = performance.now();
    const p = VrmAvatar.load(characterById(id)).then((av) => {
      console.info(`[character] ${id} ready in ${(performance.now() - t).toFixed(0)}ms`);
      return av;
    });
    models.set(id, p);
    p.catch(() => models.delete(id)); // a failed load can be retried by picking again
    return p;
  }

  function wear(id: CharacterId, av: AvatarLike): void {
    scene.remove(player.avatar.root);
    player.avatar = av;
    player.perks = { ...characterById(id).perks };
    auraColor = characterById(id).auraColor;
    rig.lookHeight = (av.height ?? 1.82) * 0.85;
    av.root.position.copy(player.pos);
    av.root.rotation.y = player.facing;
    scene.add(av.root);
    wearing = id;
    console.info(`[character] wearing ${id}`);
  }

  // --- lands ------------------------------------------------------------------------
  type LandState = { world: World; cards: Cards; critters: Critters; ambient: Ambient; here: DealSpawn[] };
  let current: LandState | null = null;
  let loading = false;

  async function buildLand(id: LandId): Promise<LandState> {
    const land = landById(id);
    const t = performance.now();
    const world = await World.create(view.renderer, land, assets);
    scene.add(world.root);
    world.applyAtmosphere(scene, { sun, hemi, renderer: view.renderer });
    world.applyQuality(quality);
    const here = placeDeal(deal, day, world);
    const cards = new Cards(scene, deal, here, day);
    const critters = new Critters(scene, world, day.key);
    const ambient = new Ambient(land.ambient, world);
    ambient.setViewport(view.renderer.domElement.height, camera.fov);
    ambient.setDensity(AMBIENT_SHARE[quality.level]);
    fx.dustColor = DUST_COLOR[id];
    scene.add(ambient.points);
    console.info(`[land] ${land.name} built in ${(performance.now() - t).toFixed(0)}ms`);
    return { world, cards, critters, ambient, here };
  }

  function disposeLand(s: LandState): void {
    s.world.dispose();
    s.cards.dispose();
    s.critters.dispose();
    s.ambient.dispose();
  }

  // --- graphics quality ----------------------------------------------------------------
  function applyQuality(q: QualitySettings): void {
    quality = q;
    view.setQuality(q);
    sun.shadow.mapSize.set(q.shadowMap, q.shadowMap);
    sun.shadow.map?.dispose();
    sun.shadow.map = null; // re-created at the new size on the next frame
    current?.world.applyQuality(q);
    current?.ambient.setDensity(AMBIENT_SHARE[q.level]);
    fx.setViewport(view.renderer.domElement.height, camera.fov); // pixel ratio may have changed
    hud.renderQuality(qualityChoice, q.level, view.scale);
    console.info(`[quality] now ${q.level} (${qualityChoice}), render scale ${view.scale.toFixed(2)}`);
  }

  const governor = new Governor(
    (scale) => {
      view.setScale(scale);
      fx.setViewport(view.renderer.domElement.height, camera.fov); // keep effect sizes right at the new resolution
      hud.renderQuality(qualityChoice, quality.level, scale);
    },
    () => {
      if (qualityChoice !== 'auto') return false; // a picked preset stays; only resolution adapts
      const next = LEVELS[LEVELS.indexOf(quality.level) + 1];
      if (!next) return false;
      applyQuality(PRESETS[next]);
      hud.notice(`Graphics lowered to ${next} to keep things smooth`);
      return true;
    },
  );

  hud.onQuality = (choice) => {
    qualityChoice = choice;
    saveChoice(choice);
    governor.scale = 1;
    view.setScale(1);
    applyQuality(PRESETS[choice === 'auto' ? detected : choice]);
    governor.settle(3);
  };
  hud.renderQuality(qualityChoice, quality.level, view.scale);
  let governorOn = true; // perf tests pause it to compare presets at full resolution

  // --- player name -----------------------------------------------------------------------
  const NAME_KEY = 'wildcard-isle:name';
  let playerName = savedName();

  function cleanName(raw: string): string {
    return raw
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 16);
  }

  function savedName(): string {
    const fromUrl = params.get('name');
    if (fromUrl) return cleanName(fromUrl);
    try {
      return cleanName(localStorage.getItem(NAME_KEY) ?? '');
    } catch {
      return '';
    }
  }

  function arrive(s: LandState): void {
    const L = s.world.landmarks;
    player.hp = player.maxHp;
    player.spawnAt(L.gate.x, L.gate.z + 6, s.world);
    // Face the summit, unless that means staring into a low sun: then arrive with the sun at your back.
    let base = yawToward(L.gate.x, L.gate.z, L.summit.x, L.summit.z);
    const sun = s.world.sky.sunDir;
    const sunFlat = Math.hypot(sun.x, sun.z) || 1;
    const intoSun = (-Math.sin(base) * sun.x - Math.cos(base) * sun.z) / sunFlat;
    if (sun.y < 0.5 && intoSun > 0.35) base = Math.atan2(sun.x, sun.z);
    rig.yaw = rig.clearYaw(s.world, player.pos, base);
    player.facing = rig.yaw + Math.PI;
    rig.snap(player.pos);
    hud.setLand(s.world.land.id, s.world.land.name, s.world.island.minimap);
  }

  current = await buildLand(startLand);
  arrive(current);

  const game: Game = {
    scene,
    camera,
    rig,
    input,
    world: current.world,
    player,
    fx,
    sfx,
    cards: current.cards,
    critters: current.critters,
    spells,
    hud,
    day,
    time: 0,
    mode: 'intro',
    testMode,
  };

  respawn = (p) => {
    const L = game.world.landmarks;
    fx.burst(feet.set(p.pos.x, p.pos.y + 1, p.pos.z), '#ff7a62', 50, 7, 0.4, 0.8, 2, 3);
    p.hp = p.maxHp;
    p.aura = p.maxAura;
    p.spawnAt(L.gate.x, L.gate.z + 6, game.world);
    rig.snap(p.pos);
    hud.notice('You were dealt out. Back to the Gate.');
    console.info('[player] died and respawned');
  };

  let region: Region = regionAt(game.world, player.pos, false);
  let regionCandidate = region.id;
  let regionHold = 0;

  async function travel(id: LandId): Promise<void> {
    if (loading || !current || id === current.world.land.id) return;
    loading = true;
    const land = landById(id);
    console.info(`[travel] ${current.world.land.id} -> ${id}`);
    sfx.home();
    hud.showLoading(LAND_ICON[id], land.name, land.title);
    setMode('loading');
    await new Promise((r) => setTimeout(r, 50));
    disposeLand(current);
    current = await buildLand(id);
    arrive(current);
    game.world = current.world;
    game.cards = current.cards;
    game.critters = current.critters;
    region = regionAt(game.world, player.pos, false);
    regionCandidate = region.id;
    view.render(); // compile the new land's shaders behind the loading screen
    loading = false;
    hud.hideLoading();
    setMode('play');
    hud.showBanner(region.name, region.sub);
    governor.settle(3);
    fx.ring(player.pos.clone().add(new THREE.Vector3(0, 0.6, 0)), land.accent, 0.5, 9, 0.8, 2.5);
    fx.burst(player.pos.clone().add(new THREE.Vector3(0, 1, 0)), land.accent, 60, 7, 0.36, 0.9, 2, 3);
    if (!testMode) input.requestLock();
  }

  // --- modes ----------------------------------------------------------------------
  let introBlend = 1;
  const introPos = new THREE.Vector3();
  const introQuat = new THREE.Quaternion();

  function setMode(mode: Mode): void {
    if (game.mode === mode) return;
    console.info(`[game] mode ${game.mode} -> ${mode}`);
    game.mode = mode;
    hud.setMode(mode);
    if (mode === 'binder') hud.renderBinder(game);
    if (mode === 'map') hud.renderWorldMap(game);
  }

  function openSelect(): void {
    sfx.unlock();
    sfx.ui();
    setMode('select');
    hud.setSelectName(playerName);
    pick(picked);
  }

  function pick(id: CharacterId): void {
    picked = id;
    const def = characterById(id);
    if (wearing === id) {
      hud.renderSelect(id, '', true);
      player.avatar.setExpression?.('happy', 1.6);
      return;
    }
    hud.renderSelect(id, `Loading ${def.name.split(' ')[0]}…`, false);
    model(id).then(
      (av) => {
        if (picked !== id) return; // another pick happened while this one loaded
        wear(id, av);
        av.setExpression('happy', 1.6);
        if (game.mode === 'select') hud.renderSelect(id, '', true);
      },
      (err: unknown) => {
        console.error(`[character] ${id} failed to load`, err);
        if (picked === id) hud.renderSelect(id, `Couldn't load ${def.name}: ${err instanceof Error ? err.message : String(err)}`, false);
      },
    );
  }

  function begin(): void {
    if (game.mode !== 'select' || wearing !== picked) return;
    try {
      localStorage.setItem(CHAR_KEY, picked);
    } catch {
      // not saved; the default comes back next visit
    }
    for (const [id, p] of models) {
      if (id === picked) continue;
      models.delete(id);
      p.then((av) => av.dispose(), () => {});
    }
    playerName = cleanName(hud.selectName());
    try {
      localStorage.setItem(NAME_KEY, playerName);
    } catch {
      // not saved; they'll be asked again next visit
    }
    hud.setPlayerName(playerName || 'Traveler', characterById(picked).auraColor);
    enter();
    hud.notice(`Welcome, ${playerName || 'Traveler'}`);
  }

  function enter(): void {
    sfx.unlock();
    introPos.copy(camera.position);
    introQuat.copy(camera.quaternion);
    introBlend = 0;
    setMode('play');
    if (!testMode) input.requestLock();
    sfx.ui();
    governor.settle(3);
    region = regionAt(game.world, player.pos, false);
    hud.showBanner(region.name, region.sub);
  }

  function openOverlay(mode: 'binder' | 'map'): void {
    if (game.mode !== 'play') return;
    setMode(mode);
    sfx.ui();
    if (document.pointerLockElement) document.exitPointerLock();
  }

  function closeOverlay(): void {
    if (game.mode !== 'binder' && game.mode !== 'map') return;
    setMode('play');
    sfx.ui();
    if (!testMode) input.requestLock();
  }

  hud.onEnter = openSelect;
  hud.onPick = pick;
  hud.onBegin = begin;
  hud.onResume = () => {
    setMode('play');
    if (!testMode) input.requestLock();
  };
  hud.onBinderOpen = () => openOverlay('binder');
  hud.onBinderClose = closeOverlay;
  hud.onMapClose = closeOverlay;
  hud.onTravel = (id) => void travel(id);
  hud.setMode('intro');

  view.renderer.domElement.addEventListener('click', () => {
    if (game.mode === 'play' && !testMode && !input.locked) input.requestLock();
  });
  document.addEventListener('pointerlockchange', () => {
    if (testMode) return;
    if (game.mode === 'play' && !input.locked) setMode('paused');
  });

  function onResize(): void {
    view.resize();
    fx.setViewport(view.renderer.domElement.height, camera.fov);
    current?.ambient.setViewport(view.renderer.domElement.height, camera.fov);
  }
  window.addEventListener('resize', onResize);
  onResize();

  // --- loop ---------------------------------------------------------------------
  const frameTimes: number[] = [];
  const plateAt = new THREE.Vector3();

  // The shadow camera follows the player in whole shadow-map texels, so shadow edges
  // stay still as you walk instead of crawling (the classic shadow shimmer).
  const UP = new THREE.Vector3(0, 1, 0);
  const lightRight = new THREE.Vector3();
  const lightUp = new THREE.Vector3();
  const snapped = new THREE.Vector3();
  function placeSun(focus: THREE.Vector3, sunDir: THREE.Vector3): void {
    const texel = (sc.right - sc.left) / sun.shadow.mapSize.x;
    lightRight.crossVectors(UP, sunDir);
    if (lightRight.lengthSq() < 1e-6) lightRight.set(1, 0, 0); // sun straight overhead
    lightRight.normalize();
    lightUp.crossVectors(sunDir, lightRight).normalize();
    const r = Math.round(focus.dot(lightRight) / texel) * texel;
    const u = Math.round(focus.dot(lightUp) / texel) * texel;
    snapped.copy(lightRight).multiplyScalar(r).addScaledVector(lightUp, u).addScaledVector(sunDir, focus.dot(sunDir));
    sun.target.position.copy(snapped);
    sun.position.copy(snapped).addScaledVector(sunDir, 240);
  }
  let last = performance.now();

  function frame(now: number): void {
    requestAnimationFrame(frame);
    const rawDt = (now - last) / 1000;
    last = now;
    frameTimes.push(rawDt);
    if (frameTimes.length > 120) frameTimes.shift();
    const dt = Math.min(rawDt, 1 / 20);
    game.time += dt;
    if (loading || !current) {
      input.endFrame();
      return;
    }

    const playing = game.mode === 'play';
    const simulate = playing || game.mode === 'intro';
    if (playing && rawDt < 0.5 && governorOn) governor.sample(rawDt); // skip hitches like a hidden tab

    if (input.wasPressed('Tab') || input.wasPressed('KeyB')) {
      if (game.mode === 'binder') closeOverlay();
      else openOverlay('binder');
    }
    if (input.wasPressed('KeyT')) {
      if (game.mode === 'map') closeOverlay();
      else openOverlay('map');
    }
    if (input.wasPressed('Escape') && (game.mode === 'binder' || game.mode === 'map')) setMode('paused');
    if (input.wasPressed('KeyM')) hud.notice(sfx.toggleMute() ? 'Sound off' : 'Sound on');
    if (game.mode === 'select' && input.wasPressed('Enter')) begin();

    if (playing) rig.handleInput(input);
    if (simulate) {
      player.update(dt, input, rig.yaw, game.world, playing);
      spells.update(dt, game, playing);
      game.critters.update(dt, game);
      game.cards.update(dt, game);
    } else if (game.mode === 'select') {
      player.update(dt, input, rig.yaw, game.world, false); // idle animation only
    }

    if (game.mode === 'intro') {
      const a = game.time * 0.045 + 0.8;
      const T = game.world.landmarks.gate;
      camera.position.set(T.x + Math.cos(a) * 34, T.y + 14, T.z + Math.sin(a) * 34);
      camera.lookAt(T.x, T.y + 5, T.z);
    } else if (game.mode === 'select') {
      // Face the character; shift the view so they stand right of the roster panel.
      const P = player.pos;
      const fwdX = Math.sin(player.facing);
      const fwdZ = Math.cos(player.facing);
      const rightX = Math.cos(player.facing); // camera's right when looking back at the character
      const rightZ = -Math.sin(player.facing);
      const h = player.avatar.height ?? 1.8; // frame short and tall characters the same way
      const side = -0.56 * h;
      const sway = Math.sin(game.time * 0.35) * 0.05 * h;
      const back = 1.5 * h;
      camera.position.set(P.x + fwdX * back + rightX * (side + sway), P.y + 0.68 * h, P.z + fwdZ * back + rightZ * (side + sway));
      camera.lookAt(P.x + rightX * side, P.y + 0.52 * h, P.z + rightZ * side);
    } else {
      if (fx.shakeRequest > 0) {
        rig.addShake(fx.shakeRequest);
        fx.shakeRequest = 0;
      }
      rig.update(dt, player.pos, game.world);
      if (introBlend < 1) {
        introBlend = Math.min(1, introBlend + dt / 1.4);
        const e = easeInOutCubic(introBlend);
        camera.position.lerpVectors(introPos, camera.position.clone(), e);
        camera.quaternion.slerpQuaternions(introQuat, camera.quaternion.clone(), e);
      }
    }

    fx.update(dt);
    placeSun(player.pos, game.world.sky.sunDir);
    game.world.update(dt, game.time, camera, player.pos);
    current.ambient.update(dt, game.time, camera.position);

    if (playing) {
      hud.update(dt, game);
      // Name tag over the character's head; fades out when the camera is right behind them.
      plateAt.set(player.pos.x, player.pos.y + (player.avatar.height ?? 1.8) + 0.3, player.pos.z).project(camera);
      const camDist = camera.position.distanceTo(player.pos);
      const plateAlpha = plateAt.z < 1 ? Math.min(1, Math.max(0, (camDist - 2.5) / 1.5)) : 0;
      hud.placeNameplate((plateAt.x * 0.5 + 0.5) * window.innerWidth, (0.5 - plateAt.y * 0.5) * window.innerHeight, plateAlpha);
      const r = regionAt(game.world, player.pos, player.swimming);
      if (r.id !== regionCandidate) {
        regionCandidate = r.id;
        regionHold = 0;
      } else if (r.id !== region.id) {
        regionHold += dt;
        if (regionHold > 0.8) {
          region = r;
          hud.showBanner(r.name, r.sub);
          console.info(`[region] ${r.name}`);
        }
      }
    }

    view.render();
    input.endFrame();
  }
  requestAnimationFrame(frame);

  // --- debug/test handle (scripts/*.mjs) ----------------------------------------------
  const debug = {
    ready: true,
    get landmarks() {
      return game.world.landmarks;
    },
    get islets() {
      return game.world.structures.islets;
    },
    state() {
      const avg = frameTimes.reduce((a, b) => a + b, 0) / Math.max(1, frameTimes.length);
      const info = view.renderer.info;
      return {
        mode: game.mode,
        land: game.world.land.id,
        pos: player.pos.toArray(),
        vel: player.vel.toArray(),
        grounded: player.grounded,
        swimming: player.swimming,
        hp: player.hp,
        aura: player.aura,
        region: region.name,
        today: `${game.cards.foundToday}/${game.cards.deal.length}`,
        binder: `${game.cards.binder.uniqueCount()}/${CARDS.length}`,
        crittersAlive: game.critters.list.filter((c) => c.alive).length,
        fps: Math.round(1 / avg),
        calls: info.render.calls,
        triangles: info.render.triangles,
        loading,
      };
    },
    enter,
    openSelect,
    pick(id: CharacterId) {
      pick(id);
      return model(id).then(() => wearing);
    },
    begin,
    character() {
      return { picked, wearing, perks: player.perks, name: playerName };
    },
    quality() {
      return { choice: qualityChoice, level: quality.level, detected, gpu, scale: view.scale };
    },
    setQuality(choice: QualityChoice) {
      hud.onQuality(choice);
    },
    /** Visible triangles by object name, biggest first (perf work). */
    breakdown() {
      const out: Record<string, number> = {};
      scene.traverseVisible((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh || !m.geometry) return;
        const g = m.geometry as THREE.BufferGeometry & { instanceCount?: number };
        const per = (g.index ? g.index.count : g.getAttribute('position').count) / 3;
        const copies = (m as THREE.InstancedMesh).isInstancedMesh ? (m as THREE.InstancedMesh).count : (g.instanceCount ?? 1);
        let label = m.name || m.parent?.name || m.type;
        if (label.length > 28) label = label.slice(0, 28);
        out[label] = (out[label] ?? 0) + per * Math.min(copies, 1e7);
      });
      return Object.entries(out).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `${k}: ${(v / 1000).toFixed(0)}k`);
    },
    holdResolution(hold: boolean) {
      governorOn = !hold;
      if (hold) {
        governor.scale = 1;
        view.setScale(1);
      }
    },
    travel(id: LandId) {
      return travel(id);
    },
    teleport(x: number, z: number, lift = 0) {
      player.spawnAt(x, z, game.world);
      player.pos.y += lift;
      rig.snap(player.pos);
    },
    look(yaw: number, pitch: number, dist: number) {
      rig.yaw = yaw;
      rig.pitch = pitch;
      rig.targetDist = dist;
      rig.dist = dist;
    },
    lookAt(x: number, z: number) {
      rig.yaw = yawToward(player.pos.x, player.pos.z, x, z);
      player.facing = rig.yaw + Math.PI;
    },
    pitch(pitch: number, dist: number) {
      rig.pitch = pitch;
      rig.targetDist = dist;
      rig.dist = dist;
    },
    setMode(m: Mode) {
      setMode(m);
    },
    cast(id: SpellId) {
      player.aura = player.maxAura;
      spells.cooldowns[id] = 0;
      return spells.tryCast(id, game);
    },
    critterAhead(dist: number) {
      const fwdX = -Math.sin(rig.yaw);
      const fwdZ = -Math.cos(rig.yaw);
      const alive = game.critters.list.filter((c) => c.alive);
      if (alive.length === 0) throw new Error('[debug] no living critters');
      const c = alive[0];
      const x = player.pos.x + fwdX * dist;
      const z = player.pos.z + fwdZ * dist;
      c.pos.set(x, game.world.groundAt(x, z, 1000, 0.5), z);
      c.anchor.copy(c.pos);
      c.chasing = false;
      c.hopTimer = 99;
      return c.id;
    },
    scatterCards(n: number, radius: number) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const x = player.pos.x + Math.cos(a) * radius;
        const z = player.pos.z + Math.sin(a) * radius;
        const at = new THREE.Vector3(x, game.world.groundAt(x, z, 1000, 0.5) + 0.4, z);
        game.cards.drop(CARDS[(i * 7) % 20], at);
      }
    },
    hold(code: string, down: boolean) {
      if (down) {
        input.down.add(code);
        input.pressed.add(code);
      } else {
        input.down.delete(code);
      }
    },
    bloom(on: boolean) {
      view.bloom.enabled = on;
    },
    resetBinder() {
      game.cards.binder.reset();
    },
    stairs() {
      const steps = game.world.colliders.all.filter((c) => c.tag === 'stair');
      if (steps.length === 0) throw new Error('[debug] no stairs in this land');
      let first = steps[0];
      for (const st of steps) if (st.top < first.top) first = st;
      const flight = steps.filter((st) => Math.hypot(st.x - first.x, st.z - first.z) < 12 && Math.abs(st.cos - first.cos) < 1e-3 && Math.abs(st.sin - first.sin) < 1e-3);
      let lastStep = flight[0];
      for (const st of flight) if (st.top > lastStep.top) lastStep = st;
      const dx = lastStep.x - first.x;
      const dz = lastStep.z - first.z;
      const len = Math.hypot(dx, dz);
      return { x: first.x - (dx / len) * 2.5, z: first.z - (dz / len) * 2.5, dirX: dx / len, dirZ: dz / len, topY: lastStep.top, steps: flight.length };
    },
    house() {
      const h = game.world.colliders.all.find((c) => c.tag === 'house');
      if (!h) throw new Error('[debug] no houses');
      return { x: h.x, z: h.z, hw: h.hw, hd: h.hd, cos: h.cos, sin: h.sin, top: h.top };
    },
    cotd() {
      const s = deal.find((d) => d.cotd);
      if (!s) throw new Error('[debug] no card of the day');
      const spawn = current?.here.find((h) => h.cotd);
      return { land: s.land, name: s.card.name, x: spawn?.pos.x ?? null, z: spawn?.pos.z ?? null };
    },
  };
  if (testMode && params.get('char') !== 'none') {
    const id = savedCharacter();
    wear(id, await model(id));
  }
  if (testMode) hud.setPlayerName(playerName || 'Traveler', auraColor); else if (!testMode) {
    void model(picked).catch(() => {}); // warm the cache while the intro plays
  }
  (window as unknown as { __isle: typeof debug }).__isle = debug;
  if (testMode) enter();
  console.info(`[boot] ready in ${(performance.now() - t0).toFixed(0)}ms (day ${day.number}, ${day.key}, ${game.world.land.name}${testMode ? ', test mode' : ''})`);
}

boot().catch((err: unknown) => {
  console.error('[boot] failed', err);
  const box = document.createElement('pre');
  box.style.cssText =
    'position:fixed;inset:24px;margin:0;padding:20px;border-radius:12px;background:#2a0f16;color:#ffd6dc;font:13px/1.5 ui-monospace,monospace;white-space:pre-wrap;overflow:auto;z-index:99';
  box.textContent = `Wildcard Isle failed to start.\n\n${err instanceof Error ? `${err.message}\n\n${err.stack ?? ''}` : String(err)}`;
  document.body.appendChild(box);
});
