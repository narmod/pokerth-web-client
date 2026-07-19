// ═══════════════════════════════════════════════════════════════════
// Statistiques : session, lifetime (localStorage par pseudo), family
// leaderboard (/stats du proxy), panneau + board — chantier ESM #9f-4.
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations :
// t (i18n.mjs), _groupThousands (fmt.mjs), esc (misc.mjs) importés ;
// _renderProfileStats via window (pont ajouté côté monolithe).
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { _groupThousands } from '../ui/fmt.mjs';
import { esc } from '../ui/misc.mjs';

// ── Lifetime stats + family leaderboard ───────────────────────────────
// Persisted per nickname in localStorage; pushed to the proxy (/stats) so
// every device sees the same board. Recorded ONLY on private-server / LAN
// connections (set true at connect) — pokerth.net modes are never tracked.
// Training (vs bots) keeps its OWN persistent lifetime store, isolated from the
// real private-server / LAN stats — they must never mix nor leak to the board.
function _lifeKey()       { return S._statsOffline ? 'pth_life_offline' : 'pth_life'; }
function _lifeAll()       { try { return JSON.parse(localStorage.getItem(_lifeKey()) || '{}') || {}; } catch(e) { return {}; } }
function _lifeSaveAll(o)  { try { localStorage.setItem(_lifeKey(), JSON.stringify(o)); } catch(e) {} }
function _lifeBlank()     { return { handsPlayed:0, handsWon:0, net:0, bigWin:0, bigLoss:0, gamesPlayed:0, gamesWon:0, bestStreak:0, streak:0 }; }
function _lifeGet(name)   { var a=_lifeAll(); return a[name] || _lifeBlank(); }
function _pushStats() {
  if (!S._boardEligible || !S.myName) return;   // training never touches the family board
  if (S._lifePushTimer) clearTimeout(S._lifePushTimer);
  S._lifePushTimer = setTimeout(function() {
    var s = _lifeGet(S.myName);
    var av = ''; try { av = localStorage.getItem('pth_avatar') || ''; } catch(e) {}
    if (av === '__pth__' || av === '__img__') av = ''; // ne pas envoyer le sentinelle
    fetch('/stats', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name:S.myName, avatar:av,
        handsPlayed:s.handsPlayed, handsWon:s.handsWon, net:s.net, bigWin:s.bigWin,
        bigLoss:s.bigLoss, gamesPlayed:s.gamesPlayed, gamesWon:s.gamesWon, bestStreak:s.bestStreak })
    }).catch(function(){});
  }, 1500);
}
function _lifeRecordHand(won, delta) {
  if (!S._statsEligible || !S.myName) return;
  var a = _lifeAll(); var s = a[S.myName] || _lifeBlank();
  s.handsPlayed++;
  if (won) { s.handsWon++; s.streak = (s.streak||0)+1; if (s.streak > s.bestStreak) s.bestStreak = s.streak; }
  else { s.streak = 0; }
  s.net += delta;
  if (delta > s.bigWin)  s.bigWin  = delta;
  if (delta < s.bigLoss) s.bigLoss = delta;
  a[S.myName] = s; _lifeSaveAll(a); _pushStats();
}
function _lifeRecordGame(won) {
  if (!S._statsEligible || !S.myName) return;
  var a = _lifeAll(); var s = a[S.myName] || _lifeBlank();
  s.gamesPlayed++; if (won) s.gamesWon++;
  a[S.myName] = s; _lifeSaveAll(a); _pushStats();
}
function _lifeReset() {
  if (!S.myName) return;
  var a = _lifeAll(); delete a[S.myName]; _lifeSaveAll(a);
  if (S._boardEligible) {
    try { fetch('/stats', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name:S.myName, _delete:true }) }).catch(function(){}); } catch(e) {}
  }
}
// Merge two lifetime records keeping the better of each (mirrors the proxy's
// monotonic merge): counters never regress, net follows the more complete
// record. Preserves the local current `streak` (not stored server-side).
function _lifeMerge(loc, srv) {
  var hp = Math.max(loc.handsPlayed||0, srv.handsPlayed||0);
  var gp = Math.max(loc.gamesPlayed||0, srv.gamesPlayed||0);
  var srvFresher = (srv.handsPlayed||0) > (loc.handsPlayed||0);
  return {
    handsPlayed: hp, gamesPlayed: gp,
    handsWon: Math.min(Math.max(loc.handsWon||0, srv.handsWon||0), hp),
    gamesWon: Math.min(Math.max(loc.gamesWon||0, srv.gamesWon||0), gp),
    bestStreak: Math.max(loc.bestStreak||0, srv.bestStreak||0),
    bigWin: Math.max(loc.bigWin||0, srv.bigWin||0),
    bigLoss: Math.min(loc.bigLoss||0, srv.bigLoss||0),
    net: srvFresher ? (srv.net||0) : (loc.net||0),
    streak: loc.streak||0
  };
}
// Reseed this device's lifetime totals from the shared board at connect, so a
// fresh browser/device doesn't keep pushing a near-blank snapshot. The proxy
// would reject the regression anyway, but reseeding also fixes the TOTAL tab
// display on the new device. Runs once per connect when eligible.
function _lifeSeedFromServer() {
  if (!S._boardEligible || !S.myName) return;
  fetch('/stats', { cache:'no-store' })
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(data){
      if (!data || !data[S.myName]) return;
      var a = _lifeAll();
      a[S.myName] = _lifeMerge(a[S.myName] || _lifeBlank(), data[S.myName]);
      _lifeSaveAll(a);
      if (S._statsOpen) renderStats();
    }).catch(function(){});
}

