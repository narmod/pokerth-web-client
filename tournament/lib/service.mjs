// ═══════════════════════════════════════════════════════════════════
// Tournament director service — HTTP side (2026-10-23).
//
// Serves the organizer page (/tournament) and its API (/admin/tournaments/*).
// Usually launched by the web client's proxy, which checks the admin token
// and relays the request with the shared secret (header X-TD-Secret) and the
// author (X-TD-Author). Run on its own, a Bearer TD_ADMIN_TOKEN works too.
// Listens on 127.0.0.1 only by default.
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createManager, MAX_RUNNING, LIVE } from './manager.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(HERE, '..', 'public');
// The page's own files, served under /tournament/.
const STATIC = {
  'organizer.mjs': 'text/javascript; charset=utf-8',
  'tournaments-ui.mjs': 'text/javascript; charset=utf-8',
  'public.mjs': 'text/javascript; charset=utf-8',
  'theme.mjs': 'text/javascript; charset=utf-8',
  'td.css': 'text/css; charset=utf-8',
  'manifest.json': 'application/manifest+json; charset=utf-8',
};
const LANG_RE = /^lang\/([a-z]{2,3}(?:-[a-z0-9]{2,4})?)\.mjs$/;
// Public endpoints: per address, a few registrations and code attempts.
const RATE = { register: [6, 10 * 60 * 1000], unregister: [12, 10 * 60 * 1000] };
const MAX_JSON = 64 * 1024;
const MAX_PDB = 10 * 1024 * 1024;

function same(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length > 0 && x.length === y.length && crypto.timingSafeEqual(x, y);
}

/**
 * o: { dir, secret?, adminToken?, servers: () => Promise<server[]>, clientVersion: () => string, version }
 */
