// ═══════════════════════════════════════════════════════════════════
// Mascot loader (web extension, narmod 2026-09-27; part of Ace's Help since
// web.265 — the « Animated mascot » option is gone).
//
// Only on the home screen (#s-connect) or in the lobby (#s-lobby) — never at
// a table — the Ace plays a scene after IDLE_MS without any click, tap or key
// press, then at most once every COOLDOWN_MS while the player stays idle.
// Nothing happens while a window is open, the tab is hidden, under « Reduced
// effects » or prefers-reduced-motion, in the live (spectator) embed, or under
// automation (navigator.webdriver: other tests' screenshots; opt in with
// localStorage pth_mascot_webdriver = 1).
// Ace's Help off: he enters by a door, a puff or the screen edge, and any
// input makes him vanish in a puff.
// Ace's Help on (window._guideScene, modules/guide/index.mjs): the scene
// starts from the docked Ace and brings him back to his spot; only when no
// bubble, badge or « ? » mode waits (the tip first); any input makes him walk
// back (~1 s); a tip that comes up meanwhile calls him back too
// (window._mascotRecall).
//
// This file is tiny and always loaded; the engine (modules/mascot/engine.mjs)
// is imported the first time the Ace actually appears.
//
// Preview: ?mascot=1 (or ?mascot=<action>: moon, climb, magic, king, knight,
// grim, sleep, juggle — or ?mascot=peek for the hello from behind a panel's
// top edge) makes him appear a few seconds after the home screen or the lobby is
// shown, even with the option off. Console: mascotDemo('climb').
// Reactions: mascotReact('table' | 'mail') — called by the lobby code when a
// table is created or a private message arrives — Ace's Help on only: he
// leaves his spot right away (no idle wait) in the lobby, at most once a
// minute per kind, never in the first seconds after the lobby opens (the
// server sends the whole table list then).
// « Well done! » (web.266): mascotCheer('win' | 'ranked' | 'trophy') — a game
// won (end screen), points in a Ranking game (the Ace's result bubble), a
// trophy unlocked in training (event pth-achievement) — waits, Ace's Help on
// only, until the player is back on the home screen or in the lobby and no
// tip is on screen, then he cheers once (several reasons: one cheer; kept
// CHEER_TTL at most).
// Dancing (web.281): while the music player plays, the Ace comes after
// DANCE_IDLE without input (instead of IDLE_MS, no cooldown) and dances to
// the beat until the next input (action 'groove', modules/mascot/acts-dance.mjs).
// Option « ace_dance » (Advanced options, on by default; admin kill switch
// featureOff.ace_dance). The ear (modules/mascot/groove.mjs) listens
// while the music plays on the home screen or in the lobby, so the tempo is
// already known when he walks in.
// Test panel (hidden): ?mascot=panel or mascotPanel() in the console opens
// modules/mascot/panel.mjs — every entry / action / exit / costume on demand,
// slow motion, loop. The idle timer is off while it is open.
// ═══════════════════════════════════════════════════════════════════

const IDLE_MS = 30000;
const COOLDOWN_MS = 120000;
const DANCE_IDLE = 10000;
let dancing = false;   // the running appearance is a dance (action 'groove')
const SCREENS = ['s-connect', 's-lobby'];

let enabled = false;
let timer = 0;
let lastEnd = 0;
let engine = null;
let running = false;
let preview = null;   // { action } from ?mascot=
let panel = null;     // modules/mascot/panel.mjs once opened
let lobbySince = 0;   // when #s-lobby last became active
let screenSince = 0;  // when the home screen or the lobby last became active
const REACT_GAP = 60000, REACT_WARMUP = 8000;
const lastReact = {};
let cheer = 0, cheerTimer = 0;   // a pending « Well done! » (when it was earned)
const CHEER_TTL = 600000, CHEER_SETTLE = 1500;

