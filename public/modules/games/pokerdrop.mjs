// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Poker Drop (« Puissance Poker ») — hidden mini-game (web extension, narmod
// 2026-10-20), in the arcade behind the training nickname « mascot ».
//
// An upright 7 × 6 grid: a card dropped in a column falls to the lowest free
// cell. The cards belong to no one; each player holds two, face up, plays
// one and draws. Five cards in a row — across, up or on a diagonal — make a
// poker hand, scored by whoever fills the line (pokerdrop-rules.mjs).
//   Opponent   the Ace (aceMove), or two players on the same screen, or
//              the daily challenge alone (the same cards for everyone on a
//              given UTC day, its best kept per day)
//   Rule       Points (the grid full, the best score wins) or Sudden death
//              (the first straight or better wins at once; else the points)
// Keys: ←/→ the column, ↑/↓ the other card, Space / Enter drop; a tap on a
// card picks it, a tap on a column drops there. Pad: D-pad, A.
// Secret trophy « Poker Drop »: beat the Ace with TROPHY_SCORE points or more.
// The look (web.89, narmod's pick « B » of the mock-ups): a Connect Four
// board — a blue plastic frame on two splayed feet, a window shaped like a
// card in each cell; a card falls behind the frame (seen through the
// windows), lands with a small bounce and a knock.
// ═══════════════════════════════════════════════════════════════════

import { COLS, ROWS, CELLS, HAND, SCORE, SUDDEN_CAT, cellOf, rowOf, colOf, emptyGrid, dropRow, openCols, isFull, scoreDrop, aceMove } from './pokerdrop-rules.mjs';
import { dayKey } from './solitaire-rules.mjs';
import { deckFor } from './deal.mjs';
import { fmt, cardHtml, imageCache, rr, drawFace, aceActor } from './common.mjs';
import { felt, drawBackCard, drawFloaters, stepFloaters, bubble, fitFont } from './ui.mjs';
import { titleScreen } from './title.mjs';
import { endScreen, listHtml } from './end.mjs';

export const TROPHY_SCORE = 40;
const SHORT = ['oddsHigh', 'oddsPair', 'oddsTwoPair', 'oddsTrips', 'oddsStraight', 'oddsFlush', 'oddsFull', 'oddsQuads', 'oddsSF', 'oddsRoyal'];
const GAP = 7, SIDE = 108, TOP = 46, ACE_S = 0.32;
// The frame round the windows, its blue, the feet's height.
const FRAME = 9, BLUE = ['#2f6fd6', '#1b4fa8'], BLUE_DK = '#123d86', FOOT = 22;
const P_COL = ['#d8b25a', '#7fc8ff'];          // the two players' marks (gold, blue)
// Modes of the title page: against the Ace, two players, daily challenge.
const MODES = ['ace', 'two', 'daily'];

const CSS = '#pth-game .pd-box{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 16px;border-radius:12px;background:rgba(11,18,16,.9);'
  + 'box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
  + '#pth-game .pd-box .ar-show{flex-wrap:nowrap}'
  + '#pth-game.pg-light .pd-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
  + '#pth-game .pd-turn{max-width:46vw;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}';

