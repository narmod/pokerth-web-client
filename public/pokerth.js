// [Phase 2] audio (AudioContext, playTone, notify*, toggleSound) moved to public/modules/sounds.mjs

// ══ i18n ══
// [Phase 2] i18n moved to public/modules/i18n.mjs (LANG, _lang, t)
function _startIpBlockCountdown() {
  // Met à jour le statut toutes les secondes avec le temps restant
  var _blockInterval = setInterval(function() {
    var rem = Math.max(0, Math.ceil((_ipBlockUntil - Date.now()) / 1000));
    var mins = Math.floor(rem / 60), secs = rem % 60;
    var txt = '⏳ IP bloquée — ' + (mins > 0 ? mins + 'min ' : '') + secs + 's';
    // Mettre à jour seulement si on est sur l'écran de connexion
    var cs = document.getElementById('cstatus');
    if (cs) cs.textContent = rem > 0 ? txt : '✅ Vous pouvez vous reconnecter.';
    if (rem <= 0) {
      clearInterval(_blockInterval);
      _ipBlockUntil = 0;
      var cs2 = document.getElementById('cstatus');
      if (cs2) { cs2.textContent = '✅ Vous pouvez vous reconnecter.'; cs2.className = 'status ok'; }
    }
  }, 1000);
}

function _showBanner(msg) {
  var b = document.getElementById('reconnect-banner');
  var m = document.getElementById('reconnect-msg');
  if (b) b.classList.add('visible');
  if (m) m.textContent = msg;
}
function _hideBanner() {
  var b = document.getElementById('reconnect-banner');
  if (b) b.classList.remove('visible');
}

// ═══════════════════════════════════════════════════════════
// ANIMATIONS DE JEU
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// NOUVELLES ANIMATIONS
// ═══════════════════════════════════════════════════════════

var _prevDealerPid = -1;

// Confetti rain
function launchConfetti(count) {
  var colors = ['#f0c040','#e74c3c','#3498db','#2ecc71','#9b59b6','#ff8c42','#fff'];
  var shapes = ['▲','●','■','♠','♥','♦','♣'];
  count = count || 60;
  for (var i = 0; i < count; i++) {
    (function(i) {
      setTimeout(function() {
        var el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.width  = (8 + Math.random() * 8) + 'px';
        el.style.height = (8 + Math.random() * 8) + 'px';
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        el.style.animationDuration = (2.5 + Math.random() * 2) + 's';
        el.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(el);
        setTimeout(function(){ el.remove(); }, 5000);
      }, i * 35);
    })(i);
  }
}

// Transition lobby → table
function animateTableEnter() {
  var sg = document.getElementById('s-game');
  if (!sg) return;
  sg.classList.remove('entering');
  void sg.offsetWidth;
  sg.classList.add('entering');
  setTimeout(function(){ sg.classList.remove('entering'); }, 500);
}

// Urgence timer (≤5s)
function setUrgentMode(active) {
  var sg = document.getElementById('s-game');
  if (sg) sg.classList.toggle('urgent', active);
}

// Élimination joueur
function animatePlayerEliminated(pid) {
  // Cibler le siège via data-pid (fiable même si deux joueurs ont la même initiale)
  var seatEl = document.querySelector('#g-seats [data-pid="' + pid + '"]');
  if (seatEl) {
    seatEl.classList.add('eliminated');
    setTimeout(function(){ seatEl.classList.remove('eliminated'); }, 900);
  }
}

// Pot énorme
function updatePotSize(potVal) {
  var maxStack = 3000; // valeur par défaut
  if (window.seats && window.seats.length > 0) {
    maxStack = Object.values(window.seatData || {})
      .reduce(function(acc, sd){ return Math.max(acc, (sd.money||0) + (sd.bet||0)); }, 3000);
  }
  var threshold = maxStack * 0.6;
  var el1 = document.getElementById('g-pot');
  var el2 = document.getElementById('g-potbar');
  [el1, el2].forEach(function(el) {
    if (!el) return;
    el.classList.toggle('pot-huge', potVal > threshold && potVal > 500);
  });
}

// Dealer badge volant
function animateDealerMove(fromPid, toPid) {
  if (fromPid < 0 || fromPid === toPid) return;
  // Trouver les positions des sièges
  var seatEls = document.querySelectorAll('.seat');
  var fromEl = null, toEl = null;
  // Utiliser les coords absolues des sièges
  // On crée le badge volant depuis la position du dealer précédent
  var allSeats = Array.from(seatEls);
  // Tenter de localiser par ordre dans rotated
  var fromIdx = -1, toIdx = -1;
  if (window.seats) {
    var myIdx = window.seats.indexOf(window.myId || -1);
    var rotated = myIdx >= 0
      ? window.seats.slice(myIdx).concat(window.seats.slice(0, myIdx))
      : window.seats;
    fromIdx = rotated.indexOf(fromPid);
    toIdx   = rotated.indexOf(toPid);
  }
  if (fromIdx < 0 || toIdx < 0 || !allSeats[fromIdx] || !allSeats[toIdx]) return;
  var fr = allSeats[fromIdx].getBoundingClientRect();
  var tr = allSeats[toIdx].getBoundingClientRect();

  var badge = document.createElement('div');
  badge.className = 'dealer-badge-fly';
  badge.textContent = 'D';
  badge.style.left = (fr.left + fr.width/2 - 9) + 'px';
  badge.style.top  = (fr.top  + fr.height/2 - 9) + 'px';
  document.body.appendChild(badge);

  requestAnimationFrame(function() { requestAnimationFrame(function() {
    badge.style.left = (tr.left + tr.width/2 - 9) + 'px';
    badge.style.top  = (tr.top  + tr.height/2 - 9) + 'px';
    setTimeout(function(){ badge.remove(); }, 900);
  }); });
}

// All-in chips explosion
function animateAllIn(fromPid) {
  var seatEls = document.querySelectorAll('.seat');
  if (window.seats) {
    var myIdx = window.seats.indexOf(window.myId || -1);
    var rotated = myIdx >= 0
      ? window.seats.slice(myIdx).concat(window.seats.slice(0, myIdx))
      : window.seats;
    var idx = rotated.indexOf(fromPid);
    if (idx < 0 || !seatEls[idx]) return;
    var sr = seatEls[idx].getBoundingClientRect();
    var sx = sr.left + sr.width/2;
    var sy = sr.top + sr.height/2;
    var colors = ['#f0c040','#c8a820','#ffe066','#b8960c'];
    for (var i = 0; i < 12; i++) {
      (function(i) {
        var el = document.createElement('div');
        el.className = 'allin-chip';
        var angle = (i / 12) * Math.PI * 2;
        var d1 = 40 + Math.random() * 30;
        var d2 = 80 + Math.random() * 60;
        el.style.setProperty('--ax', Math.cos(angle)*d1 + 'px');
        el.style.setProperty('--ay', Math.sin(angle)*d1 + 'px');
        el.style.setProperty('--bx', Math.cos(angle)*d2 + 'px');
        el.style.setProperty('--by', Math.sin(angle)*d2 + 'px');
        el.style.setProperty('--ar', (Math.random()*360) + 'deg');
        el.style.background = colors[i % colors.length];
        el.style.left = sx + 'px';
        el.style.top  = sy + 'px';
        el.style.animationDelay = (i * 0.03) + 's';
        document.body.appendChild(el);
        setTimeout(function(){ el.remove(); }, 1000);
      })(i);
    }
  }
}

// Reset fade des actions entre mains
function fadeOutAllActions() {
  document.querySelectorAll('.seat-action-label').forEach(function(el) {
    el.classList.add('fading');
    setTimeout(function(){ el.classList.remove('fading'); el.textContent = ''; }, 450);
  });
}

// Showdown — flip cartes adversaires
function animateShowdownCards() {
  var delay = 0;
  document.querySelectorAll('.seat:not(.me) .pk.xsm').forEach(function(el) {
    el.classList.remove('pk-showdown');
    void el.offsetWidth;
    el.style.animationDelay = (delay) + 's';
    el.classList.add('pk-showdown');
    delay += 0.12;
  });
}

// Thinking dots (remplace le texte "réfléchit")
function thinkingHtml(name) {
  return name + '<span class="thinking-dots"><span></span><span></span><span></span></span>';
}


// Explosion d'étoiles sur victoire
function burstStars(x, y, count) {
  count = count || 12;
  var emojis = ['⭐','✨','🌟','💫','🎉','🃏','💰'];
  for (var i = 0; i < count; i++) {
    (function(i) {
      setTimeout(function() {
        var el = document.createElement('div');
        el.className = 'win-star';
        var angle = (i / count) * 360 * Math.PI / 180;
        var dist = 80 + Math.random() * 120;
        var tx = Math.cos(angle) * dist + 'px';
        var ty = Math.sin(angle) * dist + 'px';
        var rot = (Math.random() * 720 - 360) + 'deg';
        el.style.setProperty('--tx', tx);
        el.style.setProperty('--ty', ty);
        el.style.setProperty('--rot', rot);
        el.style.left = (x || window.innerWidth/2) + 'px';
        el.style.top  = (y || window.innerHeight * 0.4) + 'px';
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        document.body.appendChild(el);
        setTimeout(function(){ el.remove(); }, 1300);
      }, i * 55);
    })(i);
  }
}

// Animation pot (bump visuel quand le pot augmente)
function animatePot(newVal) {
  var els = [document.getElementById('g-pot'), document.getElementById('g-potbar')];
  els.forEach(function(el) {
    if (!el) return;
    el.classList.remove('pot-bump');
    void el.offsetWidth; // reflow
    el.classList.add('pot-bump');
    setTimeout(function(){ el.classList.remove('pot-bump'); }, 400);
  });
}

// Activer/désactiver l'animation "mon tour" sur my-zone
function setMyTurnActive(active) {
  var mz = document.querySelector('.my-zone');
  if (!mz) return;
  if (active) mz.classList.add('my-turn-active');
  else mz.classList.remove('my-turn-active');
}

// Animation des cartes de ma main (deal)
function animateDealMyCards() {
  var pb = document.getElementById('g-myseat-cards');
  if (!pb) return;
  pb.querySelectorAll('.pk').forEach(function(el) {
    el.classList.remove('pk-deal');
    void el.offsetWidth;
    el.classList.add('pk-deal');
  });
}

// Flash sur une action (badge seat)
function flashActionLabel(pid) {
  var seats = document.querySelectorAll('.seat');
  seats.forEach(function(s) {
    var lbl = s.querySelector('.seat-action-label');
    if (lbl) {
      lbl.classList.remove('flash');
      void lbl.offsetWidth;
      lbl.classList.add('flash');
    }
  });
}



// isBot/getPlayerInitial/getPlayerTypeBadge → déplacées dans la closure (voir renderSeats)

// Palette de couleurs pour les avatars joueurs (12 couleurs)
var AVATAR_PALETTE = [
  { bg: '#c0392b', border: '#e74c3c', text: '#fff' }, // rouge
  { bg: '#2471a3', border: '#3498db', text: '#fff' }, // bleu
  { bg: '#1e8449', border: '#27ae60', text: '#fff' }, // vert
  { bg: '#d68910', border: '#f39c12', text: '#fff' }, // orange
  { bg: '#7d3c98', border: '#9b59b6', text: '#fff' }, // violet
  { bg: '#1a5276', border: '#2980b9', text: '#fff' }, // bleu foncé
  { bg: '#a04000', border: '#ca6f1e', text: '#fff' }, // brun
  { bg: '#117a65', border: '#1abc9c', text: '#fff' }, // turquoise
  { bg: '#943126', border: '#c0392b', text: '#fff' }, // bordeaux
  { bg: '#1f618d', border: '#2e86c1', text: '#fff' }, // cobalt
  { bg: '#616a6b', border: '#95a5a6', text: '#fff' }, // gris
  { bg: '#b7950b', border: '#d4ac0d', text: '#fff' }, // or
];
function getAvatarColor(pid) {
  return AVATAR_PALETTE[Math.abs(pid || 0) % AVATAR_PALETTE.length];
}


// ═══════════════════════════════════════════════════════════
// RACCOURCIS CLAVIER
// F=Fold  C/Space=Call/Check  R=Raise  A=All-in  Esc=annule
// ═══════════════════════════════════════════════════════════
document.addEventListener('keydown', function(e) {
  // Ne pas intercepter si on tape dans un input/textarea
  var tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
  // Seulement en jeu et si c'est mon tour
  if (typeof amInGame === 'undefined' || !amInGame) return;
  if (typeof turnPid !== 'undefined' && turnPid !== myId) return;

  var key = e.key.toLowerCase();

  if (key === 'f') {
    // Fold
    var btn = document.querySelector('.btn-fold:not([disabled])');
    if (btn) { e.preventDefault(); btn.click(); showKeyHint('F — Fold'); }
  } else if (key === 'c' || key === ' ') {
    // Call ou Check
    e.preventDefault();
    var btn = document.querySelector('.btn-call:not([disabled]), .btn-check:not([disabled])');
    if (btn) { btn.click(); showKeyHint(btn.classList.contains('btn-check') ? 'C — Check' : 'C — Call'); }
  } else if (key === 'r') {
    // Raise — focus sur l'input
    var inp = document.getElementById('raise-amt');
    var btn = document.querySelector('.btn-raise:not([disabled])');
    if (inp && !inp.disabled) {
      e.preventDefault();
      if (window.innerWidth >= 640) {
        inp.focus(); inp.select();
        showKeyHint('R — Raise (ajustez le montant)');
      } else if (btn) {
        btn.click(); showKeyHint('R — Raise');
      }
    }
  } else if (key === 'a') {
    // All-in
    var btn = document.querySelector('.btn-allin:not([disabled])');
    if (btn) { e.preventDefault(); btn.click(); showKeyHint('A — All-In'); }
  } else if (key === 'enter') {
    // Confirmer la relance si l'input est focusé
    var inp = document.getElementById('raise-amt');
    if (document.activeElement === inp) {
      e.preventDefault();
      var btn2 = document.querySelector('.btn-raise:not([disabled])');
      if (btn2) btn2.click();
    }
  }
});

// Petit toast d'indication du raccourci
function showKeyHint(text) {
  var existing = document.getElementById('key-hint');
  if (existing) existing.remove();
  var el = document.createElement('div');
  el.id = 'key-hint';
  el.textContent = '⌨ ' + text;
  el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);' +
    'background:rgba(200,168,74,0.9);color:#1a0a00;padding:5px 14px;border-radius:20px;' +
    'font-family:monospace;font-size:0.75rem;font-weight:700;z-index:999;' +
    'animation:fadeIn 0.15s ease;pointer-events:none;';
  document.body.appendChild(el);
  setTimeout(function(){ el.style.opacity='0'; el.style.transition='opacity 0.4s'; setTimeout(function(){ el.remove(); }, 400); }, 1200);
}


// Rafraîchit immédiatement l'avatar du joueur local dans l'UI
window.refreshMyAvatar = function() {
  // Resolve which avatar to use for ME (the local player).
  // Step 4 introduced a 3-way choice stored in localStorage.pth_avatar:
  //   '__pth__'  -> use the official PokerTH avatar image
  //   ''         -> use the initial letter
  //   anything else (e.g. '🦊') -> use that emoji
  // First-login auto-pick (Q2=c): if the user never expressed a choice
  // (key missing from localStorage, NOT just empty) AND we already have a
  // PokerTH avatar downloaded, default to the official one. Once the user
  // makes any selection in the popup, this auto-pick stops kicking in.
  var pthUrl = (typeof window._pthAvatarFor === 'function' && typeof myId !== 'undefined')
    ? window._pthAvatarFor(myId)
    : null;
  var stored = null;
  try { stored = localStorage.getItem('pth_avatar'); } catch(e) {}
  if (stored === null && pthUrl) {
    // First-login auto-pick: persist the sentinel.
    try { localStorage.setItem('pth_avatar', '__pth__'); } catch(e) {}
    stored = '__pth__';
    // Reflect the choice on the trigger and selected button if the popup
    // already exists. Safe no-ops if elements aren't there yet.
    var btnPth = document.getElementById('avp-btn-pth');
    if (btnPth) {
      btnPth.style.display = '';
      document.querySelectorAll('.avp-btn').forEach(function(b){
        b.classList.toggle('selected', b.dataset.av === '__pth__');
      });
    }
    var trig = document.getElementById('av-trigger');
    if (trig) {
      // Match the head selectAvatarPopup behaviour: trigger shows the
      // PokerTH chip logo, not the id-card emoji.
      trig.innerHTML = '<img src="/img/pokerth-logo.png" alt="PokerTH" draggable="false" style="width:26px;height:26px;object-fit:contain;pointer-events:none">';
      trig.classList.add('has-avatar');
    }
  }
  // Effective choice: 'pth' | 'initial' | 'emoji-xxx'
  var usePth   = (stored === '__pth__') && !!pthUrl;
  var emojiAv  = (stored && stored !== '__pth__') ? stored : '';
  var av = emojiAv; // back-compat var name used in the rest of the function
  _myAvatarCache = av;
  var display = av || (typeof myName !== 'undefined' ? (myName||'').charAt(0).toUpperCase() : '?');
  // Player-bar
  var pbAv = document.getElementById('g-myseat-av');
  if (pbAv) {
    if (usePth) {
      pbAv.innerHTML = '<img class="pb-pth-img" src="' + pthUrl + '" alt="" draggable="false">';
      pbAv.classList.add('has-pth-avatar');
    } else if (stored === '__pth__') {
      // Q2=b: user picked the PokerTH avatar but no image is available
      // (e.g. they're a LAN player, or a pokerth.net guest, or the
      // avatar hasn't been downloaded yet). Show the official PokerTH
      // chip logo as a graceful placeholder instead of an initial.
      pbAv.innerHTML = '<img class="pb-pth-img" src="/img/pokerth-logo.png" alt="" draggable="false">';
      pbAv.classList.add('has-pth-avatar');
    } else {
      pbAv.textContent = display;
      pbAv.classList.remove('has-pth-avatar');
    }
  }
  // Siège autour de la table
  var seatEls = document.querySelectorAll('#g-seats .seat');
  seatEls.forEach(function(seat) {
    if (seat.classList.contains('me')) {
      var avatarEl = seat.querySelector('.seat-avatar');
      if (!avatarEl) return;
      var img = avatarEl.querySelector('.seat-pth-img');
      // Decide which URL to use, in order of preference:
      //   1) the player's actual downloaded pokerth.net avatar
      //   2) the PokerTH chip logo (placeholder if the user picked
      //      '__pth__' but nothing is available yet -- Q2=b)
      //   3) nothing (fall back to emoji or initial)
      var effectiveUrl = usePth ? pthUrl
                       : (stored === '__pth__' ? '/img/pokerth-logo.png' : null);
      if (effectiveUrl) {
        if (!img) {
          img = document.createElement('img');
          img.className = 'seat-pth-img';
          img.draggable = false;
          img.alt = '';
          avatarEl.insertBefore(img, avatarEl.firstChild);
        }
        if (img.getAttribute('src') !== effectiveUrl) img.src = effectiveUrl;
        avatarEl.classList.add('has-pth-avatar');
      } else {
        if (img) img.remove();
        avatarEl.classList.remove('has-pth-avatar');
      }
      var ini = avatarEl.querySelector('.seat-initial');
      if (ini) ini.textContent = display;
      if (av) avatarEl.classList.add('emoji-av');
      else avatarEl.classList.remove('emoji-av');
    }
  });
  // Option (i): the PokerTH button stays visible in the popup at all
  // times (even before connect / for LAN users). If the user clicks it
  // but no avatar is ever downloaded, usePth ends up false (because the
  // && !!pthUrl guard above) and the rendering falls back gracefully to
  // the initial. This makes the popup behave consistently across all
  // login modes and lets users pre-pick "PokerTH avatar" before they
  // even connect.
};

window.toggleAvatarPopup = function() {
  var popup = document.getElementById('avatar-popup');
  if (!popup) return;
  var open = popup.style.display === 'none' || popup.style.display === '';
  popup.style.display = open ? 'block' : 'none';
};

// selectAvatarPopup() lives in the <head> of pokerth-client.html. It
// must be defined inline so that buttons with onclick="selectAvatarPopup()"
// in the connect screen can call it before pokerth.js has loaded. A
// duplicate copy used to live here; it shadowed the head version and
// didn't know about the '__pth__' sentinel, leading to the visible
// '__pth__' string leaking into the trigger button. Removed.

// [Phase 2] toggleLang moved to public/modules/i18n.mjs (still global via window.toggleLang)

// ═══════════════════════════════════════════════════════════
// ÉVALUATEUR DE MAIN POKER — Texas Hold'em
// Cards encodées 0-51 : suit=floor(n/13), rank=n%13
// ranks: 0=2 … 12=A  |  suits: 0=♦ 1=♣ 2=♠ 3=♥
// ═══════════════════════════════════════════════════════════
function _getCombos(arr, k) {
  if (k === arr.length) return [arr.slice()];
  if (k === 1) return arr.map(function(x){ return [x]; });
  var res = [];
  for (var i = 0; i <= arr.length - k; i++) {
    var rest = _getCombos(arr.slice(i+1), k-1);
    for (var j = 0; j < rest.length; j++) res.push([arr[i]].concat(rest[j]));
  }
  return res;
}

function _evalFive(cards) {
  var RANK_NAMES = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  var ranks = cards.map(function(c){ return c % 13; }).sort(function(a,b){ return b-a; });
  var suits = cards.map(function(c){ return Math.floor(c/13); });
  var isFlush = suits.every(function(s){ return s === suits[0]; });
  var rankSet = ranks.filter(function(v,i,a){ return a.indexOf(v)===i; }).sort(function(a,b){return b-a;});
  var isStraight = false, straightHigh = ranks[0];
  if (rankSet.length === 5) {
    if (ranks[0] - ranks[4] === 4) { isStraight = true; straightHigh = ranks[0]; }
    // Roue : A-2-3-4-5
    else if (ranks[0]===12 && ranks[1]===3 && ranks[2]===2 && ranks[3]===1 && ranks[4]===0) {
      isStraight = true; straightHigh = 3;
    }
  }
  var counts = {};
  ranks.forEach(function(r){ counts[r] = (counts[r]||0)+1; });
  var freq = Object.values(counts).sort(function(a,b){return b-a;});
  var byFreq = Object.keys(counts).map(Number).sort(function(a,b){
    return counts[b]!==counts[a] ? counts[b]-counts[a] : b-a;
  });
  var top = byFreq[0];
  var top2 = byFreq[1];
  var rn = RANK_NAMES;
  if (isFlush && isStraight) {
    if (straightHigh===12) return { r:9, fr:'⭐ Quinte Flush Royale', en:'⭐ Royal Flush' };
    return { r:8, fr:'🃏 Quinte Flush '+rn[straightHigh], en:'🃏 Straight Flush '+rn[straightHigh] };
  }
  if (freq[0]===4) return { r:7, fr:'🟥 Carré '+rn[top], en:'🟥 Four '+rn[top]+'s' };
  if (freq[0]===3 && freq[1]===2) return { r:6, fr:'🔴 Full '+rn[top]+'/'+rn[top2], en:'🔴 Full House '+rn[top]+'/'+rn[top2] };
  if (isFlush) return { r:5, fr:'🟠 Couleur', en:'🟠 Flush' };
  if (isStraight) return { r:4, fr:'🟡 Suite '+rn[straightHigh], en:'🟡 Straight '+rn[straightHigh] };
  if (freq[0]===3) return { r:3, fr:'🟢 Brelan '+rn[top], en:'🟢 Three '+rn[top]+'s' };
  if (freq[0]===2 && freq[1]===2) {
    var p1=rn[top], p2=rn[top2];
    return { r:2, fr:'🔵 Deux paires '+p1+'/'+p2, en:'🔵 Two Pair '+p1+'/'+p2 };
  }
  if (freq[0]===2) return { r:1, fr:'⚪ Paire '+rn[top], en:'⚪ Pair of '+rn[top]+'s' };
  return { r:0, fr:'— Carte haute '+rn[ranks[0]], en:'— High Card '+rn[ranks[0]] };
}

// Encodage PokerTH UNIQUE pour toutes les cartes (0-indexé, 0..51) :
//   suit=['♦','♥','♠','♣'] → ♦=0, ♥=1, ♠=2, ♣=3
//   rank=['2','3',…,'K','A'] → 0..12
// Vérifié sur les assets PNG officiels (data/gfx/cards/default/*.png) :
//   0=2♦  12=A♦  13=2♥  25=A♥  26=2♠  38=A♠  39=2♣  51=A♣
// normalizeHoleCard() est désormais l'identité (validation seule).

// ═══════════════════════════════════════════════════════════
// RÉACTIONS RAPIDES
// ═══════════════════════════════════════════════════════════
var _reactionCounts = {}; // { emoji: count }
var _reactionTimers = {}; // timers de reset des compteurs

// Affiche un emoji flottant qui monte depuis le bas de l'écran
function showFloatingReaction(emoji, fromX, fromY) {
  var el = document.createElement('div');
  el.className = 'floating-reaction';
  el.textContent = emoji;
  // Position de départ : bas de l'écran, position aléatoire si pas de coords
  var x = fromX || (window.innerWidth * 0.3 + Math.random() * window.innerWidth * 0.4);
  var y = fromY || (window.innerHeight * 0.75);
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  document.body.appendChild(el);
  setTimeout(function(){ el.remove(); }, 2400);
}

// Affiche la réaction sur l'avatar du joueur dans les sièges
function showSeatReaction(pid, emoji) {
  var seatEls = document.querySelectorAll('.seat');
  if (!window.seats) return;
  var myIdx = seats.indexOf(myId);
  var rotated = myIdx >= 0
    ? seats.slice(myIdx).concat(seats.slice(0, myIdx))
    : seats;
  var idx = rotated.indexOf(pid);
  if (idx < 0 || !seatEls[idx]) return;
  var existing = seatEls[idx].querySelector('.seat-reaction');
  if (existing) existing.remove();
  var badge = document.createElement('div');
  badge.className = 'seat-reaction';
  badge.textContent = emoji;
  seatEls[idx].style.overflow = 'visible';
  seatEls[idx].appendChild(badge);
  setTimeout(function(){ if (badge.parentNode) badge.remove(); }, 2700);
  // Position pour l'animation flottante
  var sr = seatEls[idx].getBoundingClientRect();
  showFloatingReaction(emoji, sr.left + sr.width/2, sr.top);
}

// Mettre à jour les compteurs affichés sur les boutons
function updateReactionCount(emoji) {
  var EMOJIS = ["🎉", "🥳", "👏", "🙌", "💪", "🤣", "😂", "😬", "🤦", "😴", "👍", "😎", "🤩", "👀", "🤔", "😱", "😡", "😤", "🔥", "😮", "💰", "💎", "🎰", "🍀", "🃏", "💀", "🤑", "🫵", "🫡", "🤫"];
  var idx = EMOJIS.indexOf(emoji);
  if (idx < 0) return;
  var count = _reactionCounts[emoji] || 0;
  // Mettre à jour dans le panneau principal (rcp-N)
  var el = document.getElementById('rcp-' + idx);
  if (el) el.textContent = count > 0 ? count : '';
  // Ancien panneau chat (rc-N) si encore présent
  var el2 = document.getElementById('rc-' + idx);
  if (el) el.textContent = count > 0 ? count : '';
  // Reset après 6 secondes d'inactivité
  clearTimeout(_reactionTimers[emoji]);
  _reactionTimers[emoji] = setTimeout(function() {
    _reactionCounts[emoji] = 0;
    if (el) el.textContent = '';
  }, 6000);
}

// Recevoir une réaction d'un autre joueur (via chat).
// IMPORTANT: the proxy broadcasts REACT:pid:emoji messages to EVERY
// connected client, regardless of which table they sit at. Until we
// route reactions through the actual PokerTH game-chat (which is
// table-scoped), we filter here client-side: if the sender is not at
// our table, ignore the reaction completely — no counter increment,
// no seat badge, no sound. Without this filter, reactions from another
// table would silently bump our counters and play the `playTone` chime,
// which is what the user reported hearing.
function handleIncomingReaction(pid, emoji) {
  if (!window.seats || seats.indexOf(pid) < 0) return;
  _reactionCounts[emoji] = (_reactionCounts[emoji] || 0) + 1;
  updateReactionCount(emoji);
  showSeatReaction(pid, emoji);
  // Notif sonore légère
  if (typeof playTone === 'function') playTone(800, 0.05, 0.08);
}



// ═══════════════════════════════════════════════════════════
// FORCE DE MAIN PRÉ-FLOP
// Encodage hole cards : si=floor(n/13) ♣=0♠=1♥=2♦=3, ri=n%13 2=0..A=12
// ═══════════════════════════════════════════════════════════
function evaluatePreFlopHand(c1, c2) {
  if (c1 == null || c2 == null) return null;
  var r1 = c1 % 13, r2 = c2 % 13;
  var s1 = Math.floor(c1 / 13), s2 = Math.floor(c2 / 13);
  var hi = Math.max(r1, r2), lo = Math.min(r1, r2);
  var isPair    = r1 === r2;
  var isSuited  = s1 === s2;
  var gap       = hi - lo; // 0=pair, 1=connected, 2=1-gap, etc.

  // ─ Premium ★★★
  if (isPair && hi >= 10) // AA KK QQ JJ TT
    return { stars: 3, fr: 'Main premium', en: 'Premium hand',
             detail_fr: ['AA','KK','QQ','JJ','TT'][12-hi] + (hi>=10?'':' ') };
  if (hi===12 && lo===11) // AK
    return { stars: 3, fr: isSuited ? 'AK couleur ★★★' : 'AK bicolore ★★★', en: isSuited?'AKs Premium':'AKo Premium' };

  // ─ Très bonnes ★★☆
  if (isPair && hi >= 7) // 77 88 99
    return { stars: 2, fr: 'Paire intermédiaire', en: 'Mid pair' };
  if (hi===12 && lo>=9 && isSuited) // AQs AJs ATs
    return { stars: 2, fr: 'As couleur fort', en: 'Strong suited Ace' };
  if (hi===12 && lo>=9) // AQ AJ AT
    return { stars: 2, fr: 'As fort', en: 'Strong Ace' };
  if (hi===11 && lo===10 && isSuited) // KQs
    return { stars: 2, fr: 'KQ couleur', en: 'KQs' };
  if (hi===11 && lo===10) // KQ
    return { stars: 2, fr: 'KQ', en: 'KQo' };

  // ─ Bonnes ★☆☆
  if (isPair && hi >= 4) // 44 55 66
    return { stars: 1, fr: 'Petite paire', en: 'Small pair' };
  if (isSuited && gap === 1 && lo >= 7) // connecteurs couleur hauts
    return { stars: 1, fr: 'Connecteurs couleur', en: 'Suited connectors' };
  if (isSuited && hi >= 10 && lo >= 8)
    return { stars: 1, fr: 'Deux cartes hautes couleur', en: 'Suited broadways' };
  if (hi===12 && lo >= 6) // As faible
    return { stars: 1, fr: 'As avec kicker', en: 'Ace with kicker' };

  // ─ Moyennes — connecteurs
  if (gap <= 2 && lo >= 5 && isSuited)
    return { stars: 0, fr: 'Connecteurs couleur', en: 'Suited connectors' };
  if (gap <= 1 && lo >= 4)
    return { stars: 0, fr: 'Connecteurs', en: 'Connectors' };

  // ─ Faibles
  return { stars: -1, fr: 'Main faible', en: 'Weak hand' };
}



function normalizeHoleCard(n) {
  // FIX 2024-XX : suppression du remap suits → l'encodage est UNIQUE pour
  // hole et comm cards (vérifié sur les assets PNG officiels PokerTH :
  // 0..12=♦, 13..25=♥, 26..38=♠, 39..51=♣). La fonction reste pour
  // compat. binaire (les call sites passent toujours par .map(normalizeHoleCard))
  // mais devient une simple validation + identité.
  if (n == null || !Number.isInteger(n) || n < 0 || n > 51) return null;
  return n;
}

function evaluateBestHand(holeCards, commCards) {
  var all = holeCards.concat(commCards).filter(function(c){ return c != null && c >= 0 && c < 52; });
  if (all.length < 2) return null;
  var k = Math.min(5, all.length);
  var combos = _getCombos(all, k);
  var best = null;
  for (var i = 0; i < combos.length; i++) {
    var res = _evalFive(combos[i]);
    if (!best || res.r > best.r) best = res;
  }
  return best;
}


function animateChipToPot(pid, amount) {
  // Source : siège du joueur localisé via data-pid (fiable indépendamment de l'ordre DOM)
  var seatEl = document.querySelector('#g-seats [data-pid="' + pid + '"]');
  if (!seatEl) return;
  var sr = seatEl.getBoundingClientRect();
  var sx = sr.left + sr.width  / 2;
  var sy = sr.top  + sr.height / 2;

  // Cible : libellé du pot (#g-pot dans le pot-strip)
  var potEl = document.getElementById('g-pot');
  var zone  = document.getElementById('g-table-zone');
  var tx, ty;
  if (potEl) {
    var pr = potEl.getBoundingClientRect();
    tx = pr.left + pr.width  / 2;
    ty = pr.top  + pr.height / 2;
  } else if (zone) {
    var zr = zone.getBoundingClientRect();
    tx = zr.left + zr.width  / 2;
    ty = zr.top  + zr.height / 2;
  } else {
    return;
  }

  // Créer le jeton volant
  var chip = document.createElement('div');
  chip.className = 'flying-chip';
  chip.textContent = amount > 0 ? (amount > 999 ? Math.round(amount / 100) / 10 + 'k' : amount) : '';
  chip.style.left      = sx + 'px';
  chip.style.top       = sy + 'px';
  chip.style.transform = 'scale(0.7)';
  document.body.appendChild(chip);

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      chip.style.left      = tx + 'px';
      chip.style.top       = ty + 'px';
      chip.style.transform = 'scale(1.1)';
      chip.style.opacity   = '0';
      setTimeout(function() { if (chip.parentNode) chip.parentNode.removeChild(chip); }, 700);
    });
  });
}



// [Phase 2] setLang moved to public/modules/i18n.mjs (still global via window.setLang)

// ══ FULLSCREEN ══
function toggleFullscreen() {
  if (!document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.mozFullScreenElement) {
    // Enter fullscreen
    var el = document.documentElement;
    if      (el.requestFullscreen)       el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen)    el.mozRequestFullScreen();
    else if (el.msRequestFullscreen)     el.msRequestFullscreen();
  } else {
    // Exit fullscreen
    if      (document.exitFullscreen)       document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen)  document.mozCancelFullScreen();
    else if (document.msExitFullscreen)     document.msExitFullscreen();
  }
}

function _updateFsButtons() {
  var isFs = !!(document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement);
  var icon = isFs ? '⊠' : '⛶';
  var title = isFs ? 'Exit fullscreen' : 'Fullscreen';
  ['fs-btn-connect','fs-btn-lobby','fs-btn-game'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) { btn.textContent = icon; btn.title = title; }
  });
}

// Listen for fullscreen change (user pressing Escape etc.)
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange']
  .forEach(function(evt) { document.addEventListener(evt, _updateFsButtons); });

// Unlock audio on first interaction
// [Phase 2] AudioContext warm-up moved to public/modules/sounds.mjs

/* ═══════════════════ */

