#!/usr/bin/env node
// Deterministic guards for /privacy served in the shared SEO page shell.
// Run: node scripts/test-seo-privacy.mjs
//
// /privacy used to be public/privacy.html sent as is: its own header and
// colours, no nav, no Open Graph, no breadcrumbs — unlike /faq or /rules.
// It is now rendered by seoContentPage() like the other content pages, with
// its text still read from public/privacy.html (the single place to edit).
// The extractor is a pure function, lifted out of the monolith by name and
// run here against the real file: no server is started.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'proxy.js'), 'utf8');
const priv = readFileSync(join(root, 'public', 'privacy.html'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

function fn(name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let depth = 0;
  for (let j = src.indexOf('{', head); j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(head, j + 1); }
  }
  return '';
}

const extract = fn('_seoPrivacyBody');
ok(extract !== '', '_seoPrivacyBody is defined in proxy.js');
ok(fn('seoPrivacyPage').indexOf('seoContentPage(') !== -1, 'seoPrivacyPage renders through seoContentPage');

// The route must hand over to the shared renderer, not stream the raw file.
const route = src.slice(src.indexOf("if (reqPathOnly === '/privacy' || reqPathOnly === '/privacy.html')"));
ok(/^[^}]*return seoPrivacyPage\(res, req\.method, seoEnabled\(\) \? seoLangFromQuery\(req\.url\) : ''\);/.test(route), '/privacy and /privacy.html route to seoPrivacyPage');

const _seoPrivacyBody = new Function(extract + '; return _seoPrivacyBody;')();
const pv = _seoPrivacyBody(priv);

ok(/^<h1>[^<]*Privacy policy<\/h1>/.test(pv.body), 'body opens with an <h1>');
ok(pv.body.indexOf('<p class="updated">') !== -1, 'the "Last updated" line is kept');
ok(pv.body.indexOf('<header>') === -1 && pv.body.indexOf('<style') === -1, 'the file header and styles are dropped');
ok(pv.body.indexOf('class="back"') === -1, 'the file back link is dropped (the shell has its own CTA)');
const h2File = (priv.match(/<h2>/g) || []).length, h2Body = (pv.body.match(/<h2>/g) || []).length;
ok(h2File > 0 && h2File === h2Body, 'every section heading is kept (' + h2Body + '/' + h2File + ')');
ok(/These totals may be combined/.test(pv.body) && /time zone/i.test(pv.body), 'the policy text itself comes through');
ok(/^\d{4}-\d{2}-\d{2}$/.test(pv.modified), 'dateModified parsed from "Last updated" (' + pv.modified + ')');

// Robustness: markers missing -> fall back to the whole <body>.
const fb = _seoPrivacyBody('<html><body><p>plain</p></body></html>');
ok(fb.body.indexOf('<p>plain</p>') !== -1 && fb.modified === '', 'fallback keeps the <body> content when markers are absent');

