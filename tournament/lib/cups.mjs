// ═══════════════════════════════════════════════════════════════════
// Tournament director — cups (service 0.13.0, 2026-10-24).
//
// A cup gathers tournaments of this install. Two ways, which mix:
//   points  every counted tournament gives points; the standings add up each
//           player's best N results (« best of N », 0 = all of them)
//   stages  the first Q of a tournament go on to the next one (BBC-like steps,
//           several tournaments may feed the same next one), up to a final;
//           a final may also take the top K of the points standings.
//
// Points = players finished behind you + 1 (the last of 8 gets 1, the
// winner 8): it grows with the size of the field by itself, needs no table,
// and anyone can check it. A place shared by k players gives each the
// average of the k positions. Only validated (signed) results count; a
// tournament corrected later changes the standings by itself.
//
// Ranking of the cup: the final's places (when there is a validated final),
// then the furthest stage reached, then the points (best N), then the best
// single results one by one; still equal: the same place.
// Design: docs/TOURNAMENT_DIRECTOR.md (Cups).
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, renameSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { Journal, verifyJournal, signPayload, verifyPayload, publicKeyFromPrivate, publicKeyRawB64 } from './journal.mjs';
import { IMG_RE, DEFAULT_IMAGE, imageUrl } from './images.mjs';


const ID_RE = /^[a-z0-9]{6,32}$/;
const MAX_EVENTS = 60;

const low = (s) => String(s == null ? '' : s).toLowerCase();
const clean = (s, max) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

/**
 * Points of one tournament's ranking: players behind + 1, shared places
 * averaged. ranking: [{ nick, place }] → Map(lower nick → { nick, points, place, of }).
 */
export function pointsFor(ranking) {
  const rows = (ranking || []).filter((r) => r && r.nick).slice().sort((a, b) => a.place - b.place);
  const n = rows.length;
  const out = new Map();
  let pos = 1;
  for (let i = 0; i < rows.length;) {
    let j = i;
    while (j < rows.length && rows[j].place === rows[i].place) j++;
    const k = j - i;
    const pts = n - pos + 1 - (k - 1) / 2;
    for (let x = i; x < j; x++) out.set(low(rows[x].nick), { nick: rows[x].nick, points: pts, place: rows[x].place, of: n });
    pos += k; i = j;
  }
  return out;
}

