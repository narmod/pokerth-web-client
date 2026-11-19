#!/usr/bin/env node
// Where the admin page keeps its key (web.134), in a DOM:
//  · by default in this tab's sessionStorage — /live and the client share the
//    origin's localStorage, not another tab's sessionStorage;
//  · « Remember on this device » keeps it in localStorage, as before;
//  · a key stored before web.134 without that choice moves into the tab
//    (still logged in, gone from localStorage); a remembered one stays;
//  · Log out clears both stores and the choice.
// Run: node scripts/test-admin-key-storage.mjs
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'public', 'admin.html'), 'utf8');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }
const tick = (ms) => new Promise((r) => setTimeout(r, ms || 60));

async function page(seed) {
  const vc = new VirtualConsole();
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', url: 'https://example.org/admin', virtualConsole: vc, pretendToBeVisual: true,
    beforeParse(w) {
      w.fetch = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ ok: true }), text: () => Promise.resolve('') });
      w.confirm = () => true; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      for (const [k, v] of Object.entries(seed || {})) w.localStorage.setItem(k, v);
    },
  });
  await tick(250);
  return dom.window;
}
const dashShown = (w) => w.document.getElementById('dash').style.display !== 'none';

// 1. A key from before web.134, no choice recorded: moves into the tab.
let w = await page({ pth_admin_tok: 'old-key' });
ok(w.localStorage.getItem('pth_admin_tok') === null && w.sessionStorage.getItem('pth_admin_tok') === 'old-key',
  'an old stored key moves from localStorage into the tab');
ok(dashShown(w), 'and the admin stays logged in');
ok(w.document.getElementById('lrem') && w.document.getElementById('lrem').checked === false, 'the box is unticked');

// 2. A remembered key stays where it is.
w = await page({ pth_admin_tok: 'kept-key', pth_admin_remember: '1' });
ok(w.localStorage.getItem('pth_admin_tok') === 'kept-key' && w.sessionStorage.getItem('pth_admin_tok') === null && dashShown(w),
  'a remembered key stays in localStorage, logged in');
ok(w.document.getElementById('lrem').checked === true, 'and the box shows it');

// 3. Logging in, box unticked: tab only.
w = await page({});
ok(!dashShown(w), 'no key: the login screen');
w.document.getElementById('ltok').value = '  tab-key  ';
w.document.getElementById('loginBtn').click();
await tick(150);
ok(w.sessionStorage.getItem('pth_admin_tok') === 'tab-key' && w.localStorage.getItem('pth_admin_tok') === null
  && w.localStorage.getItem('pth_admin_remember') === null, 'log in, box unticked: the key is in the tab only');

// 4. Logging in, box ticked: localStorage, and no copy in the tab.
w = await page({});
w.sessionStorage.setItem('pth_admin_tok', 'stale');
w.document.getElementById('ltok').value = 'device-key';
w.document.getElementById('lrem').checked = true;
w.document.getElementById('loginBtn').click();
await tick(150);
ok(w.localStorage.getItem('pth_admin_tok') === 'device-key' && w.localStorage.getItem('pth_admin_remember') === '1'
  && w.sessionStorage.getItem('pth_admin_tok') === null, 'log in, box ticked: remembered on the device');

// 5. Log out clears everything.
w.document.getElementById('logoutBtn').click();
await tick(100);
ok(w.localStorage.getItem('pth_admin_tok') === null && w.localStorage.getItem('pth_admin_remember') === null
  && w.sessionStorage.getItem('pth_admin_tok') === null && !dashShown(w), 'log out: both stores and the choice are cleared');

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
