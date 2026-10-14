// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/ui/lan-directory.mjs — LAN server directory, player side
// (web extension, no QML counterpart; narmod 2026-10-14).
//
// The proxy keeps a directory of community PokerTH servers: players propose
// theirs, an admin approves them (server/lan-directory.js, admin › Server ›
// LAN directory). This module puts it on the login form, LAN mode only:
//
//   · a « LAN server » drop-down (#lan-dir-sel, the sel-wrap component) of
//     the approved servers, online ones first, with a status line under it;
//     picking one fills the existing #host / #port / #use-tls fields, which
//     stay the single source of truth for App.connect() and for the player's
//     LAN memory (_pthLanRemember). Nothing new is stored: the selection is
//     derived from those fields on every pass.
//   · « Local server » first and pre-selected (setting `localEntry`, on by
//     default — a self-hosted install lists its own game server; pokerth.net
//     turns it off): the instance's default LAN address, the one the form
//     used before the directory existed (window._pthLanDefaults: the admin's
//     forced address, else the page's own host on 7234).
//   · « Enter an address… » at the end of the list when the admin allows
//     manual entry (setting `manualEntry`, off by default since web.44): it
//     unlocks the address fields of the ⚙ block. Without it the address
//     fields are hidden (body.lan-dir-locked) whenever the list is shown.
//   · « Propose my server »: the #lan-prop-dialog form. The connection test
//     (POST /api/lan-directory/test) must pass for the values on screen
//     before « Send » is enabled; the request (POST …/propose) gets no
//     follow-up (« N1 »): the server appearing in the list is the answer,
//     and nothing about it is kept on the device.
//
// The directory comes with /app-config (setConfig) and is refreshed from
// GET /api/lan-directory when the LAN form is shown and the copy is older
// than a minute. An instance with an empty directory, manual entry on and
// requests closed shows nothing new: the form is exactly as before.
// Markup: pokerth-client.html (#lan-dir, #lan-prop-dialog); strings: the UI
// catalogues (lanDir* / lanProp* / lanErr_*); Ace's Help: guide/contexts/
// login-lan.mjs and the hotspots.
// ─────────────────────────────────────────────────────────────────────────

const MANUAL = '__manual__';
const REFRESH_MS = 60000;
// ISO 3166 codes offered in the « Country » list (the flags the client ships),
// named in the player's language through Intl.DisplayNames.
const COUNTRIES = ('ad ae af ag ai al am ao ar as at au aw ax az ba bb bd be bf bg bh bi bj bl bm bn bo bq br bs bt bw by bz ca cc cd cf cg ch ci ck cl cm cn co cr cu cv cw cx cy cz de dj dk dm do dz ec ee eg eh er es et fi fj fk fm fo fr ga gb gd ge gf gg gh gi gl gm gn gp gq gr gs gt gu gw gy hk hn hr ht hu id ie il im in io iq ir is it je jm jo jp ke kg kh ki km kn kp kr kw ky kz la lb lc li lk lr ls lt lu lv ly ma mc md me mf mg mh mk ml mm mn mo mp mq mr ms mt mu mv mw mx my mz na nc ne nf ng ni nl no np nr nu nz om pa pe pf pg ph pk pl pm pn pr ps pt pw py qa re ro rs ru rw sa sb sc sd se sg sh si sk sl sm sn so sr ss st sv sx sy sz tc td tf tg th tj tk tl tm tn to tr tt tv tw tz ua ug us uy uz va vc ve vg vi vn vu wf ws xk ye yt za zm zw').split(' ');

let _cfg = null;          // { acceptRequests, manualEntry, servers: [...] } or null (old proxy)
let _cfgAt = 0;
let _fetching = false;
let _tested = '';          // signature of the form values the last passing test was run on

