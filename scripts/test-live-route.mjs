/* test-live-route — /live (embedded spectator mode) wiring.
 *
 * Static assertions only: proxy.js is too large to import here, and the
 * properties we care about are structural. Checks that the route exists, that
 * the client HTML carries the boot placeholder, that live mode is excluded
 * from SEO and from service-worker registration, and that the framing header
 * is defined.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const proxy = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'public', 'pokerth-client.html'), 'utf8');

let failed = 0;
function check(name, cond) {
  if (cond) { console.log('  ok   ' + name); return; }
  console.log('  FAIL ' + name); failed++;
}

console.log('test-live-route');

check('/live route present', /reqPathOnly === '\/live'/.test(proxy));
check('/live serves the client with live=true', /sendClientHtml\(req, res, true\)/.test(proxy));
check('sendClientHtml takes the live flag', /function sendClientHtml\(req, res, live\)/.test(proxy));
check('live is excluded from SEO', /const on = !live && seoEnabled\(\)/.test(proxy));
check('live has its own cache key', /const key = \(live \? 'live:' : ''\)/.test(proxy));
check('LIVE_BOOT placeholder is substituted', /__LIVE_BOOT__-->', live \?/.test(proxy));
check('frame-ancestors constant defined', /LIVE_FRAME_ANCESTORS = "frame-ancestors 'self'/.test(proxy));
check('frame-ancestors sent only in live mode', /if \(live\) headers\['Content-Security-Policy'\] = LIVE_FRAME_ANCESTORS;/.test(proxy));
check('no X-Frame-Options header is set', !/['"]X-Frame-Options['"]/.test(proxy));

check('client HTML has exactly one LIVE_BOOT placeholder',
  (html.match(/<!--__LIVE_BOOT__-->/g) || []).length === 1);
check('LIVE_BOOT sits before the first <script>',
  html.indexOf('<!--__LIVE_BOOT__-->') < html.indexOf('<script'));
check('service worker is skipped in live mode',
  /if \('serviceWorker' in navigator && !window\.LIVE_MODE\)/.test(html));

// Version triple must stay in lockstep — three files, one value.
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const sw = /const CACHE_VERSION = 'pokerth-v([^']+)'/.exec(
  fs.readFileSync(path.join(root, 'public', 'sw.js'), 'utf8'));
const build = /window\.BUILD_VERSION='([^']+)'/.exec(
  fs.readFileSync(path.join(root, 'public', 'pokerth.js'), 'utf8'));
check('sw.js version matches package.json', sw && sw[1] === pkg);
check('BUILD_VERSION matches package.json', build && build[1] === pkg);

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
