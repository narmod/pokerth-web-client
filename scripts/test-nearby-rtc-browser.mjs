#!/usr/bin/env node
// « Play nearby », step 2: the WebRTC carrier in a real browser. Two browser
// contexts (two « devices ») load the modules from a small static server; the
// host runs the LocalServer, the guest answers the host's connection code, the
// host takes the answer back, and the PokerTH conversation flows over the
// DataChannel: login, lobby chat both ways, wrong slot / other build refused,
// a closed link leaving the lobby. Codes are handed over by the test, as a
// person would with a QR code.
// Run: node scripts/test-nearby-rtc-browser.mjs   (needs Chrome / Chromium)
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { fileURLToPath } from 'url';
import { freePort } from './lib/free-port.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (c) console.log('  ✓ ' + m); else { fail++; console.log('  ✗ ' + m); } };

const port = await freePort();
const PAGE = '<!doctype html><meta charset="utf-8"><title>nearby</title><body>nearby test</body>';
const server = http.createServer((req, res) => {
  const u = decodeURIComponent((req.url || '/').split('?')[0]);
  if (u === '/' || u === '/t.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(PAGE); }
  const f = path.join(pub, path.normalize(u).replace(/^([/\\])+/, ''));
  if (!f.startsWith(pub) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': f.endsWith('.mjs') || f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(port, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + port + '/t.html';

let browser = null;
for (const opts of [{}, { executablePath: '/usr/bin/google-chrome' }, { channel: 'chrome' }]) {
  try { browser = await chromium.launch(Object.assign({ args: ['--no-sandbox'] }, opts)); break; } catch (e) {}
}
if (!browser) {
  console.log('  - no Chrome / Chromium available: skipped');
  server.close(); process.exit(0);
}

// Helpers injected in both pages: a minimal scripted PokerTH client over a socket.
const LIB = `
window.T = { proto: await import('/modules/offline/proto.mjs') };
window.cmsg = (type, spec) => T.proto.frame(T.proto.encode([[1,0,type],[type+1,2,T.proto.encode(spec)]]));
window.decode = (buf) => { const u8 = new Uint8Array(buf); const top = T.proto.readFields(u8.subarray(4)); const type = top[1][0]; const raw = top[type+1] && top[type+1][0]; return { type, f: raw ? T.proto.readFields(raw) : {} }; };
// Logs in (replaying a GUID when given), acks StartEvent, calls on its turns.
window.client = (sock, nick, guid) => {
  const c = { got: [], sock, pid: 0, guid: null };
  sock.binaryType = 'arraybuffer';
  sock.onmessage = (ev) => {
    const m = decode(ev.data); c.got.push(m);
    if (m.type === 1) sock.send(cmsg(2, [[1,2,T.proto.encode([[1,0,5],[2,0,1]])],[2,0,7], guid ? [3,2,guid] : [3,0,undefined], [5,0,2],[6,2,nick]]));
    if (m.type === 6) { c.pid = m.f[2][0]; c.guid = m.f[1][0]; }
    if (m.type === 36) sock.send(cmsg(37, [[1,0,m.f[1][0]]]));
    if (m.type === 41 && m.f[2][0] === c.pid) sock.send(cmsg(42, [[1,0,m.f[1][0]],[2,0,0],[3,0,m.f[3][0]],[4,0,3],[5,0,0]]));
  };
  sock.onclose = (ev) => { c.closed = ev.reason || 'closed'; };
  return c;
};
`;

const hostCtx = await browser.newContext(), guestCtx = await browser.newContext();
const host = await hostCtx.newPage(), guest = await guestCtx.newPage();
const errors = [];
for (const p of [host, guest]) p.on('pageerror', (e) => errors.push(e.message));
await host.goto(base); await guest.goto(base);
await host.evaluate(`(async () => { ${LIB}
  const { LocalServer } = await import('/modules/lan/local-server.mjs');
  const { createLocalSocket } = await import('/modules/lan/pipe-socket.mjs');
  window.RL = await import('/modules/lan/rtc-link.mjs');
  window.srv = new LocalServer({ botPool: [['Rocky','R','rock']] });
  window.me = client(createLocalSocket(srv), 'Host');
})()`);
await guest.evaluate(`(async () => { ${LIB} window.RL = await import('/modules/lan/rtc-link.mjs'); window.SG = await import('/modules/lan/signal.mjs'); })()`);

const until = async (page, expr, ms, arg) => { try { await page.waitForFunction(expr, arg === undefined ? null : arg, { timeout: ms || 15000, polling: 50 }); return true; } catch (e) { return false; } };

ok(await host.evaluate(() => RL.rtcSupported()) && await guest.evaluate(() => RL.rtcSupported()), 'WebRTC is available in both pages');
ok(await until(host, () => window.me.got.some(m => m.type === 6)), 'the host plays through its own in-page socket (InitAck)');

// ── pairing ──
const offer = await host.evaluate(async () => { window.inv = await RL.hostInvite(srv, { slot: 1, build: 'test-build', label: 'Host' }); return inv.payload; });
ok(typeof offer === 'string' && offer.length > 60 && offer.length <= 250, 'host offer code: ' + offer.length + ' characters');
const offInfo = await guest.evaluate((c) => { const d = SG.decodePayload(c); return { kind: d.kind, label: d.label, n: d.fields.candidates.length }; }, offer);
ok(offInfo.kind === 1 && offInfo.label === 'Host' && offInfo.n >= 1, 'the guest reads the offer: host name, at least one local address');

const wrongBuild = await guest.evaluate(async (c) => { try { await RL.guestAnswer(c, { build: 'other-build' }); return 'accepted'; } catch (e) { return e.code; } }, offer);
ok(wrongBuild === 'version', 'a guest on another version is refused before connecting (SignalError version)');

const answer = await guest.evaluate(async (c) => { window.g = await RL.guestAnswer(c, { build: 'test-build' }); window.gc = client(g.socket, 'Guest'); return g.payload; }, offer);
ok(typeof answer === 'string' && answer.length <= 250 && answer !== offer, 'guest answer code: ' + answer.length + ' characters');

// A stale answer from another invitation is refused.
const slot2 = await host.evaluate(async () => { window.inv2 = await RL.hostInvite(srv, { slot: 2, build: 'test-build', label: 'Host' }); return inv2.payload; });
const wrongSlot = await host.evaluate(async (a) => { try { await inv2.accept(a); return 'accepted'; } catch (e) { return e.code; } }, answer);
ok(wrongSlot === 'wrong-slot', 'an answer is only accepted by the invitation it answers (wrong-slot)');
await host.evaluate(() => inv2.close());
void slot2;

await host.evaluate(async (a) => { await inv.accept(a); }, answer);
ok(await until(guest, () => window.gc && window.gc.got.some(m => m.type === 6), 20000), 'DataChannel open: the guest logs in (Announce → Init → InitAck)');
ok(await until(host, () => srv.humans.size === 2), 'the host server counts two players');
ok(await until(host, () => window.me.got.some(m => m.type === 12 && m.f[1][0] === 2)), 'the host sees the guest arrive in the lobby (PlayerList)');

// ── lobby chat both ways ──
await guest.evaluate(() => gc.sock.send(cmsg(63, [[3, 2, 'hello from the guest']])));
ok(await until(host, () => me.got.some(m => m.type === 64 && new TextDecoder().decode(m.f[4][0]) === 'hello from the guest')), 'guest → host: lobby chat over the DataChannel');
await host.evaluate(() => me.sock.send(cmsg(63, [[3, 2, 'hello from the host']])));
ok(await until(guest, () => gc.got.some(m => m.type === 64 && new TextDecoder().decode(m.f[4][0]) === 'hello from the host')), 'host → guest: lobby chat over the DataChannel');

// ── a table across the link ──
await host.evaluate(() => {
  const gi = T.proto.encode([[1,2,'Across'],[2,0,1],[3,0,3],[4,0,1],[5,0,1],[7,0,1],[9,0,10],[10,0,1],[11,0,10],[12,0,50],[13,0,300]]);
  me.sock.send(cmsg(22, [[1, 2, gi]]));
});
ok(await until(guest, () => gc.got.some(m => m.type === 13)), 'the guest sees the host\'s table in his lobby (GameListNew)');
await guest.evaluate(() => gc.sock.send(cmsg(21, [[1, 0, 1]])));
ok(await until(guest, () => gc.got.some(m => m.type === 24)), 'the guest joins the table (JoinGameAck)');

// ── the link closes → the guest leaves the lobby ──
await guest.evaluate(() => g.close());
ok(await until(host, () => srv.humans.size === 1, 20000), 'closing the guest\'s link removes him from the host\'s lobby');
ok(await until(host, () => !srv.table || !srv.table.seats.includes(2)), '…and from the waiting table');

// ── seat recovery across a real re-pairing ──
async function pair(slot, guidExpr) {
  const off = await host.evaluate(async (sl) => { window.invS = await RL.hostInvite(srv, { slot: sl, build: 'test-build', label: 'Host' }); return invS.payload; }, slot);
  const ans = await guest.evaluate(async ([c, ge]) => {
    window.g = await RL.guestAnswer(c, { build: 'test-build' });
    window.gc = client(g.socket, 'Guest', ge ? window.lastGuid : null);
    return g.payload;
  }, [off, !!guidExpr]);
  await host.evaluate(async (a) => { await invS.accept(a); }, ans);
}
// A long game for this part: big stacks, blinds that never rise.
await host.evaluate(() => {
  me.sock.send(cmsg(31, [[1, 0, 1]]));
  const gi = T.proto.encode([[1,2,'Long'],[2,0,1],[3,0,3],[4,0,1],[5,0,1000],[7,0,1],[9,0,10],[10,0,1],[11,0,10],[12,0,10],[13,0,100000]]);
  me.sock.send(cmsg(22, [[1, 2, gi]]));
});
await pair(3, false);
ok(await until(guest, () => gc.got.some(m => m.type === 6) && gc.got.some(m => m.type === 13), 20000), 'paired again: the guest is back in the lobby and sees the table');
const gpid = await guest.evaluate(() => { window.lastGuid = gc.guid; gc.sock.send(cmsg(21, [[1, 0, 2]])); return gc.pid; });
ok(await until(guest, () => gc.got.some(m => m.type === 24)), 'he sits at the table again');
await host.evaluate(() => me.sock.send(cmsg(36, [[1, 0, 2], [2, 0, 0], [3, 0, 1]])));
ok(await until(guest, () => gc.got.some(m => m.type === 40), 20000), 'the game starts: the guest gets his HandStart over the DataChannel');
const hole = await guest.evaluate(() => { const m = gc.got.find(x => x.type === 40); return !!m.f[2]; });
ok(hole, '…with his own hole cards');
await guest.evaluate(() => g.close());
ok(await until(host, (id) => srv.humans.get(id) && !srv.humans.get(id).alive && srv.table && srv.table.engine.players.find(p => p.id === id).in, 20000, gpid), 'the link drops mid-game: his seat is kept (away)');
await pair(4, true);
ok(await until(guest, () => gc.got.some(m => m.type === 6 && m.f[4] && m.f[4][0] === 2), 20000), 'paired again with his GUID: InitAck.rejoinGameId');
const samePid = await guest.evaluate(() => gc.pid);
ok(samePid === gpid, 'he gets his own player id back');
await guest.evaluate(() => gc.sock.send(cmsg(23, [[1, 0, 2]])));
ok(await until(guest, () => gc.got.some(m => m.type === 39)), 'RejoinExistingGame → GameStartRejoin over the new link');
ok(await until(guest, () => gc.got.some(m => m.type === 40), 30000), 'he is dealt in again from the next hand');

ok(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); server.close();
console.log((n - fail) + '/' + n + ' passed');
process.exit(fail ? 1 : 0);