function _t(k, p, fb) {
  try { const s = window.t ? window.t(k, p) : null; return (s && s !== k) ? s : (fb || k); } catch (e) { return fb || k; }
}
function $(id) { return typeof document === 'undefined' ? null : document.getElementById(id); }
function _ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function _lang() { try { return (window.I18N && window.I18N.getLang && window.I18N.getLang()) || window._lang || 'en'; } catch (e) { return 'en'; } }
function _country(cc) {
  if (!cc) return '';
  try { return new Intl.DisplayNames([_lang(), 'en'], { type: 'region' }).of(cc) || cc; } catch (e) { return cc; }
}
function _langLabel(code) {
  try {
    const m = window.I18N && window.I18N.LANG_META && window.I18N.LANG_META[code];
    if (m && m.label) return m.label;
  } catch (e) {}
  try { return new Intl.DisplayNames([_lang(), 'en'], { type: 'language' }).of(code) || code; } catch (e) { return code; }
}

/** Normalised copy of the public view sent by the proxy (or null). */
export function normalizeConfig(c) {
  if (!c || typeof c !== 'object' || !Array.isArray(c.servers)) return null;
  const servers = [];
  c.servers.forEach((s) => {
    if (!s || typeof s !== 'object') return;
    const host = String(s.host || '').trim().toLowerCase();
    const port = parseInt(s.port, 10);
    if (!host || !(port >= 1 && port <= 65535)) return;
    servers.push({
      id: String(s.id || host + ':' + port), name: String(s.name || host).slice(0, 40), host, port,
      tls: !!s.tls, country: String(s.country || ''), lang: String(s.lang || ''), desc: String(s.desc || '').slice(0, 140),
      resetPeriod: String(s.resetPeriod || ''),
      online: (s.online === true || s.online === false) ? s.online : null,
      players: Number.isInteger(s.players) ? s.players : null
    });
  });
  return { acceptRequests: c.acceptRequests !== false, manualEntry: c.manualEntry !== false, localEntry: c.localEntry === true, servers };
}

/**
 * The list as shown: the « Local server » entry first when the admin keeps it
 * (and when no listed server already has that address), then the directory.
 * `local` = { host, port, tls } (window._pthLanDefaults()).
 */
export function withLocal(cfg, local, name) {
  if (!cfg) return null;
  if (!cfg.localEntry || !local || !local.host) return cfg;
  const host = String(local.host).trim().toLowerCase(), port = parseInt(local.port, 10) || 7234;
  if (matchEntry(cfg.servers, host, port)) return cfg;
  const entry = { id: 'local', name: name || 'Local server', host, port, tls: !!local.tls, country: '', lang: '', desc: '', online: null, players: null, local: true };
  return Object.assign({}, cfg, { servers: [entry].concat(cfg.servers) });
}
function _eff() {
  let d = null;
  try { d = window._pthLanDefaults ? window._pthLanDefaults() : null; } catch (e) {}
  return withLocal(_cfg, d, _t('lanDirLocal', null, 'Local server'));
}

/**
 * Leaderboard of the server at host:port: its directory entry id when it is a
 * listed server (its own board, server/lan-boards.js), else '' (the proxy's
 * historical board: local server, typed address).
 */
export function boardFor(host, port) {
  const s = _cfg ? matchEntry(_cfg.servers, host, port) : null;
  return s && /^lan_[a-f0-9]{6,32}$/.test(s.id) ? s.id : '';
}
/** { name, resetPeriod } of a listed server's board (or null). */
export function boardInfo(id) {
  const s = _cfg ? _cfg.servers.filter((x) => x.id === id)[0] : null;
  return s ? { name: s.name, resetPeriod: s.resetPeriod } : null;
}

/** Which entry the current #host / #port point at (or null). */
export function matchEntry(servers, host, port) {
  const h = String(host || '').trim().toLowerCase(), p = parseInt(port, 10);
  for (const s of servers || []) if (s.host === h && s.port === p) return s;
  return null;
}

/**
 * What the LAN form should look like. Pure: the tests drive it directly.
 * in: { cfg, isLan, host, port, remembered }  (remembered = the player or an
 *      invite link chose an address: do not override it with the first entry)
 * out: { show, list, propose, manual, empty, locked, select, apply }
 */
