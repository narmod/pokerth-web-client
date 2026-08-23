#!/usr/bin/env node
// Deterministic guards for the admin dashboard layout.
// Run: node scripts/test-admin-layout.mjs
//
// Layout regressions are quiet ones: a tab bar that wraps a title onto two
// lines and grows the whole strip, a mobile bar that scrolls with nothing
// saying there is more to the right, or a two-column pass that squeezes a
// chart into half the width.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const admin = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'admin.html'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// The @media block that opens the second column.
const wide = (admin.match(/@media\(min-width:1100px\)\{[\s\S]*?\n  \}/) || [''])[0];
// Every mobile block, concatenated: the phone rules are written in more than
// one place, and a guard that reads only the first would pass or fail on where
// a rule happens to sit rather than on whether it exists.
const small = (admin.match(/@media\(max-width:600px\)\{[\s\S]*?\n  \}/g) || []).join('\n');

// ── Tab bar ───────────────────────────────────────────────────────────────
ok(/\.tab\{flex:0 0 auto;white-space:nowrap/.test(admin),
  'tabs size to their label and never break a title onto two lines');
ok(/\.tabs\{display:flex;flex-wrap:wrap/.test(admin),
  'the bar wraps rather than overflow at in-between widths');
ok(/\.tabs\{flex-wrap:nowrap\}/.test(small),
  'on a phone the bar scrolls instead — wrapping would defeat overflow-x');
ok(/\.tabs\.sc-r\{/.test(small) && /\.tabs\.sc-l\{/.test(small) && /\.tabs\.sc-l\.sc-r\{/.test(small),
  'the edge fade covers both directions and both at once');
ok(/-webkit-mask-image/.test(small), 'the fade carries its WebKit prefix for older iOS');

// ── The JS that drives the fade ───────────────────────────────────────────
ok(/function tabsFade\(\)/.test(admin), 'tabsFade exists');
ok(/scrollWidth-t\.clientWidth/.test(admin), 'the fade is driven by real overflow, not by a width guess');
ok(/over>1 && t\.scrollLeft>1/.test(admin), 'no fade at all when every tab fits');
ok(/addEventListener\('scroll', tabsFade/.test(admin), 'the fade follows the scroll');
ok(/addEventListener\('resize', tabsFade\)/.test(admin), 'and the window size');
ok(/applyScopeVisibility[\s\S]{0,600}setTimeout\(tabsFade, 0\)/.test(admin),
  'hiding tabs for a scoped key recomputes the overflow');
ok(/scrollIntoView\(\{block:'nearest',inline:'nearest'/.test(admin),
  'picking a tab brings it into view without scrolling the page');

// ── Two columns on a wide screen ──────────────────────────────────────────
ok(/\.wrap\{max-width:1180px\}/.test(wide), 'the page widens past 1100px');
ok(/columns:2/.test(wide), 'the busiest panels split into two columns');
ok(/#panel-server|#panel-traffic|#panel-clients|#panel-broadcast/.test(wide),
  'the split is opt-in per panel, not global');
ok(/break-inside:avoid/.test(wide), 'a card is never cut across the column break');
ok(/-webkit-column-break-inside:avoid/.test(wide), 'with the WebKit spelling alongside');
ok(/column-span:all/.test(wide), 'charts and grids take the full width back');
for (const id of ['trafChart', 'trafNvRChart', 'trafMusic', 'trafEnv', 'trafCards']) {
  ok(new RegExp('#' + id + '\\)').test(wide), id + ' is not squeezed into half a column');
}
ok(!/columns:2/.test(small), 'nothing changes on a phone');

// ── Settings rows ─────────────────────────────────────────────────────────
// The same flex declaration used to be retyped in 51 style= attributes, with
// control widths hard-coded in the tags — and an inline style beats the sheet,
// so those widths quietly defeated the mobile rule.
ok(/\n  \.fld\{display:flex/.test(admin), 'the settings row is a class now');
ok(/max-width:560px/.test(admin),
  'the control stays near its label instead of drifting to the far edge');
ok(!/class="defrow" style="display:flex/.test(admin), 'no settings row carries the flex inline any more');
ok((admin.match(/class="defrow fld/g) || []).length === 51, 'all 51 rows use it');
ok(/\.fld\.left\{justify-content:flex-start\}/.test(admin), 'the left-aligned variant survives');
ok(/\.fld\.gap\{margin:10px 0 5px\}/.test(admin), 'so does the wider-margin variant');
ok(/\.fld>input\[type=number\]\{width:110px\}/.test(admin), 'short control widths live in the sheet');
ok(!/<input[^>]*style="width:110px"/.test(admin), 'and not in the tags, where they would win over it');

const fldSmall = (small.match(/\.fld\{[\s\S]*?\}\s*\.fld>input,\.fld>select,\.fld>textarea\{[^}]*\}/) || [''])[0];
ok(/flex:1 1 100%/.test(fldSmall), 'on a phone label and control stack full width');
ok(/max-width:none/.test(fldSmall), 'the desktop width cap is lifted there');
for (const id of ['pxGrace', 'pxGap', 'pxMax', 'tdBlind', 'tdStack']) {
  const tag = (admin.match(new RegExp('<input id="' + id + '"[^>]*>')) || [''])[0];
  ok(tag && !/style="width/.test(tag), id + ' can go full width on a phone');
}

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
