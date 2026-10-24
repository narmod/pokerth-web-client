// ═══════════════════════════════════════════════════════════════════
// Arena — the link with a PokerTH web client, when the Arena runs as an
// application of its own (service 0.34.0, 2026-10-24).
//
// Launched by the web client, the Arena asks it over IPC for the servers it
// may use and the community events. Run on its own, the Arena is the only
// side with an API: the web client SENDS it those, with a key the Arena made.
//
//   1. The Arena holds a link key (ARENA_LINK_KEY, or made at the first start
//      and kept in ARENA_DIR/link.json). The super admin reads it on
//      /arena/organize › Web client.
//   2. In the web client, Admin › Community › Arena › « Its own app »: the
//      Arena's address and that key, then « Test and save ».
//   3. The web client calls POST /arena/api/link/sync with the key (Bearer):
//      its public address, its version, the servers the Arena may use (its
//      LAN directory and its local server) and the community events — at the
//      test, then every minute (events every few minutes). The Arena keeps
//      the last ones (on disk too, for a restart) and uses them while they
//      are fresh.
//
// The web client exposes nothing for the Arena. The players' witness reports
// keep going to the Arena's own API (/arena/api/t/<key>/witness), as before.
// ARENA_WEBCLIENT_URL fixes the web client's address (used to place its
// loopback servers). A new key (rotate) cuts the link until the web client is
// given it.
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const KEY_RE = /^alk_[A-Za-z0-9_-]{40,60}$/;
const FILE = 'link.json';
export const SERVERS_KEEP_MS = 10 * 60 * 1000;   // a list older than this: not used
export const EVENTS_KEEP_MS = 30 * 60 * 1000;
const MAX_SERVERS = 200;
const BAD_MAX = 10, BAD_WINDOW_MS = 10 * 60 * 1000;

function newKey() { return 'alk_' + crypto.randomBytes(33).toString('base64url'); }
function same(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length > 0 && x.length === y.length && crypto.timingSafeEqual(x, y);
}
// « https://webclient.example.org » (an origin: scheme, host, port; no path).
export function cleanOrigin(v) {
  const s = String(v || '').trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[A-Za-z0-9.:[\]-]{1,255}$/.test(s)) return null;
  try { const u = new URL(s); return u.origin === s ? s : null; } catch (e) { return null; }
}
const LOOPBACK = /^(?:127\.\d{1,3}\.\d{1,3}\.\d{1,3}|localhost|::1|\[::1\])$/i;
const str = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, n);
// One server as the web client describes it; only what the director uses.
export function cleanServer(s) {
  if (!s || typeof s !== 'object') return null;
  const ref = str(s.ref, 80), host = str(s.host, 255).trim(), port = Number(s.port);
  if (!ref || !host || !/^[A-Za-z0-9.:[\]_-]+$/.test(host) || !Number.isInteger(port) || port < 1 || port > 65535) return null;
  const kind = ['lan', 'local', 'registry'].indexOf(s.kind) >= 0 ? s.kind : 'lan';
  return { ref, kind, name: str(s.name, 80) || host, host, port, tls: !!s.tls, sni: str(s.sni, 255), noverify: !!s.noverify,
    pins: Array.isArray(s.pins) ? s.pins.slice(0, 10).map((p) => str(p, 120)).filter(Boolean) : [] };
}

/**
 * o: { dir, key?, webClientUrl?, now?, keepLoopback?, version?, log? }
 */
