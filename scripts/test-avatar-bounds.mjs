#!/usr/bin/env node
// Deterministic tests for the incoming-avatar bounds in
// public/modules/net/msg-avatars.mjs (upstream 0f700c4, "Bound client avatar
// transfer size").
//
// The receiving side used to trust whatever the server streamed: chunks were
// appended with no reference to the size the AvatarHeader had announced, so a
// stream that never ended grew the tab's memory until it died. These tests
// drive the real handlers with decoded messages and check that a transfer
// which breaks its own announcement keeps nothing.
//
// Run: node scripts/test-avatar-bounds.mjs

Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node' }, configurable: true });
globalThis.window = globalThis;
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.document = {
  getElementById: () => null,
  createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, appendChild() {}, addEventListener() {} }),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
  body: { appendChild() {} },
  documentElement: { style: { setProperty() {} } },
};
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.btoa = (bin) => Buffer.from(bin, 'binary').toString('base64');
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });

const { Proto } = await import('../public/modules/net/proto.mjs');
const { S } = await import('../public/modules/game/state.mjs');
const A = await import('../public/modules/net/msg-avatars.mjs');

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// The handlers read a DECODED sub-message; building it through encode/decode
// keeps the test on the same wire path the network takes.
const msg = (fields) => Proto.decode(Proto.encode(fields));
const header = (reqId, type, size) => msg([[1, 0, reqId], [2, 0, type], [3, 0, size]]);
const data = (reqId, bytes) => msg([[1, 0, reqId], [2, 2, bytes]]);
const end = (reqId) => msg([[1, 0, reqId]]);

let nextReq = 1;
// Sets up one pending transfer exactly as msg-lobby.mjs does on a cache miss.
function pending(hashHex) {
  const reqId = nextReq++;
  S._pthAvatarsByHash[hashHex] = { status: 'pending', type: 1, expectedSize: 0, chunks: [], received: 0 };
  S._pthAvatarReqIdToHash[reqId] = hashHex;
  return reqId;
}
const entryOf = (h) => S._pthAvatarsByHash[h];
const mapped = (reqId) => S._pthAvatarReqIdToHash[reqId] !== undefined;

// A real 1x1 PNG: the assembly step checks the declared dimensions before it
// builds the data URL, so a nominal transfer has to carry an actual image.
const PNG_1x1 = new Uint8Array(Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'));

// 1) Nominal transfer: two chunks matching the announced size, then AvatarEnd.
// The bounds must not get in the way of an ordinary avatar.
{
  const h = 'nominal';
  const reqId = pending(h);
  const cut = 40;
  A.onAvatarHeader(header(reqId, 1, PNG_1x1.length));
  ok(entryOf(h).expectedSize === PNG_1x1.length, 'a valid header stores the announced size');
  A.onAvatarData(data(reqId, PNG_1x1.subarray(0, cut)));
  A.onAvatarData(data(reqId, PNG_1x1.subarray(cut)));
  ok(entryOf(h).received === PNG_1x1.length, 'chunks within the budget are kept');
  A.onAvatarEnd(end(reqId));
  ok(entryOf(h).status === 'done', 'a complete transfer completes');
  ok(!!S._pthDataUrls[h], 'a complete transfer produces a data URL');
}

// 2) A header announcing more than the server would ever relay: the transfer
// never starts, and the bytes that follow have nowhere to land.
{
  const h = 'toobig';
  const reqId = pending(h);
  A.onAvatarHeader(header(reqId, 1, 30721)); // MAX_AVATAR_FILE_SIZE + 1
  ok(entryOf(h).status === 'error', 'an oversized header is refused');
  ok(!mapped(reqId), 'the requestId mapping is dropped with it');
  A.onAvatarData(data(reqId, new Uint8Array(1024)));
  ok(entryOf(h).received === 0 && entryOf(h).chunks.length === 0,
    'data arriving after a refused header is ignored');
}

// 3) Below the minimum: same treatment. A 4-byte "avatar" is not one.
{
  const h = 'toosmall';
  const reqId = pending(h);
  A.onAvatarHeader(header(reqId, 1, 4)); // MIN_AVATAR_FILE_SIZE = 32
  ok(entryOf(h).status === 'error', 'an undersized header is refused');
}

// 4) The case the upstream fix is about: the header announces a small avatar
// and the stream keeps sending. The chunk that would overrun ends it, and the
// bytes already accumulated are released rather than kept around.
{
  const h = 'overrun';
  const reqId = pending(h);
  A.onAvatarHeader(header(reqId, 1, 100));
  A.onAvatarData(data(reqId, new Uint8Array(80)));
  A.onAvatarData(data(reqId, new Uint8Array(80))); // 160 > 100
  ok(entryOf(h).status === 'error', 'a chunk past the announced size ends the transfer');
  ok(entryOf(h).chunks.length === 0 && entryOf(h).received === 0,
    'the partial data is released, not kept');
  ok(!mapped(reqId), 'no further chunk of that stream is accepted');
  A.onAvatarData(data(reqId, new Uint8Array(80)));
  ok(entryOf(h).received === 0, 'the stream really is over');
}

// 5) Data with no header at all: there is no budget to spend against.
{
  const h = 'noheader';
  const reqId = pending(h);
  A.onAvatarData(data(reqId, new Uint8Array(64)));
  ok(entryOf(h).status === 'error' && entryOf(h).received === 0,
    'data before any header is refused');
}

// 6) A transfer that stops short of what it announced is incomplete: caching it
// would store a truncated image under a hash that no longer describes it.
{
  const h = 'short';
  const reqId = pending(h);
  A.onAvatarHeader(header(reqId, 1, 500));
  A.onAvatarData(data(reqId, new Uint8Array(120)));
  A.onAvatarEnd(end(reqId));
  ok(entryOf(h).status === 'error', 'a truncated transfer is not marked done');
  ok(!S._pthDataUrls[h], 'a truncated transfer produces no data URL');
}

// 7) An entry left in 'error' stays in the map: msg-lobby.mjs only requests a
// hash it has never seen, so a stream that misbehaved is not retried all
// session long.
ok(Object.prototype.hasOwnProperty.call(S._pthAvatarsByHash, 'overrun'),
  'a failed hash stays known, so it is not requested again');

console.log(fails ? `FAILED ${fails}` : 'ALL OK');
process.exit(fails ? 1 : 0);
