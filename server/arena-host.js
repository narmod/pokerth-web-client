'use strict';
// ═══════════════════════════════════════════════════════════════════
// Arena (tournaments, cups, medals, the tournament director) — proxy side
// (2026-10-23; « tournaments » until web.315).
//
// The Arena is a service of its own (arena/, own package.json and
// version). This file is all the web client keeps of it:
//   - the setting (Admin › Community › Arena, off by default);
//   - launching the service while it is on (child process, restarted with a
//     growing delay if it stops), and stopping it when turned off;
//   - relaying /arena (page) and /admin/arena/* (API) to it, the
//     admin token being checked here first (with handleAdmin's brute-force
//     limit); the service is told the request is genuine by a secret made at
//     each launch (header X-TD-Secret) and who sent it (X-TD-Author);
//   - answering its questions over IPC: which servers it may use (the LAN
//     directory and the local server — never pokerth.net);
//   - restarting it ALONE when its code changes on disk (an update that only
//     touches arena/ needs no restart of the web client: the update check
//     says so, the static update pulls it, and the new code is picked up here
//     within CODE_POLL_MS). The service has its own version
//     (arena/package.json); the web client's does not move for it.
// Watches run in detached processes started by the service: they survive
// the service and the web client.
//
// « Its own app » (web.323, 2026-10-24): the Arena can also run as an
// application of its own, elsewhere. Admin › Community › Arena then keeps
// its address and its link key (made by the Arena, /arena/organize › Web
// client) instead of launching the service. Only the Arena has an API: this
// web client SENDS it, with that key, its public address, its version, the
// servers the Arena may use (LAN directory and local server) and the
// community events — POST /arena/api/link/sync at « Test and save », then
// every minute (events every five). Nothing is exposed here for the Arena;
// /arena pages on this site send visitors to the Arena's address, and the
// players' API on this site (/arena/api/…: the witness's table lookup and
// reports) is relayed server-side to the Arena's own API with the link key
// and the player's address (web.325) — the browser stays on this site, no
// CORS, sendBeacon works. The personal codes come from the Arena's « Play on
// the web client » button (#arena=… in the link, arena-witness.mjs).
// Design: docs/ARENA.md.
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const childProcess = require('child_process');

const ARENA_ROOT = path.join(__dirname, '..', 'arena');
const ENTRY = path.join(ARENA_ROOT, 'server.mjs');
const CODE_POLL_MS = 15000;

