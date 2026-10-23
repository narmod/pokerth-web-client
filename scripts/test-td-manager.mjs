#!/usr/bin/env node
// Tests of the tournament director manager (server/tournament-manager.js):
// settings off by default, install key, lobby listing, a watch run in its own
// detached process until the sealed result, stop, refusal of servers with
// accounts, and the HTTP routes' auth. Uses the scripted fake PokerTH server
// on localhost. Run: node scripts/test-td-manager.mjs
import { mkdtempSync, rmSync, statSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EventEmitter } from 'node:events';
import { createRequire } from 'node:module';
import { S, msg, fakeServer, answerNames, wait } from './lib/td-fake-server.mjs';

const require = createRequire(import.meta.url);
const { createTournamentManager, handleTournamentAdmin } = require('../server/tournament-manager.js');

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// One fake server: guest logins get the lobby, the director's login gets a
// table. `ending` = false keeps the game running (for the stop test).
function scriptedServer({ ending = true, serverType = 0 } = {}) {
  return fakeServer((conn) => {
    answerNames(conn);
    const announce = serverType ? msg(0, 'announceMessage', { protocolVersion: { majorVersion: 5, minorVersion: 1 }, latestGameVersion: { majorVersion: 2, minorVersion: 1 }, latestBetaRevision: 0, serverType, numPlayersOnServer: 3 }) : S.announce();
    conn.sock.write(announce);
    conn.after = async (m) => {
      if (m.initMessage) conn.sock.write(Buffer.concat([S.initAck(), S.gameList()]));
      if (m.joinExistingGameMessage) {
        conn.sock.write(S.joinAck());
        await wait(30);
        conn.sock.write(Buffer.concat([S.start(), S.hand([0, 0, 0, 0]), S.act(14, 0), S.act(12, 600), S.act(13, 400), S.show([[11, 2000], [14, 0]])]));
        if (!ending) return;
        await wait(30);
        conn.sock.write(Buffer.concat([S.hand([0, 0, 0, 2]), S.act(12, 0), S.act(13, 0), S.hide(11, 4000), S.end(11)]));
      }
    };
  });
}

async function until(fn, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const v = await fn(); if (v) return v; await wait(100); }
  return null;
}

const dir = mkdtempSync(join(tmpdir(), 'td-mgr-'));
let cfg = {};
let port = 0;
const td = createTournamentManager({
  dir,
  getConfig: () => cfg,
  setConfig: (c) => { cfg = c; },
  listServers: () => [{ ref: 'local', kind: 'local', name: 'Fake', host: '127.0.0.1', port, tls: false, pins: [] }],
  version: () => '2.1.10-web.292',
});

// ── settings and key ───────────────────────────────────────────────
ok(td.settings().enabled === false, 'off by default');
ok(td.start({ ref: 'local', gameId: 7 }).error === 'tournaments are off', 'no watch while off');
ok(td.keyInfo() === null, 'no key before the first enable');
td.setSettings({ enabled: true });
const key = td.keyInfo();
ok(key && Buffer.from(key.publicKeyRaw, 'base64').length === 32, 'enabling creates the install key');
ok((statSync(join(dir, 'td-key.pem')).mode & 0o077) === 0, 'key file is private (600)');

