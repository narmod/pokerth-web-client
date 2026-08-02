// Deterministic tests for determinePlayerNeedToShowCards (showlist.mjs).
// Fixtures mirror LocalBoard::determinePlayerNeedToShowCards in the official
// engine. Run: node scripts/test-showlist.mjs
//
// The module imports state.mjs (browser globals), so the pure function is
// re-declared here from the same source file by stripping the S import: we
// load the file text, cut the import/glue lines, and evaluate it.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const src  = readFileSync(join(here, '..', 'public', 'modules', 'game', 'showlist.mjs'), 'utf8');

// Keep only determineShowList + _sortUnique (the pure part, no S / no window).
const start = src.indexOf('function determineShowList');
const end   = src.indexOf('// activePlayerList order');
if (start < 0 || end < 0) { console.error('FAIL: cannot locate pure section'); process.exit(1); }
const determineShowList = (new Function(src.slice(start, end) + '\nreturn determineShowList;'))();

let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; }
  else { fail++; console.error('FAIL ' + name + '\n  got  ' + g + '\n  want ' + w); }
}

const ctx = (o) => Object.assign({
  order: [1, 2, 3], folded: new Set(), cardsValue: {}, invested: {},
  allInCondition: false, lastActionPid: 0
}, o);

// 1. All-in condition: everybody still in the hand shows.
eq('allin shows everyone', determineShowList(ctx({
  order: [1, 2, 3, 4], folded: new Set([3]), allInCondition: true
})), [1, 2, 4]);

// 2. Empty table.
eq('empty order', determineShowList(ctx({ order: [] })), []);

// 3. Last aggressor shows; a strictly worse hand that invested no more mucks.
eq('worse hand mucks', determineShowList(ctx({
  order: [1, 2, 3], lastActionPid: 1,
  cardsValue: { 1: 500, 2: 300, 3: 200 },
  invested:   { 1: 100, 2: 100, 3: 100 }
})), [1]);

// 4. A better hand behind the aggressor must show.
eq('better hand shows', determineShowList(ctx({
  order: [1, 2, 3], lastActionPid: 1,
  cardsValue: { 1: 300, 2: 500, 3: 200 },
  invested:   { 1: 100, 2: 100, 3: 100 }
})), [1, 2]);

// 5. Increasing hands clockwise: each new best has to show.
eq('rising chain', determineShowList(ctx({
  order: [1, 2, 3], lastActionPid: 1,
  cardsValue: { 1: 100, 2: 200, 3: 300 },
  invested:   { 1: 50, 2: 50, 3: 50 }
})), [1, 2, 3]);

// 6. Tie on the top level -> the tying player shows too (split pot).
eq('tie shows', determineShowList(ctx({
  order: [1, 2, 3], lastActionPid: 1,
  cardsValue: { 1: 400, 2: 400, 3: 100 },
  invested:   { 1: 100, 2: 100, 3: 100 }
})), [1, 2]);

// 7. Worse hand but invested more than the level -> shows (side pot payer).
eq('worse but paid more shows', determineShowList(ctx({
  order: [1, 2], lastActionPid: 1,
  cardsValue: { 1: 500, 2: 200 },
  invested:   { 1: 60, 2: 200 }
})), [1, 2]);

// 8. Folded aggressor -> fall back to the first non-folded player.
eq('folded aggressor fallback', determineShowList(ctx({
  order: [1, 2, 3], folded: new Set([1]), lastActionPid: 1,
  cardsValue: { 2: 300, 3: 100 },
  invested:   { 2: 50, 3: 50 }
})), [2]);

// 9. Unknown lastActionPid behaves like the fallback.
eq('unknown aggressor fallback', determineShowList(ctx({
  order: [4, 5], lastActionPid: 99,
  cardsValue: { 4: 300, 5: 100 }, invested: { 4: 10, 5: 10 }
})), [4]);

// 10. Wrap-around: aggressor sits last in seat order.
eq('wrap around', determineShowList(ctx({
  order: [1, 2, 3], lastActionPid: 3,
  cardsValue: { 3: 100, 1: 500, 2: 200 },
  invested:   { 1: 10, 2: 10, 3: 10 }
})), [1, 3]);

// 11. Everybody folded except one: only he is listed.
eq('single survivor', determineShowList(ctx({
  order: [1, 2, 3], folded: new Set([2, 3]), lastActionPid: 1,
  cardsValue: { 1: 100 }, invested: { 1: 10 }
})), [1]);

// 12. Result is sorted and free of duplicates.
eq('sorted unique', determineShowList(ctx({
  order: [7, 3, 9], lastActionPid: 9,
  cardsValue: { 9: 100, 7: 200, 3: 300 },
  invested:   { 3: 5, 7: 5, 9: 5 }
})), [3, 7, 9]);

// 13. Missing cardsValue defaults to 0 for everyone -> that is a tie, so both
//     are listed (same branch as case 6). Mostly a "does not throw" guard.
eq('missing values', determineShowList(ctx({
  order: [1, 2], lastActionPid: 1
})), [1, 2]);

// 14. All folded -> nobody shows.
eq('all folded', determineShowList(ctx({
  order: [1, 2], folded: new Set([1, 2]), lastActionPid: 1
})), []);

// 15. Tie behind a stronger level and no extra money -> mucks.
eq('tie below top mucks', determineShowList(ctx({
  order: [1, 2, 3], lastActionPid: 1,
  cardsValue: { 1: 200, 2: 400, 3: 200 },
  invested:   { 1: 50, 2: 50, 3: 50 }
})), [1, 2]);

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
