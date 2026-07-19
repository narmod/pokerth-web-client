// ═══════════════════════════════════════════════════════════════════
// Formatage des montants — chantier ESM #9f-1.
// Fonctions déplacées telles quelles depuis l'IIFE App (pokerth.js) ;
// seule adaptation de portée : `_lang` (global exposé par i18n.mjs via
// defineProperty) est lu via window._lang — même valeur, même repli.
// Pont legacy : window.* (les appels de l'IIFE résolvent la chaîne de
// portées jusqu'au global — zéro site d'appel modifié).
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';

function _curLang() {
  try { return (typeof window._lang === 'string') ? window._lang : ''; } catch (e) { return ''; }
}

// Group a whole number with thousands separators following the active
// language: French (and most others) use a thin/regular space — 1 000 000;
// English uses a comma — 1,000,000. Improves readability of big stacks/pots.
export function _groupThousands(n) {
  var neg = n < 0;
  var s = String(Math.abs(Math.round(n)));
  var sep = (_curLang() === 'en') ? ',' : '\u202F'; // narrow no-break space
  s = s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return (neg ? '-' : '') + s;
}

export function fmtChips(amount) {
  var v = (typeof amount === 'number') ? amount : parseInt(amount, 10) || 0;
  if (!S._displayBB) return '$' + _groupThousands(v);
  var bb = (S.smallBlind || 0) * 2;
  if (!bb) return '$' + _groupThousands(v);
  var n = v / bb;
  // Round to 1 decimal, drop a trailing .0
  var r = Math.round(n * 10) / 10;
  var s = (Math.abs(r % 1) < 1e-9) ? String(Math.round(r)) : r.toFixed(1);
  // Localised decimal separator: comma for every language except English.
  if (_curLang() !== 'en') s = s.replace('.', ',');
  return s + ' BB';
}

// Amount formatted for SPEECH. Mirrors fmtChips' BB mode (already TTS-clean,
// e.g. "12,5 BB"), but in chip mode returns the bare integer WITHOUT the
// thousands separator: the narrow no-break space in _groupThousands makes
// engines read "12 345" as two numbers. No $ glyph (its reading varies).
export function fmtChipsVoice(amount) {
  var v = (typeof amount === 'number') ? amount : parseInt(amount, 10) || 0;
  var bb = (S.smallBlind || 0) * 2;
  if (S._displayBB && bb) {
    var n = v / bb;
    var r = Math.round(n * 10) / 10;
    var s = (Math.abs(r % 1) < 1e-9) ? String(Math.round(r)) : r.toFixed(1);
    if (_curLang() !== 'en') s = s.replace('.', ',');
    return s + ' BB';
  }
  return String(v);
}

window._groupThousands = _groupThousands;
window.fmtChips = fmtChips;
window.fmtChipsVoice = fmtChipsVoice;
