// ═══════════════════════════════════════════════════════════════════
// Ace's Help — loader (web extension, narmod 2026-09-30).
//
// A contextual assistant: once the player says yes, the Ace (the mascot of
// modules/mascot, docked at the bottom right) explains what matters where
// the player is — on the real app, the real tables, never fake data (D1).
// Separate from the « Animated mascot » option (idle scenes, D6): the scenes
// pause while the Ace is helping (window._guideBusy, modules/mascot/index.mjs).
//
//  · Offered ONCE on first launch (D3), off until the player says yes.
//  · Button « Ace's Help » on the login screen, in the header menus (lobby,
//    create, table — next to Help) and Advanced options → Assistance (D5).
//  · Each context is explained once; « Later » folds it into a badge, a tap
//    on the Ace shows it again (D7). Silent during a hand (D8).
//  · Progress: modules/guide/state.mjs (merged with the account, D9).
//  · Texts: modules/guide/lang/<code>.mjs through ./i18n.mjs (D12).
//  · Decisions: modules/guide/core.mjs + ranking-pick.mjs (no DOM, D13).
//
// L1 (web.259): foundation. L2 (web.260): public; C1 « join a Ranking
// table » (lobby) and C2 (ranked waiting room, facts while waiting, « Good
// luck! », the result of the game back in the lobby). L3 (web.261):
// statistics (beacons.mjs). L4 (web.262): C3 login screen, C4 Normal /
// training waiting room. L5 (web.263): C5 create page and windows.
// L6 (web.264): « ? » mode (hotspots.mjs). Console: guideDebug().
// ═══════════════════════════════════════════════════════════════════

import { createState, mergeIn, KEY_ON } from './state.mjs';
import { canSpeak, pickContext, replayContext, applies, createRun } from './core.mjs';
import { pickRankingTable, finishPlace, RANKED_TYPE, pointsFor } from './ranking-pick.mjs';
import { CONTEXTS } from './contexts/index.mjs';
import { gt, ready } from './i18n.mjs';
import * as hl from './highlight.mjs';
import { beacon } from './beacons.mjs';
import { hotspotFor, tappableFor } from './hotspots.mjs';

/** L2: public for everyone (L1 was behind ?guide=1). */
const PUBLIC = true;
const OFFER_DELAY_MS = 2500;
const EVAL_DEBOUNCE_MS = 350;
const SIGNUP_URL = 'https://www.pokerth.net/ucp.php?mode=register';
/** Buttons that do something (primary), besides later / next / gotIt. */
const ACTIONS = ['join', 'createRanking', 'signup', 'seeRanking'];

let M = null;                 // modules/mascot/guide.mjs once loaded
let wasOn = false;
let evalTimer = 0;
let offerTimer = 0;
let stepTimer = 0;            // auto-advance of a step (waiting-room facts)
let foldTimer = 0;            // unanswered bubble → badge
let noteTimer = 0;            // transient line (« Just one more! »)
let showing = null;           // { run, kind: 'ctx' | 'offer' | 'menu' | 'note' | 'flash' }
let lastWhere = null;
let lastWait = null;          // { gid, n } seen in the waiting room (arrivals)
let result = null;            // { gid, place, tied } of my last Ranking game
let tracker = null;           // { gid, hand, snap, last, done } while I play a Ranking game
const snoozed = new Set();    // contexts put off with « Later » this session
const counted = new Set();    // « shown » already counted this session (statistics, L3)
let joinedGid = 0;            // Ranking table joined from the bubble (funnel: → started)

const state = createState(
  (() => { try { return window.localStorage; } catch (e) { return null; } })() || { getItem: () => null, setItem() {} },
  (k) => { try { if (typeof window._cfgSyncMark === 'function') window._cfgSyncMark(String(k).replace(/^pth_/, '')); } catch (e) {} },
);

// ── Availability ───────────────────────────────────────────────────
// ?guide=1 is kept from L1 (remembered in pth_guide_dev) for testing a
// build where PUBLIC is false; ?guide=0 forgets it.
function devFlag() {
  try {
    const q = new URLSearchParams(location.search).get('guide');
    if (q === '1') localStorage.setItem('pth_guide_dev', '1');
    else if (q === '0') localStorage.removeItem('pth_guide_dev');
    return localStorage.getItem('pth_guide_dev') === '1';
  } catch (e) { return false; }
}
let avail = false;
function available() { return avail && !window.LIVE_MODE; }

