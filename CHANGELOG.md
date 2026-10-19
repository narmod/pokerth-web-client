# Changelog

All notable changes to this project are summarised here. It loosely follows
[Keep a Changelog](https://keepachangelog.com/). Since `v2.1.4-web.0`
(2026-07-22) the version tracks the upstream PokerTH release the client is
aligned with, as `MAJOR.MINOR.PATCH-web.N` — a new upstream release resets the
web counter (`2.1.5` → `2.1.5-web.0`). Granular, per-build tags are published on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
this file captures what matters to players and operators.

## 2.1.10-web line (2026)

Opened with `v2.1.10-web.0` (2026-10-05), following the upstream **2.1.10**
release. Per-build detail is on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
highlights below.

### Removed
- **Theme packages** (`web.143`) — `public/themes/<id>/theme.json` packages (button colours/images, pucks, an
  optional palette or felt) no longer reached players: the style window has no theme, buttons or pucks picker,
  the two built-in themes carried no palette, and an imported one only surfaced as a `pkg-<id>` first-visit
  default in Admin › Defaults. Removed end to end: the admin « Theme » tile, chip, library section and import
  kind; the `pkg-` options of the default-theme menu (a saved one now reads « No default », which is what
  players get); in `proxy.js` the theme upload / remove / toggle kind, its listing, `BUILTIN_THEMES` (four ids
  long gone) and the `/themes/themes.json` manifest; in `theme.mjs` the manifest fetch, package palettes /
  felts / presets, the never-shown « Export theme (.zip) » block and its ZIP writer; the Studio « Themes » tab;
  `install.sh theme-add / theme-list / theme-remove` (now a clear error) and the manifest regeneration;
  `scripts/themes-manifest.mjs`, `public/themes/pokerth-new/` and `casino-vert/theme.json`; the orphan
  `themeExport` / `sectionAdvanced` strings in every language. Tables, decks, seats and the Green Casino table
  render exactly as before (`scripts/test-theme-legacy.mjs` compares with web.142).

### Changed
- **Admin › Visitors: « Where visitors come from » in three views** (`web.148`) — the flat list of sources is now read
  three ways from the same period figures (`ref-stats.js` period(), no proxy change): **Channels** (visits, new, new
  rate; a stacked share bar; sources folded into channels — direct, AI assistants, PokerTH.net, search engines,
  social and chat apps, invite links, ?lang= links, our pages, real campaigns, other sites — each unfolding to its
  sources), **New visitors** (channels ranked by first visits, new against returning, top languages) and
  **Languages** (first visits by source × browser language, five largest languages then the rest, plus up to three
  facts the numbers carry). `utm_source=chatgpt.com` is ChatGPT tagging its own links, so it reads as an AI
  assistant, no longer as a « Campaign ». The chosen view is remembered per browser
  (`scripts/test-admin-sources.mjs`).
- **Admin Overview: daily totals and a reading that works on a phone** (`web.146`) — « Connections, last 14 days »
  writes each day's total on its bar (shortened to 1.6k / 23k on a phone) and drops the bar titles, which a phone
  never showed, for the reading of the Statistics charts (`.chartro`): the day, each entry mode, then the total
  (today marked « so far »), with the guide line. The mouse moves it and takes it away when it leaves; a tap leaves
  it open until a tap outside the chart, and a refresh keeps it open.
- **Admin Statistics: new filters (maquette A); mode colours** (`web.144`) — the filter card became a summary bar:
  the period (a button), Refresh, and **Filters** with a count; the active filters show as pills that remove them
  (entry modes, each narrowing, bots shown), then the dates read. Filters opens one panel — a drawer on the right,
  a sheet from the bottom on a phone: the period as a six-step segmented control and Custom range, the entry modes
  as tiles (All modes across), Hide bots and Explanations as switches, Narrow to as rows with the value on the
  right, Reset, Show results. The controls kept their ids and handlers and still apply at once; the panel is a
  modal dialog (Escape, focus kept inside and given back, page locked behind). Colours (narmod): Internet green,
  Live/spectator tool blue, all modes rose (`--m-all`); Errors keep load failures blue (`--m-live`). New test `test-admin-filters.mjs`.
- **Admin › Packages: one kind filter for tiles, import and library** (`web.142`) — the four tiles at the top
  are buttons that filter the library (the same tile clicked again goes back to All), and the kind picked in
  « Import a package » shows that kind in the library; a kind chosen in the library, by chip or tile, preselects
  it for the import. « All » leaves the import kind as it was. The choice is remembered.
- **Admin › Errors: filter and colour by type** (`web.141`) — each error group is typed from its message:
  script error (red), rejection (amber), load failure (blue), recovered (green), diagnostic (grey; a probe that
  answers 404 or 5xx counts as a load failure). The type shows as a bar on the left of the card, the colour of
  the count badge and a chip in words; a row of chips above the list filters by type, with a count per type that
  follows the text filter and « Hide robot-only errors », and the choice is remembered. Copy prefixes the type.
  The chips of a card with a stack no longer stretch to the height of its buttons.
- **Admin icon** (`web.139`) — the dashboard has an icon of its own, the red and white TH chip: browser tab
  (`admin.ico` 16/32/48, 32 px and 192 px PNG), iOS home screen (180 px on the theme colour) and the installed
  admin app (192/512 px, maskable versions inside the safe zone). Files under `public/admin-icons/`; the player
  client keeps its icon.
- **Admin: world clock on the Overview only; « Live/spectator tool »** (`web.138`) — the clock strip moved from
  under the page header (every section) to the top of the Overview, and waits until it shows to centre on its
  reference. The /live entry mode is named « Live/spectator tool » everywhere in the dashboard (Overview and
  Sessions tiles, entry-mode chips, legends, Where sessions open, the last-48 h chart): plain « Live » read as
  « live, right now », like the Live menu (sessions and errors). Overview and Sessions tiles share their rows, so
  a two-line name keeps the figures level.
- **Admin Security in the new layout — the redesign is complete** (`web.134`) — tiles (delegate keys by name,
  changes of the last 24 hours, refused writes, the last change and who made it), the categories of a new key as a
  grid where a ticked one is marked, one row per key with its categories as chips and the key masked, and the audit
  log as a table: the action in words (the endpoint beside it, the labels shared with Overview through
  `PthAdmin.auditLabel`), the master key or the delegate key by name, the masked address, how long ago (the full
  date beside it), done or refused with its status; a filter and « Refused only », a change count, still ten rows
  then a scroll. Every section of the admin page now follows the same layout. New test `test-admin-security.mjs`.
- **Admin Operations in the new layout** (`web.133`) — Health & logs: tiles (uptime, connections and game
  sessions, the served build and whether it still waits for a restart, open files), a filter and « Problems only »
  over the log lines (errors, warnings, refused or failed connections), with a line count; Copy copies what is shown.
  Deployment: tiles (running build and install, update waiting and whether it needs a restart, auto-update, the
  scheduled restart), the action log's buttons grouped, the separator in the theme colour. Access & backup: tiles
  (your address, failed sign-ins, blocked right now, banned) and a count on each list. New test
  `test-admin-ops.mjs`.
- **Admin Infrastructure in the new layout** (`web.132`) — Game servers: tiles (what the Internet button
  dials and why, source, transport with /live and PROXY protocol, the dial allowlist), the three steps in one framed
  block instead of a card nested in a card, each registered server in its own frame, the allowlist as chips, every
  warning in the theme's warning colour (it was a fixed yellow, hard to read on the light theme). Proxy: tiles
  (connected and the cap, session grace, extra hosts and ports, log level). Identity & reach: tiles (server name,
  lobby clock zone, Discord relay, search engines). The tiles show what the server holds, never an unsaved edit;
  they span both columns of a two-column page. A bare textarea now gets the base field style too. New test
  `test-admin-infra.mjs`.
- **Admin Player experience in the new layout** (`web.131`) — Modes & features: tiles (entry modes offered,
  features switched off by name, live figures and community events on or off with their interval), each entry
  mode with its colour and what it is, the kill switches as a grid where a feature switched off is marked in red
  as soon as it is ticked, and a head note counting them. Defaults: labels and fields aligned, one width per
  field, full width on a phone. Every text or number field without a class of its own now gets the base field
  style (they were bare white boxes in the dark theme), in every section. New test `test-admin-players.mjs`.
- **Built-in packs protected** (`web.130`) — the table styles, card decks and seat packs shipped with the
  repository are built in like the themes: `/admin/pkg-list` marks them, the admin shows no Remove for them (they
  can still be hidden), `/admin/pkg-remove` refuses them, and an uploaded pack whose id clashes is renamed
  (`table-…`, `deck-…`, `seat-…`) instead of replacing the shipped one. One list per kind in `proxy.js`
  (`BUILTIN_TABLES`, `BUILTIN_DECKS`, `BUILTIN_SEATS`), kept equal to the folders git tracks by
  `test-pkg-builtin.mjs`. Needs a proxy restart.
- **Admin Content in the new layout** (`web.129`) — Packages: one tile per kind (table styles, card decks,
  seats, themes: offered out of installed), the import card says what a pack does, the library gets a head note,
  All / kind chips (kept per browser) beside the filter, a count per kind, hidden entries marked in words and rows
  that wrap on a phone. Music: tiles (player on or off, tracks and radios offered out of installed, plays and
  votes), the add form's fields styled like every other input (they were bare browser boxes), a library filter
  (title, artist) that keeps each entry's real position. New test `test-admin-content.mjs`.
- **Admin Community in the new layout** (`web.128`) — each section opens on four tiles. Leaderboard: players,
  leader, best streak, reset period; one table (medals for the top three, net in green or red, games and hands won
  out of played with the share, best streak), a header sorts by its column (the rank stays the board's own; kept
  per browser), board picker and filter side by side. Polls: the list first (live / inactive badge, languages and
  answers as chips, one bar per option, the one ahead marked), the editor below with numbered options; tiles for
  the live poll, the option ahead, the polls and all answers. Broadcasts: tiles (scheduled, next send, sent,
  notices switched on), one card per scheduled message (active / paused, schedule, target, next, last, sent as
  chips). LAN directory: tiles (listed, online, players now, waiting), a filter and All / Online / Offline / Not
  listed chips over the table (kept per browser). Same endpoints. New test `test-admin-community.mjs`.
- **Admin Live: Sessions and Errors in the new layout** (`web.127`) — Sessions: four tiles by entry mode
  (Internet bridged / direct, LAN with its servers, Training, Live), one table for bridges and notice channels
  (mode, who, country with flag, where, device · version · masked IP, since and traffic, state, Disconnect), a
  filter and mode chips (a tile clicked filters too, again lets go; kept per browser); on a phone each row folds
  into a card. Errors: tiles (distinct, occurrences, last 24 h, robots only), one card per group with a count
  badge, the source line, chips (robots, last / first seen, builds, devices, players, modes in words), Stack
  folded, Copy, Dismiss; a filter and « Hide robot-only errors » (kept per browser). Same endpoints, nothing new
  is recorded. New test `test-admin-live.mjs`.
- **Admin Statistics: « Narrow to »** (`web.126`) — a third row in the filter card: Country, Device, App,
  New or known, LAN server, Account, each a chip opening the list of values counted over the period (with their
  counts), kept per browser, Clear lifts them all. While narrowed, the World page reads `/admin/cube`: the map's
  Connections layer and the countries (`by=cc`, entry modes included), the Internet and LAN cards and connections
  per day (`by=mode`, with the period before dashed), the LAN servers (`by=lan`), the logins (`type=l`, `by=acc`);
  account narrows the logins only. Visits and the other pages are not narrowed, and the bar says so, as it says
  when the period starts before counting did. Masked cells (`"<3"`) are drawn as 1 and written « <3 » / « fewer
  than 3 ». `/admin/cube` also returns `prevSeriesBy`.
- **Statistics: cross-tabulated session counts, step 2 — reading** (`web.125`) — `GET /admin/cube` (admin only):
  sessions (`type=c`) or logins (`type=l`) over the same windows as `/admin/visits` (preset, `hours=24`, a custom
  range) and the window before, filtered (`f=mode:lan|pokerthnet,cc:DE`) and broken down by one dimension (`by=`),
  one point a day (an hour over 24 h) with its breakdown, the series of the window before, robots on request, the
  values each dimension takes over the period (for the « Narrow to » lists), the LAN names and the start date.
  Filters keep only dimensions of the type and values a fact can hold (`parseFilters`: nothing is rewritten into
  another value). Small cells: a count of 1 or 2 in a cell defined by two dimensions or more (filters plus the
  breakdown), or a total under two filters or more, is returned as `"<3"`. Fixed on the way: the start dates of the
  LAN-server, login and cube counters (`lanSrvSince`, `loginSince`, `cubeSince`) were saved but not read back, so a
  restart forgot them.
- **Statistics: cross-tabulated session counts, step 1 — recording** (`web.124`) — `server/cube-stats.js`: each
  session start (mode ping) and each login adds 1 to ONE key holding all its dimensions — `c|mode|country|device|app|
  new|lan server` and `l|account|country|device|app|new` — in `fx` of the day bucket and of the hour cell (robots in
  their mirror). Closed value sets only (no free text, no separator can be smuggled in), at most 2,000 keys a bucket,
  overflow under `*`, reported apart. Country from the time zone, device from the User-Agent, new / known from the
  first-seen day the visit counter already keeps — no identifier, address or time zone stored. The client adds
  `pwa` (installed app) to the mode and login pings, and the time zone to the login ping (`window._pthIsApp`).
  Nothing is shown yet: the read route and the « Narrow to » row follow. Design note:
  `claude/CONCEPTION_CUBE_STATS.md` (project docs). `scripts/test-stats-cube.mjs`.
- **Admin Statistics: connections per LAN server, guests and accounts** (`web.123`) — the LAN mode ping now carries
  the server (`srv`, host:port; counted once per server and browser session) and the proxy files it under its LAN
  directory entry, or « other » (local server, typed address, unlisted), never keeping the address (`ls` per day
  and hour cell, at most 200 keys). On a confirmed login on pokerth.net (`onInitAck`) the client sends a login ping
  (`login: guest|auth`, once per kind and session, honours « do not count me », /live left out); the proxy counts
  `lo: { g, a }`, robots apart. `/admin/visits` returns `lanServers` (period, period before, entry names, since) and
  `logins` (period, period before, since), and each series point its `lo`. The World page's LAN card gains a
  Connections column with the change against the period before and a line for unlisted servers; the Internet card
  gives logins with the share of guests and accounts. Privacy page and player changelog updated.
- **Admin Statistics › World: « Live now »** (`web.122`) — a sixth map layer: the connections open at this moment,
  by country, in the entry modes picked in the filter bar, read from `/admin/sessions` every 15 s while on screen
  (country card, list and legend included; a client too old to say counts as Unknown). The web client now adds
  `&tz=` (browser time zone) to the game connection and to the notice channel; the proxy keeps only the country
  (`GEO_STATS.countryOfTz`) on the socket and the session, hands it out as `cc` with each bridge and notice channel,
  and never stores it. The Sessions page names the country of each connection; the Overview shows its flag. The
  privacy page says so.
- **Admin Statistics: a custom date range** (`web.121`) — the period list ends with « Custom range… »: two dates
  (server days, both included) and Apply; remembered per browser, put away by picking a preset. `/admin/visits` and
  `/admin/geo` read `?from=YYYY-MM-DD&to=YYYY-MM-DD` (`visitRange`: dates put in order, the end stopped at today, the
  start at the retention, a year at most, impossible dates refused) as P days ending E days back; every window
  that read « the last P days » takes that offset — series, comparison with the range before, complete-day
  comparison (a past range is complete as it stands), hour profile, cohorts (judged at the range's last day),
  language trend, environment, music, sources, Ace's Help, pokerth.net share, robots taken out, the map. The answer
  carries the range as read (`range`, `periodEnd`) and the zone of the server's days (`tz`), shown under the period.
  The third tile names the range. 24 hours ignores a range.
- **Admin Statistics › World: Internet, LAN and connections per day** (`web.120`) — under the map, an Internet card
  (players online on the server now and on the web client, from the live samples; connections over the period
  against the period before; players online over 48 h, whole server and web client; busiest hour) and a LAN card
  (players online on listed servers, servers up, connections over the period against the period before, the listed
  servers with their state, players now and last check), then « Connections per day, by entry mode »: stacked bars
  for the modes picked in the filter bar, with the same count over the period before as a dashed line, point for
  point. `/admin/visits` now returns `prevM`, the per-mode counts of the window just before (days, or hours over
  24 h; robots included when shown); the stacked chart helper takes `opt.prevBy`. `scripts/test-stats-world.mjs`.
- **Admin Statistics: World first, sections in the menu, one filter bar** (`web.119`) — the Statistics group of the
  side menu lists its pages, World first, then Summary (the former Overview tab), Audience, Activity, Visitors, Music,
  Ace's Help and Data; the tab row inside the panel is gone, and each page has its address (`#traffic/world`…).
  Entering Statistics reads the figures once; moving between its pages reads nothing again. One filter card heads
  every page: entry-mode chips (All, Internet, LAN, Training, Live; one narrows, more add, kept per browser) next to
  the period, robots and explanations. The modes apply to connection counts — the map's Connections layer, the
  countries, the 48 h chart by mode, Where sessions open — and the bar says that a visit is counted before any mode
  is chosen. The map gets five layers (Visits, New devices, Connections, Installed app, Phones) and a band of local
  time along it, placed in the map's projection (every 2 h on the world, every hour on a region, the evening in
  green), redrawn each minute. One set of themed mode colours for the whole admin (`--m-net`, `--m-lan`, `--m-off`,
  `--m-live`).
- **Admin page: an Overview to land on** (`web.118`) — the first page after logging in with the master key. What needs
  attention, most urgent first (client errors seen in the last 24 h — robots aside —, a restart the files are waiting
  for, an update, LAN servers to review, a scheduled restart), each leading to its section; who is connected right
  now by entry mode (Internet through the proxy or direct, with the server-wide figure from `/api/live`; LAN with
  its number of servers; Training; /live spectators); connections per day over 14 days by entry mode; the server
  card; the newest connections and the latest changes from the audit log, in words. Read-only, from the endpoints
  the other sections use; refreshed every 10 s (live parts) and every minute while open and visible. The visit
  series now carries each day's (or hour's) per-mode counts (`m`). `public/modules/admin/overview.mjs`,
  `icons.mjs`, `scripts/test-admin-overview.mjs`.
