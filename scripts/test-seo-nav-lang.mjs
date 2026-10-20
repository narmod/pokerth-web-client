#!/usr/bin/env node
// Deterministic guards for the language carried by the internal SEO links.
// Run: node scripts/test-seo-nav-lang.mjs
//
// The nav on a server-rendered content page used to emit bare hrefs, so a
// reader who reached /rules?lang=fr was thrown back to English on the next
// click and the 40 translated pages looked as if they did not exist. The link
// builder is a pure function, so it is lifted out of the monolith by name and
// run here against small stand-in tables: no server is started and no request
// is made.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// Lift a named function out of the source, braces balanced.
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

for (const name of ['_seoLangHref', '_seoNavLabel', '_seoPageNav', '_seoAttr']) {
  ok(fn(name) !== '', name + ' is defined in proxy.js');
}

// Stand-in tables: 'fr' exists everywhere, 'de' only on the pages that have
// been translated so far, 'xx' is not a UI language at all.
const sandbox = `
  var SEO_I18N = { fr: 1, de: 1, es: 1 };
  var SEO_RULES_I18N = { fr: 1, de: 1 };
  var SEO_FAQ_I18N = { fr: 1 };
  var SEO_HANDS_I18N = {};
  var SEO_HOWTO_I18N = {};
  var SEO_GLOSSARY_I18N = {};
  var SEO_COMP_I18N = { fr: 1 };
  // /play-with-friends: English only so far, 'fr' translated.
  var SEO_FRIENDS_I18N = { fr: 1 };
  // /poker-odds: 'fr' translated, 'de' not.
  var SEO_ODDS_I18N = { fr: 1 };
  var SEO_BOTS_I18N = { fr: 1 };
  var SEO_START_I18N = { fr: 1 };
  // /privacy: languages whose catalogue holds the whole policy (here fr only).
  function _seoPrivacyTable() { return { fr: {} }; }
  var SEO_NAV_EN = { play: '\u25b6 Play now', rules: 'Rules', hands: 'Hand rankings', howto: 'How to play',
    gloss: 'Glossary', comp: 'Competitions', friends: 'Play with friends', odds: 'Poker odds', bots: 'Vs computer', start: 'Starting hands', faq: 'FAQ', privacy: 'Privacy', src: 'Source', cta: 'Play' };
  var SEO_NAV_I18N = { fr: { play: '\u25b6 Jouer', rules: 'R\u00e8gles', faq: 'FAQ' }, xx: { play: 'XX' } };
  ${fn('_seoAttr')}
  ${fn('_seoNavLabel')}
  ${fn('_seoLangHref')}
  ${fn('_seoFriendsIn')}
  ${fn('_seoOddsIn')}
  ${fn('_seoBotsIn')}
  ${fn('_seoStartIn')}
  ${fn('_seoPageNav')}
  ({ href: _seoLangHref, nav: _seoPageNav, T: { r: SEO_RULES_I18N, f: SEO_FAQ_I18N, h: SEO_HANDS_I18N, i: SEO_I18N } })
`;
const S = (0, eval)(sandbox);

// The link builder itself.
ok(S.href('/rules', S.T.r, 'fr') === '/rules?lang=fr', 'a translated page keeps the language');
ok(S.href('/rules', S.T.r, '') === '/rules', 'no language means no query string');
ok(S.href('/faq', S.T.f, 'de') === '/faq', 'a page without that translation stays on the English URL');
ok(S.href('/hand-rankings', S.T.h, 'fr') === '/hand-rankings', 'an untranslated page never gets ?lang=');
ok(S.href('/', S.T.i, 'es') === '/?lang=es', 'the home page follows the UI language set');
ok(S.href('/rules', S.T.r, 'xx') === '/rules', 'a code that is not a UI language is ignored');
ok(S.href('/rules', null, 'fr') === '/rules', 'a missing table degrades to the English URL');