// What the running service is made of: its entry, package.json, lib/ and
// public/ (not its tests). Size and mtime are enough to notice an update.
function codeKey() {
  const files = [ENTRY, path.join(ARENA_ROOT, 'package.json')];
  for (const sub of ['lib', 'public']) {
    try { fs.readdirSync(path.join(ARENA_ROOT, sub)).sort().forEach((f) => files.push(path.join(ARENA_ROOT, sub, f))); } catch (e) {}
  }
  return files.map((f) => { try { const st = fs.statSync(f); return f + ':' + st.size + ':' + st.mtimeMs; } catch (e) { return f + ':-'; } }).join('|');
}
function diskVersion() {
  try { return JSON.parse(fs.readFileSync(path.join(ARENA_ROOT, 'package.json'), 'utf8')).version || null; } catch (e) { return null; }
}
// The pages and their files: /arena (players) and the views of its menu
// (/arena/tournaments, /arena/login…, one lowercase segment), /arena/organize
// (and its views), /arena/t/<key> (one tournament), the page files (the
// service worker sw.js, the manifest), the app's icons, the language files,
// the Inter font (/arena/fonts/, service 0.37.0).
const PAGE_RE = /^\/arena(?:\.html|\/|\/organize(?:\/[a-z0-9-]{1,30}){0,2}\/?|\/[a-z][a-z0-9-]{1,30}\/?|\/[tc]\/[A-Za-z0-9_-]{8,40}\/?|\/[A-Za-z0-9_-]+\.(?:mjs|js|json|css|webmanifest)|\/icons\/[a-z0-9-]{1,40}\.(?:png|svg)|\/lang\/[a-z]{2,3}(?:-[a-z0-9]{2,4})?\.mjs|\/avatar|\/p\/[^/?#]{1,200}|\/img\/[a-z0-9_-]{1,40}(?:\.t)?\.(?:jpg|webp)|\/fonts\/[A-Za-z0-9_-]{1,60}\.(?:woff2|txt))?$/;
// The players' API, without a token: list, one tournament, (un)register, files.
const API_RE = /^\/arena\/api\/(?:list|showcase|account\/(?:login|invite|logout)|table|cups|badges|players\/[^/?#]{1,200}|c\/[A-Za-z0-9_-]{8,40}|t\/[A-Za-z0-9_-]{8,40}(?:\/[a-z]{2,16})?)$/;
const API_MAX_BODY = 8 * 1024;
const API_MAX_WITNESS = 64 * 1024;   // a witness report: every hand of a game
const API_MAX_LOG = 14 * 1024 * 1024;   // a player's log (.pdb, 10 MB) in base64
// Only these reach the service; the rest of the environment (admin token,
// database passwords…) stays with the web client.
const ENV_KEEP = ['PATH', 'HOME', 'LANG', 'LC_ALL', 'TZ', 'TMPDIR', 'NODE_EXTRA_CA_CERTS', 'SSL_CERT_FILE'];
// « Its own app »: the Arena's link key (arena/lib/link.mjs) and address.
const LINK_KEY_RE = /^alk_[A-Za-z0-9_-]{40,60}$/;
const LINK_TEST_MS = 8000;
const PUSH_MS = 60 * 1000;     // servers, every minute
const EVENTS_EVERY = 5;        // events, every fifth send
// « https://arena.example.org » (an origin: scheme, host, port; no path).
function cleanOrigin(v) {
  const s = String(v || '').trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[A-Za-z0-9.:[\]-]{1,255}$/.test(s)) return null;
  try { const u = new URL(s); return u.origin === s ? s : null; } catch (e) { return null; }
}

function createArenaHost(deps) {
  const log = deps.log || ((s) => console.log(s));
  let child = null, port = null, version = null, status = 'off', lastError = null;
  let restarts = 0, timer = null, stableTimer = null, startedAt = null, secret = null;
  let runningKey = null, reloading = false, codeTimer = null;
  let readyWaiters = [];

  let lastTest = null, lastPush = null, pushTimer = null, pushTick = 0, pushing = false;

  function cfg() { return deps.getConfig() || {}; }
  function enabled() { return cfg().enabled === true; }
  // Where the Arena runs: « embedded » (launched here) or « external » (its own app).
  function mode() { return cfg().mode === 'external' ? 'external' : 'embedded'; }
  function linkUrl() { return cleanOrigin(cfg().url) || null; }
  function linkKey() { const k = String(cfg().key || ''); return LINK_KEY_RE.test(k) ? k : null; }
  // This web client's public address, as told to the Arena at « Test and save ».
  function selfUrl() { return cleanOrigin(cfg().self) || null; }
  function external() { return enabled() && mode() === 'external' && !!linkUrl() && !!linkKey(); }
  function wantsChild() { return enabled() && mode() !== 'external'; }
  function linkInfo() {
    const k = linkKey();
    return { mode: mode(), url: linkUrl(), self: selfUrl(), keySet: !!k, keyHint: k ? k.slice(0, 8) + '…' + k.slice(-4) : null, lastTest, lastPush };
  }
  function settings() { return Object.assign({ enabled: enabled() }, { link: linkInfo() }); }
  function setSettings(patch) {
    const cur = Object.assign({}, cfg());
    if (typeof patch.enabled === 'boolean') cur.enabled = patch.enabled;
    if (patch.url !== undefined) {
      if (patch.url === '' || patch.url === null) delete cur.url;
      else { const u = cleanOrigin(patch.url); if (!u) throw new Error('the Arena\'s address must be like https://arena.example.org (no path)'); cur.url = u; }
    }
    if (patch.key !== undefined) {
      if (patch.key === '' || patch.key === null) delete cur.key;
      else { const k = String(patch.key).trim(); if (!LINK_KEY_RE.test(k)) throw new Error('this is not an Arena link key (alk_…)'); cur.key = k; }
    }
    if (patch.self !== undefined) { const u = cleanOrigin(patch.self); if (u) cur.self = u; else delete cur.self; }
    if (patch.mode === 'embedded' || patch.mode === 'external') {
      if (patch.mode === 'external' && !(cleanOrigin(cur.url) && LINK_KEY_RE.test(String(cur.key || '')))) throw new Error('give the Arena\'s address and its link key first');
      cur.mode = patch.mode;
    }
    if (cur.mode !== 'external') delete cur.mode;
    delete cur.allowAuthServers;   // option of web.292, withdrawn: LAN only
    if (cur.url !== cfg().url || cur.key !== cfg().key) { lastTest = null; lastPush = null; }
    deps.setConfig(cur);
    sync();
    return settings();
  }
  function sync() { if (wantsChild()) start(); else stop(); pushLoop(); }

  // ── « Its own app »: send the Arena what it needs, with its key ──
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
        if (r.status === 404) return { ok: false, error: 'no Arena at this address (or it is launched by a web client, not on its own)' };
        if (!r.ok || !d || !d.ok) return { ok: false, error: (d && d.error) || ('the Arena answered HTTP ' + r.status) };
        return { ok: true, arena: String(d.arena || ''), servers: Number(d.servers) || 0 };
      })
      .catch((e) => ({ ok: false, error: e && e.name === 'AbortError' ? 'no answer from the Arena (timeout)' : 'cannot reach the Arena: ' + ((e && e.cause && e.cause.code) || (e && e.message) || 'error') }))
      .finally(() => clearTimeout(t));
  }
  function push(withEvents) {
    if (!external() || pushing) return Promise.resolve(null);
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
  function pushLoop() {
    if (external()) {
      if (pushTimer) return;
      pushTick = 0;
      pushTimer = setInterval(() => { push(false); }, deps.pushMs || PUSH_MS);
      if (pushTimer.unref) pushTimer.unref();
      setImmediate(() => { push(true); });
    } else if (pushTimer) { clearInterval(pushTimer); pushTimer = null; }
  }

  // « Test and save »: send the Arena who we are, the servers and the events,
  // with its key. Given an address and a key, they are saved when the Arena
  // accepts them. → { ok, arena?, servers?, error? }
  // A player's request to the Arena's API, relayed as is (web.325).
  function relayLink(req, res, pathAndQuery, clientIp) {
    const NOIDX = 'noindex, nofollow, noimageindex';
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

  function linkTest(o) {
    const url = o.url !== undefined ? cleanOrigin(o.url) : linkUrl();
    const key = o.key !== undefined ? String(o.key || '').trim() : linkKey();
    if (!url) return Promise.resolve({ ok: false, error: 'the Arena\'s address must be like https://arena.example.org (no path)' });
    if (!LINK_KEY_RE.test(String(key || ''))) return Promise.resolve({ ok: false, error: 'this is not an Arena link key (alk_…): copy it from the Arena, /arena/organize › Web client' });
    const me = cleanOrigin(o.origin);
    if (!me) return Promise.resolve({ ok: false, error: 'this web client\'s public address is unknown: set it in Admin › SEO' });
    return payload(true, me).then((b) => post(url, key, b)).then((res) => {
      if (res.ok) {
        const patch = { self: me };
        if (o.url !== undefined || o.key !== undefined) Object.assign(patch, { url, key });
        setSettings(patch);
      }
      lastTest = { at: Date.now(), ok: res.ok, arena: res.arena || null, error: res.error || null };
      if (res.ok) lastPush = { at: lastTest.at, ok: true, arena: res.arena, servers: res.servers || 0, events: true, error: null };
      return res;
    });
  }

  // New code on disk while the service runs: restart it, and only it.
  function watchCode() {
    if (codeTimer) return;
    codeTimer = setInterval(() => {
      if (!child || !port || reloading) return;
      const k = codeKey();
      if (runningKey && k !== runningKey) {
        log('[arena] new code on disk (version ' + (version || '?') + ' → ' + (diskVersion() || '?') + '): restarting the Arena service only');
        restart('code updated');
      }
    }, deps.codePollMs || CODE_POLL_MS);
    if (codeTimer.unref) codeTimer.unref();
  }
  // Stop and start again at once (not counted as a failure). Watches are
  // processes of their own: they go on meanwhile.
  function restart(why) {
    if (!wantsChild()) return Promise.resolve(false);
    const c = child;
    if (!c) { start(); return ready(10000); }
    reloading = true;
    status = 'restarting';
    lastError = null;
    return new Promise((resolve) => {
      c.once('exit', () => { reloading = false; restarts = 0; start(); ready(10000).then(resolve); });
      try { c.kill('SIGTERM'); } catch (e) { reloading = false; resolve(false); }
      setTimeout(() => { try { c.kill('SIGKILL'); } catch (e) {} }, 5000).unref();
      log('[arena] restarting the service' + (why ? ' (' + why + ')' : ''));
    });
  }

  function settle(ok) { const w = readyWaiters; readyWaiters = []; w.forEach((f) => f(ok)); }
  function start() {
    if (child || timer) return;
    status = restarts ? 'restarting' : 'starting';
    secret = crypto.randomBytes(24).toString('hex');
    const env = {};
    ENV_KEEP.forEach((k) => { if (process.env[k] != null) env[k] = process.env[k]; });
    Object.assign(env, { ARENA_DIR: deps.dir, ARENA_SECRET: secret, ARENA_CLIENT_VERSION: deps.clientVersion(), ARENA_HOST: '127.0.0.1', ARENA_PORT: '0' });
    let c;
    try {
      c = childProcess.fork(ENTRY, [], { env, execArgv: [], stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
    } catch (e) {
      lastError = 'could not start: ' + e.message; status = 'failed'; log('[arena] ' + lastError); settle(false);
      return;
    }
    child = c; startedAt = Date.now();
    runningKey = codeKey();
    watchCode();
    const lines = (stream) => {
      let buf = '';
      stream.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); if (l.trim()) log(l.indexOf('[arena]') === 0 ? l : '[arena] ' + l); } });
    };
    lines(c.stdout); lines(c.stderr);
    c.on('message', (m) => {
      if (!m || typeof m !== 'object') return;
      if (m.type === 'ready') {
        port = m.port; version = m.version || null; status = 'running'; lastError = null; settle(true);
        // Running for a minute: the next stop counts as a first one again.
        clearTimeout(stableTimer);
        stableTimer = setTimeout(() => { restarts = 0; }, 60000); stableTimer.unref();
      } else if (m.type === 'servers') {
        let list = [];
        try { list = deps.listServers() || []; } catch (e) {}
        try { c.send({ type: 'servers', id: m.id, servers: list }); } catch (e) {}
      } else if (m.type === 'events') {
        // The community sites' events for the Arena's home page (the Events relay's cache).
        Promise.resolve().then(() => (deps.communityEvents ? deps.communityEvents() : null)).catch(() => null)
          .then((data) => { try { c.send({ type: 'events', id: m.id, data: data || null }); } catch (e) {} });
      }
    });
    c.on('error', (e) => { lastError = e.message; log('[arena] process error: ' + e.message); });
    c.on('exit', (code, signal) => {
      if (child !== c) return;
      child = null; port = null; clearTimeout(stableTimer);
      settle(false);
      if (reloading) return;              // restart(): it starts the new one
      if (!wantsChild()) { status = 'off'; return; }
      lastError = 'stopped (code ' + code + (signal ? ', signal ' + signal : '') + ')';
      restarts++;
      const delay = Math.min(30000, 1000 * Math.pow(2, Math.min(restarts - 1, 5)));
      status = 'restarting';
      log('[arena] service ' + lastError + ', restart in ' + Math.round(delay / 1000) + ' s');
      timer = setTimeout(() => { timer = null; if (wantsChild()) start(); }, delay);
      timer.unref();
    });
  }
  function stop() {
    clearTimeout(timer); timer = null; clearTimeout(stableTimer);
    restarts = 0;
    const c = child;
    child = null; port = null; status = 'off';
    settle(false);
    if (c) { try { c.kill('SIGTERM'); } catch (e) {} }
  }
  function ready(ms) {
    if (port) return Promise.resolve(true);
    if (!child && !timer) return Promise.resolve(false);
    return new Promise((resolve) => {
      const t = setTimeout(() => { readyWaiters = readyWaiters.filter((f) => f !== done); resolve(false); }, ms);
      const done = (ok) => { clearTimeout(t); resolve(ok); };
      readyWaiters.push(done);
    });
  }
  function info() {
    return { status, version, diskVersion: diskVersion(), pid: child ? child.pid : null, restarts, lastError, since: port ? startedAt : null };
  }

  // ── talking to the service ──
  function request(method, pathAndQuery, headers, body, cb) {
    const r = http.request({ host: '127.0.0.1', port, method, path: pathAndQuery, headers }, (pr) => cb(null, pr));
    r.on('error', (e) => cb(e));
    r.setTimeout(120000, () => r.destroy(new Error('timeout')));
    if (body && body.pipe) body.pipe(r); else r.end(body || undefined);
    return r;
  }
  // Relay a request as is; `author` set = an authenticated API call.
  // Nothing of /arena is ever indexed by search engines (the web client's
  // SEO leaves it out): every answer says noindex, whatever the service sends.
  const NOINDEX = 'noindex, nofollow, noimageindex';
  function relay(req, res, pathAndQuery, author, extra) {
    return ready(8000).then((ok) => {
      if (!ok) {
        res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '5', 'X-Robots-Tag': NOINDEX });
        return res.end(JSON.stringify({ ok: false, error: 'the Arena service is not running (' + status + (lastError ? ': ' + lastError : '') + ')' }));
      }
      const headers = {};
      ['content-type', 'content-length', 'accept', 'if-none-match'].forEach((k) => { if (req.headers[k]) headers[k] = req.headers[k]; });
      if (author) { headers['x-td-secret'] = secret; headers['x-td-author'] = encodeURIComponent(author); }
      if (extra) Object.assign(headers, extra);
      request(req.method, pathAndQuery, headers, req.method === 'GET' || req.method === 'HEAD' ? null : req, (err, pr) => {
        if (err) {
          if (!res.headersSent) { res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'X-Robots-Tag': NOINDEX }); res.end(JSON.stringify({ ok: false, error: 'Arena service: ' + err.message })); }
          return;
        }
        const out = {};
        ['content-type', 'content-length', 'cache-control', 'content-disposition', 'retry-after', 'access-control-allow-origin', 'etag'].forEach((k) => { if (pr.headers[k]) out[k] = pr.headers[k]; });
        out['x-robots-tag'] = NOINDEX;
        res.writeHead(pr.statusCode, out);
        pr.pipe(res);
      });
    });
  }
  // The service's own status (key, running watches); null when it is not up.
  function serviceStatus() {
    return ready(8000).then((ok) => {
      if (!ok) return null;
      return new Promise((resolve) => {
        request('GET', '/admin/arena/status', { 'x-td-secret': secret, 'x-td-author': 'web-client' }, null, (err, pr) => {
          if (err) return resolve(null);
          let b = ''; pr.on('data', (d) => { b += d; }); pr.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { resolve(null); } });
        });
      });
    });
  }
  // The install key's public part, readable even while the service is off.
  function keyInfo() {
    try {
      const keyFile = path.join(deps.dir, 'td-key.pem');
      const pub = crypto.createPublicKey(crypto.createPrivateKey(fs.readFileSync(keyFile, 'utf8')));
      const der = pub.export({ type: 'spki', format: 'der' });
      return { publicKeyRaw: Buffer.from(der.subarray(der.length - 32)).toString('base64'), created: fs.statSync(keyFile).mtimeMs };
    } catch (e) { return null; }
  }

  return { settings, setSettings, sync, start, stop, restart, ready, info, relay, relayLink, serviceStatus, keyInfo, enabled, mode, external, linkUrl, linkTest, push, PAGE_RE };
}

