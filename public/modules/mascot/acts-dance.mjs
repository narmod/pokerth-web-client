// ═══════════════════════════════════════════════════════════════════
// Mascot — dancing to the music player (web extension, narmod 2026-10-02).
//
// Action 'groove': the Ace dances for as long as the music plays and nobody
// touches anything (any input sends him away, like every scene). Every bar
// (8 beats; 4 while the tempo is still unknown) he asks the ear (modules/mascot/groove.mjs) for the tempo, starts
// on the next beat and picks the dance of that tempo:
//   sway   (< 90 BPM)   slow sway, both arms up like lighters
//   hiphop (90–114)     bounce, arm pumps, a side step-touch, shades on
//   disco  (115–135)    the twist, then the disco point, suits flashing
//   techno (> 135)      jumps on every beat, hands up, strobing suits
// No ear (iOS default player, radio outside the Web Audio graph, silent
// analyser): the hip-hop groove on a generic mid tempo, not in sync.
// A new track or a new tempo range: a spin, then the new dance. Music paused
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

export const STYLES = { sway, hiphop, disco, techno };

/** A full turn on one beat: the move between two dances. */
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
  let track = M.current ? M.current() : null, style = null, pausedSince = 0;
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
      }
      const next = Ear.danceFor(tp.synced ? tp.bpm : 0);
      if (style && next !== style) t = spin(H, b, t);
      style = next;
      H.cur.grooveStyle = style; H.cur.grooveBpm = tp.synced ? tp.bpm : 0;
      await H.wait(STYLES[style](H, b, t, tp.synced ? BAR : BAR / 2));   // no tempo yet: short bars, to sync sooner
    }
  } finally {
    if (own) Ear.stop();
  }
}

export const DANCE = { groove };
