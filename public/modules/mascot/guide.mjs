// ═══════════════════════════════════════════════════════════════════
// Ace's Help — the docked Ace and his bubble (web extension, narmod 2026-09-30).
//
// Used by modules/guide/index.mjs: the Ace docked at the bottom right who
// STAYS while his bubble is open, a multi-line bubble with buttons, a pointing
// pose and a few reactions. Unlike the scenes, he takes clicks: tapping him
// replays the tip (D7). Same size as the Ace of the idle scenes
// (plan.mjs::mascotScale, web.265); a scene starts from his spot and brings
// him back (homeBox / away, driven by modules/mascot/index.mjs).
// With « Reduced effects » or prefers-reduced-motion (plain: true) there is no
// Ace at all (D4): a plain bubble, and a small static A♠ chip to reopen it.
//
// API:  dock({ plain, label, onTap }) · undock() · say({ text, buttons,
//       onButton, point, avoid, ask }) · hush() · badge(on) · react(kind) · point(on)
//       homeBox() · away(on, pop) · hasBadge() · isPlain() · bubbleEl()
//       say({ html, wide }) — ready-made (escaped) markup in a wider bubble:
//       « More help », the help pages (H1, web.267)
//       guide({ text, buttons, onButton, point }) = dock + say
// ═══════════════════════════════════════════════════════════════════

import { mascotScale } from './plan.mjs';

