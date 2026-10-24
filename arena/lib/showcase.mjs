// ═══════════════════════════════════════════════════════════════════
// Arena — the home page, a showcase of what is on (service 0.31.0,
// 2026-10-24; step 2 of the app's redesign).
//
// Everything public, in sections the super admin turns on and orders
// (/arena/organize › Home page):
//   message      a word from the site (a title and a few lines), off by default
//   live         the tables open right now on the LAN servers of this install
//                (their lobbies, read at most once a minute per server)
//   tournaments  this site's tournaments playing, open for registration, coming
//   community    what is coming up on the community sites (BBC, WEC, Monthly
//                Cup) and who won last — the web client's Events relay
//   results      this site's last validated tournaments, with their podium
//   cups         the cups running, with their leader
//   groups       the groups and how many members each has
// GET /arena/api/showcase answers with the sections turned on, in order,
// each with what it shows (nothing private: unlisted and private tournaments
// and cups never appear; private tables of a lobby show without their name).
//
// Stored in ARENA_DIR/showcase.json.
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';

export const SECTIONS = Object.freeze(['message', 'live', 'tournaments', 'community', 'results', 'cups', 'groups']);
const DEFAULT_ON = { message: false, live: true, tournaments: true, community: true, results: true, cups: true, groups: true };
const LOBBY_TTL = 60 * 1000, LOBBY_WAIT = 2500, EVENTS_TTL = 60 * 1000, EVENTS_WAIT = 2500;
// 22:00 in Berlin (the community sites' time) today and tomorrow, as epochs.
const WEC_HOUR = 22, SITE_TZ = 'Europe/Berlin';
function zoned(y, m, d, h, mi, tz) {
  let at = Date.UTC(y, m - 1, d, h, mi);
  for (let i = 0; i < 3; i++) {
    const p = {};
    try { new Intl.DateTimeFormat('en-GB', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(at)).forEach((x) => { p[x.type] = x.value; }); } catch (e) { return at; }
    const seen = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
    const want = Date.UTC(y, m - 1, d, h, mi);
    if (seen === want) break;
    at += want - seen;
  }
  return at;
}
export function wecDaily(t) {
  const out = [];
  for (let i = 0; i < 2; i++) {
    const d = new Date(t + i * 86400000);
    let y, m, dd;
    try { const p = {}; new Intl.DateTimeFormat('en-GB', { timeZone: SITE_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d).forEach((x) => { p[x.type] = x.value; }); y = +p.year; m = +p.month; dd = +p.day; } catch (e) { y = d.getUTCFullYear(); m = d.getUTCMonth() + 1; dd = d.getUTCDate(); }
    out.push(zoned(y, m, dd, WEC_HOUR, 0, SITE_TZ));
  }
  return out;
}
const clean = (s, max) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, max);

/**
 * o: { dir, Refusal, now?,
 *      servers: async () => [server], lobby: async (ref) => { ok, games, server, serverType },
 *      tournaments: () => [raw tournament], tournamentCards: () => [public card],
 *      cups: () => [public cup card], groups: () => [public group], events: async () => data | null }
 */
