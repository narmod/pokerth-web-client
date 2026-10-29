#!/usr/bin/env node
// clientIp() (web.344): the address used for bans, per-IP caps, the admin
// brute-force guard, the anti-abuse limits and the PROXY header sent to the game
// server. It used to trust the FIRST X-Forwarded-For entry (chosen by the
// client behind nginx's $proxy_add_x_forwarded_for) and any CF-Connecting-IP
// (forgeable by going straight to the origin, bypassing Cloudflare).
// Run: node scripts/test-client-ip.mjs   (< 1 s)
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }
const src = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
const a = src.indexOf('const CLOUDFLARE_IPS_DEFAULT');
const end = "  return peer || 'unknown';\n}\n";
const b = src.indexOf(end, a) + end.length;
ok(a > 0 && b > a, 'clientIp and the Cloudflare ranges found in proxy.js');
const mk = (env) => new Function('net', 'process', src.slice(a, b) + '; return clientIp;')(net, { env: env || {} });
const clientIp = mk();
const R = (peer, h) => clientIp({ socket: { remoteAddress: peer }, headers: h || {} });
const t = (msg, got, want) => ok(got === want, msg + ' → ' + got);

t('public peer: its own address, headers ignored', R('8.8.8.8', { 'x-forwarded-for': '1.2.3.4', 'cf-connecting-ip': '5.6.7.8' }), '8.8.8.8');
t('behind nginx: the rightmost X-Forwarded-For entry, not the forged first one', R('172.22.0.2', { 'x-forwarded-for': '6.6.6.6, 203.0.113.9' }), '203.0.113.9');
t('through Cloudflare (hop is a Cloudflare edge): CF-Connecting-IP', R('172.22.0.2', { 'x-forwarded-for': '6.6.6.6, 81.1.1.1, 162.158.10.20', 'cf-connecting-ip': '81.1.1.1' }), '81.1.1.1');
t('CF-Connecting-IP sent straight to the origin: ignored', R('172.22.0.2', { 'x-forwarded-for': '81.2.2.2', 'cf-connecting-ip': '1.1.1.1' }), '81.2.2.2');
t('no hop forwarded at all: CF-Connecting-IP trusted as before', R('127.0.0.1', { 'cf-connecting-ip': '81.3.3.3' }), '81.3.3.3');
t('X-Real-IP when there is no X-Forwarded-For', R('10.0.0.2', { 'x-real-ip': '81.4.4.4' }), '81.4.4.4');
t('Cloudflare IPv6 edge', R('::1', { 'x-forwarded-for': '2606:4700::1', 'cf-connecting-ip': '2001:db8::5' }), '2001:db8::5');
t('nginx real_ip module (hop already the visitor)', R('172.22.0.2', { 'x-forwarded-for': '81.5.5.5', 'cf-connecting-ip': '81.5.5.5' }), '81.5.5.5');
t('junk values: the peer', R('172.22.0.2', { 'x-forwarded-for': 'evil', 'cf-connecting-ip': 'evil' }), '172.22.0.2');
t('no peer at all', R('', {}), 'unknown');
const custom = mk({ CLOUDFLARE_IPS: '192.0.2.0/24' });
t('CLOUDFLARE_IPS replaces the built-in ranges', custom({ socket: { remoteAddress: '10.0.0.1' }, headers: { 'x-forwarded-for': '192.0.2.7', 'cf-connecting-ip': '81.6.6.6' } }), '81.6.6.6');

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
