'use strict';
// ═══════════════════════════════════════════════════════════════════
// Tournament director — proxy side (2026-10-23).
//
// The director is a service of its own (tournament/, own package.json and
// version). This file is all the web client keeps of it:
//   - the setting (Admin › Community › Tournaments, off by default);
//   - launching the service while it is on (child process, restarted with a
//     growing delay if it stops), and stopping it when turned off;
//   - relaying /tournament (page) and /admin/tournaments/* (API) to it, the
//     admin token being checked here first (with handleAdmin's brute-force
//     limit); the service is told the request is genuine by a secret made at
//     each launch (header X-TD-Secret) and who sent it (X-TD-Author);
//   - answering its questions over IPC: which servers it may use (the LAN
//     directory and the local server — never pokerth.net);
//   - restarting it ALONE when its code changes on disk (an update that only
//     touches tournament/ needs no restart of the web client: the update check
//     says so, the static update pulls it, and the new code is picked up here
//     within CODE_POLL_MS). The service has its own version
//     (tournament/package.json); the web client's does not move for it.
// Watches run in detached processes started by the service: they survive
// the service and the web client.
// Design: docs/TOURNAMENT_DIRECTOR.md.
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const childProcess = require('child_process');

const TD_ROOT = path.join(__dirname, '..', 'tournament');
const ENTRY = path.join(TD_ROOT, 'server.mjs');
const CODE_POLL_MS = 15000;

// What the running service is made of: its entry, package.json, lib/ and
// public/ (not its tests). Size and mtime are enough to notice an update.
function codeKey() {
  const files = [ENTRY, path.join(TD_ROOT, 'package.json')];
  for (const sub of ['lib', 'public']) {
    try { fs.readdirSync(path.join(TD_ROOT, sub)).sort().forEach((f) => files.push(path.join(TD_ROOT, sub, f))); } catch (e) {}
  }
  return files.map((f) => { try { const st = fs.statSync(f); return f + ':' + st.size + ':' + st.mtimeMs; } catch (e) { return f + ':-'; } }).join('|');
}
function diskVersion() {
  try { return JSON.parse(fs.readFileSync(path.join(TD_ROOT, 'package.json'), 'utf8')).version || null; } catch (e) { return null; }
}
// The pages and their files: /tournament (players), /tournament/organize,
// /tournament/t/<key> (one tournament), the page files and the language files.
const PAGE_RE = /^\/tournament(?:\.html|\/|\/organize\/?|\/t\/[A-Za-z0-9_-]{8,40}\/?|\/[A-Za-z0-9_-]+\.(?:mjs|json|css)|\/lang\/[a-z]{2,3}(?:-[a-z0-9]{2,4})?\.mjs)?$/;
// The players' API, without a token: list, one tournament, (un)register, files.
const API_RE = /^\/tournament\/api\/(?:list|table|t\/[A-Za-z0-9_-]{8,40}(?:\/[a-z]{2,16})?)$/;
const API_MAX_BODY = 8 * 1024;
const API_MAX_WITNESS = 64 * 1024;   // a witness report: every hand of a game
// Only these reach the service; the rest of the environment (admin token,
// database passwords…) stays with the web client.
const ENV_KEEP = ['PATH', 'HOME', 'LANG', 'LC_ALL', 'TZ', 'TMPDIR', 'NODE_EXTRA_CA_CERTS', 'SSL_CERT_FILE'];

