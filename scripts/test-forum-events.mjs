#!/usr/bin/env node
// Deterministic tests for the Events tab of the Forum news window
// (public/modules/ui/forum-events.mjs) and its wiring.
// Run: node scripts/test-forum-events.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const rd = p => fs.readFileSync(path.join(root, p), 'utf8');
process.env.TZ = 'Europe/Paris';
const E = await import('../public/modules/ui/forum-events.mjs');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  \u2713 ' : '  \u2717 ') + label);
  if (!cond) fails++;
}

const NOW = Date.parse('2026-09-20T22:50:00+02:00');

// -- when ---------------------------------------------------------------------
ok(/^today/.test(E.evWhen(Date.parse('2026-09-20T23:15:00+02:00'), NOW, 'en')), 'a game later tonight reads "today"');
ok(/^tomorrow/.test(E.evWhen(Date.parse('2026-09-21T01:00:00+02:00'), NOW, 'en')), 'a 01:00 game seen at 22:50 is "tomorrow" (calendar days, not 24 h blocks)');
ok(/^yesterday/.test(E.evWhen(Date.parse('2026-09-19T22:00:00+02:00'), NOW, 'en')), 'last night reads "yesterday"');
ok(/26/.test(E.evWhen(Date.parse('2026-09-26T20:00:00+02:00'), NOW, 'en')) && /Sat/.test(E.evWhen(Date.parse('2026-09-26T20:00:00+02:00'), NOW, 'en')), 'further out: weekday and date');
ok(/^demain/.test(E.evWhen(Date.parse('2026-09-21T01:00:00+02:00'), NOW, 'fr')), 'the wording follows the locale (fr)');
ok(/^today \u00b7 .*20.* \u00b7 /.test(E.evWhen(Date.parse('2026-09-20T23:15:00+02:00'), NOW, 'en')) && /Sep/.test(E.evWhen(Date.parse('2026-09-20T23:15:00+02:00'), NOW, 'en')), 'the relative day comes with its date ("today \u00b7 Sep 20")');
ok(/^demain \u00b7 21 sept\./.test(E.evWhen(Date.parse('2026-09-21T01:00:00+02:00'), NOW, 'fr')), 'in the locale too ("demain \u00b7 21 sept.")');
ok(E.evWhen(NaN, NOW, 'en') === '' && E.evWhen(null, NOW, 'en') === '', 'no date, no text');
ok(E.evWhen(NOW, NOW, 'xx-invalid-locale-') !== undefined, 'a bad locale never throws');

// -- labels -------------------------------------------------------------------
ok(E.evUpcomingTitle({ src: 'bbc', step: 2, title: null }, 'en', 'Step') === 'Step 2', 'BBC rows are titled by their step');
ok(E.evUpcomingTitle({ src: 'bbc', step: 1, title: 'Special' }, 'en', 'Etape') === 'Etape 1 \u00b7 Special', 'with the translated word and the optional title');
ok(E.evStepBadge({ src: 'bbc', step: 3 }).text === 'STEP 3' && E.evStepBadge({ src: 'bbc', step: 3 }).cls === 'fn-forum ev-stepb ev-step3', 'BBC step badge = STEP n, coloured per step (QML stepColor)');
ok(E.evStepBadge({ src: 'bbc', step: 0 }) === null && E.evStepBadge({ src: 'mc', month: 9 }) === null, 'no step badge for special games and other sources');
// Collapsible registrations (QML BbcGameDates.loadRegs / expandable).
ok(E.evExpandable({ src: 'bbc', id: 9779, signups: 3 }) && !E.evExpandable({ src: 'bbc', id: 9779, signups: 0 }) && !E.evExpandable({ src: 'bbc', signups: 3 }) && !E.evExpandable({ src: 'mc', id: 1, signups: 53 }), 'only BBC games with sign-ups (and an id) unfold');
{ const t = 1e12, r = { players: [1, 2, 3], at: t, loading: false, error: false };
  ok(E.evRegsFresh(r, 3, t + 60000) && !E.evRegsFresh(r, 4, t + 60000) && !E.evRegsFresh(r, 3, t + 121000) && !E.evRegsFresh(Object.assign({}, r, { error: true }), 3, t), 'registrations are re-read when the count changed, after 2 min, or after an error'); }
