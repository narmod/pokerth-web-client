#!/usr/bin/env node
// Deterministic tests for the forum-news feature.
// Run: node scripts/test-forumnews.mjs
//
// Two halves:
//   1. public/modules/ui/forumnews.mjs — pure helpers (dedup by topic,
//      unread accounting) with a minimal DOM shim.
//   2. proxy.js forumParseAtom — extracted from the source (the proxy is a
//      single CJS file that opens sockets on load, so we lift the pure
//      parser + rankingDecodeHtml out by text and evaluate them alone)
//      and fed a captured slice of the real phpBB Atom feed.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let fails = 0;
const ok = (c, l) => { if (!c) { console.error('  \u2717 ' + l); fails++; } else process.stdout.write('  \u2713 ' + l + '\n'); };

// ── DOM shim so the module can load outside a browser ──────────────────
globalThis.window = globalThis;
globalThis.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener() {}
};
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
window.addEventListener = () => {};

const F = await import('../public/modules/ui/forumnews.mjs');

// ── 1) fnDedup ─────────────────────────────────────────────────────────
const posts = [
  { id: 'p5', forum: 'BBC', title: 'Re: BBC Step 1', author: 'noob', date: '2026-08-09T02:34:07+02:00' },
  { id: 'p4', forum: 'BBC', title: 'Re: BBC Step 1', author: 'Johanna.', date: '2026-08-09T00:58:43+02:00' },
  { id: 'p3', forum: 'Bugs', title: 'Re: PokerTH Web Client', author: 'narmod', date: '2026-08-08T18:28:54+02:00' },
  { id: 'p2', forum: 'Bugs', title: 'PokerTH Web Client', author: 'Spitessbir', date: '2026-08-08T14:45:55+02:00' },
  { id: 'p1', forum: 'WEC', title: 'Re: Scores for WeCups 2026', author: 'barryl', date: '2026-08-08T23:58:46+02:00' }
];
const d = F.fnDedup(posts);
ok(d.length === 3, 'dedup keeps the latest post per topic (5 posts \u2192 3 topics)');
ok(d[0].id === 'p5', 'newest post of a duplicated topic wins');
ok(d.some(p => p.id === 'p3') && !d.some(p => p.id === 'p2'), '"Re: X" and "X" collapse to the same topic');
ok(F.fnDedup([]).length === 0 && F.fnDedup(null).length === 0, 'dedup tolerates empty/null input');

// ── 2) unread accounting ───────────────────────────────────────────────
const none = new Set();
ok(F.fnUnreadCount(d, none, 0) === 3, 'everything unread with no read state');
const base = Date.parse('2026-08-08T20:00:00+02:00');
ok(F.fnUnreadCount(d, none, base) === 2, 'mark-all watermark hides older posts');
ok(F.fnUnreadCount(d, new Set(['p5']), base) === 1, 'individually read ids are excluded');
ok(F.fnIsUnread({ id: 'x', date: 'garbage' }, none, 0) === false, 'unparseable date never counts as unread');

// ── 3) proxy forumParseAtom on a real feed slice ───────────────────────
const proxySrc = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
function lift(name) {
  const i = proxySrc.indexOf('function ' + name + '(');
  if (i < 0) throw new Error(name + ' not found in proxy.js');
  let depth = 0, j = proxySrc.indexOf('{', i);
  for (let k = j; k < proxySrc.length; k++) {
    if (proxySrc[k] === '{') depth++;
    else if (proxySrc[k] === '}') { depth--; if (!depth) return proxySrc.slice(i, k + 1); }
  }
  throw new Error(name + ' unbalanced');
}
const parseAtom = new Function(
  lift('rankingDecodeHtml') + '\n' + lift('forumParseAtom') +
  '\nconst FORUM_MAX_POSTS = 40;\nreturn forumParseAtom;'
)();

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-gb">
\t<title>PokerTH</title>
\t<entry>
\t\t<author><name><![CDATA[narmod]]></name></author>
\t\t<updated>2026-08-08T18:28:54+02:00</updated>
\t\t<published>2026-08-08T18:28:54+02:00</published>
\t\t<id>https://www.pokerth.net/viewtopic.php?p=16912#p16912</id>
\t\t<link href="https://www.pokerth.net/viewtopic.php?p=16912#p16912"/>
\t\t<title type="html"><![CDATA[Bugs \u2022 Re: PokerTH Web Client]]></title>
\t\t<category term="Bugs" scheme="https://www.pokerth.net/viewforum.php?f=5" label="Bugs"/>
\t\t<content type="html"><![CDATA[Hi, thanks!<br>long html body]]></content>
\t</entry>
\t<entry>
\t\t<author><name><![CDATA[dauber22]]></name></author>
\t\t<published>2026-08-08T09:38:39+02:00</published>
\t\t<id>https://www.pokerth.net/viewtopic.php?p=16906#p16906</id>
\t\t<link href="https://www.pokerth.net/viewtopic.php?p=16906#p16906"/>
\t\t<title type="html"><![CDATA[Feature Requests \u2022 Re: &quot;Ignore Player&quot; improvement]]></title>
\t\t<category term="Feature Requests" scheme="https://www.pokerth.net/viewforum.php?f=7" label="Feature Requests"/>
\t\t<content type="html"><![CDATA[Thanks Sp0ck]]></content>
\t</entry>
</feed>`;

const parsed = parseAtom(feed);
ok(parsed.length === 2, 'parser extracts both entries');
ok(parsed[0].author === 'narmod', 'author from CDATA');
ok(parsed[0].forum === 'Bugs', 'forum from <category term>');
ok(parsed[0].title === 'Re: PokerTH Web Client', 'title stripped of the "Forum \u2022 " prefix');
ok(parsed[0].link === 'https://www.pokerth.net/viewtopic.php?p=16912#p16912', 'post link');
ok(parsed[0].date === '2026-08-08T18:28:54+02:00', 'published date kept verbatim');
ok(parsed[1].title === 'Re: "Ignore Player" improvement', 'HTML entities in titles are decoded');
ok(parsed.every(p => !('content' in p)), 'heavy HTML content is dropped');
ok(parseAtom('').length === 0 && parseAtom('<feed></feed>').length === 0, 'parser tolerates empty/entry-less feeds');

process.stdout.write(fails ? 'FAILED: ' + fails + '\n' : 'ALL OK\n');
process.exit(fails ? 1 : 0);
