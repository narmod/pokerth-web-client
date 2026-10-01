#!/usr/bin/env node
// Ace's Help — the « ? » mode map (modules/guide/hotspots.mjs, C6): every
// selector is valid, every static one matches the page, every text key is
// worded in English, the specific entries win over the generic ones (a Join
// button inside its game row), the Ace's dock is never a hotspot, and the
// mode is wired (enter / intercept / second tap / exit, statistics).
// Run: node scripts/test-guide-ask.mjs   (needs jsdom)
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { JSDOM } from 'jsdom';

const imp = (p) => import(pathToFileURL(path.resolve(p)).href);
const { HOTSPOTS, WINDOWS, hotspotFor, tappableFor, windowFor } = await imp('public/modules/guide/hotspots.mjs');
const EN = (await imp('public/modules/guide/lang/en.mjs')).default;
let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}
const html = fs.readFileSync('public/pokerth-client.html', 'utf8');
const dom = new JSDOM(html);
const doc = dom.window.document;
const keys = new Set();
for (const [sel, key, dyn] of HOTSPOTS) {
  let n = -1;
  try { n = doc.querySelectorAll(sel).length; } catch (e) { n = -1; }
  ok(n >= 0, 'valid selector: ' + sel);
  if (!dyn) ok(n > 0, 'matches the page: ' + sel + ' (' + n + ')');
  ok(typeof EN[key] === 'string' && EN[key].length > 10, 'worded in English: ' + key);
  ok(!keys.has(key) || key === 'hsSpectate', 'one entry per text: ' + key);
  keys.add(key);
}
ok(HOTSPOTS.length >= 100, HOTSPOTS.length + ' elements explained');
// H2: « More about it » points at a real help section, windows have their own text
const HELP = (await imp('public/modules/help/content/en.mjs')).help;
const secIds = new Set(HELP.chapters.flatMap((c) => c.sections.map((s) => c.id + ':' + s.id)));
const badMore = HOTSPOTS.filter((e) => e[3] && !secIds.has(e[3])).map((e) => e[1]).concat(WINDOWS.filter((w) => w[2] && !secIds.has(w[2])).map((w) => w[1]));
ok(!badMore.length, '« More about it » always opens an existing help section' + (badMore.length ? ' — ' + badMore.join(', ') : ''));
ok(HOTSPOTS.filter((e) => e[3]).length >= 80, HOTSPOTS.filter((e) => e[3]).length + ' elements link to the help');
for (const [sel, key] of WINDOWS) { ok(typeof EN[key] === 'string' && EN[key].length > 10, 'window worded: ' + key); try { doc.querySelectorAll(sel); ok(true, 'valid window selector: ' + sel); } catch (e) { ok(false, 'valid window selector: ' + sel); } }
ok(/\{label\}/.test(EN.hsAdvOption) && /\{label\}/.test(EN.hsAdvSelect), 'options: their own label in the text');
ok(typeof EN.moreAbout === 'string' && EN.moreAbout.length <= 22, 'button « More about it »');
for (const k of ['askLabel', 'askMenu', 'askIntro', 'askAgain', 'askUnknown', 'askDone']) ok(typeof EN[k] === 'string', 'mode text: ' + k);