export function plan(input) {
  const cfg = input.cfg;
  const out = { show: false, list: false, propose: false, manual: false, empty: false, locked: false, select: '', apply: null };
  if (!input.isLan || !cfg) return out;
  const servers = cfg.servers;
  out.list = servers.length > 0 || !cfg.manualEntry;
  out.propose = !!cfg.acceptRequests;
  out.show = out.list || out.propose;
  out.manual = !!cfg.manualEntry && servers.length > 0;
  out.empty = !servers.length && !cfg.manualEntry;
  if (!servers.length) { out.locked = !cfg.manualEntry; return out; }
  const hit = matchEntry(servers, input.host, input.port);
  if (hit) { out.select = hit.id; out.locked = true; return out; }
  if (cfg.manualEntry && input.remembered) { out.select = MANUAL; return out; }
  // First visit (or manual entry off): the first server of the list, which the
  // proxy sorts online first.
  out.select = servers[0].id; out.apply = servers[0]; out.locked = true;
  return out;
}

function _isLan() {
  const lm = $('login-mode'), sm = $('server-mode');
  if (window._offlineMode) return false;
  return !!(lm && sm && (lm.value === 'lan' || lm.value === 'unauth') && sm.value === 'lan-dedi');
}
function _applyEntry(s) {
  if (!s) return;
  const h = $('host'), p = $('port'), tl = /** @type {HTMLInputElement|null} */ ($('use-tls'));
  if (h) /** @type {HTMLInputElement} */ (h).value = s.host;
  if (p) /** @type {HTMLInputElement} */ (p).value = String(s.port);
  if (tl) tl.checked = !!s.tls;
}
// Leaderboard reset period of a listed server (server/lan-boards.js): shown
// once, on its own line under the status line (the option labels carry the
// server name only).
const RESET_KEYS = { daily: 'lanResetDaily', weekly: 'lanResetWeekly', monthly: 'lanResetMonthly', yearly: 'lanResetYearly', off: 'lanResetOff' };
export function resetLabel(p) { const k = RESET_KEYS[p]; return k ? _t(k) : ''; }
// Option label = the server name only; the status symbol in front keeps the
// online / offline / local hint, the details are in the lines under the list.
function _optionLabel(s) { return s.name || s.host; }
function _renderSelect(cfg, plan) {
  const sel = /** @type {HTMLSelectElement|null} */ ($('lan-dir-sel'));
  if (!sel) return;
  const frag = document.createDocumentFragment();
  cfg.servers.forEach((s) => {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = (s.local ? '★ ' : s.online === true ? '● ' : s.online === false ? '○ ' : '◌ ') + _optionLabel(s);
    frag.appendChild(o);
  });
  if (plan.manual) {
    const o = document.createElement('option');
    o.value = MANUAL; o.textContent = _t('lanDirManual', null, 'Enter an address…');
    frag.appendChild(o);
  }
  sel.textContent = '';
  sel.appendChild(frag);
  if (plan.select) sel.value = plan.select;
}
function _renderDetail(cfg, id) {
  const box = $('lan-dir-detail');
  if (!box) return;
  box.textContent = '';
  const s = cfg.servers.filter((x) => x.id === id)[0];
  if (!s) { box.style.display = 'none'; return; }
  box.style.display = '';
  const line = document.createElement('div');
  line.className = 'lan-dir-line';
  const dot = document.createElement('span');
  dot.className = 'lan-dir-dot ' + (s.local ? 'local' : s.online === true ? 'on' : s.online === false ? 'off' : 'unk');
  dot.setAttribute('aria-hidden', 'true');
  line.appendChild(dot);
  const bits = s.local ? [s.name, s.host + ':' + s.port] : [s.online === true ? _t('lanDirOnline', null, 'Online') : s.online === false ? _t('lanDirOfflineSt', null, 'Offline') : _t('lanDirUnknown', null, 'Status unknown')];
  if (s.country) bits.push(_country(s.country));
  if (s.lang) bits.push(_langLabel(s.lang));
  if (s.online && s.players != null) bits.push(_t('lanDirPlayers', { n: s.players }, 'Players: ' + s.players));
  if (s.tls) bits.push('TLS');
  line.appendChild(document.createTextNode(bits.join(' · ')));
  box.appendChild(line);
  // The board's reset period, a plain line styled like the status line.
  if (!s.local && s.resetPeriod) {
    const rl = document.createElement('div');
    rl.className = 'lan-dir-line lan-dir-reset';
    const ic = document.createElement('span');
    ic.className = 'lan-dir-ic';
    ic.setAttribute('aria-hidden', 'true');
    ic.textContent = '🏆';
    rl.appendChild(ic);
    rl.appendChild(document.createTextNode(_t('lanPropReset', null, 'Leaderboard reset') + ' — ' + resetLabel(s.resetPeriod)));
    box.appendChild(rl);
  }
  if (s.desc) {
    const d = document.createElement('div');
    d.className = 'lan-dir-desc';
    d.textContent = s.desc;
    box.appendChild(d);
  }
}

