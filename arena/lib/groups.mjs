// ═══════════════════════════════════════════════════════════════════
// Arena — groups (service 0.29.0, 2026-10-24): clubs, teams, lists.
//
// An organizer makes a group (a name, a line about it) and chooses how a
// player gets in (decided 2026-10-24: all four, one per group):
//   invite   an organizer adds him (a list of guests, a team)
//   request  a signed-in player asks, an organizer accepts or declines
//   code     a signed-in player types the group's code: in at once
//   open     any signed-in player joins
// An organizer can always add or take out anyone, whatever the way in.
// A player leaves when he likes (or takes back his request). Every group is
// public (decided 2026-10-24): its name, its members, on the players' page.
// A banned player cannot join or ask.
//
// Members are nicknames (any case), as everything else here: an organizer
// may add a nickname without an account. A player joins with his account:
// its nickname. A tournament or a cup may be kept for the members of one of
// several groups (access.mjs, `groups`). A group a tournament or a cup still
// asks for cannot be deleted.
//
// Stored in ARENA_DIR/groups.json; what organizers did in its log (the last
// 2000 lines).
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const JOIN_MODES = Object.freeze(['invite', 'request', 'code', 'open']);
export const GROUP_ID_RE = /^g[0-9a-f]{10}$/;
const MAX_GROUPS = 200, MAX_MEMBERS = 2000, MAX_REQUESTS = 500, MAX_LOG = 2000;
const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const low = (s) => String(s || '').toLowerCase();
const clean = (s, max) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

/**
 * o: { dir, Refusal, banOf?: (nick) => ban | null, usedBy?: (groupId) => [names], now? }
 */
