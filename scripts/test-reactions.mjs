#!/usr/bin/env node
// Deterministic tests for public/modules/ui/reactions.mjs (extraction #6 of
// docs/ESM_PLAN.md). DOM module -> minimal stubs installed before import.
// The critical invariant here is the two-channel dedup (REACT: + /emoji, the
// sp0ck QML interop): same reaction via the OTHER channel within 1.5 s must
// be swallowed, later or same-channel ones must count.
// Run: node scripts/test-reactions.mjs

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const fakeEl = () => ({
  style: {}, classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
  setAttribute() {}, appendChild() {}, remove() {}, querySelector() { return null; },
  getBoundingClientRect() { return { left: 0, top: 0, width: 10, height: 10 }; },
  textContent: '',
});
globalThis.document = {
  body: Object.assign(fakeEl(), { appendChild() {} }),
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  createElement() { return fakeEl(); },
  addEventListener() {},
};
globalThis.window = globalThis;
globalThis.seats = [101, 102, 103];        // exposés par l'IIFE App via defineProperty
globalThis.myId = 101;                     // (getters window.seats / window.myId, L10664)

const M = await import('../public/modules/ui/reactions.mjs');

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
// Compteur observable : on espionne updateReactionCount indirectement via les
// appels playTone (1 par réaction acceptée).
let tones = 0;
globalThis.playTone = () => { tones++; };

// 1) Réaction acceptée pour un siège connu
window.handleIncomingReaction(101, '🔥', 'react');
ok(tones === 1, 'reaction from seated player accepted (tone fired)');

// 2) Dédup inter-canaux : même pid+emoji via /emoji < 1,5 s -> avalée
window.handleIncomingReaction(101, '🔥', 'emoji');
ok(tones === 1, 'same reaction via OTHER channel within 1.5s deduplicated (sp0ck interop)');

// 3) Même canal répété -> compte (spam volontaire d'un même joueur)
window.handleIncomingReaction(101, '🔥', 'emoji');
ok(tones === 2, 'same channel repeat is NOT deduplicated');

// 4) Autre emoji ou autre joueur -> compte
window.handleIncomingReaction(101, '😂', 'react');
window.handleIncomingReaction(102, '🔥', 'react');
ok(tones === 4, 'different emoji / different player both count');

// 5) Joueur hors table -> ignoré
window.handleIncomingReaction(999, '🔥', 'react');
ok(tones === 4, 'unknown pid ignored');

// 6) Mute coupe tout, persiste, et le pont defineProperty voit l'état
M.setReactMuted(true);
ok(window._reactMuted === true, 'setReactMuted(true) visible via bridge');
ok(store.get('pth_react_muted') === '1', 'mute persisted to pth_react_muted');
window.handleIncomingReaction(103, '🔥', 'react');
ok(tones === 4, 'muted: incoming reaction fully ignored');
M.setReactMuted(false);
ok(window._reactMuted === false && store.get('pth_react_muted') === '0', 'unmute + persistence');

// 7) Écriture nue du monolithe (mode sloppy) -> setter du pont
window._reactMuted = true;
window.handleIncomingReaction(103, '🎉', 'react');
ok(tones === 4, 'bare-assignment mute reaches module state');
window._reactMuted = false;

// 8) Pont _reactPinned lisible/écrivable
window._reactPinned = true;
ok(window._reactPinned === true, '_reactPinned bridge read/write');
window._reactPinned = false;

// 9) Alias et namespace en place
ok(typeof window.setReactMuted === 'function' && typeof window._applyReactMuteUI === 'function'
   && typeof window.Reactions.playReactionFx === 'function', 'legacy aliases + Reactions namespace');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All reactions tests passed.');
