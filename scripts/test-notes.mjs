#!/usr/bin/env node
// Tests déterministes pour public/modules/notes/ — store des notes de joueur.
// Run: node scripts/test-notes.mjs
//
// Périmètre : le STORE (lecture/écriture/fusion/élagage), qui est pur et
// injectable. Le rendu DOM (bloc de la carte joueur, pastille de siège) n'est
// couvert que par sa forme HTML, sans navigateur.
globalThis.window = globalThis;
// localStorage qui RETIENT vraiment : le singleton exporté par notes/index.mjs
// s'y branche, et un stub no-op le rendrait silencieusement intestable.
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); } };
})();
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  getElementById: () => null, createElement: () => ({ style: {} }),
  body: { appendChild() {} } };

const { createNotes, tagById, TAGS, MAX_NOTE_LEN, MAX_LABEL_LEN, MAX_ENTRIES } =
  await import('../public/modules/notes/store.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// Backend mémoire : le store doit être testable sans localStorage.
function mem() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) };
}
const mk = (opts = {}) => createNotes({ backend: mem(), ...opts });

// ── Écriture / lecture de base ────────────────────────────────────────────
{
  const st = mk();
  ok(st.get('Alice') === null, 'joueur inconnu → null, pas une entrée vide');
  ok(st.noteOf('Alice') === '', 'noteOf sur inconnu → chaîne vide');
  ok(st.hasAny('Alice') === false, 'hasAny false sur inconnu');

  st.set('Alice', { note: 'paie tout' });
  ok(st.noteOf('Alice') === 'paie tout', 'note écrite puis relue');
  ok(st.tagOf('Alice') === '', 'écrire la note ne pose pas d’étiquette');

  st.set('Alice', { tag: 'red' });
  ok(st.noteOf('Alice') === 'paie tout', 'poser une étiquette ne perd pas la note');
  ok(st.tagOf('Alice') === 'red', 'étiquette écrite puis relue');
}

// ── null = inchangé, '' = effacé ──────────────────────────────────────────
{
  const st = mk();
  st.set('Bob', { note: 'serré', tag: 'blue' });
  st.set('Bob', { note: null });
  ok(st.noteOf('Bob') === 'serré' && st.tagOf('Bob') === 'blue', 'null laisse les deux champs intacts');
  st.set('Bob', { tag: '' });
  ok(st.noteOf('Bob') === 'serré' && st.tagOf('Bob') === '', "'' efface l’étiquette seule");
  st.set('Bob', { note: '' });
  ok(st.get('Bob') === null, 'entrée vidée des deux côtés → supprimée, pas un squelette');
}

// ── Étiquette inconnue ────────────────────────────────────────────────────
{
  const st = mk();
  st.set('Eve', { note: 'x', tag: 'chartreuse' });
  ok(st.tagOf('Eve') === '', 'id d’étiquette inconnu → ignoré');
  ok(tagById('chartreuse') === null, 'tagById inconnu → null');
  ok(tagById('green') && tagById('green').hex === '#4caf72', 'tagById connu → couleur');
  ok(TAGS.length === 6 && TAGS.every((t) => t.id && t.hex && t.key), 'catalogue d’étiquettes bien formé');
}

// ── Pseudo : espaces de bord, pseudo vide ─────────────────────────────────
{
  const st = mk();
  st.set('  Carol  ', { note: 'a' });
  ok(st.noteOf('Carol') === 'a', 'les espaces de bord du pseudo ne créent pas deux entrées');
  ok(st.set('', { note: 'x' }) === null, 'pseudo vide refusé');
  ok(st.set('   ', { note: 'x' }) === null, 'pseudo tout-espaces refusé');
  ok(st.count() === 1, 'aucune entrée parasite créée');
}

// ── Plafond de longueur ───────────────────────────────────────────────────
{
  const st = mk();
  st.set('Long', { note: 'x'.repeat(MAX_NOTE_LEN + 250) });
  ok(st.noteOf('Long').length === MAX_NOTE_LEN, 'note tronquée au plafond');
}

// ── Élagage au-delà de MAX_ENTRIES ────────────────────────────────────────
{
  const st = mk();
  // Dates croissantes forcées : Date.now() ne bouge pas assez vite dans la
  // boucle pour départager les entrées, on écrit donc le t à la main ensuite.
  for (let i = 0; i < MAX_ENTRIES + 25; i++) st.set('P' + i, { note: 'n' + i });
  const raw = st.raw();
  Object.keys(raw.p).forEach((k) => { raw.p[k].t = parseInt(k.slice(1), 10); });
  // Réécrit via une entrée supplémentaire pour déclencher l'élagage sur des t
  // désormais distincts.
  const st2 = createNotes({ backend: { _v: JSON.stringify(raw), getItem() { return this._v; }, setItem(k, v) { this._v = v; }, removeItem() { this._v = null; } } });
  st2.set('Zulu', { note: 'dernier' });
  ok(st2.count() === MAX_ENTRIES, 'élagage ramène au plafond d’entrées');
  ok(st2.noteOf('Zulu') === 'dernier', "l’entrée qu’on vient d’écrire survit à l’élagage");
  ok(st2.get('P0') === null, 'la plus ancienne entrée est celle qui saute');
}

