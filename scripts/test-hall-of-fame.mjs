#!/usr/bin/env node
// The mini-games' Hall of Fame (claude/CONCEPTION_HALL_OF_FAME.md, web.95):
// server/hall-of-fame.js (tickets, plausibility, names, tokens, boards) and the
// real routes of proxy.js (/__hof, /__hof/start, /__hof/score, /admin/hof).
// Run: node scripts/test-hall-of-fame.mjs
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { freePort, waitForServer } from './lib/free-port.mjs';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };

console.log('test-hall-of-fame');
const H = require(path.join(root, 'server/hall-of-fame.js'));
const T0 = Date.UTC(2026, 10, 16, 12, 0, 0);

// ── Names ──
ok(H.cleanName('initials', 'ab1') === 'AB1' && H.cleanName('initials', 'ABCD') === '' && H.cleanName('initials', 'A!B') === '', 'initials: three letters or digits, upper case');
ok(H.cleanName('free', '  Narmod  ') === 'Narmod' && H.cleanName('free', 'x') === '' && H.cleanName('free', 'a'.repeat(13)) === '' && H.cleanName('free', 'Ζήτα') === 'Ζήτα' && H.cleanName('free', '<b>') === '',
  'free nickname: 2 to 12 letters, digits, space . _ -, any alphabet');
ok(H.cleanName('free', 'Computer') === 'Computer' && H.cleanName('free', 'Pùt3 123') === '' && H.cleanName('free', 'FuckYou') === '' && H.cleanName('free', 'Big Boss', ['boss']) === '',
  'free nickname: a word starting with a banned word is refused (accents and look-alike digits folded), « Computer » is fine, the admin adds words');
ok(H.banned('narmod', ['Narmod']) && !H.banned('narmod', ['other']), 'a blocked name, whatever its case');

// ── Tickets and plausibility ──
const st = H.normalize(null);
const tk = H.ticket(st, 'ace-runner', 'free', T0);
ok(typeof tk === 'string' && H.ticketStart(st, tk, 'ace-runner', 'free', T0 + 1000) === T0, 'a ticket carries the start of the run, signed');
ok(!H.ticketStart(st, tk, 'ace-runner', 'time', T0 + 1000) && !H.ticketStart(st, tk.slice(0, -2) + 'xx', 'ace-runner', 'free', T0 + 1000) && !H.ticketStart(H.normalize(null), tk, 'ace-runner', 'free', T0 + 1000),
  'a ticket for another mode, tampered or signed by another server is refused');
ok(!H.ticketStart(st, tk, 'ace-runner', 'free', T0 + 7 * 3600 * 1000) && H.ticket(st, 'nope', 'free', T0) === null, 'a ticket older than 6 h, an unknown game: refused');
ok(H.plausible('ace-runner', 2000, 0) && !H.plausible('ace-runner', 2001, 0) && H.plausible('ace-runner', 2000 + 800 * 60, 60) && !H.plausible('ace-runner', 1.5, 10) && !H.plausible('ace-runner', 0, 10),
  'a score must be possible in the time since the ticket (Ace Runner: 2 000 + 800 a second), a positive integer');

