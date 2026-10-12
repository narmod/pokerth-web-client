// ═══════════════════════════════════════════════════════════════════
// Small tooltip for compact, icon-only figures — web extension, no QML
// counterpart.
//
// A native title= is not enough for these: it never shows on a touch
// screen, and on desktop it only appears after a long, unstyled delay. This
// shows the element's data-tip text in one floating bubble:
//   · mouse / pen hover  → on enter, hidden on leave;
//   · touch long-press   → after HOLD_MS, kept a moment after the finger
//                          lifts, and the click that would follow the
//                          press is swallowed (the figures can sit inside a
//                          button, and a long-press must not activate it).
// A plain short tap is left alone, so the surrounding control still works.
//
// attachHoldTip(root, selector) wires every current and future element
// matching `selector` inside `root` (event delegation — the content of root
// can be re-rendered freely).
// ═══════════════════════════════════════════════════════════════════

const HOLD_MS = 450;
const MOVE_PX = 10;
const LINGER_MS = 2200;
const TIP_ID = 'hold-tip';

let _tip = null;
let _hideTimer = null;
let _swallowClick = false;

function _bubble() {
  if (_tip && _tip.isConnected) return _tip;
  _tip = document.createElement('div');
  _tip.id = TIP_ID;
  _tip.className = 'hold-tip';
  _tip.setAttribute('role', 'tooltip');
  // Inline floor, same reasoning as live-stats: the bubble must stay usable
  // with a stale stylesheet. Looks come from pokerth.css (.hold-tip).
  _tip.style.position = 'fixed';
  _tip.style.zIndex = '10000';
  _tip.style.pointerEvents = 'none';
  _tip.style.display = 'none';
  document.body.appendChild(_tip);
  return _tip;
}

function _hide() {
  if (_hideTimer) { clearTimeout(_hideTimer); _hideTimer = null; }
  if (_tip) _tip.style.display = 'none';
}

function _show(el) {
  const text = el && el.getAttribute('data-tip');
  if (!text) return;
  if (_hideTimer) { clearTimeout(_hideTimer); _hideTimer = null; }
  const tip = _bubble();
  tip.textContent = text;
  tip.style.display = 'block';
  tip.style.left = '0px';
  tip.style.top = '0px';
  const r = el.getBoundingClientRect();
  const tw = tip.offsetWidth;
  const th = tip.offsetHeight;
  const vw = document.documentElement.clientWidth || window.innerWidth;
  let left = r.left + r.width / 2 - tw / 2;
  left = Math.max(6, Math.min(left, vw - tw - 6));
  // Above the figure by default; below when there is no room (top of screen).
  let top = r.top - th - 8;
  if (top < 6) top = r.bottom + 8;
  tip.style.left = Math.round(left) + 'px';
  tip.style.top = Math.round(top) + 'px';
}

export function attachHoldTip(root, selector) {
  if (!root || root._holdTip) return;
  root._holdTip = true;

  let holdTimer = null;
  let startX = 0;
  let startY = 0;

  function cancelHold() {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  }

  root.addEventListener('pointerover', function (ev) {
    if (ev.pointerType === 'touch') return;
    const el = ev.target.closest && ev.target.closest(selector);
    if (el && root.contains(el)) _show(el);
  });
  root.addEventListener('pointerout', function (ev) {
    if (ev.pointerType === 'touch') return;
    const el = ev.target.closest && ev.target.closest(selector);
    if (!el) return;
    if (ev.relatedTarget && el.contains(ev.relatedTarget)) return;
    _hide();
  });

  root.addEventListener('pointerdown', function (ev) {
    if (ev.pointerType !== 'touch') return;
    const el = ev.target.closest && ev.target.closest(selector);
    if (!el || !root.contains(el)) return;
    _swallowClick = false;
    startX = ev.clientX;
    startY = ev.clientY;
    cancelHold();
    holdTimer = setTimeout(function () {
      holdTimer = null;
      _swallowClick = true;
      _show(el);
    }, HOLD_MS);
  });
  root.addEventListener('pointermove', function (ev) {
    if (!holdTimer || ev.pointerType !== 'touch') return;
    if (Math.abs(ev.clientX - startX) > MOVE_PX || Math.abs(ev.clientY - startY) > MOVE_PX) cancelHold();
  });
  function release() {
    cancelHold();
    if (_swallowClick && _tip && _tip.style.display !== 'none') {
      if (_hideTimer) clearTimeout(_hideTimer);
      _hideTimer = setTimeout(_hide, LINGER_MS);
    }
    // The click that follows a long-press arrives right after the lift; past
    // that window nothing is swallowed, whatever happened in between.
    if (_swallowClick) setTimeout(function () { _swallowClick = false; }, 600);
  }
  root.addEventListener('pointerup', release);
  root.addEventListener('pointercancel', release);

  // The OS long-press menu (copy / share…) would cover the bubble.
  root.addEventListener('contextmenu', function (ev) {
    const el = ev.target.closest && ev.target.closest(selector);
    if (el && root.contains(el)) ev.preventDefault();
  });
}

// One document-level guard, shared by every root: capture phase, so it runs
// before the inline onclick of an enclosing button.
document.addEventListener('click', function (ev) {
  if (!_swallowClick) return;
  _swallowClick = false;
  ev.preventDefault();
  ev.stopPropagation();
}, true);

// Any other touch or a scroll dismisses a lingering bubble.
document.addEventListener('pointerdown', function (ev) {
  _swallowClick = false;
  if (_tip && _tip.style.display !== 'none' && !(ev.target.closest && ev.target.closest('[data-tip]'))) _hide();
}, true);
window.addEventListener('scroll', _hide, true);
