#!/usr/bin/env node
// Deterministic tests for the browser / OS read from a User-Agent:
//   · proxy.js UA_OS / UA_BROWSER (Admin › Visitors, the environment counts);
//   · admin.html _seDev (the device label of Admin › Errors / sessions).
// Microsoft Edge signs Edg/ on a computer, EdgA/ on Android and EdgiOS/ on
// iPhone / iPad: the last two were counted as Chrome and Safari until
// 2.1.10-web.151. The other browsers must keep their label.
// 2.1.10-web.255: in-app browsers, the Android WebView, Yandex, UC, Huawei,
// Xiaomi, Silk, DuckDuckGo, Opera on iOS, the installed iPhone app, and the
// HarmonyOS / KaiOS / Smart TV / console / VR / BSD platforms.
// Run: node scripts/test-ua-browser.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const proxy = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'public', 'admin.html'), 'utf8');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + label);
  if (!cond) fails++;
}

// proxy.js: the two tables and the picker, evaluated on their own.
const grab = (re, what) => { const m = proxy.match(re); ok(!!m, what + ' found in proxy.js'); return m ? m[0] : ''; };
const src = grab(/^const UA_OS = \[[\s\S]*?^\];$/m, 'UA_OS') + '\n' +
  grab(/^const UA_BROWSER = \[[\s\S]*?^\];$/m, 'UA_BROWSER') + '\n' +
  grab(/^function _uaPick\(table, ua\) \{[\s\S]*?^\}$/m, '_uaPick');
const iDev = html.indexOf('var SE_UA_OS = [');
const iDevEnd = html.indexOf('\n  }\n', html.indexOf('function _seDev(ua){', iDev));
const fIs = html.match(/^ *function _seIsBot\(ua\)\{.*\}$/m);
const bot = html.match(/^ *var ERR_BOT_UA = (\/.*\/[a-z]*);$/m);
ok(iDev > 0 && iDevEnd > iDev && !!fIs && !!bot, 'SE_UA_OS / SE_UA_BROWSER, _seDev, _seIsBot and ERR_BOT_UA found in admin.html');
// One rule for the whole admin (web.256): the Errors / Sessions tables are the
// Visitors tables, entry for entry.
const tbl = (txt, re) => { const m = txt.match(re); return m ? m[1].replace(/\s+/g, '') : null; };
const pOs = tbl(proxy, /^const UA_OS = \[([\s\S]*?)^\];$/m), pBr = tbl(proxy, /^const UA_BROWSER = \[([\s\S]*?)^\];$/m);
const aOs = tbl(html, /^ *var SE_UA_OS = \[([\s\S]*?)^ *\];$/m), aBr = tbl(html, /^ *var SE_UA_BROWSER = \[([\s\S]*?)^ *\];$/m);
ok(!!pOs && pOs === aOs, 'admin SE_UA_OS is the same table as proxy UA_OS');
ok(!!pBr && pBr === aBr, 'admin SE_UA_BROWSER is the same table as proxy UA_BROWSER');
if (fails) { console.log('\nFAIL ' + fails); process.exit(1); }

const srv = new Function(src.replace(/^const /mg, 'var ') +
  '\nreturn { os: (ua) => _uaPick(UA_OS, ua), br: (ua) => _uaPick(UA_BROWSER, ua) };')();
const adm = new Function(bot[0] + '\n' + fIs[0] + '\n' + html.slice(iDev, iDevEnd + 4) + '\nreturn _seDev;')();

