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

### Changed
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

### Added
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

