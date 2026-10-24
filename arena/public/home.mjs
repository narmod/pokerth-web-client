// ═══════════════════════════════════════════════════════════════════
// /arena — the home page, a showcase of what is on (service 0.31.0).
//
// Draws GET /arena/api/showcase: the sections the super admin turned on, in
// his order (arena/lib/showcase.mjs). Rows after the web client's Events
// window (public/modules/ui/forum-events.mjs): a coloured badge for where it
// happens (BBC, WEC, Monthly Cup, this site, a LAN server), what it is, and
// when — « today · 24 Oct · 22:00 », in the player's language and zone.
// The community sites' links open in a new tab; this site's stay in the app.
// ═══════════════════════════════════════════════════════════════════

const DAY = 86400000;
const SRC = { bbc: ['BBC', 'c0'], wec: ['WEC', 'c1'], mc: ['MC', 'c5'], arena: ['Arena', 'c3'], lan: ['LAN', 'c7'] };
const MEDAL = ['🥇', '🥈', '🥉'];

function dayStart(ms) { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); }
// « today · 24 Oct · 22:00 », « tomorrow · 25 Oct · 21:00 », « Sat, 31 Oct · 20:00 »
// (the same as the Events window's evWhen: a relative word always with its date).
export function whenText(ms, now, locale) {
  if (typeof ms !== 'number' || !isFinite(ms)) return '';
  let time = '';
  try { time = new Date(ms).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }); } catch (e) { time = ''; }
  const days = Math.round((dayStart(ms) - dayStart(now)) / DAY);
  let day = '';
  if (days >= -1 && days <= 1) {
    try { day = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(days, 'day'); } catch (e) { day = ''; }
    if (day) { let date = ''; try { date = new Date(ms).toLocaleDateString(locale, { day: 'numeric', month: 'short' }); } catch (e) {} if (date) day += ' · ' + date; }
  }
  if (!day) { try { day = new Date(ms).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' }); } catch (e) { day = ''; } }
  return day && time ? day + ' · ' + time : (day || time);
}
function dateText(ms, locale) { try { return new Date(ms).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } }
function monthName(m, locale, year) { if (!(m >= 1 && m <= 12)) return ''; try { return new Date(Date.UTC(year || 2026, m - 1, 15)).toLocaleDateString(locale, { month: 'long', timeZone: 'UTC' }); } catch (e) { return String(m); } }

/**
 * deps: { esc, t, T, lang, card(c), nickLink(nick) }
 */
export function homeHtml(data, deps) {
  const { esc, t, T, lang, card, nickLink } = deps;
  const now = Date.now();
  const badge = (src, label) => { const s = SRC[src] || [String(src || '').toUpperCase(), 'c7']; return '<span class="evb ' + s[1] + '"' + (src === 'mc' ? ' title="Monthly Cup"' : '') + '>' + esc(label || s[0]) + '</span>'; };
  const row = (b, main, sub, side, href, ext) => {
    const inner = b + '<span class="evm"><span class="evt">' + main + '</span>' + (sub ? '<span class="evs">' + sub + '</span>' : '') + '</span>' + (side ? '<span class="evw">' + side + '</span>' : '');
    if (!href) return '<li class="evr">' + inner + '</li>';
    return '<li><a class="evr" href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : ' data-go') + '>' + inner + '</a></li>';
  };
  // This site's players link to their page; the community sites' are names only.
  const podium = (list, own) => list.map((p, i) => '<span class="pod">' + MEDAL[(p.place || i + 1) - 1] + ' ' + (own ? nickLink(p.nick) : esc(p.nick)) + '</span>').join(' ');
  const more = (href, label) => '<p class="evmore"><a href="' + href + '" data-go>' + T(label) + ' →</a></p>';
  const out = [];
  for (const s of (data && data.sections) || []) {
    if (s.id === 'message') {
      out.push('<section class="card home-msg">' + (s.title ? '<h2>' + esc(s.title) + '</h2>' : '') + (s.text ? s.text.split(/\n+/).map((p) => '<p>' + esc(p) + '</p>').join('') : '') + '</section>');
    } else if (s.id === 'live') {
      let h = '<section class="card"><h2>' + T('homeLive') + '</h2>';
      if (s.games.length) {
        h += '<ul class="evl">' + s.games.map((g) => row(badge('lan', g.server), g.name ? esc(g.name) : '<i>' + T('homePrivate') + '</i>',
          T('homeTableLine', { n: g.players, max: g.max }) + (g.spectators ? ' · ' + T('homeSpectators', { n: g.spectators }) : ''),
          '<span class="chip ' + (g.mode === 'started' ? 'live' : 'open') + '">' + T(g.mode === 'started' ? 'homePlaying' : 'homeWaiting') + '</span>')).join('') + '</ul>';
      } else h += '<p class="empty">' + T('homeNoTable') + '</p>';
      const on = s.servers.filter((x) => x.ok && x.online != null);
      if (on.length) h += '<p class="small muted">' + on.map((x) => T('homeOnline', { server: x.name, n: x.online })).join(' · ') + '</p>';
      out.push(h + '</section>');
    } else if (s.id === 'tournaments') {
      const parts = [['secLive', s.playing], ['secOpen', s.open], ['secUpcoming', s.coming]].filter((p) => p[1].length);
      let h = '<section class="card"><h2>' + T('homeTournaments') + '</h2>';
      h += parts.length ? parts.map((p) => '<h3>' + T(p[0]) + '</h3><ul class="tlist">' + p[1].map(card).join('') + '</ul>').join('') : '<p class="empty">' + T('none') + '</p>';
      out.push(h + more('/arena/tournaments', 'allTournaments') + '</section>');
    } else if (s.id === 'community') {
      let h = '<section class="card"><h2>' + T('homeCommunity') + '</h2>';
      if (s.upcoming.length) h += '<ul class="evl">' + s.upcoming.map((u) => {
        let main = '', sub = '';
        if (u.src === 'bbc') { main = u.step ? T('homeStep', { n: u.step }) : esc(u.title || 'BBC'); if (u.signups != null) sub = T('homeSignups', { n: u.signups, max: u.seats || 10 }); }
        else if (u.src === 'wec' && u.kind === 'daily') main = T('homeWecDaily');
        else if (u.src === 'wec') { main = T(u.grand ? 'homeWecGrand' : 'homeWecFinal'); if (u.month) sub = esc(monthName(u.month, lang, u.year)); }
        else if (u.src === 'mc') { main = T('homeMcCup', { month: monthName(u.month, lang, u.year) }); if (u.signups != null && u.seats) sub = T('homeSignups', { n: u.signups, max: u.seats }); }
        else main = esc(u.title || u.src);
        return row(badge(u.src), main, sub, esc(whenText(u.at, now, lang)), u.url, true);
      }).join('') + '</ul>';
      if (s.results.length) h += '<h3>' + T('homeLastWinners') + '</h3><ul class="evl">' + s.results.map((r) => row(badge(r.src), podium(r.podium.map((n, i) => ({ place: i + 1, nick: n }))),
        r.src === 'mc' && r.month ? esc(monthName(r.month, lang, r.year)) : '', r.at ? esc(dateText(r.at, lang)) : '', null)).join('') + '</ul>';
      if (s.champions && s.champions.top.length) h += '<h3>' + T('homeChampions') + '</h3><p>' + podium(s.champions.top.map((c, i) => ({ place: i + 1, nick: c.player }))) + (s.champions.url ? ' <a class="small" href="' + esc(s.champions.url) + '" target="_blank" rel="noopener noreferrer">pokerth.net ↗</a>' : '') + '</p>';
      if (!s.upcoming.length && !s.results.length) h += '<p class="empty">' + T('homeEmpty') + '</p>';
      out.push(h + '</section>');
    } else if (s.id === 'results') {
      if (!s.list.length) continue;
      out.push('<section class="card"><h2>' + T('homeResults') + '</h2><ul class="evl">' + s.list.map((r) => row(badge('arena'), '<a href="/arena/t/' + esc(r.key) + '" data-go>' + esc(r.name) + '</a>',
        podium(r.podium, true), esc(dateText(r.at, lang)), null)).join('') + '</ul></section>');
    } else if (s.id === 'cups') {
      if (!s.list.length) continue;
      out.push('<section class="card"><h2>' + T('secCups') + '</h2><ul class="evl">' + s.list.map((c) => row(badge('arena'), esc(c.name),
        T('cupEvents', { n: c.events }) + (c.leader ? ' · ' + T('cupLeader', { nick: esc(c.leader) }) : ''), c.from && c.from > now ? esc(whenText(c.from, now, lang)) : '', '/arena/c/' + c.key)).join('') + '</ul>' + more('/arena/cups', 'navCups') + '</section>');
    } else if (s.id === 'groups') {
      if (!s.list.length) continue;
      const mode = { invite: 'grModeInvite', request: 'grModeRequest', code: 'grModeCode', open: 'grModeOpen' };
      out.push('<section class="card"><h2>' + T('grTitle') + '</h2><ul class="evl">' + s.list.map((g) => row(badge('arena'), esc(g.name), T('grMembers', { n: g.members }), '<span class="chip">' + T(mode[g.join] || 'grModeInvite') + '</span>', '/arena/groups')).join('') + '</ul>' + more('/arena/groups', 'navGroups') + '</section>');
    }
  }
  return out.length ? out.join('') : '<section class="card"><p class="empty">' + T('homeEmpty') + '</p></section>';
}
