#!/usr/bin/env node
// Ace's Help — context engine (modules/guide/core.mjs), the context data
// (modules/guide/contexts/) and the wiring of the feature in the page:
// silence during a hand (D8), one tip per context unless replayed, « Later »
// respected, priorities, windows; buttons, option and script in the HTML,
// option OFF by default, scenes paused while the Ace helps (D6), precache.
// Run: node scripts/test-guide-core.mjs
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const imp = (p) => import(pathToFileURL(path.resolve(p)).href);
const C = await imp('public/modules/guide/core.mjs');
const { CONTEXTS } = await imp('public/modules/guide/contexts/index.mjs');
const EN = (await imp('public/modules/guide/lang/en.mjs')).default;

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}
const W = (o) => Object.assign({ helpOn: true, screen: 'lobby', playing: false, online: true, guest: false, ranked: false, windows: [] }, o);

// ── when may the Ace speak at all ──
ok(!C.canSpeak(W({ helpOn: false })), 'help off → silent');
for (const s of ['connect', 'lobby', 'wait', 'create']) ok(C.canSpeak(W({ screen: s })), 'speaks on ' + s);
ok(!C.canSpeak(W({ screen: 'game' })), 'never at the table');
ok(!C.canSpeak(W({ screen: 'game', playing: true })), 'never during a hand (D8)');
ok(!C.canSpeak(W({ screen: 'lobby', playing: true })), 'playing wins over the screen');
ok(!C.canSpeak(W({ screen: 'other' })), 'unknown screen → silent');
ok(!C.canSpeak(null), 'no snapshot → silent');

// ── picking a context ──
const ctxs = [
  { id: 'a', priority: 1, screens: ['lobby'], steps: [{ text: 'x' }] },
  { id: 'b', priority: 5, screens: ['lobby'], needs: { guest: false, online: true }, steps: [{ text: 'x' }] },
  { id: 'g', priority: 9, screens: ['lobby'], needs: { guest: true }, steps: [{ text: 'x' }] },
  { id: 'w', priority: 3, screens: ['wait'], needs: { ranked: true }, steps: [{ text: 'x' }] },
  { id: 'm', priority: 99, manual: true, screens: ['lobby'], steps: [{ text: 'x' }] },
  { id: 'r', priority: 2, window: 'ranking-modal', steps: [{ text: 'x' }] },
  { id: 'h', priority: 100, screens: ['game', 'lobby'], when: (w) => w.playing, steps: [{ text: 'x' }] },
  { id: 't', priority: 50, screens: ['lobby'], when: () => { throw new Error('boom'); }, steps: [{ text: 'x' }] },
];
const pick = (w, p) => { const c = C.pickContext(W(w), ctxs, p); return c ? c.id : null; };
ok(pick({}) === 'b', 'highest priority that applies (b over a)');
ok(pick({ guest: true }) === 'g', 'guest-only context for a guest');
ok(pick({ online: false }) === 'a', 'online-only context skipped offline (D11)');
ok(pick({}, { seen: (id) => id === 'b' }) === 'a', 'a context already seen is not repeated');
ok(pick({}, { snoozed: (id) => id === 'b' }) === 'a', '« Later » puts it off');
ok(pick({ screen: 'wait', ranked: true }) === 'w', 'ranked waiting room context');
ok(pick({ screen: 'wait', ranked: false }) === null, 'not at a normal table');
ok(pick({ screen: 'connect' }) === null, 'nothing for another screen');
ok(pick({ windows: ['ranking-modal'] }, { seen: (id) => 'abg'.includes(id) }) === 'r', 'window context on its window');
ok(pick({ helpOn: false }) === null, 'nothing while the help is off');
ok(C.pickContext(W({ screen: 'game', playing: true }), ctxs) === null, 'silence during a hand even if a context lists the table');
ok(pick({}, { seen: () => true }) === null, 'manual contexts are never picked');
ok(C.replayContext(W({}), ctxs).id === 'b', '« This screen’s tip » (his menu) replays the best tip, seen or not');
ok(C.applies(ctxs[0], W({})) && !C.applies(ctxs[7], W({})), 'a throwing condition does not apply');

