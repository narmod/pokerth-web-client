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
// Design: docs/ARENA.md (Cups).
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, renameSync, mkdirSync, readdirSync, rmSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { Journal, verifyJournal, signPayload, verifyPayload, publicKeyFromPrivate, publicKeyRawB64 } from './journal.mjs';
import { IMG_RE, DEFAULT_IMAGE, imageUrl } from './images.mjs';
import { cleanPlan, eventsOf, tournamentInput, entrySlots, cupCapacity, slotLabel, slotName, slotFormat } from './cupplan.mjs';


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
  const PL = o.players || null;   // players.mjs: bans, nicknames claimed by an account
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
    // Registered players: never their code's hash.
    out.registrants = (c.registrants || []).map((r) => ({ nick: r.nick, at: r.at, choice: r.choice || null, tournaments: Object.keys(r.added || {}).length, lastError: r.lastError || null }));
    if (c.plan) out.planView = planView(c, true);
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
      case 'cupClosed': return 'cup closed: ' + (d.winner ? 'won by ' + d.winner : 'no winner') + ', standings signed' + (d.auto ? ' (by itself)' : '');
      case 'planSet': return 'programme: ' + d.format + ', ' + d.slots + ' tournament' + (d.slots === 1 ? '' : 's') + (d.created && d.created.length ? ', made: ' + d.created.join(', ') : '') + (d.removed && d.removed.length ? ', taken off: ' + d.removed.join(', ') : '') + (d.errors && d.errors.length ? ' (' + d.errors.join('; ') + ')' : '');
      case 'slotCreated': return 'tournament made for ' + d.label + ': ' + d.name;
      case 'slotAttached': return 'tournament attached to ' + d.label + ': ' + d.name;
      case 'slotDetached': return d.label + ': tournament detached';
      case 'cupRegistered': return d.nick + ' registered for the cup' + (d.choice ? ' (' + d.choice + ')' : '');
      case 'cupUnregistered': return d.nick + ' left the cup';
      case 'cupChoice': return d.nick + ' now plays ' + d.choice;
      case 'cupSynced': return 'registered players put into the tournaments: ' + d.added.join(', ') + (d.errors && d.errors.length ? ' (' + d.errors.join('; ') + ')' : '');
      case 'finalFromStandings': return d.nicks.length + ' of the standings go to the final' + (d.pending && d.pending.length ? ' — not validated yet: ' + d.pending.join(', ') : '') + (d.errors && d.errors.length ? ' (' + d.errors.join('; ') + ')' : '');
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
      if (c.plan) refuse('this cup follows its programme: change the programme');
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
      if (c.plan) refuse('this cup follows its programme: change the programme');
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
      if (c0.plan) { try { planTick(c0, done); } catch (e) { if (!(e instanceof Refusal)) throw e; } }
      const cNow = c0.plan ? load(c0.id).c : c0;
      if (cNow.status === 'closed') continue;
      cNow.events.forEach((e, i) => {
        if (e.next == null || e.advanced || !e.qualify) return;
        const t = tget(e.tournamentId);
        if (!t || t.status !== 'validated' || !t.result) return;
        const nicks = t.result.ranking.filter((r) => r.place <= e.qualify).map((r) => r.nick);
        const { c } = load(cNow.id);
        const r = qualifyInto(c, e.next, nicks, 'cup', e.label);
        act(cNow.id, 'cup', 'qualified', { from: e.label, to: r.to, nicks: r.added, errors: r.errors }, (cc) => { cc.events[i].advanced = { at: now(), nicks: r.added, errors: r.errors }; });
        done.push({ cup: cNow.id, event: i });
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
  function close(id, author, auto) {
    const { c, journal } = load(id);
    if (c.status === 'closed') refuse('closed already');
    const st = standings(c);
    if (!st.validated) refuse('no validated tournament yet');
    const pending = st.events.filter((e) => !e.validated).map((e) => e.label);
    if (pending.length) refuse('not validated yet: ' + pending.join(', '));
    const top = st.rows[0];
    journal.append('cupClosed', { author: author || 'admin', auto: !!auto, winner: top ? top.nick : null, standings: st.rows.map((r) => ({ place: r.place, nick: r.nick, total: r.total, stage: r.stage })), events: st.events.map((e) => ({ label: e.label, tournamentId: e.tournamentId, head: e.head })) });
    c.status = 'closed'; c.closedAt = now(); c.final = st.rows.map((r) => ({ place: r.place, nick: r.nick, total: r.total, stage: r.stage }));
    c.validatedCount = st.validated;
    const key = privateKey();
    const payload = { cupId: c.id, name: c.name, head: journal.head, entries: journal.entries.length, standings: c.final, events: st.events.map((e) => ({ label: e.label, head: e.head })) };
    writeAtomic(join(cdir(c.id), 'result.json'), { payload, signature: key ? signPayload(payload, key) : null, publicKeyPem: key ? publicKeyFromPrivate(key) : null });
    return save(c, journal);
  }

  // Deleting a cup (the super admin only — the service checks who asks): its
  // folder goes, journal and signed standings included, and its medals with
  // it. The name must be typed again. A line is kept in cups/deleted.jsonl
  // (who, when, what the cup was), the only trace left.
  function remove(id, author, confirmName) {
    const { c } = load(id);
    if (String(confirmName || '').trim() !== c.name) refuse('type the cup\'s name exactly to delete it');
    const st = standings(c);
    const line = { at: now(), by: author || 'admin', id: c.id, name: c.name, status: c.status, events: st.events.map((e) => e.label), winner: c.final && c.final[0] ? c.final[0].nick : null };
    appendFileSync(join(root, 'deleted.jsonl'), JSON.stringify(line) + '\n');
    rmSync(cdir(c.id), { recursive: true, force: true });
    gen++;
    return { deleted: c.id, name: c.name };
  }

  // ── the programme (cupplan.mjs, service 0.23.0) ──
  const lowN = (s) => String(s || '').toLowerCase();
  const started = (tid) => (T.isStarted ? T.isStarted(tid) : false);
  // What a tournament of the cup is told when the programme changes (only
  // while it has not started): its date, and the cup's settings.
  function refreshTournament(c, plan, s, author) {
    const inp = tournamentInput(c, plan, s);
    const patch = { startsAt: inp.startsAt, table: inp.table || {}, run: inp.run, profile: inp.profile, settings: inp.settings, visibility: inp.visibility, access: inp.access };
    if (inp.server) patch.server = inp.server;
    if (s.auto) patch.name = inp.name;
    try { T.update(s.tournamentId, patch, author); } catch (e) { if (!/nothing to change/.test(e.message)) throw e; }
  }
  function makeTournament(c, plan, s, author) {
    const t = T.create(tournamentInput(c, plan, s), author);
    s.tournamentId = t.id;
    return t;
  }
  function setPlan(id, input, author) {
    const { c: c0 } = load(id);
    if (c0.status === 'closed') refuse('the cup is closed');
    if (!c0.plan && c0.events.length) refuse('this cup already has tournaments added by hand: make a new cup for a programme');
    const { plan, gone } = cleanPlan(input, c0.plan, started, refuse);
    const created = [], removed = [], errors = [];
    // Dates taken off: the cup's own tournaments go (nothing started), the
    // organizer's stay, just no longer in the cup.
    for (const s of gone) {
      if (s.auto) { try { T.discard(s.tournamentId, author, 'taken off the programme of « ' + c0.name + ' »'); removed.push(slotLabel(s)); } catch (e) { errors.push(slotLabel(s) + ': ' + e.message); } }
      else removed.push(slotLabel(s) + ' (detached)');
    }
    for (const s of plan.slots) {
      if (s.tournamentId && !tget(s.tournamentId)) { s.tournamentId = null; s.auto = false; }
      if (s.tournamentId) {
        if (!started(s.tournamentId)) { try { refreshTournament(c0, plan, s, author); } catch (e) { errors.push(slotLabel(s) + ': ' + e.message); } }
      } else if (plan.create === 'auto') {
        try { makeTournament(c0, plan, s, author); s.auto = true; created.push(slotLabel(s)); } catch (e) { errors.push(slotLabel(s) + ': ' + e.message); }
      }
    }
    return act(id, author, 'planSet', { format: plan.format, slots: plan.slots.length, created, removed, errors }, (c) => {
      c.plan = plan;
      c.events = eventsOf(plan, c.events);
      if (!Array.isArray(c.registrants)) c.registrants = [];
      syncRegistrants(c);
    });
  }
  function slotOf(c, key) {
    const s = c.plan && c.plan.slots.find((x) => x.key === String(key || ''));
    if (!s) refuse('no such date in the programme');
    return s;
  }
  // The organizer makes the tournament of a dated slot (settings of the cup,
  // changed afterwards on the tournament itself if he wishes).
  function slotCreate(id, key, author) {
    const { c: c0 } = load(id);
    if (c0.status === 'closed') refuse('the cup is closed');
    const s0 = slotOf(c0, key);
    if (s0.tournamentId && tget(s0.tournamentId)) refuse('this date has its tournament already');
    const t = T.create(tournamentInput(c0, c0.plan, s0), author);
    return act(id, author, 'slotCreated', { label: slotLabel(s0), name: t.name }, (c) => {
      const s = slotOf(c, key); s.tournamentId = t.id; s.auto = false;
      c.events = eventsOf(c.plan, c.events);
      syncRegistrants(c);
    });
  }
  // A tournament made before, put on a date of the programme: it takes the
  // date when it has not started.
  function slotAttach(id, key, tournamentId, author) {
    const { c: c0 } = load(id);
    if (c0.status === 'closed') refuse('the cup is closed');
    const s0 = slotOf(c0, key);
    const t = tget(String(tournamentId || ''));
    if (!t) refuse('unknown tournament');
    if (t.parentId) refuse('pick the tournament, not one of its tables');
    if (c0.plan.slots.some((x) => x.tournamentId === t.id)) refuse('this tournament is in the programme already');
    if (s0.tournamentId && tget(s0.tournamentId)) refuse('this date has its tournament already');
    if (!started(t.id)) { try { T.update(t.id, { startsAt: s0.at }, author); } catch (e) { if (!/nothing to change/.test(e.message)) throw e; } }
    return act(id, author, 'slotAttached', { label: slotLabel(s0), name: t.name }, (c) => {
      const s = slotOf(c, key); s.tournamentId = t.id; s.auto = false;
      c.events = eventsOf(c.plan, c.events);
      syncRegistrants(c);
    });
  }
  function slotDetach(id, key, author) {
    const { c: c0 } = load(id);
    const s0 = slotOf(c0, key);
    if (!s0.tournamentId) refuse('no tournament on this date');
    const st = tget(s0.tournamentId);
    if (st && st.status === 'validated') refuse('its result counts for the cup: it stays');
    return act(id, author, 'slotDetached', { label: slotLabel(s0) }, (c) => {
      const s = slotOf(c, key); s.tournamentId = null; s.auto = false;
      c.events = eventsOf(c.plan, c.events);
    });
  }

  // ── registering once for the whole cup ──
  // The tournaments a registered player goes into.
  function targetsOf(c, r) {
    let slots = entrySlots(c.plan);
    if (c.plan.format === 'stages' && c.plan.stageEntry === 'choose') slots = slots.filter((s) => s.key === r.choice);
    return slots.filter((s) => s.tournamentId);
  }
  // Puts each registered player into the tournaments he is not in yet. One
  // he left (he was put in, he is not there any more) is left alone.
  function syncRegistrants(c, out) {
    if (!c.plan || c.plan.registration !== 'cup' || c.status === 'closed') return;
    for (const r of c.registrants || []) {
      r.added = r.added || {};
      for (const s of targetsOf(c, r)) {
        if (r.added[s.tournamentId] || started(s.tournamentId)) continue;
        try {
          T.addRegistered(s.tournamentId, r.nick, r.codeHash, 'cup');
          r.added[s.tournamentId] = now();
          if (out) out.added.push(r.nick + ' → ' + slotLabel(s));
        } catch (e) { if (out && r.lastError !== e.message) out.errors.push(r.nick + ': ' + e.message); r.lastError = e.message; }
      }
    }
  }
  function syncNeeded(c) {
    if (!c.plan || c.plan.registration !== 'cup' || c.status === 'closed') return false;
    const memo = new Map();   // one look per tournament, however many players
    const st = (tid) => { if (!memo.has(tid)) memo.set(tid, started(tid)); return memo.get(tid); };
    return (c.registrants || []).some((r) => targetsOf(c, r).some((s) => !(r.added || {})[s.tournamentId] && !st(s.tournamentId)));
  }
  const cupByKey = (key) => all().find((x) => x.publicKey === key) || null;
  const prefuse = (code, m) => { const e = new Refusal(m); e.code = code; throw e; };
  function regState(c) {
    if (!c.plan || c.plan.registration !== 'cup') return { mode: 'tournament' };
    const entries = entrySlots(c.plan);
    const cap = cupCapacity(c.plan);
    const n = (c.registrants || []).length;
    let closed = null;
    if (c.status === 'closed') closed = 'finished';
    else if (!entries.some((s) => !s.tournamentId || !started(s.tournamentId))) closed = 'started';
    else if (n >= cap) closed = 'full';
    const choices = c.plan.format === 'stages' && c.plan.stageEntry === 'choose'
      ? entries.map((s) => ({ key: s.key, n: s.n, at: s.at, taken: (c.registrants || []).filter((r) => r.choice === s.key).length, cap: slotFormat(c.plan, s) === 'multi' ? 40 : 10, started: !!(s.tournamentId && started(s.tournamentId)) }))
      : null;
    return { mode: 'cup', open: !closed, closed, count: n, cap, choose: !!choices, choices, players: (c.registrants || []).map((r) => r.nick) };
  }
  function checkChoice(c, choice, except) {
    const st = regState(c);
    if (!st.choose) return null;
    const ch = st.choices.find((x) => x.key === String(choice || ''));
    if (!ch) prefuse('pickDate', 'pick the tournament you play');
    if (ch.started) prefuse('dateStarted', 'this tournament has started');
    if (ch.taken - (except === ch.key ? 1 : 0) >= ch.cap) prefuse('dateFull', 'this tournament is full');
    return ch.key;
  }
  function findReg(c, input, opts) {
    const account = opts && opts.account;
    const nick = account ? account.nick : String((input && input.nick) || '').trim();
    const r = (c.registrants || []).find((x) => lowN(x.nick) === lowN(nick));
    if (r && account) return r;   // signed in to that nickname's account
    const h = T.codeHash(input && input.code);
    const a = Buffer.from(String((r && r.codeHash) || ''), 'hex'), b = Buffer.from(h, 'hex');
    if (!r || a.length !== 32 || a.length !== b.length || !timingSafeEqual(a, b)) prefuse('badCode', 'nickname or code not recognised');
    return r;
  }
  function cupRegister(key, input, opts) {
    const c0 = cupByKey(key);
    if (!c0 || !visible(c0, input && input.invite)) prefuse('notFound', 'unknown cup');
    const account = (opts && opts.account) || null;
    let nick = account ? account.nick : String((input && input.nick) || '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
    while (Buffer.byteLength(nick, 'utf8') > 64) nick = nick.slice(0, -1);
    if (Buffer.byteLength(nick, 'utf8') < 2 || !/^[\x21-\x7e]/.test(nick)) prefuse('badNick', 'nickname: 2 to 64 bytes, starting with a plain character');
    const bar = PL && PL.barrier(nick, account);
    if (bar) prefuse(bar.code, bar.message);
    const code = T.newCode();
    const data = { nick };
    act(c0.id, 'player', 'cupRegistered', data, (c) => {
      const st = regState(c);
      if (st.mode !== 'cup') prefuse('noCupRegistration', 'register for each tournament of this cup');
      if (st.closed) prefuse('closed_' + st.closed, 'registration is closed (' + st.closed + ')');
      if ((c.registrants || []).some((r) => lowN(r.nick) === lowN(nick))) prefuse('taken', nick + ' is already registered');
      const choice = checkChoice(c, input && input.choice);
      if (choice) data.choice = choice;
      if (c.plan.access) T.accessOrRefuse(c.plan.access, nick, account);
      c.registrants = (c.registrants || []).concat([{ nick, codeHash: T.codeHash(code), at: now(), choice: choice || null, added: {} }]);
      syncRegistrants(c);
    });
    return { nick, code, cup: publicGet(key, input && input.invite) };
  }
  function cupEligible(key, input, opts) {
    const c = cupByKey(key);
    if (!c || !visible(c, input && input.invite)) prefuse('notFound', 'unknown cup');
    const account = (opts && opts.account) || null;
    const nick = account ? account.nick : String((input && input.nick) || '').trim();
    const bar = PL && PL.barrier(nick, account);
    const rules = c.plan && c.plan.access;
    let miss = [];
    if (rules) { try { T.accessOrRefuse(rules, nick, account); } catch (e) { miss = e.missing || []; } }
    return { nick, access: rules || null, missing: (bar ? [{ code: bar.code }] : []).concat(miss) };
  }
  function cupUnregister(key, input, opts) {
    const c0 = cupByKey(key);
    if (!c0 || !visible(c0, input && input.invite)) prefuse('notFound', 'unknown cup');
    const data = {};
    act(c0.id, 'player', 'cupUnregistered', data, (c) => {
      const r = findReg(c, input, opts);
      data.nick = r.nick;
      for (const tid of Object.keys(r.added || {})) { try { T.removeRegistered(tid, r.nick, 'cup'); } catch (e) {} }
      c.registrants = c.registrants.filter((x) => x !== r);
    });
    return { nick: data.nick, cup: publicGet(key, input && input.invite) };
  }
  function cupChoose(key, input, opts) {
    const c0 = cupByKey(key);
    if (!c0 || !visible(c0, input && input.invite)) prefuse('notFound', 'unknown cup');
    const data = {};
    act(c0.id, 'player', 'cupChoice', data, (c) => {
      const r = findReg(c, input, opts);
      const choice = checkChoice(c, input && input.choice, r.choice);
      if (!choice) prefuse('noChoice', 'nothing to choose in this cup');
      const old = r.choice ? c.plan.slots.find((s) => s.key === r.choice) : null;
      if (old && old.tournamentId) {
        if (started(old.tournamentId)) prefuse('dateStarted', 'your tournament has started');
        try { T.removeRegistered(old.tournamentId, r.nick, 'cup'); } catch (e) {}
        delete (r.added || {})[old.tournamentId];
      }
      r.choice = choice; data.nick = r.nick; data.choice = choice;
      syncRegistrants(c);
    });
    return { nick: data.nick, choice: data.choice, cup: publicGet(key, input && input.invite) };
  }

  // ── what a programmed cup does by itself (the service's sweep) ──
  function planTick(c0, done) {
    // Registered players into tournaments made since.
    if (syncNeeded(c0)) {
      const out = { added: [], errors: [] };
      const { c } = load(c0.id);
      syncRegistrants(c, out);
      if (out.added.length || out.errors.length) { const { journal } = load(c0.id); journal.append('cupSynced', Object.assign({ author: 'cup' }, out)); save(c, journal); done.push({ cup: c0.id, synced: out.added.length }); }
      c0 = load(c0.id).c;
    }
    // Series + final: the top K of the standings go to the final once the
    // series is validated, or an hour before the final at the latest.
    if (c0.plan.format === 'seriesFinal') {
      const i = c0.events.findIndex((e) => e.final && e.fromStandings);
      const fs = c0.plan.slots.find((s) => s.kind === 'final');
      if (i >= 0 && !c0.events[i].advanced && fs) {
        const st = standings(c0);
        const series = st.events.filter((e) => !e.final);
        const pending = c0.plan.slots.filter((s) => s.kind === 'series').filter((s) => !series.some((e) => e.tournamentId === s.tournamentId && e.validated)).map((s) => slotLabel(s));
        const due = (!pending.length && series.length) || (now() >= fs.at - 3600e3 && st.validated > 0);
        if (due) {
          const nicks = st.rows.filter((r) => r.place <= c0.plan.top && r.results.length).map((r) => r.nick);
          if (nicks.length >= 2) {
            const { c } = load(c0.id);
            const r = qualifyInto(c, i, nicks, 'cup', 'standings');
            act(c0.id, 'cup', 'finalFromStandings', { nicks: r.added, errors: r.errors, pending }, (cc) => { cc.events[i].advanced = { at: now(), nicks: r.added, errors: r.errors, pending }; });
            done.push({ cup: c0.id, final: r.added.length });
            c0 = load(c0.id).c;
          }
        }
      }
    }
    // The end: every date has its tournament, all validated → signed.
    if (c0.plan.slots.every((s) => s.tournamentId) && c0.events.length) {
      const st = standings(c0);
      if (st.events.every((e) => e.validated)) { try { close(c0.id, 'cup', true); done.push({ cup: c0.id, closed: true }); } catch (e) {} }
    }
  }

  // ── public ──
  function visible(c, invite) {
    if (c.visibility !== 'private') return true;
    const a = Buffer.from(String(invite || '')), b = Buffer.from(String(c.inviteCode || ''));
    return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
  }
  function card(c) {
    const st = standings(c);
    const dates = c.plan ? c.plan.slots.map((s) => s.at) : [];
    return { key: c.publicKey, name: c.name, status: c.status, events: st.events.length, validated: st.validated, leader: st.rows[0] ? st.rows[0].nick : null,
      format: c.plan ? c.plan.format : null, from: dates.length ? Math.min(...dates) : null, to: dates.length ? Math.max(...dates) : null,
      image: imageUrl(c.image || DEFAULT_IMAGE.cup), thumb: imageUrl(c.image || DEFAULT_IMAGE.cup, true) };
  }
  // The programme as pages show it: each date, its tournament, where it stands.
  function planView(c, organizer) {
    const p = c.plan;
    const slots = p.slots.map((s) => {
      const t = s.tournamentId ? tget(s.tournamentId) : null;
      const o = { key: s.key, kind: s.kind, step: s.step, n: s.n, at: s.at, qualify: s.qualify, label: slotLabel(s),
        tournament: t ? { key: t.publicKey, name: t.name, status: t.status, players: t.players.length, started: started(t.id), format: t.format } : null };
      if (organizer) { o.tournamentId = s.tournamentId || null; o.auto = !!s.auto; }
      return o;
    });
    const upcoming = slots.filter((s) => !(s.tournament && (s.tournament.status === 'validated' || s.tournament.started))).sort((a, b) => a.at - b.at);
    const out = { format: p.format, create: p.create, registration: p.registration, stageEntry: p.stageEntry, tables: p.tables, top: p.top, slots, access: p.access || null,
      next: upcoming[0] ? upcoming[0].key : null, registrationState: regState(c) };
    if (organizer) { out.common = p.common; out.rule = p.rule; }
    return out;
  }
  function publicList() { return all().filter((c) => c.visibility === 'public').sort((a, b) => b.createdAt - a.createdAt).map(card); }
  function publicGet(key, invite) {
    const c = all().find((x) => x.publicKey === key);
    if (!c) { const e = new Refusal('unknown cup'); e.code = 'notFound'; throw e; }
    if (!visible(c, invite)) { const e = new Refusal('private'); e.code = 'private'; throw e; }
    const st = standings(c);
    const sealed = readJson(join(cdir(c.id), 'result.json'));
    return Object.assign(card(c), { description: c.description, bestOf: c.bestOf, plan: c.plan ? planView(c, false) : null,
      events: st.events.map((e) => ({ index: e.index, label: e.label, key: e.key, status: e.status, counts: e.counts, qualify: e.qualify, next: e.next, final: e.final, fromStandings: e.fromStandings, stage: e.stage, players: e.players, validated: e.validated })),
      standings: st.rows, hasFinal: st.hasFinal,
      sealed: sealed ? { head: sealed.payload.head, signedBy: sealed.publicKeyPem ? publicKeyRawB64(sealed.publicKeyPem) : null, signature: !!(sealed.signature && verifyPayload(sealed.payload, sealed.signature, sealed.publicKeyPem)) } : null });
  }

  return {
    list: () => all().sort((a, b) => b.createdAt - a.createdAt).map((c) => ({ id: c.id, name: c.name, status: c.status, events: c.events.length, visibility: c.visibility, bestOf: c.bestOf, format: c.plan ? c.plan.format : null })),
    get: (id) => { const { c, journal } = load(id); return view(c, journal); },
    create, update, addEvent, removeEvent, tick, setPlan, slotCreate, slotAttach, slotDetach, cupRegister, cupUnregister, cupChoose, cupEligible, qualifyFromStandings, close, remove, publicList, publicGet, Refusal, allRaw: () => all(), generation: () => gen,
    // The cups a player registered for as a whole (« My account », 0.32.0).
    registrationsOf: (nick) => all().filter((c) => (c.registrants || []).some((r) => lowN(r.nick) === lowN(nick))).map((c) => { const r = c.registrants.find((x) => lowN(x.nick) === lowN(nick)); return { key: c.publicKey, name: c.name, status: c.status, choice: r.choice || null, at: r.at }; }),
    // Every tournament already in a cup (its events or its programme) → the cup's name.
    usedBy: () => { const m = new Map(); for (const c of all()) { for (const e of c.events) m.set(e.tournamentId, c.name); for (const s of (c.plan ? c.plan.slots : [])) if (s.tournamentId) m.set(s.tournamentId, c.name); } return m; },
    // The (non-private) cups a tournament belongs to, for its page.
    // register: players register for the whole cup, this tournament is one they go into.
    cupsOf: (tournamentId) => all().filter((c) => c.visibility !== 'private' && c.events.some((e) => e.tournamentId === tournamentId))
      .map((c) => ({ key: c.publicKey, name: c.name, register: !!(c.plan && c.plan.registration === 'cup' && entrySlots(c.plan).some((s) => s.tournamentId === tournamentId)) })),
  };
}
