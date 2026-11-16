// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Poker Run — the Ace's convertible on an OutRun-style road (web extension,
// narmod 2026-11-13). Arcade page (games/index.mjs), after Ace Dash.
//
// A segment road in pseudo-3D (curves, hills) drawn on the shell's canvas,
// the camera behind the car. Six stages from Las Vegas, all of the same
// length: at the end of the first five the road forks in two, left or right
// like OutRun (web.58, narmod: « two, it's more logical and easier »); the
// branch the car takes deals that board card (flop ×3, turn, river) and leads
// to the next scene (Las Vegas, Saint-Tropez, Monument Valley, Chamonix,
// Monaco). Before each fork a preview shows the two cards (the hand each one
// makes; the car no longer slows down there, web.66). Every fork adds
// EXTEND seconds to the clock; when it runs out the dealer completes the
// board. The result shows the course like OutRun's map: the stages driven,
// the branch left aside at each fork, where the car stopped and what was
// left to the finish.
//   Steer      ← → held (keys, ◀ ▶ of the pad), a swipe nudges
//   Nitro      ↑, Space, ▲ held (a tap: a short burst); refilled by the
//              chips and the drifts
//   Brake      ↓, ▼ held (a swipe down: a short brake)
//   Drift      steer into a bend at speed, the harder the more: +5 chips and some
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
// Défi du jour (web.68, narmod: « mode 4 of the proposals », OutRun 2's Time
// Attack): the road, the cards, the scenes and the traffic drawn from the UTC
// date — each stage from its own stream (stage, scene, level), so the same
// forks give the same road whatever the timing; no car comes back once passed.
// The best run of the day is kept with its line (a sample every 0.1 s): its
// ghost drives beside you, and the HUD tells how far ahead or behind you are.
// Texts: prHint, prRules, prTimeUp plus shared keys (blChips, gameTimeLabel,
// arLevel, arTapStart, arRecord, arNewRecord, gmAgain, mascotHello, mascotTada,
// the hand names h1n…h10n).
// ═══════════════════════════════════════════════════════════════════

import { evalCards, suitOf } from './poker-hand.mjs';
import { drawCar, seatPoint } from './car3d.mjs';
import { fmt, cardHtml, imageCache, drawFace, aceActor, ACE_ID, RANKS, isRed } from './common.mjs';
import { titleScreen, titleStep } from './title.mjs';
import { hofOn, hofStart, hofEnd, hofPanel } from './hof.mjs';
import { endScreen, listHtml } from './end.mjs';
import { rng } from './deal.mjs';
import { dayKey } from './solitaire-rules.mjs';
import { spriteCache } from './sprites.mjs';

// ── Road ───────────────────────────────────────────────────────────
const SEG = 200, ROAD = 2000, DRAW = 300, CAMH = 1400, FOV = 100;
const DEPTH = 1 / Math.tan(FOV / 2 * Math.PI / 180), PLAYER_Z = CAMH * DEPTH;
// web.63 (narmod: « closer to Mario Kart »): a quicker pick-up (4.5 → 3.2 s to top
// speed) and less push out of the bends (0.27 → 0.17).
const MAXV = SEG * 62, ACCEL = MAXV / 3.2, OFFROAD = MAXV / 3.5, CENTRI = 0.17;
// Mini-turbo: a drift held this long charges blue then orange sparks; its end gives a turbo of that length.
const MT_BLUE = 0.9, MT_ORANGE = 1.8, MT_SHORT = 0.6, MT_LONG = 1.15, MT_CAP = 1.32;
const LANE_OFF = [-0.66, 0, 0.66];          // lane centres, in half-road widths
// Traffic: bright bodies that stand out on the dark tarmac, day and night
// (web.59, narmod: « the other cars, I don't see them very well sometimes »).
const CAR_COLS = ['#ece6d6', '#2e86de', '#f0812a', '#2fb37c', '#a066dc', '#e5cf3b', '#e0527a'];
// Hit: the gap between the player's car and a car's middle under which they touch
// (half-road units). Lanes are 0.66 apart: at 0.36 two cars side by side left
// no way through; at 0.25 there is a window between them.
const HIT = 0.25;
const TRAFFIC = 48, CAR_KINDS = ['car', 'van', 'sport'];
const BR_OFF = [-0.5, 0.5];                 // the two branches of a fork: the road's left and right halves
const STAGES = 6, FORKS = 5, TIME0 = 32, EXTEND = 22, GATE_ZONE = 170, SPLIT = 1, MERGE = 60;
/** Segments of road before the fork of stage k (the last stage, k = FORKS, runs as long to the finish). */
export const stageLen = (k) => 740 + k * 40;
/** The branch (0 left, 1 right) a car in lane l keeps at a fork: the middle lane goes either way. */
export const branchOfLane = (l, side) => (l === 0 ? 0 : l === 2 ? 1 : side);
// Dame de Cœur (web.66, narmod: « mode 2 of the proposals », OutRun 2's Heart
// Attack in a poker key): the Queen of Hearts rides beside the Ace and asks
// one thing per stage, against the clock. Done in half the time: ♥♥♥, in 80 %:
// ♥♥, in time: ♥; missed: none. The hearts multiply the score: × (1 + ♥ / 10).
//   n: the target (seconds or a count), lim: the time allowed (s).
const QUEEN = {
  drift: { key: 'prQDrift', n: 2, lim: 14 }, chips: { key: 'prQChips', n: 5, lim: 14 },
  pass: { key: 'prQPass', n: 3, lim: 14 }, clean: { key: 'prQClean', n: 10, lim: 10 },
  nitro: { key: 'prQNitro', n: 2, lim: 12 }, fast: { key: 'prQFast', n: 4, lim: 12 },
  left: { key: 'prQLeft', n: 0, lim: 0 }, right: { key: 'prQRight', n: 0, lim: 0 },
};
/** Hearts for a request done in `used` of `lim` seconds (the fork ones: 3 or 0). */
export const queenHearts = (used, lim, done) => (!done ? 0 : !lim ? 3 : used <= lim * 0.5 ? 3 : used <= lim * 0.8 ? 2 : 1);
export const queenMult = (h) => Math.round((1 + h / 10) * 10) / 10;
const GATE_LABELS = ['FLOP 1/3', 'FLOP 2/3', 'FLOP 3/3', 'TURN', 'RIVER'];
const BOARD_TAGS = ['F', 'F', 'F', 'T', 'R'];
const SUITS = ['♦', '♥', '♠', '♣'], VS = '︎';

