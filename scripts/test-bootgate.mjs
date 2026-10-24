#!/usr/bin/env node
// Deterministic tests for the boot gate in pokerth-client.html.
// Run: node scripts/test-bootgate.mjs
//
// The gate holds a full-screen overlay until window.App exists, because every
// inline onclick="App.x()" in the page throws ReferenceError before that. With
// the splash option unticked the overlay is invisible — but it must still take
// the clicks, otherwise the form looks ready while pokerth.js (500 kB, deferred)
// is still executing, and a player's click is lost with no feedback at all.
// That is a real report from production: "Uncaught ReferenceError: App is not
// defined" on an inline handler, Windows / Chrome.
//
// This is a CSS invariant, so the test reads the rules rather than a DOM.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html = fs.readFileSync(path.join(root, 'public', 'pokerth-client.html'), 'utf8');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  \u2713 ' : '  \u2717 ') + label);
  if (!cond) fails++;
}

function rule(selector) {
  const i = html.indexOf(selector + '{');
  if (i < 0) return null;
  return html.slice(i + selector.length + 1, html.indexOf('}', i));
}

const invisible = rule('#boot-splash.bs-invisible');
const hide = rule('#boot-splash.bs-hide');
const base = rule('#boot-splash');

ok(!!base && /position:fixed/.test(base) && /inset:0/.test(base),
   'the overlay covers the viewport');
ok(!!invisible, 'the .bs-invisible rule (splash option off) still exists');
ok(!!invisible && /opacity:\s*0/.test(invisible),
   'with the splash off the overlay is invisible');
// L'invariant qui compte.
ok(!!invisible && !/pointer-events/.test(invisible),
   'an invisible overlay still takes the clicks — the app is not usable before App exists');
ok(!!hide && /pointer-events:\s*none/.test(hide),
   'clicks pass through once revealed (.bs-hide)');

// Le gate doit continuer de surveiller et de pouvoir redevenir visible pour
// proposer « Réessayer » : sans ça, une app qui ne charge jamais laisserait un
// écran figé et non cliquable.
ok(/classList\.remove\('bs-invisible'\)/.test(html),
   'on failure the overlay becomes visible again to offer Retry');
ok(/window\.App/.test(html), 'window.App is still what the gate waits on');

// Safety net (web.263): if a tap gets through anyway (Android 15 · Chrome 121 in
// production), the error collector calls the gate, which restores Retry.
const net = (html.match(/window\.__pthBootStall = function \(\) \{[\s\S]*?\n  \};/) || [''])[0];
ok(!!net, 'the boot gate exposes window.__pthBootStall');
ok(/fail\(\)/.test(net) && /classList\.remove\('bs-hide'\)/.test(net) && /pointerEvents = 'auto'/.test(net),
   'it puts the overlay back on top in its Retry state');
ok(/setProperty\('display', 'flex', 'important'\)/.test(net) && /setProperty\('opacity', '1', 'important'\)/.test(net),
   'it forces the overlay visible even when a foreign stylesheet hid it');
ok(/removeProperty\('opacity'\)/.test(html) && /removeProperty\('pointer-events'\)/.test(html),
   'reveal releases the pinned inline styles so the fade and click-through still work');
ok(/reveal\(\)/.test(net), 'and still reveals if the app starts after all');
ok(/window\.__pthBootStall\(\)/.test(html), 'the error collector calls it');

// Les gestionnaires en ligne qui motivent tout ceci.
const inline = (html.match(/on(?:click|change)="[^"]*\bApp\./g) || []).length;
ok(inline > 0, 'the page still wires inline App.* handlers (' + inline + ' found)');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
