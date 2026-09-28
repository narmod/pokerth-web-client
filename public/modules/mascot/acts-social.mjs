// ═══════════════════════════════════════════════════════════════════
// Mascot — social acts (web extension, narmod 2026-09-28): reactions to
// what happens in the lobby (a new table, a private message, a better
// rank) and scenes with a friend (a western duel with the King of hearts,
// the Joker's prank). Same contract as modules/mascot/acts-extra.mjs.
// The reactions (r-table, r-mail, r-bravo) are never drawn at random:
// modules/mascot/index.mjs plays them when the event happens.
// ═══════════════════════════════════════════════════════════════════

const U = 1.2;
const roomy = (st, x) => ((st.maxX - x) >= (x - st.minX) ? 1 : -1);

/** Arm angle (deg) that points the right arm at (tx, ty), in the frame flipped by D. */
function aim(st, x, D, tx, ty) {
  const k = st.k, sx = x + (D > 0 ? 104 : 36) * U * k, sy = st.yF + 84 * U * k;
  const a = Math.atan2(ty - sy, (tx - sx) * D) * 180 / Math.PI, a0 = Math.atan2(29, 19) * 180 / Math.PI;
  return Math.max(-175, Math.min(40, a - a0));
}
function rectOf(sel) {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width && r.height ? r : null;
}
/** Turns towards a point and points at it with the right arm from t0 to t1. */
function pointAt(H, tx, ty, t0, t1) {
  const { st, E } = H, x = H.cur.x, D = tx >= x + st.w / 2 ? 1 : -1, a = aim(st, x, D, tx, ty);
  H.track(E.flip, t1 + 300, [[0, { transform: `scaleX(${D})` }], [t1 + 300, { transform: `scaleX(${D})` }]], 'none');
  H.track(E.card, t1 + 300, [[0, H.ry(0)], [t0, H.ry(0)], [t0 + 200, H.facing(1)], [t1, H.facing(1)], [t1 + 250, H.ry(0)]], 'none');
  H.track(E.armR, t1 + 300, [[0, H.rot(0)], [t0, H.rot(0)], [t0 + 220, H.rot(a)], [t1, H.rot(a)], [t1 + 250, H.rot(0)]], 'none');
  H.track(E.lean, t1 + 300, [[0, H.rot(0)], [t0, H.rot(0)], [t0 + 220, H.rot(6 * D)], [t1, H.rot(6 * D)], [t1 + 250, H.rot(0)]], 'none');
}
function pulseRing(H, r, t0, n) {
  const el = document.createElement('div');
  el.style.cssText = `position:absolute;left:${r.left - 4}px;top:${r.top - 4}px;width:${r.width + 8}px;height:${r.height + 8}px;border-radius:10px;border:3px solid #f5c518;box-shadow:0 0 14px rgba(245,197,24,.7);opacity:0`;
  H.E.root.insertBefore(el, H.E.pos);
  H.play(el, [{ opacity: 0 }, { offset: 0.3, opacity: 1 }, { opacity: 0 }], { duration: 700, delay: t0, iterations: n, fill: 'none' });
}

// ── A new table appeared: points at the table list ─────────────────────
async function rTable(H) {
  const { st, E } = H;
  const r = rectOf('#g-list') || rectOf('#s-lobby');
  const tx = r ? r.left + r.width / 2 : st.vw / 2, ty = r ? r.top + Math.min(40, r.height / 4) : st.vh / 3;
  pointAt(H, tx, ty, 200, 2600);
  if (r) pulseRing(H, r, 350, 3);
  H.bubble(H.tr('mascotTable', 'A new table!'), 350, 2500);
  H.faceWin(200, 2800, H.F.GRIN);
  H.cycle(E.bob, H.HOP, 300, 400, 6);
  await H.wait(3000);
}

