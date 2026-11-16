// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Video Poker — hidden mini-game (web extension, narmod 2026-10-16), in the
// arcade behind the training nickname « mascot ». Since web.46 (narmod
// 2026-11-14: « more like a slot machine »), a slot machine: a burgundy
// cabinet with chasing bulbs, a golden marquee with LED counters, a green
// screen where the five cards turn on reels, and the panel's buttons.
//
// Five cards, keep (HOLD) the ones you want, draw the others once, paid by
// the hand on the variant's pay table (videopoker-rules.mjs: Jacks or
// Better, Bonus Poker, Deuces Wild, Joker Poker).
//   Bet          1 to 5 credits a hand: BET ONE adds one (5 → 1), BET MAX
//                bets 5 and deals; a natural royal flush pays 4,000 at 5.
//   Session      START credits, no limit of hands: play until the credits
//                run out or « Cash out »; the score is the credits then.
//   Daily        every hand dealt from a deck seeded by the (UTC) day, the
//                variant and the hand number (the same deals for everyone).
//   Double       after a win, against the Ace: he turns a card, you pick one
//                of four face down — higher doubles the win, equal keeps it,
//                lower loses it; up to MAX_DOUBLE times.
// The reels spin and stop one by one (a click each); a held reel is locked;
// the credits count up when you collect; the bulbs race on a win.
// Keys: ←/→ card (or button), Space hold, ↓ draw / deal, ↑ bet one (between
// hands) or double (after a win). Taps on the reels and the buttons.
// Secret trophy « Video Poker »: three doubles won in a row.
// ═══════════════════════════════════════════════════════════════════

import { rankOf } from './poker-hand.mjs';
import { deckFor } from './deal.mjs';
import { dayKey } from './solitaire-rules.mjs';
import { fmt, cardHtml, imageCache, rr, drawFace, aceActor } from './common.mjs';
import { spriteCache } from './sprites.mjs';
import { drawBackCard, drawFloaters, stepFloaters, keyboardFirst, fitFont } from './ui.mjs';
import { VARIANTS, variantOf, rowOf, payOf, madeBy, deckOf, MAX_BET } from './videopoker-rules.mjs';
import { titleScreen } from './title.mjs';
import { hofOn, hofStart, hofEnd, hofPanel } from './hof.mjs';
import { endScreen, barsHtml } from './end.mjs';

export const START = 100, MAX_DOUBLE = 5, TROPHY_DOUBLES = 3;
export { VARIANTS, MAX_BET };
const JACKS = VARIANTS[0];
// The old pay table (Jacks or Better), kept for its tests: [label key, per credit, test(eval)].
export const PAY = JACKS.rows.map((r) => [r[1], r[2]]);
/** Row of the Jacks or Better pay table five cards pay (-1: nothing). */
export const payRow = (cards) => rowOf(cards, JACKS);