- **Admin page: a side menu** (`web.117`) — the three families on top and their horizontal section bars give way to a
  side menu grouped by task: Statistics, Live (sessions, errors), Community (leaderboard, polls, broadcasts, LAN
  directory), Content (packages, music), Player experience (modes & features, defaults), Infrastructure (game servers,
  proxy, identity & reach), Operations (health & logs, deployment, access & backup) and Security (keys), with the
  Phosphor icons of the QML client. Full width (up to 1600 px of content), light and dark themes on shared tokens,
  Inter self-hosted. Under 900 px the menu is a drawer behind a menu button, with a sticky page header. Each section
  has its address (`/admin#traffic`, `/admin#keys`…): reload, bookmarks and the back button land on it. The page
  installs as an app of its own (`admin-manifest.json`, scope `/admin`). The section buttons keep their classes, so
  every loader and scope rule is unchanged; `public/modules/admin/shell.mjs` only adds the drawer, the routes, the
  page title and the group badges. The panels are still the former ones; they move to the new layout next.
- **Mini-games without categories** (`web.102`) — the « Just for fun » heading is gone: the page lists the games
  directly, in the registry's order (`SHELVES`, the `shelf` field and `gmShelfPlay` removed, 83 languages).
- **Mini-games instead of Arcade, the lessons removed** (`web.101`) — the page and its title are now « Mini-games »
  (`gmTitle`, 83 languages). The « Learn poker » shelf is gone with its six lessons (`games/preflop*.mjs`,
  `nuts`, `outs`, `potodds`, `equity`), their secret trophies, covers, strings and tests; « Who Wins? » is back
  on the « Just for fun » shelf (future unlock at 21 trophies, Higher or Lower 24, The Ace's Bluff 27). Trophies
  no longer defined are left out of the trophy counts (`achievements/index.mjs`), so a lesson's trophy won
  before stops counting.
- **Search engines and AI assistants get the real picture** — the help and the FAQ no longer say a pokerth.net
  account is required: guest login (Normal games), nickname-only LAN / dedicated servers and offline
  training are spelled out, in the 83 languages. Five new FAQ answers (playing with friends, invitation
  links that seat the invitee automatically, the demo server, the BBC / WeCup / Monthly Cup with links
  to their calendars, results and rankings, project activity) and two corrected ones (account; own
  server, now with « Propose my server »). English home page served with its full SEO title; home JSON-LD typed
  `WebApplication` + `VideoGame` (genre, play modes, 2–10 players, platforms, licence, author, upstream
  repo); `llms.txt` rewritten as quick, factual answers with version and last-update date; content-page
  nav and call to action localized (`seo-i18n/nav.js`); sharper English meta and manifest descriptions (`web.74`). Home JSON-LD: explicit `operatingSystem` list and `publisher` (`web.76`).
- **The client follows PokerTH 2.1.10** — the build ID sent to the server and the
  build-ID fallbacks in `net/messages.mjs` and `proto/index.mjs` move to 2.1.10 (`web.0`).
- **A shorter changelog in « About »** — the « Web client » tab now shows this file, one
  summary per release line, instead of the build-by-build `ChangeLog-web` list (`web.2`).
- **The Ace's first-launch offer no longer comes back forever** — left unanswered, it reappeared
  at every visit and every return to the lobby (4 270 showings for 1 270 answers in six days). It
  is now shown at most 3 times per device (`pth_guide_offer_n`, local, not synced); Ace's Help
  stays one tap away from the login button and Advanced options. The admin card counts the offer
  per device too (`offer.first`), next to the rate among those who answered (`web.6`).
- **The local backup offer is the Ace's** — on a browser whose storage comes up blank, the offer to
  create the backup file or restore it (Create / Restore / Later, with the folder and file path) is
  now said by the Ace in his bubble, tips off included: the one exception to his « silent until
  asked » rule, once per blank storage. `backup-autosave.mjs` hands it over through
  `window._bakOffer` / `pth:bakoffer`; its banner stays as the safety net when the Ace does not
  claim it within 3 s or show it within 30 s, and under automation. The Ace's first-launch offer
  waits for it. New help section `options:backup` in the 83 languages; `test-guide-backup` (`web.20`).
  Answering « Later » (or Escape) now tells where to find it again — Advanced options → Backup &
  reset → Automatic backup, then « Choose folder… », built from the panel's own labels, path and
  button in bold — before he leaves; the banner's Later / ✕ say it in a toast. New key
  `bakLaterHint` in the 83 catalogues (`web.21`). A « Show me » button next to « Got it » opens
  Advanced options on Backup & reset, scrolls to Automatic backup and flashes the « Choose folder… »
  row like an options-search hit (`window._bakOffer.show`, key `bakShowMe` in the 83 guide
  catalogues) (`web.22`). The offer is counted in the Ace's Help statistics (context `backup` of
  `server/guide-stats.js`: shown by the Ace or by the fallback banner, Create / Restore tapped and
  done, « Later », « Show me »), with its own block « Local backup offer » on the admin card; the
  privacy page says so. Needs a proxy restart to be recorded (`web.27`).
- **Firefox: the Ace offers to protect the settings** — Firefox has no folder access, so instead
  of the backup file the Ace offers « Protect my settings »: `navigator.storage.persist()` asked on
  the player's click after an explanation (Firefox shows its own prompt; granted, it never evicts
  the site's data on its own). At most 3 showings per device (`pth_persist_n`), never once granted,
  a refusal is final; a « Protect my settings » row in Advanced options → Backup & reset shows the
  state. The cold request on load in `pokerth.js` is skipped on Firefox (other browsers keep the
  silent one). Counted as `backup.persist_*`; third paragraph in help `options:backup`; 5 new keys
  in the 83 catalogues; `test-backup-persist`, Firefox scenario in `test-guide-backup` (`web.31`).
- **No Assistance at Ranking tables** — the hand-strength banner and its win % are a web extra:
  the QML client shows no such thing (its Chancen tab only lists hand categories). At a Ranking
  table (game type 4, online) the banner is replaced by a short note and nothing is computed, so
  every seat plays with the same information; the player's own setting (`pth_assist`) is left
  untouched and the banner comes back at other tables. The Odds tab (QML parity) stays. Key
  `assistRankingOff` in the 83 catalogues, help « Assistance » updated in the 56 that carry it
  (`web.23`).
- **pokerth.net figures as badges on the « Internet » button** — the counters row under the
  button's subtitle becomes a badge cluster pinned to its top-right corner: players online as the
  main green badge, tables running and players waiting beside it. Games today is dropped from the
  button (still on `/live`, whose layout is untouched — the badge rules are scoped to
  `.login-card`). Each figure's wording moves from `title` to a new `ui/hold-tip.mjs` bubble shown
  on hover and on touch long-press; the click that follows a long-press is swallowed so the
  button does not open (`web.24`). The badges are dropped again in `web.33`: the figures go back
  on the card's own line under the subtitle, players online first in green with its wording,
  tables and waiting players muted (icon + figure); hold-tip and the games-today removal stay.
  In `web.34` the tables and waiting icons take a gold and a red (casino-chip trio with the
  green), figures in the plain text colour; local `--lcs-gold` / `--lcs-red` per theme.
  `web.35`: players online lose their wording on the card too (icon + figure, still green), so
  the line fits on a phone; the wording stays in the tooltip.
- **The Ace on a tap in the game list: « watch it » for running games, no more nagging** — tapping a
  game already being played makes the Ace explain that it can be watched as a spectator (select it,
  then **Spectate**) and offer **Watch**, for everyone, guests included (`lobby-watch`, manual
  context, counted as `lobby-watch.watch`). The guest free-account bubble now only answers taps on
  *open* Ranking / registered-only tables. Both come at most once per table and per session, and
  « Later » silences them for the session — the bubble used to come back at every tap (`web.64`).
  Cup games (BBC, WEC, Monthly Cup…: an invite-only or password table whose name names a cup,
  `guide/cup.mjs`) get their own text: running, the cup admins invite the players but anyone can
  watch; not started, it cannot be joined by a tap and **See the events** opens the Events window
  (`lobby-cup`, counted as `lobby-cup.events`; it replaces the guest bubble on such tables, `web.65`).
- **Country flags explained** — a player's flag is the Country of their pokerth.net account (User
  Control Panel → Profile → Edit profile → Country → Submit, shown from the next login; guests have
  none). Said in the help (pokerth.net → Avatars and flags, all languages), by the Ace in « ? » mode
  on any flag (`hsFlag`), and once in the lobby to an account holder whose own player info came
  back without a country (`lobby-flag`, after the Ranking tips; **Edit my profile** opens that page,
  counted as `lobby-flag.profile`; `S._myInfoLoaded` set by `onPlayerInfoReply`). The guide modules
  added in `web.64`–`web.65` join the service-worker precache list (`web.66`).
- **The Ace on a tap on an open, non-ranked table: « join it »** — a Normal table (or registered-only
  for an account holder) with a free seat and no password, not a cup game: the Ace says it does not
  count for the ranking (guests: a game open to them) and offers **Join**, which joins that table
  (`lobby-open`, counted as `lobby-open.join`; once per table and per session, silent after « Later »,
  `web.67`). An account holder tapping an open Ranking table hears that it counts for the ranking and
  starts by itself once full (**n/max**), with the same **Join** (`c1OpenRanked`; not counted in the
  `lobby-ranking` funnel, `web.68`).

### Added
- **Microsoft Edge in the screen matrix** — `test-screen-matrix` runs the desktop profiles and the resize run in
  the real Edge too (Playwright `msedge` channel, `Desktop Edge` user agent; `PTH_ENGINES=edge`), as a fourth
  `screen-matrix (edge)` job in the Mobile verification workflow. Without Edge installed the engine is skipped
  with a notice, like the others (`scripts/lib/mobile-harness.mjs`).
- **Who's Ahead? — lesson 6** (`web.100`) — `games/equity.mjs`: your two cards against the Ace's, all-in before the
  flop; set your guess on a 0–100 % bar (± 5 %, or tap), the answer is a 4,000-run Monte Carlo (`equity`, a split
  counts half). Matchups drawn evenly from seven classic kinds (`kindOf`: pair v lower pair, race, pair v one
  overcard, pair v undercards, dominated, two overcards, any); 3 / 2 / 1 points within 5 / 10 / 15; secret trophy
  at 24/30; unlocked by Call or Fold?. The « Learn poker » path now has six lessons.
- **Call or Fold? — lesson 5** (`web.99`) — `games/potodds.mjs`: the turn, a pure draw (your cards add nothing to
  the board yet), the Ace bets 1/6 pot … 1.5 pot. Chances = outs / 46, needed = B / (P + 2B); never closer than
  3.5 points, half the spots are calls; the sums are shown after each answer. Secret trophy at 10/12; unlocked by
  Count the Outs.
- **Count the Outs — lesson 4** (`web.98`) — `games/outs.mjs`: your two cards and a flop (60 %) or a turn; an
  out is an unseen card after which you hold a straight or better, of a higher kind than the board with that card
  alone (`outsOf`). Four counts to choose from (the right one and three within ± 4); then the outs, what they make
  (« Flush 9 · Straight 6 ») and the rule of 4 / 2 next to the exact odds (`oddsOf`). Four-out draws are mostly
  passed over so flush draws, open-enders and combo draws come up; secret trophy at 10/12.
