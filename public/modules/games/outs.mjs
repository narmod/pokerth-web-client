// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Count the Outs — lesson 4 of the arcade's « Learn poker » shelf (web
// extension, narmod 2026-10-16), behind the training nickname « mascot ».
//
// Your two cards and a flop (or a turn): you are on a draw. How many cards
// left in the deck give you a straight, a flush or better, with at least
// one of your cards playing (outsOf)? Four counts to choose from. After the
// answer every out is shown with what it makes, then the rule of 4 (flop)
// or 2 (turn) against the exact odds.
// A game is HANDS hands; the score the right counts.
// Keys: ←/→ choose, Space confirms; Space goes on. A tap does the same.
// Secret trophy « Out Counter »: TROPHY_RIGHT of HANDS.
// ═══════════════════════════════════════════════════════════════════

import { rankHand, rankOf } from './poker-hand.mjs';
import { shuffled } from './deal.mjs';
import { fmt, imageCache, rr, drawFace, aceActor } from './common.mjs';
import { felt, drawFloaters, stepFloaters, keyboardFirst, fitFont } from './ui.mjs';

export const HANDS = 12, TROPHY_RIGHT = 10;
const SHORT = ['oddsHigh', 'oddsPair', 'oddsTwoPair', 'oddsTrips', 'oddsStraight', 'oddsFlush', 'oddsFull', 'oddsQuads', 'oddsSF', 'oddsRoyal'];

/**
 * The outs of `hand` on `board`: every unseen card after which the hand is a
 * straight or better, of a higher kind than the board (with that card) alone.
 * @returns {{ c: number, cat: number }[]}
 */
export function outsOf(hand, board) {
  const used = new Set(hand.concat(board)), outs = [];
  for (let c = 0; c < 52; c++) {
    if (used.has(c)) continue;
    const r = rankHand(hand.concat(board, [c]));
    if (r.cat >= 4 && r.cat > rankHand(board.concat([c])).cat) outs.push({ c, cat: r.cat });
  }
  return outs;
}

/** Chances to hit by the river: the rule of 4 / 2 and the exact figure (whole %). */
export function oddsOf(n, flop) {
  if (flop) return { rule: n * 4, exact: Math.round(100 * (1 - ((47 - n) * (46 - n)) / (47 * 46))) };
  return { rule: n * 2, exact: Math.round((100 * n) / 46) };
}

/** Three wrong counts around the right one, all shown in order. */
export function choicesFor(n, rnd = Math.random) {
  const near = [n - 1, n + 1, n - 2, n + 2, n - 3, n + 3, n - 4, n + 4].filter((x) => x >= 1);
  for (let i = near.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [near[i], near[j]] = [near[j], near[i]]; }
  return near.slice(0, 3).concat([n]).sort((a, b) => a - b);
}

/**
 * A question: { hand, board, flop, outs, choices, answer (index) }. Draws of
 * four outs (gutshots, two pair to a full house) come up far more often than
 * the others when dealt at random: most are passed over.
 */
export function makeQuestion(rnd = Math.random) {
  for (let tries = 0; tries < 400; tries++) {
    const d = shuffled(rnd);
    const flop = rnd() < 0.6;
    const hand = d.slice(0, 2), board = d.slice(2, flop ? 5 : 6);
    if (rankHand(hand.concat(board)).cat >= 4) continue;
    const outs = outsOf(hand, board);
    if (outs.length < 4 || outs.length > 21) continue;
    if (outs.length === 4 && rnd() < 0.7) continue;
    outs.sort((a, b) => b.cat - a.cat || rankOf(b.c) - rankOf(a.c) || a.c - b.c);
    const choices = choicesFor(outs.length, rnd);
    return { hand, board, flop, outs, choices, answer: choices.indexOf(outs.length) };
  }
  return null;
}

