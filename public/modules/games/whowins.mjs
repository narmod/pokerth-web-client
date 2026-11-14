// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Who Wins? — hidden mini-game (web extension, narmod 2026-10-16), in the
// arcade behind the training nickname « mascot ». Reading hands at speed.
//
// A Texas Hold'em showdown: a board of five cards and two hands of two.
// Tap the hand that wins — or « Split » when both make the same best five
// (poker-hand.mjs rankHand / compareHands, kickers included) — before the
// bar runs out. Then both hands are named, the winning five cards lit.
//   Points   10 + 2 per second left, +5 from the third right answer in a row
//   Clock    TIME_MAX s at first, shorter with every right answer (TIME_MIN)
//   Hearts   LIVES; a wrong answer or a timeout costs one
//   Deals    harder as you go: more and more showdowns between two hands of
//            the same kind (pair against pair, flush against flush…), and
//            now and then a split pot
// Keys: ← left hand, → right hand, ↓ Split; Space goes on after an answer.
//
// The modes (web.32, narmod 2026-11-14): the title shows the ways to play.
//   ♾️ Endless — LIVES hearts; every LEVEL_EVERY right answers the next level,
//      following the learning (LEVELS): pairs and high card, flushes and
//      straights, kickers, traps, split pots, then the Ace's mix (faster).
//   📺 The TV show (web.33) — 15 questions up the LADDER, 100 to a million
//      chips, harder as it climbs (TV_LEVEL); one mistake ends the show but
//      questions 5 and 10 are safe levels (SAFE: you leave with them); the
//      clock is TV_EXTRA s longer. Three jokers, once each (buttons, keys
//      1 2 3): 50/50 takes a wrong answer away, the Ace's help names both
//      hands, +5 s.
// (The Daily challenge comes next.) Secret trophy « Who Wins? »: the million.
//
// The show (web.30, narmod 2026-11-14): the hands are dealt face up and the
// board is turned over like on TV — the flop, the turn, the river — then the
// clock starts (a tap during the deal turns the rest over at once). The pot
// in the middle goes to the winning hand (half to each on a split), it grows
// with the streak; a wrong answer shakes the table. From FEVER_STREAK right
// answers in a row: « Fever », the board glows gold and points count double.
// « Reduce animations »: the board is shown at once, no shaking.
// ═══════════════════════════════════════════════════════════════════

import { rankHand, compareHands, NAME_KEYS, rankOf } from './poker-hand.mjs';
import { shuffled } from './deal.mjs';
import { fmt, imageCache, rr, drawFace, aceActor, CHIP } from './common.mjs';
import { felt, buttons, bubble, drawFloaters, stepFloaters, keyboardFirst, fitFont, drawBackCard } from './ui.mjs';

export const LIVES = 3, TIME_MAX = 9, TIME_MIN = 3.5, FEVER_STREAK = 5, LEVEL_EVERY = 5;
// The board turned over (s after the deal): the three flop cards, the turn,
// the river; each card turns in FLIP s.
export const FLIP = 0.28, REVEAL = [0.25, 0.37, 0.49, 1.15, 1.85];
export const REVEAL_END = REVEAL[4] + FLIP;
/** A right answer's points: speed, the streak bonus, doubled in Fever. */
export function points(tLeft, streak) {
  const p = 10 + 2 * Math.ceil(Math.max(0, tLeft)) + (streak >= 3 ? 5 : 0);
  return streak >= FEVER_STREAK ? 2 * p : p;
}

/**
 * A showdown for `level` (0, 1, 2…): { board, a, b, ra, rb, win } — win 1
 * (left), -1 (right) or 0 (split). rnd: the random source (tests seed it).
 */
// ── A random showdown, what makes it tricky ───────────────────────
/** Nine cards: { board, a, b, ra, rb, win } — win 1 (left), -1 (right), 0 (split). */
export function dealOnce(rnd = Math.random) {
  const d = shuffled(rnd);
  const board = d.slice(0, 5), a = d.slice(5, 7), b = d.slice(7, 9);
  const ra = rankHand(a.concat(board)), rb = rankHand(b.concat(board));
  const c = compareHands(ra, rb);
  return { board, a, b, ra, rb, win: c > 0 ? 1 : c < 0 ? -1 : 0 };
}
// Cards that make a category before the kickers (pair 2, two pair 4…).
const MADE = { 1: 2, 2: 4, 3: 3, 7: 4 };
/**
 * What makes a showdown tricky, or null:
 *   'board'        a split where the board itself is the best hand
 *   'counterfeit'  a pocket pair that does not play (the board's two pairs are higher)
 *   'wheel'        a straight A-2-3-4-5: the ace plays low
 *   'flush'        flush against flush: the highest card of the suit decides
 *   'kicker'       the same pair / two pair / trips / quads: the kicker decides
 *   'five'         a split although the hole cards differ: only five cards count
 */
