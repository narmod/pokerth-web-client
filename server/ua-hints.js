'use strict';
// ═══════════════════════════════════════════════════════════════════
// Visitor environment, beyond the User-Agent tables of proxy.js
// (UA_OS / UA_BROWSER) — 2.1.10-web.257. Pure: no I/O, no clock;
// proxy.js stores the results as totals, scripts/test-ua-hints.mjs drives
// this module directly. Nothing new is asked of the client: both parts read
// headers every request already carries.
//
// 1. Client Hints. Chromium browsers send, on every HTTPS request and with
//    no opt-in, three low-entropy headers: Sec-CH-UA (brands), Sec-CH-UA-
//    Mobile and Sec-CH-UA-Platform. Their brand list names browsers whose
//    User-Agent is Chrome's own (Brave), so it refines a « Chrome » read
//    from the UA — and only that: a UA label that is already specific (In-
//    app, WebView, Samsung…) is kept. The platform only fills an OS the UA
//    left at « other ».
//
// 2. Major versions, read from the UA: « iOS 18 », « Android 14 »,
//    « Safari 18 », « Chrome 141 ». Kept where the UA still tells the truth:
//    Chromium's reduced UA freezes Android at 10 (« Android 10; K »), Windows
//    at NT 10.0 and macOS at 10_15_7, so those give no OS version. Since iOS
//    26 the iPhone UA keeps « OS 18_6 », but Safari's Version/ follows iOS:
//    the larger of the two is the iOS major.
// ═══════════════════════════════════════════════════════════════════

// A brand list longer than this is not one a browser sends.
const HINT_MAX = 512;

// Brand → the browser label of proxy.js UA_BROWSER. Chromium's own GREASE
// brand (« Not)A;Brand », « Not=A?Brand »…) and « Chromium » / « Google
// Chrome » name nothing more specific and are ignored.
const BRANDS = [
  [/^Brave$/i, 'Brave'],
  [/^Opera( GX)?$/i, 'Opera'],
  [/^Microsoft Edge$/i, 'Edge'],
  [/^(YaBrowser|Yandex)$/i, 'Yandex'],
  [/^Samsung Internet$/i, 'Samsung'],
  [/^Android WebView$/i, 'WebView'],
  [/^Vivaldi$/i, 'Vivaldi'],
  [/^DuckDuckGo$/i, 'DuckDuckGo'],
  [/^Whale$/i, 'Whale'],
];
// Sec-CH-UA-Platform → the OS label of proxy.js UA_OS.
const PLATFORMS = Object.freeze({
  windows: 'Windows', macos: 'macOS', android: 'Android', 'chrome os': 'ChromeOS',
  'chromium os': 'ChromeOS', linux: 'Linux', ios: 'iPhone',
});

function brands(header) {
  if (typeof header !== 'string' || !header || header.length > HINT_MAX) return [];
  const out = [], re = /"([^"]{1,64})"\s*;\s*v\s*=\s*"[^"]{0,32}"/g;
  let m, guard = 0;
  while ((m = re.exec(header)) && guard++ < 12) out.push(m[1].trim());
  return out;
}
function refineBrowser(br, secChUa) {
  if (br !== 'Chrome') return br;
  const list = brands(secChUa);
  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < BRANDS.length; j++) if (BRANDS[j][0].test(list[i])) return BRANDS[j][1];
  }
  return br;
}
function refineOs(os, secChUaPlatform) {
  if (os !== 'other' || typeof secChUaPlatform !== 'string' || secChUaPlatform.length > 40) return os;
  const p = secChUaPlatform.replace(/^"|"$/g, '').trim().toLowerCase();
  return PLATFORMS[p] || os;
}

// Browser label → where its own major version sits in the UA. A label not
// listed (In-app, Silk, Huawei…) gets no version: its number says little.
const BR_VER = {
  Chrome: /(?:Chrome|CriOS)\/(\d{1,4})\./,
  Edge: /(?:Edg|EdgA|EdgiOS|Edge)\/(\d{1,4})\./,
  Firefox: /(?:Firefox|FxiOS)\/(\d{1,4})\./,
  Opera: /(?:OPR|OPT|OPiOS)\/(\d{1,4})\./,
  Samsung: /SamsungBrowser\/(\d{1,4})\./,
  WebView: /Chrome\/(\d{1,4})\./,
  Brave: /Chrome\/(\d{1,4})\./,
  Yandex: /YaBrowser\/(\d{1,4})\./,
};

function iosMajor(ua) {
  const m = ua.match(/(?:iPhone|iPad|iPod)[^)]*? OS (\d{1,2})_/);
  if (!m) return 0;
  const v = ua.match(/Version\/(\d{1,2})\./);
  return Math.max(+m[1], v ? +v[1] : 0);
}

// { osv, brv }: strings, or null when the UA gives nothing trustworthy.
function versions(ua, os, br) {
  ua = String(ua || '');
  let osv = null, brv = null;
  if (os === 'iPhone' || os === 'iPad') {
    const n = iosMajor(ua);
    if (n) osv = 'iOS ' + n;
  } else if (os === 'Android') {
    // « Android 10; K » is Chromium's frozen value, not the device's.
    const m = ua.match(/Android (\d{1,2})(?:[.;)]|\s)/);
    if (m && !/Android 10; K\)/.test(ua)) osv = 'Android ' + m[1];
  }
  if (br === 'Safari') {
    // WebKit is the system's on iOS: an installed app or a Safari with no
    // Version/ token runs the iOS major. On macOS, Version/ alone.
    const v = ua.match(/Version\/(\d{1,2})\./);
    const n = v ? +v[1] : (os === 'iPhone' || os === 'iPad') ? iosMajor(ua) : 0;
    if (n) brv = 'Safari ' + n;
  } else if (BR_VER[br]) {
    const m = ua.match(BR_VER[br]);
    if (m) brv = br + ' ' + m[1];
  }
  return { osv: osv, brv: brv };
}

module.exports = { HINT_MAX, BRANDS, PLATFORMS, brands, refineBrowser, refineOs, versions };
