// ═══════════════════════════════════════════════════════════════════
// Chat : rendu des messages (lobby) + commandes locales /… — ESM #9f-6.
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations :
// t (i18n.mjs), esc (misc.mjs), MSG (net/messages.mjs) importés ;
// _isIgnored / addGameChat / _advStripEmoji / _chatTs sont des fonctions
// de portée script globale (donc window.*) — lues via window.
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { esc } from './misc.mjs';
import { MSG } from '../net/messages.mjs';

// ── Local chat commands (nothing is ever sent to the server) ────────────
// Shared by the lobby chat and the game chat. echo(name, text) renders the
// reply locally in the caller's chat panel. Returns true when handled.
// See docs/DIAGNOSTIC.md.
function _chatLocalCmd(text, echo) {
  var parts = text.split(/\s+/);
  var cmd = (parts[0] || '').toLowerCase();
  var arg = (parts[1] || '').trim();
  // /copy grabs the latest reply of any other local command.
  if (cmd !== '/copy') {
    var _echoRaw = echo;
    echo = function (n2, s2) { try { window._pthLastDiag = s2; } catch (e) {} _echoRaw(n2, s2); };
  }
  if (cmd === '/help') {
    echo('help',
      '/diag — client state snapshot · ' +
      '/update — check for a new version and refresh · ' +
      '/netdbg — transport, ping, reconnects, message stats · ' +
      '/carddbg — hole-card pipeline of the last hands · ' +
      '/msglog — last 30 protocol messages received · ' +
      '/fps — 5-second FPS meter · ' +
      '/lang <code> — switch language (e.g. /lang fr) · ' +
      '/sound on|off — toggle game sounds · ' +
      '/audiodbg — audio engine state · ' +
      '/table — current game info (blinds, players, stacks) · ' +
      '/storage — local settings keys and sizes · ' +
      '/logdump — verbose protocol capture (again to dump, off to stop) · ' +
      '/clear — clear the chat locally · ' +
      '/copy — copy the last reply to the clipboard · ' +
      '/zoom — toggle the table magnifier · ' +
      '/seatdbg — seat layout metrics (game chat only). ' +
      'All replies are shown only to you, nothing is sent.');
    return true;
  }
  if (cmd === '/diag') {
    try { echo('diag', JSON.stringify(window.pthDiag ? window.pthDiag() : {})); }
    catch (e) { echo('diag', 'error: ' + e); }
    return true;
  }
  if (cmd === '/update') {
    var cur = window.BUILD_VERSION || '?';
    echo('update', 'current build: ' + cur + ' — checking server…');
    fetch('/sw.js?d=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (body) {
        var m = body.match(/pokerth-v([0-9A-Za-z.\-]+)/);
        var srv = m ? m[1] : null;
        if (!srv) { echo('update', 'server version not readable'); return; }
        if (srv === cur) { echo('update', 'up to date (' + cur + ')'); return; }
        echo('update', 'version ' + srv + ' available — clearing cache and reloading…');
        var done = function () { setTimeout(function () { try { location.reload(); } catch (e) {} }, 500); };
        try {
          var p = [];
          if (window.caches && caches.keys) p.push(caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); }));
          if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) p.push(navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r2) { return r2.update(); })); }));
          Promise.all(p).then(done, done);
        } catch (e) { done(); }
      })
      .catch(function () { echo('update', 'check failed (offline?)'); });
    return true;
  }
  if (cmd === '/netdbg') {
    try {
      var ms0 = window._pthMsgStats || { total: 0, ring: [] };
      var now = Date.now();
      var last10 = 0;
      for (var i = 0; i < ms0.ring.length; i++) if (now - ms0.ring[i].ts < 10000) last10++;
      echo('netdbg', JSON.stringify({
        transport: S.ws ? ((window._directWS ? 'direct' : 'proxy') + ' ' + (S.ws.url && S.ws.url.indexOf('wss:') === 0 ? 'wss' : 'ws')) : null,
        wsState: S.ws ? (['CONNECTING','OPEN','CLOSING','CLOSED'][S.ws.readyState] || S.ws.readyState) : null,
        online: navigator.onLine,
        reconnects: S._reconnectAttempts,
        msgsTotal: ms0.total,
        msgsLast10s: last10
      }));
      var t0 = performance.now();
      fetch('/__ver?ping=' + Date.now(), { cache: 'no-store' })
        .then(function () { echo('netdbg', 'http rtt: ' + Math.round(performance.now() - t0) + ' ms'); })
        .catch(function () { echo('netdbg', 'http rtt: failed'); });
    } catch (e) { echo('netdbg', 'error: ' + e); }
    return true;
  }
  if (cmd === '/carddbg') {
    var h = window._pthCardDiagHist || [];
    echo('carddbg', h.length ? JSON.stringify(h.slice(-10)) : 'no hand played yet this session');
    return true;
  }
  if (cmd === '/msglog') {
    try {
      var ms1 = window._pthMsgStats || { total: 0, ring: [] };
      var names = {};
      try { var TT = MSG.T; for (var k in TT) names[TT[k]] = k; } catch (e) {}
      var lst = '';
      for (var j = 0; j < ms1.ring.length; j++) lst += (j ? ' ' : '') + (names[ms1.ring[j].t] || ms1.ring[j].t);
      echo('msglog', lst || 'no message received yet');
    } catch (e) { echo('msglog', 'error: ' + e); }
    return true;
  }
  if (cmd === '/fps') {
    try {
      if (window._pthFpsRun) { echo('fps', 'already running'); return true; }
      window._pthFpsRun = true;
      var ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;top:8px;left:8px;z-index:99999;background:rgba(0,0,0,.75);color:#50c878;font:bold 14px monospace;padding:4px 8px;border-radius:6px;pointer-events:none';
      ov.textContent = 'FPS…';
      document.body.appendChild(ov);
      var frames = 0, t0f = performance.now(), lastF = t0f, mn = Infinity;
      var tick = function (tNow) {
        frames++;
        var dt = tNow - lastF; lastF = tNow;
        if (dt > 0) { var inst = 1000 / dt; if (inst < mn) mn = inst; }
        var el = tNow - t0f;
        if (el > 0) ov.textContent = Math.round(frames / (el / 1000)) + ' fps';
        if (el < 5000) { requestAnimationFrame(tick); }
        else {
          echo('fps', 'avg ' + Math.round(frames / (el / 1000)) + ' fps · min ' + (mn === Infinity ? '?' : Math.round(mn)) + ' fps over 5 s');
          try { document.body.removeChild(ov); } catch (e) {}
          window._pthFpsRun = false;
        }
      };
      requestAnimationFrame(tick);
    } catch (e) { echo('fps', 'error: ' + e); window._pthFpsRun = false; }
    return true;
  }
  if (cmd === '/lang') {
    try {
      var codes = window.LANG ? Object.keys(window.LANG) : [];
      var found = null;
      for (var c = 0; c < codes.length; c++) if (codes[c].toLowerCase() === arg.toLowerCase()) { found = codes[c]; break; }
      if (!found) { echo('lang', 'usage: /lang <code> — available: ' + codes.join(' ')); return true; }
      if (window.setLang) { window.setLang(found); echo('lang', 'language switched to ' + found); }
    } catch (e) { echo('lang', 'error: ' + e); }
    return true;
  }
  if (cmd === '/sound') {
    try {
      var on = window.isSoundEnabled ? !!window.isSoundEnabled() : null;
      if (on === null) { echo('sound', 'sound module unavailable'); return true; }
      var want;
      if (arg === 'on') want = true;
      else if (arg === 'off') want = false;
      else if (!arg) want = !on;
      else { echo('sound', 'usage: /sound on|off'); return true; }
      if (want !== on && window.toggleSound) window.toggleSound();
      echo('sound', 'sounds ' + (want ? 'on' : 'off'));
    } catch (e) { echo('sound', 'error: ' + e); }
    return true;
  }
  if (cmd === '/audiodbg') {
    try {
      var ctx = window.getAudioCtx ? window.getAudioCtx() : null;
      echo('audiodbg', JSON.stringify({
        enabled: window.isSoundEnabled ? !!window.isSoundEnabled() : null,
        volume: window.getSoundVolume ? Math.round(window.getSoundVolume() * 100) : null,
        ctx: ctx ? ctx.state : 'unavailable',
        sampleRate: ctx ? ctx.sampleRate : null,
        musicVolume: (window.Music && window.Music.getVolume) ? Math.round((window.Music.getVolume() || 0) * 100) : null
      }));
    } catch (e) { echo('audiodbg', 'error: ' + e); }
    return true;
  }
  if (cmd === '/table') {
    try {
      if (!S.gId) { echo('table', 'not at a table'); return true; }
      var pl = [];
      for (var si = 0; si < S.seats.length; si++) {
        var pid2 = S.seats[si], sd2 = S.seatData[pid2] || {};
        pl.push((S.players[pid2] || ('#' + pid2)) + (pid2 === S.myId ? '*' : '') + ':$' + (sd2.money != null ? sd2.money : '?') +
                (sd2.folded ? ' folded' : '') + (sd2.gone ? ' out' : ''));
      }
      echo('table', JSON.stringify({
        gameId: S.gId, hand: S.handNum,
        phase: ['preflop','flop','turn','river'][S.gameState] || S.gameState,
        blinds: S.smallBlind + '/' + (S.smallBlind * 2),
        pot: S.pot, timeout: S.gameTimeout + 's', startCash: S.gameStartMoney,
        players: pl
      }));
    } catch (e) { echo('table', 'error: ' + e); }
    return true;
  }
  if (cmd === '/storage') {
    try {
      var keys = [], total = 0;
      for (var ki = 0; ki < localStorage.length; ki++) {
        var kk = localStorage.key(ki);
        var vlen = (localStorage.getItem(kk) || '').length;
        total += kk.length + vlen;
        if (kk.indexOf('pth_') === 0) keys.push(kk + '(' + vlen + ')');
      }
      keys.sort();
      echo('storage', keys.length + ' pth_* keys, ~' + Math.round(total / 1024) + ' KB total used: ' + keys.join(' '));
    } catch (e) { echo('storage', 'error: ' + e); }
    return true;
  }
  if (cmd === '/logdump') {
    try {
      if (arg === 'off') {
        window._pthMsgVerbose = false; window._pthMsgVerboseRing = [];
        echo('logdump', 'capture stopped and cleared');
        return true;
      }
      if (!window._pthMsgVerbose) {
        window._pthMsgVerbose = true; window._pthMsgVerboseRing = [];
        echo('logdump', 'verbose capture ON — play a bit, then type /logdump again to dump (or /logdump off to stop)');
        return true;
      }
      var vr = window._pthMsgVerboseRing || [];
      var names2 = {};
      try { var TT2 = MSG.T; for (var k2 in TT2) names2[TT2[k2]] = k2; } catch (e) {}
      var lines = [];
      for (var vi = 0; vi < vr.length; vi++) {
        var v = vr[vi];
        lines.push((names2[v.t] || v.t) + '[' + v.len + 'B f:' + v.f + ']');
      }
      echo('logdump', lines.length ? lines.join(' · ') : 'nothing captured yet');
    } catch (e) { echo('logdump', 'error: ' + e); }
    return true;
  }
  if (cmd === '/clear') {
    try {
      var c1 = document.getElementById('g-chat-msgs'); if (c1) c1.innerHTML = '';
      var c2 = document.getElementById('chat'); if (c2) c2.innerHTML = '';
      echo('clear', 'chat cleared (locally)');
    } catch (e) { echo('clear', 'error: ' + e); }
    return true;
  }
  if (cmd === '/copy') {
    var txt = window._pthLastDiag || '';
    if (!txt) { echo('copy', 'nothing to copy yet — run a diagnostic command first'); return true; }
    var okMsg = function () { echo('copy', 'copied (' + txt.length + ' chars)'); };
    var koMsg = function () { echo('copy', 'clipboard unavailable — long-press the message instead'); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(okMsg, function () {
          try {
            var ta = document.createElement('textarea');
            ta.value = txt; ta.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(ta); ta.select();
            var ok2 = document.execCommand('copy');
            document.body.removeChild(ta);
            ok2 ? okMsg() : koMsg();
          } catch (e) { koMsg(); }
        });
      } else {
        var ta2 = document.createElement('textarea');
        ta2.value = txt; ta2.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta2); ta2.select();
        var ok3 = document.execCommand('copy');
        document.body.removeChild(ta2);
        ok3 ? okMsg() : koMsg();
      }
    } catch (e) { koMsg(); }
    return true;
  }
  if (cmd === '/zoom') {
    try {
      if (window.toggleLoupe) { window.toggleLoupe(); echo('zoom', 'table zoom toggled'); }
      else echo('zoom', 'zoom unavailable here');
    } catch (e) { echo('zoom', 'error: ' + e); }
    return true;
  }
  return false;
}

