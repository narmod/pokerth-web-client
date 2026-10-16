// @ts-check
// ═══════════════════════════════════════════════════════════════════
// The Ace's Bluff — hidden mini-game (web extension, narmod 2026-10-16), in
// the arcade behind the training nickname « mascot ». Reading a player.
//
// Heads-up against the Ace, on the river: the board and your two cards are
// face up, his two are hidden. Each hand both ante ANTE. When his hand is
// better he bets; when it is worse he sometimes bets anyway (BLUFF_P) — a
// bluff; otherwise he checks and the best hand wins. Facing a bet: Call (see
// his cards) or Fold (lose the ante).
//   Tells    at every table (TABLE hands) the Ace gets a new tell — a drop of
//            sweat, a stare, sunglasses, a fidget, a wave, a grin — that he
//            shows when he bluffs (TELL_BLUFF of the time), sometimes when he
//            does not (TELL_FALSE), among other harmless habits
//   Session  HANDS hands from START chips; the score is the chips left
// Keys: Space / Enter Call, ↓ Fold, ←/→ move between the two; Space goes on
// after a hand. A tap does the same.
// Secret trophy « Mind Reader »: TROPHY_CAUGHT bluffs called in one game.
// ═══════════════════════════════════════════════════════════════════

import { rankHand, compareHands, NAME_KEYS } from './poker-hand.mjs';
import { shuffled } from './deal.mjs';
import { fmt, imageCache, rr, drawFace, aceActor } from './common.mjs';
import { felt, drawBackCard, buttons, bubble, drawFloaters, stepFloaters, keyboardFirst, fitFont } from './ui.mjs';

export const START = 100, ANTE = 5, HANDS = 20, TABLE = 5, BLUFF_P = 0.5, TELL_BLUFF = 0.8, TELL_FALSE = 0.15, TROPHY_CAUGHT = 5;
export const TELLS = ['sweat', 'fierce', 'cool', 'fidget', 'wave', 'grin'];

/** The Ace's play for a deal: 'bet' (value), 'bluff' or 'check'. rnd: the random source. */
export function aceAction(cmp, rnd = Math.random) {
  if (cmp > 0) return 'bet';
  if (cmp < 0 && rnd() < BLUFF_P) return 'bluff';
  return 'check';
}
/** The tell he shows this hand (or '' for none), given his table tell. */
export function tellFor(action, tell, rnd = Math.random) {
  const other = () => { const o = TELLS.filter((x) => x !== tell); return o[Math.floor(rnd() * o.length)]; };
  if (action === 'bluff') return rnd() < TELL_BLUFF ? tell : (rnd() < 0.5 ? other() : '');
  if (action === 'bet') return rnd() < TELL_FALSE ? tell : (rnd() < 0.5 ? other() : '');
  return '';
}