/** Re-derive the LAN block from the current form state. Safe to call often. */
export function sync() {
  const wrap = $('lan-dir');
  if (!wrap) return;
  const isLan = _isLan();
  const h = /** @type {HTMLInputElement|null} */ ($('host')), p = /** @type {HTMLInputElement|null} */ ($('port'));
  const remembered = !!(_ls('pth_lan_host') || window._shareLanTarget);
  const eff = _eff();
  const pl = plan({ cfg: eff, isLan, host: h ? h.value : '', port: p ? p.value : '', remembered });
  wrap.style.display = pl.show ? '' : 'none';
  const lw = $('lan-dir-sel-wrap'), em = $('lan-dir-empty'), pr = $('lan-dir-propose');
  if (lw) lw.style.display = (pl.list && !pl.empty) ? '' : 'none';
  if (em) em.style.display = pl.empty ? '' : 'none';
  if (pr) pr.style.display = pl.propose ? '' : 'none';
  try { document.body.classList.toggle('lan-dir-locked', !!(pl.show && pl.locked)); } catch (e) {}
  if (!pl.show || !eff) return;
  if (pl.apply) _applyEntry(pl.apply);
  if (eff.servers.length) {
    _renderSelect(eff, pl);
    _renderDetail(eff, pl.select);
  }
  if (isLan && Date.now() - _cfgAt > REFRESH_MS) refresh();
}

/** Directory block of /app-config (null on a proxy without the directory). */
export function setConfig(c) {
  _cfg = normalizeConfig(c);
  _cfgAt = Date.now();
  sync();
}

/** Fresh copy from GET /api/lan-directory (status, players). */
export function refresh() {
  if (_fetching) return Promise.resolve();
  _fetching = true;
  _cfgAt = Date.now();
  return fetch('/api/lan-directory', { cache: 'no-store' })
    .then((r) => r.ok ? r.json() : null)
    .then((d) => { if (d && d.ok) { _cfg = normalizeConfig(d); sync(); } })
    .catch(() => {})
    .then(() => { _fetching = false; });
}

function onSelect() {
  const sel = /** @type {HTMLSelectElement|null} */ ($('lan-dir-sel'));
  const eff = _eff();
  if (!sel || !eff) return;
  if (sel.value === MANUAL) {
    try { document.body.classList.remove('lan-dir-locked'); } catch (e) {}
    _renderDetail(eff, '');
    // Open the ⚙ block where the address fields live.
    const btn = $('conn-adv-btn');
    if (btn && !btn.classList.contains('open') && typeof window.toggleConnAdvanced === 'function') window.toggleConnAdvanced();
    try { const hi = $('host'); if (hi) hi.focus(); } catch (e) {}
    return;
  }
  const s = eff.servers.filter((x) => x.id === sel.value)[0];
  if (!s) return;
  _applyEntry(s);
  try { document.body.classList.add('lan-dir-locked'); } catch (e) {}
  _renderDetail(eff, s.id);
}

