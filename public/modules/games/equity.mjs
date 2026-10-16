// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Who's Ahead? — lesson 6 of the arcade's « Learn poker » shelf (web
// extension, narmod 2026-10-16), behind the training nickname « mascot ».
//
// Two hands all-in before the flop, yours and the Ace's: how often do you
// win? Set your guess on a 0–100 % bar; the answer is played out RUNS times
// (Monte Carlo, a split counts half). The closer, the more points: 3 within
// 5 points, 2 within 10, 1 within 15. Matchups are drawn from the classic
// kinds (KINDS): a pair against a lower pair, a race, a pair against one
// overcard, two overcards, a dominated hand, anything.
// A game is ROUNDS rounds; the score the points.
// Keys: ←/→ ± STEP, Space confirms; Space goes on. A tap sets the bar.
// Secret trophy « Equity Sense »: TROPHY_POINTS of 3 × ROUNDS.
// ═══════════════════════════════════════════════════════════════════

import { rankHand, compareHands, rankOf } from './poker-hand.mjs';
import { shuffled } from './deal.mjs';
import { classOf } from './preflop-chart.mjs';
import { fmt, imageCache, rr, drawFace, aceActor } from './common.mjs';
import { felt, buttons, drawFloaters, stepFloaters, keyboardFirst, fitFont } from './ui.mjs';

export const ROUNDS = 10, TROPHY_POINTS = 24, RUNS = 4000, STEP = 5;
export const KINDS = ['pairs', 'race', 'oneover', 'under', 'dominated', 'overs', 'any'];

/** The share of the pot `a` wins against `b` all-in before the flop (0..1, a split counts half). */
export function equity(a, b, runs = RUNS, rnd = Math.random) {
  const used = new Set(a.concat(b)), rest = [];
  for (let c = 0; c < 52; c++) if (!used.has(c)) rest.push(c);
  let won = 0;
  for (let i = 0; i < runs; i++) {
    // Five cards out of the 48 left: a partial shuffle.
    for (let k = 0; k < 5; k++) { const j = k + Math.floor(rnd() * (rest.length - k)); const x = rest[k]; rest[k] = rest[j]; rest[j] = x; }
    const board = rest.slice(0, 5);
    const c = compareHands(rankHand(a.concat(board)), rankHand(b.concat(board)));
    won += c > 0 ? 1 : c === 0 ? 0.5 : 0;
  }
  return won / runs;
}

/** The classic kind of a matchup (one of KINDS), seen from either side. */
export function kindOf(a, b) {
  const ra = a.map(rankOf).sort((x, y) => y - x), rb = b.map(rankOf).sort((x, y) => y - x);
  const pa = ra[0] === ra[1], pb = rb[0] === rb[1];
  if (pa && pb) return 'pairs';
  if (pa || pb) {
    const p = pa ? ra[0] : rb[0], o = pa ? rb : ra;
    if (o[1] > p) return 'race';
    if (o[0] > p) return 'oneover';
    return 'under';
  }
  if (ra.some((r) => rb.indexOf(r) >= 0)) return 'dominated';
  if (ra[1] > rb[0] || rb[1] > ra[0]) return 'overs';
  return 'any';
}

/** Points for a guess (in %) against the truth (in %). */
export const pointsFor = (guess, truth) => { const d = Math.abs(guess - truth); return d <= 5 ? 3 : d <= 10 ? 2 : d <= 15 ? 1 : 0; };

