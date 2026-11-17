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
for (const id of ['ace-runner', 'house', 'tapis', 'solitaire', 'videopoker', 'whowins', 'hilo', 'bluff', 'pokerdrop', 'poker-run']) {
  const d = art(id, false), l = art(id, true);
  const ids = [...d.matchAll(/id="([^"]+)"/g)].map((m) => m[1]), idsL = [...l.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  ok(/^<svg[^>]*viewBox="0 0 320 140"/.test(d) && d !== l && ids.every((x) => idsL.indexOf(x) < 0), id + ': a cover picture, one for each theme, ids that do not clash');
}
ok(art('nope', false) === '', 'no picture for an unknown game');
{
  const pr = await import('../public/modules/games/poker-run.mjs');
  const L = [0, 1, 2, 3, 4, 5].map(pr.stageLen);
  ok(L.every((x, i) => x > 600 && (!i || x >= L[i - 1])) && L[5] < L[0] * 1.5, 'Poker Run: six stages of like length, the last one too (' + L.join(', ') + ')');
  ok(pr.branchOfLane(0, 1) === 0 && pr.branchOfLane(2, 0) === 1 && pr.branchOfLane(1, 0) === 0 && pr.branchOfLane(1, 1) === 1, 'Poker Run: two roads at a fork, the middle lane takes its side');
  ok(pr.queenHearts(3, 14, true) === 3 && pr.queenHearts(10, 14, true) === 2 && pr.queenHearts(13, 14, true) === 1 && pr.queenHearts(2, 14, false) === 0 && pr.queenHearts(0, 0, true) === 3 && pr.queenMult(12) === 2.2,
    'Dame de Cœur: ♥♥♥ in half the time, ♥♥ in 80 %, ♥ in time, none missed; 12 ♥ → × 2.2');
  ok(pr.extraCars(0, 0) === 0 && pr.extraCars(3, 0) === 3 && pr.extraCars(5, 5) === 30 && pr.swerveShare(2) === 0 && pr.swerveShare(3) === 0.25 && pr.swerveShare(5) === 0.45
    && pr.convoys(3) === 0 && pr.convoys(4) === 2 && pr.convoys(5) === 3 && pr.swerveBlend(0) === 0 && pr.swerveBlend(pr.SWERVE_MOVE) === 1 && pr.swerveBlend(pr.SWERVE_MOVE / 2) === 0.5,
    'Poker Run traffic (web.112): 5 cars a level and 1 a stage, lane changes from level 3, convoys from level 4, an eased slide');
  const ps = await import('../public/modules/games/solitaire.mjs');
  ok([24, 21, 20, 4, 1, 0].map(ps.pileLayers).join() === '6,6,5,1,1,0', 'Poker Solitaire (web.114): the pile thins out as it empties, a back per 4 cards under the one to place');
  ok(pr.GRID.every((c, k) => c.length === k + 1) && new Set(pr.GRID.flat()).size === 21 && pr.GRID[0][0] === 'vegas'
    && pr.forkScenes(0, 0).join() === 'route66,valley' && pr.forkScenes(4, 4).join() === 'sanremo,moritz' && pr.forkScenes(3, 0).join() === 'biarritz,toscana' && pr.CURVE_MAX === 5,
    'Poker Run map (web.115): a pyramid as OutRun\'s — stage k has k + 1 scenes, left keeps the row, right goes one down; 21 scenes, 6 arrivals');
  const decor = await import('../public/modules/games/poker-run-decor.mjs');
  ok(['route66', 'miami', 'lavender', 'snowpine', 'neon'].every((k) => decor.PROPS.has(k)) && decor.snowfall(null, 100, 100, 0, 0, 0) === undefined,
    'Poker Run scenery (web.116): the new roadside things, no snow drawn where there is none');
  ok(pr.GRID[5].every((k) => decor.ARRIVAL_FX[k]) && Object.keys(decor.ARRIVAL_FX).length === 6 && pr.OUTRO_WIN > pr.OUTRO_LOSE,
    'Poker Run arrivals (web.117): each of the six casino towns celebrates its own way, a longer outro when the line is crossed');
  ok(pr.ICE_GRIP > 0.5 && pr.ICE_GRIP < 1 && 2.5 * pr.ICE_GRIP * 0.85 > 2.4 * 0.85 * 0.85 * pr.CURVE_MAX * 0.17,
    'Poker Run ice (web.118): less grip at St. Moritz, still steerable through the tightest bend below 0.85 of top speed');
  ok(pr.ARRIVAL_MULT.join() === '1,1.2,1.4,1.6,1.8,2' && pr.HIT_TIME[0] === 0 && pr.HIT_TIME[5] === 3 && pr.HIT_TIME.every((x, i) => !i || x > pr.HIT_TIME[i - 1]),
    'Poker Run (web.119): the arrival multiplies the score (×1 Atlantic City … ×2 St. Moritz); a crash costs time on harder roads (0 … 3 s)');
  ok(pr.kmhOf(0) === 0 && pr.kmhOf(-5) === 0 && pr.KMH_TOP === 240 && Math.round(pr.kmhOf(200 * 62 * 1.45)) === 348, 'Poker Run speed (web.113): 240 km/h at top speed, about 350 with the nitro');
  const c3 = await import('../public/modules/games/car3d.mjs');
  const o = { x: 100, y: 200, w: 60, yaw: 0, pitch: 0.22 }, s0 = c3.seatPoint(o), sR = c3.seatPoint({ ...o, yaw: 0.4 }), sL = c3.seatPoint({ ...o, yaw: -0.4 });
  let calls = 0; const stub = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => { calls++; return { addColorStop() {} }; }), set: (t, k, v) => { t[k] = v; return true; } });
  for (const yaw of [-0.5, 0, 0.5]) for (const part of ['back', 'front']) c3.drawCar(stub, { ...o, yaw, plate: () => {} }, part);
  ok(s0.x < o.x && s0.y < o.y && sR.x < s0.x && sL.x > s0.x && calls > 500, 'Poker Run: the 3D car draws at any yaw, the seat (behind the pivot) swings out of the turn (' + [sL.x, s0.x, sR.x].map((v) => v.toFixed(1)).join(', ') + ')');
}
const langDir = path.resolve('public/modules/lang');
const files = fs.readdirSync(langDir).filter((f) => f.endsWith('.mjs'));
const KEYS = ['gameWordAce', 'arHint', 'arTapStart', 'arBusted', 'arNoCards', 'arRecord', 'arNewRecord',
  'arAgain', 'arPause', 'arDistance', 'arLevel', 'arBlinds', 'arQuit', 'ach_runner', 'ach_runner_d',
  'hcName', 'hcHint', 'hcFloors', 'hcScore', 'hcPerfect', 'hcSteady', 'hcCollapse', 'hcAgain', 'hcModeFreeD', 'hcModeDailyD', 'hcModeZen', 'hcModeZenD', 'hcGlue', 'hcWind', 'hcBump', 'hcGoalMet', 'hcGold', 'hcHold', 'gmPick',
  'tpName', 'tpHint', 'tpRules', 'tpClassic', 'tpClassicD', 'tpAlone', 'tpWon', 'tpJoker', 'tpDealer', 'tpShuffle', 'tpArmed', 'tpRecave', 'tpClear', 'tpClean', 'tpBlinds', 'tpIn', 'gmKindEgg',
  'tpNewCards', 'tpNewWild', 'tpNewDealer', 'tpNewSeal', 'tpNewRise', 'tpFolie', 'tpFolieD', 'tpZenD', 'tpOver', 'tpDuelD', 'ach_tapis', 'ach_tapis_d', 'tpAllIn', 'tpTapAgain', 'tpNoMoves', 'tpFolded',
  'psName', 'psHint', 'psDaily', 'psFree', 'psCards', 'psFlushDraw', 'psStraightDraw', 'psBestLine', 'psAgain', 'ach_solitaire', 'ach_solitaire_d',
  'gmPlay', 'gmRules', 'gmIntro', 'arRules', 'hcRules', 'psRules',
  'vpName', 'vpHint', 'vpDeal', 'vpDraw', 'vpHeld', 'vpCredits', 'vpHands', 'vpJacks', 'vpDouble', 'vpCollect', 'vpPick', 'vpRules', 'vpVarJacks', 'vpVarBonus', 'vpVarDeuces', 'vpVarJoker', 'vpVarJacksD', 'vpVarBonusD', 'vpVarDeucesD', 'vpVarJokerD', 'vpKings', 'vpFiveKind', 'vpWildRoyal', 'vpFourDeuces', 'vpFourAces', 'vpFour2to4', 'vpFour5toK', 'vpCashOut', 'ach_videopoker', 'ach_videopoker_d',
  'wwName', 'wwHint', 'wwSplit', 'wwTooSlow', 'wwFever', 'wwT1', 'wwT2', 'wwT3', 'wwT4', 'wwT5', 'wwT6', 'wwModeEndless', 'wwModeEndlessD', 'wwLevel', 'wwLevelLab', 'wwModes', 'wwModeTv', 'wwModeTvD', 'wwQuestion', 'wwQLab', 'wwSafe', 'wwJSwap', 'wwJAce', 'wwJSave', 'wwJSaveSay', 'wwMillion', 'wwLost', 'wwKeep', 'wwModeDaily', 'wwModeDailyD', 'wwHandLab', 'wwDailyToday', 'wwDailyStreak', 'wwDailyDone', 'wwDailyPractice', 'wwDailyPracticeShort', 'wwTrap', 'wwTrapBoard', 'wwTrapCounterfeit', 'wwTrapWheel', 'wwTrapFlush', 'wwTrapKicker', 'wwTrapFive', 'wwRetry', 'wwRules', 'ach_whowins', 'ach_whowins_d', 'gmAgain',
  'hlName', 'hlHint', 'hlHigher', 'hlLower', 'hlCash', 'hlPot', 'hlRules', 'ach_hilo', 'ach_hilo_d',
  'hlModeHand', 'hlModeHandD', 'hlModeTourney', 'hlModeTourneyD', 'hlModeBoth', 'hlModeBothD', 'hlStack', 'hlLevel', 'hlBust', 'hlDone', 'hlShowdown', 'hlHandHint',
  'blName', 'blHint', 'blBets', 'blBluff', 'blTells', 'blChips', 'blRules', 'blModeFreeD', 'blModeDailyD', 'blModeTourneyD', 'blTimer', 'blQuick', 'blNotebook', 'blRepTight', 'blRepLoose', 'blReplay', 'blWin', 'blLose', 'blP_ace', 'blP_cowboy', 'blP_gent', 'blP_trap', 'blP_joker', 'blP_king', 'blT_sweat', 'blT_fierce', 'blT_cool', 'blT_fidget', 'blT_wave', 'blT_grin', 'blT_whistle', 'blT_chips', 'blT_wink', 'blT_scratch', 'hlModeTourney', 'evMcTable', 'ach_bluff', 'ach_bluff_d',
  'pdName', 'pdHint', 'pdVsAce', 'pdTwo', 'pdPoints', 'pdSudden', 'pdSuddenGoal', 'pdYou', 'pdAce', 'pdPlayer', 'pdYourTurn', 'pdAceTurn',
  'pdTurn', 'pdYouWin', 'pdAceWins', 'pdWins', 'pdTie', 'pdRules', 'ach_pdrop', 'ach_pdrop_d',
  'adHint', 'adRules', 'adModeFree', 'adModeFreeD', 'adModeDailyD', 'adModeTime', 'adModeTimeD', 'arModeTimeD', 'hofTitle', 'hofRank', 'hofOut', 'hofLogin', 'hofName3', 'hofNameFree', 'hofBad', 'hofEmpty', 'hofAsk', 'hofPublic', 'hofYes', 'hofNo', 'hofRemember', 'hofInfo', 'hofForget', 'hofForgetQ', 'hofForgot', 'hofOpt', 'hofOptAsk', 'hofOptYes', 'hofOptNo', 'adTime', 'adSalto', 'adStreak', 'adMagnet', 'adRebuy', 'adRebuyQ', 'adRebuyKeys', 'prTimeUp', 'psDaily',
  'prHint', 'prRules', 'prTimeUp', 'prQueen', 'prQueenD', 'prQDrift', 'prQChips', 'prQPass', 'prQClean', 'prQNitro', 'prQFast', 'prQLeft', 'prQRight',
  'gmTitle'];
