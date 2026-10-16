// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Higher or Lower — hidden mini-game (web extension, narmod 2026-10-16), in
// the arcade behind the training nickname « mascot ».
//
// Will the next card of the shoe be higher or lower than the one face up?
// Aces high, 2s low, the same rank is a push. A right guess grows the pot by
// the odds of that guess (mult(), from the cards still in the shoe, with a
// small house edge): a safe guess pays little, a long shot a lot. Cash out
// to bank the pot (the score) and start again from POT0; a wrong guess loses
// the pot and a heart — LIVES hearts.
//   Shoe     one deck, reshuffled when fewer than RESHUFFLE cards are left;
//            the cards already out are shown — counting them helps
// Keys: ↑ higher, ↓ lower, Space cash out; ←/→ move between the buttons
// (Enter or pad A presses the one lit). A tap on a button does the same.
// Secret trophy « Higher or Lower »: TROPHY_STREAK right guesses in one pot.
// ═══════════════════════════════════════════════════════════════════

import { rankOf } from './poker-hand.mjs';
import { shuffled } from './deal.mjs';
import { fmt, imageCache, rr, drawFace, aceActor } from './common.mjs';
import { felt, drawBackCard, buttons, bubble, drawFloaters, stepFloaters, keyboardFirst, fitFont } from './ui.mjs';

export const POT0 = 10, LIVES = 3, RESHUFFLE = 8, TROPHY_STREAK = 10, EDGE = 0.95;

/** Cards of `shoe` higher, lower and equal in rank to card `n`. */
export function odds(n, shoe) {
  const r = rankOf(n);
  let hi = 0, lo = 0, eq = 0;
  for (const c of shoe) { const x = rankOf(c); if (x > r) hi++; else if (x < r) lo++; else eq++; }
  return { hi, lo, eq, n: shoe.length };
}
/** What a right guess multiplies the pot by: the fair odds (pushes aside) less the edge, by steps of 0.05, at least 1.05. */
export function mult(win, lose) {
  if (win <= 0) return 0;
  return Math.max(1.05, Math.round(((win + lose) / win) * EDGE * 20) / 20);
}

