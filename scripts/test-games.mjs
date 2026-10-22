#!/usr/bin/env node
// Hidden mini-games (public/modules/games/): pure parts, no browser.
//   - poker-hand.mjs: best five-card hand among any number of cards, the
//     Joker as a wild card, multipliers and hand-name keys.
//   - index.mjs: the secret word (« mascot » or its translation) opens the
//     arcade menu — present in every language file, matched regardless of case
//     and accents, never an ordinary nickname; the strings of the games
//     (Ace Runner, House of Cards, Poker Solitaire, menu) exist everywhere.
//   - solitaire-rules.mjs: the seeded daily deal, the ten lines, the score.
// Run: node scripts/test-games.mjs
import fs from 'fs';
import path from 'path';
import { evalCards, JOKER, MULT, NAME_KEYS } from '../public/modules/games/poker-hand.mjs';
import { gameForNick, norm, GAMES } from '../public/modules/games/index.mjs';
import { SCORE, LINES, dealFor, dayKey, scoreGrid } from '../public/modules/games/solitaire-rules.mjs';

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
const { art } = await import('../public/modules/games/art.mjs');
for (const id of ['ace-runner', 'house', 'solitaire', 'videopoker', 'whowins', 'hilo', 'bluff', 'pokerdrop']) {
  const d = art(id, false), l = art(id, true);
  const ids = [...d.matchAll(/id="([^"]+)"/g)].map((m) => m[1]), idsL = [...l.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  ok(/^<svg[^>]*viewBox="0 0 320 140"/.test(d) && d !== l && ids.every((x) => idsL.indexOf(x) < 0), id + ': a cover picture, one for each theme, ids that do not clash');
}
ok(art('nope', false) === '', 'no picture for an unknown game');
const langDir = path.resolve('public/modules/lang');
const files = fs.readdirSync(langDir).filter((f) => f.endsWith('.mjs'));
const KEYS = ['gameWordAce', 'arHint', 'arTapStart', 'arBusted', 'arNoCards', 'arRecord', 'arNewRecord',
  'arAgain', 'arPause', 'arDistance', 'arLevel', 'arBlinds', 'arQuit', 'ach_runner', 'ach_runner_d',
  'hcName', 'hcHint', 'hcFloors', 'hcScore', 'hcPerfect', 'hcSteady', 'hcCollapse', 'hcAgain', 'gmPick', 'ach_house', 'ach_house_d',
  'psName', 'psHint', 'psDaily', 'psFree', 'psCards', 'psFlushDraw', 'psStraightDraw', 'psBestLine', 'psAgain', 'ach_solitaire', 'ach_solitaire_d',
  'gmPlay', 'gmRules', 'gmIntro', 'arRules', 'hcRules', 'psRules',
  'vpName', 'vpHint', 'vpDeal', 'vpDraw', 'vpHeld', 'vpCredits', 'vpHands', 'vpJacks', 'vpDouble', 'vpCollect', 'vpPick', 'vpRules', 'ach_videopoker', 'ach_videopoker_d',
  'wwName', 'wwHint', 'wwSplit', 'wwTooSlow', 'wwRules', 'ach_whowins', 'ach_whowins_d', 'gmAgain',
  'hlName', 'hlHint', 'hlHigher', 'hlLower', 'hlCash', 'hlPot', 'hlRules', 'ach_hilo', 'ach_hilo_d',
  'blName', 'blHint', 'blBets', 'blBluff', 'blTells', 'blChips', 'blRules', 'ach_bluff', 'ach_bluff_d',
  'pdName', 'pdHint', 'pdVsAce', 'pdTwo', 'pdPoints', 'pdSudden', 'pdSuddenGoal', 'pdYou', 'pdAce', 'pdPlayer', 'pdYourTurn', 'pdAceTurn',
  'pdTurn', 'pdYouWin', 'pdAceWins', 'pdWins', 'pdTie', 'pdRules', 'ach_pdrop', 'ach_pdrop_d',
  'gmTitle'];