// ── A private message arrived: waves an envelope ───────────────────────
const ENVELOPE = '<g transform="rotate(150 123 113)"><rect x="110" y="86" width="26" height="18" rx="2" fill="#fbf7ee" stroke="#141414" stroke-width="1.4"/><path d="M110 87 L123 97 L136 87" fill="none" stroke="#141414" stroke-width="1.4"/><path transform="translate(123 97) scale(.7)" fill="#c62828" d="M0 5.5 C-6.5 1 -6.5 -4.5 -3.2 -5 C-1.4 -5.3 0 -4 0 -2.6 C0 -4 1.4 -5.3 3.2 -5 C6.5 -4.5 6.5 1 0 5.5Z"/></g>';
async function rMail(H) {
  const { st, E } = H;
  E.hr.innerHTML = ENVELOPE;
  H.play(E.hr, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'both' });
  H.track(E.armR, 1900, [[0, H.rot(0)], [250, H.rot(-150)], [1700, H.rot(-150)], [1900, H.rot(0)]], 'none');
  H.cycle(E.armR, [H.rot(-160), { offset: 0.5, ...H.rot(-130) }, H.rot(-160)], 360, 300, 4);
  H.bubble(H.tr('mascotMail', 'You’ve got mail!'), 250, 2300);
  H.faceWin(200, 1900, ['ec', 'mo']);
  H.suitWin(200, 1900, 'H');
  const r = rectOf('#pm-btn-lobby');
  if (r) { pointAt(H, r.left + r.width / 2, r.top + r.height / 2, 2000, 3200); pulseRing(H, r, 2100, 2); }
  H.play(E.hr, [{ opacity: 1 }, { opacity: 0 }], { duration: 150, delay: 1900, fill: 'forwards' });
  await H.wait(3500);
}

// ── Climbed the ranking: confetti, jumps for joy ───────────────────────
async function rBravo(H) {
  const { st, E } = H, k = st.k, x = H.cur.x;
  const cols = ['#c62828', '#f5c518', '#1f5fbf', '#2e7d32', '#7b2cbf', '#fbf7ee'];
  for (let i = 0; i < 26; i++) {
    const c = document.createElement('div'), w = (4 + (i % 3) * 2) * k * 1.4, h = w * 0.55;
    const x0 = x + st.w / 2 + (i % 2 ? 1 : -1) * (i * 7 % 60) * k, y0 = st.yF - 20 * k;
    c.style.cssText = `position:absolute;left:${x0}px;top:${y0}px;width:${w}px;height:${h}px;background:${cols[i % cols.length]};opacity:0;border-radius:1px`;
    E.root.appendChild(c);
    const dx = ((i * 37) % 140 - 70) * k * 1.6, up = (60 + (i * 13) % 70) * k, down = st.floor - y0;
    H.play(c, [{ transform: 'translate(0px,0px) rotate(0deg)', opacity: 1, easing: 'ease-out' },
      { offset: 0.3, transform: `translate(${dx * 0.6}px,${-up}px) rotate(${i * 50}deg)`, opacity: 1, easing: 'ease-in' },
      { transform: `translate(${dx}px,${down}px) rotate(${i * 50 + 540}deg)`, opacity: 0.2 }], { duration: 2300, delay: 200 + (i % 6) * 60, fill: 'none' });
  }
  H.track(E.armL, 3000, [[0, H.rot(0)], [250, H.rot(150)], [2600, H.rot(150)], [2900, H.rot(0)]]);
  H.track(E.armR, 3000, [[0, H.rot(0)], [250, H.rot(-150)], [2600, H.rot(-150)], [2900, H.rot(0)]]);
  H.cycle(E.bob, [{ transform: 'translateY(0px)', easing: 'ease-out' }, { offset: 0.5, transform: `translateY(${-26}px)`, easing: 'ease-in' }, { transform: 'translateY(0px)' }], 520, 250, 4);
  H.bubble(H.tr('mascotBravo', 'Well done!'), 300, 2600);
  H.faceWin(200, 1400, H.F.LOVE);
  H.faceWin(1400, 2900, H.F.GRIN);
  ['H', 'D', 'C', 'S', 'H', 'D', 'C', 'S'].forEach((s, i) => H.suitWin(250 + i * 300, 250 + (i + 1) * 300, s));
  await H.wait(3100);
}

