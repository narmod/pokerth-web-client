#!/usr/bin/env node
// « Play nearby » — the in-app scanner against a camera that looks like a real
// phone's (web.352). A connection QR code drawn the way the dialog draws it
// (codes.mjs drawQr, level L, a real-length link) is « photographed »: shrunk
// to part of a 1280 × 720 or 1920 × 1080 frame, blurred, its contrast lowered,
// on a grey background — then fed to Chrome's fake camera, and qr-scan.mjs
// (jsQR path: Chrome on Linux has no BarcodeDetector, like Safari on iOS) must
// read it back. Before web.352 a code filling less than half the frame height
// was never read: the frame was cut down to 720 px wide and the camera left at
// its default resolution.
// Run: node scripts/test-nearby-scan-browser.mjs   (needs Chrome / Chromium and ffmpeg)
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import os from 'os'; import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { freePort } from './lib/free-port.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (c) console.log('  ✓ ' + m); else { fail++; console.log('  ✗ ' + m); } };
try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); } catch (e) { console.log('  - no ffmpeg: skipped'); process.exit(0); }

const TYPES = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.html': 'text/html' };
const port = await freePort();
const server = http.createServer((req, res) => {
  let u = decodeURIComponent((req.url || '/').split('?')[0]);
  if (u === '/') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end('<!doctype html><video id="cam" playsinline muted></video>'); }
  const f = path.join(pub, path.normalize(u).replace(/^([/\\])+/, ''));
  if (!f.startsWith(pub) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(port, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + port + '/';

async function launch(extra) {
  for (const opts of [{}, { executablePath: '/usr/bin/google-chrome' }, { channel: 'chrome' }]) {
    try { return await chromium.launch(Object.assign({ args: ['--no-sandbox'].concat(extra || []) }, opts)); } catch (e) {}
  }
  return null;
}

// A real-length offer link: client address, 2 mDNS candidates, nickname.
const LINK = 'https://webclient.pokerth.net/#lan-offer=' + 'EQABDjIuMS4xMC13ZWIuMzUyBUhvc3R5BFR4eVkYdTd2YkR1bG1WcVhpZ3pSc0Z0ZHJPRWE3'.repeat(3).slice(0, 172);

const b0 = await launch();
if (!b0) { console.log('  - no Chrome / Chromium available: skipped'); server.close(); process.exit(0); }
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pth-scan-'));
// Draw the code as a phone does (devicePixelRatio 3, 300 CSS px), then make the « photos ».
const ctx0 = await b0.newContext({ deviceScaleFactor: 3 });
const p0 = await ctx0.newPage();
await p0.goto(base);
const SCEN = [
  { w: 1280, h: 720, frac: 0.45, blur: 1.2 },
  { w: 1280, h: 720, frac: 0.35, blur: 0.8 },
  { w: 1920, h: 1080, frac: 0.3, blur: 1.5 },
  { w: 1920, h: 1080, frac: 0.25, blur: 1.0 },
];
const info = await p0.evaluate(async ({ link, scen }) => {
  const codes = await import('/modules/lan/codes.mjs');
  const qr = document.createElement('canvas');
  const m = await codes.drawQr(qr, link, 300);
  const out = [];
  for (const s of scen) {
    const f = document.createElement('canvas'); f.width = s.w; f.height = s.h;
    const c = f.getContext('2d');
    c.fillStyle = '#6e6e6e'; c.fillRect(0, 0, s.w, s.h);
    c.filter = 'blur(' + s.blur + 'px) contrast(0.7) brightness(0.95)';
    const side = Math.round(s.h * s.frac);
    c.drawImage(qr, Math.round((s.w - side) / 2), Math.round((s.h - side) / 2), side, side);
    out.push(f.toDataURL('image/png'));
  }
  return { modules: m.size, cssW: parseFloat(qr.style.width), devW: qr.width, rendering: qr.style.imageRendering, photos: out };
}, { link: LINK, scen: SCEN });
await b0.close();
ok(info.modules <= 57, 'level L: a ' + LINK.length + '-character link is ' + info.modules + ' × ' + info.modules + ' modules');
ok(Math.abs(info.cssW * 3 - info.devW) < 0.01 && info.rendering === 'pixelated', 'drawn sharp: shown at exactly its pixel size (' + info.devW + ' device px)');

for (let k = 0; k < SCEN.length; k++) {
  const s = SCEN[k];
  const png = path.join(tmp, 'p' + k + '.png'), y4m = path.join(tmp, 'p' + k + '.y4m');
  fs.writeFileSync(png, Buffer.from(info.photos[k].split(',')[1], 'base64'));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-loop', '1', '-i', png, '-t', '1', '-r', '10', '-pix_fmt', 'yuv420p', y4m]);
  const br = await launch(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-video-capture=' + y4m]);
  const ctx = await br.newContext({ permissions: ['camera'] });
  const p = await ctx.newPage();
  await p.goto(base);
  const r = await p.evaluate(async (want) => {
    const scan = await import('/modules/lan/qr-scan.mjs');
    const v = document.getElementById('cam');
    const t0 = performance.now();
    return new Promise(async (res) => {
      const h = await scan.startScan(v, { accept: (t) => t === want, onCode: (t) => res({ t, ms: Math.round(performance.now() - t0), vw: v.videoWidth }), onError: (c) => res({ err: c }) });
      setTimeout(() => { h.stop(); res({ none: true, vw: v.videoWidth }); }, 8000);
    });
  }, LINK);
  ok(r.t === LINK, 'camera ' + s.w + '×' + s.h + ', code ' + Math.round(s.frac * 100) + ' % of the height, blur ' + s.blur + ' px → read'
    + (r.t ? ' in ' + r.ms + ' ms' : (r.err ? ' — error ' + r.err : ' — not read (video ' + r.vw + ' px)')));
  await br.close();
}
// What the old pipeline did with the hardest of these frames (720 px wide, whole frame).
{
  const b = await launch();
  const p = await b.newPage(); await p.goto(base);
  const old = await p.evaluate(async (src) => {
    const scan = await import('/modules/lan/qr-scan.mjs');
    const img = new Image(); img.src = src; await img.decode();
    const sc = Math.min(1, 720 / img.width), c = document.createElement('canvas');
    c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, c.width, c.height);
    const before = await scan.decodeFrame(x.getImageData(0, 0, c.width, c.height));
    const r = scan.frameRect(img.width, img.height, 0), d = document.createElement('canvas'); d.width = r.ow; d.height = r.oh;
    const y = d.getContext('2d', { willReadFrequently: true }); y.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, r.ow, r.oh);
    const after = await scan.decodeFrame(y.getImageData(0, 0, r.ow, r.oh));
    return { before: !!before, after: !!after };
  }, info.photos[3]);
  ok(!old.before && old.after, 'the same 1920×1080 frame: unread cut down to 720 px (before web.352), read from its centre at full resolution');
  await b.close();
}
{
  const { frameRect } = await import(new URL('../public/modules/lan/qr-scan.mjs', import.meta.url).href);
  const a = frameRect(1920, 1080, 0), b = frameRect(1920, 1080, 1), c = frameRect(640, 480, 2);
  ok(a.sx === 420 && a.sw === 1080 && a.ow === 1080 && b.sx === 0 && b.sw === 1920 && b.ow === 1080 && b.oh === 608 && c.sw === 480 && c.ow === 480,
    'frameRect: centre square at full resolution, then the whole frame, at most 1080 px a side');
}
fs.rmSync(tmp, { recursive: true, force: true });
server.close();
console.log((n - fail) + '/' + n + ' passed');
process.exit(fail ? 1 : 0);
