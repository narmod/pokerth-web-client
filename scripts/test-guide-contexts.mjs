#!/usr/bin/env node
// Ace's Help — the shipped contexts (modules/guide/contexts/) against the
// engine (core.mjs): the right context for each situation, no repeat of a
// context already seen (except the result of a game), silence during a hand,
// guests never pointed at Ranking tables (D16), every text / button key and
// {placeholder} resolvable in English.
// Run: node scripts/test-guide-contexts.mjs
import path from 'path';
import { pathToFileURL } from 'url';

const imp = (p) => import(pathToFileURL(path.resolve(p)).href);
const C = await imp('public/modules/guide/core.mjs');
const R = await imp('public/modules/guide/ranking-pick.mjs');
const { CONTEXTS } = await imp('public/modules/guide/contexts/index.mjs');
const EN = (await imp('public/modules/guide/lang/en.mjs')).default;

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}
const TABLE = { id: 12, type: 4, players: 7, max: 10, mode: 1 };
const W = (o) => Object.assign({ gid: 405, helpOn: true, screen: 'lobby', playing: false, online: true, guest: false, ranked: false, net: true,
  spectator: false, host: false, offline: false, loginStep: 0, gamesLoaded: true, rankPick: TABLE, waitCount: 7, waitMax: 10, result: null, windows: [] }, o);
const pick = (w, seen = [], snoozed = []) => {
  const c = C.pickContext(W(w), CONTEXTS, { seen: (id) => seen.includes(id), snoozed: (id) => snoozed.includes(id) });
  return c ? c.id : null;
};

// ── C1 lobby ──
ok(pick({}) === 'lobby-ranking', 'lobby with an open Ranking table → « join it »');
ok(pick({ rankPick: null }) === 'lobby-ranking-create', 'no open Ranking table → « create one »');
ok(pick({ rankPick: null, gamesLoaded: false }) === null, 'game list not loaded yet → wait');
ok(pick({ guest: true, rankPick: null }) === 'lobby-guest', 'guest → the free-account bubble only');
ok(pick({ guest: true, rankPick: TABLE }) === 'lobby-guest', 'guest never gets « join » even if a table is picked');
ok(pick({ guest: true }, ['lobby-guest']) === null, 'guest bubble shown once');
ok(pick({ net: false, rankPick: null }) === null, 'LAN / offline: nothing about Ranking');
ok(pick({ online: false, net: false }) === null, 'offline training: silent (D11)');
ok(pick({}, ['lobby-ranking']) === null, 'C1 seen → not repeated while a table is open');
ok(pick({}, [], ['lobby-ranking']) === null, '« Later » → folded for the session');
ok(pick({ helpOn: false }) === null, 'help off → silent');

// ── C2 waiting room ──
ok(pick({ screen: 'wait', ranked: true, rankPick: null }) === 'wait-ranking', 'ranked waiting room → the facts');
ok(pick({ screen: 'wait', ranked: false, rankPick: null }) === 'wait-normal', 'normal waiting room → C4');
ok(pick({ screen: 'wait', ranked: false, rankPick: null, spectator: true }) === null, 'a spectator waiting for the next hand: nothing');
ok(pick({ screen: 'wait', ranked: true }, ['wait-ranking']) === null, 'facts told once');
ok(pick({ screen: 'game', ranked: true, playing: true }) === null, 'silent during a hand (D8)');
ok(pick({ screen: 'game', ranked: true, playing: false }) === null, 'silent at the table');
ok(pick({ screen: 'create' }) === null, 'nothing on game creation yet (C5)');
ok(pick({ screen: 'connect', net: false, online: false, loginStep: 1 }) === 'login', 'login screen, mode cards → C3 modes + account');
ok(pick({ screen: 'connect', net: false, online: false, loginStep: 2 }) === 'login-profile', 'login form → C3 nickname + avatar');
ok(pick({ screen: 'connect', net: false, online: false, loginStep: 1 }, ['login']) === null, 'C3 told once');
ok(pick({ screen: 'connect', loginStep: 1, helpOn: false }) === null, 'help off: silent on the login screen');

// ── C2.4 result ──
ok(pick({ result: { place: 4 } }) === 'ranked-result', 'back in the lobby after a ranked game → the result first');
ok(pick({ result: { place: 4 } }, ['ranked-result']) === 'ranked-result', 'the result speaks after every game (repeat)');
ok(pick({ result: { place: 4 } }, [], ['ranked-result']) === 'lobby-ranking', '« Later » on the result → the next tip');
ok(pick({ screen: 'wait', ranked: true, result: { place: 2 } }) === 'wait-ranking', 'not in the waiting room');

