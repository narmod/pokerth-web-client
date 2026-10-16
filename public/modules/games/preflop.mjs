// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Open or Fold? — lesson 1 of the arcade's « Learn poker » shelf (web
// extension, narmod 2026-10-16), behind the training nickname « mascot ».
//
// A full table (9 seats), everyone has folded to you: open with a raise or
// fold, from your position and your two cards, against a classic prudent
// opening chart (preflop-chart.mjs). The seats that already folded are grey,
// the players still to speak after you stay lit — the fewer behind you, the
// wider you open. After each answer the chart of the position is shown (gold
// = open) with your hand marked; a game is HANDS hands, the score the right
// answers; at the end, the grid of every hand you were dealt, green when you
// were right, red when not.
// Half of the hands come from the edge of the range (the close calls).
// Keys: ← Fold, → Raise; Space goes on. A tap does the same.
// Secret trophy « Open or Fold? »: TROPHY_RIGHT right answers of HANDS.
// ═══════════════════════════════════════════════════════════════════

import { POSITIONS, opens, classOf, cellOf, cellClass, edgeClasses, cardsOf } from './preflop-chart.mjs';
import { shuffled } from './deal.mjs';
import { fmt, imageCache, rr, drawFace, aceActor } from './common.mjs';
import { felt, buttons, drawFloaters, stepFloaters, keyboardFirst, fitFont } from './ui.mjs';

