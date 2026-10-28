#!/usr/bin/env node
// Deterministic tests for public/modules/arena-witness.mjs — the web client as
// a tournament witness: the table lookup, the summary of each hand (stacks by
// name, never cards), when it is sent (every 10 hands, when the player is out,
// at the end, when the page is hidden), the personal code kept by
// /arena, the option and the modes where nothing is sent.
// Run: node scripts/test-arena-witness-client.mjs
import { createWitness, takeHandoff } from '../public/modules/arena-witness.mjs';

let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗ ' + m); } else console.log('  ✓ ' + m); }
const tick = () => new Promise((r) => setTimeout(r, 0));

function rig(opts) {
  const calls = [];
  const store = new Map(Object.entries((opts && opts.store) || {}));
  const storage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
  const lookup = opts && 'lookup' in opts ? opts.lookup : { ok: true, key: 'KEY123456789', witnesses: 'informative', identity: 'simple' };
  const fetch = (url, o) => {
    calls.push({ url, o });
    if (/\/api\/table\?/.test(url)) return Promise.resolve({ ok: !!lookup, json: () => Promise.resolve(lookup) });
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
  };
  let on = !(opts && opts.off), online = !(opts && opts.offline);
  const w = createWitness({ fetch, storage, enabled: () => on, online: () => online, myName: () => 'Bob', origin: 'https://site' });
  return { w, calls, store, posts: () => calls.filter((c) => /\/witness$/.test(c.url)), setOn: (v) => { on = v; } };
}
const said = [];
const game = (id, name) => ({ gameId: id, name, say: (k) => said.push(k) });

// ── a tournament table ─────────────────────────────────────────────
{
  const R = rig({ store: { pth_td_regs: JSON.stringify({ KEY123456789: [{ nick: 'bob', code: 'ABCD2345' }] }) } });
  R.w.onGameStart(game(7, 'Friday cup'));
  await tick(); await tick();
  ok(R.calls[0].url === 'https://site/arena/api/table?game=7&name=Friday%20cup', 'lookup: the table by game id and name');
  ok(R.w.state().key === 'KEY123456789' && said.join() === 'tdWitnessNotice' && R.store.get('pth_td_witness_told') === '1', 'a tournament table: noted, the player told once what is sent');
  for (let h = 1; h <= 9; h++) R.w.onHandStart({ hand: h, stacks: { Ann: 1000 + h, Bob: 1000 - h, Cat: 1000 } });
  ok(R.posts().length === 0, 'nothing sent before 10 hands');
  R.w.onHandStart({ hand: 10, stacks: { Ann: 1500, Bob: 300, Cat: 1200 } });
  ok(R.posts().length === 1, 'every 10 hands: the summary goes out');
  const b = JSON.parse(R.posts()[0].o.body);
  ok(b.nick === 'Bob' && b.code === 'ABCD2345' && b.game === 7 && b.name === 'Friday cup' && R.posts()[0].o.keepalive === true, 'the report: nickname, personal code kept by /arena, game and table name, keepalive');
  ok(b.report.players.join() === 'Ann,Bob,Cat' && b.report.hands.length === 10 && b.report.hands[9].join() === '10,1500,300,1200' && !/card/i.test(R.posts()[0].o.body), 'compact: players once, one row per hand — no cards');
  R.w.onHandStart({ hand: 11, stacks: { Ann: 1800, Cat: 1200 } });
  ok(R.posts().length === 2 && JSON.parse(R.posts()[1].o.body).report.hands[10].join() === '11,1800,,1200', 'out of the game: sent at once (Bob no longer in)');
  R.w.onHide();
  ok(R.posts().length === 2, 'page hidden with nothing new: nothing sent');
  R.w.onHandStart({ hand: 12, stacks: { Ann: 3000 } });
  R.w.onGameOver('Ann');
  const last = JSON.parse(R.posts()[2].o.body).report;
  ok(R.posts().length === 3 && last.winner === 'Ann' && last.complete === true && last.hands.length === 12, 'end of the game: everything, with the winner');
  R.w.onGameStart(game(7, 'Friday cup'));
  ok(R.w.state().key === 'KEY123456789' && R.calls.filter((c) => /api\/table/.test(c.url)).length === 1, 'a rejoin of the same game keeps it (no second lookup)');
}

// ── a table of a tournament on several tables: the code kept under the tournament's key ──
{
  const R = rig({ lookup: { ok: true, key: 'TABLEKEY0001', parentKey: 'PARENTKEY001', witnesses: 'required' }, store: { pth_td_regs: JSON.stringify({ PARENTKEY001: [{ nick: 'Bob', code: 'WXYZ2345' }] }) } });
  R.w.onGameStart(game(21, 'Cup — table 2'));
  await tick(); await tick();
  for (let h = 1; h <= 10; h++) R.w.onHandStart({ hand: h, stacks: { Ann: 1000, Bob: 900 } });
  const b = JSON.parse(R.posts()[0].o.body);
  ok(/\/t\/TABLEKEY0001\/witness$/.test(R.posts()[0].url) && b.code === 'WXYZ2345', 'a table: the report goes to the table, with the code kept under its tournament');
}

