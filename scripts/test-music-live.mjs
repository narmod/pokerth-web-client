#!/usr/bin/env node
// « Listening now » (admin Live › Sessions): what the music panels play at
// this instant, as totals per title. Run: node scripts/test-music-live.mjs
//
// The failures worth guarding are the silent ones: a client writing « M: »
// frames to a socket that is not our proxy (pokerth.net direct, an older
// proxy that would count them as malformed game frames and close the
// session), a tab counted twice because it holds two sockets, a listener
// left behind after the page closed, an unknown id creating keys, or a
// nickname leaking into the totals.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import net from 'net';
import WebSocket from 'ws';
import { freePort, waitForServer } from './lib/free-port.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// ── 1. The client module, in isolation ──────────────────────────────────
globalThis.window = globalThis;
const listeners = {};
globalThis.document = { addEventListener: (t, f) => { (listeners[t] = listeners[t] || []).push(f); } };
const ML = await import(path.join(root, 'public', 'modules', 'net', 'music-live.mjs'));
function fakeSock() { const s = { readyState: 1, sent: [], send(x) { this.sent.push(x); }, addEventListener() {} }; return s; }
const emit = (playing, id) => listeners['pth-music-state'].forEach((f) => f({ detail: { playing, id } }));

const a = fakeSock(), b = fakeSock(), direct = fakeSock();
ok(ML.ctl(a, 'INFO:x') === false && ML.ctl(a, 'MLIVE:2') === false, 'only the exact announcement is taken');
ok(ML.ctl(a, 'MLIVE:1') === true && a.sent.length === 0, 'an announced socket is tracked, nothing sent before any playback');
emit(true, 't1');
ok(a.sent.length === 1 && /^M:[a-z0-9]{16}:t1$/.test(a.sent[0]), 'playback start: « M:<tab>:<id> » on the proxy socket');
ok(direct.sent.length === 0, 'a socket that never announced itself (pokerth.net direct, an older proxy) gets nothing');
emit(true, 't1');
ok(a.sent.length === 1, 'an unchanged state sends nothing again');
ML.ctl(b, 'MLIVE:1');
ok(b.sent.length === 1 && b.sent[0] === a.sent[0], 'a second proxy socket gets the current state at once, same tab token');
emit(false, 't1');
ok(a.sent[1] === a.sent[0].replace(/t1$/, '') && b.sent[1] === a.sent[1], 'pause: « M:<tab>: » on every proxy socket');
a.readyState = 3; emit(true, 'r1');
ok(a.sent.length === 2 && b.sent[2].endsWith(':r1'), 'a closed socket is skipped and forgotten');
ok(typeof window._pthMusicLive.ctl === 'function', 'pokerth.js reaches it through window._pthMusicLive');

