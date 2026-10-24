// ═══════════════════════════════════════════════════════════════════
// Arena — tickets and seasons (service 0.27.0, 2026-10-24), after the BBC.
//
// An organizer defines kinds of tickets (« Step 2 », « Final »…), each with
// a most a player can hold (10 by default, as the BBC). A tournament may
//   need   one ticket of a kind to register: the player must hold one more
//          than his registrations still waiting on that kind elsewhere
//   earn   one ticket of a kind for each of its first N
//   keep   the places that keep the ticket they came with (the BBC: the
//          3rd of a Step 2 or 3)
//   end    the season: once validated, every ticket starts again from zero
// Tickets move once a tournament is validated (the sweep: each tournament
// once, `applied`): a player ranked spends the ticket it needed, unless his
// place keeps it; the first N earn theirs. An absent player is not ranked:
// he spends nothing. The organizer can also give or take a ticket by hand.
// A new season (by hand, or by a tournament that ends it) archives the
// balances and starts from zero.
//
// Stored in ARENA_DIR/tickets.json; every move in its log (the last 5000).
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const low = (s) => String(s || '').toLowerCase();
const clean = (s, max) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const int = (v, min, max) => { const x = parseInt(v, 10); return Number.isInteger(x) ? Math.min(max, Math.max(min, x)) : null; };
const MAX_LOG = 5000;

// A tournament's ticket rules, put in order (null: none).
export function cleanTicketRules(r) {
  if (!r || typeof r !== 'object') return null;
  const id = (v) => (typeof v === 'string' && /^k[a-z0-9]{4,24}$/.test(v) ? v : null);
  const out = {};
  if (id(r.need)) out.need = id(r.need);
  if (r.earn && id(r.earn.type)) { const top = int(r.earn.top, 1, 40); if (top) out.earn = { type: id(r.earn.type), top }; }
  if (out.need && Array.isArray(r.keep)) { const k = [...new Set(r.keep.map((x) => parseInt(x, 10)).filter((x) => x >= 1 && x <= 40))].sort((a, b) => a - b).slice(0, 10); if (k.length) out.keep = k; }
  if (r.endsSeason === true) out.endsSeason = true;
  return Object.keys(out).length ? out : null;
}