// ── Translated variants (/privacy?lang=xx) ────────────────────────
// Built from the in-app overlay's pv* strings. Every catalogue must hold the
// whole policy, and the English strings must say what privacy.html says, or
// the translated pages would quietly promise less than the reference text.
const { pathToFileURL } = await import('node:url');
const { readdirSync } = await import('node:fs');
const pvKeysSrc = /var PV_KEYS = (\[[\s\S]*?\]);/.exec(src);
ok(!!pvKeysSrc, 'PV_KEYS is defined');
const PV_KEYS = pvKeysSrc ? (0, eval)(pvKeysSrc[1]) : [];
ok(PV_KEYS.indexOf('pvSrvLan') !== -1, 'PV_KEYS includes the server-proposal item');
const langDir = join(root, 'public', 'modules', 'lang');
const codes = readdirSync(langDir).filter(f => f.endsWith('.mjs')).map(f => f.slice(0, -4));
const cats = {};
for (const c of codes) cats[c] = (await import(pathToFileURL(join(langDir, c + '.mjs')).href)).strings;
const incomplete = codes.filter(c => PV_KEYS.some(k => typeof cats[c][k] !== 'string' || !cats[c][k]));
ok(!incomplete.length, 'every catalogue holds every privacy key (' + codes.length + ' languages)' + (incomplete.length ? ': ' + incomplete.join(' ') : ''));
const enS = cats.en;
for (const [k, needle] of [['pvSrv1', 'These totals may be combined'], ['pvSrv1', 'connected right now in each country'],
  ['pvSrv1', 'as a guest or with an account'], ['pvSrvGuide', 'backup offer'], ['pvSrvLan', 'salted hash'],
  ['pvSrvLan', 'For the admins only'], ['pvAcct', 'passes them on'], ['pvAcct', 'password manager'],
  ['pvUpdated', 'October 19, 2026']]) {
  ok(enS[k].indexOf(needle) !== -1 && priv.indexOf(needle) !== -1, 'English ' + k + ' matches privacy.html: “' + needle + '”');
}
const same = codes.filter(c => c !== 'en' && ['pvSrv1', 'pvSrvGuide', 'pvSrvLan'].some(k => cats[c][k] === enS[k]));
ok(!same.length, 'the updated items are translated, not copied from English' + (same.length ? ': ' + same.join(' ') : ''));

const fromCat = new Function(fn('_seoPrivacyFromCat') + '; return _seoPrivacyFromCat;')();
const fr = fromCat(cats.fr, 'PokerTH Web Client — Politique de confidentialité');
ok(/^<h1>PokerTH Web Client — Politique/.test(fr), 'translated page opens with its own <h1>');
ok((fr.match(/<h2>/g) || []).length === (priv.match(/<h2>/g) || []).length, 'translated page has the same sections as the English one');
ok((fr.match(/<li>/g) || []).length === 11, 'translated page lists the 8 server items and the 3 licence links');
ok(/<li><strong>Statistiques de visite<\/strong> : /.test(fr), 'the "Label :" lead-in is set bold (French spacing kept)');
ok(/<li><strong>[^<]+<\/strong>：/.test(fromCat(cats.zh)), 'a full-width colon is recognised too');
const evil = Object.fromEntries(PV_KEYS.map(k => [k, 'x<script>y']));
ok(fromCat(evil).indexOf('<script>') === -1, 'catalogue text is escaped');

const meta = (await import(pathToFileURL(join(root, 'seo-i18n', 'privacy.js')).href)).default;
const seoCodes = codes.filter(c => c !== 'en').map(c => ({ 'pt-br': 'pt-BR', 'pt-pt': 'pt-PT', 'zh-hk': 'zh-HK', 'zh-tw': 'zh-TW' })[c] || c);
const noMeta = seoCodes.filter(c => !meta[c] || !meta[c].h1 || !meta[c].desc);
ok(!noMeta.length, 'seo-i18n/privacy.js has a heading and a description for every language' + (noMeta.length ? ': ' + noMeta.join(' ') : ''));

ok(fr.indexOf('href="https://www.pokerth.net/ucp.php?mode=privacy"') !== -1, 'translated page links to the pokerth.net account privacy policy');
ok(priv.indexOf('href="https://www.pokerth.net/ucp.php?mode=privacy"') !== -1, 'English page links to the pokerth.net account privacy policy');
const updDup = codes.filter(c => c !== 'en' && cats[c].pvUpdated === enS.pvUpdated);
ok(!updDup.length, 'the new date is translated in every language' + (updDup.length ? ': ' + updDup.join(' ') : ''));
// The page promises the password is passed on without being kept: the
// debug hex dump of client frames must never include the login frames.
ok(/_n <= 32 && d\.name !== 'Init' && d\.name !== 'AuthClientResponse'\)/.test(src), 'login frames are never hex-dumped in the proxy log');

const app = readFileSync(join(root, 'public', 'pokerth-client.html'), 'utf8');
ok(app.indexOf('data-i18n="pvSrvLan"') !== -1, 'the in-app overlay shows the server-proposal item');

console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
