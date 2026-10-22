#!/usr/bin/env node
// Deterministic tests for public/modules/ui/announcer.mjs: the three outputs
// of the game announcements (off / built-in voice / screen reader), the
// reading of the historical pth_voice flag, the live regions and the radios
// of the Accessibility window. Run: node scripts/test-announcer.mjs
import { JSDOM } from 'jsdom';

const dom = new JSDOM(`<!doctype html><body>
  <input type="radio" name="announce-mode" value="off">
  <input type="radio" name="announce-mode" value="voice">
  <input type="radio" name="announce-mode" value="sr">
  <button id="voice-toggle-btn"></button></body>`, { url: 'https://pokerth.local/' });
const w = dom.window;
globalThis.window = w;
globalThis.document = w.document;
globalThis.localStorage = w.localStorage;
w.setTimeout = setTimeout; w.clearTimeout = clearTimeout;
const spoken = []; let cancelled = 0;
w.SpeechSynthesisUtterance = globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
w.speechSynthesis = {
  getVoices: () => [], addEventListener() {}, cancel: () => { cancelled++; },
  speak: (u) => { spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 0); },
};
const synced = [];
w._cfgSyncMark = (k) => synced.push(k);

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
const tick = (ms = 80) => new Promise((r) => setTimeout(r, ms));

// An old client had the "Voice" checkbox on: nothing to migrate.
localStorage.setItem('pth_voice', '1');
const { S } = await import('../public/modules/game/state.mjs');
const A = await import('../public/modules/ui/announcer.mjs');
ok(A.getAnnounceMode() === 'voice', 'pth_voice=1 → built-in voice');
ok(S._voiceEnabled === true, 'state follows the built-in voice');
ok(w.document.querySelector('input[value="voice"]').checked, 'radio of the current mode checked at load');

A.announce('Ada calls 20');
await tick(10);
ok(spoken.includes('Ada calls 20'), 'voice mode speaks with the speech synthesis');
ok(!w.document.getElementById('sr-announce-polite'), 'voice mode writes no live region');

// Screen reader
spoken.length = 0;
A.setAnnounceMode('sr');
ok(A.getAnnounceMode() === 'sr' && localStorage.getItem('pth_voice') === '0'
   && localStorage.getItem('pth_announce') === 'sr', 'sr mode stored, built-in voice off');
ok(S._voiceEnabled === false && cancelled >= 1, 'leaving the voice cancels the speech synthesis');
ok(synced.includes('announce') && synced.includes('voice'), 'both keys marked for settings sync');
const polite = w.document.getElementById('sr-announce-polite');
const assertive = w.document.getElementById('sr-announce-assertive');
ok(polite && polite.getAttribute('aria-live') === 'polite' && polite.getAttribute('aria-relevant') === 'additions',
   'polite live region created');
ok(assertive && assertive.getAttribute('aria-live') === 'assertive', 'assertive live region created');
ok(polite.parentNode === w.document.body, 'live regions sit directly under <body>');
ok(/announceSrOn|screen reader/.test(polite.textContent), 'choosing sr confirms through the screen reader');
A.announce('Bob folds'); A.announce('Cy raises 40');
const lines = [...polite.children].map((d) => d.textContent);
ok(lines.slice(-2).join('|') === 'Bob folds|Cy raises 40', 'polite lines appended in order');
ok(spoken.length === 0, 'sr mode never uses the speech synthesis');
for (let i = 0; i < 10; i++) A.announce('line ' + i);
ok(polite.children.length <= 6, 'polite region pruned (' + polite.children.length + ')');
A.announce('Your turn', { urgent: true });
await tick();
ok(assertive.textContent === 'Your turn', 'urgent cue goes to the assertive region');
A.announce('Your turn', { urgent: true });
ok(assertive.textContent === '', 'same urgent text is re-armed (emptied first)');
await tick();
ok(assertive.textContent === 'Your turn', '…then announced again');

// Off
const before = polite.children.length;
A.setAnnounceMode('off');
A.announce('nothing');
ok(polite.children.length === before && spoken.length === 0, 'off: no output at all');
ok(w.document.querySelector('input[value="off"]').checked, 'radios follow setAnnounceMode');

// Radios drive the mode
const r = w.document.querySelector('input[value="sr"]');
r.checked = true; r.dispatchEvent(new w.Event('change'));
ok(A.getAnnounceMode() === 'sr', 'checking the Screen reader radio switches the mode');

// The historical on/off toggle maps to built-in voice ⇄ off.
ok(A.toggleVoice() === true && A.getAnnounceMode() === 'voice', 'toggleVoice → built-in voice');
ok(A.toggleVoice() === false && A.getAnnounceMode() === 'off', 'toggleVoice → off');
ok(w.document.getElementById('voice-toggle-btn').textContent === '🤐', 'header twin icon synced');

// An older client (or the admin default) turning the voice on wins over 'sr'.
localStorage.setItem('pth_announce', 'sr'); localStorage.setItem('pth_voice', '1');
ok(A.getAnnounceMode() === 'voice', 'pth_voice=1 wins over pth_announce=sr');

// Reset of the Accessibility window: silent, back to off.
spoken.length = 0;
A.setAnnounceMode('off', { silent: true });
ok(A.getAnnounceMode() === 'off' && spoken.length === 0, 'silent reset to off');

ok(w.announce === A.announce && w.setAnnounceMode === A.setAnnounceMode
   && w.toggleVoice === A.toggleVoice, 'window bridges in place');

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
