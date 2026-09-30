// ═══════════════════════════════════════════════════════════════════
// Ace's Help — the docked Ace and his bubble (web extension, narmod 2026-09-30).
//
// Used by modules/guide/index.mjs. Separate from the idle scenes of
// modules/mascot/engine.mjs (option « Animated mascot »): a small Ace docked
// at the bottom right who STAYS while his bubble is open, a multi-line bubble
// with buttons, a pointing pose and a few reactions. Unlike the scenes, he
// takes clicks: tapping him replays the tip (D7).
// With « Reduced effects » or prefers-reduced-motion (plain: true) there is no
// Ace at all (D4): a plain bubble, and a small static A♠ chip to reopen it.
//
// API:  dock({ plain, label, onTap }) · undock() · say({ text, buttons,
//       onButton, point }) · hush() · badge(on) · react(kind) · point(on)
//       guide({ text, buttons, onButton, point }) = dock + say
// ═══════════════════════════════════════════════════════════════════

const ROOT = 'ace-dock';
const K = 0.42;          // the docked Ace: 42 % of the scene size (~96 px tall)

const CSS = `
#ace-dock{z-index:10020!important;overflow:visible!important}
#ace-dock .ad-ace,#ace-dock .ad-bubble{transition:none!important}
#ace-dock .ad-ace{position:absolute;right:calc(10px + var(--ad-shift,0px) + env(safe-area-inset-right,0px));bottom:calc(8px + var(--ad-lift,0px) + env(safe-area-inset-bottom,0px));pointer-events:auto;cursor:pointer;border-radius:12px;-webkit-tap-highlight-color:transparent;outline:none}
#ace-dock .ad-ace:focus-visible{box-shadow:0 0 0 3px #f5c518}
#ace-dock .ad-ace .mc-pos{position:absolute;left:0;top:0}
#ace-dock .ad-ace .mc-bubble{display:none}
#ace-dock .ad-chip{width:46px;height:46px;border-radius:50%;background:#fbf7ee;color:#141414;border:3px solid #141414;display:flex;align-items:center;justify-content:center;font:900 16px/1 Georgia,serif;box-shadow:0 4px 12px rgba(0,0,0,.45)}
#ace-dock .ad-badge{position:absolute;right:-4px;top:-4px;min-width:20px;height:20px;border-radius:10px;background:#c62828;color:#fff;font:800 13px/20px system-ui,sans-serif;text-align:center;box-shadow:0 0 0 2px #fbf7ee;display:none}
#ace-dock .ad-ace.ad-has-badge .ad-badge{display:block}
#ace-dock .ad-bubble{position:absolute;pointer-events:auto;box-sizing:border-box;max-width:min(340px,calc(100vw - 24px));min-width:180px;background:#fbf7ee;color:#141414;border-radius:14px;padding:11px 13px 10px;box-shadow:0 8px 22px rgba(0,0,0,.45);font:600 14px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;white-space:normal;overflow-wrap:anywhere;display:none}
#ace-dock .ad-bubble.ad-open{display:block}
#ace-dock .ad-bubble::after{content:"";position:absolute;right:18px;bottom:-8px;border-style:solid;border-width:9px 9px 0 9px;border-color:#fbf7ee transparent transparent transparent}
#ace-dock .ad-bubble.ad-top::after{display:none}
#ace-dock .ad-bubble.ad-side::after{right:-8px;bottom:18px;border-width:9px 0 9px 9px;border-color:transparent transparent transparent #fbf7ee}
#ace-dock .ad-text{margin:0}
#ace-dock .ad-text b{font-weight:800}
#ace-dock .ad-btns{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;margin-top:9px}
#ace-dock .ad-btn{appearance:none;border:1.5px solid #141414;background:transparent;color:#141414;border-radius:999px;padding:6px 14px;font:700 13px/1.2 system-ui,sans-serif;cursor:pointer;min-height:36px}
#ace-dock .ad-btn.ad-primary{background:#141414;color:#fbf7ee}
#ace-dock .ad-btn:focus-visible{outline:3px solid #f5c518;outline-offset:1px}
[dir=rtl] #ace-dock .ad-text{direction:rtl;text-align:right}
`;