// ── 2. The wiring ───────────────────────────────────────────────────────
const pjs = fs.readFileSync(path.join(root, 'public', 'pokerth.js'), 'utf8');
const pres = fs.readFileSync(path.join(root, 'public', 'modules', 'games', 'presence.mjs'), 'utf8');
const html = fs.readFileSync(path.join(root, 'public', 'pokerth-client.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'public', 'sw.js'), 'utf8');
const proxySrc = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
ok(/_pthMusicLive\.ctl\(S\.ws, data\)/.test(pjs), 'the game socket answers the proxy announcement');
ok(/_pthMusicLive\.ctl\(sck, e\.data\)/.test(pjs), 'the notice channel (pokerth.net direct, training) answers it too');
ok(/musicLiveCtl\(me, e\.data\)/.test(pres), 'the Mini-games channel answers it too');
ok(html.indexOf('src="modules/net/music-live.mjs"') > 0 && sw.indexOf("'/modules/net/music-live.mjs'") > 0, 'the module is loaded by the page and precached');
ok(!/nick|chatNick|playerId/.test(proxySrc.slice(proxySrc.indexOf('function musicLiveSnapshot'), proxySrc.indexOf('function musicLiveSnapshot') + 900)),
  'the snapshot carries no nickname');

// ── 3. The real proxy ───────────────────────────────────────────────────
const T = fs.mkdtempSync(path.join(os.tmpdir(), 'mlive-'));
const TOKEN = 'tok-mlive-test';
fs.writeFileSync(path.join(T, 'cfg.json'), JSON.stringify({ musicTracks: [
  { id: 't1', title: 'First Song', artist: 'Someone', file: '/music/t1.mp3', active: true },
  { id: 'r1', title: 'Some Radio', genre: 'Jazz', file: 'https://radio.example/stream', stream: true, active: true },
] }));
// A fake PokerTH server: records every byte the proxy relays upstream.
let upBytes = Buffer.alloc(0);
const fake = net.createServer((sock) => { sock.on('data', (d) => { upBytes = Buffer.concat([upBytes, d]); }); sock.on('error', () => {}); });
await new Promise((r) => fake.listen(0, '127.0.0.1', r));
const FAKE_PORT = fake.address().port;
const PORT = await freePort();
const env = { PORT: String(PORT), STATS_ADMIN_TOKEN: TOKEN, ADMIN_CONFIG_FILE: path.join(T, 'cfg.json'), RATE_LIMIT_DISABLED: '1',
  ALLOWED_HOSTS: '127.0.0.1', ALLOWED_PORTS: String(FAKE_PORT) };
for (const k of ['STATS_FILE', 'STATS_META_FILE', 'AUDIT_FILE', 'VISITS_FILE', 'BROADCASTS_FILE', 'POLLS_FILE', 'SCOPED_TOKENS_FILE', 'HOF_FILE']) env[k] = path.join(T, k.toLowerCase() + '.json');
const px = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, env: Object.assign({}, process.env, env), stdio: 'ignore' });
const base = 'http://127.0.0.1:' + PORT;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const snap = async () => (await (await fetch(base + '/admin/sessions', { headers: { Authorization: 'Bearer ' + TOKEN } })).json()).music;
function open(q) {
  return new Promise((res, rej) => {
    const w = new WebSocket('ws://127.0.0.1:' + PORT + '/?' + q);
    w.got = [];
    w.on('message', (d, bin) => { if (!bin) w.got.push(String(d)); });
    w.on('open', () => res(w)); w.on('error', rej);
  });
}
try {
  await waitForServer(base, px);
  ok(Array.isArray(await snap()) && (await snap()).length === 0, '/admin/sessions carries an empty « music » list');
  const w1 = await open('notify=1&mode=pthnet&v=test');
  const w2 = await open('notify=1&mode=arcade&v=test');
  await sleep(150);
  ok(w1.got.indexOf('MLIVE:1') >= 0 && w2.got.indexOf('MLIVE:1') >= 0, 'the proxy announces itself on notice channels');
  const TAB = 'abcdefgh12345678';
  w1.send('M:' + TAB + ':t1'); w2.send('M:' + TAB + ':t1');
  w1.send('M:zzzzzzzz00000000:r1');
  w1.send('M:yyyyyyyy00000000:nope'); w1.send('M:bad:t1'); w1.send('M:' + 'x'.repeat(120));
  await sleep(150);
  let m = await snap();
  const by = Object.fromEntries(m.map((r) => [r.id, r]));
  ok(by.t1 && by.t1.n === 1, 'one tab on two sockets counts once');
  ok(by.r1 && by.r1.n === 1 && by.r1.stream === true && by.r1.title === 'Some Radio', 'a radio station is counted, with its title');
  ok(by.t1.title === 'First Song' && by.t1.artist === 'Someone' && by.t1.stream === false, 'a track carries its title and artist');
  ok(!by.nope && m.length === 2, 'unknown ids and malformed frames create nothing');
  w2.close(); await sleep(150);
  m = await snap();
  ok(m.some((r) => r.id === 't1' && r.n === 1), 'closing one of the two sockets keeps the tab listening');
  w1.send('M:' + TAB + ':'); await sleep(150);
  m = await snap();
  ok(!m.some((r) => r.id === 't1') && m.some((r) => r.id === 'r1'), 'pause/stop removes that tab only');
  w1.close(); await sleep(200);
  ok((await snap()).length === 0, 'a closed page leaves nothing behind');
  const w3 = await open('notify=1&mode=pthnet&v=test');
  for (let i = 0; i < 40; i++) w3.send('M:flood' + String(i).padStart(3, '0') + 'aaaa:t1');
  await sleep(200);
  const f = (await snap()).find((r) => r.id === 't1');
  ok(f && f.n <= 4, 'one socket cannot speak for more than a few tabs (flood bounded)');
  w3.close(); await sleep(150);
  // Game bridge: the same frames must stop at the proxy, never reach the server.
  const g = await open('host=127.0.0.1&port=' + FAKE_PORT + '&tls=0&sid=mlivesid-0123456789&mode=lan&v=test');
  await sleep(300);
  ok(g.got.indexOf('MLIVE:1') >= 0, 'the proxy announces itself on a game bridge');
  for (let i = 0; i < 12; i++) g.send('M:bridgetab00000' + (i % 2) + ':' + (i % 2 ? 'r1' : 't1'));
  await sleep(300);
  ok(g.readyState === 1, 'a dozen « M: » frames do not close the bridge (no malformed-frame strikes)');
  ok(upBytes.indexOf('M:bridgetab') < 0, 'no « M: » frame is relayed to the PokerTH server');
  ok((await snap()).length === 2, 'the bridge listeners are counted');
  g.close(); await sleep(200);
  ok((await snap()).length === 0, 'and gone with the bridge');
} catch (e) {
  ok(false, 'proxy run: ' + (e && e.message));
} finally {
  try { px.kill(); } catch (e) {}
  try { fake.close(); } catch (e) {}
  try { fs.rmSync(T, { recursive: true, force: true }); } catch (e) {}
}
console.log(fail ? '\n' + fail + '/' + n + ' FAILED' : '\nall ' + n + ' checks passed');
process.exit(fail ? 1 : 0);
