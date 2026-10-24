// ═══════════════════════════════════════════════════════════════════
// Arena — the players this install knows, and their accounts (service
// 0.25.0, 2026-10-24).
//
// A player is a PokerTH nickname. The register keeps the ones that matter:
// those with an account (nickname + password), those an organizer added, and
// those banned. An account claims its nickname for the whole install — the
// case does not matter, « Bob » and « bob » are the same claim — so nobody
// else registers it without signing in; a clash is the organizer's to settle.
//
// Accounts come two ways, as the super admin chooses (`signup`):
//   invite   an organizer creates the account and hands over a link (7 days)
//            where the player chooses his password            (the default)
//   open     anyone creates his own account on /arena, too
// A signed-in player registers, checks in, gets the table password and
// unregisters without his personal code (one is still issued, for the web
// client's witness). Sessions last 30 days.
//
// Banned: a reason, an end (or none), who and when — refused at every
// registration of the install, tournaments and cups.
//
// Stored in ARENA_DIR/players.json (mode 600): passwords as scrypt hashes,
// invitations and sessions as SHA-256 of their token.
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const PLAYER_SESSION_PREFIX = 'ps_';
export const SIGNUP_MODES = Object.freeze(['invite', 'open']);
const INVITE_MS = 7 * 24 * 3600 * 1000;
const SESSION_MS = 30 * 24 * 3600 * 1000;
const MIN_PASSWORD = 8;
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };
const NICK_MAX = 64;
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const token = (prefix) => prefix + crypto.randomBytes(32).toString('base64url');
const low = (s) => String(s || '').toLowerCase();
const cleanText = (s, max) => String(s || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

// A PokerTH nickname as the server takes it: trimmed, 64 bytes at most, the
// first byte printable.
export function playerNick(s) {
  let n = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, '').trim();
  while (Buffer.byteLength(n, 'utf8') > NICK_MAX) n = n.slice(0, -1);
  return n;
}
const nickOk = (n) => Buffer.byteLength(n, 'utf8') >= 2 && /^[\x21-\x7e]/.test(n);

function scrypt(password, salt) {
  return new Promise((resolve, reject) => crypto.scrypt(String(password), salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p }, (e, k) => (e ? reject(e) : resolve(k))));
}

