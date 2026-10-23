'use strict';
// ═══════════════════════════════════════════════════════════════════
// Tournament director — manager on the proxy side (2026-10-23).
//
// First brick of /tournament: the « Table check » tool. The organizer picks
// a server already known to this install (game-server registry, LAN
// directory, local server — never a free address), lists its tables and
// sends a director to WATCH one. Nothing is created, kicked or posted on the
// game server: the director only spectates, like /live.
//
// Each watch runs in its own detached process (server/tournament/worker.mjs)
// that survives a proxy restart, and talks back through files only:
//   <dir>/watches/<id>/{state,journal,result}.json + worker.log
// The install's Ed25519 key (<dir>/td-key.pem, mode 600) signs results.
//
// Off by default (admin › Community › Tournaments). Master token only for
// now; per-server delegate keys come later. Servers announcing an
// authenticated login (pokerth.net) are refused unless « pokerth.net
// servers » is ticked — and that option waits for its maintainers' go.
// Design: docs/TOURNAMENT_DIRECTOR.md.
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const childProcess = require('child_process');
const { pathToFileURL } = require('url');

const MAX_RUNNING = 4;
const NICK_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{2,23}$/;
const ID_RE = /^[a-z0-9]{6,32}$/;
const LIVE = ['connecting', 'waiting', 'running'];

