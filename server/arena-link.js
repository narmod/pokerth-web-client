'use strict';
// ═══════════════════════════════════════════════════════════════════
// The link with a PokerTH Arena (tournaments, cups, medals) — web.327.
//
// The Arena is an application of its own (narmod/pokerth-arena); the web
// client no longer runs it. This file is all the web client keeps of it,
// set in Admin › Community › Arena:
//   - the Arena's address and its link key (alk_…, made by the Arena on
//     /arena/organize › Web client — the web client makes no key), and an
//     On/Off switch;
//   - « Test and save », then every minute while on: POST
//     <Arena>/arena/api/link/sync with the key — this site's public address,
//     its version, the servers the Arena may use (the LAN directory and the
//     local server) and, every fifth time, the community events. Only the
//     Arena has an API: nothing here is exposed for it;
//   - /arena on this site: pages answer 302 to the Arena; the players' API
//     (/arena/api/…, the witness's table lookup and reports from
//     modules/arena-witness.mjs) is relayed server-side to the Arena with the
//     key and the player's address, so the browser stays on this site;
//   - /admin/arena/settings and /admin/arena/link-test; the rest of
//     /admin/arena answers 404 with the Arena's organizer page.
// Design: docs/ARENA_LINK.md.
// ═══════════════════════════════════════════════════════════════════

const http = require('http');
const https = require('https');

