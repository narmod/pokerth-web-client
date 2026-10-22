// ═══════════════════════════════════════════════════════════════════
// Mascot — dancing to the music player (web extension, narmod 2026-10-02).
//
// Action 'groove': the Ace dances for as long as the music plays and nobody
// touches anything (any input sends him away, like every scene). Every bar
// (8 beats; 4 while the tempo is still unknown) he asks the ear
// (modules/mascot/groove.mjs) for the tempo, starts on the next beat and
// picks a dance of that tempo's range — a new one every two bars (PHRASE):
//   slow (< 90 BPM)  sway (arms up like lighters) · slowdance (hugging the
//                    air, a heart floats up) · reggae (off-beat shoulders,
//                    loose arms) · waltz (one turn every three beats) ·
//                    wave (a ripple across the arms) · taichi (wide slow
//                    arms, weight shift)
//   mid (90–114)     hiphop (bounce, pumps, step-touch) · robot (stiff,
//                    jerky arms) · moon (moonwalk on the beat and back) ·
//                    floss (arms swing, hips the other way) · charleston
//                    (kicks and swinging arms) · poplock (moves locked on
//                    the beat) · dab (step-touch, a dab on the last beat)
//   fast (115–135)   disco (the twist, the disco point, flashing suits) ·
//                    runningman (piston knees) · macarena (a pose a beat,
//                    a hop) · swing (crossed kicks, jazz hands) · cabbage
//                    (cabbage patch: fists circling, hips swinging)
//   rush (> 135)     techno (a jump on every beat, hands up) · shuffle
//                    (heel-toe slides) · pogo (straight jumps, head
//                    banging) · cancan (high kicks) · jumpstyle (jumps,
//                    a leg kicking forward in turn)
// No ear (iOS default player, radio outside the Web Audio graph, silent
// analyser): the mid dances on a generic tempo, not in sync.
// A new tempo range (new track, new tempo): a spin, then the new dance. The
// range sticks within ±3 BPM of its limits (groove.mjs rangeStick), so a song
// near 115 BPM does not spin back and forth.
// Smoothness (web.277): every move is set on the animation timeline in
// absolute time (startTime), and the next bar is scheduled about one beat
// before the current one ends, on the beat grid — no pause between bars.
// Where a limb would jump (end of one figure, start of the next, a limb
// released to its rest pose), smoothJoins() lays a short eased blend over
// the joint, about a fifth of a beat each side, from where the limb is to
// where the dance wants it. The soft dances (SMOOTH) ease every keyframe;
// robot stays jerky, techno keeps its landing, moon its steps.
// Console: window._mascotForceDance = 'robot', then mascotDemo('groove'),
// shows one dance only (any name of STYLES). Music paused
// (lock screen, media keys): he waits tapping his foot, and leaves after
// PAUSE_GIVEUP.
// Same contract as modules/mascot/acts-props.mjs: async (H, where), start and
// end standing at H.cur.x, facing front. Imported by modules/mascot/engine.mjs.
// ═══════════════════════════════════════════════════════════════════

import * as Ear from './groove.mjs';

const BAR = 8;                 // beats per bar
const PAUSE_GIVEUP = 20000;    // music paused this long: he leaves

const Y = (px) => ({ transform: `translateY(${px}px)` });

/** Bob down on every beat (accent at the start of the beat). */
function bounce(H, node, b, t0, beats, depth) {
  H.cycle(node, [Y(0), { offset: 0.25, ...Y(depth), easing: 'ease-out' }, Y(0)], b, t0, beats);
}

// ── Slow sway: lean side to side over two beats, arms up, eyes closed ──
function sway(H, b, t0, beats) {
  const E = H.E, half = Math.max(1, Math.floor(beats / 2)), end = t0 + beats * b;
  H.cycle(E.lean, [H.rot(-7), { offset: 0.5, ...H.rot(7), easing: H.EIO }, H.rot(-7)], 2 * b, t0, half);
  H.cycle(E.armL, [H.rot(150), { offset: 0.5, ...H.rot(122) }, H.rot(150)], 2 * b, t0, half);
  H.cycle(E.armR, [H.rot(-122), { offset: 0.5, ...H.rot(-150) }, H.rot(-122)], 2 * b, t0, half);
  H.cycle(E.legL, [H.rot(0), { offset: 0.5, ...H.rot(6) }, H.rot(0)], 2 * b, t0, half);
  H.cycle(E.legR, [H.rot(-6), { offset: 0.5, ...H.rot(0) }, H.rot(-6)], 2 * b, t0, half);
  bounce(H, E.bob, b, t0, beats, 3);
  H.faceWin(t0, end, H.F.LOVE);
  H.notesWin(t0, end);
  return end;
}

// ── Hip-hop: four beats of bounce and arm pumps, four of step-touch ─────
function hiphop(H, b, t0, beats) {
  const { E, st } = H, x = H.cur.x, k = st.k, end = t0 + beats * b;
  const a = Math.max(1, Math.floor(beats / 2)), tS = t0 + a * b;
  bounce(H, E.bob, b, t0, beats, 7);
  H.cycle(E.squash, [H.sq(1, 1), { offset: 0.25, ...H.sq(1.04, 0.95) }, H.sq(1, 1)], b, t0, beats);
  H.cycle(E.armL, [H.rot(-35), { offset: 0.5, ...H.rot(60) }, H.rot(-35)], 2 * b, t0, Math.max(1, Math.floor(a / 2)));
  H.cycle(E.armR, [H.rot(-60), { offset: 0.5, ...H.rot(35) }, H.rot(-60)], 2 * b, t0, Math.max(1, Math.floor(a / 2)));
  H.cycle(E.lean, [H.rot(0), { offset: 0.25, ...H.rot(3) }, H.rot(0)], b, t0, a);
  // step-touch: out on the roomy side and back, two beats each way
  const D = (st.maxX - x) >= (x - st.minX) ? 1 : -1, dx = D * 22 * k;
  H.track(E.pos, end - tS, [[0, H.P(x, st.yF)], [b, H.P(x + dx, st.yF), H.EIO], [2 * b, H.P(x + dx, st.yF)], [3 * b, H.P(x, st.yF), H.EIO]], 'forwards', tS);
  H.cycle(E.legL, [H.rot(0), { offset: 0.5, ...H.rot(D > 0 ? 14 : -10) }, H.rot(0)], b, tS, beats - a);
  H.cycle(E.legR, [H.rot(0), { offset: 0.5, ...H.rot(D > 0 ? 10 : -14) }, H.rot(0)], b, tS, beats - a);
  H.cycle(E.armL, [H.rot(20), { offset: 0.5, ...H.rot(-20) }, H.rot(20)], b, tS, beats - a);
  H.cycle(E.armR, [H.rot(-20), { offset: 0.5, ...H.rot(20) }, H.rot(-20)], b, tS, beats - a);
  H.faceWin(t0, end, ['gl', 'ms']);
  return end;
}

