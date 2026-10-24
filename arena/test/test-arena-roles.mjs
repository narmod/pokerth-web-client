#!/usr/bin/env node
// Tests of one account for everything (service 0.33.0): the super admin gives
// a role to a player account; that player's session (ps_…) opens the
// organizer side with the rights of his role, his nickname in the journals;
// without a role it is refused; the role goes with the account; organizers
// cannot give roles; the organizer accounts (as_…) still work.
// Run: node arena/test/test-arena-roles.mjs
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

const dir = mkdtempSync(join(tmpdir(), 'arena-roles-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.322', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
let ipn = 1;
const as = (tok) => async (p, b) => { const r = await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify(b) } : { headers: { Authorization: 'Bearer ' + tok } }); const d = await r.json(); d.http = r.status; return d; };
const admin = as('master');
const api = async (p, b) => { const r = await fetch(base + '/arena/api' + p, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': '198.51.100.' + (ipn++ % 250) }, body: JSON.stringify(b) }); const d = await r.json(); d.http = r.status; return d; };

await admin('/players/settings', { signup: 'open' });
const sOrg = (await api('/players/signup', { nick: 'Olga', password: 'olga pass 12' })).token;
const sRef = (await api('/players/signup', { nick: 'Rémi', password: 'remi pass 12' })).token;
const sNo = (await api('/players/signup', { nick: 'Nina', password: 'nina pass 12' })).token;
const id = (nick) => admin('/players').then((d) => d.players.find((p) => p.nick === nick).id);

ok((await as(sNo)('/status')).http === 403, 'a player account without a role: refused on the organizer side');
const r1 = await admin('/players/role', { id: await id('Olga'), role: 'organizer' });
await admin('/players/role', { id: await id('Rémi'), role: 'referee' });
ok(r1.ok && r1.player.role === 'organizer', 'the super admin gives a role to a player account');
ok((await admin('/players/role', { id: await id('Nina'), role: 'king' })).http === 400, 'an unknown role: refused');
const st = await as(sOrg)('/status');
ok(st.ok && st.you === 'Olga' && st.role === 'organizer' && st.player.nick === 'Olga' && !st.account, 'Olga\'s player session opens the organizer side as organizer');
ok((await api('/players/me', { session: sOrg })).player.role === 'organizer', 'the players\' app knows the role (the menu shows « Organize »)');

// The rights of the role.
const t = await as(sOrg)('/t/create', { name: 'Olga night', profile: 'club' });
ok(t.ok && t.history.some((h) => h.author === 'Olga'), 'an organizer creates a tournament, her nickname in the journal');
ok((await as(sRef)('/t/create', { name: 'Nope', profile: 'club' })).code === 'role', 'a referee cannot create a tournament');
ok((await as(sRef)('/t/list')).ok, 'a referee reads');
ok((await as(sOrg)('/players/role', { id: await id('Nina'), role: 'organizer' })).http === 403, 'an organizer cannot give roles');
ok((await as(sOrg)('/showcase', { max: 5 })).http === 403, 'nor change the home page');

// The role goes with the account.
await admin('/players/role', { id: await id('Rémi'), role: null });
ok((await as(sRef)('/status')).http === 403, 'role taken away: refused at once');
await admin('/players/disable', { id: await id('Olga') });
ok((await as(sOrg)('/status')).http === 401, 'account turned off: the session ends');

// The organizer accounts still work.
const acc = await admin('/accounts/create', { login: 'oldorg', name: 'Old Org', role: 'organizer' });
const inv = await api('/account/invite', { token: acc.invite, password: 'old org pass 1' });
ok(inv.ok && (await as(inv.token)('/status')).role === 'organizer', 'an organizer account (login, password) still works');

srv.close(); svc.close();
rmSync(dir, { recursive: true, force: true });
if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('all arena-roles tests passed');
process.exit(0);