// ── Boards ──
const sub = (o) => H.submit(st, Object.assign({ names: 'initials', g: 'ace-runner', m: 'free', ticket: tk, now: T0 + 600000 }, o));
let r = sub({ s: 5000, name: 'ABC' });
ok(r.ok && r.rank === 1 && r.improved, 'a first score: 1st');
r = sub({ s: 4000, name: 'ABC', now: T0 + 600001 });
ok(!r.ok && r.err === 'rate', 'one score a name every 5 s');
r = sub({ s: 4000, name: 'abc', now: T0 + 610000 });
ok(r.ok && r.rank === 1 && !r.improved && st.boards['initials/ace-runner:free'].length === 1, 'a lower score of the same name: its line stays, one line a name');
for (let i = 0; i < 25; i++) sub({ s: 100 + i, name: 'P' + String(i).padStart(2, '0'), now: T0 + 620000 + i * 6000 });
const b = st.boards['initials/ace-runner:free'];
ok(b.length === H.TOP && b[0].n === 'ABC' && b.every((x, i) => i === 0 || x.s <= b[i - 1].s), 'the board keeps the 20 best, best first');
r = sub({ s: 50, name: 'LOW', now: T0 + 900000 });
ok(r.ok && r.rank === 0 && !b.some((x) => x.n === 'LOW'), 'a score under the 20th is not on the board (rank 0)');
ok(!sub({ s: 99999999, name: 'CHT', now: T0 + 1000000 }).ok, 'an impossible score for the time played is refused');
ok(sub({ s: 3000, name: 'ZZZ', bans: ['zzz'], now: T0 + 1000000 }).err === 'banned', 'a blocked name is refused');
// Daily: today or yesterday only, its own board, top 10.
const tkd = H.ticket(st, 'ace-runner', 'daily', T0);
ok(sub({ m: 'daily', ticket: tkd, s: 3000, name: 'DAY', day: '2026-11-16' }).rank === 1 && st.boards['initials/ace-runner:daily:2026-11-16'].length === 1, 'daily challenge: the board of the day');
ok(sub({ m: 'daily', ticket: tkd, s: 3000, name: 'OLD', day: '2026-11-10' }).err === 'day', 'daily challenge: an old day is refused');
// Each setting its own boards.
ok(sub({ names: 'free', s: 3000, name: 'Narmod' }).rank === 1 && st.boards['free/ace-runner:free'].length === 1 && st.boards['initials/ace-runner:free'].length === 20, 'each setting keeps its own boards');
// Accounts.
const tok = H.issueToken(st, 'Narmod', T0);
ok(H.tokenName(st, tok, T0 + 89 * 86400000) === 'Narmod' && H.tokenName(st, tok, T0 + 91 * 86400000) === null, 'an account token: 90 days');
const tok2 = H.issueToken(st, 'Narmod', T0);
ok(sub({ names: 'account', s: 4000, token: tok2 }).name === 'Narmod' && sub({ names: 'account', s: 4000, token: 'nope', now: T0 + 700000 }).err === 'account', 'account: the name comes from the token, no token no score');
for (let i = 0; i < 7; i++) H.issueToken(st, 'Narmod', T0 + i);
ok(Object.values(st.tokens).filter((x) => x.n === 'Narmod').length === 5, 'five tokens a nickname at most (the oldest go)');
// Taking one's scores back (web.97): the browser's key marks its lines (hashed), an account token its nickname's.
const DEV = 'd'.repeat(32), DEV2 = 'e'.repeat(32);
sub({ s: 7777, name: 'DEV', dev: DEV, now: T0 + 2000000 });
sub({ m: 'time', ticket: H.ticket(st, 'ace-runner', 'time', T0), s: 1500, name: 'DEV', dev: DEV, now: T0 + 2010000 });
sub({ s: 7000, name: 'OTH', dev: DEV2, now: T0 + 2020000 });
const lineDev = st.boards['initials/ace-runner:free'].find((x) => x.n === 'DEV');
ok(lineDev && typeof lineDev.o === 'string' && lineDev.o !== DEV && !('o' in H.view(st, 'initials', 'ace-runner', T0).boards.free[0]), 'a line keeps a hash of its browser\'s key, never the key, never shown');
ok(H.forget(st, { dev: DEV, now: T0 }) === 2 && !st.boards['initials/ace-runner:free'].some((x) => x.n === 'DEV') && st.boards['initials/ace-runner:free'].some((x) => x.n === 'OTH') && !st.boards['initials/ace-runner:time'],
  'forget(): the browser\'s lines go (all boards), the others stay');
ok(H.forget(st, { dev: 'short', now: T0 }) === 0, 'forget(): no key, nothing goes');
// Off (the default): nothing taken, nothing shown.
ok(H.namesOf(undefined) === 'off' && H.namesOf('nope') === 'off' && sub({ names: 'off', s: 3000, name: 'OFF' }).err === 'off' && Object.keys(H.view(st, 'off', 'ace-runner', T0).boards).length === 0 && Object.keys(H.adminView(st, 'off')).length === 0,
  'off is the default: no score taken, no board shown');
