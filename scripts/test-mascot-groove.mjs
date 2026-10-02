#!/usr/bin/env node
// Deterministic test of the dancing Ace (web.281): tempo estimation and
// dance choice (modules/mascot/groove.mjs), and the wiring — music player
// ear (beatLevel), dance acts, loader, option in every language, precache.
// Run: node scripts/test-mascot-groove.mjs
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const G = await import(pathToFileURL(path.resolve('public/modules/mascot/groove.mjs')).href);

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}

let seed = 7;
const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; };
/** Onset envelope: kick on every beat, hi-hat on the off-beat, noise, timing jitter. */
function synth(bpm, o = {}) {
  const sec = o.sec || 8, off = o.off || 0.13, noise = o.noise === undefined ? 0.25 : o.noise;
  const hat = o.hat === undefined ? 0.5 : o.hat, jit = o.jitter || 0, every = o.every || 1;
  const n = sec * G.FPS, e = new Float64Array(n), P = 60 / bpm;
  for (let i = 0; i < n; i++) e[i] = noise * rnd() * 0.3;
  let k = 0;
  for (let t = off; t < sec; t += P, k++) {
    const i = Math.round((t + (rnd() - 0.5) * jit) * G.FPS);
    if (k % every === 0 && i < n) { e[i] += 1; if (i + 1 < n) e[i + 1] += 0.4; }
    const j = Math.round((t + P / 2) * G.FPS);
    if (hat && j < n) e[j] += hat * (0.6 + 0.4 * rnd());
  }
  return e;
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// ── Tempo across the four dance ranges ──
for (const bpm of [72, 80, 88, 95, 100, 110, 118, 124, 128, 135, 140, 150, 160, 174]) {
  const r = G.estimateBpm(synth(bpm));
  ok(r && near(r.bpm, bpm, 3), `${bpm} BPM → ${r && r.bpm} (±3)`);
}
// ── Off-beat hi-hats do not double a slow tempo, a fast kick is not halved ──
ok(near(G.estimateBpm(synth(72, { hat: 0.7 })).bpm, 72, 3), 'slow song with loud off-beat hats stays slow');
ok(near(G.estimateBpm(synth(170, { hat: 0 })).bpm, 170, 3), 'fast four-on-the-floor stays fast');
// ── Robustness: noise and human timing ──
ok(near(G.estimateBpm(synth(122, { noise: 0.8 })).bpm, 122, 3), 'noisy track: 122 BPM found');
ok(near(G.estimateBpm(synth(96, { jitter: 0.02 })).bpm, 96, 3), '20 ms timing jitter: 96 BPM found');
// ── Phase: the last beat lands on the kick ──
{
  const bpm = 124, r = G.estimateBpm(synth(bpm, { off: 0.21 }));
  const P = G.FPS * 60 / bpm, d = ((r.lastBeat - 0.21 * G.FPS) % P + P) % P;
  ok(Math.min(d, P - d) <= 3, `phase within 60 ms (${(Math.min(d, P - d) * 20).toFixed(0)} ms)`);
}
// ── Confidence: a real beat is trusted, noise and silence are not ──
ok(G.estimateBpm(synth(118)).conf >= G.CONF_MIN, 'a clear beat is trusted');
{ const nz = Float64Array.from({ length: 400 }, () => rnd()); const r = G.estimateBpm(nz); ok(!r || r.conf < G.CONF_MIN, 'white noise is not trusted'); }
ok(G.estimateBpm(new Float64Array(400)) === null, 'silence → no tempo');
ok(G.estimateBpm(synth(120, { sec: 2 })) === null, 'under 4 s → no tempo yet');
// ── Resampling onto the grid ──
{
  const s = []; for (let t = 0; t <= 8000; t += 17) s.push([t, t % 500 < 17 ? 1 : 0]);
  const r = G.resample(s, 8000);
  ok(r.length === 400 && near(G.estimateBpm(r).bpm, 120, 3), 'irregular samples resampled: 120 BPM');
}
// ── A busy main thread: 300 ms without ticks every 2 s ──
for (const bpm of [80, 124, 150]) {
  const P = 60000 / bpm, smp = [];
  for (let t = 0; t <= 8400; t += 20) { if (t % 2000 < 300) continue; const ph = (t % P) / P; smp.push([t, ph < 0.07 ? 1 : 0.02 * rnd()]); }
  const r = G.estimateBpm(G.resample(smp, 8400));
  ok(r && near(r.bpm, bpm, 3), `ticks missing 15 % of the time: ${bpm} BPM → ${r && r.bpm}`);
}
// ── Dance for a tempo ──
ok(G.danceFor(0) === 'hiphop' && G.danceFor(null) === 'hiphop', 'no ear: generic hip-hop groove');
ok(G.danceFor(75) === 'sway' && G.danceFor(89.5) === 'sway', '< 90: slow sway');
ok(G.danceFor(90) === 'hiphop' && G.danceFor(114.5) === 'hiphop', '90–114: hip-hop');
ok(G.danceFor(115) === 'disco' && G.danceFor(135) === 'disco', '115–135: disco');
ok(G.danceFor(136) === 'techno' && G.danceFor(175) === 'techno', '> 135: techno');
ok(G.danceFor(G.GENERIC_BPM) === 'hiphop', 'generic tempo dances hip-hop');
// ── Several dances per range (web.282): a different one each bar ──
ok(G.rangeFor(80) === 'slow' && G.rangeFor(100) === 'mid' && G.rangeFor(0) === 'mid' && G.rangeFor(125) === 'fast' && G.rangeFor(150) === 'rush', 'tempo ranges');
ok(G.POOLS.slow.length === 4 && G.POOLS.mid.length === 5, 'slow: 4 dances, mid: 5 dances');
{
  let prev = null, rep = 0, seen = new Set(), out = 0;
  for (let i = 0; i < 400; i++) { const d = G.pickDance(i % 2 ? 80 : 100, prev, rnd); if (d === prev) rep++; if (G.POOLS[G.rangeFor(i % 2 ? 80 : 100)].indexOf(d) < 0) out++; seen.add(d); prev = d; }
  ok(rep === 0, 'never the same dance two bars in a row');
  ok(out === 0, 'always a dance of the tempo range');
  ok(seen.size === 9, `every slow and mid dance comes up (${seen.size}/9)`);
}
{ let prev = null, ok1 = true; for (let i = 0; i < 20; i++) { const d = G.pickDance(150, prev, rnd); if (d !== 'techno') ok1 = false; prev = d; } ok(ok1, 'one dance in a range: it repeats'); }


// ── End to end on synthetic audio: analyser emulation (Blackman window,
// 1024-point FFT, dB → bytes as getByteFrequencyData) + the band-energy onset
// of Music.beatLevel(), sampled at 50 Hz — then the tempo. ──
{
  const SR = 44100, N = 1024, H2 = N / 2;
  const win = Float64Array.from({ length: N }, (_, i) => 0.42 - 0.5 * Math.cos(2 * Math.PI * i / N) + 0.08 * Math.cos(4 * Math.PI * i / N));
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) {
      const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let j = 0; j < len / 2; j++) {
          const ur = re[i + j], ui = im[i + j], vr = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci, vi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr;
          re[i + j] = ur + vr; im[i + j] = ui + vi; re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
  }
  function song(bpm, style, sec = 8) {
    const x = new Float32Array(SR * sec), P = 60 / bpm;
    for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = 0.15 * Math.sin(2 * Math.PI * 110 * t) + 0.1 * Math.sin(2 * Math.PI * 220.5 * t) + 0.08 * Math.sin(2 * Math.PI * 330 * t + Math.sin(t)); }
    let k = 0;
    for (let t = 0.05; t < sec; t += P, k++) {
      const s0 = Math.round(t * SR);
      if (style !== 'halftime' || k % 2 === 0) for (let j = 0; j < SR * 0.25 && s0 + j < x.length; j++) { const tt = j / SR; x[s0 + j] += 0.9 * Math.exp(-tt * 18) * Math.sin(2 * Math.PI * (50 + 80 * Math.exp(-tt * 30)) * tt); }
      if (style === 'halftime' && k % 2 === 1) for (let j = 0; j < SR * 0.12 && s0 + j < x.length; j++) x[s0 + j] += 0.5 * Math.exp(-j / SR * 25) * (rnd() * 2 - 1);
      if (style !== 'nohat') { const h0 = Math.round((t + P / 2) * SR); for (let j = 0; j < SR * 0.05 && h0 + j < x.length; j++) x[h0 + j] += 0.25 * Math.exp(-j / SR * 60) * (rnd() * 2 - 1); }
    }
    return x;
  }
  function envelope(x) {
    const env = new Float64Array(400), hz = SR / N, hi = Math.round(2600 / hz), lb = Math.max(2, Math.round(180 / hz));
    let prev = null;
    for (let f = 0; f < 400; f++) {
      const end = Math.round((f + 1) * SR / 50), re = new Float64Array(N), im = new Float64Array(N);
      for (let i = 0; i < N; i++) { const j = end - N + i; re[i] = (j >= 0 && j < x.length ? x[j] : 0) * win[i]; }
      fft(re, im);
      let lo = 0, mid = 0;
      for (let i = 1; i <= hi && i < H2; i++) {
        const db = 20 * Math.log10(Math.hypot(re[i], im[i]) / N + 1e-12);
        const v = Math.max(0, Math.min(255, Math.round((db + 100) / 70 * 255)));
        const amp = Math.pow(10, (-100 + v * 70 / 255) / 20);
        if (i <= lb) lo += amp; else mid += amp;
      }
      const cur = [Math.log(lo + 1e-6), Math.log(mid + 1e-6)];
      env[f] = prev ? 0.7 * Math.max(0, cur[0] - prev[0]) + 0.3 * Math.max(0, cur[1] - prev[1]) : 0;
      prev = cur;
    }
    return env;
  }
  for (const [bpm, style] of [[76, 'halftime'], [92, 'normal'], [122, 'normal'], [128, 'nohat'], [140, 'normal'], [172, 'nohat']]) {
    const r = G.estimateBpm(envelope(song(bpm, style)));
    ok(r && near(r.bpm, bpm, 3) && r.conf >= G.CONF_MIN, `audio ${bpm} BPM (${style}) → ${r && r.bpm}, ${r && G.danceFor(r.bpm)}`);
  }
}

