// Test déterministe de modules/ui/keynav.mjs
//   Escape ferme la surface prioritaire, Enter ne valide qu'en opt-in.
import { JSDOM } from 'jsdom';

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  \u2713 ' + label); }
  else { fail++; console.log('  \u2717 ' + label); }
}

const dom = new JSDOM(`<!doctype html><body>
  <div id="adv-modal" style="display:none"></div>
  <div id="kick-modal" style="display:none"></div>
  <div id="kick-confirm-modal" style="display:none"></div>
  <div id="quick-create-dialog" style="display:none">
    <button onclick="App.confirmQuickCreate()" data-kn-primary>Create</button>
    <input id="qc-name" type="text">
  </div>
  <div id="leave-dialog" style="display:none"></div>
  <div id="disconnect-dialog" style="display:none">
    <button id="dd-quit">Disconnect</button>
    <button id="dd-cancel" data-kn-focus>Cancel</button>
  </div>
  <div id="timeout-warn-modal" style="display:none"><button id="tow-ok" data-kn-focus>OK</button></div>
  <input id="chat-in" type="text">
</body>`, { pretendToBeVisual: true, url: 'https://pokerth.local/' });   // origine non opaque : localStorage dispo

const w = dom.window;
// jsdom ne fait pas de layout : offsetWidth vaut 0 partout. On le rend
// cohérent avec display, ce que _visible() interroge.
Object.defineProperty(w.HTMLElement.prototype, 'offsetWidth', {
  get() { return this.style.display === 'none' ? 0 : 10; }
});
w.HTMLElement.prototype.getClientRects = function () {
  return this.style.display === 'none' ? [] : [{ width: 10, height: 10 }];
};
for (const k of ['document', 'localStorage', 'getComputedStyle', 'HTMLElement', 'Event', 'KeyboardEvent', 'MutationObserver']) {
  globalThis[k] = w[k];
}
globalThis.window = w;

const calls = [];
w.closeAdvancedOptions = () => calls.push('closeAdv');
w.App = {
  closeKickModal: () => calls.push('closeKick'),
  cancelKickConfirm: () => calls.push('cancelKickConfirm'),
  cancelQuickCreate: () => calls.push('cancelQuickCreate'),
  cancelLeaveGame: () => calls.push('cancelLeave'),
  cancelDisconnect: () => calls.push('cancelDisconnect'),
  confirmQuickCreate: () => calls.push('CONFIRM-CREATE')
};

// jsdom ne compile pas les attributs onclick sans runScripts : on branche le
// bouton opt-in a la main pour observer le clic emis par keynav.
w.document.querySelector('[data-kn-primary]')
  .addEventListener('click', () => w.App.confirmQuickCreate());

await import('../public/modules/ui/keynav.mjs');

const show = id => { w.document.getElementById(id).style.display = 'block'; };
const hide = id => { w.document.getElementById(id).style.display = 'none'; };
const key = (k, target) => {
  const ev = new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
  (target || w.document.body).dispatchEvent(ev);
  return ev;
};

console.log('keynav');

// 1 — rien d'ouvert : Escape est inerte (ne quitte JAMAIS une partie)
calls.length = 0;
let ev = key('Escape');
ok(calls.length === 0 && !ev.defaultPrevented, 'Escape sans surface ouverte : aucun effet');

// 2 — une surface ouverte : Escape la ferme
calls.length = 0; show('adv-modal');
key('Escape');
ok(calls.join() === 'closeAdv', 'Escape ferme la surface ouverte');
hide('adv-modal');

// 3 — priorité : la confirmation passe avant le dialogue qui l'a ouverte
calls.length = 0; show('kick-modal'); show('kick-confirm-modal');
key('Escape');
ok(calls.join() === 'cancelKickConfirm', 'Escape ferme la confirmation, pas son parent');
hide('kick-confirm-modal');
calls.length = 0;
key('Escape');
ok(calls.join() === 'closeKick', 'appui suivant : ferme le parent (une surface par appui)');
hide('kick-modal');

// 4 — Escape n'atteint jamais une action destructive : il ANNULE
calls.length = 0; show('leave-dialog');
key('Escape');
ok(calls.join() === 'cancelLeave', 'sur « quitter la partie », Escape annule');
hide('leave-dialog');

// 5 — Enter n'agit que sur un bouton data-kn-primary
calls.length = 0; show('quick-create-dialog');
key('Enter');
ok(calls.join() === 'CONFIRM-CREATE', 'Enter déclenche le bouton opt-in');