let root = null;      // #ace-dock
let ace = null;       // clickable holder (Ace or chip)
let bub = null;       // bubble
let E = null;         // Ace parts (engine refs), null in plain mode
let plainMode = false;
let anims = [];
let pointAnim = null;
let kit = null;
let onTapCb = null;
let onBtnCb = null;
let aceW = 0, aceH = 0;

const reduce = () => {
  try { if (document.documentElement.classList.contains('reduce-fx')) return true; } catch (e) {}
  try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
};

function styleOnce() {
  let s = document.getElementById('ace-dock-css');
  if (s && (s.dataset.kit === '1' || !kit)) return;
  if (!s) { s = document.createElement('style'); s.id = 'ace-dock-css'; document.head.appendChild(s); }
  s.textContent = (kit ? kit.css : '') + CSS;   // the Ace's CSS arrives with the kit (plain mode first: added later)
  if (kit) s.dataset.kit = '1';
}

function anim(node, frames, opts) {
  if (!node || typeof node.animate !== 'function') return null;
  const a = node.animate(frames, opts);
  anims.push(a);
  return a;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
/** Bubble text: plain text, **bold** allowed, line breaks kept. */
function rich(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); }

export function isDocked() { return !!root; }

/**
 * Shows the docked helper. Resolves once he is on screen.
 * @param {{ plain?: boolean, label?: string, onTap?: () => void }} [o]
 */
export async function dock(o = {}) {
  onTapCb = o.onTap || null;
  const wantPlain = o.plain != null ? !!o.plain : reduce();
  if (root && wantPlain === plainMode) { if (o.label && ace) ace.setAttribute('aria-label', o.label); return; }
  if (root) undock();
  plainMode = wantPlain;
  if (!plainMode && !kit) {
    try { kit = (await import('./engine.mjs')).actorKit(ROOT); } catch (e) { plainMode = true; }
  }
  styleOnce();
  root = document.createElement('div');
  root.id = ROOT;
  // #ace-dock gets the scenes' overlay rule (fixed, full screen, no clicks) from the kit CSS;
  // in plain mode (no kit) it needs its own.
  if (!kit) root.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;pointer-events:none';
  ace = document.createElement('div');
  ace.className = 'ad-ace';
  ace.setAttribute('role', 'button');
  ace.setAttribute('tabindex', '0');
  ace.setAttribute('aria-label', o.label || 'Ace');
  if (plainMode) {
    ace.innerHTML = '<div class="ad-chip" aria-hidden="true">A♠</div><span class="ad-badge" aria-hidden="true">!</span>';
    aceW = 46; aceH = 46;
    E = null;
  } else {
    aceW = Math.round(kit.BASE_W * K); aceH = Math.round(kit.BASE_H * K);
    ace.style.width = aceW + 'px';
    ace.style.height = aceH + 'px';
    ace.innerHTML = '<div class="mc-pos mc-m-smile mc-hat-none mc-tool-none">' + kit.html + '</div><span class="ad-badge" aria-hidden="true">!</span>';
    E = kit.refs(root, ace.querySelector('.mc-pos'));
    E.scale.style.transform = `scale(${K})`;
  }
  bub = document.createElement('div');
  bub.className = 'ad-bubble';
  bub.setAttribute('role', 'dialog');
  bub.setAttribute('aria-live', 'polite');
  root.appendChild(bub);
  root.appendChild(ace);
  document.body.appendChild(root);
  ace.addEventListener('click', (ev) => { ev.stopPropagation(); if (onTapCb) onTapCb(); });
  ace.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); if (onTapCb) onTapCb(); }
  });
  bub.addEventListener('click', (ev) => {
    const b = ev.target && ev.target.closest ? ev.target.closest('[data-ad-btn]') : null;
    if (!b) return;
    ev.stopPropagation();
    const cb = onBtnCb;
    if (cb) cb(b.getAttribute('data-ad-btn'));
  });
  bub.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') { ev.stopPropagation(); const cb = onBtnCb; if (cb) cb('escape'); }
  });
  if (E) {
    anim(E.breath, [{ transform: 'scale(1,1)' }, { offset: 0.5, transform: 'scale(.99,1.025)' }, { transform: 'scale(1,1)' }], { duration: 3400, iterations: Infinity, easing: 'ease-in-out' });
    anim(E.face.eo, [{ transform: 'scaleY(1)' }, { offset: 0.92, transform: 'scaleY(1)' }, { offset: 0.95, transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 4200, iterations: Infinity, delay: 900 });
    const a = anim(E.squash, [{ transform: 'scale(0,0)' }, { offset: 0.6, transform: 'scale(1.12,1.12)' }, { transform: 'scale(1,1)' }], { duration: 420, easing: 'ease-out' });
    if (a) { try { await a.finished; } catch (e) {} }
  }
  settle();
  placeBubble();
}