let missing = [], badRecord = [];
for (const f of files) {
  const { strings } = await import(path.join(langDir, f));
  for (const k of KEYS) if (typeof strings[k] !== 'string' || !strings[k].trim()) missing.push(f + ':' + k);
  if (strings.arRecord && strings.arRecord.indexOf('{n}') < 0) badRecord.push(f);
  for (const k of ['pdPlayer', 'pdTurn', 'pdWins']) if (strings[k] && strings[k].indexOf('{n}') < 0) badRecord.push(f + ':' + k);
  if (strings.tpWon && strings.tpWon.indexOf('{b}') < 0) badRecord.push(f + ':tpWon');
  if (strings.tpBlinds && strings.tpBlinds.indexOf('{b}') < 0) badRecord.push(f + ':tpBlinds');
  if (strings.tpRules && strings.tpRules.split('\n').length !== 8) badRecord.push(f + ':tpRules lines');
  if (strings.pdRules && strings.pdRules.split('\n').length !== 7) badRecord.push(f + ':pdRules lines');
  if (strings.adRules && (strings.adRules.split('\n').length !== 8 || strings.adRules.indexOf('300') < 0 || strings.adRules.indexOf('← →') < 0)) badRecord.push(f + ':adRules');
  if (strings.prRules && (strings.prRules.split('\n').length !== 6 || !/22|۲۲/.test(strings.prRules) || strings.prRules.indexOf('◀ ▶') < 0 || !/flop/i.test(strings.prRules))) badRecord.push(f + ':prRules');
  const tr = (k) => strings[k] || k;
  if (gameForNick(strings.gameWordAce, tr) !== 'arcade') missing.push(f + ': own word not recognised');
  if (gameForNick('mascot', tr) !== 'arcade') missing.push(f + ': English word not recognised');
}
ok(missing.length === 0, 'every language has the Ace Runner strings and a working word' + (missing.length ? ' — ' + missing.slice(0, 6).join(', ') : ''));
ok(badRecord.length === 0, 'arRecord, pdPlayer, pdTurn, pdWins keep {n}, tpWon / tpBlinds {b}, pdRules 7 lines, adRules 8, prRules 6, tpRules 6' + (badRecord.length ? ' — ' + badRecord.join(', ') : ''));
const fr = (k) => ({ gameWordAce: 'mascotte' })[k] || k;
ok(gameForNick('  MaScOtTe ', fr) === 'arcade', 'case and spaces ignored');
ok(gameForNick('Mascóte', (k) => ({ gameWordAce: 'mascote' })[k] || k) === 'arcade', 'accents ignored');
ok(gameForNick('Narmod', fr) === null && gameForNick('Ace', fr) === null && gameForNick('As', fr) === null, 'ordinary nicknames, « Ace » and « As » included, do not trigger');
ok(gameForNick('', fr) === null && gameForNick('mascottes', fr) === null, 'empty or longer words do not trigger');
ok(norm('Éliminé') === 'elimine', 'norm strips accents');
ok(GAMES.every((g) => typeof g.load === 'function' && g.id && (g.name || g.nameKey)), 'registry entries are complete');
ok(['arcade', 'ace-runner', 'house', 'solitaire', 'ace-dash', 'poker-run'].every((id) => GAMES.some((g) => g.id === id)), 'arcade menu, Ace Runner, House of Cards, Poker Solitaire, Ace Dash and Poker Run registered');

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
  ok(PAY[payRow([c(10, 2), c(11, 2), c(12, 2), c(13, 2), c(14, 2)])][1] === 250, 'Video Poker: the royal flush pays 250 per credit');
  {
    const R = await import('../public/modules/games/videopoker-rules.mjs');
    const { JOKER } = await import('../public/modules/games/poker-hand.mjs');
    const V = (id) => R.variantOf(id), row = (cards, id) => { const v = V(id), i = R.rowOf(cards, v); return i < 0 ? '' : v.rows[i][0]; };
    const royal = [c(10, 2), c(11, 2), c(12, 2), c(13, 2), c(14, 2)];
    const ji = R.rowOf(royal, V('jacks'));
    ok(R.payOf(V('jacks'), ji, 5) === R.ROYAL_MAX && R.payOf(V('jacks'), ji, 4) === 1000 && R.payOf(V('jacks'), ji, 1) === 250,
      'Video Poker: a royal flush pays 250 a credit, and 4,000 at the max bet');
    const fullJ = [c(9, 0), c(9, 1), c(9, 2), c(4, 0), c(4, 1)], v = V('jacks');
    ok(R.payOf(v, R.rowOf(fullJ, v), 3) === 27, 'Video Poker: other hands pay per credit (full house 9 × 3)');
    ok(row([c(14, 0), c(14, 1), c(14, 2), c(14, 3), c(5, 0)], 'bonus') !== row([c(9, 0), c(9, 1), c(9, 2), c(9, 3), c(5, 0)], 'bonus')
      && V('bonus').rows[R.rowOf([c(14, 0), c(14, 1), c(14, 2), c(14, 3), c(5, 0)], V('bonus'))][2] === 80, 'Bonus Poker: four aces pay 80');
    ok(R.rowOf([c(2, 0), c(2, 1), c(2, 2), c(2, 3), c(9, 0)], V('deuces')) >= 0 && V('deuces').rows[R.rowOf([c(2, 0), c(2, 1), c(2, 2), c(2, 3), c(9, 0)], V('deuces'))][2] === 200,
      'Deuces Wild: four deuces pay 200');
    ok(R.rowOf([c(11, 0), c(11, 1), c(4, 2), c(7, 3), c(9, 0)], V('deuces')) === -1 && R.rowOf([c(11, 0), c(11, 1), c(2, 2), c(7, 3), c(9, 0)], V('deuces')) >= 0,
      'Deuces Wild: a pair does not pay, a deuce makes it three of a kind');
    const wr = R.rowOf([c(2, 0), c(11, 2), c(12, 2), c(13, 2), c(14, 2)], V('deuces'));
    ok(wr >= 0 && V('deuces').rows[wr][2] === 25, 'Deuces Wild: a wild royal flush pays 25');
    ok(R.rowOf([c(13, 0), c(13, 1), c(4, 2), c(7, 3), c(9, 0)], V('joker')) >= 0 && R.rowOf([c(12, 0), c(12, 1), c(4, 2), c(7, 3), c(9, 0)], V('joker')) === -1,
      'Joker Poker: kings or better pay, queens do not');
    const five = R.rowOf([c(8, 0), c(8, 1), c(8, 2), c(8, 3), JOKER], V('joker'));
    ok(five >= 0 && V('joker').rows[five][2] === 200, 'Joker Poker: four eights and the joker are five of a kind (200)');
    const dj = R.deckOf(V('joker'), 'vp-test-1'), dj2 = R.deckOf(V('joker'), 'vp-test-1'), dd = R.deckOf(V('deuces'), 'vp-test-1');
    ok(dj.length === 53 && new Set(dj).size === 53 && dj.includes(JOKER) && dj.join() === dj2.join() && dd.length === 52 && !dd.includes(JOKER),
      'Joker Poker deals 53 cards (the joker in), the others 52; same seed, same deck');
    ok(R.VARIANTS.length === 4 && R.MAX_BET === 5, 'four machines, bet 1 to 5');
  }
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
  const WW = await import('../public/modules/games/whowins.mjs');
  // The levels (web.31/32): each deals what it teaches, the traps are found.
  {
    const R = (await import('../public/modules/games/deal.mjs')).rng;
    const rnd = R ? R('ww-tables') : Math.random;
    const P = await import('../public/modules/games/poker-hand.mjs');
    const sample = (i, n) => Array.from({ length: n }, () => WW.LEVELS[i].deal(rnd));
    const right = (q) => { const c = P.compareHands(P.rankHand(q.a.concat(q.board)), P.rankHand(q.b.concat(q.board))); return q.win === (c > 0 ? 1 : c < 0 ? -1 : 0); };
    const s = WW.LEVELS.map((_, i) => sample(i, 40));
    ok(s.every((l) => l.every(right)) && s[0].every((q) => q.win !== 0 && q.ra.cat <= 2 && q.rb.cat <= 2)
      && s[1].every((q) => [q.ra.cat, q.rb.cat].some((c) => c === 4 || c === 5))
      && s[2].filter((q) => WW.trapOf(q) === 'kicker').length > 15 && s[3].filter((q) => WW.trapOf(q)).length >= 36
      && s[4].every((q) => Math.max(q.ra.cat, q.rb.cat) >= 6) && s.every((l) => l.every((q) => q.win !== 0)) && WW.LEVELS[5].time < WW.LEVELS[0].time,
      'Who Wins? levels: pairs & high card, flushes & straights, kickers, traps, strong hands, the Ace\'s faster mix — never a tie (no Split answer)');
    const C = (r, s2) => 13 * s2 + r - 2;                       // rank 2..14, suit 0..3
    const deal = (board, a, b) => { const ra = P.rankHand(a.concat(board)), rb = P.rankHand(b.concat(board)); const c = P.compareHands(ra, rb); return { board, a, b, ra, rb, win: c > 0 ? 1 : c < 0 ? -1 : 0 }; };
    const cf = deal([C(13, 0), C(13, 1), C(10, 0), C(10, 1), C(5, 2)], [C(3, 2), C(3, 3)], [C(12, 1), C(7, 1)]);
    const wh = deal([C(14, 0), C(2, 1), C(3, 2), C(9, 3), C(13, 0)], [C(4, 0), C(5, 1)], [C(13, 1), C(9, 2)]);
    const bd = deal([C(10, 0), C(11, 1), C(12, 2), C(13, 3), C(14, 0)], [C(2, 1), C(3, 2)], [C(4, 3), C(5, 0)]);
    const kk = deal([C(14, 0), C(14, 1), C(9, 2), C(6, 3), C(3, 0)], [C(13, 2), C(2, 3)], [C(12, 3), C(4, 1)]);
    ok(WW.trapOf(cf) === 'counterfeit' && WW.trapOf(wh) === 'wheel' && WW.trapOf(bd) === 'board' && WW.trapOf(kk) === 'kicker' && kk.win === 1,
      'trapOf(): a counterfeited pocket pair, the wheel, the board plays, the kicker');
    ok(WW.levelOf(0) === 0 && WW.levelOf(4) === 0 && WW.levelOf(5) === 1 && WW.levelOf(29) === 5 && WW.levelOf(400) === 5 && WW.MODES.some((m) => m.id === 'endless'),
      'levelOf(): a level every ' + WW.LEVEL_EVERY + ' right answers, the Ace\'s table last; Endless is a mode');
    ok(WW.LADDER.length === 15 && WW.LADDER[14] === 1000000 && WW.TV_LEVEL.length === 15 && WW.keptAfter(4) === 0 && WW.keptAfter(5) === 1000
      && WW.keptAfter(9) === 1000 && WW.keptAfter(10) === 32000 && WW.keptAfter(14) === 32000 && WW.JOKERS.map((j) => j[0]).join() === 'jswap,jace,jsave' && WW.MODES[0].id === 'tv',
      'TV show: 15 questions up to a million, safe levels at 1 000 and 32 000; jokers New hand, Ace\'s help, Second chance');
    const key = (l) => l.map((q) => q.board.join('.') + '|' + q.a.join('.') + '|' + q.b.join('.')).join(' ');
    const d1 = WW.dailyDeals('2026-11-14'), d2 = WW.dailyDeals('2026-11-14'), d3 = WW.dailyDeals('2026-11-15');
    ok(d1.length === WW.DAILY_HANDS && key(d1) === key(d2) && key(d1) !== key(d3) && d1.every(right),
      'Daily challenge: 10 hands, the same for everyone on a day, others the next day');
    const a1 = WW.dailyAfter(null, '2026-11-14', 300, 8), a2 = WW.dailyAfter(a1, '2026-11-15', 250, 7), a3 = WW.dailyAfter(a2, '2026-11-17', 400, 9);
    ok(WW.dayBefore('2026-03-01') === '2026-02-28' && a1.streak === 1 && a2.streak === 2 && a3.streak === 1 && a3.score === 400,
      'Daily challenge: the streak grows with each day in a row, back to 1 after a missed day');
    const seen = new Set();
    for (let i = 0; i < 400; i++) { const tr = WW.trapOf(WW.LEVELS[3 + (i % 3)].deal(rnd)); if (tr) seen.add(tr); }
    const m = (x) => x.length * 7;
    const wl = WW.wrapLines(m, 'Only five cards count: the extra card in a hand changes nothing', 140), wc = WW.wrapLines(m, '只算五张牌手里多出来的牌不起作用所以平分底池', 70);
    ok([...seen].every((tr) => WW.TRAP_KEYS[tr]) && seen.size >= 4 && wl.length > 2 && wl.every((l) => m(l) <= 140) && wc.length > 2 && wc.every((l) => m(l) <= 70),
      'traps explained: every trap has its explanation (' + [...seen].join(', ') + '); lines wrap by words, or by letters without spaces');
  }
  ok(WW.points(9, 1) === 28 && WW.points(9, 3) === 33 && WW.points(9, 5) === 66 && WW.points(0, 0) === 10
    && WW.REVEAL.every((x, i) => i === 0 || x >= WW.REVEAL[i - 1]) && WW.REVEAL_END < 2.5,
    'Who Wins?: points (speed, streak, doubled in Fever from ' + WW.FEVER_STREAK + ' in a row); the board turned over in ' + WW.REVEAL_END.toFixed(2) + ' s');
  const { odds, mult } = await import('../public/modules/games/hilo.mjs');
  const shoe = []; for (let n = 0; n < 52; n++) if (n !== c(7, 0)) shoe.push(n);
  const o = odds(c(7, 0), shoe);
  ok(o.hi === 28 && o.lo === 20 && o.eq === 3, 'Higher or Lower: from a 7, 28 higher, 20 lower, 3 pushes');
  ok(mult(o.hi, o.lo) === 1.65 && mult(o.lo, o.hi) === 2.3 && mult(0, 48) === 0 && mult(47, 1) === 1.05,
    'Higher or Lower: the long shot pays more (×' + mult(o.hi, o.lo) + ' / ×' + mult(o.lo, o.hi) + '), never less than ×1.05');
  {
    const HL = await import('../public/modules/games/hilo.mjs');
    ok(HL.MODES.map((m) => m.id).join(',') === 'hand,tourney,both', 'Higher or Lower: three ways to play (the hand, the tournament, both)');
    const pairH = [c(7, 0), c(7, 2)], straight = [c(5, 0), c(6, 1), c(7, 2), c(8, 3), c(9, 0)], royal = [c(10, 2), c(11, 2), c(12, 2), c(13, 2), c(14, 2)];
    ok(HL.handX([c(7, 0)]) === 1 && HL.handX(pairH) === 1.2 && HL.handX(straight) === 1.9 && HL.handX(royal) === 4
      && HL.HAND_X.every((x, i) => i === 0 || x > HL.HAND_X[i - 1]), 'Higher or Lower, the hand: the pot × the hand (×1 high card, ×1.2 a pair, ×1.9 a straight, ×4 a royal flush)');
    ok(HL.HAND_BB[0] === 0 && HL.HAND_BB[1] === 2 && HL.HAND_BB[9] === 100 && HL.HAND_BB.every((x, i) => i === 0 || x > HL.HAND_BB[i - 1]), 'Hand + tournament: the showdown pays 2 big blinds (a pair) … 100 (a royal flush)');
    ok(HL.betAmount('bet', 1000, 20) === 20 && HL.betAmount('raise', 1000, 20) === 500 && HL.betAmount('raise', 60, 50) === 60 && HL.betAmount('allin', 730, 20) === 730 && HL.betAmount('bet', 15, 20) === 15,
      'the tournament: Bet = the big blind, Raise = half the stack (at least 2 big blinds), All-In = the stack, never more than the stack');
    ok(HL.settleBet(1000, 200, 1) === 1200 && HL.settleBet(1000, 200, -1) === 800 && HL.settleBet(1000, 200, 0) === 1000, 'the tournament: even money, a push gives the bet back');
    ok(HL.levelAt(0) === 0 && HL.levelAt(4) === 0 && HL.levelAt(5) === 1 && HL.levelAt(999) === HL.BLINDS.length - 1 && HL.TOURNEY_CARDS === 60
      && HL.BLINDS.every((b, i) => b[1] === 2 * b[0] && (i === 0 || b[1] > HL.BLINDS[i - 1][1])), 'the tournament: 12 levels of 5 cards, the blinds go up');
  }
  const BLM = await import('../public/modules/games/bluff.mjs');
  const { aceAction, tellFor, TELLS } = BLM;
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
  ok(tellOnBluff / bluffs > 0.75 && tellOnBet / 2000 < 0.25 && TELLS.length === 10,
    "The Ace's Bluff: his tell shows on most bluffs (" + Math.round(100 * tellOnBluff / bluffs) + '%) and on few value bets (' + Math.round(100 * tellOnBet / 2000) + '%)');
  {
    const rs = rng('bluff-streets'), P = BLM.PERSONAS;
    let flopBets = 0, riverBets = 0, gentBluffs = 0, cowBluffs = 0;
    for (let i = 0; i < 2000; i++) {
      if (BLM.streetAction(1, 0, P[0], rs) === 'bet') flopBets++;
      if (BLM.streetAction(1, 2, P[0], rs) === 'bet') riverBets++;
      if (BLM.streetAction(-1, 2, P[2], rs) === 'bluff') gentBluffs++;
      if (BLM.streetAction(-1, 2, P[1], rs) === 'bluff') cowBluffs++;
    }
    ok(riverBets === 2000 && flopBets > 1000 && flopBets < 1400 && gentBluffs < cowBluffs / 2 && BLM.streetAction(0, 1, P[1], rs) === 'check',
      "The Ace's Bluff: on the river he always bets a winner, sometimes checks it on the flop; the Cowboy bluffs far more than the Gentleman (" + cowBluffs + ' / ' + gentBluffs + ')');
    let trapOnValue = 0;
    for (let i = 0; i < 2000; i++) if (BLM.tellFor('bet', 'wink', rs, P[3].tb, P[3].tf) === 'wink') trapOnValue++;
    ok(trapOnValue > 1350 && P.length === 6 && P[5].id === 'king', "The Ace's Bluff: the Trapper's tell means a real hand (" + Math.round(trapOnValue / 20) + '%), the King is the last character');
    ok(BLM.callsYou(1, 0, rs) && BLM.callsYou(0, 0, rs) && BLM.repOf(2, 2) === 0.5 && BLM.repOf(0, 0) === 0, "The Ace's Bluff: he always pays your bet with the better hand; your image is your caught bluffs over (at least 4) bets");
    let paysTight = 0, paysLoose = 0;
    for (let i = 0; i < 2000; i++) { if (BLM.callsYou(-1, 0, rs)) paysTight++; if (BLM.callsYou(-1, 0.6, rs)) paysLoose++; }
    ok(paysTight < 260 && paysLoose > 1100, "The Ace's Bluff: with the worse hand he folds to a solid player, pays a bluffer (" + paysTight + ' / ' + paysLoose + ')');
    ok(BLM.anteAt(1, 'free') === 5 && BLM.anteAt(30, 'free') === 5 && BLM.anteAt(5, 'tourney') === 5 && BLM.anteAt(6, 'tourney') === 10 && BLM.anteAt(999, 'tourney') === BLM.T_ANTES[BLM.T_ANTES.length - 1],
      "The Ace's Bluff: a fixed ante, rising every table in a tournament");
    const tables = [0, 1, 2, 3].map((i) => BLM.personaAt(i, 'free', rs, -1));
    ok(tables[0] === 0 && tables[3] === 5 && tables.slice(1, 3).every((x) => x >= 1 && x <= 4) && BLM.personaAt(4, 'tourney', rs, 0) === 5 && BLM.MODES.map((m) => m.id).join() === 'free,daily,tourney',
      "The Ace's Bluff: the Ace at the first table, the King at the last (every 5th in a tournament); three modes");
  }
  // The mini-games and their (future) unlocks; the lessons are gone.
  const reg = await import('../public/modules/games/index.mjs');
  const games = reg.GAMES.filter((g) => g.id !== reg.HOME);
  ok(games.every((g) => g.unlock) && !('SHELVES' in reg), 'every game says how it unlocks, no shelves');
  const ids = new Set(games.map((g) => g.id));
  ok(['preflop', 'nuts', 'outs', 'potodds', 'equity'].every((x) => !ids.has(x)) && ids.has('whowins'),
    'Who Wins? is back and no lesson is left');
  ok(games.every((g) => !g.unlock.trophy || ids.has(g.unlock.trophy) || g.unlock.trophy.length), 'unlock trophies are named');
  const tapis = games.find((g) => g.id === 'tapis');
  ok(reg.unlocked(tapis, { count: 14, owned: new Set() }) && !reg.unlocked(tapis, { count: 13, owned: new Set() })
    && reg.unlocked({ unlock: { trophy: 'x' } }, { count: 0, owned: new Set(['x']) }) && !reg.unlocked({ unlock: { trophy: 'x' } }, { count: 30, owned: new Set() }),
    'unlocked(): a count of trophies, or one trophy in particular');
  // The Mini-games mode (claude/CONCEPTION_MODE_ARCADE.md): a game to get better
  // at poker, then a game for fun; 8 trophies open the mode and the first game,
  // then one game every 2 trophies, the last at the number of trophies that
  // are not secret (every game can be opened without the secret ones).
  const { ACHIEVEMENTS } = await import('../public/modules/achievements/defs.mjs');
  const normal = ACHIEVEMENTS.filter((d) => d.cat !== 'secret').length;
  const path10 = reg.pathGames();
  ok(path10.map((g) => g.id).join(',') === 'whowins,ace-runner,hilo,tapis,videopoker,pokerdrop,solitaire,ace-dash,bluff,poker-run'
    && path10.every((g, i) => g.kind === (i % 2 ? 'fun' : 'learn')), 'Mini-games: the path alternates a game to learn and a game for fun, Tapis! 4th');
  const bonus = games.filter((g) => g.bonus);
  ok(bonus.length === 1 && bonus[0].id === 'house' && !bonus[0].kind && !reg.GAME_TROPHY.house && !ACHIEVEMENTS.some((d) => d.id === 'house'),
    'the House of Cards: an easter-egg bonus out of the path, its trophy gone');
  ok(reg.GAME_TROPHY.tapis === 'tapis' && ACHIEVEMENTS.some((d) => d.id === 'tapis' && d.cat === 'secret'), 'Tapis!: its secret trophy « Table rase » (tapis)');
  const needs = path10.map((g) => g.unlock.trophies);
  ok(reg.ARCADE_UNLOCK.trophies === 8 && needs[0] === 8 && needs.slice(0, -1).every((n, i) => i === 0 || n === needs[i - 1] + 2)
    && needs[needs.length - 1] === normal && normal === 27, 'Mini-games: 8 trophies, then every 2, the last at every normal trophy (' + needs.join(' ') + ' / ' + normal + ')');
  const none = reg.arcadeState({ count: 7, owned: new Set() }, false);
  const some = reg.arcadeState({ count: 12, owned: new Set() }, false);
  const word = reg.arcadeState({ count: 0, owned: new Set() }, true);
  ok(!none.mode && none.open === 0 && some.mode && some.open === 3 && some.total === 10
    && some.games.filter((g) => g.open).map((g) => g.id).join(',') === 'whowins,ace-runner,hilo'
    && word.mode && word.open === 10 && some.games[3].need === 14,
    'arcadeState(): hidden at 7 trophies, 3 games open at 12, everything with the secret word');
  // Games already played before the mode (the secret word kept nothing then)
  // stay open, the rest follows the trophies (choice B, 2026-11-14).
  const old = reg.arcadeState({ count: 3, owned: new Set(), played: new Set(['tapis', 'poker-run']) }, false);
  const egg = reg.arcadeState({ count: 0, owned: new Set(), played: new Set(['house']) }, false);
  ok(egg.mode && egg.open === 0 && egg.total === 10 && !egg.games.some((g) => g.id === 'house'), 'arcadeState(): the bonus is not in the path, but a House played before still shows the mode');
  const mix = reg.arcadeState({ count: 9, owned: new Set(), played: new Set(['bluff']) }, false);
  ok(old.mode && old.open === 2 && old.games.filter((g) => g.open).map((g) => g.id).join(',') === 'tapis,poker-run'
    && mix.open === 2 && mix.games.filter((g) => g.open).map((g) => g.id).join(',') === 'whowins,bluff' && mix.games[8].played,
    'arcadeState(): a game already played stays open, even below 8 trophies; the others follow the trophies');
  const store = {}, prevLS = globalThis.localStorage;
  globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
  store.pth_game_best_house = '42'; store['pth_game_best_ace-dash'] = '0';
  const pl = reg.playedGames(new Set(['runner', 'pdrop', 'gold']));
  if (prevLS === undefined) delete globalThis.localStorage; else globalThis.localStorage = prevLS;
  ok([...pl].sort().join(',') === 'ace-runner,house,pokerdrop', 'playedGames(): a game\'s secret trophy or a best score above 0 (' + [...pl].join(',') + ')');
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

