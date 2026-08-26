#!/usr/bin/env node
// Deterministic tests for public/modules/ui/botsuggest.mjs.
// Run: node scripts/test-botsuggest.mjs
//
// The scoring is checked against bbcbotplayerdb by hand-computed values, so a
// silent drift from the QML singleton shows up here rather than in a suggestion
// sent to real players.
globalThis.window = globalThis;

const els = {};
globalThis.document = {
  readyState: 'complete', addEventListener() {},
  getElementById: (id) => (els[id] = els[id] || { style: {} }),
  querySelectorAll: () => [], querySelector: () => null
};

// Botfiles served by the relay. minidb columns: name, ts2, ts3, ts4, rating, games.
const FILES = {
  minidb: [
    '* ghoti *\t3\t0\t0\t1500\t40',   // leading/trailing chars must survive
    'alice\t2\t0\t0\t1200\t10',
    'bob\t1\t1\t1\t900\t5',
    'zero\t0\t0\t0\t0\t99',           // rating 0 -> dropped at parse time
    'short\t1\t2\t3'                  // too few columns -> dropped
  ].join('\n'),
  weclist: ['Carol', 'dave', ''].join('\n'),
  bbcadmins: ['Referee', 'alice', ''].join('\n'),
  gameslist: ['// comment', '#mcup#g#July Cup#', '#mcupfinal#g#July Cup Final#', 'junk'].join('\n')
};
let fetched = [];
globalThis.fetch = (url) => {
  fetched.push(url);
  const kind = String(url).split('f=')[1];
  return Promise.resolve({ ok: true, text: () => Promise.resolve(FILES[kind] || '') });
};

const { S } = await import('../public/modules/game/state.mjs');
const B = await import('../public/modules/ui/botsuggest.mjs');

let fails = 0;
function ok(cond, label) { if (!cond) { console.error('  ✗ ' + label); fails++; } else console.log('  ✓ ' + label); }
function eq(a, b, label) { ok(a === b, label + '  (got ' + a + ', want ' + b + ')'); }
const done = () => new Promise((r) => setTimeout(r, 0));

// ── 1. Scoring: (tickets << 11) + (games << 4) + rating ───────────────
{
  // step 2 -> ts2. ghoti: 3 tickets -> (3<<11)+(40<<4)+1500 = 6144+640+1500 = 8284
  //           alice: 2 tickets -> (2<<11)+(10<<4)+1200 = 4096+160+1200 = 5456
  //           bob:   1 ticket   -> (1<<11)+(5<<4)+900   = 2048+80+900   = 3028
  let out = '';
  B.suggestForType('step2', ['* ghoti *', 'alice', 'bob'], [], (o, m) => { out = o ? m : 'KO'; });
  await done();
  eq(out, 'I suggest the following players for step 2: * ghoti *, alice, bob',
     'step 2: sorted by score, untrimmed name preserved');
  ok(fetched.length === 1 && fetched[0].indexOf('f=minidb') !== -1, 'step: minidb fetched once');
}

// ── 2. Cache: a second call does not refetch ──────────────────────────
{
  fetched = [];
  B.suggestForType('step1', ['alice'], [], () => {});
  await done();
  eq(fetched.length, 0, 'cache: no second fetch within the TTL');
}

// ── 3. Step 1 always counts one ticket ────────────────────────────────
{
  // alice at step 1: (1<<11)+(10<<4)+1200 = 3456 ; at step 3 her ts3 is 0 -> score 0 -> dropped.
  let a = '', b = '';
  B.suggestForType('step1', ['alice'], [], (o, m) => { a = m; });
  B.suggestForType('step3', ['alice'], [], (o, m) => { b = m; });
  await done();
  ok(a.indexOf('alice') !== -1, 'step 1: one ticket for everyone');
  eq(b, 'Sorry, no player found to suggest', 'step 3: no ticket -> dropped');
}

// ── 4. Players already seated come last, annotated ────────────────────
{
  let out = '';
  B.suggestForType('step2', ['bob'], [{ name: 'alice', game: 'Cash 3' }], (o, m) => { out = m; });
  await done();
  eq(out, 'I suggest the following players for step 2: bob, alice (playing in game Cash 3)',
     'busy players are appended with their table');
}

// ── 5. WEC: list membership, original casing, own text ────────────────
{
  let out = '';
  B.suggestForType('wec', ['carol', 'bob'], [], (o, m) => { out = m; });
  await done();
  ok(out.indexOf('Carol') !== -1 && out.indexOf('bob') === -1,
     'wec: only listed players, upstream casing');
  let none = '';
  B.suggestForType('wec', ['bob'], [], (o, m) => { none = m; });
  await done();
  eq(none, 'Sorry, no wec player found to suggest', 'wec: dedicated empty text');
}