// ── Tri de names() : plus récent d'abord ──────────────────────────────────
{
  const st = mk();
  st.set('A', { note: '1' });
  const raw = st.raw(); raw.p.A.t = 1000;
  const st2 = createNotes({ backend: { _v: JSON.stringify(raw), getItem() { return this._v; }, setItem(k, v) { this._v = v; }, removeItem() { this._v = null; } } });
  st2.set('B', { note: '2' });   // t = maintenant, donc > 1000
  ok(st2.names()[0] === 'B', 'names() trie du plus récemment touché au plus ancien');
}

// ── Fusion multi-appareils (forme plate historique, toujours tolérée) ─────
{
  const st = mk();
  st.set('Alice', { note: 'locale' });
  const localTs = st.get('Alice').ts;

  // Entrée distante PLUS ANCIENNE → ne doit pas écraser.
  ok(st.mergeIn({ Alice: { n: 'distante vieille', c: '', t: localTs - 5000 } }) === false, 'fusion plus ancienne → aucun changement');
  ok(st.noteOf('Alice') === 'locale', 'la note locale plus récente est conservée');

  // Entrée distante PLUS RÉCENTE → gagne.
  const changed = st.mergeIn({ Alice: { n: 'distante neuve', c: 'green', t: localTs + 5000 } });
  ok(changed === true, 'fusion plus récente → signale un changement');
  ok(st.noteOf('Alice') === 'distante neuve' && st.tagOf('Alice') === 'green', 'la version la plus récente gagne');

  // Pseudo absent en local → ajouté.
  ok(st.mergeIn({ Bob: { n: 'venu de l’autre appareil', c: '', t: Date.now() } }) === true, 'pseudo inconnu ajouté par la fusion');
  ok(st.noteOf('Bob') === 'venu de l’autre appareil', 'contenu du pseudo ajouté');

  // Entrées invalides ignorées sans planter.
  ok(st.mergeIn(null) === false && st.mergeIn('x') === false && st.mergeIn({ X: 3 }) === false, 'entrées invalides ignorées');
}

// ── Libellés d'étiquette renommables (sens global d'une couleur) ──────────
{
  const st = mk();
  ok(st.labelOf('red') === '', 'sans renommage → libellé vide (le défaut i18n s’applique)');
  ok(st.setLabel('chartreuse', 'x') === false, 'couleur inconnue → refus');

  ok(st.setLabel('red', 'Bluffe tout') === true, 'renommage accepté');
  ok(st.labelOf('red') === 'Bluffe tout', 'libellé renommé relu');
  ok(st.setLabel('red', 'Bluffe tout') === false, 'même valeur → aucun changement (pas de sync inutile)');

  st.setLabel('red', '  ' + 'L'.repeat(MAX_LABEL_LEN + 30) + '  ');
  ok(st.labelOf('red').length === MAX_LABEL_LEN, 'libellé rogné et tronqué au plafond');

  ok(st.setLabel('red', '') === true && st.labelOf('red') === '', "'' remet le défaut et supprime l’entrée");
  ok(!('red' in st.raw().l), 'entrée de libellé supprimée du store');
}

// ── Fusion des libellés, couleur par couleur ──────────────────────────────
{
  const st = mk();
  st.setLabel('red', 'local');
  const lt = st.raw().l.red.t;

  ok(st.mergeIn({ p: {}, l: { red: { v: 'vieux', t: lt - 5000 } } }) === false, 'libellé distant plus ancien → ignoré');
  ok(st.labelOf('red') === 'local', 'le renommage local plus récent survit');

  ok(st.mergeIn({ p: {}, l: { red: { v: 'neuf', t: lt + 5000 }, blue: { v: 'venu d’ailleurs', t: lt + 5000 } } }) === true,
     'libellés distants plus récents fusionnés');
  ok(st.labelOf('red') === 'neuf' && st.labelOf('blue') === 'venu d’ailleurs',
     'deux appareils renommant deux couleurs différentes survivent tous les deux');

  ok(st.mergeIn({ p: {}, l: { chartreuse: { v: 'x', t: Date.now() } } }) === false, 'couleur inconnue ignorée à la fusion');

  // Fusion { p, l } : les notes de joueur voyagent dans p.
  ok(st.mergeIn({ p: { Zoé: { n: 'nouvelle', c: 'green', t: Date.now() } }, l: {} }) === true, 'forme { p, l } : joueur ajouté');
  ok(st.noteOf('Zoé') === 'nouvelle', 'note du joueur relue après fusion { p, l }');
}

