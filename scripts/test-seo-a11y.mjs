#!/usr/bin/env node
// Deterministic guards for /accessibility and its translation table,
// seo-i18n/a11y.js. Run: node scripts/test-seo-a11y.mjs
//
// 1. facts: every feature the page names exists in the client — the three
//    interface sizes and high contrast (ui/accessibility.mjs), synced with the
//    account (pokerth.js _CFG_WEB_SYNC_KEYS), the Accessibility button on
//    every screen, four-colour decks (public/cards/*-4c), the table magnifier,
//    browser pinch-zoom option, F-keys and re-bindable letters, gamepad and
//    TV remote, voice (speechSynthesis) and vibration, reduced motion,
//    anti-peek and the accidental-call guard; and the page does NOT claim
//    screen-reader play;
// 2. English: snippet-sized head, 5 visual items, 5 questions, no HTML;
// 3. translations: every field, the same {placeholders}, no HTML;
// 4. wiring: route, nav (gated), crawler block, sitemap, IndexNow, llms.txt,
//    admin coverage.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const read = (p) => readFileSync(join(root, p), 'utf8');
const src = read('proxy.js');
const T = require(join(root, 'seo-i18n', 'a11y.js'));
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function lift(name) {
  const i = src.indexOf('var ' + name + ' = ');
  if (i < 0) throw new Error('no ' + name);
  let j = i + ('var ' + name + ' = ').length, d = 0, k = j;
  for (; k < src.length; k++) {
    const ch = src[k];
    if (ch === "'" || ch === '"') { const q = ch; k++; while (src[k] !== q) { if (src[k] === '\\') k++; k++; } continue; }
    if (ch === '{' || ch === '[') d++;
    else if (ch === '}' || ch === ']') { d--; if (!d) break; }
  }
  return new Function('return ' + src.slice(j, k + 1))();
}

// 1. Facts
const acc = read('public/modules/ui/accessibility.mjs'), app = read('public/pokerth.js'), html = read('public/pokerth-client.html');
const help = read('public/modules/help/content/en.mjs'), media = read('public/modules/ui/media.mjs'), css = read('public/pokerth.css');
ok(/const SIZES = \['standard', 'large', 'extra-large'\];/.test(acc) && /CONTRAST_KEY = 'pth_high_contrast'/.test(acc), 'three interface sizes and high contrast');
ok(/'pth_interface_size', 'pth_high_contrast'/.test(app), 'both follow the account (settings sync keys)');
const screens = ['connect', 'lobby', 'create', 'arcade', 'game'];
ok(screens.every((s) => html.includes('id="accessibility-open-' + s + '"')), 'the Accessibility button is on every screen (' + screens.join(', ') + ')');
ok(readdirSync(join(root, 'public/cards')).filter((d) => /-?4c($|-)/.test(d)).length >= 2, 'four-colour decks are bundled (public/cards/*4c*)');
ok(/Table zoom \(phones\)/.test(help) && /advBrowserZoom/.test(read('public/modules/lang/en.mjs')), 'table magnifier and the browser pinch-zoom option');
ok(/F1 \/ F2 \/ F3 \/ F4/.test(help) && /can be re-bound/.test(help) && /Alt\+S/.test(help), 'official F-keys, re-bindable letter keys, Alt+S');
ok(/Xbox, PlayStation, Switch Pro/.test(help) && /TV remote \(Android TV\)/.test(help) && /🔴 🟢 🟡 🔵/.test(help), 'gamepad and Android TV remote with colour keys');
ok(/speechSynthesis/.test(media) && /navigator\.vibrate/.test(media), 'voice announcements and vibration');
const announcer = read('public/modules/ui/announcer.mjs');
ok(/aria-live/.test(announcer) && html.includes('name="announce-mode" value="sr"'), 'announcements can go to a screen reader (live region, Accessibility window)');
ok((css.match(/prefers-reduced-motion: reduce/g) || []).length >= 3, 'reduced motion honoured');
ok(/own_click: 'AntiPeekMode', guard_call: 'AccidentallyCallBlocker'/.test(app), 'anti-peek and the accidental-call guard');
const EN = lift('_SEO_A11Y'), keys = Object.keys(EN);
const flat = (v) => Array.isArray(v) ? v.flat().join(' ') : String(v);
const all = keys.map((k) => flat(EN[k])).join(' ');
ok(/^Partly\./.test(EN.faq[3][1]) && /cannot yet be played with a screen reader alone/.test(EN.faq[3][1]) && !/screen.reader (support|compatible|friendly)/i.test(all), 'screen-reader play is not claimed');
ok(!/accessibilityHazard/.test(src.slice(src.indexOf('function seoA11yPage('), src.indexOf('function seoA11yPage(') + 3000)), 'JSON-LD claims no hazard-free guarantee');

