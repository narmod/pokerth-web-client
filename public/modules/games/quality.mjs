// @ts-check
// ═══════════════════════════════════════════════════════════════════
// The mini-games' drawing quality (web.107; audit claude/AUDIT_PERF_MINIJEUX_2026-11-16.md,
// narmod: « not ugly on big screens — a big screen usually comes with a big machine »).
// Pure: shell.mjs feeds it the frames, it says how sharp the canvas may be.
//
//   frameStep(vsync)        on a 120/144/165/240 Hz screen, draw one frame out of n
//                           (60 to 82 a second) — the games follow dt, nothing moves slower
//   qualitySteps(native)    the device pixel ratios tried, sharpest first: the screen's
//                           own (≤ 2), then 1.75, 1.5, 1.25, 1 (never below 1)
//   createQuality(native, cap)
//                           full sharpness first; two slow windows of 1.5 s in a row (more
//                           than 30 % of the draws late; one window when 70 % are) → one step down; a game opened again
//                           tries one step above what it kept last time, so a passing
//                           slowdown is not kept for good. { dpr, frame(ms, target), reset() }
// ═══════════════════════════════════════════════════════════════════

/** Frames drawn: one out of n (n = 1 up to ≈ 90 Hz). vsync: ms between two screen refreshes. */
export function frameStep(vsync) {
  if (!(vsync > 0) || vsync >= 12) return 1;
  return Math.max(1, Math.floor(1000 / 60 / vsync + 0.1));
}

const STEPS = [1.75, 1.5, 1.25, 1];
/** The ratios tried, sharpest first (the screen's own, at most 2). */
export function qualitySteps(native) {
  const top = Math.max(1, Math.min(2, native || 1));
  return [top].concat(STEPS.filter((s) => s < top - 0.01));
}

const WINDOW_MS = 1500, SLOW = 1.3;
/**
 * cap: the ratio this game kept last time (undefined: none). Starts one step above
 * it (or at the top), steps down after two slow windows in a row.
 */
export function createQuality(native, cap) {
  const steps = qualitySteps(native);
  let i = 0;
  if (cap > 0) { const k = steps.findIndex((s) => s <= cap + 0.01); i = k < 0 ? steps.length - 1 : Math.max(0, k - 1); }
  let sum = 0, n = 0, late = 0, slowRuns = 0;
  const q = {
    dpr: steps[i],
    /** Fluid windows in a row (the ratio is worth keeping for next time). */
    good: 0,
    /** True when it just stepped down (the canvas is to be sized again). */
    frame(ms, target) {
      if (!(ms > 0) || ms > 250) return false;       // a stall (a tab switch, a load) says nothing
      sum += ms; n++;
      if (ms > target * SLOW) late++;
      if (sum < WINDOW_MS) return false;
      const slow = late > n * 0.3, crawl = late > n * 0.7;
      sum = 0; n = 0; late = 0;
      slowRuns = crawl ? 2 : slow ? slowRuns + 1 : 0;
      q.good = slow ? 0 : q.good + 1;
      if (slowRuns < 2 || i >= steps.length - 1) return false;
      i++; slowRuns = 0; q.good = 0; q.dpr = steps[i];
      return true;
    },
    /** Forget the running window (after a resize, a pause, a game opened). */
    reset() { sum = 0; n = 0; late = 0; slowRuns = 0; q.good = 0; },
  };
  return q;
}

const KEY = 'pth_gm_q';
/** The ratio kept for game `id` (undefined: none). */
export function savedCap(id) {
  try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); return typeof o[id] === 'number' ? o[id] : undefined; } catch (e) { return undefined; }
}
export function saveCap(id, dpr) {
  try { const o = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; o[id] = dpr; localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
}
