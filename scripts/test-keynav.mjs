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
  <div id="kick-confirm-modal" style="display:none"><button id="kcm-cancel">Cancel</button><button id="kcm-ok" data-kn-focus>Kick</button></div>
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
  <div id="login-step1"><button id="card-net" data-kn-start>Internet</button></div>
  <div id="login-step2" style="display:none">
    <input id="nick" data-kn-start>
    <input id="pass" type="password" data-kn-start>
  </div>
  <nav id="tabs" role="tablist" data-kn-tabs>
    <button role="tab" id="t1">A</button><button role="tab" id="t2" disabled>B</button><button role="tab" id="t3">C</button>
  </nav>
  <div id="ranking-modal" style="display:none">
    <input id="rk-search" data-kn-focus style="display:none">
    <div id="rk-body" tabindex="-1" data-kn-focus></div>
  </div>
  <div id="about-page" style="display:none" tabindex="-1" data-kn-focus></div>
  <div id="g-endgame-overlay" style="display:none"></div>
  <div class="screen" id="s-create" style="display:none">
    <div id="create-form" data-kn-form>
      <input id="cf-name" data-kn-start="online">
      <select id="cf-sel"><option>1</option></select>
      <input id="cf-players" type="number">
      <button id="cf-create" data-kn-default data-kn-start="offline">Create</button>
    </div>
  </div>
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
  confirmQuickCreate: () => calls.push('CONFIRM-CREATE'),
  endGameClose: () => calls.push('endGameClose')
};

// jsdom ne compile pas les attributs onclick sans runScripts : on branche le
// bouton opt-in a la main pour observer le clic emis par keynav.
w.document.querySelector('[data-kn-primary]')
  .addEventListener('click', () => w.App.confirmQuickCreate());

w.document.getElementById('cf-create').addEventListener('click', () => calls.push('CREATE'));
for (const id of ['t1', 't2', 't3']) w.document.getElementById(id).addEventListener('click', () => calls.push('tab-' + id));
w.closeRankingModal = () => calls.push('closeRanking');
w.closeAboutPage = () => calls.push('closeAbout');
w.loginBackToStep1 = () => calls.push('backToStep1');
await import('../public/modules/ui/keynav.mjs');
const bootFocus = w.document.activeElement && w.document.activeElement.id;
const bootQuiet = w.document.getElementById('card-net').hasAttribute('data-kn-quiet');

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

// 13b — confirmation d'exclusion : focus sur Confirmer (parité ConfirmPopup
//       QML, choix narmod), Escape annule toujours, Enter depuis le corps inerte
d.getElementById('chat-in').focus();
show('kick-confirm-modal'); await tick();
ok(d.activeElement && d.activeElement.id === 'kcm-ok', 'exclusion : focus sur Confirmer (parité QML)');
calls.length = 0; key('Enter');
ok(calls.length === 0, 'exclusion : Enter hors du bouton ne devine rien (pas de data-kn-primary)');
key('Escape');
ok(calls.join() === 'cancelKickConfirm', 'exclusion : Escape annule');
hide('kick-confirm-modal'); await tick();
ok(d.activeElement && d.activeElement.id === 'chat-in', 'exclusion fermée : le focus revient au champ');

// 15 — focus au démarrage des pages (parité QML StackView.onActivated)
ok(bootFocus === 'card-net', 'chargement : focus sur la carte Internet (StartPage)');
ok(bootQuiet, 'bouton focalisé au démarrage : cadre retenu (data-kn-quiet)');
ok(!d.getElementById('card-net').hasAttribute('data-kn-quiet'), 'première touche : le cadre redevient normal');
hide('quick-create-dialog');
// jsdom ne propage pas display:none aux enfants : on masque la carte elle-même
d.getElementById('card-net').focus();
d.getElementById('card-net').style.display = 'none';
w.document.getElementById('login-step1').style.display = 'none';
show('login-step2'); await tick();
ok(d.activeElement && d.activeElement.id === 'nick', 'étape connexion, pseudo vide : focus sur le pseudo');
hide('login-step2'); await tick();
d.getElementById('nick').value = 'Narmod';
d.getElementById('card-net').focus();
show('login-step2'); await tick();
ok(d.activeElement && d.activeElement.id === 'pass', 'pseudo déjà rempli : focus sur le mot de passe');
hide('login-step2'); await tick();
d.getElementById('chat-in').focus();
show('login-step2'); await tick();
ok(d.activeElement && d.activeElement.id === 'chat-in', 'focus déjà sur un élément visible hors page : pas de vol');
hide('login-step2'); await tick();
d.getElementById('chat-in').style.display = 'none';
w._offlineMode = false;
show('s-create'); await tick();
ok(d.activeElement && d.activeElement.id === 'cf-name', 'création en ligne : focus sur le nom de table');
hide('s-create'); await tick();
w._offlineMode = true;
show('s-create'); await tick();
ok(d.activeElement && d.activeElement.id === 'cf-create', 'entraînement : focus sur Créer (LocalGamePage)');
hide('s-create'); await tick();
d.getElementById('cf-name').disabled = true; w._offlineMode = false; d.getElementById('cf-create').blur();
show('s-create'); await tick();
ok(!d.activeElement || d.activeElement.id !== 'cf-name', 'invité (nom verrouillé) : aucun focus forcé sur le nom');
d.getElementById('cf-name').disabled = false;

