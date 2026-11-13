// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Poker Run — the Ace's convertible on an OutRun-style road (web extension,
// narmod 2026-11-13). Arcade page (games/index.mjs), after Ace Dash.
//
// A segment road in pseudo-3D (curves, hills) drawn on the shell's canvas,
// the camera behind the car. Six stages from Las Vegas: at the end of the
// first five the road forks into three branches; the branch the car takes
// deals that board card (flop ×3, turn, river) and leads to the next scene
// (Las Vegas, Saint-Tropez, Monument Valley, Chamonix, Monaco). The car
// slows down before each fork so the three cards can be compared (the
// preview names the hand each one makes). Every fork adds EXTEND seconds to
// the clock; when it runs out the dealer completes the board.
//   Steer      ← → held (keys, ◀ ▶ of the pad), a swipe nudges
//   Nitro      ↑, Space, ▲ held (a tap: a short burst); refilled by the
//              chips and the drifts
//   Brake      ↓, ▼ held (a swipe down: a short brake)
//   Drift      steer into a tight bend at full speed: +5 chips and some
//              nitro every 0.4 s
//   Traffic    a car hit costs 20 % of the chips
//   Score      (chips + 5 per second left) × the multiplier of the best
//              five-card hand (games/poker-hand.mjs)
// The Ace is the SVG mascot (games/common.mjs aceActor) at the wheel, his
// card back turned to us; the car's body and his seat are painted over him
// on a second canvas. He reacts to the road (arms, hops, a spin at the
// finish) and speaks in the mascot's bubbles (emoji, or the hand's name).
// Touch pad: ◀ NITRO ▶ (the shell's ▲ relabelled, ▼ hidden; ↓ still brakes);
// in landscape ◀ left of the stage, NITRO and ▶ right of it.
// Texts: prHint, prRules, prTimeUp plus shared keys (blChips, gameTimeLabel,
// arLevel, arTapStart, arRecord, arNewRecord, gmAgain, mascotHello, mascotTada,
// the hand names h1n…h10n).
// ═══════════════════════════════════════════════════════════════════

import { evalCards } from './poker-hand.mjs';
import { fmt, cardHtml, imageCache, drawFace, aceActor, ACE_ID } from './common.mjs';

// ── Road ───────────────────────────────────────────────────────────
const SEG = 200, ROAD = 2000, DRAW = 300, CAMH = 1400, FOV = 100;
const DEPTH = 1 / Math.tan(FOV / 2 * Math.PI / 180), PLAYER_Z = CAMH * DEPTH;
const MAXV = SEG * 62, ACCEL = MAXV / 4.5, OFFROAD = MAXV / 3.5, CENTRI = 0.27;
const LANE_OFF = [-0.66, 0, 0.66];          // lane centres, in half-road widths
const STAGES = 6, FORKS = 5, TIME0 = 32, EXTEND = 22, GATE_ZONE = 170, GATE_SLOW = 0.5, SPLIT = 0.9, MERGE = 60;
const GATE_LABELS = ['FLOP 1/3', 'FLOP 2/3', 'FLOP 3/3', 'TURN', 'RIVER'];
const BOARD_TAGS = ['F', 'F', 'F', 'T', 'R'];
const SUITS = ['♦', '♥', '♠', '♣'], VS = '︎';

