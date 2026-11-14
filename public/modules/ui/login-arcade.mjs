// @ts-check
// ═══════════════════════════════════════════════════════════════════
// The « Mini-games » mode on the login (design note
// claude/CONCEPTION_MODE_ARCADE.md, narmod 2026-11-13; web extension, not in
// the official QML client).
//
// The fourth card of the login (#login-card-arcade) stays hidden until the
// mode is unlocked — enough training trophies (ARCADE_UNLOCK in
// games/index.mjs) or the secret word typed once on this device. It then
// says how many mini-games are open (« The Ace's games · 3/10 open », never
// which ones: the others are mystery games) and carries a « NEW » pill until
// it is opened once (pth_arcade_seen). A tap opens the mini-games page.
//
// Refreshed when the login comes back on screen (a game ended, a trophy won
// at the table), when a trophy is won and when the language changes.
//
// The first time the unlocked mode is on screen (pth_arcade_shown), the card
// appears in a light that comes from behind it (backlight.mjs), then the Ace
// congratulates the player (guide: window.guideArcadeMode). At the table, the
// trophy that unlocks the mode is followed by a toast that does not say what
// it is (pth_arcade_toast).
//
// The secret word typed in training (games/index.mjs, web.40) no longer opens
// the mini-games page: back on the choice of modes (the header unfolds as
// from any mode), the card comes out of a golden egg in a rainbow light, then
// the Ace congratulates — an easter egg. With every game already open, the
// Ace only says so, with a smile (secretWord()).
// ═══════════════════════════════════════════════════════════════════

const SEEN_KEY = 'pth_arcade_seen';
const SHOWN_KEY = 'pth_arcade_shown';
const TOAST_KEY = 'pth_arcade_toast';
// The flags are also kept for the page's life: a storage that refuses them
// (full, blocked) must not bring the light back at every visit (web.26).
const mem = new Set();
const flag = (k) => { if (mem.has(k)) return true; try { return localStorage.getItem(k) === '1'; } catch (e) { return false; } };
/** Set a flag; true when this device keeps it. */
const setFlag = (k) => { mem.add(k); try { localStorage.setItem(k, '1'); return localStorage.getItem(k) === '1'; } catch (e) { return false; } };

// The mode's statistics (games/stats.mjs, server/arcade-stats.js), loaded
// with the games registry.
const stat = (ev) => { import('../games/stats.mjs').then((m) => m.arcadeStat(ev)).catch(() => {}); };

const tr = (k, p) => { try { return typeof window.t === 'function' ? window.t(k, p) : k; } catch (e) { return k; } };
const seen = () => flag(SEEN_KEY);

let last = null;   // the last state shown

/** Show or hide the card from the mode's state (games/index.mjs). */
export async function refresh() {
  const card = document.getElementById('login-card-arcade');
  if (!card) return null;
  let st = null;
  try { st = await (await import('../games/index.mjs')).currentState(); } catch (e) { st = null; }
  last = st;
  // Unlocked by the trophies: counted once per device (the secret word is
  // counted by games/index.mjs).
  try { if (st && st.mode && st.count >= 8 && !(await import('../games/index.mjs')).allUnlocked()) (await import('../games/index.mjs')).countUnlock('trophies'); } catch (e) {}
  render();
  return st;
}

let celebrating = false;
/** The login's choice of modes is on screen (not a game, not the form). */
function loginShown() {
  try {
    const sc = document.getElementById('s-connect'), s1 = document.getElementById('login-step1');
    return !!(sc && sc.classList.contains('active') && s1 && s1.style.display !== 'none' && !document.hidden && !document.getElementById('pth-game'));
  } catch (e) { return false; }
}
/** The mode's first appearance: the card in the light, then the Ace. */
async function celebrate(card) {
  celebrating = true;
  // Not while the page is still coming in: let the login settle first.
  const wait = 1800 - (typeof performance !== 'undefined' ? performance.now() : 0);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  if (!loginShown()) { celebrating = false; return; }
  const kept = setFlag(SHOWN_KEY);
  setFlag(TOAST_KEY);   // seen on the login: no toast for it later
  // Not kept on this device: no light at all rather than the same light at
  // every start (the card is simply there).
  if (!kept) { celebrating = false; return; }
  stat('celebrated');
  card.classList.add('lc-hide');
  try { card.scrollIntoView({ block: 'nearest' }); } catch (e) {}
  try {
    const { backlight, motionOff } = await import('./backlight.mjs');
    const soft = motionOff();
    await backlight(card, { onFlash: () => { card.classList.remove('lc-hide'); card.classList.add(soft ? 'lc-fade' : 'lc-mat'); } });
  } catch (e) { card.classList.remove('lc-hide'); }
  setTimeout(() => card.classList.remove('lc-mat', 'lc-fade'), 1800);
  celebrating = false;
  try { if (typeof window.guideArcadeMode === 'function') window.guideArcadeMode(); } catch (e) {}
}

/**
 * The secret word (games/index.mjs): back on the choice of modes, then the
 * easter egg — or, with every game already open (`already`), the Ace's joke.
 */
