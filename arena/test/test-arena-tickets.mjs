#!/usr/bin/env node
// Tests of tickets and seasons (service 0.27.0), after the BBC: kinds of
// tickets with a most per player; a tournament earns its first N a ticket,
// another needs one (one more than the registrations still waiting on it),
// spends it once validated unless the place keeps it; an absent player
// spends nothing; each tournament once; given or taken by hand; a season
// ended by hand or by a tournament: everything from zero, the old one kept.
// Run: node arena/test/test-arena-tickets.mjs
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';
import { cleanTicketRules } from '../lib/tickets.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
ok(cleanTicketRules({}) === null && cleanTicketRules({ need: 'kabc12', keep: [3, '3', 99, 0], earn: { type: 'kdef34', top: 2 }, endsSeason: true }).keep.join() === '3', 'rules cleaned: places out of 1–40 dropped');

const dir = mkdtempSync(join(tmpdir(), 'arena-tickets-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.320', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
let ipn = 1;
const call = async (p, b) => { const r = await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: { Authorization: 'Bearer master', 'Content-Type': 'application/json' }, body: JSON.stringify(b) } : { headers: { Authorization: 'Bearer master' } }); return r.json(); };
const api = async (p, b) => (await fetch(base + '/arena/api' + p, b ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': '198.51.100.' + (ipn++ % 250) }, body: JSON.stringify(b) } : {})).json();
const K = svc.manager.tickets;
const sweep = () => svc.sweep();
const bal = (n, id) => K.balance(n)[id] || 0;

const s2 = (await call('/tickets/type/add', { name: 'Step 2' })).type;
const s3 = (await call('/tickets/type/add', { name: 'Step 3', max: 2 })).type;
ok(s2.max === 10 && s3.max === 2 && !(await call('/tickets/type/add', { name: 'step 2' })).ok, 'kinds of tickets: a most each (10 by default), names unique');

// Step 1: the first 2 earn a Step 2 ticket.
const t1 = await call('/t/create', { name: 'Step 1', profile: 'club', tickets: { earn: { type: s2.id, top: 2 } } });
for (const n of ['Ann', 'Ben', 'Cid', 'Dan']) await call('/t/player', { id: t1.id, nick: n });
await call('/t/result', { id: t1.id, source: 'manual', ranking: ['Ann', 'Ben', 'Cid', 'Dan'] });
sweep(); sweep();
ok(bal('Ann', s2.id) === 1 && bal('ben', s2.id) === 1 && bal('Cid', s2.id) === 0, 'Step 1 validated: Ann and Ben earn a Step 2 ticket, once however many sweeps');

// Step 2 needs one, earns Step 3 for 2, the 3rd keeps his.
const rules2 = { need: s2.id, earn: { type: s3.id, top: 2 }, keep: [3] };
const t2 = await call('/t/create', { name: 'Step 2 a', profile: 'club', tickets: rules2 });
const t2b = await call('/t/create', { name: 'Step 2 b', profile: 'club', tickets: rules2 });
const rc = await api('/t/' + t2.publicKey + '/register', { nick: 'Cid' });
ok(!rc.ok && rc.code === 'access' && rc.missing[0].code === 'ticket' && rc.missing[0].name === 'Step 2' && rc.missing[0].have === 0, 'no ticket: refused, « a Step 2 ticket, you have 0 »');
ok((await api('/t/' + t2.publicKey + '/register', { nick: 'Ann' })).ok, 'Ann (1 ticket): registered');
const twice = await api('/t/' + t2b.publicKey + '/register', { nick: 'Ann' });
ok(!twice.ok && twice.missing[0].pending === 1, 'Ann in a second Step 2 with the same single ticket: refused (one waiting already)');
await call('/tickets/adjust', { nick: 'Cid', type: s2.id, delta: 1, why: 'came second in the replay' });
await call('/tickets/adjust', { nick: 'Dan', type: s2.id, delta: 1 });
await call('/tickets/adjust', { nick: 'Eve', type: s2.id, delta: 1 });
for (const n of ['Ben', 'Cid', 'Dan', 'Eve']) await api('/t/' + t2.publicKey + '/register', { nick: n });
ok(svc.manager.tournaments.get(t2.id).players.length === 5, 'tickets given by hand: everyone registered');
await call('/t/result', { id: t2.id, source: 'manual', ranking: ['Dan', 'Ann', 'Cid', 'Ben'], absent: ['Eve'] });
sweep();
ok(bal('Dan', s2.id) === 0 && bal('Dan', s3.id) === 1 && bal('Ann', s2.id) === 0 && bal('Ann', s3.id) === 1, 'Step 2 validated: the first two spend their Step 2 ticket and earn a Step 3');
ok(bal('Cid', s2.id) === 1 && bal('Cid', s3.id) === 0, 'the 3rd keeps his Step 2 ticket');
ok(bal('Ben', s2.id) === 0, 'the 4th spends it');
ok(bal('Eve', s2.id) === 1, 'Eve, absent, not ranked: keeps it');

// By hand, within the most.
await call('/tickets/adjust', { nick: 'Ann', type: s3.id, delta: 5 });
ok(bal('Ann', s3.id) === 2, 'given by hand: never above the most (2)');
const t3 = await call('/t/create', { name: 'Final', profile: 'club', tickets: { need: s3.id, endsSeason: true } });
ok((await api('/t/' + t3.publicKey + '/register', { nick: 'Dan' })).ok, 'Dan registers for the final with his Step 3 ticket');

// Public: the player's tickets, the tournament's rules.
const pl = await api('/players/Cid');
ok(pl.tickets.length === 1 && pl.tickets[0].name === 'Step 2' && pl.tickets[0].count === 1 && pl.season === 'Season 1', 'players\' page: Cid\'s tickets and the season');
const pg = await api('/t/' + t2b.publicKey);
ok(pg.ticketInfo.need === 'Step 2' && pg.ticketInfo.earn.name === 'Step 3' && pg.ticketInfo.earn.top === 2 && pg.ticketInfo.keep.join() === '3', 'a tournament\'s page: what it needs, what its first earn, who keeps');

// The final ends the season.
for (const n of ['Ann']) await api('/t/' + t3.publicKey + '/register', { nick: n });
await call('/t/result', { id: t3.id, source: 'manual', ranking: ['Ann', 'Dan'] });
sweep();
const L = await call('/tickets');
ok(L.season.name === 'Season 2' && !L.balances.length && L.seasons.length === 1 && L.seasons[0].why && /Final/.test(L.seasons[0].why), 'the final validated: a new season, every ticket from zero, the old one kept with why');
const ns = await call('/tickets/season', { name: 'Winter 2026' });
ok(ns.ok && ns.season.name === 'Winter 2026' && (await call('/tickets')).seasons.length === 2, 'a new season by hand, with its name');
ok((await call('/t/update', { id: t2b.id, patch: { tickets: null } })).tickets === null, 'rules taken off a tournament');

srv.close(); svc.close();
rmSync(dir, { recursive: true, force: true });
if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('all arena-tickets tests passed');
