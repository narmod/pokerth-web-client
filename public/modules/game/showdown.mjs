// ═══════════════════════════════════════════════════════════════════
// Showdown & fin de partie : snapshot des résultats, badge « main
// gagnante », overlay vainqueur, bouton main suivante, overlay de fin
// de partie — chantier ESM #9f-9.
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations :
// t (i18n.mjs), esc (misc.mjs), _groupThousands (fmt.mjs),
// _avatarChipHtml (player-popup.mjs) importés ; notifyWinner/notifyBigWin,
// _lifeRecordGame, getPlayerName, _advGet, cardHtml, normalizeHoleCard,
// evaluateBestHand via window.* ; le setTimeout `App.dismissWinner()`
// appelle désormais dismissWinner() en direct (même fonction — le
// wrapper App.dismissWinner ne fait que la rappeler) ; $( réécrit.
// Les onclick des overlays gardent App.* (résolu par l'environnement
// global au clic, comme avant).
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { esc } from '../ui/misc.mjs';
import { _groupThousands } from '../ui/fmt.mjs';
import { _avatarChipHtml } from '../ui/player-popup.mjs';

// Sièges dont le stack est tombé à 0 (éliminés) — pour handlog 'sits out'.
function _hlEliminatedPids() {
  var out = [];
  try {
    for (var _i = 0; _i < S.seats.length; _i++) {
      var _p = S.seats[_i], _sd = S.seatData[_p];
      if (_sd && !_sd.gone && _sd.money === 0) out.push(_p);
    }
  } catch (_e) {}
  return out;
}