/** Option « The Ace dances to the music player » (on by default; admin kill switch). */
function danceOpt() {
  try { if (window._pthFeatureOff && window._pthFeatureOff.ace_dance) return false; } catch (e) {}
  try { return localStorage.getItem('pth_ace_dance') !== '0'; } catch (e) { return true; }
}
function musicOn() { try { return !!(window.Music && window.Music.isPlaying()); } catch (e) { return false; } }
/** The music plays and the option is on: he dances instead of playing a scene. */
function wantsDance() { return enabled && danceOpt() && musicOn(); }

/** Idle scenes are always on — except under automation, unless a test opts in. */
function allowed() {
  try { return !navigator.webdriver || localStorage.getItem('pth_mascot_webdriver') === '1'; } catch (e) { return true; }
}

/**
 * Ace's Help on and ready: the scene starts from the docked Ace (engine
 * option home) and gives him back to the dock (arrive). Idempotent back.
 */
function withHome(o) {
  const G = window._guideScene;
  if (!G || !G.on() || !G.ready()) return o;
  let done = false;
  G.away();
  o.home = G.home;
  o.arrive = (pop) => { if (!done) { done = true; try { G.back(pop); } catch (e) {} } };
  return o;
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
  if (blockingSurface()) return false;
  // Ace's Help on: from his spot, only when no tip waits; off: not over the first-launch offer.
  const G = window._guideScene;
  if (G && G.on()) { if (!G.ready()) return false; }
  else if (window._guideBusy) return false;
  return true;
}

// A floating window (ranking, forum, private messages… on a large screen) or
// the music / hands panel does not stop him — he even plays on it. A modal,
// a menu or a page does.
const FREE = ['music-panel', 'hands-overlay'];
function blockingSurface() {
  try {
    if (!window.keynavHasOpenSurface || !window.keynavHasOpenSurface()) return false;
    const list = window.keynavOpenSurfaces ? window.keynavOpenSurfaces() : null;
    if (!list) return true;
    return list.some((el) => !(FREE.indexOf(el.id) >= 0 || el.classList.contains('floating-win') || el.querySelector('.floating-win')));
  } catch (e) { return false; }
}

function disarm() { if (timer) { clearTimeout(timer); timer = 0; } }

function arm() {
  disarm();
  if (running) return;
  if (panel && panel.isOpen()) return;
  if (preview) { timer = setTimeout(fire, 3000); return; }
  if (!enabled) return;
  if (wantsDance()) { timer = setTimeout(fire, DANCE_IDLE); return; }
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
  } else if (wantsDance()) {
    opts.action = 'groove';
  }
  dancing = opts.action === 'groove';
  withHome(opts);
  try { await (await loadEngine()).appear(opts); }
  catch (e) { try { console.warn('[mascot]', e); } catch (e2) {} }
  if (opts.arrive) opts.arrive(true);   // whatever happened, the docked Ace is back
  running = false;
  dancing = false;
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
  enabled = allowed();
  if (!enabled && was) stopNow();
  if (dancing && !danceOpt()) { try { if (engine && engine.isPlaying()) engine.dismiss(); } catch (e) {} }   // option switched off while he dances
  watchMusic();
  if (!running) arm();
}

// The ear listens while the music plays on the home screen or in the lobby.
let ear = null, earOn = false, musicWas = false;
function watchMusic() {
  const m = wantsDance();
  const listen = m && onMascotScreen() && !document.hidden && !motionOff();
  if (listen !== earOn) {
    earOn = listen;
    if (listen) {
      import('./groove.mjs').then((g) => {
        ear = g;
        if (earOn) g.start(() => (window.Music && window.Music.beatLevel ? window.Music.beatLevel() : null));
      }).catch(() => {});
    } else if (ear) ear.stop();
  }
  if (m !== musicWas) { musicWas = m; if (!running) arm(); }   // music started / stopped: dance timer or scene timer
}

