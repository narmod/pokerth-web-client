// ═══════════════════════════════════════════════════════════════════
// Mascot — extra acts (web extension, narmod 2026-09-28).
//
// Each act is async (H, where) → Promise: H is the engine's toolkit
// (animation helpers, the Ace's parts, faces, props), where holds the
// panels found on screen ({ plan, peek, ledge, hang, rects }). An act starts
// and ends standing on the floor, facing front, unless it sets H.cur.gone
// (he left the screen by himself: the engine skips the exit). The engine
// empties the hand / body prop groups after every act.
// Imported by modules/mascot/engine.mjs.
// ═══════════════════════════════════════════════════════════════════

const U = 1.2;   // base px per SVG unit (the Ace is drawn in a 140 × 190 viewBox at 168 × 228)

/** Direction with the most room (1 = right, -1 = left). */
const roomy = (st, x) => ((st.maxX - x) >= (x - st.minX) ? 1 : -1);
const pop = [{ transform: 'scale(0)', opacity: 0 }, { offset: 0.6, transform: 'scale(1.15)', opacity: 1 }, { transform: 'scale(1)', opacity: 1 }];

// ── Banana peel: he walks along whistling, slips, backflips, lands flat ─
const PEEL = '<path d="M3 15 Q9 3 18 12 Q20 8 22 12 Q31 3 37 15 Q20 21 3 15Z" fill="#f5d547" stroke="#141414" stroke-width="1.6" stroke-linejoin="round"/><path d="M18 12 Q20 10 22 12" fill="none" stroke="#6b4a1a" stroke-width="1.6"/><path d="M8 14 Q12 11 15 13 M25 13 Q28 11 32 14" fill="none" stroke="#c9a92c" stroke-width="1.2"/>';

async function banana(H) {
  const { st, E } = H, k = st.k, x = H.cur.x;
  const D = roomy(st, x), room = D > 0 ? st.maxX - x : x - st.minX;
  const d = Math.min(2.4 * st.w, room);
  if (d < 1.2 * st.w) return H.grim();
  const PS = 1.7, pw = 40 * U * k * PS, ph = 16 * U * k * PS;
  const xs = x + D * d * 0.55;                                // box left when his feet reach the peel
  const peel = H.worldProp(40, 16, PEEL, xs + st.w / 2 - pw / 2, st.floor - ph + 3 * k, false, PS);
  H.play(peel, pop, { duration: 350, delay: 150, fill: 'both' });
  const tw = 600, ws = H.walkMs(st, x, xs), ts = tw + ws;     // ts: he steps on it
  const up = 380, yTop = st.yF - 1.0 * st.h, xl = H.clampX(st, xs + D * 0.9 * st.w);
  const yL = st.floor - 165 * k;                              // box top lying on his back
  const fm = H.fallMs(yL - yTop), ti = ts + up + fm, tUp = ti + 1700, total = tUp + 1500;
  E.lean.style.transformOrigin = '84px 120px';
  H.track(E.pos, total, [[0, H.P(x, st.yF)], [tw, H.P(x, st.yF), 'linear'], [ts, H.P(xs, st.yF), 'ease-out'],
    [ts + up, H.P((xs + xl) / 2, yTop), 'ease-in'], [ti, H.P(xl, yL)], [tUp, H.P(xl, yL), 'ease-out'], [tUp + 400, H.P(xl, st.yF)]]);
  H.track(E.card, total, [[0, H.ry(0)], [tw - 150, H.ry(0)], [tw, H.facing(D)], [ts, H.facing(D)], [ts + 200, H.ry(0)]]);
  H.walkWin(tw, ws);
  H.notesWin(tw, ts - 100);
  // the slip: a full backflip, then flat on his back; he gets up the other way round
  H.track(E.lean, total, [[0, H.rot(0)], [ts, H.rot(0), 'ease-in'], [ti, H.rot(-D * 450)], [tUp, H.rot(-D * 450), 'ease-in-out'], [tUp + 400, H.rot(-D * 360)]]);
  H.track(E.squash, total, [[0, H.sq(1, 1)], [ti - 10, H.sq(1, 1)], [ti + 60, H.sq(1.25, 0.7)], [ti + 250, H.sq(1, 1)]]);
  H.cycle(E.armL, H.FLAIL_L, 220, ts, Math.round((ti - ts) / 220));
  H.cycle(E.armR, H.FLAIL_R, 220, ts, Math.round((ti - ts) / 220));
  H.cycle(E.legL, H.KICK_F, 260, ts, Math.round((ti - ts) / 260));
  H.cycle(E.legR, H.KICK_B, 260, ts, Math.round((ti - ts) / 260));
  H.track(E.hat, total, [[0, { transform: 'translate(0px,0px) rotate(0deg)' }], [ts, { transform: 'translate(0px,0px) rotate(0deg)' }],
    [ts + up, { transform: 'translate(0px,-40px) rotate(200deg)' }], [ti, { transform: 'translate(0px,-8px) rotate(340deg)' }],
    [tUp + 400, { transform: 'translate(0px,0px) rotate(360deg)' }]]);
  H.faceWin(ts - 80, ti, H.F.SURPRISED);
  H.faceWin(ti, tUp + 300, H.F.DIZZY);
  H.fxWin(E.stars, ti + 50, tUp);
  H.track(E.stars, tUp, [[0, { transform: `translate(${D > 0 ? -84 : 56}px,86px)` }], [tUp, { transform: `translate(${D > 0 ? -84 : 56}px,86px)` }]]);
  H.floorFx('dust', xl + st.w / 2, st.floor + 4 * k, ti, 800);
  // the peel shoots away behind him
  H.play(peel, [{ transform: 'translate(0px,0px) rotate(0deg)', opacity: 1 }, { transform: `translate(${-D * 90 * k}px,${-40 * k}px) rotate(${-D * 540}deg)`, opacity: 0 }],
    { duration: 700, delay: ts + 40, fill: 'forwards', easing: 'ease-out' });
  // back on his feet: glares, shakes his fist
  H.faceWin(tUp + 300, total, H.F.ANGRY);
  H.track(E.armR, total, [[0, H.rot(0)], [tUp + 400, H.rot(0)], [tUp + 600, H.rot(-150)], [tUp + 750, H.rot(-130)], [tUp + 900, H.rot(-150)], [tUp + 1050, H.rot(-130)], [tUp + 1300, H.rot(0)]], 'none');
  H.cur.x = xl;
  await H.wait(total + 50);
}

