// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Find the Nuts — lesson 2 of the arcade's « Learn poker » shelf (web
// extension, narmod 2026-10-16), behind the training nickname « mascot ».
//
// A board of five cards and four pairs of hole cards: pick the pair that
// makes the nuts, the best hand possible on that board. Every one of the
// 1,081 pairs left is ranked (poker-hand.mjs); the choices are the nuts and
// three strong hands that fall short (the next best ones, then one further
// down). Boards lean towards the telling ones: three of a suit, a pair, close
// ranks. After the answer every pair shows its hand and the nuts are lit.
// A game is BOARDS boards; the score the nuts found.
// Keys: ←/→ choose, Space confirms; Space goes on. A tap does the same.
// Secret trophy « Nut Hunter »: TROPHY_RIGHT of BOARDS.
// ═══════════════════════════════════════════════════════════════════

import { rankHand, compareHands, NAME_KEYS, rankOf, suitOf } from './poker-hand.mjs';
import { shuffled } from './deal.mjs';
import { fmt, imageCache, rr, drawFace, aceActor } from './common.mjs';
import { felt, drawFloaters, stepFloaters, keyboardFirst, fitFont } from './ui.mjs';

export const BOARDS = 15, TROPHY_RIGHT = 13;

/** Does a board say much (three of a suit, a pair, three ranks within five)? */
export function telling(board) {
  const suits = [0, 0, 0, 0]; board.forEach((c) => suits[suitOf(c)]++);
  if (Math.max(...suits) >= 3) return true;
  const r = board.map(rankOf);
  if (new Set(r).size < 5) return true;
  const u = [...new Set(r.concat(r.indexOf(14) >= 0 ? [1] : []))].sort((a, b) => a - b);
  for (let i = 0; i + 2 < u.length; i++) if (u[i + 2] - u[i] <= 4) return true;
  return false;
}

/**
 * A question: { board, options: [[c1, c2] × 4], answer (index), ranks } —
 * the nuts at a random place among three strong but beaten pairs.
 */
export function makeQuestion(rnd = Math.random) {
  for (let tries = 0; tries < 50; tries++) {
    const d = shuffled(rnd);
    const board = d.slice(0, 5);
    if (!telling(board) && rnd() < 0.6) continue;
    const rest = d.slice(5);
    const all = [];
    for (let i = 0; i < rest.length; i++) for (let j = i + 1; j < rest.length; j++) {
      const pair = [rest[i], rest[j]];
      all.push({ pair, r: rankHand(pair.concat(board)) });
    }
    all.sort((a, b) => compareHands(b.r, a.r));
    // The board alone being the nuts makes no question.
    if (compareHands(all[0].r, rankHand(board)) === 0) continue;
    // Paired boards make four of a kind the nuts again and again: keep a few.
    if (all[0].r.cat === 7 && rnd() < 0.65) continue;
    // Groups of equal strength, best first.
    const groups = [];
    for (const x of all) {
      const g = groups[groups.length - 1];
      if (g && compareHands(g[0].r, x.r) === 0) g.push(x); else groups.push([x]);
      if (groups.length > 60) break;
    }
    if (groups.length < 5) continue;
    // Four pairs that share no card: a card is never shown twice.
    const used = new Set();
    const pick = (g) => {
      const free = g.filter((x) => !used.has(x.pair[0]) && !used.has(x.pair[1]));
      const x = free.length ? free[Math.floor(rnd() * free.length)] : null;
      if (x) x.pair.forEach((c) => used.add(c));
      return x;
    };
    // The nuts: prefer a pair where both cards play.
    const nutsBoth = groups[0].filter((x) => x.pair.every((c) => x.r.best.indexOf(c) >= 0));
    const nuts = pick(nutsBoth.length ? nutsBoth : groups[0]);
    // Two close runners-up (the next groups with free cards), then one further down.
    const wrong = [];
    let gi = 1;
    while (wrong.length < 2 && gi < groups.length) { const x = pick(groups[gi++]); if (x) wrong.push(x); }
    const further = [];
    for (let k = gi + 1; k < groups.length && further.length < 4; k++) {
      if (groups[k].some((x) => !used.has(x.pair[0]) && !used.has(x.pair[1]))) further.push(groups[k]);
    }
    if (further.length) wrong.push(pick(further[Math.floor(rnd() * further.length)]));
    if (wrong.length < 3) continue;
    const options = wrong.slice();
    const answer = Math.floor(rnd() * 4);
    options.splice(answer, 0, nuts);
    return { board, options: options.map((o) => o.pair), ranks: options.map((o) => o.r), answer };
  }
  return null;
}

const RANK_CH = { 14: 'A', 13: 'K', 12: 'Q', 11: 'J' };
/** The ranks of the five cards that play, sets first then high first ("Q Q Q 7 7", "A K 8 7 3"; a wheel reads "5 4 3 2 A"). */
export function fiveRanks(r) {
  const v = r.best.map(rankOf), n = (x) => v.filter((y) => y === x).length;
  v.sort((a, b) => n(b) - n(a) || b - a);
  if ((r.cat === 4 || r.cat === 8) && v[0] === 14 && v[1] === 5) v.push(v.shift());
  return v.map((x) => RANK_CH[x] || String(x)).join(' ');
}

