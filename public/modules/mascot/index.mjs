// ═══════════════════════════════════════════════════════════════════
// Mascot loader (web extension, narmod 2026-09-27).
//
// Option « Animated mascot » (Advanced options › User interface ›
// Appearance, localStorage pth_mascot, OFF by default). When it is on, and
// only on the home screen (#s-connect) or in the lobby (#s-lobby) — never at a
// table — the Ace shows up after IDLE_MS without any click, tap or key press,
// then at most once every COOLDOWN_MS while the player stays idle. Any input
// makes him vanish in a puff. Nothing happens while a window is open, the tab
// is hidden, under « Reduced effects » or prefers-reduced-motion, or in the
// live (spectator) embed.
//
// This file is tiny and always loaded; the engine (modules/mascot/engine.mjs)
// is imported the first time the Ace actually appears.
//
// Preview: ?mascot=1 (or ?mascot=<action>: moon, climb, magic, king, knight,
// grim, sleep, juggle — or ?mascot=peek for the hello from behind a panel's
// top edge) makes him appear a few seconds after the home screen or the lobby is
// shown, even with the option off. Console: mascotDemo('climb').
// Test panel (hidden): ?mascot=panel or mascotPanel() in the console opens
// modules/mascot/panel.mjs — every entry / action / exit / costume on demand,
// slow motion, loop. The idle timer is off while it is open.
// ═══════════════════════════════════════════════════════════════════

const IDLE_MS = 45000;
const COOLDOWN_MS = 180000;
const SCREENS = ['s-connect', 's-lobby'];

let enabled = false;
let timer = 0;
let lastEnd = 0;
let engine = null;
let running = false;
let preview = null;   // { action } from ?mascot=
let panel = null;     // modules/mascot/panel.mjs once opened

function optionOn() {
  try { return localStorage.getItem('pth_mascot') === '1'; } catch (e) { return false; }
}

function motionOff() {
  try { if (document.documentElement.classList.contains('reduce-fx')) return true; } catch (e) {}
  try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true; } catch (e) {}
  return false;
}

function splashGone() {
  const sp = document.getElementById('boot-splash');
  if (!sp) return true;
  if (sp.classList.contains('bs-hide')) return true;
  try { const c = getComputedStyle(sp); return c.display === 'none' || c.visibility === 'hidden'; } catch (e) { return true; }
}

function onMascotScreen() {
  for (const id of SCREENS) {
    const el = document.getElementById(id);
    if (el && el.classList.contains('active')) return true;
  }
  return false;
}

/** Can the Ace show up right now? */
export function canAppear() {
  if (typeof Element === 'undefined' || typeof Element.prototype.animate !== 'function') return false;
  if (window.LIVE_MODE) return false;
  if (document.hidden) return false;
  if (!onMascotScreen() || !splashGone()) return false;
  if (motionOff()) return false;
  try { if (window.keynavHasOpenSurface && window.keynavHasOpenSurface()) return false; } catch (e) {}
  return true;
}

function disarm() { if (timer) { clearTimeout(timer); timer = 0; } }

function arm() {
  disarm();
  if (running) return;
  if (panel && panel.isOpen()) return;
  if (preview) { timer = setTimeout(fire, 3000); return; }
  if (!enabled) return;
  const wait = Math.max(IDLE_MS, lastEnd ? lastEnd + COOLDOWN_MS - Date.now() : 0);
  timer = setTimeout(fire, wait);
}

async function loadEngine() {
  if (!engine) engine = await import('./engine.mjs');
  return engine;
}

async function fire() {
  timer = 0;
  if (running || (!enabled && !preview)) return;
  if (!canAppear()) { arm(); return; }
  running = true;
  const opts = {};
  if (preview) {
    if (preview.action === 'peek') opts.entry = 'peek';
    else if (preview.action) opts.action = preview.action;
    preview = null;
  }
  try { await (await loadEngine()).appear(opts); }
  catch (e) { try { console.warn('[mascot]', e); } catch (e2) {} }
  running = false;
  lastEnd = Date.now();
  arm();
}

function stopNow() { try { if (engine) engine.abort(); } catch (e) {} }

function onInput(ev) {
  try { if (ev && ev.target && ev.target.closest && ev.target.closest('#mascot-panel')) return; } catch (e) {}
  try { if (engine && engine.isPlaying()) engine.dismiss(); } catch (e) {}
  if (!running) arm();
}

/** Applies the option (called by applyAdvOpts in pokerth.js on every change). */
function apply() {
  const was = enabled;
  enabled = optionOn();
  if (!enabled && was) stopNow();
  if (!running) arm();
}

function onScreenChange() {
  if (!onMascotScreen()) { stopNow(); disarm(); return; }
  if (!running) arm();
}

function init() {
  try {
    const q = new URLSearchParams(location.search).get('mascot');
    if (q === 'panel') setTimeout(() => window.mascotPanel(), 800);
    else if (q) preview = { action: /^(moon|climb|magic|king|knight|grim|sleep|juggle|peek)$/.test(q) ? q : '' };
  } catch (e) {}
  enabled = optionOn();
  ['pointerdown', 'keydown', 'wheel', 'input'].forEach((ev) =>
    document.addEventListener(ev, onInput, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopNow(); disarm(); } else if (!running) arm(); });
  // A real resize (rotation, window) re-lays the stage out: the Ace leaves.
  // Mobile URL bars that slide in and out (a few dozen px) are ignored.
  let vw = window.innerWidth, vh = window.innerHeight;
  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    if (Math.abs(w - vw) < 2 && Math.abs(h - vh) < 120) return;
    vw = w; vh = h;
    stopNow();
    if (!running) arm();
  });
  const mo = new MutationObserver(onScreenChange);
  for (const id of SCREENS.concat(['s-game', 's-create'])) {
    const el = document.getElementById(id);
    if (el) mo.observe(el, { attributes: true, attributeFilter: ['class'] });
  }
  arm();
}

window._mascotApply = apply;
/** Console / test hook: mascotDemo('climb') plays one appearance now ('peek': hello from a panel's top). */
window.mascotDemo = async (action) => {
  disarm();
  stopNow();
  running = true;
  const o = action === 'peek' ? { entry: 'peek' } : action ? { action } : {};
  try { return await (await loadEngine()).appear(o); }
  finally { running = false; lastEnd = Date.now(); arm(); }
};

/** Plays one appearance now with any options (test panel). */
async function playNow(o) {
  disarm();
  stopNow();
  running = true;
  try { return await (await loadEngine()).appear(o || {}); }
  finally { running = false; lastEnd = Date.now(); arm(); }
}

/** Hidden test panel: mascotPanel() in the console, or ?mascot=panel. */
window.mascotPanel = async () => {
  const eng = await loadEngine();
  if (!panel) panel = await import('./panel.mjs');
  disarm();
  return panel.open({ play: playNow, stop: stopNow, catalog: eng.CATALOG, onClose: () => { if (!running) arm(); } });
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}
