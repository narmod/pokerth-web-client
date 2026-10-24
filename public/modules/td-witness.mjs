// PokerTH web client — tournament witness (2026-10-24).
//
// At a table opened by this site's tournament director, the client is a
// WITNESS: it sends the director a public summary of what it saw — for each
// hand, the stack of every player still in at its start, and the winner.
// Never its cards. The director compares it with its own journal; witnesses
// check a result, they never decide it (tournament/lib/witness.mjs,
// docs/TOURNAMENT_DIRECTOR.md « Witnesses »).
//
// When: the director's table is recognised at the start of the game (game id
// and table name, GET /tournament/api/table). The summary goes out every 10
// hands, when the player is out, at the end of the game and when the page is
// hidden (a later one replaces the earlier one on the server).
// Only through this site (LAN servers): never on pokerth.net nor in training.
// Option « td_witness » (Advanced options › Network), ON by default; the
// first time, one line in the chat says what is sent.
//
// Module AUTONOME: msg-hand.mjs only calls window._tdWitness hooks; without
// this module the game runs exactly as before.

const EVERY = 10;              // hands between two summaries
const MAX_BYTES = 60000;       // a keepalive request carries at most 64 KB
const TOLD = 'pth_td_witness_told';
const REGS = 'pth_td_regs';    // personal codes kept by /tournament

export function createWitness(deps) {
  const d = Object.assign({
    fetch: (typeof fetch === 'function') ? fetch.bind(globalThis) : null,
    storage: (typeof localStorage !== 'undefined') ? localStorage : null,
    enabled: () => true,          // the player's option
    online: () => true,           // a LAN game through this site
    myName: () => '',
    origin: '',
  }, deps || {});
  let cur = null;   // { gameId, name, key, witnesses, players: [], hands: [], winner, sent, lookup }

  function get(k) { try { return d.storage ? d.storage.getItem(k) : null; } catch (e) { return null; } }
  function set(k, v) { try { if (d.storage) d.storage.setItem(k, v); } catch (e) {} }

  // The personal code of this nickname, kept in this browser by /tournament.
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
    const url = d.origin + '/tournament/api/t/' + encodeURIComponent(cur.key) + '/witness';
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
    const url = d.origin + '/tournament/api/table?game=' + encodeURIComponent(g.gameId) + '&name=' + encodeURIComponent(c.name);
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
  try {
    window.addEventListener('pagehide', () => w.onHide());
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') w.onHide(); });
  } catch (e) {}
}
