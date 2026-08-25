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
for (const id of ['trafChart', 'trafMusic', 'trafEnv', 'trafCards']) {
  ok(new RegExp('#' + id + '\\)').test(wide), id + ' is not squeezed into half a column');
}
ok(/#panel-traffic>\.cardrow\{column-span:all\}|,#panel-traffic>\.cardrow\{column-span:all\}/.test(wide),
  'a paired row of cards keeps the full width instead of being split again');
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
// Exactly one panel is open at load — the one the active tab points at.
// panel-clients is the first of ITS family, but Server is the family that
// opens, and panel-clients comes earlier in the document: left open, it was
// what you actually saw under the Health & logs tab.
const openAtLoad = [...admin.matchAll(/<div id="(panel-[a-z]+)"(?! style="display:none")[^>]*>/g)]
  .map(m => m[1]);
ok(openAtLoad.length === 1, 'exactly one panel is open at load, not ' + openAtLoad.length);
ok(openAtLoad[0] === 'panel-server', 'and it is the one the active tab points at');
ok(/<button class="tab on" data-t="server">/.test(admin), 'which is the tab marked active');
ok(/#panel-defaults[^{]*\{columns:2/.test(admin), 'the five defaults cards use both columns');
ok(!/#panel-server,/.test(admin), 'a two-card panel no longer asks for two columns');

// ── Language names ────────────────────────────────────────────────────────
// A code has to be decoded; a name reads. Intl covers whatever arrives in
// Accept-Language, so there is no 45-entry table to keep in step.
const lab = body(admin, '_langLabel');
ok(/Intl\.DisplayNames/.test(admin), 'names come from Intl, not from a hand-kept table');
// Passing undefined here takes the browser's locale, which put "chinois" and
// "anglais" in the middle of an English dashboard.
ok(/new Intl\.DisplayNames\(\['en'\]/.test(admin),
  'names are asked for in English, the language the whole panel is written in');
ok(!/new Intl\.DisplayNames\(undefined/.test(admin), 'not in the browser locale');
ok(/\^\[a-z\]\{2,3\}/.test(lab),
  'only something shaped like a language code is looked up, so "ios" stays "ios"');
ok(/n\.toLowerCase\(\)!==k\.toLowerCase\(\)/.test(lab),
  'an unknown code falls back to itself rather than showing twice');
ok(/catch\(e\)/.test(lab), 'a browser without Intl.DisplayNames still shows the codes');
ok(/_envView==='lang' \? _langLabel\(k\) : k/.test(body(admin, '_envLabel')),
  'the lookup only applies to the language view');
ok(/\{key:k,k:_envLabel\(k\)/.test(admin), 'the raw code is kept alongside the label');
ok(/s\.key&&s\.key!==s\.k\?' title="'/.test(admin), 'and shown on hover, where it does not crowd the row');

// ── Log timestamps ────────────────────────────────────────────────────────
// The proxy writes ISO UTC, which is right for a file and unreadable on
// screen — and two hours off from whoever is looking at it.
const fmt = body(admin, 'fmtLogTimes');
ok(/hour12:false/.test(fmt), 'a 24-hour clock, so the columns line up in a monospace font');
ok(/hour:'2-digit',minute:'2-digit',second:'2-digit'/.test(fmt), 'at a fixed width');
ok(/month:'short'/.test(fmt), 'a month in letters, since 08/20 and 20/08 both read as dates');
ok(/d\.toDateString\(\)===today/.test(fmt), "today's lines carry no date, which would eat the width");
ok(/isNaN\(d\)\) return iso/.test(fmt), 'a timestamp that will not parse is left untouched');
ok(/fmtLogTimes\(\(d\.lines\|\|\[\]\)\.join/.test(admin), 'Recent logs goes through it');
ok(/fmtLogTimes\(d\.log\)/.test(admin), 'and so does the action log');
ok(/Times are shown in your own time zone/.test(admin),
  'the panel says so, or the times look wrong next to the file');

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
ok(JSON.stringify([...bar('server').matchAll(/data-t="([a-z]+)"/g)].map(m => m[1]))
   === JSON.stringify(['server', 'deploy', 'proxy', 'access', 'identity', 'servers', 'keys']),
  'the Server sections run in their intended order');
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

// -- Traffic read as trends ------------------------------------------------
// The panel used to answer "how many" and stop there. The analytic row, the
// trend line and the closing paragraph all derive from the SAME /admin/visits
// response - if one of them ever needs a field the proxy does not send, that
// is a proxy change, not a front-end one.
const traf = panel('panel-traffic');
ok(/function _linreg\(vals\)/.test(admin), 'the slope and its correlation are computed, not eyeballed');
ok(/var r=\(sxx&&syy\)\?sxy\/Math\.sqrt\(sxx\*syy\)/.test(admin), 'r comes out of the same pass as the slope');
ok(/Math\.sqrt\(res\/n\)/.test(admin), 'and the noise is the spread around the line, not around the mean');
ok(/function _barChart\(labels,vals,opt\)/.test(admin), 'daily bars have a helper of their own');
ok(/\(opt\.segs\|\|\[\]\)\.forEach/.test(admin), 'with per-half averages drawn over them');
ok(/function _trafInsights\(d,s\)/.test(admin), 'the reading of the numbers lives in one place');
ok(/_trafInsights\(d,s\);/.test(body(admin, 'loadTraffic')), 'and loadTraffic calls it');
ok(/l\.dash\? ';stroke-width:1\.5;stroke-dasharray/.test(admin), 'the trend line is dashed');
ok(/if\(l\.dash\) return;/.test(admin), 'and carries no dot, since no day was measured there');
ok(/if\(s\.length>=5\)/.test(admin), 'two points do not make a trend, so a short window shows none');
ok(/Math\.abs\(reg\.r\)>=0\.32/.test(admin), 'a weak correlation is reported as flat rather than as a direction');
for (const id of ['trafRange', 'trafKpis', 'trafTrendNote', 'trafNew', 'trafNewNote', 'trafBottom']) {
  ok(traf.includes('id="' + id + '"'), id + ' has a home in the panel');
}
ok(/#trafKpis\)/.test(wide) && /#trafNew\)/.test(wide) && /#trafBottom\)/.test(wide),
  'the analytic cards take the full width back instead of being halved');
ok(/\.headnote\{flex:1 1 120px/.test(admin), 'a chart note sits beside its title and takes the slack');
ok(/\.kpi \.big\{/.test(admin) && /\.kpi \.sub\{/.test(admin), 'the analytic tile has a figure and a sentence');
ok(/rgba\(255,255,255,\.03\)/.test((admin.match(/\.kpi\{[^}]*\}/) || [''])[0]),
  'and the same frame as the older tiles, so the two rows read as one family');

// -- The hour of the day ---------------------------------------------------
// Two hourly buckets, and three states to survive: a proxy that does not send
// them at all, one that sends them empty, and one with real data. The first is
// the one that matters - drawing an empty day there would be a lie told with a
// chart.
ok(/function _trafHours\(d\)/.test(admin), 'the hourly views live in one function');
ok(/var hourLine=_trafHours\(d\);/.test(body(admin, '_trafInsights')), 'called from the reading pass');
ok(/var known=\(d\.hours48!==undefined\)/.test(admin), 'a missing field is detected, not treated as zero');
ok(/needs a proxy restart/.test(admin), 'and says plainly that the running proxy predates it');
ok(/if\(!V \|\| days<0\.5\)/.test(admin), 'an average day is not drawn from half a day of data');
ok(/for\(var a=0;a<24;a\+\+\)/.test(admin) && /\(a\+k\)%24/.test(admin),
  'the quiet stretch is searched circularly, since the night straddles midnight');
ok(/opt\.hi && opt\.hi\.to>=opt\.hi\.from/.test(admin), 'a chart can shade a span of hours');
ok(/opt\.ref!==undefined/.test(admin), 'and carry a reference line, which is what 1.0 means here');
ok(/colFn:function\(v,i\)\{ return i===h48\.length-1/.test(admin),
  'the hour in progress is drawn apart, so it is not read as a drop');
ok(/last bar is the hour in progress/.test(admin), 'and the note says so');
for (const id of ['traf48', 'traf48Note', 'trafHours', 'trafHoursNote']) {
  ok(traf.includes('id="' + id + '"'), id + ' has a home in the panel');
}
ok(/#traf48\)/.test(wide) && /#trafHours\)/.test(wide), 'both hourly cards keep the full width');
ok(traf.indexOf('id="traf48"') < traf.indexOf('id="trafKpis"'),
  'the last 48 hours sit right under the counters, where the eye lands first');

// -- One language on screen ------------------------------------------------
// The dashboard is written in English; a French card in the middle of it was a
// leftover, not a choice.
ok(!/Exclure mes propres visites|Ne pas compter mes visites/.test(admin),
  'no French left in the traffic panel');
ok(/<h2>Exclude my own visits<\/h2>/.test(traf), 'the opt-out card is in English');
ok(traf.indexOf('id="trafBottom"') < traf.indexOf('id="btnNoCount"'),
  'and sits with the settings at the foot, not between two charts');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