// ── Scenes, one per branch (proper names: nothing to translate) ─────
const TH = {
  vegas: { name: 'Las Vegas', sky: ['#0a1322', '#1d2b46', '#c8743a'], g: ['#1c5639', '#195034'], r: ['#e8b84a', '#f4eedf'], d: ['#2b3038', '#272b33'], fog: '#1e283e', skyT: 'city', side: 'post', night: true, a: '#101a2b', b: '#e8b84a' },
  // Saint-Tropez (web.64, narmod: « it's a desert — it should be the Côte d'Azur »): the coast road, the
  // garrigue inland, a beach and the sea on the right, umbrella pines, villas, palms and parasols.
  tropez: { name: 'Saint-Tropez', sky: ['#23305e', '#d9667a', '#ffbe7a'], g: ['#6f8f45', '#678540'], r: ['#f4eedf', '#c2303a'], d: ['#3d424a', '#383c44'], fog: '#eaa886', skyT: 'sea', side: 'riviera', coast: true, a: '#2f4f86', b: '#ffe0a0' },
  valley: { name: 'Monument Valley', sky: ['#2e63a8', '#86b4dc', '#f3d9a8'], g: ['#c88a4c', '#bd7f44'], r: ['#f4eedf', '#8a3b1c'], d: ['#4b4541', '#46403c'], fog: '#ecceA6', skyT: 'mesa', side: 'cactus', a: '#9c4f2c', b: '#c46a3c' },
  chamonix: { name: 'Chamonix', sky: ['#22487e', '#79a3cd', '#dfe9f1'], g: ['#3f7a3a', '#386f34'], r: ['#f4eedf', '#c2303a'], d: ['#33373e', '#2f333a'], fog: '#cddae8', skyT: 'peaks', side: 'pine', a: '#5b6f8a', b: '#f4f7fa' },
  monaco: { name: 'Monaco', sky: ['#140a2c', '#3b1d5e', '#8a3f86'], g: ['#2b2f3e', '#272a38'], r: ['#c2303a', '#f4eedf'], d: ['#24262e', '#212329'], fog: '#3c285a', skyT: 'harbor', side: 'lamp', night: true, a: '#1b1430', b: '#ffd68c' },
};
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb = (a, al) => al == null ? 'rgb(' + (a[0] | 0) + ',' + (a[1] | 0) + ',' + (a[2] | 0) + ')' : 'rgba(' + (a[0] | 0) + ',' + (a[1] | 0) + ',' + (a[2] | 0) + ',' + al + ')';
const mixA = (a, b, t) => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t);
for (const k in TH) {
  const s = /** @type {any} */ (TH[k]);
  s.key = k; s.G = s.g.map(hex); s.R = s.r.map(hex); s.D = s.d.map(hex); s.F = hex(s.fog); s.FAR = mixA(s.G[0], s.F, 0.75);
}
// How hilly each scene's road is (× the base); Chamonix climbs and dives (web.64).
const HILLS = { vegas: 0.5, tropez: 0.9, valley: 1, chamonix: 2.6, monaco: 0.8 };
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
/* The fork's two choices at the sides, over the verges, the road and the car left clear (web.77, narmod: « it hides the road »). */
#pth-game .prun-prev{position:absolute;left:6px;right:6px;top:64px;z-index:397;display:flex;justify-content:space-between;align-items:flex-start;gap:6px;pointer-events:none}
#pth-game .prun-prev[hidden]{display:none}
#pth-game .prun-prev .prun-tag{order:2;flex:1 1 0;min-width:0;padding-top:2px;text-align:center;font:700 12px 'Inconsolata',monospace;letter-spacing:.06em;color:#d8b25a;text-shadow:0 1px 3px #000}
#pth-game .prun-prev .prun-opt:first-of-type{order:1}
#pth-game .prun-prev .prun-opt:last-of-type{order:3}
#pth-game .prun-opt{flex:none;width:clamp(84px,24%,150px);background:rgba(13,17,23,.72);border:1.5px solid rgba(255,255,255,.14);border-radius:10px;padding:5px 3px;display:flex;flex-direction:column;align-items:center;gap:2px;color:#f5f0e3;text-align:center}
#pth-game .prun-opt.on{border-color:#d8b25a;background:rgba(40,32,10,.9)}
#pth-game .prun-opt .pk{margin:0}
#pth-game .prun-opt b{font:600 12px/1.1 'Inter',system-ui,sans-serif}
#pth-game .prun-opt em{font:700 12px 'Inconsolata',monospace;font-style:normal;color:#d8b25a}
#pth-game .prun-opt .prun-lvl{display:flex;align-items:center;gap:2px;white-space:nowrap;font:700 11px 'Inconsolata',monospace;color:#e8b84a}
#pth-game .prun-opt .prun-lvl i{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.18)}
#pth-game .prun-opt .prun-lvl i.on{background:#e0573f}
#pth-game .prun-opt .prun-lvl i.on.e{background:#5fbf6a}
#pth-game .prun-opt .prun-lvl b{margin-left:4px;font:inherit}
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
#pth-game .prun-q{position:absolute;left:8px;right:8px;z-index:397;display:flex;gap:7px;align-items:flex-start;max-width:420px;margin:0 auto;pointer-events:none;transition:top .2s}
#pth-game .prun-q[hidden]{display:none}
#pth-game .prun-q .prun-qc{flex:none;width:34px;height:47px;border-radius:5px;background:#fbf7ee;border:2px solid #c2303a;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#c2303a;font:800 16px/1 Georgia,serif;box-shadow:0 2px 6px rgba(0,0,0,.4)}
#pth-game .prun-q .prun-qb{flex:1;min-width:0;background:#fbf7ee;color:#141414;border-radius:12px;padding:5px 9px;box-shadow:0 2px 6px rgba(0,0,0,.35);position:relative}
#pth-game .prun-q .prun-qb:before{content:'';position:absolute;left:-6px;top:14px;border:6px solid transparent;border-right-color:#fbf7ee;border-left:0}
#pth-game .prun-q b{display:block;font:800 13px/1.2 'Inter',system-ui,sans-serif}
#pth-game .prun-q .prun-qr{display:flex;align-items:center;gap:6px;margin-top:3px;font:700 11px 'Inconsolata',monospace;color:#c2303a}
#pth-game .prun-q .prun-qbar{flex:1;height:5px;border-radius:3px;background:#e5dccb;overflow:hidden}
#pth-game .prun-q .prun-qbar i{display:block;height:100%;background:linear-gradient(90deg,#e0573f,#e8b84a)}
#pth-game .prun-hearts{position:absolute;font:700 14px system-ui;color:#e0405a;letter-spacing:1px;text-shadow:0 1px 2px rgba(0,0,0,.6);white-space:nowrap}
#pth-game .prun-hearts span{color:rgba(255,255,255,.3)}
#pth-game .prun-ghost{position:absolute;font:700 13px 'Inconsolata',monospace;color:#bfe3ff;text-shadow:0 1px 2px rgba(0,0,0,.7);white-space:nowrap}
#pth-game .prun-ghost.ahead{color:#7ee08a}#pth-game .prun-ghost.behind{color:#ff8a7a}
#pth-game .prun-nitro{position:absolute;left:12px;bottom:12px;z-index:397;display:flex;align-items:center;gap:7px;pointer-events:none;font:800 11px 'Inter',system-ui,sans-serif;letter-spacing:.1em;color:#d8b25a;text-shadow:0 1px 2px rgba(0,0,0,.7)}
#pth-game.pg-touch:not(.pg-nopad) .prun-nitro{display:none}
#pth-game .prun-nitro[hidden]{display:none}
#pth-game .prun-nitro i{display:block;width:120px;height:9px;border-radius:5px;background:rgba(13,17,23,.65);border:1px solid rgba(216,178,90,.55);overflow:hidden}
#pth-game .prun-nitro b{display:block;height:100%;width:0;background:linear-gradient(90deg,#b8862a,#ffd27a);transition:width .15s}
#pth-game .prun-nitro.prun-ready{color:#ffd27a}
#pth-game .prun-nitro.prun-burn b{background:linear-gradient(90deg,#ff8a3d,#fff1c4);box-shadow:0 0 10px #ffb347}
#pth-game .prun-nitro small{font:700 10px 'Inter',system-ui,sans-serif;letter-spacing:0;color:#cfd8d2}
#pth-game .prun-map{display:block;color:#f1e9d4;width:min(520px,100%);height:auto;margin:2px 0 4px}
#pth-game .prun-hud .ar-hand{order:3}
#pth-game .prun-mini{order:2;flex:none;margin-left:auto;width:132px;line-height:0;background:rgba(8,12,18,.55);border:1px solid rgba(232,184,74,.22);border-radius:9px;padding:1px 3px}
#pth-game .prun-mini[hidden]{display:none}
#pth-game .prun-mini svg{display:block;width:100%;height:auto}
@media (min-width:760px){#pth-game .prun-mini{width:176px}}
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
  // The nitro meter on the stage, for a screen without the touch pad (web.66,
  // narmod: « on a standard screen you can't see where the nitro is »).
  const nitroBox = document.createElement('div');
  nitroBox.className = 'prun-nitro'; nitroBox.hidden = true;
  nitroBox.innerHTML = 'NITRO<i><b></b></i><small>↑ / Space · 🎮 A</small>';
  shell.layer.appendChild(nitroBox);
  const nitroBar = /** @type {HTMLElement} */ (nitroBox.querySelector('b'));
  const qBox = document.createElement('div');
  qBox.className = 'prun-q'; qBox.hidden = true;
  qBox.innerHTML = '<div class="prun-qc">Q<span>♥︎</span></div><div class="prun-qb"><b></b><div class="prun-qr"><span class="prun-qn"></span><div class="prun-qbar"><i></i></div><span class="prun-qt"></span></div></div>';
  shell.layer.appendChild(qBox);
  const qText = qBox.querySelector('b'), qN = qBox.querySelector('.prun-qn'), qBar = /** @type {HTMLElement} */ (qBox.querySelector('.prun-qbar i')), qT = qBox.querySelector('.prun-qt');
  shell.lanes(true);
  // The pad of this game: ◀ NITRO ▶ (the brake stays on ↓), with the nitro gauge; put back as it was on leaving.
  shell.root.classList.add('prun-pad');
  // The pad as a racing game: ←/→ held, A or RT nitro, B, LT or ↓ brake (shell.mjs).
  shell.padMode = 'racing';
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
    + '<div class="prun-hearts" hidden></div><div class="prun-ghost" hidden></div>'
    + '<div class="prun-mini" aria-hidden="true" hidden></div>'
    + '<div class="ar-hand"><div class="ar-slots"></div><div class="ar-name"></div></div>';
  const q = (s) => /** @type {HTMLElement} */ (shell.hud.querySelector(s));
  const hChips = q('.pr-c'), hTime = q('.pr-t'), hStage = q('.pr-s'), hSlots = q('.ar-slots'), hName = q('.ar-name'), hMini = q('.prun-mini'), hHearts = q('.prun-hearts'), hGhost = q('.prun-ghost');

  // ── Track ──────────────────────────────────────────────────────────
  let segs = [], finishSeg = 0, gates = [], cars = [], buildStage = 0;
  let stageTheme = [], branches = [], hover = 0, hole = [], board = [];
  const lastY = () => segs.length ? segs[segs.length - 1].p2.w.y : 0;
  function addSeg(curve, y) {
    const n = segs.length;
    segs.push({ i: n, p1: { w: { z: n * SEG, y: lastY() }, c: {}, s: {} }, p2: { w: { z: (n + 1) * SEG, y }, c: {}, s: {} },
      curve, dy: y - lastY(), sprites: [], clip: 0, stage: buildStage, f: 0, m: 0, gk: -1, mEnd: -1, g: null, T: null, Tp: null });
  }
  function addRoad(en, ho, le, cu, hill) {
    const y0 = lastY(), y1 = y0 + hill, tot = Math.max(1, en + ho + le); let k = 0;
    const Y = () => ease(y0, y1, ++k / tot);
    for (let i = 0; i < en; i++) addSeg(ease(0, cu, i / en), Y());
    for (let i = 0; i < ho; i++) addSeg(cu, Y());
    for (let i = 0; i < le; i++) addSeg(ease(cu, 0, i / le), Y());
  }
  // The track (web.64, narmod: « left an easier road, right a harder one —
  // all rights, the hardest, and it pays more »). Built as a skeleton (the
  // stages' lengths, the forks, the finish), each stage then shaped by a
  // template: its bends, hills and chips. A fork's two roads have their
  // templates ready before the fork; the one the car heads for is laid out
  // (the first 60 segments are a straight either way, so what is seen from
  // the fork does not change), and the gate makes it final.
  //   lvl[k]: stage k's difficulty, 0 … 5 — the number of rights taken so far.
  let stageStart = [], tmpl = [], applied = [], lvl = [0];
  // The mode: 'free', 'queen' or 'daily'; the Queen's requests of this run.
  const MODES = ['free', 'queen', 'daily'];
  let mode = 'free', modeSel = 0, day = '';
  /** A random stream: the day's for one purpose (the daily challenge), else Math.random. */
  const S = (tag) => (mode === 'daily' ? rng('prun:' + day + ':' + tag) : Math.random);
  // The daily's best run today (score, picks, line) and the run being recorded.
  const DAILY_KEY = 'pth_prun_daily', G_DT = 0.1;
  const dLoad = () => { try { const o = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}') || {}; return o.d === dayKey() ? o : {}; } catch (e) { return {}; } };
  let ghost = null, gRec = null, gT = 0, gNext = 0, gIdx = 0, gGap = null, gShown = '';
  let quest = null, quests = [], qPool = [], driftRun = 0, fastRun = 0;
  let stDrifts = 0, stPasses = 0, stHits = 0;     // for the end screen
  const qBest = () => { try { return JSON.parse(localStorage.getItem('pth_prun_best') || '{}') || {}; } catch (e) { return {}; } };
  const chipVal = (k) => 10 + 5 * (lvl[k] || 0);
  function buildTrack() {
    segs = []; cars = []; gates = []; buildStage = 0; stageStart = []; tmpl = []; applied = []; lvl = [0]; carSeq = 0;
    addRoad(0, 40, 0, 0, 0);
    const deck = [], rd = S('deck'); for (let n = 0; n < 52; n++) deck.push(n);
    for (let i = 51; i > 0; i--) { const j = Math.floor(rd() * (i + 1)); const x = deck[i]; deck[i] = deck[j]; deck[j] = x; }
    hole = [deck.pop(), deck.pop()];
    for (let k = 0; k <= FORKS; k++) {
      stageStart[k] = segs.length;
      for (let i = 0; i < stageLen(k); i++) addSeg(0, lastY());
      if (k === FORKS) break;
      // The fork: a flat straight, two branches, the gate, then the branch taken swings back to the middle.
      const f0 = segs.length; addRoad(0, 30 + 150 + MERGE + 20, 0, 0, 0);
      const gate = f0 + 180;
      for (let i = f0 + 30; i <= gate; i++) { segs[i].f = ease(0, 1, (i - (f0 + 30)) / 100); segs[i].gk = k; }
      for (let i = gate + 1; i <= gate + MERGE; i++) { segs[i].m = 1 - ease(0, 1, (i - gate) / MERGE); segs[i].gk = k; }
      segs[gate + MERGE].mEnd = k;
      for (let i = gate + 1; i < segs.length; i++) segs[i].stage = k + 1;
      buildStage = k + 1;
      const g = { seg: gate, k, cards: [deck.pop(), deck.pop()], label: GATE_LABELS[k], picked: -1, auto: false };
      gates.push(g); segs[gate].gate = g;
    }
    addRoad(0, 100, 0, 0, 0);
    finishSeg = segs.length - 20; addRoad(0, DRAW + 30, 0, 0, 0);
    for (let s = 10; s < segs.length; s += 16) segs[s].sprites.push({ t: 'side', side: Math.floor(s / 16) % 2 ? -1 : 1, v: Math.floor(s / 16) % 4 });
    // Stage 0 from Las Vegas; the others laid out as the left road for now.
    applyStage(0, genStage(0, 'vegas', 0));
    for (let k = 1; k <= FORKS; k++) applyStage(k, genStage(k, null, 0));
    prepareFork(0);
    const free = (i) => segs[i] && segs[i].f === 0 && segs[i].m === 0 && !segs[i].gate;
    // Traffic (web.60, narmod: « more people »): of three kinds, now and then
    // two side by side — a gap to thread; a harder road adds its own (addTraffic).
    const rt = S('traffic');
    for (let k = 0; k < TRAFFIC; k++) {
      let z = Math.floor(120 + k * (finishSeg - 220) / TRAFFIC + rt() * 30);
      while (!free(z) && z < finishSeg) z++;
      const c = newCar(z, k % 2, rt);
      cars.push(c);
      if (k % 6 === 3) { const c2 = newCar(z, 1 - k % 2, rt); c2.lane = (c.lane + 1 + (c.lane === 1 ? Math.floor(rt() * 2) : 0)) % 3; c2.v = c.v; cars.push(c2); }
    }
    trafficSig = cars.map((c) => Math.round(c.z / SEG) + ':' + c.lane + ':' + Math.round(c.v)).join();   // tests: the daily's traffic
  }
  /** A stage's road: bends sharper and closer on a harder one, S-bends, hills by scene. */
  function genStage(k, key, d) {
    const r = S('st' + k + '-' + key + '-' + d), len = stageLen(k), c = new Array(len).fill(0), dy = new Array(len).fill(0);
    const hk = (key ? HILLS[key] : 1) * (0.8 + 0.12 * d), lim = 560 * (key ? HILLS[key] : 1);
    const y0 = segs[stageStart[k]] ? segs[stageStart[k]].p1.w.y : 0;
    let i = 60, y = y0, sg = r() < 0.5 ? 1 : -1;
    while (i < len) {
      const rest = len - i;
      let en = 20 + Math.floor(r() * 25), ho = Math.floor((30 + r() * 60) * (1 - 0.07 * d)), le = en;
      if (rest < 30) { en = 0; ho = rest; le = 0; }
      else if (en + ho + le > rest) { const f = rest / (en + ho + le); en = Math.floor(en * f); le = Math.floor(le * f); ho = rest - en - le; }
      const straight = rest < 30 || r() < 0.35 - 0.05 * d;
      sg = r() < 0.35 + 0.1 * d ? -sg : (r() < 0.5 ? 1 : -1);
      const cu = straight ? 0 : sg * ((0.8 + 0.25 * d) + r() * (0.8 + 0.3 * d));
      // Hills pulled back towards the level, the last stage's last piece back to it (the finish is flat).
      const lastPiece = k === FORKS && i + en + ho + le >= len;
      const hill = lastPiece ? -y : clamp((r() * 2 - 1) * 420 * hk - y * 0.5, -lim - y, lim - y);
      const n = en + ho + le, y1 = y + hill; let py = y;
      for (let j = 0; j < n; j++) {
        c[i + j] = j < en ? ease(0, cu, j / en) : j < en + ho ? cu : ease(cu, 0, (j - en - ho) / Math.max(1, le));
        const yy = ease(y, y1, (j + 1) / n); dy[i + j] = yy - py; py = yy;
      }
      i += n; y = y1;
    }
    return { c, dy, d, key };
  }
  /** Lay a template on stage k: its bends and hills, the heights after it, its chips. */
  function applyStage(k, t) {
    const s0 = stageStart[k], end = s0 + t.c.length;
    for (let j = 0; j < t.c.length; j++) { const sg = segs[s0 + j]; sg.curve = t.c[j]; sg.dy = t.dy[j]; }
    for (let i = Math.max(1, s0); i < segs.length; i++) { const sg = segs[i]; sg.p1.w.y = segs[i - 1].p2.w.y; sg.p2.w.y = sg.p1.w.y + (sg.dy || 0); }
    // Chips: closer together on a harder road.
    for (let i = s0; i < end; i++) if (segs[i].sprites.length) segs[i].sprites = segs[i].sprites.filter((sp) => sp.t !== 'chip');
    const r = S('ch' + k + '-' + t.key + '-' + t.d);
    for (let i = s0 + (k ? 70 : 30); i < end - 20; i += 54 - 5 * t.d + Math.floor(r() * 20)) {
      const lane = Math.floor(r() * 3);
      for (let j = 0; j < 4; j++) if (i + j * 4 < end) segs[i + j * 4].sprites.push({ t: 'chip', lane });
    }
    applied[k] = t;
  }
  /** Fork k: the two roads of stage k + 1, left at the current level, right one harder. */
  function prepareFork(k) {
    if (k >= FORKS) return;
    const d = lvl[k] || 0;
    tmpl[k + 1] = [genStage(k + 1, branches[k][0], d), genStage(k + 1, branches[k][1], Math.min(FORKS, d + 1))];
    applyStage(k + 1, tmpl[k + 1][0]);
  }
  /** A harder road brings its own traffic, out of sight ahead. */
  function addTraffic(k, from) {
    const n = 3 * (lvl[k] || 0), z0 = Math.max(stageStart[k], from + DRAW + 10), z1 = k < FORKS ? gates[k].seg - 200 : finishSeg - 40;
    const r = S('tr' + k + '-' + (lvl[k] || 0));
    for (let i = 0; i < n && z1 > z0; i++) cars.push(newCar(Math.floor(z0 + r() * (z1 - z0)), r() < 0.5 ? 0 : 1, r));
  }
  let carSeq = 0, trafficSig = '';
  function newCar(z, side, r = Math.random) {
    const n = carSeq++;
    return { z: z * SEG, lane: Math.floor(r() * 3), side, v: MAXV * (0.3 + r() * 0.24),
      col: CAR_COLS[(n * 3 + Math.floor(r() * 2)) % CAR_COLS.length], kind: CAR_KINDS[Math.floor(r() * 10) < 6 ? 0 : r() < 0.5 ? 1 : 2], dead: false, ahead: true };
  }
  const findSeg = (z) => segs[clamp(Math.floor(z / SEG), 0, segs.length - 1)];
  const nextGate = () => gates.find((g) => g.picked < 0);
  /** The branch of a fork: the one taken, the one the car is on while it comes, else the left one. */
  const chosenLane = (g) => g.picked >= 0 ? g.picked : (nextGate() === g ? hover : 0);
  function assignBranches(k) {
    const pool = KEYS_TH.filter((x) => x !== stageTheme[k]), r = S('br' + k + '-' + stageTheme[k]);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const x = pool[i]; pool[i] = pool[j]; pool[j] = x; }
    branches[k] = pool.slice(0, 2);
  }
  function themeOf(k) {
    if (stageTheme[k]) return TH[stageTheme[k]];
    const b = branches[k - 1];
    return b ? TH[b[chosenLane(gates[k - 1])]] : TH.vegas;
  }
  // Lateral layout of a segment (half-road units): the three lanes of the
  // road; at a fork its two branches (the road's halves pulling apart); after
  // it the branch taken swinging back to the middle, the other one leaving.
  const BR_HW = 0.5 * 0.7;                  // a branch's half width at the gate
  function geom(s) {
    if (s.f > 0) {
      const sp = 1 + SPLIT * s.f, hw = 0.5 * (1 - 0.3 * s.f);
      return { pcs: BR_OFF.map((o) => ({ c: o * sp, hw })), joined: s.f < 0.12, ghosts: null, fork: true };
    }
    if (s.m > 0) {
      const cl = chosenLane(gates[s.gk]), m = s.m, C = BR_OFF[cl] * (1 + SPLIT), hw = BR_HW * m + (1 / 3) * (1 - m);
      return { pcs: LANE_OFF.map((o) => ({ c: C * m + o * (1 - m), hw })), joined: true,
        ghosts: BR_OFF.map((o, b) => b === cl ? null : { c: o * (1 + SPLIT + 5 * (1 - m)), hw: BR_HW, a: m }) };
    }
    return { pcs: LANE_OFF.map((o) => ({ c: o, hw: 1 / 3 })), joined: true, ghosts: null };
  }
  const envL = (g) => Math.min(...g.pcs.map((p) => p.c - p.hw));
  const envR = (g) => Math.max(...g.pcs.map((p) => p.c + p.hw));
  const nearest = (g, x) => { let bi = 0; g.pcs.forEach((p, i) => { if (Math.abs(x - p.c) < Math.abs(x - g.pcs[bi].c)) bi = i; }); return bi; };
  function carX(c, s, g) {
    const b = branchOfLane(c.lane, c.side);
    if (s.m > 0) { const cl = chosenLane(gates[s.gk]); return b === cl ? (envL(g) + envR(g)) / 2 : g.ghosts[b].c; }
    // At a fork, a car eases from its lane into its branch.
    if (g.fork) { const k = clamp(s.f * 3, 0, 1); return LANE_OFF[c.lane] * (1 - k) + g.pcs[b].c * k; }
    return g.pcs[c.lane].c;
  }

  // ── State ──────────────────────────────────────────────────────────
  let state = 'title', overAt = 0, revealTimer = 0, lastChipSnd = 0, hofRun = null;
  let pos = 0, px = 0, v = 0, pv = 0, yaw = 0, turn = 0, slide = 0, bob = 0, camY = CAMH, lastCen = null;
  let stack = 0, time = TIME0, nitro = 0, boost = false, inv = 0, shake = 0, skyOff = 0, curStage = 0, skyFrom = 'vegas', skyGate = -1;
  let slip = 0, slipDir = 1, yawVel = 0, charge = 0, mt = 0, spin = 0, drift = false, driftDir = 0, driftTick = 0, driftGain = 0, parts = [], fx = [];
  let act = { a: '', t: 0, dur: 0, prio: 0 }, bub = { s: '', t: 0, d: 1 }, wasBoost = false, wasOff = false, lowSaid = false, offCd = 0, outroT = 0, outroWin = false;
  const keys = { l: false, r: false, n: false, b: false }, pulse = { l: 0, r: 0, n: 0, b: 0 };
  let W = 640, H = 360, cy = 160, ctx = shell.g;
  const view = { hidden: 0, far: 0 };   // road segments hidden behind a crest, the farthest one drawn (tests)

  function reset() {
    stageTheme = ['vegas']; branches = []; assignBranches(0);
    buildTrack();
    pos = 0; px = 0; v = 0; pv = 0; yaw = 0; turn = 0; slide = 0; lastCen = null; board = []; stack = 0; time = TIME0; nitro = 0.2; boost = false;
    inv = 0; shake = 0; fx = []; parts = []; drift = false; slip = 0; yawVel = 0; charge = 0; mt = 0; spin = 0; curStage = 0;
    hover = 0; skyFrom = 'vegas'; skyGate = -1; act = { a: '', t: 0, dur: 0, prio: 0 }; bub = { s: '', t: 0, d: 1 };
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
    nitroBar.style.width = Math.round(nitro * 100) + '%'; nitroBox.hidden = state !== 'run';
    nitroBox.classList.toggle('prun-ready', nitro > 0.15 && !boost); nitroBox.classList.toggle('prun-burn', boost);
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
      const d = Math.min(FORKS, (lvl[g.k] || 0) + i);
      let pips = ''; for (let p = 0; p < FORKS; p++) pips += '<i class="' + (p < d ? 'on' + (i ? '' : ' e') : '') + '"></i>';
      return '<div class="prun-opt' + (i === hover ? ' on' : '') + '">' + cardHtml(c, 'sm') + '<b>' + esc(t(e.nameKey)) + '</b><em>×' + e.mult + '</em>'
        + '<span class="prun-lvl" aria-hidden="true">' + pips + '<b>◉ +' + (10 + 5 * d) + '</b></span><small>' + (i ? '' : '◀ ') + esc(TH[br[i]].name) + (i ? ' ▶' : '') + '</small></div>';
    }).join('');
    prev.style.top = Math.round(shell.hud.offsetHeight + 4) + 'px';
    prev.hidden = false;
  }
  function titlePanel() {
    const best = shell.best.get(), qb = qBest().queen || 0, dl = dLoad();
    titleScreen(shell, { id: 'poker-run', live: true, name: 'Poker Run', hint: t('prHint'), sel: modeSel,
      modes: [{ icon: '🏎️', label: t('adModeFree'), desc: t('adModeFreeD'), rec: best ? t('arRecord', { n: fmt(best) }) : '' },
        { icon: '♥️', label: t('prQueen'), desc: t('prQueenD'), rec: qb ? t('arRecord', { n: fmt(qb) }) : '' },
        { icon: '📅', label: t('psDaily'), desc: t('adModeDailyD') + ' · 👻', rec: dl.s ? t('wwDailyToday', { n: fmt(dl.s) }) : '' }],
      options: hofEnabled ? [{ id: 'hof', label: '🏆 ' + t('hofTitle'), key: '↓' }] : [],
      onOption: (id) => { if (id === 'hof') openHof(); },
      onPick: (i) => { modeSel = i; start(); } });
  }
  // The Hall of Fame (hof.mjs, claude/CONCEPTION_HALL_OF_FAME.md, web.100): the title's 🏆 (or ↓) only while the admin has it on.
  let hofEnabled = false;
  function refreshHof() {
    hofOn('poker-run').then((on) => { if (on !== hofEnabled) { hofEnabled = on; if (state === 'title') titlePanel(); } }).catch(() => {});
  }
  function openHof() {
    state = 'board';
    hofPanel(shell, { g: 'poker-run', name: 'Poker Run', sel: modeSel,
      modes: [{ id: 'free', label: t('adModeFree') }, { id: 'queen', label: t('prQueen') }, { id: 'daily', label: t('psDaily') }],
      onBack: () => { state = 'title'; titlePanel(); refreshHof(); } });
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
    mode = MODES[modeSel] || 'free';
    day = dayKey();
    reset(); state = 'run'; shell.panel(null); lastMini = '';
    hofRun = hofStart('poker-run', mode);   // the Hall of Fame's ticket for this run (null offline / off)
    // The daily: today's best run drives as a ghost; this one is recorded.
    if (mode === 'daily') { const g = dLoad().g; ghost = g && g.z && g.z.length > 1 ? g : null; gRec = { p: [], z: [], x: [] }; }
    else { ghost = null; gRec = null; }
    gT = 0; gNext = 0; gIdx = 0; gGap = null; gShown = ''; hGhost.hidden = true;
    quest = null; quests = []; qPool = []; driftRun = 0; fastRun = 0; stDrifts = 0; stPasses = 0; stHits = 0; renderHearts();
    if (aceRoot) aceRoot.classList.remove('prun-spin');
    ace.mood('mc-m-smile');
  }

  // ── Input ──────────────────────────────────────────────────────────
  function input(a, down, info) {
    if (state === 'board') return;                 // the Hall of Fame's boards: their own buttons
    if (state === 'title' && down && a === 'duck') { if (hofEnabled) openHof(); return; }
    if (state === 'title' || state === 'over') {
      if (state === 'title' && down) { const st = titleStep(a, modeSel, MODES.length); if (st === 'start') start(); else if (st != null) { modeSel = st; titlePanel(); } return; }
      if (a === 'jump' && down && performance.now() > overAt + 700) start();
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
    // The mini-turbo, by the sparks reached (none after a crash: charge is zeroed there).
    if (charge >= MT_BLUE && state === 'run') {
      const big = charge >= MT_ORANGE; mt = big ? MT_LONG : MT_SHORT;
      addFx('TURBO', big ? '#ffae3a' : '#7cc4ff', big, H * 0.5);
      if (big) { aceDo('up', 0.7, '🔥', 2); sound('notifyAllIn'); }
    }
    charge = 0;
    if (driftGain > 0) addFx('DRIFT +' + driftGain, '#ffd27a');
    if (driftGain >= 15 && state === 'run') aceDo('pump', 0.8, null, 2);
    driftGain = 0;
  }
  function respawn(c, pi) {
    if (mode === 'daily') { c.dead = true; return; }      // the daily: the same traffic for everyone, none drawn anew
    let z = pi + DRAW + 10 + Math.floor(Math.random() * 120);
    while (segs[z] && (segs[z].f > 0 || segs[z].m > 0)) z++;
    if (z >= finishSeg) { c.dead = true; return; }
    // A new car, not the one just seen coming back.
    Object.assign(c, newCar(z, c.side));
  }
  function takeGate(g, lane, live) {
    const before = evalCards(hole.concat(board)).cat;
    g.picked = lane; board.push(g.cards[lane]);
    const k = g.k;
    stageTheme[k + 1] = branches[k][lane]; curStage = k + 1;
    if (live && mode === 'queen') questGate(k, lane);
    lvl[k + 1] = Math.min(FORKS, (lvl[k] || 0) + lane);
    if (tmpl[k + 1] && applied[k + 1] !== tmpl[k + 1][lane]) applyStage(k + 1, tmpl[k + 1][lane]);
    if (k + 1 < FORKS) { assignBranches(k + 1); prepareFork(k + 1); }
    if (live) addTraffic(k + 1, g.seg);
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
    if (state === 'title' || state === 'over' || state === 'board') { aceTick(dt); return; }
    if (state === 'outro') { stepOutro(dt); return; }
    for (const k of ['l', 'r', 'n', 'b']) if (pulse[k] > 0) pulse[k] -= dt;
    const L = keys.l || pulse.l > 0, R = keys.r || pulse.r > 0, N = keys.n || pulse.n > 0, B = keys.b || pulse.b > 0;
    const ps = findSeg(pos + PLAYER_Z), g = geom(ps), sp = v / MAXV, dir = (R ? 1 : 0) - (L ? 1 : 0);
    const ng = nextGate();
    // The branch the car heads for: the left or the right half of the road.
    if (ng && ps.i >= ng.seg - GATE_ZONE - 20 && ps.i <= ng.seg) hover = px < 0 ? 0 : 1;
    if (ng && tmpl[ng.k + 1] && applied[ng.k + 1] !== tmpl[ng.k + 1][chosenLane(ng)]) applyStage(ng.k + 1, tmpl[ng.k + 1][chosenLane(ng)]);
    // Drift, continuous (web.63, narmod: « no steps — the more you turn, the
    // more you drift, more arcade »): `slip` (0 … 1) rises with how hard you
    // steer into a bend, how tight it is and how fast you go, and falls back as
    // you ease off; the car slides in proportion. Past 0.4 it counts as a drift
    // (chips, sparks, turbo); under 0.22 the drift is over.
    const bend = Math.sign(ps.curve), tight = clamp((Math.abs(ps.curve) - 0.5) / 2, 0, 1), fast = clamp((sp - 0.45) / 0.45, 0, 1);
    let want = 0;
    if (dir !== 0 && dir === bend) want = (0.3 + 0.7 * tight) * fast;
    else if (dir !== 0 && Math.abs(ps.curve) < 0.5) want = 0.18 * fast;      // a hard turn on a straight: a little looseness
    else if (dir !== 0 && slip > 0) want = slip * 0.7;                        // steering out of the bend widens and eases off
    slip += (want - slip) * Math.min(1, dt * (want > slip ? 1.6 : 2.2));
    if (dir) slipDir = dir === bend || !drift ? dir : slipDir;
    if (!drift && slip > 0.4) { drift = true; stDrifts++; driftDir = bend || dir; slipDir = driftDir; driftTick = 0; driftGain = 0; charge = 0; say('😎'); }
    if (drift) { charge += dt * (0.4 + 0.6 * slip); if (slip < 0.22 || sp < 0.4) endDrift(); }
    const rate = 2.5 * Math.max(0.35, sp);
    // Gripping, the stick moves the car across; sliding, holding into the bend
    // keeps its line, letting go widens it a little, steering out more.
    const cf = 2.4 * sp * sp * Math.abs(ps.curve) * CENTRI * 0.4;
    const grip = dir * rate, slideT = slipDir * (cf + (dir === slipDir ? 0.15 : dir === 0 ? -0.2 : -0.8));
    const target = grip + (slideT - grip) * slip;
    pv += (target - pv) * Math.min(1, dt * (6 + 4 * (1 - slip)));
    px += pv * dt - dt * 2.4 * sp * sp * ps.curve * CENTRI * (1 - 0.6 * slip);
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
      if (!shell.reduced && charge >= MT_BLUE) {
        const c = charge >= MT_ORANGE ? '255,166,58' : '110,180,255';
        for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) parts.push({ x: W / 2 + slide + sx * carW() * 0.42, y: H - 12, vx: (Math.random() - 0.5) * 160 - driftDir * 60, vy: -40 - Math.random() * 90, r: 1.6 + Math.random() * 1.4, life: 0.28, c, spark: true });
      }
    }
    // Tyre smoke, as much as the car slides.
    if (!shell.reduced && slip > 0.25) for (const sx of [-1, 1]) if (Math.random() < slip * 1.2) parts.push({ x: W / 2 + slide + sx * carW() * 0.4, y: H - 14, vx: -slipDir * (70 + Math.random() * 70) + sx * 20, vy: -20 - Math.random() * 35, r: sx === -slipDir ? 8 : 5, life: (sx === -slipDir ? 0.9 : 0.6) * slip, c: '226,229,234' });
    if (off && sp > 0.2 && !shell.reduced && Math.random() < 0.6) parts.push({ x: W / 2 + (Math.random() - 0.5) * 70, y: H - 16, vx: (Math.random() - 0.5) * 80, vy: -40, r: 4, life: 0.5, c: '150,140,110' });
    // A drift turns the car into the bend (its side shows, the rear swings
    // out) rather than rocking it: little roll, a slow swing in and out.
    turn += (slip * slipDir - turn) * Math.min(1, dt * 6);
    // The car turns to where it is going (its sideways speed) and to its slide,
    // on a spring (web.63: « the rear stays stuck — give it some play »): it
    // swings, overshoots a little and settles. The camera trails it.
    const yT = clamp(pv / 2.5, -1, 1) * 0.13 + turn * 0.5;
    yawVel += (70 * (yT - yaw) - 10 * yawVel) * Math.min(dt, 0.05); yaw += yawVel * Math.min(dt, 0.05);
    // The car turns about its middle (web.65, narmod: « it seems to turn about its boot »): no lead to the
    // side it steers to any more (that held the rear in place), only a little push out of the bend in a drift.
    slide += (-turn * W * 0.03 - slide) * Math.min(1, dt * 5);
    if (spin > 0) spin = Math.max(0, spin - dt);
    if (mt > 0) mt = Math.max(0, mt - dt);
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
    var inZone = ng && ng.seg - ps.i < GATE_ZONE && ng.seg >= ps.i;
    // No slowing down before a fork any more (web.66, narmod: « the forks are long enough to look at them »).
    let cap = off ? OFFROAD : MAXV * (boost ? 1.45 : 1);
    if (mt > 0 && !off) cap = Math.max(cap, MAXV * MT_CAP);
    if (B) cap = Math.min(cap, MAXV * 0.25);
    v = v < cap ? Math.min(cap, v + ACCEL * (boost || mt > 0 ? 2 : 1) * dt) : Math.max(cap, v - ACCEL * (B ? 3 : 2.2) * dt);
    pos += v * dt; time -= dt; if (inv > 0) inv -= dt; if (shake > 0) shake -= dt;
    skyOff += ps.curve * sp * dt * 90;
    if (gRec) ghostTick(dt);

    // Traffic
    const pNow = findSeg(pos + PLAYER_Z).i;
    for (const c of cars) {
      if (c.dead) continue;
      const old = Math.floor(c.z / SEG), cs = segs[old];
      if (cs && (cs.f > 0 || cs.m > 0)) c.v = Math.max(c.v, MAXV * 0.62);
      c.z += c.v * dt;
      const nw = Math.floor(c.z / SEG);
      for (let i = old + 1; i <= nw; i++) {
        const s = segs[i];
        if (s && s.mEnd >= 0) { if (branchOfLane(c.lane, c.side) !== chosenLane(gates[s.mEnd])) respawn(c, ps.i); }
      }
      if (Math.floor(c.z / SEG) >= finishSeg) { c.dead = true; continue; }
      const ci = Math.floor(c.z / SEG);
      if (c.ahead && ci < ps.i && !c.dead) { questCount('pass'); stPasses++; }
      if (c.ahead && ci < ps.i) { const d = Math.abs(px - carX(c, ps, g)); if (d > HIT && d < 1.1 && Math.random() < 0.45) aceDo('wave', 1, t('mascotHello'), 1); }
      c.ahead = ci >= ps.i;
      // Hit: the car within the stretch the player covered this frame (at a low frame rate he moves more than a segment).
      if (ci >= ps.i && ci <= pNow && inv <= 0 && v > c.v && Math.abs(px - carX(c, ps, g)) < HIT) {
        if (drift) { drift = false; driftGain = 0; charge = 0; }
        slip = 0;
        mt = 0;
        aceDo('flail', 0.9, '💥', 5); questHit(); stHits++;
        // A bounce (web.63): pushed aside and spun a little, slowed but still rolling.
        const side = Math.sign(px - carX(c, ps, g)) || (Math.random() < 0.5 ? -1 : 1);
        const loss = Math.ceil(stack * 0.2); stack -= loss; v = Math.max(c.v * 0.7, v * 0.55); pv = side * 3; spin = 0.6; inv = 1.1; if (!shell.reduced) shake = 0.35;
        addFx(loss ? '−' + loss : '💥', '#ff7b6b');
        sound('notifyFold'); buzz([40, 30, 60]);
      }
    }
    // Chips
    for (const s of ps.sprites) {
      if (s.t === 'chip' && !s.got && Math.abs(px - g.pcs[s.lane].c) < 0.32) {
        questCount('chips');
        const cv = chipVal(ps.stage); s.got = true; stack += cv; nitro = Math.min(1, nitro + 0.09); addFx('+' + cv, '#e8b84a'); aceDo('hop', 0.3, null, 1);
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
    renderMini();
    if (mode === 'queen') queenTick(dt, ps, sp, inZone);
  }
  // ── Défi du jour: the ghost ─────────────────────────────────────────
  const myZ = () => (pos + PLAYER_Z) / SEG;
  /** Record this run's line; tell the gap to today's best (the time it took to reach where the car is). */
  function ghostTick(dt) {
    gT += dt;
    while (gT >= gNext) { gRec.z.push(Math.round(myZ() * 10) / 10); gRec.x.push(Math.round(px * 100) / 100); gNext += G_DT; }
    if (!ghost) return;
    const z = myZ(), Z = ghost.z;
    while (gIdx < Z.length - 1 && Z[gIdx + 1] < z) gIdx++;
    gGap = Z[Z.length - 1] < z || !ghostRoute(z) ? null : gT - (gIdx + (Z[gIdx + 1] > Z[gIdx] ? clamp((z - Z[gIdx]) / (Z[gIdx + 1] - Z[gIdx]), 0, 1) : 0)) * G_DT;
    renderGhost();
  }
  /** Is the ghost's road at z the player's? The same branch at every fork before it. */
  function ghostRoute(z) {
    const sg = segs[clamp(Math.floor(z), 0, segs.length - 1)];
    for (let k = 0; k < sg.stage; k++) if (ghost.p[k] !== chosenLane(gates[k])) return false;
    return true;
  }
  /** Where the ghost is now (segment units, lateral), or null (gone, or on another road). */
  function ghostNow(any) {
    if (!ghost || state !== 'run') return null;
    const f = gT / G_DT, i = Math.floor(f), Z = ghost.z, X = ghost.x;
    if (i >= Z.length - 1) return null;
    const u = f - i, z = Z[i] + (Z[i + 1] - Z[i]) * u;
    return any || ghostRoute(z) ? { z, x: X[i] + (X[i + 1] - X[i]) * u } : null;
  }
  /** The ghost on the HUD's map: a pale dot along the branches it took. */
  function ghostDot() {
    const dot = hMini.querySelector('.prun-gdot'), gz = ghostNow(true);
    if (!dot) return;
    if (!gz) { dot.setAttribute('opacity', '0'); return; }
    const i = clamp(Math.floor(gz.z), 0, segs.length - 1), k = Math.min(segs[i].stage, STAGES - 1);
    const z0 = k ? gates[k - 1].seg : 0, z1 = k < FORKS ? gates[k].seg : finishSeg, p = clamp((i - z0) / Math.max(1, z1 - z0), 0, 1);
    const x0 = MX(k), y0 = MY(k, k ? Math.max(0, ghost.p[k - 1]) : 0), x1 = k === STAGES - 1 ? MFX : MX(k + 1);
    dot.setAttribute('cx', (x0 + (x1 - x0) * p).toFixed(1)); dot.setAttribute('cy', (y0 + (70 - y0) * p).toFixed(1)); dot.setAttribute('opacity', '0.9');
  }
  function renderGhost() {
    const s = gGap == null ? '' : (gGap > 0 ? '+' : '−') + Math.abs(gGap).toFixed(1) + ' s';
    if (s === gShown) return;
    gShown = s;
    hGhost.hidden = !s;
    if (!s) return;
    hGhost.textContent = '👻 ' + s;
    hGhost.className = 'prun-ghost ' + (gGap > 0.05 ? 'behind' : gGap < -0.05 ? 'ahead' : '');
    hGhost.style.top = Math.round(hMini.hidden ? 10 : hMini.offsetTop + hMini.offsetHeight + 4) + 'px';
    hGhost.style.left = Math.round(hMini.hidden ? 12 : hMini.offsetLeft + 4) + 'px';
  }

  // ── Dame de Cœur ───────────────────────────────────────────────────
  /** A new request at the start of each stage (once the last one is over). */
  function queenTick(dt, ps, sp, inZone) {
    driftRun = drift ? driftRun + dt : 0;
    fastRun = sp >= 0.97 ? fastRun + dt : 0;
    const k = ps.stage;
    if (!quest && quests.length <= k && ps.i >= stageStart[k] + (k ? 20 : 0)) {
      if (!qPool.length) { qPool = ['drift', 'chips', 'pass', 'clean', 'nitro', 'fast']; for (let i = qPool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = qPool[i]; qPool[i] = qPool[j]; qPool[j] = x; } }
      // Now and then, at a fork still to come: « take the left / the right ».
      const id = k < FORKS && Math.random() < 0.3 ? (Math.random() < 0.5 ? 'left' : 'right') : qPool.pop();
      quest = { id, stage: k, t: 0, c: 0, done: false };
      quests.push(quest);
      sound('notifyAction');
      renderQuest(true);
    }
    if (!quest || quest.done) return;
    const Q = QUEEN[quest.id];
    quest.t += dt;
    if (quest.id === 'drift') quest.c = Math.max(quest.c, driftRun);
    else if (quest.id === 'nitro') { if (boost) quest.c += dt; }
    else if (quest.id === 'fast') quest.c = Math.max(quest.c, fastRun);
    else if (quest.id === 'clean') quest.c = quest.t;
    const hit = quest.id === 'left' || quest.id === 'right' ? false : quest.c >= Q.n;
    if (hit) return endQuest(true);
    if (Q.lim && quest.t >= Q.lim) return endQuest(quest.id === 'clean');
    renderQuest(false);
  }
  /** The fork requests are settled at the gate; a hit ends « no scratch ». */
  function questGate(k, lane) { if (quest && !quest.done && (quest.id === 'left' || quest.id === 'right') && quest.stage === k) endQuest((quest.id === 'right') === (lane === 1)); }
  function questCount(what) { if (quest && !quest.done && quest.id === what) quest.c++; }
  function questHit() { if (quest && !quest.done && quest.id === 'clean') endQuest(false); }
  function endQuest(ok) {
    const Q = QUEEN[quest.id];
    quest.done = true; quest.h = quest.id === 'clean' ? (ok ? 3 : 0) : queenHearts(quest.t, Q.lim, ok);   // « no bumps »: all or nothing
    addFx(quest.h ? '♥'.repeat(quest.h) : '✗', quest.h ? '#ff5d7a' : '#9aa3ab', true, H * 0.42);
    if (quest.h === 3) { aceDo('jump', 0.8, null, 3); sound('notifyBigWin'); } else if (!quest.h) aceDo('shrug', 0.8, null, 2);
    quest = null; qBox.hidden = true; renderHearts();
  }
  const questText = (q) => t(QUEEN[q.id].key, { n: QUEEN[q.id].n });
  let lastQ = '';
  function renderQuest(fresh) {
    if (!quest) { qBox.hidden = true; return; }
    const Q = QUEEN[quest.id];
    if (fresh) { qText.textContent = questText(quest); lastQ = ''; }
    const prog = quest.id === 'left' || quest.id === 'right' ? '' : quest.id === 'pass' || quest.id === 'chips' ? quest.c + '/' + Q.n : Math.min(Q.n, quest.c).toFixed(1) + '/' + Q.n + ' s';
    const left = Q.lim ? Math.max(0, Q.lim - quest.t) : 0, key = prog + '|' + Math.ceil(left);
    qBar.style.width = (Q.lim ? 100 * left / Q.lim : 100) + '%';
    if (key !== lastQ) { lastQ = key; qN.textContent = prog; qT.textContent = Q.lim ? Math.ceil(left) + ' s' : ''; }
    // Under the HUD, below the fork's preview when it shows.
    const top = prev.hidden ? shell.hud.offsetHeight + 4 : prev.offsetTop + prev.offsetHeight + 6;
    qBox.style.top = Math.round(top) + 'px';
    qBox.hidden = false;
  }
  function renderHearts() {
    if (mode !== 'queen') { hHearts.hidden = true; return; }
    const got = quests.reduce((a, q) => a + (q.h || 0), 0), max = STAGES * 3;
    hHearts.innerHTML = '♥ ' + got + '<span> / ' + max + '</span>';
    // Under the small course map, in the HUD's top right corner.
    hHearts.style.top = Math.round(hMini.hidden ? 10 : hMini.offsetTop + hMini.offsetHeight + 4) + 'px';
    hHearts.style.left = Math.round(hMini.hidden ? 12 : hMini.offsetLeft + 4) + 'px';
    hHearts.hidden = false;
  }
  // The HUD's map: redrawn at each fork, the car moved along between.
  let lastMini = '';
  function renderMini() {
    const pr = progress(), key = pr.stage + '|' + gates.map((g) => g.picked).join('') + '|' + (branches[pr.stage] || []).join();
    if (key !== lastMini) {
      lastMini = key; hMini.innerHTML = courseMap(pr, true); hMini.hidden = false; if (mode === 'queen') renderHearts();
      if (ghost) { const car = hMini.querySelector('.prun-car'); if (car) car.insertAdjacentHTML('beforebegin', '<circle class="prun-gdot" r="11" fill="#9fd3ff" stroke="#fff" stroke-width="2" opacity="0"/>'); ghostDot(); }
      return;
    }
    if (ghost) ghostDot();
    const c = mapCar(pr), car = hMini.querySelector('.prun-car');
    if (car) car.setAttribute('transform', 'translate(' + c.x.toFixed(1) + ' ' + (c.y - 6 * 2.6).toFixed(1) + ') scale(2.6)');
  }
  function stepParts(dt) {
    for (const p of parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.spark) p.vy += 420 * dt; else p.r += 26 * dt; }
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
    yaw *= 0.9; yawVel *= 0.9; turn *= 0.9; slide *= 0.9; pv *= 0.9;
    const ps = findSeg(pos + PLAYER_Z); camY = CAMH + ps.p1.w.y;
    stepFx(dt); stepParts(dt);
    if (outroT > 1.8) over();
  }
  /** How far the car went: the stage it was in and how much of it (0 … 1). */
  function progress() {
    if (outroWin) return { stage: STAGES, p: 1 };
    const k = curStage, z0 = k ? gates[k - 1].seg : 0, z1 = k < FORKS ? gates[k].seg : finishSeg;
    return { stage: k, p: clamp((findSeg(pos + PLAYER_Z).i - z0) / Math.max(1, z1 - z0), 0, 1) };
  }
  /** The course like OutRun's map: Las Vegas, then at each fork its two
   *  scenes (left above, right below), the branch taken in gold with the card
   *  it dealt, the road not driven in grey, the car where it stopped, 🏁. */
  const MX = (k) => 34 + k * 82, MY = (k, b) => (k === 0 ? 70 : b === 0 ? 38 : 102), MFX = MX(STAGES - 1) + 70;
  /** Where the car is on the map: between its scene and the next fork (or the finish). */
  function mapCar(pr) {
    if (pr.stage >= STAGES) return { x: MFX - 16, y: 70 };
    const k = pr.stage, x0 = MX(k), y0 = MY(k, k ? gates[k - 1].picked : 0), x1 = k === STAGES - 1 ? MFX : MX(k + 1);
    return { x: x0 + (x1 - x0) * pr.p, y: y0 + (70 - y0) * pr.p };
  }
  const carSvg = (c, sc) => '<g class="prun-car" transform="translate(' + c.x.toFixed(1) + ' ' + (c.y - 6 * sc).toFixed(1) + ') scale(' + sc + ')"><rect x="-7" y="-4" width="14" height="8" rx="3" fill="#c2303a" stroke="#fff" stroke-width="1"/>'
    + '<circle cx="-4" cy="4.5" r="1.8" fill="#141414"/><circle cx="4" cy="4.5" r="1.8" fill="#141414"/></g>';
  /** mini: the small map of the HUD while driving — no names, no cards, the
   *  scenes of forks not reached yet unknown (grey), bolder strokes. */
  function courseMap(pr, mini) {
    const X = MX, Y = MY, FX = MFX, M = mini ? 2.4 : 1;
    const gold = '#e8b84a', grey = 'rgba(160,170,165,.45)';
    let lines = '', nodes = '';
    // Long scene names wrap on two lines so neighbouring columns never collide.
    const label = (name, x, y, up) => {
      const w = name.length > 10 && name.includes(' ') ? [name.slice(0, name.indexOf(' ')), name.slice(name.indexOf(' ') + 1)] : [name];
      const y0 = up ? y - 16 - (w.length - 1) * 12 : y + 25;
      return w.map((l, i) => '<tspan x="' + x + '" y="' + (y0 + i * 12) + '">' + esc(l) + '</tspan>').join('');
    };
    const node = (k, b, key, on, card) => {
      const th = TH[key], x = X(k), y = Y(k, b);
      nodes += '<circle cx="' + x + '" cy="' + y + '" r="' + (mini ? (on ? 16 : 12) : (on ? 12 : 8)) + '" fill="' + (th ? th.sky[on ? 2 : 1] : '#3a4150') + '" stroke="' + (on ? gold : grey) + '" stroke-width="' + (on ? 2.5 : 1.2) * M + '"' + (on ? '' : ' opacity="' + (mini ? 0.8 : 0.55) + '"') + '/>';
      if (mini) return;
      nodes += '<text x="' + x + '" font-size="' + (on ? 12 : 10) + '" text-anchor="middle" fill="currentColor" opacity="' + (on ? 0.95 : 0.45) + '" font-family="Inter,system-ui,sans-serif" font-weight="' + (on ? 700 : 500) + '">' + label(th.name, x, y, b === 0 && k) + '</text>';
      if (card != null) nodes += '<text x="' + x + '" y="' + (y + 3.5) + '" font-size="10" text-anchor="middle" font-weight="800" font-family="Inter,system-ui,sans-serif" fill="' + (isRed(card) ? '#c62828' : '#141414') + '" paint-order="stroke" stroke="#fffdf8" stroke-width="2.5">'
        + RANKS[card % 13] + SUITS[suitOf(card)] + VS + '</text>';
    };
    const seg = (x1, y1, x2, y2, on) => { lines += '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" stroke="' + (on ? gold : grey) + '" stroke-width="' + (on ? 3 : 1.5) * M + '"' + (on ? '' : ' stroke-dasharray="' + 3 * M + ' ' + 4 * M + '"') + ' stroke-linecap="round"/>'; };
    // Driven stages follow the route taken; beyond where the car stopped every
    // scene still links to both scenes of the next fork (the road merges between forks).
    const from = (k) => (k === 0 ? [70] : k <= pr.stage ? [Y(k, gates[k - 1].picked)] : [38, 102]);
    node(0, 0, 'vegas', true, null);
    for (let k = 1; k < STAGES; k++) {
      const g = gates[k - 1], driven = k <= pr.stage;
      for (let b = 0; b < 2; b++) {
        const taken = g.picked === b && !g.auto && driven;
        for (const fy of from(k - 1)) seg(X(k - 1), fy, X(k), Y(k, b), taken);
        node(k, b, branches[k - 1] && branches[k - 1][b], taken, taken ? g.cards[b] : null);
      }
    }
    for (const fy of from(STAGES - 1)) seg(X(STAGES - 1), fy, FX, 70, pr.stage >= STAGES);
    nodes += '<text x="' + FX + '" y="' + (mini ? 84 : 77) + '" font-size="' + (mini ? 38 : 18) + '" text-anchor="middle">🏁</text>';
    // The car where it stopped (or where it is, on the HUD's map).
    const car = carSvg(mapCar(pr), mini ? 2.6 : 1);
    if (mini) return '<svg viewBox="0 0 540 140">' + lines + nodes + car + '</svg>';
    return '<svg class="prun-map" viewBox="0 0 520 152" role="img" aria-label="' + esc(stageTheme.slice(0, pr.stage + 1).map((x) => TH[x].name).join(' → ')) + '"><g transform="translate(0 10)">'
      + '<rect x="2" y="-8" width="516" height="148" rx="14" fill="rgba(8,12,18,.62)" stroke="rgba(232,184,74,.25)"/>' + lines + nodes + car + '</g></svg>';
  }
  function over() {
    state = 'over'; overAt = performance.now(); hMini.hidden = true; nitroBox.hidden = true;
    const pr = progress();
    const ra = S('auto');
    for (const g of gates) if (g.picked < 0) { g.auto = true; takeGate(g, Math.floor(ra() * 2), false); }
    curStage = Math.min(curStage, pr.stage);   // the auto-dealt cards do not count as stages driven (HUD level)
    renderHand(); renderStats(true);
    shell.ended();
    const all = hole.concat(board), ev = evalCards(all), bonus = Math.ceil(Math.max(0, time)) * 5;
    if (quest && !quest.done) endQuest(false);
    qBox.hidden = true;
    const hearts = quests.reduce((a, q) => a + (q.h || 0), 0), hm = mode === 'queen' ? queenMult(hearts) : 1;
    const base = stack + bonus, score = Math.round(base * ev.mult * hm);
    const qb = qBest(), dl = dLoad(), prevBest = mode === 'queen' ? qb.queen || 0 : mode === 'daily' ? dl.s || 0 : shell.best.get(), record = score > prevBest;
    hGhost.hidden = true;
    // The daily: the best run of the day kept with its line, the ghost of the next tries.
    if (mode === 'daily' && gRec && (record || !dl.s)) {
      gRec.p = gates.map((g) => (g.auto ? -1 : g.picked));
      try { localStorage.setItem(DAILY_KEY, JSON.stringify({ d: day, s: score, g: gRec })); } catch (e) {}
    }
    if (record && mode !== 'daily') { if (mode === 'queen') { qb.queen = score; try { localStorage.setItem('pth_prun_best', JSON.stringify(qb)); } catch (e) {} } else shell.best.set(score); }
    // The end screen (end.mjs, web.67): the showdown, the score and how it was
    // made, the course driven (OutRun's map) or the Queen's requests, a few numbers.
    const rights = gates.filter((g) => g.picked === 1 && !g.auto).length, reached = Math.min(STAGES, pr.stage + 1);
    endScreen(shell, {
      title: outroWin ? 'Showdown' : t('prTimeUp'), sub: (mode === 'queen' ? t('prQueen') : mode === 'daily' ? t('psDaily') + ' · ' + day : t('adModeFree')) + ' · Poker Run',
      cards: ev.best, hand: t(ev.nameKey) + ' ×' + ev.mult, score, prev: prevBest,
      calc: [[t('blChips'), fmt(stack)], [t('gameTimeLabel'), '+' + fmt(bonus)], [t(ev.nameKey), '×' + ev.mult], hm !== 1 ? ['♥ ' + hearts, '×' + String(hm).replace('.', ',')] : null],
      levels: mode === 'queen'
        ? { title: t('prQueen'), right: '♥ ' + hearts + ' / ' + STAGES * 3, html: listHtml(esc, quests.map((q) => [questText(q).replace(/\s*[!！]$/, ''), q.h ? '♥'.repeat(q.h) : '✗', !!q.h])) }
        : { title: t('gmCourse'), right: reached + '/' + STAGES + (rights ? ' · ' + rights + ' ▶' : ''), html: courseMap(pr) },
      stats: [[stDrifts, t('prDrifts')], [stPasses, t('prPasses')], [stHits, t('prHits')]],
      onAgain: () => start(),
      onMenu: () => { state = 'title'; titlePanel(); refreshHof(); },
    });
    hofEnd(shell, { g: 'poker-run', m: mode, s: score, run: hofRun, day, daily: mode === 'daily' });
    gRec = null;
  }

  // ── Drawing ────────────────────────────────────────────────────────
  // The player's car: on a narrow screen it was 0.39 of the half-road wide, wider
