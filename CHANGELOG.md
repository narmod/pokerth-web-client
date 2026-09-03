# Changelog

All notable changes to this project are summarised here. It loosely follows
[Keep a Changelog](https://keepachangelog.com/). Since `v2.1.4-web.0`
(2026-07-22) the version tracks the upstream PokerTH release the client is
aligned with, as `MAJOR.MINOR.PATCH-web.N` — a new upstream release resets the
web counter (`2.1.5` → `2.1.5-web.0`). Granular, per-build tags are published on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
this file captures what matters to players and operators.

## 2.1.8-web line (2026)

2026-09-03 version 2.1.8-web.22:
- bugfix: non-PokerTH seat packs now render bets the way they did before the "Bet display" option existed - chip next to the player box ('classic') instead of the inset strip; web.21 had frozen them on 'inset'

2026-09-03 version 2.1.8-web.21:
- improvement: the "Bet display" option (inset strip vs chip next to the box) now applies only to the built-in "PokerTH" seat style - other seat packs always keep their original presentation; the option UI moved from the top of the Seats tab to a nested block under the PokerTH entry, shown only while that style is selected, and switching seat packs re-resolves the bet display live

2026-09-03 version 2.1.8-web.20:
- bugfix: the top-centre seat's bet (and the bottom-centre spectator seat's) was half-clipped in the inset bet strip - the betside-split rule (bet right of the box / puck left, QML 2.1.8 9f402258) won the cascade over the strip's chip reset at equal specificity, and its translateY(-50%) applied to the strip's static chip (left/top ignored, transform not), lifting it half out of the 20 px overflow-hidden band; a re-neutralising rule now follows the split rule - QML has no such case since PlayerBetStrip ignores betSide entirely

2026-09-03 version 2.1.8-web.19:
- improvement: opponent seat plates now have the fixed QML box width (121 layout px, border-box, GamePage tableZone 2.1.3 opp base) instead of sizing to their content - stack amounts and long names no longer widen boxes, so the free corridor between side plates, --comm-scale, the community row and the action-bar width (264*cs) stay constant as chip counts change; text elides inside the imposed width (name yields, stack never clips); image seat packs and the self box keep content sizing
- bugfix: the turn-highlight scale (playerBox.scale QML: 1.04 opponents, 1.03 self) is now divided out of all rect-based geometry measurements (new `_plateTurnK`, transform-origin center so rect centres are invariant) - the witness seat no longer crosses the 2 px `_seatDimsMeasured` threshold when it is at turn (which re-triggered layout bisection), and barycentre bounds/corridor no longer breathe as the turn moves around the table; works at any instant of the 180 ms transition

2026-09-03 version 2.1.8-web.18:
- bugfix: table geometry is now invariant to bet display - with the "in the box" bet style, the opened bet strip made each seat plate 18 px taller, which shifted the community-row barycentre (community cards nudged and rescaled), re-centred the fullscreen table background, and could bump the reference seat measurement into a re-layout; the strip's height (constant 18 px throughout its unfold, per the socleOpen keyframes) is now excluded from all geometry measurements (`_plateSocleH` in seat-render.mjs), matching the QML client where the strip space is permanently reserved in the slot heights

Opened with `v2.1.8-web.0` (2026-09-01), following the upstream **2.1.8**
release (server restarted by sp0ck the same night). Granular, per-build
changes for this line are on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
highlights below.

### Changed
- **Auto-update no longer blocked by notify-only sockets** (proxy-only,
  ships with the next Docker image). The restart gate counted every open
  WebSocket, including the lightweight `?notify=1` channels held by players
  connected directly to pokerth.net or playing offline against bots — so a
  handful of idle notify channels could postpone an armed update forever.
  The gate now counts only game bridges (active sessions, reconnect grace
  included); notify channels still receive the restart notice and simply
  reconnect after the bounce.
- **Client identifies as `CLIENT_TYPE_WEB` (0x03)** (`web.0`). The switch
  shipped dormant in `2.1.7-web.170` while pokerth.net still ran a build
  without upstream `c7e2959`; 2.1.8 includes it, so the flag is now on and
  the composite buildId is `0x03020108`. Web players show up as their own
  client type in server statistics, the Live/Spectator tool and the
  pthranking game-server dashboard.
- Announced upstream version follows `BUILD_VERSION` → **2.1.8**; hard-coded
  fallback triple bumped to match.
- **Admin lobby probes announce `CLIENT_TYPE_WEB` too** (`web.1`). The proto
  facade used by the proxy's headless guest probes (Check button, Server tab)
  still encoded Qt-Widget `0x01`; it now uses `0x03` like `buildInit`, so
  probes and players tell the server the same story (the 2026-08-12
  "one truth" rule). `test-build-id` updated accordingly.
- **Changelog grouped by entry type in About** (`web.16`). Each version
  block of the web changelog now sorts its `new:` / `improvement:` /
  `bugfix:` lines under translated New / Improvements / Bug fixes
  subheadings (three new i18n keys in all 45 languages); unprefixed lines
  and the upstream ChangeLog render unchanged.
- **Hand name gated behind the river on voluntary shows** (`web.15`),
  following upstream `1bf7a73` (QML showdown/log fine-tuning): when a player
  shows their cards after a pre-river fold-out, the log line now carries the
  cards only — no hand name computed from an incomplete board. The trailing
  "—" of the `logShowdown` template is stripped when no hand is named.
