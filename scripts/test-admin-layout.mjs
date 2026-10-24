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
const proxy = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'proxy.js'), 'utf8');
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
const wide = (admin.match(/@media\(min-width:1280px\)\{[\s\S]*?\n  \}/) || [''])[0];
// Every mobile block, concatenated: the phone rules are written in more than
// one place, and a guard that reads only the first would pass or fail on where
// a rule happens to sit rather than on whether it exists.
const small = (admin.match(/@media\(max-width:600px\)\{[\s\S]*?\n  \}/g) || []).join('\n');
const narrow = (admin.match(/@media\(max-width:899px\)\{[\s\S]*?\n  \}/g) || []).join('\n');
const shellJs = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'modules', 'admin', 'shell.mjs'), 'utf8');

// ── Side menu (2.1.10-web.117) ────────────────────────────────────────────
// The three families on top and their horizontal section bars made way for a
// side menu grouped by what the operator is doing. The buttons kept their
// classes, so the handlers that open a panel are the same as before.
const GROUPS = {
  overview: ['overview'],
  live: ['sessions', 'livemap'], stats: ['traffic/overview', 'traffic/world', 'traffic/audience', 'traffic/activity', 'traffic/visitors', 'traffic/music', 'traffic/ace'], community: ['board', 'polls', 'broadcast', 'arena', 'landir'],
  content: ['packages', 'music'], players: ['login', 'lobby', 'firstvisit', 'features'], infra: ['servers', 'proxy', 'database', 'identity'],
  ops: ['server', 'errors', 'deploy', 'backup'], security: ['keys', 'audit', 'blocked'],
};
function grp(g) {
  const a = admin.indexOf('<div class="sgrp');
  const i = admin.indexOf('data-g="' + g + '"', a);
  if (a < 0 || i < 0) return '';
  const end = admin.indexOf('<div class="sgrp', i);
  const navEnd = admin.indexOf('</nav>', i);
  return admin.slice(i, end < 0 || end > navEnd ? navEnd : end);
}
const order = [...admin.matchAll(/<div class="sgrp(?: one)?" data-g="([a-z]+)">/g)].map(m => m[1]);
ok(JSON.stringify(order) === JSON.stringify(Object.keys(GROUPS)), 'the menu groups run in their intended order: ' + order.join(', '));
let all = [];
for (const [g, tabs] of Object.entries(GROUPS)) {
  const seg = grp(g);
  const got = [...seg.matchAll(/class="tab(?: on)?" data-t="([a-z]+)"(?: data-ts="([a-z]+)")?/g)].map(m => m[1] + (m[2] ? '/' + m[2] : ''));
  ok(JSON.stringify(got) === JSON.stringify(tabs), 'group ' + g + ' holds ' + tabs.join(', ') + ' (got ' + got.join(', ') + ')');
  ok(/<button type="button" class="gtab(?: on)?" data-g="/.test(seg), 'group ' + g + ' has its button');
  ok(new RegExp('class="tabs subtabs" data-g="' + g + '"').test(seg), 'and its list of sections');
  ok(/<svg class="gi" viewBox="0 0 256 256" aria-hidden="true"/.test(seg), 'and a decorative Phosphor icon');
  ok(new RegExp('<div class="sgrp' + (tabs.length === 1 ? ' one' : '') + '" data-g="' + g + '">').test(admin),
    tabs.length === 1 ? 'a one-section group opens its section directly' : 'a group of several unfolds its list');
  all = all.concat(got);
}
ok(all.length === 32 && new Set(all).size === 32, 'every one of the thirty-two sections is reachable, once');
for (const sc of ['packages', 'music', 'broadcast', 'polls', 'leaderboard']) {
  ok(new RegExp('data-scope="' + sc + '"').test(admin), 'scope ' + sc + ' survived the move');
}
ok(/class="gtab on" data-g="overview"/.test(admin), 'the dashboard opens on Overview');
ok(/<button type="button" class="tab on" data-t="overview">/.test(admin), 'its one section is the active one');
ok((admin.match(/class="(?:gtab|tab) on"/g) || []).length === 2, 'and nothing else is marked active');
ok(/\.sgrp\.one \.gcar,\.sgrp\.one \.subtabs\{display:none!important\}/.test(admin), 'a one-section group shows no list to unfold');
ok(/@media\(min-width:900px\) and \(max-height:1000px\)\{\n    \.side\{gap:10px;[^}]*\}\n    \.side \.gtab\{min-height:36px\}\n    \.side \.tab\{min-height:30px\}/.test(admin), 'on a short screen the menu tightens so Statistics fits without a scroll bar (web.193)');
ok(/function setGroup\(g, pick\)/.test(admin), 'setGroup exists');
ok(/\.gtab'\)\.forEach/.test(admin), 'group buttons are wired');
ok(/bar\.classList\.contains\('subtabs'\)\) setGroup\(bar\.dataset\.g, false\)/.test(admin),
  'reaching a section from code opens its group, without re-picking one');
const scope = body(admin, 'applyScopeVisibility');
ok(/gb\.style\.display = any/.test(scope), 'a group with nothing left in it disappears');
ok(/if\(live && !document\.querySelector\('\.gtab\.on'\)\) setGroup\(live, true\)/.test(scope),
  'a scoped key lands on a group it can actually open');
ok(/grp\.classList\.toggle\('one'/.test(scope), 'a group a scoped key sees one section of opens it directly too');
ok(/querySelectorAll\('\.tab'\)/.test(scope) && !/querySelectorAll\('\.gtab, \.tab'\)/.test(scope),
  'group buttons carry no data-scope of their own');
ok(!/tabsFade/.test(admin), 'the horizontal bars are gone, and the edge fade with them');
ok(!/class="tabs gtabs"/.test(admin) && !/\.gtabs\{/.test(admin), 'no rule is left for the old family row');
ok(/scrollIntoView\(\{block:'nearest',inline:'nearest'\}\)/.test(admin),
  'picking a section keeps it in view in a menu taller than the screen');

// ── Shell layout ──────────────────────────────────────────────────────────
ok(/\.shell\{display:grid;grid-template-columns:var\(--sidew\) minmax\(0,1fr\)/.test(admin), 'menu and page side by side');
ok(/\.side\{position:sticky;top:0;height:100vh;height:100dvh/.test(admin), 'the menu stays put while the page scrolls');
ok(/\.snav\{[^}]*overflow-y:auto/.test(admin), 'and scrolls on its own when taller than the screen');
ok(/dash\.style\.display=v==='dash'\?'':'none'/.test(admin), 'showing the dashboard clears display, so the grid applies');
ok(/\.pagebody\{max-width:1600px\}/.test(admin), 'the page takes the width, up to where lines stop being readable');
ok(/\.side\{position:fixed;[^}]*transform:translateX\(-102%\)/.test(narrow), 'under 900px the menu becomes a drawer');
ok(/\.shell\.open \.side\{transform:none;visibility:visible\}/.test(narrow), 'opened by the menu button');
ok(/\.shell\.open \.scrim\{display:block/.test(narrow), 'over a scrim that closes it');
ok(/\.sclose,\.menubtn\{display:inline-flex\}/.test(narrow), 'both buttons only exist there');
ok(/\.main \.top\{position:sticky;top:0/.test(narrow), 'the page header stays at hand on a phone');
ok(/prefers-reduced-motion:reduce\)\{ \.side\{transition:none\} \}/.test(admin), 'the drawer does not slide for who asked for no motion');
ok(/env\(safe-area-inset-top\)/.test(admin) && /viewport-fit=cover/.test(admin), 'an installed app on a notched phone keeps clear of the notch');
ok(/id="menuBtn" aria-label="Open the menu" aria-controls="side" aria-expanded="false"/.test(admin), 'the menu button says what it controls');
ok(/<script type="module" src="\/modules\/admin\/shell\.mjs"><\/script>/.test(admin), 'the shell module is loaded');
ok(/menuBtn\.setAttribute\('aria-expanded', 'true'\)/.test(shellJs), 'and keeps aria-expanded in step');
ok(/e\.key === 'Escape'/.test(shellJs), 'Escape closes the drawer');
ok(/if \(e\.isTrusted \|\| groupByHand\) location\.hash = t;/.test(shellJs) && /history\.replaceState/.test(shellJs),
  'a section picked by hand is a step for the back button; one picked by code is not');
ok(/b\.style\.display !== 'none'/.test(body(shellJs, 'tabFor')), 'a route never opens a section the key may not see');
ok(/\.click\(\)/.test(body(shellJs, 'openFromHash')), 'a route opens a section by its own button, loaders included');
ok(/gb\.textContent !== txt/.test(shellJs), 'the group badge only writes on change, so its observer settles');

// ── Two columns on a wide screen ──────────────────────────────────────────
ok(wide !== '', 'the two-column block exists, past 1280px once the menu takes its share');
ok(/columns:2/.test(wide), 'the busiest panels split into two columns');
ok(/#panel-broadcast|#panel-login/.test(wide), 'the split is opt-in per panel, not global');
ok(/break-inside:avoid/.test(wide), 'a card is never cut across the column break');
ok(/-webkit-column-break-inside:avoid/.test(wide), 'with the WebKit spelling alongside');
ok(!/#panel-traffic/.test(wide), 'the traffic panel does not ask for two columns');
ok(!/#trafChart|#trafCards|#trafEnv|#trafMusic/.test(wide), 'and needs no per-chart exception to win its width back');
ok(!/columns:2/.test(small), 'nothing changes on a phone');

// ── Header ────────────────────────────────────────────────────────────────
// Two admin tabs look alike down to the pixel; the host tells them apart.
ok((admin.match(/PokerTH Web Client — Admin/g) || []).length === 2,
  'the product is named in full in the window title and on the login screen');
ok(/BASE_TITLE = 'PokerTH Web Client \u2014 Admin'/.test(shellJs), 'and the window title names the open section before it');
ok(/<b>PokerTH Admin<\/b><span id="sideHost"/.test(admin), 'the menu carries the brand and the host');
ok(!/PokerTH — Admin/.test(admin), 'the old short form is gone');
ok(/<div class="tophost" id="topHost"/.test(admin), 'the page header carries a host chip');
ok(/h\.textContent=location\.host/.test(admin) && /sh\.textContent=location\.host/.test(admin) && !/location\.hostname/.test(admin),
  'filled from the URL, host and not hostname — a panel on an odd port has to say so');
ok(/\.tophost\{flex:0 0 auto/.test(admin), 'the chip is sized by its text');
ok(/\.tophost\{[^}]*text-overflow:ellipsis/.test(admin), 'a long host is clipped, not allowed to shove the buttons off');
ok(/\.main \.top \.tophost\{display:none\}/.test(narrow), 'on a phone the menu shows the host, the header keeps the title');
ok(/<p class="eyebrow" id="pageGroup">PokerTH Admin<\/p><h1 id="pageTitle">Overview<\/h1>/.test(admin),
  'the page header names the section, Overview at load');
ok(/g && g !== t \? g : 'PokerTH Admin'/.test(shellJs), 'a section alone in its group does not repeat its name above itself');
// web.302: « Tournaments » carries a « beta » badge; the title read it as
// « Tournamentsbeta ». The label leaves the badge out, the title shows it apart.
ok(/querySelectorAll\('\.tbadge,\.tbeta,\.gbadge,svg'\)/.test(shellJs) && /h\.appendChild\(beta\.cloneNode\(true\)\)/.test(shellJs), 'a beta badge is never glued to the section title');
ok(/id="sideVer"/.test(admin) && /\$\('sideVer'\)/.test(admin), 'the menu shows the running build');
ok(/id="sideWho"/.test(admin) && /\$\('sideWho'\)/.test(admin), 'and which key is signed in');
ok(/<button id="themeBtn"/.test(admin) && /<button id="logoutBtn"/.test(admin), 'theme and log-out sit at the foot of the menu, ids unchanged');
ok(/btn\.innerHTML = l \? MOON : SUN/.test(admin), 'the theme button draws a sun or a moon, not an emoji');
ok(/meta\[name="theme-color"\]/.test(admin), 'the browser chrome follows the admin theme');
ok(/<link rel="manifest" href="\/admin-manifest\.json">/.test(admin), 'the admin installs as an app of its own');
ok(/<link rel="apple-touch-icon"/.test(admin) && /apple-mobile-web-app-capable/.test(admin), 'including on iOS');
// Its own icon (web.139, narmod): the TH chip, not the player client's.
{
  const { existsSync } = await import('node:fs');
  const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
  const man = JSON.parse(readFileSync(join(pub, 'admin-manifest.json'), 'utf8'));
  const links = [...admin.matchAll(/<link rel="(?:icon|apple-touch-icon)" href="([^"]+)"/g)].map((m) => m[1]);
  ok(links.length >= 3 && links.every((h) => h.indexOf('/admin-icons/') === 0), 'the admin tab shows its own icon (' + links.length + ' links)');
  ok(man.icons.length === 4 && man.icons.every((i) => i.src.indexOf('/admin-icons/') === 0) && man.icons.some((i) => i.purpose === 'maskable'),
    'and so does the installed admin app, maskable included');
  ok(links.concat(man.icons.map((i) => i.src)).every((h) => existsSync(join(pub, h))), 'every icon file is in public/admin-icons');
}
ok(/@font-face\{font-family:'Inter';src:url\('\/fonts\/InterVariable\.woff2'\)/.test(admin), 'in Inter, the font of the QML client, self-hosted');

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
  'panel-server': 2, 'panel-proxy': 1, 'panel-deploy': 3, 'panel-backup': 2, 'panel-database': 1, 'panel-audit': 1, 'panel-blocked': 1,
  'panel-login': 7, 'panel-lobby': 3, 'panel-firstvisit': 2, 'panel-features': 1, 'panel-identity': 1,
};
for (const [id, count] of Object.entries(PANELS)) {
  const seg = panel(id);
  ok(seg !== '', id + ' exists');
  ok((seg.match(/<div class="card"/g) || []).length === count,
    id + ' carries its ' + count + ' card' + (count === 1 ? '' : 's'));
}
for (const t of ['proxy', 'deploy', 'backup', 'audit', 'blocked', 'login', 'lobby', 'firstvisit', 'features', 'identity']) {
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
ok(openAtLoad[0] === 'panel-overview', 'and it is the one the active tab points at');
ok(/<button type="button" class="tab on" data-t="overview">/.test(admin), 'which is the tab marked active');
ok(/#panel-login,#panel-lobby,#panel-firstvisit[^{]*\{columns:2/.test(admin), 'Login screen, Lobby & tables and First visit use both columns');
ok(!/#panel-features[^{]*\{columns:2/.test(admin), 'Features keeps one wide card');
ok(!/#panel-server,/.test(admin), 'a two-card panel no longer asks for two columns');
// ── One-line summaries (web.164) ──────────────────────────────────────────
// A card opens on a short summary; the detail folds under « details ». The
// Statistics explanations are left out: they hide behind their own Explain switch.
{
  const bodyHtml = admin.slice(admin.indexOf('<body'), admin.indexOf('<script', admin.indexOf('<body')));
  const outside = bodyHtml.replace(/<details[\s\S]*?<\/details>/g, '');
  const long = [...outside.matchAll(/<p class="muted([^"]*)"[^>]*>([\s\S]*?)<\/p>/g)]
    .filter((m) => !/xpl/.test(m[1]))
    .map((m) => m[2].replace(/<[^>]+>/g, '').trim())
    .filter((t) => t.split(/\s+/).length > 45);
  ok(long.length === 0, 'no card summary runs past 45 words' + (long.length ? ': ' + long[0].slice(0, 60) : ''));
  ok((admin.match(/<details class="more">/g) || []).length >= 25, 'the detail folds under « details » instead');
}

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
// The hover text now prefers an explanation where there is one ("other" means
// something different in each view), and falls back to the raw code.
ok(/_envTitle\(s\.key\)\|\|\(s\.key!==s\.k\?s\.key:''\)/.test(admin),
  'and shown on hover, where it does not crowd the row');

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
// web.177: the leaderboard reset period became a settings row (75).
// web.192: + the database Type row (76).
// web.323: + the three rows of « Where the Arena runs » (79).
ok((admin.match(/class="defrow fld/g) || []).length === 79, 'all 79 rows use it');
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
ok(/l\.dash\? ';stroke-width:'\+\(1\.5\*k\)\.toFixed\(2\)\+';stroke-dasharray/.test(admin), 'the trend line is dashed');
ok(/if\(l\.dash\) return;/.test(admin), 'and carries no dot, since no day was measured there');
ok(/if\(_fit\.length>=4\)/.test(admin), 'two points do not make a trend, so a short window shows none');
ok(/Math\.abs\(reg\.r\)>=0\.32/.test(admin), 'a weak correlation is reported as flat rather than as a direction');
for (const id of ['trafRange', 'trafKpis', 'trafTrendNote', 'trafNew', 'trafNewNote', 'trafBottom']) {
  ok(traf.includes('id="' + id + '"'), id + ' has a home in the panel');
}
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
ok(traf.indexOf('id="trafKpis"') < traf.indexOf('id="traf48"'),
  'the figures are read before the charts that detail them');

// -- Coming back -----------------------------------------------------------
// The one number the panel never had. Three states again, and one rule that
// matters more than the charts: a verdict is stated only where it was measured.
ok(/function _trafCohorts\(d\)/.test(admin), 'the cohort view lives in one function');
ok(/var retLine=_trafCohorts\(d\);/.test(body(admin, '_trafInsights')), 'called from the reading pass');
ok(/if\(d\.cohorts===undefined\)/.test(admin), 'a proxy that predates it says so');
ok(/if\(!c\.known\)/.test(admin), 'and a store with nothing dated yet says something else again');
ok(/too recent/.test(admin), 'a cohort too young to judge is named, not shown as 0%');
ok(/_retVerdict=!!d7\.n;/.test(admin), 'the verdict is claimed only when a 7-day cohort exists');
ok(/\(_retVerdict\? '\.' :/.test(body(admin, '_trafInsights')),
  'and the volume-based guess steps aside exactly then, so the panel never states two');
ok(/pc\(d7\.back,d7\.n\)<40\?'retention':'acquisition'/.test(admin), 'the verdict reads the return rate');
for (const id of ['trafRet', 'trafRetNote']) ok(traf.includes('id="' + id + '"'), id + ' has a home in the panel');
ok(traf.indexOf('id="trafRet"') > traf.indexOf('data-ts="audience" role="tabpanel"'),
  'the cohorts sit with the audience; the conclusion they feed is read on the overview');

// -- One section at a time ----------------------------------------------------
// Six cards stacked on one page still read as a wall. The panel is split under
// its own sub-tabs - Overview, Audience, Activity, Visitors, Music, Ace's Help,
// Data -
// one on screen at a time, and the long explanations fold behind a single
// Explanations switch. Every section stays in the DOM: loadTraffic fills them
// all, the bar only chooses which one is visible.
// web.184: Data is gone, its cards moved to Database, Backup, Summary and the side menu.
const TS = ['overview', 'audience', 'activity', 'visitors', 'music', 'ace'];
const TS8 = ['world'].concat(TS);
function tsub(k) {
  const i = traf.indexOf('<div class="tsub" data-ts="' + k + '"');
  if (i < 0) return '';
  const j = traf.indexOf('<div class="tsub" data-ts="', i + 10);
  return traf.slice(i, j < 0 ? undefined : j);
}
// Since web.119 the side menu picks the section: no tab row of its own.
const menuStats = [...admin.matchAll(/class="tab" data-t="traffic" data-ts="([a-z]+)"/g)].map(m => m[1]);
ok(!/id="trafSub"/.test(admin) && !/\.trafsub/.test(admin), 'the panel no longer carries its own tab row');
// web.179: Summary first (it was World since web.119), like the first entry of every other group.
ok(JSON.stringify(menuStats) === JSON.stringify(['overview', 'world'].concat(TS.slice(1))), 'the menu lists the sections, Summary first: ' + menuStats.join(', '));
ok(TS.every(k => tsub(k)), 'each sub-tab has its section');
ok(TS.every((k, i) => !i || traf.indexOf('data-ts="' + TS[i - 1] + '" role="tabpanel"') < traf.indexOf('data-ts="' + k + '" role="tabpanel"')),
  'the sections keep their reading order in the page');
ok(/<div class="tsub" data-ts="overview" role="tabpanel" aria-label="Overview">/.test(traf),
  'the overview is the one visible before any script runs');
ok(TS.slice(1).every(k => /^<div class="tsub" data-ts="[a-z]+" role="tabpanel" aria-label="[^"]+" style="display:none">/.test(tsub(k))),
  'and the others start hidden');
const home = {
  overview: ['trafCards', 'trafKpis', 'trafBottom'],
  audience: ['trafChart', 'trafNew', 'trafRet'],
  activity: ['traf48', 'trafHours', 'trafModes48', 'trafPth', 'trafModes', 'trafLive'],
  visitors: ['trafEnv'],
  music: ['trafMusic', 'musSince'],
  ace: ['guideSec', 'trafGuide', 'guideSince'],
};
for (const [k, ids] of Object.entries(home)) {
  for (const id of ids) ok(tsub(k).includes('id="' + id + '"'), id + ' lives under ' + k);
}
ok(/<section class="ovmodes" id="trafCards"/.test(traf) && /<section class="ovmodes" id="trafKpis"/.test(traf), 'Summary’s figures are rows of the admin tile, not boxes in a card (web.181)');
ok(/#trafCards>\.tstat,#trafKpis>\.kpi\{[^}]*border-top:3px solid var\(--mc,var\(--muted\)\)/.test(admin) && /#trafCards>\.tstat\.up,#trafKpis>\.kpi\.up\{--mc:var\(--ok-text\)/.test(admin), 'their top edge carries the trend');
ok(tsub('overview').indexOf('id="trafKpis"') < tsub('overview').indexOf('id="trafBottom"'),
  'the overview reads the figures, then the conclusion drawn from them');
// web.180: one card per subject, as on every other admin page (the
// sections of web.119 were rules inside one card per page).
for (const h of ['Bottom line', 'Daily visits', 'New devices per day', 'Coming back', 'Last 48 h', 'Time of day',
  'Last 48 h by entry mode', 'pokerth.net vs web client', 'Where sessions open', '/live spectator view',
  'What visitors run', 'Where visitors come from', 'Most played tracks', 'Offer, tips and Ranking funnel',
  'Reset traffic stats']) {
  ok(traf.includes('<h2>' + h + '</h2>'), 'a card is headed ' + h);
}
ok(/<section class="card trafhead statbar" aria-label="Filters for every page of Statistics">/.test(traf), 'one filter card heads every section');
for (const id of ['trafModeSel', 'trafPeriod', 'trafRange', 'trafBots', 'trafXpl', 'btnTrafRefresh']) ok(traf.includes('id="' + id + '"'), id + ' is in the filter card');
ok(traf.indexOf('id="trafModeSel"') < traf.indexOf('<div class="tsub"'), 'above every section');
ok(!/data-ts="data"/.test(admin), 'no Data page any more (web.184), so no filter card to hide');
for (const h of ['Trends', 'Retention', 'Recent activity', 'Connections', 'Who visits', 'Ace’s Help', 'Data &amp; settings']) {
  ok(!traf.includes('<h2>' + h + '</h2>'), 'no card groups subjects under « ' + h + ' » any more');
}
ok((traf.match(/class="cardrow"/g) || []).length === 1 && /<div class="cardrow">\s*<div class="card wcard" style="--mc:var\(--m-net\)">/.test(traf),
  'one paired row only: Internet and LAN side by side');
ok(!/class="tsec"/.test(admin) && !/\.tsec\b/.test(admin), 'no section-inside-a-card is left, nor its style');
ok((admin.match(/<p class="muted fsnote" data-fs="[a-z_ ]+" data-master="1"><\/p>/g) || []).length === 3 && /var FS_HOME=\{lobby_clock:\['lobby'/.test(admin), 'the lobby clock, Events tab and polls cards point at their Features switch, and back (web.188)');
// web.195: the live map is a page of its own, Live › Map, with the same mode tiles as Sessions.
ok(panel('panel-livemap').includes('id="lmMap"') && panel('panel-livemap').includes('id="lmTiles"') && !panel('panel-sessions').includes('id="lmMap"'), 'Live › Map holds the live map, with its tiles');
ok(/_lmRender\(rows\.filter\(function\(r\)\{ return _seSel==='all' \|\| r\.k===_seSel; \}\), d\);/.test(admin), 'drawn from the connections of the mode picked on the tiles');
ok(/if\(t==='sessions'\|\|t==='livemap'\)\{ seStart\(\); \}/.test(admin), 'one 5 s poll serves both pages');
ok(/var page = card\.closest\('\.tsub'\) \|\| card\.closest\('\[id\^="panel-"\]'\);\n      if\(page && page\.querySelectorAll\('\.card'\)\.length===1\) return;/.test(admin), 'the only card of a page does not fold (web.187)');
ok(/#panel-traffic \.card>\.boardhead>h2\{white-space:nowrap\}/.test(admin), 'a card title does not break, so its note can take the slack');
// S7 (audit 2026-10-20): a card whose title sits in a .boardhead folds too, the
// same way as a header-first card, with the arrow right after the title.
ok(/if\(first===h2\) head = h2;[^\n]*\n\s+else if\(first && first\.classList\.contains\('boardhead'\) && first\.contains\(h2\)\) head = first;/.test(admin)
  && /while\(head\.nextSibling\) body\.appendChild\(head\.nextSibling\);/.test(admin), 'a .boardhead card folds: its head stays, its body folds, its buttons keep their job');
ok(/var h2 = card\.querySelector\('h2'\); if\(!h2\) return;/.test(admin) && /first\.tagName==='STYLE' \|\| first\.tagName==='SCRIPT'/.test(admin),
  'the first title leads (subtitles allowed in the body), a <style> opening the card is skipped');
ok(/\.card h2\.collap-h::after\{content:'\\25BE';display:inline-block;margin-left:8px/.test(admin) && !/h2\.collap-h::after\{[^}]*position:absolute/.test(admin),
  'the fold arrow follows the title on every card');
const cards = (k) => (tsub(k).match(/<div class="card"/g) || []).length;
ok(cards('audience') === 3 && cards('activity') === 6 && cards('visitors') === 2 && cards('music') === 1 && cards('ace') === 1,
  'one card per subject: Audience 3, Activity 6, Visitors 2, Music 1, Ace’s Help 1');
for (const k of ['world', 'audience', 'activity', 'visitors', 'music', 'ace']) {
  ok(new RegExp('<div class="tsub" data-ts="' + k + '"[^>]*>\\n      <section class="ovmodes" id="tsT-' + k + '"').test(traf), k + ' opens on a row of tiles (web.182)');
}
ok(/_tsAudience\(d\); _tsActivity\(d\); _tsVisitors\(\); _tsMusic\(\); _tsAce\(\); _tsWorld\(\);/.test(admin), 'filled from the figures the page already has');
ok(/<div class="card" id="srcSec">/.test(traf) && /<div class="card" id="guideSec">/.test(traf), 'a subject keeps its id on its card');
for (const id of ['btnTrafReset', 'trafModes', 'trafEnv', 'trafMusic']) {
  ok(traf.includes('id="' + id + '"'), id + ' survived the split');
}
// Explanations: folded by default, one switch, remembered. The settings keep
// their warnings in view - a reset that hides its own warning is not tidier.
ok(/<button id="trafXpl" class="use" aria-pressed="false"/.test(traf), 'one Explanations switch, off by default');
ok(/#panel-traffic:not\(\.xpl-on\) \.xpl\{display:none\}/.test(admin), 'it folds every explanation of the panel at once');
ok((traf.match(/class="muted xpl"/g) || []).length >= 10, 'the reading sections tag their explanations');
ok(/<h2>Reset traffic stats<\/h2>\n        <p class="muted">⚠ This permanently deletes ALL visit data/.test(tsub('overview')), 'the reset keeps its warning in view, at the foot of Summary');
ok(tsub('overview').indexOf('id="trafBottom"') < tsub('overview').indexOf('id="btnTrafReset"'), 'after everything that is read');
ok(/function _trafSub\(k\)/.test(admin) && /function _trafXpl\(on\)/.test(admin), 'switching lives in two small functions');
ok(/localStorage\.setItem\('pth_admin_traf_xpl',on\?'1':'0'\)/.test(admin), 'the Explanations switch is remembered per browser, like the period');
ok(!/pth_admin_traf_sub/.test(admin), 'the section is in the address now (#traffic/world), not in browser storage');
ok(/if\(TRAF_SUBS\.indexOf\(k\)<0\) k='overview';/.test(admin), 'an unknown section falls back to Summary');
ok(/if\(k==='summary'\|\|k==='data'\) k='overview';/.test(admin), 'and #traffic/summary is Summary (the former #traffic/data too)');
ok(/if\(k==='features'\) k='music';/.test(admin), 'and the former Features tab lands on Music');
ok(/if\(t==='traffic'\)\{ if\(_wasT!=='traffic'\) loadTraffic\(\); _trafSub\(b\.dataset\.ts\|\|'overview'\); \}/.test(admin),
  'Statistics reads its figures on entry, not on every section change');
ok(/sectionEvent\(t\+\(b\.dataset\.ts\?'\/'\+b\.dataset\.ts:''\)\)/.test(admin), 'a section announces its page too');
ok(/function idOf\(b\) \{ return b\.dataset\.t \+ \(b\.dataset\.ts \? '\/' \+ \(TS_ADDR\[b\.dataset\.ts\] \|\| b\.dataset\.ts\) : ''\); \}/.test(shellJs), 'and has its own address');
ok(/const TS_ADDR = \{ overview: 'summary' \};/.test(shellJs) && /const TS_PAGE = \{ summary: 'overview', data: 'overview' \};/.test(shellJs), 'Summary answers to #traffic/summary, and the old #traffic/overview still works');

// -- Entry modes, chosen once for every section ---------------------------
ok(/var _trafModeSel=MODE48\.map/.test(admin) && /localStorage\.setItem\('pth_admin_modes'/.test(admin), 'the entry modes picked are kept per browser');
ok(/if\(!_trafModeSel\.length\) _trafModeSel=MODE48\.map/.test(admin), 'switching the last one off brings every mode back, never none');
ok(/var lines=_modesOn\(\)\.map/.test(admin), 'the 48 h chart by mode follows them');
ok(/\.filter\(function\(rw\)\{ return _modeOn\(rw\[1\]\); \}\)/.test(admin), 'and Where sessions open');
ok(/if\(_geoLayer==='conn'\)\{ var m=c\.m\|\|\{\}, t=0; _modesOn\(\)\.forEach/.test(admin), 'and the Connections layer of the map');
ok(/c:'var\(--m-net\)'/.test(admin) && /c:'var\(--m-lan\)'/.test(admin) && /c:'var\(--m-off\)'/.test(admin) && /c:'var\(--m-live\)'/.test(admin),
  'one set of mode colours for the whole admin, themed');
ok(/A visit is counted before any mode is chosen/.test(admin), 'the bar says what the modes cannot narrow');

// -- World ------------------------------------------------------------------
ok(/var GEO_LAYERS=\[\['v','Visits'\],\['nw','New devices'\],\['conn','Connections'\],\['pwa','Installed app'\],\['mob','Phones'\]\];/.test(admin), 'five layers on the map');
// Narrow to (web.126): the cube read by the World page.
ok(/<div class="sbrow nrrow"><span class="sblbl">Narrow to<\/span><div class="chips" id="trafNarrow"/.test(admin) && /id="trafNarrowPop" role="dialog"/.test(admin), 'a third row in the filter card: Narrow to, with its list');
ok(/var NARROW_DIMS=\[\['cc','Country'\],\['dev','Device'\],\['app','App'\],\['new','New or known'\],\['lan','LAN server'\],\['acc','Account'\]\];/.test(admin), 'six dimensions to narrow by');
ok(/localStorage\.setItem\('pth_admin_narrow'/.test(admin), 'kept per browser');
const cl = body(admin, '_cubeLoad');
ok(/_cubeGet\('c',_narrowF\(NARROW_C\),'mode'\)/.test(cl) && /_cubeGet\('c',_narrowF\(NARROW_C,'mode:lan'\),'lan'\)/.test(cl) && /_cubeGet\('l',_narrowF\(NARROW_L\),'acc'\)/.test(cl) && /_cubeGet\('c',_narrowF\(NARROW_C,modes\),'cc'\)/.test(cl),
  'narrowed: by mode for the chart and cards, by server for LAN, by account for logins, by country for the map');
ok(/if\(seq!==_cubeSeq\) return;/.test(cl), 'a late answer never paints over a newer one');
ok(/encodeURIComponent\(f\)/.test(body(admin, '_cubeGet')) && /_perQuery\(\)/.test(body(admin, '_cubeGet')), 'the cube follows the period, range and robots of the page');
ok(/Visits and the other pages show everything\./.test(admin), 'the bar says what the narrowing cannot reach');
ok(/function _cv\(v\)\{ return typeof v==='string' \? 1 : \(v\|\|0\); \}/.test(admin) && /fewer than 3/.test(admin), 'a masked cell is drawn as 1 and said to be under 3');
ok(/if\(_narrowOn\(\)\) _cubeLoad\(\);/.test(body(admin, '_pickMode')), 'the entry modes re-read the narrowed map');
// Live now left World in web.196: the open connections by country are Live › Map.
ok(!/\['now','Live now'\]/.test(admin) && !/_geoLive/.test(admin) && !/_geoLayer==='now'/.test(admin), 'World has no Live now layer any more (it is Live › Map)');
ok(/return \(_geoData&&_geoData\.countries\)\|\|\{\}; \}/.test(body(admin, '_geoC')), 'every layer draws from the period');
ok(/if\(_geoNarrowed\(\)\)\{ var o=\{\}, by=_cube\.A\.period\.by/.test(body(admin, '_geoC')), 'and the Connections layer from the cube while narrowed');
ok(/var C=_geoC\(\), ccs=Object\.keys\(C\)/.test(admin) && /var C=_geoC\(\), c=C\[_geoSel\];/.test(admin), 'the map, the list and the country card all read the same source');
ok(/var cc=\/\^\[A-Z\]\{2\}\$\/\.test\(r\.cc\|\|''\)\?r\.cc:'ZZ'/.test(admin), 'on Live › Map, a connection without a country counts as Unknown, not dropped');
ok(/id="geoLayers" role="group" aria-label="What the map shows"/.test(admin), 'picked above it');
ok(/box\.innerHTML=_geoHours\(M,vb\)\+'<svg/.test(admin), 'the local-time band sits above the map');
const hrs = body(admin, '_geoHours');
ok(/_neProj\(M,/.test(hrs), 'placed in the map projection, so it lines up with the night');
ok(/var now=Date\.now\(\), step=\(vw\|\|_geoView\)==='world'\?2:1/.test(hrs), 'every 2 h on the world, every hour on a region');
ok(/box\.innerHTML=_geoHours\(M,vb,_lmView\)\+'<svg/.test(body(admin, '_lmRender')), 'Live › Map carries the same band, following its own region');
ok(/h>=18&&h<=23\)\?' eve'/.test(hrs), 'the evening stands out');
ok(/if\(m && m\.offsetParent\) _geoRedraw\(\);\s*\},60000\)/.test(admin), 'and it follows the clock, minute by minute, while on screen');
ok(/function _geoRedraw\(\)\{ if\(_geoData && _geoMap && _geoMap\.c\) renderGeo\(\); \}/.test(admin), 'a redraw waits for both the figures and the outline');

// -- Four windows, not seven -----------------------------------------------
// 90, 180 and 365 days repeat "All time" to the unit until the site has a year
// behind it. They stay in the export; they no longer take the space.
// web.115: the arrows of the 7-day and period tiles compare complete days
// (complete hours for 24 h) — the `full` windows — and say so.
ok(/tile\('Today',d\.today,pv\.todayToHour,'yesterday at this hour',null,cv\.today\)\s*\+tile\('Last 7 days',d\.week,pv\.week,'the 7 days before \(complete days\)',fu\.week,cv\.week\)\s*\+tile\(pLbl,per,perPrev,pRef,perCmp,perCov\)\s*\+tile\('All time',d\.allTime\)/.test(admin)
  && /var pLbl=\(d\.h24&&P===1\)\?'Last 24 hours':\(d\.range&&per===d\.period\?_rangeLabel\(\):'Last '\+P\+' days'\), pRef=\(d\.h24&&P===1\)\?'the 24 hours before \(complete hours\)':'the '\+P\+' day'\+\(P>1\?'s':''\)\+' before \(complete days\)';/.test(admin),
  'four windows are shown, the first three against their previous period; the third follows the period selector (24 hours included)');
// -- Read at a glance --------------------------------------------------------
// New devices under the unique count; green / red only past a 10 % move, and
// only where a reference exists. All time has none, so it takes no colour.
ok(/fmt\(o&&o\.nw\)\+' new<\/div>'/.test(admin), 'each window shows its new devices under the unique count');
ok(/dl>=0\.10\?'up':\(dl<=-0\.10\?'dn':''\)/.test(admin), 'colour needs a move of ten percent either way');
ok(/\(ref&&ref>0\)\? \(cur-ref\)\/ref : null/.test(admin), 'and no reference means no colour rather than red');
ok(/var pv=d\.prev\|\|\{\}, fu=d\.full\|\|\{\}, cv=d\.cover\|\|\{\};/.test(admin), 'an older proxy without prev leaves every tile neutral (and without cover, compares as before)');
ok(/\.tstat \.big\.up,\.kpi \.big\.up\{color:#7fd17f\}/.test(admin) && /\.tstat \.big\.dn,\.kpi \.big\.dn\{color:#e8735c\}/.test(admin),
  'the main figure carries the colour on both kinds of tile');
ok(/prev: \{ todayToHour: visitYesterdayToHour\(\), yesterday: visitWindow\(1, 1\), week: visitWindow\(7, 7\), month: visitWindow\(30, 30\), period: h24 \? visitWindowList\(visitList\(true, 24, 24\)\) : visitWindow\(P, E \+ P\) \}/.test(proxy),
  'the proxy serves the previous windows the tiles compare against');
ok(/for \(let i = offset; i < offset \+ n; i\+\+\)/.test(proxy) && /return visitWindowList\(visitList\(false, daysBack, offset\)\);/.test(proxy), 'visitWindow shifts by an offset instead of duplicating the loop');
ok(/if \(!b \|\| !b\.h\) return null;/.test(proxy), 'yesterday without hour buckets yields no reference for today');
// -- Most played tracks: a ranking first ----------------------------------
// The title asks which tracks are played most; the answer is a list, and the
// daily view stacks the top five so low counts read as a pile, not as seven
// lines on the zero axis. The window starts where counting started.
ok(/var MUS_TOP=10, MUS_STACK=5;/.test(admin), 'ten titles ranked, five stacked');
ok(/box\.innerHTML=_musRank\(keys,total\)\+_musContext\(keys,total\)\+_musChart\(keys\);/.test(admin),
  'ranking, then context, then the chart');
ok(/function _stackChart\(labels,series,H,opt\)/.test(admin), 'a stacked bar helper exists');
ok(/_stackChart\(st\.labels,vis,st\.H,Object\.assign\(\{\},st\.opt,\{k:k\}\)\)/.test(admin), 'it gets the chart options, the previous period among them (and the font scale)');
ok(/var prev=opt\.prevBy \? labels\.map/.test(body(admin, '_stackChart')) && /stroke-dasharray:'\+\(5\*k\)\.toFixed\(1\)\+' '\+\(5\*k\)\.toFixed\(1\)/.test(body(admin, '_stackChart')),
  'the period before is a dashed line summing the series on show');
ok(/tot\.forEach\(function\(t\)\{ if\(t>max\) max=t; \}\); if\(prev\) prev\.forEach/.test(body(admin, '_stackChart')), 'and the scale makes room for it');
// World page cards (web.120).
// web.252: the Internet and LAN cards moved to Activity, beside « pokerth.net vs web client »,
// whose 48 h chart the Internet card used to repeat.
for (const id of ['wInet', 'wInetNote', 'wLan', 'wLanNote']) ok(tsub('activity').includes('id="' + id + '"') && !tsub('world').includes('id="' + id + '"'), id + ' has its place on the Activity page');
ok(tsub('activity').indexOf('id="wInet"') < tsub('activity').indexOf('id="trafPth"'), 'just above pokerth.net vs web client');
ok(!/wInet48/.test(admin), 'the Internet card no longer repeats the 48 h chart');
for (const id of ['wConn', 'wConnNote']) ok(tsub('world').includes('id="' + id + '"'), id + ' stays on the World page');
ok(tsub('world').indexOf('id="wConn"') > tsub('world').indexOf('id="geoMap"') && tsub('world').indexOf('id="wConn"') < tsub('world').indexOf('<h2>Countries</h2>'), 'under the map, above the countries');
ok(/function _worldCards\(d\)/.test(admin) && /_trafLastD=d; _trafModeRows\(d\); _worldCards\(d\);/.test(admin), 'filled with each read of the figures');
ok(/_worldConn\(_trafLastD\);/.test(body(admin, '_pickMode')), 'connections per day follow the entry modes');
ok(/var keys=on\.map\(function\(m\)\{ return m\.k; \}\)/.test(body(admin, '_worldConn')), 'counting the modes on show only');
ok(/_wSum\(d\.series,\['pokerthnet'\]\)/.test(body(admin, '_worldInet')) && /_wSum\(d&&d\.series,\['lan'\]\)/.test(body(admin, '_worldLan')), 'each card counts its own mode');
ok(/api\('\/admin\/lan-directory'\)/.test(body(admin, '_worldCards')), 'the LAN card reads the directory');
ok(/var LS=\(d&&d\.lanServers\)\|\|null/.test(body(admin, '_worldLan')) && /cnt\('other'\)/.test(body(admin, '_worldLan')), 'the LAN card counts connections per server, unlisted ones on a line of their own (web.123)');
ok(/var L=d&&d\.logins;/.test(body(admin, '_wLogins')) && /if\(!L\) return '';/.test(body(admin, '_wLogins')) && /Guests <b>'\+pc\(g\)\+' %<\/b>/.test(body(admin, '_wLogins')), 'the Internet card splits logins into guests and accounts');
ok(/counted from 2\.1\.10-web\.123/.test(body(admin, '_wLogins')), 'and says when counting began rather than showing a zero');
ok(/\.perU/.test(body(admin, '_paintPeriod')), 'the unit follows the period (day, or hour over 24 h)');
ok(/_chartMount\(\$\('musDayChart'\),_musLabs,_musLines,160,'stack'\)/.test(admin),
  'the music history is stacked bars, not lines');
ok(/return s\.filter\(function\(x\)\{ return \(x\.date\|\|''\)>=_musSinceKey; \}\);/.test(admin), 'days before counting began are dropped from the window');
ok(/plays per 100 visits/.test(admin), 'adoption is stated as plays per hundred visits');
ok(/title="removed from the catalogue"/.test(admin), 'a title no longer in the catalogue is marked, not hidden');

// Render it against a fixture: the pieces are lifted out and run with a
// series shaped like the proxy's, to check the maths and not only the text.
{
  const need = ['_musRank','_musDays','_musContext','_musChart','_musName','_stackChart','_niceAxis','_axLab','_isInt','_xTicks','_annEsc','_round1','_sLab','_perU',
                '_musVoteCell','_musTrendWin','_musTrendBadge','_musVotedElsewhere','_langTrendStat','_stDate','_sFull'];
  // body() strips the header; here the whole function is needed to run it.
  const whole = n => { const h = admin.indexOf('function ' + n + '('); const b = body(admin, n); return b ? admin.slice(h, admin.indexOf(b, h) + b.length) : ''; };
  const lifted = need.map(whole).join('\n');
  ok(!need.some(n => !whole(n)), 'every music helper is liftable');
  const env = `var ST_MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];var ENV_COLORS=['#a','#b','#c','#d','#e','#f','#g','#h','#i','#z'];var MUS_TOP=10,MUS_STACK=5,_trafPeriod=14,_trafRange=null,_trafRangeDays=0;function _isH24(){ return false; }
    var _musData={t1:30,t2:20,t3:10,t4:5,t5:3,t6:2,t7:1,t8:1,t9:1,t10:1,t11:1,t12:1};
    var _musTitles={t1:'Alpha',t2:'Beta',t3:'Gamma',t4:'Delta',t5:'Eps',t6:'Zeta',t7:'Eta',t8:'Th',t9:'Io',t11:'La'};
    var _musSince=new Date(2026,7,23,10,0,0).getTime(), _musSinceKey='2026-08-23', _trafTodayKey='';   // day keys come from the server
    var _trafSeries=[{date:'2026-08-21',v:100},{date:'2026-08-22',v:100},{date:'2026-08-23',v:200,mu:{t1:20,t2:10,t6:2}},{date:'2026-08-24',v:100,mu:{t1:10,t2:10,t3:10,t12:1}}];
    var _musLines=null,_musLabs=null;
    var _musVotes={t1:{up:4,down:1},r9:{up:2,down:0},t11:{up:0,down:3}}, _musVoteTitles={t1:{title:'Alpha',stream:false},r9:{title:'Jazz FM',stream:true}},
        _musVotesSince=new Date(2026,7,23).getTime(), _musVotesKnown=true, MUS_TREND_MIN=7, _musTr=null;`;
  const fn = new Function(env + lifted + `
    var keys=Object.keys(_musData).sort(function(a,b){return _musData[b]-_musData[a];});
    var total=0; keys.forEach(function(k){ total+=_musData[k]; });
    var chart=_musChart(keys);
    return { rank:_musRank(keys,total), ctx:_musContext(keys,total), chart:chart, lines:_musLines,
             svg:_stackChart(_musLabs,_musLines,160), days:_musDays().length };`);
  const r = fn();
  ok(r.days === 2, 'the window holds only the days since counting began');
  ok(/Alpha[^]*?30 \u00b7 39%/.test(r.rank), 'the top title carries its plays and share');
  const ranked = r.rank.split('Voted on, outside this ranking')[0];
  ok((ranked.match(/class="envrow"/g) || []).length === 10, 'ten rows are ranked');
  ok(/2 more titles \u00b7 2 plays/.test(r.rank), 'the rest is summed on one line');
  ok(/removed from the catalogue/.test(ranked) && />t10</.test(ranked) && /t11|t12/.test(r.rank) === false,
    'an id without a title is shown by id and flagged');
  ok(/<b>76<\/b> plays across <b>12<\/b> titles/.test(r.ctx), 'the context line states the totals');
  // 23 Aug is the day counting began (from 10:00): a part day, left out of the mean.
  ok(/<b>31\.0<\/b> plays\/day over 1 complete day/.test(r.ctx), 'plays per day are averaged over the complete days of the window only');
  ok(/<b>31<\/b> plays per 100 visits/.test(r.ctx), 'adoption is plays over visits of the same days');
  // The chart is now a mount point; the series it hands over are what gets
  // drawn, and the legend is built from them rather than written alongside.
  ok(/id="musDayChart"/.test(r.chart), 'the markup is a mount point the controller fills');
  ok(r.lines.length === 6, 'five titles plus others are stacked');
  ok(/aria-label="stacked daily bars"/.test(r.svg), 'and the helper still draws them as bars');
  ok(/Plays per day \u2014 since 23 Aug 2026/.test(r.chart), 'the chart says its unit and where its window starts, as a date');
  // Thumbs: beside each ranked title, a dash where nobody voted, and every
  // other voted entry (radios included) listed under the ranking.
  ok(/Alpha[^]*?class="votes"[^>]*>\u25B2 4 \u00b7 \u25BC 1</.test(ranked), 'a ranked title shows its thumbs up and down');
  ok(/class="votes none"[^>]*>\u2014</.test(ranked), 'a title nobody voted on shows a dash, not 0 · 0');
  ok(/Voted on, outside this ranking/.test(r.rank), 'entries voted on outside the ranking are listed under it');
  ok(/Jazz FM <span class="muted"[^>]*>\u00b7 radio<\/span>[^]*?\u25B2 2 \u00b7 \u25BC 0/.test(r.rank), 'a radio station shows its votes, marked as a radio');
  ok(/>La<[^]*?\u25B2 0 \u00b7 \u25BC 3/.test(r.rank), 'a title beyond the top ten keeps its votes too');
  ok(/class="trend na" title="Not enough history: 1 full days/.test(ranked), 'two days of history give no arrow, and say why');
  // Arrows: the share of plays, second half of the window against the first.
  const fx = new Function(env + lifted + `
    _musSince=new Date(2026,7,1,10,0,0).getTime(); _musSinceKey='2026-08-01'; _musVotesKnown=false;
    var s=[]; for(var i=1;i<=17;i++){ var d='2026-08-'+String(i).padStart(2,'0'); var late=i>9;
      s.push({date:d,v:50,mu:i===1?{a:1}:{a:late?6:2,b:late?2:6,c:1}}); }
    _trafSeries=s;
    _musData={a:65,b:65,c:16};
    var keys=['a','b','c'];
    return _musRank(keys,146);`);
  const tr = fx();
  ok(/class="trend up"[^>]*>\u2197 \+/.test(tr.split('</div>')[0]), 'a title gaining share of plays gets an up arrow');
  ok(/class="trend down"[^>]*>\u2198 \u2212/.test(tr.split('</div>')[1]), 'one losing share gets a down arrow');
  ok(/class="trend flat"[^>]*>\u2192</.test(tr.split('</div>')[2]), 'a steady one reads as stable');
  ok(/last 8 full days vs the 8 before/.test(tr), 'the first, partial day of counting is left out of the halves');
  ok(!/class="votes/.test(tr), 'and an older proxy without votes shows no thumbs column at all');
}
ok(!/tile\('Last 90 days'/.test(admin) && !/Last 180 days/.test(admin) && !/Last 365 days/.test(admin),
  'and the middle three are gone from the screen as fixed tiles (90 days remains only as a selector choice)');
ok(!/trafNvR/.test(admin),
  'new-vs-returning is gone: the New share tile and the cohorts each said it better');

// -- One language on screen ------------------------------------------------
// The dashboard is written in English; a French card in the middle of it was a
// leftover, not a choice.
ok(!/Exclure mes propres visites|Ne pas compter mes visites/.test(admin),
  'no French left in the traffic panel');
// web.184: the opt-out is a preference of this browser, in the side menu foot
// beside the theme and the idle logout; the client reads the same key.
ok(/<div class="sfrow"><label for="noCountSel">My visits<\/label><select id="noCountSel"[^>]*><option value="1">counted<\/option><option value="0">left out<\/option><\/select><\/div>/.test(admin), 'My visits sits in the side menu foot');
ok(/function _setNoCount\(off\)\{ try\{ if\(off\) localStorage\.setItem\('pth_no_count','1'\); else localStorage\.removeItem\('pth_no_count'\);/.test(admin), 'and writes the key the client reads');
ok(!/btnNoCount/.test(admin), 'the old button is gone');
// The MySQL mirror (traffic, leaderboard, broadcasts) is infrastructure; the
// visit export is a backup.
ok(panel('panel-database').includes('id="dbHost"') && panel('panel-database').includes('id="dbTiles"'), 'the MySQL mirror has its Database page, with tiles');
ok(/if\(t==='database'\)\{ loadDbConfig\(\); \}/.test(admin) && /dbPaint\(st\);/.test(admin), 'read from /admin/db when the page opens');
ok(panel('panel-backup').includes('<h2>Visit data</h2>') && panel('panel-backup').includes('id="btnTrafCsv"'), 'the visit export is a card of Backup');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
