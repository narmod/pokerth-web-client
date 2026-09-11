# Changelog

All notable changes to this project are summarised here. It loosely follows
[Keep a Changelog](https://keepachangelog.com/). Since `v2.1.4-web.0`
(2026-07-22) the version tracks the upstream PokerTH release the client is
aligned with, as `MAJOR.MINOR.PATCH-web.N` — a new upstream release resets the
web counter (`2.1.5` → `2.1.5-web.0`). Granular, per-build tags are published on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
this file captures what matters to players and operators.

## 2.1.8-web line (2026)

Opened with `v2.1.8-web.0` (2026-09-01), following the upstream **2.1.8**
release. Per-build detail is on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
highlights below.

### Added
- **Local/Entrainement and LAN: viewable and resettable from ANY mode**
  (`web.140`) — narmod reported that connecting to pokerth.net (or LAN, or
  training) with the same nickname showed empty stats and no sub-tabs for
  the *other* modes' data, and that resetting Local/Entrainement or LAN
  wasn't possible except from their own matching mode. Root cause: both
  panes still read/wrote whichever store `S._statsOffline` pointed to for
  the *current* connection, and hid their Total (and LAN's Classement)
  sub-tab whenever `S._statsEligible`/`S._boardEligible` were false for
  that connection — even though the underlying `pth_life` /
  `pth_life_offline` localStorage stores are per-device and always
  present regardless of what you're currently connected to, and the family
  board (`/stats`) is served by this webclient's own proxy, not gated by
  which poker server you're playing on. Fixed: `_statsBodyLife` now takes
  an optional explicit store key; `stats.mjs` gains `_lifeAllFor`/
  `_lifeResetKey` (reset a named store, decide independently whether to
  push the delete to `/stats`) and `_statsResetLocal`/`_statsResetLan`
  (new explicit reset entry points, callable from any mode).
  `player-popup.mjs`'s `_renderProfileStats` (Local/Entraînement) now
  always reads/resets `pth_life_offline` explicitly and always shows its
  Session/Total sub-tabs; `_renderLanProfileStats` (LAN) always reads/
  resets `pth_life` explicitly and always shows all 3 sub-tabs
  (Session/Total/Classement, `renderBoard` unconditionally). The in-game
  📊 stats overlay (`renderStats`/`_statsReset`) keeps its prior ambient
  (current-mode) behavior, unchanged — this only affects the "Profil du
  joueur" window's two panes. `test-pim-parity.mjs` adds a same-nickname,
  three-mode scenario (pth_life and pth_life_offline both pre-populated,
  connect on pokerth.net, verify each pane shows its own data with no
  mix-up, verify each reset clears only its own store and pushes the
  delete signal only for LAN); `test-player-popup.mjs`'s old "forced back
  to Session when ineligible" case is replaced with the new "always
  reachable" expectation.
- **Player profile: LAN and Local/Training as two always-visible tabs**
  (`web.139`, corrects `web.138`) — the previous single "My statistics" tab
  (label reused from `ppMyStats`) is replaced with two genuinely distinct,
  independently-labelled top-level tabs, per an explicit correction from
  narmod: **Local / Entraînement** (`ppLocalTab`, new key translated across
  all 45 languages — `Local / Training` in English) keeps the Session/Total
  sub-tabs as before (`_renderProfileStats`, unchanged); **LAN** is a
  parallel pane (`_renderLanProfileStats`, `_pimSetLanTab`, own
  `S._pimLanTab` state so the two panes don't clobber each other's
  sub-tab position) carrying its own Session/Total **plus a 3rd
  sub-tab, Classement (the family board, `renderBoard`, with its reset
  button preserved in Total)**. Both tabs are now shown **together,
  always**, for MYSELF regardless of mode — not conditionally hidden per
  eligibility as in `web.138` — degrading gracefully (Session only, or
  Session+Total) when their data doesn't apply to the current connection
  (e.g. LAN's Classement sub-tab absent on pokerth.net or in training).
  Only **Coupes** stays conditional on `onNet` (unchanged, pokerth.net
  only). Default active tab: LAN if `S._boardEligible`, else Coupes if
  `onNet`, else Local/Entraînement (training). `stats.mjs`'s
  `_boardSetSort` now repaints `pp-lan-board-body` (LAN's Classement
  sub-view) instead of the short-lived `pp-lan-wrap` from `web.138`.
  `test-pim-parity.mjs` / `test-player-popup.mjs` updated (tab presence
  regardless of mode, default active tab, LAN's 3 sub-tabs incl. reset,
  graceful degradation); manual jsdom check covers offline training
  (Coupes absent, Local+LAN both present, LAN degrades to Session/Total).
- **Player profile window: three top-level tabs** (`web.138`) — the
  "Player profile" window (`pp-modal`, opened from your own avatar) used to
  stack an always-visible "My statistics" box above a "Cups" block with its
  own internal PokerTH/BBC/WEC sub-tabs — a layout mixing two different
  patterns and, since the LAN fix in `web.137`, mismatched needs (LAN
  players got a stats box with no cups to show below it). Replaced with
  three top-level tabs, one per data source, each shown only where its
  data applies: **Coupes** (PokerTH/BBC/WEC, pokerth.net only) —
  **Local/Entraînement** (session + lifetime stats, unchanged internal
  Session/Total sub-tabs and reset button, shown whenever `S._statsEligible`
  — pokerth.net, LAN/private, or training) — **LAN** (the family
  leaderboard, `renderBoard`, unfiltered, shown only when
  `S._boardEligible`). Default tab: LAN if available, else Coupes, else
  Local/Entraînement (the only one left in training). Opponents' profiles
  are unaffected (cups only, no tab bar — none of the other data is theirs
  to show). The old `.pp-sec` bordered wrapper and the "board" sub-tab of
  `_renderProfileStats` are removed (dead code); `_boardSetSort` (`stats.mjs`)
  now repaints `pp-lan-wrap` instead. No new translated strings — tab
  labels reuse the existing `ppMyStats`/`piCups` keys plus the untranslated
  "LAN" convention. `test-pim-parity.mjs` updated for the new structure
  (tab presence/absence per mode, default active tab, pane show/hide on
  click); manual jsdom check covers the training-only case (single tab).
- **My avatar: stats/reset accessible in LAN / private server** (`web.137`)
  — `_cupsBlockHtml` (`player-popup.mjs`) used to gate its "📊 Player
  profile" button on being connected to pokerth.net (`onNet`), so on LAN
  or a private server there was no way at all to reach the stats window
  (SESSION/TOTAL/CLASSEMENT tabs, lifetime reset) from your own avatar —
  the button, and with it the only path to the reset, only ever showed up
  for pokerth.net-registered players. Now shown for MYSELF whenever
  `S._statsEligible` (LAN/private) too, without the (irrelevant off
  pokerth.net) "View pokerth.net profile" link; opponents are unaffected
  and stay gated as before. `test-pim-parity.mjs` / `test-player-popup.mjs`
  cover the new self+LAN case (button present, no profile link, opponent
  still closed).
- **Table ranking: LAN tab** (`web.136`) — the "Table ranking" window
  (podium button in the game header) gains a fourth tab, LAN, shown only
  when connected to a LAN / private server (`_boardEligible`, opened by
  default there). It reuses the same family leaderboard as the general
  ranking window's LAN tab (`/stats`, `renderBoard` in `game/stats.mjs`)
  but filtered to the nicks currently seated at this table —
  `renderBoard(targetId, filterNames)` now accepts an optional name
  filter, matched case/diacritic-insensitively. Sort-criterion changes
  (`_boardSetSort`) repaint this panel too. No new translated strings:
  the tab label follows the existing untranslated "LAN" convention and
  the subtitle is left blank, exactly like the general ranking modal.
- **Accessibility: Escape priority on the modal** (`web.135`, community
  contribution by @seanpianka, scope 7/N, final) — `keynav.mjs` gains
  `['accessibility-modal', 'closeAccessibility']`, so Escape closes the
  Accessibility panel first when it's open over another surface (e.g. the
  login form), instead of falling through to that surface's own Escape
  handler. Closes out the low-vision accessibility series
  (seanpianka/pokerth-web-client#2): entry point, login/lobby scaling,
  desktop/portrait/landscape active-play scaling, and high contrast are
  all merged, tested (`node --check`, `test:accessibility*`, `test:boot`,
  `test:precache`, `test:keynav`, `test:reactions`, `test:layout`,
  `test:seat-render` green throughout), and versioned against this repo's
  own `web.N` counter (`web.122` → `web.135`) rather than the fork's
  internal numbering. Manual verification on real mobile devices (Safari,
  Firefox, installed PWA) is still outstanding — see
  `docs/LOW_VISION_REAL_DEVICE_ACCEPTANCE.md`.
- **Accessibility: high-contrast palette** (`web.134`, community
  contribution by @seanpianka, scope 6/N) — the "High contrast" toggle in
  the Accessibility panel now has a real effect (`data-high-contrast`
  attribute read across `pokerth.css`): a dedicated palette overrides UI,
  felt, deck and browser-theme presentation, restoring the player's exact
  prior cosmetic choices on disable. Header icon contrast tuned in a
  follow-up fix. This closes out the last preference that had no on-screen
  effect since scope 1 — the whole Accessibility panel is now fully live.
- **Accessibility: mobile landscape adaptive play** (`web.132`, community
  contribution by @seanpianka, scope 5/N) — extends the adaptive
  chat/log drawer system from the portrait scope to landscape, and adds
  the Hands and Reactions panels to `_gameDrawerConfig`, closing the gap
  noted in the previous scope (their buttons in `adaptive-drawer-bar` now
  correctly target the new drawer system instead of the hidden felt-corner
  buttons). Also fixes an unrelated pre-existing bug bundled in this series:
  `keynav.mjs` mapped Escape on `g-reaction-panel` to `App.toggleReactionsPin`
  (toggling the pin state) instead of `toggleReactionPanel` (closing the
  panel) — Escape now actually closes it, as it does for every other
  surface in `SURFACES`.
- **Accessibility: mobile portrait adaptive play** (`web.127`, community
  contribution by @seanpianka, scope 4/N) — at Extra Large interface size in
  portrait, in-game play switches to an adaptive layout: felt corner buttons
  (chat/reactions/hands/log) hide (`.g-felt-corner { display: none }`) in
  favor of a bottom `adaptive-drawer-bar`, and chat/log panels open as
  full ARIA dialogs with proper focus handling instead of floating windows
  (`_gameDrawerConfig`/`_configureGameDrawer` in `pokerth.js`, additive —
  normal desktop play is unaffected). Known gap, fixed in the next scope:
  the Hands and Reactions buttons in the new bar aren't wired to this system
  yet and still anchor on the now-hidden corner buttons, so tapping them in
  this build can open in an unexpected spot.
- **Accessibility: desktop active play scaling** (`web.124`, community
  contribution by @seanpianka, scope 3/N) — interface size (Large/Extra
  Large) now also scales the desktop in-game table (seats, badges, turn
  cue) via the additive `interfaceScale` parameter already carried by
  `layout.mjs`/`seat-render.mjs`, so the geometry stays identical for
  players who leave the setting at Standard. High contrast still has no
  visible effect yet.
- **Accessibility: login and lobby scaling** (`web.123`, community
  contribution by @seanpianka, scope 2/N) — the Large/Extra Large interface
  sizes chosen in the Accessibility panel now take visible effect on the
  login screen and the lobby (`data-interface-size` on `<html>`, read by new
  `pokerth.css` rules), including the populated-lobby table/outcome rows.
  High contrast still has no visible effect yet — that lands with the
  dedicated palette in a later scope.
- **Accessibility entry point** (`web.122`, community contribution by
  @seanpianka, scope 1/N of a broader low-vision accessibility effort) — a new
  `#accessibility-modal` reachable from a header button before login and in
  the lobby/game headers (`modules/ui/accessibility.mjs`). Lets a player
  choose an interface size (Standard/Large/Extra Large), toggle a high-contrast
  mode, and set the existing browser pinch-zoom permission from one place;
  choices are stored under `pth_interface_size` / `pth_high_contrast` /
  `pth_browser_zoom`, participate in config export/import and account web-sync
  (`_CFG_WEB_SYNC_KEYS`), and degrade property-by-property on malformed
  storage. Note: this build only ships the preference panel and storage layer
  — the interface-size and high-contrast presentation itself lands in
  follow-up builds. Tests in `scripts/test-accessibility.mjs` (20 checks) and
  `scripts/test-accessibility-locales.mjs` (45 catalogues × 7 keys).
- **LAN tab in the ranking window** (`web.120`) — connected in either LAN /
  private-server mode (`S._boardEligible`, never training), `#ranking-modal`
  shows a `LAN` tab (hidden elsewhere, selected by default on open, not saved
  to `pth_rank_src`) that renders the family leaderboard from `/stats` into
  `#rk-lan-wrap` by reusing `renderBoard` (`game/stats.mjs`): same rows, same
  five sort criteria, same persisted `pth_board_sort`. `_boardSetSort`
  repaints it, selecting it invalidates any in-flight `/api/ranking` reply,
  language changes re-render it. PokerTH / BBC / WEC tabs unchanged. Help →
  *Family leaderboard* gains the pointer in all 45 languages.
- **Lobby table list by keyboard** (`web.114`, upstream `b170786`,
  `LobbyPage.qml` `gameListView`) — `#g-list` takes Tab focus; ↑/↓ move the
  selection in display order (filter applied, no wrap), Home/End jump to the
  ends, Enter activates like the QML double-click: join in the wide layout —
  only when the footer Join button is offered, so the same open / not seated
  / guest rules apply and `App.joinGame` still asks for a password — or show
  the game info in the compact layout. As in QML, moving the selection does
  not open the compact info slide-in; only activating does. Keys received by
  a row's own buttons stay native. New `modules/ui/lobby-keynav.mjs` (pure
  `stepGid` + DOM binding, imported by `lobby.mjs`, precached), rows carry
  `data-gid`, `:focus-visible` ring drawn inside the column. Follows
  `pth_keynav`. Help → *Web letter keys* gains the row in all 45 languages.
  Tests in `scripts/test-lobby-keynav.mjs` (15 checks).
- **`/live` visits counted apart too** (`web.101`) — the visit beacon of the
  embedded view says `live`, and `/__visit` sends it to `recordLiveVisit`
  instead of `recordVisit` + `recordVisitEnv`. Visits, unique, new/returning,
  hourly buckets, cohorts and *Who visits* are now web client only; `/live`
  has its own per-day and all-time visits and unique devices, a *Traffic →
  /live spectator view* block, `live_visits` / `live_unique_visitors` CSV
  columns (last) and DB-mirror columns. `/live` keeps its own device id, so a
  device using both counts once on each side. Earlier `/live` visits stay
  mixed in. Needs a proxy restart. Test in `scripts/test-live-split.mjs`.
- **Admin tells `/live` apart from the web client** (`web.100`) — a spectator
  on the embedded view used to count as a pokerth.net player in both places
  the admin reads. *Traffic → Where sessions open*: the connect beacon now
  reports mode `live`, kept in its own per-day and all-time counter, its own
  `conn_live` CSV column (appended last) and DB-mirror column (added on start
  when missing); it is left out of the players' mode shares. *Live
  connections*: sockets from `/live` send `&live=1`, `/admin/sessions` tags
  each bridge and notice channel, and the board splits its summary into web
  client and `/live`. Broadcast targeting is unchanged. `/live` sessions
  opened before this build stay under pokerth.net. Needs a proxy restart.
  Test in `scripts/test-live-split.mjs`.
- **`/live` — fullscreen in both headers** (`web.97`) — out of the ••• menu
  and into the lobby and table headers. It reuses `#fs-btn-lobby` and
  `#fs-btn-game`, which already exist with their handler and translated title
  and were only hidden when they moved into that menu, so live mode wins those
  rules back rather than adding a second button. Being first of the visible
  group, it carries the margin that pushes the whole set hard right.
- **`/live` keeps its own storage** (`web.89`) — the spectator view is served
  from the same origin as the web client and therefore shared one
  `localStorage` with it: a spectator inherited the player's theme and
  nickname, and watching a table wrote into the settings of the account that
  plays at one. The browser gives no way to be a different origin here, so
  every key is namespaced instead — to the page, `/live` has its own empty
  store, and `clear()` empties only that. Loaded as a blocking script before
  anything else, since a shim installed after the first read is worthless, and
  injected for `/live` only, so the ordinary client pays not even a request.
- **`/live` drops the lobby feed while watching a table** (`web.85`) — the
  server takes `SubscriptionRequestMessage` to turn the game-list feed off and
  on, and the official spectator tool sends it on the way into a table and on
  the way back. We never did, so every embedded viewer kept receiving every
  update of every table while watching a single hand — cheap for one visitor,
  not for a front page full of them. Live mode only: a seated player's lobby
  has filters, a player list and an info panel that all read that feed. On the
  way back the game list is cleared before resubscribing, since tables were
  created and closed while away and the server replays the list.
- **`/live` defaults in the admin page** (`web.84`) — Defaults gains a *Live /
  Spectator mode* card: palette, sound and whether the lobby chat strip is
  shown. The spectator view is embedded on a site with its own look and has no
  Advanced options for a visitor to fall back on, so it gets its own set
  rather than the one tuned for players; leaving the palette on *Same as the
  main client* keeps the previous behaviour. Palette and sound are first-visit
  defaults — a visitor who chose keeps their choice — while the chat strip is
  an operator decision and always applies.
- **`/live?embed=1` — the spectator view in an iframe** (`web.83`) — the same
  page, with the three things a frame needs and nothing else: it reports its
  height to the host page over `postMessage` (channel `pokerth-live`, plus a
  `ready` message once loaded) so the site sizes the frame instead of guessing,
  sound starts off for a visitor who has never chosen, and nothing offers to
  install a page that is not the destination. `?table=<gameId>` now spectates
  that table in live mode rather than taking a seat, so the site can embed one
  specific table. Host snippet in `docs/INSTALL_POKERTH_NET.md`.
- **`/live` — a word while the join happens** (`web.81`) — clicking Spectate
  now raises a dialog saying the table is being joined and that the viewer is
  waiting for the current hand to finish, with Cancel to back out. Joining
  takes a round trip and then a wait, and a click with nothing on screen reads
  as a click that did nothing. Cancel calls the client's own `leaveGame()`, so
  a half-completed join is cleaned up properly. It reuses the `#leave-dialog`
  shell and three strings that already exist in all 45 locales.
- **`/live` — avatars, player cards, type icons** (`web.78`) — the Players tab
  now matches the tool it replaces: avatar on the left, name on the first line
  and the table below it, Spectate on the right. Clicking a name opens the
  client's own player card, statistics included — the same
  `openPlayerInfoPopup` the ordinary lobby opens, and the avatar is built by
  the same `_avatarChipHtml` its players panel uses, so there is no second
  avatar path and no extra request per visitor. In the table list, the game
  type is now an icon with the translated wording on its title, which also
  stops a long type name wrapping over three lines, and the spectator column
  carries the eye the tool shows.
- **`/live` — chat as a bottom strip** (`web.77`) — the lobby chat moves from a
  right column to a full-width strip under the table list, with a horizontal
  grip drawn in the same 18px gutter the lobby leaves between its own panels.
  Height is remembered, floored at 110px and capped at 60% of the lobby, and
  the grip resizes with the arrow keys.
- **`/live` — language in the header, lobby frame, figures in words**
  (`web.76`) — a flag button in the lobby and table headers, and on the login
  card, opening the client's own language picker. It uses the ids `i18n.mjs`
  already keeps in sync with the active flag, so nothing new had to be wired;
  until now the only language control lived in Advanced options, which live
  mode hides. The two lobby columns wear the lobby's own panel frame — same
  border, radius, background and padding, with the tab bar and the chat header
  flush to the edges as panel headers. The server figures now really show
  their wording: they were hidden with `display` and only re-shown with
  `opacity`, so the sentences never appeared.
- **`/live` — the figures replace the idle hint** (`web.75`) — the four server
  counters now sit centred below the Login button, in the place the guest hint
  occupied, each with its full translated wording rather than a bare number.
  The wording was already carried on the title attribute in all 45 locales, so
  showing it costs no translation work; it stays hidden in the ordinary client,
  whose Internet card is a single line with no room for it. Idle notes are
  hidden on `/live` by their status key, so errors and connection progress —
  which carry no key — still report exactly as before.
- **`/live` — the login card shows the server** (`web.74`) — the card is
  titled *Live / Spectator Tool* and carries the four figures the site's own
  Game-Server Status box carries: players online, tables running, players
  waiting, games today. They are the client's own `#lc-live` node, moved into
  the card from the Internet card of step 1 that live mode hides — the same
  counters, the same relay, the same polling rules, no second implementation.
- **`/live` — its own transport setting** (`web.73`) — Servers → *How?* gains a
  choice for the embedded spectator mode: same as the Internet mode (default),
  Direct WS, or Via proxy. An install running beside the game server and one
  running on a separate machine rarely want the same answer, and until now
  `/live` was forced to follow the Internet setting. Direct WS means spectators
  dial `wss://www.pokerth.net/pthlive` themselves and this proxy carries
  nothing for them — the framing difference (one protobuf per frame, no length
  prefix) was already implemented for the Internet mode and is reused as is.
  The default keeps every existing install on exactly the behaviour it had.
- **`/live` — Players tab and read-only chat** (`web.72`) — a tab bar above the
  list switches between the tables and everyone online, each with its count,
  as in the spectator tool. A player's row says which table they are at or
  watching and offers Spectate when that table is running, so a visitor can
  follow a name straight to its seat. The chat composer and emoji panel are
  hidden: an embedded viewer watches the lobby, it does not post to it. The
  panel is still the client's own node, so nothing is removed — only hidden.
- **`/live` — lobby chat as a resizable right column** (`web.71`) — the table
  list and the chat sit side by side as they do in the full client and the
  QML lobby, with a drag grip between them. The width is remembered across
  visits, has a floor and never takes more than 60% of the lobby, and the grip
  is focusable so the column resizes with the arrow keys too. Below 720px the
  chat moves back under the list rather than squeezing it. It is the client's
  own `#lobby-chat-panel`, moved rather than cloned, so message rendering, the
  emoji picker, translations and the send path are unchanged. The leave button
  now sits at the far left of the header, before the guest name.
- **`/live` — the table list** (`web.68`) — the full lobby body is replaced on
  `/live` by a row-per-table list in the shape of the spectator tool it
  succeeds: name, seats, status, type, private, spectators and timeouts, with
  an expandable panel showing who is seated, the starting stack, the small
  blind and the blind schedule, and Spectate as the only action (offered only
  once a table is actually running). It reads the same `S.games` / `S.players`
  records the ordinary lobby renders from and repaints by wrapping
  `renderGames`, so no second source of truth and no new protocol handling.
  Every label reuses an existing i18n key, so all 45 locales stay complete.
  Covered by `scripts/test-live-lobby.mjs`, which runs the module against a
  jsdom document rather than pattern-matching its source.
- **`/live` — one-button guest login** (`web.67`) — the connect screen drops to
  a single button: no mode cards, no nickname field, no avatar picker, no TLS
  or guest checkbox, no footer. Underneath it is the ordinary connect path —
  pokerth.net, guest mode, empty nickname so the client reuses its persistent
  Guest name — and the real button and status line, so progress and errors
  report exactly as they do in the full client. The guest state is re-asserted
  in the click capture phase, since a visitor who once used the full client on
  this origin has a stored login mode that would otherwise be restored.
- **`/live` — slim header** (`web.66`) — in live mode the header keeps only
  what a guest watching from the website can use: the guest name on the left,
  and on the right an appearance button (the existing theme panel — palette,
  table, deck) plus the build. Disconnect, fullscreen, chat, private messages,
  forum, ranking, the overflow menus and the table-admin buttons are hidden;
  the sound toggle stays at the table. All of it is CSS on
  `:root[data-live="1"]`, so the ordinary client is byte-identical in
  behaviour, and `public/modules/live/index.mjs` — loaded only on `/live` —
  fills the two dynamic slots.
- **`/live` — embedded spectator mode, first stone** (`web.65`) — a new route
  serving the same client with `window.LIVE_MODE` set, groundwork for replacing
  the standalone `pokerth-live` spectator tool with this codebase, so table
  work (themes, decks, seats, layout) is inherited instead of ported twice.
  The route is `noindex`, keeps its own entry in the injected-HTML cache, sends
  `Content-Security-Policy: frame-ancestors` so only pokerth.net may embed it,
  and registers no service worker — an embedded page must install nothing in
  the host origin's scope. No player-visible change yet: the live lobby and the
  slim header come next. Covered by `scripts/test-live-route.mjs`.
- **The game-server figures in the dashboard header** (`web.63`) — the same
  four counters, as a strip in the top bar of the admin page, on every tab and
  for every admin key. It reads the same `GET /api/live` the login screen
  reads, so the upstream still sees one request per interval however many
  people have the dashboard open. The Live server figures card also gained a
  live preview of what players are seeing, which says plainly when they are
  seeing nothing and why (switched off, counters stale, no usable answer).
  Repaints right after a save, so a changed address shows its effect at once.
- **Live server figures on the login screen** (`web.56`) — players online and
  games played today on the Internet card, read by the proxy
  (`GET /api/live`, one shared in-memory cache) from the official
  `pokerth.net/pthranking/live` counters. Hidden when stale, unreachable or
  switched off. Admin card (Clients tab): toggle, endpoint, refresh interval
  (30–900 s, default 60) and a Test button.
  Reworked in `web.58` after the worded line was being cut off mid-sentence
  on a phone: all four counters the website's own Game-Server Status box
  carries — players online, tables running, players waiting, games today — are
  now shown as an icon and a figure each, with the same icons, and the wording
  moved to each item's title and aria-label so it stays translated and stays
  read out. Counters the server does not publish are simply left out.
  Hardened in `web.59`: the icons had been left to size themselves from the
  stylesheet, so a browser still holding a cached `pokerth.css` from before
  those rules rendered each one at the browser default of 300x150 and the
  Internet card grew to fill the screen. They now carry width and height as
  attributes and the row lays itself out inline, so the module survives a
  stale or missing stylesheet; `scripts/test-live-stats.mjs` pins that.
- **World clock above the admin tabs** (`web.47`–`web.48`) — one analog dial
  per region, up to twelve from a catalogue of thirty-eight, ordered by UTC
  offset around a settable reference zone; a region turns green between 18:00
  and 01:00 local. Self-hosted SVG flags rather than regional-indicator emoji.
- **Server time heads the status list** (`web.48`) — read from the proxy
  (`/admin/clock`, any valid admin key), never from the browser; the skew is
  kept locally so the network is touched every five minutes. `clockZones` and
  `clockRef` live in `admin-config.json` and survive an export/import.
- **Real sky on each dial** (`web.49`) — the face is derived from the sun's
  altitude at that city: day, golden hour, sunrise told from sunset, the three
  twilights, night, polar day and polar night included. USNO low-precision
  model, checked against the almanac; hover names the phase.
- **Clock strip fills the width and folds on a phone** (`web.49`) — cells
  share the row, so three clocks read as comfortably as twelve; below 600 px
  the dials shrink and the row wraps.
- **Horizontal scroll for the clock strip on phones** (`web.50`) — one line
  scrolling like the section bar under it, opening centred on the reference
  zone; recentres on a selection change or a rotation, never on a tick.
- **Server / Client / Data buttons take the page width** (`web.50`), instead
  of a 520 px cap above a full-width row of sections.
- **Sun-yellow daylight on the clock faces** (`web.51`); the golden hour moved
  to amber and orange to keep its distance.
- **Continuous sky gradient on the dials** (`web.52`) — computed from the
  sun's altitude, zenith at the top, horizon at the bottom, with no colour
  bands left; the tooltip gives the altitude alongside the phase. The hand ink
  switches at the equal-contrast luminance, measured worst case 3.29:1.
- **Traffic charts answer to a finger, legends toggle series** (`web.53`) —
  tapping a legend entry hides its series and the scale redraws; a readout
  following the pointer replaces the `<title>` tooltips. Daily visits,
  languages per day and plays per day; a vertical swipe still scrolls.
- **Language breakdown names the no-header bucket** (`web.54`) — *No language
  header* instead of *Other*, the tail row renamed *N more languages*, and a
  new line listing untranslated languages seen, ordered by pings, resolving
  `no`/`nb`, `tl`/`fil` and the retired ISO codes. The translation list is
  read from `public/modules/lang/` by the proxy.
- **No language lost to the cardinality cap** (`web.54`) — a translated
  language is never folded into `other`; the cap for the rest went 40 → 90.
- **Admin panel names the product and its host** (`web.55`) — *PokerTH Web
  Client — Admin* on the tab, the login screen and the dashboard, with
  `location.host` centred in the header (own line on a phone).
- **Icons on every dashboard tab** (`web.47`) — the three family buttons and
  the seventeen sections; decorative only, screen readers get the label alone.
- **Game log reads its colours from the table style** (`web.46`, parity with
  upstream `e90593e`) — main-pot winner, side-pot winner and board steps get
  their own colour, filled from the set matching the brightness of the panel
  background. Six new style tags parsed (`ChatLogAccent`, `ChatLogAccentText`,
  `ChatLogWinner`, `ChatLogWinnerSide`, `ChatLogBoard`, `ChatLogSend`); new
  module `modules/ui/chatlog-tint.mjs`, role resolved at render time.
  Deliberate divergences: the chat accent falls back to the seat accent, the
  six older `ChatLog*` keys still fall through to CSS, and `--chatlog-send` is
  parsed but not wired.
- **Context menu on a seat** (`web.43`, parity with `GamePlayerBox.qml`) —
  right-click, or a 500 ms long press on touch (cancelled past 10 px), opens
  note, profile, ignore, report avatar and kickban, each behind the guard of
  its player-card button; nothing opens with nothing to offer, and nothing
  fires in seat edit mode. New module `modules/ui/seat-menu.mjs`, no new
  strings.
- **Player notes exchanged with the official clients** (`web.38`) — the
  config.xml export writes the `PlayerTooltips` list
  (`Name(!#$%)Note(!#$%)Stars(!#$%)`, the Qt-Widgets format adopted by QML in
  `b77ad47`) and an imported file feeds its lines back. Exchange only: the
  downloaded file carries the notes, the account-synced one keeps to
  `pth_notes`. Help updated in all 45 languages.
- **Star rating on player notes** (`web.36`, parity with upstream `b77ad47`) —
  a 0–5 star bar on the player card (clicking the star already set steps
  back), a `★N` badge at the table and in the players list, stored as `s` in
  `pth_notes` and merged by timestamp. New key `nvRating` in all 45 languages.
- **Hand-written notice defaults in all 45 languages** (proxy-only) — the
  guest and account notices ship translated by hand, replacing machine output;
  a language saved identical to its built-in default is dropped before storage
  (`_stripDefaultNoticeLangs`). **proxy.js changed — restart required.**
- **Thumbs up / down on the music player** (`web.32`) — current track only,
  `POST /__music-vote` (`1` / `-1` / `0`; the same body without `vote` reads
  back), one device per track via a salted SHA-256, radios included. Blind by
  default (`musicVotesPublic`), counts shown in the admin library, two new
  i18n keys in all 45 languages. **proxy.js changed — restart required.**
- **Notice acknowledgement** (`web.31`) — "I understand" stores the message's
  `updatedAt` (`pth_guestnotice_seen`; `pth_authnotice_seen` synced through
  `/prefs-web`, maximum wins), and an operator edit re-shows the popup.
- **Built-in default text for both notices** (`web.30`) — ready-made English
  text covering access, chat, game types and ranking (registration link for
  guests, ranking and community events for accounts), served until an operator
  authors a language and localised by the client's translation fallback.
  **proxy.js changed — restart required.**
- **Registered-account notice** (`web.29`) — mirror of the guest notice for
  pokerth.net logins made with an account: `authNotice` config key,
  master-only editor, popup at lobby entry, nothing persisted on dismiss.
  **proxy.js changed — restart required.**
- **Guest notice** (`web.28`) — operator-authored multilingual popup on every
  guest connection in Internet / PokerTH.net mode, same editor and translation
  fallback as the welcome message, nothing persisted client-side. New
  `guestNotice` admin config key. **proxy.js changed — restart required.**
- **Player notes and colour labels** (`web.24`) — a 500-character note and six
  renameable colour labels on the player card, with a colour dot on the seat
  and in the players list and a hover preview. Stored under `pth_notes`,
  merged per player and per colour by timestamp. Based on `lbernardo`'s
  `26a754c`, reworked; i18n in all 45 languages.
- **Ivoire & Chêne table style** (`web.4`) — port of upstream `eee31d4`:
  fullscreen wallpaper, cream buttons and pucks, parchment ChatLog tint. First
  light-toned pack, so `TABLES` gains an optional `btnFg`. Credit: PokerTH
  Development Team, AGPL-3.0.
- **Table previews regenerated** (`web.5`) — all 21 built-in packs take the
  `preview.png` / `preview_portrait.png` re-rendered upstream in `eee31d4`;
  every entry now carries both.

### Changed
- **`/live` identifies as the web client** (`web.119`, sp0ck 2026-09-10) —
  `buildInit` no longer switches to `CLIENT_TYPE_QT_WIDGET` (0x01) when
  `window.LIVE_MODE` is set: the spectator view now sends the same buildId as
  the player client, `CLIENT_TYPE_WEB` (0x03) with the current upstream
  release, so the server session entries behind the pokerth.net dashboard
  count it as a web client. Reverses the 0x01 choice made when `/live`
  replaced `pokerth-live`. The LAN fallback to 0x01 for pre-2.1.8 servers is
  unchanged (lan/unauth modes only). `scripts/test-messages.mjs` updated.
- **Training mode draws from a cryptographic RNG** (`web.118`, upstream
  `40122fe`, `tools.cpp`) — `Math.random` (xorshift128+ in V8) gives its
  state away after a few dozen outputs, and a shuffled deck is a run of
  outputs the player partly sees, so the bots' hole cards and later hands
  were predictable in principle. New `modules/offline/rand.mjs`:
  `crypto.getRandomValues` read in 256-word blocks, returned as a 53-bit float
  in [0, 1) — the same interface as `Math.random`, so `makeDeck`'s
  Fisher-Yates and every bot draw are untouched (`floor(x·n)` bias below
  n / 2^53; upstream's Lemire method works on integers). Wired as the default
  in `offline/index.mjs` only (`config.rng || cryptoRandom`): engine, server
  and bots keep their code, injected test RNGs still win, the cosmetic
  reactions keep `_rrng`, and the equity rollout's mulberry32 is still seeded
  once per decision from the game RNG. Falls back to `Math.random` without
  Web Crypto. Precached. Tests in `scripts/test-offline-rand.mjs` (13 checks,
  deterministic: known words for the bit assembly and buffering).
- **Keyboard lot completed** (`web.117`, rest of upstream `b170786` /
  `21da2f0` / `5c321a5` / `3fa46aa`) — *Reading areas*: `#about-page`,
  `.pv-scroll`, the table-ranking `.rk-body` and `#rk-profile` (QML
  AboutPage / GameTableStatsPage / PokerthPlayerPage) take the focus on open
  (`tabindex="-1"`, `data-kn-focus`), so the browser's own PgUp/PgDn/Home/End
  scroll them; `data-kn-read` hides the ring. `focusInitial` now picks the
  first *visible* candidate, the watched element included, and watches its
  surfaces without requiring candidates at start-up (content injected later).
  *Ranking*: opens in `#rk-search` when shown, else in the list; Enter
  searches at once (`rankingSearchNow`, QML `onAccepted`). *Settings
  categories*: `data-kn-tabs` on `.adv-nav` — arrows on both axes, Home/End,
  focus + click, disabled categories skipped (QML `showCategory`). *Forum*:
  arrows/Home/End move between `.fn-row`s (QML `keyNavigationEnabled`), an
  opened post focuses the scroller, Back returns to the post's row. *End of
  game*: Play again (training) is the start focus (QML `gameOverPopup`), and
  `#g-endgame-overlay` joins the Escape surfaces with `App.endGameClose`, which
  stays at the table. *Login*: `#login-step2` is the last Escape / Android Back
  surface, calling `loginBackToStep1` (QML `handleBack`). *Notes*: Ctrl/⌘+Enter
  saves at once, Enter alone stays a newline (QML PlayerNoteDialog). Not
  applicable: `focus:true` fixes on QML popups (Escape already works here),
  CustomButton ring (`:focus-visible` since `web.112`), LAN host/enter pages;
  session logs were already keyboard-driven (`web.24`). Tests in `scripts/test-keynav.mjs` (53 checks).
- **Start focus per screen, Enter creates from any settings field**
  (`web.116`, upstream `b170786`: `StackView.onActivated` on StartPage,
  ServerConnectionDialog, LobbyCreateGamePage, LocalGamePage; `Keys.onReturnPressed`
  on the create pages) — candidates are opt-in in the markup with
  `data-kn-start` (empty = always, `online` / `offline` = by training mode):
  the Internet login card, `#nick` and `#pass`, `#cf-name` online and the
  Create button in training. When a `.screen` becomes active or a login step
  is shown, `keynav.mjs` focuses the first visible, enabled candidate that is
  an empty field, else the first one — so a remembered nickname hands over
  to the password, as `applyInitialFocus()` does. Never on touch-only
  devices, never in `/live` or inside a frame (it would steal the host
  page's focus), never over an element already focused and visible outside
  the screen (a popup, typing elsewhere); a guest's locked table name is
  skipped. A button focused this way hides its ring until the first key
  (`data-kn-quiet`), as QML shows no ring without a focus reason. The
  optional LAN user password is not a candidate. `#create-form` is a
  `data-kn-form` with its Create button as `data-kn-default`: Enter in a
  text, number, password, checkbox, radio or range field clicks it; a focused
  button, select, textarea or link keeps its own Enter, and nothing happens
  with a surface open on top. Tests in `scripts/test-keynav.mjs` (40 checks).
- **Kick and report confirmations focus Confirm** (`web.113`, upstream
  `b170786`, narmod's call for QML parity) — the QML `ConfirmPopup` opens on
  its confirm button, so `data-kn-focus` now sits on the confirm button of
  `#kick-confirm-modal` and `#report-confirm-modal` (game name and avatar).
  Enter confirms only while the focus is still on that button: neither dialog
  gains `data-kn-primary`, so Enter from anywhere else stays inert, and Escape
  still cancels. The other QML `ConfirmPopup` uses (ignore, ban, delete a
  conversation) are native `window.confirm()` prompts here, which the browser
  already opens on OK. Tests in `scripts/test-keynav.mjs` (25 checks).
- **Popups open with the keyboard focus on their safe button** (`web.112`,
  upstream `b170786` / `21da2f0` / `5c321a5` / `3fa46aa`) — the QML client now
  gives every popup a start focus (`onOpened: X.forceActiveFocus()`). Same
  targets here, opt-in in the markup with `data-kn-focus` (like
  `data-kn-primary`): Cancel on `#leave-dialog` and `#disconnect-dialog`, OK
  on `#timeout-warn-modal` and `#conn-lost-modal`, Decline on the invitation
  banner, which also registers with keynav so Escape / Android Back decline
  it (the host gets an answer, as in QML). `keynav.mjs` watches those
  surfaces with a `MutationObserver` on their attributes — no change to the
  functions that open them — and hands the focus back to the previous element
  on close, as a Qt popup does. Enter/Space on the focused button are native;
  the ring is `:focus-visible` only (QML `visualFocus`) on `.ld-btn`,
  `.kcm-*` and the banner buttons. Skipped on touch-only devices (no keyboard
  to serve, and blurring a field would drop the soft keyboard) and when
  `pth_keynav` is off; a disabled button (warning already expired) is left
  alone. The QML `ConfirmPopup` targets (kick, report) followed in `web.113`.
  No rejoin prompt exists here (rejoin is automatic).
  Tests in `scripts/test-keynav.mjs` (21 checks).
- **Reaction choreographies ×1.25, as upstream `b8a1d18`** (`web.111`) — the
  QML and widget clients took the web keyframes (1.4–1.7 s) and stretch them
  by `durationScale` 1.25 back to the 2.1.7 flight time (`pop` 1.6 s → 2 s);
  the web client kept the short tempo, so the same `/emoji` ran shorter here.
  All 16 `.rfx-anim-*` durations are scaled in `pokerth.css` (keyframe
  percentages untouched), and the delays aligned with the choreography follow
  (`RFX_DURATION_SCALE` in `reactions.mjs`): 💣 impact 420 → 525 ms, second
  ring 540 → 675 ms. Particle and ring durations stay as upstream. The burst
  container now lives `RFX_LIFE_MS` = 2225 ms (was 1800). Guarded in
  `scripts/test-reactions-catalog.mjs`.
- **`/live` — no table chat, no fullscreen inside a frame** (`web.107`,
  feedback from the pokerth.net embedding) — a visitor on the site no longer
  sees the chat of the table being watched: `#chat-toggle-btn`, `#gchat-fab`
  and `#g-chat-panel` are hidden, `toggleGameChat` and `addGameChat` are
  stubbed so no unread count builds up. The seated web client still lets a
  spectator read the table chat. Fullscreen does nothing inside the site's
  iframe, so `embed.mjs` now sets `data-framed` whenever `/live` is framed
  (`?embed=1` or not) and both header buttons go there; standalone `/live`
  keeps them (`web.97`). The push-right margin moves to the next visible
  button. Tests in `scripts/test-live-chrome.mjs` and
  `scripts/test-live-embed.mjs`.
- **Privacy page rewritten to match what the code does** (`web.105`) — the
  in-app page (`pv*` keys, 45 languages) and `/privacy` said settings never
  leave the device, visit data is gone after ~13 months and translation goes
  to Google only. They now describe: pseudonymous visit statistics (daily
  buckets pruned at 400 days, all-time hashed ids kept longer), settings sync
  for registered accounts (on by default), in-memory error reports with UA and
  masked IP (on by default), hashed poll and music votes, the LAN/private
  leaderboard, IPs in security logs, the Google → MyMemory → relay translation
  chain (chat and forum), direct radio streams and the `.pdb` relay to
  pokerth.net. GDPR requests now go to the pokerth.net administrators (Imprint
  page), GitHub issues for the client itself; the maintainer e-mail is no
  longer shown on `/privacy`. New keys: `pvSrvSync`, `pvSrvErr`, `pvSrvVotes`,
  `pvThirdRadio`, `pvThirdPdb`, `pvRightsGh`.
- **Default deck and table precached for offline play** (`web.104`) — images
  are runtime-cached in the `CACHE_VERSION` cache and dropped on every bump,
  so an offline game right after an update could show blank cards and no
  felt. `sw.js` now precaches the default deck (`cards/pokerth-new`, 52 faces
  + back, ~50 KB) and the default table style (`table/pokerth-official-fs`:
  felt, D/SB/BB pucks, action buttons, ~1 MB). The back is listed plain (inline
  boot) and as `flipside.svg?v=<build>` (`deck.mjs`), via a `BUILD_ID` derived
  from `CACHE_VERSION`. `scripts/test-precache.mjs` now evaluates `ASSETS`
  from `sw.js`, checks every entry exists on disk, that the defaults in
  `theme.mjs` still match, and that `BUILD_ID` equals `BUILD_VERSION`.
- **Avatars behave like the QML client: one per session, through the server
  only** (`web.95`) — a lobby-chat report had web and desktop players seeing
  different avatars for the same person. Next to the PokerTH avatar protocol
  the web client kept a second, web-only path: the proxy relayed
  `AVATAR:`/`AVATARIMG:` frames between browsers and they took precedence over
  the server avatar, so a change made while connected reached web players at
  once while the server — and every official client — kept the one announced
  at login. The official client has a single source: `ClientContext` holds the
  file chosen at connection, its MD5 goes into `InitMessage.avatarHash`, the
  same bytes answer `AvatarRequest`, and everyone fetches it by hash. Same here
  now. The relay is gone (the proxy absorbs frames from tabs still on an older
  build, which would otherwise reach the TCP path as malformed frames). My own
  avatar is frozen when the Init is sent (`S._sessAv`, bytes in
  `S._sessUpload`) for the seat, the lists and the `AvatarRequest` reply; a pick
  made while connected applies at the next connection. The frozen PNG of a
  custom image is keyed by the MD5 of the image instead of the constant `img`,
  so a restored backup or a synced picture can no longer be uploaded with
  another image's bytes, and an encode overtaken by a newer pick publishes
  nothing. The initial letter no longer uploads a generated PNG: as with an
  empty `MyAvatar`, no hash is announced. The help explains, in all 45
  languages, when a change applies. Test: `scripts/test-avatar-session.mjs`.
- **`/live` — the last two notices go, and language lands live** (`web.94`) —
  the guest-rules card is silenced: it explains the chat and game-type rules
  to someone who can neither chat nor play. The update banner is silenced too;
  the cost is real and accepted, since an embedded frame can then sit on a
  stale build until the visitor reloads. And the table list repaints on a
  language change: every label in it comes from `t()`, but the guard that
  skips needless repaints is built from game data alone, so switching language
  left the previous one on screen until a table happened to change.
- **`/live` — the player card is read-only, and the header settles**
  (`web.93`) — notes, ignore, avatar report and kickban all disappear from the
  player card in live mode: they act on a session the spectator has no part
  in, so `/live` gives even less than a guest has in the full client. The
  appearance button leaves the lobby, where there is no table to dress, and at
  the table it sits left of language and light/dark.
- **`/live` — a quieter table and a tidier login card** (`web.92`) — the hand
  log and the poker-combinations card go: one is a record of a session the
  spectator has no part in, the other a reminder for someone deciding a move.
  Buttons, panels and openers all, so nothing can build them. On the login
  card, language is pinned to the top-left corner and light/dark to the
  top-right, sitting on the card rather than in its column, which keeps the
  logo centred. Everything under the button is gone except the figures — an
  error still shows, since a spectator who cannot connect has to be told why.
  And the figures now follow a language change immediately instead of keeping
  the previous language until the next poll.
- **`/live` carries less of the web client** (`web.91`) — no local backup: the
  feature is off at its root check, so there is no banner offering to save
  settings a spectator never made, no folder handle and no IndexedDB. No
  operator broadcasts: they address players, and an embedded viewer is not
  their audience. No music slider in the sound popover, since the spectator
  tool ships no music player, reusing the same gate the admin music switch
  uses. The build string is gone from the header, and the language, light/dark
  and appearance buttons sit hard right, leaving the guest name the left.
- **`/live` — light / dark / automatic in the header** (`web.91`) — a button
  cycling the three, in the lobby, at the table and on the login card. It
  cycles the palette axis, which already carries those three values and
  already follows the OS in automatic, rather than adding a setting of its
  own; a visitor on some other palette lands on automatic first.
- **`/live` no longer shows the client's own notices** (`web.87`) — the
  welcome modal, the authenticated-player notice and the operator poll are
  silenced in live mode, at their entry points so every call site is covered.
  A spectator arrived to watch a hand, not to read about the web client
  (sp0ck, after reviewing the deployed `/live`). What reports rather than
  advertises is untouched: connection errors, the server's inactivity warning,
  and the dialog raised by clicking Spectate.
- **The dashboard header lost its two link buttons** (`web.63`). “Open the
  app” and “Studio” gave their place to the game-server figures; the theme
  toggle moved to sit beside Log out and now shows only its icon, the wording
  having moved to its tooltip and aria-label.
- **Ivoire & Chene panel colours follow upstream `f7a8e26`** (`web.57`) —
  `bg #f5eee1 → #ece0c9`, `su #e9dcc4 → #ddceb0`, `bo #c6ac82 → #b89a6c`,
  `mu #8a755a → #6f5a3c`, `ws #8a6a2a → #7d5e20`, `sd #0e7a37 → #0c6b30` in
  `theme.mjs`; the chat/log/info boxes now sit a shade deeper than the felt so
  light content on them keeps an edge, and the contrast floor on the panel
  background rises to 4.5:1. The other two halves of that commit need no work
  here: the boxed emoji toggle the QML client just gained has been the web
  button since `web.0`, and the odds monitor is a web-specific design without
  QML's greyed-out impossible categories.
- **Own row in bold in the players list** (`web.42`), `--gold` alone being the
  running text colour of the PokerTH theme.
- **Star ratings moved to the lobby star column, new `--star` colour**
  (`web.41`) — the `★N` badge leaves the name for the `★` column (16 → 26 px,
  header chip `plColMe · nvRating`), the two senses never meeting on one row.
  Stars use `--star`: `var(--gold)` by default, `var(--sel)` in the two
  PokerTH themes.
- **Colour dot joins the star badge after the name** (`web.40`) — both marks
  in a single `.seat-nv` group after the name, outside the name link in the
  lobby list so the ellipsis eats the nickname only. Rows become flex rows
  only when there is something to show (`.has-nv`).
- **Star badge anchored to the right of the seat name** (`web.39`, upstream
  `d72d109`) — `seatDotHtml()` before the name, `seatStarsHtml()` at the far
  end with the name eliding against it (13 px glyphs, 10 px compact); the
  players list keeps both side by side.
- **Player card locked to a fixed width** (`web.37`) — `PIM_WIN_W = 400`,
  clamped to the viewport, re-applied after a restored geometry, horizontal
  and corner handles hidden, content zoom off. Height stays adjustable.
- **`InitMessage.clientPlatform` announced to the server** (`web.34`, upstream
  `864bc53`) — field 9 (Windows / Linux / Mac / Android / iOS) from
  `navigator.userAgentData.platform` or the user agent; omitted when unknown
  and ignored by the 2.1.8 server. Logs read `Web/Android 2.1.8`.
- **Bet display option scoped to the PokerTH seat style** (`web.21`) — other
  seat packs keep their original presentation; the option moved into a nested
  block under the PokerTH entry and re-resolves live on a pack switch.
- **Opponent seat plates at the fixed QML box width** (`web.19`) — 121 layout
  px, border-box, instead of sizing to content, so the side corridor,
  `--comm-scale`, the community row and the action-bar width stay constant.
  Text elides; image packs and the self box keep content sizing.
- **Auto-update no longer blocked by notify-only sockets** (proxy-only) — the
  restart gate counts game bridges (reconnect grace included) rather than
  every open WebSocket; notify channels still get the notice and reconnect.
- **Client identifies as `CLIENT_TYPE_WEB` (0x03)** (`web.0`) — the switch
  shipped dormant in `2.1.7-web.170`; composite buildId `0x03020108`. Web
  players now show as their own type in server statistics, the Live/Spectator
  tool and the pthranking dashboard.
- Announced upstream version follows `BUILD_VERSION` → **2.1.8**; hard-coded
  fallback triple bumped to match.
- **Admin lobby probes announce `CLIENT_TYPE_WEB` too** (`web.1`) — the proto
  facade behind the headless guest probes moves from `0x01` to `0x03`, like
  `buildInit`.
- **Changelog grouped by entry type in About** (`web.16`) — `new:` /
  `improvement:` / `bugfix:` lines sort under translated subheadings; three
  new i18n keys in all 45 languages.
- **Hand name gated behind the river on voluntary shows** (`web.15`, upstream
  `1bf7a73`) — cards only after a pre-river fold-out, trailing "—" stripped.
- **Chat history capped at 400 lines** (`web.15`), lobby and game, matching
  QML `LobbyHandler::pushChatLine` and upstream `c65fb30`.
- **Bet display defaults to `inset` on every platform** (`web.3`, upstream
  `f9a8906`); an explicit `pth_bet_style` is untouched.
- **Restore banner reworked into a backup banner** (`web.9`) — symmetric
  "Create a backup" / "Restore a backup" / "Later"; creating never overwrites
  an existing `pokerth-web-backup.json`, restoring falls back to the folder
  picker. Seven new i18n keys in all 45 languages.
- **Backup banner also shows on a brand-new browser** (`web.10`) — no
  remembered folder required; picking one from the advanced options releases
  the write hold.
- **Welcome modal and broadcasts translate everywhere** (`web.11`) — fallback
  to the shared `_gtxTranslate` chain (gtx → MyMemory → `/api/translate`)
  outside Chromium, following `pth_chat_translate`.
- **Mobile table geometry synced with upstream 2.1.8** (`web.12`) — port of
  `414a89c3` + `06db9866`: the inset bet socle enters the base sizes,
  `betSideOutset` (40 / 68) replaces the flat 48 mobile reserve, the top-badge
  reserve is dropped in mobile compact landscape and the pair slack follows
  upstream. Mobile portrait gains dynamic seat rows and a computed middle band
  for the community row; desktop keeps the fixed slots.
- **Puck/bet placement parity with QML 2.1.8** (`web.13`) — landscape betSide
  follows the QML column fractions, `betSplit` (upstream `9f402258`) is
  implemented for the top-centre and spectator bottom-centre boxes, and the
  inset side puck is vertically centred.
- **Self-box parity pass** (`web.14`) — mobile-portrait geometry models the
  self at its real web anchor (`opts.selfBottom`), `SELF_BOX_MUL` is derived
  from the 2.1.8 bases including the socle, and the QML at-turn lift
  (`scale 1.03`, 180 ms OutQuad) is applied to the seat plate.

### Fixed
- **Forum news: a topic already marked read could reappear as unread**
  (`web.142`) — read state was keyed by `post.id` (the specific post's link),
  but the list is deduplicated to one entry per topic (`fnDedup`, by
  `forum|title`). Any forum activity that changed which post represents an
  already-read topic (a new reply, an edit that bumps the thread) surfaced a
  *different* id the next time the feed refreshed, which had never been
  marked read — the topic flipped back to unread even though nothing new had
  actually been seen. `fnIsUnread`/`_markPostRead` now key off the same topic
  key `fnDedup` already uses (`fnTopicKey`, exported and reused by both), so
  read state survives a change of representative. Same defect exists
  upstream in the QML client (`Config.ForumNews`, ported 1:1) — worth
  flagging to sp0ck, not fixed there.
- **Hiding a column in the online-players list didn't reclaim any width**
  (`web.141`) — toggling off status/country/rating via the header chips only
  cleared the cell content; the grid track stayed reserved at its fixed
  width, so the name never actually got more room. `--pl-cols` (and the row
  markup) is now built from the columns that are actually visible instead of
  the full column list, so a hidden column truly drops its track. The header
  chip bar keeps its own fixed layout and is unaffected.
- **Cold boot could serve stale SW-cached JS/CSS with no update prompt**
  (`web.121`) — the `/__ver` update banner only compares two polls made
  *within* the same page load, so a session that starts fresh (app
  relaunched, not just foregrounded) had no baseline to notice it had just
  loaded assets from an old service-worker cache; the only fix was a manual
  hard reload. The last-seen `/__ver` value is now persisted in
  `localStorage`; a cold boot compares against it and, if behind, nudges any
  waiting service worker (`SKIP_WAITING`) and reloads once. Runs before
  `App.connect()`, so there is never a live WS/proxy session to protect at
  that point — the existing manual-reload path (banner → `SKIP_WAITING` +
  `App.teardownForReload()`) is untouched.
- **`/live?embed=1` — table list clipped, no scroll** (`web.115`, reported by
  Kai) — embed mode set `.screen { height: auto }` so the frame could report a
  content height, but `html`/`body` stay pinned to the viewport with
  `overflow: hidden`: `documentElement.scrollHeight` echoed whatever height the
  host set (640 → 640, 1600 → 1600, content 2459), the ResizeObserver on
  `<html>` never fired, and `#live-lobby-list` grew to its content so it had
  no scroller left. The same rule left the table view at its 420px floor.
  Measuring `body` or unpinning `html` would not do either — both give
  max(content, frame), so the frame could grow but never shrink. Embed now
  keeps the /live layout (screens fill the frame, the list scrolls inside),
  the host sizes the iframe, and `embed.mjs` no longer posts `height`
  messages (`ready`, muted-by-default sound and install suppression stay).
  Host snippet in `docs/INSTALL_POKERTH_NET.md` updated;
  `scripts/test-live-embed.mjs` checks the new contract.
- **Hashed device ids were kept forever** (`web.110`) — daily visit buckets
  expire after `VISIT_RETENTION_DAYS` (400), but the all-time sets `allU`
  (hash → first day) and `allLU` (/live) were never pruned. `pruneVisitIds()`
  now runs whenever a bucket expires and drops every id no retained bucket
  holds, which also clears ids orphaned by older builds. A device back after
  the window counts as new again; cohorts and in-window new/returning figures
  are unchanged. Admin note: "all time" unique devices now means devices seen
  within the retention window. Privacy page (`pvSrv1`, 45 languages, and
  `/privacy`) updated accordingly. Test in `scripts/test-visit-prune.mjs`.
- **Error report label claimed "no personal data"** (`web.109`) — reports carry
  the browser user agent and a masked IP (last IPv4 octet / IPv6 tail removed)
  next to the error itself, kept in memory only. `advErrReport` now says what
  is sent, in all 45 languages; the option stays on by default, as the privacy
  page states.
- **Settings sync label claimed "opt-in"** (`web.108`) — `advCfgSync` read
  "(registered login only — stored on this server, opt-in)" in every language,
  but `_cfgSyncEnabled()` defaults to on for registered logins, as the privacy
  page now states. The "opt-in" part is removed from the label in all 45
  languages; behaviour is unchanged.
- **Table background no longer jumps by a pixel mid-hand** (`web.106`) — on
  fullscreen tables framed `center` (default PokerTH, Ivoire & Chêne, Disco…)
  the wallpaper is centred on `communityCenterY`, a barycentre measured from
  the seat plates' DOM rects. The socle opening, the end of the turn scale or
  an action badge moved it by a fraction of a pixel, and `Math.round` turned
  that into a 1 px jump of the whole picture (seen when the player's own turn
  ends). `_applyQmlBgCenter` now keeps the size/position already applied while
  the structural geometry (zone and `#s-game` rects, image, zoom, orientation)
  is unchanged and every component stays within 3 px; resizes and style
  changes still recompute exactly. Pure helper `_bgDynKeep`, tested in
  `scripts/test-layout.mjs`.
- **Offline training mode failed to start with no network** (fixed in
  `web.103`) — "Offline init failed" on a phone in airplane mode. The mode
  is a lazy `import('/modules/offline/index.mjs')`, and `offline/server.mjs`
  imports `modules/achievements/` (four files), which were never in the SW
  `ASSETS`. Runtime-cached files live in the `CACHE_VERSION` cache and are
  dropped on every bump, so after each deploy the achievements were missing
  until offline mode had been opened online once. Nine modules loaded by
  `pokerth-client.html` (`seat-menu`, `z-order`, `pm` + `pm/store`,
  `assist-pane`, `back-guard`, `debuglog`, `livescroll`, `chat/abbrev`) and
  the `ar`/`fa`/`he`/`ur` help pages were missing too. All are precached now;
  the failure status carries the import error. New
  `scripts/test-precache.mjs` walks the module graph from the HTML (plus the
  per-language imports) and fails on any file absent from `ASSETS`.
- **Localized pages served French and English interface text to crawlers**
  (fixed in `web.102`) — `/?lang=nl` (and every other variant, `/` included)
  had a localized `<title>` and SEO block, but the static defaults of
  `pokerth-client.html` — which a crawler without JavaScript reads — were a mix
  of English and French: the whole About dialog, the create-table form, 44
  tooltips. Two changes:
  - *Static fallback in English.* Every `data-i18n*` default now carries the
    `en.mjs` value; the three untagged French strings (kick confirmation,
    empty kick list, password prompt placeholder) got their existing keys or a
    neutral glyph. 17 icon buttons whose `aria-label` stayed French in every
    language now have `data-i18n-aria`.
  - *Serve-time localization.* With SEO on, `sendClientHtml` fills every
    `data-i18n`, `-opt`, `-title`, `-aria` and `-placeholder` node with the
    value `setLang()` would give it (language → English → static default), so
    the initial HTML of each variant is in its own language. The strings are
    the client's own: `seo-i18n/catalog-dump.mjs` imports `i18n.mjs` (overlays
    included) in a child process and `seo-i18n/ssr.js` reloads it when the
    translation files change, static deploys included. Scripts, styles and
    comments are never touched; `/live` and SEO-off installs are unchanged.
    The HTML cache key includes the catalog version.
  - The `#seo-intro` links now use the localized page titles, and its project
    line uses the About dialog strings (`abProject1/2`) instead of a hardcoded
    English sentence.
  With JavaScript on, the page is exactly as before. Needs a proxy restart.
  Test in `scripts/test-seo-ssr.mjs`.
- **`/live` header buttons leaked into the web client** (`web.66`–`web.98`,
  fixed in `web.99`) — `.live-only { display: none }` (0,1,0) lost to
  `.header .btn-sm { display: inline-flex }` (0,2,0), so the appearance button
  (🎨) and the light/dark button — empty outside live mode — showed in the
  ordinary lobby and table headers. A `:root:not([data-live="1"]) .live-only`
  rule with `!important` now hides every live-only piece outside `/live`;
  `/live` itself is untouched. Test in `scripts/test-live-chrome.mjs`.
- **Admin header on a phone** (`web.98`) — under 600 px the live-stats pill
  sat in the same box as the theme and log-out buttons; too wide to share the
  title's line, it wrapped and dragged both buttons down with it. The box now
  steps aside (`display:contents`): title and buttons keep the first line, top
  right, and the pill drops below at full width, above the host chip.
  Test in `scripts/test-admin-layout.mjs`.
- **`/live` announced itself as a web client** (`web.96`) — `/live` goes through
  the same `buildInit` as the player client, so since `USE_CLIENT_TYPE_WEB`
  (`web.0`) its spectator sessions logged in as `CLIENT_TYPE_WEB` (0x03).
  The tool it replaces, `pokerth-live`, identifies as `CLIENT_TYPE_QT_WIDGET`
  (0x01), and that is what `/live` must keep doing on the server. `buildInit`
  now picks 0x01 when `window.LIVE_MODE` is set; the player client keeps 0x03.
  The version bytes stay the current upstream release: `pokerth-live`'s frozen
  2.0.6 would fall under `MIN_BUILD_ID_QT_WIDGET` (2.1.7) and be refused.
  Test in `scripts/test-messages.mjs`.
- **The spectator table still moved when a hand ended** (`web.90`) — `web.82`
  reserved the action box with `min-height`, which only guarantees the empty
  case: once a message is present its own box can exceed the reservation. On a
  frame-by-frame reading of a recording, at the exact frame *next hand*
  appeared the table lost 4px of width and 9px at the top, and kept the new
  size. `#g-actions` is now a fixed box while spectating — height, min and max
  — with the message centred inside it, so nothing it holds can move the
  table.
- **`/live` language buttons never appeared** (`web.88`) — the three ids are
  the old header twins of the ••• menu entries, hidden at all sizes by an
  existing rule and again in the mobile block. Live mode reuses them
  deliberately, since `i18n.mjs` already keeps the active flag in sync with
  exactly those ids, so it now wins both rules back. The earlier test asserted
  the markup existed, which is precisely how they shipped invisible twice.
- **The language count was stated as 40 in entries written today** (`web.86`)
  — the catalogue has held 45 for a while; 40 was the figure at the time of
  the fourth RTL batch and it was repeated afterwards without anyone counting
  the files. Corrected where it describes the client as it is now. The
  `web.58`/`web.59` entries keep their 40: they were true when written, and a
  changelog is a record rather than a status page. `scripts/test-lang-count.mjs`
  now counts the catalogue and fails on any current claim that disagrees.
- **The table was re-scaled between hands while spectating** (`web.82`) — a
  seated player keeps an always-present action bar precisely so `#g-actions`
  cannot collapse and force a re-layout, but that guard is off for spectators,
  who have no bar to show. So the box went from one waiting line to nothing
  and back, the zone lost 23px each time and every seat and the community row
  were recomputed: zone 1263x764 to 1263x741, boxScale 1.579 to 1.531,
  commScale 1.775 to 1.719. The height of one waiting line is now reserved
  while spectating. The seat geometry itself was never at fault — plate
  dimensions and the community shift were identical in both readings.
- **`/live` lobby was narrow and the chat sat over the top** (`web.80`) — two
  causes. `#live-lobby` carries the `.live-only` class, which sets
  `align-items:center` for the small inline bits that share it; inherited by a
  column container that shrank both panels to their content width and centred
  them in an empty lobby. And the chat panel keeps the client's floating-window
  placement, so it drew itself fixed across the top whatever its parent was.
  The panels now stretch, and the docked chat is reset to an ordinary block —
  the same reset the client applies for its own lobby grid.
- **`/live` lobby fell apart when the chat failed to dock** (`web.79`) —
  `#lobby-chat-panel` is a child of `#s-lobby`, not of the `.lobby-body` live
  mode hides, so an undocked panel stayed visible and spread across the top of
  the lobby. It is now hidden unless it is actually inside the strip: the
  layout fails closed. The column direction is also enforced, so a stale or
  half-deployed stylesheet cannot lay the strip out as a side column, and the
  dock is re-checked once a second for the case where a quiet server produces
  no repaint for minutes.
- **`/live` language buttons looked absent** (`web.79`) — they carried no
  content of their own and relied on `i18n.mjs` filling in the flag, which only
  happens inside `setLang`. They now ship a globe glyph that the flag replaces
  when that sync runs.
- **`/live` chat strip sat empty** (`web.77`) — `pokerth.js` has a `reparent()`
  that appends `#lobby-chat-panel` back into `.lobby-grid` whenever the lobby
  re-lays itself out, which undid the move as soon as it ran. The dock is now
  re-asserted on every repaint of the table list and on resize.
- **`/live` language buttons were invisible** (`web.77`) — the flag SVG has no
  intrinsic size in a header button, so the buttons rendered at zero width and
  looked absent.
- **`/live` showed no tables and no guest name** (`web.70`) — both live
  modules read `window.S`, which does not exist: `game/state.mjs` bridges the
  shared state as `window.PthState`. One wrong identifier, both symptoms. The
  jsdom test now stubs `PthState` and asserts `window.S` is absent, so the
  same mistake fails the suite instead of the page.
- **`/live` table list stayed empty** (`web.69`) — it hooked
  `window.renderGames`, but `net/msg-lobby.mjs` calls the `renderGames`
  binding it imports from `ui/lobby.mjs`, so the hook never fired and the list
  showed "no tables" while the server had plenty. It now watches the ordinary
  `#g-list` for mutations — hidden in live mode but still rendered — with a
  content signature so a busy server doesn't cause a rewrite per message.
- **`/live` lost the leave-lobby button** (`web.69`) — hidden by mistake with
  the rest of the lobby header chrome; restored.
- **An expired inactivity countdown could leave the client hanging**
  (`web.64`) — at expiry the OK button is disabled on purpose (QML:
  `enabled: !timeoutWarningPopup.expired`; the server has decided, a
  `ResetTimeout` would be pointless), so what moves the official client on is
  the disconnection that follows — `ErrorMessage` 14 then `CloseSession`. When
  that never reaches the browser (the proxy's WebSocket still open over a dead
  server-side TCP), nothing happened at all: a dead countdown over a frozen
  lobby, and an inert OK. `_towShow()` now arms a 10 s grace timer at expiry;
  if no close has arrived by then, `_towGiveUp()` ends the session the way the
  cut would have — socket closed, no reconnect backoff, connect screen, and the
  `connErrIdle` reason in the "Connection lost" window. Armed for reason 0
  (idle connection) only and only outside a game: in a game the server merely
  kicks the player from the table (`SessionError` → `KickPlayer`) and the
  session lives on. A deliberate OK before expiry disarms it, as does the
  socket close. Six new cases in `scripts/test-msg-social.mjs`.
- **A server-ended session left the lobby frozen on screen** (`web.62`) — a
  rejection after login (kick 11, ban 12, session timeout 14, i.e. the server's
  20-minute lobby inactivity timer, `SERVER_SESSION_ACTIVITY_TIMEOUT_SEC`)
  goes through `onError()`, which sets `_intentionalDisconnect` to stop the
  reconnect backoff — correct, and the same call `isRecoverableTransportError()`
  makes upstream. But nothing then changed screen: `ws.onclose` returned on that
  flag, the lobby stayed up with a dead player list, and the reason went to
  `setStatus()`, which only paints the connect screen nobody was looking at.
  `onError()` now records the reason in `S._connLostReason`, and `onclose`
  consumes it: back to the connect screen plus a modal carrying the reason —
  the QML `connectionLostPopup` path (`pokerth.qml onConnectionFailed`: pop to
  StartPage, push `ServerConnectionDialog`, open the popup). A deliberate
  disconnect sets no reason and is untouched. New key `connLostTitle` in all 45
  languages; `scripts/test-state.mjs` pins the new field.
- **Lobby avatars stopped at the initial in the online-players list**
  (`web.61`) — the players list on the left and the Game Info panel are
  painted as soon as a nickname is known, i.e. *before* the avatar transfer
  (`AvatarRequest`/`Header`/`Data`/`End`) completes, and `onAvatarEnd()` only
  repainted the table seats, my own chip and an expanded table row. Both lobby
  surfaces therefore kept the letter fallback for players whose picture had in
  fact arrived and was already showing at the seats — most visible in LAN /
  dedicated mode, where the no-avatar fallback is the initial rather than the
  PokerTH logo. `onAvatarEnd()` now also repaints the players panel (when
  open) and the selected game's info panel; the `localStorage` cache-hit path
  in `onPlayerInfoReply()` does the same for the info panel. Rendering only,
  no new state and no change to the transfer itself.
- **Web changelog repeated one heading per deployment** (`web.60`) — the
  About window opens a new block on every `<date> version <x>:` line, and
  `public/ChangeLog-web` keeps one entry per deployment, so `2.1.8-web`
  appeared forty times over, each with its own "New / Improvements / Bug
  fixes" titles. `_abClRender()` now keys blocks by version and merges them
  under the first heading it meets — the most recent one, which carries
  `(current series)` — items kept in file order. The upstream `ChangeLog`
  has one entry per version, so its rendering is byte-identical.
- **LAN / dedicated mode reached the wrong WebSocket proxy** (`web.45`) — the
  default proxy URL was rebuilt from `hostInput.dataset.autoHost`, which under
  the `forced` instance policy holds the game-server host, and was persisted
  to `pth_proxy`, so a single Internet login poisoned the LAN form. All three
  branches now derive from `window.location.hostname`; an operator-forced
  `loginDefaults.proxyUrl` still wins.
- **WebSocket upgrade refusals are now logged** (`web.44`, proxy-only) — admin
  ban (403), per-IP socket cap and upgrade-rate guard (429) each print
  `[!] WS upgrade refused (code reason) — <masked ip>`, where all three were
  silent. **proxy.js changed — restart required.**
- **Incoming avatar transfers bounded** (`web.35`, upstream `0f700c4`) — the
  announced size is checked against the server's own 32 B…30720 B range, each
  chunk against that budget and the total again at `AvatarEnd`; a rejected
  stream releases its data, drops its requestId and is not requested again.
- **PROXY protocol header no longer breaks LAN / dedicated servers**
  (`web.33`, proxy-only) — the v1 header is emitted only toward the active
  game server (`_ppAppliesTo`, matched on the requested `host:port`), never
  toward an address typed in the login form. **proxy.js changed — restart
  required.**
- **Hand-history writes survive Android closing IndexedDB** (`web.23`) — the
  store watches `db.onclose`, reopens once and replays the transaction;
  `QuotaExceededError` pauses recording for the session instead of erroring
  after every hand.
- **Error collector filters browser-extension noise** — `*-extension://`
  frames, injected page-translator content scripts and opaque cross-origin
  `Script error.` entries no longer reach the report queue.
- **Non-PokerTH seat packs were stuck on the inset bet display** (`web.22`) —
  they render `classic` again, as before the option existed.
- **Top-centre (and spectator bottom-centre) bet half-clipped in the inset
  strip** (`web.20`) — the betside-split rule's `translateY(-50%)` applied to
  the strip's static chip; a re-neutralising rule now follows it.
- **Turn-highlight scale divided out of geometry measurements** (`web.19`) —
  `playerBox.scale` (1.04 opponents, 1.03 self) is excluded from rect
  measurements (`_plateTurnK`), so the witness seat no longer re-triggers
  layout bisection when it is at turn.
- **Table geometry invariant to bet display** (`web.18`) — the strip's
  constant 18 px is excluded from measurements (`_plateSocleH`), matching the
  QML slot heights, so the community barycentre no longer shifts.
- **Older LAN / dedicated servers rejected the client with "Version
  incompatible"** (`web.17`) — on error 1 in LAN / dedicated modes only, the
  client retries the Init announcing `CLIENT_TYPE_QT_WIDGET` (0x01); the flag
  sticks for the page session and never applies to pokerth.net.
- **Community cards no longer re-flip on every street** (`web.6`) —
  `renderComm` is incremental, only a slot whose card changed is recreated. A
  stale duplicate `.pk-flip` block in `pokerth.css` that overrode the QML
  timings, and made the river appear before the turn, is gone.
- **Assistance win% no longer freezes the table** (`web.7`) —
  `calcWinProbAsync` yields every ~8 ms, abandons a superseded pass and uses
  the vendored `phe` evaluator (600 deals instead of 200), warmed up at the
  preflop.
- **Active deck preloaded on table entry** (`web.8`) — the 52 faces and the
  back of the active deck are fetched at low priority, six at a time, during
  `JoinGameAck` and on every `_refreshDeck`; imported data-URL decks skipped.

## 2.1.7-web line (2026)

Opened with `v2.1.7-web.0` (2026-08-13), following the upstream **2.1.7**
release, closed at `web.179`. Per-build detail is on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
highlights below.

### Added
- **Disco table style, Blacklight 4c deck, Disco card back** (`web.171`) —
  ports of the three packs shipping with upstream 2.1.8 (`e6b2a67`,
  `8704f48`): the seventies club table with its magenta accents, the
  four-colour deck as a gallery deck (`/cards/blacklight-4c/`) and the
  mirror-ball back both standalone and as the deck's flipside. Credit:
  PokerTH Development Team, AGPL-3.0.
- **Community suggest opens to WEC admins on foreign WEC tables** (`web.174`,
  upstream `576b598`) — the table fingerprint recognises WEC (start cash,
  first small blind, raise interval and action timeout, no blind list),
  `wecadmins.txt` joins the botfile relay and `isCommunityAdmin(type, nick)`
  picks the list per community. `isBbcAdmin` stays as a compat wrapper.
  **proxy.js changed — restart required.**
- **Monthly Cup templates fill in the current tournament title** (`web.173`) —
  `applyVorlage` resolves `titleCommand` through `gameTitlePrefix` and
  substitutes the live monthly name; `prefetchGameTitles()` (upstream
  `0640366`) warms the gameslist cache when the create page opens.
- **Bet display setting — bet inside the player box** (`web.158`, upstream
  `414a89c`) — `inset` (a 20 px tray folding out inside the frame, the new
  desktop default) or `classic` (chip beside the box, still the touch
  default), stored in `pth_bet_style`, applied as `html[data-bet]` and
  switchable live. The tray's space is permanently reserved; only `betOut`
  packs are affected. Three new i18n keys in all 45 languages.
- **90 emoji reactions across three themed pages** (`web.151`–`web.164`) — the
  picker grows from 30 to 90 over Emotions, Mood & gestures and Poker & luck,
  with `‹ N/3 ›` paging in the title bar, a horizontal swipe on touch, the 37
  faces leading the catalogue and the last page persisted
  (`pth_react_page`). Several emojis re-picked for the poker context. Eight new
  choreographies (15 in total) and the `boom` / `gunshot` particle presets. The
  wire protocol is unchanged (`/emoji <char>`); `docs/REACTIONS_FX.md`
  documents every effect for the QML port.
- **"Playing in …" info in the players list** (`web.147`, parity with upstream
  `PlayerListItem`) — the full sentence on hover in the lobby panel, and in
  the player popup on touch. Two new i18n keys in all 45 languages.
- **Every content page written in all 45 languages** (`web.129`–`web.146`) —
  `/hand-rankings`, `/how-to-play` and `/glossary` join `/rules` and `/faq`,
  so each hreflang alternate resolves to a real translation and each page
  carries 45 sitemap URLs. The tables live in `seo-i18n/`, one module per page
  (836 KB kept out of `proxy.js`). Hand names come from each language's own
  `h1n`…`h10n` catalogue and the five action words stay in English. Three bugs
  fixed along the way: RTL card sequences reversed by the bidi algorithm (now
  isolated by `.ltr`), an untranslated `players` in a Japanese definition, and
  Devanagari `फ़` comparing as different precomposed vs base + nukta.
- **Admin Traffic tiles read at a glance** (`web.126`) — new devices under the
  unique count, the main figure coloured on a ±10 % move against the previous
  period and the delta spelled out; `/admin/visits` carries a `prev` block, an
  older proxy simply leaves the tiles gold.
- **Private messages** (`web.96` onwards, parity with
  `PrivateMessageDialog.qml`) — a persistent window with partner list,
  history, 128-character input and a bin; conversations kept in IndexedDB,
  received lines carrying the translate globe, guests and players at a running
  table gated exactly as the server gates them.
- **A player profile window** (`web.102`) carrying the fields of the official
  QML profile page, fed by a same-origin relay; session statistics moved into
  their own window (`web.112` / `web.114`). Both draggable, resizable and
  remembered.
- **Report an inappropriate avatar** (`web.72`) — a 🚩 button sending the
  official `ReportAvatar` request behind the desktop client's guards, with a
  shared confirmation modal.
- **Community suggest opens to every BBC admin** (`web.120` / `web.121`,
  upstream `422f5fe4`) — the template is fingerprinted from the table settings
  rather than assumed from the creator's client, and `bbcadmins.txt` joined
  the botfile relay.
- **Invite friends** (`web.6`–`web.8`) — an invitation dialog and its landing
  page, so a table is shared as a link rather than as instructions.
- **A bet keypad on touch devices** (`web.58`), a finger-usable bet field and
  slider, and slider granularity matched to the desktop client.
- **Custom sounds** (`web.19`) and a music play counter (`web.23`), later
  shown next to the track titles (`web.26`) and in the admin panel (`web.70`).
- **PWA integration** (`web.65` / `web.66`) — protocol handler, share target,
  file handlers and shortcut icons, plus Fold / Check-Call straight from the
  turn notification.
- **Five new languages** — Indonesian (`id`), Thai (`th`), Filipino (`fil`),
  Bengali (`bn`) and Swahili (`sw`) — bringing the client to **45 languages**
  (`web.11`–`web.15`).
- **Three new content pages** — `/hand-rankings`, `/how-to-play` and
  `/glossary` (`web.82`) — after `/rules` and `/faq` became servable per
  language (`web.46`) and were translated into all 45 (`web.55`, `web.89`).
- **BBC Anthem** table theme and its matching card back (`web.5`), by BaShFX,
  following the upstream 2.1.7 release.
- **Automatic updates** (`web.17`) and a **weekly leaderboard reset**
  (`web.40`), both operator-controlled.

### Changed
- **WebSocket heartbeat tolerates one missed pong** (proxy-only) — two
  consecutive misses (~20 s) are required before terminating, so a pong
  delayed by the nightly backup no longer kills a healthy client mid-hand.
- **Compression cache hardened; service-worker precache throttled**
  (`web.179` + proxy-side) — concurrent requests for the same uncompressed
  file share one brotli job, the critical shell is warmed serially at boot,
  and a cache overflow evicts the oldest entry instead of wiping everything.
  The service worker installs its ~130 precached assets through a 6-wide pool.
- **proxy.js no longer touches the disk on hot static paths** (proxy-only) — a
  5 s TTL stat cache backs the router, `sendFile` and `sendClientHtml`, and
  `newestAssetMtime()` memoises its scan across all `/__ver` polls, so
  saturated disk I/O no longer stalls the game WebSockets. Deploys are still
  picked up within 5 seconds.
- **App code served cache-first by the service worker** (`web.178`) —
  .js/.mjs/.css move from network-first to stale-while-revalidate, and
  navigations race the origin against a 3.5 s timeout before falling back to
  the cached shell. Deploys still reach users through the `/__ver` banner.
- **Suggest output is one player per line** (`web.175`, upstream `4afc377`) —
  headline then one name per line, rendered via `white-space: pre-line`, the
  counterpart of the QML `<br>` conversion.
- **Own client type on the wire** (`web.167`, upstream `c7e2959`) — the `Init`
  buildId carries `CLIENT_TYPE_WEB` (0x03) instead of masquerading as the
  Qt-Widget client; `USE_CLIENT_TYPE_WEB` flipped to `true`, the upstream
  triple still derived from `BUILD_VERSION`.
- **Frozen avatar upload bytes** (`web.166`) — the encoded PNG is persisted at
  pick time (`pth_avatar_up`) and re-served byte for byte, so per-browser
  re-encoding no longer mints a new MD5 each session and one avatar no longer
  reaches the server under several hashes. Emoji and letter avatars freeze per
  choice; the key joins the factory-reset keep list.
- **Translation fallback hardening** (`web.163`, upstream `69ec0824`) — the
  chain is gtx direct → MyMemory direct → server relay, the relay itself
  falling back gtx → MyMemory; MyMemory is queried as `Autodetect|target` with
  its `responseStatus` checked. A throttled toast replaces the silent
  hourglass when every service fails.
- **Per-account private messages** (`web.161`, upstream `9bccf3a`) — the
  history belongs to the logged-in nickname; `pth_pm` migrates to v2 with a
  composite `(owner, partner)` key and ownerless rows adopted by the first
  account to log in. Nothing is persisted while nobody is logged in.
- **Floating bet keypad on desktop** (`web.159`) — a compact 34 px overlay
  above the action panel instead of swapping the middle and action rows, so
  the whole bar stays visible and the view does not move; a click outside
  cancels it. Touch keeps the in-place replacement.
- **Long labels wrap instead of truncating** (`web.149`) — the About dialog
  tabs wrap onto a second line and the bar grows with them, and the
  create-table form labels wrap freely (QML `CustomTabBar` /
  `NetworkGameSettings` parity).
- **PM dialog sends with a paper-plane icon** (`web.148`) — the same square
  button as the lobby and table chats, and a mouse click no longer steals
  focus from the input, so the next message goes out with Enter.
- **Most played tracks is a ranking first** (`web.127`) — the top ten as
  horizontal bars, one context line (plays per day, plays per hundred visits),
  then a stacked daily chart of the top five with the rest grouped. The window
  starts on the day counting began.
- **The admin dashboard reorganised** (`web.27`–`web.38`) — three tab families
  that read as navigation, one section per subject, sub-sections in the
  crowded panels, and settings rows as a shared style.
- **The Traffic tab rebuilt** (`web.74`–`web.78`) — hour-of-day awareness,
  return rates, new versus returning folded into the 14-day chart, a bot-noise
  estimate, and two cards where there were fifteen.
- **The SEO panel** rebuilt (`web.81`), with a one-click fill for the
  pokerth.net settings (`web.83`) and the hreflang set coming from a single
  source with regional aliases (`web.45`).
- **Session logs** — multi-select (`web.21`), keyboard selection (`web.24`),
  copy to clipboard (`web.35`) and readable times (`web.37`).
- **Languages are shown by name** (`web.41`), no longer following the browser
  locale (`web.42`).
- **Reactions** aligned with the official chat rate limit (`web.71`), and
  avatar import no longer builds a base64 copy of the photo first (`web.73`).
- **Statistics cards moved onto the generic window model** (`web.104`) —
  clicking outside no longer closes them, there being no veil left to click.

### Fixed
- **Failed static loads are retried in-page** (`web.177`) — a failed
  `<script>` or stylesheet `<link>` is re-injected with a cache-buster (`?r=1`
  after 700 ms, `?r=2` 2 s later) before the one-shot auto-reload, against the
  short Cloudflare↔origin TLS bursts (HTTP 525) seen on pokerth.net. One log
  line per outcome.
- **Deal/action sound calls guarded** (`web.176`) — `notifyCard` /
  `notifyAction` are called only when defined, so a failed module load no
  longer throws in `msg-hand.mjs` mid-hand.
- **Community suggest output was silently dropped** (`web.175`) — the local
  note is posted with `{ force: true }` now that system messages are filtered
  out of the chat; the test asserts it.
- **Idle filter now counts spectators as at a table** (`web.172`, upstream
  `26018c9`) — `GameListSpectatorJoined/Left` maintain `games[id].watchers`
  and `_playerActivity` falls back to the watcher list after the seat scan, so
  the status pad, the "playing in" tooltip and the idle view agree.
- **Auto-update no longer restarts over reconnect-grace sessions** (`web.170`)
  — the arming check and the end-of-notice re-check count `_liveSessions`
  (bridges, grace included) as well as open sockets, where a locked phone was
  invisible. The admin Status card gains an **Active sessions** row.
- **LAN invite links now land on the right server** (`web.169`) — the invite
  target is published as `window._shareLanTarget` and takes priority in
  `_lanFields()` over the invitee's saved prefs and the instance defaults; a
  manual host/port edit releases it. Legacy `?host=` / `?port=` links get the
  same protection.
- **Login restored on pokerth.net** (`web.168`) — the live 2.1.7 build
  predated `c7e2959`, so `USE_CLIENT_TYPE_WEB` went back to `false` until the
  server shipped 2.1.8.
- **The client no longer defeats the server-side AFK kick** (`web.132`) —
  `renderMyTurnActions()` sent a `ResetTimeoutMessage` on every render, so an
  abandoned tab answered "still here" hand after hand; `_afkActivity` is now
  the single sender, rate-limited to 3 min like `kAfkResetIntervalMs`.
- **Content pages keep the reader's language** (`web.128`) —
  `_seoLangHref(relPath, table, lang)` builds every internal link and appends
  `?lang=` only where the target page has that translation, so no link points
  at a URL that canonicalises elsewhere.
- **Reconnect backoff no longer resets on the server Announce** (`web.125`) —
  an attempt counts as successful only after 10 s of open socket
  (`_armReconnectStable`) or an `InitAck`, instead of retrying every 5 s
  forever against a target that hangs up right after its `Announce`.
- **About tabs: the 2-line clamp actually applies, and words hyphenate**
  (`web.150`) — the clamp moved from the `<button>` to an inner span,
  `hyphens:auto` follows the document `lang`, `break-word` is the last resort,
  and the tab font steps down one size under 560 px.
- **The announced build id fell back to 2.1.6 after the 2.1.7 release**
  (`web.91`) — the derivation now follows `BUILD_VERSION` in both the protocol
  init and the served files.
- **A dead lobby connection went unnoticed** (`web.57`), **rejoining a running
  game after a disconnect** was broken (`web.54`), and the inactivity warning
  was not a real dialog (`web.56`).
- **The players list rendered empty** (`web.98`) and its column header lost
  its alignment (`web.94`).
- **The backup restore banner** failed silently, and an autosave could erase
  the backup it was meant to protect (`web.67`).
- **The update banner** was shown for an update already applied, and newly
  imported seat packs stayed invisible until the cache renewed (`web.25`).
- **iOS** — cards ran under the status bar and the notch (`web.108`), and the
  home-screen app opened on a white launch screen (`web.4`).
- **Contrast** — the Green Casino All-In button was unreadable in light mode
  (`web.64`) and the keypad cancel was barely visible on skinned tables
  (`web.63`).
- **The proxy hardened against connection floods** (`web.3`).
- **Stale language counts** across the help corpora, README and roadmap
  (`web.16`, `web.20`).

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
