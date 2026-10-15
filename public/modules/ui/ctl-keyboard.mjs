// @ts-check
// ── ctl-keyboard.mjs — on-screen keyboard for controllers ───────────────────
//
// WEB ADDITION. A controller cannot type: when 'ok' lands on a text field
// (ui/ctl-nav.mjs), this keyboard opens over the bottom of the screen
// instead of focusing the field (so a phone does not also pop its own
// keyboard). Keys are ordinary buttons, so the D-pad and A drive it like any
// window; the controller's other buttons are shortcuts, received through the
// __ctl hook of the window (see ctl-nav.mjs):
//   'chat' (X) ⌫ · 'ace' (Y) space · 'zonePrev' (LB) ⇧ · 'zoneNext' (RB) 123
//   'menu' (Start) send / confirm · 'back' (B) closes it, text kept.
// Chat fields get a row of quick phrases (sent at once). The letter layout
// follows the interface language: AZERTY (fr), QWERTZ (de, cs, sk, hu, sl,
// hr, bs, sq), Cyrillic (ru, uk, be, bg, mk, kk, ky, tg, mn), else QWERTY;
// accents and symbols one key away. Device-agnostic, like the menu.

import { registerOverlay } from './keynav.mjs';

function t(key, params) {
  return (typeof window !== 'undefined' && window.t) ? window.t(key, params) : key;
}

const LAYOUTS = {
  qwerty: ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'],
  azerty: ['azertyuiop', 'qsdfghjklm', 'wxcvbn'],
  qwertz: ['qwertzuiop', 'asdfghjkl', 'yxcvbnm'],
  cyr: ['йцукенгшщзх', 'фывапролджэ', 'ячсмитьбюъ']
};
const SYMBOLS = ['1234567890', '@#&*-+=()/', '.,?!\'":;_%'];
const ACCENTS = {
  latin: ['àâäáãåæç', 'éèêëíìîïı', 'óòôöõœøúùûü', 'ñßÿýčšžłđ'],
  cyr: ['ёіїєґў', 'ђјљњћџ', 'қңғүұһә', 'өҷҳӣӯ']
};
const PHRASES = ['padQ1', 'padQ2', 'padQ3', 'padQ4', 'padQ5', 'padQ6'];
const CHAT_IDS = ['g-chat-in', 'chat-in'];

export function layoutFor(lang) {
  var l = String(lang || '').toLowerCase().split('-')[0];
  if (l === 'fr') return 'azerty';
  if (['de', 'cs', 'sk', 'hu', 'sl', 'hr', 'bs', 'sq'].indexOf(l) >= 0) return 'qwertz';
  if (['ru', 'uk', 'be', 'bg', 'mk', 'kk', 'ky', 'tg', 'mn'].indexOf(l) >= 0) return 'cyr';
  return 'qwerty';
}

var el = null, unreg = null, field = null, layer = 'abc', shift = false;
// The field must not take the focus while the keyboard is up (a phone would
// open its own keyboard on top).
function keepBlurred(e) { if (isOpen() && e.target === field) { try { field.blur(); } catch (er) {} } }

function fire(f, type) { try { f.dispatchEvent(new Event(type, { bubbles: true })); } catch (e) {} }
function isChat(f) { return !!f && CHAT_IDS.indexOf(f.id) >= 0; }
function maxLen(f) { var m = parseInt(f.getAttribute('maxlength'), 10); return m > 0 ? m : 1000; }

function setValue(v) {
  if (!field) return;
  field.value = v.slice(0, maxLen(field));
  fire(field, 'input');
  render();
}
function type(ch) {
  if (!field) return;
  var c = shift ? ch.toUpperCase() : ch;
  setValue(field.value + c);
  if (shift && layer === 'abc') { shift = false; build(); }
}
function backspace() { if (field) setValue(Array.from(field.value).slice(0, -1).join('')); }
function enter() {
  if (!field) return;
  var f = field;
  var ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
  f.dispatchEvent(ev);
  closeKeyboard();
}

function key(label, cls, onPress, title) {
  var b = document.createElement('button');
  b.type = 'button';
  b.className = 'ctl-key' + (cls ? ' ' + cls : '');
  b.textContent = label;
  if (title) b.setAttribute('aria-label', title);
  b.addEventListener('click', function (e) { e.preventDefault(); onPress(); });
  return b;
}