document.addEventListener("DOMContentLoaded", function() {
  // Auto-fill nick
  // One-time housekeeping: scrub the legacy 'pth_pass' key in case
  // it's still in localStorage from an older client version. The
  // password is NEVER persisted by this app — only the browser's
  // own keychain (via the <input autocomplete='current-password'>
  // attribute) holds it.
  try { localStorage.removeItem('pth_pass'); } catch(e) {}
  // Note: nickname restore for all modes is handled inside
  // App.onLoginModeChange(), which fires below once the saved mode
  // is reapplied. This gives us a single source of truth for the
  // 'which nickname to show for this mode' logic.
  // Restaurer l'avatar sauvegardé
  try {
    var savedAv = localStorage.getItem('pth_avatar') || '';
    selectAvatarPopup(savedAv);
  } catch(e) {}
  // Restore sound button state
  var sbtn = document.getElementById('sound-toggle-btn');
  if (sbtn && !_soundEnabled) {
    sbtn.textContent = '🔇';
    sbtn.style.color = 'rgba(255,255,255,0.35)';
    sbtn.title = 'Unmute';
  }
  /**
   * Returns a stable Guest-XXXXX name persisted in localStorage.
   *
   * Without this, each tab / reload would generate a different random
   * Guest name. When several tabs of the same browser hit the server
   * within a few seconds (or worse: a desktop tab + a phone tab + a
   * PWA), the PokerTH server sees the same IP sending different Init
   * messages back-to-back and flags it as a brute-force attempt,
   * returning initBlocked for ~1 minute.
   *
   * By persisting one name per browser, all simultaneous sessions
   * from the same machine identify themselves with the same string,
   * which the server doesn't flag.
   *
   * Falls through to a fresh random name if localStorage is unavailable
   * (private mode under some browsers, disabled storage policy, etc.).
   */
  window.getOrCreateGuestName = function() {
    try {
      var k = 'pth_guest_name';
      var existing = localStorage.getItem(k);
      if (existing && /^Guest\d{5}$/.test(existing)) return existing;
      var fresh = 'Guest' + Math.floor(10000 + Math.random()*90000);
      localStorage.setItem(k, fresh);
      return fresh;
    } catch (e) {
      return 'Guest' + Math.floor(10000 + Math.random()*90000);
    }
  };

  var n = document.getElementById("nick");
  if (!n.value) n.value = window.getOrCreateGuestName();

  // Filter the avatar grid to a single category on load (otherwise the
  // connect-screen picker would show every category's emojis at once).
  try { if (typeof avpApplyDefaultCat === 'function') avpApplyDefaultCat(); } catch(e) {}

  // ── Share-link parameters (?host=&port=&tls=&table=) ──────────
  // If the page was opened from a "copy table link", prefill the
  // connect form with the encoded server params and remember which
  // table to auto-join once the lobby has loaded.
  // NOTE: this DOMContentLoaded block runs at GLOBAL scope (it is NOT
  // inside the App IIFE that contains handleMsg). So we publish the
  // pending table id on window._pendingAutoJoin, which the GameListNew
  // handler inside the IIFE reads. A bare `let _pendingAutoJoin` here
  // would be invisible to handleMsg and throw 'ReferenceError'.
  // window._shareLinkActive records that we arrived from a share link,
  // so the saved-prefs restore block below knows NOT to clobber the
  // host/port/mode we just prefilled, and so we can auto-connect.
  window._shareLinkActive = false;
  (function parseShareLink() {
    try {
      var sp = new URLSearchParams(window.location.search);
      var h = sp.get('host'), p = sp.get('port'),
          tls = sp.get('tls'), table = sp.get('table');
      if (h) { var hi = document.getElementById('host'); if (hi) hi.value = h; }
      if (p) { var pi = document.getElementById('port'); if (pi) pi.value = p; }
      if (tls !== null) {
        var ti = document.getElementById('use-tls');
        if (ti) ti.checked = (tls === '1');
      }
      if (table) {
        var t = parseInt(table, 10);
        // Published on window because parseShareLink runs at GLOBAL
        // scope (outside the App IIFE) — the GameListNew handler
        // inside the IIFE reads window._pendingAutoJoin.
        if (t > 0) window._pendingAutoJoin = t;
      }
      // When a share link targets a specific server, the most likely
      // intent is "join my friend's private server as an internet
      // guest". Pre-select that login mode so the guest doesn't have
      // to fiddle with the dropdown. Only override if a table was
      // actually specified (a bare host link could be anything).
      if (table) {
        var lm = document.getElementById('login-mode');
        if (lm && lm.value === 'auth') { /* keep credentialed if chosen */ }
        else if (lm) { lm.value = 'unauth'; if (App && App.onLoginModeChange) App.onLoginModeChange(); }
      }
      if (h || p || table) {
        window._shareLinkActive = true;
        // Clean the URL so a manual refresh doesn't re-trigger auto-join
        // (and so the link doesn't linger in the address bar). We keep
        // the pending join in memory (window._pendingAutoJoin).
        try { window.history.replaceState({}, '', window.location.pathname); } catch(e) {}
      }
    } catch(e) {}
  })();

  // Restaurer le serveur préféré sauvegardé — SAUF si on arrive d'un
  // lien de partage, auquel cas les paramètres du lien doivent gagner
  // (sinon le host sauvegardé d'une session précédente écrase celui
  // du lien d'invitation).
  try {
    if (!window._shareLinkActive) {
      var savedHost  = localStorage.getItem('pth_host');
      var savedPort  = localStorage.getItem('pth_port');
      var savedProxy = localStorage.getItem('pth_proxy');
      var savedMode  = localStorage.getItem('pth_login_mode');
      if (savedHost)  { var hi = document.getElementById('host');  if (hi) hi.value = savedHost; }
      if (savedPort)  { var pi = document.getElementById('port');  if (pi) pi.value = savedPort; }
      if (savedProxy) { var xi = document.getElementById('proxy'); if (xi) xi.value = savedProxy; }
      if (savedMode)  { var mi = document.getElementById('login-mode'); if (mi) { mi.value = savedMode; App.onLoginModeChange && App.onLoginModeChange(); } }
    }
  } catch(e) {}

  // Auto-fill proxy URL from current page URL
  var proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  var host  = window.location.hostname;
  var port  = window.location.port || (proto === 'wss:' ? '443' : '80');
  var wsUrl = proto + '//' + host + ':' + port;
  var proxyInput = document.getElementById("proxy");
  if (proxyInput) proxyInput.value = wsUrl;

  // Auto-fill PokerTH server host (same machine by default on LAN)
  var hostInput = document.getElementById("host");
  if (hostInput && host !== 'localhost' && host !== '127.0.0.1') {
    hostInput.dataset.autoHost = host; // remember the auto-detected value
    // Do NOT override the host if the current login mode targets pokerth.net
    // (onLoginModeChange already set it correctly above) — and NOT if we
    // arrived from a share link (its host param must win).
    var __modeEl = document.getElementById('login-mode');
    var __currentMode = __modeEl ? __modeEl.value : '';
    if (!window._shareLinkActive && __currentMode !== 'guest' && __currentMode !== 'auth') {
      hostInput.value = host;
    }
  }

  // ── Auto-connect from a share link ────────────────────────────
  // If we arrived via a "copy table link", connect automatically so
  // the guest lands straight in the lobby (and then auto-joins the
  // shared table via window._pendingAutoJoin). The nick field is
  // already populated — either a saved per-mode nick or a generated
  // guest name — so connect() has everything it needs. If for some
  // reason the nick is empty, we focus it instead and let the user
  // hit Connect themselves.
  if (window._shareLinkActive) {
    setTimeout(function() {
      try {
        var nickEl = document.getElementById('nick');
        var hasNick = nickEl && nickEl.value.trim();
        if (!hasNick) {
          // No usable nick — focus the field so the user just types
          // a name and hits enter/Connect.
          if (nickEl) { nickEl.focus(); }
          return;
        }
        if (App && typeof App.connect === 'function') {
          App.connect();
        }
      } catch(e) {}
    }, 350); // small delay so the SW-ready gate + form are settled
  }
});

/* ═══════════════════ */

// ═══════════════════════════════════════════════════════════
//  PROTOBUF — encodeur/décodeur minimal (proto2 binaire)
// ═══════════════════════════════════════════════════════════
const Proto = (() => {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  function encodeVarint(n) {
    n = n >>> 0;
    const out = [];
    while (n > 0x7F) {
      out.push((n & 0x7F) | 0x80);
      n >>>= 7;
    }
    out.push(n & 0x7F);
    return out;
  }

  function decodeVarint(buf, pos) {
    let result = 0, shift = 0;
    while (pos < buf.length) {
      const b = buf[pos++];
      result |= (b & 0x7F) << shift;
      if (!(b & 0x80)) break;
      shift += 7;
    }
    return { value: result >>> 0, pos };
  }

  // Décode un buffer en map { fieldNum: [valeurs] }
  // valeurs = number (varint) ou Uint8Array (length-delimited)
  function decode(buf) {
    const fields = {};
    let pos = 0;
    while (pos < buf.length) {
      const tagR = decodeVarint(buf, pos);
      pos = tagR.pos;
      const fn = tagR.value >>> 3;
      const wt = tagR.value & 0x7;
      if (!fields[fn]) fields[fn] = [];

      if (wt === 0) {
        const r = decodeVarint(buf, pos);
        pos = r.pos;
        fields[fn].push(r.value);
      } else if (wt === 2) {
        const lr = decodeVarint(buf, pos);
        pos = lr.pos;
        fields[fn].push(buf.slice(pos, pos + lr.value));
        pos += lr.value;
      } else if (wt === 1) { pos += 8; }
        else if (wt === 5) { pos += 4; }
        else break; // inconnu → stop
    }
    return fields;
  }

  // Encode un message à partir de specs [[fieldNum, wireType, valeur], ...]
  // wireType 0 = varint, 2 = string|Uint8Array|Array<number>
  function encode(specs) {
    const out = [];
    for (const [num, wt, val] of specs) {
      if (val === undefined || val === null) continue;
      out.push(...encodeVarint((num << 3) | wt));
      if (wt === 0) {
        out.push(...encodeVarint(val >>> 0));
      } else if (wt === 2) {
        const bytes = typeof val === 'string' ? enc.encode(val)
          : val instanceof Uint8Array ? val : new Uint8Array(val);
        out.push(...encodeVarint(bytes.length));
        out.push(...bytes);
      }
    }
    return new Uint8Array(out);
  }

  // Helpers d'accès aux champs
  const str  = (f, n) => f[n] ? dec.decode(f[n][0]) : '';
  const u32  = (f, n, d=0) => f[n] ? f[n][0] : d;
  // FIX bug "card=0 fantôme" : distingue champ absent (null) vs valeur 0 (carte 2♣/2♦)
  const u32orNull = (f, n) => f[n] ? f[n][0] : null;
  const sub  = (f, n) => f[n] ? decode(f[n][0]) : {};
  const raw  = (f, n) => f[n] ? f[n][0] : null;

  return { encode, decode, encodeVarint, decodeVarint, str, u32, u32orNull, sub, raw };
})();


// ═══════════════════════════════════════════════════════════
//  MESSAGES POKERTH
//  Types définis dans PokerTHMessage.PokerTHMessageType (proto)
// ═══════════════════════════════════════════════════════════
const MSG = (() => {
  // Type IDs → numéro de champ dans PokerTHMessage
  const TYPE_FIELD = {
    1:2, 2:3, 3:4, 4:5, 5:6, 6:7,           // Announce,Init,AuthChallenge,…,InitAck
    7:8, 8:9, 9:10, 10:11, 11:12,             // AvatarRequest, AvatarHeader, AvatarData, AvatarEnd, UnknownAvatar
    12:13,                                     // PlayerList
    13:14, 14:15, 15:16, 16:17, 17:18,        // GameList*
    18:19, 19:20,                              // PlayerInfo req/reply
    21:22, 22:23, 23:24, 24:25, 25:26,        // Join*
    26:27, 27:28, 28:29, 29:30,               // GamePlayer*
    36:37, 37:38, 38:39,                       // StartEvent, StartEventAck, GameStartInitial
    40:41, 41:42, 42:43,                       // HandStart, PlayersTurn, MyActionRequest
    43:44,                                     // YourActionRejected
    44:45,                                     // PlayersActionDone
    45:46, 46:47, 47:48,                       // DealFlop, DealTurn, DealRiver
    48:49,                                     // AllInShowCards
    49:50, 50:51, 53:54,                       // EndOfHandShow, EndOfHandHide, EndOfGame
    62:63, 63:64, 64:65, 65:66,               // Statistics, Chat*
    67:68, 68:69,                              // TimeoutWarning, ResetTimeout
    73:74,                                     // Error
    78:79, 79:80, 80:81, 81:82,              // Spectator*
  };

  const T = {
    Announce:1, Init:2, AuthChallenge:3, AuthClientResp:4, AuthServerVerif:5, InitAck:6,
    // Avatar download flow (step 2 of pokerth.net avatar feature):
    // client sends AvatarRequest with a unique requestId + 16-byte hash,
    // server replies with AvatarHeader (size+type), then 1..N
    // AvatarData chunks (~256 bytes each), then AvatarEnd. If the server
    // does not have the avatar, it replies with UnknownAvatar instead.
    AvatarRequest:7, AvatarHeader:8, AvatarData:9, AvatarEnd:10, UnknownAvatar:11,
    PlayerList:12,
    GameListNew:13, GameListUpdate:14, GameListPlayerJoined:15, GameListPlayerLeft:16,
    GameListAdminChanged:17,
    PlayerInfoRequest:18, PlayerInfoReply:19,
    JoinExisting:21, JoinNew:22, RejoinExisting:23,
    JoinNew:22, JoinGameAck:24, JoinGameFailed:25,
    GamePlayerJoined:26, GamePlayerLeft:27, GameAdminChanged:28, RemovedFromGame:29,
    StartEvent:36, StartEventAck:37, GameStartInitial:38,
    HandStart:40, PlayersTurn:41, MyActionRequest:42,
    YourActionRejected:43,
    PlayersActionDone:44, DealFlop:45, DealTurn:46, DealRiver:47,
    AllInShowCards:48, EndOfHandShow:49, EndOfHandHide:50, EndOfGame:53,
    Statistics:62, ChatRequest:63, Chat:64, ChatReject:65,
    TimeoutWarning:67, ResetTimeout:68, Error:73,
    GameListSpectatorJoined:78, GameListSpectatorLeft:79,
    // Spectators on the table we're currently in (or watching).
    // Type 80/81 — separate from the lobby-level 78/79 which track
    // spectator counts across all tables.
    GameSpectatorJoined:80, GameSpectatorLeft:81,
  };

  // Parse un buffer en {type, sub: champs du sous-message}
  function parse(buf) {
    const fields = Proto.decode(buf);
    const type = Proto.u32(fields, 1);
    const fn = TYPE_FIELD[type];
    const sub = fn && fields[fn] ? Proto.decode(fields[fn][0]) : {};
    return { type, sub };
  }

  // Construit un InitMessage (guest, unauth ou authenticated user)
  // buildId = (CLIENT_TYPE_QT_WIDGET<<24)|(MAJOR<<16)|(MINOR<<8)|PATCH
  // = (0x01<<24)|(2<<16)|(0<<8)|6 = 0x01020006 = 16908294 (PokerTH 2.0.6)
  // Auth (loginType=1) : password en clair dans clientUserData (tag 7),
  //   sécurisé par TLS (mandatory côté serveur v2.0+).
  //   Ref: pokerth/src/net/clientstate.cpp:1465-1469 + serverlobbythread.cpp:1255-1256
  function buildInit(nick, major, minor, loginType, password) {
    loginType = loginType !== undefined ? loginType : 0;
    const BUILD_ID = 16908294; // 0x01020006 — source: pokerth-live/src/constants/gameDefs.js
    const ver = Proto.encode([[1,0,major],[2,0,minor]]);
    const fields = [
      [1,2,ver],       // requestedVersion (= protocolVersion from Announce)
      [2,0,BUILD_ID],  // buildId composite: (type<<24)|(major<<16)|(minor<<8)|patch
      [5,0,loginType], // login: 0=guestLogin, 1=authenticatedLogin, 2=unauthenticatedLogin
      [6,2,nick],      // nickName (utilisé aussi pour authenticated login)
    ];
    // Authenticated login : password en bytes dans clientUserData (tag 7, max 256 bytes).
    // Tronqué si nécessaire pour rester sous la limite imposée par le serveur.
    if (loginType === 1 && password) {
      let pwd = String(password);
      // Sanity check : max 256 bytes UTF-8 (cf. netpacketvalidator.cpp:184)
      const enc = new TextEncoder().encode(pwd);
      if (enc.length > 256) {
        console.warn('[buildInit] password > 256 bytes UTF-8, truncated');
        pwd = new TextDecoder().decode(enc.slice(0, 256));
      }
      fields.push([7, 2, pwd]); // clientUserData
    }
    const init = Proto.encode(fields);
    return Proto.encode([[1,0,T.Init],[3,2,init]]);
  }

  // Chat lobby
  function buildChat(text) {
    const req = Proto.encode([[3,2,text]]);
    return Proto.encode([[1,0,T.ChatRequest],[64,2,req]]);
  }

  // Chat scoped to a specific table (targetGameId = field 1). The
  // server admin bot uses this scoping to know whether to interpret
  // a leading "/" as a game-admin command (notably /kick <name>).
  function buildGameChat(gameId, text) {
    const req = Proto.encode([[1,0,gameId],[3,2,text]]);
    return Proto.encode([[1,0,T.ChatRequest],[64,2,req]]);
  }

  // Rejoindre une table existante
  function buildJoin(gameId) {
    const join = Proto.encode([[1,0,gameId]]);
    return Proto.encode([[1,0,T.JoinExisting],[22,2,join]]);
  }


  // JoinExistingGameMessage: gameId=1, password=2, autoLeave=3, spectateOnly=4
  function buildJoinGame(gameId, spectateOnly, password) {
    // JoinExistingGameMessage per proto:
    //   field 1: gameId       (required uint32)
    //   field 2: password     (optional string)
    //   field 3: autoLeave    (optional bool, default false)
    //   field 4: spectateOnly (optional bool, default false)
    //
    // The previous version set autoLeave=true whenever the caller asked
    // for spectate. That's wrong: autoLeave has nothing to do with
    // spectator mode (it tells the server 'kick me out of any other
    // games I'm in'). Sending autoLeave=true alongside a spectate request
    // was confusing the server enough that it never replied with
    // JoinGameAck — the 'Joining…' status hung forever.
    //
    // Emit only the fields the caller actually requested:
    const fields = [[1, 0, gameId]];
    if (password) fields.push([2, 2, password]);
    if (spectateOnly) fields.push([4, 0, 1]);
    const msg = Proto.encode(fields);
    return Proto.encode([[1,0,T.JoinExisting],[22,2,msg]]);
  }

  // StartEventAckMessage: gameId=1
  function buildStartEventAck(gameId) {
    const msg = Proto.encode([[1,0,gameId]]);
    return Proto.encode([[1,0,T.StartEventAck],[38,2,msg]]);
  }

  // MyActionRequestMessage: gameId=1, handNum=2, gameState=3, myAction=4, myRelativeBet=5
  function buildMyAction(gameId, handNum, gameState, action, bet) {
    const msg = Proto.encode([
      [1,0,gameId],
      [2,0,handNum],
      [3,0,gameState],
      [4,0,action],
      [5,0,bet || 0],
    ]);
    return Proto.encode([[1,0,T.MyActionRequest],[43,2,msg]]);
  }

  // Build create/join new game (JoinNewGameMessage, type 22)
  function buildCreateGame(name, maxPlayers, smallBlind, startMoney, timeout, opts) {
    opts = opts || {};
    const raiseMode    = opts.raiseMode    || 1;
    const raiseEvery   = opts.raiseEvery   || 7;
    const endRaiseMode = opts.endRaiseMode || 1;
    const endRaiseVal  = opts.endRaiseValue|| 0;
    const guiSpeed     = opts.guiSpeed     || 5;
    const delayHands   = opts.delayHands   || 7;
    const gameType     = opts.gameType     || 1;
    // allowSpectators: proto field 15, optional bool, default true server-side.
    // We forward the bit explicitly so the UI can flip it.
    // - When opts.allowSpectators is undefined (older callers): omit the
    //   field so the server's default of true applies.
    // - When opts.allowSpectators is false: emit [15, 0, 0].
    // - When opts.allowSpectators is true: emit [15, 0, 1] (explicit, in
    //   case a future server changes the default).
    const allowSpec    = (typeof opts.allowSpectators === 'boolean')
                         ? (opts.allowSpectators ? 1 : 0)
                         : null;
    const gameInfo = Proto.encode([
      [1,  2, name || 'WebGame'],
      [2,  0, gameType],
      [3,  0, maxPlayers||2],
      [4,  0, raiseMode],
      raiseMode === 1 ? [5, 0, raiseEvery] : [6, 0, raiseEvery],
      [7,  0, endRaiseMode],
      ...(endRaiseMode === 2 ? [[8, 0, endRaiseVal]] : []),
      [9,  0, guiSpeed],
      [10, 0, delayHands],
      [11, 0, timeout||30],
      [12, 0, smallBlind||10],
      [13, 0, startMoney||3000],
      ...(allowSpec !== null ? [[15, 0, allowSpec]] : []),
    ]);
    const joinFields = [[1, 2, gameInfo]];
    if (opts.password) joinFields.push([2, 2, opts.password]);
    const msg = Proto.encode(joinFields);
    return Proto.encode([[1, 0, 22], [23, 2, msg]]);
  }

  function buildAuthResponse() {
    const msg = Proto.encode([[1, 2, new Uint8Array(0)]]);
    return Proto.encode([[1, 0, T.AuthClientResp], [5, 2, msg]]);
  }

  // StartEventMessage with fillWithComputerPlayers
  function buildStartWithBots(gameId, fill) {
    const msg = Proto.encode([[1,0,gameId],[2,0,0],[3,0,fill?1:0]]);
    return Proto.encode([[1,0,36],[37,2,msg]]);
  }

  // LeaveGameRequestMessage
  function buildLeaveGame(gameId) {
    const msg = Proto.encode([[1,0,gameId]]);
    return Proto.encode([[1,0,31],[32,2,msg]]);
  }

  // KickPlayerRequestMessage (type 30, sub-field 31). Admin only.
  // The server replies with GamePlayerLeft (leftKicked) broadcast to
  // all clients and a RemovedFromGame (kickedFromGame) to the kicked
  // player. We don't need to await a direct ack — the existing handlers
  // already update the seat list when they see GamePlayerLeft.
  function buildKickPlayer(gameId, playerId) {
    const msg = Proto.encode([[1,0,gameId],[2,0,playerId]]);
    return Proto.encode([[1,0,30],[31,2,msg]]);
  }

  return { T, parse, buildInit, buildChat, buildGameChat, buildJoin, buildJoinGame, buildStartEventAck, buildMyAction, buildCreateGame, buildLeaveGame, buildStartWithBots, buildKickPlayer };
})();


