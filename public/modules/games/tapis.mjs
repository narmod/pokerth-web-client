// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Tapis! — mini-game n° 4 of the arcade (narmod 2026-11-15, in the spirit of
// Megatouch's Monster Madness; design note claude/CONCEPTION_TAPIS.md). It
// takes the House of Cards' place in the path; the House stays as an easter
// egg bonus (games/index.mjs).
//
// Columns of chips stand on the felt, one of the Ace's friends on top of each
// and a hole in the felt under each. A tap on 2 or more chips of one colour
// that touch takes them away (tapis-rules.mjs: the group is named after a
// poker hand by its size, and pays its chips' values × that hand); the
// column falls. An empty column: its friend jumps into his hole. Every friend
// in his hole before the clock runs out: the next round, one blind level up.
//   Chips     thick, each with its suit and value: 5 ♥ red, 10 ♦ blue,
//             25 ♣ green, 100 ♠ black, 500 ★ purple (a 4th colour from
//             level 5, a 5th from 13)
//   Preview   the group under the cursor or the mouse lights up, with its
//             hand and what it pays
//   Powers    a group of 6 or more wins a Dealer button (a row and a column)
//             or a Shuffle, 9 or more a Joker (every chip of a colour); one
//             Shuffle more every round. Pills at the top: tap, 1 2 3, or the
//             cursor above the chips
//   Recave    no pair left (a Joker or Dealer in hand or not): the dealer
//             pushes 2-3 rows in from the felt under every column, in the
//             table's colours, joined to the old stacks (refillRows, web.87) — never
//             stuck; « No more moves! » in big, no time taken (web.86)
//   Drops     (web.88) his stack comes down: he drops after it a moment
//             later, the Joker floating down like the arcade's ghost; a group
//             pays more for its 5th to 8th chips (×2) and from its 9th (×3),
//             each chip's points written on it as it goes (tierOf)
//   Spirits   round won: each friend's spirit flies up out of his hole,
//             SPIRIT_PAY × level each (Monster Madness' 1 000 a monster)
//   Columns   as in Monster Madness (narmod, the arcade video at 0:56-1:08,
//             web.90): an emptied column goes once its friend is in his hole,
//             and the others close up in the middle; « No more moves! » brings
//             the table back to its full width (columns without a friend on
//             each side, over the graves) with 2-3 rows under all of them.
//             The round is won when every friend is in his hole, chips may be
//             left; the board empty too: « Table cleared! » and the bonus.
//   Input     one touch takes the group (the double touch of web.86 was
//             dropped in web.92: a single touch is handier on a phone);
//             mouse: hover shows it, a click takes it; or the cursor: ← → ↑ ↓ (keys, D-pad, TV remote),
//             Space / Enter / A takes the lit group
//   Friends   the cast of cast.mjs (push 2, web.76): the Suits at levels 1-2,
//             the Figures at 3-4, and so on two by two, all mixed from 21
//             (castFamily). Their eyes follow the lit chip; they sweat when
//             their stack is nearly gone or the clock nearly out, wobble on
//             a low stack, squash when it drops under them, clap when a
//             neighbour falls, jump in with joy, then pop their head out of
//             the hole to wave before they go; dizzy at a Shuffle, KO at the end.
//   Levels    (push 3, web.78) a venue of the runner's scenery every 4
//             levels, from day to night along them (venueAt, dayOfLevel); what
//             each level brings (levelKit): cards in the stacks (a group going
//             next to one sends it to the hand of 5 at the top; 5 cards: the
//             hand pays 100 × level × its multiplier), Joker chips (every
//             colour), the Dealer button in a friend's hand (first in his hole:
//             ×2), sealed chips (a group next to one breaks the seal), rows
//             rising from the felt. Each new thing has its word the first time.
//   Modes     (push 4, web.81) Classic (rounds against the clock); Madness
//             (no clock: a row rises every few seconds, sooner each level, at
//             once when no pair is left; a stack over the red line ends it);
//             Daily (the Classic, every deal seeded by the day — pth_tp_daily);
//             Zen (no clock, no rising rows, no seals, free recaves, 5 rounds).
//             Records: Classic shell.best, Madness and Zen pth_tp_best.
//   Trophy    (push 6, web.84) « Table rase », the secret trophy 'tapis': a
//             round cleared from level 5 without a recave, Classic or Daily.
//   Duel      (push 5, web.83) two players on one screen, each in turn on the
//             same table (narmod: form A): TURN_S seconds a move (out: the
//             turn passes), DUEL_ROUNDS rounds, each player his own score,
//             bonuses and hand of 5 (swapped in and out of G at each turn);
//             who empties a stack wins its friend; the dealer recaves free.
// ═══════════════════════════════════════════════════════════════════

import { NAME_KEYS, MULT, evalCards } from './poker-hand.mjs';
import { CHIPS, colorsAt, timeFor, inPay, TIME_PAY, cleanPay, blindsAt, groupPay, groupAt, anyMove,
  removeCells, colorCells, crossCells, shuffleGrid, dealRound, chipsLeft, powerFor, POWER_MAX, castFamily, tierOf,
  WILD, CARD, levelKit, KIT_FROM, venueAt, dayOfLevel, freedBy, riseRow, refillRows } from './tapis-rules.mjs';
import { fmt, rr, ink, drawFace, imageCache, SUITS as SUIT_SIGNS, RANKS, isRed } from './common.mjs';
import { drawScenery, sceneryStill, VENUES } from './runner-scenery.mjs';
import { castActor, SUITS, FIGURES, KINDS } from './cast.mjs';
import { titleScreen, titleStep } from './title.mjs';
import { hofOn, hofStart, hofEnd, hofPanel } from './hof.mjs';
import { rng } from './deal.mjs';
import { dayKey } from './solitaire-rules.mjs';
import { spriteCache } from './sprites.mjs';
import { endScreen, barsHtml, listHtml } from './end.mjs';

