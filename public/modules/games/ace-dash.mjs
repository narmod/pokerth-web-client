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
//   Duck       ↓ held, or a swipe down for a short roll (DUCK_SWIPE_MS)
//   Obstacles  chip stacks (jump or change lane), flying cards (duck), card
//              walls and the rolling dealer button (change lane). Every row
//              leaves one lane free; from level 4 the free lane may hold a
//              stack or a flying card.
//   Pick-ups   chips (CHIP_PTS each), face-up cards of the player's deck (the
//              best five-card hand, games/poker-hand.mjs, multiplies the score,
//              the Joker is wild), the gold All-In chip (crown and sceptre,
//              nothing stops him, the distance counts double) and the blue
//              Insurance chip (it takes one hit for him)
//   Score      (distance + chips) × hand multiplier; Blinds up every
//              BLIND_EVERY metres, a little faster; close calls +CLOSE_BONUS
// Sounds come from modules/sounds.mjs, the texts from Ace Runner's keys (ar*)
// plus adHint and adRules.
// ═══════════════════════════════════════════════════════════════════

import { evalCards, JOKER } from './poker-hand.mjs';
import { CHIP, fmt, backUrl, cardHtml, newDeck, imageCache, drawFace, rr, aceActor, ink, ACE_ID } from './common.mjs';

// World units are metres; the camera looks down the felt (+z, away from it).
const PZ = 4;                 // the Ace's depth in front of the camera
const ZN = 0.8, ZFAR = 62, Z_SPAWN = 60, SEG = 2;   // near plane, fog end, where rows appear, felt band length
const LANE = 1.6, HALF = 2.45, RAIL = 0.55;         // lane width, half the felt, the rail
const GRAV = 19, JUMP_V = 6.3, DIVE_V = -11, LANE_V = 12.5;
const STAND = 1.15, DUCKH = 0.55;                   // the Ace's height, standing and ducking
const BLIND_EVERY = 300;
const SPEED0 = 11, SPEED_LVL = 1.15, SPEED_T = 0.015, SPEED_MAX = 24;
const ALLIN_MS = 4500, ALLIN_WARN_MS = 1500, SAFE_MS = 900, JUMP_BUF_MS = 140, DUCK_SWIPE_MS = 620;
const CLOSE_BONUS = 10, SMASH_BONUS = 25, CHIP_PTS = 10;
const HOR = 96, GROUND_OFF = 46;                    // horizon line; the Ace's feet above the bottom (world px)
const INS_COL = ['#1f4e9e', '#f5f0e3'];

const CSS = `
#${ACE_ID} .mc-card3d{transition:transform .42s cubic-bezier(.3,1.3,.5,1)}
#${ACE_ID}.adash-back .mc-card3d{transform:rotateY(180deg)}
#${ACE_ID}.adash-back .run .mc-lean,#${ACE_ID}.adash-back .air .mc-lean,#${ACE_ID}.adash-back .duck .mc-lean{transform:none}
#pth-game .adash-chip{display:inline-block;width:.8em;height:.8em;border-radius:50%;background:#b3261e;vertical-align:-.05em;margin-right:.25em;
  box-shadow:inset 0 0 0 .14em #f5f0e3,inset 0 0 0 .24em #b3261e}
@media (prefers-reduced-motion:reduce){#${ACE_ID} .mc-card3d{transition:none}}
`;