/** Removes the helper and his bubble at once. */
export function undock() {
  anims.forEach((a) => { try { a.cancel(); } catch (e) {} });
  anims = []; pointAnim = null;
  if (root) { try { root.remove(); } catch (e) {} }
  root = null; ace = null; bub = null; E = null; onBtnCb = null;
}

/** Keeps the helper at this height above his base spot (px). */
export function lift(px) {
  if (root) root.style.setProperty('--ad-lift', Math.max(0, Math.round(px || 0)) + 'px');
  placeBubble();
}

// Something the player may want to tap: a control, a link, or anything that
// shows a hand cursor (table rows of the game list, cards…).
function tappable(el) {
  for (let n = el, i = 0; n && n.nodeType === 1 && i < 4; n = n.parentElement, i++) {
    if (/^(BUTTON|A|INPUT|SELECT|TEXTAREA|LABEL|SUMMARY)$/.test(n.tagName)) return true;
    const r = n.getAttribute && n.getAttribute('role');
    if (r === 'button' || r === 'link' || r === 'tab' || r === 'checkbox') return true;
    try { if (getComputedStyle(n).cursor === 'pointer') return true; } catch (e) {}
  }
  return false;
}
// Rectangles of what the player may tap in the lower part of the screen,
// checked to be really visible (not clipped by a scroller, not under a panel).
function tapTargets(minTop) {
  const out = [];
  const own = (n) => !!(root && root.contains(n)) || n.id === 'ag-ring';
  const seen = new Set();
  const add = (el, weight) => {
    if (seen.has(el) || own(el)) return;
    seen.add(el);
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.bottom < minTop || r.top > window.innerHeight) return;
    const x = Math.min(Math.max(r.left + r.width / 2, 0), window.innerWidth - 1);
    const y = Math.min(Math.max(r.top + r.height / 2, 0), window.innerHeight - 1);
    // what is on top there, the Ace himself left aside (he may be standing on it right now)
    const hit = typeof document.elementsFromPoint === 'function'
      ? document.elementsFromPoint(x, y).find((n) => !own(n)) : document.elementFromPoint(x, y);
    if (!hit || !(hit === el || el.contains(hit) || hit.contains(el))) return;   // hidden, clipped or covered
    out.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom, weight: weight || 10 });
  };
  document.querySelectorAll('button,a[href],input,select,textarea,label,summary,[role=button],[role=link],[role=tab]').forEach((el) => add(el, 10));
  // a whole clickable row / card counts less than a real control inside it
  document.querySelectorAll('[onclick]').forEach((el) => add(el, /^(BUTTON|A|INPUT|SELECT)$/.test(el.tagName) ? 10 : 1));
  // clickable rows drawn as plain elements (hand cursor), sampled on a grid
  if (typeof document.elementsFromPoint === 'function') {
    for (let y = Math.max(0, minTop); y < window.innerHeight; y += 16) {
      for (let x = window.innerWidth - 8; x > window.innerWidth - 220 && x > 0; x -= 16) {
        const hit = document.elementsFromPoint(x, y).find((n) => !own(n));
        if (hit && !seen.has(hit) && tappable(hit)) add(hit, 1);
      }
    }
  }
  return out;
}

/**
 * Finds the lowest spot along the right edge where the Ace hides nothing the
 * player may tap (Create / Join buttons, the status bar link, the chat send
 * button, a game row…), and docks him there. Not while his bubble is open
 * (he does not move under the player's eyes).
 */