const ROOT = 'ace-dock';
/** The docked Ace's scale: the same as the scenes' Ace on this screen (80–110 px tall). */
const scaleNow = () => mascotScale(window.innerWidth, window.innerHeight);
let K = 0.42;

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
#ace-dock .ad-ask{position:absolute;right:-9px;top:-11px;width:30px;height:30px;border-radius:50%;border:2px solid #141414;background:#f5c518;color:#141414;font:900 16px/1 Georgia,serif;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.35);padding:0}
#ace-dock .ad-ask:focus-visible{outline:3px solid #fbf7ee;outline-offset:1px}
body.guide-ask *{cursor:help!important}
body.guide-ask #ace-dock *{cursor:pointer!important}
#ace-dock .ad-text b{font-weight:800}
#ace-dock .ad-btns{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;margin-top:9px}
#ace-dock .ad-btn{appearance:none;border:1.5px solid #141414;background:transparent;color:#141414;border-radius:999px;padding:6px 14px;font:700 13px/1.2 system-ui,sans-serif;cursor:pointer;min-height:36px}
#ace-dock .ad-btn.ad-primary{background:#141414;color:#fbf7ee}
#ace-dock .ad-btn:focus-visible{outline:3px solid #f5c518;outline-offset:1px}
[dir=rtl] #ace-dock .ad-text{direction:rtl;text-align:right}
#ace-dock .ad-bubble.ad-wide{width:min(420px,calc(100vw - 24px));max-width:min(420px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto}
#ace-dock .ad-bubble.ad-wide .ad-ask{right:6px;top:6px;width:28px;height:28px}
#ace-dock .ad-kicker{margin:0 30px 6px 0;font:800 12px/1.3 system-ui,sans-serif;color:#6b5a2e}
#ace-dock .ad-count{float:right;margin-left:8px;font:700 11px/1.6 system-ui,sans-serif;opacity:.55}
#ace-dock .ad-search{display:block;width:100%;box-sizing:border-box;border:1.5px solid #141414;border-radius:10px;padding:7px 10px;font:600 14px/1.2 system-ui,sans-serif;background:#fff;color:#141414;margin:0 0 8px;min-height:36px}
#ace-dock .ad-list{display:flex;flex-direction:column;gap:4px;max-height:min(38vh,260px);overflow:auto;margin:0 0 8px;overscroll-behavior:contain}
#ace-dock .ad-item{appearance:none;display:block;width:100%;text-align:start;border:0;border-radius:8px;background:rgba(20,20,20,.07);color:#141414;padding:8px 10px;font:700 13.5px/1.3 system-ui,sans-serif;cursor:pointer;min-height:36px}
#ace-dock .ad-item small{display:block;font-weight:600;opacity:.65;font-size:11.5px}
#ace-dock .ad-item:focus-visible,#ace-dock .ad-chap:focus-visible{outline:3px solid #f5c518;outline-offset:1px}
#ace-dock .ad-empty{margin:4px 0;opacity:.7}
#ace-dock .ad-chaps{display:flex;flex-wrap:wrap;gap:4px}
#ace-dock .ad-chap{appearance:none;border:1.5px solid rgba(20,20,20,.25);background:transparent;border-radius:999px;padding:4px 9px;font:600 12px/1.2 system-ui,sans-serif;color:#141414;cursor:pointer;min-height:30px}
#ace-dock .ad-chap.ad-on{background:#141414;color:#fbf7ee;border-color:#141414}
#ace-dock .ad-page{font-weight:500}
#ace-dock .ad-page p{margin:0 0 6px}
#ace-dock .ad-page ul{margin:0;padding-inline-start:18px}
#ace-dock .ad-page li{margin:0 0 4px}
#ace-dock .ad-keys{display:grid;grid-template-columns:auto 1fr;gap:5px 10px;align-items:baseline}
#ace-dock .ad-keys code{font:700 12px/1.3 ui-monospace,Menlo,Consolas,monospace;background:#141414;color:#fbf7ee;border-radius:5px;padding:2px 6px;white-space:nowrap}
#ace-dock .ad-note{border-inline-start:3px solid #f5c518;padding-inline-start:8px;font-style:italic}
[dir=rtl] #ace-dock .ad-page,[dir=rtl] #ace-dock .ad-kicker,[dir=rtl] #ace-dock .ad-list,[dir=rtl] #ace-dock .ad-hbody,[dir=rtl] #ace-dock .ad-hnav{direction:rtl;text-align:right}
#ace-dock .ad-bubble.ad-big{width:min(900px,calc(100vw - 24px));max-width:min(900px,calc(100vw - 24px));height:min(640px,calc(100vh - 110px));flex-direction:column;overflow:hidden;padding:12px 14px 10px}
#ace-dock .ad-bubble.ad-big.ad-open{display:flex}
#ace-dock .ad-bubble.ad-big .ad-ask{right:6px;top:6px;width:28px;height:28px}
#ace-dock .ad-big .ad-kicker{flex:none}
#ace-dock .ad-big .ad-search{flex:none}
#ace-dock .ad-big .ad-btns{flex:none;margin-top:8px}
#ace-dock .ad-hwrap{flex:1;min-height:0;display:grid;grid-template-columns:minmax(150px,200px) 1fr;gap:0}
#ace-dock .ad-hnav{display:flex;flex-direction:column;gap:3px;overflow:auto;padding:2px 10px 2px 0;overscroll-behavior:contain}
#ace-dock .ad-hcat{appearance:none;display:flex;align-items:center;gap:8px;width:100%;text-align:start;border:0;border-radius:10px;background:transparent;color:#141414;padding:7px 10px;font:600 13px/1.25 system-ui,sans-serif;cursor:pointer;min-height:36px}
#ace-dock .ad-hcat:hover{background:rgba(20,20,20,.07)}
#ace-dock .ad-hcat.ad-on{background:#141414;color:#fbf7ee}
#ace-dock .ad-hcat:focus-visible{outline:3px solid #f5c518;outline-offset:1px}
#ace-dock .ad-hcat-ic{flex:none;width:22px;text-align:center;font-size:16px;line-height:1}
#ace-dock .ad-hbody{position:relative;min-height:0;overflow:auto;overscroll-behavior:contain;border-inline-start:1.5px solid rgba(20,20,20,.14);padding:2px 6px 8px 14px;font:500 13.5px/1.5 system-ui,sans-serif;outline:none}
#ace-dock .ad-hch{margin:2px 0 8px;font:800 17px/1.3 system-ui,sans-serif;color:#141414}
#ace-dock .ad-hsec{border-radius:8px;transition:background-color .6s}
#ace-dock .ad-hsec h3{margin:12px 0 4px;font:800 11.5px/1.3 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#6b5a2e}
#ace-dock .ad-hsec p{margin:0 0 7px}
#ace-dock .ad-hsec ul{margin:0 0 7px;padding-inline-start:20px}
#ace-dock .ad-hsec li{margin:0 0 4px}
#ace-dock .ad-hsec .ad-keys{margin:0 0 7px}
#ace-dock .ad-hsec.ad-hit{background:rgba(245,197,24,.28)}
#ace-dock .ad-results{max-height:none;overflow:visible;margin:2px 0 0}
@media (max-width:599px){
  #ace-dock .ad-hwrap{grid-template-columns:1fr;grid-template-rows:auto 1fr}
  #ace-dock .ad-hnav{flex-direction:row;overflow-x:auto;overflow-y:hidden;padding:0 0 6px;gap:4px;border-bottom:1.5px solid rgba(20,20,20,.14);margin-bottom:6px;scrollbar-width:none}
  #ace-dock .ad-hcat{width:auto;flex:none;justify-content:center;padding:6px 9px;min-width:44px;min-height:40px}
  #ace-dock .ad-hcat-ic{font-size:19px;width:auto}
  #ace-dock .ad-hcat-lbl{display:none}
  #ace-dock .ad-hbody{border-inline-start:0;padding:0 2px 8px}
}
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
  // finished one-shots leave the list (a tip re-rendered at every lobby update added one each time, web.276)
  if (!(opts && opts.iterations === Infinity) && !(opts && opts.fill === 'forwards')) {
    a.onfinish = () => { const i = anims.indexOf(a); if (i >= 0) anims.splice(i, 1); };
  }
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
// One dock at a time (web.274): two calls close together (a tip and a scene's
// return, say) both passed the « already docked? » check while the engine was
// loading, and two Aces stayed on screen. The calls now run one after the
// other, and an undock() during the loading cancels the pending dock.
let docking = Promise.resolve();
let dockGen = 0;
export function dock(o = {}) {
  const run = () => doDock(o);
  const p = docking.then(run, run);
  docking = p.catch(() => {});
  return p;
}

