#!/usr/bin/env node
// web.148 — JoinExistingGame and its password, as the server validates it
// (netpacketvalidator.cpp: gameId != 0, password absent or 1..64 bytes; else
// « Invalid packet: 21 » and the session is closed).
// Run: node scripts/test-join-password.mjs
globalThis.window = globalThis;
const { default: MSG } = await import('../public/modules/net/messages.mjs');
const { default: Proto } = await import('../public/modules/net/proto.mjs');
let fail = 0;
function ok(c, label) { console.log((c ? '  ✓ ' : '  ✗ ') + label); if (!c) fail++; }
function join(buf) {
  const env = Proto.decode(buf);
  return { type: Proto.u32(env, 1), sub: Proto.sub(env, 22) };
}
function pw(fields) { const b = Proto.raw(fields, 2); return b ? new TextDecoder().decode(b) : null; }
const a = join(MSG.buildJoinGame(42, false, ''));
ok(a.type === 21 && Proto.u32(a.sub, 1) === 42, 'type 21, gameId 42');
ok(pw(a.sub) === null, 'empty password: no password field (server answers « Wrong password » instead of closing)');
ok(pw(join(MSG.buildJoinGame(42, false, null)).sub) === null, 'null password: no field');
ok(pw(join(MSG.buildJoinGame(42, false, 'secret')).sub) === 'secret', 'password kept as typed');
const long = pw(join(MSG.buildJoinGame(42, false, 'x'.repeat(80))).sub);
ok(long.length === 64, '80 chars → cut to 64 bytes');
const multi = pw(join(MSG.buildJoinGame(42, false, '密'.repeat(30))).sub);
ok(new TextEncoder().encode(multi).length <= 64 && multi === '密'.repeat(21), 'UTF-8: cut on a character boundary (21 × 3 bytes)');
ok(Proto.u32(join(MSG.buildJoinGame(7, true)).sub, 4) === 1, 'spectate: field 4 still set');
console.log(fail ? `\n${fail} failure(s)` : '\nAll join-password tests passed.');
process.exit(fail ? 1 : 0);
