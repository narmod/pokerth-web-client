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
ok(sch.upcoming[0].id === 9779 && sch.upcoming[2].id === 9794, 'the game id is carried (registrations lookup)');
// -- BBC registrations of one game (JSON, as read by QML BbcGameDates.loadRegs) --
ok(ce.bbcRegsUrl(9779) === 'https://bbc.pokerth.net/registration/date/get/9779', 'registrations URL');
{ const rg = ce.parseBbcRegs(JSON.stringify({ success: true, date: { id: 9779, regs: [
    { player: { nickname: 'spoof', admin: false } }, { player: { nickname: 'Jogy', admin: true } },
    { player: { nickname: '  ' } }, { player: null }, { player: { nickname: 'R&D <b>' } }] } }));
  ok(rg.ok && rg.players.map(p => p.nick).join('|') === 'spoof|Jogy|R&D <b>', 'nicknames kept as typed (no HTML decoding), blanks dropped');
  ok(rg.players[1].admin === true && rg.players[0].admin === false && rg.players[2].admin === false, 'admin flag only when true'); }
ok(ce.parseBbcRegs('{"success":false}').ok === false && ce.parseBbcRegs('<html>').ok === false && ce.parseBbcRegs('{"success":true,"date":{}}').ok === false, 'failure, HTML or wrong shape is an error');
ok(ce.parseBbcRegs(JSON.stringify({ success: true, date: { regs: Array.from({ length: 50 }, (_, i) => ({ player: { nickname: 'p' + i } })) } })).players.length === 20, 'bounded list');
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

// -- Champions of the Day (www.pokerth.net JSON) ---------------------------------
const cod = JSON.stringify([
  { username: 'RHanson123', url: '/player?u=RHanson123', score: 7.285714285714286, games: 7 },
  { username: 'darmax99', url: '/player?u=darmax99', score: 6.833333333333333, games: 6 },
  { username: 'AceTom57', url: '/player?u=AceTom57', score: 6.333333333333333, games: 6 },
  { username: 'il Buono', url: '/player?u=il Buono', score: 5.57, games: 7 }]);
const cp = ce.parseCod(cod);
ok(cp.ok && cp.champions.top.map(p => p.player).join(',') === 'RHanson123,darmax99,AceTom57' && cp.champions.top[0].score === 7.29 && cp.champions.top[0].games === 7, 'Champions of the Day: top three, score rounded');
ok(ce.parseCod('[]').ok === false && ce.parseCod('<html>').ok === false && ce.parseCod('{}').ok === false, 'Champions of the Day: empty, HTML or wrong shape is an error');

// -- aggregation -------------------------------------------------------------
const pages = { [ce.SOURCES.bbcSchedule]: bbcReg, [ce.SOURCES.bbcResults]: bbcRes, [ce.SOURCES.wecResults]: wecRes, [ce.SOURCES.mcHome]: mcHome, [ce.SOURCES.bbcRanking]: bbcRank, [ce.SOURCES.wecRanking]: wecRank, [ce.SOURCES.pthCod]: cod };
const all = await ce.buildEvents(u => Promise.resolve(pages[u]), NOW);
ok(all.ok && all.upcoming.length === 4 && !all.errors, 'all sources merge into one payload');
ok(all.upcoming.map(u => u.src).join(',') === 'bbc,bbc,bbc,mc', 'upcoming events are sorted by time across sites');
ok(all.results.map(r => r.src).join(',') === 'bbc,wec,mc', 'results keep a fixed site order');
ok(Array.isArray(all.leaders) && all.leaders.length === 0, 'leaders stay in the payload, empty (ranking pages no longer read)');
{ const seen = []; await ce.buildEvents(u => { seen.push(u); return Promise.resolve(pages[u]); }, NOW);
  ok(!seen.includes(ce.SOURCES.bbcRanking) && !seen.includes(ce.SOURCES.wecRanking) && seen.length === 5, 'one round reads five pages, not the two rankings'); }
ok(all.champions && all.champions.top.length === 3 && all.champions.url === ce.LINKS.pthLeaderboard, 'Champions of the Day ride along');
const part = await ce.buildEvents(u => u === ce.SOURCES.wecResults ? Promise.reject(new Error('upstream_503')) : Promise.resolve(pages[u]), NOW);
ok(part.ok && part.errors && part.errors.wec === 'upstream_503' && part.results.length === 2, 'one site down does not hide the others');
const none = await ce.buildEvents(() => Promise.reject(new Error('offline')), NOW);
ok(none.ok === false && none.error === 'no_data', 'everything down: ok=false so the tab can hide itself');
ok(JSON.stringify(all).length < 5000, 'the payload stays small (' + JSON.stringify(all).length + ' bytes)');