// ── Where is the player? ───────────────────────────────────────────
function active(id) { const el = document.getElementById(id); return !!(el && el.classList.contains('active')); }
function S() { return window.PthState || {}; }

function motionOff() {
  try { if (document.documentElement.classList.contains('reduce-fx')) return true; } catch (e) {}
  try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
}

// The windows the Ace explains (C5), by key: the first opening of each one
// while the help is on. Order = priority when several are open.
function vis(sel) {
  const el = document.querySelector(sel);
  if (!el || el.hidden) return false;
  try { const c = getComputedStyle(el); if (c.display === 'none' || c.visibility === 'hidden') return false; } catch (e) { return false; }
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.right > 1 && r.left < window.innerWidth - 1 && r.bottom > 1 && r.top < window.innerHeight - 1;
}
/** Shown over the page (a drawer / dropdown), not laid out as a column of the screen. */
function overlay(sel) {
  if (!vis(sel)) return false;
  try { const p = getComputedStyle(document.querySelector(sel)).position; return p === 'fixed' || p === 'absolute'; } catch (e) { return false; }
}
const WINDOWS = [
  ['profile', () => vis('#player-info-modal')],
  ['avatar', () => vis('#avatar-popup')],
  ['events', () => vis('#forum-modal') && vis('#fn-events')],
  ['ranking', () => vis('#ranking-modal')],
  ['help', () => vis('#help-modal')],
  ['adv', () => vis('#adv-modal')],
  ['theme', () => vis('#theme-panel')],
  ['music', () => vis('#music-panel')],
  ['logs', () => vis('#jr-modal')],
  // the players list is a column of the lobby on wide screens: a « window » only as a drawer
  ['players', () => overlay('#players-panel')],
];
function openWindows() {
  const out = [];
  for (const [k, test] of WINDOWS) { try { if (test()) out.push(k); } catch (e) {} }
  return out;
}

/** A modal, a menu or a full page is open (floating windows do not count). */
function blocked() {
  try {
    if (!window.keynavHasOpenSurface || !window.keynavHasOpenSurface()) return false;
    const list = window.keynavOpenSurfaces ? window.keynavOpenSurfaces() : null;
    if (!list) return true;
    // parts of the current screen registered for Escape (the login form…) do not block him
    return list.some((el) => !(el.classList.contains('floating-win') || el.querySelector('.floating-win') || el.id === 'music-panel'
      || (el.closest && el.closest('.screen'))));
  } catch (e) { return false; }
}

/** First-run banners at the bottom of the screen (local backup…): the offer waits for them. */
function bannerUp() {
  const b = document.getElementById('bak-restore-banner');
  return !!(b && b.getBoundingClientRect().height > 0);
}

function splashGone() {
  const sp = document.getElementById('boot-splash');
  if (!sp || sp.classList.contains('bs-hide')) return true;
  try { const c = getComputedStyle(sp); return c.display === 'none' || c.visibility === 'hidden'; } catch (e) { return true; }
}

function shown(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  try { return getComputedStyle(el).display !== 'none'; } catch (e) { return el.style.display !== 'none'; }
}
function myTable(s) { try { return s.gId && s.games ? s.games[s.gId] || null : null; } catch (e) { return null; } }
function isGuest(s) {
  if (s._currentLoginMode === 'guest') return true;
  try { return !!(window._amMyPlayerGuest && window._amMyPlayerGuest()); } catch (e) { return false; }
}
/** Players at my (waiting) table — the same count as the lobby's game info panel. */
function presentCount(s) {
  try {
    const pids = Object.keys(s.seatData || {}).map(Number).filter((p) => s.seatData[p] && !s.seatData[p].gone);
    if (!s._amSpectator && s.myId && pids.indexOf(s.myId) === -1) pids.push(s.myId);
    if (pids.length) return pids.length;
  } catch (e) {}
  const g = myTable(s);
  return g ? g.players | 0 : 0;
}