// ── Bluff: hides his cards, side-eyes, shoves all-in… reveals 7-2, runs ─
const CARD_BACK = (x, r) => `<g transform="translate(${x} 0) rotate(${r})"><rect x="-6.5" y="-19" width="13" height="18" rx="2" fill="#b3261e" stroke="#141414" stroke-width="1.2"/><rect x="-4.5" y="-17" width="9" height="14" rx="1" fill="none" stroke="#fbf7ee" stroke-width="1"/></g>`;
const CARD_FACE = (x, r, v, s, c) => `<g transform="translate(${x} 0) rotate(${r})"><rect x="-6.5" y="-19" width="13" height="18" rx="2" fill="#fbf7ee" stroke="#141414" stroke-width="1.2"/><text x="-4" y="-11" fill="${c}" style="font:700 7px Georgia,serif">${v}</text><path transform="translate(1.5 -6) scale(.55)" fill="${c}" d="${s}"/></g>`;
const STACK = (n) => { let s = ''; for (let i = 0; i < n; i++) s += `<ellipse cx="14" cy="${30 - i * 3.4}" rx="12" ry="4" fill="${i % 2 ? '#1f5fbf' : '#b3261e'}" stroke="#141414" stroke-width="1.2"/><path d="M4 ${30 - i * 3.4} L6 ${30 - i * 3.4} M22 ${30 - i * 3.4} L24 ${30 - i * 3.4}" stroke="#fbf7ee" stroke-width="1.6"/>`; return s; };

