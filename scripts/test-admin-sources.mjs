#!/usr/bin/env node
// Deterministic guards for « Where visitors come from » (Statistics › Visitors).
// Run: node scripts/test-admin-sources.mjs
//
// The proxy hands the period figures per source (server/ref-stats.js
// period(): all / nw / lang). The page reads them three ways — Channels,
// New visitors, Languages — and folds the sources into channels
// on its own. Boots admin.html in jsdom with a real day's figures and checks
// each view, the channel rules that matter (ChatGPT's own utm tag is an AI
// assistant, not a campaign; cn.bing.com is a search engine) and the facts
// line, which must only say what the numbers carry.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'public', 'admin.html'), 'utf8');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// A real 24-hour sample (2026-10-19), as period() returns it.
const SRC = {
  days: 1,
  all: { '(direct)': 295, 'utm:chatgpt.com': 203, 'pokerth.net': 161, 'cn.bing.com': 93, '(invite)': 71, '(lang link)': 50,
         'bing.com': 33, 'google.com': 15, 'site:/': 13, 'duckduckgo.com': 4, 'site:/how-to-play': 3 },
  nw: { '(direct)': 81, 'utm:chatgpt.com': 107, 'pokerth.net': 44, 'cn.bing.com': 61, '(invite)': 25, '(lang link)': 8,
        'bing.com': 26, 'google.com': 7, 'site:/': 1, 'duckduckgo.com': 4, 'site:/how-to-play': 3 },
  lang: {
    '(direct)': { zh: 36, en: 33, other: 7, de: 5 },
    'utm:chatgpt.com': { en: 41, es: 10, fr: 9, zh: 8 },
    'pokerth.net': { en: 15, zh: 8, de: 7 },
    'cn.bing.com': { zh: 61 },
    '(invite)': { zh: 11, other: 9, en: 4 },
    '(lang link)': { zh: 3, fr: 3, hu: 1 },
    'bing.com': { zh: 13, en: 4, es: 2 },
    'google.com': { es: 2, en: 1, pt: 1 },
    'site:/': { zh: 1 },
    'duckduckgo.com': { es: 4 },
    'site:/how-to-play': { pt: 1, de: 1, es: 1 },
  },
};

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push(e.message));
vc.on('error', (m) => errors.push(String(m)));

const VISITS = { ok: true, series: [], env: {}, music: {}, musicTitles: {}, pings: {}, srcPeriod: SRC, refSince: 1700000000000 };
function canned(url) {
  const path = String(url).split('?')[0];
  if (path === '/admin/whoami') return { ok: true, master: true, scopes: [] };
  if (path === '/admin/status') return { ok: true, version: '2.1.10-web.148', node: 'v22', uptimeSec: 60, sockets: 0, players: 0, resetPeriod: 'off', proxy: {} };
  if (path === '/admin/visits') return VISITS;
  return { ok: true };
}

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  url: 'https://example.org/admin',
  virtualConsole: vc,
  pretendToBeVisual: true,
  beforeParse(w) {
    w.fetch = (url) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(canned(url)), text: () => Promise.resolve('') });
    w.confirm = () => true;
    w.localStorage.setItem('pth_admin_tok', 'test-token');
    w.scrollTo = () => {};
    w.HTMLElement.prototype.scrollIntoView = () => {};
  },
});
const { window } = dom;
const doc = window.document;
const $ = (id) => doc.getElementById(id);
const settle = (ms) => new Promise((r) => setTimeout(r, ms || 60));

await settle(400);
const tab = doc.querySelector('.tab[data-t="traffic"]');
if (tab) tab.click();
const sub = doc.querySelector('[data-ts="visitors"]');
if (sub && sub.tagName === 'BUTTON') sub.click();
await settle(400);

const box = $('trafSrc'), seg = $('srcSeg');
ok(!!box && !!seg, 'the sources card has its three-view switch');
ok(seg && [...seg.querySelectorAll('button')].map((x) => x.textContent).join(' · ') === 'Channels · New visitors · Languages', 'Channels · New visitors · Languages');
const segBtn = (k) => seg.querySelector('button[data-k="' + k + '"]');

// ── Channels (default) ──────────────────────────────────────────────────
ok(segBtn('ch').classList.contains('on') && segBtn('ch').getAttribute('aria-pressed') === 'true', 'Channels is the default view');
const kpi = [...box.querySelectorAll('.srckpi b')].map((b) => b.textContent);
ok(kpi[0] === '941' && kpi[1] === '367' && kpi[2] === '39%', 'visits, new and new rate add up the sources (941 · 367 · 39%), got ' + kpi.join(' / '));
const rows = [...box.querySelectorAll('.srcrow')];
const names = rows.map((r) => r.querySelector('.nm b').textContent);
ok(names.join('|') === 'Direct|AI assistants|PokerTH.net|Search engines|Table invite links|?lang= links|Our pages',
  'seven channels, by visits: ' + names.join(', '));
