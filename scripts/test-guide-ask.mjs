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
const { HOTSPOTS, hotspotFor, tappableFor } = await imp('public/modules/guide/hotspots.mjs');
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
ok(HOTSPOTS.length >= 40, HOTSPOTS.length + ' elements explained');
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
ok(/ask: \['shown', 'explained', 'done'\]/.test(stats), 'statistics: entered / explained / left');
ok(fs.readFileSync('public/sw.js', 'utf8').includes("'/modules/guide/hotspots.mjs'"), 'precached');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