- **Chat history capped at 400 lines** (`web.15`), matching QML
  `LobbyHandler::pushChatLine` and upstream `c65fb30` (`kMaxChatBlocks`):
  both the lobby chat and the game chat now drop their oldest lines past
  400, keeping DOM size and relayout cost flat over long sessions.
- **Bet display defaults to `inset` on every platform** (`web.3`), following
  upstream `f9a8906` (QML `SeatStyle.defaultVariant`): the coarse-pointer
  `classic` default is gone; an explicit `pth_bet_style` is untouched.

- **Restore banner reworked into a backup banner** (`web.9`). The startup
  banner shown when settings look empty no longer assumes a backup exists:
  it now explains that the browser can keep a local backup of the settings,
  with symmetric "Create a backup" / "Restore a backup" actions and a
  "Later" dismiss. Creating never clobbers: if the picked folder already
  holds `pokerth-web-backup.json` the write is refused and the player is
  pointed to Restore; Restore falls back to the folder picker after a
  folder-shaped failure (gone, denied, no file). Seven new i18n keys in all
  45 languages.
- **Backup banner also shows on a brand-new browser** (`web.10`). It no
  longer requires a remembered folder: with none, Restore goes straight to
  the folder picker, and picking a folder from the advanced options
  releases the write hold (it counts as the pending banner decision).
- **Welcome modal and broadcasts translate everywhere** (`web.11`). Both
  already tried the on-device Translator API, which is Chromium-only; on
  Safari, Firefox and the iOS PWA the operator's text stayed untranslated.
  They now fall back to the shared `_gtxTranslate` chain (gtx direct →
  MyMemory → `/api/translate` relay), like chat and forum translations.
  The network fallback follows the chat-translation switch
  (`pth_chat_translate`, on by default) and never swaps a message whose
  detected source already matches the client's language.
- **Mobile table geometry synced with upstream 2.1.8** (`web.12`). Port of
  upstream `414a89c3` + `06db9866` into `layout.mjs`: the inset bet socle
  (betStripExtra 20) now enters the geometry base sizes, `betSideOutset`
  (inset 40 / classic 68) replaces the flat 48 side reserve on mobile, the
  39 px top-badge reserve is dropped on mobile compact landscape, and the
  landscape pair slack follows upstream (12 in compact, 4 otherwise).
  Portrait on mobile gets DYNAMIC seat rows (`buildPortraitSlots`, derived
  from the real box size like landscape) with the bisection probing the
  exact drawing function, a raised cap (fillCap 2.0, base 1.15), and the
  community row sized/centred in the computed middle band
  (`portraitBandAt` / `portraitCommunityNeed`); desktop keeps the fixed
  slots and nudges. Pure functions take an `opts` override (mobile /
  strip / outset) so `test-layout` pins the legacy classic-desktop
  expectations verbatim and adds 2.1.8 assertions.
- **Puck/bet placement parity with QML 2.1.8** (`web.13`). Three gaps vs
  the current `GamePlayerBox`: (1) landscape betSide now follows the QML
  column fractions (x < 0.45 → left, > 0.55 → right) instead of the old
  right-everywhere bias; (2) `betSplit` (upstream `9f402258`) is
  implemented — the top-centre box in landscape and the spectator's
  bottom-centre seat show the bet to the RIGHT of the box and the puck to
  the LEFT, both vertically centred (`betside-split` class + CSS);
  (3) in the inset seat style the side puck is vertically centred beside
  the box (the socle frees the lower slot), classic keeps the low slot.
  Self puck and the 32×32 size were already exact.
- **Self-box parity pass** (`web.14`). Three fixes after auditing
  `GamePlayerSelfBox` 2.1.8: the mobile-portrait geometry now models the
  self at its REAL web anchor (H−24, the deliberate 17/07 adjustment)
  instead of the QML H−4 — without this the new dynamic bottom row could
  bite ~20 px into the self box (`opts.selfBottom`, spectator unaffected);
  `SELF_BOX_MUL` for non-pokerth packs is derived from the 2.1.8 bases
  including the inset socle (1.121/1.115/1.096 in inset vs the stale 2.1.3
  ratios); and the QML at-turn lift of the self (`scale 1.03`, 180 ms
  OutQuad) is applied to the seat plate. Scale-by-boxScale, socle/strip
  bet display, 0.78/0.4 opacities, avatar 52 and the puck anchor were
  already conform.

### Added
- **Ivoire & Chêne table style** (`web.4`). Port of upstream `eee31d4`
  (`data/gfx/qml/table/ivoire-chene/`): fullscreen wallpaper, cream action
  buttons and pucks, ChatLog* parchment tint from the upstream XML. First
  light-toned pack, so `TABLES` gains an optional `btnFg` (dark button
  labels, as the QML reference render shows) instead of the white default.
  Credit: PokerTH Development Team, AGPL-3.0.
- **Table previews regenerated** (`web.5`). All 21 built-in packs take the
  `preview.png` / `preview_portrait.png` re-rendered upstream in `eee31d4`
  (bets inside the player boxes, `inset` seat style). Thirteen packs had no
  portrait preview and the default pack had no preview at all; `TABLES` now
  carries both for every entry. Felts are byte-identical upstream/web for
  Green Casino and the default table, so their QML renders apply as well.

