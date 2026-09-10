#!/usr/bin/env node
// /live is counted apart from the web client, in both places the admin reads.
// Run: node scripts/test-live-split.mjs
//
// A spectator watching the embedded view on pokerth.net is not a player opening
// the client. Before this, both landed under "pokerth.net": the traffic share
// and the live connection board could not tell them apart.
//   1. traffic: the connect beacon reports mode 'live', and proxy.js keeps it
//      in its own counter (per day, all time, CSV, DB mirror);
//   2. live board: sockets from /live carry &live=1, and /admin/sessions tags
//      each bridge and notice channel with it.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = p => readFileSync(join(root, p), 'utf8');
const proxy = R('proxy.js'), client = R('public/pokerth.js'), admin = R('public/admin.html');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function fn(src, name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let depth = 0;
  for (let j = src.indexOf('{', head); j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(head, j + 1); }
  }
  return '';
}

// -- 1. Traffic counters, run for real ------------------------------------
const modesLine = (proxy.match(/const VISIT_MODES = \[[^\]]*\];/) || [''])[0];
ok(/'live'/.test(modesLine), "VISIT_MODES accepts 'live'");
const run = new Function(
  modesLine + '\n' + fn(proxy, 'emptyVisitsStore') + '\n' + fn(proxy, 'visitDayKey') + '\n' +
  'let visitsStore = emptyVisitsStore();\nfunction pruneVisitDays() {}\nfunction saveVisitsSoon() {}\n' +
  fn(proxy, 'recordModeConnect') + '\n' + fn(proxy, 'visitWindow') + '\n' +
  "recordModeConnect('pokerthnet'); recordModeConnect('live'); recordModeConnect('live'); recordModeConnect('bogus');\n" +
  'return { store: visitsStore, today: visitWindow(1) };');
const r = run();
ok(r.store.allM.live === 2 && r.store.allM.pokerthnet === 1, 'all-time: two /live, one pokerth.net, kept apart');
ok(r.today.m.live === 2 && r.today.m.pokerthnet === 1, 'and the same split in the daily window');
ok(!('bogus' in r.store.allM), 'an unknown mode is still refused');
ok(/live: am\.live \|\| 0 \}; \}\)\(\) \}/.test(proxy), 'the summary returns the all-time /live count');
ok(/live: _am\.live \|\| 0 \};/.test(proxy), 'which survives a restart');
ok(/conn_offline,conn_live'\];/.test(proxy) && /m\.offline \|\| 0, m\.live \|\| 0\]\.join/.test(proxy), 'CSV export has a conn_live column, last so old readers keep their columns');
ok(/ALTER TABLE traffic_daily ADD COLUMN IF NOT EXISTS conn_live/.test(proxy), 'an existing DB mirror gains the column');
ok(/conn_live=VALUES\(conn_live\)/.test(proxy), 'and is written to');

// -- 1b. Client beacon ------------------------------------------------------
const cc = client.slice(client.indexOf('window._pthCountConnect = function'));
ok(/if \(window\.LIVE_MODE\) mode = 'live';/.test(cc.slice(0, 400)), "/live reports its connects as 'live'");
ok(/\['pokerthnet', 'lan', 'offline', 'live'\]\.indexOf\(mode\)/.test(cc.slice(0, 600)), 'and the client whitelist lets it through');

// -- 2. Live connections board ------------------------------------------
ok((client.match(/\(window\.LIVE_MODE \? '&live=1' : ''\)/g) || []).length === 2, 'both proxy URLs (bridge and notice channel) carry &live=1 on /live');
ok(/ws\._live = params\.get\('live'\) === '1';/.test(proxy), 'the proxy reads it');
ok(proxy.indexOf("ws._live = params.get('live')") < proxy.indexOf("if (params.get('notify') === '1')"), 'before the notice-channel branch returns');
ok(/S\.live = !!ws\._live;/.test(fn(proxy, '_attachWs')), 'a bridge follows the socket currently attached');
ok(/live: !!S\.live,/.test(fn(proxy, '_sessionsSnapshot')) && /live: !!c\._live,/.test(fn(proxy, '_sessionsSnapshot')), '/admin/sessions tags bridges and notice channels');
ok(!/_bcMode\s*=[^;\n]*_live/.test(proxy), 'broadcast targeting is left alone');
ok(/\['\/live \(spectators\)','live'\]/.test(admin), 'the traffic card has a /live row');
ok(/\(b\.live\?' \\u00b7 \/live':''\)/.test(admin) && /\(c\.live\?' \\u00b7 \/live':''\)/.test(admin), 'each /live row on the board is tagged');
ok(/web client, '\+l\+' \/live\)/.test(admin), 'and the board summary splits web client from /live');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
