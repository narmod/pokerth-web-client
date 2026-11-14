// @ts-check
// ═══════════════════════════════════════════════════════════════════
// House of Cards — hidden mini-game (web extension, narmod 2026-10-16),
// in the arcade menu behind the training nickname « mascot » (index.mjs).
//
// A card slides along the dealer's rail; a tap drops it on its place in the
// house. A floor is five cards, the real way: two A-frames of two leaning
// cards and a flat card across them — so every floor is a poker hand
// (poker-hand.mjs, the Joker is wild), paid 20 × its multiplier; a Perfect
// drop adds 5 (10, 15 in a row).
//   Tilt      every drop off its mark leans the house (the « Tilt » gauge);
//             a Perfect drop steadies it; at 100 % it all comes down
//   Straight, Flush   steady the house (tilt halved)
//   Full or better    tilt back to zero, the Ace crowned, the All-In fanfare
//   Burn      ↓ / swipe down: the hanging card is burnt, the next one comes
//             (3 per game, one more at every blind level, 5 at most)
//   Blinds up every 5 floors: the rail runs faster; from the second level
//             it swings like a pendulum (fastest in the middle)
//   Aim       the place of the next card is lit, with a mark on the rail
//   Pot       chips stacked on each floor's flat card, more for a better hand
//   Showdown  when it falls, the best floor's five cards are turned one by one
// The Ace lives in the house: he stands on the last floor (drawn behind the
// cards, a second canvas above him), climbs when a floor is done, balances
// when it leans, and goes down with it. Secret trophy at 10 floors.
//
// web.52 (narmod: « all of the proposals », 1-9):
//   1 Portrait   the stage may be tall (aspect 0.6, games/index.mjs): the
//                tower fills a phone; the rail fits the width (railAmp()).
//   2 Venue      the club's room at the foot of the tower (Ace Runner's
//                scenery), its ceiling and chandeliers higher up, then the
//                night (or a blue sky) above the roof.
//   3 The Ace    squashes when a card lands, winks at a Perfect, grins at a
//                hand, panics when it leans (aceActor fx / look).
//   4 Hold       ← / → / 1 or a tap on the box at the left of the rail: the
//                hanging card is kept aside (or swapped), once per drop.
//   5 Goal       each floor asks for a hand (« 🎯 Three of a kind + »): met,
//                the floor pays double.
//   6 Bonuses    the Joker always lands Perfect; a gold card doubles its
//                floor; the glue pot (from level 2) stops the tilt for GLUE_MS.
//   7 Hazards    a draught pushes the falling card (from level WIND_LV), the
//                waiter bumps the table (from level BUMP_LV).
//   8 Modes      Free game, Daily challenge (the same cards for everyone today,
//                pth_hc_daily) and Zen (no collapse, no hazard, ZEN_FLOORS
//                floors; pth_hc_best.zen).
//   9 Collapse   the cards flutter and spin down, the camera follows them to
//                the table before the showdown.
// ═══════════════════════════════════════════════════════════════════

import { evalCards, JOKER, NAME_KEYS } from './poker-hand.mjs';
import { CHIP, fmt, backUrl, cardHtml, imageCache, rr, drawFace, aceActor, ink } from './common.mjs';
import { drawScenery } from './runner-scenery.mjs';
import { rng } from './deal.mjs';
import { dayKey } from './solitaire-rules.mjs';

const CW = 30, CH = 42;          // a leaning card
const LEAN = 18 * Math.PI / 180;
const FH = 46;                   // floor height: A-frames (40) + flat card (6)
const BRIDGE_W = 78, BRIDGE_H = 6;
const FRAME_X = 30;              // the two A-frames' apexes, either side of the centre
const RAIL_Y = 64;               // screen y of the dealer's rail
const HANG = 34;                 // card centre below the rail
const S = 0.25;                  // the Ace's sprite scale: he fits under a floor
const BLIND_EVERY = 5;           // floors per blind level
const TROPHY_FLOORS = 10;
const PERFECT = 2;               // px off the mark that still counts as Perfect
const MISS_TILT = 0.25;          // a card off its mark: four of them bring it down
const OFF_TILT = 0.14;           // a card on its mark but not Perfect (× how far off)
export const GLUE = -2;          // the glue pot, carried by the trolley instead of a card
export const GOLD_P = 0.08, GLUE_P = 0.06, GLUE_MS = 8000;
export const WIND_LV = 3, BUMP_LV = 4, ZEN_FLOORS = 10;
const ROOM_H = 300, ROOF_Y = 1100;   // the club's room, then the roof (world px above the table)
const BOX_W = 22, BOX_H = 31;    // the hold and next boxes beside the rail
const DAILY_KEY = 'pth_hc_daily', BEST_KEY = 'pth_hc_best';

export const MODES = [
  { id: 'free', icon: '🃏', key: 'psFree', desc: 'hcModeFreeD' },
  { id: 'daily', icon: '📅', key: 'psDaily', desc: 'hcModeDailyD' },
  { id: 'zen', icon: '🧘', key: 'hcModeZen', desc: 'hcModeZenD' },
];
/** The hand a floor asks for (a category, 1 pair … 6 full house), by blind level. */
export function goalFor(level, r) {
  const pool = level <= 1 ? [1, 1, 2] : level === 2 ? [1, 2, 2, 3] : level <= 4 ? [2, 3, 3, 4, 5] : [3, 4, 5, 6];
  return pool[Math.floor(r * pool.length)];
}
/** What a finished floor pays: 20 × the hand, × 2 if its goal is met, × 2 with a gold card. */
export function floorPay(ev, goal, gold) { return 20 * ev.mult * (ev.cat >= goal ? 2 : 1) * (gold ? 2 : 1); }

