#!/usr/bin/env node
// Deterministic tests for public/modules/backup-autosave.mjs.
// The module only talks to the browser through window.*, so a handful of stubs
// (localStorage, a fake directory handle, a fake _webBackupRecord) is enough
// to drive it end to end:
//   - inert when pth_bak_auto = '0';
//   - writes only when the content signature (keys + xml, exportedAt ignored)
//     actually changed;
//   - picking a folder triggers an immediate first write;
//   - the fresh-storage detector ignores boot keys and reacts to identity keys;
//   - the restore path reports an explicit code for every failure mode.
// Run: node scripts/test-backup-autosave.mjs

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.window = globalThis;
globalThis.document = {
  readyState: 'complete',
  addEventListener: () => {},
  getElementById: () => null,
  createElement: () => ({ style: {}, setAttribute: () => {}, addEventListener: () => {}, appendChild: () => {} }),
  body: { appendChild: () => {} },
  visibilityState: 'visible',
};
globalThis.addEventListener = () => {};
globalThis.setInterval = () => 0;          // no real timers in the tests
globalThis.indexedDB = { open: () => { throw new Error('no idb in tests'); } };
globalThis.showDirectoryPicker = null;     // replaced per test

// ── Fake file system ───────────────────────────────────────────────────────
const fs = { writes: [], truncates: [], closes: 0, created: [] };

function makeDir() {
  return {
    name: 'pokerth-backups',
    getFileHandle: async (name) => {
      fs.created.push(name);
      return {
        createWritable: async () => ({
          write: (arg) => { fs.writes.push(arg); },
          truncate: (n) => { fs.truncates.push(n); },
          close: () => { fs.closes++; },
        }),
      };
    },
  };
}

let handle = makeDir();
globalThis.showDirectoryPicker = async () => handle;

// Builder stub: the meaningful contents change when `keys` is modified.
let fakeKeys = { pth_nick: 'neuling', pth_theme: 'pokerth' };
let fakeXml = '';
globalThis._webBackupRecord = () => ({
  rec: {
    format: 'pokerth-web-client', kind: 'full-backup', version: 1,
    app: 'test', exportedAt: new Date().toISOString(),
    keys: Object.assign({}, fakeKeys),
    ...(fakeXml ? { xml: fakeXml } : {}),
  },
  n: Object.keys(fakeKeys).length,
});

const mod = await import('../public/modules/backup-autosave.mjs');

let failures = 0;
function check(name, cond) {
  if (cond) { console.log('ok  -', name); }
  else { console.error('FAIL -', name); failures++; }
}

// ── _looksFresh ────────────────────────────────────────────────────────────
store.clear();
store.set('pth_deck', 'pokerth-new');       // boot key: does not count
store.set('pth_seat_dmig', '1');
check('fresh: boot keys only => fresh', mod._looksFresh() === true);
store.set('pth_nick', 'neuling');
check('fresh: identity key present => not fresh', mod._looksFresh() === false);
store.delete('pth_nick');
store.set('pth_avatar', '🙂');
check('fresh: avatar counts as identity', mod._looksFresh() === false);
store.delete('pth_avatar');

// ── _sigOf: the export timestamp is ignored ────────────────────────────────
const r1 = globalThis._webBackupRecord().rec;
await new Promise((r) => setTimeout(r, 5));
const r2 = globalThis._webBackupRecord().rec;
check('sig: same content, different exportedAt => same signature',
  mod._sigOf(r1) === mod._sigOf(r2) && mod._sigOf(r1) !== null);
const r3 = Object.assign({}, r1, { keys: { pth_nick: 'other' } });
check('sig: different keys => different signature', mod._sigOf(r1) !== mod._sigOf(r3));

// ── Option turned off: nothing is written ──────────────────────────────────
store.set('pth_bak_auto', '0');
await mod.save('test');
check('disabled: no write when pth_bak_auto=0', fs.writes.length === 0);
store.delete('pth_bak_auto');

