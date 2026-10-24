// ═══════════════════════════════════════════════════════════════════
// Tournament director — sealed journal (prototype, 2026-10-23).
//
// An append-only list of events. Each entry carries the SHA-256 of the
// previous one, so changing, removing or reordering any entry breaks every
// hash after it. The final head hash and the ranking are signed with the
// install's Ed25519 key, so anyone holding the public key can check a
// published result against the raw journal.
//
// Pure module: no I/O, injectable clock, deterministic output. Design:
// docs/ARENA.md (Trust).
// ═══════════════════════════════════════════════════════════════════

import { createHash, generateKeyPairSync, createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';

export const JOURNAL_VERSION = 1;
export const GENESIS = '0'.repeat(64);

// Deterministic JSON: object keys sorted, undefined dropped, no whitespace.
// Two journals with the same events always hash the same, whatever the
// order in which the code happened to set the properties.
export function canonical(value) {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) throw new TypeError('non-finite number in journal');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return '[' + value.map((v) => (v === undefined ? 'null' : canonical(v))).join(',') + ']';
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}

export function sha256Hex(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function entryHash(prev, seq, ts, type, data) {
  return sha256Hex(prev + '\n' + canonical({ seq, ts, type, data }));
}

export class Journal {
  /**
   * @param {object} [opts]
   * @param {() => number} [opts.now] clock in ms (tests inject a fixed one)
   * @param {Array} [opts.entries] existing entries to resume from (verified)
   */
  constructor(opts = {}) {
    this.now = opts.now || (() => Date.now());
    this.entries = [];
    if (opts.entries) {
      const v = verifyJournal(opts.entries);
      if (!v.ok) throw new Error('journal broken at seq ' + v.badSeq);
      this.entries = opts.entries.slice();
    }
  }

  get head() {
    return this.entries.length ? this.entries[this.entries.length - 1].hash : GENESIS;
  }

  append(type, data) {
    if (typeof type !== 'string' || !type) throw new TypeError('journal entry needs a type');
    const seq = this.entries.length;
    const ts = Math.floor(this.now());
    const clean = data === undefined ? null : JSON.parse(canonical(data));
    const prev = this.head;
    const hash = entryHash(prev, seq, ts, type, clean);
    const entry = { seq, ts, type, data: clean, prev, hash };
    this.entries.push(entry);
    return entry;
  }

  toJSON() {
    return { version: JOURNAL_VERSION, head: this.head, entries: this.entries };
  }
}

// Recompute the whole chain. Returns { ok, badSeq } — badSeq is the first
// entry whose position, link or hash does not match.
export function verifyJournal(entries) {
  let prev = GENESIS;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!e || e.seq !== i || e.prev !== prev) return { ok: false, badSeq: i };
    if (entryHash(prev, e.seq, e.ts, e.type, e.data) !== e.hash) return { ok: false, badSeq: i };
    prev = e.hash;
  }
  return { ok: true, badSeq: -1, head: prev };
}

// ── Signing (Ed25519) ──────────────────────────────────────────────

export function generateKeys() {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  return {
    privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }),
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }),
  };
}

export function publicKeyFromPrivate(privateKeyPem) {
  return createPublicKey(createPrivateKey(privateKeyPem)).export({ type: 'spki', format: 'pem' });
}

// Raw 32-byte public key, base64 — the form published in a DNS TXT record
// (`k=` of `_pokerth-td.<host>`, design §7.2 A) and on /arena.
export function publicKeyRawB64(publicKeyPem) {
  const der = createPublicKey(publicKeyPem).export({ type: 'spki', format: 'der' });
  return Buffer.from(der.subarray(der.length - 32)).toString('base64');
}

export function signPayload(payload, privateKeyPem) {
  return sign(null, Buffer.from(canonical(payload), 'utf8'), createPrivateKey(privateKeyPem)).toString('base64');
}

export function verifyPayload(payload, signatureB64, publicKeyPem) {
  try {
    return verify(null, Buffer.from(canonical(payload), 'utf8'), createPublicKey(publicKeyPem), Buffer.from(signatureB64, 'base64'));
  } catch (e) {
    return false;
  }
}
