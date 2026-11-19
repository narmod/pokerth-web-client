#!/usr/bin/env node
// /live content security policy in report-only mode (web.133), against the
// real proxy:
//  · /live keeps its enforced frame-ancestors and gains a report-only policy
//    (own origin + the direct pokerth.net WebSocket, no plugin, no <base>),
//    with its report endpoint; the ordinary client gets neither;
//  · /__csp-report takes both report formats into Admin › Errors as mode
//    « live-csp », without the blocked URL's query string, and drops what
//    browser extensions cause.
// Run: node scripts/test-live-csp.mjs
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path';
import { fileURLToPath } from 'url';
import { freePort, waitForServer } from './lib/free-port.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TOK = 'tok-live-csp-1234567';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'livecsp-'));
const PORT = await freePort();
const env = { PORT: String(PORT), STATS_ADMIN_TOKEN: TOK, ADMIN_CONFIG_FILE: path.join(tmp, 'cfg.json') };
for (const k of ['STATS_FILE', 'STATS_META_FILE', 'AUDIT_FILE', 'VISITS_FILE', 'BROADCASTS_FILE', 'POLLS_FILE', 'SCOPED_TOKENS_FILE', 'DEPLOY_HISTORY_FILE']) env[k] = path.join(tmp, k.toLowerCase() + '.json');
const px = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, env: Object.assign({}, process.env, env), stdio: 'ignore' });
const base = 'http://127.0.0.1:' + PORT;
try {
  await waitForServer(base, px);
  const live = await fetch(base + '/live');
  const ro = live.headers.get('content-security-policy-report-only') || '';
  ok(live.status === 200 && /^frame-ancestors 'self' https:\/\/pokerth\.net https:\/\/www\.pokerth\.net$/.test(live.headers.get('content-security-policy') || ''),
    '/live: the enforced policy is still frame-ancestors only');
  ok(/connect-src 'self' wss:\/\/www\.pokerth\.net(;|$)/.test(ro) && /object-src 'none'/.test(ro) && /base-uri 'self'/.test(ro)
    && /form-action 'self'/.test(ro) && /img-src 'self' data: blob:/.test(ro) && /default-src 'self'/.test(ro),
    '/live: report-only policy — own origin + the pokerth.net WebSocket, no plugin, no <base>');
  ok(/script-src 'self' 'unsafe-inline'(;|$)/.test(ro) && !/unsafe-eval/.test(ro), '/live: no external script, no eval');
  ok(/report-uri \/__csp-report/.test(ro) && /report-to live-csp/.test(ro) && live.headers.get('reporting-endpoints') === 'live-csp="/__csp-report"',
    '/live: both report channels point at /__csp-report');
  const home = await fetch(base + '/');
  ok(!home.headers.get('content-security-policy-report-only') && !home.headers.get('reporting-endpoints'), 'the ordinary client gets no report-only policy');

  const post = (type, body) => fetch(base + '/__csp-report', { method: 'POST', headers: { 'Content-Type': type }, body: JSON.stringify(body) }).then((r) => r.status);
  const s1 = await post('application/csp-report', { 'csp-report': {
    'document-uri': 'https://webclient.pokerth.net/live', 'effective-directive': 'connect-src',
    'blocked-uri': 'https://evil.example/steal?k=SECRETKEY', 'source-file': 'https://webclient.pokerth.net/pokerth.js', 'line-number': 12, disposition: 'report' } });
  const s2 = await post('application/reports+json', [
    { type: 'csp-violation', body: { documentURL: 'https://webclient.pokerth.net/live', effectiveDirective: 'img-src', blockedURL: 'https://cdn.example/a.png?x=1', disposition: 'report' } },
    { type: 'csp-violation', body: { effectiveDirective: 'script-src-elem', blockedURL: 'chrome-extension://abcdef/inject.js', disposition: 'report' } },
    { type: 'deprecation', body: { id: 'x' } },
  ]);
  const s3 = await post('application/csp-report', { 'csp-report': { 'effective-directive': 'script-src', 'blocked-uri': 'inline', 'source-file': 'moz-extension://x/c.js' } });
  const s4 = await fetch(base + '/__csp-report', { method: 'POST', body: '{nope' }).then((r) => r.status);
  ok([s1, s2, s3, s4].every((c) => c === 204), 'every report is acknowledged with 204, broken JSON too (' + [s1, s2, s3, s4] + ')');
  ok((await fetch(base + '/__csp-report')).status === 405, 'GET /__csp-report: 405');
  await sleep(150);
  const er = await fetch(base + '/admin/errors', { headers: { Authorization: 'Bearer ' + TOK } }).then((r) => r.json());
  const g = (er.groups || []).filter((x) => (x.modes || []).includes('live-csp'));
  const msgs = g.map((x) => x.msg).sort();
  ok(msgs.length === 2 && msgs[0] === 'CSP would block: connect-src https://evil.example/steal' && msgs[1] === 'CSP would block: img-src https://cdn.example/a.png',
    'both formats reach Admin › Errors as « live-csp » (' + JSON.stringify(msgs) + ')');
  ok(!JSON.stringify(er).includes('SECRETKEY') && !JSON.stringify(er).includes('x=1'), "the blocked URL's query string is never kept");
  ok(!JSON.stringify(er).includes('extension'), 'reports caused by a browser extension are dropped');
  ok(g.some((x) => x.src === 'https://webclient.pokerth.net/pokerth.js' && x.line === 12), 'the source file and line are kept');
  // Same rate limit as /clienterr: a flood is refused, not stored.
  let last = 0;
  for (let i = 0; i < 80; i++) last = await post('application/csp-report', { 'csp-report': { 'effective-directive': 'img-src', 'blocked-uri': 'https://f' + i + '.example/' } });
  ok(last === 429, 'a flood of reports from one address is refused (' + last + ')');
} finally { px.kill(); }
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
