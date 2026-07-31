#!/usr/bin/env node
// Deterministic regression tests for the spectator send-lock
// (sp0ck 31/07/2026): spectators SEE the game chat and emoji reactions
// but must NOT SEND either. Source-level assertions on the monolith and
// the stylesheet — no DOM required.
// Run: node scripts/test-spectator-sendlock.mjs
import { readFileSync } from 'node:fs';

const js  = readFileSync(new URL('../public/pokerth.js',  import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/pokerth.css', import.meta.url), 'utf8');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// ── The old full chat block must be gone ────────────────────────────────
ok(!js.includes('spectator-nochat'),  'pokerth.js: no stale spectator-nochat marker');
ok(!css.includes('spectator-nochat'), 'pokerth.css: no stale spectator-nochat rules');

// addGameChat must NOT bail out for spectators anymore (read-only chat).
const agc = js.slice(js.indexOf('function addGameChat('), js.indexOf('function addGameChat(') + 600);
ok(agc.length > 0, 'addGameChat present');
ok(!/_amSpectator\)\s*return/.test(agc), 'addGameChat: no spectator read-block');

// toggleGameChat must NOT bail out for spectators (panel opens read-only).
const tgc = js.slice(js.indexOf('function toggleGameChat('), js.indexOf('function toggleGameChat(') + 600);
ok(tgc.length > 0, 'toggleGameChat present');
ok(!/_amSpectator\)\s*return/.test(tgc), 'toggleGameChat: no spectator block');

// ── Sending must stay guarded ───────────────────────────────────────────
const sgc = js.slice(js.indexOf('sendGameChat()'), js.indexOf('sendGameChat()') + 700);
ok(/S\._amSpectator\)\s*\{\s*input\.value\s*=\s*'';\s*return;\s*\}/.test(sgc),
   'sendGameChat: spectator send guard kept');

const sr = js.slice(js.indexOf('sendReaction(emoji)'), js.indexOf('sendReaction(emoji)') + 1400);
ok(sr.includes('REACT:') && sr.includes('_queueReactEmoji'), 'sendReaction slice covers both relays');
ok(/if\s*\(S\._amSpectator\)\s*return;/.test(sr), 'sendReaction: spectator send guard added');
// The guard must sit BEFORE the local echo and both network relays.
ok(sr.indexOf('S._amSpectator') < sr.indexOf('handleIncomingReaction'),
   'sendReaction: guard precedes local echo');
ok(sr.indexOf('S._amSpectator') < sr.indexOf('REACT:'), 'sendReaction: guard precedes REACT: relay');
ok(sr.indexOf('S._amSpectator') < sr.indexOf('_queueReactEmoji'), 'sendReaction: guard precedes /emoji queue');

const trp = js.slice(js.indexOf('function toggleReactionPanel('), js.indexOf('function toggleReactionPanel(') + 800);
ok(/_amSpectator\)\s*return/.test(trp), 'toggleReactionPanel: spectator guard (keyboard/programmatic paths)');

// ── Body marker wiring ──────────────────────────────────────────────────
ok(js.includes("classList.toggle('spectator-nosend'"), 'updateSpectatorStrip toggles body.spectator-nosend');

// ── CSS: hide send affordances only, keep the chat panel visible ────────
ok(css.includes('body.spectator-nosend #g-chat-panel .chat-input'), 'CSS hides the chat input row');
ok(css.includes('body.spectator-nosend #g-chat-emoji-panel'),       'CSS hides the emoji-insert panel');
ok(css.includes('body.spectator-nosend #react-toggle-btn'),         'CSS hides the reactions button');
ok(css.includes('body.spectator-nosend #g-reaction-panel'),         'CSS hides the reactions panel');
ok(!/body\.spectator-nosend\s+#g-chat-panel\s*[,{]/.test(css),      'CSS does NOT hide the chat panel itself');
ok(!/body\.spectator-nosend\s+#chat-toggle-btn/.test(css),          'CSS does NOT hide the 💬 felt button');
ok(!/body\.spectator-nosend\s+#gchat-fab/.test(css),                'CSS does NOT hide the mobile chat FAB');

console.log(`\n${n - fail}/${n} assertions passed`);
process.exit(fail ? 1 : 0);
