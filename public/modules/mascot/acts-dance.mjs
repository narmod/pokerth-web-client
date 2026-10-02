// ═══════════════════════════════════════════════════════════════════
// Mascot — dancing to the music player (web extension, narmod 2026-10-02).
//
// Action 'groove': the Ace dances for as long as the music plays and nobody
// touches anything (any input sends him away, like every scene). Every bar
// (8 beats; 4 while the tempo is still unknown) he asks the ear
// (modules/mascot/groove.mjs) for the tempo, starts on the next beat and
// picks a dance of that tempo's range — a different one each bar (web.282):
//   slow (< 90 BPM)  sway (arms up like lighters) · slowdance (hugging the
//                    air, a heart floats up) · reggae (off-beat shoulders,
//                    loose arms) · waltz (one turn every three beats)
//   mid (90–114)     hiphop (bounce, pumps, step-touch) · robot (stiff,
//                    jerky arms) · moon (moonwalk on the beat and back) ·
//                    floss (arms swing, hips the other way) · charleston
//                    (kicks and swinging arms)
//   fast (115–135)   disco (the twist, the disco point, flashing suits)
//   rush (> 135)     techno (a jump on every beat, hands up)
// No ear (iOS default player, radio outside the Web Audio graph, silent
// analyser): the mid dances on a generic tempo, not in sync.
// A new tempo range (new track, new tempo): a spin, then the new dance.
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
  H.track(E.armL, end, [[0, H.rot(0)], [t0, H.rot(0)], [t0 + b / 2, H.rot(62)], [end - b / 2, H.rot(62)], [end, H.rot(0)]], 'none');
  H.track(E.armR, end, [[0, H.rot(0)], [t0, H.rot(0)], [t0 + b / 2, H.rot(-62)], [end - b / 2, H.rot(-62)], [end, H.rot(0)]], 'none');
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

export const STYLES = { sway, slowdance, reggae, waltz, hiphop, robot, moon, floss, charleston, disco, techno };

/** A full turn on one beat: the move between two tempo ranges. */
function spin(H, b, t0) {
  const ms = Math.max(400, b);
  H.track(H.E.card, ms, [[0, H.ry(0)], [ms, H.ry(360), H.EIO]], 'none', t0);
  H.track(H.E.armL, ms, [[0, H.rot(0)], [ms / 2, H.rot(70)], [ms, H.rot(0)]], 'none', t0);
  H.track(H.E.armR, ms, [[0, H.rot(0)], [ms / 2, H.rot(-70)], [ms, H.rot(0)]], 'none', t0);
  H.faceWin(t0, t0 + ms, H.F.WINK);
  return t0 + ms;
}

/** Music paused: he waits, tapping his foot. */
function waitPose(H, ms) {
  const E = H.E;
  H.cycle(E.legR, [H.rot(0), { offset: 0.5, ...H.rot(-9) }, H.rot(0)], 600, 0, Math.max(1, Math.round(ms / 600)));
  H.faceWin(0, ms, ['eo', 'mt']);
  return ms;
}

/** Drops the finished animations: a long dance must not pile them up. */
function prune(c) {
  try { c.anims = c.anims.filter((a) => a.playState !== 'finished'); } catch (e) {}
}

async function groove(H) {
  const M = window.Music;
  if (!M || typeof M.isPlaying !== 'function') return;
  const own = !Ear.listening();   // the loader usually started the ear already
  if (own) Ear.start(() => (M.beatLevel ? M.beatLevel() : null));
  let track = M.current ? M.current() : null, style = null, zone = null, pausedSince = 0;
  try {
    for (;;) {
      const c = H.cur;
      if (!c || c.dead || c.leaving) return;
      prune(c);
      if (!M.isPlaying()) {
        if (!pausedSince) pausedSince = Date.now();
        if (Date.now() - pausedSince > PAUSE_GIVEUP) return;
        await H.wait(waitPose(H, 1800));
        continue;
      }
      pausedSince = 0;
      const id = M.current ? M.current() : null;
      if (id !== track) { track = id; Ear.reset(); }
      const tp = Ear.tempo(), b = 60000 / tp.bpm;
      let t = 0;
      if (tp.synced) {
        const nowT = typeof performance !== 'undefined' ? performance.now() : Date.now();
        t = Math.max(0, tp.nextBeat - nowT);
        while (t >= b) t -= b;
        if (t > 0.85 * b) t = 0;   // the beat has just gone by (end of the previous bar): go on at once, no freeze
      }
      const bpm = tp.synced ? tp.bpm : 0, range = Ear.rangeFor(bpm);
      if (style && range !== zone) t = spin(H, b, t);   // a new tempo range: a spin first
      zone = range;
      const force = window._mascotForceDance;   // console / test: one dance only (see the header)
      style = force && STYLES[force] ? force : Ear.pickDance(bpm, style);
      H.cur.grooveStyle = style; H.cur.grooveBpm = tp.synced ? tp.bpm : 0;
      await H.wait(STYLES[style](H, b, t, tp.synced ? BAR : BAR / 2));   // no tempo yet: short bars, to sync sooner
    }
  } finally {
    if (own) Ear.stop();
  }
}

export const DANCE = { groove };
