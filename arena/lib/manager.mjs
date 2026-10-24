// ═══════════════════════════════════════════════════════════════════
// Tournament director service — watches and tournaments (2026-10-23).
//
// « Table check »: the organizer picks a server this install knows (the LAN
// directory or the local server — never a free address, never pokerth.net),
// lists its tables and sends a director to WATCH one. Nothing is created,
// kicked or posted on the game server: the director only spectates.
//
// Each watch runs in its own detached process (worker.mjs) that survives a
// restart of this service and of the web client, and talks back through
// files only: <dir>/watches/<id>/{meta,state,journal,result}.json + worker.log
// The install's Ed25519 key (<dir>/td-key.pem, mode 600) signs results.
//
// Tournaments (manual mode) live in tournaments.mjs, under <dir>/tournaments.
// Design: docs/ARENA.md.
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { listGames } from './lobby.mjs';
import { verifyJournal, verifyPayload, canonical, publicKeyRawB64 } from './journal.mjs';
import { replayJournal, avatarOf } from './spectator.mjs';
import { createImages } from './images.mjs';
import { createTournaments } from './tournaments.mjs';
import { createCups } from './cups.mjs';
import { createBadges } from './badges.mjs';
import { createReset } from './reset.mjs';
import { loadBotStrings, isBotLang } from './botchat.mjs';

export const MAX_RUNNING = 4;
export const LIVE = ['connecting', 'waiting', 'running'];
const NICK_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{2,23}$/;
const ID_RE = /^[a-z0-9]{6,32}$/;
const HERE = path.dirname(fileURLToPath(import.meta.url));

/**
 * deps: { dir, servers: () => Promise<server[]> | server[], clientVersion: () => string }
 * A server: { ref, kind: 'lan'|'local', name, host, port, tls, sni?, noverify?, pins? }
 */
