#!/usr/bin/env node
// Tests of the players' side of the tournament director (service level):
// /tournament pages and language files, the public list (public only), one
// tournament by its key (unlisted by link, private with its invitation code),
// registration and unregistration with the personal code, when registration
// closes, the per-address limits, the check-in of an Official tournament,
// and the files of a validated result.
// Run: node tournament/test/test-td-public.mjs
import { mkdtempSync, rmSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

const here = dirname(fileURLToPath(import.meta.url));
const dir = mkdtempSync(join(tmpdir(), 'td-pub-'));
const keys = generateKeys();
writeFileSync(join(dir, 'td-key.pem'), keys.privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.303', sweepMs: 60000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const A = { Authorization: 'Bearer master', 'Content-Type': 'application/json' };
const admin = async (p, b) => (await fetch(base + '/admin/tournaments' + p, b ? { method: 'POST', headers: A, body: JSON.stringify(b) } : { headers: A })).json();
const pub = async (p, b, ip) => {
  const r = await fetch(base + '/tournament/api' + p, b ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': ip || '10.0.0.1' }, body: JSON.stringify(b) } : {});
  const d = await r.json(); d.status = r.status; return d;
};

// ── pages and language files ───────────────────────────────────────
{
  const p1 = await (await fetch(base + '/tournament')).text();
  const p2 = await (await fetch(base + '/tournament/organize')).text();
  const p3 = await (await fetch(base + '/tournament/t/abcdefghij')).text();
  ok(/public\.mjs/.test(p1) && /public\.mjs/.test(p3) && /organizer\.mjs/.test(p2), 'pages: /tournament and /tournament/t/<key> for players, /tournament/organize for organizers');
  ok(/noindex/.test(p1), 'pages: noindex while in beta');
  ok((await fetch(base + '/tournament/lang/en.mjs')).status === 200 && (await fetch(base + '/tournament/lang/xx.mjs')).status === 404 && (await fetch(base + '/tournament/lang/../lib/manager.mjs')).status === 404, 'language files: served by code, nothing else');
  ok((await fetch(base + '/tournament/td.css')).status === 200 && (await fetch(base + '/tournament/theme.mjs')).status === 200, 'shared style and theme module');
}

// ── catalogue: every language has the same keys as English ─────────
{
  const langDir = join(here, '..', 'public', 'lang');
  const en = (await import(join(langDir, 'en.mjs'))).strings;
  const files = readdirSync(langDir).filter((f) => f.endsWith('.mjs'));
  let bad = [];
  for (const f of files) {
    const s = (await import(join(langDir, f))).strings;
    const missing = Object.keys(en).filter((k) => typeof s[k] !== 'string' || !s[k].trim());
    const holes = Object.keys(en).filter((k) => typeof s[k] === 'string' && (en[k].match(/\{\w+\}/g) || []).sort().join() !== (s[k].match(/\{\w+\}/g) || []).sort().join());
    if (missing.length || holes.length) bad.push(f + (missing.length ? ' missing ' + missing.join(',') : '') + (holes.length ? ' placeholders ' + holes.join(',') : ''));
  }
  ok(bad.length === 0, 'catalogues: ' + files.length + ' languages, every key, same placeholders' + (bad.length ? ' — ' + bad.slice(0, 5).join(' | ') : ''));
}

// ── list and visibility ────────────────────────────────────────────
const pubT = await admin('/t/create', { name: 'Open cup', profile: 'club', startsAt: Date.now() + 3600e3 });
const unl = await admin('/t/create', { name: 'Link only', profile: 'friendly' });   // friendly = unlisted
const prv = await admin('/t/create', { name: 'Secret', profile: 'club', visibility: 'private' });
const closed = await admin('/t/create', { name: 'By hand', profile: 'club', run: { selfRegister: false } });
{
  ok(pubT.publicKey && pubT.publicKey.length >= 16 && unl.settings.visibility === 'unlisted', 'each tournament has a random public key');
  const l = await pub('/list');
  const names = l.tournaments.map((t) => t.name);
  ok(names.indexOf('Open cup') >= 0 && names.indexOf('Link only') < 0 && names.indexOf('Secret') < 0, 'list: public tournaments only');
  ok(!JSON.stringify(l).includes(pubT.id) && !JSON.stringify(l).includes('inviteCode'), 'list: no internal id, no invitation code');
  ok((await pub('/t/' + unl.publicKey)).name === 'Link only', 'unlisted: open to whoever has the link');
  const p0 = await pub('/t/' + prv.publicKey);
  ok(p0.status === 404 && p0.code === 'private' && !p0.name, 'private: nothing without the invitation code');
  const p1 = await pub('/t/' + prv.publicKey + '?invite=' + encodeURIComponent(prv.inviteCode));
  ok(p1.ok && p1.name === 'Secret', 'private: shown with its invitation code');
  ok((await pub('/t/zzzzzzzzzzzz')).status === 404, 'unknown key: 404');
}

// ── registration ───────────────────────────────────────────────────
let aliceCode;
{
  const r = await pub('/t/' + pubT.publicKey + '/register', { nick: 'Alice' });
  aliceCode = r.code;
  ok(r.ok && /^[A-HJ-NP-Z2-9]{8}$/.test(r.code) && r.tournament.playerList.some((p) => p.nick === 'Alice'), 'register: done, a personal code of 8 characters');
  ok((await pub('/t/' + pubT.publicKey + '/register', { nick: 'alice' }, '10.0.0.2')).code === 'taken', 'register: a nickname once (any case)');
  ok((await pub('/t/' + pubT.publicKey + '/register', { nick: ' x' }, '10.0.0.2')).code === 'badNick' && (await pub('/t/' + pubT.publicKey + '/register', { nick: 'Élodie' }, '10.0.0.2')).code === 'badNick', 'register: a nickname the server would refuse is refused');
  ok((await pub('/t/' + closed.publicKey + '/register', { nick: 'Bob' }, '10.0.0.3')).code === 'closed_organizer', 'register: closed when the organizer registers the players himself');
  const org = await admin('/t/get?id=' + pubT.id);
  ok(org.players[0].self === true && !('codeHash' in org.players[0]) && org.history.some((h) => h.type === 'playerRegistered'), 'organizer: sees « self », never the code; the journal says who registered');
  const raw = JSON.parse(readFileSync(join(dir, 'tournaments', pubT.id, 'tournament.json'), 'utf8'));
  ok(raw.players[0].codeHash && raw.players[0].codeHash.length === 64 && !JSON.stringify(raw).includes(aliceCode), 'stored: only a hash of the code');
  const p = await pub('/t/' + prv.publicKey + '/register', { nick: 'Carol' }, '10.0.0.4');
  ok(p.status === 404, 'private: no registration without the invitation code');
  ok((await pub('/t/' + prv.publicKey + '/register', { nick: 'Carol', invite: prv.inviteCode }, '10.0.0.4')).ok, 'private: registration with it');
}

// ── unregistration ─────────────────────────────────────────────────
{
  const bad = await pub('/t/' + pubT.publicKey + '/unregister', { nick: 'Alice', code: 'WRONGCOD' }, '10.0.0.5');
  ok(bad.code === 'badCode', 'unregister: refused with a wrong code');
  const good = await pub('/t/' + pubT.publicKey + '/unregister', { nick: 'alice', code: aliceCode.toLowerCase() }, '10.0.0.5');
  ok(good.ok && !good.tournament.playerList.length, 'unregister: with the code (any case)');
  await admin('/t/player', { id: pubT.id, nick: 'Dave' });
  ok((await pub('/t/' + pubT.publicKey + '/unregister', { nick: 'Dave', code: 'ABCDEFGH' }, '10.0.0.5')).code === 'badCode', 'a player added by the organizer cannot be unregistered from the page');
}

// ── closing: full, table open ──────────────────────────────────────
{
  const full = await admin('/t/create', { name: 'Ten', profile: 'club' });
  for (let i = 0; i < 10; i++) await admin('/t/player', { id: full.id, nick: 'P' + i });
  const f = await pub('/t/' + full.publicKey);
  ok(f.closedBecause === 'full' && (await pub('/t/' + full.publicKey + '/register', { nick: 'Late' }, '10.0.0.6')).code === 'closed_full', 'closed when the table is full (10)');
  const op = await admin('/t/create', { name: 'Running', profile: 'club' });
  await admin('/t/player', { id: op.id, nick: 'A1' });
  svc.manager.tournaments.hostOpened(op.id, 'fakewatch01', {}, 'admin');
  const g = await pub('/t/' + op.publicKey);
  ok(g.phase === 'table' && g.closedBecause === 'tableOpen', 'closed once the director has opened the table');
  ok((await pub('/t/' + op.publicKey + '/unregister', { nick: 'A1', code: 'X' }, '10.0.0.6')).code === 'closed_tableOpen', 'no unregistering once the table is open');
}

// ── per-address limits ─────────────────────────────────────────────
{
  const t = await admin('/t/create', { name: 'Flood', profile: 'club' });
  const res = [];
  for (let i = 0; i < 8; i++) res.push((await pub('/t/' + t.publicKey + '/register', { nick: 'F' + i }, '10.9.9.9')).status);
  ok(res.slice(0, 6).every((s) => s === 200) && res[6] === 429 && res[7] === 429, 'six registrations per address in ten minutes, then 429');
  ok((await pub('/t/' + t.publicKey + '/register', { nick: 'Other' }, '10.9.9.8')).ok, 'another address is not affected');
}

// ── check-in (identity « code », Official) ─────────────────────────
{
  const off = await admin('/t/create', { name: 'Official cup', profile: 'official', server: { ref: 'local', name: 'Local', host: '127.0.0.1', port: 7234 }, startsAt: Date.now() + 2 * 3600e3, run: { checkInBefore: 30 } });
  ok(off.run.chatLang === 'en' && (await admin('/t/create', { name: 'Chat fr', profile: 'club', run: { chatLang: 'FR' } })).run.chatLang === 'fr' && (await admin('/t/create', { name: 'Chat xx', profile: 'club', run: { chatLang: '../en' } })).run.chatLang === 'en', 'chat language: English by default, a known language only');
  ok(off.run.checkInBefore === 30 && (await admin('/t/create', { name: 'Short check-in', profile: 'club', run: { checkInBefore: 3 } })).run.checkInBefore === 30, 'check-in: 5 to 240 minutes before the start, 30 by default');
  const ann = await pub('/t/' + off.publicKey + '/register', { nick: 'Ann' }, '10.1.0.1');
  const added = await admin('/t/player', { id: off.id, nick: 'Ben' });
  ok(added.issuedCode && added.issuedCode.nick === 'Ben' && /^[A-HJ-NP-Z2-9]{8}$/.test(added.issuedCode.code) && !('codeHash' in added.players[1]), 'a player added by the organizer gets a personal code, shown once to the organizer');
  const clubAdd = await admin('/t/player', { id: pubT.id, nick: 'Eve' });
  ok(!clubAdd.issuedCode, 'no code shown without check-in (identity « simple »)');
  let g = await pub('/t/' + off.publicKey);
  ok(g.checkIn.needed && !g.checkIn.open && Math.abs(g.checkIn.opensAt - (off.startsAt - 30 * 60000)) < 1000 && g.checkIn.count === 0, 'check-in: shown with its opening time, not open yet');
  ok((await pub('/t/' + off.publicKey + '/checkin', { nick: 'Ann', code: ann.code }, '10.1.0.1')).code === 'checkInNotYet', 'check-in: refused before its window');
  ok((await pub('/t/' + pubT.publicKey + '/checkin', { nick: 'Alice', code: 'X' }, '10.1.0.1')).code === 'noCheckIn', 'check-in: none for a club tournament');
  // Open the window: a start in 20 minutes.
  await admin('/t/update', { id: off.id, patch: { startsAt: Date.now() + 20 * 60000 } });
  g = await pub('/t/' + off.publicKey);
  ok(g.checkIn.open, 'check-in: open inside its window');
  ok((await pub('/t/' + off.publicKey + '/checkin', { nick: 'Ann', code: 'ABCDEFGH' }, '10.1.0.1')).code === 'badCode', 'check-in: a wrong code is refused');
  const c1 = await pub('/t/' + off.publicKey + '/checkin', { nick: 'ann', code: ann.code.toLowerCase() }, '10.1.0.1');
  ok(c1.ok && c1.nick === 'Ann' && c1.tournament.playerList.find((p) => p.nick === 'Ann').checkedIn && c1.tournament.checkIn.count === 1, 'check-in: with the personal code (any case)');
  ok((await pub('/t/' + off.publicKey + '/checkin', { nick: 'Ann', code: ann.code }, '10.1.0.1')).code === 'alreadyIn', 'check-in: once');
  const nw = await admin('/t/code', { id: off.id, nick: 'Ben' });
  ok(nw.issuedCode && nw.issuedCode.code !== added.issuedCode.code && (await pub('/t/' + off.publicKey + '/checkin', { nick: 'Ben', code: added.issuedCode.code }, '10.1.0.2')).code === 'badCode', 'a new code replaces the old one');
  ok((await pub('/t/' + off.publicKey + '/checkin', { nick: 'Ben', code: nw.issuedCode.code }, '10.1.0.2')).ok, 'the organizer\'s player checks in with the code he was given');
  await admin('/t/player', { id: off.id, nick: 'Cat' });
  await admin('/t/player', { id: off.id, nick: 'Dan' });
  const byOrg = await admin('/t/checkin', { id: off.id, nick: 'Cat' });
  ok(byOrg.players.find((p) => p.nick === 'Cat').checkedIn && byOrg.history.some((h) => h.type === 'checkedIn' && /by the organizer/.test(h.summary)), 'the organizer can check a player in; the journal says so');
  ok((await admin('/t/checkin', { id: pubT.id, nick: 'Dave' })).ok === false, 'no organizer check-in without identity « code »');
  // Opening the table: only the players checked in are invited; Dan is absent.
  let started = null;
  const real = svc.manager.startHost;
  svc.manager.startHost = async (o) => { started = o; return { ok: true, id: 'fakehostck01' }; };
  const op = await admin('/t/table/open', { id: off.id });
  svc.manager.startHost = real;
  ok(op.ok && started && started.registered.join() === 'Ann,Ben,Cat', 'table: only the checked-in players are invited (' + (started && started.registered.join()) + ')');
  ok(op.players.find((p) => p.nick === 'Dan').absent && op.history.some((h) => h.type === 'notCheckedIn'), 'table: who did not check in is marked absent, in the journal');
  g = await pub('/t/' + off.publicKey);
  ok(g.checkIn.closed && !g.checkIn.open && (await pub('/t/' + off.publicKey + '/checkin', { nick: 'Dan', code: 'ABCDEFGH' }, '10.1.0.3')).code === 'checkInClosed', 'check-in: closed once the table is open');
  // Fewer than two checked in: the table does not open.
  const few = await admin('/t/create', { name: 'Few', profile: 'official', server: { ref: 'local', name: 'Local', host: '127.0.0.1', port: 7234 } });
  for (const n of ['A', 'B', 'C']) await admin('/t/player', { id: few.id, nick: 'Few' + n });
  await admin('/t/checkin', { id: few.id, nick: 'FewA' });
  const r = await admin('/t/table/open', { id: few.id });
  ok(!r.ok && /fewer than two players have checked in/.test(r.error), 'table: refused with fewer than two players checked in');
  const noDate = await pub('/t/' + few.publicKey);
  ok(noDate.checkIn.open && noDate.checkIn.opensAt === null, 'check-in: open at once without a start date');
}

// ── result files ───────────────────────────────────────────────────
{
  const t = await admin('/t/create', { name: 'Done', profile: 'club' });
  for (const n of ['Ann', 'Ben']) await admin('/t/player', { id: t.id, nick: n });
  await admin('/t/result', { id: t.id, source: 'manual', ranking: ['Ben', 'Ann'] });
  const d = await pub('/t/' + t.publicKey);
  ok(d.phase === 'validated' && d.result.ranking[0].nick === 'Ben' && d.sealed && d.sealed.signature === true && /^[A-Za-z0-9+/]{43}=$/.test(d.sealed.signedBy) && /^[0-9a-f]{64}$/.test(d.sealed.head), 'result: ranking, sealed head, signature valid');
  const j = await fetch(base + '/tournament/api/t/' + t.publicKey + '/file?which=journal');
  ok(j.status === 200 && JSON.parse(await j.text()).entries.length > 0, 'result: journal downloadable');
  ok((await fetch(base + '/tournament/api/t/' + prv.publicKey + '/file?which=journal')).status === 404, 'private: no file without the code');
  ok((await pub('/t/' + t.publicKey + '/register', { nick: 'Late' }, '10.0.0.7')).code === 'closed_finished', 'finished: registration closed');
}

svc.close(); srv.close();
rmSync(dir, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAILED` : '\nall td-public tests passed');
process.exit(fails ? 1 : 0);
