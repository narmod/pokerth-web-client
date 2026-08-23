#!/usr/bin/env node
// Deterministic guards for the anonymous music play counter.
// Run: node scripts/test-music-stats.mjs
//
// The counter spans three files, and the interesting failures are the ones
// that stay silent: a ping fired on every resume (inflating the figures), a
// radio counted as a track (meaningless), an unvalidated id (unbounded key
// growth in visits.json), or a dashboard that shows an empty card without
// saying whether the proxy is simply too old to record anything.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
const music = readFileSync(join(root, 'public', 'modules', 'music.mjs'), 'utf8');
const admin = readFileSync(join(root, 'public', 'admin.html'), 'utf8');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

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

// ── 1. What the client sends ──────────────────────────────────────────────
const count = body(music, '_countPlay');
ok(/_isStream\(t\)/.test(count), 'the client never pings for a radio stream');
ok(/sendBeacon\('\/__music'/.test(count), 'the ping uses sendBeacon so a closing tab still delivers it');
ok(/keepalive: true/.test(count), 'the fetch fallback survives navigation too');
ok(!/vid|sessionId|localStorage/.test(count), 'no visitor id travels with the ping');
ok(/catch/.test(count), 'a failed ping never breaks playback');

const play = body(music, 'play');
ok(/var fresh = \(_curId !== t\.id\) \|\| !_active\(\)\.src;/.test(play),
  'a play is a track that had to be loaded, not a resume after pause');
ok(/if \(fresh\) _countPlay\(t\)/.test(play), 'the ping fires only once the audio actually started');
ok(play.indexOf('_countPlay') > play.indexOf('await el.play()'),
  'nothing is counted when play() throws (autoplay blocked, load error)');

// ── 2. What the server accepts ────────────────────────────────────────────
const countable = body(proxy, 'musicCountable');
ok(/\^\[A-Za-z0-9_-\]\{1,64\}\$/.test(countable), 'the id shape is validated before anything else');
ok(/musicListForClient\(\)/.test(countable) && /!list\[i\]\.stream/.test(countable),
  'only a non-stream track of the served catalogue is countable — unknown ids create no key');

const record = body(proxy, 'recordMusicPlay');
ok(/if \(!musicCountable\(id\)\) return;/.test(record), 'recording goes through the validation');
ok(/bucket\.mu\[id\]/.test(record), 'the per-day series is kept in the visits bucket');
ok(/pruneVisitDays\(\)/.test(record), 'the per-day series inherits the visit retention');
ok(/saveVisitsSoon\(\)/.test(record), 'writes are debounced like every other visit counter');

ok(/reqPathOnly === '\/__music'/.test(proxy), 'the /__music route exists');
const route = proxy.slice(proxy.indexOf("reqPathOnly === '/__music'"), proxy.indexOf("reqPathOnly === '/__music'") + 700);
ok(/req\.method !== 'POST'/.test(route), 'only POST is accepted');
ok(/musicEnabled\(\)/.test(route), 'nothing is counted while the music player is switched off');
ok(/writeHead\(204/.test(route), 'the ping gets an empty 204, like /__visit');
ok(!/clientIp|x-forwarded-for/.test(route), 'the route never reads the caller address');

ok(/music: visitsStore\.music \|\| \{\}/.test(proxy), 'the summary exposes the totals');
ok(/musicTitles: musicPlayTitles\(\)/.test(proxy), 'the summary carries the titles to show next to the ids');
ok(/mu: \(b && b\.mu\) \? b\.mu : undefined/.test(proxy), 'the 14-day series carries the per-day plays');
ok(/music: _pingStats\.nMusic/.test(proxy), 'the ping diagnostic counts music pings separately');

// ── 3. What the dashboard shows ───────────────────────────────────────────
ok(/id="trafMusic"/.test(admin), 'the traffic tab has a music card');
const render = body(admin, 'renderMusic');
ok(/_musKnown/.test(render), 'an empty card distinguishes "proxy too old" from "nothing yet"');
ok(/pm2 restart pokerth-web/.test(render), 'the too-old case tells the operator what to do');
ok(/keys\.slice\(0,10\)/.test(render), 'the list is capped at the top 10 until expanded');
ok(/musMoreBtn/.test(render), 'the full list is one click away');
ok(/_musName/.test(render), 'a track pulled from the catalogue still shows under its id');
ok(/_musKnown=\(d\.music!==undefined\)/.test(admin), 'the card is wired to the traffic payload');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
