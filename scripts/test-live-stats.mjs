#!/usr/bin/env node
// Deterministic tests for the live figures line on the login screen.
// Run: node scripts/test-live-stats.mjs
//
// Why this file exists: the icons shipped once with their size left entirely to
// pokerth.css. A client still holding a cached stylesheet from before those
// rules existed rendered each <svg> at the browser default of 300x150, and the
// Internet card grew to fill the screen. A served file can always reach a
// browser ahead of, or without, its stylesheet — so the module must stay
// survivable on its own. These tests pin that floor.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = fs.readFileSync(path.join(root, 'public', 'modules', 'ui', 'live-stats.mjs'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public', 'pokerth.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'public', 'pokerth-client.html'), 'utf8');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  \u2713 ' : '  \u2717 ') + label);
  if (!cond) fails++;
}

// -- the floor: every icon carries its own dimensions -------------------------
// Strip comments first: the prose above ICONS mentions an <svg> tag by name.
const code = src.replace(/^\s*\/\/.*$/gm, '');
const svgs = code.match(/<svg[^>]*>/g) || [];
ok(svgs.length >= 3, 'the module ships its icons inline (' + svgs.length + ' found)');
ok(svgs.every(s => /\bwidth="\d+"/.test(s) && /\bheight="\d+"/.test(s)),
  'every icon sets width and height as attributes, not via the stylesheet');
ok(svgs.every(s => !/stroke="var\(/.test(s)),
  'no icon strokes with a CSS var (an SVG stroke= attribute does not resolve it)');
ok(svgs.every(s => /stroke="currentColor"/.test(s)),
  'icons stroke with currentColor so they follow the line colour');

// -- render with no stylesheet at all -----------------------------------------
const dom = new JSDOM('<span id="lc-live" style="display:none"></span>');
global.document = dom.window.document;
global.window = dom.window;

let mod = src.replace(/^import .*$/m, "const t = (k, p) => k + ':' + (p && p.n);");
mod = mod.split('if (document.readyState')[0] + '\nexport { _render as R, _hide as H };';
const m = await import('data:text/javascript;base64,' + Buffer.from(mod).toString('base64'));

const el = () => document.getElementById('lc-live');

m.R({ ok: true, online: 6, tables: 1, waiting: 4, today: 1 });
ok(el().children.length === 4, 'all four counters render when the server publishes them');
ok(el().style.display === 'flex', 'the row lays itself out inline without the stylesheet');
ok([...el().children].every(c => c.style.display === 'inline-flex'),
  'each counter lays itself out inline too');
ok([...el().children].every(c => c.getAttribute('aria-label')),
  'each counter carries its wording for screen readers');
ok([...el().children].every(c => c.title), 'and as a tooltip on hover');
ok(/liveOnline/.test(el().children[0].title) && /liveToday/.test(el().children[3].title),
  'the counters keep the website order: online, tables, waiting, today');

m.R({ ok: true, online: 2, tables: null, waiting: null, today: 6 });
ok(el().children.length === 2, 'counters the server does not publish are left out');

m.R({ ok: true, online: 3, tables: 0, waiting: 0, today: 0 });
ok(el().children.length === 2, 'a zero table or queue count is left out, a zero game count is kept');

// -- the relay declining must leave the card exactly as it was ----------------
for (const bad of [null, { ok: false, error: 'stale' }, { ok: false, error: 'relay_failed' },
                   { ok: false, error: 'disabled' }, { ok: true }]) {
  m.R(bad);
  if (el().style.display !== 'none' || el().children.length !== 0) {
    ok(false, 'the line hides itself on ' + JSON.stringify(bad));
    break;
  }
}
ok(el().style.display === 'none' && el().children.length === 0,
  'stale, unreachable, switched off or shapeless: the line hides and empties');

// -- the anchor the module writes into ----------------------------------------
ok(/id="lc-live"/.test(html), 'the login card still carries the lc-live anchor');
ok(/class="lc-live"/.test(html), 'and its class');
ok(/style="display:none"/.test(html.slice(html.indexOf('id="lc-live"') - 120, html.indexOf('id="lc-live"') + 60)),
  'the anchor starts hidden, so nothing shows before the relay answers');
ok(/live-stats\.mjs/.test(html), 'the page loads the module');
ok(/\.lc-live\b/.test(css), 'the stylesheet still styles the row');

console.log(fails ? ('FAIL ' + fails) : 'ALL OK');
process.exit(fails ? 1 : 0);