// ─────────────────────────────────────────────────────────────────
// End-of-game overlay — shown when EndOfGame fires (server signals
// the tournament is over). Displays:
//   * 🏆 trophy + 'TOURNAMENT ENDED' headline
//   * winner avatar + nickname (with 'YOU WON' styling if winner === me)
//   * the local player's session-stats card
//   * two buttons: 'Close' (dismiss overlay, stay on table view) and
//     'Back to lobby' (full leaveGame).
// The user must click one of the two buttons — no auto-dismiss, no
// background click escape.
// ─────────────────────────────────────────────────────────────────
function showEndGameOverlay(winnerPid, opts) {
  const el = document.getElementById('g-endgame-overlay');
  if (!el) return;

  opts = opts || {};
  const eliminated = !!opts.eliminated;
  const place = opts.place || 0;
  const isMyWin = (winnerPid === S.myId) && !eliminated;
  if (!S._gameCounted) { S._gameCounted = true; window._lifeRecordGame(isMyWin); }
  const winnerName = S.players[winnerPid] || (isMyWin
    ? (document.getElementById('nick') ? document.getElementById('nick').value : 'You')
    : ('#' + winnerPid));
  // Build winner avatar via the unified helper. Same priority order
  // everywhere: real PokerTH image > placeholder logo > emoji > 🤖 >
  // initial letter. (Aucun avatar en mode éliminé : on affiche la place.)
  const avChip = eliminated ? '' : _avatarChipHtml(winnerPid, winnerName, 'eg-winner-av');
  const winnerCls = 'eg-winner' + (isMyWin ? ' me' : '');
  const winnerLabel = eliminated ? ''
                    : (isMyWin ? t('endGameYouWon') : t('endGameWinner'));
  const winnerNameDisp = eliminated ? (place ? t('endGamePlace', { n: place }) : '')
                    : esc(winnerName);

  // Stats — reuse the S._stats object that was already being maintained
  const s = S._stats || { handsPlayed:0, handsWon:0, totalGain:0, bigWin:0, bigLoss:0, startMoney:0 };
  const wr = s.handsPlayed > 0 ? Math.round(s.handsWon / s.handsPlayed * 100) : 0;
  const _realStk = (S.seatData[S.myId] && S.seatData[S.myId].money != null) ? S.seatData[S.myId].money : null;
  const finalStack = (_realStk != null) ? _realStk : ((s.startMoney || 0) + (s.totalGain || 0));
  const gainCls = (s.totalGain > 0) ? 'pos' : (s.totalGain < 0) ? 'neg' : '';

  // Outcome icon: 🏆 trophy when the local player wins, otherwise a
  // fan of the four aces (♣ ♦ ♥ ♠) — far more on-theme for poker
  // than the old 🎲 dice. Inline SVG so it's crisp at any size and
  // identical across platforms (the dice/emoji rendered differently
  // per OS). The aces use a neutral, theme-driven card-border (currentColor).
  const ACES_SVG =
    '<svg viewBox="0 0 120 96" width="92" height="74" xmlns="http://www.w3.org/2000/svg" class="eg-aces" style="color:var(--gold-dim)" aria-hidden="true">' +
      '<defs><filter id="egAceSh" x="-20%" y="-20%" width="140%" height="140%">' +
        '<feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000" flood-opacity="0.5"/>' +
      '</filter></defs>' +
      '<g filter="url(#egAceSh)">' +
        '<g transform="rotate(-26 60 74)">' +
          '<rect x="41" y="32" width="25" height="37" rx="3.4" fill="#fdfdf8" stroke="currentColor" stroke-width="1"/>' +
          '<text x="44.5" y="43" font-family="Georgia, serif" font-size="8.5" font-weight="bold" fill="#1a1a1a">A</text>' +
          '<text x="53.5" y="58" font-family="serif" font-size="14" fill="#1a1a1a" text-anchor="middle">\u2663</text>' +
        '</g>' +
        '<g transform="rotate(-9 60 74)">' +
          '<rect x="46" y="26" width="25" height="37" rx="3.4" fill="#fdfdf8" stroke="currentColor" stroke-width="1"/>' +
          '<text x="49.5" y="37" font-family="Georgia, serif" font-size="8.5" font-weight="bold" fill="#c0392b">A</text>' +
          '<text x="58.5" y="52" font-family="serif" font-size="14" fill="#c0392b" text-anchor="middle">\u2666</text>' +
        '</g>' +
        '<g transform="rotate(9 60 74)">' +
          '<rect x="49" y="26" width="25" height="37" rx="3.4" fill="#fdfdf8" stroke="currentColor" stroke-width="1"/>' +
          '<text x="52.5" y="37" font-family="Georgia, serif" font-size="8.5" font-weight="bold" fill="#c0392b">A</text>' +
          '<text x="58.5" y="52" font-family="serif" font-size="14" fill="#c0392b" text-anchor="middle">\u2665</text>' +
        '</g>' +
        '<g transform="rotate(26 60 74)">' +
          '<rect x="54" y="32" width="25" height="37" rx="3.4" fill="#fdfdf8" stroke="currentColor" stroke-width="1"/>' +
          '<text x="57.5" y="43" font-family="Georgia, serif" font-size="8.5" font-weight="bold" fill="#1a1a1a">A</text>' +
          '<text x="66.5" y="58" font-family="serif" font-size="14" fill="#1a1a1a" text-anchor="middle">\u2660</text>' +
        '</g>' +
      '</g>' +
    '</svg>';
  const trophy = isMyWin ? '🏆' : ACES_SVG;
  const titleKey = eliminated ? 'endGameTitleEliminated' : (isMyWin ? 'endGameTitleWin' : 'endGameTitleEnd');

  el.innerHTML =
    '<div class="endgame-card" onclick="event.stopPropagation()">' +
      '<div class="eg-trophy">' + trophy + '</div>' +
      '<div class="eg-title">' + t(titleKey) + '</div>' +
      '<div class="' + winnerCls + '">' +
        avChip +
        '<div>' +
          '<div class="eg-winner-label">' + winnerLabel + '</div>' +
          '<div class="eg-winner-name">' + winnerNameDisp + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="eg-stats-section">' +
        '<div class="eg-stats-title">📊 ' + t('endGameYourStats') + '</div>' +
        '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameHandsPlayed') + '</span><span class="eg-stat-val">' + s.handsPlayed + '</span></div>' +
        '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameHandsWon') + '</span><span class="eg-stat-val pos">' + s.handsWon + ' (' + wr + '%)</span></div>' +
        '<hr class="eg-stat-divider">' +
        '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameFinalStack') + '</span><span class="eg-stat-val">' + '$' + _groupThousands(finalStack)+'</span></div>' +
        '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameNetGain') + '</span><span class="eg-stat-val ' + gainCls + '">' + (s.totalGain > 0 ? '+' : '') + '$' + _groupThousands(s.totalGain)+'</span></div>' +
        '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameBestWin') + '</span><span class="eg-stat-val pos">+' + '$' + _groupThousands(s.bigWin)+'</span></div>' +
        '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameWorstLoss') + '</span><span class="eg-stat-val neg">' + '$' + _groupThousands(s.bigLoss)+'</span></div>' +
      '</div>' +
      '<div id="eg-ach"></div>' +
      '<div class="eg-actions">' +
        (window._offlineMode ? '<button class="eg-btn primary" onclick="App.offlineReplay()">' + t('endGameReplay') + '</button>' : '') +
        '<button class="eg-btn" onclick="App.endGameClose()">' + t('endGameClose') + '</button>' +
        '<button class="eg-btn' + (window._offlineMode ? '' : ' primary') + '" onclick="App.endGameLeave()">' + t('endGameBackToLobby') + '</button>' +
      '</div>' +
    '</div>';
  el.style.display = '';
  if (window._offlineMode && typeof window._achMountBadge === 'function') { try { window._achMountBadge(document.getElementById('eg-ach'), 'endgame'); } catch (e) {} }

  // Audio cue: winner fanfare for the local player, neutral chime otherwise
  if (typeof window.notifyWinner === 'function') {
    setTimeout(function(){ window.notifyWinner(isMyWin); }, 200);
  }
}

  // ── Snapshot de fin de main ──
