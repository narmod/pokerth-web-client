// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Higher or Lower — hidden mini-game (web extension, narmod 2026-10-16), in
// the arcade behind the training nickname « mascot ». Three ways to play
// since web.44 (narmod 2026-11-14: « more like poker »), on a casino felt
// (web.45: gold lines and card places printed on it): the Ace deals from the
// shoe, chips instead of a bare number, the actions of the table (Bet,
// Raise, All-In, Fold) and the showdown.
//
// Will the next card of the shoe be higher or lower than the one face up?
// Aces high, 2s low, the same rank is a push. One deck in the shoe,
// reshuffled when fewer than RESHUFFLE cards are left; the cards already out
// are shown at the top — counting them helps.
//
//   hand     « The hand »: a right guess grows the pot by the odds of that
//            guess (mult(): from the cards still in the shoe, a small house
//            edge — a safe guess pays little, a long shot a lot) and the card
//            joins your hand; a push joins it too (a pair!), the pot as it
//            is. Five cards: the showdown multiplies the pot by the hand
//            (HAND_X, ×1 high card … ×4 royal flush) and banks it. Cash out
//            before (at least one right guess): the pot × the hand so far. A
//            wrong guess loses the pot, the hand and a heart — LIVES hearts.
//   tourney  « The tournament »: STACK0 chips, the blinds go up every
//            BLIND_EVERY cards (BLINDS), the tournament ends after the last
//            level. Each card: pick a bet — Bet (the big blind), Raise (half
//            the stack), All-In — then higher or lower; a right guess pays
//            even money, a push gives the bet back. Fold: skip the card for
//            the small blind. No chips left: out. The score: the stack at the
//            end (0 if out). Even money makes it poker: bet big when the odds
//            are with you (a 3 face up), small or fold on a 7 or an 8.
//   both     « Hand + tournament »: the tournament, and the cards you won
//            build a hand as in « The hand »; five cards: the showdown pays
//            HAND_BB big blinds. A lost card or a fold starts a new hand.
// The page (web.51, narmod: « épuré » + the ranks' ladder, the table's buttons,
// ▲ ▼ in gold): see L() and layoutButtons().
// Keys: ↑ higher, ↓ lower; hand: Space cash out; tournament: 1 2 3 the bet,
// 4 Fold; ←/→ move between the buttons (Enter or pad A presses the one lit).
// Secret trophy « Higher or Lower »: TROPHY_STREAK right guesses in a row.
// ═══════════════════════════════════════════════════════════════════

import { rankOf, evalCards, NAME_KEYS } from './poker-hand.mjs';
import { shuffled } from './deal.mjs';
import { fmt, imageCache, rr, drawFace, aceActor, CHIP } from './common.mjs';
import { felt, drawBackCard, drawPlace, bubble, drawFloaters, stepFloaters, keyboardFirst, fitFont } from './ui.mjs';
import { titleScreen } from './title.mjs';
import { hofOn, hofStart, hofEnd, hofPanel } from './hof.mjs';
import { endScreen, stepsHtml } from './end.mjs';

export const POT0 = 10, LIVES = 3, RESHUFFLE = 8, TROPHY_STREAK = 10, EDGE = 0.95;
export const HAND_SIZE = 5;
/** « The hand »: the pot × the hand at the showdown, by category (high card … royal flush). */
export const HAND_X = [1, 1.2, 1.4, 1.6, 1.9, 2.1, 2.4, 3, 3.5, 4];
/** « Hand + tournament »: big blinds won at the showdown, by category. */
export const HAND_BB = [0, 2, 4, 6, 10, 12, 16, 25, 50, 100];
export const STACK0 = 1000, BLIND_EVERY = 5;
/** The tournament's levels: [small blind, big blind]. */
export const BLINDS = [[10, 20], [15, 30], [25, 50], [50, 100], [75, 150], [100, 200], [150, 300], [200, 400], [300, 600], [400, 800], [600, 1200], [1000, 2000]];
export const TOURNEY_CARDS = BLINDS.length * BLIND_EVERY;
// The ways to play, on the title (the arcade's tiles).
export const MODES = [
  { id: 'hand', icon: '🃏', key: 'hlModeHand', desc: 'hlModeHandD' },
  { id: 'tourney', icon: '🏆', key: 'hlModeTourney', desc: 'hlModeTourneyD' },
  { id: 'both', icon: '♠️', key: 'hlModeBoth', desc: 'hlModeBothD' },
];

/** Cards of `shoe` higher, lower and equal in rank to card `n`. */
export function odds(n, shoe) {
  const r = rankOf(n);
  let hi = 0, lo = 0, eq = 0;
  for (const c of shoe) { const x = rankOf(c); if (x > r) hi++; else if (x < r) lo++; else eq++; }
  return { hi, lo, eq, n: shoe.length };
}
/** What a right guess multiplies the pot by: the fair odds (pushes aside) less the edge, by steps of 0.05, at least 1.05. */
export function mult(win, lose) {
  if (win <= 0) return 0;
  return Math.max(1.05, Math.round(((win + lose) / win) * EDGE * 20) / 20);
}
/** The hand so far: { cat (-1 none), nameKey, best }. */
export function handOf(cards) { return cards && cards.length ? evalCards(cards) : { cat: -1, nameKey: '', best: [] }; }
/** « The hand »: what the pot is multiplied by for `cards`. */
export const handX = (cards) => HAND_X[Math.max(0, handOf(cards).cat)];
/** The blinds at tournament level `lv`. */
export const blindsAt = (lv) => BLINDS[Math.min(BLINDS.length - 1, Math.max(0, lv))];
/** The level after `cards` cards played. */
export const levelAt = (cards) => Math.min(BLINDS.length - 1, Math.floor(cards / BLIND_EVERY));
/** The chips a bet puts in: bet (the big blind), raise (half the stack, at least 2 big blinds), allin. */
export function betAmount(kind, stack, bb) {
  if (kind === 'allin') return stack;
  if (kind === 'raise') return Math.min(stack, Math.max(2 * bb, Math.floor(stack / 2)));
  return Math.min(stack, bb);
}
/** The stack after a bet: even money on a right guess (res 1), the bet lost (−1), given back on a push (0). */
export const settleBet = (stack, bet, res) => (res > 0 ? stack + bet : res < 0 ? stack - bet : stack);