// ── Disco: the twist for half the bar, then point up / point down ───────
function disco(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b;
  const a = Math.max(1, Math.floor(beats / 2)), tP = t0 + a * b, tw = (d) => [H.rot(d), { offset: 0.5, ...H.rot(-d) }, H.rot(d)];
  H.cycle(E.legL, tw(18), b, t0, a); H.cycle(E.legR, tw(18), b, t0, a);
  H.cycle(E.lean, tw(-9), b, t0, a);
  H.cycle(E.armL, [H.rot(-55), { offset: 0.5, ...H.rot(-25) }, H.rot(-55)], b, t0, a);
  H.cycle(E.armR, [H.rot(25), { offset: 0.5, ...H.rot(55) }, H.rot(25)], b, t0, a);
  H.faceWin(t0, tP, ['ec', 'ms']);
  const n = Math.max(1, Math.floor((beats - a) / 2));
  H.cycle(E.armR, [H.rot(-155), { offset: 0.5, ...H.rot(35) }, H.rot(-155)], 2 * b, tP, n);
  H.cycle(E.armL, [H.rot(-20), { offset: 0.5, ...H.rot(10) }, H.rot(-20)], 2 * b, tP, n);
  H.cycle(E.lean, [H.rot(-8), { offset: 0.5, ...H.rot(8) }, H.rot(-8)], 2 * b, tP, n);
  H.cycle(E.legL, [H.rot(0), { offset: 0.5, ...H.rot(20) }, H.rot(0)], 2 * b, tP, n);
  H.faceWin(tP, end, ['gl', 'mo']);
  bounce(H, E.bob, b, t0, beats, 5);
  const S = ['H', 'D', 'C', 'S'];
  for (let i = 0; i < beats; i++) H.suitWin(t0 + i * b, t0 + (i + 1) * b, S[i % 4]);
  return end;
}

// ── Techno: a jump on every beat, hands up, the suits strobe ────────────
function techno(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b;
  H.cycle(E.bob, [Y(0), { offset: 0.3, ...Y(-11), easing: 'ease-in' }, { offset: 0.62, ...Y(0) }, Y(0)], b, t0, beats);
  H.cycle(E.squash, [H.sq(1, 1), { offset: 0.62, ...H.sq(1, 1) }, { offset: 0.72, ...H.sq(1.08, 0.9) }, H.sq(1, 1)], b, t0, beats);
  H.cycle(E.armL, [H.rot(150), { offset: 0.5, ...H.rot(112) }, H.rot(150)], b, t0, beats);
  H.cycle(E.armR, [H.rot(-150), { offset: 0.5, ...H.rot(-112) }, H.rot(-150)], b, t0, beats);
  H.cycle(E.legL, [H.rot(0), { offset: 0.3, ...H.rot(10) }, { offset: 0.62, ...H.rot(0) }, H.rot(0)], b, t0, beats);
  H.cycle(E.legR, [H.rot(0), { offset: 0.3, ...H.rot(-10) }, { offset: 0.62, ...H.rot(0) }, H.rot(0)], b, t0, beats);
  const S = ['S', 'H', 'C', 'D'], half = t0 + Math.floor(beats / 2) * b;
  for (let i = 0; i < beats; i++) H.suitWin(t0 + i * b, t0 + (i + 1) * b, S[i % 4]);
  H.faceWin(t0, half, H.F.TEETH);
  H.faceWin(half, end, H.F.GRIN);
  return end;
}


// ── Slow dance: hugging the air, swaying, a heart floats up ─────────────
function slowdance(H, b, t0, beats) {
  const { E, st } = H, x = H.cur.x, k = st.k, end = t0 + beats * b, half = Math.max(1, Math.floor(beats / 2));
  const d = end - t0;   // from the first beat: before it, the bar running now keeps the arms
  H.track(E.armL, d, [[0, H.rot(0)], [b / 2, H.rot(62)], [d - b / 2, H.rot(62)], [d, H.rot(0)]], 'none', t0);
  H.track(E.armR, d, [[0, H.rot(0)], [b / 2, H.rot(-62)], [d - b / 2, H.rot(-62)], [d, H.rot(0)]], 'none', t0);
  H.cycle(E.lean, [H.rot(-5), { offset: 0.5, ...H.rot(5), easing: H.EIO }, H.rot(-5)], 2 * b, t0, half);
  H.cycle(E.legL, [H.rot(0), { offset: 0.25, ...H.rot(8) }, { offset: 0.5, ...H.rot(0) }, H.rot(0)], 2 * b, t0, half);
  H.cycle(E.legR, [H.rot(0), { offset: 0.75, ...H.rot(-8) }, H.rot(0)], 2 * b, t0, half);
  const D = (st.maxX - x) >= (x - st.minX) ? 1 : -1, dx = D * 10 * k;
  H.track(E.pos, end - t0, [[0, H.P(x, st.yF)], [(end - t0) / 2, H.P(x + dx, st.yF), H.EIO], [end - t0, H.P(x, st.yF), H.EIO]], 'forwards', t0);
  H.faceWin(t0, end, H.F.LOVE);
  // a heart every two beats, rising over his head
  for (let i = 0; i < half; i++) {
    const hx = x + (60 + (i % 2 ? 26 : -6)) * k, hy = st.yF + 10 * k;
    const el = H.worldProp(16, 16, `<g transform="translate(8 8)"><path d="${H.HEART}" fill="#e0245e" stroke="#141414" style="stroke-width:.9px"/></g>`, 0, 0, true, 1.1);
    el.style.opacity = '0';
    const a = H.play(el, [{ transform: `translate(${hx}px,${hy}px) scale(.4)`, opacity: 0 }, { offset: 0.2, transform: `translate(${hx}px,${hy - 14 * k}px) scale(1)`, opacity: 1 },
      { transform: `translate(${hx + (i % 2 ? 10 : -10) * k}px,${hy - 70 * k}px) scale(1.15)`, opacity: 0 }], { duration: 2 * b, delay: t0 + 2 * i * b, fill: 'none', easing: 'ease-out' });
    if (a) a.onfinish = a.oncancel = () => { try { el.remove(); } catch (e) {} };
  }
  return end;
}

// ── Reggae: the off-beat in the shoulders and knees, loose arms ─────────
function reggae(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b, half = Math.max(1, Math.floor(beats / 2));
  // accent on the "and" of every beat
  H.cycle(E.bob, [Y(0), { offset: 0.5, ...Y(0) }, { offset: 0.7, ...Y(5), easing: 'ease-out' }, Y(0)], b, t0, beats);
  H.cycle(E.squash, [H.sq(1, 1), { offset: 0.5, ...H.sq(1, 1) }, { offset: 0.65, ...H.sq(1.03, 0.97) }, H.sq(1, 1)], b, t0, beats);
  H.cycle(E.armL, [H.rot(-12), { offset: 0.5, ...H.rot(22), easing: H.EIO }, H.rot(-12)], 2 * b, t0, half);
  H.cycle(E.armR, [H.rot(-22), { offset: 0.5, ...H.rot(12), easing: H.EIO }, H.rot(-22)], 2 * b, t0, half);
  H.cycle(E.lean, [H.rot(3), { offset: 0.5, ...H.rot(-3), easing: H.EIO }, H.rot(3)], 2 * b, t0, half);
  H.cycle(E.legL, [H.rot(0), { offset: 0.6, ...H.rot(6) }, H.rot(0)], 2 * b, t0, half);
  H.cycle(E.legR, [H.rot(0), { offset: 0.1, ...H.rot(-6) }, { offset: 0.5, ...H.rot(0) }, H.rot(0)], 2 * b, t0, half);
  H.faceWin(t0, end, ['ec', 'ms']);
  H.notesWin(t0, end);
  return end;
}

