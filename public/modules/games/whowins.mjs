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
//      1 2 3; web.37, narmod: no more 50/50 nor +5 s): New hand (another
//      showdown of the same level, a fresh clock), the Ace's help (names both
//      hands), Second chance (armed for the question: a wrong answer is
//      crossed out and you answer again).
//   📅 The Daily challenge (web.34) — DAILY_HANDS hands, the same for every
//      player on a given UTC day (seeded: rng('pth-whowins-' + day)), from
//      the easy levels to the Ace's (DAILY_LEVEL); a mistake does not stop
//      it; points as in Endless. Only the first game of the day counts (its
//      score, the streak of days in a row: pth_ww_daily), the others are
//      practice.
// The traps explained (web.35): after a mistake on a tricky showdown
// (trapOf: the board plays, a counterfeited pocket pair, the wheel, flush
// against flush, the kicker, only five cards count), the Ace explains it in a
// card at the bottom of the felt, in every mode; the game waits until the
// player goes on (« Continue ▶ »: a tap or Space, web.36).
// No Split answer any more (web.38, narmod): the deals never tie; the fifth
// level is Strong hands (a full house or better). The Ace stands top right
// and reacts to the answers; the modes' title uses the arcade's tiles.
// Secret trophy « Who Wins? »: the million.
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
import { shuffled, rng } from './deal.mjs';
import { dayKey } from './solitaire-rules.mjs';
import { fmt, imageCache, rr, drawFace, aceActor, CHIP } from './common.mjs';
import { felt, drawFloaters, stepFloaters, keyboardFirst, fitFont, drawBackCard } from './ui.mjs';
import { titleScreen } from './title.mjs';
import { hofOn, hofStart, hofEnd, hofPanel } from './hof.mjs';
import { endScreen, stepsHtml } from './end.mjs';

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
// Each trap's explanation (i18n key).
export const TRAP_KEYS = { board: 'wwTrapBoard', counterfeit: 'wwTrapCounterfeit', wheel: 'wwTrapWheel', flush: 'wwTrapFlush', kicker: 'wwTrapKicker', five: 'wwTrapFive' };
/** Lines of `s` no wider than maxW (words; letter by letter for scripts without spaces). */
export function wrapLines(measure, s, maxW) {
  const words = /\s/.test(s) ? s.split(/\s+/) : Array.from(s);
  const sep = /\s/.test(s) ? ' ' : '';
  const out = [];
  let line = '';
  for (const w of words) {
    const tryL = line ? line + sep + w : w;
    if (line && measure(tryL) > maxW) { out.push(line); line = w; } else line = tryL;
  }
  if (line) out.push(line);
  return out;
}
/** The first of `tries` deals that `ok` accepts, else the last one. */
function find(rnd, ok, tries) {
  let q = null;
  for (let i = 0; i < tries; i++) { q = dealOnce(rnd); if (ok(q)) return q; }
  while (q.win === 0) q = dealOnce(rnd);         // never a tie: no Split answer
  return q;
}
const TRAPS = ['counterfeit', 'wheel', 'flush', 'kicker'];      // the ones that never tie
// The six levels: their deals and their clock (s).
export const LEVELS = [
  { key: 'wwT1', time: 9, deal: (rnd) => find(rnd, (q) => q.win !== 0 && q.ra.cat <= 2 && q.rb.cat <= 2, 400) },
  { key: 'wwT2', time: 9, deal: (rnd) => find(rnd, (q) => q.win !== 0 && (q.ra.cat === 4 || q.ra.cat === 5 || q.rb.cat === 4 || q.rb.cat === 5), 1500) },
  { key: 'wwT3', time: 8, deal: (rnd) => (rnd() < 0.65 ? find(rnd, (q) => trapOf(q) === 'kicker', 2000) : find(rnd, (q) => q.win !== 0 && q.ra.cat === q.rb.cat, 400)) },
  { key: 'wwT4', time: 8, deal: (rnd) => { const want = TRAPS[Math.floor(rnd() * TRAPS.length)]; return find(rnd, (q) => q.win !== 0 && trapOf(q) === want, 6000); } },
  { key: 'wwT5', time: 8, deal: (rnd) => find(rnd, (q) => q.win !== 0 && Math.max(q.ra.cat, q.rb.cat) >= 6, 4000) },
  { key: 'wwT6', time: 5, deal: (rnd) => LEVELS[Math.floor(rnd() * 5)].deal(rnd) },
];
/** The level reached after `right` right answers. */
export const levelOf = (right) => Math.min(LEVELS.length - 1, Math.floor(right / LEVEL_EVERY));
// The ways to play, on the title.
export const MODES = [
  { id: 'tv', icon: '📺', key: 'wwModeTv', desc: 'wwModeTvD' },
  { id: 'endless', icon: '♾️', key: 'wwModeEndless', desc: 'wwModeEndlessD' },
  { id: 'daily', icon: '📅', key: 'wwModeDaily', desc: 'wwModeDailyD' },
];
// The Daily challenge: its hands, the level of each.
export const DAILY_HANDS = 10;
export const DAILY_LEVEL = [0, 1, 1, 2, 2, 3, 3, 4, 4, 5];
/** The day's deals, the same for every player (seeded by the UTC day). */
export function dailyDeals(day) { const r = rng('pth-whowins-' + day); return DAILY_LEVEL.map((lv) => LEVELS[lv].deal(r)); }
/** The day before `day` (YYYY-MM-DD, UTC). */
export function dayBefore(day) { return new Date(Date.parse(day + 'T00:00:00Z') - 86400000).toISOString().slice(0, 10); }
/** The record after a counted game on `day` (prev: { day, score, right, streak } or null). */
export function dailyAfter(prev, day, score, right) {
  const streak = prev && prev.day === dayBefore(day) ? (prev.streak || 1) + 1 : prev && prev.day === day ? prev.streak || 1 : 1;
  return { day, score, right, streak };
}
const DAILY_KEY = 'pth_ww_daily';
function loadDaily() { try { return JSON.parse(localStorage.getItem(DAILY_KEY) || 'null'); } catch (e) { return null; } }
function saveDaily(d) { try { localStorage.setItem(DAILY_KEY, JSON.stringify(d)); } catch (e) {} }
// The TV show: the chips of each question, its safe levels (indexes), the
// level each question is dealt from, the extra seconds on its clock.
export const LADDER = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
export const SAFE = [4, 9];
export const TV_LEVEL = [0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5];
export const TV_EXTRA = 3;
/** The TV show's ladder between two questions on a phone (web.111), in seconds (a tap goes on). */
export const STEP_S = 2.6;
/** The chips you leave with after k right answers then a mistake (the last safe level passed). */
export function keptAfter(k) { let v = 0; for (const i of SAFE) if (k > i) v = LADDER[i]; return v; }
// The TV show's jokers: id, label key, key.
export const JOKERS = [['jswap', 'wwJSwap', '1'], ['jace', 'wwJAce', '2'], ['jsave', 'wwJSave', '3']];
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

  /** The title, or the Hall of Fame's boards opened from it (the same scene behind). */
  const onTitle = () => state === 'title' || state === 'board';
  let state = 'title', G = null, time = 0, timer = 0;
  let mode = 'tv';                // the way of playing
  let sel = 0;                    // the mode picked on the title (keys)
  function newGame() {
    G = { score: 0, lives: LIVES, right: 0, n: 0, level: 0, streak: 0, bestStreak: 0, q: null, tMax: TIME_MAX, tLeft: TIME_MAX, answer: null, ok: false,
      fx: [], say: null, yayUntil: 0, koUntil: 0, shown: 0, dealT: 0, snd: 0, pot: 3, fly: null, shake: 0,
      won: 0, jok: { jswap: true, jace: true, jsave: true }, out: null, hint: false, save: false };
    renderHud();
  }
  const tv = () => mode === 'tv';
  const daily = () => mode === 'daily';
  function renderHud() {
    const play = !onTitle();
    hScore.textContent = fmt(tv() ? G.won : G.score);
    hTab.textContent = !play ? '\u00a0' : tv() ? t('wwQLab') : daily() ? t('wwHandLab') : t('wwLevelLab');
    hProg.textContent = !play ? '' : tv() ? Math.min(G.right + 1, LADDER.length) + '/' + LADDER.length
      : daily() ? Math.max(1, Math.min(G.n, DAILY_HANDS)) + '/' + DAILY_HANDS : String(G.level + 1);
    hLives.textContent = tv() || daily() ? '' : '❤'.repeat(Math.max(0, G.lives)) + '♡'.repeat(Math.max(0, LIVES - G.lives));
    const fever = !tv() && G.streak >= FEVER_STREAK;
    hStreak.textContent = fever ? '🔥 ' + t('wwFever') : G.streak >= 2 ? '×' + G.streak : '';
    hStreak.classList.toggle('ww-fever', fever);
  }
  const say = (s, life = 1.8) => { G.say = { s, t: 0, life }; };
  const levelName = (lv) => t('wwLevel', { n: lv + 1 }) + ' · ' + t(LEVELS[lv].key);

  /** The Daily challenge on its tile: today's score, the streak. */
  /** Today's score and the streak, as plain text (the title escapes it). */
  function dailyLineText() {
    const d = loadDaily(), day = dayKey();
    if (!d) return '';
    const alive = d.day === day || d.day === dayBefore(day);
    const parts = [];
    if (d.day === day) parts.push(t('wwDailyToday', { n: fmt(d.score) }));
    if (alive && d.streak > 1) parts.push('🔥 ' + t('wwDailyStreak', { n: d.streak }));
    return parts.join(' · ');
  }
  /** The title: the ways to play, their records — the arcade's tiles (as Video Poker). */
  function titlePanel() {
    const best = loadBest();
    const rec = (m) => {
      const b = best[m.id] || {};
      return m.id === 'endless' ? (shell.best.get() ? t('arRecord', { n: fmt(shell.best.get()) }) + (b.level ? ' · ' + t('wwLevel', { n: b.level }) : '') : '')
        : m.id === 'tv' ? (b.best ? t('arRecord', { n: fmt(b.best) }) : '')
        : m.id === 'daily' ? dailyLineText() : '';
    };
    titleScreen(shell, { id: 'whowins', name: t('wwName'), hint: t('wwHint'), sel,
      modes: MODES.map((m) => ({ icon: m.icon, label: t(m.key), desc: t(m.desc), rec: rec(m) })),
      options: hofEnabled ? [{ id: 'hof', label: '🏆 ' + t('hofTitle'), key: '↓' }] : [],
      onOption: (id) => { if (id === 'hof') openHof(); },
      onPick: (i) => { sel = i; start(MODES[sel].id); } });
  }
  // The Hall of Fame (hof.mjs, claude/CONCEPTION_HALL_OF_FAME.md, web.101): the title's 🏆 (or ↓, else the next
  // tile) only while the admin has it on.
  let hofEnabled = false;
  function refreshHof() {
    hofOn('whowins').then((on) => { if (on !== hofEnabled) { hofEnabled = on; if (state === 'title') titlePanel(); } }).catch(() => {});
  }
  function openHof() {
    state = 'board';
    hofPanel(shell, { g: 'whowins', name: t('wwName'), sel, modes: MODES.map((m) => ({ id: m.id, label: t(m.key) })),
      onBack: () => { state = 'title'; titlePanel(); refreshHof(); } });
  }
  newGame();
  titlePanel();
  refreshHof();
  try { if (navigator.webdriver) window.__pthWW = { run: () => G, state: () => state, mode: () => mode, start: (m) => start(m), hof: () => openHof(), end: () => finish() }; } catch (e) {}

  function start(m) {
    clearTimeout(timer);
    mode = m || MODES[sel].id;
    newGame();
    if (daily()) {
      // The day's hands; only the first game of the day counts.
      const day = dayKey(), d = loadDaily();
      G.day = day; G.deals = dailyDeals(day); G.counted = !(d && d.day === day);
    }
    // The Hall of Fame's ticket — the daily's first game of the day only, as its local record.
    G.hof = daily() && !G.counted ? null : hofStart('whowins', mode);
    state = 'ask'; shell.panel(null);
    ace.pose('idle'); ace.mood('mc-m-smile');
    if (stepFirst()) return;
    next();
    if (daily()) banner('📅 ' + t('wwModeDaily') + (G.counted ? '' : ' · ' + t('wwDailyPracticeShort')));
    else if (!tv()) banner(levelName(0));
  }
  /** A gold line over the board for a while (a new level). */
  function banner(s2) { G.ban = { s: s2, t: 0, life: 2.4 }; }
  function next() {
    if (tv()) {
      // The TV show: the question's chips on the board, its level, a longer clock.
      G.level = TV_LEVEL[Math.min(G.right, TV_LEVEL.length - 1)];
      banner(t('wwQuestion', { n: G.right + 1 }) + ' · ' + fmt(LADDER[G.right]));
      G.out = null; G.hint = false; G.save = false;
    } else if (daily()) {
      G.level = DAILY_LEVEL[Math.min(G.n, DAILY_LEVEL.length - 1)];
    } else {
      const lv = levelOf(G.right);
      if (lv > G.level) { G.level = lv; banner(levelName(lv)); sound('notifyRaise'); }
    }
    G.q = daily() ? G.deals[Math.min(G.n, G.deals.length - 1)] : LEVELS[G.level].deal(Math.random);
    G.n++;
    G.tMax = LEVELS[G.level].time + (tv() ? TV_EXTRA : 0);
    G.tLeft = G.tMax; G.answer = null; G.shown = time;
    G.fly = null; G.trap = null; G.pot = tv() ? 3 + Math.floor(G.right / 2) : 3 + Math.min(G.streak, 7);
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
    if (id === 'jswap') {
      // Another showdown of the same level, turned over again, a fresh clock.
      G.q = LEVELS[G.level].deal(Math.random);
      G.out = null; G.tLeft = G.tMax;
      G.dealT = shell.reduced ? REVEAL_END : 0; G.snd = 0;
      state = shell.reduced ? 'ask' : 'deal';
      G.fx.push({ s: '🔄', x: l.cx, y: l.boardY - l.ch / 2 - 16, t: 0, life: 1, gold: true, big: true });
    } else if (id === 'jace') G.hint = true;            // the hands' names, in blue under them
    else { G.save = true; G.fx.push({ s: '🛡️', x: l.cx, y: l.boardY - l.ch / 2 - 16, t: 0, life: 1, gold: true, big: true }); }
    sound('notifyAction');
  }
  function answer(pick) {
    if (state !== 'ask') return;
    if (pick != null && tv() && pick === G.out) return;     // already crossed out
    const q = G.q;
    // Second chance: a wrong answer is crossed out, the question goes on.
    if (tv() && G.save && pick != null && pick !== q.win) {
      G.save = false; G.out = pick;
      if (!shell.reduced) G.shake = 0.3;
      say(t('wwJSaveSay'), 1.4);     // short: it covers the jokers' row
      sound('notifyFold');
      return;
    }
    G.answer = pick;
    G.ok = pick === q.win;
    (G.log || (G.log = [])).push(G.ok);     // each answer, for the end screen
    state = 'shown';
    // The pot goes to the winning hand (half to each on a split).
    G.fly = { t: 0, n: G.pot, win: q.win };
    if (G.ok && tv()) {
      G.right++; G.streak++;
      G.won = LADDER[G.right - 1];
      const l = L();
      const safe = SAFE.indexOf(G.right - 1) >= 0, top = G.right === LADDER.length;
      G.fx.push({ s: '💰 ' + fmt(G.won), x: L().cx, y: l.boardY - l.ch / 2 - 16, t: 0, life: 1.3, gold: true, big: true });
      // web.111: in the line above the hands, never over the cards
      if (safe) say('🛟 ' + t('wwSafe'), 1.8);
      if (top) { say('🏆 ' + t('wwMillion'), 2.4); shell.grant('whowins'); }
      G.yayUntil = performance.now() + 700;
      sound(top ? 'notifyBigWin' : safe ? 'notifyWinner' : 'notifyRaise');
    } else if (G.ok) {
      G.right++; G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak);
      const pts = points(G.tLeft, G.streak);
      G.score += pts;
      const l = L();
      G.fx.push({ s: '+' + pts, x: L().cx, y: l.boardY - l.ch / 2 - 16, t: 0, life: 1.1, gold: true, big: G.streak >= FEVER_STREAK });
      if (G.streak === FEVER_STREAK) say('🔥 ' + t('wwFever'), 1.6);
      G.yayUntil = performance.now() + 700;
      sound(G.streak === FEVER_STREAK ? 'notifyBigWin' : G.streak >= 3 ? 'notifyRaise' : 'notifyAction');
    } else {
      // The TV show: one mistake ends it, with the last safe level passed;
      // the Daily challenge goes on.
      if (tv()) { G.lives = 0; G.won = keptAfter(G.right); } else if (!daily()) G.lives--;
      G.streak = 0;
      if (!shell.reduced) G.shake = 0.4;
      G.koUntil = performance.now() + 900;
      sound('notifyFold');
      // A trap: the Ace explains it.
      const trap = trapOf(q);
      G.trap = trap && TRAP_KEYS[trap] ? trap : null;
    }
    renderHud();
    clearTimeout(timer);
    // A trap explained: the game waits for the player (a tap, Space) to read it.
    if (!G.trap) timer = setTimeout(goOn, G.ok ? 1400 : 2600);
  }
  function goOn() {
    if (state !== 'shown') return;
    clearTimeout(timer);
    if (G.lives <= 0 || (tv() && G.right >= LADDER.length) || (daily() && G.n >= DAILY_HANDS)) finish();
    else if (!stepFirst()) next();
  }
  /**
   * The TV show on a phone (web.111): before each question the whole ladder, the Ace announcing it (« Question 6,
   * for 2 000 chips… »), as on TV — instead of a banner over the cards. STEP_S, or a tap / Space. On a computer the
   * ladder is always there, on the right: the question is announced in the message line.
   */
  function stepFirst() {
    if (!tv() || shell.reduced || !L().phone) return false;
    state = 'step'; G.stepT = 0; G.q = null; G.say = null; G.ban = null;
    renderHud(); sound('notifyCard');
    return true;
  }
  function stepDone() { if (state === 'step') { state = 'ask'; next(); } }
  function finish() {
    state = 'over';
    shell.ended();
    if (tv()) {
      const best = loadBest(), prevTv = (best.tv || {}).best || 0;
      if (G.won > prevTv) { best.tv = Object.assign({}, best.tv, { best: G.won }); saveBest(best); }
      const top = G.right >= LADDER.length;
      ace.mood(top ? 'mc-m-yay' : 'mc-m-smile'); ace.pose(top ? 'wave' : 'idle');
      G.res = { tv: true, top, record: G.won > prevTv && prevTv > 0, prev: prevTv };
      renderHud();
      renderResult();
      return;
    }
    if (daily()) {
      const prevD = loadDaily();
      if (G.counted) saveDaily(dailyAfter(prevD, G.day, G.score, G.right));
      const d = loadDaily() || prevD;
      ace.mood(G.right >= 8 ? 'mc-m-yay' : 'mc-m-smile'); ace.pose(G.right >= 8 ? 'wave' : 'idle');
      if (G.counted) sound(G.right === DAILY_HANDS ? 'notifyBigWin' : 'notifyWinner');
      G.res = { daily: true, counted: G.counted, today: d && d.day === G.day ? d.score : G.score, streak: d && d.day === G.day ? d.streak || 1 : 0 };
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
  /** The end screen (end.mjs, web.67): the score, the level or the ladder climbed, again or the modes. */
  function renderResult() {
    if (state !== 'over' || !G.res || G.res.shown) return;
    G.res.shown = true;
    const log = G.log || [], common = { onAgain: () => act('again'), onMenu: () => act('modes') };
    const answers = stepsHtml(esc, log.slice(-15).map((ok) => ({ label: ok ? '✓' : '✗', cls: ok ? 'ok' : 'hard' })));
    if (G.res.daily) {
      const { counted, today, streak } = G.res;
      endScreen(shell, Object.assign({
        title: t('wwName'), sub: '📅 ' + t('wwModeDaily') + ' · ' + G.day + (counted ? '' : ' · ' + t('wwDailyPracticeShort')),
        hero: '', score: G.score, prev: counted ? 0 : today, note: counted ? t('wwDailyDone') : t('wwDailyPractice', { n: fmt(today) }),
        calc: [['✓', G.right + '/' + DAILY_HANDS], ['🔥', '×' + fmt(G.bestStreak)], streak > 1 ? ['📅', t('wwDailyStreak', { n: streak })] : null],
        levels: { title: t('wwHandLab'), right: G.right + ' / ' + DAILY_HANDS, html: answers },
        stats: [[G.right + '/' + DAILY_HANDS, '✓'], ['×' + fmt(G.bestStreak), '🔥'], [streak || 1, '📅']],
      }, common));
    } else if (G.res.tv) {
      const { top } = G.res;
      endScreen(shell, Object.assign({
        title: top ? t('wwMillion') : t('wwLost'), sub: '📺 ' + t('wwModeTv') + ' · ' + t('wwQuestion', { n: Math.min(G.right + (top ? 0 : 1), LADDER.length) }),
        score: G.won, prev: G.res.prev, unit: '💰', note: top ? '' : t('wwKeep', { n: fmt(G.won) }),
        calc: [['✓', G.right + '/' + LADDER.length]],
        levels: { title: t('wwQLab'), right: G.right + ' / ' + LADDER.length, html: stepsHtml(esc, LADDER.map((v, i) => ({ label: '', cls: i < G.right ? (SAFE.indexOf(i) >= 0 ? 'hard' : 'ok') : i === G.right && !top ? 'cur' : '' }))) },
        stats: [[G.right, t('wwQLab')], [fmt(G.won), '💰'], [fmt(LADDER[Math.min(LADDER.length - 1, G.right)]), '🎯']],
      }, common));
    } else {
      const { score, prev } = G.res;
      endScreen(shell, Object.assign({
        title: t('wwName'), sub: levelName(G.level),
        score, prev,
        calc: [['✓', fmt(G.right)], ['🔥', '×' + fmt(G.bestStreak)]],
        levels: { title: t('wwLevelLab') + ' ' + (G.level + 1), right: t(LEVELS[G.level].key), html: stepsHtml(esc, LEVELS.map((x, i) => ({ label: String(i + 1), cls: i < G.level ? 'ok' : i === G.level ? 'ok cur' : '' }))) },
        stats: [[fmt(G.right), '✓'], ['×' + fmt(G.bestStreak), '🔥'], [G.level + 1, t('wwLevelLab')]],
      }, common));
    }
    hofEnd(shell, { g: 'whowins', m: mode, s: tv() ? G.won : G.score, lv: mode === 'endless' ? G.level + 1 : 0, run: G.hof, day: G.day, daily: daily() });
  }
  function act(what) {
    if (state !== 'over') return;
    if (what === 'again') start(mode);
    else { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); renderHud(); titlePanel(); refreshHof(); }
  }

  // ── Layout (world px) ─────────────────────────────────────────────
  // web.111 (B2, narmod 2026-11-16, canvas « Qui gagne ? — maquettes »): the board in the middle of the felt,
  // each hand right above its own answer button (« ◀ Left / Right ▶ — this hand wins »), the question in a line
  // of its own above the hands — the messages (a new level, the Ace's words, the result) take that line, never
  // the cards' place. The TV show: its jokers round, under the clock; its ladder folded into a strip of 15 steps
  // on a phone, a column on the right on a computer.
  const mctx = (() => { try { return document.createElement('canvas').getContext('2d'); } catch (e) { return null; } })();
  /** The trap's card (its size depends on its text): at the bottom of the felt, the hands moved up over it. */
  function trapBox(W, cx, narrow) {
    const fs = narrow ? 7.5 : 12, lh = narrow ? 9.5 : 16, pad = narrow ? 7 : 12;
    const w = Math.min(W - 16, 460), x = cx - w / 2;
    let lines = [];
    if (G && G.trap) {
      const body = t(TRAP_KEYS[G.trap]);
      if (mctx) { mctx.font = '500 ' + fs + 'px Inter, system-ui, sans-serif'; lines = wrapLines((s2) => mctx.measureText(s2).width, body, w - 2 * pad).slice(0, 5); }
      else lines = [body];
    }
    return { fs, lh, pad, w, x, lines, h: pad * 2 + lh * (lines.length + 2) };
  }
  function L() {
    const W = shell.W, H = shell.H;
    let top = 46;
    try { top = Math.max(40, shell.hud.offsetHeight / (shell.k || 1) + 6); } catch (e) {}
    const narrow = W < 470, play = !onTitle() && !!G;
    // A phone, by its real width (a big square screen is « narrow » in the world, not a phone).
    const phone = W * (shell.k || 1) < 600;
    const isTv = tv() && play;
    // The TV ladder: a column on the right on a computer (the game keeps the rest), a strip on a phone.
    const ladW = isTv && !narrow ? Math.min(180, Math.max(132, W * 0.2)) : 0;
    const GW = W - (ladW ? ladW + 16 : 0), cx = GW / 2;
    const gap = narrow ? 4 : 6;
    let y = top + 2;
    const stripY = y, stripH = isTv && narrow ? 30 : 0;
    if (stripH) y += stripH + 6;
    const barY = y + 1;
    y = barY + 6 + (narrow ? 7 : 10);
    const jr = narrow ? 12 : 14, jokY = isTv ? y + jr : 0, jokGap = narrow ? 58 : 84;
    if (isTv) y = jokY + jr + (narrow ? 13 : 16);
    // The bottom: the two answer buttons, each hand right above its own.
    const colGap = narrow ? 8 : 24, colW = narrow ? (GW - 16 - colGap) / 2 : Math.min(160, (GW - 40 - colGap) / 2);
    const ax = cx - colGap / 2 - colW / 2, bx = cx + colGap / 2 + colW / 2;
    const btnH = narrow ? 34 : 36, btnY = H - 8 - btnH / 2;
    const hcw = Math.min(narrow ? 38 : 40, (colW - 20 - gap) / 2), hch = hcw * 1.4;
    const tb = state === 'shown' && G && G.trap ? trapBox(GW, cx, narrow) : null;
    const handsBottom = tb ? H - 8 - tb.h - (narrow ? 16 : 24) : btnY - btnH / 2 - 8;
    const handY = handsBottom - 8 - hch / 2;
    const sub = !narrow;
    const promptY = handY - hch / 2 - 8 - (narrow ? 10 : 14) - (sub ? 14 : 0), promptSubY = promptY + 15;
    // The board: in the middle of what is left, its label above (when there is room), the pot under it.
    const potR = narrow ? 6 : 7, lab = !narrow || H - top > 330;
    const room = promptY - (narrow ? 10 : 14) - y;
    let cw = Math.min(narrow ? 40 : 46, (GW - 16 - 4 * gap) / 5);
    cw = Math.max(18, Math.min(cw, (room - (lab ? 16 : 0) - potR * 2 - 10) / 1.4));
    const ch = cw * 1.4;
    const block = (lab ? 16 : 0) + ch + potR * 2 + 10;
    const blockTop = y + Math.max(0, (room - block) / 2);
    const boardY = blockTop + (lab ? 16 : 0) + ch / 2;
    return { W, H, GW, cx, narrow, phone, top, gap, cw, ch, hcw, hch, barY, boardY, labY: boardY - ch / 2 - 9, lab, potY: boardY + ch / 2 + potR + 6, potR,
      handY, ax, bx, colW, btnY, btnH, promptY, promptSubY, sub, stripY, stripH, jokY, jr, jokGap, ladW, isTv, tb };
  }
  const handXs = (l, cx) => [cx - (l.hcw + l.gap) / 2, cx + (l.hcw + l.gap) / 2];
  /** A tap on a hand, or on the answer button under it: 1 (left), -1 (right), null. */
  function handAt(l, x, y) {
    const inCol = (c) => Math.abs(x - c) <= l.colW / 2 + 4;
    const onHand = Math.abs(y - l.handY) <= l.hch / 2 + 12, onBtn = Math.abs(y - l.btnY) <= l.btnH / 2 + 4;
    if (!onHand && !onBtn) return null;
    if (inCol(l.ax)) return 1;
    if (inCol(l.bx)) return -1;
    return null;
  }
  /** The TV show's jokers (round, under the clock): [{ id, key, k, x, y, r }]. */
  function jokerSpots(l) {
    if (!l.isTv) return [];
    return JOKERS.map(([id, key, k], i) => ({ id, key, k, x: l.cx + (i - 1) * l.jokGap, y: l.jokY, r: l.jr }));
  }
  function jokerAt(l, x, y) {
    const j = jokerSpots(l).find((s2) => Math.hypot(x - s2.x, y - s2.y) <= s2.r + 6);
    return j ? j.id : null;
  }

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
    // The result: Space plays again.
    if (state === 'over') { if (a === 'jump' && info.x == null) act('again'); return; }
    if (state === 'shown') { if (a === 'jump' && time - G.shownAt > 0.4) goOn(); return; }
    // The TV show, between two questions (a phone): the ladder; a tap or Space deals the question.
    if (state === 'step') { if (a === 'jump' || info.x != null) stepDone(); return; }
    // During the deal: a tap or a key turns the rest of the board over.
    if (state === 'deal') { revealed(); return; }
    const l = L();
    if (info.x != null) {
      const id = jokerAt(l, info.x, info.y);
      if (id) { joker(id); return; }
      const h = handAt(l, info.x, info.y);
      if (h != null) answer(h);
      return;
    }
    if (a === 'n1') joker('jswap');
    else if (a === 'n2') joker('jace');
    else if (a === 'n3') joker('jsave');
    else if (a === 'left') answer(1);
    else if (a === 'right') answer(-1);
  }

  function update(dt) {
    time += dt;
    if (!G) return;
    stepFloaters(G.fx, dt);
    if (G.ban) { G.ban.t += dt; if (G.ban.t > G.ban.life) G.ban = null; }
    if (G.say) { G.say.t += dt; if (G.say.t > G.say.life) G.say = null; }
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt);
    if (G.fly) G.fly.t += dt;
    if (state === 'step') { G.stepT += dt; if (G.stepT >= STEP_S) stepDone(); }
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
    if (state !== 'over' && !onTitle()) {
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
  /** Where the pot sits: under the board. */
  const potAt = (l) => ({ x: l.cx, y: l.potY });
  function drawPot(g, l) {
    const P = potAt(l), r = l.potR;
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
  /** The Ace explains the trap: a card at the bottom of the felt — the hands have moved up above it. */
  function drawTrap(g, l) {
    const b = l.tb || trapBox(l.GW, l.cx, l.narrow), { fs, lh, pad, w, x, lines, h } = b, y = l.H - h - 6;
    g.save();
    rr(g, x, y, w, h, l.narrow ? 8 : 12); g.fillStyle = 'rgba(245,240,227,.97)'; g.fill();
    g.strokeStyle = '#d8b25a'; g.lineWidth = 1.5; g.stroke();
    g.textAlign = 'left'; g.textBaseline = 'top';
    g.fillStyle = '#8a5a00'; g.font = '700 ' + fs + 'px Inter, system-ui, sans-serif'; g.fillText('🪤 ' + t('wwTrap'), x + pad, y + pad);
    g.fillStyle = '#1d222b'; g.font = '500 ' + fs + 'px Inter, system-ui, sans-serif';
    lines.forEach((ln, i) => g.fillText(ln, x + pad, y + pad + lh * (i + 1)));
    // The game waits: « Continue ▶ » (a tap anywhere, Space).
    g.textAlign = 'right'; g.fillStyle = '#8a5a00'; g.font = '700 ' + fs + 'px Inter, system-ui, sans-serif';
    g.globalAlpha = shell.reduced ? 1 : 0.65 + 0.35 * Math.sin(time * 4);
    g.fillText(t('continueBtn'), x + w - pad, y + pad + lh * (lines.length + 1));
    g.restore();
  }
  /** The line above the hands: a message for a while (a level, the Ace's words), else the question or the result. */
  function drawPrompt(g, l) {
    const q = G.q, shown = state === 'shown' || state === 'over';
    let main = '', sub2 = '', col = '#f5f0e3', a = 1, cinzel = false;
    const msg = G.say || (G.ban && !shown ? G.ban : null);
    if (msg) {
      a = Math.max(0, Math.min(1, msg.t / 0.2, (msg.life - msg.t) / 0.4));
      main = msg.s; col = '#f5d77a'; cinzel = msg === G.ban;
    } else if (shown && q) {
      if (G.ok) { main = '✓ ' + t('wwGood'); col = '#9fe3b0'; }
      else { main = '✗ ' + (G.answer == null ? t('wwTooSlow') : t('wwMiss')) + ' · ' + t(q.win === 1 ? 'wwWasL' : 'wwWasR'); col = '#ffb0a8'; }
    } else {
      main = t('wwAsk'); if (l.sub) sub2 = t('wwAskSub');
    }
    g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col;
    fitFont(g, main, l.GW - 20, l.narrow ? 11 : 14, 800, cinzel ? 'Cinzel, Georgia, serif' : 'Inter, system-ui, sans-serif');
    g.fillText(main, l.cx, l.promptY);
    if (sub2) {
      g.globalAlpha = a * 0.75; g.fillStyle = '#f5f0e3';
      fitFont(g, sub2, l.GW - 20, 10, 500);
      g.fillText(sub2, l.cx, l.promptSubY);
    }
    g.restore();
  }
  /** An answer button, right under its hand: « ◀ Left » / « Right ▶ », and « this hand wins » (or the Ace's hint). */
  function answerBtn(g, l, side) {
    const x = side === 1 ? l.ax : l.bx, y = l.btnY, w = l.colW, h = l.btnH, off = state !== 'ask' || (tv() && G.out === side);
    g.save(); g.globalAlpha = off ? 0.5 : 1;
    rr(g, x - w / 2, y - h / 2 + 2, w, h, Math.min(12, h * 0.3)); g.fillStyle = 'rgba(0,0,0,.28)'; g.fill();
    rr(g, x - w / 2, y - h / 2, w, h, Math.min(12, h * 0.3));
    const gr = g.createLinearGradient(0, y - h / 2, 0, y + h / 2); gr.addColorStop(0, '#ffd27a'); gr.addColorStop(1, '#d8a93e');
    g.fillStyle = gr; g.fill();
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#1b1408';
    const label = side === 1 ? '◀ ' + t('wwLeft') : t('wwRight') + ' ▶';
    fitFont(g, label, w - 12, l.narrow ? 12 : 14, 800);
    g.fillText(label, x, y - h * 0.16);
    const hint = tv() && G.hint && G.q ? t(NAME_KEYS[(side === 1 ? G.q.ra : G.q.rb).cat]) : '';
    const sub2 = hint || t('wwThisWins') + (keyboardFirst() && !l.narrow ? '  ' + (side === 1 ? '←' : '→') : '');
    g.fillStyle = hint ? '#1d3f9a' : 'rgba(27,20,8,.72)';
    fitFont(g, sub2, w - 12, l.narrow ? 7.5 : 9, hint ? 800 : 600);
    g.fillText(sub2, x, y + h * 0.24);
    g.restore();
  }
  const JOKER_ICON = { jswap: '⇄', jace: '?', jsave: '♥' };
  /** The TV show's jokers, round medallions under the clock; one used is greyed and struck through. */
  function drawJokers(g, l) {
    for (const j of jokerSpots(l)) {
      const used = !G.jok[j.id], live = state === 'ask' && !used;
      g.save();
      g.beginPath(); g.arc(j.x, j.y, j.r + 3, 0, Math.PI * 2); g.fillStyle = 'rgba(42,31,92,.35)'; g.fill();
      g.beginPath(); g.arc(j.x, j.y, j.r, 0, Math.PI * 2);
      if (used) g.fillStyle = 'rgba(20,20,30,.55)';
      else { const rg = g.createRadialGradient(j.x - j.r * 0.3, j.y - j.r * 0.35, 1, j.x, j.y, j.r); rg.addColorStop(0, '#4a3a8c'); rg.addColorStop(0.55, '#2a1f5c'); rg.addColorStop(1, '#160f36'); g.fillStyle = rg; }
      g.fill();
      g.lineWidth = l.narrow ? 1.6 : 2.2; g.strokeStyle = used ? 'rgba(216,178,90,.35)' : '#f5d77a'; g.stroke();
      g.globalAlpha = used ? 0.4 : live ? 1 : 0.7;
      g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '800 ' + Math.round(j.r * 1.05) + 'px Inter, system-ui, sans-serif';
      g.fillText(JOKER_ICON[j.id], j.x, j.y + 0.5);
      g.globalAlpha = 1;
      if (used) { g.strokeStyle = '#e2554a'; g.lineWidth = l.narrow ? 2 : 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(j.x - j.r * 0.7, j.y + j.r * 0.5); g.lineTo(j.x + j.r * 0.7, j.y - j.r * 0.5); g.stroke(); }
      if (keyboardFirst() && !l.narrow) {
        g.beginPath(); g.arc(j.x + j.r * 0.78, j.y + j.r * 0.78, 7, 0, Math.PI * 2); g.fillStyle = '#fbf7ee'; g.fill();
        g.fillStyle = '#1b1408'; g.font = '800 9px Inconsolata, monospace'; g.fillText(j.k, j.x + j.r * 0.78, j.y + j.r * 0.78 + 0.5);
      }
      g.globalAlpha = used ? 0.45 : 0.9; g.fillStyle = '#f5f0e3';
      fitFont(g, t(j.key), l.jokGap - 6, l.narrow ? 7 : 10, 700);
      g.fillText(t(j.key), j.x, j.y + j.r + (l.narrow ? 7 : 10));
      g.restore();
    }
  }
  /** The ladder's state: the question asked (index), the chips assured. */
  const ladderAt = () => Math.min(G.right, LADDER.length - 1);
  /** A phone: the ladder folded into a strip — the question, its chips, what is assured, 15 steps. */
  function drawStrip(g, l) {
    const x = 8, w = l.GW - 16, y = l.stripY, h = l.stripH, cur = ladderAt();
    g.save();
    rr(g, x, y, w, h, 7); g.fillStyle = 'rgba(8,14,12,.55)'; g.fill(); g.strokeStyle = 'rgba(216,178,90,.55)'; g.lineWidth = 0.8; g.stroke();
    g.textBaseline = 'middle'; g.textAlign = 'left';
    g.fillStyle = '#f5d77a'; g.font = '700 9px Cinzel, Georgia, serif';
    const q = t('wwQuestion', { n: cur + 1 }); g.fillText(q, x + 7, y + 9);
    const qw = g.measureText(q).width;
    g.fillStyle = '#ffffff'; g.font = '800 9.5px Inconsolata, monospace'; g.fillText(fmt(LADDER[cur]), x + 12 + qw, y + 9);
    g.textAlign = 'right'; g.fillStyle = 'rgba(245,240,227,.75)';
    const as = t('wwAssured', { n: fmt(keptAfter(cur)) }) + ' ◆';
    fitFont(g, as, w * 0.42, 7, 600); g.fillText(as, x + w - 7, y + 9);
    const sw = (w - 14 - 14 * 2) / 15;
    for (let i = 0; i < LADDER.length; i++) {
      const sx = x + 7 + i * (sw + 2), now = i === cur, hh = now ? 7 : 4.5, sy = y + h - 9 - hh / 2;
      rr(g, sx, sy, sw, hh, 1.5);
      g.fillStyle = i < cur ? '#9fe3b0' : now ? '#f5d77a' : 'rgba(255,255,255,.18)'; g.fill();
      if (SAFE.indexOf(i) >= 0) { g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.stroke(); }
    }
    g.restore();
  }
  /** The whole ladder: 15 rows, the million on top; the question asked in gold, the ones won ✓, the safe levels ◆. */
  function drawLadder(g, x, y, w, rowH, fs, cur) {
    g.save();
    const h = rowH * LADDER.length + 12;
    rr(g, x, y, w, h, 9); g.fillStyle = 'rgba(6,12,10,.72)'; g.fill(); g.strokeStyle = 'rgba(216,178,90,.6)'; g.lineWidth = 1.2; g.stroke();
    g.textBaseline = 'middle';
    for (let i = LADDER.length - 1; i >= 0; i--) {
      const ry = y + 6 + (LADDER.length - 1 - i) * rowH, mid = ry + rowH / 2, safe = SAFE.indexOf(i) >= 0, done = i < cur, now = i === cur;
      if (now) { rr(g, x + 4, ry + 1, w - 8, rowH - 2, 5); const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, '#ffd27a'); gr.addColorStop(1, '#d8a93e'); g.fillStyle = gr; g.fill(); }
      else if (safe) { rr(g, x + 4, ry + 1, w - 8, rowH - 2, 5); g.fillStyle = 'rgba(255,255,255,.07)'; g.fill(); }
      const col = now ? '#1b1408' : safe ? '#ffffff' : done ? 'rgba(245,215,122,.45)' : '#f5d77a';
      g.fillStyle = col; g.textAlign = 'right'; g.font = '700 ' + (fs - 1) + 'px Inconsolata, monospace';
      g.globalAlpha = 0.8; g.fillText(String(i + 1), x + 4 + fs * 1.5, mid); g.globalAlpha = 1;
      if (done || safe) { g.textAlign = 'center'; g.font = '700 ' + (fs - 2) + 'px Inter, system-ui, sans-serif'; g.fillStyle = now ? '#1b1408' : done ? '#9fe3b0' : '#ffffff'; g.fillText(done ? '✓' : '◆', x + 4 + fs * 2.6, mid); }
      g.textAlign = 'right'; g.fillStyle = col; g.font = '800 ' + fs + 'px Inconsolata, monospace';
      g.fillText(fmt(LADDER[i]), x + w - 10, mid);
    }
    g.restore();
    return h;
  }
  function drawLegend(g, cx, y, fs) {
    g.save(); g.textBaseline = 'middle'; g.textAlign = 'center'; g.font = '600 ' + fs + 'px Inter, system-ui, sans-serif'; g.fillStyle = 'rgba(245,240,227,.75)';
    g.fillText('◆ ' + t('wwLadSafe') + '   ✓ ' + t('wwLadWon'), cx, y);
    g.restore();
  }
  /** A phone, between two questions: the ladder, the Ace announcing the next one, « Continue ▶ ». */
  function drawStep(g, l) {
    const cur = ladderAt(), a = Math.min(1, G.stepT / 0.25);
    g.save(); g.globalAlpha = a;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#f5d77a';
    const s2 = t('wwNextQ', { n: cur + 1, s: fmt(LADDER[cur]) });
    fitFont(g, s2, l.W - 70, 12, 800, 'Cinzel, Georgia, serif');
    g.fillText(s2, (l.W - 44) / 2, l.top + 6);
    const rowH = Math.min(16, (l.H - l.top - 62) / LADDER.length), w = Math.min(l.W - 30, 170);
    const h = drawLadder(g, (l.W - w) / 2, l.top + 20, w, rowH, Math.min(10, rowH * 0.62), cur);
    drawLegend(g, l.W / 2, l.top + 20 + h + 9, 7);
    g.fillStyle = '#f5f0e3'; g.globalAlpha = a * (shell.reduced ? 0.8 : 0.55 + 0.3 * Math.sin(time * 4)); g.font = '700 9px Inter, system-ui, sans-serif';
    g.fillText(t('continueBtn'), l.W / 2, l.H - 12);
    g.restore();
  }
  function draw(g) {
    const l = L(), W = l.W, H = l.H;
    felt(g, W, H, shell.theme.light);
    g.save();
    // A wrong answer shakes the table.
    if (G && G.shake > 0) g.translate(Math.sin(time * 70) * 6 * (G.shake / 0.4), 0);
    if (G && state === 'step') drawStep(g, l);
    else if (!onTitle() && G && G.q) {
      const q = G.q, shown = state === 'shown' || state === 'over';
      const glow = G.streak >= FEVER_STREAK ? 0.5 + 0.5 * Math.sin(time * 6) : 0;
      // Winning five: the winner's (both on a split).
      const lit = shown ? new Set(q.win >= 0 ? q.ra.best : []) : new Set();
      if (shown && q.win <= 0) q.rb.best.forEach((c) => lit.add(c));
      if (l.stripH) drawStrip(g, l);
      if (l.ladW) {
        const rowH = Math.min(22, (H - l.top - 40) / LADDER.length);
        const h = drawLadder(g, W - l.ladW - 8, l.top + 4, l.ladW, rowH, Math.min(13, rowH * 0.6), ladderAt());
        drawLegend(g, W - 8 - l.ladW / 2, l.top + 4 + h + 10, 9);
      }
      // The clock.
      const bw = Math.min(l.GW - 24, 320), bx0 = l.cx - bw / 2;
      const frac = state === 'deal' ? 1 : Math.max(0, G.tLeft / G.tMax);
      rr(g, bx0, l.barY, bw, 6, 3); g.fillStyle = 'rgba(0,0,0,.3)'; g.fill();
      if (frac > 0) { rr(g, bx0, l.barY, bw * frac, 6, 3); g.fillStyle = frac > 0.5 ? '#3fae6a' : frac > 0.25 ? '#e0a33a' : '#d2453b'; g.fill(); }
      drawJokers(g, l);
      // The board, in the middle.
      if (l.lab) {
        g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(245,240,227,.55)';
        const bl = t('wwBoardLab').toUpperCase(); fitFont(g, bl, l.GW - 20, l.narrow ? 7 : 10, 700); g.fillText(bl, l.cx, l.labY); g.restore();
      }
      for (let i = 0; i < 5; i++) {
        const x = l.cx + (i - 2) * (l.cw + l.gap);
        const p = state === 'deal' ? (G.dealT - REVEAL[i]) / FLIP : 1;
        flipCard(g, q.board[i], x, l.boardY, l.cw, l.ch, p, shown && lit.has(q.board[i]), shown && !lit.has(q.board[i]), shown ? 0 : glow);
      }
      if (state !== 'over') drawPot(g, l);
      drawPrompt(g, l);
      // The two hands, each right above its answer button; their names once answered.
      [[q.a, q.ra, l.ax, 1], [q.b, q.rb, l.bx, -1]].forEach(([hand, r, cx, side]) => {
        const xs = handXs(l, cx);
        const won = shown && (q.win === side || q.win === 0);
        const bw2 = 2 * l.hcw + l.gap + 16, bh2 = l.hch + 14;
        rr(g, cx - bw2 / 2, l.handY - bh2 / 2, bw2, bh2, 10);
        g.fillStyle = shown ? (won ? 'rgba(216,178,90,.28)' : 'rgba(0,0,0,.22)') : 'rgba(0,0,0,.18)'; g.fill();
        if (shown && G.answer === side) { g.strokeStyle = G.ok ? '#3fae6a' : '#d2453b'; g.lineWidth = 2.5; g.stroke(); }
        else if (!shown) { g.strokeStyle = 'rgba(245,215,122,.4)'; g.lineWidth = 1.2; g.stroke(); }
        for (let k = 0; k < 2; k++) card(g, hand[k], xs[k], l.handY, l.hcw, l.hch, shown && lit.has(hand[k]), shown && !lit.has(hand[k]));
        // Crossed out by a second chance.
        if (!shown && tv() && G.out === side) {
          rr(g, cx - bw2 / 2, l.handY - bh2 / 2, bw2, bh2, 10); g.fillStyle = 'rgba(0,0,0,.6)'; g.fill();
          g.fillStyle = 'rgba(255,138,128,.9)'; g.font = '700 30px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText('✕', cx, l.handY);
        }
        if (shown) {
          const label = t(NAME_KEYS[r.cat]);
          g.fillStyle = won ? '#f5d77a' : 'rgba(245,240,227,.75)'; g.textAlign = 'center'; g.textBaseline = 'top';
          fitFont(g, label, l.colW - 6, l.narrow ? 10 : 13, 700);
          g.fillText(label, cx, l.handY + bh2 / 2 + 5);
        } else answerBtn(g, l, side);
      });
      if (G.trap && (state === 'shown' || state === 'over')) drawTrap(g, l);
    }
    g.restore();
    // The Ace, top right: he reacts to the answers (mood, pose); his words go to the line above the hands.
    const s = l.narrow ? 0.17 : 0.22, ax = W - (l.narrow ? 20 : 30), ay = l.top + (l.narrow ? 0 : 18);
    if (l.ladW) ace.place(W - l.ladW - 40, ay, s, shell.k);
    else ace.place(ax, ay, s, shell.k);
    if (G) drawFloaters(g, G.fx);
  }

  return {
    calm: true,          // painted only when its drawing changes (calm.mjs, web.110)
    update, draw, input, resize: renderResult,
    running: () => state === 'step' || state === 'deal' || state === 'ask' || state === 'shown',
    destroy() { clearTimeout(timer); ace.remove(); },
  };
}