export function createTickets(o) {
  const file = path.join(o.dir, 'tickets.json');
  const now = o.now || (() => Date.now());
  const Refusal = o.Refusal || class extends Error {};
  const refuse = (m) => { throw new Refusal(m); };
  let db = null;
  function read() {
    if (db) return db;
    try { db = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { db = null; }
    if (!db || !Array.isArray(db.types)) db = { v: 1, types: [], balances: {}, applied: [], season: null, seasons: [], log: [] };
    if (!db.season) db.season = { id: 's' + now().toString(36), name: 'Season 1', startedAt: now() };
    return db;
  }
  function write() {
    fs.mkdirSync(o.dir, { recursive: true });
    const tmp = file + '.' + process.pid + '.tmp';
    if (db.log.length > MAX_LOG) db.log = db.log.slice(-MAX_LOG);
    fs.writeFileSync(tmp, JSON.stringify(db));
    fs.renameSync(tmp, file);
  }
  const typeOf = (id) => read().types.find((t) => t.id === id) || null;
  const log = (e) => read().log.push(Object.assign({ at: now() }, e));

  // ── kinds of tickets ──
  function types() { return read().types.slice(); }
  function addType(input, by) {
    const name = clean(input && input.name, 40);
    if (name.length < 2) refuse('name: 2 to 40 characters');
    if (read().types.some((t) => low(t.name) === low(name))) refuse('this name is taken');
    const t = { id: 'k' + crypto.randomBytes(5).toString('hex'), name, max: int(input && input.max, 1, 100) || 10, createdAt: now(), by: by || null };
    read().types.push(t);
    log({ type: 'typeAdded', id: t.id, name, by });
    write();
    return { type: t };
  }
  function updateType(id, patch, by) {
    const t = typeOf(String(id || ''));
    if (!t) refuse('unknown ticket');
    if (patch && patch.name != null) { const n = clean(patch.name, 40); if (n.length < 2) refuse('name: 2 to 40 characters'); t.name = n; }
    if (patch && patch.max != null) t.max = int(patch.max, 1, 100) || t.max;
    log({ type: 'typeChanged', id: t.id, by });
    write();
    return { type: t };
  }

  // ── balances ──
  function balance(nick) { return Object.assign({}, read().balances[low(nick)] || {}); }
  function setCount(nick, typeId, n) {
    const d = read(), k = low(nick);
    const b = d.balances[k] || (d.balances[k] = {});
    if (n > 0) b[typeId] = n; else delete b[typeId];
    if (!Object.keys(b).length) delete d.balances[k];
  }
  // The organizer gives (+1) or takes (-1) a ticket.
  function adjust(input, by) {
    const t = typeOf(String((input && input.type) || ''));
    if (!t) refuse('unknown ticket');
    const nick = clean(input && input.nick, 64);
    if (nick.length < 2) refuse('nickname missing');
    const delta = int(input && input.delta, -100, 100) || 0;
    if (!delta) refuse('nothing to change');
    const before = balance(nick)[t.id] || 0;
    const after = Math.max(0, Math.min(t.max, before + delta));
    setCount(nick, t.id, after);
    log({ type: 'adjusted', nick, ticket: t.id, delta: after - before, by: by || 'organizer', why: clean(input && input.why, 120) || null });
    write();
    return { nick, ticket: t.id, count: after };
  }
  // Everyone's tickets, for the organizer.
  function all() {
    const d = read();
    return Object.keys(d.balances).map((k) => ({ nick: k, tickets: d.balances[k] }));
  }

  // ── a validated tournament: tickets move, once ──
  function applyTournament(t, nickCase) {
    const d = read();
    const r = t.tickets;
    if (!r || d.applied.indexOf(t.id) >= 0) return null;
    const moves = [];
    for (const row of (t.result && t.result.ranking) || []) {
      const nick = row.nick;
      if (r.need && typeOf(r.need) && !(r.keep && r.keep.indexOf(row.place) >= 0)) {
        const was = balance(nick)[r.need] || 0;
        if (was > 0) { setCount(nick, r.need, was - 1); moves.push({ nick, ticket: r.need, delta: -1 }); }
      }
      if (r.earn && typeOf(r.earn.type) && row.place <= r.earn.top) {
        const ty = typeOf(r.earn.type), was = balance(nick)[ty.id] || 0;
        if (was < ty.max) { setCount(nick, ty.id, was + 1); moves.push({ nick, ticket: ty.id, delta: 1 }); }
      }
    }
    d.applied.push(t.id);
    if (d.applied.length > 20000) d.applied = d.applied.slice(-20000);
    log({ type: 'tournament', tournamentId: t.id, name: t.name, moves });
    let season = null;
    if (r.endsSeason) season = startSeason({ name: null, why: 'ended by « ' + t.name + ' »' }, 'director', true);
    write();
    return { moves, season };
  }
  // The sweep: every validated tournament with ticket rules, once.
  function sweep(tournaments) {
    const done = [];
    const d = read();
    for (const t of tournaments) {
      if (t.parentId || t.status !== 'validated' || !t.tickets || d.applied.indexOf(t.id) >= 0) continue;
      const r = applyTournament(t);
      if (r) done.push(Object.assign({ id: t.id }, r));
    }
    return done;
  }

  // ── seasons ──
  function season() { return Object.assign({}, read().season); }
  function seasons() { return read().seasons.map((s) => ({ id: s.id, name: s.name, startedAt: s.startedAt, endedAt: s.endedAt, why: s.why || null, players: Object.keys(s.balances || {}).length })); }
  function startSeason(input, by, noWrite) {
    const d = read();
    const old = d.season;
    d.seasons.push(Object.assign({}, old, { endedAt: now(), balances: d.balances, why: clean(input && input.why, 120) || null, endedBy: by || 'organizer' }));
    if (d.seasons.length > 100) d.seasons = d.seasons.slice(-100);
    const n = d.seasons.length + 1;
    d.season = { id: 's' + now().toString(36) + crypto.randomBytes(2).toString('hex'), name: clean(input && input.name, 40) || 'Season ' + n, startedAt: now() };
    d.balances = {};
    log({ type: 'season', from: old.name, to: d.season.name, by: by || 'organizer' });
    if (!noWrite) write();
    return season();
  }
  function history(nick) { const k = low(nick); return read().log.filter((e) => (e.nick && low(e.nick) === k) || (e.moves && e.moves.some((m) => low(m.nick) === k))).slice(-50); }

  return { types, addType, updateType, balance, adjust, all, applyTournament, sweep, season, seasons, startSeason, history, typeOf, clear: () => { db = null; } };
}
