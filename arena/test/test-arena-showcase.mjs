#!/usr/bin/env node
// Tests of the home page, a showcase (service 0.31.0): the sections the super
// admin turns on and orders; the tables live on a LAN server (its lobby read
// once a minute at most, a private table without its name); this site's
// tournaments and results (public only); the community events from the
// web client's relay (only *.pokerth.net links); the WEC game of every
// evening; the hero picture served by the Arena.
// Run: node arena/test/test-arena-showcase.mjs
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';
import { wecDaily } from '../lib/showcase.mjs';
import { allowed } from '../lib/accounts.mjs';
import { fakeServer, msg, S, gameInfo } from './lib/arena-fake-server.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// 22:00 in Berlin: 20:00 UTC in summer time, 21:00 in winter time.
const wd = wecDaily(Date.parse('2026-10-24T12:00:00Z'));
ok(new Date(wd[0]).toISOString() === '2026-10-24T20:00:00.000Z' && new Date(wd[1]).toISOString() === '2026-10-25T21:00:00.000Z', 'the WEC game: 22:00 Berlin, summer and winter time');

// A LAN lobby: one started table, one private table waiting.
let lobbyReads = 0;
const lan = await fakeServer((conn) => {
  lobbyReads++;
  conn.onMsg = (m) => {
    if (m.initMessage) {
      conn.sock.write(S.initAck());
      conn.sock.write(msg(0, 'gameListNewMessage', { gameId: 7, gameMode: 2, isPrivate: false, playerIds: [11, 12, 13], adminPlayerId: 11, gameInfo }));
      conn.sock.write(msg(0, 'gameListNewMessage', { gameId: 8, gameMode: 1, isPrivate: true, playerIds: [14], adminPlayerId: 14, gameInfo: Object.assign({}, gameInfo, { gameName: 'Secret room' }) }));
    }
  };
  conn.sock.write(S.announce());
});
const EVENTS = { ok: true, upcoming: [
  { src: 'bbc', kind: 'step', step: 2, at: Date.now() + 3600000, signups: 4, seats: 10, url: 'https://bbc.pokerth.net/registration' },
  { src: 'mc', kind: 'cup', month: 11, at: Date.now() + 7 * 86400000, signups: 12, url: 'https://evil.example/' },
], results: [{ src: 'bbc', at: Date.now() - 86400000, podium: ['Ann', 'Ben', 'Cid'], url: 'https://bbc.pokerth.net/results' }],
  champions: { top: [{ player: 'Zed', score: 12.5 }], url: 'https://www.pokerth.net/x' } };
let eventsAsked = 0;

const dir = mkdtempSync(join(tmpdir(), 'arena-showcase-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const servers = [{ ref: 'lan:club', kind: 'lan', name: 'Club', host: '127.0.0.1', port: lan.port }];
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.321', sweepMs: 600000, servers: async () => servers, events: async () => { eventsAsked++; return EVENTS; } });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const call = async (p, b) => (await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: { Authorization: 'Bearer master', 'Content-Type': 'application/json' }, body: JSON.stringify(b) } : { headers: { Authorization: 'Bearer master' } })).json();
const show = async () => (await fetch(base + '/arena/api/showcase')).json();

const set0 = await call('/showcase');
ok(set0.ok && set0.community === true && set0.sections.map((s) => s.id).join() === 'message,live,tournaments,community,results,cups,groups' && !set0.sections[0].on, 'settings: seven sections, the message off');

const pub = await call('/t/create', { name: 'Open night', profile: 'club', registration: { open: true }, visibility: 'public' });
await call('/t/create', { name: 'Hidden night', profile: 'club', visibility: 'unlisted' });
const sc = await show();
const sec = (id) => sc.sections.find((s) => s.id === id);
ok(sc.ok && sc.sections.map((s) => s.id).join() === 'live,tournaments,community,results,cups,groups', 'the page: the sections on, in order');
const live = sec('live');
ok(live.games.length === 2 && live.games[0].mode === 'started' && live.games[0].name === 'Friday SnG' && live.games[0].players === 3 && live.games[0].server === 'Club', 'live: the started table first, its name, players and server');
ok(live.games[1].private && live.games[1].name === null && !JSON.stringify(sc).includes('Secret room'), 'live: a private table without its name');
ok(live.servers[0].online === 5, 'live: how many are online on the server');
const tours = sec('tournaments');
ok(tours.open.length === 1 && tours.open[0].key === pub.publicKey && !JSON.stringify(sc).includes('Hidden night'), 'tournaments: the public one only');
const com = sec('community');
ok(com.upcoming.some((u) => u.src === 'bbc' && u.step === 2 && u.signups === 4 && u.url === 'https://bbc.pokerth.net/registration'), 'community: the BBC step with its sign-ups');
ok(com.upcoming.some((u) => u.src === 'mc' && u.url === null), 'community: a link elsewhere than *.pokerth.net dropped');
ok(com.upcoming.some((u) => u.src === 'wec' && u.kind === 'daily'), 'community: the WEC game of the evening added');
ok(com.results[0].podium.join() === 'Ann,Ben,Cid' && com.champions.top[0].player === 'Zed', 'community: the last winners, the champions of the day');

// The lobby is read once a minute at most, the events once a minute too.
const reads = lobbyReads, asked = eventsAsked;
await show(); await show();
ok(lobbyReads === reads && eventsAsked === asked, 'the lobby and the events: not read again within the minute');

// The super admin orders and turns sections off; a message.
const bad = await call('/showcase', { sections: [{ id: 'message', on: true }] });
ok(!bad.ok, 'the message on without a word: refused');
const saved = await call('/showcase', { sections: [{ id: 'message', on: true }, { id: 'community', on: true }, { id: 'live', on: false }], message: { title: 'Welcome', text: 'Line one\nLine two' }, max: 4 });
ok(saved.ok && saved.sections[1].id === 'community' && saved.max === 4, 'saved: the new order');
const sc2 = await show();
ok(sc2.sections[0].id === 'message' && sc2.sections[0].title === 'Welcome' && sc2.sections[1].id === 'community' && !sc2.sections.some((s) => s.id === 'live'), 'the page follows: the message first, live gone');

// Only the super admin changes it; every role reads it.
ok(!allowed('organizer', 'POST', '/showcase') && allowed('organizer', 'GET', '/showcase') && allowed('viewer', 'GET', '/showcase') && allowed('admin', 'POST', '/showcase'), 'only the super admin changes the home page');

// The picture behind the titles.
const hero = await fetch(base + '/arena/img/hero.webp');
ok(hero.status === 200 && hero.headers.get('content-type') === 'image/webp', 'the hero picture is served by the Arena');

srv.close(); svc.close(); lan.server.close();
rmSync(dir, { recursive: true, force: true });
if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('all arena-showcase tests passed');
process.exit(0);