### Fixed
- **Older LAN / dedicated servers rejected the client with "Version
  incompatible"** (`web.17`). Since `web.0` the client always introduces
  itself as `CLIENT_TYPE_WEB` (0x03); any `pokerth-server` built before
  upstream `c7e2959` (i.e. < 2.1.8 — every distro package) does not know
  that type and answers `initVersionNotSupported` even though protocol and
  build are fine. On error 1 in LAN / dedicated-server modes only, the
  client now retries the Init once announcing `CLIENT_TYPE_QT_WIDGET`
  (0x01), as before `web.0`; the fallback flag sticks for the page session
  and never applies to pokerth.net (guest/auth), where an error 1 remains a
  genuine rejection.
- **Community cards no longer re-flip on every street** (`web.6`).
  `renderComm` rebuilt all five slots with `innerHTML` at the flop, turn and
  river, so cards already on the board went through the flip again (opacity
  0 → `rotateY(90deg)`) and flickered — on phones they looked late. The
  renderer is now incremental: only a slot whose card changed is recreated,
  so a dealt card stays put and only the new one flips, as in the QML client.
  A stale duplicate `.pk-flip` block in `pokerth.css`, placed after the
  official one, also overrode the QML timings (0.32 s, delays 0.07–0.28 s)
  and made the river — `delay: 0 !important` — appear *before* the turn
  card; it is gone, so the flop staggers 0/120/240 ms and turn/river are
  immediate.
- **Assistance win% no longer freezes the table** (`web.7`). The hand-strength
  banner ran its Monte Carlo (200 deals × every live opponent, 21-combo
  evaluator) synchronously on the main thread 150 ms after each street —
  ~300 ms on a desktop and 0.5–1 s on a phone at a 10-seat table, right
  while the new card flips and the action bar opens. `calcWinProbAsync`
  now yields every ~8 ms like the Chances tab, abandons a pass the moment
  a newer street or hand supersedes it, and uses the vendored `phe`
  evaluator (full kicker ordering, ~20× faster) once loaded — with 600
  deals instead of 200, so the percentage is steadier. `phe` is warmed up
  at the preflop so the very first flop already benefits.
- **Active deck preloaded on table entry** (`web.8`). Card faces are
  `background-image`s set on the fly by `cardToHtml`, so every card was
  fetched the first time it showed up — a blank card for the length of the
  request on 4G/5G until the service-worker cache had seen all 52. The 52
  faces and the back of the active deck are now requested at low priority,
  six at a time, during the waiting page (`JoinGameAck`) and again whenever
  the deck or the card back changes (`_refreshDeck`), once per deck; the
  URLs are the very ones the CSS uses, so the HTTP/SW caches are warm before
  the first hand. Imported decks (data URLs) are skipped.

## 2.1.7-web line (2026)

Opened with `v2.1.7-web.0` (2026-08-13), following the upstream **2.1.7**
release, closed at `web.179`. Granular, per-build changes for this line are on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
highlights below.

### Added
- **Disco table style, Blacklight 4c deck, Disco card back** (`web.171`).
  Ports of the three style packs shipping with upstream 2.1.8 (`e6b2a67`,
  `8704f48`): the seventies club table (fullscreen wallpaper, glow-tile
  action buttons and pucks, magenta PlayerBoxAccent/ChatLog tint from the
  upstream XML), the four-colour blacklight deck as a gallery deck
  (`/cards/blacklight-4c/`, auto-listed by `decks-manifest`), and the
  mirror-ball back both standalone (`back-disco`) and as the deck's
  flipside. Credits per upstream `data-copyright.txt`: PokerTH
  Development Team, AGPL-3.0.

### Changed
- **WebSocket heartbeat tolerates one missed pong** (proxy-only, ships
  with the next Docker image). A pong arriving just past the 10 s window
  — typical when the nightly pigz backup saturates the CPU — used to get
  a healthy client terminated mid-hand. The proxy now requires two
  consecutive misses (~20 s) before terminating, still well within the
  session grace and upstream timeouts.
- **Compression cache hardened; service-worker precache throttled**
  (`web.179` + proxy-side). Proxy: concurrent requests for the same
  not-yet-compressed file now share a single read + brotli job instead of
  launching duplicates (in-flight dedup); the critical shell is warmed
  serially right after boot so the first visitors never pay the brotli-11
  cost; and a full cache overflow now evicts only the oldest entry instead
  of wiping everything. Client: the service worker installs its ~130
  precached assets through a 6-wide worker pool instead of all at once,
  easing the load on the origin when an update lands during the backup
  window.
- **proxy.js no longer touches the disk on hot static paths** (proxy-only,
  ships with the next Docker image — no client bump). Every static request
  used to run 2–3 synchronous `fs.statSync` calls (router + `sendFile`), and
  each `/__ver` poll rescanned ~50 files; when disk I/O is saturated by the
  nightly backup those sync calls block the Node event loop and stall the
  game WebSockets sharing the process. A 5 s TTL stat cache (`statCached`)
  now backs the router, `sendFile` and `sendClientHtml`, and
  `newestAssetMtime()` memoises its scan for 5 s across all `/__ver` polls.
  Deploys are still picked up within 5 seconds.
- **App code served cache-first by the service worker** (`web.178`). Scripts
  and stylesheets (.js/.mjs/.css) move from network-first to
  stale-while-revalidate: served instantly from the SW cache with a
  `cache:'reload'` background refresh. Deploys still reach users through the
  /__ver banner (CACHE_VERSION bump) or the following load. Navigations now
  race the origin against a 3.5 s timeout and fall back to the cached shell,
  with the fetch finishing in the background. Both changes keep the client
  responsive when the origin is slow — typically during server backups.

