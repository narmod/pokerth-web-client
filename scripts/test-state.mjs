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

console.log('state.mjs — V0 (timer) + V1 (voix/haptique) + V2 (stats)');
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

// V2 — Stats / board / profil
ok(S._stats && S._stats.handsPlayed === 0 && Array.isArray(S._stats.history)
   && S._stats.history.length === 0, '_stats init = objet vierge');
ok(S._statsInited === false && S._statsEligible === false && S._boardEligible === false
   && S._statsOffline === false && S._gameCounted === false, 'drapeaux stats init = false');
ok(S._lifePushTimer === null, '_lifePushTimer init = null');
ok(S._statsOpen === false && S._statsTab === 'session' && S._boardSort === 'net',
   'panneau stats : fermé / onglet session / tri net');
ok(S._pimTab === 'session' && S._pimPid === 0, 'popup profil : onglet session / pid 0');

// Périmètre exact des vagues migrées (pas de fuite d'autres clés)
const keys = Object.keys(S).sort();
ok(JSON.stringify(keys) === JSON.stringify(['_SPEAK_MAX', '_boardEligible', '_boardSort',
   '_curU', '_gameCounted', '_hapticEnabled', '_lifePushTimer', '_pimPid', '_pimTab',
   '_speakQ', '_speaking', '_stats', '_statsEligible', '_statsInited', '_statsOffline',
   '_statsOpen', '_statsTab', '_timerID', '_timerSec', '_timerTot', '_voiceEnabled',
   '_voices']),
   'périmètre V0+V1+V2 exact : ' + keys.join(', '));

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