// Capture, au moment où la main se termine (EndOfHandShow / EndOfHandHide),
// le stack final et le net EXACT de chaque joueur AVANT que la main suivante
// ne réinitialise seatData/_seatStackAtHandStart. Sans ça, l'overlay (souvent
// rendu après le démarrage de la donne suivante) afficherait des montants
// faussés. On garde les joueurs couchés ; on marque hors-jeu les éliminés.
function _snapshotHandResults() {
  var snap = {};
  var pids = S.seats.length ? S.seats.slice() : Object.keys(S.seatData).map(Number);
  pids.forEach(function(pid) {
    var sd    = S.seatData[pid] || {};
    var start = S._seatStackAtHandStart[pid];
    var net   = (start != null && sd.money != null) ? (sd.money - start) : null;
    // "Dans cette main" = avait des jetons au début de CE coup (start > 0),
    // donc a bel et bien été distribué. Conséquences voulues :
    //  • éliminé une main PRÉCÉDENTE → start = 0 → exclu ;
    //  • busté PENDANT la main (all-in perdu) → start > 0 → conservé, avec sa
    //    perte nette affichée ;
    //  • couché (fold) → start > 0 → conservé.
    var inHand = (start != null) && (start > 0);
    snap[pid] = {
      money:  sd.money,
      net:    net,
      card1:  sd.card1,
      card2:  sd.card2,
      folded: !!sd.folded,
      inHand: inHand
    };
  });
  S._handResultSnapshot = snap;
}

  // ── Winner overlay ──
