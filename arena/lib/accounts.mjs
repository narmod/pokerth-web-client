// ═══════════════════════════════════════════════════════════════════
// Arena — organizer accounts (service 0.21.0, 2026-10-24).
//
// The super admin (the web client's master key) creates an account with a
// login, a display name and a role; the organizer gets a one-time invitation
// link (7 days) and chooses a password there. Then he signs in on
// /arena/organize with login + password and gets a session (30 days).
//
// Roles (decided 2026-10-24) — the master key is the super admin, above all:
//   organizer  creates and runs tournaments and cups, validates, corrects
//   referee    validates, proposes / approves / rejects corrections, runs the
//              collusion check — creates nothing
//   viewer     reads everything on the organizer side, changes nothing
// The journals record the account's display name with every action.
//
// Stored in ARENA_DIR/accounts.json (mode 600): passwords as scrypt hashes,
// invitations and sessions as SHA-256 of their token (a stolen file gives
// neither a password nor a usable session). Sign-in attempts are limited per
// address and per login.
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const ROLES = Object.freeze(['organizer', 'referee', 'viewer']);
export const SESSION_PREFIX = 'as_';
const LOGIN_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;
const RESERVED = /^(admin|director|scheduler|witness|witnesses|player|cup|system|org:.*)$/i;
const INVITE_MS = 7 * 24 * 3600 * 1000;
const SESSION_MS = 30 * 24 * 3600 * 1000;
const MIN_PASSWORD = 10;
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const token = (prefix) => (prefix || '') + crypto.randomBytes(32).toString('base64url');
const cleanName = (s) => String(s || '').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 48);

function scrypt(password, salt) {
  return new Promise((resolve, reject) => crypto.scrypt(String(password), salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p }, (e, k) => (e ? reject(e) : resolve(k))));
}

