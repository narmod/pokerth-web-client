// ─────────────────────────────────────────────────────────────────────────
// Glossaire d'abréviations de chat (poker / gaming) — module autonome.
// Demande narmod 2026-07-20 : aider les joueurs qui ne connaissent pas le
// jargon (gg, gl, nh, utg…) à en comprendre le sens dans leur langue.
//
// Deux usages, tous deux additifs (aucune logique existante modifiée) :
//   1. window._chatMarkAbbrev(root)  — parcourt les NŒUDS TEXTE de `root`
//      (bulle .txt d'un message) et entoure chaque abréviation connue d'un
//      <span class="chat-abbr" title="sens localisé"> → bulle au survol,
//      hors-ligne et instantanée. N'entre jamais dans les balises/URLs
//      (TreeWalker sur les text nodes uniquement) → zéro casse emotes/liens.
//   2. window._expandAbbrev(text)    — remplace les abréviations par leur
//      forme longue ANGLAISE avant l'envoi à Google Translate (bouton 🌐),
//      pour que « gg » devienne « good game » puis soit traduit normalement.
//
// Le sens affiché est localisé via i18n : clé 'abbr_<token>' (en.mjs + fr.mjs ;
// les autres langues retombent sur l'anglais, conforme à la politique i18n).
// `xp` (expansion anglaise) sert de source pour Google ET de repli ultime.
// ─────────────────────────────────────────────────────────────────────────

// token (minuscule) -> { xp: expansion anglaise, key: clé i18n }
const ABBREV = {
  // Politesse / social
  gg:   { xp: 'good game',              key: 'abbr_gg' },
  vgg:  { xp: 'very good game',         key: 'abbr_vgg' },
  gl:   { xp: 'good luck',              key: 'abbr_gl' },
  hf:   { xp: 'have fun',              key: 'abbr_hf' },
  glhf: { xp: 'good luck, have fun',    key: 'abbr_glhf' },
  nh:   { xp: 'nice hand',             key: 'abbr_nh' },
  n1:   { xp: 'nice one',              key: 'abbr_n1' },
  wp:   { xp: 'well played',           key: 'abbr_wp' },
  gj:   { xp: 'good job',              key: 'abbr_gj' },
  wd:   { xp: 'well done',             key: 'abbr_wd' },
  ty:   { xp: 'thank you',             key: 'abbr_ty' },
  thx:  { xp: 'thanks',               key: 'abbr_thx' },
  np:   { xp: 'no problem',            key: 'abbr_np' },
  brb:  { xp: 'be right back',          key: 'abbr_brb' },
  afk:  { xp: 'away from keyboard',     key: 'abbr_afk' },
  gtg:  { xp: 'got to go',             key: 'abbr_gtg' },
  g2g:  { xp: 'got to go',             key: 'abbr_gtg' },
  ez:   { xp: 'easy',                 key: 'abbr_ez' },
  // Jargon poker
  allin:{ xp: 'all-in',               key: 'abbr_allin' },
  ai:   { xp: 'all-in',               key: 'abbr_allin' },
  utg:  { xp: 'under the gun',          key: 'abbr_utg' },
  nl:   { xp: 'no-limit',              key: 'abbr_nl' },
  pl:   { xp: 'pot-limit',             key: 'abbr_pl' },
  bb:   { xp: 'big blind',             key: 'abbr_bb' },
  sb:   { xp: 'small blind',           key: 'abbr_sb' },
  str8: { xp: 'straight',             key: 'abbr_str8' },
  aa:   { xp: 'pocket aces',           key: 'abbr_aa' },
  kk:   { xp: 'pocket kings',           key: 'abbr_kk' },
  qq:   { xp: 'pocket queens',          key: 'abbr_qq' }
};

