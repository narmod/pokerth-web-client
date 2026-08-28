# Changelog

All notable changes to this project are summarised here. It loosely follows
[Keep a Changelog](https://keepachangelog.com/). Since `v2.1.4-web.0`
(2026-07-22) the version tracks the upstream PokerTH release the client is
aligned with, as `MAJOR.MINOR.PATCH-web.N` — a new upstream release resets the
web counter (`2.1.5` → `2.1.5-web.0`). Granular, per-build tags are published on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
this file captures what matters to players and operators.

## 2.1.7-web line (2026)

Opened with `v2.1.7-web.0` (2026-08-13), following the upstream **2.1.7**
release. Granular, per-build changes for this line are on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
highlights below.

### Added
- **90 emoji reactions across three themed pages** (`web.151`). The reaction
  picker grows from 30 to 90 emojis, split into three pages of 30 — Emotions,
  Mood & gestures, Poker & luck — navigated with `‹ ›` arrows and three
  numbered tabs (no new i18n keys; `web.152` — numbers instead of icon
  tabs, taller arrows, and hidden pages are now really hidden:
  `.react-grid { display:grid }` was overriding the `[hidden]` UA style,
  showing all three pages at once). The last page is persisted
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