// ── Panneau statistiques ──
function toggleStats() {
  S._statsOpen = !S._statsOpen;
  var el = document.getElementById('stats-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'stats-overlay';
    document.body.appendChild(el);
  }
  el.style.display = S._statsOpen ? '' : 'none';
  if (S._statsOpen) renderStats();
}

function _statsSetTab(tab) { S._statsTab = tab; renderStats(); }
window._statsSetTab = _statsSetTab;

function _statsRow(label, val, cls) {
  return '<div class="stat-row"><span class="stat-label">'+label+'</span><span class="stat-val '+(cls||'')+'">'+val+'</span></div>';
}

function renderStats() {
  var el = document.getElementById('stats-overlay');
  if (!el) return;
  // Onglets TOTAL (à vie) et CLASSEMENT (proxy) seulement dans les deux modes
  // réseau (LAN + serveur privé) : sur pokerth.net direct il n'y a ni stats
  // persistantes ni proxy de classement → seul SESSION a du sens.
  var eligible = S._statsEligible;       // SESSION + TOTAL available
  var board    = S._boardEligible;       // CLASSEMENT (proxy) available — private/LAN only
  if (!eligible && S._statsTab !== 'session') S._statsTab = 'session';
  if (!board && S._statsTab === 'board') S._statsTab = 'session';
  var titles = { session: t('statSession'), life: t('statTabLife'), board: t('statTabBoard') };
  function tb(id, label) {
    return '<button class="stats-tab'+(S._statsTab===id?' active':'')+'" onclick="window._statsSetTab(\''+id+'\')">'+label+'</button>';
  }
  // pokerth.net direct (not eligible) → no tab bar (session only). Training shows
  // SESSION + TOTAL but no CLASSEMENT. Private/LAN shows all three.
  var tabs = eligible
    ? '<div class="stats-tabs">'+tb('session',t('statTabSession'))+tb('life',t('statTabLife'))
      + (board ? tb('board',t('statTabBoard')) : '') + '</div>'
    : '';
  var body;
  if (S._statsTab === 'life')       body = _statsBodyLife();
  else if (S._statsTab === 'board') body = '<div id="stats-board-body" class="stats-body"><div class="stat-empty">…</div></div>';
  else                            body = _statsBodySession();
  el.innerHTML = '<div class="stats-header"><span>📊 '+titles[S._statsTab]+'</span>'
    + '<button onclick="toggleStats()" style="background:none;border:none;color:var(--text);cursor:pointer;font-size:0.9rem">✕</button>'
    + '</div>' + tabs + body;
  if (S._statsTab === 'board') renderBoard();
}

