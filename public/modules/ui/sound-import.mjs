// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/ui/sound-import.mjs
//
// « Custom sounds » list of the Advanced options → Sound panel: one row per
// replaceable sample, with a preview button, an import button and a reset
// button. Storage, decoding and playback all live in modules/sounds.mjs —
// this module is only the (lazily loaded) user interface for them.
//
// Desktop PokerTH players replace the files in data/sounds/default/ to use
// their own sounds; the browser has no such folder, so each sample is picked
// individually here and kept in IndexedDB, in this browser only.
//
// Loaded on demand by advSelectCat('sound') in pokerth.js:
//   import('/modules/ui/sound-import.mjs').then(m => m.mount(host))
// Re-rendered on a language switch through onLangChange.
// ─────────────────────────────────────────────────────────────────────────

import {
  sampleNames, hasCustomSample, customSampleInfo,
  setCustomSample, clearCustomSample, clearAllCustomSamples, previewSample
} from '/modules/sounds.mjs';
import { onLangChange } from '/modules/i18n.mjs';

function _t(key, fallback) {
  try {
    if (typeof window.t === 'function') {
      var s = window.t(key);
      if (s && s !== key) return s;
    }
  } catch (e) {}
  return fallback;
}
function _toast(msg) {
  try { if (typeof window.showToast === 'function') { window.showToast(msg); return; } } catch (e) {}
  try { alert(msg); } catch (e) {}
}

// Display order. Poker action terms stay in English everywhere (project rule);
// the rest goes through t() with an English fallback.
const ROWS = [
  { id: 'fold',            lbl: 'Fold' },
  { id: 'check',           lbl: 'Check' },
  { id: 'call',            lbl: 'Call' },
  { id: 'bet',             lbl: 'Bet' },
  { id: 'raise',           lbl: 'Raise' },
  { id: 'allin',           lbl: 'All-In' },
  { id: 'deal',            key: 'sndNameDeal',            fb: 'Dealing cards' },
  { id: 'turn',            key: 'sndNameTurn',            fb: 'Your turn' },
  { id: 'blinds1',         key: 'sndNameBlinds',          fb: 'Blind raise', n: 1 },
  { id: 'blinds2',         key: 'sndNameBlinds',          fb: 'Blind raise', n: 2 },
  { id: 'blinds3',         key: 'sndNameBlinds',          fb: 'Blind raise', n: 3 },
  { id: 'playerconnected', key: 'sndNamePlayerConnected', fb: 'Player connected' },
  { id: 'gameready',       key: 'sndNameGameReady',       fb: 'Game ready' },
  { id: 'lobbychat',       key: 'sndNameLobbyChat',       fb: 'Lobby chat' }
];

function _label(r) {
  var base = r.lbl || _t(r.key, r.fb);
  return r.n ? (base + ' ' + r.n) : base;
}
function _kb(n) {
  var k = Math.round((n || 0) / 1024);
  return (k >= 1024 ? (Math.round(k / 102.4) / 10) + ' MB' : k + ' KB');
}

var _host = null;
var _hooked = false;

// Small flat button, sized for a thumb on a phone.
function _btn(text, title) {
  var b = document.createElement('button');
  b.type = 'button';
  b.textContent = text;
  if (title) { b.title = title; b.setAttribute('aria-label', title); }
  b.style.cssText = 'flex:0 0 auto;min-width:34px;min-height:34px;padding:5px 9px;border:1px solid var(--border,rgba(200,168,74,0.35));' +
    'border-radius:8px;background:none;color:var(--gold,#c8a84a);cursor:pointer;font-size:0.78rem;font-weight:600;line-height:1';
  return b;
}

function _pick(id) {
  var inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.opus,.webm';
  inp.onchange = function () {
    var f = inp.files && inp.files[0];
    if (!f) return;
    setCustomSample(id, f).then(function () {
      _render();
      _toast(_t('advSndCustomOk', 'Sound replaced'));
    }).catch(function (err) {
      var m = (err && err.message) || '';
      _toast(m === 'too big' ? _t('advSndCustomTooBig', 'File too large (2 MB max)')
                             : _t('advSndCustomBad', 'This audio file cannot be read by the browser'));
    });
  };
  inp.click();
}

// ▶ : the buffer may still be decoding right after an import — retry once.
function _preview(id) {
  if (previewSample(id)) return;
  setTimeout(function () { previewSample(id); }, 260);
}

function _row(r) {
  var wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:5px 0;border-bottom:1px solid var(--border,rgba(255,255,255,0.07))';

  var txt = document.createElement('div');
  txt.style.cssText = 'flex:1 1 130px;min-width:0';           // min-width:0 : pas de debordement flex
  var name = document.createElement('div');
  name.textContent = _label(r);
  name.style.cssText = 'font-size:0.85rem;font-weight:600';
  var sub = document.createElement('div');
  var info = customSampleInfo(r.id);
  sub.textContent = info
    ? ((info.file || _t('advSndCustomOwn', 'Custom sound')) + (info.size ? ' \u00b7 ' + _kb(info.size) : ''))
    : _t('advSndCustomDefault', 'Original sound');
  sub.style.cssText = 'font-size:0.72rem;opacity:0.68;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
  txt.appendChild(name); txt.appendChild(sub);
  wrap.appendChild(txt);

  var play = _btn('\u25b6', _t('advSndCustomPlay', 'Play'));
  play.addEventListener('click', function () { _preview(r.id); });
  wrap.appendChild(play);

  var imp = _btn(_t('advSndCustomImport', 'Import'), _t('advSndCustomImport', 'Import'));
  imp.addEventListener('click', function () { _pick(r.id); });
  wrap.appendChild(imp);

  if (hasCustomSample(r.id)) {
    var rst = _btn('\u21ba', _t('advSndCustomReset', 'Restore the original sound'));
    rst.addEventListener('click', function () {
      clearCustomSample(r.id).then(function () { _render(); });
    });
    wrap.appendChild(rst);
  }
  return wrap;
}

function _render() {
  if (!_host) return;
  _host.textContent = '';
  var known = {};
  try { sampleNames().forEach(function (n) { known[n] = 1; }); } catch (e) { known = null; }

  var list = document.createElement('div');
  list.style.cssText = 'display:flex;flex-direction:column';
  var any = false;
  ROWS.forEach(function (r) {
    if (known && !known[r.id]) return;      // echantillon retire cote sounds.mjs
    list.appendChild(_row(r));
    if (hasCustomSample(r.id)) any = true;
  });
  _host.appendChild(list);

  if (any) {
    var all = _btn(_t('advSndCustomResetAll', 'Restore all original sounds'));
    all.style.cssText += ';margin-top:8px;align-self:flex-start';
    all.addEventListener('click', function () {
      var ok = true;
      try { ok = confirm(_t('advSndCustomResetAllAsk', 'Restore every original sound?')); } catch (e) {}
      if (ok) clearAllCustomSamples().then(function () { _render(); });
    });
    _host.appendChild(all);
  }
}

// Rendu (ou re-rendu) de la liste dans son conteneur des options avancees.
function mount(host) {
  if (host) _host = host;
  if (!_host) return;
  if (!_hooked) {
    _hooked = true;
    try { onLangChange(function () { _render(); }); } catch (e) {}
  }
  _render();
}

export { mount };
window.SoundImport = { mount: mount };
