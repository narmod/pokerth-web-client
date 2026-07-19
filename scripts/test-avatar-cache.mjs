#!/usr/bin/env node
// Deterministic tests for public/modules/net/avatar-cache.mjs (step 9c of
// docs/ESM_PLAN.md). Pure localStorage layer -> in-memory stub with optional
// quota simulation; btoa polyfilled for the data-URL assembly.
// Run: node scripts/test-avatar-cache.mjs

let quotaFull = false;
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => {
    if (quotaFull) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; }
    store.set(k, String(v));
  },
  removeItem: (k) => store.delete(k),
};
globalThis.btoa = (bin) => Buffer.from(bin, 'binary').toString('base64');
globalThis.window = globalThis;

const M = await import('../public/modules/net/avatar-cache.mjs');

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const lru = () => JSON.parse(store.get('pthAv:_lru') || '[]');

// 1) put/get roundtrip + type parsing
M._pthCachePut('aaa', 2, 'data:image/jpeg;base64,AAA');
const g = M._pthCacheGet('aaa');
ok(g && g.type === 2 && g.dataUrl === 'data:image/jpeg;base64,AAA', 'put/get roundtrip (type 2 jpeg)');
ok(store.get('pthAv:aaa') === '2|data:image/jpeg;base64,AAA', "storage format '<type>|<dataUrl>'");

// 2) LRU: get touche l'entrée en tête ; put insère en tête
M._pthCachePut('bbb', 1, 'data:image/png;base64,BBB');
ok(lru()[0] === 'bbb', 'put met en tête');
M._pthCacheGet('aaa');
ok(lru()[0] === 'aaa' && lru()[1] === 'bbb', 'get remonte en tête (touch LRU)');

// 3) miss + entrée corrompue -> null
ok(M._pthCacheGet('zzz') === null, 'miss -> null');
store.set('pthAv:bad', 'sans-separateur');
ok(M._pthCacheGet('bad') === null, 'entrée sans | -> null');

// 4) Éviction au-delà du plafond 200
store.clear();
for (let i = 0; i < 205; i++) M._pthCachePut('h' + i, 1, 'data:x,' + i);
ok(lru().length === 200, 'LRU plafonnée à 200 (' + lru().length + ')');
ok(store.get('pthAv:h0') === undefined && store.get('pthAv:h4') === undefined,
   'les 5 plus anciennes évincées (entrée + clé supprimées)');
ok(store.get('pthAv:h204') !== undefined, 'la plus récente conservée');

// 5) Quota dépassé : éviction de moitié puis retry, sans jeter
quotaFull = true;
const origSet = globalThis.localStorage.setItem;
let attempts = 0;
globalThis.localStorage.setItem = (k, v) => {
  attempts++;
  if (attempts <= 1) { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; }
  store.set(k, String(v));
};
M._pthCachePut('quota-test', 1, 'data:x,q');
ok(store.get('pthAv:quota-test') === '1|data:x,q', 'quota: retry après éviction de moitié réussit');
ok(lru().length <= 101, 'quota: environ la moitié évincée (' + lru().length + ')');
globalThis.localStorage.setItem = origSet; quotaFull = false;

// 6) _pthAssembleDataUrl : chunks -> data:URL, MIME par type, gros volume
const c1 = new Uint8Array([137, 80, 78, 71]);          // en-tête PNG
const c2 = new Uint8Array([13, 10, 26, 10]);
const url = M._pthAssembleDataUrl([c1, c2], 1);
ok(url.startsWith('data:image/png;base64,'), 'assemble: MIME png (type 1)');
ok(Buffer.from(url.split(',')[1], 'base64').equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
   'assemble: chunks concaténés dans l\'ordre, octets exacts');
ok(M._pthAssembleDataUrl([c1], 2).startsWith('data:image/jpeg') &&
   M._pthAssembleDataUrl([c1], 3).startsWith('data:image/gif'), 'assemble: MIME jpeg/gif (types 2/3)');
const big = new Uint8Array(100000).fill(65);           // > lot de 4096
const bigUrl = M._pthAssembleDataUrl([big], 1);
ok(Buffer.from(bigUrl.split(',')[1], 'base64').length === 100000,
   'assemble: 100 Ko en lots de 4096 sans débordement de pile');

// 7) Storage HS : tout retombe silencieusement
globalThis.localStorage.getItem = () => { throw new Error('disabled'); };
ok(M._pthCacheGet('aaa') === null && Array.isArray(M._pthLoadLruList()), 'storage HS -> null / [] silencieux');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All avatar-cache tests passed.');