// 2. English
ok([...EN.title].length <= 60, `English title fits a snippet (${[...EN.title].length})`);
ok([...EN.desc].length <= 160, `English description fits a snippet (${[...EN.desc].length})`);
const pairs = (v, len) => Array.isArray(v) && v.length === len && v.every((x) => Array.isArray(x) && x.length === 2 && x.every((y) => String(y || '').trim()));
ok(pairs(EN.see, 5) && pairs(EN.faq, 5) && !/[<>]/.test(all), 'English: 5 visual items, 5 questions, no HTML');
const ph = (s) => (String(s).match(/\{([a-z0-9_]+)\}/gi) || []).map((x) => x.slice(1, -1)).sort();
ok(keys.every((k) => ph(flat(EN[k])).every((p) => p === 'langs')), 'English: the only placeholder is {langs}');

// 3. Translations
const codes = Object.keys(T);
ok(!('en' in T), 'English is not in the table — it lives in proxy.js');
console.log(`  · ${codes.length} translation(s)`);
for (const code of codes) {
  const p = T[code];
  const miss = keys.filter((k) => Array.isArray(EN[k]) ? !pairs(p[k], EN[k].length) : (typeof p[k] !== 'string' || !p[k].trim()));
  ok(miss.length === 0, `${code}: complete${miss.length ? ' — missing ' + miss.join(', ') : ''}`);
  const off = keys.filter((k) => JSON.stringify(ph(flat(EN[k]))) !== JSON.stringify(ph(flat(p[k]))));
  ok(off.length === 0, `${code}: same {placeholders} as English${off.length ? ' — ' + off.join(', ') : ''}`);
  ok(!/[<>]/.test(keys.map((k) => flat(p[k])).join(' ')) && !/["<>]/.test(p.title + p.desc + p.ldHeadline + p.ldDesc), `${code}: no HTML, attribute-safe head`);
  ok(Object.keys(p).every((k) => keys.includes(k)), `${code}: no unknown field`);
}

// 4. Wiring
ok(/reqPathOnly === '\/accessibility'/.test(src) && /function seoA11yPage\(/.test(src), 'route and page builder');
ok(/_seoA11yIn\(lang\) \? '<a href="' \+ _seoLangHref\('\/accessibility', SEO_A11Y_I18N, lang\)/.test(src), 'nav link gated on the language');
ok(/_seoPageUrls\(_sBase, '\/accessibility'/.test(src) && /base \+ '\/accessibility'/.test(src) && /'\/accessibility\?lang=' \+ c/.test(src), 'sitemap and IndexNow, with its languages');
ok(/\/accessibility\\n/.test(src) && /\['\/accessibility', seoPageLangs\(SEO_A11Y_I18N\)\.length\]/.test(src), 'llms.txt and admin coverage');
ok(/SEO_A11Y_I18N = require\('\.\/seo-i18n\/a11y\.js'\)/.test(src), 'translation table loaded');

console.log(fail ? `\n${fail}/${n} failed` : `\n${n}/${n} passed`);
process.exit(fail ? 1 : 0);
