#!/usr/bin/env node
// Deterministic tests for the registered-account notice (operator-authored
// popup shown to pokerth.net account logins until they acknowledge it; the
// acknowledgement follows the account across devices via /prefs-web). The
// behaviour that matters and cannot be seen in a quick manual check: the
// acknowledged updatedAt must be persisted and respected, synced by numeric
// maximum, the trigger must live at lobby entry, and the
// proxy must expose the config through every path (admin GET/POST, public
// /app-config, export/import allow-list) or a config round-trip wipes it.
// Run: node scripts/test-authnotice.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const R = (...p) => readFileSync(join(here, '..', ...p), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// ── proxy.js: config plumbing ─────────────────────────────────────────────
const proxy = R('proxy.js');
ok(/function _authNoticeAdmin\(\)/.test(proxy), 'admin-side accessor exists');
ok(/function _authNoticePublic\(\)/.test(proxy), 'public accessor exists');
ok(/_authNoticePublic\(\); if \(!w \|\| !w\.enabled\) return null/.test(proxy) ||
   /_adminConfig\.authNotice; if \(!w \|\| !w\.enabled\) return null/.test(proxy),
  'the public accessor hides the notice while disabled');
ok((proxy.match(/authNotice: _authNoticeAdmin\(\)/g) || []).length === 2,
  'admin GET and admin POST responses both return guestNotice');
ok(/authNotice: _authNoticePublic\(\)/.test(proxy), '/app-config exposes guestNotice');
ok(/d\.authNotice && typeof d\.authNotice === 'object'/.test(proxy),
  'POST /admin/config accepts a guestNotice payload');
ok(/'guestNotice', 'authNotice',/.test(proxy),
  'export/import allow-list keeps guestNotice (no wipe on config round-trip)');
// Same size caps as the welcome message (title 200, body 4000, 60 languages).
const gwBlock = proxy.slice(proxy.indexOf("d.authNotice && typeof d.authNotice === 'object'"));
ok(/slice\(0, 200\)/.test(gwBlock.slice(0, 1200)) && /slice\(0, 4000\)/.test(gwBlock.slice(0, 1200)),
  'authNotice validation caps title/body like the welcome message');

// ── proxy.js: built-in English default text ───────────────────────────────
ok(/const AUTH_NOTICE_DEFAULT_LANGS = \{ en: \{ title: '/.test(proxy),
  'a built-in English default exists');
ok(/function _noticeWithDefaults\(/.test(proxy), 'the defaults overlay helper exists');
ok((proxy.match(/_noticeWithDefaults\(w, AUTH_NOTICE_DEFAULT_LANGS\)/g) || []).length === 2,
  'both the admin and the public accessor fall back to the built-in text');
// The overlay only fires while nothing is authored, and then serves 'en'.
ok(/if \(Object\.keys\(langs\)\.length\) return \{ langs: langs/.test(proxy),
  'operator-authored languages always win over the built-in text');
ok(/return \{ langs: defLangs, def: 'en' \}/.test(proxy),
  "the built-in text is served with an 'en' fallback language");

// ── pokerth.js: client behaviour ──────────────────────────────────────────
const app = R('public', 'pokerth.js');
ok(/function maybeShowAuthNotice\(\)/.test(app), 'maybeShowAuthNotice exists');
ok(/function showAuthNoticeModal\(/.test(app), 'the account modal builder exists');
ok(/window\._authNoticeCfg = \(c && c\.authNotice\) \|\| null;/.test(app),
  'the /app-config handler stores the notice config');
// Ack semantics: dismissing stores the acknowledged updatedAt locally AND
// syncs it to the account profile; the popup is skipped while the stored
// version covers the current one.
const gm = app.slice(app.indexOf('function showAuthNoticeModal('), app.indexOf('function maybeShowAuthNotice('));
ok(/localStorage\.setItem\('pth_authnotice_seen', String\(version\)\)/.test(gm),
  'dismissing stores the acknowledged version');
ok(/_cfgSyncPushSoon/.test(gm), 'dismissing schedules a profile sync push');
const mg = app.slice(app.indexOf('function maybeShowAuthNotice('), app.indexOf('window.maybeShowAuthNotice'));
ok(/pth_authnotice_seen/.test(mg) && />= \(Number\(g\.updatedAt\) \|\| 0\)\) return/.test(mg),
  'an acknowledged version silences the notice until the operator edits it');
// Profile sync wiring: collected, merged by numeric maximum, applied.
ok(/_NOTICE_SYNC_KEYS = \['pth_authnotice_seen'\]/.test(app), 'the ack key is a sync group');
ok(/function _noticeMergeIn\(/.test(app) && /Math\.max\(theirs, mine\)/.test(app.slice(app.indexOf('function _noticeMergeIn('), app.indexOf('function _noticeMergeIn(') + 900)),
  'reconciliation is a numeric maximum (seen somewhere = seen everywhere)');
ok(/_NOTICE_SYNC_KEYS\.forEach/.test(app), 'the ack key is collected for /prefs-web');
ok(/if \(_noticeMergeIn\(o\)\)/.test(app), 'the ack key is merged on /prefs-web apply');
ok(/_amAuthMode/.test(mg), 'the notice is gated on the pokerth.net ACCOUNT (auth) mode');
ok(/window\._offlineMode\) return/.test(mg), 'training mode never shows it');
ok(/_welcomeChoose\(g\)/.test(mg), 'language pick reuses the welcome chooser (fallback + exact flag)');
ok(/_translateEntry\(/.test(mg) && /_gtxAuto\(/.test(mg),
  'missing languages fall back to on-device then gtx translation');
ok(/getElementById\('authnotice-modal'\)/.test(mg),
  'the translated swap only lands while the account modal is still open');

// ── msg-lobby.mjs: trigger at lobby entry ─────────────────────────────────
const lobby = R('public', 'modules', 'net', 'msg-lobby.mjs');
const idxShow = lobby.indexOf("else show('s-lobby');");
ok(idxShow >= 0 && /maybeShowAuthNotice/.test(lobby.slice(idxShow, idxShow + 900)),
  'onInitAck fires the notice right after the lobby is shown');
const idxRejoin = lobby.indexOf('S._pendingRejoin = _rt;');
ok(idxRejoin >= 0 && idxRejoin < lobby.indexOf('maybeShowAuthNotice'),
  'the auto-rejoin early-return path stays above the trigger (no modal over a rejoin)');

// ── admin.html: editor ────────────────────────────────────────────────────
const adm = R('public', 'admin.html');
['awEnabled', 'awLang', 'awDefault', 'awTitle', 'awBody', 'awSave'].forEach(function (id) {
  ok(new RegExp('id="' + id + '"').test(adm), 'admin editor has #' + id);
});
ok(/authNotice:\{ enabled:\$\('awEnabled'\)\.checked/.test(adm),
  'the admin save posts the authNotice key');
ok(/loadAuthNotice\(\);/.test(adm), 'the broadcast tab loads the registered-account notice');
ok(/data-master="1">\s*<h2>Registered-account notice/.test(adm), 'the card is master-only');
ok(/DEFAULT_FOLDED = \[[^\]]*'Registered-account notice \(pokerth\.net internet mode\)'/.test(adm),
  'the card is folded by default');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