export function createPlayers(o) {
  const file = path.join(o.dir, 'players.json');
  const now = o.now || (() => Date.now());
  const Refusal = o.Refusal || class extends Error {};
  const refuse = (m, code) => { const e = new Refusal(m); if (code) e.code = code; throw e; };
  let db = null;
  function read() {
    if (db) return db;
    try { db = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { db = null; }
    if (!db || !Array.isArray(db.players)) db = { v: 1, signup: 'invite', players: [], sessions: [] };
    if (!Array.isArray(db.sessions)) db.sessions = [];
    if (SIGNUP_MODES.indexOf(db.signup) < 0) db.signup = 'invite';
    return db;
  }
  function write() {
    fs.mkdirSync(o.dir, { recursive: true });
    const tmp = file + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db), { mode: 0o600 });
    fs.renameSync(tmp, file);
  }
  const byId = (id) => read().players.find((p) => p.id === id) || null;
  const byNick = (nick) => { const k = low(playerNick(nick)); return k ? read().players.find((p) => low(p.nick) === k) || null : null; };
  const banActive = (p) => !!(p && p.ban && (!p.ban.until || p.ban.until > now()));
  const accountState = (p) => (!p.account ? null : p.account.disabled ? 'disabled' : p.account.passHash ? 'active' : 'invited');
  function view(p) {
    return { id: p.id, nick: p.nick, account: accountState(p), createdAt: p.createdAt, createdBy: p.createdBy || null,
      lastLoginAt: (p.account && p.account.lastLoginAt) || null, inviteExpires: p.account && !p.account.passHash ? p.account.inviteExpires || null : null,
      ban: banActive(p) ? { reason: p.ban.reason, until: p.ban.until || null, by: p.ban.by, at: p.ban.at } : null, note: p.note || null,
      verified: (p.verified || []).map((v) => ({ server: v.server, at: v.at })) };
  }
  function entry(nick, by) {
    const n = playerNick(nick);
    if (!nickOk(n)) refuse('nickname: 2 to 64 bytes, starting with a plain character', 'badNick');
    let p = byNick(n);
    if (!p) { p = { id: 'p' + crypto.randomBytes(6).toString('hex'), nick: n, createdAt: now(), createdBy: by || null }; read().players.push(p); }
    return p;
  }
  function invite(p) {
    const t = token('pi_');
    p.account = Object.assign(p.account || {}, { passHash: null, salt: null, inviteHash: sha(t), inviteExpires: now() + INVITE_MS });
    return t;
  }
  const dropSessions = (id) => { read().sessions = read().sessions.filter((s) => s.playerId !== id); };

  // ── settings (the super admin) ──
  function settings() { return { signup: read().signup }; }
  function setSettings(patch) {
    const d = read();
    if (patch && patch.signup !== undefined) { if (SIGNUP_MODES.indexOf(patch.signup) < 0) refuse('signup: invite or open'); d.signup = patch.signup; }
    write();
    return settings();
  }

  // ── organizers ──
  function list() { return read().players.map(view).sort((a, b) => a.nick.localeCompare(b.nick)); }
  function get(id) { const p = byId(String(id || '')); if (!p) refuse('unknown player'); return view(p); }
  // A player added by an organizer, with an account (its invitation link) or not.
  function create(input, by) {
    const n = playerNick(input && input.nick);
    const was = byNick(n);
    if (was && was.account && input.account) refuse(was.nick + ' has an account already', 'taken');
    const p = entry(n, by);
    if (input && input.note !== undefined) p.note = cleanText(input.note, 200) || null;
    const t = input && input.account ? invite(p) : null;
    if (t) p.account.createdBy = by || 'organizer';
    write();
    return { player: view(p), invite: t };
  }
  function reinvite(id) {
    const p = byId(String(id || ''));
    if (!p) refuse('unknown player');
    dropSessions(p.id);
    const t = invite(p);
    write();
    return { player: view(p), invite: t };
  }
  function setAccountDisabled(id, off) {
    const p = byId(String(id || ''));
    if (!p || !p.account) refuse('no account');
    p.account.disabled = !!off;
    if (off) dropSessions(p.id);
    write();
    return { player: view(p) };
  }
  function removeAccount(id) {
    const p = byId(String(id || ''));
    if (!p || !p.account) refuse('no account');
    delete p.account;
    dropSessions(p.id);
    write();
    return { player: view(p) };
  }
  function remove(id) {
    const d = read();
    const p = byId(String(id || ''));
    if (!p) refuse('unknown player');
    d.players = d.players.filter((x) => x !== p);
    dropSessions(p.id);
    write();
    return { deleted: p.id, nick: p.nick };
  }
  function setNote(id, note) {
    const p = byId(String(id || ''));
    if (!p) refuse('unknown player');
    p.note = cleanText(note, 200) || null;
    write();
    return { player: view(p) };
  }
  // Banned from every registration of the install: a reason, a number of
  // days (0 or none: until lifted).
  function ban(input, by) {
    const p = input && input.id ? byId(String(input.id)) : entry(input && input.nick, by);
    if (!p) refuse('unknown player');
    const reason = cleanText(input && input.reason, 200);
    if (reason.length < 3) refuse('say why (3 characters at least)');
    const days = Math.max(0, Math.min(3650, parseInt(input && input.days, 10) || 0));
    p.ban = { reason, until: days ? now() + days * 24 * 3600 * 1000 : null, by: by || 'organizer', at: now() };
    write();
    return { player: view(p) };
  }
  function unban(id) {
    const p = byId(String(id || ''));
    if (!p) refuse('unknown player');
    delete p.ban;
    write();
    return { player: view(p) };
  }

  // ── players ──
  const tries = new Map();
  function limited(keys) { const t = now(); return keys.some((k) => { const e = tries.get(k); return e && e.until > t && e.n >= 8; }); }
  function failed(keys) {
    const t = now();
    for (const k of keys) { const e = tries.get(k); if (!e || e.until <= t) tries.set(k, { n: 1, until: t + 15 * 60000 }); else e.n += 1; }
    if (tries.size > 5000) for (const [k, e] of tries) if (e.until <= t) tries.delete(k);
  }
  function checkPassword(password, p) {
    const s = String(password || '');
    if (s.length < MIN_PASSWORD) refuse('password: at least ' + MIN_PASSWORD + ' characters', 'shortPassword');
    if (s.length > 200) refuse('password: 200 characters at most', 'longPassword');
    if (p && low(s) === low(p.nick)) refuse('the password must differ from the nickname', 'passwordIsNick');
  }
  async function setPassword(p, password) {
    p.account.salt = crypto.randomBytes(16).toString('hex');
    p.account.passHash = (await scrypt(password, p.account.salt)).toString('hex');
    p.account.inviteHash = null; p.account.inviteExpires = null;
  }
  function newSession(p, ip) {
    const t = token(PLAYER_SESSION_PREFIX);
    const d = read();
    d.sessions = d.sessions.filter((s) => s.expires > now());
    d.sessions.push({ hash: sha(t), playerId: p.id, created: now(), expires: now() + SESSION_MS, ip: ip ? String(ip).slice(0, 64) : null });
    p.account.lastLoginAt = now();
    write();
    return t;
  }
  const me = (p) => ({ id: p.id, nick: p.nick, since: p.createdAt });
  // His own account, when the super admin opened sign-up.
  async function signup(input, ip) {
    if (read().signup !== 'open') refuse('accounts are made by the organizers here: ask one for an invitation', 'signupClosed');
    const keys = ['ip:' + (ip || '?')];
    if (limited(keys)) refuse('too many attempts: wait a quarter of an hour', 'tooMany');
    failed(keys);   // a sign-up counts as an attempt: a few per address
    const n = playerNick(input && input.nick);
    if (!nickOk(n)) refuse('nickname: 2 to 64 bytes, starting with a plain character', 'badNick');
    const was = byNick(n);
    if (was && was.account) refuse('this nickname has an account: sign in, or ask an organizer', 'nickClaimed');
    if (banActive(was)) refuse('banned: ' + was.ban.reason, 'banned');
    checkPassword(input && input.password, { nick: n });
    const p = entry(n, 'self');
    p.account = { createdBy: 'self', createdAt: now() };
    await setPassword(p, input.password);
    return { token: newSession(p, ip), player: me(p) };
  }
  async function acceptInvite(t, password, ip) {
    const h = sha(String(t || ''));
    const p = read().players.find((x) => x.account && x.account.inviteHash === h);
    if (!p || p.account.disabled || !(p.account.inviteExpires > now())) refuse('this invitation link is not valid any more: ask an organizer for a new one', 'badInvite');
    checkPassword(password, p);
    await setPassword(p, password);
    return { token: newSession(p, ip), player: me(p) };
  }
  async function login(nick, password, ip) {
    const n = low(playerNick(nick));
    const keys = ['ip:' + (ip || '?'), 'nick:' + n];
    if (limited(keys)) refuse('too many attempts: wait a quarter of an hour', 'tooMany');
    const p = byNick(n);
    const salt = p && p.account && p.account.salt ? p.account.salt : 'no-such-account';
    const k = await scrypt(String(password || ''), salt);
    const ok = !!(p && p.account && p.account.passHash && !p.account.disabled && crypto.timingSafeEqual(k, Buffer.from(p.account.passHash, 'hex')));
    if (!ok) { failed(keys); refuse('wrong nickname or password', 'badLogin'); }
    tries.delete('nick:' + n);
    return { token: newSession(p, ip), player: me(p) };
  }
  // The player behind a session token, or null.
  function session(t) {
    if (typeof t !== 'string' || t.indexOf(PLAYER_SESSION_PREFIX) !== 0 || t.length > 80) return null;
    const h = sha(t);
    const s = read().sessions.find((x) => x.hash === h);
    if (!s || s.expires <= now()) return null;
    const p = byId(s.playerId);
    if (!p || !p.account || p.account.disabled || !p.account.passHash) return null;
    return { id: p.id, nick: p.nick };
  }
  function logout(t) {
    const h = sha(String(t || ''));
    const d = read();
    const n = d.sessions.length;
    d.sessions = d.sessions.filter((s) => s.hash !== h);
    if (d.sessions.length !== n) write();
    return { ok: true };
  }
  async function changePassword(t, oldPassword, newPassword) {
    const s = session(t);
    if (!s) refuse('your session has ended: sign in again', 'session');
    const p = byId(s.id);
    const k = await scrypt(String(oldPassword || ''), p.account.salt);
    if (!crypto.timingSafeEqual(k, Buffer.from(p.account.passHash, 'hex'))) refuse('the current password is wrong', 'badPassword');
    checkPassword(newPassword, p);
    await setPassword(p, newPassword);
    write();
    return { ok: true };
  }

  // ── for the registrations (tournaments.mjs, cups.mjs) ──
  // Why this nickname may not register, or null: banned, or claimed by an
  // account the asker is not signed in to.
  function barrier(nick, account) {
    const p = byNick(nick);
    if (!p) return null;
    if (banActive(p)) return { code: 'banned', message: 'banned from this site\'s tournaments: ' + p.ban.reason + (p.ban.until ? ' (until ' + new Date(p.ban.until).toISOString().slice(0, 10) + ')' : ''), reason: p.ban.reason, until: p.ban.until || null };
    if (p.account && p.account.passHash && !p.account.disabled && !(account && account.id === p.id)) return { code: 'nickClaimed', message: 'this nickname has an account: sign in to register it' };
    return null;
  }
  // The nickname proved on a game server (verifier.mjs): kept with the
  // account, one line per server (the latest).
  function addVerification(id, v) {
    const p = byId(String(id || ''));
    if (!p || !p.account) return null;
    p.verified = (p.verified || []).filter((x) => x.ref !== v.ref).concat([{ ref: String(v.ref), server: cleanText(v.server, 80), at: now() }]);
    write();
    return view(p);
  }
  const isVerified = (id) => { const p = byId(String(id || '')); return !!(p && p.verified && p.verified.length); };
  const verifiedOf = (nick) => { const p = byNick(nick); return p && p.account && p.verified ? p.verified.map((v) => ({ server: v.server, at: v.at })) : []; };
  const hasAccount = (nick) => { const p = byNick(nick); return !!(p && p.account && p.account.passHash && !p.account.disabled); };
  const banOf = (nick) => { const p = byNick(nick); return banActive(p) ? { reason: p.ban.reason, until: p.ban.until || null } : null; };

  return { settings, setSettings, list, get, create, reinvite, setAccountDisabled, removeAccount, remove, setNote, ban, unban,
    signup, acceptInvite, login, session, logout, changePassword, barrier, hasAccount, banOf, addVerification, isVerified, verifiedOf, clear: () => { db = null; } };
}
