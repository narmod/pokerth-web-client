// PokerTH web client — tournament witness (2026-10-24).
//
// At a table opened by this site's tournament director, the client is a
// WITNESS: it sends the director a public summary of what it saw — for each
// hand, the stack of every player still in at its start, and the winner.
// Never its cards. The director compares it with its own journal; witnesses
// check a result, they never decide it (the Arena's lib/witness.mjs and
// docs/ARENA.md « Witnesses », narmod/pokerth-arena). The Arena is an
// application of its own: these requests go to this site's /arena/api,
// which relays them to it (server/arena-link.js, docs/ARENA_LINK.md).
//
// When: the director's table is recognised at the start of the game (game id
// and table name, GET /arena/api/table). The summary goes out every 10
// hands, when the player is out, at the end of the game and when the page is
// hidden (a later one replaces the earlier one on the server).
// Only through this site (LAN servers): never on pokerth.net nor in training.
// Option « td_witness » (Advanced options › Network), ON by default; the
// first time, one line in the chat says what is sent.
//
// Module AUTONOME: msg-hand.mjs only calls window._tdWitness hooks; without
// this module the game runs exactly as before.
//
// Arena « its own app » (web.325): the Arena is on another site, so its
// pages keep the personal codes in that site's browser storage. Its « Play
// on the web client » button opens this site with them in the fragment
// (#arena=<base64url JSON { v: 1, regs: { <key>: [{ nick, code }] } }>):
// takeHandoff() files them under pth_td_regs, as /arena does on the same
// site, and the fragment loses that part at once. The requests below stay on
// this site: the proxy relays them to the Arena.

const EVERY = 10;              // hands between two summaries
const MAX_BYTES = 60000;       // a keepalive request carries at most 64 KB
const TOLD = 'pth_td_witness_told';
const REGS = 'pth_td_regs';    // personal codes kept by /arena

// ── the codes handed over by the Arena (#arena=…) ──
const KEY_RE = /^[A-Za-z0-9_-]{8,40}$/;
const CODE_RE = /^[A-Za-z0-9-]{1,16}$/;
function fromB64url(v) {
  const b = String(v).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b + '==='.slice((b.length + 3) % 4));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
