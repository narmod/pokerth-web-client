// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Video Poker (Jacks or Better) — hidden mini-game (web extension, narmod
// 2026-10-16), in the arcade behind the training nickname « mascot ».
//
// The casino classic: five cards, keep (HOLD) the ones you want, draw the
// others once, paid by the hand (PAY, per credit; the bet is always BET).
// A session is HANDS hands from START credits (it ends sooner when the
// credits no longer cover the bet); the score is the credits left.
//   Daily challenge  every hand dealt from a deck seeded by the (UTC) day and
//                    the hand number (deal.mjs): the same deals for everyone
//   Free game        fresh shuffles
//   Double or nothing  after a win, against the Ace: he turns a card, you pick
//                    one of four face down — higher doubles the win, equal
//                    keeps it, lower loses it; up to MAX_DOUBLE times
// Keys: ←/→ card, Space hold, ↓ draw / deal; after a win ←/→ and Space pick
// « Double » or « Collect » (↑ doubles, ↓ collects). A tap does the same.
// Secret trophy « Video Poker »: three doubles won in a row.
// ═══════════════════════════════════════════════════════════════════

import { evalCards, rankOf } from './poker-hand.mjs';
import { deckFor } from './deal.mjs';
import { dayKey } from './solitaire-rules.mjs';
import { fmt, cardHtml, imageCache, rr, drawFace, aceActor } from './common.mjs';
import { felt, drawBackCard, buttons, bubble, drawFloaters, stepFloaters, keyboardFirst, fitFont } from './ui.mjs';

export const BET = 5, START = 100, HANDS = 20, MAX_DOUBLE = 5, TROPHY_DOUBLES = 3;
// Paytable per credit, best first: [label key, pays, test(eval)].
export const PAY = [
  ['oddsRoyal', 800, (e) => e.cat === 9],
  ['oddsSF', 50, (e) => e.cat === 8],
  ['oddsQuads', 25, (e) => e.cat === 7],
  ['oddsFull', 9, (e) => e.cat === 6],
  ['oddsFlush', 6, (e) => e.cat === 5],
  ['oddsStraight', 4, (e) => e.cat === 4],
  ['oddsTrips', 3, (e) => e.cat === 3],
  ['oddsTwoPair', 2, (e) => e.cat === 2],
  ['vpJacks', 1, (e) => e.cat === 1 && rankOf(e.best[0]) >= 11],
];
/** Row of the paytable a five-card hand pays (-1: nothing). */
export function payRow(cards) {
  const e = evalCards(cards);
  for (let i = 0; i < PAY.length; i++) if (PAY[i][2](e)) return i;
  return -1;
}

