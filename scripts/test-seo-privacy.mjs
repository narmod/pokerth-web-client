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
ok(/^[^}]*return seoPrivacyPage\(res, req\.method\);/.test(route), '/privacy and /privacy.html route to seoPrivacyPage');

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

console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
