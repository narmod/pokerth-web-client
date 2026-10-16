// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Poker Solitaire (Poker Squares) — hidden mini-game (web extension, narmod
// 2026-10-16), in the arcade menu behind the training nickname « mascot ».
//
// 25 cards come one at a time; each goes into an empty cell of a 5 × 5 grid
// and stays there. Every row and every column is then a poker hand
// (poker-hand.mjs): ten hands, scored on the American scale (SCORE). A
// calm game of thinking ahead: keep a column for the flush, a row for the
// full house.
//   Daily challenge  the same 25 cards for every player on a given (UTC) day,
//                    seeded from the date — no server; the day's best is kept
//   Free game        a fresh shuffle each time
//   Draws            the Ace says « Flush draw… » / « Straight draw… » when a
//                    line is one card away, and cheers the hands as they come
//   Showdown         at the end the ten lines are counted one by one
// Cursor: arrows / D-pad, Space / A places; a tap places in the tapped cell.
// Secret trophy « Poker Solitaire » at TROPHY_SCORE points.
// ═══════════════════════════════════════════════════════════════════

import { evalCards, rankOf, suitOf } from './poker-hand.mjs';
import { SCORE, N, LINES, dayKey, dealFor } from './solitaire-rules.mjs';
import { fmt, cardHtml, imageCache, rr, drawFace, aceActor } from './common.mjs';

// Short hand names of the odds panel (the full ones are h1n…h10n).
const SHORT = ['oddsHigh', 'oddsPair', 'oddsTwoPair', 'oddsTrips', 'oddsStraight', 'oddsFlush', 'oddsFull', 'oddsQuads', 'oddsSF', 'oddsRoyal'];
const CW = 36, CH = 50, GAP = 5;
const TROPHY_SCORE = 75;
const S = 0.36;

// One card away from a flush / a straight (four cards placed, the fifth cell empty)?
function drawOf(cards) {
  const got = cards.filter((c) => c != null);
  if (got.length !== 4) return '';
  if (got.every((c) => suitOf(c) === suitOf(got[0]))) return 'flush';
  const r = got.map(rankOf), set = new Set(r);
  if (set.size === 4) {
    const tries = [r, r.map((x) => (x === 14 ? 1 : x))];
    for (const rs of tries) { const lo = Math.min(...rs), hi = Math.max(...rs); if (hi - lo <= 4) return 'straight'; }
  }
  return '';
}

