// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Login screen flourish (web extension, narmod 2026-09-26).
//
//   • Dancing suits — the ♠ ♥ ♦ ♣ row under the title hops in a wave,
//     twice, each time the login screen is shown (after the boot splash
//     has faded, and again when coming back from the lobby), then again
//     after every 30 s spent idle on it (any click, tap or key press
//     restarts the count; paused while the tab is hidden).
//   • Coin flip — a click / tap on the PokerTH chip tosses it like a coin
//     (jump + spin on the X axis) and lands it back in place.
//
// Pure decoration: nothing is added to the DOM, only Web Animations on the
// existing .card-suits-row spans and .card-chip image, so layout, IDs and
// handlers are untouched. Skipped entirely under « Reduced effects »
// (html.reduce-fx) and prefers-reduced-motion.
// ═══════════════════════════════════════════════════════════════════

const DANCE = [
  { transform: 'translateY(0) rotate(0deg)' },
  { transform: 'translateY(-0.45em) rotate(-12deg)', offset: 0.3 },
  { transform: 'translateY(0) rotate(8deg)', offset: 0.6 },
  { transform: 'translateY(0) rotate(0deg)' },
];
const FLIP = [
  { transform: 'translateY(0) rotateX(0deg)' },
  { transform: 'translateY(-38%) rotateX(900deg)', offset: 0.45 },
  { transform: 'translateY(0) rotateX(1800deg)', offset: 0.85 },
  { transform: 'translateY(-5%) rotateX(1800deg)', offset: 0.92 },
  { transform: 'translateY(0) rotateX(1800deg)' },
];

/** True when decorative motion must be skipped (exported for tests). */
export function lfMotionOff(doc = document, win = window) {
  try { if (doc.documentElement.classList.contains('reduce-fx')) return true; } catch (e) {}
  try { if (win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches) return true; } catch (e) {}
  return false;
}

function canAnimate(el) { return !!(el && typeof el.animate === 'function'); }

/** Suits wave: each suit hops, staggered, twice. */
export function lfDanceSuits() {
  if (lfMotionOff()) return;
  const row = document.querySelector('#s-connect .card-suits-row');
  if (!row || !row.offsetParent) return;          // hidden (short screens)
  row.querySelectorAll('span').forEach((s, i) => {
    if (!canAnimate(s)) return;
    s.animate(DANCE, { duration: 700, delay: 250 + i * 120, iterations: 2, easing: 'ease-in-out' });
  });
}

let _flipping = false;
/** Coin toss of the login chip. */
export function lfFlipChip() {
  if (_flipping || lfMotionOff()) return;
  const chip = document.querySelector('#s-connect .card-chip');
  if (!canAnimate(chip)) return;
  _flipping = true;
  const a = chip.animate(FLIP, { duration: 1300, easing: 'cubic-bezier(.3,.6,.4,1)' });
  const done = () => { _flipping = false; };
  a.onfinish = done; a.oncancel = done;
}

const IDLE_MS = 30000;   // idle time on the login screen before a new dance

function splashGone() {
  const sp = document.getElementById('boot-splash');
  return !sp || sp.classList.contains('bs-hide');
}

function init() {
  const sc = document.getElementById('s-connect');
  if (!sc) return;
  const chip = sc.querySelector('.card-chip');
  if (chip) {
    chip.addEventListener('click', lfFlipChip);
    chip.addEventListener('dragstart', (e) => e.preventDefault());
  }
  let wasActive = false;
  let idleT = 0;
  const disarm = () => { if (idleT) { clearTimeout(idleT); idleT = 0; } };
  const arm = () => {
    disarm();
    if (!wasActive) return;
    idleT = setTimeout(() => {
      idleT = 0;
      if (!wasActive || !sc.classList.contains('active')) return;
      if (!document.hidden) lfDanceSuits();
      arm();
    }, IDLE_MS);
  };
  ['pointerdown', 'keydown', 'input'].forEach((ev) =>
    document.addEventListener(ev, () => { if (wasActive) arm(); }, { capture: true, passive: true }));
  const check = () => {
    const now = sc.classList.contains('active');
    if (now && !wasActive && splashGone()) { wasActive = true; setTimeout(lfDanceSuits, 350); arm(); }
    else if (!now) { wasActive = false; disarm(); }
  };
  new MutationObserver(check).observe(sc, { attributes: true, attributeFilter: ['class'] });
  // First display: wait for the boot splash to fade out.
  const sp = document.getElementById('boot-splash');
  if (sp && !splashGone()) {
    const mo = new MutationObserver(() => { if (splashGone()) { mo.disconnect(); check(); } });
    mo.observe(sp, { attributes: true, attributeFilter: ['class'] });
  } else check();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}
