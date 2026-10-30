// Held-back private messages — parity upstream bc4dfb8a (stable, 30/10/2026):
// the server keeps a PM to a player at a running table or offline and
// delivers it once the game is over / at the next login. The web client no
// longer refuses those targets, writes to an offline partner of an existing
// conversation by name, shows the playing / offline notice, and switches to
// the "not delivered" wording on ChatRejectMessage.rejectReason = 1.
//
// Node has no IndexedDB nor DOM: the store runs on its memory fallback and the
// socket is a stub that records the frames.
globalThis.window = globalThis;
globalThis.document = { readyState: 'complete', addEventListener() {}, removeEventListener() {},
  getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
  documentElement: { getAttribute: () => null, setAttribute() {}, lang: 'en' },
  createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }) };
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.WebSocket = { OPEN: 1 };
try { Object.defineProperty(globalThis, 'navigator', { value: { language: 'en' }, configurable: true }); } catch (e) {}
window.directWS = true;

const { S } = await import('../public/modules/game/state.mjs');
const { Proto } = await import('../public/modules/net/proto.mjs');
const { MSG } = await import('../public/modules/net/messages.mjs');
const store = await import('../public/modules/pm/store.mjs');
const pm = await import('../public/modules/ui/pm.mjs');
const { readFileSync } = await import('fs');

let bad = 0;
const ok = (cond, label) => {
  console.log('  ' + (cond ? '✓' : 'FAIL') + ' ' + label);
  if (!cond) bad++;
};

const frames = [];
S.ws = { readyState: 1, send: function (d) { frames.push(d); } };
S.myId = 1;
S.players = { 1: 'me', 2: 'alice', 3: 'bob' };
S._lobbyPids = new Set([1, 2, 3]);
S._playerRights = {};
S.games = { 7: { mode: 2, seats: [2] } };     // alice plays at running table 7
S.amInGame = false;

// Decode a ChatRequest frame -> { id, text, name, hasId }.
function chatReq(bytes) {
  const top = Proto.decode(bytes);
  const req = Proto.decode(Proto.raw(top, 64));
  return { hasId: !!req[2], id: Proto.u32(req, 2), text: Proto.str(req, 3), name: Proto.str(req, 4) };
}

console.log('encoding:');
const f = chatReq(MSG.buildPrivateChatToName('carol', 'hi'));
ok(f.hasId && f.id === 0, 'targetPlayerId sent as explicit 0 (older server rejects it)');
ok(f.name === 'carol' && f.text === 'hi', 'targetPlayerName = field 4, chatText = field 3');

await store.setOwner('me');

console.log('partner at a running table:');
ok(pm.noticeKey('alice') === 'pmNoticePlaying', 'notice "is playing right now"');
ok(pm.sendTo('alice', 'gg') === '', 'no longer refused');
ok(chatReq(frames[frames.length - 1]).id === 2, 'sent to her player id');
ok(pm.noticeKey('bob') === '', 'no notice for a partner in the lobby');

console.log('limit reached (rejectReason 1):');
const n = pm.onLimit('alice', 'gg');
ok(n && n.key === 'pmLimitPlaying' && n.params.name === 'alice', 'chat note "Not delivered ... still playing"');
await new Promise(function (r) { setTimeout(r, 0); });
ok(!store.conversation('alice').some(function (m) { return m.text === 'gg'; }), 'undelivered line dropped from history');
ok(pm.noticeKey('alice') === 'pmLimitPlaying', 'dialogue notice stays on "not delivered"');
S.games = { 7: { mode: 3, seats: [2] } };     // game 7 is over
ok(pm.noticeKey('alice') === '', 'game over: notice and limit gone');
S.games = { 8: { mode: 2, seats: [2] } };     // new game: plain notice again
ok(pm.noticeKey('alice') === 'pmNoticePlaying', 'next game starts with the plain notice');

console.log('offline partner:');
S._lobbyPids = new Set([1, 3]);               // alice left
ok(pm.noticeKey('alice') === 'pmNoticeOffline', 'existing conversation: "is offline"');
ok(pm.noticeKey('zed') === '', 'no conversation: no notice');
ok(pm.sendTo('zed', 'yo') === 'notFound', 'unknown offline nick stays refused');
const before = frames.length;
ok(pm.sendTo('alice', 'see you') === '', 'offline partner of a conversation: sent');
const g = chatReq(frames[before]);
ok(frames.length === before + 1 && g.id === 0 && g.name === 'alice', 'sent by name');
pm.onLimit('', 'see you');                    // reason given without a name
ok(pm.noticeKey('alice') === 'pmLimitOffline', 'limit by pending text: "offline and already has messages"');
S._lobbyPids = new Set([1, 2, 3]); S.games = {};
ok(pm.noticeKey('alice') === '', 'back online: limit gone');

console.log('my own running table still blocks:');
S.amInGame = true; S._gameStarted = true;
ok(pm.sendTo('bob', 'x') === 'meAtTable', 'collusion guard kept');
S.amInGame = false; S._gameStarted = false;

console.log('wiring:');
const js = readFileSync('public/pokerth.js', 'utf8');
const can = (js.match(/function _plCanSendPm\(r\) \{[\s\S]*?\n\}/) || [''])[0];
ok(can && can.indexOf('_playerInRunningGame') === -1, 'envelope kept on players at a running table');
ok(js.indexOf('window._pmRefresh') !== -1, 'player list refresh updates the PM notice');
const soc = readFileSync('public/modules/net/msg-social.mjs', 'utf8');
ok(/Proto\.u32\(sub, 2\) === 1/.test(soc) && soc.indexOf('_pmOnLimit') !== -1, 'ChatReject reason 1 routed to the PM module');

console.log('i18n:');
const { readdirSync } = await import('fs');
let miss = 0;
for (const fn of readdirSync('public/modules/lang')) {
  const s = readFileSync('public/modules/lang/' + fn, 'utf8');
  for (const k of ['pmNoticePlaying', 'pmNoticeOffline', 'pmLimitPlaying', 'pmLimitOffline'])
    if (!new RegExp(k + ":'(?:[^'\\\\]|\\\\.)*\\{name\\}").test(s)) { miss++; console.log('    missing ' + k + ' in ' + fn); }
}
ok(miss === 0, '4 keys with {name} in every language');

if (bad) { console.log('FAIL ' + bad); process.exit(1); }
console.log('OK');