export function createShowcase(o) {
  const file = path.join(o.dir, 'showcase.json');
  const now = o.now || (() => Date.now());
  const Refusal = o.Refusal || class extends Error {};
  const refuse = (m) => { throw new Refusal(m); };
  let cfg = null;
  function read() {
    if (cfg) return cfg;
    let j = null;
    try { j = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { j = null; }
    cfg = normalize(j || {});
    return cfg;
  }
  function normalize(j) {
    const seen = new Set();
    const list = (Array.isArray(j.sections) ? j.sections : []).filter((s) => s && SECTIONS.indexOf(s.id) >= 0 && !seen.has(s.id) && seen.add(s.id)).map((s) => ({ id: s.id, on: s.on === true }));
    for (const id of SECTIONS) if (!seen.has(id)) list.push({ id, on: DEFAULT_ON[id] });
    const m = j.message || {};
    return { sections: list, message: { title: clean(m.title, 80), text: clean(m.text, 600) }, max: Math.min(12, Math.max(3, parseInt(j.max, 10) || 6)) };
  }
  function settings() { return JSON.parse(JSON.stringify(read())); }
  function setSettings(input, by) {
    if (!input || typeof input !== 'object') refuse('nothing to save');
    const next = normalize(Object.assign({}, read(), input, { message: Object.assign({}, read().message, input.message || {}) }));
    if (next.sections.find((s) => s.id === 'message').on && !next.message.title && !next.message.text) refuse('the message is on: write a title or a few lines');
    cfg = next;
    fs.mkdirSync(o.dir, { recursive: true });
    const tmp = file + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(Object.assign({ by: by || null, at: now() }, cfg)));
    fs.renameSync(tmp, file);
    return settings();
  }

  // ── the lobbies of the LAN servers: once a minute per server at most ──
  const lobbies = new Map();   // ref → { at, data, pending }
  function lobbyOf(s) {
    let c = lobbies.get(s.ref);
    if (!c) { c = { at: 0, data: null, pending: null }; lobbies.set(s.ref, c); }
    if (!c.pending && now() - c.at >= LOBBY_TTL) {
      c.pending = Promise.resolve().then(() => o.lobby(s.ref)).catch(() => null).then((d) => { c.at = now(); c.data = d; c.pending = null; return d; });
    }
    return c;
  }
  const within = (p, ms, fallback) => Promise.race([p, new Promise((r) => setTimeout(() => r(fallback), ms))]);
  async function live(max) {
    let servers = [];
    try { servers = (await o.servers()) || []; } catch (e) { servers = []; }
    servers = servers.filter((s) => s && s.kind !== 'internet');
    const rows = await Promise.all(servers.map(async (s) => {
      const c = lobbyOf(s);
      const d = c.pending && !c.data ? await within(c.pending, LOBBY_WAIT, null) : c.data;
      if (!d || !d.ok || d.serverType === 'internetAuth') return { server: s.name, ok: false, games: [] };
      const games = (d.games || []).map((g) => ({ name: g.isPrivate ? null : g.name, private: !!g.isPrivate, mode: g.mode, players: g.players, max: g.maxPlayers, spectators: g.spectators || 0, type: g.gameType || null }));
      return { server: s.name, ok: true, online: Number.isFinite(d.players) ? d.players : null, games };
    }));
    // Started tables first, then the ones waiting for players.
    const games = [];
    for (const r of rows) for (const g of r.games) games.push(Object.assign({ server: r.server }, g));
    games.sort((a, b) => (a.mode === b.mode ? b.players - a.players : a.mode === 'started' ? -1 : 1));
    return { servers: rows.map((r) => ({ name: r.server, ok: r.ok, online: r.online != null ? r.online : null, tables: r.games.length })), games: games.slice(0, max * 2) };
  }

  // ── the community sites (the web client's Events relay) ──
  let ev = { at: 0, data: null, pending: null };
  async function community(max) {
    if (!o.events) return null;
    if (!ev.pending && now() - ev.at >= EVENTS_TTL) {
      ev.pending = Promise.resolve().then(() => o.events()).catch(() => null).then((d) => { ev.at = now(); if (d) ev.data = d; ev.pending = null; return d; });
    }
    const d = ev.pending && !ev.data ? await within(ev.pending, EVENTS_WAIT, null) : ev.data;
    if (!d || d.ok === false && !(d.upcoming || []).length) return null;
    const t = now();
    const http = (u) => (typeof u === 'string' && /^https:\/\/[a-z0-9.-]+\.pokerth\.net(\/|$)/.test(u) ? u : null);
    const num = (v) => (Number.isFinite(v) ? v : null);
    // The WEC game of every evening (22:00, site time; no registration —
    // sp0ck, 2026-09-28), as the web client's Events window adds it.
    const daily = wecDaily(t).map((at) => ({ src: 'wec', kind: 'daily', at, url: 'https://wec.pokerth.net/' }));
    const upcoming = (d.upcoming || []).concat(daily).filter((u) => typeof u.at === 'number' && u.at > t - 2 * 3600 * 1000)
      .sort((a, b) => a.at - b.at).slice(0, max).map((u) => ({
        src: String(u.src || '').slice(0, 8), kind: String(u.kind || '').slice(0, 12), at: u.at, step: num(u.step), title: u.title ? String(u.title).slice(0, 80) : null,
        signups: num(u.signups), seats: num(u.seats), month: num(u.month), year: num(u.year), grand: !!u.grand, url: http(u.url) }));
    const results = (d.results || []).slice(0, 3).map((r) => ({ src: String(r.src || '').slice(0, 8), at: num(r.at), id: num(r.id), month: num(r.month), year: num(r.year),
      podium: (Array.isArray(r.podium) ? r.podium : []).filter((x) => typeof x === 'string').slice(0, 3), players: num(r.players), url: http(r.url) }));
    const champions = d.champions && Array.isArray(d.champions.top) ? { top: d.champions.top.slice(0, 3).map((c) => ({ player: String(c.player || '').slice(0, 64), score: num(c.score) })), url: http(d.champions.url) } : null;
    return { upcoming, results, champions };
  }

  // ── this site ──
  function tournaments(max) {
    const cards = o.tournamentCards();
    const by = (ph) => cards.filter((c) => ph(c)).sort((a, b) => (a.startsAt || Infinity) - (b.startsAt || Infinity));
    return {
      playing: by((c) => c.phase === 'table').slice(0, max),
      open: by((c) => c.phase === 'upcoming' && c.registration === 'open').slice(0, max),
      coming: by((c) => c.phase === 'upcoming' && c.registration !== 'open').slice(0, max),
    };
  }
  function results(max) {
    return o.tournaments().filter((t) => !t.parentId && t.settings && t.settings.visibility === 'public' && t.status === 'validated' && t.result && Array.isArray(t.result.ranking))
      .map((t) => ({ t, at: t.validatedAt || t.result.setAt || t.startsAt || t.createdAt }))
      .sort((a, b) => b.at - a.at).slice(0, max)
      .map(({ t, at }) => ({ key: t.publicKey, name: t.name, at, players: t.players.filter((p) => !p.absent).length, profile: t.profile,
        podium: t.result.ranking.filter((r) => r.place <= 3).sort((a, b) => a.place - b.place).slice(0, 3).map((r) => ({ place: r.place, nick: r.nick })) }));
  }
  function cups(max) {
    return o.cups().filter((c) => c.status !== 'closed').slice(0, max).map((c) => ({ key: c.key, name: c.name, leader: c.leader, events: c.events, validated: c.validated, from: c.from, to: c.to, thumb: c.thumb }));
  }
  function groups(max) {
    const g = o.groups();
    return { count: g.length, list: g.slice().sort((a, b) => b.members.length - a.members.length).slice(0, max).map((x) => ({ name: x.name, join: x.join, members: x.members.length })) };
  }

  async function build() {
    const c = read(), max = c.max;
    const out = [];
    for (const s of c.sections) {
      if (!s.on) continue;
      try {
        if (s.id === 'message') { if (c.message.title || c.message.text) out.push({ id: 'message', title: c.message.title, text: c.message.text }); }
        else if (s.id === 'live') out.push(Object.assign({ id: 'live' }, await live(max)));
        else if (s.id === 'tournaments') out.push(Object.assign({ id: 'tournaments' }, tournaments(max)));
        else if (s.id === 'community') { const d = await community(max); if (d) out.push(Object.assign({ id: 'community' }, d)); }
        else if (s.id === 'results') out.push({ id: 'results', list: results(max) });
        else if (s.id === 'cups') out.push({ id: 'cups', list: cups(max) });
        else if (s.id === 'groups') out.push(Object.assign({ id: 'groups' }, groups(max)));
      } catch (e) { /* one section failing never takes the page down */ }
    }
    return { at: now(), sections: out };
  }

  return { settings, setSettings, build, clear: () => { cfg = null; } };
}
