#!/usr/bin/env node
// Deterministic tests for public/modules/game/state.mjs (chantier ESM #9e,
// vague V0 — docs/ESM_PLAN.md). Vérifie la forme du store partagé S, les
// valeurs initiales du domaine migré (timer de tour) et le pont legacy
// window.PthState. Run: node scripts/test-state.mjs

globalThis.window = globalThis;

const { S } = await import('../public/modules/game/state.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

console.log('state.mjs — V0 (timer de tour)');
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

// V0 : périmètre exact — uniquement le domaine F (pas de fuite d'autres clés)
const keys = Object.keys(S).sort();
ok(JSON.stringify(keys) === JSON.stringify(['_timerID', '_timerSec', '_timerTot']),
   'périmètre V0 exact : ' + keys.join(', '));

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
