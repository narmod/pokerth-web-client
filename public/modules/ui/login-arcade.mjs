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
// ═══════════════════════════════════════════════════════════════════

const SEEN_KEY = 'pth_arcade_seen';

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

function render() {
  const card = document.getElementById('login-card-arcade');
  if (!card) return;
  const st = last;
  const on = !!(st && st.mode);
  card.hidden = !on;
  if (!on) return;
  const d = document.getElementById('lc-arcade-desc');
  if (d) d.textContent = tr('loginArcadeDesc', { n: st.open, t: st.total });
  const n = document.getElementById('lc-arcade-new');
  if (n) n.hidden = seen();
}

/** The card's tap: the mini-games page. */
export async function openArcade() {
  try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
  render();
  try {
    const g = await import('../games/index.mjs');
    await g.launch(g.HOME);
  } catch (e) { try { console.warn('[arcade]', e); } catch (e2) {} }
  refresh();
}

if (typeof window !== 'undefined') {
  window.loginOpenArcade = openArcade;
  window.addEventListener('pth-achievement', () => { refresh(); });
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
