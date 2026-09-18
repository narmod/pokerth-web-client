#!/usr/bin/env node
// Deterministic tests for the inline error collector in pokerth-client.html.
// Run: node scripts/test-errcollect.mjs
//
// The collector cannot live in a module — it has to be the first script in the
// document to catch boot failures — so it is inline, and inline code is easy to
// break without noticing. This test extracts the block from the page and
// replays real events against it.
//
// The rule most worth guarding is the origin filter. A third-party script cut
// by an ad blocker or a filtering DNS is not a bug in the client: it is the
// visitor's own choice, nothing can be done about it, and one widespread
// blocker would be enough to drown the log. That is exactly what happened with
// the Cloudflare analytics beacon.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html = fs.readFileSync(path.join(root, 'public', 'pokerth-client.html'), 'utf8');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  \u2713 ' : '  \u2717 ') + label);
  if (!cond) fails++;
}

const m = html.match(/\(function \(\) \{\s*var Q = window\.__pthErrQ[\s\S]*?\n\}\)\(\);/);
ok(!!m, 'the collector block is still present in pokerth-client.html');
if (!m) { console.log('\nFAIL 1'); process.exit(1); }

const ORIGIN = 'https://webclient.pokerth.net';
const listeners = {};
globalThis.window = { addEventListener: (t, f) => { listeners[t] = f; }, __pthErrFlush: null };

// ── Fake page ─────────────────────────────────────────────────────
// Everything the collector touches besides the event itself, made
// deterministic: timers are queued and fired by hand (runTimers), fetch is
// scripted (the diagnostic probe), injected elements land in `injected`.
const timers = [];
const realSetTimeout = globalThis.setTimeout;
globalThis.setTimeout = (fn, ms) => { timers.push({ fn, ms }); return timers.length; };
function runTimers() { const due = timers.splice(0); due.forEach(t => t.fn()); return due.map(t => t.ms); }
const tick = () => new Promise(r => realSetTimeout(r, 0));

const injected = [];
function element(tag, props) {
  const attrs = {}, handlers = {};
  const node = Object.assign({
    tagName: tag,
    getAttribute: (k) => (k in attrs ? attrs[k] : null),
    setAttribute: (k, v) => { attrs[k] = String(v); },
    addEventListener: (t, f) => { handlers[t] = f; },
    fire: (t) => { if (handlers[t]) handlers[t](); },
    parentNode: { appendChild: (el) => { injected.push(el); } },
  }, props || {});
  return node;
}
let reloads = 0;
const session = {};
let probe = () => Promise.resolve({ status: 200 });
globalThis.location = { origin: ORIGIN, reload: () => { reloads++; } };
globalThis.document = { createElement: (t) => element(String(t).toUpperCase()), head: { appendChild: (el) => { injected.push(el); } } };
globalThis.fetch = (u, o) => probe(u, o);
globalThis.sessionStorage = { getItem: (k) => (k in session ? session[k] : null), setItem: (k, v) => { session[k] = String(v); } };
Object.defineProperty(globalThis, 'navigator', { value: { onLine: true, serviceWorker: { controller: {} } }, configurable: true });
(0, eval)(m[0]);

ok(typeof listeners.error === 'function', 'an error listener is installed');
ok(typeof listeners.unhandledrejection === 'function', 'an unhandledrejection listener is installed');

const res = (tag, url, props) => ({ target: element(tag, Object.assign(tag === 'LINK' ? { href: url } : { src: url }, props || {})) });
const q = () => window.__pthErrQ;

// ── Origin filter ─────────────────────────────────────────────────
q().length = 0;
listeners.error(res('SCRIPT', 'https://static.cloudflareinsights.com/beacon.min.js/v4513226c'));
ok(q().length === 0, 'a blocked third-party analytics script is ignored');

listeners.error(res('LINK', 'https://fonts.example.com/x.css'));
ok(q().length === 0, 'a third-party stylesheet is ignored');

listeners.error(res('SCRIPT', ORIGIN + '/modules/gone.mjs'));
ok(q().length === 1, 'one of our own scripts failing IS reported');
ok(/gone\.mjs/.test(q()[0].src), 'the reported url is the failing one');
await tick(); timers.length = 0; injected.length = 0;   // drop this case's probe / retry

// Un domaine qui commence comme le nôtre ne doit pas passer pour le nôtre.
q().length = 0;
listeners.error(res('SCRIPT', ORIGIN + '.evil.example/x.js'));
ok(q().length === 0, 'a lookalike domain prefix does not pass as same-origin');

// ── Noise floor ───────────────────────────────────────────────────
q().length = 0;
listeners.error(res('IMG', ORIGIN + '/avatars/x.png'));
ok(q().length === 0, 'a 404 avatar is not a client bug');