export function create(shell) {
  const { t, esc, sound } = shell;
  const img = imageCache();
  const ace = aceActor(shell.layer);
  shell.touchPad(false);
  shell.hud.classList.add('on-felt');
  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('hcScore')) + '</div><div class="ar-num nt-score">0</div></div>'
    + '<div><div class="ar-lab">' + esc(t('psCards')) + '</div><div class="ar-num nt-n">0/' + BOARDS + '</div></div></div>';
  const hScore = /** @type {HTMLElement} */ (shell.hud.querySelector('.nt-score'));
  const hN = /** @type {HTMLElement} */ (shell.hud.querySelector('.nt-n'));
  ensureCss();

  let state = 'title', G = null, time = 0, timer = 0;
  function newGame() { G = { n: 0, right: 0, q: null, sel: 0, pick: -1, ok: false, fx: [], yayUntil: 0, koUntil: 0 }; renderHud(); }
  function renderHud() { hScore.textContent = fmt(G.right); hN.textContent = G.n + '/' + BOARDS; }
  function titlePanel() {
    const best = shell.best.get();
    shell.panel('<h2>' + esc(t('ntName')) + '</h2><p>' + esc(t('ntHint')) + '</p>'
      + (best ? '<p class="pg-dim">' + esc(t('arRecord', { n: best + '/' + BOARDS })) + '</p>' : '')
      + '<p class="pg-blink">' + esc(t('arTapStart')) + '</p>');
  }
  newGame();
  titlePanel();
  try { if (navigator.webdriver) window.__pthNT = { run: () => G, state: () => state }; } catch (e) {}

  function start() { clearTimeout(timer); newGame(); shell.panel(null); ace.pose('idle'); ace.mood('mc-m-smile'); next(); }
  function next() {
    if (G.n >= BOARDS) { finish(); return; }
    G.n++; G.q = makeQuestion(); G.sel = 0; G.pick = -1;
    state = 'ask'; sound('notifyCard'); renderHud();
  }
  function choose(i) {
    if (state !== 'ask') return;
    G.pick = i; G.ok = i === G.q.answer;
    if (G.ok) { G.right++; G.yayUntil = performance.now() + 700; sound('notifyRaise'); }
    else { G.koUntil = performance.now() + 900; sound('notifyFold'); }
    state = 'shown'; renderHud();
    clearTimeout(timer); timer = setTimeout(goOn, G.ok ? 2200 : 3800);
  }
  function goOn() { if (state !== 'shown') return; clearTimeout(timer); next(); }
  function finish() {
    state = 'over';
    const score = G.right, prev = shell.best.get(), record = score > prev;
    if (record) shell.best.set(score);
    if (score >= TROPHY_RIGHT) shell.grant('nuts');
    if (record && prev) sound('notifyBigWin');
    ace.mood(score >= TROPHY_RIGHT ? 'mc-m-cool' : 'mc-m-smile'); ace.pose(score >= TROPHY_RIGHT ? 'wave' : 'idle');
    G.res = { score, record, prev };
    renderResult();
  }
  function renderResult() {
    if (state !== 'over' || !G.res) return;
    const { score, record, prev } = G.res;
    shell.panel('<div class="nt-box"><h2>' + score + '/' + BOARDS + '</h2>'
      + '<p class="pg-dim">' + esc(record && prev ? t('arNewRecord') : t('arRecord', { n: Math.max(score, prev) + '/' + BOARDS })) + '</p>'
      + '<p class="pg-blink">' + esc(t('gmAgain')) + '</p></div>', true);
  }

  // ── Layout (world px) ─────────────────────────────────────────────
  function L() {
    const W = shell.W, H = shell.H;
    let top = 46;
    try { top = Math.max(40, shell.hud.offsetHeight / (shell.k || 1) + 6); } catch (e) {}
    const narrow = W < 470, gap = 5;
    const cw = Math.min(narrow ? 40 : 54, (W - 16 - 4 * gap) / 5), ch = cw * 1.4;
    const boardY = top + 16 + ch / 2;
    const cols = narrow ? 2 : 4, rows = narrow ? 2 : 1;
    const ow = narrow ? (W - 24) / 2 : Math.min(140, (W - 40) / 4), oh = narrow ? 92 : 100;
    const ocw = Math.min(36, (ow - 16) / 2), och = ocw * 1.4;
    const gridTop = boardY + ch / 2 + 26;
    const opt = [0, 1, 2, 3].map((i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const x = W / 2 + (c - (cols - 1) / 2) * (ow + 8), y = gridTop + oh / 2 + r * (oh + 8);
      return { x, y };
    });
    return { W, H, narrow, top, gap, cw, ch, boardY, ow, oh, ocw, och, opt, rows };
  }
  function optionAt(l, x, y) {
    for (let i = 0; i < 4; i++) if (Math.abs(x - l.opt[i].x) <= l.ow / 2 && Math.abs(y - l.opt[i].y) <= l.oh / 2) return i;
    return -1;
  }

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'title') { if (a === 'jump') start(); return; }
    if (state === 'over') { if (a === 'jump') { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); titlePanel(); } return; }
    if (state === 'shown') { if (a === 'jump') goOn(); return; }
    if (state !== 'ask') return;
    if (info.x != null) { const i = optionAt(L(), info.x, info.y); if (i >= 0) choose(i); return; }
    const up = a === 'jump' && (info.code === 'ArrowUp' || info.pad === 'up');
    if (a === 'left') G.sel = (G.sel + 3) % 4;
    else if (a === 'right') G.sel = (G.sel + 1) % 4;
    else if (a === 'duck') G.sel = (G.sel + 2) % 4;
    else if (up) G.sel = (G.sel + 2) % 4;
    else if (a === 'jump') choose(G.sel);
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
  function card(g, n, x, y, w, h, lit, dim) {
    g.save(); g.translate(x, y); drawFace(g, img, n, w, h);
    if (lit) { rr(g, -w / 2 - 2.5, -h / 2 - 2.5, w + 5, h + 5, 5); g.strokeStyle = '#f5d77a'; g.lineWidth = 2; g.stroke(); }
    if (dim) { rr(g, -w / 2, -h / 2, w, h, Math.max(2, w * 0.1)); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill(); }
    g.restore();
  }
  function draw(g) {
    const l = L(), W = l.W, H = l.H;
    felt(g, W, H, shell.theme.light);
    if ((state === 'ask' || state === 'shown') && G.q) {
      const q = G.q, shown = state === 'shown';
      const nutsBest = new Set(q.ranks[q.answer].best);
      for (let i = 0; i < 5; i++) card(g, q.board[i], W / 2 + (i - 2) * (l.cw + l.gap), l.boardY, l.cw, l.ch, shown && nutsBest.has(q.board[i]), shown && !nutsBest.has(q.board[i]));
      q.options.forEach((pair, i) => {
        const o = l.opt[i], isAns = i === q.answer;
        rr(g, o.x - l.ow / 2, o.y - l.oh / 2, l.ow, l.oh, 10);
        g.fillStyle = shown && isAns ? 'rgba(63,174,106,.35)' : 'rgba(0,0,0,.2)'; g.fill();
        const ring = shown ? (isAns ? '#7ee2a0' : i === G.pick ? '#ff8a80' : null) : (keyboardFirst() && i === G.sel ? '#f5f0e3' : null);
        if (ring) { g.strokeStyle = ring; g.lineWidth = 2.5; g.stroke(); }
        g.fillStyle = 'rgba(245,240,227,.7)'; g.font = '700 10px Inter, system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'top';
        g.fillText('ABCD'[i], o.x - l.ow / 2 + 7, o.y - l.oh / 2 + 6);
        const cy = o.y - (shown ? 8 : 2);
        for (let k = 0; k < 2; k++) card(g, pair[k], o.x + (k - 0.5) * (l.ocw + 5), cy, l.ocw, l.och, shown && isAns, false);
        if (shown) {
          // Same kind of hand twice: the five cards that play tell them apart.
          const twin = q.ranks.some((r, k) => k !== i && r.cat === q.ranks[i].cat);
          const label = t(NAME_KEYS[q.ranks[i].cat]) + (twin ? ' · ' + fiveRanks(q.ranks[i]) : '');
          g.fillStyle = isAns ? '#f5d77a' : 'rgba(245,240,227,.8)'; g.textAlign = 'center'; g.textBaseline = 'middle';
          fitFont(g, label, l.ow - 10, 11, 700); g.fillText(label, o.x, o.y + l.oh / 2 - 11);
        }
      });
      if (shown) {
        const line = t('ntIs', { h: t(NAME_KEYS[q.ranks[q.answer].cat]) });
        const y = l.opt[3].y + l.oh / 2 + 18;
        g.fillStyle = G.ok ? '#7ee2a0' : '#ff8a80'; g.textAlign = 'center'; g.textBaseline = 'middle';
        fitFont(g, (G.ok ? '✓ ' : '✗ ') + line, W - 60, 13, 700); g.fillText((G.ok ? '✓ ' : '✗ ') + line, W / 2, Math.min(H - 14, y));
      }
    }
    ace.place(l.narrow ? 20 : W - 28, H - 4, l.narrow ? 0.17 : 0.26, shell.k);
    if (G) drawFloaters(g, G.fx);
  }

  return {
    update, draw, input, resize: renderResult,
    running: () => state === 'ask' || state === 'shown',
    destroy() { clearTimeout(timer); ace.remove(); },
  };
}

function ensureCss() {
  if (document.getElementById('pth-game-nt-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-nt-css';
  st.textContent = '#pth-game .nt-box{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 18px;border-radius:12px;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .nt-box h2{color:#f5d77a}'
    + '#pth-game.pg-light .nt-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .nt-box h2{color:#8a6510}';
  document.head.appendChild(st);
}