export function createCups(o) {
  // The tournaments' Refusal: the service answers 400 for it.
  const Refusal = o.Refusal || class extends Error {};
  const refuse = (m) => { throw new Refusal(m); };
  const root = join(o.dir, 'cups');
  const now = o.now || (() => Date.now());
  const T = o.tournaments;
  // The cup's image (images.mjs): one of the library, or null for the default.
  const imageOf = (v) => {
    if (v == null || v === '') return null;
    if (!IMG_RE.test(String(v)) || (o.imageOk && !o.imageOk(String(v)))) refuse('unknown image');
    return String(v);
  };
  const cdir = (id) => join(root, id);
  function writeAtomic(p, obj) { const tmp = p + '.' + process.pid + '.tmp'; writeFileSync(tmp, JSON.stringify(obj)); renameSync(tmp, p); }
  function readJson(p) { try { return JSON.parse(readFileSync(p, 'utf8')); } catch (e) { return null; } }
  function privateKey() { try { return readFileSync(o.keyFile, 'utf8'); } catch (e) { return null; } }

  function load(id) {
    if (!ID_RE.test(String(id || ''))) refuse('unknown cup');
    const c = readJson(join(cdir(id), 'cup.json'));
    if (!c) refuse('unknown cup');
    const j = readJson(join(cdir(id), 'journal.json')) || { entries: [] };
    return { c, journal: new Journal({ entries: j.entries, now }) };
  }
  let gen = 0;   // bumped on every save (see tournaments.mjs)
  function save(c, journal) {
    gen++;
    c.updatedAt = now();
    writeAtomic(join(cdir(c.id), 'journal.json'), journal.toJSON());
    writeAtomic(join(cdir(c.id), 'cup.json'), c);
    return view(c, journal);
  }
  function act(id, author, type, data, fn) {
    const { c, journal } = load(id);
    fn(c, journal);
    journal.append(type, Object.assign({ author: author || 'admin' }, data || {}));
    return save(c, journal);
  }
  function all() {
    let ids = [];
    try { ids = readdirSync(root).filter((x) => ID_RE.test(x)); } catch (e) {}
    return ids.map((id) => readJson(join(cdir(id), 'cup.json'))).filter(Boolean);
  }
  function tget(id) { try { return T.get(id); } catch (e) { return null; } }

  // Stage of each event: 1 + the deepest event that feeds it.
  function depths(c) {
    const d = c.events.map(() => 1);
    for (let pass = 0; pass < c.events.length; pass++) {
      c.events.forEach((e, i) => { if (e.next != null && c.events[e.next]) d[e.next] = Math.max(d[e.next], d[i] + 1); });
    }
    return d;
  }

  // ── standings ──
  function standings(c) {
    const depth = depths(c);
    const players = new Map();   // low nick → row
    const row = (nick) => { const k = low(nick); if (!players.has(k)) players.set(k, { nick, results: [], stage: 0, final: null }); return players.get(k); };
    const events = c.events.map((e, i) => {
      const t = tget(e.tournamentId);
      const ok = !!(t && t.status === 'validated' && t.result);
      const info = { index: i, label: e.label || (t ? t.name : '?'), tournamentId: e.tournamentId, key: t ? t.publicKey : null, status: t ? t.status : 'missing',
        counts: e.counts !== false, qualify: e.qualify || 0, next: e.next != null ? e.next : null, final: !!e.final, fromStandings: e.fromStandings || 0, stage: depth[i],
        players: t ? t.players.filter((p) => !p.absent).length : 0, validated: ok, head: t && t.sealedHead ? t.sealedHead : null, advanced: e.advanced || null };
      if (ok) {
        const pts = pointsFor(t.result.ranking);
        for (const [, p] of pts) {
          const r = row(p.nick);
          r.stage = Math.max(r.stage, depth[i]);
          if (info.counts) r.results.push({ event: i, points: p.points, place: p.place, of: p.of });
          if (e.final) r.final = p.place;
        }
      } else if (t) {
        // Seated in a later stage already: the stage is reached.
        for (const p of t.players) if (!p.absent) { const r = row(p.nick); r.stage = Math.max(r.stage, depth[i]); }
      }
      return info;
    });
    const N = c.bestOf || 0;
    const rows = [...players.values()].map((r) => {
      const sorted = r.results.slice().sort((a, b) => b.points - a.points);
      const kept = N > 0 ? sorted.slice(0, N) : sorted;
      const keptSet = new Set(kept);
      const total = kept.reduce((s, x) => s + x.points, 0);
      return { nick: r.nick, total: Math.round(total * 10) / 10, played: r.results.length, stage: r.stage, final: r.final,
        results: r.results.map((x) => ({ event: x.event, points: x.points, place: x.place, of: x.of, counted: keptSet.has(x) })), best: kept.map((x) => x.points) };
    });
    const hasFinal = events.some((e) => e.final && e.validated);
    const cmp = (a, b) => {
      if (hasFinal) {
        if ((a.final != null) !== (b.final != null)) return a.final != null ? -1 : 1;
        if (a.final != null && a.final !== b.final) return a.final - b.final;
      }
      if (a.stage !== b.stage) return b.stage - a.stage;
      if (a.total !== b.total) return b.total - a.total;
      for (let i = 0; i < Math.max(a.best.length, b.best.length); i++) {
        const x = a.best[i] || 0, y = b.best[i] || 0;
        if (x !== y) return y - x;
      }
      return 0;
    };
    rows.sort((a, b) => cmp(a, b) || a.nick.localeCompare(b.nick));
    rows.forEach((r, i) => { r.place = i > 0 && cmp(rows[i - 1], r) === 0 ? rows[i - 1].place : i + 1; });
    rows.forEach((r) => { r.tie = rows.filter((x) => x.place === r.place).length > 1; delete r.best; });
    return { events, rows, bestOf: N, hasFinal, validated: events.filter((e) => e.validated).length };
  }

  function view(c, journal) {
    const out = Object.assign({}, c);
    out.standings = standings(c);
    const sealed = readJson(join(cdir(c.id), 'result.json'));
    if (journal) {
      const chain = verifyJournal(journal.entries);
      out.checks = { chain: chain.ok, entries: journal.entries.length };
      if (sealed) { out.checks.signature = !!(sealed.signature && verifyPayload(sealed.payload, sealed.signature, sealed.publicKeyPem)); out.sealedHead = sealed.payload.head; }
      out.history = journal.entries.map((e) => ({ seq: e.seq, ts: e.ts, type: e.type, author: e.data && e.data.author, summary: summary(e) }));
    }
    return out;
  }
  function summary(e) {
    const d = e.data || {};
    switch (e.type) {
      case 'cupCreated': return 'cup created « ' + d.name + ' »' + (d.bestOf ? ', best ' + d.bestOf + ' results' : ', every result');
      case 'cupUpdated': return 'changed: ' + Object.keys(d.changes || {}).join(', ');
      case 'eventAdded': return 'tournament added: ' + d.label + (d.qualify ? ', first ' + d.qualify + ' go on' : '') + (d.final ? ', final' : '') + (d.counts === false ? ', no points' : '');
      case 'eventRemoved': return 'tournament removed: ' + d.label;
      case 'qualified': return d.nicks.length + ' qualified for « ' + d.to + ' »: ' + d.nicks.join(', ') + (d.errors && d.errors.length ? ' (' + d.errors.join('; ') + ')' : '');
      case 'cupClosed': return 'cup closed: ' + (d.winner ? 'won by ' + d.winner : 'no winner') + ', standings signed';
      default: return e.type;
    }
  }

  // ── create / change ──
  function create(input, author) {
    const name = clean(input && input.name, 60);
    if (name.length < 2) refuse('name: 2 to 60 characters');
    const bestOf = Math.max(0, Math.min(50, parseInt(input.bestOf, 10) || 0));
    const visibility = ['public', 'unlisted', 'private'].indexOf(input.visibility) >= 0 ? input.visibility : 'public';
    mkdirSync(root, { recursive: true });
    const id = 'c' + now().toString(36) + randomBytes(3).toString('hex');
    mkdirSync(cdir(id));
    const image = imageOf(input.image);
    const c = { id, name, description: clean(input.description, 300), bestOf, visibility, image, events: [], status: 'open',
      inviteCode: visibility === 'private' ? randomBytes(6).toString('base64url') : null, publicKey: randomBytes(12).toString('base64url'), createdAt: now(), updatedAt: now() };
    const journal = new Journal({ now });
    journal.append('cupCreated', { author: author || 'admin', name, bestOf, visibility });
    return save(c, journal);
  }
  function update(id, patch, author) {
    const data = { changes: {} };
    return act(id, author, 'cupUpdated', data, (c) => {
      // The image may change at any time; the rest only while the cup is open.
      if (patch.image !== undefined) c.image = data.changes.image = imageOf(patch.image);
      if (c.status === 'closed' && Object.keys(patch).some((k) => k !== 'image')) refuse('the cup is closed');
      if (patch.name != null) { const n = clean(patch.name, 60); if (n.length < 2) refuse('name: 2 to 60 characters'); c.name = data.changes.name = n; }
      if (patch.description != null) c.description = data.changes.description = clean(patch.description, 300);
      if (patch.bestOf != null) c.bestOf = data.changes.bestOf = Math.max(0, Math.min(50, parseInt(patch.bestOf, 10) || 0));
      if (patch.visibility && ['public', 'unlisted', 'private'].indexOf(patch.visibility) >= 0) {
        c.visibility = data.changes.visibility = patch.visibility;
        if (c.visibility === 'private' && !c.inviteCode) c.inviteCode = randomBytes(6).toString('base64url');
      }
    });
  }
  function addEvent(id, input, author) {
    const tid = String(input && input.tournamentId || '');
    const t = tget(tid);
    if (!t) refuse('unknown tournament');
    if (t.parentId) refuse('add the tournament, not one of its tables');
    const ev = { tournamentId: tid, label: clean(input.label, 60) || t.name, counts: input.counts !== false,
      qualify: Math.max(0, Math.min(10, parseInt(input.qualify, 10) || 0)), next: null, final: !!input.final,
      fromStandings: Math.max(0, Math.min(40, parseInt(input.fromStandings, 10) || 0)) };
    const data = {};
    return act(id, author, 'eventAdded', data, (c) => {
      if (c.status === 'closed') refuse('the cup is closed');
      if (c.events.length >= MAX_EVENTS) refuse('at most ' + MAX_EVENTS + ' tournaments in a cup');
      if (c.events.some((e) => e.tournamentId === tid)) refuse('this tournament is in the cup already');
      if (input.next != null && input.next !== '') {
        const nx = parseInt(input.next, 10);
        if (!c.events[nx]) refuse('the next tournament must be in the cup first');
        ev.next = nx;
        if (!ev.qualify) refuse('how many go on to the next tournament?');
      }
      c.events.push(ev);
      Object.assign(data, { label: ev.label, tournamentId: tid, counts: ev.counts, qualify: ev.qualify, next: ev.next, final: ev.final, fromStandings: ev.fromStandings });
    });
  }
  function removeEvent(id, index, author) {
    const data = {};
    return act(id, author, 'eventRemoved', data, (c) => {
      if (c.status === 'closed') refuse('the cup is closed');
      const i = parseInt(index, 10);
      if (!c.events[i]) refuse('no such tournament in the cup');
      if (c.events.some((e) => e.next === i)) refuse('another tournament sends its qualifiers to this one');
      data.label = c.events[i].label;
      c.events.splice(i, 1);
      for (const e of c.events) if (e.next != null && e.next > i) e.next -= 1;
    });
  }

  // ── stages: the first Q of a validated tournament go on ──
  function qualifyInto(c, to, nicks, author, fromLabel) {
    const target = c.events[to];
    const errors = [], added = [];
    for (const nick of nicks) {
      try { T.addPlayer(target.tournamentId, nick, author || 'cup'); added.push(nick); }
      catch (e) { if (!/already in/.test(e.message)) errors.push(nick + ': ' + e.message); else added.push(nick); }
    }
    return { added, errors, to: target.label, from: fromLabel };
  }
  // Called by the service's sweep: tournaments validated whose qualifiers
  // have not gone on yet.
  function tick() {
    const done = [];
    for (const c0 of all()) {
      if (c0.status === 'closed') continue;
      c0.events.forEach((e, i) => {
        if (e.next == null || e.advanced || !e.qualify) return;
        const t = tget(e.tournamentId);
        if (!t || t.status !== 'validated' || !t.result) return;
        const nicks = t.result.ranking.filter((r) => r.place <= e.qualify).map((r) => r.nick);
        const { c } = load(c0.id);
        const r = qualifyInto(c, e.next, nicks, 'cup', e.label);
        act(c0.id, 'cup', 'qualified', { from: e.label, to: r.to, nicks: r.added, errors: r.errors }, (cc) => { cc.events[i].advanced = { at: now(), nicks: r.added, errors: r.errors }; });
        done.push({ cup: c0.id, event: i });
      });
    }
    return done;
  }
  // A final that takes the top K of the points standings (organizer).
  function qualifyFromStandings(id, index, author) {
    const { c } = load(id);
    const i = parseInt(index, 10);
    const e = c.events[i];
    if (!e || !e.final || !e.fromStandings) refuse('this tournament takes no players from the standings');
    if (e.advanced) refuse('done already');
    const st = standings(c);
    const nicks = st.rows.filter((r) => r.place <= e.fromStandings && !(r.results.length === 0)).map((r) => r.nick);
    if (nicks.length < 2) refuse('fewer than two players in the standings');
    const r = qualifyInto(c, i, nicks, author, 'standings');
    return act(id, author, 'qualified', { from: 'standings', to: r.to, nicks: r.added, errors: r.errors }, (cc) => { cc.events[i].advanced = { at: now(), nicks: r.added, errors: r.errors }; });
  }
  // The end of the cup: the standings signed.
  function close(id, author) {
    const { c, journal } = load(id);
    if (c.status === 'closed') refuse('closed already');
    const st = standings(c);
    if (!st.validated) refuse('no validated tournament yet');
    const pending = st.events.filter((e) => !e.validated).map((e) => e.label);
    if (pending.length) refuse('not validated yet: ' + pending.join(', '));
    const top = st.rows[0];
    journal.append('cupClosed', { author: author || 'admin', winner: top ? top.nick : null, standings: st.rows.map((r) => ({ place: r.place, nick: r.nick, total: r.total, stage: r.stage })), events: st.events.map((e) => ({ label: e.label, tournamentId: e.tournamentId, head: e.head })) });
    c.status = 'closed'; c.closedAt = now(); c.final = st.rows.map((r) => ({ place: r.place, nick: r.nick, total: r.total, stage: r.stage }));
    c.validatedCount = st.validated;
    const key = privateKey();
    const payload = { cupId: c.id, name: c.name, head: journal.head, entries: journal.entries.length, standings: c.final, events: st.events.map((e) => ({ label: e.label, head: e.head })) };
    writeAtomic(join(cdir(c.id), 'result.json'), { payload, signature: key ? signPayload(payload, key) : null, publicKeyPem: key ? publicKeyFromPrivate(key) : null });
    return save(c, journal);
  }

  // ── public ──
  function visible(c, invite) {
    if (c.visibility !== 'private') return true;
    const a = Buffer.from(String(invite || '')), b = Buffer.from(String(c.inviteCode || ''));
    return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
  }
  function card(c) {
    const st = standings(c);
    return { key: c.publicKey, name: c.name, status: c.status, events: st.events.length, validated: st.validated, leader: st.rows[0] ? st.rows[0].nick : null,
      image: imageUrl(c.image || DEFAULT_IMAGE.cup), thumb: imageUrl(c.image || DEFAULT_IMAGE.cup, true) };
  }
  function publicList() { return all().filter((c) => c.visibility === 'public').sort((a, b) => b.createdAt - a.createdAt).map(card); }
  function publicGet(key, invite) {
    const c = all().find((x) => x.publicKey === key);
    if (!c) { const e = new Refusal('unknown cup'); e.code = 'notFound'; throw e; }
    if (!visible(c, invite)) { const e = new Refusal('private'); e.code = 'private'; throw e; }
    const st = standings(c);
    const sealed = readJson(join(cdir(c.id), 'result.json'));
    return Object.assign(card(c), { description: c.description, bestOf: c.bestOf,
      events: st.events.map((e) => ({ index: e.index, label: e.label, key: e.key, status: e.status, counts: e.counts, qualify: e.qualify, next: e.next, final: e.final, fromStandings: e.fromStandings, stage: e.stage, players: e.players, validated: e.validated })),
      standings: st.rows, hasFinal: st.hasFinal,
      sealed: sealed ? { head: sealed.payload.head, signedBy: sealed.publicKeyPem ? publicKeyRawB64(sealed.publicKeyPem) : null, signature: !!(sealed.signature && verifyPayload(sealed.payload, sealed.signature, sealed.publicKeyPem)) } : null });
  }

  return {
    list: () => all().sort((a, b) => b.createdAt - a.createdAt).map((c) => ({ id: c.id, name: c.name, status: c.status, events: c.events.length, visibility: c.visibility, bestOf: c.bestOf })),
    get: (id) => { const { c, journal } = load(id); return view(c, journal); },
    create, update, addEvent, removeEvent, tick, qualifyFromStandings, close, publicList, publicGet, Refusal, allRaw: () => all(), generation: () => gen,
    // The (non-private) cups a tournament belongs to, for its page.
    cupsOf: (tournamentId) => all().filter((c) => c.visibility !== 'private' && c.events.some((e) => e.tournamentId === tournamentId)).map((c) => ({ key: c.publicKey, name: c.name })),
  };
}
