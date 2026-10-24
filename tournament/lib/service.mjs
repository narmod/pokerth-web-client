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
import { tablePresets } from './table.mjs';
import { cleanAbsence } from './tournaments.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(HERE, '..', 'public');
// The page's own files, served under /tournament/.
const STATIC = {
  'organizer.mjs': 'text/javascript; charset=utf-8',
  'tournaments-ui.mjs': 'text/javascript; charset=utf-8',
  'cups-ui.mjs': 'text/javascript; charset=utf-8',
  'table-form.mjs': 'text/javascript; charset=utf-8',
  'image-pick.mjs': 'text/javascript; charset=utf-8',
  'public.mjs': 'text/javascript; charset=utf-8',
  'theme.mjs': 'text/javascript; charset=utf-8',
  'td.css': 'text/css; charset=utf-8',
  'manifest.json': 'application/manifest+json; charset=utf-8',
};
const LANG_RE = /^lang\/([a-z]{2,3}(?:-[a-z0-9]{2,4})?)\.mjs$/;
// Public endpoints: per address, a few registrations and code attempts.
const RATE = { register: [6, 10 * 60 * 1000], unregister: [12, 10 * 60 * 1000], checkin: [12, 10 * 60 * 1000], witness: [60, 10 * 60 * 1000], witnesslog: [6, 10 * 60 * 1000] };
const MAX_JSON = 64 * 1024;
const MAX_LOG_JSON = 14 * 1024 * 1024;   // a .pdb of 10 MB, in base64
// An image added to the library: two JPEGs in base64 (400 KB + 48 KB at most).
const MAX_IMAGE_JSON = 640 * 1024;
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
  const C = td.cups;

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
    for (const id of T.multiParents()) stagesSweep(id);
    // Cups: the first Q of a validated tournament go on to the next one.
    try { C.tick(); } catch (e) { if (!(e instanceof T.Refusal)) console.error('[td] cups: ' + (e && e.message)); }
  }
  // Several tables: once every table is validated, the final table (opened by
  // itself when the tournament opens by itself); once the final is validated,
  // the tournament's ranking.
  const progressing = new Set();
  async function stagesSweep(id) {
    if (progressing.has(id)) return;
    progressing.add(id);
    try {
      const k = T.stagesTick(id);
      const t = T.get(id);
      if (k.finalReady && t.run && t.run.autoOpen) {
        const fin = T.makeFinal(id, 'scheduler');
        try { await openTable(fin.id, {}, 'scheduler'); } catch (e) { T.autoOpenNote(fin.id, (e && e.message) || 'error'); }
      }
    } catch (e) {
      if (!(e instanceof T.Refusal)) console.error('[td] tables of ' + id + ': ' + (e && e.message));
    } finally { progressing.delete(id); }
  }
  // Open every table of a « multi » tournament that is not open yet.
  async function openStages(id, b, who) {
    const t = T.get(id);
    if (!t.stagesInfo) throw new T.Refusal('draw the tables first');
    const errors = [];
    for (const c of t.stagesInfo.tables) {
      if (c.host === 'open' || c.status === 'finished' || c.status === 'validated') continue;
      try { await openTable(c.id, b || {}, who); } catch (e) { errors.push('table ' + c.index + ': ' + ((e && e.message) || 'error')); }
    }
    const v = withHost(T.get(id));
    if (errors.length) v.openErrors = errors;
    return v;
  }
  // Opening by itself N minutes before the start (tournament « run » settings).
  const opening = new Set();
  async function autoOpen(d) {
    if (opening.has(d.id)) return;
    opening.add(d.id);
    try {
      if (d.missed) T.autoOpenNote(d.id, 'the start time passed more than an hour ago', true);
      else if (T.get(d.id).format === 'multi') { T.drawTables(d.id, 'scheduler'); await openStages(d.id, {}, 'scheduler'); }
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
    if (t.format === 'multi') throw new T.Refusal('several tables: draw the tables, then open them');
    if (t.result || t.status === 'validated') throw new T.Refusal('the result is set');
    if (t.host && t.host.status === 'open') throw new T.Refusal('the table is already open');
    if (!t.server || !t.server.ref) throw new T.Refusal('choose the LAN server of the tournament first (Edit)');
    // Check-in (identity « code »): only the players who checked in are invited.
    const checkIn = T.needsCheckIn(id);
    const registered = t.players.filter((p) => !p.absent && (!checkIn || p.checkedIn)).map((p) => p.nick);
    if (registered.length < 2) throw new T.Refusal(checkIn ? 'fewer than two players have checked in' : 'add at least two players first');
    const r = await td.startHost({ ref: t.server.ref, tournamentId: id, tableName: t.name, table: t.table, registered, nick: b.nick, announce: !t.run || t.run.announce !== false, chatLang: (t.run && t.run.chatLang) || 'en',
      startsAt: t.startsAt || null, absence: cleanAbsence(t.run && t.run.absence) });
    if (!r.ok) throw new T.Refusal(r.error);
    try { T.hostOpened(id, r.id, { server: t.server.name }, who); } catch (e) { td.stop(r.id); throw e; }
    if (checkIn) T.markNotCheckedIn(id);
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
  // Medals: public, read-only, for any client or site (any origin).
  function openJson(res, obj) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(Object.assign({ ok: true }, obj)));
  }
  function readBody(req, max) {
    return new Promise((resolve) => {
      const chunks = []; let len = 0, big = false;
      req.on('data', (c) => { len += c.length; if (len > max) big = true; else chunks.push(c); });
      req.on('end', () => resolve(big ? null : Buffer.concat(chunks)));
      req.on('error', () => resolve(null));
    });
  }
  async function readJsonMax(req, max) {
    const b = await readBody(req, max);
    if (!b) return null;
    try { return b.length ? JSON.parse(b.toString('utf8')) : {}; } catch (e) { return null; }
  }
  async function readJson(req) {
    const b = await readBody(req, MAX_JSON);
    if (!b) return null;
    try { return b.length ? JSON.parse(b.toString('utf8')) : {}; } catch (e) { return null; }
  }
  function author(req) {
    if (o.secret && same(req.headers['x-td-secret'], o.secret)) {
      // The web client sends who acts, URI-encoded (an organizer's key name).
      let w = String(req.headers['x-td-author'] || 'admin');
      try { w = decodeURIComponent(w); } catch (e) {}
      w = w.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 64);
      return w || 'admin';
    }
    const m = /^\s*Bearer\s+(.+?)\s*$/i.exec(req.headers.authorization || '');
    if (o.adminToken && m && same(m[1], o.adminToken)) return 'admin';
    return null;
  }

  function sendPage(res, file, meta) {
    let html;
    try { html = fs.readFileSync(path.join(PUBLIC, file || 'index.html'), 'utf8'); } catch (e) { res.writeHead(500); return res.end('page missing'); }
    html = html.split('__TD_VERSION__').join(o.version || '');
    if (meta) html = html.replace('</head>', meta + '\n</head>');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noimageindex' });
    res.end(html);
  }

  // The picture of a shared link (og:image) for a tournament's or a cup's
  // page: built from the address the web client was reached at (x-td-origin,
  // set by the relay). Private ones say nothing.
  const escAttr = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  function shareMeta(req, p) {
    const m = /^\/tournament\/([tc])\/([A-Za-z0-9_-]{8,40})\/?$/.exec(p);
    if (!m) return '';
    let d = null;
    try { d = m[1] === 't' ? T.publicGet(m[2]) : C.publicGet(m[2]); } catch (e) { return ''; }
    if (!d || !d.name) return '';
    const origin = String(req.headers['x-td-origin'] || '');
    const abs = /^https?:\/\/[A-Za-z0-9.:[\]-]{1,255}$/.test(origin) ? origin : '';
    let h = '<meta property="og:type" content="website">\n<meta property="og:site_name" content="PokerTH">\n<meta property="og:title" content="' + escAttr(d.name) + '">';
    if (abs && d.image) h += '\n<meta property="og:image" content="' + escAttr(abs + d.image) + '">\n<meta property="og:url" content="' + escAttr(abs + p) + '">\n<meta name="twitter:card" content="summary_large_image">';
    return h;
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

    if (sub === '/status' && get) return json(res, 200, Object.assign({ ok: true, you: who }, status()));
    if (sub === '/servers' && get) return json(res, 200, { ok: true, servers: await td.servers() });
    // The web client's create-game lists and limits (public/modules/create-presets.mjs), for the table settings.
    if (sub === '/table-presets' && get) return json(res, 200, Object.assign({ ok: true }, tablePresets()));
    // Images of tournaments and cups: the library; any organizer may add one.
    if (sub === '/images' && get) return json(res, 200, { ok: true, images: td.images.list() });
    if (sub === '/images/add' && !get) {
      const b = await readJsonMax(req, MAX_IMAGE_JSON);
      const r = td.images.add(b || {}, who);
      if (r.ok) console.log('[td] image « ' + r.image.name + ' » added by ' + who);
      return json(res, r.ok ? 200 : 400, r);
    }
    // The director's avatar: any organizer may change it (tables opened afterwards).
    // One of the shipped robots ({preset}) or the default ({reset}); no image of one's own.
    // ?images=1 adds the robots themselves (data: URLs), for the organizer's picker.
    if (sub === '/avatar' && get) {
      const a = td.avatar();
      const out = { ok: true, custom: !!(a && a.custom), preset: a ? a.preset : null, presets: td.avatarPresets(), defaultPreset: td.avatarDefaultPreset, size: a ? a.size : 0, md5: a ? a.md5 : null };
      if (query.images) out.images = Object.fromEntries(td.avatarPresets().map((n) => { const p = td.avatarPreset(n); return [n, p ? 'data:' + ['', 'image/png', 'image/jpeg', 'image/gif'][p.type] + ';base64,' + p.bytes.toString('base64') : null]; }));
      return json(res, 200, out);
    }
    if (sub === '/avatar' && !get) {
      const b = (await readJson(req)) || {};
      const r = b.reset ? td.resetAvatar() : b.preset != null ? td.setAvatarPreset(b.preset) : { ok: false, error: 'pick one of the robots' };
      if (r.ok) console.log('[td] director avatar ' + (b.reset ? 'reset' : 'set to robot ' + Number(b.preset)) + ' by ' + who);
      return json(res, r.ok ? 200 : 400, r);
    }
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
    if (sub === '/cups/list' && get) return send(() => ({ cups: C.list() }));
    if (sub === '/cups/get' && get) return send(() => C.get(String(query.id || '')));
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
      case '/t/code': return send(() => T.issueCode(id, b.nick, who));
      case '/t/checkin': return send(() => T.organizerCheckIn(id, b.nick, who));
      case '/t/result': return send(() => T.setResult(id, b, who));
      case '/t/validate': return send(() => T.validate(id, who, { override: b.override }));
      case '/t/correct': return send(() => T.correct(id, b, who));
      case '/t/collusion': return send(() => T.checkCollusion(id, who));
      case '/cups/create': return send(() => C.create(b, who));
      case '/cups/update': return send(() => C.update(id, b.patch || {}, who));
      case '/cups/event': return send(() => C.addEvent(id, b, who));
      case '/cups/event/remove': return send(() => C.removeEvent(id, b.index, who));
      case '/cups/qualify': return send(() => C.qualifyFromStandings(id, b.index, who));
      case '/cups/close': return send(() => C.close(id, who));
      case '/t/draw': return send(() => T.drawTables(id, who));
      case '/t/stages/open': return send(() => openStages(id, b, who));
      case '/t/final': return send(async () => { const fin = T.makeFinal(id, who); if (b.open !== false) { try { await openTable(fin.id, {}, who); } catch (e) { const v = T.get(id); v.openErrors = ['final table: ' + e.message]; return v; } } return withHost(T.get(id)); });
      case '/t/correct/approve': return send(() => T.approveCorrection(id, who));
      case '/t/correct/reject': return send(() => T.rejectCorrection(id, who, b.reason));
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
  // The director's table as the server named it: game id and table name.
  function hostTable(watchId) {
    const w = td.info(watchId);
    const H = w && w.state && w.state.host;
    return H && H.gameId != null ? { gameId: H.gameId, tableName: H.tableName || '' } : null;
  }
  function tableLookup(q) {
    const game = Number(q.game), name = String(q.name || '');
    if (!Number.isInteger(game) || game < 1 || !name) throw Object.assign(new T.Refusal('game and name'), { code: 'notFound' });
    for (const h of T.openHosts()) {
      const x = hostTable(h.watchId);
      if (x && x.gameId === game && x.tableName === name) {
        const v = T.get(h.id);
        const parent = v.parent ? T.get(v.parent.id) : null;
        return { key: v.publicKey, name: v.name, witnesses: v.settings.witnesses, identity: v.settings.identity, parentKey: parent ? parent.publicKey : null };
      }
    }
    throw Object.assign(new T.Refusal('not a tournament table'), { code: 'notFound' });
  }
  // A report from a player at the director's table: accepted for a private
  // tournament too (the player has no invitation code in the client).
  function atTable(key, b) {
    const h = T.keyHost(key);
    const x = h && hostTable(h.watchId);
    return !!(x && b && Number(b.game) === x.gameId && String(b.name || '') === x.tableName);
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
    if (sub === '/cups' && req.method === 'GET') return send(() => ({ cups: C.publicList() }));
    // Medals (badges.mjs): one player, several (?nicks=a,b), or everyone.
    const pm = /^\/players\/([^/]{1,200})$/.exec(sub);
    if (pm && req.method === 'GET') { let nick = pm[1]; try { nick = decodeURIComponent(nick); } catch (e) {} return openJson(res, td.badges.player(nick.slice(0, 64))); }
    if (sub === '/badges' && req.method === 'GET') {
      if (query.nicks) return openJson(res, td.badges.many(String(query.nicks).split(',').map((x) => x.trim()).filter(Boolean)));
      return openJson(res, td.badges.everyone());
    }
    const cm = /^\/c\/([A-Za-z0-9_-]{8,40})$/.exec(sub);
    if (cm && req.method === 'GET') return send(() => C.publicGet(cm[1], query.invite));
    // A web client at a table: is it a tournament's? (game id and table name,
    // as the server told the client.) Only tables the director opened.
    if (sub === '/table' && req.method === 'GET') return send(() => tableLookup(query));
    const m = /^\/t\/([A-Za-z0-9_-]{8,40})(?:\/(register|unregister|checkin|witness|witnesslog|file))?$/.exec(sub);
    if (!m) return json(res, 404, { ok: false, code: 'notFound' });
    const key = m[1], op = m[2] || '';
    if (!op && req.method === 'GET') {
      // Its table, once open: sync first so a finished game shows at once.
      return send(async () => {
        const v = T.publicGet(key, query.invite, null);
        for (const h of T.openHosts()) await syncHost(h.id, h.watchId);
        const out = T.publicGet(key, query.invite, liveOf);
        const own = T.idOfKey ? T.idOfKey(key) : null;
        if (own) out.cups = C.cupsOf(own);
        return out;
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
    if (req.method !== 'POST' || ['register', 'unregister', 'checkin', 'witness', 'witnesslog'].indexOf(op) < 0) return json(res, 405, { ok: false, code: 'method' });
    if (limited(op, ip)) return json(res, 429, { ok: false, code: 'tooMany', error: 'too many attempts, try again later' });
    const b = op === 'witnesslog' ? await readJsonMax(req, MAX_LOG_JSON) : await readJson(req);
    if (!b) return json(res, 400, { ok: false, code: 'badRequest' });
    if (op === 'witnesslog') return send(() => { const h = T.keyHost(key); const x = h && hostTable(h.watchId); return T.witnessLog(key, b, { gameId: x ? x.gameId : null }); });
    if (op === 'witness') return send(() => T.witnessReport(key, b, { atTable: atTable(key, b) }));
    return send(() => (op === 'register' ? T.register(key, b) : op === 'checkin' ? T.checkIn(key, b) : T.unregister(key, b)));
  }

  function handler(req, res) {
    const u = new URL(req.url, 'http://td.local');
    const p = u.pathname;
    const query = Object.fromEntries(u.searchParams);
    if (p === '/healthz') return json(res, 200, { ok: true, version: o.version });
    // Never indexed by search engines: pages, images, API (the link previews
    // of shared links still work, they do not index).
    if (p.indexOf('/tournament') === 0) res.setHeader('X-Robots-Tag', 'noindex, nofollow, noimageindex');
    // /tournament: the players' page (list, a tournament, registration);
    // /tournament/organize: the organizer's tools.
    if (p === '/tournament' || p === '/tournament/' || p === '/tournament.html' || /^\/tournament\/[tc]\/[A-Za-z0-9_-]{8,40}\/?$/.test(p) || /^\/tournament\/p\/[^/]{1,200}$/.test(p)) return sendPage(res, 'public.html', shareMeta(req, p));
    // The images of tournaments and cups (the picture, or its thumbnail).
    const im = /^\/tournament\/img\/([a-z0-9_-]{1,40})(\.t)?\.jpg$/.exec(p);
    if (im) {
      const b = td.images.file(im[1], !!im[2]);
      if (!b) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400', 'Access-Control-Allow-Origin': '*' });
      return res.end(b);
    }
    if (p === '/tournament/organize' || p === '/tournament/organize/') return sendPage(res, 'index.html');
    if (p.indexOf('/tournament/api/') === 0) {
      return publicApi(req, res, p.slice('/tournament/api'.length), query)
        .catch(() => { if (!res.headersSent) json(res, 500, { ok: false, code: 'error' }); });
    }
    // The director's avatar (the one it shows on the server), for the pages.
    if (p === '/tournament/avatar') {
      const a = td.avatar();
      if (!a) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': ['', 'image/png', 'image/jpeg', 'image/gif'][a.type], 'Cache-Control': 'no-cache', ETag: '"' + a.md5 + '"' });
      return res.end(a.bytes);
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