export function createGroups(o) {
  const file = path.join(o.dir, 'groups.json');
  const now = o.now || (() => Date.now());
  const Refusal = o.Refusal || class extends Error {};
  const refuse = (m, code) => { const e = new Refusal(m); if (code) e.code = code; throw e; };
  let db = null;
  function read() {
    if (db) return db;
    try { db = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { db = null; }
    if (!db || !Array.isArray(db.groups)) db = { v: 1, groups: [], log: [] };
    return db;
  }
  function write() {
    fs.mkdirSync(o.dir, { recursive: true });
    if (db.log.length > MAX_LOG) db.log = db.log.slice(-MAX_LOG);
    const tmp = file + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db), { mode: 0o600 });
    fs.renameSync(tmp, file);
  }
  const log = (e) => read().log.push(Object.assign({ at: now() }, e));
  const newCode = () => { const b = crypto.randomBytes(8); let s = ''; for (let i = 0; i < 8; i++) s += ABC[b[i] % ABC.length]; return s; };
  const byId = (id) => read().groups.find((g) => g.id === String(id || '')) || null;
  const must = (id) => byId(id) || refuse('unknown group', 'groupUnknown');
  const has = (list, nick) => list.some((m) => low(m.nick) === low(nick));
  function cleanNick(n) {
    const s = String(n == null ? '' : n).trim().slice(0, 64);
    if (s.length < 1 || /[\u0000-\u001f\u007f]/.test(s)) refuse('a nickname: 1 to 64 characters', 'badNick');
    return s;
  }
  function cleanName(n, self) {
    const name = clean(n, 40);
    if (name.length < 2) refuse('name: 2 to 40 characters');
    if (read().groups.some((g) => g !== self && low(g.name) === low(name))) refuse('this name is taken');
    return name;
  }
  const joinOf = (v) => (JOIN_MODES.indexOf(v) >= 0 ? v : 'invite');

  // ── the organizers' side ──
  const view = (g) => ({ id: g.id, name: g.name, about: g.about, join: g.join, code: g.join === 'code' ? g.code : null,
    members: g.members.slice(), requests: g.requests.slice(), createdAt: g.createdAt, by: g.by, usedBy: o.usedBy ? o.usedBy(g.id) : [] });
  function list() { return read().groups.map(view); }
  function create(input, by) {
    input = input || {};
    if (read().groups.length >= MAX_GROUPS) refuse(MAX_GROUPS + ' groups at most');
    const g = { id: 'g' + crypto.randomBytes(5).toString('hex'), name: cleanName(input.name), about: clean(input.about, 200), join: joinOf(input.join), code: null, members: [], requests: [], createdAt: now(), by: by || null };
    if (g.join === 'code') g.code = newCode();
    read().groups.push(g);
    log({ type: 'created', id: g.id, name: g.name, by });
    write();
    return { group: view(g) };
  }
  function update(id, patch, by) {
    const g = must(id);
    patch = patch || {};
    if (patch.name != null) g.name = cleanName(patch.name, g);
    if (patch.about != null) g.about = clean(patch.about, 200);
    if (patch.join != null) g.join = joinOf(patch.join);
    if (g.join === 'code' && (!g.code || patch.newCode)) g.code = newCode();
    // Asking makes sense only where an organizer answers: other ways, the requests go.
    if (g.join !== 'request') g.requests = [];
    log({ type: 'updated', id: g.id, by });
    write();
    return { group: view(g) };
  }
  function remove(id, by) {
    const g = must(id);
    const used = o.usedBy ? o.usedBy(g.id) : [];
    if (used.length) refuse('still asked for by ' + used.map((n) => '« ' + n + ' »').join(', ') + ': take the condition away first');
    read().groups = read().groups.filter((x) => x !== g);
    log({ type: 'removed', id: g.id, name: g.name, by });
    write();
    return { removed: g.id };
  }
  function addMember(id, nick, by) {
    const g = must(id);
    const n = cleanNick(nick);
    g.requests = g.requests.filter((r) => low(r.nick) !== low(n));
    if (!has(g.members, n)) {
      if (g.members.length >= MAX_MEMBERS) refuse(MAX_MEMBERS + ' members at most');
      g.members.push({ nick: n, at: now(), by: by || null });
    }
    log({ type: 'added', id: g.id, nick: n, by });
    write();
    return { group: view(g) };
  }
  function removeMember(id, nick, by) {
    const g = must(id);
    g.members = g.members.filter((m) => low(m.nick) !== low(nick));
    g.requests = g.requests.filter((r) => low(r.nick) !== low(nick));
    log({ type: 'taken', id: g.id, nick: String(nick || '').slice(0, 64), by });
    write();
    return { group: view(g) };
  }
  function answer(id, nick, yes, by) {
    const g = must(id);
    if (!has(g.requests, nick)) refuse('no request from this player');
    const r = g.requests.find((x) => low(x.nick) === low(nick));
    if (yes) return addMember(id, r.nick, by);
    g.requests = g.requests.filter((x) => x !== r);
    log({ type: 'declined', id: g.id, nick: r.nick, by });
    write();
    return { group: view(g) };
  }

  // ── the players' side (signed in: the account's nickname) ──
  const pub = (g) => ({ id: g.id, name: g.name, about: g.about, join: g.join, members: g.members.map((m) => m.nick).sort((a, b) => a.localeCompare(b)) });
  function publicList() { return read().groups.map(pub).sort((a, b) => a.name.localeCompare(b.name)); }
  function mine(nick) {
    return { member: read().groups.filter((g) => has(g.members, nick)).map((g) => g.id), requested: read().groups.filter((g) => has(g.requests, nick)).map((g) => g.id) };
  }
  function join(id, account, code) {
    const g = must(id);
    const nick = account.nick;
    if (has(g.members, nick)) return { status: 'member', group: pub(g) };
    if (o.banOf && o.banOf(nick)) refuse('banned from this site\'s tournaments', 'banned');
    if (g.join === 'invite') refuse('this group takes its members by invitation of an organizer', 'groupInvite');
    if (g.join === 'code' && String(code || '').trim().toUpperCase() !== g.code) refuse('wrong group code', 'groupCode');
    if (g.join === 'request') {
      if (!has(g.requests, nick)) {
        if (g.requests.length >= MAX_REQUESTS) refuse('too many requests are waiting for this group: try later', 'tooMany');
        g.requests.push({ nick, at: now() });
        log({ type: 'asked', id: g.id, nick });
        write();
      }
      return { status: 'requested', group: pub(g) };
    }
    if (g.members.length >= MAX_MEMBERS) refuse(MAX_MEMBERS + ' members at most');
    g.members.push({ nick, at: now(), by: null });
    log({ type: 'joined', id: g.id, nick, how: g.join });
    write();
    return { status: 'member', group: pub(g) };
  }
  function leave(id, account) {
    const g = must(id);
    const nick = account.nick;
    const was = has(g.members, nick) || has(g.requests, nick);
    g.members = g.members.filter((m) => low(m.nick) !== low(nick));
    g.requests = g.requests.filter((r) => low(r.nick) !== low(nick));
    if (was) { log({ type: 'left', id: g.id, nick }); write(); }
    return { status: 'out', group: pub(g) };
  }

  // ── for the conditions and the pages ──
  const groupsOf = (nick) => read().groups.filter((g) => has(g.members, nick)).map((g) => g.id);
  const namesOf = (nick) => read().groups.filter((g) => has(g.members, nick)).map((g) => ({ id: g.id, name: g.name }));
  const nameOf = (id) => { const g = byId(id); return g ? g.name : null; };

  return { list, create, update, remove, addMember, removeMember, approve: (id, nick, by) => answer(id, nick, true, by), decline: (id, nick, by) => answer(id, nick, false, by),
    publicList, mine, join, leave, groupsOf, namesOf, nameOf, exists: (id) => !!byId(id), clear: () => { db = null; } };
}
