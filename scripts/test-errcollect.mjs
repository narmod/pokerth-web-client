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
globalThis.location = { origin: ORIGIN };
(0, eval)(m[0]);

ok(typeof listeners.error === 'function', 'an error listener is installed');
ok(typeof listeners.unhandledrejection === 'function', 'an unhandledrejection listener is installed');

const res = (tag, url) => ({ target: { tagName: tag, src: url } });
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

// Un domaine qui commence comme le nôtre ne doit pas passer pour le nôtre.
q().length = 0;
listeners.error(res('SCRIPT', ORIGIN + '.evil.example/x.js'));
ok(q().length === 0, 'a lookalike domain prefix does not pass as same-origin');

// ── Noise floor ───────────────────────────────────────────────────
q().length = 0;
listeners.error(res('IMG', ORIGIN + '/avatars/x.png'));
ok(q().length === 0, 'a 404 avatar is not a client bug');

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
