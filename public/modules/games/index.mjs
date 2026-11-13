// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Hidden mini-games — registry and secret trigger (web extension, narmod
// 2026-10-16). Not in the official QML client.
//
// In training (server « Training vs bots »), typing the secret word as the
// nickname and pressing Connect opens the mini-games page (menu.mjs: Ace Runner,
// House of Cards, Poker Solitaire… Ace Dash, Poker Run) instead of a table (App.connect() in pokerth.js asks
// tryLaunch() first). The word is the translation of gameWordAce (« mascot »)
// in the current language, plus the English word, which works in every
// language. Matching ignores case,
// accents and surrounding spaces. The real nickname is put back in the field
// and in pth_nick: the secret word is never kept (the field saves every
// keystroke, so the name held before the field was edited is restored).
//
// Adding a game: one entry in GAMES (its own module exporting create(shell),
// see shell.mjs) and its name and texts in every language file; the menu
// lists it by itself. The shared overlay, loop, input and best score live in
// shell.mjs, the Ace and the deck helpers in common.mjs.
//
// Loaded when the training mode is selected (pokerth.js), so the check in
// connect() is synchronous; precached by the service worker (sw.js).
// ═══════════════════════════════════════════════════════════════════

import { arcadeStat } from './stats.mjs';

export const HOME = 'arcade';
// The « Mini-games » mode (design note claude/CONCEPTION_MODE_ARCADE.md,
// narmod 2026-11-13). The home page (menu.mjs) lists the games in this order,
// a path that alternates a game to get better at poker (kind 'learn') and a
// game for fun (kind 'fun'): reading hands → odds → choosing → building →
// playing an opponent, and one button → timing → light strategy → 3D → the car.
// page: no stage (the home page); rulesKey: the rules sheet (« ? » in the
// header, « Rules » on the home page); aspect: the stage's width / height range.
// unlock: what opens the game in the Mini-games mode: {} from the start,
// { trophy: id } once that trophy is won, { trophies: n } with n training
// trophies won in all — the secret ones included (a mini-game's trophy brings
// the next game closer). The mode itself appears at ARCADE_UNLOCK; then one
// game every 2 trophies, the last at 27 = every trophy that is not secret, so
// that all of them can be opened without the secret ones. The secret word
// opens everything (ALL_KEY).
export const ARCADE_UNLOCK = { trophies: 8 };
export const GAMES = [
  { id: HOME, nameKey: 'gmTitle', name: 'Mini-games', page: true, load: () => import('./menu.mjs') },
  { id: 'whowins', kind: 'learn', unlock: { trophies: 8 }, nameKey: 'wwName', icon: '⚖️', rulesKey: 'wwRules', aspect: [0.6, 2.2], load: () => import('./whowins.mjs') },
  { id: 'ace-runner', kind: 'fun', unlock: { trophies: 10 }, name: 'Ace Runner', icon: '🏃', rulesKey: 'arRules', aspect: [4 / 3, 2.4], load: () => import('./ace-runner.mjs') },
  { id: 'hilo', kind: 'learn', unlock: { trophies: 12 }, nameKey: 'hlName', icon: '↕️', rulesKey: 'hlRules', aspect: [0.6, 2.2], load: () => import('./hilo.mjs') },
  { id: 'house', kind: 'fun', unlock: { trophies: 14 }, nameKey: 'hcName', icon: '🃏', rulesKey: 'hcRules', aspect: [4 / 3, 2.4], load: () => import('./house.mjs') },
  { id: 'videopoker', kind: 'learn', unlock: { trophies: 16 }, nameKey: 'vpName', icon: '🎰', rulesKey: 'vpRules', aspect: [0.6, 2.2], load: () => import('./videopoker.mjs') },
  { id: 'pokerdrop', kind: 'fun', unlock: { trophies: 18 }, nameKey: 'pdName', icon: '⬇️', rulesKey: 'pdRules', aspect: [0.6, 2.2], load: () => import('./pokerdrop.mjs') },
  { id: 'solitaire', kind: 'learn', unlock: { trophies: 20 }, nameKey: 'psName', icon: '♠', rulesKey: 'psRules', aspect: [1.25, 2.2], load: () => import('./solitaire.mjs') },
  { id: 'ace-dash', kind: 'fun', unlock: { trophies: 22 }, name: 'Ace Dash', icon: '🏁', rulesKey: 'adRules', aspect: [0.6, 1.9], load: () => import('./ace-dash.mjs') },
  { id: 'bluff', kind: 'learn', unlock: { trophies: 24 }, nameKey: 'blName', icon: '🎭', rulesKey: 'blRules', aspect: [0.6, 2.2], load: () => import('./bluff.mjs') },
  { id: 'poker-run', kind: 'fun', unlock: { trophies: 27 }, name: 'Poker Run', icon: '🏎️', rulesKey: 'prRules', aspect: [0.6, 1.9], load: () => import('./poker-run.mjs') },
];
/**
 * Is game `g` open in the Mini-games mode? have = { count, owned }: the number
 * of trophies won and the set of their ids.
 */
