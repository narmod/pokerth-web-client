// @ts-check
// ═══════════════════════════════════════════════════════════════════
// The Ace's Bluff — hidden mini-game (web extension, narmod 2026-10-16), in
// the arcade behind the training nickname « mascot ». Reading a player.
//
// Heads-up against the Ace. Each hand both ante; the flop, the turn and the
// river come one by one and the Ace speaks first on each street: he checks,
// bets his good hands (value) or bets anyway — a bluff. Facing a bet: Fold,
// Call or Raise. Facing a check: Check, Bet or All-In — he pays you more
// often if you have been caught bluffing (your image).
//   Tells    he has a tell at every table (TABLE hands) — a drop of sweat, a
//            stare, sunglasses, a fidget, a wave, a grin, a whistle, playing
//            with his chips, a wink, a scratch — shown when he bluffs (most
//            of the time), sometimes when he does not, among other habits.
//   Opponents   a new character at every table, the Ace in a costume: the
//            Ace (honest tells), the Cowboy (bluffs a lot), the Gentleman
//            (rarely, but it shows), the Trapper (his tell means a real hand),
//            the Fool (unreadable), the King (the last table).
//   Notebook    what each tell meant at this table (bluff / real hand), your
//            own ★ guesses, your image; a new page at each table.
//   Modes    Free game (HANDS hands from START chips), Daily challenge (the
//            same deals and tells for everyone today, pth_bl_daily) and
//            Tournament (T_START chips each, the antes go up every table,
//            until one of you is broke; pth_bl_best.tourney).
//   Hourglass  (option, pth_bl_timer) DECIDE_S seconds to answer a bet; a
//            bluff called (or raised off) within QUICK_S: « Quick read », +10.
//   Replay   after a bluff, his tell is shown again, faster.
// Keys: Space Call / Check · ↑ Raise / Bet · ↓ Fold · 1 2 3 the buttons ·
// ←/→ and Enter · 4 the notebook. A tap does the same.
// Secret trophy « Mind Reader »: TROPHY_CAUGHT bluffs caught in one game.
// ═══════════════════════════════════════════════════════════════════

import { rankHand, compareHands, NAME_KEYS } from './poker-hand.mjs';
import { shuffled, rng } from './deal.mjs';
import { dayKey } from './solitaire-rules.mjs';
import { titleScreen } from './title.mjs';
import { hofOn, hofStart, hofEnd, hofPanel } from './hof.mjs';
import { endScreen, stepsHtml } from './end.mjs';
import { fmt, imageCache, rr, drawFace, aceActor, CHIP } from './common.mjs';
import { felt, drawBackCard, bubble, drawFloaters, stepFloaters, keyboardFirst, fitFont } from './ui.mjs';

export const START = 100, ANTE = 5, HANDS = 20, TABLE = 5, BLUFF_P = 0.5, TELL_BLUFF = 0.8, TELL_FALSE = 0.15, TROPHY_CAUGHT = 5;
export const T_START = 200, T_ANTES = [5, 10, 15, 25, 40, 60, 100, 150];
export const DECIDE_S = 8, QUICK_S = 3, QUICK_BONUS = 10;
export const TELLS = ['sweat', 'fierce', 'cool', 'fidget', 'wave', 'grin', 'whistle', 'chips', 'wink', 'scratch'];
const TELL_ICON = { sweat: '💧', fierce: '😠', cool: '😎', fidget: '〰️', wave: '👋', grin: '😁', whistle: '🎵', chips: '🪙', wink: '😉', scratch: '🤚' };
/** The Ace's characters: bluff rate, his tell on a bluff (tb) and on a real hand (tf). */
export const PERSONAS = [
  { id: 'ace', hat: 'none', bluff: 0.5, tb: 0.8, tf: 0.15 },
  { id: 'cowboy', hat: 'cowboy', bluff: 0.75, tb: 0.8, tf: 0.2 },
  { id: 'gent', hat: 'tophat', bluff: 0.25, tb: 0.9, tf: 0.05 },
  { id: 'trap', hat: 'fedora', bluff: 0.45, tb: 0.25, tf: 0.75 },
  { id: 'joker', hat: 'jester', bluff: 0.55, tb: 0.45, tf: 0.45 },
  { id: 'king', hat: 'crown', bluff: 0.45, tb: 0.65, tf: 0.25 },
];
export const MODES = [
  { id: 'free', icon: '🎭', key: 'psFree', desc: 'blModeFreeD' },
  { id: 'daily', icon: '📅', key: 'psDaily', desc: 'blModeDailyD' },
  { id: 'tourney', icon: '🏆', key: 'hlModeTourney', desc: 'blModeTourneyD' },
];
/** How often he bets a winning hand / bluffs a losing one, flop → river. */
export const STREET_VALUE = [0.6, 0.75, 1], STREET_BLUFF = [0.45, 0.7, 1];
const DAILY_KEY = 'pth_bl_daily', BEST_KEY = 'pth_bl_best', TIMER_KEY = 'pth_bl_timer';

