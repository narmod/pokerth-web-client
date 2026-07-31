#!/usr/bin/env node
// Deterministic tests for setStatus visibility fallback.
// Run: node scripts/test-status-visible.mjs
//
// #cstatus sits under the CONNECT button, so it only exists on screen while the
// connection screen is showing. Join refusals go through setStatus: once in the
// lobby the server's answer — game full, already started, invitation required —
// was written into a hidden element and the player saw nothing at all. That is
// the forum report: "I click Join and nothing happens."
//
// An error must not depend on which screen the player is on. The rule tested
// here: when the target is hidden, an error is mirrored to a toast; an ordinary
// status message is not, since it has no business covering the screen.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = fs.readFileSync(path.join(root, 'public', 'modules', 'net', 'session.mjs'), 'utf8');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  \u2713 ' : '  \u2717 ') + label);
  if (!cond) fails++;
}

const start = src.indexOf('function setStatus(');
ok(start > 0, 'setStatus is still where the test expects it');
ok(/function setStatus\(txt, cls='', key, opts\)/.test(src),
   'setStatus takes the options argument the call sites pass');
const body = src.slice(start, src.indexOf('\n}', start) + 2);

// ── Stubs ─────────────────────────────────────────────────────────
let toasts = [];
const el = { textContent: '', className: '', offsetParent: {} };
globalThis.S = {};
globalThis.document = { getElementById: (id) => (id === 'cstatus' ? el : null) };
globalThis.window = { showToast: (msg, opts) => { toasts.push({ msg, opts }); } };
const setStatus = eval('(' + body.replace(/^function setStatus/, 'function') + ')');

// ── Cible visible : rien ne double le message ─────────────────────
el.offsetParent = {};
toasts = [];
setStatus('Connected', 'ok');
ok(el.textContent === 'Connected' && el.className === 'status ok', 'the status line is still written');
ok(toasts.length === 0, 'nothing is mirrored while the status line is visible');

setStatus('\u26a0 Game is full', 'err');
ok(toasts.length === 0, 'not even an error, when it can already be read');

// ── Cible masquée : seules les erreurs sont doublées ───────────────
el.offsetParent = null;
toasts = [];
setStatus('Connecting\u2026', '');
ok(toasts.length === 0, 'an ordinary status message stays quiet when hidden');

setStatus('\u26a0 Game is full', 'err');
ok(toasts.length === 1, 'an error reaches the player even from the lobby');
ok(toasts[0].msg === '\u26a0 Game is full', 'the mirrored text is the message itself');
ok(toasts[0].opts && toasts[0].opts.tone === 'error', 'it is shown with the error tone');
ok(toasts[0].opts.duration >= 4000, 'it stays long enough to be read');

// ── Messages qui ne parlent que de l'écran de connexion ───────────
// « La connexion prend du temps, réessaie » n'a de sens que sous le bouton
// CONNECT. Doublé à table, il demandait au joueur d'agir sur un écran qu'il ne
// voit pas, à propos d'une reconnexion automatique qu'il n'a pas déclenchée --
// un panneau gris par-dessus la barre d'actions, en pleine main.
toasts = [];
setStatus('Connection is taking a while\u2026 retry if needed.', 'err', null, { local: true });
ok(el.textContent === 'Connection is taking a while\u2026 retry if needed.',
   'a connect-screen message is still written to the status line');
ok(toasts.length === 0, 'but it is never mirrored away from the connect screen');

setStatus('\u26a0 Game is full', 'err', null, {});
ok(toasts.length === 1, 'an empty options object changes nothing');

setStatus('\u26a0 Invite-only table', 'err', null, { local: false });
ok(toasts.length === 2, 'and local:false is the ordinary case');

// ── Robustesse ────────────────────────────────────────────────────
// L'écran de connexion peut avoir été retiré du DOM : setStatus ne doit pas
// jeter, sinon elle emporte le gestionnaire qui l'appelait — typiquement
// onJoinGameFailed, et le refus serait perdu deux fois.
globalThis.document = { getElementById: () => null };
let threw = false;
try { setStatus('x', 'err'); } catch (e) { threw = true; }
ok(!threw, 'a missing status element does not throw');

// Un toast indisponible ne doit pas davantage casser l'appelant.
globalThis.document = { getElementById: (id) => (id === 'cstatus' ? el : null) };
globalThis.window = {};
threw = false;
try { setStatus('y', 'err'); } catch (e) { threw = true; }
ok(!threw, 'a missing toast helper does not throw either');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