export function unlocked(g, have) {
  const u = (g && g.unlock) || {};
  if (u.trophy && !(have.owned && have.owned.has(u.trophy))) return false;
  if (u.trophies && (have.count || 0) < u.trophies) return false;
  return true;
}

// ── The state of the Mini-games mode ──────────────────────────────
// The secret word opens the mode with every game, for good, on this device
// only (not synced).
export const ALL_KEY = 'pth_arcade_all';
export function allUnlocked() { try { return localStorage.getItem(ALL_KEY) === '1'; } catch (e) { return false; } }
export function unlockAll() { try { localStorage.setItem(ALL_KEY, '1'); } catch (e) {} }
// The mode's unlocking, counted once per device (server/arcade-stats.js).
export const UNLOCK_SENT_KEY = 'pth_arcade_unl';
export function countUnlock(how) {
  try { if (localStorage.getItem(UNLOCK_SENT_KEY) === '1') return; localStorage.setItem(UNLOCK_SENT_KEY, '1'); } catch (e) { return; }
  arcadeStat(how === 'word' ? 'unlock_word' : 'unlock_trophies');
}

// ── The games already played ──────────────────────────────────────
// Before the mode (web.21) the secret word opened every game and kept
// nothing on the device. A game already played there stays open (narmod
// 2026-11-14, choice B): its own secret trophy or its best score says so.
// Ace Dash and Poker Run have no trophy: their best score only.
export const GAME_TROPHY = { 'ace-runner': 'runner', house: 'house', solitaire: 'solitaire', videopoker: 'videopoker',
  whowins: 'whowins', hilo: 'hilo', bluff: 'bluff', pokerdrop: 'pdrop' };
/** The games already played on this device (owned: the trophies won). */
export function playedGames(owned) {
  const s = new Set();
  for (const g of GAMES) {
    if (g.id === HOME) continue;
    if (owned && GAME_TROPHY[g.id] && owned.has(GAME_TROPHY[g.id])) s.add(g.id);
    try { if ((parseInt(localStorage.getItem('pth_game_best_' + g.id) || '0', 10) || 0) > 0) s.add(g.id); } catch (e) {}
  }
  return s;
}

/**
 * The mode from the trophies won (have, as for unlocked(), plus played: the
 * games already played) and the secret word (all): { mode: shown on the
 * login, open: games open, total, games: [{ id, kind, open, played, need }] }
 * — need: the trophies its threshold asks for.
 */
export function arcadeState(have, all) {
  const h = have || { count: 0, owned: new Set() };
  const played = h.played || new Set();
  const games = GAMES.filter((g) => g.id !== HOME).map((g) => ({
    id: g.id, kind: g.kind, open: !!all || unlocked(g, h) || played.has(g.id), played: played.has(g.id),
    need: (g.unlock && g.unlock.trophies) || 0,
  }));
  return {
    mode: !!all || (h.count || 0) >= ARCADE_UNLOCK.trophies || games.some((g) => g.played),
    open: games.filter((g) => g.open).length, total: games.length, count: h.count || 0, games,
  };
}
/** The trophies won in training on this device: { count, owned }. */
export async function trophiesWon() {
  try {
    const m = await import('../achievements/index.mjs');
    const owned = new Set(m.createAchievements({}).snapshot().filter((a) => a.unlocked).map((a) => a.id));
    return { count: owned.size, owned, played: playedGames(owned) };
  } catch (e) { return { count: 0, owned: new Set(), played: new Set() }; }
}
/** The current state of the mode on this device (see arcadeState). */
export async function currentState() { return arcadeState(await trophiesWon(), allUnlocked()); }
// Secret words → what they open.
export const TRIGGERS = [{ wordKey: 'gameWordAce', words: ['mascot'], open: HOME }];

