#!/usr/bin/env node
// Tests of a nickname proved on a game server (service 0.28.0): a signed-in
// player asks for a code for a LAN server of this install; a bot waits in its
// lobby; the code sent by the player of that nickname (lobby chat or private
// message) marks the account verified on that server; the same code from
// another nickname does nothing; a server with accounts is not used; the
// condition « verified » on a tournament.
// Run: node arena/test/test-arena-verify.mjs
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';
import { fakeServer, msg } from './lib/arena-fake-server.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = await fn(); if (v) return v; await wait(50); } return null; }

// A LAN lobby with Alice (21) and Mallory (22); `say` sends a chat line from one of them.
const NAMES = { 21: 'Alice', 22: 'Mallory' };
const state = { conns: [], pms: [] };
const lan = await fakeServer((conn) => {
  state.conns.push(conn);
  const w = (b) => conn.sock.write(b);
  conn.onMsg = (m) => {
    if (m.initMessage) { state.initNick = m.initMessage.nickName; w(msg(0, 'initAckMessage', { yourSessionId: Buffer.alloc(16, 1), yourPlayerId: 99 })); for (const id of [21, 22]) w(msg(0, 'playerListMessage', { playerId: id, playerListNotification: 0 })); }
    if (m.playerInfoRequestMessage) for (const id of m.playerInfoRequestMessage.playerId) if (NAMES[id]) w(msg(0, 'playerInfoReplyMessage', { playerId: id, playerInfoData: { playerName: NAMES[id], isHuman: true, playerRights: 1 } }));
    if (m.chatRequestMessage && m.chatRequestMessage.targetPlayerId) state.pms.push(m.chatRequestMessage);
  };
  conn.say = (id, text, priv) => w(msg(0, 'chatMessage', { playerId: id, chatType: priv ? 4 : 0, chatText: text }));
  w(msg(0, 'announceMessage', { protocolVersion: { majorVersion: 5, minorVersion: 1 }, latestGameVersion: { majorVersion: 2, minorVersion: 1 }, latestBetaRevision: 0, serverType: 0, numPlayersOnServer: 2 }));
});
const auth = await fakeServer((conn) => {
  conn.onMsg = () => {};
  conn.sock.write(msg(0, 'announceMessage', { protocolVersion: { majorVersion: 5, minorVersion: 1 }, latestGameVersion: { majorVersion: 2, minorVersion: 1 }, latestBetaRevision: 0, serverType: 2, numPlayersOnServer: 2 }));
});

const dir = mkdtempSync(join(tmpdir(), 'arena-verify-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const servers = [{ ref: 'lan:club', kind: 'lan', name: 'Club', host: '127.0.0.1', port: lan.port }, { ref: 'lan:acc', kind: 'lan', name: 'Accounts', host: '127.0.0.1', port: auth.port }];
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.320', sweepMs: 600000, servers: async () => servers });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
let ipn = 1;
const call = async (p, b) => (await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: { Authorization: 'Bearer master', 'Content-Type': 'application/json' }, body: JSON.stringify(b) } : { headers: { Authorization: 'Bearer master' } })).json();
const api = async (p, b) => { const r = await fetch(base + '/arena/api' + p, b ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': '198.51.100.' + (ipn++ % 250) }, body: JSON.stringify(b) } : {}); const d = await r.json(); d.http = r.status; return d; };

await call('/players/settings', { signup: 'open' });
const sA = (await api('/players/signup', { nick: 'alice', password: 'alice pass 1' })).token;
const pl = await api('/players');
ok(pl.servers.length === 2 && pl.servers[0].name === 'Club' && pl.servers[0].port === lan.port, 'the servers a nickname can be proved on');
ok((await api('/players/verify', { session: 'ps_x', ref: 'lan:club' })).http === 401, 'not signed in: no code');
const rq = await api('/players/verify', { session: sA, ref: 'lan:club' });
ok(rq.ok && /^[A-Z2-9]{6}$/.test(rq.code) && rq.server === 'Club' && /^TD-check-/.test(rq.bot), 'a code for the Club server, and the bot\'s name');
const conn = await until(() => state.conns[0] && state.initNick, 3000) && state.conns[0];
ok(!!conn && /^TD-check-/.test(state.initNick), 'the bot is in the lobby');
await wait(150);
conn.say(22, 'here: ' + rq.code);
await wait(200);
ok(!(await api('/players/verifystatus', { session: sA })).verified.length, 'the code from Mallory: nothing');
conn.say(21, rq.code.toLowerCase(), true);
const st = await until(async () => { const s = await api('/players/verifystatus', { session: sA }); return s.verified.length ? s : null; }, 3000);
ok(st && st.verified[0].server === 'Club' && st.pending.done, 'the code from Alice (any case, private message): verified on Club');
ok(state.pms.some((p) => p.targetPlayerId === 21 && /verified/.test(p.chatText)), 'the bot thanks her privately');
ok((await api('/players/alice')).verified[0].server === 'Club', 'the players\' page says it');
ok((await call('/players')).players.find((p) => p.nick === 'alice').verified.length === 1, 'the organizer sees it');
svc.manager.verifier.tick();
await wait(100);
ok(!svc.manager.verifier.pendingCount() || svc.manager.verifier.status({ id: 'x' }) === null, 'nothing waiting: the bot leaves');

// A server with accounts: not used.
const rq2 = await api('/players/verify', { session: sA, ref: 'lan:acc' });
await wait(300);
const st2 = await api('/players/verifystatus', { session: sA });
ok(rq2.ok && st2.pending && /accounts/.test(st2.pending.error || ''), 'a server with accounts: the bot does not log in there, and says why');
ok((await api('/players/verify', { session: sA, ref: 'lan:gone' })).code === 'unknownServer', 'an unknown server: refused');

// The condition « verified ».
const sB = (await api('/players/signup', { nick: 'Bob', password: 'bob pass 12' })).token;
const t = await call('/t/create', { name: 'Verified only', profile: 'club', access: { identity: 'verified' } });
ok((await api('/t/' + t.publicKey + '/register', { session: sB })).missing[0].code === 'verified', 'verified only: Bob (account, not verified) refused');
ok((await api('/t/' + t.publicKey + '/register', { session: sA })).ok, 'verified only: alice registered');

srv.close(); svc.close(); lan.server.close(); auth.server.close();
rmSync(dir, { recursive: true, force: true });
if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('all arena-verify tests passed');
process.exit(0);
