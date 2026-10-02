// ═══════════════════════════════════════════════════════════════════
// Mascot — the Ace's ear (web extension, narmod 2026-10-02).
//
// While the music player plays, the Ace dances to the beat after a few idle
// seconds (modules/mascot/index.mjs, option « ace_dance », on by default).
// This module listens and finds the tempo; the dances themselves live in
// modules/mascot/acts-dance.mjs.
//
// Ear: window.Music.beatLevel() (modules/music.mjs) gives the onset strength
// of the low / mid band, read from an unsmoothed analyser in the player's Web
// Audio graph. It is null when there is nothing to measure — iOS default
// (bare <audio>, no graph), radio fallback outside the graph, paused — and 0
// when the graph is silent (iOS feeds zeros to some analysers). Then the Ace
// still dances, on a generic mid tempo (GENERIC_BPM), just not in sync.
//
// The sampler runs at ~50 Hz only while the music plays on the home screen /
// lobby (started and stopped by index.mjs), so the tempo is already known
// when the Ace walks in. estimateBpm() and danceFor() are pure (tested by
// scripts/test-mascot-groove.mjs).
// ═══════════════════════════════════════════════════════════════════

export const FPS = 50;                 // sampling rate of the onset envelope
export const WINDOW_MS = 8000;         // analysis window
export const MIN_MS = 4000;            // enough to guess a tempo
export const GENERIC_BPM = 105;        // no ear: a mid-tempo groove
export const CONF_MIN = 0.15;          // below: the guess is not trusted
const BPM_LO = 60, BPM_HI = 190;

/** Tempo range: slow (< 90), mid (90–114, also the generic groove), fast (115–135), rush (> 135). */
export function rangeFor(bpm) {
  if (!bpm) return 'mid';
  if (bpm < 90) return 'slow';
  if (bpm < 115) return 'mid';
  if (bpm <= 135) return 'fast';
  return 'rush';
}
/** The dances of each range (modules/mascot/acts-dance.mjs); the first one leads. */
export const POOLS = {
  slow: ['sway', 'slowdance', 'reggae', 'waltz'],
  mid: ['hiphop', 'robot', 'moon', 'floss', 'charleston'],
  fast: ['disco'],
  rush: ['techno'],
};
/** Lead dance of a tempo (bpm 0 / null: the generic groove). */
export function danceFor(bpm) { return POOLS[rangeFor(bpm)][0]; }
/** Next dance for a bar: from the tempo's range, never the one just danced (when there is a choice). */
export function pickDance(bpm, prev, rnd = Math.random) {
  const pool = POOLS[rangeFor(bpm)], list = pool.length > 1 ? pool.filter((d) => d !== prev) : pool;
  return list[Math.floor(rnd() * list.length) % list.length];
}

function lerp(a, i) {
  const k = Math.floor(i), f = i - k;
  if (k < 0 || k + 1 >= a.length) return k >= 0 && k < a.length ? a[k] : 0;
  return a[k] * (1 - f) + a[k + 1] * f;
}

/** Onset curve: what rises above the local mean (lone spikes keep their height). */
function onsets(env, fps) {
  const n = env.length, w = Math.max(1, Math.round(fps * 0.1)), o = new Float64Array(n);
  let s = 0;
  const pre = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) { s += env[i]; pre[i + 1] = s; }
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - w), b = Math.min(n, i + w + 1);
    const m = (pre[b] - pre[a]) / (b - a);
    o[i] = Math.max(0, env[i] - m);
  }
  return o;
}

