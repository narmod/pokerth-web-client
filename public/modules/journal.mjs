// @ts-check
// PokerTH web client — Écran « Journaux » (parité client Qt/QML : fenêtre de
// gestion des logs, aperçu, exports, analyse).
//
// Source de vérité : src/gui/qt/gametable/log/guilog.cpp du client officiel —
// la génération HTML/txt ci-dessous est un port ligne-à-ligne de
// exportLogPdbToHtml/Txt (chemin neu=false ; modus 1 = fichier HTML,
// modus 2 = txt, modus 3 = aperçu HTML).
//
// Données : la base IndexedDB 'pth_handlog' remplie par handlog.mjs
// (modèle .pdb officiel : Session/Game/Player/Hand/Action). Une session
// IndexedDB = un fichier pokerth-log-*.pdb du client officiel.
//
// Conception : module AUTONOME (comme handlog.mjs). Le client n'appelle que
// window._openJournal() ; si le module n'est pas chargé, rien ne casse.
//
// Extras web (absents du client officiel, signalés dans l'UI) :
//   · rétention automatique (pth_log_keep_days : 0=illimité, 7/30/90 jours)
//   · « Tout supprimer »
//   · recherche/surlignage dans l'aperçu

// ── i18n ──────────────────────────────────────────────────────────────────
function T(k, fb) {
  try {
    if (typeof window !== 'undefined' && typeof window.t === 'function') {
      const v = window.t(k);
      if (v && v !== k) return v;
    }
  } catch (_e) {}
  return fb;
}

// ── Accès IndexedDB (lecture/suppression ; l'écriture reste à handlog) ────
const DB_NAME = 'pth_handlog';
const DB_VERSION = 1;
const STORES = ['meta', 'games', 'players', 'hands', 'actions'];

function _open() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('no-idb')); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      // Même schéma que handlog.mjs (au cas où ce module s'ouvre en premier).
      const db = e.target.result;
      if (!db.objectStoreNames.contains('meta'))    db.createObjectStore('meta', { keyPath: 'k' });
      if (!db.objectStoreNames.contains('games'))   db.createObjectStore('games', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('players')) db.createObjectStore('players', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('hands'))   db.createObjectStore('hands', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('actions')) db.createObjectStore('actions', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function _loadAll() {
  const db = await _open();
  const get = (s) => new Promise((res, rej) => {
    const r = db.transaction([s], 'readonly').objectStore(s).getAll();
    r.onsuccess = () => res(r.result || []);
    r.onerror = () => rej(r.error);
  });
  const [metas, games, players, hands, actions] = await Promise.all(STORES.map(get));
  db.close();
  return { metas, games, players, hands, actions };
}

// Supprime tous les enregistrements d'une session (les 5 stores).
async function _deleteSession(sid) {
  const db = await _open();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORES, 'readwrite');
    tx.objectStore('meta').delete('session:' + sid);
    // games/players/hands/actions : id préfixé `${sid}:` → plage lexicale.
    const range = IDBKeyRange.bound(sid + ':', sid + ';', false, true);
    ['games', 'players', 'hands', 'actions'].forEach((s) => {
      const cur = tx.objectStore(s).openCursor(range);
      cur.onsuccess = (e) => { const c = e.target.result; if (c) { c.delete(); c.continue(); } };
    });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  db.close();
}

async function _deleteAll() {
  const db = await _open();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORES, 'readwrite');
    STORES.forEach((s) => tx.objectStore(s).clear());
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  db.close();
}

// ── Rétention automatique (extra web ; équivalent LogStoreDuration) ───────
function _keepDays() {
  try { return parseInt(localStorage.getItem('pth_log_keep_days') || '0', 10) || 0; } catch (_e) { return 0; }
}

async function purgeOldSessions() {
  const days = _keepDays();
  if (!days) return;
  try {
    const { metas } = await _loadAll();
    const cutoff = Date.now() - days * 86400000;
    const cur = (typeof window !== 'undefined' && window._handlog) ? window._handlog.sessionId : null;
    for (const m of metas) {
      const sid = m.sessionId || '';
      if (sid === cur) continue; // jamais la session en cours
      const dm = sid.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!dm) continue;
      const ts = new Date(+dm[1], +dm[2] - 1, +dm[3]).getTime();
      if (ts < cutoff) await _deleteSession(sid);
    }
  } catch (_e) {}
}

