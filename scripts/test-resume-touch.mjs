// pth_resume.t refreshed while seated (touchResume, net/msg-game-join.mjs):
// a reload in a game older than 5 min must still replay myLastSessionId.
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.test/' });
for (const k of ['window', 'document', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'CustomEvent', 'Event'])
  { try { globalThis[k] = dom.window[k]; } catch (e) {} }
const { S } = await import('../public/modules/game/state.mjs');
const { touchResume } = await import('../public/modules/net/msg-game-join.mjs');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const old = Date.now() - 20 * 60 * 1000;
const put = (o) => localStorage.setItem('pth_resume', JSON.stringify(o));
const get = () => JSON.parse(localStorage.getItem('pth_resume') || 'null');
S.myName = 'Alice'; S.gId = 784;
put({ n: 'Alice', g: 784, t: old, s: 0, k: 'QUJD' });
touchResume();
ok(Date.now() - get().t < 5000, 'marker of the current game is refreshed');
ok(get().k === 'QUJD' && get().g === 784 && get().s === 0, 'GUID, game and spectator flag kept');
put({ n: 'Alice', g: 700, t: old, s: 0, k: 'x' }); touchResume();
ok(get().t === old, 'marker of another game untouched');
put({ n: 'Bob', g: 784, t: old, s: 0, k: 'x' }); touchResume();
ok(get().t === old, 'marker of another nick untouched');
localStorage.removeItem('pth_resume'); touchResume();
ok(get() === null, 'no marker → none created (leave/close still win)');
put({ n: 'Alice', g: 784, t: old, s: 0, k: 'x' }); S.gId = 0; touchResume();
ok(get().t === old, 'not at a table → untouched');
S.gId = 784; window._offlineMode = true; touchResume();
ok(get().t === old, 'training mode → untouched');
window._offlineMode = false;
window.dispatchEvent(new dom.window.Event('pagehide'));
ok(Date.now() - get().t < 5000, 'pagehide refreshes the marker');
console.log((fail ? 'FAIL ' : 'PASS ') + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
