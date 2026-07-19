#!/usr/bin/env node
// Deterministic tests for public/modules/net/msg-avatars.mjs (ESM #9g-C1).
// Run: node scripts/test-msg-avatars.mjs
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = { readyState: 'complete', addEventListener() {}, removeEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  documentElement: { getAttribute: () => null },
  getElementById: () => null, createElement: () => ({ style: {} }) };
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.WebSocket = { OPEN: 1 };
globalThis.directWS = false;
let seatsRerendered = 0; window._renderSeats = () => seatsRerendered++;
let myAvRefreshed = 0; window.refreshMyAvatar = () => myAvRefreshed++;

const { S } = await import('../public/modules/game/state.mjs');
const { Proto } = await import('../public/modules/net/proto.mjs');
const { MSG } = await import('../public/modules/net/messages.mjs');
const M = await import('../public/modules/net/msg-avatars.mjs');
const T = MSG.T;

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// send() encode via S.ws (mode proxy : préfixe 4 octets BE)
const sent = [];
S.ws = { readyState: 1, send: (frame) => sent.push(new Uint8Array(frame).slice(4)) };
function typeOf(bytes) { return MSG.parse(bytes).type; }

// sub d'un message : Proto.encode puis parse pour obtenir la map de champs
function subOf(fields) { return MSG.parse(Proto.encode(fields)).sub; }

// ── onAvatarRequest : notre upload correspond → Header + Data chunkées + End
const bytes = new Uint8Array(600).fill(7); // 600 o → 3 chunks de 256/256/88
window._pthMyUpload = { type: 2, bytes, hashBytes: [1, 2, 3] };
let sub = subOf([[1, 0, T.AvatarRequest], [8, 2, Proto.encode([[1, 0, 42], [2, 2, new Uint8Array([1, 2, 3])]])]]);
sent.length = 0;
M.onAvatarRequest(sub);
ok(sent.length === 5, 'onAvatarRequest (hash ok) : 5 messages (Header + 3 Data + End), reçu ' + sent.length);
ok(typeOf(sent[0]) === T.AvatarHeader && typeOf(sent[4]) === T.AvatarEnd,
   'onAvatarRequest : trame Header…End dans l\'ordre');
ok(sent.slice(1, 4).every((b) => typeOf(b) === T.AvatarData), 'onAvatarRequest : chunks AvatarData (256 o max)');

// hash différent → UnknownAvatar
sub = subOf([[1, 0, T.AvatarRequest], [8, 2, Proto.encode([[1, 0, 43], [2, 2, new Uint8Array([9, 9, 9])]])]]);
sent.length = 0;
M.onAvatarRequest(sub);
ok(sent.length === 1 && typeOf(sent[0]) === T.UnknownAvatar, 'onAvatarRequest (hash inconnu) : UnknownAvatar');

// ── Cycle de réception : Header → Data ×2 → End (assemblage + cache + re-rendus)
S._pthAvatarReqIdToHash = { 7: 'aabbcc' };
S._pthAvatarsByHash = { aabbcc: { status: 'pending', type: 1, expectedSize: 0, chunks: [], received: 0 } };
S._pthDataUrls = {}; S._openTables = new Set();

sub = subOf([[1, 0, T.AvatarHeader], [9, 2, Proto.encode([[1, 0, 7], [2, 0, 2], [3, 0, 8]])]]);
M.onAvatarHeader(sub);
const entry = S._pthAvatarsByHash.aabbcc;
ok(entry.expectedSize === 8 && entry.type === 2, 'onAvatarHeader : taille attendue + type corrigé');

for (const part of [[137, 80, 78, 71], [13, 10, 26, 10]]) { // signature PNG en 2 morceaux
  sub = subOf([[1, 0, T.AvatarData], [10, 2, Proto.encode([[1, 0, 7], [2, 2, new Uint8Array(part)]])]]);
  M.onAvatarData(sub);
}
ok(entry.chunks.length === 2 && entry.received === 8, 'onAvatarData : 2 chunks accumulés (8 o)');

sub = subOf([[1, 0, T.AvatarEnd], [11, 2, Proto.encode([[1, 0, 7]])]]);
M.onAvatarEnd(sub);
ok(entry.status === 'done' && entry.chunks.length === 0, 'onAvatarEnd : statut done + chunks libérés');
ok(typeof S._pthDataUrls.aabbcc === 'string' && S._pthDataUrls.aabbcc.startsWith('data:image/'),
   'onAvatarEnd : Data URL assemblée (' + String(S._pthDataUrls.aabbcc).slice(0, 22) + '…)');
ok(seatsRerendered === 1 && myAvRefreshed === 1, 'onAvatarEnd : re-rendu sièges + avatar propre');
ok(!(7 in S._pthAvatarReqIdToHash), 'onAvatarEnd : mapping reqId→hash nettoyé');

// ── onUnknownAvatar : statut unknown + nettoyage
S._pthAvatarReqIdToHash = { 8: 'ddeeff' };
S._pthAvatarsByHash.ddeeff = { status: 'pending', chunks: [], received: 0 };
sub = subOf([[1, 0, T.UnknownAvatar], [12, 2, Proto.encode([[1, 0, 8]])]]);
M.onUnknownAvatar(sub);
ok(S._pthAvatarsByHash.ddeeff.status === 'unknown' && !(8 in S._pthAvatarReqIdToHash),
   'onUnknownAvatar : statut unknown + mapping nettoyé');

// Ponts window (le switch du monolithe appelle ces noms nus)
ok(window.onAvatarRequest === M.onAvatarRequest && window.onAvatarEnd === M.onAvatarEnd &&
   window.onUnknownAvatar === M.onUnknownAvatar, 'ponts window.* en place');

console.log(fail ? `\n${fail}/${n} ÉCHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