// ── pick => première écriture immédiate ────────────────────────────────────
const picked = await mod.pickFolder();
await new Promise((r) => setTimeout(r, 20));   // save('pick') is asynchronous
check('pick: folder accepted', picked === true);
check('pick: file created with the expected name',
  fs.created.length >= 1 && fs.created.every((n) => n === 'pokerth-web-backup.json'));
check('pick: one write happened', fs.writes.length === 1 && fs.closes === 1);
check('pick: truncate matches payload', fs.truncates.length === 1
  && fs.truncates[0] === fs.writes[0].data.length);
const payload = JSON.parse(new TextDecoder().decode(fs.writes[0].data));
check('pick: payload is the backup record',
  payload.format === 'pokerth-web-client' && payload.keys.pth_nick === 'neuling');

// ── Dedupe: unchanged contents => no rewrite ───────────────────────────────
await mod.save('tick');
check('dedupe: unchanged content is not rewritten', fs.writes.length === 1);

// ── Changement de contenu => réécriture ────────────────────────────────────
fakeKeys = Object.assign({}, fakeKeys, { pth_theme: 'pokerth-light' });
await mod.save('tick');
check('change: modified keys are written', fs.writes.length === 2);

// ── The embedded config.xml is part of the signature ───────────────────────
fakeXml = '<PokerTH/>';
await mod.save('tick');
check('change: embedded xml is part of the signature', fs.writes.length === 3);

// ── State exposed to the UI ────────────────────────────────────────────────
check('state: folder name recorded', mod._state.dirName === 'pokerth-backups');
check('state: last write timestamp set', mod._state.lastAt > 0);
check('state: no error recorded', mod._state.err === null);

// ── Write hold ─────────────────────────────────────────────────────────────
// At boot storage was blank and no folder was remembered; since 2.1.8-web.10
// the banner is offered anyway (Create / Restore / Later), so the hold stays
// engaged until the player decides. Picking a folder counts as that decision:
// pickFolder() above released the hold, so writes are allowed again.
check('hold: released once a folder was picked', mod._holdState() === false);

// ── Restoring from the banner ──────────────────────────────────────────────
// Every failure must surface an explicit CODE: the banner uses it to tell the
// player what is in the way (a toast would be hidden behind the banner).
let fileText = null;                       // null = file missing from the folder
handle = {
  name: 'pokerth-backups',
  getFileHandle: async (name, opts) => {
    if (opts && opts.create) {
      return { createWritable: async () => ({ write() {}, truncate() {}, close() {} }) };
    }
    if (fileText === null) { const e = new Error('missing'); e.name = 'NotFoundError'; throw e; }
    return { getFile: async () => ({ text: async () => fileText }) };
  },
};
globalThis.location = { reload: () => {} };

check('restore: missing file => nofile', (await mod.pickForRestore()) === 'nofile');

fileText = '{not json';
check('restore: unreadable file => bad', (await mod.pickForRestore()) === 'bad');

fileText = JSON.stringify({ format: 'pokerth-web-client', keys: {} });
globalThis._applyWebBackupRec = () => -1;
check('restore: invalid record => bad', (await mod.pickForRestore()) === 'bad');

globalThis._applyWebBackupRec = () => 0;
check('restore: empty backup => empty (no reload)', (await mod.pickForRestore()) === 'empty');

globalThis._applyWebBackupRec = () => 7;
check('restore: valid backup => ok', (await mod.pickForRestore()) === 'ok');

// Cancelling the folder picker is not an error.
globalThis.showDirectoryPicker = async () => { const e = new Error('x'); e.name = 'AbortError'; throw e; };
check('restore: cancelled folder picker => abort', (await mod.pickForRestore()) === 'abort');

if (failures) { console.error(failures + ' failure(s)'); process.exit(1); }
console.log('All backup-autosave tests passed.');