function render() {
  if (!el || !field) return;
  var txt = el.querySelector('.ctl-kb-text');
  var v = field.value || '';
  txt.textContent = (field.type === 'password' ? v.replace(/./g, '•') : v) || '';
  txt.setAttribute('data-ph', field.getAttribute('placeholder') || '');
}

function build() {
  var keys = el.querySelector('.ctl-kb-keys');
  keys.textContent = '';
  var lay = layoutFor(document.documentElement.lang);
  var rows = layer === '123' ? SYMBOLS : layer === 'acc' ? ACCENTS[lay === 'cyr' ? 'cyr' : 'latin'] : LAYOUTS[lay];
  rows.forEach(function (row, ri) {
    var r = document.createElement('div');
    r.className = 'ctl-kb-row';
    Array.from(row).forEach(function (ch, ci) {
      var shown = (shift && layer !== '123') ? ch.toUpperCase() : ch;
      var b = key(shown, '', function () { type(ch); });
      if (ri === 1 && ci === 0) b.setAttribute('data-kn-focus', '');
      r.appendChild(b);
    });
    keys.appendChild(r);
  });
  var last = document.createElement('div');
  last.className = 'ctl-kb-row';
  last.appendChild(key('⇧', 'ctl-key-fn' + (shift ? ' on' : ''), function () { shift = !shift; build(); }, 'Shift'));
  last.appendChild(key(layer === '123' ? 'abc' : '123', 'ctl-key-fn', function () { layer = layer === '123' ? 'abc' : '123'; build(); }));
  last.appendChild(key(layer === 'acc' ? 'abc' : 'àé', 'ctl-key-fn', function () { layer = layer === 'acc' ? 'abc' : 'acc'; build(); }));
  last.appendChild(key('␣', 'ctl-key-space', function () { type(' '); }, 'Space'));
  last.appendChild(key('⌫', 'ctl-key-fn', backspace, 'Backspace'));
  last.appendChild(key('↵', 'ctl-key-ok', enter, 'Enter'));
  keys.appendChild(last);
}

function buildPhrases() {
  var box = el.querySelector('.ctl-kb-phrases');
  box.textContent = '';
  box.hidden = !isChat(field);
  if (box.hidden) return;
  PHRASES.forEach(function (k, i) {
    var b = key(t(k), 'ctl-phrase', function () { setValue(t(k)); enter(); });
    if (i === 0) b.setAttribute('data-kn-focus', '');   // the ring starts on the phrases
    box.appendChild(b);
  });
}

function create() {
  el = document.createElement('div');
  el.id = 'ctl-kb';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.style.display = 'none';
  el.innerHTML = '<div class="ctl-kb-card"><div class="ctl-kb-text" aria-live="polite"></div>' +
    '<div class="ctl-kb-phrases"></div><div class="ctl-kb-keys"></div>' +
    '<div class="ctl-kb-legend" aria-hidden="true"></div></div>';
  el.addEventListener('click', function (e) { if (e.target === el) closeKeyboard(); });
  // Controller shortcuts while the keyboard is the open window.
  el.__ctl = function (action) {
    switch (action) {
      case 'chat': backspace(); return true;
      case 'ace': type(' '); return true;
      case 'zonePrev': shift = !shift; build(); return true;
      case 'zoneNext': layer = layer === '123' ? 'abc' : '123'; build(); return true;
      case 'menu': enter(); return true;
    }
    return false;
  };
  document.body.appendChild(el);
}

export function isOpen() { return !!(el && el.style.display !== 'none'); }

// legend: one line describing the shortcuts of the device in use.
export function openKeyboard(f, legend) {
  if (!f) return;
  if (!el) create();
  field = f;
  layer = 'abc'; shift = false;
  try { if (document.activeElement === f) f.blur(); } catch (e) {}
  f.addEventListener('focus', keepBlurred);
  build();
  buildPhrases();
  render();
  el.querySelector('.ctl-kb-legend').textContent = legend || '';
  el.style.display = '';
  if (!unreg) unreg = registerOverlay(el, closeKeyboard);
}

export function closeKeyboard() {
  if (!el) return;
  el.style.display = 'none';
  if (field) field.removeEventListener('focus', keepBlurred);
  field = null;
  if (unreg) { unreg(); unreg = null; }
}