// ── Rendu du log (port de guilog.cpp, neu=false) ──────────────────────────
// modus : 1 = fichier HTML (</br> historiques inclus), 2 = txt, 3 = aperçu HTML.
// Le client officiel colle « PREFLOP » à la ligne dealer en modus 3 ; on
// insère le <br /> manquant (correctif cosmétique, exports 1/2 inchangés).

const RANK = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUIT_TXT = ['d', 'h', 's', 'c'];
const SUIT_HTML = [
  '<font size=+1><b>&diams;</b></font>',
  '<font size=+1><b>&hearts;</b></font>',
  '<font size=+1><b>&spades;</b></font>',
  '<font size=+1><b>&clubs;</b></font>',
];

// convertCardIntToString : rang (gras en HTML) + couleur.
function _card(code, modus) {
  if (code == null || code < 0 || code > 51) return '';
  const r = RANK[code % 13];
  const s = modus === 2 ? SUIT_TXT[(code / 13) | 0] : SUIT_HTML[(code / 13) | 0];
  if (modus === 2) return r + s;
  return '<b>' + r + '</b>' + s;
}

const NET_ACTIONS = ['has left the game', 'was kicked from the game', 'is game admin now', 'has joined the game'];
const NO_DOT = ['wins', 'shows', 'has', 'sits out', 'wins (side pot)', 'wins game'].concat(NET_ACTIONS);
const ROUND_NAMES = ['PREFLOP', 'FLOP', 'TURN', 'RIVER'];