ok(E.evPlayersText(1) === '1 player registered' && E.evPlayersText(3) === '3 players registered' && E.evPlayersText(0) === '0 players registered', 'BBC sign-ups in full words, QML playersText (singular only for 1)');
ok(E.evPlayersText(3, '1 joueur inscrit', '{n} joueurs inscrits') === '3 joueurs inscrits', 'translated forms');
// Footer button follows the selected upcoming event (web.247).
ok(E.evSelKey({ src: 'bbc', id: 9779, at: 1 }) === 'bbc:9779' && E.evSelKey({ src: 'wec', kind: 'daily', at: 5 }) === 'wec:5', 'selection keys: BBC by id, others by source + time');
ok(E.evRegisterAction(null).key === 'evBbcRegister' && /bbc\.pokerth\.net\/registration/.test(E.evRegisterAction(null).url), 'nothing selected: register for the BBC');
ok(E.evRegisterAction({ src: 'mc', url: 'https://monthlycup.pokerth.net/registration' }).key === 'evMcRegister' && E.evRegisterAction({ src: 'mc', url: 'https://evil.example/' }).url === 'https://monthlycup.pokerth.net/registration', 'Monthly Cup: its own sign-up page, safe URLs only');
ok(E.evRegisterAction({ src: 'wec', kind: 'daily' }).none === true, 'WEC daily game: no registration, button disabled');
// WEC daily game: 22:00 server time (Europe/Berlin), one per evening.
ok(E.evGameTimeToUtc(2026, 9, 28, 22, 0) === Date.UTC(2026, 8, 28, 20, 0) && E.evGameTimeToUtc(2026, 12, 1, 22, 0) === Date.UTC(2026, 11, 1, 21, 0), 'Berlin wall time -> UTC, summer and winter');
{ const w = E.evWecDaily('2026-10-24', '2026-10-26');
  ok(w.length === 3 && w.every(function (e) { return e.src === 'wec' && e.kind === 'daily' && E.evGameDay(e.at) === new Date(e.at).toISOString().slice(0, 10); }), 'one WEC row per evening, grouped under its own day');
  ok(w[1].at === Date.UTC(2026, 9, 25, 21, 0) && E.evSafeUrl(w[0].url) !== '', 'across the October time change; the link is allowed');
  ok(E.evWecDaily('2026-10-24', '2026-10-23').length === 0 && E.evWecDaily('x', 'y').length === 0, 'empty range / bad keys'); }
// Day grouping (QML BbcGameDates._gameDay): Berlin clock, before 14:00 = previous evening.
ok(E.evGameDay(Date.UTC(2026, 8, 28, 17, 30)) === '2026-09-28', '19:30 Berlin (CEST) belongs to that day');
ok(E.evGameDay(Date.UTC(2026, 8, 28, 23, 0)) === '2026-09-28', 'the 01:00 Berlin game belongs to the previous evening');
ok(E.evGameDay(Date.UTC(2026, 11, 31, 23, 0)) === '2026-12-31' && E.evGameDay(Date.UTC(2027, 0, 1, 13, 0)) === '2027-01-01', 'winter time (CET) and year change');
{ const n = new Date(2026, 8, 28, 18, 0).getTime();
  ok(/^Today · Monday, /.test(E.evDayLabel('2026-09-28', n, 'en')) && /^Tomorrow · /.test(E.evDayLabel('2026-09-29', n, 'en')), 'day headers: Today / Tomorrow + weekday, date');
  ok(/^Aujourd.hui · lundi, 28\/09\/2026$/.test(E.evDayLabel('2026-09-28', n, 'fr')) && /^mercredi, /.test(E.evDayLabel('2026-09-30', n, 'fr')), 'localised, capitalised relative word, bare date beyond tomorrow'); }