async function bluff(H) {
  const { st, E } = H, k = st.k, x = H.cur.x;
  const D = roomy(st, x);
  E.hl.innerHTML = `<g transform="translate(17 113) scale(1.4)"><g class="mc-bl-back">${CARD_BACK(-4, -12)}${CARD_BACK(4, 12)}</g>`
    + `<g class="mc-bl-face" opacity="0">${CARD_FACE(-4, -12, '7', H.HEART, '#c62828')}${CARD_FACE(4, 12, '2', H.CLUB, '#141414')}</g></g>`;
  const back = E.hl.querySelector('.mc-bl-back'), face = E.hl.querySelector('.mc-bl-face');
  const tRev = 4700, tRun = 6500;
  H.play(E.hl, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'both' });
  H.track(E.flip, tRun, [[0, { transform: `scaleX(${D})` }], [tRun, { transform: `scaleX(${D})` }]], 'none');
  H.track(E.armL, tRun, [[0, H.rot(0)], [450, H.rot(-80)], [tRev, H.rot(-80)], [tRev + 300, H.rot(-120)], [tRun, H.rot(-120)]], 'none');
  H.faceWin(500, 1100, ['el', 'mf']);
  H.faceWin(1100, 1700, ['er', 'mf']);
  H.faceWin(1700, 2300, ['el', 'ms']);
  H.track(E.card, tRun, [[0, H.ry(0)], [500, H.ry(-14)], [1100, H.ry(14)], [1700, H.ry(-10)], [2300, H.ry(0)]], 'none');
  // his stack, then all-in
  const SS = 1.6, sw = 28 * U * k * SS, sh = 36 * U * k * SS;
  const sx = D > 0 ? x + st.w * 0.86 : x + st.w * 0.14 - sw;
  const stack = H.worldProp(28, 36, STACK(7), sx, st.floor - sh + 2 * k, true, SS);
  H.play(stack, pop, { duration: 350, delay: 2100, fill: 'both' });
  H.bubble('All-in!', 2500, 4200);
  H.track(E.armR, tRun, [[0, H.rot(0)], [2500, H.rot(0)], [2750, H.rot(-35)], [3150, H.rot(-60)], [3500, H.rot(0)]], 'none');
  H.track(E.lean, 3600, [[0, H.rot(0)], [2700, H.rot(0)], [3100, H.rot(9 * D)], [3500, H.rot(0)]], 'none');
  H.play(stack, [{ transform: 'translateX(0px)' }, { transform: `translateX(${D * 46 * k}px)` }], { duration: 450, delay: 2750, fill: 'forwards', easing: 'cubic-bezier(.3,1.2,.5,1)' });
  H.faceWin(2500, 4000, ['gl', 'ms']);                           // shades on, cool
  H.faceWin(4000, tRev, H.F.GRIN);
  // reveal: 7-2 offsuit, the worst hand in poker
  H.play(back, [{ opacity: 1 }, { offset: 0.5, opacity: 1 }, { offset: 0.51, opacity: 0 }, { opacity: 0 }], { duration: 300, delay: tRev, fill: 'forwards' });
  H.play(face, [{ opacity: 0 }, { offset: 0.5, opacity: 0 }, { offset: 0.51, opacity: 1 }, { opacity: 1 }], { duration: 300, delay: tRev, fill: 'forwards' });
  H.faceWin(tRev + 300, tRev + 900, H.F.SURPRISED);
  H.faceWin(tRev + 900, tRun + 200, H.F.TEETH);
  H.suitWin(tRev + 300, tRun + 200, 'D');
  // runs off the screen, dust behind him
  const R = -D, xOff = R > 0 ? st.vw + 20 : -st.w - 20, rm = Math.max(500, Math.abs(xOff - x) / (st.speed * 2.6) * 1000);
  H.track(E.flip, tRun + rm + 100, [[0, { transform: `scaleX(${D})` }], [tRun, { transform: `scaleX(${D})` }], [tRun + 1, { transform: `scaleX(${R})` }], [tRun + rm + 100, { transform: `scaleX(${R})` }]]);
  H.track(E.card, tRun + rm + 100, [[0, H.ry(0)], [tRun, H.ry(0)], [tRun + 120, H.facing(1)]]);
  H.track(E.pos, tRun + rm, [[0, H.P(x, st.yF)], [tRun, H.P(x, st.yF), 'ease-in'], [tRun + rm, H.P(xOff, st.yF)]]);
  H.track(E.lean, tRun + rm, [[0, H.rot(0)], [tRun, H.rot(0)], [tRun + 150, H.rot(12 * R)]]);
  const n = Math.max(2, Math.round(rm / 280));
  H.cycle(E.legL, H.KICK_F, 280, tRun, n); H.cycle(E.legR, H.KICK_B, 280, tRun, n);
  H.cycle(E.armR, H.SWING_F, 280, tRun, n);
  H.track(E.hat, tRun + rm, [[0, { transform: 'translate(0px,0px)' }], [tRun, { transform: 'translate(0px,0px)' }], [tRun + 200, { transform: 'translate(-6px,-10px)' }]]);
  for (let i = 0; i < 3; i++) H.floorFx('dust', x + st.w / 2 + R * i * 60 * k, st.floor + 4 * k, tRun + 80 + i * 160, 600);
  H.cur.gone = true;
  await H.wait(tRun + rm + 150);
}

