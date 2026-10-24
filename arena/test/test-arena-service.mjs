#!/usr/bin/env node
// Tests of the tournament director service (arena/lib/manager.mjs,
// arena/server.mjs): install key, lobby listing, a watch run in its own
// detached process until the sealed result, stop, refusal of servers with
// accounts, a killed worker; then the service run on its own over HTTP (auth,
// page, files). Uses the scripted fake PokerTH server on localhost.
// Run: node arena/test/test-arena-service.mjs
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createManager } from '../lib/manager.mjs';
import { S, msg, fakeServer, answerNames, wait } from './lib/arena-fake-server.mjs';

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

const dir = mkdtempSync(join(tmpdir(), 'arena-mgr-'));
let port = 0;
const td = createManager({
  dir,
  // Asked each time, as from the web client over IPC.
  servers: async () => [
    { ref: 'local', kind: 'local', name: 'Fake', host: '127.0.0.1', port, tls: false, pins: [] },
    { ref: 'srv:inet', kind: 'registry', name: 'Internet server', host: '127.0.0.1', port, tls: false, pins: [] },
  ],
  clientVersion: () => '2.1.10-web.292',
});

// ── key ────────────────────────────────────────────────────────────
const key = td.keyInfo();
ok(key && Buffer.from(key.publicKeyRaw, 'base64').length === 32, 'the service creates the install key');
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
  ok((await td.servers()).map((x) => x.ref).join(',') === 'local', 'LAN only: the Internet-mode registry is not offered');
  ok((await td.lobby('srv:inet')).error === 'unknown server' && (await td.start({ ref: 'srv:inet', gameId: 7 })).error === 'unknown server', 'LAN only: a registry server can be neither read nor watched');

  // ── a full watch in its own process ──
  ok((await td.start({ ref: 'local', gameId: 7, nick: 'bad name!' })).ok === false, 'watch: director name checked');
  ok((await td.start({ ref: 'elsewhere', gameId: 7 })).error === 'unknown server', 'watch: free addresses refused');
  const s = await td.start({ ref: 'local', gameId: 7, gameName: 'Friday SnG' });
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
  const s = await td.start({ ref: 'local', gameId: 7 });
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
  ok(r.ok && r.serverType === 'internetAuth' && r.watchable === false && r.refusal === 'authServer', 'server with accounts: read, never watchable');
  const s = await td.start({ ref: 'local', gameId: 7 });
  const failed = await until(async () => { const d = await td.detail(s.id); return d && d.state.status === 'failed' ? d : null; }, 10000);
  ok(failed && failed.state.error.code === 'authServerRefused', 'server with accounts: the worker itself refuses it');
  ok(failed && /\[arena-worker\] started/.test(failed.processLog || ''), 'a failed watch shows its process output');
  f.server.close();
}

// ── a worker killed outright ───────────────────────────────────────
{
  const f = await scriptedServer({ ending: false });
  port = f.port;
  const s = await td.start({ ref: 'local', gameId: 7 });
  const running = await until(async () => { const d = await td.detail(s.id); return d && d.state.status === 'running' ? d : null; }, 10000);
  ok(!!running, 'kill: watch running');
  try { process.kill(running.state.pid, 'SIGKILL'); } catch (e) {}
  const crashed = await until(async () => { const d = await td.detail(s.id); return d && d.state.status === 'crashed' ? d : null; }, 10000);
  ok(!!crashed && /\[arena-worker\] started, node /.test(crashed.processLog || ''), 'kill: reported as crashed, with its process output');
  ok(crashed && crashed.checks && crashed.checks.chain, 'kill: the journal written so far is intact');
  ok(crashed && /\[manager\] .*spawning /.test(crashed.processLog) && /worker exited, code null, signal SIGKILL/.test(crashed.processLog), 'kill: the manager logged the start and the signal that ended it');
  ok(crashed && /\[arena-worker\] task \w+ received: 127\.0\.0\.1:\d+ game 7/.test(crashed.processLog), 'kill: the worker logged the task it got');
  f.server.close();
}

// ── the service on its own, over HTTP ─────────────────────────────
{
  const f = await scriptedServer();
  const entry = join(dirname(fileURLToPath(import.meta.url)), '..', 'server.mjs');
  const env = Object.assign({}, process.env, { ARENA_DIR: dir, ARENA_ADMIN_TOKEN: 'master', ARENA_PORT: '0',
    ARENA_SERVERS: JSON.stringify([{ ref: 'local', kind: 'local', name: 'Fake', host: '127.0.0.1', port: f.port }]) });
  const noTok = spawn(process.execPath, [entry], { env: Object.assign({}, env, { ARENA_ADMIN_TOKEN: '' }), stdio: 'ignore' });
  ok(await new Promise((r) => noTok.on('exit', (c) => r(c === 2))), 'service: refuses to start with neither secret nor token');
  const svc = spawn(process.execPath, [entry], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '';
  svc.stdout.on('data', (d) => { out += d; }); svc.stderr.on('data', (d) => { out += d; });
  const m = await until(async () => /http:\/\/127\.0\.0\.1:(\d+)/.exec(out), 8000);
  ok(!!m && /arena 0\.\d+\.\d+/.test(out), 'service: listens on 127.0.0.1 and says its version');
  const base = 'http://127.0.0.1:' + (m && m[1]);
  const H = { Authorization: 'Bearer master' };
  ok((await fetch(base + '/admin/arena/watches')).status === 403, 'http: no token → 403');
  ok((await fetch(base + '/admin/arena/watches', { headers: { 'X-TD-Secret': 'guess', 'X-TD-Author': 'mallory' } })).status === 403, 'http: a wrong secret → 403');
  const st = await (await fetch(base + '/admin/arena/status', { headers: H })).json();
  ok(st.ok && st.key.publicKeyRaw === key.publicKeyRaw && st.maxRunning === 4, 'http: status, same install key');
  ok((await (await fetch(base + '/admin/arena/watches', { headers: H })).json()).watches.length === 4, 'http: past watches listed');
  const srv = await (await fetch(base + '/admin/arena/servers', { headers: H })).json();
  ok(srv.servers.length === 1 && srv.servers[0].ref === 'local', 'http: servers from ARENA_SERVERS');
  const lob = await (await fetch(base + '/admin/arena/lobby', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, H), body: '{"ref":"local"}' })).json();
  ok(lob.ok && lob.games.length === 1, 'http: lobby read');
  const page = await fetch(base + '/arena/organize');
  const html = await page.text();
  ok(page.status === 200 && /Arena — organizer/.test(html) && !/__TD_VERSION__/.test(html) && /0\.\d+\.\d+/.test(html), 'page: served with the version filled in');
  ok((await fetch(base + '/arena/organizer.mjs')).status === 200 && (await fetch(base + '/arena/manifest.json')).status === 200, 'page: its files');
  ok((await fetch(base + '/arena/server.mjs')).status === 404 && (await fetch(base + '/arena/..%2Flib%2Fmanager.mjs')).status === 404, 'page: nothing else');
  svc.kill('SIGTERM');
  ok(await new Promise((r) => svc.on('exit', () => r(true))), 'service: stops on SIGTERM');
  f.server.close();
}

rmSync(dir, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAILED` : '\nall arena-service tests passed');
process.exit(fails ? 1 : 0);
