// ═══════════════════════════════════════════════════════════════════
// Popup joueur (profil, stats, actions) + avatars (rendu, picker lobby,
// drapeaux pays) — chantier ESM #9f-7.
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations :
// t (i18n.mjs), esc (misc.mjs), fmtChips (fmt.mjs) importés ; isBot /
// updateLobbyPill (ponts ajoutés côté monolithe), _petAsk / _isIgnored /
// _statsBody* / renderBoard / avpApplyDefaultCat via window.* ;
// $( réécrit en document.getElementById(.
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { esc } from './misc.mjs';
import { fmtChips } from './fmt.mjs';
import { MSG } from '../net/messages.mjs';

// Public helper used by the renderer: returns a Data URL for the
// player or null. Considers cache + freshly assembled images.
function _pthAvatarFor(pid) {
  const meta = S._pthAvatarHashes[pid];
  if (!meta) return null;
  return S._pthDataUrls[meta.hashHex] || null;
}
// Expose for refreshMyAvatar (defined at module top level)
window._pthAvatarFor = _pthAvatarFor;
// Avatar feature: returns the emoji to display for the local player,
// or '' if there is none. Crucially treats the '__pth__' sentinel as
// "no emoji" so the literal string never leaks into the UI as text.
// Use this everywhere we want an avatar-as-string (player-bar text
// fallback, waiting list, winner overlay, etc.) -- do NOT read
// localStorage.pth_avatar directly for display purposes.
function _myAvatarDisplay() {
  var v = S._myAvatarCache;
  if (!v) {
    try { v = localStorage.getItem('pth_avatar') || ''; } catch(e) { v = ''; }
  }
  return (v === '__pth__' || v === '__img__') ? '' : v;
}
// Same idea for broadcasting to other players: don't send the
// sentinel over the wire (it would show as 4 weird chars on their
// seat). When the local player picked '__pth__', they get the real
// PokerTH avatar through their own PlayerInfoReply flow.
function _myAvatarToBroadcast() {
  var v = '';
  try { v = localStorage.getItem('pth_avatar') || ''; } catch(e) {}
  return (v === '__pth__' || v === '__img__') ? '' : v;
}