export function create(shell) {
  const { t, esc, sound } = shell;
  const img = imageCache();
  const ace = aceActor(shell.layer);
  shell.touchPad(false);
  shell.hud.classList.add('on-felt');
  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('hcScore')) + '</div><div class="ar-num ot-score">0</div></div>'
    + '<div><div class="ar-lab">' + esc(t('vpHands')) + '</div><div class="ar-num ot-n">0/' + HANDS + '</div></div></div>';
  const hScore = /** @type {HTMLElement} */ (shell.hud.querySelector('.ot-score'));
  const hN = /** @type {HTMLElement} */ (shell.hud.querySelector('.ot-n'));
  ensureCss();

  let state = 'title', G = null, time = 0, timer = 0;
  function newGame() { G = { n: 0, right: 0, q: null, sel: 0, pick: -1, ok: false, fx: [], yayUntil: 0, koUntil: 0 }; renderHud(); }
  function renderHud() { hScore.textContent = fmt(G.right); hN.textContent = G.n + '/' + HANDS; }
  function titlePanel() {
    const best = shell.best.get();
    shell.panel('<h2>' + esc(t('otName')) + '</h2><p>' + esc(t('otHint')) + '</p>'
      + (best ? '<p class="pg-dim">' + esc(t('arRecord', { n: best + '/' + HANDS })) + '</p>' : '')
      + '<p class="pg-blink">' + esc(t('arTapStart')) + '</p>');
  }
  newGame();
  titlePanel();
  try { if (navigator.webdriver) window.__pthOT = { run: () => G, state: () => state }; } catch (e) {}

  function start() { clearTimeout(timer); newGame(); shell.panel(null); ace.pose('idle'); ace.mood('mc-m-smile'); next(); }
  function next() {
    if (G.n >= HANDS) { finish(); return; }
    G.n++; G.q = makeQuestion(); G.sel = 0; G.pick = -1;
    state = 'ask'; sound('notifyCard'); renderHud();
  }
  function choose(i) {
    if (state !== 'ask') return;
    G.pick = i; G.ok = i === G.q.answer;
    if (G.ok) { G.right++; G.yayUntil = performance.now() + 700; sound('notifyRaise'); }
    else { G.koUntil = performance.now() + 900; sound('notifyFold'); }
    state = 'shown'; renderHud();
    clearTimeout(timer); timer = setTimeout(goOn, G.ok ? 3500 : 6000);
  }
  function goOn() { if (state !== 'shown') return; clearTimeout(timer); next(); }
  function finish() {
    state = 'over';
    const score = G.right, prev = shell.best.get(), record = score > prev;
    if (record) shell.best.set(score);
    if (score >= TROPHY_RIGHT) shell.grant('outs');
    if (record && prev) sound('notifyBigWin');
    ace.mood(score >= TROPHY_RIGHT ? 'mc-m-cool' : 'mc-m-smile'); ace.pose(score >= TROPHY_RIGHT ? 'wave' : 'idle');
    G.res = { score, record, prev };
    renderResult();
  }
  function renderResult() {
    if (state !== 'over' || !G.res) return;
    const { score, record, prev } = G.res;
    shell.panel('<div class="ot-box"><h2>' + score + '/' + HANDS + '</h2>'
      + '<p class="pg-dim">' + esc(record && prev ? t('arNewRecord') : t('arRecord', { n: Math.max(score, prev) + '/' + HANDS })) + '</p>'
      + '<p class="pg-blink">' + esc(t('gmAgain')) + '</p></div>', true);
  }

  // ── Layout (world px) ─────────────────────────────────────────────
  function L() {
    const W = shell.W, H = shell.H;
    let top = 46;
    try { top = Math.max(40, shell.hud.offsetHeight / (shell.k || 1) + 6); } catch (e) {}
    const narrow = W < 470, gap = 5;
    const cw = Math.min(narrow ? 36 : 48, (W - 16 - 4 * gap) / 5), ch = cw * 1.4;
    const boardY = top + 8 + ch / 2;
    const hw = cw * 1.1, hh = hw * 1.4;
    const handY = boardY + ch / 2 + 12 + hh / 2;
    const bw = Math.min(64, (W - 24 - 3 * 8) / 4), bh = 30;
    const btnY = handY + hh / 2 + 12 + bh / 2;
    const btn = [0, 1, 2, 3].map((i) => ({ x: W / 2 + (i - 1.5) * (bw + 8), y: btnY }));
    return { W, H, narrow, top, gap, cw, ch, boardY, hw, hh, handY, bw, bh, btn };
  }
  function choiceAt(l, x, y) {
    for (let i = 0; i < 4; i++) if (Math.abs(x - l.btn[i].x) <= l.bw / 2 + 3 && Math.abs(y - l.btn[i].y) <= l.bh / 2 + 4) return i;
    return -1;
  }

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'title') { if (a === 'jump') start(); return; }
    if (state === 'over') { if (a === 'jump') { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); titlePanel(); } return; }
    if (state === 'shown') { if (a === 'jump') goOn(); return; }
    if (state !== 'ask') return;
    if (info.x != null) { const i = choiceAt(L(), info.x, info.y); if (i >= 0) choose(i); return; }
    if (a === 'left') G.sel = (G.sel + 3) % 4;
    else if (a === 'right') G.sel = (G.sel + 1) % 4;
    else if (a === 'jump' && !(info.code === 'ArrowUp' || info.pad === 'up')) choose(G.sel);
  }

  function update(dt) {
    time += dt;
    if (!G) return;
    stepFloaters(G.fx, dt);
    if (state === 'title' || state === 'over') return;
    const now = performance.now();
    ace.mood(now < G.koUntil ? 'mc-m-ko' : now < G.yayUntil ? 'mc-m-yay' : 'mc-m-smile');
    ace.pose(now < G.yayUntil ? 'wave' : 'idle');
  }

  // ── Drawing ───────────────────────────────────────────────────────
  function card(g, n, x, y, w, h, lit) {
    g.save(); g.translate(x, y); drawFace(g, img, n, w, h);
    if (lit) { rr(g, -w / 2 - 2.5, -h / 2 - 2.5, w + 5, h + 5, 5); g.strokeStyle = '#f5d77a'; g.lineWidth = 2; g.stroke(); }
    g.restore();
  }
  function text(g, s, x, y, maxW, size, color) {
    g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitFont(g, s, maxW, size, 700); g.fillText(s, x, y);
  }
  function draw(g) {
    const l = L(), W = l.W, H = l.H;
    felt(g, W, H, shell.theme.light);
    if ((state === 'ask' || state === 'shown') && G.q) {
      const q = G.q, shown = state === 'shown', nb = q.board.length;
      for (let i = 0; i < 5; i++) {
        const x = W / 2 + (i - 2) * (l.cw + l.gap);
        if (i < nb) card(g, q.board[i], x, l.boardY, l.cw, l.ch, false);
        else { rr(g, x - l.cw / 2, l.boardY - l.ch / 2, l.cw, l.ch, 4); g.strokeStyle = 'rgba(245,240,227,.25)'; g.setLineDash([3, 3]); g.lineWidth = 1.2; g.stroke(); g.setLineDash([]); }
      }
      for (let k = 0; k < 2; k++) card(g, q.hand[k], W / 2 + (k - 0.5) * (l.hw + 6), l.handY, l.hw, l.hh, true);
      q.choices.forEach((n, i) => {
        const b = l.btn[i], isAns = i === q.answer;
        rr(g, b.x - l.bw / 2, b.y - l.bh / 2, l.bw, l.bh, 8);
        g.fillStyle = shown && isAns ? 'rgba(63,174,106,.55)' : shown && i === G.pick ? 'rgba(179,38,30,.55)' : 'rgba(0,0,0,.28)'; g.fill();
        const ring = shown ? (isAns ? '#7ee2a0' : null) : (keyboardFirst() && i === G.sel ? '#f5f0e3' : null);
        if (ring) { g.strokeStyle = ring; g.lineWidth = 2.5; g.stroke(); }
        text(g, String(n), b.x, b.y + 1, l.bw - 8, 16, shown && isAns ? '#f5d77a' : '#f5f0e3');
      });
      if (shown) drawShown(g, l, q);
    }
    ace.place(l.narrow ? W - 20 : W - 28, H - 4, l.narrow ? 0.17 : 0.26, shell.k);
    if (G) drawFloaters(g, G.fx);
  }
  function drawShown(g, l, q) {
    const W = l.W, n = q.outs.length;
    let y = l.btn[0].y + l.bh / 2 + 13;
    const verdict = (G.ok ? '✓ ' : '✗ ') + t('otOuts', { n });
    text(g, verdict, W / 2, y, W - 40, 13, G.ok ? '#7ee2a0' : '#ff8a80');
    // What the outs make: « Flush 9 · Straight 6 ».
    const by = {};
    q.outs.forEach((o) => { by[o.cat] = (by[o.cat] || 0) + 1; });
    const kinds = Object.keys(by).map(Number).sort((a, b) => b - a).map((c) => t(SHORT[c]) + ' ' + by[c]).join(' · ');
    y += 16; text(g, kinds, W / 2, y, W - 24, 11, 'rgba(245,240,227,.85)');
    // The rule of 4 (flop) / 2 (turn) against the exact odds.
    const o = oddsOf(n, q.flop);
    y += 15; text(g, t(q.flop ? 'otRule4' : 'otRule2', { n, p: o.rule, e: o.exact }), W / 2, y, W - 24, 11, '#f5d77a');
    // The outs themselves.
    const mw = l.narrow ? 16 : 20, mh = mw * 1.4, per = Math.max(6, Math.floor((W - 60) / (mw + 3)));
    const rows = Math.ceil(n / per), roomY = l.H - (y + 10);
    const scale = Math.min(1, roomY / Math.max(1, rows * (mh + 3)));
    const w = mw * scale, h = mh * scale;
    y += 10 + h / 2;
    for (let r = 0; r < rows; r++) {
      const row = q.outs.slice(r * per, (r + 1) * per);
      row.forEach((x, i) => card(g, x.c, W / 2 + (i - (row.length - 1) / 2) * (w + 3), y + r * (h + 3), w, h, false));
    }
  }

  return {
    update, draw, input, resize: renderResult,
    running: () => state === 'ask' || state === 'shown',
    destroy() { clearTimeout(timer); ace.remove(); },
  };
}

function ensureCss() {
  if (document.getElementById('pth-game-ot-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-ot-css';
  st.textContent = '#pth-game .ot-box{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 18px;border-radius:12px;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .ot-box h2{color:#f5d77a}'
    + '#pth-game.pg-light .ot-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .ot-box h2{color:#8a6510}';
  document.head.appendChild(st);
}
