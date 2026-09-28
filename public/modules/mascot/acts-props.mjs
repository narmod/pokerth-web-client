// ═══════════════════════════════════════════════════════════════════
// Mascot — acts with props (web extension, narmod 2026-09-28): the dealer,
// the chip tower, the lonely felt, the rain cloud, the selfie, soap bubbles,
// the guitar and the dance. Same contract as modules/mascot/acts-extra.mjs:
// async (H, where), start and end standing, facing front.
// Imported by modules/mascot/engine.mjs.
// ═══════════════════════════════════════════════════════════════════

const U = 1.2;   // base px per SVG unit
const roomy = (st, x) => ((st.maxX - x) >= (x - st.minX) ? 1 : -1);
const pop = [{ transform: 'scale(0)', opacity: 0 }, { offset: 0.6, transform: 'scale(1.15)', opacity: 1 }, { transform: 'scale(1)', opacity: 1 }];
const show = (on) => [{ opacity: on }, { opacity: on }];
const fadeIn = [{ opacity: 0 }, { opacity: 1 }];

/** Hand centre (SVG units) for an arm rotated by deg. */
function hand(side, deg) {
  const a = deg * Math.PI / 180, [sx, sy, vx, vy] = side === 'L' ? [36, 84, -19, 29] : [104, 84, 19, 29];
  return [sx + vx * Math.cos(a) - vy * Math.sin(a), sy + vx * Math.sin(a) + vy * Math.cos(a)];
}
const cardRect = (cls, x, y, r = 0) => `<g class="${cls}" transform="translate(${x} ${y}) rotate(${r})"><rect x="-4.5" y="-6.5" width="9" height="13" rx="1.4" fill="#b3261e" stroke="#141414" stroke-width=".9"/><rect x="-3" y="-5" width="6" height="10" rx=".8" fill="none" stroke="#fbf7ee" stroke-width=".7"/></g>`;
const cardSvg = '<rect x="1" y="1" width="12" height="17" rx="2" fill="#fbf7ee" stroke="#141414" stroke-width="1"/><rect x="3" y="3" width="8" height="13" rx="1" fill="#b3261e"/>';

// ── The dealer: riffles, cascades, fans the deck… and fumbles it ───────
async function dealer(H) {
  const { st, E } = H, k = st.k, x = H.cur.x;
  const aL = -70, aR = 70, hL = hand('L', aL), hR = hand('R', aR);
  let html = `<g class="dk-halves" style="opacity:0">${cardRect('', hL[0], hL[1] - 2)}${cardRect('', hL[0] + .8, hL[1] - 3.2)}${cardRect('', hR[0], hR[1] - 2)}${cardRect('', hR[0] - .8, hR[1] - 3.2)}</g>`;
  for (let i = 0; i < 20; i++) html += cardRect('dk-fly', 0, 0);
  E.bodyp.innerHTML = html;
  const halves = E.bodyp.querySelector('.dk-halves'), fly = E.bodyp.querySelectorAll('.dk-fly');
  fly.forEach((c) => { c.style.opacity = '0'; });
  const arc = (a, b, apex, n = 7) => {
    const f = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, px = a[0] + (b[0] - a[0]) * u, py = a[1] + (b[1] - a[1]) * u - 4 * (a[1] - apex) * u * (1 - u);
      f.push({ offset: u, transform: `translate(${px}px,${py}px) rotate(${(b[0] > a[0] ? 1 : -1) * 200 * u}deg)`, opacity: 1 });
    }
    return f;
  };
  H.track(E.armL, 7000, [[0, H.rot(0)], [400, H.rot(aL)], [3500, H.rot(aL)], [3800, H.rot(-20)], [5600, H.rot(-20)], [5900, H.rot(0)]]);
  H.track(E.armR, 7000, [[0, H.rot(0)], [400, H.rot(aR)], [3500, H.rot(aR)], [3800, H.rot(-150)], [5500, H.rot(-150)], [5800, H.rot(0)]]);
  H.play(halves, [{ opacity: 0 }, { offset: 0.1, opacity: 1 }, { offset: 0.95, opacity: 1 }, { opacity: 0 }], { duration: 3200, delay: 350, fill: 'none' });
  // riffle: short hops from the left half to the right one, then a high cascade back
  fly.forEach((c, i) => {
    if (i < 10) H.play(c, arc(hL, hR, 100), { duration: 280, delay: 600 + i * 110, fill: 'none' });
    else H.play(c, arc(hR, hL, 38, 9), { duration: 460, delay: 2000 + (i - 10) * 95, fill: 'none' });
  });
  H.faceWin(500, 2000, H.F.FOCUS);
  H.faceWin(2000, 3500, H.F.GRIN);
  H.cycle(E.bob, H.HOP, 300, 600, 10);
  // the fan, held high in his right hand (pre-rotated so it stands upright)
  let fan = '<g class="dk-fan" transform="rotate(150 123 113)" style="opacity:0">';
  for (let i = 0; i < 7; i++) fan += `<g class="dk-fc" transform="rotate(${-45 + i * 15} 123 113)">${cardRect('', 123, 99)}</g>`;
  E.hr.innerHTML = fan + '</g>';
  const fanG = E.hr.querySelector('.dk-fan');
  H.play(fanG, fadeIn, { duration: 300, delay: 3800, fill: 'forwards' });
  H.faceWin(3800, 4900, ['ec', 'ms']);
  H.track(E.lean, 7000, [[0, H.rot(0)], [3800, H.rot(0)], [4200, H.rot(-5)], [4800, H.rot(-5)], [4950, H.rot(4)], [5200, H.rot(0)]]);
  // fumble: the whole deck flies everywhere and rains down around him
  H.play(fanG, [{ opacity: 1 }, { opacity: 0 }], { duration: 120, delay: 4900, fill: 'forwards' });
  const cx = x + 84 * k, top = st.yF + 40 * k;
  for (let i = 0; i < 9; i++) {
    const el = H.worldProp(14, 19, cardSvg, cx, top, true, 1.2);
    const dx = (i - 4) * 22 * k + (i % 2 ? 6 : -6) * k, up = (60 + (i % 3) * 25) * k, land = st.floor - 14 * k - top;
    el.style.opacity = '0';
    H.play(el, [{ transform: 'translate(0px,0px) rotate(0deg)', opacity: 1, easing: 'ease-out' },
      { offset: 0.35, transform: `translate(${dx * 0.6}px,${-up}px) rotate(${(i - 4) * 90}deg)`, opacity: 1, easing: 'ease-in' },
      { offset: 0.8, transform: `translate(${dx}px,${land}px) rotate(${(i - 4) * 160 + 90}deg)`, opacity: 1 },
      { transform: `translate(${dx}px,${land}px) rotate(${(i - 4) * 160 + 90}deg)`, opacity: 0 }], { duration: 2200, delay: 4900 + i * 30, fill: 'none' });
  }
  H.faceWin(4900, 5700, H.F.SURPRISED);
  H.faceWin(5700, 6800, H.F.TEETH);
  H.track(E.squash, 7000, [[0, H.sq(1, 1)], [4900, H.sq(1, 1)], [5000, H.sq(0.92, 1.1)], [5250, H.sq(1, 1)], [6000, H.sq(1, 1)], [6200, H.sq(1.05, 0.95)], [6400, H.sq(1, 1)]]);
  await H.wait(7050);
}

