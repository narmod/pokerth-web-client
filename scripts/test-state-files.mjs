#!/usr/bin/env node
// Where the proxy keeps its state (web.251). Run: node scripts/test-state-files.mjs
//
// In the Docker image every persisted file lives in /data, the named volume that
// survives a container recreation. The audit log and the deployment history used
// to default to the app dir, which the image-baked mode loses on recreation; they
// now sit beside admin-config.json, and a copy left in the app dir is carried over
// once (in a container only), so no history is lost on the move.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
const docker = readFileSync(join(root, 'Dockerfile'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// Every file the proxy lets an env variable relocate is relocated to /data by the image.
const envs = new Set();
for (const m of proxy.matchAll(/process\.env\.([A-Z_]+) \|\| path\.join\(__dirname, '[^']+'\)/g)) envs.add(m[1]);
for (const m of proxy.matchAll(/_stateFile\('([A-Z_]+)', '[^']+'\)/g)) envs.add(m[1]);
ok(envs.has('AUDIT_FILE') && envs.has('DEPLOY_HISTORY_FILE'), 'the audit log and the deployment history can be relocated');
for (const e of [...envs].sort()) {
  ok(new RegExp('^ENV ' + e + '=/data/', 'm').test(docker), e + ' points into /data in the image');
}
ok(/const AUDIT_FILE = _stateFile\('AUDIT_FILE', 'admin-audit\.json'\);/.test(proxy), 'the audit log defaults beside admin-config.json');
ok(/const DEPLOY_HISTORY_FILE = _stateFile\('DEPLOY_HISTORY_FILE', 'deploy-history\.json'\);/.test(proxy), 'and so does the deployment history');
ok(proxy.indexOf('function _stateFile(') < proxy.indexOf("const DEPLOY_HISTORY_FILE = _stateFile("), 'the helper is defined before its first use');
ok(proxy.indexOf('const ADMIN_CONFIG_FILE =') < proxy.indexOf('function _stateFile('), 'after admin-config.json is known');

// Run the helper itself against a temp dir.
const src = proxy.slice(proxy.indexOf('const _IN_CONTAINER = '), proxy.indexOf('function saveAdminConfig() {'));
const fs = await import('node:fs'), path = await import('node:path'), os = await import('node:os');
function make(inContainer, env) {
  const T = fs.mkdtempSync(path.join(os.tmpdir(), 'pth-state-'));
  const app = path.join(T, 'app'), data = path.join(T, 'data');
  fs.mkdirSync(app); fs.mkdirSync(data);
  const body = src.replace(/const _IN_CONTAINER = \(function \(\) \{[\s\S]*?\}\)\(\);/, 'const _IN_CONTAINER = ' + inContainer + ';');
  const fn = new Function('fs', 'path', 'process', '__dirname', 'ADMIN_CONFIG_FILE', 'console', body + '\nreturn _stateFile;');
  const quiet = { log() {}, error() {} };
  return { T, app, data, f: fn(fs, path, { env: env || {} }, app, path.join(data, 'admin-config.json'), quiet) };
}
{
  const c = make(true);
  fs.writeFileSync(path.join(c.app, 'admin-audit.json'), '[{"action":"update"}]');
  const p = c.f('AUDIT_FILE', 'admin-audit.json');
  ok(p === path.join(c.data, 'admin-audit.json'), 'in a container, the file goes beside admin-config.json');
  ok(fs.readFileSync(p, 'utf8') === '[{"action":"update"}]', 'and the app dir copy is carried over');
  fs.writeFileSync(p, '[]');
  ok(c.f('AUDIT_FILE', 'admin-audit.json') === p && fs.readFileSync(p, 'utf8') === '[]', 'only once: a later start never overwrites it');
  ok(fs.existsSync(path.join(c.app, 'admin-audit.json')), 'the old copy is left where it was');
  fs.rmSync(c.T, { recursive: true, force: true });
}
{
  const T = fs.mkdtempSync(path.join(os.tmpdir(), 'pth-env-')), target = path.join(T, 'history.json');
  const c = make(true, { DEPLOY_HISTORY_FILE: target });
  fs.writeFileSync(path.join(c.app, 'deploy-history.json'), '[1]');
  const p = c.f('DEPLOY_HISTORY_FILE', 'deploy-history.json');
  ok(p === target, 'an explicit env path wins');
  ok(fs.readFileSync(p, 'utf8') === '[1]', 'and still receives the app dir copy (image rebuilt with the new ENV)');
  fs.rmSync(c.T, { recursive: true, force: true }); fs.rmSync(T, { recursive: true, force: true });
}
{
  const c = make(false, { AUDIT_FILE: '' });
  fs.writeFileSync(path.join(c.app, 'admin-audit.json'), '[2]');
  const p = c.f('AUDIT_FILE', 'admin-audit.json');
  ok(!fs.existsSync(p), 'outside a container nothing is copied (a test temp dir stays empty)');
  fs.rmSync(c.T, { recursive: true, force: true });
}

console.log((n - fail) + '/' + n + ' passed');
process.exit(fail ? 1 : 0);
