#!/usr/bin/env node
// Deterministic tests for the guest notice (operator-authored popup shown to
// pokerth.net guests until they acknowledge it). The behaviour that matters
// and cannot be seen in a quick manual check: the acknowledged updatedAt must
// be persisted (locally only — guests have no profile) and respected, the
// trigger must live at lobby entry, and the proxy must expose the config
// through every path (admin GET/POST, public /app-config, export/import
// allow-list) or a config round-trip wipes it.
// Run: node scripts/test-guestnotice.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const R = (...p) => readFileSync(join(here, '..', ...p), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// ── proxy.js: config plumbing ─────────────────────────────────────────────
const proxy = R('proxy.js');
ok(/function _guestNoticeAdmin\(\)/.test(proxy), 'admin-side accessor exists');
ok(/function _guestNoticePublic\(\)/.test(proxy), 'public accessor exists');
ok(/_guestNoticePublic\(\); if \(!w \|\| !w\.enabled\) return null/.test(proxy) ||
   /_adminConfig\.guestNotice; if \(!w \|\| !w\.enabled\) return null/.test(proxy),
  'the public accessor hides the notice while disabled');
ok((proxy.match(/guestNotice: _guestNoticeAdmin\(\)/g) || []).length === 2,
  'admin GET and admin POST responses both return guestNotice');
ok(/guestNotice: _guestNoticePublic\(\)/.test(proxy), '/app-config exposes guestNotice');
ok(/d\.guestNotice && typeof d\.guestNotice === 'object'/.test(proxy),
  'POST /admin/config accepts a guestNotice payload');
ok(/'welcome', 'guestNotice',/.test(proxy),
  'export/import allow-list keeps guestNotice (no wipe on config round-trip)');
// Same size caps as the welcome message (title 200, body 4000, 60 languages).
const gwBlock = proxy.slice(proxy.indexOf("d.guestNotice && typeof d.guestNotice === 'object'"));
ok(/slice\(0, 200\)/.test(gwBlock.slice(0, 1200)) && /slice\(0, 4000\)/.test(gwBlock.slice(0, 1200)),
  'guestNotice validation caps title/body like the welcome message');

// ── proxy.js: built-in English default text ───────────────────────────────
ok(/const GUEST_NOTICE_DEFAULT_LANGS = \{\n  "en": \{ title: "/.test(proxy),
  'a built-in default exists, English first');
// All 45 client languages are hand-written in the defaults, so an exact
// language match on the client means no machine translation at all.
{
  const m = proxy.match(/const GUEST_NOTICE_DEFAULT_LANGS = (\{[\s\S]*?\n\});/);
  let langCount = 0;
  try { langCount = Object.keys(JSON.parse(m[1].replace(/\n  ("[^"]+"): \{ title: /g, '\n  $1: { "title": ').replace(/, body: /g, ', "body": '))).length; } catch (e) {}
  ok(langCount === 45, 'the built-in default covers all 45 client languages (got ' + langCount + ')');
}
ok(/function _stripDefaultNoticeLangs\(/.test(proxy) &&
   /_stripDefaultNoticeLangs\((?:gout, GUEST|aout, AUTH)_NOTICE_DEFAULT_LANGS\)/.test(proxy),
  'a language saved verbatim identical to its default is dropped (no more frozen text)');
ok(/function _noticeWithDefaults\(/.test(proxy), 'the defaults overlay helper exists');
ok((proxy.match(/_noticeWithDefaults\(w, GUEST_NOTICE_DEFAULT_LANGS\)/g) || []).length === 2,
  'both the admin and the public accessor fall back to the built-in text');
// The overlay only fires while nothing is authored, and then serves 'en'.
ok(/if \(Object\.keys\(langs\)\.length\) return \{ langs: langs/.test(proxy),
  'operator-authored languages always win over the built-in text');
ok(/return \{ langs: defLangs, def: 'en' \}/.test(proxy),
  "the built-in text is served with an 'en' fallback language");

// ── pokerth.js: client behaviour ──────────────────────────────────────────
const app = R('public', 'pokerth.js');
ok(/function maybeShowGuestNotice\(\)/.test(app), 'maybeShowGuestNotice exists');
ok(/function showGuestNoticeModal\(/.test(app), 'the guest modal builder exists');
ok(/window\._guestNoticeCfg = \(c && c\.guestNotice\) \|\| null;/.test(app),
  'the /app-config handler stores the notice config');
// Ack semantics: dismissing stores the acknowledged updatedAt locally, and
// the popup is skipped while the stored version covers the current one.
const gm = app.slice(app.indexOf('function showGuestNoticeModal('), app.indexOf('function maybeShowGuestNotice('));
ok(/localStorage\.setItem\('pth_guestnotice_seen', String\(version\)\)/.test(gm),
  'dismissing stores the acknowledged version');
const mg = app.slice(app.indexOf('function maybeShowGuestNotice('), app.indexOf('window.maybeShowGuestNotice'));
ok(/pth_guestnotice_seen/.test(mg) && />= \(Number\(g\.updatedAt\) \|\| 0\)\) return/.test(mg),
  'an acknowledged version silences the notice until the operator edits it');
ok(!/_NOTICE_SYNC_KEYS = \['pth_guestnotice_seen'/.test(app),
  'the guest ack stays local (guests have no profile to sync to)');
ok(/_amGuestMode/.test(mg), 'the notice is gated on the pokerth.net GUEST mode');
ok(/window\._offlineMode\) return/.test(mg), 'training mode never shows it');
ok(/_welcomeChoose\(g\)/.test(mg), 'language pick reuses the welcome chooser (fallback + exact flag)');
ok(/_translateEntry\(/.test(mg) && /_gtxAuto\(/.test(mg),
  'missing languages fall back to on-device then gtx translation');
ok(/getElementById\('guestnotice-modal'\)/.test(mg),
  'the translated swap only lands while the guest modal is still open');

// ── msg-lobby.mjs: trigger at lobby entry ─────────────────────────────────
const lobby = R('public', 'modules', 'net', 'msg-lobby.mjs');
const idxShow = lobby.indexOf("else show('s-lobby');");
ok(idxShow >= 0 && /maybeShowGuestNotice/.test(lobby.slice(idxShow, idxShow + 500)),
  'onInitAck fires the notice right after the lobby is shown');
const idxRejoin = lobby.indexOf('S._pendingRejoin = _rt;');
ok(idxRejoin >= 0 && idxRejoin < lobby.indexOf('maybeShowGuestNotice'),
  'the auto-rejoin early-return path stays above the trigger (no modal over a rejoin)');

// ── admin.html: editor ────────────────────────────────────────────────────
const adm = R('public', 'admin.html');
['gwEnabled', 'gwLang', 'gwDefault', 'gwTitle', 'gwBody', 'gwSave'].forEach(function (id) {
  ok(new RegExp('id="' + id + '"').test(adm), 'admin editor has #' + id);
});
ok(/guestNotice:\{ enabled:\$\('gwEnabled'\)\.checked/.test(adm),
  'the admin save posts the guestNotice key');
ok(/loadGuestNotice\(\);/.test(adm), 'the broadcast tab loads the guest notice');
ok(/data-master="1">\s*<h2>Guest notice/.test(adm), 'the card is master-only');
ok(/DEFAULT_FOLDED = \[[^\]]*'Guest notice \(pokerth\.net internet mode\)'/.test(adm),
  'the card is folded by default');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
