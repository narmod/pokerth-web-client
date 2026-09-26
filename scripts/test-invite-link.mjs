#!/usr/bin/env node
// Deterministic tests for public/modules/net/invite-link.mjs — the invite
// link to a table (#join=<name>&s=<server>) and everything that consumes it:
// one canonical builder for both share buttons, the table chosen among
// homonyms, the host warnings, the « not found » watch counted from the
// connection, and a link opened while the app is already open (hashchange).
// Run: node scripts/test-invite-link.mjs
import fs from 'fs';

globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '', value: '', checked: false,
  appendChild(c) { this.children.push(c); }, remove() {}, addEventListener() {}, setAttribute() {},
  classList: { add() {}, remove() {}, contains: () => false }, querySelector: () => null, querySelectorAll: () => [] }; }
const els = {};
globalThis.document = { readyState: 'complete', addEventListener() {}, removeEventListener() {},
  querySelectorAll: () => [], querySelector: () => null, documentElement: { getAttribute: () => null, lang: 'en' },
  body: { appendChild() {}, removeChild() {} },
  getElementById: (id) => (els[id] = els[id] || makeEl()), createElement: () => makeEl() };
const hashListeners = [];
globalThis.addEventListener = (ev, fn) => { if (ev === 'hashchange') hashListeners.push(fn); };
globalThis.removeEventListener = () => {};
let reloads = 0;
globalThis.location = { hash: '', pathname: '/', search: '', origin: 'https://webclient.pokerth.net', reload() { reloads++; } };
globalThis.history = { replaceState() { location.hash = ''; } };

const { S } = await import('../public/modules/game/state.mjs');
const IL = await import('../public/modules/net/invite-link.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  \u2717', msg); } else console.log('  \u2713', msg); }

// ── 1. One canonical link ───────────────────────────────────────────────
const BASE = 'https://webclient.pokerth.net/';
let tg = IL.inviteTarget('guest', 'ignored.example', '9999', true);
ok(tg.s === 'pokerth.net' && tg.tls === false, 'target: guest on pokerth.net → symbolic « pokerth.net », no tls');
ok(IL.inviteTarget('auth', '', '', false).s === 'pokerth.net', 'target: account on pokerth.net → « pokerth.net »');
tg = IL.inviteTarget('lan', ' 192.168.1.20 ', ' 7234 ', true);
ok(tg.s === '192.168.1.20:7234' && tg.tls === true, 'target: LAN/dedicated → trimmed host:port + tls');
let url = IL.buildInviteUrl(BASE, 'Friday night', IL.inviteTarget('guest'));
ok(url === BASE + '#join=Friday%20night&s=pokerth.net', 'build: pokerth.net link = #join=<name>&s=pokerth.net');
url = IL.buildInviteUrl(BASE, 'Table', IL.inviteTarget('unauth', 'box.lan', '7235', true));
ok(/&s=box.lan%3A7235&tls=1$/.test(url), 'build: dedicated server link carries host:port and &tls=1');
ok(!/tls=/.test(IL.buildInviteUrl(BASE, 'T', { s: 'pokerth.net', tls: true })), 'build: never &tls for pokerth.net');
const odd = 'Café & amis #2 +50%/é';
url = IL.buildInviteUrl(BASE, odd, IL.inviteTarget('guest'));
ok(url.indexOf('?') === -1 && !/pass/i.test(url), 'build: everything in the fragment, never a password');
let back = IL.parseInviteHash(url.slice(url.indexOf('#')));
ok(back && back.name === odd && back.s === 'pokerth.net' && back.tls === null, 'round trip: special characters survive build → parse');
back = IL.parseInviteHash('#join=A&s=h%3A1&tls=1');
ok(back.name === 'A' && back.s === 'h:1' && back.tls === '1', 'parse: server and tls read');
ok(IL.parseInviteHash('#foo=1') === null && IL.parseInviteHash('') === null, 'parse: no table → null');

// ── 2. Same server? ─────────────────────────────────────────────────────
ok(IL.sameServer('Box.LAN', 'box.lan:7234'), 'server: default port 7234 and case ignored');
ok(!IL.sameServer('box.lan:7235', 'box.lan:7234'), 'server: another port is another server');
ok(IL.sameServer('', 'pokerth.net') && !IL.sameServer('pokerth.net', 'box.lan'), 'server: empty target means pokerth.net');
ok(IL.sameServer('[::1]:7234', '[::1]'), 'server: bracketed IPv6');

