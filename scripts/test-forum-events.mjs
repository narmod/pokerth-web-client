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
ok(E.evWhen(NaN, NOW, 'en') === '' && E.evWhen(null, NOW, 'en') === '', 'no date, no text');
ok(E.evWhen(NOW, NOW, 'xx-invalid-locale-') !== undefined, 'a bad locale never throws');

// -- labels -------------------------------------------------------------------
ok(E.evUpcomingTitle({ src: 'bbc', step: 2, title: null }, 'en', 'Step') === 'Step 2', 'BBC rows are titled by their step');
ok(E.evUpcomingTitle({ src: 'bbc', step: 1, title: 'Special' }, 'en', 'Etape') === 'Etape 1 \u00b7 Special', 'with the translated word and the optional title');
ok(E.evUpcomingTitle({ src: 'mc', month: 9 }, 'en') === 'September' && E.evUpcomingTitle({ src: 'mc', month: 9 }, 'fr') === 'septembre', 'the Monthly Cup is titled by its month, in the locale');
ok(E.evMonthName(13, 'en') === '' && E.evMonthName(0, 'en') === '', 'a month out of range gives nothing');
ok(E.evResultMeta({ src: 'bbc', id: 9743, podium: ['spoof', 'ElmoEGO', 'il Buono'], at: Date.parse('2026-09-20T21:15:00+02:00') }, NOW, 'en').startsWith('#9743 \u00b7 2. ElmoEGO \u00b7 3. il Buono \u00b7 today'), 'result meta: id, runners-up, when');
ok(E.evResultMeta({ src: 'mc', month: 8, year: 2026, at: null, podium: ['Doc Ijiwaru', 'fojo', 'Borussen-Ass'] }, NOW, 'en') === 'August 2026 \u00b7 2. fojo \u00b7 3. Borussen-Ass', 'Monthly Cup meta: month and year, no time');
ok(E.evSrcName('mc') === 'Monthly Cup' && E.evSrcClass('bbc') === 'fn-c0' && E.evSrcClass('wec') === 'fn-c1' && E.evSrcClass('zz') === 'fn-c7', 'site names and the forum colour code are reused');

// -- leaders ------------------------------------------------------------------
ok(E.evLeaderMeta({ src: 'wec', period: { year: 2026, month: 9 }, points: 650, games: 16, next: ['boehmi', 'Yes', 'MagE'] }, 'en') === 'September 2026 \u00b7 650 Points \u00b7 16 Games \u00b7 2. boehmi \u00b7 3. Yes', 'WEC leader meta: month, points, games, two runners-up');
ok(E.evLeaderMeta({ src: 'bbc', period: { season: 12 }, points: 900, games: 22, next: [] }, 'fr', { season: 'Saison', points: 'Points', games: 'Parties' }) === 'Saison 12 \u00b7 900 Points \u00b7 22 Parties', 'BBC leader meta: season, with the translated words');
ok(E.evLeaderMeta({ src: 'wec', period: {}, points: null, games: null }, 'en') === '', 'nothing known, nothing shown');

// -- links --------------------------------------------------------------------
ok(E.evSafeUrl('https://wec.pokerth.net/results/ranking') !== '' && E.evSafeUrl('https://bbc.pokerth.net/registration') !== '' && E.evSafeUrl('https://monthlycup.pokerth.net/results/series?year=2026') !== '', 'community site links pass');
ok(E.evSafeUrl('https://evil.example/') === '' && E.evSafeUrl('javascript:alert(1)') === '' && E.evSafeUrl('https://bbc.pokerth.net.evil.example/') === '', 'anything else is dropped');

// -- wiring -------------------------------------------------------------------
const html = rd('public/pokerth-client.html'), css = rd('public/pokerth.css'), sw = rd('public/sw.js'), fn = rd('public/modules/ui/forumnews.mjs');
ok(/id="fn-tabs"/.test(html) && /forumSelectTab\('events'\)/.test(html) && /id="fn-events"/.test(html), 'the window has the tab bar and the events box');
ok(/window\.forumSelectTab = forumSelectTab/.test(fn), 'forumnews.mjs exposes the tab switch');
ok(/adv-no-communitycontent #forum-modal #fn-tabs/.test(css), 'the community-content option hides the tab bar');
ok(sw.includes("'/modules/ui/forum-events.mjs'"), 'the module is precached by the service worker');

// -- i18n: every catalogue carries the eight keys -------------------------------
const KEYS = ['forumTabPosts', 'forumTabEvents', 'evUpcoming', 'evResults', 'evSignups', 'evError', 'evNone', 'evOpenSite'];
const dir = path.join(root, 'public', 'modules', 'lang');
let bad = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.mjs'))) {
  const m = await import(path.join(dir, f));
  for (const k of KEYS) if (typeof m.strings[k] !== 'string' || !m.strings[k]) bad.push(f + ':' + k);
  if (!/\{n\}/.test(m.strings.evSignups || '')) bad.push(f + ':evSignups{n}');
}
ok(bad.length === 0, 'all catalogues have the keys, evSignups keeps its {n}' + (bad.length ? ' — ' + bad.slice(0, 5).join(', ') : ''));

console.log(fails ? '\n' + fails + ' FAILED' : '\nAll forum-events checks passed');
process.exit(fails ? 1 : 0);