// ── Sits on the top edge of a window / panel, legs dangling, whistling ─
async function ledge(H, where) {
  const p = where.ledge;
  if (!p) return H.grim();
  const { st, E } = H, k = st.k, x0 = H.cur.x;
  const D = Math.sign(p.x - x0) || 1;
  const tJ = 300, up = 460, apex = p.ySit - 46 * k, down = 300, tL = tJ + up + down;
  H.track(E.squash, tL + 300, [[0, H.sq(1, 1)], [tJ - 40, H.sq(1.12, 0.86)], [tJ + 80, H.sq(0.9, 1.14)], [tJ + up, H.sq(1, 1)], [tL, H.sq(1, 1)], [tL + 80, H.sq(1.1, 0.9)], [tL + 300, H.sq(1, 1)]]);
  H.track(E.armL, tL + 200, [[0, H.rot(0)], [tJ, H.rot(0)], [tJ + 120, H.rot(150)], [tL, H.rot(40)], [tL + 200, H.rot(-18)]]);
  H.track(E.armR, tL + 200, [[0, H.rot(0)], [tJ, H.rot(0)], [tJ + 120, H.rot(-150)], [tL, H.rot(-40)], [tL + 200, H.rot(18)]]);
  const tS = tL + 400, tE = tS + 4600;                      // sitting from tS to tE
  // legs swing, one after the other
  H.cycle(E.legL, [H.rot(-22), { offset: 0.5, ...H.rot(18) }, H.rot(-22)], 900, tS, 5);
  H.cycle(E.legR, [H.rot(18), { offset: 0.5, ...H.rot(-22) }, H.rot(18)], 900, tS, 5);
  H.notesWin(tS + 200, tS + 3200);
  H.faceWin(tS, tS + 3200, ['ec', 'mu']);                   // whistling
  H.faceWin(tS + 3200, tS + 3800, ['el', 'ms']);
  H.faceWin(tS + 3800, tE, ['er', 'mo']);                   // looks down: that's high
  H.track(E.lean, tE, [[0, H.rot(0)], [tS, H.rot(0)], [tS + 800, H.rot(3)], [tS + 1600, H.rot(-3)], [tS + 2400, H.rot(3)], [tS + 3200, H.rot(0)]]);
  // hops down in front of the panel
  const xL = H.clampX(st, p.x + D * 0.35 * st.w), fm = H.fallMs(st.yF - (p.ySit - 26 * k)), tI = tE + 260 + fm, total = tI + 500;
  H.track(E.pos, total, [[0, H.P(x0, st.yF)], [tJ, H.P(x0, st.yF), 'ease-out'], [tJ + up, H.P((x0 + p.x) / 2, Math.min(apex, st.yF - 40 * k)), 'ease-in'], [tL, H.P(p.x, p.ySit)],
    [tE, H.P(p.x, p.ySit), 'ease-out'], [tE + 260, H.P((p.x + xL) / 2, p.ySit - 26 * k), 'ease-in'], [tI, H.P(xL, st.yF)]]);
  H.track(E.squash, total, [[0, H.sq(1, 1)], [tE - 150, H.sq(1, 1)], [tE, H.sq(1.08, 0.9)], [tE + 120, H.sq(0.94, 1.08)], [tI - 20, H.sq(0.95, 1.06)], [tI + 70, H.sq(1.25, 0.76)], [tI + 300, H.sq(1, 1)]]);
  H.track(E.armL, total, [[0, H.rot(0)], [tE, H.rot(-18)], [tE + 150, H.rot(140)], [tI, H.rot(110)], [tI + 300, H.rot(0)]], 'none');
  H.track(E.armR, total, [[0, H.rot(0)], [tE, H.rot(18)], [tE + 150, H.rot(-140)], [tI, H.rot(-110)], [tI + 300, H.rot(0)]], 'none');
  H.faceWin(tE, tI + 200, H.F.SURPRISED);
  H.floorFx('dust', xL + st.w / 2, st.floor + 4 * k, tI, 700);
  H.cur.x = xL;
  await H.wait(total + 50);
}

