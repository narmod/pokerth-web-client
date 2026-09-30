// ═══════════════════════════════════════════════════════════════════
// Ace's Help — highlight (web extension, narmod 2026-09-30).
//
// A pulsing gold outline around one element (D7: no dark overlay, nothing
// blocks the page). The ring is a separate fixed element that never takes a
// click; it follows its target on scroll (any scroller), resize and layout
// changes, and hides while the target is not visible. Static outline under
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

function place() {
  raf = 0;
  if (!ring || !target) return;
  if (!visible(target)) { ring.classList.remove('ag-on'); return; }
  const r = target.getBoundingClientRect(), pad = 4;
  ring.style.transform = `translate(${Math.round(r.left - pad)}px,${Math.round(r.top - pad)}px)`;
  ring.style.width = Math.round(r.width + 2 * pad) + 'px';
  ring.style.height = Math.round(r.height + 2 * pad) + 'px';
  ring.classList.add('ag-on');
}

function schedule() { if (!raf) raf = requestAnimationFrame(place); }

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
  window.addEventListener('scroll', schedule, { capture: true, passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  try { ro = new ResizeObserver(schedule); ro.observe(el); ro.observe(document.body); } catch (e) { ro = null; }
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
  if (raf) { cancelAnimationFrame(raf); raf = 0; }
  if (ring) { try { ring.remove(); } catch (e) {} }
  ring = null; target = null;
}