// ── Stockage corrompu ─────────────────────────────────────────────────────
{
  const be = mem();
  be.setItem('pth_notes', '{ pas du json');
  const st = createNotes({ backend: be });
  ok(st.count() === 0, 'JSON corrompu → store vide plutôt qu’une exception');
  st.set('Alice', { note: 'ok' });
  ok(st.noteOf('Alice') === 'ok', 'écriture possible après corruption');

  const be2 = mem();
  be2.setItem('pth_notes', '["tableau"]');
  ok(createNotes({ backend: be2 }).count() === 0, 'tableau au lieu d’objet → store vide');
}

// ── onChange ──────────────────────────────────────────────────────────────
{
  let hits = 0;
  const st = createNotes({ backend: mem(), onChange: () => { hits++; } });
  st.set('Alice', { note: 'a' });
  st.set('Alice', { tag: 'red' });
  ok(hits === 2, 'onChange notifié à chaque écriture');
  st.clearAll();
  ok(hits === 3 && st.count() === 0, 'clearAll vide et notifie');
}

// ── Rendu (formes HTML, sans navigateur) ──────────────────────────────────
{
  const UI = await import('../public/modules/notes/index.mjs');
  ok(UI.seatTagHtml('Personne') === '', 'siège sans étiquette → aucun HTML');

  UI.notes.set('Tagged', { tag: 'red' });
  const seat = UI.seatTagHtml('Tagged');
  ok(seat.includes('seat-note-tag') && seat.includes('#e05050'), 'siège étiqueté → pastille de la bonne couleur');
  UI.notes.set('Tagged', { note: 'sur-relance préflop' });
  const seat2 = UI.seatTagHtml('Tagged');
  ok(seat2.includes('sur-relance préflop'), 'le title de la pastille embarque l’aperçu de la note');
  UI.notes.set('Bavard', { tag: 'blue', note: 'y'.repeat(200) });
  const seat3 = UI.seatTagHtml('Bavard');
  ok(seat3.includes('…') && !seat3.includes('y'.repeat(120)), 'aperçu tronqué pour une note longue');

  const block = UI.notesBlockHtml('Tagged');
  ok(block.includes('nv-block') && block.includes('data-nv-name="Tagged"'), 'bloc de carte rendu avec son pseudo');
  ok((block.match(/data-nv-tag=/g) || []).length === TAGS.length + 1, 'une pastille par étiquette + le bouton « aucune »');
  ok(block.includes('aria-pressed="true"'), 'l’étiquette active est marquée pour les lecteurs d’écran');
  ok(UI.notesBlockHtml('') === '', 'pseudo vide → aucun bloc');

  ok(block.includes('nv-label') && !block.includes('nv-label-row" style="display:none"'),
     'joueur étiqueté → champ libellé visible');
  UI.notes.set('Untagged', { note: 'sans couleur' });
  const ub = UI.notesBlockHtml('Untagged');
  ok(ub.includes('nv-label-row" style="display:none"'), 'sans couleur → champ libellé masqué');

  // Échappement : un pseudo hostile ne doit pas sortir de son attribut.
  UI.notes.set('a"><img src=x>', { note: 'x' });
  const eb = UI.notesBlockHtml('a"><img src=x>');
  ok(!eb.includes('<img src=x>'), 'pseudo échappé dans le bloc');

  ok(typeof window._nvBlockHtml === 'function' && typeof window._nvSeatTag === 'function'
     && typeof window._nvWire === 'function' && typeof window._nvFlush === 'function', 'ponts window en place');
}

// ── Câblage de la synchronisation (analyse de source, comme test-cfg-sync-hold) ──
// pth_notes doit être COLLECTÉE (sinon elle ne part jamais) et FUSIONNÉE
// (jamais écrasée : chaque appareil annote des joueurs différents, un
// écrasement perd la moitié des notes). Ce contrôle garde les deux propriétés
// ensemble — les séparer est précisément la façon dont ça casserait.
{
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const src = fs.readFileSync(path.join(root, 'public', 'pokerth.js'), 'utf8');

  const overwriteList = (src.match(/var _CFG_WEB_SYNC_KEYS = \[[\s\S]*?\];/) || [''])[0];
  ok(overwriteList.length > 0, 'liste des clés écrasées trouvée dans pokerth.js');
  ok(!/'pth_notes'/.test(overwriteList), 'pth_notes n’est PAS dans la liste écrasée');

  ok(/var _NOTES_SYNC_KEYS = \['pth_notes'\]/.test(src), 'pth_notes déclarée dans sa propre liste');
  ok(/_NOTES_SYNC_KEYS\.forEach/.test(src), 'pth_notes est collectée pour la poussée');
  ok(/if \(_notesMergeIn\(o\)\)/.test(src), 'la fusion est branchée dans l’application du blob');
  ok(/_notesMergeIn[\s\S]{0,600}window\._nvStore/.test(src), 'la fusion passe par le store du module');
}

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