- **Find the Nuts — lesson 2** (`web.97`) — `games/nuts.mjs`: a board that says something (three of a suit, a pair,
  three close ranks), four pairs of hole cards that share no card — the nuts, the next two hands down and one
  further down; every pair is then named (with its five cards when two share a kind: « Full · A A A 3 3 »)
  and the nuts' cards lit. Straight / flush / four of a kind / straight
  flush nuts about 37 / 25 / 22 / 15 %; secret trophy at 13/15; « Who Wins? » now follows it in the path.
- **Open or Fold? — lesson 1** (`web.96`) — `games/preflop.mjs` + `games/preflop-chart.mjs` (a prudent full-ring
  first-in chart, UTG 7 % … BTN 35 %, range notation parser, 13 × 13 grid): a 9-seat table with the folded seats
  greyed, Raise or Fold, the chart of the position after each answer, a green / red grid of your hands at the end;
  half of the hands from the edge of the range; secret trophy at 18/20.
- **Two shelves in the arcade** (`web.95`) — `SHELVES` in `games/index.mjs`: « Learn poker » (a numbered path) and
  « Just for fun ». Each game also states how it will unlock in a future « Arcade » login mode (`unlock`:
  from the start, a given trophy — each lesson's opens the next — or a number of trophies; `ARCADE_UNLOCK`
  for the mode itself; `unlocked()`), not active yet: the secret word still opens everything.
- **The Ace's Bluff in the arcade** (`web.94`) — `games/bluff.mjs`: heads-up on the river, the Ace bets his better
  hands and bluffs half of his worse ones; Call or Fold. Every table of 5 hands he gets a tell (sweat,
  stare, sunglasses, fidget, wave, grin) shown on 80 % of his bluffs and 15 % of his value bets, among
  harmless habits; 20 hands from 100 chips; secret trophy « Mind Reader » at 5 bluffs called.
- **Higher or Lower in the arcade** (`web.93`) — `games/hilo.mjs`: one-deck shoe (cards out shown, reshuffled
  under 8), each button shows its chance and the multiplier a right guess pays (fair odds × 0.95, at least
  ×1.05), cash out to bank the pot (from 10), three hearts; secret trophy at 10 right guesses on one pot.
- **Who Wins? in the arcade** (`web.92`) — `games/whowins.mjs`: a Hold'em board and two hands, tap the winner or
  Split before the bar runs out (9 s down to 3.5 s), three hearts; deals get harder (same-kind showdowns,
  split pots from the third level, `makeDeal`), each answer names both hands and lights the winning five;
  secret trophy at 20 right answers.
- **Video Poker in the arcade** (`web.91`) — `games/videopoker.mjs`: Jacks or Better (9/6 paytable, bet 5),
  20 hands from 100 credits, daily challenge (decks seeded by day and hand, `games/deal.mjs`) or free game,
  double or nothing against the Ace (up to 5 times), secret trophy at three doubles in a row. Card games
  share `games/ui.mjs` (felt, canvas buttons, bubble) and a tall stage in portrait (aspect from 0.6).
  `rankHand` / `compareHands` added to `poker-hand.mjs` for the games to come. Arcade intro without a game count.
- **House of Cards: easier to aim, harder to keep up** (`web.90`) — the place of the next card is
  filled and pulsing, with a dotted plumb line to a mark on the rail (theme colours). Harder: rail
  92 px/s +20 per level (max 250), a pendulum pace from level 2 (fastest mid-rail), tolerance 10 / 13 px
  (was 12 / 16), Perfect within 2 px, a miss tilts 0.25 (was 0.16), an off-centre drop up to 0.14.
- **Cover pictures in the arcade** (`web.89`) — each game card shows a small SVG scene of its game
  (`games/art.mjs`, no image file), painted from `ink(light)` and repainted when the theme changes;
  tapping it plays the game.