// ── 3. Which table the link means ──────────────────────────────────────
const G = (name, mode, players, maxPlayers) => ({ name, mode, players, maxPlayers });
ok(IL.pickInviteTable({}, 'X') === null, 'pick: no table of that name → null');
ok(IL.pickInviteTable({ 4: G('X', 3, 0, 10) }, 'X') === null, 'pick: closed table ignored');
let p = IL.pickInviteTable({ 3: G('X', 2, 5, 10), 7: G('X', 1, 2, 10) }, 'X');
ok(p && p.id === 7 && p.action === 'join', 'pick: waiting table wins over a running homonym');
p = IL.pickInviteTable({ 5: G('X', 1, 10, 10), 6: G('X', 1, 3, 10) }, 'X');
ok(p.id === 6, 'pick: among waiting tables, one with a free seat first');
p = IL.pickInviteTable({ 5: G('X', 1, 10, 10) }, 'X');
ok(p.id === 5 && p.action === 'join', 'pick: a full waiting table is still tried (the server answers)');
p = IL.pickInviteTable({ 8: G('X', 2, 4, 10), 9: G('X', 2, 4, 10) }, 'X');
ok(p.id === 9 && p.action === 'spectate', 'pick: only running tables → the newest, as spectator');
p = IL.pickInviteTable({ 2: G('X ', 1, 1, 10) }, 'X');
ok(p && p.id === 2, 'pick: surrounding spaces tolerated');
ok(IL.pickInviteTable({ 2: G('Xy', 1, 1, 10) }, 'X') === null, 'pick: no partial match');

// ── 4. Warnings for the host ────────────────────────────────────────────
const PN = { s: 'pokerth.net' };
ok(IL.inviteWarnings({ type: 1 }, PN).length === 0, 'warn: normal pokerth.net table → none');
ok(IL.inviteWarnings({ type: 3 }, PN).join() === 'invWarnInviteOnly', 'warn: invite-only table');
ok(IL.inviteWarnings({ type: 2 }, PN).join() === 'invWarnGuests', 'warn: registered-only table on pokerth.net');
ok(IL.inviteWarnings({ type: 4 }, PN).join() === 'invWarnGuests', 'warn: ranking table on pokerth.net');
ok(IL.inviteWarnings({ type: 2 }, { s: 'box.lan:7234' }).length === 0, 'warn: registered table off pokerth.net → no guest warning');
ok(IL.inviteWarnings({ type: 1 }, { s: 'localhost:7234' }).join() === 'invWarnLocalhost', 'warn: localhost');
ok(IL.inviteWarnings({ type: 1 }, { s: '127.0.0.1' }).join() === 'invWarnLocalhost', 'warn: 127.0.0.1');
ok(IL.inviteWarnings({ type: 1 }, { s: '192.168.1.5:7234' }).length === 0, 'warn: LAN address is fine for LAN friends');

// ── 5. « Not found » watch, counted from the connection ─────────────────
let resolved = false;
const env = (o) => Object.assign({ pending: true, connected: false, resolve: () => resolved }, o);
let tick = IL.createNotFoundWatch(0, 6000, 1800000);
ok(tick(25000, env()) === 'wait', 'watch: 25 s on the login screen → still waiting (old timer gave up at 20 s)');
ok(tick(26000, env({ connected: true })) === 'wait', 'watch: just connected → settle time');
ok(tick(31000, env({ connected: true })) === 'wait', 'watch: 5 s after connecting → still settling');
ok(tick(32000, env({ connected: true })) === 'notfound', 'watch: 6 s after connecting, table absent → not found');
tick = IL.createNotFoundWatch(0, 6000, 1800000);
tick(1000, env({ connected: true })); resolved = true;
ok(tick(8000, env({ connected: true })) === 'joined', 'watch: table present after settling → joined');
resolved = false;
tick = IL.createNotFoundWatch(0, 6000, 1800000);
tick(1000, env({ connected: true }));
ok(tick(4000, env({ connected: false })) === 'wait', 'watch: connection lost → waits again');
ok(tick(8000, env({ connected: true })) === 'wait', 'watch: settle restarts on reconnection');
ok(tick(9000, env({ pending: false })) === 'done', 'watch: pending cleared by a join → done');
ok(IL.createNotFoundWatch(0, 6000, 1800000)(1800001, env()) === 'expired', 'watch: gives up after 30 min');

// ── 6. Runtime: join / spectate the pending table ───────────────────────
const calls = [];
window.App = { joinGame: (id) => calls.push(['join', id]), spectateGame: (id) => calls.push(['spec', id]) };
const chats = []; window.addChat = (who, txt, cls, o) => chats.push(o && o.key);
S.games = { 11: G('Home', 2, 3, 10), 12: G('Home', 1, 1, 10) };
S.amInGame = false; S.gId = 0;
window._pendingAutoJoinName = 'Home';
ok(IL.resolvePendingInvite() === true && calls.pop().join() === 'join,12', 'resolve: joins the waiting table');
ok(window._pendingAutoJoinName === '' && chats.pop() === 'sharedTableJoining', 'resolve: pending cleared, « joining » line');
S.games = { 11: G('Home', 2, 3, 10) };
window._pendingAutoJoinName = 'Home';
ok(IL.resolvePendingInvite() && calls.pop().join() === 'spec,11' && chats.pop() === 'sharedTableRunning',
  'resolve: running table → spectate, with an explanation');
