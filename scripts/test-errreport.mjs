#!/usr/bin/env node
// Deterministic tests for public/modules/errreport.mjs.
// Run: node scripts/test-errreport.mjs
//
// The module is a thin, self-contained pipe: read window.__pthErrQ, drop what
// has already been sent, POST the rest. That makes it testable without a DOM —
// stub localStorage, document, location and fetch, then drive the queue.
//
// What matters here is the throttling, because the failure mode is nasty: a
// broken render loop can raise dozens of errors per second, and a naive
// reporter would turn one bug into a self-inflicted flood.
globalThis.window = globalThis;

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  \u2713 ' : '  \u2717 ') + label);
  if (!cond) fails++;
}

// ── Stubs ─────────────────────────────────────────────────────────
const store = {};
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
};
globalThis.location = { pathname: '/' };
globalThis.document = {
  documentElement: { lang: 'fr' },
  visibilityState: 'visible',
  addEventListener() {},
};
let sent = [];
globalThis.fetch = function (url, opt) {
  sent.push({ url, body: JSON.parse(opt.body) });
  return Promise.resolve({ ok: true });
};
globalThis.BUILD_VERSION = '9.9.9-test';
window.__pthErrQ = [];

const err = (msg, stackTop) => ({
  msg, src: 'https://x/pokerth.js', line: 1, col: 2,
  stack: 'Error: ' + msg + '\n    at ' + (stackTop || 'fn') + ' (pokerth.js:1:2)\n    at b (a.mjs:3:4)\n    at c (b.mjs:5:6)\n    at d (c.mjs:7:8)',
});

const mod = await import('../public/modules/errreport.mjs');

// ── 1. Envoi nominal ──────────────────────────────────────────────
window.__pthErrQ.push(err('boom'));
mod.flush();
ok(sent.length === 1, 'one POST for one error');
ok(sent[0].url === '/clienterr', 'posted to /clienterr');
ok(sent[0].body.ver === '9.9.9-test', 'build version travels with the report');
ok(sent[0].body.lang === 'fr', 'page language travels with the report');
ok(sent[0].body.items.length === 1, 'one item in the batch');
ok(window.__pthErrQ.length === 0, 'queue drained');

// La pile est tronquée : 4 lignes suffisent à situer un bug, au-delà on
// ferait porter au réseau du texte que personne ne lira.
ok(sent[0].body.items[0].stack.split('\n').length <= 4, 'stack truncated to 4 lines');

// Rien de personnel ne doit fuir : pas de pseudo, pas de contenu de partie.
const keys = Object.keys(sent[0].body).sort().join(',');
ok(keys === 'items,lang,mode,path,ver', 'payload limited to ver/mode/path/lang/items (no nickname, no game data)');

// ── 2. Déduplication ──────────────────────────────────────────────
sent = [];
window.__pthErrQ.push(err('boom'));   // même signature qu'au test 1
mod.flush();
ok(sent.length === 0, 'a signature already reported is never sent twice');
ok(window.__pthErrQ.length === 0, 'duplicate dropped, not left in the queue');

// ── 3. Étranglement : 10 s minimum entre deux envois ──────────────
// Une erreur nouvelle arrivant trop tôt est remise en file, pas jetée : elle
// partira au prochain passage, une fois le délai écoulé.
sent = [];
const realST = globalThis.setTimeout;
let timerFn = null;
globalThis.setTimeout = (fn) => { timerFn = fn; return 1; };
window.__pthErrQ.push(err('second bug', 'other'));
mod.flush();
ok(sent.length === 0, 'second distinct error held back by the 10 s gap');
ok(window.__pthErrQ.length === 1, 'held-back error stays queued');
ok(typeof timerFn === 'function', 'a retry timer was armed');

// Une rafale ne doit pas armer une minuterie par erreur.
const armed = [];
globalThis.setTimeout = (fn) => { armed.push(fn); return armed.length; };
window.__pthErrQ.push(err('third bug', 'third'));
mod.flush();
mod.flush();
ok(armed.length === 0, 'only one retry timer in flight during a burst');
globalThis.setTimeout = realST;

// ── 4. Plafond de signatures distinctes ───────────────────────────
// Cinq signatures par session : au-delà, on cesse d'envoyer. Un client qui
// part en vrille ne doit pas se transformer en source de trafic.
sent = [];
mod.__testReset();
for (let i = 0; i < 9; i++) window.__pthErrQ.push(err('bug ' + i, 'frame' + i));
mod.flush();
ok(sent.length === 1, 'the burst produced a single POST');
ok(sent[0].body.items.length === 5, 'at most 5 distinct signatures per session');

// ── 5. Option décochée ────────────────────────────────────────────
sent = [];
mod.__testReset();
store['pth_err_report'] = '0';
window.__pthErrQ.push(err('silent bug'));
mod.flush();
ok(sent.length === 0, 'nothing leaves when the option is off');
ok(window.__pthErrQ.length === 0, 'queue emptied anyway (no unbounded growth)');

// Défaut : activée. Une clé absente vaut « oui ».
delete store['pth_err_report'];
mod.__testReset();
window.__pthErrQ.push(err('default on'));
mod.flush();
ok(sent.length === 1, 'reporting is on by default (no stored preference)');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
