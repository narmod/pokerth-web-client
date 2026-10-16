// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Call or Fold? — lesson 5 of the arcade's « Learn poker » shelf (web
// extension, narmod 2026-10-16), behind the training nickname « mascot ».
//
// The turn is dealt, you are on a draw and the Ace bets. Your chances: your
// outs (outs.mjs) out of the 46 unseen cards. The chances you need: his bet
// over the pot once you have called, B / (P + 2B). More than you need: Call;
// fewer: Fold. Spots are never close (MARGIN), half of them are calls.
// A game is HANDS hands; the score the right decisions.
// Keys: ← Fold, → Call (Space too); Space goes on. A tap does the same.
// Secret trophy « Pot Odds Pro »: TROPHY_RIGHT of HANDS.
// ═══════════════════════════════════════════════════════════════════

import { rankHand } from './poker-hand.mjs';
import { shuffled } from './deal.mjs';
import { outsOf } from './outs.mjs';
import { fmt, imageCache, rr, drawFace, aceActor } from './common.mjs';
import { felt, drawBackCard, bubble, buttons, drawFloaters, stepFloaters, keyboardFirst, fitFont } from './ui.mjs';

export const HANDS = 12, TROPHY_RIGHT = 10, MARGIN = 0.035;
/** His bets, as a part of the pot: from a small probe to an overbet. */
export const SIZES = [1 / 6, 1 / 5, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 1, 3 / 2];

/** The chances you need to call `bet` into `pot` (his bet included in neither). */
export const needed = (pot, bet) => bet / (pot + 2 * bet);

/**
 * A spot: { hand, board (4 cards), outs, pot, bet, eq, need, call } where
 * your cards make nothing yet beyond the board: a pure draw. Half the spots
 * are calls (rnd decides which one is wanted first).
 */
export function makeSpot(rnd = Math.random) {
  const wantCall = rnd() < 0.5;
  for (let tries = 0; tries < 400; tries++) {
    const d = shuffled(rnd);
    const hand = d.slice(0, 2), board = d.slice(2, 6);
    // A pure draw: your cards add nothing to the board yet (no pair of your own),
    // so the outs are the only way to win.
    if (rankHand(hand.concat(board)).cat !== rankHand(board).cat) continue;
    const outs = outsOf(hand, board);
    if (outs.length < 4 || outs.length > 20) continue;
    const eq = outs.length / 46;
    const pot = 60 + 20 * Math.floor(rnd() * 10);
    const ok = SIZES.map((f) => 5 * Math.max(1, Math.round((pot * f) / 5)))
      .filter((bet) => { const need = needed(pot, bet); return Math.abs(eq - need) >= MARGIN && (eq > need) === wantCall; });
    if (!ok.length) continue;
    const bet = ok[Math.floor(rnd() * ok.length)];
    return { hand, board, outs, pot, bet, eq, need: needed(pot, bet), call: wantCall };
  }
  return null;
}