// -- WEC finals from their forum announcement (web.292) ---------------------
{
  const fs = await import('fs');
  const html = fs.readFileSync(new URL('./fixtures/wec-final-2026-09.html', import.meta.url), 'utf8');
  const post = { title: 'Re: WEC Monthly and Yearly Grand Finals', forum: 'WEC', link: 'https://www.pokerth.net/viewtopic.php?p=1#p1', date: '2026-10-02T17:49:00+02:00', html };
  const f = ce.parseWecFinalPost(post);
  ok(f && f.kind === 'final' && f.src === 'wec' && !f.grand && f.month === 9 && f.year === 2026, 'the September 2026 monthly final is recognised');
  ok(f.at === Date.parse('2026-10-04T20:00:00Z'), 'its start is the UTC time given in brackets (Sunday 4 Oct, 20:00 UTC = 22:00 CEST)');
  ok(f.setup && f.setup.stack === 10000 && f.setup.blind === 50 && f.setup.delay === 7 && f.setup.timeout === 15 && f.setup.raiseEvery === 25, 'table set-up: 10,000 / 50 / 7 s / 15 s / every 25 hands');
  ok(f.qualified.length === 10 && f.qualified[0].nick === 'Blupher' && f.qualified[0].won === 7 && f.qualified[0].games === 22 && f.qualified[2].nick === 'Doc Ijiwaru' && f.qualified[7].nick === 'M4N!4C' && f.qualified[9].place === 10, 'the ten qualified players, in order, with their month');
  ok(f.reserves.length === 2 && f.reserves[0].nick === 'DerSchlesier' && f.reserves[0].place === 11 && f.reserves[1].nick === 'MagE', 'replacements kept, the empty « 13th - » left out');
  ok(f.url === post.link, 'it links to the announcement');
  const quoted = ce.parseWecFinalPost(Object.assign({}, post, { html: 'Thanks!<blockquote>' + html + '</blockquote>' }));
  ok(quoted === null, 'an announcement only quoted in a reply is not read');
  ok(ce.parseWecFinalPost({ title: 'Re: VPNs', forum: 'General', html: 'nothing scheduled here' }) === null, 'an ordinary post gives nothing');
  const grand = ce.parseWecFinalPost({ title: 'WEC Monthly and Yearly Grand Finals', forum: 'WEC', link: 'https://www.pokerth.net/x', date: '2026-12-20T10:00:00Z',
    html: 'The Grand Final 2026 is scheduled for Sunday 10th January 2027 21:00 CET (20:00 UTC)<br>Starting Money: $ 20,000' });
  ok(grand && grand.grand === true && grand.year === 2026 && grand.at === Date.parse('2027-01-10T20:00:00Z') && grand.setup.stack === 20000, 'the yearly Grand Final too');
  const noUtc = ce.parseWecFinalPost({ title: 'WEC', forum: 'WEC', html: 'The finals for March 2027 are scheduled for Sunday 4th April 2027 22:00 CEST' });
  ok(noUtc && noUtc.at === Date.parse('2027-04-04T22:00:00+02:00'), 'without a UTC time, the time is read in server time');
  const NOW2 = Date.parse('2026-10-03T12:00:00+02:00');
  const kept = ce.wecFinals([post], [], NOW2);
  ok(kept.length === 1 && kept[0].posted === Date.parse(post.date), 'wecFinals: read from the posts');
  ok(ce.wecFinals([], kept, NOW2).length === 1, 'and kept once the post has left the feed');
  ok(ce.wecFinals([], kept, Date.parse('2026-10-05T12:00:00Z')).length === 0, 'dropped once played');
  const newer = Object.assign({}, post, { date: '2026-10-03T09:00:00+02:00', html: html.replace('22:00 CEST (20:00 UTC)', '21:00 CEST (19:00 UTC)') });
  const upd = ce.wecFinals([newer], kept, NOW2);
  ok(upd.length === 1 && upd[0].at === Date.parse('2026-10-04T19:00:00Z'), 'a newer announcement of the same final replaces the old one');
}

