# Changelog

All notable changes to this project are summarised here. It loosely follows
[Keep a Changelog](https://keepachangelog.com/). Since `v2.1.4-web.0`
(2026-07-22) the version tracks the upstream PokerTH release the client is
aligned with, as `MAJOR.MINOR.PATCH-web.N` — a new upstream release resets the
web counter (`2.1.5` → `2.1.5-web.0`). Granular, per-build tags are published on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
this file captures what matters to players and operators.

## 2.1.9-web line (2026)

Opened with `v2.1.9-web.0` (2026-09-12), following the upstream **2.1.9**
release. Per-build detail is on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
highlights below.

### Changed
- **Chances panel readability, impossible categories** (`web.0`, parity with
  upstream `f7a8e26d`) — the bar track background goes from 14% to 22%
  opacity (both the info-panel tab and the floating odds monitor), and
  categories at zero samples (truly impossible with the current cards, not
  just a low percentage) now get a dedicated dimmed-but-readable state
  (icon at 50% opacity, label/percentage at 55%) instead of blending into
  the background at the old, near-invisible level.

## 2.1.8-web line (2026)

Opened with `v2.1.8-web.0` (2026-09-01), following the upstream **2.1.8**
release. Per-build detail is on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
highlights below.

### Added
- **Latvian SEO content pages** (`web.149`) — hand rankings, glossary and how-to-play pages now render in Latvian.
- **Latvian catalogue (`lv`)** (`web.148`) — 47th language, full UI catalogue and help corpus.
- **Estonian SEO content pages** (`web.145`) — same three content pages in Estonian.
- **Estonian catalogue (`et`)** (`web.144`) — 46th language, full UI catalogue and help corpus.
- **Local/Entraînement and LAN: viewable and resettable from any mode** (`web.140`) — both panes now always show their own data and reset independently of the current connection.
- **Player profile: LAN and Local/Training as two always-visible tabs** (`web.139`, corrects `web.138`) — split into two independent tabs shown together for any mode.
- **Player profile window: three top-level tabs** (`web.138`) — Coupes / Local-Entraînement / LAN, each shown only where its data applies.
- **My avatar: stats/reset accessible in LAN / private server** (`web.137`) — the profile button and its reset now also work off pokerth.net.
- **Table ranking: LAN tab** (`web.136`) — table-scoped family leaderboard, shown on LAN/private servers.
- **Accessibility: Escape priority on the modal** (`web.135`, community contribution by @seanpianka) — closes out the low-vision accessibility series (scope 7/7).
- **Accessibility: high-contrast palette** (`web.134`, @seanpianka) — the toggle gets a real dedicated palette.
- **Accessibility: mobile landscape adaptive play** (`web.132`, @seanpianka) — adaptive drawer system extended to landscape.
- **Accessibility: mobile portrait adaptive play** (`web.127`, @seanpianka) — felt corner buttons replaced by a bottom drawer bar at Extra Large.
- **Accessibility: desktop active play scaling** (`web.124`, @seanpianka) — interface size now also scales the in-game table.
- **Accessibility: login and lobby scaling** (`web.123`, @seanpianka) — Large/Extra Large sizes now visible on login and lobby.
- **Accessibility entry point** (`web.122`, @seanpianka) — new panel: interface size, high contrast, browser zoom.
- **LAN tab in the ranking window** (`web.120`) — family leaderboard shown on LAN/private servers.
- **Lobby table list by keyboard** (`web.114`, upstream `b170786`) — arrows/Home/End/Enter to select and join.
- **`/live` visits counted apart too** (`web.101`) — separate visit stats from the player client's own.
- **Admin tells `/live` apart from the web client** (`web.100`) — separate counters and tags in the dashboard.
- **`/live` — fullscreen in both headers** (`web.97`) — moved out of the ••• menu.
- **`/live` keeps its own storage** (`web.89`) — namespaced `localStorage` so a spectator doesn't inherit a player's settings.
- **`/live` drops the lobby feed while watching a table** (`web.85`) — unsubscribes from full lobby updates while spectating.
- **`/live` defaults in the admin page** (`web.84`) — dedicated palette/sound/chat-strip defaults card.
- **`/live?embed=1` — the spectator view in an iframe** (`web.83`) — reports height via `postMessage`, table-only embed.
- **`/live` — a word while the join happens** (`web.81`) — "joining, please wait" dialog with Cancel.
- **`/live` — avatars, player cards, type icons** (`web.78`) — Players tab reuses the client's own player card and avatar.
- **`/live` — chat as a bottom strip** (`web.77`) — resizable horizontal chat strip under the table list.
- **`/live` — language in the header, lobby frame, figures in words** (`web.76`) — language picker added; server figures show their full wording.
- **`/live` — the figures replace the idle hint** (`web.75`) — server counters shown with full translated wording.
- **`/live` — the login card shows the server** (`web.74`) — "Live / Spectator Tool" card with the four server figures.
- **`/live` — its own transport setting** (`web.73`) — Same as Internet / Direct WS / Via proxy, independent of the main client.
- **`/live` — Players tab and read-only chat** (`web.72`) — online players list; chat composer hidden.
- **`/live` — lobby chat as a resizable right column** (`web.71`) — same layout as the full client's lobby.
- **`/live` — the table list** (`web.68`) — spectator-tool-style table list (seats, status, blinds…), Spectate only.
- **`/live` — one-button guest login** (`web.67`) — single button, no mode/nickname/avatar choices.
- **`/live` — slim header** (`web.66`) — only guest name, appearance and build shown.
- **`/live` — embedded spectator mode, first stone** (`web.65`) — new route, groundwork for replacing `pokerth-live`.
- **The game-server figures in the dashboard header** (`web.63`) — same four counters as a strip on every admin tab.
- **Live server figures on the login screen** (`web.56`, reworked `web.58`/`web.59`) — players online/tables/waiting/games on the Internet card.
- **World clock above the admin tabs** (`web.47`–`web.48`) — up to 12 analog dials by UTC offset.
- **Server time heads the status list** (`web.48`) — read from the proxy, not the browser clock.
- **Real sky on each dial** (`web.49`) — day/twilight/night rendered from the sun's real altitude at that city.
- **Clock strip fills the width and folds on a phone** (`web.49`).
- **Horizontal scroll for the clock strip on phones** (`web.50`).
- **Server / Client / Data buttons take the page width** (`web.50`).
- **Sun-yellow daylight on the clock faces** (`web.51`).
- **Continuous sky gradient on the dials** (`web.52`) — computed from sun altitude, no colour bands.
- **Traffic charts answer to a finger, legends toggle series** (`web.53`).
- **Language breakdown names the no-header bucket** (`web.54`) — clearer labels, lists untranslated languages seen.
- **No language lost to the cardinality cap** (`web.54`).
- **Admin panel names the product and its host** (`web.55`).
- **Icons on every dashboard tab** (`web.47`).
- **Game log reads its colours from the table style** (`web.46`, upstream `e90593e`) — winner/board lines tinted per table style.
- **Context menu on a seat** (`web.43`, parity `GamePlayerBox.qml`) — right-click/long-press: note, profile, ignore, report, kickban.
- **Player notes exchanged with the official clients** (`web.38`) — notes round-trip via `config.xml` export/import.
- **Star rating on player notes** (`web.36`, upstream `b77ad47`) — 0–5 stars on the player card and table badge.
- **Hand-written notice defaults in all 45 languages** (proxy-only) — replaces machine-translated defaults.
- **Thumbs up / down on the music player** (`web.32`) — per-track vote, one per device, counts in the admin panel.
- **Notice acknowledgement** (`web.31`) — "I understand" persists per notice version.
- **Built-in default text for both notices** (`web.30`).
- **Registered-account notice** (`web.29`) — separate popup for logged-in pokerth.net accounts.
- **Guest notice** (`web.28`) — operator-authored popup on every guest connection.
- **Player notes and colour labels** (`web.24`) — note + 6 colour labels on the player card.
- **Ivoire & Chêne table style** (`web.4`, upstream `eee31d4`) — new light-toned table pack.
- **Table previews regenerated** (`web.5`) — all 21 built-in packs get refreshed preview images.

### Changed
- **`/live` identifies as the web client** (`web.119`, sp0ck 2026-09-10) — sends `CLIENT_TYPE_WEB` (0x03) like the player client instead of masquerading as Qt-Widget.
- **Training mode draws from a cryptographic RNG** (`web.118`, upstream `40122fe`) — `crypto.getRandomValues` replaces `Math.random` for the deck shuffle and bots.
- **Keyboard lot completed** (`web.117`, upstream `b170786`/`21da2f0`/`5c321a5`/`3fa46aa`) — start focus on reading areas, ranking search, settings/forum arrow-key navigation, end-of-game and login Escape/focus.
- **Start focus per screen, Enter creates from any settings field** (`web.116`, upstream `b170786`) — login/create-table fields get opt-in initial focus and Enter-to-submit.
- **Kick and report confirmations focus Confirm** (`web.113`, upstream `b170786`) — matches the QML `ConfirmPopup` default focus.
- **Popups open with the keyboard focus on their safe button** (`web.112`, upstream `b170786`/`21da2f0`/`5c321a5`/`3fa46aa`) — leave/disconnect/timeout/invite popups now focus a safe default button and restore focus on close.
- **Reaction choreographies ×1.25, as upstream `b8a1d18`** (`web.111`) — QML/widget adopted the web's animation timings and stretched them back to the 2.1.7 flight time; web keeps the original tempo.
- **`/live` — no table chat, no fullscreen inside a frame** (`web.107`) — hidden when embedded on pokerth.net.
- **Privacy page rewritten to match what the code does** (`web.105`) — now accurately describes visit stats, settings sync, error reports, translation relay and leaderboard data handling.
- **Default deck and table precached for offline play** (`web.104`) — an offline game right after an update no longer shows blank cards/felt.
- **Avatars behave like the QML client: one per session, through the server only** (`web.95`) — drops the web-only relay path so all clients see the same avatar.
- **`/live` — the last two notices go, and language lands live** (`web.94`) — guest-rules card and update banner silenced; table list now repaints on language change.
- **`/live` — the player card is read-only, and the header settles** (`web.93`) — notes/ignore/report/kickban removed from the spectator's player card.
- **`/live` — a quieter table and a tidier login card** (`web.92`) — hand log and combinations card removed; header buttons repositioned.
- **`/live` carries less of the web client** (`web.91`) — no local backup, no operator broadcasts, no music slider.
- **`/live` — light / dark / automatic in the header** (`web.91`) — palette cycle button added.
- **`/live` no longer shows the client's own notices** (`web.87`) — welcome modal, account notice and polls silenced in live mode.
- **The dashboard header lost its two link buttons** (`web.63`) — replaced by the game-server figures.
- **Ivoire & Chêne panel colours follow upstream `f7a8e26`** (`web.57`) — darker palette values, higher contrast floor on the panel background.
- **Own row in bold in the players list** (`web.42`).
- **Star ratings moved to the lobby star column, new `--star` colour** (`web.41`).
- **Colour dot joins the star badge after the name** (`web.40`).
- **Star badge anchored to the right of the seat name** (`web.39`, upstream `d72d109`).
- **Player card locked to a fixed width** (`web.37`) — `PIM_WIN_W = 400`, height stays adjustable.
- **`InitMessage.clientPlatform` announced to the server** (`web.34`, upstream `864bc53`).
- **Bet display option scoped to the PokerTH seat style** (`web.21`) — other seat packs keep their original presentation.
- **Opponent seat plates at the fixed QML box width** (`web.19`) — 121px, border-box, text elides.
- **Auto-update no longer blocked by notify-only sockets** (proxy-only).
- **Client identifies as `CLIENT_TYPE_WEB` (0x03)** (`web.0`) — switch activated (shipped dormant since `2.1.7-web.170`).
- Announced upstream version follows `BUILD_VERSION` → **2.1.8**.
- **Admin lobby probes announce `CLIENT_TYPE_WEB` too** (`web.1`).
- **Changelog grouped by entry type in About** (`web.16`) — new:/improvement:/bugfix: sort under translated subheadings.
- **Hand name gated behind the river on voluntary shows** (`web.15`, upstream `1bf7a73`).
- **Chat history capped at 400 lines** (`web.15`, matching QML/upstream `c65fb30`).
- **Bet display defaults to `inset` on every platform** (`web.3`, upstream `f9a8906`).
- **Restore banner reworked into a backup banner** (`web.9`) — symmetric create/restore/later, never overwrites an existing backup.
- **Backup banner also shows on a brand-new browser** (`web.10`).
- **Welcome modal and broadcasts translate everywhere** (`web.11`) — fallback translation chain outside Chromium.
- **Mobile table geometry synced with upstream 2.1.8** (`web.12`) — port of `414a89c3` + `06db9866`.
- **Puck/bet placement parity with QML 2.1.8** (`web.13`).
- **Self-box parity pass** (`web.14`) — includes the QML at-turn lift animation.

### Fixed
- **Reactions panel pager (‹ page/3 ›) didn't follow the table style either** (`web.158`) — follow-up to `web.157`, same tablestyle colour variables.
- **Reactions panel title didn't follow the table style's text colour** (`web.157`) — now matches the Log/Odds/Stats window's active-tab label.
- **`#gchat-fab` (floating in-game chat button) reachable via Tab from any screen, including login** (`web.156`) — was invisible below the fold until Tab scrolled it into view; now hidden/unfocusable outside a game.
- **`sw.js` served app code stale-while-revalidate instead of network-first as documented** (`web.155`) — could mix JS from one deploy with CSS from another; now network-first with a cache fallback.
- **Players-online column header misaligned with rows after hiding a column** (`web.154`) — header and rows now build from the same visible-columns list; hidden columns move into a "+" chip.
- **Accessibility button inconsistently placed, missing from the create-table header** (`web.153`).
- **`align:bottom` table themes cropped full-screen instead of centred in portrait** (`web.152`) — follow-up to `web.150` (which only covered landscape).
- **`align:bottom` table themes cropped against the wrong reference box in landscape** (`web.150`) — now sized/cropped against the table zone, matching QML.
- **Accessibility modal stole focus back from a reopened adaptive drawer** (`web.147`).
- **Extra Large mobile-landscape chat/info drawers had sub-44px touch targets** (`web.146`) — redundant floating-placement call removed.
- **Actions column still misaligned with its header chip after `web.141`** (`web.143`).
- **Forum news: a topic already marked read could reappear as unread** (`web.142`) — read state now keyed by topic instead of post id (same defect exists upstream, unfixed there).
- **Hiding a column in the online-players list didn't reclaim any width** (`web.141`).
- **Cold boot could serve stale SW-cached JS/CSS with no update prompt** (`web.121`) — last-seen `/__ver` now persisted, a cold boot checks and reloads once if behind.
- **`/live?embed=1` — table list clipped, no scroll** (`web.115`, reported by Kai) — embed layout reworked so the host sizes the iframe and the list scrolls inside.
- **Hashed device ids were kept forever** (`web.110`) — all-time unique-device sets now pruned along with expired visit buckets.
- **Error report label claimed "no personal data"** (`web.109`) — label now says what's actually sent (user agent + masked IP).
- **Settings sync label claimed "opt-in"** (`web.108`) — corrected; behaviour (on by default for registered logins) unchanged.
- **Table background no longer jumps by a pixel mid-hand** (`web.106`) — rounding on `communityCenterY` no longer causes a 1px jump.
- **Offline training mode failed to start with no network** (`web.103`) — several offline-mode modules were missing from the service-worker precache; now all precached.
- **Localized pages served French and English interface text to crawlers** (`web.102`) — static HTML fallback now in English, and serve-time localization fills every translatable node.
- **`/live` header buttons leaked into the web client** (`web.66`–`web.98`, fixed `web.99`) — appearance/light-dark buttons showed outside live mode; now properly scoped.
- **Admin header on a phone** (`web.98`) — live-stats pill no longer wraps and drags the theme/log-out buttons down with it.
- **`/live` announced itself as a web client** (`web.96`) — reverted to `CLIENT_TYPE_QT_WIDGET` (0x01), matching the tool it replaces.
- **The spectator table still moved when a hand ended** (`web.90`) — action box now a fixed height while spectating.
- **`/live` language buttons never appeared** (`web.88`) — reused the ••• menu's hidden twin ids.
- **The language count was stated as 40 in entries written today** (`web.86`) — corrected to 45 where the changelog describes the client as it is now.
- **The table was re-scaled between hands while spectating** (`web.82`) — action box height now reserved for spectators too.
- **`/live` lobby was narrow and the chat sat over the top** (`web.80`) — two layout bugs (inherited centering, floating-window placement) fixed.
- **`/live` lobby fell apart when the chat failed to dock** (`web.79`) — panel now hidden unless actually docked; layout fails closed.
- **`/live` language buttons looked absent** (`web.79`) — now ship a placeholder globe glyph.
- **`/live` chat strip sat empty** (`web.77`) — a `reparent()` call was undoing the dock; now re-asserted on every repaint.
- **`/live` language buttons were invisible** (`web.77`) — flag SVG had no intrinsic size.
- **`/live` showed no tables and no guest name** (`web.70`) — both modules read the wrong global (`window.S` vs `window.PthState`).
- **`/live` table list stayed empty** (`web.69`) — hooked the wrong `renderGames` reference; now watches `#g-list` via mutation.
- **`/live` lost the leave-lobby button** (`web.69`) — hidden by mistake; restored.
- **An expired inactivity countdown could leave the client hanging** (`web.64`) — a 10s grace timer now force-ends the session if no server close arrives.
- **A server-ended session left the lobby frozen on screen** (`web.62`) — kick/ban/session-timeout now return to the connect screen with a reason modal.
- **Lobby avatars stopped at the initial in the online-players list** (`web.61`) — avatar arrival now also repaints the players panel and game info panel.
- **Web changelog repeated one heading per deployment** (`web.60`) — About window now merges entries by version under the current-series heading.
- **LAN / dedicated mode reached the wrong WebSocket proxy** (`web.45`) — proxy URL now always derives from `window.location.hostname`.
- **WebSocket upgrade refusals are now logged** (`web.44`, proxy-only).
- **Incoming avatar transfers bounded** (`web.35`, upstream `0f700c4`) — announced/actual size checked against the server's own range.
- **PROXY protocol header no longer breaks LAN / dedicated servers** (`web.33`, proxy-only).
- **Hand-history writes survive Android closing IndexedDB** (`web.23`).
- **Error collector filters browser-extension noise** — extension/translator/cross-origin script errors no longer reach the report queue.
- **Non-PokerTH seat packs were stuck on the inset bet display** (`web.22`).
- **Top-centre (and spectator bottom-centre) bet half-clipped in the inset strip** (`web.20`).
- **Turn-highlight scale divided out of geometry measurements** (`web.19`).
- **Table geometry invariant to bet display** (`web.18`).
- **Older LAN / dedicated servers rejected the client with "Version incompatible"** (`web.17`) — client retries announcing `CLIENT_TYPE_QT_WIDGET` on error 1, LAN/dedicated only.
- **Community cards no longer re-flip on every street** (`web.6`).
- **Assistance win% no longer freezes the table** (`web.7`) — computation now yields every ~8ms and uses the faster `phe` evaluator.
- **Active deck preloaded on table entry** (`web.8`).

## 2.1.7-web line (2026)

Opened with `v2.1.7-web.0` (2026-08-13), following the upstream **2.1.7**
release, closed at `web.179`. Per-build detail is on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
highlights below.

### Added
- **Disco table style, Blacklight 4c deck, Disco card back** (`web.171`, upstream `e6b2a67`/`8704f48`) — seventies club table, four-colour gallery deck, mirror-ball back.
- **Community suggest opens to WEC admins on foreign WEC tables** (`web.174`, upstream `576b598`) — table fingerprint recognises WEC; proxy.js changed, restart required.
- **Monthly Cup templates fill in the current tournament title** (`web.173`).
- **Bet display setting — bet inside the player box** (`web.158`, upstream `414a89c`) — `inset` (new desktop default) or `classic` (touch default), stored in `pth_bet_style`.
- **90 emoji reactions across three themed pages** (`web.151`–`web.164`) — grows from 30 to 90, paged picker, 8 new choreographies.
- **"Playing in …" info in the players list** (`web.147`, parity `PlayerListItem`).
- **Every content page written in all 45 languages** (`web.129`–`web.146`) — hand-rankings/how-to-play/glossary join rules/faq.
- **Admin Traffic tiles read at a glance** (`web.126`) — new-devices count, ±10% delta colouring against the previous period.
- **Private messages** (`web.96` onwards, parity `PrivateMessageDialog.qml`) — persistent window, history in IndexedDB, translate support.
- **A player profile window** (`web.102`) — official QML profile fields; session statistics later moved to their own window (`web.112`/`web.114`).
- **Report an inappropriate avatar** (`web.72`) — 🚩 button sending the official `ReportAvatar` request.
- **Community suggest opens to every BBC admin** (`web.120`/`web.121`, upstream `422f5fe4`).
- **Invite friends** (`web.6`–`web.8`) — invitation dialog + landing page.
- **A bet keypad on touch devices** (`web.58`).
- **Custom sounds** (`web.19`) and a music play counter (`web.23`), later shown next to titles (`web.26`) and in the admin panel (`web.70`).
- **PWA integration** (`web.65`/`web.66`) — protocol handler, share target, file handlers, shortcut icons.
- **Five new languages** — Indonesian, Thai, Filipino, Bengali, Swahili — bringing the client to **45 languages** (`web.11`–`web.15`).
- **Three new content pages** — hand-rankings, how-to-play, glossary (`web.82`).
- **BBC Anthem table theme** and matching card back (`web.5`), by BaShFX.
- **Automatic updates** (`web.17`) and a **weekly leaderboard reset** (`web.40`).

### Changed
- **WebSocket heartbeat tolerates one missed pong** (proxy-only) — two consecutive misses required before terminating.
- **Compression cache hardened; service-worker precache throttled** (`web.179` + proxy-side).
- **proxy.js no longer touches the disk on hot static paths** (proxy-only) — 5s TTL stat cache.
- **App code served cache-first by the service worker** (`web.178`) — .js/.mjs/.css move to stale-while-revalidate.
- **Suggest output is one player per line** (`web.175`, upstream `4afc377`).
- **Own client type on the wire** (`web.167`, upstream `c7e2959`) — `Init` buildId carries `CLIENT_TYPE_WEB`.
- **Frozen avatar upload bytes** (`web.166`) — encoded PNG persisted at pick time, no more per-session re-encoding drift.
- **Translation fallback hardening** (`web.163`, upstream `69ec0824`) — gtx → MyMemory → relay chain, throttled failure toast.
- **Per-account private messages** (`web.161`, upstream `9bccf3a`) — history now keyed to the logged-in nickname.
- **Floating bet keypad on desktop** (`web.159`) — compact overlay instead of swapping rows.
- **Long labels wrap instead of truncating** (`web.149`) — About tabs and create-table form labels.
- **PM dialog sends with a paper-plane icon** (`web.148`).
- **Most played tracks is a ranking first** (`web.127`) — top ten as bars, daily chart of the top five.
- **The admin dashboard reorganised** (`web.27`–`web.38`) — tab families, sub-sections, shared settings-row style.
- **The Traffic tab rebuilt** (`web.74`–`web.78`) — hour-of-day awareness, return rates, bot-noise estimate.
- **The SEO panel rebuilt** (`web.81`) — one-click pokerth.net settings fill, single-source hreflang.
- **Session logs** — multi-select, keyboard selection, clipboard copy, readable times (`web.21`/`24`/`35`/`37`).
- **Languages are shown by name** (`web.41`), no longer following the browser locale (`web.42`).
- **Reactions** aligned with the official chat rate limit (`web.71`); avatar import no longer double-encodes (`web.73`).
- **Statistics cards moved onto the generic window model** (`web.104`).

### Fixed
- **Failed static loads are retried in-page** (`web.177`) — cache-busted re-injection before falling back to auto-reload.
- **Deal/action sound calls guarded** (`web.176`) — no longer throw if a module failed to load.
- **Community suggest output was silently dropped** (`web.175`) — local note now posted with `force:true`.
- **Idle filter now counts spectators as at a table** (`web.172`, upstream `26018c9`).
- **Auto-update no longer restarts over reconnect-grace sessions** (`web.170`) — admin gains an Active sessions row.
- **LAN invite links now land on the right server** (`web.169`) — invite target takes priority over saved prefs.
- **Login restored on pokerth.net** (`web.168`) — `USE_CLIENT_TYPE_WEB` reverted until the server shipped 2.1.8.
- **The client no longer defeats the server-side AFK kick** (`web.132`) — a single, rate-limited `ResetTimeoutMessage` sender.
- **Content pages keep the reader's language** (`web.128`) — internal links only append `?lang=` where a translation exists.
- **Reconnect backoff no longer resets on the server Announce** (`web.125`) — a connection must stay open 10s or get an `InitAck` to count as successful.
- **About tabs: the 2-line clamp actually applies, and words hyphenate** (`web.150`).
- **The announced build id fell back to 2.1.6 after the 2.1.7 release** (`web.91`).
- **A dead lobby connection went unnoticed** (`web.57`), **rejoin after a disconnect** was broken (`web.54`), and the **inactivity warning** was not a real dialog (`web.56`).
- **The players list rendered empty** (`web.98`) and its **column header lost its alignment** (`web.94`).
- **The backup restore banner** failed silently, and an autosave could erase the backup meant to protect it (`web.67`).
- **The update banner** was shown for an update already applied; newly imported seat packs stayed invisible until the cache renewed (`web.25`).
- **iOS** — cards ran under the status bar/notch (`web.108`); the home-screen app opened on a white launch screen (`web.4`).
- **Contrast** — the Green Casino All-In button (`web.64`) and the keypad cancel on skinned tables (`web.63`) were unreadable.
- **The proxy hardened against connection floods** (`web.3`).
- **Stale language counts** across help corpora, README and roadmap (`web.16`, `web.20`).

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
