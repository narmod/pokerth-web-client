#!/usr/bin/env node
// About › « Poker guides » tab (web.243). The SEO audit of 2026-10-21
// found that, of the 14 content pages, only /rules and /faq were linked
// visibly from the home page; the rest only from the off-screen crawler
// block. The guide pages are now listed in the About window, written into the
// served HTML (read by search engines and by AI crawlers that run no
// JavaScript), in the page's language, and relabelled client-side
// (modules/seo/about-guides.mjs, /seo-guides.json) when the player's
// interface language differs.
// Run: node scripts/test-seo-about-guides.mjs   (~5 s)
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); };
const PAGES = ['/rules', '/hand-rankings', '/starting-hands', '/poker-odds', '/how-to-play', '/glossary', '/competitions',
  '/play-with-friends', '/play-against-computer', '/host-a-server', '/accessibility', '/faq'];

// Catalogs: the heading in every interface language.
const langDir = join(pub, 'modules', 'lang');
const miss = readdirSync(langDir).filter((f) => f.endsWith('.mjs')).filter((f) => !/\babGuides\s*:\s*(?:'[^']+'|"[^"]+")/.test(readFileSync(join(langDir, f), 'utf8')));
ok(!miss.length, 'abGuides in every interface catalog' + (miss.length ? ' — missing: ' + miss.join(' ') : ''));
const html = readFileSync(join(pub, 'pokerth-client.html'), 'utf8');
ok(/<button class="ab-tab" id="ab-tab-6" type="button" role="tab" onclick="window\.abShowTab\(6\)"><span class="ab-tab-lbl" data-i18n="abGuides">/.test(html), 'About has a « Poker guides » tab');
ok(/<div class="ab-pane" id="ab-pane-6" style="display:none"><!--__ABOUT_GUIDES__--><\/div>/.test(html), 'its pane holds the placeholder');
const js = readFileSync(join(pub, 'pokerth.js'), 'utf8');
ok(/for \(var k = 0; k < 7; k\+\+\)/.test(js) && /if \(i === 6\) import\('\/modules\/seo\/about-guides\.mjs'\)\.then\(function \(m\) \{ m\.refreshAboutGuides\(window\._lang\); \}\)/.test(js), 'abShowTab knows tab 6 and relabels the list in the interface language');
ok(existsSync(join(pub, 'modules', 'seo', 'about-guides.mjs')), 'modules/seo/about-guides.mjs exists');

async function run(cfg, fn) {
  const tmp = mkdtempSync(join(tmpdir(), 'pth-abg-'));
  writeFileSync(join(tmp, 'admin-config.json'), JSON.stringify(cfg));
  const PORT = 18000 + Math.floor(Math.random() * 900);
  const child = spawn(process.execPath, [join(root, 'proxy.js'), '--notls', String(PORT)], {
    env: Object.assign({}, process.env, { ADMIN_CONFIG_FILE: join(tmp, 'admin-config.json'), VISITS_FILE: join(tmp, 'visits.json'), NO_PROXY: '*' }), stdio: 'ignore' });
  const get = (p) => new Promise((res, rej) => http.get({ host: '127.0.0.1', port: PORT, path: p }, (r) => { let b = ''; r.setEncoding('utf8'); r.on('data', (c) => b += c); r.on('end', () => res({ s: r.statusCode, b })); }).on('error', rej));
  try {
    for (let i = 0; i < 60; i++) { try { await get('/robots.txt'); break; } catch (e) { await new Promise((r) => setTimeout(r, 250)); } }
    await fn(get);
  } finally { child.kill(); rmSync(tmp, { recursive: true, force: true }); }
}
const list = (h) => { const m = h.match(/<div class="ab-guides" id="ab-guides" data-lang="([^"]+)"><ul>([\s\S]*?)<\/ul><\/div>/); const t = h.match(/data-i18n="abGuides">([^<]*)</); return m && { lang: m[1], head: t && t[1], links: [...m[2].matchAll(/<li><a href="([^"]+)" target="_blank" rel="noopener">([^<]+)<\/a><\/li>/g)].map((x) => [x[1], x[2]]) }; };

await run({ seo: { enabled: true, publicUrl: 'https://example.org' } }, async (get) => {
  const en = list((await get('/')).b);
  ok(en && en.lang === 'en' && JSON.stringify(en.links.map((l) => l[0])) === JSON.stringify(PAGES), `/ lists the ${PAGES.length} guide pages, English URLs`);
  ok(en && /<div class="ab-pane" id="ab-pane-6" style="display:none"><div class="ab-guides" id="ab-guides"/.test((await get('/')).b), 'inside the Guides tab in the served page');
  // The interface catalogs behind serve-time localization load in the
  // background on first use: wait until the French page comes out localized.
  for (let i = 0; i < 40 && !/data-i18n="abGuides">Guides de poker</.test((await get('/?lang=fr')).b); i++) await new Promise((r) => setTimeout(r, 250));
  const fr = list((await get('/?lang=fr')).b);
  ok(fr && fr.lang === 'fr' && fr.links.every((l) => /\?lang=fr$/.test(l[0])) && fr.links[0][1] === 'Règles du Texas Hold’em', '/?lang=fr: French labels, French URLs');
  ok(fr && fr.head && fr.head !== 'Poker guides', `/?lang=fr: tab label served translated (« ${fr && fr.head} »)`);
  let bad = [];
  for (const [href] of fr.links.concat(en.links)) { const r = await get(href); if (r.s !== 200) bad.push(href + ' ' + r.s); }
  ok(!bad.length, 'every link answers 200' + (bad.length ? ' — ' + bad.join(' ') : ''));
  const j = JSON.parse((await get('/seo-guides.json?lang=de')).b);
  ok(j.lang === 'de' && j.links.length === PAGES.length && j.links.every((l) => /\?lang=de$/.test(l[0])), '/seo-guides.json?lang=de: German list');
  const jx = JSON.parse((await get('/seo-guides.json?lang=xx')).b);
  ok(jx.lang === 'en' && jx.links.length === PAGES.length, '/seo-guides.json, unknown language: English');
  const pt = JSON.parse((await get('/seo-guides.json?lang=pt-br')).b);
  ok(pt.lang === 'pt-BR' && /\?lang=pt-BR$/.test(pt.links[0][0]), 'catalog code pt-br resolves to pt-BR');
});
await run({}, async (get) => {
  const off = list((await get('/')).b);
  ok(off && off.links.length === PAGES.length, 'SEO off (self-hosted): the list is there too');
});
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
