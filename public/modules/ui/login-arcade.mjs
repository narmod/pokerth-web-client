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
// ═══════════════════════════════════════════════════════════════════

const SEEN_KEY = 'pth_arcade_seen';
const SHOWN_KEY = 'pth_arcade_shown';
const TOAST_KEY = 'pth_arcade_toast';
const flag = (k) => { try { return localStorage.getItem(k) === '1'; } catch (e) { return false; } };
const setFlag = (k) => { try { localStorage.setItem(k, '1'); } catch (e) {} };

const tr = (k, p) => { try { return typeof window.t === 'function' ? window.t(k, p) : k; } catch (e) { return k; } };
const seen = () => { try { return localStorage.getItem(SEEN_KEY) === '1'; } catch (e) { return false; } };

let last = null;   // the last state shown

/** Show or hide the card from the mode's state (games/index.mjs). */
export async function refresh() {
  const card = document.getElementById('login-card-arcade');
  if (!card) return null;
  let st = null;
  try { st = await (await import('../games/index.mjs')).currentState(); } catch (e) { st = null; }
  last = st;
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
  setFlag(SHOWN_KEY);
  setFlag(TOAST_KEY);   // seen on the login: no toast for it later
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

/** The card's tap: the mini-games page. */
export async function openArcade() {
  try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
  try { if (typeof window.guideArcadeModeClose === 'function') window.guideArcadeModeClose(); } catch (e) {}
  render();
  try {
    const g = await import('../games/index.mjs');
    await g.launch(g.HOME);
  } catch (e) { try { console.warn('[arcade]', e); } catch (e2) {} }
  refresh();
}

if (typeof window !== 'undefined') {
  window.loginOpenArcade = openArcade;
  // A trophy won: the mode may have just been unlocked. At the table, a toast
  // after the trophy's own (the card waits for the login to appear).
  window.addEventListener('pth-achievement', async () => {
    const st = await refresh();
    if (st && st.mode && !flag(TOAST_KEY) && !loginShown()) {
      setFlag(TOAST_KEY);
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
          if (now && !was) refresh();
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
