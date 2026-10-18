// Admin › Security (delegate keys, audit log) in a real DOM, since web.134.
// Run: node scripts/test-admin-security.mjs   (needs jsdom)
//
// Tiles, the categories as a grid, one row per key with its categories as
// chips, the audit log in words with a filter and « Refused only ». Every
// call is stubbed.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'public', 'admin.html'), 'utf8');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push(e.message));

const NOW = Date.now();
const CANNED = {
  '/admin/whoami': { ok: true, master: true, scopes: [] },
  '/admin/status': { ok: true, version: '2.1.10-web.134', uptimeSec: 60, sockets: 0, update: {}, proxyCfg: {} },
  '/admin/tokens': { ok: true, available: ['broadcast', 'music', 'packages', 'leaderboard', 'polls'],
    keys: [{ name: 'radio<b>team</b>', scopes: ['broadcast', 'music'], masked: 'ab12…ef34', created: NOW - 864e5 }] },
  '/admin/audit': { ok: true, entries: [
    { at: NOW - 60000, action: 'polls', actor: 'radio<b>team</b>', ip: '203.0.113.x', ok: false, status: 403 },
    { at: NOW - 3600000, action: 'config', master: true, ip: '198.51.100.x', ok: true },
    { at: NOW - 3 * 864e5, action: 'weird-path', master: true, ip: '198.51.100.x', ok: true }] },
};
const posts = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously', url: 'https://example.org/admin', virtualConsole: vc, pretendToBeVisual: true,
  beforeParse(w) {
    w.fetch = (url, opts) => {
      if (opts && opts.method === 'POST') { try { posts.push({ url: String(url), body: JSON.parse(opts.body) }); } catch (e) {} }
      const p = String(url).split('?')[0];
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(CANNED[p] || { ok: true }), text: () => Promise.resolve('') });
    };
    w.confirm = () => true;
    w.localStorage.setItem('pth_admin_tok', 'test-token');
    w.scrollTo = () => {};
    w.HTMLElement.prototype.scrollIntoView = () => {};
  },
});
const { window } = dom;
const doc = window.document;
const $ = (id) => doc.getElementById(id);
const tiles = (id) => [...doc.querySelectorAll('#' + id + ' .ovmode')].map((m) => [...m.children].map((c) => c.textContent.trim()).join(' ')).join(' | ');
const tick = (ms) => new Promise((r) => setTimeout(r, ms || 60));
await tick(400);

const ov = readFileSync(join(root, 'public', 'modules', 'admin', 'overview.mjs'), 'utf8');
ok(/window\.PthAdmin\.auditLabel = auditLabel;/.test(ov), 'the overview module lends its audit labels to the Security page');
// The module does not run in this DOM: lend the labels the way it would.
window.PthAdmin.auditLabel = (a) => ({ config: 'Settings saved', polls: 'Poll saved' })[a] || a;

doc.querySelector('.tab[data-t="keys"]').click();
await tick(300);
ok(errors.length === 0, 'opening Security throws nothing' + (errors.length ? ': ' + errors[0] : ''));
const t = tiles('kyTiles');
ok(/Delegate keys 1 radio<b>team<\/b>/.test(t) && !doc.querySelector('#kyTiles b b'), 'the keys tile names them, as text (' + t + ')');
ok(/Changes, 24 h 2 3 in the log/.test(t) && /Refused 1 last 1 min ago/.test(t) && /Last change 1 min ago Poll saved · radio<b>team<\/b>/.test(t), 'changes, refusals and the last change');
const sc = [...doc.querySelectorAll('#kyScopes.kyscopes .kysc')];
ok(sc.length === 5, 'the five categories as a grid');
sc[1].querySelector('input').checked = true;
sc[1].querySelector('input').dispatchEvent(new window.Event('change'));
ok(sc[1].classList.contains('on'), 'a ticked category is marked');
const kr = [...doc.querySelectorAll('#kyList .kyrow')];
ok(kr.length === 1 && kr[0].querySelectorAll('.erchip').length === 2 && /Broadcasts/.test(kr[0].textContent) && /ab12…ef34/.test(kr[0].textContent), 'one row per key, categories as chips, the key masked');
ok(!kr[0].querySelector('b b') && kr[0].querySelector('.del'), 'the name as text, and Revoke');
ok(/1 key/.test($('kySum').textContent), 'the head note counts the keys');
const ar = () => [...doc.querySelectorAll('#auList .aurow')];
ok(ar().length === 3, 'one row per change');
ok(/Poll saved/.test(ar()[0].textContent) && /polls/.test(ar()[0].querySelector('small').textContent), 'the action in words, the endpoint beside it');
ok(ar()[0].classList.contains('bad') && /refused \(403\)/.test(ar()[0].textContent), 'a refused write is marked with its status');
ok(ar()[1].querySelector('.erchip.master') && /master key/.test(ar()[1].textContent), 'the master key is told apart');
ok(/weird-path/.test(ar()[2].textContent), 'an unknown action reads as it is');
$('auRefused').checked = true;
$('auRefused').dispatchEvent(new window.Event('change'));
ok(ar().length === 1 && /1 of 3 changes/.test($('auCount').textContent), 'Refused only keeps the refusal');
$('auRefused').checked = false;
$('auRefused').dispatchEvent(new window.Event('change'));
$('auFilter').value = 'settings';
$('auFilter').dispatchEvent(new window.Event('input'));
ok(ar().length === 1 && /Settings saved/.test(ar()[0].textContent), 'the filter finds an action by its words');
$('auFilter').value = 'nothing';
$('auFilter').dispatchEvent(new window.Event('input'));
ok(/No change matches/.test($('auList').textContent), 'nothing found says so');
ok(/capRows\(l, 10\)/.test(html), 'the list still stops at ten rows');
ok(errors.length === 0, 'nothing threw' + (errors.length ? ': ' + errors[0] : ''));

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