export function create(shell) {
  const { t, esc, sound } = shell;
  const img = imageCache();
  const ace = aceActor(shell.layer);
  const btns = buttons();
  shell.touchPad(false);
  shell.hud.classList.add('on-felt');
  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('vpCredits')) + '</div><div class="ar-num vp-cr">0</div></div>'
    + '<div><div class="ar-lab">' + esc(t('vpHands')) + '</div><div class="ar-num vp-h">0/' + HANDS + '</div></div></div>'
    + '<div class="ar-hand"><div class="ar-name vp-mode"></div></div>';
  const hCr = /** @type {HTMLElement} */ (shell.hud.querySelector('.vp-cr'));
  const hH = /** @type {HTMLElement} */ (shell.hud.querySelector('.vp-h'));
  const hMode = /** @type {HTMLElement} */ (shell.hud.querySelector('.vp-mode'));
  ensureBoxCss();

  const dailyKey = 'pth_game_daily_videopoker';
  const dailyBest = (day) => { try { const v = JSON.parse(localStorage.getItem(dailyKey) || 'null'); return v && v.d === day ? v.s : 0; } catch (e) { return 0; } };
  const setDailyBest = (day, s) => { try { localStorage.setItem(dailyKey, JSON.stringify({ d: day, s })); } catch (e) {} };

  let state = 'title', mode = 0, G = null, time = 0, timer = 0;
  function newGame(daily) {
    G = { daily, day: dayKey(), credits: START, hand: 0, deck: [], cards: [], held: [false, false, false, false, false], flip: [0, 0, 0, 0, 0],
      cursor: 0, win: 0, row: -1, msg: '', focus: 'collect', dbl: null, chain: 0, bestRow: -1, bestCards: null, fx: [], say: null,
      yayUntil: 0, koUntil: 0 };
    renderHud();
  }
  function renderHud() {
    hCr.textContent = fmt(G.credits);
    hH.textContent = G.hand + '/' + HANDS;
    hMode.textContent = G.daily ? t('psDaily') + ' · ' + G.day : t('psFree');
  }
  const say = (s, life = 2.4) => { G.say = { s, t: 0, life }; };

  function titlePanel() {
    const day = dayKey(), db = dailyBest(day), fb = shell.best.get();
    const tile = (i, icon, name, sub) => '<button type="button" class="gm-tile' + (i === mode ? ' on' : '') + '" data-i="' + i + '"><i>' + icon + '</i><b>'
      + esc(name) + '</b><small>' + sub + '</small></button>';
    shell.panel('<h2>' + esc(t('vpName')) + '</h2><p>' + esc(t('vpHint')) + '</p><div class="gm-tiles">'
      + tile(0, '📅', t('psDaily'), esc(day) + (db ? ' · ' + esc(fmt(db)) : ''))
      + tile(1, '🎰', t('psFree'), fb ? esc(t('arRecord', { n: fmt(fb) })) : '&nbsp;')
      + '</div>');
    shell.root.querySelectorAll('.pg-panel .gm-tile').forEach((b) => {
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', () => { mode = +(b.getAttribute('data-i') || 0); start(); });
    });
  }
  newGame(true);
  titlePanel();
  // Browser tests only (navigator.webdriver): reach the game state.
  try { if (navigator.webdriver) window.__pthVP = { run: () => G, state: () => state }; } catch (e) {}

  function start() {
    clearTimeout(timer);
    newGame(mode === 0);
    state = 'ready'; shell.panel(null);
    ace.pose('idle'); ace.mood('mc-m-smile'); ace.king(false);
    deal();
  }

  // ── A hand ────────────────────────────────────────────────────────
  function deal() {
    if (G.hand >= HANDS || G.credits < BET) { finish(); return; }
    G.hand++;
    G.credits -= BET;
    G.deck = deckFor(G.daily ? 'vp-' + G.day + '-' + G.hand : null);
    G.cards = G.deck.splice(0, 5);
    G.held = [false, false, false, false, false];
    G.flip = [0, 1, 2, 3, 4].map((i) => time + 0.08 * i);
    G.row = -1; G.win = 0; G.msg = ''; G.cursor = 0; G.chain = 0;
    state = 'hold';
    sound('notifyCard');
    renderHud();
  }
  function toggle(i) {
    if (state !== 'hold') return;
    G.held[i] = !G.held[i]; G.cursor = i;
    sound('notifyAction');
  }
  function drawCards() {
    if (state !== 'hold') return;
    let k = 0;
    for (let i = 0; i < 5; i++) if (!G.held[i]) { G.cards[i] = G.deck.shift(); G.flip[i] = time + 0.08 * k++; }
    if (k) sound('notifyCard');
    G.row = payRow(G.cards);
    if (G.row >= 0 && (G.bestRow < 0 || G.row < G.bestRow)) { G.bestRow = G.row; G.bestCards = G.cards.slice(); }
    G.win = G.row >= 0 ? PAY[G.row][1] * BET : 0;
    const settle = 0.08 * k + 0.25;
    state = 'show';
    timer = setTimeout(() => {
      if (state !== 'show') return;
      if (G.win) {
        G.msg = t(PAY[G.row][0] === 'vpJacks' ? 'vpJacks' : evalCards(G.cards).nameKey);
        G.fx.push({ s: '+' + fmt(G.win), x: L().cardsX, y: L().cardsY - L().ch / 2 - 14, t: 0, life: 1.3, gold: true, big: G.row <= 3 });
        G.yayUntil = performance.now() + 900;
        sound(G.row <= 2 ? 'notifyBigWin' : 'notifyRaise');
        state = 'win'; G.focus = 'collect';
      } else {
        G.msg = '';
        G.koUntil = performance.now() + 700;
        nextOrEnd();
      }
    }, settle * 1000);
  }
  function collect() {
    if (state !== 'win') return;
    G.credits += G.win;
    G.fx.push({ s: '+' + fmt(G.win), x: 60, y: 40, t: 0, life: 1, gold: true });
    sound('notifyAction');
    G.win = 0; G.dbl = null;
    renderHud();
    nextOrEnd();
  }
  function nextOrEnd() {
    renderHud();
    if (G.hand >= HANDS || G.credits < BET) { state = 'end'; timer = setTimeout(finish, 900); }
    else state = 'ready';
  }

  // ── Double or nothing ─────────────────────────────────────────────
  let dblCount = 0;
  function double() {
    if (state !== 'win' || G.chain >= MAX_DOUBLE) return;
    dblCount++;
    const deck = deckFor(G.daily ? 'vp-' + G.day + '-' + G.hand + '-d' + dblCount : null);
    G.dbl = { cards: deck.slice(0, 5), pick: -1, flip: time };
    G.cursor = 1;
    state = 'double';
    say(t('vpPick'), 3);
    sound('notifyCard');
  }
  function pick(i) {
    if (state !== 'double' || i < 1 || i > 4) return;
    const d = G.dbl;
    d.pick = i; d.flip2 = time;
    const mine = rankOf(d.cards[i]), his = rankOf(d.cards[0]);
    state = 'dres';
    sound('notifyCard');
    timer = setTimeout(() => {
      if (state !== 'dres') return;
      if (mine > his) {
        G.win *= 2; G.chain++;
        G.fx.push({ s: '×2  ' + fmt(G.win), x: L().cardsX, y: L().cardsY - L().ch / 2 - 14, t: 0, life: 1.3, gold: true, big: true });
        G.yayUntil = performance.now() + 900; sound('notifyRaise');
        if (G.chain >= TROPHY_DOUBLES) shell.grant('videopoker');
        state = 'win';
        G.focus = 'collect';
      } else if (mine === his) {
        G.fx.push({ s: '=', x: L().cardsX, y: L().cardsY - L().ch / 2 - 14, t: 0, life: 1, gold: true });
        state = 'win'; G.focus = 'collect';
      } else {
        G.fx.push({ s: '−' + fmt(G.win), x: L().cardsX, y: L().cardsY - L().ch / 2 - 14, t: 0, life: 1.2, red: true });
        G.win = 0; G.chain = 0; G.koUntil = performance.now() + 1200;
        sound('notifyFold');
        G.dbl = null;
        nextOrEnd();
      }
      if (state === 'win') G.dbl = null;
    }, 900);
  }

  // ── End of the session ────────────────────────────────────────────
  function finish() {
    clearTimeout(timer);
    state = 'over';
    const score = G.credits;
    let record = false, prev;
    if (G.daily) { prev = dailyBest(G.day); if (score > prev) { setDailyBest(G.day, score); record = prev > 0; } }
    else { prev = shell.best.get(); if (score > prev) { shell.best.set(score); record = prev > 0; } }
    ace.mood(score > START ? 'mc-m-yay' : 'mc-m-smile'); ace.pose(score > START ? 'wave' : 'idle');
    if (record) sound('notifyBigWin');
    G.res = { score, record, prev: prev || 0 };
    renderResult();
  }
  function renderResult() {
    if (state !== 'over' || !G.res) return;
    const { score, record, prev } = G.res;
    const best = G.bestCards && G.bestRow >= 0
      ? '<p>' + esc(t('psBestLine', { h: t(PAY[G.bestRow][0] === 'vpJacks' ? 'vpJacks' : evalCards(G.bestCards).nameKey) })) + '</p>'
        + '<div class="ar-show">' + G.bestCards.map((c) => cardHtml(c, 'lg')).join('') + '</div>'
      : '';
    shell.panel('<div class="vp-box"><h2>' + esc(fmt(score)) + '</h2><p class="pg-dim">' + esc(t('vpCredits')) + '</p>' + best
      + '<p class="pg-dim">' + esc(G.daily ? t('psDaily') + ' · ' + G.day : t('psFree')) + ' · '
      + esc(record ? t('arNewRecord') : t('arRecord', { n: fmt(Math.max(score, prev)) })) + '</p>'
      + '<p class="pg-blink">' + esc(t('psAgain')) + '</p></div>', true);
  }

  // ── Layout (world px) ─────────────────────────────────────────────
  function L() {
    const W = shell.W, H = shell.H;
    let top = 46;
    try { top = Math.max(40, shell.hud.offsetHeight / (shell.k || 1) + 6); } catch (e) {}
    const narrow = W < 430;
    const ptW = narrow ? W - 16 : Math.min(176, W * 0.32);
    const ptX = narrow ? 8 : 12, ptY = top;
    const ptRows = narrow ? 5 : 9, rowH = narrow ? 13 : 16;
    const ptH = ptRows * rowH + 8;
    const areaL = narrow ? 8 : ptX + ptW + 14, areaR = narrow ? W - 8 : W - 12;
    const gap = 6, cw = Math.min(64, (areaR - areaL - 4 * gap) / 5), ch = cw * 1.4;
    const cardsX = (areaL + areaR) / 2;
    const btnH = 34, btnY = H - btnH / 2 - 10;
    const cardsY = narrow ? (ptY + ptH + btnY - btnH / 2) / 2 - 6 : Math.max(top + 30 + ch / 2, (top + btnY) / 2 - 8);
    const xs = [0, 1, 2, 3, 4].map((i) => cardsX + (i - 2) * (cw + gap));
    return { W, H, narrow, top, ptX, ptY, ptW, ptH, rowH, cw, ch, gap, cardsX, cardsY, xs, btnY, btnH, areaL, areaR };
  }
  function cardAt(l, x, y) {
    for (let i = 0; i < 5; i++) if (Math.abs(x - l.xs[i]) <= l.cw / 2 + l.gap / 2 && Math.abs(y - l.cardsY) <= l.ch / 2 + 12) return i;
    return -1;
  }
  function layoutButtons(l) {
    btns.reset();
    const w = Math.min(220, l.areaR - l.areaL - (l.narrow ? 60 : 0)), cx = l.narrow ? Math.min(l.W - 8 - w / 2, l.cardsX + 26) : l.cardsX;
    if (state === 'ready' || state === 'end') btns.add({ id: 'deal', x: cx, y: l.btnY, w, h: l.btnH, label: t('vpDeal'), key: 'Space / ↓', off: state === 'end' });
    else if (state === 'hold' || state === 'show') btns.add({ id: 'draw', x: cx, y: l.btnY, w, h: l.btnH, label: t('vpDraw'), key: '↓', off: state === 'show' });
    else if (state === 'win' || state === 'dres' || state === 'double') {
      const half = (w - 8) / 2;
      btns.add({ id: 'double', x: cx - half / 2 - 4, y: l.btnY, w: half, h: l.btnH, label: t('vpDouble'), kind: 'red', key: '↑', off: state !== 'win' || G.chain >= MAX_DOUBLE });
      btns.add({ id: 'collect', x: cx + half / 2 + 4, y: l.btnY, w: half, h: l.btnH, label: t('vpCollect') + (G.win ? ' ' + fmt(G.win) : ''), key: '↓', off: state !== 'win' });
    }
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
      if (a === 'jump') { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); titlePanel(); }
      return;
    }
    const l = L();
    layoutButtons(l);
    const up = a === 'jump' && (info.code === 'ArrowUp' || info.code === 'KeyW' || info.pad === 'up');
    if (info.x != null) {
      const b = btns.hit(info.x, info.y);
      if (b) { press(b); return; }
      const c = cardAt(l, info.x, info.y);
      if (c >= 0) { if (state === 'hold') toggle(c); else if (state === 'double') pick(c); }
      return;
    }
    if (state === 'ready') { if (a === 'jump' || a === 'duck') deal(); return; }
    if (state === 'hold') {
      if (a === 'left') G.cursor = (G.cursor + 4) % 5;
      else if (a === 'right') G.cursor = (G.cursor + 1) % 5;
      else if (a === 'duck') drawCards();
      else if (a === 'jump' && !up) toggle(G.cursor);
      return;
    }
    if (state === 'win') {
      if (a === 'left' || a === 'right') G.focus = G.focus === 'collect' && G.chain < MAX_DOUBLE ? 'double' : 'collect';
      else if (a === 'duck') collect();
      else if (up) double();
      else if (a === 'jump') { if (G.focus === 'double') double(); else collect(); }
      return;
    }
    if (state === 'double') {
      if (a === 'left') G.cursor = G.cursor <= 1 ? 4 : G.cursor - 1;
      else if (a === 'right') G.cursor = G.cursor >= 4 ? 1 : G.cursor + 1;
      else if (a === 'jump') pick(G.cursor);
    }
  }
  function press(id) {
    if (id === 'deal') deal();
    else if (id === 'draw') drawCards();
    else if (id === 'double') double();
    else if (id === 'collect') collect();
  }

  function update(dt) {
    time += dt;
    if (!G) return;
    stepFloaters(G.fx, dt);
    if (G.say) { G.say.t += dt; if (G.say.t > G.say.life) G.say = null; }
    if (state !== 'over' && state !== 'title') {
      const now = performance.now();
      ace.mood(now < G.koUntil ? 'mc-m-ko' : now < G.yayUntil ? 'mc-m-yay' : state === 'double' ? 'mc-m-cool' : 'mc-m-smile');
      ace.pose(now < G.yayUntil ? 'wave' : 'idle');
    }
  }

  // ── Drawing ───────────────────────────────────────────────────────
  function draw(g) {
    const l = L(), W = l.W, H = l.H;
    felt(g, W, H, shell.theme.light);
    drawPaytable(g, l);
    const showCards = G.cards.length;
    const dbl = (state === 'double' || state === 'dres') && G.dbl;
    for (let i = 0; i < 5 && state !== 'title'; i++) {
      const x = l.xs[i];
      let y = l.cardsY;
      if (!dbl && state === 'hold' && G.held[i]) y -= 6;
      g.save(); g.translate(x, y);
      if (dbl) {
        const d = G.dbl, open = i === 0 ? time >= d.flip + 0.15 : (state === 'dres' && (i === d.pick ? true : time >= d.flip2 + 0.5));
        if (open) drawFace(g, img, d.cards[i], l.cw, l.ch); else { g.restore(); drawBackCard(g, img, x, y, l.cw, l.ch); g.save(); g.translate(x, y); }
        if (i === 0) { g.font = '700 9px Inter, system-ui, sans-serif'; g.fillStyle = '#f5d77a'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText('A♠', 0, l.ch / 2 + 4); }
        if (state === 'dres' && i === d.pick) { rr(g, -l.cw / 2 - 3, -l.ch / 2 - 3, l.cw + 6, l.ch + 6, 6); g.strokeStyle = '#f5d77a'; g.lineWidth = 2; g.stroke(); }
        if (state === 'double' && i === G.cursor && i > 0) { rr(g, -l.cw / 2 - 3, -l.ch / 2 - 3, l.cw + 6, l.ch + 6, 6); g.strokeStyle = '#f5f0e3'; g.lineWidth = 2; g.stroke(); }
        if (state === 'dres' && i > 0 && i !== d.pick) { g.fillStyle = 'rgba(0,0,0,.35)'; rr(g, -l.cw / 2, -l.ch / 2, l.cw, l.ch, 4); g.fill(); }
      } else if (showCards && time >= G.flip[i]) {
        drawFace(g, img, G.cards[i], l.cw, l.ch);
        if (state === 'hold' && keyboardFirst() && i === G.cursor) { rr(g, -l.cw / 2 - 3, -l.ch / 2 - 3, l.cw + 6, l.ch + 6, 6); g.strokeStyle = '#f5f0e3'; g.lineWidth = 2; g.stroke(); }
        if ((state === 'ready' || state === 'end') && G.cards.length && G.row >= 0 && !inBest(i)) { g.fillStyle = 'rgba(0,0,0,.35)'; rr(g, -l.cw / 2, -l.ch / 2, l.cw, l.ch, 4); g.fill(); }
      } else { g.restore(); drawBackCard(g, img, x, y, l.cw, l.ch); g.save(); g.translate(x, y); }
      if (!dbl && G.held[i] && (state === 'hold' || state === 'show')) {
        g.font = '700 ' + Math.max(8, Math.min(11, l.cw * 0.2)) + 'px Inter, system-ui, sans-serif';
        const label = t('vpHeld').toUpperCase(), tw = Math.min(l.cw + 4, g.measureText(label).width + 8);
        rr(g, -tw / 2, l.ch / 2 + 4, tw, 14, 4); g.fillStyle = '#d8b25a'; g.fill();
        g.fillStyle = '#141414'; g.textAlign = 'center'; g.textBaseline = 'middle'; fitFont(g, label, tw - 4, Math.max(8, Math.min(11, l.cw * 0.2))); g.fillText(label, 0, l.ch / 2 + 11.5);
      }
      g.restore();
    }
    // The hand that paid, under the cards.
    if (G && G.msg && (state === 'win' || state === 'ready' || state === 'end')) {
      g.fillStyle = '#f5d77a'; g.textAlign = 'center'; g.textBaseline = 'middle';
      fitFont(g, G.msg, l.areaR - l.areaL, 15, 700, 'Cinzel, Georgia, serif');
      g.fillText(G.msg, l.cardsX, l.cardsY + l.ch / 2 + 16);
    }
    if (state !== 'title') { layoutButtons(l); btns.draw(g, keyboardFirst(), state === 'win' ? G.focus : null); }
    // The Ace, bottom left (portrait) or beside the cards (landscape).
    let ax = l.narrow ? 26 : l.xs[4] + l.cw / 2 + 34, ay = l.narrow ? H - 4 : Math.min(H - 6, l.cardsY + l.ch / 2 + 6), s = l.narrow ? 0.22 : 0.3;
    if (!l.narrow && ax > W - 22) { ax = W - 26; ay = l.btnY + 14; s = 0.22; }
    ace.place(ax, ay, s, shell.k);
    if (G && G.say && state !== 'title') {
      const a = G.say.t < 0.2 ? G.say.t / 0.2 : G.say.t > G.say.life - 0.4 ? Math.max(0, (G.say.life - G.say.t) / 0.4) : 1;
      bubble(g, G.say.s, Math.min(ax + 8, W - 20), ay - 228 * s - 2, W, a);
    }
    if (G) drawFloaters(g, G.fx);
  }
  function inBest(i) {
    if (G.row < 0) return true;
    return evalCards(G.cards).best.indexOf(G.cards[i]) >= 0;
  }
  function drawPaytable(g, l) {
    const rows = PAY.length, cols = l.narrow ? 2 : 1, per = Math.ceil(rows / cols);
    const colW = (l.ptW - (cols - 1) * 6) / cols;
    rr(g, l.ptX, l.ptY, l.ptW, l.ptH, 8); g.fillStyle = 'rgba(8,24,16,.55)'; g.fill(); g.strokeStyle = 'rgba(216,178,90,.45)'; g.lineWidth = 1; g.stroke();
    const lit = G && (state === 'win' || state === 'ready' || state === 'end' || state === 'double' || state === 'dres') ? G.row : -1;
    for (let i = 0; i < rows; i++) {
      const c = Math.floor(i / per), r = i % per;
      const x = l.ptX + 4 + c * (colW + 6), y = l.ptY + 4 + r * l.rowH + l.rowH / 2;
      if (i === lit) { rr(g, x - 2, y - l.rowH / 2 + 1, colW, l.rowH - 2, 4); g.fillStyle = 'rgba(216,178,90,.9)'; g.fill(); }
      const fs = l.narrow ? 9 : 11;
      g.fillStyle = i === lit ? '#141414' : '#f5f0e3'; g.textBaseline = 'middle';
      g.textAlign = 'left'; const label = t(PAY[i][0]); fitFont(g, label, colW - 40, fs, 600); g.fillText(label, x + 2, y);
      g.textAlign = 'right'; g.font = '700 ' + fs + 'px Inconsolata, monospace'; g.fillStyle = i === lit ? '#141414' : '#d8b25a';
      g.fillText(fmt(PAY[i][1] * BET), x + colW - 6, y);
    }
  }

  return {
    update, draw, input, resize: renderResult,
    running: () => state !== 'title' && state !== 'over',
    destroy() { clearTimeout(timer); ace.remove(); },
  };
}

function ensureBoxCss() {
  if (document.getElementById('pth-game-vp-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-vp-css';
  st.textContent = '#pth-game .vp-box{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 16px;border-radius:12px;pointer-events:auto;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .vp-box .ar-show{flex-wrap:nowrap}#pth-game .vp-box h2{color:#f5d77a}'
    + '#pth-game.pg-light .vp-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .vp-box h2{color:#8a6510}';
  document.head.appendChild(st);
}