/** The Ace's play on the river: 'bet' (value), 'bluff' or 'check'. rnd: the random source. */
export function aceAction(cmp, rnd = Math.random, p = BLUFF_P) {
  if (cmp > 0) return 'bet';
  if (cmp < 0 && rnd() < p) return 'bluff';
  return 'check';
}
/** His play on a street (0 flop, 1 turn, 2 river), knowing who wins at the river. */
export function streetAction(cmp, street, persona, rnd = Math.random) {
  if (cmp > 0) return rnd() < STREET_VALUE[street] ? 'bet' : 'check';
  if (cmp < 0) return rnd() < persona.bluff * STREET_BLUFF[street] ? 'bluff' : 'check';
  return 'check';
}
/** The tell he shows this street (or '' for none), given his table tell. */
export function tellFor(action, tell, rnd = Math.random, tb = TELL_BLUFF, tf = TELL_FALSE) {
  const other = () => { const o = TELLS.filter((x) => x !== tell); return o[Math.floor(rnd() * o.length)]; };
  if (action === 'bluff') return rnd() < tb ? tell : (rnd() < 0.5 ? other() : '');
  if (action === 'bet') return rnd() < tf ? tell : (rnd() < 0.5 ? other() : '');
  return '';
}
/** Your image: how often your bets were bluffs (0 … 1, slow to move). */
export function repOf(bets, bluffs) { return bluffs / Math.max(4, bets); }
/** Does he pay your bet? Always with the better hand; else more often against a bluffer. */
export function callsYou(cmp, rep, rnd = Math.random) { return cmp >= 0 || rnd() < Math.min(0.85, 0.08 + 0.9 * rep); }
/** The ante of hand n (1-based). */
export function anteAt(n, mode) { return mode === 'tourney' ? T_ANTES[Math.min(T_ANTES.length - 1, Math.floor((n - 1) / TABLE))] : ANTE; }
/** The character at table i (0-based): the Ace first, the King last (every 5th in a tournament). */
export function personaAt(i, mode, rnd, prev) {
  if (i === 0) return 0;
  if (mode === 'tourney' ? i % 5 === 4 : i === HANDS / TABLE - 1) return 5;
  let p = 1 + Math.floor(rnd() * 4);
  if (p === prev) p = 1 + (p % 4);
  return p;
}
export const roundBet = (x) => Math.max(5, Math.round(x / 5) * 5);
function loadJ(k) { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } }
function saveJ(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

export function create(shell) {
  const { t, esc, sound } = shell;
  const img = imageCache();
  const ace = aceActor(shell.layer);
  shell.touchPad(false);
  shell.hud.classList.add('on-felt');
  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('blChips')) + '</div><div class="ar-num bl-chips">0</div></div>'
    + '<div><div class="ar-lab">' + esc(t('vpHands')) + '</div><div class="ar-num bl-h">0</div></div>'
    + '<div class="bl-his"><div class="ar-lab bl-hisn"></div><div class="ar-num bl-hisv">0</div></div></div>'
    + '<div class="ar-hand"><button type="button" class="bl-pill">📓 <span>' + esc(t('blNotebook')) + '</span> <b>0</b></button><div class="ar-name bl-caught"></div></div>';
  const hChips = /** @type {HTMLElement} */ (shell.hud.querySelector('.bl-chips'));
  const hH = /** @type {HTMLElement} */ (shell.hud.querySelector('.bl-h'));
  const hCaught = /** @type {HTMLElement} */ (shell.hud.querySelector('.bl-caught'));
  const hHis = /** @type {HTMLElement} */ (shell.hud.querySelector('.bl-his'));
  const hHisN = /** @type {HTMLElement} */ (shell.hud.querySelector('.bl-hisn'));
  const hHisV = /** @type {HTMLElement} */ (shell.hud.querySelector('.bl-hisv'));
  ensureCss();

  // ── The buttons (the web client's) and the notebook, in HTML ──────
  const ui = document.createElement('div');
  ui.className = 'bl-ui';
  shell.layer.appendChild(ui);
  /** @type {HTMLButtonElement[]} */
  const B = [];
  for (let i = 0; i < 3; i++) {
    const b = document.createElement('button');
    b.type = 'button'; b.innerHTML = '<b></b><small></small><i class="bl-k"></i>';
    b.addEventListener('click', (e) => { e.stopPropagation(); if (shell.paused) return; press(i); });
    b.addEventListener('pointerdown', (e) => e.stopPropagation());
    ui.appendChild(b); B.push(b);
  }
  // The notebook's pill, in the HUD (narmod's pick A).
  const bookBtn = /** @type {HTMLElement} */ (shell.hud.querySelector('.bl-pill'));
  const bookN = /** @type {HTMLElement} */ (bookBtn.querySelector('b'));
  bookBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  bookBtn.addEventListener('click', (e) => { e.stopPropagation(); if (!shell.paused) toggleBook(); });
  const book = document.createElement('div');
  book.className = 'bl-book';
  book.addEventListener('animationend', () => book.classList.remove('bl-turn'));
  book.addEventListener('pointerdown', (e) => e.stopPropagation());
  book.addEventListener('click', (e) => {
    e.stopPropagation();
    const r = /** @type {HTMLElement} */ (e.target).closest('[data-t]');
    if (!r || !G) return;
    const k = r.getAttribute('data-t') || '';
    if (G.stars.has(k)) G.stars.delete(k); else G.stars.add(k);
    renderBook();
  });
  ui.appendChild(book);

  let state = 'title', G = null, time = 0, timer = 0, sel = 0, mode = 'free', bookOpen = false, lastL = null;
  /** The title, or the Hall of Fame's boards opened from it. */
  const onTitle = () => state === 'title' || state === 'board';
  let R = Math.random;
  let timerOn = false;
  try { timerOn = localStorage.getItem(TIMER_KEY) === '1'; } catch (e) {}

  function newGame() {
    const tour = mode === 'tourney';
    G = { mode, chips: tour ? T_START : START, his: tour ? T_START : Infinity, hand: 0, table: 0, persona: -1, tell: '', caught: 0, quick: 0,
      board: [], me: [], him: [], rMe: null, rHim: null, cmp: 0, street: 0, pot: 0, bet: 0, action: '', show: '', bluffed: false, streetTells: [],
      book: {}, stars: new Set(), yb: 0, yf: 0, focus: 1, decideAt: 0, quickPending: false, called: false, net: 0, folded: false, heFolded: false, allIn: false,
      fx: [], flights: [], say: null, shake: 0, replay: null, result: null, yayUntil: 0, koUntil: 0, turnUntil: 0, raised: false, myBets: 0 };
    renderHud();
  }
  function renderHud() {
    hChips.textContent = fmt(G.chips);
    hH.textContent = mode === 'tourney' ? String(G.hand) : G.hand + '/' + HANDS;
    hHis.style.display = G.his === Infinity ? 'none' : '';
    if (G.his !== Infinity) { hHisN.textContent = G.persona >= 0 ? pname() : ''; hHisV.textContent = fmt(Math.max(0, G.his)); }
    hCaught.textContent = (G.caught ? '🎭 ' + G.caught : '') + (G.quick ? '  ⚡ ' + G.quick : '');
  }
  const say = (s, life = 2.4) => { G.say = { s, t: 0, life }; };
  const P = () => PERSONAS[Math.max(0, G.persona)];
  const pname = () => t('blP_' + P().id);

  function records() {
    const d = loadJ(DAILY_KEY), b = loadJ(BEST_KEY);
    return { free: shell.best.get(), daily: d.d === dayKey() ? d.s || 0 : 0, tourney: b.tourney || 0 };
  }
  function titlePanel() {
    const rec = records();
    titleScreen(shell, { id: 'bluff', name: t('blName'), hint: t('blHint'), sel,
      modes: MODES.map((m) => ({ icon: m.icon, label: t(m.key), desc: t(m.desc), rec: rec[m.id] ? t('arRecord', { n: fmt(rec[m.id]) }) : '' })),
      options: [{ id: 'timer', label: '⏳ ' + t('blTimer') + ' ' + (timerOn ? '✓' : '✗'), on: timerOn, key: '4' }]
        .concat(hofEnabled ? [{ id: 'hof', label: '🏆 ' + t('hofTitle'), key: '↓' }] : []),
      onPick: (i) => { sel = i; start(); }, onOption: (id) => { if (id === 'hof') openHof(); else toggleTimer(); } });
  }
  // The Hall of Fame (hof.mjs, claude/CONCEPTION_HALL_OF_FAME.md, web.102): the title's 🏆 only while the admin has it on.
  let hofEnabled = false;
  function refreshHof() {
    hofOn('bluff').then((on) => { if (on !== hofEnabled) { hofEnabled = on; if (state === 'title') titlePanel(); } }).catch(() => {});
  }
  function openHof() {
    state = 'board';
    hofPanel(shell, { g: 'bluff', name: t('blName'), sel: sel, modes: MODES.map((m) => ({ id: m.id, label: t(m.key) })),
      onBack: () => { state = 'title'; titlePanel(); refreshHof(); } });
  }

  function toggleTimer() {
    timerOn = !timerOn;
    try { localStorage.setItem(TIMER_KEY, timerOn ? '1' : '0'); } catch (e) {}
    titlePanel();
  }
  newGame();
  titlePanel();
  refreshHof();
  ace.hat('');
  // Browser tests only (navigator.webdriver).
  try {
    if (navigator.webdriver) window.__pthBL = { run: () => G, state: () => state, mode: () => mode,
      start: (m) => { sel = Math.max(0, MODES.findIndex((x) => x.id === m)); start(); }, book: () => bookOpen, L: () => L(), hof: () => openHof(), end: () => finish() };
  } catch (e) {}

  function start() {
    clearTimeout(timer);
    mode = MODES[sel].id;
    R = mode === 'daily' ? rng('bl-' + dayKey()) : Math.random;
    newGame();
    shell.panel(null);
    G.hof = hofStart('bluff', mode); G.hofDay = dayKey();   // the Hall of Fame's ticket (null offline / off)
    ace.pose('idle'); ace.mood('mc-m-smile');
    state = 'deal';
    deal();
  }

  // ── A hand ────────────────────────────────────────────────────────
  const maxBet = () => Math.max(0, Math.min(G.chips, G.his));
  function newTable() {
    const prev = G.persona;
    G.persona = personaAt(G.table, mode, R, prev);
    G.table++;
    const o = TELLS.filter((x) => x !== G.tell);
    G.tell = o[Math.floor(R() * o.length)];
    G.book = {}; G.stars = new Set();
    ace.hat(P().hat);
    G.turnUntil = performance.now() + 700;      // the notebook's page turns
    book.classList.remove('bl-turn'); void book.offsetWidth; book.classList.add('bl-turn');
    renderBook();
  }
  function deal() {
    const ante0 = anteAt(G.hand + 1, mode);
    if (mode === 'tourney' ? G.chips <= 0 || G.his <= 0 : G.hand >= HANDS || G.chips < ANTE) { finish(); return; }
    G.hand++;
    let changed = false;
    if ((G.hand - 1) % TABLE === 0) { newTable(); changed = true; }
    const d = shuffled(R);
    G.board = d.slice(0, 5); G.me = d.slice(5, 7); G.him = d.slice(7, 9);
    G.rMe = rankHand(G.me.concat(G.board)); G.rHim = rankHand(G.him.concat(G.board));
    G.cmp = compareHands(G.rHim, G.rMe);
    const ante = Math.min(ante0, G.chips, G.his);
    G.chips -= ante; G.his -= ante; G.pot = 2 * ante; G.net = -ante;
    G.street = 0; G.bet = 0; G.action = ''; G.show = ''; G.bluffed = false; G.streetTells = []; G.called = false; G.folded = false; G.heFolded = false;
    G.allIn = G.chips <= 0 || G.his <= 0; G.quickPending = false; G.replay = null; G.say = null; G.raised = false;
    const l = L();
    fly(l.meX, l.meY, l.potX, l.potY, ante); fly(l.himX, l.himY, l.potX, l.potY, ante);
    state = 'deal';
    sound('notifyCard');
    renderHud();
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (state !== 'deal') return;
      if (changed) say(pname() + (G.table > 1 ? ' — ' + t('blTells') : ''), 1.9);
      timer = setTimeout(aceTurn, changed ? 1700 : 0);
    }, 650);
  }
  /** He speaks first on each street. */
  function aceTurn() {
    if (state !== 'deal') return;
    if (G.allIn) { nextStreet(); return; }
    let act = streetAction(G.cmp, G.street, P(), R);
    let amt = 0;
    if (act !== 'check') {
      amt = roundBet(G.pot * (0.5 + R() * 0.3));
      if (G.street === 2 && R() < 0.12) amt = maxBet();          // All-In!
      amt = Math.min(amt, maxBet());
      if (amt <= 0) act = 'check';
    }
    G.action = act;
    G.show = act === 'check' ? '' : tellFor(act === 'bluff' ? 'bluff' : 'bet', G.tell, R, P().tb, P().tf);
    if (act === 'check') {
      say('Check.', 1.4); sound('notifyAction');
      state = 'you'; G.focus = 0;
      return;
    }
    if (act === 'bluff') G.bluffed = true;
    G.bet = amt; G.his -= amt; G.pot += amt;
    const l = L(); fly(l.himX, l.himY, l.potX, l.potY, amt);
    const all = amt >= G.chips || G.his <= 0;
    if (all) { say('All-In!', 99); G.shake = 0.5; ace.fx('wobble'); sound('notifyAllIn'); }
    else { say(t('blBets', { n: fmt(amt) }), 99); sound('notifyRaise'); }
    if (G.show) G.streetTells.push({ tell: G.show, bluff: act === 'bluff' });
    state = 'decide'; G.focus = 1; G.decideAt = performance.now();
  }
  /** The buttons of the moment: left to right. */
  function options() {
    if (state === 'decide' || ((state === 'deal' || state === 'wait') && G.bet)) {
      const call = Math.min(G.bet, G.chips), raise = Math.min(G.chips, G.bet * 3, G.bet + G.his);
      return [{ id: 'fold', cls: 'btn-fold', label: 'Fold', sub: '', key: '↓' },
        { id: 'call', cls: 'btn-call', label: 'Call', sub: fmt(call), key: 'Space' },
        { id: 'raise', cls: 'btn-raise', label: 'Raise', sub: fmt(raise), key: '↑', off: raise <= G.bet || G.his <= 0, amt: raise }];
    }
    const m = maxBet(), bet = Math.min(m, roundBet(G.pot * 0.5));
    return [{ id: 'check', cls: 'btn-call', label: 'Check', sub: '', key: 'Space' },
      { id: 'bet', cls: 'btn-raise', label: 'Bet', sub: fmt(bet), key: '↑', off: m <= 0, amt: bet },
      { id: 'allin', cls: 'btn-allin', label: 'All-In', sub: fmt(m), key: '4', off: m <= 0, amt: m }];
  }
  function press(i) {
    if (state !== 'decide' && state !== 'you') return;
    const o = options()[i];
    if (!o || o.off) return;
    G.say = null;
    if (o.id === 'fold') { G.folded = true; sound('notifyFold'); endHand('fold'); }
    else if (o.id === 'call') {
      const c = Math.min(G.bet, G.chips);
      G.chips -= c; G.pot += c; G.net -= c; G.called = true;
      const l = L(); fly(l.meX, l.meY, l.potX, l.potY, c);
      if (timerOn && G.action === 'bluff' && (performance.now() - G.decideAt) / 1000 <= QUICK_S) G.quickPending = true;
      sound('notifyAction');
      if (G.chips <= 0 || G.his <= 0) G.allIn = true;
      renderHud();
      nextStreet();
    } else if (o.id === 'check') { sound('notifyAction'); nextStreet(); }
    else {
      // You bet or raise: he answers.
      const amt = o.amt || 0, extra = o.id === 'raise' ? amt - G.bet : amt;
      G.chips -= amt; G.pot += amt; G.net -= amt; G.yb++; if (G.cmp > 0) G.yf++;
      G.raised = o.id === 'raise';
      const quick = timerOn && o.id === 'raise' && G.action === 'bluff' && (performance.now() - G.decideAt) / 1000 <= QUICK_S;
      const l = L(); fly(l.meX, l.meY, l.potX, l.potY, amt);
      sound(o.id === 'allin' || G.chips <= 0 ? 'notifyAllIn' : 'notifyRaise');
      if (G.chips <= 0) { G.shake = 0.4; }
      state = 'wait';
      renderHud(); renderBook();
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (state !== 'wait') return;
        // A bluff of his facing a raise: he lets it go (mostly). A bet into his check: as your image says.
        const pays = o.id === 'raise' ? (G.action === 'bluff' ? R() < 0.15 : true) : callsYou(G.cmp, repOf(G.yb, G.yf), R);
        if (!pays) {
          say('Fold.', 1.6); sound('notifyFold'); ace.fx('shiver');
          if (quick) G.quickPending = true;
          G.heFolded = true; endHand('hefold'); return;
        }
        const c = Math.min(extra, G.his);
        G.his -= c; G.pot += c;
        if (extra > c) { G.chips += extra - c; G.pot -= extra - c; G.net += extra - c; }
        fly(l.himX, l.himY, l.potX, l.potY, c);
        say('Call.', 1.4); sound('notifyAction');
        if (G.chips <= 0 || G.his <= 0) G.allIn = true;
        renderHud();
        nextStreet();
      }, 900);
    }
  }
  function nextStreet() {
    G.bet = 0; G.action = ''; G.show = '';
    if (G.street >= 2) { showdown(); return; }
    G.street++;
    state = 'deal';
    clearTimeout(timer);
    timer = setTimeout(() => { sound('notifyCard'); timer = setTimeout(aceTurn, G.allIn ? 500 : 650); }, G.allIn ? 450 : 350);
  }
  function showdown() { state = 'deal'; clearTimeout(timer); timer = setTimeout(() => endHand('show'), 500); }

  function endHand(kind) {
    clearTimeout(timer);
    state = 'shown';
    const l = L(), now = performance.now();
    let c = 0;
    if (kind === 'fold') {
      if (G.his !== Infinity) G.his += G.pot;
      if (G.bluffed) { G.fx.push({ s: t('blBluff'), x: l.himX, y: l.himY - 8, t: 0, life: 1.7, red: true, big: true }); G.yayUntil = now + 1200; }
      G.fx.push({ s: '−' + fmt(-G.net), x: l.meX + l.mcw + 30, y: l.meY, t: 0, life: 1.2, red: true });
    } else {
      c = kind === 'hefold' ? 1 : compareHands(G.rMe, G.rHim);
      if (c > 0) { G.chips += G.pot; G.net += G.pot; }
      else if (c === 0) { G.chips += G.pot / 2; G.net += G.pot / 2; if (G.his !== Infinity) G.his += G.pot / 2; }
      else if (G.his !== Infinity) G.his += G.pot;
      G.chips = Math.round(G.chips); if (G.his !== Infinity) G.his = Math.round(G.his);
      const read = c > 0 && G.bluffed && (G.called || (kind === 'hefold' && G.raised));
      if (read) {
        G.caught++;
        G.fx.push({ s: t('blBluff'), x: l.himX, y: l.himY - 8, t: 0, life: 1.7, gold: true, big: true });
        sound('notifyBigWin'); G.koUntil = now + 1300; ace.look('mc-m-dizzy', 1200, 0);
        if (G.caught === TROPHY_CAUGHT) shell.grant('bluff');
        if (G.quickPending) {
          G.quick++; G.chips += QUICK_BONUS;
          G.fx.push({ s: '⚡ ' + t('blQuick') + ' +' + QUICK_BONUS, x: l.himX, y: l.himY + 22, t: 0, life: 1.8, gold: true });
        }
      } else sound(G.net > 0 ? 'notifyRaise' : G.net < 0 ? 'notifyFold' : 'notifyAction');
      if (G.net > 0) { G.fx.push({ s: '+' + fmt(G.net), x: l.meX + l.mcw + 30, y: l.meY, t: 0, life: 1.3, gold: true }); if (!read) G.koUntil = now + 1000; }
      else if (G.net < 0) { G.fx.push({ s: '−' + fmt(-G.net), x: l.meX + l.mcw + 30, y: l.meY, t: 0, life: 1.3, red: true }); G.yayUntil = now + 1100; }
      if (c > 0) fly(l.potX, l.potY, l.meX, l.meY, G.pot);
    }
    if (c <= 0 && kind !== 'hefold') fly(l.potX, l.potY, l.himX, l.himY, G.pot);
    (G.log || (G.log = [])).push({ net: G.net, read: kind !== 'fold' && c > 0 && G.bluffed && (G.called || (kind === 'hefold' && G.raised)) });   // the end screen's hands
    // The notebook: what each tell of this hand meant.
    for (const st of G.streetTells) { const e = G.book[st.tell] || (G.book[st.tell] = { b: 0, v: 0 }); if (st.bluff) e.b++; else e.v++; }
    // The replay: his bluff's tell, again and faster.
    const bt = G.streetTells.find((x) => x.bluff);
    if (G.bluffed && bt) G.replay = { tell: bt.tell, until: now + 2600 };
    renderHud(); renderBook();
    timer = setTimeout(goOn, G.replay ? 4200 : 3300);
  }
  function goOn() {
    if (state !== 'shown') return;
    clearTimeout(timer);
    G.say = null; G.replay = null;
    deal();
  }
  function finish() {
    clearTimeout(timer);
    state = 'over';
    shell.ended();
    const tour = mode === 'tourney', won = tour && G.his <= 0 && G.chips > 0;
    const score = tour ? G.hand * 10 + (won ? G.chips : 0) : G.chips;
    let prev = 0;
    if (mode === 'free') { prev = shell.best.get(); if (score > prev) shell.best.set(score); }
    else if (mode === 'daily') { const d = loadJ(DAILY_KEY), day = dayKey(); prev = d.d === day ? d.s || 0 : 0; if (score > prev) saveJ(DAILY_KEY, { d: day, s: score }); }
    else { const b = loadJ(BEST_KEY); prev = b.tourney || 0; if (score > prev) { b.tourney = score; saveJ(BEST_KEY, b); } }
    try { localStorage.setItem('pth_game_played_bluff', '1'); } catch (e) {}
    const record = score > prev;
    if (record && prev) sound('notifyBigWin');
    ace.hat(''); ace.mood(won || !tour ? 'mc-m-smile' : 'mc-m-yay'); ace.pose(tour && !won ? 'wave' : 'idle');
    G.result = { score, record, prev, won };
    bookOpen = false;
    renderResult();
  }
  /** The end screen (end.mjs, web.67): the chips, the bluffs read, hand after hand. */
  function renderResult() {
    if (state !== 'over' || !G.result || G.result.shown) return;
    G.result.shown = true;
    const { score, prev, won } = G.result, log = G.log || [], m = MODES.find((x) => x.id === mode);
    endScreen(shell, {
      title: t('blName'), sub: t(m.key) + (mode === 'tourney' ? ' · ' + t(won ? 'blWin' : 'blLose') : ''),
      score, prev,
      calc: [[t('blChips'), fmt(G.chips)], ['🎭', fmt(G.caught)], G.quick ? ['⚡', fmt(G.quick)] : null],
      levels: log.length ? { title: t('hlColHands'), right: fmt(log.length) + (mode === 'tourney' ? '' : ' / ' + HANDS), html: stepsHtml(esc, log.slice(-20).map((h) => ({ label: h.read ? '🎭' : '', cls: h.net > 0 ? 'ok' : h.net < 0 ? 'hard' : '' }))) } : null,
      stats: [[fmt(G.caught), '🎭 ' + t('blBluff').replace(/[!！¡]/g, '')], [fmt(G.quick), '⚡'], [fmt(log.length), t('hlColHands')]],
      onAgain: () => start(),
      onMenu: () => { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); renderBook(); titlePanel(); refreshHof(); },
    });
    hofEnd(shell, { g: 'bluff', m: mode, s: score, run: G.hof, day: G.hofDay, daily: mode === 'daily' });
  }


  // ── Chips on the move ─────────────────────────────────────────────
  function fly(x0, y0, x1, y1, n) {
    if (!n || shell.reduced) return;
    const k = Math.min(6, 1 + Math.floor(n / 10));
    for (let i = 0; i < k; i++) G.flights.push({ x0: x0 + (Math.random() - 0.5) * 10, y0, x1: x1 + (Math.random() - 0.5) * 14, y1, t: -i * 0.05, d: 0.42, c: i % 4 });
  }

  // ── Notebook ──────────────────────────────────────────────────────
  function toggleBook() { bookOpen = !bookOpen; renderBook(); }
  function renderBook() {
    if (!G || onTitle() || state === 'over') { book.style.display = 'none'; bookBtn.style.display = 'none'; return; }
    const l = lastL || L(), k = shell.k || 1;
    const pinned = l.wide;
    bookBtn.style.display = pinned ? 'none' : '';
    bookN.textContent = String(Object.keys(G.book).length);
    bookBtn.classList.toggle('on', bookOpen);
    if (!pinned && !bookOpen) { book.style.display = 'none'; return; }
    book.style.display = '';
    const bx = pinned ? l.bookX : 8, by = pinned ? l.top + 6 : l.top + 30, bw = pinned ? l.bookW : l.W - 16;
    const bh = l.btnY - l.btnH / 2 - 10 - by;
    book.style.left = (bx * k) + 'px'; book.style.top = (by * k) + 'px'; book.style.width = (bw * k) + 'px'; book.style.height = (bh * k) + 'px';
    book.style.fontSize = (Math.min(11, Math.max(8.5, bw / 17)) * k) + 'px';
    const rows = Object.keys(G.book).map((tl) => {
      const e = G.book[tl];
      return '<button type="button" class="bl-row' + (G.stars.has(tl) ? ' star' : '') + '" data-t="' + tl + '"><i>' + TELL_ICON[tl] + '</i><span>' + esc(t('blT_' + tl))
        + '</span><b title="bluff">🎭 ' + e.b + '</b><b>💪 ' + e.v + '</b><em>★</em></button>';
    }).join('');
    const rep = repOf(G.yb, G.yf);
    book.innerHTML = '<div class="bl-bh">📓 ' + esc(t('blNotebook')) + '<small>' + esc(t('evMcTable', { n: G.table }) + ' · ' + pname()) + '</small></div>'
      + '<div class="bl-rows">' + (rows || '<p class="bl-empty">—</p>') + '</div>'
      + '<div class="bl-rep">' + esc(t(rep >= 0.34 ? 'blRepLoose' : 'blRepTight')) + '<span><i style="width:' + Math.round(Math.min(1, rep / 0.6) * 100) + '%"></i></span></div>';
  }

  // ── Layout (world px) ─────────────────────────────────────────────
  function L() {
    const W = shell.W, H = shell.H;
    let top = 46;
    try { top = Math.max(40, shell.hud.offsetHeight / (shell.k || 1) + 4); } catch (e) {}
    // narmod's pick (web.54): the Ace small on the left with his cards beside
    // him, the community cards 3 + 1 + 1 like the table (QML: spacing 3, a gap
    // after the flop and the turn), smaller cards.
    const wide = W >= 480, narrow = W < 430, gap = 3, grp = narrow ? 7 : 9;
    const btnH = narrow ? 38 : 34, btnY = H - btnH / 2 - 8;
    const colW = wide ? Math.min(330, W * 0.46) : W;
    const cx = wide ? W * 0.47 : W / 2;
    const cw = Math.min(narrow ? 28 : 44, (colW - 16 - 4 * gap - 2 * grp) / 5), ch = cw * 1.4;
    const mcw = narrow ? 34 : 44, mch = mcw * 1.4;
    const hcw = narrow ? 22 : 30, hch = hcw * 1.4;
    let aceX, aceFeet, s, himX, himY, boardY, meY, bookX = 0, bookW = 0;
    if (wide) {
      meY = btnY - btnH / 2 - 28 - mch / 2;
      boardY = meY - mch / 2 - 22 - ch / 2;
      aceFeet = boardY + ch / 2 + 4;
      s = Math.max(0.26, Math.min(0.4, (aceFeet - top - 30) / 212));
      aceX = Math.max(70 * s, (cx - colW / 2) / 2 + 4);
      himX = cx; himY = boardY - ch / 2 - 12 - hch / 2;
      bookX = cx + colW / 2 + 14; bookW = W - bookX - 8;
    } else {
      s = narrow ? 0.26 : 0.32;
      aceFeet = top + 44 + 212 * s;
      aceX = 10 + 84 * s;
      himX = aceX + 70 * s + 10 + hcw + 2; himY = aceFeet - hch / 2 - 2;
      // The table centred between the Ace and the buttons.
      const z0 = aceFeet + 10, z1 = btnY - btnH / 2 - 8, block = ch + 24 + mch + 16;
      boardY = z0 + Math.max(0, (z1 - z0 - block) / 2) + ch / 2;
      meY = boardY + ch / 2 + 24 + mch / 2;
    }
    const span = 5 * cw + 4 * gap + 2 * grp;
    /** Centre x of community card i (3 + 1 + 1). */
    const bx = (i) => cx - span / 2 + cw / 2 + i * (cw + gap) + (i >= 3 ? grp : 0) + (i >= 4 ? grp : 0);
    const bw = Math.min(120, (colW - 16 - 12) / 3);
    return { bx, W, H, wide, narrow, top, gap, cw, ch, hcw, hch, mcw, mch, s, aceX, aceFeet, himX, himY, boardY, cx, colW,
      meX: cx, meY, potX: cx, potY: boardY + ch / 2 + 11, btnY, btnH, bw, bookX, bookW };
  }
  const cache = ['', '', ''];
  function layoutButtons(l) {
    const k = shell.k || 1;
    const show = state === 'decide' || state === 'you' || state === 'deal' || state === 'wait';
    const opts = show && G.board.length ? options() : [];
    const kb = keyboardFirst();
    for (let i = 0; i < 3; i++) {
      const o = opts[i], b = B[i];
      const live = state === 'decide' || state === 'you';
      const x = l.cx + (i - 1) * (l.bw + 6);
      const key = o ? [o.id, o.label, o.sub, x, l.btnY, l.bw, l.btnH, k, !!o.off || !live, kb, G.focus === i && kb && live].join('|') : 'hidden';
      if (cache[i] === key) continue;
      cache[i] = key;
      if (!o) { b.style.display = 'none'; continue; }
      const st = b.style;
      st.display = ''; st.left = ((x - l.bw / 2) * k) + 'px'; st.top = ((l.btnY - l.btnH / 2) * k) + 'px';
      st.width = (l.bw * k) + 'px'; st.height = (l.btnH * k) + 'px'; st.fontSize = ((l.narrow ? 12 : 13) * k) + 'px';
      b.className = 'btn-action ' + o.cls + (G.focus === i && kb && live ? ' bl-focus' : '');
      /** @type {HTMLElement} */ (b.children[0]).textContent = o.label;
      /** @type {HTMLElement} */ (b.children[1]).textContent = o.sub;
      /** @type {HTMLElement} */ (b.children[1]).style.display = o.sub ? '' : 'none';
      /** @type {HTMLElement} */ (b.children[2]).textContent = kb ? o.key : '';
      b.disabled = !!o.off || !live;
    }
  }

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'board') return;                 // the Hall of Fame's boards: their own buttons
    if (state === 'title' && a === 'duck' && hofEnabled) { openHof(); return; }   // ↓: the Hall of Fame when it is on, else the next tile
    if (state === 'title') {
      const step = a === 'left' ? -1 : a === 'right' || a === 'duck' ? 1 : 0;
      if (step) { sel = (sel + step + MODES.length) % MODES.length; titlePanel(); return; }
      if (a === 'n4') { toggleTimer(); return; }
      if (a === 'jump') start();
      return;
    }
    if (state === 'over') { if (a === 'jump') start(); return; }
    if (a === 'n4' && state !== 'decide' && state !== 'you') { toggleBook(); return; }
    if (state === 'shown') { if (a === 'jump') goOn(); return; }
    if (state !== 'decide' && state !== 'you') return;
    if (info.x != null) return;                 // the buttons are HTML
    const n = state === 'decide' ? ['fold', 'call', 'raise'] : ['check', 'bet', 'allin'];
    if (a === 'n1') press(0); else if (a === 'n2') press(1); else if (a === 'n3') press(2);
    else if (a === 'n4') { if (state === 'you') press(2); else toggleBook(); }
    else if (a === 'duck') { if (state === 'decide') press(0); }
    else if (a === 'left') G.focus = (G.focus + 2) % 3;
    else if (a === 'right') G.focus = (G.focus + 1) % 3;
    else if (a === 'jump') {
      if (info.code === 'Space') press(n.indexOf(state === 'decide' ? 'call' : 'check'));
      else if (info.code === 'ArrowUp' || info.code === 'KeyW' || info.pad === 'up') press(n.indexOf(state === 'decide' ? 'raise' : 'bet'));
      else press(G.focus);
    }
  }

  function update(dt) {
    time += dt;
    if (!G) return;
    stepFloaters(G.fx, dt);
    for (let i = G.flights.length - 1; i >= 0; i--) { G.flights[i].t += dt; if (G.flights[i].t > G.flights[i].d) G.flights.splice(i, 1); }
    if (G.say) { G.say.t += dt; if (G.say.t > G.say.life) G.say = null; }
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt);
    // The hourglass: no answer in time is a fold.
    if (state === 'decide' && timerOn && (performance.now() - G.decideAt) / 1000 > DECIDE_S) press(0);
    if (onTitle() || state === 'over') return;
    const now = performance.now();
    // His face: the tell while he waits for your answer (or in the replay), else his mood.
    const tl = activeTell();
    let mood = tl === 'fierce' ? 'mc-m-fierce' : tl === 'cool' ? 'mc-m-cool' : tl === 'grin' ? 'mc-m-grin' : tl === 'wink' ? 'mc-m-wink' : 'mc-m-smile';
    let pose = tl === 'fidget' ? 'balance' : tl === 'wave' ? 'wave' : 'idle';
    if (tl === 'fidget' && Math.floor(time * 2.5) !== Math.floor((time - dt) * 2.5)) ace.fx('hop');
    if (tl === 'scratch' && Math.floor(time * 1.4) !== Math.floor((time - dt) * 1.4)) ace.fx('shiver');
    if (state === 'shown' && !tl) {
      if (now < G.koUntil) mood = 'mc-m-ko';
      else if (now < G.yayUntil) { mood = 'mc-m-yay'; pose = 'wave'; }
    }
    if (state === 'wait') mood = 'mc-m-jump';
    ace.mood(mood); ace.pose(pose);
  }
  function activeTell() {
    if (state === 'decide') return G.show;
    if (state === 'shown' && G.replay && performance.now() < G.replay.until) return G.replay.tell;
    return '';
  }

  // ── Drawing ───────────────────────────────────────────────────────
  function card(g, n, x, y, w, h, lit, dim) {
    g.save(); g.translate(x, y); drawFace(g, img, n, w, h);
    if (lit) { rr(g, -w / 2 - 2.5, -h / 2 - 2.5, w + 5, h + 5, 5); g.strokeStyle = '#f5d77a'; g.lineWidth = 2; g.stroke(); }
    if (dim) { rr(g, -w / 2, -h / 2, w, h, Math.max(2, w * 0.1)); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill(); }
    g.restore();
  }
  function chip(g, x, y, c, r) {
    const C = CHIP[c % 4];
    g.fillStyle = C[0]; g.beginPath(); g.ellipse(x, y, r, r * 0.42, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = C[1]; g.lineWidth = 1; g.setLineDash([2, 2]); g.beginPath(); g.ellipse(x, y, r * 0.7, r * 0.28, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  }
  function drawPot(g, l) {
    const n = Math.min(4, Math.ceil(G.pot / 25));
    for (let s = 0; s < n; s++) {
      const h = Math.min(4, 1 + Math.floor((G.pot / 20) / (s + 1)));
      const x = l.potX - 34 - s * 11;
      for (let i = 0; i < h; i++) chip(g, x, l.potY + 2 - i * 2.2, s + i, 5);
    }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 13px Inconsolata, monospace'; g.fillStyle = '#f5d77a';
    g.fillText('◉ ' + fmt(G.pot), l.potX, l.potY);
    const st = ['Flop', 'Turn', 'River'][G.street];
    g.font = '600 9px Inter, system-ui, sans-serif'; g.fillStyle = 'rgba(245,240,227,.55)';
    g.fillText(st.toUpperCase(), l.potX + 42, l.potY);
  }
  /** The tells drawn on the stage (the faces and poses are the actor's). */
  function drawTell(g, l, tl, fast) {
    const s = l.s, x = l.aceX, feet = l.aceFeet, sp = fast ? 2 : 1;
    if (tl === 'sweat') {
      for (let i = 0; i < 2; i++) {
        const y = feet - 175 * s + ((time * 40 * sp + i * 26) % 52) * s;
        const dx = x + (44 - i * 82) * s, r = 9 * s;
        g.save(); g.globalAlpha = 0.9; g.fillStyle = '#7fc8ff';
        g.beginPath(); g.moveTo(dx, y - r * 1.6); g.quadraticCurveTo(dx + r, y, dx, y + r * 0.6); g.quadraticCurveTo(dx - r, y, dx, y - r * 1.6); g.fill();
        g.restore();
      }
    } else if (tl === 'whistle') {
      g.save(); g.fillStyle = '#f5f0e3'; g.textAlign = 'center';
      for (let i = 0; i < 3; i++) {
        const p = (time * 0.9 * sp + i / 3) % 1;
        g.globalAlpha = 1 - p; g.font = '700 ' + Math.round(26 * s) + 'px system-ui';
        g.fillText(i % 2 ? '♫' : '♪', x + (40 + p * 50) * s, feet - (110 + p * 90) * s);
      }
      g.restore();
    } else if (tl === 'chips') {
      const cx = l.himX + l.hcw + 16, cy = l.himY + l.hch / 2 - 2;
      for (let i = 0; i < 5; i++) chip(g, cx, cy - i * 2.4, i, 6);
      const p = (time * 3 * sp) % 1;
      chip(g, cx + Math.sin(p * Math.PI) * 4, cy - 14 - Math.sin(p * Math.PI) * 12, 3, 6);
    } else if (tl === 'scratch') {
      const a = 0.5 + 0.5 * Math.sin(time * 14 * sp);
      g.save(); g.strokeStyle = 'rgba(245,240,227,' + a.toFixed(2) + ')'; g.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x - 58 * s, feet - (178 - i * 10) * s, (10 + i * 5) * s, -0.9, -0.1); g.stroke(); }
      g.restore();
    }
  }
  function draw(g) {
    const l = L(), W = l.W, H = l.H;
    lastL = l;
    const sh = G && G.shake > 0 && !shell.reduced ? Math.sin(time * 70) * 3 * (G.shake / 0.5) : 0;
    g.save(); g.translate(sh, 0);
    felt(g, W, H, shell.theme.light);
    if (onTitle() || state === 'over') ace.place(W / 2, l.top + 64, 0.28, shell.k);
    else ace.place(l.aceX + sh, l.aceFeet, l.s, shell.k);
    if (!onTitle() && state !== 'over' && G.board.length) {
      const shown = state === 'shown' && !G.folded && !G.heFolded, cmp = shown ? compareHands(G.rMe, G.rHim) : 0;
      const lit = new Set(shown ? (cmp >= 0 ? G.rMe.best : []).concat(cmp <= 0 ? G.rHim.best : []) : []);
      const openHim = state === 'shown';
      // The table and its character.
      g.textBaseline = 'middle'; g.fillStyle = 'rgba(245,240,227,.8)';
      const tag = t('evMcTable', { n: G.table }) + ' · ' + pname();
      if (l.wide) { g.textAlign = 'center'; fitFont(g, tag, l.cx - l.colW / 2 - 12, 11, 700); g.fillText(tag, l.aceX, l.aceFeet + 12); }
      else { g.textAlign = 'left'; fitFont(g, tag, W - 50, 10, 700); g.fillText(tag, 8, l.top + 13); }
      // His two cards, his stack in a tournament.
      for (let k = 0; k < 2; k++) {
        const x = l.himX + (k - 0.5) * (l.hcw + 4);
        if (openHim) card(g, G.him[k], x, l.himY, l.hcw, l.hch, shown && lit.has(G.him[k]), shown && !lit.has(G.him[k]));
        else drawBackCard(g, img, x, l.himY, l.hcw, l.hch);
      }
      if (openHim) {
        const label = G.heFolded ? 'Fold' : t(NAME_KEYS[G.rHim.cat]);
        g.fillStyle = shown && cmp < 0 ? '#f5d77a' : 'rgba(245,240,227,.75)';
        if (l.narrow) { g.textAlign = 'center'; g.textBaseline = 'top'; fitFont(g, label, l.narrow ? W / 2 - 10 : l.colW, 11, 700); g.fillText(label, l.himX, l.himY + l.hch / 2 + 3); }
        else { const lx = l.himX + l.hcw + 8; g.textAlign = 'left'; g.textBaseline = 'middle'; fitFont(g, label, W - lx - 6, 12, 700); g.fillText(label, lx, l.himY); }
      }
      // The board: three cards on the flop, four on the turn, five on the river.
      const nb = state === 'shown' ? 5 : 3 + G.street;
      for (let i = 0; i < 5; i++) {
        const x = l.bx(i);
        if (i < nb) card(g, G.board[i], x, l.boardY, l.cw, l.ch, shown && lit.has(G.board[i]), shown && !lit.has(G.board[i]));
        else { rr(g, x - l.cw / 2, l.boardY - l.ch / 2, l.cw, l.ch, Math.max(2, l.cw * 0.1)); g.fillStyle = 'rgba(0,0,0,.16)'; g.fill(); g.strokeStyle = 'rgba(245,240,227,.16)'; g.lineWidth = 1; g.stroke(); }
      }
      drawPot(g, l);
      // Your two cards and what they make so far.
      for (let k = 0; k < 2; k++) card(g, G.me[k], l.meX + (k - 0.5) * (l.mcw + 5), l.meY, l.mcw, l.mch, shown && lit.has(G.me[k]), shown && !lit.has(G.me[k]));
      const mine = state === 'shown' ? G.rMe : rankHand(G.me.concat(G.board.slice(0, nb)));
      const myName = t(NAME_KEYS[mine.cat]);
      g.fillStyle = shown && cmp > 0 ? '#f5d77a' : 'rgba(245,240,227,.8)'; g.textAlign = 'center'; g.textBaseline = 'top';
      fitFont(g, myName, l.colW - 20, 11, 700); g.fillText(myName, l.meX, l.meY + l.mch / 2 + 4);
      // The tell (and its replay).
      const tl = activeTell();
      if (tl) drawTell(g, l, tl, state === 'shown');
      if (state === 'shown' && G.replay && performance.now() < G.replay.until) {
        const s = '⏪ ' + t('blReplay') + ' : ' + TELL_ICON[G.replay.tell] + ' ' + t('blT_' + G.replay.tell);
        g.textAlign = 'center'; g.textBaseline = 'middle';
        const fs = fitFont(g, s, l.wide ? (l.cx - l.colW / 2) - 10 : W - 16, 11, 700);
        const tw = g.measureText(s).width + 16, bx = l.wide ? l.aceX : W / 2, by = l.wide ? l.aceFeet + 28 : l.top + 30;
        rr(g, bx - tw / 2, by - fs, tw, fs * 2, 8); g.fillStyle = 'rgba(0,0,0,.55)'; g.fill();
        g.fillStyle = '#f5d77a'; g.fillText(s, bx, by);
      }
      // The hourglass.
      if (state === 'decide' && timerOn) {
        const left = Math.max(0, 1 - (performance.now() - G.decideAt) / 1000 / DECIDE_S), bw = l.bw * 3 + 12;
        rr(g, l.cx - bw / 2, l.btnY - l.btnH / 2 - 7, bw, 3, 1.5); g.fillStyle = 'rgba(0,0,0,.3)'; g.fill();
        rr(g, l.cx - bw / 2, l.btnY - l.btnH / 2 - 7, bw * left, 3, 1.5); g.fillStyle = left < 0.3 ? '#ff8a80' : '#f5d77a'; g.fill();
      }
      // Chips on their way to the pot (or back).
      for (const f of G.flights) {
        if (f.t < 0) continue;
        const p = Math.min(1, f.t / f.d), e = p * (2 - p);
        chip(g, f.x0 + (f.x1 - f.x0) * e, f.y0 + (f.y1 - f.y0) * e - Math.sin(p * Math.PI) * 16, f.c, 5);
      }
    }
    g.restore();
    layoutButtons(l);
    if (G && G.say && !onTitle() && state !== 'over') {
      const a = G.say.t < 0.2 ? G.say.t / 0.2 : G.say.t > G.say.life - 0.4 ? Math.max(0, (G.say.life - G.say.t) / 0.4) : 1;
      bubble(g, G.say.s, l.himX, l.himY - l.hch / 2 - 4, W, a);
    }
    if (G) drawFloaters(g, G.fx);
  }

  return {
    update, draw, input,
    resize() { lastL = null; cache.fill(''); renderResult(); renderBook(); },
    calm: true,          // painted only when its drawing changes (calm.mjs, web.110)
    running: () => !onTitle() && state !== 'over',
    destroy() { clearTimeout(timer); ace.remove(); ui.remove(); },
  };
}