export function trapOf(q) {
  const onBoard = (r) => r.best.every((c) => q.board.indexOf(c) >= 0);
  if (q.win === 0 && onBoard(q.ra) && onBoard(q.rb)) return 'board';
  const cf = (h, r) => rankOf(h[0]) === rankOf(h[1]) && r.cat === 2 && h.every((c) => r.best.indexOf(c) < 0);
  if (cf(q.a, q.ra) || cf(q.b, q.rb)) return 'counterfeit';
  if ((q.ra.cat === 4 && q.ra.tb[0] === 5) || (q.rb.cat === 4 && q.rb.tb[0] === 5)) return 'wheel';
  if (q.ra.cat === 5 && q.rb.cat === 5 && q.win !== 0) return 'flush';
  if (q.ra.cat === q.rb.cat && MADE[q.ra.cat] && q.win !== 0) {
    let d = 0;
    while (d < 5 && q.ra.tb[d] === q.rb.tb[d]) d++;
    if (d >= MADE[q.ra.cat]) return 'kicker';
  }
  if (q.win === 0 && (rankOf(q.a[0]) + rankOf(q.a[1]) !== rankOf(q.b[0]) + rankOf(q.b[1]))) return 'five';
  return null;
}
/** The first of `tries` deals that `ok` accepts, else the last one. */
function find(rnd, ok, tries) {
  let q = null;
  for (let i = 0; i < tries; i++) { q = dealOnce(rnd); if (ok(q)) return q; }
  return q;
}
const TRAPS = ['counterfeit', 'wheel', 'flush', 'kicker', 'board'];
// The six levels: their deals and their clock (s).
export const LEVELS = [
  { key: 'wwT1', time: 9, deal: (rnd) => find(rnd, (q) => q.win !== 0 && q.ra.cat <= 2 && q.rb.cat <= 2, 400) },
  { key: 'wwT2', time: 9, deal: (rnd) => find(rnd, (q) => q.win !== 0 && (q.ra.cat === 4 || q.ra.cat === 5 || q.rb.cat === 4 || q.rb.cat === 5), 1500) },
  { key: 'wwT3', time: 8, deal: (rnd) => (rnd() < 0.65 ? find(rnd, (q) => trapOf(q) === 'kicker', 2000) : find(rnd, (q) => q.win !== 0 && q.ra.cat === q.rb.cat, 400)) },
  { key: 'wwT4', time: 8, deal: (rnd) => { const want = TRAPS[Math.floor(rnd() * TRAPS.length)]; return find(rnd, (q) => trapOf(q) === want, 6000); } },
  { key: 'wwT5', time: 8, deal: (rnd) => (rnd() < 0.5 ? find(rnd, (q) => q.win === 0, 3000) : find(rnd, (q) => q.win !== 0 && q.ra.cat === q.rb.cat, 400)) },
  { key: 'wwT6', time: 5, deal: (rnd) => LEVELS[Math.floor(rnd() * 5)].deal(rnd) },
];
/** The level reached after `right` right answers. */
export const levelOf = (right) => Math.min(LEVELS.length - 1, Math.floor(right / LEVEL_EVERY));
// The ways to play, on the title (the Daily challenge comes next).
export const MODES = [
  { id: 'tv', icon: '📺', key: 'wwModeTv', desc: 'wwModeTvD' },
  { id: 'endless', icon: '♾️', key: 'wwModeEndless', desc: 'wwModeEndlessD' },
];
// The TV show: the chips of each question, its safe levels (indexes), the
// level each question is dealt from, the extra seconds on its clock.
export const LADDER = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
export const SAFE = [4, 9];
export const TV_LEVEL = [0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5];
export const TV_EXTRA = 3;
/** The chips you leave with after k right answers then a mistake (the last safe level passed). */
export function keptAfter(k) { let v = 0; for (const i of SAFE) if (k > i) v = LADDER[i]; return v; }
/** The 50/50 joker: one of the two wrong answers (1 left, -1 right, 0 split), taken away. */
export function fiftyOut(win, rnd = Math.random) { const wrong = [1, -1, 0].filter((x) => x !== win); return wrong[Math.floor(rnd() * 2) % 2]; }
// Best level reached per mode, on this device.
const BEST_KEY = 'pth_ww_best';
function loadBest() { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') || {}; } catch (e) { return {}; } }
function saveBest(b) { try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch (e) {} }
export function makeDeal(level, rnd = Math.random) {
  const wantSame = rnd() < Math.min(0.75, 0.15 + 0.12 * level);
  const wantSplit = level >= 2 && rnd() < 0.1;
  let best = null;
  for (let i = 0; i < (wantSplit ? 400 : 60); i++) {
    const d = shuffled(rnd);
    const board = d.slice(0, 5), a = d.slice(5, 7), b = d.slice(7, 9);
    const ra = rankHand(a.concat(board)), rb = rankHand(b.concat(board));
    const c = compareHands(ra, rb);
    const deal = { board, a, b, ra, rb, win: c > 0 ? 1 : c < 0 ? -1 : 0 };
    if (!best) best = deal;
    if (wantSplit) { if (deal.win === 0) return deal; continue; }
    if (deal.win === 0 && level < 2) continue;            // no split pot before the third level
    if (wantSame === (ra.cat === rb.cat)) return deal;
    best = deal;
  }
  return best;
}

export function create(shell) {
  const { t, esc, sound } = shell;
  const img = imageCache();
  const ace = aceActor(shell.layer);
  const btns = buttons();
  shell.touchPad(false);
  shell.hud.classList.add('on-felt');
  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('hcScore')) + '</div><div class="ar-num ww-score">0</div></div>'
    + '<div><div class="ar-lab ww-tlab">&nbsp;</div><div class="ar-num ww-prog"></div></div>'
    + '<div><div class="ar-lab">&nbsp;</div><div class="ar-num ww-lives"></div></div></div>'
    + '<div class="ar-hand"><div class="ar-name ww-streak"></div></div>';
  const hScore = /** @type {HTMLElement} */ (shell.hud.querySelector('.ww-score'));
  const hLives = /** @type {HTMLElement} */ (shell.hud.querySelector('.ww-lives'));
  const hStreak = /** @type {HTMLElement} */ (shell.hud.querySelector('.ww-streak'));
  const hTab = /** @type {HTMLElement} */ (shell.hud.querySelector('.ww-tlab'));
  const hProg = /** @type {HTMLElement} */ (shell.hud.querySelector('.ww-prog'));
  ensureCss();

  let state = 'title', G = null, time = 0, timer = 0;
  let mode = 'tv';                // the way of playing
  let sel = 0;                    // the mode picked on the title (keys)
  function newGame() {
    G = { score: 0, lives: LIVES, right: 0, n: 0, level: 0, streak: 0, bestStreak: 0, q: null, tMax: TIME_MAX, tLeft: TIME_MAX, answer: null, ok: false,
      fx: [], say: null, yayUntil: 0, koUntil: 0, shown: 0, dealT: 0, snd: 0, pot: 3, fly: null, shake: 0,
      won: 0, jok: { j50: true, jace: true, jtime: true }, out: null, hint: false };
    renderHud();
  }
  const tv = () => mode === 'tv';
  function renderHud() {
    const play = state !== 'title';
    hScore.textContent = fmt(tv() ? G.won : G.score);
    hTab.textContent = !play ? '\u00a0' : tv() ? t('wwQLab') : t('wwLevelLab');
    hProg.textContent = !play ? '' : tv() ? Math.min(G.right + 1, LADDER.length) + '/' + LADDER.length : String(G.level + 1);
    hLives.textContent = tv() ? '' : '❤'.repeat(Math.max(0, G.lives)) + '♡'.repeat(Math.max(0, LIVES - G.lives));
    const fever = !tv() && G.streak >= FEVER_STREAK;
    hStreak.textContent = fever ? '🔥 ' + t('wwFever') : G.streak >= 2 ? '×' + G.streak : '';
    hStreak.classList.toggle('ww-fever', fever);
  }
  const say = (s, life = 1.8) => { G.say = { s, t: 0, life }; };
  const levelName = (lv) => t('wwLevel', { n: lv + 1 }) + ' · ' + t(LEVELS[lv].key);

  /** The title: the ways to play, their records. */
  function titlePanel() {
    const best = loadBest();
    const tile = (m, i) => {
      const b = best[m.id] || {};
      const rec = m.id === 'endless' ? (shell.best.get() ? esc(t('arRecord', { n: fmt(shell.best.get()) })) + (b.level ? ' · ' + esc(t('wwLevel', { n: b.level })) : '') : '')
        : m.id === 'tv' ? (b.best ? esc(t('arRecord', { n: fmt(b.best) })) : '') : '';
      return '<button type="button" class="ww-tab' + (i === sel ? ' on' : '') + '" data-m="' + i + '">'
        + '<span class="ww-ic" aria-hidden="true">' + m.icon + '</span><b>' + esc(t(m.key)) + '</b>'
        + '<small class="ww-sub">' + esc(t(m.desc)) + '</small>'
        + '<small class="ww-rec">' + (rec || '&nbsp;') + '</small></button>';
    };
    shell.panel('<div class="ww-pick"><h2>' + esc(t('wwName')) + '</h2><p>' + esc(t('wwHint')) + '</p>'
      + '<div class="ww-tabs ww-modes">' + MODES.map(tile).join('') + '</div>'
      + '<p class="pg-blink">' + esc(t('arTapStart')) + '</p></div>');
    shell.root.querySelectorAll('.pg-panel .ww-tab').forEach((b) => {
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', () => { sel = +(b.getAttribute('data-m') || 0); start(MODES[sel].id); });
    });
  }
  newGame();
  titlePanel();
  try { if (navigator.webdriver) window.__pthWW = { run: () => G, state: () => state, mode: () => mode, start: (m) => start(m) }; } catch (e) {}

  function start(m) {
    clearTimeout(timer);
    mode = m || MODES[sel].id;
    newGame();
    state = 'ask'; shell.panel(null);
    ace.pose('idle'); ace.mood('mc-m-smile');
    next();
    if (!tv()) banner(levelName(0));
  }
  /** A gold line over the board for a while (a new level). */
  function banner(s2) { G.ban = { s: s2, t: 0, life: 2.4 }; }
  function next() {
    if (tv()) {
      // The TV show: the question's chips on the board, its level, a longer clock.
      G.level = TV_LEVEL[Math.min(G.right, TV_LEVEL.length - 1)];
      banner(t('wwQuestion', { n: G.right + 1 }) + ' · ' + fmt(LADDER[G.right]));
      G.out = null; G.hint = false;
    } else {
      const lv = levelOf(G.right);
      if (lv > G.level) { G.level = lv; banner(levelName(lv)); sound('notifyRaise'); }
    }
    G.q = LEVELS[G.level].deal(Math.random);
    G.n++;
    G.tMax = LEVELS[G.level].time + (tv() ? TV_EXTRA : 0);
    G.tLeft = G.tMax; G.answer = null; G.shown = time;
    G.fly = null; G.pot = tv() ? 3 + Math.floor(G.right / 2) : 3 + Math.min(G.streak, 7);
    // The board is turned over first (at once with « Reduce animations »).
    G.dealT = shell.reduced ? REVEAL_END : 0; G.snd = 0;
    state = shell.reduced ? 'ask' : 'deal';
    renderHud();
    sound('notifyCard');
  }
  /** The board is all turned over: the clock starts. */
  function revealed() { G.dealT = REVEAL_END; state = 'ask'; G.tLeft = G.tMax; }
  /** A joker of the TV show, once each. */
  function joker(id) {
    if (!tv() || state !== 'ask' || !G.jok[id]) return;
    G.jok[id] = false;
    const l = L();
    if (id === 'j50') G.out = fiftyOut(G.q.win);
    else if (id === 'jace') G.hint = true;              // the hands' names, in blue under them
    else { G.tLeft += 5; G.tMax += 5; G.fx.push({ s: '+5 s', x: shell.W / 2, y: l.barY + 18, t: 0, life: 1.1, gold: true }); }
    sound('notifyAction');
  }
  function answer(pick) {
    if (state !== 'ask') return;
    if (pick != null && tv() && pick === G.out) return;     // taken away by the 50/50
    const q = G.q;
    G.answer = pick;
    G.ok = pick === q.win;
    state = 'shown';
    // The pot goes to the winning hand (half to each on a split).
    G.fly = { t: 0, n: G.pot, win: q.win };
    if (G.ok && tv()) {
      G.right++; G.streak++;
      G.won = LADDER[G.right - 1];
      const l = L();
      const safe = SAFE.indexOf(G.right - 1) >= 0, top = G.right === LADDER.length;
      G.fx.push({ s: '💰 ' + fmt(G.won), x: shell.W / 2, y: l.boardY - l.ch / 2 - 16, t: 0, life: 1.3, gold: true, big: true });
      if (safe) G.fx.push({ s: '🛟 ' + t('wwSafe'), x: shell.W / 2, y: l.boardY, t: 0, life: 1.8, gold: true, big: true });
      if (top) { G.fx.push({ s: '🏆 ' + t('wwMillion'), x: shell.W / 2, y: l.boardY, t: 0, life: 2.4, gold: true, big: true }); shell.grant('whowins'); }
      G.yayUntil = performance.now() + 700;
      sound(top ? 'notifyBigWin' : safe ? 'notifyWinner' : 'notifyRaise');
    } else if (G.ok) {
      G.right++; G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak);
      const pts = points(G.tLeft, G.streak);
      G.score += pts;
      const l = L();
      G.fx.push({ s: '+' + pts, x: shell.W / 2, y: l.boardY - l.ch / 2 - 16, t: 0, life: 1.1, gold: true, big: G.streak >= FEVER_STREAK });
      if (G.streak === FEVER_STREAK) G.fx.push({ s: '🔥 ' + t('wwFever'), x: shell.W / 2, y: l.boardY, t: 0, life: 1.6, gold: true, big: true });
      G.yayUntil = performance.now() + 700;
      sound(G.streak === FEVER_STREAK ? 'notifyBigWin' : G.streak >= 3 ? 'notifyRaise' : 'notifyAction');
    } else {
      // The TV show: one mistake ends it, with the last safe level passed.
      if (tv()) { G.lives = 0; G.won = keptAfter(G.right); } else G.lives--;
      G.streak = 0;
      if (!shell.reduced) G.shake = 0.4;
      G.koUntil = performance.now() + 900;
      if (pick == null) say(t('wwTooSlow'));
      sound('notifyFold');
    }
    renderHud();
    clearTimeout(timer);
    timer = setTimeout(goOn, G.ok ? 1400 : 2600);
  }
  function goOn() {
    if (state !== 'shown') return;
    clearTimeout(timer);
    if (G.lives <= 0 || (tv() && G.right >= LADDER.length)) finish(); else next();
  }
  function finish() {
    state = 'over';
    shell.ended();
    if (tv()) {
      const best = loadBest(), prevTv = (best.tv || {}).best || 0;
      if (G.won > prevTv) { best.tv = Object.assign({}, best.tv, { best: G.won }); saveBest(best); }
      const top = G.right >= LADDER.length;
      ace.mood(top ? 'mc-m-yay' : 'mc-m-smile'); ace.pose(top ? 'wave' : 'idle');
      G.res = { tv: true, top, record: G.won > prevTv && prevTv > 0 };
      renderHud();
      renderResult();
      return;
    }
    const score = G.score, prev = shell.best.get(), record = score > prev;
    if (record) shell.best.set(score);
    const best = loadBest(), lv = G.level + 1;
    if (lv > ((best[mode] || {}).level || 0)) { best[mode] = Object.assign({}, best[mode], { level: lv }); saveBest(best); }
    if (record && prev) sound('notifyBigWin');
    ace.mood('mc-m-smile'); ace.pose('idle');
    G.res = { score, record, prev };
    renderHud();
    renderResult();
  }
  /** The result: the score, the level reached, again or the modes. */
  function renderResult() {
    if (state !== 'over' || !G.res) return;
    const btn = (id, label, ghost) => '<button type="button" class="pg-btn' + (ghost ? ' pg-ghost' : '') + '" data-do="' + id + '">' + esc(label) + '</button>';
    const btns2 = '<div class="ww-btns">' + btn('again', t('wwRetry')) + btn('modes', t('wwModes'), true) + '</div></div>';
    if (G.res.tv) {
      const { top, record } = G.res;
      shell.panel('<div class="ww-box"><p class="pg-dim">📺 ' + esc(t('wwModeTv')) + ' · ' + esc(t('wwQuestion', { n: Math.min(G.right + (top ? 0 : 1), LADDER.length) })) + '</p>'
        + '<h2>' + esc(top ? t('wwMillion') : t('wwLost')) + '</h2>'
        + '<p class="ww-won">💰 ' + esc(fmt(G.won)) + '</p>'
        + (top ? '' : '<p class="ar-final">' + esc(t('wwKeep', { n: fmt(G.won) })) + '</p>')
        + (record ? '<p class="pg-dim">' + esc(t('arNewRecord')) + '</p>' : '') + btns2, true);
    } else {
      const { score, record, prev } = G.res;
      shell.panel('<div class="ww-box"><p class="pg-dim">' + esc(levelName(G.level)) + '</p><h2>' + esc(fmt(score)) + '</h2>'
        + '<p class="ar-final">✓ ' + fmt(G.right) + ' · <em>×' + fmt(G.bestStreak) + '</em></p>'
        + '<p class="pg-dim">' + esc(record && prev ? t('arNewRecord') : t('arRecord', { n: fmt(Math.max(score, prev)) })) + '</p>' + btns2, true);
    }
    shell.root.querySelectorAll('.pg-panel [data-do]').forEach((b) => {
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', () => act(b.getAttribute('data-do')));
    });
  }
  function act(what) {
    if (state !== 'over') return;
    if (what === 'again') start(mode);
    else { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); renderHud(); titlePanel(); }
  }

  // ── Layout (world px) ─────────────────────────────────────────────
  function L() {
    const W = shell.W, H = shell.H;
    let top = 46;
    try { top = Math.max(40, shell.hud.offsetHeight / (shell.k || 1) + 6); } catch (e) {}
    const narrow = W < 470;
    const gap = 5;
    const btnH = 32, btnY = H - btnH / 2 - 10;
    if (narrow) {
      const cw = Math.min(46, (W - 16 - 4 * gap) / 5), ch = cw * 1.4;
      const hcw = Math.min(54, (W / 2 - 24 - gap) / 2), hch = hcw * 1.4;
      const barY = top + 4;
      const total = ch + 34 + hch + 24, room = btnY - btnH / 2 - 16 - (top + 18) - (mode === 'tv' ? 40 : 0);
      const boardY = top + 18 + Math.max(0, (room - total) / 2) + ch / 2;
      const handY = boardY + ch / 2 + 34 + hch / 2;
      return { W, H, narrow, top, gap, cw, ch, hcw, hch, barY, boardY, handY, ax: W / 4, bx: (3 * W) / 4, btnY, btnH };
    }
    const hcw = Math.min(56, W * 0.075), hch = hcw * 1.4;
    const side = 2 * hcw + gap + 24;
    const cw = Math.min(58, (W - 2 * side - 16 - 4 * gap) / 5), ch = cw * 1.4;
    const barY = top + 4;
    const boardY = Math.max(top + 30 + ch / 2, (top + btnY) / 2 - 16);
    return { W, H, narrow, top, gap, cw, ch, hcw, hch, barY, boardY, handY: boardY, ax: side / 2 + 4, bx: W - side / 2 - 4, btnY, btnH };
  }
  const handXs = (l, cx) => [cx - (l.hcw + l.gap) / 2, cx + (l.hcw + l.gap) / 2];
  function handAt(l, x, y) {
    if (Math.abs(y - l.handY) > l.hch / 2 + 16) return null;
    if (Math.abs(x - l.ax) <= l.hcw + l.gap + 10) return 1;
    if (Math.abs(x - l.bx) <= l.hcw + l.gap + 10) return -1;
    return null;
  }
  function layoutButtons(l) {
    btns.reset();
    if (state === 'ask') btns.add({ id: 'split', x: l.W / 2, y: l.btnY, w: Math.min(180, l.W - 120), h: l.btnH, label: t('wwSplit'), kind: 'ghost', key: '↓', off: tv() && G.out === 0 });
    // The TV show's jokers, a row above.
    if (tv() && (state === 'ask' || state === 'deal')) {
      const w = Math.min(104, (l.W - 32) / 3), y = l.btnY - l.btnH - 8;
      [['j50', 'wwJ50', '1'], ['jace', 'wwJAce', '2'], ['jtime', 'wwJTime', '3']].forEach(([id, key, k], i) =>
        btns.add({ id, x: l.W / 2 + (i - 1) * (w + 8), y, w, h: 28, label: t(key), kind: 'gold', key: k, off: !G.jok[id] || state !== 'ask' }));
    }
  }

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
    // The result: Space plays again.
    if (state === 'over') { if (a === 'jump' && info.x == null) act('again'); return; }
    if (state === 'shown') { if (a === 'jump' && time - G.shownAt > 0.4) goOn(); return; }
    // During the deal: a tap or a key turns the rest of the board over.
    if (state === 'deal') { revealed(); return; }
    const l = L();
    layoutButtons(l);
    if (info.x != null) {
      const id = btns.hit(info.x, info.y);
      if (id === 'split') { answer(0); return; }
      if (id === 'j50' || id === 'jace' || id === 'jtime') { joker(id); return; }
      const h = handAt(l, info.x, info.y);
      if (h != null) answer(h);
      return;
    }
    if (a === 'n1') joker('j50');
    else if (a === 'n2') joker('jace');
    else if (a === 'n3') joker('jtime');
    else if (a === 'left') answer(1);
    else if (a === 'right') answer(-1);
    else if (a === 'duck') answer(0);
  }

  function update(dt) {
    time += dt;
    if (!G) return;
    stepFloaters(G.fx, dt);
    if (G.ban) { G.ban.t += dt; if (G.ban.t > G.ban.life) G.ban = null; }
    if (G.say) { G.say.t += dt; if (G.say.t > G.say.life) G.say = null; }
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt);
    if (G.fly) G.fly.t += dt;
    if (state === 'deal') {
      G.dealT += dt;
      // A card sound for the flop, the turn, the river.
      const at = [REVEAL[0], REVEAL[3], REVEAL[4]];
      while (G.snd < 3 && G.dealT >= at[G.snd]) { G.snd++; sound('notifyCard'); }
      if (G.dealT >= REVEAL_END) revealed();
    }
    if (state === 'ask') {
      G.tLeft -= dt;
      if (G.tLeft <= 0) { G.tLeft = 0; answer(null); }
    }
    if (state === 'shown' && G.shownAt == null) G.shownAt = time;
    if (state === 'ask') G.shownAt = null;
    if (state !== 'over' && state !== 'title') {
      const now = performance.now();
      ace.mood(now < G.koUntil ? 'mc-m-ko' : now < G.yayUntil ? 'mc-m-yay' : G.streak >= 5 ? 'mc-m-cool' : 'mc-m-smile');
      ace.pose(now < G.yayUntil ? 'wave' : 'idle');
    }
  }

  // ── Drawing ───────────────────────────────────────────────────────
  function card(g, n, x, y, w, h, lit, dim, glow) {
    g.save(); g.translate(x, y); drawFace(g, img, n, w, h);
    if (glow) { g.shadowColor = 'rgba(255,190,60,.9)'; g.shadowBlur = 10 + 6 * glow; rr(g, -w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 5); g.strokeStyle = 'rgba(255,200,80,' + (0.5 + 0.5 * glow) + ')'; g.lineWidth = 2; g.stroke(); g.shadowBlur = 0; }
    if (lit) { rr(g, -w / 2 - 2.5, -h / 2 - 2.5, w + 5, h + 5, 5); g.strokeStyle = '#f5d77a'; g.lineWidth = 2; g.stroke(); }
    if (dim) { rr(g, -w / 2, -h / 2, w, h, Math.max(2, w * 0.1)); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill(); }
    g.restore();
  }
  /** A board card being turned over: p 0 (back) → 1 (face). */
  function flipCard(g, n, x, y, w, h, p, lit, dim, glow) {
    if (p >= 1) { card(g, n, x, y, w, h, lit, dim, glow); return; }
    const sx = Math.abs(Math.cos(Math.PI * Math.max(0, p)));
    g.save(); g.translate(x, y); g.scale(Math.max(0.02, sx), 1 + 0.06 * Math.sin(Math.PI * Math.max(0, p)));
    if (p < 0.5) drawBackCard(g, img, 0, 0, w, h); else drawFace(g, img, n, w, h);
    g.restore();
  }
  /** A casino chip seen from above. */
  function chip(g, x, y, r, k) {
    const [c, e] = CHIP[k % CHIP.length];
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = c; g.fill();
    g.lineWidth = r * 0.28; g.strokeStyle = e; g.setLineDash([r * 0.5, r * 0.55]); g.beginPath(); g.arc(x, y, r * 0.8, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.arc(x, y, r * 0.42, 0, Math.PI * 2); g.fillStyle = c; g.fill();
    g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
  }
  /** Where the pot sits: under the board (phone: between the board and the hands). */
  const potAt = (l) => (l.narrow ? { x: l.W / 2, y: (l.boardY + l.ch / 2 + l.handY - l.hch / 2) / 2 + 4 } : { x: l.W / 2, y: l.boardY + l.ch / 2 + 30 });
  function drawPot(g, l) {
    const P = potAt(l), r = l.narrow ? 7 : 8;
    const ease = (u) => 1 - Math.pow(1 - Math.min(1, Math.max(0, u)), 3);
    const n = G.fly ? G.fly.n : G.pot;
    for (let i = 0; i < n; i++) {
      // Two stacks, a chip of each colour in turn.
      const sx = P.x + (i % 2 ? r * 1.1 : -r * 1.1), sy = P.y - Math.floor(i / 2) * r * 0.32;
      let x = sx, y = sy;
      if (G.fly) {
        const to = G.fly.win === 0 ? (i % 2 ? l.bx : l.ax) : G.fly.win === 1 ? l.ax : l.bx;
        const u = ease((G.fly.t - i * 0.03) / 0.55);
        x = sx + (to - sx) * u;
        y = sy + (l.handY - sy) * u - Math.sin(Math.PI * u) * 26;   // under the winning cards
      }
      chip(g, x, y, r, i);
    }
  }
  function draw(g) {
    const l = L(), W = l.W, H = l.H;
    felt(g, W, H, shell.theme.light);
    g.save();
    // A wrong answer shakes the table.
    if (G && G.shake > 0) g.translate(Math.sin(time * 70) * 6 * (G.shake / 0.4), 0);
    if (state !== 'title' && G.q) {
      const q = G.q, shown = state === 'shown' || state === 'over';
      const glow = G.streak >= FEVER_STREAK ? 0.5 + 0.5 * Math.sin(time * 6) : 0;
      // Winning five: the winner's (both on a split).
      const lit = shown ? new Set(q.win >= 0 ? q.ra.best : []) : new Set();
      if (shown && q.win <= 0) q.rb.best.forEach((c) => lit.add(c));
      // The clock.
      const bw = Math.min(W - 24, 320), frac = state === 'deal' ? 1 : Math.max(0, G.tLeft / G.tMax);
      rr(g, W / 2 - bw / 2, l.barY, bw, 6, 3); g.fillStyle = 'rgba(0,0,0,.3)'; g.fill();
      if (frac > 0) { rr(g, W / 2 - bw / 2, l.barY, bw * frac, 6, 3); g.fillStyle = frac > 0.5 ? '#3fae6a' : frac > 0.25 ? '#e0a33a' : '#d2453b'; g.fill(); }
      // The board.
      for (let i = 0; i < 5; i++) {
        const x = W / 2 + (i - 2) * (l.cw + l.gap);
        const p = state === 'deal' ? (G.dealT - REVEAL[i]) / FLIP : 1;
        flipCard(g, q.board[i], x, l.boardY, l.cw, l.ch, p, shown && lit.has(q.board[i]), shown && !lit.has(q.board[i]), shown ? 0 : glow);
      }
      if (state !== 'over') drawPot(g, l);
      // The two hands, their names once answered.
      [[q.a, q.ra, l.ax, 1], [q.b, q.rb, l.bx, -1]].forEach(([hand, r, cx, side]) => {
        const xs = handXs(l, cx);
        const won = shown && (q.win === side || q.win === 0);
        rr(g, cx - l.hcw - l.gap - 6, l.handY - l.hch / 2 - 8, 2 * l.hcw + 2 * l.gap + 12, l.hch + 16, 10);
        g.fillStyle = shown ? (won ? 'rgba(216,178,90,.28)' : 'rgba(0,0,0,.22)') : 'rgba(0,0,0,.18)'; g.fill();
        if (shown && G.answer === side) { g.strokeStyle = G.ok ? '#3fae6a' : '#d2453b'; g.lineWidth = 2.5; g.stroke(); }
        for (let k = 0; k < 2; k++) card(g, hand[k], xs[k], l.handY, l.hcw, l.hch, shown && lit.has(hand[k]), shown && !lit.has(hand[k]));
        // The 50/50 took this hand away.
        if (!shown && tv() && G.out === side) {
          rr(g, cx - l.hcw - l.gap - 6, l.handY - l.hch / 2 - 8, 2 * l.hcw + 2 * l.gap + 12, l.hch + 16, 10);
          g.fillStyle = 'rgba(0,0,0,.6)'; g.fill();
          g.fillStyle = 'rgba(255,138,128,.9)'; g.font = '700 30px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText('✕', cx, l.handY);
        }
        if (shown || (tv() && G.hint)) {
          const label = t(NAME_KEYS[r.cat]);
          g.fillStyle = won ? '#f5d77a' : shown ? 'rgba(245,240,227,.75)' : '#9fd8ff'; g.textAlign = 'center'; g.textBaseline = 'top';
          fitFont(g, label, 2 * l.hcw + 30, 12, 700);
          g.fillText(label, cx, l.handY + l.hch / 2 + 11);
        } else if (keyboardFirst()) {
          g.fillStyle = 'rgba(245,240,227,.55)'; g.textAlign = 'center'; g.textBaseline = 'top'; g.font = '700 10px Inconsolata, monospace';
          g.fillText(side === 1 ? '←' : '→', cx, l.handY + l.hch / 2 + 11);
        }
      });
      // Split pot: the answer under the board.
      if (shown && q.win === 0) {
        g.fillStyle = '#f5d77a'; g.textAlign = 'center'; g.textBaseline = 'middle';
        fitFont(g, t('wwSplit'), W - 40, 16, 700, 'Cinzel, Georgia, serif');
        g.fillText(t('wwSplit'), W / 2, l.narrow ? l.boardY + l.ch / 2 + 14 : l.boardY + l.ch / 2 + 18);
        if (G.answer === 0) { g.font = '700 16px Inter, system-ui, sans-serif'; g.fillStyle = '#3fae6a'; }
      }
      if (shown) {
        g.font = '700 26px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillStyle = G.ok ? '#7ee2a0' : '#ff8a80';
        g.fillText(G.ok ? '✓' : '✗', W / 2, l.narrow ? (l.boardY + l.ch / 2 + l.handY - l.hch / 2) / 2 + (q.win === 0 ? 8 : 0) : l.handY + l.ch / 2 + 40);
      }
      layoutButtons(l);
      btns.draw(g, keyboardFirst(), null);
    }
    g.restore();
    // The Ace, a corner of the felt.
    const ax = l.narrow ? 24 : W - 28, ay = H - 4, s = l.narrow ? 0.2 : 0.26;
    ace.place(ax, ay, s, shell.k);
    if (G && G.say && state !== 'title') {
      const a = G.say.t < 0.2 ? G.say.t / 0.2 : G.say.t > G.say.life - 0.4 ? Math.max(0, (G.say.life - G.say.t) / 0.4) : 1;
      bubble(g, G.say.s, Math.min(ax + 6, W - 20), ay - 212 * s - 2, W, a);
    }
    if (G) drawFloaters(g, G.fx);
    // The level's banner: fades in and out on the board, never wider than the felt.
    if (G && G.ban && state !== 'title') {
      const l = L(), b = G.ban, a = Math.min(1, b.t / 0.25, (b.life - b.t) / 0.5);
      g.save(); g.globalAlpha = Math.max(0, a); g.textAlign = 'center'; g.textBaseline = 'middle';
      fitFont(g, b.s, l.W - 24, l.narrow ? 19 : 24, 700, 'Cinzel, Georgia, serif');
      const y = l.boardY, w = Math.min(l.W - 12, g.measureText(b.s).width + 28);
      rr(g, l.W / 2 - w / 2, y - 17, w, 34, 17); g.fillStyle = 'rgba(8,14,12,.78)'; g.fill();
      g.strokeStyle = 'rgba(216,178,90,.7)'; g.lineWidth = 1.5; g.stroke();
      g.fillStyle = '#f5d77a'; g.fillText(b.s, l.W / 2, y + 1);
      g.restore();
    }
  }

  return {
    update, draw, input, resize: renderResult,
    running: () => state === 'deal' || state === 'ask' || state === 'shown',
    destroy() { clearTimeout(timer); ace.remove(); },
  };
}

