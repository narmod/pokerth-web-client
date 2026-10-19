#!/usr/bin/env node
// Admin tabs show what the server holds, without eating unsaved edits.
// Run: node scripts/test-admin-reload.mjs
//
// Three quiet failures this guards:
//  - a tab that loads once at login and then shows stale data (Deployment,
//    Access, Identity, Proxy, Defaults had no loader of their own);
//  - a Save that answers "Saved." while the form keeps showing values the
//    server trimmed or refused;
//  - a section left on "Loading…" for ever when its request fails.
// And the counterweight: /admin/status fills every settings tab at once, so a
// full re-read must never run over a card that holds an unsaved edit.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const admin = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'admin.html'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function body(name) {
  const head = admin.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let i = admin.indexOf('{', head), depth = 0;
  for (let j = i; j < admin.length; j++) {
    if (admin[j] === '{') depth++;
    else if (admin[j] === '}') { depth--; if (!depth) return admin.slice(i, j + 1); }
  }
  return '';
}

// ── Every settings tab reloads on opening ─────────────────────────────────
const sw = admin.slice(admin.indexOf("document.querySelectorAll('.tab').forEach(function(b){ b.addEventListener('click'"));
const handler = sw.slice(0, sw.indexOf('}); });'));
for (const t of ['deploy', 'backup', 'blocked', 'audit', 'identity', 'proxy', 'login', 'lobby', 'firstvisit', 'features', 'servers', 'server']) {
  ok(new RegExp("t==='" + t + "'").test(handler), 'opening "' + t + '" reloads its data');
}
ok(/t==='deploy'\)\{[^}]*loadUpdateLog\(\)[^}]*autoUpdLoad\(\)[^}]*loadDeploys\(\)/.test(handler), 'Deployment re-reads the action log, the auto-update state and the rollback list');

// ── Full re-reads respect unsaved edits ───────────────────────────────────
const fulls = [...admin.matchAll(/loadStatus\(true\)/g)].length;
ok(fulls === 1, 'a single unconditional full re-read is left (' + fulls + ')');
ok(/!cfgAnyDirty\(\)\) setTimeout\(function\(\)\{ loadStatus\(true\); \},250\)/.test(body('cfgAfterPost')), 'and it is the one after a save, only when no settings card holds an unsaved edit');
ok(/loadStatus\(!cfgAnyDirty\(\)\)/.test(body('loadServer')), 'Health & logs no longer wipes the other tabs\' unsaved edits');
ok(/cfgAfterPost\(path, r\.clone\(\)\)/.test(body('api')), 'every successful write goes through cfgAfterPost');
ok(/_NO_SAVE\.test\(path\)/.test(body('cfgAfterPost')), 'checks and probes do not count as a save');
ok(/cardDirty\(\$\('lsUrl'\)\)/.test(body('renderLiveStats')) && /cardDirty\(\$\('ceSec'\)\)/.test(body('renderCommunityEvents')),
  'saving the kill switches no longer resets the live-figures and community-events cards');
ok(/!cardDirty\(\$\('dbHost'\)\)/.test(body('loadDbConfig')), 'refreshing Traffic no longer resets unsaved database settings');

// ── No Loading… left behind ───────────────────────────────────────────────
ok(/\.empty/.test(body('loadFail')) && /Loading/.test(body('loadFail')), 'loadFail replaces the Loading… placeholders of a section');
for (const [fn, panel] of [['loadServers', 'panel-servers'], ['loadLanDir', 'panel-landir'], ['loadTraffic', 'panel-traffic'], ['loadSessions', 'panel-sessions']]) {
  ok(body(fn).includes("loadFail('" + panel + "'"), fn + ' clears its Loading… placeholders on failure');
}

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
