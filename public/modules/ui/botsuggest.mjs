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

const KINDS = ['minidb', 'weclist', 'gameslist', 'bbcadmins', 'wecadmins'];
const _cache = { minidb: { data: null, ts: 0 }, weclist: { data: null, ts: 0 },
                 gameslist: { data: null, ts: 0 }, bbcadmins: { data: null, ts: 0 },
                 wecadmins: { data: null, ts: 0 } };
const _queues = { minidb: [], weclist: [], gameslist: [], bbcadmins: [], wecadmins: [] };
const _inflight = { minidb: false, weclist: false, gameslist: false, bbcadmins: false,
                    wecadmins: false };

// Type de suggestion du spiel qu'on vient de créer. Comme en QML depuis
// 2.1.5, il vient EXPLICITEMENT du preset et jamais du nom de table :
// deviner sur le nom était fragile (casse, préfixe modifié → « WEC » n'était
// plus reconnu). Valeurs : 'step1'..'step4', 'wec', ou '' (pas de suggestion).
let createdSuggestType = '';
function setCreatedSuggestType(t) { createdSuggestType = String(t || ''); }
function getCreatedSuggestType() { return createdSuggestType; }
function isSuggestType(t) { return t === 'wec' || /^step[1-4]$/.test(t || ''); }

// ── Modeles communautaires ────────────────────────────────────────────
// La table vit ICI et non plus dans le formulaire de creation, parce qu'elle
// a deux emplois : remplir les champs a la creation ET servir d'empreinte
// pour reconnaitre le type d'un tapis qu'on n'a pas cree (voir
// suggestTypeForGame). Les deux doivent lire la meme source, sinon elles
// divergent au premier ajout de vorlage. Parite amont 422f5fe4, qui a fait
// le meme deplacement vers Config.BotSuggest.
// App._communityVorlagen (pokerth.js) n'est plus qu'une lecture de PRESETS.
const PRESETS = [
  { name: 'BBC Step 1', suggestType: 'step1', startCash: 3000, firstSmallBlind: 15,
    raiseOnHands: false, raiseEveryHands: 11, raiseEveryMinutes: 5, playerActionTimeout: 10,
    blinds: [20, 25, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500,
             600, 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000,
             10000, 12000, 15000] },
  { name: 'BBC Step 2', suggestType: 'step2', startCash: 4000, firstSmallBlind: 20,
    raiseOnHands: false, raiseEveryHands: 11, raiseEveryMinutes: 5, playerActionTimeout: 10,
    blinds: [25, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 600,
             800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000,
             12000, 15000, 20000] },
  { name: 'BBC Step 3', suggestType: 'step3', startCash: 5000, firstSmallBlind: 25,
    raiseOnHands: false, raiseEveryHands: 11, raiseEveryMinutes: 5, playerActionTimeout: 10,
    blinds: [30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 600, 800,
             1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000,
             12000, 15000, 20000, 25000] },
  { name: 'BBC Step 4', suggestType: 'step4', startCash: 10000, firstSmallBlind: 50,
    raiseOnHands: false, raiseEveryHands: 11, raiseEveryMinutes: 5, playerActionTimeout: 10,
    blinds: [60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1200,
             1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000, 12000, 15000,
             20000, 25000, 30000, 40000, 50000] },
  { name: 'Monthly Cup', titleCommand: 'mcup', startCash: 10000, firstSmallBlind: 50,
    raiseOnHands: true, raiseEveryHands: 16, raiseEveryMinutes: 5, playerActionTimeout: 10,
    blinds: [] },
  { name: 'Monthly Cup Final', titleCommand: 'mcupfinal', startCash: 10000, firstSmallBlind: 50,
    raiseOnHands: true, raiseEveryHands: 22, raiseEveryMinutes: 5, playerActionTimeout: 12,
    blinds: [] },
  { name: 'WEC', suggestType: 'wec', startCash: 10000, firstSmallBlind: 50,
    raiseOnHands: true, raiseEveryHands: 22, raiseEveryMinutes: 5, playerActionTimeout: 12,
    blinds: [] },
  // Ajouté par sp0ck dans le QML 2.1.4. Réglages officiels des finales
  // mensuelles WeC (fil « WEC Monthly and Yearly Grand Finals », encore en
  // vigueur pour les finales 2026) : 10 000 / SB 50 / action 15 s /
  // doublement toutes les 25 mains. Le délai entre les mains (7 s) est posé
  // pour toutes les vorlagen par applyVorlage().
  { name: 'WEC Monthly Final', startCash: 10000, firstSmallBlind: 50,
    raiseOnHands: true, raiseEveryHands: 25, raiseEveryMinutes: 5, playerActionTimeout: 15,
    blinds: [] },
  { name: 'WEC Grand Final', suggestType: 'wec', startCash: 10000, firstSmallBlind: 50,
    raiseOnHands: true, raiseEveryHands: 35, raiseEveryMinutes: 5, playerActionTimeout: 25,
    blinds: [] }
];

