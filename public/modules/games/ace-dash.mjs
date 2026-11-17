// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Ace Dash — the Ace's runner seen from behind, on three lanes (web
// extension, narmod 2026-11-13). Arcade page (games/index.mjs), next to Ace
// Runner, its side-view cousin, whose rules it shares.
//
// Pseudo-3D on the shell's 2D canvas: one perspective camera behind the Ace
// (P(x, y, z) → screen), the felt in alternating bands that scroll towards
// him, the rails of the table on both sides, fog far away. The Ace is the SVG
// mascot (games/common.mjs aceActor) turned round — his card back shows,
// the player's back being on his deck — and turns to face us when he stops.
// What has gone past him is painted on a second canvas over him, so a stack
// he jumped is drawn in front of his feet.
//   Lanes      ← → (keys, pad, swipe) — one lane at a time, smoothly
//   Jump       ↑, Space, tap or swipe up — always the same height; a jump
//              pressed just before landing is kept (JUMP_BUF_MS)
//   Backflip   jump again in the air (web.47): a higher jump and a backflip,
//              once per jump — high enough to clear a card wall, the dealer
//              button or a flying card (+SALTO_BONUS); near the felt it is a
//              buffered jump. A ramp launches him into one, chips up high.
//   Duck       ↓ held, or a swipe down for a short roll (DUCK_SWIPE_MS)
//   Obstacles  chip stacks (jump or change lane), flying cards (duck), card
//              walls and the rolling dealer button (change lane). Every row
//              leaves one lane free; from level 4 the free lane may hold a
//              stack or a flying card.
//   Pick-ups   chips (CHIP_PTS each × the streak), face-up cards of the
//              player's deck (the best five-card hand, games/poker-hand.mjs,
//              adds its bonus, the Joker is wild), the gold All-In chip (crown
//              and sceptre, nothing stops him, the distance counts double), the
//              blue Insurance chip (it takes one hit for him) and the purple
//              Magnet chip (the chips of every lane come to him)
// The long run (web.48, narmod « all of them »: 1-8), after Ace Runner:
//   Venues     every VENUE_LV levels (games/runner-scenery.mjs, the panorama at
//              the end of the felt): the club, Las Vegas, the cruise,
//              Monte-Carlo, Macao, the final table — each brings a pattern
//              (low cards, the bouncing button, tall stacks, zigzag rows, all of
//              them); the floor beside the table changes too. The day goes by.
//   Difficulty speedFor() eases up towards SPEED_CAP, gapFor() closes the rows
//              a little at each level: no wall.
//   Score      (distance + chip points) + the hand's bonus (Ace Runner's
//              RUN_BONUS, +20 % a pair … +300 % a royal flush); the records of
//              the old score restarted (games/index.mjs resetDashRecord).
//   Modes      Free run (the record of the arcade's card), Daily challenge (the
//              same course and cards for everyone today: a seeded generator)
//              and Time attack (TIME_S seconds; a crash costs TIME_HIT s).
//   Streak     a line of chips taken whole raises the streak (up to ×STREAK_MAX),
//              a line started and missed sets it back to ×1.
//   Rebuy      busted with REBUY chips or more (free run, daily), once a run:
//              pay them and he is back in the race.
//   Jetpack    (web.72, narmod: « A + C » of the proposals) a rare pick-up
//              from level JET_LEVEL (two chip stacks with flames): he flies
//              JET_S seconds at JET_Y over everything, ← → still change lane;
//              a trail of chips waits up there and, half way, three face-up
//              cards, one per lane — the one he flies through joins his hand
//              (better than a pair: fireworks), the others go back under the
//              deck. The felt is cleared before he lands, then JET_SAFE_MS of
//              safety. Time attack: +JET_TIME s. Not during All-In.
//   Skates     (web.73) the teal chip: SKATE_MS of roller skates — faster
//              (×SKATE_SPEED), the distance counts ×SKATE_DIST, lanes change at
//              once; from an edge lane, on towards the side: he jumps on the
//              table's rail and grinds along it (+GRIND_PTS every GRIND_EVERY s,
//              sparks; nothing on the rail, no chips either).
//   Hourglass  (web.73) the sand chip: SLOW_MS of slow motion — the whole
//              game at SLOW_K (the time attack's clock too).
//   Pool table (web.74, narmod: « a pool table in the air, climb on it for a
//              super bonus ») from level POOL_LEVEL, now and then: a gold ramp,
//              then a pool table floating at POOL_Y over the three lanes. The
//              ramp's backflip lands him on it (a backflip at the right time
//              too): balls to jump or go round — one hit knocks him off the
//              table, back to the felt, no harm done —, gold chips worth ×2
//              and at the end the 8-ball: the jackpot (POOL_CHIPS chips and a
//              card). Missed, he simply runs underneath (no rows there).
// Sounds come from modules/sounds.mjs, the texts from Ace Runner's keys (ar*)
// plus the ad* keys.
// ═══════════════════════════════════════════════════════════════════

import { evalCards, JOKER } from './poker-hand.mjs';
import { CHIP, fmt, backUrl, cardHtml, imageCache, drawFace, rr, aceActor, ink, ACE_ID } from './common.mjs';
import { drawScenery, skyAt, dayAt, VENUES } from './runner-scenery.mjs';
import { RUN_BONUS } from './ace-runner.mjs';
import { rng } from './deal.mjs';
import { dayKey } from './solitaire-rules.mjs';
import { titleScreen } from './title.mjs';
import { hofOn, hofStart, hofEnd, hofPanel } from './hof.mjs';
import { endScreen, stepsHtml } from './end.mjs';

// World units are metres; the camera looks down the felt (+z, away from it).
const PZ = 4;                 // the Ace's depth in front of the camera
const ZN = 0.8, ZFAR = 62, Z_SPAWN = 60, SEG = 2;   // near plane, fog end, where rows appear, felt band length
const LANE = 1.6, HALF = 2.45, RAIL = 0.55;         // lane width, half the felt, the rail
const GRAV = 19, JUMP_V = 6.3, JUMP2_V = 7.6, RAMP_V = 8.2, DIVE_V = -11, LANE_V = 12.5;
const FLIP_S = 0.6, FLIP_LOW = 0.35;                // the backflip's length; below that height, falling, a press is a buffered jump
const STAND = 1.15, DUCKH = 0.55;                   // the Ace's height, standing and ducking
const BLIND_EVERY = 300;
export const VENUE_LV = 5;                          // levels per venue
const ALLIN_MS = 4500, ALLIN_WARN_MS = 1500, MAGNET_MS = 6000, SAFE_MS = 900, JUMP_BUF_MS = 140, DUCK_SWIPE_MS = 620;
const CLOSE_BONUS = 10, SMASH_BONUS = 25, SALTO_BONUS = 25, CHIP_PTS = 10;
export const STREAK_MAX = 5, REBUY = 25, TIME_S = 60, TIME_HIT = 5;
const BOUNCE_H = 1.05;                              // the bouncing button's hop
const HOR = 96, GROUND_OFF = 46;                    // horizon line; the Ace's feet above the bottom (world px)
const BG_GY = 210;                                  // the panorama is drawn this tall, then fitted above the horizon
const INS_COL = ['#1f4e9e', '#f5f0e3'], MAG_COL = ['#6a3fb5', '#efe6ff'];
const SKATE_COL = ['#178a8a', '#e6fbfb'], SLOW_COL = ['#b98a2e', '#fff3d6'];
// Roller skates and the hourglass (web.73).
export const SKATE_MS = 8000, SKATE_SPEED = 1.2, SKATE_DIST = 1.5, GRIND_PTS = 5, GRIND_EVERY = 0.25, SLOW_MS = 5000, SLOW_K = 0.5;
const RAIL_X = HALF + RAIL / 2, RAIL_Y = 0.11;      // the middle of the rail, its top
// The pool table in the air (web.74): its top's height and thickness, half its width, the jackpot.
export const POOL_Y = 1.35, POOL_LEVEL = 4, POOL_CHIPS = 25;
const POOL_T = 0.12, POOL_HW = HALF - 0.15, POOL_ROWS = 55, POOL_ROWS_RND = 20;
const BALL_R = 0.26, BALL_COL = ['#f2c12e', '#2364c4', '#d23a2f', '#6a3fb5', '#f07f2a', '#1f8a4c', '#8a2a2a'];
/** The pool table's length for a speed: 3.4 s of it, 36 to 85 m. */
export const poolLen = (speed) => clamp(speed * 3.4, 36, 85);
const DAILY_KEY = 'pth_ad_daily', BEST_KEY = 'pth_ad_best';
// The jetpack: flight (s), height (m), the climb and the landing (s), the
// rows between two (about 800 – 1 000 m), safety after landing, time attack's gift.
export const JET_S = 6, JET_Y = 2.4, JET_LEVEL = 3, JET_TIME = 5;
const JET_UP = 0.6, JET_DOWN = 0.7, JET_SAFE_MS = 1500, JET_ROWS = 46, JET_ROWS_RND = 12;
/** The jetpack's height after f seconds of flight (0 … JET_Y … 0). */
export function jetHeight(f) {
  if (f <= 0 || f >= JET_S) return 0;
  const e = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  return JET_Y * (f < JET_UP ? e(f / JET_UP) : f > JET_S - JET_DOWN ? e((JET_S - f) / JET_DOWN) : 1);
}

// Speed (m/s): from SPEED0 up towards SPEED_CAP, about half way by level 9,
// plus a little with the time in the run.
const SPEED0 = 11, SPEED_CAP = 27, SPEED_K = 12;
/** The speed aimed at, at level lvl after t seconds of running. */
export function speedFor(lvl, t) { return SPEED0 + (SPEED_CAP - SPEED0) * (1 - Math.exp(-(lvl - 1) / SPEED_K)) + Math.min(1.6, t * 0.012); }
/** Seconds between two rows at level lvl: closer and closer, never under 0.8. */
export function gapFor(lvl) { return 0.8 + 0.65 * Math.exp(-(lvl - 1) / 7); }
/** The venue (0 … 5) of a level. */
export const venueAt = (lvl) => Math.min(VENUES.length - 1, Math.floor((Math.max(1, lvl) - 1) / VENUE_LV));
/** The hand's bonus (0 … 3: +0 % … +300 %). */
export const bonusOf = (ev) => (ev && ev.cat >= 0 ? RUN_BONUS[ev.cat] : 0);
/** Free run and daily: (distance + chip points) plus the hand's bonus. */
export function dashScore(dist, chipPts, ev) { const b = Math.floor(dist) + chipPts; return b + Math.round(b * bonusOf(ev)); }
/** Time attack: the chip points plus the hand's bonus. */
export function timeScore(chipPts, ev) { return chipPts + Math.round(chipPts * bonusOf(ev)); }
/** The streak after a whole line of chips (×1 … ×STREAK_MAX). */
export const streakUp = (s) => Math.min(STREAK_MAX, s + 1);

export const MODES = [
  { id: 'free', icon: '🏁', key: 'adModeFree', desc: 'adModeFreeD' },
  { id: 'daily', icon: '📅', key: 'psDaily', desc: 'adModeDailyD' },
  { id: 'time', icon: '⏱️', key: 'adModeTime', desc: 'adModeTimeD' },
];

