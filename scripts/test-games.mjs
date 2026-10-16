#!/usr/bin/env node
// Hidden mini-games (public/modules/games/): pure parts, no browser.
//   - poker-hand.mjs: best five-card hand among any number of cards, the
//     Joker as a wild card, multipliers and hand-name keys.
//   - index.mjs: the secret word (« mascot » or its translation) opens the
//     arcade menu — present in every language file, matched regardless of case
//     and accents, never an ordinary nickname; the strings of the games
//     (Ace Runner, House of Cards, menu) exist everywhere.
// Run: node scripts/test-games.mjs
import fs from 'fs';
import path from 'path';
import { evalCards, JOKER, MULT, NAME_KEYS } from '../public/modules/games/poker-hand.mjs';
import { gameForNick, norm, GAMES } from '../public/modules/games/index.mjs';

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}

// PokerTH encoding: suit index × 13 + (rank − 2); ♦ 0, ♥ 1, ♠ 2, ♣ 3.
const SUIT = { d: 0, h: 1, s: 2, c: 3 };
const RANK = { 2: 0, 3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, T: 8, J: 9, Q: 10, K: 11, A: 12 };
const c = (s) => SUIT[s[1]] * 13 + RANK[s[0]];
const hand = (str) => str.split(' ').map((x) => (x === 'JK' ? JOKER : c(x)));

console.log('poker-hand');
const cases = [
  ['', 'none'],
  ['As', 'high'],
  ['7s 7h 3c', 'pair'],
  ['7s 7h 3c 3d Kd', 'two'],
  ['9s 9h 9d 4c 2h', 'trips'],
  ['5h 4d 3s 2s Ac', 'straight'],
  ['2h 8h 5h Jh Kh Ks', 'flush'],
  ['9s 9h 9d 4c 4h 4d', 'full'],
  ['Qs Qh Qd Qc 2h', 'quads'],
  ['5s 4s 3s 2s As 9h', 'sf'],
  ['As Ks Qs Js Ts 2h', 'royal'],
  ['As Ks Qs Js JK', 'royal'],
  ['7s 7h JK', 'trips'],
  ['JK', 'high'],
  ['2c 2d JK JK', 'quads'],
  ['8h 9h Th Jh JK 2c 3d', 'sf'],
];
for (const [h, id] of cases) {
  const r = evalCards(h ? hand(h) : []);
  ok(r.id === id, (h || '(none)') + ' → ' + id + (r.id === id ? '' : ' (got ' + r.id + ')'));
}
const wheel = evalCards(hand('5h 4d 3s 2s Ac Kd'));
ok(wheel.id === 'straight' && wheel.best.length === 5, 'the wheel counts as a straight');
const fl = evalCards(hand('2h 8h 5h Jh Kh 3h'));
ok(fl.best.indexOf(c('2h')) < 0 && fl.best.indexOf(c('3h')) >= 0, 'flush keeps the five highest of the suit');
const jk = evalCards(hand('As Ks Qs Js JK'));
ok(jk.best.indexOf(JOKER) >= 0, 'the Joker stays shown as the Joker in the best five');
ok(evalCards(hand('Qs Qh Qd Qc 2h')).mult === MULT[7] && MULT[9] === 50, 'multipliers by category');
ok(evalCards(hand('7s 7h')).nameKey === 'h9n' && evalCards(hand('As Ks Qs Js Ts')).nameKey === 'h1n', 'hand names reuse the hands panel keys');
ok(NAME_KEYS.length === 10 && MULT.length === 10, 'ten categories');

console.log('secret word');
const langDir = path.resolve('public/modules/lang');
const files = fs.readdirSync(langDir).filter((f) => f.endsWith('.mjs'));
const KEYS = ['gameWordAce', 'arHint', 'arTapStart', 'arBusted', 'arNoCards', 'arRecord', 'arNewRecord',
  'arAgain', 'arPause', 'arDistance', 'arBlinds', 'arQuit', 'ach_runner', 'ach_runner_d',
  'hcName', 'hcHint', 'hcFloors', 'hcScore', 'hcPerfect', 'hcSteady', 'hcCollapse', 'hcAgain', 'gmPick', 'ach_house', 'ach_house_d'];
let missing = [], badRecord = [];
for (const f of files) {
  const { strings } = await import(path.join(langDir, f));
  for (const k of KEYS) if (typeof strings[k] !== 'string' || !strings[k].trim()) missing.push(f + ':' + k);
  if (strings.arRecord && strings.arRecord.indexOf('{n}') < 0) badRecord.push(f);
  const tr = (k) => strings[k] || k;
  if (gameForNick(strings.gameWordAce, tr) !== 'arcade') missing.push(f + ': own word not recognised');
  if (gameForNick('mascot', tr) !== 'arcade') missing.push(f + ': English word not recognised');
}
ok(missing.length === 0, 'every language has the Ace Runner strings and a working word' + (missing.length ? ' — ' + missing.slice(0, 6).join(', ') : ''));
ok(badRecord.length === 0, 'arRecord keeps {n}' + (badRecord.length ? ' — ' + badRecord.join(', ') : ''));
const fr = (k) => ({ gameWordAce: 'mascotte' })[k] || k;
ok(gameForNick('  MaScOtTe ', fr) === 'arcade', 'case and spaces ignored');
ok(gameForNick('Mascóte', (k) => ({ gameWordAce: 'mascote' })[k] || k) === 'arcade', 'accents ignored');
ok(gameForNick('Narmod', fr) === null && gameForNick('Ace', fr) === null && gameForNick('As', fr) === null, 'ordinary nicknames, « Ace » and « As » included, do not trigger');
ok(gameForNick('', fr) === null && gameForNick('mascottes', fr) === null, 'empty or longer words do not trigger');
ok(norm('Éliminé') === 'elimine', 'norm strips accents');
ok(GAMES.every((g) => typeof g.load === 'function' && g.id && (g.name || g.nameKey)), 'registry entries are complete');
ok(GAMES.some((g) => g.id === 'arcade') && GAMES.some((g) => g.id === 'ace-runner') && GAMES.some((g) => g.id === 'house'), 'arcade menu, Ace Runner and House of Cards registered');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
