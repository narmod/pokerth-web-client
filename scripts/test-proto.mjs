#!/usr/bin/env node
// Deterministic tests for public/modules/net/proto.mjs (extraction #2 of
// docs/ESM_PLAN.md). Pure byte-level roundtrips, no I/O.
// Run: node scripts/test-proto.mjs
import Proto from '../public/modules/net/proto.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// 1) Varint roundtrip across boundaries (1/2/3/5-byte encodings)
for (const n of [0, 1, 127, 128, 300, 16383, 16384, 0x7FFFFFFF, 0xFFFFFFFF]) {
  const bytes = Proto.encodeVarint(n);
  const r = Proto.decodeVarint(new Uint8Array(bytes), 0);
  ok(r.value === n && r.pos === bytes.length, 'varint roundtrip ' + n + ' (' + bytes.length + ' B)');
}
ok(Proto.encodeVarint(127).length === 1 && Proto.encodeVarint(128).length === 2,
   'varint length switches at 128');

// 2) Message roundtrip: varint + string + bytes + nested submessage
const inner = Proto.encode([[1, 0, 42], [2, 2, 'nested']]);
const msg = Proto.encode([
  [1, 0, 7],
  [2, 2, 'PokerTH'],
  [3, 2, new Uint8Array([0, 1, 2, 255])],
  [4, 2, inner],
  [5, 0, 0],            // explicit zero must be encoded (ghost-card fix)
  [6, 0, null],         // null must be SKIPPED
]);
const f = Proto.decode(msg);
ok(Proto.u32(f, 1) === 7, 'u32 field 1 = 7');
ok(Proto.str(f, 2) === 'PokerTH', 'str field 2 roundtrip');
const b3 = Proto.raw(f, 3);
ok(b3 instanceof Uint8Array && b3.length === 4 && b3[3] === 255, 'raw bytes field 3 roundtrip');
const sf = Proto.sub(f, 4);
ok(Proto.u32(sf, 1) === 42 && Proto.str(sf, 2) === 'nested', 'nested submessage roundtrip');

// 3) The "ghost card 0" fix: absent field vs explicit value 0
ok(Proto.u32orNull(f, 5) === 0, 'u32orNull: explicit 0 stays 0');
ok(Proto.u32orNull(f, 6) === null, 'u32orNull: null spec was skipped -> absent -> null');
ok(Proto.u32orNull(f, 99) === null, 'u32orNull: missing field -> null');
ok(Proto.u32(f, 99, 123) === 123, 'u32 default honoured on missing field');
ok(Proto.str(f, 99) === '', 'str missing field -> empty string');

// 4) Repeated fields accumulate in order
const rep = Proto.decode(Proto.encode([[1, 0, 10], [1, 0, 20], [1, 0, 30]]));
ok(Array.isArray(rep[1]) && rep[1].join(',') === '10,20,30', 'repeated varints keep order');

// 5) Unknown wire types: fixed64 (1) and fixed32 (5) are skipped cleanly
const weird = new Uint8Array([
  (1 << 3) | 1, 1, 2, 3, 4, 5, 6, 7, 8,   // field 1, fixed64 -> skipped
  (2 << 3) | 5, 9, 9, 9, 9,               // field 2, fixed32 -> skipped
  (3 << 3) | 0, 99,                        // field 3, varint 99 -> kept
]);
const wf = Proto.decode(weird);
ok(Proto.u32(wf, 3) === 99, 'decoder skips fixed64/fixed32 and still reads what follows');

// 6) UTF-8 strings survive (accents + emoji, PokerTH chat reality)
const uf = Proto.decode(Proto.encode([[1, 2, 'héhé ♠ 🃏']]));
ok(Proto.str(uf, 1) === 'héhé ♠ 🃏', 'UTF-8 string roundtrip');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All proto tests passed.');
