#!/usr/bin/env node
// Deterministic tests for the crawler tag of the admin error list (admin.html).
// Run: node scripts/test-clienterr-bots.mjs
//
// Googlebot's renderer caches our scripts for days regardless of HTTP headers
// and then runs a fresh module next to a stale one, which floods the admin
// error list with errors no player ever sees. Those errors are still recorded
// (/clienterr keeps everything) but the admin labels a crawler User-Agent
// « Bot (name) ». The tag must never land on a real player: a plain /bot/i
// would match Android phones of the CUBOT brand.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html = fs.readFileSync(path.join(root, 'public', 'admin.html'), 'utf8');
const proxy = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  \u2713 ' : '  \u2717 ') + label);
  if (!cond) fails++;
}

const m = html.match(/^ *var ERR_BOT_UA = (\/.*\/[a-z]*);$/m);
const fIs = html.match(/^ *function _seIsBot\(ua\)\{.*\}$/m);
// From the UA tables on (web.256: _seDev reads SE_UA_OS / SE_UA_BROWSER).
const iDev = html.indexOf('var SE_UA_OS = [');
const iDevEnd = html.indexOf('\n  }\n', html.indexOf('function _seDev(ua){', iDev));
ok(!!m && !!fIs && iDev > 0 && iDevEnd > iDev, 'ERR_BOT_UA, _seIsBot and _seDev are still in admin.html');
if (!m || !fIs || iDev < 0) { console.log('\nFAIL ' + fails); process.exit(1); }
const api = new Function(m[0] + '\n' + fIs[0] + '\n' + html.slice(iDev, iDevEnd + 4) +
  '\nreturn { isBot: _seIsBot, dev: _seDev };')();

ok(!/ERR_BOT_UA|_errIsBot/.test(proxy), '/clienterr still records every report (no crawler drop in proxy.js)');
// Since web.116 the proxy counts robots with the shared rule (server/ua-bot.js)
// and sends the figure; the page only counts itself for an older proxy.
ok(/var nBot=\(typeof e\.bots==='number'\)\?e\.bots:\(e\.uas\|\|\[\]\)\.filter\(_seIsBot\)/.test(html), 'each error line counts its crawler UAs');

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
for (const [k, ua] of Object.entries(BOTS)) ok(api.isBot(ua) && /^Bot/.test(api.dev(ua)), 'crawler tagged: ' + k + ' \u2192 ' + api.dev(ua));
for (const [k, ua] of Object.entries(PLAYERS)) ok(!api.isBot(ua) && !/Bot/.test(api.dev(ua)), 'player not tagged: ' + k + (ua ? ' \u2192 ' + api.dev(ua) : ''));
ok(api.dev(BOTS['Googlebot desktop']) === 'Bot (Googlebot)', 'Googlebot desktop reads « Bot (Googlebot) »');
ok(/^Android( \d+)? \u00b7 Chrome \d+$/.test(api.dev(PLAYERS['Android CUBOT'])), 'CUBOT phone reads « Android · Chrome N » (web.258: versions) \u2192 ' + api.dev(PLAYERS['Android CUBOT']));

console.log(fails ? '\nFAIL ' + fails : '\nOK');
process.exit(fails ? 1 : 0);