// ── Waltz: arms in hold, one turn every three beats, a dip on the one ───
function waltz(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b, n = Math.max(1, Math.floor(beats / 3)), ms = 3 * b * n;
  H.track(E.armL, ms, [[0, H.rot(0)], [b / 2, H.rot(105)], [ms - b / 2, H.rot(105)], [ms, H.rot(0)]], 'none', t0);
  H.track(E.armR, ms, [[0, H.rot(0)], [b / 2, H.rot(-55)], [ms - b / 2, H.rot(-55)], [ms, H.rot(0)]], 'none', t0);
  H.cycle(E.card, [H.ry(0), { offset: 0.5, ...H.ry(180) }, H.ry(360)], 3 * b, t0, n);
  H.cycle(E.bob, [Y(4), { offset: 0.33, ...Y(-2), easing: H.EIO }, { offset: 0.66, ...Y(-2) }, Y(4)], 3 * b, t0, n);
  H.cycle(E.legL, [H.rot(0), { offset: 0.33, ...H.rot(10) }, { offset: 0.66, ...H.rot(-6) }, H.rot(0)], 3 * b, t0, n);
  H.cycle(E.legR, [H.rot(0), { offset: 0.33, ...H.rot(6) }, { offset: 0.66, ...H.rot(-10) }, H.rot(0)], 3 * b, t0, n);
  H.faceWin(t0, t0 + ms, ['ec', 'ms']);
  if (ms < beats * b) H.faceWin(t0 + ms, end, H.F.WINK);   // the beats left over: a bow
  if (ms < beats * b) H.track(E.lean, end - t0 - ms, [[0, H.rot(0)], [(end - t0 - ms) / 2, H.rot(10)], [end - t0 - ms, H.rot(0)]], 'none', t0 + ms);
  return end;
}

// ── Robot: stiff, jerky arms on every beat, little head ticks ───────────
function robot(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b, S = 'steps(1, end)';
  const L = [0, 90, 90, 0, 45, 135, 90, 0], R = [-90, 0, -90, -45, 0, -90, -135, 0];
  const fr = (a) => a.map((d, i) => ({ offset: i / a.length, transform: `rotate(${d}deg)`, easing: S })).concat([{ offset: 1, transform: `rotate(${a[0]}deg)` }]);
  const seq = (A) => Array.from({ length: beats }, (_, i) => A[i % A.length]);   // one pose per beat, as many as the bar has
  H.cycle(E.armL, fr(seq(L)), beats * b, t0, 1);
  H.cycle(E.armR, fr(seq(R)), beats * b, t0, 1);
  H.cycle(E.lean, [{ transform: 'rotate(-4deg)', easing: S }, { offset: 0.5, transform: 'rotate(4deg)', easing: S }, { transform: 'rotate(-4deg)' }], 2 * b, t0, Math.max(1, Math.floor(beats / 2)));
  H.cycle(E.bob, [{ transform: 'translateY(0px)', easing: S }, { offset: 0.5, transform: 'translateY(3px)', easing: S }, { transform: 'translateY(0px)' }], b, t0, beats);
  H.cycle(E.legL, [{ transform: 'rotate(0deg)', easing: S }, { offset: 0.5, transform: 'rotate(8deg)', easing: S }, { transform: 'rotate(0deg)' }], 2 * b, t0, Math.max(1, Math.floor(beats / 2)));
  H.faceWin(t0, end, ['eo', 'mt']);
  return end;
}

// ── Moonwalk on the beat: four beats back, a spin, and back again ───────
function moon(H, b, t0, beats) {
  const { E, st } = H, x = H.cur.x, k = st.k, end = t0 + beats * b, a = Math.max(1, Math.floor(beats / 2)), tB = t0 + a * b;
  const D = (st.maxX - x) >= (x - st.minX) ? 1 : -1, d = Math.min(26 * a * k, 0.8 * Math.max(st.maxX - x, x - st.minX));
  // facing away from the slide, then the other way for the slide back
  H.track(E.card, end - t0, [[0, H.ry(0)], [b / 3, H.facing(-D)], [a * b - b / 3, H.facing(-D)], [a * b, H.ry(-D * 30 + D * 360)], [end - t0 - b / 3, H.ry(D * 30 + D * 360)], [end - t0, H.ry(D * 360)]], 'none', t0);
  H.track(E.pos, end - t0, [[0, H.P(x, st.yF)], [a * b, H.P(x + D * d, st.yF)], [a * b + b / 2, H.P(x + D * d, st.yF)], [end - t0, H.P(x, st.yF)]], 'forwards', t0);
  H.cycle(E.legL, H.mwFrames(D), b, t0, a); H.cycle(E.legR, H.mwFramesB(D), b, t0, a);
  H.cycle(E.legL, H.mwFrames(-D), b, tB, beats - a); H.cycle(E.legR, H.mwFramesB(-D), b, tB, beats - a);
  H.cycle(E.armL, H.SWING_B, b, t0, beats); H.cycle(E.armR, H.SWING_F, b, t0, beats);
  H.cycle(E.lean, [H.rot(5 * D), { offset: 0.5, ...H.rot(3 * D) }, H.rot(5 * D)], b, t0, a);
  H.faceWin(t0, end, ['gl', 'ms']);
  return end;
}

// ── Floss: arms swing to one side, hips to the other, on every beat ─────
function floss(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b, n = Math.max(1, Math.floor(beats / 2));
  H.cycle(E.armL, [H.rot(-30), { offset: 0.25, ...H.rot(25) }, { offset: 0.5, ...H.rot(-30) }, { offset: 0.75, ...H.rot(25) }, H.rot(-30)], 2 * b, t0, n);
  H.cycle(E.armR, [H.rot(-25), { offset: 0.25, ...H.rot(30) }, { offset: 0.5, ...H.rot(-25) }, { offset: 0.75, ...H.rot(30) }, H.rot(-25)], 2 * b, t0, n);
  H.cycle(E.lean, [H.rot(6), { offset: 0.25, ...H.rot(-6) }, { offset: 0.5, ...H.rot(6) }, { offset: 0.75, ...H.rot(-6) }, H.rot(6)], 2 * b, t0, n);
  H.cycle(E.legL, [H.rot(-5), { offset: 0.5, ...H.rot(5) }, H.rot(-5)], b, t0, beats);
  H.cycle(E.legR, [H.rot(-5), { offset: 0.5, ...H.rot(5) }, H.rot(-5)], b, t0, beats);
  bounce(H, E.bob, b, t0, beats, 3);
  H.faceWin(t0, end, ['ec', 'mg']);
  return end;
}