// ── The chip tower: stacks chip after chip… it sways, and falls on him ─
const CHIPK = (i) => `<g class="ck" style="opacity:0"><ellipse cx="15" cy="${104 - i * 7}" rx="12" ry="4.2" fill="${['#b3261e', '#1f5fbf', '#2e7d32', '#f5c518'][i % 4]}" stroke="#141414" stroke-width="1.2"/><path d="M5 ${104 - i * 7} L7.5 ${104 - i * 7} M22.5 ${104 - i * 7} L25 ${104 - i * 7} M14 ${100.2 - i * 7} L16 ${100.2 - i * 7}" stroke="#fbf7ee" stroke-width="1.8"/></g>`;
async function tower(H) {
  const { st, E } = H, k = st.k, x = H.cur.x;
  const D = roomy(st, x), s = 1.3, N = 12, sw = 30 * U * k * s, sh = 110 * U * k * s;
  const sx = D > 0 ? x + st.w * 0.82 : x + st.w * 0.18 - sw;
  let inner = '';
  for (let i = 0; i < N; i++) inner += CHIPK(i);
  const box = H.worldProp(30, 110, inner, sx, st.floor - sh + 3 * k, true, s);
  const chips = box.querySelectorAll('.ck');
  const t0 = 500, dt = 400, tB = t0 + N * dt, tC = tB + 1600, total = tC + 2600;
  H.track(E.flip, total, [[0, { transform: `scaleX(${D})` }], [total, { transform: `scaleX(${D})` }]], 'none');
  const reach = [[0, H.rot(0)]];
  chips.forEach((c, i) => {
    const t = t0 + i * dt;
    reach.push([t - 150, H.rot(-20 - Math.min(i, 9) * 9)], [t, H.rot(-40 - Math.min(i, 9) * 9)], [t + 200, H.rot(-10)]);
    H.play(c, [{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'translateY(0px)' }], { duration: 180, delay: t, fill: 'forwards', easing: 'ease-in' });
  });
  reach.push([tB + 200, H.rot(0)]);
  H.track(E.armR, total, reach, 'none');
  H.faceWin(t0, tB, H.F.FOCUS);
  // it sways more and more
  box.style.transformOrigin = '50% 100%';
  H.play(box, [{ transform: 'rotate(0deg)' }, { offset: 0.15, transform: 'rotate(3deg)' }, { offset: 0.35, transform: 'rotate(-5deg)' }, { offset: 0.6, transform: 'rotate(8deg)' }, { offset: 0.85, transform: 'rotate(-11deg)' }, { transform: `rotate(${-D * 14}deg)` }],
    { duration: tC - tB, delay: tB, fill: 'forwards', easing: 'ease-in-out' });
  H.faceWin(tB, tB + 800, ['el', 'mu']);
  H.faceWin(tB + 800, tC, ['er', 'mu']);
  H.track(E.lean, total, [[0, H.rot(0)], [tB, H.rot(0)], [tB + 400, H.rot(-4)], [tB + 1200, H.rot(4)], [tC, H.rot(-6)], [tC + 150, H.rot(0)]]);
  // collapse: the chips rain on him
  chips.forEach((c, i) => {
    const dx = -D * (6 + (i % 5) * 7 + i * 1.2), dy = i * 7 + (i % 3) * 2;
    H.play(c, [{ transform: 'translate(0px,0px) rotate(0deg)', easing: 'ease-in' }, { offset: 0.75, transform: `translate(${dx}px,${dy}px) rotate(${(i % 2 ? 1 : -1) * (120 + i * 20)}deg)` },
      { transform: `translate(${dx * 1.1}px,${dy}px) rotate(${(i % 2 ? 1 : -1) * (150 + i * 20)}deg)` }], { duration: 520, delay: tC + (N - i) * 25, fill: 'forwards' });
  });
  H.play(box, [{ transform: `rotate(${-D * 14}deg)` }, { transform: 'rotate(0deg)' }], { duration: 200, delay: tC + 100, fill: 'forwards' });
  const tH = tC + 380;
  H.faceWin(tC, tH, H.F.SURPRISED);
  H.faceWin(tH, tH + 1600, H.F.DIZZY);
  H.faceWin(tH + 1600, total, H.F.TEETH);
  H.track(E.squash, total, [[0, H.sq(1, 1)], [tH - 20, H.sq(1, 1)], [tH + 60, H.sq(1.45, 0.55)], [tH + 1300, H.sq(1.42, 0.57)], [tH + 1550, H.sq(0.9, 1.12)], [tH + 1750, H.sq(1, 1)]]);
  H.fxWin(E.stars, tH + 50, tH + 1500);
  H.track(E.stars, tH + 1650, [[0, { transform: 'translate(0px,100px)' }], [tH + 1300, { transform: 'translate(0px,100px)' }], [tH + 1650, { transform: 'translate(0px,0px)' }]]);
  H.play(box, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: total - 600, fill: 'forwards' });
  await H.wait(total + 50);
}