function _esc(s) {
  return String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// tables : {session, games, players, hands, actions} déjà filtrées par session.
// opts : { modus, uniqueGameID (0=toutes), handID (0=toutes) }.
export function renderLog(tables, opts) {
  const modus = opts.modus | 0;
  const wantUg = opts.uniqueGameID | 0;
  const wantHand = opts.handID | 0;
  const html = modus !== 2;
  const nameOf = (players, ug, seat) => {
    const p = players.find((x) => x.uniqueGameID === ug && x.seat === seat);
    const n = p ? String(p.player) : '?';
    return html ? _esc(n) : n;
  };
  let out = '';

  // En-tête de session.
  const sess = tables.session || {};
  let s = 'Log-File for PokerTH ' + (sess.pokerthVersion || 'web') + ' Session started on ' + (sess.date || '') + ' at ' + (sess.time || '');
  if (modus === 1) out += '<h3><b>' + s + '</b></h3>\n';
  else if (modus === 3) out += '<h4><b>' + s + '</b></h4>';
  else out += s;

  const games = (tables.games || []).filter((g) => !wantUg || g.uniqueGameID === wantUg)
    .slice().sort((a, b) => a.uniqueGameID - b.uniqueGameID);

  for (const g of games) {
    const ug = g.uniqueGameID;
    const hands = (tables.hands || []).filter((h) => h.uniqueGameID === ug && (!wantHand || h.handID === wantHand))
      .slice().sort((a, b) => a.handID - b.handID);

    for (const h of hands) {
      const acts = (tables.actions || []).filter((a) => a.uniqueGameID === ug && a.handID === h.handID)
        .slice().sort((a, b) => a.actionID - b.actionID);

      // Game: X | Hand: Y
      s = 'Game: ' + g.gameID + ' | Hand: ' + h.handID;
      if (modus === 1) out += '<table><tr><td width="600" align="center"><hr noshade size="3"><b>' + s + '</b></td><td></td></tr></table>';
      else if (modus === 2) out += '\n\n----------- ' + s + ' -----------\n';
      else out += '----------- <b>' + s + '</b> -----------<br />';

      // BLIND LEVEL
      out += 'BLIND LEVEL: $' + h.sbAmount + ' / $' + h.bbAmount;
      out += modus === 1 ? '</br>' : (modus === 2 ? '\n' : '<br />');

      // Sièges avec tapis.
      for (let i = 1; i <= 10; i++) {
        const cash = h['Seat_' + i + '_Cash'];
        if (cash == null) continue;
        out += 'Seat ' + i + ': ';
        out += html ? '<b>' + nameOf(tables.players, ug, i) + '</b>' : nameOf(tables.players, ug, i);
        out += ' ($' + cash + ')';
        out += modus === 1 ? '</br>' : (modus === 2 ? '\n' : '<br />');
      }

      // BLINDS: sb ($x), bb ($y) [+ dealer].
      const sbA = acts.find((a) => a.beRo === 0 && a.action === 'posts small blind');
      const bbA = acts.find((a) => a.beRo === 0 && a.action === 'posts big blind');
      const dlA = acts.find((a) => a.beRo === 0 && a.action === 'starts as dealer');
      if (sbA || bbA) {
        out += 'BLINDS: ';
        if (sbA) out += nameOf(tables.players, ug, sbA.seat) + ' ($' + sbA.amount + ')';
        if (sbA && bbA) out += ', ';
        if (bbA) out += nameOf(tables.players, ug, bbA.seat) + ' ($' + bbA.amount + ')';
      }
      if (dlA) {
        out += modus === 1 ? '</br>' : (modus === 2 ? '\n' : '<br />');
        out += nameOf(tables.players, ug, dlA.seat) + ' starts as dealer.';
      }
      if (modus === 1) out += '</br>';

      // Streets 0..4 (4 = post-river, sans titre).
      for (let round = 0; round <= 4; round++) {
        if (round <= 3) {
          let rs = ROUND_NAMES[round];
          if (modus === 1) {
            rs = '</br><b>' + rs + '</b>';
            if (round >= 1) rs = '</br>\n' + rs;
          } else if (modus === 2) {
            rs = '\n\n' + rs;
          } else {
            rs = '<br /><b>' + rs + '</b>'; // correctif : <br /> aussi au PREFLOP
            if (round >= 1) rs = '<br />' + rs;
          }
          if (round >= 1) {
            // Cartes du board (skip la street si non atteinte).
            const n = round + 2;
            let ok = true;
            let bs = ' [board cards ';
            for (let i = 0; i < n; i++) {
              const c = (h.board || [])[i];
              if (c == null) { ok = false; break; }
              bs += _card(c, modus);
              if (i < n - 1) bs += ',';
            }
            if (!ok) continue;
            rs += bs + ']';
          }
          out += rs;
        }

        // Actions de la street (hors dealer/blinds).
        const ra = acts.filter((a) => a.beRo === round && a.action !== 'starts as dealer' && a.action !== 'posts small blind' && a.action !== 'posts big blind');
        for (let k = 0; k < ra.length; k++) {
          const a = ra[k];
          // Séparateur (modus 1 : ligne simple après wins/sits out/side pot).
          if (modus === 1) {
            const prev = k > 0 ? ra[k - 1].action : '';
            out += (k > 0 && (prev === 'wins' || prev === 'sits out' || prev === 'wins (side pot)')) ? '\n' : '</br>\n';
          } else if (modus === 2) out += '\n';
          else out += '<br />';

          const nm = nameOf(tables.players, ug, a.seat);
          let as;
          if (a.action === 'wins (side pot)') {
            as = nm + ' wins $' + a.amount + ' (side pot)';
          } else {
            as = nm + ' ' + a.action;
            if (a.amount != null) as += ' $' + a.amount;
          }

          if (a.action === 'wins game') {
            if (modus === 1) as = '</br></br><i><b>' + as + ' ' + g.gameID + '!</i></b></br>';
            else if (modus === 2) as = as + ' ' + g.gameID + '!';
            else as = '<i><b>' + as + ' ' + g.gameID + '!</b></i>';
          }
          if (a.action === 'wins' || a.action === 'wins (side pot)') {
            if (modus === 1) as = '</br><i>' + as + '</i>';
            else if (modus === 3) as = '<i>' + as + '</i>';
          }
          if (NET_ACTIONS.indexOf(a.action) !== -1) {
            if (modus === 1) as = '<i>' + as + '!</i>';
            else if (modus === 3) as = '<i>' + as + '</i>';
          }
          if (a.action === 'sits out') {
            if (modus === 1) as = '</br><i><span style="font-size:smaller;">' + as + '</span></i>';
            else if (modus === 3) as = '<i><span style="font-size:smaller;">' + as + '</span></i>';
          }
          out += as;

          // shows/has : cartes propres [ + main au post-river ].
          if (a.action === 'shows' || a.action === 'has') {
            out += round === 4 ? ' [ ' : ' [';
            out += _card(h['Seat_' + a.seat + '_Card_1'], modus) + ',' + _card(h['Seat_' + a.seat + '_Card_2'], modus) + ']';
            if (round === 4) {
              const ht = h['Seat_' + a.seat + '_Hand_text'];
              if (ht != null) out += ' - ' + (html ? _esc(ht) : ht);
            }
          }

          if (NO_DOT.indexOf(a.action) === -1) out += '.';
        }
      }

      if (modus === 1) out += '\n';
    }
  }
  return out;
}

// ── Sélection des tables d'une session ────────────────────────────────────
function _sessionTables(all, sid) {
  const keep = (r) => r.sessionId === sid;
  const meta = (all.metas || []).find((m) => m.sessionId === sid);
  return {
    session: meta ? meta.session : null,
    games: (all.games || []).filter(keep),
    players: (all.players || []).filter(keep),
    hands: (all.hands || []).filter(keep),
    actions: (all.actions || []).filter(keep),
  };
}

function _fileBase(sess, sid) {
  const s = sess || {};
  const date = (s.date || '').replace(/[^0-9-]/g, '');
  const time = (s.time || '').replace(/:/g, '');
  if (date && time) return 'pokerth-log-' + date + '_' + time;
  return 'pokerth-log-' + (sid || 'export');
}

function _download(name, mime, content) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { try { document.body.removeChild(a); URL.revokeObjectURL(url); } catch (_e) {} }, 100);
}

