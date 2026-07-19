#!/usr/bin/env node
// Deterministic tests for public/modules/net/messages.mjs (extraction #4 of
// docs/ESM_PLAN.md). Build -> parse roundtrips through the real Proto codec,
// plus SCRAM client-first shape checks (RFC 5802) — no network, no RNG
// assertions beyond format.
// Run: node scripts/test-messages.mjs
import MSG from '../public/modules/net/messages.mjs';
import Proto from '../public/modules/net/proto.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// 1) buildInit -> parse roundtrip (type, login, nick)
const init = MSG.buildInit('Tester', 5, 1, 0);
const pi = MSG.parse(init);
ok(pi.type === MSG.T.Init, 'buildInit: parsed type = T.Init (' + pi.type + ')');
ok(Proto.u32(pi.sub, 5) === 0, 'buildInit: loginType guest (field 5 = 0)');
ok(Proto.str(pi.sub, 6) === 'Tester', 'buildInit: nick roundtrip');
const ver = Proto.sub(pi.sub, 1);
ok(Proto.u32(ver, 1) === 5 && Proto.u32(ver, 2) === 1, 'buildInit: requestedVersion 5.1');

// 2) buildMyAction -> parse roundtrip, including bet 0 default
const act = MSG.parse(MSG.buildMyAction(42, 7, 3, 5, 800));
ok(act.type === MSG.T.MyActionRequest, 'buildMyAction: type = T.MyActionRequest');
ok(Proto.u32(act.sub, 1) === 42 && Proto.u32(act.sub, 2) === 7, 'buildMyAction: gameId/handNum');
ok(Proto.u32(act.sub, 4) === 5 && Proto.u32(act.sub, 5) === 800, 'buildMyAction: action=raise(5), bet=800');
const chk = MSG.parse(MSG.buildMyAction(1, 1, 1, 2));
ok(Proto.u32(chk.sub, 5, -1) === 0, 'buildMyAction: omitted bet encoded as 0');

// 3) Chat builders roundtrip (UTF-8 text)
const chat = MSG.parse(MSG.buildGameChat(9, 'salut ♠ 🃏'));
ok(chat.type === MSG.T.ChatRequest, 'buildGameChat: type = T.ChatRequest');
const chatTexts = Object.values(chat.sub).flat().filter((v) => v instanceof Uint8Array)
  .map((v) => new TextDecoder().decode(v));
ok(chatTexts.indexOf('salut ♠ 🃏') !== -1, 'buildGameChat: UTF-8 text field roundtrip');

// 4) parse() on an unknown type: no crash, empty sub
const weird = Proto.encode([[1, 0, 9999]]);
const pw = MSG.parse(weird);
ok(pw.type === 9999 && typeof pw.sub === 'object' && Object.keys(pw.sub).length === 0,
   'parse: unknown type -> { type, sub:{} } without throwing');

// 5) SCRAM client-first (RFC 5802 shape + '=' / ',' escaping in saslname)
const s1 = MSG.scramClientFirst('bob');
ok(/^n,,n=bob,r=[A-Za-z0-9+/=]+$/.test(s1.clientFirst), 'scramClientFirst: gs2 + bare format');
ok(s1.clientFirst === 'n,,' + s1.clientFirstBare, 'scramClientFirst: bare consistency');
const s2 = MSG.scramClientFirst('a=b,c');
ok(s2.clientFirstBare.indexOf('n=a=3Db=2Cc,') === 0, 'scramClientFirst: saslname escapes = and ,');
ok(MSG.scramClientFirst('bob').cnonce !== s1.cnonce, 'scramClientFirst: fresh nonce per call');

// 6) scramFindServerFirst locates the challenge among arbitrary fields
const serverFirst = 'r=' + s1.cnonce + 'SRV,s=c2FsdA==,i=4096';
const challenge = Proto.decode(Proto.encode([[2, 0, 1], [7, 2, serverFirst]]));
ok(MSG.scramFindServerFirst(challenge) === serverFirst, 'scramFindServerFirst: finds r=..,s=..,i=.. field');
const noChal = Proto.decode(Proto.encode([[2, 0, 1], [7, 2, 'hello world']]));
ok(MSG.scramFindServerFirst(noChal) === '', 'scramFindServerFirst: empty string when absent');

// 7) T table sanity: distinct ids for the messages the client sends most
const ids = [MSG.T.Init, MSG.T.MyActionRequest, MSG.T.ChatRequest];
ok(new Set(ids).size === ids.length && ids.every((n) => Number.isInteger(n) && n > 0),
   'T: core message ids are distinct positive integers');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All messages tests passed.');