// ── Hangs from a window's bottom edge, swings, one hand slips… drops ───
async function hang(H, where) {
  const p = where.hang;
  if (!p) return H.grim();
  const { st, E } = H, k = st.k, x0 = H.cur.x;
  const wd = H.walkMs(st, x0, p.x), d = Math.sign(p.x - x0) || 1;
  H.walkWin(0, wd);
  const tJ = wd + 250, up = 420, tG = tJ + up;               // tG: grabs the edge
  const tSl = tG + 3800, tDrop = tSl + 900, fm = H.fallMs(st.yF - p.yHang), tI = tDrop + fm, total = tI + 1800;
  H.track(E.card, total, [[0, H.ry(0)], [120, H.facing(d)], [wd, H.facing(d)], [wd + 200, H.ry(0)]]);
  H.track(E.pos, total, [[0, H.P(x0, st.yF)], [wd, H.P(p.x, st.yF)], [tJ, H.P(p.x, st.yF), 'ease-out'], [tG, H.P(p.x, p.yHang)],
    [tDrop, H.P(p.x, p.yHang), 'ease-in'], [tI, H.P(p.x, st.yF)]]);
  H.track(E.squash, total, [[0, H.sq(1, 1)], [tJ - 200, H.sq(1, 1)], [tJ, H.sq(1.12, 0.86)], [tJ + 100, H.sq(0.9, 1.14)], [tG, H.sq(0.96, 1.06)], [tG + 200, H.sq(1, 1)],
    [tI - 20, H.sq(0.94, 1.08)], [tI + 60, H.sq(1.4, 0.62)], [tI + 350, H.sq(0.96, 1.05)], [tI + 500, H.sq(1, 1)]]);
  H.track(E.armL, total, [[0, H.rot(0)], [tJ, H.rot(0)], [tJ + 150, H.rot(165)], [tDrop, H.rot(165)], [tI, H.rot(120)], [tI + 400, H.rot(0)]]);
  H.track(E.armR, total, [[0, H.rot(0)], [tJ, H.rot(0)], [tJ + 150, H.rot(-165)], [tSl, H.rot(-165)], [tSl + 120, H.rot(-20)], [tI, H.rot(-120)], [tI + 400, H.rot(0)]]);
  // swinging from his hands
  E.lean.style.transformOrigin = '84px 66px';
  H.track(E.lean, total, [[0, H.rot(0)], [tG, H.rot(0)], [tG + 450, H.rot(-14)], [tG + 1150, H.rot(14)], [tG + 1850, H.rot(-12)], [tG + 2550, H.rot(12)], [tG + 3250, H.rot(-6)], [tSl, H.rot(0)],
    [tSl + 200, H.rot(-16)], [tSl + 450, H.rot(-8)], [tSl + 650, H.rot(-13)], [tDrop, H.rot(-10)], [tDrop + 200, H.rot(0)]]);
  H.cycle(E.legL, H.KICK_F, 700, tG, 4); H.cycle(E.legR, H.KICK_B, 700, tG, 4);
  H.faceWin(tG, tSl, H.F.GRIN);
  H.faceWin(tSl, tI, H.F.SURPRISED);
  H.faceWin(tI, tI + 1500, H.F.DIZZY);
  H.fxWin(E.stars, tI + 50, tI + 1500);
  H.track(E.stars, tI + 450, [[0, { transform: 'translate(0px,130px)' }], [tI + 60, { transform: 'translate(0px,130px)' }], [tI + 450, { transform: 'translate(0px,0px)' }]]);
  H.floorFx('dust', p.x + st.w / 2, st.floor + 4 * k, tI, 800);
  H.cur.x = p.x;
  await H.wait(total + 50);
}

