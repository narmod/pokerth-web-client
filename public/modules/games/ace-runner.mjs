// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Ace Runner — hidden mini-game (web extension, narmod 2026-10-16).
// Secret word in training: « mascot » or its translation (games/index.mjs).
//
// The Ace (the SVG mascot of modules/mascot/engine.mjs, via actorKit) runs
// along the felt. Chip stacks and the rolling dealer button: jump. Flying
// cards (the player's card back): duck, or jump when they skim the felt, or
// stay down when they fly high (more heights as the blinds go up). Face-up
// cards (the player's deck) are picked up; the best five-card hand among them
// (games/poker-hand.mjs, the Joker is wild) multiplies the distance at the end.
//   Blinds up   every BLIND_EVERY metres: a level, a little faster (eased in,
//               no jolt), with the blinds sound
//   All-In      the gold chip: crown and sceptre, nothing stops him for a few
//               seconds, he smashes what he runs into, the distance counts double
//   Insurance   the blue shield chip: it takes one hit for him (🛡️ in the HUD)
//   Close call  skimming an obstacle without touching it: +CLOSE_BONUS metres
//   Showdown    at the end the five cards of the hand are turned one by one
// Fairness: a jump pressed just before landing is kept (JUMP_BUFFER_MS), and
// obstacles are spaced by the time they reach the Ace (GAP), whatever the speed
// or their own motion, so a jump always has room to land.
// Sounds come from modules/sounds.mjs (mute and categories respected).
// ═══════════════════════════════════════════════════════════════════

import { evalCards, JOKER, rankOf, suitOf } from './poker-hand.mjs';
import { SUITS, RANKS, CHIP, rlab, isRed, fmt, faceUrl, backUrl, cardHtml, newDeck, imageCache, rr, aceActor, ink } from './common.mjs';

const GROUND_OFF = 74;        // ground line, from the bottom of the world
const ACE_X = 120;            // the Ace's feet, from the left
const S = 0.5;                // sprite scale (world px per sprite px)
const BLIND_EVERY = 300;      // metres per blind level
const ALLIN_MS = 4500;
const ALLIN_WARN_MS = 1500;   // the end is announced: the bar flashes, the Ace blinks, a short buzz
// Speed (world px/s): gentle, eased growth (was +55 per level, +2/s, cap 900:
// top speed in under a minute, a jolt at each level). Start 280 (was 330).
// Obstacles: sparse at first, EASY_START extra seconds between them at level 1,
// EASY_STEP less at each level until none.
const EASY_START = 1.0, EASY_STEP = 0.25;
// Flying cards: at mid height (duck) at first; low ones (jump over) from level
// FLY_LOW_LVL, high ones (stay on the ground) from FLY_HIGH_LVL, drifting up and
// down from FLY_DRIFT_LVL. Heights are above the felt line; each keeps a
// little random offset (FLY_JITTER), all within reach of the hit boxes.
const FLY_MID = 74, FLY_LOW = 22, FLY_HIGH = 110, FLY_JITTER = 4, FLY_DRIFT = 8;
const FLY_LOW_LVL = 3, FLY_HIGH_LVL = 5, FLY_DRIFT_LVL = 7;
const SPEED0 = 280, SPEED_LVL = 20, SPEED_T = 0.7, SPEED_MAX = 800, SPEED_EASE = 1.5;
const JUMP_BUFFER_MS = 140;   // a jump pressed this long before landing still counts
// Minimum time (s) between two obstacles reaching the Ace, by kind (previous → next).
const GAP = { jump: { jump: 0.5, duck: 0.74 }, duck: { jump: 0.46, duck: 0.36 } };
const CLOSE_PX = 12, CLOSE_BONUS = 10;   // a close call: within CLOSE_PX, +CLOSE_BONUS m
const INS_COL = ['#1f4e9e', '#f5f0e3'];
const SAFE_MS = 900;          // after the insurance pays: a short blink, no new hit