// Slot i of a floor: centre (x, y above the floor's base), angle, size.
function slot(i) {
  if (i === 4) return { x: 0, y: 40 + BRIDGE_H / 2, rot: 0, w: BRIDGE_W, h: BRIDGE_H, tol: 13 };
  const ax = i < 2 ? -FRAME_X : FRAME_X, right = i % 2 === 1;
  const off = CH / 2 * Math.sin(LEAN);
  return { x: right ? ax + 13 - off : ax - 13 + off, y: CH / 2 * Math.cos(LEAN), rot: right ? -LEAN : LEAN, w: CW, h: CH, tol: 10 };
}
/** 52 cards and the Joker, shuffled with R. */
function deckWith(R) {
  const d = [];
  for (let n = 0; n < 52; n++) d.push(n);
  for (let j = d.length - 1; j > 0; j--) { const x = Math.floor(R() * (j + 1)); const t = d[j]; d[j] = d[x]; d[x] = t; }
  d.splice(d.length - 6 - Math.floor(R() * 30), 0, JOKER);
  return d;
}
function loadJ(k) { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } }
function saveJ(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

export function create(shell) {
  const { t, esc, sound } = shell;
  const img = imageCache();
  const back = backUrl();
  const ace = aceActor(shell.layer);
  // Cards in front of the Ace: a second canvas above him.
  const fgCanvas = document.createElement('canvas');
  fgCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  shell.layer.appendChild(fgCanvas);
  const fg = /** @type {CanvasRenderingContext2D} */ (fgCanvas.getContext('2d'));

  shell.hud.innerHTML = '<div class="ar-stats">'
    + '<div><div class="ar-lab">' + esc(t('hcFloors')) + '</div><div class="ar-num hc-floors">0</div></div>'
    + '<div><div class="ar-lab">' + esc(t('hcScore')) + '</div><div class="ar-num hc-score">0</div></div>'
    + '<div><div class="ar-lab">Tilt</div><div class="hc-tilt"><i></i></div><div class="hc-burn">🔥 3</div></div></div>'
    + '<div class="ar-hand"><div class="ar-slots"></div><div class="ar-name"></div><div class="ar-name hc-goal"></div></div>';
  if (!document.getElementById('pth-game-house-css')) {
    const st = document.createElement('style'); st.id = 'pth-game-house-css';
    st.textContent = '#pth-game .hc-tilt{width:64px;height:8px;margin-top:5px;border-radius:4px;background:rgba(245,240,227,.12);overflow:hidden}'
      + '#pth-game .hc-tilt i{display:block;height:100%;width:0;border-radius:4px;background:#3fae6a;transition:width .2s,background .2s}'
      + '#pth-game .hc-tilt.glued i{background:#e0a33a !important;box-shadow:0 0 6px #f5c518}'
      + '#pth-game .hc-burn{margin-top:5px;font:700 12px/1 Inconsolata,monospace;color:#f5f0e3}'
      + '#pth-game .hc-goal{opacity:.95}#pth-game .hc-goal.met{color:#7ee2a0}'
      + '#pth-game .gm-tile .hc-rec{color:#d8b25a}#pth-game.pg-light .gm-tile .hc-rec{color:#8a6a10}'
      + '@media (max-width:520px){#pth-game .hc-tilt{width:44px}}';
    document.head.appendChild(st);
  }
  const q = (s) => /** @type {HTMLElement} */ (shell.hud.querySelector(s));
  const hFloors = q('.hc-floors'), hScore = q('.hc-score'), hTiltBox = q('.hc-tilt'), hTilt = q('.hc-tilt i'), hBurn = q('.hc-burn');
  const hSlots = q('.ar-slots'), hName = q('.ar-name'), hGoal = q('.hc-goal');

  const stars = [], clouds = [];
  for (let i = 0; i < 110; i++) stars.push({ x: Math.random() * 900 - 450, y: ROOF_Y + Math.random() * 3000, r: Math.random() * 1.3 + 0.3 });
  for (let i = 0; i < 14; i++) clouds.push({ x: Math.random() * 900 - 450, y: ROOF_Y + 150 + Math.random() * 2600, w: 50 + Math.random() * 70 });

  let state = 'title', G = null, revealTimer = 0, time = 0, sel = 0, mode = 'free';
  let R = Math.random;
  // The rail runs just below the HUD (taller, relative to the stage, on a phone).
  let railY = RAIL_Y;
  const measureRail = () => { try { railY = Math.max(RAIL_Y, shell.hud.offsetHeight / (shell.k || 1) + 14); } catch (e) {} };

  function newRun() {
    R = mode === 'daily' ? rng('hc-' + dayKey()) : Math.random;
    G = { level: 1, floors: [], cur: [], deck: deckWith(R), card: null, next: null, hold: null, canHold: true, burns: 3, tilt: 0, score: 0, streak: 0,
      railX: 0, railDir: 1, fall: null, camY: 0, aceY: 0, aceHop: 0, fx: [], debris: [], banner: null,
      crownUntil: 0, yayUntil: 0, best: null, overAt: 0, goal: 1, glueUntil: 0, wind: null, windNext: 0, bumpNext: 0, shake: 0,
      descend: false, mode, pan: 0 };
    G.card = deal(); G.next = deal();
    G.goal = goalFor(1, R());
    renderHud();
  }
  /** The next thing on the trolley: a card (maybe gold), or the glue pot. */
  function deal() {
    if (!G.deck.length) G.deck = deckWith(R);
    if (G.level >= 2 && mode !== 'zen' && R() < GLUE_P) return { n: GLUE, gold: false };
    const n = /** @type {number} */ (G.deck.pop());
    return { n, gold: n !== JOKER && R() < GOLD_P };
  }
  const zen = () => mode === 'zen';
  const glued = () => performance.now() < G.glueUntil;
  const slotNow = () => G.cur.length;              // next slot of the floor being built
  const ampBase = () => Math.min(140, 72 + G.level * 6);
  /** The rail's half length: as before on a wide stage, fitted to a narrow one
   *  (room for the hold box on the left and the next card on the right). */
  const railAmp = () => Math.max(40, Math.min(ampBase(), W() / 2 - 50));
  const speed = () => Math.min(250, 92 + (G.level - 1) * 20) * railAmp() / ampBase();
  // From the second blind level the trolley swings like a pendulum: slow at
  // the ends of the rail, fastest in the middle — where the places are.
  const pace = (x, A) => (G.level < 2 ? 1 : 0.55 + 0.9 * (1 - (x / A) * (x / A)));
  const W = () => shell.W, H = () => shell.H;
  const groundY = () => H() - 30;
  const sy = (wy) => groundY() - (wy - G.camY);
  // How far the house leans at height wy (world px), sway included (none when glued).
  const shift = (wy) => (G.tilt * 5 + (G && glued() ? 0 : Math.sin(time * 1.8) * Math.abs(G.tilt) * 1.6)) * (wy / FH);
  // When the house leans further than the rail can reach (a tall house on a
  // narrow stage), the camera follows its top sideways (G.pan, world px).
  const panTarget = () => {
    if (state !== 'run') return G.pan;
    const lean = G.tilt * 5 * G.floors.length, k = Math.max(0, railAmp() - 46);
    return lean - Math.max(-k, Math.min(k, lean));
  };
  const holdBox = () => ({ x: W() / 2 - railAmp() - 34, y: railY + 26 });
  const nextBox = () => ({ x: W() / 2 + railAmp() + 34, y: railY + 26 });

  function renderHud() {
    hFloors.textContent = String(G.floors.length);
    hScore.textContent = fmt(G.score);
    const a = Math.min(1, Math.abs(G.tilt));
    hTilt.style.width = Math.round(a * 100) + '%';
    hTilt.style.background = a < 0.4 ? '#3fae6a' : a < 0.7 ? '#e0a33a' : '#d2453b';
    hTiltBox.classList.toggle('glued', glued());
    hBurn.textContent = '🔥 ' + G.burns + (glued() ? '  🍯 ' + Math.ceil((G.glueUntil - performance.now()) / 1000) : '');
    const cards = G.cur.map((c) => c.n);
    let h = '';
    for (let i = 0; i < 5; i++) h += cards[i] != null ? cardHtml(cards[i], 'sm') : '<div class="ar-slot"></div>';
    hSlots.innerHTML = h;
    const ev = evalCards(cards);
    hName.innerHTML = ev.nameKey ? esc(t(ev.nameKey)) + ' <b>×' + ev.mult + '</b>' : '';
    const met = cards.length >= 2 && ev.cat >= G.goal;
    hGoal.textContent = '🎯 ' + t(NAME_KEYS[G.goal]) + ' +';
    hGoal.classList.toggle('met', met);
    measureRail();
  }

  function records() {
    const d = loadJ(DAILY_KEY), b = loadJ(BEST_KEY);
    return { free: shell.best.get(), daily: d.d === dayKey() ? d.s || 0 : 0, zen: b.zen || 0 };
  }
  function titlePanel() {
    const rec = records();
    const tile = (m, i) => '<button type="button" class="gm-tile' + (i === sel ? ' on' : '') + '" data-m="' + i + '"><i>' + m.icon + '</i><b>'
      + esc(t(m.key)) + '</b><small>' + esc(t(m.desc)) + '</small><small class="hc-rec">'
      + (rec[m.id] ? esc(t('arRecord', { n: fmt(rec[m.id]) })) : '&nbsp;') + '</small></button>';
    shell.panel('<h2>' + esc(t('hcName')) + '</h2><p>' + esc(t('hcHint')) + '</p><div class="gm-tiles">' + MODES.map(tile).join('') + '</div>');
    shell.root.querySelectorAll('.pg-panel .gm-tile').forEach((b) => {
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', () => { sel = +(b.getAttribute('data-m') || 0); start(); });
    });
  }
  newRun();
  titlePanel();
  ace.pose('idle');
  // Browser tests only (navigator.webdriver): reach the run state.
  try { if (navigator.webdriver) window.__pthHouse = { run: () => G, state: () => state, mode: () => mode, start: (m) => { sel = Math.max(0, MODES.findIndex((x) => x.id === m)); start(); } }; } catch (e) {}

  function start() {
    clearTimeout(revealTimer);
    mode = MODES[sel].id;
    newRun(); state = 'run'; shell.panel(null);
    G.windNext = time + 9 + R() * 5; G.bumpNext = time + 16 + R() * 8;
    ace.king(false); ace.mood('mc-m-smile'); ace.pose('idle');
    try { if (typeof window.resetBlindRaises === 'function') window.resetBlindRaises(); } catch (e) {}
  }

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (!down) return;
    if (state === 'title') {
      const step = a === 'left' ? -1 : a === 'right' || a === 'duck' ? 1 : 0;
      if (step) { sel = (sel + step + MODES.length) % MODES.length; titlePanel(); return; }
      if (a === 'jump') start();
      return;
    }
    if (a === 'jump') {
      if (state === 'over' && performance.now() > G.overAt + 900 && !G.descend) { start(); return; }
      if (state !== 'run') return;
      // A tap on the hold box keeps the card; anywhere else drops it.
      if (info && info.x != null) {
        const b = holdBox();
        if (Math.abs(info.x - b.x) < BOX_W && Math.abs(info.y - b.y) < BOX_H) { hold(); return; }
      }
      if (!G.fall) {
        const n = G.card;
        G.fall = { n: n.n, gold: n.gold, slot: slotNow(), x: G.railX + G.pan, wy: screenToWorld(railY + HANG + (slotNow() === 4 ? -12 : 0)), vy: 0 };
        G.card = G.next; G.next = deal(); G.canHold = true;
      }
    } else if ((a === 'left' || a === 'right' || a === 'n1') && state === 'run') hold();
    else if (a === 'duck' && state === 'run' && !G.fall) {
      if (G.burns <= 0) { G.fx.push({ s: '🔥 0', x: G.railX, y: railY + HANG + 30, t: 0, life: 0.7, screen: true }); return; }
      G.burns--;
      if (G.card.n !== GLUE) G.debris.push(debrisOf(G.card.n, G.railX + G.pan, worldOf(railY + HANG), 0.2, true));
      G.fx.push({ s: '🔥', x: G.railX, y: railY + HANG, t: 0, life: 0.8, screen: true, big: true });
      G.card = G.next; G.next = deal(); G.canHold = true;
      sound('notifyFold'); ace.fx('hop');
      renderHud();
    }
  }
  /** Keep the hanging card aside (or swap it with the one kept): once per drop. */
  function hold() {
    if (G.fall || !G.canHold) { if (!G.canHold) G.fx.push({ s: '✋', x: holdBox().x - W() / 2, y: holdBox().y + 26, t: 0, life: 0.6, screen: true }); return; }
    if (G.hold) { const k = G.hold; G.hold = G.card; G.card = k; }
    else { G.hold = G.card; G.card = G.next; G.next = deal(); }
    G.canHold = false;
    sound('notifyAction'); ace.fx('hop');
  }
  const screenToWorld = (y) => groundY() - y + G.camY;
  const worldOf = screenToWorld;

  // ── Play ──────────────────────────────────────────────────────────
  function debrisOf(n, x, wy, rot, burnt) {
    return { n, x, wy, rot, vx: (Math.random() - 0.5) * 120, vy: 60 + Math.random() * 120, vr: (Math.random() - 0.5) * 8, t: 0, burnt: !!burnt,
      w: CW, h: CH, ph: Math.random() * 6, fl: 0 };
  }
  function land(f) {
    const sl = slot(f.slot);
    const base = G.floors.length * FH;
    if (f.n === GLUE) {
      // The glue pot: the house holds still for a while.
      G.glueUntil = performance.now() + GLUE_MS;
      G.fx.push({ s: '🍯 ' + t('hcGlue'), x: 0, wy: base + 60, t: 0, life: 1.3, gold: true });
      sound('notifyRaise'); ace.fx('cheer'); ace.look('mc-m-grin', 800, 0);
      renderHud();
      return;
    }
    const target = sl.x + shift(base + sl.y);
    // The Joker always lands Perfect: it slides onto its place.
    const d = f.n === JOKER ? 0 : f.x - target;
    if (Math.abs(d) > sl.tol) {
      // Off its mark: it slides off and the house takes the knock (not when glued).
      G.debris.push(Object.assign(debrisOf(f.n, f.x, base + sl.y, sl.rot), f.slot === 4 ? { w: BRIDGE_W, h: BRIDGE_H } : {}));
      if (!glued()) G.tilt += Math.sign(d) * MISS_TILT;
      G.streak = 0;
      G.fx.push({ s: '✗', x: f.x, wy: base + sl.y + 20, t: 0, life: 0.7, red: true });
      sound('notifyFold'); ace.fx('shiver'); ace.look('mc-m-scared', 700, 0);
    } else {
      const perfect = Math.abs(d) <= PERFECT;
      G.cur.push({ n: f.n, dx: d, gold: !!f.gold });
      ace.fx('land');
      if (perfect) {
        G.streak++;
        G.tilt *= 0.85;
        G.score += 5 * Math.min(G.streak, 3);
        G.fx.push({ s: t('hcPerfect') + (G.streak > 1 ? ' ×' + G.streak : ''), x: target, wy: base + sl.y + 34, t: 0, life: 0.9, gold: true, small: true });
        if (G.streak >= 2) ace.look('mc-m-wink', 650, 0);
      } else {
        G.streak = 0;
        if (!glued()) G.tilt += (d / sl.tol) * OFF_TILT;
      }
      if (f.gold) G.fx.push({ s: '★ ' + t('hcGold'), x: target, wy: base + sl.y + 50, t: 0, life: 1.1, gold: true, small: true });
      sound('notifyCard');
      if (G.cur.length === 5) floorDone();
    }
    if (zen()) G.tilt = Math.max(-0.9, Math.min(0.9, G.tilt));
    renderHud();
    if (Math.abs(G.tilt) >= 1) collapse();
  }
  function floorDone() {
    const cards = G.cur.map((c) => c.n);
    const ev = evalCards(cards);
    const gold = G.cur.some((c) => c.gold), met = ev.cat >= G.goal;
    const pts = floorPay(ev, G.goal, gold);
    G.score += pts;
    G.floors.push({ cards: G.cur, ev, gold, met });
    G.cur = [];
    const top = G.floors.length * FH;
    G.fx.push({ s: t(ev.nameKey) + '  +' + pts, x: 0, wy: top + 64, t: 0, life: 1.4, gold: ev.cat >= 1 });
    if (met) G.fx.push({ s: '🎯 ' + t('hcGoalMet') + ' ×2', x: 0, wy: top + 82, t: 0, life: 1.4, gold: true, small: true });
    if (ev.cat >= 6) {
      G.tilt = 0; G.crownUntil = performance.now() + 3000;
      G.fx.push({ s: 'ALL-IN!', x: 0, wy: top + 104, t: 0, life: 1.4, gold: true, big: true });
      sound('notifyAllIn'); ace.fx('cheer'); ace.look('mc-m-cool', 1300, 0);
    } else if (ev.cat >= 4) {
      G.tilt *= 0.5;
      G.fx.push({ s: t('hcSteady'), x: 0, wy: top + 100, t: 0, life: 1.2, gold: true });
      sound('notifyRaise'); ace.fx('cheer'); ace.look('mc-m-yay', 1000, 0);
    } else if (ev.cat >= 1) { sound('notifyRaise'); ace.fx('cheer'); ace.look(met ? 'mc-m-love' : 'mc-m-grin', 900, 0); }
    if (!G.best || ev.cat > G.best.ev.cat || (ev.cat === G.best.ev.cat && pts > G.best.pts)) G.best = { ev, pts };
    G.yayUntil = performance.now() + 700;
    G.aceHop = 1;                                   // he climbs to the new floor
    if (G.floors.length === TROPHY_FLOORS) shell.grant('house');
    if (G.floors.length % BLIND_EVERY === 0) {
      G.level++;
      G.burns = Math.min(5, G.burns + 1);
      G.banner = { s: t('arBlinds'), sub: String(G.level), t: 0 };
      sound('notifyBlindsUp');
    }
    G.goal = goalFor(G.level, R());
    if (zen() && G.floors.length >= ZEN_FLOORS) finish(false);
  }
  /** It all comes down: the cards flutter down, the camera follows them. */
  function collapse() {
    G.floors.forEach((f, i) => f.cards.forEach((c, j) => {
      const sl = slot(j), wy = i * FH + sl.y;
      G.debris.push(Object.assign(debrisOf(c.n, sl.x + c.dx + shift(wy), wy, sl.rot), j === 4 ? { w: BRIDGE_W, h: BRIDGE_H } : {},
        { vx: (G.tilt > 0 ? 1 : -1) * (20 + Math.random() * 70) + (Math.random() - 0.5) * 60, vy: 40 + Math.random() * 180,
          vr: (Math.random() - 0.5) * 14, fl: shell.reduced ? 0 : 30 + Math.random() * 50 }));
    }));
    G.cur.forEach((c, j) => {
      const sl = slot(j), wy = G.floors.length * FH + sl.y;
      G.debris.push(Object.assign(debrisOf(c.n, sl.x + c.dx + shift(wy), wy, sl.rot), { fl: shell.reduced ? 0 : 40 }));
    });
    for (const d of G.debris) d.x -= G.pan;
    G.pan = 0; G.tilt = 0;
    finish(true);
  }
  function finish(fell) {
    state = 'over'; G.overAt = performance.now();
    const floorsN = G.floors.length;
    if (fell) { G.floors = []; G.cur = []; G.descend = G.camY > 30 && !shell.reduced; ace.king(false); ace.pose('ko'); ace.mood('mc-m-ko'); sound('notifyFold'); }
    else { ace.pose('wave'); ace.mood('mc-m-yay'); sound('notifyBigWin'); }
    shell.ended();
    const score = G.score;
    let prevBest = 0;
    if (mode === 'free') { prevBest = shell.best.get(); if (score > prevBest) shell.best.set(score); }
    else if (mode === 'daily') { const d = loadJ(DAILY_KEY), day = dayKey(); prevBest = d.d === day ? d.s || 0 : 0; if (score > prevBest) saveJ(DAILY_KEY, { d: day, s: score }); }
    else { const b = loadJ(BEST_KEY); prevBest = b.zen || 0; if (score > prevBest) { b.zen = score; saveJ(BEST_KEY, b); } }
    try { localStorage.setItem('pth_game_played_house', '1'); } catch (e) {}
    const record = score > prevBest;
    const cards = G.best ? G.best.ev.best : [];
    const tail = '<div class="ar-final">' + fmt(floorsN) + ' · <em>' + fmt(score) + '</em></div>'
      + '<p class="pg-dim">' + esc(record && prevBest ? t('arNewRecord') : t('arRecord', { n: fmt(Math.max(score, prevBest)) })) + '</p>'
      + '<p class="pg-blink">' + esc(t('hcAgain')) + '</p>';
    let shown = 0;
    const head = fell ? t('hcCollapse') : '🏰 ' + fmt(floorsN) + ' ' + t('hcFloors');
    const paint = () => {
      let row = '';
      for (let i = 0; i < cards.length; i++) row += i < shown ? cardHtml(cards[i], 'lg') : '<div class="pk lg back"></div>';
      const hand = !cards.length ? '&nbsp;' : shown >= cards.length ? esc(t(G.best.ev.nameKey)) : '&nbsp;';
      shell.panel('<h2>' + esc(head) + '</h2>' + (cards.length ? '<div class="ar-show">' + row + '</div>' : '')
        + '<p>' + hand + '</p>' + (shown >= cards.length ? tail : ''));
    };
    const next = () => {
      if (state !== 'over') return;
      if (G.descend) { revealTimer = setTimeout(next, 120); return; }   // the camera is still going down
      paint();
      if (shown < cards.length) revealTimer = setTimeout(() => { shown++; sound('notifyCard'); next(); }, shown ? 260 : 700);
      else if (record && prevBest) sound('notifyBigWin');
    };
    revealTimer = setTimeout(next, 900);
  }

  // ── Hazards (free and daily, not Zen) ─────────────────────────────
  function hazards() {
    if (zen()) return;
    if (G.level >= WIND_LV && !G.wind && time >= G.windNext) {
      const dir = R() < 0.5 ? -1 : 1;
      G.wind = { v: dir * (26 + R() * 22), until: time + 2.6 };
      G.fx.push({ s: dir > 0 ? '≋ ' + t('hcWind') + ' →' : '← ' + t('hcWind') + ' ≋', x: 0, y: railY + 74, t: 0, life: 1.6, screen: true, gold: true });
      sound('notifyAction');
    }
    if (G.wind && time >= G.wind.until) { G.wind = null; G.windNext = time + 9 + R() * 6; }
    if (G.level >= BUMP_LV && time >= G.bumpNext) {
      G.bumpNext = time + 16 + R() * 9;
      if (glued()) { G.fx.push({ s: '🍯', x: 0, y: railY + 90, t: 0, life: 0.9, screen: true }); return; }
      G.tilt += (R() < 0.5 ? -1 : 1) * 0.1; G.shake = 0.45;
      G.fx.push({ s: t('hcBump'), x: 0, y: railY + 90, t: 0, life: 1.3, screen: true, red: true });
      sound('notifyFold'); ace.fx('wobble'); ace.look('mc-m-scared', 800, 0);
      renderHud();
      if (Math.abs(G.tilt) >= 1) collapse();
    }
  }

  function update(dt) {
    time += dt;
    // The rail runs back and forth at a steady pace (title screen included).
    const A = railAmp();
    G.railX += G.railDir * speed() * pace(G.railX, A) * dt;
    if (G.railX > A) { G.railX = A; G.railDir = -1; }
    if (G.railX < -A) { G.railX = -A; G.railDir = 1; }
    if (state === 'run') {
      hazards();
      if (G.fall) {
        const f = G.fall;
        f.vy += 1500 * dt; f.wy -= f.vy * dt;
        if (G.wind) f.x += G.wind.v * dt;
        const base = G.floors.length * FH, sl = slot(f.slot);
        if (f.wy <= base + (f.n === GLUE ? 30 : sl.y)) { G.fall = null; land(f); }
      }
      if (G.glueUntil && Math.floor(time * 4) !== Math.floor((time - dt) * 4)) renderHud();
    }
    G.pan += (panTarget() - G.pan) * Math.min(1, dt * 4);
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt);
    // Camera: the floor being built about two thirds down the screen; after a
    // collapse it goes down with the cards, at a steady pace.
    G.camDy = 0;
    if (G.descend) {
      const c0 = G.camY;
      G.camY = Math.max(0, G.camY - Math.max(260, G.camY * 0.9) * dt);
      G.camDy = G.camY - c0;                        // the falling cards go down with it
      if (G.camY <= 0) G.descend = false;
    } else {
      const camTarget = Math.max(0, G.floors.length * FH - (groundY() - H() * 0.66));
      G.camY += (camTarget - G.camY) * Math.min(1, dt * 3);
    }
    if (state === 'title') return;
    for (let i = G.debris.length - 1; i >= 0; i--) {
      const d = G.debris[i];
      d.t += dt;
      // Fluttering: the air slows them and swings them from side to side.
      if (d.fl) { d.vy -= 300 * dt; d.vy = Math.max(d.vy, G.descend ? -110 : -240); d.vx *= 1 - Math.min(1, 1.4 * dt); d.x += Math.sin(d.t * 5 + d.ph) * d.fl * dt; }
      else d.vy -= 900 * dt;
      d.wy += d.vy * dt + (d.fl ? G.camDy : 0); d.x += d.vx * dt; d.rot += d.vr * dt;
      if (d.wy < -120 || (sy(d.wy) > H() + 60 && !G.descend)) G.debris.splice(i, 1);
    }
    for (let f = G.fx.length - 1; f >= 0; f--) { G.fx[f].t += dt; if (G.fx[f].t > G.fx[f].life) G.fx.splice(f, 1); }
    if (G.banner) { G.banner.t += dt; if (G.banner.t > 1.6) G.banner = null; }
    // The Ace: up one floor after each, balancing when it leans.
    const feet = G.floors.length * FH;
    if (state === 'run') {
      if (G.aceHop > 0) { G.aceHop = Math.max(0, G.aceHop - dt * 2.6); }
      G.aceY = feet - (G.aceHop > 0 ? FH * G.aceHop : 0);
      const now = performance.now(), a = Math.abs(G.tilt);
      ace.pose(G.aceHop > 0 ? 'air' : a > 0.35 ? 'balance' : 'idle');
      ace.mood(now < G.yayUntil ? 'mc-m-yay' : a > 0.7 ? 'mc-m-scared' : a > 0.45 ? 'mc-m-jump' : 'mc-m-smile');
      ace.king(now < G.crownUntil, G.crownUntil - now < 800);
    } else if (G.aceY > 0) {
      G.aceY = Math.max(0, G.aceY - dt * 260);    // down with the house
    }
  }

  // ── Drawing ───────────────────────────────────────────────────────
  function drawBg(g) {
    const w = W(), h = H(), cam = G.camY, light = shell.theme.light;
    // Up the tower: the club's room, its dark ceiling, then the sky above the roof.
    const k = Math.min(1, Math.max(0, (cam - 500) / 700));
    const top = light ? mix([238, 228, 210], [150, 196, 236], k) : mix([20, 16, 14], [7, 10, 26], k);
    const bot = light ? mix([214, 199, 172], [214, 232, 250], k) : mix([34, 26, 20], [16, 22, 44], k);
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, 'rgb(' + top + ')'); sky.addColorStop(1, 'rgb(' + bot + ')');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    // Above the roof: stars at night, clouds by day.
    const roof = sy(ROOF_Y);
    if (roof > 0) {
      if (!light) for (const s of stars) {
        const y = sy(s.y) + cam * 0.5;
        if (y < -4 || y > Math.min(h, roof) + 4) continue;
        g.fillStyle = 'rgba(245,240,227,' + (shell.reduced ? 0.6 : 0.35 + 0.4 * Math.abs(Math.sin(time * 1.3 + s.x))) + ')';
        g.fillRect(w / 2 + s.x * (w / 900), y, s.r, s.r);
      }
      else for (const c of clouds) {
        const y = sy(c.y) + cam * 0.4, x = w / 2 + c.x * (w / 900) + (shell.reduced ? 0 : Math.sin(time * 0.1 + c.y) * 20);
        if (y < -30 || y > roof) continue;
        g.fillStyle = 'rgba(255,255,255,.75)';
        for (const [dx, dy, r] of [[0, 0, c.w * 0.28], [c.w * 0.25, 4, c.w * 0.22], [-c.w * 0.25, 5, c.w * 0.2]]) { g.beginPath(); g.arc(x + dx, y + dy, r, 0, Math.PI * 2); g.fill(); }
      }
      // The moon (or the sun), high up.
      if (k > 0.3) {
        const mx = w * 0.82, my = Math.max(roof - 300, 40);
        g.globalAlpha = Math.min(1, (k - 0.3) * 2);
        g.fillStyle = light ? '#fff4c8' : '#e8ecf8'; g.beginPath(); g.arc(mx, my, 14, 0, Math.PI * 2); g.fill();
        if (!light) { g.fillStyle = 'rgb(' + top + ')'; g.beginPath(); g.arc(mx + 6, my - 4, 12, 0, Math.PI * 2); g.fill(); }
        g.globalAlpha = 1;
      }
    }
    // The ceiling between the room and the roof: dark wood, its beams, the chandeliers.
    const ceilTop = sy(ROOF_Y), ceilBot = sy(ROOM_H);
    if (ceilBot > 0 && ceilTop < h) {
      const y0 = Math.max(0, ceilTop), y1 = Math.min(h, ceilBot);
      g.fillStyle = light ? 'rgba(120,88,58,.28)' : 'rgba(30,20,14,.55)'; g.fillRect(0, y0, w, y1 - y0);
      for (let wy = ROOM_H + 120; wy < ROOF_Y; wy += 160) {
        const by = sy(wy); if (by < -10 || by > h + 10) continue;
        g.fillStyle = light ? 'rgba(110,78,48,.35)' : 'rgba(60,40,26,.6)'; g.fillRect(0, by, w, 7);
      }
      // The roof's edge: a gold cornice.
      if (ceilTop > -6 && ceilTop < h) { g.fillStyle = 'rgba(216,178,90,.7)'; g.fillRect(0, ceilTop, w, 3); g.fillStyle = 'rgba(216,178,90,.35)'; g.fillRect(0, ceilTop + 5, w, 1.5); }
    }
    [[ROOM_H + 140, -1], [ROOM_H + 420, 1], [ROOM_H + 700, -1]].forEach(([wy, side]) => chandelier(g, w / 2 - G.pan + side * Math.min(150, w * 0.32), sy(wy)));
    // The club's room at the foot of the tower (Ace Runner's scenery), its
    // floor the table's line.
    const gy = sy(0);
    if (gy - ROOM_H < h && gy > -20) {
      g.save(); g.translate(0, gy - ROOM_H);
      g.beginPath(); g.rect(0, 0, w, ROOM_H); g.clip();
      drawScenery(g, { w, gy: ROOM_H, scroll: 380 + G.pan, p: light ? 0.5 : 0.92, venue: 0, now: time, reduced: true, C: ink(light) });
      g.restore();
      // The room's ceiling line.
      g.fillStyle = 'rgba(216,178,90,.45)'; g.fillRect(0, gy - ROOM_H, w, 2);
    }
    // The table: felt and its wooden rail.
    if (gy < h + 10) {
      const felt = g.createLinearGradient(0, gy, 0, gy + 30); felt.addColorStop(0, '#24774e'); felt.addColorStop(1, '#174f34');
      g.fillStyle = felt; g.fillRect(0, gy, w, 18);
      g.strokeStyle = 'rgba(216,178,90,.55)'; g.setLineDash([7, 6]); g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, gy + 8); g.lineTo(w, gy + 8); g.stroke(); g.setLineDash([]);
      const rail = g.createLinearGradient(0, gy + 18, 0, gy + 40); rail.addColorStop(0, '#6b4426'); rail.addColorStop(1, '#2a180c');
      g.fillStyle = rail; g.fillRect(0, gy + 18, w, 40);
    }
  }
  function chandelier(g, cx, cy) {
    if (cy < -80 || cy > H() + 40) return;
    g.strokeStyle = 'rgba(216,178,90,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, cy - 200); g.lineTo(cx, cy - 22); g.stroke();
    const glow = g.createRadialGradient(cx, cy, 0, cx, cy, 70);
    glow.addColorStop(0, 'rgba(255,224,150,.28)'); glow.addColorStop(1, 'rgba(255,224,150,0)');
    g.fillStyle = glow; g.fillRect(cx - 70, cy - 70, 140, 140);
    g.fillStyle = '#c9a14a'; g.beginPath(); g.ellipse(cx, cy, 30, 7, 0, 0, Math.PI * 2); g.fill();
    for (let i = -2; i <= 2; i++) { g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(cx + i * 12, cy - 9, 3, 0, Math.PI * 2); g.fill(); }
    for (let i = -3; i <= 3; i++) { g.strokeStyle = 'rgba(245,240,227,.5)'; g.beginPath(); g.moveTo(cx + i * 8, cy + 5); g.lineTo(cx + i * 8, cy + 20 - Math.abs(i) * 2); g.stroke(); }
  }
  function mix(a, b, k) { return a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(','); }

  /** The glue pot: an amber jar, honey dripping. */
  function drawGlue(g, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = '#c98a1e'; rr(g, -11, -10, 22, 22, 6); g.fill();
    g.fillStyle = '#f5c518'; rr(g, -11, -10, 22, 8, 4); g.fill();
    g.fillStyle = '#8a5a10'; g.fillRect(-12, -14, 24, 5);
    g.fillStyle = '#f5c518'; g.beginPath(); g.ellipse(-4, -2, 2.5, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff6cf'; g.font = '700 9px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🍯', 0, 4);
    g.restore();
  }
  function drawCard(g, n, x, y, rot, w, h, bridge, gold) {
    if (n === GLUE) { drawGlue(g, x, y, 1); return; }
    g.save(); g.translate(x, y); g.rotate(rot);
    if (gold && !shell.reduced) { g.shadowColor = '#f5c518'; g.shadowBlur = 8 + 4 * Math.sin(time * 6); }
    if (bridge) {
      // A flat card seen from the side: a thin face.
      rr(g, -w / 2, -h / 2, w, h, 2); g.fillStyle = gold ? '#f5d77a' : '#f5f0e3'; g.fill();
      g.shadowBlur = 0;
      g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = n === JOKER ? '#7a3fb0' : (n % 52) < 26 ? '#c62828' : '#141414';
      g.fillRect(-w / 2 + 3, -0.75, w - 6, 1.5);
    } else {
      drawFace(g, img, n, w, h);
      g.shadowBlur = 0;
      if (gold) { rr(g, -w / 2 - 1, -h / 2 - 1, w + 2, h + 2, 4); g.strokeStyle = '#f5c518'; g.lineWidth = 2; g.stroke(); }
    }
    g.restore();
  }
  function drawBack(g, x, y, w, h) {
    const im = img(back);
    g.save(); g.translate(x, y);
    rr(g, -w / 2, -h / 2, w, h, 3);
    if (im) { g.save(); g.clip(); g.drawImage(im, -w / 2, -h / 2, w, h); g.restore(); rr(g, -w / 2, -h / 2, w, h, 3); }
    else { g.fillStyle = '#b3261e'; g.fill(); }
    g.strokeStyle = '#141414'; g.lineWidth = 1; g.stroke();
    g.restore();
  }
  function drawPot(g, x, y, cat) {
    // The floor's winnings: a few chips on its flat card.
    const n = cat >= 6 ? 5 : cat >= 4 ? 4 : cat >= 2 ? 3 : cat >= 1 ? 2 : 0;
    for (let i = 0; i < n; i++) {
      const c = CHIP[(cat + i) % 4];
      g.fillStyle = c[0]; g.fillRect(x - 5, y - 3 - i * 2.4, 10, 2.4);
      g.fillStyle = c[1]; g.fillRect(x - 1, y - 3 - i * 2.4, 2, 2.4);
    }
  }
  function drawHouse(g) {
    const cx = W() / 2 - G.pan;
    G.floors.forEach((f, i) => {
      const base = i * FH;
      f.cards.forEach((c, j) => {
        const sl = slot(j), wy = base + sl.y;
        drawCard(g, c.n, cx + sl.x + c.dx + shift(wy), sy(wy), sl.rot + G.tilt * 0.04, sl.w, sl.h, j === 4, c.gold);
      });
      if (f.ev.cat >= 1) { const wy = base + FH; drawPot(g, cx + FRAME_X + 6 + shift(wy), sy(wy), f.ev.cat); }
      if (f.met) { const wy = base + FH; g.font = '9px system-ui'; g.textAlign = 'center'; g.fillText('🎯', cx - FRAME_X - 6 + shift(wy), sy(wy) - 4); }
    });
    const base = G.floors.length * FH;
    G.cur.forEach((c, j) => {
      const sl = slot(j), wy = base + sl.y;
      drawCard(g, c.n, cx + sl.x + c.dx + shift(wy), sy(wy), sl.rot + G.tilt * 0.04, sl.w, sl.h, j === 4, c.gold);
    });
    // Honey on the house while glued.
    if (glued() && G.floors.length + G.cur.length) {
      g.save(); g.globalAlpha = 0.5 + 0.2 * Math.sin(time * 3);
      g.strokeStyle = '#f5c518'; g.lineWidth = 2;
      for (let i = 0; i <= G.floors.length; i++) { const wy = i * FH + 2; g.beginPath(); g.moveTo(cx - 44 + shift(wy), sy(wy)); g.lineTo(cx + 44 + shift(wy), sy(wy)); g.stroke(); }
      g.restore();
    }
    // The place of the next card: a lit, softly pulsing outline, and a
    // dotted plumb line up to a mark on the rail (drawRail) — drop when the
    // hanging card passes over the mark.
    if (state === 'run' && G.cur.length < 5 && !G.fall && G.card.n !== GLUE) {
      const sl = slot(G.cur.length), wy = base + sl.y, x = cx + sl.x + shift(wy), y = sy(wy);
      const col = shell.theme.light ? '140,101,16' : '216,178,90';
      const pulse = shell.reduced ? 0.8 : 0.6 + 0.4 * Math.sin(time * 5);
      g.save();
      g.setLineDash([2, 4]); g.strokeStyle = 'rgba(' + col + ',' + (0.35 + 0.2 * pulse).toFixed(2) + ')'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, railY + 8); g.lineTo(x, y - sl.h / 2 - 4); g.stroke(); g.setLineDash([]);
      g.translate(x, y); g.rotate(sl.rot);
      rr(g, -sl.w / 2, -sl.h / 2, sl.w, sl.h, 3);
      g.fillStyle = 'rgba(' + col + ',' + (0.14 + 0.12 * pulse).toFixed(2) + ')'; g.fill();
      g.strokeStyle = 'rgba(' + col + ',' + (0.6 + 0.35 * pulse).toFixed(2) + ')'; g.lineWidth = 1.8; g.stroke();
      g.restore();
    }
  }
  /** Screen x of the place of the next card (null when there is none to show). */
  function targetX() {
    if (state !== 'run' || G.cur.length >= 5 || G.fall) return null;
    const sl = slot(G.cur.length);
    return W() / 2 - G.pan + sl.x + shift(G.floors.length * FH + sl.y);
  }
  /** A box beside the rail: the card kept (left) or the next one (right). */
  function sideBox(g, b, it, label, lit) {
    const light = shell.theme.light;
    g.save();
    rr(g, b.x - BOX_W / 2 - 3, b.y - BOX_H / 2 - 3, BOX_W + 6, BOX_H + 6, 5);
    g.fillStyle = light ? 'rgba(255,250,240,.55)' : 'rgba(0,0,0,.28)'; g.fill();
    g.strokeStyle = lit ? (light ? '#8a6510' : '#d8b25a') : light ? 'rgba(140,105,20,.4)' : 'rgba(216,178,90,.35)'; g.lineWidth = 1; g.setLineDash(it ? [] : [2, 3]); g.stroke(); g.setLineDash([]);
    if (it) { if (it.n === GLUE) drawGlue(g, b.x, b.y, 0.8); else { g.translate(b.x, b.y); drawFace(g, img, it.n, BOX_W, BOX_H); if (it.gold) { rr(g, -BOX_W / 2 - 1, -BOX_H / 2 - 1, BOX_W + 2, BOX_H + 2, 3); g.strokeStyle = '#f5c518'; g.lineWidth = 1.5; g.stroke(); } } }
    g.restore();
    g.save(); g.font = '600 6.5px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
    g.fillStyle = light ? 'rgba(43,49,56,.7)' : 'rgba(245,240,227,.7)'; g.fillText(label, b.x, b.y + BOX_H / 2 + 5);
    g.restore();
  }
  function drawRail(g) {
    const w = W(), cx = w / 2, A = railAmp();
    g.fillStyle = shell.theme.light ? 'rgba(140,105,20,.85)' : 'rgba(216,178,90,.75)'; g.fillRect(cx - A - 16, railY - 2, 2 * A + 32, 3);
    g.fillStyle = 'rgba(216,178,90,.35)'; g.fillRect(cx - A - 16, railY + 1, 2 * A + 32, 1);
    // The card kept (left) and the next one, face up on the shoe (right).
    if (state === 'run') {
      const nb = nextBox();
      for (let i = 3; i >= 1; i--) drawBack(g, nb.x + i * 1.2, nb.y - i * 1.2, BOX_W, BOX_H);
      sideBox(g, nb, G.next, '', false);
      sideBox(g, holdBox(), G.hold, t('hcHold').toUpperCase(), G.canHold && !G.fall);
    }
    if (state === 'over') return;
    // The mark of the place on the rail: a small gold arrow under it.
    const tx = targetX();
    if (tx != null && G.card.n !== GLUE) {
      g.fillStyle = shell.theme.light ? '#8a6510' : '#d8b25a';
      g.beginPath(); g.moveTo(tx - 6, railY + 4); g.lineTo(tx + 6, railY + 4); g.lineTo(tx, railY + 11); g.closePath(); g.fill();
      g.fillRect(tx - 1, railY - 7, 2, 7);
    }
    // The draught: streaks across the stage.
    if (G.wind && !shell.reduced) {
      g.save(); g.strokeStyle = shell.theme.light ? 'rgba(80,110,140,.35)' : 'rgba(220,232,255,.28)'; g.lineWidth = 1.2;
      for (let i = 0; i < 7; i++) {
        const yy = railY + 50 + i * 34, len = 30 + (i % 3) * 14, ph = ((time * 140 * Math.sign(G.wind.v) + i * 97) % (w + 80) + w + 80) % (w + 80) - 40;
        g.beginPath(); g.moveTo(ph, yy); g.quadraticCurveTo(ph + len / 2, yy - 4, ph + len, yy); g.stroke();
      }
      g.restore();
    }
    // The trolley (a chip) and the hanging card (it leans in the wind).
    const x = cx + G.railX;
    if (!G.fall && G.card) {
      g.strokeStyle = shell.theme.light ? 'rgba(43,49,56,.55)' : 'rgba(245,240,227,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, railY); g.lineTo(x, railY + HANG - 18); g.stroke();
      const sl = slot(G.cur.length), sway = G.wind ? Math.sign(G.wind.v) * 0.18 : 0;
      drawCard(g, G.card.n, x, railY + HANG + (G.cur.length === 4 ? -12 : 0), sl.rot + sway, sl.w, sl.h, G.cur.length === 4, G.card.gold);
    }
    g.fillStyle = '#b3261e'; g.beginPath(); g.arc(x, railY, 7, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#f5f0e3'; g.setLineDash([2.5, 2]); g.lineWidth = 1.6; g.beginPath(); g.arc(x, railY, 5, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  }
  function drawFalling(g) {
    const f = G.fall; if (!f) return;
    const sl = slot(f.slot);
    drawCard(g, f.n, W() / 2 + f.x - G.pan, sy(f.wy), sl.rot, sl.w, sl.h, f.slot === 4, f.gold);
  }
  function drawDebris(g) {
    for (const d of G.debris) {
      const x = W() / 2 + d.x - G.pan, y = sy(d.wy);
      if (y < -60 || y > H() + 60) continue;
      g.save(); g.globalAlpha = d.burnt ? Math.max(0, 1 - d.t * 1.4) : 1;
      g.translate(x, y); g.rotate(d.rot);
      // A fluttering card turns over in the air: its width breathes.
      if (d.fl) g.scale(Math.max(0.15, Math.abs(Math.cos(d.t * 4 + d.ph))), 1);
      if (d.burnt) { drawFace(g, img, d.n, d.w, d.h); g.fillStyle = 'rgba(255,120,30,' + Math.min(0.6, d.t) + ')'; g.fillRect(-d.w / 2, -d.h / 2, d.w, d.h); }
      else if (d.h < 10) { rr(g, -d.w / 2, -d.h / 2, d.w, d.h, 2); g.fillStyle = '#f5f0e3'; g.fill(); }
      else drawFace(g, img, d.n, d.w, d.h);
      g.restore();
    }
  }
  function drawFx(g) {
    for (const p of G.fx) {
      const a = 1 - p.t / p.life;
      const x = p.screen ? W() / 2 + p.x : W() / 2 + p.x - G.pan + (p.wy != null ? shift(p.wy) : 0);
      const y = (p.screen ? p.y : sy(p.wy)) - p.t * 30;
      g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.font = p.big ? '700 22px Cinzel, Georgia, serif' : p.small ? '700 11px Cinzel, Georgia, serif' : p.gold ? '700 14px Cinzel, Georgia, serif' : '700 14px Inconsolata, monospace';
      const C = ink(shell.theme.light);
      g.fillStyle = p.red ? C.red : p.gold ? C.gold : C.text;
      g.fillText(p.s, x, y); g.globalAlpha = 1;
    }
  }
  function drawBanner(g) {
    const b = G.banner; if (!b) return;
    const a = b.t < 0.2 ? b.t / 0.2 : b.t > 1.2 ? Math.max(0, 1 - (b.t - 1.2) / 0.4) : 1;
    const w = W(), y = H() * 0.42;
    g.globalAlpha = a;
    const C = ink(shell.theme.light);
    g.fillStyle = C.band; g.fillRect(0, y - 24, w, 48);
    g.fillStyle = C.bandLine; g.fillRect(0, y - 24, w, 1); g.fillRect(0, y + 23, w, 1);
    g.textBaseline = 'middle'; g.textAlign = 'left';
    const fT = '700 20px Cinzel, Georgia, serif', fL = '700 20px Inconsolata, monospace';
    g.font = fT; const tw = g.measureText(b.s).width; g.font = fL; const lw = g.measureText(b.sub).width;
    const x0 = (w - tw - 12 - lw) / 2;
    g.font = fT; g.fillStyle = C.bandText; g.fillText(b.s, x0, y);
    g.font = fL; g.fillStyle = C.bandGold; g.fillText(b.sub, x0 + tw + 12, y);
    g.globalAlpha = 1;
  }
  function draw(g) {
    // The waiter's bump shakes the stage a little.
    const sh = G.shake > 0 && !shell.reduced ? Math.sin(time * 70) * 3 * (G.shake / 0.45) : 0;
    g.save(); g.translate(sh, 0);
    drawBg(g);
    g.restore();
    fgCanvas.width !== shell.canvas.width && (fgCanvas.width = shell.canvas.width);
    fgCanvas.height !== shell.canvas.height && (fgCanvas.height = shell.canvas.height);
    fg.setTransform(1, 0, 0, 1, 0, 0); fg.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
    fg.setTransform(shell.dpr * shell.k, 0, 0, shell.dpr * shell.k, sh * shell.dpr * shell.k, 0);
    drawHouse(fg);
    drawRail(fg);
    drawFalling(fg);
    drawDebris(fg);
    drawFx(fg);
    drawBanner(fg);
    // The Ace on the last floor (behind the cards: he is on the canvas below them).
    const feetY = state === 'title' ? 0 : G.aceY;
    ace.place(W() / 2 + shift(feetY) - G.pan + sh, sy(feetY), S, shell.k, state === 'over' ? 0 : G.tilt * 8);
  }

  return {
    update, draw, input, resize: measureRail,
    running: () => state === 'run',
    destroy() {
      clearTimeout(revealTimer);
      try { if (typeof window.resetBlindRaises === 'function') window.resetBlindRaises(); } catch (e) {}
      ace.remove(); fgCanvas.remove();
    },
  };
}
