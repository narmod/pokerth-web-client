// ═══════════════════════════════════════════════════════════════════
// Arena — who may register (service 0.26.0, 2026-10-24).
//
// Conditions an organizer puts on a tournament or a cup, combined (all must
// hold), checked at every registration made on the players' page. The
// organizer adding a player himself, and the qualifiers of a cup's steps or
// final, are not held back by them: the organizer decides, a qualification
// is earned.
//
//   identity        'account': a signed-in player account
//   minTournaments  at least N tournaments played here (validated results)
//   maxTournaments  at most N (cups and tournaments for beginners)
//   minPoints       at least X points: each validated tournament (not
//                   Friendly) gives the players finished behind + 1, as cups
//   medal           'any' | 'gold': at least one medal (of gold)
//   noMedal         never a medal (beginners)
//   cup             { id, top }: within the first `top` of that cup's standings
//
// The facts come from the signed results of this install only (decided
// 2026-10-24). A refusal lists what is missing, with what the player has,
// so the page can say « 10 tournaments needed, you have 4 ».
// ═══════════════════════════════════════════════════════════════════

import { pointsFor } from './cups.mjs';

const int = (v, min, max) => { const x = parseInt(v, 10); return Number.isInteger(x) ? Math.min(max, Math.max(min, x)) : null; };

// The organizer's conditions, put in order; null when there are none.
export function cleanAccess(a) {
  if (!a || typeof a !== 'object') return null;
  const out = {};
  if (a.identity === 'account') out.identity = 'account';
  const mn = int(a.minTournaments, 0, 1000); if (mn) out.minTournaments = mn;
  const mx = int(a.maxTournaments, 0, 1000); if (mx != null && a.maxTournaments !== '' && a.maxTournaments != null) out.maxTournaments = mx;
  const mp = int(a.minPoints, 0, 1000000); if (mp) out.minPoints = mp;
  if (a.medal === 'any' || a.medal === 'gold') out.medal = a.medal;
  if (a.noMedal === true) out.noMedal = true;
  if (out.medal && out.noMedal) delete out.noMedal;
  if (a.cup && a.cup.id && /^[a-z0-9]{6,32}$/.test(String(a.cup.id))) { const top = int(a.cup.top, 1, 1000); if (top) out.cup = { id: String(a.cup.id), top, name: String(a.cup.name || '').slice(0, 60) }; }
  if (out.minTournaments != null && out.maxTournaments != null && out.minTournaments > out.maxTournaments) delete out.maxTournaments;
  return Object.keys(out).length ? out : null;
}

/**
 * What the results say of one player.
 * deps: { tournaments: () => [t], medals: (nick) => { gold, silver, bronze }, cupPlace: (cupId, nick) => place | null }
 */
export function playerFacts(nick, deps) {
  const k = String(nick || '').toLowerCase();
  let tournaments = 0, points = 0;
  for (const t of deps.tournaments()) {
    if (t.parentId || t.status !== 'validated' || !t.result || !Array.isArray(t.result.ranking)) continue;
    const pts = pointsFor(t.result.ranking);
    const me = pts.get(k);
    if (!me) continue;
    tournaments += 1;
    if (t.profile !== 'friendly') points += me.points;
  }
  const m = (deps.medals && deps.medals(nick)) || { gold: 0, silver: 0, bronze: 0 };
  return { tournaments, points: Math.round(points * 10) / 10, medals: m, cupPlace: (id) => (deps.cupPlace ? deps.cupPlace(id, nick) : null) };
}

/**
 * The conditions against one player: [] when he may register, else what is
 * missing: { code, need, have, name? }.
 * who: { account: bool }
 */
export function missingFor(rules, facts, who) {
  const miss = [];
  if (!rules) return miss;
  if (rules.identity === 'account' && !(who && who.account)) miss.push({ code: 'account' });
  if (rules.minTournaments && facts.tournaments < rules.minTournaments) miss.push({ code: 'minTournaments', need: rules.minTournaments, have: facts.tournaments });
  if (rules.maxTournaments != null && facts.tournaments > rules.maxTournaments) miss.push({ code: 'maxTournaments', need: rules.maxTournaments, have: facts.tournaments });
  if (rules.minPoints && facts.points < rules.minPoints) miss.push({ code: 'minPoints', need: rules.minPoints, have: facts.points });
  const medals = facts.medals.gold + facts.medals.silver + facts.medals.bronze;
  if (rules.medal === 'any' && !medals) miss.push({ code: 'medal' });
  if (rules.medal === 'gold' && !facts.medals.gold) miss.push({ code: 'gold' });
  if (rules.noMedal && medals) miss.push({ code: 'noMedal', have: medals });
  if (rules.cup) {
    const place = facts.cupPlace(rules.cup.id);
    if (!(place && place <= rules.cup.top)) miss.push({ code: 'cup', need: rules.cup.top, have: place || null, name: rules.cup.name || '' });
  }
  return miss;
}

// The same in plain English, for the organizer side and the logs.
export function describeMissing(miss) {
  return miss.map((m) => ({
    account: 'a player account (sign in)',
    minTournaments: m.need + ' tournaments played here (you have ' + m.have + ')',
    maxTournaments: 'at most ' + m.need + ' tournaments played (you have ' + m.have + ')',
    minPoints: m.need + ' points (you have ' + m.have + ')',
    medal: 'a medal',
    gold: 'a gold medal',
    noMedal: 'no medal yet (you have ' + m.have + ')',
    cup: 'a place in the first ' + m.need + ' of the cup « ' + m.name + ' »' + (m.have ? ' (you are ' + m.have + ')' : ''),
  }[m.code] || m.code)).join('; ');
}