/** Best comb phase for a tempo: { phi (index), tooth (mean onset per tooth) }. */
function combAt(o, fps, bpm, gap) {
  const n = o.length, P = fps * 60 / bpm;
  let phi = 0, top = -1;
  for (let s = 0; s < 32; s++) {
    const f = (s / 32) * P;
    let sum = 0, k = 0;
    for (let x = f; x < n; x += P) {
      const r = Math.round(x);
      if (gap && gap[Math.min(n - 1, r)]) continue;   // no sample there: the tooth does not count
      let m = 0;
      for (let j = Math.max(0, r - 1); j <= Math.min(n - 1, r + 1); j++) if (o[j] > m) m = o[j];
      sum += m; k++;
    }
    if (k && sum / k > top) { top = sum / k; phi = f; }
  }
  return { bpm, phi, tooth: top };
}
/** Same, with the tempo fine-tuned within ±1.5 BPM (a coarse tempo drifts off the beat over 8 s). */
function comb(o, fps, bpm, gap) {
  let best = null;
  for (let d = -1.5; d <= 1.5; d += 0.25) {
    const c = combAt(o, fps, bpm + d, gap);
    if (!best || c.tooth > best.tooth + 1e-9) best = c;
  }
  return best;
}

/**
 * Tempo of an onset-strength envelope sampled at `fps`.
 * Returns { bpm, conf, lastBeat } — lastBeat = index (float) of the last beat
 * in env — or null when the envelope is too short or silent.
 * Autocorrelation over 60–190 BPM with a log-normal preference around 120 BPM
 * (the usual cure for half / double tempo), sub-sample lags by interpolation.
 */
export function estimateBpm(env, fps = FPS) {
  const n = env ? env.length : 0;
  if (n < fps * (MIN_MS / 1000)) return null;
  // NaN = no sample (a busy main thread skipped ticks): counted as 0, and
  // the comb ignores teeth that fall there.
  let gap = null;
  for (let i = 0; i < n; i++) if (env[i] !== env[i]) { gap = gap || new Uint8Array(n); gap[i] = 1; }
  if (gap) env = Float64Array.from(env, (v) => (v === v ? v : 0));
  const o = onsets(env, fps);
  let e0 = 0;
  for (let i = 0; i < n; i++) e0 += o[i] * o[i];
  if (!(e0 > 1e-12)) return null;
  let best = null;
  for (let bpm = BPM_LO; bpm <= BPM_HI; bpm += 0.5) {
    const L = fps * 60 / bpm;
    let r = 0, r2 = 0;
    const m1 = n - Math.ceil(L) - 1, m2 = n - Math.ceil(2 * L) - 1;
    for (let i = 0; i < m1; i++) r += o[i] * lerp(o, i + L);
    for (let i = 0; i < m2; i++) r2 += o[i] * lerp(o, i + 2 * L);
    const raw = (r / Math.max(1, m1) + 0.5 * r2 / Math.max(1, m2)) / (e0 / n);
    const g = Math.log2(bpm / 120) / 0.9;
    const score = raw * Math.exp(-0.5 * g * g);
    if (!best || score > best.score) best = { bpm, score, raw };
  }
  let bpm = best.bpm;
  while (bpm < 70) bpm *= 2;
  while (bpm > 180) bpm /= 2;
  // Half / double tempo: a hi-hat on every off-beat doubles the pulse, a
  // kick on every other beat halves it. The comb that collects more energy
  // per tooth wins (double: when it loses almost nothing per tooth).
  let c = comb(o, fps, bpm, gap);
  if (c.bpm / 2 >= 70) {
    const h = comb(o, fps, c.bpm / 2, gap);
    if (h.tooth > 1.2 * c.tooth) c = h;
  }
  if (c.bpm * 2 <= 180) {
    const d = comb(o, fps, c.bpm * 2, gap);
    if (d.tooth >= 0.9 * c.tooth) c = d;
  }
  // 3:2 slips (a comb every 1.5 beats alternates kick and hi-hat).
  for (const f of [1.5, 2 / 3]) {
    const v = c.bpm * f;
    if (v < 70 || v > 180) continue;
    const t = comb(o, fps, v, gap);
    if (t.tooth > 1.2 * c.tooth) { c = t; break; }
  }
  // Confidence: how much the beat comb stands out from the average onset.
  let mean = 0;
  for (let i = 0; i < n; i++) mean += o[i];
  mean /= n;
  const conf = Math.max(0, Math.min(1, (c.tooth / (mean || 1e-9) - 4) / 8));
  bpm = c.bpm;
  const P = fps * 60 / bpm, phi = c.phi;
  const lastBeat = phi + Math.floor((n - 1 - phi) / P) * P;
  return { bpm: Math.round(bpm * 2) / 2, conf, lastBeat };
}