// ── UI ────────────────────────────────────────────────────────────────────
let _all = null;        // cache des tables (rechargé à l'ouverture)
let _sel = null;        // sessionId sélectionné
let _selGame = 0;       // uniqueGameID filtré (0 = toutes)
let _analyze = false;   // mode analyseur
let _anHand = 0;        // handID courant en analyse

const CSS = `
#jr-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px}
#jr-modal .km-backdrop{background:transparent;backdrop-filter:none;-webkit-backdrop-filter:none}
#jr-modal.jr-float{pointer-events:none}
#jr-modal.jr-float .km-backdrop{display:none}
#jr-modal.jr-float .jr-card{pointer-events:auto;position:fixed;margin:0;max-width:none !important;max-height:none !important}
#jr-modal .jr-card{width:min(880px,96vw);max-height:min(88vh,700px);display:flex;flex-direction:column}
#jr-modal .jr-top{display:flex;align-items:center;gap:8px;margin:2px 0 8px}
#jr-modal .jr-main{display:flex;gap:10px;flex:1;min-height:0;overflow:hidden}
#jr-modal .jr-list{flex:0 0 220px;min-width:140px;overflow:auto;border:1px solid var(--border,#39415066);border-radius:6px;padding:3px}
#jr-modal .jr-item{display:block;width:100%;text-align:left;padding:6px 8px;border:0;background:transparent;color:var(--text,#cdd3e0);font:inherit;font-size:.82rem;border-radius:4px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#jr-modal .jr-item.sel{background:#8b1a1a;color:#fff}
#jr-modal .jr-item .jr-cur{opacity:.75;font-size:.72rem;margin-left:4px}
#jr-modal .jr-right{flex:1;display:flex;flex-direction:column;min-width:0;min-height:0}
#jr-modal .jr-prevlbl{font-size:.82rem;opacity:.8;margin-bottom:4px}
#jr-modal .jr-prev{flex:1;overflow:auto;border:1px solid var(--border,#39415066);border-radius:6px;padding:8px 10px;background:var(--panel-bg,rgba(0,0,0,.14));font-size:.82rem;line-height:1.45;min-height:0}
#jr-modal .jr-prev mark{background:#E3C800;color:#1d222b;border-radius:2px}
#jr-modal .jr-btns{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px;align-items:center}
#jr-modal .jr-spacer{flex:1}
#jr-modal .jr-foot{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px;align-items:center;font-size:.8rem;opacity:.9}
#jr-modal .jr-an-nav{display:flex;gap:6px;align-items:center;margin-bottom:6px;flex-wrap:wrap}
#jr-modal .jr-search{min-width:110px;flex:0 1 170px}
@media (max-width:640px){#jr-modal .jr-main{flex-direction:column}#jr-modal .jr-list{flex:0 0 auto;width:auto;max-height:26vh}#jr-modal .jr-card{max-height:none;height:100%}}
`;