export function create(shell) {
  const { t, esc, sound } = shell;
  const img = imageCache();
  const ace = aceActor(shell.layer);
  const btns = buttons();
  shell.touchPad(false);
  shell.hud.classList.add('on-felt');
  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('blChips')) + '</div><div class="ar-num bl-chips">0</div></div>'
    + '<div><div class="ar-lab">' + esc(t('vpHands')) + '</div><div class="ar-num bl-h">0/' + HANDS + '</div></div></div>'
    + '<div class="ar-hand"><div class="ar-name bl-caught"></div></div>';
  const hChips = /** @type {HTMLElement} */ (shell.hud.querySelector('.bl-chips'));
  const hH = /** @type {HTMLElement} */ (shell.hud.querySelector('.bl-h'));
  const hCaught = /** @type {HTMLElement} */ (shell.hud.querySelector('.bl-caught'));
  ensureCss();

  let state = 'title', G = null, time = 0, timer = 0;
  function newGame() {
    G = { chips: START, hand: 0, caught: 0, tell: TELLS[Math.floor(Math.random() * TELLS.length)], board: [], me: [], him: [], rMe: null, rHim: null,
      action: '', show: '', bet: 0, pot: 0, focus: 'call', called: false, net: 0, fx: [], say: null, yayUntil: 0, koUntil: 0 };
    renderHud();
  }
  function renderHud() {
    hChips.textContent = fmt(G.chips);
    hH.textContent = G.hand + '/' + HANDS;
    hCaught.textContent = G.caught ? '🎭 ' + G.caught : '';
  }
  const say = (s, life = 2.4) => { G.say = { s, t: 0, life }; };

  function titlePanel() {
    const best = shell.best.get();
    shell.panel('<h2>' + esc(t('blName')) + '</h2><p>' + esc(t('blHint')) + '</p>'
      + (best ? '<p class="pg-dim">' + esc(t('arRecord', { n: fmt(best) })) + '</p>' : '')
      + '<p class="pg-blink">' + esc(t('arTapStart')) + '</p>');
  }
  newGame();
  titlePanel();
  try { if (navigator.webdriver) window.__pthBL = { run: () => G, state: () => state }; } catch (e) {}

  function start() {
    clearTimeout(timer);
    newGame();
    shell.panel(null);
    ace.pose('idle'); ace.mood('mc-m-smile');
    deal();
  }
  function deal() {
    if (G.hand >= HANDS || G.chips < ANTE) { finish(); return; }
    G.hand++;
    // A new table every TABLE hands: a new tell.
    let changed = false;
    if (G.hand > 1 && (G.hand - 1) % TABLE === 0) {
      const o = TELLS.filter((x) => x !== G.tell);
      G.tell = o[Math.floor(Math.random() * o.length)];
      changed = true;
    }
    const d = shuffled();
    G.board = d.slice(0, 5); G.me = d.slice(5, 7); G.him = d.slice(7, 9);
    G.rMe = rankHand(G.me.concat(G.board)); G.rHim = rankHand(G.him.concat(G.board));
    const cmp = compareHands(G.rHim, G.rMe);
    G.action = aceAction(cmp);
    G.show = tellFor(G.action, G.tell);
    G.chips -= ANTE; G.pot = 2 * ANTE; G.called = false; G.net = -ANTE;
    G.bet = G.action === 'check' ? 0 : Math.min(G.chips, [10, 15, 20][Math.floor(Math.random() * 3)]);
    if (G.action !== 'check' && G.bet <= 0) { G.action = 'check'; G.show = ''; }
    G.focus = 'call';
    state = 'deal';
    sound('notifyCard');
    renderHud();
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (state !== 'deal') return;
      if (changed) say(t('blTells'), 1.6);
      timer = setTimeout(act, changed ? 1500 : 0);
    }, 600);
  }
  function act() {
    if (state !== 'deal') return;
    if (G.action === 'check') { say('Check.', 1.4); sound('notifyAction'); timer = setTimeout(() => reveal(false), 900); state = 'check'; return; }
    say(t('blBets', { n: fmt(G.bet) }), 99);
    sound('notifyRaise');
    state = 'decide';
  }
  function decide(call) {
    if (state !== 'decide') return;
    G.say = null;
    if (!call) {
      sound('notifyFold');
      G.fx.push({ s: '−' + ANTE, x: L().meX + L().mcw + 34, y: L().meY, t: 0, life: 1.1, red: true });
      reveal(false, true);
      return;
    }
    G.called = true;
    G.chips -= G.bet; G.pot += 2 * G.bet; G.net -= G.bet;
    sound('notifyAction');
    reveal(true);
  }
  function reveal(called, folded) {
    state = 'shown';
    G.folded = !!folded;
    if (!folded) {
      const c = compareHands(G.rMe, G.rHim);
      if (c > 0) { G.chips += G.pot; G.net += G.pot; } else if (c === 0) { G.chips += G.pot / 2; G.net += G.pot / 2; }
      if (G.net > 0) { G.fx.push({ s: '+' + fmt(G.net), x: L().meX + L().mcw + 34, y: L().meY, t: 0, life: 1.3, gold: true }); G.koUntil = performance.now() + 1100; }
      else if (G.net < 0) { G.fx.push({ s: '−' + fmt(-G.net), x: L().meX + L().mcw + 34, y: L().meY, t: 0, life: 1.3, red: true }); G.yayUntil = performance.now() + 1100; }
      if (called && G.action === 'bluff') {
        G.caught++;
        G.fx.push({ s: t('blBluff'), x: L().W / 2, y: L().boardY, t: 0, life: 1.6, gold: true, big: true });
        sound('notifyBigWin');
        if (G.caught === TROPHY_CAUGHT) shell.grant('bluff');
      } else sound(G.net > 0 ? 'notifyRaise' : G.net < 0 ? 'notifyFold' : 'notifyAction');
    } else if (G.action === 'bluff') {
      G.fx.push({ s: t('blBluff'), x: L().W / 2, y: L().boardY, t: 0, life: 1.6, red: true, big: true });
      G.yayUntil = performance.now() + 1100;
    }
    renderHud();
    clearTimeout(timer);
    timer = setTimeout(goOn, 3200);
  }
  function goOn() {
    if (state !== 'shown') return;
    clearTimeout(timer);
    G.say = null;
    deal();
  }
  function finish() {
    clearTimeout(timer);
    state = 'over';
    const score = G.chips, prev = shell.best.get(), record = score > prev;
    if (record) shell.best.set(score);
    if (record && prev) sound('notifyBigWin');
    ace.mood('mc-m-smile'); ace.pose('idle');
    G.result = { score, record, prev };
    renderResult();
  }
  function renderResult() {
    if (state !== 'over' || !G.result) return;
    const { score, record, prev } = G.result;
    shell.panel('<div class="bl-box"><h2>' + esc(fmt(score)) + '</h2><p class="pg-dim">' + esc(t('blChips')) + '</p>'
      + '<p class="ar-final">🎭 ' + fmt(G.caught) + '</p>'
      + '<p class="pg-dim">' + esc(record && prev ? t('arNewRecord') : t('arRecord', { n: fmt(Math.max(score, prev)) })) + '</p>'
      + '<p class="pg-blink">' + esc(t('gmAgain')) + '</p></div>', true);
  }

  // ── Layout (world px) ─────────────────────────────────────────────
  function L() {
    const W = shell.W, H = shell.H;
    let top = 46;
    try { top = Math.max(40, shell.hud.offsetHeight / (shell.k || 1) + 6); } catch (e) {}
    const narrow = W < 430, gap = 5;
    const btnH = 34, btnY = H - btnH / 2 - 10;
    const cw = Math.min(narrow ? 40 : 52, (W - 16 - 4 * gap) / 5), ch = cw * 1.4;
    const hcw = narrow ? 30 : 36, hch = hcw * 1.4;          // the Ace's cards
    const mcw = narrow ? 44 : 52, mch = mcw * 1.4;          // yours
    const s = narrow ? 0.3 : 0.34;
    const aceFeet = top + 212 * s + 6;
    const himY = aceFeet - hch / 2 - 6;
    const meY = btnY - btnH / 2 - 26 - mch / 2;
    const boardY = (aceFeet + 14 + meY - mch / 2 - 22) / 2;
    return { W, H, narrow, top, gap, cw, ch, hcw, hch, mcw, mch, s, aceX: W / 2 - (narrow ? 40 : 56), aceFeet, himX: W / 2 + (narrow ? 26 : 36), himY, boardY, meX: W / 2, meY, btnY, btnH };
  }
  function layoutButtons(l) {
    btns.reset();
    if (state === 'decide' || state === 'deal' || state === 'check') {
      const w = Math.min(160, (l.W - 30) / 2), off = state !== 'decide';
      btns.add({ id: 'fold', x: l.W / 2 - w / 2 - 6, y: l.btnY, w, h: l.btnH, label: 'Fold', kind: 'red', key: '↓', off });
      btns.add({ id: 'call', x: l.W / 2 + w / 2 + 6, y: l.btnY, w, h: l.btnH, label: 'Call' + (G.bet && state === 'decide' ? ' ' + fmt(G.bet) : ''), key: 'Space', off });
    }
  }

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'title') { if (a === 'jump') start(); return; }
    if (state === 'over') { if (a === 'jump') { state = 'title'; ace.pose('idle'); ace.mood('mc-m-smile'); titlePanel(); } return; }
    if (state === 'shown') { if (a === 'jump') goOn(); return; }
    if (state !== 'decide') return;
    const l = L();
    layoutButtons(l);
    if (info.x != null) { const b = btns.hit(info.x, info.y); if (b) decide(b === 'call'); return; }
    if (a === 'duck') decide(false);
    else if (a === 'left' || a === 'right') G.focus = G.focus === 'call' ? 'fold' : 'call';
    else if (a === 'jump') decide(info.code === 'Space' ? true : G.focus === 'call');
  }

  function update(dt) {
    time += dt;
    if (!G) return;
    stepFloaters(G.fx, dt);
    if (G.say) { G.say.t += dt; if (G.say.t > G.say.life) G.say = null; }
    if (state === 'title' || state === 'over') return;
    const now = performance.now();
    // His face: the tell while he waits for your answer, else his mood.
    const tl = state === 'decide' ? G.show : '';
    let mood = tl === 'fierce' ? 'mc-m-fierce' : tl === 'cool' ? 'mc-m-cool' : tl === 'grin' ? 'mc-m-yay' : 'mc-m-smile';
    let pose = tl === 'fidget' ? 'balance' : tl === 'wave' ? 'wave' : 'idle';
    if (state === 'shown') {
      if (now < G.koUntil) mood = 'mc-m-ko';
      else if (now < G.yayUntil) { mood = 'mc-m-yay'; pose = 'wave'; }
    }
    ace.mood(mood); ace.pose(pose);
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
    ace.place(l.aceX, l.aceFeet, l.s, shell.k);
    if (state !== 'title' && G.board.length) {
      const shown = state === 'shown' && !G.folded, cmp = shown ? compareHands(G.rMe, G.rHim) : 0;
      const lit = new Set(shown ? (cmp >= 0 ? G.rMe.best : []).concat(cmp <= 0 ? G.rHim.best : []) : []);
      const openHim = state === 'shown';
      // His two cards.
      for (let k = 0; k < 2; k++) {
        const x = l.himX + (k - 0.5) * (l.hcw + 4);
        if (openHim) card(g, G.him[k], x, l.himY, l.hcw, l.hch, shown && lit.has(G.him[k]), shown && !lit.has(G.him[k]));
        else drawBackCard(g, img, x, l.himY, l.hcw, l.hch);
      }
      if (openHim) {
        const label = t(NAME_KEYS[G.rHim.cat]);
        g.fillStyle = shown && cmp < 0 ? '#f5d77a' : 'rgba(245,240,227,.75)';
        if (l.narrow) { g.textAlign = 'center'; g.textBaseline = 'top'; fitFont(g, label, W / 2 - 10, 11, 700); g.fillText(label, l.himX, l.himY + l.hch / 2 + 4); }
        else { const lx = l.himX + l.hcw + 8; g.textAlign = 'left'; g.textBaseline = 'middle'; fitFont(g, label, W - lx - 6, 12, 700); g.fillText(label, lx, l.himY); }
      }
      // A drop of sweat: one of his tells.
      if (state === 'decide' && G.show === 'sweat') {
        const y = l.aceFeet - 212 * l.s * 0.8 + ((time * 22) % 14);
        g.save(); g.globalAlpha = 0.9; g.fillStyle = '#7fc8ff';
        g.beginPath(); g.moveTo(l.aceX + 16, y - 6); g.quadraticCurveTo(l.aceX + 21, y + 1, l.aceX + 16, y + 3); g.quadraticCurveTo(l.aceX + 11, y + 1, l.aceX + 16, y - 6); g.fill();
        g.restore();
      }
      // The board.
      for (let i = 0; i < 5; i++) card(g, G.board[i], W / 2 + (i - 2) * (l.cw + l.gap), l.boardY, l.cw, l.ch, shown && lit.has(G.board[i]), shown && !lit.has(G.board[i]));
      // The pot.
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 13px Inconsolata, monospace'; g.fillStyle = '#f5d77a';
      const potNow = G.pot + (state === 'decide' ? G.bet : 0);
      g.fillText('◉ ' + fmt(potNow), W / 2, l.boardY + l.ch / 2 + 12);
      // Your two cards.
      for (let k = 0; k < 2; k++) card(g, G.me[k], l.meX + (k - 0.5) * (l.mcw + 5), l.meY, l.mcw, l.mch, shown && lit.has(G.me[k]), shown && !lit.has(G.me[k]));
      const myName = t(NAME_KEYS[G.rMe.cat]);
      g.fillStyle = shown && cmp > 0 ? '#f5d77a' : 'rgba(245,240,227,.8)'; g.textAlign = 'center'; g.textBaseline = 'top';
      fitFont(g, myName, W - 20, 11, 700); g.fillText(myName, l.meX, l.meY + l.mch / 2 + 4);
      layoutButtons(l);
      btns.draw(g, keyboardFirst(), keyboardFirst() && state === 'decide' ? G.focus : null);
    }
    if (G && G.say && state !== 'title') {
      const a = G.say.t < 0.2 ? G.say.t / 0.2 : G.say.t > G.say.life - 0.4 ? Math.max(0, (G.say.life - G.say.t) / 0.4) : 1;
      bubble(g, G.say.s, l.himX, l.himY - l.hch / 2 - 4, W, a);
    }
    if (G) drawFloaters(g, G.fx);
  }

  return {
    update, draw, input, resize: renderResult,
    running: () => state !== 'title' && state !== 'over',
    destroy() { clearTimeout(timer); ace.remove(); },
  };
}

function ensureCss() {
  if (document.getElementById('pth-game-bl-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-bl-css';
  st.textContent = '#pth-game .bl-box{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 18px;border-radius:12px;'
    + 'background:rgba(11,18,16,.9);box-shadow:0 0 0 1px rgba(216,178,90,.35),0 10px 30px rgba(0,0,0,.45);max-width:calc(100% - 16px)}'
    + '#pth-game .bl-box h2{color:#f5d77a}'
    + '#pth-game.pg-light .bl-box{background:rgba(250,247,240,.96);box-shadow:0 0 0 1px rgba(140,105,20,.4),0 10px 26px rgba(0,0,0,.18)}'
    + '#pth-game.pg-light .bl-box h2{color:#8a6510}#pth-game.pg-light .bl-box .ar-final{color:#1d222b}';
  document.head.appendChild(st);
}