// Unified avatar-chip renderer for compact UI lists (waiting room,
// winner banner, end-of-hand results table, etc.). Returns a single
// HTML <span> -- already escaped where needed. The caller wraps it
// in whatever container they want (no <li> / <div> assumed here).
//
// Decision tree per player (same priority order as the table seats):
//   1. Real PokerTH avatar image downloaded for this pid -> <img>
//   2. For me + I chose '__pth__' but image not downloaded ->
//      placeholder /favicon.svg
//   3. Emoji (mine from localStorage, others' from S._playerAvatars)
//   4. Bot fallback -> 🤖
//   5. Mode internet (pokerth.net) sans avatar -> logo PokerTH /favicon.svg
//   6. Final fallback (LAN / entrainement) -> first letter of the pseudo
//
// Args:
//   pid        : player id (number)
//   nick       : pseudo to use for the initial-letter fallback
//   chipClass  : the CSS class on the wrapping <span>. Caller-defined
//                because the 3 surfaces (wp-av, eg-winner-av,
//                wc-player-av) have different sizes and colors.
function _avatarChipHtml(pid, nick, chipClass) {
  var isMe = (pid === S.myId);
  // 1) real image?
  var pthUrl = (typeof _pthAvatarFor === 'function') ? _pthAvatarFor(pid) : null;
  // For me, honour the explicit choice (so picking an emoji or
  // initial suppresses my real downloaded image on these surfaces
  // too, same as on the table seat).
  if (pthUrl && isMe) {
    var myChoice = null;
    try { myChoice = localStorage.getItem('pth_avatar'); } catch(e) {}
    if (myChoice !== null && myChoice !== '__pth__') pthUrl = null;
  }
  // 2) placeholder logo for me when I chose __pth__ but no image yet
  if (!pthUrl && isMe) {
    var myChoice2 = null;
    try { myChoice2 = localStorage.getItem('pth_avatar'); } catch(e) {}
    if (myChoice2 === '__img__') {
      try { pthUrl = localStorage.getItem('pth_avatar_img') || null; } catch(e) { pthUrl = null; }
    }
    if (!pthUrl && myChoice2 === '__pth__') pthUrl = '/favicon.svg';
  }
  // Autres joueurs : image perso reçue via le proxy (prioritaire sur l'emoji).
  if (!isMe && S._playerImgAvatars[pid]) pthUrl = S._playerImgAvatars[pid];
  if (pthUrl) {
    return '<span class="' + chipClass + ' has-pth-avatar">'
         + '<img class="chip-pth-img" src="' + pthUrl + '" alt="" draggable="false">'
         + '</span>';
  }
  // 3) emoji? (mine via the sentinel-aware helper, others via S._playerAvatars)
  var emoji = isMe ? _myAvatarDisplay() : (S._playerAvatars[pid] || '');
  if (emoji) {
    return '<span class="' + chipClass + ' emoji-av">' + esc(emoji) + '</span>';
  }
  // 4) bots
  if (window.isBot(pid)) {
    return '<span class="' + chipClass + ' emoji-av">🤖</span>';
  }
  // 5) Mode internet (pokerth.net) : joueur sans avatar -> logo PokerTH,
  // comme le siege de jeu. Les autres modes (LAN, entrainement) gardent
  // l'initiale.
  if (!window._offlineMode && (S._currentLoginMode === 'guest' || S._currentLoginMode === 'auth')) {
    return '<span class="' + chipClass + ' has-pth-avatar">'
         + '<img class="chip-pth-img" src="/favicon.svg" alt="" draggable="false">'
         + '</span>';
  }
  // 6) initial-letter fallback (LAN / entrainement)
  var letter = ((nick && nick[0]) || '?').toUpperCase();
  return '<span class="' + chipClass + ' letter">' + esc(letter) + '</span>';
}
// Expose so tests / debug can call it.
window._avatarChipHtml = _avatarChipHtml;


// Code pays ISO 3166-1 alpha-2 -> balise <img> vers un drapeau SVG
// auto-hébergé (/flags/<cc>.svg). On utilise une image plutôt que l'emoji
// indicateur régional pour un rendu identique sur TOUS les OS (Windows
// n'a pas les glyphes drapeau). Renvoie '' si le code est invalide.
// `cls` : classe CSS optionnelle pour dimensionner selon le contexte.
function _ccToFlag(cc, cls) {
  if (!cc || typeof cc !== 'string') return '';
  cc = cc.trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(cc)) return '';
  return '<img class="cc-flag' + (cls ? ' ' + cls : '') + '" src="/flags/' + cc
       + '.svg" alt="' + cc.toUpperCase() + '" title="' + cc.toUpperCase()
       + '" draggable="false" loading="lazy" onerror="this.style.display=\'none\'">';
}