/** The `where` snapshot read by core.mjs (see its header). */
export function where() {
  const s = S();
  let screen = 'other';
  if (active('s-game')) screen = 'game';
  else if (active('s-create')) screen = 'create';
  else if (active('s-lobby')) screen = document.getElementById('s-lobby').classList.contains('lobby-waiting') ? 'wait' : 'lobby';
  else if (active('s-connect')) screen = 'connect';
  const g = myTable(s);
  const ranked = !!(g && g.type === RANKED_TYPE) || !!(s._gameMeta && s._gameMeta.type === RANKED_TYPE && s.gId);
  const guest = isGuest(s);
  const net = !window._offlineMode && (s._currentLoginMode === 'auth' || s._currentLoginMode === 'guest');
  const online = screen !== 'connect' && !window._offlineMode && (typeof navigator === 'undefined' || navigator.onLine !== false);
  let games = [];
  try { games = window._gameListSnapshot ? window._gameListSnapshot() : []; } catch (e) {}
  return {
    helpOn: state.isOn(),
    screen,
    playing: screen === 'game' && !!s._gameStarted,
    online,
    guest,
    ranked,
    net,
    spectator: !!s._amSpectator,
    gid: s.gId || 0,
    host: !!(s.gId && s.amGameAdmin && !s._amSpectator),
    offline: !!window._offlineMode,
    loginStep: screen === 'connect' ? (shown('login-step2') ? 2 : 1) : 0,
    gamesLoaded: !!s.loaded,
    rankPick: net && online && !guest && !s.gId ? pickRankingTable(games) : null,
    waitCount: s.gId ? presentCount(s) : 0,
    waitMax: g ? g.maxPlayers || 10 : 10,
    result,
    windows: openWindows(),
  };
}

// ── The docked Ace ─────────────────────────────────────────────────
async function mascot() {
  if (!M) M = await import('../mascot/guide.mjs');
  return M;
}

function setBusy(on) { window._guideBusy = !!on; }

async function ensureDock() {
  const m = await mascot();
  await ready();
  if (out) await callBack();                          // out playing a scene: he comes back first
  await m.dock({ plain: motionOff(), label: gt('aceLabel'), onTap });
  setBusy(true);
  return m;
}

function clearTimers() {
  clearTimeout(stepTimer); stepTimer = 0;
  clearTimeout(foldTimer); foldTimer = 0;
  clearTimeout(noteTimer); noteTimer = 0;
}

function leave() {
  exitAsk(true);
  clearTimers();
  hl.clear();
  showing = null;
  if (M) M.undock();
  setBusy(false);
}

// ── Idle scenes from his spot (web.265) ────────────────────────────
// modules/mascot/index.mjs asks window._guideScene before an idle scene or a
// lobby reaction. With the help on, the scene starts from the docked Ace and
// brings him back (engine entry 'home', exits home / homeDoor / homePoof),
// and only when nothing waits for the player: no bubble, no badge, no « ? »
// mode — the tip first. A tip that comes up while he is out calls him back
// (he walks in, ~1 s), then speaks.
let out = false;              // the docked Ace is out playing a scene
let backWaiters = [];
function sceneReady() {
  return !!(M && M.isDocked() && !M.isPlain() && !showing && !M.bubbleOpen() && !M.hasBadge() && M.homeBox());
}
function recall() {
  if (out && typeof window._mascotRecall === 'function') { try { window._mascotRecall(); } catch (e) {} }
}
function callBack() {
  recall();
  return new Promise((resolve) => { backWaiters.push(resolve); setTimeout(resolve, 2500); });
}
function sceneBack(pop) {
  out = false;
  if (M && M.isDocked()) M.away(false, pop);
  const w = backWaiters; backWaiters = [];
  w.forEach((r) => r());
  schedule();
}
window._guideScene = {
  on: () => available() && state.isOn(),
  ready: sceneReady,
  home: () => (M ? M.homeBox() : null),
  away: () => { out = true; if (M) M.away(true); },
  back: sceneBack,
};

function btn(id, primary) { return { id, label: gt(id), primary: !!primary }; }
const val = (v, w) => (typeof v === 'function' ? v(w) : v);
/** A step target: one selector or several, the first one visible on screen wins. */
function firstVisible(sel) {
  const list = Array.isArray(sel) ? sel : sel ? [sel] : [];
  for (const q of list) {
    let el = null;
    try { el = document.querySelector(q); } catch (e) { el = null; }
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth)) continue;
    try { const c = getComputedStyle(el); if (c.visibility === 'hidden') continue; } catch (e) {}
    return el;
  }
  return null;
}