function _ensureModal() {
  let m = document.getElementById('jr-modal');
  if (m) return m;
  const st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);
  m = document.createElement('div');
  m.id = 'jr-modal';
  m.style.display = 'none';
  m.innerHTML =
    '<div class="km-backdrop"></div>' +
    '<div class="km-card jr-card" role="dialog" aria-labelledby="jr-title">' +
      '<button class="km-close" type="button" id="jr-close" aria-label="Close">\u2715</button>' +
      '<div class="km-title" id="jr-title"></div>' +
      '<div class="jr-top">' +
        '<span id="jr-game-lbl"></span>' +
        '<div class="sel-wrap adv-sel"><select id="jr-game"></select><span class="sel-arr">\u25be</span></div>' +
        '<span class="jr-spacer"></span>' +
        '<input type="search" id="jr-search" class="jr-search" autocomplete="off">' +
      '</div>' +
      '<div class="jr-main">' +
        '<div class="jr-list" id="jr-list"></div>' +
        '<div class="jr-right">' +
          '<div class="jr-an-nav" id="jr-an-nav" style="display:none">' +
            '<button type="button" class="btn-sm" id="jr-an-prev">\u2039</button>' +
            '<div class="sel-wrap adv-sel"><select id="jr-an-hand"></select><span class="sel-arr">\u25be</span></div>' +
            '<button type="button" class="btn-sm" id="jr-an-next">\u203a</button>' +
            '<button type="button" class="btn-sm" id="jr-an-back"></button>' +
          '</div>' +
          '<div class="jr-prevlbl" id="jr-prevlbl"></div>' +
          '<div class="jr-prev" id="jr-prev"></div>' +
        '</div>' +
      '</div>' +
      '<div class="jr-btns">' +
        '<button type="button" class="btn-sm" id="jr-exp-html"></button>' +
        '<button type="button" class="btn-sm" id="jr-exp-txt"></button>' +
        '<button type="button" class="btn-sm" id="jr-saveas"></button>' +
        '<button type="button" class="btn-sm" id="jr-del"></button>' +
        '<span class="jr-spacer"></span>' +
        '<button type="button" class="btn-sm" id="jr-analyze"></button>' +
      '</div>' +
      '<div class="jr-foot">' +
        '<span id="jr-keep-lbl"></span>' +
        '<div class="sel-wrap adv-sel"><select id="jr-keep">' +
          '<option value="0"></option><option value="7"></option><option value="30"></option><option value="90"></option>' +
        '</select><span class="sel-arr">\u25be</span></div>' +
        '<em class="adv-webtag">web</em>' +
        '<span class="jr-spacer"></span>' +
        '<button type="button" class="btn-sm" id="jr-delall"></button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(m);

  const $ = (id) => document.getElementById(id);
  m.querySelector('.km-backdrop').addEventListener('click', closeJournal);
  $('jr-close').addEventListener('click', closeJournal);
  $('jr-game').addEventListener('change', () => { _selGame = parseInt($('jr-game').value, 10) || 0; _anHand = 0; _renderRight(); });
  $('jr-search').addEventListener('input', _applySearch);
  $('jr-exp-html').addEventListener('click', () => _export(1));
  $('jr-exp-txt').addEventListener('click', () => _export(2));
  $('jr-saveas').addEventListener('click', _saveAsPdb);
  $('jr-del').addEventListener('click', _delSelected);
  $('jr-delall').addEventListener('click', _delAll);
  $('jr-analyze').addEventListener('click', () => { _analyze = !_analyze; _anHand = 0; _renderRight(); });
  $('jr-an-back').addEventListener('click', () => { _analyze = false; _renderRight(); });
  $('jr-an-hand').addEventListener('change', () => { _anHand = parseInt($('jr-an-hand').value, 10) || 0; _renderRight(); });
  $('jr-an-prev').addEventListener('click', () => _stepHand(-1));
  $('jr-an-next').addEventListener('click', () => _stepHand(1));
  $('jr-keep').addEventListener('change', () => {
    try { localStorage.setItem('pth_log_keep_days', $('jr-keep').value); } catch (_e) {}
    purgeOldSessions().then(() => _reload());
  });
  return m;
}