function createTournamentHost(deps) {
  const log = deps.log || ((s) => console.log(s));
  let child = null, port = null, version = null, status = 'off', lastError = null;
  let restarts = 0, timer = null, stableTimer = null, startedAt = null, secret = null;
  let runningKey = null, reloading = false, codeTimer = null;
  let readyWaiters = [];

  function enabled() { return (deps.getConfig() || {}).enabled === true; }
  function settings() { return { enabled: enabled() }; }
  function setSettings(patch) {
    const cur = Object.assign({}, deps.getConfig() || {});
    if (typeof patch.enabled === 'boolean') cur.enabled = patch.enabled;
    delete cur.allowAuthServers;   // option of web.292, withdrawn: LAN only
    deps.setConfig(cur);
    sync();
    return settings();
  }
  function sync() { if (enabled()) start(); else stop(); }

  // New code on disk while the service runs: restart it, and only it.
  function watchCode() {
    if (codeTimer) return;
    codeTimer = setInterval(() => {
      if (!child || !port || reloading) return;
      const k = codeKey();
      if (runningKey && k !== runningKey) {
        log('[td] new code on disk (version ' + (version || '?') + ' → ' + (diskVersion() || '?') + '): restarting the tournament service only');
        restart('code updated');
      }
    }, deps.codePollMs || CODE_POLL_MS);
    if (codeTimer.unref) codeTimer.unref();
  }
  // Stop and start again at once (not counted as a failure). Watches are
  // processes of their own: they go on meanwhile.
  function restart(why) {
    if (!enabled()) return Promise.resolve(false);
    const c = child;
    if (!c) { start(); return ready(10000); }
    reloading = true;
    status = 'restarting';
    lastError = null;
    return new Promise((resolve) => {
      c.once('exit', () => { reloading = false; restarts = 0; start(); ready(10000).then(resolve); });
      try { c.kill('SIGTERM'); } catch (e) { reloading = false; resolve(false); }
      setTimeout(() => { try { c.kill('SIGKILL'); } catch (e) {} }, 5000).unref();
      log('[td] restarting the service' + (why ? ' (' + why + ')' : ''));
    });
  }

  function settle(ok) { const w = readyWaiters; readyWaiters = []; w.forEach((f) => f(ok)); }
  function start() {
    if (child || timer) return;
    status = restarts ? 'restarting' : 'starting';
    secret = crypto.randomBytes(24).toString('hex');
    const env = {};
    ENV_KEEP.forEach((k) => { if (process.env[k] != null) env[k] = process.env[k]; });
    Object.assign(env, { TD_DIR: deps.dir, TD_SECRET: secret, TD_CLIENT_VERSION: deps.clientVersion(), TD_HOST: '127.0.0.1', TD_PORT: '0' });
    let c;
    try {
      c = childProcess.fork(ENTRY, [], { env, execArgv: [], stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
    } catch (e) {
      lastError = 'could not start: ' + e.message; status = 'failed'; log('[td] ' + lastError); settle(false);
      return;
    }
    child = c; startedAt = Date.now();
    runningKey = codeKey();
    watchCode();
    const lines = (stream) => {
      let buf = '';
      stream.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); if (l.trim()) log(l.indexOf('[td]') === 0 ? l : '[td] ' + l); } });
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
      }
    });
    c.on('error', (e) => { lastError = e.message; log('[td] process error: ' + e.message); });
    c.on('exit', (code, signal) => {
      if (child !== c) return;
      child = null; port = null; clearTimeout(stableTimer);
      settle(false);
      if (reloading) return;              // restart(): it starts the new one
      if (!enabled()) { status = 'off'; return; }
      lastError = 'stopped (code ' + code + (signal ? ', signal ' + signal : '') + ')';
      restarts++;
      const delay = Math.min(30000, 1000 * Math.pow(2, Math.min(restarts - 1, 5)));
      status = 'restarting';
      log('[td] service ' + lastError + ', restart in ' + Math.round(delay / 1000) + ' s');
      timer = setTimeout(() => { timer = null; if (enabled()) start(); }, delay);
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
  function relay(req, res, pathAndQuery, author, extra) {
    return ready(8000).then((ok) => {
      if (!ok) {
        res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '5' });
        return res.end(JSON.stringify({ ok: false, error: 'the tournament service is not running (' + status + (lastError ? ': ' + lastError : '') + ')' }));
      }
      const headers = {};
      ['content-type', 'content-length', 'accept', 'if-none-match'].forEach((k) => { if (req.headers[k]) headers[k] = req.headers[k]; });
      if (author) { headers['x-td-secret'] = secret; headers['x-td-author'] = author; }
      if (extra) Object.assign(headers, extra);
      request(req.method, pathAndQuery, headers, req.method === 'GET' || req.method === 'HEAD' ? null : req, (err, pr) => {
        if (err) {
          if (!res.headersSent) { res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ ok: false, error: 'tournament service: ' + err.message })); }
          return;
        }
        const out = {};
        ['content-type', 'content-length', 'cache-control', 'content-disposition', 'x-robots-tag', 'retry-after'].forEach((k) => { if (pr.headers[k]) out[k] = pr.headers[k]; });
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
        request('GET', '/admin/tournaments/status', { 'x-td-secret': secret, 'x-td-author': 'web-client' }, null, (err, pr) => {
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

  return { settings, setSettings, sync, start, stop, restart, ready, info, relay, serviceStatus, keyInfo, enabled, PAGE_RE };
}

// ── HTTP, under /admin/tournaments (auth and rate limit by handleAdmin) ──
function handleTournamentAdmin(host, h, req, res, reqPathOnly, query) {
  const deny = () => h.adminJson(res, 403, { ok: false, error: 'forbidden' });
  const sub = reqPathOnly.slice('/admin/tournaments'.length) || '/';
  const answerSettings = () => {
    const base = Object.assign({ ok: true }, host.settings(), { service: host.info(), key: host.keyInfo(), running: null, maxRunning: null });
    if (!base.enabled) return h.adminJson(res, 200, base);
    return host.serviceStatus().then((s) => {
      if (s && s.ok) Object.assign(base, { key: s.key || base.key, running: s.running, maxRunning: s.maxRunning, service: host.info() });
      else base.service = host.info();
      h.adminJson(res, 200, base);
    });
  };
  if (sub === '/settings') {
    if (req.method === 'POST') return h.readJsonBody(req, (b) => {
      if (!b || !h.adminAuthed(query, b.token)) return deny();
      host.setSettings(b);
      return answerSettings();
    });
    if (!h.adminAuthed(query)) return deny();
    return answerSettings();
  }
  if (sub === '/restart' && req.method === 'POST') return h.readJsonBody(req, (b) => {
    if (!b || !h.adminAuthed(query, b.token)) return deny();
    if (!host.enabled()) return h.adminJson(res, 409, { ok: false, error: 'tournaments are off' });
    return host.restart('asked by the admin').then(() => answerSettings());
  });
  // Everything else is the service's: token checked here, then relayed.
  if (!h.adminAuthed(query)) return deny();
  if (!host.enabled()) return h.adminJson(res, 409, { ok: false, error: 'tournaments are off (Admin › Community › Tournaments)' });
  const qs = Object.keys(query).filter((k) => k !== 'token' && query[k] != null)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(query[k])).join('&');
  return host.relay(req, res, reqPathOnly + (qs ? '?' + qs : ''), 'admin');
}

// ── /tournament and its files (no token: the page asks for it) ──
function handleTournamentPage(host, req, res, reqPathOnly, clientIp) {
  const nf = () => { res.writeHead(404); res.end('Not found'); };
  if (!host.enabled()) return nf();
  if (API_RE.test(reqPathOnly)) {
    if (req.method !== 'GET' && req.method !== 'POST') return nf();
    if (req.method === 'POST' && !(Number(req.headers['content-length']) <= (/\/witness$/.test(reqPathOnly) ? API_MAX_WITNESS : API_MAX_BODY))) {
      res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end('{"ok":false,"code":"tooLarge"}');
    }
    // The query (an invitation code, a file name) goes along; the player's
    // address too, for the service's per-address limits. Never a token.
    const qi = String(req.url || '').indexOf('?');
    const qs = qi >= 0 ? String(req.url).slice(qi).slice(0, 300) : '';
    return host.relay(req, res, reqPathOnly + qs, null, { 'x-td-client': String(clientIp || '').slice(0, 64) });
  }
  if (!PAGE_RE.test(reqPathOnly) || (req.method !== 'GET' && req.method !== 'HEAD')) return nf();
  return host.relay(req, res, reqPathOnly, null);
}

module.exports = { createTournamentHost, handleTournamentAdmin, handleTournamentPage, PAGE_RE, API_RE };