// ── 6. Monthly Cup title from gameslist.txt ───────────────────────────
{
  let t = null;
  B.gameTitlePrefix('mcup', (v) => { t = v; });
  await done();
  eq(t, 'July Cup', 'gameslist: title for a known command');
  B.gameTitlePrefix('nope', (v) => { t = v; });
  await done();
  eq(t, '', 'gameslist: unknown command -> empty');
}

// ── 7. Candidates read from the lobby state ───────────────────────────
{
  S._lobbyPids = new Set([1, 2, 3, 4, 5]);
  S.players = { 1: 'alice', 2: 'bob', 3: 'carol', 4: 'guesty', 5: '#42' };
  S._playerRights = { 1: 2, 2: 2, 3: 2, 4: 1, 5: 2 };   // 1 = guest
  S.games = { 7: { name: 'Cash 3', seats: [2] }, 9: { name: 'Mine', seats: [1] } };
  S.gId = 9;
  const idle = B.idlePlayerNames();
  ok(idle.indexOf('carol') !== -1, 'idle: an unseated player is listed');
  ok(idle.indexOf('bob') === -1, 'idle: a seated player is excluded');
  ok(idle.indexOf('alice') === -1, 'idle: my own table counts as seated');
  ok(idle.indexOf('guesty') === -1, 'idle: guests are excluded');
  ok(idle.indexOf('#42') === -1, 'idle: unresolved placeholder names are skipped');
  const busy = B.playingPlayerEntries();
  eq(busy.length, 1, 'busy: only players seated elsewhere');
  eq(busy[0].name + '@' + busy[0].game, 'bob@Cash 3', 'busy: carries the table name');
}

// ── 8. Suggest type comes from the preset, never from the name ────────
{
  ok(B.isSuggestType('step1') && B.isSuggestType('wec'), 'isSuggestType: accepts step1..4 and wec');
  ok(!B.isSuggestType('') && !B.isSuggestType('step5') && !B.isSuggestType('WEC'),
     'isSuggestType: rejects anything else');
  B.setCreatedSuggestType('step4');
  eq(B.getCreatedSuggestType(), 'step4', 'createdSuggestType round-trips');
}

// ── 9. Button visibility mirrors GameWaitPage.canSuggest ──────────────
{
  const btn = els['l-suggest-btn'] = { style: {} };
  window._advGet = (k, d) => (k === 'community_content' ? true : (k === 'community_suggest' ? true : d));
  S.amGameAdmin = true; S.games[9].type = 3; S.gId = 9;
  B.syncSuggestBtn();
  eq(btn.style.display, '', 'visible: admin + invite game + preset type + option on');
  S.amGameAdmin = false; B.syncSuggestBtn();
  eq(btn.style.display, 'none', 'hidden: not the game admin');
  S.amGameAdmin = true; S.games[9].type = 1; B.syncSuggestBtn();
  eq(btn.style.display, 'none', 'hidden: not an invite-only game');
  S.games[9].type = 3;
  window._advGet = (k, d) => (k === 'community_suggest' ? false : d);
  B.syncSuggestBtn();
  eq(btn.style.display, 'none', 'hidden: option off (the QML default)');
  window._advGet = (k, d) => (k === 'community_content' ? true : (k === 'community_suggest' ? true : d));
  B.setCreatedSuggestType(''); B.syncSuggestBtn();
  eq(btn.style.display, 'none', 'hidden: preset carries no suggest type');
}

// ── 10. The suggestion is shown locally, never sent ───────────────────
{
  const shown = [];
  window.addChat = (sender, text, cls) => shown.push({ sender, text, cls });
  B.setCreatedSuggestType('step2');
  S._lobbyPids = new Set([1]); S.players = { 1: 'alice' }; S._playerRights = { 1: 2 };
  // Une table valide : suggestPlayers() passe desormais par
  // effectiveSuggestType(), qui exige une partie « sur invitation » — comme
  // runSuggest() en amont. Cliquer hors table ne peut pas arriver, le bouton
  // n'etant visible que quand un type est utilisable.
  S.games = { 9: { type: 3, seats: [], name: 'BBC Step 2' } }; S.gId = 9;
  S.amGameAdmin = true;
  B.suggestPlayers();
  await done();
  eq(shown.length, 1, 'suggestPlayers: one local line');
  eq(shown[0].sender, null, 'suggestPlayers: no sender -> local note, not a chat message');
  ok(shown[0].text.indexOf('alice') !== -1, 'suggestPlayers: the suggestion reached the panel');
}