/** Display name of a game in the current language. */
export function gameName(g, translate = tr) { return g.nameKey ? (translate(g.nameKey) || g.name || g.id) : g.name; }

const tr = (k) => { try { const s = typeof window.t === 'function' ? window.t(k) : k; return s && s !== k ? s : ''; } catch (e) { return ''; } };

/** Lower case, no accents, no surrounding spaces — « Mascotte » == « mascotte ». */
export function norm(s) {
  return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

/** What the secret word `nick` opens (current language or English), else null. */
export function gameForNick(nick, translate = tr) {
  const n = norm(nick);
  if (!n) return null;
  for (const tg of TRIGGERS) {
    const words = tg.words.concat([translate(tg.wordKey)]).map(norm).filter(Boolean);
    if (words.indexOf(n) >= 0) return tg.open;
  }
  return null;
}

/** [def, module] of game `id`. */
export async function loadGame(id) {
  const g = GAMES.find((x) => x.id === id);
  if (!g) throw new Error('unknown game ' + id);
  if (id !== HOME) arcadeStat('open_' + id);
  return [Object.assign({}, g, { name: gameName(g) }), await g.load()];
}

// ── The nickname held before the field was edited ─────────────────
let savedNick = '';
function stored() { try { return window._pthNick ? window._pthNick.get() : ''; } catch (e) { return ''; } }
function remember(v) { if (v && !gameForNick(v)) savedNick = v; }
function watchNick() {
  const el = typeof document !== 'undefined' ? document.getElementById('nick') : null;
  if (!el || el._pthGameWatch) return;
  el._pthGameWatch = true;
  remember(stored());
  el.addEventListener('focus', () => remember(el.value.trim() || stored()));
}
function restoreNick() {
  const el = document.getElementById('nick');
  const v = savedNick;
  if (el) el.value = v;
  try {
    if (v) window._pthNick.set(v);
    else localStorage.removeItem('pth_nick');
  } catch (e) {}
}

let open = false;
let shellNow = null;          // the running shell (back / rules from the header)
/** Open game `id` (the shell is loaded on demand). Resolves when it closes. */
export async function launch(id) {
  const g = GAMES.find((x) => x.id === id);
  if (!g || open) return;
  open = true;
  if (id === HOME) {
    // A session of the Mini-games mode (the « Narrow to » cube, once per
    // browser session) and the page opened, whatever the way in.
    arcadeStat('menu_open');
    try { if (typeof window._pthCountConnect === 'function') window._pthCountConnect('arcade'); } catch (e) {}
  }
  try {
    const [shellMod, [def, gameMod]] = await Promise.all([import('./shell.mjs'), loadGame(id)]);
    const grants = await shellMod.run(def, gameMod, { open: loadGame, home: HOME, onShell: (s) => { shellNow = s; } });
    shellNow = null;
    // Secret trophies the games asked for, granted once the overlay is gone
    // so the trophy toast (and the Ace's cheer) can be seen.
    if (grants && grants.length) {
      const m = await import('../achievements/index.mjs');
      for (const id2 of grants) {
        const a = m && m.grantSecret ? m.grantSecret(id2) : null;
        if (a) window.dispatchEvent(new CustomEvent('pth-achievement', { detail: a }));
      }
    }
  } catch (e) {
    try { console.warn('[games]', e); } catch (e2) {}
  } finally { open = false; shellNow = null; }
}

/** Called by App.connect() in training: true when a game opened instead. */
export function tryLaunch(nick) {
  const id = gameForNick(nick);
  if (!id) return false;
  if (!allUnlocked()) countUnlock('word');
  unlockAll();
  restoreNick();
  launch(id);
  return true;
}

export function isOpen() { return open; }
/** The arcade page's back arrow (and Android's Back): rules → home → out. */
export function back() { if (shellNow) shellNow.back(); }
/** The « ? » of the arcade page: the rules of the game on screen. */
export function rules() { if (shellNow) shellNow.rules(); }

if (typeof window !== 'undefined') {
  window.PthGames = { tryLaunch, launch, gameForNick, isOpen, back, rules, currentState };
  try {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchNick);
    else watchNick();
  } catch (e) {}
}