/** Shows the current step of the context run (again, after a live update). */
function renderStep(opts = {}) {
  const run = showing && showing.run;
  const step = run && run.step();
  if (!step) { closeBubble(); return; }
  const w = where();
  const last = run.isLast();
  let list;
  if (Array.isArray(step.buttons)) {
    const hasAction = step.buttons.some((id) => ACTIONS.indexOf(id) >= 0);
    list = step.buttons.map((id) => btn(id, ACTIONS.indexOf(id) >= 0 || (!hasAction && (id === 'gotIt' || id === 'next'))));
  } else {
    list = [btn('later'), last ? btn('gotIt', true) : btn('next', true)];
  }
  let text, vars, target;
  try { text = val(step.text, w); vars = val(step.vars, w); target = firstVisible(val(step.target, w)); }
  catch (e) { closeBubble(); schedule(); return; }        // the situation changed under the step
  if (!opts.keepHighlight || (target && hl.current() !== target)) {
    hl.clear();
    if (target) hl.highlight(target);
  }
  M.say({ text: gt(text, vars), buttons: list, point: !!hl.current(), avoid: hl.current(), ask: gt('askLabel'), onButton: onCtxButton });
  clearTimeout(stepTimer); stepTimer = 0;
  if (step.auto && !last) stepTimer = setTimeout(() => { if (showing && showing.run === run && run.next()) renderStep(); }, step.auto);
  if (!opts.keepFold) {
    clearTimeout(foldTimer); foldTimer = 0;
    if (run.ctx.fold) foldTimer = setTimeout(() => { if (showing && showing.run === run) onCtxButton('later'); }, run.ctx.fold);
  }
}

const ACTION_EV = { join: 'join', createRanking: 'create', signup: 'signup' };
function doAction(id, w) {
  try {
    if (id === 'join' && w.rankPick) joinedGid = w.rankPick.id;
    if (id === 'join' && w.rankPick && window.App && window.App.joinGame) window.App.joinGame(w.rankPick.id);
    else if (id === 'createRanking' && window.App && window.App.openCreatePage) window.App.openCreatePage({ ranking: true });
    else if (id === 'signup') window.open(SIGNUP_URL, '_blank', 'noopener');
    else if (id === 'seeRanking' && typeof window.toggleRankingModal === 'function') window.toggleRankingModal();
  } catch (e) {}
}

function onCtxButton(id) {
  if (id === 'ask') { enterAsk(); return; }
  const run = showing && showing.run;
  if (!run) { closeBubble(); return; }
  const cid = run.ctx.id;
  if (id === 'next') { if (run.next()) renderStep(); else { beacon(cid, 'done'); finish(cid); } return; }
  if (id === 'gotIt') { beacon(cid, 'done'); finish(cid); return; }
  if (ACTIONS.indexOf(id) >= 0) {
    const w = where();
    beacon(cid, 'done');
    if (ACTION_EV[id]) beacon(cid, id === 'signup' && cid === 'lobby-guest' ? 'guest_redirect' : ACTION_EV[id]);
    finish(cid); doAction(id, w); return;
  }
  // « Later », Escape, no answer: put off for this session, badge on the Ace
  beacon(cid, 'dismissed');
  snoozed.add(cid);
  closeBubble();
  if (M) M.badge(true);
}

function finish(cid) {
  state.markSeen(cid);
  snoozed.delete(cid);
  if (cid === 'ranked-result') result = null;       // told once per game
  closeBubble();
  schedule();
}

function closeBubble() {
  clearTimers();
  hl.clear();
  showing = null;
  if (M) M.hush();
}

async function showContext(ctx) {
  await ensureDock();
  showing = { run: createRun(ctx), kind: 'ctx' };
  renderStep();
  // points in a Ranking game: « Well done! » once the bubble is closed (modules/mascot/index.mjs, web.266)
  if (ctx.id === 'ranked-result' && result && result.place && pointsFor(result.place) > 0 && typeof window.mascotCheer === 'function') window.mascotCheer('ranked');
  // statistics: once per session per context (the result: once per game)
  const key = ctx.id + (ctx.repeat && result ? ':' + result.gid : '');
  if (!counted.has(key)) { counted.add(key); beacon(ctx.id, 'shown'); }
}

async function note(key, buttons, onButton, vars) {
  const m = await ensureDock();
  clearTimers();
  hl.clear();
  showing = { kind: 'note' };
  m.say({ text: gt(key, vars), buttons, onButton: onButton || (() => closeBubble()) });
}