const CSS = `
/* Sideways on a touch screen (web.81, narmod: « in landscape the buttons are badly placed »): ◀ on the left,
   ▲ over ▼ then ▶ on the right — each thumb its direction. */
#pth-game.adash-pad.pg-touch .pg-play.pg-land{display:grid;grid-template-columns:repeat(4,auto);grid-template-rows:1fr 1fr;justify-content:center;align-content:center;gap:12px}
#pth-game.adash-pad .pg-land .pg-stage{grid-column:2;grid-row:1 / span 2}
#pth-game.adash-pad .pg-land .pg-pad button[data-a="left"]{grid-column:1;grid-row:1 / span 2}
#pth-game.adash-pad .pg-land .pg-pad button[data-a="jump"]{grid-column:3;grid-row:1}
#pth-game.adash-pad .pg-land .pg-pad button[data-a="duck"]{grid-column:3;grid-row:2}
#pth-game.adash-pad .pg-land .pg-pad button[data-a="right"]{grid-column:4;grid-row:1 / span 2}
#${ACE_ID} .mc-card3d{transition:transform .42s cubic-bezier(.3,1.3,.5,1)}
#${ACE_ID}.adash-back .mc-card3d{transform:rotateY(180deg)}
#${ACE_ID}.adash-back .run .mc-lean,#${ACE_ID}.adash-back .air .mc-lean,#${ACE_ID}.adash-back .duck .mc-lean{transform:none}
#${ACE_ID}.adash-back .run .mc-legL{animation:adLeg .3s ease-in-out infinite alternate}
#${ACE_ID}.adash-back .run .mc-legR{animation:adLeg .3s ease-in-out infinite alternate-reverse}
#${ACE_ID}.adash-back .run .mc-armL{animation:adArmL .3s ease-in-out infinite alternate-reverse}
#${ACE_ID}.adash-back .run .mc-armR{animation:adArmR .3s ease-in-out infinite alternate}
@keyframes adLeg{from{transform:scaleY(1)}to{transform:translateY(-3px) scaleY(.68)}}
@keyframes adArmL{from{transform:rotate(6deg) scaleY(1)}to{transform:rotate(-4deg) scaleY(.8)}}
@keyframes adArmR{from{transform:rotate(-6deg) scaleY(1)}to{transform:rotate(4deg) scaleY(.8)}}
#${ACE_ID}.adash-back .air .mc-legL{transform:rotate(10deg) scaleY(.78)}#${ACE_ID}.adash-back .air .mc-legR{transform:rotate(-10deg) scaleY(.78)}
#${ACE_ID}.adash-back .flip .mc-legL,#${ACE_ID}.adash-back .flip .mc-legR{transform:scaleY(.55)}
#${ACE_ID}.adash-back .flip .mc-armL{transform:rotate(-40deg)}#${ACE_ID}.adash-back .flip .mc-armR{transform:rotate(40deg)}
#${ACE_ID}.adash-back .run .mc-card3d{animation:adSway .3s ease-in-out infinite alternate}
#${ACE_ID}.adash-back .run .mc-breath{animation:adRoll .6s ease-in-out infinite alternate}
@keyframes adSway{from{transform:rotateY(166deg) rotateZ(-3deg)}to{transform:rotateY(194deg) rotateZ(3deg)}}
@keyframes adRoll{from{transform:rotate(-2deg)}to{transform:rotate(2deg)}}
#${ACE_ID}.adash-back .duck .mc-card3d{transform:rotateY(180deg) rotateX(-18deg)}
#pth-game .adash-chip{display:inline-block;width:.8em;height:.8em;border-radius:50%;background:#b3261e;vertical-align:-.05em;margin-right:.25em;
  box-shadow:inset 0 0 0 .14em #f5f0e3,inset 0 0 0 .24em #b3261e}
#pth-game .ad-x{display:inline-block;margin-left:.3em;padding:0 .3em;border-radius:.5em;font-size:.72em;vertical-align:.15em;background:#d8b25a;color:#1d222b}
#pth-game .ad-x[hidden]{display:none}
#pth-game .ar-num.ad-low{color:#ff8a80}
@media (prefers-reduced-motion:reduce){#${ACE_ID} .mc-card3d{transition:none}#${ACE_ID}.adash-back .run .mc-card3d,#${ACE_ID}.adash-back .run .mc-breath{animation:none}}
.reduce-fx #${ACE_ID}.adash-back .run .mc-card3d,.reduce-fx #${ACE_ID}.adash-back .run .mc-breath{animation:none}
`;