// ═══════════════════════════════════════════════════════════
//  APPLICATION
// ═══════════════════════════════════════════════════════════
const App = (() => {
  let ws        = null;
  let rxBuf     = new Uint8Array(0);
  let myId      = 0;
  // ── Game state ──
  let gId       = 0;   // current gameId
  let lastMajor = 5, lastMinor = 1, lastLoginType = 0; // for name-retry
  let smallBlind = 10;  // small blind value
  let handNum   = 0;   // hand counter
  let gameState = 0;   // preflop/flop/turn/river
  let _playerAvatars = {}; // pid → emoji avatar (reçu des autres joueurs via proxy)
  // Step 1 of "PokerTH official avatar" feature: when PlayerInfoReply
  // arrives for a registered player who uploaded an avatar on pokerth.net,
  // it carries an AvatarData sub-message (field 5) with the hash + format.
  // We just record what we see here; downloading + displaying come later.
  //   _pthAvatarHashes[pid] = { type: 1|2|3, hashHex: 'a3f5...' }
  //   type: NetAvatarType from proto -- 1=PNG, 2=JPG, 3=GIF
  //   hashHex: lower-case hex string (easy logging & future cache keys)
  let _pthAvatarHashes = {};
  // Step 2: outgoing AvatarRequest tracking. Keyed by hashHex so the same
  // avatar shared by N players is downloaded ONCE (Q2=A, dedup by hash).
  //   _pthAvatarsByHash[hex] = {
  //     status: 'pending' | 'done' | 'unknown' | 'error',
  //     type:   1|2|3,
  //     expectedSize: <bytes from AvatarHeader>,
  //     chunks: [Uint8Array, ...],   // not concatenated yet (step 3)
  //     received: <running total>,
  //   }
  let _pthAvatarsByHash = {};
  // requestId -> hashHex, so AvatarHeader/Data/End handlers can map
  // their requestId back to the right entry (the server's reply does
  // NOT echo the hash, only the requestId we chose).
  let _pthAvatarReqIdToHash = {};
  // Monotonic counter for AvatarRequest.requestId. Starts at 1 because
  // some servers refuse 0. Wraps around at 2^32 (we'll be long dead).
  let _pthNextAvatarReqId = 1;
  // Step 3: assembled Data URLs keyed by hashHex (the actual displayable
  // image, e.g. 'data:image/png;base64,iVBORw0KG...'). Built from chunks
  // at AvatarEnd, or restored from localStorage cache on startup.
  let _pthDataUrls = {};

  // LRU cache in localStorage (Q3=B, capped at 200 entries).
  // Keys:
  //   pthAv:<hashHex>  -> '<typeNum>|<dataUrl>'   (one entry per avatar)
  //   pthAv:_lru       -> JSON array of hashHex, most-recent first
  // 200 entries * ~5KB ~= 1MB which is comfortable within 5MB quota.
  const PTH_AV_MAX = 200;
  const PTH_AV_KEY = function(h) { return 'pthAv:' + h; };
  const PTH_AV_LRU_KEY = 'pthAv:_lru';

  function _pthLoadLruList() {
    try {
      const raw = localStorage.getItem(PTH_AV_LRU_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch(e) { return []; }
  }
  function _pthSaveLruList(list) {
    try { localStorage.setItem(PTH_AV_LRU_KEY, JSON.stringify(list)); }
    catch(e) { /* quota -- best-effort */ }
  }
  function _pthCacheGet(hashHex) {
    try {
      const raw = localStorage.getItem(PTH_AV_KEY(hashHex));
      if (!raw) return null;
      const i = raw.indexOf('|');
      if (i < 0) return null;
      const type = parseInt(raw.slice(0, i), 10) || 1;
      const dataUrl = raw.slice(i + 1);
      // Touch LRU: move this hash to the front.
      let lru = _pthLoadLruList().filter(function(h){ return h !== hashHex; });
      lru.unshift(hashHex);
      _pthSaveLruList(lru);
      return { type: type, dataUrl: dataUrl };
    } catch(e) { return null; }
  }
  function _pthCachePut(hashHex, type, dataUrl) {
    try {
      localStorage.setItem(PTH_AV_KEY(hashHex), type + '|' + dataUrl);
      let lru = _pthLoadLruList().filter(function(h){ return h !== hashHex; });
      lru.unshift(hashHex);
      // Evict oldest beyond cap.
      while (lru.length > PTH_AV_MAX) {
        const drop = lru.pop();
        try { localStorage.removeItem(PTH_AV_KEY(drop)); } catch(e) {}
      }
      _pthSaveLruList(lru);
    } catch(e) {
      // Quota exceeded or storage disabled. Try to evict half the cache
      // and retry once. If it still fails, just give up silently --
      // the avatar will simply be re-downloaded next time.
      try {
        let lru = _pthLoadLruList();
        const evictCount = Math.max(1, Math.floor(lru.length / 2));
        for (let i = 0; i < evictCount && lru.length > 0; i++) {
          const drop = lru.pop();
          try { localStorage.removeItem(PTH_AV_KEY(drop)); } catch(e2) {}
        }
        _pthSaveLruList(lru);
        localStorage.setItem(PTH_AV_KEY(hashHex), type + '|' + dataUrl);
        lru.unshift(hashHex);
        _pthSaveLruList(lru);
      } catch(e3) { /* really give up */ }
    }
  }

  // Concatenate the per-request Uint8Array chunks and convert to a
  // data: URL the browser can render directly as <img src>.
  function _pthAssembleDataUrl(chunks, type) {
    let total = 0;
    for (let i = 0; i < chunks.length; i++) total += chunks[i].length;
    const merged = new Uint8Array(total);
    let off = 0;
    for (let i = 0; i < chunks.length; i++) {
      merged.set(chunks[i], off);
      off += chunks[i].length;
    }
    // btoa needs a binary string. Build it in batches to avoid the
    // "Maximum call stack size exceeded" trap on String.fromCharCode(...arr).
    let bin = '';
    const STEP = 4096;
    for (let i = 0; i < merged.length; i += STEP) {
      const slice = merged.subarray(i, Math.min(i + STEP, merged.length));
      bin += String.fromCharCode.apply(null, slice);
    }
    const mime = type === 2 ? 'image/jpeg' : type === 3 ? 'image/gif' : 'image/png';
    return 'data:' + mime + ';base64,' + btoa(bin);
  }

  // Public helper used by the renderer: returns a Data URL for the
  // player or null. Considers cache + freshly assembled images.
  function _pthAvatarFor(pid) {
    const meta = _pthAvatarHashes[pid];
    if (!meta) return null;
    return _pthDataUrls[meta.hashHex] || null;
  }
  // Expose for refreshMyAvatar (defined at module top level)
  window._pthAvatarFor = _pthAvatarFor;
  let _myAvatarCache  = ''; // cache de l'avatar local (évite les lectures localStorage répétées)
  // Avatar feature: returns the emoji to display for the local player,
  // or '' if there is none. Crucially treats the '__pth__' sentinel as
  // "no emoji" so the literal string never leaks into the UI as text.
  // Use this everywhere we want an avatar-as-string (player-bar text
  // fallback, waiting list, winner overlay, etc.) -- do NOT read
  // localStorage.pth_avatar directly for display purposes.
  function _myAvatarDisplay() {
    var v = _myAvatarCache;
    if (!v) {
      try { v = localStorage.getItem('pth_avatar') || ''; } catch(e) { v = ''; }
    }
    return (v === '__pth__') ? '' : v;
  }
  // Same idea for broadcasting to other players: don't send the
  // sentinel over the wire (it would show as 4 weird chars on their
  // seat). When the local player picked '__pth__', they get the real
  // PokerTH avatar through their own PlayerInfoReply flow.
  function _myAvatarToBroadcast() {
    var v = '';
    try { v = localStorage.getItem('pth_avatar') || ''; } catch(e) {}
    return (v === '__pth__') ? '' : v;
  }

  // Unified avatar-chip renderer for compact UI lists (waiting room,
  // winner banner, end-of-hand results table, etc.). Returns a single
  // HTML <span> -- already escaped where needed. The caller wraps it
  // in whatever container they want (no <li> / <div> assumed here).
  //
  // Decision tree per player (same priority order as the table seats):
  //   1. Real PokerTH avatar image downloaded for this pid -> <img>
  //   2. For me + I chose '__pth__' but image not downloaded ->
  //      placeholder /img/pokerth-logo.png
  //   3. Emoji (mine from localStorage, others' from _playerAvatars)
  //   4. Bot fallback -> 🤖
  //   5. Final fallback -> first letter of the pseudo
  //
  // Args:
  //   pid        : player id (number)
  //   nick       : pseudo to use for the initial-letter fallback
  //   chipClass  : the CSS class on the wrapping <span>. Caller-defined
  //                because the 3 surfaces (wp-av, eg-winner-av,
  //                wc-player-av) have different sizes and colors.
  function _avatarChipHtml(pid, nick, chipClass) {
    var isMe = (pid === myId);
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
      if (myChoice2 === '__pth__') pthUrl = '/img/pokerth-logo.png';
    }
    if (pthUrl) {
      return '<span class="' + chipClass + ' has-pth-avatar">'
           + '<img class="chip-pth-img" src="' + pthUrl + '" alt="" draggable="false">'
           + '</span>';
    }
    // 3) emoji? (mine via the sentinel-aware helper, others via _playerAvatars)
    var emoji = isMe ? _myAvatarDisplay() : (_playerAvatars[pid] || '');
    if (emoji) {
      return '<span class="' + chipClass + ' emoji-av">' + esc(emoji) + '</span>';
    }
    // 4) bots
    if (isBot(pid)) {
      return '<span class="' + chipClass + ' emoji-av">🤖</span>';
    }
    // 5) initial-letter fallback
    var letter = ((nick && nick[0]) || '?').toUpperCase();
    return '<span class="' + chipClass + ' letter">' + esc(letter) + '</span>';
  }
  // Expose so tests / debug can call it.
  window._avatarChipHtml = _avatarChipHtml;

  // Re-evaluate visibility of the "▶ Start" (no-bots) button based on
  // how many humans are currently at the table. Called from the
  // waiting-panel renderer on every refresh so the button appears as
  // soon as the second human arrives and disappears if they leave.
  //
  // Safety: only ever shows the button to the game admin. If the
  // admin button is hidden (we're not the admin) the function does
  // nothing — extra cheap-guard before counting.
  function refreshStartNoBotsVisibility() {
    if (!amGameAdmin || _gameStarted) {
      // Hide explicitly once the game has started — the renderer's
      // early-return otherwise leaves the button stuck on screen.
      var b1 = document.getElementById('admin-startnobots-btn');
      var b2 = document.getElementById('admin-startnobots-mob');
      if (b1) b1.style.display = 'none';
      if (b2) b2.style.display = 'none';
      return;
    }
    // Build the same pid set as renderWaitingPanel(): pids present in
    // seatData with .gone falsy, PLUS myId if missing (myId only
    // enters seatData via GamePlayerJoined for ourselves, which the
    // server sometimes elides — the renderer compensates the same way).
    var pids = Object.keys(seatData)
      .map(function(s){ return parseInt(s,10); })
      .filter(function(p){ return seatData[p] && !seatData[p].gone; });
    if (myId && pids.indexOf(myId) === -1) pids.push(myId);
    var showIt = pids.length >= 2;
    var btn  = document.getElementById('admin-startnobots-btn');
    var btnM = document.getElementById('admin-startnobots-mob');
    if (btn)  btn.style.display  = showIt ? '' : 'none';
    if (btnM) btnM.style.display = showIt ? '' : 'none';
  }
  window._refreshStartNoBotsVisibility = refreshStartNoBotsVisibility;

  // ──────────────────────────────────────────────────────────────
  // Lobby pseudo pill: avatar + name, click opens the player-info
  // modal (which has a 'Change avatar' button).
  // ──────────────────────────────────────────────────────────────
  function updateLobbyPill() {
    var el = document.getElementById('h-nick');
    if (!el) return;
    if (!myName) { el.textContent = '—'; return; }
    // The unified avatar chip helper handles all 5 fallback cases
    // (real PokerTH image / placeholder logo / emoji / bot / initial).
    // Wrap it in a tiny span so the CSS can size it independently of
    // whatever the chip class would normally enforce.
    var chip = _avatarChipHtml(myId, myName, 'h-nick-av');
    // Build: <span class="h-nick-av"...>...</span> <name>
    el.innerHTML = chip + ' ' + esc(myName);
  }
  window.updateLobbyPill = updateLobbyPill;

  // ──────────────────────────────────────────────────────────────
  // Player-info modal -- shows the local player's avatar + name,
  // plus a 'Change avatar' button that opens the avatar picker.
  // ──────────────────────────────────────────────────────────────
  function openPlayerInfoPopup() {
    var modal = document.getElementById('player-info-modal');
    if (!modal) return;
    // Fill the big avatar (96px circle). Reuse _avatarChipHtml but
    // bypass the chip class -- we just want the inner image/emoji
    // so the existing .pim-avatar can keep its own circle border.
    var avEl = document.getElementById('pim-avatar');
    var nameEl = document.getElementById('pim-name');
    if (avEl) {
      avEl.classList.remove('is-letter');
      // Decide what to show: PokerTH image > placeholder logo > emoji
      // > initial. Re-derive the choice here so the modal stays in
      // sync with whatever the user just picked.
      var pthUrl = (typeof _pthAvatarFor === 'function')
        ? _pthAvatarFor(myId) : null;
      var stored = null;
      try { stored = localStorage.getItem('pth_avatar'); } catch(e) {}
      if (pthUrl && stored !== null && stored !== '__pth__') pthUrl = null;
      if (!pthUrl && stored === '__pth__') pthUrl = '/img/pokerth-logo.png';
      if (pthUrl) {
        avEl.innerHTML = '<img src="' + pthUrl + '" alt="" draggable="false">';
      } else if (stored && stored !== '__pth__') {
        avEl.textContent = stored;
      } else {
        // initial letter
        avEl.classList.add('is-letter');
        avEl.textContent = (myName && myName[0] ? myName[0] : '?').toUpperCase();
      }
    }
    if (nameEl) nameEl.textContent = myName || '';
    modal.style.display = 'flex';
  }
  window.openPlayerInfoPopup = openPlayerInfoPopup;

  function closePlayerInfoPopup() {
    var modal = document.getElementById('player-info-modal');
    if (modal) modal.style.display = 'none';
  }
  window.closePlayerInfoPopup = closePlayerInfoPopup;

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
  var _avatarPopupOrigParent = null;
  var _avatarPopupOrigNextSibling = null;
  var _avatarPickerBackdropHandler = null;
  var _avatarPickerBtnHandler = null;

  function openAvatarPickerFromLobby() {
    var picker = document.getElementById('avatar-popup');
    if (!picker) return;
    // Remember the original location so closeAvatarPickerFromLobby
    // can put the popup back exactly where it was.
    if (!_avatarPopupOrigParent) {
      _avatarPopupOrigParent = picker.parentNode;
      _avatarPopupOrigNextSibling = picker.nextSibling;
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
    try { if (typeof avpApplyDefaultCat === 'function') avpApplyDefaultCat(); } catch(e) {}
    // Close-on-backdrop: a click on the popup background (NOT on any
    // child like the avatar buttons or the header) closes the picker.
    _avatarPickerBackdropHandler = function(e) {
      if (e.target === picker) {
        closeAvatarPickerFromLobby();
      }
    };
    picker.addEventListener('click', _avatarPickerBackdropHandler);
    // When the user picks an avatar, the existing selectAvatarPopup()
    // (attached as an inline onclick on each .avp-btn) sets the popup's
    // inline display:'none'. We piggy-back on that to also strip the
    // modal class and put the popup back in its original place. Using
    // capture phase + once:true so we run exactly once before the
    // onclick attribute fires (or right after, both are fine here).
    _avatarPickerBtnHandler = function(e) {
      var btn = e.target.closest('.avp-btn');
      if (!btn) return;
      // Let the inline onclick run first (it saves + closes), then
      // we clean up and refresh on the next tick.
      setTimeout(function() {
        closeAvatarPickerFromLobby();
        openPlayerInfoPopup();
        updateLobbyPill();
      }, 0);
    };
    picker.addEventListener('click', _avatarPickerBtnHandler, { once: true, capture: true });
  }
  window.openAvatarPickerFromLobby = openAvatarPickerFromLobby;

  function closeAvatarPickerFromLobby() {
    var picker = document.getElementById('avatar-popup');
    if (!picker) return;
    picker.classList.remove('avatar-popup-as-modal');
    picker.style.display = 'none';
    // Detach our backdrop handler (the btn handler was once:true).
    if (_avatarPickerBackdropHandler) {
      picker.removeEventListener('click', _avatarPickerBackdropHandler);
      _avatarPickerBackdropHandler = null;
    }
    // Put the popup back into its original parent so the connect
    // screen's static layout keeps working.
    if (_avatarPopupOrigParent && picker.parentNode !== _avatarPopupOrigParent) {
      if (_avatarPopupOrigNextSibling && _avatarPopupOrigNextSibling.parentNode === _avatarPopupOrigParent) {
        _avatarPopupOrigParent.insertBefore(picker, _avatarPopupOrigNextSibling);
      } else {
        _avatarPopupOrigParent.appendChild(picker);
      }
    }
  }
  window.closeAvatarPickerFromLobby = closeAvatarPickerFromLobby;

  // ──────────────────────────────────────────────────────────────
  // Game info modal -- snapshot of the current table's settings +
  // state, opened by clicking the "TABLE" label in the game header.
  // Per the user-validated design (Q1=c, Q2=a, Q3=b):
  //   - All sections EXCEPT the player list (saves vertical space).
  //   - Snapshot at click time, not live-updated.
  //   - Subtle underline hover on the trigger.
  // ──────────────────────────────────────────────────────────────
  function _gameTypeLabel(t) {
    // PokerTH NetGameInfo.netGameType enum (from the protocol):
    //   1 = normal game (the default created via the UI)
    //   2 = registered-only
    //   3 = invite-only
    // The server has no separate "limit/no-limit" field exposed in
    // the listing -- it's always No Limit Texas Hold'em here.
    switch (t) {
      case 2: return (_lang === 'fr') ? 'Inscrits seulement' : 'Registered only';
      case 3: return (_lang === 'fr') ? 'Sur invitation' : 'Invite only';
      default: return (_lang === 'fr') ? 'Partie normale' : 'Normal game';
    }
  }

  function openGameInfoPopup() {
    var modal = document.getElementById('game-info-modal');
    if (!modal) return;
    var titleEl = document.getElementById('gim-title');
    var subEl   = document.getElementById('gim-subtitle');
    var bodyEl  = document.getElementById('gim-body');
    if (!titleEl || !bodyEl) return;

    var fr   = (_lang === 'fr');
    var meta = _gameMeta || {
      id: gId, name: '—', type: 1, maxPlayers: 0,
      priv: false, timeout: gameTimeout, startMoney: gameStartMoney,
    };

    titleEl.textContent = meta.name + ' · #' + meta.id;

    // Subtitle: row of badges (admin / private). Hidden if both false.
    var badges = [];
    if (amGameAdmin) {
      badges.push('<span class="gim-badge">👑 ' + (fr ? 'Admin' : 'Admin') + '</span>');
    }
    if (meta.priv) {
      badges.push('<span class="gim-badge">🔒 ' + (fr ? 'Privée' : 'Private') + '</span>');
    } else {
      badges.push('<span class="gim-badge">🌐 ' + (fr ? 'Publique' : 'Public') + '</span>');
    }
    subEl.innerHTML = badges.join(' ');

    // Body: 3 sections of label/value rows.
    var pot = 0;
    var potEl = document.getElementById('g-pot');
    if (potEl) {
      // Extract numeric part from "POT: 1234" / "Pot : 1234"
      var m = String(potEl.textContent || '').match(/[\d]+/);
      pot = m ? parseInt(m[0], 10) : 0;
    }
    var round = '—';
    var roundEl = document.getElementById('g-round');
    if (roundEl) round = (roundEl.textContent || '—').trim();

    // Count current players from seatData / seats. Spectators don't
    // count, only seated players that the server told us about.
    var activeCount = 0;
    if (Array.isArray(seats) && seats.length) {
      seats.forEach(function(pid){
        var sd = seatData[pid] || {};
        // Eliminated/sitting-out players still "exist" at the table but
        // are not actively playing this hand. We count them as joined
        // (they're at the table) but mark eliminated ones separately.
        if (sd.active !== false || sd.money > 0) activeCount++;
        else activeCount++; // count them anyway -- they're seated
      });
    }
    if (!activeCount) activeCount = Object.keys(seatData || {}).length;

    var sections = [];

    // ── Section 1: General info ──
    sections.push({
      title: fr ? 'Informations' : 'Information',
      rows: [
        [fr ? 'Type' : 'Type',          _gameTypeLabel(meta.type)],
      ],
    });

    // ── Section 2: Configuration ──
    sections.push({
      title: fr ? 'Configuration' : 'Configuration',
      rows: [
        [fr ? 'Blindes' : 'Blinds',
            (smallBlind || 0) + ' / ' + ((smallBlind || 0) * 2) + ' ¥'],
        [fr ? 'Tapis de départ' : 'Starting stack',
            (meta.startMoney || 0) + ' ¥'],
        [fr ? "Timer d'action" : 'Action timer',
            (meta.timeout || gameTimeout || 15) + ' s'],
      ],
    });

    // ── Section 3: État de la partie ──
    sections.push({
      title: fr ? 'État de la partie' : 'Game state',
      rows: [
        [fr ? 'Joueurs' : 'Players',
            activeCount + ' / ' + (meta.maxPlayers || '?')],
        [fr ? 'Main n°' : 'Hand #',
            (handNum > 0) ? ('H#' + handNum) : (fr ? 'Pas démarrée' : 'Not started')],
        [fr ? 'Pot' : 'Pot',
            pot + ' ¥'],
        [fr ? 'Phase' : 'Phase',
            round],
      ],
    });

    // ── Section 4: Spectateurs (only if any) ──
    // Built from _specPids, populated by GameSpectatorJoined handlers.
    // Each row gets the same avatar treatment as the kick / players
    // list (via _avatarChipHtml: PokerTH image > emoji > initial > 🤖).
    // The user themselves is filtered out (we don't add ourselves to
    // _specPids in the join handler) so the list shows OTHER specs.
    // When the local user is themselves a spectator, we add a "(vous)"
    // entry up top so they see they're not invisible.
    var specRows = [];
    if (_amSpectator && myId) {
      // Show ourselves first, marked as such.
      var meName = (myName || ('#' + myId)) + ' ' +
                   '<span class="gim-spec-me">' +
                   (fr ? '(vous)' : '(you)') +
                   '</span>';
      specRows.push({ pid: myId, html: meName });
    }
    _specPids.forEach(function(sp) {
      specRows.push({
        pid: sp,
        html: players[sp] ? esc(players[sp]) : ('#' + sp),
      });
    });

    var html = '';
    sections.forEach(function(s){
      html += '<div class="gim-section">';
      html += '<div class="gim-section-title">' + esc(s.title) + '</div>';
      s.rows.forEach(function(r){
        html += '<div class="gim-row">'
              + '<span class="gim-row-label">' + esc(r[0]) + '</span>'
              + '<span class="gim-row-value">' + esc(r[1]) + '</span>'
              + '</div>';
      });
      html += '</div>';
    });

    // Spectators section: rendered separately because it uses a
    // different row layout (avatar chip + name, like the kick modal).
    if (specRows.length) {
      html += '<div class="gim-section">';
      html += '<div class="gim-section-title">' +
              '👁 ' + esc(fr ? 'Spectateurs' : 'Spectators') +
              ' <span class="gim-section-count">(' + specRows.length + ')</span>' +
              '</div>';
      html += '<div class="gim-spec-list">';
      specRows.forEach(function(r) {
        var avChip = (typeof window._avatarChipHtml === 'function')
          ? window._avatarChipHtml(r.pid, players[r.pid] || ('#' + r.pid), 'gim-spec-av')
          : '<span class="gim-spec-av letter">?</span>';
        html += '<div class="gim-spec-row">' + avChip +
                '<span class="gim-spec-name">' + r.html + '</span></div>';
      });
      html += '</div></div>';
    }

    // ── Share / copy-link action ──
    // A full-width button at the bottom of the modal that copies a
    // deep link to this table (server + port + tls + table id). See
    // App.copyTableLink(). Only shown while actually in a game.
    if (gId) {
      html += '<div class="gim-section gim-share-section">' +
                '<button id="gim-copy-link-btn" class="gim-copy-link-btn" type="button" ' +
                  'onclick="App.copyTableLink()">' +
                  '🔗 ' + esc(fr ? 'Copier le lien d\'invitation' : 'Copy invite link') +
                '</button>' +
                '<div class="gim-share-hint">' +
                  esc(fr
                    ? 'Le destinataire rejoindra directement cette table.'
                    : 'The recipient will join this table directly.') +
                '</div>' +
              '</div>';
    }

    bodyEl.innerHTML = html;

    // Also add a "👁 N" badge to the subtitle when there's at least
    // one spectator (besides ourselves). Tiny detail but it makes
    // the spectator presence visible WITHOUT having to scroll the
    // modal — the badges are right under the title.
    if (_specPids.size > 0) {
      var specBadge = '<span class="gim-badge gim-badge-spec">👁 ' +
                      _specPids.size + '</span>';
      subEl.innerHTML = subEl.innerHTML + ' ' + specBadge;
    }

    modal.style.display = 'flex';
  }
  window.openGameInfoPopup = openGameInfoPopup;

  function closeGameInfoPopup() {
    var modal = document.getElementById('game-info-modal');
    if (modal) modal.style.display = 'none';
  }
  window.closeGameInfoPopup = closeGameInfoPopup;
  let seats     = [];  // player IDs in seat order (from GameStartInitial) — figé après 1ère main
  let seatData  = {};  // {pid: {money, bet, action, active, folded}}
  let myCards   = [null, null];
  let commCards = [];
  let highestBet= 0;
  let minRaise  = 0;
  let pot          = 0;
  let collectedPot = 0;  // bets accumulated from previous rounds
  let dealerPid = 0;
  let turnPid   = 0;
  let _timerID  = null;   // setInterval handle
  let _timerSec = 0;      // seconds remaining
  let _timerTot = 30;     // total seconds
  let gameTimeout = 15;   // timeout par joueur (depuis les settings de la partie)
  // Starting stack for this table. Pulled from NetGameInfo.startMoney
  // (field 13, written by buildCreateGame) or set directly by the table
  // creator. Used as the default money value when GameStartInitial
  // initializes seatData — without this the stacks all start at 0 and the
  // Call button mis-fires as "Call 0 (All-In)" before any action lands.
  let gameStartMoney = 3000;

  // ── Statistiques de session ──
  var _stats = { handsPlayed:0, handsWon:0, startMoney:0, peakMoney:0, totalGain:0,
                 bigWin:0, bigLoss:0, history:[] };
  var _statsInited = false;

  // ── Positions des sièges (pour les animations) ──
  var _lastPixPos = [];  // [{top, left}] dans l'ordre de rotated
  var _potCenter  = {x:0, y:0}; // centre du pot à l'écran
  let amInGame  = false;
  let myName    = '';
  let games     = {};   // gameId → {name, mode, players, maxPlayers, type, priv}
  let players   = {};   // playerId → name
  let loaded    = false;
  let autoAction = false;
  let amGameAdmin = false;  // true if we created this game

  // Snapshot of the current table's settings, captured at JoinGameAck.
  // games[gId] is deleted from the lobby dict when the table closes
  // (GameListUpdate with mode === 3), so we keep our own copy. Used
  // by openGameInfoPopup() to populate the table-info modal even
  // after the table no longer appears in the lobby list.
  let _gameMeta = null;
  let _gameStarted = false; // flips true on GameStartInitial; freezes waiting-panel updates
  let _seatsFrozen = false; // one-way latch: true once the original seating order is set, never unset until leave/closeTable
  let _amSpectator = false; // true when we joined via 'Regarder' / spectateGame() — disables actions, shows banner

  // ── Haptic feedback (mobile) ──────────────────────────────────
  // Vibrates the device when it becomes the user's turn. Especially
  // useful when the app is backgrounded (sound may be muted by the
  // OS but vibration still fires). Gated by a persisted flag so the
  // user can turn it off; defaults ON. navigator.vibrate is a no-op
  // / undefined on desktop browsers and iOS Safari (which doesn't
  // support the Vibration API), so we feature-detect every call.
  let _hapticEnabled = (function() {
    try { return localStorage.getItem('pth_haptic') !== '0'; } catch(e) { return true; }
  })();
  function hapticBuzz(pattern) {
    if (!_hapticEnabled) return;
    try {
      if (navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern || 60);
      }
    } catch(e) {}
  }
  function toggleHaptic() {
    _hapticEnabled = !_hapticEnabled;
    try { localStorage.setItem('pth_haptic', _hapticEnabled ? '1' : '0'); } catch(e) {}
    // Give immediate tactile + textual confirmation.
    if (_hapticEnabled) hapticBuzz(40);
    var fr = (typeof _lang === 'undefined' || _lang !== 'en');
    var label = _hapticEnabled
      ? (fr ? 'Vibration activée' : 'Vibration on')
      : (fr ? 'Vibration désactivée' : 'Vibration off');
    if (typeof showKeyHint === 'function') showKeyHint(label);
    // Refresh the menu button label/emoji.
    var b = document.getElementById('haptic-toggle-mob');
    if (b) b.innerHTML = (_hapticEnabled ? '📳' : '📴') + ' ' +
      (fr ? 'Vibration' : 'Vibration');
    return _hapticEnabled;
  }
  window.toggleHaptic = toggleHaptic;
  // Spectators present on the current table. Populated by
  // GameSpectatorJoined messages from the server (one is sent per
  // existing spectator when we ourselves join, plus live updates
  // as people come and go). Reset on JoinGameAck / closeTable.
  let _specPids = new Set();
  let _lobbyPlayerCount = 0; // running tally of players online; updated by PlayerListMessage + StatisticsMessage
  let _hasStatistics = false; // true once we've seen a StatisticsMessage; takes precedence over the PlayerList tally
  let _lobbyPids = new Set(); // pids currently online in the lobby (driven by PlayerList add/remove events)
  let _pendingNameRequests = new Set(); // pids we've already asked the server about, to avoid spamming PlayerInfoRequest
  // ── Feature flag: auto-check / auto-fold next-turn checkbox ────────
  // When true, the action bar shows a checkbox above the action buttons
  // that arms an automatic fold (or check, if currently free) for the
  // user's next turn this hand. When false, the checkbox is not rendered
  // at all but the underlying logic stays intact — flipping this back to
  // `true` reinstates the feature without touching anything else.
  const FEATURE_AUTO_CHECK_FOLD = false;
  let _autoCheckFold = false; // armed by the per-turn checkbox; auto-resets every HandStart
  let _lastConnectParams = null;
  // Track mode + name of last Init sent so we can detect 'rapid mode swap'
  // patterns that the PokerTH server's anti-brute-force flags as
  // suspicious. When the user switches between login modes (guest /
  // unauth / auth / LAN) without enough time between Init messages, the
  // server temporarily blocks the IP. We enforce a minimum gap if the
  // mode or nickname changes between two connect() calls.
  let _lastInitMode = null;     // string: 'lan' / 'unauth' / 'guest' / 'auth'
  let _lastInitNick = null;     // user-typed nickname at time of last Init
  let _lastInitTime = 0;        // timestamp of last Init sent
  let _connectingNow = false;   // re-entrancy guard to ignore double-clicks
  const MODE_SWAP_MIN_GAP = 3000;  // ms — server blocks below ~2s in tests
  let _currentLoginMode = 'lan';
  let _lastMsgWasReaction = false; // true si le dernier chat envoyé était une réaction
  let _chatRejectShown = false;    // n'afficher l'avertissement LAN qu'une seule fois // pour la reconnexion auto
  let _reconnectAttempts = 0;
  let _intentionalDisconnect = false;
  let _wasAuthenticated = false; // true seulement après InitAck réussi
  let _lastConnectTime = 0;      // timestamp de la dernière tentative
  let _lastConnectFailed = false; // true si la dernière tentative a échoué
  let _ipBlockUntil = 0;         // timestamp de fin de blocage IP
  const MIN_CONNECT_INTERVAL = 1500; // 1.5s minimum (anti double-clic) — espacer via proxy

  // ── DOM ──
  const $ = id => document.getElementById(id);

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
  }

  function setStatus(txt, cls='') {
    const el = $('cstatus');
    el.textContent = txt;
    el.className = 'status ' + cls;
  }

  // ── RÉSEAU ──
  function send(data) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (directWS) {
      // Direct WSS to pokerth.net: raw protobuf, no length prefix
      ws.send(data);
      return;
    }
    // Proxy mode: 4-byte big-endian length prefix + data
    const frame = new ArrayBuffer(4 + data.byteLength);
    new DataView(frame).setUint32(0, data.byteLength, false);
    new Uint8Array(frame).set(data, 4);
    ws.send(frame);
  }

  function onRawData(chunk) {
    if (typeof chunk === 'string') return; // ignore text frames
    if (directWS) {
      // Direct WSS: each WS message is one complete protobuf (no length prefix)
      handleMsg(new Uint8Array(chunk));
      return;
    }
    const tmp = new Uint8Array(rxBuf.length + chunk.byteLength);
    tmp.set(rxBuf);
    tmp.set(new Uint8Array(chunk), rxBuf.length);
    rxBuf = tmp;

    while (rxBuf.length >= 4) {
      const len = new DataView(rxBuf.buffer, rxBuf.byteOffset).getUint32(0, false);
      if (rxBuf.length < 4 + len) break;
      handleMsg(rxBuf.slice(4, 4 + len));
      rxBuf = rxBuf.slice(4 + len);
    }
  }

  // ── HANDLER DE MESSAGES ──
  function handleMsg(buf) {
    const { type, sub } = MSG.parse(buf);
    const T = MSG.T;

    switch (type) {

      // Le serveur s'annonce → on envoie notre Init
      case T.Announce: {
        const pv    = Proto.sub(sub, 1); // protocolVersion (réseau, ex: 5.1)
        const gv    = Proto.sub(sub, 2); // latestGameVersion (appli, ex: 2.0)
        const stype = Proto.u32(sub, 4); // 0=LAN, 1=NoAuth, 2=Auth
        const np    = Proto.u32(sub, 5);
        const pMaj  = Proto.u32(pv, 1), pMin = Proto.u32(pv, 2);
        const gMaj  = Proto.u32(gv, 1), gMin = Proto.u32(gv, 2);

        const loginMode = $('login-mode') ? $('login-mode').value : 'guest';
        if (stype === 2 && loginMode !== 'guest' && loginMode !== 'auth') {
          setStatus('This server requires authentication.', 'err');
          ws.close(); return;
        }
        let loginType;
        if (loginMode === 'unauth' || loginMode === 'guest') loginType = 2;
        else if (loginMode === 'auth') loginType = 1;
        else loginType = 0; // lan
        const typeLabel = ['LAN','Internet (no-auth)','Internet (auth)'][stype] || 'Serveur';
        setStatus(t('connectingPlayers').replace('{type}', typeLabel).replace('{ver}', pMaj + '.' + pMin).replace('{n}', np));
        lastMajor = pMaj; lastMinor = pMin; lastLoginType = loginType;
        const authPass = (loginType === 1) ? ($('pass') ? $('pass').value : '') : null;
        send(MSG.buildInit(myName, pMaj, pMin, loginType, authPass));
        break;
      }

      // Connexion acceptée
      case T.InitAck: {
        _wasAuthenticated = true;
        _lastConnectFailed = false; // connexion réussie
        _reconnectAttempts = 0;
        myId = Proto.u32(sub, 2);
        updateLobbyPill();
        show('s-lobby');
        // Demander la permission pour les notifications
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().catch(function(){});
        }
        addChat(null, t('connectedAsGuest').replace('{name}', myName).replace('{id}', myId), 'sys');
        const cfName = document.getElementById('cf-name');
        if (cfName) cfName.value = 'Table de ' + myName;  // always update with current name
        break;
      }

      // Erreur serveur
      case T.AuthChallenge: {
        // SCRAM removed on server — reply with empty response
        setStatus('Vérification du compte...');
        send(MSG.buildAuthResponse());
        break;
      }

      case T.Error: {
        _lastConnectFailed = true;
        const codes = {1:'Version incompatible',2:'Serveur plein',3:'Auth échouée',
          4:'Pseudo déjà pris',5:'Pseudo invalide',6:'Maintenance',7:'Bloqué'};
        const r = Proto.u32(sub, 1);
        if (r === 3) {
          // initAuthFailure: login/password rejected by server
          setStatus(t('errBadCreds'), 'err');
          ws.close(); return;
        }
        if (r === 7) {
          _intentionalDisconnect = true;
          _wasAuthenticated = false;
          _hideBanner();
          _ipBlockUntil = Date.now() + 1 * 60 * 1000; // 1 minute (was 5 — server usually clears earlier)
          _startIpBlockCountdown();
          setStatus('⏳ IP bloquée — attendez 5 minutes puis réessayez.', 'err'); return;
        }
        if (r === 4) {
          // Name in use: auto-retry with random suffix
          const suffix = Math.floor(Math.random()*999)+1;
          myName = myName.replace(/_\d+$/, '') + '_' + suffix;
          setStatus(t('errNickTakenRetry').replace('{name}', myName));
          setTimeout(() => {
            send(MSG.buildInit(myName, lastMajor || 5, lastMinor || 1, lastLoginType || 0));
          }, 400);
        } else {
          setStatus(t('errGeneric').replace('{code}', codes[r] || ('code ' + r)), 'err');
        }
        break;
      }

      // ── Lobby player roster (PlayerListMessage) ──
      // Sent by the server when a player joins or leaves the lobby.
      // We maintain a local _lobbyPlayerCount fallback for servers
      // (typical of LAN / private deployments) that don't send the
      // periodic StatisticsMessage. If StatisticsMessage IS received,
      // its value takes precedence — see _hasStatistics flag.
      case T.PlayerList: {
        // PlayerListMessage: playerId=1, notification=2 (0=new, 1=left)
        const _pid_pl = Proto.u32(sub, 1);
        const notif = Proto.u32(sub, 2);
        if (notif === 0) {
          _lobbyPlayerCount++;
          _lobbyPids.add(_pid_pl);
          // Fetch the player's name so the players-online panel can
          // show something better than '#42'. Skip if we already
          // know the name OR have already asked.
          if (!players[_pid_pl] && !_pendingNameRequests.has(_pid_pl)) {
            _pendingNameRequests.add(_pid_pl);
            try {
              const req = Proto.encode([[1,0,_pid_pl]]);
              send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,req]]));
            } catch(e) {}
          }
        } else if (notif === 1) {
          _lobbyPlayerCount = Math.max(0, _lobbyPlayerCount - 1);
          _lobbyPids.delete(_pid_pl);
          _pendingNameRequests.delete(_pid_pl);
        }
        if (!_hasStatistics) {
          $('h-players').textContent = _lobbyPlayerCount + ' ' + t('playersOnline');
        }
        // Refresh the panel if it's open.
        var _pp = document.getElementById('players-panel');
        if (_pp && _pp.style.display !== 'none' && typeof renderPlayersList === 'function') renderPlayersList();
        break;
      }

      // Statistiques (nombre de joueurs connectés)
      case T.Statistics: {
        const arr = sub[1] || [];
        for (const d of arr) {
          const s = Proto.decode(d);
          if (Proto.u32(s,1) === 1) {
            // Server-authoritative count. Mark the flag so PlayerList
            // updates stop overriding the header pill from below.
            _hasStatistics = true;
            _lobbyPlayerCount = Proto.u32(s,2);
            $('h-players').textContent = _lobbyPlayerCount + ' ' + t('playersOnline');
          }
        }
        break;
      }

      // Profil d'un joueur reçu
      case T.PlayerInfoReply: {
        const pid = Proto.u32(sub, 1);
        const info = Proto.sub(sub, 2);
        const name = Proto.str(info, 1);
        if (name) players[pid] = name;
        _pendingNameRequests.delete(pid); // got the reply, free for retry if needed
        // ── Step 1 (PokerTH avatar): peek for the optional AvatarData
        // sub-message (field 5). Present only for registered players who
        // uploaded an avatar on pokerth.net. We just log + memoize.
        // The download (AvatarRequest/Header/Data/End) is intentionally
        // NOT done yet -- this step exists to verify hashes are
        // detected correctly before we add anything else.
        const avData = Proto.sub(info, 5);
        if (avData && Object.keys(avData).length > 0) {
          const avType = Proto.u32(avData, 1); // 1=PNG, 2=JPG, 3=GIF
          const avHashBytes = Proto.raw(avData, 2);
          if (avHashBytes && avHashBytes.length > 0) {
            // Convert bytes to lower-case hex string for logging.
            let hashHex = '';
            for (let i = 0; i < avHashBytes.length; i++) {
              const h = avHashBytes[i].toString(16);
              hashHex += (h.length === 1 ? '0' : '') + h;
            }
            _pthAvatarHashes[pid] = { type: avType, hashHex: hashHex };
            // ── Step 3: cache hit?
            // If the same hash has been downloaded in a previous session
            // and is still in localStorage, restore it immediately --
            // no network round-trip, no AvatarRequest, no waiting.
            if (!_pthAvatarsByHash[hashHex] && !_pthDataUrls[hashHex]) {
              const cached = _pthCacheGet(hashHex);
              if (cached) {
                _pthAvatarsByHash[hashHex] = {
                  status: 'done', type: cached.type, expectedSize: 0,
                  chunks: [], received: 0,
                };
                _pthDataUrls[hashHex] = cached.dataUrl;
                // Re-render so the seat picks up the image right away.
                if (typeof window._renderSeats === 'function') window._renderSeats();
                if (typeof window.refreshMyAvatar === 'function') window.refreshMyAvatar();
              }
            }
            // ── Step 2: cache miss -> kick off an AvatarRequest. Dedup
            // by hash so two players sharing an avatar download once.
            if (!_pthAvatarsByHash[hashHex]) {
              _pthAvatarsByHash[hashHex] = {
                status: 'pending', // 'pending' | 'done' | 'unknown' | 'error'
                type:   avType,
                expectedSize: 0,   // filled by AvatarHeader
                chunks: [],        // Uint8Array[] -- joined at AvatarEnd
                received: 0,       // running total bytes
              };
              const reqId = _pthNextAvatarReqId++;
              _pthAvatarReqIdToHash[reqId] = hashHex;
              const reqMsg = Proto.encode([
                [1, 0, reqId],
                [2, 2, avHashBytes],
              ]);
              send(Proto.encode([[1, 0, T.AvatarRequest], [8, 2, reqMsg]]));
            } else if (_pthAvatarsByHash[hashHex].status === 'done') {
              // Already cached this session -- nothing to do, the
              // re-render path will pick it up.
            }
          }
        }
        // If the waiting panel is visible, update it so the new pseudo
        // appears in place of the temporary '#<pid>' placeholder.
        if (!_gameStarted && amInGame) renderWaitingPanel();
        // Same idea for the lobby players panel.
        var _pp2 = document.getElementById('players-panel');
        if (_pp2 && _pp2.style.display !== 'none' && typeof renderPlayersList === 'function') renderPlayersList();
        break;
      }

      // ──────────────────────────────────────────────────────────────
      // PokerTH avatar download flow -- STEP 2: parse server replies.
      // No assembly into a Blob/Data URL yet, no display. Just log so
      // we can verify the server actually streams the bytes back.
      // ──────────────────────────────────────────────────────────────
      case T.AvatarHeader: {
        const reqId = Proto.u32(sub, 1);
        const avType = Proto.u32(sub, 2);
        const size = Proto.u32(sub, 3);
        const hashHex = _pthAvatarReqIdToHash[reqId];
        const entry = hashHex ? _pthAvatarsByHash[hashHex] : null;
        if (entry) {
          entry.expectedSize = size;
          // Server may correct the type vs what PlayerInfoReply said
          if (avType) entry.type = avType;
        }
        break;
      }
      case T.AvatarData: {
        const reqId = Proto.u32(sub, 1);
        const block = Proto.raw(sub, 2); // Uint8Array of this chunk
        const hashHex = _pthAvatarReqIdToHash[reqId];
        const entry = hashHex ? _pthAvatarsByHash[hashHex] : null;
        if (entry && block) {
          entry.chunks.push(block);
          entry.received += block.length;
        }
        break;
      }
      case T.AvatarEnd: {
        const reqId = Proto.u32(sub, 1);
        const hashHex = _pthAvatarReqIdToHash[reqId];
        const entry = hashHex ? _pthAvatarsByHash[hashHex] : null;
        if (entry) {
          entry.status = 'done';
          // ── Step 3: assemble chunks into a Data URL, cache it,
          // free the chunk buffers, then trigger a re-render so the
          // freshly arrived image appears at the table.
          try {
            const dataUrl = _pthAssembleDataUrl(entry.chunks, entry.type);
            _pthDataUrls[hashHex] = dataUrl;
            _pthCachePut(hashHex, entry.type, dataUrl);
            // Release chunk references so the GC can reclaim them.
            entry.chunks = [];
          } catch(e) {
            console.warn('[pth-avatar] assembly failed for hash=' + hashHex, e);
            entry.status = 'error';
          }
        }
        // Re-render: seats around the table + my own seat in the bar.
        if (typeof window._renderSeats === 'function') window._renderSeats();
        if (typeof window.refreshMyAvatar === 'function') window.refreshMyAvatar();
        if (hashHex) delete _pthAvatarReqIdToHash[reqId];
        break;
      }
      case T.UnknownAvatar: {
        const reqId = Proto.u32(sub, 1);
        const hashHex = _pthAvatarReqIdToHash[reqId];
        const entry = hashHex ? _pthAvatarsByHash[hashHex] : null;
        if (entry) {
          entry.status = 'unknown';
        }
        if (hashHex) delete _pthAvatarReqIdToHash[reqId];
        break;
      }

      // Nouvelle table dans la liste
      case T.GameListNew: {
        const id   = Proto.u32(sub, 1);
        const mode = Proto.u32(sub, 2); // 1=created,2=started,3=closed
        const priv = Proto.u32(sub, 3);
        const gi   = Proto.sub(sub, 6); // NetGameInfo
        const name = Proto.str(gi, 1) || `#${id}`;
        const gtype= Proto.u32(gi, 2);
        const maxp = Proto.u32(gi, 3);

        // Compter les joueurs (packed varints dans le champ 4)
        let pc = 0;
        if (sub[4]) {
          let pos = 0; const p = sub[4][0];
          while (pos < p.length) { const r = Proto.decodeVarint(p, pos); pos = r.pos; pc++; }
        }

        // Pull playerActionTimeout from the NetGameInfo we already decoded
        // above (field 6 of GameListNewMessage). Previous attempts probed
        // sub[13] / sub[5] for a NetGameInfo that lives under neither —
        // both came back null, so `timeout` always fell through to the
        // hard-coded 15 s default regardless of what the table creator
        // had set. NetGameInfo.playerActionTimeout is field 11 (see
        // buildCreateGame above, which writes the same key).
        var _gto = Proto.u32(gi, 11) || 0;
        // NetGameInfo.startMoney is field 13 — same key the table creator
        // wrote via buildCreateGame(). Default to 3000 if absent (matches
        // the PokerTH server default for unconfigured games).
        var _gsm = Proto.u32(gi, 13) || 0;
        games[id] = { name, mode, players:pc, maxPlayers:maxp, type:gtype, priv:!!priv,
                      timeout: _gto || 15, startMoney: _gsm || 3000 };
        if (!loaded) { loaded = true; }
        renderGames();
        // ── Auto-join from a share link ──
        // If we arrived via a "copy table link" URL and this is the
        // table it pointed to, join it now (the lobby has just told
        // us it exists). Clear the pending id so we only do it once.
        // window._pendingAutoJoin is set by parseShareLink() which
        // runs at global scope (outside this IIFE).
        if (window._pendingAutoJoin && id === window._pendingAutoJoin && !amInGame) {
          var _aj = window._pendingAutoJoin;
          window._pendingAutoJoin = 0;
          var fr = (typeof _lang === 'undefined' || _lang !== 'en');
          addChat(null, '🔗 ' + (fr
            ? 'Table partagée trouvée — connexion…'
            : 'Shared table found — joining…'), 'sys');
          // Defer slightly so renderGames() has painted and games[id]
          // is fully populated before joinGame reads it.
          setTimeout(function(){
            try { if (App && App.joinGame) App.joinGame(_aj); } catch(e) {}
          }, 150);
        }
        break;
      }

      // Mise à jour d'une table (état)
      case T.GameListUpdate: {
        const id   = Proto.u32(sub, 1);
        const mode = Proto.u32(sub, 2);
        if (games[id]) {
          if (mode === 3) delete games[id];
          else games[id].mode = mode;
          renderGames();
        }
        break;
      }

      // Un joueur rejoint / quitte une table
      case T.GameListPlayerJoined: {
        const id = Proto.u32(sub, 1);
        if (games[id]) { games[id].players++; renderGames(); }
        break;
      }
      case T.GameListPlayerLeft: {
        const id = Proto.u32(sub, 1);
        if (games[id] && games[id].players > 0) { games[id].players--; renderGames(); }
        break;
      }
      case T.GameListSpectatorJoined: {
        /* pas besoin de compter les spectateurs ici */ break;
      }
      case T.GameListSpectatorLeft: { break; }

      // ── Spectator events SCOPED to the current game ──
      // Type 80/81. The lobby-level 78/79 above are different (they
      // tick a spectator count on each table card in the games list).
      // 80/81 only arrive while we're inside a game (player OR
      // spectator) and refer to OTHER spectators watching the same
      // table. The server replays Joined for each existing spectator
      // right after our JoinGameAck, so we don't need a separate
      // "fetch initial list" round-trip.
      case T.GameSpectatorJoined: {
        const spid = Proto.u32(sub, 2);
        if (spid && spid !== myId) {
          _specPids.add(spid);
          // Request the pseudo if we don't have it yet. PlayerInfoReply
          // will populate players[spid] and the modal renderer reads
          // straight from there, so the row updates next time the modal
          // is opened (or right now if it's already open).
          if (!players[spid]) {
            try {
              const req = Proto.encode([[1,0,spid]]);
              send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,req]]));
            } catch(e) {}
          }
          // If the modal is currently open, re-render it so the new
          // spectator appears live.
          var _gim = document.getElementById('game-info-modal');
          if (_gim && _gim.style.display === 'flex') {
            try { openGameInfoPopup(); } catch(e) {}
          }
        }
        break;
      }
      case T.GameSpectatorLeft: {
        const spid = Proto.u32(sub, 2);
        if (spid) {
          _specPids.delete(spid);
          var _gim2 = document.getElementById('game-info-modal');
          if (_gim2 && _gim2.style.display === 'flex') {
            try { openGameInfoPopup(); } catch(e) {}
          }
        }
        break;
      }

      // Message de chat
      case T.Chat: {
        const pid  = Proto.u32(sub, 2);
        const ctype= Proto.u32(sub, 3);
        const text = Proto.str(sub, 4);
        const who  = players[pid] || (pid ? `#${pid}` : null);
        const cls  = ctype === 3 ? 'bc' : pid === myId ? 'mine' : '';
        // Logging de tous les messages chat (debug réactions)
        // Intercepter les réactions (préfixe ASCII [R])
        if (text && text.startsWith('[R]') && text.length < 12) {
          var reactEmoji = text.slice(3);
          if (pid !== myId) {
            handleIncomingReaction(pid, reactEmoji);
            // Pas d'affichage dans le chat — animation seule
          }
        } else {
          addChat(who, text, cls);
        }
        break;
      }
      case T.TimeoutWarning: {
        const sec = Proto.u32(sub, 2);
        _timerSec = sec; // Sync avec le serveur
        // Si le serveur donne plus de temps que prévu, ajuster le total
        if (sec > _timerTot) _timerTot = sec;
        addChat(null, '⏰ Délai: ' + sec + 's — jouez vite !', 'sys');
        // Auto-reset timeout
        const rtm = Proto.encode([[1,0,68],[69,2,new Uint8Array(0)]]);
        send(rtm);
        break;
      }

      case T.ChatReject: {
        const rejText = Proto.str(sub, 1);
        if (_lastMsgWasReaction) {
          // Réaction rejetée (mode LAN/invité) — afficher badge local uniquement
          _lastMsgWasReaction = false;
          if (!_chatRejectShown) {
            _chatRejectShown = true;
            // Note discrète dans la barre de réactions
            var rb = document.getElementById('reaction-bar');
            if (rb) {
              var note = document.createElement('div');
              note.style.cssText = 'font-size:0.52rem;color:rgba(255,180,50,0.7);text-align:center;width:100%;margin-top:2px;font-style:italic';
              note.textContent = _currentLoginMode === 'lan'
                ? '⚠ Mode LAN : réactions locales. Utilisez Internet Invité pour les partager.'
                : '⚠ Réactions locales seulement (chat refusé par le serveur)';
              rb.appendChild(note);
              setTimeout(function(){ note.style.opacity='0'; note.style.transition='opacity 1s'; setTimeout(function(){ note.remove(); }, 1000); }, 5000);
            }
          }
        } else {
          _lastMsgWasReaction = false;
          if (!amInGame) addChat(null, '⚠ Chat refusé: ' + rejText, 'sys');
          else if (!_chatRejectShown) {
            _chatRejectShown = true;
            if (_currentLoginMode === 'lan') {
              addGameChat(null,
                '⚠ Mode LAN : chat en jeu désactivé. ' +
                'Connectez-vous en mode "Internet Invité" pour activer le chat et les réactions.',
                'sys');
            } else {
              addGameChat(null,
                '⚠ Chat refusé par le serveur. Vérifiez que ServerRestrictGuestLogin=0 dans la config.',
                'sys');
            }
          }
        }
        break;
      }

      case T.JoinGameAck: {
        gId = Proto.u32(sub, 1);
        // Fresh game = empty spectator set. The server will replay
        // GameSpectatorJoined for each existing spectator so we'll
        // rebuild the set within milliseconds.
        _specPids = new Set();
        const isAdmin = Proto.u32(sub, 2);
        // Appliquer le timeout de la partie (depuis games[] si on rejoint, sinon celui créé)
        if (games[gId] && games[gId].timeout) gameTimeout = games[gId].timeout;
        // Same for starting stack so the seat-data init (line ~1770) uses
        // the real configured value instead of 0. When *we* are the
        // creator, createGame() already wrote gameStartMoney directly —
        // this branch handles the case where we joined someone else's
        // table and discovered the settings via GameListNew.
        if (games[gId] && games[gId].startMoney) gameStartMoney = games[gId].startMoney;
        amGameAdmin = !!isAdmin;
        // Snapshot the lobby's view of this table for openGameInfoPopup.
        // Fields we care about: name, type, maxPlayers, priv, timeout,
        // startMoney. All of these come from NetGameInfo when the table
        // was originally listed. Default the name to "#<gId>" if missing.
        var _gm = (games[gId] || {});
        _gameMeta = {
          id:         gId,
          name:       _gm.name || ('#' + gId),
          type:       _gm.type || 1,       // 1=NoLimit Hold'em (default)
          maxPlayers: _gm.maxPlayers || 0,
          priv:       !!_gm.priv,
          timeout:    _gm.timeout || gameTimeout || 15,
          startMoney: _gm.startMoney || gameStartMoney || 3000,
        };
        // Note: we intentionally keep the static "TABLE" label in the
        // header rather than swapping in _gameMeta.name. Long table
        // names like "WebGame-Nono le rigolo" overflow the header on
        // mobile and hide the admin badge + control buttons. The full
        // name is still shown as the title of the game-info modal
        // when the user clicks "TABLE".
        var acb = document.getElementById('admin-close-btn');
        if (acb) acb.style.display = amGameAdmin ? '' : 'none';
        var asb = document.getElementById('admin-start-btn');
        if (asb) asb.style.display = amGameAdmin ? '' : 'none';
        var acbm = document.getElementById('admin-close-mob');
        if (acbm) acbm.style.display = amGameAdmin ? '' : 'none';
        // Kick button: shown only to admins (server ignores non-admin
        // KickPlayerRequest anyway, but exposing it would be confusing).
        var akb = document.getElementById('admin-kick-btn');
        if (akb) akb.style.display = amGameAdmin ? '' : 'none';
        var akbm = document.getElementById('admin-kick-mob');
        if (akbm) akbm.style.display = amGameAdmin ? '' : 'none';
        var asbm = document.getElementById('admin-start-mob');
        if (asbm) asbm.style.display = amGameAdmin ? '' : 'none';
        addChat(null, t('joinedTableWaiting').replace('{gid}', gId).replace('{admin}', isAdmin ? ' (admin)' : ''), 'sys');
        show('s-game');
        // ── Spectator UI mode ──
        // If we joined via spectateGame(), flip the banner up top and put
        // a 'You are watching' message in place of the action bar. Player
        // join paths leave _amSpectator untouched (still false) so this
        // branch is skipped and the regular waiting panel logic applies.
        var _specBan = document.getElementById('g-spectator-banner');
        if (_amSpectator) {
          if (_specBan) _specBan.style.display = '';
          // Replace action area with a static spectator message.
          // renderGameWaiting() targets #g-actions, perfect for this.
          renderGameWaiting(
            '<div class="spectator-message">' +
              '<span class="sm-icon">👁</span>' +
              t('spectatorActionMsg') +
            '</div>',
            true
          );
        } else {
          if (_specBan) _specBan.style.display = 'none';
        }
        document.body.classList.add('in-game');
        // Diffuser l'avatar aux autres joueurs via le proxy. We use
        // _myAvatarToBroadcast() which collapses the '__pth__' sentinel
        // to '' -- the other players will then receive an empty avatar
        // and render our initial. They'll still get our real PokerTH
        // avatar (if any) through their own PlayerInfoReply flow, so
        // sending the sentinel would just produce visual garbage.
        setTimeout(function() {
          try {
            var myAv = _myAvatarToBroadcast();
            if (ws && ws.readyState === WebSocket.OPEN && !directWS) {
              ws.send('AVATAR:' + myId + ':' + myAv);
            }
          } catch(e) {}
        }, 500);
        // Plusieurs tentatives pour s'assurer que la table s'affiche
        [100, 300, 600, 1200].forEach(function(d){
          setTimeout(function(){
            autoScaleTable();
            if (seats.length > 0) renderSeats();
          }, d);
        });
        setTimeout(animateTableEnter, 100);
        // Mettre à jour le label de la barre de réactions selon le mode
        var rbl = document.getElementById('reaction-bar-label');
        if (rbl) {
          if (_currentLoginMode === 'lan') {
            rbl.textContent = 'Réactions (locales — mode LAN)';
            rbl.style.color = 'rgba(255,180,50,0.6)';
          } else {
            rbl.textContent = 'Réactions';
            rbl.style.color = '';
          }
        }
        const admBadge = document.getElementById('g-admin-badge');
        if (admBadge) admBadge.style.display = amGameAdmin ? '' : 'none';
        setTimeout(function(){ autoScaleTable(); }, 200);
        renderWaitingPanel();
        // The list of already-present players arrives via subsequent
        // GamePlayerJoined messages from the server. Schedule a few
        // refreshes so the panel populates as those messages land,
        // and so PlayerInfoRequest replies catch up.
        [200, 600, 1200, 2500].forEach(function(d){
          setTimeout(function(){ if (!_gameStarted) renderWaitingPanel(); }, d);
        });
        break;
      }

      case T.JoinGameFailed: {
        const failedGameId = Proto.u32(sub, 1);
        const failCode = Proto.u32(sub, 2);
        // PokerTH JoinGameFailureReason codes from pokerth.proto:
        // 1=invalidGame, 2=gameIsFull, 3=gameIsRunning, 4=invalidPassword,
        // 5=notAllowedAsGuest, 6=notInvited, 7=gameNameInUse, 8=badGameName,
        // 9=invalidSettings, 10=ipAddressBlocked, 11=rejoinFailed, 12=noSpectatorsAllowed
        const errMsgs = {
          1: t('errInvalidGame')||'Invalid game',
          2: t('errGameFull')||'Game is full',
          3: t('errInProgress')||'Game already started',
          4: t('errWrongPassword')||'Wrong password',
          5: t('errGuestsNotAllowed')||'Guests are not allowed on this table',
          6: t('errNotInvited')||'Invite-only table — you need an explicit invitation from the host',
          7: t('errNameUsed')||'Game name already in use',
          8: t('errBadGameName')||'Bad game name',
          9: t('errInvalidSettings')||'Invalid game settings',
          10: t('errBlocked')||'IP address blocked',
          11: t('errRejoinFailed')||'Rejoin failed',
          12: t('errNoSpectators')||'Spectators are not allowed'
        };
        const errMsg = errMsgs[failCode] || 'Join failed for game '+failedGameId+' (code '+failCode+')';
        setStatus('⚠ ' + errMsg, 'err');
        // Re-show password prompt if wrong password
        if (failCode === 4) {
          var pp2 = document.getElementById('password-prompt');
          if (pp2 && pp2.dataset.gameId) {
            pp2.style.display = 'flex';
            var ppin = document.getElementById('pp-pass');
            if (ppin) { ppin.value = ''; ppin.focus(); }
          }
        }
        break;
      }

      case T.GamePlayerJoined: {
        const pid = Proto.u32(sub, 2);
        if (!seatData[pid]) seatData[pid] = {money:0,bet:0,action:'',active:false,folded:false};
        // 'gone' means the player has been seen leaving (GamePlayerLeft).
        // We reset it to false here because the same pid can rejoin (rare,
        // but possible if the player closes and reopens the tab fast).
        seatData[pid].gone = false;
        // ── SPECTATOR LATE-ARRIVAL FIX ──
        // When the game has already started (HandStart was processed), we
        // append late-arriving pids straight to seats[] so they appear
        // visually around the felt. For player mode this is a no-op
        // (GameStartInitial populated seats[] before the first
        // GamePlayerJoined, and the includes() check skips the duplicate).
        // For spectator mode it's the only path that learns about
        // newcomers after our HandStart bootstrap.
        if (_gameStarted && !seats.includes(pid)) {
          seats.push(pid);
          renderSeats();
        }
        const name = players[pid] || '#'+pid;
        addChat(null, name + ' rejoint la table', 'sys');
        // Ask the server for this player's name if we don't have it yet,
        // so the waiting panel can display a real pseudo rather than '#42'.
        if (!players[pid]) {
          try {
            const req = Proto.encode([[1,0,pid]]);
            send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,req]]));
          } catch(e) {}
        }
        // Refresh the waiting panel if the game hasn't started yet.
        if (!_gameStarted) renderWaitingPanel();
        break;
      }

      case T.GamePlayerLeft: {
        const pid = Proto.u32(sub, 2);
        const name = players[pid] || '#'+pid;
        addChat(null, t('playerLeftTable').replace('{name}', name), 'sys');
        if (seatData[pid]) { seatData[pid].active = false; seatData[pid].gone = true; }
        renderSeats();
        // Refresh the waiting panel if the game hasn't started yet.
        if (!_gameStarted) renderWaitingPanel();
        // ── Detect "only one player left" and force end-of-game ──
        // PokerTH server 1.1.2-2 is known to OMIT EndOfGameMessage
        // when a player leaves voluntarily (vs being eliminated by
        // a losing all-in). Without this, the remaining human keeps
        // posting blinds and 'winning' lonely hands forever.
        // The user-validated rule (Q1=c): if total non-gone seats
        // drop to <= 1, fire the overlay locally with the last
        // remaining pid as the winner. The eg-overlay handler itself
        // is idempotent — calling it again if EndOfGame eventually
        // arrives from the server is harmless.
        if (_gameStarted) {
          var stillIn = seats.filter(function(p) {
            return seatData[p] && !seatData[p].gone;
          });
          if (stillIn.length <= 1) {
            // Don't re-trigger if an end-game overlay is already up.
            var _egoEl = document.getElementById('g-endgame-overlay');
            var alreadyShown = _egoEl && _egoEl.style.display !== 'none' && _egoEl.style.display !== '';
            // (empty string defaults to block via CSS; treat that as visible)
            // Stricter check: simply look at the offsetParent.
            var visible = _egoEl && _egoEl.offsetParent !== null;
            if (!visible) {
              var winnerPid = stillIn[0] || myId;
              addChat(null, '⚠ ' + (_lang === 'en'
                ? 'Only one player left — ending the game.'
                : 'Plus qu\'un joueur — fin de la partie.'), 'sys');
              stopTurnTimer();
              dismissWinner();
              showEndGameOverlay(winnerPid);
            }
          }
        }
        break;
      }

      case T.RemovedFromGame: { _gameMeta = null;
        addChat(null, t('youWereRemoved'), 'sys');
        amInGame = false;
        gId = 0; seats = []; seatData = {}; _playerAvatars = {}; _pthAvatarHashes = {}; _pthAvatarsByHash = {}; _pthAvatarReqIdToHash = {}; _seatsFrozen = false; _amSpectator = false; var _sb1 = document.getElementById('g-spectator-banner'); if (_sb1) _sb1.style.display = 'none';
        show('s-lobby');
        break;
      }

      case T.StartEvent: {
        // Répondre avec StartEventAck
        const evGameId = Proto.u32(sub, 1);
        send(MSG.buildStartEventAck(evGameId));
        addChat(null, t('gameStarting'), 'sys');
        break;
      }

      case T.GameStartInitial: {
        _gameStarted = true;
        // Clear the waiting panel ("EN ATTENTE…") immediately when the
        // game starts. It used to linger until our first MyActionRequest
        // because that's the next thing that writes to #g-actions —
        // meaning if another player goes first, the user sees the
        // start-now banner and the live table at the same time.
        var _ga = document.getElementById('g-actions');
        if (_ga) _ga.innerHTML = '';
        // Same goes for the "▶ Start" / "▶ Bots" admin buttons in the
        // header: once the game has started they no longer make sense.
        // Hide all four (desktop + mobile-overflow variants) defensively.
        ['admin-start-btn','admin-start-mob','admin-startnobots-btn','admin-startnobots-mob'].forEach(function(id){
          var el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });
        // GameStartInitialMessage: gameId=1, startDealerPlayerId=2, playerSeats=3 (packed uint32)
        gId       = Proto.u32(sub, 1);
        dealerPid = Proto.u32(sub, 2);

        // Décoder la liste de sièges envoyée par le serveur
        const newSeats = [];
        if (sub[3] && sub[3].length > 0) {
          if (sub[3][0] instanceof Uint8Array) {
            let pos = 0, buf = sub[3][0];
            while (pos < buf.length) {
              const r = Proto.decodeVarint(buf, pos);
              newSeats.push(r.value); pos = r.pos;
            }
          } else {
            newSeats.push(...sub[3].map(v => +v));
          }
        }

        // FIX : le serveur renvoie GameStartInitial avant chaque main avec un ordre
        // potentiellement différent (rotation du dealer). On fige l'ordre dès
        // la PREMIÈRE réception et on ne le change plus — évite que les joueurs
        // "tournent" visuellement autour de la table à chaque nouvelle main.
        //
        // PREVIOUS BUG: the freeze used `seats.length === 0` as the gate, which
        // is fragile — any path that empties seats[] without setting _seatsFrozen
        // back to false re-opens the freeze and the server's new (rotated) order
        // gets written. Browser logs proved this was happening: hand#1 seats
        // [724,722,723,712,721] but hand#2 [712,721,722,723,724], hand#3
        // [721,712,722,723,724], etc. The dealer rotation visibly cycled the
        // array on every GameStartInitial.
        //
        // The new gate is a dedicated one-way flag `_seatsFrozen`, set to true
        // here and only reset by RemovedFromGame / leaveGame / closeTable.
        const isFirstDeal = !_seatsFrozen;
        if (isFirstDeal) {
          seats  = newSeats.slice(); // copy, defensive
          _seatsFrozen = true;
          handNum = 0;
          const scEl = document.getElementById('g-myseat-cards');
          if (scEl) scEl.innerHTML = '<div class="pk sm back"></div><div class="pk sm back"></div>';
        }
        // Late joins : ajouter les nouveaux joueurs à la fin
        for (const pid of newSeats) {
          if (!seats.includes(pid)) seats.push(pid);
        }

        // Mettre à jour seatData pour tous les joueurs
        // active = vrai UNIQUEMENT si le joueur est dans newSeats (cette main)
        for (const pid of seats) {
          const inGame = newSeats.includes(pid);
          if (!seatData[pid]) seatData[pid] = {};
          if (isFirstDeal) {
            // Use the table's configured startMoney as the initial stack
            // for every seat. The server only sends per-player money in
            // PlayersActionDone, which means a seat that has NOT acted yet
            // (everyone except SB/BB on hand #1) keeps its 0 default —
            // which then makes the Call button mis-route to All-In once
            // toCall >= 0. Seeding with the real startMoney fixes that
            // misfire until PlayersActionDone corrects each seat's value.
            Object.assign(seatData[pid], {money: gameStartMoney || 3000, bet:0, action:'', active:inGame, folded:false});
          } else {
            // Conserver le stack, réinitialiser uniquement l'état de la main
            Object.assign(seatData[pid], {bet:0, action:'', active:inGame, folded:false});
          }
        }

        commCards = [null, null, null, null, null];
        amInGame  = true;
        $('g-round').textContent = t('gameStart');

        // Demander les infos des joueurs inconnus
        for (const pid of seats) {
          if (!players[pid]) {
            const req = Proto.encode([[1,0,pid]]);
            send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,req]]));
          }
        }

        // Re-diffuser l'avatar à chaque début de main (pour les nouveaux
        // connectés). Same '__pth__' guard as the initial broadcast: we
        // never send the sentinel over the wire.
        try {
          var myAv2 = _myAvatarToBroadcast();
          if (ws && ws.readyState === WebSocket.OPEN && !directWS) {
            ws.send('AVATAR:' + myId + ':' + myAv2);
          }
        } catch(e) {}
        if (isFirstDeal) {
          setTimeout(function(){ renderSeats(); }, 120);
          renderGameWaiting(t('gameStartedWaitHand'));
        } else {
          // Animer le déplacement du dealer + fade des actions
          if (_prevDealerPid >= 0 && _prevDealerPid !== dealerPid) {
            setTimeout(function(){ animateDealerMove(_prevDealerPid, dealerPid); }, 200);
          }
          fadeOutAllActions();
          renderSeats();
        }
        _prevDealerPid = dealerPid;
        break;
      }

      case T.HandStart: {
        // HandStartMessage: gameId=1, plainCards=2 {card1:1, card2:2}, smallBlind=4, seatStates=5, dealerPlayerId=6
        handNum++;
        // Reset auto-check/fold on every new hand. Standard poker-client
        // safety: the user must see each hand's hole cards before deciding
        // anything automatic.
        _autoCheckFold = false;

        // ── SPECTATOR BOOTSTRAP ──
        // When the user joined as spectator of a hand-in-progress, the
        // server never sends GameStartInitial — only the live messages
        // (HandStart, DealFlop, PlayersTurn, etc.). Both _gameStarted
        // and seats[] therefore stay at their initial empty/false state,
        // and the table shows the waiting panel forever with no seats
        // around the felt.
        //
        // Use the FIRST HandStart we receive as a synthetic 'game has
        // started' event to repair both:
        //   * _gameStarted = true → the waiting panel gets hidden
        //   * _seatsFrozen = true → the freeze latch is armed so no later
        //                            GameStartInitial (unlikely but possible)
        //                            can shuffle the order under us
        //   * seats[] is populated from every pid we know about via the
        //     GamePlayerJoined messages that arrived since join time.
        //     The .gone filter excludes pids that have already left.
        //
        // For a normal player join this branch is a no-op: GameStartInitial
        // already flipped _gameStarted and populated seats[] before the
        // first HandStart fires, so the condition is false.
        if (!_gameStarted) {
          _gameStarted = true;
          _seatsFrozen = true;
        }
        if (seats.length === 0) {
          seats = Object.keys(seatData)
            .map(Number)
            .filter(function(pid) { return !seatData[pid].gone; });
        }
        $('g-hand').textContent = t('handOf') + handNum;
        $('g-round').textContent = t('preflop');
        gameState = 0; // preflop
        commCards = [null, null, null, null, null];
        pot = 0; collectedPot = 0; highestBet = 0; minRaise = 0;

        // My cards (plainCards sub-message at field 2)
        // FIX : pour un SPECTATEUR le serveur peut envoyer plainCards vide ou sans les champs 1/2.
        // u32orNull distingue "champ absent" (null → carte cachée) de "valeur 0" (carte 2♣ valide).
        const pc = sub[2] ? Proto.decode(sub[2][0]) : {};
        myCards = [Proto.u32orNull(pc, 1), Proto.u32orNull(pc, 2)];
        // If I'm bust (lost my whole stack last hand), the server may
        // still echo cards for the deal but I'm not actually in the
        // hand. Force-clear so the player bar shows card backs and
        // matches the eliminated state shown on my seat.
        if (seatData[myId] && seatData[myId].money <= 0 && !seatData[myId].gone) {
          myCards = [null, null];
        }
        const hsFields = Object.keys(sub).sort((a,b)=>+a-+b).map(f=>f+':'+Proto.u32(sub,+f)).join(' ');

        const sb = Proto.u32(sub, 4);
        smallBlind = sb;
        dealerPid = Proto.u32(sub, 6) || dealerPid;

        // Reset seat data for new hand. IMPORTANT exclusions:
        //  - .gone pids (player left voluntarily, GamePlayerLeft set
        //    this) → keep as ghost seats forever.
        //  - players with money <= 0 (eliminated last hand by losing
        //    their stack, e.g. lost an all-in) → keep .active = false
        //    so renderSeats keeps the .seat-out greyed-out class and
        //    OUT badge, and skip them in the dealer rotation. The
        //    server doesn't deal them cards anyway; this just prevents
        //    the UI from showing them as live + clearing their stale
        //    cards from the previous hand.
        for (const pid of seats) {
          var __sd = seatData[pid];
          if (!__sd || __sd.gone) continue;
          __sd.bet    = 0;
          __sd.action = '';
          __sd.folded = false;
          __sd.card1  = null;
          __sd.card2  = null;
          // Mark as eliminated ONLY if we KNOW for sure the player is
          // bust (money is defined AND <= 0). When money is null/
          // undefined we have no info yet — default to active=true so
          // we don't incorrectly grey out live players. This matters
          // particularly in spectator mode where HandStart arrives
          // before the stacks have been synced to seatData, so a
          // bare `money > 0` check was making EVERY seat look OUT.
          var __knownBust = (__sd.money != null && __sd.money <= 0);
          __sd.active = !__knownBust;
        }

        clearTurnNotif();
        renderMyCards();
        renderComm();
        renderSeats();
        // Fix #3: was 'autoScaleTable + renderSeats' — the second renderSeats
        // here was redundant (we just called it 100ms earlier) and produced
        // a brief flicker as the same DOM was rebuilt twice in quick
        // succession. autoScaleTable() is enough — it adjusts the CSS
        // transform of the parent without touching the seat DOM at all.
        setTimeout(autoScaleTable, 100);
        setTimeout(animateCardDeal, 200);
        setTimeout(renderPreFlopStrength, 350);
        // Init stats
        var startMon = (seatData[myId]||{}).money || 0;
        if (!_statsInited && startMon > 0) initStats(startMon);
        // Sons + animations deal
        setTimeout(function(){
          notifyCard();
          setTimeout(notifyCard, 120);
          animateDealMyCards();
        }, 250);
        var hs = document.getElementById('hand-strength');
        if (hs) hs.style.display = 'none';
        renderGameWaiting(t('handOf') + ' ' + handNum + ' — Blinds: ' + sb + '/' + (sb*2));
        logAction('══ ' + t('handOf') + ' ' + handNum + ' — Blinds ' + sb + '/' + (sb*2) + ' ══');
        // Show my hole cards in log
        if (myCards[0] != null && myCards[1] != null) {
          logAction(t('myCards') + ' ' + cardName(myCards[0], false) + ' ' + cardName(myCards[1], false));
        }
        break;
      }

      case T.PlayersTurn: {
        // PlayersTurnMessage: gameId=1, playerId=2, gameState=3
        turnPid   = Proto.u32(sub, 2);
        gameState = Proto.u32(sub, 3);
        // Defensive guard: if the server (older PokerTH versions, e.g.
        // the Debian 1.1.2-2 package) mistakenly sends PlayersTurn for
        // a player who has already left the table, ignore it. The
        // server should normally skip gone pids and assign the turn to
        // the next live one. We still set turnPid above (for any UI
        // consistency code that may inspect it) but bail out of the
        // turn-handling logic so we don't render a ghost as active.
        if (turnPid && seatData[turnPid] && seatData[turnPid].gone) {
          console.warn('[PlayersTurn] server assigned turn to a gone pid', turnPid, '— ignoring');
          renderSeats();
          break;
        }
        // A seat whose turn the server just assigned is by definition
        // in the hand — force active=true. Safety net for spectators
        // who joined mid-hand and missed the HandStart reset.
        if (turnPid && seatData[turnPid]) seatData[turnPid].active = true;
        const rounds = [t('preflop'),t('flop'),t('turn'),t('river'),t('preflop')+' (SB)',t('preflop')+' (BB)'];
        $('g-round').textContent = rounds[gameState] || t('preflop');
        startTurnTimer();
        if (turnPid === myId) {
          // Auto check/fold path: if the user armed the option on a
          // previous turn (this same hand), play the auto action without
          // showing the action buttons. canCheck (no money to put in)
          // → check. Otherwise → fold.
          if (_autoCheckFold) {
            const myBet0   = (seatData[myId] || {}).bet || 0;
            const toCall0  = Math.max(0, highestBet - myBet0);
            const canCheck0 = toCall0 === 0;
            // Disarm immediately so the option is one-shot per hand even if
            // we get multiple turns within the same hand (re-arming is up
            // to the user every turn).
            _autoCheckFold = false;
            // Brief delay so the user sees a visual cue rather than an
            // instant invisible action.
            renderGameWaiting(canCheck0 ? '⏩ ' + t('autoChecked') : '⏩ ' + t('autoFolded'));
            setMyTurnActive(true);
            // Fix #6: 60ms instead of 180ms. Plenty of time for the
            // 'Auto-folded' badge to flash, no perceived lag.
            setTimeout(function() {
              if (canCheck0) doAction(2, 0);
              else           doAction(1, 0);
            }, 60);
            break;
          }
          renderMyTurnActions();
          setMyTurnActive(true);
          // Play the audio ding-dong (from sounds.mjs, attached to window)
          // AND trigger the visual cue (tab title blink, browser notification).
          // These used to be one call but the visual function shadowed the
          // audio one, silencing the chime entirely.
          if (typeof window.notifyMyTurn === 'function') window.notifyMyTurn();
          notifyMyTurnVisuals();
          hapticBuzz([90, 50, 90]); // "your turn" double-buzz
        } else {
          clearTurnNotif();
          setMyTurnActive(false);
          // isHtml=true : HTML interne sûr, pas du contenu utilisateur
          renderGameWaiting(
            '<span style="font-family:inherit">' + esc(getPlayerName(turnPid)) + '</span>'
            + '<span class="thinking-dots"><span></span><span></span><span></span></span>',
            true);
        }
        break;
      }

      case T.PlayersActionDone: {
        // gameId=1, playerId=2, gameState=3, playerAction=4, totalPlayerBet=5, playerMoney=6, highestSet=7, minimumRaise=8
        const pid    = Proto.u32(sub, 2);
        const action = Proto.u32(sub, 4);
        const bet    = Proto.u32(sub, 5);
        const money  = Proto.u32(sub, 6);
        highestBet   = Proto.u32(sub, 7);
        minRaise     = Proto.u32(sub, 8);
        const aLabels = ['','Fold','Check','Call','Bet','Raise','All-in'];
        const aLabel  = aLabels[action] || '?';
        if (seatData[pid]) {
          seatData[pid].bet    = bet;
          seatData[pid].money  = money;
          seatData[pid].folded = action === 1;
          seatData[pid].action = aLabel;
        }
        pot = collectedPot;
        for (const p of seats) if (seatData[p]) pot += seatData[p].bet;
        $('g-pot').textContent = t('pot') + ' ' + pot;
        if ($('g-potbar')) $('g-potbar').textContent = t('pot') + ' ' + pot;
        logAction(getPlayerName(pid) + ': ' + aLabel + (bet ? ' ' + bet : ''));
        if (pid === myId) {
          const myMon = (seatData[myId] || {}).money || 0;
          if ($('g-mystack')) $('g-mystack').textContent = myMon > 0 ? myMon + ' ¥' : '';
        }
        renderSeats();
        // Sound: regular thud for fold/check/call/bet/raise; dedicated
        // casino-roulette + ding fanfare for all-in moments. The visual
        // animateAllIn() pop is paired with the audio cue so the moment
        // gets its own identity.
        if (action === 6) {
          if (typeof notifyAllIn === 'function') notifyAllIn();
        } else {
          notifyAction();
        }
        flashActionLabel(pid);
        if (action === 6) animateAllIn(pid); // All-in
        if (bet > 0) {
          // Fix #2: chip starts moving immediately (was 80ms) so the
          // user's click → visual response loop feels instant.
          animateChipToPot(pid, bet);
          // Fix #1: pot updates 200ms after instead of 550ms. The chip
          // animation lasts ~700ms so the pot grows roughly as the
          // chip arrives — looks coherent without the long lag that
          // made rapid bot turns feel choppy.
          setTimeout(function(){
            animatePot(pot);
            updatePotSize(pot);
          }, 200);
        }
        break;
      }
      case T.DealFlop: {
        // DealFlopCardsMessage : deux formats possibles selon la version proto.
        // Essai A : gameId=1, card1=2, card2=3, card3=4 (proto officiel actuel)
        // Essai B : card1=1, card2=2, card3=3 (ancienne version, sans gameId)
        // FIX bug rare : on utilise u32orNull pour DISTINGUER "champ absent" (null) de "valeur 0" (le 2♦).
        // L'ancienne logique avec u32 (défaut 0) confondait les deux et pouvait accepter fA = [card2, card3, 0]
        // dans le format ancien, traitant 0 comme une 3e carte valide (le 2♦) à tort.
        const fA = [Proto.u32orNull(sub,2), Proto.u32orNull(sub,3), Proto.u32orNull(sub,4)];
        const fB = [Proto.u32orNull(sub,1), Proto.u32orNull(sub,2), Proto.u32orNull(sub,3)];
        const allFields = Object.keys(sub).sort((a,b)=>+a-+b);
        const allVals = allFields.map(f => f+'='+Proto.u32(sub,+f)).join(' ');
        // Une carte est valide si elle est PRÉSENTE (≠null) et dans la plage 0..51
        const isValidCard = n => n !== null && n >= 0 && n <= 51;
        const allValid = a => a.every(isValidCard);
        // Préférer fA (format officiel) ; basculer sur fB si fA incomplet ; sinon garder fA tel quel (cardToHtml affichera des dos)
        commCards = allValid(fA) ? fA : (allValid(fB) ? fB : fA);
        const dbg = 'FLOP sub:'+allVals+' →['+commCards.join(',')+']';
        if ($('g-debug')) $('g-debug').textContent = dbg;
        $('g-round').textContent = t('flop');
        gameState = 1;
        // Collect preflop bets into pot
        let flopBets = 0;
        for (const p of seats) if (seatData[p] && seatData[p].bet) { flopBets += seatData[p].bet; seatData[p].bet = 0; }
        collectedPot += flopBets;
        pot = collectedPot;
        // FIX 2024-XX : reset des stats par round.
        // Sans ce reset, le premier joueur à parler au flop voyait son
        // bouton afficher "Call X" (X étant la mise du round précédent)
        // alors que personne n'avait encore misé → le serveur rejetait
        // (rejectedActionNotAllowed) et le joueur restait coincé.
        highestBet = 0;
        minRaise   = 0;
        $('g-pot').textContent = t('pot') + ' ' + pot;
        if ($('g-potbar')) $('g-potbar').textContent = t('pot') + ' ' + pot;
        const flopStr = commCards.filter(n=>n!=null).map(n=>cardName(n,true)).join(', ');
        renderComm(true); // flip animation
        renderSeats();
        setTimeout(renderHandStrength, 150); // force de la main au flop (was 500ms)
        logAction('--- Flop [' + flopStr + '] ---');
        notifyCard(); notifyCard(); notifyCard();
        break;
      }

      case T.DealTurn: {
        // Fix : utiliser sub[2] pour détecter la présence du champ
        const tv = sub[2] !== undefined ? Proto.u32(sub, 2) : Proto.u32(sub, 1);
        commCards.push(tv);
        $('g-round').textContent = t('turn');
        gameState = 2;
        let turnBets = 0;
        for (const p of seats) if (seatData[p] && seatData[p].bet) { turnBets += seatData[p].bet; seatData[p].bet = 0; }
        collectedPot += turnBets;
        pot = collectedPot;
        // Voir DealFlop pour le commentaire — reset des stats par round
        // pour éviter que le bouton Call affiche un montant périmé.
        highestBet = 0;
        minRaise   = 0;
        $('g-pot').textContent = t('pot') + ' ' + pot;
        if ($('g-potbar')) $('g-potbar').textContent = t('pot') + ' ' + pot;
        const tvCard = commCards[3]; const tvName = tvCard != null ? cardName(tvCard, true) : '?';
        logAction('--- ' + t('turn') + ' [' + tvName + '] ---');
        renderComm(true); // flip animation
        setTimeout(renderHandStrength, 150); // force de la main au turn (was 500ms)
        notifyCard();
        break;
      }

      case T.DealRiver: {
        // Fix : sub[2] présent ? utiliser field 2 ; sinon field 1
        // rv || fallback est FAUX pour rv=0 (carte 2♦)
        const rv = sub[2] !== undefined ? Proto.u32(sub, 2) : Proto.u32(sub, 1);
        commCards.push(rv);
        $('g-round').textContent = t('river');
        gameState = 3;
        let rvBets = 0;
        for (const p of seats) if (seatData[p] && seatData[p].bet) { rvBets += seatData[p].bet; seatData[p].bet = 0; }
        collectedPot += rvBets;
        pot = collectedPot;
        // Voir DealFlop pour le commentaire — reset des stats par round
        // pour éviter que le bouton Call affiche un montant périmé.
        highestBet = 0;
        minRaise   = 0;
        $('g-pot').textContent = t('pot') + ' ' + pot;
        if ($('g-potbar')) $('g-potbar').textContent = t('pot') + ' ' + pot;
        const rvCard = commCards[4]; const rvName = rvCard != null ? cardName(rvCard, true) : '?';
        logAction('--- ' + t('river') + ' [' + rvName + '] ---');
        renderComm(true, true); // flip animation + dramatic river
        setTimeout(renderHandStrength, 200); // force de la main à la river (was 600ms)
        playTone(350, 0.08, 0.08); setTimeout(function(){ notifyCard(); }, 200);

        break;
      }

      case T.AllInShowCards: {
        // Show cards of all-in players during the hand
        // AllInShowCardsMessage: gameId=1, playersAllIn=2 (repeated PlayerAllIn {playerId=1, allInCard1=2, allInCard2=3})
        const allIns = sub[2] || [];
        for (const ab of allIns) {
          const a   = Proto.decode(ab);
          const pid = Proto.u32(a, 1);
          // FIX : un joueur sans carte révélée → null (pas 0 qui serait le 2♣)
          const c1  = Proto.u32orNull(a, 2);
          const c2  = Proto.u32orNull(a, 3);
          if (seatData[pid]) { seatData[pid].card1 = c1; seatData[pid].card2 = c2; }
        }
        renderSeats();
        break;
      }

      case T.EndOfHandShow: {
        const results = sub[2] || [];
        const winners = [];
        for (const rb of results) {
          const r   = Proto.decode(rb);
          const pid = Proto.u32(r, 1);
          // FIX : joueur qui a foldé ne révèle pas ses cartes → null (pas 0 = 2♣ fantôme)
          const c1  = Proto.u32orNull(r, 2);
          const c2  = Proto.u32orNull(r, 3);
          const won = Proto.u32(r, 5);
          const cash= Proto.u32(r, 6);
          if (seatData[pid]) {
            seatData[pid].money  = cash;
            seatData[pid].card1  = c1;
            seatData[pid].card2  = c2;
            seatData[pid].action = won ? '🏆 +' + won : '';
          }
          if (won > 0) {
            winners.push({ pid, won, cash, c1, c2 });
            // Stats si c'est moi
            if (pid === myId) {
              var prevMon = (_stats.startMoney || 0) + _stats.totalGain;
              var delta2 = won - (prevMon - cash);
              var myPair2 = myCards.map && myCards.map(function(c){ return { r: cardName(c,false).slice(0,-1), s: cardName(c,false).slice(-1), red: ['♥','♦'].indexOf(cardName(c,false).slice(-1))>=0 }; });
              recordHand(true, won, myPair2);
            }
            addChat(null, '🏆 ' + getPlayerName(pid) + ' ' + t('wins') + ' ' + won + ' ¥!', 'sys');
            logAction('🏆 ' + getPlayerName(pid) + ' +' + won);
          }
        }
        // Enregistrer la perte si je ne suis pas dans les gagnants
        if (!winners.some(function(w){ return w.pid === myId; })) {
          var myEndMon = (seatData[myId] || {}).money;
          if (myEndMon != null) {
            var myStartMon = (_stats.startMoney || 0) + _stats.totalGain;
            var myLoss = myEndMon - myStartMon;
            var myPairLoss = myCards.map && myCards.map(function(c){
              return { r: cardName(c,false).slice(0,-1), s: cardName(c,false).slice(-1), red: ['♥','♦'].indexOf(cardName(c,false).slice(-1))>=0 };
            });
            recordHand(false, myLoss, myPairLoss);
          }
        }
        pot = 0; $('g-pot').textContent = 'Pot: 0';
        if ($('g-potbar')) $('g-potbar').textContent = 'Pot: 0';
        renderSeats();
        // Animations de fin de main
        var iWon = winners.some(function(w){ return w.pid === myId; });
        var bigWin = winners.reduce(function(s,w){ return s + w.won; }, 0) > 500;
        if (iWon) {
          var ov = document.getElementById('g-winner-overlay');
          var cx = ov ? ov.getBoundingClientRect().left + ov.offsetWidth/2 : window.innerWidth/2;
          var cy = ov ? ov.getBoundingClientRect().top  + 80 : window.innerHeight * 0.3;
          burstStars(cx, cy, 16);
          setTimeout(function(){ burstStars(cx - 80, cy + 40, 8); }, 300);
          setTimeout(function(){ burstStars(cx + 80, cy + 40, 8); }, 500);
          if (bigWin) setTimeout(function(){ launchConfetti(70); }, 200);
        }
        // Showdown flip cartes adversaires
        setTimeout(animateShowdownCards, 300);
        // Reset glow pot
        setTimeout(function(){
          var p1 = document.getElementById('g-pot');
          var p2 = document.getElementById('g-potbar');
          if (p1) p1.classList.remove('pot-huge');
          if (p2) p2.classList.remove('pot-huge');
        }, 800);
        showWinnerOverlay(winners);
        renderGameWaiting('Prochaine main...');
        break;
      }

      case T.EndOfHandHide: {
        // playerId=2, moneyWon=3, playerMoney=4
        const pid  = Proto.u32(sub, 2);
        const won  = Proto.u32(sub, 3);
        const cash = Proto.u32(sub, 4);
        if (seatData[pid]) { seatData[pid].money = cash; if(won) seatData[pid].action = '+'+won; }
        if (won > 0) addChat(null, getPlayerName(pid) + ' gagne ' + won + ' jetons', 'sys');
        // Enregistrer ma perte (cartes non révélées, je ne suis pas le gagnant)
        if (pid !== myId) {
          var myHideMon = (seatData[myId] || {}).money;
          if (myHideMon != null) {
            var myHideStart = (_stats.startMoney || 0) + _stats.totalGain;
            var myHideLoss  = myHideMon - myHideStart;
            if (myHideLoss < 0) {
              var myPairHide = myCards.map && myCards.map(function(c){
                return { r: cardName(c,false).slice(0,-1), s: cardName(c,false).slice(-1), red: ['♥','♦'].indexOf(cardName(c,false).slice(-1))>=0 };
              });
              recordHand(false, myHideLoss, myPairHide);
            }
          }
        }
        pot = 0; $('g-pot').textContent = 'Pot: 0';
        renderSeats();
        // Détection élimination (stack à 0)
        for (var _ep of seats) {
          if (_ep !== myId && seatData[_ep] && seatData[_ep].money === 0) {
            setTimeout(function(p){ animatePlayerEliminated(p); }, 600, _ep);
          }
        }
        if (won > 0) showWinnerOverlay([{pid, won, cash, c1:null, c2:null}]);
        break;
      }

      case T.GameAdminChanged: {
        const newAdminId = Proto.u32(sub, 2);
        if (newAdminId !== myId) amGameAdmin = false;
        else amGameAdmin = true;
        break;
      }

      case T.YourActionRejected: {
        // YourActionRejectedMessage: gameId=1, gameState=2, yourAction=3,
        //   yourRelativeBet=4, rejectionReason=5
        // Sent by the server when our MyActionRequest is invalid (game state
        // drift, no longer our turn, or action not allowed). Without this
        // handler the UI used to hang on "Action envoyée" and the server
        // would silently time-out our turn → counted as Fold.
        // Most common trigger: 4-player all-in cascades where local
        // gameState lags the server's by one round.
        const rejGameState = Proto.u32(sub, 2);
        const rejAction    = Proto.u32(sub, 3);
        const rejBet       = Proto.u32(sub, 4);
        const reason       = Proto.u32(sub, 5);
        const actNames     = ['','Fold','Check','Call','Bet','Raise','All-in'];
        const reasonLabels = {
          1: _lang === 'fr' ? 'état de jeu invalide (désynchro)' : 'invalid game state (out-of-sync)',
          2: _lang === 'fr' ? 'plus votre tour'                 : 'no longer your turn',
          3: _lang === 'fr' ? 'action non autorisée'            : 'action not allowed',
        };
        const reasonStr = reasonLabels[reason] || ('code ' + reason);
        const actStr    = actNames[rejAction] || ('?' + rejAction);
        logAction('⚠ ' + actStr + (rejBet ? ' ' + rejBet : '') + ' — ' + reasonStr);
        addGameChat(null, '⚠ ' + (_lang === 'fr' ? 'Action rejetée' : 'Action rejected') +
                          ' (' + actStr + ') — ' + reasonStr, 'sys');
        // If we're still the active player according to the local state,
        // the server may give us a second chance — re-render the action
        // buttons so the user can retry. The local turn timer was already
        // stopped by doAction; restart it so the user has the full delay
        // again instead of a stale countdown.
        if (turnPid === myId && !_amSpectator) {
          renderMyTurnActions();
          startTurnTimer();
        }
        break;
      }

      case T.EndOfGame: {
        const winnerPid = Proto.u32(sub, 2);
        addChat(null, 'Partie terminée !', 'sys');
        // Keep amInGame true until the user dismisses the overlay, so the
        // table screen stays visible behind it. Stop the turn timer and
        // suppress any further winner pop-ups.
        stopTurnTimer();
        dismissWinner();
        showEndGameOverlay(winnerPid);
        break;
      }
    }
  }

  // ── AFFICHAGE DES TABLES ──
  const MODE_DOT   = {1:'dot-open', 2:'dot-run', 3:'dot-closed'};
  // Resolve mode labels via t() at CALL time, not at module-init time —
  // when this file loads, the i18n table from modules/i18n.mjs hasn't
  // been attached to the closure yet (its <script type=module> defers
  // until after this file's IIFE runs). Building the dict eagerly threw
  // 'ReferenceError: t is not defined', which broke the entire IIFE and
  // left App undefined — that's why no header button worked.
  function MODE_LABEL(mode) {
    if (mode === 1) return t('modeWaiting');
    if (mode === 2) return t('modeInProgress');
    if (mode === 3) return t('modeClosed');
    return '?';
  }
  const GTYPE      = {1:'Normal', 2:'Inscrits', 3:'Sur invitation', 4:'Classé'};

  function renderGames() {
    // Utiliser entries() pour avoir l'id ET l'objet
    const entries = Object.entries(games);
    entries.sort(([,a],[,b]) => a.mode - b.mode);
    $('g-count').textContent = entries.length + ' table(s)';

    if (entries.length === 0) {
      $('g-list').innerHTML = loaded
        ? '<div class="empty">' + t('noTablesAvailable') + '</div>'
        : '<div class="empty">Chargement des tables<br><span class="ld"><span>●</span><span>●</span><span>●</span></span></div>';
      return;
    }

    $('g-list').innerHTML = entries.map(([gid, g]) => {
      const dotcls = MODE_DOT[g.mode] || 'dot-closed';
      const label  = MODE_LABEL(g.mode);
      const type   = GTYPE[g.type] || '';
      const lock   = (g.priv || g.type === 3) ? '🔒 ' : '';
      // The i18n joinBtn string already includes a '▶ ' prefix
      // ('▶ Rejoindre' in FR, '▶ Join' in EN). Previously we
      // prepended ANOTHER '▶ ' here, giving the visible '▶▶' double-
      // arrow look. Now we only prepend a prefix when we need to
      // REPLACE the arrow with a lock (for private/locked tables).
      var rawJoin = (typeof t === 'function' ? t('joinBtn') || '▶ Join' : '▶ Join');
      const joinLabel = (g.priv || g.type === 3)
        ? '🔒 ' + rawJoin.replace(/^▶\s*/, '')
        : rawJoin;
      const watchBtn = g.mode === 2
        ? '<button class="btn-xs btn-watch" onclick="App.spectateGame(' + gid + ')">👁 ' + t('watchBtn') + '</button>'
        : '';
      const joinBtn = g.mode !== 3
        ? '<button class="btn-join" onclick="event.stopPropagation();App.joinGame(' + parseInt(gid) + ')">' + joinLabel + '</button>'
        : '';
      return '<div class="game-row" onclick="App.joinGame(' + parseInt(gid) + ')">'
        + '<div class="game-info">'
        + '<div class="game-name">' + lock + esc(g.name) + '</div>'
        + '<div class="game-meta">'
        + '<span class="game-type">' + type + '</span>'
        + '<span> · </span>'
        + '<span>' + label + '</span>'
        + '</div></div>'
        + '<div style="display:flex;align-items:center;gap:10px">'
        + '<div class="game-count">' + g.players + (g.maxPlayers ? '/'+g.maxPlayers : '') + '</div>'
        + joinBtn + watchBtn
        + '</div></div>';
    }).join('');
  }

  // ── CHAT ──
  function addChat(sender, text, cls='') {
    if (typeof addGameChat === 'function') addGameChat(sender, text, cls);
    // Flash lobby chat button on new message
    var lcp = document.getElementById('lobby-chat-panel');
    var lcb = document.getElementById('lobby-chat-btn');
    if (lcb && (!lcp || lcp.style.display === 'none') && cls !== 'mine') {
      lcb.style.color = 'var(--gold)';
      clearTimeout(window._lobbyChatFlash);
      window._lobbyChatFlash = setTimeout(function(){ lcb.style.color=''; }, 3000);
    }
    const el = $('chat');
    const d  = document.createElement('div');
    d.className = 'msg ' + cls;
    if (sender) {
      d.innerHTML = `<span class="who">${esc(sender)}</span>: <span class="txt">${esc(text)}</span>`;
    } else {
      d.innerHTML = `<span class="txt">${esc(text)}</span>`;
    }
    el.appendChild(d);
    el.scrollTop = el.scrollHeight;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;');
  }

  // ── API PUBLIQUE ──
  // ─── Card + render helpers ───
  // ─── Card rendering ───
  // Card name for log display
  function cardName(n, isComm) {
    // FIX 2024-XX : encodage PokerTH UNIQUE pour hole et comm cards.
    // Vérifié sur les assets PNG officiels (data/gfx/cards/default/*.png) :
    //   0..12  = ♦ 2..A     13..25 = ♥ 2..A
    //   26..38 = ♠ 2..A     39..51 = ♣ 2..A
    // Le paramètre isComm est ignoré (conservé pour compat. binaire).
    if (n == null) return '?';
    if (!Number.isInteger(n) || n < 0 || n > 51) return '?';
    var si = Math.floor(n / 13);
    var ri = n % 13;
    const suits = ['♦','♥','♠','♣'];
    const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    return (ranks[ri]||'?') + (suits[si]||'?');
  }

  // PokerTH card encoding — UNIQUE et 0-indexé pour TOUTES les cartes
  // (hole cards, flop, turn, river, all-in show, end-of-hand show).
  // Vérifié sur les assets officiels data/gfx/cards/default/*.png :
  //   0..12  = ♦ 2..A      13..25 = ♥ 2..A
  //   26..38 = ♠ 2..A      39..51 = ♣ 2..A
  // Le paramètre isComm est conservé pour compat binaire mais ignoré pour le mapping.
  function cardToHtml(n, sm, isComm, extraCls) {
    extraCls = extraCls || '';
    const sz = sm ? ' sm' : '';
    if (n === null || n === undefined) return '<div class="pk' + sz + ' back' + extraCls + '"></div>';
    if (!Number.isInteger(n) || n < 0 || n > 51) {
      return '<div class="pk' + sz + ' back' + extraCls + '"></div>';
    }
    var si = Math.floor(n / 13);
    var ri = n % 13;
    const suits = ['♦','♥','♠','♣'];
    const suit  = suits[si] || '?';
    const rank  = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'][ri] || '?';
    const red   = (si < 2) ? ' red' : '';     // ♦ (0) et ♥ (1) sont rouges
    const spade = (si === 2) ? ' spade' : ''; // ♠ (2)
    return '<div class="pk' + sz + red + spade + extraCls + '"><span class="c-rank">' + rank + '</span><span class="c-suit">' + suit + '</span></div>';
  }


  // ─── My cards ───
  // Même encodage unique que cardToHtml — voir commentaire ci-dessus.
  function cardHtml(n, cls, isComm) {
    if (n == null) return '<div class="pk '+cls+' back"></div>';
    if (!Number.isInteger(n) || n < 0 || n > 51) {
      return '<div class="pk '+cls+' back"></div>';
    }
    var si = Math.floor(n / 13);
    var ri = n % 13;
    const suits = ['♦','♥','♠','♣'];
    const rank = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'][ri] || '?';
    const suit = suits[si] || '?';
    const red = (si < 2) ? ' red' : '';     // ♦ (0) et ♥ (1) sont rouges
    const spade2 = (si === 2) ? ' spade' : ''; // ♠ (2)
    return '<div class="pk '+cls+red+spade2+'"><span class="c-rank">'+rank+'</span><span class="c-suit">'+suit+'</span></div>';
  }

  function renderMyCards() {
    const c1 = myCards[0] != null ? myCards[0] : null;
    const c2 = myCards[1] != null ? myCards[1] : null;
    // Only update player bar cards (small)
    const pb = document.getElementById('g-myseat-cards');
    if (pb) pb.innerHTML = cardHtml(c1,'md') + cardHtml(c2,'md');
  }



  // ═══════════════════════════════════════════════════════════
  // ANIMATIONS — Distribution, jetons, stats
  // ═══════════════════════════════════════════════════════════

  // ── Distribution des cartes ──
  function animateCardDeal() {
    if (!_lastPixPos.length) return;
    var cx = _potCenter.x, cy = _potCenter.y;
    if (!cx) return;
    var n = _lastPixPos.length; // nombre de joueurs
    var delay = 0;
    var STEP = 180; // ms entre chaque carte
    // 2 cartes par joueur, dealer en premier
    for (var card = 0; card < 2; card++) {
      for (var i = 0; i < n; i++) {
        (function(pos, d, isMe) {
          setTimeout(function() {
            var el = document.createElement('div');
            el.className = 'fly-card' + (isMe ? ' mine' : '');
            el.style.left = (cx - 13) + 'px';
            el.style.top  = (cy - 18) + 'px';
            el.style.transform = 'rotate(' + (Math.random()*16-8) + 'deg) scale(0.7)';
            el.style.opacity = '1';
            document.body.appendChild(el);
            requestAnimationFrame(function() {
              el.style.left = (pos.left - 13) + 'px';
              el.style.top  = (pos.top  - 18) + 'px';
              el.style.transform = 'rotate(0deg) scale(1)';
            });
            setTimeout(function() {
              el.style.opacity = '0';
              setTimeout(function() { el.remove(); }, 200);
            }, 380);
          }, d);
        })(_lastPixPos[i], delay, _lastPixPos[i] === _lastPixPos[0]);
        delay += STEP;
      }
    }
  }

  // ── Jeton qui glisse vers le pot ──
  function animateChipToPot(pid, amount) {
    var myIdx = seats.indexOf(myId);
    var rotated2 = myIdx >= 0 ? seats.slice(myIdx).concat(seats.slice(0,myIdx)) : seats;
    var seatIdx = rotated2.indexOf(pid);
    if (seatIdx < 0 || !_lastPixPos[seatIdx]) return;
    var from = _lastPixPos[seatIdx];
    var to   = _potCenter;
    if (!to.x) return;
    var el = document.createElement('div');
    el.className = 'fly-chip';
    el.textContent = amount > 999 ? (amount/1000).toFixed(1)+'k' : amount;
    el.style.left = (from.left - 10) + 'px';
    el.style.top  = (from.top  - 10) + 'px';
    document.body.appendChild(el);
    requestAnimationFrame(function() {
      el.style.left = (to.x - 10) + 'px';
      el.style.top  = (to.y - 10) + 'px';
      el.style.transform = 'scale(0.5)';
      el.style.opacity = '0';
    });
    setTimeout(function() { el.remove(); }, 600);
  }

  // ── Flip 3D des cartes communes ──
  function flipCommCards(startIdx, endIdx) {
    var els = document.querySelectorAll('#g-comm .pk');
    for (var i = startIdx; i <= endIdx && i < els.length; i++) {
      (function(el2, delay) {
        setTimeout(function() {
          el2.classList.remove('flip-reveal');
          void el2.offsetWidth; // force reflow
          el2.classList.add('flip-reveal');
        }, delay);
      })(els[i], (i - startIdx) * 120);
    }
  }

  // ── Panneau statistiques ──
  var _statsOpen = false;
  function toggleStats() {
    _statsOpen = !_statsOpen;
    var el = document.getElementById('stats-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'stats-overlay';
      document.body.appendChild(el);
    }
    el.style.display = _statsOpen ? '' : 'none';
    if (_statsOpen) renderStats();
  }

  function renderStats() {
    var el = document.getElementById('stats-overlay');
    if (!el) return;
    var s = _stats;
    var gain = s.totalGain;
    var gainCls = gain > 0 ? 'pos' : gain < 0 ? 'neg' : '';
    var wr = s.handsPlayed > 0 ? Math.round(s.handsWon/s.handsPlayed*100) : 0;
    var hist = s.history.slice().reverse().slice(0,5);
    var histHtml = hist.length ? hist.map(function(h2) {
      var dcls = h2.delta > 0 ? 'pos' : h2.delta < 0 ? 'neg' : '';
      return '<div class="hand-hist-item">'
        + '<div style="display:flex;justify-content:space-between">'
        + '<span style="color:var(--gold-dim);font-size:0.55rem">Main #'+h2.num+'</span>'
        + '<span class="hand-hist-result '+dcls+'">'+(h2.delta>0?'+':'')+h2.delta+' ¥</span>'
        + '</div>'
        + '<div class="hand-hist-cards">'
        + (h2.cards ? h2.cards.map(function(c){ return '<span style="background:#fff;color:'+(c.red?'#c0392b':'#111')+';border-radius:2px;padding:1px 3px;font-size:0.6rem;font-weight:700">'+c.r+c.s+'</span>'; }).join('') : '')
        + '</div>'
        + '</div>';
    }).join('') : '<div style="color:var(--text);font-size:0.62rem">Aucune main jouée</div>';

    var isFr = (_lang === 'fr');
    el.innerHTML = '<div class="stats-header">'
      + '<span>📊 ' + (isFr ? 'Session' : 'Session') + '</span>'
      + '<button onclick="toggleStats()" style="background:none;border:none;color:var(--text);cursor:pointer;font-size:0.9rem">✕</button>'
      + '</div>'
      + '<div class="stats-body">'
      + '<div class="stat-row"><span class="stat-label">'+(isFr?'Mains jouées':'Hands played')+'</span><span class="stat-val">'+s.handsPlayed+'</span></div>'
      + '<div class="stat-row"><span class="stat-label">'+(isFr?'Victoires':'Wins')+'</span><span class="stat-val pos">'+s.handsWon+'</span></div>'
      + '<div class="stat-row"><span class="stat-label">'+(isFr?'Taux de victoire':'Win rate')+'</span><span class="stat-val">'+wr+'%</span></div>'
      + '<hr class="stat-divider">'
      + '<div class="stat-row"><span class="stat-label">'+(isFr?'Gain/Perte net':'Net gain/loss')+'</span><span class="stat-val '+gainCls+'">'+(gain>0?'+':'')+gain+' ¥</span></div>'
      + '<div class="stat-row"><span class="stat-label">'+(isFr?'Meilleur gain':'Best win')+'</span><span class="stat-val pos">+'+s.bigWin+' ¥</span></div>'
      + '<div class="stat-row"><span class="stat-label">'+(isFr?'Pire perte':'Worst loss')+'</span><span class="stat-val neg">'+s.bigLoss+' ¥</span></div>'
      + '<hr class="stat-divider">'
      + '<div style="font-size:0.58rem;color:var(--gold-dim);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">'+(isFr?'Dernières mains':'Recent hands')+'</div>'
      + histHtml
      + '</div>';
  }

  // Initialiser les stats au début d'une partie
  function initStats(startMoney) {
    if (_statsInited) return;
    _stats.startMoney = startMoney;
    _stats.peakMoney  = startMoney;
    _statsInited = true;
  }

  // Enregistrer le résultat d'une main
  function recordHand(won, delta, myCardsPair) {
    _stats.handsPlayed++;
    if (won) _stats.handsWon++;
    _stats.totalGain += delta;
    if (delta > _stats.bigWin) _stats.bigWin = delta;
    if (delta < _stats.bigLoss) _stats.bigLoss = delta;
    _stats.history.push({ num: handNum, delta: delta, won: won,
      cards: myCardsPair });
    if (_stats.history.length > 20) _stats.history.shift();
    if (_statsOpen) renderStats();
  }

  // ── Probabilité de gain (Monte Carlo simplifié) ──
  function calcWinProb() {
    if (myCards[0] == null || myCards[1] == null) return -1;
    var comm = commCards.filter(function(c){ return c != null; });
    if (comm.length < 3) return -1; // seulement après le flop
    // Normaliser mes hole cards vers comm encoding (même échelle que commCards)
    var myNorm = [myCards[0], myCards[1]].map(normalizeHoleCard).filter(function(c){ return c != null; });
    if (myNorm.length < 2) return -1;
    // Le deck est en comm encoding (0-51). On exclut mes cartes normalisées + comm cards.
    var known = myNorm.concat(comm);
    var deck = [];
    for (var i = 0; i < 52; i++) { if (known.indexOf(i) < 0) deck.push(i); }
    var needed = 5 - comm.length;
    var nOpp = Math.max(1, seats.filter(function(p){ return p !== myId && seatData[p] && !seatData[p].folded; }).length);
    var wins = 0, total = 200;
    for (var t = 0; t < total; t++) {
      // Shuffle deck (Fisher-Yates partiel)
      var d = deck.slice();
      for (var i2 = d.length-1; i2 > 0; i2--) {
        var j = Math.floor(Math.random()*(i2+1));
        var tmp = d[i2]; d[i2] = d[j]; d[j] = tmp;
      }
      // Cartes communes restantes (en comm encoding)
      var extraComm = d.slice(0, needed);
      var fullComm = comm.concat(extraComm);
      var pos = needed;
      // Évaluer ma main (myNorm est déjà en comm encoding)
      var myScore = evaluateBestHand(myNorm, fullComm);
      // Évaluer les adversaires (cartes piochées dans le deck comm)
      var iWin = true;
      for (var o = 0; o < nOpp; o++) {
        var oc1 = d[pos++], oc2 = d[pos++];
        if (oc1 === undefined || oc2 === undefined) { iWin = false; break; }
        // Les cartes adverses simulées sont en comm encoding (piochées du deck comm)
        var oppScore = evaluateBestHand([oc1, oc2], fullComm);
        if (oppScore && myScore && oppScore.r > myScore.r) { iWin = false; break; }
        if (oppScore && myScore && oppScore.r === myScore.r) {
          // Départager sur la carte haute
          var myHigh  = Math.max.apply(null, myNorm.map(function(c){ return c%13; }));
          var oppHigh = Math.max.apply(null, [oc1,oc2].map(function(c){ return c%13; }));
          if (oppHigh > myHigh) { iWin = false; break; }
        }
      }
      if (iWin) wins++;
    }
    return Math.round(wins / total * 100);
  }

  // ─── Force de la main ───
  function renderPreFlopStrength() {
    var el = document.getElementById('hand-strength');
    if (!el) return;
    if (commCards.filter(function(c){ return c!=null; }).length > 0) return;
    if (myCards[0] == null || myCards[1] == null) { el.style.display='none'; return; }
    var res = evaluatePreFlopHand(myCards[0], myCards[1]);
    if (!res) { el.style.display='none'; return; }
    var label = (_lang==='fr' ? res.fr : res.en);
    var stars = res.stars >= 0
      ? ' ' + ('★'.repeat(res.stars+1) + '☆☆').slice(0,3)
      : '';
    el.textContent = label + stars;
    var cols = ['#aaa','#7ec8e3','#a8d8a8','#f0c040','#e74c3c'];
    el.style.color = cols[Math.max(0, res.stars+1)] || '#aaa';
    el.style.display = 'block';
  }

  // ─── Force de la main ───
  function renderHandStrength() {
    var el = document.getElementById('hand-strength');
    if (!el) return;
    var validComm = commCards.filter(function(c){ return c != null; });
    if (myCards[0] == null || myCards[1] == null || validComm.length === 0) {
      el.style.display = 'none';
      return;
    }
    // Normaliser les hole cards (1-indexed) vers l'encodage canonique (0-indexed)
    var holeNorm = [myCards[0], myCards[1]]
      .filter(function(c){ return c != null; })
      .map(normalizeHoleCard)
      .filter(function(c){ return c != null; });
    var result = evaluateBestHand(holeNorm, validComm);
    if (!result) { el.style.display = 'none'; return; }
    var handLabel = _lang === 'fr' ? result.fr : result.en;
    var colors = ['#aaa','#aaa','#7ec8e3','#7ec8e3','#a8d8a8','#6dbe6d','#f0c040','#f09030','#e07020','#e74c3c'];
    var handColor = colors[result.r] || 'var(--gold)';
    // Afficher le nom immédiatement, calcul win% en async
    el.textContent = handLabel + (validComm.length >= 3 ? ' …' : '');
    el.style.color = handColor;
    el.style.borderColor = handColor.replace(')',',0.25)').replace('rgb','rgba');
    el.style.display = 'block';
    // Monte Carlo win% seulement si >= 3 cartes communes
    if (validComm.length >= 3) {
      var _captureComm = validComm.slice();
      var _captureHole = [myCards[0], myCards[1]];
      setTimeout(function() {
        // Vérifier que le contexte n'a pas changé (nouvelle main, fold…)
        var currComm = commCards.filter(function(c){ return c != null; });
        if (currComm.length !== _captureComm.length) return;
        var pct = calcWinProb();
        if (pct < 0) return;
        var elNow = document.getElementById('hand-strength');
        if (!elNow) return;
        // Indicateur couleur : vert brillant ≥71%, vert 51-70%, jaune 36-50%, orange 26-35%, rouge ≤25%
        var pctEmoji = pct >= 71 ? '🟢' : pct >= 51 ? '🟡' : pct >= 36 ? '🟡' : pct >= 26 ? '🟠' : '🔴';
        elNow.textContent = handLabel + ' — ' + pct + '% ' + pctEmoji;
      }, 0);
    }
  }

  // ─── Community cards ───
  function renderComm(animate, isRiver) {
    const el = $('g-comm');
    let h = '';
    for (let i=0; i<5; i++) {
      const v = commCards[i];
      let cls = (animate && v != null) ? ' pk-flip' : '';
      // River (i=4) — révélation plus lente et dramatique
      if (isRiver && i === 4 && v != null) cls = ' pk-flip pk-river';
      h += cardToHtml(v != null ? v : null, false, true, cls);
    }
    el.innerHTML = h;
  
    renderHandStrength();
  }

  // ─── Seat positions (% of oval) — 10 max, starting from bottom going clockwise ───
  const SEAT_POS_10 = [
    [90,47],[79,76],[54,94],[24,82],[5,62],[5,38],[24,18],[54,5],[79,22],[90,47]
  ];

  // Hardcoded seat positions (% within oval): index 0 = ME (bottom center)
  // Seat positions OUTSIDE the oval (% of oval size, can be negative or >100)
  // Index 0 = ME always at bottom-center outside
  // Others = opponents clockwise from top-left
  const SEAT_LAYOUTS_DESK = {
    // Ellipse rx=55 ry=65 mine=75
     2: [[117, 45], [-23, 45]],
     3: [[117, 45], [ 10, 93], [ 10, -3]],
     4: [[117, 45], [ 42,100], [-23, 45], [ 42,-10]],
     5: [[117, 45], [ 62, 97], [-11, 77], [-11, 13], [ 62, -7]],
     6: [[117, 45], [ 74, 93], [ 10, 93], [-23, 45], [ 10, -3], [ 74, -3]],
     7: [[117, 45], [ 83, 88], [ 28, 99], [-17, 69], [-17, 21], [ 28, -9], [ 83,  2]],
     8: [[117, 45], [ 88, 84], [ 42,100], [ -4, 84], [-23, 45], [ -4,  6], [ 42,-10], [ 88,  6]],
     9: [[117, 45], [ 92, 80], [ 53, 99], [ 10, 93], [-19, 64], [-19, 26], [ 10, -3], [ 53, -9], [ 92, 10]],
    10: [[117, 45], [ 95, 77], [ 62, 97], [ 22, 97], [-11, 77], [-23, 45], [-11, 13], [ 22, -7], [ 62, -7], [ 95, 13]],
  };

  const SEAT_LAYOUTS_MOB = {
    // Mobile: rx=42 ry=45, mine=50 — fits in felt-oval
     2: [[ 92,45], [ -3,45]],
     3: [[ 92,45], [ 20,81], [ 20, 9]],
     4: [[ 92,45], [ 42,87], [ -3,45], [ 42, 3]],
     5: [[ 92,45], [ 56,85], [  6,70], [  6,20], [ 56, 5]],
     6: [[ 92,45], [ 64,81], [ 20,81], [ -3,45], [ 20, 9], [ 64, 9]],
     7: [[ 92,45], [ 70,78], [ 32,86], [  1,63], [  1,27], [ 32, 4], [ 70,12]],
     8: [[ 92,45], [ 74,75], [ 42,87], [ 10,75], [ -3,45], [ 10,15], [ 42, 3], [ 74,15]],
     9: [[ 92,45], [ 76,72], [ 50,86], [ 20,81], [  0,59], [  0,31], [ 20, 9], [ 50, 4], [ 76,18]],
    10: [[ 92,45], [ 78,70], [ 56,85], [ 28,85], [  6,70], [ -3,45], [  6,20], [ 28, 5], [ 56, 5], [ 78,20]],
  };
  function getSeatPositions(n) {
    var mob = window.innerWidth < 640;
    var layouts = mob ? SEAT_LAYOUTS_MOB : SEAT_LAYOUTS_DESK;
    return layouts[n] || layouts[10].slice(0, n);
  }

  // ─── Jeton de blind SVG (casino chip style) ───
  function chipSvg(label, bg, fg, edge) {
    var notches = '';
    for (var i = 0; i < 8; i++) {
      var rot = i * 45;
      notches += '<rect x="13" y="0.5" width="6" height="7" rx="2" fill="white"'
               + ' transform="rotate(' + rot + ' 16 16)" opacity="0.9"/>';
    }
    return '<svg class="blind-chip" viewBox="0 0 32 32" width="20" height="20" xmlns="http://www.w3.org/2000/svg">'
      + '<circle cx="16" cy="16" r="15.5" fill="' + (edge||'#000') + '"/>'
      + '<circle cx="16" cy="16" r="13" fill="' + bg + '"/>'
      + notches
      + '<circle cx="16" cy="16" r="9" fill="' + bg + '" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>'
      + '<text x="16" y="16.5" text-anchor="middle" dominant-baseline="central"'
      + ' fill="' + fg + '" font-size="7" font-weight="900"'
      + ' font-family="Arial Black,Arial,sans-serif">' + label + '</text>'
      + '</svg>';
  }

  function dealerChipSvg() {
    var notches = '';
    for (var i = 0; i < 8; i++) {
      notches += '<rect x="13" y="0.5" width="6" height="7" rx="2" fill="#c8a850"'
               + ' transform="rotate(' + (i*45) + ' 16 16)" opacity="0.9"/>';
    }
    return '<svg class="dealer-chip" viewBox="0 0 32 32" width="20" height="20" xmlns="http://www.w3.org/2000/svg">'
      + '<circle cx="16" cy="16" r="15.5" fill="#3d2b00"/>'
      + '<circle cx="16" cy="16" r="13" fill="#1a1a1a"/>'
      + notches
      + '<circle cx="16" cy="16" r="9" fill="#1a1a1a" stroke="#c8a850" stroke-width="1.5"/>'
      + '<text x="16" y="16.5" text-anchor="middle" dominant-baseline="central"'
      + ' fill="#ffd700" font-size="9" font-weight="900"'
      + ' font-family="Arial Black,Arial,sans-serif">D</text>'
      + '</svg>';
  }

  function getPlayerName(pid) { return players[pid] || (pid === myId ? myName : '#'+pid); }

  // ══ TURN TIMER ══
  function _timerSvg(secs, total) {
    var r = 20, cx = 25, cy = 25;
    var circ = 2 * Math.PI * r;
    var frac = Math.max(0, secs / (total || 30));
    var offset = (circ * (1 - frac)).toFixed(1);
    var urgent = secs <= 8;
    var col = urgent ? '#e74c3c' : '#f0c040';
    // Arc dessiné dans le sens des aiguilles d'une montre (rotation -90°)
    return '<svg class="seat-timer" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"'
      + ' style="transform:rotate(-90deg);overflow:visible">'
      // Fond de piste (anneau gris foncé)
      + '<circle class="bg" cx="'+cx+'" cy="'+cy+'" r="'+r+'"/>'
      // Arc de progression
      + '<circle class="arc" cx="'+cx+'" cy="'+cy+'" r="'+r+'"'
      + ' stroke="'+col+'"'
      + ' stroke-dasharray="'+circ.toFixed(1)+'"'
      + ' stroke-dashoffset="'+offset+'"/>'
      // Pas de disque central ni de texte : le chiffre est affiché hors du cercle
      + '</svg>';
  }

  function _updateTimer() {
    _timerSec = Math.max(0, _timerSec - 1);
    // Update SVG arcs in place — no full re-render
    var urgent = _timerSec <= 8;
    var col = urgent ? '#e74c3c' : '#f0c040';
    var r = 22, circ = 2 * Math.PI * r;
    var offset = (circ * (1 - _timerSec / (_timerTot || 30))).toFixed(1);
    document.querySelectorAll('.seat-timer .arc').forEach(function(el) {
      el.setAttribute('stroke', col);
      el.setAttribute('stroke-dashoffset', offset);
    });
    document.querySelectorAll('.seat-timer text').forEach(function(el) {
      el.setAttribute('fill', col);
      el.textContent = _timerSec > 0 ? _timerSec + 's' : '';
      el.style.transform = 'rotate(90deg) translate(0,-50px)';
    });
    // Badge timer sous chaque siège
    var stb = document.getElementById('stb-' + turnPid);
    if (stb) { stb.textContent = _timerSec > 0 ? _timerSec + 's' : ''; stb.style.color = col; }
    // Player bar counter
    var pb = document.getElementById('pb-timer');
    if (pb && turnPid === myId) {
      pb.textContent = _timerSec > 0 ? _timerSec + 's' : '';
      pb.style.color = col;
    }
    // Flash my-zone border
    var mz = document.querySelector('.my-zone');
    if (mz && turnPid === myId) mz.style.borderTopColor = urgent ? '#e74c3c' : '';
    setUrgentMode(urgent && turnPid === myId);
    if (_timerSec <= 0) { clearInterval(_timerID); setUrgentMode(false); }
  }

  function startTurnTimer() {
    clearInterval(_timerID);
    _timerSec = _timerTot = (gameTimeout > 0 ? gameTimeout : 15);
    renderSeats();  // Draws the SVG
    _timerID = setInterval(_updateTimer, 1000);
  }

  function stopTurnTimer() {
    clearInterval(_timerID);
    _timerID = null;
    _timerSec = 0;
    // Clear timers from DOM
    document.querySelectorAll('.seat-timer').forEach(function(el){ el.remove(); });
    var pb = document.getElementById('pb-timer');
    if (pb) pb.textContent = '';
    var mz = document.querySelector('.my-zone');
    if (mz) mz.style.borderTopColor = '';
    setUrgentMode(false);
  }

  // ── Détection bot vs humain (dans la closure = accès à players/myId/myName) ──
  function isBot(pid) {
    var name = (players[pid] || '').toLowerCase();
    return name.startsWith('computer') || name.startsWith('bot') || name === 'bot';
  }
  function getPlayerInitial(pid) {
    if (pid === myId) {
      // Utiliser le cache ; recharger depuis localStorage si vide
      if (!_myAvatarCache) {
        try { _myAvatarCache = localStorage.getItem('pth_avatar') || ''; } catch(e) {}
      }
      // Never return the '__pth__' sentinel as an "initial". The seat
      // builder renders the result inside <span class="seat-initial">;
      // returning the raw sentinel surfaced as '_PTH_' on every seat
      // when the user picked the PokerTH avatar but had no image
      // downloaded yet (LAN, guest, etc). Falling back to the name's
      // first letter is the right text fallback; the image (real or
      // placeholder logo) is layered on top by the renderer.
      if (_myAvatarCache && _myAvatarCache !== '__pth__') return _myAvatarCache;
      return myName ? myName.charAt(0).toUpperCase() : '?';
    }
    if (isBot(pid)) return '🤖';
    // Avatar reçu des autres joueurs via proxy
    if (_playerAvatars[pid]) return _playerAvatars[pid];
    var name = players[pid] || '';
    return name.charAt(0).toUpperCase() || '?';
  }
  function getPlayerTypeBadge(pid) {
    return ''; // Badges supprimés : 🤖 identifie les bots, pas de 👤 pour les humains
  }

  function renderSeatsImmediate() {
    const el = $('g-seats');
    if (!seats.length) { el.innerHTML = ''; return; }
    // Keep ALL original seats when computing pixel positions. Previously
    // we filtered to active-only seats here, which caused the remaining
    // players to visually rotate / re-space themselves around the felt
    // every time someone got eliminated. Users found that disorienting:
    // "the players keep moving around between hands". Now we always
    // place against the original seating order and mark the eliminated
    // ones as .seat-out so they render visually faded but in place.
    const n = seats.length;
    const myIdx = seats.indexOf(myId);
    const rotated = myIdx >= 0 ? [...seats.slice(myIdx), ...seats.slice(0, myIdx)] : seats;
    // Position seats using actual pixel coords from getBoundingClientRect
    const oval = document.querySelector('.felt-oval');
    const zone = document.getElementById('g-table-zone');
    if (!oval || !zone) return;
    const oRect = oval.getBoundingClientRect();
    const zRect = zone.getBoundingClientRect();
    const oCX  = oRect.left - zRect.left + oRect.width  / 2;
    const oCY  = oRect.top  - zRect.top  + oRect.height / 2;
    const isMob = window.innerWidth < 640;
    // On mobile: use larger vertical spread to prevent lateral player overlap
    // rx must clear oval half-width + 8px border + ~10px seat radius
    const borderClear = isMob ? 20 : 24; // px to add beyond oval half-size
    const isSmall = window.innerWidth < 900; // mobile + tablet
    const rxRaw = oRect.width  / 2 + borderClear + (isMob ? oRect.width*0.06 : oRect.width*0.16);
    // Vertical-spread multipliers. On mobile we tighten BOTTOM seats a lot
    // and TOP seats moderately, to bring the players visually closer to the
    // table on small screens. Desktop and tablet stay at the original
    // (symmetric) multipliers, so behaviour there is unchanged.
    //   yMulBot : seats whose angle places them in the lower half (sin>0)
    //   yMulTop : seats in the upper half (sin<=0)
    //   yMulMe  : the local player (i=0), kept slightly lower than the other
    //             bottom seats to leave breathing room above the player-bar.
    const yMulBot   = isMob ? 0.20 : (isSmall ? 0.34 : 0.18);
    const yMulTop   = isMob ? 0.28 : (isSmall ? 0.34 : 0.18);
    // The seat sitting EXACTLY at the top-centre (sinAng ≈ -1, exists only
    // when n is even: 4, 6, 8, 10…) is lowered slightly toward the table
    // because the latitude angle gives it the maximum vertical projection.
    // For all other top-half seats (sinAng > -0.95), we keep yMulTop so the
    // lateral pairs don't drift horizontally toward each other.
    const yMulTopC  = isMob ? 0.22 : (isSmall ? 0.34 : 0.18);
    const yMulMe    = isMob ? 0.24 : (isSmall ? 0.40 : 0.22);
    const ryBotRaw  = oRect.height / 2 + borderClear + oRect.height * yMulBot;
    const ryTopRaw  = oRect.height / 2 + borderClear + oRect.height * yMulTop;
    const ryTopCRaw = oRect.height / 2 + borderClear + oRect.height * yMulTopC;
    const ryMeRaw   = oRect.height / 2 + borderClear + oRect.height * yMulMe;
    // Clamp to zone boundaries (top seats clamped against space ABOVE the
    // oval, bottom seats clamped against space BELOW)
    const margin = isMob ? 24 : 36;
    const rxPx  = Math.min(rxRaw,    Math.min(oCX, zRect.width - oCX) - margin);
    const ryTop = Math.min(ryTopRaw,  oCY - margin);
    const ryTopC= Math.min(ryTopCRaw, oCY - margin);
    const ryBot = Math.min(ryBotRaw,  zRect.height - oCY - margin);
    const ryMe  = Math.min(ryMeRaw,   zRect.height - oCY - margin);
    const stepA = 360 / n;
    const pixPos = rotated.map(function(_, i) {
      var ang = (90 - i * stepA) * Math.PI / 180;
      var sinAng = Math.sin(ang);
      // i === 0 is the local player (sin=1 by construction).
      // sinAng > 0       → bottom half → ryBot
      // sinAng < -0.95   → exact top-centre seat → ryTopC (only when n even)
      // otherwise        → top-half lateral pairs → ryTop
      var ry;
      if      (i === 0)         ry = ryMe;
      else if (sinAng > 0)      ry = ryBot;
      else if (sinAng < -0.95)  ry = ryTopC;
      else                      ry = ryTop;
      return { top: oCY + ry*sinAng, left: oCX + rxPx*Math.cos(ang) };
    });
    // ── Calcul SB / BB à partir du dealer ──
    // We must SKIP seats whose player has left (.gone) -- otherwise
    // the SB/BB chips get assigned to a ghost seat that hides all
    // its badges via CSS, leaving the table with no visible blinds.
    // Walk around the table until we find a non-gone seat.
    const dealerIdx = seats.indexOf(dealerPid);
    function nextActiveSeat(fromIdx, offset) {
      if (fromIdx < 0 || !seats.length) return -1;
      var n = seats.length;
      // At most n steps — if everyone is gone/out we give up gracefully.
      var idx = fromIdx;
      var stepped = 0;
      for (var k = 0; k < n; k++) {
        idx = (idx + 1) % n;
        var __sd2 = seatData[seats[idx]];
        // Skip seats that are either:
        //   - gone (player left voluntarily), or
        //   - eliminated (money <= 0 and not playing this hand,
        //     i.e. active=false) — narmod reported SB chip landing
        //     on an OUT seat. The dealer chip should walk past them.
        var __skip = !__sd2 || __sd2.gone || (__sd2.active === false) || (__sd2.money != null && __sd2.money <= 0);
        if (!__skip) {
          stepped++;
          if (stepped === offset) return seats[idx];
        }
      }
      return -1;
    }
    const sbPid = dealerIdx >= 0 && seats.length > 1
      ? nextActiveSeat(dealerIdx, 1)
      : -1;
    const bbPid = dealerIdx >= 0 && seats.length > 2
      ? nextActiveSeat(dealerIdx, 2)
      : (seats.length === 2 ? seats[dealerIdx] : -1); // heads-up: dealer = SB

    // Update player-bar
    const mySd = seatData[myId] || {};
    const pbAv   = document.getElementById('g-myseat-av');
    const pbName = document.getElementById('g-myseat-name');
    const pbMon  = document.getElementById('g-myseat-money');
    const pbAct  = document.getElementById('g-myseat-action');
    const pbBar  = document.querySelector('.player-bar');
    if (pbAv) {
      // Don't write to pbAv directly here -- refreshMyAvatar() owns
      // the player-bar avatar rendering and knows about the '__pth__'
      // sentinel, the PokerTH logo placeholder (Q2=b), and the real
      // downloaded image. Calling it keeps a single source of truth
      // and prevents this update path from clobbering our <img>.
      try { window.refreshMyAvatar && window.refreshMyAvatar(); } catch(e) {}
      // Garder le vert pour moi (pas de couleur palette)
    }
    // Chips SVG dans la player bar
    const myBlindChip = myId === sbPid
      ? chipSvg('SB','#1565c0','#fff','#0a3d7a')
      : (myId === bbPid ? chipSvg('BB','#b71c1c','#fff','#6d0c0c') : '');
    const myDealerBadge = myId === dealerPid ? dealerChipSvg().replace('class="dealer-chip"','style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5));vertical-align:middle"') : '';
    if (pbName) {
      pbName.textContent = myName;
      // Ajouter les badges après le texte via innerHTML (chips SVG + D badge)
      pbName.innerHTML = myName
        + (myDealerBadge ? '<span style="margin-left:4px;vertical-align:middle">' + myDealerBadge + '</span>' : '')
        + (myBlindChip   ? '<span style="margin-left:4px;vertical-align:middle;display:inline-block;position:relative;top:-1px">' + myBlindChip.replace('class="blind-chip"','style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.4));vertical-align:middle"') + '</span>' : '');
    }
    // If I'm eliminated (money <= 0 and not gone voluntarily), show
    // a clear "OUT" indicator next to my stack and dim the player bar.
    var __amOut = !!(mySd && mySd.money != null && mySd.money <= 0 && !mySd.gone && !_amSpectator);
    if (pbMon) {
      pbMon.textContent = mySd.money != null ? mySd.money + ' ¥' : '—';
      if (__amOut) {
        pbMon.innerHTML = '<span style="color:var(--red);font-weight:700;letter-spacing:0.1em">OUT</span> · ' + pbMon.innerHTML;
      }
    }
    if (pbAct)  pbAct.textContent  = mySd.action || '';
    if (pbBar)  {
      pbBar.classList.toggle('pb-active', myId === turnPid);
      pbBar.classList.toggle('pb-out', __amOut);
    }

    let h = '';
    rotated.forEach((pid, i) => {
      const px = pixPos[i];
      const isMe = pid === myId;
      const sd = seatData[pid] || {};
      const isDealer = pid === dealerPid;
      const isActive = pid === turnPid;
      const isOut  = sd.active === false; // eliminated or sitting out this hand
      const isGone = !!sd.gone; // player left the table — ghost seat
      // Ghost seats take precedence over eliminated: a gone player gets
      // the minimal-visibility .seat-ghost class instead of .seat-out.
      // The two are mutually exclusive (gone implies active=false), but
      // we still gate the seat-out class on !isGone to be explicit.
      const cls = ['seat', isMe?'me':'', isDealer?'dealer':'', isActive?'active':'',
                   sd.folded && !isGone ? 'folded' : '',
                   isOut && !isGone ? 'seat-out' : '',
                   isGone ? 'seat-ghost' : ''].filter(Boolean).join(' ');
      const initial    = getPlayerInitial(pid);
      const typeBadge  = getPlayerTypeBadge(pid);
      var _hasEmojiAv = isMe
        ? (function(){ try { var av = localStorage.getItem('pth_avatar'); return !!av; } catch(e){ return false; } })()
        : !!_playerAvatars[pid];
      const avatarType = isMe
        ? (_hasEmojiAv ? ' emoji-av' : '')
        : (isBot(pid) ? ' is-bot emoji-av' : (_hasEmojiAv ? ' emoji-av is-human' : ' is-human'));
      const moneyStr = sd.money != null && sd.money >= 0 ? sd.money + ' ¥' : '—';
      // Cartes sous le siège : uniquement les adversaires au showdown
      // (mes propres cartes sont déjà visibles dans la player-bar en bas)
      let cardStr = '';
      if (!isMe && sd.card1 != null && sd.card2 != null) {
        cardStr = '<div style="display:flex;gap:2px;margin-top:1px">'
          + cardHtml(sd.card1,'xsm') + cardHtml(sd.card2,'xsm') + '</div>';
      }
      h += '<div class="' + cls + '" data-pid="' + pid + '" style="position:absolute;top:' + px.top.toFixed(1) + 'px;left:' + px.left.toFixed(1) + 'px;transform:translate(-50%,-50%)">';
      const isSB = pid === sbPid;
      const isBB = pid === bbPid;
      let blindBadge = '';
      if (isSB) blindBadge = chipSvg('SB','#1565c0','#fff','#0a3d7a');
      else if (isBB) blindBadge = chipSvg('BB','#b71c1c','#fff','#6d0c0c');
      const timerSvg = isActive ? _timerSvg(_timerSec, _timerTot) : '';
      const avatarCls = 'seat-avatar' + (isActive ? ' timing' : '') + avatarType;
      // Couleur unique par joueur (basée sur pid)
      const aColor = isMe ? null : getAvatarColor(pid);
      const avatarStyle = aColor
        ? 'position:relative;background:' + aColor.bg + ';border-color:' + aColor.border + ';color:' + aColor.text + ';box-shadow:0 0 0 2px ' + aColor.border + '44'
        : 'position:relative';
      const dealerChip = isDealer ? dealerChipSvg() : '';
      // ── Step 3 display: if we have a downloaded PokerTH avatar for
      // this pid, slot it in as <img> on top of the initial/emoji.
      // Q1=A: official PokerTH avatar takes precedence over emoji custom
      // -- BUT only for OTHER players. For MY OWN seat, step 4 lets the
      // user choose explicitly (popup, sentinel '__pth__'). If they
      // picked an emoji or initial, we honour that here.
      let pthAvUrl = _pthAvatarFor(pid);
      if (isMe) {
        let myChoice = null;
        try { myChoice = localStorage.getItem('pth_avatar'); } catch(e) {}
        // If the user picked an emoji (or initial), suppress the
        // real avatar image for the local seat only.
        if (pthAvUrl && myChoice !== null && myChoice !== '__pth__') {
          pthAvUrl = null;
        }
        // Q2=b: user picked '__pth__' but no real image is available.
        // Show the local PokerTH chip logo as a placeholder so the
        // seat reflects their stated preference instead of falling
        // back to a bare initial letter.
        if (!pthAvUrl && myChoice === '__pth__') {
          pthAvUrl = '/img/pokerth-logo.png';
        }
      }
      const pthImg = pthAvUrl
        ? '<img class="seat-pth-img" src="' + pthAvUrl + '" alt="" draggable="false">'
        : '';
      const avCls2 = avatarCls + (pthAvUrl ? ' has-pth-avatar' : '');
      h += '<div class="' + avCls2 + '" style="' + avatarStyle + '">'
        + pthImg
        + '<span class="seat-initial">' + initial + '</span>'
        + timerSvg
        + blindBadge
        + dealerChip
        + typeBadge
        + '</div>';
      // Badge timer sous l'avatar (visible et non confondu avec l'emoji)
      if (isActive) h += '<div class="seat-timer-badge" id="stb-'+pid+'">'
        + ((_timerSec > 0) ? _timerSec + 's' : '') + '</div>';
      h += '<div class="seat-name">' + esc(isMe ? myName : getPlayerName(pid)) + '</div>';
      h += '<div class="seat-money">' + moneyStr + '</div>';
      if (sd.bet) h += '<div class="seat-bet">' + sd.bet + '</div>';
      if (sd.action) h += '<div class="seat-action-label">' + esc(sd.action) + '</div>';
      h += cardStr;
      h += '</div>';
    });
    el.innerHTML = h;
    _lastPixPos = pixPos;
    // Patcher l'avatar du joueur local immédiatement après le rendu.
    // Anti-flicker safety net: re-applies the emoji to .seat-initial
    // after a renderSeats() in case it lost it. Skipped entirely when
    // the user picked the PokerTH avatar -- in that case the renderer
    // already put an <img> in place and the .seat-initial is hidden
    // by .has-pth-avatar > .seat-initial { display:none } anyway.
    if (_myAvatarCache && _myAvatarCache !== '__pth__') {
      requestAnimationFrame(function() {
        var mySeats = document.querySelectorAll('#g-seats .seat.me');
        mySeats.forEach(function(seat) {
          var ini = seat.querySelector('.seat-initial');
          if (ini && ini.textContent !== _myAvatarCache) {
            ini.textContent = _myAvatarCache;
            var av2 = seat.querySelector('.seat-avatar');
            if (av2) av2.classList.add('emoji-av');
          }
        });
      });
    }
    var _ov2 = document.querySelector('.felt-oval');
    if (_ov2) { var _or2 = _ov2.getBoundingClientRect();
      _potCenter = { x: _or2.left + _or2.width/2, y: _or2.top + _or2.height/2 }; }
    requestAnimationFrame(function() {
      autoScaleTable();
      setTimeout(autoScaleTable, 150);
    });
  }

  // ── Coalesced public entry point ──
  // Multiple back-to-back renderSeats() calls (bot bursts, PlayersActionDone
  // floods, server replays) used to each trigger a full DOM rebuild + reflow.
  // With this wrapper, all calls within the same animation frame share ONE
  // actual render at the next rAF tick (~16 ms). The DOM still reflects the
  // latest game state — we never skip data, we just batch the paint.
  let _seatsRenderPending = false;
  function renderSeats() {
    if (_seatsRenderPending) return;
    _seatsRenderPending = true;
    requestAnimationFrame(function() {
      _seatsRenderPending = false;
      renderSeatsImmediate();
    });
  }

  function renderGameWaiting(msg, isHtml) {
    // isHtml=true : msg contient du HTML interne sûr (généré par notre code)
    $('g-actions').innerHTML = '<div class="waiting-msg">' + (isHtml ? msg : esc(msg)) + '</div>';
    updateBottomLayout();
  }

  // ─────────────────────────────────────────────────────────────────
  // Waiting-room panel — shown between JoinGameAck and GameStartInitial.
  // Displays:
  //   * current/max player count + progress bar
  //   * minimum-to-start indicator (poker needs 2 humans/bots)
  //   * the list of players currently in the room, each with their
  //     avatar (cached emoji or '?') and pseudo
  //   * admin-vs-guest action hint
  // Refreshed automatically by GamePlayerJoined, GamePlayerLeft and
  // PlayerInfoReply handlers; frozen once GameStartInitial fires.
  // ─────────────────────────────────────────────────────────────────
  function renderWaitingPanel() {
    if (_gameStarted) return;
    const g = games[gId] || {};
    const maxP    = g.maxPlayers || 5;
    const minToStart = 2;

    // Collect the pids currently AT THE TABLE. We can't use seatData.active
    // because that flag is per-hand (it's set true on HandStart, false when
    // the player folds or sits out). Before the first hand has even started,
    // every newly-joined player is created with active=false by design — so
    // filtering on 'active' would hide them all in the waiting panel.
    //
    // Instead we use a dedicated 'gone' flag, set by the GamePlayerLeft
    // handler and reset by GamePlayerJoined. A pid is at the table iff its
    // seatData entry exists AND .gone is not true.
    const pids = Object.keys(seatData)
      .map(Number)
      .filter(function(pid) {
        return seatData[pid] && !seatData[pid].gone;
      });
    if (!pids.includes(myId) && myId) pids.push(myId);

    // 'current' MUST come from the same source as the player list below
    // so the two can't disagree visually. We tried using games[gId].players
    // as a fallback (commit 6e03ed1) and as a 'safety net' value here, but
    // both lead to inconsistencies:
    //
    //   * games[gId].players is the LOBBY counter, only updated by
    //     GameListPlayerJoined / Left. Once a client enters a game, the
    //     server stops sending those messages to it, so this counter
    //     freezes at its last value — typically reflecting the state
    //     when the user joined.
    //
    //   * Combining it via Math.max with pids.length produces:
    //         lobby counter=2 (stale), pids.length=1 (real)  → shows 2
    //     even though the list right below only has 1 pseudo. This was
    //     visible after a user disconnected and reconnected.
    //
    // pids is the same array we iterate to build the list below. By
    // anchoring current on pids.length we guarantee count and list
    // always agree.
    const current = Math.max(pids.length, 1);

    // Build the player list rows
    let rows = '';
    for (const pid of pids) {
      const isMe = pid === myId;
      const nick = isMe
        ? (document.getElementById('nick') ? document.getElementById('nick').value : (players[pid] || ''))
        : (players[pid] || ('#' + pid));
      // Unified chip: real PokerTH image > placeholder logo > emoji >
      // bot icon > initial letter. Same decision tree as the seat.
      const avChip = _avatarChipHtml(pid, nick, 'wp-av');
      const meTag  = isMe ? ' <span class="wp-me">' + t('waitingYou') + '</span>' : '';
      rows += '<li class="wp-player">' + avChip + '<span class="wp-name">' + esc(nick) + '</span>' + meTag + '</li>';
    }

    // Progress bar (filled circles for present, empty for missing)
    let dots = '';
    for (let i = 0; i < maxP; i++) {
      dots += (i < current) ? '<span class="wp-dot wp-dot-on"></span>'
                            : '<span class="wp-dot wp-dot-off"></span>';
    }

    // Minimum-to-start message
    const enough = current >= minToStart;
    const statusLine = enough
      ? '<div class="wp-ok">' + t('waitingEnough') + '</div>'
      : '<div class="wp-need">' + t('waitingNeedMore').replace('{n}', (minToStart - current)) + '</div>';

    // Admin hint
    const hint = amGameAdmin
      ? '<div class="wp-hint wp-hint-admin">' + t('waitingHintAdmin') + '</div>'
      : '<div class="wp-hint">' + t('waitingHintGuest') + '</div>';

    // Start-now banner: shown to the ADMIN only, when the table was
    // created with the 'fill with bots' option AND the configured minimum
    // number of humans is reached. The banner contains a pulsing button
    // that triggers the existing App.startWithBots() flow. It replaces the
    // implicit (and broken) auto-start that the original code seemed to
    // promise but never wired up: window._minHumansNeeded was written but
    // never read anywhere.
    //
    // We re-evaluate the threshold every render (panel refreshes on join/
    // leave/PlayerInfoReply), so the banner appears/disappears as people
    // come and go.
    // Side-effect: refresh the standalone "▶ Start (no bots)" admin
    // button visibility. We do it here rather than in the JoinGameAck
    // handler because admins typically have count=1 at JoinGameAck
    // (just themselves) — the second human is what makes the button
    // useful, and that join triggers a re-render of this panel.
    try { refreshStartNoBotsVisibility(); } catch(e) {}

    // ── Admin start panel ─────────────────────────────────────
    //
    // Shown to the admin whenever there are >= 2 humans at the table
    // (the minimum required by the server to start a hand). It used
    // to require _createWithBots + _minHumansNeeded — those gates are
    // gone now because the panel offers BOTH choices side by side:
    //
    //   ▶ Démarrer      → App.startNoBots()    (humans only)
    //   ▶ + Bots        → App.startWithBots()  (fill empty seats)
    //
    // We use the existing wp-ready-* style language for visual
    // continuity (green theme, soft pulse), and label them concisely
    // so they fit on one row even on the smallest mobile widths.
    // The same buttons also exist in the header (▶ Start / ▶ Bots)
    // and one click on either path is enough — duplicating them in
    // the waiting panel is a deliberate UX choice: that's where the
    // admin is already looking, especially on mobile where the
    // header buttons are tucked into the ••• overflow.
    let readyBlock = '';
    if (amGameAdmin && current >= 2) {
      var fr_wp = (typeof _lang === 'undefined' || _lang !== 'en');
      readyBlock =
        '<div class="wp-ready-row">' +
          '<div class="wp-ready-label">✓ ' +
            (fr_wp
              ? 'Prêt à jouer — choisissez le mode de démarrage'
              : 'Ready to play — choose how to start') +
          '</div>' +
          '<div class="wp-ready-btn-row">' +
            '<button class="wp-ready-btn" onclick="App.startNoBots()" ' +
              'title="' + (fr_wp ? 'Démarrer avec les humains présents uniquement' : 'Start with humans only') + '">' +
              '▶ ' + (fr_wp ? 'Démarrer' : 'Start') +
            '</button>' +
            '<button class="wp-ready-btn wp-ready-btn-bots" onclick="App.startWithBots()" ' +
              'title="' + (fr_wp ? 'Remplir les sièges vides avec des bots' : 'Fill empty seats with bots') + '">' +
              '▶ + ' + (fr_wp ? 'Bots' : 'Bots') +
            '</button>' +
          '</div>' +
        '</div>';
    }

    const html =
      '<div class="waiting-panel">' +
        '<div class="wp-title">⏳ ' + t('waitingStart') + '</div>' +
        '<div class="wp-count">' + t('waitingPlayerCount') + ' <b>' + current + '</b> / ' + maxP + '</div>' +
        '<div class="wp-bar">' + dots + '</div>' +
        statusLine +
        '<ul class="wp-list">' + rows + '</ul>' +
        readyBlock +
        hint +
      '</div>';
    renderGameWaiting(html, true);
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
  function showEndGameOverlay(winnerPid) {
    const el = document.getElementById('g-endgame-overlay');
    if (!el) return;

    const isMyWin = winnerPid === myId;
    const winnerName = players[winnerPid] || (isMyWin
      ? (document.getElementById('nick') ? document.getElementById('nick').value : 'You')
      : ('#' + winnerPid));
    // Build winner avatar via the unified helper. Same priority order
    // everywhere: real PokerTH image > placeholder logo > emoji > 🤖 >
    // initial letter.
    const avChip = _avatarChipHtml(winnerPid, winnerName, 'eg-winner-av');
    const winnerCls = 'eg-winner' + (isMyWin ? ' me' : '');
    const winnerLabel = isMyWin ? t('endGameYouWon') : t('endGameWinner');

    // Stats — reuse the _stats object that was already being maintained
    const s = _stats || { handsPlayed:0, handsWon:0, totalGain:0, bigWin:0, bigLoss:0, startMoney:0 };
    const wr = s.handsPlayed > 0 ? Math.round(s.handsWon / s.handsPlayed * 100) : 0;
    const finalStack = (s.startMoney || 0) + (s.totalGain || 0);
    const gainCls = (s.totalGain > 0) ? 'pos' : (s.totalGain < 0) ? 'neg' : '';

    // Outcome icon: 🏆 trophy when the local player wins, otherwise a
    // fan of the four aces (♣ ♦ ♥ ♠) — far more on-theme for poker
    // than the old 🎲 dice. Inline SVG so it's crisp at any size and
    // identical across platforms (the dice/emoji rendered differently
    // per OS). The aces keep the gold card-border of the rest of the UI.
    const ACES_SVG =
      '<svg viewBox="0 0 120 96" width="92" height="74" xmlns="http://www.w3.org/2000/svg" class="eg-aces" aria-hidden="true">' +
        '<defs><filter id="egAceSh" x="-20%" y="-20%" width="140%" height="140%">' +
          '<feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000" flood-opacity="0.5"/>' +
        '</filter></defs>' +
        '<g filter="url(#egAceSh)">' +
          '<g transform="rotate(-26 60 74)">' +
            '<rect x="41" y="32" width="25" height="37" rx="3.4" fill="#fdfdf8" stroke="#c8a84a" stroke-width="1"/>' +
            '<text x="44.5" y="43" font-family="Georgia, serif" font-size="8.5" font-weight="bold" fill="#1a1a1a">A</text>' +
            '<text x="53.5" y="58" font-family="serif" font-size="14" fill="#1a1a1a" text-anchor="middle">\u2663</text>' +
          '</g>' +
          '<g transform="rotate(-9 60 74)">' +
            '<rect x="46" y="26" width="25" height="37" rx="3.4" fill="#fdfdf8" stroke="#c8a84a" stroke-width="1"/>' +
            '<text x="49.5" y="37" font-family="Georgia, serif" font-size="8.5" font-weight="bold" fill="#c0392b">A</text>' +
            '<text x="58.5" y="52" font-family="serif" font-size="14" fill="#c0392b" text-anchor="middle">\u2666</text>' +
          '</g>' +
          '<g transform="rotate(9 60 74)">' +
            '<rect x="49" y="26" width="25" height="37" rx="3.4" fill="#fdfdf8" stroke="#c8a84a" stroke-width="1"/>' +
            '<text x="52.5" y="37" font-family="Georgia, serif" font-size="8.5" font-weight="bold" fill="#c0392b">A</text>' +
            '<text x="58.5" y="52" font-family="serif" font-size="14" fill="#c0392b" text-anchor="middle">\u2665</text>' +
          '</g>' +
          '<g transform="rotate(26 60 74)">' +
            '<rect x="54" y="32" width="25" height="37" rx="3.4" fill="#fdfdf8" stroke="#c8a84a" stroke-width="1"/>' +
            '<text x="57.5" y="43" font-family="Georgia, serif" font-size="8.5" font-weight="bold" fill="#1a1a1a">A</text>' +
            '<text x="66.5" y="58" font-family="serif" font-size="14" fill="#1a1a1a" text-anchor="middle">\u2660</text>' +
          '</g>' +
        '</g>' +
      '</svg>';
    const trophy = isMyWin ? '🏆' : ACES_SVG;
    const titleKey = isMyWin ? 'endGameTitleWin' : 'endGameTitleEnd';

    el.innerHTML =
      '<div class="endgame-card" onclick="event.stopPropagation()">' +
        '<div class="eg-trophy">' + trophy + '</div>' +
        '<div class="eg-title">' + t(titleKey) + '</div>' +
        '<div class="' + winnerCls + '">' +
          avChip +
          '<div>' +
            '<div class="eg-winner-label">' + winnerLabel + '</div>' +
            '<div class="eg-winner-name">' + esc(winnerName) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="eg-stats-section">' +
          '<div class="eg-stats-title">📊 ' + t('endGameYourStats') + '</div>' +
          '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameHandsPlayed') + '</span><span class="eg-stat-val">' + s.handsPlayed + '</span></div>' +
          '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameHandsWon') + '</span><span class="eg-stat-val pos">' + s.handsWon + ' (' + wr + '%)</span></div>' +
          '<hr class="eg-stat-divider">' +
          '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameFinalStack') + '</span><span class="eg-stat-val">' + finalStack + ' ¥</span></div>' +
          '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameNetGain') + '</span><span class="eg-stat-val ' + gainCls + '">' + (s.totalGain > 0 ? '+' : '') + s.totalGain + ' ¥</span></div>' +
          '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameBestWin') + '</span><span class="eg-stat-val pos">+' + s.bigWin + ' ¥</span></div>' +
          '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameWorstLoss') + '</span><span class="eg-stat-val neg">' + s.bigLoss + ' ¥</span></div>' +
        '</div>' +
        '<div class="eg-actions">' +
          '<button class="eg-btn" onclick="App.endGameClose()">' + t('endGameClose') + '</button>' +
          '<button class="eg-btn primary" onclick="App.endGameLeave()">' + t('endGameBackToLobby') + '</button>' +
        '</div>' +
      '</div>';
    el.style.display = '';

    // Audio cue: winner fanfare for the local player, neutral chime otherwise
    if (typeof notifyWinner === 'function') {
      setTimeout(function(){ notifyWinner(isMyWin); }, 200);
    }
  }

  function updateBottomLayout() {
    var pb = document.querySelector('.player-bar');
    var mz = document.querySelector('.my-zone');
    if (pb && mz) {
      var pbH = pb.offsetHeight || 52;
      mz.style.bottom = pbH + 'px';
    }
  }

  // Track action history
  const actionLog = [];
  function logAction(txt) {
    actionLog.push(txt);
    if (actionLog.length > 50) actionLog.shift();
    const el = document.getElementById('g-log-body');
    if (el) el.innerHTML = actionLog.slice().reverse().map(function(l){ return '<div class="log-line">'+esc(l)+'</div>'; }).join('');
  }
  function setPct(v) {
    const el = document.getElementById('raise-amt');
    if (!el) return;
    el.value = v;
    if (window.innerWidth < 640) {
      // Mobile : synchroniser slider + display, l'utilisateur valide avec le bouton Raise
      var slider  = document.getElementById('raise-slider');
      var display = document.getElementById('raise-display');
      if (slider)  slider.value       = v;
      if (display) display.textContent = v;
    } else {
      el.focus(); // Desktop : focus pour permettre l'ajustement
    }
  }
  window.setPct = setPct;
  // Exposer pour les animations + fonctions globales
  Object.defineProperty(window, 'seats',       {get: function(){ return seats; }});
  Object.defineProperty(window, 'seatData',    {get: function(){ return seatData; }});
  Object.defineProperty(window, 'myId',        {get: function(){ return myId; }});
  Object.defineProperty(window, 'players',     {get: function(){ return players; }});
  Object.defineProperty(window, '_ipBlockUntil',{
    get: function(){ return _ipBlockUntil; },
    set: function(v){ _ipBlockUntil = v; }
  });
  // Exposer pour les fonctions globales (avatar, etc.)
  // ── Notification + titre dynamique quand c'est mon tour ──
  var _origTitle = 'PokerTH Web';
  var _titleBlinkID = null;

  // BUG FIX: this function used to be named notifyMyTurn(), which
  // shadowed the sound-playing notifyMyTurn() exported by sounds.mjs onto
  // window. As a result, the audio "ding-dong" never played -- only the
  // browser-tab title blink. Renamed to notifyMyTurnVisuals so the audio
  // and the visual cue are both fired explicitly (see call sites below).
  function notifyMyTurnVisuals() {
    var msg = _lang === 'fr' ? '⚡ TON TOUR !' : '⚡ YOUR TURN!';
    var sub = _lang === 'fr' ? 'C\'est à toi de jouer sur PokerTH' : 'It\'s your move on PokerTH';
    // Notification navigateur (si onglet en arrière-plan)
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification(msg, { body: sub, icon: '/favicon.ico', tag: 'pokerth-turn', silent: false }); } catch(e) {}
    }
    // Titre d'onglet dynamique + clignotement
    clearInterval(_titleBlinkID);
    var blink = true;
    document.title = msg + ' — PokerTH';
    _titleBlinkID = setInterval(function() {
      document.title = blink ? (msg + ' — PokerTH') : _origTitle;
      blink = !blink;
    }, 900);
    // Arrêter quand l'onglet est de nouveau actif
    document.addEventListener('visibilitychange', function handler() {
      if (!document.hidden) {
        clearInterval(_titleBlinkID);
        document.title = _origTitle;
        document.removeEventListener('visibilitychange', handler);
      }
    });
  }

  function clearTurnNotif() {
    clearInterval(_titleBlinkID);
    document.title = _origTitle;
  }

  window._renderSeats = function() { if (seats.length) renderSeats(); };
  window.toggleStats  = toggleStats;
  window._toggleStats = toggleStats;
  window._broadcastMyAvatar = function(emoji) {
    _myAvatarCache = emoji || ''; // màj du cache immédiatement
    if (ws && ws.readyState === WebSocket.OPEN && !directWS && myId) {
      ws.send('AVATAR:' + myId + ':' + (emoji || ''));
    }
    // Lobby pill is now an avatar+name combo (clickable, opens the
    // player-info modal). Refresh it so the user sees their pick
    // immediately, both when picking from the connect screen popup
    // AND when picking from the in-lobby popup.
    try { if (typeof updateLobbyPill === 'function') updateLobbyPill(); } catch(e) {}
  };

  function renderMyTurnActions() {
    // Defensive: never render action buttons in spectator mode. The
    // server normally won't send PlayersTurn to spectators, but we
    // guard against it anyway so a stray message can't accidentally
    // give the user an action UI they shouldn't have.
    if (_amSpectator) {
      renderGameWaiting(
        '<div class="spectator-message">' +
          '<span class="sm-icon">👁</span>' +
          t('spectatorActionMsg') +
        '</div>',
        true
      );
      return;
    }
    const myMoney = (seatData[myId] || {}).money || 0;
    const myBet   = (seatData[myId] || {}).bet || 0;
    const toCall  = Math.max(0, highestBet - myBet);
    const canCheck = toCall === 0;
    const minBet  = minRaise > 0 ? minRaise : Math.max(highestBet > 0 ? highestBet : smallBlind * 2, smallBlind * 2);
    const p33  = Math.min(myMoney, Math.max(minBet, Math.round(pot * 0.33)));
    const p50  = Math.min(myMoney, Math.max(minBet, Math.round(pot * 0.5)));
    const p100 = Math.min(myMoney, Math.max(minBet, pot));
    // Pot odds : toCall / (pot + toCall) * 100
    var potOdds = '';
    if (!canCheck && toCall > 0 && pot + toCall > 0) {
      var oddsP = Math.round(toCall / (pot + toCall) * 100);
      potOdds = ' <span style="font-size:0.7em;opacity:0.8">(' + oddsP + '%)</span>';
    }
    // Si toCall >= myMoney, le call consommerait tout le stack — c'est
    // un all-in implicite. On route vers action=6 (All-in) au lieu de
    // action=3 (Call), sinon le serveur rejette (montant > stack).
    // Le label affiche le montant disponible avec un indicateur "(All-In)".
    let callLabel, callAction, callClass;
    if (canCheck) {
      callLabel  = 'Check';
      callAction = 'App.doAction(2,0)';
      callClass  = 'btn-check';
    } else if (toCall >= myMoney) {
      callLabel  = 'Call <b>' + myMoney + '</b> <span style="font-size:0.75em;opacity:0.85">(' + t('allin') + ')</span>';
      callAction = 'App.doAction(6,' + myMoney + ')';
      callClass  = 'btn-call';
    } else {
      callLabel  = 'Call <b>' + toCall + '</b>' + potOdds;
      callAction = 'App.doAction(3,' + toCall + ')';
      callClass  = 'btn-call';
    }
    const raiseLabel = highestBet > 0 ? t('raise') : t('bet');

    // Peut relancer : doit avoir plus que le montant du call ET >= mise min
    const canRaise = myMoney > toCall && myMoney >= minBet;
    const da = canRaise ? '' : ' disabled'; // disabled attribute
    const allInOnly = myMoney <= toCall;    // ne peut que call ou all-in

    const isMobile = window.innerWidth < 640;
    const raiseRowHtml = isMobile
      ? '<div class="raise-row raise-row-mobile">'
        + '<input class="raise-slider" id="raise-slider" type="range" min="' + minBet + '" max="' + myMoney + '" value="' + minBet + '" step="1"' + da
        + ' oninput="document.getElementById(\'raise-amt\').value=this.value;document.getElementById(\'raise-display\').textContent=this.value">'
        + '<span class="raise-display" id="raise-display">' + minBet + '</span>'
        + '<input id="raise-amt" type="hidden" value="' + minBet + '"' + da + '>'
        + '<button class="btn-action btn-raise raise-btn"' + da + ' onclick="App.doRaise()" title="Raise (R)">' + raiseLabel + '</button>'
        + '</div>'
      : '<div class="raise-row">'
        + '<input class="raise-input" id="raise-amt" type="number" min="' + minBet + '" max="' + myMoney + '" value="' + minBet + '"' + da + '>'
        + '<button class="btn-action btn-raise raise-btn"' + da + ' onclick="App.doRaise()" title="Raise (R)">' + raiseLabel + '</button>'
        + '</div>';

    // Auto check/fold toggle: shown above the action buttons, lets the user
    // arm the option NOW so it takes effect on the NEXT turn this hand.
    // The label text adapts to what the auto action will be next time —
    // 'Auto-check' when we currently have nothing to call, 'Auto-fold'
    // otherwise. The checkbox state is bound to window._autoCheckFold via
    // App.toggleAutoCheckFold.
    //
    // The whole row is hidden behind FEATURE_AUTO_CHECK_FOLD so the
    // checkbox can be enabled or disabled in one place without removing
    // the underlying logic. When the flag is false, `autoRow` is empty
    // and the action bar starts directly with the fold/call/raise grid.
    let autoRow = '';
    if (FEATURE_AUTO_CHECK_FOLD) {
      const autoLabel = canCheck
        ? t('autoCheckLabel')
        : t('autoFoldLabel');
      autoRow = '<label class="auto-cf-row">' +
        '<input type="checkbox" id="auto-cf-chk"' + (_autoCheckFold ? ' checked' : '') +
          ' onchange="App.toggleAutoCheckFold(this.checked)">' +
        '<span>' + autoLabel + '</span>' +
        '</label>';
    }

    const h = autoRow + '<div class="action-grid">'
      + '<div class="action-top-row">'
      +   '<button class="btn-action btn-fold" onclick="App.doAction(1,0)" title="Fold (F)">' + t('fold') + '</button>'
      +   '<button class="btn-action ' + callClass + '" onclick="' + callAction + '" title="Call/Check (C)">' + callLabel + '</button>'
      + '</div>'
      + '<div class="pct-row">'
      +   '<button class="btn-pct"' + da + ' onclick="setPct(' + p33  + ')">33%</button>'
      +   '<button class="btn-pct"' + da + ' onclick="setPct(' + p50  + ')">50%</button>'
      +   '<button class="btn-pct"' + da + ' onclick="setPct(' + p100 + ')">100%</button>'
      + '</div>'
      + raiseRowHtml
      + '<button class="btn-action btn-allin" onclick="App.doAction(6,' + myMoney + ')" title="All-In (A)">All-In <b>' + myMoney + '</b></button>'
      + '</div>';

    $('g-actions').innerHTML = h;
    // Same fix as in PlayersTurn handler: fire BOTH the audio chime and the
    // visual notification (they used to be one call, but the local function
    // shadowed the audio one).
    if (typeof window.notifyMyTurn === 'function') window.notifyMyTurn();
    if (typeof notifyMyTurnVisuals === 'function') notifyMyTurnVisuals();
    hapticBuzz([90, 50, 90]); // "your turn" double-buzz (mobile only)
    // Tell server we're alive (avoid timeout)
    const rtm = Proto.encode([[1,0,68],[69,2,new Uint8Array(0)]]);
    send(rtm);
  }

  // ─── Patch App with action methods ───

  function doAction(action, bet) {
    // Guard contre les envois sur un WebSocket fermé/en cours de fermeture.
    // Sur mobile, une micro-coupure réseau (transition Wifi/4G) peut fermer
    // le WS sans qu'on s'en rende compte avant la prochaine action. send()
    // est silencieux si le WS n'est pas OPEN — on évitait donc d'envoyer
    // sans le savoir, puis on stoppait le timer et l'UI affichait
    // "Action envoyée" alors que rien n'avait quitté la machine.
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      $('g-actions').innerHTML = '<div class="waiting-msg" style="color:#e74c3c">⚠ '
        + (_lang === 'fr' ? 'Connexion perdue — action non envoyée'
                          : 'Connection lost — action not sent')
        + '</div>';
      logAction('⚠ ' + (_lang === 'fr' ? 'Envoi impossible (WS fermé)'
                                       : 'Send failed (WS closed)'));
      return;
    }
    setMyTurnActive(false);
    send(MSG.buildMyAction(gId, handNum, gameState, action, bet));
    $('g-actions').innerHTML = '<div class="waiting-msg">' + t('actionSent') + '</div>';
    stopTurnTimer();
  }
  function doRaise() {
    // Validation préventive du montant avant envoi : sans ce clamp, un
    // input édité hors-bornes (valeur < minBet, > stack, vide ou non
    // numérique) provoquait un rejet serveur YourActionRejected. Les
    // attributs HTML min/max ne sont qu'indicatifs et ne bloquent pas
    // la soumission programmatique.
    const myMoney = (seatData[myId] || {}).money || 0;
    const myBet   = (seatData[myId] || {}).bet   || 0;
    const minBet  = minRaise > 0
      ? minRaise
      : Math.max(highestBet > 0 ? highestBet : smallBlind * 2, smallBlind * 2);
    let amt = parseInt((document.getElementById('raise-amt')||{}).value, 10);
    if (!Number.isFinite(amt) || amt <= 0) amt = minBet;
    // Clamp dans [minBet, myMoney]. Si le résultat atteint le stack,
    // on bascule explicitement en All-in (action=6) — sémantiquement
    // plus juste et évite tout doute sur l'interprétation serveur.
    amt = Math.max(minBet, Math.min(amt, myMoney));
    if (amt >= myMoney) {
      doAction(6, myMoney);
    } else {
      doAction(highestBet > 0 ? 5 : 4, amt);
    }
  }

  // ── Winner overlay ──
