#!/usr/bin/env node
// Small admin guards: no PM2-only advice, no empty login screen, delegate keys
// that copy everywhere and do not linger, an honest "Effective target".
// Run: node scripts/test-admin-guards.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const admin = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'admin.html'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function fn(name) {
  const head = admin.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let i = admin.indexOf('{', head), depth = 0;
  for (let j = i; j < admin.length; j++) {
    if (admin[j] === '{') depth++;
    else if (admin[j] === '}') { depth--; if (!depth) return admin.slice(head, j + 1); }
  }
  return '';
}

// ── Advice that works on the Docker install too ───────────────────────────
ok(!/pm2 restart pokerth-web/.test(admin), 'no "pm2 restart" advice left (the Restart button works on every install)');
ok(/STATS_ADMIN_TOKEN<\/code> in the <code>\.env<\/code>/.test(admin), 'the login screen says where the token lives on Docker');

// ── Entry modes ───────────────────────────────────────────────────────────
const tm = fn('toggleMode');
ok(/!next\.offline&&!next\.lan&&!next\.pokerthnet/.test(tm), 'the last mode on cannot be switched off from the panel');
ok(/function revert\(/.test(tm) && /revert\('Not saved/.test(tm), 'a refused or failed save puts the toggle back');

// ── Delegate keys ─────────────────────────────────────────────────────────
const kc = admin.slice(admin.indexOf("var b=$('kyCreate')"), admin.indexOf("var b=$('kyCreate')") + 3000);
ok(/copyText\(d\.token\)/.test(kc) && !/navigator\.clipboard\.writeText\(d\.token\)/.test(kc), 'a new key is copied through copyText (works on an http LAN panel)');
ok(/setTimeout\(forget,120000\)/.test(kc), 'and leaves the screen after two minutes');
ok(/_kn\.innerHTML=''/.test(admin), 'or as soon as the Keys tab is left');
ok(!/alert\(/.test(admin), 'no alert() box left in the panel');

// ── Effective target mirrors the client's transport rule ──────────────────
const ctx = { $: () => null, srvEsc: (x) => String(x), _WS_PORTS: [7233, 7235], srvPortWarn: () => '' };
let html = '';
ctx.$ = (id) => (id === 'srvEff' ? { set innerHTML(v) { html = v; } } : null);
vm.createContext(ctx); vm.runInContext(fn('applyEffectiveUI'), ctx);
const show = (eff) => { html = ''; ctx.eff = eff; vm.runInContext('applyEffectiveUI(eff)', ctx); return html; };
ok(/wss:\/\/www\.pokerth\.net\/pthlive/.test(show({ host: 'pthsrv.pokerth.net', port: 7236, tls: true, transport: 'direct', from: 'serverlist' })),
  'Direct to a pokerth.net host shows the WebSocket the browser really dials');
const other = show({ host: 'game.example.org', port: 7236, tls: true, transport: 'direct', from: 'manual' });
ok(/game\.example\.org:7236/.test(other) && /Direct only applies to a pokerth\.net host/.test(other), 'Direct to any other host says it goes through this proxy');
ok(/through this proxy \(session grace\)/.test(show({ host: 'pthsrv.pokerth.net', port: 7236, tls: true, transport: 'proxy', from: 'serverlist' })), 'Via proxy reads as before');

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