console.log('Ace Runner: the climb, the venues, the score');
{
  const R = await import('../public/modules/games/ace-runner.mjs');
  const S = await import('../public/modules/games/runner-scenery.mjs');
  const lv = [1, 5, 10, 18, 20, 25, 30, 40, 50, 60, 83, 100];
  const sp = lv.map((l) => R.speedFor(l, 0));
  ok(sp.every((v, i) => i === 0 || v > sp[i - 1]), 'speed keeps climbing past level 20 (' + sp.map(Math.round).join(' → ') + ')');
  ok(R.speedFor(30, 0) - R.speedFor(20, 0) > 60 && R.speedFor(50, 0) - R.speedFor(30, 0) > 60, 'no plateau after level 20: still +60 px/s over each next 10–20 levels');
  ok(R.speedFor(500, 1e6) <= 940 + 50, 'speed stays playable (under its cap even after a very long run)');
  const gp = lv.map((l) => R.gapFor(l)[0]);
  ok(gp.every((v, i) => i === 0 || v <= gp[i - 1]) && gp[gp.length - 1] < gp[3], 'obstacles keep coming closer after level 18 (' + gp.map((v) => v.toFixed(2)).join(' → ') + ')');
  ok(R.TIERS.combo < R.TIERS.bounce && R.TIERS.bounce < R.TIERS.triple && R.TIERS.triple < R.TIERS.rain && R.TIERS.rain < R.TIERS.drift && R.TIERS.drift === 5, 'a new kind of obstacle in each of the five venues after the club');
  ok(S.VENUES.length === 6 && S.VENUE_EVERY === 10 && S.venueOf(1) === 0 && S.venueOf(10) === 0 && S.venueOf(11) === 1 && S.venueOf(51) === 5 && S.venueOf(999) === 5, 'six venues, one every 10 levels, the final table stays');
  const night = S.skyAt(0), noon = S.skyAt(0.5);
  ok(night.light === 0 && noon.light === 1 && night.top !== noon.top && S.dayAt(0) === S.DAY_START && Math.abs(S.dayAt(S.DAY_S) - S.DAY_START) < 1e-9, 'day and night: dark sky at night, light at noon, a full cycle every ' + S.DAY_S + ' s');
  // web.94: three modes — free run, daily challenge (seeded deck: the same for everyone today), time attack (90 s, a crash costs 5 s)
  const C_ = await import('../public/modules/games/common.mjs'), DL = await import('../public/modules/games/deal.mjs');
  ok(R.MODES.map((m) => m.id).join(',') === 'free,daily,time' && R.TIME_S === 90 && R.TIME_HIT === 5
    && C_.newDeck(DL.rng('ar-x-deck')).join() === C_.newDeck(DL.rng('ar-x-deck')).join() && C_.newDeck().length === 53,
    'Ace Runner: free run, daily challenge (a seeded deck), time attack (90 s, a crash costs 5 s)');
  ok(R.RUN_BONUS.length === 10 && R.RUN_BONUS[0] === 0 && R.RUN_BONUS[1] === 0.2 && R.RUN_BONUS[9] === 3 && R.RUN_BONUS.every((v, i) => i === 0 || v > R.RUN_BONUS[i - 1]), 'the hand bonus: +0 % for a high card, +20 % a pair … +300 % a royal flush');
  const long = R.scoreOf(83 * 300, { cat: -1 }), short = R.scoreOf(19 * 300, { cat: 9 });
  ok(long > short, 'a level-83 run with no hand beats a level-19 run with a royal flush (' + long + ' > ' + short + ')');
  ok(R.scoreOf(1000, { cat: 1 }) === 1200 && R.scoreOf(1000.9, null) === 1000 && R.bonusOf({ cat: -1 }) === 0, 'score = distance + distance × bonus');
  const mem = new Map();
  globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
  const reg = await import('../public/modules/games/index.mjs');
  mem.set('pth_game_best_ace-runner', '99999');
  const first = reg.resetRunnerRecord();
  mem.set('pth_game_best_ace-runner', '1234');
  const again = reg.resetRunnerRecord();
  ok(first && again === false && mem.get('pth_game_best_ace-runner') === '1234' && mem.get(reg.AR_SCORE_KEY) === '1', 'old Ace Runner record cleared once, the new one is kept');
  // Ace Dash (web.48): its record restarts too, the game stays open where it was played.
  mem.delete(reg.AD_SCORE_KEY); mem.set('pth_game_best_ace-dash', '5000');
  const d1 = reg.resetDashRecord();
  mem.set('pth_game_best_ace-dash', '321');
  const d2 = reg.resetDashRecord();
  ok(d1 && d2 === false && mem.get('pth_game_best_ace-dash') === '321' && mem.get('pth_game_played_ace-dash') === '1', 'old Ace Dash record cleared once, the new one kept, the game marked as played');
  mem.delete('pth_game_best_ace-dash');
  ok(reg.playedGames(new Set()).has('ace-dash'), 'playedGames(): Ace Dash still counts as played after the reset');
  // Tapis! (web.93): its records restart once (Classic, Madness / Zen, Daily), the game stays played.
  mem.delete(reg.TP_SCORE_KEY); mem.set('pth_game_best_tapis', '900000'); mem.set('pth_tp_best', '{"zen":5}'); mem.set('pth_tp_daily', '{"s":7}');
  const tp1 = reg.resetTapisRecord();
  mem.set('pth_game_best_tapis', '4321');
  const tp2 = reg.resetTapisRecord();
  ok(tp1 && tp2 === false && mem.get('pth_game_best_tapis') === '4321' && !mem.has('pth_tp_best') && !mem.has('pth_tp_daily') && mem.get('pth_game_played_tapis') === '1',
    'old Tapis! records cleared once (all modes), the new one kept, the game marked as played');
  delete globalThis.localStorage;
}

