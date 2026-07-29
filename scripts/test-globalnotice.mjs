#!/usr/bin/env node
// Deterministic tests for the server-wide global notice (PokerTH 2.1.5,
// AdminGlobalNoticeMessage / AdminGlobalNoticeAckMessage).
// Run: node scripts/test-globalnotice.mjs
//
// The wire format is the part that cannot be checked by playing: the server
// rejects the whole packet if the text exceeds the 128 bytes allowed for chat,
// and it answers on message type 83 whose envelope field is 84. Everything
// here goes through the real Proto codec.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import MSG from '../public/modules/net/messages.mjs';
import Proto from '../public/modules/net/proto.mjs';

const here = dirname(fileURLToPath(import.meta.url));
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// ── Wire format ───────────────────────────────────────────────────────────
ok(MSG.T.AdminGlobalNotice === 82, 'AdminGlobalNoticeMessage is type 82');
ok(MSG.T.AdminGlobalNoticeAck === 83, 'AdminGlobalNoticeAckMessage is type 83');

const p = MSG.parse(MSG.buildAdminGlobalNotice('Server restart in 5 minutes'));
ok(p.type === MSG.T.AdminGlobalNotice, 'builder emits type 82');
ok(Proto.str(p.sub, 1) === 'Server restart in 5 minutes', 'noticeText roundtrips in field 1');

// The envelope field number is what the server reads; 83 for the notice.
const raw = MSG.buildAdminGlobalNotice('x');
const env = Proto.decode(raw);
ok(Object.prototype.hasOwnProperty.call(env, 83), 'notice travels in envelope field 83');

// The ack the server sends back must be routable by parse().
const ack = MSG.parse(Proto.encode([[1, 0, 83], [84, 2, Proto.encode([[1, 0, 1]])]]));
ok(ack.type === MSG.T.AdminGlobalNoticeAck, 'ack on envelope field 84 parses as type 83');
ok(Proto.u32(ack.sub, 1) === 1, 'ack result reads from field 1 (1 = rejected)');

// ── 128-byte limit (bytes, not characters) ────────────────────────────────
const long = MSG.parse(MSG.buildAdminGlobalNotice('a'.repeat(200)));
ok(new TextEncoder().encode(Proto.str(long.sub, 1)).length === 128, 'ASCII text is cut at 128 bytes');

// '♠' is three bytes: cutting on characters would overshoot the server limit.
const wide = MSG.parse(MSG.buildAdminGlobalNotice('♠'.repeat(100)));
const wideLen = new TextEncoder().encode(Proto.str(wide.sub, 1)).length;
ok(wideLen <= 128, 'multi-byte text stays within 128 bytes (' + wideLen + ')');
ok(Proto.str(wide.sub, 1).length === 42, 'multi-byte text keeps whole characters');

ok(Proto.str(MSG.parse(MSG.buildAdminGlobalNotice('  spaced  ')).sub, 1) === 'spaced',
  'the text is trimmed');

// ── Client wiring ─────────────────────────────────────────────────────────
const app = readFileSync(join(here, '..', 'public', 'pokerth.js'), 'utf8');
ok(/case T\.AdminGlobalNoticeAck:/.test(app), 'the dispatcher routes the ack');
ok((app.match(/buildAdminGlobalNotice/g) || []).length === 2,
  '/gn is wired in both the lobby and the game chat');
ok(!/_playerRights\[S\.myId\][^\n]*buildAdminGlobalNotice/.test(app),
  '/gn is never gated on local rights — the server decides (QML follow-up)');

const lobby = readFileSync(join(here, '..', 'public', 'modules', 'net', 'msg-lobby.mjs'), 'utf8');
ok(/function onAdminGlobalNoticeAck/.test(lobby), 'the ack handler exists');
ok(/gnSent/.test(lobby) && /gnRejected/.test(lobby), 'both ack outcomes are reported');

const html = readFileSync(join(here, '..', 'public', 'pokerth-client.html'), 'utf8');
ok(/id="l-gn-btn"[^>]*display:none/.test(html), 'the notice button starts hidden');
ok(/_syncGlobalNoticeBtn/.test(app), 'the button visibility follows the admin right');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