// ── The lonely felt: rolls out a green mat, sits, waits… nobody comes ─
const FELT = '<rect x="1" y="2" width="98" height="10" rx="5" fill="#1f6b3a" stroke="#c9a227" stroke-width="1.6"/><path d="M8 7 L92 7" stroke="#2f8a4e" stroke-width="1.2" stroke-dasharray="3 3"/>'
  + '<g class="fl-deal" style="opacity:0"><rect x="30" y="-1" width="8" height="11" rx="1.3" fill="#b3261e" stroke="#141414" stroke-width=".8" transform="rotate(-8 34 5)"/><rect x="40" y="-1" width="8" height="11" rx="1.3" fill="#b3261e" stroke="#141414" stroke-width=".8" transform="rotate(7 44 5)"/><ellipse cx="64" cy="6" rx="6" ry="2.4" fill="#f5c518" stroke="#141414" stroke-width=".9"/><ellipse cx="64" cy="4.4" rx="6" ry="2.4" fill="#1f5fbf" stroke="#141414" stroke-width=".9"/></g>';
async function felt(H) {
  const { st, E } = H, k = st.k, x = H.cur.x, s = 1.25;
  const fw = 100 * U * k * s, fh = 14 * U * k * s;
  const mat = H.worldProp(100, 14, FELT, x + st.w / 2 - fw / 2, st.floor - fh + 4 * k, true, s);
  mat.style.transformOrigin = '0% 50%';
  const deal = mat.querySelector('.fl-deal');
  const tS = 1600, tU = 5600, total = 7000;
  H.track(E.squash, total, [[0, H.sq(1, 1)], [200, H.sq(1.06, 0.9)], [900, H.sq(1.06, 0.9)], [1100, H.sq(1, 1)]]);
  H.play(mat, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 650, delay: 350, fill: 'both', easing: 'cubic-bezier(.3,1.2,.5,1)' });
  H.play(deal, fadeIn, { duration: 250, delay: 1150, fill: 'forwards' });
  // sits down behind it
  H.track(E.pos, total, [[0, H.P(x, st.yF)], [tS, H.P(x, st.yF), EIO()], [tS + 350, H.P(x, st.yF + 30 * k)], [tU, H.P(x, st.yF + 30 * k), 'ease-out'], [tU + 300, H.P(x, st.yF)]]);
  H.track(E.legL, total, [[0, H.rot(0)], [tS, H.rot(0)], [tS + 350, H.rot(68)], [tU, H.rot(68)], [tU + 300, H.rot(0)]]);
  H.track(E.legR, total, [[0, H.rot(0)], [tS, H.rot(0)], [tS + 350, H.rot(-68)], [tU, H.rot(-68)], [tU + 300, H.rot(0)]]);
  H.cycle(E.legR, [H.rot(-68), { offset: 0.5, ...H.rot(-58) }, H.rot(-68)], 420, tS + 500, 7);   // taps his foot
  H.cycle(E.armR, [H.rot(40), { offset: 0.5, ...H.rot(30) }, H.rot(40)], 210, tS + 600, 12);      // drums his fingers
  H.faceWin(tS + 400, tS + 1100, ['el', 'ms']);
  H.faceWin(tS + 1100, tS + 1800, ['er', 'ms']);
  H.faceWin(tS + 1800, tS + 3000, ['eo', 'mu']);
  H.bubble(H.tr('mascotAnyone', 'Anyone?'), tS + 1900, tS + 3300);
  H.faceWin(tS + 3000, tU, ['ez', 'mf']);   // sigh…
  H.track(E.squash, total, [[0, H.sq(1, 1)], [tS + 3100, H.sq(1, 1)], [tS + 3400, H.sq(1.03, 1.05)], [tS + 3900, H.sq(1.06, 0.92)], [tS + 4300, H.sq(1, 1)]]);
  // stands up and rolls it back up
  H.play(deal, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: tU + 250, fill: 'forwards' });
  H.play(mat, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 500, delay: tU + 500, fill: 'forwards', easing: 'ease-in' });
  H.faceWin(tU, total, H.F.TEETH);
  await H.wait(total + 50);
}
function EIO() { return 'ease-in-out'; }