export async function secretWord(already) {
  celebrating = true;   // no ordinary light meanwhile
  try {
    // Back on the choice of modes, the header unfolding as from any mode.
    if (typeof window.loginBackToStep1 === 'function') window.loginBackToStep1();
    await new Promise((r) => setTimeout(r, soft() ? 50 : FOLD_MS + 120));
    await refresh();
    const card = document.getElementById('login-card-arcade');
    const guide = (again) => { try { if (typeof window.guideArcadeEgg === 'function') window.guideArcadeEgg(again); } catch (e) {} };
    if (already || !card || card.hidden) {
      guide(true);
      if (typeof window.guideArcadeEgg !== 'function') { try { window.showToast && window.showToast('🕹️ ' + tr('arcadeToast')); } catch (e) {} }
      return;
    }
    setFlag(SHOWN_KEY);
    setFlag(TOAST_KEY);
    stat('celebrated');
    card.classList.add('lc-hide');
    try { card.scrollIntoView({ block: 'nearest' }); } catch (e) {}
    try {
      const { backlight, motionOff } = await import('./backlight.mjs');
      const off = motionOff();
      await backlight(card, { egg: true, onFlash: () => { card.classList.remove('lc-hide'); card.classList.add(off ? 'lc-fade' : 'lc-egg'); } });
    } catch (e) { card.classList.remove('lc-hide'); }
    setTimeout(() => card.classList.remove('lc-egg', 'lc-fade'), 3800);
    guide(false);
  } finally { celebrating = false; }
}

function render() {
  const card = document.getElementById('login-card-arcade');
  if (!card) return;
  const st = last;
  const on = !!(st && st.mode);
  card.hidden = !on;
  if (!on) return;
  if (!celebrating && !flag(SHOWN_KEY) && loginShown()) celebrate(card);
  const d = document.getElementById('lc-arcade-desc');
  if (d) d.textContent = tr('loginArcadeDesc', { n: st.open, t: st.total });
  const n = document.getElementById('lc-arcade-new');
  if (n) n.hidden = seen();
}

// The login's header folds away as for the other modes (loginHeaderFold in
// pokerth-client.html, 0.38 s), then the mini-games page opens; back on the
// login, it unfolds again (web.27).
const FOLD_MS = 380;
let back = false;      // the mini-games page was opened from the login
const soft = () => { try { return document.documentElement.classList.contains('reduce-fx') || window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
/** Back on the login: the header, folded for a frame, unfolds in its transition. */
function unfold() {
  const card = document.querySelector('#s-connect .card'), logo = card && card.querySelector('.card-logo');
  if (!card || !logo || typeof window.loginHeaderFold !== 'function' || soft()) return;
  // The login has just come back (its header already unfolded at once): fold
  // it again without the transition, then let it unfold in it.
  requestAnimationFrame(() => {
    logo.style.transition = 'none';
    window.loginHeaderFold(true);
    void logo.offsetHeight;
    logo.style.transition = '';
    requestAnimationFrame(() => { try { window.loginHeaderFold(false); } catch (e) {} });
  });
}

/** The card's tap: the mini-games page. */
export async function openArcade() {
  setFlag(SEEN_KEY);
  stat('login_open');
  try { if (typeof window.guideArcadeModeClose === 'function') window.guideArcadeModeClose(); } catch (e) {}
  render();
  try {
    const g = await import('../games/index.mjs');
    if (g.isOpen()) return;
    if (loginShown() && typeof window.loginHeaderFold === 'function') {
      window.loginHeaderFold(true);
      if (!soft()) await new Promise((r) => setTimeout(r, FOLD_MS));
      back = true;
    }
    await g.launch(g.HOME);
  } catch (e) { try { console.warn('[arcade]', e); } catch (e2) {} }
  back = false;
  refresh();
}

if (typeof window !== 'undefined') {
  window.loginOpenArcade = openArcade;
  window.loginSecretWord = secretWord;
  // A trophy won: the mode may have just been unlocked. At the table, a toast
  // after the trophy's own (the card waits for the login to appear).
  // A training game ended (offline/server.mjs): with the mode unlocked or not
  // yet — does the suspense bring more training games?
  window.addEventListener('pth-training-over', async () => {
    try { const st = await (await import('../games/index.mjs')).currentState(); stat(st && st.mode ? 'train_on' : 'train_off'); } catch (e) {}
  });
  window.addEventListener('pth-achievement', async () => {
    const st = await refresh();
    if (st && st.mode && !flag(TOAST_KEY) && !loginShown()) {
      if (!setFlag(TOAST_KEY)) return;   // not kept: not at every trophy
      stat('toast');
      setTimeout(() => { try { if (typeof window.showToast === 'function') window.showToast('🕹️ ' + tr('arcadeToast')); } catch (e) {} }, 2600);
    }
  });
  try {
    const go = () => {
      refresh();
      // The login comes back on screen (inactive → active).
      const sc = document.getElementById('s-connect');
      if (sc && window.MutationObserver) {
        let was = sc.classList.contains('active');
        new MutationObserver(() => {
          const now = sc.classList.contains('active');
          if (now && !was) { if (back) { back = false; unfold(); } refresh(); }
          was = now;
        }).observe(sc, { attributes: true, attributeFilter: ['class'] });
      }
      // The language changes (i18n sets <html lang>): the count is re-worded.
      new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
    else go();
  } catch (e) {}
}
