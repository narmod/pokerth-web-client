#!/usr/bin/env node
// Training → LAN / Internet without a page reload (narmod 2026-10-19).
// The training fake server answered Init with a 4-byte session GUID; the client
// kept it and replayed it as InitMessage.myLastSessionId on the next network
// login. The real server's NetPacketValidator only accepts 16 bytes and closes
// the session on anything else, so every attempt dropped at once and only a
// reload cleared it. LAN <-> Internet was not affected (real GUIDs).
// Here the "LAN server" is the training engine behind a real TCP socket, with
// the same Init check as the PokerTH server; the browser goes through proxy.js.
// Run: node scripts/test-offline-to-network-browser.mjs
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path'; import net from 'net';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import { freePort, waitForServer } from './lib/free-port.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const k of ['window', 'document', 'localStorage', 'navigator', 'CustomEvent', 'Event']) { try { globalThis[k] = k === 'window' ? dom.window : dom.window[k]; } catch (e) {} }
const { FakeServer } = await import(path.join(root, 'public/modules/offline/server.mjs'));
const { parseClientFrame } = await import(path.join(root, 'public/modules/offline/proto.mjs'));

let invalidInits = 0, inits = 0;
const lan = net.createServer((s) => {
  s.on('error', () => {});
  const srv = new FakeServer({ me: { name: 'LanUser' }, botPool: [['B1', 'x', 'rock'], ['B2', 'y', 'tag']], rng: Math.random, pace: (fn, ms) => setTimeout(fn, ms || 0) });
  srv.deliver = (fr) => { try { s.write(Buffer.from(fr)); } catch (e) {} };
  let buf = Buffer.alloc(0);
  s.on('data', (d) => {
    buf = Buffer.concat([buf, d]);
    while (buf.length >= 4) {
      const len = buf.readUInt32BE(0); if (buf.length < 4 + len) break;
      const f = new Uint8Array(buf.subarray(0, 4 + len)); buf = buf.subarray(4 + len);
      try {
        const m = parseClientFrame(f);
        if (m.typeId === 2) {   // Init: same rule as NetPacketValidator::ValidateInitMessage
          inits++;
          const g = m.fields[3] && m.fields[3][0];
          if (g && g.length !== 16) { invalidInits++; s.destroy(); return; }
        }
        srv.onClientFrame(f);
      } catch (e) {}
    }
  });
  s.on('close', () => { srv.stopped = true; });
  srv.begin();
});
await new Promise((r) => lan.listen(0, '127.0.0.1', r));
const LAN = lan.address().port;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'off2net-'));
fs.writeFileSync(path.join(tmp, 'cfg.json'), JSON.stringify({ lanDirectory: { settings: { refusePrivate: false, manualEntry: true, localEntry: true }, entries: [] } }));
// A free port from the OS, not a random pick in a range other tests share: a
// proxy left over by another test on the same port answered this page with its
// own allowlist, and the LAN dial was refused (« inits=0 », flaky full-suite run).
const PORT = await freePort();
const env = { PORT: String(PORT), ALLOWED_PORTS: String(LAN), STATS_ADMIN_TOKEN: 'x', ADMIN_CONFIG_FILE: path.join(tmp, 'cfg.json') };
for (const k of ['STATS_FILE', 'STATS_META_FILE', 'AUDIT_FILE', 'VISITS_FILE', 'BROADCASTS_FILE', 'POLLS_FILE', 'SCOPED_TOKENS_FILE', 'DEPLOY_HISTORY_FILE', 'DB_CONFIG_FILE']) env[k] = path.join(tmp, k.toLowerCase() + '.json');
const px = spawn(process.execPath, [path.join(root, 'proxy.js')], { cwd: root, env: Object.assign({}, process.env, env), stdio: 'ignore' });
const base = 'http://127.0.0.1:' + PORT;
// Wait until OUR proxy answers (not a fixed delay: a slow start under load).
try { await waitForServer(base, px); } catch (e) { console.log('FAIL ' + e.message); px.kill(); lan.close(); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();

const screen = (pg) => pg.evaluate(() => (document.querySelector('.screen.active') || {}).id);
const pick = (m) => async (pg) => { await pg.evaluate((mm) => { if (document.getElementById('login-step2').style.display !== 'none') loginBackToStep1(); loginPickMode(document.querySelector('.login-card[onclick*="\'' + mm + '\'"]'), mm); }, m); await sleep(800); };
const nick = (n) => (pg) => pg.fill('#nick', n);
const lanAddr = (pg) => pg.evaluate((p) => { document.getElementById('host').value = '127.0.0.1'; document.getElementById('port').value = String(p); document.getElementById('use-tls').checked = false; document.getElementById('proxy').value = location.origin.replace('http', 'ws'); }, LAN);
const connect = (wait) => async (pg) => { await pg.evaluate(() => App.connect()); await sleep(wait); };
const disc = async (pg) => { await pg.evaluate(() => App.disconnect()); await sleep(800); };
const play = async (pg) => {
  await pg.evaluate(() => App.createGame()); await sleep(1500);
  await pg.evaluate(() => App.startWithBots()); await sleep(5000);
  await pg.evaluate(() => App.leaveGame()); await sleep(1000);
  await pg.evaluate(() => App.closeCreatePage()); await sleep(1000);
};

let pass = 0, fail = 0;
async function scenario(label, steps) {
  invalidInits = 0; inits = 0;
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('x')) { localStorage.clear(); sessionStorage.setItem('x', '1'); } localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_lang', 'en'); localStorage.setItem('pth_bak_auto', '0'); } catch (e) {} });
  const pg = await ctx.newPage();
  await pg.goto(base + '/'); await pg.waitForSelector('.login-card'); await sleep(1200);
  for (const s of steps) await s(pg);
  // The lobby may take a little longer on a loaded machine: poll up to 15 s
  // more instead of trusting the fixed wait of the last step.
  for (let i = 0; i < 30 && (await screen(pg)) !== 's-lobby'; i++) await sleep(500);
  const sc = await screen(pg);
  const ok = sc === 's-lobby' && invalidInits === 0 && inits >= 1;
  ok ? pass++ : fail++;
  const st = ok ? '' : await pg.evaluate(() => ((document.querySelector('#s-connect .status, #status, .conn-status') || {}).textContent || '').trim()).catch(() => '');
  console.log((ok ? 'ok   ' : 'FAIL ') + label + (ok ? '' : ` — screen=${sc} inits=${inits} rejected=${invalidInits} status="${st}"`));
  await ctx.close();
}

try {
  await scenario('LAN alone reaches the lobby', [pick('lan-dedi'), nick('Narmod'), lanAddr, connect(4000)]);
  await scenario('training picked (no connect) then LAN reaches the lobby', [pick('offline'), nick('Narmod'), pick('lan-dedi'), lanAddr, connect(4000)]);
  await scenario('training connected, left, then LAN reaches the lobby', [pick('offline'), nick('Narmod'), connect(3000), disc, pick('lan-dedi'), lanAddr, connect(5000)]);
  await scenario('training game played, left, then LAN reaches the lobby', [pick('offline'), nick('Narmod'), connect(3000), play, pick('lan-dedi'), lanAddr, connect(5000)]);
} finally {
  await b.close(); px.kill(); lan.close();
}
console.log(fail ? `${fail} FAILED, ${pass} passed` : `All ${pass} checks passed`);
process.exit(fail ? 1 : 0);