export const HANDS = 20, TROPHY_RIGHT = 18;
// The 9 seats clockwise from the button, the order they act preflop.
const SEATS = ['UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

export function create(shell) {
  const { t, esc, sound } = shell;
  const img = imageCache();
  const ace = aceActor(shell.layer);
  const btns = buttons();
  shell.touchPad(false);
  shell.hud.classList.add('on-felt');
  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('hcScore')) + '</div><div class="ar-num pp-score">0</div></div>'
    + '<div><div class="ar-lab">' + esc(t('vpHands')) + '</div><div class="ar-num pp-h">0/' + HANDS + '</div></div></div>'
    + '<div class="ar-hand"><div class="ar-name pp-pos"></div></div>';
  const hScore = /** @type {HTMLElement} */ (shell.hud.querySelector('.pp-score'));
  const hH = /** @type {HTMLElement} */ (shell.hud.querySelector('.pp-h'));
  const hPos = /** @type {HTMLElement} */ (shell.hud.querySelector('.pp-pos'));
  ensureCss();

  let state = 'title', G = null, time = 0, timer = 0;
  function newGame() {
    G = { n: 0, right: 0, pos: 'UTG', cards: [0, 1], cls: 'AA', answer: null, ok: false, log: [], fx: [], yayUntil: 0, koUntil: 0 };
    renderHud();
  }
  function renderHud() {
    hScore.textContent = fmt(G.right);
    hH.textContent = G.n + '/' + HANDS;
    hPos.textContent = state === 'title' ? '' : G.pos;
  }
  function titlePanel() {
    const best = shell.best.get();
    shell.panel('<h2>' + esc(t('ppName')) + '</h2><p>' + esc(t('ppHint')) + '</p>'
      + (best ? '<p class="pg-dim">' + esc(t('arRecord', { n: best + '/' + HANDS })) + '</p>' : '')
      + '<p class="pg-blink">' + esc(t('arTapStart')) + '</p>');
  }
  newGame();
  titlePanel();
  try { if (navigator.webdriver) window.__pthPP = { run: () => G, state: () => state }; } catch (e) {}

  function start() {
    clearTimeout(timer);
    newGame();
    shell.panel(null);
    ace.pose('idle'); ace.mood('mc-m-smile');
    next();
  }
  function next() {
    if (G.n >= HANDS) { finish(); return; }
    G.n++;
    G.pos = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
    if (Math.random() < 0.5) {
      const edge = edgeClasses(G.pos);
      G.cls = edge[Math.floor(Math.random() * edge.length)];
      G.cards = cardsOf(G.cls);
    } else {
      const d = shuffled();
      G.cards = [d[0], d[1]];
      G.cls = classOf(d[0], d[1]);
    }
    G.answer = null;
    state = 'ask';
    sound('notifyCard');
    renderHud();
  }
  function answer(raise) {
    if (state !== 'ask') return;
    const should = opens(G.pos, G.cls);
    G.answer = raise; G.ok = raise === should;
    G.log.push({ cls: G.cls, ok: G.ok });
    if (G.ok) { G.right++; G.yayUntil = performance.now() + 700; sound('notifyAction'); }
    else { G.koUntil = performance.now() + 900; sound('notifyFold'); }
    const l0 = L();
    G.fx.push({ s: G.ok ? '✓' : '✗', x: l0.narrow ? l0.W / 2 : l0.cardsX, y: l0.narrow ? l0.btnY - l0.btnH / 2 - 14 : l0.cardsY - l0.ch / 2 - 14, t: 0, life: 0.9, gold: G.ok, red: !G.ok, big: true });
    state = 'shown';
    renderHud();
    clearTimeout(timer);
    timer = setTimeout(goOn, G.ok ? 1800 : 3200);
  }
  function goOn() { if (state !== 'shown') return; clearTimeout(timer); next(); }
  function finish() {
    state = 'over';
    const score = G.right, prev = shell.best.get(), record = score > prev;
    if (record) shell.best.set(score);
    if (score >= TROPHY_RIGHT) shell.grant('preflop');
    if (record && prev) sound('notifyBigWin');
    ace.mood(score >= TROPHY_RIGHT ? 'mc-m-cool' : 'mc-m-smile'); ace.pose(score >= TROPHY_RIGHT ? 'wave' : 'idle');
    G.res = { score, record, prev };
    renderResult();
  }
  function renderResult() {
    if (state !== 'over' || !G.res) return;
    const { score, record, prev } = G.res;
    shell.panel('<div class="pp-box"><h2>' + score + '/' + HANDS + '</h2>'
      + '<p class="pg-dim">' + esc(record && prev ? t('arNewRecord') : t('arRecord', { n: Math.max(score, prev) + '/' + HANDS })) + '</p>'
      + '<p class="pg-blink">' + esc(t('gmAgain')) + '</p></div>', true);
  }

  // ── Layout (world px) ─────────────────────────────────────────────
  function L() {
    const W = shell.W, H = shell.H;
    let top = 46;
    try { top = Math.max(40, shell.hud.offsetHeight / (shell.k || 1) + 6); } catch (e) {}
    const narrow = W < 430;
    const btnH = 36, btnY = H - btnH / 2 - 10;
    const cw = narrow ? 58 : 64, ch = cw * 1.4;
    if (narrow) {
      const tableY = top + 58, tw = Math.min(W - 30, 190), th = 82;
      const cardsY = Math.min(btnY - btnH / 2 - 22 - ch / 2, tableY + th / 2 + 34 + ch / 2);
      return { W, H, narrow, top, btnY, btnH, cw, ch, tableX: W / 2, tableY, tw, th, cardsX: W / 2, cardsY };
    }
    const tw = Math.min(260, W * 0.4), th = 120;
    const tableY = (top + btnY - btnH / 2) / 2;
    return { W, H, narrow, top, btnY, btnH, cw, ch, tableX: W * 0.3, tableY, tw, th, cardsX: W * 0.72, cardsY: tableY };
  }
  function layoutButtons(l) {
    btns.reset();
    // On a narrow stage the Ace stands at the bottom left: the buttons make room.
    const x0 = l.narrow ? 40 : 0, cx = (x0 + l.W) / 2, w = Math.min(160, (l.W - x0 - 30) / 2);
    if (state === 'ask' || state === 'shown') {
      btns.add({ id: 'fold', x: cx - w / 2 - 6, y: l.btnY, w, h: l.btnH, label: 'Fold', kind: 'red', key: '←', off: state !== 'ask' });
      btns.add({ id: 'raise', x: cx + w / 2 + 6, y: l.btnY, w, h: l.btnH, label: 'Raise', key: '→', off: state !== 'ask' });
    }
  }

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'title') { if (a === 'jump') start(); return; }
    if (state === 'over') { if (a === 'jump') { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); titlePanel(); renderHud(); } return; }
    if (state === 'shown') { if (a === 'jump') goOn(); return; }
    if (state !== 'ask') return;
    const l = L();
    layoutButtons(l);
    if (info.x != null) { const b = btns.hit(info.x, info.y); if (b) answer(b === 'raise'); return; }
    if (a === 'left') answer(false);
    else if (a === 'right') answer(true);
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
  function drawTable(g, l) {
    // The felt oval, the 9 seats, the dealer button.
    g.save();
    g.beginPath(); g.ellipse(l.tableX, l.tableY, l.tw / 2, l.th / 2, 0, 0, Math.PI * 2);
    g.fillStyle = 'rgba(8,40,26,.55)'; g.fill(); g.strokeStyle = 'rgba(216,178,90,.6)'; g.lineWidth = 2; g.stroke();
    const me = SEATS.indexOf(G.pos);
    SEATS.forEach((p, k) => {
      // Clockwise, the button at the bottom right.
      const a = Math.PI / 2 + ((k - 6) * 2 * Math.PI) / SEATS.length + 0.35;
      const x = l.tableX + Math.cos(a) * (l.tw / 2 + 2), y = l.tableY + Math.sin(a) * (l.th / 2 + 2);
      const folded = k < me, mine = k === me;
      const r = l.narrow ? 11 : 14;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
      g.fillStyle = mine ? '#d8b25a' : folded ? 'rgba(60,70,66,.85)' : '#f5f0e3'; g.fill();
      g.strokeStyle = mine ? '#8a6510' : 'rgba(0,0,0,.4)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = mine ? '#141414' : folded ? 'rgba(245,240,227,.55)' : '#141414';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      fitFont(g, p, 2 * r - 3, l.narrow ? 7 : 8.5, 700);
      g.fillText(p, x, y);
      if (p === 'BTN') {
        const dx = l.tableX + Math.cos(a) * (l.tw / 2 - 16), dy = l.tableY + Math.sin(a) * (l.th / 2 - 12);
        g.beginPath(); g.arc(dx, dy, 6, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = '#141414'; g.stroke();
        g.fillStyle = '#141414'; g.font = '700 7px Inter, system-ui, sans-serif'; g.fillText('D', dx, dy + 0.5);
      }
    });
    // In the middle: how many still to speak after you.
    g.fillStyle = 'rgba(245,240,227,.85)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const msg = t('ppFolded');
    fitFont(g, msg, l.tw - 30, l.narrow ? 10 : 12, 600);
    g.fillText(msg, l.tableX, l.tableY - 6);
    g.font = '700 ' + (l.narrow ? 11 : 13) + 'px Inconsolata, monospace'; g.fillStyle = '#f5d77a';
    g.fillText(G.pos + ' · ' + (SEATS.length - 1 - me) + ' ⟳', l.tableX, l.tableY + 10);
    g.restore();
  }
  /** The 13 × 13 chart of `pos` (gold = open), or the game's log when pos is null. */
  function drawGrid(g, x0, y0, cs, pos, mark) {
    for (let i = 0; i < 13; i++) for (let j = 0; j < 13; j++) {
      const cls = cellClass(i, j), x = x0 + j * cs, y = y0 + i * cs;
      let fill;
      if (pos) fill = opens(pos, cls) ? '#d8b25a' : 'rgba(0,0,0,.28)';
      else {
        const e = G.log.filter((q) => q.cls === cls);
        fill = !e.length ? 'rgba(0,0,0,.22)' : e.some((q) => !q.ok) ? '#d2453b' : '#3fae6a';
      }
      g.fillStyle = fill; g.fillRect(x + 0.5, y + 0.5, cs - 1, cs - 1);
      if (cs >= 14) {
        g.fillStyle = pos && opens(pos, cls) ? '#141414' : 'rgba(245,240,227,.6)';
        g.font = '600 ' + Math.floor(cs * 0.36) + 'px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(cls.slice(0, 2) + (i === j ? '' : cls[2]), x + cs / 2, y + cs / 2 + 0.5);
      }
    }
    if (mark) {
      const [i, j] = cellOf(mark);
      g.strokeStyle = G.ok ? '#7ee2a0' : '#ff8a80'; g.lineWidth = 2.5; g.strokeRect(x0 + j * cs - 1, y0 + i * cs - 1, cs + 2, cs + 2);
    }
  }
  function draw(g) {
    const l = L(), W = l.W, H = l.H;
    felt(g, W, H, shell.theme.light);
    if (state === 'ask' || state === 'shown') {
      if (state === 'shown') {
        // The chart of the position, your hand marked.
        const room = l.btnY - l.btnH / 2 - 26 - (l.top + 8);
        const cs = Math.floor(Math.min((l.narrow ? W - 16 : W * 0.5) / 13, room / 13));
        const x0 = l.narrow ? (W - 13 * cs) / 2 : l.tableX - (13 * cs) / 2, y0 = l.top + 8;
        drawGrid(g, x0, y0, cs, G.pos, G.cls);
        g.fillStyle = '#f5d77a'; g.textAlign = 'center'; g.textBaseline = 'top';
        const cap = t('ppRange', { p: G.pos });
        fitFont(g, cap, 13 * cs, 11, 700); g.fillText(cap, x0 + (13 * cs) / 2, y0 + 13 * cs + 4);
        if (!l.narrow) for (let k = 0; k < 2; k++) { g.save(); g.translate(l.cardsX + (k - 0.5) * (l.cw + 8), l.cardsY); drawFace(g, img, G.cards[k], l.cw, l.ch); g.restore(); }
        if (!l.narrow) {
          g.fillStyle = G.ok ? '#7ee2a0' : '#ff8a80'; g.font = '700 16px Inter, system-ui, sans-serif'; g.textAlign = 'center';
          g.fillText((opens(G.pos, G.cls) ? 'Raise' : 'Fold') + ' · ' + G.cls, l.cardsX, l.cardsY + l.ch / 2 + 22);
        }
      } else {
        drawTable(g, l);
        for (let k = 0; k < 2; k++) { g.save(); g.translate(l.cardsX + (k - 0.5) * (l.cw + 8), l.cardsY); drawFace(g, img, G.cards[k], l.cw, l.ch); g.restore(); }
      }
      layoutButtons(l);
      btns.draw(g, keyboardFirst(), null);
    } else if (state === 'over' && G.log.length) {
      const cs = Math.floor(Math.min((W - 16) / 13, (H - l.top - 120) / 13, 22));
      drawGrid(g, (W - 13 * cs) / 2, l.top + 6, cs, null, null);
    }
    ace.place(l.narrow ? 22 : W - 28, H - 4, l.narrow ? 0.18 : 0.26, shell.k);
    if (G) drawFloaters(g, G.fx);
  }

  return {
    update, draw, input, resize: renderResult,
    running: () => state === 'ask' || state === 'shown',
    destroy() { clearTimeout(timer); ace.remove(); },
  };
}

function ensureCss() {
  if (document.getElementById('pth-game-pp-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-pp-css';
  st.textContent = '#pth-game .pp-box{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 18px;border-radius:12px;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .pp-box h2{color:#f5d77a}'
    + '#pth-game.pg-light .pp-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .pp-box h2{color:#8a6510}';
  document.head.appendChild(st);
}
