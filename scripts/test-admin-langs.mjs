#!/usr/bin/env node
// Deterministic guards for the language breakdown.
// Run: node scripts/test-admin-langs.mjs
//
// Two words read the same and mean nothing alike. In the ranking, "other" is a
// ping whose Accept-Language header was missing or unusable — a bot, near
// enough — and never an untranslated language, because a real language is
// always counted under its own code. In the chart legend, "N others" was the
// tail of the ranking. Both are renamed here, and the accounting that made the
// confusion possible is pinned: a cap of 40 distinct codes on a client that
// speaks 45 languages would have started folding real ones into that same
// bucket, silently, at the 41st.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const admin = readFileSync(join(root, 'public', 'admin.html'), 'utf8');
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  \u2717', msg); } else console.log('  \u2713', msg); }
function body(src, name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let i = src.indexOf('{', head), depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(i, j + 1); }
  }
  return '';
}

// -- The list of translations is read, not copied --------------------------
const sup = body(proxy, 'supportedLangs');
ok(/readdirSync\(dir\)/.test(sup), 'the translated set is read from public/modules/lang, not kept as a second list that drifts');
ok(/mt === _langsMtime/.test(sup), 'and cached against the directory mtime rather than re-read per ping');
ok(/split\('-'\)\[0\]/.test(sup),
  'codes are truncated to their base, matching how the header is stored — pt-br and pt-pt both answer for pt');
const alias = /const LANG_ALIAS = \{([^}]*)\}/.exec(proxy);
ok(!!alias, 'there is an alias table');
ok(alias && /no: 'nb'/.test(alias[1]) && /tl: 'fil'/.test(alias[1]),
  "with the two that would otherwise read as missing: browsers send 'no' where the file is nb, and 'tl' where it is fil");
ok(alias && /iw: 'he'/.test(alias[1]) && /in: 'id'/.test(alias[1]),
  'and the retired ISO codes some Android builds still send');
ok(/if \(base\[LANG_ALIAS\[a\]\]\) base\[a\] = 1/.test(sup),
  'an alias only counts when its target is actually translated');
ok(/function supportedLangCount/.test(proxy) && /langN: supportedLangCount\(\)/.test(proxy),
  'the count reported is the number of translations, not the size of the match set — aliases would inflate it');
ok(/langs: supportedLangs\(\)/.test(proxy), 'and the match set travels with the traffic payload');

// The real directory has to agree with what the code assumes.
const files = readdirSync(join(root, 'public', 'modules', 'lang')).filter(f => /\.mjs$/.test(f));
ok(files.length >= 45, 'there are at least 45 translations on disk (' + files.length + ')');
const base = new Set(files.map(f => f.replace(/\.mjs$/, '').toLowerCase().split('-')[0]));
ok(base.has('nb') && base.has('fil'), 'nb and fil exist, which is why the two aliases are needed');
ok(!base.has('no') && !base.has('tl'), 'and no and tl do not, which is why they would have read as missing');

// -- The cap that made the confusion possible ------------------------------
ok(!/>= 40\) \{ b\.other/.test(proxy) && !/\.length >= 40\) bucket\.lg\.other/.test(proxy),
  'the cap of 40 is gone from both counters');
const cap = /const ENV_KEY_CAP = (\d+)/.exec(proxy);
ok(cap && +cap[1] >= files.length + 20, 'the new cap leaves room beyond every translation (' + (cap && cap[1]) + ')');
const room = body(proxy, '_envRoom');
ok(/key === 'lang' && supportedLangs\(\)\.indexOf\(val\) >= 0/.test(room),
  'and a translated language is never folded into other, whatever the cap');
ok(/_envRoom\(bucket\.lg, lgv, 'lang'\)/.test(proxy), 'the per-day series uses the same rule as the running total');

// -- Two different words for two different things --------------------------
ok(/if\(_envView==='lang' && k==='other'\) return 'No language header'/.test(admin),
  'in the language view, other is named for what it is');
ok(/'lang:other'/.test(admin) && /Almost always a bot or a script/.test(admin),
  'with a tooltip saying it is not a language, let alone an untranslated one');
ok(/function _envRest\(n\)/.test(admin) && /more language/.test(admin),
  'and the tail of the ranking is called something else entirely');
ok(!/rest\.length\+' others'/.test(admin) && !/restK\.length\+' others'/.test(admin),
  'neither list nor chart legend still says "N others" in the language view');

// -- Seen but not translated -----------------------------------------------
const miss = body(admin, '_envMissingLangs');
ok(miss !== '', 'the panel can list what is missing');
ok(/k!=='other'/.test(miss), 'the no-header bucket is excluded — it is not a language to translate');
ok(/_envLangs\.indexOf\(k\)<0/.test(miss), 'a language counts as missing only against the set the proxy sent');
ok(/if\(!_envLangsKnown\)/.test(miss),
  'and an older proxy that does not send it says so, rather than claiming nothing is missing');
ok(/Every language seen so far has a translation/.test(miss), 'nothing missing is stated too, not left blank');
ok(/\(lang\[b\]\|\|0\)-\(lang\[a\]\|\|0\)/.test(miss), 'the list is ordered by how many pings each would serve');

// "other" is not a language, and counting it said one too many from the first
// header-less ping.
const hi = body(admin, '_envHighlight');
ok(/filter\(function\(k\)\{ return k!=='other'; \}\)\.length/.test(hi), 'the languages-seen count excludes it');
ok(!/of 45 translated/.test(admin), 'and the number of translations is no longer written into the page by hand');
ok(/_envLangN\?\(', of '\+_envLangN\+' translated'\)/.test(admin), 'it comes from the proxy counting the files');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