// ── Charleston: kicks forward and back, arms swinging, a bounce ─────────
function charleston(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b, n = Math.max(1, Math.floor(beats / 2));
  H.cycle(E.legL, [H.rot(0), { offset: 0.25, ...H.rot(30) }, { offset: 0.5, ...H.rot(0) }, H.rot(0)], 2 * b, t0, n);
  H.cycle(E.legR, [H.rot(0), { offset: 0.5, ...H.rot(0) }, { offset: 0.75, ...H.rot(-30) }, H.rot(0)], 2 * b, t0, n);
  H.cycle(E.armL, [H.rot(-40), { offset: 0.5, ...H.rot(70), easing: H.EIO }, H.rot(-40)], 2 * b, t0, n);
  H.cycle(E.armR, [H.rot(-70), { offset: 0.5, ...H.rot(40), easing: H.EIO }, H.rot(-70)], 2 * b, t0, n);
  H.cycle(E.lean, [H.rot(-6), { offset: 0.5, ...H.rot(6), easing: H.EIO }, H.rot(-6)], 2 * b, t0, n);
  bounce(H, E.bob, b, t0, beats, 6);
  H.faceWin(t0, end, H.F.GRIN);
  return end;
}

// ── New dances (web.278) ────────────────────────────────────────────────

/** Arms through a list of poses, one per beat: a quick move (`move` of a beat, eased), then held. */
function poses(H, node, list, b, t0, beats, move, easing) {
  const d = beats * b, pts = [[0, H.rot(0)]];
  for (let i = 0; i < beats; i++) {
    const a = list[i % list.length];
    pts.push([i * b + move * b, H.rot(a), easing]);
    if (i < beats - 1) pts.push([(i + 1) * b, H.rot(a), easing]);
  }
  pts.push([d, H.rot(list[(beats - 1) % list.length])]);
  H.track(node, d, pts, 'none', t0);
}

// ── Wave (slow): a ripple from one arm to the other across the body ─────
function wave(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b, n = Math.max(1, Math.floor(beats / 4));
  H.cycle(E.armL, [H.rot(20), { offset: 0.25, ...H.rot(115) }, { offset: 0.5, ...H.rot(160) }, { offset: 0.75, ...H.rot(115) }, H.rot(20)], 4 * b, t0, n);
  H.cycle(E.armR, [H.rot(-160), { offset: 0.25, ...H.rot(-115) }, { offset: 0.5, ...H.rot(-20) }, { offset: 0.75, ...H.rot(-115) }, H.rot(-160)], 4 * b, t0, n);
  H.cycle(E.lean, [H.rot(-6), { offset: 0.5, ...H.rot(6) }, H.rot(-6)], 4 * b, t0, n);
  H.cycle(E.legL, [H.rot(0), { offset: 0.5, ...H.rot(6) }, H.rot(0)], 4 * b, t0, n);
  H.cycle(E.legR, [H.rot(-6), { offset: 0.5, ...H.rot(0) }, H.rot(-6)], 4 * b, t0, n);
  bounce(H, E.bob, b, t0, beats, 2);
  H.faceWin(t0, end, ['ec', 'ms']);
  H.notesWin(t0, end);
  return end;
}

// ── Tai-chi (slow): wide slow arms, the weight from one leg to the other ─
function taichi(H, b, t0, beats) {
  const { E, st } = H, x = H.cur.x, k = st.k, end = t0 + beats * b, n = Math.max(1, Math.floor(beats / 4));
  H.cycle(E.armL, [H.rot(0), { offset: 0.25, ...H.rot(85) }, { offset: 0.5, ...H.rot(135) }, { offset: 0.75, ...H.rot(65) }, H.rot(0)], 4 * b, t0, n);
  H.cycle(E.armR, [H.rot(0), { offset: 0.25, ...H.rot(-85) }, { offset: 0.5, ...H.rot(-135) }, { offset: 0.75, ...H.rot(-65) }, H.rot(0)], 4 * b, t0, n);
  H.cycle(E.bob, [Y(0), { offset: 0.5, ...Y(4) }, Y(0)], 4 * b, t0, n);   // knees bent at the top of the move
  H.cycle(E.lean, [H.rot(-3), { offset: 0.5, ...H.rot(3) }, H.rot(-3)], 4 * b, t0, n);
  H.cycle(E.legL, [H.rot(4), { offset: 0.5, ...H.rot(-2) }, H.rot(4)], 4 * b, t0, n);
  H.cycle(E.legR, [H.rot(2), { offset: 0.5, ...H.rot(-4) }, H.rot(2)], 4 * b, t0, n);
  const D = (st.maxX - x) >= (x - st.minX) ? 1 : -1, dx = D * 8 * k, d = end - t0;
  H.track(E.pos, d, [[0, H.P(x, st.yF)], [d / 2, H.P(x + dx, st.yF), H.EIO], [d, H.P(x, st.yF), H.EIO]], 'forwards', t0);
  H.faceWin(t0, end, ['ec', 'ms']);
  return end;
}

// ── Pop-lock (mid): a quick move, then a lock on every beat, a pop of the chest ─
function poplock(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b;
  poses(H, E.armL, [90, 20, 90, 150, 45, 90, 20, 0], b, t0, beats, 0.2, 'ease-out');
  poses(H, E.armR, [-20, -90, -150, -90, -45, -20, -90, 0], b, t0, beats, 0.2, 'ease-out');
  poses(H, E.lean, [-4, -4, 4, 4, 0, -5, 5, 0], b, t0, beats, 0.15, 'ease-out');
  H.cycle(E.squash, [H.sq(1, 1), { offset: 0.06, ...H.sq(1.05, 0.94) }, { offset: 0.18, ...H.sq(1, 1) }, H.sq(1, 1)], b, t0, beats);
  H.cycle(E.bob, [Y(0), { offset: 0.06, ...Y(2) }, { offset: 0.18, ...Y(0) }, Y(0)], b, t0, beats);
  H.cycle(E.legL, [H.rot(0), { offset: 0.5, ...H.rot(6), easing: 'ease-out' }, H.rot(0)], 2 * b, t0, Math.max(1, Math.floor(beats / 2)));
  H.faceWin(t0, end, ['gl', 'mt']);
  return end;
}

// ── Dab (mid): step-touch, then a dab on the last beat ──────────────────
function dab(H, b, t0, beats) {
  const { E, st } = H, x = H.cur.x, k = st.k, end = t0 + beats * b, last = end - b, m = beats - 1;
  const D = (st.maxX - x) >= (x - st.minX) ? 1 : -1, dx = D * 16 * k;
  const pts = [[0, H.P(x, st.yF)]];
  for (let i = 0; i + 1 < m; i += 2) pts.push([(i + 0.5) * b, H.P(x + dx, st.yF), H.EIO], [(i + 1.5) * b, H.P(x, st.yF), H.EIO]);
  H.track(E.pos, end - t0, pts, 'forwards', t0);
  H.cycle(E.armL, [H.rot(-20), { offset: 0.5, ...H.rot(20) }, H.rot(-20)], b, t0, m);
  H.cycle(E.armR, [H.rot(-20), { offset: 0.5, ...H.rot(20) }, H.rot(-20)], b, t0, m);
  H.cycle(E.legL, [H.rot(0), { offset: 0.5, ...H.rot(8) }, H.rot(0)], b, t0, m);
  bounce(H, E.bob, b, t0, m, 4);
  H.faceWin(t0, last, H.F.GRIN);
  // the dab: one arm up and out, the other across the face, the head in the elbow
  H.track(E.armL, b, [[0, H.rot(-20)], [0.25 * b, H.rot(125), 'ease-out'], [0.8 * b, H.rot(125)], [b, H.rot(0)]], 'none', last);
  H.track(E.armR, b, [[0, H.rot(-20)], [0.25 * b, H.rot(105), 'ease-out'], [0.8 * b, H.rot(105)], [b, H.rot(0)]], 'none', last);
  H.track(E.lean, b, [[0, H.rot(0)], [0.25 * b, H.rot(-12), 'ease-out'], [0.8 * b, H.rot(-12)], [b, H.rot(0)]], 'none', last);
  H.faceWin(last, end, H.F.WINK);
  return end;
}