// ──────────────────────────────────────────────────────────────
// Player-info modal -- shows the local player's avatar + name,
// plus a 'Change avatar' button that opens the avatar picker.
// ──────────────────────────────────────────────────────────────
function openPlayerInfoPopup(pid, autoStats) {
  var modal = document.getElementById('player-info-modal');
  if (!modal) return;
  // pid omis (ou === moi) → MON profil (comportement historique : stats +
  // changer d'avatar). Sinon → profil en LECTURE d'un adversaire.
  var targetPid = (pid == null) ? S.myId : pid;
  var isSelf = (targetPid === S.myId);
  S._pimPid = targetPid;
  var avEl    = document.getElementById('pim-avatar');
  var nameEl  = document.getElementById('pim-name');
  var statsEl = document.getElementById('pim-stats');
  var infoEl  = document.getElementById('pim-info');
  // ── Grand avatar (cercle 96px). Pour MOI : on respecte le choix local
  //    (même ordre que la barre joueur). Pour un autre : même priorité que
  //    les sièges (image réelle > emoji reçu > 🤖 si bot > initiale). ──
  if (avEl) {
    avEl.classList.remove('is-letter');
    var url = null, emoji = null;
    if (isSelf) {
      var realPth = (typeof _pthAvatarFor === 'function') ? _pthAvatarFor(S.myId) : null;
      var stored = null;
      try { stored = localStorage.getItem('pth_avatar'); } catch(e) {}
      if (stored === '__pth__') {
        url = realPth || '/favicon.svg';   // vrai avatar sinon logo
      } else if (stored === '__img__') {
        try { url = localStorage.getItem('pth_avatar_img') || null; } catch(e) { url = null; }
      } else if (stored && stored !== '__pth__' && stored !== '__img__') {
        emoji = stored;
      }
    } else {
      url = (typeof _pthAvatarFor === 'function') ? _pthAvatarFor(targetPid) : null;
      if (S._playerImgAvatars[targetPid]) url = S._playerImgAvatars[targetPid];
      if (!url) emoji = S._playerAvatars[targetPid] || (window.isBot(targetPid) ? '🤖' : '');
    }
    if (url) {
      avEl.innerHTML = '<img src="' + url + '" alt="" draggable="false">';
    } else if (emoji) {
      avEl.textContent = emoji;
    } else {
      avEl.classList.add('is-letter');
      var nm0 = isSelf ? S.myName : window.getPlayerName(targetPid);
      avEl.textContent = (nm0 && nm0[0] ? nm0[0] : '?').toUpperCase();
    }
    // Cliquable (→ sélecteur d'avatar) UNIQUEMENT pour mon propre profil.
    if (isSelf) {
      avEl.classList.add('pim-avatar-clickable');
      avEl.setAttribute('role', 'button');
      avEl.setAttribute('tabindex', '0');
      var _chTip = (typeof t === 'function') ? t('changeAvatar') : 'Change avatar';
      avEl.title = _chTip; avEl.setAttribute('aria-label', _chTip);
      avEl.onclick = function() { openAvatarPickerFromLobby(); };
      avEl.onkeydown = function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAvatarPickerFromLobby(); } };
    } else {
      avEl.classList.remove('pim-avatar-clickable');
      avEl.removeAttribute('role'); avEl.removeAttribute('tabindex');
      avEl.removeAttribute('title'); avEl.removeAttribute('aria-label');
      avEl.onclick = null; avEl.onkeydown = null;
    }
  }
  if (nameEl) nameEl.textContent = (isSelf ? S.myName : window.getPlayerName(targetPid)) || '';
  // Drapeau du pays (sous l'avatar) — code reçu via PlayerInfoReply.
  // Surtout présent sur pokerth.net ; masqué si inconnu.
  var flagEl = document.getElementById('pim-flag');
  if (flagEl) {
    var cc = S._playerCountries[targetPid];
    var flagImg = _ccToFlag(cc, 'cc-flag-lg');
    if (flagImg) {
      flagEl.innerHTML = flagImg + '<span class="pim-flag-code">' + String(cc).toUpperCase() + '</span>';
      flagEl.style.display = '';
    } else {
      flagEl.innerHTML = '';
      flagEl.style.display = 'none';
    }
  }
  if (isSelf) {
    // Mon profil : onglets stats (l'avatar du popup est cliquable pour le changer).
    if (infoEl)    { infoEl.style.display = 'none'; infoEl.innerHTML = ''; }
    if (statsEl)   statsEl.style.display = '';
    S._pimTab = 'session';
    _renderProfileStats();
  } else {
    // Adversaire : rôle + infos en jeu, pas de stats ni de bouton avatar.
    if (statsEl)   { statsEl.style.display = 'none'; statsEl.innerHTML = ''; }
    if (infoEl) {
      infoEl.innerHTML = _otherPlayerInfoHtml(targetPid);
      infoEl.style.display = '';
      // Community vote-kick entry — live (online) game only, seated
      // opponent, when we're seated and not the host (the host has the
      // direct kick). The server still arbitrates via AskKickDenied.
      try {
        if (!window._offlineMode && S.gId && targetPid !== S.myId && !S.amGameAdmin &&
            !S._amSpectator && S.seatData[targetPid] && !S.seatData[targetPid].gone) {
          var _vkBtn = document.createElement('button');
          _vkBtn.className = 'pim-votekick-btn';
          _vkBtn.textContent = t('petitionAsk');
          _vkBtn.style.cssText = 'display:block;width:100%;margin-top:10px;padding:8px 0;' +
            'border:1px solid var(--gold,#E3C800);border-radius:8px;cursor:pointer;' +
            'background:transparent;color:var(--text,#eff1f5);font-weight:600';
          _vkBtn.addEventListener('click', function(){ window._petAsk(targetPid); });
          infoEl.appendChild(_vkBtn);
        }
      } catch(e) {}
    }
  }
  // Ouverture directe sur les stats (bouton 📊 de la liste) : charge le
  // profil de saison du joueur (memes stats que « Voir les coupes »), sans
  // clic supplémentaire. Sans effet pour moi / joueur sans profil réseau.
  if (autoStats && !isSelf) { try { _pimLoadCups(targetPid); } catch (e) {} }
  modal.style.display = 'flex';
}
// Bouton 📊 de la liste : ouvre le popup et charge directement les stats
// de saison. Sans pid -> mon profil (deja en mode stats).
window._plOpenStats = function (pid) {
  if (pid == null || pid === '') { openPlayerInfoPopup(); return; }
  openPlayerInfoPopup(pid, true);
};
// Basculer l'ignorance d'un joueur (par nom) puis rafraîchir sièges + popup.
window._toggleIgnore = function(pid){
  var nm = (typeof window.getPlayerName === 'function') ? window.getPlayerName(pid) : null;
  if (!nm) return;
  _setIgnoredName(nm, !window._isIgnored(nm));
  try { if (typeof window._renderSeats === 'function') window._renderSeats(); } catch (e) {}
  try { openPlayerInfoPopup(pid); } catch (e) {}
};
// « Kickban total » admin — AdminBanPlayerMessage (type 76), équivalent du
// Lobby.adminBanPlayer du client QML. Confirmation avant envoi ; le résultat
// revient par AdminBanPlayerAckMessage (toast, voir le switch réseau).
window._adminBanPlayer = function (pid) {
  var nm = (typeof window.getPlayerName === 'function') ? (window.getPlayerName(pid) || ('#' + pid)) : ('#' + pid);
  var q = (typeof t === 'function' && t('kickbanConfirm') !== 'kickbanConfirm')
    ? t('kickbanConfirm', { name: nm })
    : ('Ban ' + nm + ' from the server (total kickban)?');
  if (!window.confirm(q)) return;
  try { window.send(MSG.buildAdminBanPlayer(pid)); } catch (e) {}
};