export function settle(force) {   // force: the layout changed — move even with the bubble open
  if (!root || !ace || (bubbleOpen() && !force)) return;
  const vh = window.innerHeight, vw = window.innerWidth;
  const wasUp = parseFloat(root.style.getPropertyValue('--ad-lift')) || 0;
  const wasShift = parseFloat(root.style.getPropertyValue('--ad-shift')) || 0;
  root.style.setProperty('--ad-lift', '0px');
  root.style.setProperty('--ad-shift', '0px');
  const base = ace.getBoundingClientRect();
  const w = base.width, h = base.height;
  let best = { up: wasUp, shift: wasShift };
  if (w && h) {
    const minTop = vh * 0.35, maxShift = Math.min(vw * 0.3, 240);
    const targets = tapTargets(minTop - h);
    // how much he would hide there (real controls weigh more than clickable rows)
    const cost = (left, top) => targets.reduce((sum, r) => {
      const ix = Math.min(left + w + 2, r.right) - Math.max(left - 2, r.left), iy = Math.min(top + h, r.bottom) - Math.max(top, r.top);
      return ix > 0 && iy > 0 ? sum + ix * iy * r.weight : sum;
    }, 0);
    // right edge first, lowest first; then a little further left; the first
    // free spot wins, else the spot that hides the least
    let bestCost = Infinity;
    search:
    for (let shift = 0; shift <= maxShift; shift += 24) {
      for (let up = 0; base.top - up > minTop; up += 6) {
        const c = cost(base.left - shift, base.top - up) + (shift + up) * 0.01;   // tie-break: stay low and right
        if (c < bestCost) { bestCost = c; best = { up, shift }; }
        if (c < 1 + (shift + up) * 0.01) break search;
      }
    }
  }
  if (root) root.style.setProperty('--ad-shift', Math.round(best.shift) + 'px');
  lift(best.up);
}

let avoidEl = null;      // the element the bubble is about (highlighted): never cover it if avoidable

/**
 * Where the bubble goes: next to the Ace (above him on a narrow screen, on
 * his left on a wide one) — or, when that would hide the element it talks
 * about or more controls, at the top right under the header (no tail).
 */
function placeBubble() {
  if (!bub || !ace) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  const r = ace.getBoundingClientRect();
  const side = vw >= 560;                       // wide screen: bubble on the Ace's left
  const near = side
    ? { right: Math.round(vw - r.left + 10), bottom: Math.round(vh - r.bottom + Math.min(12, r.height / 3)) }
    : { right: 12, bottom: Math.round(vh - r.top + 10) };
  const apply = (p, top) => {
    bub.classList.toggle('ad-side', side && !top);
    bub.classList.toggle('ad-top', !!top);
    bub.style.right = p.right + 'px';
    if (top) { bub.style.top = p.top + 'px'; bub.style.bottom = 'auto'; }
    else { bub.style.bottom = p.bottom + 'px'; bub.style.top = 'auto'; }
  };
  apply(near, false);
  if (!bub.classList.contains('ad-open')) return;
  const bw = bub.offsetWidth, bh = bub.offsetHeight;
  let hdr = 0;
  try { const h = document.querySelector('.screen.active .header') || document.querySelector('.screen.active [class*="header"]'); if (h) hdr = Math.max(0, h.getBoundingClientRect().bottom); } catch (e) {}
  const topP = { right: 12, top: Math.round(Math.min(Math.max(hdr, 8) + 8, Math.max(8, vh - bh - 8))) };
  const rectNear = { left: vw - near.right - bw, top: vh - near.bottom - bh, right: vw - near.right, bottom: vh - near.bottom };
  const rectTop = { left: vw - 12 - bw, top: topP.top, right: vw - 12, bottom: topP.top + bh };
  // what each spot would hide (the Ace's own bubble aside)
  const targets = tapTargets(0);
  const av = avoidEl && avoidEl.isConnected ? avoidEl.getBoundingClientRect() : null;
  const cost = (b) => {
    const ov = (r2) => { const ix = Math.min(b.right, r2.right) - Math.max(b.left, r2.left), iy = Math.min(b.bottom, r2.bottom) - Math.max(b.top, r2.top); return ix > 0 && iy > 0 ? ix * iy : 0; };
    let c = targets.reduce((sum, t) => sum + ov(t) * t.weight, 0);
    if (av) c += ov(av) * 100;
    if (b.top < 0 || b.bottom > vh) c += 1e9;
    return c;
  };
  if (cost(rectTop) < cost(rectNear) * 0.8) apply(topP, true);
}
window.addEventListener('resize', () => { settle(); placeBubble(); }, { passive: true });

