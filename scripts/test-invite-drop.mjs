// A table invitation belongs to the server session it was sent to (parity
// upstream 52661f2): net/petitions.mjs::_inviteDrop declines it on a voluntary
// disconnect and drops it silently on a new session (InitAck). A proxy rebind
// (session grace) has no InitAck, so the invitation survives it.
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.test/' });
for (const k of ['window', 'document', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'CustomEvent', 'Event'])
  { try { globalThis[k] = dom.window[k]; } catch (e) {} }
const { S } = await import('../public/modules/game/state.mjs');
const { MSG } = await import('../public/modules/net/messages.mjs');
const { _inviteShow, _inviteDrop } = await import('../public/modules/net/petitions.mjs');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const sent = [];
window.send = (b) => { sent.push(b); return true; };
const banner = () => document.getElementById('game-invite-banner');
const same = (a, b) => a && b && a.length === b.length && a.every((x, i) => x === b[i]);
S.players = { 7: 'Host' }; S.games = { 42: { name: 'Friends' } };

_inviteShow({ gameId: 42, byWhom: 7 });
ok(!!banner() && S._inv && S._inv.gameId === 42, 'invitation shown');
_inviteDrop(true);
ok(!banner() && !S._inv, 'voluntary disconnect: banner gone');
ok(sent.length === 1 && same(Array.from(sent[0]), Array.from(MSG.buildRejectInvite(42, 0))), 'host gets a polite decline (reason 0)');

sent.length = 0;
_inviteShow({ gameId: 42, byWhom: 7 });
_inviteDrop(false);
ok(!banner() && !S._inv, 'new session: banner gone');
ok(sent.length === 0, 'new session: nothing sent (the invitation was for the old session)');

_inviteDrop(true);
ok(sent.length === 0, 'no invitation: nothing sent');

const pk = readFileSync(new URL('../public/pokerth.js', import.meta.url), 'utf8');
const dc = pk.slice(pk.indexOf('    disconnect() {'));
ok(dc.indexOf('window._inviteDrop(true)') !== -1 && dc.indexOf('window._inviteDrop(true)') < dc.indexOf("S.ws.close(4001, 'user disconnect')"),
   'disconnect() declines before closing the socket');
const ml = readFileSync(new URL('../public/modules/net/msg-lobby.mjs', import.meta.url), 'utf8');
const ia = ml.slice(ml.indexOf('function onInitAck'));
ok(ia.indexOf('window._inviteDrop(false)') !== -1 && ia.indexOf('window._inviteDrop(false)') < ia.indexOf('S.myId = Proto.u32(sub, 2);'),
   'onInitAck drops the invitation of the previous session');

console.log((fail ? 'FAIL ' : 'PASS ') + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
