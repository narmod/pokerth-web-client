#!/usr/bin/env node
// Deterministic tests for App.connect() when the #nick field is missing (web.335).
// Run: node scripts/test-connect-nick.mjs
//
// Seen on Android 16 · Xiaomi: #host and #port were in the page, #nick was not,
// and connect() threw "Cannot read properties of null (reading 'value')" on
// every tap. connect() now falls back on the stored nickname and sends one
// « Login form: nick missing … » diagnostic per page.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as acorn from 'acorn';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = fs.readFileSync(path.join(root, 'public', 'pokerth.js'), 'utf8');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + label);
  if (!cond) fails++;
}

// ── connect() never reads #nick unguarded ─────────────────────────
const ci = src.indexOf('    connect(opts) {');
ok(ci > 0, 'App.connect() is still found');
const body = src.slice(ci, ci + 20000);
ok(!/\$\('nick'\)\.value/.test(body.replace(/\(\$\('nick'\) *&& *\$\('nick'\)\.value/g, '')
  .replace(/\$\('nick'\) \? \$\('nick'\)\.value/g, '')), 'no unguarded $(\'nick\').value in connect()');
ok(/const _nickEl = \$\('nick'\);/.test(body) && /if \(!_nickEl\) \{ try \{ _reportNickMissing\(\); \} catch \(e\) \{\} \}/.test(body),
  'a missing field sends the diagnostic');
ok(/_nickEl \? _nickEl\.value\.trim\(\)\s*: \(loginMode === 'guest' \? '' : String\(\(window\._pthNick && window\._pthNick\.get\(\)\) \|\| ''\)\.trim\(\)\);/.test(body),
  'otherwise the stored nickname (the Guest name in guest mode)');
ok(/if \(_nickEl\) _nickEl\.value = S\.myName;/.test(body), 'the Guest name is written back only when the field exists');

// ── The diagnostic ────────────────────────────────────────────────
const ast = acorn.parse(src, { ecmaVersion: 'latest' });
const fn = ast.body.find(n => n.type === 'FunctionDeclaration' && n.id.name === '_reportNickMissing');
ok(!!fn, '_reportNickMissing is a top-level function (reachable from connect)');

const SECRET = 'hunter2-typed-by-player';
const el = (id, tag, extra) => Object.assign({ id, tagName: tag || 'INPUT', value: SECRET }, extra || {});
const fields = [el('pass'), el('host'), el('port'), el('', 'SELECT', { name: 'srv' })];
const byId = {
  'login-form': { querySelectorAll: () => fields },
  'login-step1': {}, 'nick-label': {},
  'server-mode': { value: 'pokerthnet' }, 'login-mode': { value: 'guest' },
};
globalThis.window = { __pthErrQ: [], __pthErrFlush: () => { flushes++; } };
let flushes = 0;
globalThis.document = {
  readyState: 'complete',
  documentElement: { className: 'translated-ltr' },
  body: { className: '' },
  getElementById: (id) => byId[id] || null,
  querySelector: () => null,
  querySelectorAll: () => [1, 2],
};
const report = (0, eval)('(' + src.slice(fn.start, fn.end) + ')');
report();
const q = window.__pthErrQ;
ok(q.length === 1 && /^Login form: nick missing /.test(q[0].msg), 'one « Login form: nick missing » line');
ok(/\bf-nick=0\b/.test(q[0].msg) && /\blabel=1\b/.test(q[0].msg) && /\bform=1\b/.test(q[0].msg) && /\bstep1=1\b/.test(q[0].msg),
  'it says which parts of the form are there');
ok(/\bfields=4\[pass,host,port,srv\]/.test(q[0].msg), 'the fields left in the form, by id or name');
ok(/\btranslated=1\b/.test(q[0].msg) && /\brs=complete\b/.test(q[0].msg) && /\bsm=pokerthnet\b/.test(q[0].msg) && /\blm=guest\b/.test(q[0].msg),
  'page translation flag, ready state and modes');
ok(q[0].msg.indexOf(SECRET) === -1, 'never a value typed by the player');
ok(flushes === 1, 'the queue is flushed');
report();
ok(q.length === 1 && flushes === 1, 'once per page');

// ── Classified as a diagnostic, outside the 5 error signatures ────
const er = fs.readFileSync(path.join(root, 'public', 'modules', 'errreport.mjs'), 'utf8');
const ov = fs.readFileSync(path.join(root, 'public', 'modules', 'admin', 'overview.mjs'), 'utf8');
const ad = fs.readFileSync(path.join(root, 'public', 'admin.html'), 'utf8');
ok(/_OUTCOME_RE = [^\n]*\|Login form: \|/.test(er), 'errreport counts it in the outcome budget');
ok(/\(Boot stall\|Module graph\|Login form\):\/\.test\(m\)\) return 'diag'/.test(ov) &&
   /\(Boot stall\|Module graph\|Login form\):\/\.test\(m\)\) return 'diag'/.test(ad), 'Admin › Errors shows it as a Diagnostic');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