async function showMenu() {
  await note('menuOn', [btn('askMenu'), btn('turnOff'), btn('resetTips'), btn('close', true)], (id) => {
    if (id === 'askMenu' || id === 'ask') { enterAsk(); return; }
    if (id === 'turnOff') { turnOff(); return; }
    if (id === 'resetTips') { resetTips(); return; }
    closeBubble();
  });
  showing.kind = 'menu';
}

// ── « ? » mode (C6) ────────────────────────────────────────────────
// A tap on any element makes the Ace say what it does (hotspots.mjs) instead
// of acting; a second tap on the same element lets it through. The Ace's own
// dock is never intercepted. Ends with « Done », Escape, the help switched
// off, or a hand starting (D8).
let armed = null;
function askSay(key, extra) {
  if (!M) return;
  M.say({ text: gt(key) + (extra ? ' ' + gt(extra) : ''), buttons: [btn('askDone', true)], avoid: hl.current(),
    point: !!hl.current(), onButton: () => exitAsk() });
}
async function enterAsk() {
  await ensureDock();
  clearTimers(); hl.clear();
  armed = null;
  showing = { kind: 'ask' };
  try { document.body.classList.add('guide-ask'); } catch (e) {}
  document.addEventListener('click', onAskClick, true);
  document.addEventListener('pointerdown', onAskDown, true);
  document.addEventListener('keydown', onAskKey, true);
  askSay('askIntro');
  beacon('ask', 'shown');
}
function exitAsk(silent) {
  document.removeEventListener('click', onAskClick, true);
  document.removeEventListener('pointerdown', onAskDown, true);
  document.removeEventListener('keydown', onAskKey, true);
  try { document.body.classList.remove('guide-ask'); } catch (e) {}
  const was = showing && showing.kind === 'ask';
  armed = null;
  if (was) { beacon('ask', 'done'); if (!silent) closeBubble(); }
}
function askTarget(t) {
  if (!t || (t.closest && t.closest('#ace-dock'))) return null;
  const hs = hotspotFor(t);
  if (hs) return hs;
  const el = tappableFor(t);
  return el ? { el, key: null } : null;
}
function onAskDown(ev) {
  // a <select> opens on press: keep it closed until it has been explained
  const hit = askTarget(ev.target);
  if (hit && hit.el !== armed && hit.el.tagName === 'SELECT') ev.preventDefault();
}
function onAskClick(ev) {
  const hit = askTarget(ev.target);
  if (!hit) return;                                   // plain text, the Ace: nothing to stop
  // 2nd tap on the explained element: let it act (it stays « armed », so a label's own click on its box goes through too)
  if (armed && (hit.el === armed || armed.contains(ev.target) || hit.el.contains(armed))) return;
  ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation();
  armed = hit.el;
  hl.highlight(hit.el);
  if (hit.key) { askSay(hit.key, 'askAgain'); beacon('ask', 'explained'); }
  else askSay('askUnknown');
}
function onAskKey(ev) {
  if (ev.key === 'Escape') { ev.stopPropagation(); exitAsk(); }
}

/**
 * A short line over the current bubble (no buttons), then the bubble comes
 * back as it was — « Just one more! » in the waiting room.
 */
function flash(key, ms) {
  if (!M || !M.isDocked() || out) return;
  const back = showing && showing.kind === 'ctx' ? showing : null;
  clearTimeout(noteTimer);
  clearTimeout(stepTimer); stepTimer = 0;
  M.say({ text: gt(key), buttons: [] });
  showing = { kind: 'flash', back };
  noteTimer = setTimeout(() => {
    noteTimer = 0;
    if (!showing || showing.kind !== 'flash') return;
    if (back) { showing = back; renderStep({ keepFold: true }); }
    else closeBubble();
  }, ms);
}

/** Tap on the Ace: closes the bubble, or replays the tip of this place, or opens the menu. */
function onTap() {
  if (M && M.bubbleOpen()) {
    if (showing && showing.kind === 'offer') return;
    if (showing && showing.kind === 'ask') { exitAsk(); return; }
    if (showing && showing.kind === 'ctx') { onCtxButton('later'); return; }
    closeBubble(); return;
  }
  const w = where();
  const ctx = canSpeak(w) ? replayContext(w, CONTEXTS) : null;
  if (ctx) { snoozed.delete(ctx.id); showContext(ctx); return; }
  showMenu();
}