async function doDock(o) {
  onTapCb = o.onTap || null;
  const wantPlain = o.plain != null ? !!o.plain : reduce();
  if (root && wantPlain === plainMode) { if (o.label && ace) ace.setAttribute('aria-label', o.label); return; }
  if (root) undock();
  const gen = dockGen;
  plainMode = wantPlain;
  if (!plainMode && !kit) {
    try { kit = (await import('./engine.mjs')).actorKit(ROOT); } catch (e) { plainMode = true; }
  }
  if (gen !== dockGen || root) return;                 // undocked meanwhile, or docked by another way
  document.querySelectorAll('#' + ROOT).forEach((n) => { try { n.remove(); } catch (e) {} });   // never two
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
    ace.innerHTML = '<div class="mc-pos mc-m-smile mc-hat-none mc-tool-none">' + kit.html + '</div><span class="ad-badge" aria-hidden="true">!</span>';
    E = kit.refs(root, ace.querySelector('.mc-pos'));
    resize();
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
    else if (ev.key === 'Escape' && bubbleOpen()) { ev.stopPropagation(); const cb = onBtnCb; if (cb) cb('escape'); }   // web.276
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

/** Sizes the docked Ace like the scenes' Ace on this screen. */
function resize() {
  if (!E || !ace || !kit) return;
  K = scaleNow();
  aceW = Math.round(kit.BASE_W * K); aceH = Math.round(kit.BASE_H * K);
  ace.style.width = aceW + 'px';
  ace.style.height = aceH + 'px';
  E.scale.style.transform = `scale(${K})`;
}

/**
 * His spot, for a scene that starts from it: the top-left corner of his box
 * (the scenes' box at the same scale), or null (not docked, plain mode).
 */
export function homeBox() {
  if (!root || !ace || !E || plainMode) return null;
  const r = ace.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  return { x: r.left, y: r.top, k: K };
}

/** Out for a scene (hidden, his bubble stays closed) — or back at his spot, with a little pop. */
export function away(on, pop) {
  if (!ace) return;
  ace.style.visibility = on ? 'hidden' : '';
  if (!on && pop && E && !reduce()) {
    anim(E.squash, [{ transform: 'scale(0,0)' }, { offset: 0.6, transform: 'scale(1.12,1.12)' }, { transform: 'scale(1,1)' }], { duration: 420, easing: 'ease-out' });
  }
}

export function hasBadge() { return !!(ace && ace.classList.contains('ad-has-badge')); }
export function isPlain() { return !!root && plainMode; }

/** Removes the helper and his bubble at once. */
export function undock() {
  dockGen++;
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
    if (p.left != null) { bub.style.left = p.left + 'px'; bub.style.right = 'auto'; }
    else { bub.style.right = p.right + 'px'; bub.style.left = 'auto'; }
    if (top) { bub.style.top = p.top + 'px'; bub.style.bottom = 'auto'; }
    else { bub.style.bottom = p.bottom + 'px'; bub.style.top = 'auto'; }
  };
  bub.style.maxHeight = ''; bub.style.overflowY = '';
  apply(near, false);
  if (!bub.classList.contains('ad-open')) return;
  const bw = bub.offsetWidth;
  let bh = bub.offsetHeight;
  let hdr = 0;
  try { const h = document.querySelector('.screen.active .header') || document.querySelector('.screen.active [class*="header"]'); if (h) hdr = Math.max(0, h.getBoundingClientRect().bottom); } catch (e) {}
  const top0 = Math.max(hdr, 8) + 8;
  // under the header, the bubble never goes down over the Ace (a tall one scrolls instead, H3)
  if (top0 + bh > r.top - 8 && r.left < vw - 12 && r.right > vw - 12 - bw) {
    const cap = Math.max(160, Math.round(r.top - 8 - top0));
    if (cap < bh) { bub.style.maxHeight = cap + 'px'; bub.style.overflowY = 'auto'; bh = bub.offsetHeight; }
  }
  const topP = { right: 12, top: Math.round(Math.min(top0, Math.max(8, vh - bh - 8))) };
  const rectNear = { left: vw - near.right - bw, top: vh - near.bottom - bh, right: vw - near.right, bottom: vh - near.bottom };
  const rectTop = { left: vw - 12 - bw, top: topP.top, right: vw - 12, bottom: topP.top + bh };
  // what each spot would hide (the Ace's own bubble aside)
  const targets = tapTargets(0);
  const av = avoidEl && avoidEl.isConnected ? avoidEl.getBoundingClientRect() : null;
  const cost = (b) => {
    const ov = (r2) => { const ix = Math.min(b.right, r2.right) - Math.max(b.left, r2.left), iy = Math.min(b.bottom, r2.bottom) - Math.max(b.top, r2.top); return ix > 0 && iy > 0 ? ix * iy : 0; };
    let c = targets.reduce((sum, t) => sum + ov(t) * t.weight, 0);
    if (av) c += ov(av) * 100;
    if (b.top < 0 || b.bottom > vh || b.left < 0 || b.right > vw) c += 1e9;   // never cut at an edge (web.276)
    return c;
  };
  // also under the header on the left and in the middle (a wide screen: the felt buttons sit in its corners)
  const leftP = { left: 12, top: topP.top }, midP = { left: Math.max(12, Math.round((vw - bw) / 2)), top: topP.top };
  const rectLeft = { left: 12, top: topP.top, right: 12 + bw, bottom: topP.top + bh };
  const rectMid = { left: midP.left, top: topP.top, right: midP.left + bw, bottom: topP.top + bh };
  const cands = [[near, false, cost(rectNear)], [topP, true, cost(rectTop) / 0.8]];
  if (vw - 24 > bw * 1.5) cands.push([leftP, true, cost(rectLeft) / 0.8 + 1], [midP, true, cost(rectMid) / 0.8 + 2]);
  const best = cands.reduce((a, b) => (b[2] < a[2] ? b : a));
  if (best[0] !== near) {
    apply(best[0], true);
    if (best[0] === topP) return;
    // left / middle: not over the Ace either
    const cap = Math.max(160, Math.round(r.top - 8 - topP.top));
    if (best[0].left + bw > r.left && topP.top + bh > r.top - 8 && cap < bh) { bub.style.maxHeight = cap + 'px'; bub.style.overflowY = 'auto'; }
  }
}
// A real change of size (rotation, window) re-docks him even with the bubble open: his
// old lift could put him above the top of a landscape screen (web.276).
let lastVw = window.innerWidth, lastVh = window.innerHeight;
window.addEventListener('resize', () => {
  const big = Math.abs(window.innerWidth - lastVw) > 2 || Math.abs(window.innerHeight - lastVh) > 120;
  if (big) { lastVw = window.innerWidth; lastVh = window.innerHeight; }
  resize(); settle(big); placeBubble();
}, { passive: true });

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
  const ask = o.ask ? `<button type="button" class="ad-ask" data-ad-btn="ask" aria-label="${esc(o.ask)}" title="${esc(o.ask)}">?</button>` : '';
  const body = o.html != null ? o.html : `<p class="ad-text">${rich(o.text)}</p>`;   // html: already escaped by the caller
  // keyboard: a new page must not drop the focus on <body> (web.276)
  let refocus = !!o.focus;
  try {
    const ae = document.activeElement;
    if (ae && (bub.contains(ae) || (ae === ace && ace.matches(':focus-visible')))) refocus = true;
  } catch (e) {}
  bub.innerHTML = ask + body + (btns ? `<div class="ad-btns">${btns}</div>` : '');
  bub.classList.toggle('ad-wide', !!o.wide);
  bub.classList.toggle('ad-big', !!o.big);
  bub.scrollTop = 0;
  avoidEl = o.avoid || null;
  bub.classList.add('ad-open');
  placeBubble();
  badge(false);
  point(!!o.point);
  if (!plainMode && !reduce()) {
    anim(bub, [{ opacity: 0, transform: 'translateY(8px) scale(.94)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 220, easing: 'ease-out' });
  }
  if (refocus) { try { const f = bub.querySelector('.ad-primary') || bub.querySelector('.ad-btn') || bub.querySelector('button'); if (f) f.focus({ preventScroll: true }); } catch (e) {} }
}

/** Closes the bubble; the Ace stays docked. */
export function hush() {
  if (!bub) return;
  try { if (bub.contains(document.activeElement) && ace) ace.focus({ preventScroll: true }); } catch (e) {}   // the focus goes back to him
  bub.classList.remove('ad-open', 'ad-wide', 'ad-big');
  bub.innerHTML = '';
  onBtnCb = null;
  point(false);
  settle();
}

export function bubbleOpen() { return !!(bub && bub.classList.contains('ad-open')); }

/** The bubble element (the « More help » search field and list live in it). */
export function bubbleEl() { return bub; }
/** Places the bubble again after its content changed (search results). */
export function replace() { placeBubble(); }

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
