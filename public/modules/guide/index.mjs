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
// L6 (web.264): « ? » mode (hotspots.mjs). H1 (web.267): « More help », the
// help window's knowledge read in his bubble (knowledge.mjs), on demand even
// with the tips off; laid out like the old help window since web.286.
// Console: guideDebug().
// ═══════════════════════════════════════════════════════════════════

import { createState, mergeIn, KEY_ON } from './state.mjs';
import { canSpeak, pickContext, replayContext, applies, createRun } from './core.mjs';
import { pickRankingTable, finishPlace, RANKED_TYPE, pointsFor } from './ranking-pick.mjs';
import { CONTEXTS } from './contexts/index.mjs';
import { gt, ready } from './i18n.mjs';
import * as hl from './highlight.mjs';
import { beacon } from './beacons.mjs';
import { hotspotFor, tappableFor, windowFor } from './hotspots.mjs';
import { loadHelp, chapterFor, search as helpSearch, findSection } from './knowledge.mjs';

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
let scrollTimer = 0;
let lastSpot = null;          // where the outlined element was at the last tick          // tour: the bubble is placed again once a field scrolled into view
let showing = null;           // { run, kind: 'ctx' | 'offer' | 'menu' | 'note' | 'flash' | 'ask' | 'help' }
let lastWhere = null;
let lastWait = null;          // { gid, n } seen in the waiting room (arrivals)
let result = null;            // { gid, place, tied } of my last Ranking game
let tracker = null;           // { gid, hand, snap, last, done } while I play a Ranking game
const snoozed = new Set();    // contexts put off with « Later » this session
const resumeAt = new Map();   // tour id → the step it was left at with « Later » (this session)
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
  ['posts', () => vis('#forum-modal') && vis('#fn-list')],
  ['ranking', () => vis('#ranking-modal')],
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
    // the create page (tour, web.288): the game style block open, saved preferences (⭐ pill shown)
    styleOpen: screen === 'create' && shown('cf-style-grid'),
    prefs: screen === 'create' && shown('cf-preset-perso'),
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
  if (!m.isDocked()) return null;                     // undocked meanwhile (leave() during the engine download / pop): the caller stops (web.276)
  setBusy(true);
  return m;
}