const LINK_KEY_RE = /^alk_[A-Za-z0-9_-]{40,60}$/;
// The players' API the witness uses (and the rest of the Arena's public
// API, relayed as is): list, one tournament and its actions, files.
const API_RE = /^\/arena\/api\/(?:list|showcase|account\/(?:login|invite|logout)|table|cups|badges|players\/[^/?#]{1,200}|c\/[A-Za-z0-9_-]{8,40}|t\/[A-Za-z0-9_-]{8,40}(?:\/[a-z]{2,16})?)$/;
const API_MAX_BODY = 8 * 1024;
const API_MAX_WITNESS = 64 * 1024;       // a witness report: every hand of a game
const API_MAX_LOG = 14 * 1024 * 1024;    // a player's log (.pdb, 10 MB) in base64
const LINK_TEST_MS = 8000;
const PUSH_MS = 60 * 1000;               // servers, every minute
const EVENTS_EVERY = 5;                  // events, every fifth send
const NOIDX = 'noindex, nofollow, noimageindex';

// « https://arena.example.org » (an origin: scheme, host, port; no path).
function cleanOrigin(v) {
  const s = String(v || '').trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[A-Za-z0-9.:[\]-]{1,255}$/.test(s)) return null;
  try { const u = new URL(s); return u.origin === s ? s : null; } catch (e) { return null; }
}

function createArenaLink(deps) {
  const log = deps.log || ((s) => console.log(s));
  let lastTest = null, lastPush = null, pushTimer = null, pushTick = 0, pushing = false;

  function cfg() { return deps.getConfig() || {}; }
  function linkUrl() { return cleanOrigin(cfg().url) || null; }
  function linkKey() { const k = String(cfg().key || ''); return LINK_KEY_RE.test(k) ? k : null; }
  function selfUrl() { return cleanOrigin(cfg().self) || null; }
  function enabled() { return cfg().enabled === true; }
  // On, with an address and a key: /arena is sent there, the servers are sent.
  function linked() { return enabled() && !!linkUrl() && !!linkKey(); }
  function settings() {
    const k = linkKey();
    return { enabled: enabled(), linked: linked(), link: { url: linkUrl(), self: selfUrl(), keySet: !!k, keyHint: k ? k.slice(0, 8) + '…' + k.slice(-4) : null, lastTest, lastPush } };
  }
  function setSettings(patch) {
    const cur = Object.assign({}, cfg());
    if (patch.url !== undefined) {
      if (patch.url === '' || patch.url === null) delete cur.url;
      else { const u = cleanOrigin(patch.url); if (!u) throw new Error('the Arena\'s address must be like https://arena.example.org (no path)'); cur.url = u; }
    }
    if (patch.key !== undefined) {
      if (patch.key === '' || patch.key === null) delete cur.key;
      else { const k = String(patch.key).trim(); if (!LINK_KEY_RE.test(k)) throw new Error('this is not an Arena link key (alk_…)'); cur.key = k; }
    }
    if (patch.self !== undefined) { const u = cleanOrigin(patch.self); if (u) cur.self = u; else delete cur.self; }
    if (typeof patch.enabled === 'boolean') {
      if (patch.enabled && !(cleanOrigin(cur.url) && LINK_KEY_RE.test(String(cur.key || '')))) throw new Error('give the Arena\'s address and its link key first, then Test and save');
      cur.enabled = patch.enabled;
    }
    // Settings of the Arena that ran inside the web client (until web.326).
    delete cur.mode; delete cur.allowAuthServers;
    if (cur.url !== cfg().url || cur.key !== cfg().key) { lastTest = null; lastPush = null; }
    deps.setConfig(cur);
    sync();
    return settings();
  }

  // ── sending the Arena what it needs, with its key ──
  function payload(withEvents, me) {
    let list = [];
    try { list = deps.listServers() || []; } catch (e) {}
    const body = { url: me || selfUrl() || undefined, version: deps.clientVersion(), servers: list };
    if (!withEvents) return Promise.resolve(body);
    return Promise.resolve().then(() => (deps.communityEvents ? deps.communityEvents() : null)).catch(() => null)
      .then((ev) => { body.events = ev && typeof ev === 'object' ? ev : null; return body; });
  }
  // POST <Arena>/arena/api/link/sync → { ok, arena?, servers?, error? }
  function post(url, key, body) {
    const fetchFn = deps.fetch || ((...a) => fetch(...a));
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), deps.linkTestMs || LINK_TEST_MS);
    return Promise.resolve()
      .then(() => fetchFn(url + '/arena/api/link/sync', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key }, body: JSON.stringify(body), signal: ac.signal }))
      .then((r) => r.json().catch(() => ({})).then((d) => ({ r, d })))
      .then(({ r, d }) => {
        if (r.status === 403) return { ok: false, error: 'the Arena refused the key' };
        if (r.status === 429) return { ok: false, error: 'the Arena says: too many attempts, try again later' };
        if (r.status === 404) return { ok: false, error: 'no Arena at this address (or not version 0.35.0 or later)' };
        if (!r.ok || !d || !d.ok) return { ok: false, error: (d && d.error) || ('the Arena answered HTTP ' + r.status) };
        return { ok: true, arena: String(d.arena || ''), servers: Number(d.servers) || 0 };
      })
      .catch((e) => ({ ok: false, error: e && e.name === 'AbortError' ? 'no answer from the Arena (timeout)' : 'cannot reach the Arena: ' + ((e && e.cause && e.cause.code) || (e && e.message) || 'error') }))
      .finally(() => clearTimeout(t));
  }
  function push(withEvents) {
    if (!linked() || pushing) return Promise.resolve(null);
    pushing = true;
    const ev = withEvents || pushTick % EVENTS_EVERY === 0;
    pushTick++;
    return payload(ev).then((b) => post(linkUrl(), linkKey(), b)).then((r) => {
      pushing = false;
      if (lastPush && lastPush.ok && !r.ok) log('[arena] sending to the Arena failed: ' + r.error);
      lastPush = { at: Date.now(), ok: r.ok, arena: r.arena || null, servers: r.servers || 0, events: ev, error: r.error || null };
      return r;
    }, () => { pushing = false; return null; });
  }
  function sync() {
    if (linked()) {
      if (pushTimer) return;
      pushTick = 0;
      pushTimer = setInterval(() => { push(false); }, deps.pushMs || PUSH_MS);
      if (pushTimer.unref) pushTimer.unref();
      setImmediate(() => { push(true); });
    } else if (pushTimer) { clearInterval(pushTimer); pushTimer = null; }
  }
  function stop() { if (pushTimer) { clearInterval(pushTimer); pushTimer = null; } }

  // « Test and save »: send the Arena who we are, the servers and the events,
  // with its key. Accepted: the address and the key are saved and the link
  // is turned on. → { ok, arena?, servers?, error? }
  function linkTest(o) {
    const url = o.url !== undefined ? cleanOrigin(o.url) : linkUrl();
    const key = o.key !== undefined && o.key !== '' ? String(o.key).trim() : linkKey();
    if (!url) return Promise.resolve({ ok: false, error: 'the Arena\'s address must be like https://arena.example.org (no path)' });
    if (!LINK_KEY_RE.test(String(key || ''))) return Promise.resolve({ ok: false, error: 'this is not an Arena link key (alk_…): copy it from the Arena, /arena/organize › Web client' });
    const me = cleanOrigin(o.origin);
    if (!me) return Promise.resolve({ ok: false, error: 'this web client\'s public address is unknown: set it in Admin › SEO' });
    return payload(true, me).then((b) => post(url, key, b)).then((res) => {
      if (res.ok) setSettings({ url, key, self: me, enabled: true });
      lastTest = { at: Date.now(), ok: res.ok, arena: res.arena || null, error: res.error || null };
      if (res.ok) lastPush = { at: lastTest.at, ok: true, arena: res.arena, servers: res.servers || 0, events: true, error: null };
      return res;
    });
  }

  // A player's request to the Arena's API, relayed as is.
  function relay(req, res, pathAndQuery, clientIp) {
    const fail = (code, error) => { if (res.headersSent) return; res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': NOIDX }); res.end(JSON.stringify({ ok: false, error })); };
    const base = linkUrl(), key = linkKey();
    if (!base || !key) return fail(503, 'the Arena is not linked');
    let u;
    try { u = new URL(base + pathAndQuery); } catch (e) { return fail(400, 'bad request'); }
    const headers = { 'x-arena-link': key, 'x-td-client': String(clientIp || '').slice(0, 64) };
    ['content-type', 'content-length', 'accept', 'if-none-match'].forEach((k) => { if (req.headers[k]) headers[k] = req.headers[k]; });
    const mod = u.protocol === 'https:' ? https : http;
    const r = mod.request({ protocol: u.protocol, hostname: u.hostname.replace(/^\[|\]$/g, ''), port: u.port || undefined, method: req.method, path: u.pathname + u.search, headers }, (pr) => {
      const out = {};
      ['content-type', 'content-length', 'cache-control', 'content-disposition', 'retry-after', 'etag'].forEach((k) => { if (pr.headers[k]) out[k] = pr.headers[k]; });
      out['x-robots-tag'] = NOIDX;
      res.writeHead(pr.statusCode, out);
      pr.pipe(res);
    });
    r.setTimeout(deps.relayMs || 60000, () => r.destroy(new Error('timeout')));
    r.on('error', (e) => fail(502, 'the Arena cannot be reached (' + ((e && e.code) || (e && e.message) || 'error') + ')'));
    if (req.method === 'GET' || req.method === 'HEAD') r.end(); else req.pipe(r);
  }

  return { settings, setSettings, sync, stop, enabled, linked, linkUrl, linkTest, push, relay };
}

