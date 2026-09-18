#!/usr/bin/env node
// On-demand language catalogues (modules/i18n.mjs + modules/lang-meta.mjs).
//
// i18n.mjs used to import all catalogues statically: a 56-request, ~5 MB graph
// in which one flaky request failed the whole module ("Failed to load script
// /modules/i18n.mjs" in the error journal). Only English is static now; this
// guards that, the generated registry, and the runtime behaviour.
// Needs jsdom (devDependency). Run: node scripts/test-lang-lazy.mjs
import fs from 'fs';
import { JSDOM } from 'jsdom';
import { generate, codeOf } from './gen-lang-meta.mjs';

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function until(fn, ms) { const t0 = Date.now(); while (!fn() && Date.now() - t0 < (ms || 3000)) await sleep(10); return !!fn(); }

// ── 1. Static shape ──
const src = fs.readFileSync('public/modules/i18n.mjs', 'utf8');
const statics = [...src.matchAll(/^import\s[^;]*?from\s+'([^']+)';/gm)].map(m => m[1]);
ok(statics.length === 2 && statics.includes('./lang/en.mjs') && statics.includes('./lang-meta.mjs'),
   'i18n.mjs statically imports only en.mjs and the registry (' + statics.join(', ') + ')');
ok(/import\(_langUrl\(/.test(src), 'other catalogues go through a dynamic import');

// ── 2. Registry in sync with the catalogues ──
const disk = fs.readFileSync('public/modules/lang-meta.mjs', 'utf8');
ok(disk === await generate(), 'lang-meta.mjs is up to date (else: node scripts/gen-lang-meta.mjs)');
const files = fs.readdirSync('public/modules/lang').filter(f => f.endsWith('.mjs'));
const { LANG_META, LANG_CODES } = await import('../public/modules/lang-meta.mjs');
ok(LANG_CODES.length === files.length && files.every(f => LANG_META[codeOf(f)]),
   'one registry entry per catalogue (' + LANG_CODES.length + ')');
ok(LANG_CODES.every(c => fs.existsSync('public/modules/lang/' + c.toLowerCase() + '.mjs')),
   'every code maps to lang/<code lower-cased>.mjs');
ok(LANG_CODES[0] === 'en' && LANG_CODES.every(c => LANG_META[c].label && /^(ltr|rtl)$/.test(LANG_META[c].dir)),
   'every entry has a label and a direction');
const sw = fs.readFileSync('public/sw.js', 'utf8');
ok(sw.includes("'/modules/lang-meta.mjs'"), 'registry is precached by the service worker');

// ── 3. Runtime (jsdom), saved language = fr ──
const dom = new JSDOM('<!doctype html><html><body><span id="x" data-i18n="bootRetry"></span></body></html>',
  { url: 'https://webclient.pokerth.net/', pretendToBeVisual: true });
const w = dom.window;
globalThis.window = w;
for (const k of ['document', 'localStorage', 'location', 'CustomEvent', 'navigator']) {
  try { Object.defineProperty(globalThis, k, { value: w[k], configurable: true }); } catch (e) {}
}
w.localStorage.setItem('pth_lang', 'fr');
w.__pthErrQ = [];
const toasts = []; w.showToast = (m) => toasts.push(m);

const i18n = await import('../public/modules/i18n.mjs');
const en = (await import('../public/modules/lang/en.mjs')).strings;
const fr = (await import('../public/modules/lang/fr.mjs')).strings;
ok(i18n.getLang() === 'fr', 'saved language detected from the registry');
ok(i18n.LANG_CODES.length === files.length, 'LANG_CODES exported (' + i18n.LANG_CODES.length + ')');
ok(w.I18N.LANG_CODES === i18n.LANG_CODES, 'and mirrored on window.I18N (used by /lang)');

ok(await until(() => w.__pthLangReady === true), 'boot: __pthLangReady raised once the catalogue is applied');
ok(Object.keys(i18n.LANG).sort().join() === 'en,fr', 'boot loads English + the active language only');
ok(i18n.t('bootRetry') === fr.bootRetry && fr.bootRetry !== en.bootRetry, 't() answers in the active language');
ok(w.document.getElementById('x').textContent === fr.bootRetry, 'first DOM sweep done in the active language');
ok(w.document.documentElement.lang === 'fr', '<html lang> follows');
ok(i18n.LANG.fr.assist === 'Assistance' && i18n.LANG.en.displayBB === 'Amounts in big blinds', 'module-level extra keys applied on registration');

// ── 4. Switching ──
let notified = [];
i18n.onLangChange(l => notified.push(l));
i18n.setLang('de');
ok(i18n.getLang() === 'fr', 'setLang on an unloaded language keeps the current one until it arrives');
ok(await until(() => i18n.getLang() === 'de'), 'then switches');
ok(i18n.LANG.de && i18n.LANG.de.assist === 'Hilfe' && notified.join() === 'de', 'catalogue registered, subscribers notified once');
ok(w.localStorage.getItem('pth_lang') === 'de', 'choice persisted');

i18n.setLang('it'); i18n.setLang('es');
await until(() => i18n.getLang() === 'es'); await sleep(50);
ok(i18n.getLang() === 'es', 'quick A → B: the latest request wins');

i18n.setLang('fr');
ok(i18n.getLang() === 'fr', 'already-loaded language: synchronous switch');

i18n.setLang('pt-BR');
ok(await until(() => i18n.getLang() === 'pt-BR') && !!i18n.LANG['pt-BR'], 'region code → lower-cased file name (pt-BR → pt-br.mjs)');
i18n.setLang('ar');
ok(await until(() => i18n.getLang() === 'ar') && w.document.documentElement.dir === LANG_META.ar.dir,
   'text direction comes from the registry (' + LANG_META.ar.dir + ')');
ok(Object.keys(i18n.LANG).length < 10, 'untouched languages are never loaded (' + Object.keys(i18n.LANG).length + ' in memory)');
ok(toasts.length === 0 && w.__pthErrQ.length === 0, 'no error toast, nothing reported');

// ── 5. Whole table on request (SEO renderer, dev parity check) ──
ok(await i18n.loadAllLangs() === true && Object.keys(i18n.LANG).length === LANG_CODES.length,
   'loadAllLangs() fills the whole table (' + LANG_CODES.length + ')');

console.log(fail ? `FAIL ${n - fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
