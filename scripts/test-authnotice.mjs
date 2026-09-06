#!/usr/bin/env node
// Deterministic tests for the registered-account notice (operator-authored
// popup shown on every pokerth.net connection made WITH an account). The behaviour that matters and cannot
// be seen in a quick manual check: the client must NOT persist a seen-version
// (unlike the welcome message), the trigger must live at lobby entry, and the
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

// ── pokerth.js: client behaviour ──────────────────────────────────────────
const app = R('public', 'pokerth.js');
ok(/function maybeShowAuthNotice\(\)/.test(app), 'maybeShowAuthNotice exists');
ok(/function showAuthNoticeModal\(/.test(app), 'the account modal builder exists');
ok(/window\._authNoticeCfg = \(c && c\.authNotice\) \|\| null;/.test(app),
  'the /app-config handler stores the notice config');
// Every-connection semantics: the guest modal never writes a seen marker.
const gm = app.slice(app.indexOf('function showAuthNoticeModal('), app.indexOf('function maybeShowAuthNotice('));
ok(!/localStorage\.setItem/.test(gm), 'dismissing the account notice persists nothing');
const mg = app.slice(app.indexOf('function maybeShowAuthNotice('), app.indexOf('window.maybeShowAuthNotice'));
ok(!/localStorage/.test(mg), 'maybeShowAuthNotice reads no seen-version');
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
