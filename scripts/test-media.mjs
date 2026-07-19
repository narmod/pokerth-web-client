#!/usr/bin/env node
// Deterministic tests for public/modules/ui/media.mjs (chantier ESM #9f-2).
// Stubs: DOM minimal, speechSynthesis, navigator.vibrate, i18n absent (repli clé).
// Run: node scripts/test-media.mjs
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const els = {};
globalThis.document = {
  readyState: 'complete', addEventListener() {}, querySelectorAll: () => [],
  getElementById: (id) => (els[id] = els[id] || { textContent: '', style: {} }),
};
let vibrations = [];
Object.defineProperty(globalThis, 'navigator', { configurable: true,
  value: { vibrate: (p) => { vibrations.push(p); return true; } } });
const spoken = []; let cancelled = 0;
globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
globalThis.speechSynthesis = {
  getVoices: () => [{ lang: 'fr-FR', localService: true, name: 'fr' },
                    { lang: 'en-US', localService: false, name: 'en' }],
  addEventListener() {}, cancel: () => { cancelled++; },
  speak: (u) => { spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 0); },
};
window.getPlayerName = (pid) => 'Joueur' + pid;

const { S } = await import('../public/modules/game/state.mjs');
const M = await import('../public/modules/ui/media.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// haptique
S._hapticEnabled = true; vibrations = [];
M.hapticBuzz(60); ok(vibrations.length === 1 && vibrations[0] === 60, 'hapticBuzz vibre quand activé');
S._hapticEnabled = false; M.hapticBuzz(60);
ok(vibrations.length === 1, 'hapticBuzz inerte quand désactivé');
ok(M.toggleHaptic() === true && S._hapticEnabled === true, 'toggleHaptic bascule et confirme');

// voix : mapping des langues + choix de voix
ok(M._voiceLangTag('fr') === 'fr-FR' && M._voiceLangTag('pt-BR') === 'pt-BR'
   && M._voiceLangTag('xx') === 'xx', '_voiceLangTag mappe et laisse passer');
M._loadVoices();
ok(S._voices.length === 2, '_loadVoices remplit S._voices');
ok(M._pickVoice('fr-FR').lang === 'fr-FR', '_pickVoice exact');
ok(M._pickVoice('en-GB').lang === 'en-US', '_pickVoice par sous-tag primaire');

// file de parole
S._voiceEnabled = true; spoken.length = 0;
M.speak('un'); M.speak('deux');
await new Promise(r => setTimeout(r, 20));
ok(spoken.join(',') === 'un,deux', 'file séquentielle: ' + spoken.join(','));
S._speakQ = []; S._speaking = false; S._curU = null;
M.speak('urgent', { interrupt: true });
ok(cancelled >= 1, 'interrupt coupe la synthèse en cours');
await new Promise(r => setTimeout(r, 10));

// phrase d'action (verbe = clé i18n brute sans catalogue chargé)
const ph = M.voiceActionPhrase(1, 7, 0);
ok(ph.startsWith('Joueur7 '), 'voiceActionPhrase utilise window.getPlayerName: ' + ph);
S._voiceEnabled = false;
ok(M.speak('rien') === undefined && S._speakQ.length === 0, 'speak inerte quand voix désactivée');

// ponts window
ok(window.speak === M.speak && window.toggleVoice === M.toggleVoice
   && window.hapticBuzz === M.hapticBuzz, 'ponts window en place');

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
