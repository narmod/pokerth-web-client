#!/usr/bin/env node
// Deterministic tests for the network watchdog of public/modules/music.mjs.
// Simulates a Wi-Fi↔cellular handover: the transport dies, currentTime freezes
// and no event ever restarts playback. Run: node scripts/test-music-watchdog.mjs
globalThis.window = globalThis;
const _store = {};
globalThis.localStorage = {
  getItem: (k) => (k in _store ? _store[k] : null),
  setItem: (k, v) => { _store[k] = String(v); },
  removeItem: (k) => { delete _store[k]; },
};
globalThis.addEventListener = () => {};
globalThis.document = {
  readyState: 'complete', hidden: false, addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  getElementById: () => null, createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, addEventListener() {}, appendChild() {} }),
  body: { appendChild() {} },
};

// Minimal HTMLAudioElement stand-in: records play()/load() calls and src writes.
class FakeAudio {
  constructor() {
    this.paused = true; this.currentTime = 0; this.duration = 120; this.volume = 1;
    this.loop = false; this.preload = 'none'; this.error = null; this._src = '';
    this.plays = 0; this.loads = 0; this.srcWrites = 0; this._h = {};
  }
  get src() { return this._src; }
  set src(v) { this._src = v; this.srcWrites++; }
  addEventListener(ev, fn) { (this._h[ev] = this._h[ev] || []).push(fn); }
  removeEventListener(ev, fn) { this._h[ev] = (this._h[ev] || []).filter((f) => f !== fn); }
  removeAttribute() {}
  setAttribute() {}
  load() { this.loads++; }
  pause() { this.paused = true; }
  play() { this.plays++; this.paused = false; return Promise.resolve(); }
  fire(ev) { (this._h[ev] || []).slice().forEach((f) => f({ type: ev })); }
}
const made = [];
globalThis.Audio = function () { const a = new FakeAudio(); made.push(a); return a; };

const TRACKS = {
  version: 1,
  tracks: [
    { id: 'a', file: '/music/a.mp3', title: 'A' },
    { id: 'r', file: 'https://radio.example/stream', title: 'R', stream: true },
  ],
};
globalThis.fetch = async () => ({ json: async () => TRACKS });

const M = await import('../public/modules/music.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Armement / désarmement suivant l'intention de l'utilisateur ──
await M.Music.play('a');
const el = made[0];
ok(M._wdState().intent === true, 'play() arme la surveillance');
ok(el.plays === 1, 'la piste est lancée une fois');

M.Music.pause();
ok(M._wdState().intent === false, 'pause() désarme la surveillance');
await sleep(400);   // laisse passer le fondu de pause (360 ms)

await M.Music.play('a');
el.paused = false;

// ── Progression normale : aucune reprise ──
el.currentTime = 5; M._wdTick();
el.currentTime = 7; M._wdTick();
ok(M._wdState().retry === false && el.plays === 2, 'position qui avance → aucune reprise');

// ── Gel de la position (bascule réseau) : reprise programmée ──
const t0 = Date.now();
el.currentTime = 7; M._wdTick(t0);
M._wdTick(t0 + 7000);
ok(M._wdState().retry === true && M._wdState().tries === 1, 'position gelée > 6 s → reprise programmée');
await sleep(700);
ok(el.plays === 3, 'reprise douce : play() rappelé sans recharger la source');
ok(el.loads === 0, 'première tentative : pas de rechargement de la source');

// ── Deuxième tentative : rechargement + re-seek à la position mémorisée ──
el.paused = true;                       // le système nous a mis en pause
M._wdTick();
ok(M._wdState().tries === 2, 'élément en pause non demandée → nouvelle tentative');
await sleep(1300);
ok(el.loads === 1 && el.srcWrites >= 2, 'tentative dure : source rechargée');
el.fire('loadedmetadata');
ok(Math.abs(el.currentTime - 7) < 0.01, 're-seek à la position mémorisée (7 s)');

// ── 'playing' remet le compteur de tentatives à zéro ──
el.paused = false; el.currentTime = 9;
el.fire('playing');
ok(M._wdState().tries === 0 && M._wdState().busy === false, "l'événement playing réinitialise le back-off");

// ── Flux live : reprise sans re-seek (on rejoint le direct) ──
await M.Music.play('r');
el.paused = false; el.currentTime = 42; el.error = { code: 2 };   // MEDIA_ERR_NETWORK
const loadsBefore = el.loads;
M._wdRecover();
await sleep(20);
ok(el.loads === loadsBefore + 1, 'flux live : source rechargée sur erreur réseau');
el.fire('loadedmetadata');
ok(el.currentTime === 42, 'flux live : aucun re-seek imposé (on rejoint le direct)');
el.error = null;

// ── stop() coupe tout ──
M.Music.stop();
ok(M._wdState().intent === false && M._wdState().retry === false, 'stop() désarme et annule le back-off');

// ── Désarmé : tout est inerte ──
const playsIdle = el.plays;
M._wdSchedule(); M._wdRecover(); M._wdTick();
await sleep(700);
ok(el.plays === playsIdle && M._wdState().retry === false, 'désarmé → aucune reprise parasite');

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