/** A matchup of a given kind: { me, him, kind, eq (0..1, yours) }. */
export function makeMatchup(rnd = Math.random, runs = RUNS) {
  const want = KINDS[Math.floor(rnd() * KINDS.length)];
  for (let tries = 0; tries < 3000; tries++) {
    const d = shuffled(rnd);
    const me = d.slice(0, 2), him = d.slice(2, 4);
    if (kindOf(me, him) !== want && tries < 2999) continue;
    return { me, him, kind: kindOf(me, him), eq: equity(me, him, runs, rnd) };
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
  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('hcScore')) + '</div><div class="ar-num eq-score">0</div></div>'
    + '<div><div class="ar-lab">' + esc(t('vpHands')) + '</div><div class="ar-num eq-n">0/' + ROUNDS + '</div></div></div>';
  const hScore = /** @type {HTMLElement} */ (shell.hud.querySelector('.eq-score'));
  const hN = /** @type {HTMLElement} */ (shell.hud.querySelector('.eq-n'));
  ensureCss();
  const MAX = 3 * ROUNDS;

  let state = 'title', G = null, time = 0, timer = 0;
  function newGame() { G = { n: 0, points: 0, q: null, guess: 50, pts: 0, fx: [], yayUntil: 0, koUntil: 0 }; renderHud(); }
  function renderHud() { hScore.textContent = fmt(G.points); hN.textContent = G.n + '/' + ROUNDS; }
  function titlePanel() {
    const best = shell.best.get();
    shell.panel('<h2>' + esc(t('eqName')) + '</h2><p>' + esc(t('eqHint')) + '</p>'
      + (best ? '<p class="pg-dim">' + esc(t('arRecord', { n: best + '/' + MAX })) + '</p>' : '')
      + '<p class="pg-blink">' + esc(t('arTapStart')) + '</p>');
  }
  newGame();
  titlePanel();
  try { if (navigator.webdriver) window.__pthEQ = { run: () => G, state: () => state }; } catch (e) {}

  function start() { clearTimeout(timer); newGame(); shell.panel(null); ace.pose('idle'); ace.mood('mc-m-smile'); next(); }
  function next() {
    if (G.n >= ROUNDS) { finish(); return; }
    G.n++; G.q = makeMatchup(); G.guess = 50;
    state = 'ask'; sound('notifyCard'); renderHud();
  }
  function confirm() {
    if (state !== 'ask') return;
    const truth = Math.round(G.q.eq * 100);
    G.pts = pointsFor(G.guess, truth); G.points += G.pts;
    const l = L();
    G.fx.push({ s: '+' + G.pts, x: barX(l, truth), y: l.barY - 44, t: 0, life: 1.2, big: true, gold: G.pts > 0, red: !G.pts });
    if (G.pts >= 2) { G.yayUntil = performance.now() + 700; sound('notifyRaise'); }
    else if (!G.pts) { G.koUntil = performance.now() + 900; sound('notifyFold'); }
    else sound('notifyAction');
    state = 'shown'; renderHud();
    clearTimeout(timer); timer = setTimeout(goOn, 4500);
  }
  function goOn() { if (state !== 'shown') return; clearTimeout(timer); next(); }
  function finish() {
    state = 'over';
    const score = G.points, prev = shell.best.get(), record = score > prev;
    if (record) shell.best.set(score);
    if (score >= TROPHY_POINTS) shell.grant('equity');
    if (record && prev) sound('notifyBigWin');
    ace.mood(score >= TROPHY_POINTS ? 'mc-m-cool' : 'mc-m-smile'); ace.pose(score >= TROPHY_POINTS ? 'wave' : 'idle');
    G.res = { score, record, prev };
    renderResult();
  }
  function renderResult() {
    if (state !== 'over' || !G.res) return;
    const { score, record, prev } = G.res;
    shell.panel('<div class="eq-box"><h2>' + score + '/' + MAX + '</h2>'
      + '<p class="pg-dim">' + esc(record && prev ? t('arNewRecord') : t('arRecord', { n: Math.max(score, prev) + '/' + MAX })) + '</p>'
      + '<p class="pg-blink">' + esc(t('gmAgain')) + '</p></div>', true);
  }

  // ── Layout (world px) ─────────────────────────────────────────────
  function L() {
    const W = shell.W, H = shell.H;
    let top = 46;
    try { top = Math.max(40, shell.hud.offsetHeight / (shell.k || 1) + 6); } catch (e) {}
    const narrow = W < 430;
    const hcw = narrow ? 34 : 40, hch = hcw * 1.4;
    const mcw = narrow ? 42 : 50, mch = mcw * 1.4;
    const s = narrow ? 0.26 : 0.3;
    const aceFeet = top + 212 * s + 4;
    const himY = aceFeet - hch / 2 - 4;
    const btnH = 32, btnY = H - btnH / 2 - 10;
    const barW = Math.min(440, W - 48), barY = btnY - btnH / 2 - 30;
    const meY = (aceFeet + barY - 34) / 2 + 4;
    return { W, H, narrow, top, hcw, hch, mcw, mch, s, aceX: W / 2 - (narrow ? 44 : 60), aceFeet, himX: W / 2 + (narrow ? 22 : 30), himY, meY, barW, barX0: (W - barW) / 2, barY, btnY, btnH };
  }
  const barX = (l, pct) => l.barX0 + (l.barW * pct) / 100;
  function layoutButtons(l) {
    btns.reset();
    if (state !== 'ask') return;
    btns.add({ id: 'ok', x: l.W / 2, y: l.btnY, w: Math.min(150, l.W - 40), h: l.btnH, label: t('confirmCall'), key: 'Space' });
  }

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'title') { if (a === 'jump') start(); return; }
    if (state === 'over') { if (a === 'jump') { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); titlePanel(); } return; }
    if (state === 'shown') { if (a === 'jump') goOn(); return; }
    if (state !== 'ask') return;
    const l = L();
    if (info.x != null) {
      layoutButtons(l);
      if (btns.hit(info.x, info.y) === 'ok') { confirm(); return; }
      if (Math.abs(info.y - l.barY) <= 22 && info.x >= l.barX0 - 14 && info.x <= l.barX0 + l.barW + 14) {
        const pct = ((info.x - l.barX0) / l.barW) * 100;
        G.guess = Math.max(0, Math.min(100, Math.round(pct / STEP) * STEP));
        sound('notifyCard');
      }
      return;
    }
    if (a === 'left' || a === 'duck') G.guess = Math.max(0, G.guess - STEP);
    else if (a === 'right') G.guess = Math.min(100, G.guess + STEP);
    else if (a === 'jump' && !(info.code === 'ArrowUp' || info.pad === 'up')) confirm();
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
  function card(g, n, x, y, w, h) { g.save(); g.translate(x, y); drawFace(g, img, n, w, h); g.restore(); }
  function text(g, s, x, y, maxW, size, color, align = 'center') {
    g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle';
    fitFont(g, s, maxW, size, 700); g.fillText(s, x, y);
  }
  function marker(g, x, y, color, label, up) {
    g.fillStyle = color;
    g.beginPath();
    if (up) { g.moveTo(x, y + 8); g.lineTo(x - 6, y + 17); g.lineTo(x + 6, y + 17); }
    else { g.moveTo(x, y - 8); g.lineTo(x - 6, y - 17); g.lineTo(x + 6, y - 17); }
    g.closePath(); g.fill();
    text(g, label, x, up ? y + 27 : y - 26, 60, 12, color);
  }
  function draw(g) {
    const l = L(), W = l.W;
    felt(g, W, l.H, shell.theme.light);
    ace.place(l.aceX, l.aceFeet, l.s, shell.k);
    if ((state === 'ask' || state === 'shown') && G.q) {
      const q = G.q, shown = state === 'shown', truth = Math.round(q.eq * 100);
      for (let k = 0; k < 2; k++) card(g, q.him[k], l.himX + (k - 0.5) * (l.hcw + 4), l.himY, l.hcw, l.hch);
      text(g, classOf(q.him[0], q.him[1]), l.himX + l.hcw + 10, l.himY, 60, 12, 'rgba(245,240,227,.8)', 'left');
      for (let k = 0; k < 2; k++) card(g, q.me[k], W / 2 + (k - 0.5) * (l.mcw + 5), l.meY, l.mcw, l.mch);
      text(g, classOf(q.me[0], q.me[1]), W / 2 + l.mcw + 14, l.meY, 60, 13, '#f5d77a', 'left');
      // The bar: your share on the left (gold), the Ace's on the right.
      const gx = barX(l, G.guess);
      rr(g, l.barX0, l.barY - 5, l.barW, 10, 5); g.fillStyle = 'rgba(0,0,0,.3)'; g.fill();
      rr(g, l.barX0, l.barY - 5, Math.max(10, gx - l.barX0), 10, 5); g.fillStyle = '#d8b25a'; g.fill();
      for (let p = 0; p <= 100; p += 25) {
        const x = barX(l, p);
        g.fillStyle = 'rgba(245,240,227,.45)'; g.fillRect(x - 0.5, l.barY + 7, 1, 4);
        if (!shown) text(g, p + '', x, l.barY + 17, 30, 9, 'rgba(245,240,227,.55)');
      }
      marker(g, gx, l.barY, shown ? 'rgba(245,240,227,.85)' : '#f5f0e3', G.guess + ' %', false);
      if (shown) {
        marker(g, barX(l, truth), l.barY, '#7ee2a0', truth + ' %', true);
        text(g, t('eqTruth', { a: truth, b: 100 - truth }), W / 2, l.btnY + 4, W - 20, 12, G.pts ? '#f5d77a' : '#ff8a80');
      }
      layoutButtons(l);
      btns.draw(g, keyboardFirst(), null);
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
  if (document.getElementById('pth-game-eq-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-eq-css';
  st.textContent = '#pth-game .eq-box{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 18px;border-radius:12px;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .eq-box h2{color:#f5d77a}'
    + '#pth-game.pg-light .eq-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .eq-box h2{color:#8a6510}';
  document.head.appendChild(st);
}