// ── HTTP, under /admin/arena (auth and rate limit by handleAdmin) ──
function handleArenaAdmin(host, h, req, res, reqPathOnly, query) {
  const deny = () => h.adminJson(res, 403, { ok: false, error: 'forbidden' });
  const sub = reqPathOnly.slice('/admin/arena'.length) || '/';
  const answerSettings = () => {
    const base = Object.assign({ ok: true }, host.settings(), { service: host.info(), key: host.keyInfo(), running: null, maxRunning: null });
    if (!base.enabled || host.mode() === 'external') return h.adminJson(res, 200, base);
    return host.serviceStatus().then((s) => {
      if (s && s.ok) Object.assign(base, { key: s.key || base.key, running: s.running, maxRunning: s.maxRunning, service: host.info() });
      else base.service = host.info();
      h.adminJson(res, 200, base);
    });
  };
  if (sub === '/settings') {
    if (req.method === 'POST') return h.readJsonBody(req, (b) => {
      if (!b || !h.adminAuthed(query, b.token)) return deny();
      try { host.setSettings(b); } catch (e) { return h.adminJson(res, 400, Object.assign({ ok: false, error: e.message }, host.settings())); }
      return answerSettings();
    });
    if (!h.adminAuthed(query)) return deny();
    return answerSettings();
  }
  // « Its own app »: tell the Arena who we are, with its key (and save them when it accepts).
  if (sub === '/link-test' && req.method === 'POST') return h.readJsonBody(req, (b) => {
    if (!b || !h.adminAuthed(query, b.token)) return deny();
    const o = { origin: h.origin ? h.origin(req) : '' };
    if (b.url !== undefined) o.url = b.url;
    if (b.key !== undefined) o.key = b.key;
    return host.linkTest(o).then((r) => h.adminJson(res, 200, Object.assign({}, host.settings(), { ok: true, test: r })));
  });
  if (sub === '/restart' && req.method === 'POST') return h.readJsonBody(req, (b) => {
    if (!b || !h.adminAuthed(query, b.token)) return deny();
    if (!host.enabled()) return h.adminJson(res, 409, { ok: false, error: 'the Arena is off' });
    if (host.mode() === 'external') return h.adminJson(res, 409, { ok: false, error: 'the Arena runs as its own app: restart it there' });
    return host.restart('asked by the admin').then(() => answerSettings());
  });
  // Everything else is the service's: token checked here, then relayed with
  // who acts — the master key (« admin ») or an organizer's key (its name) —
  // or an account's session token, which the service checks itself.
  const who = h.author ? h.author(query) : (h.adminAuthed(query) ? 'admin' : null);
  if (!who) return deny();
  if (!host.enabled()) return h.adminJson(res, 409, { ok: false, error: 'the Arena is off (Admin › Community › Arena)' });
  if (host.mode() === 'external') return h.adminJson(res, 409, { ok: false, code: 'external', error: 'the Arena runs as its own app: use its organizer page', url: host.linkUrl() ? host.linkUrl() + '/arena/organize' : null });
  const qs = Object.keys(query).filter((k) => k !== 'token' && query[k] != null)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(query[k])).join('&');
  if (typeof who === 'object' && who.session) return host.relay(req, res, reqPathOnly + (qs ? '?' + qs : ''), 'session', { 'x-arena-session': who.session });
  return host.relay(req, res, reqPathOnly + (qs ? '?' + qs : ''), who);
}