// hash: location.hash. Files the codes in storage; returns
// { taken: number of codes, rest: the hash without « arena » } or null when
// there is nothing for us.
export function takeHandoff(hash, storage) {
  let hp;
  try { hp = new URLSearchParams(String(hash || '').replace(/^#/, '')); } catch (e) { return null; }
  const raw = hp.get('arena');
  if (raw === null) return null;
  hp.delete('arena');
  const restS = hp.toString();
  const out = { taken: 0, rest: restS ? '#' + restS : '' };
  let data = null;
  try { data = raw.length <= 8000 ? JSON.parse(fromB64url(raw)) : null; } catch (e) { data = null; }
  if (!data || data.v !== 1 || !data.regs || typeof data.regs !== 'object') return out;
  let regs = {};
  try { regs = JSON.parse((storage && storage.getItem(REGS)) || '{}') || {}; } catch (e) { regs = {}; }
  for (const key of Object.keys(data.regs).slice(0, 20)) {
    if (!KEY_RE.test(key) || !Array.isArray(data.regs[key])) continue;
    let list = Array.isArray(regs[key]) ? regs[key].slice() : [];
    for (const r of data.regs[key].slice(0, 10)) {
      const nick = r && typeof r.nick === 'string' ? r.nick.trim().slice(0, 64) : '';
      const code = r && typeof r.code === 'string' ? r.code.trim() : '';
      if (!nick || !CODE_RE.test(code)) continue;
      list = list.filter((x) => String(x.nick).toLowerCase() !== nick.toLowerCase()).concat([{ nick, code }]);
      out.taken++;
    }
    if (list.length) regs[key] = list;
  }
  if (out.taken) { try { if (storage) storage.setItem(REGS, JSON.stringify(regs)); } catch (e) {} }
  return out;
}

export function createWitness(deps) {
  const d = Object.assign({
    fetch: (typeof fetch === 'function') ? fetch.bind(globalThis) : null,
    // Reading `localStorage` itself throws a SecurityError when storage is
    // blocked for the site (Edge/Chrome « block third-party data », some
    // privacy modes): no storage then, never a dead module (web.339).
    storage: (function () { try { return (typeof localStorage !== 'undefined') ? localStorage : null; } catch (e) { return null; } })(),
    enabled: () => true,          // the player's option
    online: () => true,           // a LAN game through this site
    myName: () => '',
    origin: '',
  }, deps || {});
  let cur = null;   // { gameId, name, key, witnesses, players: [], hands: [], winner, sent, lookup }

  function get(k) { try { return d.storage ? d.storage.getItem(k) : null; } catch (e) { return null; } }
  function set(k, v) { try { if (d.storage) d.storage.setItem(k, v); } catch (e) {} }

  // The personal code of this nickname, kept in this browser by /arena.
  function codeFor(key, nick) {
    try {
      const regs = JSON.parse(get(REGS) || '{}') || {};
      const hit = (regs[key] || []).find((r) => String(r.nick).toLowerCase() === String(nick).toLowerCase());
      return hit ? hit.code : null;
    } catch (e) { return null; }
  }

  function report() {
    if (!cur) return null;
    const players = cur.players.slice(0, 10);
    let hands = cur.hands.map((x) => [x.h].concat(players.map((p) => (x.s[p] != null ? x.s[p] : null))));
    // A table of a tournament on several tables: the code was kept under the
    // tournament's key (registration, check-in), not the table's.
    const code = codeFor(cur.key, d.myName()) || (cur.parentKey ? codeFor(cur.parentKey, d.myName()) : null);
    const body = (hs) => JSON.stringify({ nick: d.myName(), code: code || undefined, game: cur.gameId, name: cur.name,
      report: { players, hands: hs, winner: cur.winner || null, complete: !!cur.winner } });
    let s = body(hands);
    while (s.length > MAX_BYTES && hands.length > 1) { hands = hands.slice(Math.ceil(hands.length / 10)); s = body(hands); }
    return s;
  }

  function flush(beacon) {
    if (!cur || !cur.key || !d.enabled() || (!cur.hands.length && !cur.winner)) return false;
    if (cur.sent === cur.hands.length + (cur.winner ? 1 : 0)) return false;   // nothing new
    const s = report();
    if (!s) return false;
    cur.sent = cur.hands.length + (cur.winner ? 1 : 0);
    const url = d.origin + '/arena/api/t/' + encodeURIComponent(cur.key) + '/witness';
    try {
      if (beacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        if (navigator.sendBeacon(url, new Blob([s], { type: 'application/json' }))) return true;
      }
      if (d.fetch) d.fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: s, keepalive: true }).catch(() => {});
    } catch (e) {}
    return true;
  }

  // A new game: is it a tournament table?
  function onGameStart(g) {
    if (cur && cur.gameId !== g.gameId) flush(false);
    if (cur && cur.gameId === g.gameId) return;   // a rejoin of the same game
    cur = null;
    if (!g || !g.gameId || !g.name || !d.online() || !d.enabled() || !d.fetch) return;
    const c = { gameId: g.gameId, name: String(g.name), key: null, players: [], hands: [], winner: null, sent: 0 };
    cur = c;
    const url = d.origin + '/arena/api/table?game=' + encodeURIComponent(g.gameId) + '&name=' + encodeURIComponent(c.name);
    d.fetch(url, { cache: 'no-store' }).then((r) => (r && r.ok ? r.json() : null)).then((j) => {
      if (cur !== c || !j || !j.ok || !j.key || j.witnesses === 'off') { if (cur === c) cur = null; return; }
      c.key = j.key; c.witnesses = j.witnesses; c.parentKey = j.parentKey || null;
      // Once per browser: say what is sent.
      if (!get(TOLD) && typeof g.say === 'function') { set(TOLD, '1'); try { g.say('tdWitnessNotice'); } catch (e) {} }
    }).catch(() => { if (cur === c) cur = null; });
  }

  // stacks: { nick: stack } of the players still in at the start of the hand.
  function onHandStart(h) {
    if (!cur || !h || !Number.isInteger(h.hand) || h.hand < 1) return;
    const s = {};
    for (const nick of Object.keys(h.stacks || {})) {
      const v = Number(h.stacks[nick]);
      if (!nick || !Number.isInteger(v) || v < 0) continue;
      s[nick] = v;
      if (cur.players.indexOf(nick) < 0 && cur.players.length < 10) cur.players.push(nick);
    }
    if (!Object.keys(s).length) return;
    const prev = cur.hands.length ? cur.hands[cur.hands.length - 1] : null;
    cur.hands = cur.hands.filter((x) => x.h !== h.hand).concat([{ h: h.hand, s }]);
    if (cur.hands.length > 3000) cur.hands.shift();
    const me = d.myName();
    const meOut = prev && prev.s[me] != null && s[me] == null;   // I am out: say it now
    if (cur.key && (meOut || cur.hands.length % EVERY === 0)) flush(false);
  }

  function onGameOver(winner) {
    if (!cur) return;
    cur.winner = winner ? String(winner) : null;
    flush(false);
  }

  function onHide() { flush(true); }

  return { onGameStart, onHandStart, onGameOver, onHide, flush, report, state: () => cur };
}

// In the browser: one witness for the page.
if (typeof window !== 'undefined' && !window._tdWitness) {
  const w = createWitness({
    enabled: () => { try { return typeof window._advGet === 'function' ? window._advGet('td_witness', true) : true; } catch (e) { return true; } },
    online: () => !window._offlineMode && !window.directWS,
    myName: () => { try { return (window.S && window.S.myName) || (window.PthState && window.PthState.myName) || ''; } catch (e) { return ''; } },
    origin: (typeof location !== 'undefined' && location.origin) || '',
  });
  window._tdWitness = w;
  // The codes handed over by the Arena's « Play on the web client » button.
  const handoff = () => {
    try {
      const r = takeHandoff(location.hash, typeof localStorage !== 'undefined' ? localStorage : null);
      if (r) history.replaceState(history.state, '', location.pathname + location.search + r.rest);
    } catch (e) {}
  };
  handoff();
  try { window.addEventListener('hashchange', handoff); } catch (e) {}
  try {
    window.addEventListener('pagehide', () => w.onHide());
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') w.onHide(); });
  } catch (e) {}
}
