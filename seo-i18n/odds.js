'use strict';
// Translations for the /poker-odds page (outs, rule of 2 and 4, pot odds,
// preflop matchups, starting-hand odds).
//
// English lives in proxy.js (_SEO_ODDS) and is the fallback; a language is
// advertised (hreflang, sitemap, nav link, IndexNow) the moment its entry
// lands here, never before. Same keys as _SEO_ODDS. Numbers are never
// written here: the text keeps the {placeholders} of the English, filled at
// render time from seo-i18n/odds-data.json in the reader's number format.
module.exports = {};