// ── Running man (fast): a knee up like a piston, the other foot slides back ─
function runningman(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b, n = Math.max(1, Math.floor(beats / 2));
  H.cycle(E.legL, [H.rot(0), { offset: 0.25, ...H.rot(30) }, { offset: 0.5, ...H.rot(0) }, { offset: 0.75, ...H.rot(-10) }, H.rot(0)], 2 * b, t0, n);
  H.cycle(E.legR, [H.rot(10), { offset: 0.25, ...H.rot(0) }, { offset: 0.5, ...H.rot(0) }, { offset: 0.75, ...H.rot(-30) }, H.rot(10)], 2 * b, t0, n);
  H.cycle(E.armL, [H.rot(-35), { offset: 0.5, ...H.rot(35) }, H.rot(-35)], 2 * b, t0, n);
  H.cycle(E.armR, [H.rot(-35), { offset: 0.5, ...H.rot(35) }, H.rot(-35)], 2 * b, t0, n);
  H.cycle(E.bob, [Y(0), { offset: 0.25, ...Y(-6) }, Y(0)], b, t0, beats);
  H.cycle(E.lean, [H.rot(2), { offset: 0.5, ...H.rot(-2) }, H.rot(2)], 2 * b, t0, n);
  H.faceWin(t0, end, ['gl', 'ms']);
  return end;
}

// ── Macarena (fast): a pose of the arms on each beat, a hop on the last ──
function macarena(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b, last = end - b;
  poses(H, E.armL, [90, 90, 135, 135, 165, 165, 30, 30], b, t0, beats, 0.35);
  poses(H, E.armR, [0, -90, -90, -135, -135, -165, -165, -30], b, t0, beats, 0.35);
  H.cycle(E.lean, [H.rot(-4), { offset: 0.5, ...H.rot(4) }, H.rot(-4)], 2 * b, t0, Math.max(1, Math.floor(beats / 2)));
  bounce(H, E.bob, b, t0, beats - 1, 4);
  H.faceWin(t0, last, ['gl', 'ms']);
  // the hop, with a look aside
  H.track(E.bob, b, [[0, Y(0)], [0.4 * b, Y(-12), 'ease-out'], [0.8 * b, Y(0), 'ease-in'], [b, Y(0)]], 'none', last);
  H.track(E.card, b, [[0, H.ry(0)], [0.4 * b, H.facing(1)], [0.85 * b, H.facing(1)], [b, H.ry(0)]], 'none', last);
  H.track(E.legL, b, [[0, H.rot(0)], [0.4 * b, H.rot(10)], [0.8 * b, H.rot(0)]], 'none', last);
  H.track(E.legR, b, [[0, H.rot(0)], [0.4 * b, H.rot(-10)], [0.8 * b, H.rot(0)]], 'none', last);
  H.faceWin(last, end, H.F.GRIN);
  return end;
}

// ── Swing (fast): crossed kicks, jazz hands shaking by the head ─────────
function swing(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b, n = Math.max(1, Math.floor(beats / 2));
  H.cycle(E.legL, [H.rot(0), { offset: 0.25, ...H.rot(-24) }, { offset: 0.5, ...H.rot(0) }, H.rot(0)], 2 * b, t0, n);
  H.cycle(E.legR, [H.rot(0), { offset: 0.5, ...H.rot(0) }, { offset: 0.75, ...H.rot(24) }, H.rot(0)], 2 * b, t0, n);
  H.cycle(E.armL, [H.rot(102), { offset: 0.5, ...H.rot(116) }, H.rot(102)], b / 4, t0, beats * 4);
  H.cycle(E.armR, [H.rot(-116), { offset: 0.5, ...H.rot(-102) }, H.rot(-116)], b / 4, t0, beats * 4);
  H.cycle(E.lean, [H.rot(5), { offset: 0.5, ...H.rot(-5) }, H.rot(5)], 2 * b, t0, n);
  bounce(H, E.bob, b, t0, beats, 4);
  H.faceWin(t0, end, H.F.GRIN);
  return end;
}

// ── Cabbage patch (fast): fists circling in front of the chest, swinging hips ─
function cabbage(H, b, t0, beats) {
  const { E, st } = H, x = H.cur.x, k = st.k, end = t0 + beats * b, n = Math.max(1, Math.floor(beats / 2));
  H.cycle(E.armL, [H.rot(45), { offset: 0.25, ...H.rot(72) }, { offset: 0.5, ...H.rot(58) }, { offset: 0.75, ...H.rot(30) }, H.rot(45)], b, t0, beats);
  H.cycle(E.armR, [H.rot(-58), { offset: 0.25, ...H.rot(-30) }, { offset: 0.5, ...H.rot(-45) }, { offset: 0.75, ...H.rot(-72) }, H.rot(-58)], b, t0, beats);
  H.cycle(E.lean, [H.rot(-6), { offset: 0.5, ...H.rot(6) }, H.rot(-6)], 2 * b, t0, n);
  H.cycle(E.legL, [H.rot(0), { offset: 0.5, ...H.rot(7) }, H.rot(0)], 2 * b, t0, n);
  H.cycle(E.legR, [H.rot(-7), { offset: 0.5, ...H.rot(0) }, H.rot(-7)], 2 * b, t0, n);
  const dx = 6 * k, pts = [[0, H.P(x, st.yF)]];   // the hips carry him a little, from his spot and back to it
  for (let i = 0; i < n; i++) pts.push([(2 * i + 0.5) * b, H.P(x + dx, st.yF), H.EIO], [(2 * i + 1.5) * b, H.P(x - dx, st.yF), H.EIO]);
  pts.push([end - t0, H.P(x, st.yF), H.EIO]);
  H.track(E.pos, end - t0, pts, 'forwards', t0);
  bounce(H, E.bob, b, t0, beats, 3);
  H.faceWin(t0, end, ['ec', 'mg']);
  return end;
}

