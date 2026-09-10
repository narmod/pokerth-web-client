/* test-live-storage — /live keeps its own store, apart from the web client.
 *
 * Same origin, one localStorage. Without namespacing, a spectator inherits the
 * player's theme and nickname, and watching a table writes into the settings
 * of the account that plays at one.
 */
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const shim = fs.readFileSync(path.join(root, 'public', 'live-storage.js'), 'utf8');
const proxy = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');

let failed = 0;
function check(name, cond) {
  if (cond) { console.log('  ok   ' + name); return; }
  console.log('  FAIL ' + name); failed++;
}

console.log('test-live-storage');

// The client has been here first and left its settings behind.
// runScripts lets window.eval see the page's own globals, which is what the
// shim needs: it runs as a page script, not as a module.
const dom = new JSDOM('<!DOCTYPE html><body></body>',
  { url: 'https://webclient.pokerth.net/live', runScripts: 'outside-only' });
const w = dom.window;
w.localStorage.setItem('pth_theme', 'casino');
w.localStorage.setItem('pth_nick', 'Arnaud');
const realStore = w.localStorage;

w.LIVE_MODE = 1;
w.eval(shim);

check('the store is replaced', w.localStorage !== realStore);
check('/live starts empty', w.localStorage.length === 0);
check("it cannot read the client's theme", w.localStorage.getItem('pth_theme') === null);

w.localStorage.setItem('pth_theme', 'officiallight');
check('/live reads back its own value',
  w.localStorage.getItem('pth_theme') === 'officiallight');
check("the client's value is untouched",
  realStore.getItem('pth_theme') === 'casino');
check('and it is stored under a namespace',
  realStore.getItem('live:pth_theme') === 'officiallight');

check('length counts only its own keys', w.localStorage.length === 1);
check('key() enumerates its own keys', w.localStorage.key(0) === 'pth_theme');

// clear() is the dangerous one: it must not wipe the player's settings.
w.localStorage.clear();
check('clear() empties /live', w.localStorage.length === 0);
check("clear() leaves the client's keys alone",
  realStore.getItem('pth_theme') === 'casino' && realStore.getItem('pth_nick') === 'Arnaud');

// sessionStorage too, and the ordinary client must be untouched.
check('sessionStorage is namespaced as well', (function () {
  w.sessionStorage.setItem('x', '1');
  return w.sessionStorage.getItem('x') === '1';
})());

const plain = new JSDOM('<!DOCTYPE html><body></body>',
  { url: 'https://webclient.pokerth.net/', runScripts: 'outside-only' });
plain.window.eval(shim);
plain.window.localStorage.setItem('pth_theme', 'casino');
check('the ordinary client is not namespaced',
  plain.window.localStorage.getItem('pth_theme') === 'casino');

check('the shim is loaded blocking, before the app module',
  proxy.indexOf("'<script src=\"/live-storage.js\"></script>'") <
  proxy.indexOf("'<script type=\"module\" src=\"/modules/live/index.mjs\"></script>'"));

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