// ── The rain cloud: follows him everywhere; the umbrella… sends it next door
const CLOUD = '<path d="M12 30 Q2 30 4 21 Q6 13 15 15 Q17 4 30 5 Q40 2 45 11 Q56 8 60 17 Q70 19 66 28 Q64 31 58 30Z" fill="#8f9aab" stroke="#4b5566" stroke-width="1.6"/><path d="M16 26 Q24 29 34 26" fill="none" stroke="#6f7a8b" stroke-width="1.2"/>'
  + '<g class="cl-rain">' + [10, 18, 26, 34, 42, 50, 58].map((cx, i) => `<path class="cl-d" d="M${cx} 33 L${cx - 2} 40" stroke="#6ec6ff" stroke-width="2" stroke-linecap="round" style="opacity:0"/>`).join('') + '</g>';
const UMB = '<g class="mc-umb" transform="rotate(150 123 113)"><path d="M123 113 L123 52" stroke="#141414" stroke-width="2.4"/><path d="M123 113 Q123 121 117 121" fill="none" stroke="#141414" stroke-width="2.4" stroke-linecap="round"/>'
  + '<path class="mc-umb-c" d="M87 57 Q123 18 159 57 Q150 51 141 57 Q132 51 123 57 Q114 51 105 57 Q96 51 87 57Z" fill="#2a6fdb" stroke="#141414" stroke-width="1.6" stroke-linejoin="round"/></g>';