function clearTimers() {
  clearTimeout(scrollTimer); scrollTimer = 0;
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
  return !!(M && !out && M.isDocked() && !M.isPlain() && !showing && !M.bubbleOpen() && !M.hasBadge() && M.homeBox());
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

/**
 * A tour target: the first selector that is on the page (laid out, not
 * hidden), on screen or not — the tour brings it into view. With `row`, the
 * field's row stands for it (a switch's own checkbox is hidden by its styling).
 */
function firstPresent(sel, row) {
  const list = Array.isArray(sel) ? sel : sel ? [sel] : [];
  for (const q of list) {
    let el = null;
    try { el = document.querySelector(q); } catch (e) { el = null; }
    if (!el) continue;
    el = (row && el.closest(row)) || el;
    if (!el.getClientRects().length) continue;
    try { const c = getComputedStyle(el); if (c.visibility === 'hidden') continue; } catch (e) {}
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

/** Tour: the element to outline for a step (its row, when the context says so). */
function tourTarget(ctx, step, w) {
  return firstPresent(val(step.target, w), ctx.row);
}

/**
 * Tour: the step's field is scrolled to the top of the screen, just under the
 * header, and outlined; the bubble sits next to the Ace, who stays at his base
 * spot at the bottom. Near the end of the page, where the field cannot go up
 * that far, the bubble moves under the header instead. Instant under
 * « Reduced effects ».
 */
/**
 * Scrolls `el` to `top` px from the top of the screen by moving its own
 * scrolling list only (the create page's column). Never scrollIntoView: it
 * also scrolled the page itself (html, overflow hidden), which slid the whole
 * screen up over a black band on iPhone and stayed so after the tour (web.290).
 */
function scrollUnder(el, top) {
  const r = el.getBoundingClientRect();
  for (let n = el.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
    let cs = null;
    try { cs = getComputedStyle(n); } catch (e) { cs = null; }
    if (!cs || !/(auto|scroll)/.test(cs.overflowY) || n.scrollHeight <= n.clientHeight + 1) continue;
    const to = Math.max(0, Math.min(n.scrollHeight - n.clientHeight, Math.round(n.scrollTop + r.top - top)));
    try { n.scrollTo({ top: to, behavior: motionOff() ? 'auto' : 'smooth' }); } catch (e) { n.scrollTop = to; }
    return;
  }
}

function bringIntoView(el) {
  clearTimeout(scrollTimer); scrollTimer = 0;
  if (!el || !M) return;
  const bub = M.bubbleEl();
  const top = Math.round((M.topEdge ? M.topEdge() : 0) + 12);
  const r = el.getBoundingClientRect(), b0 = bub.getBoundingClientRect();
  const fits = r.top >= top && r.bottom <= b0.top - 8;     // already in sight above the bubble
  if (!fits) scrollUnder(el, top);
  const done = () => {
    scrollTimer = 0;
    if (!M || !M.bubbleOpen() || hl.current() !== el) return;
    hl.refresh();
    const over = (a, b) => a.top < b.bottom - 4 && a.bottom > b.top + 4 && a.left < b.right - 4 && a.right > b.left + 4;
    const f = el.getBoundingClientRect();
    if (over(f, bub.getBoundingClientRect())) M.setPos('top');   // the end of the page: the field could not go up
    // the Ace standing on the field (the last buttons, at the bottom right): he steps aside, his bubble follows
    const ace = document.querySelector('#ace-dock .ad-ace');
    if (ace && over(f, ace.getBoundingClientRect())) M.settle(true);
  };
  if (fits || motionOff()) done(); else scrollTimer = setTimeout(done, 520);
}

/** Shows the current step of the context run (again, after a live update). */
function renderStep(opts = {}) {
  const run = showing && showing.run;
  const step = run && run.step();
  if (!step) { closeBubble(); return; }
  const w = where();
  const last = run.isLast();
  const tour = !!run.ctx.tour;
  let list;
  if (Array.isArray(step.buttons)) {
    const hasAction = step.buttons.some((id) => ACTIONS.indexOf(id) >= 0);
    list = step.buttons.map((id) => btn(id, ACTIONS.indexOf(id) >= 0 || (!hasAction && (id === 'gotIt' || id === 'next'))));
  } else {
    list = [btn('later')];
    if (tour && run.index > 0) list.push(btn('prev'));
    list.push(last ? btn('gotIt', true) : btn('next', true));
  }
  let text, vars, target;
  try {
    text = val(step.text, w); vars = val(step.vars, w);
    target = tour ? tourTarget(run.ctx, step, w) : firstVisible(val(step.target, w));
  } catch (e) { closeBubble(); schedule(); return; }      // the situation changed under the step
  if (!opts.keepHighlight || (target && hl.current() !== target)) {
    hl.clear();
    if (target) hl.highlight(target);
  }
  let say = gt(text, vars);
  const lk = tour && run.ctx.locked;
  if (lk && target) { try { if (target.closest(lk.sel)) say += '\n' + gt(lk.text); } catch (e) {} }
  const count = tour && run.count > 1 ? (run.index + 1) + '/' + run.count : '';
  M.say({ text: say, count, pos: tour ? 'bottom' : null, buttons: list, point: !!hl.current(), avoid: hl.current(), ask: gt('askLabel'), onButton: onCtxButton });
  if (tour) bringIntoView(target);
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
  if (id === 'prev') { run.prev(); renderStep(); return; }
  if (id === 'gotIt') { beacon(cid, 'done'); finish(cid); return; }
  if (ACTIONS.indexOf(id) >= 0) {
    const w = where();
    beacon(cid, 'done');
    if (ACTION_EV[id]) beacon(cid, id === 'signup' && cid === 'lobby-guest' ? 'guest_redirect' : ACTION_EV[id]);
    finish(cid); doAction(id, w); return;
  }
  // « Later », Escape, no answer: put off for this session, badge on the Ace
  // (a tour starts again where the player left it)
  beacon(cid, 'dismissed');
  snoozed.add(cid);
  if (run.ctx.tour) resumeAt.set(cid, run.index); else resumeAt.delete(cid);
  closeBubble();
  if (M) M.badge(true);
}

function finish(cid) {
  state.markSeen(cid);
  snoozed.delete(cid);
  resumeAt.delete(cid);
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
  exitAsk(true);                                       // a tip over « ? » mode ends it (web.276)
  if (!(await ensureDock())) return;
  let run;
  if (ctx.tour) {
    // a form tour: only the steps whose field is on this page (training has no name, type…)
    const w = where();
    run = createRun(ctx, w, (s) => !s.target || !s.optional || !!firstPresent(val(s.target, w), ctx.row));
    if (resumeAt.has(ctx.id)) { run.go(resumeAt.get(ctx.id)); resumeAt.delete(ctx.id); }
  } else run = createRun(ctx);
  showing = { run, kind: 'ctx' };
  renderStep();
  // points in a Ranking game: « Well done! » once the bubble is closed (modules/mascot/index.mjs, web.266)
  if (ctx.id === 'ranked-result' && result && result.place && pointsFor(result.place) > 0 && typeof window.mascotCheer === 'function') window.mascotCheer('ranked');
  // statistics: once per session per context (the result: once per game)
  const key = ctx.id + (ctx.repeat && result ? ':' + result.gid : '');
  if (!counted.has(key)) { counted.add(key); beacon(ctx.id, 'shown'); }
}

async function note(key, buttons, onButton, vars) {
  exitAsk(true);
  const m = await ensureDock();
  if (!m) return;
  clearTimers();
  hl.clear();
  showing = { kind: 'note' };
  m.say({ text: gt(key, vars), buttons, onButton: onButton || (() => endOnDemand()) });
}

async function showMenu() {
  // the tip of this screen, to read it again (web.271: a tap on the Ace opens this menu, it no longer replays the tip)
  const w = where();
  // tips off (web.275): the same menu without the tips, and « Turn on tips » — the header
  // menus only have « Ace's Help » now, so the whole help stays one tap away
  const on = state.isOn();
  const tip = on && canSpeak(Object.assign({}, w, { helpOn: true })) ? replayContext(w, CONTEXTS) : null;
  const list = [btn('moreHelp'), btn('askMenu')];
  if (tip) list.push(btn('replayTip'));
  if (!appInstalled()) list.push(btn('installApp'));
  if (on) list.push(btn('turnOff'), btn('resetTips'));
  else list.push(btn('turnOn'));
  list.push(btn('close', true));
  await note(on ? 'menuOn' : 'menuOff', list, (id) => {
    if (id === 'moreHelp') { openMoreHelp(); return; }
    if (id === 'turnOn') { const speak = canSpeakHere(); turnOn(); if (!speak) endOnDemand(); return; }   // at the table no welcome: the menu goes
    if (id === 'installApp') { showInstall(); return; }
    if (id === 'replayTip' && tip) { snoozed.delete(tip.id); showContext(tip); return; }
    if (id === 'askMenu' || id === 'ask') { enterAsk(); return; }
    if (id === 'turnOff') { turnOff(); return; }
    if (id === 'resetTips') { resetTips(); return; }
    endOnDemand();                                     // « Close »: tips off or at the table, he goes (web.276)
  });
  if (showing && showing.kind === 'note') showing.kind = 'menu';
}

// ── Install the app (web.274) ──────────────────────────────────────
// « Install the app » in his menu (hidden once the app runs installed): the
// steps for this device, « Install now » when the browser offers its own
// prompt (pokerth.js window.pwaCanPrompt), and the help section start:pwa.
function appInstalled() {
  try { if (typeof window.pwaInstalled === 'function') return !!window.pwaInstalled(); } catch (e) {}
  try { return navigator.standalone === true || matchMedia('(display-mode: standalone)').matches; } catch (e) { return false; }
}
/** The steps that fit this device: 'instIos', 'instAndroid' or 'instDesktop'. */
function installKey(ua, touch) {
  ua = String(ua || '');
  if (/iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && touch > 1)) return 'instIos';
  if (/Android/.test(ua)) return 'instAndroid';
  return 'instDesktop';
}
async function showInstall() {
  let prompt = false;
  try { prompt = typeof window.pwaCanPrompt === 'function' && !!window.pwaCanPrompt(); } catch (e) {}
  const key = prompt ? 'instPrompt' : installKey(navigator.userAgent, navigator.maxTouchPoints || 0);
  const buttons = prompt ? [btn('instNow', true), btn('moreAbout'), btn('close')] : [btn('moreAbout'), btn('close', true)];
  exitAsk(true);
  const m = await ensureDock();
  if (!m) return;
  clearTimers();
  hl.clear();
  showing = { kind: 'note' };
  m.say({ text: gt('instWhy') + ' ' + gt(key), buttons, onButton: (id) => {
    if (id === 'instNow') { endOnDemand(); try { window.pwaInstall(); } catch (e) {} return; }
    if (id === 'moreAbout') { openMoreHelp({ ch: 'start', sec: 'pwa' }); return; }
    endOnDemand();
  } });
}

// ── « ? » mode (C6) ────────────────────────────────────────────────
// A tap on any element makes the Ace say what it does (hotspots.mjs) instead
// of acting; a second tap on the same element lets it through. The Ace's own
// dock is never intercepted. Ends with « Done », Escape, the help switched
// off, or a hand starting (D8).
let armed = null;
let asking = false;           // « ? » mode armed (listeners, body.guide-ask) — not tied to the bubble on screen (web.276)
let askMore = null;           // 'chapter:section' of the help about the element explained (H2)
function askSay(key, extra, more, vars, pre) {
  if (!M) return;
  askMore = more || null;
  const buttons = more ? [btn('moreAbout'), btn('askDone', true)] : [btn('askDone', true)];
  M.say({ text: (pre ? pre + ' ' : '') + gt(key, vars || undefined) + (extra ? ' ' + gt(extra) : ''), buttons, avoid: hl.current(),
    point: !!hl.current(), onButton: (id) => {
      if (id === 'moreAbout' && askMore) {   // « More about it »: that section of the help, in his bubble
        const [ch, sec] = askMore.split(':');
        exitAsk(true); beacon('ask', 'more'); openMoreHelp({ ch, sec });
        return;
      }
      exitAsk();
    } });
}
async function enterAsk() {
  if (!(await ensureDock())) return;
  clearTimers(); hl.clear();
  armed = null;
  asking = true;
  showing = { kind: 'ask' };
  try { document.body.classList.add('guide-ask'); } catch (e) {}
  document.addEventListener('click', onAskClick, true);
  document.addEventListener('pointerdown', onAskDown, true);
  document.addEventListener('keydown', onAskKey, true);
  askSay('askIntro');
  beacon('ask', 'shown');
  loadHelp(helpLang()).then((c) => { askHelp = c; }).catch(() => {});   // « More about it » for elements without their own text
}
// ── Elements without their own entry (web.272) ─────────────────────
// Never a bare « no explanation »: the element's own name (its tooltip,
// label or text, already in the player's language) is said, with the help
// section that talks about it (search) behind « More about it ».
let askHelp = null;
function labelOf(el) {
  if (!el || !el.getAttribute) return '';
  let s = el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('placeholder') || el.getAttribute('alt') || '';
  if (!s) s = (el.textContent || '').replace(/\s+/g, ' ').trim();
  s = s.replace(/[✕×▾▸›‹]/g, '').trim();
  return s.length >= 2 && s.length <= 60 ? s : '';
}
function moreFor(label) {
  if (!askHelp || !label) return null;
  const hit = helpSearch(askHelp, label, 1)[0];
  return hit ? hit.ch.id + ':' + hit.sec.id : null;
}
function exitAsk(silent) {
  document.removeEventListener('click', onAskClick, true);
  document.removeEventListener('pointerdown', onAskDown, true);
  document.removeEventListener('keydown', onAskKey, true);
  try { document.body.classList.remove('guide-ask'); } catch (e) {}
  const was = asking || !!(showing && showing.kind === 'ask');
  asking = false;
  armed = null;
  if (was) { beacon('ask', 'done'); if (!silent) { closeBubble(); if (!state.isOn() || where().screen === 'game') leave(); else schedule(); } }   // on demand: he goes
}
function askTarget(t) {
  if (!t || (t.closest && t.closest('#ace-dock'))) return null;
  // body.guide-ask gives everything the « help » cursor: read the page's own cursor without it,
  // or the hand-cursor fallback of tappableFor() never matches (web.276)
  const b = document.body, on = b && b.classList.contains('guide-ask');
  if (on) b.classList.remove('guide-ask');
  try {
    const hs = hotspotFor(t) || windowFor(t);   // a listed element, else the window it belongs to (H2)
    if (hs) return hs;
    const el = tappableFor(t);
    return el ? { el, key: null } : null;
  } finally { if (on) b.classList.add('guide-ask'); }
}
function atMyTurnAction(ev) {
  try { return myTurn() && ev.target && ev.target.closest && ev.target.closest(ACTION_ZONE); } catch (e) { return false; }
}
function onAskDown(ev) {
  if (atMyTurnAction(ev)) { endOnDemand(); return; }   // my turn: the action goes through (H3)
  // a <select> opens on press: keep it closed until it has been explained
  const hit = askTarget(ev.target);
  if (hit && hit.el !== armed && hit.el.tagName === 'SELECT') ev.preventDefault();
}
function onAskClick(ev) {
  if (atMyTurnAction(ev)) { endOnDemand(); return; }
  const hit = askTarget(ev.target);
  if (!hit) return;                                   // plain text, the Ace: nothing to stop
  // 2nd tap on the explained element: let it act (it stays « armed », so a label's own click on its box goes through too)
  if (armed && (hit.el === armed || armed.contains(ev.target) || hit.el.contains(armed))) return;
  ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation();
  armed = hit.el;
  hl.highlight(hit.el);
  const label = labelOf(hit.el);
  if (hit.key && hit.win && label) { askSay(hit.key, 'askAgain', hit.more, hit.vars, gt('hsLabelled', { label })); beacon('ask', 'explained'); }   // a window's control: its name + the window
  else if (hit.key) { askSay(hit.key, 'askAgain', hit.more, hit.vars); beacon('ask', 'explained'); }
  else if (label) { askSay('hsLabelled', 'askAgain', moreFor(label), { label }); beacon('ask', 'explained'); }
  else askSay('askUnknown');
}
function onAskKey(ev) {
  if (ev.key === 'Escape') { ev.stopPropagation(); exitAsk(); }
}

// ── « More help » (H1, web.267) ────────────────────────────────────
// The help window's knowledge in a big panel by the Ace (web.286: laid out
// like the help window had been before Ace's Help — search on top, the
// chapters in a column on the left with their icon and name, the whole
// chapter on the right, every section in a row; on a phone the chapters are
// an icon strip above the text — in the colours of his bubble). A search
// lists the matching sections; one tap opens its chapter at that section.
// The texts are the help window's own (modules/help/content/<lang>.mjs, 83
// languages). Works with the tips off: he comes, answers, and leaves when
// the panel is closed.
let help = null;              // { content, ch, q, searched }
const uiT = (k) => { try { const s = window.t ? window.t(k) : k; return s && s !== k ? s : k; } catch (e) { return k; } };
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function helpLang() { try { return (localStorage.getItem('pth_lang') || document.documentElement.lang || 'en').toLowerCase(); } catch (e) { return 'en'; } }

/** Opens « More help » (Ace's menu, the Help entries of the menus). Resolves false when he cannot come here. */
async function openMoreHelp(o = {}) {
  if (!canComeHere()) return false;
  exitAsk(true);
  const m = await ensureDock();
  if (!m) return false;
  clearTimers(); hl.clear();
  const content = await loadHelp(helpLang());
  if (!M || !M.isDocked()) return false;
  const w = where();
  help = { content, ch: o.ch || chapterFor(w.screen), q: '', searched: false };
  if (!content.chapters.some((c) => c.id === help.ch) && content.chapters.length) help.ch = content.chapters[0].id;
  showing = { kind: 'help' };
  if (o.ch && o.sec && findSection(content, o.ch, o.sec)) openHelpSection(o.ch, o.sec);
  else renderTopics();
  beacon('more-help', 'shown');
  return !!m;
}

/** One section of a chapter, as the help window showed it. */
function helpSection(sec) {
  const ns = Array.isArray(sec.note) ? sec.note : sec.note ? [sec.note] : [];
  let h = `<section class="ad-hsec" id="ad-sec-${esc(sec.id)}"><h3>${esc(sec.t)}</h3>`;
  h += (sec.b || []).map((x) => `<p>${esc(x)}</p>`).join('');
  if (sec.list && sec.list.length) h += `<ul>${sec.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  if (sec.keys && sec.keys.length) h += `<div class="ad-keys">${sec.keys.map((r) => `<code>${esc(r[0])}</code><span>${esc(r[1])}</span>`).join('')}</div>`;
  h += ns.map((x) => `<p class="ad-note">${esc(x)}</p>`).join('');
  return h + '</section>';
}

/** The right-hand side: search results, or the whole chapter. */
function helpBody() {
  const hits = help.q.trim().length >= 2 ? helpSearch(help.content, help.q) : null;
  if (hits) {
    if (!hits.length) return `<p class="ad-empty">${esc(uiT('helpNoResults'))}</p>`;
    return `<div class="ad-list ad-results" role="list">${hits.map((h) => `<button type="button" class="ad-item" data-ad-btn="sec:${esc(h.ch.id)}:${esc(h.sec.id)}"><small>${esc((h.ch.icon ? h.ch.icon + ' ' : '') + h.ch.title)}</small>${esc(h.sec.t)}</button>`).join('')}</div>`;
  }
  const ch = help.content.chapters.find((c) => c.id === help.ch);
  if (!ch) return '';
  return `<h2 class="ad-hch">${ch.icon ? `<span aria-hidden="true">${esc(ch.icon)}</span> ` : ''}${esc(ch.title)}</h2>`
    + (ch.sections || []).map(helpSection).join('');
}

/** The « More help » panel: search, chapters, and the chapter (or the results). */
function renderTopics() {
  if (!M || !help) return;
  const ch = help.content.chapters.find((c) => c.id === help.ch);
  if (refreshTopics(ch)) return;
  const nav = help.content.chapters.map((c) => {
    const on = c.id === help.ch && !help.q.trim();
    return `<button type="button" class="ad-hcat${on ? ' ad-on' : ''}" data-ad-btn="ch:${esc(c.id)}" role="tab" aria-selected="${on}" title="${esc(c.title)}">`
      + `<span class="ad-hcat-ic" aria-hidden="true">${esc(c.icon || '?')}</span><span class="ad-hcat-lbl">${esc(c.title)}</span></button>`;
  }).join('');
  const html = `<p class="ad-kicker">${esc(gt('moreHelp'))}${ch ? ' · ' + esc((ch.icon ? ch.icon + ' ' : '') + ch.title) : ''}</p>`
    + `<input type="search" class="ad-search" enterkeyhint="search" autocomplete="off" placeholder="${esc(uiT('helpSearchPh'))}" aria-label="${esc(uiT('helpSearchPh'))}" value="${esc(help.q)}">`
    + `<div class="ad-hwrap"><nav class="ad-hnav" role="tablist">${nav}</nav><div class="ad-hbody" tabindex="-1">${helpBody()}</div></div>`;
  M.say({ html, big: true, buttons: [btn('close', true)], ask: gt('askLabel'), onButton: onHelpButton });
  const bub = M.bubbleEl();
  const inp = bub && bub.querySelector('.ad-search');
  if (inp) {
    inp.addEventListener('input', () => {
      help.q = inp.value;
      const body = bub.querySelector('.ad-hbody');
      if (body) { body.innerHTML = helpBody(); body.scrollTop = 0; }
      bub.querySelectorAll('.ad-hcat').forEach((b) => { const on = !help.q.trim() && b.getAttribute('data-ad-btn') === 'ch:' + help.ch; b.classList.toggle('ad-on', on); b.setAttribute('aria-selected', String(on)); });
      if (!help.searched && help.q.trim().length >= 2) { help.searched = true; beacon('more-help', 'search'); }
    });
    inp.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { ev.stopPropagation(); closeMoreHelp(); } });
  }
  const on = bub && bub.querySelector('.ad-hcat.ad-on');
  if (on) { try { on.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {} }
}

/**
 * The panel already open: only its kicker, its tabs and its body change — a
 * new bubble each time closed and reopened it, a flicker (web.311).
 */
function refreshTopics(ch) {
  const bub = M.bubbleOpen && M.bubbleOpen() ? M.bubbleEl() : null;
  const body = bub && bub.querySelector('.ad-hwrap .ad-hbody');
  if (!body) return false;
  const kick = bub.querySelector('.ad-kicker');
  if (kick) kick.textContent = gt('moreHelp') + (ch ? ' · ' + (ch.icon ? ch.icon + ' ' : '') + ch.title : '');
  const inp = bub.querySelector('.ad-search');
  if (inp && inp.value !== help.q) inp.value = help.q;
  bub.querySelectorAll('.ad-hcat').forEach((b) => {
    const on = !help.q.trim() && b.getAttribute('data-ad-btn') === 'ch:' + help.ch;
    b.classList.toggle('ad-on', on); b.setAttribute('aria-selected', String(on));
  });
  body.innerHTML = helpBody();
  body.scrollTop = 0;
  const on = bub.querySelector('.ad-hcat.ad-on');
  if (on) { try { on.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {} }
  return true;
}

/** Opens a chapter at one of its sections (search result, « More about it »). */
function openHelpSection(chId, secId) {
  const f = findSection(help.content, chId, secId);
  if (!f) { renderTopics(); return; }
  help.ch = chId; help.q = '';
  beacon('more-help', 'section');
  renderTopics();
  const bub = M && M.bubbleEl(), body = bub && bub.querySelector('.ad-hbody');
  const el = body && body.querySelector('#ad-sec-' + (window.CSS && CSS.escape ? CSS.escape(secId) : secId));
  if (el) {
    body.scrollTop = Math.max(0, el.offsetTop - 4);
    el.classList.add('ad-hit');
    setTimeout(() => { try { el.classList.remove('ad-hit'); } catch (e) {} }, 1600);
  }
}

function onHelpButton(id) {
  if (!help) { closeBubble(); return; }
  if (id === 'ask') { enterAsk(); return; }
  if (id === 'close' || id === 'escape') { closeMoreHelp(); return; }
  if (id === 'allTopics' || id === 'back') { help.q = ''; renderTopics(); return; }
  if (id.indexOf('ch:') === 0) { help.ch = id.slice(3); help.q = ''; renderTopics(); return; }
  if (id.indexOf('sec:') === 0) { const [, c, s] = id.split(':'); openHelpSection(c, s); }
}

function closeMoreHelp() {
  help = null;
  closeBubble();
  if (!state.isOn() || where().screen === 'game') leave();   // on demand (tips off, the table): he goes
  else schedule();
}

/**
 * A Help entry of the menus: « More help » in the Ace's bubble — the only help
 * since the help window was removed (H4, web.270), on every screen, the live
 * spectator embed included. Returns false when he cannot come here.
 */
function helpEntry(o) {
  if (!canComeHere()) return false;
  openMoreHelp(o || {});
  return true;
}
/** The Help entries of the header menus (they used to open the help window). */
function toggleHelpEntry() {
  if (showing && showing.kind === 'help') { closeMoreHelp(); return; }
  helpEntry();
}

/**
 * A short line over the current bubble (no buttons), then the bubble comes
 * back as it was — « Just one more! » in the waiting room.
 */
function flash(key, ms) {
  if (!M || !M.isDocked() || out) return;
  if (showing && showing.kind !== 'ctx') return;        // never over what the player asked for (« ? », More help, menu) (web.276)
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

/** Tap on the Ace: closes the bubble, or shows a tip put off with « Later », or opens his menu. */
function onTap() {
  if (M && M.bubbleOpen()) {
    if (showing && showing.kind === 'offer') return;
    if (showing && showing.kind === 'ask') { exitAsk(); return; }
    if (showing && showing.kind === 'help') { closeMoreHelp(); return; }
    if (showing && showing.kind === 'ctx') { onCtxButton('later'); return; }
    if (onDemand()) { endOnDemand(); return; }         // his menu, a note: tips off or at the table, he goes (web.276)
    closeBubble(); return;
  }
  // a tip put off with « Later » (red badge) that still applies here: the tap shows it;
  // otherwise his menu (web.271 — the tap used to replay the screen's tip again and again)
  const w = where();
  const waiting = canSpeak(w) ? CONTEXTS.find((c) => !c.manual && snoozed.has(c.id) && applies(c, w)) : null;
  if (waiting) { snoozed.delete(waiting.id); showContext(waiting); return; }
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
  resumeAt.clear();
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

// ── On demand, at the table too (H3, web.269) ──────────────────────
// What the player asks for (« More help », « ? » mode, his menu) is answered
// on every screen where the Ace may stand, the table included — even during
// a hand. He never speaks there by himself (D8). When the player's turn
// comes, the on-demand bubble folds and « ? » mode ends, so nothing stands
// between him and the action buttons; a tap on an action button at his turn
// always acts.
const ON_DEMAND = ['help', 'ask', 'menu', 'note'];
const ACTION_ZONE = '.act-buttons-row, .btn-action, #raise-amt, #raise-slider, .btn-pct, #mode-sel';
function canComeHere() {
  if (!avail) return false;            // on demand: the live spectator embed too (H4); tips stay off there (available())
  const w = where();
  return TALK.indexOf(w.screen) >= 0;
}
const TALK = ['connect', 'lobby', 'wait', 'create', 'game'];
/** It is my turn to act at the table (action buttons shown and enabled). */
function myTurn() {
  const s = S();
  if (s.myId == null || s.turnPid !== s.myId) return false;
  const btns = document.querySelectorAll('.act-buttons-row .btn-action');
  for (const b of btns) if (!b.disabled && b.offsetParent !== null) return true;
  return false;
}
function onDemand() { return !!(showing && ON_DEMAND.indexOf(showing.kind) >= 0); }
/** Folds what the player asked for; at the table (or with the tips off) he leaves. */
function endOnDemand() {
  exitAsk(true);
  help = null;
  closeBubble();
  if (where().screen === 'game' || !state.isOn()) leave();
  else schedule();
}
let turnWas = false;

/** Button « Ace's Help » (login screen, header menus). */
function toggle() {
  if (!available()) return;
  if (!canComeHere()) { if (!state.isOn()) turnOn(); return; }
  showMenu();                                          // his menu on demand, tips on or off, at the table too (H3, web.275)
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
    if (!(w.screen === 'connect' || w.screen === 'lobby') || !splashGone() || blocked() || document.hidden || bannerUp() || showing) { maybeOffer(); return; }
    const m = await ensureDock();
    if (!m || state.isOn() || state.wasOffered()) return;
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
  if (!available()) { if (!(showing && (showing.kind === 'offer' || (onDemand() && canComeHere())))) leave(); return; }   // live embed: only what the player asked for
  if (!state.isOn()) {
    // tips off: only the offer, a last word, or what the player asked for (« More help », « ? » mode)
    // (his menu too, web.276); the offer only on the login screen and in the lobby, never at a table (D8)
    if (!(showing && (showing.kind === 'offer' || onDemand()))) leave();
    else if (showing.kind === 'offer' ? !(w.screen === 'connect' || w.screen === 'lobby') : (showing.kind !== 'note' && !canComeHere())) leave();
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
    // what the player asked for stays, at the table too (H3); he never speaks there by himself (D8)
    if (onDemand() && canComeHere()) return;
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
  if (showing && showing.kind === 'help') return;                                                      // « More help »: the player reads
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
  if (!m) return;
  if (where().screen !== w.screen || !state.isOn()) { schedule(); return; }   // moved on while he came (web.276)
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
  if (!available() || !state.isOn() || asking) return;   // « ? » mode explains the row instead
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
  // my turn comes at the table: what the player asked for folds (H3)
  const turn = myTurn();
  if (turn && !turnWas && onDemand() && where().screen === 'game') endOnDemand();
  turnWas = turn;
  // windows opened / closed (C5): re-evaluate
  if (available() && state.isOn()) {
    const wins = openWindows().join(',');
    if (wins !== lastWins) { lastWins = wins; schedule(); }
  }
  // the outlined element moved (a window that grew once its content arrived):
  // the bubble is placed again, so it does not sit on it (web.289)
  const t = M && M.bubbleOpen() && showing && showing.kind === 'ctx' ? hl.current() : null;
  if (t) {
    const r = t.getBoundingClientRect(), k = Math.round(r.top) + ',' + Math.round(r.left) + ',' + Math.round(r.height);
    if (lastSpot && lastSpot.el === t && lastSpot.k !== k && !scrollTimer) M.replace();
    lastSpot = { el: t, k };
  } else lastSpot = null;
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
// The page changed what a form tour talks about (the game style block opened
// or folded, web.288): the step on screen is shown again.
window._guideRefresh = () => { if (showing && showing.kind === 'ctx' && showing.run && showing.run.ctx.tour && M && M.bubbleOpen()) renderStep({ keepFold: true }); };
window.guideToggle = toggle;
/** « More help » (H1): the Help entries of the menus (modules/help/index.mjs). */
window._guideMoreHelp = helpEntry;
/** The Help entries of the menus (H4: the help window is gone, the Ace answers). */
window.toggleHelp = toggleHelpEntry;
window.guideMoreHelp = (o) => { if (available()) openMoreHelp(o || {}); };
window.guideResetTips = () => { if (available()) resetTips(); };
/** « ? » mode: tap anything to hear what it does (C6). */
window.guideAsk = () => { if (canComeHere()) enterAsk(); };
/** Console: the current situation and saved progress. */
window.guideDebug = () => ({ available: available(), on: state.isOn(), offered: state.wasOffered(), seen: state.seenIds(), snoozed: [...snoozed], where: where(), result, key: KEY_ON });

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}
