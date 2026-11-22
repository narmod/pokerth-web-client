// ── ui/seat-menu.mjs — menu contextuel d'un siège (clic droit / appui long) ──
//
// Parité GamePlayerBox.qml : chez Kai, un clic droit sur la boîte adverse
// (bureau) ou un appui long (tactile, depuis upstream b77ad47) ouvre un menu
// avec « Ignore/Unignore Player », « Show player stats », « Report avatar » et,
// depuis ce même commit, « Note about player … ».
//
// Chez nous ces actions vivaient TOUTES dans la carte joueur, ouverte d'un
// simple tap sur le siège — rien n'était donc inaccessible. Ce menu ne remplace
// pas la carte, il l'ADDITIONNE : le tap continue de l'ouvrir en entier, le
// clic droit donne le geste du client de bureau et mène directement à l'action
// voulue. « Ma note » ouvre la carte déjà positionnée sur le bloc note, curseur
// dans le champ : une étape de moins que le dialogue séparé du QML.
//
// Aucune chaîne nouvelle : le menu réutilise les clés déjà traduites dans les
// 47 langues par la carte (nvTitle, ppOpen, piIgnore/piUnignore,
// piReportAvatar, piKickban).
//
// Même menu sur un pseudo du chat (ui/chat-nick.mjs, web.153) : opts.chat
// ajoute en tête « Carte joueur », « Message privé » et « Citer », et ignore
// par NOM (sans rouvrir la carte). Un joueur parti du serveur (pid 0) n'a plus
// que « Citer » et « Ignorer ».
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { esc } from './misc.mjs';
import { openPlayerInfoPopup } from './player-popup.mjs';

const ID = 'seat-ctx-menu';
// Repli si la clé manque : t() rend la clé elle-même quand elle n'existe pas.
function tt(k, fb) { try { const v = t(k); return (v && v !== k) ? v : fb; } catch (e) { return fb; } }
let _el = null;
let _open = false;

function host() {
  if (_el && _el.isConnected) return _el;
  _el = document.createElement('div');
  _el.id = ID;
  _el.setAttribute('role', 'menu');
  document.body.appendChild(_el);
  return _el;
}

export function closeSeatMenu() {
  if (!_open) return;
  _open = false;
  if (_el) { _el.classList.remove('open'); _el.innerHTML = ''; }
}

// Ouvre la carte joueur puis l'amène sur le bloc note, curseur dans le champ.
// Le rendu de la carte est synchrone mais son passage en mode fenêtre ne l'est
// pas toujours (géométrie restaurée, zoom) : on attend une frame avant de
// chercher le bloc, et on ne fait rien s'il n'est pas là (joueur sans bloc
// note — moi-même, par exemple).
function openNoteFor(pid) {
  openPlayerInfoPopup(pid);
  requestAnimationFrame(() => {
    try {
      const blk = document.querySelector('#player-info-modal .nv-block');
      if (!blk) return;
      blk.scrollIntoView({ block: 'nearest' });
      const ta = blk.querySelector('.nv-text');
      // focus() sans preventScroll ramènerait la carte en haut sur certains
      // navigateurs, annulant le scrollIntoView qu'on vient de faire.
      if (ta) ta.focus({ preventScroll: true });
    } catch (e) {}
  });
}