function onScreenChange() {
  const lob = document.getElementById('s-lobby');
  const inLobby = !!(lob && lob.classList.contains('active'));
  if (inLobby && !lobbySince) lobbySince = Date.now();
  if (!inLobby) lobbySince = 0;
  if (!onMascotScreen()) { screenSince = 0; stopNow(); disarm(); return; }
  if (!screenSince) screenSince = Date.now();
  if (!running) arm();
}

function init() {
  try {
    const q = new URLSearchParams(location.search).get('mascot');
    if (q === 'panel') setTimeout(() => window.mascotPanel(), 800);
    else if (q) preview = { action: /^(moon|climb|magic|king|knight|grim|sleep|juggle|peek|groove)$/.test(q) ? q : '' };
  } catch (e) {}
  enabled = allowed();
  if (onMascotScreen()) screenSince = Date.now();
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
  setInterval(watchMusic, 1000);
  arm();
}

window._mascotApply = apply;
/** Ace's Help: a tip calls him back from his scene (he walks in). */
window._mascotRecall = () => { try { if (engine && engine.isPlaying()) engine.dismiss(); } catch (e) {} };
/**
 * Console / test hook: mascotDemo('climb') plays one appearance now ('peek':
 * hello from a panel's top); mascotDemo('grim', { home: true }) starts it from
 * the docked Ace when Ace's Help is on and ready.
 */
window.mascotDemo = async (action, x) => {
  disarm();
  stopNow();
  running = true;
  const o = action === 'peek' ? { entry: 'peek' } : action ? { action } : {};
  if (x && x.home) withHome(o);
  if (x && x.exit) o.exit = x.exit;
  try { return await (await loadEngine()).appear(o); }
  finally { if (o.arrive) o.arrive(true); running = false; lastEnd = Date.now(); arm(); }
};

/** Plays one appearance now with any options (test panel, reactions). */
async function playNow(o) {
  disarm();
  stopNow();
  running = true;
  o = o || {};
  try { return await (await loadEngine()).appear(o); }
  finally { if (o.arrive) o.arrive(true); running = false; lastEnd = Date.now(); arm(); }
}

/** A lobby event: the Ace reacts right away (see the header). */
window.mascotReact = (kind) => {
  try {
    if (running || (panel && panel.isOpen())) return;   // event-driven: Ace's Help decides, not the idle opt-out
    if (['table', 'mail'].indexOf(kind) < 0) return;
    const G = window._guideScene;
    if (!G || !G.on()) return;                     // reactions belong to Ace's Help
    const lob = document.getElementById('s-lobby');
    if (!lob || !lob.classList.contains('active')) return;
    if (!lobbySince) lobbySince = Date.now();
    const now = Date.now();
    if (now - lobbySince < REACT_WARMUP || now - (lastReact[kind] || 0) < REACT_GAP) return;
    if (!canAppear()) return;
    lastReact[kind] = now;
    playNow(withHome({ action: 'r-' + kind })).catch(() => {});
  } catch (e) {}
};

/** « Well done! » is waiting: play it as soon as the player is back and nothing else is on screen. */
function tryCheer() {
  if (!cheer) return;
  if (Date.now() - cheer > CHEER_TTL) { cheer = 0; return; }
  if (running || (panel && panel.isOpen())) return;   // event-driven: not tied to the automation opt-out of idle scenes
  const G = window._guideScene;
  if (!G || !G.on()) return;                       // Ace's Help only (kept while it is off, until CHEER_TTL)
  if (!onMascotScreen() || !screenSince || Date.now() - screenSince < CHEER_SETTLE) return;
  if (!canAppear()) return;
  cheer = 0;
  playNow(withHome({ action: 'r-bravo' })).catch(() => {});
}
window.mascotCheer = (why) => {
  if (['win', 'ranked', 'trophy'].indexOf(why) < 0) return;
  cheer = Date.now();
  if (!cheerTimer) cheerTimer = setInterval(() => { tryCheer(); if (!cheer) { clearInterval(cheerTimer); cheerTimer = 0; } }, 1000);
};
if (typeof window !== 'undefined') window.addEventListener('pth-achievement', () => window.mascotCheer('trophy'));

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