function _applyTexts() {
  const $ = (id) => document.getElementById(id);
  $('jr-title').textContent = T('jrTitle', 'Logs');
  $('jr-game-lbl').textContent = T('jrGame', 'Game:');
  $('jr-search').placeholder = T('jrSearch', 'Search\u2026');
  $('jr-prevlbl').textContent = T('jrPreview', 'Preview:');
  $('jr-exp-html').textContent = T('jrExportHtml', 'Export as HTML');
  $('jr-exp-txt').textContent = T('jrExportTxt', 'Export as txt');
  $('jr-saveas').textContent = T('jrSaveAs', 'Save as\u2026');
  $('jr-del').textContent = T('jrDelete', 'Delete');
  $('jr-delall').textContent = T('jrDeleteAll', 'Delete all');
  $('jr-analyze').textContent = T('jrAnalyze', 'Analyse log file\u2026');
  $('jr-an-back').textContent = T('jrBack', 'Back to preview');
  $('jr-keep-lbl').textContent = T('jrRetention', 'Keep logs');
  const ko = $('jr-keep').options;
  ko[0].textContent = T('jrKeepForever', 'Forever');
  for (let i = 1; i < ko.length; i++) ko[i].textContent = T('jrKeepDays', '{n} days').replace('{n}', ko[i].value);
  $('jr-keep').value = String(_keepDays());
}

function _sessions() {
  return (_all && _all.metas ? _all.metas.slice() : [])
    .filter((m) => m.sessionId)
    .sort((a, b) => (a.sessionId < b.sessionId ? 1 : -1));
}

function _renderList() {
  const list = document.getElementById('jr-list');
  const cur = (typeof window !== 'undefined' && window._handlog) ? window._handlog.sessionId : null;
  const ss = _sessions();
  list.innerHTML = '';
  if (!ss.length) {
    const d = document.createElement('div');
    d.style.cssText = 'padding:8px;font-size:.8rem;opacity:.75';
    d.textContent = T('jrEmpty', 'No logs yet. Play a hand and the session will appear here.');
    list.appendChild(d);
    return;
  }
  if (!_sel || !ss.some((m) => m.sessionId === _sel)) _sel = ss[0].sessionId;
  ss.forEach((m) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'jr-item' + (m.sessionId === _sel ? ' sel' : '');
    b.textContent = _fileBase(m.session, m.sessionId);
    if (m.sessionId === cur) {
      const em = document.createElement('span');
      em.className = 'jr-cur';
      em.textContent = '\u2022 ' + T('jrCurrent', 'current');
      b.appendChild(em);
    }
    b.addEventListener('click', () => { _sel = m.sessionId; _selGame = 0; _anHand = 0; _renderList(); _renderGames(); _renderRight(); });
    list.appendChild(b);
  });
}