function _statsBodySession() {
  var s = S._stats;
  var gain = s.totalGain;
  var gainCls = gain > 0 ? 'pos' : gain < 0 ? 'neg' : '';
  var wr = s.handsPlayed > 0 ? Math.round(s.handsWon/s.handsPlayed*100) : 0;
  var hist = s.history.slice().reverse().slice(0,5);
  var histHtml = hist.length ? hist.map(function(h2) {
    var dcls = h2.delta > 0 ? 'pos' : h2.delta < 0 ? 'neg' : '';
    return '<div class="hand-hist-item">'
      + '<div style="display:flex;justify-content:space-between">'
      + '<span style="color:var(--gold-dim);font-size:0.55rem">Main #'+h2.num+'</span>'
      + '<span class="hand-hist-result '+dcls+'">'+(h2.delta>0?'+':'')+'$'+_groupThousands(h2.delta)+'</span>'
      + '</div>'
      + '<div class="hand-hist-cards">'
      + (h2.cards ? h2.cards.map(function(c){ return '<span style="background:#fff;color:'+(c.red?'#c0392b':'#111')+';border-radius:2px;padding:1px 3px;font-size:0.6rem;font-weight:700">'+c.r+c.s+'</span>'; }).join('') : '')
      + '</div>'
      + '</div>';
  }).join('') : '<div style="color:var(--text);font-size:0.62rem">' + t('noHandsPlayed') + '</div>';
  return '<div class="stats-body">'
    + _statsRow(t('statHandsPlayed'), s.handsPlayed)
    + _statsRow(t('statWins'), s.handsWon, 'pos')
    + _statsRow(t('statWinRate'), wr+'%')
    + '<hr class="stat-divider">'
    + _statsRow(t('statNet'), (gain>0?'+':'')+'$' + _groupThousands(gain), gainCls)
    + _statsRow(t('statBestWin'), '+'+'$' + _groupThousands(s.bigWin), 'pos')
    + _statsRow(t('statWorstLoss'), '$' + _groupThousands(s.bigLoss), 'neg')
    + '<hr class="stat-divider">'
    + '<div style="font-size:0.58rem;color:var(--gold-dim);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">'+t('statRecentHands')+'</div>'
    + histHtml
    + '</div>';
}

function _statsBodyLife() {
  var s = _lifeGet(S.myName);
  var gain = s.net;
  var gainCls = gain > 0 ? 'pos' : gain < 0 ? 'neg' : '';
  var wr = s.handsPlayed > 0 ? Math.round(s.handsWon/s.handsPlayed*100) : 0;
  var note = S._statsOffline
    ? '<div class="stat-note">'+t('statLifeTraining')+'</div>'
    : (S._statsEligible ? '' : '<div class="stat-note">'+t('statLifeOnlyPrivate')+'</div>');
  return '<div class="stats-body">'
    + note
    + _statsRow(t('statGamesPlayed'), s.gamesPlayed)
    + _statsRow(t('statGamesWon'), s.gamesWon, 'pos')
    + _statsRow(t('statStreak'), s.bestStreak, 'pos')
    + '<hr class="stat-divider">'
    + _statsRow(t('statHandsPlayed'), s.handsPlayed)
    + _statsRow(t('statWins'), s.handsWon, 'pos')
    + _statsRow(t('statWinRate'), wr+'%')
    + '<hr class="stat-divider">'
    + _statsRow(t('statNet'), (gain>0?'+':'')+'$' + _groupThousands(gain), gainCls)
    + _statsRow(t('statBestWin'), '+'+'$' + _groupThousands(s.bigWin), 'pos')
    + _statsRow(t('statWorstLoss'), '$' + _groupThousands(s.bigLoss), 'neg')
    + '<hr class="stat-divider">'
    + '<button class="stats-reset" onclick="window._statsReset()">'+t('statReset')+'</button>'
    + '</div>';
}
function _statsReset() {
  if (!confirm(t('statResetConfirm'))) return;
  _lifeReset();
  renderStats();
  // Rafraîchir aussi le popup de profil s'il est ouvert (il partage le
  // même onglet TOTAL avec son bouton reset).
  try {
    var pim = document.getElementById('player-info-modal');
    if (pim && pim.style.display !== 'none') if (typeof window._renderProfileStats === 'function') window._renderProfileStats();
  } catch (e) {}
}
window._statsReset = _statsReset;

