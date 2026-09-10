// @ts-check
// notes/index.mjs — Notes de joueur + étiquette de couleur (extra web).
//
// Trois surfaces :
//   · la carte joueur (player-popup) — saisie de la note, choix de couleur et
//     renommage du LIBELLÉ de la couleur (sens global : renommer « rouge »
//     renomme le rouge de tous les joueurs qui le portent) ;
//   · le siège à la table — une pastille de couleur devant le pseudo, suivie
//     de « ★N » si le joueur est noté, dont le tooltip donne le libellé et un
//     extrait de la note (aperçu au survol ; au doigt, taper le siège ouvre
//     de toute façon la carte avec la note) ;
//   · la liste des joueurs — la même pastille devant le pseudo.
//
// Conception : module AUTONOME, comme handlog/journal. Le reste du client ne
// touche que des ponts window optionnels (window._nvSeatTag, _nvBlockHtml…).
// Si ce module n'est pas chargé, les appelants testent la fonction et sautent.
//
// La note vit sous 'pth_notes' et voyage dans le blob de réglages web : elle
// suit le joueur du téléphone au bureau sans serveur dédié.

import { createNotes, TAGS, tagById, MAX_NOTE_LEN, MAX_LABEL_LEN, MAX_STARS } from './store.mjs';
import { esc } from '../ui/misc.mjs';

function T(k, fb) {
  try {
    if (typeof window !== 'undefined' && typeof window.t === 'function') {
      const v = window.t(k);
      if (v && v !== k) return v;
    }
  } catch (_e) {}
  return fb;
}

// Écriture → la sync des réglages web doit repartir, et les sièges doivent
// reprendre la pastille immédiatement (la couleur est visible à la table).
const notes = createNotes({
  onChange() {
    try { if (typeof window._cfgSyncMark === 'function') window._cfgSyncMark('pth_notes'); } catch (_e) {}
    try { if (typeof window._renderSeats === 'function') window._renderSeats(); } catch (_e) {}
  },
});

// Libellé EFFECTIF d'une couleur : renommage du joueur s'il existe, sinon le
// défaut i18n. C'est la seule porte d'entrée — personne ne lit tg.fb ailleurs.
export function labelText(tag) {
  const tg = typeof tag === 'string' ? tagById(tag) : tag;
  if (!tg) return '';
  return notes.labelOf(tg.id) || T(tg.key, tg.fb);
}

// ── Pastille et badge d'étoiles (siège ET liste des joueurs) ──────────────
// Appelées par game/seat-render.mjs pour chaque siège et par le rendu de la
// liste des joueurs. Renvoient '' quand le joueur n'a rien : aucun surcoût de
// DOM dans le cas courant. Le title porte l'aperçu (libellé + étoiles +
// extrait de note) — le survol répond sur bureau ; au doigt, le tap ouvre la
// carte joueur qui montre la note entière.
//
// Deux morceaux SÉPARÉS parce qu'ils ne vont pas au même endroit au siège :
// la pastille de couleur précède le pseudo, le badge d'étoiles se range à
// l'autre bout de la ligne (upstream d72d109, « follow-up » : Kai a sorti le
// badge de la ligne du bas — drapeau + tapis y remplissent déjà la largeur
// intérieure de la boîte — pour l'ancrer à droite de la ligne du pseudo, qui
// s'élide contre lui). La liste des joueurs, elle, n'a pas cette contrainte
// de largeur et garde les deux côte à côte via seatTagHtml().
function _tipOf(e) {
  const tag = tagById(e ? e.tag : '');
  const stars = e ? e.stars : 0;
  const head = [];
  if (tag) head.push(labelText(tag));
  if (stars) head.push('★' + stars + '/' + MAX_STARS);
  let tip = head.join(' · ');
  const n = e && e.note ? String(e.note) : '';
  if (n) tip += (tip ? ' — ' : '') + (n.length > 90 ? n.slice(0, 90) + '…' : n);
  return tip;
}

export function seatDotHtml(name) {
  const e = notes.get(name);
  const tag = tagById(e ? e.tag : '');
  if (!tag) return '';
  const tip = esc(_tipOf(e));
  return '<span class="seat-note-tag" style="background:' + tag.hex + '"'
       + ' title="' + tip + '" aria-label="' + tip + '"></span>';
}

// « ★N » plutôt que cinq étoiles : la boîte adverse est à largeur fixe et le
// pseudo y est déjà tronqué — même arbitrage que le badge QML
// (PlayerNoteBadge.qml : « fünf einzelne Sterne wären dort weder lesbar noch
// treffbar »).
export function seatStarsHtml(name) {
  const e = notes.get(name);
  const stars = e ? e.stars : 0;
  if (!stars) return '';
  const tip = esc(_tipOf(e));
  return '<span class="seat-note-stars" title="' + tip + '"'
       + ' aria-label="' + tip + '">\u2605' + stars + '</span>';
}

