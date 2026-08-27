'use strict';
// Translations for the /how-to-play page. Same policy and same reason for
// living outside proxy.js as seo-i18n/hands.js — see the header there.
//
// Empty for now: English lives in seoHowToPage() in proxy.js and is served to
// every language until an entry lands here. Filled in batches.
//
// Shape per language: see the builder below.

var PARTS = {};

function build() {
  var out = {};
  for (var code in PARTS) {
    var p = PARTS[code];
    var steps = '', i;
    for (i = 0; i < p.steps.length; i++) {
      steps += '<li><strong>' + p.steps[i][0] + '</strong> \u2014 ' + p.steps[i][1] + '</li>';
    }
    out[code] = {
      title: p.title, desc: p.desc, ldHeadline: p.ldHeadline, ldDesc: p.ldDesc,
      body: '<h1>' + p.h1 + '</h1><p>' + p.lead + '</p><ol>' + steps + '</ol>' +
        '<h2>' + p.nextH2 + '</h2><p>' + p.nextP + '</p>'
    };
  }
  return out;
}

module.exports = { PARTS: PARTS, build: build };
