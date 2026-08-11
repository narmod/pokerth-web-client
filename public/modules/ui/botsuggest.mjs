// ═══════════════════════════════════════════════════════════════════
// Community suggest — port of the QML singleton Config.BotSuggest
// (src/gui/qt6-qml/config/BotSuggest.qml, PokerTH 2.1.5), itself a port
// of the legacy bbcbot.
//
// The creator of a BBC Step or WEC invite game can propose eligible idle
// players. The resulting line is shown LOCALLY to whoever asked and is
// never sent anywhere — the bot used to answer the requester by private
// message, and this keeps that.
//
// Scoring and selection are kept identical to bbcbotplayerdb so a web
// suggestion matches a QML one player for player. The three botfiles
// come through our own /api/botfile relay: bbc.pokerth.net sets no CORS
// header, and the User-Agent its Cloudflare filter expects cannot be set
// from JS (see the relay in proxy.js).
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';

const BASE = '/api/botfile?f=';
const CACHE_TTL_MS = 15 * 60 * 1000;      // = cacheTtlMs du singleton QML

const KINDS = ['minidb', 'weclist', 'gameslist'];
const _cache = { minidb: { data: null, ts: 0 }, weclist: { data: null, ts: 0 }, gameslist: { data: null, ts: 0 } };
const _queues = { minidb: [], weclist: [], gameslist: [] };
const _inflight = { minidb: false, weclist: false, gameslist: false };

// Type de suggestion du spiel qu'on vient de créer. Comme en QML depuis
// 2.1.5, il vient EXPLICITEMENT du preset et jamais du nom de table :
// deviner sur le nom était fragile (casse, préfixe modifié → « WEC » n'était
// plus reconnu). Valeurs : 'step1'..'step4', 'wec', ou '' (pas de suggestion).
let createdSuggestType = '';
function setCreatedSuggestType(t) { createdSuggestType = String(t || ''); }
function getCreatedSuggestType() { return createdSuggestType; }
function isSuggestType(t) { return t === 'wec' || /^step[1-4]$/.test(t || ''); }

// ── Chargement + cache ────────────────────────────────────────────────
function _ensure(kind, done) {
  const c = _cache[kind];
  if (c.data !== null && (Date.now() - c.ts) < CACHE_TTL_MS) { done(true); return; }
  _queues[kind].push(done);
  if (_inflight[kind]) return;
  _inflight[kind] = true;

  fetch(BASE + kind, { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status)); })
    .then(function (txt) {
      if (!txt) throw new Error('empty');
      _cache[kind] = { data: _parse(kind, txt), ts: Date.now() };
      return true;
    })
    .catch(function (e) {
      try { console.warn('BotSuggest: fetch/parse failed for', kind, e); } catch (_e) {}
      // Repli sur des données périmées plutôt que rien, comme QML.
      return _cache[kind].data !== null;
    })
    .then(function (ok) {
      _inflight[kind] = false;
      const q = _queues[kind]; _queues[kind] = [];
      for (let i = 0; i < q.length; i++) { try { q[i](!!ok); } catch (_e) {} }
    });
}

function _parse(kind, text) {
  if (kind === 'weclist') return _parseWec(text);
  if (kind === 'gameslist') return _parseGameslist(text);
  return _parseDb(text);
}

// gameslist.txt : lignes « #commande#groupe#Titre# » (au moins 4 '#').
// Commentaires « // » et lignes trop courtes ignorés, comme le bbcbot.
function _parseGameslist(text) {
  const map = {};
  const lines = String(text).split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.length || line.indexOf('//') === 0) continue;
    const parts = line.split('#');
    if (parts.length < 5) continue;
    const cmd = parts[1].trim(), title = parts[3].trim();
    if (!cmd.length || !title.length) continue;
    map[cmd] = title;
  }
  return map;
}

// weclist.txt : un pseudo par ligne → { minuscule: nom d'origine }.
function _parseWec(text) {
  const set = {};
  const lines = String(text).split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const name = lines[i].trim();
    if (!name.length) continue;
    set[name.toLowerCase()] = name;
  }
  return set;
}

