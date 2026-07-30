#!/usr/bin/env node
// Deterministic tests for public/modules/pdb-autosave.mjs.
// The module only talks to the browser through window.*, so a handful of stubs
// (localStorage, a fake directory handle, a fake _buildPdb) is enough to drive
// it end to end. Mirrors the desktop client's log.cpp behaviour:
//   LogInterval 0 = after every action, 1 = after every hand, 2 = after every
//   game; LogOnOff cuts everything; the file is written in place when the
//   browser supports the exclusive writable mode.
// Run: node scripts/test-pdb-autosave.mjs

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.window = globalThis;
globalThis.indexedDB = { open: () => { throw new Error('no idb in tests'); } };
globalThis.showDirectoryPicker = null;   // replaced per test

// ── Fake file system ───────────────────────────────────────────────────────
const fs = { writes: [], truncates: [], closes: 0, opts: [], created: [] };

function makeWritable(supportsExclusive) {
  return {
    write: (arg) => { fs.writes.push(arg); },
    truncate: (n) => { fs.truncates.push(n); },
    close: () => { fs.closes++; },
    _exclusive: supportsExclusive,
  };
}

function makeDir(supportsExclusive) {
  return {
    name: 'pokerth-logs',
    getFileHandle: async (name) => {
      fs.created.push(name);
      return {
        createWritable: async (opts) => {
          fs.opts.push(opts || null);
          if (opts && opts.mode === 'exclusive' && !supportsExclusive) {
            const e = new Error('mode not supported'); e.name = 'TypeError'; throw e;
          }
          return makeWritable(supportsExclusive);
        },
      };
    },
  };
}

let handle = makeDir(true);
globalThis.showDirectoryPicker = async () => handle;

// Recorder stub: one game, one hand.
globalThis._handlog = {
  sessionId: '2026-07-30_120000',
  toJSON: () => ({
    session: { pokerthVersion: 'web', date: '2026-07-30', time: '12:00:00', logVersion: 1 },
    games: [{ uniqueGameID: 1 }],
    players: [],
    hands: [{ handID: 1, uniqueGameID: 1 }],
    actions: [],
  }),
};
let built = 0;
globalThis._buildPdb = async () => { built++; return new Uint8Array([83, 81, 76, 105, 116, 101]); };

const M = await import('../public/modules/pdb-autosave.mjs');

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function reset() { fs.writes.length = 0; fs.truncates.length = 0; fs.opts.length = 0; fs.created.length = 0; fs.closes = 0; built = 0; }

// 1) Support detection
ok(M._supported() === true, 'supported: showDirectoryPicker + indexedDB present');

// 2) Interval parsing — parity with configfile.cpp default "1"
store.delete('pth_log_interval');
ok(M._intervalIdx() === 1, 'interval: default is 1 (after every hand), like the desktop client');
store.set('pth_log_interval', '0');
ok(M._intervalIdx() === 0, 'interval: "0" -> after every action');
store.set('pth_log_interval', '2');
ok(M._intervalIdx() === 2, 'interval: "2" -> after every game');
store.set('pth_log_interval', '7');
ok(M._intervalIdx() === 1, 'interval: out-of-range value falls back to 1');
store.set('pth_log_interval', 'action');
ok(M._intervalIdx() === 0, 'interval: legacy "action" still read');
store.set('pth_log_interval', 'hand');
ok(M._intervalIdx() === 1, 'interval: legacy "hand" still read');

// 3) Event -> write decision table (log.cpp)
store.set('pth_log_interval', '0');
ok(M._shouldWrite('action') && M._shouldWrite('hand') && M._shouldWrite('game'),
   'interval 0: action, hand and game all write');
store.set('pth_log_interval', '1');
ok(!M._shouldWrite('action') && M._shouldWrite('hand') && M._shouldWrite('game'),
   'interval 1: actions skipped, hands and games write');
store.set('pth_log_interval', '2');
ok(!M._shouldWrite('action') && !M._shouldWrite('hand') && M._shouldWrite('game'),
   'interval 2: only end of game writes');
ok(M._shouldWrite('flush') && M._shouldWrite('start') && M._shouldWrite('pick'),
   'flush/start/pick always write, whatever the interval');

// 4) Options: pth_pdb_auto and LogOnOff both cut the file
store.set('pth_pdb_auto', '0');
ok(M._enabled() === false, 'option: pth_pdb_auto=0 disables autosave');
store.delete('pth_pdb_auto');
store.set('pth_log_on', '0');
ok(M._enabled() === false, 'option: LogOnOff off disables autosave (desktop parity)');
store.delete('pth_log_on');
ok(M._enabled() === true, 'option: enabled by default');

// 5) File name follows the official pattern
ok(M._fileName() === 'pokerth-log-2026-07-30_120000.pdb', 'filename: pokerth-log-<session>.pdb');

// 6) Picking a folder writes immediately, in place
store.set('pth_log_interval', '1');
reset();
ok((await M.pickFolder()) === true, 'pickFolder: accepted');
await sleep(20);
ok(fs.created[0] === 'pokerth-log-2026-07-30_120000.pdb', 'pickFolder: file created with the session name');
ok(fs.opts[0] && fs.opts[0].mode === 'exclusive' && fs.opts[0].keepExistingData === true,
   'write: exclusive mode requested first (same inode, like the SQLite connection)');
ok(M._state.inPlace === true, 'write: in-place flag set when exclusive is supported');
ok(fs.writes[0] && fs.writes[0].type === 'write' && fs.writes[0].position === 0,
   'write: starts at offset 0');
ok(fs.truncates[0] === 6, 'write: truncated to the exact byte length');
ok(fs.closes === 1, 'write: stream closed once');

// 7) Interval respected on save()
reset();
await M.save('action');
await sleep(10);
ok(built === 0, 'interval 1: an action does not rewrite the file');
await M.save('hand');
await sleep(10);
ok(built === 1, 'interval 1: end of hand rewrites the file');

store.set('pth_log_interval', '2');
reset();
await M.save('hand');
await sleep(10);
ok(built === 0, 'interval 2: end of hand does not write');
await M.save('game');
await sleep(10);
ok(built === 1, 'interval 2: end of game writes');

// 8) Disabled -> nothing at all
store.set('pth_log_on', '0');
reset();
await M.save('flush');
await sleep(10);
ok(built === 0 && fs.closes === 0, 'LogOnOff off: even a forced flush writes nothing');
store.delete('pth_log_on');

// 9) Fallback when the browser has no exclusive mode
handle = makeDir(false);
store.set('pth_log_interval', '1');
reset();
await M.pickFolder();
await sleep(20);
ok(fs.opts.length === 2 && fs.opts[1] === null,
   'fallback: retries with the standard writable when exclusive is refused');
ok(M._state.inPlace === false, 'fallback: in-place flag cleared (atomic replace path)');
ok(fs.closes === 1, 'fallback: still exactly one close');

// 10) Action burst is coalesced, never one write per action
handle = makeDir(true);
store.set('pth_log_interval', '0');
await M.pickFolder();
await sleep(20);
reset();
for (let i = 0; i < 12; i++) await M.save('action');
await sleep(600);
ok(built <= 2, 'throttle: a burst of 12 actions collapses into at most 2 writes (' + built + ')');
ok(built >= 1, 'throttle: the burst is not dropped, at least one write happens');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All pdb-autosave tests passed.');