// Actions offertes pour ce siège, dans l'ordre du menu QML mais avec la note en
// tête : c'est elle qu'on vient chercher par ce geste. Chaque entrée reprend
// EXACTEMENT la garde de son bouton dans la carte — un menu qui proposerait
// une action que la carte refuse serait un mensonge.
function itemsFor(pid, opts) {
  const out = [];
  const chat = !!(opts && opts.chat);
  const isBot = (() => { try { return !!(pid && window.isBot(pid)); } catch (e) { return false; } })();
  const name = (opts && opts.name) || (() => { try { return window.getPlayerName(pid) || ''; } catch (e) { return ''; } })();
  const isMe = pid ? pid === S.myId : (!!name && name === S.myName);

  if (chat) {
    if (pid) out.push({ k: 'card', ico: '🪪', label: tt('chatNickCard', 'Player card'),
                        run: () => { try { openPlayerInfoPopup(pid); } catch (e) {} } });
    const guest = (() => { try { return !!(window._amGuestMode && window._amGuestMode()); } catch (e) { return false; } })();
    if (pid && !isMe && !isBot && !guest && name && typeof window.openPmModal === 'function') {
      out.push({ k: 'pm', ico: '✉️', label: tt('pmBtn', 'Private message'),
                 run: () => { try { window.openPmModal(name); } catch (e) {} } });
    }
    if (!isMe && name && typeof opts.quote === 'function') {
      out.push({ k: 'quote', ico: '💬', label: tt('chatNickQuote', 'Quote'), run: () => opts.quote(name) });
    }
    if (!isMe && !isBot && name && typeof opts.ignore === 'function') {
      const ign = (() => { try { return !!window._isIgnored(name); } catch (e) { return false; } })();
      const it = { k: 'ignore', ico: ign ? '🔔' : '🔕',
                   label: ign ? tt('piUnignore', 'Unignore') : tt('piIgnore', 'Ignore'),
                   run: () => opts.ignore(name) };
      if (!pid) { out.push(it); return out; }      // gone from the server: nothing else applies
      opts._ignoreItem = it;
    }
    if (!pid) return out;
    if (out.length) out.push({ sep: true });
  }

  // Note : sur un adversaire seulement (se noter soi-même n'a pas de sens).
  // Les bots y ont droit, comme dans la carte — en entraînement c'est
  // justement là qu'on apprend à lire un adversaire.
  if (!isMe && typeof window._nvBlockHtml === 'function') {
    out.push({ k: 'note', ico: '📝', label: tt('nvTitle', 'My note'), run: () => openNoteFor(pid) });
  }
  // Profil / statistiques : même condition que le bloc coupes de la carte
  // (joueur enregistré, partie en réseau).
  const rights = S._playerRights[pid] || 0;
  const modeEl = document.getElementById('login-mode');
  const onNet = !!(modeEl && (modeEl.value === 'guest' || modeEl.value === 'auth'));
  if (!isBot && onNet && (rights === 2 || rights === 3) && name) {
    out.push({ k: 'profile', ico: '📊', label: tt('ppOpen', 'Player profile'),
               run: () => { try { window._pimOpenStats(pid); } catch (e) {} } });
  }
  if (chat && opts._ignoreItem) {
    out.push(opts._ignoreItem);
  } else if (!isMe && !isBot && name) {
    const ign = (() => { try { return !!window._isIgnored(name); } catch (e) { return false; } })();
    out.push({ k: 'ignore', ico: ign ? '🔔' : '🔕',
               label: ign ? tt('piUnignore', 'Unignore') : tt('piIgnore', 'Ignore'),
               run: () => { try { window._toggleIgnore(pid); } catch (e) {} } });
  }
  // Signalement d'avatar : seulement si le joueur en a réellement un, et
  // jamais pour un invite (parite QML canReportAvatar, upstream 04f5839).
  const av = S._pthAvatarHashes[pid];
  const meGuest = (() => { try { return !!window._amMyPlayerGuest(); } catch (e) { return false; } })();
  if (!isMe && !isBot && !meGuest && av && av.hashHex) {
    out.push({ k: 'report', ico: '🚩', label: tt('piReportAvatar', 'Report avatar'),
               run: () => { try { window._reportAvatar(pid); } catch (e) {} } });
  }
  // Kickban : administrateurs pokerth.net uniquement.
  if (pid && !isMe && !isBot && (S._playerRights[S.myId] || 0) === 3) {
    out.push({ sep: true });
    out.push({ k: 'kickban', ico: '🔨', label: tt('piKickban', 'Total kickban'), danger: true,
               run: () => { try { window._adminBanPlayer(pid); } catch (e) {} } });
  }
  // No dangling separator when nothing follows the chat entries.
  if (out.length && out[out.length - 1].sep) out.pop();
  return out;
}

export function openSeatMenu(pid, x, y, opts) {
  const items = itemsFor(pid, opts);
  // Aucune action possible : pas de menu vide qui s'ouvre pour rien (le QML
  // teste pareil avec hasContextActions).
  if (!items.length) return false;
  const el = host();
  let name = (opts && opts.name) || '';
  if (!name) { try { name = window.getPlayerName(pid) || ''; } catch (e) {} }
  let html = name ? '<div class="ctx-hd">' + esc(name) + '</div>' : '';
  items.forEach((it, i) => {
    if (it.sep) { html += '<div class="menu-sep"></div>'; return; }
    html += '<button type="button" class="btn-sm' + (it.danger ? ' ctx-danger' : '') + '"'
          + ' role="menuitem" data-ctx-i="' + i + '"' + (it.k ? ' data-ctx-k="' + it.k + '"' : '') + '>'   // data-ctx-k: Ace's Help « ? »
          + '<span style="margin-right:7px" aria-hidden="true">' + it.ico + '</span>'
          + esc(it.label) + '</button>';
  });
  el.innerHTML = html;
  el.querySelectorAll('[data-ctx-i]').forEach((b) => {
    b.addEventListener('click', () => {
      const it = items[parseInt(b.getAttribute('data-ctx-i'), 10)];
      closeSeatMenu();
      if (it && it.run) it.run();
    });
  });
  // Placement : au pointeur, puis rabattu dans la fenêtre. Mesure APRÈS
  // affichage — un menu display:none n'a pas de dimensions.
  el.style.left = '0px';
  el.style.top = '0px';
  el.classList.add('open');
  _open = true;
  const m = 8;
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth || 0, vh = window.innerHeight || 0;
  el.style.left = Math.max(m, Math.min(x, vw - r.width - m)) + 'px';
  el.style.top  = Math.max(m, Math.min(y, vh - r.height - m)) + 'px';
  try { const f = el.querySelector('[data-ctx-i]'); if (f) f.focus({ preventScroll: true }); } catch (e) {}
  return true;
}

export function isSeatMenuOpen() { return _open; }

// Fermetures : tout ce qui indique que l'attention est passée ailleurs. Le
// pointerdown est écouté en capture pour fermer avant qu'un clic n'atteigne un
// siège (sinon le menu se refermerait ET la carte s'ouvrirait).
let _inited = false;
export function initSeatMenu() {
  if (_inited) return;     // seats AND chat nicknames call it
  _inited = true;
  document.addEventListener('pointerdown', (ev) => {
    if (!_open) return;
    if (_el && _el.contains(ev.target)) return;
    closeSeatMenu();
  }, true);
  document.addEventListener('keydown', (ev) => { if (_open && ev.key === 'Escape') closeSeatMenu(); });
  window.addEventListener('resize', closeSeatMenu);
  window.addEventListener('scroll', closeSeatMenu, true);
  window.openSeatMenu = openSeatMenu;
  window.closeSeatMenu = closeSeatMenu;
}

export default { openSeatMenu, closeSeatMenu, isSeatMenuOpen, initSeatMenu };
