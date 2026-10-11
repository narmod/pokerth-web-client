#!/usr/bin/env node
// Deterministic tests for the crawler filter of /clienterr (proxy.js).
// Run: node scripts/test-clienterr-bots.mjs
//
// Googlebot's renderer caches our scripts for days regardless of HTTP headers
// and then runs a fresh module next to a stale one, which floods the admin
// error list with errors no player ever sees. /clienterr drops reports whose
// User-Agent declares a crawler. The filter must never drop a real player:
// a plain /bot/i would match Android phones of the CUBOT brand.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + label);
  if (!cond) fails++;
}

const m = src.match(/^const ERR_BOT_UA = (\/.*\/[a-z]*);$/m);
ok(!!m, 'ERR_BOT_UA is still declared in proxy.js');
if (!m) { console.log('\nFAIL 1'); process.exit(1); }
const RE = (0, eval)(m[1]);

ok(/if \(_errIsBot\(req\.headers && req\.headers\['user-agent'\]\)\)/.test(src),
  '/clienterr checks the User-Agent before recording');
const iEnd = src.indexOf("reqPathOnly === '/clienterr'");
const iBot = src.indexOf('_errIsBot(req.headers', iEnd);
const iRec = src.indexOf('_errRecord(meta', iEnd);
ok(iEnd > 0 && iBot > iEnd && iRec > iBot, 'the crawler check runs before _errRecord');

const BOTS = {
  'Googlebot desktop': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/129.0.6668.89 Safari/537.36',
  'Googlebot smartphone': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.6668.89 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Bingbot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36',
  'YandexBot': 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
  'Applebot': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)',
  'HeadlessChrome': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36',
  'Lighthouse': 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse',
};
const PLAYERS = {
  'Windows Edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0',
  'Android Chrome': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  'Android CUBOT': 'Mozilla/5.0 (Linux; Android 12; CUBOT P60 Build/SP1A.210812.016) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  'Android CUBOT (no Build)': 'Mozilla/5.0 (Linux; Android 13; CUBOT KINGKONG 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  'iPhone Safari': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
  'Firefox iOS': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/131.0 Mobile/15E148 Safari/605.1.15',
  'Linux Firefox': 'Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0',
  'Samsung Internet': 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36',
  'Empty UA': '',
};
for (const [k, ua] of Object.entries(BOTS)) ok(RE.test(ua), 'crawler dropped: ' + k);
for (const [k, ua] of Object.entries(PLAYERS)) ok(!RE.test(ua), 'player kept: ' + k);

console.log(fails ? '\nFAIL ' + fails : '\nOK');
process.exit(fails ? 1 : 0);