// ── 11. Table fingerprint: the type of a table we did not create ──────
// Le nom de table est librement editable, le protocole ne transporte aucun
// type : seuls capital + premiere petite blind + la suite manuelle complete
// identifient un BBC Step (amont 422f5fe4).
{
  const step1 = B.presets[0];
  eq(B.suggestTypeForGame({ startMoney: step1.startCash, smallBlind: step1.firstSmallBlind,
                            manualBlinds: step1.blinds.slice() }), 'step1',
     'fingerprint: exact settings identify BBC Step 1');
  const step4 = B.presets[3];
  eq(B.suggestTypeForGame({ startMoney: step4.startCash, smallBlind: step4.firstSmallBlind,
                            manualBlinds: step4.blinds.slice() }), 'step4',
     'fingerprint: exact settings identify BBC Step 4');
  const off = step1.blinds.slice(); off[7] = off[7] + 5;
  eq(B.suggestTypeForGame({ startMoney: step1.startCash, smallBlind: step1.firstSmallBlind,
                            manualBlinds: off }), '',
     'fingerprint: a single altered blind is no longer a match');
  eq(B.suggestTypeForGame({ startMoney: step1.startCash, smallBlind: step1.firstSmallBlind,
                            manualBlinds: step1.blinds.slice(0, -1) }), '',
     'fingerprint: a truncated blind list is no longer a match');
  eq(B.suggestTypeForGame({ startMoney: 10000, smallBlind: 50, manualBlinds: [] }), '',
     'fingerprint: doubling blinds is no signature (Monthly Cup / WEC skipped)');
  eq(B.suggestTypeForGame(null), '', 'fingerprint: no game info -> no type');
  // Le nom ne doit jouer aucun role.
  eq(B.suggestTypeForGame({ name: 'BBC Step 1', startMoney: 3000, smallBlind: 15,
                            manualBlinds: [] }), '',
     'fingerprint: the table name is never a source');
}

// ── 12. bbcadmins.txt decides who may suggest on a foreign Step table ──
{
  fetched = [];
  let got = null;
  B.isBbcAdmin('alice', (v) => { got = v; });
  await done();
  eq(got, true, 'bbcadmin: a listed nickname is recognised');
  ok(fetched.length === 1 && fetched[0].indexOf('f=bbcadmins') !== -1,
     'bbcadmin: bbcadmins.txt fetched through the relay');
  fetched = [];
  B.isBbcAdmin('REFEREE', (v) => { got = v; });
  await done();
  eq(got, true, 'bbcadmin: the match is case-insensitive');
  eq(fetched.length, 0, 'bbcadmin: a fresh cache answers without a request');
  B.isBbcAdmin('mallory', (v) => { got = v; });
  await done();
  eq(got, false, 'bbcadmin: an unlisted nickname is refused');
  B.isBbcAdmin('', (v) => { got = v; });
  await done();
  eq(got, false, 'bbcadmin: an empty nickname is refused without a request');
}

// ── 13. The button opens to a BBC admin on a foreign Step table ────────
{
  const btn = els['l-suggest-btn'] = { style: {} };
  window._advGet = (k, d) => (k === 'community_content' ? true : (k === 'community_suggest' ? true : d));
  const step3 = B.presets[2];
  S.myId = 1; S.players = { 1: 'alice' }; S._playerRights = { 1: 2 };
  S.amGameAdmin = false;                      // table de quelqu'un d'autre
  B.setCreatedSuggestType('');                // on ne l'a pas creee
  S.games = { 7: { type: 3, seats: [], name: 'whatever', startMoney: step3.startCash,
                   smallBlind: step3.firstSmallBlind, manualBlinds: step3.blinds.slice() } };
  S.gId = 7;
  B.syncSuggestBtn();
  eq(btn.style.display, 'none', 'foreign Step table: hidden until bbcadmins.txt answers');
  await done();
  B.syncSuggestBtn();
  eq(btn.style.display, '', 'foreign Step table: a BBC admin gets the button');
  eq(B.effectiveSuggestType(), 'step3', 'foreign Step table: the type comes from the settings');

  // Table non-Step d'un autre : ni empreinte, ni requete.
  fetched = [];
  S.games[8] = { type: 3, seats: [], name: 'BBC Step 1', manualBlinds: [] };
  S.gId = 8;
  B.syncSuggestBtn();
  eq(btn.style.display, 'none', 'foreign non-Step table: no button');
  eq(fetched.length, 0, 'foreign non-Step table: bbcadmins.txt is never requested');
}

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
