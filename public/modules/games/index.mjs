// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Hidden mini-games — registry and secret trigger (web extension, narmod
// 2026-10-16). Not in the official QML client.
//
// In training (server « Training vs bots »), typing the secret word as the
// nickname and pressing Connect opens the arcade menu (menu.mjs: Ace Runner,
// House of Cards, Poker Solitaire…) instead of a table (App.connect() in pokerth.js asks
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

export const HOME = 'arcade';
// page: no stage (the arcade's home); rulesKey: the rules sheet (« ? » in the
// header, « Rules » on the home page); aspect: the stage's width / height range.
export const GAMES = [
  { id: HOME, name: 'Arcade', page: true, load: () => import('./menu.mjs') },
  { id: 'ace-runner', name: 'Ace Runner', icon: '🏃', rulesKey: 'arRules', aspect: [4 / 3, 2.4], load: () => import('./ace-runner.mjs') },
  { id: 'house', nameKey: 'hcName', icon: '🃏', rulesKey: 'hcRules', aspect: [4 / 3, 2.4], load: () => import('./house.mjs') },
  { id: 'solitaire', nameKey: 'psName', icon: '♠', rulesKey: 'psRules', aspect: [1.25, 2.2], load: () => import('./solitaire.mjs') },
];
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
  window.PthGames = { tryLaunch, launch, gameForNick, isOpen, back, rules };
  try {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchNick);
    else watchNick();
  } catch (e) {}
}