// ── CHAT ──
function addChat(sender, text, cls='', spec) {
  // Messages système retirés du chat (demande narmod) — SAUF ceux marqués
  // spec.force (ex. raison d'éjection de table) : on veut absolument que le
  // joueur sache pourquoi il a été retiré, et le chat est le bon endroit.
  if (cls === 'sys' && !(spec && spec.force)) return;
  if (sender && cls !== 'mine' && window._isIgnored(sender)) return; // joueur ignoré : aucun rendu
  if (typeof window.addGameChat === 'function') window.addGameChat(sender, text, cls, spec);
  // Flash lobby chat button on new message
  var lcp = document.getElementById('lobby-chat-panel');
  var lcb = document.getElementById('lobby-chat-btn');
  if (lcb && (!lcp || lcp.style.display === 'none') && cls !== 'mine') {
    lcb.style.color = 'var(--gold)';
    clearTimeout(window._lobbyChatFlash);
    window._lobbyChatFlash = setTimeout(function(){ lcb.style.color=''; }, 3000);
  }
  var _noEmo = false;
  try { _noEmo = (localStorage.getItem('pth_chat_noemoji') === '1'); } catch (e) {}
  if (sender && _noEmo) { try { text = window._advStripEmoji(text); } catch (e) {} }
  const el = document.getElementById('chat');
  const d  = document.createElement('div');
  d.className = 'msg ' + cls;
  // Surlignage de mention (parité QML LobbyHandler::onLobbyChatMessage) : quand
  // le corps d'un message d'autrui contient mon pseudo (insensible à la casse),
  // tout le corps passe en or gras via la classe « mention ». Comportement natif
  // du client officiel — pas d'interrupteur (le QML n'en propose pas non plus).
  try {
    const _mn = (S.myName || '').trim();
    if (_mn && sender && cls !== 'mine'
        && String(text).toLowerCase().indexOf(_mn.toLowerCase()) !== -1)
      d.className += ' mention';
  } catch (_em) {}
  const emT = function (s) { var h = esc(s); if (!_noEmo && typeof window.applyChatEmoteShortcuts === 'function') { try { h = window.applyChatEmoteShortcuts(h); } catch (_e) {} } if (typeof window._linkifyChatHtml === 'function') { try { h = window._linkifyChatHtml(h); } catch (_e2) {} } return h; };
  if (sender) {
    // Bouton de traduction aussi dans le chat LOBBY (meme mecanique que
    // le chat de partie ; visible seulement si body.chat-tr-on).
    const _tr = (cls !== 'mine' ? '<button class="chat-tr-btn" title="Traduire" onclick="window._chatTranslate(this)" aria-label="Translate">\u{1F310}</button>' : '');
    // Action « /me … » (parité QML LobbyHandler isAction) : « *Nom fait qqch* »
    // en italique, sans « Nom: ». Le « /me » est envoyé tel quel au serveur puis
    // reformaté à l'affichage par chaque client.
    if (String(text).slice(0, 4) === '/me ') {
      d.className += ' action';
      d.innerHTML = `<span class="msg-time">${window._chatTs()}</span> <span class="txt">*${esc(sender)} ${emT(text.slice(4))}*</span>` + _tr;
    } else {
      d.innerHTML = `<span class="msg-time">${window._chatTs()}</span> <span class="who">${esc(sender)}</span>: <span class="txt">${emT(text)}</span>` + _tr;
    }
    try { d.dataset.orig = text; } catch (_e) {}
  } else {
    // Sans expéditeur = message serveur : broadcast (cls 'bc', ex. annonce
    // « Signup for Monthly Cup … https://… ») → emT (émotes + liens cliquables,
    // URLs protégées par applyChatEmoteShortcuts). Les messages 'sys' restent en
    // esc : ils sont retraduits en textContent brut par _retranslateSysChat.
    d.innerHTML = `<span class="txt">${cls === 'sys' ? esc(text) : emT(text)}</span>`;
  }
  if (spec && !sender) { try { d.dataset.sys = JSON.stringify(spec); } catch(e){} }
  // Glossaire d'abréviations (gg, nh, utg…) : entoure les tokens connus d'un
  // <span class="chat-abbr" title="sens"> pour une bulle au survol. Opère sur
  // les nœuds texte de .txt (jamais dans les emotes/liens). Pont window.*
  // (module chat/abbrev.mjs) ; no-op tant qu'il n'est pas chargé.
  try {
    if (typeof window._chatMarkAbbrev === 'function') {
      var _txtEl = d.querySelector('.txt');
      if (_txtEl) window._chatMarkAbbrev(_txtEl);
    }
  } catch (_ea) {}
  el.appendChild(d);
  el.scrollTop = el.scrollHeight;
}

export { _chatLocalCmd, addChat };

window._chatLocalCmd = _chatLocalCmd;
window.addChat = addChat;
