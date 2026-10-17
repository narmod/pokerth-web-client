// The GUID kept in pth_resume (k) must be the one the SEAT carries: on a
// rejoin the server rebinds the seat only at the next hand (PerformRejoin),
// so a second drop before that must still replay the previous GUID
// (upstream fcd25c4 / 31c0166). net/msg-game-join.mjs: seatGuidForJoin,
// commitSeatGuid; net/msg-lobby.mjs: Init prefers the marker's k.
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.test/' });
for (const k of ['window', 'document', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'CustomEvent', 'Event'])
  { try { globalThis[k] = dom.window[k]; } catch (e) {} }
const { S } = await import('../public/modules/game/state.mjs');
const { MSG } = await import('../public/modules/net/messages.mjs');
const { seatGuidForJoin, commitSeatGuid } = await import('../public/modules/net/msg-game-join.mjs');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const put = (o) => localStorage.setItem('pth_resume', JSON.stringify(o));
const get = () => JSON.parse(localStorage.getItem('pth_resume') || 'null');
const g1 = new Uint8Array(16).fill(1), g2 = new Uint8Array(16).fill(2);
const B1 = MSG.bytesToB64(g1), B2 = MSG.bytesToB64(g2);

S.myName = 'Alice'; S.gId = 784; S._sessionGuid = g2;
localStorage.removeItem('pth_resume');
ok(seatGuidForJoin(false) === B2, 'fresh join: the seat takes this session\'s GUID');
put({ n: 'Alice', g: 784, t: Date.now(), s: 0, k: B1 });
ok(seatGuidForJoin(false) === B2, 'fresh join ignores an older marker');
ok(seatGuidForJoin(true) === B1, 'rejoin: the previous seat GUID is kept');
put({ n: 'Alice', g: 700, t: Date.now(), s: 0, k: B1 });
ok(seatGuidForJoin(true) === B2, 'rejoin with a marker of another game: this session\'s GUID');
localStorage.removeItem('pth_resume');
ok(seatGuidForJoin(true) === B2, 'rejoin without marker: this session\'s GUID (previous behaviour)');

put({ n: 'Alice', g: 784, t: 1, s: 0, k: B1 });
commitSeatGuid();
ok(get().k === B2 && get().t > 1, 'GameStartRejoin: the marker moves to the new GUID');
put({ n: 'Alice', g: 700, t: 1, s: 0, k: B1 }); commitSeatGuid();
ok(get().k === B1, 'marker of another game untouched');
put({ n: 'Bob', g: 784, t: 1, s: 0, k: B1 }); commitSeatGuid();
ok(get().k === B1, 'marker of another nick untouched');
localStorage.removeItem('pth_resume'); commitSeatGuid();
ok(get() === null, 'no marker: none created');
put({ n: 'Alice', g: 784, t: 1, s: 0, k: B1 }); window._offlineMode = true; commitSeatGuid();
ok(get().k === B1, 'training mode: untouched');
window._offlineMode = false;
ok(typeof window._resumeCommitGuid === 'function', 'bridge for msg-hand.mjs');

const gj = readFileSync(new URL('../public/modules/net/msg-game-join.mjs', import.meta.url), 'utf8');
ok(/var _k = seatGuidForJoin\(_wasRejoin\);/.test(gj), 'onJoinGameAck stores the seat GUID');
ok(gj.indexOf('const _wasRejoin = !!S._pendingRejoin && S._pendingRejoin === S.gId && !S._pendingRejoinSpec;') !== -1
   && gj.indexOf('const _wasRejoin') < gj.indexOf('S._pendingRejoin = 0; S._rejoinNickRetries = 0;'),
   'rejoin detected before _pendingRejoin is cleared');
const mh = readFileSync(new URL('../public/modules/game/msg-hand.mjs', import.meta.url), 'utf8');
const gsr = mh.slice(mh.indexOf('function onGameStartRejoin'));
ok(gsr.indexOf('window._resumeCommitGuid()') !== -1 && gsr.indexOf('window._resumeCommitGuid()') < gsr.indexOf('S.gId       = Proto.u32(sub, 1);') + 2000,
   'onGameStartRejoin commits the new GUID');
const ml = readFileSync(new URL('../public/modules/net/msg-lobby.mjs', import.meta.url), 'utf8');
ok(ml.indexOf('let _lastSid = null;') !== -1 && ml.indexOf('if (!_lastSid) _lastSid = S._sessionGuid || null;') > ml.indexOf('let _lastSid = null;'),
   'Init replays the marker GUID first, the dropped session\'s GUID otherwise');

console.log((fail ? 'FAIL ' : 'PASS ') + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
