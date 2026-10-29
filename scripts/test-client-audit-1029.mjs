#!/usr/bin/env node
// Audit of 2026-10-29 (web.341) — the client:
//   · a backup file (or a file POSTed by any website to /share-target, which the
//     service worker parks and the page imported at boot) could set pth_avatar /
//     pth_avatar_img to markup → script on every load; the admin token
//     (pth_admin_tok, same origin) travelled in backups;
//   · a received file is imported only after a confirm;
//   · a crafted .pdb ran script in the Journal preview (version, cash, action);
//   · my own nickname went raw into the seat bar and the spectator list.
// Run: node scripts/test-client-audit-1029.mjs   (~1 s)
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

// ── backup export / import (the real functions, out of pokerth.js) ──
const js = read('public/pokerth.js');
function grab(sig) { const s = js.indexOf(sig); if (s < 0) throw new Error('missing ' + sig); let i = js.indexOf('{', s), d = 0; for (; ; i++) { if (js[i] === '{') d++; else if (js[i] === '}' && !--d) return js.slice(s, i + 1); } }
const skip = js.slice(js.indexOf('var _BACKUP_SKIP'), js.indexOf('};', js.indexOf('var _BACKUP_SKIP')) + 2);
const never = js.slice(js.indexOf('var _BACKUP_NEVER'), js.indexOf('\n', js.indexOf('var _BACKUP_NEVER')));
const ls = new Map();
const localStorage = { getItem: (k) => ls.has(k) ? ls.get(k) : null, setItem: (k, v) => ls.set(k, String(v)), removeItem: (k) => ls.delete(k), key: (i) => [...ls.keys()][i], get length() { return ls.size; } };
const ctx = { localStorage, _achMergeIn() {}, _ACH_SYNC_KEYS: [], _cfgSyncPushSoon() {}, PTH_CFG_XML_KEY: 'pth_qml_config_xml', window: {} };
vm.runInNewContext(skip + '\n' + never + '\n' + grab('function _backupValueOk(k, v)') + grab('function _applyWebBackupRec(rec)') + grab('function _webBackupRecord()') + '; this.A=_applyWebBackupRec; this.W=_webBackupRecord;', ctx);
ctx.A({ format: 'pokerth-web-client', keys: {
  pth_avatar: '<img src=x onerror=alert(1)>', pth_avatar_img: 'x" onerror="alert(2)',
  pth_admin_tok: 'planted', pth_sound: '1' } });
ok(!ls.has('pth_avatar') && !ls.has('pth_avatar_img'), 'import: markup in pth_avatar / pth_avatar_img refused');
ok(!ls.has('pth_admin_tok'), 'import: pth_admin_* never written');
ok(ls.get('pth_sound') === '1', 'import: an ordinary setting still restored');
ctx.A({ format: 'pokerth-web-client', keys: { pth_avatar: '🦊', pth_avatar_img: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' } });
ok(ls.get('pth_avatar') === '🦊' && ls.get('pth_avatar_img').indexOf('data:image/jpeg;base64,') === 0, 'import: a real emoji and a real image still restored');
ls.set('pth_admin_tok', 'SECRET-ADMIN-TOKEN');
const exp = ctx.W().rec.keys;
ok(!('pth_admin_tok' in exp) && exp.pth_sound === '1', 'export: the admin token is left out, settings kept');

// ── share target: confirm before importing ──
const drain = grab('function _pthDrainShare()');
ok(/window\.confirm\(/.test(drain) && /shareImportQ/.test(drain), 'share target: a received file asks before it is imported');
const langs = fs.readdirSync(path.join(root, 'public/modules/lang')).filter((f) => f.endsWith('.mjs'));
let have = 0;
for (const f of langs) { const m = await import(pathToFileURL(path.join(root, 'public/modules/lang', f)).href); if (m.strings && /\{name\}/.test(m.strings.shareImportQ || '')) have++; }
ok(have === langs.length, 'shareImportQ translated with {name} in every language (' + have + '/' + langs.length + ')');

// ── avatar trigger: emoji set as text ──
const html = read('public/pokerth-client.html');
ok(/trigger\.textContent = emoji \|\|/.test(html) && !/trigger\.innerHTML = emoji/.test(html), 'avatar button: the emoji is set as text');
const AV = /\^data:image\\\/\(\?:png\|jpeg\|webp\|gif\);base64,/;
ok(AV.test(html) && AV.test(read('public/modules/ui/player-popup.mjs')) && AV.test(read('public/modules/net/msg-lobby.mjs')), 'custom image: only data:image/… is used, wherever it is read');

// ── my nickname ──
ok(/pbName\.innerHTML = esc\(S\.myName\)/.test(read('public/modules/game/seat-render.mjs')), 'seat bar: my name escaped');
ok(/'<span class="seat-initial">' \+ esc\(initial\)/.test(read('public/modules/game/seat-render.mjs')), 'seat: my avatar emoji / initial escaped');
ok(/var meName = esc\(S\.myName/.test(read('public/modules/ui/game-info.mjs')), 'spectator list: my name escaped');

// ── journal: a crafted .pdb ──
const dom = new JSDOM('<!doctype html><div id=prev></div>');
globalThis.window = dom.window; globalThis.document = dom.window.document;
const { renderLog } = await import(pathToFileURL(path.join(root, 'public/modules/journal.mjs')).href);
const tb = {
  session: { pokerthVersion: '<img src=x onerror="pwn(1)">', date: '2026-10-29', time: '<b>10</b>' },
  games: [{ uniqueGameID: 1, gameID: 1 }],
  players: [{ uniqueGameID: 1, seat: 1, player: 'Alice' }],
  hands: [{ uniqueGameID: 1, handID: 1, sbAmount: 10, bbAmount: 20, board: [], Seat_1_Cash: '<img src=x onerror="pwn(2)">' }],
  actions: [{ actionID: 1, handID: 1, uniqueGameID: 1, beRo: 0, seat: 1, action: '<img src=x onerror="pwn(3)">', amount: null },
            { actionID: 2, handID: 1, uniqueGameID: 1, beRo: 0, seat: 1, action: 'folds', amount: null }],
};
for (const modus of [1, 3]) {
  dom.window.document.getElementById('prev').innerHTML = renderLog(tb, { modus, uniqueGameID: 1, handID: 1 });
  ok(dom.window.document.querySelectorAll('#prev img, #prev [onerror]').length === 0, 'journal preview (modus ' + modus + '): no element from the file\'s text');
}
const txt = renderLog(tb, { modus: 2, uniqueGameID: 1, handID: 1 });
ok(txt.indexOf('<img src=x onerror="pwn(3)">') >= 0 && /Alice folds/.test(txt), 'journal text export (modus 2): values as they are');
const jsrc = read('public/modules/journal.mjs');
ok(/Number\.isFinite\(nv\)/.test(jsrc) && /_Hand_text\$\/\.test\(k\)/.test(jsrc), '.pdb import: cash and cards kept as numbers, hand text as text');

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