// ── not a tournament table, the option, the modes ──────────────────
{
  const R = rig({ lookup: null });
  R.w.onGameStart(game(8, 'Casual'));
  await tick(); await tick();
  for (let h = 1; h <= 12; h++) R.w.onHandStart({ hand: h, stacks: { Ann: 1, Bob: 2 } });
  R.w.onGameOver('Ann');
  ok(R.w.state() === null && R.posts().length === 0, 'not a tournament table: nothing kept, nothing sent');
}
{
  const R = rig({ off: true });
  R.w.onGameStart(game(9, 'Friday cup'));
  await tick();
  ok(R.calls.length === 0, 'option off: no lookup, nothing sent');
}
{
  const R = rig({ offline: true });
  R.w.onGameStart(game(9, 'Friday cup'));
  await tick();
  ok(R.calls.length === 0, 'training or pokerth.net: no lookup');
}
{
  const R = rig({ lookup: { ok: true, key: 'KEY999999999', witnesses: 'off' } });
  R.w.onGameStart(game(10, 'Friendly'));
  await tick(); await tick();
  ok(R.w.state() === null, 'a tournament without witnesses: nothing kept');
}
{
  // Told once per browser.
  const before = said.length;
  const R = rig({ store: { pth_td_witness_told: '1' } });
  R.w.onGameStart(game(11, 'Cup'));
  await tick(); await tick();
  ok(said.length === before && R.w.state().key, 'already told: not again');
  // Turned off in the middle: nothing more goes out.
  R.setOn(false);
  for (let h = 1; h <= 10; h++) R.w.onHandStart({ hand: h, stacks: { Ann: 1, Bob: 2 } });
  R.w.onGameOver('Ann');
  ok(R.posts().length === 0, 'turned off during the game: nothing sent');
}
{
  // Size: a very long game stays under a keepalive request.
  const R = rig();
  R.w.onGameStart(game(12, 'Marathon'));
  await tick(); await tick();
  const ten = {}; for (let i = 0; i < 10; i++) ten['Player_with_a_long_name_' + i] = 123456789;
  for (let h = 1; h <= 2500; h++) R.w.onHandStart({ hand: h, stacks: ten });
  R.w.onGameOver('Player_with_a_long_name_0');
  const big = R.posts()[R.posts().length - 1].o.body;
  ok(big.length <= 60000 && JSON.parse(big).report.hands[JSON.parse(big).report.hands.length - 1][0] === 2500, 'a long game: the latest hands, under 60 KB (' + big.length + ' bytes)');
}

// ── the codes handed over by the Arena (#arena=…, web.325) ──────────
{
  const store = new Map([['pth_td_regs', JSON.stringify({ KEY123456789: [{ nick: 'bob', code: 'OLD12345' }, { nick: 'Zoe', code: 'ZZZZ1111' }] })]]);
  const storage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
  const enc = (o) => Buffer.from(JSON.stringify(o), 'utf8').toString('base64url');
  ok(takeHandoff('#join=Friday&s=lan.example', storage) === null, 'a hash without arena: left alone');
  const r = takeHandoff('#join=Friday%20cup&s=lan.example&arena=' + enc({ v: 1, regs: { KEY123456789: [{ nick: 'Bob', code: 'ABCD2345' }], PARENT1234: [{ nick: 'Bob', code: 'ABCD2345' }, { nick: 'Évé', code: 'EEEE2222' }] } }), storage);
  const regs = JSON.parse(store.get('pth_td_regs'));
  ok(r && r.taken === 3 && r.rest === '#join=Friday+cup&s=lan.example', 'codes taken; the invite link kept in the fragment, the codes gone from it');
  ok(regs.KEY123456789.length === 2 && regs.KEY123456789.find((x) => x.nick === 'Bob').code === 'ABCD2345' && regs.KEY123456789.find((x) => x.nick === 'Zoe'), 'same nickname replaced (any case), other ones kept');
  ok(regs.PARENT1234.length === 2 && regs.PARENT1234[1].nick === 'Évé', 'the tournament a table belongs to, and accented nicknames');
  const bad = takeHandoff('#arena=' + enc({ v: 1, regs: { 'bad key!': [{ nick: 'x', code: 'A1' }], OKKEY12345: [{ nick: '', code: 'A1' }, { nick: 'y', code: 'not a code' }] } }), storage);
  ok(bad && bad.taken === 0 && bad.rest === '' && !JSON.parse(store.get('pth_td_regs')).OKKEY12345, 'bad keys, nicknames and codes: dropped; the fragment cleared');
  ok(takeHandoff('#arena=%%%', storage).taken === 0 && takeHandoff('#arena=' + enc({ v: 2, regs: {} }), storage).taken === 0, 'unreadable or unknown versions: nothing taken');
  const R = rig({ store: { pth_td_regs: store.get('pth_td_regs') } });
  R.w.onGameStart(game(9, 'Friday cup'));
  await tick(); await tick();
  R.w.onGameOver('Bob');
  R.w.onHandStart({ hand: 1, stacks: { Bob: 1000, Ann: 1000 } });
  R.w.onGameOver('Bob');
  const last = R.posts().length ? JSON.parse(R.posts()[R.posts().length - 1].o.body) : null;
  ok(last && last.code === 'ABCD2345', 'the witness sends the code handed over');
}

// Storage blocked for the site (Edge: « Access is denied for this document »):
// reading the global throws; the witness must still be created (web.339).
{
  const desc = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { const e = new Error('Access is denied for this document.'); e.name = 'SecurityError'; throw e; } });
  let w2 = null, err = null;
  try { w2 = createWitness({ fetch: async () => ({ ok: true, json: async () => ({}) }) }); } catch (e) { err = e; }
  ok(!err && w2 && typeof w2.onGameStart === 'function', 'blocked localStorage: the witness is still created');
  if (desc) Object.defineProperty(globalThis, 'localStorage', desc); else delete globalThis.localStorage;
}

console.log((n - fail) + '/' + n + ' passed');
process.exit(fail ? 1 : 0);