// Regex d'un token « mot entier ». Les tokens sont alphanumériques ; \b gère
// les frontières (pas de match dans « eggs », « email », « aaa »…). Tokens
// triés par longueur décroissante (préférence au plus long, ex. glhf > gl —
// même si \b l'empêche déjà, on reste défensif).
const _TOKENS = Object.keys(ABBREV).sort(function (a, b) { return b.length - a.length; });
function _escapeRx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
const _RX_SRC = '\\b(' + _TOKENS.map(_escapeRx).join('|') + ')\\b';

// Option (avancées) : activée par défaut ; seul pth_chat_abbrev='0' la coupe.
function isEnabled() {
  try {
    return typeof localStorage === 'undefined' || localStorage.getItem('pth_chat_abbrev') !== '0';
  } catch (_e) { return true; }
}

// Sens localisé d'un token (i18n : langue active → anglais → xp du module).
function abbrevMeaning(tok) {
  var e = ABBREV[tok];
  if (!e) return tok;
  try {
    if (typeof window !== 'undefined' && typeof window.t === 'function') {
      var v = window.t(e.key);
      if (v && v !== e.key) return v;
    }
  } catch (_e) {}
  return e.xp;
}

// Remplace les abréviations par leur forme longue anglaise (source Google).
// Opère sur du TEXTE BRUT (dataset.orig), pas du HTML.
function expandAbbrev(text) {
  if (!text || !isEnabled()) return text;
  var rx = new RegExp(_RX_SRC, 'gi');
  return String(text).replace(rx, function (m) {
    var e = ABBREV[m.toLowerCase()];
    return e ? e.xp : m;
  });
}

// Entoure les abréviations d'un <span class="chat-abbr" title="sens">.
// Parcourt uniquement les nœuds texte de `root` (jamais les balises), en
// sautant ce qui est déjà dans un lien <a> ou un .chat-abbr.
function markAbbrev(root) {
  if (!root || typeof document === 'undefined' || !isEnabled()) return;
  var rx = new RegExp(_RX_SRC, 'gi');
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  var targets = [], n;
  while ((n = walker.nextNode())) {
    var p = n.parentNode;
    if (p && p.closest && p.closest('a, .chat-abbr')) continue;
    rx.lastIndex = 0;
    if (rx.test(n.nodeValue)) targets.push(n);
  }
  for (var i = 0; i < targets.length; i++) {
    var tn = targets[i], text = tn.nodeValue, frag = document.createDocumentFragment();
    var last = 0, m; rx.lastIndex = 0;
    while ((m = rx.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      var span = document.createElement('span');
      span.className = 'chat-abbr';
      span.title = abbrevMeaning(m[0].toLowerCase());
      span.textContent = m[0];
      frag.appendChild(span);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    if (tn.parentNode) tn.parentNode.replaceChild(frag, tn);
  }
}

// Bascule live de l'option : retire les <span.chat-abbr> existants, puis
// re-marque les messages du chat si l'option est active. Appelé par
// applyAdvOpts() (pokerth.js) à chaque changement d'options.
function refreshAll() {
  if (typeof document === 'undefined') return;
  try {
    var marks = document.querySelectorAll('.chat-abbr');
    for (var i = 0; i < marks.length; i++) {
      var s = marks[i], par = s.parentNode;
      if (par) { par.replaceChild(document.createTextNode(s.textContent), s); if (par.normalize) par.normalize(); }
    }
    if (isEnabled()) {
      var txts = document.querySelectorAll('.msg .txt');
      for (var j = 0; j < txts.length; j++) markAbbrev(txts[j]);
    }
  } catch (_e) {}
}

export { ABBREV, expandAbbrev, markAbbrev, abbrevMeaning, isEnabled, refreshAll };
if (typeof window !== 'undefined') {
  window._expandAbbrev = expandAbbrev;
  window._chatMarkAbbrev = markAbbrev;
  window._abbrevMeaning = abbrevMeaning;
  window._chatAbbrevEnabled = isEnabled;
  window._chatAbbrevRefresh = refreshAll;
  window._chatAbbrev = { ABBREV: ABBREV, expand: expandAbbrev, mark: markAbbrev, meaning: abbrevMeaning, enabled: isEnabled, refresh: refreshAll };
}