// C4 by role
const wn = CONTEXTS.find((c) => c.id === 'wait-normal').steps[0];
ok(wn.text(W({ screen: 'wait', host: true })) === 'c4Host', 'host → start / fill up with bots / invite');
ok(wn.text(W({ screen: 'wait', host: false })) === 'c4Guest', 'seated player → the host starts, invite friends');
ok(wn.text(W({ screen: 'wait', offline: true, host: true })) === 'c4Offline', 'training → start, bots fill the seats');
ok([].concat(wn.target(W({ host: true })))[0].includes('wp-btn-start') && [].concat(wn.target(W({})))[0].includes('wp-btn-invite'), 'C4 points at Start (host) or Invite (others)');

// ── texts, buttons, targets ──
const samples = [W({ screen: 'connect', loginStep: 1 }), W({ screen: 'connect', loginStep: 2 }), W({ screen: 'wait', host: true }), W({ screen: 'wait' }), W({ screen: 'wait', offline: true }), W({}), W({ rankPick: null }), W({ guest: true }), W({ screen: 'wait', ranked: true }), W({ result: { place: 4 } }), W({ result: { place: null, tied: true } })];
const vars = (s) => (String(s).match(/\{\w+\}/g) || []).map((x) => x.slice(1, -1));
const BTN = new Set(['later', 'gotIt', 'next', 'join', 'createRanking', 'signup', 'seeRanking']);
for (const c of CONTEXTS) {
  for (const w of samples.filter((x) => C.applies(c, x) || c.manual)) {
    c.steps.forEach((s, i) => {
      const key = typeof s.text === 'function' ? s.text(w) : s.text;
      ok(typeof EN[key] === 'string', `${c.id}#${i}: text key « ${key} » exists`);
      const v = typeof s.vars === 'function' ? s.vars(w) : (s.vars || {});
      const missing = vars(EN[key]).filter((k) => v[k] == null);
      ok(!missing.length, `${c.id}#${i}: every {placeholder} filled` + (missing.length ? ' — ' + missing.join(',') : ''));
      const tg = typeof s.target === 'function' ? s.target(w) : s.target;
      ok(tg == null || [].concat(tg).every((x) => typeof x === 'string' && x.length > 2), `${c.id}#${i}: target is a selector (or a list of them)`);
      for (const b of s.buttons || []) ok(BTN.has(b) && typeof EN[b] === 'string', `${c.id}#${i}: button « ${b} » known and worded`);
      if (Array.isArray(s.buttons) && c.id !== 'welcome') ok(s.buttons.includes('later') && (s.buttons.includes('gotIt') || s.buttons.includes('next')), `${c.id}#${i}: always « Later » and « Got it » (D7)`);
    });
  }
}
const r = CONTEXTS.find((c) => c.id === 'ranked-result');
const v4 = r.steps[0].vars(W({ result: { place: 4 } }));
ok(v4.place === 4 && v4.points === R.pointsFor(4) && v4.points === 4, '4th → « +4 points »');
ok(r.steps[0].text(W({ result: { place: null, tied: true } })) === 'c2ResultTie', 'unknown place → no points claimed');
const jr = CONTEXTS.find((c) => c.id === 'lobby-ranking').steps[0];
ok(jr.target(W({})) === '#g-list .game-row[data-gid="12"]', 'C1 highlights the picked table’s row');
ok(jr.vars(W({})).n === 7 && jr.vars(W({})).max === 10, 'C1 says « 7/10 »');
ok(CONTEXTS.find((c) => c.id === 'wait-ranking').steps.length === 6, 'C2: the x/10 notice + five facts (points, Score, seasons, 5/5, where)');
ok(/15, 9, 6, 4, 3, 2, 1/.test(EN.c2Points) && /40/.test(EN.c2Points), 'point scale quoted as in the rankhow help');
ok(/5 seconds to act/.test(EN.c2Why55) && /11 hands/.test(EN.c2Why55) && /10,000/.test(EN.c2Why55), '5/5 explained from the Ranking preset');
ok(/with an account/.test(EN.c1None), '« any player with an account » (D16)');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