function _renderGames() {
  const sel = document.getElementById('jr-game');
  sel.innerHTML = '';
  const oAll = document.createElement('option');
  oAll.value = '0';
  oAll.textContent = T('jrAllGames', 'All games');
  sel.appendChild(oAll);
  if (!_sel) return;
  const tb = _sessionTables(_all, _sel);
  tb.games.slice().sort((a, b) => a.uniqueGameID - b.uniqueGameID).forEach((g) => {
    const o = document.createElement('option');
    o.value = String(g.uniqueGameID);
    o.textContent = T('jrGameN', 'Game {n}').replace('{n}', String(g.gameID));
    sel.appendChild(o);
  });
  sel.value = String(_selGame);
}

function _handsOfScope(tb) {
  return tb.hands.filter((h) => !_selGame || h.uniqueGameID === _selGame)
    .slice().sort((a, b) => (a.uniqueGameID - b.uniqueGameID) || (a.handID - b.handID));
}

function _renderRight() {
  const $ = (id) => document.getElementById(id);
  const prev = $('jr-prev');
  const nav = $('jr-an-nav');
  if (!_sel) { prev.innerHTML = ''; nav.style.display = 'none'; return; }
  const tb = _sessionTables(_all, _sel);

  if (_analyze) {
    nav.style.display = '';
    $('jr-prevlbl').textContent = T('jrAnalyzeLbl', 'Hand log:');
    const hands = _handsOfScope(tb);
    const hs = $('jr-an-hand');
    hs.innerHTML = '';
    hands.forEach((h) => {
      const g = tb.games.find((x) => x.uniqueGameID === h.uniqueGameID);
      const o = document.createElement('option');
      o.value = String(h.handID);
      o.dataset.ug = String(h.uniqueGameID);
      o.textContent = T('jrGameN', 'Game {n}').replace('{n}', String(g ? g.gameID : h.uniqueGameID)) + ' \u00b7 ' + T('jrHand', 'Hand') + ' ' + h.handID;
      hs.appendChild(o);
    });
    if (!hands.length) { prev.innerHTML = ''; return; }
    let idx = hands.findIndex((h) => h.handID === _anHand && (!_selGame || h.uniqueGameID === _selGame));
    if (idx < 0) idx = 0;
    const h = hands[idx];
    _anHand = h.handID;
    hs.selectedIndex = idx;
    prev.innerHTML = renderLog(tb, { modus: 3, uniqueGameID: h.uniqueGameID, handID: h.handID });
  } else {
    nav.style.display = 'none';
    $('jr-prevlbl').textContent = T('jrPreview', 'Preview:');
    prev.innerHTML = renderLog(tb, { modus: 3, uniqueGameID: _selGame });
  }
  _applySearch();
}

function _stepHand(dir) {
  if (!_sel) return;
  const tb = _sessionTables(_all, _sel);
  const hands = _handsOfScope(tb);
  if (!hands.length) return;
  let idx = hands.findIndex((h) => h.handID === _anHand);
  if (idx < 0) idx = 0;
  idx = Math.min(hands.length - 1, Math.max(0, idx + dir));
  _anHand = hands[idx].handID;
  _renderRight();
}

// Surlignage <mark> de la recherche (texte uniquement, DOM déjà rendu).
function _applySearch() {
  const q = (document.getElementById('jr-search').value || '').trim().toLowerCase();
  const prev = document.getElementById('jr-prev');
  prev.querySelectorAll('mark').forEach((mk) => {
    const p = mk.parentNode;
    p.replaceChild(document.createTextNode(mk.textContent), mk);
    p.normalize();
  });
  if (!q) return;
  const walker = document.createTreeWalker(prev, NodeFilter.SHOW_TEXT);
  const targets = [];
  let n;
  while ((n = walker.nextNode())) if (n.nodeValue.toLowerCase().indexOf(q) !== -1) targets.push(n);
  targets.forEach((node) => {
    const frag = document.createDocumentFragment();
    let txt = node.nodeValue;
    let i;
    while ((i = txt.toLowerCase().indexOf(q)) !== -1) {
      frag.appendChild(document.createTextNode(txt.slice(0, i)));
      const mk = document.createElement('mark');
      mk.textContent = txt.slice(i, i + q.length);
      frag.appendChild(mk);
      txt = txt.slice(i + q.length);
    }
    frag.appendChild(document.createTextNode(txt));
    node.parentNode.replaceChild(frag, node);
  });
}

