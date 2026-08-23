#!/usr/bin/env node
// Deterministic guards for the admin dashboard layout.
// Run: node scripts/test-admin-layout.mjs
//
// Layout regressions are quiet ones: a tab bar that wraps a title onto two
// lines and grows the whole strip, a mobile bar that scrolls with nothing
// saying there is more to the right, or a two-column pass that squeezes a
// chart into half the width.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const admin = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'admin.html'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// Body of a named function, braces balanced — steadier than a fixed-width
// window, which silently stops matching the day the function grows.
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

// The @media block that opens the second column.
const wide = (admin.match(/@media\(min-width:1100px\)\{[\s\S]*?\n  \}/) || [''])[0];
// Every mobile block, concatenated: the phone rules are written in more than
// one place, and a guard that reads only the first would pass or fail on where
// a rule happens to sit rather than on whether it exists.
const small = (admin.match(/@media\(max-width:600px\)\{[\s\S]*?\n  \}/g) || []).join('\n');

// ── Tab bar ───────────────────────────────────────────────────────────────
ok(/\.tab\{flex:0 0 auto;white-space:nowrap/.test(admin),
  'tabs size to their label and never break a title onto two lines');
ok(/\.tabs\{display:flex;flex-wrap:wrap/.test(admin),
  'the bar wraps rather than overflow at in-between widths');
ok(/\.tabs\{flex-wrap:nowrap\}/.test(small),
  'on a phone the bar scrolls instead — wrapping would defeat overflow-x');
ok(/\.tabs\.sc-r\{/.test(small) && /\.tabs\.sc-l\{/.test(small) && /\.tabs\.sc-l\.sc-r\{/.test(small),
  'the edge fade covers both directions and both at once');
ok(/-webkit-mask-image/.test(small), 'the fade carries its WebKit prefix for older iOS');

// ── The JS that drives the fade ───────────────────────────────────────────
ok(/function tabsFade\(\)/.test(admin), 'tabsFade exists');
ok(/scrollWidth-t\.clientWidth/.test(admin), 'the fade is driven by real overflow, not by a width guess');
ok(/over>1 && t\.scrollLeft>1/.test(admin), 'no fade at all when every tab fits');
ok(/addEventListener\('scroll', tabsFade/.test(admin), 'the fade follows the scroll');
ok(/addEventListener\('resize', tabsFade\)/.test(admin), 'and the window size');
ok(/setTimeout\(tabsFade, 0\)/.test(body(admin, 'applyScopeVisibility')),
  'hiding tabs for a scoped key recomputes the overflow');
ok(/scrollIntoView\(\{block:'nearest',inline:'nearest'/.test(admin),
  'picking a tab brings it into view without scrolling the page');

// ── Two columns on a wide screen ──────────────────────────────────────────
ok(/\.wrap\{max-width:1180px\}/.test(wide), 'the page widens past 1100px');
ok(/columns:2/.test(wide), 'the busiest panels split into two columns');
ok(/#panel-server|#panel-traffic|#panel-clients|#panel-broadcast/.test(wide),
  'the split is opt-in per panel, not global');
ok(/break-inside:avoid/.test(wide), 'a card is never cut across the column break');
ok(/-webkit-column-break-inside:avoid/.test(wide), 'with the WebKit spelling alongside');
ok(/column-span:all/.test(wide), 'charts and grids take the full width back');
for (const id of ['trafChart', 'trafNvRChart', 'trafMusic', 'trafEnv', 'trafCards']) {
  ok(new RegExp('#' + id + '\\)').test(wide), id + ' is not squeezed into half a column');
}
ok(!/columns:2/.test(small), 'nothing changes on a phone');

// ── Tab families ──────────────────────────────────────────────────────────
// Twelve flat tabs mixed three kinds of settings. The family is picked on top,
// the section inside it. Every original section must survive the move: a lost
// data-t is a panel nobody can reach any more.
for (const t of ['server', 'servers', 'keys', 'clients', 'packages', 'music',
                 'broadcast', 'polls', 'traffic', 'sessions', 'errors', 'board']) {
  ok(new RegExp('data-t="' + t + '"').test(admin), 'section ' + t + ' is still reachable');
}
for (const sc of ['packages', 'music', 'broadcast', 'polls', 'leaderboard']) {
  ok(new RegExp('data-scope="' + sc + '"').test(admin), 'scope ' + sc + ' survived the regroup');
}
ok((admin.match(/class="tabs subtabs"/g) || []).length === 3, 'three families');
ok(/class="gtab on" data-g="server"/.test(admin), 'the dashboard opens on Server');
ok(/function setGroup\(g, pick\)/.test(admin), 'setGroup exists');
ok(/\.gtab'\)\.forEach/.test(admin), 'family buttons are wired');
ok(/bar\.classList\.contains\('subtabs'\)\) setGroup\(bar\.dataset\.g, false\)/.test(admin),
  'reaching a section from code reveals its family, without re-picking one');
const scope = body(admin, 'applyScopeVisibility');
ok(/gb\.style\.display = any/.test(scope), 'a family with nothing left in it disappears');
ok(/if\(live && !document\.querySelector\('\.gtab\.on'\)\) setGroup\(live, true\)/.test(scope),
  'a scoped key lands on a family it can actually open');
ok(/querySelectorAll\('\.tab'\)/.test(scope) && !/querySelectorAll\('\.gtab, \.tab'\)/.test(scope),
  'family buttons carry no data-scope of their own');
ok(/document\.querySelectorAll\('\.tabs'\)\.forEach/.test(body(admin, 'tabsFade')),
  'the edge fade now covers every bar, not just the first');

// ── Family bar stands out ─────────────────────────────────────────────────
ok(/\.gtab\{flex:1 1 0/.test(admin),
  'the three families share the width, reading as the page navigation');
ok(/\.gtabs\{[^}]*max-width:520px/.test(admin), 'and stop short of absurd on a wide screen');
ok(/\.subtabs \.tab\{background:transparent;border-color:transparent\}/.test(admin),
  'unopened sections are plain text, so the two rows do not look alike');
ok(/\.subtabs \.tab\.on\{background:var\(--panel\);border-color:var\(--gold\)\}/.test(admin),
  'the open section still carries its frame');
// --gold is dark in the light theme: a plain `.gtab` rule outranks `.gtab.on`
// (0,2,1 against 0,2,0) and used to repaint the active family's background,
// leaving dark text on a dark fill.
ok(/light"\] \.gtab:not\(\.on\)\{/.test(admin),
  'the light-theme fill spares the active family');
ok(/light"\] \.gtab\.on\{color:#f4f6fb\}/.test(admin),
  'and the active family keeps a readable text colour there');
ok(/\.gtabs\{max-width:none/.test(small), 'on a phone the families take the full width');
ok(/\.gtabs\{[^}]*overflow:visible/.test(small), 'three of them never need to scroll');

// ── One section per panel ─────────────────────────────────────────────────
// Overview held eight cards and Settings ten, which read as a wall. Each group
// is a section of its own now. The panels are named panel-<data-t>, and the
// switch derives the id rather than listing them, so a new one can no longer
// be added and left invisible.
function panel(id) {
  const a = admin.indexOf('<div id="' + id + '"');
  if (a < 0) return '';
  const b = admin.indexOf('<div id="panel-', a + 10);
  return admin.slice(a, b < 0 ? undefined : b);
}
const PANELS = {
  'panel-server': 2, 'panel-proxy': 1, 'panel-deploy': 3, 'panel-access': 2,
  'panel-clients': 2, 'panel-defaults': 5, 'panel-identity': 3,
};
for (const [id, count] of Object.entries(PANELS)) {
  const seg = panel(id);
  ok(seg !== '', id + ' exists');
  ok((seg.match(/<div class="card"/g) || []).length === count,
    id + ' carries its ' + count + ' card' + (count === 1 ? '' : 's'));
}
for (const t of ['proxy', 'deploy', 'access', 'defaults', 'identity']) {
  ok(new RegExp('data-t="' + t + '"').test(admin), 'a tab opens ' + t);
  ok(admin.includes('<div id="panel-' + t + '"'), 'and panel-' + t + ' answers to it');
}
ok(/pn\.style\.display = \(pn\.id === 'panel-' \+ t\)/.test(admin),
  'the switch derives the panel id instead of listing every panel by hand');
ok(/querySelectorAll\('\[id\^="panel-"\]'\)/.test(admin), 'and reaches every one of them');
ok(!/class="sect"/.test(admin), 'the old sub-section headings are gone, the tab carries the title');
// Only the first panel of a family is visible at load.
ok(/<div id="panel-server">/.test(admin), 'Health & logs opens by default');
for (const id of ['panel-proxy', 'panel-deploy', 'panel-access', 'panel-defaults', 'panel-identity']) {
  ok(new RegExp('<div id="' + id + '" style="display:none">').test(admin), id + ' starts hidden');
}
ok(/#panel-defaults[^{]*\{columns:2/.test(admin), 'the five defaults cards use both columns');
ok(!/#panel-server,/.test(admin), 'a two-card panel no longer asks for two columns');

// ── Card header rows ──────────────────────────────────────────────────────
// "Recent logs" broke across two lines while its Refresh button ran off the
// side of the phone: the header row could not wrap, so everything fought for
// one line.
ok(/\.boardhead\{[^}]*flex-wrap:wrap/.test(admin), 'a header row can wrap');
ok(/\.boardhead>h2\{white-space:nowrap\}/.test(admin), 'and the title is not the thing that breaks');
ok(/\.bhact\{display:flex/.test(admin), 'the action group is a class, not an inline style');
ok(!/<div style="display:flex;align-items:center;gap:8px"><span class="muted">Verbosity/.test(admin),
  'the verbosity row uses it');
ok(/\.bhact\{flex:1 1 100%\}/.test(small), 'once wrapped on a phone the actions take the width');
ok(/\.bhact select\{flex:1 1 auto;width:auto/.test(small), 'and the select stops being cramped');

// ── Capped lists ──────────────────────────────────────────────────────────
const cap = body(admin, 'capRows');
ok(/!el\.offsetParent/.test(cap),
  'a hidden list is not measured, and an existing cap is not undone');
ok(/rows\[n\]\.offsetTop-rows\[0\]\.offsetTop/.test(cap),
  'the height is measured, not guessed from an assumed line height');
ok(/rows\.length<=n/.test(cap), 'a short list is left alone entirely');
ok(/capRows\(l, 10\)/.test(admin), 'the audit log stops at ten entries');
ok(/addEventListener\('resize', function\(\)\{ capRows\(\$\('auList'\), 10\); \}\)/.test(admin),
  'and is re-measured when the screen turns');
ok(/\.scrollcap\{overflow-y:auto/.test(admin), 'the rest is reachable by scrolling');
ok(/overscroll-behavior:contain/.test(admin), 'scrolling it does not drag the page along');

// ── Copying a log ─────────────────────────────────────────────────────────
// navigator.clipboard needs a secure context, which a panel served over plain
// http on a LAN is not — hence the selection fallback.
const copy = body(admin, 'copyText');
ok(/window\.isSecureContext/.test(copy), 'the modern path is only taken where it works');
ok(/execCommand\('copy'\)/.test(copy), 'and there is a fallback for everywhere else');
ok(/document\.body\.removeChild\(ta\)/.test(copy), 'the scratch textarea is always taken back out');
const wire = body(admin, 'wireCopy');
ok(/Nothing to copy/.test(wire), 'an empty log says so instead of pretending to copy');
ok(/Copy failed/.test(wire), 'a refused copy says so too');
ok(/setTimeout\(function\(\)\{ b\.textContent='Copy'/.test(wire), 'the button goes back to Copy');
ok(/wireCopy\('logsCopy','logs'\)/.test(admin) && /wireCopy\('updlogCopy','updlog'\)/.test(admin),
  'both logs on the page can be copied');
ok(/id="logsCopy"/.test(admin) && /id="updlogCopy"/.test(admin), 'both buttons exist');

// Identity & reach belongs to the server, not to the client.
// The family buttons carry data-g too, so anchor on the bar itself.
function bar(g) {
  const a = admin.indexOf('class="tabs subtabs" data-g="' + g + '"');
  return a < 0 ? '' : admin.slice(a, admin.indexOf('</div>', a));
}
ok(/data-t="identity"/.test(bar('server')), 'Identity & reach sits in the Server family');
ok(!/data-t="identity"/.test(bar('client')), 'and no longer in the Client one');
ok(/data-t="clients"/.test(bar('client')), 'the Client family kept its own sections');

// ── Visual rhythm ─────────────────────────────────────────────────────────
// Card titles and lead paragraphs carried their spacing in the tags, in six
// different values, so no two cards breathed quite alike. `.muted` only sets a
// top margin, which is why every lead paragraph had to spell out a bottom one
// or fall back on the browser's 1em.
ok(/\.boardhead h2\{margin:0\}/.test(admin), 'a title in a header row is spaced by the row');
ok(!/<h2 style="margin:0"/.test(admin), 'and no longer says so itself, fifteen times over');
ok(/\.card p\.muted\{margin:0 0 9px\}/.test(admin), 'lead paragraphs share one margin');
ok(!/<p class="muted" style="margin:/.test(admin), 'none of the 35 spells its own out');
ok(/\.card p\.muted\.note\{margin:8px 0 0\}/.test(admin),
  'a note sitting after the content keeps its own spacing, by class');
ok(!/<h2 style="margin:0 0 [68]px">/.test(admin), 'card titles use the common margin');
ok(!/<div class="boardhead" style="margin-bottom:6px">/.test(admin),
  'no header row repeats the margin the sheet already gives it');
ok(/\.rowtop\{margin-top:8px\}/.test(admin), 'action rows share one spacing');
ok(!/<div style="margin-top:8px">/.test(admin), 'written once rather than eleven times');
ok(!/id="dbState" class="msg" style=/.test(admin),
  'the database message lines up with every other message on the page');

// ── Settings rows ─────────────────────────────────────────────────────────
// The same flex declaration used to be retyped in 51 style= attributes, with
// control widths hard-coded in the tags — and an inline style beats the sheet,
// so those widths quietly defeated the mobile rule.
ok(/\n  \.fld\{display:flex/.test(admin), 'the settings row is a class now');
ok(/max-width:560px/.test(admin),
  'the control stays near its label instead of drifting to the far edge');
ok(!/class="defrow" style="display:flex/.test(admin), 'no settings row carries the flex inline any more');
ok((admin.match(/class="defrow fld/g) || []).length === 51, 'all 51 rows use it');
ok(/\.fld\.left\{justify-content:flex-start\}/.test(admin), 'the left-aligned variant survives');
ok(/\.fld\.gap\{margin:10px 0 5px\}/.test(admin), 'so does the wider-margin variant');
ok(/\.fld>input\[type=number\]\{width:110px\}/.test(admin), 'short control widths live in the sheet');
ok(!/<input[^>]*style="width:110px"/.test(admin), 'and not in the tags, where they would win over it');

const fldSmall = (small.match(/\.fld\{[\s\S]*?\}\s*\.fld>input,\.fld>select,\.fld>textarea\{[^}]*\}/) || [''])[0];
ok(/flex:1 1 100%/.test(fldSmall), 'on a phone label and control stack full width');
ok(/max-width:none/.test(fldSmall), 'the desktop width cap is lifted there');
for (const id of ['pxGrace', 'pxGap', 'pxMax', 'tdBlind', 'tdStack']) {
  const tag = (admin.match(new RegExp('<input id="' + id + '"[^>]*>')) || [''])[0];
  ok(tag && !/style="width/.test(tag), id + ' can go full width on a phone');
}

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