// ── Wiring ──
const read = (p) => fs.readFileSync(p, 'utf8');
const music = read('public/modules/music.mjs');
ok(/function beatLevel\(\)/.test(music) && /beatLevel: beatLevel/.test(music), 'music player exposes Music.beatLevel()');
ok(/_beatAn\.smoothingTimeConstant = 0/.test(music) && /_tail\.connect\(_beatAn\); _tail = _beatAn;/.test(music), 'rhythm analyser unsmoothed, in series');
ok(/\[_srcNode, _gain, _analyser, _beatAn, _panner\]/.test(music) && /_beatAn = null; _beatBuf = null;/.test(music), 'rhythm analyser torn down with the graph');
const dance = read('public/modules/mascot/acts-dance.mjs');
{
  const names = [].concat(G.POOLS.slow, G.POOLS.mid, G.POOLS.fast, G.POOLS.rush);
  ok(names.every((n) => new RegExp('function ' + n + '\\(H, b, t0, beats\\)').test(dance)), `${names.length} dances implemented`);
  ok(new RegExp('STYLES = \\{ ' + names.slice().sort().join(', ').replace(/\W/g, '') + ' \\}').test('') || names.every((n) => new RegExp('STYLES = \\{[^}]*\\b' + n + '\\b').test(dance)), 'every dance registered in STYLES');
}
ok(/export const DANCE = \{ groove \}/.test(dance), 'action groove exported');
const eng = read('public/modules/mascot/engine.mjs');
ok(/import \{ DANCE \} from '\.\/acts-dance\.mjs'/.test(eng) && /SOCIAL, DANCE\)/.test(eng) && /'groove', 'none'\]/.test(eng), 'engine plays groove');
const plan = read('public/modules/mascot/plan.mjs');
ok(!/export const ACTIONS = \[[^\]]*'groove'/.test(plan), 'groove is never drawn at random');
const idx = read('public/modules/mascot/index.mjs');
ok(/const DANCE_IDLE = 10000;/.test(idx), 'dances after 10 s without input');
ok(/opts\.action = 'groove'/.test(idx) && /function wantsDance\(\)/.test(idx), 'loader asks for groove while the music plays');
ok(/localStorage\.getItem\('pth_ace_dance'\) !== '0'/.test(idx), 'option on by default');
const html = read('public/pokerth-client.html'), js = read('public/pokerth.js');
ok(/id="adv-acedance" onchange="setAdvOpt\('ace_dance',this\.checked\)"/.test(html), 'switch in Advanced options');
ok(/sync\('adv-acedance', 'ace_dance', true\)/.test(js) && /'pth_ace_dance',/.test(js), 'switch synced with the account');
const langs = fs.readdirSync('public/modules/lang').filter((f) => f.endsWith('.mjs'));
const missing = langs.filter((f) => !/advAceDance:'[^']+'/.test(read('public/modules/lang/' + f)));
ok(langs.length >= 83 && !missing.length, `advAceDance in all ${langs.length} languages` + (missing.length ? ' — missing: ' + missing.join(', ') : ''));
const sw = read('public/sw.js');
ok(["acts-dance", "groove"].every((n) => sw.indexOf(`'/modules/mascot/${n}.mjs'`) >= 0), 'dance modules precached');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
