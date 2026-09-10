// ── offline/rand.mjs — hasard cryptographique du mode entraînement ─────────
//
// Parité upstream 40122fe (« faster and cryptographically strong card
// shuffling on all platforms », tools.cpp) : les cartes et les décisions des
// bots tirent leur hasard d'un générateur cryptographique, lu par blocs.
//
// Pourquoi : Math.random (xorshift128+ dans V8) livre son état interne après
// quelques dizaines de sorties, et un paquet mélangé n'est qu'une suite de
// sorties que le joueur voit en partie (flop, turn, river, abattages). En
// principe, un joueur outillé pouvait donc prédire les cartes cachées des
// bots et les mains suivantes. getRandomValues() ne le permet pas, et le
// tampon ne contient que des sorties du générateur, jamais son état.
//
// Interface inchangée pour le moteur : un flottant uniforme dans [0, 1), sur
// 53 bits (27 + 26 bits de deux mots de 32 bits), exactement comme
// Math.random — le mélange de Fisher-Yates de makeDeck() et tous les tirages
// des bots restent tels quels. Le biais de floor(x·n) est inférieur à
// n / 2^53, négligeable (la méthode de Lemire d'upstream travaille sur des
// entiers). Les tests déterministes injectent leur propre rng et ne passent
// jamais par ici ; les réactions cosmétiques gardent leur rng dédié (_rrng).

const WORDS = 256;                 // 1 Kio : un appel au générateur par 128 tirages
let _buf = null;
let _pos = WORDS;
let _crypto = true;

function _refill() {
  if (!_buf) _buf = new Uint32Array(WORDS);
  if (_crypto) {
    try { globalThis.crypto.getRandomValues(_buf); _pos = 0; return; }
    catch (e) { _crypto = false; }     // navigateur sans Web Crypto : repli
  }
  for (let i = 0; i < WORDS; i++) _buf[i] = Math.floor(Math.random() * 4294967296) >>> 0;
  _pos = 0;
}

function _next32() {
  if (_pos >= WORDS) _refill();
  return _buf[_pos++];
}

// Flottant uniforme dans [0, 1), 53 bits.
export function cryptoRandom() {
  const hi = _next32() >>> 5;          // 27 bits
  const lo = _next32() >>> 6;          // 26 bits
  return (hi * 67108864 + lo) / 9007199254740992;
}

// Vrai si le générateur cryptographique est effectivement utilisé.
export function isCryptoBacked() {
  if (_pos >= WORDS && _crypto) _refill();
  return _crypto;
}
