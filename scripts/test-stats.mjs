#!/usr/bin/env node
// Deterministic tests for public/modules/game/stats.mjs (ESM #9f-4).
// Run: node scripts/test-stats.mjs
globalThis.window = globalThis;
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [], getElementById: () => null };
globalThis.fetch = () => Promise.resolve({ ok: false });

const { S } = await import('../public/modules/game/state.mjs');
const ST = await import('../public/modules/game/stats.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// Isolation entraînement vs LAN (clé de store)
S._statsOffline = false;
ok(ST._lifeKey() === 'pth_life', 'clé lifetime LAN = pth_life');
S._statsOffline = true;
ok(ST._lifeKey() === 'pth_life_offline', 'clé entraînement isolée');
S._statsOffline = false;

// Cycle lifetime : blank → record → get → reset
ok(ST._lifeBlank().handsPlayed === 0 && ST._lifeBlank().bestStreak === 0, '_lifeBlank vierge');
S._statsEligible = true; S.myName = 'Testeur'; S._boardEligible = false;
ST._lifeRecordHand(true, 500);
ST._lifeRecordHand(false, -200);
let me = ST._lifeGet('Testeur');
ok(me.handsPlayed === 2 && me.handsWon === 1 && me.net === 300, 'record 2 mains: net 300');
ok(me.bigWin === 500 && me.bigLoss === -200, 'bigWin/bigLoss suivis');
ST._lifeRecordGame(true);
me = ST._lifeGet('Testeur');
ok(me.gamesPlayed === 1 && me.gamesWon === 1, 'partie jouée + gagnée comptées');

// _lifeMerge garde le meilleur des deux mondes
const merged = ST._lifeMerge({ handsPlayed: 5, net: 100, bigWin: 50, bigLoss: -10,
  handsWon: 2, gamesPlayed: 1, gamesWon: 0, bestStreak: 1, streak: 0 },
  { handsPlayed: 8, net: 250, bigWin: 40, bigLoss: -90, handsWon: 3,
    gamesPlayed: 2, gamesWon: 1, bestStreak: 3, streak: 2 });
ok(merged.handsPlayed === 8 && merged.net === 250 && merged.bigWin === 50
   && merged.bigLoss === -90 && merged.bestStreak === 3, '_lifeMerge max/valeurs serveur');

// Session : initStats + recordHand
ST.initStats(3000);
ok(S._stats.startMoney === 3000 && S._stats.handsPlayed === 0, 'initStats remet la session');
S._statsOpen = false; S.handNum = 4;
ST.recordHand(true, 800, [12, 25]);
ok(S._stats.handsPlayed === 1 && S._stats.bigWin === 800
   && S._stats.history[0].num === 4, 'recordHand session + historique');

// Board : tri (factory de comparateurs sur objets stats)
const pa = { net: 10, handsPlayed: 10, handsWon: 5, gamesWon: 0, bestStreak: 1 };
const pb = { net: 90, handsPlayed: 10, handsWon: 2, gamesWon: 1, bestStreak: 3 };
ok([pa, pb].sort(ST._boardCmp('net'))[0] === pb, "_boardCmp('net') : net décroissant");
ok([pa, pb].sort(ST._boardCmp('winrate'))[0] === pa, "_boardCmp('winrate') : meilleur taux d'abord");
ok([pa, pb].sort(ST._boardCmp('streak'))[0] === pb, "_boardCmp('streak') : meilleure série d'abord");
ok(ST._boardPer100({ net: 50, handsPlayed: 25 }) === 200, '_boardPer100 = 200');
ok(Math.abs(ST._boardWinRate({ handsWon: 3, handsPlayed: 12 }) - 0.25) < 1e-9, '_boardWinRate = 0.25 (fraction)');

// pas d'envoi board si non éligible
let fetched = 0; globalThis.fetch = () => { fetched++; return Promise.resolve({ ok: false }); };
S._boardEligible = false; ST._pushStats();
ok(fetched === 0, '_pushStats inerte hors serveur privé/LAN');

ok(window.recordHand === ST.recordHand && window.renderStats === ST.renderStats
   && window._lifeGet === ST._lifeGet, 'ponts window en place');

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