// ── Reconnaissance du type d'un tapis etranger ────────────────────────
// Un joueur qui rejoint ne connait pas createdSuggestType : il ne vit que
// dans le client du createur et le protocole ne transporte aucun type de
// vorlage. Le nom de table ne vaut PAS comme source — il est librement
// editable. On compare donc les reglages reels : capital de depart + premiere
// petite blind + la suite manuelle complete identifient un BBC Step sans
// ambiguite.
//
// Les vorlagen SANS liste fixe (Monthly Cup, WEC) sont volontairement
// ignorees : « blinds doublees » en 10000/50 n'est pas une signature, ca
// matcherait n'importe quel tapis etranger. Pour celles-la, seul le
// createdSuggestType explicite du createur ouvre le bouton.
//
// g : une entree de S.games (champs startMoney, smallBlind, manualBlinds).
// Retour : 'step1'..'step4' ou '' (non reconnu).
function suggestTypeForGame(g) {
  if (!g) return '';
  const blinds = g.manualBlinds || [];
  for (let i = 0; i < PRESETS.length; i++) {
    const p = PRESETS[i];
    if (!p.suggestType) continue;
    if (p.startCash !== g.startMoney || p.firstSmallBlind !== g.smallBlind) continue;
    const pb = p.blinds || [];
    if (pb.length !== blinds.length) continue;
    if (pb.length > 0) {
      let same = true;
      for (let b = 0; b < pb.length; b++) {
        if (pb[b] !== blinds[b]) { same = false; break; }
      }
      if (!same) continue;
    } else {
      // Vorlagen a blinds doublees (WEC) : pas de liste comme empreinte, et
      // capital + petite blind seuls ne signent rien (10000/50 matcherait des
      // tables quelconques). S'y ajoutent donc l'intervalle de hausse (mode +
      // valeur) et le timeout d'action — avec le filtre invitation de
      // l'appelant, c'est assez etroit (parite amont 576b598).
      // Imprecision connue et assumee en amont : « Monthly Cup Final » a
      // exactement les reglages de « WEC » (10000/50, /22 mains, 12 s) — un
      // admin WEC voit donc aussi le bouton a une table MC Final. Le
      // vorschlag ne s'affiche que localement chez qui clique. Le nom de
      // table reste exclu comme critere : librement editable.
      // g.raiseMode : 1 = mains, 2 = minutes (RAISE_ON_HANDNUMBER /
      // RAISE_ON_MINUTES, gamedata.h) — champs poses par onGameListNew.
      if (p.raiseOnHands !== (g.raiseMode === 1)) continue;
      if (p.raiseOnHands ? (p.raiseEveryHands !== g.raiseHands)
                         : (p.raiseEveryMinutes !== g.raiseMins)) continue;
      if (p.playerActionTimeout !== g.timeout) continue;
    }
    return p.suggestType;
  }
  return '';
}