ok(E.evUpcomingTitle({ src: 'mc', month: 9 }, 'en') === 'September' && E.evUpcomingTitle({ src: 'mc', month: 9 }, 'fr') === 'septembre', 'the Monthly Cup is titled by its month, in the locale');
ok(E.evMonthName(13, 'en') === '' && E.evMonthName(0, 'en') === '', 'a month out of range gives nothing');
ok(E.evResultMeta({ src: 'bbc', id: 9743, podium: ['spoof', 'ElmoEGO', 'il Buono'], at: Date.parse('2026-09-20T21:15:00+02:00') }, NOW, 'en').startsWith('#9743 \u00b7 2. ElmoEGO \u00b7 3. il Buono \u00b7 today'), 'result meta: id, runners-up, when');
ok(E.evResultMeta({ src: 'mc', month: 8, year: 2026, at: null, podium: ['Doc Ijiwaru', 'fojo', 'Borussen-Ass'] }, NOW, 'en') === 'August 2026 \u00b7 2. fojo \u00b7 3. Borussen-Ass', 'Monthly Cup meta: month and year, no time');
ok(E.evSrcName('mc') === 'Monthly Cup' && E.evSrcClass('bbc') === 'fn-c0' && E.evSrcClass('wec') === 'fn-c1' && E.evSrcClass('zz') === 'fn-c7', 'site names and the forum colour code are reused');

// -- sign-ups -----------------------------------------------------------------
ok(E.evSignupText({ signups: 4, seats: 10 }) === '4/10' && E.evSignupText({ signups: 0, seats: 10 }) === '0/10', 'BBC sign-ups read like the BBC calendar: n/10');
ok(E.evSignupText({ signups: 2 }, 'Inscrits : {n}') === 'Inscrits : 2', 'no table size (Monthly Cup): the translated label');
ok(E.evSignupText({ signups: null, seats: 10 }) === '' && E.evSignupText(null) === '', 'no count, no text');

// -- leaders ------------------------------------------------------------------

// -- server clock line --------------------------------------------------------
// TZ = Europe/Paris, server Europe/Berlin: same wall time → no « your time ».
const T0 = Date.parse('2026-09-26T14:05:00+02:00');
const W = { title: 'Server time', yours: 'Your time' };
ok(E.evClockText(T0, 'Europe/Berlin', 'en-GB', W) === 'Server time (Berlin): 14:05', 'clock line: « Server time (Berlin): 14:05 », as in the lobby');
ok(E.evClockText(T0, 'Europe/Lisbon', 'en-GB', W) === 'Server time (Lisbon): 13:05 \u00b7 Your time 14:05', 'clock line: the player\'s own time when it differs');
ok(E.evClockText(T0, 'Europe/Berlin', 'fr', { title: 'Heure du serveur', yours: 'Votre heure' }) === 'Heure du serveur (Berlin): 14:05', 'clock line: translated title');
ok(E.evClockText(T0, '', 'en', W) === '' && E.evClockText(null, 'Europe/Berlin', 'en', W) === '', 'clock line: nothing until the server clock is known');

// -- links --------------------------------------------------------------------
ok(E.evSafeUrl('https://wec.pokerth.net/results/ranking') !== '' && E.evSafeUrl('https://bbc.pokerth.net/registration') !== '' && E.evSafeUrl('https://monthlycup.pokerth.net/results/series?year=2026') !== '' && E.evSafeUrl('https://www.pokerth.net/app.php/leaderboard') !== '', 'community site and pokerth.net links pass');
ok(E.evSafeUrl('https://evil.example/') === '' && E.evSafeUrl('javascript:alert(1)') === '' && E.evSafeUrl('https://bbc.pokerth.net.evil.example/') === '', 'anything else is dropped');