// The nav as a whole.
const navFr = S.nav('fr');
ok(navFr.indexOf('href="/?lang=fr"') !== -1, 'nav: Play now carries the language');
ok(navFr.indexOf('href="/rules?lang=fr"') !== -1, 'nav: Rules carries the language');
ok(navFr.indexOf('href="/faq?lang=fr"') !== -1, 'nav: FAQ carries the language');
ok(navFr.indexOf('href="/competitions?lang=fr"') !== -1 && S.nav('de').indexOf('href="/competitions"') !== -1, 'nav: Competitions carries the language only where translated');
ok(S.nav('').indexOf('href="/play-with-friends"') !== -1, 'nav: Play with friends on the English pages');
ok(navFr.indexOf('href="/play-with-friends?lang=fr"') !== -1, 'nav: Play with friends carries the language where translated');
ok(S.nav('de').indexOf('/play-with-friends') === -1, 'nav: no Play with friends link where the page is not translated yet');
ok(S.nav('').indexOf('href="/poker-odds"') !== -1, 'nav: Poker odds on the English pages');
ok(navFr.indexOf('href="/poker-odds?lang=fr"') !== -1, 'nav: Poker odds carries the language where translated');
ok(S.nav('de').indexOf('/poker-odds') === -1, 'nav: no Poker odds link where the page is not translated yet');
ok(navFr.indexOf('href="/play-against-computer?lang=fr"') !== -1 && S.nav('de').indexOf('/play-against-computer') === -1, 'nav: Vs computer only where translated');
ok(navFr.indexOf('href="/starting-hands?lang=fr"') !== -1 && S.nav('de').indexOf('/starting-hands') === -1, 'nav: Starting hands only where translated');
ok(navFr.indexOf('href="/glossary"') !== -1, 'nav: an untranslated page is linked bare');
ok(navFr.indexOf('href="/privacy?lang=fr"') !== -1 && S.nav('de').indexOf('href="/privacy"') !== -1, 'nav: /privacy carries the language only where translated');
ok(navFr.indexOf('?lang=fr') !== -1 && navFr.indexOf('?lang=en') === -1, 'nav: English is never spelled out');

const navDe = S.nav('de');
ok(navDe.indexOf('href="/rules?lang=de"') !== -1, 'nav: German keeps the language on /rules');
ok(navDe.indexOf('href="/faq"') !== -1, 'nav: and drops it on the page it has no translation for');

const navEn = S.nav('');
ok(navEn.indexOf('?lang=') === -1, 'nav: the English page links to bare URLs only');
ok(navEn.split('<a ').length === navFr.split('<a ').length, 'nav: the same links are emitted either way');

// The labels follow the language too, label by label, English as fallback.
ok(navFr.indexOf('\u25b6 Jouer</a>') !== -1 && navFr.indexOf('Play now') === -1, 'nav: French labels on the French page');
ok(navFr.indexOf('>Glossary</a>') !== -1, 'nav: a label missing from the translation falls back to English');
ok(S.nav('xx').indexOf('XX') === -1, 'nav: labels of a code that is not a UI language are ignored');
ok(navEn.indexOf('\u25b6 Play now</a>') !== -1, 'nav: the English page keeps the English labels');
ok(/_seoNavLabel\(lang, 'cta'\)/.test(src), 'the closing call to action is localized');

// The nav is called with the language the page resolved, not with nothing.
ok(/_seoPageNav\(lang\)/.test(src), 'seoContentPage passes its language to the nav');
// The crawler block and the footer line use the same builder.
ok(/_seoLangHref\('\/rules', SEO_RULES_I18N, lang\)/.test(src), 'the /rules link is built by the helper');
ok((src.match(/_seoLangHref\(/g) || []).length >= 12, 'every internal SEO link goes through the helper');

console.log(fail ? `\n${fail}/${n} failed` : `\n${n}/${n} passed`);
process.exit(fail ? 1 : 0);