let missing = [], badRecord = [];
for (const f of files) {
  const { strings } = await import(path.join(langDir, f));
  for (const k of KEYS) if (typeof strings[k] !== 'string' || !strings[k].trim()) missing.push(f + ':' + k);
  if (strings.arRecord && strings.arRecord.indexOf('{n}') < 0) badRecord.push(f);
  for (const k of ['pdPlayer', 'pdTurn', 'pdWins']) if (strings[k] && strings[k].indexOf('{n}') < 0) badRecord.push(f + ':' + k);
  if (strings.pdRules && strings.pdRules.split('\n').length !== 7) badRecord.push(f + ':pdRules lines');
  const tr = (k) => strings[k] || k;
  if (gameForNick(strings.gameWordAce, tr) !== 'arcade') missing.push(f + ': own word not recognised');
  if (gameForNick('mascot', tr) !== 'arcade') missing.push(f + ': English word not recognised');
}
ok(missing.length === 0, 'every language has the Ace Runner strings and a working word' + (missing.length ? ' — ' + missing.slice(0, 6).join(', ') : ''));
ok(badRecord.length === 0, 'arRecord, pdPlayer, pdTurn, pdWins keep {n}, pdRules has 7 lines' + (badRecord.length ? ' — ' + badRecord.join(', ') : ''));
const fr = (k) => ({ gameWordAce: 'mascotte' })[k] || k;
ok(gameForNick('  MaScOtTe ', fr) === 'arcade', 'case and spaces ignored');
ok(gameForNick('Mascóte', (k) => ({ gameWordAce: 'mascote' })[k] || k) === 'arcade', 'accents ignored');
ok(gameForNick('Narmod', fr) === null && gameForNick('Ace', fr) === null && gameForNick('As', fr) === null, 'ordinary nicknames, « Ace » and « As » included, do not trigger');
ok(gameForNick('', fr) === null && gameForNick('mascottes', fr) === null, 'empty or longer words do not trigger');
ok(norm('Éliminé') === 'elimine', 'norm strips accents');
ok(GAMES.every((g) => typeof g.load === 'function' && g.id && (g.name || g.nameKey)), 'registry entries are complete');
ok(['arcade', 'ace-runner', 'house', 'solitaire'].every((id) => GAMES.some((g) => g.id === id)), 'arcade menu, Ace Runner, House of Cards and Poker Solitaire registered');

console.log('poker solitaire');
const d1 = dealFor('pth-solitaire-2026-10-16'), d2 = dealFor('pth-solitaire-2026-10-16'), d3 = dealFor('pth-solitaire-2026-10-17');
ok(d1.length === 25 && new Set(d1).size === 25 && d1.every((n) => n >= 0 && n < 52), 'a deal is 25 different cards');
ok(d1.join() === d2.join() && d1.join() !== d3.join(), 'the daily deal is the same for a day, another the next day');
ok(dayKey(new Date('2026-10-16T23:30:00Z')) === '2026-10-16', 'the day is taken in UTC');
ok(LINES.length === 10 && LINES.every((l) => l.length === 5) && new Set(LINES.flat()).size === 25, 'ten lines of five cells');
// Rows: four flushes and a royal flush; columns: whatever they make.
const g = [].concat(hand('As Ks Qs Js Ts'), hand('2h 4h 6h 8h Th'), hand('2d 4d 6d 8d Td'), hand('3c 5c 7c 9c Jc'), hand('3h 5h 7h 9h Jh'));
const rows = 100 + 4 * 20;
const cols = LINES.slice(5).reduce((a, l) => a + SCORE[evalCards(l.map((i) => g[i])).cat], 0);
ok(scoreGrid(g) === rows + cols, 'grid score = rows + columns (' + scoreGrid(g) + ')');
ok(SCORE[9] === 100 && SCORE[1] === 2 && SCORE[0] === 0, 'American scale');

