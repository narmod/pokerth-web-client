#!/usr/bin/env node
// Deterministic tests for public/modules/sounds.mjs — mute handling.
// Run: node scripts/test-sounds.mjs
//
// The mute flag ('pth_sound') is shared through localStorage by every window
// of the same browser (tab + installed PWA, a spectated table alongside a
// played one). The module therefore re-reads it before each sound instead of
// trusting the value captured at load time. These tests pin that down without
// a browser: a fake AudioContext counts how many times audio is actually set
// up, so a muted call can be proven to bail out before touching audio at all.
globalThis.window = globalThis;

// ── Storage stub ──────────────────────────────────────────────────────────
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => { store.set(k, String(v)); },
  removeItem: (k) => { store.delete(k); },
  clear: () => store.clear()
};

// ── DOM stub ──────────────────────────────────────────────────────────────
const winL = {}, docL = {};
const btn = { innerHTML: '', style: {}, title: '', id: 'sound-toggle-btn' };
globalThis.document = {
  hidden: false,
  addEventListener(ev, fn) { (docL[ev] = docL[ev] || []).push(fn); },
  getElementById: (id) => (id === 'sound-toggle-btn' ? btn : null),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, classList: { toggle() {}, add() {} }, setAttribute() {}, appendChild() {}, querySelector: () => null, remove() {} }),
  removeEventListener() {}
};
globalThis.addEventListener = (ev, fn) => { (winL[ev] = winL[ev] || []).push(fn); };
globalThis.removeEventListener = () => {};
function fire(map, ev, arg) { (map[ev] || []).forEach((f) => f(arg)); }

// ── Audio stub : counts every oscillator actually created ─────────────────
let oscCount = 0;
class FakeAudioContext {
  constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
  createGain() { return { gain: { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
  createOscillator() {
    oscCount++;
    return { type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, start() {}, stop() {} };
  }
  createBuffer() { return {}; }
  createBufferSource() { return { buffer: null, connect() {}, start() {} }; }
  decodeAudioData() {}
  resume() {}
  close() {}
}
globalThis.AudioContext = FakeAudioContext;
// Node exposes navigator as a getter-only global: redefine it instead.
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: { userActivation: { isActive: false, hasBeenActive: true } }
});
globalThis.fetch = () => Promise.reject(new Error('offline test'));  // samples unavailable → synth fallback

const S = await import('../public/modules/sounds.mjs');

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('  ✗ ' + label); fails++; } else console.log('  ✓ ' + label);
}
function eq(a, b, label) { ok(a === b, label + '  (got ' + a + ', want ' + b + ')'); }

// ── 1. Default state ──────────────────────────────────────────────────────
eq(S.isSoundEnabled(), true, 'sound on when the key is absent');
oscCount = 0;
S.playTone(440, 0.05, 0.1);
eq(oscCount, 1, 'unmuted playTone creates an oscillator');

// ── 2. Muted from ANOTHER window (storage written behind our back) ────────
localStorage.setItem('pth_sound', '0');
eq(S.isSoundEnabled(), false, 'mute written elsewhere is seen without a reload');
oscCount = 0;
S.playTone(440, 0.05, 0.1);
eq(oscCount, 0, 'muted playTone bails out before touching audio');
S.notifyCard(); S.notifyFold(); S.notifyLobbyChat(); S.notifyPlayerConnected(); S.notifyGameReady();
eq(oscCount, 0, 'no notify* path leaks a sound while muted');
eq(window._soundEnabled, false, 'legacy global reflects the shared state');

// ── 3. The header button follows a change made in another window ──────────
btn.style.opacity = ''; btn.title = '';
fire(winL, 'storage', { key: 'pth_sound' });
eq(btn.style.opacity, '0.5', 'storage event dims the header button');
eq(btn.title, 'Unmute', 'storage event relabels the header button');

// ── 4. Un-muting elsewhere restores sound ─────────────────────────────────
localStorage.setItem('pth_sound', '1');
eq(S.isSoundEnabled(), true, 'un-mute written elsewhere is picked up');
oscCount = 0;
S.playTone(440, 0.05, 0.1);
eq(oscCount, 1, 'sound plays again after an external un-mute');
fire(docL, 'visibilitychange');
eq(btn.style.opacity, '', 'returning to the foreground restores the button');

// ── 5. Local toggle still persists ────────────────────────────────────────
S.toggleSound();
eq(localStorage.getItem('pth_sound'), '0', 'toggleSound persists the mute');
eq(S.isSoundEnabled(), false, 'toggleSound mutes immediately');
S.toggleSound();
eq(localStorage.getItem('pth_sound'), '1', 'toggleSound persists the un-mute');

// ── 6. Category switches stay independent of the master mute ──────────────
localStorage.setItem('pth_snd_actions', '0');
oscCount = 0;
S.notifyCard();
eq(oscCount, 0, 'actions category off silences the deal sound');
localStorage.setItem('pth_snd_actions', '1');
oscCount = 0;
S.notifyCard();
eq(oscCount, 1, 'actions category back on restores it');

console.log(fails ? '\n' + fails + ' failure(s)' : '\nAll sound tests passed');
process.exit(fails ? 1 : 0);
