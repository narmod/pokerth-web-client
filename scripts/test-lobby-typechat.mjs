// Deterministic test of modules/ui/lobby-typechat.mjs
//   lobby: a printable key typed outside a text field goes into the chat.
// Run: node scripts/test-lobby-typechat.mjs
import { JSDOM } from 'jsdom';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}

const dom = new JSDOM(`<!doctype html><body>
  <div id="s-lobby" class="screen active">
    <div id="g-list" tabindex="0"><button id="join">Join</button></div>
    <input id="search" type="text">
    <input id="chk" type="checkbox">
    <input id="chat-in" maxlength="5">
  </div>
  <div id="s-game" class="screen"></div>
  <div id="modal"><button id="mbtn">OK</button></div>
</body>`, { url: 'https://pokerth.local/', pretendToBeVisual: true });
const w = dom.window;
for (const k of ['document', 'localStorage', 'KeyboardEvent', 'Event']) globalThis[k] = w[k];
globalThis.window = w;
// jsdom has no layout: every element counts as visible unless display:none.
Object.defineProperty(w.HTMLElement.prototype, 'offsetWidth', { get() { return 10; } });

const { typeChatAction, targetKind, bindLobbyTypeChat } = await import('../public/modules/ui/lobby-typechat.mjs');

console.log('lobby-typechat');

// ── pure decision ──
const CTX = { enabled: true, lobbyActive: true, overlay: false, inputReady: true, target: 'body' };
const K = (key, extra) => Object.assign({ key }, extra || {});
ok(typeChatAction(K('h'), CTX) === 'insert', 'a letter on the page goes into the chat');
ok(typeChatAction(K('é'), CTX) === 'insert', 'an accented letter too');
ok(typeChatAction(K('@', { ctrlKey: true, altKey: true, altGraph: true }), CTX) === 'insert', 'AltGr characters are typed');
ok(typeChatAction(K('s', { altKey: true }), CTX) === null, 'Alt+S stays a shortcut');
ok(typeChatAction(K('c', { ctrlKey: true }), CTX) === null, 'Ctrl+C stays a shortcut');
ok(typeChatAction(K('v', { metaKey: true }), CTX) === null, 'Cmd+V stays a shortcut');
ok(typeChatAction(K('Dead'), CTX) === 'focus', 'a dead key only moves the focus');
ok(typeChatAction(K('Enter'), CTX) === null, 'Enter is left alone');
ok(typeChatAction(K('Tab'), CTX) === null, 'Tab is left alone');
ok(typeChatAction(K('F5'), CTX) === null, 'F-keys are left alone');
ok(typeChatAction(K('a', { isComposing: true }), CTX) === null, 'IME composition is left alone');
ok(typeChatAction(K('a', { keyCode: 229 }), CTX) === null, 'IME processing key is left alone');
ok(typeChatAction(K('a', { defaultPrevented: true }), CTX) === null, 'a key already handled is left alone');
ok(typeChatAction(K(' '), CTX) === 'insert', 'Space on the page goes into the chat');
ok(typeChatAction(K(' '), Object.assign({}, CTX, { target: 'lobby' })) === null, 'Space on a focused button stays a click');
ok(typeChatAction(K('x'), Object.assign({}, CTX, { target: 'lobby' })) === 'insert', 'a letter on a focused lobby control goes into the chat');
ok(typeChatAction(K('x'), Object.assign({}, CTX, { target: 'editable' })) === null, 'a text field keeps its keys');
ok(typeChatAction(K('x'), Object.assign({}, CTX, { target: 'outside' })) === null, 'a window outside the lobby keeps its keys');
ok(typeChatAction(K('x'), Object.assign({}, CTX, { enabled: false })) === null, 'option off: nothing');
ok(typeChatAction(K('x'), Object.assign({}, CTX, { lobbyActive: false })) === null, 'not in the lobby (table): nothing');
ok(typeChatAction(K('x'), Object.assign({}, CTX, { overlay: true })) === null, 'a window open: nothing');
ok(typeChatAction(K('x'), Object.assign({}, CTX, { inputReady: false })) === null, 'no usable chat field: nothing');