// ── HTTP, under /admin/arena (auth and rate limit by handleAdmin) ──
function handleArenaAdmin(link, h, req, res, reqPathOnly, query) {
  const deny = () => h.adminJson(res, 403, { ok: false, error: 'forbidden' });
  const sub = reqPathOnly.slice('/admin/arena'.length) || '/';
  const answer = (code, extra) => h.adminJson(res, code || 200, Object.assign({ ok: true }, link.settings(), extra || {}));
  if (sub === '/settings') {
    if (req.method === 'POST') return h.readJsonBody(req, (b) => {
      if (!b || !h.adminAuthed(query, b.token)) return deny();
      try { link.setSettings(b); } catch (e) { return answer(400, { ok: false, error: e.message }); }
      return answer();
    });
    if (!h.adminAuthed(query)) return deny();
    return answer();
  }
  if (sub === '/link-test' && req.method === 'POST') return h.readJsonBody(req, (b) => {
    if (!b || !h.adminAuthed(query, b.token)) return deny();
    const o = { origin: h.origin ? h.origin(req) : '' };
    if (b.url !== undefined) o.url = b.url;
    if (b.key !== undefined) o.key = b.key;
    return link.linkTest(o).then((r) => answer(200, { test: r }));
  });
  // The Arena's own administration lives on the Arena.
  const url = link.linkUrl();
  return h.adminJson(res, 404, { ok: false, code: 'moved', error: 'the Arena is an application of its own: use its organizer page', url: url ? url + '/arena/organize' : null });
}

// ── /arena on this site: to the Arena (pages), through the Arena (API) ──
function handleArenaPage(link, req, res, reqPathOnly, clientIp) {
  const nf = () => { res.writeHead(404, { 'X-Robots-Tag': NOIDX }); res.end('Not found'); };
  if (!link.linked()) return nf();
  const base = link.linkUrl();
  const qi = String(req.url || '').indexOf('?');
  const qs = qi >= 0 ? String(req.url).slice(qi).slice(0, 300) : '';
  if (API_RE.test(reqPathOnly)) {
    if (req.method !== 'GET' && req.method !== 'POST') return nf();
    if (req.method === 'POST' && !(Number(req.headers['content-length']) <= (/\/witnesslog$/.test(reqPathOnly) ? API_MAX_LOG : /\/witness$/.test(reqPathOnly) ? API_MAX_WITNESS : API_MAX_BODY))) {
      res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end('{"ok":false,"code":"tooLarge"}');
    }
    return link.relay(req, res, reqPathOnly + qs, clientIp);
  }
  if ((req.method !== 'GET' && req.method !== 'HEAD') || reqPathOnly.length > 300 || /\.\.|\/\//.test(reqPathOnly)) return nf();
  res.writeHead(302, { Location: base + reqPathOnly + qs, 'Cache-Control': 'no-store', 'X-Robots-Tag': NOIDX });
  return res.end();
}

module.exports = { createArenaLink, handleArenaAdmin, handleArenaPage, API_RE, LINK_KEY_RE, cleanOrigin };