// Ranking criterion (persisted). net | per100 | winrate | games | streak.
try { S._boardSort = localStorage.getItem('pth_board_sort') || 'net'; } catch(e) {}
function _boardPer100(p) { return (p.handsPlayed>0) ? (p.net||0)*100/p.handsPlayed : 0; }
function _boardWinRate(p){ return (p.handsPlayed>0) ? (p.handsWon||0)/p.handsPlayed : 0; }
function _boardCmp(key) {
  if (key === 'per100')  return function(a,b){ return _boardPer100(b)-_boardPer100(a) || (b.net||0)-(a.net||0); };
  if (key === 'winrate') return function(a,b){ return _boardWinRate(b)-_boardWinRate(a) || (b.handsPlayed||0)-(a.handsPlayed||0); };
  if (key === 'games')   return function(a,b){ return (b.gamesWon||0)-(a.gamesWon||0) || (b.net||0)-(a.net||0); };
  if (key === 'streak')  return function(a,b){ return (b.bestStreak||0)-(a.bestStreak||0) || (b.net||0)-(a.net||0); };
  return function(a,b){ return (b.net||0)-(a.net||0); };
}
function _boardSetSort(k) {
  S._boardSort = k;
  try { localStorage.setItem('pth_board_sort', k); } catch(e) {}
  if (document.getElementById('stats-board-body')) renderBoard('stats-board-body');
  if (document.getElementById('pim-board-body'))   renderBoard('pim-board-body');
}
window._boardSetSort = _boardSetSort;