// ── Scenes, one per branch (proper names: nothing to translate) ─────
const TH = {
  vegas: { name: 'Las Vegas', sky: ['#0a1322', '#1d2b46', '#c8743a'], g: ['#1c5639', '#195034'], r: ['#e8b84a', '#f4eedf'], d: ['#2b3038', '#272b33'], fog: '#1e283e', skyT: 'city', side: 'post', a: '#101a2b', b: '#e8b84a' },
  tropez: { name: 'Saint-Tropez', sky: ['#23305e', '#d9667a', '#ffbe7a'], g: ['#d8bf8c', '#cdb27e'], r: ['#f4eedf', '#c2303a'], d: ['#3d424a', '#383c44'], fog: '#eaa886', skyT: 'sea', side: 'palm', a: '#2f4f86', b: '#ffe0a0' },
  valley: { name: 'Monument Valley', sky: ['#2e63a8', '#86b4dc', '#f3d9a8'], g: ['#c88a4c', '#bd7f44'], r: ['#f4eedf', '#8a3b1c'], d: ['#4b4541', '#46403c'], fog: '#ecceA6', skyT: 'mesa', side: 'cactus', a: '#9c4f2c', b: '#c46a3c' },
  chamonix: { name: 'Chamonix', sky: ['#22487e', '#79a3cd', '#dfe9f1'], g: ['#3f7a3a', '#386f34'], r: ['#f4eedf', '#c2303a'], d: ['#33373e', '#2f333a'], fog: '#cddae8', skyT: 'peaks', side: 'pine', a: '#5b6f8a', b: '#f4f7fa' },
  monaco: { name: 'Monaco', sky: ['#140a2c', '#3b1d5e', '#8a3f86'], g: ['#2b2f3e', '#272a38'], r: ['#c2303a', '#f4eedf'], d: ['#24262e', '#212329'], fog: '#3c285a', skyT: 'harbor', side: 'lamp', a: '#1b1430', b: '#ffd68c' },
};
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb = (a, al) => al == null ? 'rgb(' + (a[0] | 0) + ',' + (a[1] | 0) + ',' + (a[2] | 0) + ')' : 'rgba(' + (a[0] | 0) + ',' + (a[1] | 0) + ',' + (a[2] | 0) + ',' + al + ')';
const mixA = (a, b, t) => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t);
for (const k in TH) {
  const s = /** @type {any} */ (TH[k]);
  s.key = k; s.G = s.g.map(hex); s.R = s.r.map(hex); s.D = s.d.map(hex); s.F = hex(s.fog); s.FAR = mixA(s.G[0], s.F, 0.75);
}
const KEYS_TH = Object.keys(TH);
// Skylines, the same every run (a fixed seed).
let seed = 7;
const srnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const SKY = {}, SKY_P = 1800;
for (const k of KEYS_TH) {
  const items = []; let x = 0;
  while (x < SKY_P) { const w = 40 + srnd() * 90; items.push({ x, w, h: 0.08 + srnd() * 0.26, l: srnd() }); x += w + srnd() * (TH[k].skyT === 'city' ? 10 : 60); }
  SKY[k] = items;
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (a, b, p) => a + (b - a) * ((-Math.cos(clamp(p, 0, 1) * Math.PI) / 2) + 0.5);
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const CSS = `
#${ACE_ID}.prun-back .mc-card3d{transform:rotateY(180deg)}
#${ACE_ID}.prun-back.prun-spin .mc-card3d{animation:prunSpin 1.2s ease-in-out}
@keyframes prunSpin{from{transform:rotateY(180deg)}to{transform:rotateY(900deg)}}
#${ACE_ID} .prun-up .mc-armL{transform:rotate(135deg)}#${ACE_ID} .prun-up .mc-armR{transform:rotate(-135deg)}
#${ACE_ID} .prun-flail .mc-armL{animation:prunFlL .16s ease-in-out infinite alternate}
#${ACE_ID} .prun-flail .mc-armR{animation:prunFlR .16s ease-in-out infinite alternate-reverse}
@keyframes prunFlL{from{transform:rotate(40deg)}to{transform:rotate(150deg)}}
@keyframes prunFlR{from{transform:rotate(-40deg)}to{transform:rotate(-150deg)}}
#${ACE_ID} .prun-shrug .mc-armL{transform:rotate(85deg)}#${ACE_ID} .prun-shrug .mc-armR{transform:rotate(-85deg)}
#${ACE_ID} .prun-pump .mc-armR{animation:prunPump .14s ease-in-out infinite alternate}
@keyframes prunPump{from{transform:rotate(-150deg)}to{transform:rotate(-175deg)}}
#${ACE_ID} .prun-wave .mc-armL{animation:prunWave .25s ease-in-out infinite alternate}
@keyframes prunWave{from{transform:rotate(110deg)}to{transform:rotate(155deg)}}
#${ACE_ID} .prun-slump .mc-lean{transform:rotate(-14deg)}
#pth-game .pg-hud.prun-hud{flex-wrap:wrap;row-gap:6px}
#pth-game .prun-hud .ar-num.prun-low{color:#ff7b6b}
#pth-game .prun-hud .ar-num.prun-ext{animation:prunExt .6s ease-out 3}
@keyframes prunExt{50%{transform:scale(1.25);color:#fff}}
#pth-game .prun-hud .ar-slots{align-items:center}
#pth-game .prun-hud .prun-gap{width:6px;flex:none}
#pth-game .prun-hud .ar-slot{display:flex;align-items:center;justify-content:center;font:600 10px 'Inconsolata',monospace;color:rgba(216,178,90,.6)}
#pth-game .prun-b .pk{box-shadow:0 0 0 2px #d8b25a}
#pth-game .prun-prev{position:absolute;left:8px;right:8px;top:64px;z-index:397;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;pointer-events:none}
#pth-game .prun-prev[hidden]{display:none}
#pth-game .prun-prev .prun-tag{grid-column:1/-1;text-align:center;font:700 12px 'Inconsolata',monospace;letter-spacing:.08em;color:#d8b25a;text-shadow:0 1px 3px #000}
#pth-game .prun-opt{min-width:0;background:rgba(13,17,23,.82);border:1.5px solid rgba(255,255,255,.14);border-radius:10px;padding:5px 3px;display:flex;flex-direction:column;align-items:center;gap:2px;color:#f5f0e3;text-align:center}
#pth-game .prun-opt.on{border-color:#d8b25a;background:rgba(40,32,10,.9)}
#pth-game .prun-opt .pk{margin:0}
#pth-game .prun-opt b{font:600 12px/1.1 'Inter',system-ui,sans-serif}
#pth-game .prun-opt em{font:700 12px 'Inconsolata',monospace;font-style:normal;color:#d8b25a}
#pth-game .prun-opt small{font:500 10px/1.1 'Inter',system-ui,sans-serif;color:#9bb0a3;letter-spacing:.02em}
/* Touch pad as in the draft: ◀ NITRO ▶ under the stage; in landscape ◀ on the left, NITRO and ▶ on the right. */
#pth-game.prun-pad .pg-pad button[data-a="duck"]{display:none}
#pth-game.prun-pad .pg-pad button[data-a="jump"]{position:relative;overflow:hidden;width:120px;background:#3a2a10;color:#d8b25a;font:800 15px 'Inter',system-ui,sans-serif;letter-spacing:.08em}
#pth-game.prun-pad .pg-pad button[data-a="jump"].prun-ready{background:#5a4214}
#pth-game.prun-pad .pg-pad button[data-a="jump"].prun-burn{background:#d8b25a;color:#141414}
#pth-game.prun-pad .pg-pad button[data-a="jump"] .prun-gauge{position:absolute;left:0;bottom:0;height:4px;width:0;background:#d8b25a;transition:width .15s}
#pth-game.prun-pad .pg-play:not(.pg-land) .pg-pad{align-self:stretch}
#pth-game.prun-pad .pg-play:not(.pg-land) .pg-pad button{flex:1 1 0;width:auto}
#pth-game.prun-pad .pg-play:not(.pg-land) .pg-pad button[data-a="jump"]{flex-grow:1.3}
#pth-game.prun-pad.pg-lanes .pg-land .pg-pad button[data-a="left"]{order:-3}
#pth-game.prun-pad.pg-lanes .pg-land .pg-pad button[data-a="jump"]{order:1;width:72px;font-size:12px;letter-spacing:.04em}
#pth-game.prun-pad.pg-lanes .pg-land .pg-pad button[data-a="right"]{order:3}
#pth-game .prun-route{font:500 12px/1.3 'Inter',system-ui,sans-serif;color:#cfd8d2}
#pth-game.pg-light .prun-route{color:#2b3138}
@media (prefers-reduced-motion:reduce){#${ACE_ID}.prun-back.prun-spin .mc-card3d,#pth-game .prun-hud .ar-num.prun-ext{animation:none}}
`;

export function create(shell) {
  const { t, esc, sound } = shell;
  if (!document.getElementById('pth-game-prun-css')) {
    const st = document.createElement('style'); st.id = 'pth-game-prun-css'; st.textContent = CSS;
    document.head.appendChild(st);
  }
  const ace = aceActor(shell.layer);
  const aceRoot = /** @type {HTMLElement} */ (shell.layer.querySelector('#' + ACE_ID));
  if (aceRoot) aceRoot.classList.add('prun-back');
  // The car's body, his seat and what flies over the road: a canvas over the Ace.
  const front = document.createElement('canvas');
  // Over the Ace: the actor's root keeps the mascot kit's z-index (395).
  front.style.zIndex = '396';
  shell.layer.appendChild(front);
  const gF = /** @type {CanvasRenderingContext2D} */ (front.getContext('2d'));
  const prev = document.createElement('div');
  prev.className = 'prun-prev'; prev.hidden = true;
  shell.layer.appendChild(prev);
  shell.lanes(true);
  // The pad of this game: ◀ NITRO ▶ (the brake stays on ↓), with the nitro gauge; put back as it was on leaving.
  shell.root.classList.add('prun-pad');
  const nitroBtn = /** @type {HTMLElement|null} */ (shell.root.querySelector('.pg-pad button[data-a="jump"]'));
  const nitroWas = nitroBtn ? { text: nitroBtn.textContent, label: nitroBtn.getAttribute('aria-label') } : null;
  const gauge = document.createElement('i');
  gauge.className = 'prun-gauge';
  if (nitroBtn) { nitroBtn.textContent = 'NITRO'; nitroBtn.setAttribute('aria-label', 'Nitro'); nitroBtn.appendChild(gauge); }
  const buzz = (p) => { try { if (typeof window.hapticBuzz === 'function') window.hapticBuzz(p); } catch (e) {} };
  const img = imageCache();
  const bang = /^fr/.test(document.documentElement.lang || '') ? ' !' : '!';

  shell.hud.classList.add('on-felt', 'prun-hud');
  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('blChips')) + '</div><div class="ar-num pr-c">0</div></div>'
    + '<div><div class="ar-lab">' + esc(t('gameTimeLabel')) + '</div><div class="ar-num pr-t">' + TIME0.toFixed(1) + '</div></div>'
    + '<div><div class="ar-lab">' + esc(t('arLevel')) + '</div><div class="ar-num pr-s">1/' + STAGES + '</div></div></div>'
    + '<div class="ar-hand"><div class="ar-slots"></div><div class="ar-name"></div></div>';
  const q = (s) => /** @type {HTMLElement} */ (shell.hud.querySelector(s));
  const hChips = q('.pr-c'), hTime = q('.pr-t'), hStage = q('.pr-s'), hSlots = q('.ar-slots'), hName = q('.ar-name');

  // ── Track ──────────────────────────────────────────────────────────
  let segs = [], finishSeg = 0, gates = [], cars = [], buildStage = 0;
  let stageTheme = [], branches = [], hover = 1, hole = [], board = [];
  const lastY = () => segs.length ? segs[segs.length - 1].p2.w.y : 0;
  function addSeg(curve, y) {
    const n = segs.length;
    segs.push({ i: n, p1: { w: { z: n * SEG, y: lastY() }, c: {}, s: {} }, p2: { w: { z: (n + 1) * SEG, y }, c: {}, s: {} },
      curve, sprites: [], clip: 0, stage: buildStage, f: 0, m: 0, gk: -1, mEnd: -1, g: null, T: null, Tp: null });
  }
  function addRoad(en, ho, le, cu, hill) {
    const y0 = lastY(), y1 = y0 + hill, tot = Math.max(1, en + ho + le); let k = 0;
    const Y = () => ease(y0, y1, ++k / tot);
    for (let i = 0; i < en; i++) addSeg(ease(0, cu, i / en), Y());
    for (let i = 0; i < ho; i++) addSeg(cu, Y());
    for (let i = 0; i < le; i++) addSeg(ease(cu, 0, i / le), Y());
  }
  function buildTrack() {
    segs = []; cars = []; gates = []; buildStage = 0;
    addRoad(0, 40, 0, 0, 0);
    const deck = []; for (let n = 0; n < 52; n++) deck.push(n);
    for (let i = 51; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = deck[i]; deck[i] = deck[j]; deck[j] = x; }
    hole = [deck.pop(), deck.pop()];
    for (let k = 0; k < FORKS; k++) {
      const start = segs.length, target = 740 + k * 40;
      while (segs.length - start < target) {
        const en = 25 + Math.floor(Math.random() * 25), ho = 30 + Math.floor(Math.random() * 60);
        const hill = clamp((Math.random() * 2 - 1) * 1100 - lastY() * 0.5, -1400, 1400);
        addRoad(en, ho, en, pick([0, 0, 1.5, -1.5, 2.4, -2.4, 3.2, -3.2]), hill);
      }
      // The fork: a flat straight, three branches, the gate, then the branch taken swings back to the middle.
      const f0 = segs.length; addRoad(0, 30 + 150 + MERGE + 20, 0, 0, 0);
      const gate = f0 + 180;
      for (let i = f0 + 30; i <= gate; i++) { segs[i].f = ease(0, 1, (i - (f0 + 30)) / 100); segs[i].gk = k; }
      for (let i = gate + 1; i <= gate + MERGE; i++) { segs[i].m = 1 - ease(0, 1, (i - gate) / MERGE); segs[i].gk = k; }
      segs[gate + MERGE].mEnd = k;
      for (let i = gate + 1; i < segs.length; i++) segs[i].stage = k + 1;
      buildStage = k + 1;
      const g = { seg: gate, k, cards: [deck.pop(), deck.pop(), deck.pop()], label: GATE_LABELS[k], picked: -1 };
      gates.push(g); segs[gate].gate = g;
    }
    addRoad(30, 120, 30, pick([1.5, -1.5]), 0); addRoad(0, 140, 0, 0, 0);
    finishSeg = segs.length - 60; addRoad(0, DRAW + 30, 0, 0, 0);
    const free = (i) => segs[i] && segs[i].f === 0 && segs[i].m === 0 && !segs[i].gate;
    for (let s = 70; s < finishSeg - 20; s += 36 + Math.floor(Math.random() * 24)) {
      const lane = Math.floor(Math.random() * 3);
      for (let j = 0; j < 4; j++) if (free(s + j * 4)) segs[s + j * 4].sprites.push({ t: 'chip', lane });
    }
    for (let s = 10; s < segs.length; s += 16) segs[s].sprites.push({ t: 'side', side: Math.floor(s / 16) % 2 ? -1 : 1, v: Math.floor(s / 16) % 4 });
    for (let k = 0; k < 34; k++) {
      let z = Math.floor(150 + k * (finishSeg - 250) / 34 + Math.random() * 40);
      while (!free(z) && z < finishSeg) z++;
      cars.push({ z: z * SEG, lane: Math.floor(Math.random() * 3), v: MAXV * (0.32 + Math.random() * 0.2), col: ['#5d6b7a', '#3d6a8f', '#8a8f96', '#6b5a86', '#2f7a6a'][k % 5], dead: false, ahead: true });
    }
  }
  const findSeg = (z) => segs[clamp(Math.floor(z / SEG), 0, segs.length - 1)];
  const nextGate = () => gates.find((g) => g.picked < 0);
  const chosenLane = (g) => g.picked >= 0 ? g.picked : (nextGate() === g ? hover : 1);
  function assignBranches(k) {
    const pool = KEYS_TH.filter((x) => x !== stageTheme[k]);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = pool[i]; pool[i] = pool[j]; pool[j] = x; }
    branches[k] = pool.slice(0, 3);
  }
  function themeOf(k) {
    if (stageTheme[k]) return TH[stageTheme[k]];
    const b = branches[k - 1];
    return b ? TH[b[chosenLane(gates[k - 1])]] : TH.vegas;
  }
  // Lateral layout of a segment (half-road units): three lane pieces, and the branches not taken.
  function geom(s) {
    if (s.f > 0) {
      const sp = 1 + SPLIT * s.f, hw = (1 / 3) * (1 - 0.3 * s.f);
      return { pcs: LANE_OFF.map((o) => ({ c: o * sp, hw })), joined: s.f < 0.12, ghosts: null };
    }
    if (s.m > 0) {
      const cl = chosenLane(gates[s.gk]), m = s.m, C = LANE_OFF[cl] * (1 + SPLIT), hw = (1 / 3) * (0.7 + 0.3 * (1 - m));
      return { pcs: LANE_OFF.map((o) => ({ c: C * m + o * (1 - m), hw })), joined: true,
        ghosts: LANE_OFF.map((o, l) => l === cl ? null : { c: o * (1 + SPLIT + 5 * (1 - m)), hw: (1 / 3) * 0.7, a: m }) };
    }
    return { pcs: LANE_OFF.map((o) => ({ c: o, hw: 1 / 3 })), joined: true, ghosts: null };
  }
  const envL = (g) => Math.min(g.pcs[0].c - g.pcs[0].hw, g.pcs[1].c - g.pcs[1].hw, g.pcs[2].c - g.pcs[2].hw);
  const envR = (g) => Math.max(g.pcs[0].c + g.pcs[0].hw, g.pcs[1].c + g.pcs[1].hw, g.pcs[2].c + g.pcs[2].hw);
  const nearest = (g, x) => { let bi = 0; g.pcs.forEach((p, i) => { if (Math.abs(x - p.c) < Math.abs(x - g.pcs[bi].c)) bi = i; }); return bi; };
  function carX(c, s, g) {
    if (s.m > 0) { const cl = chosenLane(gates[s.gk]); return c.lane === cl ? (envL(g) + envR(g)) / 2 : g.ghosts[c.lane].c; }
    return g.pcs[c.lane].c;
  }

  // ── State ──────────────────────────────────────────────────────────
  let state = 'title', overAt = 0, revealTimer = 0, lastChipSnd = 0;
  let pos = 0, px = 0, v = 0, pv = 0, yaw = 0, slide = 0, bob = 0, camY = CAMH, lastCen = null;
  let stack = 0, time = TIME0, nitro = 0, boost = false, inv = 0, shake = 0, skyOff = 0, curStage = 0, skyFrom = 'vegas', skyGate = -1;
  let holdT = 0, drift = false, driftDir = 0, driftTick = 0, driftGain = 0, parts = [], fx = [];
  let act = { a: '', t: 0, dur: 0, prio: 0 }, bub = { s: '', t: 0, d: 1 }, wasBoost = false, wasOff = false, lowSaid = false, offCd = 0, outroT = 0, outroWin = false;
  const keys = { l: false, r: false, n: false, b: false }, pulse = { l: 0, r: 0, n: 0, b: 0 };
  let W = 640, H = 360, cy = 160, ctx = shell.g;

  function reset() {
    buildTrack();
    pos = 0; px = 0; v = 0; pv = 0; yaw = 0; slide = 0; lastCen = null; board = []; stack = 0; time = TIME0; nitro = 0.2; boost = false;
    inv = 0; shake = 0; fx = []; parts = []; drift = false; holdT = 0; curStage = 0; stageTheme = ['vegas']; branches = []; assignBranches(0);
    hover = 1; skyFrom = 'vegas'; skyGate = -1; act = { a: '', t: 0, dur: 0, prio: 0 }; bub = { s: '', t: 0, d: 1 };
    wasBoost = false; wasOff = false; lowSaid = false; offCd = 0;
    keys.l = keys.r = keys.n = keys.b = false; pulse.l = pulse.r = pulse.n = pulse.b = 0;
    renderHand(); renderStats(true);
  }

  // ── HUD ────────────────────────────────────────────────────────────
  function renderHand() {
    const all = hole.concat(board), ev = evalCards(all), best = new Set(all.length >= 2 && (ev.cat > 0 || all.length >= 5) ? ev.best : []);
    const one = (n) => '<span class="' + (best.has(n) ? 'prun-b' : '') + '">' + cardHtml(n, 'sm') + '</span>';
    let h = hole.map(one).join('') + '<span class="prun-gap"></span>';
    for (let i = 0; i < 5; i++) h += i < board.length ? one(board[i]) : '<div class="ar-slot">' + BOARD_TAGS[i] + '</div>';
    hSlots.innerHTML = h;
    hName.innerHTML = (ev.nameKey ? esc(t(ev.nameKey)) : '') + ' <b>×' + ev.mult + '</b>';
  }
  let lastStats = '';
  function renderNitro() {
    gauge.style.width = Math.round(nitro * 100) + '%';
    if (nitroBtn) { nitroBtn.classList.toggle('prun-ready', nitro > 0.15 && !boost); nitroBtn.classList.toggle('prun-burn', boost); }
  }
  function renderStats(force) {
    const key = stack + '|' + time.toFixed(1) + '|' + curStage;
    if (key === lastStats && !force) return;
    lastStats = key;
    hChips.textContent = fmt(stack);
    hTime.textContent = Math.max(0, time).toFixed(1);
    hTime.classList.toggle('prun-low', time < 8);
    hStage.textContent = Math.min(STAGES, curStage + 1) + '/' + STAGES;
  }
  let lastPrev = '';
  function renderPreview() {
    const ps = findSeg(pos + PLAYER_Z).i, g = nextGate();
    if (!g || g.seg - ps > GATE_ZONE + 15 || state !== 'run') { prev.hidden = true; lastPrev = ''; return; }
    const key = g.seg + ':' + hover;
    if (key === lastPrev) return;
    lastPrev = key;
    const base = hole.concat(board), br = branches[g.k];
    prev.innerHTML = '<div class="prun-tag">' + g.label + ' · +' + EXTEND + ' s</div>' + g.cards.map((c, i) => {
      const e = evalCards(base.concat([c]));
      return '<div class="prun-opt' + (i === hover ? ' on' : '') + '">' + cardHtml(c, 'sm') + '<b>' + esc(t(e.nameKey)) + '</b><em>×' + e.mult + '</em><small>→ ' + esc(TH[br[i]].name) + '</small></div>';
    }).join('');
    prev.style.top = Math.round(shell.hud.offsetHeight + 4) + 'px';
    prev.hidden = false;
  }
  function titlePanel() {
    const best = shell.best.get();
    shell.panel('<h2>Poker Run</h2><p>' + esc(t('prHint')) + '</p>'
      + (best ? '<p class="pg-dim">' + esc(t('arRecord', { n: fmt(best) })) + '</p>' : '')
      + '<p class="pg-blink">' + esc(t('arTapStart')) + '</p>');
  }

  // ── The Ace's reactions ────────────────────────────────────────────
  const say = (s, d = 1.3) => { bub = { s, t: d, d }; };
  function aceDo(a, dur, s, prio = 1) {
    if (act.a && act.t < act.dur && prio < act.prio) return;
    act = { a, t: 0, dur, prio };
    if (s) say(s);
    if (a === 'spin' && aceRoot && !shell.reduced) { aceRoot.classList.remove('prun-spin'); void aceRoot.offsetWidth; aceRoot.classList.add('prun-spin'); }
  }
  function aceTick(dt) { act.t += dt; if (act.t >= act.dur) act.a = ''; bub.t -= dt; }

  function start() {
    clearTimeout(revealTimer);
    reset(); state = 'run'; shell.panel(null);
    if (aceRoot) aceRoot.classList.remove('prun-spin');
    ace.mood('mc-m-smile');
  }

  // ── Input ──────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (state === 'title' || state === 'over') {
      if (a === 'jump' && down && (state === 'title' || performance.now() > overAt + 700)) start();
      return;
    }
    if (state !== 'run') return;
    const sw = info && info.swipe;
    if (a === 'left' || a === 'right') { const k = a === 'left' ? 'l' : 'r'; if (sw) pulse[k] = down ? 0.25 : 0; else keys[k] = down; }
    else if (a === 'jump') { if (info && info.tap) pulse.n = 0.6; else if (!sw) keys.n = down; else if (down) pulse.n = 0.6; }
    else if (a === 'duck') { if (sw) pulse.b = down ? 0.4 : 0; else keys.b = down; }
  }

  // ── Update ─────────────────────────────────────────────────────────
  function addFx(s, col, big, y) { fx.push({ s, col, big, y: y == null ? H * 0.6 : y, life: 1 }); }
  function endDrift() {
    drift = false;
    if (driftGain > 0) addFx('DRIFT +' + driftGain, '#ffd27a');
    if (driftGain >= 15 && state === 'run') aceDo('pump', 0.8, null, 2);
    driftGain = 0;
  }
  function respawn(c, pi) {
    let z = pi + DRAW + 10 + Math.floor(Math.random() * 120);
    while (segs[z] && (segs[z].f > 0 || segs[z].m > 0)) z++;
    if (z >= finishSeg) { c.dead = true; return; }
    c.z = z * SEG; c.lane = Math.floor(Math.random() * 3); c.v = MAXV * (0.32 + Math.random() * 0.2);
  }
  function takeGate(g, lane, live) {
    const before = evalCards(hole.concat(board)).cat;
    g.picked = lane; board.push(g.cards[lane]);
    const k = g.k;
    stageTheme[k + 1] = branches[k][lane]; curStage = k + 1;
    if (k + 1 < FORKS) assignBranches(k + 1);
    if (!live) return;
    skyFrom = stageTheme[k]; skyGate = g.seg; time += EXTEND;
    fx.push({ card: g.cards[lane], y: H * 0.6, life: 1.2 });
    addFx('+' + EXTEND + ' s', '#e8b84a', true, H * 0.34);
    hTime.classList.remove('prun-ext'); void hTime.offsetWidth; hTime.classList.add('prun-ext');
    sound('notifyCard'); buzz(25);
    const ev = evalCards(hole.concat(board));
    if (ev.cat > before) aceDo(ev.cat >= 3 ? 'spin' : 'jump', ev.cat >= 3 ? 1.2 : 0.9, t(ev.nameKey) + bang, 4);
    else aceDo('shrug', 0.9, '🤷', 4);
    renderHand();
  }

  function update(dt) {
    W = shell.W; H = shell.H;
    if (state === 'title' || state === 'over') { aceTick(dt); return; }
    if (state === 'outro') { stepOutro(dt); return; }
    for (const k of ['l', 'r', 'n', 'b']) if (pulse[k] > 0) pulse[k] -= dt;
    const L = keys.l || pulse.l > 0, R = keys.r || pulse.r > 0, N = keys.n || pulse.n > 0, B = keys.b || pulse.b > 0;
    const ps = findSeg(pos + PLAYER_Z), g = geom(ps), sp = v / MAXV, dir = (R ? 1 : 0) - (L ? 1 : 0);
    const ng = nextGate();
    if (ng && ps.i >= ng.seg - GATE_ZONE - 20 && ps.i <= ng.seg) hover = nearest(g, px);
    // Drift: steering into a tight bend at speed, held a moment.
    const into = dir !== 0 && Math.sign(dir) === Math.sign(ps.curve) && Math.abs(ps.curve) > 1.3 && sp > 0.62;
    holdT = into ? holdT + dt : 0;
    if (!drift && holdT > 0.22) { drift = true; driftDir = dir; driftTick = 0; driftGain = 0; say('😎'); }
    if (drift && (dir !== driftDir || Math.abs(ps.curve) < 0.5 || sp < 0.45)) endDrift();
    const rate = (drift ? 3.4 : 2.5) * Math.max(0.35, sp);
    pv += (dir * rate - pv) * Math.min(1, dt * (drift ? 5 : 11));
    px += pv * dt - dt * 2.4 * sp * sp * ps.curve * CENTRI * (drift ? 0.3 : 1);
    // After a fork the branch taken swings back to the middle: the car goes with it.
    if (ps.m > 0) { const cen = (envL(g) + envR(g)) / 2; if (lastCen != null) px += cen - lastCen; lastCen = cen; } else lastCen = null;
    // Hands off just before a gate: the car settles in the nearest branch.
    if (dir === 0 && ng && ng.seg - ps.i < 40 && ng.seg >= ps.i && ps.f > 0) { const tx = g.pcs[nearest(g, px)].c; px += (tx - px) * Math.min(1, dt * 4); }
    px = clamp(px, envL(g) - 1, envR(g) + 1);
    let off;
    if (!g.joined) { const p = g.pcs[nearest(g, px)]; off = Math.abs(px - p.c) > p.hw + 0.05; } else off = px < envL(g) - 0.05 || px > envR(g) + 0.05;
    if (drift) {
      driftTick += dt; v *= 1 - 0.06 * dt;
      if (driftTick >= 0.4) { driftTick = 0; stack += 5; driftGain += 5; nitro = Math.min(1, nitro + 0.05); }
      if (!shell.reduced) for (const sx of [-1, 1]) parts.push({ x: W / 2 + slide + sx * carW() * 0.38, y: H - 18, vx: -driftDir * (60 + Math.random() * 60) + sx * 20, vy: -30 - Math.random() * 40, r: 5, life: 0.7, c: '220,224,230' });
    }
    if (off && sp > 0.2 && !shell.reduced && Math.random() < 0.6) parts.push({ x: W / 2 + (Math.random() - 0.5) * 70, y: H - 16, vx: (Math.random() - 0.5) * 80, vy: -40, r: 4, life: 0.5, c: '150,140,110' });
    yaw += ((drift ? driftDir * 0.2 : dir * 0.05) - yaw) * Math.min(1, dt * 8);
    slide += ((drift ? -driftDir * W * 0.035 : 0) - slide) * Math.min(1, dt * 6);
    bob = sp > 0.8 && !shell.reduced ? Math.sin(performance.now() / 38) * sp * 1.1 : 0;
    camY = CAMH + ps.p1.w.y + (ps.p2.w.y - ps.p1.w.y) * (((pos + PLAYER_Z) % SEG) / SEG);
    stepParts(dt);

    boost = N && nitro > 0; if (boost) nitro = Math.max(0, nitro - dt * 0.45);
    if (boost && !wasBoost && nitro > 0.1) { aceDo('up', 0.9, '🔥', 2); sound('notifyAllIn'); }
    wasBoost = boost;
    if (off && !wasOff && sp > 0.4 && offCd <= 0) { say('😵'); offCd = 4; }
    wasOff = off; offCd -= dt;
    if (time < 8 && !lowSaid) { say('⏱️'); lowSaid = true; }
    if (time > 10) lowSaid = false;
    aceTick(dt);
    const inZone = ng && ng.seg - ps.i < GATE_ZONE && ng.seg >= ps.i;
    let cap = off ? OFFROAD : MAXV * (inZone ? GATE_SLOW : (boost ? 1.45 : 1));
    if (B) cap = Math.min(cap, MAXV * 0.25);
    v = v < cap ? Math.min(cap, v + ACCEL * (boost ? 1.8 : 1) * dt) : Math.max(cap, v - ACCEL * (B ? 3 : 2.2) * dt);
    pos += v * dt; time -= dt; if (inv > 0) inv -= dt; if (shake > 0) shake -= dt;
    skyOff += ps.curve * sp * dt * 90;

    // Traffic
    for (const c of cars) {
      if (c.dead) continue;
      const old = Math.floor(c.z / SEG), cs = segs[old];
      if (cs && (cs.f > 0 || cs.m > 0)) c.v = Math.max(c.v, MAXV * 0.62);
      c.z += c.v * dt;
      const nw = Math.floor(c.z / SEG);
      for (let i = old + 1; i <= nw; i++) {
        const s = segs[i];
        if (s && s.mEnd >= 0) { if (c.lane === chosenLane(gates[s.mEnd])) c.lane = 1; else respawn(c, ps.i); }
      }
      if (Math.floor(c.z / SEG) >= finishSeg) { c.dead = true; continue; }
      const ci = Math.floor(c.z / SEG);
      if (c.ahead && ci < ps.i) { const d = Math.abs(px - carX(c, ps, g)); if (d > 0.36 && d < 1.1 && Math.random() < 0.45) aceDo('wave', 1, t('mascotHello'), 1); }
      c.ahead = ci >= ps.i;
      if (ci === ps.i && inv <= 0 && v > c.v && Math.abs(px - carX(c, ps, g)) < 0.36) {
        if (drift) { drift = false; driftGain = 0; }
        aceDo('flail', 0.9, '💥', 5);
        const loss = Math.ceil(stack * 0.2); stack -= loss; v = c.v * 0.45; inv = 1.1; if (!shell.reduced) shake = 0.35;
        addFx(loss ? '−' + loss : '💥', '#ff7b6b');
        sound('notifyFold'); buzz([40, 30, 60]);
      }
    }
    // Chips
    for (const s of ps.sprites) {
      if (s.t === 'chip' && !s.got && Math.abs(px - g.pcs[s.lane].c) < 0.32) {
        s.got = true; stack += 10; nitro = Math.min(1, nitro + 0.09); addFx('+10', '#e8b84a'); aceDo('hop', 0.3, null, 1);
        const now = performance.now(); if (now - lastChipSnd > 90) { lastChipSnd = now; sound('notifyAction'); }
      }
    }
    // The fork: the branch the car is on deals its card and becomes the road.
    if (ng && ps.i >= ng.seg) takeGate(ng, nearest(geom(segs[ng.seg]), px), true);
    if (pos + PLAYER_Z >= finishSeg * SEG) { outro(true); return; }
    if (time <= 0) { time = 0; outro(false); return; }
    stepFx(dt);
    renderStats(false);
    renderNitro();
    renderPreview();
  }
  function stepParts(dt) {
    for (const p of parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += 26 * dt; }
    parts = parts.filter((p) => p.life > 0);
  }
  function stepFx(dt) { for (const f of fx) { f.life -= dt; f.y -= 46 * dt; } fx = fx.filter((f) => f.life > 0); }

  // Finish line or time out: the car rolls to a stop, the Ace celebrates or slumps, then the showdown.
  function outro(win) {
    state = 'outro'; outroT = 0; outroWin = win; boost = false;
    keys.l = keys.r = keys.n = keys.b = false;
    if (drift) endDrift();
    prev.hidden = true;
    if (win) { aceDo('spin', 1.6, t('mascotTada'), 9); sound('notifyAllIn'); }
    else { aceDo('slump', 1.4, '😩', 9); sound('notifyFold'); }
    renderStats(true);
  }
  function stepOutro(dt) {
    outroT += dt; v = Math.max(0, v - ACCEL * 1.4 * dt); pos += v * dt; aceTick(dt);
    yaw *= 0.9; slide *= 0.9; pv *= 0.9;
    const ps = findSeg(pos + PLAYER_Z); camY = CAMH + ps.p1.w.y;
    stepFx(dt); stepParts(dt);
    if (outroT > 1.8) over();
  }
  function over() {
    state = 'over'; overAt = performance.now();
    for (const g of gates) if (g.picked < 0) takeGate(g, Math.floor(Math.random() * 3), false);
    renderHand(); renderStats(true);
    const all = hole.concat(board), ev = evalCards(all), bonus = Math.ceil(Math.max(0, time)) * 5;
    const base = stack + bonus, score = base * ev.mult, prevBest = shell.best.get(), record = score > prevBest;
    if (record) shell.best.set(score);
    const cards = ev.best;
    const route = stageTheme.slice(0, STAGES).map((k) => TH[k].name).join(' → ');
    const tail = '<div class="ar-final">(' + fmt(stack) + ' + ' + fmt(bonus) + ') × ' + ev.mult + ' = <em>' + fmt(score) + '</em></div>'
      + '<p class="prun-route">' + esc(route) + '</p>'
      + '<p class="pg-dim">' + esc(record && prevBest ? t('arNewRecord') : t('arRecord', { n: fmt(Math.max(score, prevBest)) })) + '</p>'
      + '<p class="pg-blink">' + esc(t('gmAgain')) + '</p>';
    const title = outroWin ? 'Showdown' : t('prTimeUp');
    let shown = 0;
    const paint = () => {
      let row = '';
      for (let i = 0; i < cards.length; i++) row += i < shown ? cardHtml(cards[i], 'lg') : '<div class="pk lg back"></div>';
      shell.panel('<h2>' + esc(title) + '</h2><div class="ar-show">' + row + '</div><p>' + (shown >= cards.length ? esc(t(ev.nameKey)) : '&nbsp;') + '</p>'
        + (shown >= cards.length ? tail : ''));
    };
    const next = () => {
      if (state !== 'over') return;
      paint();
      if (shown < cards.length) revealTimer = setTimeout(() => { shown++; sound('notifyCard'); next(); }, shown ? 260 : 500);
      else if (record && prevBest) sound('notifyBigWin');
    };
    revealTimer = setTimeout(next, 300);
  }

  // ── Drawing ────────────────────────────────────────────────────────
  const carW = () => Math.min(W * 0.28, 100);
  function project(p, cx, cyw, cz) {
    p.c.x = -cx; p.c.y = p.w.y - cyw; p.c.z = p.w.z - cz; p.s.scale = DEPTH / p.c.z;
    p.s.x = W / 2 + p.s.scale * p.c.x * W / 2; p.s.y = cy - p.s.scale * p.c.y * H / 2; p.s.w = p.s.scale * ROAD * W / 2;
  }
  function band(y1, l1, r1, y2, l2, r2, col) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(l1, y1); ctx.lineTo(l2, y2); ctx.lineTo(r2, y2); ctx.lineTo(r1, y1); ctx.closePath(); ctx.fill();
  }
  function rr(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }

  function drawSky(th, alpha) {
    ctx.globalAlpha = alpha;
    const gr = ctx.createLinearGradient(0, 0, 0, cy);
    gr.addColorStop(0, th.sky[0]); gr.addColorStop(0.6, th.sky[1]); gr.addColorStop(1, th.sky[2]);
    ctx.fillStyle = gr; ctx.fillRect(-10, -10, W + 20, cy + 10);
    ctx.fillStyle = rgb(th.FAR); ctx.fillRect(-10, cy, W + 20, H - cy + 10);
    const o = ((skyOff * 4) % SKY_P + SKY_P) % SKY_P, typ = th.skyT;
    if (typ === 'sea' || typ === 'harbor') {
      const r = Math.min(W, H) * 0.09, sx = W * 0.62;
      ctx.fillStyle = typ === 'sea' ? '#ffe0a0' : '#f4eedf'; ctx.beginPath();
      ctx.arc(sx, cy - (typ === 'sea' ? r * 0.25 : r * 2.2), r * (typ === 'sea' ? 1 : 0.45), 0, 7); ctx.fill();
    }
    if (typ === 'mesa' || typ === 'peaks') { ctx.fillStyle = typ === 'mesa' ? '#fff1c8' : '#ffffff'; ctx.beginPath(); ctx.arc(W * 0.8, cy * 0.35, Math.min(W, H) * 0.04, 0, 7); ctx.fill(); }
    for (const it of SKY[th.key]) for (const rep of [0, SKY_P]) {
      const x = it.x - o + rep - (SKY_P - W) / 2; if (x + it.w < -50 || x > W + 50) continue;
      const h = it.h * cy;
      if (typ === 'city' || typ === 'harbor') {
        const hh = typ === 'harbor' ? h * 0.6 : h, lift = typ === 'harbor' ? cy * 0.03 : 0;
        ctx.fillStyle = th.a; ctx.fillRect(x, cy - hh - lift, it.w, hh + 2);
        if (it.l > 0.3) {
          ctx.fillStyle = th.b; ctx.globalAlpha = alpha * 0.6;
          for (let wy = cy - hh + 6; wy < cy - 6; wy += 9) for (let wx = x + 4; wx < x + it.w - 4; wx += 8) if (((wx * 7 + wy * 13) | 0) % 5 === 0) ctx.fillRect(wx, wy - lift, 3, 4);
          ctx.globalAlpha = alpha;
        }
      } else if (typ === 'mesa') {
        if (it.l < 0.55) continue;
        ctx.fillStyle = th.a; ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x + it.w * 0.18, cy - h * 0.8); ctx.lineTo(x + it.w * 0.82, cy - h * 0.8); ctx.lineTo(x + it.w, cy); ctx.fill();
        ctx.fillStyle = th.b; ctx.fillRect(x + it.w * 0.18, cy - h * 0.8, it.w * 0.64, Math.max(2, h * 0.06));
      } else if (typ === 'peaks') {
        const pw = it.w * 1.6, ph = h * 1.2;
        ctx.fillStyle = th.a; ctx.beginPath(); ctx.moveTo(x - pw * 0.2, cy); ctx.lineTo(x + it.w / 2, cy - ph); ctx.lineTo(x + it.w + pw * 0.2, cy); ctx.fill();
        ctx.fillStyle = th.b; ctx.beginPath(); ctx.moveTo(x + it.w / 2, cy - ph); ctx.lineTo(x + it.w / 2 - pw * 0.14, cy - ph * 0.72); ctx.lineTo(x + it.w / 2 + pw * 0.14, cy - ph * 0.72); ctx.fill();
      } else if (typ === 'sea') {
        if (it.l < 0.75) continue;
        ctx.fillStyle = '#3b4a7a'; ctx.beginPath(); ctx.ellipse(x + it.w / 2, cy - cy * 0.012, it.w * 0.6, h * 0.25, 0, Math.PI, 0); ctx.fill();
      }
    }
    if (typ === 'sea' || typ === 'harbor') {
      const sy = cy - cy * 0.012;
      ctx.fillStyle = typ === 'sea' ? '#3a5a8c' : '#1a2550'; ctx.fillRect(-10, sy, W + 20, cy * 0.012 + 1);
      ctx.fillStyle = typ === 'sea' ? 'rgba(255,224,160,.5)' : 'rgba(255,214,140,.35)';
      for (let i = 0; i < 4; i++) ctx.fillRect(W * 0.62 - 30 + i * 7, sy + 1 + i * 0.5, 60 - i * 14, 1);
    }
    ctx.globalAlpha = 1;
  }

  function drawWorld() {
    const ps = findSeg(pos + PLAYER_Z);
    const cur = themeOf(ps.stage);
    if (skyGate >= 0 && ps.i - skyGate < 80) { drawSky(TH[skyFrom], 1); drawSky(cur, clamp((ps.i - skyGate) / 80, 0, 1)); } else drawSky(cur, 1);
    const base = findSeg(pos), bp = (pos % SEG) / SEG;
    let dx = -(base.curve * bp), x = 0, maxy = H;
    const last = Math.min(segs.length - 1, base.i + DRAW);
    for (let i = base.i; i <= Math.min(segs.length - 1, last + 1); i++) {
      const s = segs[i]; s.g = geom(s); s.T = themeOf(s.stage);
      s.Tp = s.stage > 0 && s.i - gates[s.stage - 1].seg < 50 ? themeOf(s.stage - 1) : null;
    }
    for (let n = 0; n <= last - base.i; n++) {
      const s = segs[base.i + n];
      project(s.p1, px * ROAD - x, camY, pos); project(s.p2, px * ROAD - x - dx, camY, pos);
      x += dx; dx += s.curve; s.clip = maxy;
      if (s.p1.c.z <= DEPTH || s.p2.s.y >= s.p1.s.y || s.p2.s.y >= maxy) continue;
      const a = s.p1.s, b = s.p2.s, alt = Math.floor(s.i / 3) % 2, fin = s.i >= finishSeg && s.i < finishSeg + 4;
      const nx = segs[s.i + 1] || s, g1 = s.g, g2 = nx.g || g1, T = s.T;
      const bl = s.Tp ? clamp((s.i - gates[s.stage - 1].seg) / 50, 0, 1) : 1;
      const col = (k) => bl < 1 ? rgb(mixA(s.Tp[k][alt], T[k][alt], bl)) : rgb(T[k][alt]);
      ctx.fillStyle = col('G'); ctx.fillRect(0, b.y, W, a.y - b.y + 1);
      const U = (p, u) => p.x + p.w * u;
      const road = fin ? (s.i % 2 ? '#f4eedf' : '#0d1117') : col('D');
      const piece = (c1, h1, c2, h2, rw) => {
        band(a.y, U(a, c1 - h1 - rw), U(a, c1 + h1 + rw), b.y, U(b, c2 - h2 - rw), U(b, c2 + h2 + rw), col('R'));
        band(a.y, U(a, c1 - h1), U(a, c1 + h1), b.y, U(b, c2 - h2), U(b, c2 + h2), road);
      };
      if (g1.ghosts && g2.ghosts) for (let l = 0; l < 3; l++) {
        const q1 = g1.ghosts[l], q2 = g2.ghosts[l];
        if (!q1 || !q2 || q1.a < 0.05) continue;
        ctx.globalAlpha = q1.a; piece(q1.c, q1.hw, q2.c, q2.hw, 0.06); ctx.globalAlpha = 1;
      }
      if (g1.joined) {
        const L1 = envL(g1), R1 = envR(g1), L2 = envL(g2), R2 = envR(g2), rw = 0.12 * (R1 - L1) / 2;
        band(a.y, U(a, L1 - rw), U(a, R1 + rw), b.y, U(b, L2 - rw), U(b, R2 + rw), col('R'));
        band(a.y, U(a, L1), U(a, R1), b.y, U(b, L2), U(b, R2), road);
        if (alt && !fin) for (let l = 0; l < 2; l++) {
          if (g1.pcs[l + 1].c - g1.pcs[l].c <= 0.4) continue;
          const m1 = (g1.pcs[l].c + g1.pcs[l + 1].c) / 2, m2 = (g2.pcs[l].c + g2.pcs[l + 1].c) / 2, lw = 0.022 * (R1 - L1) / 2;
          band(a.y, U(a, m1 - lw), U(a, m1 + lw), b.y, U(b, m2 - lw), U(b, m2 + lw), '#e9e4d6');
        }
      } else for (let l = 0; l < 3; l++) { const q1 = g1.pcs[l], q2 = g2.pcs[l]; piece(q1.c, q1.hw, q2.c, q2.hw, 0.05 * Math.min(1, s.f * 4)); }
      const fogA = Math.min(0.18, Math.pow(n / DRAW, 3) * 0.25);
      if (fogA > 0.02) { ctx.fillStyle = rgb(T.F, fogA); ctx.fillRect(0, b.y, W, a.y - b.y + 1); }
      maxy = b.y;
    }
    // Sprites, far to near, each clipped by the road in front of it.
    const bySeg = new Map();
    for (const c of cars) { if (c.dead) continue; const i = Math.floor(c.z / SEG); if (i >= base.i && i <= last) { if (!bySeg.has(i)) bySeg.set(i, []); bySeg.get(i).push(c); } }
    for (let n = last - base.i; n > 0; n--) {
      const s = segs[base.i + n]; if (s.p1.c.z <= DEPTH) continue;
      const sc = s.p1.s.scale * W / 2, sx = s.p1.s.x, sy = s.p1.s.y, g = s.g;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, s.clip); ctx.clip();
      for (const sp of s.sprites) {
        if (sp.got) continue;
        if (sp.t === 'side') { const e = sp.side < 0 ? envL(g) : envR(g); drawSide(s.T.side, sx + sc * (e + sp.side * 0.32) * ROAD, sy, sc, sp.v, sp.side); }
        else if (sp.t === 'chip') drawChip(sx + sc * g.pcs[sp.lane].c * ROAD, sy, sc);
      }
      if (s.gate) drawGate(s, sc, sx, sy, g);
      const cs = bySeg.get(s.i);
      if (cs) for (const c of cs) { const tt = (c.z % SEG) / SEG; drawCarRear(sx + sc * carX(c, s, g) * ROAD, sy + (s.p2.s.y - sy) * tt, sc * 520, c.col); }
      ctx.restore();
    }
    const spd = v / MAXV;
    if ((spd > 0.88 || boost) && !shell.reduced && state === 'run') {
      ctx.strokeStyle = 'rgba(244,238,223,' + (boost ? 0.35 : 0.18) + ')'; ctx.lineWidth = 1.5;
      for (let i = 0; i < (boost ? 14 : 7); i++) {
        const an = Math.random() * Math.PI * 2, r0 = Math.max(W, H) * (0.45 + Math.random() * 0.2), r1 = r0 + 30 + spd * 60;
        ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(an) * r0, cy + Math.sin(an) * r0 * 0.7); ctx.lineTo(W / 2 + Math.cos(an) * r1, cy + Math.sin(an) * r1 * 0.7); ctx.stroke();
      }
    }
    for (const p of parts) { ctx.fillStyle = 'rgba(' + p.c + ',' + Math.max(0, p.life) * 0.5 + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
  }
  /** A card of the player's deck standing on the road, centred on (X, cyc). */
  function card(X, cyc, w, n) {
    ctx.save(); ctx.translate(X, cyc);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(-w / 2 + 2, -w * 0.7 + 3, w, w * 1.4, w * 0.1); ctx.fill();
    drawFace(ctx, img, n, w, w * 1.4);
    ctx.restore();
  }
  function drawGate(s, sc, sx, sy, g) {
    const gate = s.gate, br = branches[gate.k] || [];
    for (let l = 0; l < 3; l++) {
      const p = g.pcs[l], X = sx + sc * p.c * ROAD, half = sc * p.hw * 1.15 * ROAD, h = sc * 1500, top = sy - h, pw = Math.max(1.5, sc * 70);
      ctx.globalAlpha = gate.picked >= 0 && gate.picked !== l ? 0.25 : 1;
      ctx.fillStyle = '#0d1117'; ctx.fillRect(X - half - pw / 2, top, pw, h); ctx.fillRect(X + half - pw / 2, top, pw, h);
      const bh = Math.max(4, sc * 240); ctx.fillStyle = '#e8b84a'; ctx.fillRect(X - half, top - bh * 0.2, half * 2, bh);
      if (bh > 8 && br[l]) {
        ctx.fillStyle = '#0d1117'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.font = '700 ' + Math.round(bh * 0.55) + 'px Inter, system-ui, sans-serif';
        ctx.fillText(TH[br[l]].name.toUpperCase(), X, top + bh * 0.55, half * 1.9);
      }
      const cw = sc * 340;
      if (cw > 2) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(X - cw * 0.04, sy - sc * 120, cw * 0.08, sc * 120); card(X, sy - sc * 120 - cw * 0.7, cw, gate.cards[l]); }
      ctx.globalAlpha = 1;
    }
  }
  function drawChip(X, y, sc) {
    const r = sc * 130; if (r < 0.8) return;
    const c2 = y - sc * 160;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(X, y, r, r * 0.3, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#e8b84a'; ctx.beginPath(); ctx.arc(X, c2, r, 0, 7); ctx.fill();
    ctx.strokeStyle = '#f4eedf'; ctx.lineWidth = r * 0.3; ctx.setLineDash([r * 0.45, r * 0.5]); ctx.beginPath(); ctx.arc(X, c2, r * 0.78, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#b5852a'; ctx.beginPath(); ctx.arc(X, c2, r * 0.4, 0, 7); ctx.fill();
  }
  function drawSide(kind, X, y, sc, vv, side) {
    const u = sc * 100; if (u < 0.1) return;
    if (kind === 'post') {
      const h = u * 9, w = u * 3;
      ctx.fillStyle = '#0d1117'; ctx.fillRect(X - u * 0.3, y - h, u * 0.6, h);
      ctx.fillStyle = '#f4eedf'; rr(X - w / 2, y - h - w * 0.9, w, w, w * 0.18); ctx.fill();
      if (w > 7) { ctx.fillStyle = vv < 2 ? '#c2303a' : '#0d1117'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.font = Math.round(w * 0.75) + 'px serif'; ctx.fillText(SUITS[vv] + VS, X, y - h - w * 0.18); }
    } else if (kind === 'palm') {
      const h = u * 16, tx = X + side * u * 1.5, ty = y - h;
      ctx.strokeStyle = '#6b4a2e'; ctx.lineWidth = Math.max(1, u * 0.9); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(X, y); ctx.quadraticCurveTo(X + side * u * 3, y - h * 0.6, tx, ty); ctx.stroke();
      ctx.strokeStyle = '#2f7a3e'; ctx.lineWidth = Math.max(1, u * 1.1);
      for (let k = 0; k < 6; k++) { const an = -Math.PI / 2 + (k - 2.5) * 0.55; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(an) * u * 4, ty + Math.sin(an) * u * 4 - u, tx + Math.cos(an) * u * 6, ty + Math.sin(an) * u * 3 + u * 2.5); ctx.stroke(); }
      ctx.lineCap = 'butt';
    } else if (kind === 'cactus') {
      const h = u * 7, w = u * 1.6;
      ctx.fillStyle = '#3f7a3a'; rr(X - w / 2, y - h, w, h, w / 2); ctx.fill();
      rr(X - w * 2, y - h * 0.7, w * 0.9, h * 0.35, w * 0.45); ctx.fill(); ctx.fillRect(X - w * 1.6, y - h * 0.42, w * 1.2, w * 0.8);
      rr(X + w * 1.1, y - h * 0.85, w * 0.9, h * 0.4, w * 0.45); ctx.fill(); ctx.fillRect(X + w * 0.4, y - h * 0.5, w * 1.2, w * 0.8);
    } else if (kind === 'pine') {
      const h = u * 14, w = u * 6;
      ctx.fillStyle = '#4a3424'; ctx.fillRect(X - u * 0.5, y - h * 0.2, u, h * 0.2);
      ctx.fillStyle = vv % 2 ? '#1f4a2e' : '#245636';
      for (let k = 0; k < 3; k++) { const ty = y - h * (0.2 + k * 0.25), ww = w * (1 - k * 0.25); ctx.beginPath(); ctx.moveTo(X - ww / 2, ty); ctx.lineTo(X, ty - h * 0.42); ctx.lineTo(X + ww / 2, ty); ctx.fill(); }
    } else if (kind === 'lamp') {
      const h = u * 13, lx = X - side * u * 2.4, ly = y - h + u * 0.9;
      ctx.fillStyle = '#14161c'; ctx.fillRect(X - u * 0.3, y - h, u * 0.6, h); ctx.fillRect(X - side * u * 2.6, y - h, u * 2.6, u * 0.5);
      const gr = Math.min(u * 3, 50), gl = ctx.createRadialGradient(lx, ly, 0, lx, ly, gr);
      gl.addColorStop(0, 'rgba(255,214,140,.45)'); gl.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = gl; ctx.fillRect(lx - gr, ly - gr, gr * 2, gr * 2);
      ctx.fillStyle = '#ffe6b0'; ctx.beginPath(); ctx.arc(lx, ly, u * 0.7, 0, 7); ctx.fill();
    }
  }
  function drawCarRear(X, by, w, col) {
    if (w < 2.5) return;
    const h = w * 0.62, x = X - w / 2, y = by - h;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(X, by, w * 0.55, w * 0.07, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#0d1117'; rr(x + w * 0.04, by - h * 0.32, w * 0.18, h * 0.32, w * 0.05); ctx.fill(); rr(x + w * 0.78, by - h * 0.32, w * 0.18, h * 0.32, w * 0.05); ctx.fill();
    ctx.fillStyle = col; rr(x, y + h * 0.2, w, h * 0.68, w * 0.16); ctx.fill(); rr(x + w * 0.16, y, w * 0.68, h * 0.4, w * 0.14); ctx.fill();
    ctx.fillStyle = '#1b2533'; rr(x + w * 0.22, y + h * 0.06, w * 0.56, h * 0.26, w * 0.08); ctx.fill();
    ctx.fillStyle = '#ff4a4f'; ctx.beginPath(); ctx.arc(x + w * 0.15, y + h * 0.52, w * 0.07, 0, 7); ctx.arc(x + w * 0.85, y + h * 0.52, w * 0.07, 0, 7); ctx.fill();
  }

  // The player's car, in two halves around the Ace: what is behind him on the
  // stage's canvas, his seat and the body on the front one.
  function carFrame() {
    const w = carW(), h = w * 0.42;
    return { w, h, x: W / 2 + slide, y: H - 10 + bob };
  }
  function seatShape(c, sx, head) {
    const { w, h } = carFrame();
    ctx = c;
    ctx.fillStyle = '#3a1c1e'; rr(sx - w * 0.135, -h * 1.22, w * 0.27, h * 0.4, w * 0.06); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.08)'; rr(sx - w * 0.1, -h * 1.18, w * 0.2, h * 0.06, h * 0.03); ctx.fill();
    if (head) { ctx.fillStyle = '#3a1c1e'; rr(sx - w * 0.07, -h * 1.45, w * 0.14, h * 0.26, w * 0.05); ctx.fill(); }
  }
  function drawCarBack(g) {
    const { w, h, x, y } = carFrame();
    ctx = g; ctx.save(); ctx.translate(x, y); ctx.rotate(yaw);
    ctx.fillStyle = 'rgba(0,0,0,.42)'; ctx.beginPath(); ctx.ellipse(0, 1, w * 0.54, w * 0.075, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#0b0e12'; rr(-w * 0.48, -h * 0.6, w * 0.18, h * 0.62, w * 0.08); ctx.fill(); rr(w * 0.30, -h * 0.6, w * 0.18, h * 0.62, w * 0.08); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-w * 0.31, -h); ctx.lineTo(-w * 0.27, -h * 1.55); ctx.quadraticCurveTo(-w * 0.25, -h * 1.82, -w * 0.12, -h * 1.84);
    ctx.lineTo(w * 0.12, -h * 1.84); ctx.quadraticCurveTo(w * 0.25, -h * 1.82, w * 0.27, -h * 1.55); ctx.lineTo(w * 0.31, -h); ctx.closePath();
    ctx.fillStyle = 'rgba(160,200,230,.24)'; ctx.fill(); ctx.strokeStyle = '#d7dce2'; ctx.lineWidth = Math.max(1.2, w * 0.022); ctx.lineJoin = 'round'; ctx.stroke();
    seatShape(g, w * 0.17, true);
    ctx.restore();
  }
  function drawCarFront(g) {
    const { w, h, x, y } = carFrame();
    ctx = g; ctx.save(); ctx.translate(x, y); ctx.rotate(yaw);
    seatShape(g, -w * 0.17, false);
    ctx.beginPath();
    ctx.moveTo(-w * 0.5, -h * 0.28);
    ctx.bezierCurveTo(-w * 0.55, -h * 0.78, -w * 0.5, -h * 1.14, -w * 0.34, -h * 1.14);
    ctx.quadraticCurveTo(-w * 0.18, -h * 1.02, 0, -h * 1.04);
    ctx.quadraticCurveTo(w * 0.18, -h * 1.02, w * 0.34, -h * 1.14);
    ctx.bezierCurveTo(w * 0.5, -h * 1.14, w * 0.55, -h * 0.78, w * 0.5, -h * 0.28);
    ctx.quadraticCurveTo(w * 0.48, -h * 0.06, w * 0.3, -h * 0.06);
    ctx.lineTo(-w * 0.3, -h * 0.06);
    ctx.quadraticCurveTo(-w * 0.48, -h * 0.06, -w * 0.5, -h * 0.28); ctx.closePath();
    const bg = ctx.createLinearGradient(0, -h * 1.15, 0, 0);
    bg.addColorStop(0, '#e8505a'); bg.addColorStop(0.45, '#c2303a'); bg.addColorStop(1, '#861820');
    ctx.fillStyle = bg; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.ellipse(-w * 0.32, -h * 0.98, w * 0.1, h * 0.07, -0.3, 0, 7); ctx.ellipse(w * 0.32, -h * 0.98, w * 0.1, h * 0.07, 0.3, 0, 7); ctx.fill();
    for (const sx of [-1, 1]) {
      const lx = sx * w * 0.32, ly = -h * 0.64, r = w * 0.075;
      ctx.fillStyle = '#3a0d10'; ctx.beginPath(); ctx.arc(lx, ly, r * 1.18, 0, 7); ctx.fill();
      ctx.fillStyle = boost ? '#ffb347' : '#ff3b3f'; ctx.beginPath(); ctx.arc(lx, ly, r, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,230,200,.55)'; ctx.beginPath(); ctx.arc(lx - r * 0.3, ly - r * 0.3, r * 0.35, 0, 7); ctx.fill();
    }
    ctx.fillStyle = '#5e1117'; rr(-w * 0.14, -h * 0.66, w * 0.28, h * 0.3, h * 0.14); ctx.fill();
    ctx.fillStyle = '#f4eedf'; rr(-w * 0.11, -h * 0.62, w * 0.22, h * 0.22, h * 0.1); ctx.fill();
    ctx.fillStyle = '#0d1117'; ctx.font = '700 ' + Math.max(6, Math.round(h * 0.2)) + 'px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('A♠' + VS, 0, -h * 0.45);
    ctx.fillStyle = '#262b32'; rr(-w * 0.42, -h * 0.3, w * 0.84, h * 0.17, h * 0.085); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(-w * 0.38, -h * 0.28, w * 0.76, h * 0.04, h * 0.02); ctx.fill();
    for (const ex of [-0.2, 0.2]) { ctx.fillStyle = '#b9c0c8'; ctx.beginPath(); ctx.arc(w * ex, -h * 0.16, w * 0.035, 0, 7); ctx.fill(); ctx.fillStyle = '#1a1e24'; ctx.beginPath(); ctx.arc(w * ex, -h * 0.16, w * 0.018, 0, 7); ctx.fill(); }
    if (boost) for (const ex of [-0.2, 0.2]) {
      const fl = (0.6 + Math.random() * 0.6) * w * 0.16;
      ctx.fillStyle = '#ffd27a'; ctx.beginPath(); ctx.ellipse(w * ex, -h * 0.16 + fl * 0.45, w * 0.035, fl * 0.5, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#ff8a3d'; ctx.beginPath(); ctx.ellipse(w * ex, -h * 0.16 + fl * 0.3, w * 0.02, fl * 0.3, 0, 0, 7); ctx.fill();
    }
    if (drift) {
      ctx.rotate(-yaw); ctx.font = '700 ' + Math.round(Math.max(12, w * 0.14)) + 'px Inter, system-ui, sans-serif';
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.6)';
      const s = 'DRIFT' + (driftGain ? ' +' + driftGain : ''); ctx.strokeText(s, 0, -h * 2.5); ctx.fillStyle = '#ffd27a'; ctx.fillText(s, 0, -h * 2.5);
    }
    ctx.restore();
  }
  /** The Ace in the driver's seat: the SVG mascot, moved with the car. */
  function placeAce() {
    const { w, h, x, y } = carFrame(), p = act.a ? clamp(act.t / act.dur, 0, 1) : 1;
    let dy = 0, rot = 0, pose = 'idle';
    switch (act.a) {
      case 'hop': dy = -Math.sin(p * Math.PI) * h * 0.15; break;
      case 'jump': dy = -Math.sin(p * Math.PI) * h * 0.4; pose = 'prun-up'; break;
      case 'spin': dy = -Math.sin(p * Math.PI) * h * 0.45; pose = 'prun-up'; break;
      case 'up': dy = h * 0.06 * Math.sin(p * Math.PI); pose = p < 0.7 ? 'prun-up' : 'idle'; break;
      case 'flail': rot = Math.sin(act.t * 38) * 0.35 * (1 - p); dy = -Math.sin(p * Math.PI) * h * 0.25; pose = 'prun-flail'; break;
      case 'shrug': dy = -Math.sin(p * Math.PI) * h * 0.08; pose = 'prun-shrug'; break;
      case 'wave': pose = 'prun-wave'; break;
      case 'pump': dy = -Math.sin(p * Math.PI) * h * 0.1; pose = 'prun-pump'; break;
      case 'slump': rot = -0.4 * Math.min(1, p * 1.5); dy = h * 0.18 * Math.min(1, p * 1.5); pose = 'prun-slump'; break;
    }
    if (state === 'title') pose = 'prun-wave';
    if (state === 'over') pose = outroWin ? 'prun-up' : 'prun-slump';
    if (drift) rot += driftDir * 0.28;
    if (state === 'run' && wasOff && !shell.reduced) dy += (Math.random() - 0.5) * h * 0.08;
    if (state === 'run' && time < 8 && !shell.reduced) rot += Math.sin(performance.now() / 20) * 0.04;
    ace.pose(pose);
    ace.mood(act.a === 'spin' || (state === 'over' && outroWin) ? 'mc-m-yay' : 'mc-m-smile');
    // The card (84 sprite px wide) as wide as the seat; its bottom below the seat's top.
    const s = (w * 0.26) / 84, lx = -w * 0.17, ly = -h * 0.94 + dy + 56 * s;
    const c = Math.cos(yaw), sn = Math.sin(yaw);
    const tilt = yaw * 0.2 + (keys.l ? -0.08 : keys.r ? 0.08 : 0) + rot;
    ace.place(x + c * lx - sn * ly, y + sn * lx + c * ly, s, shell.k, tilt * 180 / Math.PI);
    ace.fade(inv > 0 && Math.floor(inv * 12) % 2 ? 0.4 : 1);
  }
  function drawBubble(g) {
    if (bub.t <= 0 || !bub.s) return;
    const { w, h, x, y } = carFrame();
    const al = Math.max(0, Math.min(1, bub.t * 4, (bub.d - bub.t) * 8 + 0.2));
    const fs = Math.max(11, Math.round(w * 0.12));
    g.font = '800 ' + fs + 'px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    const tw = g.measureText(bub.s).width, bw = tw + fs * 1.3, bh = fs * 1.85;
    const ax = x - w * 0.3, ay = y - h * 1.75, bx = clamp(ax - bw, 4, W - bw - 4), by = ay - bh - h * 0.35;
    g.globalAlpha = al; ctx = g;
    g.fillStyle = 'rgba(0,0,0,.35)'; rr(bx + 2, by + 3, bw, bh, bh / 2); g.fill();
    g.fillStyle = '#fbf7ee'; rr(bx, by, bw, bh, bh / 2); g.fill();
    g.beginPath(); g.moveTo(bx + bw - bh * 0.9, by + bh - 1); g.lineTo(bx + bw - bh * 0.3, by + bh - 1); g.lineTo(ax + 4, ay); g.closePath(); g.fill();
    g.fillStyle = '#141414'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(bub.s, bx + bw / 2, by + bh / 2 + 1); g.textBaseline = 'alphabetic';
    g.globalAlpha = 1;
  }
  function drawFx(g) {
    ctx = g; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    for (const f of fx) {
      g.globalAlpha = Math.min(1, f.life * 1.5);
      if (f.card != null) card(W / 2, f.y, Math.min(W, H) * 0.1, f.card);
      else {
        g.font = '800 ' + (f.big ? 26 : 19) + 'px Inter, system-ui, sans-serif'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.55)';
        g.strokeText(f.s, W / 2, f.y); g.fillStyle = f.col; g.fillText(f.s, W / 2, f.y);
      }
    }
    g.globalAlpha = 1;
  }
  function sizeFront() {
    const c = shell.canvas;
    if (front.width !== c.width || front.height !== c.height) { front.width = c.width; front.height = c.height; }
    gF.setTransform(shell.dpr * shell.k, 0, 0, shell.dpr * shell.k, 0, 0);
    gF.clearRect(0, 0, shell.W, shell.H);
  }
  function draw(g) {
    W = shell.W; H = shell.H; cy = H * 0.44;
    sizeFront();
    ctx = g; g.save();
    if (shake > 0) g.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 5);
    drawWorld();
    drawCarBack(g);
    g.restore();
    drawCarFront(gF);
    drawFx(gF);
    drawBubble(gF);
    placeAce();
  }

  reset();
  pos = (gates[0].seg - 150) * SEG; { const ps = findSeg(pos + PLAYER_Z); camY = CAMH + ps.p1.w.y; }
  titlePanel();
  try { if (navigator.webdriver) window.__pthRun = { state: () => state, game: () => ({ pos, px, time, stack, board: board.slice(), gates, stageTheme: stageTheme.slice() }), segAt: () => findSeg(pos + PLAYER_Z).i, setTime: (x) => { time = x; } }; } catch (e) {}

  return {
    update, draw, input,
    running: () => state === 'run' || state === 'outro',
    theme() {},
    resize() {},
    destroy() {
      clearTimeout(revealTimer);
      try { if (window.__pthRun) delete window.__pthRun; } catch (e) {}
      front.remove(); prev.remove(); ace.remove();
      shell.root.classList.remove('prun-pad');
      if (nitroBtn && nitroWas) { gauge.remove(); nitroBtn.textContent = nitroWas.text; if (nitroWas.label) nitroBtn.setAttribute('aria-label', nitroWas.label); nitroBtn.classList.remove('prun-ready', 'prun-burn'); }
    },
  };
}