// Contenu du popup pour un AUTRE joueur : rôle (🤖 Bot / Invité / Enregistré
// / Admin), puis — s'il est attablé — ses jetons / mise / statut / position
// (pastilles D-SB-BB), et un lien vers son profil pokerth.net s'il est
// enregistré et qu'on est bien sur pokerth.net. Tout passe par t() → traduit.
function _otherPlayerInfoHtml(pid) {
  function tt(k, fb) { var v = (typeof t === 'function') ? t(k) : null; return (v && v !== k) ? v : fb; }
  var html = '';
  // Rôle
  var roleTxt;
  if (window.isBot(pid)) {
    roleTxt = '🤖 ' + tt('piRoleBot', 'Bot');
  } else {
    var rg = S._playerRights[pid] || 0;
    roleTxt = (rg === 3) ? tt('piRoleAdmin', 'Admin')
            : (rg === 2) ? tt('piRoleRegistered', 'Registered')
            : tt('piRoleGuest', 'Guest');
  }
  html += '<div class="pim-role">' + esc(roleTxt) + '</div>';
  // Infos en jeu (uniquement si le joueur est attablé / a des données siège).
  var sd = S.seatData[pid];
  if (sd) {
    var rows = '';
    function row(k, v) {
      return '<div class="pim-ig-row"><span class="pim-ig-k">' + esc(k) + '</span>'
           + '<span class="pim-ig-v">' + esc(v) + '</span></div>';
    }
    if (sd.money != null && sd.money >= 0) rows += row(tt('stack', 'Stack'), fmtChips(sd.money));
    if (sd.bet) rows += row(tt('piBet', 'Bet'), fmtChips(sd.bet));
    // Statut (un seul, par ordre de priorité).
    var st = '';
    if (sd.folded) st = tt('piStatusFolded', 'Folded');
    else if (sd.active === false) st = (sd.money != null && sd.money <= 0) ? tt('piStatusEliminated', 'Eliminated') : tt('piStatusSittingOut', 'Sitting out');
    else if (sd.money === 0) st = tt('piStatusAllIn', 'All-in');
    else if (pid === S.turnPid) st = tt('piStatusToAct', 'To act');
    // Position : pastilles universelles D / SB / BB (pas de traduction).
    var pos = '';
    if (pid === S.dealerPid)  pos += '<span class="pim-pos pim-pos-d">D</span>';
    if (pid === S._lastSbPid) pos += '<span class="pim-pos pim-pos-sb">SB</span>';
    if (pid === S._lastBbPid) pos += '<span class="pim-pos pim-pos-bb">BB</span>';
    var foot = '';
    if (st)  foot += '<span class="pim-status">' + esc(st) + '</span>';
    if (pos) foot += '<span class="pim-pos-wrap">' + pos + '</span>';
    html += '<div class="pim-ig">' + rows + (foot ? ('<div class="pim-ig-foot">' + foot + '</div>') : '') + '</div>';
  }
  // Lien vers le profil pokerth.net (joueurs enregistrés, mode guest/auth).
  var rg2 = S._playerRights[pid] || 0;
  var modeEl = document.getElementById('login-mode');
  var onNet = !!(modeEl && (modeEl.value === 'guest' || modeEl.value === 'auth'));
  if (!window.isBot(pid) && onNet && (rg2 === 2 || rg2 === 3)) {
    // Coupes À LA DEMANDE : aucun réseau à l'ouverture. Le bouton déclenche
    // window._pimLoadCups(pid) → rkLoadPlayerCups remplit #pim-cups (1 fois).
    html += '<button type="button" id="pim-cups-btn" class="pim-cups-btn" onclick="window._pimLoadCups(' + pid + ')">🏆 '
          + esc(tt('piShowCups', 'Show cups')) + '</button>';
    html += '<div id="pim-cups" class="pim-cups"></div>';
    var nm = window.getPlayerName(pid);
    html += '<a class="pim-profile-link" href="https://www.pokerth.net/app.php/player?u='
          + encodeURIComponent(nm) + '" target="_blank" rel="noopener noreferrer">'
          + esc(tt('piViewProfile', 'View pokerth.net profile')) + '</a>';
  }
  var _ignNm = window.getPlayerName(pid);
  html += '<button type="button" class="pim-ignore-btn" onclick="window._toggleIgnore(' + pid + ')" '
        + 'style="display:block;width:100%;margin-top:10px;padding:8px 0;border:1px solid var(--border-hi,rgba(200,168,74,.4));border-radius:8px;cursor:pointer;background:transparent;color:var(--text,#eff1f5);font-weight:600">'
        + (window._isIgnored(_ignNm) ? '🔔 ' + esc(tt('piUnignore', 'Unignore')) : '🔕 ' + esc(tt('piIgnore', 'Ignore'))) + '</button>';
  // Kickban total — visible UNIQUEMENT si JE suis admin pokerth.net
  // (playerRights=3), jamais sur soi ni sur un bot. Marteau (gavel), comme
  // le PlayerListItem du client QML officiel.
  if (!window.isBot(pid) && pid !== S.myId && (S._playerRights[S.myId] || 0) === 3) {
    html += '<button type="button" class="pim-kickban-btn" onclick="window._adminBanPlayer(' + pid + ')" '
          + 'style="display:block;width:100%;margin-top:8px;padding:8px 0;border:1px solid var(--danger,#e05050);border-radius:8px;cursor:pointer;background:transparent;color:var(--danger,#e05050);font-weight:600">'
          + '🔨 ' + esc(tt('piKickban', 'Total kickban')) + '</button>';
  }
  return html;
}