export function createAccounts(o) {
  const file = path.join(o.dir, 'accounts.json');
  const now = o.now || (() => Date.now());
  const Refusal = o.Refusal || class extends Error {};
  const refuse = (m, code) => { const e = new Refusal(m); if (code) e.code = code; throw e; };
  let db = null;
  function read() {
    if (db) return db;
    try { db = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { db = null; }
    if (!db || !Array.isArray(db.accounts)) db = { accounts: [], sessions: [] };
    if (!Array.isArray(db.sessions)) db.sessions = [];
    return db;
  }
  function write() {
    fs.mkdirSync(o.dir, { recursive: true });
    const tmp = file + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db), { mode: 0o600 });
    fs.renameSync(tmp, file);
  }
  const byId = (id) => read().accounts.find((a) => a.id === id);
  function view(a) {
    return { id: a.id, login: a.login, name: a.name, role: a.role, status: a.disabled ? 'disabled' : a.passHash ? 'active' : 'invited',
      createdAt: a.createdAt, createdBy: a.createdBy || null, lastLoginAt: a.lastLoginAt || null, inviteExpires: a.passHash ? null : a.inviteExpires || null };
  }
  function invite(a) {
    const t = token('ai_');
    a.inviteHash = sha(t); a.inviteExpires = now() + INVITE_MS;
    return t;
  }
  const dropSessions = (id) => { read().sessions = read().sessions.filter((s) => s.accountId !== id); };

  // ── super admin ──
  function list() { return read().accounts.map(view); }
  function create(input, by) {
    const login = String((input && input.login) || '').trim().toLowerCase();
    const name = cleanName(input && input.name) || login;
    const role = ROLES.indexOf(input && input.role) >= 0 ? input.role : 'organizer';
    if (!LOGIN_RE.test(login)) refuse('login: 3 to 32 lowercase letters, digits, . _ or -');
    if (name.length < 2) refuse('name: 2 to 48 characters');
    if (RESERVED.test(login) || RESERVED.test(name)) refuse('this name is kept for the Arena itself');
    const d = read();
    if (d.accounts.some((a) => a.login === login)) refuse('this login is taken');
    if (d.accounts.some((a) => a.name.toLowerCase() === name.toLowerCase())) refuse('this name is taken');
    const a = { id: 'u' + crypto.randomBytes(6).toString('hex'), login, name, role, passHash: null, salt: null, createdAt: now(), createdBy: by || 'admin' };
    const t = invite(a);
    d.accounts.push(a);
    write();
    return { account: view(a), invite: t };
  }
  function update(id, patch, by) {
    const a = byId(String(id || ''));
    if (!a) refuse('unknown account');
    patch = patch || {};
    if (patch.role !== undefined) { if (ROLES.indexOf(patch.role) < 0) refuse('unknown role'); a.role = patch.role; }
    if (patch.name !== undefined) {
      const name = cleanName(patch.name);
      if (name.length < 2) refuse('name: 2 to 48 characters');
      if (RESERVED.test(name)) refuse('this name is kept for the Arena itself');
      if (read().accounts.some((x) => x !== a && x.name.toLowerCase() === name.toLowerCase())) refuse('this name is taken');
      a.name = name;
    }
    if (patch.disabled !== undefined) { a.disabled = !!patch.disabled; if (a.disabled) dropSessions(a.id); }
    a.updatedAt = now(); a.updatedBy = by || 'admin';
    write();
    return { account: view(a) };
  }
  // A new invitation link: the password is cleared, the sessions end.
  function reinvite(id) {
    const a = byId(String(id || ''));
    if (!a) refuse('unknown account');
    a.passHash = null; a.salt = null;
    dropSessions(a.id);
    const t = invite(a);
    write();
    return { account: view(a), invite: t };
  }
  function remove(id) {
    const d = read();
    const a = byId(String(id || ''));
    if (!a) refuse('unknown account');
    d.accounts = d.accounts.filter((x) => x !== a);
    dropSessions(a.id);
    write();
    return { deleted: a.id, name: a.name };
  }

  // ── sign-in ──
  const tries = new Map();   // key → { n, until }
  function limited(keys) {
    const t = now();
    return keys.some((k) => { const e = tries.get(k); return e && e.until > t && e.n >= 8; });
  }
  function failed(keys) {
    const t = now();
    for (const k of keys) {
      const e = tries.get(k);
      if (!e || e.until <= t) tries.set(k, { n: 1, until: t + 15 * 60000 });
      else e.n += 1;
    }
    if (tries.size > 5000) for (const [k, e] of tries) if (e.until <= t) tries.delete(k);
  }
  function newSession(a, ip) {
    const t = token(SESSION_PREFIX);
    const d = read();
    d.sessions = d.sessions.filter((s) => s.expires > now());
    d.sessions.push({ hash: sha(t), accountId: a.id, created: now(), expires: now() + SESSION_MS, ip: ip ? String(ip).slice(0, 64) : null });
    a.lastLoginAt = now();
    write();
    return t;
  }
  function checkPassword(password, a) {
    const p = String(password || '');
    if (p.length < MIN_PASSWORD) refuse('password: at least ' + MIN_PASSWORD + ' characters');
    if (p.length > 200) refuse('password: 200 characters at most');
    if (a && (p.toLowerCase() === a.login || p.toLowerCase() === a.name.toLowerCase())) refuse('the password must differ from the login and the name');
  }
  async function acceptInvite(t, password, ip) {
    const h = sha(String(t || ''));
    const a = read().accounts.find((x) => x.inviteHash && x.inviteHash === h);
    if (!a || a.disabled || !(a.inviteExpires > now())) refuse('this invitation link is not valid any more: ask the admin for a new one', 'badInvite');
    checkPassword(password, a);
    a.salt = crypto.randomBytes(16).toString('hex');
    a.passHash = (await scrypt(password, a.salt)).toString('hex');
    a.inviteHash = null; a.inviteExpires = null;
    return { token: newSession(a, ip), account: view(a) };
  }
  async function login(loginName, password, ip) {
    const l = String(loginName || '').trim().toLowerCase().slice(0, 64);
    const keys = ['ip:' + (ip || '?'), 'login:' + l];
    if (limited(keys)) refuse('too many attempts: wait a quarter of an hour', 'tooMany');
    const a = read().accounts.find((x) => x.login === l);
    // The same work whether the login exists or not.
    const salt = a && a.salt ? a.salt : 'no-such-account';
    const k = await scrypt(String(password || ''), salt);
    const ok = !!(a && a.passHash && !a.disabled && crypto.timingSafeEqual(k, Buffer.from(a.passHash, 'hex')));
    if (!ok) { failed(keys); refuse('wrong login or password', 'badLogin'); }
    tries.delete('login:' + l);
    return { token: newSession(a, ip), account: view(a) };
  }
  // The account behind a session token, or null.
  function session(t) {
    if (typeof t !== 'string' || t.indexOf(SESSION_PREFIX) !== 0 || t.length > 80) return null;
    const h = sha(t);
    const s = read().sessions.find((x) => x.hash === h);
    if (!s || s.expires <= now()) return null;
    const a = byId(s.accountId);
    if (!a || a.disabled || !a.passHash) return null;
    return { id: a.id, login: a.login, name: a.name, role: a.role };
  }
  function logout(t) {
    const h = sha(String(t || ''));
    const d = read();
    const n = d.sessions.length;
    d.sessions = d.sessions.filter((s) => s.hash !== h);
    if (d.sessions.length !== n) write();
    return { ok: true };
  }
  async function changePassword(accountId, oldPassword, newPassword) {
    const a = byId(accountId);
    if (!a || !a.passHash) refuse('unknown account');
    const k = await scrypt(String(oldPassword || ''), a.salt);
    if (!crypto.timingSafeEqual(k, Buffer.from(a.passHash, 'hex'))) refuse('the current password is wrong');
    checkPassword(newPassword, a);
    a.salt = crypto.randomBytes(16).toString('hex');
    a.passHash = (await scrypt(newPassword, a.salt)).toString('hex');
    write();
    return { ok: true };
  }
  return { list, create, update, reinvite, remove, acceptInvite, login, session, logout, changePassword, clear: () => { db = null; } };
}

// What each role may do on the organizer side (the master key: everything).
// GET: every role reads (not the reset summary). POST: the referee validates and handles corrections
// and the collusion check; the organizer does everything else but accounts,
// module settings and deletions, which are the super admin's.
const REFEREE_POSTS = ['/t/validate', '/t/correct', '/t/correct/approve', '/t/correct/reject', '/t/collusion'];
const ADMIN_ONLY = ['/t/delete', '/cups/delete', '/players/settings'];
export function allowed(role, method, sub) {
  if (role === 'admin') return true;
  if (sub === '/accounts' || sub.indexOf('/accounts/') === 0) return false;
  if (sub === '/me/password') return true;
  if (sub === '/reset' || sub.indexOf('/reset/') === 0) return false;   // starting again from zero
  if (method === 'GET') return ROLES.indexOf(role) >= 0;
  if (ADMIN_ONLY.indexOf(sub) >= 0) return false;
  if (role === 'organizer') return true;
  if (role === 'referee') return REFEREE_POSTS.indexOf(sub) >= 0;
  return false;
}