// ── Propose dialog ──────────────────────────────────────────────────────
function _field(id) { return /** @type {HTMLInputElement} */ ($(id)); }
function _values() {
  return {
    name: (_field('lan-prop-name').value || '').trim(),
    host: (_field('lan-prop-host').value || '').trim(),
    port: parseInt(_field('lan-prop-port').value, 10) || 0,
    tls: !!_field('lan-prop-tls').checked,
    country: (_field('lan-prop-country').value || ''),
    lang: (_field('lan-prop-lang').value || ''),
    desc: (_field('lan-prop-desc').value || '').trim(),
    resetPeriod: (_field('lan-prop-reset') && _field('lan-prop-reset').value) || 'monthly',
    maxPerIp: parseInt((_field('lan-prop-ipcap') && _field('lan-prop-ipcap').value) || '3', 10) || 3
  };
}
function _sig(v) { return [v.host.toLowerCase(), v.port, v.tls ? 1 : 0].join('|'); }
function _status(text, kind) {
  const el = $('lan-prop-status');
  if (!el) return;
  el.textContent = text || '';
  el.className = 'lan-prop-status' + (kind ? ' ' + kind : '');
  el.style.display = text ? '' : 'none';
}
/** Message for an error code of /api/lan-directory/* (translated). */
export function errorText(code) {
  const known = ['closed', 'host', 'port', 'dns', 'private', 'unreachable', 'notpokerth', 'listed', 'pending', 'full', 'limit', 'invalid', 'network'];
  const c = known.indexOf(code) >= 0 ? code : 'unreachable';
  return _t('lanErr_' + c);
}
function _updateSend() {
  const b = /** @type {HTMLButtonElement|null} */ ($('lan-prop-send'));
  const v = _values();
  if (b) b.disabled = !(_tested && _tested === _sig(v));
}
function _fillSelects() {
  const cs = /** @type {HTMLSelectElement|null} */ ($('lan-prop-country'));
  if (cs && cs.options.length <= 1) {
    const rows = COUNTRIES.map((c) => ({ c: c.toUpperCase(), n: _country(c.toUpperCase()) }))
      .filter((r) => r.n && r.n !== r.c)
      .sort((a, b) => a.n.localeCompare(b.n, _lang()));
    rows.forEach((r) => { const o = document.createElement('option'); o.value = r.c; o.textContent = r.n; cs.appendChild(o); });
  }
  const ls = /** @type {HTMLSelectElement|null} */ ($('lan-prop-lang'));
  if (ls && ls.options.length <= 1) {
    let codes = [];
    try { codes = (window.I18N && window.I18N.LANG_CODES) || []; } catch (e) {}
    codes.map((c) => ({ c, n: _langLabel(c) }))
      .sort((a, b) => a.n.localeCompare(b.n))
      .forEach((r) => { const o = document.createElement('option'); o.value = r.c; o.textContent = r.n; ls.appendChild(o); });
    try { const cur = _lang(); if (codes.indexOf(cur) >= 0) ls.value = cur; } catch (e) {}
  }
}
export function openPropose() {
  const dlg = $('lan-prop-dialog');
  if (!dlg) return;
  _fillSelects();
  const form = $('lan-prop-form'), sent = $('lan-prop-sent');
  if (form) form.style.display = '';
  if (sent) sent.style.display = 'none';
  _tested = '';
  _status('', '');
  _updateSend();
  dlg.style.display = '';
  try { _field('lan-prop-name').focus(); } catch (e) {}
}
export function closePropose() {
  const dlg = $('lan-prop-dialog');
  if (dlg) dlg.style.display = 'none';
}
function _post(path, body) {
  return fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then((r) => r.json().catch(() => ({ ok: false, error: 'network' })))
    .catch(() => ({ ok: false, error: 'network' }));
}
export function testPropose() {
  const v = _values();
  if (!v.host) { _status(errorText('host'), 'err'); return Promise.resolve(); }
  if (!v.port) { _status(errorText('port'), 'err'); return Promise.resolve(); }
  const b = /** @type {HTMLButtonElement|null} */ ($('lan-prop-test'));
  if (b) b.disabled = true;
  _status(_t('lanPropTesting', null, 'Testing…'), '');
  return _post('/api/lan-directory/test', { host: v.host, port: v.port, tls: v.tls }).then((d) => {
    if (b) b.disabled = false;
    if (d && d.ok && d.pokerth) {
      _tested = _sig(v);
      let msg = _t('lanPropOk', { ms: d.ms || 0 }, 'PokerTH server reachable');
      if (d.certUntrusted) msg += ' ' + _t('lanPropCertWarn');
      _status(msg, 'ok');
    } else {
      _tested = '';
      _status(errorText(d && d.ok ? (d.reachable ? 'notpokerth' : 'unreachable') : (d && d.error)), 'err');
    }
    _updateSend();
  });
}
export function sendPropose() {
  const v = _values();
  if (!(_tested && _tested === _sig(v))) { _updateSend(); return Promise.resolve(); }
  const b = /** @type {HTMLButtonElement|null} */ ($('lan-prop-send'));
  if (b) b.disabled = true;
  _status(_t('lanPropSending', null, 'Sending…'), '');
  return _post('/api/lan-directory/propose', v).then((d) => {
    if (d && d.ok) {
      const form = $('lan-prop-form'), sent = $('lan-prop-sent'), msg = $('lan-prop-sent-msg');
      if (msg) msg.textContent = _t('lanPropSentBody', { name: v.name || v.host });
      if (form) form.style.display = 'none';
      if (sent) sent.style.display = '';
      _tested = '';
      ['lan-prop-name', 'lan-prop-host', 'lan-prop-desc'].forEach((id) => { try { _field(id).value = ''; } catch (e) {} });
      return;
    }
    _status(errorText(d && d.error), 'err');
    _updateSend();
  });
}