// -- wiring -------------------------------------------------------------------
const html = rd('public/pokerth-client.html'), css = rd('public/pokerth.css'), sw = rd('public/sw.js'), fn = rd('public/modules/ui/forumnews.mjs');
ok(/id="fn-tabs"/.test(html) && /forumSelectTab\('events'\)/.test(html) && /id="fn-events"/.test(html), 'the window has the tab bar and the events box');
ok(/window\.forumSelectTab = forumSelectTab/.test(fn), 'forumnews.mjs exposes the tab switch');
const tabs = html.slice(html.indexOf('id="fn-tabs"'), html.indexOf('</div>', html.indexOf('id="fn-tabs"')));
ok(tabs.indexOf('data-tab="events"') !== -1 && tabs.indexOf('data-tab="events"') < tabs.indexOf('data-tab="posts"'), 'Events is the first tab, Posts the second');
ok(/class="rk-tab active"[^>]*data-tab="events"/.test(tabs), 'Events is the active tab in the markup');
ok((tabs.match(/class="fn-tab-ico"/g) || []).length === 2 && /<span data-i18n="forumTabEvents">/.test(tabs), 'both tabs carry an icon; the label sits in its own span (i18n never wipes the icon)');
ok(/let _tab = 'events';/.test(fn) && /function openForumModal\(\) \{[\s\S]{0,400}_tab = 'events';/.test(fn), 'the window opens on the Events tab every time');
ok(/import \{ lobbyClockNow, lcCity, lcLabels \} from '\.\/lobby-clock\.mjs'/.test(rd('public/modules/ui/forum-events.mjs')), 'the clock line reuses the lobby clock (same /__time sync)');
ok(/adv-no-communitycontent #forum-modal #fn-tabs/.test(css), 'the community-content option hides the tab bar');
ok(sw.includes("'/modules/ui/forum-events.mjs'"), 'the module is precached by the service worker');

// -- i18n: every catalogue carries the eight keys -------------------------------
const KEYS = ['forumTabPosts', 'forumTabEvents', 'evUpcoming', 'evResults', 'evSignups', 'evError', 'evNone', 'evOpenSite', 'evChampions'];
const dir = path.join(root, 'public', 'modules', 'lang');
let bad = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.mjs'))) {
  const m = await import(path.join(dir, f));
  for (const k of KEYS) if (typeof m.strings[k] !== 'string' || !m.strings[k]) bad.push(f + ':' + k);
  if (!/\{n\}/.test(m.strings.evSignups || '')) bad.push(f + ':evSignups{n}');
}
ok(bad.length === 0, 'all catalogues have the keys, evSignups keeps its {n}' + (bad.length ? ' — ' + bad.slice(0, 5).join(', ') : ''));

// Days of the player, the site's day and time (web.295). This file runs in Paris
// (TZ pinned above); the Tokyo case runs in a child process with TZ=Asia/Tokyo.
{
  const at = Date.parse('2026-10-03T19:30:00+02:00');      // BBC Saturday 19:30 in Berlin
  const late = Date.parse('2026-10-04T01:00:00+02:00');    // the 01:00 game, on the Saturday evening of the BBC calendar
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz === 'Europe/Berlin' || tz === 'Europe/Paris') {
    ok(E.evPlayerDay(at) === '2026-10-03' && E.evPlayerDay(late) === '2026-10-03', 'Berlin time: the player\u2019s days are the BBC evenings');
    ok(E.evBerlinRef(at, 'en') === null, 'Berlin time: no site line (same clock)');
  }
  if (!process.env.PTH_TZ_CHILD) {
    const { execFileSync } = await import('child_process');
    let out = '';
    try { out = execFileSync(process.execPath, ['-e', "process.env.TZ='Asia/Tokyo';import(process.argv[1]).then(E=>{const a=Date.parse('2026-10-03T19:30:00+02:00'),b=Date.parse('2026-10-03T23:15:00+02:00'),l=Date.parse('2026-10-04T01:00:00+02:00');const r=E.evBerlinRef(a,'en-GB'),r2=E.evBerlinRef(l,'en-GB');console.log(JSON.stringify({d:E.evPlayerDay(a),d2:E.evPlayerDay(b),r,r2}))})", new URL('../public/modules/ui/forum-events.mjs', import.meta.url).href], { env: Object.assign({}, process.env, { TZ: 'Asia/Tokyo', PTH_TZ_CHILD: '1' }) }).toString(); } catch (e) { out = ''; }
    let j = null; try { j = JSON.parse(out.trim().split('\n').pop()); } catch (e) { j = null; }
    ok(j && j.d === '2026-10-03' && j.d2 === '2026-10-04', 'Tokyo: 19:30 Berlin = 02:30 Sunday there, still Saturday night; 23:15 Berlin = 06:15, Sunday');
    ok(j && j.r && /Sat/.test(j.r.day) && /3/.test(j.r.day) && j.r.time === '19:30', 'and its row says what the site shows: Sat 3 Oct · 19:30');
    ok(j && j.r2 && /Sat/.test(j.r2.day) && j.r2.time === '01:00', 'the 01:00 game: Saturday on the site, as the BBC calendar files it');
  }
}

