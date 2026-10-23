#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// PokerTH tournament director — service entry point (2026-10-23).
//
// Launched by the web client's proxy when Admin › Community › Tournaments is
// on (proxy side: server/tournament-host.js): it gets TD_DIR, TD_SECRET and
// TD_CLIENT_VERSION in its environment, reports « ready » with its port over
// IPC, asks the proxy for the servers it may use (the LAN directory and the
// local server), and leaves when the proxy goes away. Watches are detached
// processes of their own: they survive this service.
//
// Standalone (development, tests):
//   TD_ADMIN_TOKEN=… TD_SERVERS='[{"ref":"local","kind":"local","name":"Local","host":"127.0.0.1","port":7234}]' \
//   TD_PORT=8091 node tournament/server.mjs
// ═══════════════════════════════════════════════════════════════════

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createService } from './lib/service.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const readVersion = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')).version || ''; } catch (e) { return ''; } };
const VERSION = readVersion(path.join(HERE, 'package.json'));
const CLIENT_VERSION = process.env.TD_CLIENT_VERSION || readVersion(path.join(HERE, '..', 'package.json'));
const DIR = process.env.TD_DIR || path.join(HERE, '..', 'tournament-data');
const SECRET = process.env.TD_SECRET || '';
const ADMIN_TOKEN = process.env.TD_ADMIN_TOKEN || '';
const HOST = process.env.TD_HOST || '127.0.0.1';
const PORT = parseInt(process.env.TD_PORT || '0', 10) || 0;
const viaProxy = typeof process.send === 'function';
const log = (s) => console.log('[td] ' + s);

if (!SECRET && !ADMIN_TOKEN) {
  console.error('[td] set TD_SECRET (launched by the web client) or TD_ADMIN_TOKEN (standalone)');
  process.exit(2);
}

// Servers: asked from the proxy each time (the LAN directory changes), or
// fixed by TD_SERVERS when standalone.
let seq = 0;
const pending = new Map();
function servers() {
  if (!viaProxy) { try { return JSON.parse(process.env.TD_SERVERS || '[]'); } catch (e) { return []; } }
  return new Promise((resolve) => {
    const id = ++seq;
    const t = setTimeout(() => { pending.delete(id); resolve([]); }, 3000);
    pending.set(id, (v) => { clearTimeout(t); resolve(v); });
    try { process.send({ type: 'servers', id }); } catch (e) { clearTimeout(t); pending.delete(id); resolve([]); }
  });
}
if (viaProxy) {
  process.on('message', (m) => {
    if (m && m.type === 'servers' && pending.has(m.id)) { pending.get(m.id)(Array.isArray(m.servers) ? m.servers : []); pending.delete(m.id); }
  });
  // The proxy is gone (restart, update): leave with it, it starts a new one.
  process.on('disconnect', () => { log('web client gone, stopping'); process.exit(0); });
}

const svc = createService({ dir: DIR, secret: SECRET, adminToken: ADMIN_TOKEN, servers, clientVersion: () => CLIENT_VERSION, version: VERSION });
const server = http.createServer(svc.handler);
server.on('error', (e) => { console.error('[td] ' + e.message); process.exit(1); });
server.listen(PORT, HOST, () => {
  const port = server.address().port;
  log('tournament director ' + VERSION + ' on http://' + HOST + ':' + port + ' (data ' + DIR + ', node ' + process.version + ')');
  if (viaProxy) process.send({ type: 'ready', port, version: VERSION });
});
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => { server.close(); process.exit(0); });
}