### Fixed
- **Failed static loads are retried in-page** (`web.177`). The error
  collector in `pokerth-client.html` re-injects a failed `<script>` or
  stylesheet `<link>` with a cache-buster (`?r=1` after 700 ms, `?r=2`
  after 2 s more) before falling back to the one-shot auto-reload. Aimed
  at the short Cloudflare↔origin TLS bursts (HTTP 525) seen on
  pokerth.net: the same URL answers a second later, but a failed static
  tag used to stay dead for the whole session. The log gets one line per
  outcome (`retry #n recovered` / `giving up`), no extra probe.
- **Deal/action sound calls guarded** (`web.176`): `notifyCard`/`notifyAction`
  from `sounds.mjs` are now called only when defined, so a failed module load
  no longer throws in `msg-hand.mjs` mid-hand.
- **Community suggest output was silently dropped** (`web.175`). The
  local suggestion note was posted as a plain `sys` chat message; when
  system messages were removed from the chat (narmod request, `spec.force`
  escape hatch), the suggest path was not updated and the note vanished —
  the mocked `addChat` in the test hid it. It now passes `{ force: true }`
  and the test asserts it.

### Changed
- **Suggest output is one player per line** (`web.175`). Parity with
  upstream `4afc377`: headline, then one name per line (`\n`), rendered
  via `white-space: pre-line` on `.msg.sys .txt` — the counterpart of the
  `<br>` conversion in QML `postLocalChatNote`.

### Added
- **Community suggest opens to WEC admins on foreign WEC tables**
  (`web.174`). Port of upstream `576b598`: the table fingerprint now also
  recognises WEC (no blind list, so start cash + first small blind +
  raise interval mode/value + action timeout must all match; the known
  Monthly Cup Final = WEC ambiguity is accepted as upstream), a separate
  `wecadmins.txt` joins the botfile relay (proxy.js — needs a proxy
  restart to serve it), and `isCommunityAdmin(type, nick)` picks the
  admin list per community with per-list failure throttling.
  `isBbcAdmin` stays as a compat wrapper. Covered by 11 new cases in
  scripts/test-botsuggest.mjs.

### Added
- **Monthly Cup templates fill in the current tournament title**
  (`web.173`). QML parity: `applyVorlage` now resolves `titleCommand`
  through `gameTitlePrefix` (gameslist.txt) and substitutes the live
  monthly name ("August Cup Final") when the fallback name is untouched
  and the template still selected — the plumbing existed in
  botsuggest.mjs since the 2.1.4 port but was never wired into the create
  form. Also ports upstream `0640366`: `prefetchGameTitles()` warms the
  gameslist cache when the create page opens, so a fast click on Create
  no longer races the async title fetch.

### Fixed
- **Idle filter now counts spectators as at a table** (`web.172`). QML
  parity with upstream `26018c9` (`syncPlayerGameMembership`: idle = at no
  table, seated *or* watching; the counterpart of the Widget client's
  role 34). `GameListSpectatorJoined/Left` now maintain
  `games[id].watchers` and repaint the players panel; `_playerActivity`
  falls back to the watcher list after the seat scan (a seat wins, as
  upstream), so the status pad, the "playing in" tooltip and the idle
  view all agree. The re-evaluation half of the upstream fix was already
  covered web-side (`_refreshPlayersPanelIfOpen` on every seat/mode
  mutation).

### Fixed
- **Auto-update no longer restarts over reconnect-grace sessions** (`web.170`).
  The idle check gating the automatic update/restart counted only OPEN browser
  WebSockets (`wss.clients.size`); a mobile player whose phone is locked sits
  in reconnect grace — browser socket closed, upstream game bridge alive — and
  was invisible to it, so the proxy could deem itself idle and restart, killing
  games in progress. Both the arming check and the end-of-notice re-check now
  also count `_liveSessions` (bridges incl. grace). The admin Status card gains
  an **Active sessions** row (`/admin/status.liveSessions`) next to Connected
  sockets, so the two figures — open sockets vs live bridges — are no longer
  conflated.
