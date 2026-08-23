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
// The mobile block.
const small = (admin.match(/@media\(max-width:600px\)\{[\s\S]*?\n  \}/) || [''])[0];

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

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