// ── Hold'em hand comparison, seeded decks, Video Poker paytable ──
{
  const { rankHand, compareHands } = await import('../public/modules/games/poker-hand.mjs');
  const { deckFor, rng } = await import('../public/modules/games/deal.mjs');
  const { payRow, PAY } = await import('../public/modules/games/videopoker.mjs');
  const c = (r, s) => s * 13 + (r - 2);           // rank 2..14, suit 0..3 (♦ ♥ ♠ ♣)
  const board = [c(14, 0), c(13, 1), c(7, 2), c(4, 3), c(2, 0)];
  const a = rankHand(board.concat([c(14, 2), c(9, 1)])), b = rankHand(board.concat([c(14, 3), c(8, 1)]));
  ok(a.cat === 1 && b.cat === 1 && compareHands(a, b) > 0, 'same pair of aces: the kicker decides (9 beats 8)');
  const s1 = rankHand(board.concat([c(14, 2), c(3, 1)])), s2 = rankHand(board.concat([c(14, 3), c(3, 2)]));
  ok(compareHands(s1, s2) === 0, 'same five best cards: a split pot');
  const w = rankHand(board.concat([c(5, 1), c(3, 2)]));
  ok(w.cat === 4 && compareHands(w, a) > 0, 'the wheel (A-2-3-4-5) is a straight and beats a pair');
  const d1 = deckFor('vp-2026-10-16-1'), d2 = deckFor('vp-2026-10-16-1'), d3 = deckFor('vp-2026-10-16-2');
  ok(d1.join() === d2.join() && d1.join() !== d3.join() && new Set(d1).size === 52, 'seeded decks: same seed, same 52 cards; another hand, another deal');
  ok(typeof rng('x')() === 'number', 'rng gives numbers');
  ok(payRow([c(11, 0), c(11, 1), c(4, 2), c(7, 3), c(9, 0)]) === PAY.length - 1 && payRow([c(10, 0), c(10, 1), c(4, 2), c(7, 3), c(9, 0)]) === -1,
    'Video Poker: a pair of jacks pays, a pair of tens does not');
  ok(PAY[payRow([c(10, 2), c(11, 2), c(12, 2), c(13, 2), c(14, 2)])][1] === 800, 'Video Poker: the royal flush pays 800 per credit');
  // Who Wins?: every deal is nine different cards and its answer is the real one.
  const { makeDeal } = await import('../public/modules/games/whowins.mjs');
  const r = rng('who-wins-test');
  let okDeals = true, same = 0, splits = 0, early = 0;
  for (let i = 0; i < 300; i++) {
    const lv = i < 100 ? 0 : 4, d = makeDeal(lv, r);
    const all = d.board.concat(d.a, d.b);
    const cc = compareHands(rankHand(d.a.concat(d.board)), rankHand(d.b.concat(d.board)));
    if (new Set(all).size !== 9 || d.win !== Math.sign(cc)) okDeals = false;
    if (lv && d.ra.cat === d.rb.cat) same++;
    if (lv && d.win === 0) splits++;
    if (!lv && d.win === 0) early++;
  }
  ok(okDeals, 'Who Wins?: 300 deals, nine distinct cards each, the right answer every time');
  const { odds, mult } = await import('../public/modules/games/hilo.mjs');
  const shoe = []; for (let n = 0; n < 52; n++) if (n !== c(7, 0)) shoe.push(n);
  const o = odds(c(7, 0), shoe);
  ok(o.hi === 28 && o.lo === 20 && o.eq === 3, 'Higher or Lower: from a 7, 28 higher, 20 lower, 3 pushes');
  ok(mult(o.hi, o.lo) === 1.65 && mult(o.lo, o.hi) === 2.3 && mult(0, 48) === 0 && mult(47, 1) === 1.05,
    'Higher or Lower: the long shot pays more (×' + mult(o.hi, o.lo) + ' / ×' + mult(o.lo, o.hi) + '), never less than ×1.05');
  const { aceAction, tellFor, TELLS } = await import('../public/modules/games/bluff.mjs');
  const rb = rng('bluff-test');
  let bets = 0, bluffs = 0, checksAhead = 0, tellOnBluff = 0, tellOnBet = 0;
  for (let i = 0; i < 2000; i++) {
    const a1 = aceAction(1, rb), a2 = aceAction(-1, rb);
    if (a1 === 'bet') bets++; if (a1 === 'check') checksAhead++;
    if (a2 === 'bluff') { bluffs++; if (tellFor('bluff', 'sweat', rb) === 'sweat') tellOnBluff++; }
    if (tellFor('bet', 'sweat', rb) === 'sweat') tellOnBet++;
  }
  ok(bets === 2000 && checksAhead === 0 && bluffs > 850 && bluffs < 1150 && aceAction(0, rb) === 'check',
    "The Ace's Bluff: he bets every better hand, bluffs about half his worse ones (" + bluffs + '/2000), checks a tie');
  ok(tellOnBluff / bluffs > 0.75 && tellOnBet / 2000 < 0.25 && TELLS.length === 6,
    "The Ace's Bluff: his tell shows on most bluffs (" + Math.round(100 * tellOnBluff / bluffs) + '%) and on few value bets (' + Math.round(100 * tellOnBet / 2000) + '%)');
  // The mini-games and their (future) unlocks; the lessons are gone.
  const reg = await import('../public/modules/games/index.mjs');
  const games = reg.GAMES.filter((g) => g.id !== reg.HOME);
  ok(games.every((g) => g.unlock) && !('SHELVES' in reg), 'every game says how it unlocks, no shelves');
  const ids = new Set(games.map((g) => g.id));
  ok(['preflop', 'nuts', 'outs', 'potodds', 'equity'].every((x) => !ids.has(x)) && ids.has('whowins'),
    'Who Wins? is back and no lesson is left');
  ok(games.every((g) => !g.unlock.trophy || ids.has(g.unlock.trophy) || g.unlock.trophy.length), 'unlock trophies are named');
  const house = games.find((g) => g.id === 'house');
  ok(reg.unlocked(house, { count: 12, owned: new Set() }) && !reg.unlocked(house, { count: 11, owned: new Set() })
    && reg.unlocked({ unlock: { trophy: 'x' } }, { count: 0, owned: new Set(['x']) }) && !reg.unlocked({ unlock: { trophy: 'x' } }, { count: 30, owned: new Set() }),
    'unlocked(): a count of trophies, or one trophy in particular');
  // Poker Drop: the grid, its lines, a drop's score, the Ace's play.
  const P = await import('../public/modules/games/pokerdrop-rules.mjs');
  ok(P.WINDOWS.length === 44 && P.WINDOWS.every((w) => w.cells.length === 5), 'Poker Drop: 44 lines of five on the 7 × 6 grid (' + P.WINDOWS.length + ')');
  const pg = P.emptyGrid();
  ok(P.dropRow(pg, 3) === 0 && P.openCols(pg).length === 7, 'Poker Drop: a card falls to the bottom row of an empty column');
  // Bottom row: ♠ 10 J Q K, the A♠ dropped in the fifth column fills a royal flush.
  [c(10, 2), c(11, 2), c(12, 2), c(13, 2)].forEach((n, i) => { pg[P.cellOf(0, i)] = n; });
  const sd = P.scoreDrop(pg, P.cellOf(0, 4), c(14, 2));
  ok(sd.points === 150 && sd.cat === 9 && sd.lines.length === 1 && sd.lines[0].dir === 0, 'Poker Drop: filling a royal flush across scores 150');
  ok(P.scoreDrop(pg, P.cellOf(0, 4), c(2, 0)).points === 0 && P.scoreDrop(pg, P.cellOf(0, 5), c(14, 2)).lines.length === 0,
    'Poker Drop: a high card scores 0, a line with a gap is not full');
  for (let r = 0; r < 6; r++) pg[P.cellOf(r, 6)] = 40 + r;
  ok(P.dropRow(pg, 6) === -1 && P.openCols(pg).indexOf(6) < 0, 'Poker Drop: a full column takes no more card');
  const mv = P.aceMove(pg, [c(2, 0), c(14, 2)], [c(3, 1), c(4, 1)], { level: 2, rnd: rng('pd') });
  ok(mv && mv.col === 4 && mv.k === 1, 'Poker Drop: the Ace takes the royal flush when it is there');
  const blockG = P.emptyGrid();
  [c(5, 1), c(6, 1), c(7, 1), c(8, 1)].forEach((n, i) => { blockG[P.cellOf(0, i)] = n; });
  const mvB = P.aceMove(blockG, [c(2, 0), c(13, 3)], [c(9, 1), c(3, 2)], { level: 2, sudden: true, rnd: rng('pd2') });
  ok(mvB && mvB.col === 4, 'Poker Drop: in sudden death the Ace blocks the straight flush the opponent holds');
  ok(P.SCORE.length === 10 && P.SCORE[9] === 150 && P.SUDDEN_CAT === 4, 'Poker Drop: the scale, sudden death at a straight');
  ok(same > 80 && splits > 2 && early === 0, 'Who Wins?: harder levels bring same-kind showdowns (' + same + '/200) and split pots (' + splits + '), none at first');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
