#!/usr/bin/env node
// Theme packages were retired in web.143 (public/themes/<id>/theme.json, the
// themes.json manifest, the admin « Theme » kind). This test loads the real
// modules/theme.mjs in a DOM and checks what a browser that still holds values
// from that era gets.
// Run: node scripts/test-theme-legacy.mjs   (needs jsdom)
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'https://example.org/', pretendToBeVisual: true });
const w = dom.window;
const fetched = [];
w.fetch = (url) => { fetched.push(String(url)); return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve([]), text: () => Promise.resolve('') }); };
w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
// Values a browser may still hold from the theme-package era.
w.localStorage.setItem('pth_buttons', 'casino-vert');
w.localStorage.setItem('pth_theme', 'my-old-theme');
w.localStorage.setItem('pth_theme_css', '--panel:#123456;--gold:#abcdef;');
w.document.documentElement.style.setProperty('--panel', '#123456');
for (const k of ['window', 'document', 'localStorage', 'navigator', 'location', 'getComputedStyle', 'matchMedia', 'fetch', 'HTMLElement', 'Node', 'Event', 'CustomEvent', 'MutationObserver', 'requestAnimationFrame']) {
  if (w[k] !== undefined) { try { globalThis[k] = typeof w[k] === 'function' && !/^[A-Z]/.test(k) ? w[k].bind(w) : w[k]; } catch (e) {} }
}
globalThis.requestAnimationFrame = globalThis.requestAnimationFrame || ((f) => setTimeout(f, 0));

const src = readFileSync(join(root, 'public', 'modules', 'theme.mjs'), 'utf8');
ok(!/\/themes\/themes\.json/.test(src), 'theme.mjs no longer asks for /themes/themes.json');
ok(!/_exportTheme|_zipStore|_advancedBlock|_pkgPresets|_palettePkgs/.test(src), 'the export block and package lists are gone');

let err = null;
try { await import(pathToFileURL(join(root, 'public', 'modules', 'theme.mjs')).href); } catch (e) { err = e; }
ok(!err, 'theme.mjs loads' + (err ? ': ' + err.message : ''));
await new Promise((r) => setTimeout(r, 50));
ok(!fetched.some((u) => /themes\.json/.test(u)), 'nothing fetches themes.json at boot (' + fetched.join(', ') + ')');

const st = w.document.documentElement.style;
// Same as web.142: the action buttons follow the table style, an old
// « casino-vert » buttons value changes nothing (measured on both builds).
ok(st.getPropertyValue('--btn-fold-img') === 'url(/table/pokerth-official-fs/actionFold.svg)', 'an old « casino-vert » buttons value is harmless: buttons follow the table, as before');
w.applyThemePreset('casino');
// The Green Casino table is a skinned table: its buttons and pucks come from
// /table/casino/ (measured identical on web.142).
ok(st.getPropertyValue('--btn-fold-img') === 'url(/table/casino/actionFold.svg)' && st.getPropertyValue('--puck-dealer') === 'url(/table/casino/dealerPuck.svg)',
  'the Green Casino table keeps its own buttons and pucks, as before');
ok(st.getPropertyValue('--panel') === '' && !w.localStorage.getItem('pth_theme_css'), 'an old package palette is cleared, inline and stored');
ok(typeof w.applyThemePreset === 'function', 'presets still apply');
w.applyThemePreset('pkg-my-old-theme');
ok(true, 'a retired pkg- preset id is a no-op, not an error');
w.applyThemePreset('casino');
ok(w.localStorage.getItem('pth_table') === 'casino', 'a built-in preset still works');

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