export function create(shell) {
  const { t, esc, sound } = shell;
  const img = imageCache();
  const ace = aceActor(shell.layer);
  const btns = buttons();
  shell.touchPad(false);
  shell.hud.classList.add('on-felt');
  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('hcScore')) + '</div><div class="ar-num hl-score">0</div></div>'
    + '<div><div class="ar-lab">&nbsp;</div><div class="ar-num hl-lives"></div></div></div>'
    + '<div class="ar-hand"><div class="ar-name hl-shoe"></div></div>';
  const hScore = /** @type {HTMLElement} */ (shell.hud.querySelector('.hl-score'));
  const hLives = /** @type {HTMLElement} */ (shell.hud.querySelector('.hl-lives'));
  const hShoe = /** @type {HTMLElement} */ (shell.hud.querySelector('.hl-shoe'));
  ensureCss();

  let state = 'title', G = null, time = 0, timer = 0;
  function newGame() {
    G = { score: 0, lives: LIVES, pot: POT0, streak: 0, bestStreak: 0, bestPot: 0, shoe: shuffled(), cur: -1, next: -1, seen: [],
      focus: 'hi', flipAt: 0, guess: null, res: 0, fx: [], say: null, yayUntil: 0, koUntil: 0 };
    G.cur = G.shoe.pop();
    renderHud();
  }
  function renderHud() {
    hScore.textContent = fmt(G.score);
    hLives.textContent = '❤'.repeat(Math.max(0, G.lives)) + '♡'.repeat(Math.max(0, LIVES - G.lives));
    hShoe.textContent = t('psCards') + ' ' + G.shoe.length;
  }
  const say = (s, life = 1.8) => { G.say = { s, t: 0, life }; };

  function titlePanel() {
    const best = shell.best.get();
    shell.panel('<h2>' + esc(t('hlName')) + '</h2><p>' + esc(t('hlHint')) + '</p>'
      + (best ? '<p class="pg-dim">' + esc(t('arRecord', { n: fmt(best) })) + '</p>' : '')
      + '<p class="pg-blink">' + esc(t('arTapStart')) + '</p>');
  }
  newGame();
  titlePanel();
  try { if (navigator.webdriver) window.__pthHL = { run: () => G, state: () => state }; } catch (e) {}

  function start() {
    clearTimeout(timer);
    newGame();
    state = 'guess'; shell.panel(null);
    ace.pose('idle'); ace.mood('mc-m-smile');
    sound('notifyCard');
  }
  function guess(dir) {
    if (state !== 'guess') return;
    const o = odds(G.cur, G.shoe);
    const m = dir > 0 ? mult(o.hi, o.lo) : mult(o.lo, o.hi);
    if (!m) { sound('notifyFold'); return; }              // nothing higher than an ace (or lower than a 2) left
    G.next = G.shoe.pop();
    G.guess = dir; G.flipAt = time;
    const d = rankOf(G.next) - rankOf(G.cur);
    G.res = d === 0 ? 0 : Math.sign(d) === dir ? 1 : -1;
    state = 'flip';
    sound('notifyCard');
    renderHud();
    clearTimeout(timer);
    timer = setTimeout(() => settle(m), 450);
  }
  function settle(m) {
    if (state !== 'flip') return;
    const L0 = L();
    if (G.res > 0) {
      const before = G.pot;
      G.pot = Math.round(G.pot * m);
      G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak); G.bestPot = Math.max(G.bestPot, G.pot);
      G.fx.push({ s: '×' + m.toFixed(2) + '  ' + fmt(G.pot), x: L0.potX, y: L0.cardY - L0.ch / 2 - 14, t: 0, life: 1.1, gold: true });
      G.yayUntil = performance.now() + 600;
      sound(G.streak >= 5 ? 'notifyRaise' : 'notifyAction');
      if (G.streak === TROPHY_STREAK) shell.grant('hilo');
      if (G.streak >= 3 && G.pot >= before) say('×' + G.streak + '!', 1.2);
    } else if (G.res === 0) {
      G.fx.push({ s: '=', x: L0.potX, y: L0.cardY - L0.ch / 2 - 14, t: 0, life: 0.9, gold: true });
    } else {
      G.fx.push({ s: '−' + fmt(G.pot), x: L0.potX, y: L0.cardY - L0.ch / 2 - 14, t: 0, life: 1.2, red: true });
      G.lives--; G.streak = 0; G.pot = POT0;
      G.koUntil = performance.now() + 900;
      sound('notifyFold');
    }
    G.seen.push(G.cur);
    G.cur = G.next; G.next = -1; G.guess = null;
    if (G.shoe.length < RESHUFFLE) reshuffle();
    renderHud();
    if (G.lives <= 0) { state = 'end'; timer = setTimeout(finish, 900); }
    else state = 'guess';
  }
  function reshuffle() {
    G.shoe = shuffled().filter((c) => c !== G.cur);
    G.seen = [];
    G.fx.push({ s: '⟳', x: L().shoeX, y: L().cardY - L().ch / 2 - 12, t: 0, life: 1.2, gold: true });
  }
  function cash() {
    if (state !== 'guess' || !G.streak) return;
    G.score += G.pot;
    G.fx.push({ s: '+' + fmt(G.pot), x: L().potX, y: L().cardY - L().ch / 2 - 14, t: 0, life: 1.2, gold: true, big: G.pot >= 100 });
    sound(G.pot >= 100 ? 'notifyBigWin' : 'notifyRaise');
    G.yayUntil = performance.now() + 900;
    G.pot = POT0; G.streak = 0;
    renderHud();
  }
  function finish() {
    state = 'over';
    const score = G.score, prev = shell.best.get(), record = score > prev;
    if (record) shell.best.set(score);
    if (record && prev) sound('notifyBigWin');
    ace.mood('mc-m-smile'); ace.pose('idle');
    G.result = { score, record, prev };
    renderResult();
  }
  function renderResult() {
    if (state !== 'over' || !G.result) return;
    const { score, record, prev } = G.result;
    shell.panel('<div class="hl-box"><h2>' + esc(fmt(score)) + '</h2>'
      + '<p class="ar-final">' + esc(t('hlPot')) + ' ' + fmt(G.bestPot) + ' · <em>×' + fmt(G.bestStreak) + '</em></p>'
      + '<p class="pg-dim">' + esc(record && prev ? t('arNewRecord') : t('arRecord', { n: fmt(Math.max(score, prev)) })) + '</p>'
      + '<p class="pg-blink">' + esc(t('gmAgain')) + '</p></div>', true);
  }

  // ── Layout (world px) ─────────────────────────────────────────────
  function L() {
    const W = shell.W, H = shell.H;
    let top = 46;
    try { top = Math.max(40, shell.hud.offsetHeight / (shell.k || 1) + 6); } catch (e) {}
    const narrow = W < 430;
    const btnH = 36;
    const cw = narrow ? Math.min(78, W * 0.32) : 84, ch = cw * 1.4;
    const histY = top + 14;
    if (narrow) {
      const cashY = H - btnH / 2 - 8, btnY = cashY - btnH - 8;
      const cardY = Math.min(btnY - btnH / 2 - 40 - ch / 2, (histY + 20 + btnY - btnH / 2) / 2 + 4);
      return { W, H, narrow, top, cw, ch, histY, cardX: W / 2 - cw * 0.62, shoeX: W / 2 + cw * 0.62, cardY, potX: W / 2, potY: cardY + ch / 2 + 22, btnY, cashY, btnH };
    }
    const btnY = H - btnH / 2 - 12;
    const cardY = Math.max(histY + 34 + ch / 2, (histY + 20 + btnY - btnH / 2) / 2 - 10);
    return { W, H, narrow, top, cw, ch, histY, cardX: W / 2 - cw * 0.65, shoeX: W / 2 + cw * 0.65, cardY, potX: W / 2, potY: cardY + ch / 2 + 22, btnY, cashY: btnY, btnH };
  }
  function layoutButtons(l) {
    btns.reset();
    if (state !== 'guess' && state !== 'flip' && state !== 'end') return;
    const o = odds(G.cur, G.shoe);
    const pct = (x) => Math.round((100 * x) / Math.max(1, o.n)) + '%';
    const mHi = mult(o.hi, o.lo), mLo = mult(o.lo, o.hi);
    const lab = (k, x, m) => t(k) + '  ' + pct(x) + (m ? ' ×' + m.toFixed(2) : '');
    const off = state !== 'guess';
    if (l.narrow) {
      const w = (l.W - 24) / 2;
      btns.add({ id: 'hi', x: 8 + w / 2, y: l.btnY, w, h: l.btnH, label: '▲ ' + lab('hlHigher', o.hi, mHi), key: '↑', off: off || !mHi });
      btns.add({ id: 'lo', x: l.W - 8 - w / 2, y: l.btnY, w, h: l.btnH, label: '▼ ' + lab('hlLower', o.lo, mLo), key: '↓', off: off || !mLo });
      btns.add({ id: 'cash', x: l.W / 2, y: l.cashY, w: l.W - 16, h: l.btnH, label: t('hlCash') + ' ' + fmt(G.pot), kind: 'ghost', key: 'Space', off: off || !G.streak });
    } else {
      const w = Math.min(190, (l.W - 48) / 3);
      btns.add({ id: 'hi', x: l.W / 2 - w - 10, y: l.btnY, w, h: l.btnH, label: '▲ ' + lab('hlHigher', o.hi, mHi), key: '↑', off: off || !mHi });
      btns.add({ id: 'cash', x: l.W / 2, y: l.btnY, w, h: l.btnH, label: t('hlCash') + ' ' + fmt(G.pot), kind: 'ghost', key: 'Space', off: off || !G.streak });
      btns.add({ id: 'lo', x: l.W / 2 + w + 10, y: l.btnY, w, h: l.btnH, label: '▼ ' + lab('hlLower', o.lo, mLo), key: '↓', off: off || !mLo });
    }
  }
  const ORDER = ['hi', 'cash', 'lo'];

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'title') { if (a === 'jump') start(); return; }
    if (state === 'over') { if (a === 'jump') { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); titlePanel(); } return; }
    if (state !== 'guess') return;
    const l = L();
    layoutButtons(l);
    if (info.x != null) { const b = btns.hit(info.x, info.y); if (b) press(b); return; }
    const up = a === 'jump' && (info.code === 'ArrowUp' || info.code === 'KeyW' || info.pad === 'up');
    if (up) guess(1);
    else if (a === 'duck') guess(-1);
    else if (a === 'left' || a === 'right') {
      const i = ORDER.indexOf(G.focus);
      G.focus = ORDER[(i + (a === 'left' ? 2 : 1)) % 3];
    } else if (a === 'jump') {
      if (info.code === 'Space') cash();          // Space banks the pot; Enter / pad A press the lit button
      else press(G.focus);
    }
  }
  function press(id) { if (id === 'hi') guess(1); else if (id === 'lo') guess(-1); else if (id === 'cash') cash(); }

  function update(dt) {
    time += dt;
    if (!G) return;
    stepFloaters(G.fx, dt);
    if (G.say) { G.say.t += dt; if (G.say.t > G.say.life) G.say = null; }
    if (state !== 'over' && state !== 'title') {
      const now = performance.now();
      ace.mood(now < G.koUntil ? 'mc-m-ko' : now < G.yayUntil ? 'mc-m-yay' : G.streak >= 6 ? 'mc-m-fierce' : G.streak >= 3 ? 'mc-m-cool' : 'mc-m-smile');
      ace.pose(now < G.yayUntil ? 'wave' : G.streak >= 4 ? 'balance' : 'idle');
    }
  }

  // ── Drawing ───────────────────────────────────────────────────────
  function draw(g) {
    const l = L(), W = l.W, H = l.H;
    felt(g, W, H, shell.theme.light);
    if (state !== 'title') {
      // Cards already out, small, in a row (the last ones).
      const sw = 16, sh = 22, max = Math.max(4, Math.floor((W - 24) / (sw + 3)));
      const list = G.seen.slice(-max);
      const x0 = W / 2 - ((list.length - 1) * (sw + 3)) / 2;
      list.forEach((n, i) => { g.save(); g.globalAlpha = 0.85; g.translate(x0 + i * (sw + 3), l.histY + sh / 2); drawFace(g, img, n, sw, sh); g.restore(); });
      // The card face up, and the shoe with the next one.
      g.save(); g.translate(l.cardX, l.cardY); drawFace(g, img, G.cur, l.cw, l.ch); g.restore();
      for (let k = 3; k >= 1; k--) drawBackCard(g, img, l.shoeX + k * 2, l.cardY - k * 2, l.cw, l.ch);
      if (G.next >= 0) {
        const p = Math.min(1, (time - G.flipAt) / 0.25);
        g.save(); g.translate(l.shoeX, l.cardY); g.scale(Math.max(0.05, Math.abs(1 - 2 * p)), 1);
        if (p < 0.5) { g.restore(); drawBackCard(g, img, l.shoeX, l.cardY, l.cw * Math.max(0.05, 1 - 2 * p), l.ch); }
        else { drawFace(g, img, G.next, l.cw, l.ch); g.restore(); }
        if (p >= 1) {
          g.save(); rr(g, l.shoeX - l.cw / 2 - 3, l.cardY - l.ch / 2 - 3, l.cw + 6, l.ch + 6, 7);
          g.strokeStyle = G.res > 0 ? '#7ee2a0' : G.res < 0 ? '#ff8a80' : '#f5d77a'; g.lineWidth = 2.5; g.stroke(); g.restore();
        }
      } else drawBackCard(g, img, l.shoeX, l.cardY, l.cw, l.ch);
      // The pot.
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '600 10px Inter, system-ui, sans-serif'; g.fillStyle = 'rgba(245,240,227,.7)';
      g.fillText(t('hlPot').toUpperCase(), l.potX, l.potY - 4);
      g.font = '700 20px Inconsolata, monospace'; g.fillStyle = '#f5d77a';
      g.fillText(fmt(G.pot), l.potX, l.potY + 14);
      if (G.streak) { g.font = '700 10px Inconsolata, monospace'; g.fillStyle = '#7ee2a0'; g.fillText('✓ ' + G.streak, l.potX + 46, l.potY + 15); }
      layoutButtons(l);
      btns.draw(g, keyboardFirst(), keyboardFirst() && state === 'guess' ? G.focus : null);
    }
    const ax = l.narrow ? 20 : Math.max(26, l.cardX - l.cw / 2 - 34), ay = l.narrow ? l.potY + 22 : l.cardY + l.ch / 2, s = l.narrow ? 0.17 : 0.28;
    ace.place(ax, ay, s, shell.k);
    if (G && G.say && state !== 'title') {
      const a = G.say.t < 0.2 ? G.say.t / 0.2 : G.say.t > G.say.life - 0.4 ? Math.max(0, (G.say.life - G.say.t) / 0.4) : 1;
      bubble(g, G.say.s, Math.min(ax + 6, W - 20), ay - 212 * s - 2, W, a);
    }
    if (G) drawFloaters(g, G.fx);
  }

  return {
    update, draw, input, resize: renderResult,
    running: () => state === 'guess' || state === 'flip',
    destroy() { clearTimeout(timer); ace.remove(); },
  };
}

function ensureCss() {
  if (document.getElementById('pth-game-hl-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-hl-css';
  st.textContent = '#pth-game .hl-box{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 18px;border-radius:12px;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .hl-box h2{color:#f5d77a}#pth-game .hl-lives{color:#ff8a80;letter-spacing:2px}'
    + '#pth-game.pg-light .hl-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .hl-box h2{color:#8a6510}#pth-game.pg-light .hl-box .ar-final{color:#1d222b}';
  document.head.appendChild(st);
}
