// ═══════════════════════════════════════════════════════════════════
// Ace's Help — highlight (web extension, narmod 2026-09-30).
//
// A pulsing gold outline around one element (D7: no dark overlay, nothing
// blocks the page). The ring is a separate fixed element that never takes a
// click; it follows its target on scroll (any scroller), resize and layout
// changes (also checked 4 times a second: a window that moves when its content
// arrives), is cut to the part really on screen, and hides while the target is
// not visible. Static outline under
// « Reduced effects » / prefers-reduced-motion.
// ═══════════════════════════════════════════════════════════════════

const CSS = `
#ag-ring{position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:10019;border-radius:10px;
box-shadow:0 0 0 3px #f5c518,0 0 14px 4px rgba(245,197,24,.55);opacity:0;transition:opacity .2s}
#ag-ring.ag-on{opacity:1;animation:ag-pulse 1.4s ease-in-out infinite}
@keyframes ag-pulse{0%,100%{box-shadow:0 0 0 3px #f5c518,0 0 10px 2px rgba(245,197,24,.45)}50%{box-shadow:0 0 0 4px #ffe27a,0 0 22px 8px rgba(245,197,24,.7)}}
html.reduce-fx #ag-ring.ag-on{animation:none}
@media (prefers-reduced-motion: reduce){#ag-ring.ag-on{animation:none}}
`;

let ring = null;
let target = null;
let raf = 0;
let ro = null;
let poll = 0;

function styleOnce() {
  if (document.getElementById('ag-ring-css')) return;
  const s = document.createElement('style');
  s.id = 'ag-ring-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

function visible(el) {
  if (!el || !el.isConnected) return false;
  try {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
  } catch (e) { return false; }
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth;
}

/**
 * The part of the target really on screen: cut by every scrolling / clipping
 * ancestor (a window's body) and the viewport — a long list inside a window
 * no longer draws a frame past the window's edge (web.289). null: nothing shows.
 */
function shownRect(el) {
  const r = el.getBoundingClientRect();
  let l = r.left, t = r.top, rt = r.right, b = r.bottom;
  for (let n = el.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
    let cs = null;
    try { cs = getComputedStyle(n); } catch (e) { cs = null; }
    if (!cs) continue;
    if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
      const c = n.getBoundingClientRect();
      const top = c.top + n.clientTop, left = c.left + n.clientLeft;
      if (cs.overflowX !== 'visible') { l = Math.max(l, left); rt = Math.min(rt, left + n.clientWidth); }
      if (cs.overflowY !== 'visible') { t = Math.max(t, top); b = Math.min(b, top + n.clientHeight); }
    }
    if (cs.position === 'fixed') break;
  }
  l = Math.max(l, 0); t = Math.max(t, 0); rt = Math.min(rt, window.innerWidth); b = Math.min(b, window.innerHeight);
  return rt - l > 2 && b - t > 2 ? { left: l, top: t, width: rt - l, height: b - t } : null;
}

function place() {
  raf = 0;
  if (!ring || !target) return;
  const r = visible(target) ? shownRect(target) : null;
  if (!r) { ring.classList.remove('ag-on'); return; }
  const pad = 4;
  ring.style.transform = `translate(${Math.round(r.left - pad)}px,${Math.round(r.top - pad)}px)`;
  ring.style.width = Math.round(r.width + 2 * pad) + 'px';
  ring.style.height = Math.round(r.height + 2 * pad) + 'px';
  ring.classList.add('ag-on');
}

function schedule() { if (!raf) raf = requestAnimationFrame(place); }

/**
 * A target hidden in a scrolling list (the table the Ace points at, below the
 * part of the game list on screen) is brought into that list's view — only the
 * list scrolls, never the page (web.289).
 */
function revealInScroller(el) {
  const r = el.getBoundingClientRect();
  for (let n = el.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
    let cs = null;
    try { cs = getComputedStyle(n); } catch (e) { cs = null; }
    if (!cs || !/(auto|scroll)/.test(cs.overflowY) || n.scrollHeight <= n.clientHeight + 1) continue;
    const c = n.getBoundingClientRect();
    const top = c.top + n.clientTop, bottom = top + n.clientHeight;
    if (r.top >= top && r.bottom <= bottom) return;                       // already shown
    const d = r.top < top ? r.top - top - 6 : Math.min(r.bottom - bottom + 6, r.top - top - 6);
    n.scrollTop += d;
    return;
  }
}

/** Outlines `el` (an element or a CSS selector). Replaces any previous highlight. */
export function highlight(el) {
  if (typeof el === 'string') { try { el = document.querySelector(el); } catch (e) { el = null; } }
  clear();
  if (!el) return false;
  styleOnce();
  ring = document.createElement('div');
  ring.id = 'ag-ring';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);
  target = el;
  try { revealInScroller(el); } catch (e) {}
  window.addEventListener('scroll', schedule, { capture: true, passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  try { ro = new ResizeObserver(schedule); ro.observe(el); ro.observe(document.body); } catch (e) { ro = null; }
  // the target can move without scrolling or resizing: a window that grows once its
  // content arrives (the forum events) re-centres itself — the frame stayed behind (web.289)
  poll = setInterval(schedule, 250);
  place();
  return true;
}

/** The element currently outlined (null if none). */
export function current() { return target; }

/** Re-reads the target position now (after a re-render, for instance). */
export function refresh() { schedule(); }

/** Removes the highlight. */
export function clear() {
  window.removeEventListener('scroll', schedule, { capture: true });
  window.removeEventListener('resize', schedule);
  if (ro) { try { ro.disconnect(); } catch (e) {} ro = null; }
  if (poll) { clearInterval(poll); poll = 0; }
  if (raf) { cancelAnimationFrame(raf); raf = 0; }
  if (ring) { try { ring.remove(); } catch (e) {} }
  ring = null; target = null;
}