function createTournamentManager(deps) {
  const dir = deps.dir;
  const watchesDir = path.join(dir, 'watches');
  const keyFile = path.join(dir, 'td-key.pem');
  const workerPath = path.join(__dirname, 'tournament', 'worker.mjs');
  let esm = null;
  function loadEsm() {
    if (!esm) {
      esm = Promise.all([
        import(pathToFileURL(path.join(__dirname, 'tournament', 'lobby.mjs')).href),
        import(pathToFileURL(path.join(__dirname, 'tournament', 'journal.mjs')).href),
        import(pathToFileURL(path.join(__dirname, 'tournament', 'spectator.mjs')).href),
      ]).then(([lobby, journal, spectator]) => ({ lobby, journal, spectator }));
    }
    return esm;
  }

  // ── settings ─────────────────────────────────────────────────────
  function settings() {
    const s = deps.getConfig() || {};
    return { enabled: s.enabled === true, allowAuthServers: s.allowAuthServers === true };
  }
  function setSettings(patch) {
    const cur = Object.assign({}, deps.getConfig() || {});
    if (typeof patch.enabled === 'boolean') cur.enabled = patch.enabled;
    if (typeof patch.allowAuthServers === 'boolean') cur.allowAuthServers = patch.allowAuthServers;
    deps.setConfig(cur);
    if (cur.enabled) ensureKey();
    return settings();
  }

  // ── install key ──────────────────────────────────────────────────
  function ensureKey() {
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(keyFile)) {
      const { privateKey } = crypto.generateKeyPairSync('ed25519');
      fs.writeFileSync(keyFile, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
      try { fs.chmodSync(keyFile, 0o600); } catch (e) {}
    }
  }
  function keyInfo() {
    try {
      const pub = crypto.createPublicKey(crypto.createPrivateKey(fs.readFileSync(keyFile, 'utf8')));
      const der = pub.export({ type: 'spki', format: 'der' });
      const created = fs.statSync(keyFile).mtimeMs;
      return {
        publicKeyRaw: Buffer.from(der.subarray(der.length - 32)).toString('base64'),
        publicKeyPem: pub.export({ type: 'spki', format: 'pem' }),
        created,
      };
    } catch (e) { return null; }
  }

  // ── servers this install knows ───────────────────────────────────
  function servers() {
    return (deps.listServers() || []).map((s) => ({ ref: s.ref, kind: s.kind, name: s.name, host: s.host, port: s.port, tls: !!s.tls }));
  }
  function resolve(ref) {
    return (deps.listServers() || []).filter((s) => s.ref === ref)[0] || null;
  }
  function connOpts(s) {
    return { host: s.host, port: s.port, tls: !!s.tls, servername: s.sni || undefined, insecure: !!s.noverify, pins: s.pins || [] };
  }

  function lobby(ref) {
    const s = resolve(ref);
    if (!s) return Promise.resolve({ ok: false, error: 'unknown server' });
    return loadEsm().then((m) => m.lobby.listGames(Object.assign(connOpts(s), { version: deps.version() }))).then((r) => {
      r.server = { ref: s.ref, name: s.name, host: s.host, port: s.port, tls: !!s.tls };
      if (r.ok && r.serverType === 'internetAuth' && !settings().allowAuthServers) r.watchable = false, r.refusal = 'authServer';
      else r.watchable = !!r.ok;
      return r;
    });
  }

  // ── watches ──────────────────────────────────────────────────────
  function readJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } }
  function wdir(id) { return path.join(watchesDir, id); }
  function alive(pid) {
    if (!pid) return false;
    try { process.kill(pid, 0); } catch (e) { return e.code === 'EPERM'; }
    // On Linux, make sure the pid still is one of our workers (pids are reused).
    try { return fs.readFileSync('/proc/' + pid + '/cmdline', 'utf8').indexOf('worker.mjs') >= 0; } catch (e) { return true; }
  }
  function info(id) {
    if (!ID_RE.test(String(id || ''))) return null;
    const meta = readJson(path.join(wdir(id), 'meta.json'));
    if (!meta) return null;
    const state = readJson(path.join(wdir(id), 'state.json')) || { status: 'connecting', logs: [] };
    if (LIVE.indexOf(state.status) >= 0 && !alive(state.pid || meta.pid) && Date.now() - meta.startedAt > 5000) {
      state.status = 'crashed';
    }
    return Object.assign({}, meta, { state });
  }
  function list() {
    let ids = [];
    try { ids = fs.readdirSync(watchesDir).filter((x) => ID_RE.test(x)); } catch (e) {}
    return ids.map(info).filter(Boolean).sort((a, b) => b.startedAt - a.startedAt).map((w) => ({
      id: w.id, server: w.server, gameName: w.state.gameName || w.gameName || '', gameId: w.state.gameId != null ? w.state.gameId : w.gameId,
      nick: w.nick, startedAt: w.startedAt, status: w.state.status, hand: w.state.hand || 0,
      resultStatus: w.state.resultStatus || null, updatedAt: w.state.updatedAt || w.startedAt,
    }));
  }
  function running() { return list().filter((w) => LIVE.indexOf(w.status) >= 0); }

  function start(body) {
    if (!settings().enabled) return { ok: false, error: 'tournaments are off' };
    const s = resolve(body && body.ref);
    if (!s) return { ok: false, error: 'unknown server' };
    const gameId = parseInt(body.gameId, 10);
    if (!(gameId > 0)) return { ok: false, error: 'pick a table' };
    if (running().length >= MAX_RUNNING) return { ok: false, error: 'at most ' + MAX_RUNNING + ' watches at once' };
    let nick = String(body.nick || '').trim();
    if (!nick) nick = 'TD-test-' + crypto.randomBytes(3).toString('hex');
    if (!NICK_RE.test(nick)) return { ok: false, error: 'director name: 3 to 24 letters, digits, - or _' };
    ensureKey();
    const id = Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
    const d = wdir(id);
    fs.mkdirSync(d, { recursive: true });
    const meta = {
      id, startedAt: Date.now(), nick, gameId, gameName: String(body.gameName || '').slice(0, 64),
      server: { ref: s.ref, kind: s.kind, name: s.name, host: s.host, port: s.port, tls: !!s.tls },
    };
    const logFd = fs.openSync(path.join(d, 'worker.log'), 'a');
    let child;
    try {
      child = childProcess.spawn(process.execPath, [workerPath], { detached: true, stdio: ['ignore', logFd, logFd, 'ipc'] });
    } finally { try { fs.closeSync(logFd); } catch (e) {} }
    meta.pid = child.pid;
    fs.writeFileSync(path.join(d, 'meta.json'), JSON.stringify(meta));
    child.send({
      id, dir: d, keyFile, version: deps.version(),
      opts: Object.assign(connOpts(s), {
        nick, login: 'unauth', gameId, refuseAuthServer: !settings().allowAuthServers, gamePassword: body.gamePassword ? String(body.gamePassword).slice(0, 64) : undefined,
      }),
    });
    child.on('error', () => {});
    child.unref();
    try { child.disconnect && child.connected && setTimeout(() => { try { child.disconnect(); } catch (e) {} }, 200); } catch (e) {}
    return { ok: true, id };
  }

  function stop(id) {
    const w = info(id);
    if (!w) return { ok: false, error: 'unknown watch' };
    if (LIVE.indexOf(w.state.status) < 0) return { ok: true, already: true };
    const pid = w.state.pid || w.pid;
    if (!alive(pid)) return { ok: true, already: true };
    try { process.kill(pid, 'SIGTERM'); } catch (e) { return { ok: false, error: 'could not stop: ' + e.code }; }
    return { ok: true };
  }

  // Full view of one watch, with the checks anyone can redo from the files.
  function detail(id) {
    const w = info(id);
    if (!w) return Promise.resolve(null);
    const sealed = readJson(path.join(wdir(id), 'result.json'));
    const journal = readJson(path.join(wdir(id), 'journal.json'));
    const out = Object.assign({}, w, { result: sealed ? sealed.payload.result : null, head: sealed ? sealed.payload.head : null,
      entries: journal && journal.entries ? journal.entries.length : 0 });
    if (!journal || !journal.entries) return Promise.resolve(out);
    return loadEsm().then((m) => {
      const chain = m.journal.verifyJournal(journal.entries);
      out.checks = { chain: chain.ok, badSeq: chain.badSeq };
      if (sealed) {
        out.checks.headMatches = chain.ok && sealed.payload.head === chain.head && sealed.payload.entries === journal.entries.length;
        out.checks.signature = !!(sealed.signature && sealed.publicKeyPem && m.journal.verifyPayload(sealed.payload, sealed.signature, sealed.publicKeyPem));
        out.checks.replay = m.journal.canonical(m.spectator.replayJournal(journal.entries)) === m.journal.canonical(sealed.payload.result);
        out.checks.signedBy = sealed.publicKeyPem ? m.journal.publicKeyRawB64(sealed.publicKeyPem) : null;
      }
      return out;
    });
  }

  function file(id, which) {
    if (!ID_RE.test(String(id || '')) || (which !== 'journal' && which !== 'result')) return null;
    try { return fs.readFileSync(path.join(wdir(id), which + '.json')); } catch (e) { return null; }
  }

  return { settings, setSettings, keyInfo, servers, lobby, start, stop, list, detail, file, MAX_RUNNING };
}