// than the gap between two cars side by side (0.40); 0.24 of W leaves room.
const carW = () => Math.min(W * 0.24, 100);
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
    view.hidden = 0; view.far = 0;
    const shown = [];
    const last = Math.min(segs.length - 1, base.i + DRAW);
    for (let i = base.i; i <= Math.min(segs.length - 1, last + 1); i++) {
      const s = segs[i]; s.g = geom(s); s.T = themeOf(s.stage);
      s.Tp = s.stage > 0 && s.i - gates[s.stage - 1].seg < 50 ? themeOf(s.stage - 1) : null;
    }
    for (let n = 0; n <= last - base.i; n++) {
      const s = segs[base.i + n];
      project(s.p1, px * ROAD - x, camY, pos); project(s.p2, px * ROAD - x - dx, camY, pos);
      x += dx; dx += s.curve; s.clip = maxy;
      if (s.p1.c.z <= DEPTH || s.p2.s.y >= s.p1.s.y || s.p2.s.y >= maxy) { if (s.p1.c.z > DEPTH) view.hidden++; continue; }
      view.far = n;
      const alt = Math.floor(s.i / 3) % 2, bl = s.Tp ? clamp((s.i - gates[s.stage - 1].seg) / 50, 0, 1) : 1;
      ctx.fillStyle = bl < 1 ? rgb(mixA(s.Tp.G[alt], s.T.G[alt], bl)) : rgb(s.T.G[alt]);
      ctx.fillRect(0, s.p2.s.y, W, s.p1.s.y - s.p2.s.y + 1);
      const coast = s.T.coast ? bl : s.Tp && s.Tp.coast ? 1 - bl : 0;
      if (coast > 0.02) {
        // The coast road: a beach on the right, then the sea out to the horizon.
        const a = s.p1.s, b = s.p2.s, gg = s.g, U = (p, u) => p.x + p.w * u, e = envR(gg);
        ctx.globalAlpha = coast;
        band(a.y, U(a, e + 0.2), W + 50 + U(a, e + 0.2), b.y, U(b, e + 0.2), W + 50 + U(b, e + 0.2), alt ? '#e6d3a3' : '#dcc897');
        band(a.y, U(a, e + 0.75), W + 50 + U(a, e + 0.75), b.y, U(b, e + 0.75), W + 50 + U(b, e + 0.75), alt ? '#2f78b8' : '#2a6fae');
        ctx.globalAlpha = 1;
      }
      shown.push(n);
      maxy = s.p2.s.y;
    }
    // The road over all the ground: far away a segment is thinner than a pixel,
    // and the ground of the next one (drawn 1 px taller to hide seams) would cover it.
    // web.109 (audit lot 3): far away, consecutive segments that together are less than a screen pixel tall are
    // drawn as one (same theme, same lanes, no finish, gate, ghost road or theme blend among them): the same
    // picture, a fraction of the calls — most of the 300 segments are that thin.
    const onePx = 1 / ((shell.dpr || 1) * (shell.k || 1));
    const plain = (t) => !t.Tp && !(t.i >= finishSeg - 1 && t.i < finishSeg + 5) && !t.g.ghosts && !t.gate
      && !!(segs[t.i + 1] && segs[t.i + 1].g) && segs[t.i + 1].g.pcs.length === t.g.pcs.length && !!segs[t.i + 1].g.joined === !!t.g.joined;
    for (let j = 0; j < shown.length; j++) {
      const n = shown[j];
      const s = segs[base.i + n];
      let e = s;
      if (s.p1.s.y - s.p2.s.y < onePx && plain(s)) {
        while (j + 1 < shown.length && shown[j + 1] === shown[j] + 1) {
          const u = segs[base.i + shown[j + 1]];
          if (u.T !== s.T || !plain(u) || u.g.pcs.length !== s.g.pcs.length || !!u.g.joined !== !!s.g.joined || s.p1.s.y - u.p2.s.y >= onePx) break;
          e = u; j++;
        }
      }
      const a = s.p1.s, b = e.p2.s, alt = Math.floor(s.i / 3) % 2, fin = s.i >= finishSeg && s.i < finishSeg + 4;
      const nx = segs[e.i + 1] || e, g1 = s.g, g2 = nx.g || g1, T = s.T;
      const bl = s.Tp ? clamp((s.i - gates[s.stage - 1].seg) / 50, 0, 1) : 1;
      const col = (k) => bl < 1 ? rgb(mixA(s.Tp[k][alt], T[k][alt], bl)) : rgb(T[k][alt]);
      const U = (p, u) => p.x + p.w * u;
      const road = fin ? '#f4eedf' : col('D');
      const piece = (c1, h1, c2, h2, rw) => {
        band(a.y, U(a, c1 - h1 - rw), U(a, c1 + h1 + rw), b.y, U(b, c2 - h2 - rw), U(b, c2 + h2 + rw), col('R'));
        band(a.y, U(a, c1 - h1), U(a, c1 + h1), b.y, U(b, c2 - h2), U(b, c2 + h2), road);
      };
      if (g1.ghosts && g2.ghosts) for (let l = 0; l < g1.ghosts.length; l++) {
        const q1 = g1.ghosts[l], q2 = g2.ghosts[l];
        if (!q1 || !q2 || q1.a < 0.05) continue;
        ctx.globalAlpha = q1.a; piece(q1.c, q1.hw, q2.c, q2.hw, 0.06); ctx.globalAlpha = 1;
      }
      if (g1.joined) {
        const L1 = envL(g1), R1 = envR(g1), L2 = envL(g2), R2 = envR(g2), rw = 0.12 * (R1 - L1) / 2;
        band(a.y, U(a, L1 - rw), U(a, R1 + rw), b.y, U(b, L2 - rw), U(b, R2 + rw), col('R'));
        band(a.y, U(a, L1), U(a, R1), b.y, U(b, L2), U(b, R2), road);
        // The finish line: a checkerboard across the road.
        if (fin) for (let c = (s.i % 2); c < 10; c += 2) {
          const f0 = c / 10, f1 = (c + 1) / 10;
          band(a.y, U(a, L1 + (R1 - L1) * f0), U(a, L1 + (R1 - L1) * f1), b.y, U(b, L2 + (R2 - L2) * f0), U(b, L2 + (R2 - L2) * f1), '#0d1117');
        }
        if (alt && !fin && g1.pcs.length === g2.pcs.length) for (let l = 0; l < g1.pcs.length - 1; l++) {
          if (g1.pcs[l + 1].c - g1.pcs[l].c <= 0.4) continue;
          const m1 = (g1.pcs[l].c + g1.pcs[l + 1].c) / 2, m2 = (g2.pcs[l].c + g2.pcs[l + 1].c) / 2, lw = 0.022 * (R1 - L1) / 2;
          band(a.y, U(a, m1 - lw), U(a, m1 + lw), b.y, U(b, m2 - lw), U(b, m2 + lw), '#e9e4d6');
        }
      } else for (let l = 0; l < g1.pcs.length; l++) {
        // At the gate the next segment is the branch taken coming back: draw this one square.
        const q1 = g1.pcs[l], q2 = g2.pcs.length === g1.pcs.length ? g2.pcs[l] : q1;
        piece(q1.c, q1.hw, q2.c, q2.hw, 0.05 * Math.min(1, s.f * 4));
      }
      const fogA = Math.min(0.18, Math.pow(n / DRAW, 3) * 0.25);
      if (fogA > 0.02) { ctx.fillStyle = rgb(T.F, fogA); ctx.fillRect(0, b.y, W, a.y - b.y); }
    }
    // Sprites, far to near, each clipped by the road in front of it.
    const bySeg = new Map();
    for (const c of cars) { if (c.dead) continue; const i = Math.floor(c.z / SEG); if (i >= base.i && i <= last) { if (!bySeg.has(i)) bySeg.set(i, []); bySeg.get(i).push(c); } }
    // The daily's ghost: today's best run, see-through, when it is ahead on the same road.
    let gh = ghostNow(); if (gh && (gh.z < myZ() + 1.5 || gh.z > last)) gh = null;
    for (let n = last - base.i; n > 0; n--) {
      const s = segs[base.i + n]; if (s.p1.c.z <= DEPTH) continue;
      // Nothing on this segment: no clip to set and undo (web.109 — most of the 300 have nothing).
      const cs = bySeg.get(s.i);
      if (!cs && !s.gate && s.i !== finishSeg && !(gh && Math.floor(gh.z) === s.i) && !s.sprites.some((sp) => !sp.got)) continue;
      const sc = s.p1.s.scale * W / 2, sx = s.p1.s.x, sy = s.p1.s.y, g = s.g;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, s.clip); ctx.clip();
      for (const sp of s.sprites) {
        if (sp.got) continue;
        if (sp.t === 'side') { const e = sp.side < 0 ? envL(g) : envR(g); drawSide(s.T.side, sx + sc * (e + sp.side * 0.32) * ROAD, sy, sc, sp.v, sp.side); }
        else if (sp.t === 'chip') drawChip(sx + sc * g.pcs[sp.lane].c * ROAD, sy, sc);
      }
      if (s.gate) drawGate(s, sc, sx, sy, g);
      if (s.i === finishSeg) drawFinish(sc, sx, sy, g);
      if (gh && Math.floor(gh.z) === s.i) {
        const tt = gh.z % 1, gx = sx + sc * gh.x * ROAD, gy = sy + (s.p2.s.y - sy) * tt, gw = sc * 560;
        ctx.globalAlpha = 0.55;
        drawCarRear(gx, gy, gw, '#9fd3ff', s.T.night, 'sport');
        // Its 👻 above it, readable even far down the road.
        ctx.globalAlpha = 0.9; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.font = Math.round(clamp(gw * 0.4, 11, 26)) + 'px system-ui, sans-serif';
        ctx.fillText('👻', gx, gy - gw * 0.55 - 3);
        ctx.globalAlpha = 1;
      }
      if (cs) for (const c of cs) { const tt = (c.z % SEG) / SEG; drawCarRear(sx + sc * carX(c, s, g) * ROAD, sy + (s.p2.s.y - sy) * tt, sc * 520, c.col, s.T.night, c.kind); }
      ctx.restore();
    }
    const spd = v / MAXV;
    if ((spd > 0.78 || boost || mt > 0) && !shell.reduced && state === 'run') {
      const hot = boost || mt > 0;
      ctx.strokeStyle = 'rgba(244,238,223,' + (hot ? 0.35 : 0.18) + ')'; ctx.lineWidth = 1.5;
      for (let i = 0; i < (hot ? 14 : 7); i++) {
        const an = Math.random() * Math.PI * 2, r0 = Math.max(W, H) * (0.45 + Math.random() * 0.2), r1 = r0 + 30 + spd * 60;
        ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(an) * r0, cy + Math.sin(an) * r0 * 0.7); ctx.lineTo(W / 2 + Math.cos(an) * r1, cy + Math.sin(an) * r1 * 0.7); ctx.stroke();
      }
    }
    for (const p of parts) { ctx.fillStyle = 'rgba(' + p.c + ',' + (p.spark ? Math.min(1, p.life * 5) : Math.max(0, p.life) * 0.5) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
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
    for (let l = 0; l < g.pcs.length; l++) {
      const p = g.pcs[l], X = sx + sc * p.c * ROAD, half = sc * p.hw * 1.15 * ROAD, h = sc * 1500, top = sy - h, pw = Math.max(1.5, sc * 70);
      ctx.globalAlpha = gate.picked >= 0 && gate.picked !== l ? 0.25 : 1;
      ctx.fillStyle = '#0d1117'; ctx.fillRect(X - half - pw / 2, top, pw, h); ctx.fillRect(X + half - pw / 2, top, pw, h);
      const bh = Math.max(4, sc * 240); ctx.fillStyle = l ? '#d8573f' : '#4fa760'; ctx.fillRect(X - half, top - bh * 0.2, half * 2, bh);
      if (bh > 8 && br[l]) {
        ctx.fillStyle = '#fbf7ee'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.font = '700 ' + Math.round(bh * 0.55) + 'px Inter, system-ui, sans-serif';
        ctx.fillText(TH[br[l]].name.toUpperCase(), X, top + bh * 0.55, half * 1.9);
      }
      const cw = sc * 340;
      if (cw > 2) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(X - cw * 0.04, sy - sc * 120, cw * 0.08, sc * 120); card(X, sy - sc * 120 - cw * 0.7, cw, gate.cards[l]); }
      ctx.globalAlpha = 1;
    }
  }
  /** The finish (web.61, narmod: « two posts either side of the road, a flag on
   *  top »): striped posts and a checkered banner across (web.62: without the
   *  flags on the posts, « too heavy »). */
  function drawFinish(sc, sx, sy, g) {
    const L = sx + sc * (envL(g) - 0.1) * ROAD, Rr = sx + sc * (envR(g) + 0.1) * ROAD, h = sc * 2700, pw = Math.max(2, sc * 120);
    if (pw < 1) return;
    const top = sy - h, bh = Math.max(3, sc * 460);
    // Posts, red and white.
    for (const X of [L, Rr]) {
      ctx.fillStyle = '#f4eedf'; ctx.fillRect(X - pw / 2, top, pw, h);
      ctx.fillStyle = '#c2303a'; const st = Math.max(2, sc * 260);
      for (let y = top + bh; y < sy; y += st * 2) ctx.fillRect(X - pw / 2, y, pw, Math.min(st, sy - y));
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(X, sy, pw * 1.4, pw * 0.35, 0, 0, 7); ctx.fill();
    }
    // The banner: a checkerboard, two rows, framed.
    const bw = Rr - L, n = Math.max(4, Math.round(bw / (bh / 2) / 2) * 2), cw = bw / n;
    ctx.fillStyle = '#f4eedf'; ctx.fillRect(L, top, bw, bh);
    ctx.fillStyle = '#0d1117';
    for (let r = 0; r < 2; r++) for (let c = r % 2; c < n; c += 2) ctx.fillRect(L + c * cw, top + r * bh / 2, cw + 0.5, bh / 2 + 0.5);
    ctx.strokeStyle = '#0d1117'; ctx.lineWidth = Math.max(1, bh * 0.08); ctx.strokeRect(L, top, bw, bh);
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
    } else if (kind === 'riviera') {
      if (side > 0) {
        // The beach side: palms and parasols.
        if (vv % 2) drawSide('palm', X, y, sc, vv, side);
        else {
          const h = u * 6, r = u * 3.2;
          ctx.fillStyle = '#e9e4d6'; ctx.fillRect(X - u * 0.15, y - h, u * 0.3, h);
          ctx.fillStyle = vv === 2 ? '#2f78b8' : '#c2303a'; ctx.beginPath(); ctx.moveTo(X - r, y - h + u * 0.6); ctx.quadraticCurveTo(X, y - h - u * 1.8, X + r, y - h + u * 0.6); ctx.fill();
          ctx.fillStyle = '#f4eedf'; ctx.beginPath(); ctx.moveTo(X - r * 0.3, y - h - u * 0.6); ctx.quadraticCurveTo(X, y - h - u * 1.4, X + r * 0.3, y - h - u * 0.6); ctx.lineTo(X + r * 0.36, y - h + u * 0.45); ctx.lineTo(X - r * 0.36, y - h + u * 0.45); ctx.fill();
        }
      } else if (vv % 2) {
        // Inland: an umbrella pine…
        const h = u * 13, cw = u * 7;
        ctx.strokeStyle = '#5a3e28'; ctx.lineWidth = Math.max(1, u * 0.8); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(X, y); ctx.quadraticCurveTo(X - side * u * 1.5, y - h * 0.5, X - side * u * 0.6, y - h * 0.85); ctx.stroke(); ctx.lineCap = 'butt';
        ctx.fillStyle = '#2f5e2c'; ctx.beginPath(); ctx.ellipse(X - side * u * 0.6, y - h * 0.9, cw / 2, u * 1.8, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#3c7034'; ctx.beginPath(); ctx.ellipse(X - side * u * 0.9, y - h * 0.97, cw * 0.36, u * 1.1, 0, 0, 7); ctx.fill();
      } else {
        // … or a white villa under its tiled roof.
        const w = u * 9, h = u * 5;
        ctx.fillStyle = '#f2ece0'; ctx.fillRect(X - w / 2, y - h, w, h);
        ctx.fillStyle = '#c4643c'; ctx.beginPath(); ctx.moveTo(X - w * 0.58, y - h); ctx.lineTo(X, y - h - u * 2.2); ctx.lineTo(X + w * 0.58, y - h); ctx.fill();
        ctx.fillStyle = '#4a7fa8'; for (const fx2 of [-0.28, 0.12]) ctx.fillRect(X + w * fx2, y - h * 0.72, w * 0.16, h * 0.3);
        ctx.fillStyle = '#6b4a2e'; ctx.fillRect(X - w * 0.06, y - h * 0.5, w * 0.12, h * 0.5);
      }
    } else if (kind === 'lamp') {
      const h = u * 13, lx = X - side * u * 2.4, ly = y - h + u * 0.9;
      ctx.fillStyle = '#14161c'; ctx.fillRect(X - u * 0.3, y - h, u * 0.6, h); ctx.fillRect(X - side * u * 2.6, y - h, u * 2.6, u * 0.5);
      const gr = Math.min(u * 3, 50), gl = ctx.createRadialGradient(lx, ly, 0, lx, ly, gr);
      gl.addColorStop(0, 'rgba(255,214,140,.45)'); gl.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = gl; ctx.fillRect(lx - gr, ly - gr, gr * 2, gr * 2);
      ctx.fillStyle = '#ffe6b0'; ctx.beginPath(); ctx.arc(lx, ly, u * 0.7, 0, 7); ctx.fill();
    }
  }
  function drawCarRear(X, by, w, col, night, kind) {
    if (w < 2.5) return;
    if (kind === 'van') { drawVan(X, by, w, col, night); return; }
    const sport = kind === 'sport', h = w * (sport ? 0.5 : 0.62), x = X - w / 2, y = by - h, lx = [x + w * 0.15, x + w * 0.85], ly = y + h * 0.52;
    // At night the tail lights glow: a car is seen from afar before its shape.
    if (night) for (const cx of lx) {
      const r = Math.max(w * 0.32, 4), gl = ctx.createRadialGradient(cx, ly, 0, cx, ly, r);
      gl.addColorStop(0, 'rgba(255,70,70,.55)'); gl.addColorStop(1, 'rgba(255,70,70,0)'); ctx.fillStyle = gl; ctx.fillRect(cx - r, ly - r, r * 2, r * 2);
    }
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(X, by, w * 0.55, w * 0.07, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#0d1117'; rr(x + w * 0.04, by - h * 0.32, w * 0.18, h * 0.32, w * 0.05); ctx.fill(); rr(x + w * 0.78, by - h * 0.32, w * 0.18, h * 0.32, w * 0.05); ctx.fill();
    // A dark outline sets the body off the tarmac and off the light verges.
    ctx.strokeStyle = 'rgba(8,10,14,.75)'; ctx.lineWidth = Math.max(1, w * 0.035); ctx.fillStyle = col;
    rr(x, y + h * 0.2, w, h * 0.68, w * 0.16); ctx.fill(); ctx.stroke(); rr(x + w * 0.16, y, w * 0.68, h * 0.4, w * 0.14); ctx.fill(); ctx.stroke();
    rr(x, y + h * 0.2, w, h * 0.68, w * 0.16); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.22)'; rr(x + w * 0.06, y + h * 0.24, w * 0.88, h * 0.08, h * 0.04); ctx.fill();
    ctx.fillStyle = '#1b2533'; rr(x + w * 0.22, y + h * 0.06, w * 0.56, h * 0.26, w * 0.08); ctx.fill();
    ctx.fillStyle = '#f4eedf'; rr(X - w * 0.12, y + h * 0.6, w * 0.24, h * 0.13, h * 0.03); ctx.fill();
    ctx.fillStyle = night ? '#ff6a6a' : '#ff3b40'; ctx.beginPath(); ctx.arc(lx[0], ly, w * 0.08, 0, 7); ctx.arc(lx[1], ly, w * 0.08, 0, 7); ctx.fill();
    if (sport) { ctx.fillStyle = '#14171c'; rr(x - w * 0.02, y + h * 0.1, w * 1.04, h * 0.1, h * 0.04); ctx.fill(); ctx.fillRect(x + w * 0.12, y + h * 0.18, w * 0.05, h * 0.12); ctx.fillRect(x + w * 0.83, y + h * 0.18, w * 0.05, h * 0.12); }
  }
  /** A van from behind: a tall box, two rear doors, lights up the sides. */
  function drawVan(X, by, w, col, night) {
    const h = w * 0.95, x = X - w / 2, y = by - h, ly = by - h * 0.42;
    if (night) for (const cx of [x + w * 0.07, x + w * 0.93]) {
      const r = Math.max(w * 0.32, 4), gl = ctx.createRadialGradient(cx, ly, 0, cx, ly, r);
      gl.addColorStop(0, 'rgba(255,70,70,.55)'); gl.addColorStop(1, 'rgba(255,70,70,0)'); ctx.fillStyle = gl; ctx.fillRect(cx - r, ly - r, r * 2, r * 2);
    }
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(X, by, w * 0.55, w * 0.07, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#0d1117'; rr(x + w * 0.04, by - h * 0.2, w * 0.18, h * 0.2, w * 0.05); ctx.fill(); rr(x + w * 0.78, by - h * 0.2, w * 0.18, h * 0.2, w * 0.05); ctx.fill();
    ctx.strokeStyle = 'rgba(8,10,14,.75)'; ctx.lineWidth = Math.max(1, w * 0.035); ctx.fillStyle = col;
    rr(x, y, w, h * 0.9, w * 0.1); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(8,10,14,.45)'; ctx.lineWidth = Math.max(1, w * 0.02);
    ctx.beginPath(); ctx.moveTo(X, y + h * 0.06); ctx.lineTo(X, y + h * 0.84); ctx.stroke();
    ctx.fillStyle = '#1b2533'; rr(x + w * 0.12, y + h * 0.1, w * 0.34, h * 0.22, w * 0.04); ctx.fill(); rr(x + w * 0.54, y + h * 0.1, w * 0.34, h * 0.22, w * 0.04); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(x + w * 0.05, y + h * 0.03, w * 0.9, h * 0.035, h * 0.02); ctx.fill();
    ctx.fillStyle = '#f4eedf'; rr(X - w * 0.12, y + h * 0.68, w * 0.24, h * 0.09, h * 0.02); ctx.fill();
    ctx.fillStyle = night ? '#ff6a6a' : '#ff3b40'; rr(x + w * 0.02, ly - h * 0.1, w * 0.09, h * 0.2, w * 0.03); ctx.fill(); rr(x + w * 0.89, ly - h * 0.1, w * 0.09, h * 0.2, w * 0.03); ctx.fill();
  }

  // The player's car, in two halves around the Ace: what is behind him on the
  // stage's canvas, the body in front of him on the front one.
  function carFrame() {
    const w = carW(), h = w * 0.42;
    return { w, h, x: W / 2 + slide, y: H - 10 + bob };
  }
  // The car in 3D (car3d.mjs): its yaw follows the steering a little and a
  // drift a lot (web.62, narmod: « a car in 3/4, a real rotation »).
  const carYaw = () => yaw + (spin > 0 ? Math.sin(spin * 26) * 0.3 * spin / 0.6 : 0);
  const carOpts = () => { const { w, x, y } = carFrame(); return { x, y, w, yaw: carYaw(), pitch: 0.22, pivot: 1.0, color: '#c2303a', boost: boost || mt > 0, plate }; };
  /** The tyre marks a drift leaves behind the rear wheels. */
  function skidMarks(w, x, y) {
    const a = Math.abs(turn); if (a < 0.05) return;
    const sd = Math.sign(turn);
    ctx.strokeStyle = 'rgba(12,12,14,' + (0.4 * a).toFixed(2) + ')'; ctx.lineWidth = w * 0.08; ctx.lineCap = 'round';
    for (const wx of [-0.4, 0.4]) {
      const x0 = x + w * wx - sd * w * 0.12 * a;
      ctx.beginPath(); ctx.moveTo(x0, y - w * 0.02); ctx.quadraticCurveTo(x0 - sd * w * 0.05, y + w * 0.2, x0 - sd * w * 0.22 * a, y + w * 0.6); ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }
  // web.109 (audit lot 3): the car is ~700 faces (car3d.mjs), some 2 800 canvas calls a frame. While its yaw holds
  // still (driving straight, or a steady curve) each half is painted once and copied; while it turns, and the tail
  // with the nitro's flickering flames, it is drawn as before. Yaw in steps of 0.004 rad: under half a pixel.
  const carSprites = spriteCache(shell, 16), carQ = { back: NaN, front: NaN }, YAW_Q = 0.004;
  function carDraw(g, o, part) {
    const q = Math.round(o.yaw / YAW_Q), steady = carQ[part] === q;
    carQ[part] = q;
    if (!steady || (part === 'front' && o.boost)) { drawCar(g, o, part); return; }
    const w = o.w, at = Object.assign({}, o, { yaw: q * YAW_Q, x: 0, y: 0 });
    carSprites.draw(g, part + '|' + q + '|' + w.toFixed(2) + '|' + o.color + '|' + o.pitch + '|' + (o.boost ? 1 : 0), o.x, o.y,
      [-1.16 * w, -1.03 * w, 2.32 * w, 1.1 * w], (c) => drawCar(c, at, part));
  }
  function drawCarBack(g) {
    const o = carOpts();
    ctx = g; skidMarks(o.w, o.x, o.y);
    carDraw(g, o, 'back');
    // Dame de Cœur: the Queen of Hearts in the passenger seat.
    if (mode === 'queen' && state !== 'title' && state !== 'board') {
      const sp = seatPoint(o, 0.17), cw = o.w * 0.19;
      card(sp.x, sp.y - cw * 0.45, cw, 23);     // 23 = Q♥ (suit 1 = ♥ × 13 + rank 10 = Q)
    }
  }
  function drawCarFront(g) {
    const o = carOpts(), { w, h, x, y } = carFrame();
    ctx = g; carDraw(g, o, 'front');
    if (drift) {
      g.save(); g.translate(x, y); g.font = '700 ' + Math.round(Math.max(12, w * 0.14)) + 'px Inter, system-ui, sans-serif';
      g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.6)';
      const s = 'DRIFT' + (driftGain ? ' +' + driftGain : ''); g.strokeText(s, 0, -h * 2.5); g.fillStyle = '#ffd27a'; g.fillText(s, 0, -h * 2.5);
      g.restore();
    }
  }
  /** The plate « A♠ », centred on (x, y): the A in the font, the spade drawn —
   *  iOS Safari sometimes measured the « ♠ » with one font and drew it with
   *  another (the emoji one), and the plate's text slid off its centre. */
  function plate(g, x, y, fs) {
    const size = Math.max(6, Math.round(fs));
    g.font = '700 ' + size + 'px Inter, system-ui, sans-serif';
    g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#0d1117';
    const wa = g.measureText('A').width, sw = size * 0.72, gap = size * 0.08, x0 = x - (wa + gap + sw) / 2;
    g.fillText('A', x0, y + size * 0.04);
    spade(g, x0 + wa + gap + sw / 2, y, sw);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  }
  /** A spade, w wide, centred on (x, y). */
  function spade(g, x, y, w) {
    const h = w * 1.05, top = y - h / 2;
    g.beginPath();
    g.moveTo(x, top);
    g.bezierCurveTo(x + w * 0.2, top + h * 0.25, x + w * 0.5, top + h * 0.35, x + w * 0.5, top + h * 0.58);
    g.bezierCurveTo(x + w * 0.5, top + h * 0.78, x + w * 0.22, top + h * 0.82, x + w * 0.06, top + h * 0.68);
    g.lineTo(x + w * 0.16, top + h); g.lineTo(x - w * 0.16, top + h); g.lineTo(x - w * 0.06, top + h * 0.68);
    g.bezierCurveTo(x - w * 0.22, top + h * 0.82, x - w * 0.5, top + h * 0.78, x - w * 0.5, top + h * 0.58);
    g.bezierCurveTo(x - w * 0.5, top + h * 0.35, x - w * 0.2, top + h * 0.25, x, top);
    g.closePath(); g.fill();
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
    if (state === 'title' || state === 'board') pose = 'prun-wave';
    if (state === 'over') pose = outroWin ? 'prun-up' : 'prun-slump';
    rot += turn * 0.08;
    if (state === 'run' && wasOff && !shell.reduced) dy += (Math.random() - 0.5) * h * 0.08;
    if (state === 'run' && time < 8 && !shell.reduced) rot += Math.sin(performance.now() / 20) * 0.04;
    ace.pose(pose);
    ace.mood(act.a === 'spin' || (state === 'over' && outroWin) ? 'mc-m-yay' : 'mc-m-smile');
    // The card (84 sprite px wide) as wide as the seat; its bottom below the seat's top.
    // In the driver's seat of the 3D car (car3d.mjs), wherever it is turned.
    const s = (w * 0.26) / 84, sp = seatPoint(carOpts());
    const tilt = (keys.l ? -0.08 : keys.r ? 0.08 : 0) + rot;
    ace.place(sp.x, sp.y + w * 0.08 + dy + 56 * s, s, shell.k, tilt * 180 / Math.PI);
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
  refreshHof();
  try { if (navigator.webdriver) window.__pthRun = { state: () => state, hof: () => openHof(), start: (m) => { if (m) modeSel = Math.max(0, MODES.indexOf(m)); start(); }, addStack: (n) => { stack += n; }, game: () => ({ pos, px, time, stack, inv, keys: Object.assign({}, keys), boost, board: board.slice(), gates, stageTheme: stageTheme.slice() }), segAt: () => findSeg(pos + PLAYER_Z).i, setTime: (x) => { time = x; }, setPos: (z) => { pos = z * SEG; }, view: () => Object.assign({}, view), segs: () => segs.length, finish: () => finishSeg, cars: () => cars, setPx: (x) => { px = x; pv = 0; }, setV: (x) => { v = x * MAXV; }, drift: () => drift, slip: () => slip, curve: (i) => segs[i].curve, mt: () => mt, charge: () => charge, lvl: () => lvl.slice(), branches: () => branches.map((b) => b.slice()), stageCurves: (k) => applied[k] ? applied[k].c.reduce((m, v) => Math.max(m, Math.abs(v)), 0) : 0, chipVal, mode: () => mode, quests: () => quests.map((q) => Object.assign({}, q)), quest: () => quest && Object.assign({}, quest), setMode: (m) => { modeSel = Math.max(0, MODES.indexOf(m)); }, ghost: () => ghost, gap: () => gGap, ghostNow: () => ghostNow(), hole: () => hole.slice(), cards: () => gates.map((g) => g.cards.slice()), carsAt: () => trafficSig, gT: () => gT, forceQuest: (id) => { if (quest) quests.pop(); quest = { id, stage: findSeg(pos + PLAYER_Z).stage, t: 0, c: 0, done: false }; quests.push(quest); renderQuest(true); } }; } catch (e) {}

  return {
    update, draw, input,
    running: () => state === 'run' || state === 'outro',
    theme() {},
    resize() {},
    destroy() {
      clearTimeout(revealTimer);
      try { if (window.__pthRun) delete window.__pthRun; } catch (e) {}
      front.remove(); prev.remove(); ace.remove();
      shell.root.classList.remove('prun-pad'); shell.padMode = null; qBox.remove(); nitroBox.remove();
      if (nitroBtn && nitroWas) { gauge.remove(); nitroBtn.textContent = nitroWas.text; if (nitroWas.label) nitroBtn.setAttribute('aria-label', nitroWas.label); nitroBtn.classList.remove('prun-ready', 'prun-burn'); }
    },
  };
}