// ── lobby ──────────────────────────────────────────────────────────
{
  const f = await scriptedServer();
  port = f.port;
  const r = await td.lobby('local');
  ok(r.ok && r.serverType === 'lan' && r.watchable, 'lobby: reachable LAN server, watchable');
  const g = r.ok && r.games.find((x) => x.name === 'Friday SnG');
  ok(g && g.gameId === 7 && g.players === 4 && g.maxPlayers === 4 && g.allowSpectators, 'lobby: table listed with players and seats');
  ok(f.seen[0].got.some((m) => m.initMessage && m.initMessage.login === 0), 'lobby: read with a guest login');
  ok(!f.seen[0].got.some((m) => m.joinExistingGameMessage), 'lobby: joins nothing');
  ok((await td.lobby('nope')).error === 'unknown server', 'lobby: only servers this install knows');

  // ── a full watch in its own process ──
  ok(td.start({ ref: 'local', gameId: 7, nick: 'bad name!' }).ok === false, 'watch: director name checked');
  ok(td.start({ ref: 'elsewhere', gameId: 7 }).error === 'unknown server', 'watch: free addresses refused');
  const s = td.start({ ref: 'local', gameId: 7, gameName: 'Friday SnG' });
  ok(s.ok && s.id, 'watch: started');
  const done = await until(async () => { const d = await td.detail(s.id); return d && d.state.status === 'finished' ? d : null; }, 15000);
  ok(!!done, 'watch: finished in its own process');
  if (done) {
    ok(done.result.ranking.map((x) => x.name).join(',') === 'Alice,Bob,Carol,Dave' && done.result.status === 'complete', 'watch: sealed ranking');
    ok(done.checks.chain && done.checks.headMatches && done.checks.signature && done.checks.replay, 'watch: chain, head, signature and replay all check out');
    ok(done.checks.signedBy === key.publicKeyRaw, 'watch: signed by the install key');
    ok(td.file(s.id, 'journal') && td.file(s.id, 'result'), 'watch: journal and result downloadable');
    ok(td.file(s.id, '../meta') === null && td.file('../x', 'journal') === null, 'watch: file access limited to its own files');
    ok(td.list().some((w) => w.id === s.id && w.status === 'finished' && w.resultStatus === 'complete'), 'watch: listed as finished');
    const join = f.seen.find((c) => c.got.some((m) => m.joinExistingGameMessage));
    ok(join && join.got.find((m) => m.joinExistingGameMessage).joinExistingGameMessage.spectateOnly === true, 'watch: spectator only');
  }
  f.server.close();
}

// ── stop a running watch ───────────────────────────────────────────
{
  const f = await scriptedServer({ ending: false });
  port = f.port;
  const s = td.start({ ref: 'local', gameId: 7 });
  const running = await until(async () => { const d = await td.detail(s.id); return d && d.state.status === 'running' && d.state.hand === 1 ? d : null; }, 10000);
  ok(!!running && running.state.players.length === 4, 'stop: watch running with live players');
  ok(td.stop(s.id).ok, 'stop: signal sent');
  const stopped = await until(async () => { const d = await td.detail(s.id); return d && d.state.status === 'stopped' ? d : null; }, 8000);
  ok(!!stopped && stopped.checks && stopped.checks.chain, 'stop: stopped, journal kept and intact');
  f.server.close();
}

// ── servers with accounts ──────────────────────────────────────────
{
  const f = await scriptedServer({ serverType: 2 });
  port = f.port;
  const r = await td.lobby('local');
  ok(r.ok && r.serverType === 'internetAuth' && r.watchable === false && r.refusal === 'authServer', 'auth server: listed but not watchable while the option is off');
  const s = td.start({ ref: 'local', gameId: 7 });
  const failed = await until(async () => { const d = await td.detail(s.id); return d && d.state.status === 'failed' ? d : null; }, 10000);
  ok(failed && failed.state.error.code === 'authServerRefused', 'auth server: the worker itself refuses it');
  f.server.close();
}

// ── HTTP routes ────────────────────────────────────────────────────
function call(method, path, { body, token, query = {} } = {}) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method;
    const res = { writeHead(code) { this.code = code; }, end(b) { resolve({ code: this.code, body: (() => { try { return JSON.parse(String(b)); } catch (e) { return String(b); } })() }); } };
    const h = {
      adminAuthed: (q, bt) => (q.token || bt) === 'master',
      adminJson: (r, code, obj) => { r.writeHead(code); r.end(JSON.stringify(obj)); },
      readJsonBody: (rq, cb) => cb(body || {}),
    };
    handleTournamentAdmin(td, h, req, res, path, Object.assign({ token }, query));
  });
}
ok((await call('GET', '/admin/tournaments/settings')).code === 403, 'http: no token → 403');
ok((await call('GET', '/admin/tournaments/settings', { token: 'master' })).body.enabled === true, 'http: settings with the master token');
ok((await call('POST', '/admin/tournaments/watch', { body: { token: 'nope', ref: 'local', gameId: 7 } })).code === 403, 'http: watch needs the master token');
td.setSettings({ enabled: false });
ok((await call('GET', '/admin/tournaments/servers', { token: 'master' })).code === 409, 'http: tools answer 409 while off');
ok((await call('GET', '/admin/tournaments/watches', { token: 'master' })).body.watches.length === 3, 'http: past watches still listed while off');

rmSync(dir, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAILED` : '\nall td-manager tests passed');
process.exit(fails ? 1 : 0);
