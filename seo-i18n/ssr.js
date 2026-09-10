'use strict';
// Server-side localization of pokerth-client.html for the ?lang= variants.
//
// Why: the client translates itself at boot (setLang() in
// public/modules/i18n.mjs), but a crawler that does not run JavaScript reads
// the static defaults baked into the HTML. /?lang=nl used to reach such a
// crawler as a Dutch <title> and SEO block wrapped around English and French
// interface text, which is a poor answer to a Dutch query. This module applies
// the very same substitutions setLang() makes, before the page is sent:
//
//   data-i18n="k"              element text      (el.textContent = t(k))
//   data-i18n-opt="k"          <option> text     (el.textContent = t(k))
//   data-i18n-title="k"        title=""          (el.title = t(k))
//   data-i18n-aria="k"         aria-label=""     (setAttribute)
//   data-i18n-placeholder="k"  placeholder=""    (el.placeholder = t(k))
//
// Resolution matches t(): language -> English -> left untouched (the static
// default stays, where t() would print the raw key).
//
// The strings are the client's own: catalog-dump.mjs imports
// public/modules/i18n.mjs in a child process and prints the assembled LANG
// table, overlays included. A child process rather than an import() here, for
// two reasons: proxy.js is CommonJS on Node 20, and ES modules cannot be
// re-imported once cached, whereas a static self-update (git pull, no restart)
// changes the translations under a running proxy. load() is simply run again
// when the files change.
//
// With JavaScript on, the page ends up exactly as before: setLang() rewrites
// every one of these nodes at boot with the same values.

var cp = require('child_process');
var fs = require('fs');
var path = require('path');

var ATTR_OF = {
  'data-i18n-title': 'title',
  'data-i18n-aria': 'aria-label',
  'data-i18n-placeholder': 'placeholder'
};

// A start tag, quote-aware: an attribute value may legitimately contain '>'
// (inline handlers), which a naive <[^>]*> would cut in the middle.
var TAG_RE = /<([a-zA-Z][\w-]*)((?:\s+[^\s=>"'\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>"']+))?)*)\s*(\/?)>/g;
// Regions never touched: inline code and comments.
var SKIP_RE = /<script\b[\s\S]*?<\/script\s*>|<style\b[\s\S]*?<\/style\s*>|<!--[\s\S]*?-->/gi;

function escText(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escAttr(s) {
  return escText(s).replace(/"/g, '&quot;');
}
function attrVal(attrs, name) {
  var m = new RegExp('\\s' + name + '\\s*=\\s*"([^"]*)"').exec(attrs);
  return m ? m[1] : null;
}
function lookup(cat, lang, k) {
  var d = cat[lang], s = d ? d[k] : null;
  if (s == null && cat.en) s = cat.en[k];
  return typeof s === 'string' ? s : null;
}

// Localize one markup chunk (no script/style/comment inside).
function _chunk(html, lang, cat) {
  var out = '', last = 0, m;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(html))) {
    var tag = m[0], name = m[1], attrs = m[2], end = TAG_RE.lastIndex;
    var textKey = attrVal(attrs, 'data-i18n') || attrVal(attrs, 'data-i18n-opt');
    var newAttrs = attrs;
    for (var da in ATTR_OF) {
      var k = attrVal(attrs, da);
      if (!k) continue;
      var v = lookup(cat, lang, k);
      if (v == null) continue;
      var an = ATTR_OF[da];
      var re = new RegExp('(\\s' + an + '\\s*=\\s*)"[^"]*"');
      newAttrs = re.test(newAttrs)
        ? newAttrs.replace(re, function (_, pre) { return pre + '"' + escAttr(v) + '"'; })
        : newAttrs + ' ' + an + '="' + escAttr(v) + '"';
    }
    if (newAttrs !== attrs) tag = '<' + name + newAttrs + (m[3] ? ' /' : '') + '>';
    out += html.slice(last, m.index) + tag;
    last = end;
    if (textKey && !m[3]) {
      // Leaf elements only (scripts/test-seo-ssr.mjs asserts every
      // data-i18n element of the template is one): replace the text up to
      // the matching close tag, and only when nothing but text sits between.
      var close = new RegExp('^([^<]*)(</' + name + '\\s*>)');
      var cm = close.exec(html.slice(end));
      var tv = lookup(cat, lang, textKey);
      if (cm && tv != null) {
        out += escText(tv);
        last = end + cm[1].length;
      }
    }
  }
  return out + html.slice(last);
}

// Localize a full HTML document. Returns the input unchanged without a catalog.
function localize(html, lang, cat) {
  if (!cat || !cat.en) return html;
  lang = (lang && cat[lang]) ? lang : 'en';
  var out = '', last = 0, m;
  SKIP_RE.lastIndex = 0;
  while ((m = SKIP_RE.exec(html))) {
    out += _chunk(html.slice(last, m.index), lang, cat) + m[0];
    last = SKIP_RE.lastIndex;
  }
  return out + _chunk(html.slice(last), lang, cat);
}

// Catalog lifecycle -----------------------------------------------------------
var _cat = null;        // { code: { key: string } }
var _version = 0;       // bumps on every successful load (cache key)
var _stamp = '';        // source stamp of the loaded catalog
var _loading = false;
var _memo = null;       // { v, exp } — at most one stat pass per 5 s

function _sourceStamp(publicDir) {
  if (_memo && _memo.exp > Date.now()) return _memo.v;
  var files = [path.join(publicDir, 'modules', 'i18n.mjs')];
  var dir = path.join(publicDir, 'modules', 'lang');
  try { fs.readdirSync(dir).forEach(function (f) { if (/\.mjs$/.test(f)) files.push(path.join(dir, f)); }); } catch (e) {}
  var newest = 0;
  files.forEach(function (f) { try { var t = fs.statSync(f).mtimeMs; if (t > newest) newest = t; } catch (e) {} });
  var v = files.length + ':' + newest;
  _memo = { v: v, exp: Date.now() + 5000 };
  return v;
}

// Ensure the catalog matches the files on disk; loads in the background.
// Never blocks: until a load lands, callers get the previous catalog (or none,
// in which case the static HTML is served as it is).
function refresh(publicDir) {
  var s = _sourceStamp(publicDir);
  if (s === _stamp || _loading) return;
  _loading = true;
  var script = path.join(__dirname, 'catalog-dump.mjs');
  cp.execFile(process.execPath, [script, publicDir], { maxBuffer: 64 * 1024 * 1024, timeout: 30000 },
    function (err, stdout) {
      _loading = false;
      if (err) {
        _stamp = s; // do not respawn on every request; retried on the next file change
        console.warn('[seo] i18n catalog load failed, serving static HTML:', (err && err.message || '').split('\n')[0]);
        return;
      }
      try {
        var cat = JSON.parse(stdout);
        if (!cat || !cat.en) throw new Error('no English table');
        _cat = cat; _stamp = s; _version++;
      } catch (e) {
        _stamp = s;
        console.warn('[seo] i18n catalog unreadable, serving static HTML:', e.message);
      }
    });
}

function catalog() { return _cat; }
function version() { return _version; }

module.exports = {
  localize: localize,
  refresh: refresh,
  catalog: catalog,
  version: version
};