export function createService(o) {
  const td = createManager({ dir: o.dir, servers: o.servers, clientVersion: o.clientVersion });
  const T = td.tournaments;

  // ── tables opened by the director: carry their end into the tournament ──
  const syncing = new Set();
  async function syncHost(id, watchId) {
    if (syncing.has(id)) return;
    const w = td.info(watchId);
    if (!w || LIVE.indexOf(w.state.status) >= 0) return;
    syncing.add(id);
    try {
      if (w.state.status === 'finished') {
        try {
          await T.setResult(id, { source: 'watch', watchId, absent: (w.state.host && w.state.host.absent) || [], byDirector: true }, 'director');
        } catch (e) {
          if (!(e instanceof T.Refusal)) throw e;
          T.hostResultRefused(id, e.message);
        }
        T.hostEnded(id, 'finished');
      } else {
        T.hostEnded(id, w.state.status, w.state.error ? { error: w.state.error.code } : {});
      }
    } catch (e) {
      console.error('[td] table of ' + id + ': ' + (e && e.message));
    } finally { syncing.delete(id); }
  }
  function sweep() {
    for (const h of T.openHosts()) syncHost(h.id, h.watchId);
    for (const d of T.autoOpenDue()) autoOpen(d);
  }
  // Opening by itself N minutes before the start (tournament « run » settings).
  const opening = new Set();
  async function autoOpen(d) {
    if (opening.has(d.id)) return;
    opening.add(d.id);
    try {
      if (d.missed) T.autoOpenNote(d.id, 'the start time passed more than an hour ago', true);
      else await openTable(d.id, {}, 'scheduler');
    } catch (e) {
      try { T.autoOpenNote(d.id, (e && e.message) || 'error'); } catch (e2) {}
    } finally { opening.delete(d.id); }
  }
  const sweepTimer = setInterval(sweep, o.sweepMs || 5000);
  if (sweepTimer.unref) sweepTimer.unref();
  // The live side of an open table, for the tournament page.
  function withHost(v) {
    if (v && v.host && v.host.watchId) {
      const w = td.info(v.host.watchId);
      if (w) v.hostLive = { status: w.state.status, hand: w.state.hand || 0, host: w.state.host || null, logs: (w.state.logs || []).slice(-12),
        error: w.state.error || null, nick: w.nick, gameId: w.state.gameId, gameName: w.state.gameName || '' };
    }
    return v;
  }
  async function getTournament(id) {
    const v = T.get(id);
    if (v.host && v.host.status === 'open') { await syncHost(id, v.host.watchId); return withHost(T.get(id)); }
    return withHost(v);
  }
  async function openTable(id, b, who) {
    const t = T.get(id);
    if (t.result || t.status === 'validated') throw new T.Refusal('the result is set');
    if (t.host && t.host.status === 'open') throw new T.Refusal('the table is already open');
    if (!t.server || !t.server.ref) throw new T.Refusal('choose the LAN server of the tournament first (Edit)');
    const registered = t.players.filter((p) => !p.absent).map((p) => p.nick);
    if (registered.length < 2) throw new T.Refusal('add at least two players first');
    const r = await td.startHost({ ref: t.server.ref, tournamentId: id, tableName: t.name, table: t.table, registered, nick: b.nick, announce: !t.run || t.run.announce !== false });
    if (!r.ok) throw new T.Refusal(r.error);
    try { T.hostOpened(id, r.id, { server: t.server.name }, who); } catch (e) { td.stop(r.id); throw e; }
    return withHost(T.get(id));
  }
  // A line from the organizer to the table: the server's chat filter
  // (chatcleaner) mutes for links and capitals, the director with it.
  function checkLine(text) {
    const t = String(text || '').replace(/\s+/g, ' ').trim();
    if (t.length < 2 || t.length > 200) throw new T.Refusal('a message of 2 to 200 characters');
    if (/https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|fr|de|io|eu)\b/i.test(t)) throw new T.Refusal('no links: the server\'s chat filter would mute the director');
    const letters = t.replace(/[^A-Za-z]/g, '');
    if (letters.length >= 6 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.5) throw new T.Refusal('no capitals: the server\'s chat filter would mute the director');
    return t;
  }
  function tableCommand(id, cmd, type, who, extra) {
    const watchId = T.hostCheck(id);
    const r = td.command(watchId, cmd, who, extra);
    if (!r.ok) throw new T.Refusal(r.error);
    T.hostNote(id, type, who);
    return withHost(T.get(id));
  }
  function closeTable(id, who) {
    const watchId = T.hostCheck(id);
    td.stop(watchId);
    T.hostEnded(id, 'stopped', { by: who });
    return withHost(T.get(id));
  }

  function json(res, code, obj) {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(obj));
  }
  function readBody(req, max) {
    return new Promise((resolve) => {
      const chunks = []; let len = 0, big = false;
      req.on('data', (c) => { len += c.length; if (len > max) big = true; else chunks.push(c); });
      req.on('end', () => resolve(big ? null : Buffer.concat(chunks)));
      req.on('error', () => resolve(null));
    });
  }
  async function readJson(req) {
    const b = await readBody(req, MAX_JSON);
    if (!b) return null;
    try { return b.length ? JSON.parse(b.toString('utf8')) : {}; } catch (e) { return null; }
  }
  function author(req) {
    if (o.secret && same(req.headers['x-td-secret'], o.secret)) return String(req.headers['x-td-author'] || 'admin').slice(0, 64);
    const m = /^\s*Bearer\s+(.+?)\s*$/i.exec(req.headers.authorization || '');
    if (o.adminToken && m && same(m[1], o.adminToken)) return 'admin';
    return null;
  }

  function sendPage(res, file) {
    let html;
    try { html = fs.readFileSync(path.join(PUBLIC, file || 'index.html'), 'utf8'); } catch (e) { res.writeHead(500); return res.end('page missing'); }
    html = html.split('__TD_VERSION__').join(o.version || '');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
    res.end(html);
  }

  function status() {
    return { version: o.version, key: td.keyInfo(), running: td.running().length, maxRunning: MAX_RUNNING };
  }

  async function api(req, res, sub, query) {
    const who = author(req);
    if (!who) return json(res, 403, { ok: false, error: 'forbidden' });
    const send = (p) => Promise.resolve().then(p).then((v) => json(res, 200, Object.assign({ ok: true }, Array.isArray(v) ? { tournaments: v } : v)))
      .catch((e) => json(res, e instanceof T.Refusal ? 400 : 500, { ok: false, error: (e && e.message) || 'error' }));
    const get = req.method === 'GET';

    if (sub === '/status' && get) return json(res, 200, Object.assign({ ok: true }, status()));
    if (sub === '/servers' && get) return json(res, 200, { ok: true, servers: await td.servers() });
    if (sub === '/watches' && get) return json(res, 200, { ok: true, watches: td.list() });
    if (sub === '/watch' && get) {
      const d = td.detail(String(query.id || ''));
      return d ? json(res, 200, Object.assign({ ok: true }, d)) : json(res, 404, { ok: false, error: 'unknown watch' });
    }
    if (sub === '/watch/file' && get) {
      const which = String(query.which || '');
      const buf = td.file(String(query.id || ''), which);
      if (!buf) return json(res, 404, { ok: false, error: 'not available yet' });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
        'Content-Disposition': 'attachment; filename="td-' + String(query.id) + '.' + which + '.json"' });
      return res.end(buf);
    }
    if (sub === '/t/list' && get) { sweep(); return send(() => T.list()); }
    if (sub === '/t/get' && get) return send(() => getTournament(String(query.id || '')));
    if (sub === '/t/file' && get) {
      const which = String(query.which || '');
      const buf = T.file(String(query.id || ''), which);
      if (!buf) return json(res, 404, { ok: false, error: 'not available' });
      res.writeHead(200, { 'Content-Type': which === 'pdb' ? 'application/octet-stream' : 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
        'Content-Disposition': 'attachment; filename="tournament-' + String(query.id) + (which === 'pdb' ? '.pdb' : '.' + which + '.json') + '"' });
      return res.end(buf);
    }
    if (get) return json(res, 404, { ok: false, error: 'not found' });
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method not allowed' });

    if (sub === '/t/pdb') {
      const buf = await readBody(req, MAX_PDB);
      if (!buf || !buf.length) return json(res, 413, { ok: false, error: 'empty, or larger than 10 MB' });
      return send(() => T.importPdb(String(query.id || ''), buf, who));
    }
    const b = await readJson(req);
    if (!b) return json(res, 400, { ok: false, error: 'bad request body' });
    const id = String(b.id || '');
    switch (sub) {
      case '/lobby': return send(() => td.lobby(String(b.ref || '')));
      case '/watch': { const r = await td.start(b); return json(res, r.ok ? 200 : 400, r); }
      case '/watch/stop': { const r = td.stop(String(b.id || '')); return json(res, r.ok ? 200 : 400, r); }
      case '/t/create': return send(() => T.create(b, who));
      case '/t/update': return send(() => T.update(id, b.patch || {}, who));
      case '/t/player': return send(() => (b.action === 'remove' ? T.removePlayer(id, b.nick, who) : T.addPlayer(id, b.nick, who)));
      case '/t/result': return send(() => T.setResult(id, b, who));
      case '/t/validate': return send(() => T.validate(id, who));
      case '/t/correct': return send(() => T.correct(id, b, who));
      case '/t/table/open': return send(() => openTable(id, b, who));
      case '/t/table/go': return send(() => tableCommand(id, 'go', 'tableGo', who));
      case '/t/table/reinvite': return send(() => tableCommand(id, 'reinvite', 'tableReinvite', who));
      case '/t/table/say': return send(() => tableCommand(id, 'say', 'tableMessage', who, { text: checkLine(b.text) }));
      case '/t/table/close': return send(() => closeTable(id, who));
      default: return json(res, 404, { ok: false, error: 'not found' });
    }
  }

  // ── public side: no token; the web client passes the player's address ──
  const hits = new Map();
  function limited(kind, ip) {
    const [max, win] = RATE[kind];
    const k = kind + '|' + ip, at = Date.now();
    const arr = (hits.get(k) || []).filter((x) => at - x < win);
    if (arr.length >= max) { hits.set(k, arr); return true; }
    arr.push(at); hits.set(k, arr);
    if (hits.size > 5000) for (const [kk, v] of hits) if (!v.some((x) => at - x < win)) hits.delete(kk);
    return false;
  }
  // What players see of an open table: its name and state, not the log.
  function liveOf(t) {
    if (!t.host || t.host.status !== 'open') return null;
    const w = td.info(t.host.watchId);
    if (!w) return null;
    const H = w.state.host || {};
    return { status: w.state.status, hand: w.state.hand || 0, tableName: H.tableName || w.state.gameName || null, phase: H.phase || null, admin: H.admin || null };
  }
  async function publicApi(req, res, sub, query) {
    const ip = String(req.headers['x-td-client'] || req.socket.remoteAddress || '').slice(0, 64);
    const send = (p) => Promise.resolve().then(p).then((v) => json(res, 200, Object.assign({ ok: true }, Array.isArray(v) ? { tournaments: v } : v)))
      .catch((e) => (e instanceof T.Refusal ? json(res, e.code === 'notFound' || e.code === 'private' ? 404 : 400, { ok: false, code: e.code || 'refused', error: e.message })
        : json(res, 500, { ok: false, code: 'error', error: 'error' })));
    if (sub === '/list' && req.method === 'GET') return send(() => T.publicList());
    const m = /^\/t\/([A-Za-z0-9_-]{8,40})(?:\/(register|unregister|file))?$/.exec(sub);
    if (!m) return json(res, 404, { ok: false, code: 'notFound' });
    const key = m[1], op = m[2] || '';
    if (!op && req.method === 'GET') {
      // Its table, once open: sync first so a finished game shows at once.
      return send(async () => {
        const v = T.publicGet(key, query.invite, null);
        for (const h of T.openHosts()) await syncHost(h.id, h.watchId);
        return T.publicGet(key, query.invite, liveOf);
      });
    }
    if (op === 'file' && req.method === 'GET') {
      const which = String(query.which || '');
      const buf = T.publicFile(key, query.invite, which);
      if (!buf) return json(res, 404, { ok: false, code: 'notFound' });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
        'Content-Disposition': 'attachment; filename="tournament-' + key.slice(0, 8) + '.' + which + '.json"' });
      return res.end(buf);
    }
    if (req.method !== 'POST' || (op !== 'register' && op !== 'unregister')) return json(res, 405, { ok: false, code: 'method' });
    if (limited(op, ip)) return json(res, 429, { ok: false, code: 'tooMany', error: 'too many attempts, try again later' });
    const b = await readJson(req);
    if (!b) return json(res, 400, { ok: false, code: 'badRequest' });
    return send(() => (op === 'register' ? T.register(key, b) : T.unregister(key, b)));
  }

  function handler(req, res) {
    const u = new URL(req.url, 'http://td.local');
    const p = u.pathname;
    const query = Object.fromEntries(u.searchParams);
    if (p === '/healthz') return json(res, 200, { ok: true, version: o.version });
    // /tournament: the players' page (list, a tournament, registration);
    // /tournament/organize: the organizer's tools.
    if (p === '/tournament' || p === '/tournament/' || p === '/tournament.html' || /^\/tournament\/t\/[A-Za-z0-9_-]{8,40}\/?$/.test(p)) return sendPage(res, 'public.html');
    if (p === '/tournament/organize' || p === '/tournament/organize/') return sendPage(res, 'index.html');
    if (p.indexOf('/tournament/api/') === 0) {
      return publicApi(req, res, p.slice('/tournament/api'.length), query)
        .catch(() => { if (!res.headersSent) json(res, 500, { ok: false, code: 'error' }); });
    }
    if (p.indexOf('/tournament/') === 0) {
      const name = p.slice('/tournament/'.length);
      const lm = LANG_RE.exec(name);
      if (lm) {
        const f = path.join(PUBLIC, 'lang', lm[1] + '.mjs');
        if (!fs.existsSync(f)) { res.writeHead(404); return res.end('Not found'); }
        res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-cache' });
        return fs.createReadStream(f).on('error', () => res.end()).pipe(res);
      }
      if (!Object.prototype.hasOwnProperty.call(STATIC, name)) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': STATIC[name], 'Cache-Control': 'no-cache' });
      return fs.createReadStream(path.join(PUBLIC, name)).on('error', () => res.end()).pipe(res);
    }
    if (p === '/admin/tournaments' || p.indexOf('/admin/tournaments/') === 0) {
      return api(req, res, p.slice('/admin/tournaments'.length) || '/', query)
        .catch((e) => { if (!res.headersSent) json(res, 500, { ok: false, error: (e && e.message) || 'error' }); });
    }
    res.writeHead(404); res.end('Not found');
  }

  return { handler, manager: td, status, LIVE, sweep, close: () => clearInterval(sweepTimer) };
}
