// Tests déterministes du glossaire d'abréviations de chat (chat/abbrev.mjs).
// Couvre expandAbbrev (pré-expansion Google), abbrevMeaning (i18n + repli),
// et surtout les frontières de mots (aucun faux positif dans egg, email…).

// Stub window+t AVANT l'import : le module s'attache à window et abbrevMeaning
// passe par window.t (langue active), sinon repli sur l'expansion anglaise.
globalThis.window = {
  t: function (k) { return k === 'abbr_gg' ? 'bien joué' : k; }  // fr pour gg, clé brute sinon
};

const { ABBREV, expandAbbrev, abbrevMeaning } = await import('../public/modules/chat/abbrev.mjs');

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
function eq(a, b, label) { ok(a === b, label + '  (obtenu: ' + JSON.stringify(a) + ')'); }

// ── expandAbbrev : remplacement mot entier, insensible à la casse ──
eq(expandAbbrev('gg'), 'good game', 'gg → good game');
eq(expandAbbrev('GG!'), 'good game!', 'GG! → good game! (casse + ponctuation)');
eq(expandAbbrev('nh gg wp'), 'nice hand good game well played', 'multi-tokens');
eq(expandAbbrev('gl hf'), 'good luck have fun', 'gl hf');
eq(expandAbbrev('g2g'), 'got to go', 'alias g2g');
eq(expandAbbrev('str8 flush'), 'straight flush', 'str8 (avec chiffre)');
eq(expandAbbrev('ai'), 'all-in', 'ai → all-in');
eq(expandAbbrev('utg raise'), 'under the gun raise', 'utg');

// ── Frontières : AUCUN faux positif à l'intérieur d'un mot ──
eq(expandAbbrev('eggs'), 'eggs', 'pas de match dans "eggs" (gg)');
eq(expandAbbrev('email'), 'email', 'pas de match dans "email" (ai)');
eq(expandAbbrev('unlike'), 'unlike', 'pas de match dans "unlike" (nl)');
eq(expandAbbrev('aaa'), 'aaa', 'pas de match dans "aaa" (aa)');
eq(expandAbbrev('n123'), 'n123', 'pas de match dans "n123" (n1)');
eq(expandAbbrev('rabbit'), 'rabbit', 'pas de match dans "rabbit" (bb)');
eq(expandAbbrev(''), '', 'chaîne vide inchangée');
eq(expandAbbrev('bonjour tout le monde'), 'bonjour tout le monde', 'phrase sans abréviation inchangée');

// ── abbrevMeaning : i18n (langue active) puis repli anglais (xp) ──
eq(abbrevMeaning('gg'), 'bien joué', 'meaning gg = i18n fr (window.t)');
eq(abbrevMeaning('nh'), 'nice hand', 'meaning nh = repli xp (clé absente du stub)');
eq(abbrevMeaning('inconnu'), 'inconnu', 'token inconnu = renvoyé tel quel');

// ── Intégrité du glossaire ──
var keys = Object.keys(ABBREV);
ok(keys.length >= 25, 'glossaire fourni (' + keys.length + ' tokens)');
ok(keys.every(function (k) { return ABBREV[k].xp && ABBREV[k].key && /^abbr_/.test(ABBREV[k].key); }),
   'chaque entrée a xp + clé i18n abbr_*');
ok(!!(window._expandAbbrev && window._chatMarkAbbrev && window._abbrevMeaning),
   'ponts window.* exposés');

// ── markAbbrev : marquage DOM (jsdom) — spans créés, liens intacts ──
const { markAbbrev } = await import('../public/modules/chat/abbrev.mjs');
try {
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!doctype html><body></body>');
  globalThis.document = dom.window.document;
  globalThis.NodeFilter = dom.window.NodeFilter;

  // 1) texte simple : "gg nh" → 2 spans.chat-abbr avec title
  const el = dom.window.document.createElement('span');
  el.textContent = 'gg nh everyone';
  markAbbrev(el);
  const marks = el.querySelectorAll('.chat-abbr');
  eq(marks.length, 2, 'DOM: "gg nh" → 2 spans .chat-abbr');
  eq(marks[0].textContent, 'gg', 'DOM: 1er span = "gg" (casse préservée)');
  ok(marks[0].getAttribute('title') === 'bien joué', 'DOM: title localisé (gg → bien joué)');
  ok(el.textContent === 'gg nh everyone', 'DOM: texte visible inchangé');

  // 2) abréviation à l'intérieur d'un lien : NON marquée
  const el2 = dom.window.document.createElement('span');
  el2.innerHTML = 'see <a href="http://x/gg">gg</a> here nh';
  markAbbrev(el2);
  const inLink = el2.querySelector('a .chat-abbr');
  ok(!inLink, 'DOM: pas de marquage à l\'intérieur d\'un <a>');
  eq(el2.querySelectorAll('.chat-abbr').length, 1, 'DOM: seul le "nh" hors lien est marqué');

  // 3) idempotence : re-marquer ne double pas
  markAbbrev(el);
  eq(el.querySelectorAll('.chat-abbr').length, 2, 'DOM: re-marquage idempotent (pas de doublon)');
} catch (e) {
  console.log('skip DOM tests (jsdom indisponible): ' + (e && e.message));
}

// ── Option (avancées) : pth_chat_abbrev='0' désactive tout ──
// (placé en dernier : modifie localStorage pour le reste du process)
globalThis.localStorage = {
  _v: '0',
  getItem: function (k) { return k === 'pth_chat_abbrev' ? this._v : null; },
  setItem: function () {}, removeItem: function () {}
};
eq(expandAbbrev('gg nh'), 'gg nh', 'OFF: expandAbbrev ne développe plus');
try {
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!doctype html><body></body>');
  globalThis.document = dom.window.document;
  globalThis.NodeFilter = dom.window.NodeFilter;
  const el = dom.window.document.createElement('span');
  el.textContent = 'gg nh';
  markAbbrev(el);
  eq(el.querySelectorAll('.chat-abbr').length, 0, 'OFF: markAbbrev ne marque rien');
} catch (e) { /* jsdom absent : couvert par le test expand ci-dessus */ }
globalThis.localStorage._v = '1';
eq(expandAbbrev('gg'), 'good game', 'ON à nouveau: expansion rétablie');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All abbrev tests passed.');