// Bloc stats du popup de profil — mêmes onglets que le panneau en jeu :
// SESSION (toujours) / TOTAL (à vie, + bouton reset) / CLASSEMENT (proxy).
// Les onglets TOTAL et CLASSEMENT n'apparaissent qu'en mode réseau (LAN +
// serveur privé, S._statsEligible) : sur pokerth.net direct, seul SESSION.
// Réutilise _statsBodySession / _statsBodyLife / renderBoard pour rester
// strictement identique au jeu (y compris le reset).
function _pimSetTab(tab) { S._pimTab = tab; _renderProfileStats(); }

function _renderProfileStats() {
  var box = document.getElementById('pim-stats');
  if (!box) return;
  var eligible = S._statsEligible;
  var board    = S._boardEligible;
  if (!eligible && S._pimTab !== 'session') S._pimTab = 'session';
  if (!board && S._pimTab === 'board') S._pimTab = 'session';
  function tb(id, label) {
    return '<button class="stats-tab'+(S._pimTab===id?' active':'')+'" onclick="window._pimSetTab(\''+id+'\')">'+label+'</button>';
  }
  var tabs = eligible
    ? '<div class="stats-tabs">'+tb('session',t('statTabSession'))+tb('life',t('statTabLife'))
      + (board ? tb('board',t('statTabBoard')) : '') + '</div>'
    : '';
  var body;
  if (S._pimTab === 'life')       body = window._statsBodyLife();
  else if (S._pimTab === 'board') body = '<div id="pim-board-body" class="stats-body"><div class="stat-empty">…</div></div>';
  else                          body = window._statsBodySession();
  box.innerHTML = tabs + body;
  if (S._pimTab === 'board') window.renderBoard('pim-board-body');
}