console.log('Ace Dash: the long run, the score, the modes');
{
  const D = await import('../public/modules/games/ace-dash.mjs');
  const lv = [1, 5, 10, 20, 30, 60, 100];
  const sp = lv.map((l) => D.speedFor(l, 0));
  ok(sp.every((v, i) => i === 0 || v > sp[i - 1]) && D.speedFor(500, 1e6) <= 27 + 2, 'Ace Dash: the speed keeps climbing, under its cap (' + sp.map((v) => v.toFixed(1)).join(' → ') + ')');
  const gp = lv.map((l) => D.gapFor(l));
  ok(gp.every((v, i) => i === 0 || v < gp[i - 1]) && gp[gp.length - 1] >= 0.8, 'Ace Dash: rows come closer at every level, never under 0.8 s (' + gp.map((v) => v.toFixed(2)).join(' → ') + ')');
  ok(D.VENUE_LV === 5 && D.venueAt(1) === 0 && D.venueAt(5) === 0 && D.venueAt(6) === 1 && D.venueAt(26) === 5 && D.venueAt(400) === 5, 'Ace Dash: a venue every 5 levels, the final table from level 26');
  ok(D.dashScore(1000.7, 200, { cat: 1 }) === 1440 && D.dashScore(1000, 0, { cat: -1 }) === 1000 && D.dashScore(100, 0, { cat: 9 }) === 400,
    'Ace Dash: score = (distance + chips) + the hand bonus (+20 % a pair, +300 % a royal flush)');
  ok(D.timeScore(500, { cat: 2 }) === 700 && D.timeScore(0, { cat: 9 }) === 0, 'Ace Dash: time attack = chip points + the hand bonus');
  ok(D.streakUp(1) === 2 && D.streakUp(D.STREAK_MAX) === D.STREAK_MAX && D.STREAK_MAX === 5, 'Ace Dash: the streak climbs to ×5 and stays there');
  ok(D.MODES.map((m) => m.id).join(',') === 'free,daily,time' && D.TIME_S === 60 && D.TIME_HIT === 5 && D.REBUY === 25, 'Ace Dash: three modes, 60 s time attack (−5 s a crash), a rebuy for 25 chips');
  ok(D.jetHeight(0) === 0 && Math.abs(D.jetHeight(D.JET_S / 2) - D.JET_Y) < 1e-9 && D.jetHeight(0.3) > 0 && D.jetHeight(0.3) < D.JET_Y && D.jetHeight(D.JET_S - 0.1) < 0.5 && D.jetHeight(D.JET_S) === 0,
    'Ace Dash: the jetpack climbs, flies ' + D.JET_S + ' s at ' + D.JET_Y + ' m and lands');
  ok(D.JET_LEVEL === 3 && D.JET_TIME === 5, 'Ace Dash: the jetpack from level 3, +5 s in time attack');
  const HC = await import('../public/modules/games/house.mjs');
  ok(HC.MODES.map((m) => m.id).join(',') === 'free,daily,zen' && HC.ZEN_FLOORS === 10 && HC.WIND_LV < HC.BUMP_LV, 'House of Cards: three modes (free, daily, Zen in 10 floors), the draught before the waiter');
  ok([0, 0.5, 0.99].every((r) => HC.goalFor(1, r) <= 2) && [0, 0.5, 0.99].every((r) => HC.goalFor(9, r) >= 3 && HC.goalFor(9, r) <= 6), 'House of Cards: the hand asked climbs with the blinds (a pair at first, up to a full house)');
  ok(HC.floorPay({ cat: 2, mult: 3 }, 1, false) === 120 && HC.floorPay({ cat: 2, mult: 3 }, 3, false) === 60 && HC.floorPay({ cat: 2, mult: 3 }, 3, true) === 120 && HC.floorPay({ cat: 6, mult: 8 }, 6, true) === 640,
    'House of Cards: a floor pays 20 × its hand, × 2 with its goal met, × 2 with a gold card');
  // Tapis! (claude/CONCEPTION_TAPIS.md): groups, hands, falls, the recave.
  const TP = await import('../public/modules/games/tapis-rules.mjs');
  const mk = (cols) => cols.map((col) => col.map((k) => ({ k, off: 0 })));
  const g1 = mk([[0, 0, 1], [0, 2], [1]]);
  ok(TP.groupAt(g1, 0, 0).length === 3 && TP.groupAt(g1, 2, 0).length === 1 && TP.groupAt(g1, 0, 2).length === 1 && TP.groupAt(g1, 5, 0).length === 0,
    'Tapis!: a group is the chips of one colour touching across and up (3 reds), a lone chip is alone');
  ok(TP.handOf(1) === -1 && TP.handOf(2) === 1 && TP.handOf(3) === 3 && TP.handOf(4) === 4 && TP.handOf(5) === 5 && TP.handOf(6) === 6 && TP.handOf(7) === 7 && TP.handOf(8) === 8 && TP.handOf(9) === 8 && TP.handOf(10) === 9 && TP.handOf(30) === 9,
    'Tapis!: a group is named by its size — pair, trips, straight, flush, full house, quads, straight flush (8), royal (10)');
  ok(TP.groupPay(g1, TP.groupAt(g1, 0, 0)).pts === 27 && TP.groupPay(mk([[3, 3]]), [[0, 0], [0, 1]]).pts === 250,
    'Tapis!: a group pays its chips\' values × its hand (3 reds × 5 × trips 1.75, rounded a chip: 3 × 9; a pair of 100s × 1.25: 250)');
  ok(TP.handMult(1) === 1.25 && TP.handMult(9) === 3.25 && TP.tierOf(3) === 1 && TP.tierOf(4) === 2 && TP.tierOf(8) === 3
    && TP.groupPay(mk([Array(12).fill(3)]), TP.groupAt(mk([Array(12).fill(3)]), 0, 0)).pts === (4 * 100 + 4 * 200 + 4 * 300) * 3.25,
    'Tapis!: gentler since web.93 — ×1.25 a pair to ×3.25 a royal, chips ×1 / ×2 / ×3 (12 blacks: 7 800, was 160 000)');
  const g2 = mk([[0, 0, 1, 2], [2]]);
  TP.removeCells(g2, [[0, 0], [0, 1]]);
  ok(g2[0].length === 2 && g2[0][0].k === 1 && g2[0][0].off === 2 && g2[0][1].off === 2 && g2[1][0].off === 0, 'Tapis!: the chips above a group fall the rows it leaves');
  ok(TP.anyMove(mk([[0, 1], [1, 0]])) === false && TP.anyMove(mk([[0, 1], [0]])) === true && TP.anyMove(mk([[0, 0]])) === true, 'Tapis!: anyMove() sees pairs across and up, none in a chessboard');
  const g3 = mk([[0, 1], [1, 0], [], [2]]), g3b = mk([[0, 1], [1, 0], [2]]);
  TP.recaveRow(g3, 3, () => 0.5); TP.recaveRow(g3b, 3, () => 0.5);
  ok(g3[0].length === 3 && g3[0][0].k === g3[1][0].k && g3[2].length === 1 && g3[2][0].k === g3[3][0].k && g3[0][1].off === -1 && TP.anyMove(g3) && g3b[2][0].k === 2,
    'Tapis!: the recave pushes in a row of pairs under every column, an empty one too (neighbours share a colour, a lone column its own)');
  ok(TP.colorsAt(1) === 3 && TP.colorsAt(5) === 4 && TP.colorsAt(13) === 5 && TP.timeFor(10, 1) === 35 && TP.timeFor(100, 1) === 90 && TP.timeFor(100, 5) === 94 && TP.timeFor(100, 30) === 87,
    'Tapis!: 3 colours, a 4th at level 5, a 5th at 13; 0.9 s a chip down to 0.7 s, +12 % a colour past 3, 35 s at least');
  ok(TP.inPay(3) === 300 && TP.cleanPay(3) === 1500, 'Tapis!: a character in his hole pays 100 × level, a cleared table 500 × level');
  const R = (await import('../public/modules/games/deal.mjs')).rng('tapis-test'), d = TP.dealRound(1, 6, 12, R);
  ok(d.length === 6 && d.every((c) => c.length >= 2 && c.length <= 13) && TP.anyMove(d) && d.every((c) => c.every((b) => b.k < 3)), 'Tapis!: a round deals 6 columns of 3 colours with a move to play');
  ok(TP.crossCells(mk([[0, 1, 2], [1, 1], [2]]), 0, 1).length === 4 && TP.colorCells(mk([[0, 1], [1, 0]]), 1).length === 2, 'Tapis!: the Dealer takes a row and a column, the Joker a colour');
  ok(TP.powerFor(8) === '' && TP.powerFor(13) === 'joker' && ['dealer', 'shuffle'].includes(TP.powerFor(9)) && ['dealer', 'shuffle'].includes(TP.powerFor(12)) && TP.POWER_MAX === 3,
    'Tapis!: a group of 9 wins a Dealer or a Shuffle, 13 a Joker (web.103: 6 and 9 until then), 3 of each at most');
  ok(TP.castFamily(1) === 'suits' && TP.castFamily(2) === 'suits' && TP.castFamily(3) === 'figures' && TP.castFamily(4) === 'figures' && TP.castFamily(5) === 'suits' && TP.castFamily(8) === 'figures' && TP.castFamily(20) === 'figures' && TP.castFamily(21) === 'mixed',
    'Tapis!: the Suits at levels 1-2, the Figures at 3-4, two by two, all mixed from 21');
  {
    const C = (k, o) => Object.assign({ k, off: 0 }, o || {}), W = TP.WILD, K = TP.CARD;
    const kit = TP.levelKit;
    ok(kit(1).cards === 0 && kit(2).cards === 2 && kit(2).wild === 0 && kit(3).wild === 1 && !kit(4).dealer && kit(5).dealer && kit(8).seals === 0 && kit(9).seals === 2 && kit(12).rise === 0 && kit(13).rise === 14 && kit(40).rise === 8,
      'Tapis!: what each level brings (cards 2, Joker chip 3, Dealer 5, seals 9, rising rows 13)');
    ok(TP.venueAt(1) === 0 && TP.venueAt(4) === 0 && TP.venueAt(5) === 1 && TP.venueAt(20) === 4 && TP.venueAt(21) === 5 && TP.venueAt(99) === 5, 'Tapis!: a venue every 4 levels, the final table from 21');
    const g1 = [[C(0), C(W), C(0)], [C(1), C(W)], [C(0, { seal: true }), C(K, { card: 12 })]];
    const grp = TP.groupAt(g1, 0, 0);
    ok(grp.length === 4 && TP.anyMove(g1), 'Tapis!: a Joker chip goes with the colour around it (0,0 + 2 Joker chips + 0,2: ' + grp.length + ')');
    ok(TP.groupAt(g1, 2, 1).length === 1 && TP.groupAt(g1, 2, 0).length === 1, 'Tapis!: a card or a sealed chip never joins a group');
    ok(TP.groupPay(g1, grp).pts === (5 + 50 + 50 + 5) * TP.handMult(TP.handOf(4)), 'Tapis!: a Joker chip pays 50 in its group');
    const g9 = [Array.from({ length: 9 }, () => C(0))], p9 = TP.groupPay(g9, TP.groupAt(g9, 0, 0));
    ok(p9.pts === (4 * 5 + 4 * 5 * 2 + 5 * 3) * TP.handMult(TP.handOf(9)) && p9.each.length === 9 && p9.each[8] === 15 * TP.handMult(TP.handOf(9)) && TP.tierOf(3) === 1 && TP.tierOf(4) === 2 && TP.tierOf(8) === 3,
      'Tapis!: in a big group the 5th to 8th chips count ×2, from the 9th ×3 (Monster Madness\' 100 / 250 / 500; ×5 until web.93)');
    const fr = TP.freedBy(g1, TP.groupAt(g1, 1, 0));
    ok(fr.cards.length === 1 && fr.seals.length === 1 && TP.freedBy(g1, [[0, 0]]).cards.length === 0, 'Tapis!: a group frees the card and breaks the seal next to it');
    const g2 = [[C(K, { card: 3 })]];
    ok(TP.recaveRow(g2, 3, () => 0.1) === 2 && g2[0].length === 3 && g2[0][0].k === g2[0][1].k && TP.anyMove(g2), 'Tapis!: the recave under a lone card brings a pair');
    const g3 = [[C(0), C(1)], [C(2)], []];
    ok(TP.riseRow(g3, 3, 2) === 1 && g3[0].length === 2 && g3[1].length === 2 && g3[2].length === 0, 'Tapis!: a rising row, not over the top nor in an empty column');
    let cards = 0, wild = 0, seals = 0, ok10 = true;
    for (let i = 0; i < 20; i++) {
      const gr = TP.dealRound(10, 8, 12);
      gr.forEach((col) => { if (col[col.length - 1].k === K || col[col.length - 1].seal) ok10 = false; col.forEach((b) => { if (b.k === K) cards++; if (b.k === W) wild++; if (b.seal) seals++; }); });
      if (!TP.anyMove(gr)) ok10 = false;
    }
    ok(ok10 && cards === 80 && wild === 40 && seals === 40, 'Tapis!: level 10 deals 4 cards, 2 Joker chips, 2 seals, never on top, always a move (' + cards + '/' + wild + '/' + seals + ')');
  }
  {
    // web.87: « No more moves! » — 2-3 rows under every column, the table's colours, joined to the stacks, never undone
    const C = (k) => ({ k, off: 0 });
    let okAll = true, eaten = true;
    for (let i = 0; i < 40; i++) {
      const g = [[], [], [C(1), C(0), C(1), C(0)], [], [C(0)]];
      const n = TP.refillRows(g, 4);
      const pal = new Set([].concat(...g).map((b) => b.k));
      if (!(n >= 2 && n <= 3 && g.every((col, c) => col.length === n + [0, 0, 4, 0, 1][c]) && g[2][n - 1].k === 1 && g[4][n - 1].k === 0
        && g[1].slice(0, n).every((b, j) => b.k === g[2][j].k) && [...pal].every((k) => k === 0 || k === 1) && TP.anyMove(g))) okAll = false;
      // the group under the lone stack reaches into it: taking it lowers the stack below its old height + n
      const grp = TP.groupAt(g, 2, n - 1);
      if (!grp.some(([c, r]) => c === 2 && r === n)) eaten = false;
    }
    ok(okAll && eaten, 'Tapis!: no more moves — 2-3 rows under every column, in the colours left, the one under a stack its bottom colour, an empty column a copy of its neighbour\'s');
  }
  const CS = await import('../public/modules/games/cast.mjs');
  const svgs = CS.KINDS.map((k) => CS.castSvg(k));
  ok(CS.KINDS.length === 9 && CS.SUITS.length === 4 && CS.FIGURES.length === 4 && svgs.every((x) => /^<svg viewBox="0 0 100 120"/.test(x) && /cs-armL/.test(x) && /e-open/.test(x) && /m-smile/.test(x) && /fx-sweat/.test(x))
    && new Set(svgs).size === 9, 'the cast: 9 characters (4 suits, 4 figures, the Joker), each with arms, every eye and mouth, sweat');
}

