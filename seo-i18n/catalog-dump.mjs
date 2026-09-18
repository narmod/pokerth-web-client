// Prints the client's assembled string table (LANG from
// public/modules/i18n.mjs, overlays included) as JSON on stdout.
// Usage: node seo-i18n/catalog-dump.mjs <publicDir>
//
// Run by seo-i18n/ssr.js in a child process, never imported by the proxy. The
// module is browser code: the minimal stand-ins below only have to survive its
// top level (legacy window.* aliases and the DOM-ready auto-init, which finds no
// nodes here). Nothing else in the client is loaded.
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';

const publicDir = resolve(process.argv[2] || fileURLToPath(new URL('../public', import.meta.url)));
const noop = () => {};

globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
globalThis.location = { search: '', hostname: '' };
try { if (!globalThis.navigator) globalThis.navigator = { language: 'en' }; } catch (e) {}
globalThis.document = {
  readyState: 'complete',
  documentElement: {},
  body: { appendChild: noop },
  querySelectorAll: () => [],
  getElementById: () => null,
  addEventListener: noop,
  removeEventListener: noop
};
// The module warns on a failed init; stdout must stay pure JSON.
console.log = console.warn = console.info = noop;

// The client loads catalogues on demand (English + the active language);
// the renderer needs them all. A client without loadAllLangs is the older
// all-static one, whose LANG is already complete.
const i18n = await import(pathToFileURL(join(publicDir, 'modules', 'i18n.mjs')).href);
if (typeof i18n.loadAllLangs === 'function') {
  const complete = await i18n.loadAllLangs();
  if (!complete) { process.stderr.write('catalog-dump: some catalogues failed to load\n'); process.exit(1); }
}
process.stdout.write(JSON.stringify(i18n.LANG));