// ── Turning the help on / off ──────────────────────────────────────
function setOn(on) {
  // same path as the checkbox in Advanced options (sync mark + applyAdvOpts → _guideApply)
  if (typeof window.setAdvOpt === 'function') window.setAdvOpt('guide_on', on);
  else { state.setOn(on); apply(); }
}

function turnOn() {
  state.markOffered();
  if (!state.isOn()) setOn(true);
  else welcome();
}

async function turnOff() {
  // a last word (shown first, so switching off does not tear the bubble down), then he leaves
  await note('turnedOff', [btn('close', true)], () => leave());
  setOn(false);
}

function resetTips() {
  state.resetSeen();
  snoozed.clear();
  note('resetDone', [btn('close', true)], () => { closeBubble(); schedule(); });
}

function welcome() {
  const ctx = CONTEXTS.find((c) => c.id === 'welcome');
  if (ctx && canSpeakHere()) showContext(ctx);
}

function canSpeakHere() {
  const w = where();
  w.helpOn = true;
  return canSpeak(w);
}

/** Button « Ace's Help » (login screen, header menus). */
function toggle() {
  if (!available()) return;
  if (!state.isOn()) { turnOn(); return; }
  if (!canSpeakHere()) return;
  showMenu();
}

/** Called by applyAdvOpts (pokerth.js) on every option change. */
function apply() {
  const on = state.isOn();
  if (on && !wasOn) {
    wasOn = true;
    state.markOffered();
    if (available()) welcome();
    return;
  }
  if (!on && wasOn) {
    wasOn = false;
    if (!(showing && showing.kind === 'note')) leave();
    return;
  }
  schedule();
}

// ── First-launch offer (D3) ────────────────────────────────────────
// Not under automation (navigator.webdriver): the other browser tests and
// their canonical screenshots must not get a bubble 2.5 s after loading.
// scripts/test-guide-browser.mjs opts in with localStorage pth_guide_webdriver.
function automated() {
  try { return !!navigator.webdriver && localStorage.getItem('pth_guide_webdriver') !== '1'; } catch (e) { return false; }
}
function maybeOffer() {
  clearTimeout(offerTimer);
  if (!available() || state.isOn() || state.wasOffered() || automated()) return;
  offerTimer = setTimeout(async () => {
    if (!available() || state.isOn() || state.wasOffered()) return;
    const w = where();
    if (!(w.screen === 'connect' || w.screen === 'lobby') || !splashGone() || blocked() || document.hidden || bannerUp()) { maybeOffer(); return; }
    const m = await ensureDock();
    showing = { kind: 'offer' };
    beacon('offer', 'offered');
    m.say({
      text: gt('offer'),
      buttons: [btn('offerNo'), btn('offerYes', true)],
      onButton: (id) => {
        state.markOffered();
        if (id === 'offerYes') { beacon('offer', 'accepted'); closeBubble(); turnOn(); }
        else { beacon('offer', 'dismissed'); leave(); }
      },
    });
  }, OFFER_DELAY_MS);
}

// ── Following the player ───────────────────────────────────────────
function schedule() {
  clearTimeout(evalTimer);
  evalTimer = setTimeout(evaluate, EVAL_DEBOUNCE_MS);
}