function closePlayerInfoPopup() {
  var modal = document.getElementById('player-info-modal');
  if (modal) modal.style.display = 'none';
}

// Coupes à la demande : appelé par le bouton « Voir les coupes » du popup.
// Masque le bouton et lance le chargement (3 requêtes /api/player) une seule
// fois, sur action explicite — jamais en automatique à l'ouverture.
function _pimLoadCups(pid) {
  var btn = document.getElementById('pim-cups-btn');
  if (btn) btn.style.display = 'none';
  if (document.getElementById('pim-cups') && typeof window.rkLoadPlayerCups === 'function') {
    try { window.rkLoadPlayerCups(window.getPlayerName(pid), 'pim-cups'); } catch(e) {}
  }
}
window._pimLoadCups = _pimLoadCups;

// ──────────────────────────────────────────────────────────────
// Open the existing avatar-popup as a floating modal, from the
// lobby (i.e. from inside the player-info modal). Difference vs
// the connect-screen behaviour: we add .avatar-popup-as-modal so
// the CSS positions it fixed/centered with a backdrop, and we
// hook a one-shot click handler to close everything once the
// user picks an avatar.
// ──────────────────────────────────────────────────────────────
// Track where the popup originally lived so we can put it back when
// the user is done. The popup is statically defined inside #s-connect
// (so the connect-screen avatar trigger can use it in flow), but when
// we open it from the lobby #s-connect is display:none which would
// hide the popup along with all its other descendants. So we move
// the popup to <body> while showing it as a modal, then move it back.