/**
 * Opens the bubble.
 * @param {{ text: string, buttons?: {id: string, label: string, primary?: boolean}[],
 *           onButton?: (id: string) => void, point?: boolean, focus?: boolean }} o
 */
export function say(o) {
  if (!root) return;
  onBtnCb = o.onButton || null;
  const btns = (o.buttons || []).map((b) =>
    `<button type="button" class="ad-btn${b.primary ? ' ad-primary' : ''}" data-ad-btn="${esc(b.id)}">${esc(b.label)}</button>`).join('');
  bub.innerHTML = `<p class="ad-text">${rich(o.text)}</p>` + (btns ? `<div class="ad-btns">${btns}</div>` : '');
  avoidEl = o.avoid || null;
  bub.classList.add('ad-open');
  placeBubble();
  badge(false);
  point(!!o.point);
  if (!plainMode && !reduce()) {
    anim(bub, [{ opacity: 0, transform: 'translateY(8px) scale(.94)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 220, easing: 'ease-out' });
  }
  if (o.focus) { try { const f = bub.querySelector('.ad-primary') || bub.querySelector('button'); if (f) f.focus({ preventScroll: true }); } catch (e) {} }
}

/** Closes the bubble; the Ace stays docked. */
export function hush() {
  if (!bub) return;
  bub.classList.remove('ad-open');
  bub.innerHTML = '';
  onBtnCb = null;
  point(false);
  settle();
}

export function bubbleOpen() { return !!(bub && bub.classList.contains('ad-open')); }

/** Small red « ! » on the Ace: a tip is waiting (the player said « Later »). */
export function badge(on) { if (ace) ace.classList.toggle('ad-has-badge', !!on); }

/** Pointing pose: the left arm raised towards the page (up-left). */
export function point(on) {
  if (!E) return;
  if (pointAnim) { try { pointAnim.cancel(); } catch (e) {} pointAnim = null; }
  if (!on) return;
  pointAnim = anim(E.armL, reduce()
    ? [{ transform: 'rotate(105deg)' }, { transform: 'rotate(105deg)' }]
    : [{ transform: 'rotate(0deg)' }, { offset: 0.25, transform: 'rotate(112deg)' }, { offset: 0.6, transform: 'rotate(98deg)' }, { transform: 'rotate(108deg)' }],
  { duration: 900, fill: 'forwards', easing: 'ease-out' });
}

/**
 * A short reaction: 'hop' (someone arrived), 'wave' (hello / good luck),
 * 'cheer' (both arms up).
 */
export function react(kind) {
  if (!E || reduce()) return;
  if (kind === 'hop') {
    anim(E.bob, [{ transform: 'translateY(0)' }, { offset: 0.4, transform: 'translateY(-16px)' }, { offset: 0.7, transform: 'translateY(0)' }, { offset: 0.85, transform: 'translateY(-4px)' }, { transform: 'translateY(0)' }], { duration: 650, easing: 'ease-out' });
  } else if (kind === 'wave') {
    anim(E.armR, [{ transform: 'rotate(0deg)' }, { offset: 0.2, transform: 'rotate(-132deg)' }, { offset: 0.4, transform: 'rotate(-100deg)' }, { offset: 0.6, transform: 'rotate(-132deg)' }, { offset: 0.8, transform: 'rotate(-100deg)' }, { transform: 'rotate(0deg)' }], { duration: 1600 });
  } else if (kind === 'cheer') {
    anim(E.armL, [{ transform: 'rotate(0deg)' }, { offset: 0.3, transform: 'rotate(150deg)' }, { offset: 0.7, transform: 'rotate(150deg)' }, { transform: 'rotate(0deg)' }], { duration: 1200 });
    anim(E.armR, [{ transform: 'rotate(0deg)' }, { offset: 0.3, transform: 'rotate(-150deg)' }, { offset: 0.7, transform: 'rotate(-150deg)' }, { transform: 'rotate(0deg)' }], { duration: 1200 });
    anim(E.bob, [{ transform: 'translateY(0)' }, { offset: 0.35, transform: 'translateY(-12px)' }, { transform: 'translateY(0)' }], { duration: 700, easing: 'ease-out' });
  }
}

/** Dock + bubble in one call. */
export async function guide(o) {
  await dock(o);
  say(o);
}