// View, admin, prune.
const v = H.view(st, 'initials', 'ace-runner', T0);
ok(v.names === 'initials' && v.boards.free.length === 19 && v.boards.daily.length === 1 && Array.isArray(v.boards.time) && !('at' in v.boards.free[0]), 'the public view: each mode\'s board and today\'s, no internal field');
ok(Object.keys(H.adminView(st, 'initials')).length === 2 && H.remove(st, 'initials/ace-runner:free', 'abc') && !H.remove(st, 'initials/ace-runner:free', 'abc'), 'the admin lists a setting\'s boards and removes a line');
H.prune(st, T0 + 10 * 86400000);
ok(!st.boards['initials/ace-runner:daily:2026-11-16'] && st.boards['initials/ace-runner:free'], 'old daily boards go, the others stay');

// ── The real routes ──
const T = fs.mkdtempSync(path.join(os.tmpdir(), 'hof-'));
const TOKEN = 'tok-hof-test';
const seed = H.normalize(null), acct = H.issueToken(seed, 'Narmod', Date.now());
fs.writeFileSync(path.join(T, 'hof.json'), JSON.stringify(seed));
fs.writeFileSync(path.join(T, 'cfg.json'), '{}');
const PORT = await freePort();
const env = { PORT: String(PORT), STATS_ADMIN_TOKEN: TOKEN, ADMIN_CONFIG_FILE: path.join(T, 'cfg.json'), HOF_FILE: path.join(T, 'hof.json'), RATE_LIMIT_DISABLED: '1' };
for (const k of ['STATS_FILE', 'STATS_META_FILE', 'AUDIT_FILE', 'VISITS_FILE', 'BROADCASTS_FILE', 'POLLS_FILE', 'SCOPED_TOKENS_FILE']) env[k] = path.join(T, k.toLowerCase() + '.json');
const px = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, env: Object.assign({}, process.env, env), stdio: 'ignore' });
const base = 'http://127.0.0.1:' + PORT;
const post = (p, body, h) => fetch(base + p, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, h || {}), body: JSON.stringify(body) }).then(async (x) => ({ status: x.status, d: await x.json().catch(() => null) }));
try {
  await waitForServer(base, px);
  let g = await (await fetch(base + '/__hof?g=ace-runner')).json();
  ok(g.ok && g.names === 'off' && Object.keys(g.boards).length === 0, 'GET /__hof: off by default, no board');
  const s0 = await post('/__hof/start', { g: 'ace-runner', m: 'free' });
  ok(s0.d && s0.d.ok === false && s0.d.error === 'off' && !s0.d.ticket, 'off: no ticket');
  ok((await post('/admin/hof', { token: TOKEN, names: 'account' })).d.names === 'account', 'the admin turns it on with pokerth.net accounts');
  g = await (await fetch(base + '/__hof?g=ace-runner')).json();
  ok(g.ok && g.names === 'account' && g.boards.free.length === 0 && g.top === 20 && g.topDay === 10, 'GET /__hof: on, empty boards');
  ok((await fetch(base + '/__hof?g=nope')).status === 404, 'GET /__hof: an unknown game is a 404');
  const s1 = await post('/__hof/start', { g: 'ace-runner', m: 'free' });
  ok(s1.status === 200 && typeof s1.d.ticket === 'string', 'POST /__hof/start: a ticket');
  let sc = await post('/__hof/score', { g: 'ace-runner', m: 'free', s: 1500, ticket: s1.d.ticket });
  ok(sc.status === 401 && sc.d.error === 'account', 'account setting: no key, no score (401)');
  sc = await post('/__hof/score', { g: 'ace-runner', m: 'free', s: 1500, ticket: s1.d.ticket }, { Authorization: 'Bearer ' + acct });
  ok(sc.status === 200 && sc.d.rank === 1 && sc.d.name === 'Narmod' && sc.d.boards.free[0].n === 'Narmod', 'account setting: the key gives the nickname, 1st');
  sc = await post('/__hof/score', { g: 'ace-runner', m: 'free', s: 999999, ticket: s1.d.ticket }, { Authorization: 'Bearer ' + acct });
  ok(sc.status === 400 && sc.d.error === 'score', 'an impossible score is refused');
  // The admin switches to 3 letters: a new set of boards.
  const ad = await post('/admin/hof', { token: TOKEN, names: 'initials', bans: ['BAD'], words: ['boss'] });
  ok(ad.status === 200 && ad.d.names === 'initials', 'POST /admin/hof: the setting is saved');
  ok((await post('/admin/hof', { names: 'free' })).status === 403, 'POST /admin/hof: refused without the key');
  g = await (await fetch(base + '/__hof?g=ace-runner')).json();
  ok(g.names === 'initials' && g.boards.free.length === 0, 'a new setting: its own (empty) boards');
  const s2 = await post('/__hof/start', { g: 'ace-runner', m: 'time' });
  sc = await post('/__hof/score', { g: 'ace-runner', m: 'time', s: 1200, ticket: s2.d.ticket, name: 'xyz' });
  ok(sc.status === 200 && sc.d.name === 'XYZ' && sc.d.rank === 1, 'initials: XYZ enters the time attack board');
  ok((await post('/__hof/score', { g: 'ace-runner', m: 'time', s: 1200, ticket: s2.d.ticket, name: 'bad' })).d.error === 'banned', 'a blocked name is refused');
  const al = await (await fetch(base + '/admin/hof?names=account&token=' + TOKEN)).json();
  ok(al.ok && al.names === 'initials' && al.shown === 'account' && al.boards['account/ace-runner:free'][0].n === 'Narmod' && al.bans[0] === 'BAD', 'GET /admin/hof: any setting\'s boards, the lists');
  const fg = await post('/__hof/forget', { dev: 'x'.repeat(20) }, { Authorization: 'Bearer ' + acct });
  ok(fg.status === 200 && fg.d.removed === 1, 'POST /__hof/forget: the account\'s nickname lines go, even with the setting on 3 letters (' + JSON.stringify(fg.d) + ')');
  const dl = await post('/admin/hof/delete', { token: TOKEN, key: 'initials/ace-runner:time', name: 'xyz' });
  ok(dl.status === 200 && dl.d.ok, 'POST /admin/hof/delete: the line goes');
  await new Promise((res) => setTimeout(res, 1300));
  const saved = JSON.parse(fs.readFileSync(path.join(T, 'hof.json'), 'utf8'));
  ok(!saved.boards['initials/ace-runner:time'] && !saved.boards['account/ace-runner:free'], 'the boards are saved to hall-of-fame.json');
  ok(JSON.parse(fs.readFileSync(path.join(T, 'cfg.json'), 'utf8')).hofNames === 'initials', 'the setting is saved in the admin config');
} finally {
  px.kill();
}

// ── The client keeps the account key it is given ──
const pk = fs.readFileSync(path.join(root, 'public/pokerth.js'), 'utf8');
ok(/data\.startsWith\('HOFTOK:'\)[\s\S]{0,200}localStorage\.setItem\('pth_hof_tok'/.test(pk), 'the client keeps the HOFTOK: key on the device (pth_hof_tok)');
const pxs = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'public/pokerth-client.html'), 'utf8');
ok(/<select id="adv-hofopt"[^>]*>\s*<option value="ask"[^>]*>[^<]*<\/option><option value="yes"[^>]*>[^<]*<\/option><option value="no"/.test(html) && /'pth_hof_opt',/.test(pk) && /getElementById\('adv-hofopt'\)/.test(pk),
  'Advanced options › Community: « Hall of Fame: ask me / always / never », synced with the account');
ok(/S\.isAuthLogin && S\.chatNick\) \{ _issueSyncToken\(S\); _issueHofToken\(S\); \}/.test(pxs) && /if \(S\.hofFrame \|\| hofNames\(\) !== 'account'\) return;/.test(pxs),
  'the proxy hands the key out only after an authenticated login (as the sync token), and only while the setting is « account »');

console.log((fail ? 'FAIL ' : 'OK ') + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