- **The arcade becomes a page** (`web.88`) — `#s-arcade`, a screen with the header of « Create a table »
  (back arrow, game name, « ? » rules, trophies, accessibility, ⚙ menu) instead of a full-screen overlay.
  Back (arrow, Esc, pad Select, Android Back via `back-guard.mjs`) goes rules sheet → arcade home →
  the screen it was opened from (the login's training form is kept). The home is a page of cards
  (`menu.mjs`: best score, « Play », « Rules »); each game has a rules sheet (`arRules`, `hcRules`,
  `psRules`, 83 languages). The stage is sized from the room left (ResizeObserver, per-game aspect
  range) so portrait ↔ landscape works mid-game, the ▲ ▼ buttons going beside it in landscape. Light
  and dark themes: page from the theme's tokens, worlds painted from `ink(light)` (`common.mjs`).
- **Every trophy won: the Ace gives away the arcade** — Ace's Help gets a tip on the Trophies tab
  (`w-trophies`, window `trophies`): win every trophy in the list and there is a surprise at the end.
  When the last trophy that is not secret falls (the secret ones need the word itself), the Ace comes —
  tips on or off, on the login screen or in the lobby, never at a table nor over the offer or what the
  player asked for — and says the secret word (`gameWordAce`, the player's language), with « Play now »
  opening the arcade directly. Once per device (`pth_arcade_told`); also on the first visit after this
  update for players who already had them all. Texts in the 83 Ace's Help catalogues; stats pairs
  `w-trophies` and `arcade` (revealed / play) in `server/guide-stats.js` and the admin page;
  `test-games-browser` covers the reveal (`web.87`).
- **Poker Solitaire in the arcade** — the third hidden game (`games/solitaire.mjs`, rules in the pure
  `games/solitaire-rules.mjs`): 25 cards, one at a time, each into an empty cell of a 5 × 5 grid for
  good; every row and column is a poker hand, scored on the American scale (royal flush 100 … pair 2).
  « Daily challenge » deals the same 25 cards to every player on a UTC day (seeded from the date, no
  server; the day's best kept on the device) or « Free game ». The Ace calls flush and straight draws
  and cheers the hands; the ten lines are counted one by one at the end, then the score and the best
  line. Arrows / D-pad and Space / A, or a tap on the cell; the ▲ ▼ touch buttons are hidden for it.
  Secret trophy « Poker Solitaire » at 75 points. The shell now tells a game where an action came from
  (key, tap position, pad button) and can hide the touch buttons; the choice tiles move to
  `games/common.mjs`. Strings in the 83 languages, reusing the hands panel's short hand names
  (`web.86`).
- **House of Cards and the arcade menu** — the secret training nickname now opens an arcade menu
  (`games/menu.mjs`: ← → / tap / pad, best score per game, the Ace waving) listing Ace Runner and a
  second game, House of Cards (`games/house.mjs`). A card slides along the dealer's rail, a tap drops it
  on its place; a floor is five cards the real way (two A-frames and a flat card), so every floor is a
  poker hand paid 20 × its multiplier (Joker wild). Off-mark drops lean the house — the « Tilt » gauge —
  and at 100 % it comes down; a Perfect drop steadies it (+5, up to +15 in a row); a straight or a flush
  halves the tilt, a full house or better resets it with the All-In fanfare and a crown for the Ace;
  ↓ burns the hanging card (3 per game, +1 per blind level, 5 max); the next card shows on the shoe;
  Blinds up every 5 floors (faster rail); chips stacked on each winning floor; a showdown of the best
  floor at the end; casino → chandelier → night sky as it grows. The Ace lives in the house (drawn
  between two canvases) and climbs a floor at a time. Secret trophy « House of Cards » at 10 floors.
  Shared pieces move to `games/common.mjs` (the Ace actor, the player's deck, the HUD); the shell
  gains in-place switching (`shell.open`, Esc / Select back to the menu, then out), ←/→ actions and a
  trophy queue (`shell.grant`). Strings in the 83 languages; `test-games-browser` covers the menu and
  the house (`web.85`).
- **Ace Runner, a hidden mini-game** — in training, the nickname « mascot » (or its translation in the
  player's language, key `gameWordAce`; case and accents ignored) opens a runner game instead of a
  table, and the real nickname is put back in the field and in `pth_nick` (the field saves every
  keystroke, so the name held before it was edited is restored). The Ace (the mascot's SVG, via
  `actorKit`) jumps chip stacks and the rolling dealer button, ducks flying cards in the player's card
  back, and picks up face-up cards in the player's deck; the best five-card hand among them (the Joker
  is wild) multiplies the distance. Blinds up every 300 m (faster, blinds sound), an All-In gold chip
  (crown and sceptre, invincible for a few seconds, smashes what it hits, distance ×2), sunglasses on a
  flush or better, a showdown that turns the five cards one by one, best score per device, secret
  trophy « Ace Runner ». Keyboard, touch (tap / swipe down, ▲ ▼ on touch screens) and gamepad. A small
  registry, `modules/games/` (`index.mjs` trigger and registry, `shell.mjs` overlay / loop / input /
  best score, `poker-hand.mjs`, `ace-runner.mjs`), so more games can be added; precached for offline
  use. While a game is open the gamepad navigation (`window._pthPadOwner`) and the mascot
  (`window._pthGameOn`) step aside. Strings in the 83 languages, hand names shared with the hands panel;
  `test-games`, `test-games-browser` (`web.84`).
- **TV remote (Android TV / Google TV)** — `ui/remote.mjs`, a second adapter of the controller core
  `ui/ctl-nav.mjs`: arrows (also DPAD keyCodes 19–22), OK (Enter / DPAD_CENTER 23), Back (Escape,
  GoBack, keyCode 4, and the history step handled by `back-guard.mjs`, which now asks
  `CtlNav.backFallback()` first), Play/Pause = Game ⇄ Navigation, Menu and OK held 600 ms = controller
  menu, colour keys 403–406 = Fold · Check/Call · Bet/Raise · All-In. A remote has no action buttons,
  so in Game mode the core keeps a ring on the action bar (`barDo`: Check/Call first, ←/→ adjust the
  slider and the amount, pre-actions reachable off-turn; a re-rendered bar only shows the ring again,
  and each new turn puts it back on Check/Call). On by itself on a TV (Android TV user agent or
  `any-pointer: none`), option `remote_on`. The controller menu gains a Game / Navigation tile. Help
  section « TV remote » and the option in the 83 languages; `test-remote-browser` (`web.82`).
- **Gamepad, second iteration: modes, menu, keyboard** — the gamepad logic is split into a
  device-agnostic core, `ui/ctl-nav.mjs` (modes, focus ring, zones, table actions, abstract actions
  sent by an adapter), and the gamepad adapter `ui/gamepad.mjs`; a TV-remote adapter can reuse the
  core. **Select** switches Game ⇄ Navigation (badge `#ctl-badge`); the table's side panels (chat,
  history/odds, reactions, music, hands) no longer stop play, only real windows force Navigation;
  my turn switches back to Game automatically. In Navigation, LB/RB cycle *zones* (screen, open
  panels, the Ace's dock, which lives outside the screens and was unreachable), X jumps to the chat,
  Y opens Ace's Help, LT/RT switch tabs. **Start** opens `ui/ctl-menu.mjs`, a tile menu (keynav
  surface). Text fields open `ui/ctl-keyboard.mjs`, an on-screen keyboard (AZERTY / QWERTZ /
  Cyrillic / QWERTY by language, accents and symbols, quick chat phrases; the field is never
  focused, so phones do not pop their own keyboard; option `pad_kb`). A window can take the
  controller's buttons through its `__ctl` hook (the keyboard: ⌫, space, shift, send). New keys and
  a rewritten help section in the 83 languages; `test-gamepad-browser` extended (`web.81`).
- **Gamepad support** — new `ui/gamepad.mjs` (browser Gamepad API, standard mapping; Xbox,
  PlayStation, Switch Pro and most Bluetooth pads; web addition, the QML client has none). Two
  modes switched automatically. *Table* (game screen, nothing open): the action-bar buttons are
  clicked exactly as with the mouse — A Check/Call, X Fold, Y Bet/Raise, Y held 600 ms All-In (or
  Show) with a fill gauge, LT/RT step the slider (accelerating), LB/RB 1/3 · 1/2 · Pot, D-pad ←/→
  playing mode, ↑ browse the table, Start settings, Select chat; a double rumble on my turn.
  *Navigation* (outside the table, or any keynav surface open — table buttons are then dead): the
  D-pad / left stick moves a focus ring chosen by `ui/spatial-nav.mjs` (pure geometry, unit-tested)
  inside the topmost surface (`keynav.topSurfaceEl()`, new), A activates, B = Escape
  (`closeTop`) and never folds, ←/→ change lists, sliders and numbers, LB/RB and LT/RT switch the
  first / second tab list, the right stick scrolls; text fields are only focused on A (no
  on-screen keyboard on the way through). Glyphs of the detected pad (Xbox / PlayStation /
  Nintendo) replace the key badges while the pad is the last input used. Options `pad_on`,
  `pad_rumble`, `pad_nintendo` (A/B swapped) in Advanced options → User interface → Gamepad; new
  help section « Gamepad », both in the 83 languages; `test-spatial-nav`, `test-gamepad-browser`
  (`web.79`).
- **`/competitions` page** — BBC, WeCup and Monthly Cup in the 83 languages (`seo-i18n/competitions.js`):
  what each one is, how to take part, links to calendars, results and rankings, and the coming
  dates read from the community-events relay (plus the WeCup daily game, 22:00 Berlin), never
  waiting more than 1.5 s for it. Structured data: the three competitions as `EventSeries`, each
  coming date as a free online `Event`. Linked from the content-page nav, the crawler block,
  `llms.txt`, the sitemap (daily) and IndexNow; `test-seo-competitions-i18n` (`web.75`).
- **LAN server directory, server side** — players will be able to propose their own PokerTH
  server from the LAN login screen; an admin approves or rejects each request, and approved
  servers are listed for everyone. This first step is the proxy part (new module
  `server/lan-directory.js`): `GET /api/lan-directory`, `POST /api/lan-directory/test` and
  `/propose` for players, `GET`/`POST /admin/lan-directory` for the master key, and a
  `lanDirectory` block in `/app-config`. An approved server joins the dial allowlist and carries
  its own TLS settings (« skip cert check » is pre-set when the submit check found a self-signed
  certificate); « visible » off keeps it dialable but unlisted, and a server offline for more than
  7 days drops off the list on its own. The submit check only reads the server's greeting (no
  login), refuses ports outside the PokerTH ports and hosts resolving to a private address, dials
  the address it checked, and is rate-limited per IP; nothing about the sender is stored and
  there is no follow-up on a request. Approved servers are re-checked every 5 minutes. Setting
  `manualEntry` (on by default, so existing installs keep the free address field) will let
  pokerth.net hide that field. `test-lan-directory` (`web.41`).
  The admin side is the new tab Server › LAN directory: pending requests with the result of the
  submit check (self-signed certificates flagged, plain-language advice when a server did not
  answer), Approve only for a server that answered, Reject, Edit and a full lobby Check; the
  published directory with status, players, last seen, a « Visible » switch, Edit, Check and
  Remove, plus « Add manually »; and the settings (health-check period, auto-hide, per-IP limit,
  offline servers, private addresses, manual address entry). A badge on the tab counts the
  requests waiting. The Game servers allowlist card now lists the approved LAN servers too
  (`web.42`).
  On the player side (`web.43`, new module `ui/lan-directory.mjs`), the LAN login form shows a
  « LAN server » drop-down of the approved servers (online first, with their players; offline ones
  marked), and a status line under it (online, country, language, players, description). Picking a
  server fills the usual address fields, which then hide; « Enter an address… » at the end of the
  list brings them back when the admin allows manual entry. « Propose my server » opens a form
  (name, address, port, TLS, country, language, description): Send stays disabled until the
  connection test passes for the values on screen, the request goes to the admin queue, and
  nothing about it is kept on the device. An instance with no listed server, manual entry on and
  requests closed shows the form exactly as before. Ace's Help: a new tip `login-lan` and four
  « ? » explanations (list, Propose, Test, TLS) plus the form window; a paragraph in the LAN help
  section. 40 UI keys, 6 Ace keys and the help paragraph in the 83 languages (`es-419` derived);
  `test-lan-directory-browser` (real proxy, fake PokerTH server, Chromium).
  « Local server » (`web.44`): a self-hosted install lists its own game server first in the
  drop-down and pre-selects it — the address the LAN form used before the directory (the forced
  address of the default login form, else the page's host on 7234), with a gold dot and its
  address on the status line. New setting `localEntry` (on by default; to turn off on
  pokerth.net) in admin › LAN directory; new key `lanDirLocal` in the 83 languages. Manual address
  entry is now off by default (`manualEntry`), the admin can turn it back on.
  One leaderboard per LAN server (`web.46`, new module `server/lan-boards.js`, file
  `lan-boards.json` next to `stats.json`): each listed server has its own family leaderboard with
  its own reset period (never / daily / weekly / monthly / yearly), chosen in the « Propose my
  server » form (monthly by default) and changeable afterwards by the admin only (LAN directory ›
  Edit; a period change restarts the count without wiping). `/stats?board=<id>` (GET and POST
  `board`), unknown boards refused; removing a server drops its board. The historical board stays
  the board of the local server and of typed addresses (file, MySQL mirror and reset setting
  unchanged). Client: the LAN lifetime store follows the board (`pth_life@<id>`, `pth_life` for
  the main board), the leaderboard names its server and period. Admin › Leaderboard gains a
  board picker (`/admin/lan-boards`, scope leaderboard) for viewing, removing players and
  resetting one board. 7 new keys and a help sentence (famboard) in the 83 languages;
  `test-lan-boards`. The LAN drop-down shows each server's reset period next to its name
  (« · 🏆 Every month », nothing for « Never ») and a pill on the status line; the admin board
  picker no longer overflows on a phone (`web.47`).
  Players per IP on each listed server (`web.48`): how many players may be connected at the same
  time from one IP address to that server through the proxy — 3 by default, 1 to 5 in the
  proposal form, more only by the admin (LAN directory › Edit), never above the proxy-wide
  per-IP cap (`PROXY_MAX_WS_PER_IP`, 20 by default), which the admin settings now state. Grace
  sessions count; a reconnection on the same session does not. Refused connections close with
  4430 (`lan-ip-cap:N`): the client goes back to the login form with a translated message and
  no automatic retry. 3 new keys in the 83 languages.
  The reset period is no longer repeated in the drop-down option labels; the pill under the
  list is the only place it is shown (`web.49`). The options now carry the server name only
  (players and the local address moved to the status line), and the reset period is a plain
  line styled like the status line instead of a pill (`web.50`).
  Broadcasts to one LAN server (`web.51`): besides « LAN (all servers) », both target pickers
  of the Broadcasts tab list each directory server (target `lan:<id>`, resolved to its
  host:port at send time — an edited address is followed, a removed server reaches nobody and
  its scheduled messages say « removed server »). The list comes with `GET /admin/broadcasts`
  (`lanTargets`, names only), so a broadcast-scope token can use it. MySQL mirror:
  `broadcasts.target` widened to VARCHAR(48).
  Admin Leaderboard tab (`web.52`): the board picker and its reset note now sit above the
  reset button, which reads « Reset this board » once LAN boards exist; the confirmation names
  the board and says the other boards are not touched (the reset already only wiped the board
  picked — now tested both ways).
  « Propose my server » dialog (`web.53`): padded by the safe areas, so in the installed iOS
  app its title no longer sits under the status bar and the Send button clears the home bar.
  Core allowlist (`web.54`): `pokerth.ddns.net` (former demo server, used as the default LAN
  server) is no longer always allowed — LAN servers now come from the directory. Installs that
  still dial it add it under Proxy › Extra allowed hosts (or `ALLOWED_HOSTS`). The admin Proxy
  text, README and `.env.example` now list the real core hosts (incl. `pthsrv.pokerth.net`).
  Richer proposals (`web.55`). Form: community link (public, http/https only), kind of server
  (permanent / event with a last day — after it the server leaves the list, still dialable and
  still listed for the admin), and a « For the admins only » block: nickname (pre-filled from
  the login), note (500 chars, line breaks kept), optional contact, and a required « I run this
  server or its owner agrees » box (`owner`; Send stays disabled until it is ticked). New error
  codes `owner`, `link`, `until`. Admin: each request shows that block plus the interface
  language and how many requests came from the same address over 30 days (salted SHA-256 of
  the IP, per-install salt; only the count leaves the server); approving turns « From nick:
  note » into the entry's internal note (editable, never public) and drops the contact;
  rejecting asks for a reason kept in a « Refused requests » list (180 days, 50 max, no
  contact/note). Editor: link, event end, internal note. Privacy page updated. 18 UI keys and
  2 new Ace's Help hotspots (+ the dialog text) in the 83 languages, help paragraph updated.
  Invite links and the LAN list (`web.56`): an invite to a server missing from the list as
  shown (unlisted, auto-hidden, event ended, or allowlisted outside the directory) was replaced
  by the first listed server when manual entry is off — the invitee landed on the wrong server.
  `withInvite()` now gives the link target its own « ✉ host:port » entry, first and selected
  (released when the player picks another server). A selected entry also sets the TLS box
  (hidden while locked) instead of keeping this device's last state. Browser tests land on
  listed / unlisted / local targets with a stale saved server.
  Leaderboard of an unlisted server (`web.57`): the client only knew the board ids of the
  servers in the public list, so a game on an unlisted / auto-hidden / ended-event server fed
  the historical board. `GET /api/lan-directory/board?host=&port=` (→ `{ board, name,
  resetPeriod }`, `board: ''` outside the directory) resolves it by address at connect;
  `_lifeSeedFromServer` waits for that answer. Nothing new is listed publicly: the answer only
  goes to whoever already has the address.
  The LAN drop-down label reads « Choose a server » instead of « LAN server », which repeated
  the screen title (`web.58`); Ace's Help (`c3LanDir`) and the help paragraph that cite it
  follow, in the 83 languages.
  Login modes leak nothing but the nickname (`web.59`). Training: the early return in
  `onServerOrGuestChange()` skipped the LAN list re-derive, so the list (and its lock on the
  address fields) stayed after LAN → training; it now calls `LanDirUI.sync()` and hides it.
  Internet: the TLS row read the gear state before the gear was closed for that mode, so it
  showed after LAN with the gear open. Guest tick: the first visit of a mode inherited the tick
  of the mode left; it now starts unticked (each mode then keeps its own). New
  `scripts/test-login-modes-browser.mjs` walks the 30 two- and three-step paths and compares
  each final screen with a fresh visit (10 of them failed before).
  LAN list as a custom drop-down (`web.60`): same family as « Game type » (`.gt-dd`): the
  native `#lan-dir-sel` stays the source of truth (hidden), a button + `role=listbox` list
  opens right under the field instead of the system picker (iOS wheel / popover), with real
  status dots; keyboard (↑ ↓ Home End Enter Space Esc Tab), outside click, and a keynav
  surface so Escape closes the list without leaving the LAN form. « Propose my server » is the
  list's last line (`__propose__`: opens the dialog, the selection stays); the button remains
  only when there is no list. Label « Server » (was « Choose a server »); Ace's Help, help
  paragraph and hotspots follow, 83 languages.
  The selected server's details (status, board reset, event end, description, link) are centred
  like the `.status` sentence under « Connect » (`web.61`).
  Login header fold (`web.62`, variant « C » of the mock-up): in a mode (step 2) the
  `.card-logo` block folds (max-height / opacity, 0.38 s, none with reduced motion) and gets
  `aria-hidden`; a 28 px chip (`.lb-chip`) fades in at the end of the « ‹ mode » bar; back on
  step 1 the logo returns. Driven by `loginHeaderFold()` from `loginPickMode` /
  `loginBackToStep1`. About 175 px freed on a phone.
  Shared motion (`web.63`): `pthMotion` (inline in the client head) — `slide(el, show,
  guard)` for in-flow blocks (height + opacity, the parent's flex gap absorbed by a negative
  margin) and `pop(el, show, parts, done)` for overlays (veil fade, card rise); both skip to the
  end state with reduced motion (system or `html.reduce-fx`) or without `element.animate`. Used
  by the gear (`#conn-advanced` and the rows it drives, with a guard so a quick reopen wins), the
  avatar window (fade-out before the usual close; a fading window counts as closed for its toggle
  and for Escape/keynav) and the LAN server list (CSS entry animation). Motion checks added to
  `test-login-modes-browser`.
- **Day and night on the admin world map** — a « Day / night » button on Traffic › World (on by
  default, remembered per browser) shades where it is night right now, in four steps: below the
  horizon, then the end of the civil, nautical and astronomical twilights, with the point where the
  sun stands overhead. The sun is placed with the NOAA formulas (declination and equation of
  time), so the night leans with the season and the hemisphere (midnight sun, polar night). The
  country card adds the local time (legal time through `Intl`, summer time included; the main zone
  for a country on several) and the sunset at the centre of the country. Everything is computed in
  the admin page and redrawn every minute while the map is on screen; the map asset gains the
  projection parameters, a centroid and a main zone per country (`public/vendor/world-110m.json`).
  No proxy change (`web.39`). The button is an On / Off switch that shows its state (`web.40`).
  The map is fetched by revision (`world-110m.json?rev=2`, `GEO_MAP_REV`): an installed app or a
  browser could keep the previous file for a day (HTTP cache, service worker), with no projection
  or zones, and showed the switch On with no night drawn (`web.45`).
- **Save, share or copy a studio portrait** — a ⋯ button on the « Create » preview (also a long
  press or right click on it) opens a small menu: save as `pokerth-avatar.png`, share (Web Share,
  when the browser can share files) or copy to the clipboard. The portrait is re-rendered from its
  recipe as a 512 px PNG, prepared when the menu opens so Share / Copy keep the tap's user
  activation (`ui/avatar-studio.mjs`, 6 new keys in every language, `web.38`).
- **« Hide bots » in the admin traffic stats** — visits from detected automation are counted
  apart and left out of every Traffic view by default (toggle in the Traffic header, remembered
  per browser; off = everything, `?bots=1`). A ping is automated when its User-Agent is a robot's
  (the existing `UA_BOT` list: Googlebot, HeadlessChrome, curl…) or when the browser says it is
  driven by a program: the client now sends `navigator.webdriver` as `wd` with the visit, mode,
  Ace's Help and music pings. Such pings go to `bt` — in the day bucket, the hourly cell and the
  all-time store (`visitsStore.bt`: own device sets, so cohorts never see a bot) — and are never
  deleted; the header and « Who visits » say how many were hidden. The World country card adds
  sessions per 100 visits, the bot visits hidden for that country, and flags a country that still
  looks automated (5+ visits, all new devices, no game opened) with a « bot? » tag: a well
  disguised robot passes the filter, it is shown, not removed. Applies to pings counted from this
  version on (`web.36`).
- **« Last 24 hours » in the admin traffic period selector** — true sliding 24 hours on every
  view of the Traffic tab, not the calendar day: the proxy now also keeps an hourly cell per hour
  in the day bucket (`hc[h]`, same fields as the day: visits, hashed ids, new / returning,
  sessions per mode, /live, systems, browsers, languages, sources, music plays, Ace's Help, world
  map), kept three days (the previous 24 hours are the comparison) then pruned. `/admin/visits
  ?hours=24` builds the usual summary from those cells: 24 hourly points, the tile against the
  previous 24 hours, « Who visits », sources, music, Ace's Help, language trend (last 24 h vs the
  24 before), time of day and the pokerth.net share by hour. Cohorts, measured in whole days, are
  not shown at 24 hours; no view falls back to all-time totals there. Hour-by-hour figures are
  complete one day after the proxy restarts (`web.29`).
- **A world map in the admin traffic stats (Traffic › World)** — visits and sessions by country,
  as a choropleth (log scale) with a filter by entry mode (all visits, Internet, Training, LAN,
  /live), region views (World, Europe, Americas, Asia, Africa), a country card (sessions per mode,
  new devices, installed app, phone or tablet) and the ranked list of countries, all following the
  common period selector. The country comes from the browser time zone sent with the anonymous
  `/__visit` ping (`tz`), mapped by a closed table (`server/geo-stats.js`; unknown zones → `ZZ`):
  no IP address is read and no GeoIP database is shipped. Only per-country totals are kept — per
  day in the visit bucket (`geo`), and per hour for a sliding 24 h view (`/admin/geo?hours=24`;
  in the hourly cells `hc[h].geo` since `web.29`). Pings without `tz` (older clients) are left out of the map.
  The map is a pre-projected SVG path set (`public/vendor/world-110m.json`, Natural Earth 1:110m
  via world-atlas, ISC), not precached: admin only. The privacy notice says it, in every language
  (`pvSrv1`, `privacy.html`) (`web.28`).
- **pokerth.net vs web client, in the admin traffic stats** — every 5 minutes the proxy records the
  official live counters (online, tables, waiting, today; same cached read as the login card) and
  the web client players signed in to pokerth.net at that instant (proxy bridges + direct players'
  notify channels; /live apart), folded hourly into the daily bucket (`ps`, `pthSince`). The
  « Connections » card charts players online vs web client over 48 h, the web client share per
  hour, and the daily share (mean, at peak, /live) over the selected period (`web.9`).
- **Sessions per hour by entry mode, in the admin traffic stats** — a stacked 48-hour bar chart at
  the top of the « Connections » card (Activity tab): Internet (pokerth.net), Training (bots), LAN /
  dedicated and /live, hour by hour, with a toggleable legend and a tap/hover readout. The proxy now
  keeps an hourly bucket per mode next to the daily one (`hm`, `modeHourSince`); hours before the
  restart are empty, not quiet (`web.7`). Every other bar chart of the traffic tabs (last 48 h
  visits, time of day, active days, new devices per day) now answers a tap on mobile too, with the
  same readout as the line and stacked charts, instead of a mouse-only tooltip (`web.8`).
- **Page lifecycle and disconnect reasons in the debug log** — each page start now records how it
  was opened (`navigate` / `reload` / `back_forward`), whether the browser had discarded the tab,
  and how the previous page ended (normal unload, killed in the background, or died in the
  foreground), from a lifecycle marker kept in `localStorage` (`pth_dbg_life`). Background /
  foreground switches, browser freeze, offline / online, the WebSocket close code and every
  automatic reconnect with its trigger are logged too, flushed to disk immediately — so a player
  dropped from a game can hand over the cause, which the server only sees as a TCP close (`web.4`).
- **Where visitors come from, in the admin traffic stats** — the visit ping now carries the
  landing source, read in the page head before share and invite links are cleaned from the
  address bar: the `utm_source` tag, else the referring site's host name (never its path or
  query), else a table invite link, else one of the site's own pages, else a `?lang=` link, else
  direct. One key per visit, counted per day for all visits, for new visitors, and for new
  visitors by language (`server/ref-stats.js`, capped per day); shown in « Who visits » for the
  selected period and included in the JSON export. The privacy page says so (`web.5`).
- **Type anywhere in the lobby to chat** — a printable key pressed while no text field has the
  focus goes into the lobby chat input (forum request). Lobby only: at the table single keys are
  actions (Fold/Call/Raise/All-In letters, Space, 1/2/3). Modifier shortcuts, IME composition,
  open windows and Space on a focused control are left alone; AltGr characters and dead keys
  work. New module `ui/lobby-typechat.mjs`, option `lobby_type_chat` (Chat, on by default, admin
  kill switch), key `advLobbyTypeChat` and a help row in the 83 languages,
  `test-lobby-typechat` (`web.32`).

### Fixed
- **Edge on Android and iPhone counted as Edge** (`web.151`) — Admin › Visitors (`UA_BROWSER` in `proxy.js`) and
  the device label of Admin › Errors / sessions (`_seDev`, `admin.html`) only knew desktop Edge's `Edg/`: Edge on
  Android (`EdgA/`) was counted as Chrome, on iPhone / iPad (`EdgiOS/`) as Safari, legacy Edge (`Edge/`) as Chrome.
  Totals already recorded keep their old label. `scripts/test-ua-browser.mjs` (`npm run test:ua-browser`).
- **Avatar « Save image » no longer relaunches the iOS app** (`web.149`, `150`) — in a home-screen app on
  iPhone / iPad, the `<a download>` of the blob navigated the app's single web view to the file preview, and
  closing it relaunched the app. There the menu now hides Save and keeps Share (`navigator.share`; the sheet's
  « Save Image » writes to Photos); `web.149` routed Save to the same sheet, a duplicate. Safari tabs and other
  platforms keep both entries (`ui/avatar-studio.mjs`).
- **Code file answered with a 5xx no longer breaks the page** (`web.147`) — the service worker's network-first
  handler for JS/MJS/CSS passed any non-200 straight to the page, so a Cloudflare 52x burst between the edge
  and the origin failed the `<script type=module>` even though the same build's copy sat in the precache. A
  5xx now falls back to that cached copy (same `CACHE_VERSION`, no version skew); a 404 still passes through.
- **Load-failure outcomes reach Admin › Errors** (`web.147`) — `errreport.mjs` caps a session at 5 distinct
  signatures; three failed module tags filled them with « Failed to load » + two probes, so the third probe and
  the « retry recovered / giving up » line that says how it ended were dropped. Probes and retry outcomes
  (scripts and language files) now have their own budget of 8 (`scripts/test-errreport.mjs`).
- **Training → LAN / Internet without a reload** (`web.145`) — the training fake server answered Init with a
  4-byte session GUID, which the client kept and replayed as `InitMessage.myLastSessionId` on the next network
  login. The server's `NetPacketValidator::ValidateInitMessage` only accepts 16 bytes and closes the session
  otherwise, so every attempt (and every automatic retry) dropped at once until a page reload. `onInitAck` no
  longer keeps a training GUID, `buildInit` sends the field only when it is exactly 16 bytes, and the fake
  server now issues 16 bytes. `scripts/test-offline-to-network-browser.mjs` covers it through `proxy.js`.
- **Training → LAN / Internet without a reload** (`web.145`) — the training fake server answered Init with a
  4-byte session GUID, which the client kept and replayed as `InitMessage.myLastSessionId` on the next network
  login. The server's `NetPacketValidator::ValidateInitMessage` only accepts 16 bytes and closes the session
  otherwise, so every attempt (and every automatic retry) dropped at once until a page reload. `onInitAck` no
  longer keeps a training GUID, `buildInit` sends the field only when it is exactly 16 bytes, and the fake
  server now issues 16 bytes. `scripts/test-offline-to-network-browser.mjs` covers it through `proxy.js`.
- **sql.js load no longer hangs; less injected-script noise** (`web.140`) — sql.js fetches its `.wasm` with
  `fetch().then()` and no rejection handler: one failed fetch raised « Unhandled rejection: Failed to fetch » and
  left `initSqlJs()` pending forever, so .pdb export, import and autosave waited on it for the whole session.
  `handlog.mjs` now fetches the binary itself (3 attempts, cache-busted), passes it as `wasmBinary`, rejects on
  final failure and starts over on the next call (`scripts/test-sqljs-load.mjs`). The error collector also drops
  two kinds of browser-injected noise: inline scripts of iOS wallet browsers touching `window.ethereum`, and the
  `/via_inject_blocker.css` stylesheet Via Browser (Android) adds under a fake same-origin path.
- **Admin audit of 2026-10-18** (`web.137`) — on a phone the game-server strip of the header covered the page
  title and pushed the whole page 8 px past the right edge (it is painted with an inline display, so the rule
  meant to hide it never applied): the header now wraps, the title keeps its room and the strip takes a second
  row. « Update available <sha> » kept naming the commit of the first check: after « Update (no restart) », a
  static roll-back or an automatic static deploy the reading is dropped and the upstream read again (20 s and
  90 s later); auto-update re-reads the upstream every 15 minutes even while an update waits for an empty
  server; an open dashboard keeps an existing reading fresh; the announcement says how old it is. Statistics ›
  /live spectator view lists the chosen period in order (14 days came after 30). On a phone a source name kept
  only « Campaign · ... »: bar rows give the name 11em before the counts wrap. A folded card's fields were still
  reachable with Tab (now hidden once folded, aria-expanded on the title). Internet tile: a figure no longer
  splits from its words. New test `test-admin-audit-fixes.mjs`.
- **Extra large on a phone: community cards over the side seats** (`web.136`) — in portrait the seat layout
  now receives the Interface size too, and above standard size the side columns hug the 4 px wall instead of
  stopping at the QML 15 %/85 % minimum (both the touch rows and the fixed fractions), so the doubled cards keep
  the width between them (10 seats at 390×844). Last failure of `test-accessibility-browser` (41/41);
  `docs/screenshots/25` regenerated.
- **Failing browser tests: three player bugs behind them** (`web.135`) — the desktop action bar
  (`data-abar-desk`, `#s-game#s-game` rules) fixed Fold / Call / Raise at 15 px and beat the low-vision scaling:
  its row, buttons and labels now follow `--active-play-scale`, and changing the Interface size re-measures the room
  kept under the table (`updateBottomLayout`) before the seats are placed again. The table's connection pill
  (`#g-conn-pill`) ran off a phone screen with a long message: `_fitConnPill()` caps it at the widest the screen
  allows (in the table's own scale) and wraps its lines, on resize too. `keynav.mjs` let Escape go back to the mode choice while the LAN
  server list was open: an open drop-down (`[aria-haspopup][aria-expanded=true]`, a visible listbox) now handles its
  own Escape. Tests: the guide tests count six header menus (the arcade page) and switch off the local backup
  offer of a fresh browser, which comes first (`test-guide-lang-first` now checks that offer in French too); the
  accessibility screenshots hide the build number and accept a sub-pixel layout difference (2 % of pixels at most),
  text fit is measured with the login suits at rest, and an Interface size is applied before anything is measured.
  `test-screen-matrix` and `test-table-sweep` pass; they need about 14 and 6 minutes. Still failing:
  `test-accessibility-browser`, Extra large on a phone with ten seats (a community card overlaps a side seat).
- **Table and deck names with an « & »** (`web.129`) — the name read from a pack's XML kept its entity
  (`Ivoire &amp; Chene` in the admin list): `tables-manifest.mjs` and `decks-manifest.mjs` now decode it.
- **What the proxy stores for Traffic and Errors** (`web.116`) — one robot rule, `server/ua-bot.js`, for the visit
  counts, the language diagnostics and the Errors list: the old `/bot/` caught CUBOT phones (real players) while the
  Errors tab used a narrower regex of its own; the proxy now sends the classification with each error group. A
  robot's system, browser and language go to `bt.env` instead of the people's running totals (merged back when bots
  are shown). *All time* devices come from `totalU` / `totalLU`, counters that only grow — `allU` is pruned with the
  day buckets, so its size was not "all time" after 400 days; the buckets now go by date, not by count, so gaps no
  longer keep year-old days. MySQL mirror: the first flush after midnight writes yesterday's row once more (its last
  seconds were lost) and connecting writes every day still held. Errors: the group signature drops line, column and
  `?v=`, so a bug stays one group across deployments; IPs are counted up to 500 (`500+` said) instead of stopping
  at 12, user agents up to 40; the list says it counts since the proxy started. `scripts/test-stats-store.mjs`.
- **Traffic figures compare like with like** (`web.115`) — *Last 7 days* and the period tile set today so far plus the
  days before against as many complete days, and the mean, slope, halves and trend line read a series ending with
  today so far: a drop every morning. The arrows now compare complete days (complete hours for 24 h, new `full`
  windows in `/admin/visits`) and say so; the readings leave the day in progress out, the charts still draw it.
  On the night clocks go back, hour 02 was read twice in every 24 h / 48 h view: the hours are walked through
  `_hourInstants`, one per local cell. The music trend took "today" and its start day from the browser's zone; it
  uses the server's day keys (`todayKey`, `musicSinceKey`). A slow Traffic answer can no longer paint over a newer
  one. Cohorts say they count people only when bots are shown. `test-music-stats` follows the web.114 wording
  (it still looked for the removed `pm2` advice). `scripts/test-stats-fair.mjs`.
- **Admin leftovers** (`web.114`) — the panel no longer advises `pm2 restart pokerth-web` (the *Restart* button now works
  on every install) and the login screen says the token is `STATS_ADMIN_TOKEN` in `.env` on Docker. The last entry
  mode on cannot be switched off (refused by `/admin/config` before anything changes, and by the panel), and a
  refused or failed toggle goes back to the stored state. A new delegate key is copied through `copyText` (works on
  an http LAN panel), leaves the screen after two minutes or when the Keys tab is left, and revocation errors are
  shown inline instead of `alert()`. *Effective target* mirrors the client's rule: Direct only applies to a
  pokerth.net host, which the browser reaches at `wss://www.pokerth.net/pthlive`; any other host goes through the
  proxy. `scripts/test-admin-guards.mjs`.
- **Admin tabs show what the server holds** (`web.113`) — Deployment, Access, Identity, Proxy and Defaults loaded once at
  login and then went stale; each now reloads on opening. After every successful save the settings are re-read, so a
  field shows what was really stored (the proxy trims, clamps and drops invalid values; before, *Saved.* sat next to a
  value that had been refused). A card holds its unsaved edit until a save made from it succeeds, and no re-read runs
  over it — including the one *Health & logs* used to trigger, and the kill-switch save that reset the live-figures
  and community-events cards, and the Traffic refresh that reset the database form. A failed request no longer leaves
  *Loading…* on screen (Game servers, LAN directory, Traffic, Sessions). The two session-expiry messages are in
  English like the rest of the panel. `scripts/test-admin-reload.mjs`.
- **Scheduled messages fire at the time typed; edited notices keep their languages** (`web.112`) — the proxy computes
  *Daily / Weekly / Monthly at HH:MM* in its own zone, while the Broadcasts tab read the date fields (once, start,
  end, countdown) and showed every time in the browser's zone, labelled with the server's: from a browser in another
  zone a message went out hours off. The whole tab now reads and shows server time (`bcWall` / `bcFmt`, DST-safe),
  and says how far the browser is from it. `_parseHM` refuses minute 60; *Enable / Send now / Delete* report a
  refusal. Guest / account / LAN notices: the editor shows every built-in language pre-filled and an unchanged one
  is not stored, so as soon as one language was edited the other 82 were no longer served (machine translation
  instead); `_noticeWithDefaults` now lays the authored languages over the built-in ones, and `es-419` reads the
  Spanish text. `scripts/test-broadcast-tz.mjs`.
- **Admin settings backup: nothing lost, nothing secret leaked** (`web.111`) — `musicVotesPublic` was missing from the
  import allow-list and a backup → restore wiped it; the list is now `ADMIN_CONFIG_KEYS`, and
  `scripts/test-admin-config-io.mjs` fails when code writes a key it does not hold. The file leaves out the Discord
  webhook and the contact of pending LAN requests unless *Include…* is ticked (`?secrets=1`), says so in a
  `redacted` list, and restoring it keeps the current values instead of erasing them. The download goes through the
  `Authorization` header (it put the token in the URL); a restore rebuilds the SEO and serverlist caches and reloads
  the panel. *Game servers*: the rows keep their TLS pins (*Save all* used to erase them) and gain a *Key pins* field;
  *Remove* asks first and no longer shifts the unsaved markers onto the wrong rows; the host placeholder no longer
  shows a private address.
- **Admin kill switches switch features off** (`web.110`) — 9 of the 21 switches only greyed out the checkbox: the
  module behind them read `localStorage` directly and kept running (`err_report`, `polls`, `hud_on`,
  `stats_track`, `chat_abbrev`, `keynav`, `back_guard`, `pdb_auto`, `splash`; `table_zoom` in part). New
  `modules/feature-off.mjs` (`featureOff(key)`), asked by every direct reader; the last list is kept in
  `pth_feature_off` and restored by `pokerth-client.html` before the modules load, so what runs only at startup
  (splash, back guard) follows from the next visit, and the back guard and the loupe re-read their switch when
  `/app-config` lands. `ace_scenes` and `ace_dance`, already checked by the mascot, join `FEATURE_SWITCHES` (the
  server dropped them). Account sync now writes the player's own choice, not the admin override, and the list is
  left out of the player backup. `scripts/test-feature-off.mjs` fails on any reader that skips the check.
- **First-visit defaults apply on the first visit** (`web.110`) — vibration, voice, assistance and BB display are
  read into `PthState` when the modules load, before `/app-config`; the default written then is now pushed into the
  live state as well, so it no longer waits for the second visit.
- **Admin › Deployment tells the truth** (`web.109`) — *Restart* used `pm2 restart` unconditionally, so it did
  nothing on a Docker install; it now takes the same path as a scheduled *Restart only* (`restartOnlyCmd()`).
  *Back online* waited for any answer and so reported the old process, still serving while git and npm ran: it now
  waits for a process whose uptime is shorter than the time since the click (3 min ceiling). *Update (no restart)*
  reported success after a fixed 2.5 s whatever git returned: the pull now ends with an `[update-nr] ok|failed`
  line that the panel reads. An install without a git checkout gets its update buttons disabled with the reason,
  scheduling falls back to *Restart only*, and `/admin/schedule-restart` refuses an update it could not perform
  (409). Every maintenance button, rollback and schedule button is locked while an action runs; a refused
  *Update automatically* save puts the controls back to what is stored.
- **es-419 derivation test green again** (`web.108`) — the mini-game strings (`web.84`–`102`) and two login help fields
  were written by hand in Latin-American Spanish, so `es-419` was no longer `derive(es)` (29 failures). Those wordings
  are folded into `scripts/es-419-rules.mjs` (narrow rules, as for the Events tab and the avatar maker); `póquer` →
  `póker` is general, so the two advanced options that still said « póquer » in es-419 now match the other 21 strings.
- **Connection watchdog with an active probe** (`web.107`, upstream `934457e` parity) — new `net/watchdog.mjs`: after a
  silence the client sends a PlayerInfoRequest for id `0xFFFFFFFF`, which every server answers and none counts as player
  activity. Table: probe 5 s / notice 10 s / drop 30 s (QML values; the passive watchdog waited up to the action
  timeout + 20 s). Lobby: probe 50 s (just past the 45 s heartbeat) / 60 s / 80 s instead of ~110 s. A late tick (sleep)
  probes at once. Only against servers announcing 2.1+ (`S._srvVer`, from Announce); training, `/live`, hidden tabs
  and older servers keep the passive watchdog, which stands down while the active one runs. The answer is dropped in
  `onPlayerInfoReply`; the notice (`connStalledTitle`, `connStalledMsg`, 83 languages — 30 from the QML catalogues)
  is cleared by the first frame received. A drop runs the usual forced reconnect, which rebinds through the proxy
  under session grace (`scripts/test-watchdog-probe.mjs`).
- **A table invitation does not outlive its session** (`web.106`, upstream `52661f2` parity) — the banner was only
  cleared by Accept / Decline / a newer invitation, so it stayed over the login screen or a new lobby, and Accept joined
  with an invitation made to the previous playerId. `petitions.mjs::_inviteDrop`: `disconnect()` declines it while the
  socket is still open; `onInitAck` (a new server session) drops it silently. A proxy rebind under session grace has no
  InitAck, so the invitation stays valid then (`scripts/test-invite-drop.mjs`).
- **Ghost homonyms: running tables exempt** (`web.105`, upstream `31c0166` parity) — like
  `LobbyHandler::removeStalePlayerListDuplicates`, an older homonym seated at a started table is not hidden: during a
  rejoin the seat keeps the old pid until the next hand. `presence.mjs`: `runningSeatPids(S.games)` passed to
  `ghostPids` by the players panel and the live list; PMs still go to the newest session.
- **A second drop during a rejoin keeps the seat** (`web.104`, upstream `fcd25c4` / `31c0166`) — the server binds a
  reclaimed seat to the new session GUID only when it performs the rejoin at the next hand (`PerformRejoin`), but
  `onJoinGameAck` already stored the new GUID in `pth_resume`, and Init replayed the in-memory GUID first: a drop in
  that window sent a GUID the seat did not carry, and the rejoin was refused. The marker now keeps the seat's GUID
  (`seatGuidForJoin`), moves on at `GameStartRejoin` (`commitSeatGuid`), and Init replays it before the dropped
  session's GUID. Nothing changes in proxy mode while the session grace holds (no new Init); `scripts/test-seat-guid.mjs`.
- **Private messages to a quick reconnect** (`web.103`) — the server can briefly list a nickname twice, the
  dead session keeping its old pid; it rejects every PM. `playerIdByName` walked the never-purged `S.players` cache
  and took the lowest (oldest) pid, so PMs went to the ghost — and to any old pid for the rest of the session.
  New `game/presence.mjs`: only online pids (`S._lobbyPids`), newest session among homonyms (my own session for
  my name). The players panel and the live list hide the ghost rows; the PM « not in the lobby » marker is
  accurate again (`scripts/test-presence.mjs`).
- **Bet keypad keys finger-sized again on very low landscape phones** — the action bar zoom of web.227
  (`--abar-kp` = h/380) also shrank the keypad: 29 px keys drawn 26 px tall on an iPhone in landscape
  (734×343). Under `data-abar-short` the keys and Cancel / OK are lengthened by 1/`--abar-kp`: 29 px on
  screen, as before the zoom. The CI had missed it: WebKit returns zoomed boxes in their unzoomed coordinates,
  which also made the action bar look off-screen there; the test harness now measures drawn boxes
  (`installVisualRect`). (2.1.10-web.77–78)
- **Community cards sized like the QML client with few players (wide tables)** — the landscape
  `communityScale` measured the painted plates: it ignored the QML floor that never counts the top of
  the ring below 0.13 × the zone height (`topOpponentBottomY`), and dropped the bet strip that the QML
  boxes always include, so the cards came out 12–25 % smaller than upstream at 2–4 players (at 3, the
  two side boxes were taken for the top box and the row fell to its floor). Seated, non-compact
  landscape now takes `topOpponentBottomY`, `selfVisualTopY` and `communityCenterY` from the seat
  model (same bisection as `seatlayout.js`); the web guards measured on the real plates (side corridor,
  pot-badge clearance) still apply. Compact landscape, spectator and portrait unchanged (`web.69`).
- **Community cards fill the free band in portrait** — on a phone held upright the row was capped by the
  width of the felt image, which the autofit shrinks to ~74 %: the cards stayed at 1.03–1.08 whatever
  the room (35–38 px wide, up to −45 % vs the band). `#g-table-scaler` now gets the uncapped value
  (band formula of `GamePage.qml`, the empirical ×1.17 of 15/09 kept, screen cap (width − 16)/264
  re-applied after it); the root keeps the capped value, so large own cards and the mini-board are
  unchanged. `autoScaleTable` measures the scaler at `--comm-scale: 1`, so the row size can no longer
  feed back into the autofit (`web.70`). The empirical ×1.17 is then dropped: the portrait scale is now
  strictly `GamePage.qml`'s `max(0.55, min(1.8, band/62, (width − 16)/264))` — with 2–3 players the row
  spans the screen width like upstream, and it no longer runs ~12 % larger than upstream at 4–6 players
  (where the pucks touched the pot badge) (`web.71`).
- **Dealer / blind pucks off the pot in portrait (4 players)** — with TL · TC · TR the side boxes leave
  ~45 px for a 40 px puck: at its 8 px gap the left puck hit the right box, `puck-dodge.mjs` moved it
  below the box, and the pot badge was not an obstacle, so it landed on the pot. The pot badge and the
  winning-hand badge are now obstacles; a side puck that does not fit is first squeezed into the gap
  (centred, `--seat-bet-gap-r/l` on the seat, at most half over its own box) before changing side; with
  no free side, the least-overlap placement wins (pot and cards weigh 3×, off-zone excluded) (`web.72`).
- **Portrait phone: steadier seat and card sizes (web adjustment, deliberate departure from QML)** —
  upstream's mobile `fillCap` ramps from 1.15 (1 opponent) to 2.0 (6), so with 4 players (TL · TC · TR)
  nothing else limits the seats and they peaked at ~1.45 vs ~1.15 at 3 and 5 players; and with 2–3
  players the band is so tall that the community row spanned the screen width. Seats are now capped at
  1.2 and the row at 70 % of the zone width (upstream's own landscape bound) on portrait phones: on a
  393 px wide phone the cards are 44–48 px at every table size, seats 1.11–1.2. Desktop portrait and
  landscape unchanged (`web.73`).
- **Desktop: the board never shrinks when players leave (web adjustment)** — upstream has the same dip:
  from 3 to 6 players the boxes grow (box scale ~1.75 vs ~1.2–1.3 at 10) and eat the middle band, so the
  board came out smaller than at a full table (1912×729: 1.24–1.55 vs 1.80; 1366×573: 0.98–1.17 vs 1.63).
  Seated, non-compact landscape now never goes below the QML `communityScale` of a full table (9
  opponents) in the same window (`_qmlLandscapeCommScale`, `layout.mjs`), bounded by the real room
  between the top box (bet strip included; + 26·s in classic style) and the self box (pot badge 69·cs
  above the centre, winning-hand badge 62·cs below); when the QML barycentre sits too close to the self
  box, the row moves up just enough. The measured guards (side corridor, pot-badge clearance) still
  apply. Constant board size on 1280×720 → 2560×1300, 2–10 players; overlap audit clean (`web.80`).
- **Studio / photo avatars fill a square seat frame** — the avatar image kept a forced
  circle (`border-radius: 50%`) even in the QML seat structure, whose frame is square: it now
  inherits the frame's shape, round in classic seats, square in QML seats (`pokerth.css`, `web.37`).
- **« More help » usable on a phone from the create page** — the Ace stands at mid-screen there,
  and the panel was capped to the room above him: only its title, search box and tabs showed. When
  that room is too short the panel now opens under the header with the full screen height, over
  the Ace (`mascot/guide.mjs`, `web.30`).
- **Admin chart readouts line up on mobile** — the value of each row floated right after its label;
  in a bubble measured narrow (near the right edge of a phone screen) it dropped onto the next row,
  so values read against the wrong series and the first row showed none. Rows are now one flex line
  (swatch, label shortened with an ellipsis if needed, value), and the bubble is measured at full
  width before it is placed (`web.26`).
- **Split pots in the win % estimate** — a tie always counted as half a pot, whatever the number
  of players sharing it (a board royal flush at four seats gave 50 % instead of 25 %). The sync
  and async estimates now credit `1/(n+1)` for `n` tied opponents, the formula of upstream's
  `EquityCalculator`; `scripts/test-odds-panel.mjs` covers 2, 3 and 4-way splits. Reported in
  issue #5 (`web.23`).
- **The local backup offer speaks the player's language** — it was drawn at boot, before the
  language catalogue had loaded, and kept the English fallback; the Ace's bubble and the banner now
  follow `pth:langchange` (`web.20`).
- **The board no longer changes size at every action** — the size of the community cards (and the
  width of the action bar, which follows it) was computed from the position of my own box before
  that box was pinned to the bottom of the table, so each render measured where the previous one
  had left it: the size alternated between two values at every player action (1.684 / 1.699 at
  1440x900, 0.551 / 0.605 on an iPhone in landscape - the cards changed by 10 %), and a window
  resize left the table 2 px off. The box is now pinned before the measure (`web.19`).
- **The create-table buttons are no longer cut in long languages** — from 600 px wide the
  Reset / Cancel / Create buttons share one line; on a landscape phone « Create » was cut in
  Greek, Hungarian, Armenian, Kyrgyz and Malayalam, « Cancel » in Armenian, Kyrgyz and Tajik.
  A button is now never narrower than its label and « Create » wraps to its own line when the
  three do not fit, as on portrait phones; where everything fits nothing moves (`web.18`).
- **The top seat stays inside the table in a short desktop window** — under 600 px tall without a
  touch screen, the top box went 2 to 4 px under the info bar: the QML geometry puts it against the
  zone top for a box of the QML base height, and the web box is a few pixels taller on desktop.
  New `game/seat-top-clamp.mjs` moves a seat whose plate starts above the zone down by exactly
  that amount after the layout; the QML geometry is unchanged, phones are untouched (`web.17`).
- **The table name no longer runs under the header buttons** — the name is centred on the bar
  with a maximum of 72 % of the screen, whatever the buttons on its right; on a portrait tablet
  (iPad Mini, 768 px) a long name went under the sound button. New `ui/header-title-fit.mjs`
  measures the room the visible buttons leave (admin buttons included, re-measured on resize) and
  the name ends in « … » there (`web.16`).
- **The login card no longer hides the Discord / pokerth.net / GitHub links on short screens** —
  on a desktop or tablet 600 to 900 px tall (1280x720, 1366x768, a tablet in landscape) the
  Internet login card was taller than the room above the footer and, stacked above it on
  purpose, covered the three links, with « Not registered yet? » on top of them. The footer now
  follows the card there, as on phones since `web.97`; the screen scrolls when both do not fit
  (`web.15`).
- **Player names are back in the lobby's « Players online » list on wide screens** — from 900 px
  wide, the fixed columns (avatar, star, in game, country, actions: 228 px) filled the whole row
  of the 240 px default column, so the name column was 0 px and no nickname showed, on every
  desktop and in all three engines. The column now never gets narrower than its visible columns
  plus 60 px for the name (recomputed for hidden columns, the admin hammer, the Invite column and
  a classic scroll bar); the centre column keeps 334 px so the « Create a table » button still
  fits at 900 px. A column the player widened by hand is unchanged (`web.14`).
- **The admin error list scrolls** — past 15 errors the list keeps the height of its first 15
  lines and scrolls vertically inside the card, instead of stretching the page; a Dismiss keeps
  the scroll position (`web.13`).
- **A file vanishing mid-request can no longer crash the proxy** — static files that are not
  compressed (fonts, images, audio, wasm) were streamed with no error listener, so a file removed
  or replaced between the 5-second stat cache and the open (a deploy, a disk hiccup) raised an
  uncaught exception: proxy down, every game dropped, pages half-loaded during the PM2 restart.
  The response is now aborted cleanly (the page's load-failure retry takes over) and logged, and
  the read stream is closed when the client disconnects, which also stops aborted audio range
  requests from holding a file descriptor (`web.12`).
- **Search-engine crawlers are marked in the admin error list** — Googlebot's renderer keeps
  our scripts cached for days regardless of HTTP headers, then runs a fresh module next to a
  stale one (« does not provide an export named … »): 76 reports in one evening, none from a
  player. Errors are still recorded, but a crawler User-Agent (`xxxbot/`, `xxxbot;`, a `+http`
  contact URL, spider/crawl/slurp, HeadlessChrome, Lighthouse) is shown as « Bot (name) » and the
  line is tagged « Bot only » or « incl. bots » — deliberately narrower than the bot *measure*
  `UA_BOT`, which would also catch real players on CUBOT phones. `web.10` dropped those reports
  outright; `web.11` keeps them, tagged.
- **Seat recovery after a reload in a long game** — the `pth_resume` marker that replays
  `myLastSessionId` after a full page reload was only stamped at `JoinGameAck`, so its 5-minute
  window had always expired in a game older than 5 minutes: the reloaded tab logged in without
  the previous session GUID and landed in the lobby while its game was still running (server
  log, 2026-10-08). The timestamp is now refreshed on every hand and when the page is hidden or
  unloaded, so the window counts from the drop, like the server's 300 s (`web.3`).
- **Ace's Help on iOS 16.3 and older** — `guide/knowledge.mjs` used a regex lookbehind, a parse
  error on Safari < 16.4 that kept the whole assistant from loading (seen in the client error
  reports); the sentence splitter is rewritten without it (fuzz-checked identical output), and
  `scripts/test-no-lookbehind.mjs` keeps lookbehinds out of served code (`web.1`).

### Upstream 2.1.10 parity
Every client-side item of the upstream 2.1.10 release was already in the 2.1.9-web line:
- **Ace's Help** — the QML port of the web client's assistant (upstream `42127b5`, `7dadfa8`; web since `web.259`).
- **BBC game dates** in the forum news (upstream `43382ba`, `c0fdc89`, `f0ea7de`; Events tab, `web.237`, `241`).
- **Lobby footer server time** (upstream `f01d1db`, `735a793`; `web.167`–`168`).
- **Reports reserved for registered players** (upstream `04f5839`; `web.251`).
- **Mobile zoom follows a redistributed seat ring** (upstream `a6d4f05`; `web.65`).
- **Big blind never posted twice in a row** (upstream `b6f5f7c`, issue #541; offline engine, `web.64`).
- **A short-stack call is an all-in** (upstream `660eaed`; offline engine, `web.309`).
- **Spelling and grammar pass** (upstream `449c34b`, `2dea699`): none of the corrected strings exist in the web client.

Not applicable: the audio-device crash (native audio stack), the widget invitation crash and the
widget discontinuation, Android and Windows builds, and server-only changes (shadow mute,
ProtonVPN block, game report after disconnects, avatar cache). The server keeps accepting
the web client at any version (`MIN_BUILD_ID_WEB` = 0.0.0).

## 2.1.9-web line (2026)

Opened with `v2.1.9-web.0` (2026-09-12), following the upstream **2.1.9**
release. Per-build detail is on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
highlights below.

### Added
- **Ace's Help, the in-app assistant** — the Ace explains every screen in context (login, lobby, waiting rooms, game creation, windows, table), answers a tap on any element in « ? » mode, opens the help corpus in his panel (« More about it », « More help »), gives a guided tour of the game creation form and explains bot levels, rankings and forum posts; anonymous usage statistics in the admin dashboard (`web.259`–`291`; `proxy.js` and `server/guide-stats.js` changed). The old help window is retired (`web.270`, maintainer's agreement).
- **« The Ace », animated mascot** — idle scenes and gags with props, lobby reactions, friends, seasons (`web.217`–`232`, `265`–`266`); he dances to the music player, a dance per tempo changing every bar (`web.281`–`282`); option « The Ace's antics » to turn it off (`web.285`).
- **36 new languages — 83 in total**, each with UI, help and SEO pages: Slovenian, Bosnian, Macedonian, Malay, Albanian, Punjabi, Amharic, Latin-American Spanish (derived from Spanish), Khmer, Telugu, Malayalam, Marathi, Kannada, Gujarati, Icelandic, Uzbek, Burmese, Georgian, Kazakh, Sinhala, Azerbaijani, Armenian, Belarusian, Nepali, Basque, Welsh, Irish, Esperanto, Hausa, Yoruba, Zulu, Kyrgyz, Tajik, Turkmen, Mongolian, Traditional Chinese (Hong Kong); language tooling and a language-count audit (`web.5`–`166`).
- **Forum news « Events » tab** — community events relay `GET /api/events` (`proxy.js`): BBC games with their sign-ups, WEC daily game and finals, Monthly Cup night, the player's own days next to the site's Berlin time, Champions of the day (`web.109`–`130`, `236`–`296`).
- **Avatar studio: toon portraits and « From a photo » (beta)** — toon style with silhouettes, face shapes, hairstyles, beards, outfits, hats, seven skin tones, expressions, a « meaner » poker catalogue and starter characters; a photo becomes a portrait with guided framing (`web.176`–`215`).
- **Help sections on the BBC and the We Cup (WeC)**, opened by the Ace from their elements (`web.273`, `308`); ranking games and cups clarified (`web.256`).
- **Lobby server clock** (Berlin by default, QML parity) and **login screen flourish** (`web.128`, `167`–`168`, `173`).
- **Admin dashboard** — Traffic period selector, phone layout and touch charts, language trend arrows, community events card, Music and Ace's Help sub-tabs with thumbs and trends (`web.121`–`123`, `254`, `299`–`307`; `proxy.js` changed).
- **Smaller additions** — chat notification-sound mute per panel (`web.37`), mobile magnifier mini-board on « my turn » (`web.91`), « full table needed » notice on ranking tables (`web.246`), `/live` one expanded row at a time and « Currently idle » players (`web.28`–`47`, requested by sp0ck).

### Changed
- **Forum news window** — Events tab first, one card look for both tabs, post view and in-place translation, only ↗ opens a site; shared relay cache, fewer upstream requests (`web.172`, `242`–`254`).
- **« More help » is a window on desktop** — moved by its title line, resized from its edges, its box kept and cleared by the reset-windows button; a chapter change updates it in place, no more flicker; command lists wrap instead of pushing their descriptions off a phone screen (`web.310`–`312`).
- **Game style presets** open in training and LAN, folded on pokerth.net (`web.288`); **WeCup renamed We Cup (WeC)** everywhere (`web.308`).
- **Tab names as in the QML client**, 28 languages (`web.279`–`280`).
- **Reports reserved for registered players** (`web.251`); **language catalogues load on demand** (`web.62`).
- **Music player** — the playlist follows the current track, thumbs on the collapsed widget (`web.233`).
- **Table skins** — High Roller, Onyx-Pill and Boardwalk use the generic avatar placement (`web.53`).
- **Chances panel readability**, impossible categories shown dimmed (`web.0`, upstream `f7a8e26d`).

### Fixed
- **Table layout at every size** — desktop action bar (QML geometry, small and low windows fall back to the phone layout), community cards at QML size without jumps, spectator ring, short landscape phones, bet keypad, Large / Extra Large interface sizes (`web.93`–`104`, `221`–`227`, `300`–`301`, [#4](https://github.com/narmod/pokerth-web-client/issues/4)).
- **Mobile magnifier** follow logic at parity with QML 2.1.9 (`web.65`–`66`, `89`–`92`).
- **Reconnection, end of hand and text overflow**, found by new browser tests (`web.95`–`101`).
- **iPhone and installed app** — stray band, bottom strip colour, notch, login card, operator notices, music loop with CarPlay (`web.102`, `105`, `111`, `124`, `291`, `297`).
- **Menus and panels in front of open windows** — header menus, server time panel, login ☰ menu (`web.252`, `255`, `298`).
- **Translations and SEO** — keys left in English, private-message backlog, Traditional Chinese browsers, `pt` / `es-419` hreflang, translated pages synced, es-419 derivation (`web.80`–`108`, `169`–`170`, `277`, `305`).
- **`/live`** — sticky tab bar, folded seats, duplicate players, invite banner shown to spectators, stale online count (`web.15`–`27`, `216`).
- **Offline mode** — boot with no network, big blind posted twice in a row, a call for the whole stack shown as « Call » instead of « All-In » (`web.57`, `64`, `309`, upstream `660eaed`).
- **Avatars** — silent upload failures (`web.1`, upstream `665d80a`), red X on folded players (`web.58`, reported by sp0ck).
- **Ace's Help: first bubble's buttons in English** until it was reopened — labels now read when drawn, catalogue loaded with the help (`web.313`).
- **Miscellaneous** — SVG table-style buttons on reload, double boot splash after an update, invite links to a table, lobby player search autofill, « Via proxy » mode on slow loads, server invitations only at invite-only tables (`web.3`, `171`, `175`, `257`, `283`, `302`).

## 2.1.8-web line (2026)

Opened with `v2.1.8-web.0` (2026-09-01), following the upstream **2.1.8**
release. Per-build detail is on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
highlights below.

### Added
- **Latvian and Estonian**, full UI + help + SEO content pages — 47 languages total (`web.144`–`149`).
- **Player profile reorganised** into Coupes / Local-Entraînement / LAN tabs, reachable and resettable regardless of connection mode (`web.136`–`140`).
- **Low-vision accessibility panel** — interface size, high contrast, browser zoom, extended to login/lobby/desktop/mobile play (`web.122`–`135`, community contribution @seanpianka).
- **LAN tab** in both ranking windows (`web.120`, `136`).
- **Lobby table list navigable by keyboard** (`web.114`, upstream `b170786`).
- **Admin dashboard**: world clock strip with real per-city sky, live server figures, traffic charts, language breakdown (`web.47`–`63`).
- **Game log table-style colours, seat context menu, player notes with star ratings and colour labels**, note exchange with official clients (`web.24`–`46`).
- **Guest and registered-account notices** (`web.28`–`31`, proxy.js changed).
- **Thumbs up/down on the music player** (`web.32`, proxy.js changed).
- **Ivoire & Chêne table style**, upstream port (`web.4`–`5`).

### Changed
- **`/live` embedded spectator mode** built out (own login/header/chat/table list, server figures, storage) then trimmed of player-only features and told apart from the web client in the admin dashboard (`web.63`–`119`).
- **Client identifies as `CLIENT_TYPE_WEB` (0x03)** on the wire (`web.0`, `1`, `119`, `167`, upstream `c7e2959`).
- **Keyboard/focus overhaul** — default buttons, safe-button popup focus, per-screen start focus, arrow-key lists (`web.111`–`118`, upstream `b170786` and follow-ups).
- **Training mode shuffles with a cryptographic RNG** instead of `Math.random` (`web.118`, upstream `40122fe`).
- **Avatars behave like the QML client** — one per session, fixed at login, web-only relay removed (`web.95`, `137`, `166`).
- **Privacy page rewritten** to match what the code actually does (`web.105`).
- **Mobile table geometry and bet placement synced** with upstream 2.1.8 (`web.12`–`14`).

### Fixed
- Assorted **`/live` layout, identification and chrome bugs** across its rollout (`web.66`–`115`).
- **Players-online list** column alignment and hidden-column width bugs (`web.141`, `143`, `154`).
- **Forum news**: a topic already marked read could reappear as unread (`web.142`) — same bug exists upstream, unfixed there.
- **Stale service-worker cache** could serve mismatched JS/CSS after a deploy, or survive a cold boot with no update prompt (`web.121`, `155`).
- **Localized pages served the wrong language to crawlers** instead of the page's own (`web.102`).
- **Offline training mode failed to start with no network** — missing modules now precached (`web.103`).
- **Dead/expired sessions** (inactivity, AFK, disconnect) could leave the client hanging instead of returning to the connect screen (`web.62`, `64`).
- Assorted **table-background, bet-display and reaction-panel colour glitches** on skinned tables (`web.106`, `150`, `152`, `157`, `158`).
- **Accessibility modal focus and touch-target regressions** on mobile (`web.146`, `147`, `153`).

## 2.1.7-web line (2026)

Opened with `v2.1.7-web.0` (2026-08-13), following the upstream **2.1.7**
release, closed at `web.179`. Per-build detail is on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
highlights below.

### Added
- **Disco table style, Blacklight 4c deck and card back**, upstream ports (`web.171`).
- **90 emoji reactions** across three themed pages, new choreographies (`web.151`–`164`).
- **Bet display setting** — bet chip inside the player box or classic (`web.158`, upstream `414a89c`).
- **All content pages translated into all 45 languages** — rules, FAQ, hand-rankings, how-to-play, glossary (`web.82`–`146`).
- **Private messages and a player profile window**, both parity with the QML client (`web.72`–`114`).
- **Five new languages** (Indonesian, Thai, Filipino, Bengali, Swahili) bringing the client to 45 (`web.11`–`15`).
- **Invite friends via link**, bet keypad on touch, custom sounds, music play counter, PWA integration (`web.6`–`70`).
- **BBC Anthem table theme** (`web.5`); automatic updates and weekly leaderboard reset (`web.17`, `40`).
- **Community suggest opened to BBC/WEC admins**, upstream ports (`web.120`–`174`).

### Changed
- **Own client type on the wire** — `CLIENT_TYPE_WEB` (`web.167`, upstream `c7e2959`).
- **Translation fallback and per-account private messages hardened** (`web.161`–`163`).
- **Admin dashboard reorganised** — Traffic tab, SEO panel, session logs (`web.21`–`104`).
- **Static asset delivery hardened** — proxy disk-cache, precache throttling, cache-first app code (`web.178`–`179` + proxy-side).
- **Frozen avatar upload bytes**; long labels wrap instead of truncating (`web.149`, `166`).

### Fixed
- **Reconnect, AFK-kick and dead-session bugs** (`web.56`–`132`).
- **Static asset load failures** now retried in-page against transient Cloudflare errors (`web.176`–`177`).
- **LAN invite links, community suggest output and idle-spectator detection** bugs (`web.169`–`175`).
- **Players list, backup/update banners, iOS status-bar and launch-screen** bugs (`web.4`, `25`, `67`, `94`, `98`, `108`).
- **Contrast bugs on skinned buttons; stale language counts** across docs (`web.16`, `20`, `63`, `64`).

## 2.1.6-web line (2026)

Opened with `v2.1.6-web.0`, following the upstream **2.1.6** release. Granular,
per-build changes for this line are on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
highlights below.

### Added
- **Four right-to-left languages** — Arabic (`ar`), Persian (`fa`), Hebrew
  (`he`) and Urdu (`ur`) — bringing the client to **40 languages**
  (`web.58`/`web.59`). Full UI catalogues and help corpora; like the official
  QML client, the interface layout stays LTR and the browser renders the RTL
  text runs natively. Poker action terms stay in English, as everywhere else.
  Localised hreflang metadata added for the four languages (`web.60`).

## 2.1.5-web line (2026)

Opened with `v2.1.5-web.0` (2026-07-30), following the upstream **2.1.5**
release. The whole 2.1.5 delta is covered; a few items were already in place
ahead of it.

### Added
- **Community suggest.** In an invite game created from a BBC Step or WEC
  preset, the game admin can propose eligible idle players from the lobby chat
  header. Same selection as the legacy bbcbot, so a suggestion matches the one
  the official client would give. The line is shown only to whoever asked and is
  never sent. Off by default, like the official setting.
- **Three table packs and their card backs** — Pirates, Mile High Club and
  Terminus Hotel 2, with the portrait previews the official client uses when the
  screen is in portrait. Upstream attribution kept: the two packs by BaShFX are
  credited to him.
- **Alt+S** opens the settings from anywhere, as in the official client, and
  **Alt+T** opens the statistics panel — a web addition, since the official
  client has no shortcut for it.
- **A search field in the advanced options.** Type a couple of letters and every
  matching setting is listed, whatever category, sub-tab or folded section it
  sits in — a setting can also be found by the name of its section or by one of
  its choices ("Portrait" finds "Seat placement"). Picking a result opens the
  right panel, unfolds the section and highlights the row. Same field and same
  behaviour as the Help window search.
- **The card-dealing animation can be switched off** — a new toggle in the
  advanced options, Cards section (web, on by default), asked for on the
  forum. In the same pass the animation stops flying cards to the chairs of
  knocked-out or departed players: it now targets only the seats actually
  dealt this hand, using the seat list the renderer publishes.

### Changed
- **The translate globe now appears on the line under the pointer**, or on the
  line you tap on a touch screen, instead of on every line. An advanced option
  restores the permanent button.
- **Auto-scroll resumes by itself.** Fifteen seconds after you stop scrolling,
  the chat and the game log return to the newest entry, as the official client
  does. The "jump to latest" bar is gone with it.
- **A bet amount outside the allowed range now asks for a second confirmation**
  instead of being silently clamped — typing 300 with a 250 stack no longer
  fires an all-in with nothing announcing it.
- **The lobby chat is cleared on every new connection**, so the previous
  session's history no longer lingers under a different nickname.
- **Action buttons use their pack's own corner radius.** Fourteen of the
  seventeen table packs declare something other than the default; they were all
  being drawn at the default until now.
- **One automatic reload when a core script fails to load.** The probe added
  in web.94 showed the pattern: a script fails while the very same URL
  answers HTTP 200 a second later — a transient hiccup, not a broken file.
  When that happens before the app has started, the page now reloads itself
  once (per session), after letting the report leave; the boot guard's
  Retry screen remains the fallback.
- **Script load failures now carry a diagnosis.** "Failed to load script" alone
  never said why. When one of our own scripts or stylesheets fails, the page
  now probes the same URL once and reports the HTTP status — or the network
  error name — along with the online state and service-worker presence, so the
  error dashboard can tell a deployment 404 from a flaky connection or a
  content blocker.
- **The disk button on the create form now says "Save prefs".** It shared its
  label with the star pill right above it — both read "My prefs" — so saving
  and loading were two buttons with the same name, and pressing the wrong one
  quietly loaded old settings over freshly typed ones. The star pill keeps
  "My prefs" (it loads them); the disk button now names the action, in all 36
  languages.

### Fixed
- **The "My prefs" pill now works with a ranking game selected.** Ranking
  locks the server-imposed fields, and the lock also disabled the pill that
  loads your saved preferences — trapping anyone whose preferences ARE a
  ranking game: they had to switch to Normal, load, and watch the pill lock
  itself again. The pill stays usable everywhere (it also loads the name,
  timeout and delay, which ranking leaves free, and re-applies the type);
  the style pills stay locked as before. Reported on the forum.
- **Recognising an auto-filled game name no longer depends on the server
  config being loaded.** "My online game" and friends are known statically,
  and admin names once seen are remembered, so a stale auto name saved by an
  earlier build can never masquerade as a player's choice again — not even
  before /app-config answers, and not even if the admin renames the default.
- **A stale tab could keep resetting your preferences.** A sync push is a
  full settings file rebuilt from the pushing device's storage; from a tab or
  installed app left open for days it re-sent old preferences and flattened
  what was set elsewhere in the meantime — the endless "My online game" of
  the forum thread. (Before web.89, a prefix bug meant the game name was the
  only field those stale pushes could touch — hence the original "everything
  is remembered except the game name".) A push now reconciles first: it reads
  the server, applies anything newer — the existing holds protect what was
  just edited locally — and then pushes the merged state. Page-close pushes
  go straight out as before; the next regular push reconciles. The
  preferences panel is also refreshed after every sync descent so it never
  shows values that are no longer stored.
- **A pre-filled table name could bury the one set in the preferences.** Since
  the create form started remembering the last game, it saved the name "as
  typed" — including the default it had filled in itself ("My online game" on
  servers where the admin sets one). That auto name, once saved, permanently
  outranked the name configured in the settings panel. An auto-filled name
  (mode default, admin name, their "… 2" variants, in any language) is no
  longer treated as a player's choice: creating a game with it saves nothing,
  and one saved by an earlier build is ignored on restore — the preferences
  name shines through again. A typed name still wins, as designed. Follow-up
  to the forum report.
- **Killing the app and relaunching it left the connection stuck on "waiting
  for the PokerTH server" for minutes.** The proxy keeps a closed browser's
  game session alive for a grace window so a wifi blip can resume seamlessly
  — and the installed app deliberately keeps the same session id across
  relaunches. But a relaunched page is a blank slate: it waits for the
  server's greeting, and the kept session had greeted long ago, so the two
  waited each other out until the grace expired (connecting the desktop
  client happened to break the deadlock by tearing the ghost down
  server-side). The client now tells the proxy when a connection is a brand
  new handshake; the proxy then closes the ghost — freeing the nickname —
  and opens a fresh line, while a genuine mid-game resume reattaches exactly
  as before. Reconnecting right after closing the app now takes seconds, not
  minutes. Requires a proxy restart to take effect. Reported on the forum.
- **A reconnecting player could end up seated twice** — two identical boxes
  with the same name and stack, doubled dealer and blind pucks, and a table
  crowded enough to shrink the community cards. Nobody can join a running
  game except a rejoin, and the server announces the returning player's new
  session while his old seat still stands, then swaps the ids at the next
  hand. The client treated that announcement as a brand-new chair, and the
  id swap then seated the new id twice. The original chair now wins in every
  message order: no chair is created for a mid-game arrival (players), and
  the id swap drops any duplicate before renaming. Reported on the forum,
  with screenshots.
- **After folding, the action bar kept quoting the live betting.** The buttons
  were already inert once the hand was thrown away, but their amounts went on
  following every raise, which read like an invitation to act. The bar is now
  frozen exactly as it was at the moment of the fold — dead zone and figures
  alike — until the next hand deals it back to life. The playing-mode dropdown
  stays usable, its state is updated surgically. Reported on the forum.
- **An unpushed preferences save could be flattened by the account sync.** The
  sync descent already protected locally-changed toggles (the "I mute the
  sound and it comes back" fix); the table preferences had no such shield, so
  a save made just before closing the page could be overwritten by a newer
  server config.xml on the next login — and, worse, silently dropped, since an
  empty hold also cleared the to-push flag. The whole table-prefs family is
  now held from the descent when locally dirty and pushed back, like the
  toggles. A guard test derives the covered keys from the merge code itself so
  the two can never drift apart.
- **Three internet table settings never merged down from a config.xml.** The
  merge helper prepends the Net prefix itself; handing it already-prefixed
  names made it look up doubly-prefixed keys that never exist, so the internet
  game speed, action timeout and between-hands delay were skipped on every
  import or sync descent while the surrounding fields merged fine.
- **The create form remembered nothing across sessions, and the game name not
  even within one.** The snapshot taken on every game creation still referenced
  two variables that left with the old fill-with-bots checkbox; the resulting
  error was swallowed by the surrounding guard, so the "last form used" memory
  was never written at all — masked for anyone with saved preferences (the disk
  button), which restore most of the same fields. On top of that the writer
  deliberately left the game name out, a leftover from before the name had its
  guards (a blank name is skipped on restore, a name still open in the lobby is
  shifted to "Name 2"). Both fixed: the snapshot is written again, name
  included, as typed. Reported on the forum (ranking-game name lost on
  re-login, and no training-game setting remembered).
- **In a training game the action buttons had the wrong labels for the whole
  pre-flop.** Blinds are money already on the table, and a real PokerTH server
  says so with a dedicated message; the offline engine posted them in silence.
  The client therefore opened every hand believing nobody had bet: under the
  gun it offered Check/Bet instead of Call/Raise, in the big blind Call/Raise
  instead of Check/Bet, and in the small blind it quoted a call worth a whole
  big blind instead of the difference. The pot also ignored the blinds until
  someone actually spoke. Reported on the forum.
- **Community cards, pot badge and felt pills were too small in phone
  portrait.** The table is scaled down to about three quarters in narrow
  portrait so the seat boxes have room around the felt — but the seat boxes
  live outside that scaler, and the community row was paying the reduction
  twice: once through the official portrait formula (which already accounts
  for the free band between the rows) and once through the table scaler. The
  row now reaches the size the official client gives it, and the middle of the
  felt stops looking empty.
- **The poker-hands window now takes the table's colours**, like the chat, the
  game log and the reactions window. It was the only in-game window still
  painted with the application palette, which made it stand out on the skinned
  tables.
- The scrollbar gutter is reserved on the chat and log panels, so text no longer
  shifts when the scrollbar appears.

## 2.1.4-web line (2026)

The `2.1.4-web.N` line opened with `v2.1.4-web.0` (2026-07-22), replacing the
`0.3.x` beta numbering. The in-game screen now tracks the official **2.1.4**
QML build, and the client is live on the official infrastructure at
**[webclient.pokerth.net](https://webclient.pokerth.net/)**. Highlights of the
line so far — fidelity and interface work bringing the client closer to the
official QML client:

### Added
- **Training-mode achievements.** A new **Trophées** tab in the ranking window — shown only inside Training mode, once connected — tracks 27 achievements across Progress, Skill, Play-style, Fun and PokerTH formats: play 100 / 500 / 1000 hands, win 1 / 10 / 50 games, win-streaks, a comeback from under 15% of your stack, a heads-up win, patience, bluffs, all-ins, beating the three difficulty "schools", a completionist meta, and PokerTH-format wins (Ranking, WeCup, BBC, plus a Triple Crown, a Blitz and a rising-blinds milestone). Locked ones are greyed out, a 👥 badge flags achievements that require a set number of players, and unlocking one pops a toast. A compact "X / 27" counter also shows on your own profile card and the end-of-game screen. Fully localised in the 36 languages. Under the hood it's a mode-agnostic module (`public/modules/achievements/`) driven purely by the engine's event stream, so the same system can later plug into other modes.
- **Startup loading screen.** A boot splash matching the login look (theme-aware colours, labels in 36 languages) covers startup until the app is ready, preloading the critical assets with automatic retry and offering a **Retry** button if the connection drops mid-load — so a flaky network no longer leaves a half-loaded UI.
- **Seven official PokerTH card decks** in the deck gallery, plus one-click import
  of a table, card deck or card-back from a `.zip`.
- **A dedicated Music player panel** (game-sound settings moved to Advanced options).
> **Offline needs HTTPS.** A Service Worker — and therefore the whole offline cache — only registers over **HTTPS** (or `localhost`). On a plain `http://` server the game still works online, but there is **no offline cache**, so an installed PWA can't launch (not even Training mode) without a connection. Serve the app over `https://` for offline play.

### Changed
- **Smarter training bots — multi-street aggression.** Bots no longer play each
  street in isolation. When a bot was the last to bet and gets checked to on the
  turn or river, it now keeps *telling the story*: it barrels made hands for
  value, semi-bluffs strong draws on the turn, and on the river polarises into
  value bets, bluffs with busted draws (a draw it chased that missed), and
  checks medium hands down for a free showdown instead of spewing. How often —
  and how far — a bot barrels is tuned by its difficulty and archetype (a
  Calling-station never barrels; a Maniac fires relentlessly), so play feels
  more varied and less predictable than the old "bet once, then give up".
- **Independent Guest-mode toggle per server.** The **Guest mode** checkbox on
  the login screen is now remembered *separately* for the Internet and
  LAN / Dedicated choices — ticking it for one no longer changes the other, and
  each server remembers your last preference across reloads.
- **Closer to the official 2.1.3 client.** The in-game action bar now matches the
  official layout -- localised "Suivre \$X / Relancer \$X" labels, a compact
  All-In / "Tapis" button, and 1/3 / 1/2 / Pot quick-bets in the official green --
  alongside the official gold accent (`#E3C800`), the official app-header height,
  and seat geometry tuned to 2.1.3.
- **Reworked interface.** A unified header banner spans the connect, lobby and
  in-game screens, with frameless monochrome icons and floating menus; the in-game
  header centres the table name with Admin / Public-Private status badges. The
  waiting room was redesigned (your details and chat centre-stage, with an
  expandable per-table player list), and in-game chat, emoji, the hand log and a
  new hand-odds window now open as compact, movable floating windows on the felt
  instead of taking over the screen.
- **Resilient offline cache.** The Service Worker now precaches the app shell **asset by asset (with retries)** instead of one all-or-nothing batch whose failure was silently swallowed, so a network hiccup during install can no longer leave the cache incomplete.

### Removed
- The **Auto-mode selector**, **Quick-bet buttons** and **4-color deck** settings.
  The auto-mode selector and the 1/3 / 1/2 / Pot quick-bets are now always shown
  in the action bar (as in the official client); the web-only 4-color deck option
  is gone — cards use the standard two suit colours.

## 0.3 line — public beta (2026)

The `0.3` line marks the move into public beta. What landed across the
`0.2` -> `0.3` cycle:

### Added
- **Training mode (offline).** 100% in-browser solo play against bots, with no
  server or connection needed -- it works even as an installed PWA.
- **Smarter bots.** Monte-Carlo equity against the real number of opponents,
  five play-style archetypes (Rock, TAG, LAG, Calling-station, Maniac),
  position-aware pre-flop play, continuation bets and semi-bluffs.
- **Multi-axis theming.** Independently selectable UI palette, table felt,
  card deck, action-button style, chip pucks and seat style, with one-click
  presets and live previews.
- **Internationalisation in 36 languages,** auto-detected from the browser
  locale and switchable on the fly.
- **PWA.** Installable app, network-first Service Worker with a "new version"
  banner, and your-turn browser notifications.
- **Shared family leaderboard** with configurable auto-reset, an optional
  MySQL/MariaDB mirror, and per-device session statistics.
- **Admin console** at `/admin` (token-protected and fully hideable): live
  status, one-click self-update, scheduled restarts, package and music
  management, broadcasts, anonymous traffic analytics, and scoped delegate keys.
- **Cross-client emoji reactions** through a shared `/emoji` chat command, plus
  avatars (emoji or custom image) that also reach the official desktop/mobile
  clients over PokerTH's native avatar protocol.
- **Seamless reconnect** across Wi-Fi <-> cellular switches (a 2-minute upstream
  grace period in the proxy) on top of exponential-backoff auto-reconnect.

### Changed
- The in-game table -- its layout, colours and poker terms -- now deliberately
  tracks the official PokerTH QML client for visual and behavioural parity.

### Security
- Proxy hardening: upstream host **and** port allowlists (anti open-relay and
  anti-SSRF), a token-gated admin API, scoped delegate keys, and a relay
  frame-size cap. See [`docs/SECURITY.md`](docs/SECURITY.md).
---
Earlier history (the `0.2.x` build series) is on the
[Releases](https://github.com/narmod/pokerth-web-client/releases) page.