async function umbrella(H) {
  const { st, E } = H, k = st.k, x0 = H.cur.x, s = 1.25;
  const D = roomy(st, x0), x1 = H.clampX(st, x0 + D * 0.9 * st.w);
  const cw = 70 * U * k * s, ch = 42 * U * k * s;
  const cy = st.yF - ch + 6 * k, cx = (x) => x + st.w / 2 - cw / 2;
  const cloud = H.worldProp(70, 42, CLOUD, cx(x0), cy, true, s);
  const drops = cloud.querySelectorAll('.cl-d');
  const rain = (t0, t1) => drops.forEach((d, i) => H.play(d, [{ transform: 'translateY(0px)', opacity: 0.9 }, { transform: 'translateY(34px)', opacity: 0 }],
    { duration: 450, delay: t0 + i * 64, iterations: Math.max(1, Math.floor((t1 - t0) / 450)), fill: 'none' }));
  const dxAside = -D * 1.05 * st.w;
  const T = { pop: 150, r1: 700, r1e: 2500, walk: 2600, r2: 3900, r2e: 5300, umb: 5300, open: 5700, aside: 6500, r3: 7300, r3e: 8800, close: 8900, back: 9400, r4: 10000, r4e: 11200, bye: 11300 };
  const wd = H.walkMs(st, x0, x1), total = T.bye + 900;
  H.play(cloud, pop, { duration: 400, delay: T.pop, fill: 'both' });
  const cxs = (x) => x - x0;   // cloud offsets in px from its first spot
  H.track(cloud, total, [[0, { transform: 'translate(0px,0px)' }], [T.walk + 400, { transform: 'translate(0px,0px)' }, 'ease-in-out'], [T.walk + 400 + wd, { transform: `translate(${cxs(x1)}px,0px)` }],
    [T.aside, { transform: `translate(${cxs(x1)}px,0px)` }, 'ease-in-out'], [T.aside + 700, { transform: `translate(${cxs(x1) + dxAside}px,0px)` }],
    [T.back, { transform: `translate(${cxs(x1) + dxAside}px,0px)` }, 'ease-in-out'], [T.back + 500, { transform: `translate(${cxs(x1)}px,0px)` }],
    [T.bye, { transform: `translate(${cxs(x1)}px,0px)`, opacity: 1 }], [T.bye + 500, { transform: `translate(${cxs(x1)}px,-30px) scale(.4)`, opacity: 0 }]]);
  rain(T.r1, T.r1e); rain(T.r2, T.r2e); rain(T.r3, T.r3e); rain(T.r4, T.r4e);
  H.faceWin(T.r1, T.r1 + 600, H.F.SURPRISED);
  H.faceWin(T.r1 + 600, T.walk, ['ew', 'mf']);
  // steps aside… the cloud follows
  H.track(E.pos, total, [[0, H.P(x0, st.yF)], [T.walk, H.P(x0, st.yF)], [T.walk + wd, H.P(x1, st.yF)]]);
  H.track(E.card, total, [[0, H.ry(0)], [T.walk, H.ry(0)], [T.walk + 120, H.facing(D)], [T.walk + wd, H.facing(D)], [T.walk + wd + 250, H.ry(0)]]);
  H.walkWin(T.walk, wd);
  H.faceWin(T.walk + wd, T.r2, ['ec', 'ms']);
  H.faceWin(T.r2, T.umb, H.F.CRY);
  // umbrella out
  E.hr.innerHTML = UMB;
  const umb = E.hr.querySelector('.mc-umb'), can = E.hr.querySelector('.mc-umb-c');
  can.style.transformBox = 'fill-box'; can.style.transformOrigin = '50% 100%';
  H.play(umb, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: T.umb, fill: 'both' });
  H.play(can, [{ transform: 'scaleX(.08)' }, { offset: 0.99, transform: 'scaleX(.08)' }, { transform: 'scaleX(.08)' }], { duration: T.open - T.umb, delay: T.umb, fill: 'none' });
  H.play(can, [{ transform: 'scaleX(.08)' }, { offset: 0.7, transform: 'scaleX(1.08)' }, { transform: 'scaleX(1)' }], { duration: 300, delay: T.open, fill: 'none' });
  H.play(can, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(1)' }], { duration: T.close - T.open - 300, delay: T.open + 300, fill: 'none' });
  H.play(can, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(.08)' }], { duration: 250, delay: T.close, fill: 'none' });
  H.play(umb, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: T.close + 250, fill: 'forwards' });
  H.track(E.armR, total, [[0, H.rot(0)], [T.umb, H.rot(0)], [T.umb + 300, H.rot(-150)], [T.close + 250, H.rot(-150)], [T.close + 450, H.rot(0)]]);
  H.faceWin(T.open, T.aside, ['ec', 'ms']);                         // smug
  H.faceWin(T.aside + 600, T.r3 + 900, ['el', 'mu']);               // …it rains over THERE now
  H.faceWin(T.r3 + 900, T.close, ['ez', 'mf']);
  H.faceWin(T.close, T.r4, ['eo', 'ms']);
  H.faceWin(T.r4, total, H.F.CRY);                                  // and back on him
  H.track(E.squash, total, [[0, H.sq(1, 1)], [T.r4 + 200, H.sq(1, 1)], [T.r4 + 500, H.sq(1.05, 0.93)], [T.r4e, H.sq(1.05, 0.93)], [T.bye, H.sq(1, 1)]]);
  H.cur.x = x1;
  await H.wait(total + 50);
}

