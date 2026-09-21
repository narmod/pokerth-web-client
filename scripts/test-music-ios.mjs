#!/usr/bin/env node
// Deterministic tests for the iOS playback path of public/modules/music.mjs.
// On iPhone/iPad the player must NOT build a Web Audio graph by default (CarPlay,
// Bluetooth and the lock screen interrupt the AudioContext, heard as a one-second
// play/stop loop); the graph is opt-in. Also checks that the rebuild budget is
// not refilled by a bare 'playing' event. Run: node scripts/test-music-ios.mjs
globalThis.window = globalThis;
const _store = {};
globalThis.localStorage = {
  getItem: (k) => (k in _store ? _store[k] : null),
  setItem: (k, v) => { _store[k] = String(v); },
  removeItem: (k) => { delete _store[k]; },
};
globalThis.addEventListener = () => {};
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15', platform: 'iPhone', maxTouchPoints: 5,
} });
globalThis.document = {
  readyState: 'complete', hidden: false, addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  getElementById: () => null, createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, addEventListener() {}, appendChild() {} }),
  body: { appendChild() {} },
};
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};

class FakeAudio {
  constructor() {
    this.paused = true; this.currentTime = 0; this.duration = 120; this.volume = 1;
    this.loop = false; this.preload = 'none'; this.error = null; this._src = ''; this.plays = 0; this._h = {};
  }
  get src() { return this._src; }
  set src(v) { this._src = v; }
  get currentSrc() { return this._src; }
  addEventListener(ev, fn) { (this._h[ev] = this._h[ev] || []).push(fn); }
  removeEventListener(ev, fn) { this._h[ev] = (this._h[ev] || []).filter((f) => f !== fn); }
  removeAttribute(n) { if (n === 'src') this._src = ''; }
  setAttribute() {}
  load() {}
  pause() { this.paused = true; }
  play() { this.plays++; this.paused = false; return Promise.resolve(); }
  fire(ev) { (this._h[ev] || []).slice().forEach((f) => f({ type: ev })); }
}
const made = [];
globalThis.Audio = function () { const a = new FakeAudio(); made.push(a); return a; };

const ctxs = [];
const node = () => ({ connect() {}, disconnect() {}, gain: { value: 1, cancelScheduledValues() {}, setValueAtTime() {}, linearRampToValueAtTime() {} }, pan: { value: 0 }, frequencyBinCount: 32, getByteFrequencyData() {} });
class FakeAC {
  constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; this.closed = false; ctxs.push(this); }
  createMediaElementSource(el) { this.el = el; return node(); }
  createGain() { return node(); }
  createAnalyser() { return node(); }
  createStereoPanner() { return node(); }
  resume() { return Promise.resolve(); }
  close() { this.closed = true; this.state = 'closed'; return Promise.resolve(); }
}
globalThis.AudioContext = FakeAC;

globalThis.fetch = async () => ({ ok: false, json: async () => ({ version: 1, tracks: [{ id: 'a', file: '/music/a.mp3', title: 'A' }] }) });

const M = await import('../public/modules/music.mjs');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// ── Default on iOS: bare <audio>, no AudioContext ──
ok(M.Music.getIosGraph() === false, 'iOS: graph option is off by default');
await M.Music.play('a');
ok(made.length === 1 && made[0].plays === 1, 'iOS default: the track plays on the element');
ok(ctxs.length === 0, 'iOS default: no AudioContext is ever created');

// ── Opt-in: the graph is built on the playing element, no restart ──
M.Music.setIosGraph(true);
ok(ctxs.length === 1 && ctxs[0].el === made[0], 'option on: graph built on the current element');
ok(made.length === 1, 'option on: the element is not rebuilt');

// ── 'playing' alone must not refill the rebuild budget (the 1-second loop) ──
made[made.length - 1].paused = false;
for (let i = 0; i < 8; i++) {
  ctxs[ctxs.length - 1].state = 'interrupted';
  M._wdRecover();                                   // → _resumeCtx() → rebuild
  await new Promise((r) => setTimeout(r, 0));
  const el = made[made.length - 1]; el.paused = false; el.fire('playing');
}
ok(ctxs.length === 1 + 4, 'interrupted context: at most 4 consecutive rebuilds (got ' + (ctxs.length - 1) + ')');

// ── Sustained progress refills the budget ──
{
  const el = made[made.length - 1];
  const t0 = Date.now();
  el.currentTime = 1; M._wdTick(t0 + 1000);
  el.currentTime = 12; M._wdTick(t0 + 11000);
  ctxs[ctxs.length - 1].state = 'interrupted';
  const before = ctxs.length;
  M._wdRecover();
  await new Promise((r) => setTimeout(r, 0));
  ok(ctxs.length === before + 1, '10 s of real playback → a rebuild is allowed again');
}

// ── Opt-out: the graph is torn down for good, playback carries on bare ──
{
  made[made.length - 1].paused = false;
  const elBefore = made.length, ctxBefore = ctxs.length, last = ctxs[ctxs.length - 1];
  M.Music.setIosGraph(false);
  ok(last.closed === true, 'option off: the context is closed');
  ok(made.length === elBefore + 1 && ctxs.length === ctxBefore, 'option off: fresh element, no new context');
  ok(made[made.length - 1].plays === 1 && made[made.length - 1].src.indexOf('/music/a.mp3') >= 0, 'option off: playback resumes on the bare element');
}

M.Music.stop();
console.log((fail ? 'FAIL ' : 'PASS ') + (n - fail) + '/' + n);
process.exit(fail ? 1 : 0);
