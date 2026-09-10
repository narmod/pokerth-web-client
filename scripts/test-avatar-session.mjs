#!/usr/bin/env node
// Avatar parity with the QML client (2.1.8-web.95).
// The official client keeps ONE avatar per session: ClientContext holds the
// file chosen at connection time, its MD5 goes into the InitMessage, the same
// bytes answer the server's AvatarRequest, and every client fetches it from
// the server by hash. The web client used to add a second, web-only path
// (AVATAR:/AVATARIMG: relayed by the proxy) that showed web players an avatar
// the official clients never received. Checks here: session snapshot,
// no relay left anywhere, and no hash for the initial-letter default.
// Run: node scripts/test-avatar-session.mjs
import { readFileSync } from 'fs';

globalThis.window = globalThis;
const store = {};
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  className: '', dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
  appendChild(c) { this.children.push(c); }, removeEventListener() {}, addEventListener() {},
  setAttribute() {}, removeAttribute() {}, getAttribute: () => null,
  querySelectorAll: () => [], querySelector: () => null, remove() {}, parentNode: null }; }
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  getElementById: () => makeEl(), createElement: () => makeEl(), body: { appendChild() {} } };
window.isBot = () => false;
window.getPlayerName = () => null;
window.updateLobbyPill = () => {};
window.send = () => {};
window._isIgnored = () => false;

const { S } = await import('../public/modules/game/state.mjs');
const P = await import('../public/modules/ui/player-popup.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// ── Session snapshot drives MY displayed avatar ─────────────────────────────
console.log('session avatar:');
store.pth_avatar = '🦊'; delete store.pth_avatar_img;
ok(S._sessAv === null && P._myAvChoice() === '🦊', 'outside a session: the current choice');
S._sessAv = { choice: '__img__', img: 'data:image/jpeg;base64,SESSION' };
store.pth_avatar = '🐸';
ok(P._myAvChoice() === '__img__', 'in a session: the choice frozen at Init, not a later pick');
store.pth_avatar_img = 'data:image/jpeg;base64,LATER';
ok(P._myAvImg() === 'data:image/jpeg;base64,SESSION', 'in a session: the image frozen at Init');
S.myId = 1; S.myName = 'Moi'; S._pthAvatarHashes = {}; S._pthDataUrls = {};
const mine = P._avatarChipHtml(1, 'Moi', 'pl-av');
ok(mine.includes('SESSION') && !mine.includes('LATER'), 'my chip shows the session image');
ok(P._myAvatarDisplay() === '', 'session image: no emoji text for me');
S._sessAv = { choice: '🦊', img: null }; S._myAvatarCache = '';
ok(P._myAvatarDisplay() === '🦊', 'session emoji wins over the emoji picked afterwards');
S._sessAv = null; S._myAvatarCache = '';
ok(P._myAvatarDisplay() === '🐸', 'session over: back to the current choice');

// ── Other players: only what the server gives ───────────────────────────────
console.log('other players:');
const other = P._avatarChipHtml(42, 'Zoé', 'pl-av');
ok(other.includes('Z') && !other.includes('<img'), 'no server avatar: initial, nothing from a relay');
S._pthAvatarHashes[42] = { type: 1, hashHex: 'ab' };
S._pthDataUrls.ab = 'data:image/png;base64,SERVER';
ok(P._avatarChipHtml(42, 'Zoé', 'pl-av').includes('SERVER'), 'server avatar (by hash) is what is shown');

// ── Sources: the relay is gone, the snapshot is taken at Init ───────────────
console.log('sources:');
const walk = (d) => readFileSync(d, 'utf8');
const files = ['public/pokerth.js', 'public/pokerth-client.html',
  'public/modules/ui/player-popup.mjs', 'public/modules/game/seat-render.mjs',
  'public/modules/net/msg-game-join.mjs', 'public/modules/game/msg-hand.mjs',
  'public/modules/game/state.mjs'];
const all = files.map(walk).join('\n');
ok(!/_playerAvatars|_playerImgAvatars/.test(all), 'no per-pid relay caches left');
ok(!/_rebroadcastAvatar|_myAvatarToBroadcast/.test(all), 'no rebroadcast at hand start or table join');
ok(!/send\('AVATAR/.test(all), 'no AVATAR:/AVATARIMG: frame is sent');
ok(!/startsWith\('AVATAR/.test(walk('public/pokerth.js')), 'incoming AVATAR:/AVATARIMG: frames are not displayed');
const proxy = walk('proxy.js');
ok(/if \(text\.startsWith\('AVATAR:'\) \|\| text\.startsWith\('AVATARIMG:'\)\) return;\s+(\/\/[^\n]*\n\s*)*if \(text\.startsWith\('REACT:'\)\) \{/.test(proxy),
   'proxy absorbs legacy avatar frames before the REACT relay (never to the TCP path)');
const lobby = walk('public/modules/net/msg-lobby.mjs');
const iSnap = lobby.indexOf('S._sessUpload = window._pthMyUpload || null;');
const iInit = lobby.indexOf('send(MSG.buildInit(');
ok(iSnap > 0 && iInit > iSnap, 'session avatar and upload bytes frozen right before the Init');
ok(/S\._sessAv = null; S\._sessUpload = null;/.test(walk('public/pokerth.js')), 'snapshot dropped with the connection state (not on a preserved reconnect)');
ok(/const up = S\._sessUpload \|\|/.test(walk('public/modules/net/msg-avatars.mjs')), 'AvatarRequest served from the session bytes');
const seat = walk('public/modules/game/seat-render.mjs');
ok(!/getItem\('pth_avatar/.test(seat), 'seats read my avatar through the session helpers only');
ok(/var _sessAv = \(window\.PthState && window\.PthState\._sessAv\) \|\| null;/.test(walk('public/pokerth.js')),
   'player bar / seat patch (refreshMyAvatar, outside the IIFE) reads the snapshot through window.PthState');

console.log(fail ? ('FAIL ' + fail + '/' + n) : ('OK ' + n + '/' + n));
process.exit(fail ? 1 : 0);