// ── Shuffle (rush): heel-toe slides, sideways and back ──────────────────
function shuffle(H, b, t0, beats) {
  const { E, st } = H, x = H.cur.x, k = st.k, end = t0 + beats * b, a = Math.max(1, Math.floor(beats / 2));
  const D = (st.maxX - x) >= (x - st.minX) ? 1 : -1, dx = D * Math.min(18 * a * k, 0.7 * Math.max(st.maxX - x, x - st.minX));
  H.track(E.pos, end - t0, [[0, H.P(x, st.yF)], [a * b, H.P(x + dx, st.yF), H.EIO], [end - t0, H.P(x, st.yF), H.EIO]], 'forwards', t0);
  H.cycle(E.legL, [H.rot(-14), { offset: 0.5, ...H.rot(14) }, H.rot(-14)], b, t0, beats);
  H.cycle(E.legR, [H.rot(14), { offset: 0.5, ...H.rot(-14) }, H.rot(14)], b, t0, beats);
  H.cycle(E.armL, [H.rot(-25), { offset: 0.5, ...H.rot(25) }, H.rot(-25)], b, t0, beats);
  H.cycle(E.armR, [H.rot(-25), { offset: 0.5, ...H.rot(25) }, H.rot(-25)], b, t0, beats);
  bounce(H, E.bob, b, t0, beats, 4);
  H.faceWin(t0, end, ['gl', 'ms']);
  return end;
}

// ── Pogo (rush): straight jumps, arms down, the head banging ────────────
function pogo(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b, half = t0 + Math.floor(beats / 2) * b;
  H.cycle(E.bob, [Y(0), { offset: 0.35, ...Y(-14), easing: 'ease-in' }, { offset: 0.65, ...Y(0) }, Y(0)], b, t0, beats);
  H.cycle(E.squash, [H.sq(1, 1), { offset: 0.65, ...H.sq(1, 1) }, { offset: 0.74, ...H.sq(1.1, 0.88) }, H.sq(1, 1)], b, t0, beats);
  H.cycle(E.lean, [H.rot(-6), { offset: 0.5, ...H.rot(6) }, H.rot(-6)], b, t0, beats);
  H.cycle(E.armL, [H.rot(-8), { offset: 0.35, ...H.rot(-18) }, H.rot(-8)], b, t0, beats);
  H.cycle(E.armR, [H.rot(8), { offset: 0.35, ...H.rot(18) }, H.rot(8)], b, t0, beats);
  H.faceWin(t0, half, ['eo', 'mo']);
  H.faceWin(half, end, H.F.TEETH);
  return end;
}

// ── Cancan (rush): high kicks in turn, a hand up, the red suits flash ───
function cancan(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b, n = Math.max(1, Math.floor(beats / 2));
  H.cycle(E.legL, [H.rot(0), { offset: 0.2, ...H.rot(60) }, { offset: 0.45, ...H.rot(0) }, H.rot(0)], 2 * b, t0, n);
  H.cycle(E.legR, [H.rot(0), { offset: 0.5, ...H.rot(0) }, { offset: 0.7, ...H.rot(-60) }, { offset: 0.95, ...H.rot(0) }, H.rot(0)], 2 * b, t0, n);
  H.cycle(E.lean, [H.rot(-7), { offset: 0.5, ...H.rot(7) }, H.rot(-7)], 2 * b, t0, n);
  H.cycle(E.armL, [H.rot(130), { offset: 0.5, ...H.rot(150) }, H.rot(130)], b, t0, beats);
  H.cycle(E.armR, [H.rot(-30), { offset: 0.5, ...H.rot(-40) }, H.rot(-30)], 2 * b, t0, n);
  bounce(H, E.bob, b, t0, beats, 4);
  for (let i = 0; i < beats; i++) H.suitWin(t0 + i * b, t0 + (i + 1) * b, i % 2 ? 'D' : 'H');
  H.faceWin(t0, end, H.F.GRIN);
  return end;
}

// ── Jumpstyle (rush): a jump on every beat, a leg kicking forward in turn ─
function jumpstyle(H, b, t0, beats) {
  const E = H.E, end = t0 + beats * b, n = Math.max(1, Math.floor(beats / 2));
  H.cycle(E.bob, [Y(0), { offset: 0.3, ...Y(-10), easing: 'ease-in' }, { offset: 0.6, ...Y(0) }, Y(0)], b, t0, beats);
  H.cycle(E.squash, [H.sq(1, 1), { offset: 0.6, ...H.sq(1, 1) }, { offset: 0.7, ...H.sq(1.07, 0.92) }, H.sq(1, 1)], b, t0, beats);
  H.cycle(E.legL, [H.rot(0), { offset: 0.15, ...H.rot(36) }, { offset: 0.3, ...H.rot(0) }, H.rot(0)], 2 * b, t0, n);
  H.cycle(E.legR, [H.rot(0), { offset: 0.5, ...H.rot(0) }, { offset: 0.65, ...H.rot(-36) }, { offset: 0.8, ...H.rot(0) }, H.rot(0)], 2 * b, t0, n);
  H.cycle(E.armL, [H.rot(-30), { offset: 0.3, ...H.rot(40) }, H.rot(-30)], b, t0, beats);
  H.cycle(E.armR, [H.rot(30), { offset: 0.3, ...H.rot(-40) }, H.rot(30)], b, t0, beats);
  const S = ['C', 'S'];
  for (let i = 0; i < beats; i++) H.suitWin(t0 + i * b, t0 + (i + 1) * b, S[i % 2]);
  H.faceWin(t0, end, H.F.TEETH);
  return end;
}

export const STYLES = {
  sway, slowdance, reggae, waltz, wave, taichi, hiphop, robot, moon, floss, charleston, poplock, dab,
  disco, runningman, macarena, swing, cabbage, techno, shuffle, pogo, cancan, jumpstyle,
};

/** Dances whose keyframes are all eased (the others keep their sharp moves on purpose). */
export const SMOOTH = new Set(['sway', 'slowdance', 'reggae', 'waltz', 'wave', 'taichi', 'hiphop', 'floss', 'charleston', 'dab',
  'disco', 'runningman', 'macarena', 'swing', 'cabbage', 'shuffle', 'cancan']);
const PHRASE = 16;     // beats of one dance before the next one (two bars)
const FACE_PAD = 40;   // face and suit windows run a little into the next bar: no flash of the costume's mood in between
const JOINTS = ['armL', 'armR', 'legL', 'legR', 'lean', 'bob', 'squash', 'card'];   // the limbs smoothJoins looks after
const JUMP = 1.5;      // a joint moving more than this in no time (deg, px, scale ×100) is a jump to smooth

/** A full turn on whole beats (at least 400 ms): the move between two tempo ranges. */
function spin(H, b, t0) {
  const ms = Math.max(1, Math.ceil(400 / b - 1e-9)) * b;
  H.track(H.E.card, ms, [[0, H.ry(0)], [ms, H.ry(360), H.EIO]], 'none', t0);
  H.track(H.E.armL, ms, [[0, H.rot(0)], [ms / 2, H.rot(70)], [ms, H.rot(0)]], 'none', t0);
  H.track(H.E.armR, ms, [[0, H.rot(0)], [ms / 2, H.rot(-70)], [ms, H.rot(0)]], 'none', t0);
  H.faceWin(t0, t0 + ms, H.F.WINK);
  return t0 + ms;
}

/** Music paused: he waits, tapping his foot. */
function waitPose(H, t0, ms) {
  const E = H.E;
  H.cycle(E.legR, [H.rot(0), { offset: 0.5, ...H.rot(-9) }, H.rot(0)], 600, t0, Math.max(1, Math.round(ms / 600)));
  H.faceWin(t0, t0 + ms, ['eo', 'mt']);
  return t0 + ms;
}