window._pendingAutoJoinName = 'Home'; S.gId = 11;
ok(IL.resolvePendingInvite() === false && calls.length === 0 && window._pendingAutoJoinName === 'Home',
  'resolve: already at a table → nothing sent');
S.gId = 0; window._pendingAutoJoinName = 'Nope';
ok(IL.resolvePendingInvite() === false && window._pendingAutoJoinName === 'Nope', 'resolve: table absent → kept pending for the watch');
window._pendingAutoJoinName = '';

// ── 7. Link opened while the app is already open ────────────────────────
ok(hashListeners.indexOf(IL.onInviteHashChange) !== -1, 'hashchange: listener registered by the module');
const toasts = []; window.showToast = (x) => toasts.push(x);
S.games = { 21: G('Pals', 1, 1, 10) };
// at a table: never leaves it
S.gId = 30; location.hash = '#join=Pals&s=pokerth.net';
IL.onInviteHashChange();
ok(calls.length === 0 && reloads === 0 && toasts.length === 1 && /Pals/.test(toasts[0]), 'hashchange at a table: only a toast');
S.gId = 0;
// not connected: reload so the landing code prefills the login form
S.myId = 0; S.ws = null; location.hash = '#join=Pals&s=pokerth.net';
IL.onInviteHashChange();
ok(reloads === 1 && calls.length === 0, 'hashchange on the login screen: page reloaded on the link');
// connected to pokerth.net: joins in place, no reload
S.myId = 7; S.ws = { readyState: 1 }; S._currentLoginMode = 'guest'; location.hash = '#join=Pals&s=pokerth.net';
IL.onInviteHashChange();
ok(reloads === 1 && calls.pop().join() === 'join,21', 'hashchange in the lobby, same server: joins without reloading');
// connected to a LAN box, link for pokerth.net: reload (another server)
S._currentLoginMode = 'lan'; els.host = Object.assign(makeEl(), { value: 'box.lan' }); els.port = Object.assign(makeEl(), { value: '7234' });
location.hash = '#join=Pals&s=pokerth.net';
IL.onInviteHashChange();
ok(reloads === 2 && calls.length === 0, 'hashchange in the lobby, other server: reload on the link');
location.hash = '#join=Pals&s=box.lan';
IL.onInviteHashChange();
ok(reloads === 2 && calls.pop().join() === 'join,21', 'hashchange: same LAN server (default port implied) joins in place');

// ── 8. Wiring guards (static) ───────────────────────────────────────────
const pj = fs.readFileSync('public/pokerth.js', 'utf8');
const copyFn = pj.slice(pj.indexOf('    copyTableLink() {'), pj.indexOf('    // ── Share an invite link to the current table'));
ok(copyFn.length > 0 && copyFn.indexOf("'?' + qs") === -1 && copyFn.indexOf('this._inviteLink()') !== -1,
  'copyTableLink: canonical #join link, no more ?host=&table=<id>');
ok(/shareTableLink\(\) \{\s*var _il = this\._inviteLink\(\);/.test(pj), 'shareTableLink: same builder as copyTableLink');
const apply = pj.slice(pj.indexOf('function _pthApplySharedLink'), pj.indexOf('function _pthDrainShare'));
ok(apply.indexOf('S.gameId') === -1 && apply.indexOf('S.gId') !== -1, '_pthApplySharedLink: « never during a hand » guard reads S.gId');
ok(pj.indexOf('window.InviteLink.armNotFoundWatch()') !== -1, 'landing: not-found watch armed from the connection');
const ml = fs.readFileSync('public/modules/net/msg-lobby.mjs', 'utf8');
ok(ml.indexOf('scheduleInviteResolve(') !== -1 && ml.indexOf("from './invite-link.mjs'") !== -1, 'msg-lobby: name match goes through pickInviteTable');
ok(fs.readFileSync('public/sw.js', 'utf8').indexOf("'/modules/net/invite-link.mjs'") !== -1, 'sw.js: module precached');
const langs = fs.readdirSync('public/modules/lang').filter((f) => f.endsWith('.mjs'));
const KEYS = ['invWarnInviteOnly', 'invWarnGuests', 'invWarnLocalhost', 'sharedTableRunning'];
const missing = [];
for (const f of langs) {
  const { strings } = await import('../public/modules/lang/' + f);
  for (const k of KEYS) if (!strings[k] || typeof strings[k] !== 'string') missing.push(f + ':' + k);
}
ok(missing.length === 0, 'i18n: 4 new keys present in all ' + langs.length + ' languages' + (missing.length ? ' — ' + missing.join(', ') : ''));

console.log('\n' + (n - fail) + '/' + n + ' passed');
process.exit(fail ? 1 : 0);
