// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Hidden mini-games — registry and secret trigger (web extension, narmod
// 2026-10-16). Not in the official QML client.
//
// In training (server « Training vs bots »), typing a game's secret word as
// the nickname and pressing Connect opens that game instead of a table
// (App.connect() in pokerth.js asks tryLaunch() first). The word is the
// translation of the game's i18n key in the current language, plus the
// English word, which works in every language. Matching ignores case,
// accents and surrounding spaces. The real nickname is put back in the field
// and in pth_nick: the secret word is never kept (the field saves every
// keystroke, so the name held before the field was edited is restored).
//
// Adding a game: one entry in GAMES (its own module exporting
// start(shell, ctx)) and its word in every language file. The shared
// overlay, loop, input and best score live in modules/games/shell.mjs.
//
// Loaded when the training mode is selected (pokerth.js), so the check in
// connect() is synchronous; precached by the service worker (sw.js).
// ═══════════════════════════════════════════════════════════════════

export const GAMES = [
  { id: 'ace-runner', wordKey: 'gameWordAce', words: ['mascot'], ach: 'runner',
    load: () => import('./ace-runner.mjs') },
];

const tr = (k) => { try { const s = typeof window.t === 'function' ? window.t(k) : k; return s && s !== k ? s : ''; } catch (e) { return ''; } };

/** Lower case, no accents, no surrounding spaces — « Mascotte » == « mascotte ». */
export function norm(s) {
  return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

/** Id of the game whose secret word is `nick` (current language or English), else null. */
export function gameForNick(nick, translate = tr) {
  const n = norm(nick);
  if (!n) return null;
  for (const g of GAMES) {
    const words = g.words.concat([translate(g.wordKey)]).map(norm).filter(Boolean);
    if (words.indexOf(n) >= 0) return g.id;
  }
  return null;
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
/** Open game `id` (the shell is loaded on demand). Resolves when it closes. */
export async function launch(id) {
  const g = GAMES.find((x) => x.id === id);
  if (!g || open) return;
  open = true;
  try {
    const [shellMod, gameMod] = await Promise.all([import('./shell.mjs'), g.load()]);
    await shellMod.run(g, gameMod);
    // Found it: its secret trophy, granted once the overlay is gone so the
    // trophy toast (and the Ace's cheer) can be seen.
    if (g.ach) {
      const m = await import('../achievements/index.mjs');
      const a = m && m.grantSecret ? m.grantSecret(g.ach) : null;
      if (a) window.dispatchEvent(new CustomEvent('pth-achievement', { detail: a }));
    }
  } catch (e) {
    try { console.warn('[games]', e); } catch (e2) {}
  } finally { open = false; }
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

if (typeof window !== 'undefined') {
  window.PthGames = { tryLaunch, launch, gameForNick, isOpen };
  try {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchNick);
    else watchNick();
  } catch (e) {}
}