// ── Badge « main gagnante » sous les community cards (parité QML, bible §9) ──
// Affiché pendant tout le showdown avec le libellé de la meilleure main
// (déjà traduit par evaluateBestHand) ; masqué à la main suivante. Positionné
// juste sous #g-comm : le badge vit dans .felt-oval → il suit zoom et pan.
function showWinHandBadge(label) {
  var b = document.getElementById('g-win-hand');
  if (!b) return;
  if (!label) { b.style.display = 'none'; window._winHandLabel = null; return; }
  window._winHandLabel = label;   // mémorisé pour le repositionnement au relayout
  var comm = document.getElementById('g-comm');
  var oval = document.querySelector('.felt-oval');
  b.textContent = label;   // textContent : libellé simple, jamais du HTML
  // Écart QML : 6 px en portrait, 8 px en paysage (WinningHandBadge.qml).
  var _whGap = 8, _whPortrait = false;
  try { _whPortrait = document.documentElement.getAttribute('data-seat-orient') === 'portrait'; } catch (e) {}
  if (_whPortrait) _whGap = 6;
  // Mobile PAYSAGE (landscapeCompact, fenêtre < 600 px de haut) : pas de
  // place sous la rangée -> le badge se SUPERPOSE aux cartes, centré sur la
  // rangée (demande narmod 19/07). Sinon : sous les cartes, comme le QML.
  var _whOverlay = !_whPortrait && window.innerHeight < 600;
  if (comm && oval) {
    // Mesure RÉELLE de la rangée de cartes : #g-comm est décalé par le
    // repositionnement auto (paysage/portrait) et mis à l'échelle par
    // --comm-scale. On lit sa position effective via getBoundingClientRect
    // plutôt que de supposer un centrage sur l'ovale, pour que le badge
    // suive toujours les cartes (narmod 19/07). Comme le scaler applique un
    // transform:scale au conteneur, on reconvertit la mesure écran en
    // coordonnées locales de .felt-oval (division par le scale effectif).
    var _or = oval.getBoundingClientRect();
    var _cr = comm.getBoundingClientRect();
    var _sc = (oval.offsetHeight > 0 && _or.height > 0) ? (_or.height / oval.offsetHeight) : 1;
    if (!_sc || !isFinite(_sc)) _sc = 1;
    if (_whOverlay) {
      // Centré verticalement sur la rangée réelle.
      b.style.top = Math.round(((_cr.top + _cr.height / 2) - _or.top) / _sc) + 'px';
      b.style.transform = 'translate(-50%, -50%)';
    } else {
      // Juste sous le bas réel de la rangée + l'écart QML.
      b.style.top = Math.round(((_cr.bottom - _or.top) / _sc) + _whGap) + 'px';
      b.style.transform = 'translateX(-50%)';
    }
  }
  b.style.display = '';
  // Pop d'apparition (winHandPop QML : 1→1.18 en 110 ms, retour OutBack 170 ms).
  b.classList.remove('win-pop'); void b.offsetWidth; b.classList.add('win-pop');
}
window._hideWinHandBadge = function () {
  var b = document.getElementById('g-win-hand');
  if (b) b.style.display = 'none';
  window._winHandLabel = null;
};
// Repositionne le badge « main gagnante » sur les cartes si visible. Appelé
// après renderSeats (qui recalcule --comm-scale / le placement des cartes) et
// au resize, pour que le badge suive le repositionnement automatique.
window._repositionWinHandBadge = function () {
  try {
    var b = document.getElementById('g-win-hand');
    if (b && b.style.display !== 'none' && window._winHandLabel) showWinHandBadge(window._winHandLabel);
  } catch (e) {}
};