// Les deux d'affilée — la forme qu'attend la liste des joueurs.
export function seatTagHtml(name) {
  return seatDotHtml(name) + seatStarsHtml(name);
}

// ── Bloc de la carte joueur ───────────────────────────────────────────────
// Rendu en HTML (la carte se peint par innerHTML), câblé après coup par
// wireBlock() puisque le conteneur n'existe pas encore au moment du rendu.
export function notesBlockHtml(name) {
  const nm = String(name == null ? '' : name);
  if (!nm) return '';
  const cur = notes.get(nm) || { note: '', tag: '', stars: 0 };
  // Barre 0–5 étoiles (parité PlayerRatingStars.qml). Glyphes Unicode et non
  // icônes : elles suivent la taille de police et se colorent sans qu'il
  // faille une image par taille.
  const ratingLbl = T('nvRating', 'Rating');
  let starsHtml = '';
  for (let i = 1; i <= MAX_STARS; i++) {
    const on = cur.stars >= i;
    starsHtml += '<button type="button" class="nv-star' + (on ? ' on' : '') + '"'
      + ' data-nv-star="' + i + '"'
      + ' title="' + esc(ratingLbl + ' ' + i + '/' + MAX_STARS) + '"'
      + ' aria-label="' + esc(ratingLbl + ' ' + i + '/' + MAX_STARS) + '"'
      + ' aria-pressed="' + (on ? 'true' : 'false') + '">'
      + (on ? '\u2605' : '\u2606') + '</button>';
  }
  const swatches = TAGS.map((tg) => {
    const on = cur.tag === tg.id;
    const lbl = labelText(tg);
    return '<button type="button" class="nv-sw' + (on ? ' on' : '') + '"'
         + ' data-nv-tag="' + tg.id + '" style="background:' + tg.hex + '"'
         + ' title="' + esc(lbl) + '" aria-label="' + esc(lbl) + '"'
         + ' aria-pressed="' + (on ? 'true' : 'false') + '"></button>';
  }).join('');
  const clearOn = !cur.tag;
  // Le champ libellé n'apparaît que quand une couleur est posée : sans
  // couleur, il n'y a rien à nommer. Pré-rempli avec le libellé effectif ;
  // vider ou retaper le défaut restaure le défaut i18n.
  const curLbl = cur.tag ? labelText(cur.tag) : '';
  return '<div class="nv-block" data-nv-name="' + esc(nm) + '">'
       + '<div class="nv-hd">' + esc(T('nvTitle', 'My note')) + '</div>'
       + '<div class="nv-stars" role="group" aria-label="' + esc(ratingLbl) + '">'
       + starsHtml + '</div>'
       + '<div class="nv-swatches">' + swatches
       + '<button type="button" class="nv-sw nv-sw-none' + (clearOn ? ' on' : '') + '"'
       + ' data-nv-tag="" title="' + esc(T('nvTagNone', 'No label')) + '"'
       + ' aria-label="' + esc(T('nvTagNone', 'No label')) + '"'
       + ' aria-pressed="' + (clearOn ? 'true' : 'false') + '">∅</button>'
       + '</div>'
       + '<div class="nv-label-row"' + (cur.tag ? '' : ' style="display:none"') + '>'
       + '<input type="text" class="nv-label" maxlength="' + MAX_LABEL_LEN + '"'
       + ' value="' + esc(curLbl) + '"'
       + ' placeholder="' + esc(T('nvLabelPh', 'Label name')) + '"'
       + ' title="' + esc(T('nvLabelTip', 'Rename this label — applies to every player with this color')) + '"'
       + ' aria-label="' + esc(T('nvLabelPh', 'Label name')) + '">'
       + '</div>'
       + '<textarea class="nv-text" rows="3" maxlength="' + MAX_NOTE_LEN + '"'
       + ' placeholder="' + esc(T('nvPlaceholder', 'Calls any 3-bet…')) + '"'
       + ' aria-label="' + esc(T('nvTitle', 'My note')) + '">' + esc(cur.note) + '</textarea>'
       + '<div class="nv-foot"><span class="nv-saved" aria-live="polite"></span></div>'
       + '</div>';
}