export function create(shell) {
  const { t, esc, sound } = shell;
  const img = imageCache();
  const ace = aceActor(shell.layer);
  shell.touchPad(false);
  if (!document.getElementById('pth-game-ps-css')) {
    const st = document.createElement('style'); st.id = 'pth-game-ps-css';
    st.textContent = '#pth-game .ps-box{position:absolute;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:6px;'
      + 'padding:12px 16px;border-radius:12px;background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
      + '#pth-game .ps-box .ar-show{flex-wrap:nowrap}';
    document.head.appendChild(st);
  }
  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('hcScore')) + '</div><div class="ar-num ps-score">0</div></div>'
    + '<div><div class="ar-lab">' + esc(t('psCards')) + '</div><div class="ar-num ps-left">0/25</div></div></div>'
    + '<div class="ar-hand"><div class="ar-name ps-mode"></div></div>';
  const hScore = /** @type {HTMLElement} */ (shell.hud.querySelector('.ps-score'));
  const hLeft = /** @type {HTMLElement} */ (shell.hud.querySelector('.ps-left'));
  const hMode = /** @type {HTMLElement} */ (shell.hud.querySelector('.ps-mode'));

  const dailyKey = 'pth_game_daily_solitaire';
  const dailyBest = (day) => { try { const v = JSON.parse(localStorage.getItem(dailyKey) || 'null'); return v && v.d === day ? v.s : 0; } catch (e) { return 0; } };
  const setDailyBest = (day, s) => { try { localStorage.setItem(dailyKey, JSON.stringify({ d: day, s })); } catch (e) {} };

  let state = 'title', mode = 0, G = null, timer = 0, time = 0;
  function newGame(daily) {
    const day = dayKey();
    const cards = daily ? dealFor('pth-solitaire-' + day) : dealFor('free-' + Math.random() + '-' + Date.now());
    G = { daily, day, cards, i: 0, grid: new Array(N * N).fill(null), cursor: 12, score: 0, lineDone: new Array(10).fill(false),
      lineCat: new Array(10).fill(-1), fly: null, fx: [], say: null, yayUntil: 0, coolUntil: 0, tally: -1, hot: -1 };
    renderHud();
  }
  function renderHud() {
    hScore.textContent = fmt(G.score);
    hLeft.textContent = Math.min(G.i, 25) + '/25';
    hMode.textContent = G.daily ? t('psDaily') + ' · ' + G.day : t('psFree');
  }

  // ── Title: daily challenge or free game ───────────────────────────
  function titlePanel() {
    const day = dayKey(), db = dailyBest(day), fb = shell.best.get();
    const tile = (i, icon, name, sub) => '<button type="button" class="gm-tile' + (i === mode ? ' on' : '') + '" data-i="' + i + '"><i>' + icon + '</i><b>'
      + esc(name) + '</b><small>' + sub + '</small></button>';
    const table = [9, 8, 7, 6, 5, 4, 3, 2, 1].map((c) => esc(t(SHORT[c])) + ' ' + SCORE[c]).join(' · ');
    shell.panel('<h2>' + esc(t('psName')) + '</h2><p>' + esc(t('psHint')) + '</p><div class="gm-tiles">'
      + tile(0, '📅', t('psDaily'), esc(day) + (db ? ' · ' + esc(fmt(db)) : ''))
      + tile(1, '🃏', t('psFree'), fb ? esc(t('arRecord', { n: fmt(fb) })) : '&nbsp;')
      + '</div><p class="pg-dim">' + table + '</p>');
    shell.root.querySelectorAll('.pg-panel .gm-tile').forEach((b) => {
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', () => { mode = +(b.getAttribute('data-i') || 0); start(); });
    });
  }
  newGame(true);
  titlePanel();
  ace.pose('idle');

  function start() {
    clearTimeout(timer);
    newGame(mode === 0);
    state = 'run'; shell.panel(null);
    ace.pose('idle'); ace.mood('mc-m-smile'); ace.king(false);
    G.cursor = nextFree(12);
  }
  function nextFree(from) {
    for (let k = 0; k < N * N; k++) { const c = (from + k) % (N * N); if (G.grid[c] == null) return c; }
    return from;
  }

  // ── Layout (world px) ─────────────────────────────────────────────
  const gw = N * CW + (N - 1) * GAP, gh = N * CH + (N - 1) * GAP;
  function layout() {
    const W = shell.W, H = shell.H;
    const top = Math.max(62, (H - gh - 16) / 2 + 8);
    const left = Math.max(14, W / 2 - 250);
    const right = left + gw + 60;                 // after the row results
    return { top, left, labX: left + gw + 6, panelX: right + Math.max(40, (W - right) / 2), H, W };
  }
  const cellXY = (L, i) => ({ x: L.left + (i % N) * (CW + GAP) + CW / 2, y: L.top + Math.floor(i / N) * (CH + GAP) + CH / 2 });
  function cellAt(L, x, y) {
    for (let i = 0; i < N * N; i++) { const c = cellXY(L, i); if (Math.abs(x - c.x) <= CW / 2 + GAP / 2 && Math.abs(y - c.y) <= CH / 2 + GAP / 2) return i; }
    return -1;
  }

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'title') {
      if (a === 'left' || a === 'right') { mode = mode ? 0 : 1; titlePanel(); }
      else if (a === 'jump' && info.x == null) start();
      return;
    }
    if (state === 'over') {
      if (a === 'jump' && performance.now() > G.overAt + 900) { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); titlePanel(); }
      return;
    }
    if (state !== 'run' || G.fly) return;
    const up = a === 'jump' && (info.code === 'ArrowUp' || info.code === 'KeyW' || info.pad === 'up');
    if (a === 'left') G.cursor = G.cursor % N ? G.cursor - 1 : G.cursor + N - 1;
    else if (a === 'right') G.cursor = G.cursor % N < N - 1 ? G.cursor + 1 : G.cursor - N + 1;
    else if (up) G.cursor = (G.cursor + N * N - N) % (N * N);
    else if (a === 'duck') G.cursor = (G.cursor + N) % (N * N);
    else if (a === 'jump') {
      if (info.x != null) {
        const c = cellAt(layout(), info.x, info.y);
        if (c < 0) return;
        G.cursor = c;
      }
      place(G.cursor);
    }
  }

  function place(cell) {
    if (G.grid[cell] != null || G.i >= 25) { sound('notifyFold'); return; }
    const L = layout(), from = { x: L.panelX, y: L.top + 40 }, to = cellXY(L, cell);
    G.fly = { n: G.cards[G.i], cell, from, to, t: 0 };
    G.i++;
    sound('notifyCard');
  }
  function landed(f) {
    G.grid[f.cell] = f.n;
    // Lines this card completes, and draws it opens.
    const prevCat = G.lineCat.slice();
    let best = -1, drawMsg = '';
    LINES.forEach((ln, li) => {
      if (ln.indexOf(f.cell) < 0) return;
      const cards = ln.map((i) => G.grid[i]);
      const ev = evalCards(cards.filter((c) => c != null));
      G.lineCat[li] = ev.cat;
      if (cards.every((c) => c != null) && !G.lineDone[li]) {
        G.lineDone[li] = true;
        const pts = SCORE[ev.cat];
        G.score += pts;
        const c = cellXY(L0(), ln[2]);
        G.fx.push({ s: (pts ? '+' + pts + ' ' : '') + t(SHORT[ev.cat]), x: li < 5 ? layout().labX + 26 : c.x, y: li < 5 ? c.y : layout().top + gh + 10, t: 0, life: 1.3, gold: pts > 0 });
        if (ev.cat > best) best = ev.cat;
      } else if (!drawMsg) {
        const d = drawOf(cards);
        if (d === 'flush') drawMsg = t('psFlushDraw'); else if (d === 'straight') drawMsg = t('psStraightDraw');
      }
      if (ev.cat >= 2 && ev.cat > prevCat[li]) best = Math.max(best, ev.cat);
    });
    if (best >= 5) { G.coolUntil = performance.now() + 1500; sound('notifyRaise'); }
    else if (best >= 2) { G.yayUntil = performance.now() + 600; sound('notifyRaise'); }
    if (drawMsg) G.say = { s: drawMsg, t: 0 };
    else if (best >= 2) G.say = { s: t(evalNameKey(best)), t: 0 };
    renderHud();
    if (G.i >= 25) finish();
    else G.cursor = nextFree(f.cell);
  }
  const L0 = () => layout();
  const evalNameKey = (cat) => ['h10n', 'h9n', 'h8n', 'h7n', 'h6n', 'h5n', 'h4n', 'h3n', 'h2n', 'h1n'][cat];

  function finish() {
    state = 'tally'; G.tally = 0;
    // Count the ten lines one by one, then the result.
    const step = () => {
      if (state !== 'tally') return;
      if (G.tally >= 10) { G.hot = -1; result(); return; }
      G.hot = G.tally;
      const cat = G.lineCat[G.tally];
      sound(cat >= 4 ? 'notifyRaise' : 'notifyCard');
      G.tally++;
      timer = setTimeout(step, 330);
    };
    timer = setTimeout(step, 400);
  }
  function result() {
    state = 'over'; G.overAt = performance.now();
    const score = G.score;
    if (score >= TROPHY_SCORE) shell.grant('solitaire');
    let record = false, prev;
    if (G.daily) { prev = dailyBest(G.day); if (score > prev) { setDailyBest(G.day, score); record = prev > 0; } }
    else { prev = shell.best.get(); if (score > prev) { shell.best.set(score); record = prev > 0; } }
    // The best line of the grid, its five cards.
    let bl = 0;
    for (let i = 1; i < 10; i++) if (G.lineCat[i] > G.lineCat[bl]) bl = i;
    const cards = LINES[bl].map((i) => G.grid[i]);
    const ev = evalCards(cards);
    ace.mood(score >= TROPHY_SCORE ? 'mc-m-cool' : score >= 40 ? 'mc-m-yay' : 'mc-m-smile');
    ace.pose(score >= TROPHY_SCORE ? 'wave' : 'idle');
    if (record) sound('notifyBigWin'); else if (score >= TROPHY_SCORE) sound('notifyWinner', true);
    // The result in a box over the right side (the grid stays readable); centred on a narrow stage.
    const L = layout(), side = L.W >= 600;
    const pos = side ? 'left:' + Math.round(L.panelX * shell.k) + 'px' : 'left:50%';
    shell.panel('<div class="ps-box" style="' + pos + '"><h2>' + esc(fmt(score)) + '</h2>'
      + '<p>' + esc(t('psBestLine', { h: t(ev.nameKey) })) + '</p>'
      + '<div class="ar-show">' + ev.best.map((c) => cardHtml(c, 'lg')).join('') + '</div>'
      + '<p class="pg-dim">' + esc(G.daily ? t('psDaily') + ' · ' + G.day : t('psFree')) + ' · '
      + esc(record ? t('arNewRecord') : t('arRecord', { n: fmt(Math.max(score, prev || 0)) })) + '</p>'
      + '<p class="pg-blink">' + esc(t('psAgain')) + '</p></div>', true);
  }

  function update(dt) {
    time += dt;
    if (!G) return;
    if (G.fly) { G.fly.t += dt / 0.2; if (G.fly.t >= 1) { const f = G.fly; G.fly = null; landed(f); } }
    for (let i = G.fx.length - 1; i >= 0; i--) { G.fx[i].t += dt; if (G.fx[i].t > G.fx[i].life) G.fx.splice(i, 1); }
    if (G.say) { G.say.t += dt; if (G.say.t > 2.6) G.say = null; }
    if (state === 'run' || state === 'tally') {
      const now = performance.now();
      ace.mood(now < G.coolUntil ? 'mc-m-cool' : now < G.yayUntil ? 'mc-m-yay' : 'mc-m-smile');
      ace.pose(now < G.yayUntil ? 'wave' : 'idle');
    }
  }

  // ── Drawing ───────────────────────────────────────────────────────
  function draw(g) {
    const L = layout(), W = L.W, H = L.H;
    const bg = g.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.75);
    bg.addColorStop(0, '#24774e'); bg.addColorStop(1, '#0f3a26');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    // The grid: empty cells, cards, the cursor.
    for (let i = 0; i < N * N; i++) {
      const c = cellXY(L, i), n = G.grid[i];
      if (n == null) {
        rr(g, c.x - CW / 2, c.y - CH / 2, CW, CH, 4);
        g.fillStyle = 'rgba(0,0,0,.18)'; g.fill();
        g.strokeStyle = 'rgba(245,240,227,.16)'; g.lineWidth = 1; g.stroke();
      } else { g.save(); g.translate(c.x, c.y); drawFace(g, img, n, CW, CH); g.restore(); }
    }
    // The line being counted at the end.
    if (G.hot >= 0) {
      const ln = LINES[G.hot], a = cellXY(L, ln[0]), b = cellXY(L, ln[4]);
      rr(g, Math.min(a.x, b.x) - CW / 2 - 3, Math.min(a.y, b.y) - CH / 2 - 3, Math.abs(b.x - a.x) + CW + 6, Math.abs(b.y - a.y) + CH + 6, 6);
      g.strokeStyle = '#d8b25a'; g.lineWidth = 2.5; g.stroke();
    }
    // Row results (right) and column results (below), once a line is full.
    g.textBaseline = 'middle';
    for (let li = 0; li < 10; li++) {
      if (!G.lineDone[li]) continue;
      const cat = G.lineCat[li], pts = SCORE[cat];
      const anchor = cellXY(L, LINES[li][4]);
      g.fillStyle = pts ? '#d8b25a' : 'rgba(245,240,227,.45)';
      if (li < 5) { g.textAlign = 'left'; g.font = '600 9px Inter, system-ui, sans-serif'; g.fillText(t(SHORT[cat]), L.labX, anchor.y - 6); g.font = '700 11px Inconsolata, monospace'; g.fillText(String(pts), L.labX, anchor.y + 7); }
      else { g.textAlign = 'center'; g.font = '700 11px Inconsolata, monospace'; g.fillText(String(pts), anchor.x, L.top + gh + 9); }
    }
    if (state === 'run' && G.cursor >= 0) {
      const c = cellXY(L, G.cursor), free = G.grid[G.cursor] == null;
      rr(g, c.x - CW / 2 - 2.5, c.y - CH / 2 - 2.5, CW + 5, CH + 5, 5);
      g.strokeStyle = free ? '#d8b25a' : 'rgba(210,69,59,.8)'; g.lineWidth = 2; g.stroke();
      if (free && !G.fly && G.i < 25) {
        g.save(); g.globalAlpha = 0.35 + 0.15 * Math.sin(time * 5); g.translate(c.x, c.y); drawFace(g, img, G.cards[G.i], CW, CH); g.restore();
      }
    }
    // The card to place, big, and the pile.
    const px = L.panelX, py = L.top + 40;
    if (G.i < 25 && state !== 'title') {
      for (let k = Math.min(3, 24 - G.i); k > 0; k--) { rr(g, px - 27 + k * 1.5, py - 38 - k * 1.5, 54, 76, 5); g.fillStyle = '#b3261e'; g.fill(); g.strokeStyle = '#141414'; g.lineWidth = 1; g.stroke(); }
      if (!G.fly) { g.save(); g.translate(px, py); drawFace(g, img, G.cards[G.i], 54, 76); g.restore(); }
    }
    if (G.fly) {
      const f = G.fly, k = 1 - Math.pow(1 - Math.min(1, f.t), 3);
      const x = f.from.x + (f.to.x - f.from.x) * k, y = f.from.y + (f.to.y - f.from.y) * k;
      const w = 54 + (CW - 54) * k, h = 76 + (CH - 76) * k;
      g.save(); g.translate(x, y); drawFace(g, img, f.n, w, h); g.restore();
    }
    // The Ace, under the pile, and what he says.
    const ax = px, ay = Math.min(H - 10, py + 38 + 108);
    ace.place(ax, ay, S, shell.k);
    if (G.say && state !== 'title') {
      const a = G.say.t < 0.2 ? G.say.t / 0.2 : G.say.t > 2.2 ? Math.max(0, 1 - (G.say.t - 2.2) / 0.4) : 1;
      g.save(); g.globalAlpha = a;
      g.font = '600 11px Inter, system-ui, sans-serif';
      const tw = Math.min(150, g.measureText(G.say.s).width + 16), bx = Math.min(W - tw - 6, ax - tw / 2), by = ay - 92;
      rr(g, bx, by - 13, tw, 26, 9); g.fillStyle = '#f5f0e3'; g.fill();
      g.beginPath(); g.moveTo(ax - 5, by + 13); g.lineTo(ax + 4, by + 13); g.lineTo(ax, by + 20); g.closePath(); g.fill();
      g.fillStyle = '#141414'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(G.say.s, bx + tw / 2, by, tw - 10);
      g.restore();
    }
    for (const p of G.fx) {
      const a = 1 - p.t / p.life;
      g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.font = p.gold ? '700 12px Cinzel, Georgia, serif' : '600 11px Inter, system-ui, sans-serif';
      g.fillStyle = p.gold ? '#f5d77a' : 'rgba(245,240,227,.7)';
      g.fillText(p.s, p.x, p.y - p.t * 22); g.globalAlpha = 1;
    }
  }

  return {
    update, draw, input,
    running: () => state === 'run' || state === 'tally',
    destroy() { clearTimeout(timer); ace.remove(); },
  };
}
