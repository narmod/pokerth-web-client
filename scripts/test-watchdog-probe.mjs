// Active connection watchdog (net/watchdog.mjs, parity upstream 934457e):
// probe / notice / drop thresholds at the table and in the lobby, resume gap,
// server-version gate, probe packet, and its wiring.
import { readFileSync, readdirSync } from 'fs';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.test/', pretendToBeVisual: true });
for (const k of ['window', 'document', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'CustomEvent', 'Event'])
  { try { globalThis[k] = dom.window[k]; } catch (e) {} }
const { step, TABLE, LOBBY, PROBE_PID, serverSupportsProbe, buildProbe, probing } = await import('../public/modules/net/watchdog.mjs');
const { Proto } = await import('../public/modules/net/proto.mjs');
const { MSG } = await import('../public/modules/net/messages.mjs');
const { S } = await import('../public/modules/game/state.mjs');

let bad = 0;
const ok = (cond, label) => { console.log('  ' + (cond ? '✓' : 'FAIL') + ' ' + label); if (!cond) bad++; };

console.log('table (5 / 10 / 30 s):');
{
  const st = { lastTick: 0, lastProbe: 0 }, rx = 100000;
  let t = rx, r;
  const at = (s) => { t = rx + s * 1000; return step(st, t, rx, TABLE); };
  for (let s = 1; s <= 4; s++) r = at(s);
  ok(!r.probe && !r.stalled && !r.dead, 'silent 4 s: nothing');
  r = at(5); ok(r.probe && !r.stalled, '5 s: probe');
  r = at(6); ok(!r.probe, '6 s: no second probe within 5 s');
  for (let s = 7; s <= 9; s++) r = at(s);
  r = at(10); ok(r.probe && r.stalled && !r.dead, '10 s: probe again + notice');
  for (let s = 11; s <= 29; s++) r = at(s);
  ok(!r.dead, '29 s: still waiting');
  r = at(30); ok(r.dead && !r.probe, '30 s: drop, no probe');
}

console.log('lobby (50 / 60 / 80 s):');
{
  const st = { lastTick: 0, lastProbe: 0 }, rx = 0;
  let r;
  for (let s = 1; s <= 49; s++) r = step(st, rx + s * 1000, rx, LOBBY);
  ok(!r.probe && !r.stalled, '49 s (heartbeat every 45 s): no probe');
  r = step(st, 50000, rx, LOBBY); ok(r.probe, '50 s: probe');
  for (let s = 51; s <= 60; s++) r = step(st, s * 1000, rx, LOBBY);
  ok(r.stalled && !r.dead, '60 s: notice');
  for (let s = 61; s <= 80; s++) r = step(st, s * 1000, rx, LOBBY);
  ok(r.dead, '80 s: drop');
  const st2 = { lastTick: 0, lastProbe: 0 };
  for (let s = 1; s <= 46; s++) r = step(st2, s * 1000, s === 45 ? 45000 : (s > 45 ? 45000 : 0), LOBBY);
  ok(!r.probe && !r.stalled, 'heartbeat received: silence restarts');
}

console.log('resume gap:');
{
  const st = { lastTick: 1000000, lastProbe: 999000 };
  const r = step(st, 1040000, 990000, TABLE);   // 40 s without a tick, 50 s of "silence"
  ok(!r.dead && r.probe, 'back from sleep: probe at once, not dropped');
  ok(r.lastRx === 1040000 - TABLE.probe, 'silence counted from the probe threshold');
}

console.log('server gate:');
ok(serverSupportsProbe(0x0201) && serverSupportsProbe(0x0300), '2.1 and later: probe');
ok(!serverSupportsProbe(0x0200) && !serverSupportsProbe(0x0101) && !serverSupportsProbe(0), '2.0, 1.1, unknown: passive watchdog');

console.log('who is in charge:');
{
  document.body.innerHTML = '<div id="s-lobby" class="active"></div><div id="s-game"></div>';
  S._lastConnectParams = {}; S._intentionalDisconnect = false; S.ws = { readyState: 1 };
  S._srvVer = 0x0201;
  ok(probing() === true, 'pokerth.net-like 2.1 server, lobby, socket open: probe watchdog');
  ok(typeof window._wdProbing === 'function' && window._wdProbing() === true, 'bridge for the passive watchdog');
  S._srvVer = 0x0200; ok(probing() === false, '2.0 server: passive watchdog');
  S._srvVer = 0x0201; window._offlineMode = true; ok(probing() === false, 'training: no probe');
  window._offlineMode = false; window.LIVE_MODE = true; ok(probing() === false, '/live: no probe');
  window.LIVE_MODE = false; S.ws = { readyState: 0 }; ok(probing() === false, 'socket not open: no probe');
  S.ws = { readyState: 1 }; S._intentionalDisconnect = true; ok(probing() === false, 'after a logout: no probe');
  S._intentionalDisconnect = false; document.body.innerHTML = '<div id="s-connect" class="active"></div>';
  ok(probing() === false, 'login screen: no probe');
}

console.log('probe packet:');
{
  const d = Proto.decode(buildProbe());
  ok(Proto.u32(d, 1) === MSG.T.PlayerInfoRequest, 'PlayerInfoRequest');
  ok(Proto.u32(Proto.sub(d, 19), 1) === PROBE_PID && PROBE_PID === 0xFFFFFFFF, 'for player id 0xFFFFFFFF');
}

console.log('wiring:');
const rd = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const ml = rd('public/modules/net/msg-lobby.mjs');
ok(ml.indexOf('S._srvVer = ((gMaj & 0xff) << 8) | (gMin & 0xff);') !== -1, 'Announce records the server version');
const pir = ml.slice(ml.indexOf('function onPlayerInfoReply'));
ok(pir.indexOf('if (pid === 0xFFFFFFFF) return;') !== -1 && pir.indexOf('if (pid === 0xFFFFFFFF) return;') < pir.indexOf('S.players[pid] = name'), 'probe answer ignored before any bookkeeping');
const pk = rd('public/pokerth.js');
ok(pk.indexOf('if (window._wdProbing && window._wdProbing()) return;') !== -1, 'passive watchdog stands down while probing');
ok(rd('public/pokerth-client.html').indexOf('<script type="module" src="modules/net/watchdog.mjs"></script>') !== -1, 'module loaded by the page');
ok(rd('public/sw.js').indexOf("'/modules/net/watchdog.mjs'") !== -1, 'module precached');
ok(rd('public/modules/game/state.mjs').indexOf('_srvVer: 0,') !== -1, 'state field');
const langs = readdirSync(new URL('../public/modules/lang/', import.meta.url)).filter((f) => f.endsWith('.mjs'));
const miss = langs.filter((f) => { const s = rd('public/modules/lang/' + f); return s.indexOf('connStalledTitle') === -1 || s.indexOf('connStalledMsg') === -1; });
ok(langs.length >= 83 && miss.length === 0, 'notice strings in every catalogue (' + langs.length + ')' + (miss.length ? ' missing: ' + miss.join(',') : ''));

if (bad) { console.log('\n' + bad + ' FAIL'); process.exit(1); }
console.log('\nall ok');
process.exit(0);   // the module's 1 s timer would keep Node alive