const SINK_S = 0.45, PEEK_S = 1.1;          // into the hole, then his head out to wave
/** The characters of the round (cast.mjs): the family of the level, a different one on each column as far as it goes. */
function castFor(lv, cols, R = Math.random) {
  const fam = castFamily(lv);
  if (fam === 'mixed') return Array.from({ length: cols }, () => KINDS[Math.floor(R() * KINDS.length)]);
  const set = (fam === 'figures' ? FIGURES : SUITS).concat(['joker']);
  for (let j = set.length - 1; j > 0; j--) { const x = Math.floor(R() * (j + 1)); const t = set[j]; set[j] = set[x]; set[x] = t; }
  return Array.from({ length: cols }, (_, c) => set[c % set.length]);
}
export const MODES = [
  { id: 'classic', icon: '⏱️', key: 'tpClassic', desc: 'tpClassicD' },
  { id: 'folie', icon: '🌀', key: 'tpFolie', desc: 'tpFolieD' },
  { id: 'daily', icon: '📅', key: 'psDaily', desc: 'hcModeDailyD' },
  { id: 'zen', icon: '🧘', key: 'hcModeZen', desc: 'tpZenD' },
  { id: 'duel', icon: '🆚', key: 'pdTwo', desc: 'tpDuelD' },
];
export const ZEN_ROUNDS = 5;
export const DUEL_ROUNDS = 3, TURN_S = 10;
export const TROPHY_LV = 5;
export const SPIRIT_PAY = 100;
const SIGN_S = 2.4;                        // « Couché ! » stays this long by his hole            // × level: each friend's spirit at the round's end (Monster Madness: 1 000 a monster)              // « Table rase »: from this level
const HANDOVER_S = 0.9;                     // a move made: the turn passes once its chips and cards have landed
const P_COLOR = ['#e8b84a', '#7fc8ff'];     // player 1 gold, player 2 blue (as in Poker Drop)
/** Madness: seconds between two rising rows at level lv. */
export const folieEvery = (lv) => Math.max(2.5, 6.5 - 0.35 * (Math.max(1, lv) - 1));
const DAILY_KEY = 'pth_tp_daily', BEST_KEY = 'pth_tp_best';
function loadJ(k) { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } }
function saveJ(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
const POWERS = ['joker', 'dealer', 'shuffle'];
const P_ICON = { joker: '🃏', dealer: 'D', shuffle: '🔀' };
const P_KEY = { joker: 'tpJoker', dealer: 'tpDealer', shuffle: 'tpShuffle' };
const TOP = 66;                 // the HUD and the powers' pills above the board
const PILL_Y = 52, PILL_H = 22;
/** A power's pill: 58 wide, less on a narrow (portrait) stage. */
const pillW = (W) => Math.max(40, Math.min(58, (W - 20) / 3 - 6));

export function create(shell) {
  const { t, esc, sound } = shell;
  const H = shell.H;
  shell.touchPad(false);
  shell.hud.classList.add('on-felt');
  if (!document.getElementById('pth-game-tp-css')) {
    const st = document.createElement('style'); st.id = 'pth-game-tp-css';
    st.textContent = '#pth-game .tp-time{width:96px;height:9px;margin-top:5px;border-radius:5px;background:rgba(245,240,227,.14);overflow:hidden}'
      + '#pth-game .tp-time i{display:block;height:100%;width:100%;border-radius:5px;background:linear-gradient(90deg,#d23c2a,#e8b23a 35%,#3fae6a 70%,#53d17f);background-size:96px 100%;transition:width .25s linear}'
      + '#pth-game .tp-time.low{box-shadow:0 0 10px rgba(255,74,58,.8)}'
      + '@media (max-width:520px){#pth-game .tp-time{width:64px}#pth-game .tp-time i{background-size:64px 100%}}';
    document.head.appendChild(st);
  }
  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('hcScore')) + '</div><div class="ar-num tp-score">0</div></div>'
    + '<div><div class="ar-lab">' + esc(t('arLevel')) + '</div><div class="ar-num tp-lv">1</div></div></div>'
    + '<div class="ar-hand"><div class="ar-lab tp-blinds"></div><div class="tp-time"><i></i></div></div>';
  const q = (s) => /** @type {HTMLElement} */ (shell.hud.querySelector(s));
  const hScore = q('.tp-score'), hLv = q('.tp-lv'), hBlinds = q('.tp-blinds'), hTimeBox = q('.tp-time'), hTime = q('.tp-time i');
  const hLabs = /** @type {HTMLElement[]} */ (Array.from(shell.hud.querySelectorAll('.ar-stats .ar-lab')));

  let state = 'title', time = 0, timer = 0, check = 0, sel = 0, mode = 'classic', R = Math.random;
  /** The title, or the Hall of Fame's boards opened from it (the same scene behind). */
  const onTitle = () => state === 'title' || state === 'board';
  const timed = () => mode === 'classic' || mode === 'daily';
  const duel = () => mode === 'duel';
  /** @type {any} */
  let G = null;
  let hover = null;

  // ── Geometry (world px; the stage is H = 360 high, W wide) ────────
  const colsFor = (W) => (W < H * 0.95 ? 6 : Math.max(6, Math.min(12, Math.round(W / H * 4.6))));
  function geom() {
    const W = shell.W, cols = G.cols;
    const cw = Math.min(W * 0.94 / Math.max(1, G.cols0 || cols), 46);
    return { W, cw, bh: cw * 0.5, ry: cw * 0.17, rx: cw * 0.43, x0: (W - cw * cols) / 2, base: H - Math.max(14, cw * 0.5) };
  }
  const rowsFor = (L) => Math.max(5, Math.min(14, Math.floor((L.base - TOP - L.cw * 1.9 - L.ry) / L.bh)));
  /** Where column c should stand, and where it is drawn (sliding there). */
  const colAim = (L, c) => L.x0 + L.cw * (c + 0.5);
  const colX = (L, c) => (G.xs && G.xs[c] != null ? G.xs[c] : colAim(L, c));
  /** The bottom of chip r's side in column c (with its fall). */
  const chipY = (L, c, r) => L.base - (r + (G.grid[c][r] ? G.grid[c][r].off : 0)) * L.bh;

  // ── A round ───────────────────────────────────────────────────────
  /** A column with no friend on it (put back by « No more moves! »): its hole is a grave already. */
  const NOOP = { pose() {}, mood() {}, sweat() {}, look() {}, fx() {}, place() {}, clip() {}, show() {}, fade() {}, remove() {}, badge() {} };
  const noFriend = () => ({ ace: NOOP, none: true, st: 'in', y: 0, kind: '' });
  function newGame() {
    if (G) (G.all || []).forEach((ch) => ch.ace.remove());   // the friends of the title's board
    G = { lv: 1, score: 0, cols: colsFor(shell.W), grid: [], chars: [], inv: { joker: 0, dealer: 0, shuffle: 1 }, armed: '',
      cursor: { c: 0, r: 0, bar: -1 }, showCursor: false, inTotal: 0, bestCat: -1, rounds: [], fx: [], parts: [], say: null, banner: null,
      timeLeft: 0, timeMax: 1, lastTick: 0, venue: 0, prevVenue: 0, venueT: 1, hand: [], handFull: null, bestHand: null, flying: [], riseT: 0 };
  }
  function newRound() {
    (G.all || []).forEach((ch) => ch.ace.remove());
    G.wonLv = false;
    G.cols0 = G.cols = colsFor(shell.W);
    const L = geom();
    G.xs = Array.from({ length: G.cols }, (_, c) => colAim(L, c)); G.closing = []; G.signs = []; G.picked = null;
    G.maxRows = rowsFor(L);
    if (mode === 'daily') R = rng('tp-' + dayKey() + '-' + G.lv);
    // Madness starts lower (room for the rows to come); Zen has no seals.
    G.grid = dealRound(G.lv, G.cols, mode === 'folie' ? Math.max(5, Math.round(G.maxRows * 0.6)) : G.maxRows, R);
    if (mode === 'zen') G.grid.forEach((col) => col.forEach((b) => { b.seal = false; }));
    G.grid.forEach((col, c) => col.forEach((b, r) => { b.off = 6 + r * 0.6 + c * 0.5; }));   // the chips fall into place
    G.total = chipsLeft(G.grid);
    G.timeMax = G.timeLeft = timed() ? timeFor(G.total, G.lv) : 1;
    hTimeBox.style.visibility = mode === 'zen' ? 'hidden' : '';
    G.armed = '';
    G.cursor = { c: Math.floor(G.cols / 2), r: 0, bar: -1 };
    const kinds = castFor(G.lv, G.cols, R);
    G.chars = G.grid.map((_, c) => {
      const ace = castActor(shell.layer, kinds[c], 'pth-game-tp' + c);
      return { ace, kind: kinds[c], slot: c, st: 'top', y: -60, vy: 0, sink: 0, mood: '', pose: '', clapUntil: 0, look: 0, eye: '', sweat: false, dealer: false, double: false };
    });
    G.all = G.chars.slice();                 // every friend of the round, his column gone or not (the spirits)
    // What the level brings: the Dealer button in a friend's hand, rows from the felt, the venue.
    G.kit = levelKit(G.lv); G.riseT = 0; G.firstIn = false; G.recaved = false;
    if (mode === 'zen') { G.kit.rise = 0; G.kit.seals = 0; }
    if (mode === 'folie') G.kit.rise = folieEvery(G.lv);
    if (G.kit.dealer) { const d = G.chars[Math.floor(R() * G.chars.length)]; d.dealer = true; d.ace.badge(true); }
    const v = venueAt(G.lv);
    if (v !== G.venue) { G.prevVenue = G.venue; G.venue = v; G.venueT = 0; }
    renderHud();
  }
  function renderHud() {
    hBlinds.textContent = blindsAt(G.lv);
    if (duel() && G.players) {             // Duel: the two scores, the player to play lit
      const sc = (i) => (i === G.turn ? G.score : G.players[i].score);
      hLabs[0].textContent = (G.turn === 0 ? '▶ ' : '') + t('pdPlayer', { n: 1 }); hLabs[1].textContent = (G.turn === 1 ? '▶ ' : '') + t('pdPlayer', { n: 2 });
      hScore.textContent = fmt(sc(0)); hLv.textContent = fmt(sc(1));
      hLabs[0].style.color = hScore.style.color = G.turn === 0 ? P_COLOR[0] : '';
      hLabs[1].style.color = hLv.style.color = G.turn === 1 ? P_COLOR[1] : '';
      hTime.style.background = P_COLOR[G.turn];
      return;
    }
    hLabs[0].textContent = t('hcScore'); hLabs[1].textContent = t('arLevel');
    hLabs[0].style.color = hLabs[1].style.color = hScore.style.color = hLv.style.color = hTime.style.background = '';
    hScore.textContent = fmt(G.score);
    hLv.textContent = String(G.lv);
  }
  /** Duel: the turn goes to player i — the current one's score, bonuses and hand put away, i's taken out. */
  function turnTo(i) {
    const P = G.players, cur = P[G.turn];
    Object.assign(cur, { score: G.score, inv: G.inv, hand: G.hand, bestHand: G.bestHand, inTotal: G.inTotal, bestCat: G.bestCat });
    G.turn = i;
    const n = P[i];
    Object.assign(G, { score: n.score, inv: n.inv, hand: n.hand, bestHand: n.bestHand, inTotal: n.inTotal, bestCat: n.bestCat });
    G.turnT = TURN_S; G.armed = ''; G.handover = 0; G.lastTick = 0; G.picked = null;
    renderHud(); say(t('pdTurn', { n: i + 1 })); sound('notifyAction');
  }
  /** A move is made: in the Duel, the turn will pass. */
  const moved = () => { if (duel()) G.handover = HANDOVER_S; };

  // ── Title ─────────────────────────────────────────────────────────
  function records() {
    const d = loadJ(DAILY_KEY), b = loadJ(BEST_KEY);
    return { classic: shell.best.get(), folie: b.folie || 0, daily: d.d === dayKey() ? d.s || 0 : 0, zen: b.zen || 0 };
  }
  function titlePanel() {
    const rec = records();
    titleScreen(shell, { id: 'tapis', live: true, name: t('tpName'), hint: t('tpHint'), sel,
      modes: MODES.map((m) => ({ icon: m.icon, label: t(m.key), desc: t(m.desc), rec: rec[m.id] ? t('arRecord', { n: fmt(rec[m.id]) }) : '' })),
      options: hofEnabled ? [{ id: 'hof', label: '🏆 ' + t('hofTitle'), key: '↓' }] : [],
      onOption: (id) => { if (id === 'hof') openHof(); },
      onPick: (i) => { sel = i; start(); } });
  }
  // The Hall of Fame (hof.mjs, claude/CONCEPTION_HALL_OF_FAME.md, web.99): the solo modes only (not the Duel);
  // the title's 🏆 only while the admin has it on.
  const HOF_MODES = MODES.filter((m) => m.id !== 'duel');
  let hofEnabled = false;
  function refreshHof() {
    hofOn('tapis').then((on) => { if (on !== hofEnabled) { hofEnabled = on; if (state === 'title') titlePanel(); } }).catch(() => {});
  }
  function openHof() {
    state = 'board';
    hofPanel(shell, { g: 'tapis', name: t('tpName'), sel: Math.max(0, HOF_MODES.findIndex((m) => m.id === MODES[sel].id)),
      modes: HOF_MODES.map((m) => ({ id: m.id, label: t(m.key) })), onBack: () => { state = 'title'; titlePanel(); refreshHof(); } });
  }
  newGame(); newRound();
  titlePanel();
  refreshHof();

  function start() {
    clearTimeout(timer); clearTimeout(check);
    mode = MODES[sel].id; R = Math.random;
    newGame();
    if (duel()) {
      const p = () => ({ score: 0, inv: { joker: 0, dealer: 0, shuffle: 1 }, hand: [], bestHand: null, inTotal: 0, bestCat: -1 });
      G.players = [p(), p()]; G.turn = 0; G.inv = G.players[0].inv; G.hand = G.players[0].hand; G.turnT = TURN_S; G.handover = 0;
    }
    newRound();
    state = 'run'; shell.panel(null);
    G.hof = duel() ? null : hofStart('tapis', mode); G.hofDay = dayKey();   // the Hall of Fame's ticket (not in the Duel)
    say(duel() ? t('pdTurn', { n: 1 }) : t('tpHint'));
    G.banner = { s: t('arLevel') + ' 1', s2: t('tpBlinds', { b: blindsAt(1) }), t: 0, life: 1.6 };
  }
  function say(s) { if (G) G.say = { s, t: 0 }; }

  // ── Playing ───────────────────────────────────────────────────────
  function act(c, r) {
    if (state !== 'run' || !G.grid[c] || !G.grid[c][r] || G.handover > 0) return;
    if (G.armed) { usePower(G.armed, c, r); return; }
    const grp = groupAt(G.grid, c, r);
    if (grp.length < 2) {
      sound('notifyFold'); G.grid[c][r].shake = 0.3;
      if (!G.say || G.say.s !== t('tpAlone')) say(t('tpAlone'));
      return;
    }
    const pay = groupPay(G.grid, grp), L = geom();
    const top = grp.reduce((m, [x, y]) => (y > m[1] ? [x, y] : m), grp[0]);
    // what each chip brings, written on it as it goes (Monster Madness' « 100 / 250 / 500 »: more in a big group)
    grp.filter(([c, r]) => G.grid[c][r].k >= 0).forEach(([c, r], i) => {
      if (pay.each[i]) G.fx.push({ s: fmt(pay.each[i]), x: colX(L, c), y: chipY(L, c, r) - L.bh * 0.5, t: -0.04 * Math.min(i, 12), life: 0.9, small: true, tier: tierOf(i) });
    });
    takeCells(L, grp);
    G.score += pay.pts;
    if (pay.cat > G.bestCat) G.bestCat = pay.cat;
    G.fx.push({ s: t(NAME_KEYS[pay.cat]) + '  +' + fmt(pay.pts), x: colX(L, top[0]), y: chipY(L, top[0], Math.min(top[1], G.grid[top[0]].length)) - L.bh * 2, t: 0, life: 1.2, big: grp.length >= 5 });
    sound(grp.length >= 5 ? 'notifyRaise' : 'notifyAction');
    // One power a level at most, POWER_MAX of each (web.103).
    const p = G.wonLv ? '' : powerFor(grp.length);
    if (p && G.inv[p] < POWER_MAX) { G.inv[p]++; G.wonLv = true; say(t('tpWon', { b: t(P_KEY[p]) })); sound('notifyAllIn'); }
    moved(); renderHud(); afterMove();
  }
  function usePower(p, c, r) {
    let cells = [];
    if (p === 'joker') cells = colorCells(G.grid, G.grid[c][r].k);
    else if (p === 'dealer') cells = crossCells(G.grid, c, r);
    G.armed = '';
    if (!cells.length || G.inv[p] <= 0) return;
    G.inv[p]--;
    const L = geom();
    G.score += takeCells(L, cells) * 30 * G.lv;
    sound('notifyAllIn');
    moved(); renderHud(); afterMove();
  }
  function power(p) {
    if (state !== 'run' || G.inv[p] <= 0 || G.handover > 0) { sound('notifyFold'); return; }
    if (p === 'shuffle') {
      G.inv.shuffle--; shuffleGrid(G.grid); G.armed = '';
      G.grid.forEach((col) => col.forEach((b) => { b.pop = 0.35; }));
      G.chars.forEach((ch) => { ch.look = time + 1.2; });
      sound('notifyCard'); say(t('tpShuffle') + ' 🔀'); afterMove();
      return;
    }
    G.armed = G.armed === p ? '' : p;
    if (G.armed) say(t('tpArmed'));
    sound('notifyAction');
  }
  /**
   * After a move: nothing left to take? « No more moves! » and the dealer tops
   * up (narmod 2026-11-15; as in Monster Madness since web.86: the big banner,
   * no time taken): 2 or 3 rows come up under every column (refillRows, web.87),
   * in the table's colours and joined to the old stacks, so there is always a
   * move again and the help is never undone. Waits for a falling friend first; a Joker or
   * a Dealer button in hand does not stop him (they stay for later).
   */
  function afterMove() {
    clearTimeout(check);
    check = setTimeout(() => {
      if (state !== 'run' || !chipsLeft(G.grid) || anyMove(G.grid)) return;
      if (G.chars.some((ch) => ch.st === 'fall' || ch.st === 'sink')) { afterMove(); return; }   // a friend still on his way down
      if (mode === 'folie') { G.riseT = G.kit.rise; return; }              // Madness: the next row comes up at once
      // The table back to its full width: columns without a friend, one on each side in turn (the video at 1:05).
      while (G.cols < G.cols0) {
        const right = (G.cols0 - G.cols) % 2 === 1, i = right ? G.cols : 0;
        G.grid.splice(i, 0, []); G.chars.splice(i, 0, noFriend()); G.xs.splice(i, 0, null); G.cols++;
        if (!right) G.cursor.c++;
      }
      const L = geom();
      G.xs = G.xs.map((x, c) => (x == null ? colAim(L, c) : x));
      const n = refillRows(G.grid, colorsAt(G.lv), R);
      G.grid.forEach((col) => col.slice(0, n).forEach((b) => { b.pop = 0.5; }));
      G.recaved = true;
      G.banner = { s: t('tpNoMoves'), s2: t('tpRecave'), t: 0, life: 1.8 };
      sound('notifyCard');
      afterMove();
    }, 650);
  }
  /**
   * Takes `cells` out with what they set free: the cards next to them (and
   * any card among them) fly to the hand, the seals next to them break.
   * Returns the number of chips taken.
   */
  function takeCells(L, cells) {
    const fr = freedBy(G.grid, cells);
    for (const [c, r] of fr.seals) {
      const b = G.grid[c][r]; b.seal = false; b.pop = 0.4;
      const x = colX(L, c), y = chipY(L, c, r) - L.bh / 2;
      for (let i = 0; i < 8; i++) { const a = Math.random() * 7; G.parts.push({ x, y, vx: Math.cos(a) * 50, vy: Math.sin(a) * 50 - 40, t: 0, life: 0.6, c: '#c3ccd6', r: 1.6, rot: 0 }); }
    }
    if (fr.seals.length) sound('notifyTick');
    const chips = cells.filter(([c, r]) => G.grid[c][r].k >= 0);
    const cards = cells.filter(([c, r]) => G.grid[c][r].k === CARD).concat(fr.cards);
    for (const [c, r] of cards) G.flying.push({ n: G.grid[c][r].card, x: colX(L, c), y: chipY(L, c, r) - L.bh / 2, t: 0 });
    if (cards.length) sound('notifyCard');
    burstCells(L, chips);
    removeCells(G.grid, chips.concat(cards));
    return chips.length;
  }
  /** A card has reached the hand; 5 cards: the hand pays and starts again. */
  function addCard(n) {
    G.hand.push(n);
    if (G.hand.length < 5) return;
    const e = evalCards(G.hand), cat = Math.max(0, e.cat), pts = 100 * G.lv * MULT[cat];
    G.score += pts; renderHud();
    G.handFull = { cards: G.hand.slice(), best: e.best || [], name: t(NAME_KEYS[cat]), t: 0 };
    if (!G.bestHand || cat > G.bestHand.cat) G.bestHand = { cards: G.hand.slice(), best: e.best || [], cat };
    G.hand = [];
    const L = geom();
    G.fx.push({ s: '🂠 ' + t(NAME_KEYS[cat]) + '  +' + fmt(pts), x: L.W / 2, y: TOP + 34, t: 0, life: 1.8, big: true });
    sound(cat >= 2 ? 'notifyBigWin' : 'notifyAllIn');
  }
  function burstCells(L, cells) {
    for (const [c, r] of cells) {
      const b = G.grid[c][r], ch = CHIPS[b.k], x = colX(L, c), y = chipY(L, c, r) - L.bh / 2;
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2, v = L.cw * (1.5 + Math.random() * 3);
        G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - L.cw * 2, t: 0, life: 0.6 + Math.random() * 0.4, c: i % 3 ? ch.top : ch.mark, r: 1.5 + Math.random() * 2.5, rot: Math.random() * 6 });
      }
    }
  }
  function roundClear() {
    state = 'clear';
    const L = geom(), left = chipsLeft(G.grid), secs = timed() ? Math.ceil(G.timeLeft) : 0;
    const bonus = secs * TIME_PAY * G.lv, clean = left === 0 && !duel() ? cleanPay(G.lv) : 0;
    // « Table rase » (secret trophy, narmod: choice A): a round from level 5 without a recave, Classic or Daily.
    if (timed() && G.lv >= TROPHY_LV && !G.recaved) { shell.grant('tapis'); G.trophy = true; }
    G.score += bonus + clean;
    G.rounds.push({ lv: G.lv, done: 1 });
    // Every friend's spirit comes out of his hole and flies up, one after the other, with a bonus (Monster Madness).
    const x0 = (L.W - L.cw * G.cols0) / 2;
    G.all.forEach((ch, i) => { ch.st = 'spirit'; ch.spT = -0.15 - i * 0.12; ch.spPaid = false; ch.spX = x0 + L.cw * (ch.slot + 0.5); });
    renderHud(); sound('notifyBigWin');
    G.banner = { s: t(left === 0 ? 'tpClear' : 'tpAllIn'), s2: duel() ? '' : '+' + fmt(bonus) + (clean ? ' · ' + t('tpClean') + ' +' + fmt(clean) : ''), t: 0, life: 2.2 };
    for (let i = 0; i < 90; i++) G.parts.push({ x: Math.random() * L.W, y: -10 - Math.random() * 120, vx: (Math.random() - 0.5) * 40, vy: 40 + Math.random() * 80, t: 0, life: 2.4, c: ['#f5c518', '#d23a30', '#2f6bd0', '#27a058', '#fbf7ee'][i % 5], r: 3 + Math.random() * 3, rot: Math.random() * 6, conf: true });
    if ((mode === 'zen' && G.lv >= ZEN_ROUNDS) || (duel() && G.lv >= DUEL_ROUNDS)) { timer = setTimeout(() => gameOver(t('tpAllIn')), 2000); return; }
    timer = setTimeout(() => {
      if (state !== 'clear') return;
      G.lv++;
      // A Shuffle for the new level when there is none left (until web.103 one more each level).
      const top = (inv) => { if (inv.shuffle < 1) inv.shuffle = 1; };
      if (duel()) { G.players.forEach((p) => top(p.inv)); top(G.inv); }
      else top(G.inv);
      newRound(); state = 'run'; sound('notifyBlindsUp');
      if (duel()) turnTo((G.lv - 1) % 2);        // each round, the other one starts
      const lvLine = t('arLevel') + ' ' + G.lv + ' · ' + t('tpBlinds', { b: blindsAt(G.lv) }) + (colorsAt(G.lv) > colorsAt(G.lv - 1) ? ' · +1 🪙' : '');
      G.banner = G.venueT < 1 ? { s: t(VENUES[G.venue]), s2: lvLine, t: 0, life: 2.4 }
        : { s: t('arLevel') + ' ' + G.lv, s2: t('tpBlinds', { b: blindsAt(G.lv) }) + (colorsAt(G.lv) > colorsAt(G.lv - 1) ? ' · +1 🪙' : ''), t: 0, life: 1.8 };
      const news = KIT_FROM.find(([, from]) => from === G.lv);
      if (news) say(t(news[2]));
    }, 2400);
  }
  function timeUp() { gameOver(t('prTimeUp')); }
  /** The end: the clock is out (Classic, Daily), a stack too high (Madness), the 5 rounds done (Zen). */
  function gameOver(title) {
    const done = state === 'clear';
    state = 'over'; clearTimeout(check);
    const total = G.total || 1;
    if (!done) G.rounds.push({ lv: G.lv, done: Math.max(0, 1 - chipsLeft(G.grid) / total) });
    G.chars.forEach((ch) => { if (ch.st === 'top') { ch.pose = 'ko'; ch.mood = 'ko'; ch.ace.pose('ko'); ch.ace.mood('ko'); ch.ace.sweat(false); } });
    if (!done) sound('notifyFold');
    G.banner = { s: title, s2: '', t: 0, life: 1.4 };
    shell.ended();
    if (duel()) {                       // put the last player's things away; who has more wins
      const P = G.players;
      Object.assign(P[G.turn], { score: G.score, inv: G.inv, hand: G.hand, bestHand: G.bestHand, inTotal: G.inTotal, bestCat: G.bestCat });
      G.winner = P[0].score === P[1].score ? 2 : P[0].score > P[1].score ? 0 : 1;
      G.res = { score: Math.max(P[0].score, P[1].score), prev: null, shown: false };
      timer = setTimeout(renderResult, 1300);
      return;
    }
    let prev = 0;
    if (mode === 'classic') { prev = shell.best.get(); if (G.score > prev) shell.best.set(G.score); }
    else if (mode === 'daily') { const d = loadJ(DAILY_KEY), day = dayKey(); prev = d.d === day ? d.s || 0 : 0; if (G.score > prev) saveJ(DAILY_KEY, { d: day, s: G.score }); }
    else { const b = loadJ(BEST_KEY); prev = b[mode] || 0; if (G.score > prev) { b[mode] = G.score; saveJ(BEST_KEY, b); } }
    G.res = { score: G.score, prev, shown: false };
    timer = setTimeout(renderResult, 1300);
  }
  function toTitle() { state = 'title'; newGame(); newRound(); titlePanel(); refreshHof(); }
  function renderResult() {
    if (state !== 'over' || !G.res || G.res.shown) return;
    G.res.shown = true;
    const { score, prev } = G.res;
    if (duel()) {
      const P = G.players, w = G.winner;
      const bh = (P[0].bestHand && (!P[1].bestHand || P[0].bestHand.cat >= P[1].bestHand.cat)) ? P[0].bestHand : P[1].bestHand;
      sound('notifyWinner', true);
      endScreen(shell, {
        title: w === 2 ? t('pdTie') : t('pdWins', { n: w + 1 }), sub: t('pdTwo') + ' · ' + t('tpName'),
        hero: '<div style="font-size:40px;line-height:1">🆚</div>', score, prev: null,
        cards: bh ? bh.cards : [], dim: bh ? bh.cards.filter((c) => bh.best.indexOf(c) < 0) : [], hand: bh ? t(NAME_KEYS[bh.cat]) : '',
        levels: { title: t('hcScore'), right: P.map((p) => fmt(p.score)).join(' – '),
          html: listHtml(esc, P.map((p, i) => [t('pdPlayer', { n: i + 1 }) + ' · ' + p.inTotal + ' 🕳️', fmt(p.score) + (w === i ? ' 🏆' : ''), w === i || w === 2 ? 'gold' : false])) },
        stats: [[fmt(P[0].score), t('pdPlayer', { n: 1 })], [fmt(P[1].score), t('pdPlayer', { n: 2 })], [G.lv, t('arLevel')]],
        onAgain: () => start(),
        onMenu: toTitle,
      });
      return;
    }
    if (score > prev && prev > 0) sound('notifyBigWin');
    const best = G.bestCat >= 0 ? t(NAME_KEYS[G.bestCat]) : '—';
    endScreen(shell, {
      title: t('tpName'), sub: t(MODES[sel].key) + ' · ' + t('tpBlinds', { b: blindsAt(G.lv) }),
      hero: '<div style="font-size:40px;line-height:1">🕳️</div>', score, prev,
      cards: G.bestHand ? G.bestHand.cards : [], dim: G.bestHand ? G.bestHand.cards.filter((c) => G.bestHand.best.indexOf(c) < 0) : [],
      hand: G.bestHand ? t(NAME_KEYS[G.bestHand.cat]) : '',
      calc: [[t('arLevel'), G.lv], [t('tpIn'), G.inTotal], [t('gmBestHand'), best]],
      levels: { title: t('arLevel'), right: String(G.lv), html: barsHtml(G.rounds.map((r) => ({ h: 0.12 + 0.88 * r.done, cls: r.done >= 1 ? 'gold' : r.done < 0.2 ? 'no' : '' }))) },
      stats: [[fmt(score), t('hcScore')], [G.lv, t('arLevel')], [G.inTotal, '🕳️']],
      onAgain: () => start(),
      onMenu: toTitle,
    });
    hofEnd(shell, { g: 'tapis', m: mode, s: score, run: G.hof, day: G.hofDay, daily: mode === 'daily' });
  }

  // ── Input ─────────────────────────────────────────────────────────
  function cellAt(L, x, y) {
    let c = -1;
    for (let i = 0; i < G.cols; i++) if (Math.abs(x - colX(L, i)) <= L.cw / 2) c = i;
    if (c < 0 || !G.grid[c] || !G.grid[c].length) return null;
    const n = G.grid[c].length;
    for (let r = n - 1; r >= 0; r--) { const yb = chipY(L, c, r); if (y >= yb - L.bh - L.ry && y <= yb + L.ry) return [c, r]; }
    if (y < chipY(L, c, n - 1) - L.bh) return [c, n - 1];     // on the friend: his top chip
    return null;
  }
  const pillX = (L, i) => L.W / 2 + (i - 1) * (pillW(L.W) + 6);
  function pillAt(L, x, y) {
    if (Math.abs(y - PILL_Y) > PILL_H / 2 + 3) return -1;
    for (let i = 0; i < 3; i++) if (Math.abs(x - pillX(L, i)) <= pillW(L.W) / 2) return i;
    return -1;
  }
  function input(a, down, info) {
    if (!down) return;
    if (state === 'board') return;                 // the Hall of Fame's boards: their own buttons
    if (state === 'title' && a === 'duck') { if (hofEnabled) openHof(); return; }
    if (state === 'title') {
      const st = titleStep(a, sel, MODES.length);
      if (st === 'start') { if (info.x == null) start(); }
      else if (st != null) { sel = st; titlePanel(); }
      return;
    }
    if (state !== 'run') return;
    if (a === 'n1' || a === 'n2' || a === 'n3') { power(POWERS[+a.slice(1) - 1]); return; }
    const L = geom();
    if (a === 'jump' && info.x != null) {
      G.showCursor = false;
      const p = pillAt(L, info.x, info.y);
      if (p >= 0) { power(POWERS[p]); return; }
      const cell = cellAt(L, info.x, info.y);
      if (!cell) { G.picked = null; return; }
      G.picked = null; act(cell[0], cell[1]);   // one touch or one click takes the group (web.92: no more double touch)
      return;
    }
    const cur = G.cursor;
    const up = a === 'jump' && (info.code === 'ArrowUp' || info.code === 'KeyW' || info.pad === 'up');
    const wake = !G.showCursor;
    G.showCursor = true;
    if (wake && a === 'jump' && !up) return;          // the first press shows the cursor
    const n = (G.grid[cur.c] || []).length;
    if (cur.bar >= 0) {
      if (a === 'left') cur.bar = (cur.bar + 2) % 3;
      else if (a === 'right') cur.bar = (cur.bar + 1) % 3;
      else if (a === 'duck') { cur.bar = -1; cur.r = Math.max(0, n - 1); }
      else if (a === 'jump' && !up) power(POWERS[cur.bar]);
      return;
    }
    if (!G.cols) return;
    if (a === 'left' || a === 'right') cur.c = (cur.c + (a === 'left' ? -1 : 1) + G.cols) % G.cols;
    else if (up) { if (cur.r >= n - 1) cur.bar = 1; else cur.r++; }
    else if (a === 'duck') cur.r = Math.max(0, Math.min(cur.r, n - 1) - 1);
    else if (a === 'jump' && n) act(cur.c, Math.min(cur.r, n - 1));
  }
  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || !G || state !== 'run') { hover = null; return; }
    const r = shell.stage.getBoundingClientRect(), k = shell.k || 1;
    hover = cellAt(geom(), (e.clientX - r.left) / k, (e.clientY - r.top) / k);
    if (hover) G.showCursor = false;
  };
  const onLeave = () => { hover = null; };
  shell.stage.addEventListener('pointermove', onMove);
  shell.stage.addEventListener('pointerleave', onLeave);

  // ── Update ────────────────────────────────────────────────────────
  function update(dt) {
    time += dt;
    if (!G) return;
    const L = geom();
    for (const col of G.grid) for (const b of col) {
      if (b.off > 0) { b.v = (b.v || 0) + 34 * dt; b.off = Math.max(0, b.off - b.v * dt); if (!b.off) { if (b.v > 8) sound('notifyTick'); b.v = 0; } }
      else if (b.off < 0) b.off = Math.min(0, b.off + 5 * dt);
      if (b.shake > 0) b.shake -= dt;
      if (b.pop > 0) b.pop -= dt;
    }
    if (state === 'run' && duel()) {
      if (G.handover > 0) {
        if (!G.flying.length && !G.chars.some((ch) => ch.st === 'fall')) { G.handover -= dt; if (G.handover <= 0) turnTo(1 - G.turn); }
      } else {
        G.turnT -= dt;
        const s = Math.ceil(G.turnT);
        if (G.turnT < 3.5 && s !== G.lastTick) { G.lastTick = s; sound(s <= 1 ? 'notifyTickFinal' : 'notifyTick'); }
        if (G.turnT <= 0) turnTo(1 - G.turn);          // too slow: the turn passes
      }
      G.timeMax = TURN_S; G.timeLeft = Math.max(0, G.turnT);
    }
    if (state === 'run' && timed()) {
      G.timeLeft -= dt;
      const s = Math.ceil(G.timeLeft);
      if (G.timeLeft < 10 && s !== G.lastTick) { G.lastTick = s; sound(s <= 3 ? 'notifyTickFinal' : 'notifyTick'); }
      if (G.timeLeft <= 0) { G.timeLeft = 0; timeUp(); }
    }
    if (state === 'run' && G.kit && G.kit.rise) {     // a row comes up from the felt now and then
      G.riseT += dt;
      if (G.riseT >= G.kit.rise) {
        G.riseT = 0;
        // Madness: every column, no ceiling — over the red line, it's over.
        if (riseRow(G.grid, colorsAt(G.lv), mode === 'folie' ? 99 : G.maxRows + 1, R)) { sound('notifyCard'); G.grid.forEach((col) => { if (col[0]) col[0].pop = 0.4; }); }
        if (mode === 'folie') {
          if (G.grid.some((col) => col.length > G.maxRows)) gameOver(t('tpOver'));
          else afterMove();
        }
      }
      if (mode === 'folie' && state === 'run') { G.timeMax = G.kit.rise; G.timeLeft = G.kit.rise - G.riseT; }
    }
    if (G.venueT < 1) G.venueT = Math.min(1, G.venueT + dt / 1.2);
    for (let i = G.flying.length - 1; i >= 0; i--) { const f = G.flying[i]; f.t += dt; if (f.t >= 0.6) { G.flying.splice(i, 1); addCard(f.n); } }
    if (G.handFull) { G.handFull.t += dt; if (G.handFull.t > 1.8) G.handFull = null; }
    hTime.style.width = (100 * Math.max(0, G.timeLeft) / G.timeMax) + '%';
    const danger = mode === 'folie' && G.grid.some((col) => col.length >= G.maxRows - 1);
    hTimeBox.classList.toggle('low', state === 'run' && (timed() ? G.timeLeft < 10 : duel() ? G.turnT < 3.5 : danger));
    // The friends: their face and pose from the game, their eyes on the lit chip.
    let fell = false;
    const tgt = state === 'run' ? (G.showCursor && G.cursor.bar < 0 && G.grid[G.cursor.c] && G.grid[G.cursor.c].length
      ? [G.cursor.c, Math.min(G.cursor.r, G.grid[G.cursor.c].length - 1)] : hover) : null;
    const sc = L.cw * 0.0125;
    const setMood = (ch, m) => { if (m !== ch.mood) { ch.mood = m; ch.ace.mood(m); } };
    const setPose = (ch, p) => { if (p !== ch.pose) { ch.pose = p; ch.ace.pose(p); } };
    G.chars.forEach((ch, c) => {
      const col = G.grid[c];
      if (ch.st === 'top') {
        if (!col.length) {
          ch.st = 'fall'; ch.vy = -140; setPose(ch, 'air'); setMood(ch, 'yay'); ch.ace.sweat(false); fell = true;
          if (!G.firstIn && state === 'run') {     // the first one in: with the Dealer button, ×2; the button goes
            G.firstIn = true; ch.double = ch.dealer;
            G.chars.forEach((o) => { if (o !== ch && o.dealer) { o.dealer = false; o.ace.badge(false); } });
          }
        } else {
          // His stack came down: he drops after it, a moment later (the Joker floats down, as the arcade's ghost);
          // it goes up (a refill): he goes up with it.
          const target = chipY(L, c, col.length - 1) - L.bh;
          let dropping = false;
          if (ch.y < target - 0.5) {
            if (!ch.dropAt) ch.dropAt = time + (ch.kind === 'joker' ? 0.2 : 0.12);
            if (time >= ch.dropAt) {
              const float = ch.kind === 'joker';
              ch.dvy = Math.min((ch.dvy || 0) + (float ? 260 : 1300) * dt, float ? 130 : 900);
              ch.y = Math.min(target, ch.y + ch.dvy * dt);
              dropping = ch.y < target;
              if (!dropping) { ch.dvy = 0; ch.dropAt = 0; if (state === 'run') ch.ace.fx('land'); }
            }
          } else { ch.y = target; ch.dvy = 0; ch.dropAt = 0; }
          if (dropping && target - ch.y > L.bh * 0.6) { setPose(ch, 'air'); setMood(ch, ch.kind === 'joker' ? 'wink' : 'jump'); }
          else if (state === 'run' || onTitle()) {
            const low = col.length <= 2, hurry = state === 'run' && (timed() ? G.timeLeft < 12 : mode === 'folie' && col.length >= G.maxRows - 1);
            const m = ch.clapUntil > time ? 'yay' : hurry ? 'scared' : ch.look > time ? 'dizzy' : low ? 'jump'
              : (Math.sin(time * 0.6 + c * 1.7) > 0.97 ? 'wink' : Math.sin(time * 0.37 + c * 2.3) > 0.985 ? 'grin' : 'smile');
            setMood(ch, m);
            setPose(ch, ch.clapUntil > time ? 'clap' : low ? 'balance' : 'idle');
            const sw = low || hurry;
            if (sw !== ch.sweat) { ch.sweat = sw; ch.ace.sweat(sw); }
          }
          // the eyes: on the lit chip, else a slow look around
          let dx, dy;
          if (tgt && G.grid[tgt[0]]) { dx = (colX(L, tgt[0]) - colX(L, c)) / (L.cw * 2); dy = (chipY(L, tgt[0], tgt[1]) - (ch.y - 70 * sc)) / (L.cw * 2); }
          else { dx = Math.sin(time * 0.5 + c * 1.3); dy = 0.3 * Math.sin(time * 0.35 + c); }
          const e = dx.toFixed(1) + ',' + dy.toFixed(1);
          if (e !== ch.eye) { ch.eye = e; ch.ace.look(dx, dy); }
        }
      } else if (ch.st === 'fall') {
        ch.vy += 1300 * dt; ch.y += ch.vy * dt;
        if (ch.y >= L.base) {
          ch.y = L.base; ch.st = 'sink'; ch.sink = 0; setPose(ch, 'idle');
          G.signs.push({ x: colX(L, c), t: 0 });    // « Couché ! » (folded) — a little sign planted by his hole (narmod, instead of « RIP »)
          sound('notifyCard');
          if (state === 'run') {
            const pay = inPay(G.lv) * (ch.double ? 2 : 1);
            G.score += pay; G.inTotal++; renderHud();
            G.fx.push({ s: (ch.double ? 'Dealer ×2  ' : duel() ? t('pdPlayer', { n: G.turn + 1 }) + ' ' : t('tpIn') + ' ') + '+' + fmt(pay), x: colX(L, c), y: L.base - L.cw * 1.6, t: 0, life: 1.3, green: true, big: ch.double });
            if (ch.double) { ch.dealer = false; ch.ace.badge(false); sound('notifyAllIn'); }
          }
          for (let i = 0; i < 14; i++) { const a = -Math.PI * Math.random(); G.parts.push({ x: colX(L, c), y: L.base, vx: Math.cos(a) * 60, vy: Math.sin(a) * 90, t: 0, life: 0.7, c: i % 2 ? '#f5c518' : '#fbf7ee', r: 2, rot: 0 }); }
        }
      } else if (ch.st === 'sink') {
        // down into his hole, then his head comes out to wave, then he is gone
        ch.sink += dt;
        const k = ch.sink, deep = L.base + 118 * sc, peek = L.base + 46 * sc;
        if (k < SINK_S) ch.y = L.base + (deep - L.base) * (k / SINK_S);
        else if (k < SINK_S + 0.3) { ch.y = deep + (peek - deep) * ((k - SINK_S) / 0.3); setPose(ch, 'wave'); setMood(ch, 'love'); }
        else if (k < SINK_S + PEEK_S) ch.y = peek;
        else if (k < SINK_S + PEEK_S + 0.3) ch.y = peek + (deep - peek) * ((k - SINK_S - PEEK_S) / 0.3);
        else { ch.st = 'in'; ch.ace.show(false); }
      }
    });
    if (fell) G.chars.forEach((o) => { if (o.st === 'top') o.clapUntil = time + 1.1; });
    // The spirits of the round won: up from the holes, see-through, a bonus each (not in the Duel).
    G.all.forEach((ch) => {
      if (ch.st !== 'spirit') return;
      ch.spT += dt;
      if (ch.spT < 0) return;
      if (!ch.spPaid) {
        ch.spPaid = true; ch.ace.show(true); ch.ace.clip(null); ch.ace.pose('air'); ch.ace.mood('yay'); ch.ace.sweat(false);
        const pay = duel() ? 0 : SPIRIT_PAY * G.lv;
        if (pay) { G.score += pay; renderHud(); }
        G.fx.push({ s: pay ? '+' + fmt(pay) : '✦', x: ch.spX, y: L.base - L.cw * 1.4, t: 0, life: 1.1, green: true });
        sound('notifyTick');
      }
      ch.y = L.base - ch.spT * 150;
      ch.ace.fade(Math.max(0, 0.75 * (1 - ch.spT / 1.1)));
      if (ch.spT > 1.1) { ch.st = 'gone'; ch.ace.show(false); }
    });
    // A column emptied, its friend in his hole (or none on it): it goes, the hole closes, the others close up in the middle.
    for (let c = G.cols - 1; c >= 0; c--) {
      if (G.grid[c].length || G.chars[c].st !== 'in') continue;
      G.closing.push({ x: colX(L, c), t: 0 });
      G.grid.splice(c, 1); G.chars.splice(c, 1); G.xs.splice(c, 1); G.cols--;
      if (G.cursor.c > c || G.cursor.c >= G.cols) G.cursor.c = Math.max(0, G.cursor.c - 1);
      hover = null; G.picked = null;
    }
    {
      const L2 = geom();
      for (let c = 0; c < G.cols; c++) { const a = colAim(L2, c); G.xs[c] += (a - G.xs[c]) * Math.min(1, dt * 7); if (Math.abs(a - G.xs[c]) < 0.05) G.xs[c] = a; }
      for (let i = G.closing.length - 1; i >= 0; i--) { G.closing[i].t += dt; if (G.closing[i].t > 0.4) G.closing.splice(i, 1); }
      for (let i = G.signs.length - 1; i >= 0; i--) { G.signs[i].t += dt; if (G.signs[i].t > SIGN_S) G.signs.splice(i, 1); }
    }
    // Every friend in his hole: the round is won (chips may be left in columns without a friend).
    if (state === 'run' && G.chars.every((ch) => ch.st === 'in')) roundClear();
    for (let i = G.parts.length - 1; i >= 0; i--) { const p = G.parts[i]; p.t += dt; if (p.t > p.life) { G.parts.splice(i, 1); continue; } p.vy += (p.conf ? 30 : 420) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 7; }
    for (let i = G.fx.length - 1; i >= 0; i--) { G.fx[i].t += dt; if (G.fx[i].t > G.fx[i].life) G.fx.splice(i, 1); }
    if (G.say) { G.say.t += dt; if (G.say.t > 2.8) G.say = null; }
    if (G.banner) { G.banner.t += dt; if (G.banner.t > G.banner.life) G.banner = null; }
  }

  // ── Drawing ───────────────────────────────────────────────────────
  const img = imageCache();
  /** Slot i of the hand of 5, in the middle of the HUD's line. */
  function handSlot(L, i) {
    const room = Math.max(60, Math.min(150, L.W - 110)), w = Math.min(18, room / 5.6), h = w * 1.4;
    return { x: L.W / 2 + (i - 2) * (w + 3), y: 21, w, h };
  }
  /** A card standing in a stack: a cream « card chip », the card's rank and suit on its side. */
  function drawCardCell(g, L, x, yb, n, hl, sc) {
    const { bh, ry } = L, w = L.rx * (sc || 1);
    g.beginPath(); g.moveTo(x - w, yb - bh); g.lineTo(x - w, yb); g.ellipse(x, yb, w, ry, 0, Math.PI, 0, true); g.lineTo(x + w, yb - bh); g.closePath();
    g.fillStyle = '#f2ebda'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = '#2f4f9e'; g.beginPath(); g.ellipse(x, yb - bh, w, ry, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 0.8; g.beginPath(); g.ellipse(x, yb - bh, w * 0.7, ry * 0.7, 0, 0, 7); g.stroke();
    g.fillStyle = isRed(n) ? '#c62828' : '#141414'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '800 ' + Math.max(6, bh * 0.62).toFixed(1) + 'px Inter, system-ui, sans-serif';
    g.fillText(RANKS[n % 13] + SUIT_SIGNS[Math.floor(n / 13)], x, yb - bh * 0.48 + ry * 0.2);
    g.strokeStyle = 'rgba(245,197,24,' + (0.5 + 0.3 * Math.sin(time * 4)).toFixed(2) + ')'; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(x - w, yb - bh); g.lineTo(x - w, yb); g.ellipse(x, yb, w, ry, 0, Math.PI, 0, true); g.lineTo(x + w, yb - bh); g.stroke();
    if (hl) { g.fillStyle = 'rgba(255,250,220,.25)'; g.fill(); }
  }
  /**
   * A chip (web.108, audit lot 2): at rest it is painted once per colour, top and seal (sprites.mjs) and copied —
   * two gradients, ellipses and text per chip at every frame before; growing (pop) or a card, drawn as before.
   */
  function drawChip(g, L, x, yb, b, hl, sc, top) {
    const k = b.k;
    if (k === CARD) { drawCardCell(g, L, x, yb, b.card, hl, sc); return; }
    if ((sc || 1) === 1) {
      const s = shell.dpr * shell.k, { bh, ry, rx } = L;
      x = Math.round(x * s) / s; yb = Math.round(yb * s) / s;      // where the copy lands: the highlight on it exactly
      chipSprites.draw(g, k + (top ? 't' : '') + (b.seal ? 's' : '') + '|' + rx.toFixed(3) + '|' + bh.toFixed(3) + '|' + ry.toFixed(3),
        x, yb, [-rx - 2, -bh - ry - 2, rx * 2 + 4, bh + ry * 2 + 4], (c) => chipBody(c, L, 0, 0, b, 1, top));
    } else chipBody(g, L, x, yb, b, sc, top);
    if (hl) {
      const { bh, ry } = L, w = L.rx * (sc || 1);
      g.fillStyle = 'rgba(255,250,220,' + (0.28 + 0.16 * Math.sin(time * 10)).toFixed(2) + ')';
      g.beginPath(); g.moveTo(x - w, yb - bh); g.lineTo(x - w, yb); g.ellipse(x, yb, w, ry, 0, Math.PI, 0, true); g.lineTo(x + w, yb - bh); g.ellipse(x, yb - bh, w, ry, 0, 0, Math.PI, true); g.fill();
    }
  }
  const chipSprites = spriteCache(shell, 96);
  const roomSprite = spriteCache(shell, 2);     // the room: a whole-canvas picture, the last two levels'
  /** The chip itself (no highlight): its side, its marks and suit, its top, its seal. */
  function chipBody(g, L, x, yb, b, sc, top) {
    const k = b.k;
    const { bh, ry } = L, ch = CHIPS[k], w = L.rx * (sc || 1);
    // the side, with a dark seam at the bottom
    g.beginPath(); g.moveTo(x - w, yb - bh); g.lineTo(x - w, yb); g.ellipse(x, yb, w, ry, 0, Math.PI, 0, true); g.lineTo(x + w, yb - bh); g.closePath();
    g.fillStyle = ch.side; g.fill();
    const sg = g.createLinearGradient(x - w, 0, x + w, 0);
    sg.addColorStop(0, 'rgba(0,0,0,.35)'); sg.addColorStop(0.32, 'rgba(255,255,255,.16)'); sg.addColorStop(1, 'rgba(0,0,0,.42)');
    g.fillStyle = ch.top; g.globalAlpha = 0.82; g.fill(); g.globalAlpha = 1; g.fillStyle = sg; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, yb, w, ry, 0, 0, Math.PI); g.stroke();
    // edge spots and the suit in the middle of the side
    g.fillStyle = ch.mark;
    for (const f of [-0.78, 0.78]) g.fillRect(x + f * w - w * 0.07, yb - bh * 0.82, w * 0.14, bh * 0.64);
    const r = Math.min(bh * 0.4, w * 0.36);
    g.beginPath(); g.arc(x, yb - bh * 0.5 + ry * 0.15, r, 0, 7); g.fill();
    g.fillStyle = ch.side; g.font = '700 ' + (r * 1.5).toFixed(1) + 'px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(ch.suit, x, yb - bh * 0.5 + ry * 0.2);
    // the top (the Joker chip's in the four colours)
    if (k === WILD) {
      const tg = g.createLinearGradient(x - w, 0, x + w, 0);
      ['#d23a30', '#2f6bd0', '#27a058', '#33363c', '#9a5ae0'].forEach((c2, i) => { tg.addColorStop(i / 4, c2); });
      g.fillStyle = tg;
    } else g.fillStyle = ch.top;
    g.beginPath(); g.ellipse(x, yb - bh, w, ry, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, yb - bh, w - 0.5, ry - 0.5, 0, Math.PI, 0); g.stroke();
    if (top) {
      g.strokeStyle = ch.mark; g.lineWidth = Math.max(1, w * 0.06); g.setLineDash([w * 0.16, w * 0.12]);
      g.beginPath(); g.ellipse(x, yb - bh, w * 0.66, ry * 0.66, 0, 0, 7); g.stroke(); g.setLineDash([]);
      g.fillStyle = ch.mark; g.font = '800 ' + Math.max(6, ry * 1.05).toFixed(1) + 'px Inter, system-ui, sans-serif';
      g.fillText(String(ch.v), x, yb - bh + 0.5);
    }
    if (b.seal) {                     // locked: a steel veil, two straps and a big padlock on its side
      g.save();
      g.beginPath(); g.moveTo(x - w, yb - bh); g.lineTo(x - w, yb); g.ellipse(x, yb, w, ry, 0, Math.PI, 0, true); g.lineTo(x + w, yb - bh); g.ellipse(x, yb - bh, w, ry, 0, 0, Math.PI, true);
      g.fillStyle = 'rgba(150,160,172,.45)'; g.fill();
      g.fillStyle = '#b8c1cc';
      g.fillRect(x - w, yb - bh * 0.78, w * 2, bh * 0.13); g.fillRect(x - w, yb - bh * 0.3, w * 2, bh * 0.13);
      const lw = Math.max(7, bh * 0.78), ly = yb - bh * 0.62;
      g.strokeStyle = '#3d444c'; g.lineWidth = Math.max(1.6, lw * 0.16); g.beginPath(); g.arc(x, ly, lw * 0.3, Math.PI, 0); g.stroke();
      g.fillStyle = '#d8b25a'; rr(g, x - lw / 2, ly, lw, lw * 0.68, 2); g.fill(); g.strokeStyle = '#5a4210'; g.lineWidth = 1; g.stroke();
      g.fillStyle = '#3a2a08'; g.beginPath(); g.arc(x, ly + lw * 0.3, lw * 0.1, 0, 7); g.fill();
      g.restore();
    }
  }
  function draw(g) {
    if (!G) return;
    const L = geom(), W = L.W;
    // The venue (Ace Runner's scenery), from day to night along its levels; a veil so the chips stand out.
    const ty = L.base - L.ry * 2.4;
    const o = { w: W, gy: ty - 5, scroll: 300, p: dayOfLevel(G.lv), now: time, reduced: shell.reduced, C: ink(!!(shell.theme && shell.theme.light)), venue: G.venue };
    // The room, the spotlight, the felt: one picture for the whole level when nothing in it moves
    // (web.109, sceneryStill: no twinkling stars, no sea, no sparkles), else drawn at every frame as before.
    const room = (c) => {
      if (G.venueT < 1) {
        drawScenery(c, Object.assign({}, o, { venue: G.prevVenue }));
        c.globalAlpha = G.venueT; drawScenery(c, o); c.globalAlpha = 1;
      } else drawScenery(c, o);
      c.fillStyle = 'rgba(12,10,26,.4)'; c.fillRect(0, 0, W, ty);
      const sp = c.createRadialGradient(W / 2, -H * 0.2, 10, W / 2, H * 0.3, H);
      sp.addColorStop(0, 'rgba(255,240,190,.24)'); sp.addColorStop(1, 'rgba(255,240,190,0)');
      c.fillStyle = sp; c.fillRect(0, 0, W, H);
      const fe = c.createLinearGradient(0, ty, 0, H); fe.addColorStop(0, '#1f8a4c'); fe.addColorStop(1, '#0c3f22');
      c.fillStyle = fe; c.fillRect(0, ty, W, H - ty);
      c.fillStyle = '#5a361c'; c.fillRect(0, ty - 5, W, 6); c.fillStyle = '#d8b25a'; c.fillRect(0, ty - 6, W, 1.2);
    };
    if (G.venueT >= 1 && sceneryStill(o)) {
      roomSprite.draw(g, 'room|' + [G.venue, o.p, W, H, ty, o.C.light ? 1 : 0, shell.reduced ? 1 : 0].map((v) => typeof v === 'number' ? +v.toFixed(4) : v).join(','), 0, 0, [0, 0, W, H], room);
    } else room(g);
    // The holes.
    for (let c = 0; c < G.cols; c++) {
      const x = colX(L, c), ch = G.chars[c], buried = ch && (ch.st === 'in' || ch.st === 'spirit' || ch.st === 'gone');
      g.fillStyle = '#d8b25a'; g.beginPath(); g.ellipse(x, L.base, L.rx * 1.12, L.ry * 1.25, 0, 0, 7); g.fill();
      const hg = g.createRadialGradient(x, L.base + L.ry * 0.3, 1, x, L.base, L.rx); hg.addColorStop(0, buried ? '#3a2614' : '#000'); hg.addColorStop(1, buried ? '#5a3a1c' : '#1a1208');
      g.fillStyle = hg; g.beginPath(); g.ellipse(x, L.base, L.rx * 1.02, L.ry * 1.1, 0, 0, 7); g.fill();
    }
    for (const h of G.closing || []) {   // a hole closing behind its friend
      const k = 1 - h.t / 0.4;
      g.fillStyle = '#d8b25a'; g.beginPath(); g.ellipse(h.x, L.base, L.rx * 1.12 * k, L.ry * 1.25 * k, 0, 0, 7); g.fill();
      g.fillStyle = '#3a2614'; g.beginPath(); g.ellipse(h.x, L.base, L.rx * k, L.ry * 1.1 * k, 0, 0, 7); g.fill();
    }
    // Madness: the red line no stack may pass.
    if (mode === 'folie' && !onTitle() && G.cols) {
      const ly = L.base - G.maxRows * L.bh - L.ry, near = G.grid.some((col) => col.length >= G.maxRows - 1);
      g.save(); g.strokeStyle = near ? 'rgba(255,74,58,' + (0.55 + 0.4 * Math.sin(time * 9)).toFixed(2) + ')' : 'rgba(255,90,70,.45)';
      g.lineWidth = near ? 2 : 1.2; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(8, ly); g.lineTo(W - 8, ly); g.stroke(); g.restore();
    }
    // The group under the cursor or the mouse.
    const cur = G.cursor, hl = new Set();
    let target = null;
    if (state === 'run') {
      if (G.showCursor && cur.bar < 0 && G.grid[cur.c] && G.grid[cur.c].length) target = [cur.c, Math.min(cur.r, G.grid[cur.c].length - 1)];
      else if (hover && G.grid[hover[0]] && G.grid[hover[0]][hover[1]]) target = hover;
      else if (G.picked && G.grid[G.picked[0]] && G.grid[G.picked[0]][G.picked[1]]) target = G.picked;
    }
    let preview = null;
    if (target) {
      const [c, r] = target;
      const cells = G.armed === 'joker' ? colorCells(G.grid, G.grid[c][r].k) : G.armed === 'dealer' ? crossCells(G.grid, c, r) : groupAt(G.grid, c, r);
      if (cells.length > 1 || G.armed) cells.forEach(([x, y]) => hl.add(x + ',' + y));
      if (!G.armed && cells.length > 1) { const p = groupPay(G.grid, cells); preview = { c, r, s: t(NAME_KEYS[p.cat]) + ' · ' + cells.length + ' · +' + fmt(p.pts) }; }
    }
    // The stacks.
    for (let c = 0; c < G.grid.length; c++) {
      const x = colX(L, c), col = G.grid[c];
      for (let r = 0; r < col.length; r++) {
        const b = col[r], sx = b.shake > 0 ? Math.sin(time * 70) * 2.5 : (r % 3 === 1 ? 0.8 : r % 3 === 2 ? -0.6 : 0);
        drawChip(g, L, x + sx, chipY(L, c, r), b, hl.has(c + ',' + r), b.pop > 0 ? 1 + b.pop * 0.35 : 1, r === col.length - 1);
      }
    }
    // The cursor (keys, pad, remote).
    if (state === 'run' && G.showCursor && cur.bar < 0 && G.grid[cur.c]) {
      const n = G.grid[cur.c].length, r = Math.min(cur.r, Math.max(0, n - 1)), x = colX(L, cur.c), yb = n ? chipY(L, cur.c, r) : L.base;
      g.save(); g.strokeStyle = '#fbf7ee'; g.lineWidth = 2; g.shadowColor = '#f5c518'; g.shadowBlur = 8;
      rr(g, x - L.rx - 4, yb - L.bh - L.ry - 4, L.rx * 2 + 8, L.bh + L.ry * 2 + 8, 6); g.stroke(); g.restore();
    }
    if (preview) {
      g.font = '700 10px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const tw = Math.min(W - 8, g.measureText(preview.s).width + 14);
      const yb = Math.max(TOP + 8, chipY(L, preview.c, preview.r) - L.bh - L.ry - 8), x = Math.max(tw / 2 + 4, Math.min(W - tw / 2 - 4, colX(L, preview.c)));
      rr(g, x - tw / 2, yb - 9, tw, 18, 9); g.fillStyle = 'rgba(8,14,22,.85)'; g.fill(); g.strokeStyle = 'rgba(216,178,90,.7)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = '#f5d77a'; g.fillText(preview.s, x, yb, tw - 10);
    }
    // « Couché ! »: a wooden sign pops up by the hole of a friend who has just gone in, sways, a few « z » above it, then goes.
    for (const sg of G.signs || []) {
      const k = sg.t, up = Math.min(1, k / 0.25), out = k > SIGN_S - 0.4 ? (SIGN_S - k) / 0.4 : 1, a = Math.max(0, Math.min(1, out));
      const label = t('tpFolded');
      g.save(); g.globalAlpha = a;
      g.font = '800 ' + Math.max(6, L.cw * 0.2).toFixed(1) + 'px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const tw = g.measureText(label).width, pw = tw + L.cw * 0.22, ph = L.cw * 0.34, px = Math.max(pw / 2 + 2, Math.min(W - pw / 2 - 2, sg.x + L.cw * 0.42));
      const postH = L.cw * 1.15 * (0.4 + 0.6 * up), py = L.base - postH;
      g.translate(px, L.base); g.rotate((shell.reduced ? 0 : Math.sin(k * 5) * 0.06) * (1 - Math.min(1, k / 1.6)));
      g.fillStyle = '#6b4824'; g.fillRect(-L.cw * 0.035, -postH, L.cw * 0.07, postH);
      g.translate(0, -postH);
      rr(g, -pw / 2, -ph / 2, pw, ph, ph * 0.25); g.fillStyle = '#c99a5b'; g.fill(); g.lineWidth = 1.2; g.strokeStyle = '#5a3a1c'; g.stroke();
      g.fillStyle = '#3a2614'; g.fillText(label, 0, 0.5);
      if (k > 0.5 && !shell.reduced) {      // asleep: z z
        g.fillStyle = 'rgba(251,247,238,' + (0.8 * a).toFixed(2) + ')'; g.font = '800 ' + Math.max(5, L.cw * 0.16).toFixed(1) + 'px Inter, system-ui, sans-serif';
        for (let j = 0; j < 2; j++) { const z = ((k - 0.5) * 0.7 + j * 0.5) % 1; g.fillText('z', pw * 0.3 + z * L.cw * 0.25, -ph * 0.6 - z * L.cw * 0.5); }
      }
      g.restore();
    }
    g.globalAlpha = 1;
    // The hand of 5 at the top (from level 2), and the cards flying to it.
    if (!onTitle() && (G.lv >= 2 || G.hand.length || G.handFull || G.flying.length)) {
      const shown = G.handFull ? G.handFull.cards : G.hand;
      for (let i = 0; i < 5; i++) {
        const sl = handSlot(L, i), n = shown[i];
        g.save(); g.translate(sl.x, sl.y);
        if (n == null) { rr(g, -sl.w / 2, -sl.h / 2, sl.w, sl.h, 2.5); g.strokeStyle = 'rgba(245,240,227,.35)'; g.setLineDash([2.5, 2]); g.lineWidth = 1; g.stroke(); g.setLineDash([]); }
        else {
          if (G.handFull && G.handFull.best.indexOf(n) >= 0) { g.shadowColor = '#f5c518'; g.shadowBlur = 8; }
          drawFace(g, img, n, sl.w, sl.h);
        }
        g.restore();
      }
    }
    for (const f of G.flying) {
      const sl = handSlot(L, Math.min(4, G.hand.length + G.flying.indexOf(f))), k = Math.min(1, f.t / 0.6), e = k * k * (3 - 2 * k);
      const x = f.x + (sl.x - f.x) * e, y = f.y + (sl.y - f.y) * e - Math.sin(k * Math.PI) * 30, sc = 1.6 - 0.6 * e;
      g.save(); g.translate(x, y); g.rotate((1 - e) * 0.6); drawFace(g, img, f.n, sl.w * sc, sl.h * sc); g.restore();
    }
    // The friends (DOM actors): feet on their stack, falling, or in their hole (what is below the felt hidden).
    const s = L.cw * 0.0125;
    G.chars.forEach((ch, c) => {
      if (ch.none || ch.st === 'in' || ch.st === 'gone' || ch.st === 'spirit') return;
      const y = ch.st === 'top' ? ch.y - L.ry * 0.3 : ch.y;
      ch.ace.place(colX(L, c), y, s, shell.k);
      ch.ace.clip(ch.st === 'sink' ? 116 - (ch.y - L.base) / s : null);
    });
    (G.all || []).forEach((ch) => { if (ch.st === 'spirit' && ch.spT >= 0) ch.ace.place(ch.spX, ch.y, s, shell.k); });
    // The powers' pills.
    if (!onTitle()) {
      const PILL_W = pillW(W), ix = PILL_W < 50 ? 9 : 12;
      POWERS.forEach((p, i) => {
        const x = pillX(L, i), n = G.inv[p], on = G.armed === p, lit = G.showCursor && cur.bar === i;
        g.globalAlpha = n ? 1 : 0.4;
        rr(g, x - PILL_W / 2, PILL_Y - PILL_H / 2, PILL_W, PILL_H, PILL_H / 2);
        g.fillStyle = on ? 'rgba(245,197,24,.35)' : 'rgba(8,14,22,.72)'; g.fill();
        g.strokeStyle = on || lit ? '#f5d77a' : 'rgba(216,178,90,.5)'; g.lineWidth = lit ? 2 : 1; g.stroke();
        g.fillStyle = '#f5f0e3'; g.textAlign = 'center'; g.textBaseline = 'middle';
        if (p === 'dealer') { g.beginPath(); g.arc(x - ix, PILL_Y, 7, 0, 7); g.fill(); g.fillStyle = '#141414'; g.font = '800 8px Inter, sans-serif'; g.fillText('D', x - ix, PILL_Y + 0.5); }
        else { g.font = '12px system-ui, sans-serif'; g.fillText(P_ICON[p], x - ix, PILL_Y + 1); }
        g.fillStyle = '#f5f0e3'; g.font = '700 11px Inconsolata, monospace'; g.fillText('×' + n, x + ix * 0.75, PILL_Y + 0.5);
        g.globalAlpha = 1;
      });
    }
    // Particles, scores, the Ace's word, the banner.
    for (const p of G.parts) {
      g.globalAlpha = Math.max(0, 1 - p.t / p.life); g.fillStyle = p.c;
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
      if (p.conf) g.fillRect(-p.r, -1.5, p.r * 2, 3 * Math.abs(Math.cos(p.rot)));
      else { g.beginPath(); g.ellipse(0, 0, p.r, p.r * 0.45, 0, 0, 7); g.fill(); }
      g.restore();
    }
    g.globalAlpha = 1;
    for (const f of G.fx) {
      const p = f.t / f.life, sc = 1 + 0.3 * Math.max(0, 1 - p * 6);
      g.globalAlpha = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;
      if (f.t < 0) continue;
      g.font = '800 ' + (f.big ? 15 : f.small ? 8 : 11) + 'px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const fw = g.measureText(f.s).width, fit = Math.min(1, (W - 8) / Math.max(1, fw));
      g.save(); g.translate(Math.max(fw * fit / 2 + 4, Math.min(W - fw * fit / 2 - 4, f.x)), f.y - p * 26); g.scale(sc * fit, sc * fit);
      g.lineWidth = 3.5; g.strokeStyle = '#141414'; g.strokeText(f.s, 0, 0);
      g.fillStyle = f.green ? '#7ee2a0' : f.big || f.tier >= 3 ? '#f5d77a' : f.tier === 2 ? '#ffd9a0' : '#fbf7ee'; g.fillText(f.s, 0, 0);
      g.restore();
    }
    g.globalAlpha = 1;
    if (G.say && !onTitle()) {
      const a = G.say.t < 0.2 ? G.say.t / 0.2 : G.say.t > 2.4 ? Math.max(0, 1 - (G.say.t - 2.4) / 0.4) : 1;
      g.save(); g.globalAlpha = a;
      g.font = '600 10.5px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const s2 = '♠ ' + G.say.s, tw = Math.min(W - 16, g.measureText(s2).width + 18), y = TOP + 12;
      rr(g, W / 2 - tw / 2, y - 10, tw, 20, 10); g.fillStyle = '#fbf7ee'; g.fill();
      g.fillStyle = '#141414'; g.fillText(s2, W / 2, y, tw - 12);
      g.restore();
    }
    if (G.banner) {
      const b = G.banner, p = b.t / b.life, sc = 1 + 0.25 * Math.max(0, 1 - p * 6);
      g.save(); g.globalAlpha = p < 0.8 ? 1 : 1 - (p - 0.8) / 0.2;
      g.font = '700 26px Cinzel, Georgia, serif';
      const fit = Math.min(1, (W * 0.9) / Math.max(1, g.measureText(b.s).width));
      g.translate(W / 2, H * 0.42); g.scale(sc * fit, sc * fit);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 5; g.strokeStyle = '#141414'; g.strokeText(b.s, 0, 0); g.fillStyle = '#f5d77a'; g.fillText(b.s, 0, 0);
      if (b.s2) { g.font = '700 12px Inter, system-ui, sans-serif'; g.lineWidth = 3.5; g.strokeText(b.s2, 0, 24); g.fillStyle = '#fbf7ee'; g.fillText(b.s2, 0, 24); }
      g.restore();
    }
  }

  try { if (navigator.webdriver) window.__pthTapis = { run: () => G, state: () => state, act, check: afterMove, level: (n) => { G.lv = n; newRound(); }, timeUp: () => { if (state === 'run') { if (timed()) G.timeLeft = 0.01; else gameOver(t(mode === 'folie' ? 'tpOver' : 'tpAllIn')); } }, turn: () => G.turn, picked: () => G.picked, screenOf: (c, r) => { const L = geom(), rc = shell.stage.getBoundingClientRect(), k = shell.k || 1; return { x: rc.left + colX(L, c) * k, y: rc.top + (chipY(L, c, r) - L.bh / 2) * k }; }, trophy: () => !!G.trophy, pass: () => turnTo(1 - G.turn), mode: () => mode, hof: () => openHof(), start: (m) => { sel = Math.max(0, MODES.findIndex((x) => x.id === m)); start(); } }; } catch (e) {}
  return {
    update, draw, input, resize: () => {},
    running: () => state === 'run' || state === 'clear',
    destroy() {
      clearTimeout(timer); clearTimeout(check);
      shell.stage.removeEventListener('pointermove', onMove);
      shell.stage.removeEventListener('pointerleave', onLeave);
      if (G) (G.all || []).forEach((ch) => ch.ace.remove());
    },
  };
}