export function createLink(o) {
  const file = path.join(o.dir, FILE);
  const now = o.now || (() => Date.now());
  const log = o.log || (() => {});
  const fixedUrl = o.webClientUrl ? cleanOrigin(o.webClientUrl) : null;
  let st = { key: null, webClient: null, servers: null, serversAt: 0, events: null, eventsAt: 0 };
  try { st = Object.assign(st, JSON.parse(fs.readFileSync(file, 'utf8'))); } catch (e) {}
  const envKey = o.key && KEY_RE.test(o.key) ? o.key : null;
  if (!envKey && !KEY_RE.test(String(st.key || ''))) { st.key = newKey(); save(); }
  const bad = new Map();   // address → [times]

  function save() {
    try {
      fs.mkdirSync(o.dir, { recursive: true });
      const tmp = file + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(st, null, 2), { mode: 0o600 });
      fs.renameSync(tmp, file);
    } catch (e) { log('link: could not save ' + FILE + ': ' + e.message); }
  }
  function key() { return envKey || st.key; }
  function url() { return fixedUrl || (st.webClient && st.webClient.url) || null; }

  function tooMany(ip) {
    const t = now(), l = (bad.get(ip) || []).filter((x) => t - x < BAD_WINDOW_MS);
    bad.set(ip, l);
    return l.length >= BAD_MAX;
  }
  function failed(ip) { const l = bad.get(ip) || []; l.push(now()); bad.set(ip, l); }

  // POST /arena/api/link/sync — the web client sends who it is, the servers
  // and the events. → { status, body }
  function sync(authHeader, body, ip) {
    ip = String(ip || '').slice(0, 64);
    if (tooMany(ip)) return { status: 429, body: { ok: false, code: 'tooMany', error: 'too many attempts, try again later' } };
    const m = /^\s*Bearer\s+(.+?)\s*$/i.exec(String(authHeader || ''));
    if (!m || !same(m[1], key())) { failed(ip); return { status: 403, body: { ok: false, code: 'key', error: 'wrong link key' } }; }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return { status: 400, body: { ok: false, code: 'body', error: 'bad request' } };
    const b = body;
    const first = !st.webClient;
    const told = cleanOrigin(b.url);
    st.webClient = { url: fixedUrl || told || (st.webClient && st.webClient.url) || null, version: str(b.version, 40), at: now(), since: (st.webClient && st.webClient.since) || now() };
    if (Array.isArray(b.servers)) {
      st.servers = b.servers.slice(0, MAX_SERVERS).map(cleanServer).filter(Boolean);
      st.serversAt = now();
    }
    if (b.events !== undefined) {
      st.events = b.events && typeof b.events === 'object' && !Array.isArray(b.events) ? b.events : null;
      st.eventsAt = now();
    }
    save();
    if (first) log('link: web client ' + (url() || '(address unknown)') + (b.version ? ' (' + str(b.version, 40) + ')' : '') + ' linked');
    return { status: 200, body: { ok: true, arena: o.version || '', webClient: url(), servers: Array.isArray(st.servers) ? st.servers.length : 0 } };
  }

  // A server the web client reaches on its own machine is, from here, on the
  // web client's host.
  function moveLoopback(list) {
    if (o.keepLoopback) return list;
    let host = '';
    try { host = new URL(url()).hostname; } catch (e) { return list; }
    if (!host || LOOPBACK.test(host)) return list;
    return list.map((s) => (LOOPBACK.test(String(s.host || '')) ? Object.assign({}, s, { host }) : s));
  }
  // What the director may use: the last list sent, while fresh.
  function servers() {
    if (!Array.isArray(st.servers) || now() - (st.serversAt || 0) > SERVERS_KEEP_MS) return Promise.resolve([]);
    return Promise.resolve(moveLoopback(st.servers));
  }
  function events() {
    if (!st.events || now() - (st.eventsAt || 0) > EVENTS_KEEP_MS) return Promise.resolve(null);
    return Promise.resolve(st.events);
  }

  // What the super admin sees (/admin/arena/link).
  function info() {
    const w = st.webClient;
    const fresh = Array.isArray(st.servers) && now() - (st.serversAt || 0) <= SERVERS_KEEP_MS;
    return { mode: 'standalone', key: key(), keyFromEnv: !!envKey, webClient: url(), fixed: !!fixedUrl,
      linkedAt: w && w.since ? w.since : null, webClientVersion: w && w.version ? w.version : null, lastSync: w && w.at ? w.at : null,
      servers: Array.isArray(st.servers) ? st.servers.length : 0, serversFresh: fresh, eventsAt: st.eventsAt || null };
  }
  function rotate() {
    if (envKey) throw Object.assign(new Error('the key comes from ARENA_LINK_KEY: change it there'), { refused: true });
    st = { key: newKey(), webClient: null, servers: null, serversAt: 0, events: null, eventsAt: 0 };
    save();
    log('link: new key, the web client must be given it');
    return info();
  }
  function linked() { return !!st.webClient; }

  return { sync, servers, events, info, rotate, linked, key, url };
}