// minidb.txt : Nom<TAB>ts2<TAB>ts3<TAB>ts4<TAB>rating<TAB>games.
// Le nom n'est PAS trimmé (des pseudos portent des caractères de bordure,
// « * ghoti * ») ; seules les lignes de rating > 0 comptent, comme le bot.
function _parseDb(text) {
  const map = {};
  const lines = String(text).split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.length) continue;
    const f = line.split('\t');
    if (f.length < 6) continue;
    const rating = parseInt(f[4], 10);
    if (!(rating > 0)) continue;
    map[f[0].toLowerCase()] = {
      name: f[0],
      ts2: parseInt(f[1], 10) || 0,
      ts3: parseInt(f[2], 10) || 0,
      ts4: parseInt(f[3], 10) || 0,
      rating: rating,
      games: parseInt(f[5], 10) || 0
    };
  }
  return map;
}

// ── Notation / sélection (identique à bbcbotplayerdb) ─────────────────
function _score2(rating, tickets, games) {
  if (tickets <= 0) return 0;
  return (tickets << 11) + (games << 4) + rating;
}

function _asCandidates(names) {
  const out = [];
  for (let i = 0; i < names.length; i++) out.push({ name: names[i] });
  return out;
}

function _scoreStep(candidates, step) {
  const db = _cache.minidb.data || {};
  const out = [];
  for (let i = 0; i < candidates.length; i++) {
    const e = db[(candidates[i].name || '').toLowerCase()];
    if (!e) continue;
    const tickets = step === 1 ? 1 : (step === 2 ? e.ts2 : (step === 3 ? e.ts3 : e.ts4));
    const s = _score2(e.rating, tickets, e.games);
    if (s <= 10) continue;
    out.push({ dbName: e.name, score: s, game: candidates[i].game });
  }
  out.sort(function (a, b) { return b.score - a.score; });
  return out;
}

function _scoreWec(candidates) {
  const set = _cache.weclist.data || {};
  const out = [];
  for (let i = 0; i < candidates.length; i++) {
    const orig = set[(candidates[i].name || '').toLowerCase()];
    if (orig === undefined) continue;
    // Ordre aléatoire, comme le bot : le RNG du jeu n'est pas concerné.
    out.push({ dbName: orig, score: Math.random(), game: candidates[i].game });
  }
  out.sort(function (a, b) { return b.score - a.score; });
  return out;
}

// Joueurs libres d'abord, puis — en dernier — ceux déjà attablés ailleurs,
// annotés de leur table. Les deux groupes plafonnés à `limit`.
function _buildMessage(headline, idleScored, busyScored, limit, emptyText) {
  if (!idleScored.length && !busyScored.length) return emptyText;
  const parts = [];
  for (let i = 0; i < idleScored.length && i < limit; i++) parts.push(idleScored[i].dbName);
  for (let j = 0; j < busyScored.length && j < limit; j++)
    parts.push(busyScored[j].dbName + ' (playing in game ' + busyScored[j].game + ')');
  return headline + parts.join(', ');
}

function _suggestStep(step, idleNames, playingPlayers) {
  // Parite QML/widget (commit upstream 1c29025 du 11/08/2026) : au step 1
  // le ticket vaut 1 → quasi tout joueur de la base se qualifie ; ne pas
  // proposer en plus les joueurs « playing », sinon la liste devient trop
  // longue. Ils reapparaissent a partir du step 2.
  const busy = step === 1 ? [] : _scoreStep(playingPlayers, step);
  return _buildMessage(
    'I suggest the following players for step ' + step + ': ',
    _scoreStep(_asCandidates(idleNames), step),
    busy,
    12,
    'Sorry, no player found to suggest');
}

function _suggestWec(idleNames, playingPlayers) {
  return _buildMessage(
    'I suggest the following players for wec: ',
    _scoreWec(_asCandidates(idleNames)),
    _scoreWec(playingPlayers),
    10,
    'Sorry, no wec player found to suggest');
}

// onResult(success, message) — message affiché localement si success.
function suggestForType(type, idleNames, playingPlayers, onResult) {
  const m = /^step([1-4])$/.exec(type || '');
  if (m) {
    const step = parseInt(m[1], 10);
    _ensure('minidb', function (ok) { onResult(ok, ok ? _suggestStep(step, idleNames, playingPlayers) : ''); });
    return;
  }
  if (type === 'wec') {
    _ensure('weclist', function (ok) { onResult(ok, ok ? _suggestWec(idleNames, playingPlayers) : ''); });
    return;
  }
  onResult(false, '');
}