function _wire() {
  const sel = $('lan-dir-sel');
  if (sel) sel.addEventListener('change', onSelect);
  ['lan-prop-host', 'lan-prop-port', 'lan-prop-tls'].forEach((id) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', () => { if (_tested && _tested !== _sig(_values())) { _tested = ''; _status('', ''); } _updateSend(); });
    el.addEventListener('change', () => { if (_tested && _tested !== _sig(_values())) { _tested = ''; _status('', ''); } _updateSend(); });
  });
  // TLS follows the usual encrypted port until the player touches the box.
  const port = $('lan-prop-port'), tlsBox = /** @type {HTMLInputElement|null} */ ($('lan-prop-tls'));
  if (port && tlsBox) {
    let touched = false;
    tlsBox.addEventListener('change', () => { touched = true; });
    port.addEventListener('input', () => { if (!touched) tlsBox.checked = (parseInt(/** @type {HTMLInputElement} */ (port).value, 10) === 7236); });
  }
  const dlg = $('lan-prop-dialog');
  if (dlg) dlg.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); closePropose(); } });
  try { if (typeof window._onLangChange === 'function') window._onLangChange(() => { const cs = $('lan-prop-country'); if (cs) while (cs.options.length > 1) cs.remove(1); sync(); }); } catch (e) {}
}

const LanDirUI = { setConfig, refresh, sync, openPropose, closePropose, testPropose, sendPropose, boardFor, boardInfo };
try {
  /** @type {any} */ (window).LanDirUI = LanDirUI;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _wire);
  else _wire();
  // /app-config may have been read before this module evaluated.
  if (window._lanDirCfg !== undefined) setConfig(window._lanDirCfg);
} catch (e) {}

export default LanDirUI;