// ── /arena and its files (no token: the page asks for it) ──
function handleArenaPage(host, req, res, reqPathOnly, clientIp, origin) {
  const nf = () => { res.writeHead(404, { 'X-Robots-Tag': 'noindex, nofollow, noimageindex' }); res.end('Not found'); };
  if (!host.enabled()) return nf();
  // « Its own app »: /arena pages on this site send visitors to the Arena's
  // address (302); the players' API (the witness) is relayed server-side to
  // the Arena with the link key and the player's address (web.325).
  if (host.mode() === 'external') {
    const base = host.linkUrl();
    if (!base) return nf();
    const qi = String(req.url || '').indexOf('?');
    const qs = qi >= 0 ? String(req.url).slice(qi).slice(0, 300) : '';
    if (API_RE.test(reqPathOnly)) {
      if (req.method !== 'GET' && req.method !== 'POST') return nf();
      if (req.method === 'POST' && !(Number(req.headers['content-length']) <= (/\/witnesslog$/.test(reqPathOnly) ? API_MAX_LOG : /\/witness$/.test(reqPathOnly) ? API_MAX_WITNESS : API_MAX_BODY))) {
        res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end('{"ok":false,"code":"tooLarge"}');
      }
      return host.relayLink(req, res, reqPathOnly + qs, clientIp);
    }
    if (!PAGE_RE.test(reqPathOnly) || (req.method !== 'GET' && req.method !== 'HEAD')) return nf();
    res.writeHead(302, { Location: base + reqPathOnly + qs, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noimageindex' });
    return res.end();
  }
  if (API_RE.test(reqPathOnly)) {
    if (req.method !== 'GET' && req.method !== 'POST') return nf();
    if (req.method === 'POST' && !(Number(req.headers['content-length']) <= (/\/witnesslog$/.test(reqPathOnly) ? API_MAX_LOG : /\/witness$/.test(reqPathOnly) ? API_MAX_WITNESS : API_MAX_BODY))) {
      res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end('{"ok":false,"code":"tooLarge"}');
    }
    // The query (an invitation code, a file name) goes along; the player's
    // address too, for the service's per-address limits. Never a token.
    const qi = String(req.url || '').indexOf('?');
    const qs = qi >= 0 ? String(req.url).slice(qi).slice(0, 300) : '';
    return host.relay(req, res, reqPathOnly + qs, null, { 'x-td-client': String(clientIp || '').slice(0, 64) });
  }
  if (!PAGE_RE.test(reqPathOnly) || (req.method !== 'GET' && req.method !== 'HEAD')) return nf();
  return host.relay(req, res, reqPathOnly, null, origin ? { 'x-td-origin': String(origin).slice(0, 300) } : null);
}

module.exports = { createArenaHost, handleArenaAdmin, handleArenaPage, PAGE_RE, API_RE, LINK_KEY_RE, cleanOrigin };
