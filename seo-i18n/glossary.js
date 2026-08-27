'use strict';
// Translations for the /glossary page. Same policy and same reason for living
// outside proxy.js as seo-i18n/hands.js — see the header there.
//
// Empty for now: English lives in seoGlossaryPage() in proxy.js and is served
// to every language until an entry lands here. Filled in batches.
//
// Shape per language: see the builder below.

var PARTS = {};

function build() {
  var out = {};
  for (var code in PARTS) {
    var p = PARTS[code];
    var terms = '', i;
    for (i = 0; i < p.terms.length; i++) {
      terms += '<dt>' + p.terms[i][0] + '</dt><dd>' + p.terms[i][1] + '</dd>';
    }
    out[code] = {
      title: p.title, desc: p.desc, ldHeadline: p.ldHeadline, ldDesc: p.ldDesc,
      body: '<h1>' + p.h1 + '</h1><p>' + p.lead + '</p><dl>' + terms + '</dl>' +
        '<p style="margin-top:1.6em">' + p.footer + '</p>'
    };
  }
  return out;
}

module.exports = { PARTS: PARTS, build: build };