// Best scores of the tournaments, on this device (« The hand » uses the arcade's best).
const BEST_KEY = 'pth_hl_best';
function loadBest() { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') || {}; } catch (e) { return {}; } }
function saveBest(b) { try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch (e) {} }

export function create(shell) {
  const { t, esc, sound } = shell;
  const img = imageCache();
  const ace = aceActor(shell.layer);
  shell.touchPad(false);
  shell.hud.classList.add('on-felt');
  ensureCss();
  let hScore = null, hLives = null, hShoe = null;
  function buildHud() {
    const tour = mode !== 'hand';
    shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t(tour ? 'hlStack' : 'hcScore')) + '</div><div class="ar-num hl-score">0</div></div>'
      + '<div><div class="ar-lab">' + (tour ? esc(t('hlLevel')) : '&nbsp;') + '</div><div class="ar-num ' + (tour ? 'hl-level' : 'hl-lives') + '"></div></div></div>'
      + '<div class="ar-hand"><div class="ar-name hl-shoe"></div></div>';
    hScore = shell.hud.querySelector('.hl-score'); hLives = shell.hud.querySelector('.hl-lives,.hl-level'); hShoe = shell.hud.querySelector('.hl-shoe');
  }

  /** The title, or the Hall of Fame's boards opened from it (the same scene behind). */
  const onTitle = () => state === 'title' || state === 'board';
  let state = 'title', mode = 'hand', sel = 0, G = null, time = 0, timer = 0;
  const tour = () => mode !== 'hand';
  function newGame() {
    G = { score: 0, lives: LIVES, pot: POT0, potWins: 0, streak: 0, bestStreak: 0, bestPot: 0, shoe: shuffled(), cur: -1, next: -1, seen: [],
      hand: [], stack: STACK0, cards: 0, bet: 'bet', betNow: 0, out: false, show: null,
      focus: 'hi', flipAt: 0, guess: null, res: 0, fx: [], say: null, yayUntil: 0, koUntil: 0 };
    G.cur = G.shoe.pop();
    G.hand = [G.cur];
  }
  function renderHud() {
    if (!hScore) return;
    if (tour()) {
      const [sb, bb] = blindsAt(levelAt(G.cards));
      hScore.textContent = fmt(G.stack);
      hLives.textContent = String(levelAt(G.cards) + 1);
      hShoe.textContent = 'Blinds ' + fmt(sb) + '/' + fmt(bb) + ' · ' + '●'.repeat(G.cards % BLIND_EVERY) + '○'.repeat(BLIND_EVERY - (G.cards % BLIND_EVERY));
    } else {
      hScore.textContent = fmt(G.score);
      hLives.textContent = '❤'.repeat(Math.max(0, G.lives)) + '♡'.repeat(Math.max(0, LIVES - G.lives));
      hShoe.textContent = t('psCards') + ' ' + G.shoe.length;
    }
  }
  const say = (s, life = 1.8) => { G.say = { s, t: 0, life }; };

  /** The title: the ways to play, their records — the arcade's tiles. */
  function titlePanel() {
    const best = loadBest();
    const rec = (m) => {
      const b = best[m.id] || {};
      return m.id === 'hand' ? (shell.best.get() ? t('arRecord', { n: fmt(shell.best.get()) }) : '')
        : (b.best ? t('arRecord', { n: fmt(b.best) }) : '') + (b.level ? (b.best ? ' · ' : '') + t('wwLevel', { n: b.level }) : '');
    };
    titleScreen(shell, { id: 'hilo', name: t('hlName'), hint: t('hlHint'), sel,
      modes: MODES.map((m) => ({ icon: m.icon, label: t(m.key), desc: t(m.desc), rec: rec(m) })),
      options: hofEnabled ? [{ id: 'hof', label: '🏆 ' + t('hofTitle'), key: '↓' }] : [],
      onOption: (id) => { if (id === 'hof') openHof(); },
      onPick: (i) => { sel = i; start(MODES[sel].id); } });
  }
  // The Hall of Fame (hof.mjs, claude/CONCEPTION_HALL_OF_FAME.md, web.101): the title's 🏆 (or ↓, else the next
  // tile) only while the admin has it on.
  let hofEnabled = false;
  function refreshHof() {
    hofOn('hilo').then((on) => { if (on !== hofEnabled) { hofEnabled = on; if (state === 'title') titlePanel(); } }).catch(() => {});
  }
  function openHof() {
    state = 'board';
    hofPanel(shell, { g: 'hilo', name: t('hlName'), sel, modes: MODES.map((m) => ({ id: m.id, label: t(m.key) })),
      onBack: () => { state = 'title'; titlePanel(); refreshHof(); } });
  }
  newGame();
  titlePanel();
  refreshHof();
  try { if (navigator.webdriver) window.__pthHL = { run: () => G, state: () => state, mode: () => mode, start: (m) => start(m), hof: () => openHof(), end: () => finish(), layout: () => L() }; } catch (e) {}

  function start(m) {
    clearTimeout(timer);
    mode = m || MODES[sel].id;
    sel = Math.max(0, MODES.findIndex((x) => x.id === mode));
    newGame();
    buildHud(); renderHud();
    state = 'guess'; shell.panel(null);
    G.hof = hofStart('hilo', mode);   // the Hall of Fame's ticket (null offline / off)
    ace.pose('idle'); ace.mood('mc-m-smile');
    sound('notifyCard');
  }
  function guess(dir) {
    if (state !== 'guess') return;
    const o = odds(G.cur, G.shoe);
    const m = dir > 0 ? mult(o.hi, o.lo) : mult(o.lo, o.hi);
    if (!m) { sound('notifyFold'); return; }              // nothing higher than an ace (or lower than a 2) left
    if (tour()) {
      const [, bb] = blindsAt(levelAt(G.cards));
      G.betNow = betAmount(G.bet, G.stack, bb);
      if (G.betNow <= 0) return;
    }
    G.next = G.shoe.pop();
    G.guess = dir; G.flipAt = time;
    const d = rankOf(G.next) - rankOf(G.cur);
    G.res = d === 0 ? 0 : Math.sign(d) === dir ? 1 : -1;
    state = 'flip';
    sound('notifyCard');
    renderHud();
    clearTimeout(timer);
    timer = setTimeout(() => settle(m), 450);
  }
  /** Fold (tournament): the small blind, the next card shown, a new hand. */
  function fold() {
    if (state !== 'guess' || !tour()) return;
    const [sb] = blindsAt(levelAt(G.cards));
    const cost = Math.min(G.stack, sb);
    G.stack -= cost;
    G.next = G.shoe.pop(); G.guess = 0; G.flipAt = time; G.res = 2; G.betNow = 0;
    const L0 = L();
    G.fx.push({ s: '−' + fmt(cost), x: L0.potX, y: L0.cardY - L0.ch / 2 - 14, t: 0, life: 1, red: true });
    state = 'flip';
    sound('notifyFold');
    clearTimeout(timer);
    timer = setTimeout(() => settle(0), 450);
  }
  function settle(m) {
    if (state !== 'flip') return;
    const L0 = L(), fy = L0.cardY - L0.ch / 2 - 14;
    const folded = G.res === 2;
    if (!folded && G.res > 0) {
      G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak);
      if (tour()) {
        G.stack = settleBet(G.stack, G.betNow, 1);
        G.fx.push({ s: '+' + fmt(G.betNow), x: L0.potX, y: fy, t: 0, life: 1.1, gold: true, big: G.bet === 'allin' });
        sound(G.bet === 'allin' ? 'notifyBigWin' : G.streak >= 5 ? 'notifyRaise' : 'notifyAction');
      } else {
        G.pot = Math.round(G.pot * m); G.potWins++;
        G.bestPot = Math.max(G.bestPot, G.pot);
        G.fx.push({ s: '×' + m.toFixed(2) + '  ' + fmt(G.pot), x: L0.potX, y: fy, t: 0, life: 1.1, gold: true });
        sound(G.streak >= 5 ? 'notifyRaise' : 'notifyAction');
      }
      G.yayUntil = performance.now() + 600;
      if (G.streak === TROPHY_STREAK) shell.grant('hilo');
      if (G.streak >= 3) say('×' + G.streak + '!', 1.2);
      G.hand.push(G.next);
    } else if (!folded && G.res === 0) {
      G.fx.push({ s: '=', x: L0.potX, y: fy, t: 0, life: 0.9, gold: true });
      G.hand.push(G.next);                 // the same rank: a pair in the hand
    } else if (!folded) {
      G.streak = 0;
      if (tour()) {
        G.stack = settleBet(G.stack, G.betNow, -1);
        G.fx.push({ s: '−' + fmt(G.betNow), x: L0.potX, y: fy, t: 0, life: 1.2, red: true });
      } else {
        G.fx.push({ s: '−' + fmt(G.pot), x: L0.potX, y: fy, t: 0, life: 1.2, red: true });
        G.lives--; G.pot = POT0; G.potWins = 0;
      }
      G.koUntil = performance.now() + 900;
      sound('notifyFold');
      G.hand = [G.next];
    } else G.hand = [G.next];             // a fold: a new hand from the card shown
    if (tour()) {
      if (G.bet === 'allin') G.bet = 'bet';
      const lv0 = levelAt(G.cards);
      G.cards++;
      if (G.cards < TOURNEY_CARDS && levelAt(G.cards) > lv0) {
        const [sb, bb] = blindsAt(levelAt(G.cards));
        G.fx.push({ s: t('arBlinds') + ' ' + fmt(sb) + '/' + fmt(bb), x: L0.W / 2, y: L0.histY + 30, t: 0, life: 1.6, gold: true });
        sound('notifyBlindsUp');
      }
    }
    G.seen.push(G.cur);
    G.cur = G.next; G.next = -1; G.guess = null;
    if (G.shoe.length < RESHUFFLE) reshuffle();
    if (mode === 'tourney') G.hand = [G.cur];   // no hand in the plain tournament
    // Five cards: the showdown.
    let shown = false;
    if (G.hand.length >= HAND_SIZE && mode !== 'tourney') { showdown(); shown = true; }
    renderHud();
    const out = tour() ? G.stack <= 0 : G.lives <= 0;
    const done = tour() && G.cards >= TOURNEY_CARDS;
    if (out || done) { G.out = out; state = 'end'; timer = setTimeout(finish, shown ? 1500 : 900); }
    else state = shown ? 'show' : 'guess';
  }
  /** The hand of five: its value, then a new hand from the last card. */
  function showdown() {
    const h = handOf(G.hand), cat = Math.max(0, h.cat), L0 = L();
    let gain = 0;
    if (mode === 'hand') {
      const before = G.pot;
      G.pot = Math.round(G.pot * HAND_X[cat]);
      gain = G.pot; G.score += G.pot; G.bestPot = Math.max(G.bestPot, G.pot);
      G.show = { cards: G.hand.slice(), best: h.best, nameKey: h.nameKey, line: '×' + HAND_X[cat] + '  ' + fmt(before) + ' → ' + fmt(G.pot), t: time };
      G.pot = POT0; G.potWins = 0;
    } else {
      const [, bb] = blindsAt(levelAt(G.cards));
      gain = HAND_BB[cat] * bb; G.stack += gain;
      G.show = { cards: G.hand.slice(), best: h.best, nameKey: h.nameKey, line: gain ? '+' + HAND_BB[cat] + ' BB = +' + fmt(gain) : '—', t: time };
    }
    G.fx.length = 0;                       // the band says it all
    void L0; void gain;
    sound(cat >= 4 ? 'notifyBigWin' : cat >= 1 ? 'notifyRaise' : 'notifyAction');
    if (cat >= 1) G.yayUntil = performance.now() + 1200;
    G.hand = [G.cur];
    clearTimeout(timer);
    timer = setTimeout(() => { if (state === 'show') { state = 'guess'; G.show = null; } }, 1700);
  }
  function reshuffle() {
    G.shoe = shuffled().filter((c) => c !== G.cur);
    G.seen = [];
    G.fx.push({ s: '⟳', x: L().shoeX, y: L().cardY - L().ch / 2 - 12, t: 0, life: 1.2, gold: true });
  }
  /** « The hand »: bank the pot × the hand so far. */
  function cash() {
    if (state !== 'guess' || tour() || !G.potWins) return;
    const x = handX(G.hand);
    const win = Math.round(G.pot * x);
    G.score += win; G.bestPot = Math.max(G.bestPot, win);
    G.fx.push({ s: '+' + fmt(win) + (x > 1 ? '  (×' + x + ')' : ''), x: L().potX, y: L().cardY - L().ch / 2 - 14, t: 0, life: 1.2, gold: true, big: win >= 100 });
    sound(win >= 100 ? 'notifyBigWin' : 'notifyRaise');
    G.yayUntil = performance.now() + 900;
    G.pot = POT0; G.potWins = 0; G.hand = [G.cur];
    renderHud();
  }
  function finish() {
    state = 'over';
    shell.ended();
    let score, prev, record;
    const level = levelAt(Math.max(0, G.cards - 1)) + 1;
    if (tour()) {
      score = G.out ? 0 : G.stack;
      const best = loadBest(), b = best[mode] || {};
      prev = b.best || 0; record = score > prev;
      if (record || level > (b.level || 0)) { best[mode] = { best: Math.max(prev, score), level: Math.max(b.level || 0, level) }; saveBest(best); }
    } else {
      score = G.score; prev = shell.best.get(); record = score > prev;
      if (record) shell.best.set(score);
    }
    if (record && prev) sound('notifyBigWin');
    ace.mood(G.out ? 'mc-m-ko' : 'mc-m-smile'); ace.pose('idle');
    G.result = { score, record, prev, level };
    renderResult();
  }
  /** The end screen (end.mjs, web.67): the score or the stack, the blind levels climbed. */
  function renderResult() {
    if (state !== 'over' || !G.result || G.result.shown) return;
    G.result.shown = true;
    const { score, prev, level } = G.result, tr = tour(), m = MODES.find((x) => x.id === mode);
    endScreen(shell, {
      title: tr ? (G.out ? t('hlBust') : t('hlDone')) : t('hlName'), sub: t(m.key) + ' · ' + t('hlName'),
      score, prev,
      calc: [tr ? [t('hlStack'), fmt(G.stack)] : [t('hlPot'), fmt(G.bestPot)], ['🔥', '×' + fmt(G.bestStreak)], [t('psCards'), fmt(G.cards)]],
      levels: { title: t('hlLevel') + ' ' + level, right: BLINDS[level - 1][0] + '/' + BLINDS[level - 1][1], html: stepsHtml(esc, BLINDS.map((b, i) => ({ label: String(i + 1), cls: i < level - 1 ? 'ok' : i === level - 1 ? 'ok cur' : '' }))) },
      stats: [[fmt(G.cards), t('psCards')], ['×' + fmt(G.bestStreak), '🔥'], [fmt(G.bestPot), t('hlPot')]],
      onAgain: () => start(mode),
      onMenu: () => { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); titlePanel(); refreshHof(); },
    });
    hofEnd(shell, { g: 'hilo', m: mode, s: score, run: G.hof });
  }


  // ── Layout (world px) ─────────────────────────────────────────────
  // web.51 (narmod's pick: « épuré » + the ladder, the table's buttons, ▲ ▼ in
  // gold): the ranks' ladder on the left, the card and the shoe (the Ace on
  // it), the hand under them; at the bottom the bets (or the pot), ▼ Plus bas
  // and ▲ Plus haut side by side, Fold (or Cash out) under them. On a wide
  // stage the hand, the bets and the buttons go to a column on the right.
  function L() {
    const W = shell.W, H = shell.H;
    let top = 46;
    try { top = Math.max(40, shell.hud.offsetHeight / (shell.k || 1) + 6); } catch (e) {}
    const narrow = W < 430, isT = tour(), plain = mode === 'tourney';
    if (narrow) {
      const foldH = 26, bigH = 50, rowH = 25, x0 = 30, x1 = W - 4;
      const foldY = H - 8 - foldH / 2, bigTop = foldY - foldH / 2 - 6 - bigH, bigY = bigTop + bigH / 2;
      const rowY = bigTop - 8 - rowH / 2;
      const lad = { x: 4, y: top + 2, w: 20, h: bigTop - 8 - top - 2 };
      const hw = 26, hh = 36, handY = rowY - rowH / 2 - 8 - hh / 2, labelY = handY - hh / 2 - 8;
      const histY = top + 9;
      const zoneTop = histY + 12, zoneBot = plain ? rowY - rowH / 2 - 10 : labelY - 8;
      let cw = plain ? 78 : 66, ch = cw * 1.4;
      if (ch > zoneBot - zoneTop) { ch = zoneBot - zoneTop; cw = ch / 1.4; }
      const cardY = (zoneTop + zoneBot) / 2, cardX = x0 + cw / 2 + 6;
      const sw = Math.min(46, cw * 0.72), sh = sw * 1.4, shoeX = x1 - sw / 2 - 6, shoeY = cardY + 8;
      return { W, H, narrow, isT, top, lad, x0, x1, histY, cw, ch, cardX, cardY, sw, sh, shoeX, shoeY, hw, hh, handY, labelY,
        handX0: x0, rowY, rowH, rowX0: x0, rowX1: x1, bigY, bigH, bigX0: 6, bigX1: W - 6, foldY, foldH, foldW: Math.min(W - 40, 170), foldX: W / 2,
        potX: (cardX + shoeX) / 2, tags: false, f: 1 };
    }
    // Wide: the table on the left, a column on the right.
    const lad = { x: 8, y: top + 2, w: 22, h: H - 10 - top - 2 };
    const split = Math.round(W * 0.52), lx0 = 66, rx0 = split + 8, rx1 = W - 10;
    const histY = top + 9;
    const zoneTop = histY + 16, zoneBot = H - 16;
    let cw = Math.min(118, (split - lx0) * 0.44), ch = cw * 1.4;
    if (ch > zoneBot - zoneTop - 30) { ch = zoneBot - zoneTop - 30; cw = ch / 1.4; }
    const cardY = (zoneTop + zoneBot) / 2 + 10, cardX = lx0 + (split - lx0) * 0.3;
    const sw = cw * 0.7, sh = sw * 1.4, shoeX = lx0 + (split - lx0) * 0.8, shoeY = cardY + 14;
    // A short screen (a phone on its side) shows the world small: the column grows.
    const f = Math.max(1, Math.min(1.35, 1.25 / (shell.k || 1)));
    const hw = Math.min(38 * f, (rx1 - rx0 - 24) / 5), hh = hw * 1.4, rowH = 30 * f, bigH = 60 * f, foldH = 30 * f;
    const total = 14 + hh + 14 + rowH + 14 + bigH + 10 + foldH;
    const y0 = top + Math.max(4, (H - top - total) / 2);
    const labelY = y0 + 6, handY = y0 + 14 + hh / 2, rowY = handY + hh / 2 + 14 + rowH / 2;
    const bigY = rowY + rowH / 2 + 14 + bigH / 2, foldY = bigY + bigH / 2 + 10 + foldH / 2;
    return { W, H, narrow, isT, top, lad, x0: lx0, x1: split, histY, cw, ch, cardX, cardY, sw, sh, shoeX, shoeY, hw, hh, handY, labelY,
      handX0: rx0, rowY, rowH, rowX0: rx0, rowX1: rx1, bigY, bigH, bigX0: rx0, bigX1: rx1, foldY, foldH, foldW: Math.min(170, (rx1 - rx0) * 0.55), foldX: (rx0 + rx1) / 2,
      potX: (cardX + shoeX) / 2, tags: true, f };
  }

  // ── The buttons: the web client's, in HTML over the felt ──────────
  // Fold, All-In and Cash out wear the table's action buttons (.btn-action:
  // the player's button theme, images included); Bet and Raise its quick-bet
  // buttons (.btn-pct); ▲ Plus haut and ▼ Plus bas are gold (narmod's pick D).
  const ui = document.createElement('div');
  ui.className = 'hl-ui';
  shell.layer.appendChild(ui);
  const DEF = { lo: 'hl-ud', hi: 'hl-ud', fold: 'btn-action btn-fold', cash: 'btn-action btn-raise', bet: 'btn-pct', raise: 'btn-pct', allin: 'btn-action btn-allin' };
  /** @type {Record<string, HTMLButtonElement>} */
  const B = {};
  for (const id of Object.keys(DEF)) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = DEF[id]; b.setAttribute('data-hl', id);
    b.innerHTML = '<b></b><small></small><i class="hl-k"></i>';
    b.addEventListener('click', (e) => { e.stopPropagation(); if (shell.paused) return; press(id); });
    ui.appendChild(b); B[id] = b;
  }
  const cache = {};
  /** Set one button: box (world px), texts, state — the DOM only when it changes. */
  function setBtn(id, o) {
    const b = B[id], k = shell.k || 1;
    const key = o ? [o.x, o.y, o.w, o.h, o.label, o.sub || '', o.key || '', !!o.off, !!o.on, !!o.focus, o.fs, k].join('|') : 'hidden';
    if (cache[id] === key) return;
    cache[id] = key;
    if (!o) { b.style.display = 'none'; return; }
    const s = b.style;
    s.display = ''; s.left = ((o.x - o.w / 2) * k) + 'px'; s.top = ((o.y - o.h / 2) * k) + 'px';
    s.width = (o.w * k) + 'px'; s.height = (o.h * k) + 'px'; s.fontSize = (o.fs * k) + 'px';
    /** @type {HTMLElement} */ (b.children[0]).textContent = o.label;
    /** @type {HTMLElement} */ (b.children[1]).textContent = o.sub || '';
    /** @type {HTMLElement} */ (b.children[1]).style.display = o.sub ? '' : 'none';
    /** @type {HTMLElement} */ (b.children[2]).textContent = o.key || '';
    b.disabled = !!o.off;
    b.classList.toggle('hl-on', !!o.on);
    b.classList.toggle('hl-focus', !!o.focus);
  }
  function layoutButtons(l) {
    const show = !onTitle() && state !== 'over';
    if (!show) { for (const id of Object.keys(B)) setBtn(id, null); return; }
    const kb = keyboardFirst(), foc = (id) => kb && state === 'guess' && G.focus === id;
    const o = odds(G.cur, G.shoe);
    const pct = (x) => Math.round((100 * x) / Math.max(1, o.n)) + ' %';
    const mHi = mult(o.hi, o.lo), mLo = mult(o.lo, o.hi);
    const off = state !== 'guess';
    // ▼ Plus bas · ▲ Plus haut.
    const bw = (l.bigX1 - l.bigX0 - 6) / 2, bfs = (l.narrow ? 12 : 15) * l.f;
    const sub = (x, m) => pct(x) + (!l.isT && m ? ' · ×' + m.toFixed(2) : '');
    setBtn('lo', { x: l.bigX0 + bw / 2, y: l.bigY, w: bw, h: l.bigH, label: '▼ ' + t('hlLower'), sub: sub(o.lo, mLo), key: kb ? '↓' : '', off: off || !mLo, fs: bfs, focus: foc('lo') });
    setBtn('hi', { x: l.bigX1 - bw / 2, y: l.bigY, w: bw, h: l.bigH, label: '▲ ' + t('hlHigher'), sub: sub(o.hi, mHi), key: kb ? '↑' : '', off: off || !mHi, fs: bfs, focus: foc('hi') });
    const ffs = (l.narrow ? 9.5 : 13) * l.f;
    if (!l.isT) {
      const x = handX(G.hand);
      setBtn('cash', { x: l.foldX, y: l.foldY, w: l.foldW, h: l.foldH, label: t('hlCash') + ' ' + fmt(Math.round(G.pot * x)) + (x > 1 ? ' (×' + x + ')' : ''),
        key: kb ? 'Space' : '', off: off || !G.potWins, fs: ffs, focus: foc('cash') });
      setBtn('fold', null); setBtn('bet', null); setBtn('raise', null); setBtn('allin', null);
      return;
    }
    const [sb, bb] = blindsAt(levelAt(G.cards));
    setBtn('cash', null);
    setBtn('fold', { x: l.foldX, y: l.foldY, w: l.foldW, h: l.foldH, label: 'Fold −' + fmt(Math.min(G.stack, sb)), key: kb ? '4' : '', off, fs: ffs, focus: foc('fold') });
    // The bets, as the table's quick bets: Bet · Raise · All-In.
    const ws = [1, 1.15, 0.95], tot = ws[0] + ws[1] + ws[2], gap = 5, avail = l.rowX1 - l.rowX0 - 2 * gap;
    let x = l.rowX0;
    [['bet', 'Bet', '1'], ['raise', 'Raise', '2'], ['allin', 'All-In', '3']].forEach(([id, name, k], i) => {
      const w = (avail * ws[i]) / tot;
      setBtn(id, { x: x + w / 2, y: l.rowY, w, h: l.rowH, label: name, sub: fmt(betAmount(id, G.stack, bb)), key: kb ? k : '', off, on: G.bet === id,
        fs: (l.narrow ? 8.5 : 10.5) * l.f, focus: foc(id) });
      x += w + gap;
    });
  }
  const order = () => (tour() ? ['bet', 'raise', 'allin', 'lo', 'hi', 'fold'] : ['lo', 'hi', 'cash']);

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'board') return;                 // the Hall of Fame's boards: their own buttons
    if (state === 'title' && a === 'duck' && hofEnabled) { openHof(); return; }
    if (state === 'title') {
      // Arrows pick a way to play, Space (or a tap on the felt) plays it.
      const step = a === 'left' ? -1 : a === 'right' || a === 'duck' ? 1 : 0;
      if (step) { sel = (sel + step + MODES.length) % MODES.length; titlePanel(); return; }
      if (a === 'jump') start(MODES[sel].id);
      return;
    }
    if (state === 'over') { if (a === 'jump') start(mode); return; }
    if (state === 'show') { if (a === 'jump') { clearTimeout(timer); state = 'guess'; G.show = null; } return; }
    if (state !== 'guess') return;
    if (info.x != null) return;            // taps go to the buttons (HTML)
    const up = a === 'jump' && (info.code === 'ArrowUp' || info.code === 'KeyW' || info.pad === 'up');
    if (up) guess(1);
    else if (a === 'duck') guess(-1);
    else if (a === 'n1' || a === 'n2' || a === 'n3') { if (tour()) press(['bet', 'raise', 'allin'][+a.slice(1) - 1]); }
    else if (a === 'n4') press('fold');
    else if (a === 'left' || a === 'right') {
      const o = order(), i = Math.max(0, o.indexOf(G.focus));
      G.focus = o[(i + (a === 'left' ? o.length - 1 : 1)) % o.length];
    } else if (a === 'jump') {
      if (info.code === 'Space') { if (!tour()) cash(); }   // Space banks the pot; Enter / pad A press the lit button
      else press(G.focus);
    }
  }
  function press(id) {
    if (id === 'hi') guess(1); else if (id === 'lo') guess(-1); else if (id === 'cash') cash(); else if (id === 'fold') fold();
    else if ((id === 'bet' || id === 'raise' || id === 'allin') && tour() && state === 'guess') { G.bet = id; sound('notifyAction'); }
  }

  function update(dt) {
    time += dt;
    if (!G) return;
    stepFloaters(G.fx, dt);
    if (G.say) { G.say.t += dt; if (G.say.t > G.say.life) G.say = null; }
    if (state !== 'over' && !onTitle()) {
      const now = performance.now();
      ace.mood(now < G.koUntil ? 'mc-m-ko' : now < G.yayUntil ? 'mc-m-yay' : G.streak >= 6 ? 'mc-m-fierce' : G.streak >= 3 ? 'mc-m-cool' : 'mc-m-smile');
      ace.pose(now < G.yayUntil ? 'wave' : G.streak >= 4 ? 'balance' : 'idle');
    }
  }

  // ── Drawing ───────────────────────────────────────────────────────
  /** A stack of chips (count from the amount), its base at (x, y). */
  function chips(g, x, y, amount, r = 9) {
    const n = Math.max(1, Math.min(12, Math.ceil(Math.log2(Math.max(2, amount / 5)))));
    for (let i = 0; i < n; i++) {
      const [c, edge] = CHIP[i % CHIP.length], yy = y - i * 3;
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x, yy + 1.5, r, r * 0.42, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = c; g.beginPath(); g.ellipse(x, yy, r, r * 0.42, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = edge; g.globalAlpha = 0.7; g.lineWidth = 1; g.setLineDash([2, 3]); g.beginPath(); g.ellipse(x, yy, r * 0.75, r * 0.3, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
    }
  }
  const RANK_LAB = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  /** The ranks' ladder (A at the top, 2 at the bottom): the card's rank in
   *  gold, higher ranks green, lower ones red; a rank with no card left in the
   *  shoe fades. On a wide stage the chances stand beside it. */
  function ladder(g, l) {
    const { x, y, w, h } = l.lad, n = 13, cell = h / n, cur = rankOf(G.cur);
    const left = new Array(15).fill(0);
    for (const c of G.shoe) left[rankOf(c)]++;
    g.save();
    rr(g, x, y, w, h, 7); g.fillStyle = 'rgba(0,0,0,.18)'; g.fill();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const r = 14 - i, cy = y + i * cell;
      if (r === cur) { rr(g, x + 1, cy + 1, w - 2, cell - 2, 4); g.fillStyle = '#f0cf7a'; g.fill(); }
      else { g.fillStyle = r > cur ? 'rgba(120,210,150,.24)' : 'rgba(232,120,100,.22)'; g.fillRect(x + 2, cy + 0.5, w - 4, cell - 1); }
      g.globalAlpha = r === cur ? 1 : left[r] ? 0.95 : 0.3;
      g.font = '700 ' + Math.min(11, cell * 0.62) + 'px Georgia, serif';
      g.fillStyle = r === cur ? '#1d222b' : '#f5f0e3';
      g.fillText(RANK_LAB[r - 2], x + w / 2, cy + cell / 2 + 0.5);
      g.globalAlpha = 1;
    }
    if (l.tags) {
      const o = odds(G.cur, G.shoe), p = (v) => Math.round((100 * v) / Math.max(1, o.n)) + ' %';
      const tag = (s, ty, hi) => {
        g.font = '700 10px Inconsolata, monospace';
        const tw = g.measureText(s).width + 10;
        rr(g, x + w + 5, ty - 8, tw, 16, 5); g.fillStyle = hi ? 'rgba(120,210,150,.32)' : 'rgba(232,120,100,.32)'; g.fill();
        g.fillStyle = '#f5f0e3'; g.textAlign = 'left'; g.fillText(s, x + w + 10, ty + 0.5);
      };
      const ci = 14 - cur;
      if (cur < 14) tag(p(o.hi), y + (ci * cell) / 2, true);
      if (cur > 2) tag(p(o.lo), y + (ci + 1) * cell + ((n - ci - 1) * cell) / 2, false);
    }
    g.restore();
  }
  /** The shoe as a neat stack of backs, the cards left on a small badge. */
  function shoeStack(g, l) {
    const x = l.shoeX, y = l.shoeY, w = l.sw, h = l.sh;
    for (let k = 4; k >= 1; k--) drawBackCard(g, img, x + k * 1.5, y - k * 1.5, w, h);
    drawBackCard(g, img, x, y, w, h);
    const bx = x + w / 2 - 4, by = y + h / 2 - 4, txt = String(G.shoe.length);
    g.save(); g.font = '700 10px Inconsolata, monospace';
    const bw = Math.max(20, g.measureText(txt).width + 10);
    rr(g, bx - bw / 2, by - 9, bw, 18, 9); g.fillStyle = 'rgba(11,18,16,.85)'; g.fill(); g.strokeStyle = 'rgba(216,178,90,.6)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = '#f5d77a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, bx, by + 0.5);
    g.restore();
  }
  function draw(g) {
    const l = L(), W = l.W;
    felt(g, W, l.H, shell.theme.light);
    if (!onTitle()) {
      ladder(g, l);
      // Cards already out, small, in a row (the last ones), after « Out ».
      g.save(); g.textAlign = 'left'; g.textBaseline = 'middle';
      g.font = '600 7.5px Inter, system-ui, sans-serif'; g.fillStyle = 'rgba(207,226,215,.85)';
      const lab = t('hlOut').toUpperCase(), lw = g.measureText(lab).width;
      g.fillText(lab, l.x0, l.histY);
      const sw = 11, sh = 15, hx0 = l.x0 + lw + 6 + sw / 2, max = Math.max(1, Math.floor((l.x1 - hx0) / (sw + 3)));
      const list = G.seen.slice(-max);
      list.forEach((n, i) => { g.save(); g.globalAlpha = 0.9; g.translate(hx0 + i * (sw + 3), l.histY); drawFace(g, img, n, sw, sh); g.restore(); });
      g.restore();
      // The card face up, and the shoe with the next one.
      g.save(); g.translate(l.cardX, l.cardY); drawFace(g, img, G.cur, l.cw, l.ch); g.restore();
      shoeStack(g, l);
      if (G.next >= 0) {
        // The next card comes out of the shoe onto the card's size, then turns.
        const p = Math.min(1, (time - G.flipAt) / 0.25);
        const nx = l.shoeX, ny = l.shoeY, nw = l.sw, nh = l.sh;
        if (p < 0.5) drawBackCard(g, img, nx, ny, nw * Math.max(0.05, 1 - 2 * p), nh);
        else { g.save(); g.translate(nx, ny); g.scale(Math.max(0.05, 2 * p - 1), 1); drawFace(g, img, G.next, nw, nh); g.restore(); }
        if (p >= 1) {
          g.save(); rr(g, nx - nw / 2 - 3, ny - nh / 2 - 3, nw + 6, nh + 6, 7);
          g.strokeStyle = G.res === 2 ? 'rgba(245,240,227,.5)' : G.res > 0 ? '#7ee2a0' : G.res < 0 ? '#ff8a80' : '#f5d77a'; g.lineWidth = 2.5; g.stroke(); g.restore();
        }
      }
      // The hand (« The hand », « Hand + tournament »).
      if (mode !== 'tourney') drawHand(g, l);
      // The pot (« The hand »), in the bets' row.
      if (!l.isT) {
        g.textAlign = 'center'; g.textBaseline = 'middle';
        const cx = (l.rowX0 + l.rowX1) / 2;
        chips(g, cx - 40, l.rowY + 5, G.pot, l.narrow ? 7 : 9);
        g.font = '600 ' + (l.narrow ? 8 : 9) + 'px Inter, system-ui, sans-serif'; g.fillStyle = 'rgba(245,240,227,.75)';
        g.fillText(t('hlPot').toUpperCase(), cx - 12, l.rowY);
        g.font = '700 ' + (l.narrow ? 15 : 18) + 'px Inconsolata, monospace'; g.fillStyle = '#f5d77a'; g.textAlign = 'left';
        g.fillText(fmt(G.pot), cx + 2, l.rowY + 1);
        if (G.streak) { g.font = '700 10px Inconsolata, monospace'; g.fillStyle = '#7ee2a0'; g.fillText('✓ ' + G.streak, cx + 44, l.rowY + 1); }
      }
      if (G.show) drawShowdown(g, l);
    }
    layoutButtons(l);
    // The Ace sits on the shoe.
    const s = l.narrow ? 0.17 : 0.24, ax = l.shoeX - 2, ay = l.shoeY - l.sh / 2 - 6;
    ace.place(ax, ay, s, shell.k);
    if (G && G.say && !onTitle()) {
      const a = G.say.t < 0.2 ? G.say.t / 0.2 : G.say.t > G.say.life - 0.4 ? Math.max(0, (G.say.life - G.say.t) / 0.4) : 1;
      bubble(g, G.say.s, Math.min(ax + 6, W - 20), ay - 212 * s - 2, W, a);
    }
    if (G) drawFloaters(g, G.fx);
  }
  function drawHand(g, l) {
    const cards = G.show ? G.show.cards : G.hand, best = G.show ? G.show.best : handOf(G.hand).best;
    const gap = l.narrow ? 4 : 6, w = l.hw, h = l.hh;
    for (let i = 0; i < HAND_SIZE; i++) {
      const x = l.handX0 + w / 2 + i * (w + gap);
      if (i < cards.length) {
        g.save(); g.translate(x, l.handY);
        if (G.show && best && best.indexOf(cards[i]) >= 0 && handOf(cards).cat >= 1) { rr(g, -w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 4); g.fillStyle = '#f5d77a'; g.fill(); }
        drawFace(g, img, cards[i], w, h); g.restore();
      } else drawPlace(g, x, l.handY, w, h);
    }
    // « Your hand · Pair ×1.2 » above the cards.
    const hd = handOf(cards), cat = Math.max(0, hd.cat);
    const val = mode === 'hand' ? '×' + HAND_X[cat] : '+' + HAND_BB[cat] + ' BB';
    const tail = cards.length >= 2 && hd.nameKey ? t(NAME_KEYS[cat]) + '  ' + val : t('hlHandHint');
    const head = t('hlYourHand').toUpperCase() + ' · ';
    g.save(); g.textAlign = 'left'; g.textBaseline = 'middle';
    const maxW = (l.narrow ? l.x1 : l.rowX1) - l.handX0;
    g.font = '600 ' + (l.narrow ? 7.5 : 9) + 'px Inter, system-ui, sans-serif';
    const hw = g.measureText(head).width;
    g.fillStyle = 'rgba(207,226,215,.85)'; g.fillText(head, l.handX0, l.labelY);
    fitFont(g, tail, maxW - hw, l.narrow ? 8.5 : 10, 700);
    g.fillStyle = cat >= 1 || cards.length < 2 ? '#f0cf7a' : 'rgba(245,240,227,.8)';
    g.fillText(tail, l.handX0 + hw, l.labelY);
    g.restore();
  }
  /** The showdown: a band over the table with the hand and what it paid. */
  function drawShowdown(g, l) {
    const a = Math.min(1, (time - G.show.t) / 0.2);
    const cat = Math.max(0, handOf(G.show.cards).cat);
    const y = l.cardY, h = 54;
    g.save(); g.globalAlpha = a;
    g.fillStyle = 'rgba(11,18,16,.86)'; g.fillRect(0, y - h / 2, l.W, h);
    g.fillStyle = '#d8b25a'; g.fillRect(0, y - h / 2, l.W, 1.5); g.fillRect(0, y + h / 2 - 1.5, l.W, 1.5);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 10px Inter, system-ui, sans-serif'; g.fillStyle = 'rgba(245,240,227,.75)';
    g.fillText(t('hlShowdown').toUpperCase(), l.W / 2, y - 16);
    fitFont(g, t(NAME_KEYS[cat]), l.W - 20, 18, 700, 'Cinzel, Georgia, serif'); g.fillStyle = cat >= 1 ? '#f5d77a' : '#f5f0e3';
    g.fillText(t(NAME_KEYS[cat]), l.W / 2, y + 1);
    g.font = '700 12px Inconsolata, monospace'; g.fillStyle = '#7ee2a0';
    g.fillText(G.show.line, l.W / 2, y + 18);
    g.restore();
  }

  return {
    update, draw, input, resize: renderResult,
    calm: true,          // painted only when its drawing changes (calm.mjs, web.110)
    running: () => state === 'guess' || state === 'flip' || state === 'show',
    destroy() { clearTimeout(timer); ace.remove(); ui.remove(); },
  };
}