// The table under the lamps: felt and rail, night or day (the sky and the
// lamps come from ink(), shared with the other games).
const FELT = {
  dark: { feltA: '#1b5e3d', feltB: '#185437', railA: '#3b2416', railB: '#341f12', lip: '#5a3a22', dash: 'rgba(216,178,90,.42)', floor: '#0e1613' },
  light: { feltA: '#3f9a68', feltB: '#3a9061', railA: '#8a6a4a', railB: '#7d5f41', lip: '#a8865f', dash: 'rgba(120,88,14,.55)', floor: '#cdbd9f' },
};
const rgb = (c) => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (a) => a[Math.floor(Math.random() * a.length)];

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
  shell.layer.appendChild(front);
  const gF = /** @type {CanvasRenderingContext2D} */ (front.getContext('2d'));
  shell.lanes(true);
  const buzz = (p) => { try { if (typeof window.hapticBuzz === 'function') window.hapticBuzz(p); } catch (e) {} };

  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('arDistance')) + '</div><div class="ar-num ad-d">0000</div></div>'
    + '<div><div class="ar-lab">' + esc(t('arLevel')) + '</div><div class="ar-num ad-lv">1</div></div>'
    + '<div><div class="ar-lab">' + esc(t('blChips')) + '</div><div class="ar-num ad-c"><i class="adash-chip"></i>0</div></div>'
    + '<div class="ar-ins" hidden><div class="ar-lab">&nbsp;</div><div class="ar-num">🛡️</div></div></div>'
    + '<div class="ar-hand"><div class="ar-slots"></div><div class="ar-name"></div></div>';
  const q = (s) => /** @type {HTMLElement} */ (shell.hud.querySelector(s));
  const hDist = q('.ad-d'), hLvl = q('.ad-lv'), hChips = q('.ad-c'), hIns = q('.ar-ins'), hSlots = q('.ar-slots'), hName = q('.ar-name');

  const img = imageCache();
  const back = backUrl();
  const lights = [];
  for (let i = 0; i < 18; i++) lights.push({ x: Math.random(), y: 0.1 + Math.random() * 0.75, r: 8 + Math.random() * 26, a: 0.07 + Math.random() * 0.15, red: Math.random() < 0.3 });

  // ── Colours of the theme (cached until it changes) ────────────────
  let C = null, cLight = null;
  function palette() {
    if (C && cLight === shell.theme.light) return C;
    cLight = shell.theme.light;
    const I = ink(cLight), F = FELT[cLight ? 'light' : 'dark'];
    C = Object.assign({}, I, F, { fog: rgb(I.skyBot), fA: rgb(F.feltA), fB: rgb(F.feltB), rA: rgb(F.railA), rB: rgb(F.railB), rL: rgb(F.lip) });
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
  }
  /** World (x, y up, z away) → [screen x, screen y, px per metre]. */
  function P(x, y, z) { const s = F / z; return [shell.W / 2 + (x - camX) * s, HOR + (camH - y) * s, s]; }

  let state = 'title', G = null, attract = 0, revealTimer = 0, lastChipSnd = 0;

  function newRun() {
    G = { t: 0, travel: 0, dist: 0, bonus: 0, chips: 0, level: 1, speed: SPEED0,
      lane: 1, x: 0, y: 0, vy: 0, onGround: true, duck: false, duckKey: false, duckUntil: 0, jumpBuf: 0, lean: 0,
      allInUntil: 0, allInWarned: false, ins: false, safeUntil: 0, yayUntil: 0, coolUntil: 0, banner: null,
      obj: [], items: [], fx: [], deck: newDeck(), hand: [], ev: evalCards([]),
      spawnAt: 6, rows: 0, free: 1, nextCard: 2, nextPower: 14, overAt: 0 };
    for (let z = 10; z < 44; z += 2.4) addItem('chip', 1, z, 0.45);
    renderHand(); renderStats();
  }

  function renderHand() {
    const ev = G.ev;
    let h = '';
    for (let i = 0; i < 5; i++) h += ev.best[i] != null ? cardHtml(ev.best[i], 'sm') : '<div class="ar-slot"></div>';
    hSlots.innerHTML = h;
    hName.innerHTML = (ev.nameKey ? esc(t(ev.nameKey)) : '') + ' <b>×' + ev.mult + '</b>';
  }
  let lastStats = '';
  function renderStats() {
    const key = G.level + '|' + G.chips + '|' + G.ins;
    if (key === lastStats) return;
    lastStats = key;
    hLvl.textContent = String(G.level);
    hChips.innerHTML = '<i class="adash-chip"></i>' + G.chips;
    hIns.hidden = !G.ins;
  }
  function titlePanel() {
    const best = shell.best.get();
    shell.panel('<h2>Ace Dash</h2><p>' + esc(t('adHint')) + '</p>'
      + (best ? '<p class="pg-dim">' + esc(t('arRecord', { n: fmt(best) })) + '</p>' : '')
      + '<p class="pg-blink">' + esc(t('arTapStart')) + '</p>');
  }
  newRun();
  titlePanel();
  turnBack(false); ace.pose('wave');
  try { if (navigator.webdriver) window.__pthDash = { run: () => G, state: () => state }; } catch (e) {}

  function start() {
    clearTimeout(revealTimer);
    newRun(); state = 'run'; camX = 0; shell.panel(null);
    turnBack(true); ace.king(false); ace.mood('mc-m-smile'); ace.pose('run');
    try { if (typeof window.resetBlindRaises === 'function') window.resetBlindRaises(); } catch (e) {}
  }

  // ── Rows of obstacles and pick-ups ────────────────────────────────
  function addObstacle(kind, lane, z) {
    const x = (lane - 1) * LANE;
    if (kind === 'stack') G.obj.push({ kind, x, z, h: 0.42, r: 0.42, hw: 0.42, dz: 0.84, n: 7, col: pick(CHIP) });
    else if (kind === 'wall') G.obj.push({ kind, x, z, h: 1.6, hw: 0.66, dz: 0.3, tilt: (Math.random() - 0.5) * 0.08 });
    else if (kind === 'fly') G.obj.push({ kind, x, z, y0: 0.74, y1: 1.32, hw: 0.66, dz: 0.5, spin: Math.random() * 6 });
    else {
      // The dealer button rolls towards the Ace: set off further away so it arrives with its row.
      const vz = 5;
      G.obj.push({ kind, x, z: PZ + (z - PZ) * (G.speed + vz) / G.speed, vz, r: 0.55, hw: 0.55, dz: 0.3, rot: 0 });
    }
  }
  function addItem(kind, lane, z, y, extra) {
    G.items.push(Object.assign({ kind, x: (lane - 1) * LANE, z, y, spin: Math.random() * 6, col: pick(CHIP) }, extra || {}));
  }
  const gapTime = () => Math.max(0.8, 1.45 - (G.level - 1) * 0.09);

  function spawnRow() {
    const L = G.level, z = Z_SPAWN, gapM = G.speed * gapTime();
    G.rows++;
    if (Math.random() < 0.55) G.free = clamp(G.free + (Math.random() < 0.5 ? -1 : 1), 0, 2);
    const free = G.free;
    const others = [0, 1, 2].filter((l) => l !== free).sort(() => Math.random() - 0.5);
    const nBlock = L >= 2 && Math.random() < Math.min(0.7, 0.15 + L * 0.09) ? 2 : 1;
    const kinds = ['stack', 'wall', 'stack'];
    if (L >= 2) kinds.push('fly', 'fly');
    if (L >= 3) kinds.push('button');
    for (const lane of others.slice(0, nBlock)) {
      const kind = pick(kinds);
      addObstacle(kind, lane, z);
      if (kind === 'stack' && Math.random() < 0.45) {        // an arc of chips over the stack: worth the jump
        addItem('chip', lane, z - 1.7, 0.78); addItem('chip', lane, z, 1.08); addItem('chip', lane, z + 1.7, 0.78);
      }
    }
    if (L >= 4 && Math.random() < 0.3) addObstacle(Math.random() < 0.5 ? 'stack' : 'fly', free, z);
    const room = gapM - 4.5;
    if (G.rows >= G.nextPower && room > 3) {
      G.nextPower = G.rows + 16 + Math.floor(Math.random() * 14);
      addItem(Math.random() < 0.5 ? 'allin' : 'ins', free, z + 2.5 + room / 2, 0.6);
      return;
    }
    const n = Math.min(6, Math.floor(room / 2.2) + 1);
    const cardAt = G.rows >= G.nextCard && G.deck.length ? Math.floor(n / 2) : -1;
    if (cardAt >= 0) G.nextCard = G.rows + 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < n; j++) {
      const zz = z + 2.5 + j * 2.2;
      if (j === cardAt) addItem('card', free, zz, 0.78, { c: G.deck.pop() });
      else addItem('chip', free, zz, 0.45);
    }
  }

  // ── Input ─────────────────────────────────────────────────────────
  const doJump = () => { G.vy = JUMP_V; G.onGround = false; G.duckUntil = 0; };
  function input(a, down, info) {
    const now = performance.now();
    if (a === 'jump' && down && state !== 'run') {
      if (state === 'title' || (state === 'over' && now > G.overAt + 700)) start();
      return;
    }
    if (state !== 'run' || !down && a !== 'duck') return;
    if (a === 'left') G.lane = Math.max(0, G.lane - 1);
    else if (a === 'right') G.lane = Math.min(2, G.lane + 1);
    else if (a === 'jump') { if (G.onGround) doJump(); else G.jumpBuf = now + JUMP_BUF_MS; }
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
  const at = (o) => P(o.x, o.kind === 'fly' ? 1 : 0.5, Math.max(o.z, 1.2));

  function update(dt) {
    if (state === 'title') { attract += 7 * dt; return; }
    stepFx(dt);
    if (state !== 'run') return;
    const now = performance.now();
    G.t += dt;
    const target = Math.min(SPEED_MAX, SPEED0 + (G.level - 1) * SPEED_LVL + G.t * SPEED_T);
    G.speed += (target - G.speed) * Math.min(1, dt * 1.5);
    const king = now < G.allInUntil;
    const mv = G.speed * dt;
    G.travel += mv; G.dist += mv * (king ? 2 : 1);
    const lvl = 1 + Math.floor(G.travel / BLIND_EVERY);
    if (lvl > G.level) {
      G.level = lvl; G.banner = { s: t('arBlinds'), sub: String(lvl), t: 0 };
      sound('notifyBlindsUp'); buzz(30); renderStats();
    }
    if (G.banner) { G.banner.t += dt; if (G.banner.t > 1.6) G.banner = null; }

    // Lane, jump, duck
    const tx = (G.lane - 1) * LANE, dx = tx - G.x, step = LANE_V * dt;
    G.x += Math.abs(dx) <= step ? dx : Math.sign(dx) * step;
    G.lean += (clamp(dx, -1, 1) - G.lean) * Math.min(1, dt * 14);
    if (!G.onGround) {
      G.vy -= GRAV * dt; G.y += G.vy * dt;
      if (G.y <= 0) { G.y = 0; G.vy = 0; G.onGround = true; if (now < G.jumpBuf) { G.jumpBuf = 0; doJump(); } }
    }
    G.duck = (G.duckKey || now < G.duckUntil) && G.onGround;
    camX += (G.x * 0.55 - camX) * Math.min(1, dt * 7);

    const top = G.y + (G.duck ? DUCKH : STAND);
    for (const o of G.obj) {
      o.z -= (G.speed + (o.vz || 0)) * dt;
      if (o.kind === 'button') o.rot += (G.speed + o.vz) * dt / o.r;
      else if (o.kind === 'fly') o.spin += dt * 2.5;
      if (o.dead || o.done) continue;
      const reach = o.dz / 2 + 0.22;
      if (o.z < PZ - reach) {
        o.done = true;
        // Close call: skimmed it (over a stack, or one lane away while level with it).
        if (!king && now >= G.safeUntil && (o.lat ? o.vclose : o.nearLat)) {
          G.bonus += CLOSE_BONUS; const p = P(G.x, top + 0.25, PZ); textFx('+' + CLOSE_BONUS, p[0], p[1], true);
        }
        continue;
      }
      if (o.z > PZ + reach) continue;
      const adx = Math.abs(G.x - o.x);
      if (adx >= o.hw + 0.26) { if (adx < o.hw + 0.7) o.nearLat = true; continue; }
      o.lat = true;
      let hit;
      if (o.kind === 'stack') { hit = G.y < o.h; if (!hit && G.y - o.h < 0.15) o.vclose = true; }
      else if (o.kind === 'fly') hit = top > o.y0;
      else hit = true;
      if (!hit) continue;
      if (king) smash(o);
      else if (now < G.safeUntil) { /* still blinking after the insurance paid */ }
      else if (G.ins) insured(o);
      else { die(); return; }
    }
    for (const it of G.items) {
      it.z -= G.speed * dt; it.spin += dt * 6;
      if (!it.got && Math.abs(it.z - PZ) < 0.6 && Math.abs(G.x - it.x) < 0.72 && it.y > G.y - 0.25 && it.y < top + 0.25) collect(it, now);
    }
    G.obj = G.obj.filter((o) => o.z > ZN - 0.3 && !(o.dead && o.z < PZ));
    G.items = G.items.filter((i) => i.z > ZN - 0.3 && !i.got);
    if (G.travel >= G.spawnAt) { spawnRow(); G.spawnAt += G.speed * gapTime(); }

    ace.pose(!G.onGround ? 'air' : G.duck ? 'duck' : 'run');
    ace.mood(now < G.yayUntil ? 'mc-m-yay' : now < G.coolUntil ? 'mc-m-cool' : !G.onGround ? 'mc-m-jump' : king ? 'mc-m-fierce' : 'mc-m-smile');
    const ending = king && G.allInUntil - now < ALLIN_WARN_MS;
    if (ending && !G.allInWarned) { G.allInWarned = true; buzz(25); }
    ace.king(king, ending);
    hDist.textContent = String(Math.floor(G.dist + G.bonus)).padStart(4, '0');
    renderStats();
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
  }
  function collect(it, now) {
    it.got = true;
    const p = P(it.x, it.y, PZ);
    if (it.kind === 'chip') {
      G.chips++; burst(p[0], p[1], 3, ['#d8b25a', '#f5f0e3']);
      if (now - lastChipSnd > 90) { lastChipSnd = now; sound('notifyAction'); }
      return;
    }
    if (it.kind === 'allin') {
      G.allInUntil = now + ALLIN_MS; G.allInWarned = false;
      textFx('ALL-IN!', p[0], p[1] - 40, true, true); burst(p[0], p[1], 14, ['#f5c518', '#d8b25a', '#fff6cf']);
      sound('notifyAllIn');
      return;
    }
    if (it.kind === 'ins') {
      G.ins = true; renderStats();
      textFx('🛡️', p[0], p[1] - 30, false); burst(p[0], p[1], 8, INS_COL);
      sound('notifyCard'); buzz(20);
      return;
    }
    const prev = G.ev.cat;
    G.hand.push(it.c); G.ev = evalCards(G.hand); renderHand();
    G.yayUntil = now + 260;
    sound('notifyCard');
    burst(p[0], p[1], 8, ['#d8b25a', '#f5f0e3']);
    if (G.ev.cat > prev && G.ev.mult > 1) {
      textFx(t(G.ev.nameKey) + ' ×' + G.ev.mult, p[0], p[1] - 40, true);
      if (G.ev.cat >= 5) G.coolUntil = now + 1600;   // a flush or better: sunglasses
    }
  }
  function stepFx(dt) {
    for (const f of G.fx) {
      f.t += dt;
      if (f.type === 'p') { f.vy += 700 * dt; f.x += f.vx * dt; f.y += f.vy * dt; }
    }
    G.fx = G.fx.filter((f) => f.t < f.life);
  }

  function die() {
    state = 'over'; G.overAt = performance.now();
    ace.king(false); ace.pose('ko'); ace.mood('mc-m-ko'); turnBack(false);
    sound('notifyFold'); buzz([60, 40, 90]);
    const d = Math.floor(G.dist + G.bonus), chipPts = G.chips * CHIP_PTS, mult = G.ev.mult;
    const score = (d + chipPts) * mult, prevBest = shell.best.get();
    const record = score > prevBest;
    if (record) shell.best.set(score);
    const cards = G.ev.best;
    const tail = '<div class="ar-final">(' + fmt(d) + ' + <i class="adash-chip"></i>' + fmt(chipPts) + ') × ' + mult + ' = <em>' + fmt(score) + '</em></div>'
      + '<p class="pg-dim">' + esc(record && prevBest ? t('arNewRecord') : t('arRecord', { n: fmt(Math.max(score, prevBest)) })) + '</p>'
      + '<p class="pg-blink">' + esc(t('arAgain')) + '</p>';
    // Showdown: the cards come face down, then turn one by one.
    let shown = 0;
    const paint = () => {
      let row = '';
      for (let i = 0; i < cards.length; i++) row += i < shown ? cardHtml(cards[i], 'lg') : '<div class="pk lg back"></div>';
      const hand = !cards.length ? esc(t('arNoCards')) : shown >= cards.length ? esc(t(G.ev.nameKey)) : '&nbsp;';
      shell.panel('<h2>' + esc(t('arBusted')) + '</h2>' + (cards.length ? '<div class="ar-show">' + row + '</div>' : '')
        + '<p>' + hand + '</p>' + (shown >= cards.length ? tail : ''));
    };
    const next = () => {
      if (state !== 'over') return;
      paint();
      if (shown < cards.length) { revealTimer = setTimeout(() => { shown++; sound('notifyCard'); next(); }, shown ? 260 : 600); }
      else if (record && prevBest) sound('notifyBigWin');
    };
    revealTimer = setTimeout(next, 450);
  }

  // ── Drawing ───────────────────────────────────────────────────────
  function poly(g, pts, fill) {
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath(); g.fillStyle = fill; g.fill();
  }
  const quad = (g, x0, x1, y, z0, z1, fill) => poly(g, [P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)], fill);

  function drawWorld(g, travel) {
    const W = shell.W, H = shell.H;
    const sky = g.createLinearGradient(0, 0, 0, HOR + 4);
    sky.addColorStop(0, C.skyTop); sky.addColorStop(1, C.skyBot);
    g.fillStyle = sky; g.fillRect(0, 0, W, HOR + 2);
    if (!shell.reduced) {
      for (const l of lights) {
        const x = l.x * W, y = l.y * HOR;
        const gr = g.createRadialGradient(x, y, 0, x, y, l.r);
        gr.addColorStop(0, 'rgba(' + (l.red ? '179,38,30' : C.lamp) + ',' + l.a + ')'); gr.addColorStop(1, 'rgba(' + C.lamp + ',0)');
        g.fillStyle = gr; g.fillRect(x - l.r, y - l.r, l.r * 2, l.r * 2);
      }
    }
    const fl = g.createLinearGradient(0, HOR, 0, H);
    fl.addColorStop(0, C.skyBot); fl.addColorStop(0.35, C.floor);
    g.fillStyle = fl; g.fillRect(0, HOR, W, H - HOR);
    // Bands of felt from far to near; the rails beside them.
    const off = travel % SEG, base = Math.floor(travel / SEG);
    const n = Math.ceil((ZFAR - ZN) / SEG) + 1;
    for (let i = n; i >= 0; i--) {
      const z0 = Math.max(ZN, ZN + i * SEG - off), z1 = ZN + (i + 1) * SEG - off;
      if (z1 <= ZN) continue;
      const par = (base + i) & 1, f = fogAt(z1);
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
  function shadow(g, x, z, r, a) {
    const p = P(x, 0, z), s = p[2];
    g.fillStyle = 'rgba(0,0,0,' + a + ')';
    g.beginPath(); g.ellipse(p[0], p[1], r * s, r * s * clamp(camH / z * 0.55, 0.12, 0.6), 0, 0, Math.PI * 2); g.fill();
  }
  function drawStack(g, o) {
    const p = P(o.x, 0, o.z), s = p[2];
    const rx = o.r * s, ry = rx * clamp(camH / o.z * 0.55, 0.12, 0.6), ch = (o.h / o.n) * s;
    shadow(g, o.x, o.z, o.r * 1.25, 0.32);
    for (let i = 0; i < o.n; i++) {
      const y = p[1] - i * ch;
      g.fillStyle = o.col[0];
      g.beginPath(); g.ellipse(p[0], y, rx, ry, 0, 0, Math.PI); g.lineTo(p[0] - rx, y - ch); g.ellipse(p[0], y - ch, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fill();
      g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(p[0] - rx, y - 1, rx * 2, Math.max(0.6, ch * 0.12));
      g.fillStyle = o.col[1];
      for (const fx of [-0.62, 0, 0.62]) g.fillRect(p[0] + fx * rx - rx * 0.09, y - ch * 0.8, rx * 0.18, ch * 0.6);
    }
    const ty = p[1] - o.n * ch;
    g.fillStyle = o.col[0]; g.beginPath(); g.ellipse(p[0], ty, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = o.col[1]; g.lineWidth = Math.max(0.6, rx * 0.12); g.setLineDash([rx * 0.32, rx * 0.32]);
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
    shadow(g, o.x, o.z, 0.45, 0.22);
    const p = P(o.x, (o.y0 + o.y1) / 2, o.z), s = p[2];
    cardBack(g, p[0], p[1], (o.y1 - o.y0) * s, 1.0 * s, Math.PI / 2 + Math.sin(o.spin * 2) * 0.12);
    g.strokeStyle = 'rgba(245,240,227,.35)'; g.lineWidth = Math.max(0.5, s * 0.03);
    for (const d of [0.62, 0.78]) {
      g.beginPath(); g.moveTo(p[0] - d * s, p[1] - 0.1 * s); g.lineTo(p[0] - d * s - 0.18 * s, p[1] - 0.1 * s); g.stroke();
      g.beginPath(); g.moveTo(p[0] + d * s, p[1] + 0.1 * s); g.lineTo(p[0] + d * s + 0.18 * s, p[1] + 0.1 * s); g.stroke();
    }
  }
  function drawButton(g, o) {
    shadow(g, o.x, o.z, o.r * 0.9, 0.32);
    const p = P(o.x, o.r, o.z), s = p[2], r = o.r * s;
    g.fillStyle = '#b9b2a2'; g.beginPath(); g.arc(p[0] + r * 0.07, p[1], r, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f5f0e3'; g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#141414'; g.lineWidth = Math.max(0.6, r * 0.06); g.stroke();
    g.strokeStyle = 'rgba(20,20,20,.35)'; g.beginPath(); g.arc(p[0], p[1], r * 0.78, 0, Math.PI * 2); g.stroke();
    g.save(); g.translate(p[0], p[1]); g.rotate(-o.rot);
    g.fillStyle = '#141414'; g.font = '700 ' + Math.max(4, r) + 'px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('D', 0, r * 0.06); g.restore();
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
      shadow(g, it.x, it.z, 0.16, 0.18);
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
      const w = 0.42 * s, h = 0.59 * s, sw = Math.max(0.2, Math.abs(Math.cos(it.spin * 0.4)));
      g.save(); g.translate(p[0], p[1]); g.scale(sw, 1); drawFace(g, img, it.c, w, h); g.restore();
      return;
    }
    const allin = it.kind === 'allin';
    shadow(g, it.x, it.z, 0.24, 0.22);
    glow(g, p[0], p[1], 0.9 * s, 0.55, allin ? '245,197,24' : '90,150,255');
    const r = 0.3 * s, w = Math.max(0.25, Math.abs(Math.cos(it.spin * 0.6)));
    g.save(); g.translate(p[0], p[1]); g.scale(w, 1);
    g.fillStyle = allin ? '#f5c518' : INS_COL[0]; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = allin ? '#8a6a10' : '#0d2350'; g.lineWidth = Math.max(0.6, r * 0.1); g.stroke();
    g.strokeStyle = allin ? '#fff6cf' : INS_COL[1]; g.setLineDash([r * 0.28, r * 0.24]); g.lineWidth = Math.max(0.8, r * 0.2);
    g.beginPath(); g.arc(0, 0, r * 0.78, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    if (allin) {
      g.fillStyle = '#8a6a10'; g.font = '700 ' + Math.max(3, r * 0.62) + 'px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('ALL', 0, r * 0.04);
    } else {
      const k = r / 14;   // the shield of Ace Runner's chip, at this size
      g.fillStyle = INS_COL[1]; g.beginPath(); g.moveTo(0, -6.5 * k); g.lineTo(5.5 * k, -4 * k); g.lineTo(5 * k, 1.5 * k); g.quadraticCurveTo(3.5 * k, 5 * k, 0, 7 * k);
      g.quadraticCurveTo(-3.5 * k, 5 * k, -5 * k, 1.5 * k); g.lineTo(-5.5 * k, -4 * k); g.closePath(); g.fill();
    }
    g.restore();
  }
  function drawThing(g, o, now) {
    g.globalAlpha = 1 - fogAt(o.z);
    if (o.kind === 'stack') drawStack(g, o);
    else if (o.kind === 'wall') drawWall(g, o);
    else if (o.kind === 'fly') drawFly(g, o);
    else if (o.kind === 'button') drawButton(g, o);
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
        g.fillStyle = f.gold ? C.gold : C.text;
        g.fillText(f.s, f.x, f.y - f.t * 40);
      }
      g.globalAlpha = 1;
    }
  }
  function drawBanner(g) {
    const b = G.banner; if (!b) return;
    const a = b.t < 0.2 ? b.t / 0.2 : b.t > 1.2 ? Math.max(0, 1 - (b.t - 1.2) / 0.4) : 1;
    const w = shell.W, y = shell.H * 0.34;
    g.globalAlpha = a;
    g.fillStyle = C.band; g.fillRect(0, y - 26, w, 52);
    g.fillStyle = C.bandLine; g.fillRect(0, y - 26, w, 1); g.fillRect(0, y + 25, w, 1);
    g.textBaseline = 'middle'; g.textAlign = 'left';
    const fTitle = '700 22px Cinzel, Georgia, serif', fLvl = '700 22px Inconsolata, monospace';
    g.font = fTitle; const tw = g.measureText(b.s).width;
    g.font = fLvl; const lw = g.measureText(b.sub).width;
    const x0 = (w - tw - 14 - lw) / 2;
    g.font = fTitle; g.fillStyle = C.bandText; g.fillText(b.s, x0, y);
    g.font = fLvl; g.fillStyle = C.bandGold; g.fillText(b.sub, x0 + tw + 14, y);
    g.globalAlpha = 1;
  }
  /** The front canvas follows the shell's (size, pixel ratio). */
  function sizeFront() {
    const c = shell.canvas;
    if (front.width !== c.width || front.height !== c.height) { front.width = c.width; front.height = c.height; }
    gF.setTransform(shell.dpr * shell.k, 0, 0, shell.dpr * shell.k, 0, 0);
    gF.clearRect(0, 0, shell.W, shell.H);
  }
  function placeAce(x, y, rot, alpha) {
    const p = P(x, y, PZ);
    // The sprite is ~178 px from the feet to the top of the card.
    ace.place(p[0], p[1], (STAND * F / PZ) / 178, shell.k, rot);
    ace.fade(alpha);
  }

  function draw(g) {
    palette(); camera(); sizeFront();
    const now = performance.now();
    if (state === 'title') { drawWorld(g, attract); placeAce(0, 0, 0, 1); return; }
    drawWorld(g, G.travel);
    // Far to near: behind the Ace on the stage's canvas, past him on the front one.
    const things = G.obj.filter((o) => !o.dead).concat(G.items.filter((i) => !i.got)).sort((a, b) => b.z - a.z);
    let aceDone = false;
    const aceShadow = (cv) => { const lift = clamp(1 - G.y / 1.4, 0.35, 1); shadow(cv, G.x, PZ, 0.42 * lift, 0.38 * lift); };
    for (const o of things) {
      if (o.z >= PZ) drawThing(g, o, now);
      else { if (!aceDone) { aceShadow(g); aceDone = true; } drawThing(gF, o, now); }
    }
    if (!aceDone) aceShadow(g);
    if (state === 'run' && G.ins && !shell.reduced) {
      const p = P(G.x, G.y + STAND / 2, PZ), r = STAND * p[2] * 0.9;
      const gr = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
      gr.addColorStop(0, 'rgba(90,150,255,0)'); gr.addColorStop(0.75, 'rgba(90,150,255,.16)'); gr.addColorStop(1, 'rgba(90,150,255,0)');
      g.fillStyle = gr; g.fillRect(p[0] - r, p[1] - r, r * 2, r * 2);
    }
    drawFx(gF);
    drawBanner(gF);
    // All-In: a gold bar over his head empties as the time runs out.
    const left = state === 'run' ? G.allInUntil - now : 0;
    if (left > 0) {
      const p = P(G.x, G.y + STAND + 0.35, PZ);
      const bw = 64, bh = 7, bx = p[0] - bw / 2, by = Math.max(52, p[1] - 12), f = Math.min(1, left / ALLIN_MS);
      const warn = left < ALLIN_WARN_MS, off = warn && !shell.reduced && Math.floor(left / 120) % 2;
      rr(gF, bx - 1.5, by - 1.5, bw + 3, bh + 3, 5); gF.fillStyle = 'rgba(0,0,0,.55)'; gF.fill();
      if (!off) { rr(gF, bx, by, Math.max(bh, bw * f), bh, 3.5); gF.fillStyle = warn ? '#e8503f' : '#f5c518'; gF.fill(); }
      rr(gF, bx - 1.5, by - 1.5, bw + 3, bh + 3, 5); gF.strokeStyle = warn ? 'rgba(232,80,63,.9)' : 'rgba(245,197,24,.8)'; gF.lineWidth = 1; gF.stroke();
    }
    const blink = state === 'run' && now < G.safeUntil && Math.floor(now / 90) % 2;
    placeAce(G.x, G.y, state === 'run' ? clamp(G.lean * 9, -12, 12) : 0, blink ? 0.35 : 1);
  }

  return {
    update, draw, input,
    running: () => state === 'run',
    theme() { C = null; },
    destroy() {
      clearTimeout(revealTimer);
      try { if (typeof window.resetBlindRaises === 'function') window.resetBlindRaises(); } catch (e) {}
      try { if (window.__pthDash) delete window.__pthDash; } catch (e) {}
      front.remove();
      ace.remove();
    },
  };
}