export function createManager(deps) {
  const dir = deps.dir;
  const watchesDir = path.join(dir, 'watches');
  const keyFile = path.join(dir, 'td-key.pem');
  const workerPath = path.join(HERE, 'worker.mjs');

  // ── install key ──────────────────────────────────────────────────
  function ensureKey() {
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(keyFile)) {
      const { privateKey } = crypto.generateKeyPairSync('ed25519');
      fs.writeFileSync(keyFile, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
      try { fs.chmodSync(keyFile, 0o600); } catch (e) {}
    }
  }
  function keyInfo() { return readKeyInfo(keyFile); }

  // ── servers this install knows ───────────────────────────────────
  // LAN only: the LAN directory and the local server.
  async function known() {
    const list = (await deps.servers()) || [];
    return list.filter((s) => s && (s.kind === 'lan' || s.kind === 'local'));
  }
  async function servers() {
    return (await known()).map((s) => ({ ref: s.ref, kind: s.kind, name: s.name, host: s.host, port: s.port, tls: !!s.tls }));
  }
  async function resolve(ref) {
    return (await known()).filter((s) => s.ref === ref)[0] || null;
  }
  function connOpts(s) {
    return { host: s.host, port: s.port, tls: !!s.tls, servername: s.sni || undefined, insecure: !!s.noverify, pins: s.pins || [] };
  }

  async function lobby(ref) {
    const s = await resolve(ref);
    if (!s) return { ok: false, error: 'unknown server' };
    const r = await listGames(Object.assign(connOpts(s), { version: deps.clientVersion() }));
    r.server = { ref: s.ref, name: s.name, host: s.host, port: s.port, tls: !!s.tls };
    if (r.ok && r.serverType === 'internetAuth') { r.watchable = false; r.refusal = 'authServer'; }
    else r.watchable = !!r.ok;
    return r;
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
      nick: w.nick, startedAt: w.startedAt, status: w.state.status, hand: w.state.hand || 0, mode: w.mode || 'watch', tournamentId: w.tournamentId || null,
      resultStatus: w.state.resultStatus || null, updatedAt: w.state.updatedAt || w.startedAt,
    }));
  }
  function running() { return list().filter((w) => LIVE.indexOf(w.status) >= 0); }

  async function start(body) {
    const s = await resolve(body && body.ref);
    if (!s) return { ok: false, error: 'unknown server' };
    const gameId = parseInt(body.gameId, 10);
    if (!(gameId > 0)) return { ok: false, error: 'pick a table' };
    return launch(s, body, { gameId, gameName: String(body.gameName || '').slice(0, 64) }, (nick) => ({
      nick, login: 'unauth', gameId, refuseAuthServer: true, gamePassword: body.gamePassword ? String(body.gamePassword).slice(0, 64) : undefined,
    }));
  }

  // The director OPENS the table of a tournament (host.mjs), then follows it.
  // body: { ref, tournamentId, tableName, table, registered, nick? }
  async function startHost(body) {
    const s = await resolve(body && body.ref);
    if (!s) return { ok: false, error: 'unknown server: pick a LAN server in the tournament' };
    const registered = (body.registered || []).map(String).filter(Boolean);
    if (registered.length < 2) return { ok: false, error: 'at least two players' };
    const chat = await loadBotStrings(body.chatLang);   // the lines of the chat language
    return launch(s, body, { gameId: null, gameName: String(body.tableName || '').slice(0, 64), mode: 'host', tournamentId: body.tournamentId || null }, (nick) => ({
      nick, login: 'unauth', refuseAuthServer: true, tableName: String(body.tableName || ''), table: body.table || {}, registered, announce: body.announce !== false,
      startsAt: Number(body.startsAt) > 0 ? Number(body.startsAt) : null, absence: body.absence || null,
      chat, chatLang: isBotLang(body.chatLang) ? String(body.chatLang).toLowerCase() : 'en',
    }), { mode: 'host', tournamentId: body.tournamentId || null });
  }

  // Organizer command for a host watch: one line in commands.jsonl, read by the worker.
  function command(id, cmd, author, extra) {
    const w = info(id);
    if (!w || w.mode !== 'host') return { ok: false, error: 'unknown table' };
    if (LIVE.indexOf(w.state.status) < 0) return { ok: false, error: 'the director is no longer at the table' };
    fs.appendFileSync(path.join(wdir(id), 'commands.jsonl'), JSON.stringify(Object.assign({ cmd, author: author || null, at: Date.now() }, extra || {})) + '\n');
    return { ok: true };
  }

  // The director's avatar: one of the four robots shipped with the service
  // (public/img/, picked on the organizer page; robot 3 by default). No image
  // of one's own (decided 2026-10-24): a director-avatar.img left in ARENA_DIR
  // by service 0.11–0.15 is ignored. Tables opened afterwards use it.
  const IMG = path.join(HERE, '..', 'public', 'img');
  const AVATAR_PRESETS = { 1: 'director-avatar-1.png', 2: 'director-avatar-2.png', 3: 'director-avatar.png', 4: 'director-avatar-4.png' };
  const AVATAR_DEFAULT_PRESET = 3;
  const avatarChoice = path.join(dir, 'director-avatar.json');
  const isPreset = (n) => Object.prototype.hasOwnProperty.call(AVATAR_PRESETS, String(n));
  function chosenPreset() {
    try { const n = JSON.parse(fs.readFileSync(avatarChoice, 'utf8')).preset; if (isPreset(n)) return Number(n); } catch (e) {}
    return AVATAR_DEFAULT_PRESET;
  }
  function presetBytes(n) {
    if (!isPreset(n)) return null;
    try { const b = fs.readFileSync(path.join(IMG, AVATAR_PRESETS[n])); return avatarOf({ bytes: b }) ? b : null; } catch (e) { return null; }
  }
  function avatarBytes() {
    for (const n of [chosenPreset(), AVATAR_DEFAULT_PRESET]) { const b = presetBytes(n); if (b) return { bytes: b, custom: false, preset: n }; }
    return null;
  }
  function avatarPreset(n) {
    const b = presetBytes(n);
    if (!b) return null;
    const v = avatarOf({ bytes: b });
    return { bytes: b, type: v.type, md5: v.md5.toString('hex') };
  }
  function setAvatarPreset(n) {
    if (!presetBytes(n)) return { ok: false, error: 'no such robot' };
    fs.writeFileSync(avatarChoice, JSON.stringify({ preset: Number(n) }));
    return { ok: true };
  }
  function avatarOpt() { const a = avatarBytes(); return a ? { b64: a.bytes.toString('base64') } : null; }
  function avatar() {
    const a = avatarBytes();
    if (!a) return null;
    const v = avatarOf({ bytes: a.bytes });
    return { bytes: a.bytes, type: v.type, custom: a.custom, preset: a.preset, size: a.bytes.length, md5: v.md5.toString('hex') };
  }
  function resetAvatar() { try { fs.unlinkSync(avatarChoice); } catch (e) {} return { ok: true }; }

  function launch(s, body, metaExtra, optsFor, taskExtra) {
    if (running().length >= MAX_RUNNING) return { ok: false, error: 'at most ' + MAX_RUNNING + ' directors at once' };
    let nick = String(body.nick || '').trim();
    if (!nick) nick = (taskExtra && taskExtra.mode === 'host' ? 'TD-' : 'TD-test-') + crypto.randomBytes(3).toString('hex');
    if (!NICK_RE.test(nick)) return { ok: false, error: 'director name: 3 to 24 letters, digits, - or _' };
    ensureKey();
    const id = Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
    const d = wdir(id);
    fs.mkdirSync(d, { recursive: true });
    const meta = Object.assign({
      id, startedAt: Date.now(), nick,
      server: { ref: s.ref, kind: s.kind, name: s.name, host: s.host, port: s.port, tls: !!s.tls },
    }, metaExtra);
    const logPath = path.join(d, 'worker.log');
    // The manager's own lines in worker.log say whether the process started at
    // all, and how it ended (exit code, signal) while this service runs.
    const mlog = (line) => { try { fs.appendFileSync(logPath, '[manager] ' + new Date().toISOString() + ' ' + line + '\n'); } catch (e) {} };
    mlog('spawning ' + process.execPath + ' ' + workerPath + ' (node ' + process.version + ')');
    const logFd = fs.openSync(logPath, 'a');
    let child;
    try {
      child = spawn(process.execPath, [workerPath], { detached: true, stdio: ['ignore', logFd, logFd, 'ipc'] });
    } catch (e) {
      mlog('spawn failed: ' + e.message);
      return { ok: false, error: 'could not start the director: ' + e.message };
    } finally { try { fs.closeSync(logFd); } catch (e) {} }
    child.on('error', (e) => {
      mlog('process error: ' + ((e && e.code) || '') + ' ' + ((e && e.message) || e));
      try { fs.writeFileSync(path.join(d, 'state.json'), JSON.stringify({ id, status: 'failed', error: { code: 'startFailed', data: { message: String((e && e.message) || e) } }, updatedAt: Date.now(), logs: [] })); } catch (e2) {}
    });
    child.on('exit', (code, signal) => mlog('worker exited, code ' + code + (signal ? ', signal ' + signal : '')));
    if (!child.pid) mlog('no pid: the process did not start');
    meta.pid = child.pid;
    fs.writeFileSync(path.join(d, 'meta.json'), JSON.stringify(meta));
    child.send(Object.assign({
      id, dir: d, keyFile, version: deps.clientVersion(),
      opts: Object.assign(connOpts(s), { avatar: avatarOpt() }, optsFor(nick)),
    }, taskExtra || {}));
    child.unref();
    // The worker closes the IPC channel itself once it has the task.
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
    if (!w) return null;
    const sealed = readJson(path.join(wdir(id), 'result.json'));
    const journal = readJson(path.join(wdir(id), 'journal.json'));
    const out = Object.assign({}, w, { result: sealed ? sealed.payload.result : null, head: sealed ? sealed.payload.head : null,
      entries: journal && journal.entries ? journal.entries.length : 0 });
    // A watch that ended badly shows the end of its process output (worker.log):
    // a stack trace there says why it stopped.
    if (w.state.status === 'crashed' || w.state.status === 'failed') out.processLog = logTail(id);
    if (!journal || !journal.entries) return out;
    const chain = verifyJournal(journal.entries);
    out.checks = { chain: chain.ok, badSeq: chain.badSeq };
    if (sealed) {
      out.checks.headMatches = chain.ok && sealed.payload.head === chain.head && sealed.payload.entries === journal.entries.length;
      out.checks.signature = !!(sealed.signature && sealed.publicKeyPem && verifyPayload(sealed.payload, sealed.signature, sealed.publicKeyPem));
      out.checks.replay = canonical(replayJournal(journal.entries)) === canonical(sealed.payload.result);
      out.checks.signedBy = sealed.publicKeyPem ? publicKeyRawB64(sealed.publicKeyPem) : null;
    }
    return out;
  }

  function logTail(id) {
    try {
      const p = path.join(wdir(id), 'worker.log');
      const size = fs.statSync(p).size, len = Math.min(size, 4000);
      const fd = fs.openSync(p, 'r'), buf = Buffer.alloc(len);
      try { fs.readSync(fd, buf, 0, len, size - len); } finally { fs.closeSync(fd); }
      return buf.toString('utf8');
    } catch (e) { return ''; }
  }

  function file(id, which) {
    if (!ID_RE.test(String(id || '')) || (which !== 'journal' && which !== 'result')) return null;
    try { return fs.readFileSync(path.join(wdir(id), which + '.json')); } catch (e) { return null; }
  }

  // ── tournaments, manual mode (tournaments.mjs) ──
  ensureKey();
  // Images of tournaments and cups: the shipped ones and the organizers' (images.mjs).
  const images = createImages({ dir, builtinDir: path.join(IMG, 'events') });
  const tournaments = createTournaments({
    dir, keyFile, imageOk: images.has,
    // A Table check's sealed result, reused as a tournament result.
    readWatch: (id) => (ID_RE.test(id) ? readJson(path.join(wdir(id), 'result.json')) : null),
    readWatchJournal: (id) => (ID_RE.test(id) ? readJson(path.join(wdir(id), 'journal.json')) : null),
  });

  // Cups: tournaments of this install gathered (points, stages).
  const cups = createCups({ dir, keyFile, tournaments, Refusal: tournaments.Refusal, imageOk: images.has });
  // Medals: the first three of tournaments and cups, from the signed results.
  const badges = createBadges({ tournaments: tournaments.allRaw, cups: cups.allRaw, stamp: () => reset.count() + ':' + tournaments.generation() + ':' + cups.generation() });
  // Start again from zero (the super admin): reset.mjs.
  const reset = createReset({ dir, watches: list, live: LIVE, tournaments: tournaments.allRaw, cups: cups.allRaw, Refusal: tournaments.Refusal });

  return { keyInfo, servers, lobby, start, startHost, command, stop, list, running, info, detail, file, tournaments, cups, badges, images, reset, avatar, resetAvatar, avatarPreset, setAvatarPreset, avatarPresets: () => Object.keys(AVATAR_PRESETS).map(Number), avatarDefaultPreset: AVATAR_DEFAULT_PRESET, MAX_RUNNING };
}

/** Public part of the install key, read from its PEM file (null if none yet). */
export function readKeyInfo(keyFile) {
  try {
    const pub = crypto.createPublicKey(crypto.createPrivateKey(fs.readFileSync(keyFile, 'utf8')));
    const der = pub.export({ type: 'spki', format: 'der' });
    return {
      publicKeyRaw: Buffer.from(der.subarray(der.length - 32)).toString('base64'),
      publicKeyPem: pub.export({ type: 'spki', format: 'pem' }),
      created: fs.statSync(keyFile).mtimeMs,
    };
  } catch (e) { return null; }
}
