#!/usr/bin/env node
// Deterministic tests for public/modules/backup-autosave.mjs.
// The module only talks to the browser through window.*, so a handful of stubs
// (localStorage, a fake directory handle, a fake _webBackupRecord) is enough
// to drive it end to end:
//   - inert when pth_bak_auto = '0';
//   - writes only when the content signature (keys + xml, exportedAt ignored)
//     actually changed;
//   - picking a folder triggers an immediate first write;
//   - the fresh-storage detector ignores boot keys and reacts to identity keys.
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
globalThis.setInterval = () => 0;          // pas de timers réels dans les tests
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

// Builder stub : le contenu utile change quand on modifie `keys`.
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
store.set('pth_deck', 'pokerth-new');       // clé de boot : ne compte pas
store.set('pth_seat_dmig', '1');
check('fresh: boot keys only => fresh', mod._looksFresh() === true);
store.set('pth_nick', 'neuling');
check('fresh: identity key present => not fresh', mod._looksFresh() === false);
store.delete('pth_nick');
store.set('pth_avatar', '🙂');
check('fresh: avatar counts as identity', mod._looksFresh() === false);
store.delete('pth_avatar');

// ── _sigOf : l'horodatage d'export est ignoré ──────────────────────────────
const r1 = globalThis._webBackupRecord().rec;
await new Promise((r) => setTimeout(r, 5));
const r2 = globalThis._webBackupRecord().rec;
check('sig: same content, different exportedAt => same signature',
  mod._sigOf(r1) === mod._sigOf(r2) && mod._sigOf(r1) !== null);
const r3 = Object.assign({}, r1, { keys: { pth_nick: 'other' } });
check('sig: different keys => different signature', mod._sigOf(r1) !== mod._sigOf(r3));

// ── Option coupée : rien n'est écrit ───────────────────────────────────────
store.set('pth_bak_auto', '0');
await mod.save('test');
check('disabled: no write when pth_bak_auto=0', fs.writes.length === 0);
store.delete('pth_bak_auto');

// ── pick => première écriture immédiate ────────────────────────────────────
const picked = await mod.pickFolder();
await new Promise((r) => setTimeout(r, 20));   // save('pick') est asynchrone
check('pick: folder accepted', picked === true);
check('pick: file created with the expected name',
  fs.created.length >= 1 && fs.created.every((n) => n === 'pokerth-web-backup.json'));
check('pick: one write happened', fs.writes.length === 1 && fs.closes === 1);
check('pick: truncate matches payload', fs.truncates.length === 1
  && fs.truncates[0] === fs.writes[0].data.length);
const payload = JSON.parse(new TextDecoder().decode(fs.writes[0].data));
check('pick: payload is the backup record',
  payload.format === 'pokerth-web-client' && payload.keys.pth_nick === 'neuling');

// ── Dédoublonnage : même contenu => pas de réécriture ──────────────────────
await mod.save('tick');
check('dedupe: unchanged content is not rewritten', fs.writes.length === 1);

// ── Changement de contenu => réécriture ────────────────────────────────────
fakeKeys = Object.assign({}, fakeKeys, { pth_theme: 'pokerth-light' });
await mod.save('tick');
check('change: modified keys are written', fs.writes.length === 2);

// ── config.xml embarqué compte dans la signature ───────────────────────────
fakeXml = '<PokerTH/>';
await mod.save('tick');
check('change: embedded xml is part of the signature', fs.writes.length === 3);

// ── État exposé pour l'UI ──────────────────────────────────────────────────
check('state: folder name recorded', mod._state.dirName === 'pokerth-backups');
check('state: last write timestamp set', mod._state.lastAt > 0);
check('state: no error recorded', mod._state.err === null);

if (failures) { console.error(failures + ' failure(s)'); process.exit(1); }
console.log('All backup-autosave tests passed.');
