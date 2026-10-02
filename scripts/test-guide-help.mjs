#!/usr/bin/env node
// Ace's Help — « More help » (H1): the help window's knowledge in the Ace's
// bubble. modules/guide/knowledge.mjs on the 83 help corpora (every section
// reachable, cut into short pages, nothing lost), the search, the chapter
// of each screen, and the wiring (Help entries of the menus → the Ace, the
// window as fallback, his menu, statistics, texts, precache).
// Run: node scripts/test-guide-help.mjs
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const root = path.resolve('.');
const K = await import(pathToFileURL(path.join(root, 'public/modules/guide/knowledge.mjs')).href);
let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}

// ── pure helpers ──
ok(K.chapterFor('game') === 'game' && K.chapterFor('lobby') === 'lobby' && K.chapterFor('wait') === 'lobby' && K.chapterFor('create') === 'lobby' && K.chapterFor('connect') === 'start' && K.chapterFor('other') === 'start', 'the chapter of each screen (as the help window)');
ok(K.fold('Éléphant ÇA') === 'elephant ca', 'search ignores case and accents');
const cut = K.splitText('One two three. Visit pokerth.net now! It costs 2.5 chips. Done.', 20);
ok(cut.join(' ') === 'One two three. Visit pokerth.net now! It costs 2.5 chips. Done.' && cut.length === 4 && cut[1] === 'Visit pokerth.net now!', 'long text cut at sentence ends, never inside « pokerth.net » or « 2.5 »');
ok(K.splitText('短い文。二つ目の文。三つ目。', 6).length === 3, 'CJK sentence ends');
const sec = { t: 'T', b: ['a', 'b'], list: ['1', '2', '3', '4', '5', '6', '7'], keys: [['k1', 'v'], ['k2', 'v'], ['k3', 'v'], ['k4', 'v'], ['k5', 'v'], ['k6', 'v'], ['k7', 'v']], note: ['n'] };
const pg = K.pages(sec);
ok(pg.map((p) => p.kind + p.items.length).join(',') === 'p1,p1,list5,list2,keys6,keys1,note1', 'pages: paragraphs, list by 5, keys by 6, notes last');

// ── the 83 corpora: every section reachable, nothing lost ──
const DIR = path.join(root, 'public/modules/help/content');
const langs = fs.readdirSync(DIR).filter((f) => f.endsWith('.mjs')).map((f) => f.replace('.mjs', ''));
ok(langs.length === 83, '83 help corpora');
const en = (await import(pathToFileURL(path.join(DIR, 'en.mjs')).href)).help;
const enIds = en.chapters.map((c) => c.id + ':' + c.sections.map((s) => s.id).join(',')).join('|');
let lost = [], tooLong = [], shape = [], found = [];
for (const lg of langs) {
  const h = (await import(pathToFileURL(path.join(DIR, lg + '.mjs')).href)).help;
  if (h.chapters.map((c) => c.id + ':' + c.sections.map((s) => s.id).join(',')).join('|') !== enIds) shape.push(lg);
  for (const ch of h.chapters) {
    for (const s of ch.sections) {
      const p = K.pages(s);
      const text = p.filter((x) => x.kind === 'p').map((x) => x.items[0]).join(' ');
      const want = (s.b || []).join(' ').replace(/\s+/g, '');
      if (text.replace(/\s+/g, '') !== want) lost.push(lg + ':' + s.id);
      const flat = p.flatMap((x) => (x.kind === 'keys' ? x.items.map((r) => r.join(' ')) : x.items));
      if (flat.join('').replace(/\s+/g, '').length < (s.b || []).concat(s.list || []).join('').replace(/\s+/g, '').length) lost.push(lg + ':' + s.id + '*');
      for (const x of p) if (x.kind === 'p' && x.items[0].length > 700) tooLong.push(lg + ':' + s.id);
      if (!K.findSection(h, ch.id, s.id)) lost.push(lg + ':' + s.id + '?');
    }
  }
  if (K.search(h, h.chapters[1].sections[0].t).length) found.push(lg);
}
ok(!shape.length, 'the same chapters and sections in every language' + (shape.length ? ' — ' + shape.slice(0, 6).join(', ') : ''));
ok(!lost.length, 'every section of every language reachable, no word lost in the pages' + (lost.length ? ' — ' + lost.slice(0, 6).join(', ') : ''));
ok(!tooLong.length, 'no page longer than a bubble can hold' + (tooLong.length ? ' — ' + tooLong.slice(0, 6).join(', ') : ''));
ok(found.length === 83, 'a section title finds its section in every language');
ok(K.search(en, 'side pot').length >= 1 && K.search(en, 'x').length === 0, 'search: 2 characters at least');
const fr = await K.loadHelp('fr'), xx = await K.loadHelp('xx-yy'), ptbr = await K.loadHelp('pt-br');
ok(fr.chapters[0].title !== en.chapters[0].title && xx.chapters[0].title === en.chapters[0].title && ptbr.chapters.length === en.chapters.length, 'loads the language, falls back to English');