async function evaluate() {
  evalTimer = 0;
  const prev = lastWhere;
  const w = where();
  lastWhere = w;
  try { trackResult(w, prev); } catch (e) {}
  if (!available()) { if (!(showing && showing.kind === 'offer')) leave(); return; }
  if (!state.isOn()) {
    if (!(showing && (showing.kind === 'offer' || showing.kind === 'note'))) leave();
    maybeOffer();
    return;
  }
  // statistics: a Ranking game started from its waiting room (it only starts
  // full) — and was it the table the Ace pointed at? (funnel, L3)
  if (prev && prev.screen === 'wait' && prev.ranked && w.screen === 'game') {
    beacon('wait-ranking', 'started');
    if (joinedGid && joinedGid === prev.gid) beacon('lobby-ranking', 'started');
    joinedGid = 0;
  }
  if (!canSpeak(w)) {
    // a ranked game just started from its waiting room: « Good luck! », then he leaves (D8)
    if (prev && prev.screen === 'wait' && prev.ranked && w.screen === 'game' && M && M.isDocked() && !(showing && showing.kind === 'luck')) {
      clearTimers(); hl.clear();
      M.say({ text: gt('goodLuck'), buttons: [] });
      M.react('wave');
      showing = { kind: 'luck' };
      noteTimer = setTimeout(() => { if (showing && showing.kind === 'luck') leave(); }, 1800);
      return;
    }
    if (!(showing && showing.kind === 'luck')) leave();   // silent during a hand (D8)
    return;
  }
  if (showing && showing.kind === 'ask') { armed = armed && armed.isConnected ? armed : null; return; }   // « ? » mode: the player leads
  const moved = !prev || prev.screen !== w.screen;
  if (moved && M && M.isDocked()) M.settle(true);       // new layout: a free spot again, bubble or not
  if (M && M.bubbleOpen()) {
    // the tip on screen no longer applies (the player moved on): fold it away
    if (showing && showing.kind === 'ctx' && !applies(showing.run.ctx, w)) closeBubble();
    // a window just opened over a screen tip: the window's explanation comes first
    else if (showing && showing.kind === 'ctx' && !showing.run.ctx.window
      && (pickContext(w, CONTEXTS, { seen: state.seen, snoozed: (id) => snoozed.has(id) }) || {}).window) closeBubble();
    else return;
  }
  if (out) {                                           // out playing a scene: a tip calls him back, then speaks (sceneBack re-evaluates)
    const c0 = pickContext(w, CONTEXTS, { seen: state.seen, snoozed: (id) => snoozed.has(id) });
    if (c0 && !(blocked() && !c0.window)) recall();
    return;
  }
  const m = await ensureDock();
  m.settle();                                          // the screen changed: a free spot again
  const ctx = pickContext(w, CONTEXTS, { seen: state.seen, snoozed: (id) => snoozed.has(id) });
  // over a modal / menu only a window's own explanation speaks (C5)
  if (blocked() && !(ctx && ctx.window)) return;
  if (ctx) { showContext(ctx); return; }
  m.badge(CONTEXTS.some((c) => !c.manual && snoozed.has(c.id) && applies(c, w)));
}

// ── Live game list (C1 / C2) ───────────────────────────────────────
function onGames() {
  if (!available() || !state.isOn()) return;
  const w = where();
  // waiting room: arrivals make the Ace hop, « Just one more! » at 9/10
  if (w.screen === 'wait' && w.ranked && M && M.isDocked()) {
    const gid = S().gId;
    if (lastWait && lastWait.gid === gid && w.waitCount > lastWait.n) {
      M.react('hop');
      if (w.waitCount === w.waitMax - 1) flash('oneMore', 4000);
    }
    lastWait = { gid, n: w.waitCount };
  } else if (w.screen !== 'wait') lastWait = null;
  // the tip on screen follows the list (another table fuller, this one started…)
  if (showing && showing.kind === 'ctx' && showing.run.ctx.live && M && M.bubbleOpen()) {
    if (!applies(showing.run.ctx, w)) { closeBubble(); schedule(); return; }
    renderStep({ keepHighlight: true, keepFold: true });
    return;
  }
  if (!(M && M.bubbleOpen())) schedule();
}

// A guest taps a Ranking (or registered-only) table anyway: the Ace explains
// again instead of leaving the bare « account required » (D16).
function onListTap(ev) {
  if (!available() || !state.isOn()) return;
  const row = ev.target && ev.target.closest ? ev.target.closest('#g-list .game-row[data-gid]') : null;
  if (!row) return;
  const s = S();
  if (!isGuest(s)) return;
  const g = s.games ? s.games[row.getAttribute('data-gid')] : null;
  if (!g || g.type === 1) return;
  const ctx = CONTEXTS.find((c) => c.id === 'lobby-guest');
  if (ctx && canSpeak(where())) { snoozed.delete(ctx.id); showContext(ctx); }
}

