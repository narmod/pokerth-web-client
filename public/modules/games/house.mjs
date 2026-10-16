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
//   Blinds up every 5 floors: the rail runs faster
//   Pot       chips stacked on each floor's flat card, more for a better hand
//   Showdown  when it falls, the best floor's five cards are turned one by one
// The Ace lives in the house: he stands on the last floor (drawn behind the
// cards, a second canvas above him), climbs when a floor is done, balances
// when it leans, and goes down with it. The rail shows the next card on the
// shoe. Secret trophy « House of Cards » at 10 floors.
// ═══════════════════════════════════════════════════════════════════

import { evalCards, JOKER } from './poker-hand.mjs';
import { CHIP, fmt, backUrl, cardHtml, newDeck, imageCache, rr, drawFace, aceActor, ink } from './common.mjs';

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

// Slot i of a floor: centre (x, y above the floor's base), angle, size.
function slot(i) {
  if (i === 4) return { x: 0, y: 40 + BRIDGE_H / 2, rot: 0, w: BRIDGE_W, h: BRIDGE_H, tol: 16 };
  const ax = i < 2 ? -FRAME_X : FRAME_X, right = i % 2 === 1;
  const off = CH / 2 * Math.sin(LEAN);
  return { x: right ? ax + 13 - off : ax - 13 + off, y: CH / 2 * Math.cos(LEAN), rot: right ? -LEAN : LEAN, w: CW, h: CH, tol: 12 };
}

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
    + '<div class="ar-hand"><div class="ar-slots"></div><div class="ar-name"></div></div>';
  if (!document.getElementById('pth-game-house-css')) {
    const st = document.createElement('style'); st.id = 'pth-game-house-css';
    st.textContent = '#pth-game .hc-tilt{width:64px;height:8px;margin-top:5px;border-radius:4px;background:rgba(245,240,227,.12);overflow:hidden}'
      + '#pth-game .hc-tilt i{display:block;height:100%;width:0;border-radius:4px;background:#3fae6a;transition:width .2s,background .2s}'
      + '#pth-game .hc-burn{margin-top:5px;font:700 12px/1 Inconsolata,monospace;color:#f5f0e3}'
      + '@media (max-width:520px){#pth-game .hc-tilt{width:44px}}';
    document.head.appendChild(st);
  }
  const hFloors = /** @type {HTMLElement} */ (shell.hud.querySelector('.hc-floors'));
  const hScore = /** @type {HTMLElement} */ (shell.hud.querySelector('.hc-score'));
  const hTilt = /** @type {HTMLElement} */ (shell.hud.querySelector('.hc-tilt i'));
  const hBurn = /** @type {HTMLElement} */ (shell.hud.querySelector('.hc-burn'));
  const hSlots = /** @type {HTMLElement} */ (shell.hud.querySelector('.ar-slots'));
  const hName = /** @type {HTMLElement} */ (shell.hud.querySelector('.ar-name'));

  const lights = [], stars = [];
  for (let i = 0; i < 18; i++) lights.push({ x: Math.random() * 900 - 450, y: Math.random() * 700, r: 8 + Math.random() * 22, a: 0.07 + Math.random() * 0.14, h: Math.random() < 0.7 ? '216,178,90' : '179,38,30' });
  for (let i = 0; i < 90; i++) stars.push({ x: Math.random() * 900 - 450, y: 700 + Math.random() * 2600, r: Math.random() * 1.3 + 0.3 });

  let state = 'title', G = null, revealTimer = 0, time = 0;
  // The rail runs just below the HUD (taller, relative to the stage, on a phone).
  let railY = RAIL_Y;
  const measureRail = () => { try { railY = Math.max(RAIL_Y, shell.hud.offsetHeight / (shell.k || 1) + 14); } catch (e) {} };

  function newRun() {
    G = { level: 1, floors: [], cur: [], deck: newDeck(), card: -1, next: -1, burns: 3, tilt: 0, score: 0, streak: 0,
      railX: 0, railDir: 1, fall: null, camY: 0, aceY: 0, aceHop: 0, fx: [], debris: [], banner: null,
      crownUntil: 0, yayUntil: 0, best: null, overAt: 0 };
    G.card = deal(); G.next = deal();
    renderHud();
  }
  function deal() { if (!G.deck.length) G.deck = newDeck(); return /** @type {number} */ (G.deck.pop()); }
  const slotNow = () => G.cur.length;              // next slot of the floor being built
  const amp = () => Math.min(140, 72 + G.level * 6);
  const speed = () => Math.min(210, 74 + (G.level - 1) * 16);
  const W = () => shell.W, H = () => shell.H;
  const groundY = () => H() - 30;
  const sy = (wy) => groundY() - (wy - G.camY);
  // How far the house leans at height wy (world px), sway included.
  const shift = (wy) => (G.tilt * 5 + Math.sin(time * 1.8) * Math.abs(G.tilt) * 1.6) * (wy / FH);

  function renderHud() {
    hFloors.textContent = String(G.floors.length);
    hScore.textContent = fmt(G.score);
    const a = Math.min(1, Math.abs(G.tilt));
    hTilt.style.width = Math.round(a * 100) + '%';
    hTilt.style.background = a < 0.4 ? '#3fae6a' : a < 0.7 ? '#e0a33a' : '#d2453b';
    hBurn.textContent = '🔥 ' + G.burns;
    const cards = G.cur.map((c) => c.n);
    let h = '';
    for (let i = 0; i < 5; i++) h += cards[i] != null ? cardHtml(cards[i], 'sm') : '<div class="ar-slot"></div>';
    hSlots.innerHTML = h;
    const ev = evalCards(cards);
    hName.innerHTML = ev.nameKey ? esc(t(ev.nameKey)) + ' <b>×' + ev.mult + '</b>' : '';
    measureRail();
  }

  function titlePanel() {
    const best = shell.best.get();
    shell.panel('<h2>' + esc(t('hcName')) + '</h2><p>' + esc(t('hcHint')) + '</p>'
      + (best ? '<p class="pg-dim">' + esc(t('arRecord', { n: fmt(best) })) + '</p>' : '')
      + '<p class="pg-blink">' + esc(t('arTapStart')) + '</p>');
  }
  newRun();
  titlePanel();
  ace.pose('idle');
  // Browser tests only (navigator.webdriver): reach the run state.
  try { if (navigator.webdriver) window.__pthHouse = { run: () => G }; } catch (e) {}

  function start() {
    clearTimeout(revealTimer);
    newRun(); state = 'run'; shell.panel(null);
    ace.king(false); ace.mood('mc-m-smile'); ace.pose('idle');
    try { if (typeof window.resetBlindRaises === 'function') window.resetBlindRaises(); } catch (e) {}
  }

  // ── Input ─────────────────────────────────────────────────────────
  function input(a, down) {
    if (!down) return;
    if (a === 'jump') {
      if (state === 'title' || (state === 'over' && performance.now() > G.overAt + 900)) { start(); return; }
      if (state === 'run' && !G.fall) {
        G.fall = { n: G.card, slot: slotNow(), x: G.railX, wy: screenToWorld(railY + HANG + (slotNow() === 4 ? -12 : 0)), vy: 0 };
        G.card = G.next; G.next = deal();
      }
    } else if (a === 'duck' && state === 'run' && !G.fall) {
      if (G.burns <= 0) { G.fx.push({ s: '🔥 0', x: G.railX, y: railY + HANG + 30, t: 0, life: 0.7, screen: true }); return; }
      G.burns--;
      G.debris.push(debrisOf(G.card, G.railX, worldOf(railY + HANG), 0.2, true));
      G.fx.push({ s: '🔥', x: G.railX, y: railY + HANG, t: 0, life: 0.8, screen: true, big: true });
      G.card = G.next; G.next = deal();
      sound('notifyFold');
      renderHud();
    }
  }
  const screenToWorld = (y) => groundY() - y + G.camY;
  const worldOf = screenToWorld;

  // ── Play ──────────────────────────────────────────────────────────
  function debrisOf(n, x, wy, rot, burnt) {
    return { n, x, wy, rot, vx: (Math.random() - 0.5) * 120, vy: 60 + Math.random() * 120, vr: (Math.random() - 0.5) * 8, t: 0, burnt: !!burnt,
      w: CW, h: CH };
  }
  function land(f) {
    const sl = slot(f.slot);
    const base = G.floors.length * FH;
    const target = sl.x + shift(base + sl.y);
    const d = f.x - target;
    if (Math.abs(d) > sl.tol) {
      // Off its mark: it slides off and the house takes the knock.
      G.debris.push(Object.assign(debrisOf(f.n, f.x, base + sl.y, sl.rot), f.slot === 4 ? { w: BRIDGE_W, h: BRIDGE_H } : {}));
      G.tilt += Math.sign(d) * 0.16;
      G.streak = 0;
      G.fx.push({ s: '✗', x: f.x, wy: base + sl.y + 20, t: 0, life: 0.7, red: true });
      sound('notifyFold');
    } else {
      const perfect = Math.abs(d) <= 2.5;
      G.cur.push({ n: f.n, dx: d });
      if (perfect) {
        G.streak++;
        G.tilt *= 0.8;
        G.score += 5 * Math.min(G.streak, 3);
        G.fx.push({ s: t('hcPerfect') + (G.streak > 1 ? ' ×' + G.streak : ''), x: target, wy: base + sl.y + 34, t: 0, life: 0.9, gold: true, small: true });
      } else {
        G.streak = 0;
        G.tilt += (d / sl.tol) * (f.slot === 4 ? 0.12 : 0.09);
      }
      sound('notifyCard');
      if (G.cur.length === 5) floorDone();
    }
    renderHud();
    if (Math.abs(G.tilt) >= 1) collapse();
  }
  function floorDone() {
    const cards = G.cur.map((c) => c.n);
    const ev = evalCards(cards);
    const pts = 20 * ev.mult;
    G.score += pts;
    G.floors.push({ cards: G.cur, ev });
    G.cur = [];
    const top = G.floors.length * FH;
    G.fx.push({ s: t(ev.nameKey) + '  +' + pts, x: 0, wy: top + 64, t: 0, life: 1.4, gold: ev.cat >= 1 });
    if (ev.cat >= 6) {
      G.tilt = 0; G.crownUntil = performance.now() + 3000;
      G.fx.push({ s: 'ALL-IN!', x: 0, wy: top + 96, t: 0, life: 1.4, gold: true, big: true });
      sound('notifyAllIn');
    } else if (ev.cat >= 4) {
      G.tilt *= 0.5;
      G.fx.push({ s: t('hcSteady'), x: 0, wy: top + 90, t: 0, life: 1.2, gold: true });
      sound('notifyRaise');
    } else if (ev.cat >= 1) sound('notifyRaise');
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
  }
  function collapse() {
    state = 'over'; G.overAt = performance.now();
    // Every card comes down.
    G.floors.forEach((f, i) => f.cards.forEach((c, j) => {
      const sl = slot(j), wy = i * FH + sl.y;
      G.debris.push(Object.assign(debrisOf(c.n, sl.x + c.dx + shift(wy), wy, sl.rot), j === 4 ? { w: BRIDGE_W, h: BRIDGE_H } : {},
        { vx: (G.tilt > 0 ? 1 : -1) * (40 + Math.random() * 160) + (Math.random() - 0.5) * 60, vy: 40 + Math.random() * 180 }));
    }));
    G.cur.forEach((c, j) => {
      const sl = slot(j), wy = G.floors.length * FH + sl.y;
      G.debris.push(debrisOf(c.n, sl.x + c.dx + shift(wy), wy, sl.rot));
    });
    const fallen = G.floors.length;
    G.floors = []; G.cur = [];
    ace.king(false); ace.pose('ko'); ace.mood('mc-m-ko');
    sound('notifyFold');
    const score = G.score, prevBest = shell.best.get(), record = score > prevBest;
    if (record) shell.best.set(score);
    const cards = G.best ? G.best.ev.best : [];
    const tail = '<div class="ar-final">' + fmt(fallen) + ' · <em>' + fmt(score) + '</em></div>'
      + '<p class="pg-dim">' + esc(record && prevBest ? t('arNewRecord') : t('arRecord', { n: fmt(Math.max(score, prevBest)) })) + '</p>'
      + '<p class="pg-blink">' + esc(t('hcAgain')) + '</p>';
    let shown = 0;
    const paint = () => {
      let row = '';
      for (let i = 0; i < cards.length; i++) row += i < shown ? cardHtml(cards[i], 'lg') : '<div class="pk lg back"></div>';
      const hand = !cards.length ? '&nbsp;' : shown >= cards.length ? esc(t(G.best.ev.nameKey)) : '&nbsp;';
      shell.panel('<h2>' + esc(t('hcCollapse')) + '</h2>' + (cards.length ? '<div class="ar-show">' + row + '</div>' : '')
        + '<p>' + hand + '</p>' + (shown >= cards.length ? tail : ''));
    };
    const next = () => {
      if (state !== 'over') return;
      paint();
      if (shown < cards.length) revealTimer = setTimeout(() => { shown++; sound('notifyCard'); next(); }, shown ? 260 : 700);
      else if (record && prevBest) sound('notifyBigWin');
    };
    revealTimer = setTimeout(next, 900);
  }

  function update(dt) {
    time += dt;
    // The rail runs back and forth at a steady pace (title screen included).
    const A = amp();
    G.railX += G.railDir * speed() * dt;
    if (G.railX > A) { G.railX = A; G.railDir = -1; }
    if (G.railX < -A) { G.railX = -A; G.railDir = 1; }
    if (state === 'run' && G.fall) {
      const f = G.fall;
      f.vy += 1500 * dt; f.wy -= f.vy * dt;
      const base = G.floors.length * FH, sl = slot(f.slot);
      if (f.wy <= base + sl.y) { G.fall = null; land(f); }
    }
    // Camera: the floor being built sits about two thirds down the screen.
    const camTarget = Math.max(0, G.floors.length * FH - (groundY() - H() * 0.66));
    G.camY += (camTarget - G.camY) * Math.min(1, dt * 3);
    if (state === 'title') return;
    for (let i = G.debris.length - 1; i >= 0; i--) {
      const d = G.debris[i];
      d.t += dt; d.vy -= 900 * dt; d.wy += d.vy * dt; d.x += d.vx * dt; d.rot += d.vr * dt;
      if (sy(d.wy) > H() + 60) G.debris.splice(i, 1);
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
      ace.mood(now < G.yayUntil ? 'mc-m-yay' : a > 0.7 ? 'mc-m-fierce' : a > 0.45 ? 'mc-m-jump' : 'mc-m-smile');
      ace.king(now < G.crownUntil, G.crownUntil - now < 800);
    } else {
      G.aceY -= dt * 220;    // down with the house
    }
  }

  // ── Drawing ───────────────────────────────────────────────────────
  function drawBg(g) {
    const w = W(), h = H(), cam = G.camY;
    // Casino → ceiling → night sky as the house grows.
    const k = Math.min(1, cam / 900);
    // Light theme: the casino by day, then a blue sky; dark: by night, then the stars.
    const light = shell.theme.light;
    const top = light ? mix([247, 240, 227], [176, 206, 236], k) : mix([10, 16, 14], [7, 10, 26], k);
    const bot = light ? mix([230, 217, 193], [226, 238, 250], k) : mix([22, 37, 30], [16, 22, 44], k);
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, 'rgb(' + top + ')'); sky.addColorStop(1, 'rgb(' + bot + ')');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    if (!light) for (const s of stars) {
      const y = sy(s.y * 1) + (cam * 0.5);       // half speed: far away
      if (y < -4 || y > h + 4) continue;
      g.fillStyle = 'rgba(245,240,227,' + (0.35 + 0.4 * Math.abs(Math.sin(time * 1.3 + s.x))) + ')';
      g.fillRect(w / 2 + s.x * (w / 900), y, s.r, s.r);
    }
    if (!shell.reduced) for (const l of lights) {
      const y = sy(l.y) + cam * 0.6;
      if (y < -40 || y > h + 40) continue;
      const x = w / 2 + l.x * (w / 900);
      const gr = g.createRadialGradient(x, y, 0, x, y, l.r);
      gr.addColorStop(0, 'rgba(' + l.h + ',' + l.a + ')'); gr.addColorStop(1, 'rgba(' + l.h + ',0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, l.r, 0, Math.PI * 2); g.fill();
    }
    // The chandelier, eight floors up.
    const cy = sy(8 * FH + 90);
    if (cy > -80 && cy < h + 40) {
      const cx = w / 2 - Math.min(170, w * 0.34);   // left: the shoe is on the right
      g.strokeStyle = 'rgba(216,178,90,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, cy - 200); g.lineTo(cx, cy - 22); g.stroke();
      const glow = g.createRadialGradient(cx, cy, 0, cx, cy, 70);
      glow.addColorStop(0, 'rgba(255,224,150,.28)'); glow.addColorStop(1, 'rgba(255,224,150,0)');
      g.fillStyle = glow; g.fillRect(cx - 70, cy - 70, 140, 140);
      g.fillStyle = '#c9a14a'; g.beginPath(); g.ellipse(cx, cy, 30, 7, 0, 0, Math.PI * 2); g.fill();
      for (let i = -2; i <= 2; i++) { g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(cx + i * 12, cy - 9, 3, 0, Math.PI * 2); g.fill(); }
      for (let i = -3; i <= 3; i++) { g.strokeStyle = 'rgba(245,240,227,.5)'; g.beginPath(); g.moveTo(cx + i * 8, cy + 5); g.lineTo(cx + i * 8, cy + 16 + Math.abs(i) * -2 + 6); g.stroke(); }
    }
    // The table: felt and its wooden rail.
    const gy = sy(0);
    if (gy < h + 10) {
      const felt = g.createLinearGradient(0, gy, 0, gy + 30); felt.addColorStop(0, '#24774e'); felt.addColorStop(1, '#174f34');
      g.fillStyle = felt; g.fillRect(0, gy, w, 18);
      g.strokeStyle = 'rgba(216,178,90,.55)'; g.setLineDash([7, 6]); g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, gy + 8); g.lineTo(w, gy + 8); g.stroke(); g.setLineDash([]);
      const rail = g.createLinearGradient(0, gy + 18, 0, gy + 40); rail.addColorStop(0, '#6b4426'); rail.addColorStop(1, '#2a180c');
      g.fillStyle = rail; g.fillRect(0, gy + 18, w, 40);
    }
  }
  function mix(a, b, k) { return a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(','); }

  function drawCard(g, n, x, y, rot, w, h, bridge) {
    g.save(); g.translate(x, y); g.rotate(rot);
    if (bridge) {
      // A flat card seen from the side: a thin face.
      rr(g, -w / 2, -h / 2, w, h, 2); g.fillStyle = '#f5f0e3'; g.fill();
      g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = n === JOKER ? '#7a3fb0' : (n % 52) < 26 ? '#c62828' : '#141414';
      g.fillRect(-w / 2 + 3, -0.75, w - 6, 1.5);
    } else drawFace(g, img, n, w, h);
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
    const cx = W() / 2;
    G.floors.forEach((f, i) => {
      const base = i * FH;
      f.cards.forEach((c, j) => {
        const sl = slot(j), wy = base + sl.y;
        drawCard(g, c.n, cx + sl.x + c.dx + shift(wy), sy(wy), sl.rot + G.tilt * 0.04, sl.w, sl.h, j === 4);
      });
      if (f.ev.cat >= 1) { const wy = base + FH; drawPot(g, cx + FRAME_X + 6 + shift(wy), sy(wy), f.ev.cat); }
    });
    const base = G.floors.length * FH;
    G.cur.forEach((c, j) => {
      const sl = slot(j), wy = base + sl.y;
      drawCard(g, c.n, cx + sl.x + c.dx + shift(wy), sy(wy), sl.rot + G.tilt * 0.04, sl.w, sl.h, j === 4);
    });
    // The place of the next card: a faint outline.
    if (state === 'run' && G.cur.length < 5) {
      const sl = slot(G.cur.length), wy = base + sl.y;
      g.save(); g.translate(cx + sl.x + shift(wy), sy(wy)); g.rotate(sl.rot);
      rr(g, -sl.w / 2, -sl.h / 2, sl.w, sl.h, 3);
      g.setLineDash([3, 3]); g.strokeStyle = 'rgba(216,178,90,.55)'; g.lineWidth = 1; g.stroke(); g.setLineDash([]);
      g.restore();
    }
  }
  function drawRail(g) {
    const w = W(), cx = w / 2, A = amp();
    g.fillStyle = shell.theme.light ? 'rgba(140,105,20,.85)' : 'rgba(216,178,90,.75)'; g.fillRect(cx - A - 30, railY - 2, 2 * A + 60, 3);
    g.fillStyle = 'rgba(216,178,90,.35)'; g.fillRect(cx - A - 30, railY + 1, 2 * A + 60, 1);
    // The shoe at the right end: the next card face up on the deck.
    const shoeX = cx + A + 48;
    if (shoeX + 18 < w) {
      for (let i = 3; i >= 0; i--) drawBack(g, shoeX + i * 1.2, railY + 22 - i * 1.2, 24, 34);
      if (state === 'run') { g.save(); g.translate(shoeX - 2, railY + 18); drawFace(g, img, G.next, 24, 34); g.restore(); }
    }
    if (state === 'over') return;
    // The trolley (a chip) and the hanging card.
    const x = cx + G.railX;
    if (!G.fall) {
      g.strokeStyle = shell.theme.light ? 'rgba(43,49,56,.55)' : 'rgba(245,240,227,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, railY); g.lineTo(x, railY + HANG - 18); g.stroke();
      const sl = slot(G.cur.length);
      drawCard(g, G.card, x, railY + HANG + (G.cur.length === 4 ? -12 : 0), sl.rot, sl.w, sl.h, G.cur.length === 4);
    }
    g.fillStyle = '#b3261e'; g.beginPath(); g.arc(x, railY, 7, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#f5f0e3'; g.setLineDash([2.5, 2]); g.lineWidth = 1.6; g.beginPath(); g.arc(x, railY, 5, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  }
  function drawFalling(g) {
    const f = G.fall; if (!f) return;
    const sl = slot(f.slot);
    drawCard(g, f.n, W() / 2 + f.x, sy(f.wy), sl.rot, sl.w, sl.h, f.slot === 4);
  }
  function drawDebris(g) {
    for (const d of G.debris) {
      const x = W() / 2 + d.x, y = sy(d.wy);
      g.save(); g.globalAlpha = d.burnt ? Math.max(0, 1 - d.t * 1.4) : 1;
      if (d.burnt) { g.translate(x, y); g.rotate(d.rot); drawFace(g, img, d.n, d.w, d.h); g.fillStyle = 'rgba(255,120,30,' + Math.min(0.6, d.t) + ')'; g.fillRect(-d.w / 2, -d.h / 2, d.w, d.h); }
      else { g.translate(x, y); g.rotate(d.rot); if (d.h < 10) { rr(g, -d.w / 2, -d.h / 2, d.w, d.h, 2); g.fillStyle = '#f5f0e3'; g.fill(); } else drawFace(g, img, d.n, d.w, d.h); }
      g.restore();
    }
  }
  function drawFx(g) {
    for (const p of G.fx) {
      const a = 1 - p.t / p.life;
      const x = p.screen ? W() / 2 + p.x : W() / 2 + p.x + (p.wy != null ? shift(p.wy) : 0);
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
    drawBg(g);
    fgCanvas.width !== shell.canvas.width && (fgCanvas.width = shell.canvas.width);
    fgCanvas.height !== shell.canvas.height && (fgCanvas.height = shell.canvas.height);
    fg.setTransform(1, 0, 0, 1, 0, 0); fg.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
    fg.setTransform(shell.dpr * shell.k, 0, 0, shell.dpr * shell.k, 0, 0);
    drawHouse(fg);
    drawRail(fg);
    drawFalling(fg);
    drawDebris(fg);
    drawFx(fg);
    drawBanner(fg);
    // The Ace on the last floor (behind the cards: he is on the canvas below them).
    const feetY = state === 'title' ? 0 : G.aceY;
    ace.place(W() / 2 + shift(feetY), sy(feetY), S, shell.k, state === 'over' ? 0 : G.tilt * 8);
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