/** Drops the finished animations: a long dance must not pile them up. */
function prune(c) {
  try { c.anims = c.anims.filter((a) => a.playState !== 'finished'); } catch (e) {}
}

// ── Joins: what each limb shows over time, and blends over its jumps ───
// Pure helpers, tested by scripts/test-mascot-groove.mjs.

const clock = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

const BEZ = { ease: [0.25, 0.1, 0.25, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1] };
/** Value of a CSS easing at x (0–1): linear, the keyword curves, cubic-bezier() and steps(1, …). */
export function ease(name, x) {
  if (!name || name === 'linear') return x;
  if (/^steps\(/.test(name)) return /start/.test(name) ? (x > 0 ? 1 : 0) : (x >= 1 ? 1 : 0);
  const m = /^cubic-bezier\(([^,]+),([^,]+),([^,]+),([^)]+)\)$/.exec(name);
  const p = BEZ[name] || (m ? m.slice(1).map(Number) : null);
  if (!p) return x;
  const cx = 3 * p[0], bx = 3 * (p[2] - p[0]) - cx, ax = 1 - cx - bx;
  const cy = 3 * p[1], by = 3 * (p[3] - p[1]) - cy, ay = 1 - cy - by;
  let lo = 0, hi = 1, t = x;
  for (let i = 0; i < 30; i++) {
    t = (lo + hi) / 2;
    if (((ax * t + bx) * t + cx) * t < x) lo = t; else hi = t;
  }
  return ((ay * t + by) * t + cy) * t;
}

/**
 * A transform as a list of functions: 'translate(-9px,0px) rotate(14deg)' →
 * [{ fn: 'translate', v: [-9, 0], u: ['px', 'px'] }, { fn: 'rotate', v: [14], u: ['deg'] }]
 * (null when it cannot be read).
 */
export function parseTf(s) {
  if (typeof s !== 'string') return null;
  const re = /\s*([a-zA-Z0-9]+)\(([^()]*)\)\s*/g, out = [];
  let m, at = 0;
  while ((m = re.exec(s)) && m.index === at) {
    const args = m[2].split(',').map((x) => x.trim()), v = args.map(parseFloat);
    if (v.some((x) => !isFinite(x))) return null;
    out.push({ fn: m[1], v, u: args.map((x) => (/[a-z%]+$/i.exec(x) || [''])[0]) });
    at = re.lastIndex;
  }
  return out.length && at === s.length ? out : null;
}
export const fmtTf = (t) => t.map((p) => `${p.fn}(${p.v.map((x, i) => +x.toFixed(3) + (p.u[i] || '')).join(',')})`).join(' ');
const isScale = (fn) => /^scale/.test(fn);
const restPart = (p) => ({ fn: p.fn, v: p.v.map(() => (isScale(p.fn) ? 1 : 0)), u: p.u });
const restOf = (t) => t.map(restPart);
/** a padded with neutral functions to b's list (a's functions a subsequence of b's), else null. */
function pad(a, b) {
  const out = [];
  let i = 0;
  for (const p of b) {
    if (i < a.length && a[i].fn === p.fn && a[i].v.length === p.v.length) out.push(a[i++]);
    else out.push(restPart(p));
  }
  return i === a.length ? out : null;
}
/** The two transforms on the same list of functions, or null when they cannot be matched. */
function match(a, b) {
  if (!a || !b) return null;
  if (a.length === b.length && a.every((p, i) => p.fn === b[i].fn && p.v.length === b[i].v.length)) return [a, b];
  const pa = a.length <= b.length ? pad(a, b) : null;
  if (pa) return [pa, b];
  const pb = b.length < a.length ? pad(b, a) : null;
  return pb ? [a, pb] : null;
}

/** Keyframes → [{ off, tf, e }] with every offset filled in (null when one is not a single transform). */
export function norm(frames) {
  if (!frames || frames.length < 2) return null;
  const f = frames.map((k) => ({ off: typeof k.offset === 'number' ? k.offset : null, tf: parseTf(k.transform), e: k.easing || null }));
  if (f.some((k) => !k.tf)) return null;
  if (f[0].off === null) f[0].off = 0;
  if (f[f.length - 1].off === null) f[f.length - 1].off = 1;
  for (let i = 1; i < f.length; i++) {
    if (f[i].off !== null) continue;
    let j = i;
    while (f[j].off === null) j++;
    const a = f[i - 1].off, b = f[j].off;
    for (let k = i; k < j; k++) f[k].off = a + (b - a) * (k - i + 1) / (j - i + 1);
  }
  return f;
}

/** The transform of normalised keyframes at progress p (0–1). */
export function sampleFrames(f, p) {
  let i = 0;
  while (i < f.length - 2 && p >= f[i + 1].off) i++;
  const a = f[i], b = f[i + 1], span = b.off - a.off;
  const y = ease(a.e, span > 0 ? Math.min(1, Math.max(0, (p - a.off) / span)) : 1);
  const m = match(a.tf, b.tf);
  if (!m) return y < 1 ? a.tf : b.tf;
  return m[1].map((q, i) => ({ fn: q.fn, v: m[0][i].v.map((v, k) => v + (q.v[k] - v) * y), u: q.u }));
}

/** What a recorded animation shows at time t (null when it does not apply then). */
function recAt(r, t) {
  if (t < r.start) return null;
  const el = t - r.start, total = r.dur * r.iter;
  if (el >= total) return r.hold ? sampleFrames(r.f, 1) : null;
  return sampleFrames(r.f, (el % r.dur) / r.dur);
}
/** What a joint shows at time t: the latest animation that applies, else its rest pose. */
export function shownAt(J, t) {
  for (let i = J.recs.length - 1; i >= 0; i--) {
    const s = recAt(J.recs[i], t);
    if (s) return s;
  }
  return restOf(J.tpl);
}
/** A turn about Y is the same pose every 360°: bring `from` within half a turn of `to`. */
function unwrap(from, to) {
  const m = match(from, to);
  if (!m) return from;
  return m[0].map((p, i) => {
    if (p.fn !== 'rotateY') return p;
    const d = ((((p.v[0] - m[1][i].v[0]) % 360) + 540) % 360) - 180;
    return { fn: p.fn, v: [m[1][i].v[0] + d], u: p.u };
  });
}
/** How far apart two transforms are (deg, px, scale ×100); Infinity when they cannot be matched. */
export function tfGap(a, b) {
  const m = match(unwrap(a, b), b);
  if (!m) return Infinity;
  let d = 0;
  m[0].forEach((p, i) => p.v.forEach((v, k) => { d = Math.max(d, Math.abs(v - m[1][i].v[k]) * (isScale(p.fn) ? 100 : 1)); }));
  return d;
}

/** Records an animation of a joint (keyframes, absolute start, duration, iterations). */
export function record(R, node, frames, start, dur, iter, hold) {
  const f = norm(frames);
  if (!node || !f) return;
  let J = R.joints.get(node);
  if (!J) { J = { node, recs: [], tpl: f[0].tf, done: -Infinity }; R.joints.set(node, J); }
  J.recs.push({ f, start, dur: Math.max(1, dur), iter: Math.max(1, iter || 1), hold: !!hold });
}