function showWinnerOverlay(winners) {
  var ov = document.getElementById('g-winner-overlay');
  if (!ov || !winners || winners.length === 0) return;

  var mainWinner = winners[0];
  var isMyWin = winners.some(function(w){ return w.pid === S.myId; });
  // Big-win sound trigger: when *I* win, decide between a regular winner
  // chirp and the full confetti-pop. Threshold is intentionally generous
  // (>= 30 × small blind) so the fanfare doesn't fire on every micro pot
  // but does on anything meaningful. Falls back to plain notifyWinner if
  // notifyBigWin isn't loaded for any reason (defensive against old SW
  // caches serving an older sounds.mjs).
  var _totalWon = winners.reduce(function(s,w){ return s + (w.won||0); }, 0);
  var BIG_WIN_THRESHOLD = Math.max(300, S.smallBlind * 30);
  if (isMyWin && _totalWon >= BIG_WIN_THRESHOLD && typeof window.notifyBigWin === 'function') {
    window.notifyBigWin();
  } else if (typeof window.notifyWinner === 'function') {
    window.notifyWinner(isMyWin);
  }
  var trophy = isMyWin ? "🎉" : "🏆";

  // Option avancée « Fenêtre du gagnant » (activée par défaut) : quand elle est
  // décochée, on saute uniquement l'AFFICHAGE — les sons de victoire ci-dessus
  // restent joués et la partie enchaîne normalement (dismissWinner est no-op).
  if (!window._advGet('winner_popup', true)) { _maybeShowNextHandBtn(); return; }

  // Snapshot figé à la fin de la main (montants + qui était réellement engagé).
  var snap = S._handResultSnapshot || {};
  var winnerPidsEarly = winners.map(function(w){ return w.pid; });
  // Joueurs encore EN JEU dans cette main (couchés inclus, éliminés exclus).
  var _playersInHand = Object.keys(snap).filter(function(k){
    return (snap[k] && snap[k].inHand) || winnerPidsEarly.indexOf(Number(k)) >= 0;
  }).length;
  if (!_playersInHand) _playersInHand = S.seats.length; // garde-fou si snapshot vide

  // Build header
  var winnerNames = winners.map(function(w){ return esc(window.getPlayerName(w.pid)); }).join(" & ");
  var totalWon = winners.reduce(function(s,w){ return s+w.won; }, 0);

  var html = '<div class="winner-card" onclick="event.stopPropagation()">';

  // ── Header ──
  html += '<div class="wc-header">';
  html += '<div class="wc-trophy">' + trophy + '</div>';
  html += '<div class="wc-titles">';
  html += '<div class="wc-label">' + (isMyWin ? t('youWon') : t('handWinner')) + '</div>';
  html += '<div class="wc-name">' + winnerNames + '</div>';
  html += '</div>';
  html += '<div class="wc-gain">+' + '$' + _groupThousands(totalWon)+'</div>';
  html += '</div>';

  // ── Stats ──
  html += '<div class="wc-stats">';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('handOf') + '</div><div class="wc-stat-value">' + S.handNum + '</div></div>';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('totalPot') + '</div><div class="wc-stat-value">' + '$' + _groupThousands(totalWon)+'</div></div>';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('players') + '</div><div class="wc-stat-value">' + _playersInHand + '</div></div>';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('blinds') + '</div><div class="wc-stat-value">' + S.smallBlind + '/' + (S.smallBlind*2) + '</div></div>';
  html += '</div>';

  // ── Board (community cards) ──
  var comm = S.commCards.filter(function(n){ return n != null; });
  if (comm.length) {
    html += '<div class="wc-section">' + t('commCards') + '</div>';
    html += '<div class="wc-cards-row">';
    comm.forEach(function(n){ html += window.cardHtml(n, "sm", true); });
    html += '</div>';
  }

  // ── Combinaison gagnante ──
  if (comm.length >= 3) {
    // Chercher la meilleure main parmi les gagnants (cartes connues)
    var bestHandLabel = '';
    for (var _wi = 0; _wi < winners.length && !bestHandLabel; _wi++) {
      var _wpid = winners[_wi].pid;
      var _wsd  = S.seatData[_wpid] || {};
      var _hc1  = (_wpid === S.myId) ? S.myCards[0] : _wsd.card1;
      var _hc2  = (_wpid === S.myId) ? S.myCards[1] : _wsd.card2;
      if (_hc1 != null && _hc2 != null) {
        var _holeNorm = [_hc1, _hc2].map(normalizeHoleCard).filter(function(c){ return c != null; });
        if (_holeNorm.length === 2) {
          var _res = window.evaluateBestHand(_holeNorm, comm);
          if (_res) bestHandLabel = _res.label;
        }
      }
    }
    if (bestHandLabel) {
      html += '<div class="wc-best-hand">' + bestHandLabel + '</div>';
    }
    // Le badge sous les community cards est désormais piloté par le handler
    // EndOfHand showdown (texte QML winningHandText), indépendamment de cette
    // fenêtre — plus d'appel ici pour ne pas écraser son libellé.
  }

  // ── Players results ──
  html += '<div class="wc-section">' + t('results') + '</div>';
  html += '<div class="wc-players">';

  // Sort: winners first, then by money desc
  // CRITICAL: .slice() to clone seats — otherwise allPids.sort() below
  // mutates the global seats array IN PLACE (since assignment shares the
  // reference), rotating every player's visual position around the table
  // after each showdown. The bug looked like 'seats randomly reordered
  // every few hands' and was masked by _seatsFrozen which only guarded
  // against GameStartInitial rewrites, not external mutations.
  var allPids = S.seats.length ? S.seats.slice() : Object.keys(S.seatData).map(Number);
  var winnerPids = winners.map(function(w){ return w.pid; });
  function _snapMoney(pid){ var s = snap[pid]; return (s && s.money != null) ? s.money : ((S.seatData[pid]||{}).money||0); }
  allPids.sort(function(a,b){
    var aW = winnerPids.indexOf(a) >= 0 ? 1 : 0;
    var bW = winnerPids.indexOf(b) >= 0 ? 1 : 0;
    if (aW !== bW) return bW - aW;
    return _snapMoney(b) - _snapMoney(a);
  });

  allPids.forEach(function(pid) {
    var sd    = S.seatData[pid] || {};
    var snp   = snap[pid] || null;
    var isW   = winnerPids.indexOf(pid) >= 0;
    var isMe  = pid === S.myId;
    // Ne lister que les joueurs réellement engagés dans CETTE main : on garde
    // les couchés (fold), mais on retire les joueurs éliminés/sortis lors d'une
    // main précédente (ils n'ont pas participé). Le(s) gagnant(s) restent
    // toujours, par sécurité.
    var _inHand = snp ? snp.inHand : ((S._seatStackAtHandStart[pid] || 0) > 0);
    if (!isW && !_inHand) return;

    var name  = window.getPlayerName(pid);
    var wObj  = winners.find(function(w){ return w.pid === pid; });
    // Montants figés à la fin de la main (snapshot) pour éviter que le
    // démarrage de la main suivante ne fausse stack/net affichés.
    var _money = (snp && snp.money != null) ? snp.money : sd.money;
    var _net;
    if (snp) {
      _net = snp.net;
    } else {
      var _startStk = S._seatStackAtHandStart[pid];
      _net = (_startStk != null && sd.money != null) ? (sd.money - _startStk) : null;
    }
    var _c1 = (snp && snp.card1 != null) ? snp.card1 : sd.card1;
    var _c2 = (snp && snp.card2 != null) ? snp.card2 : sd.card2;
    var deltaClass, deltaTxt;
    if (isW) {
      // Gagnant : on affiche le pot ramassé (cohérent avec l'en-tête).
      deltaClass = "pos";
      deltaTxt = "+" + "$" + _groupThousands(wObj ? wObj.won : 0);
    } else if (_net != null && _net < 0) {
      // Perdant : perte nette de la main, en rouge.
      deltaClass = "neg";
      deltaTxt = "$" + _groupThousands(_net);
    } else if (_net != null && _net > 0) {
      // Gain net positif sans être « le » gagnant (split pot / side pot).
      deltaClass = "pos";
      deltaTxt = "+" + "$" + _groupThousands(_net);
    } else {
      deltaClass = "";
      deltaTxt = "";
    }
    var rowClass = "wc-player-row" + (isW ? " wc-winner" : "") + (isMe ? " wc-me-row" : "");

    html += '<div class="' + rowClass + '">';
    html += _avatarChipHtml(pid, name, 'wc-player-av');
    html += '<div class="wc-player-info">';
    html += '<div class="wc-player-name">' + esc(name) + (isW ? " 🏆" : "") + (isMe ? " 👤" : "") + '</div>';
    html += '<div class="wc-player-stack">' + (_money != null ? "$" + _groupThousands(_money) : "—") + '</div>';
    html += '</div>';
    // Cartes : on rend TOUJOURS le conteneur (avec 2 cartes ou 2 dos en
    // placeholder), sinon la ligne n'aurait que 3 colonnes et la grille
    // décalerait les cartes des autres lignes.
    html += '<div class="wc-player-cards">';
    if (_c1 != null || _c2 != null) { // FIX: || test falsy ratait les cartes à valeur 0
      html += window.cardHtml(_c1 != null ? _c1 : null,"xsm",false) + window.cardHtml(_c2 != null ? _c2 : null,"xsm",false);
    } else if (isMe && S.myCards[0] != null) { // FIX: idem, valeur 0 = falsy
      html += window.cardHtml(S.myCards[0],"xsm",false) + window.cardHtml(S.myCards[1],"xsm",false);
    } else {
      // Joueur couché / cartes non révélées : 2 dos estompés, juste pour
      // réserver la largeur de la colonne et garder l'alignement.
      html += '<div class="pk xsm back placeholder"></div><div class="pk xsm back placeholder"></div>';
    }
    html += '</div>';
    html += '<div class="wc-player-delta ' + deltaClass + '">' + deltaTxt + '</div>';
    html += '</div>';
  });

  html += '</div>';
  // Option visuelle « Ne plus afficher » : bascule la meme option avancee
  // winner_popup (adv-winnerpopup) — re-activable depuis les Options avancees.
  html += '<label class="wc-hide-opt"><input type="checkbox" onchange="setAdvOpt(\'winner_popup\', !this.checked)"><span>' + t('wcHideOpt') + '</span></label>';
  html += '<button class="winner-dismiss" onclick="App.dismissWinner()">' + t('continue') + '</button>';
  html += '</div>';

  ov.innerHTML = html;
  ov.style.display = 'flex';
  clearTimeout(window._winnerTimer);
  // Pause entre les mains (entraînement) : la fenêtre attend le Continuer —
  // pas d'auto-fermeture (sinon la pause n'en serait pas une).
  if (!(window._offlineMode && window._advGet('pause_hands', false)))
    window._winnerTimer = setTimeout(function(){ dismissWinner(); }, 12000);
}

