#!/usr/bin/env node
// Deterministic tests for the lazy sql.js loader in modules/handlog.mjs.
// Run: node scripts/test-sqljs-load.mjs
//
// sql.js fetches its .wasm with fetch(...).then(...) and no rejection handler:
// one failed fetch raised "Unhandled rejection: Failed to fetch" and left
// initSqlJs() pending for the rest of the session. The loader now fetches the
// binary itself, retries, passes it as wasmBinary, rejects on final failure
// and starts over on the next call.
let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + label);
  if (!cond) fails++;
}

const realSetTimeout = globalThis.setTimeout;
globalThis.setTimeout = (fn) => realSetTimeout(fn, 0);   // retries without the wait

let fetchPlan = [];
const fetched = [];
const inits = [];
globalThis.window = {
  _sqlJsUrl: '/vendor/sql-wasm.js', _sqlJsWasmUrl: '/vendor/sql-wasm.wasm',
  initSqlJs: (opts) => { inits.push(opts); return Promise.resolve({ Database: function () {} }); },
};
globalThis.document = { head: { appendChild() {} }, createElement: () => ({}) };
globalThis.fetch = (url) => {
  fetched.push(url);
  const step = fetchPlan.shift() || 'ok';
  if (step === 'net') return Promise.reject(new TypeError('Failed to fetch'));
  if (step === '503') return Promise.resolve({ ok: false, status: 503 });
  return Promise.resolve({ ok: true, status: 200, arrayBuffer: () => Promise.resolve(new Uint8Array([0, 97, 115, 109]).buffer) });
};

await import('../public/modules/handlog.mjs');
const load = window._loadSqlJs;
ok(typeof load === 'function', 'handlog.mjs exposes window._loadSqlJs');

// Every attempt fails: the caller gets a rejection, nothing hangs.
fetchPlan = ['net', '503', 'net'];
let err = null;
try { await load(); } catch (e) { err = e; }
ok(err && /Failed to fetch/.test(err.message), 'three failed fetches reject to the caller');
ok(fetched.length === 3 && fetched[1] === '/vendor/sql-wasm.wasm?r=1' && fetched[2] === '/vendor/sql-wasm.wasm?r=2',
   'retries carry a cache-buster');
ok(inits.length === 0, 'sql.js is not initialised without a binary');

// Next call starts over and succeeds after one flake.
fetched.length = 0; fetchPlan = ['net', 'ok'];
const SQL = await load();
ok(SQL && typeof SQL.Database === 'function', 'a later call recovers');
ok(fetched.length === 2, 'one flake, one retry');
ok(inits.length === 1 && inits[0].wasmBinary instanceof Uint8Array && inits[0].wasmBinary.length === 4,
   'the binary is handed to sql.js as wasmBinary (sql.js never fetches it itself)');

// Cached afterwards; concurrent calls share one load.
fetched.length = 0;
const [a, b] = await Promise.all([load(), load()]);
ok(a === SQL && b === SQL && fetched.length === 0 && inits.length === 1, 'loaded once, then cached');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