// ── Verification « admin communautaire » ──────────────────────────────
// Une liste d'admins par communaute, au format de weclist.txt : bbcadmins.txt
// pour les BBC Steps, wecadmins.txt pour les tables WEC (parite amont
// 576b598). Elle dit qui a le droit de proposer des joueurs sur une table de
// SA communaute qu'il n'a pas creee. A n'appeler QUE si l'empreinte locale
// livre deja un type : ailleurs, la fonction ne coute pas une seule requete.
// onResult(isAdmin) : false aussi quand le fichier n'est pas (encore)
// joignable — le bouton reste alors cache, comme sans la fonction.
// Horodatage du dernier essai (meme rate) par liste d'admins.
const _adminLastTry = { bbcadmins: 0, wecadmins: 0 };

// Type de suggestion -> liste d'admins competente ('' = aucune, donc pas de
// suggestion sur table etrangere pour ce type).
function _adminKind(type) {
  if (/^step[1-4]$/.test(type || '')) return 'bbcadmins';
  if (type === 'wec') return 'wecadmins';
  return '';
}

function isCommunityAdmin(type, nick, onResult) {
  const kind = _adminKind(type);
  if (!kind || !nick) { onResult(false); return; }
  // Brider aussi les ECHECS : la reponse commande la visibilite du bouton, qui
  // est re-evaluee a chaque changement de la liste des joueurs. Sans ce garde-
  // fou, un fichier absent declencherait un telechargement par join/leave. Un
  // cache encore frais repond de toute facon sans reseau (_ensure).
  const c = _cache[kind];
  const fresh = c.data !== null && (Date.now() - c.ts) < CACHE_TTL_MS;
  if (!fresh && (Date.now() - _adminLastTry[kind]) < CACHE_TTL_MS) { onResult(false); return; }
  if (!fresh) _adminLastTry[kind] = Date.now();
  _ensure(kind, function (ok) {
    const set = ok ? _cache[kind].data : null;
    onResult(!!(set && set[String(nick).toLowerCase()] !== undefined));
  });
}

// Compat : l'ancienne entree BBC seule, conservee pour les appels existants.
function isBbcAdmin(nick, onResult) { isCommunityAdmin('step1', nick, onResult); }

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
  if (kind === 'weclist' || kind === 'bbcadmins' || kind === 'wecadmins') return _parseNameList(text);
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

