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
//  · Decisions: modules/guide/core.mjs (no DOM — portable to QML, D13).
//
// L1 (web.259): foundation only, behind ?guide=1 (remembered in
// localStorage pth_guide_dev; ?guide=0 forgets it). Console: guideDebug().
// ═══════════════════════════════════════════════════════════════════

import { createState, mergeIn, KEY_ON } from './state.mjs';
import { canSpeak, pickContext, replayContext, applies, createRun } from './core.mjs';
import { CONTEXTS } from './contexts/index.mjs';
import { gt, ready } from './i18n.mjs';
import * as hl from './highlight.mjs';

/** L1: hidden behind ?guide=1. L2 turns this on for everyone. */
const PUBLIC = false;
const OFFER_DELAY_MS = 2500;
const EVAL_DEBOUNCE_MS = 350;

let M = null;                 // modules/mascot/guide.mjs once loaded
let wasOn = false;
let evalTimer = 0;
let offerTimer = 0;
let showing = null;           // { run, kind: 'ctx' | 'offer' | 'menu' | 'note' }
const snoozed = new Set();    // contexts put off with « Later » this session

const state = createState(
  (() => { try { return window.localStorage; } catch (e) { return null; } })() || { getItem: () => null, setItem() {} },
  (k) => { try { if (typeof window._cfgSyncMark === 'function') window._cfgSyncMark(String(k).replace(/^pth_/, '')); } catch (e) {} },
);

// ── Availability (L1 gate) ─────────────────────────────────────────
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

function openWindows() {
  try {
    const list = window.keynavOpenSurfaces ? window.keynavOpenSurfaces() : [];
    return (list || []).map((el) => el.id).filter(Boolean);
  } catch (e) { return []; }
}