function renderBoard(targetId) {
  var boxId = targetId || 'stats-board-body';
  fetch('/stats', { cache:'no-store' })
    .then(function(r){ return r.ok ? r.json() : {}; })
    .then(function(data){
      var box = document.getElementById(boxId);
      if (!box) return;
      var arr = Object.keys(data || {}).map(function(name){ var v = data[name] || {}; v.name = name; return v; });
      arr.sort(_boardCmp(S._boardSort));
      // Sort selector (↕). Labels reuse existing stat keys; only net/100 is new.
      var opt = function(id, lbl){ return '<option value="'+id+'"'+(S._boardSort===id?' selected':'')+'>'+esc(lbl)+'</option>'; };
      var sortUI = '<div class="board-sort"><span>↕</span><select onchange="window._boardSetSort(this.value)">'
        + opt('net', t('statNet'))
        + opt('per100', t('boardPer100'))
        + opt('winrate', t('statWinRate'))
        + opt('games', t('statGamesWon'))
        + opt('streak', t('statStreak'))
        + '</select></div>';
      if (!arr.length) { box.innerHTML = sortUI + '<div class="stat-empty">'+t('boardEmpty')+'</div>'; return; }
      // My rank under the current criterion — shown even if far down the list.
      var myIdx = -1;
      for (var k=0;k<arr.length;k++){ if (arr[k].name===S.myName){ myIdx=k; break; } }
      var rankLine = (myIdx>=0)
        ? '<div class="board-myrank">'+t('boardYourRank', { n: myIdx+1, m: arr.length })+'</div>' : '';
      var rows = arr.map(function(p, i){
        var net = p.net||0, ncls = net>0?'pos':net<0?'neg':'';
        var mine = (p.name === S.myName) ? ' me' : '';
        var av = p.avatar ? p.avatar : (p.name ? p.name.charAt(0).toUpperCase() : '?');
        var medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':('#'+(i+1));
        var hp = p.handsPlayed||0;
        var p100 = hp>0 ? Math.round(net*100/hp) : 0;
        var wrp  = hp>0 ? Math.round((p.handsWon||0)/hp*100) : 0;
        // Secondary line adapts to the active criterion so the ranked value is visible.
        var sub;
        if (S._boardSort==='per100')       sub = (p100>0?'+':'')+'$'+_groupThousands(p100)+'/100 · '+hp;
        else if (S._boardSort==='winrate') sub = wrp+'% · '+hp;
        else if (S._boardSort==='streak')  sub = '🔥 '+(p.bestStreak||0);
        else                             sub = '🏆'+(p.gamesWon||0)+' · '+(p.handsWon||0);
        return '<div class="board-row'+mine+'">'
          + '<span class="board-rank">'+medal+'</span>'
          + '<span class="board-av">'+esc(av)+'</span>'
          + '<span class="board-name">'+esc(p.name)+'</span>'
          + '<span class="board-net '+ncls+'">'+(net>0?'+':'')+'$'+_groupThousands(net)+'</span>'
          + '<span class="board-sub">'+sub+'</span>'
          + '</div>';
      }).join('');
      box.innerHTML = sortUI + rankLine + '<div class="board-list">'+rows+'</div>';
    })
    .catch(function(){
      var box = document.getElementById(boxId);
      if (box) box.innerHTML = '<div class="stat-empty">'+t('boardEmpty')+'</div>';
    });
}

// Initialiser les stats au début d'une partie
function initStats(startMoney) {
  if (S._statsInited) return;
  S._stats.startMoney = startMoney;
  S._stats.peakMoney  = startMoney;
  S._statsInited = true;
}

// Enregistrer le résultat d'une main
function recordHand(won, delta, myCardsPair) {
  S._stats.handsPlayed++;
  if (won) S._stats.handsWon++;
  S._stats.totalGain += delta;
  if (delta > S._stats.bigWin) S._stats.bigWin = delta;
  if (delta < S._stats.bigLoss) S._stats.bigLoss = delta;
  S._stats.history.push({ num: S.handNum, delta: delta, won: won,
    cards: myCardsPair });
  if (S._stats.history.length > 20) S._stats.history.shift();
  _lifeRecordHand(won, delta);
  if (S._statsOpen) renderStats();
}

export { _lifeKey, _lifeAll, _lifeSaveAll, _lifeBlank, _lifeGet, _pushStats,
         _lifeRecordHand, _lifeRecordGame, _lifeReset, _lifeMerge,
         _lifeSeedFromServer, toggleStats, _statsSetTab, _statsRow, renderStats,
         _statsBodySession, _statsBodyLife, _statsReset, _boardPer100,
         _boardWinRate, _boardCmp, _boardSetSort, renderBoard, initStats,
         recordHand };

for (const [k, v] of Object.entries({ _lifeKey, _lifeAll, _lifeSaveAll, _lifeBlank,
  _lifeGet, _pushStats, _lifeRecordHand, _lifeRecordGame, _lifeReset, _lifeMerge,
  _lifeSeedFromServer, toggleStats, _statsSetTab, _statsRow, renderStats,
  _statsBodySession, _statsBodyLife, _statsReset, _boardPer100, _boardWinRate,
  _boardCmp, _boardSetSort, renderBoard, initStats, recordHand })) window[k] = v;