// ── Toc toc: knocks on the screen from inside, squashes his face on it ─
const FOG = '<ellipse cx="30" cy="22" rx="28" ry="20" fill="#eef3f8" opacity=".55"/><ellipse cx="22" cy="16" rx="8" ry="5" fill="#fff" opacity=".6"/>';
async function knock(H) {
  const { st, E } = H, k = st.k, x0 = H.cur.x;
  const xc = H.clampX(st, st.vw / 2 - st.w / 2 + (x0 < st.vw / 2 ? -0.3 : 0.3) * st.w);
  const wd = Math.abs(xc - x0) > 0.4 * st.w ? H.walkMs(st, x0, xc) : 0;
  if (wd) H.walkWin(0, wd);
  const x = wd ? xc : x0, S = 1.45, t0 = wd + 200, dy = 18 * k;
  const tK = t0 + 900, tP = tK + 1100, tOff = tP + 1500, tW = tOff + 350, tEnd = tW + 1400, total = tEnd + 700;
  if (wd) H.track(E.card, wd + 200, [[0, H.ry(0)], [120, H.facing(Math.sign(xc - x0))], [wd, H.facing(Math.sign(xc - x0))], [wd + 200, H.ry(0)]]);
  // comes up to the glass
  H.track(E.pos, total, [[0, H.P(x0, st.yF)], [wd, H.P(x, st.yF)], [t0, H.P(x, st.yF), 'ease-in-out'], [t0 + 600, H.P(x, st.yF + dy)],
    [tP, H.P(x, st.yF + dy), 'linear'], [tOff, H.P(x, st.yF + dy + 14 * k), 'ease-out'], [tOff + 120, H.P(x, st.yF + dy)], [tEnd, H.P(x, st.yF + dy), 'ease-in-out'], [tEnd + 500, H.P(x, st.yF)]]);
  H.track(E.squash, total, [[0, H.sq(1, 1)], [t0, H.sq(1, 1), 'ease-in-out'], [t0 + 600, H.sq(S, S)], [tP, H.sq(S, S), 'ease-in'], [tP + 120, H.sq(S * 1.22, S * 1.08)],
    [tOff, H.sq(S * 1.22, S * 1.08), 'cubic-bezier(.3,1.6,.5,1)'], [tOff + 300, H.sq(S, S)], [tEnd, H.sq(S, S), 'ease-in-out'], [tEnd + 500, H.sq(1, 1)]]);
  H.faceWin(t0, tK, ['eo', 'mu']);
  // knock, knock, knock
  const kn = [[0, H.rot(0)], [tK - 250, H.rot(0)], [tK, H.rot(-125)]];
  for (let i = 0; i < 3; i++) { kn.push([tK + 100 + i * 250, H.rot(-104)], [tK + 225 + i * 250, H.rot(-125)]); }
  kn.push([tP - 100, H.rot(-125)], [tP, H.rot(0)]);
  H.track(E.armR, total, kn, 'none');
  const hx = x + (84 + (144 - 84) * S) * k, hy = st.yF + dy + (212 - (212 - 68) * S) * k;
  for (let i = 0; i < 3; i++) {
    const ring = document.createElement('div');
    ring.style.cssText = `position:absolute;left:${hx - 14 * k}px;top:${hy - 14 * k}px;width:${28 * k}px;height:${28 * k}px;border-radius:50%;border:${Math.max(2, 3 * k)}px solid #fff;opacity:0`;
    E.root.appendChild(ring);
    H.play(ring, [{ transform: 'scale(.3)', opacity: 0.95 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 380, delay: tK + 100 + i * 250, fill: 'none' });
  }
  // squashed face on the glass, fog around it, slides down a bit
  H.faceWin(tP, tOff, ['ex', 'mw']);
  H.play(E.cardwrap, [{ transform: 'scale(1,1)' }, { offset: 0.1, transform: 'scale(1.14,.9)' }, { offset: 0.9, transform: 'scale(1.14,.9)' }, { transform: 'scale(1,1)' }], { duration: tOff - tP + 150, delay: tP, fill: 'none' });
  const fcx = x + 84 * k, fcy = st.yF + dy + (212 - (212 - 96) * S * 1.08) * k;
  const fog = H.worldProp(60, 44, FOG, fcx - 36 * k, fcy - 26 * k, true);
  H.play(fog, [{ opacity: 0, transform: 'scale(.6)' }, { offset: 0.1, opacity: 1, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1)' }], { duration: tW - tP, delay: tP + 80, fill: 'forwards' });
  // pops off, wipes the fog away
  H.faceWin(tOff, tW, H.F.SURPRISED);
  H.faceWin(tW, tEnd, ['ew', 'mt']);
  H.cycle(E.armR, [H.rot(-95), { offset: 0.5, ...H.rot(-140) }, H.rot(-95)], 350, tW, 4);
  H.play(fog, [{ opacity: 1 }, { opacity: 0 }], { duration: 1300, delay: tW, fill: 'forwards' });
  H.faceWin(tEnd, total, H.F.GRIN);
  H.cur.x = x;
  await H.wait(total + 50);
}

// ── Tries to push the edge of the screen: slips, gives up, wipes his brow
async function push(H) {
  const { st, E } = H, k = st.k, x0 = H.cur.x;
  const D = x0 + st.w / 2 < st.vw / 2 ? -1 : 1;
  const xE = D > 0 ? st.vw - 162 * k : -6 * k;               // hands flat on the screen's edge
  const wd = H.walkMs(st, x0, xE);
  H.walkWin(0, wd);
  const tP = wd + 250, tG = tP + 3200, total = tG + 2600;
  H.track(E.flip, total, [[0, { transform: `scaleX(${D})` }], [total - 400, { transform: `scaleX(${D})` }], [total - 399, { transform: 'scaleX(1)' }]], 'none');
  H.track(E.card, total, [[0, H.ry(0)], [120, H.facing(1)], [tG + 300, H.facing(1)], [tG + 700, H.ry(0)], [total - 450, H.ry(0)]]);
  // pushing with everything he has
  H.track(E.lean, total, [[0, H.rot(0)], [tP - 100, H.rot(0)], [tP + 250, H.rot(14 * D)], [tG, H.rot(16 * D)], [tG + 300, H.rot(0)]]);
  H.track(E.armR, total, [[0, H.rot(0)], [tP - 150, H.rot(0)], [tP + 150, H.rot(-58)], [tG, H.rot(-58)], [tG + 300, H.rot(0)], [tG + 1600, H.rot(0)], [tG + 1800, H.rot(-60)], [tG + 2100, H.rot(-60)], [tG + 2300, H.rot(0)]]);
  H.track(E.armL, total, [[0, H.rot(0)], [tP - 150, H.rot(0)], [tP + 150, H.rot(-118)], [tG, H.rot(-118)], [tG + 300, H.rot(0)], [tG + 500, H.rot(150)], [tG + 1300, H.rot(150)], [tG + 1500, H.rot(0)], [tG + 1800, H.rot(60)], [tG + 2100, H.rot(60)], [tG + 2300, H.rot(0)]]);
  const n = Math.round((tG - tP) / 200);
  H.cycle(E.legL, H.KICK_B, 200, tP, n); H.cycle(E.legR, H.KICK_F, 200, tP, n);
  for (let i = 0; i < 5; i++) H.floorFx('dust', xE + (D > 0 ? 30 : 138) * k, st.floor + 4 * k, tP + 300 + i * 560, 450);
  H.faceWin(tP, tG, ['ec', 'mg', 'fl']);
  H.play(E.cardwrap, [{ transform: 'translateX(0px)' }, { offset: 0.25, transform: 'translateX(-1px)' }, { offset: 0.75, transform: 'translateX(1px)' }, { transform: 'translateX(0px)' }], { duration: 80, delay: tP + 200, iterations: Math.floor((tG - tP - 300) / 80), fill: 'none' });
  // gives up: puffs, wipes his brow (a drop of sweat), shrugs
  H.faceWin(tG, tG + 1600, ['ez', 'et', 'mo']);
  H.faceWin(tG + 1600, total, H.F.TEETH);
  H.track(E.squash, total, [[0, H.sq(1, 1)], [tG + 300, H.sq(1, 1)], [tG + 500, H.sq(1.04, 0.95)], [tG + 800, H.sq(1, 1)], [tG + 1100, H.sq(1.04, 0.95)], [tG + 1400, H.sq(1, 1)]]);
  H.cur.x = H.clampX(st, xE);
  H.track(E.pos, total, [[0, H.P(x0, st.yF)], [wd, H.P(xE, st.yF)], [tG + 2300, H.P(xE, st.yF), 'ease-in-out'], [total - 100, H.P(H.cur.x, st.yF)]]);
  await H.wait(total + 50);
}

export const EXTRA = { banana, bluff, ledge, hang, knock, push };
