// ═══════════════════════════════════════════════════════════════════
// Arena — the link with a PokerTH web client, when the Arena runs as an
// application of its own (service 0.34.0, 2026-10-24).
//
// Launched by the web client, the Arena asks it over IPC for the servers it
// may use and the community events. Run on its own, it gets them over HTTP
// from the web client it is linked to:
//
//   1. The Arena holds a link key (ARENA_LINK_KEY, or made at the first start
//      and kept in ARENA_DIR/link.json). The super admin reads it on
//      /arena/organize › Web client.
//   2. In the web client, Admin › Community › Arena › « Its own app »: the
//      Arena's address and that key, then « Test and save ». The web client
//      calls POST /arena/api/link/hello with the key and tells its own public
//      address; the Arena keeps it.
//   3. From then on the Arena reads GET <web client>/api/arena-link/servers
//      and /api/arena-link/events with the same key (Bearer).
//
// ARENA_WEBCLIENT_URL fixes the web client's address (the hello does not
// change it then). The key never leaves the two installs; a new key (rotate)
// cuts the link until the web client is given it.
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const KEY_RE = /^alk_[A-Za-z0-9_-]{40,60}$/;
const FILE = 'link.json';
const SERVERS_MS = 3000, EVENTS_MS = 5000;
const SERVERS_KEEP_MS = 10 * 60 * 1000;   // the last good list, while the web client is away
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

/**
 * o: { dir, key?, webClientUrl?, fetch?, now?, keepLoopback?, log? }
 */
export function createLink(o) {
  const file = path.join(o.dir, FILE);
  const fetchFn = o.fetch || ((...a) => fetch(...a));
  const now = o.now || (() => Date.now());
  const log = o.log || (() => {});
  const fixedUrl = o.webClientUrl ? cleanOrigin(o.webClientUrl) : null;
  let st = { key: null, webClient: null };
  try { st = Object.assign(st, JSON.parse(fs.readFileSync(file, 'utf8'))); } catch (e) {}
  const envKey = o.key && KEY_RE.test(o.key) ? o.key : null;
  if (!envKey && !KEY_RE.test(String(st.key || ''))) { st.key = newKey(); save(); }
  let lastServers = null, lastServersAt = 0, lastPull = null, lastError = null;
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

  // POST /arena/api/link/hello — the web client says who it is.
  // → { status, body }
  function hello(authHeader, body, ip) {
    ip = String(ip || '').slice(0, 64);
    if (tooMany(ip)) return { status: 429, body: { ok: false, code: 'tooMany', error: 'too many attempts, try again later' } };
    const m = /^\s*Bearer\s+(.+?)\s*$/i.exec(String(authHeader || ''));
    if (!m || !same(m[1], key())) { failed(ip); return { status: 403, body: { ok: false, code: 'key', error: 'wrong link key' } }; }
    const b = body && typeof body === 'object' ? body : {};
    const told = cleanOrigin(b.url);
    if (!fixedUrl && !told) return { status: 400, body: { ok: false, code: 'url', error: 'the web client did not say its public address' } };
    const prev = url();
    if (!fixedUrl) st.webClient = { url: told, version: String(b.version || '').slice(0, 40), at: now() };
    else st.webClient = Object.assign({}, st.webClient || {}, { url: fixedUrl, version: String(b.version || '').slice(0, 40), at: now() });
    save();
    if (prev !== url()) { lastServers = null; lastServersAt = 0; }
    log('link: web client ' + url() + (b.version ? ' (' + String(b.version).slice(0, 40) + ')' : '') + ' linked');
    return { status: 200, body: { ok: true, arena: o.version || '', webClient: url(), fixed: !!fixedUrl } };
  }

  function get(sub, ms) {
    const u = url();
    if (!u) return Promise.resolve(null);
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), ms);
    return Promise.resolve()
      .then(() => fetchFn(u + '/api/arena-link/' + sub, { headers: { Authorization: 'Bearer ' + key(), Accept: 'application/json' }, signal: ac.signal }))
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((d) => { lastPull = now(); lastError = null; return d; })
      .catch((e) => { lastError = sub + ': ' + ((e && e.name === 'AbortError') ? 'timeout' : (e && e.message) || 'error'); return null; })
      .finally(() => clearTimeout(t));
  }
  // A server the web client reaches on its own machine is, from here, on the
  // web client's host.
  function moveLoopback(list) {
    if (o.keepLoopback) return list;
    let host = '';
    try { host = new URL(url()).hostname; } catch (e) { return list; }
    if (!host || LOOPBACK.test(host)) return list;
    return list.map((s) => (s && LOOPBACK.test(String(s.host || '')) ? Object.assign({}, s, { host }) : s));
  }
  function servers() {
    return get('servers', SERVERS_MS).then((d) => {
      if (d && Array.isArray(d.servers)) {
        lastServers = moveLoopback(d.servers.filter((s) => s && typeof s === 'object' && s.ref && s.host));
        lastServersAt = now();
        return lastServers;
      }
      return lastServers && now() - lastServersAt < SERVERS_KEEP_MS ? lastServers : [];
    });
  }
  function events() {
    return get('events', EVENTS_MS).then((d) => (d && typeof d === 'object' && d.events && typeof d.events === 'object' ? d.events : null));
  }

  // What the super admin sees (/admin/arena/link).
  function info() {
    const w = st.webClient;
    return { mode: 'standalone', key: key(), keyFromEnv: !!envKey, webClient: url(), fixed: !!fixedUrl, linkedAt: w && w.at ? w.at : null, webClientVersion: w && w.version ? w.version : null, lastPull, lastError };
  }
  function rotate() {
    if (envKey) throw Object.assign(new Error('the key comes from ARENA_LINK_KEY: change it there'), { refused: true });
    st.key = newKey();
    st.webClient = null;
    lastServers = null; lastServersAt = 0; lastPull = null; lastError = null;
    save();
    log('link: new key, the web client must be given it');
    return info();
  }
  function linked() { return !!url(); }

  return { hello, servers, events, info, rotate, linked, key, url };
}