function ensureCss() {
  if (document.getElementById('pth-game-hl-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-hl-css';
  st.textContent = '#pth-game .hl-box{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 18px;border-radius:12px;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .hl-box h2{color:#f5d77a}#pth-game .hl-lives{color:#ff8a80;letter-spacing:2px}'
    + '#pth-game.pg-light .hl-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .hl-box h2{color:#8a6510}#pth-game.pg-light .hl-box .ar-final{color:#1d222b}'
    // The buttons (web.51): the table's, positioned over the felt.
    + '#pth-game .hl-ui{position:absolute;inset:0;pointer-events:none}'
    + '#pth-game .hl-ui button{position:absolute;pointer-events:auto;box-sizing:border-box;margin:0;display:flex;flex-direction:column;align-items:center;'
    + 'justify-content:center;gap:.12em;line-height:1.05;white-space:nowrap;overflow:hidden;min-height:0;min-width:0;cursor:pointer;-webkit-tap-highlight-color:transparent}'
    + '#pth-game .hl-ui button b{font-weight:800}#pth-game .hl-ui button small{font:700 .72em/1 Inconsolata,monospace;opacity:.9}'
    + '#pth-game .hl-ui .hl-k{position:absolute;right:.45em;top:.3em;font:600 .55em/1 Inconsolata,monospace;font-style:normal;opacity:.6}'
    + '#pth-game .hl-ui .hl-ud{border-radius:9px;border:1.5px solid #ffe39a;background:linear-gradient(180deg,#f2cf6a,#b8862a);color:#3a2a06;'
    + 'font-family:Inter,system-ui,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.3);text-shadow:0 1px 0 rgba(255,255,255,.25);padding:0 .4em}'
    + '#pth-game .hl-ui .hl-ud:hover{filter:brightness(1.06)}#pth-game .hl-ui button:active{transform:scale(.97)}'
    + '#pth-game .hl-ui .hl-ud:disabled{opacity:.35;filter:grayscale(.6);cursor:default}'
    + '#pth-game .hl-ui .btn-action{padding:0 .5em;letter-spacing:.04em}'
    + ':root[data-btn-img] #pth-game .hl-ui .btn-action{padding:0 2px !important;border-width:6px;border-image-width:6px}'
    + '#pth-game .hl-ui .btn-pct small,#pth-game .hl-ui .btn-allin small{font-size:.9em;opacity:1}'
    + '#pth-game .hl-ui .btn-pct{padding:0 .3em;font-family:Inter,system-ui,sans-serif}'
    + '#pth-game .hl-ui .btn-pct.hl-on{background:#2e7d32;box-shadow:0 0 0 2px #7ad06a}'
    + '#pth-game .hl-ui .btn-allin.hl-on{box-shadow:0 0 0 2px #ffd36a}'
    + '#pth-game .hl-ui .btn-pct:disabled,#pth-game .hl-ui .btn-action:disabled{pointer-events:none}'
    + '#pth-game .hl-ui .hl-focus{outline:2px solid #fff;outline-offset:2px}';
  document.head.appendChild(st);
}