// Titre courant d'une table communautaire à nom mensuel (Monthly Cup).
function gameTitlePrefix(command, onResult) {
  _ensure('gameslist', function (ok) {
    const map = ok ? _cache.gameslist.data : null;
    onResult((map && map[command]) ? map[command] : '');
  });
}

// ── Candidats, depuis l'état du lobby ─────────────────────────────────
// Équivalents de LobbyHandler::idlePlayerNames() / playingPlayerEntries().
// S.games[gid].seats est tenu à jour pour TOUTES les tables du lobby (le
// filtre _openTables ne conditionne que la demande des noms), donc on sait
// pour chaque joueur s'il est assis quelque part — comme getGameIdOfPlayer().
const _PLACEHOLDER = /^#?\d+$/;

function _gameIdOfPlayer(pid) {
  const g = S.games || {};
  for (const k in g) {
    const seats = g[k] && g[k].seats;
    if (seats && seats.indexOf(pid) !== -1) return parseInt(k, 10);
  }
  return 0;
}

function _nameOf(pid) {
  const n = (S.players && S.players[pid]) ? String(S.players[pid]) : '';
  return (!n || _PLACEHOLDER.test(n)) ? '' : n;
}

// Invités exclus : ils ne sont ni dans la base BBC ni sur la liste WEC.
function _isGuest(pid) { return ((S._playerRights && S._playerRights[pid]) || 0) === 1; }

function idlePlayerNames() {
  const out = [];
  if (!S._lobbyPids) return out;
  S._lobbyPids.forEach(function (pid) {
    if (!pid || _isGuest(pid)) return;
    if (_gameIdOfPlayer(pid) !== 0) return;
    const n = _nameOf(pid);
    if (n && out.indexOf(n) === -1) out.push(n);
  });
  return out;
}

function playingPlayerEntries() {
  const out = [];
  if (!S._lobbyPids) return out;
  const own = S.gId || 0;
  S._lobbyPids.forEach(function (pid) {
    if (!pid || _isGuest(pid)) return;
    const gid = _gameIdOfPlayer(pid);
    if (!gid) return;
    if (own && gid === own) return;          // déjà à ma table
    const n = _nameOf(pid);
    if (!n) return;
    out.push({ name: n, game: (S.games[gid] && S.games[gid].name) || ('#' + gid) });
  });
  return out;
}

// ── Action du bouton ──────────────────────────────────────────────────
let _busy = false;
function suggestPlayers() {
  if (_busy) return;
  const type = createdSuggestType;
  if (!isSuggestType(type)) return;
  _busy = true;
  try { const b = document.getElementById('l-suggest-btn'); if (b) b.style.opacity = '0.5'; } catch (e) {}
  suggestForType(type, idlePlayerNames(), playingPlayerEntries(), function (ok, message) {
    _busy = false;
    try { const b = document.getElementById('l-suggest-btn'); if (b) b.style.opacity = ''; } catch (e) {}
    // Affichage LOCAL uniquement, jamais envoyé — comme postLocalChatNote().
    if (ok && message && typeof window.addChat === 'function') window.addChat(null, message, 'sys');
  });
}

// Visibilité : les cinq conditions de GameWaitPage.canSuggest — contenus
// communautaires, option activée, admin de la partie, type « sur invitation »
// (3), et un preset porteur d'un type de suggestion.
function syncSuggestBtn() {
  const b = document.getElementById('l-suggest-btn');
  if (!b) return;
  let on = false;
  try {
    const adv = window._advGet || function (k, d) { return d; };
    const g = (S.games && S.gId) ? S.games[S.gId] : null;
    on = !!(adv('community_content', true) && adv('community_suggest', false)
            && S.amGameAdmin && g && g.type === 3 && isSuggestType(createdSuggestType));
  } catch (e) { on = false; }
  b.style.display = on ? '' : 'none';
}

export { suggestPlayers, syncSuggestBtn, suggestForType, gameTitlePrefix,
         isSuggestType, setCreatedSuggestType, getCreatedSuggestType,
         idlePlayerNames, playingPlayerEntries };

window._suggestPlayers = suggestPlayers;
window._syncSuggestBtn = syncSuggestBtn;
window._botSuggest = { suggestForType, gameTitlePrefix, isSuggestType,
                       setCreatedSuggestType, getCreatedSuggestType,
                       idlePlayerNames, playingPlayerEntries };
