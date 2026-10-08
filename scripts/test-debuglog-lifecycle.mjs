#!/usr/bin/env node
// Page lifecycle lines in the debug log (public/modules/ui/debuglog.mjs).
// Run: node scripts/test-debuglog-lifecycle.mjs
//
// A drop from a running game is only explainable from the player's side if
// the log says how the page started, how the previous one ended, and when
// it went to the background. These lines must also be on disk at once: the
// page may be killed right after going hidden.
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.test/' });
for (const k of ['window', 'document', 'localStorage', 'performance'])
  { try { globalThis[k] = dom.window[k]; } catch (e) {} }
try { Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'test-agent' }, configurable: true }); } catch (e) {}
let vis = 'visible';
Object.defineProperty(document, 'visibilityState', { get: () => vis, configurable: true });
// The previous page was last seen in the foreground and never unloaded.
localStorage.setItem('pth_dbg_life', 'visible ' + (Date.now() - 30000));
window.BUILD_VERSION = 'test-build';
const D = await import('../public/modules/ui/debuglog.mjs');
await new Promise((r) => setTimeout(r, 50));

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const saved = () => localStorage.getItem('pth_debuglog') || '';
const life = () => (localStorage.getItem('pth_dbg_life') || '').split(' ')[0];

ok(/\[page\] .*previous page ended in the foreground without closing \(crash or forced stop\), last change 30 s ago/.test(D.debugLogTail()),
   'start line reports a previous page that died in the foreground');
ok(life() === 'visible', 'this page is now recorded as visible');

vis = 'hidden'; document.dispatchEvent(new dom.window.Event('visibilitychange'));
ok(/\[page\] hidden \(background\)/.test(saved()), 'going to the background is logged and already on disk');
ok(life() === 'hidden', 'state hidden recorded');

vis = 'visible'; document.dispatchEvent(new dom.window.Event('visibilitychange'));
ok(/\[page\] visible again after \d+ s/.test(D.debugLogTail()), 'coming back is logged with the time away');

window.dispatchEvent(new dom.window.Event('offline'));
ok(/\[page\] network offline/.test(saved()), 'offline is logged and on disk');

window.dispatchEvent(new dom.window.Event('pagehide'));
ok(/\[page\] unloading/.test(saved()), 'unload is logged and on disk');
ok(life() === 'closed', 'state closed recorded: the next start will report a normal close');

console.log((fail ? 'FAIL ' : 'PASS ') + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