/** A modal, a menu or a full page is open (floating windows do not count). */
function blocked() {
  try {
    if (!window.keynavHasOpenSurface || !window.keynavHasOpenSurface()) return false;
    const list = window.keynavOpenSurfaces ? window.keynavOpenSurfaces() : null;
    if (!list) return true;
    return list.some((el) => !(el.classList.contains('floating-win') || el.querySelector('.floating-win') || el.id === 'music-panel'));
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

/** The `where` snapshot read by core.mjs. */
export function where() {
  const s = S();
  let screen = 'other';
  if (active('s-game')) screen = 'game';
  else if (active('s-create')) screen = 'create';
  else if (active('s-lobby')) screen = document.getElementById('s-lobby').classList.contains('lobby-waiting') ? 'wait' : 'lobby';
  else if (active('s-connect')) screen = 'connect';
  let ranked = false;
  try { const g = s.games && s.gId ? s.games[s.gId] : null; ranked = !!(g && g.type === 4) || !!(s._gameMeta && s._gameMeta.type === 4 && s.gId); } catch (e) {}
  let guest = false;
  try { guest = !!(window._amMyPlayerGuest && window._amMyPlayerGuest()); } catch (e) {}
  const online = screen !== 'connect' && !window._offlineMode && (typeof navigator === 'undefined' || navigator.onLine !== false);
  return {
    helpOn: state.isOn(),
    screen,
    playing: screen === 'game' && !!s._gameStarted,
    online,
    guest,
    ranked,
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
  await m.dock({ plain: motionOff(), label: gt('aceLabel'), onTap });
  setBusy(true);
  return m;
}

function leave() {
  hl.clear();
  showing = null;
  if (M) M.undock();
  setBusy(false);
}

function btn(id, primary) { return { id, label: gt(id), primary: !!primary }; }

/** Shows one step of a context run. */
function renderStep() {
  const run = showing && showing.run;
  const step = run && run.step();
  if (!step) { closeBubble(); return; }
  const last = run.isLast();
  const buttons = [btn('later')];
  if (!last) buttons.push(btn('next', true));
  else buttons.push(btn('gotIt', true));
  // a context may ask for fewer buttons (e.g. welcome: « Got it » only)
  const own = Array.isArray(step.buttons) ? step.buttons : null;
  const list = own ? own.map((id) => btn(id, id === 'gotIt' || id === 'next')) : buttons;
  const vars = typeof step.vars === 'function' ? step.vars(where()) : step.vars;
  hl.clear();
  let pointed = false;
  if (step.target) pointed = hl.highlight(step.target);
  M.say({ text: gt(step.text, vars), buttons: list, point: pointed, onButton: onCtxButton });
}

function onCtxButton(id) {
  const run = showing && showing.run;
  if (!run) { closeBubble(); return; }
  const cid = run.ctx.id;
  if (id === 'next') { if (run.next()) renderStep(); else finish(cid); return; }
  if (id === 'gotIt') { finish(cid); return; }
  // « Later », Escape: put off for this session, badge on the Ace
  snoozed.add(cid);
  closeBubble();
  if (M) M.badge(true);
}

function finish(cid) {
  state.markSeen(cid);
  snoozed.delete(cid);
  closeBubble();
  schedule();
}

function closeBubble() {
  hl.clear();
  showing = null;
  if (M) M.hush();
}

async function showContext(ctx) {
  await ensureDock();
  showing = { run: createRun(ctx), kind: 'ctx' };
  renderStep();
}

async function note(key, buttons, onButton) {
  const m = await ensureDock();
  hl.clear();
  showing = { kind: 'note' };
  m.say({ text: gt(key), buttons, onButton: onButton || (() => closeBubble()) });
}

async function showMenu() {
  await note('menuOn', [btn('turnOff'), btn('resetTips'), btn('close', true)], (id) => {
    if (id === 'turnOff') { turnOff(); return; }
    if (id === 'resetTips') { resetTips(); return; }
    closeBubble();
  });
  showing.kind = 'menu';
}

/** Tap on the Ace: closes the bubble, or replays the tip of this place, or opens the menu. */
function onTap() {
  if (M && M.bubbleOpen()) { if (showing && showing.kind === 'offer') return; closeBubble(); return; }
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
function maybeOffer() {
  clearTimeout(offerTimer);
  if (!available() || state.isOn() || state.wasOffered()) return;
  offerTimer = setTimeout(async () => {
    if (!available() || state.isOn() || state.wasOffered()) return;
    const w = where();
    if (!(w.screen === 'connect' || w.screen === 'lobby') || !splashGone() || blocked() || document.hidden || bannerUp()) { maybeOffer(); return; }
    const m = await ensureDock();
    showing = { kind: 'offer' };
    m.say({
      text: gt('offer'),
      buttons: [btn('offerNo'), btn('offerYes', true)],
      onButton: (id) => {
        state.markOffered();
        if (id === 'offerYes') { closeBubble(); turnOn(); }
        else leave();
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
  if (!available()) { if (!(showing && showing.kind === 'offer')) leave(); return; }
  if (!state.isOn()) {
    if (!(showing && (showing.kind === 'offer' || showing.kind === 'note'))) leave();
    maybeOffer();
    return;
  }
  const w = where();
  if (!canSpeak(w)) { leave(); return; }                 // silent during a hand (D8)
  if (M && M.bubbleOpen()) {
    // the tip on screen no longer applies (the player moved on): fold it away
    if (showing && showing.kind === 'ctx' && !applies(showing.run.ctx, w)) closeBubble();
    else return;
  }
  const m = await ensureDock();
  m.settle();                                          // the screen changed: a free spot again
  if (blocked()) return;
  const ctx = pickContext(w, CONTEXTS, { seen: state.seen, snoozed: (id) => snoozed.has(id) });
  if (ctx) { showContext(ctx); return; }
  m.badge(CONTEXTS.some((c) => !c.manual && snoozed.has(c.id) && applies(c, w)));
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
  document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
  window.addEventListener('online', schedule);
  window.addEventListener('offline', schedule);
  schedule();
}

window._guideApply = apply;
window.guideToggle = toggle;
window.guideResetTips = () => { if (available()) resetTips(); };
/** Console: the current situation and saved progress. */
window.guideDebug = () => ({ available: available(), on: state.isOn(), offered: state.wasOffered(), seen: state.seenIds(), snoozed: [...snoozed], where: where(), key: KEY_ON });

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}