/**
 * Blends over the jumps of every joint between its last pass and `upTo`
 * (absolute ms): each jump gets an eased move from where the limb is h ms
 * before to where the dance has it h ms after; jumps closer than 2h share
 * one blend. play(node, frames, startAbs, ms) lays the blend.
 */
export function smoothJoins(R, upTo, h, play) {
  for (const J of R.joints.values()) {
    const ts = [];
    for (const r of J.recs) {
      // a move set since the last pass counts even where that pass already went
      for (const t of [r.start, r.start + r.dur * r.iter]) if ((t >= J.done || !r.seen) && t < upTo && ts.indexOf(t) < 0) ts.push(t);
    }
    for (const r of J.recs) r.seen = true;
    ts.sort((a, b) => a - b);
    const jumps = ts.filter((t) => tfGap(shownAt(J, t - 0.5), shownAt(J, t + 0.5)) > JUMP);
    for (let i = 0; i < jumps.length;) {
      let j = i;
      while (j + 1 < jumps.length && jumps[j + 1] - jumps[j] < 2 * h) j++;
      const w0 = jumps[i] - h, w1 = jumps[j] + h, m = match(unwrap(shownAt(J, w0), shownAt(J, w1)), shownAt(J, w1));
      if (m) play(J.node, [{ transform: fmtTf(m[0]), easing: 'ease-in-out' }, { transform: fmtTf(m[1]) }], w0, w1 - w0);
      i = j + 1;
    }
    J.done = upTo;
    // what is over for good no longer matters
    J.recs = J.recs.filter((r) => r.hold || r.start + r.dur * r.iter > upTo - 4000);
  }
}

/**
 * The helper object a dance gets: the engine's, with every animation set
 * at the bar's absolute time (R.base) and recorded for smoothJoins; `smooth`
 * eases the keyframes that have no easing of their own.
 */
function rig(H, R, smooth) {
  const D = Object.create(H);
  const joints = new Set(JOINTS.map((k) => H.E[k]).filter(Boolean));   // props, hearts, the position: left alone
  const keep = (a) => {
    if (!a) return a;
    try { if (a.playbackRate === 1 && typeof a.startTime !== 'undefined') a.startTime = R.base; } catch (e) {}
    try {
      const fx = a.effect, tm = fx.getTiming();
      if (joints.has(fx.target)) {
        record(R, fx.target, fx.getKeyframes().map((k) => ({ offset: k.computedOffset, transform: k.transform, easing: k.easing })),
          R.base + (tm.delay || 0), +tm.duration || 1, tm.iterations, tm.fill === 'forwards' || tm.fill === 'both');
      }
    } catch (e) {}
    return a;
  };
  const soft = (frames) => frames.map((k, i) => (i < frames.length - 1 && !k.easing ? Object.assign({}, k, { easing: H.EIO }) : k));
  D.cycle = (node, frames, ms, delay, count) => keep(H.cycle(node, smooth ? soft(frames) : frames, ms, delay, count));
  D.track = (node, total, pts, fill, delay) => keep(H.track(node, total, smooth ? pts.map((p) => (p[2] ? p : [p[0], p[1], H.EIO])) : pts, fill, delay));
  D.play = (node, frames, opts) => keep(H.play(node, frames, opts));
  D.faceWin = (t0, t1, show) => H.faceWin(t0, t1 + FACE_PAD, show);
  D.suitWin = (t0, t1, k) => H.suitWin(t0, t1 + FACE_PAD, k);
  return D;
}

/** Lays the blends of smoothJoins with the engine, at their absolute time. */
function blends(H, R, upTo, h) {
  smoothJoins(R, upTo, h, (node, frames, at, ms) => {
    const a = H.play(node, frames, { duration: Math.max(1, ms), delay: at - R.base, fill: 'none' });
    try { if (a && a.playbackRate === 1) a.startTime = R.base; } catch (e) {}
  });
}

/**
 * When the next bar starts (absolute ms). `at` is the end of the bar
 * running now (0: nothing running, start on the next beat). On the beat
 * grid, the end of the bar is nudged by at most 0.15 beat; further off (a
 * new estimate moved the beats), the bar waits for the next beat.
 */
export function nextStart(at, tp, b, now) {
  if (!tp.synced) return at || now;
  const nb = tp.nextBeat;
  if (at) {
    const c = nb + Math.round((at - nb) / b) * b;
    if (Math.abs(c - at) <= 0.15 * b) return c;
    return nb + Math.ceil((at - nb) / b - 1e-9) * b;
  }
  const t = (((nb - now) % b) + b) % b;
  return t > 0.85 * b ? now : now + t;   // the beat has just gone by: go on at once, no freeze
}

async function groove(H) {
  const M = window.Music;
  if (!M || typeof M.isPlaying !== 'function') return;
  const own = !Ear.listening();   // the loader usually started the ear already
  if (own) Ear.start(() => (M.beatLevel ? M.beatLevel() : null));
  const R = { joints: new Map(), base: 0 };
  let track = M.current ? M.current() : null, style = null, zone = null, pausedSince = 0, inStyle = 0;
  let next = 0;   // when the next bar starts (absolute ms); 0: on the next beat
  try {
    for (;;) {
      const c = H.cur;
      if (!c || c.dead || c.leaving) return;
      prune(c);
      const now = clock();
      if (next && now > next - 40) next = 0;   // woken up late (busy page, throttled timer): back on a beat
      R.base = now;
      if (!M.isPlaying()) {
        if (!pausedSince) pausedSince = now;
        if (now - pausedSince > PAUSE_GIVEUP) return;
        const at = next || now;
        next = now + waitPose(rig(H, R, false), at - now, 1800);
        blends(H, R, next - 120, 120);
        await H.wait(Math.max(0, next - 500 - clock()));
        continue;
      }
      pausedSince = 0;
      const id = M.current ? M.current() : null;
      if (id !== track) { track = id; Ear.reset(); }
      const tp = Ear.tempo(), b = 60000 / tp.bpm;
      const h = Math.max(70, Math.min(170, 0.22 * b)), lead = Math.max(450, Math.min(800, b));
      next = nextStart(next, tp, b, now);
      let t = next - now;
      const bpm = tp.synced ? tp.bpm : 0, range = Ear.rangeStick(bpm, zone);
      if (style && range !== zone) t = spin(rig(H, R, false), b, t);   // a new tempo range: a spin first
      const force = window._mascotForceDance;   // console / test: one dance only (see the header)
      if (force && STYLES[force]) style = force;
      else if (!style || range !== zone || inStyle >= PHRASE) { style = Ear.pickDanceIn(range, style); inStyle = 0; }
      zone = range;
      const beats = tp.synced ? BAR : BAR / 2;   // no tempo yet: short bars, to sync sooner
      H.cur.grooveStyle = style; H.cur.grooveBpm = tp.synced ? tp.bpm : 0;
      next = now + STYLES[style](rig(H, R, SMOOTH.has(style)), b, t, beats);
      inStyle += beats;
      blends(H, R, next - h, h);
      await H.wait(Math.max(0, next - lead - clock()));
    }
  } finally {
    if (own) Ear.stop();
  }
}

export const DANCE = { groove };
/** Test hooks (scripts/test-mascot-groove.mjs). */
export const _test = { rig, blends, spinFor: spin };
