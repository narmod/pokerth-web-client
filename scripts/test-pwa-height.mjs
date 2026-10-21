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

// web.249: the full-screen layers (About, privacy, splash, dialogs, lobby
// drawers) follow the same height on an iPhone home-screen app. Emulated: an
// iPhone whose viewport is 34 px short of its screen.
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'pokerth.css'), 'utf8');
ok(/:root\[data-pwa-iphone="1"\] :is\(#boot-splash, #about-page, #privacy-page,[\s\S]*?\) \{\s*bottom: auto; height: var\(--app-h, 100dvh\);/.test(css), 'iPhone app: full-screen layers take --app-h');
ok(/d\.setAttribute\('data-pwa-iphone', '1'\)/.test(html), 'the flag is set for an iPhone home-screen app only');
{
  const { chromium, devices } = await import('playwright');
  const { spawn } = await import('node:child_process');
  const { mkdtempSync, writeFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const tmp = mkdtempSync(join(tmpdir(), 'pth-ph-'));
  writeFileSync(join(tmp, 'admin-config.json'), '{}');
  const PORT = 18000 + Math.floor(Math.random() * 900);
  const child = spawn(process.execPath, [join(root, 'proxy.js'), '--notls', String(PORT)], {
    env: Object.assign({}, process.env, { ADMIN_CONFIG_FILE: join(tmp, 'admin-config.json'), VISITS_FILE: join(tmp, 'visits.json'), NO_PROXY: '*' }), stdio: 'ignore' });
  const b = await chromium.launch();
  try {
    await new Promise((r) => setTimeout(r, 2500));
    const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 810 }, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { Object.defineProperty(navigator, 'standalone', { get: () => true }); Object.defineProperty(screen, 'height', { get: () => 844 }); Object.defineProperty(screen, 'width', { get: () => 390 }); });
    const p = await ctx.newPage();
    await p.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    for (let i = 0; i < 40; i++) { try { await p.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded' }); break; } catch (e) { await new Promise((r) => setTimeout(r, 250)); } }
    await p.waitForTimeout(2500);
    const r = await p.evaluate(() => { window.openAboutPage(); const d = document.documentElement;
      return { flag: d.dataset.pwaIphone, appH: d.style.getPropertyValue('--app-h'), screen: Math.round(document.querySelector('.screen.active').getBoundingClientRect().bottom),
        about: Math.round(document.getElementById('about-page').getBoundingClientRect().bottom) }; });
    ok(r.flag === '1' && r.appH === '844px', `emulated iPhone app, viewport 810 / screen 844: --app-h ${r.appH}`);
    ok(r.screen === 844 && r.about === 844, `the login screen and the About page reach the bottom (${r.screen}, ${r.about})`);
  } finally { await b.close(); child.kill(); rmSync(tmp, { recursive: true, force: true }); }
}
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