function showWinnerOverlay(winners) {
  var ov = document.getElementById('g-winner-overlay');
  if (!ov || !winners || winners.length === 0) return;

  var mainWinner = winners[0];
  var isMyWin = winners.some(function(w){ return w.pid === myId; });
  // Big-win sound trigger: when *I* win, decide between a regular winner
  // chirp and the full confetti-pop. Threshold is intentionally generous
  // (>= 30 × small blind) so the fanfare doesn't fire on every micro pot
  // but does on anything meaningful. Falls back to plain notifyWinner if
  // notifyBigWin isn't loaded for any reason (defensive against old SW
  // caches serving an older sounds.mjs).
  var _totalWon = winners.reduce(function(s,w){ return s + (w.won||0); }, 0);
  var BIG_WIN_THRESHOLD = Math.max(300, smallBlind * 30);
  if (isMyWin && _totalWon >= BIG_WIN_THRESHOLD && typeof notifyBigWin === 'function') {
    notifyBigWin();
  } else if (typeof notifyWinner === 'function') {
    notifyWinner(isMyWin);
  }
  var trophy = isMyWin ? "🎉" : "🏆";

  // Build header
  var winnerNames = winners.map(function(w){ return esc(getPlayerName(w.pid)); }).join(" & ");
  var totalWon = winners.reduce(function(s,w){ return s+w.won; }, 0);

  var html = '<div class="winner-card" onclick="event.stopPropagation()">';

  // ── Header ──
  html += '<div class="wc-header">';
  html += '<div class="wc-trophy">' + trophy + '</div>';
  html += '<div class="wc-titles">';
  html += '<div class="wc-label">' + (isMyWin ? t('youWon') : t('handWinner')) + '</div>';
  html += '<div class="wc-name">' + winnerNames + '</div>';
  html += '</div>';
  html += '<div class="wc-gain">+' + totalWon + ' ¥</div>';
  html += '</div>';

  // ── Stats ──
  html += '<div class="wc-stats">';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('handOf') + '</div><div class="wc-stat-value">' + handNum + '</div></div>';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('totalPot') + '</div><div class="wc-stat-value">' + totalWon + ' ¥</div></div>';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('players') + '</div><div class="wc-stat-value">' + seats.length + '</div></div>';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('blinds') + '</div><div class="wc-stat-value">' + smallBlind + '/' + (smallBlind*2) + '</div></div>';
  html += '</div>';

  // ── Board (community cards) ──
  var comm = commCards.filter(function(n){ return n != null; });
  if (comm.length) {
    html += '<div class="wc-section">' + t('commCards') + '</div>';
    html += '<div class="wc-cards-row">';
    comm.forEach(function(n){ html += cardHtml(n, "sm", true); });
    html += '</div>';
  }

  // ── Combinaison gagnante ──
  if (comm.length >= 3) {
    // Chercher la meilleure main parmi les gagnants (cartes connues)
    var bestHandLabel = '';
    for (var _wi = 0; _wi < winners.length && !bestHandLabel; _wi++) {
      var _wpid = winners[_wi].pid;
      var _wsd  = seatData[_wpid] || {};
      var _hc1  = (_wpid === myId) ? myCards[0] : _wsd.card1;
      var _hc2  = (_wpid === myId) ? myCards[1] : _wsd.card2;
      if (_hc1 != null && _hc2 != null) {
        var _holeNorm = [_hc1, _hc2].map(normalizeHoleCard).filter(function(c){ return c != null; });
        if (_holeNorm.length === 2) {
          var _res = evaluateBestHand(_holeNorm, comm);
          if (_res) bestHandLabel = _lang === 'fr' ? _res.fr : _res.en;
        }
      }
    }
    if (bestHandLabel) {
      html += '<div class="wc-best-hand">' + bestHandLabel + '</div>';
    }
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
  var allPids = seats.length ? seats.slice() : Object.keys(seatData).map(Number);
  var winnerPids = winners.map(function(w){ return w.pid; });
  allPids.sort(function(a,b){
    var aW = winnerPids.indexOf(a) >= 0 ? 1 : 0;
    var bW = winnerPids.indexOf(b) >= 0 ? 1 : 0;
    if (aW !== bW) return bW - aW;
    return ((seatData[b]||{}).money||0) - ((seatData[a]||{}).money||0);
  });

  allPids.forEach(function(pid) {
    var sd    = seatData[pid] || {};
    var isW   = winnerPids.indexOf(pid) >= 0;
    var isMe  = pid === myId;
    var name  = getPlayerName(pid);
    var wObj  = winners.find(function(w){ return w.pid === pid; });
    var delta = isW ? (wObj ? wObj.won : 0) : "";
    var deltaClass = isW ? "pos" : "neg";
    var rowClass = "wc-player-row" + (isW ? " wc-winner" : "") + (isMe ? " wc-me-row" : "");

    html += '<div class="' + rowClass + '">';
    html += _avatarChipHtml(pid, name, 'wc-player-av');
    html += '<div class="wc-player-info">';
    html += '<div class="wc-player-name">' + esc(name) + (isW ? " 🏆" : "") + (isMe ? " 👤" : "") + '</div>';
    html += '<div class="wc-player-stack">' + (sd.money != null ? sd.money + " ¥" : "—") + '</div>';
    html += '</div>';
    // Show cards if revealed
    if (sd.card1 != null || sd.card2 != null) { // FIX: || test falsy ratait les cartes à valeur 0
      html += '<div class="wc-player-cards">';
      html += cardHtml(sd.card1 != null ? sd.card1 : null,"xsm",false) + cardHtml(sd.card2 != null ? sd.card2 : null,"xsm",false);
      html += '</div>';
    } else if (isMe && myCards[0] != null) { // FIX: idem, valeur 0 = falsy
      html += '<div class="wc-player-cards">';
      html += cardHtml(myCards[0],"xsm",false) + cardHtml(myCards[1],"xsm",false);
      html += '</div>';
    }
    html += '<div class="wc-player-delta ' + deltaClass + '">' + (isW ? "+" + delta + " ¥" : "") + '</div>';
    html += '</div>';
  });

  html += '</div>';
  html += '<button class="winner-dismiss" onclick="App.dismissWinner()">' + t('continue') + '</button>';
  html += '</div>';

  ov.innerHTML = html;
  ov.style.display = 'flex';
  clearTimeout(window._winnerTimer);
  window._winnerTimer = setTimeout(function(){ App.dismissWinner(); }, 12000);
}

function dismissWinner() {
  var ov = document.getElementById('g-winner-overlay');
  if (ov) ov.style.display = 'none';
  clearTimeout(window._winnerTimer);
}

  return {
    onLoginModeChange() {
      const mode = $('login-mode').value;
      $('f-pass').style.display = mode === 'auth' ? '' : 'none';
      // TLS is only ever meaningful when connecting to pokerth.net
      // (which mandates it). On LAN / private servers it's almost
      // always uncheck-and-forget, so we just hide the row there to
      // declutter the form. The setting itself stays in the DOM —
      // each branch below still sets $('use-tls').checked appropriately.
      var tlsRow = document.getElementById('tls-row');
      if (tlsRow) tlsRow.style.display = (mode === 'auth') ? '' : 'none';

      const hostInput  = $('host');
      const proxyInput = $('proxy');
      const autoHost   = hostInput ? (hostInput.dataset.autoHost || window.location.hostname) : '';
      const proto      = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const port       = window.location.port || '8080';

      // Helper: read a string from localStorage with try/catch so private
      // browsing modes that disable storage don't crash the page.
      var lsGet = function(k) {
        try { return localStorage.getItem(k); } catch(e) { return null; }
      };

      // Nick field state machine. Per the user spec:
      //   LAN     → editable, prefilled from pth_lan_nick (per-mode key)
      //   unauth  → editable, prefilled from pth_unauth_nick (per-mode key)
      //   guest   → READONLY, always set to the persistent GuestXXXXX
      //   auth    → editable, prefilled from pth_auth_login (login only,
      //             never the password — browser keychain handles that)
      var nickEl = $('nick');
      // Always reset the readonly flag first; only Guest re-applies it.
      if (nickEl) nickEl.removeAttribute('readonly');

      if (mode === 'lan') {
        $('nick-label').textContent = t('enterNickFree');
        $('nick').placeholder = t('nickPlaceholder');
        // Restore the per-mode saved pseudo (overrides whatever was
        // typed under another mode — same UX as switching profiles).
        if (nickEl) nickEl.value = lsGet('pth_lan_nick') || '';
        $('use-tls').checked = false;
        if (proxyInput) proxyInput.value = proto + '//' + (autoHost||'localhost') + ':' + port;
        if (hostInput && autoHost) hostInput.value = autoHost;
        setStatus(t('lanModeNote'));
      } else if (mode === 'unauth') {
        $('nick-label').textContent = t('enterNickFree');
        $('nick').placeholder = t('nickPlaceholder');
        if (nickEl) nickEl.value = lsGet('pth_unauth_nick') || '';
        $('use-tls').checked = false;
        if (proxyInput) proxyInput.value = proto + '//' + (autoHost||'localhost') + ':' + port;
        if (hostInput && autoHost) hostInput.value = autoHost;
        setStatus(t('chatAvailPrivate'));
      } else if (mode === 'guest') {
        $('nick-label').textContent = t('enterNickGuest');
        // Compute the stable GuestXXXXX name, put it in the field,
        // and lock it. The user CAN'T change a Guest nick — the
        // server-issued IDs are not user-controllable anyway.
        var guestName = (window.getOrCreateGuestName && window.getOrCreateGuestName())
                       || ('Guest' + String(Math.floor(10000 + Math.random()*90000)));
        if (nickEl) {
          nickEl.value = guestName;
          nickEl.setAttribute('readonly', 'readonly');
          nickEl.placeholder = guestName;
        }
        $('use-tls').checked = false;
        if (proxyInput) proxyInput.value = proto + '//' + (autoHost||'localhost') + ':' + port;
        if (hostInput) hostInput.value = 'pokerth.net';
        if ($('port')) $('port').value = '7234';   // pokerth.net standard port
        setStatus('');
      } else {
        // mode === 'auth'  (pokerth.net registered account)
        $('nick-label').textContent = t('enterAccount');
        $('nick').placeholder = 'MyAccount';
        // Prefill the login if we saved one previously. The password
        // is NEVER persisted in localStorage — that's what the browser
        // keychain (via autocomplete='current-password') is for.
        if (nickEl) nickEl.value = lsGet('pth_auth_login') || '';
        $('use-tls').checked = true;   // TLS is mandatory for credentialed login
        if (proxyInput) proxyInput.value = proto + '//' + (autoHost||'localhost') + ':' + port;
        if (hostInput) hostInput.value = 'pokerth.net';
        if ($('port')) $('port').value = '7234';   // pokerth.net standard port
        setStatus(t('enterCredentials'));
      }
    },

    connect() {
      // ── Fix 2 + 3: re-entrancy guard ──
      // Disable double-clicks: if a connect() is already in progress
      // (either waiting on SW, waiting on previous WS to close, or
      // waiting for mode-swap gap), ignore the new click.
      if (_connectingNow) {
        return;
      }
      // ── SW-ready gate (one-shot per page lifetime) ──
      // First-time visitors trigger a Service Worker install on page load.
      // The SW does skipWaiting() + clients.claim(), which can take control
      // of the page WHILE our first WebSocket is being established. The
      // takeover kills the in-flight WS (browser closes it with code 1005),
      // and the PokerTH server interprets that as a suspicious connect-then-
      // immediately-drop pattern, blocking the IP for a few minutes.
      //
      // Fix: on the FIRST call only, wait until the SW is settled before
      // actually opening the upstream. Uses navigator.serviceWorker.ready,
      // which resolves the moment the SW has reached the 'activated' state
      // — usually <100ms when already installed, up to a second on first
      // visit while the SW caches assets.
      if (!window._swReadyOnce && 'serviceWorker' in navigator) {
        window._swReadyOnce = true;
        var self = this;
        var fired = false;
        var go = function() {
          if (fired) return; fired = true;
          self.connect();
        };
        setStatus('⏳ ' + (t('initializing') || 'Initialisation…'));
        navigator.serviceWorker.ready.then(go);
        setTimeout(go, 1500);   // safety timeout
        return;
      }

      // ── Fix 1: anti-blocage 'rapid mode swap' ──
      // Read the current mode + nickname BEFORE doing any rate-limit check
      // so we can decide whether this call needs the extra mode-swap delay.
      const _curMode = $('login-mode') ? $('login-mode').value : 'guest';
      const _curNick = ($('nick') ? $('nick').value.trim() : '');
      const _modeChanged = (_lastInitMode !== null) &&
                           (_curMode !== _lastInitMode || _curNick !== _lastInitNick);
      const _gapNow = Date.now() - _lastInitTime;
      if (_modeChanged && _gapNow < MODE_SWAP_MIN_GAP) {
        const wait_ms = MODE_SWAP_MIN_GAP - _gapNow;
        const wait_s = Math.ceil(wait_ms / 1000);
        const that = this;
        // Disable the connect button so the user can't pile clicks
        _connectingNow = true;
        var btn = document.querySelector('#s-connect .btn-primary');
        if (btn) btn.disabled = true;
        // Live countdown so the user understands what's happening
        var remain = wait_s;
        setStatus('⏳ ' + t('preparingConnection').replace('{n}', remain));
        var iv = setInterval(function(){
          remain--;
          if (remain > 0) setStatus('⏳ ' + t('preparingConnection').replace('{n}', remain));
        }, 1000);
        setTimeout(function() {
          clearInterval(iv);
          if (btn) btn.disabled = false;
          _connectingNow = false;
          that.connect();
        }, wait_ms);
        return;
      }

      // ── Fix 2: properly close any lingering WebSocket before reopening ──
      // The original code did `ws.close()` then immediately created a new
      // one. That works most of the time, but `ws.close()` is async — the
      // socket can stay in CLOSING state for a few hundred ms. If we open
      // the new one immediately, the server briefly sees two active
      // connections from the same IP, which can also trigger initBlocked.
      // Defer the rest of connect() until the old WS reaches CLOSED, with
      // a 500ms hard cap so we never hang.
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        _connectingNow = true;
        var that2 = this;
        var btn2 = document.querySelector('#s-connect .btn-primary');
        if (btn2) btn2.disabled = true;
        setStatus('⏳ ' + (t('closingPrevious') || 'Fermeture de la connexion précédente…'));
        // Detach the old onclose to avoid the disconnect handler kicking in
        var prevWs = ws;
        prevWs.onclose = null;
        prevWs.onerror = null;
        try { prevWs.close(); } catch(e) {}
        ws = null;
        var done = false;
        var resume = function() {
          if (done) return; done = true;
          if (btn2) btn2.disabled = false;
          _connectingNow = false;
          that2.connect();
        };
        // The CLOSING → CLOSED transition is typically <50ms. We poll for
        // it instead of relying on an event because we removed the
        // listeners above.
        var poll = setInterval(function() {
          if (!prevWs || prevWs.readyState === WebSocket.CLOSED) {
            clearInterval(poll); resume();
          }
        }, 30);
        setTimeout(function(){ clearInterval(poll); resume(); }, 500);
        return;
      }

      // ── Rate limiter : éviter le spam qui provoque le blocage IP ──
      const now = Date.now();
      if (_ipBlockUntil > now) {
        const remaining = Math.ceil((_ipBlockUntil - now) / 1000);
        const mins = Math.floor(remaining / 60), secs = remaining % 60;
        setStatus('⏳ IP bloquée — attendre encore ' + (mins > 0 ? mins + 'min ' : '') + secs + 's', 'err');
        _startIpBlockCountdown();
        return;
      }
      // Rate limiter seulement après un échec (pas après une déco normale)
      if (_lastConnectFailed && now - _lastConnectTime < MIN_CONNECT_INTERVAL) {
        const wait = Math.ceil((MIN_CONNECT_INTERVAL - (now - _lastConnectTime)) / 1000);
        setStatus('⏸ Attendez ' + wait + 's avant de retenter…', 'err');
        return;
      }
      _lastConnectTime = now;
      // Sauvegarder le serveur préféré
      try {
        var lm2 = $('login-mode'); var hv = $('host'); var pv = $('port'); var xv = $('proxy');
        if (lm2) localStorage.setItem('pth_login_mode', lm2.value);
        if (hv)  localStorage.setItem('pth_host',  hv.value.trim());
        if (pv)  localStorage.setItem('pth_port',  pv.value.trim());
        if (xv)  localStorage.setItem('pth_proxy', xv.value.trim());
        // Auto-save the nickname per-mode (no Remember-me checkbox
        // needed — silent persistence is the new default). Guest is
        // skipped because it manages its own pth_guest_name key, and
        // auth saves only the LOGIN (never the password — that's the
        // browser keychain's job via autocomplete='current-password').
        var nickVal = ($('nick') && $('nick').value || '').trim();
        if (nickVal && lm2) {
          var mv = lm2.value;
          if      (mv === 'lan')    localStorage.setItem('pth_lan_nick',    nickVal);
          else if (mv === 'unauth') localStorage.setItem('pth_unauth_nick', nickVal);
          else if (mv === 'auth')   localStorage.setItem('pth_auth_login',  nickVal);
        }
      } catch(e) {}
      const proxyUrl  = $('proxy').value.trim();
      const host      = $('host').value.trim();
      const port      = $('port').value.trim() || '7234';
      const loginMode = $('login-mode') ? $('login-mode').value : 'guest';
      myName          = $('nick').value.trim();

      if (!myName && loginMode === 'guest') {
        // Persistent Guest name: re-use the same identifier across tabs
        // and reloads so the server doesn't see different pseudos flooding
        // from the same IP (a key trigger of the initBlocked behaviour).
        myName = (window.getOrCreateGuestName && window.getOrCreateGuestName())
                 || ('Guest' + String(Math.floor(10000 + Math.random()*90000)));
        $('nick').value = myName;
      }
      if (!myName) { setStatus(t('enterNick'), 'err'); return; }
      if (myName.length < 3) { setStatus(t('nickTooShort'), 'err'); return; }
      if (!proxyUrl || !host) { setStatus(t('fillFields'), 'err'); return; }

      if (loginMode === 'auth' && (!$('pass') || !$('pass').value.trim())) {
        setStatus(t('enterPassword'), 'err');
        return;
      }

      const useTls   = $('use-tls').checked;
      const tlsParam = useTls ? '1' : '0';
      // Close any existing connection first
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        ws.onclose = null; // don't trigger the disconnect handler
        ws.close();
        ws = null;
      }
      rxBuf   = new Uint8Array(0);
      games   = {};
      players = {};
      loaded  = false;

      // Direct WSS for any pokerth.net mode (guest or authenticated). The
      // /pthlive endpoint is the only one publicly exposed by pokerth.net
      // (port 7234 is not reachable in TLS from the outside). It accepts
      // authenticated logins as long as the InitMessage carries the password
      // in clientUserData.
      const isPokerThDirect = (loginMode === 'guest' || loginMode === 'auth');
      const targetIsPokerTH = host.includes('pokerth.net');
      directWS = isPokerThDirect && targetIsPokerTH;
      const finalUrl = directWS
        ? 'wss://www.pokerth.net:443/pthlive'
        : proxyUrl + '?host=' + encodeURIComponent(host) + '&port=' + encodeURIComponent(port) + '&tls=' + tlsParam;

      setStatus(directWS ? t('connDirect') : t('connProxy'));

      // Sauvegarder les paramètres pour la reconnexion auto
      // Record this Init's identity so the NEXT connect() can compare
      // and apply the mode-swap delay if needed.
      _lastInitMode = loginMode;
      _lastInitNick = myName;
      _lastInitTime = Date.now();
      _lastConnectParams = { host, port, loginMode, finalUrl, myName,
        pass: $('pass') ? $('pass').value : '' };
      _reconnectAttempts = 0;
      _intentionalDisconnect = false;
      _wasAuthenticated = false;
      _currentLoginMode = loginMode; // sauvegarder pour ChatReject
      // The CreateGame form defaults depend on this mode. Refresh them
      // now so the values are correct the first time the user opens it.
      try { App._applyCreateFormDefaults(true); } catch (e) {}
      try {
        ws = new WebSocket(finalUrl);
      } catch (e) {
        setStatus('URL invalide: ' + e.message, 'err');
        return;
      }

      ws.binaryType = 'arraybuffer';
      ws.onopen    = () => setStatus(t('proxyConnectedWait'));
      ws.onerror   = () => { _lastConnectFailed = true; setStatus('Erreur WebSocket. Le proxy est-il lancé ?', 'err'); };
      ws.onmessage = function(e) {
        if (typeof e.data === 'string') {
          // Message texte = protocole proxy (réactions)
          if (e.data.startsWith('AVATAR:')) {
            var avParts = e.data.split(':');
            var avPid = parseInt(avParts[1]);
            var avEmoji = avParts[2] || '';
            if (avPid && avPid !== myId) {
              _playerAvatars[avPid] = avEmoji;
              if (typeof renderSeats === 'function' && seats.length) renderSeats();
            }
            return;
          }
          if (e.data.startsWith('REACT:')) {
            var parts = e.data.split(':');
            var fromPid = parseInt(parts[1]);
            var reactEmoji = parts[2];
            if (fromPid !== myId) {
              handleIncomingReaction(fromPid, reactEmoji);
              // Pas d'affichage dans le chat — uniquement animation flottante
            }
          }
          return;
        }
        onRawData(e.data);
      };
      ws.onclose = function(e) {
        ws = null;
        clearTimeout(window._reconnectTimer);
        _hideBanner();
        _wasAuthenticated = false;
        show('s-connect');
        // Reconnexion automatique désactivée pour éviter le blocage IP
        // L'utilisateur peut se reconnecter manuellement après 8 secondes
        if (_intentionalDisconnect) {
          setStatus(t('disconnected') || 'Déconnecté.');
        } else {
          setStatus(t('errConnLost'), 'err');
        }
        return;
        // --- RECONNEXION AUTO DÉSACTIVÉE (risque blocage IP) ---
        _reconnectAttempts++;
        var maxAttempts = 3; // max 3 tentatives pour éviter le blocage IP
        if (_reconnectAttempts > maxAttempts) {
          _hideBanner();
          _wasAuthenticated = false;
          show('s-connect');
          setStatus('Reconnexion échouée après ' + maxAttempts + ' tentatives. Reconnectez-vous manuellement.', 'err');
          return;
        }
        // Délai croissant : 5s, 15s, 30s — assez long pour ne pas spammer
        var delay = [5000, 15000, 30000][_reconnectAttempts - 1] || 30000;
        var secs = Math.round(delay/1000);
        _showBanner((_lang==='fr'?'Reconnexion dans ':'Reconnecting in ') + secs + 's… (' + _reconnectAttempts + '/' + maxAttempts + ')');
        window._reconnectTimer = setTimeout(function() {
          if (ws) return; // déjà reconnecté
          _showBanner((_lang==='fr'?'Reconnexion en cours…':'Reconnecting…'));
          try {
            ws = new WebSocket(_lastConnectParams.finalUrl);
            ws.binaryType = 'arraybuffer';
            ws.onopen = function() {
              _showBanner((_lang==='fr'?'Connecté — ré-authentification…':'Connected — re-authenticating…'));
            };
            ws.onerror = function() {
              ws = null;
              // Déclencher onclose pour retenter
              var fakeClose = new Event('close');
              ws && ws.dispatchEvent(fakeClose);
            };
            ws.onmessage = function(e) {
              onRawData(e.data);
              // Si on reçoit des données, la connexion est OK
              if (_reconnectAttempts > 0) {
                _reconnectAttempts = 0;
                setTimeout(_hideBanner, 1500);
              }
            };
            ws.onclose = arguments.callee.caller || function(){};
            // Réutiliser le même handler onclose pour les tentatives suivantes
            ws.onclose = function() {
              ws = null;
              clearTimeout(window._reconnectTimer);
              // Relancer le processus de reconnexion
              App && App.connect && App._reconnectContinue && App._reconnectContinue();
            };
          } catch(err) {
            _showBanner('Erreur: ' + err.message);
          }
        }, delay);
      };
    },

    _reconnectContinue() {
      // Relancer le processus de reconnexion — backoff exponentiel
      if (!_lastConnectParams || _intentionalDisconnect) return;
      _reconnectAttempts++;
      var maxAttempts = 6;
      if (_reconnectAttempts > maxAttempts) {
        _hideBanner();
        show('s-connect');
        setStatus((_lang==='fr'?'Reconnexion échouée après '+maxAttempts+' tentatives. Reconnectez-vous manuellement.':'Reconnection failed after '+maxAttempts+' attempts. Please reconnect manually.'), 'err');
        return;
      }
      // Exponentiel : 3s → 6s → 12s → 24s → 30s → 30s
      var delay = Math.min(3000 * Math.pow(2, _reconnectAttempts - 1), 30000);
      var secsTotal = Math.round(delay / 1000);
      // Countdown live dans le banner
      clearInterval(window._reconnectCountdown);
      var secsLeft = secsTotal;
      function _updateBannerCountdown() {
        var pfx = _lang==='fr' ? 'Reconnexion dans ' : 'Reconnecting in ';
        var sfx = ' ('+_reconnectAttempts+'/'+maxAttempts+')';
        _showBanner(pfx + secsLeft + 's' + sfx);
        if (secsLeft > 0) secsLeft--;
      }
      _updateBannerCountdown();
      window._reconnectCountdown = setInterval(_updateBannerCountdown, 1000);
      window._reconnectTimer = setTimeout(function() {
        clearInterval(window._reconnectCountdown);
        App.connect();
      }, delay);
    },

    confirmDisconnect() {
      // Public entry point for the lobby ✕ button. Opens a small
      // confirmation modal — clicking 'Disconnect' then routes to the
      // existing disconnect() flow; clicking 'Cancel' just closes the
      // modal and leaves the user in the lobby.
      var dd = document.getElementById('disconnect-dialog');
      if (dd) dd.style.display = 'flex';
    },

    confirmDisconnectQuit() {
      // Confirmed — hide the modal and disconnect normally. The user
      // lands on the login screen via the ws.onclose handler.
      var dd = document.getElementById('disconnect-dialog');
      if (dd) dd.style.display = 'none';
      this.disconnect();
    },

    cancelDisconnect() {
      // Cancelled — just dismiss the modal. The connection stays open.
      var dd = document.getElementById('disconnect-dialog');
      if (dd) dd.style.display = 'none';
    },

    disconnect() {
      _intentionalDisconnect = true;
      _wasAuthenticated = false;
      _lastConnectFailed = false; // déco propre → pas de rate limit
      document.body.classList.remove('in-game');
      _hideBanner();
      if (ws) { ws.close(); ws = null; }
      games = {};
      // Reset lobby counters so the next connect starts at 0 instead
      // of inheriting the previous session's tally.
      _lobbyPlayerCount = 0;
      _hasStatistics = false;
      _lobbyPids.clear();
      _pendingNameRequests.clear();
      show('s-connect');
    },


    // ──────────────────────────────────────────────────────────
    // Kick player flow (admin only). See pokerth.proto:
    //   KickPlayerRequestMessage (type 30) → server broadcasts
    //   GamePlayerLeft(leftKicked) to all + RemovedFromGame to victim.
    //   Existing handlers in this file already remove the player
    //   from seats[] on receipt, so the UI updates itself.
    // ──────────────────────────────────────────────────────────
    openKickModal() {
      if (!amGameAdmin) return; // double-check; button shouldn't be visible
      var modal = document.getElementById('kick-modal');
      var list  = document.getElementById('km-list');
      if (!modal || !list) return;
      // Build the list from seatData (covers both pre-game and in-game
      // phases; GamePlayerJoined writes here on first sight). Filter out
      // pids the server has marked as gone, just in case.
      var pids = Object.keys(seatData).map(function(s){ return parseInt(s,10); })
                       .filter(function(p){ return !seatData[p].gone; });
      // Sort: me first, then alphabetical by name.
      pids.sort(function(a, b) {
        if (a === myId && b !== myId) return -1;
        if (b === myId && a !== myId) return 1;
        var na = (players[a] || ('#' + a)).toLowerCase();
        var nb = (players[b] || ('#' + b)).toLowerCase();
        return na < nb ? -1 : na > nb ? 1 : 0;
      });
      if (!pids.length) {
        list.innerHTML = '<div class="km-empty">— ' +
          ((typeof _lang !== 'undefined' && _lang === 'en')
            ? 'No players at the table' : 'Aucun joueur à la table') +
          ' —</div>';
      } else {
        var fr = (typeof _lang === 'undefined' || _lang !== 'en');
        var html = pids.map(function(pid) {
          var name = players[pid] || ('#' + pid);
          var sd   = seatData[pid] || {};
          var stack= (typeof sd.money === 'number') ? (sd.money + ' ¥') : '';
          var isMe = (pid === myId);
          var avChip = (typeof window._avatarChipHtml === 'function')
            ? window._avatarChipHtml(pid, name, 'km-av')
            : '<span class="km-av letter">' + (name[0] || '?').toUpperCase() + '</span>';
          // No kick button for self (admin can't kick themselves; the
          // server would reject it anyway).
          var rowCls = 'km-row' + (isMe ? ' km-self' : '');
          // Escape name for safe HTML injection
          var escName = String(name).replace(/[<>&"]/g, function(c){
            return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];
          });
          var btn = isMe ? '' :
            '<button class="km-kick" type="button" ' +
              'onclick="App.askConfirmKick(' + pid + ')" ' +
              'title="' + (fr ? 'Kicker ' + escName : 'Kick ' + escName) + '" ' +
              'aria-label="Kick">🗑️</button>';
          return '<div class="' + rowCls + '">' +
                   avChip +
                   '<div class="km-info">' +
                     '<div class="km-name">' + escName + '</div>' +
                     (stack ? '<div class="km-meta">' + stack + '</div>' : '') +
                   '</div>' +
                   btn +
                 '</div>';
        }).join('');
        list.innerHTML = html;
      }
      modal.style.display = 'flex';
    },
    closeKickModal() {
      var modal = document.getElementById('kick-modal');
      if (modal) modal.style.display = 'none';
    },
    // Step 2: ask confirmation before sending the kick.
    askConfirmKick(pid) {
      if (!amGameAdmin) return;
      var name = players[pid] || ('#' + pid);
      var fr = (typeof _lang === 'undefined' || _lang !== 'en');
      var msgEl = document.getElementById('kcm-msg');
      var titleEl = document.getElementById('kcm-title');
      if (titleEl) {
        titleEl.textContent = fr ? 'Kicker ce joueur ?' : 'Kick this player?';
      }
      if (msgEl) {
        msgEl.textContent = fr
          ? 'Le joueur "' + name + '" sera expulsé de la table.'
          : 'Player "' + name + '" will be removed from the table.';
      }
      // Stash the target pid for the confirm button.
      window._pendingKickPid = pid;
      var modal = document.getElementById('kick-confirm-modal');
      if (modal) modal.style.display = 'flex';
    },
    cancelKickConfirm() {
      window._pendingKickPid = null;
      var modal = document.getElementById('kick-confirm-modal');
      if (modal) modal.style.display = 'none';
    },
    doKickConfirmed() {
      var pid = window._pendingKickPid;
      var modal = document.getElementById('kick-confirm-modal');
      if (modal) modal.style.display = 'none';
      if (!pid || !amGameAdmin || !gId) {
        window._pendingKickPid = null;
        return;
      }
      var name = players[pid] || ('#' + pid);
      // Try BOTH paths so we work with both server implementations:
      //   1. KickPlayerRequestMessage (type 30) — the proto-level
      //      admin action. Some PokerTH servers honour this, others
      //      ignore it for non-real-player pids (e.g. bots) or have
      //      it disabled for stability reasons (see ChangeLog v2.0.6
      //      "admin actions functional again" — i.e. it was broken).
      //   2. "/kick <name>" via game-scoped chat — the canonical
      //      path documented on the PokerTH forum ("the game admin
      //      can kick a user by typing /kick username at the chat").
      //      The server's admin bot / chatcleaner parses this.
      // Whichever the server supports, one of the two will work; the
      // other is a no-op (server ignores it).
      try { send(MSG.buildKickPlayer(gId, pid)); } catch(e) {}
      try { send(MSG.buildGameChat(gId, '/kick ' + name)); } catch(e) {}
      // Optimistic log so the admin gets immediate feedback even
      // before the server broadcasts GamePlayerLeft. Localised.
      var fr = (typeof _lang === 'undefined' || _lang !== 'en');
      addGameChat(null, '🗑️ ' + (fr
        ? 'Kick demandé pour ' + name + ' (en attente du serveur…)'
        : 'Kick requested for ' + name + ' (waiting for server…)'), 'sys');
      // Watchdog: if the server hasn't broadcast a GamePlayerLeft
      // within 3s, the kick has almost certainly failed silently.
      // This happens on PokerTH servers older than v2.0.6 (March 2026,
      // changelog: "admin actions functional again"). Warn the admin.
      (function(targetPid, targetName, gameAtRequest) {
        setTimeout(function() {
          // Bail if we left the table / changed game in the meantime.
          if (gId !== gameAtRequest) return;
          // Player still present means the kick was not honoured.
          if (seatData[targetPid] && !seatData[targetPid].gone) {
            addGameChat(null, '⚠ ' + (fr
              ? 'Le serveur n\'a pas traité le kick de ' + targetName +
                ' — version PokerTH < 2.0.6 probable.'
              : 'Server did not process kick of ' + targetName +
                ' — likely PokerTH server < 2.0.6.'), 'sys');
          }
        }, 3000);
      })(pid, name, gId);
      window._pendingKickPid = null;
      // Refresh the kick list so the row disappears once the server
      // confirms. We don't close the modal automatically: if the admin
      // wants to kick several players in a row, they can.
      // (We do trigger a re-render after a short delay to give the
      // GamePlayerLeft message time to arrive.)
      setTimeout(function() {
        var m = document.getElementById('kick-modal');
        if (m && m.style.display === 'flex') {
          // Re-open / re-render with the (hopefully) updated seatData
          App.openKickModal();
        }
      }, 600);
    },

    closeTable() {
      // Admin closes table: send leave, server closes game for all
      if (ws && gId) { try { send(MSG.buildLeaveGame(gId)); } catch(e) {} }
      amInGame = false; amGameAdmin = false; _gameStarted = false; _seatsFrozen = false; _amSpectator = false; var _sb2 = document.getElementById('g-spectator-banner'); if (_sb2) _sb2.style.display = 'none';
      gId = 0; seats = []; seatData = {}; _specPids = new Set();
      var _ego = document.getElementById('g-endgame-overlay');
      if (_ego) _ego.style.display = 'none';
      myCards = [null,null]; commCards = [];
      stopTurnTimer();
      dismissWinner();
      _chatRejectShown = false;
      _lastMsgWasReaction = false;
      document.body.classList.remove('in-game');
      var acb = document.getElementById('admin-close-btn');
      if (acb) acb.style.display = 'none';
      var akb = document.getElementById('admin-kick-btn');
      if (akb) akb.style.display = 'none';
      var akbm = document.getElementById('admin-kick-mob');
      if (akbm) akbm.style.display = 'none';
      var asnb = document.getElementById('admin-startnobots-btn');
      if (asnb) asnb.style.display = 'none';
      var asnbm = document.getElementById('admin-startnobots-mob');
      if (asnbm) asnbm.style.display = 'none';
      var badge = document.getElementById('g-admin-badge');
      if (badge) badge.style.display = 'none';
      show('s-lobby');
      addChat(null, '🔒 Table fermée.', 'sys');
    },

    endGameClose() {
      // Just dismiss the end-of-game overlay; the user stays on the
      // table view (final stacks visible, chat still readable).
      var el = document.getElementById('g-endgame-overlay');
      if (el) el.style.display = 'none';
    },

    endGameLeave() {
      // Dismiss the overlay then perform the normal leaveGame() flow:
      // send a LeaveGame to the server, reset client state, and return
      // to the lobby. Reuses everything leaveGame() already does so
      // there's no special-case cleanup path to maintain.
      var el = document.getElementById('g-endgame-overlay');
      if (el) el.style.display = 'none';
      this.leaveGame();
    },

    toggleAutoCheckFold(on) {
      // Flips the per-hand auto check/fold state. Bound to the checkbox
      // injected by renderMyTurnActions(). The flag is consumed on the
      // NEXT PlayersTurn message for our pid within the same hand, and
      // is force-reset on every HandStart so the user never plays a
      // fresh hand on autopilot.
      _autoCheckFold = !!on;
    },

    confirmLeaveGame() {
      // Public entry point for the header ✕ button. Opens the quit
      // confirmation modal — clicking 'Quit' will then call leaveGame()
      // as usual; clicking 'Cancel' just dismisses the modal.
      closeHeaderOverflow();
      var ld = document.getElementById('leave-dialog');
      if (ld) ld.style.display = 'flex';
    },

    confirmLeaveQuit() {
      // Confirmed — close the modal and perform the standard leave
      // flow (send LeaveGame, reset client state, back to lobby).
      var ld = document.getElementById('leave-dialog');
      if (ld) ld.style.display = 'none';
      this.leaveGame();
    },

    cancelLeaveGame() {
      // Cancelled — just hide the modal, user stays in the game.
      var ld = document.getElementById('leave-dialog');
      if (ld) ld.style.display = 'none';
    },

    leaveGame() {
      // Send proper leave request then stay connected (return to lobby)
      if (ws && gId) { try { send(MSG.buildLeaveGame(gId)); } catch(e) {} }
      amInGame = false; amGameAdmin = false; _gameStarted = false; _seatsFrozen = false; _amSpectator = false; var _sb2 = document.getElementById('g-spectator-banner'); if (_sb2) _sb2.style.display = 'none';
      gId = 0; seats = []; seatData = {}; _specPids = new Set();
      var _ego = document.getElementById('g-endgame-overlay');
      if (_ego) _ego.style.display = 'none';
      myCards = [null,null]; commCards = [];
      stopTurnTimer();
      dismissWinner();
      closeHeaderOverflow();
      // Hide admin badge + close button
      var acb = document.getElementById('admin-close-btn');
      if (acb) acb.style.display = 'none';
      var acbm = document.getElementById('admin-close-mob');
      if (acbm) acbm.style.display = 'none';
      var badge = document.getElementById('g-admin-badge');
      if (badge) badge.style.display = 'none';
      show('s-lobby');  // back to lobby, stay connected
    },

    sendReaction(emoji) {
      if (!ws || !gId) return;
      // Envoyer via le proxy en message TEXTE WebSocket (pas PokerTH protocol)
      // → contourne les restrictions chat du serveur PokerTH
      if (ws && !directWS && ws.readyState === WebSocket.OPEN) {
        var reactMsg = 'REACT:' + myId + ':' + emoji;
        ws.send(reactMsg); // text frame, pas binaire
      } else {
        // Fallback directWS : tenter via PokerTH chat
        _lastMsgWasReaction = true;
        send(MSG.buildChat('[R]' + emoji, gId || 0));
      }
      // Afficher immédiatement pour moi
      handleIncomingReaction(myId, emoji);
      _reactionCounts[emoji] = (_reactionCounts[emoji] || 0); // déjà incrémenté dans handleIncomingReaction
    },

    sendGameChat() {
      var input = document.getElementById('g-chat-in');
      if (!input) return;
      var text = input.value.trim();
      if (!text || !ws) return;
      input.value = '';
      _lastMsgWasReaction = false;
      send(MSG.buildChat(text, gId || 0));
      addGameChat(myName, text, 'mine');
    },
    sendChat() {
      const input = $('chat-in');
      const text  = input.value.trim();
      if (!text || !ws) return;
      input.value = '';
      send(MSG.buildChat(text, 0));
      // Affichage optimiste
      addChat(myName, text, 'mine');
    },
    // ── Copy a shareable link to the current table ──────────────
    // Produces a URL like:
    //   https://<thispage>/?host=cookmed.ddns.net&port=7234&tls=0&table=72
    // When a guest opens it, parseShareLink() (run at load) prefills
    // the connect form with host/port/tls and stashes the table id;
    // after the lobby loads we auto-join that table (see the
    // _pendingAutoJoin logic in the GameListNew handler).
    //
    // The link is copied to the clipboard via the async Clipboard
    // API with a legacy execCommand fallback for older / insecure
    // (non-HTTPS) contexts where navigator.clipboard is unavailable.
    copyTableLink() {
      var fr = (typeof _lang === 'undefined' || _lang !== 'en');
      if (!gId) {
        if (typeof showKeyHint === 'function')
          showKeyHint(fr ? 'Aucune table active' : 'No active table');
        return;
      }
      // Pull the connection params the user actually connected with.
      var host = '', port = '', tls = '0';
      try { host = (document.getElementById('host')  || {}).value || ''; } catch(e) {}
      try { port = (document.getElementById('port')  || {}).value || ''; } catch(e) {}
      try { tls  = (document.getElementById('use-tls') && document.getElementById('use-tls').checked) ? '1' : '0'; } catch(e) {}
      host = String(host).trim();
      port = String(port).trim();
      // Build the URL from the current page origin + path (so it works
      // whatever domain the client is served from), with our params.
      var base = window.location.origin + window.location.pathname;
      var qs = 'host=' + encodeURIComponent(host) +
               '&port=' + encodeURIComponent(port) +
               '&tls=' + tls +
               '&table=' + encodeURIComponent(gId);
      var url = base + '?' + qs;

      // Copy with graceful fallbacks.
      function done(ok) {
        if (typeof showKeyHint === 'function') {
          showKeyHint(ok
            ? (fr ? '🔗 Lien copié !' : '🔗 Link copied!')
            : (fr ? 'Copie impossible — lien affiché' : 'Copy failed — link shown'));
        }
        // Reflect status on the modal button if present.
        var btn = document.getElementById('gim-copy-link-btn');
        if (btn) {
          var orig = btn.getAttribute('data-orig') || btn.innerHTML;
          btn.setAttribute('data-orig', orig);
          btn.innerHTML = ok ? '✓ ' + (fr ? 'Copié' : 'Copied') : '⚠';
          setTimeout(function(){ btn.innerHTML = orig; }, 1800);
        }
        if (!ok) {
          // Last resort: show the URL so the user can copy by hand.
          try { window.prompt(fr ? 'Copiez ce lien :' : 'Copy this link:', url); } catch(e) {}
        }
      }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function(){ done(true); }, function(){ legacyCopy(); });
        } else {
          legacyCopy();
        }
      } catch(e) { legacyCopy(); }

      function legacyCopy() {
        try {
          var ta = document.createElement('textarea');
          ta.value = url;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.focus(); ta.select();
          var ok = document.execCommand('copy');
          document.body.removeChild(ta);
          done(!!ok);
        } catch(e) { done(false); }
      }
    },

    spectateGame(gameId) {
      var g = games[gameId];
      if (!g) return;
      // Remember that we joined as spectator. Used by JoinGameAck to flip
      // the UI into 'watch only' mode (banner up top, action area replaced
      // with a message instead of fold/call buttons).
      _amSpectator = true;
      addChat(null, '👁 ' + (_lang==='fr'?'Observation de la table ':'Spectating table ') + (g.name||('#'+gameId)) + '…', 'sys');
      // Use the shared MSG.buildJoinGame helper which now correctly
      // encodes spectateOnly into field 4. The previous hand-rolled
      // message set field 3 (autoLeave) instead, which the server did
      // not interpret as spectate, and silently dropped the request —
      // the user saw 'Joining…' but never got a JoinGameAck back.
      send(MSG.buildJoinGame(gameId, true));
    },

    autoJoinOrCreate() {
      // ⚡ Quick Game button. Two paths:
      //   1) A joinable table (not started, not full) exists → join it
      //      directly, no questions asked.
      //   2) No joinable table → ask the user how many players the new
      //      table should support via the quick-create modal. Avoids
      //      the previous behaviour of silently creating a 2-player
      //      table (too restrictive on busy servers).
      let target = null;
      for (const id of Object.keys(games)) {
        const g = games[id];
        if (g && !g.started && g.players < g.maxPlayers) { target = id; break; }
      }
      if (target) {
        autoAction = true;
        const btn = document.getElementById('btn-autojoin');
        if (btn) { btn.textContent = '⏳...'; btn.disabled = true; }
        addChat(null, t('autoTableFound').replace('{n}', target), 'sys');
        send(MSG.buildJoinGame(parseInt(target), false));
      } else {
        // No table — show the player-count dialog. The actual CreateGame
        // is dispatched by confirmQuickCreate() if the user confirms.
        // Pre-fill the player-count field with the per-mode default (2
        // for LAN/private, 5 for pokerth.net public).
        this._applyCreateFormDefaults(false);
        var qc = document.getElementById('quick-create-dialog');
        if (qc) qc.style.display = 'flex';
      }
    },

    confirmQuickCreate() {
      // 'Create' clicked in the quick-create dialog. Read the player
      // count, clamp to the allowed range 2..10, and dispatch the
      // CreateGame request with the same other defaults the previous
      // hardcoded path used (10s blind / 3000 stack / 30s timeout).
      var qc = document.getElementById('quick-create-dialog');
      var inp = document.getElementById('qc-players');
      var n = parseInt(inp && inp.value, 10);
      if (!Number.isFinite(n)) n = 5;
      if (n < 2) n = 2;
      if (n > 10) n = 10;
      if (qc) qc.style.display = 'none';
      autoAction = true;
      const btn = document.getElementById('btn-autojoin');
      if (btn) { btn.textContent = '⏳...'; btn.disabled = true; }
      addChat(null, t('autoNoTable'), 'sys');
      // Use the per-login-mode defaults so a Quick Game on pokerth.net
      // behaves like the public server (30s timeout) and a Quick Game on
      // a LAN/private box stays snappy (15s).
      var d = this._getCreateDefaults();
      send(MSG.buildCreateGame('WebGame-' + myName, n, d.blind, d.stack, d.timeout));
    },

    cancelQuickCreate() {
      // 'Cancel' clicked — just close the dialog and leave the lobby
      // alone. The Quick Game button is NOT disabled in this path, so
      // the user can try again right away.
      var qc = document.getElementById('quick-create-dialog');
      if (qc) qc.style.display = 'none';
    },

    joinGameWithPassword(gameId, pass) {
      var g = games[gameId];
      var gName = g ? g.name : '#' + gameId;
      addChat(null, 'Joining "' + esc(gName) + '"...', 'sys');
      // JoinExistingGameMessage: gameId=1, password=2
      var msg = Proto.encode([[1,0,gameId],[2,2,pass||'']]);
      send(Proto.encode([[1,0,21],[22,2,msg]]));
    },
    joinGame(gameId) {
      const g = games[gameId];
      if (!g) return;
      if (g.mode === 3) { addChat(null, 'Table closed.', 'sys'); return; }
      if (g.priv || g.type === 3) {
        if (g.type === 3 && !g.priv) { setStatus(typeof t==='function'?t('errNotInvited')||'Invite-only table':'Invite-only table', 'err'); return; }
        const pp = document.getElementById('password-prompt');
        if (pp) {
          var ppName = document.getElementById('pp-table-name');
          var ppPass = document.getElementById('pp-pass');
          if (ppName) ppName.textContent = '🔒 ' + g.name;
          if (ppPass) ppPass.value = '';
          pp.dataset.gameId = gameId;
          pp.style.display = 'flex';
          setTimeout(function(){ if (ppPass) ppPass.focus(); }, 100);
        }
        return;
      }
      addChat(null, 'Joining "' + esc(g.name) + '"...', 'sys');
      send(MSG.buildJoinGame(parseInt(gameId), false));
    },
    dismissWinner() { dismissWinner(); },
    doAction(action, bet) { doAction(action, bet); },
    doRaise() { doRaise(); },

    // ── Per-login-mode CreateGame defaults ───────────────────────────────
    //
    // The form should feel different depending on who's likely to be on the
    // other side of the table:
    //   • LAN / Private server (unauth) → friends & family. Small table (5
    //     seats), short 15s timeout, "fill with bots" pre-checked so you
    //     can start dealing as soon as 2 humans have joined.
    //   • pokerth.net (guest / registered) → public strangers. Standard 8-
    //     seat full ring, longer 30s timeout to give players time to think,
    //     blinds rise every 10 hands (slower), bots OFF by default and the
    //     minimum-humans-before-bots fallback set higher (5).
    //
    // Returns an object whose keys map 1:1 to the form's element ids (minus
    // the 'cf-' prefix). _applyCreateFormDefaults() walks this object and
    // writes each value into the corresponding input.
    _getCreateDefaults() {
      var mode = _currentLoginMode || 'unauth';
      var isPublic = (mode === 'guest' || mode === 'auth');
      if (isPublic) {
        // Defaults for pokerth.net (guest + registered). 10 max players
        // and 3000-stack/blind-10/raise-every-7 follow the desktop
        // client recommendation, BUT narmod requested a SHORT 5s
        // turn timer on pokerth.net so public games keep moving (real
        // strangers, can't afford long thinking turns).
        return {
          name: (myName ? (myName + "'s table") : 'My table'),
          players: 10,
          blind: 10,
          stack: 3000,
          timeout: 5,
          raiseEvery: 7,
          guiSpeed: 5,
          delayHands: 7,
          bots: false,
          minHumans: 5,
          tag: 'public', // for the QuickGame dialog
        };
      }
      // LAN / private-server profile (covers both the 'lan' login mode
      // and the 'unauth' private-server-guest mode). 10 max players
      // like everywhere, but a more relaxed 15s turn timer than the
      // pokerth.net public profile — narmod wants more thinking time
      // when playing among friends. Bots default ON so a small group
      // can start a hand fast.
      return {
        name: 'Table de ' + (myName || 'PokerTH'),
        players: 10,
        blind: 10,
        stack: 3000,
        timeout: 15,
        raiseEvery: 7,
        guiSpeed: 5,
        delayHands: 7,
        bots: true,
        minHumans: 2,
        tag: 'lan',
      };
    },

    // Apply the per-mode defaults to the create-form inputs. We only
    // overwrite empty fields (or fields still holding the previous mode's
    // default) so a user who already typed a custom value isn't surprised
    // by their input being clobbered.
    _applyCreateFormDefaults(force) {
      var d = this._getCreateDefaults();
      var set = function(id, val, options) {
        var el = document.getElementById(id);
        if (!el) return;
        var isCheckbox = el.type === 'checkbox';
        var current = isCheckbox ? el.checked : el.value;
        var defaultMarker = el.dataset.modeDefault; // last value we wrote ourselves
        // Don't overwrite if the user typed something different from our
        // previous default. Force=true (form just opened) always rewrites.
        if (!force && defaultMarker !== undefined && current !== defaultMarker) return;
        if (isCheckbox) {
          el.checked = !!val;
        } else {
          el.value = val;
        }
        el.dataset.modeDefault = isCheckbox ? (!!val) : String(val);
      };
      set('cf-name',        d.name);
      set('cf-players',     d.players);
      set('cf-blind',       d.blind);
      set('cf-stack',       d.stack);
      set('cf-timeout',     d.timeout);
      set('cf-raise-every', d.raiseEvery);
      set('cf-gui-speed',   d.guiSpeed);
      set('cf-delay',       d.delayHands);
      set('cf-bots',        d.bots);
      set('cf-min-humans',  d.minHumans);
      // Sync the "min humans before bots" row visibility with the checkbox.
      var mhRow = document.getElementById('cf-min-humans-row');
      if (mhRow) mhRow.style.display = d.bots ? 'flex' : 'none';
      // Same for the QuickGame dialog default
      var qc = document.getElementById('qc-players');
      if (qc) {
        var qcCurrent = qc.value;
        var qcMarker = qc.dataset.modeDefault;
        if (force || qcMarker === undefined || qcCurrent === qcMarker) {
          // narmod wants 10 max players by default everywhere, so the
          // quick-game dialog mirrors d.players (the per-mode default).
          qc.value = d.players;
          qc.dataset.modeDefault = qc.value;
        }
      }
    },

    toggleCreateForm() {
      var f = document.getElementById('create-form');
      if (!f) return;
      var open = !f.classList.contains('open');
      f.classList.toggle('open', open);
      f.style.display = open ? 'block' : 'none';
      // Apply per-login-mode defaults the first time the form opens (or
      // whenever the user has not yet customized a field).
      if (open) this._applyCreateFormDefaults(false);
      var btn = document.querySelector('.btn-create-manual');
      if (btn) { btn.style.background = open ? 'rgba(200,168,74,0.15)' : ''; btn.style.borderColor = open ? 'var(--gold-dim)' : ''; btn.style.color = open ? 'var(--gold)' : ''; }
    },
    toggleMoreOptions() {
      var el = document.getElementById('cf-more-opts');
      var arrow = document.getElementById('cf-more-arrow');
      var lbl = document.getElementById('cf-more-label');
      if (!el) return;
      var open = el.style.display === 'none';
      el.style.display = open ? '' : 'none';
      if (arrow) arrow.textContent = open ? '▼' : '▶';
      if (lbl) lbl.textContent = open ? (t('lessOptions')||'Less options') : (t('moreOptions')||'More options');
    },
    toggleMinHumans() {
      var cb = document.getElementById('cf-bots');
      var row = document.getElementById('cf-min-humans-row');
      if (row) row.style.display = (cb && cb.checked) ? 'flex' : 'none';
    },
    startWithBots() {
      if (!gId) return;
      addGameChat(null, '▶ Starting with bots…', 'sys');
      send(MSG.buildStartWithBots(gId, true));
    },
    // Start the game with the humans currently at the table and NO
    // auto-filling with bots. Same StartEventMessage as startWithBots,
    // just with fillWithComputerPlayers = false.
    //
    // Per the user-validated design (Q1=b): button is only shown when
    // there are at least 2 humans at the table — startWithoutBotsButtonVisible()
    // updates its visibility on every join / leave / player-info event.
    // We re-check the count here defensively because the visibility
    // is just UI gating, not enforcement.
    startNoBots() {
      if (!gId) return;
      // Same counting heuristic as refreshStartNoBotsVisibility() AND
      // renderWaitingPanel(): seatData pids with .gone falsy, PLUS myId
      // if missing (the server doesn't always echo GamePlayerJoined for
      // ourselves, especially when we're the admin who just created the
      // table — myId never enters seatData via that path).
      // BUG FIX: previously this counted only seatData and refused with
      // "At least 2 players are needed" even though the visible panel
      // showed "Joueurs: 2/5" (because the renderer DID inject myId).
      var pids = Object.keys(seatData)
        .map(function(s){ return parseInt(s,10); })
        .filter(function(p){ return seatData[p] && !seatData[p].gone; });
      if (myId && pids.indexOf(myId) === -1) pids.push(myId);
      if (pids.length < 2) {
        // Should never reach here because the button is hidden when
        // pids.length < 2, but catch it anyway so a stray click on a
        // stale UI can't send a bad request to the server.
        var fr = (typeof _lang === 'undefined' || _lang !== 'en');
        addGameChat(null, '⚠ ' + (fr
          ? 'Au moins 2 joueurs sont nécessaires pour démarrer.'
          : 'At least 2 players are needed to start.'), 'sys');
        return;
      }
      addGameChat(null, '▶ Starting (humans only)…', 'sys');
      send(MSG.buildStartWithBots(gId, false));
    },
    createGame() {
      const g = id => document.getElementById(id);
      const iv = (id, def) => parseInt(g(id)?.value) || def;
      const sv = (id, def) => parseInt(g(id)?.value) || def;
      const name    = (g('cf-name')?.value.trim()) || ('Table ' + myName);
      const nplayers= iv('cf-players', 2);
      const blind   = iv('cf-blind',   10);
      const stack   = iv('cf-stack',   3000);
      const timeout = iv('cf-timeout', 30);
      const bots    = g('cf-bots')?.checked || false;
      const minHuman= iv('cf-min-humans', 1);
      window._createWithBots  = bots;
      window._minHumansNeeded = bots ? minHuman : 0;
      window._humansJoined    = 1;
      gameTimeout = timeout; // mémoriser le timeout pour le timer
      gameStartMoney = stack;  // same idea for the starting stack: the
                               // GameListNew message will eventually echo
                               // this back, but writing it here ensures
                               // it's available immediately for our own
                               // JoinGameAck → GameStartInitial pipeline.
      const tablePass = (document.getElementById('cf-use-password')?.checked) ? (document.getElementById('cf-password')?.value || '') : '';
      // Spectators are allowed by default (true) when the field is missing
      // (older clients, or when the form hasn't been opened) — matches the
      // proto's default. The UI dropdown sends '1' = allowed, '0' = blocked.
      const allowSpecRaw = document.getElementById('cf-allow-spectators');
      const allowSpec = allowSpecRaw ? (allowSpecRaw.value !== '0') : true;
      const opts = {
        raiseMode:       sv('cf-raise-mode',    1),
        raiseEvery:      iv('cf-raise-every',   7),
        endRaiseMode:    sv('cf-end-raise',     1),
        endRaiseValue:   iv('cf-end-raise-val', 200),
        guiSpeed:        iv('cf-gui-speed',     5),
        delayHands:      iv('cf-delay',         7),
        gameType:        sv('cf-game-type',     1),
        allowSpectators: allowSpec,
        password:        tablePass,
      };
      addChat(null, '+ Creating "' + name + '" (' + nplayers + 'p' + (bots ? ' + bots' : '') + ')...', 'sys');
      send(MSG.buildCreateGame(name, nplayers, blind, stack, timeout, opts));
      var f = document.getElementById('create-form');
      if (f) { f.style.display = 'none'; f.classList.remove('open'); }
    },
    getLobbyState() {
      // Read-only snapshot of the bits the players-panel renderer
      // needs. Returning a fresh object each time so the consumer
      // can sort/filter freely without affecting our internal state.
      return {
        pids:    Array.from(_lobbyPids),
        players: players,
        myId:    myId,
      };
    },

    onRememberMe() {
      // Legacy no-op. The 'Remember nickname' checkbox was removed
      // in favour of automatic per-mode persistence. Kept as a stub
      // so any older HTML cached by a Service Worker doesn't 500
      // when its onchange handler fires.
    },
  };
})();