function dismissWinner() {
  var ov = document.getElementById('g-winner-overlay');
  if (ov) ov.style.display = 'none';
  clearTimeout(window._winnerTimer);
  var nb = document.getElementById('g-next-hand-btn');
  if (nb) nb.style.display = 'none';
  // Reprise de la pause entre les mains (idempotent : no-op sans pause).
  try { if (window._offlineMode && window.PokerOffline && window.PokerOffline.resumeNextHand) window.PokerOffline.resumeNextHand(); } catch (e) {}
}
// Repli quand la fenêtre du gagnant est désactivée mais la pause active :
// un bouton « ▶ Main suivante » flottant pour reprendre.
function _maybeShowNextHandBtn() {
  if (!(window._offlineMode && window._advGet('pause_hands', false))) return;
  var b = document.getElementById('g-next-hand-btn');
  if (b) b.style.display = '';
}

export { _hlEliminatedPids, showEndGameOverlay, _snapshotHandResults,
         showWinHandBadge, showWinnerOverlay, dismissWinner,
         _maybeShowNextHandBtn };

for (const [k, v] of Object.entries({ _hlEliminatedPids, showEndGameOverlay,
  _snapshotHandResults, showWinHandBadge, showWinnerOverlay, dismissWinner,
  _maybeShowNextHandBtn })) window[k] = v;
