#!/usr/bin/env node
// Deterministic guard for the 90-reaction catalog (3 themed pages, 2026-08-28).
// Verifies the three sources stay in sync:
//   1. REACT_EMOJIS (modules/ui/reactions.mjs) — canonical order, 90 unique;
//   2. pokerth-client.html — grid buttons match REACT_EMOJIS order and rcp-N ids;
//   3. REACTION_FX — one entry per emoji, every anim has its .rfx-anim-* class
//      AND its @keyframes in pokerth.css; every preset is handled by _rfxSpawn.
// Run: node scripts/test-reactions-catalog.mjs

import { readFileSync } from 'node:fs';

// Minimal DOM stubs so the module can be imported outside a browser.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const fakeEl = () => ({
  style: {}, classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
  setAttribute() {}, appendChild() {}, remove() {}, querySelector() { return null; },
  getBoundingClientRect() { return { left: 0, top: 0, width: 10, height: 10 }; },
  textContent: '',
});
globalThis.document = {
  body: Object.assign(fakeEl(), { appendChild() {} }),
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  createElement() { return fakeEl(); },
  addEventListener() {},
};
globalThis.window = globalThis;

const { REACT_EMOJIS, REACTION_FX } = await import('../public/modules/ui/reactions.mjs');

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// 1) Canonical list: 90 unique emojis, 3 pages of 30.
ok(Array.isArray(REACT_EMOJIS) && REACT_EMOJIS.length === 90, 'REACT_EMOJIS has 90 entries');
ok(new Set(REACT_EMOJIS).size === 90, 'REACT_EMOJIS entries are unique');

// 2) HTML grids match the canonical order and rcp-N ids.
const html = readFileSync(new URL('../public/pokerth-client.html', import.meta.url), 'utf8');
const btnRe = /sendReaction\('([^']+)'\)" title="[^"]*">[^<]*<span class="rc" id="rcp-(\d+)"/g;
const found = [];
let m;
while ((m = btnRe.exec(html))) found.push({ emoji: m[1], idx: Number(m[2]) });
ok(found.length === 90, 'HTML has 90 reaction buttons (found ' + found.length + ')');
let orderOk = found.length === 90;
for (let i = 0; i < found.length; i++) {
  if (found[i].idx !== i || found[i].emoji !== REACT_EMOJIS[i]) { orderOk = false; break; }
}
ok(orderOk, 'HTML button order + rcp-N ids match REACT_EMOJIS');
ok((html.match(/class="react-grid"/g) || []).length === 3, 'HTML has 3 react-grid pages');
ok((html.match(/id="react-page-ind"/g) || []).length === 1, 'HTML has the single page indicator in the title bar');

// 3) FX coverage: one entry per emoji; anims present in CSS; presets known.
const missingFx = REACT_EMOJIS.filter((e) => !REACTION_FX[e]);
ok(missingFx.length === 0, 'REACTION_FX covers all 90 emojis' + (missingFx.length ? ' (missing ' + missingFx.join(' ') + ')' : ''));
const css = readFileSync(new URL('../public/pokerth.css', import.meta.url), 'utf8');
const anims = [...new Set(Object.values(REACTION_FX).map((f) => f.a))].sort();
ok(anims.length === 16, '16 distinct animations in use (' + anims.length + ')');
for (const a of anims) {
  const cls = '.rfx-anim-' + a;
  const kf = '@keyframes rfx' + a.charAt(0).toUpperCase() + a.slice(1);
  ok(css.includes(cls), 'CSS class ' + cls + ' exists');
  ok(css.includes(kf), 'CSS ' + kf + ' exists');
}
const KNOWN_PRESETS = new Set(['sparkle', 'shock', 'confetti', 'boom', 'gunshot']);
const badPresets = Object.entries(REACTION_FX)
  .filter(([, f]) => typeof f.p === 'string' && !KNOWN_PRESETS.has(f.p));
ok(badPresets.length === 0, 'all string presets are known (sparkle/shock/confetti/boom)');
ok(css.includes('.rfx-ring-boom') && css.includes('@keyframes rfxRingBoom'), "CSS for 'boom' shockwave ring exists");

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All reactions-catalog tests passed.');