// 16 — Entrée = bouton par défaut du formulaire de création
calls.length = 0; key('Enter', d.getElementById('cf-players'));
ok(calls.join() === 'CREATE', 'Entrée dans un champ nombre : crée la partie');
calls.length = 0; key('Enter', d.getElementById('cf-name'));
ok(calls.join() === 'CREATE', 'Entrée dans le nom : crée la partie');
calls.length = 0; key('Enter', d.getElementById('cf-sel'));
ok(calls.length === 0, 'Entrée sur une liste déroulante : laissée à la liste');
calls.length = 0; show('adv-modal'); key('Enter', d.getElementById('cf-players'));
ok(calls.length === 0, 'surface ouverte par-dessus : Entrée ne crée pas');
hide('adv-modal');
calls.length = 0; d.getElementById('cf-create').disabled = true; key('Enter', d.getElementById('cf-players'));
ok(calls.length === 0, 'bouton Créer désactivé : rien');
d.getElementById('cf-create').disabled = false;
hide('s-create'); d.getElementById('chat-in').style.display = '';
d.getElementById('chat-in').focus();

// 18 — onglets data-kn-tabs (catégories des réglages, SettingsPage QML)
d.getElementById('t1').focus(); calls.length = 0;
let evT = key('ArrowDown', d.getElementById('t1'));
ok(d.activeElement.id === 't3' && calls.join() === 'tab-t3' && evT.defaultPrevented, '↓ : onglet suivant actif (désactivé sauté), focus + clic');
calls.length = 0; key('ArrowRight', d.getElementById('t3'));
ok(calls.length === 0 && d.activeElement.id === 't3', 'dernier onglet : pas de bouclage');
calls.length = 0; key('Home', d.getElementById('t3'));
ok(d.activeElement.id === 't1' && calls.join() === 'tab-t1', 'Début : premier onglet');
calls.length = 0; key('ArrowDown', d.getElementById('chat-in'));
ok(calls.length === 0, 'flèche hors d\u2019une liste d\u2019onglets : ignorée');

// 19 — zones de lecture et recherche (About, classement, fiche joueur)
d.getElementById('chat-in').focus();
show('about-page'); await tick();
ok(d.activeElement.id === 'about-page', 'À propos : la page elle-même reçoit le focus (défilement clavier)');
hide('about-page'); await tick();
ok(d.activeElement.id === 'chat-in', 'À propos fermé : focus rendu');
show('ranking-modal'); await tick();
ok(d.activeElement.id === 'rk-body', 'classement, recherche masquée : focus sur la zone de lecture');
hide('ranking-modal'); await tick();
d.getElementById('rk-search').style.display = '';
show('ranking-modal'); await tick();
ok(d.activeElement.id === 'rk-search', 'classement, recherche affichée : focus dans la recherche');
hide('ranking-modal'); await tick();
ok(typeof w.keynavFocusReading === 'function' && w.keynavFocusReading(d.getElementById('rk-body')) && d.activeElement.id === 'rk-body', 'keynavFocusReading : focus sur une zone de lecture');
d.getElementById('chat-in').focus();

// 20 — fin de partie : focus Rejouer (entraînement), Escape = fermer
const eg = d.getElementById('g-endgame-overlay');
eg.innerHTML = '<button id="eg-replay" data-kn-focus>Play again</button><button id="eg-lobby">Back</button>';
show('g-endgame-overlay'); await tick();
ok(d.activeElement.id === 'eg-replay', 'fin de partie : focus sur Rejouer (gameOverPopup QML)');
calls.length = 0; key('Escape');
ok(calls.join() === 'endGameClose', 'fin de partie : Escape ferme la fenêtre (reste à la table)');
hide('g-endgame-overlay'); await tick();
d.getElementById('chat-in').focus();

// 21 — connexion : Escape revient au choix du mode (handleBack QML)
show('login-step2'); await tick();
calls.length = 0; key('Escape');
ok(calls.join() === 'backToStep1', 'formulaire de connexion : Escape → choix du mode');
hide('login-step2'); await tick();
calls.length = 0; key('Escape');
ok(calls.length === 0, 'rien d\u2019ouvert : Escape toujours inerte');
d.getElementById('chat-in').focus();

// 17 — vue /live : pas de focus au démarrage
d.documentElement.setAttribute('data-live', '1');
if (d.activeElement && d.activeElement.blur) d.activeElement.blur();
w._offlineMode = true;
show('s-create'); await tick();
ok(d.activeElement === d.body, '/live : aucun focus automatique (focus laissé au document)');
hide('s-create'); await tick();
d.documentElement.removeAttribute('data-live'); w._offlineMode = false;
d.getElementById('chat-in').focus();

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