// ── Selfie: poses, « Cheese! », the flash dazzles him ─────────────────
const PHONE = '<g transform="rotate(120 123 113)"><rect x="116" y="95" width="14" height="23" rx="2.6" fill="#263040" stroke="#141414" stroke-width="1.3"/><circle cx="120" cy="99" r="1.6" fill="#8fb4ff"/><rect x="121" y="115" width="4" height="1" rx=".5" fill="#6b7890"/></g>';
async function selfie(H) {
  const { st, E } = H, k = st.k, x = H.cur.x;
  E.hr.innerHTML = PHONE;
  const total = 6200, tF = 3150;
  H.play(E.hr, fadeIn, { duration: 200, delay: 300, fill: 'both' });
  H.track(E.armR, total, [[0, H.rot(0)], [450, H.rot(-120)], [4700, H.rot(-120)], [5000, H.rot(75)], [5900, H.rot(75)], [6150, H.rot(0)]]);
  H.track(E.armL, total, [[0, H.rot(0)], [1400, H.rot(0)], [1600, H.rot(150)], [2200, H.rot(150)], [2400, H.rot(-40)], [3000, H.rot(-40)], [3300, H.rot(0)]]);
  H.track(E.lean, total, [[0, H.rot(0)], [600, H.rot(6)], [1400, H.rot(6)], [1600, H.rot(-7)], [2200, H.rot(-7)], [2400, H.rot(0)]]);
  H.faceWin(600, 1400, H.F.GRIN);
  H.faceWin(1400, 2200, ['ew', 'mt']);
  H.faceWin(2200, tF, H.F.TEETH);
  H.bubble(H.tr('mascotCheese', 'Cheese!'), 2250, 3250);
  // the flash
  const [hx, hy] = hand('R', -120);
  const fx = x + hx * U * k, fy = st.yF + hy * U * k, r = 0.9 * st.h;
  const flash = document.createElement('div');
  flash.style.cssText = `position:absolute;left:${fx - r}px;top:${fy - r}px;width:${2 * r}px;height:${2 * r}px;border-radius:50%;background:radial-gradient(circle,#fff 0%,rgba(255,255,255,.85) 35%,rgba(255,255,255,0) 70%);opacity:0`;
  E.root.appendChild(flash);
  H.play(flash, [{ opacity: 0, transform: 'scale(.3)' }, { offset: 0.25, opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.3)' }], { duration: 450, delay: tF, fill: 'none' });
  H.track(E.squash, total, [[0, H.sq(1, 1)], [tF, H.sq(1, 1)], [tF + 80, H.sq(0.92, 1.1)], [tF + 300, H.sq(1, 1)]]);
  H.faceWin(tF, 4700, ['ex', 'mw']);
  H.fxWin(E.spark, tF + 150, 4600);
  H.track(E.lean, total, [[0, H.rot(0)], [tF + 200, H.rot(0)], [tF + 500, H.rot(-6)], [tF + 900, H.rot(5)], [tF + 1300, H.rot(-4)], [tF + 1700, H.rot(0)]], 'none');
  // looks at the photo and laughs
  H.faceWin(4900, total, H.F.GRIN);
  H.cycle(E.bob, H.HOP, 240, 5100, 4);
  await H.wait(total + 50);
}

// ── Soap bubbles: blows a few, then a big one carries him away… pop ───
async function bubbles(H) {
  const { st, E } = H, k = st.k, x = H.cur.x;
  E.hr.innerHTML = '<g transform="rotate(-100 123 113)"><path d="M123 113 L123 100" stroke="#f5c518" stroke-width="2.2" stroke-linecap="round"/><circle cx="123" cy="95" r="5" fill="rgba(180,220,255,.35)" stroke="#f5c518" stroke-width="2"/></g>';
  const total0 = 2700;
  H.track(E.armR, 9000, [[0, H.rot(0)], [350, H.rot(100)], [3000, H.rot(100)], [3300, H.rot(0)]]);
  H.faceWin(400, 3700, ['eo', 'mu']);
  const mx = x + 84 * k, my = st.yF + 104 * k;
  const bubbleEl = (r) => {
    const b = document.createElement('div');
    b.style.cssText = `position:absolute;left:${-r}px;top:${-r}px;width:${2 * r}px;height:${2 * r}px;border-radius:50%;border:1.5px solid rgba(255,255,255,.8);background:radial-gradient(circle at 32% 30%,rgba(255,255,255,.75) 0 10%,rgba(170,220,255,.18) 30%,rgba(210,160,255,.22) 75%,rgba(255,255,255,.45));opacity:0`;
    E.root.appendChild(b);
    return b;
  };
  for (let i = 0; i < 8; i++) {
    const r = (5 + (i % 3) * 3) * k * 1.4, b = bubbleEl(r), dx = (i % 2 ? 1 : -1) * (20 + i * 9) * k, dy = (90 + i * 12) * k;
    H.play(b, [{ transform: `translate(${mx}px,${my}px) scale(.2)`, opacity: 1 }, { offset: 0.9, transform: `translate(${mx + dx}px,${my - dy}px) scale(1)`, opacity: 1 },
      { transform: `translate(${mx + dx}px,${my - dy}px) scale(1.5)`, opacity: 0 }], { duration: 1500, delay: 500 + i * 260, fill: 'none', easing: 'ease-out' });
  }
  // the big one: grows around him and lifts him up
  const R = 0.62 * st.h, bx = x + st.w / 2, by = st.yF + 0.52 * st.h;
  const big = bubbleEl(R), tG = 3000, tL = 3900, rise = Math.min(1.3 * st.h, st.yF - 40), tP = 7000;
  const fm = H.fallMs(rise), tI = tP + fm, total = tI + 1600;
  H.track(big, tP + 200, [[0, { transform: `translate(${mx}px,${my}px) scale(.05)`, opacity: 0 }], [tG, { transform: `translate(${mx}px,${my}px) scale(.05)`, opacity: 1 }, 'ease-out'],
    [tL, { transform: `translate(${bx}px,${by}px) scale(1)`, opacity: 1 }, 'ease-in-out'], [tL + 800, { transform: `translate(${bx}px,${by - 0.2 * rise}px) scale(1)`, opacity: 1 }],
    [tL + 1700, { transform: `translate(${bx + 10 * k}px,${by - 0.65 * rise}px) scale(1)`, opacity: 1 }], [tP, { transform: `translate(${bx - 8 * k}px,${by - rise}px) scale(1)`, opacity: 1 }],
    [tP + 150, { transform: `translate(${bx - 8 * k}px,${by - rise}px) scale(1.25)`, opacity: 0 }]], 'forwards');
  H.track(E.pos, total, [[0, H.P(x, st.yF)], [tL, H.P(x, st.yF), 'ease-in-out'], [tL + 800, H.P(x, st.yF - 0.2 * rise)], [tL + 1700, H.P(x + 10 * k, st.yF - 0.65 * rise)],
    [tP, H.P(x - 8 * k, st.yF - rise), 'cubic-bezier(.55,0,1,.45)'], [tI, H.P(x, st.yF)]]);
  H.track(E.lean, total, [[0, H.rot(0)], [tL, H.rot(0)], [tL + 900, H.rot(6)], [tL + 1900, H.rot(-6)], [tP, H.rot(3)], [tI, H.rot(0)]]);
  H.cycle(E.legL, [H.rot(10), { offset: 0.5, ...H.rot(-8) }, H.rot(10)], 900, tL, 3);
  H.cycle(E.legR, [H.rot(-10), { offset: 0.5, ...H.rot(8) }, H.rot(-10)], 900, tL, 3);
  H.faceWin(tG + 300, tL + 300, H.F.SURPRISED);
  H.faceWin(tL + 300, tP, H.F.LOVE);
  H.suitWin(tL + 300, tP, 'H');
  H.faceWin(tP, tI + 100, H.F.SURPRISED);
  H.fxWin(E.spark, tP, tP + 500);
  H.cycle(E.armL, H.FLAIL_L, 220, tP, Math.max(1, Math.round(fm / 220)));
  H.cycle(E.armR, H.FLAIL_R, 220, tP, Math.max(1, Math.round(fm / 220)));
  H.track(E.squash, total, [[0, H.sq(1, 1)], [tI - 20, H.sq(0.94, 1.08)], [tI + 70, H.sq(1.45, 0.58)], [tI + 900, H.sq(1.4, 0.6)], [tI + 1150, H.sq(0.92, 1.1)], [tI + 1350, H.sq(1, 1)]]);
  H.faceWin(tI + 100, total, H.F.DIZZY);
  H.floorFx('dust', x + st.w / 2, st.floor + 4 * k, tI, 700);
  void total0;
  await H.wait(total + 50);
}

// ── Guitar: strums along, notes fly… until a string snaps ─────────────
const GUITAR = '<g class="gt"><path d="M80 116 L24 110" stroke="#6b3d22" stroke-width="4.2" stroke-linecap="round"/><path d="M24 110 L16 108" stroke="#3b2412" stroke-width="5" stroke-linecap="round"/>'
  + '<circle cx="84" cy="119" r="10.5" fill="#d9822b" stroke="#141414" stroke-width="1.4"/><circle cx="97" cy="127" r="13" fill="#d9822b" stroke="#141414" stroke-width="1.4"/><circle cx="90" cy="123" r="4" fill="#3b2412"/>'
  + '<path d="M104 130 L24 110.5 M104 131.5 L24 111.5" stroke="#f4e6c8" stroke-width=".6"/><rect x="100" y="126" width="6" height="3" rx="1" fill="#3b2412" transform="rotate(14 103 127)"/>'
  + '<path class="gt-snap" d="M24 110 q6 -8 12 0 q6 8 12 0 q6 -8 12 0" fill="none" stroke="#f4e6c8" stroke-width="1" style="opacity:0"/></g>';
async function guitar(H) {
  const { E } = H;
  E.bodyp.innerHTML = GUITAR;
  const g = E.bodyp.querySelector('.gt'), snap = E.bodyp.querySelector('.gt-snap');
  const tS = 500, tB = 4500, total = 6200;
  H.play(g, fadeIn, { duration: 250, delay: 150, fill: 'both' });
  H.track(E.armL, total, [[0, H.rot(0)], [400, H.rot(-20)], [tB + 900, H.rot(-20)], [tB + 1200, H.rot(0)]]);
  H.track(E.armR, total, [[0, H.rot(0)], [400, H.rot(40)], [tB, H.rot(40)], [tB + 150, H.rot(-60)], [tB + 900, H.rot(-60)], [tB + 1200, H.rot(0)]]);
  H.cycle(E.armR, [H.rot(34), { offset: 0.5, ...H.rot(48) }, H.rot(34)], 240, tS, Math.floor((tB - tS) / 240));
  H.notesWin(tS + 200, tB);
  H.faceWin(tS, tB, ['ec', 'ms']);
  H.cycle(E.lean, [H.rot(-4), { offset: 0.5, ...H.rot(4) }, H.rot(-4)], 960, tS, Math.floor((tB - tS) / 960));
  H.cycle(E.legR, [H.rot(0), { offset: 0.5, ...H.rot(-14) }, H.rot(0)], 480, tS, Math.floor((tB - tS) / 480));
  // BOING: a string snaps and curls up
  H.play(snap, [{ opacity: 1, transform: 'scale(.2,1)' }, { offset: 0.3, opacity: 1, transform: 'scale(1.2,1.6)' }, { opacity: 0, transform: 'scale(1,2)' }], { duration: 900, delay: tB, fill: 'none' });
  snap.style.transformBox = 'fill-box'; snap.style.transformOrigin = '0% 50%';
  H.faceWin(tB, tB + 700, H.F.SURPRISED);
  H.faceWin(tB + 700, total, H.F.TEETH);
  H.track(E.squash, total, [[0, H.sq(1, 1)], [tB, H.sq(1, 1)], [tB + 80, H.sq(0.92, 1.1)], [tB + 300, H.sq(1, 1)]]);
  H.play(g, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: tB + 1200, fill: 'forwards' });
  await H.wait(total + 50);
}

// ── Dance: the twist, a disco point… and the splits (ouch) ─────────────
async function dance(H) {
  const { st, E } = H, k = st.k, x = H.cur.x;
  const tD = 3300, tSp = 5500, total = 7800;
  const tw = (a) => [H.rot(a), { offset: 0.5, ...H.rot(-a) }, H.rot(a)];
  // twist
  H.cycle(E.legL, tw(18), 420, 200, 7); H.cycle(E.legR, tw(18), 420, 200, 7);
  H.cycle(E.lean, tw(-9), 420, 200, 7);
  H.cycle(E.armL, [H.rot(-55), { offset: 0.5, ...H.rot(-25) }, H.rot(-55)], 420, 200, 7);
  H.cycle(E.armR, [H.rot(25), { offset: 0.5, ...H.rot(55) }, H.rot(25)], 420, 200, 7);
  H.cycle(E.bob, [{ transform: 'translateY(0px)' }, { offset: 0.5, transform: 'translateY(6px)' }, { transform: 'translateY(0px)' }], 420, 200, 7);
  H.faceWin(200, tD, ['ec', 'ms']);
  // disco: point up, point down
  H.cycle(E.armR, [H.rot(-155), { offset: 0.5, ...H.rot(35) }, H.rot(-155)], 700, tD, 3);
  H.cycle(E.lean, [H.rot(-8), { offset: 0.5, ...H.rot(8) }, H.rot(-8)], 700, tD, 3);
  H.cycle(E.legL, [H.rot(0), { offset: 0.5, ...H.rot(20) }, H.rot(0)], 700, tD, 3);
  H.faceWin(tD, tSp, ['gl', 'mo']);
  ['H', 'D', 'C', 'S', 'H', 'D', 'C', 'S'].forEach((s, i) => H.suitWin(tD + i * 260, tD + (i + 1) * 260, s));
  H.notesWin(tD, tSp);
  // the splits
  H.track(E.legL, total, [[0, H.rot(0)], [tSp, H.rot(0)], [tSp + 250, H.rot(84)], [tSp + 1500, H.rot(84)], [tSp + 1900, H.rot(0)]], 'none');
  H.track(E.legR, total, [[0, H.rot(0)], [tSp, H.rot(0)], [tSp + 250, H.rot(-84)], [tSp + 1500, H.rot(-84)], [tSp + 1900, H.rot(0)]], 'none');
  H.track(E.armL, total, [[0, H.rot(0)], [tSp, H.rot(0)], [tSp + 250, H.rot(120)], [tSp + 1500, H.rot(120)], [tSp + 1900, H.rot(0)]], 'none');
  H.track(E.armR, total, [[0, H.rot(0)], [tSp, H.rot(0)], [tSp + 250, H.rot(-120)], [tSp + 1500, H.rot(-120)], [tSp + 1900, H.rot(0)]], 'none');
  H.track(E.pos, total, [[0, H.P(x, st.yF)], [tSp, H.P(x, st.yF), 'ease-in'], [tSp + 250, H.P(x, st.yF + 44 * k)], [tSp + 1500, H.P(x, st.yF + 44 * k), 'ease-in-out'], [tSp + 1900, H.P(x, st.yF)]]);
  H.faceWin(tSp, tSp + 400, H.F.SURPRISED);
  H.faceWin(tSp + 400, tSp + 1700, ['ez', 'et', 'mw']);
  H.suitWin(tSp + 400, tSp + 1700, 'D');
  H.faceWin(tSp + 1900, total, H.F.TEETH);
  await H.wait(total + 50);
}

export const PROPS = { dealer, tower, felt, umbrella, selfie, bubbles, guitar, dance };
