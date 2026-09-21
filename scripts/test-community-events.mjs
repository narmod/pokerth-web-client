#!/usr/bin/env node
// Deterministic tests for the community events relay (server/community-events.js).
// Run: node scripts/test-community-events.mjs
//
// The three community sites have no API: the relay reads component props out of
// their HTML. The fixtures below are cut from the real pages (2026-09-20) so a
// markup change upstream shows up here as a parsing failure, not as an empty tab.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ce = require('../server/community-events.js');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  \u2713 ' : '  \u2717 ') + label);
  if (!cond) fails++;
}
const q = s => s.replace(/"/g, '&quot;');

// 2026-09-20 22:31 Berlin (CEST, +02:00)
const NOW = Date.parse('2026-09-20T22:31:00+02:00');

// -- time zone ---------------------------------------------------------------
ok(ce.zonedToEpoch('2026-09-20 23:15:00') === Date.parse('2026-09-20T23:15:00+02:00'), 'naive site time is read as Europe/Berlin in summer (+02:00)');
ok(ce.zonedToEpoch('2026-12-05 19:30:00') === Date.parse('2026-12-05T19:30:00+01:00'), 'and in winter (+01:00)');
ok(ce.zonedToEpoch('2026-10-25 01:00:00') === Date.parse('2026-10-25T01:00:00+02:00'), 'the night of the DST switch still resolves');
ok(ce.zonedToEpoch('soon') === null && ce.zonedToEpoch(null) === null, 'garbage dates are refused, not guessed');

// -- BBC schedule ------------------------------------------------------------
const gamedates = [
  { id: 9524, step: 1, date: '2026-08-01 01:00:00', title: null, num: 2 },
  { id: 9783, step: 1, date: '2026-09-21 21:30:00', title: null, num: 0 },
  { id: 9779, step: 1, date: '2026-09-20 23:15:00', title: null, num: 3 },
  { id: 9794, step: 2, date: '2026-09-23 21:30:00', title: null, num: 0 },
  { id: 9778, step: 1, date: '2026-09-20 21:30:00', title: null, num: 5 }
];
const bbcReg = '<div><registration-component :gamedates="' + q(JSON.stringify(gamedates)) + '" :calstart="&quot;2026-08-01&quot;"></registration-component></div>';
const sch = ce.parseBbcSchedule(bbcReg, NOW);
ok(sch.ok && sch.upcoming.length === 3, 'past games are dropped, upcoming ones kept (' + (sch.upcoming || []).length + ')');
ok(sch.upcoming[0].at === Date.parse('2026-09-20T23:15:00+02:00') && sch.upcoming[0].signups === 3, 'the next game comes first, with its sign-up count');
ok(sch.upcoming[2].step === 2, 'the step number is carried');
ok(sch.upcoming.every(u => u.seats === 10), 'BBC entries carry the 10 seats the site itself shows ("Players: n/10")');
ok(sch.upcoming.every(u => u.src === 'bbc' && u.url === 'https://bbc.pokerth.net/registration'), 'every entry links to the BBC registration page');
const many = Array.from({ length: 40 }, (_, i) => ({ step: 1, date: '2026-10-' + String(1 + (i % 28)).padStart(2, '0') + ' 19:30:00', num: 0 }));
ok(ce.parseBbcSchedule('<registration-component :gamedates="' + q(JSON.stringify(many)) + '">', NOW).upcoming.length === 8, 'a full season calendar is capped');
ok(ce.parseBbcSchedule('<html>login</html>', NOW).ok === false, 'a page without the component reports a parse error');

// -- BBC / WEC results -------------------------------------------------------
const bbcRes = '<results-component :results="' + q(JSON.stringify([
  { type: 1, number: 9741, started: '2026-09-20 01:00:00', p1: 'noob', p2: 'Flopzilla', p3: 'Red Gremlin' },
  { type: 1, number: 9742, started: '2026-09-20 19:30:00', p1: 'Red Gremlin', p2: 'spoof', p3: 'il Buono', p4: 'spankyss', p5: 'EINIM4NT', p6: 'Loosii', p7: 'Jogy', p8: 'de_insulaner', p9: 'cartero70', p10: 'Lix' }
])) + '">';
const br = ce.parseBbcResults(bbcRes);
ok(br.ok && br.result.id === 9742, 'the latest BBC game wins, whatever the row order');
ok(br.result.podium.join('|') === 'Red Gremlin|spoof|il Buono' && br.result.players === 10, 'podium and player count are read from p1..p10');
const wecRes = '<results-component :results="' + q(JSON.stringify([
  { wec: 8056, type: 1, started: '2026-09-19 22:00:00', p1: 'Blupher', p2: 'Frinkenstein', p3: 'ElmoEGO', p4: 'Yes', p5: 'MagE', p6: 'yagiello', p7: 'boehmi', p8: null, p9: null, p10: null }
])) + '">';
const wr = ce.parseWecResults(wecRes);
ok(wr.ok && wr.result.id === 8056 && wr.result.players === 7 && wr.result.podium[0] === 'Blupher', 'WEC uses its own id key and skips empty seats');
ok(ce.parseWecResults('<results-component :results="[]">').ok === false, 'an empty result list is an error, not a blank card');

// -- Monthly Cup: Laravel Js::from() props, verbatim from the live page --------
const mcHome = '<main><home-component :year="2026" :next-cup="JSON.parse(\'{\\u0022month\\u0022:9,\\u0022month_name\\u0022:\\u0022September\\u0022,\\u0022date\\u0022:\\u00222026-09-26T20:00:00+02:00\\u0022,\\u0022date_label\\u0022:\\u0022Saturday, September 26th 2026, 20:00\\u0022}\')" :signup-count="2" :latest-cup="JSON.parse(\'{\\u0022month\\u0022:8,\\u0022month_name\\u0022:\\u0022August\\u0022,\\u0022podium\\u0022:[{\\u0022playername\\u0022:\\u0022fojo\\u0022,\\u0022position\\u0022:2},{\\u0022playername\\u0022:\\u0022Doc Ijiwaru\\u0022,\\u0022position\\u0022:1},{\\u0022playername\\u0022:\\u0022Borussen-Ass\\u0022,\\u0022position\\u0022:3}]}\')" registration-url="https://monthlycup.pokerth.net/registration" signups-url="https://monthlycup.pokerth.net/signups" results-url="https://monthlycup.pokerth.net/results/series?year=2026" ></home-component></main>';
const mc = ce.parseMcHome(mcHome, NOW);
ok(mc.ok && mc.upcoming.length === 1, 'the next cup is read out of the JSON.parse(\'…\') prop');
ok(mc.upcoming[0].at === Date.parse('2026-09-26T20:00:00+02:00') && mc.upcoming[0].month === 9 && mc.upcoming[0].signups === 2, 'with its date, month and accepted players');
ok(mc.result && mc.result.podium.join('|') === 'Doc Ijiwaru|fojo|Borussen-Ass' && mc.result.month === 8 && mc.result.year === 2026, 'the last cup podium is sorted by position');
ok(mc.result.url === 'https://monthlycup.pokerth.net/results/series?year=2026', 'the results link comes from the page');
ok(ce.parseMcHome(mcHome.replace('results-url="https://monthlycup.pokerth.net/', 'results-url="https://evil.example/'), NOW).result.url === 'https://monthlycup.pokerth.net/', 'but never points off the cup site');
const noNext = ce.parseMcHome(mcHome.replace(/:next-cup="[^"]*"/, ':next-cup="null"'), NOW);
ok(noNext.ok && noNext.upcoming.length === 0 && noNext.result, 'no cup scheduled: no upcoming entry, the podium stays');
ok(ce.parseMcHome(mcHome, Date.parse('2026-09-27T00:00:00+02:00')).upcoming.length === 0, 'a cup already played is not announced');
ok(ce.propJson('JSON.parse(\'{\\u0022n\\u0022:\\u0022O\\u0027Neil \\\\u00e9\\u0022}\')').n === "O'Neil \u00e9", 'quotes and non-ASCII names survive the double escaping');

// -- ranking leaders ----------------------------------------------------------
const wecRank = '<ranking-component :stats="' + q(JSON.stringify([
  { player_id: 3, nickname: 'Blupher', score: '38.24', points: 650, games: 16, places: [], avg_games: 6, pos: 0 },
  { player_id: 6, nickname: 'boehmi', score: '32.06', points: 545, games: 16, places: [], avg_games: 6, pos: 0 },
  { player_id: 511, nickname: 'Yes', score: '30.00', points: 480, games: 16 },
  { player_id: 9, nickname: 'MagE', score: '20.00', points: 300, games: 15 }
])) + '" :stats_year="2026" :stats_month="09"></ranking-component>';
const wl = ce.parseWecRanking(wecRank);
ok(wl.ok && wl.leader.player === 'Blupher' && wl.leader.points === 650 && wl.leader.games === 16, 'WEC leader: first row of the monthly table');
ok(wl.leader.period.year === 2026 && wl.leader.period.month === 9, 'the month "09" is read as 9, with its year');
ok(wl.leader.next.join('|') === 'boehmi|Yes', 'two runners-up, no more');
ok(ce.parseWecRanking(wecRank.replace(':stats_month="09"', ':stats_month="&quot;09&quot;"')).leader.period.month === 9, 'a quoted month is tolerated');
const bbcRank = '<ranking-component :results="' + q(JSON.stringify([{ nickname: 'spoof', score: '41.0', points: 900, games: 22 }])) + '" :season="12" :allseasons="[12,11]"></ranking-component>';
const bl = ce.parseBbcRanking(bbcRank);
ok(bl.ok && bl.leader.player === 'spoof' && bl.leader.period.season === 12 && bl.leader.next.length === 0, 'BBC leader comes with its season; a one-row table has no runner-up');
ok(ce.parseWecRanking('<ranking-component :stats="[]">').ok === false, 'an empty table is an error, not a blank row');

// -- aggregation -------------------------------------------------------------
const pages = { [ce.SOURCES.bbcSchedule]: bbcReg, [ce.SOURCES.bbcResults]: bbcRes, [ce.SOURCES.wecResults]: wecRes, [ce.SOURCES.mcHome]: mcHome, [ce.SOURCES.bbcRanking]: bbcRank, [ce.SOURCES.wecRanking]: wecRank };
const all = await ce.buildEvents(u => Promise.resolve(pages[u]), NOW);
ok(all.ok && all.upcoming.length === 4 && !all.errors, 'all sources merge into one payload');
ok(all.upcoming.map(u => u.src).join(',') === 'bbc,bbc,bbc,mc', 'upcoming events are sorted by time across sites');
ok(all.results.map(r => r.src).join(',') === 'bbc,wec,mc', 'results keep a fixed site order');
ok(all.leaders.map(r => r.src + ':' + r.player).join(',') === 'bbc:spoof,wec:Blupher', 'leaders ride along, in the same site order');
const part = await ce.buildEvents(u => u === ce.SOURCES.wecResults ? Promise.reject(new Error('upstream_503')) : Promise.resolve(pages[u]), NOW);
ok(part.ok && part.errors && part.errors.wec === 'upstream_503' && part.results.length === 2, 'one site down does not hide the others');
const none = await ce.buildEvents(() => Promise.reject(new Error('offline')), NOW);
ok(none.ok === false && none.error === 'no_data', 'everything down: ok=false so the tab can hide itself');
ok(JSON.stringify(all).length < 5000, 'the payload stays small (' + JSON.stringify(all).length + ' bytes)');

console.log(fails ? '\n' + fails + ' FAILED' : '\nAll community-events checks passed');
process.exit(fails ? 1 : 0);
