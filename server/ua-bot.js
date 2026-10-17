'use strict';
// ═══════════════════════════════════════════════════════════════════
// One definition of "automation" for every count and every list
// ═══════════════════════════════════════════════════════════════════
// Traffic (the "Hide bots" filter), the language diagnostics and the client
// error list used to carry two different regular expressions. The broad one
// matched /bot/ anywhere, which also caught CUBOT, an Android phone brand with
// real players; the narrow one missed curl, python and the like. This module
// is the single rule, used by the proxy and sent to the dashboard as a flag.
//
// A User-Agent is automation when, once the known phone brands that contain
// "bot" are taken out, it names a crawler, a scripting client or a headless
// browser. navigator.webdriver (the `wd` field of a visit ping) is checked by
// the caller, it is not in the User-Agent.

// Phone brands whose name contains "bot". Removed before the test, never
// matched by it: no lookbehind, the same code runs in every Node version.
const PHONE_BRANDS = /cubot/gi;   // CUBOT P80, CUBOT_X30, KingKong CUBOT…
const UA_BOT = /bot|spider|crawl|slurp|curl|wget|python|java\/|go-http|node-fetch|axios|httpclient|headless|phantom|scrapy|libwww|okhttp|lighthouse|\+https?:\/\//i;

function isBotUA(ua) {
  const s = String(ua || '').replace(PHONE_BRANDS, '');
  return UA_BOT.test(s);
}

module.exports = { isBotUA, UA_BOT, PHONE_BRANDS };
