#!/usr/bin/env node
// Deterministic tests for public/modules/game/state.mjs (chantier ESM #9e,
// vague V0 — docs/ESM_PLAN.md). Vérifie la forme du store partagé S, les
// valeurs initiales du domaine migré (timer de tour) et le pont legacy
// window.PthState. Run: node scripts/test-state.mjs

globalThis.window = globalThis;
// Les initialiseurs V1 lisent localStorage au chargement du module.
const ls = new Map();
globalThis.localStorage = {
  getItem: (k) => (ls.has(k) ? ls.get(k) : null),
  setItem: (k, v) => ls.set(k, String(v)),
  removeItem: (k) => ls.delete(k),
};

const { S } = await import('../public/modules/game/state.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

console.log('state.mjs — V0 (timer) + V1 (voix/haptique)');
ok(typeof S === 'object' && S !== null, 'S est un objet');
ok(window.PthState === S, 'pont window.PthState === S (même référence)');

// Valeurs initiales strictement identiques aux anciennes déclarations
ok(S._timerID === null, '_timerID init = null');
ok(S._timerSec === 0, '_timerSec init = 0');
ok(S._timerTot === 30, '_timerTot init = 30');

// Le store est mutable et partagé (comportement attendu par pokerth.js)
S._timerSec = 12;
ok(window.PthState._timerSec === 12, 'mutation visible via le pont');
S._timerSec = 0;

// V1 — Voix / haptique : défauts (localStorage vide → haptic ON, voix OFF)
ok(S._hapticEnabled === true, '_hapticEnabled défaut = true (pth_haptic absent)');
ok(S._voiceEnabled === false, '_voiceEnabled défaut = false (pth_voice absent)');
ok(Array.isArray(S._voices) && S._voices.length === 0, '_voices init = []');
ok(Array.isArray(S._speakQ) && S._speakQ.length === 0, '_speakQ init = []');
ok(S._speaking === false, '_speaking init = false');
ok(S._curU === null, '_curU init = null');
ok(S._SPEAK_MAX === 4, '_SPEAK_MAX init = 4');

// Périmètre exact des vagues migrées (pas de fuite d'autres clés)
const keys = Object.keys(S).sort();
ok(JSON.stringify(keys) === JSON.stringify(['_SPEAK_MAX', '_curU', '_hapticEnabled',
   '_speakQ', '_speaking', '_timerID', '_timerSec', '_timerTot', '_voiceEnabled',
   '_voices']),
   'périmètre V0+V1 exact : ' + keys.join(', '));

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