export function create(shell) {
  const { t, esc, sound } = shell;
  const img = imageCache();
  const ace = aceActor(shell.layer);
  shell.touchPad(false);
  shell.hud.classList.add('on-felt');
  if (!document.getElementById('pth-game-pd-css')) {
    const st = document.createElement('style'); st.id = 'pth-game-pd-css'; st.textContent = CSS;
    document.head.appendChild(st);
  }

  const dailyKey = 'pth_game_daily_pokerdrop';
  const dailyBest = (day) => { try { const v = JSON.parse(localStorage.getItem(dailyKey) || 'null'); return v && v.d === day ? v.s : 0; } catch (e) { return 0; } };
  const setDailyBest = (day, s) => { try { localStorage.setItem(dailyKey, JSON.stringify({ d: day, s })); } catch (e) {} };
  const ruleKey = 'pth_game_pokerdrop_rule';
  let sudden = false;
  try { sudden = localStorage.getItem(ruleKey) === 'sudden'; } catch (e) {}

  let state = 'title', mode = 0, G = null, time = 0, timer = 0;

  // ── A new game ────────────────────────────────────────────────────
  function newGame() {
    const m = MODES[mode], day = dayKey();
    const deck = deckFor(m === 'daily' ? 'pth-pokerdrop-' + day : null);
    const name = (i) => (m === 'ace' ? (i ? t('pdAce') : t('pdYou')) : m === 'two' ? t('pdPlayer', { n: i + 1 }) : t('pdYou'));
    const n = m === 'daily' ? 1 : 2;
    const players = [];
    for (let i = 0; i < n; i++) players.push({ name: name(i), hand: deck.splice(0, HAND), score: 0, ace: m === 'ace' && i === 1 });
    G = { m, day, sudden: m !== 'daily' && sudden, deck, grid: emptyGrid(), who: new Array(CELLS).fill(-1), players, turn: 0, sel: 0, col: 3,
      fly: null, flash: null, fx: [], say: null, last: -1, best: null, winner: -1, yayUntil: 0, koUntil: 0, coolUntil: 0, moves: 0, aiPlan: null };
    renderHud();
  }
  const cur = () => G.players[G.turn];
  const humanTurn = () => state === 'run' && !G.fly && !G.flash && !cur().ace;

  function renderHud() {
    if (!G) { shell.hud.innerHTML = ''; return; }
    const stat = (p, i) => '<div><div class="ar-lab" style="color:' + (G.players.length > 1 ? P_COL[i] : '') + '">' + esc(p.name) + '</div><div class="ar-num">' + esc(fmt(p.score)) + '</div></div>';
    const left = G.m === 'daily'
      ? stat(G.players[0], 0) + '<div><div class="ar-lab">' + esc(t('psCards')) + '</div><div class="ar-num">' + G.moves + '/' + CELLS + '</div></div>'
      : G.players.map(stat).join('');
    let msg = '';
    if (state === 'run') {
      if (G.m === 'daily') msg = t('psDaily') + ' · ' + G.day;
      else if (cur().ace) msg = t('pdAceTurn');
      else msg = G.m === 'ace' ? t('pdYourTurn') : t('pdTurn', { n: G.turn + 1 });
      if (G.sudden) msg += ' · ' + t('pdSudden');
    }
    shell.hud.innerHTML = '<div class="ar-stats">' + left + '</div><div class="ar-hand"><div class="ar-name pd-turn">' + esc(msg) + '</div></div>';
  }

  // ── Title: opponent and rule ──────────────────────────────────────
  function titlePanel() {
    const day = dayKey(), db = dailyBest(day), fb = shell.best.get();
    const daily = MODES[mode] === 'daily';
    const scale = [9, 8, 7, 6, 5, 4, 3, 2, 1].map((c) => esc(t(SHORT[c])) + ' ' + SCORE[c]).join(' · ');
    // The opponents are the tiles; the rule (points or sudden death), the options (↓ switches).
    titleScreen(shell, { id: 'pokerdrop', name: t('pdName'), hint: t('pdHint'), sel: mode,
      modes: [{ icon: '🂡', label: t('pdVsAce'), desc: '', rec: fb ? t('arRecord', { n: fmt(fb) }) : '' },
        { icon: '👥', label: t('pdTwo'), desc: '', rec: '' },
        { icon: '📅', label: t('psDaily'), desc: day, rec: db ? t('arRecord', { n: fmt(db) }) : '' }],
      options: [{ id: 'points', label: t('pdPoints'), on: !sudden, off: daily, key: '↓' }, { id: 'sudden', label: t('pdSudden'), on: sudden, off: daily }],
      foot: (sudden && !daily ? esc(t('pdSuddenGoal')) + '<br>' : '') + scale,
      onPick: (i) => { mode = i; start(); }, onOption: (id) => setRule(id === 'sudden') });
  }
  function setRule(on) {
    if (MODES[mode] === 'daily') return;
    sudden = on;
    try { localStorage.setItem(ruleKey, on ? 'sudden' : 'points'); } catch (e) {}
    sound('notifyAction');
    titlePanel();
  }
  titlePanel();
  ace.pose('wave');
  // Browser tests only (navigator.webdriver): reach the game state.
  try { if (navigator.webdriver) window.__pthPD = { run: () => G, state: () => state, drop: (col, k) => { if (humanTurn()) { G.sel = k; G.col = col; drop(); } } }; } catch (e) {}

  function start() {
    clearTimeout(timer);
    newGame();
    state = 'run'; shell.panel(null);
    ace.pose('idle'); ace.mood('mc-m-smile'); ace.king(false);
    renderHud();
    nextTurn();
  }

  // ── Turns ─────────────────────────────────────────────────────────
  function nextTurn() {
    G.sel = cur().hand[G.sel] == null ? 1 - G.sel : G.sel;
    if (G.sel < 0 || G.sel >= HAND) G.sel = 0;
    const open = openCols(G.grid);
    if (open.indexOf(G.col) < 0) G.col = open.reduce((a, c) => (Math.abs(c - 3) < Math.abs(a - 3) ? c : a), open[0]);
    renderHud();
    if (cur().ace) {
      // The Ace thinks, shows his card and his column, then drops.
      timer = setTimeout(() => {
        if (state !== 'run') return;
        const other = G.players[1 - G.turn];
        const mv = aceMove(G.grid, cur().hand, other.hand, { sudden: G.sudden, level: 1 });
        if (!mv) return;
        G.aiPlan = mv; G.sel = mv.k;
        sound('notifyAction');
        const walk = () => {
          if (state !== 'run') return;
          if (G.col !== mv.col) { G.col += mv.col > G.col ? 1 : -1; timer = setTimeout(walk, 90); return; }
          timer = setTimeout(() => { if (state === 'run') { G.aiPlan = null; drop(); } }, 260);
        };
        timer = setTimeout(walk, 240);
      }, 520);
    }
  }
  function drop() {
    if (state !== 'run' || G.fly || G.flash) return;
    const row = dropRow(G.grid, G.col);
    const n = cur().hand[G.sel];
    if (row < 0 || n == null) { sound('notifyFold'); return; }
    G.fly = { n, col: G.col, row, t: 0, by: G.turn };
    G.say = null;
    cur().hand[G.sel] = null;
    sound('notifyCard');
  }
  function landed(f) {
    const cell = cellOf(f.row, f.col), p = G.players[f.by];
    const s = scoreDrop(G.grid, cell, f.n);
    G.grid[cell] = f.n; G.who[cell] = f.by; G.last = cell; G.moves++;
    G.bounce = { cell, t: 0 }; sound('notifyTick');
    p.score += s.points;
    // Draw back to two cards.
    if (G.deck.length) p.hand[G.sel] = G.deck.shift();
    if (s.lines.length) {
      const L = layout();
      for (const ln of s.lines) {
        const mid = cellXY(L, ln.cells[2]);
        G.fx.push({ s: (SCORE[ln.cat] ? '+' + SCORE[ln.cat] + ' ' : '') + t(SHORT[ln.cat]), x: mid.x, y: mid.y - 6, t: 0, life: 1.4, gold: SCORE[ln.cat] > 0, big: ln.cat >= 5 });
        if (!G.best || ln.cat > G.best.cat) G.best = { cat: ln.cat, cards: ln.cells.map((i) => G.grid[i]), by: f.by, nameKey: ln.nameKey };
      }
      G.flash = { lines: s.lines, t: 0, by: f.by };
      const now = performance.now();
      if (s.cat >= 2) {
        sound(s.cat >= 4 ? 'notifyBigWin' : 'notifyRaise');
        G.say = { s: t(s.lines.reduce((a, l) => (l.cat > a.cat ? l : a)).nameKey), t: 0, by: f.by };
        if (p.ace) G.coolUntil = now + 1400;
        else if (G.m === 'ace') G.koUntil = now + 900;
        else G.yayUntil = now + 900;
      }
    }
    renderHud();
    // Sudden death: a straight or better ends it at once.
    if (G.sudden && s.cat >= SUDDEN_CAT) { G.winner = f.by; G.endNow = true; return; }
    if (!G.flash) afterMove();
  }
  function afterMove() {
    if (G.endNow || isFull(G.grid)) { finish(); return; }
    if (G.players.length > 1) G.turn = 1 - G.turn;
    nextTurn();
  }

  // ── The end ───────────────────────────────────────────────────────
  function finish() {
    state = 'over'; G.overAt = performance.now();
    clearTimeout(timer);
    const ps = G.players;
    if (G.winner < 0 && ps.length > 1) G.winner = ps[0].score > ps[1].score ? 0 : ps[1].score > ps[0].score ? 1 : 2;
    let record = false, prev = 0;
    const mine = ps[0].score;
    shell.ended();
    if (G.m === 'daily') { prev = dailyBest(G.day); if (mine > prev) { setDailyBest(G.day, mine); record = prev > 0; } }
    else if (G.m === 'ace') {
      prev = shell.best.get();
      if (mine > prev) { shell.best.set(mine); record = prev > 0; }
      if (G.winner === 0 && mine >= TROPHY_SCORE) shell.grant('pdrop');
    }
    const aceWon = G.m === 'ace' && G.winner === 1, iWon = G.m === 'ace' && G.winner === 0;
    ace.mood(aceWon ? 'mc-m-cool' : iWon ? 'mc-m-ko' : 'mc-m-yay');
    ace.pose(aceWon || G.m !== 'ace' ? 'wave' : 'idle');
    if (record) sound('notifyBigWin'); else if (iWon || G.m === 'two') sound('notifyWinner', true); else if (aceWon) sound('notifyFold');
    G.res = { record, prev };
    renderHud();
    renderResult();
  }
  function toTitle() { state = 'title'; G = null; renderHud(); ace.pose('wave'); ace.mood('mc-m-smile'); titlePanel(); }
  /** The end screen (end.mjs, web.67): who won, the scores, the best hand made. */
  function renderResult() {
    if (state !== 'over' || !G.res || G.res.shown) return;
    G.res.shown = true;
    const ps = G.players, { prev } = G.res;
    let head;
    if (G.m === 'daily') head = t('psDaily');
    else if (G.winner === 2) head = t('pdTie');
    else if (G.m === 'ace') head = G.winner === 0 ? t('pdYouWin') : t('pdAceWins');
    else head = t('pdWins', { n: G.winner + 1 });
    const best = G.best && G.best.cat >= 1 ? G.best : null;
    endScreen(shell, {
      title: head, sub: (G.m === 'ace' ? t('pdVsAce') : G.m === 'two' ? t('pdTwo') : t('psDaily') + ' · ' + G.day) + (G.sudden ? ' · ' + t('pdSudden') : '') + ' · ' + t('pdName'),
      cards: best ? best.cards : [], hand: best ? t('psBestLine', { h: t(best.nameKey) }) : '',
      score: ps[0].score, prev: G.m === 'two' ? null : prev,
      levels: ps.length > 1 ? { title: t('hcScore'), right: ps.map((p) => fmt(p.score)).join(' – '), html: listHtml(esc, ps.map((p, i) => [p.name, fmt(p.score) + (G.winner === i ? ' 🏆' : ''), G.winner === i || G.winner === 2 ? 'gold' : false])) } : null,
      stats: [[fmt(ps[0].score), t('hcScore')], [best ? t(best.nameKey) : '—', t('gmBestHand')], [fmt(G.moves), t('psCards')]],
      onAgain: () => start(),
      onMenu: toTitle,
    });
  }


  // ── Layout (world px) ─────────────────────────────────────────────
  // Wide: the grid in the middle, a hand on each side. Narrow: the grid on
  // top, both hands in a band under it.
  function layout() {
    const W = shell.W, H = shell.H;
    const wide = W >= 470;
    const areaW = wide ? W - 2 * SIDE : W - 12;
    const areaH = (wide ? H - TOP - 8 : H - TOP - 96) - FRAME * 2 - (wide ? FOOT : 0);
    // The band over the grid takes the card about to drop: 0.62 of a card.
    let cw = Math.min((areaW - (COLS - 1) * GAP) / COLS, ((areaH - (ROWS - 1) * GAP) / (ROWS + 0.62)) * 0.72);
    cw = Math.max(18, Math.floor(cw));
    const ch = Math.round(cw / 0.72);
    const gw = COLS * cw + (COLS - 1) * GAP, gh = ROWS * ch + (ROWS - 1) * GAP;
    const hover = Math.round(ch * 0.62);
    const left = Math.round((W - gw) / 2);
    const top = (wide ? Math.round(TOP + hover + Math.max(0, (areaH - hover - gh) / 2)) : TOP + hover) + FRAME;
    const hcw = wide ? 42 : Math.min(32, Math.floor((W / 2 - 40) / 2.2)), hch = Math.round(hcw / 0.72);
    // Where each player's two cards sit (centre of the pair).
    const hands = wide
      ? [{ x: SIDE / 2, y: top + gh * 0.32 }, { x: W - SIDE / 2, y: top + gh * 0.32 }]
      : [{ x: W * 0.27, y: top + gh + FRAME + 18 + hch / 2 + 10 }, { x: W * 0.73, y: top + gh + FRAME + 18 + hch / 2 + 10 }];   // under the frame and its feet
    return { W, H, wide, cw, ch, gw, gh, left, top, hover, hcw, hch, hands };
  }
  function cellXY(L, cell) {
    const r = rowOf(cell), c = colOf(cell);
    return { x: L.left + c * (L.cw + GAP) + L.cw / 2, y: L.top + (ROWS - 1 - r) * (L.ch + GAP) + L.ch / 2 };
  }
  const colX = (L, c) => L.left + c * (L.cw + GAP) + L.cw / 2;
  // The two card places of player i: [{ x, y }, { x, y }].
  function handSlots(L, i) {
    const h = L.hands[G.players.length === 1 ? 0 : i];
    const dx = L.hcw / 2 + 3;
    return [{ x: h.x - dx, y: h.y }, { x: h.x + dx, y: h.y }];
  }

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'title') {
      if (a === 'left' || a === 'right') { mode = (mode + (a === 'left' ? -1 : 1) + MODES.length) % MODES.length; titlePanel(); }
      else if (a === 'duck') setRule(!sudden);
      else if (a === 'jump' && info.x == null) start();
      return;
    }
    if (state === 'over') {
      if (a === 'jump' && performance.now() > G.overAt + 900) start();
      return;
    }
    if (!humanTurn()) return;
    const up = a === 'jump' && (info.code === 'ArrowUp' || info.code === 'KeyW' || info.pad === 'up');
    if (a === 'left' || a === 'right') { stepCol(a === 'left' ? -1 : 1); return; }
    if (up || a === 'duck') { other(); return; }
    if (a !== 'jump') return;
    if (info.x != null) {
      const L = layout();
      // A card of the hand of the player to play: pick it.
      const slots = handSlots(L, G.turn);
      for (let k = 0; k < HAND; k++) {
        if (Math.abs(info.x - slots[k].x) <= L.hcw / 2 + 3 && Math.abs(info.y - slots[k].y) <= L.hch / 2 + 3) {
          if (cur().hand[k] != null) { G.sel = k; sound('notifyAction'); }
          return;
        }
      }
      // A column of the grid (or the band over it): drop there.
      if (info.x >= L.left - GAP && info.x <= L.left + L.gw + GAP && info.y >= L.top - FRAME - L.hover - 8 && info.y <= L.top + L.gh + 6) {
        const c = Math.max(0, Math.min(COLS - 1, Math.floor((info.x - L.left + GAP / 2) / (L.cw + GAP))));
        G.col = c;
        drop();
      }
      return;
    }
    drop();
  }
  function stepCol(d) {
    for (let k = 1; k <= COLS; k++) {
      const c = G.col + d * k;
      if (c < 0 || c >= COLS) break;
      if (dropRow(G.grid, c) >= 0) { G.col = c; return; }
    }
  }
  function other() {
    const k = 1 - G.sel;
    if (cur().hand[k] != null) { G.sel = k; sound('notifyAction'); }
  }

  // ── Update ────────────────────────────────────────────────────────
  function update(dt) {
    time += dt;
    if (!G) return;
    if (G.fly) {
      G.fly.t += dt;
      const L = layout(), to = cellXY(L, cellOf(G.fly.row, G.fly.col)).y, from = L.top - FRAME - L.hover / 2 - 4;
      // Falls under gravity: the time to the cell grows with the distance.
      const dur = Math.sqrt(Math.max(8, to - from) / 1800) * 1.15;
      if (G.fly.t >= dur) { const f = G.fly; G.fly = null; landed(f); }
      else G.fly.y = from + (to - from) * Math.pow(G.fly.t / dur, 2);
    }
    if (G.bounce && (G.bounce.t += dt) > 0.3) G.bounce = null;
    if (G.flash) { G.flash.t += dt; if (G.flash.t > 1.25) { G.flash = null; if (state === 'run') afterMove(); } }
    stepFloaters(G.fx, dt);
    if (G.say) { G.say.t += dt; if (G.say.t > 2.4) G.say = null; }
    if (G.endNow && !G.flash && state === 'run') finish();
    if (state === 'run') {
      const now = performance.now();
      ace.mood(now < G.coolUntil ? 'mc-m-cool' : now < G.koUntil ? 'mc-m-ko' : now < G.yayUntil ? 'mc-m-yay' : 'mc-m-smile');
      ace.pose(now < G.yayUntil || now < G.coolUntil ? 'wave' : 'idle');
    }
  }

  // ── Drawing ───────────────────────────────────────────────────────
  function draw(g) {
    const L = layout(), W = L.W, H = L.H;
    felt(g, W, H, shell.theme.light);
    feet(g, L);
    // Behind the frame: the dark of the empty windows, the cards in place, the one falling.
    for (let i = 0; i < CELLS; i++) { const c = cellXY(L, i); win(g, L, c.x, c.y); g.fillStyle = '#071510'; g.fill(); }
    if (!G) { frame(g, L); placeAce(L); return; }
    const flashSet = new Set();
    if (G.flash) for (const ln of G.flash.lines) for (const c of ln.cells) flashSet.add(c);
    const bob = (i) => (G.bounce && G.bounce.cell === i ? -Math.sin(Math.min(1, G.bounce.t / 0.3) * Math.PI) * L.ch * 0.07 : 0);
    for (let i = 0; i < CELLS; i++) {
      const c = cellXY(L, i), n = G.grid[i];
      if (n == null) continue;
      g.save(); g.translate(c.x, c.y + bob(i));
      if (G.flash && !flashSet.has(i)) g.globalAlpha = 0.55;
      drawFace(g, img, n, L.cw, L.ch);
      g.restore();
    }
    if (G.fly) { g.save(); g.translate(colX(L, G.fly.col), G.fly.y == null ? L.top - FRAME - L.hover / 2 : G.fly.y); drawFace(g, img, G.fly.n, L.cw, L.ch); g.restore(); }
    frame(g, L);
    // Over the frame: who dropped each card, the last one.
    for (let i = 0; i < CELLS; i++) {
      if (G.grid[i] == null) continue;
      const c = cellXY(L, i);
      if (G.players.length > 1 && G.who[i] >= 0) {
        g.beginPath(); g.arc(c.x + L.cw / 2 - 3.5, c.y + L.ch / 2 - 3.5 + bob(i), 2.4, 0, Math.PI * 2);
        g.fillStyle = P_COL[G.who[i]]; g.fill(); g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 0.8; g.stroke();
      }
      if (i === G.last && !G.fly) { rr(g, c.x - L.cw / 2 - 1.5, c.y - L.ch / 2 - 1.5 + bob(i), L.cw + 3, L.ch + 3, 4); g.strokeStyle = 'rgba(255,236,170,.9)'; g.lineWidth = 1.5; g.stroke(); }
    }
    // The lines just filled.
    if (G.flash) {
      const a = Math.min(1, G.flash.t / 0.15) * (G.flash.t > 1 ? Math.max(0, 1 - (G.flash.t - 1) / 0.25) : 1);
      g.save(); g.globalAlpha = a;
      for (const ln of G.flash.lines) {
        const p = cellXY(L, ln.cells[0]), q = cellXY(L, ln.cells[4]);
        g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y);
        g.strokeStyle = SCORE[ln.cat] ? (G.players.length > 1 ? P_COL[G.flash.by] : '#f0c75e') : 'rgba(245,240,227,.6)';
        g.lineWidth = Math.max(3, L.cw * 0.16); g.lineCap = 'round'; g.globalAlpha = a * 0.75; g.stroke();
      }
      g.restore();
    }
    // The card about to drop, over its column, and where it would land.
    if (state === 'run' && !G.fly && !G.flash) {
      const n = cur().hand[G.sel], row = dropRow(G.grid, G.col);
      if (n != null && row >= 0) {
        const x = colX(L, G.col), y = L.top - FRAME - L.hover / 2 - 4;
        const land = cellXY(L, cellOf(row, G.col));
        rr(g, land.x - L.cw / 2, land.y - L.ch / 2, L.cw, L.ch, 3);
        g.setLineDash([3, 3]); g.strokeStyle = G.players.length > 1 ? P_COL[G.turn] : '#d8b25a'; g.lineWidth = 1.5; g.stroke(); g.setLineDash([]);
        // What it would score (the player's own turn only).
        if (!cur().ace) {
          const s = scoreDrop(G.grid, cellOf(row, G.col), n);
          if (s.points) {
            g.font = '700 ' + Math.max(9, Math.round(L.cw * 0.34)) + 'px Inconsolata, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillStyle = '#f5d77a'; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 3;
            g.fillText('+' + s.points, land.x, land.y); g.shadowBlur = 0;
          }
        }
        g.save(); g.translate(x, y + Math.sin(time * 4) * 1.5); g.globalAlpha = 0.95; drawFace(g, img, n, L.cw * 0.86, L.ch * 0.86); g.restore();
      }
    }
    drawHands(g, L);
    drawFloaters(g, G.fx);
    placeAce(L);
    if (G.say && state !== 'title') {
      const a = G.say.t < 0.2 ? G.say.t / 0.2 : G.say.t > 2 ? Math.max(0, 1 - (G.say.t - 2) / 0.4) : 1;
      const ap = G.m === 'two' ? null : acePos(L);
      if (ap) bubble(g, G.say.s, ap.x, ap.y - 76 * (ACE_S / 0.36), W, a, 150);
      else { const h = L.hands[G.m === 'two' ? G.say.by || 0 : G.players.length > 1 ? 1 : 0]; bubble(g, G.say.s, h.x, h.y - L.hch / 2 - 18, W, a, 150); }
    }
  }
  /** The window of a cell: a card's shape, a hair larger than the card. */
  function win(g, L, x, y) { rr(g, x - L.cw / 2 - 1, y - L.ch / 2 - 1, L.cw + 2, L.ch + 2, Math.max(3, L.cw * 0.14)); }
  /** The blue frame: its windows cut out, a light along the top, a dark rim round each window. */
  function frame(g, L) {
    const x0 = L.left - FRAME, y0 = L.top - FRAME, w = L.gw + FRAME * 2, h = L.gh + FRAME * 2, r = Math.max(4, FRAME * 0.6);
    g.save();
    g.beginPath();
    g.moveTo(x0 + r, y0); g.arcTo(x0 + w, y0, x0 + w, y0 + h, r); g.arcTo(x0 + w, y0 + h, x0, y0 + h, r); g.arcTo(x0, y0 + h, x0, y0, r); g.arcTo(x0, y0, x0 + w, y0, r); g.closePath();
    for (let i = 0; i < CELLS; i++) {
      const c = cellXY(L, i), wx = c.x - L.cw / 2 - 1, wy = c.y - L.ch / 2 - 1, ww = L.cw + 2, wh = L.ch + 2, wr = Math.max(3, L.cw * 0.14);
      g.moveTo(wx + wr, wy); g.lineTo(wx + ww - wr, wy); g.arcTo(wx + ww, wy, wx + ww, wy + wr, wr); g.lineTo(wx + ww, wy + wh - wr); g.arcTo(wx + ww, wy + wh, wx + ww - wr, wy + wh, wr);
      g.lineTo(wx + wr, wy + wh); g.arcTo(wx, wy + wh, wx, wy + wh - wr, wr); g.lineTo(wx, wy + wr); g.arcTo(wx, wy, wx + wr, wy, wr); g.closePath();
    }
    const gr = g.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, BLUE[0]); gr.addColorStop(1, BLUE[1]);
    g.fillStyle = gr; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 12; g.shadowOffsetY = 4;
    g.fill('evenodd');
    g.restore();
    g.fillStyle = 'rgba(140,185,255,.55)'; g.fillRect(x0 + r, y0, w - 2 * r, 2);
    g.strokeStyle = BLUE_DK; g.lineWidth = 1.6;
    for (let i = 0; i < CELLS; i++) { const c = cellXY(L, i); win(g, L, c.x, c.y); g.stroke(); }
    // A notch over each column, where the cards go in.
    g.fillStyle = 'rgba(8,25,60,.75)';
    for (let c = 0; c < COLS; c++) { const x = colX(L, c); rr(g, x - L.cw * 0.28, y0 - 1, L.cw * 0.56, 3, 1.5); g.fill(); }
  }
  /** Its two splayed feet (wide screens: under it; narrow: just the frame's own height). */
  function feet(g, L) {
    const y0 = L.top + L.gh + FRAME - 2, y1 = y0 + (L.wide ? FOOT : Math.min(FOOT, 12));
    g.fillStyle = '#1a47a0';
    for (const sx of [-1, 1]) {
      const x = sx < 0 ? L.left - FRAME + 12 : L.left + L.gw + FRAME - 12, out = sx * (L.wide ? 18 : 10);
      g.beginPath(); g.moveTo(x - 7, y0); g.lineTo(x + 7, y0); g.lineTo(x + out + (sx < 0 ? 4 : 4), y1); g.lineTo(x + out - 8, y1); g.closePath(); g.fill();
      rr(g, x + out - (sx < 0 ? 16 : 6), y1 - 4, 22, 6, 3); g.fillStyle = '#163e8c'; g.fill(); g.fillStyle = '#1a47a0';
    }
  }
  function drawHands(g, L) {
    G.players.forEach((p, i) => {
      const slots = handSlots(L, i), active = state === 'run' && G.turn === i;
      // Name over the cards.
      g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      const lx = (slots[0].x + slots[1].x) / 2, ly = slots[0].y - L.hch / 2 - 6;
      g.fillStyle = G.players.length > 1 ? P_COL[i] : '#f5f0e3';
      fitFont(g, p.name, L.wide ? SIDE - 12 : L.W / 2 - 16, 11, 700);
      g.globalAlpha = active || state !== 'run' ? 1 : 0.6;
      g.fillText(p.name, lx, ly);
      g.globalAlpha = 1;
      for (let k = 0; k < HAND; k++) {
        const s = slots[k], n = p.hand[k];
        const chosen = active && G.sel === k && !G.fly;
        const yy = s.y - (chosen ? 4 : 0);
        if (n == null) {
          if (!(G.fly && G.fly.by === i)) drawBackCard(g, img, s.x, yy, L.hcw, L.hch);
          continue;
        }
        g.save(); g.translate(s.x, yy); if (!active && state === 'run') g.globalAlpha = 0.75; drawFace(g, img, n, L.hcw, L.hch); g.restore();
        if (chosen) { rr(g, s.x - L.hcw / 2 - 2.5, yy - L.hch / 2 - 2.5, L.hcw + 5, L.hch + 5, 5); g.strokeStyle = G.players.length > 1 ? P_COL[i] : '#d8b25a'; g.lineWidth = 2; g.stroke(); }
      }
    });
    // Alone: the pile left, its count, beside the grid.
    if (L.wide && G.players.length === 1 && G.deck.length) {
      const x = L.W - SIDE / 2, y = L.top + L.gh - L.hch / 2;
      drawBackCard(g, img, x, y - 30, L.hcw * 0.8, L.hch * 0.8);
      g.font = '600 10px Inconsolata, monospace'; g.textAlign = 'center'; g.fillStyle = 'rgba(245,240,227,.7)';
      g.fillText(String(G.deck.length), x, y + 4);
    }
  }
  // The Ace: under his cards when he plays, beside the grid otherwise; off on a narrow stage.
  function acePos(L) {
    if (!L.wide) return null;
    if (!G || G.m === 'two') return { x: L.W - SIDE / 2, y: L.top + L.gh + 2 };
    if (G.m === 'ace') return { x: L.W - SIDE / 2, y: Math.min(L.H - 6, L.hands[1].y + L.hch / 2 + 92) };
    return { x: L.W - SIDE / 2, y: Math.min(L.H - 6, L.top + L.gh * 0.55) };
  }
  function placeAce(L) {
    const p = acePos(L);
    ace.show(!!p && !(G && G.m === 'two' && state === 'run'));
    if (p) ace.place(p.x, p.y, ACE_S, shell.k);
  }

  return {
    update, draw, input, resize: renderResult,
    theme() {},
    running: () => state === 'run',
    destroy() { clearTimeout(timer); ace.remove(); },
  };
}
