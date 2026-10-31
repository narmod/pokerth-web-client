#!/usr/bin/env node
// « Play nearby », step 3: handing the connection codes over, end to end in
// Chrome. Two browsers (two « phones »):
//   · the host draws its offer as a QR code (codes.mjs drawQr);
//   · the guest's camera is fed that very picture (Chrome's fake capture) and
//     the in-app scanner reads it (qr-scan.mjs — jsQR here, Linux Chrome has
//     no BarcodeDetector), then answers;
//   · the host « scans the answer with the phone's camera app »: the answer
//     link opens in a NEW tab, which relays it to the game tab
//     (link-relay.mjs); the pairing completes and the guest logs in.
// Also: share falls back to the clipboard, and a page without a camera gets
// a clean error code.
// Run: node scripts/test-nearby-codes-browser.mjs   (needs Chrome / Chromium)
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import os from 'os'; import path from 'path';
import { fileURLToPath } from 'url';
import { freePort } from './lib/free-port.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (c) console.log('  ✓ ' + m); else { fail++; console.log('  ✗ ' + m); } };

const port = await freePort();
const PAGE = '<!doctype html><meta charset="utf-8"><title>nearby</title><body><canvas id="qr"></canvas><video id="cam" width="320" height="240"></video></body>';
const server = http.createServer((req, res) => {
  const u = decodeURIComponent((req.url || '/').split('?')[0]);
  if (u === '/' || u === '/t.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(PAGE); }
  const f = path.join(pub, path.normalize(u).replace(/^([/\\])+/, ''));
  if (!f.startsWith(pub) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': f.endsWith('.mjs') || f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(port, '127.0.0.1', r));
// 127.0.0.1 is a secure context: camera and clipboard are allowed.
const base = 'http://127.0.0.1:' + port + '/t.html';

async function launch(extra) {
  for (const opts of [{}, { executablePath: '/usr/bin/google-chrome' }, { channel: 'chrome' }]) {
    try { return await chromium.launch(Object.assign({ args: ['--no-sandbox'].concat(extra || []) }, opts)); } catch (e) {}
  }
  return null;
}
const hostBrowser = await launch();
if (!hostBrowser) { console.log('  - no Chrome / Chromium available: skipped'); server.close(); process.exit(0); }

const LIB = `
window.T = { proto: await import('/modules/offline/proto.mjs') };
window.cmsg = (type, spec) => T.proto.frame(T.proto.encode([[1,0,type],[type+1,2,T.proto.encode(spec)]]));
window.decode = (buf) => { const u8 = new Uint8Array(buf); const top = T.proto.readFields(u8.subarray(4)); const type = top[1][0]; const raw = top[type+1] && top[type+1][0]; return { type, f: raw ? T.proto.readFields(raw) : {} }; };
window.client = (sock, nick) => { const c = { got: [] }; sock.binaryType = 'arraybuffer';
  sock.onmessage = (ev) => { const m = decode(ev.data); c.got.push(m); if (m.type === 1) sock.send(cmsg(2, [[1,2,T.proto.encode([[1,0,5],[2,0,1]])],[2,0,7],[5,0,2],[6,2,nick]])); };
  return c; };
window.L = { codes: await import('/modules/lan/codes.mjs'), scan: await import('/modules/lan/qr-scan.mjs'),
  relay: await import('/modules/lan/link-relay.mjs'), rtc: await import('/modules/lan/rtc-link.mjs') };
`;
const errors = [];
const until = async (page, expr, ms, arg) => { try { await page.waitForFunction(expr, arg === undefined ? null : arg, { timeout: ms || 15000, polling: 50 }); return true; } catch (e) { return false; } };

// ── host: server, offer, QR on screen, listening for relayed answers ──
const hostCtx = await hostBrowser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
const host = await hostCtx.newPage(); host.on('pageerror', e => errors.push('host: ' + e.message));
await host.goto(base);
await host.evaluate(`(async () => { ${LIB}
  const { LocalServer } = await import('/modules/lan/local-server.mjs');
  const { createLocalSocket } = await import('/modules/lan/pipe-socket.mjs');
  window.srv = new LocalServer({ botPool: [['Rocky','R','rock']] });
  window.me = client(createLocalSocket(srv), 'Host');
  window.inv = await L.rtc.hostInvite(srv, { slot: 5, build: 'test-build', label: 'Host' });
  window.offerLink = L.codes.codeLink(inv.payload, 'offer');
  window.taken = [];
  L.relay.listenForCodes((found) => {
    if (found.kind !== 'answer' || found.info.slot !== inv.slot) return false;
    taken.push(found.code); inv.accept(found.code).catch(e => taken.push('ERR ' + e.code));
    return true;
  });
  window.qrInfo = await L.codes.drawQr(document.getElementById('qr'), offerLink, 240);
})()`);
const offerLink = await host.evaluate(() => offerLink);
ok(offerLink.startsWith(base + '#lan-offer='), 'host: offer link on the client\'s own address (' + offerLink.length + ' characters)');
const shot = await host.evaluate(() => { const c = document.getElementById('qr'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height); return { w: c.width, h: c.height, px: Array.from(d.data) }; });
ok(shot.w > 150 && shot.w === shot.h, 'host: QR code drawn (' + shot.w + ' px, ' + (await host.evaluate(() => qrInfo.size)) + ' modules)');
const shareRes = await host.evaluate(async (l) => { const r = await L.codes.shareLink(l, { title: 't' }); const back = await navigator.clipboard.readText(); return { r, same: back === l }; }, offerLink);
ok((shareRes.r === 'copied' && shareRes.same) || shareRes.r === 'shared', 'share: no share sheet here → the link is copied to the clipboard (' + shareRes.r + ')');
const camErr = await host.evaluate(async () => new Promise(async (res) => { const h = await L.scan.startScan(document.getElementById('cam'), { onCode: () => res('code?'), onError: (c) => res(c) }); setTimeout(() => { h.stop(); res('none'); }, 5000); }));
ok(['no-camera', 'camera-denied', 'camera-error'].includes(camErr), 'scanner without a usable camera → clean error code (' + camErr + ')');

// ── the guest's camera sees the host's screen ──
// The QR picture centred in a white 640×480 frame, written as a Y4M video for
// Chrome's fake camera (Y = grey level, U = V = 128).
const W = 640, H = 480, y4m = path.join(os.tmpdir(), 'pth-nearby-qr-' + process.pid + '.y4m');
{
  const Y = Buffer.alloc(W * H, 255), UV = Buffer.alloc(W * H / 2, 128);
  const ox = (W - shot.w) >> 1, oy = (H - shot.h) >> 1;
  for (let y = 0; y < shot.h; y++) for (let x = 0; x < shot.w; x++) {
    const i = (y * shot.w + x) * 4;
    Y[(oy + y) * W + ox + x] = Math.round(0.299 * shot.px[i] + 0.587 * shot.px[i + 1] + 0.114 * shot.px[i + 2]);
  }
  const parts = [Buffer.from(`YUV4MPEG2 W${W} H${H} F10:1 Ip A1:1 C420jpeg\n`)];
  for (let k = 0; k < 10; k++) parts.push(Buffer.from('FRAME\n'), Y, UV);
  fs.writeFileSync(y4m, Buffer.concat(parts));
}
const guestBrowser = await launch(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-video-capture=' + y4m]);
const guestCtx = await guestBrowser.newContext({ permissions: ['camera'] });
const guest = await guestCtx.newPage(); guest.on('pageerror', e => errors.push('guest: ' + e.message));
await guest.goto(base);
await guest.evaluate(`(async () => { ${LIB}
  window.scanned = null; window.scanErr = null;
  window.scanH = await L.scan.startScan(document.getElementById('cam'), {
    accept: (t) => { try { return L.codes.readCode(t).kind === 'offer'; } catch (e) { return false; } },
    onCode: (t) => { window.scanned = t; }, onError: (c) => { window.scanErr = c; },
  });
})()`);
ok(await until(guest, () => window.scanned || window.scanErr, 20000), 'guest: the scanner reads something from the camera');
const scanned = await guest.evaluate(() => window.scanned || ('ERR ' + window.scanErr));
ok(scanned === offerLink, 'guest: the in-app scanner reads the host\'s QR code exactly');
ok(await guest.evaluate(() => !window.scanH.running), 'guest: the camera stops once the code is read');

const answerLink = await guest.evaluate(async () => {
  const found = L.codes.readCode(window.scanned);
  window.g = await L.rtc.guestAnswer(found.code, { build: 'test-build' });
  window.gc = client(g.socket, 'Guest');
  return L.codes.codeLink(g.payload, 'answer', location.origin + location.pathname);
});
ok(answerLink.startsWith(base + '#lan-answer='), 'guest: answer link ready (' + answerLink.length + ' characters)');

// ── the host opens the answer link with his camera app: a new tab ──
const tab2 = await hostCtx.newPage(); tab2.on('pageerror', e => errors.push('tab2: ' + e.message));
await tab2.goto(answerLink);
const relayed = await tab2.evaluate(async () => {
  const codes = await import('/modules/lan/codes.mjs'), relay = await import('/modules/lan/link-relay.mjs');
  const found = codes.codeFromLocation();
  const took = found ? await relay.relayCode(found) : false;
  codes.clearCodeFromLocation();
  return { kind: found && found.kind, took, hash: location.hash };
});
ok(relayed.kind === 'answer' && relayed.took, 'new tab: reads the code from its address and hands it to the game tab');
ok(relayed.hash === '', 'new tab: the code is removed from the address bar');
ok(await until(host, () => taken.length === 1 && !String(taken[0]).startsWith('ERR')), 'game tab: the answer is accepted');
ok(await until(guest, () => window.gc && gc.got.some(m => m.type === 6), 20000), 'paired: the guest logs in to the host over WebRTC');
ok(await until(host, () => srv.humans.size === 2), 'the host counts two players');

ok(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await guestBrowser.close(); await hostBrowser.close(); server.close();
try { fs.unlinkSync(y4m); } catch (e) {}
console.log((n - fail) + '/' + n + ' passed');
process.exit(fail ? 1 : 0);