export function create(shell) {
  const { t, esc, sound } = shell;
  const ace = aceActor(shell.layer);
  shell.grant('runner');   // found it: its secret trophy (granted on the way out)

  shell.hud.innerHTML = '<div class="ar-stats"><div><div class="ar-lab">' + esc(t('arDistance')) + '</div><div class="ar-num ar-d">0000</div></div>'
    + '<div><div class="ar-lab">' + esc(t('arLevel')) + '</div><div class="ar-num ar-lv">1</div></div>'
    + '<div class="ar-ins" hidden><div class="ar-lab">&nbsp;</div><div class="ar-num">🛡️</div></div></div>'
    + '<div class="ar-hand"><div class="ar-slots"></div><div class="ar-name"></div></div>';
  const hDist = /** @type {HTMLElement} */ (shell.hud.querySelector('.ar-d'));
  const hLvl = /** @type {HTMLElement} */ (shell.hud.querySelector('.ar-lv'));
  const hIns = /** @type {HTMLElement} */ (shell.hud.querySelector('.ar-ins'));
  const buzz = (p) => { try { if (typeof window.hapticBuzz === 'function') window.hapticBuzz(p); } catch (e) {} };
  const hSlots = /** @type {HTMLElement} */ (shell.hud.querySelector('.ar-slots'));
  const hName = /** @type {HTMLElement} */ (shell.hud.querySelector('.ar-name'));

  // Images of the deck for the canvas (glyph cards when the deck has none).
  const img = imageCache();
  const back = backUrl();

  const lights = [];
  for (let i = 0; i < 22; i++) lights.push({ x: Math.random() * 1400, y: 20 + Math.random() * 150, r: 6 + Math.random() * 22, a: 0.08 + Math.random() * 0.16, h: Math.random() < 0.7 ? '216,178,90' : '179,38,30' });

  let state = 'title', G = null, revealTimer = 0;

  function newRun() {
    const deck = newDeck();
    G = { t: 0, dist: 0, level: 1, speed: SPEED0, y: 0, vy: 0, onGround: true, duck: false, holdJump: false,
      obs: [], items: [], fx: [], deck, hand: [], ev: evalCards([]), nextObs: 1.8, nextItem: 0.7,
      nextAllIn: 22 + Math.random() * 14, allInUntil: 0, allInWarned: false, scroll: 0, yayUntil: 0, coolUntil: 0, banner: null, overAt: 0,
      jumpBufUntil: 0, lastArr: -9, lastKind: 'duck', ins: false, nextIns: 35 + Math.random() * 20, safeUntil: 0 };
    renderHand(); renderStats();
  }

  const setPose = ace.pose, setMood = ace.mood, setKing = ace.king;

  function renderHand() {
    const ev = G.ev;
    let h = '';
    for (let i = 0; i < 5; i++) h += ev.best[i] != null ? cardHtml(ev.best[i], 'sm') : '<div class="ar-slot"></div>';
    hSlots.innerHTML = h;
    hName.innerHTML = (ev.nameKey ? esc(t(ev.nameKey)) : '') + ' <b>×' + ev.mult + '</b>';
  }

  function renderStats() {
    hLvl.textContent = String(G.level);
    hIns.hidden = !G.ins;
  }

  function titlePanel() {
    const best = shell.best.get();
    shell.panel('<h2>Ace Runner</h2><p>' + esc(t('arHint')) + '</p>'
      + (best ? '<p class="pg-dim">' + esc(t('arRecord', { n: fmt(best) })) + '</p>' : '')
      + '<p class="pg-blink">' + esc(t('arTapStart')) + '</p>');
  }
  newRun();
  titlePanel();

  function start() {
    clearTimeout(revealTimer);
    newRun(); state = 'run'; shell.panel(null);
    setKing(false); setMood('mc-m-smile'); setPose('run');
    try { if (typeof window.resetBlindRaises === 'function') window.resetBlindRaises(); } catch (e) {}
  }

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down) {
    if (a === 'jump' && down) {
      if (state === 'title' || (state === 'over' && performance.now() > G.overAt + 700)) { start(); return; }
      if (state !== 'run') return;
      G.holdJump = true;
      if (G.onGround) { G.vy = -880; G.onGround = false; G.duck = false; }
      else G.jumpBufUntil = performance.now() + JUMP_BUFFER_MS;   // kept for the landing
    } else if (a === 'jump') {
      if (!G) return;
      G.holdJump = false;
      if (!G.onGround && G.vy < -360) G.vy = -360;     // short tap, short hop
    } else if (a === 'duck') {
      if (state !== 'run') return;
      G.duck = down;
      if (down && !G.onGround && G.vy < 900) G.vy = 900;  // dive back down
    }
  }

  // ── World ─────────────────────────────────────────────────────────
  const groundY = () => shell.H - GROUND_OFF;
  const W = () => shell.W;
  // Push the new obstacle(s) far enough right that they reach the Ace at least
  // GAP seconds after the previous ones (their own speed vx included).
  function place(group, kind, vx) {
    const v = G.speed + vx, x0 = group[0].x;
    const arr = G.t + (x0 - ACE_X) / v, need = G.lastArr + GAP[G.lastKind][kind];
    const shift = arr < need ? (need - arr) * v : 0;
    for (const o of group) { o.x += shift; G.obs.push(o); }
    const tail = group[group.length - 1];
    G.lastArr = G.t + (tail.x - ACE_X) / v; G.lastKind = kind;
    return x0 + shift;
  }
  function spawnObstacle() {
    const gy = groundY(), roll = Math.random();
    let x = W() + 40;
    if (G.dist > 250 && roll < 0.27) {
      const lv = G.level, r = Math.random();
      const band = lv >= FLY_HIGH_LVL ? (r < 0.3 ? 'low' : r < 0.55 ? 'high' : 'mid') : lv >= FLY_LOW_LVL ? (r < 0.35 ? 'low' : 'mid') : 'mid';
      const y0 = gy - (band === 'low' ? FLY_LOW : band === 'high' ? FLY_HIGH : FLY_MID) + (Math.random() * 2 - 1) * FLY_JITTER;
      const amp = band !== 'low' && lv >= FLY_DRIFT_LVL ? FLY_DRIFT : 0;
      x = place([{ type: 'fly', x, y: y0, y0, amp, w: 38, h: 24, phase: Math.random() * 6, vx: 110 }], band === 'low' ? 'jump' : 'duck', 110);
    } else if (G.dist > 450 && roll < 0.42) {
      x = place([{ type: 'dealer', x: x + 20, r: 13, vx: 150, rot: 0 }], 'jump', 150) - 20;
    } else {
      const n = 3 + Math.floor(Math.random() * (G.level >= 3 ? 7 : 5));
      const group = [{ type: 'stack', x, w: 30, n, h: n * 6 + 4, col: Math.floor(Math.random() * 4) }];
      if (G.level >= 3 && Math.random() < 0.28) {
        const n2 = 3 + Math.floor(Math.random() * 4);
        group.push({ type: 'stack', x: x + 38, w: 30, n: n2, h: n2 * 6 + 4, col: Math.floor(Math.random() * 4) });
      }
      x = place(group, 'jump', 0);
    }
    // A card right above the obstacle: risk for a reward.
    if (Math.random() < 0.3 && G.deck.length) G.items.push({ kind: 'card', x: x + 14, y: gy - 130 - Math.random() * 20, c: G.deck.pop(), t: Math.random() * 6 });
  }
  function spawnItem() {
    if (!G.deck.length) return;
    const gy = groundY();
    G.items.push({ kind: 'card', x: W() + 30, y: Math.random() < 0.5 ? gy - 34 : gy - 100 - Math.random() * 40, c: G.deck.pop(), t: Math.random() * 6 });
  }
  function aceBox() {
    const top = G.duck && G.onGround ? 46 : 84, feet = groundY() - G.y;
    return { l: ACE_X - 18, r: ACE_X + 18, t: feet - top, b: feet - 4 };
  }
  const hit = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
  function obsBox(o, gy) {
    if (o.type === 'fly') return { l: o.x - o.w / 2 + 4, r: o.x + o.w / 2 - 4, t: o.y - o.h / 2 + 3, b: o.y + o.h / 2 - 3 };
    if (o.type === 'dealer') return { l: o.x - o.r + 3, r: o.x + o.r - 3, t: gy - o.r * 2 + 3, b: gy };
    return { l: o.x - o.w / 2 + 3, r: o.x + o.w / 2 - 3, t: gy - o.h + 3, b: gy };
  }

  function update(dt) {
    if (state !== 'run') { if (state === 'title') G.scroll += 40 * dt; return; }
    const now = performance.now();
    const king = now < G.allInUntil;
    G.t += dt;
    const target = Math.min(SPEED_MAX, SPEED0 + (G.level - 1) * SPEED_LVL + G.t * SPEED_T);
    G.speed += (target - G.speed) * Math.min(1, dt * SPEED_EASE);
    const dx = G.speed * dt;
    G.scroll += dx; G.dist += (dx / 10) * (king ? 2 : 1);
    const lvl = 1 + Math.floor(G.dist / BLIND_EVERY);
    if (lvl > G.level) {
      G.level = lvl;
      G.banner = { s: t('arBlinds'), sub: String(lvl), t: 0 };
      sound('notifyBlindsUp'); buzz(30); renderStats();
    }
    if (G.banner) { G.banner.t += dt; if (G.banner.t > 1.6) G.banner = null; }
    if (!G.onGround) {
      G.vy += (G.holdJump && G.vy < 0 ? 2100 : 2900) * dt;
      G.y -= G.vy * dt;
      if (G.y <= 0) {
        G.y = 0; G.vy = 0; G.onGround = true;
        if (now < G.jumpBufUntil) {   // pressed just before landing: jump again
          G.jumpBufUntil = 0; G.onGround = false; G.duck = false;
          G.vy = G.holdJump ? -880 : -360;
        }
      }
    }
    G.nextObs -= dt;
    if (G.nextObs <= 0) {
      spawnObstacle();
      G.nextObs = 0.75 + Math.random() * 1.1 + Math.max(0, EASY_START - (G.level - 1) * EASY_STEP) - Math.min(0.3, (G.level - 1) * 0.06);
    }
    G.nextItem -= dt;
    if (G.nextItem <= 0) { spawnItem(); G.nextItem = 1.6 + Math.random() * 1.6; }
    G.nextAllIn -= dt;
    if (G.nextAllIn <= 0) {
      G.items.push({ kind: 'allin', x: W() + 30, y: groundY() - 110 - Math.random() * 30, t: 0 });
      G.nextAllIn = 28 + Math.random() * 20;
    }
    if (!G.ins) G.nextIns -= dt;
    if (G.nextIns <= 0) {
      G.items.push({ kind: 'ins', x: W() + 30, y: groundY() - 40 - Math.random() * 70, t: 0 });
      G.nextIns = 40 + Math.random() * 25;
    }
    const ab = aceBox(), gy = groundY();
    for (let i = G.obs.length - 1; i >= 0; i--) {
      const o = G.obs[i];
      o.x -= dx + (o.vx || 0) * dt;
      if (o.type === 'dealer') o.rot -= ((G.speed + o.vx) * dt) / o.r;
      else if (o.amp) o.y = o.y0 + Math.sin(G.t * 1.7 + o.phase) * o.amp;
      if (o.x < -60) { G.obs.splice(i, 1); continue; }
      const ob = obsBox(o, gy);
      if (hit(ab, ob)) {
        if (king) { G.obs.splice(i, 1); smash(o); continue; }
        if (now < G.safeUntil) { o.passed = true; continue; }
        if (G.ins) { G.obs.splice(i, 1); insured(o); continue; }
        die(); return;
      }
      // Close call: how near the Ace came while level with it, paid once passed.
      if (!o.passed) {
        if (ab.r > ob.l && ab.l < ob.r) {
          const gap = Math.max(ob.t - ab.b, ab.t - ob.b);
          o.near = Math.min(o.near == null ? 1e9 : o.near, gap);
        } else if (ob.r < ab.l) {
          o.passed = true;
          if (o.near != null && o.near < CLOSE_PX && !king && now >= G.safeUntil) closeCall(o, ob);
        }
      }
    }
    for (let j = G.items.length - 1; j >= 0; j--) {
      const it = G.items[j];
      it.x -= dx; it.t += dt;
      if (it.x < -40) { G.items.splice(j, 1); continue; }
      const bob = Math.sin(it.t * 3) * 4;
      if (hit(ab, { l: it.x - 13, r: it.x + 13, t: it.y - 18 + bob, b: it.y + 18 + bob })) { G.items.splice(j, 1); collect(it); }
    }
    for (let f = G.fx.length - 1; f >= 0; f--) { const p = G.fx[f]; p.t += dt; if (p.t > p.life) G.fx.splice(f, 1); }
    setPose(!G.onGround ? 'air' : G.duck ? 'duck' : 'run');
    setMood(now < G.yayUntil ? 'mc-m-yay' : now < G.coolUntil ? 'mc-m-cool' : !G.onGround ? 'mc-m-jump' : king ? 'mc-m-fierce' : 'mc-m-smile');
    const ending = king && G.allInUntil - now < ALLIN_WARN_MS;
    if (ending && !G.allInWarned) { G.allInWarned = true; buzz(25); }
    setKing(king, ending);
    hDist.textContent = String(Math.floor(G.dist)).padStart(4, '0');
  }

  function burst(x, y, n, colors) {
    if (shell.reduced) return;
    for (let i = 0; i < n; i++) G.fx.push({ type: 'chip', x, y, vx: (Math.random() - 0.3) * 260, vy: -120 - Math.random() * 260, c: colors[i % colors.length], t: 0, life: 0.8 });
  }
  function smash(o) {
    const gy = groundY();
    burst(o.x, o.type === 'fly' ? o.y : gy - 20, o.type === 'stack' ? Math.min(10, o.n + 2) : 6,
      o.type === 'stack' ? CHIP[o.col] : ['#f5f0e3', '#b3261e']);
    G.dist += 25;
    G.fx.push({ type: 'txt', x: o.x, y: gy - 60, s: '+25', gold: true, t: 0, life: 0.7 });
    sound('notifyCard');
  }
  function insured(o) {
    G.ins = false; G.safeUntil = performance.now() + SAFE_MS; renderStats();
    const gy = groundY();
    burst(o.x, o.type === 'fly' ? o.y : gy - 20, 8, [INS_COL[0], INS_COL[1]]);
    G.fx.push({ type: 'txt', x: ACE_X + 30, y: gy - G.y - 110, s: '🛡️', big: true, t: 0, life: 0.9 });
    sound('notifyFold'); buzz(50);
  }
  function closeCall(o, ob) {
    G.dist += CLOSE_BONUS;
    G.fx.push({ type: 'txt', x: ACE_X + 24, y: Math.min(ob.t, groundY() - G.y - 90) - 6, s: '+' + CLOSE_BONUS, gold: true, t: 0, life: 0.7 });
    void o;
  }
  function collect(it) {
    if (it.kind === 'allin') {
      G.allInUntil = performance.now() + ALLIN_MS; G.allInWarned = false;
      G.fx.push({ type: 'txt', x: ACE_X + 30, y: groundY() - G.y - 120, s: 'ALL-IN!', gold: true, big: true, t: 0, life: 1.3 });
      burst(it.x, it.y, 8, ['#f5c518', '#d8b25a']);
      sound('notifyAllIn');
      return;
    }
    if (it.kind === 'ins') {
      G.ins = true; renderStats();
      burst(it.x, it.y, 6, [INS_COL[0], INS_COL[1]]);
      G.fx.push({ type: 'txt', x: it.x, y: it.y - 24, s: '🛡️', t: 0, life: 0.9 });
      sound('notifyCard'); buzz(20);
      return;
    }
    const prev = G.ev.cat;
    G.hand.push(it.c); G.ev = evalCards(G.hand); renderHand();
    G.yayUntil = performance.now() + 260;
    sound('notifyCard');
    G.fx.push({ type: 'txt', x: it.x, y: it.y - 20, s: '+' + rlab(it.c), red: isRed(it.c), t: 0, life: 0.8 });
    if (G.ev.cat > prev && G.ev.mult > 1) {
      G.fx.push({ type: 'txt', x: ACE_X + 30, y: groundY() - G.y - 120, s: t(G.ev.nameKey) + ' ×' + G.ev.mult, gold: true, t: 0, life: 1.2 });
      if (G.ev.cat >= 5) G.coolUntil = performance.now() + 1600;   // a flush or better: sunglasses
    }
    if (!shell.reduced) for (let i = 0; i < 8; i++) G.fx.push({ type: 'spark', x: it.x, y: it.y, a: (i / 8) * Math.PI * 2, t: 0, life: 0.4 });
  }

  function die() {
    state = 'over'; G.overAt = performance.now();
    setKing(false); setPose('ko'); setMood('mc-m-ko');
    sound('notifyFold'); buzz([60, 40, 90]);
    const d = Math.floor(G.dist), score = d * G.ev.mult, prevBest = shell.best.get();
    const record = score > prevBest;
    if (record) shell.best.set(score);
    const cards = G.ev.best;
    const tail = '<div class="ar-final">' + fmt(d) + ' × ' + G.ev.mult + ' = <em>' + fmt(score) + '</em></div>'
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
  function drawBg(g) {
    const gy = groundY(), w = W(), H = shell.H;
    const C = ink(shell.theme.light);
    const sky = g.createLinearGradient(0, 0, 0, gy); sky.addColorStop(0, C.skyTop); sky.addColorStop(1, C.skyBot);
    g.fillStyle = sky; g.fillRect(0, 0, w, gy);
    if (!shell.reduced) {
      const off = G.scroll * 0.08;
      for (const l of lights) {
        const x = (((l.x - off) % 1400) + 1400) % 1400 - 100;
        if (x > w + 60) continue;
        const gr = g.createRadialGradient(x, l.y, 0, x, l.y, l.r);
        gr.addColorStop(0, 'rgba(' + l.h + ',' + l.a + ')'); gr.addColorStop(1, 'rgba(' + l.h + ',0)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, l.y, l.r, 0, Math.PI * 2); g.fill();
      }
    }
    // Distant tables under their lamps.
    const span = 330, off2 = G.scroll * 0.3;
    for (let x = -(off2 % span); x < w + span; x += span) {
      const cx = x + 120, ty = gy - 46;
      const lamp = g.createRadialGradient(cx, ty - 40, 0, cx, ty - 10, 120);
      lamp.addColorStop(0, 'rgba(' + C.lamp + ',.16)'); lamp.addColorStop(1, 'rgba(' + C.lamp + ',0)');
      g.fillStyle = lamp; g.fillRect(cx - 130, ty - 120, 260, 170);
      g.fillStyle = C.rim; g.beginPath(); g.ellipse(cx, ty + 4, 96, 20, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = C.farFelt; g.beginPath(); g.ellipse(cx, ty, 86, 15, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(216,178,90,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, ty - 130); g.lineTo(cx, ty - 62); g.stroke();
      g.fillStyle = C.shade; g.beginPath(); g.moveTo(cx - 18, ty - 50); g.lineTo(cx + 18, ty - 50); g.lineTo(cx + 9, ty - 63); g.lineTo(cx - 9, ty - 63); g.closePath(); g.fill();
    }
    const felt = g.createLinearGradient(0, gy, 0, H - 26); felt.addColorStop(0, '#24774e'); felt.addColorStop(1, '#174f34');
    g.fillStyle = felt; g.fillRect(0, gy, w, H - 26 - gy);
    g.strokeStyle = 'rgba(216,178,90,.55)'; g.setLineDash([7, 6]); g.lineWidth = 1.2;
    g.lineDashOffset = G.scroll % 13; g.beginPath(); g.moveTo(0, gy + 11); g.lineTo(w, gy + 11); g.stroke(); g.setLineDash([]);
    g.fillStyle = 'rgba(0,0,0,.12)';
    for (let sx = -(G.scroll % 46); sx < w; sx += 46) { g.fillRect(sx, gy + 24, 2, 2); g.fillRect(sx + 23, gy + 36, 2, 2); }
    const rail = g.createLinearGradient(0, H - 26, 0, H);
    rail.addColorStop(0, '#6b4426'); rail.addColorStop(0.5, '#4a2d18'); rail.addColorStop(1, '#2a180c');
    g.fillStyle = rail; g.fillRect(0, H - 26, w, 26);
    g.fillStyle = 'rgba(255,220,170,.14)'; g.fillRect(0, H - 26, w, 2);
  }
  function drawStack(g, o) {
    const gy = groundY(), c = CHIP[o.col];
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(o.x, gy + 2, o.w / 2 + 3, 5, 0, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < o.n; i++) {
      const cc = CHIP[(o.col + (i % 3 === 2 ? 1 : 0)) % 4], y = gy - 4 - i * 6;
      g.fillStyle = cc[0]; g.fillRect(o.x - o.w / 2, y - 3, o.w, 6);
      g.fillStyle = cc[1]; for (let s = -1; s <= 1; s++) g.fillRect(o.x + s * 9 - 2, y - 3, 4, 6);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(o.x - o.w / 2, y + 2, o.w, 1);
    }
    const ty = gy - 4 - (o.n - 1) * 6 - 3;
    g.fillStyle = c[0]; g.beginPath(); g.ellipse(o.x, ty, o.w / 2, 4, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = c[1]; g.lineWidth = 1.2; g.setLineDash([3, 3]); g.beginPath(); g.ellipse(o.x, ty, o.w / 2 - 4, 2.4, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  }
  function drawDealer(g, o) {
    const gy = groundY(), cy = gy - o.r;
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(o.x, gy + 2, o.r + 2, 4, 0, 0, Math.PI * 2); g.fill();
    g.save(); g.translate(o.x, cy); g.rotate(o.rot);
    g.fillStyle = '#f5f0e3'; g.beginPath(); g.arc(0, 0, o.r, 0, Math.PI * 2); g.fill();
    g.lineWidth = 1.5; g.strokeStyle = '#141414'; g.stroke();
    g.strokeStyle = 'rgba(20,20,20,.35)'; g.beginPath(); g.arc(0, 0, o.r - 3.5, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#141414'; g.font = '700 13px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('D', 0, 1);
    g.restore();
  }
  function drawFly(g, o, now) {
    const sx = Math.cos(now * 9 + o.phase), y = o.y + Math.sin(now * 5 + o.phase) * 3;
    g.save(); g.translate(o.x, y); g.rotate(-0.12); g.scale(Math.max(0.15, Math.abs(sx)), 1);
    const im = img(back);
    if (im) {
      // The player's card back, turned on its side.
      g.save(); rr(g, -o.w / 2, -o.h / 2, o.w, o.h, 3); g.clip();
      g.translate(0, 0); g.rotate(Math.PI / 2); g.drawImage(im, -o.h / 2, -o.w / 2, o.h, o.w); g.restore();
      rr(g, -o.w / 2, -o.h / 2, o.w, o.h, 3); g.lineWidth = 1.2; g.strokeStyle = '#141414'; g.stroke();
    } else {
      rr(g, -o.w / 2, -o.h / 2, o.w, o.h, 3); g.fillStyle = '#b3261e'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#141414'; g.stroke();
      rr(g, -o.w / 2 + 3, -o.h / 2 + 3, o.w - 6, o.h - 6, 2); g.strokeStyle = '#f5f0e3'; g.lineWidth = 1; g.stroke();
    }
    g.restore();
    g.strokeStyle = 'rgba(245,240,227,.25)'; g.lineWidth = 1;
    for (let i = 1; i <= 3; i++) { g.beginPath(); g.moveTo(o.x + o.w / 2 + 4 + i * 6, y - 6 + i * 3); g.lineTo(o.x + o.w / 2 + 14 + i * 8, y - 6 + i * 3); g.stroke(); }
  }
  function glow(g, x, y, r, a) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(216,178,90,' + a + ')'); gr.addColorStop(1, 'rgba(216,178,90,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function drawItem(g, it) {
    const y = it.y + Math.sin(it.t * 3) * 4;
    if (it.kind === 'allin') {
      glow(g, it.x, y, 34, 0.55);
      g.save(); g.translate(it.x, y); g.scale(Math.max(0.2, Math.abs(Math.cos(it.t * 4))), 1);
      g.fillStyle = '#f5c518'; g.beginPath(); g.arc(0, 0, 14, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#8a6a10'; g.lineWidth = 1.5; g.stroke();
      g.strokeStyle = '#fff6cf'; g.setLineDash([4, 3.3]); g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 11, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#8a6a10'; g.font = '700 9px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ALL', 0, 0.5);
      g.restore();
      return;
    }
    if (it.kind === 'ins') {
      const gr = g.createRadialGradient(it.x, y, 0, it.x, y, 32);
      gr.addColorStop(0, 'rgba(90,150,255,.5)'); gr.addColorStop(1, 'rgba(90,150,255,0)');
      g.fillStyle = gr; g.fillRect(it.x - 32, y - 32, 64, 64);
      g.save(); g.translate(it.x, y); g.scale(Math.max(0.2, Math.abs(Math.cos(it.t * 4))), 1);
      g.fillStyle = INS_COL[0]; g.beginPath(); g.arc(0, 0, 14, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#0d2350'; g.lineWidth = 1.5; g.stroke();
      g.strokeStyle = INS_COL[1]; g.setLineDash([4, 3.3]); g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 11, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      // A small shield in the middle.
      g.fillStyle = INS_COL[1]; g.beginPath(); g.moveTo(0, -6.5); g.lineTo(5.5, -4); g.lineTo(5, 1.5); g.quadraticCurveTo(3.5, 5, 0, 7); g.quadraticCurveTo(-3.5, 5, -5, 1.5); g.lineTo(-5.5, -4); g.closePath(); g.fill();
      g.restore();
      return;
    }
    glow(g, it.x, y, 30, 0.35);
    const c = it.c, im = c === JOKER ? null : img(faceUrl(c));
    if (im) {
      g.save(); rr(g, it.x - 13, y - 18, 26, 36, 3); g.clip(); g.drawImage(im, it.x - 13, y - 18, 26, 36); g.restore();
      rr(g, it.x - 13, y - 18, 26, 36, 3); g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1; g.stroke();
      return;
    }
    rr(g, it.x - 13, y - 18, 26, 36, 3); g.fillStyle = '#f5f0e3'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1; g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (c === JOKER) { g.font = '20px system-ui, sans-serif'; g.fillText('🃏', it.x, y + 1); return; }
    g.fillStyle = isRed(c) ? '#c62828' : '#141414';
    g.font = '700 11px Inconsolata, monospace'; g.fillText(RANKS[c % 13], it.x - (rankOf(c) === 10 ? 5 : 6), y - 10);
    g.font = '16px Georgia, serif'; g.fillText(SUITS[suitOf(c)], it.x + 1, y + 5);
  }
  function drawFx(g, dtNow) {
    for (const p of G.fx) {
      const a = 1 - p.t / p.life;
      if (p.type === 'spark') {
        const r = 6 + p.t * 70;
        g.fillStyle = 'rgba(216,178,90,' + a + ')'; g.fillRect(p.x + Math.cos(p.a) * r - 1.5, p.y + Math.sin(p.a) * r - 1.5, 3, 3);
      } else if (p.type === 'chip') {
        const x = p.x + p.vx * p.t, y = p.y + p.vy * p.t + 600 * p.t * p.t;
        g.globalAlpha = a; g.fillStyle = p.c; g.beginPath(); g.ellipse(x, y, 7, 3.5, p.t * 8, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      } else {
        g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
        g.font = p.big ? '700 24px Cinzel, Georgia, serif' : p.gold ? '700 15px Cinzel, Georgia, serif' : '700 14px Inconsolata, monospace';
        const C = ink(shell.theme.light);
        g.fillStyle = p.gold ? C.gold : p.red ? C.red : C.text;
        g.fillText(p.s, p.x, p.y - p.t * 40); g.globalAlpha = 1;
      }
    }
    void dtNow;
  }
  function drawBanner(g) {
    const b = G.banner; if (!b) return;
    const a = b.t < 0.2 ? b.t / 0.2 : b.t > 1.2 ? Math.max(0, 1 - (b.t - 1.2) / 0.4) : 1;
    const w = W(), y = shell.H * 0.34;
    g.globalAlpha = a;
    const C = ink(shell.theme.light);
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
  function draw(g) {
    drawBg(g);
    const now = performance.now() / 1000;
    for (const it of G.items) drawItem(g, it);
    for (const o of G.obs) { if (o.type === 'stack') drawStack(g, o); else if (o.type === 'dealer') drawDealer(g, o); else drawFly(g, o, now); }
    const gy = groundY(), sh = Math.max(0.35, 1 - G.y / 180);
    g.fillStyle = 'rgba(0,0,0,' + 0.35 * sh + ')'; g.beginPath(); g.ellipse(ACE_X, gy + 2, 26 * sh, 5 * sh, 0, 0, Math.PI * 2); g.fill();
    drawFx(g, now);
    drawBanner(g);
    // The DOM Ace: his feet (84, 212 in sprite px) on the ground.
    if (state === 'run' && G.ins && !shell.reduced) {
      const gr = g.createRadialGradient(ACE_X, gy - G.y - 44, 0, ACE_X, gy - G.y - 44, 58);
      gr.addColorStop(0, 'rgba(90,150,255,0)'); gr.addColorStop(0.75, 'rgba(90,150,255,.16)'); gr.addColorStop(1, 'rgba(90,150,255,0)');
      g.fillStyle = gr; g.fillRect(ACE_X - 60, gy - G.y - 104, 120, 120);
    }
    // All-In: a gold bar over his head empties as the time runs out.
    const left = state === 'run' ? G.allInUntil - performance.now() : 0;
    if (left > 0) {
      const bw = 64, bh = 7, bx = ACE_X - bw / 2, by = Math.max(52, gy - G.y - 136), f = Math.min(1, left / ALLIN_MS);
      const warn = left < ALLIN_WARN_MS, off = warn && !shell.reduced && Math.floor(left / 120) % 2;
      rr(g, bx - 1.5, by - 1.5, bw + 3, bh + 3, 5); g.fillStyle = 'rgba(0,0,0,.55)'; g.fill();
      if (!off) { rr(g, bx, by, Math.max(bh, bw * f), bh, 3.5); g.fillStyle = warn ? '#e8503f' : '#f5c518'; g.fill(); }
      rr(g, bx - 1.5, by - 1.5, bw + 3, bh + 3, 5); g.strokeStyle = warn ? 'rgba(232,80,63,.9)' : 'rgba(245,197,24,.8)'; g.lineWidth = 1; g.stroke();
    }
    const blink = state === 'run' && performance.now() < G.safeUntil;
    ace.place(ACE_X, gy - G.y, S, shell.k);
    ace.fade(blink && Math.floor(performance.now() / 90) % 2 ? 0.35 : 1);
  }

  return {
    update, draw, input,
    running: () => state === 'run',
    destroy() {
      clearTimeout(revealTimer);
      try { if (typeof window.resetBlindRaises === 'function') window.resetBlindRaises(); } catch (e) {}
      ace.remove();
    },
  };
}
