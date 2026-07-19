#!/usr/bin/env node
// Deterministic tests for public/modules/ui/game-info.mjs (ESM #9g-B1).
// Run: node scripts/test-game-info.mjs
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  className: '', dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
  appendChild(c) { this.children.push(c); }, addEventListener() {}, remove() {},
  querySelector: () => null, querySelectorAll: () => [] }; }
const els = {};
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  getElementById: (id) => (els[id] = els[id] || makeEl()), createElement: () => makeEl() };
window._lang = 'en';
window._lastPotTotal = 750;
window._avatarChipHtml = (pid, name, cls) => '<span class="' + cls + '">' + name + '</span>';
window.isBot = () => false; // requis par _avatarChipHtml (player-popup.mjs)

const { S } = await import('../public/modules/game/state.mjs');
const G = await import('../public/modules/ui/game-info.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// _fmtBlindsCountdown : format m:ss depuis l'ancre du niveau
S._raiseEvery = 5; // minutes
S._blindsClockStart = Date.now() - 2 * 60000; // niveau entamé depuis 2 min
const cd = G._fmtBlindsCountdown();
ok(/^[23]:[0-5]\d$/.test(cd), '_fmtBlindsCountdown ≈ 3:00 restantes (' + cd + ')');
S._blindsClockStart = Date.now() - 10 * 60000; // niveau dépassé
ok(G._fmtBlindsCountdown() === '0:00', '_fmtBlindsCountdown plancher 0:00');

// _start/_stopBlindsCountdown : timer armé puis nettoyé
S._blindsCdTimer = null;
G._startBlindsCountdown();
ok(!!S._blindsCdTimer, '_startBlindsCountdown arme le timer');
G._stopBlindsCountdown();
ok(S._blindsCdTimer === null, '_stopBlindsCountdown le nettoie');

// _remainCount : ni gone ni éliminé (money ≤ 0 && active === false)
S.seats = [1, 2, 3, 4];
S.seatData = { 1: { money: 500, active: true },
               2: { gone: true, money: 500 },
               3: { money: 0, active: false },
               4: { money: 100, active: true } };
ok(G._remainCount() === 2, '_remainCount compte 2 restants (gone + éliminé exclus)');

// refreshStartNoBotsVisibility : admin + ≥2 humains → visible, sinon masqué
S.amGameAdmin = true; S._gameStarted = false; S.myId = 1;
S.seatData = { 1: {}, 2: {} };
G.refreshStartNoBotsVisibility();
ok(els['admin-startnobots-btn'].style.display === '', 'bouton Start visible (admin, 2 joueurs)');
S.amGameAdmin = false;
G.refreshStartNoBotsVisibility();
ok(els['admin-startnobots-btn'].style.display === 'none', 'masqué si pas admin');

// updateLobbyPill : nom + avatar dans la barre du bas
S.myName = 'Arnaud'; S.myId = 7;
G.updateLobbyPill();
ok(els['lobby-foot-name'].textContent === 'Arnaud', 'pill : nom dans la barre du bas');
ok(els['lobby-foot-av'].innerHTML.length > 0, 'pill : chip avatar rendu');

// _resetGameHeader : retour à l'état neutre
document.getElementById('g-name').textContent = 'Ma table';
document.getElementById('g-admin-badge').style.display = '';
G._resetGameHeader();
ok(els['g-name'].textContent === 'TABLE', '_resetGameHeader : titre TABLE');
ok(els['g-admin-badge'].style.display === 'none', '_resetGameHeader : badge admin masqué');

// openGameInfoPopup : titre, sections, spectateurs, lien d'invitation
S._gameMeta = { id: 42, name: 'Table test', type: 1, maxPlayers: 6,
                priv: true, timeout: 20, startMoney: 3000 };
S.gId = 42; S.amGameAdmin = true; S._gameStarted = true; S.handNum = 3;
S.smallBlind = 10; S.gameTimeout = 20; S.gameStartMoney = 3000;
S.seats = [1, 2]; S.seatData = { 1: { money: 500 }, 2: { money: 100 } };
S._amSpectator = false; S._specPids = new Set([9]); S.players = { 9: 'Ghost' };
G.openGameInfoPopup();
ok(els['gim-title'].textContent === 'Table test · #42', 'popup : titre nom · #id');
ok(els['gim-subtitle'].innerHTML.includes('🔒'), 'popup : badge privé');
ok(els['gim-subtitle'].innerHTML.includes('👁 1'), 'popup : badge 1 spectateur');
ok(els['gim-body'].innerHTML.includes('$10 / $20'), 'popup : blinds SB/BB');
ok(els['gim-body'].innerHTML.includes('3 000') || els['gim-body'].innerHTML.includes('3,000'),
   'popup : stack de départ groupé');
ok(els['gim-body'].innerHTML.includes('H#3'), 'popup : numéro de main');
ok(els['gim-body'].innerHTML.includes('750'), 'popup : pot depuis window._lastPotTotal');
ok(els['gim-body'].innerHTML.includes('Ghost'), 'popup : spectateur listé');
ok(els['gim-body'].innerHTML.includes('gim-copy-link-btn'), 'popup : bouton lien d\'invitation');
ok(els['game-info-modal'].style.display === 'flex', 'popup : modal affiché');

// closeGameInfoPopup
G.closeGameInfoPopup();
ok(els['game-info-modal'].style.display === 'none', 'closeGameInfoPopup masque le modal');

// Ponts window pour le code legacy
ok(window.openGameInfoPopup === G.openGameInfoPopup &&
   window._refreshStartNoBotsVisibility === G.refreshStartNoBotsVisibility &&
   window.updateLobbyPill === G.updateLobbyPill &&
   window._resetGameHeader === G._resetGameHeader &&
   window._stopBlindsCountdown === G._stopBlindsCountdown,
   'ponts window.* en place');

console.log(fail ? `\n${fail}/${n} ÉCHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