function _export(modus) {
  if (!_sel) return;
  const tb = _sessionTables(_all, _sel);
  const base = _fileBase(tb.session, _sel);
  const body = renderLog(tb, { modus, uniqueGameID: _selGame });
  if (modus === 2) {
    _download(base + '.txt', 'text/plain;charset=utf-8', body);
  } else {
    const doc = '<html><head><meta charset="utf-8"><title>' + base + '</title></head><body>\n' + body + '\n</body></html>';
    _download(base + '.html', 'text/html;charset=utf-8', doc);
  }
}

// « Enregistrer sous… » = le .pdb de la session (comme le client officiel),
// nom libre. Réutilise buildPdb exposé par handlog.mjs.
async function _saveAsPdb() {
  if (!_sel) return;
  if (typeof window._buildPdb !== 'function') { alert(T('jrNoSql', 'PDB export unavailable (sql.js not loaded)')); return; }
  const tb = _sessionTables(_all, _sel);
  const base = _fileBase(tb.session, _sel);
  let name = prompt(T('jrSaveAsPrompt', 'File name'), base + '.pdb');
  if (!name) return;
  if (!/\.pdb$/i.test(name)) name += '.pdb';
  try {
    const bytes = await window._buildPdb(tb);
    _download(name, 'application/x-sqlite3', new Blob([bytes]));
  } catch (_e) {
    alert(T('jrNoSql', 'PDB export unavailable (sql.js not loaded)'));
  }
}

async function _delSelected() {
  if (!_sel) return;
  if (!confirm(T('jrConfirmDelete', 'Delete this log?'))) return;
  await _deleteSession(_sel);
  _sel = null;
  await _reload();
}

async function _delAll() {
  if (!confirm(T('jrConfirmDeleteAll', 'Delete ALL logs?'))) return;
  await _deleteAll();
  _sel = null;
  await _reload();
}

async function _reload() {
  try { _all = await _loadAll(); } catch (_e) { _all = { metas: [], games: [], players: [], hands: [], actions: [] }; }
  _renderList();
  _renderGames();
  _renderRight();
}

export async function openJournal() {
  const m = _ensureModal();
  _analyze = false;
  _selGame = 0;
  _anHand = 0;
  _applyTexts();
  await purgeOldSessions();
  await _reload();
  m.style.display = '';
  _syncFloat(m);
}

// Fenêtre flottante (desktop) : déplaçable par le titre, redimensionnable,
// contenu zoomé avec la taille — via le système générique de pokerth.js
// (_enableFloating / _disableFloating, comme chat, log et options avancées).
// Sur mobile / petit écran on garde le modal centré.
function _syncFloat(m) {
  const card = m.querySelector('.jr-card');
  if (!card) return;
  let wide = false;
  try { wide = window.matchMedia('(min-width:900px) and (min-height:600px)').matches; } catch (_e) {}
  const canFloat = wide && typeof window._enableFloating === 'function';
  if (canFloat) {
    m.classList.add('jr-float');
    const defW = Math.min(860, window.innerWidth - 40);
    const defH = Math.min(600, window.innerHeight - 60);
    window._enableFloating(card, {
      key: 'pth_win_jr',
      handle: document.getElementById('jr-title'),
      resizable: true,
      zoom: true,
      defW, defH,
      minW: 430, minH: 340,
      defLeft: Math.max(8, Math.round((window.innerWidth - defW) / 2)),
      defTop: Math.max(8, Math.round((window.innerHeight - defH) / 2)),
    });
  } else {
    m.classList.remove('jr-float');
    if (typeof window._disableFloating === 'function') window._disableFloating(card);
  }
}

export function closeJournal() {
  const m = document.getElementById('jr-modal');
  if (m) m.style.display = 'none';
}

if (typeof window !== 'undefined') {
  window._openJournal = openJournal;
  window._closeJournal = closeJournal;
  // Purge de rétention en tâche de fond au chargement.
  setTimeout(() => { purgeOldSessions(); }, 4000);
}
