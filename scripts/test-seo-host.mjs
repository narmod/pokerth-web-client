#!/usr/bin/env node
// Deterministic guards for /host-a-server and its translation table,
// seo-i18n/host.js. Run: node scripts/test-seo-host.mjs
//
// 1. facts: what the page says matches the repository — the apt package and
//    TCP 7234 (README), the one-liner install.sh, the multi-arch image
//    (amd64/arm64/armv7), the CasaOS guide, the Pi 4 (2 GB) advice, port
//    8080, HTTPS for the PWA extras, the admin panel at /admin (token, update,
//    roll-back, broadcasts, packages, music, game servers, keys), the shared
//    leaderboard, and every guide link points at an anchor or file that
//    exists;
// 2. English: snippet-sized head, pair and label counts, no HTML;
// 3. translations: every field, same counts, no HTML;
// 4. wiring: route, nav (gated), crawler block, sitemap, IndexNow, llms.txt,
//    admin coverage, links from /faq and /play-with-friends.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const read = (p) => readFileSync(join(root, p), 'utf8');
const src = read('proxy.js'), readme = read('README.md');
const T = require(join(root, 'seo-i18n', 'host.js'));
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function lift(name) {
  const i = src.indexOf('var ' + name + ' = ');
  if (i < 0) throw new Error('no ' + name);
  let j = i + ('var ' + name + ' = ').length, d = 0, k = j;
  for (; k < src.length; k++) {
    const ch = src[k];
    if (ch === "'" || ch === '"') { const q = ch; k++; while (src[k] !== q) { if (src[k] === '\\') k++; k++; } continue; }
    if (ch === '{' || ch === '[') d++;
    else if (ch === '}' || ch === ']') { d--; if (!d) break; }
  }
  // _SEO_HOST_GUIDES is built from _SEO_HOST_REPO: give it the same base.
  return new Function('_SEO_HOST_REPO', 'return ' + src.slice(j, k + 1))((src.match(/var _SEO_HOST_REPO = '([^']+)';/) || [])[1]);
}
const EN = lift('_SEO_HOST'), keys = Object.keys(EN);
const flat = (v) => Array.isArray(v) ? v.flat().join(' ') : String(v);
const all = keys.map((k) => flat(EN[k])).join(' ');

// 1. Facts
// The distribution package (pokerth-server) is older than the 2.1.x protocol:
// the page and the README build the server from source instead.
ok(!/apt install pokerth-server/.test(all) && !/apt install pokerth-server/.test(readme), 'no « apt install pokerth-server » (an older version) on the page or in the README');
ok(/version 2\.1\.10 or later/.test(all) && /older version/.test(all) && /TCP \*\*7234\*\*/.test(readme) && /7234/.test(all), 'PokerTH server: built from source, 2.1.10 or later, TCP 7234; the distro package is called older');
const CMDS = lift('_SEO_HOST_CMDS');
ok(CMDS.length === 2 && /cmake --build \.\/build --target pokerth_dedicated_server/.test(CMDS[0]) && /build\/bin\/pokerth_dedicated_server$/.test(CMDS[0]), 'step 1 shows the build of the server guide (pokerth_dedicated_server)');
ok(CMDS[1] === 'curl -sSL https://raw.githubusercontent.com/narmod/pokerth-web-client/HEAD/install.sh | bash' && readme.includes(CMDS[1]), 'step 2 shows the installation script, exactly as in the README');
ok(/'<pre class="cmd"><code>' \+ _seoAttr\(_SEO_HOST_CMDS\[i\]\)/.test(src), 'the commands are escaped into a <pre>, left-to-right in every language');
const SRC = lift('_SEO_HOST_SRC');
ok(SRC[0][0] === 'https://github.com/pokerth/pokerth' && SRC[1][0] === 'https://github.com/pokerth/pokerth/blob/stable/docs/server_setup_howto.txt' && /i === 0 \? '<p class="cmdsrc">'/.test(src), 'step 1 links the official PokerTH repository and its server guide, in every language');
ok(existsSync(join(root, 'install.sh')) && /install\.sh \| bash/.test(readme), 'one-command install (install.sh)');
ok(/`amd64` \/ `arm64` \/ `armv7`/.test(readme) && /amd64, arm64 and armv7/.test(all), 'Docker image for amd64, arm64 and armv7');
ok(existsSync(join(root, 'docs/CASAOS.md')) && /x-casaos/.test(read('docker-compose.yml')), 'CasaOS: guide and Compose metadata');
ok(/\*\*Pi 4 \(2 GB\)\*\* \| ✅ Recommended sweet spot/.test(readme) && /Pi 4 with 2 GB is the sweet spot/.test(all), 'Raspberry Pi 4 (2 GB) is the sweet spot');
ok(/process\.env\.PORT \|\| '8080'/.test(src) && /port 8080/.test(all), 'default port 8080');
ok(/QML client/.test(EN.partsP) && /widget client/.test(EN.partsP) && /QML or widget client/.test(EN.steps[2][1]) && /port 7234/.test(EN.steps[2][1]) && /QML client or the classic widget client/.test(EN.faq[2][1]), 'the QML and widget clients join the same server (parts, step 3, FAQ)');
ok(/PWA extras \(install to home screen, offline, notifications\) need HTTPS/.test(readme), 'HTTPS needed for install, offline, notifications');
ok(/lives at \*\*`\/admin`\*\*/.test(readme) && /set-token/.test(readme) && /\*\*Broadcasts\*\*/.test(readme) && /\*\*Packages\*\*/.test(readme) && /\*\*Music\*\*/.test(readme) && /\*\*Keys\*\*/.test(readme) && /\*\*Game servers\*\*/.test(readme), 'admin panel: token, broadcasts, packages, music, keys, game servers');
ok(existsSync(join(root, '.gitignore')) && /deploy-history\.json/.test(read('.gitignore')), 'admin roll-back (deployment history)');
ok(/\*\*Leaderboard\*\* — reset the shared leaderboard/.test(readme), 'shared leaderboard');
const G = lift('_SEO_HOST_GUIDES').map((u) => u.replace('https://github.com/narmod/pokerth-web-client', ''));
ok(G[0] === 'https://github.com/pokerth/pokerth/blob/stable/docs/server_setup_howto.txt', 'the first guide is the PokerTH server guide (upstream, branch stable)');
ok(G.slice(1).every((g) => g.startsWith('#') ? readme.includes('<a id="' + g.slice(1) + '"></a>') : existsSync(join(root, g.replace('/blob/main/', '')))), 'every other guide link points at an existing README anchor or file');

// 2. English
const pairs = (v, len) => Array.isArray(v) && v.length === len && v.every((x) => Array.isArray(x) && x.length === 2 && x.every((y) => String(y || '').trim()));
ok([...EN.title].length <= 60, `English title fits a snippet (${[...EN.title].length})`);
ok([...EN.desc].length <= 160, `English description fits a snippet (${[...EN.desc].length})`);
ok(pairs(EN.why, 3) && pairs(EN.steps, 3) && pairs(EN.faq, 5) && EN.guides.length === G.length, 'English: 3 reasons, 3 steps, 5 questions, a label per guide');
ok(!/[<>{}]/.test(all), 'English: no HTML, no placeholder');

// 3. Translations
const codes = Object.keys(T);
ok(!('en' in T), 'English is not in the table — it lives in proxy.js');
console.log(`  · ${codes.length} translation(s)`);
for (const code of codes) {
  const p = T[code];
  const miss = keys.filter((k) => k === 'guides' ? !(Array.isArray(p.guides) && p.guides.length === G.length && p.guides.every((x) => String(x || '').trim()))
    : Array.isArray(EN[k]) ? !pairs(p[k], EN[k].length) : (typeof p[k] !== 'string' || !p[k].trim()));
  ok(miss.length === 0, `${code}: complete${miss.length ? ' — missing ' + miss.join(', ') : ''}`);
  ok(!/[<>{}]/.test(keys.map((k) => flat(p[k])).join(' ')) && !/["<>]/.test(p.title + p.desc + p.ldHeadline + p.ldDesc), `${code}: no HTML, attribute-safe head`);
  ok(Object.keys(p).every((k) => keys.includes(k)), `${code}: no unknown field`);
}

// 4. Wiring
ok(/reqPathOnly === '\/host-a-server'/.test(src) && /function seoHostPage\(/.test(src), 'route and page builder');
ok(/_seoHostIn\(lang\) \? '<a href="' \+ _seoLangHref\('\/host-a-server', SEO_HOST_I18N, lang\)/.test(src), 'nav link gated on the language');
ok(/_seoPageUrls\(_sBase, '\/host-a-server'/.test(src) && /base \+ '\/host-a-server'/.test(src) && /'\/host-a-server\?lang=' \+ c/.test(src), 'sitemap and IndexNow, with its languages');
ok(/\/host-a-server\\n/.test(src) && /\['\/host-a-server', seoPageLangs\(SEO_HOST_I18N\)\.length\]/.test(src), 'llms.txt and admin coverage');
const FAQ = lift('_SEO_FAQ'), ix = Number((src.match(/var _SEO_FAQ_HOST_IX = (\d+);/) || [])[1]);
ok(FAQ[ix] && /host my own server\?$/.test(FAQ[ix][0]), `/faq links to it under « ${FAQ[ix] && FAQ[ix][0]} »`);
ok(/sec\(tr\.ownH2, tr\.ownP\) \+ _seoHostLink\(lang\)/.test(src), '/play-with-friends links to it after « Host it yourself »');
ok(/SEO_HOST_I18N = require\('\.\/seo-i18n\/host\.js'\)/.test(src), 'translation table loaded');

console.log(fail ? `\n${fail}/${n} failed` : `\n${n}/${n} passed`);
process.exit(fail ? 1 : 0);
