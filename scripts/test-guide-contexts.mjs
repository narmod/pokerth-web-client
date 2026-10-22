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
ok(pick({ screen: 'create' }) === 'create-game', 'game creation page → the types, Ranking for account holders, presets are practice');
// web.272: a LAN / dedicated server
ok(pick({ net: false, lan: true, rankPick: null }) === 'lobby-lan', 'LAN lobby → this server\'s tables, no ranking');
ok(pick({ net: false, lan: true, rankPick: null }, ['lobby-lan']) === null, 'LAN lobby: said once');
ok(pick({ net: true, lan: false }) !== 'lobby-lan', 'pokerth.net lobby: not the LAN tip');
{
  const CO = CONTEXTS.find((c) => c.id === 'lobby-open'), CC = CONTEXTS.find((c) => c.id === 'lobby-cup'), CT = CONTEXTS.find((c) => c.id === 'create-game');
  ok(CO.steps[0].text(W({ lan: true, net: false, openRanked: true })) === 'c1OpenLan' && CO.steps[0].text(W({ openRanked: true })) === 'c1OpenRanked', 'tap on a free table in LAN: no word about the ranking');
  ok(!C.applies(CC, W({ net: false, lan: true, gid: 0, cupName: 'BBC' })) && C.applies(CC, W({ gid: 0, cupName: 'BBC' })), 'cup bubble on pokerth.net only');
  const typeStep = CT.steps.find((s) => s.target === '#cf-gtype-row');
  ok(typeStep.text(W({ lan: true, net: false, screen: 'create' })) === 'c5CreateLan' && typeStep.text(W({ screen: 'create' })) === 'c5Create', 'create page, game type in LAN: who may sit down, nothing about the account');
  ok(['c1Lan', 'c1OpenLan', 'c5CreateLan', 'cfPlayersLan', 'cfPasswordLan'].every((k) => k in EN) && !/account/.test(EN.c1Lan + EN.c1OpenLan + EN.c5CreateLan), 'LAN texts exist, no pokerth.net account in them');
  // there are no ranked games on a LAN server (narmod): no Ranking type named in the LAN texts
  ok(!/Ranking game|ranked game starts/i.test(EN.c5CreateLan + EN.cfPlayersLan + EN.cfPasswordLan + EN.c1OpenLan), 'LAN texts never offer a Ranking game');
  const full = CONTEXTS.find((c) => c.id === 'create-game-full');
  const keysFor = (w) => full.steps.map((s) => (typeof s.text === 'function' ? s.text(W(Object.assign({ screen: 'create' }, w))) : s.text));
  ok(keysFor({ lan: true, net: false }).includes('cfPlayersLan') && keysFor({ lan: true, net: false }).includes('cfPasswordLan') && keysFor({ offline: true }).includes('cfPlayersLan') && keysFor({}).includes('cfPlayers'), 'full tour: players / password without the Ranking game in LAN (and players in training)');
}
// web.287: a tour of the form, one field per step, in the order of the page
const CG = CONTEXTS.find((c) => c.id === 'create-game-full');   // web.266: the tour of every field, from « Full tour »
const CQ = CONTEXTS.find((c) => c.id === 'create-game');        // web.266: the quick tour
const tourKeys = (w, ctx = CG) => { const r = C.createRun(ctx, W(w)); const out = []; for (let s = r.step(); s; s = r.next()) out.push(typeof s.text === 'function' ? s.text(W(w)) : s.text); return out; };
const onlineTour = tourKeys({ screen: 'create' });
ok(CG.tour === true && CG.locked && CG.locked.text === 'cfLocked' && 'cfLocked' in EN, 'create page: a tour, greyed-out fields explained');
// web.266: the quick tour — style, type, buttons — then « Full tour »
ok(CQ.tour === true && !CQ.manual && CG.manual === true && CQ.row === CG.row && CQ.locked === CG.locked, 'quick tour picked on the page, the full one only on demand');
ok(tourKeys({ screen: 'create' }, CQ).join() === 'cfIntroShort,cfStyleClosed,c5Create,cfActions', 'quick tour (account): intro, style, type, buttons — ' + tourKeys({ screen: 'create' }, CQ).join());
ok(tourKeys({ screen: 'create', guest: true }, CQ).join() === 'cfIntroShort,cfStyleClosed,c5CreateGuest,cfActions', 'quick tour (guest): the guest type line');
ok(tourKeys({ screen: 'create', offline: true }, CQ).join() === 'c5CreateOffline,cfStyleClosed,cfActions', 'quick tour (training): no type step');
const lastQ = CQ.steps[CQ.steps.length - 1];
ok(lastQ.buttons.join() === 'later,fullTour,gotIt' && 'fullTour' in EN && 'cfIntroShort' in EN && EN.cfIntroShort.includes('**' + EN.fullTour + '**'), 'last step: Later · Full tour · Got it, the intro names the button');
ok(onlineTour.join() === 'cfIntro,cfStyleClosed,cfPrefsNone,cfName,c5Create,cfPassword,cfSpectators,cfPlayers,cfStack,cfBlind,cfInterval,cfOrder,cfTimeout,cfDelay,cfActions', 'create page (account): every field, in the order of the form — ' + onlineTour.join());
const guestTour = tourKeys({ screen: 'create', guest: true });
ok(guestTour.indexOf('c5CreateGuest') >= 0 && guestTour.indexOf('cfNameGuest') >= 0 && guestTour.indexOf('c5Create') < 0, 'create page (guest): guest lines for the name and the type');
const offTour = tourKeys({ screen: 'create', offline: true });
ok(offTour[0] === 'c5CreateOffline' && offTour.indexOf('cfSkill') >= 0 && offTour.indexOf('cfName') < 0 && offTour.indexOf('c5Create') < 0 && offTour.indexOf('cfPassword') < 0, 'create page (training): training line, bot level, no name / type / password');
ok(CG.steps.every((s) => [].concat(typeof s.text === 'function' ? [s.text(W({ screen: 'create' })), s.text(W({ screen: 'create', guest: true })), s.text(W({ screen: 'create', offline: true }))] : [s.text]).every((k) => k in EN)), 'create page: every tour text exists in English');
ok(CG.steps.slice(1).every((s) => s.target && s.optional), 'create page: every field step has a target and is left out when its field is not on the page');
ok('prev' in EN, '« Back » button text');
// web.288: the game style block (quick settings) open or folded, my prefs saved or not
const styleStep = CG.steps[1], prefsStep = CG.steps[2];
ok(styleStep.text(W({ screen: 'create', styleOpen: true })) === 'cfStyle' && styleStep.text(W({ screen: 'create', styleOpen: false })) === 'cfStyleClosed', 'create page: the game style step follows the block, open or folded');
ok(prefsStep.text(W({ screen: 'create', prefs: true })) === 'cfPrefs' && prefsStep.text(W({ screen: 'create', prefs: false })) === 'cfPrefsNone', 'create page: my prefs — the ⭐ pill, or how to save them');
ok(/quick settings/.test(EN.cfStyle) && /quick settings/.test(EN.cfStyleClosed) && /Table preferences/.test(EN.cfPrefs) && /Save prefs/.test(EN.cfPrefsNone), 'create page: styles = quick settings; prefs per mode, where to edit them');
ok(/Any player with an account can create a Ranking table/.test(EN.c5Create) && /practice only/.test(EN.c5Create), 'D16 wording and presets = practice');
// C5 windows
for (const [key, id] of [['ranking', 'w-ranking'], ['events', 'w-events'], ['posts', 'w-posts'], ['adv', 'w-adv'], ['theme', 'w-theme'], ['music', 'w-music'], ['avatar', 'w-avatar'], ['players', 'w-players'], ['profile', 'w-profile'], ['logs', 'w-logs']]) {
  ok(pick({ windows: [key] }) === id, 'window « ' + key + ' » opened in the lobby → ' + id);
  ok(pick({ windows: [key] }, [id]) !== id, id + ' explained once');
}
ok(pick({ windows: ['ranking'] }, [], []) === 'w-ranking' && pick({}) === 'lobby-ranking', 'a window outranks the lobby tip behind it');
ok(pick({ screen: 'game', playing: true, windows: ['help'] }) === null, 'never during a hand, even over a window (D8)');
ok(pick({ screen: 'wait', ranked: true, windows: ['events'] }) === 'w-events', 'windows also in the waiting room');
// web.289: forum posts explained; each ranking explained on its own tab in « ? » mode
ok(/latest posts/.test(EN.c5Posts) && /Mark all as read/.test(EN.c5Posts) && /not read yet/.test(EN.hsFnDot), 'posts: list, tags, read marks, mark all as read');
const H = (await imp('public/modules/guide/hotspots.mjs')).HOTSPOTS;
for (const [src, key] of [['pth', 'hsRkPth'], ['bbc', 'hsRkBbc'], ['wec', 'hsRkWec'], ['lan', 'hsRkLan'], ['ach', 'hsRkAch']]) {
  const i = H.findIndex((e) => e[0].indexOf('[data-src="' + src + '"]') >= 0), g = H.findIndex((e) => e[1] === 'hsRkTab');
  ok(i >= 0 && H[i][1] === key && i < g && key in EN, 'ranking tab « ' + src + ' » → ' + key + ', before the generic tab entry');
}
ok(/15, 9, 6, 4, 3, 2, 1/.test(EN.hsRkPth) && /×1 to ×4/.test(EN.hsRkBbc) && /75 points/.test(EN.hsRkWec) && /private server/.test(EN.hsRkLan) && /training mode/.test(EN.hsRkAch), 'rankings: how each one works');
ok(/created by the cup admins/.test(EN.c5Events) && /needs no registration/.test(EN.c5Events), 'events: cups created by admins, WEC needs no registration (D14)');
ok(pick({ screen: 'connect', net: false, online: false, loginStep: 1 }) === 'login', 'login screen, mode cards → C3 modes + account');
ok(pick({ screen: 'connect', net: false, online: false, loginStep: 2 }) === 'login-profile', 'login form → C3 nickname + avatar');
ok(pick({ screen: 'connect', net: false, online: false, loginStep: 2, lanDir: true }) === 'login-profile', 'LAN list shown: the nickname tip still comes first');
ok(pick({ screen: 'connect', net: false, online: false, loginStep: 2, lanDir: true }, ['login-profile']) === 'login-lan', 'then the LAN directory tip');
ok(pick({ screen: 'connect', net: false, online: false, loginStep: 2 }, ['login-profile']) === null, 'no LAN list: no LAN directory tip');
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
const BTN = new Set(['later', 'gotIt', 'next', 'join', 'createRanking', 'signup', 'seeRanking', 'watch', 'seeEvents', 'editProfile']);
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
// web.64: a tap on a running game → « watch it as a spectator »
const LW = CONTEXTS.find((c) => c.id === 'lobby-watch');
ok(LW && LW.manual === true, 'lobby-watch: only on a tap (manual), never picked by itself');
ok(pick({ watchGid: 7 }) !== 'lobby-watch' && pick({ guest: true, watchGid: 7 }) !== 'lobby-watch', 'lobby-watch never picked by the engine');
ok(C.applies(LW, W({ watchGid: 7, gid: 0 })) && C.applies(LW, W({ watchGid: 7, gid: 0, guest: true })), 'applies in the lobby, guests included');
ok(!C.applies(LW, W({ watchGid: 7, offline: true })) && !C.applies(LW, W({ watchGid: 0, gid: 0 })) && !C.applies(LW, W({ watchGid: 7, screen: 'wait' })), 'not offline, not without a tapped game, not in a waiting room');
ok(LW.steps[0].text(W({ watchGid: 7 })) === 'c1Watch' && LW.steps[0].text(W({ watchGid: 7, watchKnown: true })) === 'c1WatchAgain', 'explained the first time, then a short « watch it? »');
ok([].concat(LW.steps[0].target(W({ watchGid: 7 }))).some((x) => x.includes('lobby-foot-spec')) && [].concat(LW.steps[0].target(W({ watchGid: 7 }))).some((x) => x.includes('data-gid="7"')), 'points at the Spectate button (footer, or the row’s own)');
ok(/\{spec\}/.test(EN.c1Watch) && LW.steps[0].vars(W({})).spec === 'Spectate', 'the Spectate button named as the UI names it');
ok(LW.steps[0].buttons.join() === 'later,gotIt,watch', 'Later · Got it · Watch');
// web.65: cup games (BBC, WEC, Monthly Cup…) get their own explanation
const { cupName } = await imp('public/modules/guide/cup.mjs');
ok(cupName({ type: 3, name: 'WEC 22:00' }) === 'WEC 22:00' && cupName({ type: 3, name: 'BBC Step 2 21:30' }) === 'BBC Step 2 21:30' && cupName({ priv: true, type: 1, name: 'Monthly Cup Gold' }) === 'Monthly Cup Gold', 'cup games recognised: WEC, BBC, Monthly Cup (invite-only or password)');
ok(cupName({ type: 1, name: 'BBC training' }) === '' && cupName({ type: 4, name: 'WEC practice' }) === '' && cupName({ type: 3, name: 'Friends only' }) === '' && cupName({ type: 3, name: 'Cupcake night' }) === '' && cupName(null) === '', 'not a cup: open tables, other invite-only tables, « Cupcake »');
ok(cupName({ type: 3, name: '**BBC**\u0007 Step 1' }) === 'BBC Step 1' && cupName({ type: 3, name: 'WEC ' + 'x'.repeat(60) }).length === 40, 'cup name cleaned for the bubble (no ** or control characters, 40 characters max)');
ok(LW.steps[0].text(W({ watchGid: 7, cupName: 'WEC 22:00' })) === 'c1WatchCup' && LW.steps[0].text(W({ watchGid: 7, cupName: 'WEC 22:00', watchKnown: true })) === 'c1WatchCup' && LW.steps[0].vars(W({ cupName: 'WEC 22:00' })).name === 'WEC 22:00', 'running cup game: its own « watch it » text, with its name');
const LC = CONTEXTS.find((c) => c.id === 'lobby-cup');
ok(LC && LC.manual === true && pick({ cupName: 'WEC 22:00' }) !== 'lobby-cup', 'lobby-cup: only on a tap (manual)');
ok(C.applies(LC, W({ cupName: 'BBC Step 1', gid: 0 })) && C.applies(LC, W({ cupName: 'BBC Step 1', gid: 0, guest: true })) && !C.applies(LC, W({ cupName: '' })) && !C.applies(LC, W({ cupName: 'BBC', offline: true })), 'lobby-cup: a tapped cup game in the lobby, guests included');
ok(LC.steps[0].text === 'c1Cup' && LC.steps[0].buttons.join() === 'later,gotIt,seeEvents' && LC.steps[0].vars(W({ cupName: 'BBC Step 1' })).name === 'BBC Step 1', 'not started: invited by the cup admins, Events offered');
ok(/\{name\}/.test(EN.c1Cup) && /\{name\}/.test(EN.c1WatchCup) && /\{spec\}/.test(EN.c1WatchCup), 'cup texts name the table (and the Spectate button)');
// web.66: no flag next to my name → how to set the Country in the pokerth.net profile
ok(pick({ noFlag: true }, ['lobby-ranking', 'lobby-ranking-create']) === 'lobby-flag', 'account holder without a flag → « set your Country » (after the Ranking tips)');
ok(pick({ noFlag: true }) === 'lobby-ranking', 'the Ranking tip still comes first');
ok(pick({ noFlag: true, guest: true }, ['lobby-guest']) === null && pick({ noFlag: true, net: false, rankPick: null }) === null, 'not for guests, not in LAN / offline');
ok(pick({ noFlag: true }, ['lobby-ranking', 'lobby-ranking-create', 'lobby-flag']) === null, 'said once');
ok(pick({ noFlag: true, gamesLoaded: false }, ['lobby-ranking', 'lobby-ranking-create']) === null, 'waits for the lobby to be loaded');
ok(/User Control Panel → Profile → Edit profile → \*\*Country\*\* → \*\*Submit\*\*/.test(EN.c1Flag) && /next login/.test(EN.c1Flag) && /User Control Panel/.test(EN.hsFlag) && /Guests have no flag/.test(EN.hsFlag), 'where to set the Country, when it shows');
const HS = (await imp('public/modules/guide/hotspots.mjs')).HOTSPOTS;
const fi = HS.findIndex((e) => e[1] === 'hsFlag'), li = HS.findIndex((e) => e[1] === 'hsLgiPlayer');
// web.67: a tap on an open non-ranked table → « it does not count for the ranking — join it? »
const LO = CONTEXTS.find((c) => c.id === 'lobby-open');
ok(LO && LO.manual === true && pick({ openGid: 9 }) !== 'lobby-open', 'lobby-open: only on a tap (manual)');
ok(C.applies(LO, W({ openGid: 9, gid: 0 })) && C.applies(LO, W({ openGid: 9, gid: 0, guest: true })) && !C.applies(LO, W({ openGid: 0 })) && !C.applies(LO, W({ openGid: 9, gid: 405 })) && !C.applies(LO, W({ openGid: 9, gid: 0, offline: true })), 'lobby-open: in the lobby, not seated, not offline');
ok(LO.steps[0].text(W({ openGid: 9 })) === 'c1Open' && LO.steps[0].text(W({ openGid: 9, guest: true })) === 'c1OpenGuest' && LO.steps[0].vars(W({ openName: 'Guest37866' })).name === 'Guest37866', 'says the name; guests are told it is a game open to them');
ok(LO.steps[0].buttons.join() === 'later,gotIt,join' && [].concat(LO.steps[0].target(W({ openGid: 9 }))).some((x) => x.includes('lobby-foot-join')), 'Later · Got it · Join, the Join button outlined');
ok(LO.steps[0].text(W({ openGid: 4, openRanked: true })) === 'c1OpenRanked' && LO.steps[0].vars(W({ openName: 'kuh poker', openN: 3, openMax: 10 })).n === 3 && LO.steps[0].vars(W({ openN: 3, openMax: 10 })).max === 10, 'an open Ranking table (account holder): « it counts, starts once full (3/10) — join it? » (web.68)');
ok(/counts for the ranking/.test(EN.c1OpenRanked) && /\{n\}\/\{max\}/.test(EN.c1OpenRanked), 'says plainly it is ranked, and how full');
ok(/not count for the ranking/.test(EN.c1Open) && /not count for the ranking/.test(EN.c1OpenGuest) && /open to guests/.test(EN.c1OpenGuest), 'says plainly it is not ranked');
const { tableName } = await imp('public/modules/guide/cup.mjs');
ok(tableName({ name: 'a**b\u0001c' }) === 'a b c' && tableName(null) === '', 'table name cleaned for the bubble');
ok(fi >= 0 && fi < li && /\.pl-flag/.test(HS[fi][0]) && /\.seat-flag/.test(HS[fi][0]) && HS[fi][3] === 'pthnet:avatars', '« ? » on a flag explains it (before the player row), More → Avatars and flags');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
