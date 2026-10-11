// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Game header title fit (web.16).
//
// The table name is centred on the header bar in absolute position
// (.header-brand--game, independent of the buttons' width) with a CSS
// max-width of min(72vw, 560px). On a portrait tablet the icons on the
// right (sound, forum, rankings, accessibility, menu - plus the admin
// buttons when I created the table) start before that width ends: on an
// iPad Mini (768 px) the name ran under the sound button (found by
// scripts/test-screen-matrix.mjs, WebKit).
//
// This module measures the room the title really has - twice the distance
// from the centre of the bar to the nearest visible button, minus a gap -
// and hands it to the CSS as --hdr-title-fit; the CSS keeps its own caps
// and takes the smallest. The name then ends in « … » (it was already
// allowed to) instead of running under a button. Re-measured when the
// header or any of its buttons changes size (resize, buttons shown or
// hidden), and when buttons are added.
// ═══════════════════════════════════════════════════════════════════

const GAP = 8;        // free space kept on each side of the title (px)
const FLOOR = 60;     // never squeeze the title below this (px)

/**
 * Room for a title centred in `header`: twice the distance from the centre
 * to the closest in-flow, visible sibling, minus the gaps. Siblings in
 * absolute or fixed position (the title itself, overlays) are ignored.
 * @param {Element} header
 * @param {Element} brand
 * @returns {number} px
 */
export function titleRoom(header, brand) {
  const hr = header.getBoundingClientRect();
  const cx = hr.left + hr.width / 2;
  let left = hr.left, right = hr.right;
  for (const el of header.children) {
    if (el === brand) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'absolute' || cs.position === 'fixed') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.left + r.width / 2 < cx) left = Math.max(left, r.right);
    else right = Math.min(right, r.left);
  }
  return Math.max(FLOOR, Math.floor(2 * Math.min(cx - left, right - cx) - 2 * GAP));
}

/** @param {HTMLElement} brand */
function fit(brand) {
  const header = brand.parentElement;
  if (!header || !brand.getClientRects().length) return;
  const room = titleRoom(header, brand);
  const cur = brand.style.getPropertyValue('--hdr-title-fit');
  if (cur !== room + 'px') brand.style.setProperty('--hdr-title-fit', room + 'px');
}

function init() {
  /** @type {HTMLElement[]} */
  const brands = Array.from(document.querySelectorAll('.header-brand--game'));
  if (!brands.length || typeof ResizeObserver === 'undefined') return;
  for (const brand of brands) {
    const header = brand.parentElement;
    if (!header) continue;
    let queued = false;
    const run = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; try { fit(brand); } catch (_e) {} }); };
    const ro = new ResizeObserver(run);
    const watch = () => { ro.observe(header); for (const el of header.children) if (el !== brand) ro.observe(el); };
    watch();
    try { new MutationObserver(() => { watch(); run(); }).observe(header, { childList: true }); } catch (_e) {}
    run();
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}