- **LAN invite links now land on the right server** (`web.169`). Sharing a
  table from a LAN / dedicated connection encodes the target in the link
  (`#join=<name>&s=<host[:port]>[&tls=1]`), and the invitee's fields were
  prefilled correctly — but the subsequent server-mode switch re-derived the
  LAN form via `_lanFields()`, overwriting host/port/TLS with the invitee's
  own saved `pth_lan_*` values or the instance defaults. The invite target is
  now published as `window._shareLanTarget` and takes top priority in
  `_lanFields()` (share link → player's saved prefs → instance default);
  a manual edit of the host/port fields releases it. Legacy `?host=`/`?port=`
  share links get the same protection.
- **Login restored on pokerth.net** (`web.168`). The live server currently runs a
  v2.1.7 build that predates upstream commit `c7e2959` (`CLIENT_TYPE_WEB`), so it
  rejected our `0x03` buildId with `initVersionNotSupported`. The client
  temporarily identifies as Qt-Widget 2.1.7 again (`USE_CLIENT_TYPE_WEB=false`);
  the web client type will be re-enabled once the server ships `c7e2959` /
  v2.1.8.

### Changed
- **Own client type on the wire** (`web.167`). The client now identifies as
  `CLIENT_TYPE_WEB` (0x03) in the `Init` buildId instead of masquerading as
  the Qt-Widget client, following sp0ck's upstream commit `c7e2959`
  (`game_defs.h`: `CLIENT_TYPE_WEB` + `MIN_BUILD_ID_WEB = 0.0.0`, no version
  floor for the independently-deployed web client). Server logs and the
  activity row now show `Web 2.1.7`, letting statistics tell web players
  apart. `USE_CLIENT_TYPE_WEB` flipped to `true` in
  `modules/net/messages.mjs`; the upstream triple is still derived from
  `BUILD_VERSION` at runtime.
- **Frozen avatar upload bytes** (`web.166`). sp0ck reported the same avatar
  reaching the server under several hashes (e.g. one player's photo avatar).
  Cause: the picked image was re-encoded (canvas → PNG via `toBlob`) on
  every session, and PNG encoders / JPEG decoders differ per browser,
  browser version and OS — same pixels, new bytes, new MD5, one server
  duplicate per environment. The encoded PNG is now persisted at pick time
  (`pth_avatar_up`, base64) and re-served byte for byte by
  `_pthRefreshUpload`; re-encoding only happens when the avatar actually
  changes (all `pth_avatar_img` writers purge the frozen record). Emoji and
  initial-letter avatars freeze per choice too, so system-font drift no
  longer mints new hashes. `pth_avatar_up` joins the factory-reset keep
  list next to the image itself. Mirrors the desktop principle of hashing
  the file's bytes once. New suite `scripts/test-avatar-frozen.mjs`.
- **Translation fallback hardening** (`web.163`). Parity with upstream commit
  `69ec0824` ("qml/widget: translation fallback hardening"): Google throttles
  the gtx endpoint per IP (HTTP 429, VPN users first), so the chain is now
  gtx direct → MyMemory direct (player's IP) → server relay, and the relay
  itself falls back gtx → MyMemory (the server's single shared IP is the
  first to get blocked). MyMemory is queried as `Autodetect|target`, its
  `responseStatus` is checked (it answers HTTP 200 with an UPPERCASE warning
  in `translatedText` on quota/pair errors), and the source==target 403 hands
  the original back like gtx does. When every service fails, a toast
  (existing `chatTranslateFailed` key, throttled 60 s) replaces the silent
  hourglass. New suite `scripts/test-translate-fallback.mjs`.
- **Per-account private messages** (`web.161`). Parity with upstream commit
  `9bccf3a` ("qml: pm dialog persistence fine-tuning"): the PM history now
  belongs to the logged-in nickname instead of the whole browser profile.
  IndexedDB `pth_pm` migrates to v2 (composite `(owner, partner)` key,
  mirroring the SQLite `owner` column upstream); ownerless rows from before
  the split are adopted by the first account that logs in. The inbox is
  empty and nothing is persisted while nobody is logged in (owner set on
  our own PlayerInfoReply, cleared on InitAck — the web analogue of
  `setMyPlayerInfo` / `setSession`), and a selected conversation that
  disappears with an account switch falls back to the first partner.
  New deterministic suite `scripts/test-pm-owner.mjs`.
- **Floating bet keypad on desktop** (`web.159`). On fine-pointer devices the
  web-only bet keypad no longer swaps out the middle and action rows: it now
  opens as a compact overlay (34 px keys) floating just above the action
  panel, with a short fade-in, so the whole bar — Fold/Call/Raise, slider,
  quick bets — stays visible and active and the game view does not move at
  all. A click anywhere outside the keypad cancels it; the click then reaches
  the bar normally. Touch devices keep the in-place replacement, which
  remains the only way to avoid the OS keyboard and table reflow. The small
  keypad-open button also now stretches to the exact height of the bet amount
  field at every bar scale, instead of a fixed 34 px.

### Added
- **Bet display setting — bet inside the player box** (`web.158`). Parity with
  upstream QML commit `414a89c` (`config/SeatStyle.qml` + `PlayerBetStrip.qml`):
  a new "Bet display" radio group in Settings → Styles → Seats chooses between
  `inset` (the bet sits in a 20 px tray that folds out at the bottom of the
  player box, inside the frame — the new platform default on desktop, matching
  the QML desktop default) and `classic` (bet chip next to the box, unchanged —
  still the default on touch devices, like Android/iOS in QML). Stored in
  `localStorage` `pth_bet_style` (empty = platform default, resolved via
  `pointer: coarse`), applied as `html[data-bet]` and switchable live on an
  open table. The tray's space is permanently reserved below the seat
  (`padding-bottom`, released when the tray opens) so opening it moves neither
  neighbours nor the autofit — mirroring the QML `tableZone.betStripH`
  reservation. Dealer/blind pucks stay outside the box in both variants. Only
  packs following the QML betside policy (`betOut` trait) are affected. Three
  new i18n keys across all 45 languages (de/es/it/pt translations taken
  verbatim from the upstream `.ts` files).
- **90 emoji reactions across three themed pages** (`web.151`). The reaction
  picker grows from 30 to 90 emojis, split into three pages of 30 — Emotions,
  Mood & gestures, Poker & luck — navigated with `‹ ›` arrows and three
  numbered tabs (no new i18n keys; `web.152` — numbers instead of icon
  tabs, taller arrows, and hidden pages are now really hidden:
  `.react-grid { display:grid }` was overriding the `[hidden]` UA style,
  showing all three pages at once). The pager is a compact `‹ N/3 ›` group in the
  title bar between the label and the pin (`web.154`; `web.155` — arrows
  and counter use `var(--text)` like the close button, because some theme
  packs redefine `--gold`/`--text-dim` too dark to read), and seven
  emojis were re-picked for the poker context (`web.153`): 😐 poker face,
  🥱 slowroll and 🙈 can't-watch join page 1 (replacing near-duplicates
  😉 🤭 😰), 🎊→🍿 popcorn, 🥈→💸 money-flies-away, 🥉→🪤 trap,
  🚨→🔮 soul read. All 37 face emojis now
  lead the catalog (`web.156`): the seven faces that lived on page 2
  (😎 🤩 🤡 😈 🫠 🥶 🥵) open that page, before gestures and objects. On touch
  devices the pages also answer to a horizontal swipe on the grid
  (`web.157`), with a small directional slide-in shared with the arrows
  (disabled under `prefers-reduced-motion`); vertical grid scrolling and
  button taps are untouched (passive listeners, 48 px / 600 ms
  dominantly-horizontal threshold). The smoke break asked for by sp0ck
  lands as 🚬 with slow-rising 💨 curls (`web.160`), replacing 💤 —
  the third sleep emoji after 😴 and 🥱 (Unicode has no joint emoji;
  the cigarette is the closest universal glyph). The revolver asked for
  by sp0ck lands as 🔫 replacing the redundant firecracker (`web.162`),
  with a dedicated 16th animation `recoil` (double kick-back) and a new
  `gunshot` particle preset — muzzle flash, tracer bullet flying left
  (the glyph points left, and renders as a toy water pistol on all major
  platforms since 2018), spark trail and ejected casing. The
  auto-fit maths now reserve a hover margin inside the scroll area
  (`web.164`): the 1.2× hover zoom of edge buttons was extending the
  grid's scrollable overflow, flashing a scrollbar; cells are solved in
  closed form with a 12 %-of-cell padding on each side. The last page is persisted
  (`pth_react_page`); the auto-fitting grid, mute and pin behaviours apply
  per page. Eight new emoji choreographies join the seven existing ones
  (launch, drop, wobble, flip, zoomout, heartbeat, shiver, tilt — 15 total)
  plus a `boom` particle preset: the 💣 requested by sp0ck drops onto the
  table and explodes with a double orange shockwave. The wire protocol is
  unchanged (`/emoji <char>`); `docs/REACTIONS_FX.md` documents every
  animation and per-emoji effect for the QML port. Catalog integrity
  (order, FX coverage, CSS keyframes) is guarded by
  `scripts/test-reactions-catalog.mjs`.

### Fixed
- **The client no longer defeats the server-side AFK kick** (`web.132`).
  `renderMyTurnActions()` sent a `ResetTimeoutMessage` on every render, and
  the client calls it on its own each time the turn comes round: an
  abandoned tab answered "still here" hand after hand, its session never
  timed out and its seat was never freed, while a QML client in the same
  spot is kicked. Upstream only ever sends a reset from real input
  (`GameHandler::eventFilter`) or from the OK button of the timeout popup
  (`TimeoutMsgBoxImpl`); `_afkActivity` (`modules/net/msg-social.mjs`) is
  now the single sender on the web side, rate-limited to 3 min like
  `kAfkResetIntervalMs`. Guarded by `scripts/test-afk-single-sender.mjs`.

  Fixing it also exposed four assertions in `scripts/test-action-bar.mjs`
  that were passing for the wrong reason: "action sent to the server" was
  really counting the keepalive above, and a stale `S.highestBet` made the
  Check/Call race guard reject the `doAction` calls before they reached what
  was under test.
- **Content pages keep the reader’s language** (`web.128`). The nav on the
  server-rendered pages, the crawler block on `/` and the connect-screen footer
  line all emitted bare hrefs, so a reader on `/rules?lang=fr` was thrown back
  to English on the next click and the translated pages looked as if they did
  not exist. `_seoLangHref(relPath, table, lang)` now builds every internal
  link and appends `?lang=` only where the target page has that translation,
  so no link points at a URL that canonicalises elsewhere. Covered by
  `scripts/test-seo-nav-lang.mjs`.
- **Reconnect backoff no longer resets on the server Announce** (`web.125`).
  A PokerTH server sends its `AnnounceMessage` the instant the socket opens,
  and both reconnect paths cleared `S._reconnectAttempts` from `ws.onmessage`.
  Against a target that hung up right after the Announce (server-side
  anti-brute-force, PROXY-protocol mismatch, ban) the backoff never advanced
  past its first step: the client retried every 5 s indefinitely until the
  server replied `blockedByServer`. An attempt now only counts as successful
  once the socket has stayed open for 10 s (`_armReconnectStable`) or an
  `InitAck` lands. Covered by `scripts/test-reconnect-backoff.mjs`.

### Fixed
- **About tabs: the 2-line clamp actually applies, and words hyphenate**
  (`web.150`). `web.149` put `-webkit-line-clamp` on the `<button>` itself,
  which keeps its own inner rendering and ignores `display:-webkit-box` — on
  an iPhone the labels ran to five lines, broken mid-word with no hyphen
  ("Journa / l des / modifi…"). The clamp now lives on an inner span, words
  break with real hyphenation (`hyphens:auto`, following the interface
  language via the document `lang`), `break-word` only remains as a last
  resort for languages without a hyphenation dictionary, and the tab font
  steps down one size under 560px so whole words fit first. Guard extended in
  `scripts/test-portrait-wrap.mjs`.

### Changed
- **Long labels wrap instead of truncating** (`web.149`). QML-parity with the
  upstream portrait fine-tuning (stable, 2026-08-27): the About dialog tabs
  now wrap onto a second line and the bar grows with them, instead of cutting
  the label off ("Third party li…") in narrow portrait windows or long
  translations (`CustomTabBar`: WordWrap + `maximumLineCount: 2`, mirrored
  with a 2-line `-webkit-line-clamp`). The create-table form labels likewise
  wrap freely (`Local`/`NetworkGameSettings`: WordWrap on every Label).
  Guarded by `scripts/test-portrait-wrap.mjs`.
- **PM dialog sends with a paper-plane icon** (`web.148`). QML-parity with
  upstream `PrivateMessageDialog` fine-tuning (stable, 2026-08-27): the wide
  labeled "Send" button is replaced by the same square paper-plane icon button
  the lobby and table chats use, sized to the input row. A mouse click no
  longer steals focus from the input (`onmousedown` preventDefault, the web
  equivalent of QML's `focusPolicy: NoFocus`), so the next message goes out
  with Enter right away. Same `sendTooltip` i18n key as the chat button; the
  `pmSend` key stays in the tables but is no longer referenced. Guarded by
  `scripts/test-pm-send-icon.mjs`.

### Added
- **"Playing in …" info in the players list** (`web.147`). QML-parity with
  upstream `PlayerListItem` (stable, 2026-08-27): hovering a player's name in
  the lobby players panel now shows the full sentence *"X is playing in
  "Y"."* / *"X is not playing at the moment."*. On touch — where there is no
  hover — the same line appears in the player popup, our equivalent of the
  QML expanded row. Same data source as the existing status LED
  (`_playerActivity`); two new i18n keys (`plPlayingInFull`,
  `plNotPlayingFull`) translated across all 45 languages.
- **Every content page written in all 45 languages** (`web.129`–`web.146`).
  `/rules` and `/faq` were already translated; `/hand-rankings`, `/how-to-play`
  and `/glossary` shipped with empty tables, so `?lang=` was ignored on all
  three and every reader got English. All five are now complete — each
  hreflang alternate resolves to a page actually written in that language, and
  each page carries 45 sitemap URLs instead of one.

  The tables live in `seo-i18n/`, one module per page: inlined they would have
  added 836 KB to a `proxy.js` that already weighs 1.1 MB. Each module
  assembles its page bodies once at load from language-neutral data handed in
  by `proxy.js`, so `seoPageLangs()`, the hreflang set and the sitemap work
  unchanged, and English stays in the page functions as the fallback.

  Terminology follows the client rather than the translator. Hand names come
  from each language’s own `h1n`…`h10n` catalogue, so the page says Kåk in
  Swedish and 葫芦 in Chinese and never disagrees with the in-game hand list.
  The glossary keys every entry on the English headword — what a player
  actually meets in the chat — and adds the local equivalent only where the
  language has one, which is why Russian carries 53 of them and German seven.
  The five action words stay in English everywhere, as they do at every table
  in the world.

  Three bugs surfaced along the way, each invisible in a Latin-script
  language. The bidi algorithm reverses `A♠ K♦` and `10-J-Q-K-A` inside an
  Arabic or Hebrew paragraph, so a worked example rendered backwards — wrong,
  not merely ugly; `.cards` and a new `.ltr` class now isolate them, at no
  cost in LTR. An untranslated `players` sat unnoticed inside a Japanese
  definition. And Devanagari `फ़` exists both precomposed and as base + nukta,
  which made an identical Hindi hand name compare as different.

  `scripts/test-seo-hands-i18n.mjs`, `test-seo-howto-i18n.mjs`,
  `test-seo-glossary-i18n.mjs` and `test-seo-nav-lang.mjs` guard the result:
  entry completeness, index alignment against the English source, terminology
  against the client catalogue, internal links resolving in the reader’s
  language, action words left in English, bidi isolation, and `<title>` and
  `<meta description>` measured in display width rather than characters, since
  a search result truncates on a pixel budget.
- **Admin Traffic tiles read at a glance** (`web.126`). The four period tiles
  now show the number of new devices under the unique count, and colour the
  main figure green or red when it moves 10 % or more against the previous
  period — yesterday up to the same hour, the previous 7 days, the previous
  30 days — with the delta spelled out under the tile. The `/admin/visits`
  reply carries a `prev` block for those references; an older proxy simply
  leaves the tiles gold. Visits/day and Returning/day pick up the same colours
  from their existing trend and half-window comparisons.
- **Private messages**, aligned with the upstream `PrivateMessageDialog.qml`
  (`web.96` onwards). A persistent conversation window: partner list, history,
  128-character input with a live counter, and a bin to drop a conversation.
  Conversations are kept locally in IndexedDB, so closing the window loses
  nothing. Received lines carry the same translate globe as the chat. Guests
  cannot be written to and a message is refused while the sender sits at a
  running table, exactly as the server itself gates it.
- **A player profile window** (`web.102`) carrying the fields the official QML
  profile page shows, fed by a same-origin relay. Session statistics moved out
  of the player card into their own window (`web.112`/`web.114`), and both are
  draggable, resizable and remembered across sessions.
- **Report an inappropriate avatar** (`web.72`) — a 🚩 button in the player card
  sends the official `ReportAvatar` request, behind the same guards as the
  desktop client, with a shared confirmation modal.
- **Community suggest opens to every BBC admin** (`web.120`/`web.121`), parity
  with upstream `422f5fe4`. The template is fingerprinted from the table
  settings rather than assumed from the creator's own client, and
  `bbcadmins.txt` joined the botfile relay.
- **Invite friends** (`web.6`–`web.8`) — an invitation dialog and its landing
  page, so a table is shared as a link rather than as instructions.
- **A bet keypad on touch devices** (`web.58`), a finger-usable bet field and
  slider, and slider granularity matched to the desktop client.
- **Custom sounds** (`web.19`) and a music play counter (`web.23`), later shown
  next to the track titles (`web.26`) and in the admin panel (`web.70`).
- **PWA integration** (`web.65`/`web.66`) — protocol handler, share target, file
  handlers and app shortcut icons, plus Fold / Check-Call straight from the turn
  notification.
- **Five new languages** — Indonesian (`id`), Thai (`th`), Filipino (`fil`),
  Bengali (`bn`) and Swahili (`sw`) — bringing the client to **45 languages**
  (`web.11`–`web.15`).
- **Three new content pages** — `/hand-rankings`, `/how-to-play` and `/glossary`
  (`web.82`) — after `/rules` and `/faq` became servable per language
  (`web.46`) and were translated into all 45 (`web.55`, `web.89`).
- **BBC Anthem** table theme and its matching card back (`web.5`), by BaShFX,
  following the upstream 2.1.7 release.
- **Automatic updates** (`web.17`) and a **weekly leaderboard reset**
  (`web.40`), both operator-controlled.

### Changed
- **Most played tracks is a ranking first** (`web.127`). The section opens
  with the top ten titles as horizontal bars (plays and share; titles removed
  from the catalogue shown in italics), then one context line — plays per day
  and plays per hundred visits, the music panel's adoption — and a stacked
  daily bar chart of the top five titles with the rest grouped. The window
  starts on the day counting began instead of padding fourteen days with
  empty ones. The previous seven-line chart put the "others" sum above every
  named title and pinned the rest to the zero line.
- **The admin dashboard reorganised** (`web.27`–`web.38`) — tabs grouped into
  three families that read as navigation, one section per subject instead of a
  wall of cards, sub-sections in the crowded panels, and settings rows as a
  shared style rather than copy-paste.
- **The Traffic tab rebuilt** (`web.74`–`web.78`) — it now reads the numbers
  instead of only counting them: hour-of-day awareness, return rates, new versus
  returning folded into the 14-day chart, a bot-noise estimate, and two cards
  where there were fifteen.
- **The SEO panel** stopped being five fields and a hope (`web.81`), gained a
  one-click fill for the pokerth.net settings (`web.83`), and the hreflang set
  now comes from a single source with regional aliases (`web.45`).
- **Session logs** — multi-select (`web.21`), keyboard selection (`web.24`),
  copy to clipboard (`web.35`) and readable times (`web.37`).
- **Languages are shown by name** (`web.41`), no longer following the browser
  locale (`web.42`).
- **Reactions** aligned with the official chat rate limit (`web.71`), and avatar
  import stopped building a base64 copy of the photo first (`web.73`).
- **The statistics cards moved onto the generic window model** (`web.104`).
  Behaviour change: clicking outside no longer closes them, since there is no
  veil left to click.

### Fixed
- **The announced build id fell back to 2.1.6 after the 2.1.7 release**
  (`web.91`) — the derivation now follows `BUILD_VERSION` in both the protocol
  init and the served files.
- **A dead lobby connection went unnoticed** (`web.57`), **rejoining a running
  game after a disconnect** was broken (`web.54`), and the inactivity warning
  was not a real dialog (`web.56`).
- **The players list rendered empty** (`web.98`) and its column header lost its
  alignment (`web.94`).
- **The backup restore banner** failed silently, and an autosave could erase the
  backup it was meant to protect (`web.67`).
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
because sp0ck shared them ahead of the release.

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

### Added
- **The card-dealing animation can be switched off** — a new toggle in the
  advanced options, Cards section (web, on by default), asked for on the
  forum. In the same pass the animation stops flying cards to the chairs of
  knocked-out or departed players: it now targets only the seats actually
  dealt this hand, using the seat list the renderer publishes.

### Changed
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

### Added
- **Training-mode achievements.** A new **Trophées** tab in the ranking window — shown only inside Training mode, once connected — tracks 27 achievements across Progress, Skill, Play-style, Fun and PokerTH formats: play 100 / 500 / 1000 hands, win 1 / 10 / 50 games, win-streaks, a comeback from under 15% of your stack, a heads-up win, patience, bluffs, all-ins, beating the three difficulty "schools", a completionist meta, and PokerTH-format wins (Ranking, WeCup, BBC, plus a Triple Crown, a Blitz and a rising-blinds milestone). Locked ones are greyed out, a 👥 badge flags achievements that require a set number of players, and unlocking one pops a toast. A compact "X / 27" counter also shows on your own profile card and the end-of-game screen. Fully localised in the 36 languages. Under the hood it's a mode-agnostic module (`public/modules/achievements/`) driven purely by the engine's event stream, so the same system can later plug into other modes.
- **Startup loading screen.** A boot splash matching the login look (theme-aware colours, labels in 36 languages) covers startup until the app is ready, preloading the critical assets with automatic retry and offering a **Retry** button if the connection drops mid-load — so a flaky network no longer leaves a half-loaded UI.
- **Seven official PokerTH card decks** in the deck gallery, plus one-click import
  of a table, card deck or card-back from a `.zip`.
- **A dedicated Music player panel** (game-sound settings moved to Advanced options).

> **Offline needs HTTPS.** A Service Worker — and therefore the whole offline cache — only registers over **HTTPS** (or `localhost`). On a plain `http://` server the game still works online, but there is **no offline cache**, so an installed PWA can't launch (not even Training mode) without a connection. Serve the app over `https://` for offline play.

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
