#!/usr/bin/env node
// Installed app on iPhone: the height correction of the --app-h script in
// pokerth-client.html (web.248). Loaded by a navigation or a reload (« Play
// now » from a guide page, the « new version » reload) iOS can report a
// viewport short by the home-indicator inset and keep it: a band under the
// login screen. On an iPhone the app window is the screen, so fullH() takes
// the screen size in layout pixels — only for a gap the size of that inset,
// only on an iPhone home-screen app. Evaluated here on fake environments.
// Run: node scripts/test-pwa-height.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'pokerth-client.html'), 'utf8');
const src = html.slice(html.indexOf('    function fullH(h) {'), html.indexOf('    function setH() {'));
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); };
ok(src.length > 100 && /Math\.round\(fullH\(h\)\)/.test(html) && /h = fullH\(\(window\.visualViewport/.test(html), 'setH() and the band camouflage both go through fullH()');
const run = (env, h) => new Function('navigator', 'screen', 'window', 'mm', src + '\nreturn fullH(' + h + ');')(
  { standalone: env.st, userAgent: env.ua }, { width: env.sw, height: env.sh }, { innerWidth: env.iw, innerHeight: env.ih },
  (q) => ({ matches: /portrait/.test(q) ? env.ih >= env.iw : false }));
const IP = { st: true, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', sw: 393, sh: 852 };
ok(run({ ...IP, iw: 393, ih: 818 }, 818) === 852, 'iPhone portrait, 34 px short: the screen height');
ok(run({ ...IP, iw: 393, ih: 852 }, 852) === 852, 'iPhone portrait, right height: unchanged');
ok(run({ ...IP, iw: 852, ih: 372 }, 372) === 393, 'iPhone landscape, 21 px short: the screen height');
ok(run({ ...IP, iw: 393, ih: 500 }, 500) === 500, 'a large gap (keyboard, anything else) is left alone');
ok(run({ st: true, ua: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)', sw: 820, sh: 1180, iw: 820, ih: 1146 }, 1146) === 1146, 'iPad (windowed apps): unchanged');
ok(run({ st: undefined, ua: 'Mozilla/5.0 (Linux; Android 14)', sw: 412, sh: 915, iw: 412, ih: 880 }, 880) === 880, 'Android: unchanged');
ok(run({ ...IP, st: false, iw: 393, ih: 700 }, 700) === 700, 'iPhone Safari tab (not installed): unchanged');
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
