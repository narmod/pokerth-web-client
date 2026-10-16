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
// Secret trophy « Who Wins? »: TROPHY_RIGHT right answers in one game.
// ═══════════════════════════════════════════════════════════════════

import { rankHand, compareHands, NAME_KEYS } from './poker-hand.mjs';
import { shuffled } from './deal.mjs';
import { fmt, imageCache, rr, drawFace, aceActor } from './common.mjs';
import { felt, buttons, bubble, drawFloaters, stepFloaters, keyboardFirst, fitFont } from './ui.mjs';

export const LIVES = 3, TIME_MAX = 9, TIME_MIN = 3.5, TROPHY_RIGHT = 20;

/**
 * A showdown for `level` (0, 1, 2…): { board, a, b, ra, rb, win } — win 1
 * (left), -1 (right) or 0 (split). rnd: the random source (tests seed it).
 */
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
    + '<div><div class="ar-lab">&nbsp;</div><div class="ar-num ww-lives"></div></div></div>'
    + '<div class="ar-hand"><div class="ar-name ww-streak"></div></div>';
  const hScore = /** @type {HTMLElement} */ (shell.hud.querySelector('.ww-score'));
  const hLives = /** @type {HTMLElement} */ (shell.hud.querySelector('.ww-lives'));
  const hStreak = /** @type {HTMLElement} */ (shell.hud.querySelector('.ww-streak'));
  ensureCss();

  let state = 'title', G = null, time = 0, timer = 0;
  function newGame() {
    G = { score: 0, lives: LIVES, right: 0, streak: 0, bestStreak: 0, q: null, tMax: TIME_MAX, tLeft: TIME_MAX, answer: null, ok: false,
      fx: [], say: null, yayUntil: 0, koUntil: 0, shown: 0 };
    renderHud();
  }
  function renderHud() {
    hScore.textContent = fmt(G.score);
    hLives.textContent = '❤'.repeat(Math.max(0, G.lives)) + '♡'.repeat(Math.max(0, LIVES - G.lives));
    hStreak.textContent = G.streak >= 2 ? '×' + G.streak : '';
  }
  const say = (s, life = 1.8) => { G.say = { s, t: 0, life }; };

  function titlePanel() {
    const best = shell.best.get();
    shell.panel('<h2>' + esc(t('wwName')) + '</h2><p>' + esc(t('wwHint')) + '</p>'
      + (best ? '<p class="pg-dim">' + esc(t('arRecord', { n: fmt(best) })) + '</p>' : '')
      + '<p class="pg-blink">' + esc(t('arTapStart')) + '</p>');
  }
  newGame();
  titlePanel();
  try { if (navigator.webdriver) window.__pthWW = { run: () => G, state: () => state }; } catch (e) {}

  function start() {
    clearTimeout(timer);
    newGame();
    state = 'ask'; shell.panel(null);
    ace.pose('idle'); ace.mood('mc-m-smile');
    next();
  }
  function next() {
    G.q = makeDeal(Math.floor(G.right / 5));
    G.tMax = Math.max(TIME_MIN, TIME_MAX - 0.3 * G.right);
    G.tLeft = G.tMax; G.answer = null; G.shown = time;
    state = 'ask';
    sound('notifyCard');
  }
  function answer(pick) {
    if (state !== 'ask') return;
    const q = G.q;
    G.answer = pick;
    G.ok = pick === q.win;
    state = 'shown';
    if (G.ok) {
      G.right++; G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak);
      const pts = 10 + 2 * Math.ceil(G.tLeft) + (G.streak >= 3 ? 5 : 0);
      G.score += pts;
      G.fx.push({ s: '+' + pts, x: shell.W / 2, y: L().boardY - L().ch / 2 - 16, t: 0, life: 1.1, gold: true });
      G.yayUntil = performance.now() + 700;
      sound(G.streak >= 3 ? 'notifyRaise' : 'notifyAction');
      if (G.right === TROPHY_RIGHT) shell.grant('whowins');
    } else {
      G.lives--; G.streak = 0;
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
    if (G.lives <= 0) finish(); else next();
  }
  function finish() {
    state = 'over';
    const score = G.score, prev = shell.best.get(), record = score > prev;
    if (record) shell.best.set(score);
    if (record && prev) sound('notifyBigWin');
    ace.mood('mc-m-smile'); ace.pose('idle');
    G.res = { score, record, prev };
    renderResult();
  }
  function renderResult() {
    if (state !== 'over' || !G.res) return;
    const { score, record, prev } = G.res;
    shell.panel('<div class="ww-box"><h2>' + esc(fmt(score)) + '</h2>'
      + '<p class="ar-final">✓ ' + fmt(G.right) + ' · <em>×' + fmt(G.bestStreak) + '</em></p>'
      + '<p class="pg-dim">' + esc(record && prev ? t('arNewRecord') : t('arRecord', { n: fmt(Math.max(score, prev)) })) + '</p>'
      + '<p class="pg-blink">' + esc(t('gmAgain')) + '</p></div>', true);
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
      const total = ch + 34 + hch + 24, room = btnY - btnH / 2 - 16 - (top + 18);
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
    if (Math.abs(y - l.handY) > l.hch / 2 + 16) return 0;
    if (Math.abs(x - l.ax) <= l.hcw + l.gap + 10) return 1;
    if (Math.abs(x - l.bx) <= l.hcw + l.gap + 10) return -1;
    return 0;
  }
  function layoutButtons(l) {
    btns.reset();
    if (state === 'ask') btns.add({ id: 'split', x: l.W / 2, y: l.btnY, w: Math.min(180, l.W - 120), h: l.btnH, label: t('wwSplit'), kind: 'ghost', key: '↓' });
  }

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'title') { if (a === 'jump') start(); return; }
    if (state === 'over') { if (a === 'jump') { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); titlePanel(); } return; }
    if (state === 'shown') { if (a === 'jump' && time - G.shownAt > 0.4) goOn(); return; }
    const l = L();
    layoutButtons(l);
    if (info.x != null) {
      if (btns.hit(info.x, info.y) === 'split') { answer(0); return; }
      const h = handAt(l, info.x, info.y);
      if (h) answer(h);
      return;
    }
    if (a === 'left') answer(1);
    else if (a === 'right') answer(-1);
    else if (a === 'duck') answer(0);
  }

  function update(dt) {
    time += dt;
    if (!G) return;
    stepFloaters(G.fx, dt);
    if (G.say) { G.say.t += dt; if (G.say.t > G.say.life) G.say = null; }
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
  function card(g, n, x, y, w, h, lit, dim) {
    g.save(); g.translate(x, y); drawFace(g, img, n, w, h);
    if (lit) { rr(g, -w / 2 - 2.5, -h / 2 - 2.5, w + 5, h + 5, 5); g.strokeStyle = '#f5d77a'; g.lineWidth = 2; g.stroke(); }
    if (dim) { rr(g, -w / 2, -h / 2, w, h, Math.max(2, w * 0.1)); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill(); }
    g.restore();
  }
  function draw(g) {
    const l = L(), W = l.W, H = l.H;
    felt(g, W, H, shell.theme.light);
    if (state !== 'title' && G.q) {
      const q = G.q, shown = state === 'shown' || state === 'over';
      // Winning five: the winner's (both on a split).
      const lit = shown ? new Set(q.win >= 0 ? q.ra.best : []) : new Set();
      if (shown && q.win <= 0) q.rb.best.forEach((c) => lit.add(c));
      // The clock.
      const bw = Math.min(W - 24, 320), frac = Math.max(0, G.tLeft / G.tMax);
      rr(g, W / 2 - bw / 2, l.barY, bw, 6, 3); g.fillStyle = 'rgba(0,0,0,.3)'; g.fill();
      if (frac > 0) { rr(g, W / 2 - bw / 2, l.barY, bw * frac, 6, 3); g.fillStyle = frac > 0.5 ? '#3fae6a' : frac > 0.25 ? '#e0a33a' : '#d2453b'; g.fill(); }
      // The board.
      for (let i = 0; i < 5; i++) {
        const x = W / 2 + (i - 2) * (l.cw + l.gap);
        card(g, q.board[i], x, l.boardY, l.cw, l.ch, shown && lit.has(q.board[i]), shown && !lit.has(q.board[i]));
      }
      // The two hands, their names once answered.
      [[q.a, q.ra, l.ax, 1], [q.b, q.rb, l.bx, -1]].forEach(([hand, r, cx, side]) => {
        const xs = handXs(l, cx);
        const won = shown && (q.win === side || q.win === 0);
        rr(g, cx - l.hcw - l.gap - 6, l.handY - l.hch / 2 - 8, 2 * l.hcw + 2 * l.gap + 12, l.hch + 16, 10);
        g.fillStyle = shown ? (won ? 'rgba(216,178,90,.28)' : 'rgba(0,0,0,.22)') : 'rgba(0,0,0,.18)'; g.fill();
        if (shown && G.answer === side) { g.strokeStyle = G.ok ? '#3fae6a' : '#d2453b'; g.lineWidth = 2.5; g.stroke(); }
        for (let k = 0; k < 2; k++) card(g, hand[k], xs[k], l.handY, l.hcw, l.hch, shown && lit.has(hand[k]), shown && !lit.has(hand[k]));
        if (shown) {
          const label = t(NAME_KEYS[r.cat]);
          g.fillStyle = won ? '#f5d77a' : 'rgba(245,240,227,.75)'; g.textAlign = 'center'; g.textBaseline = 'top';
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
    // The Ace, a corner of the felt.
    const ax = l.narrow ? 24 : W - 28, ay = H - 4, s = l.narrow ? 0.2 : 0.26;
    ace.place(ax, ay, s, shell.k);
    if (G && G.say && state !== 'title') {
      const a = G.say.t < 0.2 ? G.say.t / 0.2 : G.say.t > G.say.life - 0.4 ? Math.max(0, (G.say.life - G.say.t) / 0.4) : 1;
      bubble(g, G.say.s, Math.min(ax + 6, W - 20), ay - 212 * s - 2, W, a);
    }
    if (G) drawFloaters(g, G.fx);
  }

  return {
    update, draw, input, resize: renderResult,
    running: () => state === 'ask' || state === 'shown',
    destroy() { clearTimeout(timer); ace.remove(); },
  };
}

function ensureCss() {
  if (document.getElementById('pth-game-ww-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-ww-css';
  st.textContent = '#pth-game .ww-box{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 18px;border-radius:12px;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .ww-box h2{color:#f5d77a}#pth-game .ww-lives{color:#ff8a80;letter-spacing:2px}'
    + '#pth-game.pg-light .ww-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .ww-box h2{color:#8a6510}#pth-game.pg-light .ww-box .ar-final{color:#1d222b}';
  document.head.appendChild(st);
}
