// The « Web client » changelog tab renders the repository CHANGELOG.md (modules/ui/changelog-md.mjs).
// Checks the real file renders without leftover markdown, the local fallback /CHANGELOG.md
// resolves to it, and the inline renderer escapes HTML and only links http(s).
import fs from 'node:fs';
import { renderChangelogMd, inlineMd } from '../public/modules/ui/changelog-md.mjs';

let pass = 0, fail = 0;
const ok = (c, l) => { if (c) pass++; else { fail++; console.log('  ✗ ' + l); } };

const md = fs.readFileSync('CHANGELOG.md', 'utf8');
ok(fs.realpathSync('public/CHANGELOG.md') === fs.realpathSync('CHANGELOG.md'), 'public/CHANGELOG.md resolves to the root CHANGELOG.md');
const html = renderChangelogMd(md, (k, fb) => k === 'abClNew' ? 'NOUV' : fb);
const nVer = (md.match(/^## /gm) || []).length;
ok(nVer > 5 && (html.match(/class="ab-cl-ver"/g) || []).length === nVer, 'one heading per ## line (' + nVer + ')');
ok((html.match(/class="ab-cl-grp">NOUV</g) || []).length === (md.match(/^### Added\s*$/gm) || []).length, '### Added uses the translated sub-title');
const text = html.replace(/<code>[\s\S]*?<\/code>/g, '').replace(/<[^>]+>/g, '');
ok(!/\*\*|\]\(|^#/m.test(text), 'no raw **, ]( or # left in the text');
ok(!/^Changelog$/m.test(text) && !/>Changelog</.test(html), 'the # title is skipped');
ok(/<a href="https:\/\/github\.com\/narmod\/pokerth-web-client\/releases" target="_blank" rel="noopener noreferrer">/.test(html), 'releases link rendered safely');
ok(/class="ab-cl-line ab-cl-note"/.test(html), '> note rendered');
ok(/<strong>The client follows PokerTH 2\.1\.10<\/strong>/.test(html), 'item bold rendered');
// item with indented continuation lines is one block
ok(/<div class="ab-cl-line ab-cl-item"><strong>The client follows PokerTH 2\.1\.10<\/strong> — the build ID sent to the server and the build-ID fallbacks/.test(html), 'continuation lines joined into the item');

ok(inlineMd('<img src=x onerror=1>') === '&lt;img src=x onerror=1&gt;', 'HTML escaped');
ok(inlineMd('[x](javascript:alert(1))').indexOf('<a') === -1, 'non-http link not turned into an anchor');
ok(inlineMd('`**a** <b>`') === '<code>**a** &lt;b&gt;</code>', 'code span untouched and escaped');
ok(inlineMd('\\$X and *it* and a*b') === '$X and <em>it</em> and a*b', 'escapes and italic');
ok(inlineMd('[S](docs/SECURITY.md)').indexOf('href="https://github.com/narmod/pokerth-web-client/blob/main/docs/SECURITY.md"') > 0, 'relative link points at GitHub');
ok(inlineMd('[a "b"](https://x.y/?q="1")').indexOf('"1"') === -1, 'quotes escaped in links');

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