// Monthly Cup night (web.293)
{
  const now = Date.parse('2026-09-26T21:30:00+02:00');
  const cup = { src: 'mc', kind: 'cup', id: 'mc:2026-9', month: 9, at: Date.parse('2026-09-26T20:00:00+02:00'), until: Date.parse('2026-09-27T02:00:00+02:00'),
    finals: [{ tier: 'gold', players: ['a'] }], results: [{ table: 2, top: ['x', 'y', 'z'] }], podium: ['P1', 'P2', 'P3'] };
  ok(E.evStillOn(cup, now) && !E.evStillOn(Object.assign({}, cup, { until: undefined }), now), 'a cup the forum follows stays on through its night');
  ok(E.evExpandable(cup) && !E.evExpandable({ src: 'mc', id: 'mc:x', signups: 3 }), 'it unfolds once the forum has told something');
  ok(E.evCupTop(cup, { table: 2 }).join() === 'x,y,z' && E.evCupTop(cup, { tier: 'gold' }).join() === 'P1,P2,P3' && E.evCupTop(cup, { table: 3 }) === null, 'top 3 per table; the gold table falls back on the cup podium');
  ok(E.evRegisterAction(Object.assign({}, cup, { closeAt: Date.now() - 1000 })).none === true, 'registration closed: the button says so');
}

// WEC finals (web.292)
{
  const fin = { src: 'wec', kind: 'final', id: 'wecfinal:1', month: 9, year: 2026, at: Date.parse('2026-10-04T20:00:00Z'),
    setup: { stack: 10000, blind: 50, delay: 7, timeout: 15, raiseEvery: 25 }, qualified: [{ nick: 'Blupher', place: 1, won: 7, games: 22 }] };
  ok(E.evUpcomingTitle(fin, 'en', 'Step', { final: 'Monthly final \u00b7 {month}' }) === 'Monthly final \u00b7 September 2026', 'a monthly final is titled by its month');
  ok(E.evUpcomingTitle(Object.assign({}, fin, { grand: true }), 'fr', 'Step', { grand: 'Grande finale {year}' }) === 'Grande finale 2026', 'a grand final by its year');
  ok(E.evExpandable(fin) && !E.evExpandable({ src: 'wec', kind: 'final', id: 'x' }), 'a final with players or a set-up unfolds');
  ok(E.evRegisterAction(fin).none === true && E.evRegisterAction(fin).key === 'evWecFinalNoReg', 'a final takes no sign-up: the button says how players qualify');
  const daily = E.evWecDaily('2026-10-04', '2026-10-05');
  const kept = E.evDropDailyUnderFinal(daily.concat([fin]));
  ok(kept.length === daily.length && !kept.some((e) => e.kind === 'daily' && e.at === fin.at), 'the daily game of the final\u2019s evening gives way to the final');
  const st = E.evFinalSetup(fin, { stack: 'S', blind: 'B', timeout: 'T', delay: 'D', double: 'x{n}' }, 'en');
  ok(st.length === 5 && st[0][1] === '10,000' && st[2][1] === '15 s' && st[4][0] === 'x25', 'the set-up line, in the order of the create form');
}

console.log(fails ? '\n' + fails + ' FAILED' : '\nAll forum-events checks passed');
process.exit(fails ? 1 : 0);
