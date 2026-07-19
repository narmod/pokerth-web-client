#!/usr/bin/env node
// Deterministic tests for public/modules/ui/fmt.mjs (chantier ESM #9f-1).
// Run: node scripts/test-fmt.mjs
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };

const { S } = await import('../public/modules/game/state.mjs');
const { _groupThousands, fmtChips, fmtChipsVoice } = await import('../public/modules/ui/fmt.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// _groupThousands : espace fine par défaut, virgule en anglais
window._lang = 'fr';
ok(_groupThousands(1234567) === '1\u202F234\u202F567', 'fr: espaces fines 1 234 567');
ok(_groupThousands(-9500) === '-9\u202F500', 'fr: négatif');
window._lang = 'en';
ok(_groupThousands(1234567) === '1,234,567', 'en: virgules 1,234,567');

// fmtChips : mode $ puis mode BB
window._lang = 'fr';
S._displayBB = false; S.smallBlind = 10;
ok(fmtChips(3000) === '$3\u202F000', 'mode $ : $3 000');
S._displayBB = true;
ok(fmtChips(3000) === '150 BB', 'mode BB : 3000/20 = 150 BB');
ok(fmtChips(50) === '2,5 BB', 'mode BB décimal fr : 2,5 BB');
window._lang = 'en';
ok(fmtChips(50) === '2.5 BB', 'mode BB décimal en : 2.5 BB');
S.smallBlind = 0;
ok(fmtChips(500) === '$500', 'BB actif mais sb inconnu → repli $');

// fmtChipsVoice : entier nu en mode $, BB sinon
S._displayBB = false; S.smallBlind = 10;
ok(fmtChipsVoice(12345) === '12345', 'voix mode $ : entier sans séparateur');
S._displayBB = true; window._lang = 'fr';
ok(fmtChipsVoice(50) === '2,5 BB', 'voix mode BB : 2,5 BB');

// ponts window
ok(window.fmtChips === fmtChips && window._groupThousands === _groupThousands
   && window.fmtChipsVoice === fmtChipsVoice, 'ponts window en place');

// reset état partagé (hygiène si d'autres tests suivent)
S._displayBB = false; S.smallBlind = 10; delete window._lang;

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