const ai = rows[1];
ok(/chatgpt\.com/.test(ai.textContent) && !/Campaign/.test(box.textContent), 'utm_source=chatgpt.com is an AI assistant, not a campaign');
ok(!!ai.querySelector('.srcbadge'), 'the channel bringing the most new visitors carries the badge');
const search = rows[3].querySelector('button.srchead');
ok(!!search && search.getAttribute('aria-expanded') === 'false' && /4 sources/.test(search.textContent), 'Search engines folds 4 sources and is closed at first');
ok(/^145/.test(rows[3].querySelector('.n').textContent), 'cn.bing + bing + google + duckduckgo = 145 visits');
ok(!rows[0].querySelector('button.srchead'), 'a channel with one source does not pretend to unfold');
ok(rows[6].querySelector('.nm small').textContent === '/ · /how-to-play', 'a channel with two or three short sources names them');
ok(/Chinese 36/.test(rows[0].textContent), 'languages read as names, not codes');
ok(!rows[2].querySelector('.nm small') && !rows[4].querySelector('.nm small'), 'no sub-line that only repeats the channel (pokerth.net, an invite link)');
search.click();
await settle();
const opened = box.querySelector('button.srchead[data-ch="search"]');
ok(opened && opened.getAttribute('aria-expanded') === 'true', 'clicking a channel unfolds it');
ok(doc.activeElement === opened, 'and keeps the focus on it after the redraw');
const kids = [...box.querySelectorAll('.srckid')].map((k) => k.firstElementChild.firstElementChild.textContent);
ok(kids.join('|') === 'cn.bing.com|bing.com|google.com|duckduckgo.com', 'its sources, by visits: ' + kids.join(', '));
opened.click();
await settle();
ok(box.querySelectorAll('.srckid').length === 0, 'a second click folds it again');

// ── New vs returning ────────────────────────────────────────────────────
segBtn('nw').click();
await settle();
ok(segBtn('nw').classList.contains('on') && !segBtn('ch').classList.contains('on'), 'the switch follows the view');
ok(window.localStorage.getItem('pth_admin_srcview') === 'nw', 'the chosen view is remembered in this browser');
ok(box.querySelector('.srchl b').textContent === '367', 'headline: the new visitors of the period');
const nwNames = [...box.querySelectorAll('.srcrow .nm b')].map((b) => b.textContent);
ok(nwNames[0] === 'AI assistants' && nwNames[1] === 'Search engines' && nwNames[2] === 'Direct', 'channels ranked by new visitors: ' + nwNames.slice(0, 3).join(', '));
const leg = [...box.querySelectorAll('.srclegend > span')].map((s) => s.querySelector('em').textContent + ' ' + s.querySelector('b').textContent);
ok(leg[0] === 'AI assistants 29%' && leg[1] === 'Search engines 27%', 'the legend gives each channel its share of the new ones: ' + leg.slice(0, 2).join(', '));
const firstMeta = box.querySelector('.srcrow .srcmeta').textContent;
ok(/107 new/.test(firstMeta) && /96 returning/.test(firstMeta) && /203 visits/.test(firstMeta), 'new / returning / visits for each channel');
ok(box.querySelector('.srcrow .rate.hi') && /53% new/.test(box.querySelector('.srcrow .rate').textContent), 'a channel past 50% new stands out');

// ── Source × language ───────────────────────────────────────────────────
segBtn('lg').click();
await settle();
const mx = box.querySelector('.srcmx');
ok(!!mx, 'the source × language table is drawn');
const heads = [...mx.querySelectorAll('.hd')].map((h) => h.textContent);
ok(heads.join(' ') === 'Source ZH EN ES DE FR + New', 'the five largest languages, then the rest: ' + heads.join(' '));
const mrows = [...mx.querySelectorAll('[role="row"]')].slice(1);
ok(mrows.length === 10, 'ten sources at first, got ' + mrows.length);
ok(mrows[0].querySelector('.rh em').textContent === 'chatgpt.com', 'sources ranked by new visitors');
const bing = mrows.find((r) => r.querySelector('.rh em').textContent === 'cn.bing.com');
const bingCells = bing ? [...bing.querySelectorAll('.c')].map((c) => c.textContent) : [];
ok(bingCells[0] === '61' && bingCells.slice(1).every((c) => c === '·'), 'cn.bing.com: 61 under ZH, nothing elsewhere');
ok(/fewer/.test(box.textContent) && /ZH Chinese/.test(box.textContent), 'the key names the languages and the shading');
const more = $('srcMoreBtn');
ok(more && /Show all 11 sources/.test(more.textContent), 'the eleventh source is one click away');
more.click();
await settle();
ok([...box.querySelectorAll('.srcmx [role="row"]')].length === 12, 'and shows up after it');
const facts = [...box.querySelectorAll('.srcfacts p')].map((p) => p.textContent);
ok(facts.length === 3, 'three facts, got ' + facts.length);
ok(facts[0] === 'cn.bing.com: all 61 new visitors browse in Chinese.', 'a one-language source: ' + facts[0]);
ok(facts[1] === 'chatgpt.com brings the most new visitors browsing in English (41).', 'the main source of a large language: ' + facts[1]);
ok(facts[2] === 'Invite links: 9 of 25 new visitors send no language header.', 'a source whose new visitors send no header: ' + facts[2]);

// ── Back to Channels; empty period ──────────────────────────────────────
segBtn('ch').click();
await settle();
ok(box.querySelectorAll('.srcrow').length === 7, 'back to Channels');
ok(errors.length === 0, 'nothing threw' + (errors.length ? ': ' + errors[0].split('\n')[0] : ''));

console.log((fail ? 'FAIL ' : 'OK ') + (n - fail) + '/' + n);
process.exit(fail ? 1 : 0);
