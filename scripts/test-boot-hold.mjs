#!/usr/bin/env node
// Boot hold (2.1.11-web.13): a gesture that reaches an inline on* handler
// calling a global that does not exist yet (App.x(), toggleConnectOverflow…)
// is held by the error collector instead of raising « App is not defined »,
// then replayed once window.App appears.
// Run: node scripts/test-boot-hold.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html = fs.readFileSync(path.join(root, 'public', 'pokerth-client.html'), 'utf8');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + label);
  if (!cond) fails++;
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const m = html.match(/\(function \(\) \{\s*var Q = window\.__pthErrQ[\s\S]*?\n\}\)\(\);/);
ok(!!m && /Boot hold/.test(m[0]), 'the collector block carries the boot hold');
if (!m) { console.log('\nFAIL'); process.exit(1); }

const page = `<!DOCTYPE html><html><head><script>${m[0]}</script>
<script>
var log = [];
function loginPickMode(card, v) {
  var sm = document.getElementById('server-mode'); sm.value = v;
  sm.dispatchEvent(new Event('change', { bubbles: true }));
  log.push('pick:' + v);
}
function closeOverlay() { log.push('close'); }
</script></head><body>
<div id="card" onclick="loginPickMode(this,'internet')">card</div>
<select id="server-mode" onchange="App.onServerOrGuestChange()"><option value="">-</option><option value="internet">i</option></select>
<button id="ovf" onclick="toggleConnectOverflow(event)">more</button>
<a id="lnk" href="#jump" onclick="App.go(); return false">go</a>
<input type="checkbox" id="cb" onchange="App.onServerOrGuestChange()">
<div id="ov" onclick="closeOverlay()"><button id="inner" onclick="event.stopPropagation(); App.y()">y</button></div>
<button id="plain" onclick="closeOverlay()">plain</button>
</body></html>`;

const dom = new JSDOM(page, { runScripts: 'dangerously', url: 'https://webclient.pokerth.net/' });
const w = dom.window, d = w.document;
const errors = [];
w.addEventListener('error', (e) => errors.push(String(e.message || e.error)));
const q = () => w.__pthErrQ;
const click = (id) => d.getElementById(id).dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));

// A defined handler is never touched.
click('plain');
ok(w.log.join() === 'close' && q().length === 0, 'a handler whose globals exist runs normally, nothing reported');
w.log.length = 0;

// The production case: the card's own handler exists, the select's change does not.
click('card');
ok(w.log.join() === 'pick:internet', 'the login card still moves on (its handler exists)');
ok(!errors.some(e => /App/.test(e)), 'no « App is not defined » raised');
ok(q().length === 1 && /^Boot hold: change App · up=/.test(q()[0].msg), 'one Boot hold line, with the page state');

// A bare global (toggleConnectOverflow) and a link's default action.
click('ovf');
const lnkEv = new w.MouseEvent('click', { bubbles: true, cancelable: true });
d.getElementById('lnk').dispatchEvent(lnkEv);
ok(lnkEv.defaultPrevented, 'a held click on a link does not follow it');
ok(!errors.length, 'nothing raised for a bare global either');
ok(q().length === 1, 'still a single Boot hold line per page');

// Checkbox: the toggle stays, its change is held.
const cb = d.getElementById('cb');
const cbClick = new w.MouseEvent('click', { bubbles: true, cancelable: true });
cb.dispatchEvent(cbClick);
ok(!cbClick.defaultPrevented, 'a checkbox keeps its toggle');
cb.dispatchEvent(new w.Event('change', { bubbles: true }));

// Inner button stopping propagation: the overlay's own handler must not run on replay.
click('inner');
ok(!w.log.includes('close'), 'the parent handler did not run while held');

// Same element + type twice: one replay only.
click('ovf');

// The app arrives.
const calls = [];
w.App = { onServerOrGuestChange: () => calls.push('osgc'), go: () => calls.push('go'), y: () => calls.push('y') };
w.toggleConnectOverflow = () => calls.push('ovf');
await sleep(250);
ok(calls.filter(c => c === 'osgc').length === 2, 'both held changes replayed (select, checkbox)');
ok(calls.filter(c => c === 'ovf').length === 1, 'a repeated tap on the same element is replayed once');
ok(calls.includes('go') && calls.includes('y'), 'link and inner button replayed');
ok(!w.log.includes('close'), 'replay stops after a handler that calls stopPropagation');
ok(q().length === 2 && /^Boot hold: replayed 5\/5 after \d+s$/.test(q()[1].msg), 'one replay line: ' + (q()[1] && q()[1].msg));

// Once the app exists, nothing is intercepted.
calls.length = 0;
click('ovf');
ok(calls.join() === 'ovf' && q().length === 2, 'after boot, handlers run directly');

// Too old: dropped.
const dom2 = new JSDOM(page, { runScripts: 'dangerously', url: 'https://webclient.pokerth.net/' });
const w2 = dom2.window;
const realNow = Date.now;
w2.document.getElementById('ovf').dispatchEvent(new w2.MouseEvent('click', { bubbles: true, cancelable: true }));
const c2 = [];
w2.Date.now = () => realNow() + 25000;
w2.App = {}; w2.toggleConnectOverflow = () => c2.push(1);
await sleep(250);
ok(c2.length === 0 && /replayed 0\/1/.test(w2.__pthErrQ[1] && w2.__pthErrQ[1].msg), 'a gesture older than 20 s is dropped');

w.close(); w2.close();
console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