// [label, UA, proxy OS, proxy browser, admin label]
const CASES = [
  ['Edge Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
    'Windows', 'Edge', 'Windows · Edge'],
  ['Edge macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
    'macOS', 'Edge', 'Mac · Edge'],
  ['Edge Android', 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36 EdgA/141.0.0.0',
    'Android', 'Edge', 'Android · Edge'],
  ['Edge iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 EdgiOS/141.0.3537.70 Mobile/15E148 Safari/605.1.15',
    'iPhone', 'Edge', 'iPhone · Edge'],
  ['Edge iPad', 'Mozilla/5.0 (iPad; CPU OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 EdgiOS/141.0.3537.70 Mobile/15E148 Safari/605.1.15',
    'iPad', 'Edge', 'iPad · Edge'],
  ['Edge legacy (EdgeHTML)', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19045',
    'Windows', 'Edge', 'Windows · Edge'],
  ['Chrome Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    'Windows', 'Chrome', 'Windows · Chrome'],
  ['Chrome Android', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
    'Android', 'Chrome', 'Android · Chrome'],
  ['Safari iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1',
    'iPhone', 'Safari', 'iPhone · Safari'],
  ['Opera Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/124.0.0.0',
    'Windows', 'Opera', 'Windows · Opera'],
  ['Firefox Linux', 'Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0',
    'Linux', 'Firefox', 'Linux · Firefox'],
  ['Samsung Internet', 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36',
    'Android', 'Samsung', null],
  // -- web.255 --------------------------------------------------------------
  ['Installed app on iPhone (no Safari/ token)', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    'iPhone', 'Safari', null],
  ['Facebook in-app, iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/450.0.0.38.108]',
    'iPhone', 'In-app', null],
  ['Instagram in-app, iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 320.0.2.29.97',
    'iPhone', 'In-app', null],
  ['Google app, iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/310.0.620 Mobile/15E148 Safari/604.1',
    'iPhone', 'In-app', null],
  ['Facebook in-app, Android', 'Mozilla/5.0 (Linux; Android 14; SM-S918B Build/UP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/450.0.0.39.109;]',
    'Android', 'In-app', null],
  ['Android WebView', 'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.0.0 Mobile Safari/537.36',
    'Android', 'WebView', null],
  ['Opera, iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1 OPT/5.3.0',
    'iPhone', 'Opera', null],
  ['DuckDuckGo, iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Ddg/18.6 Safari/604.1',
    'iPhone', 'DuckDuckGo', null],
  ['Yandex, Android', 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 YaBrowser/24.7.5.82.00 SA/3 Mobile Safari/537.36',
    'Android', 'Yandex', null],
  ['UC, Android', 'Mozilla/5.0 (Linux; U; Android 12; en-US; SM-A125F) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/123.0 UCBrowser/13.6.8.1318 Mobile Safari/537.36',
    'Android', 'UC', null],
  ['Huawei Browser, Android', 'Mozilla/5.0 (Linux; Android 10; HMSCore 6.13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 HuaweiBrowser/14.0.6.302 Mobile Safari/537.36',
    'Android', 'Huawei', null],
  ['Xiaomi browser', 'Mozilla/5.0 (Linux; U; Android 13; 2201117TG) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/112.0 Mobile Safari/537.36 XiaoMi/MiuiBrowser/14.10.1-gn',
    'Android', 'Xiaomi', null],
  ['Silk, Kindle Fire', 'Mozilla/5.0 (Linux; Android 11; KFTRWI) AppleWebKit/537.36 (KHTML, like Gecko) Silk/128.3.1 like Chrome/128.0 Safari/537.36',
    'Android', 'Silk', null],
  ['HarmonyOS NEXT', 'Mozilla/5.0 (Phone; OpenHarmony 4.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 ArkWeb/4.1.6.1 Mobile HuaweiBrowser/5.0.4.300',
    'HarmonyOS', 'Huawei', null],
  ['KaiOS', 'Mozilla/5.0 (Mobile; LYF/F300B/LYF-F300B-001-01-15-130718-i;Android; rv:48.0) Gecko/48.0 Firefox/48.0 KAIOS/2.5',
    'KaiOS', 'Firefox', null],
  ['Samsung TV (Tizen)', 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/537.36 (KHTML, like Gecko) 85.0.4183.93/6.0 TV Safari/537.36',
    'Smart TV', 'Safari', null],
  ['LG TV (webOS)', 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 WebAppManager',
    'Smart TV', 'Chrome', null],
  ['Fire TV', 'Mozilla/5.0 (Linux; Android 9; AFTMM Build/PS7633) AppleWebKit/537.36 (KHTML, like Gecko) Silk/128.3.1 like Chrome/128.0 Safari/537.36',
    'Smart TV', 'Silk', null],
  ['PlayStation 5', 'Mozilla/5.0 (PlayStation; PlayStation 5/2.26) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15',
    'Console', 'Safari', null],
  ['Xbox', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox Series X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0 Safari/537.36 Edge/20.02',
    'Console', 'Edge', null],
  ['Meta Quest', 'Mozilla/5.0 (X11; Linux x86_64; Quest 3) AppleWebKit/537.36 (KHTML, like Gecko) OculusBrowser/34.0 SamsungBrowser/4.0 Chrome/126.0 VR Safari/537.36',
    'VR headset', 'Meta Quest', null],
  ['Firefox FreeBSD', 'Mozilla/5.0 (X11; FreeBSD amd64; rv:131.0) Gecko/20100101 Firefox/131.0',
    'BSD', 'Firefox', null],
  ['iPadOS Safari (signs Macintosh: stays macOS)', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
    'macOS', 'Safari', null],
  ['Safari macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15',
    'macOS', 'Safari', null],
  ['Chrome ChromeOS', 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    'ChromeOS', 'Chrome', null],
  ['Firefox Android', 'Mozilla/5.0 (Android 14; Mobile; rv:143.0) Gecko/143.0 Firefox/143.0',
    'Android', 'Firefox', null],
  ['Chrome iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.96 Mobile/15E148 Safari/604.1',
    'iPhone', 'Chrome', null],
];
for (const [label, ua, os, br, dev] of CASES) {
  ok(srv.os(ua) === os && srv.br(ua) === br, `visitors: ${label} → ${srv.os(ua)} / ${srv.br(ua)}`);
  const want = dev || [os === 'macOS' ? 'Mac' : os, br].filter((x) => x && x !== 'other').join(' · ');
  ok(adm(ua) === want, `admin label: ${label} → ${adm(ua)}`);
}
ok(srv.br('') === 'other' && adm('') === '', 'empty UA: « other » / no label');
ok(srv.os('') === 'other' && srv.os('curl/8.5.0') === 'other' && srv.br('curl/8.5.0') === 'other', 'a UA naming no platform stays « other »');
// The mobile / desktop split (cube, map) follows the new phone platforms.
const mob = proxy.match(/^const UA_MOBILE_OS = (\[.*\]);$/m);
ok(!!mob && ['iPhone', 'iPad', 'Android', 'HarmonyOS', 'KaiOS'].every((x) => mob[1].includes("'" + x + "'")), 'UA_MOBILE_OS lists the phone and tablet platforms');
ok((proxy.match(/UA_MOBILE_OS\.indexOf\(/g) || []).length === 2 && !/os === 'iPhone' \|\| os === 'iPad'/.test(proxy), 'the cube and the map both read it, no hand-written copy is left');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
