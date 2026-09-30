#!/usr/bin/env node
// Ace's Help — saved progress (modules/guide/state.mjs) and its account sync
// wiring in pokerth.js: parsing hostile values, marking tips seen, « Show all
// tips again », the two-device merge (union after the latest reset), the
// offer flag, and nothing synced for guests (the /prefs-web channel only
// exists with an authenticated token).
// Run: node scripts/test-guide-state.mjs
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const G = await import(pathToFileURL(path.resolve('public/modules/guide/state.mjs')).href);

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}
function mem() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), map: m };
}

// ── parsing ──
for (const junk of [null, '', 'x', '[]', '42', '{"r":"a","s":[1]}', '{"s":{"BAD ID":5,"ok":"n"}}', 'z'.repeat(20001)]) {
  const p = G.parseSeen(junk);
  ok(p.r === 0 && Object.keys(p.s).length === 0, 'junk seen value → empty record: ' + String(junk).slice(0, 24));
}
ok(G.parseSeen('{"r":10,"s":{"a":5,"b":20}}').s.a === undefined, 'a sighting older than the reset is dropped');
ok(G.parseSeen('{"r":10,"s":{"a":5,"b":20}}').s.b === 20, 'a sighting after the reset is kept');
ok(G.serializeSeen({ r: 0, s: { b: 2, a: 1 } }) === '{"r":0,"s":{"a":1,"b":2}}', 'stable serialisation (sorted ids)');

// ── one device ──
let t = 1000;
const st = mem();
let marks = [];
const S = G.createState(st, (k) => marks.push(k), () => t);
ok(!S.isOn() && !S.wasOffered(), 'fresh: off, never offered (D3)');
S.markOffered(); S.markOffered();
ok(S.wasOffered() && marks.filter((k) => k === G.KEY_OFFERED).length === 1, 'offer marked once, one sync mark');
S.setOn(true);
ok(S.isOn() && st.getItem(G.KEY_ON) === '1', 'on → pth_guide_on = 1');
S.markSeen('lobby-ranking'); t = 2000; S.markSeen('wait-ranking'); S.markSeen('lobby-ranking');
ok(S.seen('lobby-ranking') && S.seen('wait-ranking') && !S.seen('login'), 'tips seen are remembered');
ok(JSON.parse(st.getItem(G.KEY_SEEN)).s['lobby-ranking'] === 1000, 'seeing a tip again keeps the first time');
S.markSeen('Bad Id!');
ok(!S.seen('Bad Id!'), 'malformed ids are refused');
t = 3000; S.resetSeen();
ok(!S.seen('lobby-ranking') && !S.seen('wait-ranking'), '« Show all tips again » forgets every tip');
ok(JSON.parse(st.getItem(G.KEY_SEEN)).r === 3000, 'the reset time is stored');
t = 3000; S.markSeen('login');
ok(S.seen('login'), 'a tip seen in the same millisecond as the reset still counts');

// ── two devices ──
function device(now) {
  const s = mem();
  const clock = { t: now };
  return { s, clock, st: G.createState(s, null, () => clock.t) };
}
function sync(from, to) {
  // blob as pokerth.js _cfgWebCollect would send it
  const blob = {};
  for (const k of G.SYNC_KEYS) { const v = from.s.getItem(k); if (v != null) blob[k] = v; }
  const r = G.mergeIn(blob, to.st.raw());
  to.st.applyMerge(r);
  return r;
}
const A = device(100), B = device(100);
A.st.markOffered(); A.st.markSeen('lobby-ranking');
B.clock.t = 150; B.st.markSeen('wait-ranking');
let r = sync(A, B);
ok(B.st.wasOffered(), 'offered on A → offered on B');
ok(B.st.seen('lobby-ranking') && B.st.seen('wait-ranking'), 'union: B knows both tips');
ok(r.needPush === true, 'B knew a tip the account did not → push back');
r = sync(B, A);
ok(A.st.seen('wait-ranking') && A.st.seen('lobby-ranking'), 'A catches up after B pushed');
ok(r.needPush === false, 'no ping-pong once both are equal');
r = sync(A, B);
ok(r.changed === false && r.needPush === false, 'equal states: nothing changes, nothing to push');
// reset on A, B saw a tip before the reset and one after
B.clock.t = 180; B.st.markSeen('login');
A.clock.t = 200; A.st.resetSeen();
B.clock.t = 250; B.st.markSeen('create');
sync(A, B);
ok(!B.st.seen('lobby-ranking') && !B.st.seen('login'), 'the latest reset wins on the other device');
ok(B.st.seen('create'), 'a tip seen after the reset survives the merge');
sync(B, A);
ok(A.st.seen('create') && !A.st.seen('wait-ranking'), 'and travels back');
// account without any guide data yet
r = G.mergeIn({}, A.st.raw());
ok(r.needPush === true, 'account without guide data → this device pushes');
r = G.mergeIn({}, { offered: null, seen: null });
ok(r.needPush === false && r.changed === false, 'nothing anywhere → nothing to do');
r = G.mergeIn({ pth_guide_seen: 'garbage' }, { offered: null, seen: null });
ok(r.changed === false, 'garbage from the account changes nothing locally');
r = G.mergeIn(null, { offered: '1', seen: null });
ok(r.needPush === false && r.changed === false, 'no blob → no-op');

// ── pokerth.js wiring ──
const js = fs.readFileSync('public/pokerth.js', 'utf8');
const webKeys = js.match(/var _CFG_WEB_SYNC_KEYS = \[([\s\S]*?)\];/)[1];
ok(/'pth_guide_on'/.test(webKeys), 'pth_guide_on is a synced web option');
ok(!/pth_guide_seen|pth_guide_offered/.test(webKeys), 'offered / seen are not overwritten like options (merged instead)');
ok(/var _GUIDE_SYNC_KEYS = \['pth_guide_offered', 'pth_guide_seen'\]/.test(js), '_GUIDE_SYNC_KEYS lists offered + seen');
ok(G.SYNC_KEYS.join() === 'pth_guide_offered,pth_guide_seen', 'same keys in the module');
const collect = js.match(/function _cfgWebCollect\(\) \{([\s\S]*?)\n\}/)[1];
ok(/_GUIDE_SYNC_KEYS\.forEach/.test(collect), 'collected into the /prefs-web blob');
const applyFn = js.match(/function _cfgWebApply\(o\) \{([\s\S]*?)\n\}/)[1];
ok(/_guideMergeIn\(o\)/.test(applyFn), 'merged when the account blob arrives');
ok(/window\._guidePendingSync = o/.test(js), 'blob kept for later if the module is not loaded yet');
const push = js.match(/function _cfgWebPushNow\(keepalive\) \{([\s\S]*?)\n\}/)[1];
ok(/if \(!_cfgSyncToken/.test(push), 'guests: no token, no /prefs-web push (nothing synced)');
ok(!/pth_assist'?\s*[,\]]/.test(fs.readFileSync('public/modules/guide/state.mjs', 'utf8')), 'pth_assist (hand strength) is not reused');
for (const k of G.SYNC_KEYS.concat([G.KEY_ON])) ok(/^pth_[a-z0-9_]{1,40}$/.test(k), 'key accepted by the proxy filter: ' + k);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
