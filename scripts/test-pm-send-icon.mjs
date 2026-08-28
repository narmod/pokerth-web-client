// Bouton d'envoi du dialogue PM — parité QML PrivateMessageDialog (stable,
// 27/08/2026, be3c43c) : icône avion carrée façon ChatBox à la place du gros
// bouton texte, ET le clic souris ne vole pas le focus du champ (équivalent
// web du focusPolicy NoFocus) pour qu'Enter enchaîne le message suivant.
import { readFileSync } from 'fs';

let bad = 0;
const ok = (cond, label) => {
  console.log('  ' + (cond ? '\u2713' : 'FAIL') + ' ' + label);
  if (!cond) bad++;
};

console.log('html:');
const html = readFileSync('public/pokerth-client.html', 'utf8');
const btn = (html.match(/<button[^>]*id="pm-send"[^>]*>[\s\S]*?<\/button>/) || [''])[0];
ok(btn.length > 0, 'bouton #pm-send present');
ok(btn.indexOf('rk-tab') === -1, 'plus le chrome rk-tab du bouton texte');
ok(btn.indexOf('<svg') !== -1 && btn.indexOf('M2.01 21L23 12') !== -1, 'icone avion (meme path que .chat-send)');
ok(btn.indexOf('data-i18n="pmSend"') === -1, 'plus de libelle texte pmSend');
ok(btn.indexOf('data-i18n-title="sendTooltip"') !== -1 && btn.indexOf('data-i18n-aria="sendTooltip"') !== -1, 'tooltip + aria via sendTooltip (comme ChatBox)');
ok(btn.indexOf('onmousedown="event.preventDefault()"') !== -1, 'clic souris sans vol de focus (NoFocus QML)');
ok(btn.indexOf('disabled') !== -1, 'demarre desactive (garde _renderCounter intacte)');

console.log('css:');
const css = readFileSync('public/pokerth.css', 'utf8');
const rule = (css.match(/\.pm-send \{[\s\S]*?\}/) || [''])[0];
ok(rule.length > 0, 'regle .pm-send presente');
ok(/width: ?32px/.test(rule) && /height: ?32px/.test(rule), 'carre 32x32 (hauteur du champ)');
ok(/background: ?none/.test(rule) && /border: ?none/.test(rule), 'sans chrome, comme le chat lobby');
ok(css.indexOf('.pm-send:disabled { opacity: .5;') !== -1, 'desactive attenue');
ok(css.indexOf(':root[data-theme="pokerth"] .pm-send { color: #4ade80; }') !== -1
   && css.indexOf(':root[data-theme="pokerth-light"] .pm-send { color: #16a34a; }') !== -1,
   'verts par theme identiques a #lobby-chat-panel .chat-send');

console.log('pm.mjs:');
const pm = readFileSync('public/modules/ui/pm.mjs', 'utf8');
ok(pm.indexOf("$('pm-send')") !== -1 && pm.indexOf("btn.addEventListener('click', _doSend)") !== -1, 'clic toujours branche sur _doSend');
ok(/btn\.disabled = blocked \|\| !_current \|\| !inp\.value\.trim\(\)/.test(pm), 'etat disabled toujours pilote par _renderCounter');

if (bad) { console.log('FAIL ' + bad); process.exit(1); }
console.log('PM SEND ICON OK');