// Bridge: window-scope getters so the players-panel renderer
// (defined outside the IIFE) can read the IIFE-private state.
// Defined right after the IIFE so the closures capture the latest
// references. The renderer falls back to empty data if these
// haven't been set up yet.
window._readLobbyPids = function() {
  // We can't access _lobbyPids directly from out here. Instead we
  // proxy through App.getLobbyState() which the IIFE will expose.
  if (typeof App !== 'undefined' && App.getLobbyState) {
    var s = App.getLobbyState();
    return s.pids || [];
  }
  return [];
};
window._readPlayers = function() {
  if (typeof App !== 'undefined' && App.getLobbyState) {
    var s = App.getLobbyState();
    return s.players || {};
  }
  return {};
};
window._readMyId = function() {
  if (typeof App !== 'undefined' && App.getLobbyState) {
    var s = App.getLobbyState();
    return s.myId || 0;
  }
  return 0;
};


// ── Game chat (mirrors lobby addChat) ──
function addGameChat(sender, text, cls) {
  var el = document.getElementById('g-chat-msgs');
  if (!el) return;
  var d = document.createElement('div');
  d.className = 'msg ' + (cls || '');
  function e(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  if (sender) {
    d.innerHTML = '<span class="who">'+e(sender)+'</span>: <span class="txt">'+e(text)+'</span>';
  } else {
    d.innerHTML = '<span class="txt">'+e(text)+'</span>';
  }
  el.appendChild(d);
  el.scrollTop = el.scrollHeight;
  var cBtn = document.getElementById('chat-toggle-btn');
  var cPan = document.getElementById('g-chat-panel');
  if (cBtn && cls !== 'mine' && (!cPan || cPan.style.display === 'none')) {
    cBtn.style.color = 'var(--gold)';
    cBtn.style.borderColor = 'var(--gold-dim)';
    clearTimeout(window._chatFlashTimer);
    window._chatFlashTimer = setTimeout(function(){
      if (!cPan || cPan.style.display === 'none') { cBtn.style.color=''; cBtn.style.borderColor=''; }
    }, 3000);
    if (typeof notifyChat === 'function') notifyChat();
  }
}

// click handled via inline onclick on game-row

window.addEventListener('resize', function() {
  if (typeof updateBottomLayout === 'function') updateBottomLayout();
  autoScaleTable();
  setTimeout(function(){ if(typeof renderSeats==='function' && typeof seats!=='undefined' && seats.length) renderSeats(); }, 100);
});
window.addEventListener('orientationchange', function() {
  setTimeout(function(){ autoScaleTable(); if(typeof renderSeats==='function' && typeof seats!=='undefined' && seats.length) renderSeats(); }, 300);
});

function autoScaleTable() {
  var tz = document.getElementById('g-table-zone');
  var sc = document.getElementById('g-table-scaler');
  if (!tz || !sc) return;
  sc.style.transform = 'scale(1)';
  // Forcer un reflow avant de lire les dimensions
  void sc.offsetWidth;
  var tzW = tz.clientWidth, tzH = tz.clientHeight;
  var scW = sc.scrollWidth, scH = sc.scrollHeight;
  var ov = document.querySelector('.felt-oval');
  var ga = document.querySelector('.game-area');
  if (!tzW || !scW || !tzH || !scH) {
    sc.style.transform = 'scale(1)';
    return;
  }
  // Scale to 68% of max: leaves 32% room for seat overflow around the oval
  // Sur desktop, on autorise jusqu'à 1.0 max
  // Sur mobile, on peut réduire en dessous de 1 pour tout faire tenir
  var isMobScale = window.innerWidth < 900;
  var scaleMax = isMobScale ? 1 : 1;
  var scale = Math.min(scaleMax, tzW / scW, tzH / scH);
  if (scale < 0.05) scale = 0.5; // fallback visible
  sc.style.transform = 'scale(' + scale.toFixed(3) + ')';
  sc.style.transformOrigin = 'center center';
}
document.addEventListener('DOMContentLoaded', function() { setTimeout(autoScaleTable, 400); });

function toggleLobbyChat() {
  var panel = document.getElementById('lobby-chat-panel');
  var btn   = document.getElementById('lobby-chat-btn');
  if (!panel) return;
  var open = panel.style.display === 'none';
  panel.style.display = open ? 'flex' : 'none';
  if (btn) {
    btn.style.background  = open ? 'rgba(200,168,74,0.2)' : '';
    btn.style.borderColor = open ? 'var(--gold-dim)' : '';
    btn.style.color       = open ? 'var(--gold)' : '';
  }
  if (open) {
    var el = document.getElementById('chat');
    if (el) el.scrollTop = el.scrollHeight;
    setTimeout(function(){ var ci = document.getElementById('chat-in'); if(ci) ci.focus(); }, 80);
  }
}


function renderHandsHelp() {
  var hands = [
    { cards: '<div class="hc hi">A<br>♠</div><div class="hc hi">K<br>♠</div><div class="hc hi">Q<br>♠</div><div class="hc hi">J<br>♠</div><div class="hc hi">10<br>♠</div>', n:'h1n', d:'h1d' },
    { cards: '<div class="hc">9<br>♣</div><div class="hc">8<br>♣</div><div class="hc">7<br>♣</div><div class="hc">6<br>♣</div><div class="hc">5<br>♣</div>', n:'h2n', d:'h2d' },
    { cards: '<div class="hc">K<br>♠</div><div class="hc r">K<br>♥</div><div class="hc r">K<br>♦</div><div class="hc">K<br>♣</div><div class="hc">8<br>♣</div>', n:'h3n', d:'h3d' },
    { cards: '<div class="hc">Q<br>♣</div><div class="hc r">Q<br>♥</div><div class="hc">Q<br>♠</div><div class="hc r">J<br>♦</div><div class="hc">J<br>♣</div>', n:'h4n', d:'h4d' },
    { cards: '<div class="hc r">A<br>♦</div><div class="hc r">J<br>♦</div><div class="hc r">8<br>♦</div><div class="hc r">5<br>♦</div><div class="hc r">2<br>♦</div>', n:'h5n', d:'h5d' },
    { cards: '<div class="hc">9<br>♠</div><div class="hc r">8<br>♥</div><div class="hc">7<br>♣</div><div class="hc r">6<br>♦</div><div class="hc">5<br>♠</div>', n:'h6n', d:'h6d' },
    { cards: '<div class="hc">7<br>♠</div><div class="hc r">7<br>♦</div><div class="hc">7<br>♣</div><div class="hc">K<br>♠</div><div class="hc r">4<br>♥</div>', n:'h7n', d:'h7d' },
    { cards: '<div class="hc">J<br>♣</div><div class="hc r">J<br>♥</div><div class="hc r">5<br>♦</div><div class="hc">5<br>♠</div><div class="hc">A<br>♣</div>', n:'h8n', d:'h8d' },
    { cards: '<div class="hc r">A<br>♥</div><div class="hc">A<br>♠</div><div class="hc r">9<br>♦</div><div class="hc">6<br>♣</div><div class="hc">3<br>♠</div>', n:'h9n', d:'h9d' },
    { cards: '<div class="hc hi">A<br>♠</div><div class="hc r">K<br>♦</div><div class="hc">9<br>♣</div><div class="hc r">5<br>♥</div><div class="hc">2<br>♠</div>', n:'h10n', d:'h10d' },
  ];
  var inner = document.getElementById('hands-card-inner');
  if (!inner) return;
  var rows = hands.map(function(h, i) {
    return '<div class="hand-row">'
      + '<div class="hand-rank">' + (i+1) + '</div>'
      + '<div class="hand-cards">' + h.cards + '</div>'
      + '<div class="hand-info">'
      +   '<div class="hand-name">' + t(h.n) + '</div>'
      +   '<div class="hand-desc">' + t(h.d) + '</div>'
      + '</div></div>';
  }).join('');
  inner.innerHTML = '<div class="hands-title">' + t('handsTitle') + '</div>'
    + rows
    + '<button class="hands-close" onclick="toggleHandsHelp()">' + t('handsClose') + '</button>';
}

function toggleHeaderOverflow(e) {
  if (e) e.stopPropagation();
  var m = document.getElementById('g-overflow-menu');
  if (!m) return;
  // Sync the haptic toggle label/emoji with the current state before
  // the menu becomes visible (📳 = on, 📴 = off).
  try {
    var hb = document.getElementById('haptic-toggle-mob');
    if (hb) {
      var on = true;
      try { on = localStorage.getItem('pth_haptic') !== '0'; } catch(e2) {}
      var fr = (typeof window._lang === 'undefined') ? true : (window._lang !== 'en');
      // window._lang may not be exposed; fall back to checking <html lang>.
      try {
        var lg = document.documentElement.getAttribute('lang');
        if (lg) fr = (lg !== 'en');
      } catch(e3) {}
      hb.innerHTML = (on ? '📳' : '📴') + ' ' + (fr ? 'Vibration' : 'Vibration');
    }
  } catch(e4) {}
  m.classList.toggle('open');
}
function closeHeaderOverflow() {
  var m = document.getElementById('g-overflow-menu');
  if (m) m.classList.remove('open');
}
// Lobby twin: identical behaviour but targets the lobby overflow menu.
// Kept as a separate pair of functions so the inline onclick handlers in
// the lobby HTML stay self-explanatory ('Lobby' in the name), and so we
// don't have to thread a menu id through every callsite.
function toggleLobbyOverflow(e) {
  if (e) e.stopPropagation();
  var m = document.getElementById('l-overflow-menu');
  if (!m) return;
  m.classList.toggle('open');
}
function closeLobbyOverflow() {
  var m = document.getElementById('l-overflow-menu');
  if (m) m.classList.remove('open');
}
// Fermer le menu si on clique ailleurs (game + lobby)
document.addEventListener('click', function(e) {
  var btn = document.getElementById('g-overflow-btn');
  var menu = document.getElementById('g-overflow-menu');
  if (menu && btn && !btn.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.remove('open');
  }
  var lbtn = document.getElementById('l-overflow-btn');
  var lmenu = document.getElementById('l-overflow-menu');
  if (lmenu && lbtn && !lbtn.contains(e.target) && !lmenu.contains(e.target)) {
    lmenu.classList.remove('open');
  }
});

function toggleHandsHelp() {
  var ov = document.getElementById('hands-overlay');
  if (!ov) return;
  var opening = ov.style.display === 'none';
  if (opening) renderHandsHelp();
  ov.style.display = opening ? 'flex' : 'none';
}

function toggleGameChat() {
  var panel = document.getElementById('g-chat-panel');
  var btn   = document.getElementById('chat-toggle-btn');
  if (!panel) return;
  var open = panel.style.display === 'none';
  panel.style.display = open ? 'flex' : 'none';
  setTimeout(function(){ autoScaleTable(); if(typeof renderSeats==='function' && typeof seats!=='undefined' && seats.length) renderSeats(); }, 50);
  if (btn) {
    btn.style.background  = open ? 'rgba(200,168,74,0.2)' : '';
    btn.style.borderColor = open ? 'var(--gold-dim)' : '';
    btn.style.color       = open ? 'var(--gold)' : '';
  }
  if (open) {
    var m = document.getElementById('g-chat-msgs');
    if (m) m.scrollTop = m.scrollHeight;
    var inp = document.getElementById('g-chat-in');
    if (inp) setTimeout(function(){ inp.focus(); }, 80);
  }
}
function joinWithPassword() {
  var pp = document.getElementById('password-prompt');
  if (!pp) return;
  var gameId = parseInt(pp.dataset.gameId);
  var pass   = (document.getElementById('pp-pass') || {}).value || '';
  pp.style.display = 'none';
  if (typeof App !== 'undefined' && App.joinGameWithPassword) {
    App.joinGameWithPassword(gameId, pass);
  }
}

function toggleReactionPanel() {
  var panel = document.getElementById('g-reaction-panel');
  var btn   = document.getElementById('react-toggle-btn');
  if (!panel) return;
  var open = panel.style.display === 'none' || panel.style.display === '';
  panel.style.display = open ? 'flex' : 'none';
  if (btn) {
    btn.style.background  = open ? 'rgba(200,168,74,0.2)' : '';
    btn.style.borderColor = open ? 'var(--gold-dim)' : '';
    btn.style.color       = open ? 'var(--gold)' : '';
  }
  setTimeout(function(){
    autoScaleTable();
    if(typeof renderSeats==='function' && typeof seats!=='undefined' && seats.length)
      renderSeats();
  }, 80);
}

function toggleLog() {
  var panel = document.getElementById('g-log-panel');
  var btn   = document.getElementById('log-toggle-btn');
  if (!panel) return;
  var isHidden = panel.style.display === 'none';
  panel.style.display = isHidden ? '' : 'none';
  if (btn) btn.style.background = isHidden ? 'rgba(200,168,74,0.2)' : '';
  if (btn) btn.style.borderColor = isHidden ? 'var(--gold-dim)' : '';
  if (btn) btn.style.color       = isHidden ? 'var(--gold)' : '';
}

// ── Players online panel ──
// Wired to the #h-players pill in the lobby header. Toggles a
// dropdown that lists every pid in _lobbyPids with its name (or
// '#<pid>' if the PlayerInfoReply hasn't arrived yet).
function togglePlayersPanel() {
  var panel = document.getElementById('players-panel');
  if (!panel) return;
  var isHidden = panel.style.display === 'none';
  if (isHidden) {
    // Close sibling dropdowns so only one is open at a time.
    ['lobby-chat-panel'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    // Position the panel right below the header. The CSS rule uses
    // a hard-coded top:36px, but the header padding is clamp()-based
    // and produces 36–52 px depending on viewport. Measure the actual
    // bottom of the lobby header at open time so the panel always
    // starts flush against it, never overlapping or leaving a gap.
    var hdr = document.querySelector('#s-lobby .header');
    if (hdr) {
      var rect = hdr.getBoundingClientRect();
      panel.style.top = Math.round(rect.bottom) + 'px';
    }
    panel.style.display = '';
    renderPlayersList();
    // Focus the search input so the user can type right away.
    var inp = document.getElementById('players-search-in');
    if (inp) setTimeout(function(){ inp.focus(); }, 50);
  } else {
    panel.style.display = 'none';
  }
}

function renderPlayersList() {
  var body = document.getElementById('players-list-body');
  var countEl = document.getElementById('players-panel-count');
  var titleEl = document.getElementById('players-panel-title');
  if (!body) return;
  // Rebuild the title from scratch so it stays in sync with the
  // active language and the running count. Structure mirrors the
  // game-chat panel header (single inline span).
  if (titleEl) {
    var lbl = (typeof t === 'function') ? t('playersOnlineTitle') : 'Players online';
    titleEl.innerHTML = '👥 ' + lbl + ' — <span id="players-panel-count">0</span>';
    countEl = document.getElementById('players-panel-count'); // re-resolve after innerHTML
  }
  // Build the list of {pid, name} from _lobbyPids (defined inside
  // the IIFE; we read it via window-level references).
  var pids = window._readLobbyPids ? window._readLobbyPids() : [];
  var nameMap = window._readPlayers ? window._readPlayers() : {};
  var myId = window._readMyId ? window._readMyId() : 0;
  // Build display rows
  var rows = pids.map(function(pid) {
    return { pid: pid, name: nameMap[pid] || ('#' + pid), isMe: pid === myId };
  });
  // Filter by search input
  var q = (document.getElementById('players-search-in') || {}).value || '';
  q = q.toLowerCase().trim();
  if (q) rows = rows.filter(function(r) { return r.name.toLowerCase().includes(q); });
  // Sort: me first, then alphabetical
  rows.sort(function(a, b) {
    if (a.isMe && !b.isMe) return -1;
    if (b.isMe && !a.isMe) return 1;
    return a.name.localeCompare(b.name);
  });
  if (countEl) countEl.textContent = pids.length;
  if (rows.length === 0) {
    body.innerHTML = '<div class="pl-empty">' + (q ? '— ' : '—') + '</div>';
    return;
  }
  body.innerHTML = rows.map(function(r) {
    var esc = function(s) { return String(s).replace(/[<>&"]/g, function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); };
    // Avatar chip via the unified helper (same priority order as
    // every other compact list in the app: real PokerTH image >
    // placeholder logo > emoji > 🤖 > initial letter).
    var avChip = (typeof window._avatarChipHtml === 'function')
      ? window._avatarChipHtml(r.pid, r.name, 'pl-av')
      : '<span class="pl-av letter">' + esc((r.name[0] || '?').toUpperCase()) + '</span>';
    return '<div class="pl-row' + (r.isMe ? ' pl-me' : '') + '">' +
             avChip +
             '<span class="pl-name">' + esc(r.name) + '</span>' +
             '<span class="pl-id">#' + r.pid + '</span>' +
           '</div>';
  }).join('');
}