// ── Western duel with the King of hearts: sword against… a BANG! flag ──
const WEED = '<g fill="none" stroke="#9a6532" stroke-width="1.6" stroke-linecap="round"><circle cx="15" cy="15" r="13"/><path d="M5 10 Q15 2 25 12 Q18 22 8 18 Q14 10 22 18 M10 24 Q16 8 24 22"/></g>';
async function duel(H) {
  const { st, E } = H, k = st.k, x = H.cur.x, D = roomy(st, x);
  const gap = 1.9 * st.w, room = D > 0 ? st.maxX - x : x - st.minX;
  if (room < gap) return H.grim();
  const F = H.friend('king', false);
  F.pos.classList.replace('mc-tool-none', 'mc-tool-sword');
  const xK = x + D * gap, xIn = D > 0 ? st.vw + 20 : -st.w - 20, wk = H.walkMs(st, xIn, xK);
  const tB = wk + 200, tS = tB + 900, tA = tS + 2000, tHit = tA + 800, tL = tHit + 700, tH = tL + 900, tOut = tH + 1600;
  const xHit = x + D * 1.15 * st.w, wo = H.walkMs(st, xHit, xIn), total = tOut + wo + 100;
  H.play(F.breath, [{ transform: 'scale(1,1)' }, { offset: 0.5, transform: 'scale(.99,1.025)' }, { transform: 'scale(1,1)' }], { duration: 3400, iterations: Infinity });
  H.track(E.flip, total, [[0, { transform: `scaleX(${D})` }], [total, { transform: `scaleX(${D})` }]], 'none');
  H.track(F.flip, total, [[0, { transform: `scaleX(${-D})` }], [total, { transform: `scaleX(${-D})` }]]);
  // the King walks in and stops facing him
  H.track(F.pos, total, [[0, H.P(xIn, st.yF, 1)], [wk, H.P(xK, st.yF, 1)], [tA + 150, H.P(xK, st.yF, 1), 'ease-in'], [tHit, H.P(xHit, st.yF, 1), 'ease-out'],
    [tHit + 250, H.P(xHit, st.yF + 18 * k, 1)], [tH, H.P(xHit, st.yF + 18 * k, 1), 'ease-out'], [tH + 300, H.P(xHit, st.yF, 1)], [tOut, H.P(xHit, st.yF, 1)], [total - 100, H.P(xIn, st.yF, 1)]]);
  H.walkWin(0, wk, F);
  H.track(F.card, total, [[0, H.facing(1)], [wk, H.facing(1)], [wk + 200, H.ry(0)], [tOut - 200, H.ry(0)], [tOut, H.facing(-1)]]);
  H.walkWin(tOut, wo, F);
  // they bow to each other
  const bow = (v) => ({ transform: `rotateY(0deg) rotateX(${v}deg)` });
  H.track(E.card, tS, [[0, H.ry(0)], [tB, bow(0)], [tB + 300, bow(35)], [tB + 600, bow(0)], [tS, H.facing(1)]], 'none');
  H.track(F.card, tS, [[0, H.facing(1)], [tB, bow(0)], [tB + 300, bow(35)], [tB + 600, bow(0)]], 'none');
  // stare-down… a tumbleweed rolls by
  H.faceWin(tS, tA, ['ew', 'br', 'mf']); H.faceWin(tS, tA, ['ew', 'br', 'mf'], F);
  const ww = 30 * U * k * 1.2, wy = st.floor - ww, wx0 = D > 0 ? -ww : st.vw, wx1 = D > 0 ? st.vw : -ww;
  const weed = H.worldProp(30, 30, WEED, 0, wy, false, 1.2);
  H.play(weed, [{ transform: `translate(${wx0}px,0px) rotate(0deg)` }, { offset: 0.25, transform: `translate(${wx0 + (wx1 - wx0) * 0.25}px,${-18 * k}px) rotate(${D * 300}deg)` },
    { offset: 0.5, transform: `translate(${wx0 + (wx1 - wx0) * 0.5}px,0px) rotate(${D * 600}deg)` }, { offset: 0.75, transform: `translate(${wx0 + (wx1 - wx0) * 0.75}px,${-12 * k}px) rotate(${D * 900}deg)` },
    { transform: `translate(${wx1}px,0px) rotate(${D * 1200}deg)` }], { duration: 1800, delay: tS + 100, fill: 'both' });
  // the King charges, sword high; the Ace draws: BANG!
  H.track(F.armR, total, [[0, H.rot(0)], [tA - 200, H.rot(0)], [tA, H.rot(-160)], [tHit, H.rot(-160)], [tHit + 150, H.rot(-20)], [tH, H.rot(-20)], [tH + 300, H.rot(0)]]);
  H.faceWin(tA, tHit, ['eo', 'br', 'mo'], F);
  H.cycle(F.legL, H.KICK_F, 260, tA + 150, 2); H.cycle(F.legR, H.KICK_B, 260, tA + 150, 2);
  H.track(E.armR, total, [[0, H.rot(0)], [tA + 250, H.rot(0)], [tA + 450, H.rot(-55)], [tL, H.rot(-55)], [tL + 300, H.rot(0)]], 'none');
  const bt = E.bang.querySelector('.mc-bang-t');
  if (bt) { if (D < 0) bt.setAttribute('transform', 'translate(138 0) scale(-1 1)'); else bt.removeAttribute('transform'); }
  H.track(E.bang, tL + 250, [[0, { transform: 'scale(0,1)', opacity: 0 }], [tA + 650, { transform: 'scale(0,1)', opacity: 0 }], [tA + 750, { transform: 'scale(1.15,1.1)', opacity: 1 }], [tA + 900, { transform: 'scale(1,1)', opacity: 1 }], [tL, { transform: 'scale(1,1)', opacity: 1 }], [tL + 250, { transform: 'scale(0,1)', opacity: 0 }]]);
  H.faceWin(tA, tHit, ['ew', 'mf']);
  // the King drops on his behind, then they both laugh and shake hands
  H.track(F.legL, total, [[0, H.rot(0)], [tHit, H.rot(0)], [tHit + 200, H.rot(70)], [tH, H.rot(70)], [tH + 300, H.rot(0)]], 'none');
  H.track(F.legR, total, [[0, H.rot(0)], [tHit, H.rot(0)], [tHit + 200, H.rot(-70)], [tH, H.rot(-70)], [tH + 300, H.rot(0)]], 'none');
  H.faceWin(tHit, tL, H.F.SURPRISED, F);
  H.faceWin(tL, tOut, H.F.GRIN, F); H.faceWin(tL, tOut, H.F.GRIN);
  H.cycle(E.lean, [H.rot(-4), { offset: 0.5, ...H.rot(4) }, H.rot(-4)], 300, tL, 3);
  H.cycle(F.lean, [H.rot(-5), { offset: 0.5, ...H.rot(5) }, H.rot(-5)], 300, tL, 3);
  const shake = [H.rot(-40), { offset: 0.5, ...H.rot(-28) }, H.rot(-40)];
  H.cycle(E.armR, shake, 260, tH + 400, 4); H.cycle(F.armR, shake, 260, tH + 400, 4);
  H.play(F.pos, [{ opacity: 1 }, { opacity: 0 }], { duration: 100, delay: total - 100, fill: 'forwards' });
  await H.wait(total + 50);
}

