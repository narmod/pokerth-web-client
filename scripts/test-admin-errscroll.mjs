#!/usr/bin/env node
// Deterministic tests for the scroll cap of the admin error list (admin.html).
// Run: node scripts/test-admin-errscroll.mjs
//
// Past 15 errors the list keeps the height of its first 15 rows and scrolls
// inside the card. Rows have no fixed height, so _erFit measures the 15th row;
// while the panel is hidden everything measures 0 and the cap must wait for
// the ResizeObserver instead of collapsing the list to 0 px.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html = fs.readFileSync(path.join(root, 'public', 'admin.html'), 'utf8');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + label);
  if (!cond) fails++;
}

const v = html.match(/^ *var ER_VISIBLE=(\d+), _erRO=null;$/m);
const i0 = html.indexOf('  function _erFit(list){');
const i1 = html.indexOf('\n  }\n', i0);
ok(!!v && i0 > 0 && i1 > i0, 'ER_VISIBLE and _erFit are still in admin.html');
if (!v || i0 < 0) { console.log('\nFAIL ' + fails); process.exit(1); }
ok(v[1] === '15', '15 rows visible');
const _erFit = new Function(v[0] + '\n' + html.slice(i0, i1 + 4) + '\nreturn _erFit;')();

ok(/_erFit\(list\); _erWatch\(list\);\s*if\(keepTop\) list\.scrollTop=keepTop;/.test(html),
  'the list is fitted, watched and keeps its scroll position after each load');

// Fake list: rows of varying height stacked from y=100 (or all 0 when hidden).
function fakeList(heights, hidden) {
  let y = 100;
  const rows = heights.map((h) => {
    const top = hidden ? 0 : y, bottom = hidden ? 0 : y + h;
    y += h;
    return { getBoundingClientRect: () => ({ top, bottom }) };
  });
  return { children: rows, style: { maxHeight: '', overflowY: '' } };
}
const H = Array.from({ length: 40 }, (_, i) => 50 + (i % 3) * 20); // 50/70/90 px rows
const first15 = H.slice(0, 15).reduce((a, b) => a + b, 0);

const few = fakeList(H.slice(0, 15));
_erFit(few);
ok(few.style.maxHeight === '' && few.style.overflowY === '', '15 rows or fewer: no cap, no scrollbar');

const many = fakeList(H);
_erFit(many);
ok(many.style.maxHeight === first15 + 'px', 'more than 15 rows: capped at the bottom of row 15 (' + many.style.maxHeight + ')');
ok(many.style.overflowY === 'auto', 'more than 15 rows: vertical scroll');

const hidden = fakeList(H, true);
_erFit(hidden);
ok(hidden.style.maxHeight === '', 'hidden panel (all 0): left uncapped, never 0 px');

many.children = many.children.slice(0, 3);
_erFit(many);
ok(many.style.maxHeight === '' && many.style.overflowY === '', 'back under 15 rows (dismissed): cap removed');

console.log(fails ? '\nFAIL ' + fails : '\nOK');
process.exit(fails ? 1 : 0);