function ensureCss() {
  if (document.getElementById('pth-game-ww-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-ww-css';
  st.textContent = '#pth-game .ww-box{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 18px;border-radius:12px;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .ww-box h2{color:#f5d77a}#pth-game .ww-lives{color:#ff8a80;letter-spacing:2px}'
    // The tables page and the result.
    + '#pth-game .ww-pick{display:flex;flex-direction:column;align-items:center;gap:8px;width:min(620px,100%);pointer-events:auto}'
    + '#pth-game .ww-pick p{margin:0}'
    + '#pth-game .ww-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:100%}'
    + '@media (max-width:520px){#pth-game .ww-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}}'
    + '#pth-game .ww-tab{appearance:none;border:0;cursor:pointer;min-width:0;padding:8px 6px 7px;border-radius:12px;background:rgba(11,18,16,.84);color:#f5f0e3;'
    + 'box-shadow:inset 0 0 0 1px rgba(216,178,90,.3);display:flex;flex-direction:column;align-items:center;gap:2px;transition:transform .15s}'
    + '#pth-game .ww-tab small{font:600 10px Inconsolata,monospace;color:#9bb0a3;letter-spacing:.06em;text-transform:uppercase}'
    + '#pth-game .ww-tab b{font:700 14px/1.15 Cinzel,Georgia,serif;overflow-wrap:anywhere;min-height:2.3em;display:flex;align-items:center}'
    + '#pth-game .ww-tabs.ww-modes{grid-template-columns:repeat(auto-fit,minmax(150px,1fr));max-width:540px}'
    + '#pth-game .ww-tab .ww-ic{font-size:26px;line-height:1.2}#pth-game .ww-tab .ww-rec{color:#f5d77a;text-transform:none;letter-spacing:0;min-height:1.2em}'
    + '#pth-game .ww-tab .ww-sub{text-transform:none;letter-spacing:0;min-height:1.2em}'
    + '#pth-game .ww-tab.on{box-shadow:inset 0 0 0 2px #d8b25a,0 0 16px rgba(216,178,90,.3);transform:translateY(-2px)}'

    + '#pth-game .ww-tab:focus-visible{outline:2px solid #f5f0e3;outline-offset:2px}'
    + '#pth-game .ww-box{min-width:min(330px,100%)}#pth-game .ww-box h2{font-size:clamp(18px,3.4vw,24px);white-space:nowrap}'
    + '#pth-game .pg-panel .ww-won{font:700 26px Cinzel,Georgia,serif;color:#f5d77a;margin:0}#pth-game.pg-light .pg-panel .ww-won{color:#8a6a10}'
    + '#pth-game .ww-btns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;pointer-events:auto;margin-top:4px}'
    + '@media (max-height:420px){#pth-game .ww-tab b{min-height:0;font-size:13px}#pth-game .ww-tab{padding:5px 6px}#pth-game .ww-pick>p:not(.pg-blink){display:none}}'
    + '#pth-game.pg-light .ww-tab{background:rgba(255,252,246,.96);color:#1d222b;box-shadow:inset 0 0 0 1px rgba(140,105,20,.35)}'
    + '#pth-game.pg-light .ww-tab small{color:#5a6470}#pth-game.pg-light .ww-tab .ww-rec{color:#8a6a10}'
    + '#pth-game.pg-light .ww-tab.on{box-shadow:inset 0 0 0 2px #a07a12,0 0 14px rgba(160,122,18,.25)}'
    + '#pth-game .ww-streak.ww-fever{color:#ffb84d;text-shadow:0 0 8px rgba(255,150,40,.8);animation:ww-fever 1s ease-in-out infinite alternate}'
    + '@keyframes ww-fever{from{opacity:.75}to{opacity:1}}@media (prefers-reduced-motion:reduce){#pth-game .ww-streak.ww-fever{animation:none}}'
    + '#pth-game.pg-light .ww-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .ww-box h2{color:#8a6510}#pth-game.pg-light .ww-box .ar-final{color:#1d222b}';
  document.head.appendChild(st);
}
