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
  'manifest.json': 'application/manifest+json; charset=utf-8',
};
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
  function sweep() { for (const h of T.openHosts()) syncHost(h.id, h.watchId); }
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
    const r = await td.startHost({ ref: t.server.ref, tournamentId: id, tableName: t.name, table: t.table, registered, nick: b.nick });
    if (!r.ok) throw new T.Refusal(r.error);
    try { T.hostOpened(id, r.id, { server: t.server.name }, who); } catch (e) { td.stop(r.id); throw e; }
    return withHost(T.get(id));
  }
  function tableCommand(id, cmd, type, who) {
    const watchId = T.hostCheck(id);
    const r = td.command(watchId, cmd, who);
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

  function sendPage(res) {
    let html;
    try { html = fs.readFileSync(path.join(PUBLIC, 'index.html'), 'utf8'); } catch (e) { res.writeHead(500); return res.end('page missing'); }
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
      case '/t/table/close': return send(() => closeTable(id, who));
      default: return json(res, 404, { ok: false, error: 'not found' });
    }
  }

  function handler(req, res) {
    const u = new URL(req.url, 'http://td.local');
    const p = u.pathname;
    const query = Object.fromEntries(u.searchParams);
    if (p === '/healthz') return json(res, 200, { ok: true, version: o.version });
    if (p === '/tournament' || p === '/tournament/' || p === '/tournament.html') return sendPage(res);
    if (p.indexOf('/tournament/') === 0) {
      const name = p.slice('/tournament/'.length);
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