// ── wiring ──
const idx = fs.readFileSync(path.join(root, 'public/modules/guide/index.mjs'), 'utf8');
// H4: the help window is gone — the Help entries are the Ace's
ok(!fs.existsSync(path.join(root, 'public/modules/help/index.mjs')) && fs.existsSync(path.join(root, 'public/modules/help/content/en.mjs')), 'help window module removed, its texts kept (the Ace reads them)');
const page = fs.readFileSync(path.join(root, 'public/pokerth-client.html'), 'utf8');
ok(!/id="help-modal"/.test(page) && !/modules\/help\/index\.mjs/.test(page), 'no help window in the page');
// web.275: the header menus keep only « Ace's Help » (the Help entries and their option are gone)
ok(!/help-menu-btn|adv-helpbtn/.test(page) && (page.match(/class="btn-sm guide-menu-btn guide-only"[^>]*guideToggle/g) || []).length === 5, 'header menus: « Ace\'s Help » only, in the 5 menus (privacy included)');
ok(/function toggle\(\) \{\s*if \(!available\(\)\) return;\s*if \(!canComeHere\(\)\) \{ if \(!state\.isOn\(\)\) turnOn\(\); return; \}\s*showMenu\(\);/.test(idx) && /note\(on \? 'menuOn' : 'menuOff', list/.test(idx) && /else list\.push\(btn\('turnOn'\)\)/.test(idx), '« Ace\'s Help » opens his menu, tips on or off (« Turn on tips » when off)');
ok(/window\.toggleHelp = toggleHelpEntry;/.test(idx), 'the Help entries open « More help »');
ok(!/help-modal|openHelp|closeHelp/.test(fs.readFileSync(path.join(root, 'public/modules/ui/keynav.mjs'), 'utf8') + fs.readFileSync(path.join(root, 'public/modules/ui/z-order.mjs'), 'utf8') + fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8').replace(/help\/content/g, '')), 'no leftover of the window (Escape, z-order, precache)');
ok(/function helpEntry\(o\) \{\s*if \(!canComeHere\(\)\) return false;/.test(idx) && /function canComeHere\(\) \{\s*if \(!avail\) return false;/.test(idx), 'the Ace answers on every screen, the table and the live embed included');
ok(/btn\('moreHelp'\), btn\('askMenu'\)/.test(idx), '« More help » first in the Ace\'s menu');
ok(/showing\.kind === 'offer' \|\| onDemand\(\)/.test(idx) && /const ON_DEMAND = \['help', 'ask', 'menu', 'note'\];/.test(idx) && /if \(!state\.isOn\(\) \|\| where\(\)\.screen === 'game'\) leave\(\);\s+\/\/ on demand \(tips off, the table\): he goes/.test(idx), 'tips off: he comes on demand and leaves when the bubble closes');
ok(!/helpWindow|window\.openHelp/.test(idx), 'no « Help window » button any more');
const en2 = (await import(pathToFileURL(path.join(root, 'public/modules/guide/lang/en.mjs')).href)).default;
ok(['moreHelp', 'allTopics', 'back'].every((k) => typeof en2[k] === 'string' && en2[k]) && !('helpWindow' in en2) && !('c5Help' in en2) && !('hsHelpWin' in en2), 'texts: moreHelp, allTopics, back (the window\'s texts removed)');
ok(fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8').includes("'/modules/guide/knowledge.mjs'"), 'knowledge.mjs precached (the help works offline)');
ok(/'more-help': \['shown', 'section', 'search', 'window'\]/.test(fs.readFileSync(path.join(root, 'server/guide-stats.js'), 'utf8')), 'statistics: opened, sections read, searches, help window');

// ── audit web.276 ──
const hs = fs.readFileSync(path.join(root, 'public/modules/guide/hotspots.mjs'), 'utf8');
ok(hs.indexOf("['#cf-preset-perso'") < hs.indexOf("['.cf-preset[data-preset]'") && hs.indexOf("['#cf-prefs-save-btn'") < hs.indexOf("['.btn-cf-reset'"), '« ? »: My prefs and Save are explained as themselves, not as a preset / reset (first match wins)');
ok(/let asking = false;/.test(idx) && /async function showContext\(ctx\) \{\s*exitAsk\(true\);/.test(idx) && /function flash\(key, ms\) \{[^}]*\n\s*if \(showing && showing\.kind !== 'ctx'\) return;/.test(idx) && /asking\) return;/.test(idx), '« ? » mode ends when another bubble takes its place; « Just one more! » never over what the player asked for');
ok(/if \(on\) b\.classList\.remove\('guide-ask'\);/.test(idx), '« ? » mode reads the page\'s own hand cursor (not the « help » cursor it sets)');
ok(/if \(!m\.isDocked\(\)\) return null;/.test(idx), 'a dock cancelled by leave() stops its caller');
ok(!('hsHelp' in en2) && !('nothingHere' in en2) && /tap for my menu/.test(en2.aceLabel) && !/help, Ace/.test(en2.hsMenu), 'texts: no Help entry in the menu text, the Ace\'s label says a tap opens his menu');
const dockSrc = fs.readFileSync(path.join(root, 'public/modules/mascot/guide.mjs'), 'utf8');
ok(/b\.left < 0 \|\| b\.right > vw/.test(dockSrc) && /settle\(big\)/.test(dockSrc) && /a\.onfinish = /.test(dockSrc) && /ev\.key === 'Escape' && bubbleOpen\(\)/.test(dockSrc), 'dock: bubble never cut at an edge, re-docked after a rotation, finished animations released, Escape on the Ace');
ok(/if \(c\.home && c\.arrived\) \{ teardown\(\); return; \}/.test(fs.readFileSync(path.join(root, 'public/modules/mascot/engine.mjs'), 'utf8')), 'scenes: a tap at the very end of a door / puff exit does not bring a second Ace');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
