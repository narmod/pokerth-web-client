#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// PokerTH Arena (tournaments, cups, medals, the tournament director) —
// service entry point (2026-10-23; « tournaments » until web.315).
//
// Launched by the web client's proxy when Admin › Community › Arena is
// on (proxy side: server/arena-host.js): it gets ARENA_DIR, ARENA_SECRET and
// ARENA_CLIENT_VERSION in its environment, reports « ready » with its port over
// IPC, asks the proxy for the servers it may use (the LAN directory and the
// local server), and leaves when the proxy goes away. Watches are detached
// processes of their own: they survive this service.
//
// Standalone (its own application, development, tests):
//   ARENA_ADMIN_TOKEN=… ARENA_SERVERS='[{"ref":"local","kind":"local","name":"Local","host":"127.0.0.1","port":7234}]' \
//   ARENA_PORT=8091 node arena/server.mjs
// or linked to a web client (service 0.34.0, lib/link.mjs): leave out
// ARENA_SERVERS / ARENA_EVENTS_URL and give the web client the link key
// (/arena/organize › Web client); the web client then sends the servers and
// the events to POST /arena/api/link/sync.
//   ARENA_LINK_KEY        the link key (else made once, kept in ARENA_DIR)
//   ARENA_WEBCLIENT_URL   the web client's address (else the one it sends)
//   ARENA_KEEP_LOOPBACK=1 keep 127.0.0.1 servers as they are (same machine)
// ═══════════════════════════════════════════════════════════════════

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createService } from './lib/service.mjs';
import { createLink } from './lib/link.mjs';
import { webClientVersion, DEFAULT_DATA_DIR } from './lib/platform.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const readVersion = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')).version || ''; } catch (e) { return ''; } };
const VERSION = readVersion(path.join(HERE, 'package.json'));
const CLIENT_VERSION = webClientVersion();
const DIR = process.env.ARENA_DIR || DEFAULT_DATA_DIR;
const SECRET = process.env.ARENA_SECRET || '';
const ADMIN_TOKEN = process.env.ARENA_ADMIN_TOKEN || '';
const HOST = process.env.ARENA_HOST || '127.0.0.1';
const PORT = parseInt(process.env.ARENA_PORT || '0', 10) || 0;
const viaProxy = typeof process.send === 'function';
const log = (s) => console.log('[arena] ' + s);

if (!SECRET && !ADMIN_TOKEN) {
  console.error('[arena] set ARENA_SECRET (launched by the web client) or ARENA_ADMIN_TOKEN (standalone)');
  process.exit(2);
}

// Standalone: the link with a web client (servers and events over HTTP).
const link = viaProxy ? null : createLink({ dir: DIR, key: process.env.ARENA_LINK_KEY || '', webClientUrl: process.env.ARENA_WEBCLIENT_URL || '', keepLoopback: process.env.ARENA_KEEP_LOOPBACK === '1', version: VERSION, log });
const FIXED_SERVERS = (() => { try { const v = JSON.parse(process.env.ARENA_SERVERS || 'null'); return Array.isArray(v) ? v : null; } catch (e) { return null; } })();

// Servers: asked from the proxy each time (the LAN directory changes), fixed
// by ARENA_SERVERS when standalone, or else the last ones the linked web
// client sent.
let seq = 0;
const pending = new Map();
function servers() {
  if (!viaProxy) return FIXED_SERVERS || link.servers();
  return new Promise((resolve) => {
    const id = ++seq;
    const t = setTimeout(() => { pending.delete(id); resolve([]); }, 3000);
    pending.set(id, (v) => { clearTimeout(t); resolve(v); });
    try { process.send({ type: 'servers', id }); } catch (e) { clearTimeout(t); pending.delete(id); resolve([]); }
  });
}
// The community sites' events (BBC, WEC, Monthly Cup), for the home page:
// the web client's Events relay over IPC, or ARENA_EVENTS_URL (an /api/events
// address) when standalone, or else the last ones the linked web client sent.
const EVENTS_URL = process.env.ARENA_EVENTS_URL || '';
function events() {
  if (!viaProxy) {
    if (!/^https?:\/\//.test(EVENTS_URL)) return link.events();
    const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 5000);
    return fetch(EVENTS_URL, { signal: ac.signal }).then((r) => r.json()).catch(() => null).finally(() => clearTimeout(t));
  }
  return new Promise((resolve) => {
    const id = ++seq;
    const t = setTimeout(() => { pending.delete(id); resolve(null); }, 5000);
    pending.set(id, (v) => { clearTimeout(t); resolve(v); });
    try { process.send({ type: 'events', id }); } catch (e) { clearTimeout(t); pending.delete(id); resolve(null); }
  });
}
if (viaProxy) {
  process.on('message', (m) => {
    if (m && m.type === 'servers' && pending.has(m.id)) { pending.get(m.id)(Array.isArray(m.servers) ? m.servers : []); pending.delete(m.id); }
    if (m && m.type === 'events' && pending.has(m.id)) { pending.get(m.id)(m.data && typeof m.data === 'object' ? m.data : null); pending.delete(m.id); }
  });
  // The proxy is gone (restart, update): leave with it, it starts a new one.
  process.on('disconnect', () => { log('web client gone, stopping'); process.exit(0); });
}

const svc = createService({ dir: DIR, secret: SECRET, adminToken: ADMIN_TOKEN, servers, events, link, clientVersion: () => CLIENT_VERSION, version: VERSION });
const server = http.createServer(svc.handler);
server.on('error', (e) => { console.error('[arena] ' + e.message); process.exit(1); });
server.listen(PORT, HOST, () => {
  const port = server.address().port;
  log('arena ' + VERSION + ' on http://' + HOST + ':' + port + ' (data ' + DIR + ', node ' + process.version + ')');
  if (link) log(link.linked() ? 'linked to the web client ' + (link.url() || '(address unknown)') : (FIXED_SERVERS ? 'servers from ARENA_SERVERS' : 'not linked to a web client yet: give it the link key (/arena/organize › Web client)'));
  if (viaProxy) process.send({ type: 'ready', port, version: VERSION });
});
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => { server.close(); process.exit(0); });
}
