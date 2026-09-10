// Test déterministe de modules/offline/rand.mjs (parité upstream 40122fe).
// Le générateur est remplacé par des mots connus pour vérifier l'assemblage
// des 53 bits, le tampon et le repli ; le vrai getRandomValues n'est contrôlé
// que sur des invariants (plage), jamais sur une statistique.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  \u2713 ' + label); }
  else { fail++; console.log('  \u2717 ' + label); }
}
console.log('offline-rand');

const realCrypto = globalThis.crypto;

// 1) Assemblage des bits, avec des mots connus
let calls = 0, counter = 0;
const fake = { getRandomValues(a) { calls++; for (let i = 0; i < a.length; i++) a[i] = WORDS[(counter++) % WORDS.length]; return a; } };
const WORDS = [0xFFFFFFFF, 0xFFFFFFFF, 0x00000000, 0x00000000, 0x80000000, 0x00000000, 0x00000020, 0x00000040];
Object.defineProperty(globalThis, 'crypto', { value: fake, configurable: true });
const A = await import('../public/modules/offline/rand.mjs?bits');
const x1 = A.cryptoRandom(), x2 = A.cryptoRandom(), x3 = A.cryptoRandom(), x4 = A.cryptoRandom();
ok(x1 === (2 ** 53 - 1) / 2 ** 53 && x1 < 1, 'mots à 1 : plus grand flottant < 1 (53 bits pleins)');
ok(x2 === 0, 'mots à 0 : 0');
ok(x3 === 0.5, 'bit de poids fort seul : 0,5');
ok(x4 === (1 * 2 ** 26 + 1) / 2 ** 53, 'bits de poids faible retenus (27 + 26 bits)');
ok(calls === 1, 'un seul appel au générateur pour les premiers tirages (tampon)');
for (let i = 0; i < 124; i++) A.cryptoRandom();          // 128 tirages = 256 mots
ok(calls === 1, '128 tirages consomment exactement un bloc');
A.cryptoRandom();
ok(calls === 2, 'le 129e tirage recharge le tampon');
ok(A.isCryptoBacked() === true, 'générateur cryptographique signalé');

// 2) Repli sans Web Crypto : Math.random, plage respectée
Object.defineProperty(globalThis, 'crypto', { value: { getRandomValues() { throw new Error('no'); } }, configurable: true });
const realRandom = Math.random; let mr = 0;
Math.random = () => { mr++; return 0.999999999; };
const B = await import('../public/modules/offline/rand.mjs?fallback');
const y = B.cryptoRandom();
ok(y >= 0 && y < 1 && mr > 0, 'repli : Math.random utilisé, plage [0, 1)');
ok(B.isCryptoBacked() === false, 'repli signalé');
Math.random = realRandom;

// 3) Vrai générateur : invariants seulement
Object.defineProperty(globalThis, 'crypto', { value: realCrypto, configurable: true });
const C = await import('../public/modules/offline/rand.mjs?real');
let inRange = true;
for (let i = 0; i < 5000; i++) { const v = C.cryptoRandom(); if (!(v >= 0 && v < 1)) { inRange = false; break; } }
ok(inRange, 'vrai getRandomValues : 5000 tirages dans [0, 1)');

// 4) Branchement : le mode entraînement l'utilise par défaut, un rng injecté prime
const idx = readFileSync(new URL('../public/modules/offline/index.mjs', import.meta.url), 'utf8');
ok(/import \{ cryptoRandom \} from '\.\/rand\.mjs'/.test(idx) && /config\.rng \|\| cryptoRandom/.test(idx),
   'offline/index.mjs : config.rng || cryptoRandom');
const eng = readFileSync(new URL('../public/modules/offline/engine.mjs', import.meta.url), 'utf8');
ok(/for\(let i=51;i>0;i--\)\{ const j=Math\.floor\(rng\(\)\*\(i\+1\)\)/.test(eng), 'makeDeck reste un Fisher-Yates sur rng()');

console.log(fail ? `FAIL ${fail}/${pass + fail}` : `PASS ${pass}/${pass}`);
process.exit(fail ? 1 : 0);