// Câblage : appelé APRÈS l'injection du HTML dans la carte. Idempotent (on
// re-câble à chaque ouverture, la carte étant repeinte entièrement).
export function wireBlock(root) {
  const host = (root || document).querySelector('.nv-block');
  if (!host) return;
  const nm = host.getAttribute('data-nv-name') || '';
  if (!nm) return;
  const ta = host.querySelector('.nv-text');
  const saved = host.querySelector('.nv-saved');
  const lblRow = host.querySelector('.nv-label-row');
  const lblIn = host.querySelector('.nv-label');

  let flashTimer = 0;
  function flash() {
    if (!saved) return;
    saved.textContent = T('nvSaved', 'Saved');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => { saved.textContent = ''; }, 1400);
  }

  function curTag() { return notes.tagOf(nm); }

  // Saisie de la note : on écrit en différé (la frappe ne doit pas marteler
  // localStorage ni la sync), plus un flush immédiat à la perte de focus et à
  // la fermeture.
  let saveTimer = 0;
  function saveNote() {
    clearTimeout(saveTimer);
    notes.set(nm, { note: ta ? ta.value : '' });
    flash();
  }
  if (ta) {
    ta.addEventListener('input', () => { clearTimeout(saveTimer); saveTimer = setTimeout(saveNote, 600); });
    ta.addEventListener('blur', saveNote);
    // Escape ferme la carte (keynav) : sans ce flush la dernière frappe
    // partirait à la poubelle.
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') saveNote();
      // Ctrl+Entrée (⌘+Entrée) enregistre tout de suite, Entrée seule reste un
      // saut de ligne — parité QML PlayerNoteDialog (b170786).
      else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveNote(); }
    });
  }

  // Renommage du libellé : différé pareil, et un libellé retapé à l'identique
  // du défaut i18n redevient le défaut (l'entrée disparaît du store — la
  // traduction reprend la main si on change de langue).
  let lblTimer = 0;
  function saveLabel() {
    clearTimeout(lblTimer);
    const id = curTag();
    if (!id || !lblIn) return;
    const tg = tagById(id);
    const def = tg ? T(tg.key, tg.fb) : '';
    const v = String(lblIn.value || '').trim();
    const changed = notes.setLabel(id, v === def ? '' : v);
    if (changed) {
      // Le libellé apparaît aussi en tooltip des pastilles du bloc : repeint.
      const btn = host.querySelector('[data-nv-tag="' + id + '"]');
      const lbl = labelText(id);
      if (btn) { btn.setAttribute('title', lbl); btn.setAttribute('aria-label', lbl); }
      flash();
    }
  }
  if (lblIn) {
    lblIn.addEventListener('input', () => { clearTimeout(lblTimer); lblTimer = setTimeout(saveLabel, 600); });
    lblIn.addEventListener('blur', saveLabel);
    lblIn.addEventListener('keydown', (e) => { if (e.key === 'Escape' || e.key === 'Enter') saveLabel(); });
  }

  function syncLabelRow() {
    const id = curTag();
    if (lblRow) lblRow.style.display = id ? '' : 'none';
    if (lblIn) lblIn.value = id ? labelText(id) : '';
  }

  host.querySelectorAll('[data-nv-tag]').forEach((b) => {
    b.addEventListener('click', () => {
      // Un libellé en cours de frappe se sauve AVANT de changer de couleur,
      // sinon il partirait sur la mauvaise étiquette (ou à la poubelle).
      saveLabel();
      const id = b.getAttribute('data-nv-tag') || '';
      notes.set(nm, { tag: id });
      host.querySelectorAll('[data-nv-tag]').forEach((o) => {
        const on = (o.getAttribute('data-nv-tag') || '') === id;
        o.classList.toggle('on', on);
        o.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      syncLabelRow();
      flash();
    });
  });

  // Étoiles : cliquer la i-ème pose i, re-cliquer la DERNIÈRE posée retire
  // celle-là (i−1) — c'est ainsi qu'on revient à zéro sans bouton dédié,
  // exactement comme la barre QML (PlayerRatingStars.qml).
  function paintStars(v) {
    host.querySelectorAll('[data-nv-star]').forEach((b) => {
      const i = parseInt(b.getAttribute('data-nv-star') || '0', 10);
      const on = v >= i;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? '\u2605' : '\u2606';
    });
  }
  host.querySelectorAll('[data-nv-star]').forEach((b) => {
    b.addEventListener('click', () => {
      const i = parseInt(b.getAttribute('data-nv-star') || '0', 10);
      if (!i) return;
      const curV = notes.starsOf(nm);
      const next = curV === i ? i - 1 : i;
      notes.set(nm, { stars: next });
      paintStars(next);
      flash();
    });
  });

  host._nvFlush = () => { if (ta) saveNote(); saveLabel(); };
}

// Flush explicite — appelé à la fermeture de la carte joueur, pour que la
// note (ou le libellé) en cours de frappe ne soit pas perdue par la fermeture.
export function flushOpen() {
  try {
    const host = document.querySelector('.nv-block');
    if (host && typeof host._nvFlush === 'function') host._nvFlush();
  } catch (_e) {}
}

export { notes };

if (typeof window !== 'undefined') {
  window._nvBlockHtml = notesBlockHtml;
  window._nvWire = wireBlock;
  window._nvFlush = flushOpen;
  window._nvSeatTag = seatTagHtml;   // liste des joueurs (pastille + étoiles)
  window._nvSeatDot = seatDotHtml;   // siège : devant le pseudo
  window._nvSeatStars = seatStarsHtml; // siège : à l'autre bout de la ligne
  window._nvStore = notes;
}