// -- Monthly Cup night from its forum topic (web.293) ------------------------
{
  const fs = await import('fs');
  const posts = JSON.parse(fs.readFileSync(new URL('./fixtures/monthly-cup-2026-09.json', import.meta.url), 'utf8'));
  const a = ce.parseMcPost(posts[0]);
  ok(a && a.month === 9 && a.year === 2026 && a.at === Date.parse('2026-09-26T20:00:00+02:00'), 'announcement: the cup time (« September 26th - 20:00 CEST »)');
  ok(a.closeAt === Date.parse('2026-09-26T18:30:00+02:00') && a.admins.join(',') === 'sp0ck,Jogy,The Dude,xTriXplEx,akia,il Buono', 'registration close and the table admins');
  const seed = ce.parseMcPost(posts[1]);
  ok(seed.round1.length === 6 && seed.round1[0].players.length === 10 && seed.round1[0].players[0] === 'sp0ck' && seed.round1[5].players.length === 9 && seed.round1[1].players.includes('Bilnäs'), 'seeding: six tables of the 1st round, names kept as written');
  const t = posts.slice(2, 6).map((p) => ce.parseMcPost(p).result);
  ok(t[0].table === 2 && t[0].top.join('|') === 'Borussen-Ass|Fjohn|bikerboyrsa+1', 'a table result: « 1 Borussen-Ass » lines');
  ok(t[1].table === 6 && t[1].top[2] === 'Einimant' && t[2].table === 4 && t[2].top[0] === 'GazO', '« Table 6: » and « 1. Ruhr-Elfe » lines, the log link skipped');
  ok(t[3].table === 5 && t[3].top.join('|') === 'Loosii|Saxe|vanya5k', 'and « 1st - Loosii, 2nd - Saxe, and 3d - vanya5k » on one line');
  const fin = ce.parseMcPost(posts[6]);
  ok(fin.finals.map((f) => f.tier + f.players.length).join(',') === 'gold6,silver6,bronze6' && fin.finals[0].players[0] === 'GaryFSU', 'final tables: gold, silver, bronze — the log links below are not read as tables');
  ok(ce.parseMcPost(posts[7]).result.tier === 'bronze' && ce.parseMcPost(posts[7]).result.top[0] === 'jake-1972', 'the bronze table result');
  const res = ce.parseMcPost(posts[9]);
  ok(res.champion === 'Loosii' && res.podium.join('|') === 'Loosii|Borussen-Ass|Ruhr-Elfe', 'results: the champion and the podium under the title');
  ok(ce.parseMcPost({ title: 'Re: WEC final', forum: 'WEC', html: 'Table 1<br>1. x' }) === null, 'other forums are not read');
  const NIGHT = Date.parse('2026-09-26T21:30:00+02:00');
  const cups = ce.monthlyCups(posts.slice(0, 6), [], NIGHT);
  ok(cups.length === 1 && cups[0].round1.length === 6 && cups[0].results.length === 4 && !cups[0].champion, 'mid-evening: seeding and four table results so far');
  const later = ce.monthlyCups(posts.slice(6), cups, Date.parse('2026-09-26T23:30:00+02:00'));
  ok(later.length === 1 && later[0].finals.length === 3 && later[0].champion === 'Loosii' && later[0].round1.length === 6 && later[0].results.length === 5, 'the rest of the night merged onto what was kept (posts gone from the feed)');
  ok(ce.monthlyCups([], later, Date.parse('2026-09-27T06:00:00+02:00')).length === 0, 'forgotten the next morning');
  const up = ce.mergeMonthlyCups([{ src: 'mc', kind: 'cup', month: 9, at: Date.parse('2026-09-26T20:00:00+02:00'), signups: 57, url: 'https://monthlycup.pokerth.net/registration' }], later, NIGHT);
  ok(up.length === 1 && up[0].signups === 57 && up[0].round1.length === 6 && up[0].until === up[0].at + 6 * 3600000 && up[0].topic, 'the site\u2019s cup gets the forum details and stays through its night');
  const gone = ce.mergeMonthlyCups([{ src: 'mc', kind: 'cup', month: 10, at: Date.parse('2026-10-31T20:00:00+01:00') }], later, NIGHT);
  ok(gone.length === 2 && gone[0].month === 9 && gone[0].champion === 'Loosii', 'once the site has moved on to the next cup, tonight\u2019s is still shown');
  ok(JSON.stringify(up).length < 6000, 'the cup stays small in the payload (' + JSON.stringify(up).length + ' bytes)');
}

console.log(fails ? '\n' + fails + ' FAILED' : '\nAll community-events checks passed');
process.exit(fails ? 1 : 0);