/** Resamples [t, v] pairs (ms) onto a regular `fps` grid ending at tEnd (NaN where no sample is near). */
export function resample(samples, tEnd, ms = WINDOW_MS, fps = FPS) {
  const step = 1000 / fps, n = Math.floor(ms / step), out = new Float64Array(n);
  let j = 0;
  const t0 = tEnd - n * step;
  for (let i = 0; i < n; i++) {
    const t = t0 + (i + 1) * step;
    while (j + 1 < samples.length && samples[j + 1][0] <= t) j++;
    const s = samples[j];
    out[i] = s && s[0] <= t + step && s[0] > t - 3 * step ? s[1] : NaN;
  }
  return out;
}

// ── The sampler (one per page) ─────────────────────────────────────────
const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
let timer = 0, getLevel = null, buf = [], nulls = 0, reads = 0, last = null, lastAt = 0;

/** Starts listening (idempotent). level() → number | null. */
export function start(level) {
  getLevel = level;
  if (timer) return;
  timer = setInterval(tick, 1000 / FPS);
}
export function stop() { if (timer) { clearInterval(timer); timer = 0; } reset(); }
export function listening() { return !!timer; }
/** Debug / test panel: samples kept, time span and longest gap (ms). */
export function stats() {
  let gap = 0;
  for (let i = 1; i < buf.length; i++) gap = Math.max(gap, buf[i][0] - buf[i - 1][0]);
  return { n: buf.length, span: buf.length ? Math.round(buf[buf.length - 1][0] - buf[0][0]) : 0, gap: Math.round(gap), reads, nulls };
}
/** New track: forget the old tempo. */
export function reset() { buf = []; nulls = 0; reads = 0; last = null; lastAt = 0; }

function tick() {
  let v = null;
  try { v = getLevel ? getLevel() : null; } catch (e) { v = null; }
  reads++;
  if (v === null || v === undefined || !isFinite(v)) { nulls++; return; }
  const t = now();
  buf.push([t, v]);
  const cut = t - WINDOW_MS - 500;
  let k = 0;
  while (k < buf.length && buf[k][0] < cut) k++;
  if (k) buf.splice(0, k);
}

/**
 * Current tempo: { bpm, conf, synced, nextBeat (performance.now() ms) } —
 * synced false means « no ear » (generic tempo). Cached for 1.5 s.
 */
export function tempo() {
  const t = now();
  if (last && t - lastAt < 1500) return last;
  lastAt = t;
  let est = null;
  if (buf.length && buf[buf.length - 1][0] - buf[0][0] >= MIN_MS) {
    let sum = 0;
    for (const s of buf) sum += s[1];
    if (sum > 0) est = estimateBpm(resample(buf, buf[buf.length - 1][0]), FPS);
  }
  if (est && est.conf >= CONF_MIN) {
    const P = 60000 / est.bpm, tEnd = buf[buf.length - 1][0], n = Math.floor(WINDOW_MS / (1000 / FPS));
    let nb = tEnd - (n - 1 - est.lastBeat) * (1000 / FPS);
    while (nb < t) nb += P;
    last = { bpm: est.bpm, conf: est.conf, synced: true, nextBeat: nb };
  } else if (last && last.synced && est) {
    // a shaky window (a break, a bridge): keep the last good tempo, move on its grid
    const P = 60000 / last.bpm;
    let nb = last.nextBeat;
    while (nb < t) nb += P;
    last = Object.assign({}, last, { nextBeat: nb });
  } else {
    last = { bpm: GENERIC_BPM, conf: 0, synced: false, nextBeat: t };
  }
  return last;
}