// 6 — Enter reste inerte depuis un champ de saisie
calls.length = 0;
key('Enter', w.document.getElementById('qc-name'));
ok(calls.length === 0, 'Enter dans un champ texte : laissé au champ');

// 7 — aucun bouton opt-in : Enter ne devine rien
calls.length = 0; hide('quick-create-dialog'); show('leave-dialog');
key('Enter');
ok(calls.length === 0, 'Enter sans opt-in : aucune action devinée');
hide('leave-dialog');

// 8 — Shift+Enter et les combinaisons ne déclenchent rien
calls.length = 0; show('quick-create-dialog');
const ev2 = new w.KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true, cancelable: true });
w.document.body.dispatchEvent(ev2);
ok(calls.length === 0, 'Shift+Enter ne valide pas');

// 9 — option coupée : plus rien ne répond
calls.length = 0; w.localStorage.setItem('pth_keynav', '0');
key('Escape'); key('Enter');
ok(calls.length === 0, 'option desactivee : Escape et Enter inertes');
w.localStorage.setItem('pth_keynav', '1');
calls.length = 0;
key('Escape');
ok(calls.join() === 'cancelQuickCreate', 'option reactivee : Escape repond de nouveau');

// 10 — focus initial (parité QML b170786) : le bouton data-kn-focus reçoit
//      le focus à l'ouverture, et le focus revient au champ à la fermeture
const d = w.document, tick = () => new Promise((r) => setTimeout(r, 0));
d.getElementById('chat-in').focus();
show('disconnect-dialog'); await tick();
ok(d.activeElement && d.activeElement.id === 'dd-cancel', 'ouverture : focus sur Annuler (data-kn-focus), pas sur Déconnexion');
calls.length = 0; key('Escape');
ok(calls.join() === 'cancelDisconnect', 'Escape annule toujours la déconnexion');
hide('disconnect-dialog'); await tick();
ok(d.activeElement && d.activeElement.id === 'chat-in', 'fermeture : le focus revient au champ précédent');

// 11 — bouton désactivé (avertissement déjà expiré) : focus laissé en place
d.getElementById('tow-ok').disabled = true;
show('timeout-warn-modal'); await tick();
ok(d.activeElement && d.activeElement.id === 'chat-in', 'bouton désactivé : aucun focus forcé');
hide('timeout-warn-modal'); await tick();
d.getElementById('tow-ok').disabled = false;
show('timeout-warn-modal'); await tick();
ok(d.activeElement && d.activeElement.id === 'tow-ok', 'bouton unique actif : focus sur OK');
hide('timeout-warn-modal'); await tick();

// 12 — option coupée : aucun focus forcé
w.localStorage.setItem('pth_keynav', '0');
d.getElementById('chat-in').focus();
show('disconnect-dialog'); await tick();
ok(d.activeElement && d.activeElement.id === 'chat-in', 'option désactivée : focus initial inerte');
hide('disconnect-dialog'); await tick();
w.localStorage.setItem('pth_keynav', '1');

// 13 — surface dynamique (bandeau d'invitation) : focusInitial + restore,
//      Escape = refuser via registerOverlay
const ban = d.createElement('div');
ban.innerHTML = '<button id="gi-yes">Join</button><button id="gi-no" data-kn-focus>Decline</button>';
d.body.appendChild(ban);
calls.length = 0;
const unreg = w.keynavRegisterOverlay(ban, () => calls.push('decline'));
const restore = w.keynavFocusInitial(ban);
ok(d.activeElement && d.activeElement.id === 'gi-no', 'invitation : focus sur Refuser');
key('Escape');
ok(calls.join() === 'decline', 'invitation : Escape = Refuser');
unreg(); ban.remove(); restore();
ok(d.activeElement && d.activeElement.id === 'chat-in', 'invitation fermée : le focus revient au champ');

// 14 — appareil tactile sans souris : pas de focus volé (clavier virtuel)
w.matchMedia = () => ({ matches: true });
const ban2 = d.createElement('div');
ban2.innerHTML = '<button id="gi2" data-kn-focus>Decline</button>';
d.body.appendChild(ban2);
w.keynavFocusInitial(ban2);
ok(d.activeElement && d.activeElement.id === 'chat-in', 'tactile : focus laissé au champ');
ban2.remove();

console.log(fail ? `FAIL ${fail}/${pass + fail}` : `PASS ${pass}/${pass}`);
process.exit(fail ? 1 : 0);