// ── runs and placeholders ──
const run = C.createRun({ id: 'x', steps: [{ text: 'one' }, { text: 'two' }] });
ok(run.step().text === 'one' && !run.isLast(), 'run starts on the first step');
ok(run.next().text === 'two' && run.isLast(), 'next step, last');
ok(run.next() === null, 'past the end → null');
ok(C.createRun(null).step() === null, 'empty run');
ok(C.fill('{n}/{max} players', { n: 7, max: 10 }) === '7/10 players', 'placeholders filled');
ok(C.fill('{n} and {x}', { n: 1 }) === '1 and {x}', 'unknown placeholder kept');

// ── the shipped contexts ──
const ids = new Set();
for (const c of CONTEXTS) {
  ok(/^[a-z0-9][a-z0-9_.-]{0,39}$/.test(c.id) && !ids.has(c.id), 'context id valid and unique: ' + c.id);
  ids.add(c.id);
  ok(c.window || (Array.isArray(c.screens) && c.screens.every((s) => C.TALK_SCREENS.includes(s))), c.id + ': only on screens where the Ace may speak');
  ok(Array.isArray(c.steps) && c.steps.length > 0, c.id + ': has steps');
  for (const s of c.steps) {
    if (typeof s.text === 'string') ok(EN[s.text] != null, c.id + ': text key exists in English: ' + s.text);   // text functions: test-guide-contexts
    for (const b of s.buttons || []) ok(EN[b] != null, c.id + ': button key exists: ' + b);
  }
}
ok(ids.has('welcome'), 'welcome context present');
ok(CONTEXTS.find((c) => c.id === 'welcome').manual === true, 'welcome only on demand');

// ── wiring ──
const html = fs.readFileSync('public/pokerth-client.html', 'utf8');
const js = fs.readFileSync('public/pokerth.js', 'utf8');
const css = fs.readFileSync('public/pokerth.css', 'utf8');
const sw = fs.readFileSync('public/sw.js', 'utf8');
ok(/<script type="module" src="modules\/guide\/index\.mjs"><\/script>/.test(html), 'loader script in the page');
for (const close of ['closeConnectOverflow', 'closeLobbyOverflow', 'closeCreateOverflow', 'closeHeaderOverflow']) {
  ok(new RegExp('guide-menu-btn guide-only" onclick="' + close + '\\(\\);if\\(window\\.guideToggle\\)').test(html), 'header menu entry: ' + close);
}
ok(/class="guide-login-btn guide-only"/.test(html), 'button on the login screen (D5)');
ok(/id="adv-guide" onchange="setAdvOpt\('guide_on',this\.checked\)"/.test(html), 'option in Advanced options');
const assistSec = html.slice(html.indexOf('data-i18n="advSecHelp"'), html.indexOf('</details>', html.indexOf('data-i18n="advSecHelp"')));
ok(assistSec.includes('id="adv-guide"'), 'option sits in the Assistance section');
ok(/sync\('adv-guide', 'guide_on', false\)/.test(js), 'option OFF by default (D3)');
ok(/window\._guideApply\(\)/.test(js), 'applyAdvOpts wakes the guide');
ok(/body:not\(\.guide-avail\) \.guide-only\{display:none!important\}/.test(css), 'buttons and option shown only where the module is available (body.guide-avail)');
ok(/if \(window\._guideBusy\) return false;/.test(fs.readFileSync('public/modules/mascot/index.mjs', 'utf8')), 'scenes wait while the Ace helps (D6)');
for (const f of ['index', 'core', 'state', 'i18n', 'highlight', 'contexts/index', 'contexts/welcome', 'lang/en']) {
  ok(sw.includes(`'/modules/guide/${f}.mjs'`), 'precached: guide/' + f);
}
ok(sw.includes("'/modules/mascot/guide.mjs'"), 'precached: mascot/guide');
const idx = fs.readFileSync('public/modules/guide/index.mjs', 'utf8');
ok(!/pth_assist/.test(idx), 'does not touch pth_assist');
ok(/export function actorKit\(rootId\)/.test(fs.readFileSync('public/modules/mascot/engine.mjs', 'utf8')), 'engine exposes the Ace to the docked helper');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
