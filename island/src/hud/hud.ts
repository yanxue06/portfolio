import { CARDS, HABITAT, RARITY, cardNo, type CardDef } from '../cards/catalog';
import { backDataUrl, faceUrl } from '../cards/faces';
import { SPELLS, type SpellId } from '../spells';
import { iconSvg } from './icons';
import { HALF, WORLD } from '../world/terrain';
import type { DayInfo } from '../cards/daily';
import { LANDS } from '../world/lands/defs';
import { ROSTER, type CharacterId } from '../characters/roster';
import type { QualityChoice, QualityLevel } from '../quality';
import type { LandId } from '../world/lands/types';

const LAND_ICON: Record<LandId, string> = { isle: '🏝️', sunscar: '🏜️', frostveil: '🏔️', mistmoor: '🌾' };
const LAND_COLOR: Record<LandId, string> = { isle: '#8fd36a', sunscar: '#f0b45a', frostveil: '#9fd8ff', mistmoor: '#c79bff' };

function miniHtml(s: { found: boolean; cotd: boolean; card: CardDef; land: LandId }): string {
  return `<span class="mini ${s.found ? 'found' : ''} ${s.cotd ? 'cotd' : ''}" style="--c:${RARITY[s.card.rarity].color};--land:${LAND_COLOR[s.land]}" title="${LANDS.find((l) => l.id === s.land)?.name ?? s.land}">${s.found ? s.card.emoji : ''}</span>`;
}
import type { Game } from '../game';

const DISCLAIMER =
  'Unofficial fan game inspired by Greed Island from <i>Hunter × Hunter</i> by Yoshihiro Togashi. ' +
  'Not affiliated with or endorsed by the creator, Shueisha, VIZ Media or the anime studios. ' +
  'Every name, character, card and piece of art in this game is original.';

const CONTROLS: Array<[string, string]> = [
  ['W A S D', 'Move'],
  ['Shift', 'Sprint'],
  ['Space', 'Jump, twice to double jump'],
  ['Mouse', 'Look · wheel zooms'],
  ['LMB / 1', 'Spark Shot'],
  ['Q', 'Skip (blink)'],
  ['E', 'Bubble Ward'],
  ['R', 'Lodestar'],
  ['F', 'Thunderclap'],
  ['H', 'Homeward'],
  ['Tab', 'Binder'],
  ['T', 'Travel (world map)'],
  ['M', 'Mute'],
];

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, html = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (html) node.innerHTML = html;
  return node;
}

function must<T extends Element>(root: ParentNode, selector: string): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`[hud] missing element ${selector}`);
  return found;
}

