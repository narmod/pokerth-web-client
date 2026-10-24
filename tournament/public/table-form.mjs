// ═══════════════════════════════════════════════════════════════════
// /tournament/organize — the table settings form (service 0.16.0).
//
// The same choices as the web client's « Create a table » form: the game
// styles, the community templates (BBC, Monthly Cup, WEC…), the blind
// increase interval, the blinds order (always double, or a manual list and
// what comes after it), time to act and pause between hands, with the same
// limits. Lists and limits come from the service
// (GET /admin/tournaments/table-presets), which reads the web client's own
// public/modules/create-presets.mjs: change them there and this form follows.
// English only, like the rest of the organizer side.
// ═══════════════════════════════════════════════════════════════════

export function createTableForm(deps) {
  const { esc } = deps;
  let P = null;   // the presets, once loaded

  function load(api) {
    return api('/admin/tournaments/table-presets').then((d) => { if (d && d.ok) P = d; return P; });
  }
  const ready = () => !!P;
  const defaults = () => (P ? P.defaults : null);
  const L = () => P.limits;

  // A preset ('style:<id>' or 'template:<name>') as table settings.
  function presetTable(ref) {
    const m = /^(style|template):(.+)$/.exec(String(ref || ''));
    if (!m || !P) return null;
    if (m[1] === 'style') {
      const s = P.styles.find((x) => x.id === m[2]);
      return s ? { startMoney: s.stack, firstSmallBlind: s.blind, raiseMode: s.raiseMode === 2 ? 'minutes' : 'hands', raiseEvery: s.raiseEvery, actionTimeout: s.timeout, delayBetweenHands: s.delay, manualBlinds: [], endRaiseMode: 'double', endRaiseValue: 0, preset: ref } : null;
    }
    const t = P.templates.find((x) => x.name === m[2]);
    return t ? { startMoney: t.startCash, firstSmallBlind: t.firstSmallBlind, raiseMode: t.raiseOnHands ? 'hands' : 'minutes', raiseEvery: t.raiseOnHands ? t.raiseEveryHands : t.raiseEveryMinutes, actionTimeout: t.playerActionTimeout, delayBetweenHands: P.templateDelay, manualBlinds: t.blinds.slice(), endRaiseMode: 'double', endRaiseValue: 0, preset: ref } : null;
  }

  const num = (id, lim, v, step) => '<input id="' + id + '" type="number" inputmode="numeric" min="' + lim.min + '" max="' + lim.max + '"' + (step ? ' step="' + step + '"' : '') + ' value="' + esc(v) + '">';
  function html(p, v) {
    if (!P) return '<p class="small muted">Loading the table settings…</p>';
    v = Object.assign({}, P.defaults, v || {});
    const mb = (v.manualBlinds || []).slice();
    const manual = mb.length > 0;
    let h = '<div class="tform" data-tf="' + esc(p) + '" data-preset="' + esc(v.preset || '') + '" data-mb="' + esc(mb.join(',')) + '">';
    h += '<p class="small muted tf-lbl">Game style</p><div class="tf-styles">' + P.styles.map((s) =>
      '<button type="button" class="tf-style' + (v.preset === 'style:' + s.id ? ' on' : '') + '" data-style="' + esc(s.id) + '"><span aria-hidden="true">' + esc(s.icon) + '</span> ' + esc(s.name) + '</button>').join('') + '</div>';
    h += '<div class="row"><div><label for="' + p + 'tpl">Community template</label><select id="' + p + 'tpl" data-tpl><option value="">Custom settings</option>' +
      P.templates.map((t) => '<option' + (v.preset === 'template:' + t.name ? ' selected' : '') + '>' + esc(t.name) + '</option>').join('') + '</select></div></div>';
    h += '<div class="row"><div><label for="' + p + 'startMoney">Starting stack</label>' + num(p + 'startMoney', L().stack, v.startMoney, L().stack.step) + '</div>' +
      '<div><label for="' + p + 'firstSmallBlind">First small blind</label>' + num(p + 'firstSmallBlind', L().blind, v.firstSmallBlind) + '</div></div>';
    h += '<div class="row"><div><span class="tf-lbl2">Blind increase interval</span><div class="tf-inline">' +
      '<label class="ck"><input type="radio" name="' + p + 'rm" value="hands"' + (v.raiseMode !== 'minutes' ? ' checked' : '') + '> hands</label>' +
      '<label class="ck"><input type="radio" name="' + p + 'rm" value="minutes"' + (v.raiseMode === 'minutes' ? ' checked' : '') + '> minutes</label>' +
      num(p + 'raiseEvery', L().raiseEvery, v.raiseEvery) + '</div></div></div>';
    h += '<div><span class="tf-lbl2">Blind raise order</span><div class="tf-inline">' +
      '<label class="ck"><input type="radio" name="' + p + 'mb" value="0"' + (manual ? '' : ' checked') + '> always double blinds</label>' +
      '<label class="ck"><input type="radio" name="' + p + 'mb" value="1"' + (manual ? ' checked' : '') + '> manual blinds order</label></div>' +
      '<div class="tf-mb" id="' + p + 'mbEd"' + (manual ? '' : ' hidden') + '><div class="tf-chips" id="' + p + 'mbList">' + chips(mb) + '</div>' +
      '<div class="tf-inline">' + num(p + 'mbVal', L().blindValue, mb.length ? Math.min(L().blindValue.max, mb[mb.length - 1] * 2) : Math.max(L().blindValue.min, v.firstSmallBlind * 2)) +
      '<button type="button" class="ghost" data-mbadd>+ Add</button><span class="small muted">' + L().manualBlinds.max + ' levels at most</span></div>' +
      '<span class="tf-lbl2">Afterwards:</span><div class="tf-inline">' +
      '<label class="ck"><input type="radio" name="' + p + 'amb" value="double"' + (v.endRaiseMode !== 'value' && v.endRaiseMode !== 'keep' ? ' checked' : '') + '> double blinds</label>' +
      '<label class="ck"><input type="radio" name="' + p + 'amb" value="value"' + (v.endRaiseMode === 'value' ? ' checked' : '') + '> raise blinds by</label>' +
      num(p + 'endRaiseValue', L().endRaiseValue, v.endRaiseValue || Math.max(L().endRaiseValue.min, v.firstSmallBlind * 2)) +
      '<label class="ck"><input type="radio" name="' + p + 'amb" value="keep"' + (v.endRaiseMode === 'keep' ? ' checked' : '') + '> keep last blind</label></div></div></div>';
    h += '<div class="row"><div><label for="' + p + 'actionTimeout">Time to act (s)</label>' + num(p + 'actionTimeout', L().timeout, v.actionTimeout) + '</div>' +
      '<div><label for="' + p + 'delayBetweenHands">Pause between hands (s)</label>' + num(p + 'delayBetweenHands', L().delay, v.delayBetweenHands) + '</div></div>';
    return h + '</div>';
  }
  function chips(mb) {
    return mb.map((x) => '<button type="button" class="chip tf-chip" data-mbdel="' + x + '" title="Remove">' + esc(x) + ' ×</button>').join('');
  }

  const box = (p) => document.querySelector('.tform[data-tf="' + p + '"]');
  const val = (p, k) => { const e = document.getElementById(p + k); return e ? Number(e.value) : undefined; };
  const radio = (p, n) => { const e = document.querySelector('input[name="' + p + n + '"]:checked'); return e ? e.value : null; };
  function read(p) {
    const b = box(p);
    if (!b) return null;
    const manual = radio(p, 'mb') === '1';
    const mb = manual ? (b.dataset.mb ? b.dataset.mb.split(',').map(Number) : []) : [];
    return {
      startMoney: val(p, 'startMoney'), firstSmallBlind: val(p, 'firstSmallBlind'),
      raiseMode: radio(p, 'rm') === 'minutes' ? 'minutes' : 'hands', raiseEvery: val(p, 'raiseEvery'),
      manualBlinds: mb, endRaiseMode: mb.length ? (radio(p, 'amb') || 'double') : 'double',
      endRaiseValue: mb.length && radio(p, 'amb') === 'value' ? val(p, 'endRaiseValue') : 0,
      actionTimeout: val(p, 'actionTimeout'), delayBetweenHands: val(p, 'delayBetweenHands'),
      preset: b.dataset.preset || null,
    };
  }
  // Same settings? (to know whether the table changed)
  function same(a, b) {
    const k = ['startMoney', 'firstSmallBlind', 'raiseMode', 'raiseEvery', 'endRaiseMode', 'endRaiseValue', 'actionTimeout', 'delayBetweenHands'];
    a = Object.assign({}, P ? P.defaults : {}, a || {}); b = Object.assign({}, P ? P.defaults : {}, b || {});
    return k.every((x) => String(a[x]) === String(b[x])) && (a.manualBlinds || []).join(',') === (b.manualBlinds || []).join(',');
  }
  function apply(p, t) {
    const b = box(p);
    if (!b || !t) return;
    const parent = b.parentNode;
    const wrap = document.createElement('div');
    wrap.innerHTML = html(p, t);
    parent.replaceChild(wrap.firstChild, b);
  }
  function setMb(p, list) {
    const b = box(p);
    const mb = [...new Set(list.filter((x) => Number.isInteger(x) && x >= L().blindValue.min && x <= L().blindValue.max))].sort((x, y) => x - y).slice(0, L().manualBlinds.max);
    b.dataset.mb = mb.join(',');
    document.getElementById(p + 'mbList').innerHTML = chips(mb);
    const inp = document.getElementById(p + 'mbVal');
    if (inp && mb.length) inp.value = Math.min(L().blindValue.max, mb[mb.length - 1] * 2);
  }
  // Any change by hand: the settings are no longer the preset's.
  function custom(p) {
    const b = box(p);
    if (!b) return;
    b.dataset.preset = '';
    b.querySelectorAll('.tf-style.on').forEach((x) => x.classList.remove('on'));
    const s = document.getElementById(p + 'tpl'); if (s) s.value = '';
  }

  // One listener for every form on the page (they are re-rendered often).
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.tform');
    if (!b || !P) return;
    const p = b.dataset.tf;
    const st = e.target.closest('[data-style]');
    if (st) return apply(p, presetTable('style:' + st.dataset.style));
    if (e.target.closest('[data-mbadd]')) {
      const list = b.dataset.mb ? b.dataset.mb.split(',').map(Number) : [];
      const v = parseInt(document.getElementById(p + 'mbVal').value, 10);
      if (!Number.isInteger(v) || list.length >= L().manualBlinds.max) return;
      setMb(p, list.concat([Math.min(v, L().blindValue.max)])); custom(p); return;
    }
    const del = e.target.closest('[data-mbdel]');
    if (del) { setMb(p, (b.dataset.mb ? b.dataset.mb.split(',').map(Number) : []).filter((x) => x !== Number(del.dataset.mbdel))); custom(p); }
  });
  document.addEventListener('change', (e) => {
    const b = e.target.closest('.tform');
    if (!b || !P) return;
    const p = b.dataset.tf;
    if (e.target.matches('[data-tpl]')) {
      if (e.target.value) apply(p, presetTable('template:' + e.target.value));
      else custom(p);
      return;
    }
    if (e.target.name === p + 'mb') document.getElementById(p + 'mbEd').hidden = e.target.value !== '1';
    if (e.target.id !== p + 'mbVal') custom(p);
  });

  function summary(t) {
    t = Object.assign({}, P ? P.defaults : {}, t || {});
    const mb = t.manualBlinds || [];
    const raise = mb.length ? 'manual order of ' + mb.length + ' level' + (mb.length === 1 ? '' : 's') + ' (' + mb[0] + '…' + mb[mb.length - 1] + ') every ' + t.raiseEvery + (t.raiseMode === 'minutes' ? ' min' : ' hands') + ', then ' + ({ value: '+' + t.endRaiseValue, keep: 'kept' }[t.endRaiseMode] || 'doubled')
      : 'doubled every ' + t.raiseEvery + (t.raiseMode === 'minutes' ? ' min' : ' hands');
    const name = t.preset ? String(t.preset).replace(/^style:/, '').replace(/^template:/, '') : '';
    const st = P && /^style:/.test(t.preset || '') ? P.styles.find((s) => 'style:' + s.id === t.preset) : null;
    return (name ? (st ? st.name : name) + ' — ' : '') + 'stack ' + t.startMoney + ' · blinds ' + t.firstSmallBlind + '/' + (t.firstSmallBlind * 2) + ', ' + raise + ' · ' + t.actionTimeout + ' s to act · ' + t.delayBetweenHands + ' s between hands';
  }

  return { load, ready, defaults, html, read, same, summary, presetTable };
}