// ── target classification ──
const $ = (id) => w.document.getElementById(id);
const lobby = $('s-lobby');
ok(targetKind(w.document.body, lobby) === 'body', 'body → body');
ok(targetKind($('search'), lobby) === 'editable', 'text input → editable');
ok(targetKind($('chk'), lobby) === 'lobby', 'checkbox → lobby control');
ok(targetKind($('join'), lobby) === 'lobby', 'button in the lobby → lobby control');
ok(targetKind($('mbtn'), lobby) === 'outside', 'button outside the lobby → outside');

// ── wired behaviour ──
bindLobbyTypeChat({ lobbyId: 's-lobby', inputId: 'chat-in' });
const chat = $('chat-in');
function press(target, key, extra) {
  const ev = new w.KeyboardEvent('keydown', Object.assign({ key, bubbles: true, cancelable: true }, extra || {}));
  target.dispatchEvent(ev);
  return ev;
}
let inputs = 0;
chat.addEventListener('input', () => { inputs++; });
w.document.body.focus();
let ev = press(w.document.body, 'h');
ok(chat.value === 'h' && w.document.activeElement === chat, 'typing on the page writes in the chat and focuses it');
ok(ev.defaultPrevented, 'the key is not typed twice');
ok(inputs === 1, 'an input event is fired (emote popup, counters)');
press(chat, 'i');   // focus now in the field: the browser types it, the module stays out
ok(chat.value === 'h', 'once in the field, the module leaves typing to the browser');
chat.value = '';
$('join').focus();
press($('join'), 'g');
ok(chat.value === 'g', 'from a focused button in the lobby too');
chat.value = '';
ev = press($('join'), ' ');
ok(chat.value === '' && !ev.defaultPrevented, 'Space on a focused button is not taken');
chat.value = '12345';
w.document.body.focus();
press(w.document.body, 'x');
ok(chat.value === '12345', 'maxlength is respected');
chat.value = '';
w.keynavHasOpenSurface = () => true;
press(w.document.body, 'x');
ok(chat.value === '', 'an open window blocks it');
w.keynavHasOpenSurface = () => false;
w._advGet = (k, d) => (k === 'lobby_type_chat' ? false : d);
press(w.document.body, 'x');
ok(chat.value === '', 'option lobby_type_chat off blocks it');
w._advGet = (k, d) => d;
lobby.classList.remove('active');
press(w.document.body, 'x');
ok(chat.value === '', 'at the table (lobby screen not active) nothing happens');
lobby.classList.add('active');
chat.style.display = 'none';
press(w.document.body, 'x');
ok(chat.value === '', 'a hidden chat (lobby chat off) is not filled');
chat.style.display = '';

// ── wiring and translations ──
const rd = (p) => readFileSync(join(root, p), 'utf8');
ok(/import \{ bindLobbyTypeChat \} from '\.\/lobby-typechat\.mjs'/.test(rd('public/modules/ui/lobby.mjs')), 'lobby.mjs binds the module');
ok(/'\/modules\/ui\/lobby-typechat\.mjs'/.test(rd('public/sw.js')), 'the module is precached');
ok(/id="adv-lobbytypechat"[^>]*setAdvOpt\('lobby_type_chat'/.test(rd('public/pokerth-client.html')), 'the option has its checkbox');
ok(/sync\('adv-lobbytypechat', 'lobby_type_chat', true\)/.test(rd('public/pokerth.js')), 'the checkbox reflects the option (default on)');
ok(/'pth_lobby_type_chat'/.test(rd('public/pokerth.js')), 'the option follows the account sync');
const langs = readdirSync(join(root, 'public/modules/lang')).filter((f) => f.endsWith('.mjs'));
const missing = langs.filter((f) => !/advLobbyTypeChat:/.test(rd('public/modules/lang/' + f)));
ok(missing.length === 0, 'advLobbyTypeChat in all ' + langs.length + ' languages' + (missing.length ? ' (missing: ' + missing.join(', ') + ')' : ''));
const helps = readdirSync(join(root, 'public/modules/help/content')).filter((f) => f.endsWith('.mjs'));
const hMissing = helps.filter((f) => !/A–Z · 0–9/.test(rd('public/modules/help/content/' + f)));
ok(hMissing.length === 0, 'help row in all ' + helps.length + ' help corpora');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