// weclist.txt / bbcadmins.txt : un pseudo par ligne → { minuscule: nom
// d'origine }. Les deux botfiles partagent ce format.
function _parseNameList(text) {
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

// Précharge gameslist.txt (parité upstream 0640366) : sans ça, le fichier
// n'est tiré qu'au choix d'une vorlage Monthly Cup — le titre arrive alors en
// asynchrone, et un clic rapide sur « Créer la partie » envoie le nom de repli
// (« Monthly Cup Final » au lieu d'« August Cup Final »). Appelé à l'ouverture
// de la page de création ; le fichier fait ~1 ko.
function prefetchGameTitles() {
  _ensure('gameslist', function () {});
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

// ── Qui a le droit de proposer ────────────────────────────────────────
// Deux publics, dans une partie « sur invitation » (type 3) et seulement si
// les contenus communautaires sont actifs (parité GameWaitPage.canSuggest) :
//   • le CRÉATEUR de sa propre table — son type vient EXPLICITEMENT du preset
//     choisi à la création (createdSuggestType), jamais du nom de table ;
//   • tout ADMIN BBC sur une table BBC Step montée par quelqu'un d'autre — là
//     le type n'est connu de personne et se déduit des réglages
//     (suggestTypeForGame).
// Résultat du dernier contrôle d'admin communautaire (bbcadmins.txt /
// wecadmins.txt selon le type), épinglé à la table concernée : une réponse
// tardive arrivant après un changement de table ne doit pas allumer le
// bouton sur la nouvelle.
let _communityAdmin = false;
let _communityAdminForGame = null;

function _communityEnabled() {
  try {
    const adv = window._advGet || function (k, d) { return d; };
    const g = (S.games && S.gId) ? S.games[S.gId] : null;
    return !!(adv('community_content', true) && adv('community_suggest', false)
              && g && g.type === 3);
  } catch (e) { return false; }
}

// Type venant du preset choisi à la création (créateur uniquement).
function _ownSuggestType() {
  return (S.amGameAdmin && isSuggestType(createdSuggestType)) ? createdSuggestType : '';
}

// Type déduit des réglages de la table courante.
function _tableSuggestType() {
  try { return suggestTypeForGame((S.games && S.gId) ? S.games[S.gId] : null); }
  catch (e) { return ''; }
}

// Le type réellement utilisable ici et maintenant, '' si rien.
function effectiveSuggestType() {
  if (!_communityEnabled()) return '';
  const own = _ownSuggestType();
  if (own) return own;
  const table = _tableSuggestType();
  return (_communityAdmin && _communityAdminForGame === S.gId) ? table : '';
}

// Lance le contrôle d'admin, mais UNIQUEMENT sur une table communautaire
// (BBC Step ou WEC) étrangère : partout ailleurs la fonction ne coûte aucune
// requête. La liste compétente est choisie par le type (isCommunityAdmin,
// parité amont 576b598). Les invités ne peuvent pas chatter, donc pas de
// contrôle non plus pour eux.
function _resolveCommunityAdmin() {
  if (!_communityEnabled() || _ownSuggestType()) return;
  const table = _tableSuggestType();
  if (!isSuggestType(table)) return;
  if (((S._playerRights && S._playerRights[S.myId]) || 0) === 1) return;
  if (_communityAdminForGame === S.gId) return;   // déjà tranché pour cette table
  const nick = (S.players && S.players[S.myId]) || '';
  if (!nick) return;
  const gid = S.gId;
  isCommunityAdmin(table, nick, function (ok) {
    if (S.gId !== gid) return;              // table quittée entre-temps
    _communityAdmin = !!ok;
    _communityAdminForGame = gid;
    syncSuggestBtn();                        // la réponse rouvre le bouton
  });
}

// ── Action du bouton ──────────────────────────────────────────────────
let _busy = false;
function suggestPlayers() {
  if (_busy) return;
  const type = effectiveSuggestType();
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

// Visibilité : exactement GameWaitPage.canSuggest — contenus communautaires,
// option activée, type « sur invitation » (3), et un type de suggestion
// utilisable (preset du créateur OU admin BBC sur une table Step étrangère).
// Le contrôle bbcadmins.txt étant asynchrone, le bouton reste caché jusqu'à
// la réponse ; celle-ci rappelle cette fonction.
function syncSuggestBtn() {
  const b = document.getElementById('l-suggest-btn');
  if (!b) return;
  let on = false;
  try {
    on = !!effectiveSuggestType();
    if (!on) _resolveCommunityAdmin();
  } catch (e) { on = false; }
  b.style.display = on ? '' : 'none';
}

export { suggestPlayers, syncSuggestBtn, suggestForType, gameTitlePrefix,
         isSuggestType, setCreatedSuggestType, getCreatedSuggestType,
         idlePlayerNames, playingPlayerEntries,
         PRESETS as presets, suggestTypeForGame, isBbcAdmin, isCommunityAdmin,
         effectiveSuggestType };

window._suggestPlayers = suggestPlayers;
window._syncSuggestBtn = syncSuggestBtn;
// presets : source unique des vorlagen communautaires. pokerth.js
// (App._communityVorlagen) les lit ICI — voir le commentaire sur PRESETS.
window._botSuggest = { suggestForType, gameTitlePrefix, prefetchGameTitles, isSuggestType,
                       setCreatedSuggestType, getCreatedSuggestType,
                       idlePlayerNames, playingPlayerEntries,
                       presets: PRESETS, suggestTypeForGame, isBbcAdmin,
                       isCommunityAdmin, effectiveSuggestType };
