#!/usr/bin/env node
// Scheduled messages fire at the time the admin typed, and edited notices
// keep their other languages.
// Run: node scripts/test-broadcast-tz.mjs
//
// The proxy computes "Daily at 20:00" in its own time zone. The dashboard used
// to read the date fields (once, start, end, countdown) and show every time in
// the BROWSER's zone, labelled with the server's: from a browser in another
// zone the message went out hours off. Now the whole tab speaks server time.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const admin = readFileSync(join(root, 'public', 'admin.html'), 'utf8');
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function fn(src, name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let i = src.indexOf('{', head), depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(head, j + 1); }
  }
  return '';
}

// ── Dashboard: wall-clock time in the server's zone ───────────────────────
const ctx = { Intl, Date, Math };
vm.createContext(ctx);
vm.runInContext(['bcLocalTz', 'bcTz', 'bcTzOff', 'bcWall', 'bcFmt', 'bcZoneNote'].map(f => fn(admin, f)).join('\n') + '\nvar _bcTz="";', ctx);
const wall = (tz, v) => { ctx._bcTz = tz; return vm.runInContext('bcWall(' + JSON.stringify(v) + ')', ctx); };
ok(wall('Europe/Berlin', '2026-10-17T20:00') === Date.UTC(2026, 9, 17, 18, 0), '20:00 in Berlin (summer time) is 18:00 UTC');
ok(wall('America/New_York', '2026-10-17T20:00') === Date.UTC(2026, 9, 18, 0, 0), '20:00 in New York is midnight UTC, whatever the browser zone');
ok(wall('UTC', '2026-01-05T09:30') === Date.UTC(2026, 0, 5, 9, 30), 'UTC reads as is');
ok(wall('Europe/Berlin', '2026-01-05T09:30') === Date.UTC(2026, 0, 5, 8, 30), 'winter time is one hour less');
ok(wall('Europe/Berlin', '2026-03-29T03:30') === Date.UTC(2026, 2, 29, 1, 30), 'the day clocks go forward settles on the new offset');
ok(wall('Europe/Berlin', '') === 0, 'an empty field reads as nothing');
ctx._bcTz = 'Asia/Tokyo';
ok(/18 Oct 2026, 03:00/.test(vm.runInContext('bcFmt(' + Date.UTC(2026, 9, 17, 18, 0) + ')', ctx)), 'times are displayed in the server zone too');
ok(!/new Date\((?:v|sa|ea|cdv|ncd)\)\.getTime\(\)/.test(admin.replace(fn(admin, 'bcWall'), '')),
  'no date field of the tab is read in the browser zone any more (bcWall\'s own fallback aside)');
const list = fn(admin, 'loadBroadcasts');
ok(!/toLocaleString\(\)/.test(list) && /_bcTz=d\.tz/.test(list), 'the list shows server time and learns the zone from the server');

// ── Proxy: HH:MM validation ───────────────────────────────────────────────
const p = {}; vm.createContext(p); vm.runInContext(fn(proxy, '_parseHM'), p);
ok(vm.runInContext('_parseHM("23:59")', p)[1] === 59, '23:59 is a valid time');
ok(vm.runInContext('_parseHM("12:60")', p) === null, '12:60 is refused');

// ── Notices: an edited language does not drop the others ──────────────────
const q = {}; vm.createContext(q); vm.runInContext(fn(proxy, '_noticeWithDefaults'), q);
q.D = { en: { title: 'E', body: 'e' }, de: { title: 'D', body: 'd' }, es: { title: 'S', body: 's' } };
const none = vm.runInContext('_noticeWithDefaults({}, D)', q);
ok(none.def === 'en' && none.langs.de.title === 'D', 'nothing authored: the built-in languages, English fallback');
const one = vm.runInContext('_noticeWithDefaults({ "default": "fr", langs: { fr: { title: "F", body: "f" }, de: { title: "D2", body: "d2" } } }, D)', q);
ok(one.langs.fr.title === 'F' && one.langs.de.title === 'D2', 'authored languages are served');
ok(one.langs.en.title === 'E', 'and the languages left untouched keep their built-in text');
ok(one.def === 'fr', 'the operator\'s fallback language is kept');
ok(none.langs['es-419'] && none.langs['es-419'].title === 'S', 'Latin-American Spanish reads the Spanish text rather than a machine translation');

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