function prettyDate(key: string | null): string {
  if (!key) return 'never';
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function controlsHtml(): string {
  return CONTROLS.map(([k, v]) => `<div class="ctl"><kbd>${k}</kbd><span>${v}</span></div>`).join('');
}

export class Hud {
  readonly root: HTMLDivElement;
  onEnter: () => void = () => {};
  onResume: () => void = () => {};
  onBinderClose: () => void = () => {};
  onBinderOpen: () => void = () => {};
  onTravel: (land: LandId) => void = () => {};
  onPick: (id: CharacterId) => void = () => {};
  onBegin: () => void = () => {};
  onQuality: (choice: QualityChoice) => void = () => {};
  private playerName = 'Traveler';
  onMapClose: () => void = () => {};
  private readonly day: DayInfo;
  private readonly intro: HTMLDivElement;
  private readonly pause: HTMLDivElement;
  private readonly binder: HTMLDivElement;
  private readonly hpFill: HTMLDivElement;
  private readonly hpText: HTMLSpanElement;
  private readonly auraFill: HTMLDivElement;
  private readonly auraText: HTMLSpanElement;
  private readonly slots = new Map<SpellId, HTMLDivElement>();
  private readonly toasts: HTMLDivElement;
  private readonly notices: HTMLDivElement;
  private readonly banner: HTMLDivElement;
  private readonly channel: HTMLDivElement;
  private readonly channelFill: HTMLDivElement;
  private readonly hurtVeil: HTMLDivElement;
  private readonly handStrip: HTMLDivElement;
  private readonly handCount: HTMLSpanElement;
  private readonly binderCount: HTMLSpanElement;
  private readonly mapCanvas: HTMLCanvasElement;
  private readonly mapCtx: CanvasRenderingContext2D;
  private mapBase: HTMLCanvasElement;
  private readonly worldMap: HTMLDivElement;
  private readonly loading: HTMLDivElement;
  private readonly select: HTMLDivElement;
  private binderLand: LandId = 'isle';
  private readonly regionLabel: HTMLDivElement;
  private bannerTimer = 0;
  private noticeTimer = 0;
  private handKey = '';
  private selectedNo = 1;

  constructor(container: HTMLElement, day: DayInfo, mapBase: HTMLCanvasElement) {
    this.day = day;
    this.mapBase = mapBase;
    this.root = el('div', 'hud hidden');
    this.root.innerHTML = `
      <div class="hud-tl">
        <div class="brand">WILDCARD ISLE</div>
        <div class="day"><b class="player-name">Traveler</b> · <span class="land-name">Wildcard Isle</span> · Day ${day.number} · ${day.label}</div>
        <div class="hand"><div class="hand-head"><span>TODAY'S HAND</span><span class="hand-count"></span></div><div class="hand-strip"></div></div>
      </div>
      <div class="hud-tr">
        <div class="map-wrap"><canvas class="minimap"></canvas><div class="map-n">N</div></div>
        <div class="region-label"></div>
      </div>
      <div class="hud-bl">
        <div class="bar hp"><div class="bar-fill"></div><span class="bar-label">HP</span><span class="bar-num">100</span></div>
        <div class="bar aura"><div class="bar-fill"></div><span class="bar-label">AURA</span><span class="bar-num">100</span></div>
      </div>
      <div class="spellbar"></div>
      <div class="hud-br"><button class="binder-btn">Binder <span class="binder-count"></span><kbd>Tab</kbd></button></div>
      <div class="crosshair"><i></i></div>
      <div class="nameplate"><i></i><span></span></div>
      <div class="toasts"></div>
      <div class="notices"></div>
      <div class="banner"><div class="banner-rule"></div><div class="banner-title"></div><div class="banner-sub"></div></div>
      <div class="channel"><span>Homeward</span><div class="channel-track"><div class="channel-fill"></div></div></div>
      <div class="hurt-veil"></div>
    `;
    container.appendChild(this.root);

    this.hpFill = must(this.root, '.bar.hp .bar-fill');
    this.hpText = must(this.root, '.bar.hp .bar-num');
    this.auraFill = must(this.root, '.bar.aura .bar-fill');
    this.auraText = must(this.root, '.bar.aura .bar-num');
    this.toasts = must(this.root, '.toasts');
    this.notices = must(this.root, '.notices');
    this.banner = must(this.root, '.banner');
    this.channel = must(this.root, '.channel');
    this.channelFill = must(this.root, '.channel-fill');
    this.hurtVeil = must(this.root, '.hurt-veil');
    this.handStrip = must(this.root, '.hand-strip');
    this.handCount = must(this.root, '.hand-count');
    this.binderCount = must(this.root, '.binder-count');
    this.regionLabel = must(this.root, '.region-label');
    this.mapCanvas = must(this.root, '.minimap');
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.mapCanvas.width = 184 * dpr;
    this.mapCanvas.height = 184 * dpr;
    const ctx = this.mapCanvas.getContext('2d');
    if (!ctx) throw new Error('[hud] minimap 2d context unavailable');
    this.mapCtx = ctx;

    const bar = must<HTMLDivElement>(this.root, '.spellbar');
    for (const s of SPELLS) {
      const slot = el('div', `slot slot-${s.id}`);
      slot.style.setProperty('--c', s.color);
      slot.title = `${s.name}: ${s.blurb}`;
      slot.innerHTML = `
        <div class="slot-card">${iconSvg(s.id)}<div class="slot-cd"></div><div class="slot-cost">${s.cost || ''}</div></div>
        <kbd>${s.keyLabel}</kbd>
        <div class="slot-name">${s.name}</div>`;
      bar.appendChild(slot);
      this.slots.set(s.id, slot);
    }
    must<HTMLButtonElement>(this.root, '.binder-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.onBinderOpen();
    });

    this.intro = this.buildIntro(container);
    this.pause = this.buildPause(container);
    this.binder = this.buildBinder(container);
    this.worldMap = el('div', 'overlay worldmap hidden');
    container.appendChild(this.worldMap);
    this.loading = el('div', 'overlay loading hidden', '<div class="loading-card"><div class="loading-icon"></div><div class="loading-title"></div><div class="loading-sub"></div><div class="loading-bar"><i></i></div></div>');
    container.appendChild(this.loading);
    this.select = this.buildSelect(container);
  }

  // --- overlays -----------------------------------------------------------------

  private buildIntro(container: HTMLElement): HTMLDivElement {
    const o = el('div', 'overlay intro');
    o.innerHTML = `
      <div class="intro-panel">
        <div class="intro-kicker">Day ${this.day.number} · ${this.day.label}</div>
        <h1 class="title">Wildcard Isle</h1>
        <p class="tagline">The island deals a new hand every day.</p>
        <p class="pitch">Sixty numbered cards are hidden across four lands. Each morning twenty-one of them are dealt to new places, one of them a glowing Card of the Day. Find them, pop jellyhops for spare cards, and use your spell cards to get anywhere.</p>
        <button class="enter">Enter the Isle</button>
        <div class="controls">${controlsHtml()}</div>
        <p class="disclaimer">${DISCLAIMER}</p>
      </div>`;
    container.appendChild(o);
    must<HTMLButtonElement>(o, '.enter').addEventListener('click', (e) => {
      e.stopPropagation();
      this.onEnter();
    });
    return o;
  }

  private buildPause(container: HTMLElement): HTMLDivElement {
    const o = el('div', 'overlay pause hidden');
    o.innerHTML = `
      <div class="pause-panel">
        <h2>Paused</h2>
        <button class="resume">Resume</button>
        <div class="gfx">
          <span class="gfx-label">Graphics</span>
          <div class="gfx-opts"><button data-q="auto">Auto</button><button data-q="high">High</button><button data-q="medium">Medium</button><button data-q="low">Low</button></div>
          <div class="gfx-note"></div>
        </div>
        <div class="controls">${controlsHtml()}</div>
        <p class="disclaimer">${DISCLAIMER}</p>
      </div>`;
    container.appendChild(o);
    must<HTMLButtonElement>(o, '.resume').addEventListener('click', (e) => {
      e.stopPropagation();
      this.onResume();
    });
    o.querySelectorAll<HTMLButtonElement>('.gfx-opts button').forEach((b) =>
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onQuality(b.dataset.q as QualityChoice);
      }),
    );
    return o;
  }

  private buildBinder(container: HTMLElement): HTMLDivElement {
    const o = el('div', 'overlay binder hidden');
    o.innerHTML = `
      <div class="binder-panel">
        <header>
          <div><div class="binder-title">Binder</div><div class="binder-stats"></div></div>
          <div class="binder-tabs"></div>
          <button class="close">Close <kbd>Tab</kbd></button>
        </header>
        <div class="binder-body">
          <div class="binder-grid"></div>
          <aside class="binder-detail"></aside>
        </div>
        <footer>
          <div class="binder-today"><span>Today's hand</span><div class="binder-hand"></div></div>
          <button class="share">Copy today's result</button>
        </footer>
      </div>`;
    container.appendChild(o);
    must<HTMLButtonElement>(o, '.close').addEventListener('click', (e) => {
      e.stopPropagation();
      this.onBinderClose();
    });
    must<HTMLButtonElement>(o, '.share').addEventListener('click', (e) => {
      e.stopPropagation();
      void this.share();
    });
    return o;
  }

  setMode(mode: Game['mode']): void {
    this.intro.classList.toggle('hidden', mode !== 'intro');
    this.pause.classList.toggle('hidden', mode !== 'paused');
    this.binder.classList.toggle('hidden', mode !== 'binder');
    this.worldMap.classList.toggle('hidden', mode !== 'map');
    this.select.classList.toggle('hidden', mode !== 'select');
    this.root.classList.toggle('hidden', mode === 'intro' || mode === 'select');
  }

  private buildSelect(container: HTMLElement): HTMLDivElement {
    const o = el('div', 'overlay select hidden');
    const cards = ROSTER.map(
      (c) => `<button class="pick" data-id="${c.id}" style="--aura:${c.auraColor}">
        <img src="${c.portrait}" alt="${c.name}" draggable="false"/>
        <span class="pick-name">${c.name.split(' ')[0]}</span>
      </button>`,
    ).join('');
    o.innerHTML = `
      <div class="select-panel">
        <div class="intro-kicker">Choose your traveler</div>
        <div class="roster">${cards}</div>
        <div class="select-detail">
          <div class="sel-title"></div>
          <div class="sel-name"></div>
          <p class="sel-bio"></p>
          <div class="sel-perk"><span class="sel-perk-dot"></span><span class="sel-perk-text"></span></div>
          <div class="sel-status"></div>
          <label class="sel-field"><span>Your name</span><input class="sel-input" maxlength="16" spellcheck="false" autocomplete="off" placeholder="Traveler"/></label>
          <button class="enter begin">Begin</button>
        </div>
        <p class="disclaimer">Characters are built on CC0 VRoid sample models by pixiv. Every name and story here is original.</p>
      </div>`;
    container.appendChild(o);
    o.querySelectorAll<HTMLButtonElement>('.pick').forEach((b) =>
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onPick(b.dataset.id as CharacterId);
      }),
    );
    must<HTMLButtonElement>(o, '.begin').addEventListener('click', (e) => {
      e.stopPropagation();
      this.onBegin();
    });
    must<HTMLInputElement>(o, '.sel-input').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      this.onBegin();
    });
    return o;
  }

  /** The name typed on the select screen, raw (main.ts cleans it). */
  selectName(): string {
    return must<HTMLInputElement>(this.select, '.sel-input').value;
  }

  /** Prefills the name box; an empty box gets focus so a first-time player can just type. */
  setSelectName(name: string): void {
    const input = must<HTMLInputElement>(this.select, '.sel-input');
    input.value = name;
    if (!name) setTimeout(() => input.focus(), 50);
  }

  /** Shows the player's name in the corner, on the name tag and in the share text. */
  setPlayerName(name: string, color: string): void {
    this.playerName = name;
    must(this.root, '.player-name').textContent = name;
    must(this.root, '.nameplate span').textContent = name;
    must<HTMLElement>(this.root, '.nameplate').style.setProperty('--aura', color);
  }

  /** Moves the name tag to a screen point (CSS px); alpha 0 hides it. */
  placeNameplate(x: number, y: number, alpha: number): void {
    const plate = must<HTMLElement>(this.root, '.nameplate');
    plate.style.opacity = alpha.toFixed(2);
    if (alpha <= 0) return;
    plate.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
  }

  /** Marks the active graphics choice in the pause menu and says what auto picked. */
  renderQuality(choice: QualityChoice, level: QualityLevel, scale: number): void {
    this.pause.querySelectorAll<HTMLButtonElement>('.gfx-opts button').forEach((b) => b.classList.toggle('on', b.dataset.q === choice));
    const name = level[0].toUpperCase() + level.slice(1);
    const res = scale < 0.999 ? `, at ${Math.round(scale * 100)}% resolution to keep it smooth` : '';
    must(this.pause, '.gfx-note').textContent = choice === 'auto' ? `Auto chose ${name} for this computer${res}.` : `${name}${res}.`;
  }

  /** Highlights a character on the select screen; status is shown under the bio. */
  renderSelect(id: CharacterId, status: string, ready: boolean): void {
    const c = ROSTER.find((r) => r.id === id);
    if (!c) throw new Error(`[hud] no character ${id}`);
    this.select.querySelectorAll<HTMLButtonElement>('.pick').forEach((b) => b.classList.toggle('on', b.dataset.id === id));
    this.select.style.setProperty('--aura', c.auraColor);
    must(this.select, '.sel-title').textContent = c.title;
    must(this.select, '.sel-name').textContent = c.name;
    must(this.select, '.sel-bio').textContent = c.bio;
    must(this.select, '.sel-perk-text').textContent = c.perkLabel;
    must(this.select, '.sel-status').textContent = status;
    must<HTMLButtonElement>(this.select, '.begin').disabled = !ready;
  }

  /** Called when a new land finishes loading. */
  setLand(id: LandId, name: string, minimap: HTMLCanvasElement): void {
    this.mapBase = minimap;
    this.binderLand = id;
    must(this.root, '.land-name').textContent = name;
    this.handKey = '';
  }

  showLoading(icon: string, title: string, sub: string): void {
    must(this.loading, '.loading-icon').textContent = icon;
    must(this.loading, '.loading-title').textContent = title;
    must(this.loading, '.loading-sub').textContent = sub;
    this.loading.classList.remove('hidden', 'fade');
  }

  hideLoading(): void {
    this.loading.classList.add('fade');
    setTimeout(() => this.loading.classList.add('hidden'), 450);
  }

  renderWorldMap(game: Game): void {
    const status = game.cards.dealStatus();
    const cards = LANDS.map((land) => {
      const here = status.filter((s) => s.land === land.id);
      const found = here.filter((s) => s.found).length;
      const cotd = here.some((s) => s.cotd);
      const current = game.world.land.id === land.id;
      return `<button class="land-card ${current ? 'current' : ''}" data-land="${land.id}" style="--accent:${land.accent}">
        <div class="land-icon">${LAND_ICON[land.id]}</div>
        <div class="land-text">
          <div class="land-title">${land.title}</div>
          <div class="land-name-big">${land.name}</div>
          <p>${land.blurb}</p>
          <div class="land-meta">Today: <b>${found}/${here.length}</b> found${cotd ? ' · <span class="cotd-tag">Card of the Day is here</span>' : ''}</div>
        </div>
        <div class="land-go">${current ? 'You are here' : 'Travel'}</div>
      </button>`;
    }).join('');
    this.worldMap.innerHTML = `<div class="map-panel">
      <header><div><div class="binder-title">World Map</div><div class="binder-stats">Step through a Gate to cross the sea between lands.</div></div>
      <button class="close">Close <kbd>T</kbd></button></header>
      <div class="land-grid">${cards}</div></div>`;
    must<HTMLButtonElement>(this.worldMap, '.close').addEventListener('click', (e) => {
      e.stopPropagation();
      this.onMapClose();
    });
    this.worldMap.querySelectorAll<HTMLButtonElement>('.land-card').forEach((b) =>
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = b.dataset.land as LandId;
        if (id !== game.world.land.id) this.onTravel(id);
      }),
    );
  }

  // --- binder -------------------------------------------------------------------

  private game: Game | null = null;

  renderBinder(game: Game): void {
    this.game = game;
    const binder = game.cards.binder;
    must(this.binder, '.binder-stats').innerHTML =
      `<b>${binder.uniqueCount()}</b> of ${CARDS.length} cards · today <b>${game.cards.foundToday}</b> of ${game.cards.deal.length}`;
    const tabs = must<HTMLDivElement>(this.binder, '.binder-tabs');
    tabs.innerHTML = LANDS.map((l) => {
      const owned = CARDS.filter((c) => c.land === l.id && binder.owned(c.no) > 0).length;
      const total = CARDS.filter((c) => c.land === l.id).length;
      return `<button class="btab ${l.id === this.binderLand ? 'on' : ''}" data-land="${l.id}" style="--accent:${l.accent}">${LAND_ICON[l.id]} ${l.name} <span>${owned}/${total}</span></button>`;
    }).join('');
    tabs.querySelectorAll<HTMLButtonElement>('.btab').forEach((b) =>
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.binderLand = b.dataset.land as LandId;
        const first = CARDS.find((c) => c.land === this.binderLand);
        if (first) this.selectedNo = first.no;
        this.renderBinder(game);
      }),
    );
    const grid = must<HTMLDivElement>(this.binder, '.binder-grid');
    grid.innerHTML = '';
    for (const card of CARDS) {
      if (card.land !== this.binderLand) continue;
      const owned = binder.owned(card.no);
      const slot = el('button', `bslot ${owned ? 'owned' : 'missing'} r-${card.rarity}`);
      slot.innerHTML = owned
        ? `<img src="${faceUrl(card)}" alt="${card.name}" draggable="false"/>${owned > 1 ? `<span class="dupes">×${owned}</span>` : ''}`
        : `<span class="bno">${String(card.no).padStart(3, '0')}</span><span class="bq">?</span>`;
      slot.addEventListener('mouseenter', () => this.selectCard(card.no));
      slot.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectCard(card.no);
      });
      grid.appendChild(slot);
    }
    const hand = must<HTMLDivElement>(this.binder, '.binder-hand');
    hand.innerHTML = game.cards.dealStatus().map(miniHtml).join('');
    this.selectCard(this.selectedNo);
  }

  private selectCard(no: number): void {
    this.selectedNo = no;
    if (!this.game) return;
    const card = CARDS.find((c) => c.no === no);
    if (!card) throw new Error(`[hud] no card ${no}`);
    const binder = this.game.cards.binder;
    const owned = binder.owned(no);
    const r = RARITY[card.rarity];
    const h = HABITAT[card.habitat];
    const detail = must<HTMLDivElement>(this.binder, '.binder-detail');
    if (owned) {
      detail.innerHTML = `
        <img class="detail-card" src="${faceUrl(card)}" alt="${card.name}"/>
        <h3>${card.name}</h3>
        <div class="detail-meta"><span style="color:${r.color}">${r.label}</span> · ${cardNo(card.no)} · ${h.label}</div>
        <p class="detail-flavor">“${card.flavor}”</p>
        <p class="detail-owned">You own ${owned}. First found ${prettyDate(binder.firstFound(no))}.</p>`;
    } else {
      detail.innerHTML = `
        <img class="detail-card unknown" src="${backDataUrl()}" alt="Unknown card"/>
        <h3>???</h3>
        <div class="detail-meta"><span style="color:${r.color}">${r.label}</span> · ${cardNo(card.no)} · ${h.label}</div>
        <p class="detail-hint">${h.hint}</p>`;
    }
  }

  private async share(): Promise<void> {
    if (!this.game) return;
    const squares: Record<CardDef['rarity'], string> = { common: '⬜', uncommon: '🟩', rare: '🟦', mythic: '🟨' };
    const status = this.game.cards.dealStatus();
    const row = status.map((s) => (s.found ? squares[s.card.rarity] : '⬛')).join('');
    const text = `${this.playerName} · Wildcard Isle · Day ${this.day.number}\nToday ${this.game.cards.foundToday}/${status.length} · Binder ${this.game.cards.binder.uniqueCount()}/${CARDS.length}\n${row}`;
    try {
      await navigator.clipboard.writeText(text);
      this.notice('Result copied to clipboard');
    } catch (err) {
      console.warn('[hud] clipboard write failed', err);
      this.notice('Could not copy: clipboard blocked');
    }
    console.info(`[hud] share text:\n${text}`);
  }

  // --- events -------------------------------------------------------------------

  cardToast(card: CardDef, isNew: boolean, cotd: boolean): void {
    const r = RARITY[card.rarity];
    const t = el('div', `toast ${cotd ? 'cotd' : ''}`);
    t.style.setProperty('--c', r.color);
    t.innerHTML = `
      <img src="${faceUrl(card)}" alt=""/>
      <div class="toast-text">
        <div class="toast-kicker">${cotd ? 'Card of the Day · ' : ''}${isNew ? 'New · ' : ''}${cardNo(card.no)}</div>
        <div class="toast-name">${card.name}</div>
        <div class="toast-rarity">${r.label}</div>
      </div>`;
    this.toasts.prepend(t);
    while (this.toasts.children.length > 4) this.toasts.lastElementChild?.remove();
    setTimeout(() => t.classList.add('out'), 3800);
    setTimeout(() => t.remove(), 4400);
    this.handKey = '';
  }

  notice(text: string): void {
    this.notices.textContent = text;
    this.notices.classList.add('show');
    this.noticeTimer = 2.2;
  }

  denied(id: SpellId, reason: string): void {
    const slot = this.slots.get(id);
    if (slot) {
      slot.classList.remove('deny');
      void slot.offsetWidth;
      slot.classList.add('deny');
    }
    if (reason !== 'Recharging') this.notice(reason);
  }

  cast(id: SpellId): void {
    const slot = this.slots.get(id);
    if (!slot) return;
    slot.classList.remove('fired');
    void slot.offsetWidth;
    slot.classList.add('fired');
  }

  hurt(): void {
    this.hurtVeil.classList.remove('on');
    void this.hurtVeil.offsetWidth;
    this.hurtVeil.classList.add('on');
  }

  showBanner(title: string, sub: string): void {
    must(this.banner, '.banner-title').textContent = title;
    must(this.banner, '.banner-sub').textContent = sub;
    this.banner.classList.remove('show');
    void this.banner.offsetWidth;
    this.banner.classList.add('show');
    this.bannerTimer = 3.2;
    this.regionLabel.textContent = title;
  }

  // --- per frame ------------------------------------------------------------------

  update(dt: number, game: Game): void {
    const p = game.player;
    this.hpFill.style.transform = `scaleX(${(p.hp / p.maxHp).toFixed(3)})`;
    this.hpText.textContent = String(Math.ceil(p.hp));
    this.auraFill.style.transform = `scaleX(${(p.aura / p.maxAura).toFixed(3)})`;
    this.auraText.textContent = String(Math.floor(p.aura));

    for (const s of SPELLS) {
      const slot = this.slots.get(s.id);
      if (!slot) continue;
      const cd = game.spells.cooldowns[s.id];
      slot.style.setProperty('--cd', s.cooldown > 0 ? (cd / s.cooldown).toFixed(3) : '0');
      slot.classList.toggle('low', p.aura < s.cost);
      slot.classList.toggle('active', (s.id === 'ward' && game.spells.wardTime > 0) || (s.id === 'homeward' && game.spells.channel > 0));
    }

    const channel = game.spells.channel;
    this.channel.classList.toggle('show', channel > 0);
    if (channel > 0) this.channelFill.style.transform = `scaleX(${Math.min(1, channel / 1.5).toFixed(3)})`;

    if (this.noticeTimer > 0) {
      this.noticeTimer -= dt;
      if (this.noticeTimer <= 0) this.notices.classList.remove('show');
    }
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.banner.classList.remove('show');
    }

    const status = game.cards.dealStatus();
    const key = status.map((s) => (s.found ? '1' : '0')).join('');
    if (key !== this.handKey) {
      this.handKey = key;
      this.handStrip.innerHTML = status.map(miniHtml).join('');
      this.handCount.textContent = `${game.cards.foundToday}/${status.length}`;
      this.binderCount.textContent = `${game.cards.binder.uniqueCount()}/${CARDS.length}`;
    }

    this.drawMinimap(game);
  }

  private drawMinimap(game: Game): void {
    const ctx = this.mapCtx;
    const S = this.mapCanvas.width;
    const toMap = (v: number) => ((v + HALF) / WORLD) * S;
    ctx.clearRect(0, 0, S, S);
    ctx.save();
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2 - 1, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(this.mapBase, 0, 0, S, S);

    const k = S / 184;
    for (const c of game.cards.remaining()) {
      const x = toMap(c.x);
      const y = toMap(c.z);
      ctx.fillStyle = RARITY[c.rarity].color;
      ctx.strokeStyle = 'rgba(10,14,26,0.85)';
      ctx.lineWidth = 1.5 * k;
      if (c.cotd) {
        const pulse = 1 + 0.25 * Math.sin(game.time * 5);
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
          const r = (i % 2 === 0 ? 7 : 3) * k * pulse;
          ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fillStyle = '#fff3c4';
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, 3.2 * k, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    const T = game.world.landmarks.gate;
    ctx.strokeStyle = '#7fe9ff';
    ctx.lineWidth = 2 * k;
    ctx.beginPath();
    ctx.arc(toMap(T.x), toMap(T.z), 4.5 * k, 0, Math.PI * 2);
    ctx.stroke();

    // View cone + player arrow
    const px = toMap(game.player.pos.x);
    const py = toMap(game.player.pos.z);
    const yaw = game.rig.yaw;
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const cone = 0.6;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    const a0 = Math.atan2(fz, fx);
    ctx.arc(px, py, 26 * k, a0 - cone, a0 + cone);
    ctx.closePath();
    ctx.fill();
    const f = game.player.facing;
    const dx = Math.sin(f);
    const dz = Math.cos(f);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#141a2e';
    ctx.lineWidth = 1.5 * k;
    ctx.beginPath();
    ctx.moveTo(px + dx * 7 * k, py + dz * 7 * k);
    ctx.lineTo(px - dx * 4 * k - dz * 4.5 * k, py - dz * 4 * k + dx * 4.5 * k);
    ctx.lineTo(px - dx * 2 * k, py - dz * 2 * k);
    ctx.lineTo(px - dx * 4 * k + dz * 4.5 * k, py - dz * 4 * k - dx * 4.5 * k);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