function ensureCss() {
  if (document.getElementById('pth-game-ww-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-ww-css';
  st.textContent = '#pth-game .ww-box{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 18px;border-radius:12px;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .ww-box h2{color:#f5d77a}#pth-game .ww-lives{color:#ff8a80;letter-spacing:2px}'
    // The result; the modes use the arcade's tiles (.gm-tile), their record in gold.
    + '#pth-game .ww-box{min-width:min(330px,100%)}#pth-game .ww-box h2{font-size:clamp(18px,3.4vw,24px);white-space:nowrap}'
    + '#pth-game .pg-panel .ww-won{font:700 26px Cinzel,Georgia,serif;color:#f5d77a;margin:0}#pth-game.pg-light .pg-panel .ww-won{color:#8a6a10}'
    + '#pth-game .pg-panel .ww-streakd{color:#ffb84d;font-weight:700;margin:0}#pth-game.pg-light .pg-panel .ww-streakd{color:#b5521b}'
    + '#pth-game .ww-btns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;pointer-events:auto;margin-top:4px}'
    // The Ace stands top right: the streak label keeps clear of him.
    + '#pth-game .ww-streak{padding-right:46px}'
    + '#pth-game .ww-streak.ww-fever{color:#ffb84d;text-shadow:0 0 8px rgba(255,150,40,.8);animation:ww-fever 1s ease-in-out infinite alternate}'
    + '@keyframes ww-fever{from{opacity:.75}to{opacity:1}}@media (prefers-reduced-motion:reduce){#pth-game .ww-streak.ww-fever{animation:none}}'
    + '#pth-game.pg-light .ww-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .ww-box h2{color:#8a6510}#pth-game.pg-light .ww-box .ar-final{color:#1d222b}';
  document.head.appendChild(st);
}
