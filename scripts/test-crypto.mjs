#!/usr/bin/env node
// Deterministic tests for public/modules/net/crypto.mjs (extraction #3 of
// docs/ESM_PLAN.md). Cross-validates the pure-JS AES-128-CBC decrypt against
// node:crypto encryption, and the key/IV derivation against node's SHA-1 —
// two independent implementations agreeing on fixed inputs.
// Run: node scripts/test-crypto.mjs
import PTHCrypto from '../public/modules/net/crypto.mjs';
import { createCipheriv, createHash } from 'node:crypto';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

const enc = new TextEncoder();
function zeroPad(buf) {
  const n = Math.ceil(buf.length / 16) * 16 || 16;
  const out = new Uint8Array(n);
  out.set(buf);
  return out;
}
function aesEncryptZeroPad(plain, key, iv) {
  const c = createCipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(iv));
  c.setAutoPadding(false);
  const padded = zeroPad(plain);
  return new Uint8Array(Buffer.concat([c.update(Buffer.from(padded)), c.final()]));
}

// 1) deriveKeyIv vs node:crypto reference (same BytesToKey scheme re-derived)
const pwd = enc.encode('s3cret-pass');
const kv = PTHCrypto.deriveKeyIv(pwd);
const sha1 = (b) => new Uint8Array(createHash('sha1').update(Buffer.from(b)).digest());
const k1 = sha1(sha1(pwd));
const cat = new Uint8Array(20 + pwd.length); cat.set(k1, 0); cat.set(pwd, 20);
const k2 = sha1(sha1(cat));
const refKey = k1.subarray(0, 16);
const refIv = new Uint8Array(16); refIv.set(k1.subarray(16, 20), 0); refIv.set(k2.subarray(0, 12), 4);
ok(Buffer.from(kv.key).equals(Buffer.from(refKey)), 'deriveKeyIv: key matches node SHA-1 chain');
ok(Buffer.from(kv.iv).equals(Buffer.from(refIv)), 'deriveKeyIv: iv matches node SHA-1 chain');
ok(kv.key.length === 16 && kv.iv.length === 16, 'deriveKeyIv: 16-byte key and iv');
const kv2 = PTHCrypto.deriveKeyIv(enc.encode('s3cret-pass'));
ok(Buffer.from(kv2.key).equals(Buffer.from(kv.key)), 'deriveKeyIv deterministic');

// 2) cbcDecrypt inverts node:crypto AES-128-CBC (multi-block, fixed bytes)
const msg = enc.encode('The quick brown fox jumps over the lazy dog 0123456789');
const cipher = aesEncryptZeroPad(msg, kv.key, kv.iv);
const plain = PTHCrypto.cbcDecrypt(cipher, kv.key, kv.iv);
ok(Buffer.from(plain.subarray(0, msg.length)).equals(Buffer.from(msg)),
   'cbcDecrypt inverts node encryption (' + cipher.length / 16 + ' blocks)');
ok(plain.subarray(msg.length).every((b) => b === 0), 'zero padding preserved after payload');

// 3) decryptCards end-to-end: server-format plaintext -> [card0, card1]
const payload = enc.encode('987654 42 17 25 51');           // uid gid hid Ah Ac
const cards = PTHCrypto.decryptCards(aesEncryptZeroPad(payload, kv.key, kv.iv), kv.key, kv.iv);
ok(Array.isArray(cards) && cards[0] === 25 && cards[1] === 51, 'decryptCards -> [25, 51] (Ah, Ac)');
const zero = PTHCrypto.decryptCards(aesEncryptZeroPad(enc.encode('1 2 3 0 12'), kv.key, kv.iv), kv.key, kv.iv);
ok(zero && zero[0] === 0 && zero[1] === 12, 'decryptCards: card 0 (2d) accepted, no ghost-zero rejection');

// 4) Hostile inputs -> null, never a throw
ok(PTHCrypto.decryptCards(null, kv.key, kv.iv) === null, 'null cipher -> null');
ok(PTHCrypto.decryptCards(new Uint8Array(15), kv.key, kv.iv) === null, 'non-16-multiple length -> null');
ok(PTHCrypto.decryptCards(new Uint8Array(0), kv.key, kv.iv) === null, 'empty cipher -> null');
const junk = PTHCrypto.decryptCards(new Uint8Array(16).fill(0xAA), kv.key, kv.iv);
ok(junk === null, 'random block (unparseable plaintext) -> null');
const badCard = PTHCrypto.decryptCards(aesEncryptZeroPad(enc.encode('1 2 3 4 99'), kv.key, kv.iv), kv.key, kv.iv);
ok(badCard === null, 'card index 99 out of 0..51 -> null');

// 5) Wrong key must not leak cards
const wrong = PTHCrypto.deriveKeyIv(enc.encode('other-pass'));
ok(PTHCrypto.decryptCards(aesEncryptZeroPad(payload, kv.key, kv.iv), wrong.key, wrong.iv) === null,
   'wrong key -> garbage -> null');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All crypto tests passed.');
