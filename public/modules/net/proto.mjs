// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/net/proto.mjs
//
// Encodeur/décodeur protobuf minimal (proto2 binaire) pour le protocole
// PokerTH : varints, champs length-delimited, helpers d'accès typés
// (str/u32/u32orNull/sub/raw). Zéro dépendance (TextEncoder/TextDecoder
// natifs navigateur + node) — utilisable tel quel dans les tests node.
//
// Historique : extrait de public/pokerth.js (extraction #2 du plan
// docs/ESM_PLAN.md), au verbatim. Le code legacy consomme `Proto.*` par le
// nom global (~230 usages), d'où l'alias window.Proto — à retirer quand le
// dernier appelant aura migré vers les imports ES. NB : distinct de
// modules/offline/proto.mjs (protocole simulé du mode entraînement) ; une
// fusion éventuelle est un chantier séparé, hors extraction.
// ─────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════
//  PROTOBUF — encodeur/décodeur minimal (proto2 binaire)
// ═══════════════════════════════════════════════════════════
const Proto = (() => {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  function encodeVarint(n) {
    n = n >>> 0;
    const out = [];
    while (n > 0x7F) {
      out.push((n & 0x7F) | 0x80);
      n >>>= 7;
    }
    out.push(n & 0x7F);
    return out;
  }

  function decodeVarint(buf, pos) {
    let result = 0, shift = 0;
    while (pos < buf.length) {
      const b = buf[pos++];
      result |= (b & 0x7F) << shift;
      if (!(b & 0x80)) break;
      shift += 7;
    }
    return { value: result >>> 0, pos };
  }

  // Décode un buffer en map { fieldNum: [valeurs] }
  // valeurs = number (varint) ou Uint8Array (length-delimited)
  function decode(buf) {
    const fields = {};
    let pos = 0;
    while (pos < buf.length) {
      const tagR = decodeVarint(buf, pos);
      pos = tagR.pos;
      const fn = tagR.value >>> 3;
      const wt = tagR.value & 0x7;
      if (!fields[fn]) fields[fn] = [];

      if (wt === 0) {
        const r = decodeVarint(buf, pos);
        pos = r.pos;
        fields[fn].push(r.value);
      } else if (wt === 2) {
        const lr = decodeVarint(buf, pos);
        pos = lr.pos;
        fields[fn].push(buf.slice(pos, pos + lr.value));
        pos += lr.value;
      } else if (wt === 1) { pos += 8; }
        else if (wt === 5) { pos += 4; }
        else break; // inconnu → stop
    }
    return fields;
  }

  // Encode un message à partir de specs [[fieldNum, wireType, valeur], ...]
  // wireType 0 = varint, 2 = string|Uint8Array|Array<number>
  function encode(specs) {
    const out = [];
    for (const [num, wt, val] of specs) {
      if (val === undefined || val === null) continue;
      out.push(...encodeVarint((num << 3) | wt));
      if (wt === 0) {
        out.push(...encodeVarint(val >>> 0));
      } else if (wt === 2) {
        const bytes = typeof val === 'string' ? enc.encode(val)
          : val instanceof Uint8Array ? val : new Uint8Array(val);
        out.push(...encodeVarint(bytes.length));
        out.push(...bytes);
      }
    }
    return new Uint8Array(out);
  }

  // Helpers d'accès aux champs
  const str  = (f, n) => f[n] ? dec.decode(f[n][0]) : '';
  const u32  = (f, n, d=0) => f[n] ? f[n][0] : d;
  // FIX bug "card=0 fantôme" : distingue champ absent (null) vs valeur 0 (carte 2♣/2♦)
  const u32orNull = (f, n) => f[n] ? f[n][0] : null;
  const sub  = (f, n) => f[n] ? decode(f[n][0]) : {};
  const raw  = (f, n) => f[n] ? f[n][0] : null;

  return { encode, decode, encodeVarint, decodeVarint, str, u32, u32orNull, sub, raw };
})();

// ─── Exports ES + alias legacy ───────────────────────────────────────────
export default Proto;
export { Proto };
if (typeof window !== 'undefined') window.Proto = Proto;
