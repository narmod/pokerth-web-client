#!/usr/bin/env node
// Deterministic tests for the browser / OS read from a User-Agent:
//   · proxy.js UA_OS / UA_BROWSER (Admin › Visitors, the environment counts);
//   · admin.html _seDev (the device label of Admin › Errors / sessions).
// Microsoft Edge signs Edg/ on a computer, EdgA/ on Android and EdgiOS/ on
// iPhone / iPad: the last two were counted as Chrome and Safari until
// 2.1.10-web.151. The other browsers must keep their label.
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
const iDev = html.indexOf('function _seDev(ua){');
const iDevEnd = html.indexOf('\n  }\n', iDev);
const fIs = html.match(/^ *function _seIsBot\(ua\)\{.*\}$/m);
const bot = html.match(/^ *var ERR_BOT_UA = (\/.*\/[a-z]*);$/m);
ok(iDev > 0 && iDevEnd > iDev && !!fIs && !!bot, '_seDev, _seIsBot and ERR_BOT_UA found in admin.html');
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
];
for (const [label, ua, os, br, dev] of CASES) {
  ok(srv.os(ua) === os && srv.br(ua) === br, `visitors: ${label} → ${srv.os(ua)} / ${srv.br(ua)}`);
  if (dev) ok(adm(ua) === dev, `admin label: ${label} → ${adm(ua)}`);
}
ok(srv.br('') === 'other' && adm('') === '', 'empty UA: « other » / no label');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