// ── Injected-script noise ─────────────────────────────────────────
// Browser extensions and in-app browsers run their own code inside the page;
// their failures land in OUR error listener. None of it is a client bug.
const UC = ORIGIN + '/u.c.b.r.o.w.s.e.r/ucbrowser_script.js?UCFontSizeWebScriptDataSource=1&audio=1';
[
  ['an extension frame', { message: 'x is undefined', filename: 'chrome-extension://abc/content.js', error: { stack: 'at chrome-extension://abc/content.js:1:1' } }],
  ['an opaque cross-origin "Script error."', { message: 'Script error.', filename: '' }],
  ['a crypto-wallet injector', { message: 'TypeError: Cannot redefine property: ethereum', filename: ORIGIN + '/' }],
  ['a page-translation extension', { message: 'null is not an object', filename: ORIGIN + '/', error: { stack: 'checkInScreen@' + ORIGIN + '/:1:1' } }],
  ['the script UC Browser injects', { message: "TypeError: undefined is not an object (evaluating 'a.tagName.match')", filename: UC, error: { stack: '@' + UC + ':94:461' } }],
  ['a content script using wrappedJSObject', { message: "TypeError: undefined is not an object (evaluating 'self.wrappedJSObject[sentinel]')", filename: ORIGIN + '/', error: { stack: 'global code@' + ORIGIN + '/:54:11' } }],
].forEach(([label, ev]) => {
  q().length = 0;
  listeners.error(ev);
  ok(q().length === 0, label + ' is ignored');
});
q().length = 0;
listeners.unhandledrejection({ reason: { message: 'fail', stack: 'at moz-extension://abc/bg.js:2:2' } });
ok(q().length === 0, 'so is a rejection coming from an extension');
listeners.error({ message: "TypeError: undefined is not an object (evaluating 'a.tagName.match')", filename: ORIGIN + '/pokerth.js', lineno: 10, error: { stack: 'x@' + ORIGIN + '/pokerth.js:10:5' } });
ok(q().length === 1, 'the same TypeError raised by OUR code is still reported');

// ── Automatic retry of our own files ──────────────────────────────
// A static tag that fails stays dead for the session, while the same URL
// usually answers a second later (CDN ↔ origin TLS bursts): the file is
// re-injected with a cache-buster, twice at most, then the page reloads once.
const FILE = ORIGIN + '/modules/i18n.mjs';
q().length = 0; timers.length = 0; injected.length = 0; reloads = 0;
window.__pthErrRetry = {}; window.__pthErrProbed = {};
listeners.error(res('SCRIPT', FILE, { type: 'module' }));
ok(q().length === 1 && q()[0].msg === 'Failed to load script', 'first failure: one journal line');
await tick();
ok(q().length === 2 && q()[1].msg === 'Load-failure probe: HTTP 200 online sw', 'the probe reports status, connectivity and service worker');
ok(String(runTimers()) === '700' && injected.length === 1, 'retry #1 is scheduled 700 ms later');
ok(injected[0].src === FILE + '?r=1' && injected[0].type === 'module' && injected[0].getAttribute('data-pth-retry') === '1',
   'it re-injects the same module with a cache-buster');
injected[0].fire('load');
ok(q().length === 3 && q()[2].msg === 'Load-failure retry #1 recovered' && q()[2].src === FILE, 'a retry that loads says so, against the original url');
ok(reloads === 0 && !session.pth_autoreload, 'no page reload while retries remain');

// Same file, nothing recovers: #1 fails → #2 (2 s) → gives up → one reload.
q().length = 0; timers.length = 0; injected.length = 0;
window.__pthErrRetry = {}; window.__pthErrProbed = {};
probe = () => Promise.reject({ name: 'TypeError' });
navigator.onLine = false; navigator.serviceWorker.controller = null;
listeners.error(res('SCRIPT', FILE, { type: 'module' }));
await tick();
ok(q()[1] && q()[1].msg === 'Load-failure probe: TypeError offline no-sw', 'a probe that cannot connect reports the network error instead');
runTimers();
listeners.error({ target: injected[0] });
ok(q().length === 2, 'a failed retry adds no line while another one is coming');
ok(String(runTimers()) === '2000' && injected[1] && injected[1].src === FILE + '?r=2', 'retry #2 follows 2 s later');
listeners.error({ target: injected[1] });
ok(q().length === 3 && q()[2].msg === 'Load-failure retry #2 failed, giving up', 'then a single "giving up" line');
ok(injected.length === 2, 'never a third attempt');
ok(session.pth_autoreload === '1' && String(timers.map(t => t.ms)) === '1800', 'retries exhausted, app not started: one reload is armed');
runTimers();
ok(reloads === 1, 'and performed');
listeners.error(res('SCRIPT', ORIGIN + '/pokerth.js'));
runTimers(); listeners.error({ target: injected[2] }); runTimers(); listeners.error({ target: injected[3] });
runTimers();
ok(reloads === 1, 'only once per session (no reload loop)');

// A stylesheet is retried too; other <link> kinds are reported, not retried.
q().length = 0; timers.length = 0; injected.length = 0; probe = () => Promise.resolve({ status: 200 });
listeners.error(res('LINK', ORIGIN + '/pokerth.css?v=3', { rel: 'stylesheet', media: 'all' }));
runTimers();
ok(injected.length === 1 && injected[0].rel === 'stylesheet' && injected[0].href === ORIGIN + '/pokerth.css?r=1' && injected[0].media === 'all',
   'a failed stylesheet is re-injected (query replaced by the cache-buster)');
injected.length = 0;
listeners.error(res('LINK', ORIGIN + '/manifest.json', { rel: 'manifest' }));
runTimers();
ok(injected.length === 0 && q().some(e => /manifest/.test(e.src)), 'a non-stylesheet <link> is reported but not retried');
await tick(); timers.length = 0;

// ── Real errors still get through ─────────────────────────────────
q().length = 0;
listeners.error({ message: 'boom', filename: 'p.js', lineno: 7, colno: 3, error: { stack: 'Error: boom\n    at f' } });
ok(q().length === 1 && q()[0].line === 7, 'a script error is reported with its position');

listeners.unhandledrejection({ reason: { message: 'nope', stack: 'Error: nope\n    at g' } });
ok(q().length === 2 && /Unhandled rejection/.test(q()[1].msg), 'an unhandled rejection is reported');

// ── Queue ceiling ─────────────────────────────────────────────────
// Une page qui part en boucle ne doit pas faire gonfler la file sans fin.
q().length = 0;
for (let i = 0; i < 60; i++) listeners.error({ message: 'e' + i, filename: 'p.js', lineno: i, colno: 0 });
ok(q().length === 20, 'the queue is capped at 20 entries');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
