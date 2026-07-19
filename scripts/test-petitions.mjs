#!/usr/bin/env node
// Deterministic tests for public/modules/net/petitions.mjs (ESM #9f-5).
// Run: node scripts/test-petitions.mjs
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const els = {};
function el(id) { return els[id] = els[id] || { style: {}, textContent: '', innerHTML: '',
  classList: { add() {}, remove() {} }, addEventListener() {}, remove() {} }; }
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [], getElementById: (id) => el(id), createElement: () => el('tmp_' + Math.random()),
  body: { appendChild() {} } };
const sent = [], toasts = [], chats = [];
window.send = (b) => sent.push(b);
window.showToast = (m) => toasts.push(String(m));
window.closePlayerInfoPopup = () => {};
window.addChat = (pid, txt) => chats.push(String(txt));

const { S } = await import('../public/modules/game/state.mjs');
const P = await import('../public/modules/net/petitions.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

S.players = { 7: 'Cible', 9: 'Votant' };
ok(P._petName(7) === 'Cible' && P._petName(42) === '#42', '_petName pseudo ou #pid');

// Cycle pétition : start → update → vote → end
S.gId = 3; S.myId = 9;
P._petStart({ petitionId: 11, target: 7, endsAt: Date.now() + 30000 });
ok(S._pet && S._pet.petitionId === 11 && S._pet.target === 7, '_petStart installe la pétition');
P._petUpdate(11, 1, 2, 4);
ok(!!S._pet, '_petUpdate absorbe les compteurs sans casser la pétition');
sent.length = 0;
P._petVote(true);
ok(sent.length === 1 && S._pet && S._pet.voted, '_petVote envoie et verrouille');
P._petVote(true);
ok(sent.length === 1, 'double vote bloqué');
P._petEnd(11, 0, 0);
ok(S._pet === null, '_petEnd nettoie l\'état');

// _petClear coupe le timer
P._petStart({ petitionId: 12, target: 7, endsAt: Date.now() + 30000 });
const hadTimer = !!(S._pet && S._pet.timer);
P._petClear();
ok(hadTimer && S._pet === null, '_petClear stoppe timer + état');

// Invitations : show → decline envoie RejectInvite
S._inv = null; sent.length = 0;
P._inviteShow({ gameId: 5, byName: 'Hôte' });
ok(S._inv && S._inv.gameId === 5, '_inviteShow mémorise la partie');
P._inviteDecline();
ok(S._inv === null && sent.length === 1, '_inviteDecline nettoie et envoie le refus');
P._inviteDecline();
ok(sent.length === 1, 'double refus inerte');

ok(window._petAsk === P._petAsk && window._inviteShow === P._inviteShow, 'ponts window en place');
console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