// The drawing quality (web.107, quality.mjs; audit claude/AUDIT_PERF_MINIJEUX_2026-11-16.md).
{
  const Q = await import('../public/modules/games/quality.mjs');
  ok(Q.frameStep(16.7) === 1 && Q.frameStep(11.1) === 1 && Q.frameStep(8.33) === 2 && Q.frameStep(6.94) === 2 && Q.frameStep(6.06) === 2 && Q.frameStep(4.17) === 4 && Q.frameStep(33) === 1,
    'quality: 60/90 Hz draw every frame, 120 → 60, 144 → 72, 165 → 82, 240 → 60 a second');
  ok(Q.qualitySteps(3).join() === '2,1.75,1.5,1.25,1' && Q.qualitySteps(1.5).join() === '1.5,1.25,1' && Q.qualitySteps(1).join() === '1' && Q.qualitySteps(0.75).join() === '1',
    'quality: the steps, the screen\'s own sharpness (≤ 2) first, never below 1');
  const run = (q, ms, target, secs) => { let down = 0; for (let t = 0; t < secs * 1000; t += ms) if (q.frame(ms, target)) down++; return down; };
  const fast = Q.createQuality(2);
  ok(fast.dpr === 2 && run(fast, 16.7, 16.7, 20) === 0 && fast.dpr === 2 && fast.good > 3, 'quality: a machine that keeps up keeps the full sharpness');
  const slow = Q.createQuality(2), half = (q, secs) => { for (let t = 0, i = 0; t < secs * 1000; i++) { const ms = i % 2 ? 26 : 16.7; t += ms; q.frame(ms, 16.7); } };
  half(slow, 2.9);
  const one = slow.dpr;
  half(slow, 1.6);
  const two = slow.dpr;
  half(slow, 30);
  ok(one === 2 && two === 1.75 && slow.dpr === 1, 'quality: half the draws late → one step every two windows of 1.5 s, down to 1 (' + [one, two, slow.dpr].join(' → ') + ')');
  const crawl = Q.createQuality(2);
  ok(run(crawl, 50, 16.7, 1.6) === 1 && crawl.dpr === 1.75, 'quality: nearly every draw late → a step after one window');
  const spikes = Q.createQuality(2);
  let dn = 0; for (let i = 0; i < 1200; i++) if (spikes.frame(i % 6 ? 16.7 : 30, 16.7)) dn++;
  ok(dn === 0 && spikes.dpr === 2, 'quality: one late draw out of six (a busy moment) changes nothing');
  ok(Q.createQuality(2, 1.25).dpr === 1.5 && Q.createQuality(2, 2).dpr === 2 && Q.createQuality(1.5, 1).dpr === 1.25 && Q.createQuality(2, 1).dpr === 1.25,
    'quality: a game opened again tries one step above the sharpness it kept');
  const st = Q.createQuality(2); run(st, 300, 16.7, 10);
  ok(st.dpr === 2, 'quality: stalls (a tab switch, a load) say nothing');
}
// web.109: a scenery a game may keep as one picture (nothing in it moves with time).
{
  const R = await import('../public/modules/games/runner-scenery.mjs');
  ok(R.sceneryStill({ venue: 0, p: 0.5 }) && R.sceneryStill({ venue: 4, p: 0.45 }) && !R.sceneryStill({ venue: 0, p: 0.95 }) && !R.sceneryStill({ venue: 2, p: 0.5 })
    && !R.sceneryStill({ venue: 5, p: 0.5 }) && R.sceneryStill({ venue: 2, p: 0.95, reduced: true }),
    'scenery: still by day in the club, Vegas, Monaco, Macao; not with twinkling stars, the sea or the final table\'s sparkles; always with reduced motion');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