// Best scores: free game per variant; daily per day and variant.
const BEST_KEY = 'pth_vp_best', DAILY_KEY = 'pth_vp_daily';
const load = (k) => { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

export function create(shell) {
  const { t, esc, sound } = shell;
  const img = imageCache();
  const ace = aceActor(shell.layer);
  shell.touchPad(false);
  shell.hud.classList.add('on-felt');
  // The machine shows its own counters; the HUD keeps them for the tests, hidden.
  shell.hud.innerHTML = '<div class="vp-hud" hidden><span class="vp-cr">0</span><span class="vp-h">0</span><span class="vp-mode"></span></div>';
  const hCr = /** @type {HTMLElement} */ (shell.hud.querySelector('.vp-cr'));
  const hH = /** @type {HTMLElement} */ (shell.hud.querySelector('.vp-h'));
  const hMode = /** @type {HTMLElement} */ (shell.hud.querySelector('.vp-mode'));
  ensureBoxCss();

  let state = 'title', daily = true, vi = 0, G = null, time = 0, timer = 0;
  const V = () => VARIANTS[vi];
  const tone = (f, d, v) => { try { if (typeof window.playTone === 'function') window.playTone(f, d, v); } catch (e) {} };
  function newGame() {
    G = { daily, day: dayKey(), v: V(), credits: START, shown: START, bet: MAX_BET, hand: 0, deck: [], cards: [], held: [false, false, false, false, false],
      stopAt: [0, 0, 0, 0, 0], clicked: [true, true, true, true, true], spinFrom: 0,
      cursor: 0, focus: 'deal', win: 0, row: -1, msg: '', dbl: null, chain: 0, bestRow: -1, bestCards: null, peak: START,
      fx: [], winAt: -9, yayUntil: 0, koUntil: 0, tickAt: 0, hist: [], wins: 0 };
    renderHud();
  }
  function renderHud() {
    hCr.textContent = String(G.credits);
    hH.textContent = String(G.hand);
    hMode.textContent = (G.daily ? t('psDaily') + ' · ' + G.day : t('psFree')) + ' · ' + t(G.v.key);
  }

  function titlePanel() {
    const day = dayKey(), best = load(BEST_KEY), dl = load(DAILY_KEY);
    const rec = (v) => {
      const b = daily ? (dl.d === day && dl.v ? dl.v[v.id] || 0 : 0) : best[v.id] || 0;
      return b ? t('arRecord', { n: fmt(b) }) : '';
    };
    // The machines are the tiles; daily challenge or free game, the options (↓ switches).
    titleScreen(shell, { id: 'videopoker', name: t('vpName'), hint: t('vpHint'), sel: vi,
      modes: VARIANTS.map((v, i) => ({ icon: ['🃏', '💰', '2️⃣', '🤡'][i], label: t(v.key), desc: t(v.desc), rec: rec(v) })),
      options: [{ id: 'daily', label: '📅 ' + t('psDaily') + ' · ' + day, on: daily, key: '↓' }, { id: 'free', label: '🎰 ' + t('psFree'), on: !daily }]
        .concat(hofEnabled ? [{ id: 'hof', label: '🏆 ' + t('hofTitle'), key: '1' }] : []),
      onPick: (i) => { vi = i; start(); }, onOption: (id) => { if (id === 'hof') { openHof(); return; } daily = id === 'daily'; titlePanel(); } });
  }
  // The Hall of Fame (hof.mjs, claude/CONCEPTION_HALL_OF_FAME.md, web.100): a board per machine, free game
  // ('jacks'…) or daily challenge ('day-jacks'…), the ones shown following the title's daily / free choice;
  // the 🏆 (or 1) only while the admin has it on.
  const hofMode = (isDaily, v) => (isDaily ? 'day-' : '') + v.id;
  let hofEnabled = false;
  function refreshHof() {
    hofOn('videopoker').then((on) => { if (on !== hofEnabled) { hofEnabled = on; if (state === 'title') titlePanel(); } }).catch(() => {});
  }
  function openHof() {
    state = 'board';
    hofPanel(shell, { g: 'videopoker', name: t('vpName') + ' · ' + (daily ? t('psDaily') : t('psFree')), sel: vi,
      modes: VARIANTS.map((v) => ({ id: hofMode(daily, v), label: t(v.key) })), onBack: () => { state = 'title'; titlePanel(); refreshHof(); } });
  }
  newGame();
  titlePanel();
  refreshHof();
  // Browser tests only (navigator.webdriver): reach the game state.
  try { if (navigator.webdriver) window.__pthVP = { run: () => G, state: () => state, layout: () => L(), hof: () => openHof(), start: (d) => { if (d != null) daily = !!d; start(); }, end: () => finish() }; } catch (e) {}

  function start() {
    clearTimeout(timer);
    newGame();
    state = 'ready'; shell.panel(null);
    G.hof = hofStart('videopoker', hofMode(G.daily, G.v));   // the Hall of Fame's ticket for this session (null offline / off)
    ace.pose('idle'); ace.mood('mc-m-smile'); ace.king(false);
    deal();
  }

  // ── The reels ─────────────────────────────────────────────────────
  const spinning = (i) => time < G.stopAt[i];
  function spin(list, then) {
    const quick = shell.reduced, base = time + (quick ? 0.05 : 0.38);
    G.spinFrom = time;
    list.forEach((i, k) => { G.stopAt[i] = base + (quick ? 0 : 0.15 * k); G.clicked[i] = false; });
    const last = Math.max(...list.map((i) => G.stopAt[i]), time);
    if (list.length) sound('notifyCard');
    clearTimeout(timer);
    timer = setTimeout(then, Math.max(0, last - time) * 1000 + 160);
  }

  // ── A hand ────────────────────────────────────────────────────────
  function bettable() { return Math.min(G.bet, G.credits); }
  function deal() {
    if (state !== 'ready') return;
    if (G.credits < 1) { finish(); return; }
    G.bet = bettable();
    G.hand++;
    G.credits -= G.bet; G.shown = G.credits;
    G.deck = deckOf(G.v, G.daily ? 'vp-' + G.day + '-' + G.v.id + '-' + G.hand : null);
    G.cards = G.deck.splice(0, 5);
    G.held = [false, false, false, false, false];
    G.row = -1; G.win = 0; G.msg = ''; G.cursor = 0; G.chain = 0; G.dbl = null;
    state = 'spin';
    renderHud();
    spin([0, 1, 2, 3, 4], () => { if (state === 'spin') { state = 'hold'; G.focus = 'draw'; } });
  }
  function toggle(i) {
    if (state !== 'hold') return;
    G.held[i] = !G.held[i]; G.cursor = i;
    tone(G.held[i] ? 880 : 660, 0.05, 0.05);
  }
  function drawCards() {
    if (state !== 'hold') return;
    const list = [];
    for (let i = 0; i < 5; i++) if (!G.held[i]) { G.cards[i] = G.deck.shift(); list.push(i); }
    state = 'draw';
    spin(list, settle);
  }
  function settle() {
    if (state !== 'draw') return;
    G.row = rowOf(G.cards, G.v);
    if (G.row >= 0 && (G.bestRow < 0 || G.row < G.bestRow)) { G.bestRow = G.row; G.bestCards = G.cards.slice(); }
    G.win = payOf(G.v, G.row, G.bet);
    if (G.win) {
      G.msg = t(G.v.rows[G.row][1]);
      G.winAt = time;
      G.yayUntil = performance.now() + 1100;
      sound(G.win >= 25 * G.bet ? 'notifyBigWin' : 'notifyRaise');
      state = 'win'; G.focus = 'collect';
    } else {
      G.msg = '';
      G.koUntil = performance.now() + 700;
      nextOrEnd();
    }
  }
  function collect() {
    if (state !== 'win') return;
    G.credits += G.win;               // the counter counts up to it (update)
    G.wins++;
    G.peak = Math.max(G.peak, G.credits);
    sound('notifyAction');
    G.win = 0; G.dbl = null;
    renderHud();
    nextOrEnd();
  }
  function nextOrEnd() {
    renderHud();
    G.hist.push(G.credits);           // the credits after each hand (the end screen's bars)
    if (G.credits < 1 && !G.win) { state = 'end'; clearTimeout(timer); timer = setTimeout(finish, 1100); }
    else { state = 'ready'; G.focus = 'deal'; }
  }
  function betOne() { if (state !== 'ready') return; G.bet = G.bet >= MAX_BET ? 1 : G.bet + 1; tone(520 + 80 * G.bet, 0.06, 0.06); }
  function betMax() { if (state !== 'ready') return; G.bet = MAX_BET; tone(920, 0.06, 0.06); deal(); }
  function cashOut() { if (state !== 'ready') return; sound('notifyAction'); finish(); }

  // ── Double or nothing ─────────────────────────────────────────────
  let dblCount = 0;
  function double() {
    if (state !== 'win' || G.chain >= MAX_DOUBLE) return;
    dblCount++;
    const deck = deckFor(G.daily ? 'vp-' + G.day + '-' + G.v.id + '-' + G.hand + '-d' + dblCount : null);
    G.dbl = { cards: deck.slice(0, 5), pick: -1, flip: time, flip2: 0 };
    G.cursor = 1;
    G.msg = t('vpPick');
    state = 'double';
    sound('notifyCard');
  }
  function pick(i) {
    if (state !== 'double' || i < 1 || i > 4) return;
    const d = G.dbl;
    d.pick = i; d.flip2 = time;
    const mine = rankOf(d.cards[i]), his = rankOf(d.cards[0]);
    state = 'dres';
    sound('notifyCard');
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (state !== 'dres') return;
      const L0 = L();
      if (mine > his) {
        G.win *= 2; G.chain++;
        G.fx.push({ s: '×2  ' + fmt(G.win), x: L0.rx, y: L0.ry - L0.rh / 2 - 10, t: 0, life: 1.3, gold: true, big: true });
        G.yayUntil = performance.now() + 900; G.winAt = time; sound('notifyRaise');
        if (G.chain >= TROPHY_DOUBLES) shell.grant('videopoker');
        state = 'win'; G.focus = 'collect'; G.msg = t(G.v.rows[G.row][1]);
      } else if (mine === his) {
        G.fx.push({ s: '=', x: L0.rx, y: L0.ry - L0.rh / 2 - 10, t: 0, life: 1, gold: true });
        state = 'win'; G.focus = 'collect'; G.msg = t(G.v.rows[G.row][1]);
      } else {
        G.fx.push({ s: '−' + fmt(G.win), x: L0.rx, y: L0.ry - L0.rh / 2 - 10, t: 0, life: 1.2, red: true });
        G.win = 0; G.chain = 0; G.koUntil = performance.now() + 1200; G.msg = '';
        sound('notifyFold');
        G.dbl = null;
        nextOrEnd();
      }
      if (state === 'win') G.dbl = null;
    }, 900);
  }

  // ── End of the session ────────────────────────────────────────────
  function finish() {
    clearTimeout(timer);
    state = 'over';
    shell.ended();
    const score = G.credits, id = G.v.id;
    let record = false, prev = 0;
    if (G.daily) {
      const dl = load(DAILY_KEY), day = G.day;
      const map = dl.d === day && dl.v ? dl.v : {};
      prev = map[id] || 0;
      if (score > prev) { map[id] = score; save(DAILY_KEY, { d: day, v: map }); record = prev > 0; }
    } else {
      const best = load(BEST_KEY);
      prev = best[id] || 0;
      if (score > prev) { best[id] = score; save(BEST_KEY, best); record = prev > 0; }
      if (score > shell.best.get()) shell.best.set(score);
    }
    ace.mood(score > START ? 'mc-m-yay' : 'mc-m-smile'); ace.pose(score > START ? 'wave' : 'idle');
    if (record) sound('notifyBigWin');
    G.res = { score, record, prev };
    renderResult();
  }
  function toTitle() { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); titlePanel(); refreshHof(); }
  /** The end screen (end.mjs, web.67): the credits, the best hand, the credits hand after hand. */
  function renderResult() {
    if (state !== 'over' || !G.res || G.res.shown) return;
    G.res.shown = true;
    const { score, prev } = G.res, row = G.bestCards && G.bestRow >= 0 ? t(G.v.rows[G.bestRow][1]) : '';
    const top = Math.max(1, G.peak, ...G.hist);
    endScreen(shell, {
      title: t('vpName'), sub: t(G.v.key) + ' · ' + (G.daily ? t('psDaily') + ' · ' + G.day : t('psFree')),
      cards: G.bestCards || [], hand: row ? t('psBestLine', { h: row }) : '', score, prev, unit: t('vpCredits'),
      calc: [[t('vpHands'), fmt(G.hand)], ['✓', fmt(G.wins)], [t('vpCredits') + ' max', fmt(G.peak)]],
      levels: G.hist.length ? { title: t('vpCredits'), right: fmt(START) + ' → ' + fmt(score), html: barsHtml(G.hist.slice(-48).map((c) => ({ h: c / top, cls: c >= G.peak ? 'gold' : c < 1 ? 'no' : '' }))) } : null,
      stats: [[fmt(G.hand), t('vpHands')], [fmt(G.wins), '✓'], [row || '—', t('gmBestHand')]],
      onAgain: () => start(),
      onMenu: toTitle,
    });
    hofEnd(shell, { g: 'videopoker', m: hofMode(G.daily, G.v), s: score, run: G.hof, day: G.day, daily: G.daily });
  }


  // ── Layout (world px): the cabinet, the screen, the reels, the panel ──
  function L() {
    const W = shell.W, H = shell.H, narrow = W < 430, v = G.v, rows = v.rows.length;
    const m = narrow ? 6 : 10, my = 4, mh = narrow ? 26 : 34;
    const ctrlH = narrow ? 66 : 58;
    const sx = m, sy = my + mh + 6, sw = W - 2 * m, sh = H - sy - ctrlH - 10;
    const ix = sx + 4, iy = sy + 4, iw = sw - 8, ih = sh - 8;
    // The pay table: on top in two columns (phone), at the left with the 5 bet columns (wide).
    const side = !narrow, ptW = side ? Math.min(iw * 0.5, 340) : iw;
    const per = Math.ceil(rows / 2);
    const rowH = narrow ? 10.5 : Math.min(20, (ih - 30) / rows);
    const ptTop = side ? iy + Math.max(4, (ih - 20 - rows * rowH) / 2) : iy + 4;
    const ptBot = side ? iy : ptTop + per * rowH + 4;
    // The reels.
    const ax = side ? ix + ptW + 8 : ix, aw = side ? iw - ptW - 12 : iw;
    const infoH = narrow ? 14 : 16;
    const zTop = ptBot + (narrow ? 14 : 18), zBot = iy + ih - infoH - (narrow ? 24 : 28);
    const gap = narrow ? 3 : 6, need = narrow ? 2.0 : 1.8;
    let cw = Math.min(narrow ? 44 : 84, (aw - (narrow ? 8 : 24) - 4 * gap) / 5 - 4), ch = cw * 1.4;
    if (ch * need > zBot - zTop) { ch = Math.max(30, (zBot - zTop) / need); cw = ch / 1.4; }
    const rw = cw + 4, rh = ch * need;
    const rx = ax + aw / 2, ry = (zTop + zBot) / 2 - 2;
    const xs = [0, 1, 2, 3, 4].map((i) => rx + (i - 2) * (rw + gap));
    // The panel's buttons.
    const cy0 = sy + sh + 6;
    const B = [];
    if (narrow) {
      const bh = 23, y1 = cy0 + 6, y2 = cy0 + ctrlH - bh - 6, w5 = (W - 2 * m - 12 - 16) / 5;
      for (let i = 0; i < 5; i++) B.push({ id: 'hold' + i, x: m + 6 + i * (w5 + 4), y: y1, w: w5, h: bh });
      const tot = W - 2 * m - 12, big = tot * 0.34, sm = (tot - big - 12) / 3;
      B.push({ id: 'one', x: m + 6, y: y2, w: sm, h: bh }, { id: 'max', x: m + 10 + sm, y: y2, w: sm, h: bh },
        { id: 'cash', x: m + 14 + 2 * sm, y: y2, w: sm, h: bh }, { id: 'main', x: m + 18 + 3 * sm, y: y2, w: big, h: bh });
    } else {
      const bh = 24, y1 = cy0 + (ctrlH - bh) / 2, sbh = (ctrlH - 14) / 2;
      for (let i = 0; i < 5; i++) { const w = Math.min(64, rw); B.push({ id: 'hold' + i, x: xs[i] - w / 2, y: y1, w, h: bh }); }
      const x0 = m + 8, w1 = Math.min(84, (ptW - 30) * 0.3), w2 = Math.min(80, (ptW - 30) * 0.28), w3 = ptW - 16 - w1 - w2;
      const tall = state === 'win' || state === 'double' || state === 'dres';
      B.push(tall ? { id: 'one', x: x0, y: cy0 + 6, w: w1, h: ctrlH - 12 } : { id: 'one', x: x0, y: cy0 + 5, w: w1, h: sbh }, { id: 'max', x: x0, y: cy0 + 9 + sbh, w: w1, h: sbh },
        { id: 'cash', x: x0 + w1 + 6, y: cy0 + 6, w: w2, h: ctrlH - 12 }, { id: 'main', x: x0 + w1 + w2 + 12, y: cy0 + 6, w: w3, h: ctrlH - 12 });
    }
    return { W, H, narrow, m, my, mh, ctrlH, sx, sy, sw, sh, ix, iy, iw, ih, side, ptW, per, rowH, ptTop, ax, aw, infoH,
      gap, cw, ch, rw, rh, rx, ry, xs, cy0, B };
  }
  /** What a panel button says and whether it works now. */
  function btnInfo(id) {
    const st = state;
    if (id.startsWith('hold')) {
      const i = +id.slice(4);
      if (st === 'double') return { label: i ? '?' : 'A♠', on: i > 0, lit: i === G.cursor };
      return { label: 'HOLD', on: st === 'hold', lit: st === 'hold' && G.held[i] };
    }
    if (id === 'one') return st === 'win' || st === 'double' || st === 'dres'
      ? { label: t('vpDouble'), on: st === 'win' && G.chain < MAX_DOUBLE, kind: 'red' }
      : { label: 'BET ONE', on: st === 'ready', kind: 'blue' };
    if (id === 'max') return st === 'win' || st === 'double' || st === 'dres' ? { label: '', on: false, hidden: true } : { label: 'BET MAX', on: st === 'ready', kind: 'blue' };
    if (id === 'cash') return { label: t('vpCashOut'), on: st === 'ready', kind: 'grey' };
    // main: deal / draw / collect
    if (st === 'win' || st === 'double' || st === 'dres') return { label: t('vpCollect') + ' ' + fmt(G.win), on: st === 'win', kind: 'red', lit: true };
    if (st === 'hold' || st === 'draw') return { label: t('vpDraw'), on: st === 'hold', kind: 'red', lit: st === 'hold' };
    return { label: t('vpDeal'), on: st === 'ready', kind: 'red', lit: st === 'ready' };
  }
  function hitButton(l, x, y) { for (const b of l.B) if (x >= b.x && x <= b.x + b.w && y >= b.y - 2 && y <= b.y + b.h + 2) return b.id; return null; }
  function reelAt(l, x, y) {
    for (let i = 0; i < 5; i++) if (Math.abs(x - l.xs[i]) <= l.rw / 2 + l.gap / 2 && Math.abs(y - l.ry) <= l.rh / 2 + 10) return i;
    return -1;
  }
  function press(id) {
    if (id.startsWith('hold')) { const i = +id.slice(4); if (state === 'hold') toggle(i); else if (state === 'double') pick(i); return; }
    if (id === 'one') { if (state === 'win') double(); else betOne(); }
    else if (id === 'max') betMax();
    else if (id === 'cash') cashOut();
    else if (id === 'main') { if (state === 'win') collect(); else if (state === 'hold') drawCards(); else deal(); }
  }
  const ORDER = { ready: ['one', 'max', 'cash', 'main'], win: ['one', 'main'] };

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'board') return;                 // the Hall of Fame's boards: their own buttons
    if (state === 'title' && a === 'n1') { if (hofEnabled) openHof(); return; }
    if (state === 'title') {
      if (a === 'left' || a === 'right') { vi = (vi + (a === 'left' ? VARIANTS.length - 1 : 1)) % VARIANTS.length; titlePanel(); }
      else if (a === 'duck') { daily = !daily; titlePanel(); }
      else if (a === 'jump' && info.x == null) start();
      return;
    }
    if (state === 'over') {
      if (a === 'jump') start();
      return;
    }
    const l = L();
    const up = a === 'jump' && (info.code === 'ArrowUp' || info.code === 'KeyW' || info.pad === 'up');
    if (info.x != null) {
      const b = hitButton(l, info.x, info.y);
      if (b) { if (btnInfo(b).on) press(b); return; }
      const c = reelAt(l, info.x, info.y);
      if (c >= 0) { if (state === 'hold') toggle(c); else if (state === 'double') pick(c); }
      return;
    }
    if (state === 'ready') {
      const o = ORDER.ready, i = Math.max(0, o.indexOf(G.focus));
      if (a === 'left' || a === 'right') G.focus = o[(i + (a === 'left' ? o.length - 1 : 1)) % o.length];
      else if (up) betOne();
      else if (a === 'duck') deal();
      else if (a === 'jump') press(G.focus);
      return;
    }
    if (state === 'hold') {
      if (a === 'left') G.cursor = (G.cursor + 4) % 5;
      else if (a === 'right') G.cursor = (G.cursor + 1) % 5;
      else if (a === 'duck') drawCards();
      else if (a === 'jump' && !up) toggle(G.cursor);
      return;
    }
    if (state === 'win') {
      if (a === 'left' || a === 'right') G.focus = G.focus === 'main' && G.chain < MAX_DOUBLE ? 'one' : 'main';
      else if (a === 'duck') collect();
      else if (up) double();
      else if (a === 'jump') press(G.focus);
      return;
    }
    if (state === 'double') {
      if (a === 'left') G.cursor = G.cursor <= 1 ? 4 : G.cursor - 1;
      else if (a === 'right') G.cursor = G.cursor >= 4 ? 1 : G.cursor + 1;
      else if (a === 'jump') pick(G.cursor);
    }
  }

  function update(dt) {
    time += dt;
    if (!G) return;
    stepFloaters(G.fx, dt);
    // A click as each reel stops.
    for (let i = 0; i < 5; i++) if (!G.clicked[i] && time >= G.stopAt[i]) { G.clicked[i] = true; tone(1300 - 90 * i, 0.03, 0.06); }
    // The credits count up to what was collected.
    if (G.shown < G.credits) {
      G.shown = Math.min(G.credits, G.shown + Math.max(1, Math.ceil((G.credits - G.shown) * dt * 5)));
      if (time - G.tickAt > 0.06) { G.tickAt = time; tone(1500, 0.02, 0.035); }
    } else if (G.shown > G.credits) G.shown = G.credits;
    if (state !== 'over' && state !== 'title' && state !== 'board') {
      const now = performance.now();
      ace.mood(now < G.koUntil ? 'mc-m-ko' : now < G.yayUntil ? 'mc-m-yay' : state === 'double' ? 'mc-m-cool' : 'mc-m-smile');
      ace.pose(now < G.yayUntil ? 'wave' : 'idle');
    }
  }

  // ── Drawing ───────────────────────────────────────────────────────
  const GOLD = '#f5d77a';
  // web.108 (audit lot 2): what does not move — the cabinet, the rings of bulbs (2 or 3 patterns), the title, the
  // screen, the pay table, the panel and its buttons — is painted once and copied (sprites.mjs).
  const sprites = spriteCache(shell, 48);
  const lang = () => document.documentElement.lang || '';
  /** A ring of bulbs: one picture per pattern (lit one out of three, or all / none when winning). */
  function bulbs(g, x, y, w, h, n, speed, all) {
    const ph = Math.floor(time * speed) % (all ? 2 : 3);
    sprites.draw(g, 'bulbs|' + [x, y, w, h, n, ph, all ? 1 : 0].map((v) => +(+v).toFixed(3)).join(','), 0, 0, [x - 3, y - 3, w + 6, h + 6], (c) => bulbsAt(c, x, y, w, h, n, ph, all));
  }
  function bulbsAt(g, x, y, w, h, n, ph, all) {
    const per = Math.max(4, (2 * (w + h)) / n);
    let k = 0;
    const dot = (px, py) => {
      const on = all ? ph % 2 === 0 : (k + ph) % 3 === 0; k++;
      g.beginPath(); g.arc(px, py, 2.1, 0, Math.PI * 2);
      if (on) { g.save(); g.fillStyle = '#fff3b0'; g.shadowColor = '#ffd36a'; g.shadowBlur = 6; g.fill(); g.restore(); } else { g.fillStyle = '#7a5a20'; g.fill(); }
    };
    for (let px = x; px <= x + w; px += per) dot(px, y);
    for (let py = y + per; py <= y + h; py += per) dot(x + w, py);
    for (let px = x + w - per; px >= x; px -= per) dot(px, y + h);
    for (let py = y + h - per; py > y; py -= per) dot(x, py);
  }
  function led(g, x, y, w, h, lab, val) {
    rr(g, x, y, w, h, 4); g.fillStyle = '#0a0606'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 ' + Math.max(6, h * 0.22) + 'px Inter, system-ui, sans-serif'; g.fillStyle = 'rgba(255,255,255,.55)';
    g.fillText(lab, x + w / 2, y + h * 0.24);
    g.save(); g.shadowColor = '#ff3b2f'; g.shadowBlur = 6;
    g.font = '700 ' + Math.max(9, h * 0.5) + 'px Inconsolata, monospace'; g.fillStyle = '#ff3b2f';
    g.fillText(val, x + w / 2, y + h * 0.66); g.restore();
  }
  const KIND = { red: ['#ff4a4a', '#b0101e'], blue: ['#4a7ae0', '#1d3f9a'], gold: ['#ffd84a', '#c99a10'], grey: ['#8a909a', '#4a4f58'] };
  function machineButton(g, b, info, focused) {
    const col = info.kind ? KIND[info.kind] : KIND.gold;
    g.save();
    if (!info.on) g.globalAlpha = 0.45;
    const gr = g.createLinearGradient(0, b.y, 0, b.y + b.h); gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]);
    rr(g, b.x, b.y + 2, b.w, b.h, Math.min(10, b.h * 0.3)); g.fillStyle = 'rgba(0,0,0,.5)'; g.fill();
    rr(g, b.x, b.y, b.w, b.h, Math.min(10, b.h * 0.3)); g.fillStyle = gr; g.fill();
    if (info.lit && info.on) { g.shadowColor = col[0]; g.shadowBlur = 10; g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.2; g.stroke(); g.shadowBlur = 0; }
    else { g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1; g.stroke(); }
    if (focused) { rr(g, b.x - 2, b.y - 2, b.w + 4, b.h + 4, Math.min(12, b.h * 0.35)); g.strokeStyle = '#f5f0e3'; g.lineWidth = 2; g.stroke(); }
    g.fillStyle = info.kind ? '#fff' : '#3a2600'; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitFont(g, info.label, b.w - 6, Math.min(12, b.h * 0.42), 800); g.fillText(info.label, b.x + b.w / 2, b.y + b.h / 2 + 0.5);
    g.restore();
  }
  /** The five reels: the card on the pay line, the neighbours turning by. */
  function drawReels(g, l) {
    const dbl = (state === 'double' || state === 'dres') && G.dbl;
    for (let i = 0; i < 5; i++) {
      const x = l.xs[i], top = l.ry - l.rh / 2, step = l.ch + 6;
      g.save();
      rr(g, x - l.rw / 2, top, l.rw, l.rh, 6); g.fillStyle = '#f4efe2'; g.fill(); g.clip();
      const card = dbl ? G.dbl.cards[i] : G.cards[i] != null ? G.cards[i] : i * 11;
      const sp = !dbl && spinning(i);
      // Stopped: a small bounce as it lands.
      const since = time - G.stopAt[i], bounce = !sp && since < 0.14 ? Math.sin((since / 0.14) * Math.PI) * 5 : 0;
      const off = sp ? ((time - G.spinFrom) * 1100 + i * 37) % step : -bounce;
      for (let k = -2; k <= 2; k++) {
        const c = k === 0 && !sp ? card : (card + k * 17 + (sp ? Math.floor((time - G.spinFrom) * 20) : 0) + 520) % 52, y = l.ry + k * step + off;
        g.save(); g.translate(x, y);
        let face = true;
        if (dbl && k === 0 && i > 0) {
          const d = G.dbl, open = state === 'dres' && (i === d.pick || time >= d.flip2 + 0.5);
          if (!open) { g.restore(); drawBackCard(g, img, x, y, l.cw, l.ch); face = false; }
        }
        if (face) {
          if (sp) { g.globalAlpha = 0.5; drawFace(g, img, c, l.cw, l.ch); g.translate(0, -step * 0.2); g.globalAlpha = 0.3; drawFace(g, img, c, l.cw, l.ch); }
          else drawFace(g, img, c, l.cw, l.ch);
          g.restore();
        }
      }
      // The drum: dark at the top and the bottom, a shine in the middle.
      const shd = g.createLinearGradient(0, top, 0, top + l.rh);
      shd.addColorStop(0, 'rgba(0,0,0,.8)'); shd.addColorStop(0.24, 'rgba(0,0,0,.2)'); shd.addColorStop(0.42, 'rgba(255,255,255,.06)');
      shd.addColorStop(0.58, 'rgba(255,255,255,.06)'); shd.addColorStop(0.76, 'rgba(0,0,0,.2)'); shd.addColorStop(1, 'rgba(0,0,0,.8)');
      g.fillStyle = shd; g.fillRect(x - l.rw / 2, top, l.rw, l.rh);
      // After a hand: the cards that don't count, dimmed.
      if (!dbl && (state === 'win' || state === 'ready' || state === 'end') && G.row >= 0 && G.cards.length && made.indexOf(G.cards[i]) < 0) {
        g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(x - l.rw / 2, top, l.rw, l.rh);
      }
      g.restore();
      rr(g, x - l.rw / 2, top, l.rw, l.rh, 6); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 2; g.stroke();
      // Held: the reel locked, its frame lit. The cursor (keyboard): a white frame.
      if (!dbl && G.held[i] && (state === 'hold' || state === 'draw')) {
        rr(g, x - l.rw / 2 - 2, top - 2, l.rw + 4, l.rh + 4, 7); g.strokeStyle = GOLD; g.lineWidth = 2; g.stroke();
        g.font = '900 ' + Math.max(7, Math.min(10, l.cw * 0.2)) + 'px Inter, system-ui, sans-serif'; g.fillStyle = GOLD; g.textAlign = 'center'; g.textBaseline = 'bottom';
        fitFont(g, t('vpHeld').toUpperCase(), l.rw + 6, Math.max(7, Math.min(10, l.cw * 0.2)), 900);
        g.fillText(t('vpHeld').toUpperCase(), x, top - 3);
      }
      const cur = (state === 'hold' && keyboardFirst() && i === G.cursor) || (state === 'double' && i === G.cursor && i > 0);
      if (cur) { rr(g, x - l.rw / 2 - 4, top - 4, l.rw + 8, l.rh + 8, 8); g.strokeStyle = '#f5f0e3'; g.lineWidth = 1.5; g.stroke(); }
    }
    // The pay line.
    const L0 = l.xs[0] - l.rw / 2 - 6, R0 = l.xs[4] + l.rw / 2 + 6;
    g.save(); g.strokeStyle = 'rgba(230,40,40,.85)'; g.lineWidth = 1.5; g.shadowColor = '#ff2a2a'; g.shadowBlur = 6;
    g.beginPath(); g.moveTo(L0, l.ry - l.ch / 2 - 3); g.lineTo(R0, l.ry - l.ch / 2 - 3); g.moveTo(L0, l.ry + l.ch / 2 + 3); g.lineTo(R0, l.ry + l.ch / 2 + 3); g.stroke();
    g.fillStyle = '#e62828'; for (const xx of [L0, R0]) { g.beginPath(); g.moveTo(xx, l.ry - 6); g.lineTo(xx + (xx < l.rx ? 6 : -6), l.ry); g.lineTo(xx, l.ry + 6); g.closePath(); g.fill(); }
    g.restore();
  }
  let made = [];
  /** fillText that squeezes the text horizontally when even the smallest font is too wide. */
  function fillFit(g, s, x, y, maxW) {
    const w = g.measureText(s).width;
    if (w <= maxW) { g.fillText(s, x, y); return; }
    g.save(); g.translate(x, y); g.scale(maxW / w, 1); g.fillText(s, 0, 0); g.restore();
  }
  function drawPaytable(g, l) {
    const v = G.v, lit = state === 'win' || state === 'ready' || state === 'end' || state === 'double' || state === 'dres' ? G.row : -1;
    const blink = lit >= 0 && time - G.winAt < 1.5 && Math.floor((time - G.winAt) * 6) % 2 === 0;
    g.textBaseline = 'middle';
    if (l.narrow) {
      const hw = (l.iw - 8) / 2;
      v.rows.forEach((r, i) => {
        const c = Math.floor(i / l.per), k = i % l.per, x0 = l.ix + 4 + c * hw, y = l.ptTop + k * l.rowH + l.rowH / 2;
        if (i === lit && !blink) { g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x0, y - l.rowH / 2, hw - 3, l.rowH); }
        g.textAlign = 'left'; g.fillStyle = GOLD;
        fitFont(g, t(r[1]).toUpperCase(), hw - 34, 7.5, 800); fillFit(g, t(r[1]).toUpperCase(), x0 + 2, y, hw - 34);
        g.textAlign = 'right'; g.font = '700 8px Inconsolata, monospace'; g.fillText(fmt(payOf(v, i, G.bet)), x0 + hw - 6, y);
      });
      return;
    }
    const nameW = l.ptW * 0.34, colW = (l.ptW - nameW - 8) / MAX_BET, colX = (c) => l.ix + 4 + nameW + c * colW + colW / 2;
    g.fillStyle = 'rgba(216,178,90,.32)'; g.fillRect(colX(G.bet - 1) - colW / 2 + 1, l.ptTop - 3, colW - 2, v.rows.length * l.rowH + 5);
    v.rows.forEach((r, i) => {
      const y = l.ptTop + i * l.rowH + l.rowH / 2;
      if (i === lit && !blink) { g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(l.ix + 2, y - l.rowH / 2, l.ptW - 2, l.rowH); }
      g.textAlign = 'left'; g.fillStyle = GOLD;
      fitFont(g, t(r[1]).toUpperCase(), nameW - 6, Math.min(11, l.rowH * 0.6), 800); fillFit(g, t(r[1]).toUpperCase(), l.ix + 6, y, nameW - 6);
      g.textAlign = 'center'; g.font = '700 ' + Math.min(10.5, l.rowH * 0.58) + 'px Inconsolata, monospace';
      for (let c = 0; c < MAX_BET; c++) { g.fillStyle = GOLD; fitFont(g, fmt(payOf(v, i, c + 1)), colW - 2, Math.min(10.5, l.rowH * 0.58), 700, 'Inconsolata, monospace'); g.fillText(fmt(payOf(v, i, c + 1)), colX(c), y); }
    });
  }
  function draw(g) {
    const W = shell.W, H = shell.H;
    if (state === 'title' || state === 'board' || !G) { g.fillStyle = '#2a070c'; g.fillRect(0, 0, W, H); return; }
    const l = L();
    made = G.row >= 0 && G.cards.length ? madeBy(G.cards, G.v, G.row) : [];
    const winning = time - G.winAt < 1.6, geo = [W, H, l.m, l.my, l.mh].map((v) => +v.toFixed(3)).join(',');
    // The cabinet and the marquee.
    sprites.draw(g, 'cab|' + geo, 0, 0, [0, 0, W, H], (c) => {
      const cab = c.createLinearGradient(0, 0, W, 0); cab.addColorStop(0, '#3a0a10'); cab.addColorStop(0.5, '#6e1420'); cab.addColorStop(1, '#3a0a10');
      c.fillStyle = cab; c.fillRect(0, 0, W, H);
      rr(c, l.m, l.my, W - 2 * l.m, l.mh, 8);
      const mq = c.createLinearGradient(0, l.my, 0, l.my + l.mh); mq.addColorStop(0, '#ffcf4a'); mq.addColorStop(1, '#c4851a');
      c.fillStyle = mq; c.fill(); c.strokeStyle = '#fff1b8'; c.lineWidth = 1.5; c.stroke();
    });
    bulbs(g, l.m + 3, l.my + 3, W - 2 * l.m - 6, l.mh - 6, l.narrow ? 34 : 70, winning ? 14 : 5, winning);
    // The variant's name, the LED counters (wide).
    const ledW = l.narrow ? 0 : 92, title = t(G.v.key).toUpperCase();
    sprites.draw(g, 'title|' + title + '|' + geo + '|' + (l.narrow ? 1 : 0), 0, 0, [l.m, l.my, W - 2 * l.m, l.mh], (c) => {
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#5a0a12';
      fitFont(c, title, W - 2 * l.m - 2 * ledW - (l.narrow ? 50 : 70), l.narrow ? 12 : 17, 900, 'Cinzel, Georgia, serif');
      c.fillText(title, W / 2, l.my + l.mh / 2 + 1);
    });
    if (!l.narrow) {
      led(g, l.m + 8, l.my + 4, ledW, l.mh - 8, t('vpCredits').toUpperCase(), fmt(G.shown));
      led(g, W - l.m - 8 - ledW, l.my + 4, ledW, l.mh - 8, 'WIN', fmt(G.win || 0));
    }
    // The screen in its ring of bulbs.
    bulbs(g, l.sx - 3, l.sy - 3, l.sw + 6, l.sh + 6, l.narrow ? 40 : 90, winning ? 14 : 4, winning);
    const scrGeo = [l.sx, l.sy, l.sw, l.sh, l.ix, l.iy, l.iw, l.ih].map((v) => +v.toFixed(3)).join(',');
    sprites.draw(g, 'screen|' + scrGeo, 0, 0, [l.sx, l.sy, l.sw, l.sh], (c) => {
      rr(c, l.sx, l.sy, l.sw, l.sh, 10); c.fillStyle = '#05060a'; c.fill();
      rr(c, l.ix, l.iy, l.iw, l.ih, 7);
      const scr = c.createRadialGradient(l.ix + l.iw / 2, l.iy + l.ih / 2, 10, l.ix + l.iw / 2, l.iy + l.ih / 2, Math.max(l.iw, l.ih) * 0.7);
      scr.addColorStop(0, '#22744a'); scr.addColorStop(1, '#0f3d27');
      c.fillStyle = scr; c.fill();
    });
    g.save(); rr(g, l.ix, l.iy, l.iw, l.ih, 7); g.clip();
    // The pay table: again only when the bet, the machine, the hand lit or its blink change.
    const lit = state === 'win' || state === 'ready' || state === 'end' || state === 'double' || state === 'dres' ? G.row : -1;
    const blink = lit >= 0 && time - G.winAt < 1.5 && Math.floor((time - G.winAt) * 6) % 2 === 0;
    sprites.draw(g, 'pay|' + [G.v.id, G.bet, lit, blink ? 1 : 0, l.narrow ? 1 : 0, lang(), scrGeo, l.ptTop, l.rowH, l.ptW, l.per].join(','), 0, 0, [l.ix, l.iy, l.iw, l.ih], (c) => drawPaytable(c, l));
    drawReels(g, l);
    // Under the reels: the hand that paid, or what to do.
    if (G.msg && state !== 'spin' && state !== 'hold' && state !== 'draw') {
      g.save(); g.fillStyle = GOLD; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#000'; g.shadowBlur = 4;
      const big = state === 'win' || state === 'ready' || state === 'end';
      fitFont(g, big ? G.msg.toUpperCase() : G.msg, l.aw - 10, big ? (l.narrow ? 13 : 17) : (l.narrow ? 9 : 11), 900);
      g.fillText(big ? G.msg.toUpperCase() : G.msg, l.rx, l.ry + l.rh / 2 + (l.narrow ? 11 : 14)); g.restore();
    }
    // The screen's line: win, bet, credits.
    const by = l.iy + l.ih - l.infoH / 2 - 3;
    g.font = '800 ' + (l.narrow ? 8.5 : 11) + 'px Inter, system-ui, sans-serif'; g.textBaseline = 'middle'; g.fillStyle = GOLD;
    g.textAlign = 'left'; g.fillText('WIN ' + fmt(G.win || 0), l.ix + 6, by);
    g.textAlign = 'center'; g.fillText('BET ' + G.bet, l.ix + l.iw / 2, by);
    g.textAlign = 'right'; g.fillText(t('vpCredits').toUpperCase() + ' ' + fmt(G.shown), l.ix + l.iw - 6, by);
    g.restore();
    // A win: the screen's frame flashes gold.
    if (winning && Math.floor((time - G.winAt) * 8) % 2 === 0) { rr(g, l.ix - 1, l.iy - 1, l.iw + 2, l.ih + 2, 8); g.strokeStyle = '#ffd84a'; g.lineWidth = 3; g.stroke(); }
    else { rr(g, l.ix, l.iy, l.iw, l.ih, 7); g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 1; g.stroke(); }
    // The panel.
    sprites.draw(g, 'panel|' + [W, l.m, l.cy0, l.ctrlH].map((v) => +v.toFixed(3)).join(','), 0, 0, [l.m, l.cy0, W - 2 * l.m, l.ctrlH], (c) => {
      rr(c, l.m, l.cy0, W - 2 * l.m, l.ctrlH, 8);
      const pan = c.createLinearGradient(0, l.cy0, 0, l.cy0 + l.ctrlH); pan.addColorStop(0, '#9aa0a8'); pan.addColorStop(1, '#4e535b');
      c.fillStyle = pan; c.fill();
    });
    const kb = keyboardFirst();
    for (const b of l.B) {
      const info = btnInfo(b.id);
      if (info.hidden) continue;
      const focused = kb && (state === 'ready' || state === 'win') && G.focus === b.id;
      sprites.draw(g, 'btn|' + [b.id, info.label, info.on ? 1 : 0, info.lit ? 1 : 0, info.kind || '', focused ? 1 : 0, b.x, b.y, b.w, b.h].map((v) => typeof v === 'number' ? +v.toFixed(3) : v).join(','),
        0, 0, [b.x - 3, b.y - 3, b.w + 6, b.h + 6], (c) => machineButton(c, b, info, focused));
    }
    // The Ace on the marquee.
    ace.place(l.narrow ? l.m + 16 : l.m + ledW + 26, l.my + l.mh - 2, l.narrow ? 0.1 : 0.13, shell.k);
    drawFloaters(g, G.fx);
  }

  return {
    update, draw, input, resize: renderResult,
    running: () => state !== 'title' && state !== 'over' && state !== 'board',
    destroy() { clearTimeout(timer); ace.remove(); },
  };
}

function ensureBoxCss() {
  if (document.getElementById('pth-game-vp-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-vp-css';
  st.textContent = '#pth-game .vp-box{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 16px;border-radius:12px;pointer-events:auto;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .vp-box .ar-show{flex-wrap:nowrap}#pth-game .vp-box h2{color:#f5d77a}'
    + '#pth-game.pg-light .vp-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .vp-box h2{color:#8a6510}';
  document.head.appendChild(st);
}
