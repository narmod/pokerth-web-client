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
//     directory and the local server — never pokerth.net).
// Watches run in detached processes started by the service: they survive
// the service and the web client.
// Design: docs/TOURNAMENT_DIRECTOR.md.
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const childProcess = require('child_process');

const ENTRY = path.join(__dirname, '..', 'tournament', 'server.mjs');
const PAGE_RE = /^\/tournament(?:\.html|\/|\/[A-Za-z0-9_-]+\.(?:mjs|json))?$/;
// Only these reach the service; the rest of the environment (admin token,
// database passwords…) stays with the web client.
const ENV_KEEP = ['PATH', 'HOME', 'LANG', 'LC_ALL', 'TZ', 'TMPDIR', 'NODE_EXTRA_CA_CERTS', 'SSL_CERT_FILE'];

function createTournamentHost(deps) {
  const log = deps.log || ((s) => console.log(s));
  let child = null, port = null, version = null, status = 'off', lastError = null;
  let restarts = 0, timer = null, stableTimer = null, startedAt = null, secret = null;
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
    return { status, version, pid: child ? child.pid : null, restarts, lastError, since: port ? startedAt : null };
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
  function relay(req, res, pathAndQuery, author) {
    return ready(8000).then((ok) => {
      if (!ok) {
        res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '5' });
        return res.end(JSON.stringify({ ok: false, error: 'the tournament service is not running (' + status + (lastError ? ': ' + lastError : '') + ')' }));
      }
      const headers = {};
      ['content-type', 'content-length', 'accept', 'if-none-match'].forEach((k) => { if (req.headers[k]) headers[k] = req.headers[k]; });
      if (author) { headers['x-td-secret'] = secret; headers['x-td-author'] = author; }
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

  return { settings, setSettings, sync, start, stop, ready, info, relay, serviceStatus, keyInfo, enabled, PAGE_RE };
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
  // Everything else is the service's: token checked here, then relayed.
  if (!h.adminAuthed(query)) return deny();
  if (!host.enabled()) return h.adminJson(res, 409, { ok: false, error: 'tournaments are off (Admin › Community › Tournaments)' });
  const qs = Object.keys(query).filter((k) => k !== 'token' && query[k] != null)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(query[k])).join('&');
  return host.relay(req, res, reqPathOnly + (qs ? '?' + qs : ''), 'admin');
}

// ── /tournament and its files (no token: the page asks for it) ──
function handleTournamentPage(host, req, res, reqPathOnly) {
  if (!host.enabled() || !PAGE_RE.test(reqPathOnly) || (req.method !== 'GET' && req.method !== 'HEAD')) { res.writeHead(404); res.end('Not found'); return; }
  return host.relay(req, res, reqPathOnly, null);
}

module.exports = { createTournamentHost, handleTournamentAdmin, handleTournamentPage, PAGE_RE };
