#!/usr/bin/env node
// End-to-end check of the session-ghost fix (forum report: after killing and
// relaunching the PWA, "Proxy connected — waiting for the PokerTH server…"
// until the grace expired). A fake PokerTH upstream greets every TCP
// connection with a distinctive ANNOUNCE frame; the real proxy.js is spawned
// against it; three browsers connect in sequence with the same sid:
//   1. a first page          → must receive the announce (fresh upstream #1);
//   2. its ghost stays in grace (abrupt terminate), and a RESUME (no &fresh)
//      must reattach WITHOUT a new announce — the mid-game wifi-blip path;
//   3. a NEW page (&fresh=1) → must receive a NEW announce (upstream #2),
//      proving the ghost was closed instead of trapping the handshake.
// Run: node scripts/test-proxy-fresh.mjs
import net from 'net';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let fails = 0, checks = 0;
function ok(cond, label) {
  checks++;
  console.log((cond ? '  \u2713 ' : '  \u2717 ') + label);
  if (!cond) fails++;
}
function frame(payload) {           // [u32 BE length][payload]
  const b = Buffer.alloc(4 + payload.length);
  b.writeUInt32BE(payload.length, 0);
  payload.copy(b, 4);
  return b;
}
const ANNOUNCE = Buffer.from('ANNOUNCE-HELLO');
let upstreamConnects = 0;

// ── Fake PokerTH server ─────────────────────────────────────────────
const fake = net.createServer((sock) => {
  upstreamConnects++;
  sock.write(frame(ANNOUNCE));
  sock.on('error', () => {});
});
await new Promise((res) => fake.listen(0, '127.0.0.1', res));
const FAKE_PORT = fake.address().port;

// ── Real proxy, spawned with the fake in its allowlist ──────────────
const PROXY_PORT = 18099;
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js')], {
  cwd: root,
  env: Object.assign({}, process.env, {
    PORT: String(PROXY_PORT),
    ALLOWED_HOSTS: '127.0.0.1',
    ALLOWED_PORTS: String(FAKE_PORT),
    ADMIN_ENABLED: '0',
  }),
  stdio: ['ignore', 'pipe', 'pipe'],
});
let plog = '';
proxy.stdout.on('data', (d) => { plog += d; });
proxy.stderr.on('data', (d) => { plog += d; });
await new Promise((res, rej) => {
  const t0 = Date.now();
  (function poll() {
    if (/listening|:\s*18099|démarré|8080|ready/i.test(plog) || Date.now() - t0 > 4000) return res();
    setTimeout(poll, 100);
  })();
});
await new Promise((r) => setTimeout(r, 400));   // settle

const SID = 'testsid-1234567890';
const base = 'ws://127.0.0.1:' + PROXY_PORT + '/?host=127.0.0.1&port=' + FAKE_PORT + '&tls=0&sid=' + SID + '&mode=lan&v=test';

// waitFor=true : résout dès l'announce (ou au timeout) — nécessaire pour les
// connexions neuves, que l'anti-throttle du proxy peut différer jusqu'à ~5 s
// (protection initBlocked côté serveur, volontairement conservée).
function connectAndCollect(url, ms, waitFor) {
  return new Promise((resolve) => {
    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
    const got = [];
    let done = false;
    const finish = () => { if (!done) { done = true; resolve({ ws, got }); } };
    ws.on('message', (d) => {
      got.push(Buffer.from(d));
      if (waitFor && sawAnnounce(got)) setTimeout(finish, 50);
    });
    ws.on('error', () => {});
    setTimeout(finish, ms);
  });
}
const sawAnnounce = (got) => got.some((b) => b.includes('ANNOUNCE-HELLO'));

try {
  // 1. First page: fresh handshake (with &fresh=1, as the client now sends).
  const c1 = await connectAndCollect(base + '&fresh=1', 7000, true);
  ok(sawAnnounce(c1.got), 'page 1: announce received on a fresh upstream');
  ok(upstreamConnects === 1, 'one upstream opened so far (got ' + upstreamConnects + ')');

  // The PWA is killed: abrupt close, no 4001 → the session enters grace.
  c1.ws.terminate();
  await new Promise((r) => setTimeout(r, 300));

  // 2. Same page context resuming (wifi blip): NO &fresh → pure reattach.
  const c2 = await connectAndCollect(base, 900);
  ok(!sawAnnounce(c2.got), 'resume: reattached to the live session, no replayed announce');
  ok(upstreamConnects === 1, 'resume: no new upstream opened (got ' + upstreamConnects + ')');
  c2.ws.terminate();
  await new Promise((r) => setTimeout(r, 300));

  // 3. The app relaunches: NEW page, same sid, &fresh=1 — the trap of the
  //    forum report. The ghost must be closed and a NEW upstream opened.
  const c3 = await connectAndCollect(base + '&fresh=1', 9000, true);
  ok(sawAnnounce(c3.got), 'relaunched page (&fresh=1): announce received — no more dead wait');
  ok(upstreamConnects === 2, 'the ghost was closed and a second upstream opened (got ' + upstreamConnects + ')');
  ok(/fant\u00f4me ferm\u00e9|Fresh connect/.test(plog), 'the proxy logged the ghost teardown');
  c3.ws.close(4001, 'bye');
} finally {
  try { proxy.kill('SIGTERM'); } catch (e) {}
  try { fake.close(); } catch (e) {}
}
await new Promise((r) => setTimeout(r, 200));
console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
