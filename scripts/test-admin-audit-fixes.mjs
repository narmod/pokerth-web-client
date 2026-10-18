#!/usr/bin/env node
// Admin audit of 2026-10-18: guards for the faults it found.
// Run: node scripts/test-admin-audit-fixes.mjs
//
// · phone header: the game-server strip covered the page title and pushed the
//   page 8 px past the right edge (painted with an inline display, so the
//   stylesheet rule meant to hide it never applied);
// · « Update available <sha> » kept naming the commit of the first check after
//   a deploy, and auto-update never re-read the upstream while it waited;
// · /live spectator rows: the chosen period landed after « Last 30 days »;
// · bar rows on a phone squeezed a source name to « Campaign · ... »;
// · a folded card's fields stayed reachable with Tab.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const admin = readFileSync(join(root, 'public', 'admin.html'), 'utf8');
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
const OV = await import(join(root, 'public', 'modules', 'admin', 'overview.mjs'));
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function body(src, name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let i = src.indexOf('{', head), depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(i, j + 1); }
  }
  return '';
}

// ── Phone header ──────────────────────────────────────────────────────────
const narrow = (admin.match(/@media\(max-width:899px\)\{[\s\S]*?\n  \}/g) || []).join('\n');
const small = (admin.match(/@media\(max-width:600px\)\{[\s\S]*?\n  \}/g) || []).join('\n');
ok(/\.main \.top\{[^}]*flex-wrap:wrap/.test(narrow), 'on a phone or tablet the header row may wrap');
ok(/\.main \.top>\.tophd\{[^}]*min-width:8rem/.test(narrow), 'the page title keeps room for itself');
ok(/\.main \.top \.toplive\{[^}]*max-width:100%/.test(narrow), 'the game-server strip never runs wider than the screen');
ok(!/\.toplive\{display:none\}/.test(small), 'no dead rule pretends to hide the strip (its display is inline)');

// ── Update announcement ───────────────────────────────────────────────────
const recheck = body(proxy, '_updRecheckSoon');
ok(/_upd\.available = false/.test(recheck) && /updateCheck\(\)/.test(recheck), 'a deploy forgets the old reading, then reads the upstream again');
const nr = proxy.slice(proxy.indexOf("reqPathOnly === '/admin/update-nr'"), proxy.indexOf("reqPathOnly === '/admin/update-check'"));
ok(/if \(started\) _updRecheckSoon\(\);/.test(nr), 'Update (no restart) refreshes the reading');
ok(/if \(started && !restart\) _updRecheckSoon\(\);/.test(proxy), 'a static roll-back refreshes the reading');
ok(/_updRecheckSoon\(\);\s+\/\/ relu une fois git passé/.test(body(proxy, '_autoUpdateApply')), 'an automatic static deploy refreshes the reading');
const tick = body(proxy, 'autoUpdateTick');
ok(!/if \(_upd\.available\) return _autoUpdateApply\(\);/.test(tick) && /AUTO_UPDATE_POLL_MS\) return _upd\.available \? _autoUpdateApply\(\)/.test(tick),
  'a pending update no longer freezes the upstream reading');
const st = proxy.slice(proxy.indexOf("reqPathOnly === '/admin/status'"), proxy.indexOf("reqPathOnly === '/admin/status'") + 1500);
ok(/_upd\.checkedAt && !_upd\.checking && Date\.now\(\) - _upd\.checkedAt >= AUTO_UPDATE_POLL_MS\) updateCheck\(\)/.test(st),
  'an open dashboard keeps an existing reading fresh, never starts a first one');
const T = 1e12;
const a = OV.alertsFrom({ now: T, status: { ok: true, version: 'a', runningVersion: 'a', update: { available: true, remote: '96171c8090', needsRestart: true, checkedAt: T - 3 * 3600000 } }, landir: { ok: true, pending: [] }, errors: { ok: true, groups: [] } });
ok(a.some((x) => x.title === 'Update available' && /checked 3 h ago/.test(x.sub)), 'the announcement says how old its reading is (' + (a[0] && a[0].sub) + ')');

// ── /live spectator rows ─────────────────────────────────────────────────
const live = admin.slice(admin.indexOf("var lvx=$('trafLive')"), admin.indexOf("var lvx=$('trafLive')") + 900);
ok(/lrows\.sort\(function\(a,b\)\{ return a\[0\]-b\[0\]; \}\)/.test(live) && live.indexOf('lrows.sort') < live.indexOf("lrows.push(['All time'"),
  'shortest window first, All time last');

// ── Bar rows on a phone ──────────────────────────────────────────────────
ok(/\.envrow \.nmx\{flex:1 1 0;min-width:min\(100%,11em\)\}/.test(small), 'a source name keeps 11em before its counts wrap');

// ── Folded cards ─────────────────────────────────────────────────────────
ok(/\.card-body\.folded\{visibility:hidden;/.test(admin), 'a folded body is hidden from focus once folded');
ok(/body\.classList\.toggle\('folded', f\)/.test(admin) && /h2\.setAttribute\('aria-expanded'/.test(admin), 'folding sets the class and aria-expanded');
ok(!/body\.inert/.test(admin), 'not inert: scripted clicks inside folded cards keep working');

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
