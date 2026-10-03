#!/usr/bin/env node
// Deterministic guards for the visitor-language parsing and the diagnostic
// behind the "other" bucket (server/lang-stats.js).
// Run: node scripts/test-lang-stats.mjs
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const L = require(join(root, 'server', 'lang-stats.js'));
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
const admin = readFileSync(join(root, 'public', 'admin.html'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function is(h, lang, locale, raw) {
  const p = L.parse(h);
  const want = { lang, locale: locale === undefined ? null : locale, raw: raw === undefined ? null : raw };
  ok(p.lang === want.lang && p.locale === want.locale && p.raw === want.raw,
    JSON.stringify(h) + ' → ' + JSON.stringify(want) + (p.lang === want.lang && p.locale === want.locale && p.raw === want.raw ? '' : '  (got ' + JSON.stringify(p) + ')'));
}

// -- Regional forms reduce to the base language, the locale keeps them -------
is('fr-FR', 'fr', 'fr-FR');
is('fr-CA', 'fr', 'fr-CA');
is('fr_CA', 'fr', 'fr-CA');
is('pt-BR', 'pt', 'pt-BR');
is('pt-PT', 'pt', 'pt-PT');
is('en-US', 'en', 'en-US');
is('en-GB', 'en', 'en-GB');
is('zh-CN', 'zh', 'zh-CN');
is('zh-TW', 'zh', 'zh-TW');
is('zh-HK', 'zh', 'zh-HK');
is('zh-Hans-CN', 'zh', 'zh-Hans-CN');
is('zh_Hant_TW', 'zh', 'zh-Hant-TW');
is('es-ES', 'es', 'es-ES');
is('es-MX', 'es', 'es-MX');
is('es-419', 'es', 'es-419');
is('EN-us', 'en', 'en-US');
is('fr', 'fr', 'fr');
is('sr-latn-rs', 'sr', 'sr-Latn-RS');
is('de-DE-1996', 'de', 'de-DE');
is('en-US-u-ca-gregory', 'en', 'en-US');
is('zh-yue-HK', 'zh', 'zh-HK');
is('en_US.UTF-8', 'en', 'en-US');

// -- Header parameters and lists ------------------------------------------
is('en;q=0.9,fr;q=0.8', 'en', 'en');
is('en-US;q=0.9,fr', 'en', 'en-US');
is('  de-AT , de;q=0.9', 'de', 'de-AT');

// -- Retired codes fold into their successor; no stays apart from nb --------
is('iw-IL', 'he', 'he-IL');
is('in-ID', 'id', 'id-ID');
is('tl-PH', 'fil', 'fil-PH');
is('ji', 'yi', 'yi');
is('mo-MD', 'ro', 'ro-MD');
is('jw-ID', 'jv', 'jv-ID');
is('no-NO', 'no', 'no-NO');
is('nb-NO', 'nb', 'nb-NO');

// -- A valid code without a translation keeps its own key -------------------
is('fur-IT', 'fur', 'fur-IT');
is('fur', 'fur', 'fur');

// -- Unusable values: "other", with what was received ----------------------
is(undefined, 'other', null, '(none)');
is(null, 'other', null, '(none)');
is('', 'other', null, '(empty)');
is('   ', 'other', null, '(empty)');
is(';q=1', 'other', null, '(empty)');
is('*', 'other', null, '*');
is('C', 'other', null, 'C');
is('C.UTF-8', 'other', null, 'C.UTF-8');
is('x-klingon', 'other', null, 'x-klingon');
is('und', 'other', null, 'und');
is('mul', 'other', null, 'mul');
is('zxx', 'other', null, 'zxx');
is('qaa', 'other', null, 'qaa');
is('english', 'other', null, 'english');
is('en US', 'other', null, '(malformed)');
is('<script>', 'other', null, '(malformed)');
is('a'.repeat(5000), 'other', null, '(malformed)');
is('en-' + 'x'.repeat(40), 'other', null, '(malformed)');

// -- Read-time folding: history under an old code reads with the new one ----
const hist = { he: 10, iw: 3, id: 4, in: 1, tl: 2, fil: 5, und: 2, other: 7, fur: 1, no: 1, nb: 4 };
const f = L.foldLangMap(hist);
ok(f.he === 13 && f.id === 5 && f.fil === 7 && f.other === 9 && f.fur === 1 && f.no === 1 && f.nb === 4,
  'iw+he, in+id, tl+fil add up; und joins other; fur, no and nb are untouched');
ok(!('iw' in f) && !('in' in f) && !('tl' in f) && !('und' in f), 'no retired or void key is left in the folded view');
ok(hist.iw === 3 && hist.und === 2, 'the stored map itself is never modified');
const sum = o => Object.values(o).reduce((a, b) => a + b, 0);
ok(sum(f) === sum(hist), 'folding moves counts, it never loses or adds one');
const fe = L.foldEnv({ lang: { iw: 1 }, langNew: { in: 1 }, langRet: { tl: 1 }, os: { iw: 1 } });
ok(fe.lang.he === 1 && fe.langNew.id === 1 && fe.langRet.fil === 1 && fe.os.iw === 1,
  'foldEnv folds the three language maps and nothing else');

// -- One ping, into the diagnostic maps ------------------------------------
{
  const d = {};
  L.record(d, L.parse(undefined), { seenBefore: false, isBot: false, combo: 'other · Chrome' });
  L.record(d, L.parse(undefined), { seenBefore: true, isBot: true, combo: 'Linux · Chrome' });
  L.record(d, L.parse('*'), { seenBefore: null, isBot: false, combo: 'Windows · Chrome' });
  L.record(d, L.parse('pt-BR'), { seenBefore: false, isBot: false, combo: 'Android · Chrome' });
  L.record(d, L.parse('fur-IT'), { seenBefore: false, isBot: true, combo: 'Linux · Firefox' });
  ok(d.otherRaw['(none)'] === 2 && d.otherRaw['*'] === 1, 'otherRaw keeps each unusable value');
  ok(d.otherRawNew['(none)'] === 1 && d.otherRawRet['(none)'] === 1 && !d.otherRawNew['*'] && !d.otherRawRet['*'],
    'new / returning split, and a ping without an id counts in neither');
  ok(d.otherRawBot['(none)'] === 1 && d.otherRawClean['(none)'] === 1 && d.otherRawClean['*'] === 1, 'bot / clean split by the User-Agent alone');
  ok(d.otherCombo['other · Chrome'] === 1 && d.otherCombo['Windows · Chrome'] === 1 && !d.otherCombo['Android · Chrome'],
    'otherCombo only counts the "other" pings');
  ok(d.langLocale['pt-BR'] === 1 && d.langLocale['fur-IT'] === 1 && !d.otherRaw['fur-IT'], 'a recognised language goes to langLocale, never to otherRaw');
  ok(d.bot['bot-like'] === 2 && d.bot.clean === 3, 'bot-like no longer depends on the language: 2 bot UAs out of 5, whatever their header');
}

// -- A flood of distinct garbage cannot grow the maps ----------------------
{
  const d = {};
  for (let i = 0; i < 20000; i++) {
    L.record(d, L.parse('x-' + i.toString(36)), { seenBefore: false, isBot: i % 2 === 0, combo: 'c' + (i % 500) });
    L.record(d, L.parse('en-' + (i % 1000)), { seenBefore: true, isBot: false, combo: 'x' });
    L.record(d, L.parse('z'.repeat(i % 300) + ',fr'), { seenBefore: true, isBot: false, combo: 'x' });
  }
  ok(Object.keys(d.otherRaw).length <= L.CAP_RAW + 1 && d.otherRaw[L.OVERFLOW] > 0, 'otherRaw stays within its cap (' + Object.keys(d.otherRaw).length + ' keys), the rest is counted in (overflow)');
  ok(Object.keys(d.otherRawNew).length <= L.CAP_RAW + 1 && Object.keys(d.otherRawBot).length <= L.CAP_RAW + 1, 'so do its splits');
  ok(Object.keys(d.otherCombo).length <= L.CAP_COMBO + 1, 'otherCombo stays within its cap');
  ok(Object.keys(d.langLocale).length <= L.CAP_LOCALE + 1, 'langLocale stays within its cap (' + Object.keys(d.langLocale).length + ' keys)');
  ok(Object.keys(d).every(k => L.DIAG_KEYS.includes(k)), 'and no unexpected map is created');
  const tot = sum(d.otherRaw);
  ok(tot === sum(d.otherRawBot) + sum(d.otherRawClean), 'every "other" ping is counted once, whatever overflowed');
}

// -- Period sum ------------------------------------------------------------
{
  const p = L.period([{ otherRaw: { '(none)': 2 }, bot: { clean: 2 } }, null, { otherRaw: { '(none)': 1, '*': 1 }, langLocale: { 'pt-BR': 3 } }]);
  ok(p.days === 2 && p.otherRaw['(none)'] === 3 && p.otherRaw['*'] === 1 && p.langLocale['pt-BR'] === 3 && p.bot.clean === 2,
    'period() adds the days that carry the series and counts them');
  ok(L.DIAG_KEYS.every(k => p[k] && typeof p[k] === 'object'), 'and always returns every map, empty or not');
}

// -- Wiring in proxy.js ----------------------------------------------------
ok(/const LANG_STATS = require\('\.\/server\/lang-stats\.js'\)/.test(proxy), 'proxy.js loads the module');
ok(/LANG_STATS\.parse\(acceptLang\)/.test(proxy), 'the header is parsed by the module, not by an inline regex');
ok(!/lgv === 'other'\) \? 'bot-like'/.test(proxy), 'the language no longer feeds the bot-like estimate');
ok(/_envRoom\(bucket\.lg, lgv, 'lang'\)/.test(proxy), 'the per-day lang series keeps its rule');
ok(/LANG_STATS\.foldEnv\(visitsStore\.env/.test(proxy), 'the running totals are folded when read');
ok(/LANG_STATS\.foldLangMap\(b\.lg\)/.test(proxy), 'so are the per-day series and the trend');
ok(/visitsStore\.langDiagSince = \(typeof _vs\.langDiagSince/.test(proxy), 'the start of the diagnostic survives a restart');

// -- The admin page --------------------------------------------------------
ok(/No usable language header/.test(admin), 'other is named for what it is: missing OR unusable');
ok(/function _envOtherDiag\(/.test(admin) && /function _envLocales\(/.test(admin), 'the language view shows what is behind other, and the regional variants');
ok(/_annEsc\(k\)/.test(admin.slice(admin.indexOf('function _envOtherDiag('), admin.indexOf('function _envOtherDiag(') + 3000)),
  'raw values come from the client and are escaped before display');

// -- End to end: a real proxy, real beacons, an older visits.json ----------
// The stored history (iw, und, the frozen noise counter) must read folded,
// and never be rewritten.
{
  const fs = await import('node:fs'), os = await import('node:os'), http = await import('node:http');
  const { spawn } = await import('node:child_process');
  const tmp = fs.mkdtempSync(join(os.tmpdir(), 'langstats-'));
  const VISITS = join(tmp, 'visits.json');
  const d = new Date(), today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  fs.writeFileSync(VISITS, JSON.stringify({
    days: { [today]: { v: 5, ids: {}, lg: { iw: 3, he: 2, und: 1 }, lgn: { iw: 1 } } },
    totalV: 5, allU: {}, env: { lang: { iw: 3, he: 2, und: 1, other: 4 }, noise: { clean: 6, 'bot-like': 4 } }, envSince: 1,
  }));
  const PORT = 18900 + Math.floor(Math.random() * 90), TOKEN = 'lang-stats-test';
  const proxyP = spawn(process.execPath, [join(root, 'proxy.js')], {
    cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
    env: Object.assign({}, process.env, { PORT: String(PORT), VISITS_FILE: VISITS, ADMIN_ENABLED: '1', STATS_ADMIN_TOKEN: TOKEN }),
  });
  proxyP.stdout.on('data', () => {}); proxyP.stderr.on('data', () => {});
  // node:http, not fetch: fetch adds "accept-language: *" on its own, and the
  // header-less case is the one under study.
  function beacon(vid, headers) {
    return new Promise((res) => {
      const body = JSON.stringify({ vid, pwa: false });
      const r = http.request({ host: '127.0.0.1', port: PORT, path: '/__visit', method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }, headers) },
        (x) => { x.resume(); res(x.statusCode); });
      r.on('error', () => res(0)); r.end(body);
    });
  }
  let up = false;
  for (let i = 0; i < 60 && !up; i++) { await new Promise((r) => setTimeout(r, 150)); up = (await beacon('', { 'User-Agent': 'probe' })) === 204; }
  try {
    ok(up, 'proxy up, beacon → 204');
    const CHROME_NO_OS = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/130.0 Safari/537.36';
    const WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
    await beacon('a1', { 'User-Agent': CHROME_NO_OS });
    await beacon('a2', { 'User-Agent': WIN, 'Accept-Language': 'iw-IL,he;q=0.9' });
    await beacon('a3', { 'User-Agent': WIN, 'Accept-Language': 'pt_BR' });
    await beacon('a3', { 'User-Agent': WIN, 'Accept-Language': '*' });
    await beacon('a4', { 'User-Agent': WIN, 'Accept-Language': 'x'.repeat(3000) });
    await new Promise((r) => setTimeout(r, 2200));   // saveVisitsSoon (1.5 s)
    const v = JSON.parse(fs.readFileSync(VISITS, 'utf8'));
    const e = v.env || {}, b = (v.days || {})[today] || {};
    ok(e.lang.iw === 3 && e.lang.und === 1 && b.lg.iw === 3, 'the stored history is left as it was (iw, und)');
    ok(e.lang.he === 3 && e.lang.pt === 1, 'new pings are stored under the current code (iw-IL → he, pt_BR → pt)');
    ok(e.noise.clean === 6 && e.noise['bot-like'] === 4, 'the old noise counter is frozen, not mixed with the new rule');
    ok(e.bot && e.bot['bot-like'] === 1 && e.bot.clean === 5, 'env.bot judges the User-Agent alone: Googlebot is a bot, a header-less "probe" is not');
    ok(e.otherRaw['(none)'] === 2 && e.otherRaw['*'] === 1 && e.otherRaw['(malformed)'] === 1, 'otherRaw: no header ×2, * ×1, a 3000-char header as (malformed)');
    ok(e.otherRawBot['(none)'] === 1 && e.otherRawClean['(none)'] === 1 && e.otherRawClean['*'] === 1, 'split by User-Agent');
    ok(e.otherRawRet['*'] === 1 && e.otherRawNew['(none)'] === 1, 'split by new / returning (a3 came back)');
    ok(e.otherCombo['other · Chrome'] === 1, 'the crawler shape is visible: Chrome with no OS');
    ok(e.langLocale['he-IL'] === 1 && e.langLocale['pt-BR'] === 1, 'langLocale keeps the region');
    ok(b.ld && b.ld.otherRaw['(none)'] === 2 && b.ld.langLocale['pt-BR'] === 1, 'and the same maps are kept per day');
    ok(v.langDiagSince > 1000, 'the diagnostic records when it started');
    const ex = await fetch('http://127.0.0.1:' + PORT + '/admin/visits/export?fmt=json&token=' + TOKEN).then((r) => r.json());
    const S = ex.summary || {};
    ok(ex.schema === 'pokerth-traffic/1' && ex.store.env.lang.iw === 3, 'the export keeps its schema and the raw store');
    ok(S.env.lang.he === 6 && !('iw' in S.env.lang) && S.env.lang.other === 4 + 1 + 4, 'summary.env folds: he 3+3, iw gone, und joins other');
    ok(S.envPeriod.lang.he === 3 + 2 + 1 && !('iw' in S.envPeriod.lang) && S.envPeriod.langNew.he >= 1, 'envPeriod folds the per-day series as well');
    ok(S.envPeriod.ldDays === 1 && S.envPeriod.otherRaw['(none)'] === 2 && S.envPeriod.langLocale['pt-BR'] === 1, 'envPeriod carries the diagnostic of the period');
    const ser = S.series.find((x) => x.date === today);
    ok(ser && ser.lg.he === 6 && !('iw' in ser.lg), 'the daily series of the chart is folded too: no break between iw and he');
    ok(S.langTrend && !('iw' in S.langTrend.cur) && !('iw' in S.langTrend.prev), 'and so is the trend');
    ['lang', 'langNew', 'langRet', 'os', 'br', 'combo', 'pwa', 'noise'].forEach((k) => ok(k in S.env, 'summary.env still has ' + k));
    ['lgDays', 'lgnDays', 'days', 'lang', 'langNew', 'langRet'].forEach((k) => ok(k in S.envPeriod, 'summary.envPeriod still has ' + k));
    ok(typeof S.langN === 'number' && Array.isArray(S.langs), 'langN and langs unchanged');
    const nm = S.env.noiseMeta || {};
    ok(nm.legacy === true && nm.frozen === true && nm.replacedBy === 'bot' && nm.frozenSince === v.langDiagSince,
      'summary.env.noiseMeta says noise is legacy and frozen, replaced by bot, since the first ping of the diagnostic');
    ok(!('noiseMeta' in ex.store.env), 'the note lives in the summary only: the stored env holds counters, nothing else');
  } finally {
    proxyP.kill();
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
}

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