export function create(shell) {
  const { t, esc, sound } = shell;
  const img = imageCache();
  const ace = aceActor(shell.layer);
  const btns = buttons();
  shell.touchPad(false);
  shell.hud.classList.add('on-felt');
  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('hcScore')) + '</div><div class="ar-num pd-score">0</div></div>'
    + '<div><div class="ar-lab">' + esc(t('vpHands')) + '</div><div class="ar-num pd-n">0/' + HANDS + '</div></div></div>';
  const hScore = /** @type {HTMLElement} */ (shell.hud.querySelector('.pd-score'));
  const hN = /** @type {HTMLElement} */ (shell.hud.querySelector('.pd-n'));
  ensureCss();

  let state = 'title', G = null, time = 0, timer = 0;
  function newGame() { G = { n: 0, right: 0, q: null, focus: 'call', said: false, ok: false, fx: [], yayUntil: 0, koUntil: 0 }; renderHud(); }
  function renderHud() { hScore.textContent = fmt(G.right); hN.textContent = G.n + '/' + HANDS; }
  function titlePanel() {
    const best = shell.best.get();
    shell.panel('<h2>' + esc(t('pdName')) + '</h2><p>' + esc(t('pdHint')) + '</p>'
      + (best ? '<p class="pg-dim">' + esc(t('arRecord', { n: best + '/' + HANDS })) + '</p>' : '')
      + '<p class="pg-blink">' + esc(t('arTapStart')) + '</p>');
  }
  newGame();
  titlePanel();
  try { if (navigator.webdriver) window.__pthPD = { run: () => G, state: () => state }; } catch (e) {}

  function start() { clearTimeout(timer); newGame(); shell.panel(null); ace.pose('idle'); ace.mood('mc-m-smile'); next(); }
  function next() {
    if (G.n >= HANDS) { finish(); return; }
    G.n++; G.q = makeSpot(); G.said = null; G.focus = 'call';
    state = 'ask'; sound('notifyCard'); renderHud();
  }
  function answer(call) {
    if (state !== 'ask') return;
    G.said = call ? 'call' : 'fold'; G.ok = call === G.q.call;
    if (G.ok) { G.right++; G.yayUntil = performance.now() + 700; sound(call ? 'notifyAction' : 'notifyFold'); }
    else { G.koUntil = performance.now() + 900; sound('notifyFold'); }
    state = 'shown'; renderHud();
    clearTimeout(timer); timer = setTimeout(goOn, G.ok ? 3500 : 6000);
  }
  function goOn() { if (state !== 'shown') return; clearTimeout(timer); next(); }
  function finish() {
    state = 'over';
    const score = G.right, prev = shell.best.get(), record = score > prev;
    if (record) shell.best.set(score);
    if (score >= TROPHY_RIGHT) shell.grant('potodds');
    if (record && prev) sound('notifyBigWin');
    ace.mood(score >= TROPHY_RIGHT ? 'mc-m-cool' : 'mc-m-smile'); ace.pose(score >= TROPHY_RIGHT ? 'wave' : 'idle');
    G.res = { score, record, prev };
    renderResult();
  }
  function renderResult() {
    if (state !== 'over' || !G.res) return;
    const { score, record, prev } = G.res;
    shell.panel('<div class="pd-box"><h2>' + score + '/' + HANDS + '</h2>'
      + '<p class="pg-dim">' + esc(record && prev ? t('arNewRecord') : t('arRecord', { n: Math.max(score, prev) + '/' + HANDS })) + '</p>'
      + '<p class="pg-blink">' + esc(t('gmAgain')) + '</p></div>', true);
  }

  // ── Layout (world px) ─────────────────────────────────────────────
  function L() {
    const W = shell.W, H = shell.H;
    let top = 46;
    try { top = Math.max(40, shell.hud.offsetHeight / (shell.k || 1) + 6); } catch (e) {}
    const narrow = W < 430, gap = 5;
    const btnH = 34, btnY = H - btnH / 2 - 10;
    const cw = Math.min(narrow ? 40 : 50, (W - 16 - 4 * gap) / 5), ch = cw * 1.4;
    const hcw = narrow ? 30 : 34, hch = hcw * 1.4;
    const mcw = narrow ? 42 : 50, mch = mcw * 1.4;
    const s = narrow ? 0.28 : 0.32;
    const aceFeet = top + 212 * s + 6;
    const himY = aceFeet - hch / 2 - 6;
    const meY = btnY - btnH / 2 - 14 - mch / 2;
    const boardY = (aceFeet + 10 + meY - mch / 2 - 22) / 2;
    return { W, H, narrow, top, gap, cw, ch, hcw, hch, mcw, mch, s, aceX: W / 2 - (narrow ? 40 : 56), aceFeet, himX: W / 2 + (narrow ? 26 : 36), himY, boardY, meY, btnY, btnH };
  }
  function layoutButtons(l) {
    btns.reset();
    if (state !== 'ask') return;
    const w = Math.min(160, (l.W - 30) / 2);
    btns.add({ id: 'fold', x: l.W / 2 - w / 2 - 6, y: l.btnY, w, h: l.btnH, label: 'Fold', kind: 'red', key: '←' });
    btns.add({ id: 'call', x: l.W / 2 + w / 2 + 6, y: l.btnY, w, h: l.btnH, label: 'Call ' + fmt(G.q.bet), key: '→' });
  }

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'title') { if (a === 'jump') start(); return; }
    if (state === 'over') { if (a === 'jump') { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); titlePanel(); } return; }
    if (state === 'shown') { if (a === 'jump') goOn(); return; }
    if (state !== 'ask') return;
    if (info.x != null) { layoutButtons(L()); const b = btns.hit(info.x, info.y); if (b) answer(b === 'call'); return; }
    if (a === 'left' || a === 'duck') answer(false);
    else if (a === 'right') answer(true);
    else if (a === 'jump' && !(info.code === 'ArrowUp' || info.pad === 'up')) answer(G.focus === 'call');
  }

  function update(dt) {
    time += dt;
    if (!G) return;
    stepFloaters(G.fx, dt);
    if (state === 'title' || state === 'over') return;
    const now = performance.now();
    ace.mood(now < G.koUntil ? 'mc-m-ko' : now < G.yayUntil ? 'mc-m-yay' : state === 'ask' ? 'mc-m-cool' : 'mc-m-smile');
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
  const pc = (v) => Math.round(v * 100);
  function draw(g) {
    const l = L(), W = l.W, H = l.H;
    felt(g, W, H, shell.theme.light);
    ace.place(l.aceX, l.aceFeet, l.s, shell.k);
    if ((state === 'ask' || state === 'shown') && G.q) {
      const q = G.q, shown = state === 'shown';
      for (let k = 0; k < 2; k++) drawBackCard(g, img, l.himX + (k - 0.5) * (l.hcw + 4), l.himY, l.hcw, l.hch);
      // The turn, and the river still to come.
      for (let i = 0; i < 5; i++) {
        const x = W / 2 + (i - 2) * (l.cw + l.gap);
        if (i < 4) card(g, q.board[i], x, l.boardY, l.cw, l.ch, false);
        else { rr(g, x - l.cw / 2, l.boardY - l.ch / 2, l.cw, l.ch, 4); g.strokeStyle = 'rgba(245,240,227,.3)'; g.setLineDash([3, 3]); g.lineWidth = 1.2; g.stroke(); g.setLineDash([]); g.fillStyle = 'rgba(245,240,227,.35)'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 16px Inter, system-ui, sans-serif'; g.fillText('?', x, l.boardY); }
      }
      // The pot (before his bet) and his bet.
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 13px Inconsolata, monospace'; g.fillStyle = '#f5d77a';
      g.fillText(t('hlPot') + ' ◉ ' + fmt(q.pot) + '  +  ' + fmt(q.bet), W / 2, l.boardY + l.ch / 2 + 12);
      for (let k = 0; k < 2; k++) card(g, q.hand[k], W / 2 + (k - 0.5) * (l.mcw + 5), l.meY, l.mcw, l.mch, true);
      if (shown) drawShown(g, l, q);
      layoutButtons(l);
      btns.draw(g, keyboardFirst(), keyboardFirst() && state === 'ask' ? G.focus : null);
      if (state === 'ask') bubble(g, t('blBets', { n: fmt(q.bet) }), l.himX, l.himY - l.hch / 2 - 4, W);
    }
    if (G) drawFloaters(g, G.fx);
  }
  function drawShown(g, l, q) {
    const W = l.W, n = q.outs.length, eq = pc(q.eq), need = pc(q.need);
    const y0 = l.btnY - 22;
    text(g, t('pdOdds', { n, e: eq }), W / 2, y0, W - 20, 11, 'rgba(245,240,227,.9)');
    text(g, t('pdNeed', { b: fmt(q.bet), w: fmt(q.pot + q.bet), r: need }), W / 2, y0 + 15, W - 20, 11, 'rgba(245,240,227,.9)');
    const rule = eq + ' % ' + (q.call ? '>' : '<') + ' ' + need + ' %  →  ' + (q.call ? 'Call' : 'Fold');
    text(g, (G.ok ? '✓ ' : '✗ ') + rule, W / 2, y0 + 34, W - 20, 14, G.ok ? '#7ee2a0' : '#ff8a80');
  }

  return {
    update, draw, input, resize: renderResult,
    running: () => state === 'ask' || state === 'shown',
    destroy() { clearTimeout(timer); ace.remove(); },
  };
}

function ensureCss() {
  if (document.getElementById('pth-game-pd-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-pd-css';
  st.textContent = '#pth-game .pd-box{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 18px;border-radius:12px;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .pd-box h2{color:#f5d77a}'
    + '#pth-game.pg-light .pd-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .pd-box h2{color:#8a6510}';
  document.head.appendChild(st);
}