function ensureCss() {
  if (document.getElementById('pth-game-bl-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-bl-css';
  st.textContent = '#pth-game .bl-box{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 18px;border-radius:12px;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .bl-box h2{color:#f5d77a}'
    + '#pth-game.pg-light .bl-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .bl-box h2{color:#8a6510}#pth-game.pg-light .bl-box .ar-final{color:#1d222b}'
    // The buttons: the table's, positioned over the felt.
    + '#pth-game .bl-ui{position:absolute;inset:0;pointer-events:none;z-index:400}'
    + '#pth-game .bl-his .ar-lab{max-width:7em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '#pth-game .bl-ui button{position:absolute;pointer-events:auto;box-sizing:border-box;margin:0;display:flex;flex-direction:column;align-items:center;'
    + 'justify-content:center;gap:.12em;line-height:1.05;white-space:nowrap;overflow:hidden;min-height:0;min-width:0;cursor:pointer;-webkit-tap-highlight-color:transparent}'
    + '#pth-game .bl-ui .btn-action{padding:0 .4em;letter-spacing:.03em}'
    + ':root[data-btn-img] #pth-game .bl-ui .btn-action{padding:0 2px !important;border-width:6px;border-image-width:6px}'
    + '#pth-game .bl-ui button b{font-weight:800}#pth-game .bl-ui button small{font:700 .8em/1 Inconsolata,monospace}'
    + '#pth-game .bl-ui .bl-k{position:absolute;right:.45em;top:.3em;font:600 .55em/1 Inconsolata,monospace;font-style:normal;opacity:.6}'
    + '#pth-game .bl-ui button:disabled{opacity:.45;cursor:default}#pth-game .bl-ui button:active:not(:disabled){transform:scale(.97)}'
    + '#pth-game .bl-ui .bl-focus{outline:2px solid #fff;outline-offset:2px}'
    + '#pth-game .bl-pill{pointer-events:auto;display:inline-flex;align-items:center;gap:.35em;padding:.4em .8em;border-radius:999px;cursor:pointer;'
    + 'border:1px solid rgba(240,207,122,.6);background:rgba(0,0,0,.22);color:#f5e6b8;font:700 12px/1 Inter,system-ui,sans-serif;-webkit-tap-highlight-color:transparent}'
    + '#pth-game .bl-pill b{font:700 11px/1 Inconsolata,monospace;background:#f0cf7a;color:#2a2116;border-radius:999px;padding:.15em .5em}'
    + '#pth-game .bl-pill.on{background:rgba(240,207,122,.3)}'
    + '#pth-game.pg-light .bl-pill{color:#5a4210;background:rgba(255,255,255,.6);border-color:rgba(140,105,20,.5)}'
    // The notebook: a page of the Ace's tells.
    + '#pth-game .bl-book{position:absolute;pointer-events:auto;box-sizing:border-box;display:flex;flex-direction:column;gap:.4em;padding:.7em .8em;border-radius:.8em;'
    + 'background:linear-gradient(180deg,#f7f0dc,#ece0bf);color:#2a2116;box-shadow:0 6px 18px rgba(0,0,0,.35),inset 3px 0 0 #b3261e;font-family:Inter,system-ui,sans-serif;overflow:hidden;transform-origin:left center}'
    + '#pth-game .bl-book.bl-turn{animation:blTurn .6s ease-out}'
    + '@keyframes blTurn{0%{transform:perspective(600px) rotateY(-80deg);opacity:.3}100%{transform:none;opacity:1}}'
    + '#pth-game .bl-bh{font-weight:800;display:flex;flex-direction:column;gap:.15em;border-bottom:1px dashed rgba(42,33,22,.35);padding-bottom:.35em}'
    + '#pth-game .bl-bh small{font-weight:600;opacity:.7}'
    + '#pth-game .bl-rows{display:flex;flex-direction:column;gap:.25em;overflow:auto;flex:1 1 auto;min-height:0}'
    + '#pth-game .bl-ui .bl-row{position:static;display:grid;grid-template-columns:1.4em 1fr auto auto 1.1em;align-items:center;gap:.4em;width:100%;padding:.25em .3em;'
    + 'border:0;border-radius:.4em;background:rgba(42,33,22,.06);color:inherit;font:inherit;text-align:left;flex-direction:row}'
    + '#pth-game .bl-row span{overflow:hidden;text-overflow:ellipsis}#pth-game .bl-row b{font:700 .95em Inconsolata,monospace}'
    + '#pth-game .bl-row em{font-style:normal;color:rgba(42,33,22,.25)}#pth-game .bl-row.star em{color:#c98a1e}#pth-game .bl-row.star{background:rgba(201,138,30,.18)}'
    + '#pth-game .bl-empty{margin:0;opacity:.5}'
    + '#pth-game .bl-rep{font-size:.9em;font-weight:700;display:flex;flex-direction:column;gap:.25em}'
    + '#pth-game .bl-rep span{display:block;height:.45em;border-radius:.3em;background:rgba(42,33,22,.15);overflow:hidden}'
    + '#pth-game .bl-rep i{display:block;height:100%;background:linear-gradient(90deg,#3fae6a,#e0a33a,#d2453b)}';
  document.head.appendChild(st);
}
