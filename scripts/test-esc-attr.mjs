#!/usr/bin/env node
// esc() (modules/ui/misc.mjs) feeds double-quoted attributes as well as text:
// the notes block on a player's card builds data-nv-name="' + esc(name) + '".
// It escaped & < > but not '"', so a server-provided name such as
// x" onmouseover="… opened a live event-handler attribute. It now escapes '"'.
// Run: node scripts/test-esc-attr.mjs
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document });
const { esc } = await import('../public/modules/ui/misc.mjs');
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); };

const evil = 'x" onmouseover="window.pwned=1" data-a="';
const host = document.createElement('div');
host.innerHTML = '<div class="nv-block" data-nv-name="' + esc(evil) + '" title="' + esc(evil) + '">' + esc(evil) + '</div>';
const el = host.firstChild;
ok(!el.hasAttribute('onmouseover'), 'a quote in the name opens no new attribute');
ok(el.getAttribute('data-nv-name') === evil && el.getAttribute('title') === evil, 'the attribute holds the name exactly');
ok(el.textContent === evil, 'as text it reads the same');
ok(esc('<b>&') === '&lt;b&gt;&amp;', 'markup and ampersands are still escaped');
ok(esc("l'as") === "l'as", 'apostrophes are left alone (chat text, nicknames)');
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