// The table: felt and rail (the theme), the floor beside it (the venue).
const FELT = {
  dark: { feltA: '#1b5e3d', feltB: '#185437', railA: '#3b2416', railB: '#341f12', lip: '#5a3a22', dash: 'rgba(216,178,90,.42)' },
  light: { feltA: '#3f9a68', feltB: '#3a9061', railA: '#8a6a4a', railB: '#7d5f41', lip: '#a8865f', dash: 'rgba(120,88,14,.55)' },
};
// The floor beside the table in each venue, in bands: the club's boards, the
// Vegas carpet, the cruise's deck, Monte-Carlo's marble, Macao's red, the
// final table's dark stage.
const FLOOR = [['#4a3526', '#423022'], ['#5a1f2a', '#4c1a24'], ['#7a6046', '#6d553d'], ['#6e6b70', '#625f64'], ['#5a1a1a', '#4a1515'], ['#16161d', '#101016']];
const HAZE = ['#3a2c22', null, null, null, null, '#15151b'];
const hexRgb = (c) => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const anyRgb = (c) => (c[0] === '#' ? hexRgb(c) : c.slice(c.indexOf('(') + 1, -1).split(',').map(Number));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function loadJ(k) { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } }
function saveJ(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

/** A deck of 52 cards and the Joker, shuffled with `R`. */
function deckWith(R) {
  const deck = [];
  for (let n = 0; n < 52; n++) deck.push(n);
  for (let j = deck.length - 1; j > 0; j--) { const x = Math.floor(R() * (j + 1)); const tmp = deck[j]; deck[j] = deck[x]; deck[x] = tmp; }
  deck.splice(deck.length - 6 - Math.floor(R() * 30), 0, JOKER);
  return deck;
}

export function create(shell) {
  const { t, esc, sound } = shell;
  if (!document.getElementById('pth-game-dash-css')) {
    const st = document.createElement('style'); st.id = 'pth-game-dash-css'; st.textContent = CSS;
    document.head.appendChild(st);
  }
  const ace = aceActor(shell.layer);
  const aceRoot = /** @type {HTMLElement} */ (shell.layer.querySelector('#' + ACE_ID));
  const turnBack = (on) => { if (aceRoot) aceRoot.classList.toggle('adash-back', on); };
  // What has passed the Ace is painted over him, on a canvas of its own.
  const front = document.createElement('canvas');
  // Over the Ace (the actor's root keeps the mascot kit's z-index, 395): what has passed him, his jetpack, the texts.
  front.style.zIndex = '396';
  shell.layer.appendChild(front);
  const gF = /** @type {CanvasRenderingContext2D} */ (front.getContext('2d'));
  // The pool table seen from under it (web.79): drawn here, then laid see-through over the Ace.
  const ghostCv = document.createElement('canvas');
  let seenUnder = false;                                   // tests: the last frame showed him under the table
  const gG = /** @type {CanvasRenderingContext2D} */ (ghostCv.getContext('2d'));
  shell.lanes(true);
  shell.root.classList.add('adash-pad');
  const buzz = (p) => { try { if (typeof window.hapticBuzz === 'function') window.hapticBuzz(p); } catch (e) {} };

  let hDist, hLvl, hLvlLab, hChips, hX, hIns, hMag, hSlots, hName;
  function buildHud(mode) {
    shell.hud.classList.add('on-felt', 'ar-sky');
    shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('arDistance')) + '</div><div class="ar-num ad-d">0000</div></div>'
      + '<div><div class="ar-lab ad-lvl-lab">' + esc(t(mode === 'time' ? 'adTime' : 'arLevel')) + '</div><div class="ar-num ad-lv">1</div></div>'
      + '<div><div class="ar-lab">' + esc(t('blChips')) + '</div><div class="ar-num"><span class="ad-c"><i class="adash-chip"></i>0</span><span class="ad-x" hidden>×1</span></div></div>'
      + '<div class="ar-ins" hidden><div class="ar-lab">&nbsp;</div><div class="ar-num">🛡️</div></div>'
      + '<div class="ad-mag" hidden><div class="ar-lab">&nbsp;</div><div class="ar-num">🧲</div></div></div>'
      + '<div class="ar-hand"><div class="ar-slots"></div><div class="ar-name"></div></div>';
    const q = (s) => /** @type {HTMLElement} */ (shell.hud.querySelector(s));
    hDist = q('.ad-d'); hLvl = q('.ad-lv'); hLvlLab = q('.ad-lvl-lab'); hChips = q('.ad-c'); hX = q('.ad-x'); hIns = q('.ar-ins'); hMag = q('.ad-mag');
    hSlots = q('.ar-slots'); hName = q('.ar-name');
    lastStats = '';
  }

  const img = imageCache();
  const back = backUrl();

  // ── Colours: the theme's (cached), the sky's (the time of day) ────
  let C = null, cLight = null;
  function palette() {
    if (!C || cLight !== shell.theme.light) {
      cLight = shell.theme.light;
      const I = ink(cLight), F = FELT[cLight ? 'light' : 'dark'];
      C = Object.assign({}, I, F, { fA: hexRgb(F.feltA), fB: hexRgb(F.feltB), rA: hexRgb(F.railA), rB: hexRgb(F.railB), rL: hexRgb(F.lip) });
    }
    return C;
  }
  const fogAt = (z) => clamp((z - ZFAR * 0.42) / (ZFAR * 0.58), 0, 1);
  function mix(c, f) {
    const a = C.fog;
    return 'rgb(' + Math.round(c[0] + (a[0] - c[0]) * f) + ',' + Math.round(c[1] + (a[1] - c[1]) * f) + ',' + Math.round(c[2] + (a[2] - c[2]) * f) + ')';
  }

  // ── Camera ────────────────────────────────────────────────────────
  // A narrow (portrait) stage raises the camera so the three lanes stay in view.
  let camH = 2.6, F = 340, camX = 0;
  function camera() {
    camH = clamp(1450 / shell.W, 1.9, 5.6);
    F = (shell.H - GROUND_OFF - HOR) * PZ / camH;
    // In flight the camera rises with him (same lens), just enough to keep his head under the HUD.
    if (G && state !== 'title' && G.jet && G.y > 0) {
      const k = F / PZ, room = shell.H - GROUND_OFF - STAND * k - 74;
      camH += Math.max(0, G.y - Math.max(0, room) / k);
    }
  }
  /** World (x, y up, z away) → [screen x, screen y, px per metre]. */
  function P(x, y, z) { const s = F / z; return [shell.W / 2 + (x - camX) * s, HOR + (camH - y) * s, s]; }

  let state = 'title', G = null, attract = 0, revealTimer = 0, rebuyTimer = 0, lastChipSnd = 0, sel = 0, mode = 'free';
  /** The course's randomness: seeded in the daily challenge. */
  let R = Math.random;
  const pickR = (a) => a[Math.floor(R() * a.length)];

  function newRun() {
    const daily = mode === 'daily';
    R = daily ? rng('ad-' + dayKey()) : Math.random;
    G = { t: 0, travel: 0, dist: 0, bonus: 0, chips: 0, chipPts: 0, streak: 1, grp: 0, grps: {}, level: 1, speed: SPEED0,
      lane: 1, x: 0, y: 0, vy: 0, onGround: true, dbl: false, flipAt: -1, duck: false, duckKey: false, duckUntil: 0, jumpBuf: 0, lean: 0,
      allInUntil: 0, allInWarned: false, magnetUntil: 0, lookAt: 0, ins: false, safeUntil: 0, yayUntil: 0, coolUntil: 0, banner: null,
      obj: [], items: [], fx: [], deck: deckWith(R), hand: [], ev: evalCards([]),
      spawnAt: 6, extra: 0, rows: 0, free: 1, nextCard: 2, nextPower: 14, nextRamp: 6, zig: false, overAt: 0,
      skateUntil: 0, slowUntil: 0, grindT: 0, grinding: false, pool: null, nextPool: 30,
      jet: false, jetT: 0, jetNext: 0, jetLane: 1, jetRun: 0, jetGrp: 0, jetCardAt: -1, jetTrio: 0, nextJet: 18, jetFx: 0, jetR: null,
      venue: 0, prevVenue: 0, venueT: 1, time: TIME_S, rebought: false, mode, day: dayKey() };
    const g = newGroup();
    for (let z = 10; z < 44; z += 2.4) addItem('chip', 1, z, 0.45, { grp: g });
    if (hDist) { renderHand(); renderStats(); }
  }
  function newGroup() { const id = ++G.grp; G.grps[id] = { left: 0, got: 0, broken: false }; return id; }

  function renderHand() {
    const ev = G.ev;
    let h = '';
    for (let i = 0; i < 5; i++) h += ev.best[i] != null ? cardHtml(ev.best[i], 'sm') : '<div class="ar-slot"></div>';
    hSlots.innerHTML = h;
    hName.innerHTML = (ev.nameKey ? esc(t(ev.nameKey)) : '') + ' <b>+' + Math.round(bonusOf(ev) * 100) + '%</b>';
  }
  let lastStats = '';
  function renderStats() {
    const lv = mode === 'time' ? Math.max(0, Math.ceil(G.time)) : G.level;
    const mag = performance.now() < G.magnetUntil;
    const key = lv + '|' + G.chips + '|' + G.ins + '|' + G.streak + '|' + mag;
    if (key === lastStats) return;
    lastStats = key;
    hLvl.textContent = String(lv);
    hLvl.classList.toggle('ad-low', mode === 'time' && lv <= 10);
    hChips.innerHTML = '<i class="adash-chip"></i>' + G.chips;
    hX.hidden = G.streak < 2; hX.textContent = '×' + G.streak;
    hIns.hidden = !G.ins; hMag.hidden = !mag;
  }

  // ── The title: the three ways to play ─────────────────────────────
  function records() {
    const b = loadJ(BEST_KEY), d = loadJ(DAILY_KEY);
    return { free: shell.best.get(), daily: d.d === dayKey() ? d.s || 0 : 0, time: b.time || 0 };
  }
  function titlePanel() {
    const rec = records();
    titleScreen(shell, { id: 'ace-dash', live: true, name: 'Ace Dash', hint: t('adHint'), sel,
      modes: MODES.map((m) => ({ icon: m.icon, label: t(m.key), desc: t(m.desc), rec: rec[m.id] ? t('arRecord', { n: fmt(rec[m.id]) }) : '' })),
      options: hofEnabled ? [{ id: 'hof', label: '🏆 ' + t('hofTitle'), key: '↓' }] : [],
      onOption: (id) => { if (id === 'hof') openHof(); },
      onPick: (i) => { sel = i; start(); } });
  }
  // The Hall of Fame (hof.mjs, claude/CONCEPTION_HALL_OF_FAME.md, web.99): the title's 🏆 (or ↓) only while the admin has it on.
  let hofEnabled = false;
  function refreshHof() {
    hofOn('ace-dash').then((on) => { if (on !== hofEnabled) { hofEnabled = on; if (state === 'title') titlePanel(); } }).catch(() => {});
  }
  function openHof() {
    state = 'board';
    hofPanel(shell, { g: 'ace-dash', name: 'Ace Dash', sel, modes: MODES.map((m) => ({ id: m.id, label: t(m.key) })),
      onBack: () => { state = 'title'; titlePanel(); refreshHof(); } });
  }
  buildHud('free');
  newRun();
  titlePanel();
  refreshHof();
  turnBack(false); ace.pose('wave');
  try { if (navigator.webdriver) window.__pthDash = { run: () => G, state: () => state, mode: () => mode, hof: () => openHof(), jet: () => { jetStart(performance.now()); }, skates: () => { G.skateUntil = performance.now() + SKATE_MS; }, underView: () => seenUnder, pool: () => { G.level = Math.max(G.level, POOL_LEVEL); G.nextPool = 0; G.rows = Math.max(G.rows, 1); G.zig = false; G.obj = []; G.items = []; G.spawnAt = G.travel; }, slow: () => { G.slowUntil = performance.now() + SLOW_MS; }, start: (m) => { sel = Math.max(0, MODES.findIndex((x) => x.id === m)); start(); } }; } catch (e) {}

  function start() {
    clearTimeout(revealTimer); clearTimeout(rebuyTimer);
    mode = MODES[sel].id;
    buildHud(mode);
    newRun(); state = 'run'; camX = 0; shell.panel(null);
    G.hof = hofStart('ace-dash', mode);   // the Hall of Fame's ticket for this run (null offline / off)
    turnBack(true); ace.king(false); ace.mood('mc-m-smile'); ace.pose('run');
    try { if (typeof window.resetBlindRaises === 'function') window.resetBlindRaises(); } catch (e) {}
  }

  // ── Rows of obstacles and pick-ups ────────────────────────────────
  function addObstacle(kind, lane, z, opt) {
    const x = (lane - 1) * LANE, o = opt || {};
    if (kind === 'stack') { const n = o.tall ? 15 : 7; G.obj.push({ kind, x, z, h: n * 0.06, r: 0.42, hw: 0.42, dz: 0.84, n, tall: !!o.tall, col: pickR(CHIP) }); }
    else if (kind === 'wall') G.obj.push({ kind, x, z, h: 1.6, hw: 0.66, dz: 0.3, tilt: (R() - 0.5) * 0.08 });
    else if (kind === 'fly') G.obj.push(o.low ? { kind, x, z, y0: 0.08, y1: 0.5, hw: 0.66, dz: 0.5, spin: R() * 6, low: true }
      : { kind, x, z, y0: 0.74, y1: 1.32, hw: 0.66, dz: 0.5, spin: R() * 6 });
    else if (kind === 'ramp') G.obj.push({ kind, x, z, len: 1.3, h: 0.34, hw: 0.56, gold: !!o.gold });
    else {
      // The dealer button rolls towards the Ace: set off further away so it arrives with its row.
      const vz = 5;
      G.obj.push({ kind, x, z: PZ + (z - PZ) * (G.speed + vz) / G.speed, vz, r: 0.55, hw: 0.55, dz: 0.3, rot: 0, cy: 0.55,
        bounce: !!o.bounce, ph: R() * Math.PI });
    }
  }
  function addItem(kind, lane, z, y, extra) {
    const it = Object.assign({ kind, x: (lane - 1) * LANE, z, y, spin: Math.random() * 6, col: pickR(CHIP) }, extra || {});
    if (it.grp && G.grps[it.grp]) G.grps[it.grp].left++;
    G.items.push(it);
  }
  const gapTime = () => gapFor(G.level);

  function spawnRow() {
    const L = G.level, v = venueAt(L), z = Z_SPAWN, gapM = G.speed * gapTime();
    const zig = G.zig; G.zig = false;
    G.rows++;
    if (mode === 'daily') R = rng('ad-' + G.day + '-' + G.rows);   // each row the same for everyone today
    if (zig) G.free = G.free === 1 ? (R() < 0.5 ? 0 : 2) : 1;          // a zigzag: the free lane moves, now
    else if (R() < 0.55) G.free = clamp(G.free + (R() < 0.5 ? -1 : 1), 0, 2);
    const free = G.free;
    const others = [0, 1, 2].filter((l) => l !== free).sort(() => R() - 0.5);
    const pBlock = v >= 5 ? 0.85 : Math.min(0.7, 0.15 + L * 0.09);
    const nBlock = zig || (L >= 2 && R() < pBlock) ? 2 : 1;
    // The venue's pattern joins the mix: low cards (Las Vegas), the bouncing
    // button (the cruise), tall stacks (Monte-Carlo); zigzags from Macao.
    const kinds = ['stack', 'wall', 'stack'];
    if (L >= 2) kinds.push('fly', 'fly');
    if (L >= 3) kinds.push('button');
    if (v >= 1) kinds.push('low', 'low');
    if (v >= 2) kinds.push('bounce', 'bounce');
    if (v >= 3) kinds.push('tall', 'tall');
    for (const lane of others.slice(0, nBlock)) {
      const kind = pickR(kinds);
      if (kind === 'low') addObstacle('fly', lane, z, { low: true });
      else if (kind === 'bounce') addObstacle('button', lane, z, { bounce: true });
      else if (kind === 'tall') addObstacle('stack', lane, z, { tall: true });
      else addObstacle(kind, lane, z);
      if (kind === 'stack' && R() < 0.45) {        // an arc of chips over the stack: worth the jump
        const g = newGroup();
        addItem('chip', lane, z - 1.7, 0.78, { grp: g }); addItem('chip', lane, z, 1.08, { grp: g }); addItem('chip', lane, z + 1.7, 0.78, { grp: g });
      }
    }
    if (zig || G.jet) return;          // in flight: the rows pass below, nothing to pick up there
    // The pool table in the air: a gold ramp in the free lane, the table just after.
    // (before anything else in the free lane: nothing to jump just before the ramp)
    if (L >= POOL_LEVEL && G.rows >= G.nextPool && !G.pool && gapM - 4.5 > 6) {
      G.nextPool = G.rows + POOL_ROWS + Math.floor(R() * POOL_ROWS_RND);
      if (G.nextJet < G.rows + 8) G.nextJet = G.rows + 8;
      const zr = z + 2.6;
      addObstacle('ramp', free, zr, { gold: true });
      const z0 = zr + G.speed * 0.3, len = poolLen(G.speed), z1 = z0 + len;
      G.pool = { z0, z1, drop: false };
      // Rows of balls, a free lane each, gold chips (×2) in it; the 8-ball at the end.
      let fl = 1, n = 0;
      for (let zb = z0 + 9; zb < z1 - 9; zb += 9) {
        fl = clamp(fl + (R() < 0.5 ? -1 : 1), 0, 2);
        const others = [0, 1, 2].filter((l) => l !== fl).sort(() => R() - 0.5);
        for (const lane of others.slice(0, R() < 0.5 ? 2 : 1)) G.obj.push({ kind: 'ball', x: (lane - 1) * LANE, z: zb, y0: POOL_Y, y1: POOL_Y + BALL_R * 2, hw: BALL_R + 0.1, dz: BALL_R * 2, col: BALL_COL[n++ % BALL_COL.length], num: (n % 7) + 1, spin: 0 });
        const g = newGroup();
        for (let k = -2; k <= 0; k++) addItem('chip', fl, zb - 3 + k * 1.6, POOL_Y + 0.45, { grp: g, gold: true, col: ['#d8b25a', '#fff6cf'] });
      }
      addItem('eight', 1, z1 - 3, POOL_Y + 0.5);
      return;
    }
    if (L >= 4 && R() < (v >= 5 ? 0.45 : 0.3)) addObstacle(R() < 0.5 ? 'stack' : 'fly', free, z);
    if (v >= 4 && R() < 0.4) G.zig = true;                                 // the next row comes sooner, the free lane moves
    const room = gapM - 4.5;
    // The jetpack: rare, from level JET_LEVEL, never while All-In.
    if (L >= JET_LEVEL && G.rows >= G.nextJet && room > 3 && !G.zig && !G.pool && performance.now() >= G.allInUntil) {
      G.nextJet = G.rows + JET_ROWS + Math.floor(R() * JET_ROWS_RND);
      addItem('jet', free, z + 2.5 + room / 2, 0.6);
      return;
    }
    if (G.rows >= G.nextPower && room > 3) {
      G.nextPower = G.rows + 16 + Math.floor(R() * 14);
      addItem(pickR(L >= 2 ? ['allin', 'ins', 'magnet', 'skates', 'slow'] : ['allin', 'ins', 'magnet', 'slow']), free, z + 2.5 + room / 2, 0.6);
      return;
    }
    // A ramp in the free lane: a backflip and a high arc of chips.
    if (L >= 2 && G.rows >= G.nextRamp && !G.zig && room > 6) {
      G.nextRamp = G.rows + 9 + Math.floor(R() * 8);
      const zr = z + 2.6, g = newGroup();
      addObstacle('ramp', free, zr);
      G.extra = Math.max(0, 1.05 - gapTime()) + 0.35;   // room to land before the next row
      for (let k = 1; k <= 5; k++) {
        const tt = k * 0.13, y = RAMP_V * tt - GRAV / 2 * tt * tt + 0.55;
        addItem('chip', free, zr + G.speed * tt, y, { grp: g });
      }
      return;
    }
    const n = Math.min(6, Math.floor(room / 2.2) + 1);
    const cardAt = G.rows >= G.nextCard && G.deck.length ? Math.floor(n / 2) : -1;
    if (cardAt >= 0) G.nextCard = G.rows + 3 + Math.floor(R() * 3);
    const g = newGroup();
    for (let j = 0; j < n; j++) {
      const zz = z + 2.5 + j * 2.2;
      if (j === cardAt) addItem('card', free, zz, 0.78, { c: G.deck.pop() });
      else addItem('chip', free, zz, 0.45, { grp: g });
    }
  }

  // ── Input ─────────────────────────────────────────────────────────
  const doJump = () => { G.vy = JUMP_V; G.onGround = false; G.dbl = false; G.duckUntil = 0; ace.fx('jump'); };
  /** He turns to us with a face for a moment (not too often). */
  // Not in flight: his back (and the jetpack on it) stays to us.
  const look = (m, ms) => { if (state === 'run' && !G.jet && performance.now() > G.lookAt) { if (ace.look(m, ms || 850)) G.lookAt = performance.now() + (ms || 850) + 900; } };
  /** Jump again in the air: higher, with a backflip (once per jump). */
  function backflip(v) {
    G.vy = v || JUMP2_V; G.onGround = false; G.dbl = true; G.flipAt = G.t; G.duckUntil = 0;
    ace.fx('jump'); sound('notifyRaise'); buzz(15);
  }
  /** The backflip's angle now (0 when none), eased in and out. */
  function flipAngle() {
    if (G.flipAt < 0 || shell.reduced) return 0;
    const f = clamp((G.t - G.flipAt) / FLIP_S, 0, 1);
    return 360 * (f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2);
  }
  function input(a, down, info) {
    const now = performance.now();
    if (state === 'board') return;                 // the Hall of Fame's boards: their own buttons
    if (state === 'title') {
      if (!down) return;
      if (a === 'duck' && hofEnabled) { openHof(); return; }   // ↓: the Hall of Fame, when it is on (else the next tile)
      const step = a === 'left' ? -1 : a === 'right' || a === 'duck' ? 1 : 0;
      if (step) { sel = (sel + step + MODES.length) % MODES.length; titlePanel(); return; }
      if (a === 'jump') start();
      return;
    }
    if (state === 'rebuy') {
      if (!down) return;
      if (a === 'jump') rebuy(true); else if (a === 'duck') rebuy(false);
      return;
    }
    if (state === 'over') {
      if (a === 'jump' && down && now > G.overAt + 700 && G.res) start();
      return;
    }
    if (state !== 'run' || !down && a !== 'duck') return;
    // On skates, past an edge lane: the rail (lane -1 or 3), to grind along it.
    const rail = now < G.skateUntil && !G.jet;
    if (a === 'left') G.lane = Math.max(rail ? -1 : 0, G.lane - 1);
    else if (a === 'right') G.lane = Math.min(rail ? 3 : 2, G.lane + 1);
    else if (G.jet) return;            // flying: ← → only
    else if (a === 'jump') {
      if (G.onGround) doJump();
      else if (!G.dbl && (G.vy > 0 || G.y > FLIP_LOW)) backflip();
      else G.jumpBuf = now + JUMP_BUF_MS;
    }
    else if (a === 'duck') {
      if (down && info && info.swipe) G.duckUntil = now + DUCK_SWIPE_MS;   // a swipe: a short roll
      else G.duckKey = down;
      if (down && !G.onGround && G.vy > DIVE_V) G.vy = DIVE_V;          // dive back down
    }
  }

  // ── Update ────────────────────────────────────────────────────────
  function textFx(s, x, y, gold, big) { G.fx.push({ type: 'txt', s, x, y, gold, big, t: 0, life: big ? 1.2 : 0.8 }); }
  function burst(x, y, n, cols) {
    if (shell.reduced) return;
    for (let i = 0; i < n; i++) G.fx.push({ type: 'p', x, y, vx: (Math.random() - 0.5) * 340, vy: -120 - Math.random() * 260, c: cols[i % cols.length], r: 2 + Math.random() * 3, t: 0, life: 0.7 + Math.random() * 0.4 });
  }
  /** Bottom and top of an obstacle (m). */
  function span(o) {
    if (o.kind === 'fly' || o.kind === 'ball') return [o.y0, o.y1];
    if (o.kind === 'button') return [o.cy - o.r, o.cy + o.r];
    return [0, o.h];
  }
  const at = (o) => P(o.x, o.kind === 'fly' || o.kind === 'ball' ? (o.y0 + o.y1) / 2 : o.kind === 'button' ? o.cy : 0.5, Math.max(o.z, 1.2));
  /** The pool table under him (he stands on it, or runs underneath). */
  const poolHere = () => !!(G.pool && !G.pool.drop && G.pool.z0 <= PZ && G.pool.z1 >= PZ && Math.abs(G.x) < POOL_HW);
  /** A ball hit on the table: it flies off, and so does he — down to the felt, no harm done. */
  function knockedOff(o, now) {
    o.dead = true; G.pool.drop = true; G.onGround = false; G.vy = 1.5; G.safeUntil = now + SAFE_MS;
    const p = at(o); burst(p[0], p[1], 10, [o.col, '#f5f0e3']);
    textFx('💥🎱', p[0], p[1] - 24, false, true);
    sound('notifyFold'); buzz(40); ace.fx('wobble');
  }

  function update(dt) {
    if (state === 'title' || state === 'board') { attract += 7 * dt; return; }
    stepFx(dt);
    if (G.venueT < 1) G.venueT = Math.min(1, G.venueT + dt / 1.6);
    if (state !== 'run') return;
    const now = performance.now();
    // The hourglass: the whole game in slow motion for a while.
    if (now < G.slowUntil) dt *= SLOW_K;
    G.t += dt;
    const skate = now < G.skateUntil;
    if (!skate && (G.lane < 0 || G.lane > 2)) G.lane = clamp(G.lane, 0, 2);   // the skates are off: back on the felt
    const target = speedFor(G.level, G.t) * (skate ? SKATE_SPEED : 1);
    G.speed += (target - G.speed) * Math.min(1, dt * 1.5);
    const king = now < G.allInUntil, magnet = now < G.magnetUntil;
    const mv = G.speed * dt;
    G.travel += mv; G.dist += mv * (king ? 2 : 1) * (skate ? SKATE_DIST : 1);
    const lvl = 1 + Math.floor(G.travel / BLIND_EVERY);
    if (lvl > G.level) {
      G.level = lvl;
      const v = venueAt(lvl);
      if (v !== G.venue) { G.prevVenue = G.venue; G.venue = v; G.venueT = 0; G.banner = { s: t(VENUES[v]), sub: String(lvl), t: 0 }; look('mc-m-yay', 1000); }
      else G.banner = { s: t('arBlinds'), sub: String(lvl), t: 0 };
      sound('notifyBlindsUp'); buzz(30); renderStats();
    }
    if (G.banner) { G.banner.t += dt; if (G.banner.t > 1.6) G.banner = null; }
    if (mode === 'time') {
      const before = Math.ceil(G.time);
      G.time -= dt;
      if (Math.ceil(G.time) !== before && G.time > 0 && G.time <= 5) sound('notifyTick');
      if (G.time <= 0) { G.time = 0; renderStats(); timeUp(); return; }
    }

    // Lane, jump, duck
    const tx = G.lane < 0 ? -RAIL_X : G.lane > 2 ? RAIL_X : (G.lane - 1) * LANE, dx = tx - G.x, step = LANE_V * (skate ? 2.6 : 1) * dt;
    G.x += Math.abs(dx) <= step ? dx : Math.sign(dx) * step;
    G.lean += (clamp(dx, -1, 1) - G.lean) * Math.min(1, dt * 14);
    const onTable = poolHere();
    if (G.jet) jetStep(dt, now);
    else if (!G.onGround) {
      const py = G.y;
      G.vy -= GRAV * dt; G.y += G.vy * dt;
      // Under the pool table his head stops at its underside; from above, it is a floor.
      if (onTable && py < POOL_Y - 0.05 && G.y + STAND > POOL_Y - POOL_T) { G.y = POOL_Y - POOL_T - STAND; if (G.vy > 0) G.vy = 0; }
      const floor = onTable && py >= POOL_Y - 0.05 ? POOL_Y : 0;
      if (G.y <= floor) {
        G.y = floor; G.vy = 0; G.onGround = true; G.dbl = false; G.flipAt = -1; ace.fx('land');
        if (floor && !G.pool.on) { G.pool.on = true; const p = P(G.x, POOL_Y + STAND + 0.3, PZ); textFx('🎱', p[0], p[1], true, true); sound('notifyRaise'); buzz(20); }
        if (now < G.jumpBuf) { G.jumpBuf = 0; doJump(); }
      }
      else if (G.flipAt >= 0 && G.t - G.flipAt >= FLIP_S) G.flipAt = -1;
    } else if (G.y > 0 && !onTable) { G.onGround = false; G.vy = 0; }      // off the end (or knocked off) of the table
    G.duck = (G.duckKey || now < G.duckUntil) && G.onGround;
    // Grinding along the rail: points and sparks.
    const onRail = skate && G.onGround && Math.abs(G.x) > HALF - 0.05;
    if (onRail) {
      if (!G.grinding) { G.grinding = true; G.grindT = 0; const p = P(G.x, STAND + 0.3, PZ); textFx('GRIND!', clamp(p[0], 70, shell.W - 70), p[1], true, true); sound('notifyRaise'); buzz(15); }
      G.grindT += dt;
      if (G.grindT >= GRIND_EVERY) { G.grindT -= GRIND_EVERY; G.bonus += GRIND_PTS; }
      if (!shell.reduced) { const p = P(G.x, RAIL_Y, PZ); for (let k = 0; k < 2; k++) G.fx.push({ type: 'p', x: p[0] + (Math.random() - 0.5) * 10, y: p[1], vx: (Math.random() - 0.5) * 160, vy: -60 - Math.random() * 140, c: Math.random() < 0.5 ? '#ffd27a' : '#fff6cf', r: 1.2 + Math.random() * 1.6, t: 0, life: 0.3 }); }
    } else G.grinding = false;
    camX += (G.x * 0.55 - camX) * Math.min(1, dt * 7);

    const top = G.y + (G.duck ? DUCKH : STAND);
    for (const o of G.obj) {
      o.z -= (G.speed + (o.vz || 0)) * dt;
      if (o.kind === 'button') {
        o.rot += (G.speed + o.vz) * dt / o.r;
        if (o.bounce) { o.ph += dt * 5.2; o.cy = o.r + BOUNCE_H * Math.abs(Math.sin(o.ph)); }
      } else if (o.kind === 'fly') o.spin += dt * 2.5;
      if (o.dead || o.done) continue;
      if (o.kind === 'ramp') {
        // On the ramp: launched into a backflip.
        if (G.onGround && o.z <= PZ + 0.1 && o.z + o.len >= PZ && Math.abs(G.x - o.x) < o.hw + 0.2) { o.done = true; backflip(RAMP_V); }
        else if (o.z + o.len < PZ - 0.5) o.done = true;
        continue;
      }
      const reach = o.dz / 2 + 0.22;
      const sp = span(o);
      if (o.z < PZ - reach) {
        o.done = true;
        if (king || now < G.safeUntil) continue;
        // Over it in a backflip: Salto! (else a close call: skimmed it).
        if (o.flipOver) {
          G.bonus += SALTO_BONUS; const p = P(G.x, top + 0.35, PZ); textFx(t('adSalto') + ' +' + SALTO_BONUS, p[0], p[1], true, true);
          sound('notifyCard'); look('mc-m-wink', 900);
        } else if (o.lat ? o.vclose : o.nearLat) {
          G.bonus += CLOSE_BONUS; const p = P(G.x, top + 0.25, PZ); textFx('+' + CLOSE_BONUS, p[0], p[1], true);
          ace.fx('shiver');
        }
        continue;
      }
      if (o.z > PZ + reach) continue;
      if (G.jet) continue;                     // flying (the climb included): nothing touches him
      const adx = Math.abs(G.x - o.x);
      if (adx >= o.hw + 0.26) { if (adx < o.hw + 0.7) o.nearLat = true; continue; }
      o.lat = true;
      const hit = G.y < sp[1] && top > sp[0];
      if (!hit) {
        if (G.y >= sp[1]) {
          if (G.y - sp[1] < 0.15) o.vclose = true;
          if (G.dbl && (o.kind !== 'stack' || o.tall) && !(o.kind === 'fly' && o.low)) o.flipOver = true;
        }
        continue;
      }
      if (o.kind === 'ball') { if (king) smash(o); else knockedOff(o, now); continue; }
      if (king) smash(o);
      else if (now < G.safeUntil) { /* still blinking after the insurance paid */ }
      else if (G.ins) insured(o);
      else if (mode === 'time') timeHit(o);
      else { die(); return; }
    }
    for (const it of G.items) {
      it.z -= G.speed * dt; it.spin += dt * 6;
      if (it.got) continue;
      // The magnet: chips of every lane drift to him as they come near.
      if (magnet && it.kind === 'chip' && it.z > PZ - 0.4 && it.z < PZ + 9) {
        const k = Math.min(1, dt * 7);
        it.x += (G.x - it.x) * k; it.y += (G.y + 0.6 - it.y) * k;
      }
      if (Math.abs(it.z - PZ) < 0.6 && Math.abs(G.x - it.x) < 0.72 && it.y > G.y - 0.25 && it.y < top + 0.25) collect(it, now);
      else if (it.kind === 'chip' && !it.missed && it.z < PZ - 0.7) {
        // A line started and missed: the streak falls back to ×1.
        it.missed = true;
        const gr = G.grps[it.grp];
        if (gr && gr.got > 0 && !gr.broken) { gr.broken = true; if (G.streak > 1) { G.streak = 1; renderStats(); } }
      }
    }
    if (G.pool) { G.pool.z0 -= mv; G.pool.z1 -= mv; if (G.pool.z1 < ZN - 2) G.pool = null; }
    G.obj = G.obj.filter((o) => o.z > ZN - 0.3 - (o.len || 0) && !(o.dead && o.z < PZ));
    G.items = G.items.filter((i) => i.z > ZN - 0.3 && !i.got);
    if (G.travel >= G.spawnAt) {
      // Before he lands the felt is cleared: no row that would reach him in the landing.
      if (G.jet && JET_S - G.jetT < (Z_SPAWN - PZ) / G.speed + JET_DOWN + 0.5) G.spawnAt += G.speed * gapTime();
      else if (G.pool && G.pool.z1 > Z_SPAWN - 14) G.spawnAt += G.speed * gapTime();   // nothing under the table, room after it
      else { G.extra = 0; spawnRow(); G.spawnAt += G.speed * (gapTime() * (G.zig ? 0.55 : 1) + G.extra); }
    }

    ace.pose(!G.onGround ? (G.flipAt >= 0 ? 'flip' : 'air') : G.duck ? 'duck' : 'run');
    ace.mood(now < G.yayUntil ? 'mc-m-yay' : now < G.coolUntil ? 'mc-m-cool' : G.jet ? 'mc-m-fierce' : !G.onGround ? 'mc-m-jump' : king ? 'mc-m-fierce' : 'mc-m-smile');
    const ending = king && G.allInUntil - now < ALLIN_WARN_MS;
    if (ending && !G.allInWarned) { G.allInWarned = true; buzz(25); }
    ace.king(king, ending);
    hDist.textContent = String(Math.floor(G.dist + G.bonus)).padStart(4, '0');
    renderStats();
  }
  // ── The jetpack ───────────────────────────────────────────────────
  /** The sky's randomness: the day's in the daily challenge (the same sky for everyone). */
  const RJ = () => (mode === 'daily' ? rng('ad-' + G.day + '-jet-' + G.rows) : Math.random);
  function jetStart(now) {
    G.jet = true; G.jetT = 0; G.onGround = false; G.vy = 0; G.dbl = false; G.flipAt = -1; G.duckKey = false; G.duckUntil = 0;
    G.allInUntil = Math.min(G.allInUntil, now);          // not two invincibilities at once
    G.jetLane = G.lane; G.jetRun = 0; G.jetGrp = newGroup();
    const rj = G.jetR = RJ();
    // Half way: three face-up cards, one per lane (fewer when the deck runs out).
    const zc = Math.min(Z_SPAWN, PZ + G.speed * 2.6);
    G.jetCardAt = G.t + (zc - PZ) / G.speed; G.jetTrio = ++G.grp;
    for (let l = 0; l < 3 && G.deck.length; l++) addItem('card', l, zc, JET_Y + 0.6, { c: G.deck.pop(), trio: G.jetTrio, sky: true });
    // The trail of chips: from just ahead up to where rows appear, then as he flies.
    for (let z = PZ + G.speed * 0.9; z < Z_SPAWN; z += 2.2) skyChip(z);
    G.jetNext = G.travel + 2.2;
    if (mode === 'time') { G.time += JET_TIME; renderStats(); }
  }
  /** A chip of the trail at z (none where the cards are, none after the landing). */
  function skyChip(z) {
    const arrive = G.t + (z - PZ) / G.speed;
    if (arrive > G.t + (JET_S - G.jetT) - JET_DOWN - 0.2) return;
    if (Math.abs(arrive - G.jetCardAt) < 0.35) return;
    if (++G.jetRun > 5) {                                  // the trail moves to a lane next to it
      G.jetRun = 1; G.jetLane = G.jetLane === 1 ? ((G.jetR || Math.random)() < 0.5 ? 0 : 2) : 1; G.jetGrp = newGroup();
    }
    addItem('chip', G.jetLane, z, JET_Y + 0.6, { grp: G.jetGrp, sky: true });
  }
  function jetStep(dt, now) {
    G.jetT += dt;
    G.y = jetHeight(G.jetT); G.vy = 0;
    if (G.travel >= G.jetNext) { G.jetNext += 2.2; skyChip(Z_SPAWN); }
    // Sparks from the nozzles.
    if (!shell.reduced && G.jetT < JET_S - 0.15 && (G.jetFx += dt) > 0.03) {
      G.jetFx = 0;
      const p = P(G.x, G.y + STAND * 0.18, PZ);
      for (const sx of [-1, 1]) G.fx.push({ type: 'p', x: p[0] + sx * 0.2 * p[2], y: p[1], vx: (Math.random() - 0.5) * 60, vy: 60 + Math.random() * 90, c: Math.random() < 0.5 ? '#ffb347' : '#ffe08a', r: 1.5 + Math.random() * 2.2, t: 0, life: 0.35 });
    }
    if (G.jetT >= JET_S) {
      G.jet = false; G.y = 0; G.vy = 0; G.onGround = true; G.dbl = false;
      G.safeUntil = now + JET_SAFE_MS;
      ace.fx('land'); buzz(25); sound('notifyCard');
    }
  }

  function smash(o) {
    o.dead = true; G.bonus += SMASH_BONUS;
    const p = at(o);
    burst(p[0], p[1], 12, o.col ? o.col : ['#f5f0e3', '#b3261e']);
    textFx('+' + SMASH_BONUS, p[0], p[1] - 24, true);
    sound('notifyCard');
  }
  function insured(o) {
    o.dead = true; G.ins = false; G.safeUntil = performance.now() + SAFE_MS; renderStats();
    const p = at(o);
    burst(p[0], p[1], 10, INS_COL);
    textFx('🛡️', p[0], p[1] - 24, false, true);
    sound('notifyFold'); buzz(50);
    ace.fx('wobble'); G.lookAt = 0; look('mc-m-dizzy', 800);
  }
  /** Time attack: a crash costs TIME_HIT seconds and the streak, not the run. */
  function timeHit(o) {
    o.dead = true; G.time = Math.max(0, G.time - TIME_HIT); G.safeUntil = performance.now() + SAFE_MS; G.streak = 1; renderStats();
    const p = at(o);
    burst(p[0], p[1], 10, ['#e8503f', '#f5f0e3']);
    textFx('−' + TIME_HIT + ' s', p[0], p[1] - 24, false, true);
    sound('notifyFold'); buzz([50, 30, 50]);
    ace.fx('wobble'); G.lookAt = 0; look('mc-m-dizzy', 800);
  }
  function collect(it, now) {
    it.got = true;
    const p = P(it.x, it.y, PZ);
    if (it.kind === 'chip') {
      G.chips++; G.chipPts += CHIP_PTS * G.streak * (it.gold ? 2 : 1); burst(p[0], p[1], 3, ['#d8b25a', '#f5f0e3']);
      if (now - lastChipSnd > 90) { lastChipSnd = now; sound('notifyAction'); }
      const gr = G.grps[it.grp];
      if (gr) {
        gr.got++;
        if (gr.got >= gr.left && !gr.broken && gr.left >= 3) {
          // The whole line: the streak goes up.
          delete G.grps[it.grp];
          if (G.streak < STREAK_MAX) {
            G.streak = streakUp(G.streak);
            textFx(t('adStreak') + ' ×' + G.streak, p[0], p[1] - 34, true);
            sound('notifyRaise'); ace.fx('hop'); look('mc-m-grin', 800);
          }
        }
      }
      return;
    }
    if (it.kind === 'allin') {
      G.allInUntil = now + ALLIN_MS; G.allInWarned = false;
      textFx('ALL-IN!', p[0], p[1] - 40, true, true); burst(p[0], p[1], 14, ['#f5c518', '#d8b25a', '#fff6cf']);
      sound('notifyAllIn'); ace.fx('cheer'); G.lookAt = 0; look('mc-m-fierce', 900);
      return;
    }
    if (it.kind === 'ins') {
      G.ins = true; renderStats();
      textFx('🛡️', p[0], p[1] - 30, false); burst(p[0], p[1], 8, INS_COL);
      sound('notifyCard'); buzz(20); ace.fx('hop');
      return;
    }
    if (it.kind === 'jet') {
      jetStart(now);
      textFx('🚀 JETPACK' + (mode === 'time' ? ' +' + JET_TIME + ' s' : ''), p[0], p[1] - 40, true, true); burst(p[0], p[1], 14, ['#ff8a3d', '#ffd27a', '#b3261e']);
      sound('notifyAllIn'); buzz([20, 20, 40]); ace.fx('cheer'); G.lookAt = 0; look('mc-m-fierce', 900);
      return;
    }
    if (it.kind === 'eight') {
      // The jackpot: chips and a card.
      G.chips += POOL_CHIPS; G.chipPts += POOL_CHIPS * CHIP_PTS * G.streak;
      textFx('JACKPOT 🎱 +' + POOL_CHIPS, p[0], p[1] - 40, true, true);
      for (let k = 0; k < 4; k++) burst(p[0] + (k - 1.5) * 50, p[1] - 30 - (k % 2) * 30, 14, ['#ffd27a', '#f5f0e3', '#141414', '#2364c4']);
      sound('notifyBigWin'); buzz([30, 30, 60]); ace.fx('cheer'); G.lookAt = 0; look('mc-m-yay', 1000);
      if (G.deck.length) {
        const prev = G.ev.cat;
        G.hand.push(G.deck.pop()); G.ev = evalCards(G.hand); renderHand();
        if (G.ev.cat > prev && bonusOf(G.ev) > 0) textFx(t(G.ev.nameKey) + ' +' + Math.round(bonusOf(G.ev) * 100) + '%', p[0], p[1] - 70, true);
      }
      renderStats();
      return;
    }
    if (it.kind === 'skates') {
      G.skateUntil = now + SKATE_MS;
      textFx('🛼 ×' + String(SKATE_DIST).replace('.', ','), p[0], p[1] - 40, true, true); burst(p[0], p[1], 10, SKATE_COL);
      sound('notifyRaise'); buzz(20); ace.fx('hop'); G.lookAt = 0; look('mc-m-grin', 900);
      return;
    }
    if (it.kind === 'slow') {
      G.slowUntil = now + SLOW_MS;
      textFx('⏳', p[0], p[1] - 40, true, true); burst(p[0], p[1], 10, SLOW_COL);
      sound('notifyCard'); buzz(20); ace.fx('hop');
      return;
    }
    if (it.kind === 'magnet') {
      G.magnetUntil = now + MAGNET_MS; renderStats();
      textFx(t('adMagnet'), p[0], p[1] - 40, true, true); burst(p[0], p[1], 10, MAG_COL);
      sound('notifyCard'); buzz(20); ace.fx('hop'); G.lookAt = 0; look('mc-m-love', 900);
      return;
    }
    const prev = G.ev.cat;
    // A card of the sky: the two others go back under the deck.
    if (it.trio) for (const o of G.items) if (o.trio === it.trio && o !== it && !o.got) {
      o.got = true; G.deck.unshift(o.c);
      const q = P(o.x, o.y, Math.max(o.z, 1.2)); burst(q[0], q[1], 6, ['#f5f0e3', '#9aa3ab']);
    }
    G.hand.push(it.c); G.ev = evalCards(G.hand); renderHand();
    // Better than a pair from the sky: fireworks.
    if (it.sky && G.ev.cat > prev && G.ev.cat >= 2) {
      for (let k = 0; k < 4; k++) burst(p[0] + (k - 1.5) * 60, p[1] - 40 - (k % 2) * 30, 16, ['#ff5a5f', '#ffe066', '#4cd964', '#3fa9f5', '#a66cff']);
      sound('notifyBigWin');
    }
    G.yayUntil = now + 260;
    sound('notifyCard');
    burst(p[0], p[1], 8, ['#d8b25a', '#f5f0e3']);
    if (G.ev.cat > prev && bonusOf(G.ev) > 0) {
      textFx(t(G.ev.nameKey) + ' +' + Math.round(bonusOf(G.ev) * 100) + '%', p[0], p[1] - 40, true);
      if (G.ev.cat >= 5) G.coolUntil = now + 1600;   // a flush or better: sunglasses
      ace.fx('cheer'); G.lookAt = 0; look(G.ev.cat >= 5 ? 'mc-m-cool' : 'mc-m-yay', G.ev.cat >= 5 ? 1200 : 900);
    } else ace.fx('hop');
  }
  function stepFx(dt) {
    for (const f of G.fx) {
      f.t += dt;
      if (f.type === 'p') { f.vy += 700 * dt; f.x += f.vx * dt; f.y += f.vy * dt; }
    }
    G.fx = G.fx.filter((f) => f.t < f.life);
  }

  // ── The end: a rebuy, then the showdown ───────────────────────────
  function die() {
    state = 'over'; G.overAt = performance.now();
    ace.king(false); ace.pose('ko'); ace.mood('mc-m-ko'); turnBack(false);
    sound('notifyFold'); buzz([60, 40, 90]);
    if (!G.rebought && G.chips >= REBUY) { offerRebuy(); return; }
    finish();
  }
  /** The rebuy (web.67): the same card as the end screen — the stack, the run
   *  so far, « rebuy » (A) or « no thanks » (B), and a ring that runs out. */
  function offerRebuy() {
    state = 'rebuy';
    const cards = G.ev.best, lvl = G.level, v = venueAt(lvl), d = Math.floor(G.dist + G.bonus);
    endScreen(shell, {
      title: t('adRebuy'), sub: t('arBusted').replace(/\s*!$/, '') + ' · ' + t(MODES[sel].key) + ' · Ace Dash',
      cards, instant: true, hand: cards.length ? t(G.ev.nameKey) : t('arNoCards'),
      score: G.chips, prev: null, unit: t('blChips'),
      count: 5, note: t('adRebuyQ', { n: REBUY }),
      levels: { title: t('arLevel') + ' ' + lvl, right: t(VENUES[v]), html: stepsHtml(esc, VENUES.map((x, i) => ({ label: String(i + 1), cls: i < v ? 'ok' : i === v ? 'ok cur' : '' }))) },
      stats: [[fmt(d), t('arDistance')], [lvl, t('arLevel')], [fmt(G.chips), t('blChips')]],
      btnA: t('adRebuyGo'), btnB: t('adRebuyNo'), foot: t('adRebuyKeys'), keys: true,
      onAgain: () => rebuy(true), onMenu: () => rebuy(false),
    });
  }
  function rebuy(yes) {
    if (state !== 'rebuy') return;
    clearTimeout(rebuyTimer); shell.endTimers = null;
    if (!yes) { state = 'over'; G.overAt = performance.now() - 700; shell.panel(null); finish(); return; }
    G.rebought = true; G.chips -= REBUY; G.chipPts = Math.max(0, G.chipPts - REBUY * CHIP_PTS); G.streak = 1;
    G.obj = G.obj.filter((o) => o.z > PZ + 14);
    G.safeUntil = performance.now() + 1500;
    G.y = 0; G.vy = 0; G.onGround = true; G.dbl = false; G.flipAt = -1;
    state = 'run'; shell.panel(null);
    turnBack(true); ace.pose('run'); ace.mood('mc-m-fierce');
    sound('notifyAllIn'); renderStats();
    ace.fx('cheer'); G.lookAt = 0; setTimeout(() => look('mc-m-fierce', 900), 120);
  }
  function timeUp() {
    state = 'over'; G.overAt = performance.now();
    ace.king(false); ace.pose('wave'); ace.mood('mc-m-yay'); turnBack(false);
    sound('notifyTickFinal');
    finish();
  }
  /** The score, the records, the showdown. */
  function finish() {
    shell.ended();
    const timed = mode === 'time', d = Math.floor(G.dist + G.bonus), chipPts = G.chipPts;
    const score = timed ? timeScore(chipPts, G.ev) : dashScore(G.dist + G.bonus, chipPts, G.ev);
    let prevBest = 0;
    if (mode === 'free') { prevBest = shell.best.get(); if (score > prevBest) shell.best.set(score); }
    else if (mode === 'daily') {
      const dl = loadJ(DAILY_KEY), day = dayKey();
      prevBest = dl.d === day ? dl.s || 0 : 0;
      if (score > prevBest) saveJ(DAILY_KEY, { d: day, s: score });
    } else {
      const b = loadJ(BEST_KEY); prevBest = b.time || 0;
      if (score > prevBest) { b.time = score; saveJ(BEST_KEY, b); }
    }
    try { localStorage.setItem('pth_game_played_ace-dash', '1'); } catch (e) {}
    const cards = G.ev.best, base = timed ? chipPts : d + chipPts, pct = Math.round(bonusOf(G.ev) * 100);
    const lvl = G.level, v = venueAt(lvl);
    G.res = { score, prev: prevBest };
    endScreen(shell, {
      title: t(timed ? 'prTimeUp' : 'arBusted'), sub: t(MODES[sel].key) + (mode === 'daily' ? ' · ' + dayKey() : '') + ' · Ace Dash',
      cards, hand: cards.length ? t(G.ev.nameKey) + (pct ? ' +' + pct + '%' : '') : t('arNoCards'),
      score, prev: prevBest,
      calc: [timed ? null : [t('arDistance'), fmt(d)], [t('blChips'), fmt(chipPts)], cards.length && pct ? [t(G.ev.nameKey), '+' + fmt(score - base)] : null],
      levels: timed ? null : { title: t('arLevel') + ' ' + lvl, right: t(VENUES[v]), html: stepsHtml(esc, VENUES.map((x, i) => ({ label: String(i + 1), cls: i < v ? 'ok' : i === v ? 'ok cur' : '' }))) },
      stats: [[fmt(d), t('arDistance')], [timed ? fmt(G.chips) : lvl, timed ? t('blChips') : t('arLevel')], [G.rebought ? '✓' : '—', t('adRebuy')]],
      onAgain: () => start(),
      onMenu: () => { clearTimeout(revealTimer); state = 'title'; newRun(); buildHud('free'); turnBack(false); ace.king(false); ace.mood('mc-m-smile'); ace.pose('wave'); titlePanel(); refreshHof(); },
    });
    hofEnd(shell, { g: 'ace-dash', m: mode, s: score, lv: G.level, run: G.hof, day: G.day, daily: mode === 'daily' });
  }

  // ── Drawing ───────────────────────────────────────────────────────
  function poly(g, pts, fill) {
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath(); g.fillStyle = fill; g.fill();
  }
  const quad = (g, x0, x1, y, z0, z1, fill) => poly(g, [P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)], fill);

  /** The time of day, the venue shown (and the one fading out). */
  const dayNow = () => (state === 'title' || state === 'board' ? dayAt(0) : dayAt(G.t));
  function drawWorld(g, travel) {
    const W = shell.W, H = shell.H, v = G.venue, p = dayNow();
    // The venue's panorama at the end of the felt, fitted above the horizon.
    const sc = HOR / BG_GY, o = { w: W / sc, gy: BG_GY, scroll: 520 + camX * 60, p, now: performance.now() / 1000, reduced: shell.reduced, C: ink(!!shell.theme.light) };
    g.save(); g.scale(sc, sc);
    if (G.venueT < 1) {
      drawScenery(g, Object.assign({}, o, { venue: G.prevVenue }));
      g.globalAlpha = G.venueT; drawScenery(g, Object.assign({}, o, { venue: v })); g.globalAlpha = 1;
    } else drawScenery(g, Object.assign({}, o, { venue: v }));
    g.restore();
    // The haze far down the felt: the room's (club, final table), else the sky's
    // dimmed towards the floor — never a bright band under the panorama.
    const sky = anyRgb(skyAt(v === 5 ? 0 : p).bottom), fl0 = hexRgb(FLOOR[v][1]);
    C.fog = HAZE[v] ? hexRgb(HAZE[v]) : sky.map((c, i) => Math.round(c + (fl0[i] - c) * 0.5));
    const fogCss = 'rgb(' + C.fog.join(',') + ')';
    const fa = hexRgb(FLOOR[v][0]), fb = fl0;
    const fl = g.createLinearGradient(0, HOR, 0, H);
    fl.addColorStop(0, fogCss); fl.addColorStop(0.4, FLOOR[v][1]);
    g.fillStyle = fl; g.fillRect(0, HOR, W, H - HOR);
    // Bands of felt from far to near; the rails and the floor beside them.
    const off = travel % SEG, base = Math.floor(travel / SEG);
    const n = Math.ceil((ZFAR - ZN) / SEG) + 1;
    for (let i = n; i >= 0; i--) {
      const z0 = Math.max(ZN, ZN + i * SEG - off), z1 = ZN + (i + 1) * SEG - off;
      if (z1 <= ZN) continue;
      const par = (base + i) & 1, f = fogAt(z1);
      quad(g, -40, -HALF - RAIL, 0, z0, z1, mix(par ? fa : fb, f));
      quad(g, HALF + RAIL, 40, 0, z0, z1, mix(par ? fa : fb, f));
      quad(g, -HALF, HALF, 0, z0, z1, mix(par ? C.fA : C.fB, f));
      quad(g, -HALF - RAIL, -HALF, 0.1, z0, z1, mix(par ? C.rA : C.rB, f));
      quad(g, HALF, HALF + RAIL, 0.1, z0, z1, mix(par ? C.rA : C.rB, f));
      quad(g, -HALF - 0.06, -HALF, 0.11, z0, z1, mix(C.rL, f));
      quad(g, HALF, HALF + 0.06, 0.11, z0, z1, mix(C.rL, f));
      if (par && f < 0.95) {
        g.globalAlpha = 1 - f;
        quad(g, -LANE / 2 - 0.035, -LANE / 2 + 0.035, 0, z0, z1, C.dash);
        quad(g, LANE / 2 - 0.035, LANE / 2 + 0.035, 0, z0, z1, C.dash);
        g.globalAlpha = 1;
      }
    }
  }
  function shadow(g, x, z, r, a, y) {
    const p = P(x, y || 0, z), s = p[2];
    g.fillStyle = 'rgba(0,0,0,' + a + ')';
    g.beginPath(); g.ellipse(p[0], p[1], r * s, r * s * clamp(camH / z * 0.55, 0.12, 0.6), 0, 0, Math.PI * 2); g.fill();
  }
  function drawStack(g, o) {
    const p = P(o.x, 0, o.z), s = p[2];
    const rx = o.r * s, ry = rx * clamp(camH / o.z * 0.55, 0.12, 0.6), ch = (o.h / o.n) * s;
    shadow(g, o.x, o.z, o.r * 1.25, 0.32);
    for (let i = 0; i < o.n; i++) {
      const y = p[1] - i * ch, col = o.tall && i >= 7 ? CHIP[(CHIP.indexOf(o.col) + 1) % CHIP.length] || o.col : o.col;
      g.fillStyle = col[0];
      g.beginPath(); g.ellipse(p[0], y, rx, ry, 0, 0, Math.PI); g.lineTo(p[0] - rx, y - ch); g.ellipse(p[0], y - ch, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fill();
      g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(p[0] - rx, y - 1, rx * 2, Math.max(0.6, ch * 0.12));
      g.fillStyle = col[1];
      for (const fx of [-0.62, 0, 0.62]) g.fillRect(p[0] + fx * rx - rx * 0.09, y - ch * 0.8, rx * 0.18, ch * 0.6);
    }
    const ty = p[1] - o.n * ch, topCol = o.tall ? CHIP[(CHIP.indexOf(o.col) + 1) % CHIP.length] || o.col : o.col;
    g.fillStyle = topCol[0]; g.beginPath(); g.ellipse(p[0], ty, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = topCol[1]; g.lineWidth = Math.max(0.6, rx * 0.12); g.setLineDash([rx * 0.32, rx * 0.32]);
    g.beginPath(); g.ellipse(p[0], ty, rx * 0.8, ry * 0.8, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  }
  /** The player's card back, w × h, centred on (cx, cy). */
  function cardBack(g, cx, cy, w, h, rot) {
    g.save(); g.translate(cx, cy); if (rot) g.rotate(rot);
    const r = Math.max(1, Math.min(w, h) * 0.08), im = img(back);
    rr(g, -w / 2, -h / 2, w, h, r);
    if (im) { g.save(); g.clip(); g.drawImage(im, -w / 2, -h / 2, w, h); g.restore(); }
    else {
      g.fillStyle = '#b3261e'; g.fill();
      rr(g, -w / 2 + w * 0.08, -h / 2 + w * 0.08, w * 0.84, h - w * 0.16, r * 0.6); g.strokeStyle = '#f5f0e3'; g.lineWidth = Math.max(0.6, w * 0.03); g.stroke();
    }
    rr(g, -w / 2, -h / 2, w, h, r); g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = Math.max(0.6, w * 0.02); g.stroke();
    g.restore();
  }
  function drawWall(g, o) {
    shadow(g, o.x, o.z, 0.7, 0.3);
    const p = P(o.x, o.h / 2, o.z), s = p[2];
    cardBack(g, p[0], p[1], 1.15 * s, o.h * s, o.tilt);
  }
  function drawFly(g, o) {
    shadow(g, o.x, o.z, 0.45, o.low ? 0.32 : 0.22);
    const p = P(o.x, (o.y0 + o.y1) / 2, o.z), s = p[2];
    cardBack(g, p[0], p[1], (o.y1 - o.y0) * s, 1.0 * s, Math.PI / 2 + Math.sin(o.spin * 2) * 0.12);
    g.strokeStyle = 'rgba(245,240,227,.35)'; g.lineWidth = Math.max(0.5, s * 0.03);
    for (const d of [0.62, 0.78]) {
      g.beginPath(); g.moveTo(p[0] - d * s, p[1] - 0.1 * s); g.lineTo(p[0] - d * s - 0.18 * s, p[1] - 0.1 * s); g.stroke();
      g.beginPath(); g.moveTo(p[0] + d * s, p[1] + 0.1 * s); g.lineTo(p[0] + d * s + 0.18 * s, p[1] + 0.1 * s); g.stroke();
    }
  }
  function drawButton(g, o) {
    const hop = clamp(1 - (o.cy - o.r) / (BOUNCE_H + 0.4), 0.3, 1);
    shadow(g, o.x, o.z, o.r * 0.9 * hop, 0.32 * hop);
    const p = P(o.x, o.cy, o.z), s = p[2], r = o.r * s;
    g.fillStyle = '#b9b2a2'; g.beginPath(); g.arc(p[0] + r * 0.07, p[1], r, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f5f0e3'; g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#141414'; g.lineWidth = Math.max(0.6, r * 0.06); g.stroke();
    g.strokeStyle = 'rgba(20,20,20,.35)'; g.beginPath(); g.arc(p[0], p[1], r * 0.78, 0, Math.PI * 2); g.stroke();
    g.save(); g.translate(p[0], p[1]); g.rotate(-o.rot);
    g.fillStyle = '#141414'; g.font = '700 ' + Math.max(4, r) + 'px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('D', 0, r * 0.06); g.restore();
  }
  /** A ramp: a wooden wedge rising away from the Ace, gold chevrons on it. */
  function drawRamp(g, o) {
    const x0 = o.x - o.hw, x1 = o.x + o.hw, z0 = Math.max(ZN + 0.05, o.z), z1 = o.z + o.len;
    if (z1 <= ZN + 0.05) return;
    const yAt = (z) => o.h * clamp((z - o.z) / o.len, 0, 1);
    shadow(g, o.x, o.z + o.len * 0.6, 0.62, 0.28);
    poly(g, [P(x0, 0, z0), P(x0, yAt(z1), z1), P(x0, 0, z1)], '#5a3b22');
    poly(g, [P(x1, 0, z0), P(x1, yAt(z1), z1), P(x1, 0, z1)], '#5a3b22');
    poly(g, [P(x0, yAt(z0), z0), P(x1, yAt(z0), z0), P(x1, yAt(z1), z1), P(x0, yAt(z1), z1)], o.gold ? '#c99a2e' : '#9a6a3c');
    for (let k = 1; k <= 3; k++) {
      const za = o.z + o.len * (k / 4) - 0.12, zb = za + 0.12;
      if (za < z0) continue;
      poly(g, [P(x0 + 0.08, yAt(za), za), P(o.x, yAt(zb), zb), P(x1 - 0.08, yAt(za), za), P(o.x, yAt(za + 0.06), za + 0.06)], '#f5c518');
    }
  }
  function glow(g, x, y, r, a, col) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(' + col + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function drawItem(g, it, now) {
    const bob = Math.sin(now / 260 + it.z) * 0.05;
    const p = P(it.x, it.y + bob, it.z), s = p[2];
    if (it.kind === 'chip') {
      shadow(g, it.x, it.z, 0.16, 0.18, it.gold ? POOL_Y + 0.01 : 0);
      const r = 0.2 * s, w = Math.max(0.16, Math.abs(Math.cos(it.spin)));
      g.fillStyle = it.col[0]; g.beginPath(); g.ellipse(p[0], p[1], r * w, r, 0, 0, Math.PI * 2); g.fill();
      if (w > 0.35 && r > 2) {
        g.strokeStyle = it.col[1]; g.lineWidth = Math.max(0.5, r * 0.18); g.setLineDash([r * 0.35, r * 0.3]);
        g.beginPath(); g.ellipse(p[0], p[1], r * w * 0.78, r * 0.78, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      }
      return;
    }
    if (it.kind === 'card') {
      shadow(g, it.x, it.z, 0.25, 0.2);
      glow(g, p[0], p[1], 0.75 * s, 0.4, C.lamp);
      // The cards of the sky stay face on (the choice must be readable), with the hand they would make.
      const w = 0.42 * s, h = 0.59 * s, sw = it.sky ? 1 : Math.max(0.2, Math.abs(Math.cos(it.spin * 0.4)));
      g.save(); g.translate(p[0], p[1]); g.scale(sw, 1); drawFace(g, img, it.c, w, h); g.restore();
      if (it.sky) skyLabel(g, it);
      return;
    }
    if (it.kind === 'jet') { drawJetItem(g, it, p, s, now); return; }
    if (it.kind === 'eight') {
      glow(g, p[0], p[1], 1.0 * s, 0.6, '255,210,120');
      ball(g, it.x, it.y + bob, it.z, 0.34, '#141414', 8);
      return;
    }
    const allin = it.kind === 'allin', mag = it.kind === 'magnet', sk = it.kind === 'skates', sl = it.kind === 'slow';
    shadow(g, it.x, it.z, 0.24, 0.22);
    glow(g, p[0], p[1], 0.9 * s, 0.55, allin ? '245,197,24' : mag ? '160,110,240' : sk ? '60,200,200' : sl ? '230,180,90' : '90,150,255');
    const r = 0.3 * s, w = Math.max(0.25, Math.abs(Math.cos(it.spin * 0.6)));
    const col = allin ? ['#f5c518', '#fff6cf', '#8a6a10'] : mag ? [MAG_COL[0], MAG_COL[1], '#2e1760'] : sk ? [SKATE_COL[0], SKATE_COL[1], '#0b4545'] : sl ? [SLOW_COL[0], SLOW_COL[1], '#5e4410'] : [INS_COL[0], INS_COL[1], '#0d2350'];
    g.save(); g.translate(p[0], p[1]); g.scale(w, 1);
    g.fillStyle = col[0]; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = col[2]; g.lineWidth = Math.max(0.6, r * 0.1); g.stroke();
    g.strokeStyle = col[1]; g.setLineDash([r * 0.28, r * 0.24]); g.lineWidth = Math.max(0.8, r * 0.2);
    g.beginPath(); g.arc(0, 0, r * 0.78, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    if (allin) {
      g.fillStyle = '#8a6a10'; g.font = '700 ' + Math.max(3, r * 0.62) + 'px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('ALL', 0, r * 0.04);
    } else if (sk) {
      // A roller skate: the boot, its sole, two wheels.
      const k = r / 14;
      g.fillStyle = SKATE_COL[1];
      g.beginPath(); g.moveTo(-5 * k, -6 * k); g.lineTo(0, -6 * k); g.lineTo(0.5 * k, -1 * k); g.lineTo(6 * k, 0); g.lineTo(6 * k, 2.5 * k); g.lineTo(-5 * k, 2.5 * k); g.closePath(); g.fill();
      g.fillStyle = '#e8503f'; g.beginPath(); g.arc(-3 * k, 5 * k, 2 * k, 0, Math.PI * 2); g.arc(3.5 * k, 5 * k, 2 * k, 0, Math.PI * 2); g.fill();
    } else if (sl) {
      // An hourglass: two glasses, the sand running.
      const k = r / 14;
      g.strokeStyle = SLOW_COL[1]; g.lineWidth = 1.6 * k;
      g.beginPath(); g.moveTo(-4.5 * k, -6.5 * k); g.lineTo(4.5 * k, -6.5 * k); g.moveTo(-4.5 * k, 6.5 * k); g.lineTo(4.5 * k, 6.5 * k); g.stroke();
      g.fillStyle = SLOW_COL[1]; g.beginPath(); g.moveTo(-3.6 * k, -5.5 * k); g.lineTo(3.6 * k, -5.5 * k); g.lineTo(0.6 * k, 0); g.lineTo(3.6 * k, 5.5 * k); g.lineTo(-3.6 * k, 5.5 * k); g.lineTo(-0.6 * k, 0); g.closePath(); g.fill();
      g.fillStyle = '#5e4410'; g.beginPath(); g.moveTo(-2 * k, 5.5 * k); g.lineTo(2 * k, 5.5 * k); g.lineTo(0, 2.5 * k); g.closePath(); g.fill();
    } else if (mag) {
      // A horseshoe magnet, red with white tips.
      const k = r / 14;
      g.lineWidth = 3.4 * k; g.lineCap = 'butt';
      g.strokeStyle = '#e8503f'; g.beginPath(); g.arc(0, -0.5 * k, 4.6 * k, Math.PI, 0); g.lineTo(4.6 * k, 3 * k); g.moveTo(-4.6 * k, -0.5 * k); g.lineTo(-4.6 * k, 3 * k); g.stroke();
      g.strokeStyle = MAG_COL[1]; g.beginPath(); g.moveTo(-4.6 * k, 3 * k); g.lineTo(-4.6 * k, 6 * k); g.moveTo(4.6 * k, 3 * k); g.lineTo(4.6 * k, 6 * k); g.stroke();
    } else {
      const k = r / 14;   // the shield of Ace Runner's chip, at this size
      g.fillStyle = INS_COL[1]; g.beginPath(); g.moveTo(0, -6.5 * k); g.lineTo(5.5 * k, -4 * k); g.lineTo(5 * k, 1.5 * k); g.quadraticCurveTo(3.5 * k, 5 * k, 0, 7 * k);
      g.quadraticCurveTo(-3.5 * k, 5 * k, -5 * k, 1.5 * k); g.lineTo(-5.5 * k, -4 * k); g.closePath(); g.fill();
    }
    g.restore();
  }
  /** Two chip stacks, a strap and their flames: the jetpack, at (x, y) for s px per metre. */
  function jetpack(g, x, y, s, flame, now) {
    const w = 0.15 * s, h = 0.42 * s, gap = 0.2 * s;
    for (const sx of [-1, 1]) {
      const cx = x + sx * gap;
      if (flame > 0) {
        const fl = (0.3 + 0.12 * Math.sin(now / 37 + sx)) * s * flame;
        const fg = g.createLinearGradient(cx, y + h / 2, cx, y + h / 2 + fl);
        fg.addColorStop(0, 'rgba(255,240,180,.95)'); fg.addColorStop(0.45, 'rgba(255,150,50,.85)'); fg.addColorStop(1, 'rgba(255,80,30,0)');
        g.fillStyle = fg; g.beginPath(); g.moveTo(cx - w * 0.45, y + h / 2); g.quadraticCurveTo(cx, y + h / 2 + fl * 1.15, cx + w * 0.45, y + h / 2); g.closePath(); g.fill();
      }
      rr(g, cx - w / 2, y - h / 2, w, h, w * 0.35); g.fillStyle = '#b3261e'; g.fill();
      g.fillStyle = '#f5f0e3';
      for (let k = 1; k < 4; k++) g.fillRect(cx - w / 2, y - h / 2 + h * k / 4 - Math.max(0.6, h * 0.02), w, Math.max(1, h * 0.04));
      rr(g, cx - w / 2, y - h / 2, w, h, w * 0.35); g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = Math.max(0.5, w * 0.08); g.stroke();
      g.fillStyle = '#3a3f47'; g.fillRect(cx - w * 0.32, y + h / 2 - 1, w * 0.64, Math.max(2, h * 0.1));
    }
    g.fillStyle = '#d8b25a'; g.fillRect(x - gap, y - h * 0.12, gap * 2, Math.max(1.5, h * 0.1));
  }
  function drawJetItem(g, it, p, s, now) {
    shadow(g, it.x, it.z, 0.3, 0.22);
    glow(g, p[0], p[1], 0.95 * s, 0.6, '255,140,60');
    jetpack(g, p[0], p[1], s * 1.15, 0.6, now);
  }
  /** Over a card of the sky: the hand it would make, when it is better. */
  function skyLabel(g, it) {
    if (!it.trio || it.z > 22) return;
    const e = evalCards(G.hand.concat([it.c]));
    if (!(e.cat > G.ev.cat) || !bonusOf(e)) return;
    const p = P(it.x, it.y + 0.5, it.z);
    g.font = '800 ' + Math.round(clamp(p[2] * 0.22, 10, 16)) + 'px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    const s = '+' + Math.round(bonusOf(e) * 100) + '%';     // the hand's name on the card would not fit three abreast
    g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.55)'; g.strokeText(s, p[0], p[1]); g.fillStyle = '#ffd27a'; g.fillText(s, p[0], p[1]);
  }
  /** The pool table in the air: its shadow on the felt, its edge, the blue cloth, cushions and pockets. */
  function drawPool(g) {
    const pl = G.pool, z0 = Math.max(ZN + 0.05, pl.z0), z1 = Math.min(ZFAR, pl.z1), W2 = POOL_HW, CU = 0.16, WD = 0.16;
    if (z1 <= z0) return;
    g.globalAlpha = 1;
    quad(g, -W2, W2, 0.005, z0, z1, 'rgba(0,0,0,.22)');
    const n = Math.ceil((z1 - z0) / SEG);
    for (let i = n - 1; i >= 0; i--) {
      const a = z0 + i * SEG, b = Math.min(z1, a + SEG), f = fogAt(b);
      g.globalAlpha = 1 - f * 0.9;
      quad(g, -W2 - CU - WD, -W2 - CU, POOL_Y + 0.1, a, b, '#5a3b22');
      quad(g, W2 + CU, W2 + CU + WD, POOL_Y + 0.1, a, b, '#5a3b22');
      quad(g, -W2 - CU, -W2, POOL_Y + 0.08, a, b, '#17497d');
      quad(g, W2, W2 + CU, POOL_Y + 0.08, a, b, '#17497d');
      quad(g, -W2, W2, POOL_Y, a, b, i & 1 ? '#1f5f9e' : '#1c5791');
    }
    g.globalAlpha = 1;
    // Its near edge, when it is still ahead: the wood under the cloth.
    if (pl.z0 > ZN + 0.05) poly(g, [P(-W2 - CU - WD, POOL_Y + 0.1, pl.z0), P(W2 + CU + WD, POOL_Y + 0.1, pl.z0), P(W2 + CU + WD, POOL_Y - POOL_T, pl.z0), P(-W2 - CU - WD, POOL_Y - POOL_T, pl.z0)], '#4a2f1a');
    // The pockets: the corners and the middle of each side.
    for (const zz of [pl.z0 + 0.2, (pl.z0 + pl.z1) / 2, pl.z1 - 0.2]) {
      if (zz < ZN + 0.3 || zz > ZFAR) continue;
      for (const sx of [-1, 1]) { const p = P(sx * (W2 + 0.02), POOL_Y + 0.09, zz), r = 0.2 * p[2]; g.globalAlpha = 1 - fogAt(zz); g.fillStyle = '#0b0b0b'; g.beginPath(); g.ellipse(p[0], p[1], r, r * clamp(camH / zz * 0.55, 0.12, 0.6), 0, 0, Math.PI * 2); g.fill(); }
    }
    g.globalAlpha = 1;
  }
  /** A pool ball (or the 8-ball) of radius rr at (x, y, z). */
  function ball(g, x, y, z, rr0, col, num) {
    const p = P(x, y, z), r = rr0 * p[2];
    if (r < 0.8) return;
    g.fillStyle = col; g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); g.fill();
    if (r > 3) {
      g.fillStyle = '#fbf7ee'; g.beginPath(); g.arc(p[0], p[1] - r * 0.12, r * 0.42, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#141414'; g.font = '700 ' + Math.max(4, r * 0.55) + 'px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(String(num), p[0], p[1] - r * 0.1);
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(p[0] - r * 0.4, p[1] - r * 0.45, r * 0.2, 0, Math.PI * 2); g.fill();
    }
  }
  function drawThing(g, o, now) {
    g.globalAlpha = 1 - fogAt(o.z);
    if (o.kind === 'stack') drawStack(g, o);
    else if (o.kind === 'wall') drawWall(g, o);
    else if (o.kind === 'fly') drawFly(g, o);
    else if (o.kind === 'button') drawButton(g, o);
    else if (o.kind === 'ramp') drawRamp(g, o);
    else if (o.kind === 'ball') { shadow(g, o.x, o.z, BALL_R * 0.9, 0.3, POOL_Y + 0.01); ball(g, o.x, POOL_Y + BALL_R, o.z, BALL_R, o.col, o.num); }
    else drawItem(g, o, now);
    g.globalAlpha = 1;
  }
  function drawFx(g) {
    for (const f of G.fx) {
      const a = 1 - f.t / f.life;
      g.globalAlpha = a;
      if (f.type === 'p') { g.fillStyle = f.c; g.beginPath(); g.arc(f.x, f.y, f.r, 0, Math.PI * 2); g.fill(); }
      else {
        g.textAlign = 'center'; g.textBaseline = 'alphabetic';
        g.font = f.big ? '700 24px Cinzel, Georgia, serif' : f.gold ? '700 15px Cinzel, Georgia, serif' : '700 14px Inconsolata, monospace';
        g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.45)'; g.strokeText(f.s, f.x, f.y - f.t * 40);
        g.fillStyle = f.gold ? '#f0cf7a' : '#f5f0e3';
        g.fillText(f.s, f.x, f.y - f.t * 40);
      }
      g.globalAlpha = 1;
    }
  }
  function drawBanner(g) {
    const b = G.banner; if (!b) return;
    const a = b.t < 0.2 ? b.t / 0.2 : b.t > 1.2 ? Math.max(0, 1 - (b.t - 1.2) / 0.4) : 1;
    // Over the scenery, just above the horizon (web.77, narmod: « the band hides the felt »: at a third of
    // the height it covered the far end of the felt, where the obstacles come from).
    const w = shell.W, y = Math.max(HOR - 20, 36), hb = 17;
    g.globalAlpha = a;
    g.fillStyle = C.band; g.fillRect(0, y - hb, w, hb * 2);
    g.fillStyle = C.bandLine; g.fillRect(0, y - hb, w, 1); g.fillRect(0, y + hb - 1, w, 1);
    g.textBaseline = 'middle'; g.textAlign = 'left';
    const fLvl = '700 17px Inconsolata, monospace';
    let px = 17;
    g.font = fLvl; const lw = g.measureText(b.sub).width;
    g.font = '700 ' + px + 'px Cinzel, Georgia, serif';
    while (px > 12 && g.measureText(b.s).width > w - lw - 40) { px--; g.font = '700 ' + px + 'px Cinzel, Georgia, serif'; }
    const tw = g.measureText(b.s).width;
    const x0 = (w - tw - 14 - lw) / 2;
    g.fillStyle = C.bandText; g.fillText(b.s, x0, y);
    g.font = fLvl; g.fillStyle = C.bandGold; g.fillText(b.sub, x0 + tw + 14, y);
    g.globalAlpha = 1;
  }
  /** A bar over his head that empties as the time runs out (All-In, Magnet). */
  function timerBar(g, row, left, total, warn, col) {
    const p = P(G.x, G.y + STAND + 0.35, PZ);
    const bw = 64, bh = 7, bx = p[0] - bw / 2, by = Math.max(52, p[1] - 12) - row * 12, f = Math.min(1, left / total);
    const off = warn && !shell.reduced && Math.floor(left / 120) % 2;
    rr(g, bx - 1.5, by - 1.5, bw + 3, bh + 3, 5); g.fillStyle = 'rgba(0,0,0,.55)'; g.fill();
    if (!off) { rr(g, bx, by, Math.max(bh, bw * f), bh, 3.5); g.fillStyle = warn ? '#e8503f' : col; g.fill(); }
    rr(g, bx - 1.5, by - 1.5, bw + 3, bh + 3, 5); g.strokeStyle = warn ? 'rgba(232,80,63,.9)' : col; g.lineWidth = 1; g.stroke();
  }
  /** The front canvas follows the shell's (size, pixel ratio). */
  function sizeFront() {
    const c = shell.canvas;
    if (front.width !== c.width || front.height !== c.height) { front.width = c.width; front.height = c.height; }
    gF.setTransform(shell.dpr * shell.k, 0, 0, shell.dpr * shell.k, 0, 0);
    gF.clearRect(0, 0, shell.W, shell.H);
  }
  function placeAce(x, y, rot, alpha, flip) {
    const p = P(x, y, PZ);
    // The sprite is ~178 px from the feet to the top of the card.
    ace.place(p[0], p[1], (STAND * F / PZ) / 178, shell.k, rot, flip);
    ace.fade(alpha);
  }

  function draw(g) {
    palette(); camera(); sizeFront();
    const now = performance.now();
    if (state === 'title' || state === 'board') { drawWorld(g, attract); placeAce(0, 0, 0, 1); return; }
    drawWorld(g, G.travel);
    // Far to near: behind the Ace on the stage's canvas, past him on the front
    // one (the ramps lie on the felt: always under him).
    let things = G.obj.filter((o) => !o.dead).concat(G.items.filter((i) => !i.got))
      .sort((a, b) => (b.z + (b.len || 0) / 2) - (a.z + (a.len || 0) / 2));
    // The pool table: what is beyond it first, then the table, then the rest.
    // He runs under it (missed, or knocked off — web.79, narmod: « as if we had taken it, but the chips
    // can't be had »): the table and what is on it go over him, see-through — he is plainly below.
    let ghost = null;
    seenUnder = false;
    if (G.pool && G.pool.z0 < ZFAR) {
      const pl = G.pool, z1 = pl.z1, far = things.filter((o) => o.z > z1);
      for (const o of far) drawThing(g, o, now);
      const under = state === 'run' && pl.z0 <= PZ + 0.5 && z1 >= PZ && G.y < POOL_Y - 0.05;
      things = things.filter((o) => o.z <= z1);
      if (under) {
        ghost = things.filter((o) => o.kind === 'ball' || o.kind === 'eight' || o.gold); seenUnder = true;
        things = things.filter((o) => !ghost.includes(o));
      } else drawPool(g);
    }
    let aceDone = false;
    const base = state === 'run' && G.y >= POOL_Y - 0.01 && poolHere() ? POOL_Y : 0;
    const aceShadow = (cv) => { const lift = clamp(1 - (G.y - base) / 1.4, 0.35, 1); shadow(cv, G.x, PZ, 0.42 * lift, 0.38 * lift, base); };
    for (const o of things) {
      if (o.z >= PZ || o.kind === 'ramp') drawThing(g, o, now);
      else { if (!aceDone) { aceShadow(g); aceDone = true; } drawThing(gF, o, now); }
    }
    if (!aceDone) aceShadow(g);
    if (ghost) {
      if (ghostCv.width !== front.width || ghostCv.height !== front.height) { ghostCv.width = front.width; ghostCv.height = front.height; }
      gG.setTransform(shell.dpr * shell.k, 0, 0, shell.dpr * shell.k, 0, 0);
      gG.clearRect(0, 0, shell.W, shell.H);
      drawPool(gG);
      for (const o of ghost) drawThing(gG, o, now);
      gF.save(); gF.setTransform(1, 0, 0, 1, 0, 0); gF.globalAlpha = 0.38; gF.drawImage(ghostCv, 0, 0); gF.restore();
    }
    const run = state === 'run';
    if (run && G.ins && !shell.reduced) {
      const p = P(G.x, G.y + STAND / 2, PZ), r = STAND * p[2] * 0.9;
      const gr = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
      gr.addColorStop(0, 'rgba(90,150,255,0)'); gr.addColorStop(0.75, 'rgba(90,150,255,.16)'); gr.addColorStop(1, 'rgba(90,150,255,0)');
      g.fillStyle = gr; g.fillRect(p[0] - r, p[1] - r, r * 2, r * 2);
    }
    drawFx(gF);
    drawBanner(gF);
    // All-In and Magnet: a bar over his head empties as the time runs out.
    let row = 0;
    const left = run ? G.allInUntil - now : 0;
    if (left > 0) timerBar(gF, row++, left, ALLIN_MS, left < ALLIN_WARN_MS, '#f5c518');
    const mLeft = run ? G.magnetUntil - now : 0;
    if (mLeft > 0) timerBar(gF, row++, mLeft, MAGNET_MS, mLeft < ALLIN_WARN_MS, '#a06ef0');
    const sLeft = run ? G.skateUntil - now : 0;
    if (sLeft > 0) {
      timerBar(gF, row++, sLeft, SKATE_MS, sLeft < ALLIN_WARN_MS, '#3fc1c9');
      // The skates on his feet (seen from behind), their wheels.
      const f = P(G.x, G.y + (Math.abs(G.x) > HALF - 0.05 && G.onGround ? RAIL_Y : 0), PZ), k = f[2];
      for (const sx of [-1, 1]) {
        const cx = f[0] + sx * 0.13 * k, w = 0.12 * k, h = 0.07 * k;
        rr(gF, cx - w / 2, f[1] - h, w, h, h * 0.4); gF.fillStyle = SKATE_COL[0]; gF.fill();
        gF.fillStyle = '#e8503f'; gF.beginPath(); gF.arc(cx, f[1] + h * 0.35, Math.max(1.2, w * 0.28), 0, Math.PI * 2); gF.fill();
      }
    }
    const slLeft = run ? G.slowUntil - now : 0;
    if (slLeft > 0) {
      timerBar(gF, row++, slLeft, SLOW_MS, slLeft < ALLIN_WARN_MS, '#e6b85a');
      // Slow motion: a warm vignette round the stage.
      if (!shell.reduced) {
        const W = shell.W, H = shell.H, a = Math.min(1, slLeft / 400, (SLOW_MS - slLeft) / 300 + 0.2) * 0.32;
        const vg = gF.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
        vg.addColorStop(0, 'rgba(230,180,90,0)'); vg.addColorStop(1, 'rgba(120,80,20,' + a + ')');
        gF.fillStyle = vg; gF.fillRect(0, 0, W, H);
      }
    }
    if (run && G.jet) {
      const jl = (JET_S - G.jetT) * 1000;
      timerBar(gF, row++, jl, JET_S * 1000, jl < ALLIN_WARN_MS, '#ff8a3d');
      // On his back (we see it from behind), flames down.
      const jp = P(G.x, G.y + STAND * 0.5, PZ);
      jetpack(gF, jp[0], jp[1], jp[2], G.jetT < JET_S - JET_DOWN ? 1 : 0.5, now);
    }
    const blink = run && now < G.safeUntil && Math.floor(now / 90) % 2;
    const railUp = run && G.grinding ? RAIL_Y : 0;
    placeAce(G.x, G.y + railUp, run ? clamp(G.lean * 9, -12, 12) : 0, blink ? 0.35 : 1, run ? flipAngle() : 0);
  }

  return {
    update, draw, input,
    running: () => state === 'run',
    theme() { C = null; },
    destroy() {
      clearTimeout(revealTimer); clearTimeout(rebuyTimer);
      try { if (typeof window.resetBlindRaises === 'function') window.resetBlindRaises(); } catch (e) {}
      try { if (window.__pthDash) delete window.__pthDash; } catch (e) {}
      front.remove();
      ace.remove();
      shell.root.classList.remove('adash-pad');
    },
  };
}
