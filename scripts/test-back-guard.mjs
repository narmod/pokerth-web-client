// Test déterministe de modules/ui/back-guard.mjs
//   Back = Escape (ferme la surface ouverte), sinon double-appui pour quitter,
//   et comportement natif hors session ou option décochée.
// Run: node scripts/test-back-guard.mjs
import { JSDOM } from 'jsdom';

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  \u2713 ' + label); }
  else { fail++; console.log('  \u2717 ' + label); }
}

const dom = new JSDOM(`<!doctype html><body>
  <div id="s-connect" class="screen active"></div>
  <div id="s-lobby" class="screen"></div>
  <div id="s-create" class="screen"></div>
  <div id="s-game" class="screen"></div>
  <div id="g-chat-panel" style="display:none"></div>
</body>`, { pretendToBeVisual: true, url: 'https://pokerth.local/' });

const w = dom.window;
Object.defineProperty(w.HTMLElement.prototype, 'offsetWidth', {
  get() { return this.style.display === 'none' ? 0 : 10; }
});
w.HTMLElement.prototype.getClientRects = function () {
  return this.style.display === 'none' ? [] : [{ width: 10, height: 10 }];
};
for (const k of ['document', 'localStorage', 'getComputedStyle', 'HTMLElement', 'Event']) {
  globalThis[k] = w[k];
}
globalThis.window = w;

// Historique instrumenté : jsdom n'émet pas popstate sur back().
let stack = 0, backCalls = 0;
w.history.pushState = () => { stack++; };
w.history.back = () => { backCalls++; if (stack > 0) stack--; };

const toasts = [];
w.showToast = (msg) => toasts.push(msg);

let chatClosed = 0;
w.toggleGameChat = () => { chatClosed++; document.getElementById('g-chat-panel').style.display = 'none'; };

await import('../public/modules/ui/keynav.mjs');
await import('../public/modules/ui/back-guard.mjs');

const pop = () => { stack = Math.max(0, stack - 1); w.dispatchEvent(new w.Event('popstate')); };
const $ = (id) => document.getElementById(id);
function screen(id) {
  ['s-connect', 's-lobby', 's-create', 's-game'].forEach(s => $(s).classList.remove('active'));
  $(id).classList.add('active');
}

ok(stack === 1, 'init : une entrée sentinelle empilée');

// ── Hors session : comportement natif, rien n'est ré-empilé ──
screen('s-connect');
pop();
ok(stack === 0 && toasts.length === 0, 'écran de connexion : Back natif (pas de re-push, pas de message)');

// ── En partie, surface ouverte : Back ferme la surface ──
w.history.pushState();                       // ré-armer comme le ferait un boot
screen('s-game');
$('g-chat-panel').style.display = 'block';
pop();
ok(chatClosed === 1, 'partie + chat ouvert : Back ferme le chat');
ok(stack === 1, 'surface fermée : sentinelle ré-empilée');
ok(toasts.length === 0, 'surface fermée : aucun message « quitter »');

// ── En partie, rien d'ouvert : 1er appui = message, on reste ──
pop();
ok(toasts.length === 1, 'partie, rien d\'ouvert : message « appuyez à nouveau »');
ok(stack === 1, '1er appui : sentinelle ré-empilée (on ne quitte pas)');
ok(backCalls === 0, '1er appui : pas de sortie');

// ── 2e appui rapide : sortie réelle ──
pop();
await new Promise(r => setTimeout(r, 10));     // la sortie passe par setTimeout(0)
ok(backCalls === 1, '2e appui sous 2 s : history.back() appelé (sortie)');
ok(toasts.length === 1, '2e appui : pas de second message');

// ── Lobby : même protection qu'en partie ──
w.history.pushState();
screen('s-lobby');
await new Promise(r => setTimeout(r, 2100));   // au-delà de la fenêtre de 2 s
pop();
ok(toasts.length === 2, 'lobby : Back protégé comme en partie');

// ── Option décochée : comportement natif ──
w.history.pushState();
localStorage.setItem('pth_back_guard', '0');
screen('s-game');
const before = toasts.length, stackBefore = stack;
pop();
ok(toasts.length === before && stack === stackBefore - 1,
   'option décochée : Back natif (aucune interception)');
localStorage.removeItem('pth_back_guard');

console.log(fail ? `\nFAIL ${pass}/${pass + fail}` : `\nPASS ${pass}/${pass}`);
process.exit(fail ? 1 : 0);