// ── HTTP routes, under /admin/tournaments (auth and rate limit by handleAdmin) ──
function handleTournamentAdmin(td, h, req, res, reqPathOnly, query) {
  const deny = () => h.adminJson(res, 403, { ok: false, error: 'forbidden' });
  const authed = (body) => h.adminAuthed(query, body && body.token);
  const off = () => h.adminJson(res, 409, { ok: false, error: 'tournaments are off (Admin › Community › Tournaments)' });
  const sub = reqPathOnly.slice('/admin/tournaments'.length) || '/';

  if (sub === '/settings') {
    if (req.method === 'POST') return h.readJsonBody(req, (b) => {
      if (!b || !authed(b)) return deny();
      return h.adminJson(res, 200, Object.assign({ ok: true }, td.setSettings(b), { key: td.keyInfo(), running: td.list().filter((w) => LIVE.indexOf(w.status) >= 0).length }));
    });
    if (!authed()) return deny();
    return h.adminJson(res, 200, Object.assign({ ok: true }, td.settings(), { key: td.keyInfo(), running: td.list().filter((w) => LIVE.indexOf(w.status) >= 0).length, maxRunning: td.MAX_RUNNING }));
  }
  if (sub === '/servers') {
    if (!authed()) return deny();
    if (!td.settings().enabled) return off();
    return h.adminJson(res, 200, { ok: true, servers: td.servers(), allowAuthServers: td.settings().allowAuthServers });
  }
  if (sub === '/lobby' && req.method === 'POST') return h.readJsonBody(req, (b) => {
    if (!b || !authed(b)) return deny();
    if (!td.settings().enabled) return off();
    td.lobby(String(b.ref || '')).then((r) => h.adminJson(res, 200, r)).catch((e) => h.adminJson(res, 500, { ok: false, error: e.message }));
  });
  if (sub === '/watch' && req.method === 'POST') return h.readJsonBody(req, (b) => {
    if (!b || !authed(b)) return deny();
    if (!td.settings().enabled) return off();
    const r = td.start(b);
    return h.adminJson(res, r.ok ? 200 : 400, r);
  });
  if (sub === '/watch/stop' && req.method === 'POST') return h.readJsonBody(req, (b) => {
    if (!b || !authed(b)) return deny();
    const r = td.stop(String(b.id || ''));
    return h.adminJson(res, r.ok ? 200 : 400, r);
  });
  if (sub === '/watches') {
    if (!authed()) return deny();
    return h.adminJson(res, 200, { ok: true, watches: td.list() });
  }
  if (sub === '/watch') {
    if (!authed()) return deny();
    return td.detail(String(query.id || '')).then((d) => d ? h.adminJson(res, 200, Object.assign({ ok: true }, d)) : h.adminJson(res, 404, { ok: false, error: 'unknown watch' }));
  }
  if (sub === '/watch/file') {
    if (!authed()) return deny();
    const which = String(query.which || '');
    const buf = td.file(String(query.id || ''), which);
    if (!buf) return h.adminJson(res, 404, { ok: false, error: 'not available yet' });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
      'Content-Disposition': 'attachment; filename="td-' + String(query.id) + '.' + which + '.json"' });
    return res.end(buf);
  }
  return h.adminJson(res, 404, { ok: false, error: 'not found' });
}

module.exports = { createTournamentManager, handleTournamentAdmin, LIVE };