// ── My place in a Ranking game (C2.4) ──────────────────────────────
// Stacks are read at every new hand (and when the end-of-game screen shows
// up); ranking-pick.mjs::finishPlace decides. The Ace tells it back in the lobby.
function stacks(s) {
  const out = {};
  for (const pid of s.seats || []) {
    const d = s.seatData ? s.seatData[pid] : null;
    out[pid] = d && typeof d.money === 'number' ? d.money : null;
  }
  return out;
}
function endScreenUp() {
  const el = document.getElementById('g-endgame-overlay');
  if (!el) return false;
  try { const c = getComputedStyle(el); return c.display !== 'none' && c.visibility !== 'hidden'; } catch (e) { return false; }
}
function trackResult(w, prev) {
  const s = S();
  const inRanked = w.screen === 'game' && w.ranked && w.net && !w.spectator && s.myId && s.gId;
  if (!inRanked) {
    // left the table: settle with the last stacks seen (out in the last hand, then left)
    if (tracker && !tracker.done && tracker.last) {
      const r = finishPlace(tracker.snap, tracker.last, tracker.me);
      if (r && r.place !== 1) result = { gid: tracker.gid, place: r.place, tied: !!r.tied };
    }
    if (w.screen !== 'game') tracker = null;
    return;
  }
  const snap = stacks(s);
  if (!tracker || tracker.gid !== s.gId) { tracker = { gid: s.gId, me: s.myId, hand: s.handNum, snap, last: snap, done: false }; return; }
  tracker.last = snap;
  if (tracker.done) return;
  let r = null;
  if (s.handNum !== tracker.hand) {
    r = finishPlace(tracker.snap, snap, s.myId);
    if (r && r.place === 1) r = null;                  // a winner is only known at the end screen
    tracker.hand = s.handNum; tracker.snap = snap;
  }
  if (!r && endScreenUp()) {
    const e = finishPlace(tracker.snap, snap, s.myId);
    if (e && e.place === 1) r = e;
  }
  if (r) { tracker.done = true; result = { gid: s.gId, place: r.place, tied: !!r.tied }; }
}
let tickTimer = 0;
let lastWins = '';
function tick() {
  // windows opened / closed (C5): re-evaluate
  if (available() && state.isOn()) {
    const wins = openWindows().join(',');
    if (wins !== lastWins) { lastWins = wins; schedule(); }
  }
  // while seated at a Ranking game: follow the stacks (cheap, once a second)
  const w = lastWhere;
  if (w && (w.screen === 'game' || tracker)) {
    try { const now = where(); trackResult(now, w); lastWhere = now; } catch (e) {}
  }
}

// ── Account sync bridge (pokerth.js _guideMergeIn) ─────────────────
// Returns true when this device knows more than the account (→ push back).
function mergeFromAccount(o) {
  let res = null;
  try { res = mergeIn(o, state.raw()); } catch (e) { return false; }
  state.applyMerge(res);
  if (res.changed) schedule();
  return res.needPush;
}

// ── Boot ───────────────────────────────────────────────────────────
function init() {
  avail = PUBLIC || devFlag();
  wasOn = state.isOn();
  try { document.body.classList.toggle('guide-avail', available()); } catch (e) {}
  window._guideStore = { mergeIn: mergeFromAccount };
  if (window._guidePendingSync) {
    const o = window._guidePendingSync;
    window._guidePendingSync = null;
    if (mergeFromAccount(o)) { try { if (typeof window._cfgSyncMark === 'function') window._cfgSyncMark('guide'); } catch (e) {} }
  }
  if (!available()) return;
  const mo = new MutationObserver(schedule);
  for (const id of ['s-connect', 's-lobby', 's-create', 's-game']) {
    const el = document.getElementById(id);
    if (el) mo.observe(el, { attributes: true, attributeFilter: ['class'] });
  }
  // login screen: mode cards (step 1) ↔ form of the chosen mode (step 2)
  for (const id of ['login-step1', 'login-step2']) {
    const el = document.getElementById(id);
    if (el) mo.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
  window.addEventListener('online', schedule);
  window.addEventListener('offline', schedule);
  window.addEventListener('pth:games', onGames);
  document.addEventListener('click', onListTap, true);
  if (!tickTimer) tickTimer = setInterval(tick, 1000);
  schedule();
}

window._guideApply = apply;
window.guideToggle = toggle;
window.guideResetTips = () => { if (available()) resetTips(); };
/** « ? » mode: tap anything to hear what it does (C6). */
window.guideAsk = () => { if (available() && state.isOn() && canSpeakHere()) enterAsk(); };
/** Console: the current situation and saved progress. */
window.guideDebug = () => ({ available: available(), on: state.isOn(), offered: state.wasOffered(), seen: state.seenIds(), snoozed: [...snoozed], where: where(), result, key: KEY_ON });

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}
