#!/usr/bin/env node
// Deterministic guards for public/modules/journal.mjs — Logs window.
// Run: node scripts/test-journal.mjs
//
// Scope: the two invariants that are easy to break and expensive to notice.
//  1. Loading is lazy: the session list reads the 'meta' store only, and the
//     detail stores are read per selected session through a key range, so the
//     window opens in time proportional to the number of sessions, not to the
//     total number of hands ever stored.
//  2. Retention never removes the running session nor an imported one, and
//     offers the full set of durations.
// The DOM and IndexedDB layers are not exercised here; the module is a single
// self-contained file, so the source is read and asserted directly.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', 'public', 'modules', 'journal.mjs'), 'utf8');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// Body of a top-level function declaration (brace matching, good enough here).
function body(name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let i = src.indexOf('{', head), depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(i, j + 1); }
  }
  return '';
}

// ── 1. Lazy loading ───────────────────────────────────────────────────────
ok(!/\b_loadAll\b/.test(src), 'no global _loadAll() left');
ok(/async function _loadMetas\(/.test(src), '_loadMetas() exists');
ok(/async function _loadSession\(/.test(src), '_loadSession() exists');

const meta = body('_loadMetas');
ok(/transaction\(\['meta'\], 'readonly'\)/.test(meta), '_loadMetas reads the meta store only');
ok(!/games|players|hands|actions/.test(meta), '_loadMetas touches no detail store');

const one = body('_loadSession');
ok(/IDBKeyRange\.bound\(sid \+ ':', sid \+ ';', false, true\)/.test(one),
  '_loadSession bounds the range to the session prefix');
ok(/getAll\(range\)/.test(one), '_loadSession passes the range to getAll()');
ok(/DETAIL_STORES\.map\(get\)/.test(one), '_loadSession reads the four detail stores');
ok(/const DETAIL_STORES = \['games', 'players', 'hands', 'actions'\];/.test(src),
  'DETAIL_STORES excludes meta');

const reload = body('_reload');
ok(/_loadMetas\(\)/.test(reload) && !/_loadSession\(/.test(reload),
  '_reload() loads metas and defers the detail load');
ok(/_loadSelected\(\)/.test(reload), '_reload() hands over to _loadSelected()');

const sel = body('_loadSelected');
ok(/if \(sid !== _sel/.test(sel), '_loadSelected() drops a result made stale by a newer click');

// ── 2. Retention ──────────────────────────────────────────────────────────
const purge = body('purgeOldSessions');
ok(/const metas = await _loadMetas\(\);/.test(purge), 'purge reads metas only');
ok(/const cutoff = Date\.now\(\) - days \* 86400000;/.test(purge),
  'purge compares against a cutoff derived from the chosen duration');
ok(/sid\.match\(\/\^\(\\d\{4\}\)-\(\\d\{2\}\)-\(\\d\{2\}\)\//.test(body('_purgeable')),
  'the play date carried by the session id is used, not the import date');

for (const d of ['7', '30', '90', '180', '365']) {
  ok(src.includes('<option value="' + d + '">'), 'retention offers ' + d + ' days');
}
ok(src.includes('<option value="0">'), 'retention offers Forever');

ok(/sessionId: sid, imported: true/.test(src), 'the .pdb importer flags sessions as imported');

// ── 3. Session-count cap ──────────────────────────────────────────────────
const cand = body('_purgeable');
ok(/if \(!sid \|\| sid === cur\) continue;/.test(cand), 'the cap never targets the running session');
ok(/if \(m\.imported\) continue;/.test(cand), 'the cap never targets an imported session');
ok(/if \(!days && !max\) return;/.test(purge), 'purge runs when either setting is on');
ok(/kept\.slice\(max\)/.test(purge), 'the cap keeps exactly the newest max sessions');
ok(/sort\(\(a, b\) => \(a\.sid < b\.sid \? 1 : -1\)\)/.test(purge), 'the cap sorts newest first');
ok(/localStorage\.getItem\('pth_log_keep_max'/.test(body('_keepMax')), 'the cap has its own stored setting');
for (const c of ['20', '50', '100', '200']) {
  ok(src.includes('<option value="' + c + '">'), 'cap offers ' + c + ' logs');
}

// ── 4. Resizable session column ───────────────────────────────────────────
ok(/id="jr-split"[^']*role="separator"/.test(src), 'the splitter is exposed as a separator');
ok(/#jr-modal \.jr-split\{[^}]*cursor:col-resize/.test(src), 'the splitter shows a resize cursor');
ok(/@media \(max-width:599\.98px\)\{.*#jr-modal \.jr-split\{display:none\}/.test(src),
  'the splitter is hidden on the stacked mobile layout');
const setw = body('_setListW');
ok(/Math\.max\(LISTW_MIN/.test(setw) && /main\.clientWidth - PREVW_MIN/.test(setw),
  'the width is clamped between the list minimum and the preview minimum');
ok(/localStorage\.setItem\(LISTW_KEY/.test(setw), 'the chosen width is remembered');
const split = body('_initSplit');
ok(/setPointerCapture/.test(split), 'dragging captures the pointer');
ok(/ArrowLeft/.test(split) && /ArrowRight/.test(split), 'the splitter is keyboard operable');
ok(!/_applyListW\(\);\n  await purgeOldSessions/.test(src),
  'the width is not applied while the card is still hidden (clientWidth would be 0)');

// ── 5. Multi-select deletion ──────────────────────────────────────────────
ok(/id="jr-select"/.test(src), 'the Select\u2026 button is in the action bar');
const multi = body('_setMulti');
ok(/_marked\.clear\(\)/.test(multi) && /_anchor = null/.test(multi),
  'leaving the selection mode clears the ticks and the range anchor');
ok(/_multi = false; _anchor = null; _marked\.clear\(\);/.test(body('closeJournal')),
  'closing the window leaves the selection mode');
const range = body('_markRange');
ok(/Math\.min\(a, b\)/.test(range) && /Math\.max\(a, b\)/.test(range),
  'Shift + click ticks the whole range, whichever way it was dragged');
ok(/_anchor == null \? _sel : _anchor/.test(range),
  'the range starts at the last clicked entry, or at the previewed one');
const del = body('_delSelected');
ok(/if \(_multi && _marked\.size\)/.test(del), 'Delete removes the ticked batch when there is one');
ok((del.match(/confirm\(/g) || []).length === 2,
  'one confirmation for the batch, one for the single log \u2014 never one per entry');
ok(/for \(const sid of ids\) await _deleteSession\(sid\)/.test(del),
  'every ticked session is deleted');
ok(/_marked\.clear\(\)/.test(del), 'the ticks are dropped once the batch is gone');
const list = body('_renderList');
ok(/ev\.ctrlKey \|\| ev\.metaKey/.test(list) && /ev\.shiftKey/.test(list),
  'Ctrl/Cmd + click and Shift + click are honoured on the desktop');
ok(/alive\.has\(id\)/.test(list), 'ticks pointing at vanished sessions are dropped on redraw');
ok(/aria-checked/.test(list) && /role', 'checkbox'/.test(list),
  'entries expose their ticked state to assistive technology');
const sync = body('_syncSelBtns');
ok(/jrDeleteN/.test(sync) && /String\(n\)/.test(sync), 'the Delete button carries the count');
ok(/db\.disabled = _multi && !n/.test(sync), 'Delete is disabled while nothing is ticked');

const keys = body('_onListKey');
ok(/ArrowDown/.test(keys) && /ArrowUp/.test(keys), 'Up and Down move through the list');
ok(/ev\.ctrlKey \|\| ev\.metaKey \|\| ev\.altKey/.test(keys),
  'a modified arrow (Ctrl, Cmd, Alt) is left to the browser');
ok(/ev\.preventDefault\(\)/.test(keys), 'the arrows do not scroll the list underneath');
ok(/if \(ev\.shiftKey\)/.test(keys) && /_markRange\(sid\)/.test(keys),
  'Shift + arrow extends the selection, like Shift + click');
ok(/const a0 = ids\[from\]/.test(keys),
  'the range anchors on the focused entry, which is not always the previewed one');
ok(/_focusItem\(to\)/.test(keys), 'the focus follows the arrow across the redraw');
ok(/scrollIntoView/.test(body('_focusItem')), 'moving past the fold scrolls the entry into view');
ok(/jr-list'\)\.addEventListener\('keydown', _onListKey\)/.test(src),
  'the handler is wired once on the list, not per entry');

const en = readFileSync(join(here, '..', 'public', 'modules', 'lang', 'en.mjs'), 'utf8');
for (const k of ['jrSelect', 'jrSelectCancel', 'jrSelectHint', 'jrDeleteN', 'jrConfirmDeleteN']) {
  ok(new RegExp('\\b' + k + '\\s*:').test(en), 'en.mjs carries ' + k);
}

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
