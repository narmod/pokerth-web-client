// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/net/crypto.mjs
//
// PTHCrypto — déchiffrement des hole cards chiffrées de pokerth.net
// (HandStartMessage.encryptedCards, comptes authentifiés) : dérivation
// clé/IV façon CryptHelper::BytesToKey (double SHA-1, sans sel) puis
// AES-128-CBC pur-JS en déchiffrement seul (Web Crypto refuse le CBC
// zéro-paddé, et crypto.subtle n'existe pas hors contexte sécurisé).
// 100 % synchrone, zéro dépendance — testable en node tel quel.
//
// Historique : extrait de public/pokerth.js (extraction #3 du plan
// docs/ESM_PLAN.md), au verbatim. Alias window.PTHCrypto conservé pour les
// appelants legacy (deriveKeyIv à l'InitAck, decryptCards au HandStart).
// ─────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════
//  PTHCrypto — déchiffrement des cartes (comptes pokerth.net)
//
//  Sur pokerth.net, un joueur AUTHENTIFIÉ (compte enregistré + mot de
//  passe) reçoit ses deux cartes dans HandStartMessage.encryptedCards
//  (champ 3) au lieu de plainCards (champ 2). Le serveur les chiffre en
//  AES-128-CBC avec une clé/IV dérivés du mot de passe (SHA-1, sans sel),
//  exactement comme CryptHelper::BytesToKey + AES128Encrypt côté serveur.
//  Le plaintext déchiffré est : "uniqueId gameId handId card0 card1".
//
//  Implémentation AES pure-JS (déchiffrement seul) — Web Crypto ne sait
//  pas déchiffrer du CBC zéro-paddé (il exige du padding PKCS#7).
//  Validé contre un vecteur NIST + des vecteurs de référence générés
//  avec le même schéma que le serveur PokerTH.
// ═══════════════════════════════════════════════════════════
const PTHCrypto = (function () {
  // S-box / inverse S-box AES
  const _sb = (function () {
    const p = new Uint8Array(256), inv = new Uint8Array(256);
    let pp = 1;
    do {
      pp = (pp ^ (pp << 1) ^ ((pp & 0x80) ? 0x11b : 0)) & 0xff;
      // approche par table : on recalcule via l'affine standard
    } while (false);
    // Construction directe de la S-box (méthode classique log/exp GF(2^8))
    const log = new Uint8Array(256), exp = new Uint8Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) { exp[i] = x; log[x] = i; x ^= ((x << 1) ^ ((x & 0x80) ? 0x11b : 0)) & 0xff; x &= 0xff; }
    function inverse(a){ return a === 0 ? 0 : exp[(255 - log[a]) % 255]; }
    for (let i = 0; i < 256; i++) {
      let s = inverse(i), y = s;
      for (let k = 0; k < 4; k++) { y = (y << 1) | (y >>> 7); s ^= (y & 0xff); }
      s = (s ^ 0x63) & 0xff;
      p[i] = s; inv[s] = i;
    }
    return { box: p, inv };
  })();
  const SBOX_F = _sb.box, INV_SBOX = _sb.inv;

  function mul(a, b){ let r = 0; for (let i = 0; i < 8; i++){ if (b & 1) r ^= a; const hi = a & 0x80; a = (a << 1) & 0xff; if (hi) a ^= 0x1b; b >>= 1; } return r & 0xff; }
  const RCON = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];

  function expandKey(key){
    const w = new Uint8Array(176);
    w.set(key.subarray(0, 16));
    let n = 16, rc = 0; const t = new Uint8Array(4);
    while (n < 176){
      for (let i = 0; i < 4; i++) t[i] = w[n - 4 + i];
      if (n % 16 === 0){
        const tmp = t[0]; t[0] = t[1]; t[1] = t[2]; t[2] = t[3]; t[3] = tmp;
        for (let i = 0; i < 4; i++) t[i] = SBOX_F[t[i]];
        t[0] ^= RCON[rc++];
      }
      for (let i = 0; i < 4; i++){ w[n] = w[n - 16] ^ t[i]; n++; }
    }
    return w;
  }
  function invShiftRows(s){
    let t;
    t = s[13]; s[13] = s[9]; s[9] = s[5]; s[5] = s[1]; s[1] = t;
    t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
    t = s[3]; s[3] = s[7]; s[7] = s[11]; s[11] = s[15]; s[15] = t;
  }
  function invMixColumns(s){
    for (let c = 0; c < 4; c++){
      const i = c * 4, a0 = s[i], a1 = s[i+1], a2 = s[i+2], a3 = s[i+3];
      s[i]   = mul(a0,14)^mul(a1,11)^mul(a2,13)^mul(a3,9);
      s[i+1] = mul(a0,9)^mul(a1,14)^mul(a2,11)^mul(a3,13);
      s[i+2] = mul(a0,13)^mul(a1,9)^mul(a2,14)^mul(a3,11);
      s[i+3] = mul(a0,11)^mul(a1,13)^mul(a2,9)^mul(a3,14);
    }
  }
  function decryptBlock(rk, inB, off, out){
    const s = new Uint8Array(16);
    for (let i = 0; i < 16; i++) s[i] = inB[off + i];
    for (let i = 0; i < 16; i++) s[i] ^= rk[160 + i];
    for (let round = 9; round >= 1; round--){
      invShiftRows(s);
      for (let i = 0; i < 16; i++) s[i] = INV_SBOX[s[i]];
      for (let i = 0; i < 16; i++) s[i] ^= rk[round * 16 + i];
      invMixColumns(s);
    }
    invShiftRows(s);
    for (let i = 0; i < 16; i++) s[i] = INV_SBOX[s[i]];
    for (let i = 0; i < 16; i++) out[i] = s[i] ^ rk[i];
  }
  function cbcDecrypt(cipher, key, iv){
    const rk = expandKey(key);
    const out = new Uint8Array(cipher.length);
    const block = new Uint8Array(16);
    let prev = iv;
    for (let off = 0; off + 16 <= cipher.length; off += 16){
      decryptBlock(rk, cipher, off, block);
      for (let i = 0; i < 16; i++) out[off + i] = block[i] ^ prev[i];
      prev = cipher.subarray(off, off + 16);
    }
    return out;
  }

  // SHA-1 pur-JS (synchrone) — indépendant de crypto.subtle, qui n'est exposé
  // qu'en contexte SÉCURISÉ (https ou localhost). Sur une page servie en http
  // (ex. serveur local http://host:8080), crypto.subtle est undefined : la
  // dérivation rejetait, _cardKey/_cardIV restaient null, et un compte auth ne
  // voyait que le DOS de ses cartes toute la partie. L'AES étant déjà pur-JS,
  // seul le SHA-1 dépendait encore de Web Crypto — on l'affranchit ici.
  function _sha1(bytes){
    const ml = bytes.length;
    const withOne = ml + 1;                       // octet 0x80 après le message
    const k = ((56 - (withOne % 64)) + 64) % 64;  // padding jusqu'à ≡56 mod 64
    const total = withOne + k + 8;                // + 8 octets de longueur (bits)
    const msg = new Uint8Array(total);
    msg.set(bytes, 0);
    msg[ml] = 0x80;
    const dv = new DataView(msg.buffer);
    const bitLen = ml * 8;
    dv.setUint32(total - 8, (Math.floor(bitLen / 0x100000000)) >>> 0); // high (≈0 ici)
    dv.setUint32(total - 4, bitLen >>> 0);                             // low
    let h0=0x67452301, h1=0xEFCDAB89, h2=0x98BADCFE, h3=0x10325476, h4=0xC3D2E1F0;
    const w = new Uint32Array(80);
    const rotl = (x, c) => (x << c) | (x >>> (32 - c));
    for (let off = 0; off < total; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
      for (let i = 16; i < 80; i++) w[i] = rotl(w[i-3] ^ w[i-8] ^ w[i-14] ^ w[i-16], 1);
      let a=h0, b=h1, c=h2, d=h3, e=h4;
      for (let i = 0; i < 80; i++) {
        let f, kk;
        if (i < 20)      { f = (b & c) | (~b & d);          kk = 0x5A827999; }
        else if (i < 40) { f = b ^ c ^ d;                   kk = 0x6ED9EBA1; }
        else if (i < 60) { f = (b & c) | (b & d) | (c & d); kk = 0x8F1BBCDC; }
        else             { f = b ^ c ^ d;                   kk = 0xCA62C1D6; }
        const t = (rotl(a, 5) + f + e + kk + w[i]) | 0;
        e = d; d = c; c = rotl(b, 30); b = a; a = t;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
    }
    const out = new Uint8Array(20);
    const od = new DataView(out.buffer);
    od.setUint32(0, h0 >>> 0);  od.setUint32(4, h1 >>> 0);  od.setUint32(8, h2 >>> 0);
    od.setUint32(12, h3 >>> 0); od.setUint32(16, h4 >>> 0);
    return out;
  }
  // BytesToKey de PokerTH (SHA-1, sans sel) :
  //   key = SHA1(SHA1(pwd))[0:16]
  //   iv  = SHA1(SHA1(pwd))[16:20] ++ SHA1(SHA1( SHA1(SHA1(pwd))++pwd ))[0:12]
  function deriveKeyIv(pwdBytes){
    const keyBuf1 = _sha1(_sha1(pwdBytes));
    const cat = new Uint8Array(20 + pwdBytes.length);
    cat.set(keyBuf1, 0); cat.set(pwdBytes, 20);
    const keyBuf2 = _sha1(_sha1(cat));
    const key = new Uint8Array(keyBuf1.subarray(0, 16));
    const iv = new Uint8Array(16);
    iv.set(keyBuf1.subarray(16, 20), 0);
    iv.set(keyBuf2.subarray(0, 12), 4);
    return { key, iv };
  }

  // Déchiffre encryptedCards -> [card0, card1] (ou null si échec)
  function decryptCards(cipherBytes, key, iv){
    try {
      if (!cipherBytes || !key || !iv) return null;
      if (cipherBytes.length === 0 || (cipherBytes.length % 16) !== 0) return null;
      const plain = cbcDecrypt(cipherBytes, key, iv);
      let end = plain.length;
      while (end > 0 && plain[end - 1] === 0) end--;        // retire le zéro-padding
      const txt = new TextDecoder().decode(plain.subarray(0, end));
      const toks = txt.trim().split(/\s+/);                  // uniqueId gameId handId card0 card1
      if (toks.length < 5) return null;
      const c0 = parseInt(toks[toks.length - 2], 10);
      const c1 = parseInt(toks[toks.length - 1], 10);
      if (!Number.isFinite(c0) || !Number.isFinite(c1) || c0 < 0 || c0 > 51 || c1 < 0 || c1 > 51) return null;
      return [c0, c1];
    } catch (e) { return null; }
  }

  return { deriveKeyIv, decryptCards, cbcDecrypt };
})();

// ─── Exports ES + alias legacy ───────────────────────────────────────────
export default PTHCrypto;
export { PTHCrypto };
if (typeof window !== 'undefined') window.PTHCrypto = PTHCrypto;
