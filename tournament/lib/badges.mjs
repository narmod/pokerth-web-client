// ═══════════════════════════════════════════════════════════════════
// Tournament director — medals (service 0.14.0, 2026-10-24).
//
// Gold, silver and bronze for the first three of a tournament and of a cup,
// derived from the signed results each time (never stored): a correction
// moves a medal by itself. Only results that mean something earn one:
//   a tournament  validated, profile Club, Official or Custom (not
//                 Friendly), at least 4 players ranked, the tournament itself
//                 (not one of the tables of a tournament on several tables)
//   a cup         closed (standings signed), at least 2 validated tournaments
// A shared place gives each player of it the medal of that place. Rebuilt
// as soon as a tournament or a cup is saved (`stamp`), else every `ttlMs`.
// Private tournaments and cups give no public medal; unlisted ones give a
// medal without their link.
//
// Read by the players' page (/tournament/p/<nick>) and by anyone else: the
// public API (/tournament/api/players/<nick>, /tournament/api/badges) has a
// stable shape (`v: 1`) and allows any origin, so a client (web, QML) or
// another site can show them. Design: docs/TOURNAMENT_DIRECTOR.md (Medals).
// ═══════════════════════════════════════════════════════════════════

export const BADGES_VERSION = 1;
export const MIN_PLAYERS = 4;
const MEDAL = { 1: 'gold', 2: 'silver', 3: 'bronze' };
const low = (s) => String(s == null ? '' : s).toLowerCase();

export function createBadges(o) {
  const ttl = o.ttlMs != null ? o.ttlMs : 30000;
  const now = o.now || (() => Date.now());
  const stamp = o.stamp || (() => '');
  let memo = null, memoAt = 0, memoStamp = '';

  function build() {
    const players = new Map();   // low nick → { nick, medals: [], results: [] }
    const row = (nick) => { const k = low(nick); if (!players.has(k)) players.set(k, { nick, medals: [], results: [] }); return players.get(k); };
    for (const t of o.tournaments()) {
      if (t.parentId || t.status !== 'validated' || !t.result || !t.settings || t.settings.visibility === 'private') continue;
      const ranked = t.result.ranking || [];
      const pub = t.settings.visibility === 'public';
      const counts = t.profile !== 'friendly' && ranked.length >= MIN_PLAYERS;
      for (const r of ranked) {
        const entry = { kind: 'tournament', name: t.name, key: pub ? t.publicKey : null, place: r.place, of: ranked.length, at: t.validatedAt || t.updatedAt || null, profile: t.profile };
        const p = row(r.nick);
        p.results.push(entry);
        if (counts && MEDAL[r.place]) p.medals.push(Object.assign({ medal: MEDAL[r.place] }, entry));
      }
    }
    for (const c of o.cups()) {
      if (c.status !== 'closed' || c.visibility === 'private' || !Array.isArray(c.final)) continue;
      const validated = c.validatedCount != null ? c.validatedCount : (c.events || []).length;
      const pub = c.visibility === 'public';
      for (const r of c.final) {
        const entry = { kind: 'cup', name: c.name, key: pub ? c.publicKey : null, place: r.place, of: c.final.length, at: c.closedAt || null, points: r.total };
        const p = row(r.nick);
        p.results.push(entry);
        if (validated >= 2 && MEDAL[r.place]) p.medals.push(Object.assign({ medal: MEDAL[r.place] }, entry));
      }
    }
    for (const p of players.values()) {
      // Cups first, then the latest.
      p.medals.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'cup' ? -1 : 1) || (b.at || 0) - (a.at || 0) || a.place - b.place);
      p.results.sort((a, b) => (b.at || 0) - (a.at || 0));
      p.counts = { gold: 0, silver: 0, bronze: 0 };
      for (const m of p.medals) p.counts[m.medal]++;
    }
    return players;
  }
  function all() {
    const s = String(stamp());
    if (!memo || s !== memoStamp || now() - memoAt > ttl) { memo = build(); memoAt = now(); memoStamp = s; }
    return memo;
  }
  function clear() { memo = null; }

  // One player: medals, counts, every result (tournaments and cups).
  function player(nick) {
    const p = all().get(low(nick));
    return { v: BADGES_VERSION, nick: p ? p.nick : String(nick), counts: p ? p.counts : { gold: 0, silver: 0, bronze: 0 }, medals: p ? p.medals : [], results: p ? p.results.slice(0, 200) : [] };
  }
  // Several players at once (a lobby, a table): counts and the latest medals.
  function many(nicks) {
    const out = {};
    for (const n of (nicks || []).slice(0, 100)) {
      const p = all().get(low(n));
      if (p && p.medals.length) out[p.nick] = { counts: p.counts, latest: p.medals.slice(0, 3).map((m) => ({ medal: m.medal, kind: m.kind, name: m.name, key: m.key })) };
    }
    return { v: BADGES_VERSION, players: out };
  }
  // Everyone with a medal (another site, a scoreboard).
  function everyone() {
    const rows = [...all().values()].filter((p) => p.medals.length)
      .map((p) => ({ nick: p.nick, counts: p.counts }))
      .sort((a, b) => b.counts.gold - a.counts.gold || b.counts.silver - a.counts.silver || b.counts.bronze - a.counts.bronze || a.nick.localeCompare(b.nick));
    return { v: BADGES_VERSION, rules: { minPlayers: MIN_PLAYERS, profiles: ['club', 'official', 'custom'], cupsMinTournaments: 2 }, players: rows };
  }
  return { player, many, everyone, clear };
}