// ── The Joker's prank: taps his shoulder from behind… BOO! ─────────────
async function joker(H) {
  const { st, E } = H, x = H.cur.x;
  const J = H.friend('joker', true);
  const w = st.w, tE = 600, tB = 6200, total = tB + 2600;
  const P = (dx, dy) => H.P(x + dx, st.yF + dy, 1);
  H.track(J.pos, total, [[0, H.P(x, st.yF, 0)], [tE - 20, H.P(x, st.yF, 0)], [tE, P(0, 0), 'ease-out'], [tE + 300, P(0.5 * w, 0)], [tE + 1100, P(0.5 * w, 0), 'ease-in'], [tE + 1300, P(0, 0)],
    [tE + 2100, P(0, 0), 'ease-out'], [tE + 2400, P(-0.5 * w, 0)], [tE + 3200, P(-0.5 * w, 0), 'ease-in'], [tE + 3400, P(0, 0)],
    [tB - 200, P(0, 0), 'ease-out'], [tB, P(0, -0.55 * st.h)], [tB + 1600, P(0, -0.55 * st.h)]]);
  // taps: right side, then left side; the Ace looks, nobody's there
  H.track(J.armL, total, [[0, H.rot(0)], [tE + 300, H.rot(0)], [tE + 450, H.rot(-60)], [tE + 600, H.rot(-40)], [tE + 750, H.rot(-60)], [tE + 900, H.rot(0)]]);
  H.track(J.armR, total, [[0, H.rot(0)], [tE + 2400, H.rot(0)], [tE + 2550, H.rot(60)], [tE + 2700, H.rot(40)], [tE + 2850, H.rot(60)], [tE + 3000, H.rot(0)], [tB - 100, H.rot(0)], [tB, H.rot(-150)], [tB + 1200, H.rot(-150)], [tB + 1400, H.rot(0)]]);
  H.faceWin(tE, tB, ['ew', 'mt'], J);
  H.faceWin(0, tE + 900, ['ec', 'ms']);
  H.notesWin(0, tE + 900);
  H.faceWin(tE + 900, tE + 1600, ['er', 'mu']);
  H.track(E.card, total, [[0, H.ry(0)], [tE + 900, H.ry(0)], [tE + 1100, H.ry(-25)], [tE + 1500, H.ry(-25)], [tE + 1700, H.ry(0)],
    [tE + 2900, H.ry(0)], [tE + 3100, H.ry(25)], [tE + 3500, H.ry(25)], [tE + 3700, H.ry(0)]], 'none');
  H.faceWin(tE + 1600, tE + 2900, ['ew', 'mf']);
  H.faceWin(tE + 2900, tE + 3600, ['el', 'mu']);
  H.faceWin(tE + 3600, tB, ['ez', 'mf']);
  // BOO: the Ace jumps out of his skin, hat flying; the Joker laughs and vanishes
  const jump = 0.7 * st.h, fm = H.fallMs(jump), tI = tB + 300 + fm;
  H.track(E.pos, total, [[0, H.P(x, st.yF)], [tB, H.P(x, st.yF), 'ease-out'], [tB + 300, H.P(x, st.yF - jump), 'ease-in'], [tI, H.P(x, st.yF)]]);
  H.track(E.squash, total, [[0, H.sq(1, 1)], [tB, H.sq(0.9, 1.2)], [tB + 250, H.sq(0.9, 1.15)], [tI - 20, H.sq(0.95, 1.06)], [tI + 60, H.sq(1.2, 0.8)], [tI + 250, H.sq(1, 1)]]);
  H.track(E.armL, total, [[0, H.rot(0)], [tB, H.rot(0)], [tB + 100, H.rot(160)], [tI, H.rot(140)], [tI + 300, H.rot(0)]], 'none');
  H.track(E.armR, total, [[0, H.rot(0)], [tB, H.rot(0)], [tB + 100, H.rot(-160)], [tI, H.rot(-140)], [tI + 300, H.rot(0)]], 'none');
  H.track(E.hat, total, [[0, { transform: 'translate(0px,0px) rotate(0deg)' }], [tB, { transform: 'translate(0px,0px) rotate(0deg)' }], [tB + 300, { transform: 'translate(4px,-40px) rotate(30deg)' }], [tI + 200, { transform: 'translate(0px,0px) rotate(0deg)' }]]);
  H.faceWin(tB, tI + 300, ['es', 'mo']);
  H.faceWin(tI + 300, total, ['ew', 'mf']);
  H.suitWin(tB, tI + 1200, 'H');
  H.faceWin(tB, total, H.F.GRIN, J);
  H.cycle(J.lean, [H.rot(-8), { offset: 0.5, ...H.rot(8) }, H.rot(-8)], 300, tB + 200, 4);
  H.puffAt(x, st.yF - 0.55 * st.h, tB + 1500, 800);
  H.play(J.pos, [{ opacity: 1 }, { opacity: 0 }], { duration: 150, delay: tB + 1650, fill: 'forwards' });
  await H.wait(total + 50);
}

export const SOCIAL = { 'r-table': rTable, 'r-mail': rMail, 'r-bravo': rBravo, duel, joker };