// priority: specific before generic
const list = doc.getElementById('g-list');
list.innerHTML = '<div class="game-row gcard" data-gid="5"><div class="gcard-main"><div class="game-name">T</div></div><div class="gcard-btns"><button class="btn-join">Join</button><button class="btn-join btn-spectate">Watch</button><button class="gcard-caret">▾</button></div></div>';
ok(hotspotFor(list.querySelector('.btn-join:not(.btn-spectate)')).key === 'hsJoin', 'Join inside its row → the Join text');
ok(hotspotFor(list.querySelector('.btn-spectate')).key === 'hsSpectate', 'Watch (also .btn-join) → the Watch text');
ok(hotspotFor(list.querySelector('.gcard-caret')).key === 'hsCaret', 'the caret → who sits here');
ok(hotspotFor(list.querySelector('.game-name')).key === 'hsGameRow', 'the rest of the row → the row text');
ok(hotspotFor(doc.querySelector('#login-step2 .btn-primary[data-i18n="connect"]')).key === 'hsConnect', 'Connect button');
const dock = doc.createElement('div'); dock.id = 'ace-dock'; dock.innerHTML = '<button class="ad-btn">x</button>'; doc.body.appendChild(dock);
ok(hotspotFor(dock.querySelector('button')) === null, 'the Ace’s own bubble is never a hotspot');
ok(tappableFor(doc.querySelector('#chat-in')) && tappableFor(doc.body) === null, 'generic tappables recognised, plain areas ignored');
// H2: options speak their own label; a label is its control; unlisted controls of a window
const chk = doc.querySelector('#adv-modal label.adv-row input[type="checkbox"]');
const hsChk = hotspotFor(chk.closest('label').querySelector('span'));
ok(hsChk && hsChk.key === 'hsAdvOption' && hsChk.vars && hsChk.vars.label.length > 2 && hsChk.el === chk.closest('label'), 'an option row: « ' + (hsChk && hsChk.vars ? hsChk.vars.label : '?') + ' », its label highlighted');
const sel2 = hotspotFor(doc.getElementById('adv-darkmode'));
ok(sel2 && sel2.key === 'hsAdvSelect' && sel2.vars.label === 'Dark mode', 'a list option: « Dark mode »');
const rm = doc.getElementById('cf-rm1');
ok(hotspotFor(rm.closest('label') ? rm.closest('label').querySelector('span') : rm).key === 'hsRaiseEvery', 'the text of a radio button → its control');
const sw = doc.getElementById('cf-allow-spectators').closest('label');
ok(hotspotFor(sw.querySelector('.cf-switch-tr')).key === 'hsSpectators', 'a switch track → its control (spectators)');
ok(hotspotFor(doc.getElementById('cf-use-password').closest('label').querySelector('.cf-switch-tr')).key === 'hsPassword', 'a switch track → its control (password)');
const fw = doc.createElement('div'); fw.id = 'music-panel'; fw.innerHTML = '<button class="mx-unlisted">x</button><p class="txt">t</p>'; doc.body.appendChild(fw);
ok(windowFor(fw.querySelector('.mx-unlisted')).key === 'hsMusicWin' && windowFor(fw.querySelector('.txt')) === null, 'an unlisted control of a window → the window; its plain text → nothing');
const idxSrc = fs.readFileSync('public/modules/guide/index.mjs', 'utf8');
ok(/else if \(label\) \{ askSay\('hsLabelled', 'askAgain', moreFor\(label\), \{ label \}\)/.test(idxSrc) && /hit\.win && label/.test(idxSrc) && /\{label\}/.test(EN.hsLabelled), 'never a bare « no explanation »: the element\'s own name (and the help section found for it), or its window with its name');
ok(/getComputedStyle\(n\)\.cursor === 'pointer'/.test(fs.readFileSync('public/modules/guide/hotspots.mjs', 'utf8')), 'controls drawn by script (hand cursor) are recognised too');
ok(/hotspotFor\(t\) \|\| windowFor\(t\)/.test(idxSrc) && /btn\('moreAbout'\)/.test(idxSrc) && /openMoreHelp\(\{ ch, sec \}\)/.test(idxSrc), 'the Ace offers « More about it » and opens that section');

// wiring
const idx = fs.readFileSync('public/modules/guide/index.mjs', 'utf8');
ok(/document\.addEventListener\('click', onAskClick, true\)/.test(idx), 'taps intercepted in the capture phase');
ok(/ev\.preventDefault\(\); ev\.stopPropagation\(\); ev\.stopImmediatePropagation\(\);/.test(idx), 'the first tap does not act');
ok(/closest\('#ace-dock'\)/.test(idx.slice(idx.indexOf('function askTarget'))), 'the dock is never intercepted');
ok(/hit\.el === armed/.test(idx), 'a second tap on the same element acts');
ok(/tagName === 'SELECT'/.test(idx), 'a list does not open before it is explained');
ok(/exitAsk\(true\)/.test(idx.slice(idx.indexOf('function leave'))), 'leaving (a hand starts, help off) ends the mode');
ok(/ev\.key === 'Escape'/.test(idx), 'Escape ends the mode');
ok(/btn\('askMenu'\)/.test(idx) && /ask: gt\('askLabel'\)/.test(idx), 'entered from the menu and the ? on every tip');
const stats = fs.readFileSync('server/guide-stats.js', 'utf8');
ok(/ask: \['shown', 'explained', 'done', 'more'\]/.test(stats), 'statistics: entered / explained / left / « More about it »');
ok(fs.readFileSync('public/sw.js', 'utf8').includes("'/modules/guide/hotspots.mjs'"), 'precached');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
