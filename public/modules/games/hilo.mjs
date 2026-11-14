// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Higher or Lower — hidden mini-game (web extension, narmod 2026-10-16), in
// the arcade behind the training nickname « mascot ». Three ways to play
// since web.44 (narmod 2026-11-14: « more like poker »), at a poker table:
// the Ace deals from a wooden shoe, chips instead of a bare number, the
// actions of the table (Bet, Raise, All-In, Fold) and the showdown.
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
// Keys: ↑ higher, ↓ lower; hand: Space cash out; tournament: 1 2 3 the bet,
// 4 Fold; ←/→ move between the buttons (Enter or pad A presses the one lit).
// Secret trophy « Higher or Lower »: TROPHY_STREAK right guesses in a row.
// ═══════════════════════════════════════════════════════════════════

import { rankOf, evalCards, NAME_KEYS } from './poker-hand.mjs';
import { shuffled } from './deal.mjs';
import { fmt, imageCache, rr, drawFace, aceActor, CHIP } from './common.mjs';
import { felt, drawBackCard, drawPlace, buttons, bubble, drawFloaters, stepFloaters, keyboardFirst, fitFont } from './ui.mjs';

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
  const btns = buttons();
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
    const tile = (m, i) => {
      const b = best[m.id] || {};
      const rec = m.id === 'hand' ? (shell.best.get() ? esc(t('arRecord', { n: fmt(shell.best.get()) })) : '')
        : (b.best ? esc(t('arRecord', { n: fmt(b.best) })) : '') + (b.level ? (b.best ? ' · ' : '') + esc(t('wwLevel', { n: b.level })) : '');
      return '<button type="button" class="gm-tile' + (i === sel ? ' on' : '') + '" data-m="' + i + '"><i>' + m.icon + '</i><b>'
        + esc(t(m.key)) + '</b><small>' + esc(t(m.desc)) + '</small><small class="hl-rec">' + (rec || '&nbsp;') + '</small></button>';
    };
    shell.panel('<h2>' + esc(t('hlName')) + '</h2><p>' + esc(t('hlHint')) + '</p><div class="gm-tiles">' + MODES.map(tile).join('') + '</div>');
    shell.root.querySelectorAll('.pg-panel .gm-tile').forEach((b) => {
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', () => { sel = +(b.getAttribute('data-m') || 0); start(MODES[sel].id); });
    });
  }
  newGame();
  titlePanel();
  try { if (navigator.webdriver) window.__pthHL = { run: () => G, state: () => state, mode: () => mode, start: (m) => start(m) }; } catch (e) {}

  function start(m) {
    clearTimeout(timer);
    mode = m || MODES[sel].id;
    sel = Math.max(0, MODES.findIndex((x) => x.id === mode));
    newGame();
    buildHud(); renderHud();
    state = 'guess'; shell.panel(null);
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
  function renderResult() {
    if (state !== 'over' || !G.result) return;
    const { score, record, prev, level } = G.result;
    const head = tour() ? (G.out ? t('hlBust') : t('hlDone')) : fmt(score);
    const line = tour()
      ? (G.out ? esc(t('wwLevel', { n: level })) : esc(t('hlStack')) + ' <em>' + fmt(score) + '</em>') + ' · ×' + fmt(G.bestStreak)
      : esc(t('hlPot')) + ' ' + fmt(G.bestPot) + ' · <em>×' + fmt(G.bestStreak) + '</em>';
    shell.panel('<div class="hl-box"><h2>' + esc(head) + '</h2>'
      + '<p class="ar-final">' + line + '</p>'
      + '<p class="pg-dim">' + esc(record && prev ? t('arNewRecord') : t('arRecord', { n: fmt(Math.max(score, prev)) })) + '</p>'
      + '<p class="pg-blink">' + esc(t('gmAgain')) + '</p></div>', true);
  }

  // ── Layout (world px) ─────────────────────────────────────────────
  function L() {
    const W = shell.W, H = shell.H;
    let top = 46;
    try { top = Math.max(40, shell.hud.offsetHeight / (shell.k || 1) + 6); } catch (e) {}
    const narrow = W < 430, isT = tour();
    const btnH = narrow ? 34 : 36, gap = 6;
    const rows = isT ? (narrow ? 3 : 2) : narrow ? 2 : 1;
    const btnTop = H - 8 - rows * btnH - (rows - 1) * gap;
    const rowY = (r) => btnTop + btnH / 2 + r * (btnH + gap);
    const histY = top + 12;
    // The hand: five small places above the buttons, its name under them.
    const sw = narrow ? Math.min(38, (W - 60) / 5 - 6) : 36, sh = sw * 1.4;
    const handY = btnTop - 22 - sh / 2;
    // On a phone the pot (or the bet) sits under the cards; on a wide screen, beside the shoe.
    const zoneTop = histY + 24, zoneBot = handY - sh / 2 - (narrow ? 34 : 12);
    let cw = narrow ? Math.min(78, W * 0.3) : 84, ch = cw * 1.4;
    if (ch > zoneBot - zoneTop) { ch = Math.max(60, zoneBot - zoneTop); cw = ch / 1.4; }
    const cardY = (zoneTop + zoneBot) / 2;
    const potY = narrow ? cardY + ch / 2 + 18 : cardY - 8;
    const potX = narrow ? W / 2 : Math.min(W - 60, W / 2 + cw * 0.65 + cw / 2 + 74);
    const tableY = (histY + handY + sh / 2) / 2 + 6, tableRy = (handY + sh / 2 + 16 - histY) / 2, tableRx = Math.min(W / 2 - 8, Math.max(cw * 2.4, W * 0.42));
    return { W, H, narrow, isT, top, cw, ch, histY, cardX: W / 2 - cw * 0.65, shoeX: W / 2 + cw * 0.65, cardY, potX, potY,
      btnH, rowY, sw, sh, handY, tableY, tableRx, tableRy };
  }
  function layoutButtons(l) {
    btns.reset();
    if (state === 'title' || state === 'over') return;
    const o = odds(G.cur, G.shoe);
    const pct = (x) => Math.round((100 * x) / Math.max(1, o.n)) + '%';
    const mHi = mult(o.hi, o.lo), mLo = mult(o.lo, o.hi);
    const off = state !== 'guess';
    if (!l.isT) {
      const lab = (k, x, m) => t(k) + '  ' + pct(x) + (m ? ' ×' + m.toFixed(2) : '');
      const x = handX(G.hand), cashLab = t('hlCash') + ' ' + fmt(Math.round(G.pot * x)) + (x > 1 ? ' (×' + x + ')' : '');
      if (l.narrow) {
        const w = (l.W - 24) / 2;
        btns.add({ id: 'hi', x: 8 + w / 2, y: l.rowY(0), w, h: l.btnH, label: '▲ ' + lab('hlHigher', o.hi, mHi), key: '↑', off: off || !mHi });
        btns.add({ id: 'lo', x: l.W - 8 - w / 2, y: l.rowY(0), w, h: l.btnH, label: '▼ ' + lab('hlLower', o.lo, mLo), key: '↓', off: off || !mLo });
        btns.add({ id: 'cash', x: l.W / 2, y: l.rowY(1), w: l.W - 16, h: l.btnH, label: cashLab, kind: 'ghost', key: 'Space', off: off || !G.potWins });
      } else {
        const w = Math.min(190, (l.W - 48) / 3);
        btns.add({ id: 'hi', x: l.W / 2 - w - 10, y: l.rowY(0), w, h: l.btnH, label: '▲ ' + lab('hlHigher', o.hi, mHi), key: '↑', off: off || !mHi });
        btns.add({ id: 'cash', x: l.W / 2, y: l.rowY(0), w, h: l.btnH, label: cashLab, kind: 'ghost', key: 'Space', off: off || !G.potWins });
        btns.add({ id: 'lo', x: l.W / 2 + w + 10, y: l.rowY(0), w, h: l.btnH, label: '▼ ' + lab('hlLower', o.lo, mLo), key: '↓', off: off || !mLo });
      }
      return;
    }
    // The tournament: the bet, then higher / lower, or Fold.
    const [sb, bb] = blindsAt(levelAt(G.cards));
    const bets = [['bet', 'Bet', '1'], ['raise', 'Raise', '2'], ['allin', 'All-In', '3']];
    const bw = Math.min(150, (l.W - 32) / 3);
    bets.forEach(([id, name, k], i) => btns.add({ id, x: l.W / 2 + (i - 1) * (bw + 8), y: l.rowY(0), w: bw, h: l.btnH,
      label: name + ' ' + fmt(betAmount(id, G.stack, bb)), kind: G.bet === id ? (id === 'allin' ? 'red' : 'gold') : 'ghost', key: k, off }));
    const lab = (k, x) => t(k) + '  ' + pct(x);
    const foldLab = 'Fold −' + fmt(Math.min(G.stack, sb));
    if (l.narrow) {
      const w = (l.W - 24) / 2;
      btns.add({ id: 'hi', x: 8 + w / 2, y: l.rowY(1), w, h: l.btnH, label: '▲ ' + lab('hlHigher', o.hi), key: '↑', off: off || !mHi });
      btns.add({ id: 'lo', x: l.W - 8 - w / 2, y: l.rowY(1), w, h: l.btnH, label: '▼ ' + lab('hlLower', o.lo), key: '↓', off: off || !mLo });
      btns.add({ id: 'fold', x: l.W / 2, y: l.rowY(2), w: l.W - 16, h: l.btnH, label: foldLab, kind: 'ghost', key: '4', off });
    } else {
      const w = Math.min(190, (l.W - 48) / 3);
      btns.add({ id: 'hi', x: l.W / 2 - w - 10, y: l.rowY(1), w, h: l.btnH, label: '▲ ' + lab('hlHigher', o.hi), key: '↑', off: off || !mHi });
      btns.add({ id: 'fold', x: l.W / 2, y: l.rowY(1), w, h: l.btnH, label: foldLab, kind: 'ghost', key: '4', off });
      btns.add({ id: 'lo', x: l.W / 2 + w + 10, y: l.rowY(1), w, h: l.btnH, label: '▼ ' + lab('hlLower', o.lo), key: '↓', off: off || !mLo });
    }
  }
  const order = () => (tour() ? ['bet', 'raise', 'allin', 'hi', 'fold', 'lo'] : ['hi', 'cash', 'lo']);

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'title') {
      // Arrows pick a way to play, Space (or a tap on the felt) plays it.
      const step = a === 'left' ? -1 : a === 'right' || a === 'duck' ? 1 : 0;
      if (step) { sel = (sel + step + MODES.length) % MODES.length; titlePanel(); return; }
      if (a === 'jump') start(MODES[sel].id);
      return;
    }
    if (state === 'over') { if (a === 'jump') { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); titlePanel(); } return; }
    if (state === 'show') { if (a === 'jump') { clearTimeout(timer); state = 'guess'; G.show = null; } return; }
    if (state !== 'guess') return;
    const l = L();
    layoutButtons(l);
    if (info.x != null) { const b = btns.hit(info.x, info.y); if (b) press(b); return; }
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
    if (state !== 'over' && state !== 'title') {
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
  /** The poker table: an oval of lighter felt in a wooden rail. */
  function table(g, l) {
    g.save();
    g.beginPath(); g.ellipse(l.W / 2, l.tableY, l.tableRx + 9, l.tableRy + 9, 0, 0, Math.PI * 2);
    const rail = g.createLinearGradient(0, l.tableY - l.tableRy, 0, l.tableY + l.tableRy); rail.addColorStop(0, '#6b4528'); rail.addColorStop(1, '#3e2614');
    g.fillStyle = rail; g.fill();
    g.beginPath(); g.ellipse(l.W / 2, l.tableY, l.tableRx, l.tableRy, 0, 0, Math.PI * 2);
    const f = g.createRadialGradient(l.W / 2, l.tableY, 10, l.W / 2, l.tableY, Math.max(l.tableRx, l.tableRy));
    f.addColorStop(0, shell.theme.light ? '#48a876' : '#2c8a5a'); f.addColorStop(1, shell.theme.light ? '#2a7a52' : '#17573a');
    g.fillStyle = f; g.fill();
    g.strokeStyle = 'rgba(216,178,90,.45)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(l.W / 2, l.tableY, l.tableRx - 8, l.tableRy - 8, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  /** The dealer's shoe: a wooden box, the backs of the cards peeking out. */
  function shoeBox(g, l) {
    const x = l.shoeX, y = l.cardY, w = l.cw, h = l.ch;
    for (let k = 3; k >= 1; k--) drawBackCard(g, img, x + k * 2, y - k * 2, w, h);
    g.save();
    const by = y + h * 0.3, bh = h * 0.24;
    const wood = g.createLinearGradient(0, by, 0, by + bh); wood.addColorStop(0, '#6b4528'); wood.addColorStop(1, '#3e2614');
    g.fillStyle = wood; rr(g, x - w / 2 - 5, by, w + 14, bh, 5); g.fill();
    g.strokeStyle = 'rgba(216,178,90,.5)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = 'rgba(245,240,227,.8)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 ' + Math.round(Math.max(9, w * 0.12)) + 'px Inconsolata, monospace';
    g.fillText(String(G.shoe.length), x + 2, by + bh / 2 + 1);
    g.restore();
  }
  function draw(g) {
    const l = L(), W = l.W, H = l.H;
    felt(g, W, H, shell.theme.light);
    if (state !== 'title') {
      table(g, l);
      // Cards already out, small, in a row (the last ones).
      const sw = 16, sh = 22, max = Math.max(4, Math.floor((W - 24) / (sw + 3)));
      const list = G.seen.slice(-max);
      const x0 = W / 2 - ((list.length - 1) * (sw + 3)) / 2;
      list.forEach((n, i) => { g.save(); g.globalAlpha = 0.85; g.translate(x0 + i * (sw + 3), l.histY + sh / 2); drawFace(g, img, n, sw, sh); g.restore(); });
      // The card face up, and the shoe with the next one.
      g.save(); g.translate(l.cardX, l.cardY); drawFace(g, img, G.cur, l.cw, l.ch); g.restore();
      shoeBox(g, l);
      if (G.next >= 0) {
        const p = Math.min(1, (time - G.flipAt) / 0.25);
        g.save(); g.translate(l.shoeX, l.cardY); g.scale(Math.max(0.05, Math.abs(1 - 2 * p)), 1);
        if (p < 0.5) { g.restore(); drawBackCard(g, img, l.shoeX, l.cardY, l.cw * Math.max(0.05, 1 - 2 * p), l.ch); }
        else { drawFace(g, img, G.next, l.cw, l.ch); g.restore(); }
        if (p >= 1) {
          g.save(); rr(g, l.shoeX - l.cw / 2 - 3, l.cardY - l.ch / 2 - 3, l.cw + 6, l.ch + 6, 7);
          g.strokeStyle = G.res === 2 ? 'rgba(245,240,227,.5)' : G.res > 0 ? '#7ee2a0' : G.res < 0 ? '#ff8a80' : '#f5d77a'; g.lineWidth = 2.5; g.stroke(); g.restore();
        }
      }
      // The pot (« The hand ») or the bet (tournament), in chips.
      g.textAlign = 'center'; g.textBaseline = 'middle';
      const amount = l.isT ? betAmount(G.bet, G.stack, blindsAt(levelAt(G.cards))[1]) : G.pot;
      chips(g, l.potX - 38, l.potY + 12, amount);
      g.font = '600 10px Inter, system-ui, sans-serif'; g.fillStyle = 'rgba(245,240,227,.75)';
      g.fillText((l.isT ? G.bet === 'allin' ? 'All-In' : G.bet === 'raise' ? 'Raise' : 'Bet' : t('hlPot')).toUpperCase(), l.potX, l.potY - 2);
      g.font = '700 18px Inconsolata, monospace'; g.fillStyle = '#f5d77a';
      g.fillText(fmt(amount), l.potX, l.potY + 13);
      if (G.streak) { g.font = '700 10px Inconsolata, monospace'; g.fillStyle = '#7ee2a0'; g.fillText('✓ ' + G.streak, l.potX + 44, l.potY + 13); }
      // The hand: five places, the cards, its name.
      if (mode !== 'tourney') drawHand(g, l);
      layoutButtons(l);
      btns.draw(g, keyboardFirst(), keyboardFirst() && state === 'guess' ? G.focus : null);
      if (G.show) drawShowdown(g, l);
    }
    const ax = l.narrow ? 18 : Math.max(26, l.cardX - l.cw / 2 - 34), ay = l.narrow ? l.cardY + l.ch / 2 : l.cardY + l.ch / 2, s = l.narrow ? 0.17 : 0.28;
    ace.place(ax, ay, s, shell.k);
    if (G && G.say && state !== 'title') {
      const a = G.say.t < 0.2 ? G.say.t / 0.2 : G.say.t > G.say.life - 0.4 ? Math.max(0, (G.say.life - G.say.t) / 0.4) : 1;
      bubble(g, G.say.s, Math.min(ax + 6, W - 20), ay - 212 * s - 2, W, a);
    }
    if (G) drawFloaters(g, G.fx);
  }
  function drawHand(g, l) {
    const cards = G.show ? G.show.cards : G.hand, best = G.show ? G.show.best : handOf(G.hand).best;
    const gap = 6, x0 = l.W / 2 - (2 * (l.sw + gap));
    for (let i = 0; i < HAND_SIZE; i++) {
      const x = x0 + i * (l.sw + gap);
      if (i < cards.length) {
        g.save(); g.translate(x, l.handY);
        if (G.show && best && best.indexOf(cards[i]) >= 0 && handOf(cards).cat >= 1) { rr(g, -l.sw / 2 - 2, -l.sh / 2 - 2, l.sw + 4, l.sh + 4, 4); g.fillStyle = '#f5d77a'; g.fill(); }
        drawFace(g, img, cards[i], l.sw, l.sh); g.restore();
      } else drawPlace(g, x, l.handY, l.sw, l.sh);
    }
    const h = handOf(cards), cat = Math.max(0, h.cat);
    const val = mode === 'hand' ? '×' + HAND_X[cat] : '+' + HAND_BB[cat] + ' BB';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '600 11px Inter, system-ui, sans-serif'; g.fillStyle = cat >= 1 ? '#f5d77a' : 'rgba(245,240,227,.7)';
    const name = cards.length >= 2 && h.nameKey ? t(NAME_KEYS[cat]) : t('hlHandHint');
    fitFont(g, name + (cards.length >= 2 ? '  ' + val : ''), l.W - 24, 11, 600);
    g.fillText(name + (cards.length >= 2 ? '  ' + val : ''), l.W / 2, l.handY + l.sh / 2 + 11);
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
    running: () => state === 'guess' || state === 'flip' || state === 'show',
    destroy() { clearTimeout(timer); ace.remove(); },
  };
}

function ensureCss() {
  if (document.getElementById('pth-game-hl-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-hl-css';
  st.textContent = '#pth-game .hl-box{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 18px;border-radius:12px;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .hl-box h2{color:#f5d77a}#pth-game .hl-lives{color:#ff8a80;letter-spacing:2px}'
    + '#pth-game .gm-tile .hl-rec{color:#d8b25a}#pth-game.pg-light .gm-tile .hl-rec{color:#8a6a10}'
    + '#pth-game.pg-light .hl-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .hl-box h2{color:#8a6510}#pth-game.pg-light .hl-box .ar-final{color:#1d222b}';
  document.head.appendChild(st);
}