function openAvatarPickerFromLobby(opts) {
  var picker = document.getElementById('avatar-popup');
  if (!picker) return;
  // Remember the original location so closeAvatarPickerFromLobby
  // can put the popup back exactly where it was.
  if (!S._avatarPopupOrigParent) {
    S._avatarPopupOrigParent = picker.parentNode;
    S._avatarPopupOrigNextSibling = picker.nextSibling;
  }
  // Detach + re-attach to body so the parent's display:none can't
  // hide us. We do this every open in case the DOM was changed by
  // something else in between.
  if (picker.parentNode !== document.body) {
    document.body.appendChild(picker);
  }
  picker.classList.add('avatar-popup-as-modal');
  picker.style.display = 'block';
  // Apply the default/saved emoji category so the grid is filtered
  // (otherwise every category's emojis would show at once on first
  // open from the lobby). avpApplyDefaultCat is defined in the HTML
  // <head> script; guard in case of load-order differences.
  try { if (typeof window.avpApplyDefaultCat === 'function') window.avpApplyDefaultCat(); } catch(e) {}
  // Close-on-backdrop: a click on the popup background (NOT on any
  // child like the avatar buttons or the header) closes the picker.
  S._avatarPickerBackdropHandler = function(e) {
    if (e.target === picker) {
      closeAvatarPickerFromLobby();
    }
  };
  picker.addEventListener('click', S._avatarPickerBackdropHandler);
  // When the user picks an avatar, the existing selectAvatarPopup()
  // (attached as an inline onclick on each .avp-btn) sets the popup's
  // inline display:'none'. We piggy-back on that to also strip the
  // modal class and put the popup back in its original place. Using
  // capture phase + once:true so we run exactly once before the
  // onclick attribute fires (or right after, both are fine here).
  S._avatarPickerBtnHandler = function(e) {
    var btn = e.target.closest('.avp-btn');
    if (!btn) return;
    // Let the inline onclick run first (it saves + closes), then
    // we clean up and refresh on the next tick.
    setTimeout(function() {
      closeAvatarPickerFromLobby();
      // Depuis le lobby : rouvrir la fiche joueur + rafraîchir la pastille.
      // Depuis le login (opts.onPicked fourni) : ne rien rouvrir de lobby.
      if (opts && typeof opts.onPicked === 'function') { opts.onPicked(); }
      else { openPlayerInfoPopup(); window.updateLobbyPill(); }
    }, 0);
  };
  picker.addEventListener('click', S._avatarPickerBtnHandler, { once: true, capture: true });
}

function closeAvatarPickerFromLobby() {
  var picker = document.getElementById('avatar-popup');
  if (!picker) return;
  picker.classList.remove('avatar-popup-as-modal');
  picker.style.display = 'none';
  // Detach our backdrop handler. The btn handler is once:true, but it is
  // only consumed when an avatar is actually clicked — closing via the
  // backdrop (or the X) leaves it attached, so repeated open/close cycles
  // would stack dangling capture handlers. Remove it here too (matching the
  // capture flag it was added with). removeEventListener is a no-op if it
  // already fired.
  if (S._avatarPickerBackdropHandler) {
    picker.removeEventListener('click', S._avatarPickerBackdropHandler);
    S._avatarPickerBackdropHandler = null;
  }
  if (S._avatarPickerBtnHandler) {
    picker.removeEventListener('click', S._avatarPickerBtnHandler, { capture: true });
    S._avatarPickerBtnHandler = null;
  }
  // Put the popup back into its original parent so the connect
  // screen's static layout keeps working.
  if (S._avatarPopupOrigParent && picker.parentNode !== S._avatarPopupOrigParent) {
    if (S._avatarPopupOrigNextSibling && S._avatarPopupOrigNextSibling.parentNode === S._avatarPopupOrigParent) {
      S._avatarPopupOrigParent.insertBefore(picker, S._avatarPopupOrigNextSibling);
    } else {
      S._avatarPopupOrigParent.appendChild(picker);
    }
  }
}

export { _pthAvatarFor, _myAvatarDisplay, _myAvatarToBroadcast, _avatarChipHtml,
         _ccToFlag, openPlayerInfoPopup, _otherPlayerInfoHtml, _pimSetTab,
         _renderProfileStats, closePlayerInfoPopup, _pimLoadCups,
         openAvatarPickerFromLobby, closeAvatarPickerFromLobby };

for (const [k, v] of Object.entries({ _pthAvatarFor, _myAvatarDisplay,
  _myAvatarToBroadcast, _avatarChipHtml, _ccToFlag, openPlayerInfoPopup,
  _otherPlayerInfoHtml, _pimSetTab, _renderProfileStats, closePlayerInfoPopup,
  _pimLoadCups, openAvatarPickerFromLobby, closeAvatarPickerFromLobby }))
  window[k] = v;
