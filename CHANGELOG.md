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

### Fixed

- **Global notice button shown to pokerth.net admins** (`web.306`, narmod) — `_syncGlobalNoticeBtn` (pokerth.js) sits outside the App IIFE but read the bare `S` of it: a ReferenceError on every call, swallowed by msg-lobby when rights arrive, so `#l-gn-btn` (hidden in the markup) never appeared for a rights-3 player; the lobby chat button's `toggleLobbyChat()` threw on the same line. It now reads the `window.PthState` bridge, like `_showBanner` since web.20. A scan of pokerth.js finds no other unbound `S`. Surfaced by test-guide-coverage (« ! S is not defined »); test-globalnotice now runs the function alone, without the App scope (23/23; fails without the fix).

- **Latin-American Spanish: log button tooltip, and es-419 back in step with its rules** (`web.305`, narmod) — the hand-log button tooltip still read « Registro » in es-419 while every other language had moved to « History & Odds »; it now reads « Historial y probabilidades ». Nine other es-419 strings (Events tab, avatar maker) had been reviewed by hand away from `scripts/es-419-rules.mjs`; the rules now carry those wordings (« el sitio », « rostro », « Tomar la foto », « El Nerd »…), so es-419 is exactly derive(es) again. Test: test-es-419-derivation (1970/1970).

- **Admin, Traffic: /live visits and /live sessions side by side** (`web.303`, narmod) — « /live spectator view » counted visits (page loaded) and « Where sessions open » counted /live sessions (connection opened): 21 against 16 read as a contradiction between two cards. The counts were right — same start (2026-09-11), every day visits ≥ sessions, a steady ~17 % gap of pages closed before connecting, refused connections or crawlers rendering the embedded view without a WebSocket — but the page never said they were two events. Each /live row now reads « visits · unique · connected (share) » for the same window, and both descriptions say what they count. Test: test-live-split.

- **Internet mode « Via proxy » held even when the page loads slowly** (`web.302`, narmod) — the admin's Internet transport arrives with `/app-config`; until it did, `_pthNetTransport` was undefined and `_tr !== 'proxy'` read that as direct, so a connect fired before the answer (an invite link auto-connects 350 ms after load, or a quick click on a slow network) went straight to `wss://www.pokerth.net/pthlive` on an instance set to « Via proxy » — seen in Sessions as a « pokerth.net » notice channel. `App.connect()` now waits for `/app-config` to settle (at most 5 s, once per page; training never waits); an unreachable `/app-config` keeps the historical direct route, the only one left when the site serving the proxy is down. Test: test-transport-gate (browser, 10/10; fails 4/10 without the fix).

- **Large / Extra Large: own nickname no longer runs under the stack** (`web.301`, narmod) — at enlarged sizes the own seat lays name and stack on one row, but `.seat-name` kept its QML `max-width` with `overflow: visible` (set for every seat), so any nickname wider than its box was painted under the stack (13 characters were enough). On the own seat only, the name now shrinks and elides (`min-width: 0`, `overflow: hidden`, `text-overflow: ellipsis`) and the stack group no longer shrinks; the box keeps its existing width whatever the nickname length. Opponent seats are unchanged. New browser check in `test-accessibility-browser` (visible text extent, two nickname lengths, Large and Extra Large).

- **Large / Extra Large: blank community cards when the size is changed before the flop** (`web.300`, narmod, [#4](https://github.com/narmod/pokerth-web-client/issues/4)) — on a live switch from Standard, `ui/accessibility.mjs` (`cacheRenderedStandardMetrics`) snapshots the rendered community font from `#g-comm .pk`; pre-flop that is an empty `.comm-slot`, drawn at `font-size: 0`, so `--active-community-font-base` was frozen at `0px` and every card dealt afterwards showed a white face with no rank or suit (the enlarged sizes swap the deck image for glyphs). The pot badge, lifted from the same value, also sat on the flop. Only a dealt face is now sampled; with none on the board the inline value is dropped and the Standard token formula in CSS applies. Pot font is guarded the same way. New browser check in `test-accessibility-browser` (size chosen pre-flop, then flop dealt).

- **Admin, visitor languages: what hides behind "other"** (`web.299`, narmod) — the Accept-Language parsing moves to `server/lang-stats.js` (tested alone, `test-lang-stats`). Fixes: `fr_CA`-style tags and a bare `en;q=0.9` no longer fall into `other`; `und` / `mul` / `zxx` (and `mis`, `qaa`–`qtz`) do, as they name no language; retired codes fold into their successor (`iw`→he, `in`→id, `tl`→fil, `ji`→yi, `mo`→ro, `jw`→jv; `no` stays apart from `nb`). Folding is applied when stored maps are READ (summary, period, daily series, trend), so the stored history is never rewritten and no series breaks. A valid code without a translation keeps its own key (`fur`). The bot-like estimate no longer counts every unusable header as a bot: the new `env.bot` judges the User-Agent alone; the old `env.noise` is kept, frozen, and `summary.env.noiseMeta` says so (`legacy`, `frozen`, `replacedBy: "bot"`, `frozenSince`). Additive diagnostics, running totals in `env.*` and per day in `bucket.ld`, period sums in `envPeriod.*`: `langLocale` (`pt-BR`, `zh-Hant-TW`, `es-419`…), `otherRaw` (`(none)`, `(empty)`, `(malformed)`, `*`, `C`, `und`…) with `otherRawNew` / `otherRawRet` / `otherRawBot` / `otherRawClean`, and `otherCombo` (device + browser of those pings). First tag of a header already received only, capped maps (`(overflow)`), no IP, no raw User-Agent. The Language view shows the regional variants and a "Behind *No usable language header*" table.

- **Login ☰ links menu in front of open windows** (`web.298`, narmod) — on a phone the ranking/forum windows stay in modal mode (z 1200, outside the 300–390 band); `ui/z-order.mjs` already lifted the ⚙ menu and its `.connect-header` stacking context above a visible modal, but the ☰ menu is a `<details id="cl-links-connect">` (open = `[open]` attribute, not `.open`) and was not managed, so it stayed under the ranking. It is now in `SEL`/`MENUS`, `_visible()` treats a closed `<details>` as hidden and the observer also watches `open`. Test: test-z-order (26/26).

- **iOS installed app: the strip at the bottom takes the screen's colour** (`web.297`, narmod) — despite the measured `--app-h` (web.124), iOS 26 can still lay an installed web app out short of the physical bottom, notably after an update reload; even fixed full-screen layers (the boot splash) stop there, and the strip below showed the html background (the light grey of the palette under the flames). Rather than fighting the height again, the canvas now takes the colour of what sits at the bottom of the screen: the inline viewport script samples it (`elementFromPoint` at the bottom centre, first opaque background up the tree, or a `--edge` colour for image backgrounds — the flames' bottom edge `#bf671f` on the login screen and the splash), once a second and on every re-measure, into `--app-edge`, used as the html background under `:root[data-pwa="1"]`. Nothing else changes: body keeps its own background, heights are untouched.

- **Events tab: edited forum posts are read again** (`web.294`, narmod) — the WEC final and Monthly Cup readers (web.292–293) remembered a post by its publication date, so an announcement or a table result corrected by editing the post was never read again. The forum feed entries now carry their edit time (`updated`, from the Atom feed) and a post is read again whenever it is newer than the version already read; a result post corrected to another table moves its result (the relay remembers which table each post told). Edits are seen while the post is still among the forum feed's latest posts. Tests: community-events.

- **Game style cards: long words wrap instead of spilling** (`web.292`, narmod) — with the style grid open by default in LAN and training (web.288), the descriptions « сбалансированный » (ru) and « հավասարակշռված » (hy) went 9 px past their card on a phone; `.cfp-d` / `.cfp-n` of the 3-column grid may now break inside the word. `test-i18n-overflow` back to 5/5.

- **Ace's Help: bubbles under the header and clear of the notch in the installed app** (`web.291`, narmod) — a bubble placed « under the header » looked for `.screen.active .header` only; the create page's bar is `.cp-header`, so there the bubble went over the header, and in the installed app (iPhone PWA) up under the clock. `mascot/guide.mjs` `topEdge()` (the active screen's header bar — `.header`, `.cp-header`… — and never above `safe-area-inset-top`) is now used by every placement and by the form tour; the bottom spot keeps clear of the home indicator (`safe-area-inset-bottom`). Browser test: the tour bubble never goes over the header.

- **Ace's Help: the form tour no longer slides the whole screen** (`web.290`, narmod) — the create-form tour brought each field into view with `scrollIntoView`, which also scrolled the page itself (`html`, overflow hidden): near the bottom of the form the whole screen slid up, the header went away and a black band appeared below, and it stayed so after the tour (seen on iPhone, training mode). `guide/index.mjs` `scrollUnder()` now scrolls only the field's own scrolling list (`.cp-scroll`), within its limits. When the field cannot come under the header (end of the form) the bubble moves to the top, and when the Ace stands on the field (the last buttons) he steps aside and his bubble follows. Browser test: the page itself never scrolls during the tour.

- **Server invitations only at invite-only tables** (`web.283`, narmod, requested by sp0ck) — QML `LobbyHandler::canInviteFromCurrentGame()` offers « Invite » only when the current game is `GAME_TYPE_INVITE_ONLY`; the server relays `InvitePlayerToGame` whatever the type. New `canInviteToGame(type)` / `canInviteFromCurrentGame()` in `modules/net/invite-link.mjs` gate the waiting-room player-list « Invite » column, the ≡ menu entry, `App.openInviteModal` and `App.sendInvite`. The shareable `#join=` link is unchanged.
- **Tab names as in the QML client, 28 languages** (`web.280`, narmod) — `gipTabLog`, `gipTabOdds` and `logTooltip` set to the QML client's own translations (`src/gui/qt6-qml/i18n/pokerth_<lang>.ts`: « Verlauf », « Chancen », « Verlauf & Chancen ») for af bg ca cs da de el es fi fr gd gl hu it ja lt nb nl pl pt-BR pt-PT ru sk sv ta tr vi zh; the texts that name those tabs follow (202 edits: `advShowOdds`, `advLogOpen`, keyboard hints, the help's panel / history / odds sections, Ace's Help `hsGip*`, and the odds-tab sentence of the SEO how-to and hand-rankings pages). Languages without a QML translation keep their labels. Checked on a 320 px phone: no tab overflows.
- **English tab names as in the QML client** (`web.279`, narmod) — the QML client (`GameInfoPanel.qml`, `pokerth_en_US.ts`) names the info panel tabs « History » and « Odds », its toggle « History & Odds ». English only: `gipTabLog` Log → History, `logTooltip` → History & Odds, `advShowOdds` « …in the Odds tab », the English help (`game:panel`, `odds`, assistance), the admin defaults label and the two English SEO sentences that said « Chances tab » (`test-seo-sync` fingerprint refreshed; translations already use their own labels).
- **Korean /rules typo** (`web.278`, narmod) — « 빆 블라인드 » → « 빅 블라인드 » (big blind), twice in `SEO_RULES_I18N.ko.body`.
- **Translated SEO pages synced with the English** (`web.277`, narmod) — the English of `/faq` (`_SEO_FAQ`: 4 answers rewritten, 3 entries added), `/rules` (`seoRulesPage`: heads-up blinds, Check wording, a « Bet » item, minimum raise, showdown order and muck / Show, the tournament paragraph and a Ranking-game paragraph), `/how-to-play` (`_SEO_HOWTO`: all six step texts, the closing paragraph), `/glossary` (`_SEO_GLOSSARY`: Ante, Big blind, Blinds, Bubble, Check, Raise, Sit and go, Small blind) and `/hand-rankings` (closing paragraph) had moved on since the translations were written (web.165): the 82 translated pages still said 13 FAQ answers, « offline practice », the old blinds and showdown wording. All 82 updated (`SEO_FAQ_I18N`, `SEO_RULES_I18N`, `seo-i18n/howto.js`, `glossary.js`, `hands.js`), with the app's own labels for modes, game types and buttons. New `scripts/test-seo-sync.mjs`: same shape as English in every language, plus a fingerprint of the English prose (`seo-i18n/en-sync.json`) so an English edit fails until the translations follow (`--update` to refresh). `test-seo-glossary-i18n` accepts the network name pokerth.net in non-Latin definitions.
- **Ace's Help audit** (`web.276`, narmod) — `guide/index.mjs`: « ? » mode has its own `asking` flag and ends when `showContext` / `note` / `showInstall` replace its bubble (listeners and `body.guide-ask` used to stay); `flash()` only over a tip; `onListTap` ignored in « ? » mode; `askTarget` reads the page's cursor without `guide-ask` (its `cursor:help !important` defeated the hand-cursor fallback of web.272); menu / note / install « Close » and a tap on the Ace go through `endOnDemand()` (tips off: he stayed docked and `_guideBusy` blocked the idle scenes); `evaluate()` keeps his menu with the tips off and drops the first-launch offer off the login / lobby screens (D8); `ensureDock()` returns null when a `leave()` cancelled the dock and every caller stops; « Turn on tips » at the table closes the menu; `sceneReady` false while out. `mascot/guide.mjs`: one-shot animations leave `anims` when finished; a real resize re-docks with the bubble open; bubble candidates off the left / right edge rejected; focus kept in the bubble across re-renders and given back to the Ace on close; Escape on the Ace. `mascot/engine.mjs`: `dismiss()` after `arrive` tears down instead of walking a second Ace home. `hotspots.mjs`: `#cf-preset-perso` and `#cf-prefs-save-btn` before the generic `.cf-preset` / `.btn-cf-reset`. Texts (83 languages): `hsMenu` without the removed Help entry, `aceLabel` « tap for my menu »; orphan keys `hsHelp`, `nothingHere` removed. Browser checks in `scripts/test-guide-dock.mjs` (they fail on web.275).
- **One docked Ace only** (`web.274`, narmod) — `modules/mascot/guide.mjs` `dock()` checked « already docked? » before `await import('./engine.mjs')`, so two calls close together (a screen tip and a Help / « What's this? » tap, on a slow network) both created a `#ace-dock`; the module tracked only the last one and the other stayed on screen. Calls are now chained, an `undock()` during the engine download cancels the pending dock, and any stray `#ace-dock` is removed before appending. `scripts/test-guide-dock.mjs` (Playwright, engine download delayed by 3 s) checks it.
- **Lobby player search: no more autofill, ✕ to clear** (`web.257`, narmod) — `#players-search-in` was a bare text input, so the browser password manager could treat it as a username field and inject a saved login (e.g. `admin`) after a while, silently filtering the players list down to nothing. The input is now `type="search"`, `autocomplete="off"`, with a neutral `name` and the LastPass / 1Password / Bitwarden ignore attributes; `renderPlayersList()` also drops any value still flagged `:autofill` / `:-webkit-autofill`. A ✕ button (`#players-search-clr`, `window.plSearchClear()`) appears inside the field when it holds text; native WebKit cancel button hidden for a consistent look. New key `plSearchClear` in the 83 catalogues.
- **Server time panel in front of the lobby windows** (`web.255`, narmod) — `#lsb-clock-pop` sat in the status bar with `z-index: 30`, below the lobby chat and the floating windows (`z-order.mjs` band 300–390). `modules/ui/lobby-clock.mjs` now moves it under `<body>` when opened, `position: fixed` just above the pill (re-placed on resize and on each tick, closed when the pill leaves the screen), and `#lsb-clock-pop` joins the `z-order.mjs` surfaces, so it comes to front when opened or touched.
- **Header menus in front of windows on phones** (`web.252`, narmod) — below the `_winGate` threshold the nested windows (ranking, forum, options, help…) stay in modal mode with their CSS `z-index: 1200`, outside the 300–390 band of `modules/ui/z-order.mjs`, so the header overflow menus (`#connect-/#l-/#cr-/#g-/#pv-overflow-menu`) opened behind them. A header menu raised while such a modal-mode host is visible now goes one level above it; on the login screen the menu is trapped in `div.header.connect-header` (own stacking context, z 20), so that header is lifted instead and gets its z back when the menu closes. Covered by `scripts/test-z-order.mjs` (24 checks).

### Changed

- **Admin, Traffic: Music and Ace’s Help as sub-tabs of their own; thumbs and trend arrows in the music ranking** (`web.307`, narmod; **restart needed** for the thumbs: `proxy.js`) — the Features sub-tab splits into **Music** and **Ace’s Help** (a section remembered as `features` opens Music; on phones the bar now scrolls the chosen section into view). In *Most played tracks*, each ranked title shows its players’ thumbs (« ▲ up · ▼ down », a dash when nobody voted; running totals since voting started, one vote per device), and every other voted entry — radio stations included, which have no plays — is listed under the ranking. Next to it, an arrow says whether a title’s share of plays moved between the two halves of the selected period (full days only: not today, not the first, partial day of counting), with the languages’ test (`_langTrendStat`: two-proportion z, |z| ≥ 1.96, ten plays at least; under seven full days per half, a dot that says why). `/admin/visits` gains `musicVotes` (totals, never voters), `musicVotesSince` and `musicVoteTitles` (new `musicVoteTitles()`, radios kept); a proxy that predates it simply shows no thumbs column. Tests: test-admin-layout (seven sub-tabs, thumbs, arrows on a 17-day fixture), test-admin-boot, test-music-vote (60/60).

- **Admin, Traffic: one section at a time** (`web.304`, narmod) — the Traffic tab stacked six cards and fifteen sections on one page. It now has its own sub-tabs — **Overview** (window tiles, analytic tiles, Bottom line), **Audience** (daily visits, new devices, coming back), **Activity** (last 48 h, time of day, where sessions open, /live), **Visitors** (what visitors run), **Features** (most played tracks, Ace’s Help) and **Data** (opt-out, MySQL mirror, export, reset) — with one section on screen. The long explanations fold behind an **Explanations** switch in the head card (off by default); the Data section keeps its warnings visible. Section and switch are remembered per browser (`pth_admin_traf_sub`, `pth_admin_traf_xpl`), the bar follows the arrow keys, and every section stays in the DOM so `loadTraffic` and the period selector are unchanged. Tests: test-admin-layout (new sub-tab block replaces the six-card one), test-admin-boot (switching, keys, switch).

- **Events tab: back to the BBC calendar's evenings** (`web.296`, narmod) — the player's-own-days grouping of web.295 is withdrawn at narmod's request: the day headers are again the BBC calendar's evenings in Berlin time (a 01:00 game under the evening before), as on the site where players register. What web.295 added for players outside Berlin stays: each row says the site's day and Berlin time (« On the site: Sat 3 Oct · 19:30 (Berlin) ») and the register button repeats it.

- **Events tab: the player's own days, and what the site shows** (`web.295`, narmod) — the day headers used the BBC calendar's evenings in Berlin time while the times below them are the player's: from Tokyo, the Saturday 19:30 game read 02:30 under « Saturday ». Rows are now grouped by the player's own date (`evPlayerDay`: a game before 06:00 on his clock counts for the evening before), so a header and its times always name the same day; for a player on Berlin time nothing changes (the same evenings as the BBC calendar). The community sites keep showing Berlin time, so for a player elsewhere every row adds what to look for there — « On the site: Sat 3 Oct · 19:30 (Berlin) », the site's evening (the 01:00 game sits under the evening before, as on the BBC calendar) — and the register button repeats it as its tooltip (`evBerlinRef`, 1 UI key in the 83 catalogues). Tests: forum-events, with a Tokyo run in a child process.

- **« More help » laid out like the old help window** (`web.286`, narmod) — `modules/guide/index.mjs`: the panel (`say({ big })`, class `ad-big`: up to 900 × 640 px, flex column) shows the search field, then `.ad-hwrap`: the chapters (`.ad-hcat`, icon + name, selected one in black) in a column on the left and the whole chapter on the right (`.ad-hbody`: chapter title, every section with its uppercase heading, paragraphs, list, keys, notes) — the layout of the help window removed in web.270 (`help/index.mjs` `_renderNav` / `_renderSection`), in the bubble's colours (cream, black, gold). Under 600 px the chapters are a horizontal icon strip above the text. A search lists sections in the right-hand side; a result (or « More about it ») opens its chapter scrolled to the section, highlighted for 1.6 s. Replaces the topics list + chips and the in-panel section of web.284 (`helpArticle()`, `.ad-article` CSS removed). `test-guide-browser`: More help checks rewritten (column / strip, chapter in full, constant size, result scrolled into view).

- **« More help »: a section opens in the panel** (`web.284`, narmod) — `modules/guide/index.mjs`: `openHelpSection()` no longer switches the bubble to `renderHelpPage()` (small bubble, `knowledge.pages()` read with « Next » / « Back »): the wide « More help » panel stays and its list area becomes the section (`helpArticle()`: « ‹ All topics », title, every paragraph, list, keys and note at once, scrollable; kicker `More help · chapter › section`; buttons All topics + Close). Search field and chapter chips stay; typing in the search while a section is shown goes back to the results, a chip goes back to its topics. `renderHelpPage()` removed. CSS `.ad-article`, `.ad-backto`, `.ad-sectitle` in `modules/mascot/guide.mjs`. `test-guide-browser`: the section check now asserts the same panel (search, chips, no « Next », same width).

- **« Ace's Help » is the only help entry** (`web.275`, narmod) — the « Help » entry (`.help-menu-btn`) is removed from the header menus of the login screen, lobby, create page and table, and replaced by « Ace's Help » in the privacy page menu; the *Show the Help entry in menus* option (`adv-helpbtn`, `help_btn`, `body.adv-no-helpbtn`) goes with it. `guideToggle()` now opens the Ace's menu with the tips off too (`menuOff`: More help, « What's this? », Install the app, « Turn on tips » — new keys `menuOff`, `turnOn`); `hsGuide` and the help paragraph `acehelp` b[0] rewritten — 83 languages. `window.toggleHelp` stays for scripts.
- **Help — Ranking games and cups clarified** (`web.256`, narmod) — `modules/help/content/*.mjs` (83 corpora), additive: section `ranked` gains a second paragraph (any player with a pokerth.net account can create a Ranking table, guests can neither join nor create ranked games; 10 players, no password, auto-start when full; the Ranking preset of `pokerth.js` is the “5/5” format — 5 s to act, 5 s between hands, 10,000 chips, SB 50 doubling every 11 hands); in `cups` the last sentence (sign-up on the cup’s site) is replaced by: only the cup admins create the official games, players register on the cup’s site or in its forum thread, the WEC daily game at 22:00 needs none, presets are practice only; `forumcups` gains a sentence on signing up directly on monthlycup.pokerth.net. Other sections untouched (checked per corpus). First step (L0) of “Ace’s Help”. Help-only, no code change.
- **Shared relay cache, fewer upstream requests** (`web.254`, narmod) — new `server/relay-cache.js` (tested by `scripts/test-relay-cache.mjs`, 13 checks) now fronts every community relay of `proxy.js`: rankings, player cards, player seasons, table stats, bot files, forum feed, live figures, community events and BBC registrations. (1) One upstream read per key at a time — simultaneous requests share it. (2) Failures (non-200 or thrown) are remembered 60 s: no retry meanwhile, the last good copy is served, a failure never evicts it. (3) `RANKING_TTL_MS` 60 s → 5 min. (4) Stale-while-revalidate for the forum feed and the live figures (as for events since `web.253`). (5) `RELAY.purge()` every 10 min drops copies older than 6 h and caps the map at 3000 entries (events and forum feed pinned) — searches and ranking pages no longer pile up in memory. Responses keep their status codes; `X-*-Cache` now also reports `stale` / `fail`.
- **Admin — Community events card** (`web.254`, narmod) — `admin.html`, next to *Live server figures*: on/off and refresh interval (60–3600 s, default 300), stored as `communityEvents` in the admin config (export/import included). Off: `/api/events` answers `{ ok:false, error:'disabled' }` without reading anything, BBC registrations are refused, the boot warm-up is skipped; the client sets `body.ev-relay-off`, which hides the Events tab (and the Champions of the Day) like the community-content option.
- **Events tab loads at once** (`web.253`, narmod) — the tab waited for `/api/events`, fetched only on open, while the Posts were already in page cache. Client: `evPrefetch()` (`modules/ui/forum-events.mjs`) runs with the Posts badge refresh (page load, lobby shown, 15 min). Relay (`proxy.js`): stale-while-revalidate — a cached answer is always sent at once and an expired one is refreshed behind it (`_eventsRefresh`, one round at a time, a failed round never evicts a good one), plus a warm-up 3 s after boot. `server/community-events.js`: the BBC / WEC ranking pages are no longer read (nothing shows `leaders` since `web.242`), so a round reads five pages instead of seven; `leaders` stays in the payload, empty.
- **Reports reserved for registered players** (`web.251`, narmod) — parity with upstream `04f5839` (sp0ck): guests can no longer report an avatar or a game name, because the server stored those reports without a reporter and now rejects them. New `window._amMyPlayerGuest()` (server rights 1, or guest login mode — QML `Lobby.isMyPlayerGuest`) hides the 🚩 in the lobby game info (`modules/ui/lobby.mjs`), the player popup (`modules/ui/player-popup.mjs`) and the seat menu (`modules/ui/seat-menu.mjs`), and guards `App.reportGameName` / `App.reportAvatar` / `App.doReport`.
- **Help — Events tab paragraphs brought up to date** (`web.250`, narmod) — `modules/help/content/*.mjs` (83 corpora), section `forumnews`: the Events paragraph no longer says a tap opens the community site (only ↗ does since `web.247`) and now lists the WEC daily game; its last sentence (the “Show community content (BBC / WEC)” option, localised label) is kept verbatim. The `web.241` paragraph is rewritten for the selection and the footer button that follows it (`web.247`). Help-only, no code change.
- **Events tab — BBC sign-ups in full words** (`web.249`, narmod) — parity with QML `BbcGameDates.playersText` (singular only for 1): `evPlayersText` + keys `evPlayers1` / `evPlayersN` in 83 catalogues — the 29 languages of upstream `src/gui/qt6-qml/i18n/*.ts` (`f0ea7de`) copied verbatim, the others translated with plural-neutral forms (“Registered players: {n}”) where 2/5-type plurals differ. Replaces the `n/10` of `web.237`; the full-table green stays.
- **Ranking tables — waiting hint fixed** (`web.248`, narmod) — `modules/ui/lobby.mjs` `_renderLobbyWaitActions`: on a type-4 table a seated player saw `waitingHintGuest` (« The admin will start the game… »), wrong since ranking games have no admin start. New key `waitingHintRanked` « The game will start automatically as soon as the table is full » (83 catalogues); spectators keep `waitingHintSpectator`.
- **Events tab — only ↗ opens a site; footer button follows the selected event** (`web.247`, narmod) — `modules/ui/forum-events.mjs`: result rows (`_row`) and upcoming rows (`_gameRow`) are no longer `<a>` elements; the ↗ icon is the only link (`_goLink`, safe URLs only). Upcoming rows are `role="button"` and selectable (`ev-sel`, `aria-pressed`, key `evSelKey`: BBC id or source + time); a BBC row with sign-ups still unfolds on the same click. The footer button `#fn-bbcreg` follows the selection (`evRegisterAction`): BBC → `evBbcRegister`, Monthly Cup → new key `evMcRegister` (83 catalogues) and its registration page, WEC daily game → disabled, labelled `evWecDaily`; nothing selected (or the selected event has started) → BBC as before. Tested in `scripts/test-forum-events.mjs` and in the real window.
- **Forum news — translate button yellow when active** (`web.245`, narmod) — `.fnp-globe.tr-active { color: var(--gold) }` lost to the `.btn-sm.btn-icon` colours, so the globe looked the same on and off. `pokerth.css`: `#fnp-translate.fnp-globe.tr-active` takes the `.rk-tab.active` look (18 % selection-colour fill, selection border, `--sel-hi` icon).
- **Forum news — in-place post translation; one BBC game unfolded at a time** (`web.244`, narmod) — `modules/ui/forumnews.mjs`: the globe used to send `fnBlockText` (plain text) and replace the body with it, so images and formatting vanished (QML parity). It now re-renders the post, collects its text nodes (with a letter, outside `code`/`pre`, whitespace flattened, edge spaces kept), sends them in ONE request, one per line, and writes each line back into its node (`fnSplitTranslated`, tested); the body keeps `fnp-translated` (italic) plus `fnp-tr-html` (`white-space: normal`). If the line count comes back different, or the texts exceed `TRANSLATE_MAX`, the previous plain-text translation is used. Deliberate web deviation from QML (plain text). `modules/ui/forum-events.mjs` `_toggle`: opening a game folds the others (narmod's request; QML allows several).
- **Forum news — post view inside the Posts card, tabs kept** (`web.243`, narmod) — `modules/ui/forumnews.mjs` `_openPostView` no longer hides `#fn-tabs` (a tab click already returns to the list through `forumSelectTab`); `pokerth-client.html`: `#fn-post` is an `.ev-card` whose `.ev-ch` header holds the back button, the posts icon and `forumTabPosts`; `pokerth.css` pads the head/body and gives post lists `padding-inline-start: 1.8em` (the card clips overflow, the global reset had left the markers outside).
- **Forum news window — one card look for both tabs, no leaders card** (`web.242`, narmod) — `modules/ui/forum-events.mjs`: the server clock is now a header-only `.ev-card` (`#ev-clock`, same frame as « Upcoming »), and the Ranking card (`data.leaders`) is no longer rendered — removal asked by narmod; `evLeaderMeta` and its tests removed. The relay still returns `leaders` (unused by the client). `modules/ui/forumnews.mjs` + `pokerth-client.html`: `#fn-list` is an `.ev-card` with an `.ev-ch` header (posts icon, `forumTabPosts`, count), rows unchanged.

### Added

- **Help: a section on the We Cup (WeC), opened from the WeC elements by Ace’s Help** (`web.308`, narmod) — new section `pthnet:wec` « The We Cup (WeC) » after `bbc` in the 83 corpora (es-419 derived), from the WeC forum thread: entry requirements (300 ranking games, 60 % of 1st–4th places All-Time, two finished seasons), the veterans rule (over 500 games and four past seasons: an average of 5.75 over the last 300 games, weighted by season), one account only, conduct, the Monthly Finals (top 10 + three replacements, 22:00 / 22:05, 15 s, ×2 every 25 hands) and the Grand Final (monthly winners + top 10 of the year, semi-finals on two tables, 25 s, ×2 every 35 hands). Only the admins create the games. *More about it* opens it from the WEC ranking tab, the We Cup preset and the WeC rows of the Events tab (rows now carry `data-src`). The name WeCup becomes « We Cup » / « WeC » in the help, Ace’s Help texts and UI labels of every language (keys unchanged).

- **Monthly Cup night in the Events tab** (`web.293`, narmod) — the cup site gives the date, the sign-ups and the last podium; the cup's forum topic (« September Cup 2026 », forum Monthly Cup) tells the rest, post by post. The events relay now reads those posts from the forum feed (`server/community-events.js` `parseMcPost` / `monthlyCups` / `mergeMonthlyCups`): the cup time, when registration closes, the table admins, the 1st-round seeding (one block per table, substitutes), each table's top 3 as the admins post it (« 1 Name », « 1. Name » or « 1st - A, 2nd - B, and 3d - C »), the gold / silver / bronze final tables, the champion and the podium. What was read is kept on disk through the night (`monthly-cups.json`, `MC_CUPS_FILE`), since the topic's first posts leave the feed. The cup row stays in « Upcoming » during its night (`until`), reads « in progress » then « 🏆 champion », and unfolds to the final tables then the 1st-round tables, each with its medals once known (the gold table falls back on the cup podium); after the close the footer button reads « Registration closed ». 10 UI keys in the 83 catalogues. Tests: community-events (the September 2026 topic as fixture), forum-events.

- **WEC finals in the Events tab** (`web.292`, narmod) — WEC publishes no schedule, but its monthly and yearly finals are announced on the pokerth.net forum in a fixed shape. The events relay now reads them from the forum feed (`server/community-events.js` `parseWecFinalPost` / `wecFinals`: the date with its UTC time, the table set-up, the qualified players with their month, the replacements; quoted older announcements ignored) and keeps them on disk until they are played (`wec-finals.json`, `WEC_FINALS_FILE`; the feed only holds the latest posts). The Events tab shows the final on its evening — « Monthly final · September 2026 · 10 qualified » (or « Grand final 2026 ») — and the row unfolds to the set-up (starting stack, first small blind, time per action, pause, blinds doubling every N hands) and the players as chips (place · nick, games won in the month as a tooltip; replacements dashed). The WEC daily game of the same time gives way to it, and the footer button reads « Qualified through the monthly WEC ranking » (disabled). 8 UI keys in the 83 catalogues. Tests: community-events (60, with the September 2026 announcement as fixture), forum-events.

- **Ace's Help: the bot levels explained** (`web.291`, narmod) — the tour's bot step now says what each level does — **Easy** misjudges its hands and rarely bluffs, **Normal** reads well and plays short stacks all-in or fold, **Hard** makes no reading mistakes and bluffs more — and that **Mixed** draws each bot's level at random (about 30 % easy, 50 % normal, 20 % hard, as `offline/server.mjs` `_pickBot` does) for a varied table, each bot keeping its own style whatever its level. « What's this? » explains each level pill (`hsBotEasy`, `hsBotMixed`, `hsBotNormal`, `hsBotHard`). 5 keys (1 rewritten) in the 83 guide catalogues.

- **Ace's Help: forum posts explained, each ranking explained, a highlight that stays on its target** (`web.289`, narmod) — the first opening of the forum's **Posts** tab gets its own tip (`w-posts`, window key `posts`: one line per topic, the coloured forum tag, read here or ↗ on the forum, filled dot = unread, the badge, Mark all as read), and « What's this? » explains a post row, its tag, ↗ and the read mark (`hsFnRow`, `hsFnTag`, `hsFnGo`, `hsFnDot`). In the ranking window « What's this? » now explains each tab on its own — PokerTH (Ranking games only, 15-9-6-4-3-2-1 points, Score = average weighted by games played, three-month seasons, All-Time), BBC (four steps with tickets, points ×1 to ×4, bonus for games played), WEC (daily 22:00 game without registration, 75-45-30-20… scale), LAN (this private server's leaderboard) and Trophies (training progression) — with « More about it » on the matching help section (`hsRkPth`, `hsRkBbc`, `hsRkWec`, `hsRkLan`, `hsRkAch`). Fixed: the gold frame of the forum events tip stayed where the window was before its events arrived (the window re-centres when it grows) and outlined the whole list past the window's edge — `highlight.mjs` now re-reads its target 4 times a second and cuts the frame to what scrolling ancestors and the screen show; the tip outlines the **Events** tab instead of the list, and the bubble is placed again when its target moves, with a new spot at the bottom of the screen when the target is near the top. 10 keys in the 83 guide catalogues; `w-posts` in the statistics and admin.

- **Game style: open in training and LAN, folded on pokerth.net; the Ace explains quick settings and My prefs** (`web.288`, narmod) — the « Game style » block of the create page now opens by default in training and LAN mode and stays folded on pokerth.net (Internet, account or guest); the player's Expand / Collapse is remembered per mode (`pth_create_style_open_local|lan|net`, `App._styleGridMode()` / `_styleGridKey()`; the old single `pth_create_style_open` is no longer read). Ace's Help tour: the style step presents the styles as quick settings, with an open and a folded text (`cfStyle`, `cfStyleClosed`) that switches when the player taps Expand / Collapse (`window._guideRefresh`); a new step explains **My prefs** — per mode, 💾 saves the whole form, the pill loads it back, they fill the form until a game is created in that mode, editable in Advanced options → Table preferences (`cfPrefs`, or `cfPrefsNone` before any are saved). `where()` gains `styleOpen` and `prefs`. 4 keys (1 rewritten, 3 new) in the 83 guide catalogues.

- **Ace's Help — a guided tour of the game creation form** (`web.287`, narmod) — on the « Create a table » page the Ace no longer gives one bubble about the game types: he walks through the form one field per step, in the order of the page — game style, name, type, password, spectators, max players, starting stack, first small blind, blind interval and raise order, time per action, pause between hands, (training) bot difficulty, and the buttons. Each field is scrolled to the top of the screen and outlined, the bubble sits next to the Ace with a « 3/14 » counter, **Back** / **Next**, and **Later** resumes at the same step. Fields not on the page are left out (training: no name, type, password, spectators; guests get their own lines), and a field greyed out by a Ranking game or a community template says so. Engine: context options `tour`, `row`, `locked`, step `when` / `optional` (`core.mjs`: `createRun(ctx, where, keep)`, `prev()`, `go()`); `mascot/guide.mjs`: `say({ count, pos })`, `setPos()`, buttons kept visible when a bubble scrolls. 17 new keys (`prev`, `cfIntro`…`cfLocked`) in the 83 guide catalogues, UI labels quoted exactly. Tests: core (166), contexts (201), browser (each field in view, outlined, not under the bubble; Back).

- **Option « The Ace’s antics »** (`web.285`, narmod) — new switch `ace_scenes` in Advanced options → Assistance (`#adv-acescenes`, on by default, synced with the account in `_CFG_WEB_SYNC_KEYS`, admin kill switch `featureOff.ace_scenes`, `advAceScenes` in the 83 catalogues). Off: `modules/mascot/index.mjs` `allowed()` is false (no idle scene, no dance — the ear stops with it), `mascotReact()` and the pending « Well done! » (`tryCheer()`) are dropped; Ace's Help (the docked Ace, tips, « ? », More help) is unaffected. The help note of `start:acehelp` ends with where to switch it off (⚙ Advanced options → section → label, in each language's own words) in the 83 corpora. `test-mascot`: the old « Animated mascot » ids stay absent, the new switch is present and synced.

- **More dances for the Ace, a new one every bar** (`web.282`, narmod) — `modules/mascot/groove.mjs`: `rangeFor()` (slow < 90, mid 90–114 and the generic groove, fast 115–135, rush > 135), `POOLS` and `pickDance()` (a dance of the range, never the previous one when there is a choice); `danceFor()` kept as the range's lead dance. `modules/mascot/acts-dance.mjs`: seven new dances — slow: `slowdance` (arms hugging the air, a heart rising every two beats, removed when it fades), `reggae` (accent on the off-beat), `waltz` (a turn every three beats, a bow on the leftover beats); mid: `robot` (`steps(1)` poses, one per beat), `moon` (moonwalk out and back on the beat, using the engine's `mwFrames` / `mwFramesB` now in `H`), `floss`, `charleston`. The spin now marks a change of tempo range only; a bar whose next beat has just gone by starts at once (no one-beat freeze between bars). Console: `window._mascotForceDance = '<name>'` then `mascotDemo('groove')`. `test-mascot-groove`: 60 checks (ranges, pools, no repeat, every dance reachable and implemented); each new dance checked in Chromium (poses sampled over a bar).
- **The Ace dances to the music player** (`web.281`, narmod) — while `Music.isPlaying()` on the home screen or in the lobby, `modules/mascot/index.mjs` brings the Ace after `DANCE_IDLE` (10 s, no cooldown) with the new action `groove` (`modules/mascot/acts-dance.mjs`), instead of an idle scene after 30 s; he dances until the next input (usual dismissal), waits tapping his foot while the music is paused (leaves after 20 s). Tempo: a second, unsmoothed `AnalyserNode` (`fftSize` 1024) in series in the player graph, read by the new `Music.beatLevel()` (rise of the log energy of the < 180 Hz band ×0.7 and of 180 Hz–2.6 kHz ×0.3), sampled at 50 Hz by `modules/mascot/groove.mjs` while the music plays (started by the loader, so the tempo is known when he walks in); `estimateBpm()` = autocorrelation 60–190 BPM with a log-normal prior at 120, comb checks for half / double / 3:2 slips, tempo fine-tuning, beat phase, gap-tolerant (NaN where ticks were skipped), confidence from the comb's contrast. Every bar (8 beats; 4 while no tempo) he starts on the next beat and picks `sway` (< 90), `hiphop` (90–114), `disco` (115–135) or `techno` (> 135), with a spin when the style changes; a new track resets the ear. No ear (iOS default bare `<audio>`, radio outside the graph, silent analyser): `hiphop` at 105 BPM, not synced. New option `ace_dance` (Advanced options → Assistance, on by default, synced with the account, `advAceDance` in the 83 catalogues). `scripts/test-mascot-groove.mjs` (`test:mascot-groove`, 53 checks: tempo across the four ranges, off-beat hats, noise, jitter, missing ticks, phase, confidence, end to end on synthesised audio through an analyser emulation, wiring); checked in Chromium on the four styles. Test panel / `?mascot=groove`: « Dance to the music (player) ».
- **Help — BBC section** (`web.273`, narmod) — new section `pthnet:bbc` « The BBC (Best Brainies Cup) » after `cups` in the 83 help corpora (es-419 derived), from the BBC players manual (v3.1, rev. 9/12/26) and the site's About page, player essentials only: four steps and tickets (1st–2nd move up; 3rd keeps the ticket in Steps 2–3; reset at each new season), daily games 19:30 / 21:30 / 23:15 / 01:00 Berlin time, admins only open games, 10 players (Step 4 valid with 9 of 10 registered), Step 4 scheduling (first Friday 19:30 ≥ 10 days after 10 tickets, else +8 days on the next slot), registration / cancellation 20 min before (ticket lost otherwise), requirements (one account, ≥ 10 ranking games, decent record), season points (10…1 × step) and score (points per game × (1 + log₂ games), in words), restarts, result reporting with the log analysis link, conduct (note). Read by « More help »; `hotspots.mjs` `more` may be a function of the element: « Register for the BBC », the BBC preset and the BBC ranking tab open it. Tests: `test-guide-help` (sections identical in 83 languages), `test-guide-ask` (759).
- **Ace's Help — « ? » answers everywhere** (`web.272`, narmod; user report: too many places without an answer) — new `scripts/test-guide-coverage.mjs` (`test:guide-coverage`): Playwright, desktop + phone, ~60 screens / states (login 3 modes, menus, language menu, accessibility, About, privacy, lobby row / chat / players, every Advanced options category with sections open, theme, music, ranking tabs, forum, avatar studio tabs, PMs, logs, player card, creation with styles, waiting room, table: others' / my turn, header menu, game details, sound, table ranking, chat, reactions, hands, info tabs, seat menu, end of game); lists every visible, tappable, top-most element (script-drawn ones with a hand cursor included) « ? » cannot explain; fails if one has no answer (first run: 42 kinds with none, now 0). `hotspots.mjs`: 140 → 189 entries, 16 → 20 windows (overflow items by `onclick`, language menu, About tabs, privacy back, password, forgot password, connection options, report table name, table players, invite, list, sound popover mute / volumes, copy invite link, end of game, stats export / range / scope, logs divider, adv search / reset / theme presets / links / custom sound play, avatar creator, accessibility, theme panel tabs / rows / import / delete / close, seat menu, login chip; windows: accessibility, About, privacy, game details, end of game); a label without `for` is explained as its row's control; `tappableFor` also takes hand-cursor elements; `windowFor` marks `win`. `index.mjs` fallback: no entry → the element's own name (`hsLabelled`, its tooltip / label / text) + « More about it » on the help section the search finds for it; a window's unlisted control → its name + the window's text; `askUnknown` only when nothing has a name. `theme.mjs` (classes `tp-row`, `tp-tab`, `tp-import`, `tp-del`, `tp-close`) and `seat-menu.mjs` (`data-ctx-k`) additive. Texts: 55 keys in 83 languages. Tests: coverage (0 without answer), `test-guide-ask` (756), browser.
- **Ace's Help — a tap on the Ace opens his menu** (`web.271`, narmod; user report) — `guide/index.mjs` `onTap`: with no bubble open, a tip put off with « Later » that still applies here is shown (badge), otherwise his menu (it used to `replayContext` the screen's tip on every tap, so the same tip came back again and again); `showMenu` adds « This screen’s tip » (`replayTip`, only when `replayContext` finds one) after « What’s this? ». Texts: `welcome` (the tap opens the menu; the yellow « ? » of the bubbles = « What’s this? ») and `menuOn` (what « What’s this? » does) rewritten, `replayTip` new — 83 languages (es-419 derived); help corpus `acehelp` paragraph 2 (83 languages): his menu listed, « never speaks during a hand by himself — you can still ask him at the table ». `knowledge.mjs::splitText` also cuts at the Urdu ۔ and Arabic ؟. Tests: core (label), browser (171: the tap opens the menu, « This screen’s tip » replays, no tip back by itself after « Got it »).
- **Help window removed — the Ace is the only help (H4)** (`web.270`, narmod; maintainer's explicit agreement) — removed `modules/help/index.mjs` (file deleted), `#help-modal` and its script / preload in `pokerth-client.html`, its `#help-modal` CSS and the window-only `.help-*` rules (`.help-search`, `.help-body`, `.help-p`, `.help-wip`, `.help-result*` kept for the Advanced options search), its precache entry (`sw.js`), its Escape surface (`keynav.mjs`) and z-order host (`z-order.mjs`). The texts `modules/help/content/<lang>.mjs` stay (read by `guide/knowledge.mjs`). `guide/index.mjs`: `window.toggleHelp` → `toggleHelpEntry` (opens / closes « More help »); `helpEntry` no longer falls back to a window (no automation exception); `canComeHere` accepts the live spectator embed (on demand only — tips stay off there, `evaluate` keeps on-demand kinds when `!available()`); « Help window » button gone. Removed the `w-help` window tip, the `#help-modal` « ? » window entry and the keys `c5Help`, `hsHelpWin`, `helpWindow` (83 catalogues). Admin: `w-help` row and the « help window » column of « More help » dropped (server unchanged — no restart). The 5 Help entries and the *Help button* option (`pth_help_btn`) are kept. Tests: `test-guide-help` (23: module gone, texts kept, no window in the page, 5 entries, no leftover in Escape / z-order / precache), contexts, browser (168: C5 now on Advanced options; no help window, the Help entry toggles « More help »).
- **Ace's Help — at the table, on demand (H3)** (`web.269`, narmod) — `guide/index.mjs`: `canComeHere()` (talk screens + `game`, not the live embed) replaces `canSpeakHere()` for everything the player asks for (`openMoreHelp`, `_guideMoreHelp`, `toggle` → menu, `guideAsk`); `evaluate()` keeps `help` / `ask` / `menu` / `note` at the table where `canSpeak` (D8) would send him away; closing there sends him away. `myTurn()` (turnPid = myId, action buttons shown and enabled): at the start of the player's turn `tick()` folds the on-demand bubble and ends « ? » mode (`endOnDemand`); in « ? » mode a tap on `ACTION_ZONE` (action row / buttons, bet field, slider, quick amounts, auto mode) acts and ends the mode. The Help entries now bring the Ace at the table too (the window fallback is left for the live embed and automation). `hotspots.mjs`: 30 table entries (Fold, Check / Call, Raise, All-In, bet field / slider / quick amounts, auto modes, seats — mine / others —, board, pot, next blinds, quit, game details, sound, table ranking, felt buttons, table chat, reactions, info panel tabs / export / assistance) + 5 windows (info panel, table chat, reactions, hand rankings, table ranking); game-header forum / ranking / menu and table-chat mute / emoji / close join the existing entries. `mascot/guide.mjs` `placeBubble`: candidates under the header right / left / middle (least hidden), and a bubble under the header never goes down over the Ace (capped, scrolls). Texts: 34 keys in 83 languages. Tests: `test-guide-ask` (589), browser (168: at the table silent by himself, Help entry → « The game screen », « ? » explains the info panel button without opening it, the turn comes → mode ends and he leaves, a tap on Fold at the turn acts).
- **Ace's Help — « ? » everywhere, « More about it » (H2)** (`web.268`, narmod; **restart needed**: `server/guide-stats.js`) — `modules/guide/hotspots.mjs`: entries become `[selector, key, dynamic?, more?, vars?]` (47 → 110 entries, plus 11 windows; 90 entries link to a help section); `more` = `chapter:section`, `vars(el)` → `{label}` (an Advanced option's own name, `rowLabel`); a `label` is explained as its control (`label[for]` or the control inside: radio texts, switch tracks) and highlighted; `WINDOWS` + `windowFor()` — an unlisted control inside a known window gets that window's text (plain text still never stopped). New: login leftovers (About, Privacy, community links), players list actions (columns, ignore, stats, message, name), send, my card, every creation field (stack, blind, raise every / mode, time to act, delay, steppers, switches incl. spectators, reset, back), every close button, Advanced options (categories / sub-tabs, sections, select / checkbox / field by name, key bindings, reset keys, language), ranking (tabs, season, all-time, search, sort, back), forum (tabs, BBC registration, mark read, open, translate, open post), avatar studio (tabs, categories, PokerTH avatar, none, pick), private messages, logs (game, search, export, import, select, delete, analyse, upload, keep), player card, music. `index.mjs`: `askSay(key, extra, more, vars)` adds *More about it* → leaves « ? » mode and `openMoreHelp({ ch, sec })`. Statistics `ask.more`; admin row. Texts: 75 keys (`moreAbout`, 63 `hs…`, 11 `hs…Win`) in 83 languages (es-419 derived). Dock: help pages in regular weight. Tests: `test-guide-ask` (471: every link opens an existing section, options by name, labels → controls, windows), browser (159: an option says its name, first tap does not toggle it, *More about it* opens « Options & shortcuts »).
- **Ace's Help — « More help » (H1)** (`web.267`, narmod; **restart needed**: `server/guide-stats.js`) — first step of merging the help window into Ace's Help. New `modules/guide/knowledge.mjs` (no DOM): `loadHelp(lang)` (the help corpora `help/content/<lang>.mjs`, base-language then English fallback), `chapterFor(screen)`, `search` (case/accent-insensitive, ≥ 2 characters, 40 hits), `splitText` (sentence ends incl. CJK 。！？, Indic । ॥, Burmese ။; never inside « pokerth.net » / « 2.5 »), `pages(sec)` (paragraphs, list by 5, keys by 6, notes). `guide/index.mjs`: `openMoreHelp` — chapter of the screen, section list, chapter chips, search field, *Help window* / *Close*; section pages with *Back* / *Next* / *All topics*; « ? » chip kept; first entry of the Ace's menu; works with the tips off (on-demand visit: `evaluate` keeps `help` / `ask`, `closeMoreHelp` / `exitAsk` send him away); `window._guideMoreHelp` (not under automation, only where he can speak). `help/index.mjs` `toggleHelp`: the Ace first, the window as fallback (at a table, for now). `mascot/guide.mjs`: `say({ html, wide })`, `bubbleEl`, `replace`, list / chips / search / page / keys / note styles, RTL. Statistics `more-help` (shown / section / search / window); `summary().contexts` now carry each context's own events and the admin rows show them (the « ? » row showed dismissed instead of explained). Texts `moreHelp`, `allTopics`, `helpWindow`, `back` in 83 languages (es-419 derived). Tests: `test:guide-help` (20: every section of the 83 corpora reachable, no word lost, page length), admin (49), browser (156: Help entry → the Ace with the tips off, pages, search, chapters, the window from the bubble, the menu entry, the table fallback).
- **« Well done! » re-targeted (M2)** (`web.266`, narmod) — `modules/mascot/index.mjs`: `window.mascotCheer('win' | 'ranked' | 'trophy')` keeps one pending cheer (10 min at most) and plays `r-bravo` from the Ace's spot once he is back on `#s-connect` / `#s-lobby` for 1.5 s, Ace's Help on and `ready()` (no bubble / badge / « ? » mode), polled every second while pending; triggers: `game/showdown.mjs` `showEndGameOverlay` (my win, once per game, every mode), `guide/index.mjs` `showContext('ranked-result')` when `pointsFor(place) > 0` (the cheer follows the bubble), the `pth-achievement` event of the offline engine (training trophies). The LAN-rank trigger of `game/stats.mjs` (`pth_mascot_rank_*`) is removed; `mascotReact` keeps `table` / `mail`. Event-driven reactions no longer follow the automation opt-out of idle scenes (they need Ace's Help, which automated browsers are never offered). Engine: a reaction's `home` entry takes a couple of steps (1.4 × his width) instead of crossing the screen. Tests: `test-mascot` (86), browser (138: win, waits for the bubble, nothing with the help off).
- **Idle scenes folded into Ace's Help (M1)** (`web.265`, narmod) — the « Animated mascot » option is removed (row `#adv-mascot`, `sync('adv-mascot')`, key `advMascot` in the 83 catalogues; `pth_mascot` is no longer read). `modules/mascot/index.mjs`: always on except under automation (`navigator.webdriver`, opt-in `pth_mascot_webdriver`), first scene after 30 s idle (was 45 s), then at most every 2 min (was 3). With Ace's Help on (`window._guideScene` from `guide/index.mjs`: `on / ready / home / away / back`): only when the Ace is docked with no bubble, badge or « ? » mode; the scene starts from his spot (engine `appear({ home, arrive })`, entry `home`, no greeting, hop down from a lifted spot) and ends with `home` (walk back, hop up) / `homeDoor` (door grown under his spot) / `homePoof` (`plan.mjs::HOME_EXITS`, `pickHomeExit` 50/25/25); a tap while out → `recallHome` (walks back ~1 s instead of the puff); a tip that comes up meanwhile calls him back (`window._mascotRecall`, `ensureDock` waits for him). Lobby reactions (new table, private message, better LAN rank) now only with the help on, from his spot. One size: `plan.mjs::mascotScale` 80–110 px (was 70–140) is also the docked Ace's (`mascot/guide.mjs`, was a fixed 42 %), re-sized on resize; `homeBox`, `away`, `hasBadge`, `isPlain`. Help: the `acehelp` note rewritten in 83 corpora (es-419 derived). Tests: `test-mascot` (81), browser (129: one size, ready rules, out and back, tapped, called back by a tip).
- **Ace's Help — L6: « ? » mode (C6)** (`web.264`, narmod) — new `modules/guide/hotspots.mjs`: `HOTSPOTS` (≈ 47 `[selector, key, dynamic?]` entries — headers, login screen, lobby, waiting room, creation page; the first entry whose selector matches the tapped element or an ancestor wins, specific before generic), `hotspotFor()`, `tappableFor()` (generic line for a control without an entry). `index.mjs`: « ? » button in every context bubble and « What's this? » in the Ace's menu → `enterAsk()`; capture-phase `click` / `pointerdown` / `keydown`: the first tap on an element is stopped, highlighted and explained, a second tap on the same element goes through (it stays armed, so a label's synthetic click passes too); a `<select>` is kept closed until explained; the dock itself is never intercepted; leaves with « Done », Escape, a tap on the Ace, the help switched off or a hand starting (D8). Screen tips wait while the mode is on. `mascot/guide.mjs`: `say({ ask })` renders the « ? » chip, `body.guide-ask` help cursor. Statistics: `ask` shown / explained / done (`server/guide-stats.js`, admin row; restart needed for the new pair). Texts `ask…` (6) + `hs…` (47) in 83 languages (es-419 derived). Tests: `test:guide-ask` (204: every static selector exists in the page, every key in every language, resolution order in jsdom), browser (114: explain then act, select, Escape, Done).
- **Ace's Help — L5: game creation page and windows (C5)** (`web.263`, narmod) — `contexts/create.mjs` (`create-game`: four types, Ranking for account holders — D16 —, presets practice only; guest / training lines) and `contexts/windows.mjs` (10 window contexts, priority 50: ranking, forum events, help, advanced options, theme, music, avatar, players drawer, player card, logs). `index.mjs`: `WINDOWS` detection (visible and on screen; the players list only as a drawer — a lobby column on wide screens), polled every second; a window tip may speak over a modal and takes over a screen tip. Dock / highlight z-index raised above the windows (10020 / 10019; theme panel is 9999). Statistics pairs + admin rows. Texts `c5…` (13) in 83 languages, UI labels quoted exactly (es-419 derived). Tests: contexts (197), browser (102: Help explained over the window, not twice, creation page).

- **Ace's Help — L4: login screen (C3) and Normal / training waiting room (C4)** (`web.262`, narmod) — contexts `login` (loginStep 1: the three modes, then account vs guest with [Create an account]), `login-profile` (loginStep 2: nickname + avatar, highlight `#av-trigger`), `wait-normal` (by role: host → Start / fill up with bots / invite, others → the host starts / invite, training → Start, bots fill the seats; not for spectators or Ranking tables). `where()` gains `loginStep`, `host`, `offline`; the login steps are observed; `blocked()` ignores surfaces that belong to the current screen (the login form was registered with keynav). Docked bubble: placed at the top right under the header when that hides less than next to the Ace (weighted controls, the highlighted element ×100; no tail there). Statistics: `login` (+ `signup`), `login-profile`, `wait-normal` counted; admin card rows. Texts `c3Modes` `c3Account` `c3Profile` `c4Host` `c4Guest` `c4Offline` in 83 languages (UI labels quoted exactly, es-419 derived). Tests: contexts (171), browser (93: C3 steps + Later/badge/replay + profile, C4 with nothing tappable hidden).

- **Ace's Help — L3: anonymous statistics and the admin funnel card** (`web.261`, narmod; **restart needed**: `proxy.js`) — new `server/guide-stats.js` (pure: `EVENTS` whitelist of 24 (context, event) pairs, `valid`, `record` into `visitsStore.guide` + per-day `bucket.gd`, `period`, `summary` → acceptance, per-context shown/done/dismissed, Ranking funnel highlighted → joined → started, create, guests). `proxy.js`: `POST /__guide { ctx, ev }` → 204 counted / 400 refused (no key created) / 405; `guide` + `guideSince` in `emptyVisitsStore()` (reset clears them) and in the load; `/admin/visits` summary gains `guide`, `guidePeriod`, `guideSince`, `pings.guide`. Client `modules/guide/beacons.mjs`: fetch keepalive, no identifier, bounded offline queue (`pth_guide_q`, 50), flushed on `online`, off under « Do not count my visits » (`pth_no_count`); `index.mjs` sends offer offered/accepted/dismissed, shown (once per session / per game for the result), done, dismissed, join / create / guest_redirect, and started (`wait-ranking`; `lobby-ranking` when the table joined from the bubble starts). `admin.html` Traffic → « Ace’s Help » card (acceptance, funnel bars with rates, tips table, guests; « proxy predates the feature » when the field is missing). Privacy: new `pvSrvGuide` bullet in 83 catalogues (es-419 derived), the client's privacy page and `privacy.html`. Tests: `test:guide-admin` (47, spawns the real proxy on a scratch visits file), `test-admin-boot` renders the card.

- **Ace's Help — L2: Ranking contexts, public, 83 languages** (`web.260`, narmod) — spec in `docs/GUIDE.md`. `modules/guide/ranking-pick.mjs` (pure): `pickRankingTable(games, {guest})` — open (mode 1), not started, not full, no password, type 4; fullest first, lowest id on a tie; never for a guest — `POINTS` / `pointsFor` (15/9/6/4/3/2/1) and `finishPlace(before, after, me)` (out between two hands → players still holding chips + 1; another player out in the same step → unknown, no guess; winner only at the end screen). Contexts: `lobby-ranking` (highlight of the picked row, [Join], live on `pth:games`, folds into the badge after 25 s), `lobby-ranking-create` ([Create a Ranking table] → `App.openCreatePage({ ranking: true })`: type 4 + Ranking preset), `lobby-guest` (free account, replayed when a guest taps a Ranking / registered-only row), `wait-ranking` (x/10 — info panel notice or, on phones, the table row — then five facts every 20 s; hop on arrivals, « Just one more! » at 9/10, « Good luck! » at the start then silence), `ranked-result` (repeat: place and points back in the lobby). Engine: `repeat` contexts, step `auto`, several fallback targets, `fold`. `modules/ui/lobby.mjs`: `gameListSnapshot()` / `window._gameListSnapshot` + event `pth:games` after each `renderGames()` (listen-only). `pokerth.js`: `openCreatePage(opts)`. Docked Ace: also shifts left to find a spot that hides no control (weighted cost), re-docks on layout change. First-launch offer skipped under `navigator.webdriver` (other tests' screenshots), opt-in `pth_guide_webdriver`. `guide/lang/*.mjs` in 83 languages (es-419 derived from es), help section `start.acehelp` in 83 corpora; precached (`test-precache` knows `guide/lang/`). es-419 help fields of `web.256` re-derived from es. Tests: `test:guide-pick` (27), `test:guide-contexts` (121), `test:guide-lang` (447), `test:guide-browser` (81).

- **Ace's Help — foundation (L1, hidden behind `?guide=1`)** (`web.259`, narmod) — contextual assistant, spec in `docs/GUIDE.md`. New `modules/guide/`: `core.mjs` (context engine, no DOM — `canSpeak` / `pickContext` / `replayContext` / `createRun`: silent during a hand, one tip per context, « Later » snoozes for the session), `state.mjs` (`pth_guide_on` / `pth_guide_offered` / `pth_guide_seen`, union merge after the latest reset), `i18n.mjs` + `lang/en.mjs` (separate on-demand catalogues, fallback language → base → English → key), `highlight.mjs` (pulsing gold outline following its target), `contexts/` (data; `welcome` only for now), `index.mjs` (first-launch offer once, button / menu / option, screen watcher, `window._guideStore` sync bridge). `modules/mascot/guide.mjs`: small docked Ace (engine `actorKit()` export) with a multi-line bubble and buttons, pointing pose, `react('hop'|'wave'|'cheer')`, badge; docks at the lowest spot on the right edge that hides nothing tappable; plain bubble + A♠ chip under reduced motion. `mascot/index.mjs` `canAppear()`: scenes wait while `window._guideBusy`. `pokerth.js`: `pth_guide_on` in `_CFG_WEB_SYNC_KEYS`, `_GUIDE_SYNC_KEYS` merged through `_guideMergeIn` (blob parked in `window._guidePendingSync` until the module loads), `applyAdvOpts` → `window._guideApply`, option `adv-guide` OFF by default. Page: « Ace's Help » on the login screen, in the connect / lobby / create / game header menus and in Advanced options → Assistance (`.guide-only`, shown with `body.guide-avail`); UI keys `guideBtn` / `advGuide` in the 83 catalogues; guide files precached. Tests: `test:guide-state` (45), `test:guide-core` (60), `test:guide-lang` (101), `test:guide-browser` (45, Chromium phones + desktop).

- **Ranking tables — "full table needed" notice** (`web.246`, narmod) — `modules/ui/lobby.mjs` `renderGameInfoPanel`: on pokerth.net (login `auth`/`guest`, not offline), a waiting type-4 table (ranking, Cups included) shows `.lgi-rankwait` above « Players in game »: `rankWaitFull` « Ranking game — waiting for {max} players ({n}/{max}). The game will start when the table is full. », hidden once the table is full. New key translated in all 83 languages; style in `pokerth.css`.
- **Events tab — collapsible BBC registrations** (`web.241`, narmod) — parity with upstream `BbcGameDates.qml` `loadRegs` / `ForumNewsPage.qml` (pokerth/pokerth `f0ea7de`). Server: `server/community-events.js` carries the BBC game `id` in `upcoming` and adds `bbcRegsUrl` / `parseBbcRegs` (`/registration/date/get/<id>` JSON → `{ nick, admin }`, bounded to 20, no HTML decoding); `proxy.js` `GET /api/events/bbcregs?id=N` relays it (no CORS upstream), only for ids listed by the cached `/api/events`, 60 s cache per id, in-flight dedup, never a 5xx. Client (`modules/ui/forum-events.mjs`): a BBC row with sign-ups is a `role="button"` row (click / Enter / Space, `aria-expanded`, chevron) that unfolds nickname chips — BBC admins gold outline + `Admin` tag (`piRoleAdmin`), left bar in the step colour; loading (`rankingLoading`) / error (`evRegsError`) line; re-read after 2 min or when the count changed (`evRegsFresh`, QML `regsTtlMs`); keyboard focus kept across re-renders. The ↗ icon stays a link to the site. Footer button `#fn-bbcreg` “Register for the BBC” (`evBbcRegister`) in the Events tab (QML Register button). New keys `evRegsError`, `evBbcRegister` in 83 catalogues; help (`forumnews` section, 83 corpora) gains a paragraph on evening grouping, the WEC daily game and the registrations.
- **Events tab — WEC daily game** (`web.240`, narmod; schedule from sp0ck 28/09: “daily games at 22 every day, no registration”) — WEC publishes no schedule, so `modules/ui/forum-events.mjs` generates the rows (`evWecDaily`): one `WEC` row per evening from today to the last BBC game evening, at 22:00 Europe/Berlin (`evGameTimeToUtc`, summer/winter time via Intl), grouped with the BBC games, text `evWecDaily` (new key, 83 catalogues), link `https://wec.pokerth.net/`. `evGameDay` now shares `_gameWall`. Tests: CEST/CET conversion, October time change, empty ranges.

### Changed

- **Events tab — STEP badge sized like the BBC badge** (`web.239`, narmod) — the `web.238` `.ev-stepb` pill had its own metrics (`--fs-sm`, 8 px padding) and read too big next to the `BBC` badge. It now carries `.fn-forum` (same font, padding, radius as every badge of the window, scaled with the floating-window `--wz` zoom); `.fn-forum.ev-stepb` only adds bold and `nowrap`, colours unchanged. Measured in the real window (Chromium): both badges 14 / 17 / 21 px high at `--wz` 0.8 / 1 / 1.27.
- **Events tab — BBC source badge back, STEP badge beside it** (`web.238`, narmod) — narmod's choice after `web.236`/`web.237`: the amber `BBC` source badge (`.fn-c0`) stays on every BBC row and a separate `.ev-stepb` pill (`STEP n`, `--fs-sm`, same step colours) follows it; the row text is `--fs-sm` too. Special games (step 0) get no step badge (`evStepBadge` → `null`), their name shows in the text; `.ev-step0` removed.
- **Events tab — upcoming games grouped by evening, QML BBC-tab rows** (`web.237`, narmod) — parity with upstream `BbcGameDates.qml` / `ForumNewsPage.qml` (pokerth/pokerth `f0ea7de`): `modules/ui/forum-events.mjs` groups the Upcoming card under day headers keyed by `evGameDay` (Europe/Berlin wall clock, a game before 14:00 belongs to the previous evening — the 01:00 game) and labelled by `evDayLabel` (Today / Tomorrow · weekday, date, from the player's local today); each row is time (large) · badge · sign-ups, dimmed at 0 and green when full. Times stay in the player's zone. Replaces the `web.236` “BBC” row title (`evStepRowTitle` removed). Tests in `scripts/test-forum-events.mjs` (CEST/CET, year change, fr/en labels).
- **Events tab — BBC step badges coloured as in QML** (`web.236`, narmod) — parity with upstream `ForumNewsPage.qml` BBC tab (pokerth/pokerth `f0ea7de`, `stepColor`): `modules/ui/forum-events.mjs` gives BBC upcoming rows a `STEP n` badge (English in every language, the cup's own word) instead of the `BBC` source badge, and titles the row `BBC` (+ special game name); `pokerth.css` `.ev-step1…4` = `#E3C800` (light theme `#b09a00`) / `#50c878` / `#e89a30` / `#e05050`, special game (step 0) `#6E9CEC`. `evStepBadge` / `evStepRowTitle` covered by `scripts/test-forum-events.mjs`.

### Fixed

- **Music player — the ▸/▾ button never folded the list** (`web.235`, narmod) — long-standing: `_togglePlaylist` set the `hidden` attribute and flipped the caret, but `.music-pl { display: flex }` overrides the UA `[hidden]` rule, so the list stayed visible. `pokerth.css`: `.music-pl[hidden] { display: none }`. Visible change approved by narmod: the list is now folded when the panel opens (`_plOpen` defaults to false, not persisted) and unfolds on the caret or on the Playlist / Radios tabs, centred on the current track. Real app in Chromium, 1280×900 and 390×844.

- **Music player — playlist follow never scrolled** (`web.234`, narmod) — fix of `web.233`, reported by narmod on iOS and Linux Chrome: `_plFollow` bailed out on `ul.hidden`, but `.music-pl` is `display: flex`, which beats the UA `[hidden] { display: none }` rule, so the list is always shown while `_plOpen` (and the attribute) default to closed. The guard now relies on `clientHeight` only. Real app in Chromium (24 tracks, 1280×900): centred on open without touching the tabs, user position kept on track change, back on the current track after 4 s idle.

- **Very low landscape windows — action bar scaled, phone layout full width on desktop** (`web.227`, narmod) — after four screenshots (769×367, 529×530, 610×592, 682×297) compared with `web.215`: the defects were already there yesterday (at 682×297 the bar ran 20 px off the bottom, now 17; seats at the 0.55 floor everywhere). The QML desktop client never shows these sizes: `pokerth.qml` sets `minimumWidth: 390`, `minimumHeight: 600` outside mobile. `pokerth.js`: in the phone layout (touch, or a desktop window at or under the phone thresholds), landscape under 380 px high sets `data-abar-short` and `--abar-kp = clamp(h/380, 0.75, 1)`; `pokerth.css` zooms the whole bar by it (fonts included) — 73 px high at 682×297, 3 px above the edge. The desktop phone-layout block (`max-height: 500px`, `web.224`) now gives `.my-zone` the full width like a real phone: it had kept the desktop `clamp(380px, …)` width while the `bet | mid` grid of the ≤ 400 px layout needs ≈ 440 px — the mode list stuck out of the frame (also in `web.215`). Desktop sweep 4/10 players × 11 sizes (297 → 800 px high, both mode thresholds): 22/22, no control outside the bar, no box under it, never cut.
- **Desktop action bar — small windows fall back to the phone layout** (`web.226`, narmod) — `web.225` pinned the desktop format at every size, which removed the ability to check the phone layout from a computer. `pokerth.js`: `data-abar-desk` is now set only when the window is not phone-sized, using the exact thresholds of the phone CSS blocks — portrait ≤ 740 px wide, landscape ≤ 500 px high; there the phone formats apply as before `web.225` (the `web.224` centring fix stays). Above: the single desktop format scaled by `--abar-k` (0.8 floor reached around 576 px high / 608 px wide). Desktop sweep 3/6/10 players × 12 sizes including both thresholds (740/741×800, 1100×500/501): 36/36.
- **Desktop action bar — one format, one scale factor** (`web.225`, narmod) — with a mouse, the bar switched between three formats while resizing: desktop (380×117, fonts 13/11/12/11/15), portrait phone below 740 px wide (131 px high, glued to the edge) and short-landscape phone at 500 px high or less (104 px, fonts ×0.8, two-column grid at 400 px). `pokerth.js` (`updateBottomLayout`): `html[data-abar-desk="1"]` whenever `(hover: hover) and (pointer: fine)`, plus `--abar-k = clamp(min(h/720, w/760), 0.8, 1)`; the table reserve uses the bar's visual height (zoom included) and is written `!important` (the short-landscape CSS forces `padding-bottom: 0 !important` on `.game-area`). `pokerth.css`: a closing block pins the QML desktop geometry for that attribute — fixed, centred, 8 px from the bottom, `max(264·cs, 380)` wide, rows 26/26/54, fonts 13·11·12·11·15 — with `zoom: var(--abar-k)`; `#s-game#s-game` in the selectors outranks the `:root:not(…) #s-game` interface-size / short-landscape rules. 1 at 1280×720 and above; 0.8 (the QML phone size) in small windows. Touch devices unchanged. Desktop sweep 3/6/10 players × 10 window sizes (520×550 → 1920×1080, 700×380, 1100×450): 30/30 centred, no box under the bar. Deliberate web deviation: the QML desktop bar never scales.
- **Action bar off-screen in low desktop windows** (`web.224`, narmod, video 28/09) — the `(max-height: 500px) and (orientation: landscape)` block puts `.my-zone` back in the flow (`position: relative; left: auto`), but the desktop centring `transform: translateX(-50%)` still applied, so the bar sat half off-screen to the left (620×420: left −190). Predates `web.221`. `pokerth.css`: desktop + ≤ 500 px high → no transform, auto side margins, 8 px bottom margin instead of the (relative) `bottom`. Centred at 620×420, 800×480, 1100×500.
- **Action bar — QML vertical geometry on desktop; narrow-window card overlaps** (`web.223`, narmod) — compared with upstream `GameActionBar.qml` (pokerth/pokerth `8114c47`): raiseSection topPadding 4 + row 26 + spacing 3 + row 26 + bottomPadding 2, then the 54 px action row (5/5 margins, 44 px buttons), sides 8, bottomMargin 8 in desktop landscape = 115 px. The web CSS already carried those values but two stronger rules won: `body.adv-hide-pbar .my-zone { bottom: 0 !important }` and, in full-table mode (the default), `:root[data-table-fs="1"] .my-zone .action-grid { padding: 8px 10px }` — 130 px, glued to the edge. `pokerth.css`: a desktop-scoped block (≥ 600 px, fine pointer) restores bottom 8, padding 4/8/0 and a 2 px gap before the buttons (115 px + 1 px border each side); phones and portrait unchanged. `pokerth.js`: `--bar-k` used `width < 900` for `Theme.compact`; QML's `Config.Theme.compact` is `windowWidth < 600` (`config/Theme.qml`), so the action row was 56 px instead of 54 between 600 and 900. `modules/game/seat-render.mjs`: the horizontal corridor cap of the community row used a half-width of 121·cs; the drawn row is ~129·cs, now 132·cs (264/2) — cards bit the side boxes by 1–3 px at 640–800 px wide. Desktop sweep (2–10 players × seated/spectator × 8 window sizes): 143/144 (was 65/144); the remaining case (spectator 7 players, 800×600, bottom flank 3 px under the row) predates this change.
- **Community scale — compensate the autofit inside the table only** (`web.222`, narmod) — regression from `web.221`: the landscape `--comm-scale` written on the root was divided by the scaler's effective scale, but several consumers live OUTSIDE `#g-table-scaler` and expect the screen value — notably the action bar width (`clamp(380px, 264px × --comm-scale, 96vw)`, QML `panelWidth = max(communityVisualWidth, 380)`), which stayed at 380 px on large screens (475 px expected at 1600×900+). `modules/game/seat-render.mjs`: the root keeps the screen value; only `#g-table-scaler` (community row, pot badge, winning-hand badge) gets the divided value through an inline custom property, cleared in portrait and on reset.
- **Community cards — QML size, no jumps when resizing** (`web.221`, narmod) — two web deviations in the landscape `communityScale` (`modules/game/seat-render.mjs`): (1) a fixed pot-badge reserve of 65·boxScale (14/09) was taken off the free height whatever the real space, so the cards shrank as the window widened (49 px instead of the QML 75 px at 1000×700, spectator, 10 players); (2) `#g-comm` lives inside `#g-table-scaler`, whose autofit (×1 → ×1.4) was compensated in portrait only, so landscape cards were up to 40 % larger than QML on big screens (116 px instead of 83 at 2560×1300) and jumped with each autofit step. The scale is now computed in screen px as in QML (horizontal corridor cap and compact shift included) and divided by the scaler's effective scale when written, with the in-felt guard; the reserve is replaced by a measured cap — only a box above the badge, in its column, can lower the scale (badge top ≈ centre − 69·cs, 6 px margin). Spectator 10 players now matches pure QML at every size tested (700×700 → 2560×1300). Desktop overlap sweep (2–10 players × seated/spectator × 6 window sizes): 108/108 clean, 103/108 before (cards or pot under a box at 4–5 players). `test-layout`, `test-boot`, table sweep 36/36 and mobile 44/44 (Chromium) pass.
- **Spectator ring — bottom seats mirror the top spacing** (`web.220`, narmod) — the QML landscape ring squeezes only the UPPER arc horizontally (`topCosSquash` 1.4 on |cos|), so in spectator mode the neighbours of the bottom seat sat ~20 % further out than those of the top seat (0.588 vs 0.475·radiusX at 10 players). `modules/game/layout.mjs`: new `ringVec` — in spectator mode a lower-half seat takes the horizontal factor of the upper-arc point at the mirror angle (360 − deg) and keeps its own vertical factor; used everywhere (bisection pairs, final slots, raw slots), so pair separation stays guaranteed. A full vertical mirror was tried and rejected: the lateral pairs end up at almost the same height and the scale fell from 1.51 to 0.82 (1900×800, 10 players); horizontal-only keeps it (1.56). Seated mode unchanged (strict QML). Web adjustment no. 10 (DELTA_QML_2_1_9, annex A.1). `test-layout` and the spectator table sweep (2–10 players, phones) pass.
- **Theme window — gap above the pinned tab bar** (`web.219`, narmod) — `modules/theme.mjs`: the floating theme panel's scroller had `padding-top: 11px`, and a `position: sticky` child sticks at the scroller's padding edge, so the rows scrolled through an 11 px strip above the tab bar (seen on /live, same panel in the full client). The scroller loses its top padding and the tab bar takes it as its own top margin in that panel only (`data-st-float`), which scrolls away; the embedded copy in Advanced options › Style is unchanged. Checked in Chromium: 11 px → 0 px.
- **/live — stale online count after a reconnect; Players tab search** (`web.216`, sp0ck) — `S._lobbyPids` (the set behind the /live Players count and the lobby's online counter) was only cleared by a voluntary disconnect; after a server timeout + reconnect (or an auto-reconnect that opened a new upstream session) the server resent the full PlayerList on top of the previous session's pids, which never get a "left" notification. `modules/net/msg-lobby.mjs`: `onAnnounce` — the start of every fresh server session — now clears `_lobbyPids`, `_lobbyPlayerCount` and `_pendingNameRequests`; a transparent proxy rebind sends no Announce and keeps them. `modules/live/lobby.mjs`: a search field (old spectool parity) in the sticky tab bar, shown on the Players tab, filters names case-insensitively; it lives outside the repainted body so typing keeps focus, Escape clears it; reuses the `rankingSearch` / `rankingNoMatch` keys (83 locales).
- **Covering hats — the crown must enclose the skull** (`web.214`, narmod) — after narmod's third screenshot: the witch's concave cone left the top of the head visible on both sides above the band (up to 161 skin px on the square face), and he asked whether the portrait's placement or size was at fault. It is not: a covering hat hides the hair above its line but the skull (`_headD`, top at y 36, half-width ≈ 40 at y 50 on the ±53 oval) is drawn under it, so the crown's lower sides must stay outside the outline up to the crown. `avatar-parts/extras.mjs`: `witch-hat` crown `M46 72 C50 50 66 34 86 22 …` — a cubic that wraps the skull with a 3–8 px margin, then the taper and the flopped tip; brim ellipses aligned (rx 82 / 77, the misaligned pair drew a thick dark rim at the ends); band 49–151. Fedora, panama, stetson and ace fedora: crown base 3 px wider each side (`M51 67 Q49 22 …`, stetson `M50 66 Q48 30 …`) — 2–17 px slivers on the square, long and heart faces. A raster audit (skin painted magenta, every covering hat × every outline, pixels above y 66 counted) now finds nothing. `scripts/test-avatar-studio.mjs`: 142 checks.
- **Witch hat — hair above the brim ends; bigger, centred character cards** (`web.213`, narmod) — after narmod's second screenshot. `modules/ui/avatar-vector.mjs`: the hair-hiding clip of a covering hat starts at `hatP.line || HAT_LINE` — a hat whose brim ends sit low (the witch's, ry 14 at y 73: its top edge is at y ≈ 67 near the ends, 7 px under the fixed line at 60) can lower the line so no hair shows between the line and the brim; every other hat keeps 60. `avatar-parts/extras.mjs`: `witch-hat` gets `line: 66`, brim rx 84 (90 overflowed the frame on the widest skull). `pokerth.css`: `.avm-presets` is a grid (`repeat(auto-fill, minmax(92px, 1fr))`) and `.avm-preset svg { width: 100%; height: auto }` — three left-aligned 72 px cards with a hole on the right become three centred columns of ≈ 96 px portraits on a phone.
- **Avatar picker modal and witch hat** (`web.212`, narmod) — after narmod's screenshot of the Characters step. `pokerth.css`: `#avatar-popup.avatar-popup-as-modal` is top-aligned (`justify-content: flex-start`, `padding-top` + `env(safe-area-inset-top)`) instead of centred on 100vh, which put the card too low on phones and its bottom under Safari's toolbar; the Create / Import panes get `max-height: min(76vh, calc(100dvh - 130px))` (fallback `calc(100vh - 170px)`) instead of `60vh`. The Create pane loses its top padding (`padding: 0 var(--sp-5) var(--sp-5)`) and `.avm-sticky` its `-12px` top margin: a sticky child above the scroller's padding was pinned below that padding, so the rows scrolled past showed through a 12 px strip above the preview. `avatar-parts/extras.mjs`: `witch-hat` redrawn — brim rx 90 at y 73, head-wide cone (44–156) with concave sides, tip flopped to the right (y 4 → 20), purple band with a gold buckle (the former cone was 84 px wide with a stub tip).
- **Avatar toon portraits — hats sized on the skull, wider crowns** (`web.208`, narmod) — after narmod's screenshots (bowler and crown perched on the rugged outline). `modules/ui/avatar-vector.mjs`: hats go through `_hatFit` — the uniform ear-level factor `HEAD_HW[k] / 53` they had before `web.203` — instead of `_warp`, whose temple factor shrank them on a temple-narrow, cheekbone-wide face (0.99 instead of 1.075 on the rugged man; the hair keeps the warp, a hat sits on the widest part of the skull); the hood stays built on the outline. Redrawn: fedora (brim ±76, crown 54–146), bowler (brim ±66, crown 50–150 down to y 68), panama, stetson (brim ±80, crown 54–146), top hat (brim ±68, crown 50–150), ace fedora; the crown is 50–150 wide with its band at y 65–72, on the head instead of above it. `scripts/test-avatar-studio.mjs`: 123 checks (hat scale per outline, hood unscaled).
- **Avatar toon portraits — face landmarks drive the fit of hair, hats, beards and ears** (`web.203`, narmod) — after narmod noticed that one width per outline (`HEAD_HW`, at ear level) was not enough to adapt the beards and hairstyles to the ten face shapes (a fedora + full beard on the square jaw showed a beard rim beside the cheeks and a hat sized for the ears, not the crown). `modules/ui/avatar-vector.mjs`: `FACE_PTS[k]` gives each outline its half-width at the temples (y 60), at ear level (100), under the ear (104), on the cheek (120), at the jaw angle (134) and along the jaw (142), plus its chin y (`HEAD_HW` is now derived from it, ears unchanged). `_warp(svg, k)` replaces the uniform `_sx(wk)` on the hair layers, the temple underlay and the hats: every x of the snippet (path data M/L/Q/C/T/S/H/V/A, circles, ellipses, rects, lines) is scaled around x 100 by a factor that varies with its own y — the temple factor above the brow line, the ear factor at ear level, blended between, held below the ears (hair falls straight) — so the rugged man's crown is narrower than his cheekbones and the heart-shaped woman's wider than her jaw; the masculine oval keeps the exact 55/53 factor it had. `_beardMask(k, full)` builds the short/full masks from the landmarks: the sideburn tip sits on the edge under the ear (y 103 / 106), the band is ≈ 5 px on the cheek and ≈ 17 px at the jaw angle on EVERY face (the fixed masks gave wide faces a beard from the ear and narrow ones only from the jaw); `_headClip` takes a `[sx, sy]` pair scaled around ear level — full beard (1.02, 1.12), short (1.01, 1.06), long (1.02, 1.14) — so the beard overhangs the jaw and chin with no rim beside the cheeks (the former ×1.1 around the eye line pushed the sides out 5 px); the goatee hangs from the chin landmark, the long beard's mass is as wide as the jaw landmark and as long as the chin allows; the balding ring (hair 16, marked `data-fit` so it is not warped) stops at the ear lobe instead of a block down to y 122 on the square and long faces. `scripts/test-avatar-studio.mjs`: 100 checks (warped underlay coordinates per face, hat brim widths, landmark-built masks, clip pairs, goatee and long-beard anchors, unwarped ring).
- **Avatar toon portraits — hair and beard oddities from nine screenshots** (`web.202`, narmod) — `modules/ui/avatar-vector.mjs`: new `_dots(list, fill, extra)` helper (a list of circles). Hair 39 (men's curls) was a lattice of equal bumps that read as rows of pearls on the long and rugged outlines; it is a mass with 13 curls of 9–13 px radius placed by hand plus four highlights. Hair 50 (men's bed head) had three flyaway strands floating a few px off the silhouette; they now leave the hair mass (`M46 76 …`, `M154 72 …`, `M146 42 …`). Beard 6 (long) hung a separate blob under the jaw beard; it is a single mass rooted in the jaw beard (`jaw(BEARD_FULL, 1.09)`) that tapers to a rounded point at y 204, with three combed strands and two lighter edge strokes. Hair 44 (women's curly ponytail) drew its curls with `_bumps` around the head so on a wider outline they crossed the face; the tail is eight explicit curls at x 150–182 from the tie at (146, 40) down to y 158, plus three highlights. Hair 47 (braided low bun) lost its braid on black hair (same tone as the mass); the beads and the bun rim are stroked with the highlight tone. Hair 38 (women's long locs) was ten plain rectangles under a bump cap — the same helmet look the dreadlocks (15) had before `web.198`; it is now drawn the same way: a cap, nine twists radiating from the crown, ten rounded locks of uneven length (y 70 → 118–132) alternating the two tones with a dashed knot line each.
- **Avatar « From a photo » — audit pass: stubble, skin model, backdrop, hat** (`web.200`, narmod) — after narmod's grey-stubble selfie came back clean-shaven (and, once, with a red cap and white hair). `modules/ui/avatar-photo.mjs`: (1) beard — the guided chin zone is 74–92 % of the way from the eye line to the oval bottom the player aligned (a chin framed a little above it no longer drags the collar in); `zoneStats` counts per pixel the DARK (< 68 % of the lit skin) AND COLOURLESS (chroma ≤ 12, b ≥ −4) grain — `darkN` — and the median local std; a beard needs the UPPER half of the zone (right under the lip) below 88 % of the cheeks, and a new verdict `stubble` (beard 5) fires when ≥ 22 % of the zone (and ≥ 15 % of its upper half) is such grain with a grainy texture (median std ≥ 5) even though the median luminance ratio stays ≥ 0.8 — grey stubble under a strong light had ratio 0.85; (2) skin — in guided mode the median Lab colour of the oval's middle (nose and cheeks: ±0.3 rx, eye line −0.1…+0.3 ry) extends the fixed YCbCr rule by union (ΔE < 16), so a flushed face, a colour cast or a very dark skin keep a whole face blob; (3) hair — the brighter off-face group of the crown band seeds the hair colour only when it is more than twice the darker one (a lit wall above a head framed low made white hair), the dark-backdrop rescue needs L < 36 (a mid-grey wall at L 44 became grey hair), and a man's shoulder zones are dropped when the crown colour is within 30 ΔE of the clothes; (4) hat — the cap verdict uses Lab chroma ≥ 32 instead of HSL saturation, which is inflated on pale colours (a pale bluish wall became a red cap); (5) backdrop — with `guide.valid` (imported, panned photo) the corner squares are sampled inside the covered rectangle, not in the fill around it (the fill was the "backdrop", so the real wall beside the face counted as hair). `modules/ui/avatar-studio.mjs`: an analysis exception is logged (`console.error`) and the last result kept in `window._avPhotoLast` for inspection. Benches: the new frame cropped from the screenshot (`arnaud4.jpg`) with the ±5 % / ×0.9–1.1 sweep, which now passes `valid` like the app; `bench.sh` prints every bench as one table. `scripts/test-avatar-studio.mjs`: 95 checks (synthetic stubble grain → beard 5).
- **Avatar « From a photo » — dark top ≠ long hair on men** (`web.199`, narmod) — `modules/ui/avatar-photo.mjs`: since `web.192` mapped a man's « long » length to the long straight style (43), a dark hoodie under a dark-haired man made him long-haired on most framings of narmod's own selfie (the low zones read the garment as hair whenever the crown colour and the clothes strip differ by more than 16 ΔE); the masculine « long » verdict now also needs the side zones at ear level to be at least 45 % hair, which a short cut never gives. Feminine lengths unchanged (hair over the shoulders is the norm there).
- **Avatar toon portraits — dreadlocks and long beard redrawn** (`web.198`, narmod) — `modules/ui/avatar-vector.mjs`: hair 15 was six plain rectangles under a cap of bumps (a helmet with tubes); it is now a cap with nine twists radiating from the crown (quadratic strokes in the dark tone), eight locks of uneven length (70–96) alternating the two tones with a dashed knot line each, and faint highlights. Beard 6 hung a flat triangle from the chin; it is a rounded mass (62–138 wide, down to y 202) with three combed strand strokes and two lighter edge strokes over the jaw beard.
- **Avatar toon portraits — men's tank top → bomber jacket** (`web.196`, narmod) — `modules/ui/avatar-vector.mjs`: outfit 22 drew bare shoulders with a garment starting at the chest, which on the portrait's cropped torso (no visible shoulders) read as a strapless top; it is now a bomber jacket (body in the outfit colour, default olive, a dark ribbed collar band, a zipper line with its pull, a white tee in the V, two pocket flaps). Same index, so saved portraits and the dice keep working; the 0.5 dice weight it carried as a tank top is dropped.
- **Avatar toon portraits — hair, beards and ears fitted to every outline** (`web.195`, narmod) — after three random men whose hair and beard sat off the face. `modules/ui/avatar-vector.mjs`: `HEAD_HW` gives each of the six outlines its half-width at ear level (55 / 59 / 54 masculine, 51 / 56 / 55 feminine) and `wk = HEAD_HW[k] / 53` replaces the round-only 1.075: the back, front AND scalp hair layers, the temple underlay and the hats are all scaled by it (the scalp layer was never scaled); the ears (`_earsSkin`, `_ears`) sit 6 px inside the outline instead of at a fixed 47 / 153, and the earrings follow; the beard masks `BEARD_SHORT` / `BEARD_FULL` keep their cheek line but their outer edges now start at x 40 / 160 (well outside every outline — the head clip draws the sideburn), so a round jaw no longer shows an unbearded sliver at the temple; the balding crown (hair 16) is the head outline grown ×1.1 clipped to a side band (y 58–122), without the former temple tufts that read as blocks beside the wider masculine faces; the long masculine hair (43) tapers and rounds off at the ends instead of a flat cut. Bench: `fit.html` grid (3 faces × 7 hairstyles × 5 beards per silhouette). `scripts/test-avatar-studio.mjs`: 93 checks.
- **Avatar toon portraits — virility pass** (`web.193`, narmod) — after three random men that read as women (a curly mop with hoop earrings and a pout, a blonde fade with a single hoop, a side sweep with a hoop and a wink). `modules/ui/avatar-vector.mjs`: `AV_SEXTAG` tags every earring (ears 1–5), the pout (mouth 5), the small « o » (7) and the beauty mark (marks 2) feminine — the earrings row disappears on the masculine silhouette like the retired shoulder accessories; the cheek blush is drawn at opacity .1 on men (.32 on women); two masculine options are added, a cigar in the corner of the mouth (mouth 10, ember + smoke, dice weight 0.35) and a cheek scar (marks 6); hair 39 loses its side-hanging rings (curls cut above the ears), 40 becomes a pompadour (high front swept back, comb lines), 41 a squared flat top with the sides shaved to two translucent bands. `mouth` axis 10 → 11, `marks` 6 → 7 (no labels, no i18n). `modules/ui/avatar-photo.mjs`: a pout or a small « o » read on a masculine silhouette becomes the neutral mouth. `scripts/test-avatar-studio.mjs`: 91 checks.
- **Avatar « From a photo » — face shape from the width, nose length, teeth relative to the skin** (`web.191`, narmod) — `modules/ui/avatar-photo.mjs`, guided mode. Face: the player fits the face HEIGHT to the oval, so the old chin-distance aspect said nothing (every face came out round or oval by chance); the width does — the median skin extent of the face blob over the rows 0.3–0.9 E under the eyes, divided by the template oval's width at that row: ≥ 1.04 → round, else square when the jaw extent (1.45–1.65 E) is ≥ 80 % of the cheeks' and the cheeks are in view (width ≥ 0.9 — hair over them would make any jaw look wide), else oval; the free-mode rule is untouched. Nose (new `nose` key, only when found): the centre column's luminance under the eyes, relative to the cheeks beside it, dips at the nose base, the mouth and a beard; runs below 82 % (and under 72 % at their deepest — the tail of the shadow under the eyes is shallower) from 0.55 E down to the lips are segmented, the nose base is the upper of the two deepest (a child's mouth sits right under a short nose, a beard is darker than both); base < 0.62 E → the small upturned nose, ≥ 1.15 E → the long straight one; the shadow's width moved too much with the framing to use. Mouth: `isTooth` is now L > lit-skin L + 2, a ≤ skin a + 4, chroma < 24 — relative to the photo instead of an absolute 150 level that dark photos never reached — counted between the lips only and in a row at least 30 % of the mouth wide (the lit skin above the upper lip is as bright); when no lip band is found (a wide smile stretches the lips thin) the template's mouth window (1.25–1.75 E under the eyes, ±0.5 E) is read for a row of teeth → grin, teeth + dark opening → laugh. `scripts/test-avatar-studio.mjs`: 87 checks (oval vs wider synthetic face, no nose key without a shadow).
- **Avatar « From a photo » — long hair over the shoulders, hair-coloured walls, beard vs neck, bigger shutter** (`web.190`, narmod) — after two family selfies. `modules/ui/avatar-photo.mjs`: a top corner whose colour matches the hair centre (a shaded wall behind dark hair) no longer excludes by colour alone — once `hairC` is known such a corner only excludes SMOOTH pixels (local std ≤ max(2.5, 2.5 × the corner's)), strands having texture; on the feminine silhouette the clothes strip is read again below the chin with hair-coloured pixels (shaded strands included) removed, and left unknown (no outfit guess) when the hair covers it — a dark strip of hair used to become a black turtleneck AND exclude the low zones as "the garment", so long hair came out short; the shoulder-colour-is-the-collar rule is masculine-only and compares the CROWN colour, and a man's hair is long only with lowFrac > 0.5. Hair colour = median of every hair pixel found (crown + sides + shoulders — the crown is often in shadow); grey / white (chroma-less entries) are only chosen when the median's chroma is < 8, otherwise the nearest coloured entry. Beard: the dark mass must be hair-coloured — never blue (a collar, b < −4), chroma ≤ 30 — and a moderate contrast (0.65 ≤ medR < 0.8) only counts when that mass is neutral (chroma ≤ 12, a beard hides the skin; a shaded neck or a chin a little below the oval keeps the skin's chroma ≈ 15–20), a strong contrast (< 0.65) still counts on its own (stubble on skin); a frame 5 % off on a boy's face gave a full beard. Pout needs h/w > 0.75 (full lips are not one). `AV_PHOTO_MAXW` 220 → 400: the analysis runs on the frame the panel produces (texture survives; ~0.2 s). `pokerth.css`: `#avm-cam-ok` is a full-width 56 px primary button under the two secondary ones. Bench: the two frames cropped from the screenshots, with a ±5 % / ×0.9–1.1 sweep (`test9.html`).
- **Avatar « From a photo » — guided geometry, beard vs cheeks, silhouette step** (`web.188`, narmod) — `modules/ui/avatar-photo.mjs`: in guided mode the face box is the template oval and the face blob is the skin component overlapping it most (no more skin-blob search: web.185–187 had lost the guide path when the analysis grew, and a normal selfie came back with the wrong skin, no hair, no beard); the pupils are looked for in windows around the template's own eye spots (38 % down the oval — the drawn eye line moves from 45 % to 38 %; hairline → eyes ≈ 1.1 E, eyes → chin ≈ 1.8 E), through a multi-scale centre-surround that also demands brighter pixels on both sides (sclera), a pair needs skin on the nose bridge, under each eye and on both sides of each eye (hair edges, eye corners and eyebrows fail), and a found pair only refines the geometry within bounds (level, 0.7–1.35 E); a missing pupil falls back to the template spot with the eye taken as open. Beard: the chin zone's median luminance is compared with the cheeks of the same photo (`medR` < 0.72, or < 0.8 with little skin chroma; full beard < 0.62 with a dark moustache band), the lips and the top-corner backdrop excluded, which cancels the lighting — the previous absolute dark-pixel fraction flipped with exposure and framing. The crown test for baldness uses the Lab distance to the lit cheeks (light brown hair in sunlight passed the chroma test). A very wide lip band is a smile (grin with teeth). `modules/ui/avatar-capture.mjs`: the panel opens on a silhouette step — two big cards with sample portraits (`AV_SEX_SAMPLE`) and drawn ♂ / ♀ icons (`avSexIcon`) — and the camera starts once a card is tapped; a small « ♂ Man ✎ » button above the viewfinder reopens the choice; `.avm-cam` backdrop darker and blurred. The studio's silhouette chips use the same SVG icons, centred (`.avm-sex-opt`). Benchmarks: hand-annotated ovals on three selfies with a ±6 % / ×0.8–1.2 framing sweep, plus the dlib faces.
- **Avatar « From a photo » — bearded selfie pass** (`web.183`, narmod) — `modules/ui/avatar-photo.mjs`: the rough face box bottom is the LAST row still ≥ 30 % of the cheek width, not the first dip below 55 % — on a bearded face the eye band (brows, lids, shadows) dipped that low and the box stopped at the forehead, so the pupils were scanned above the eyes and the beard fell outside; the beard zone is taken from the pupils when known (1.1–1.85 E below, never reaching a shirt collar) and the collar-colour rejection only applies without pupils; a glasses rim must be THIN (one dark row in the 0.35–0.6 E band under each eye while the band average stays under 35 %), so eye bags no longer count; the clothes strip for the outfit guess is clamped to the image instead of skipped when the photo ends early.
- **Avatar « From a photo » — first real-photo pass** (`web.182`, narmod) — `modules/ui/avatar-photo.mjs` after narmod's own selfie: pupils are now found by centre-surround on an integral image (dark disc in a bright ring) and chosen as the darkest LEVEL pair, with a lower comparable pair preferred over the eyebrows; skin tone comes from the brightest 30 % of the skin pixels of the rebuilt box (lit cheeks and forehead, never beard or shadow), matched lightness-first (+9 L) against the palette; the hair seed is the 3-row band above the hairline that differs most from the face (the hair, not the fringe shadow), and a hair flood the colour of the clothes stops at the chin; glasses need a dark rim under BOTH eyes plus a nose bridge (or a strong rim); a jaw beard forces the oval face (the chin is hidden); the frown needs a wide enough lip band; the moustache band sits between nose and lip; a new `outfit` estimate reads the clothes under the chin (L < 35 → hoodie / turtleneck, L > 70 → open shirt, else suit / collared sweater). Only strongly under-exposed photos are brightened now (a stretch on a normal photo turned dark hair skin-coloured).
- **Avatar toon portraits — Mii-like face features** (`web.180`, narmod) — `modules/ui/avatar-vector.mjs`: mouths are filled shapes (mouth dark `#5e2521` + lower lip band, white teeth band on the grin and the laugh) instead of thin strokes, with two new options (8 frown, 9 tongue out — `mouth` axis n 8 → 10); eyes get an outlined sclera, a bigger iris and a thick upper-lid arc (`_eye(x, y, ec, rx, ry, ir)`, `EYE_LINE`), the almond and wide variants included; noses are solid shapes in the skin shadow (`_nose`); eyebrows are thicker (5.4 masculine, 4 feminine). Axis ids unchanged, saved recipes re-open as they are.
- **Avatar toon portraits — strict silhouette parity and hair placement** (`web.179`, narmod) — `modules/ui/avatar-vector.mjs`: `AV_SEXTAG` now tags EVERY hairstyle (12 masculine / 14 feminine) and EVERY outfit (9 / 8) plus cat-eye glasses, pearls and gold hoops (feminine), bowler and flat cap (masculine); `avVisible()` therefore hides them in the studio and the dice draws from the same set, so the former dice-only `AV_RANDSEX` table is gone. Outfit 3 (burgundy suit) is redrawn as a feminine teal sweater with a round white collar; turtleneck (7) and blazer + scarf (16) are tagged feminine. Placement: pigtails (19) move to the back layer so they hang behind the head and the ears; the side braid (11) starts behind the ear (back layer) and its lower beads are redrawn over the shoulder (`_braid(..., yMin)`); the bun (7) and the afro (10) are lowered off the frame edge, the mohawk crest (17) too; the fringes of the pixie (12), asymmetric bob (22), surfer cut (18) and hollywood waves (25) are raised above the brows. Short styles (`AV_SHORT_HAIR`) under a covering hat are clipped to a thin band below the brim (`HAT_SHORT_BOTTOM`). Hats are hidden on the mohawk like on the bun and the afro. `scripts/test-avatar-studio.mjs` checks that every hairstyle and outfit is visible for exactly one silhouette and that both sides keep a decent choice.
- **Avatar toon portraits — head-top pass** (`web.178`, narmod) — `modules/ui/avatar-vector.mjs`: the balding crown (hair 16) is now the back of the hair peeking out around the head (grown head path, band-clipped) plus soft tufts above the ears instead of flat side blocks; the surfer cut (18) back layer is rounded to the jaw instead of a rectangle beside the face; the low ponytail (24) starts behind the ear instead of on the cheek; the side-swept bob (22) no longer covers the left eye. Box braids (20) are tagged feminine (`AV_SEXTAG`). The dice gains relative weights (`AV_RANDWEIGHT`) so bald, balding, mohawk, dreadlocks, afro, side braid and voluminous curls stay possible but rare. `_hair()` now receives the face shape.
- **Avatar toon portraits — face-shape fit and coherent dice** (`web.177`, narmod) — follow-up of `web.176` in `modules/ui/avatar-vector.mjs`: the head outline is now one path per face (`_headD`) and a reusable, optionally grown clip (`_headClip`); jaw beards (short, stubble, full, long) are the lower part of that clip instead of oval-only shapes, so they follow the round and square jaws; a temple underlay behind the head closes the gap between hairline and skin on every face; close-cropped parts (balding sides, mohawk stubble) move to a third, head-clipped « scalp » layer; the neck shadow that floated beside the neck is dropped. The dice gets its own rules (`AV_RANDSEX`, `AV_RANDNONE`, `_randOk`): options that read as the other silhouette are never drawn at random (the studio still offers everything), tall styles skip hats, and optional extras stay on « none » most of the time. `scripts/test-avatar-studio.mjs` checks 200 draws per silhouette.
- **Double boot splash after an update** (`web.175`) — the /__ver banner reloaded without storing the applied version in `pth_lastver`, so the next boot always saw a mismatch and `coldBootSelfHeal()` (`pokerth-client.html`) reloaded a second time; a plain reload after a deploy did the same. That extra reload dates from the stale-while-revalidate era — since `web.155` the HTML and all code are network-first, so the first load already runs the new build. The banner now records the version it applies, and the cold-boot path only adopts the new value and activates a waiting service worker (before the first `connect()` only, guarded by `window._swReadyOnce`) — no reload. The `pth_verapplied` key is dropped.
- **Invite links to a table** (`web.171`) — audit of the « Invite friends » flow, one canonical builder in `public/modules/net/invite-link.mjs` (pinned by `scripts/test-invite-link.mjs`, 57 checks):
  - the game-info 🔗 button (`copyTableLink`) still emitted the legacy `?host=&port=&table=<id>` link, which lands the friend in LAN `unauth` mode even for a pokerth.net table; it now copies the same `#join=<name>&s=<server>` link as the dialog (legacy links are still read);
  - a link opened while the app is already open (same tab, PWA share target) only changed the fragment — no reload, no `hashchange` listener, nothing happened. The module now handles `hashchange`: joins in place when connected to the same server, reloads on the link otherwise, never leaves a table;
  - `_pthApplySharedLink`'s « never during a hand » guard read `S.gameId` (does not exist) instead of `S.gId`;
  - the « shared table not found » timer ran 20 s from page load: slower logins never got the message and the stale name stayed pending for the whole session. The watch now counts from the connection and drops the name;
  - homonymous tables: a table still waiting (with a free seat first) wins over a running one; a running table is watched as spectator (`sharedTableRunning`) instead of failing to join;
  - the dialog warns the host when the link cannot work (invite-only table, registered/ranking table on pokerth.net for guests, loopback server address) — `invWarnInviteOnly`, `invWarnGuests`, `invWarnLocalhost`, in all 83 languages.
- **SEO: bare `pt` hreflang now targets Brazilian Portuguese** (`web.170`) — `SEO_HREFLANG_ALIAS.pt` pointed at `pt-PT` while the client's own alias (`i18n.mjs`) loads `pt-BR` for `pt`, so `/?lang=pt` served a European Portuguese head over a Brazilian UI. Both now say `pt-BR` (the large majority of speakers); `pt-AO` / `pt-MZ` keep `pt-PT`. Pinned in `scripts/test-seo-lang-query.mjs`.
- **SEO: Latin American Spanish variants served in English** (`web.169`) — `seoLangFromQuery()` read `?lang=` with `[A-Za-z-]{2,7}`, so `es-419` matched as `es-` and fell through to English: all six `es-419` URLs in the sitemap (`/`, `/rules`, `/faq`, `/hand-rankings`, `/how-to-play`, `/glossary`) rendered English with `<html lang="en">` and a canonical pointing at the English page, contradicting their own hreflang entries (and the `es-MX`/`es-AR`/… aliases pointing at them). Digits are now accepted. Guarded by `scripts/test-seo-lang-query.mjs`: every advertised hreflang value, and every catalogue code, must resolve to the page it points at. Full audit of the 499 sitemap URLs (83 languages × 6 pages + `/privacy`): canonicals self-referencing, head alternates identical to the sitemap `xhtml:link` set, x-default present, all alternates reciprocal. Stale language counts left in comments and in the admin Traffic help text removed.

### Changed

- **Music player — the playlist follows the current track** (`web.233`, narmod) — after narmod's iPhone screenshot: with 24 tracks in a 168 px list the playing track was often out of view, and every re-render (`_render` rebuilds the panel's `innerHTML`) reset the list to the top. `modules/music.mjs`: after each render, `_plWire` centres the `.is-cur` row by scrolling the `<ul>` only (never the page); any user activity in the list (pointer, touch, wheel, keys, or a scroll event not caused by us) pauses following and keeps the user's position across re-renders; after `PL_IDLE_MS` (4 s) without activity the list scrolls smoothly back to the current track (instant with `prefers-reduced-motion`). Opening the list also centres it. `pokerth.css`: the current row gets a 3 px accent bar and semi-bold text; `overscroll-behavior: contain` on the list. Chromium harness (24 tracks): centred on open, user position kept on track change during activity, back on the current track after 4 s.

- **Avatar toon portraits — declarative parts catalogue, stable ids (recipe v3), expressions** (`web.209`, narmod) — after narmod: « avoir plus d'expressions et un modèle générique pour pouvoir en ajouter / modifier facilement dans le futur », ids stables validés. `modules/ui/avatar-parts/` (new, precached): one file per family — `helpers.mjs` (every drawing helper, the ten outlines, `FACE_PTS`, the warp, the head clip), `faces.mjs`, `colors.mjs`, `hair.mjs`, `outfits.mjs`, `face-parts.mjs`, `extras.mjs`, `expressions.mjs`, `legacy.mjs`, `index.mjs` (the axes). Every option is `{ id, sex?, weight?, flags…, draw(ctx, r, L) }` with a stable kebab-case id; the flags that used to live in `AV_SEXTAG`, `AV_RANDWEIGHT`, `AV_RANDNONE`, `AV_OUTFIT_COLORABLE`, `AV_NO_UNDERLAY`, `AV_SHORT_HAIR`, `_hatCovers` and the hat-hiding hair list are now on the part (`sex`, `weight`, `colorable`, `underlay`, `short`, `noHat`, `noHatDice`, `covers`, `hidesEyec`, `lashes`, `back`, `pattern`, `swatch`); the axes carry `def`, `crop` and `pNone`. `modules/ui/avatar-vector.mjs` (1540 → 300 lines) keeps only the layer pipeline (`_render`), the render context `L` (palette + landmarks), `avNormalize` / `avSanitize` / `avVisible` / `avRandom` / `avPartSvg` written generically over the catalogue, `avAxis` / `avPart` / `avEffective`. Recipes are **v3** (`{ v: 3, hair: 'pompadour', … }`); v1 (no `v`, ten-tone skins) and v2 (numeric) recipes are migrated through the frozen tables of `legacy.mjs` (`V2`, `V2_FACE`, `V1_SKIN`), the default face follows the silhouette, unknown ids fall back to the defaults. Rendering verified identical to `web.208` on 1642 portraits and 480 vignettes (every option on both silhouettes and five faces, defs order and unused gradients normalised). Expressions: axis `expression` (12: neutral, joy, anger, sadness, surprise, bluff, tilt, sleep, fear, love, win, ko) — a part sets `brows` / `eyes` / `mouth` and lists `fx` overlays (vein, tear, sweat, zzz, hearts, stars, dizzy) drawn over the hat; new eyes `shut`, `hearts`, `stars`, `x`, brows `raised`, `sad`, `worried`, mouth `wavy`; `avSvg(recipe, size, { expression })` overrides at render time for table reactions; the studio hides the brows / eyes / mouth rows while an expression is active (`avVisible`), `avSanitize` keeps their values. `modules/ui/avatar-studio.mjs`: rows iterate `ax.opts`, sanitising goes through `avSanitize`, the Face group shows the expression row. `modules/ui/avatar-photo.mjs`: emits ids (through `legacy.mjs`), `v: 3`. `modules/lang/*.mjs` (83): `avmExpression`. `public/sw.js`: the ten parts files precached, plus `avatar-photo.mjs` and `avatar-capture.mjs` which were missing (`test-precache` failed on them). `docs/AVATAR_PARTS.md`: how to add a part or an axis. `scripts/test-avatar-studio.mjs` rewritten on ids: 133 checks (catalogue introspection, every part on both silhouettes × three faces, migrations, expressions, studio rows).
- **Avatar toon portraits — seven skin tones, versioned recipes** (`web.207`, narmod) — after narmod: « enlever des teintes de peau et éviter trop noir car on ne voit pas les autres détails ». `modules/ui/avatar-vector.mjs`: `AV_SKIN` is seven tones light → dark (porcelain, light — still the default index 1 —, medium-light, tan, brown, dark brown, deep brown `#75482a`), dropping the very-light double and the two darkest (`#553219`, `#3d2412`) on which the new scars, bruise and tattoos were invisible. Recipes now carry `v: 2` (`AV_DEFAULT`, `avRandom`, `avNormalize` output, the photo recipe); a recipe without it was saved with the ten-tone palette and `avNormalize` remaps its skin through `AV_SKIN_V1` (0 → 1, 6 porcelain → 0, 7–9 → 6) before validating. `modules/ui/avatar-photo.mjs`: `P_SKIN` follows. `scripts/test-avatar-studio.mjs`: 117 checks.
- **Avatar toon portraits — face shapes per silhouette** (`web.194`, narmod) — `modules/ui/avatar-vector.mjs`: `_headD(k)` takes a face KEY `k = face + (feminine ? 3 : 0)` (`_faceKey(r)`), so the same three options draw six outlines: masculine oval with a firm jaw (cheeks ±55, chin flattened at y 153), wide round (±59, flat chin), square jaw (straight sides to y 118, flat chin); feminine oval tapering to the chin (±51, chin y 155), round (±56), and a heart (wide cheekbones ±55 narrowing to a pointed chin at y 156) in place of the square. Features keep their coordinates (eyes ≈ 94, mouth ≈ 133, chin ≈ 152–156), so eyes, nose, mouth, beards (jaw beards are the head outline clipped, grown), the hair underlay, the balding crown (hair 16) and the head clips all follow; `avSvg`, `avPartSvg` ('face', 'marks', 'hair', 'beard' vignettes) pass the key. `scripts/test-avatar-studio.mjs`: 92 checks.
- **Avatar « From a photo » — silhouette chosen before the photo** (`web.186`, narmod) — the framing panel (`modules/ui/avatar-capture.mjs`) gets a ♂ / ♀ radio row above the viewport, preset to the studio's current silhouette and handed back with the capture (`onResult(canvas, guide, sex)`); the studio analyses with that silhouette and `guessSex: false`, so the `web.185` guess (beard / lipstick / long hair) stays in the engine but is no longer used by the app. Reuses the `avmSex` label; `.avm-cam-sex` styles the chips on the dark backdrop.
- **Avatar « Create » tab — toon portrait style** (`web.176`, narmod) — `modules/ui/avatar-vector.mjs` redrawn in a friendlier cartoon style instead of the realistic bust of 2026-07-31: big round head, large eyes with iris and highlight, short rounded body, volume gradients (radial on the face, vertical on hair and clothes, per-render `<defs>` under the SVG's unique `avc…` prefix), pastel radial backdrops, double gold border kept. Every option of every axis was redrawn (26 hairstyles, 17 outfits, 10 hats, 7 beards, 7 eyes, 5 noses, 8 mouths, 6 marks, 6 glasses, 6 earrings, 3 face shapes); axis ids and option counts are unchanged, so saved recipes (`pth_avatar_vec`) re-open in the new style and avatars already uploaded are untouched. Crowned hats clip the hair above the hat line; the visor and the bandana leave it visible. The feminine silhouette adds lashes. The shoulder-accessory axis is retired: kept in `AV_AXES` for recipe compatibility, `avVisible('shoulder', i)` only accepts 0, so the studio hides the row. `scripts/test-avatar-studio.mjs` follows the new vignette frames and the hidden row.
- **Forum news: Events tab first, tab icons, server time** (`web.172`) — the Events tab comes first and every opening of the window lands on it (`openForumModal` resets `_tab`; without community content `_applyTab` still falls back to Posts). Both tabs get an inline stroke icon (calendar / newspaper, `currentColor`), their labels moved into their own `data-i18n` span so a language switch keeps the icon. The Events tab opens with the server clock line of the lobby status bar — `lobbyClockNow()` exported by `lobby-clock.mjs` (same `/__time` sync, same `lobby_clock` switch), formatted by `evClockText()`: « Server time (Berlin): 14:05 », plus « Your time » when the player's zone differs (event times are shown in the player's zone). Existing keys only; pinned in `scripts/test-forum-events.mjs`.
- **Lobby server clock: Berlin by default** (`web.168`) — `_lobbyClockTz()` now falls back to `LOBBY_CLOCK_TZ_DEFAULT = 'Europe/Berlin'` (the zone the QML client hard-codes) instead of the proxy host's own zone, which is unrelated to the PokerTH server. Order stays admin `lobbyClockTz` → `SERVER_TZ` → default; the admin option is renamed **Default (Europe/Berlin)**.
- **Lobby server clock — QML parity** (`web.167`) — follows upstream `f01d1db9` / `735a7930` (LobbyStatsBar shows the community server time): the clock now also requires the **community content** option (QML `showServerTime = showCommunityContent`), is followed by a ` | ` separator before the PokerTH.net link, and uses the QML labels — wide `Server time (Berlin): 14:05`, compact (< 900 px) `Berlin 14:05`, portrait clock icon + `14:05` — chosen by CSS media queries (`lcLabels()` in `modules/ui/lobby-clock.mjs`). The `/__time` source and the tap panel stay as web extensions.

### Added

- **Mascot — lobby reactions, friends, seasons** (`web.232`, narmod) — third batch. New `modules/mascot/acts-social.mjs` (precached). Reactions (`REACTIONS` in `plan.mjs`, never drawn at random): `window.mascotReact(kind)` in `index.mjs` plays `r-table` / `r-mail` / `r-bravo` right away (no idle wait) when the option is on, in the lobby only, at most once a minute per kind and not in the first 8 s after the lobby opens (the server sends the whole table list then); wired in `net/msg-lobby.mjs` (`onGameListNew`, mode 1 = created), `ui/pm.mjs` (`onIncoming`) and `game/stats.mjs` (LAN board: rank better than the last one shown for that sort, kept in `pth_mascot_rank_<sort>`). `r-table` turns and points at `#g-list` with a pulsing gold ring and « A new table! »; `r-mail` waves an envelope, « You've got mail! », then points at the private-messages button; `r-bravo` crown, confetti, jumps, « Well done! ». A reaction skips the greeting. Friends: `engine.mjs` `friend(kind, behind)` builds a second actor (same body; the King of hearts: K♥, crown, moustache, sword; the Joker: J in purple, new jester cap) and `refs()` gives the same handles; `walkWin` / `faceWin` / `bubble` take an optional actor. `duel` (the King walks in, both bow, stare-down with a tumbleweed rolling by, he charges sword high, the Ace answers with the BANG! flag, the King falls on his behind, they laugh and shake hands, he leaves) and `joker` (the Joker hides behind him, taps his shoulders — nobody there —, then BOO: the Ace jumps out of his skin, the Joker laughs and vanishes in a puff). Seasons: `seasonFor(date)` (Santa hat 1 Dec – 6 Jan, pumpkin 20 Oct – 2 Nov, beanie 7 Jan – end of Feb, sunglasses 21 Jun – 31 Aug) replaces a plain hat three times out of four; new hats santa, pumpkin, beanie, jester. Not done: a reaction to the online (PokerTH / BBC / WEC) rankings — the player's own row is not identified reliably there. `scripts/test-mascot.mjs`: 71 checks.
- **Mascot — eight scenes with props; five new bubble lines** (`web.231`, narmod) — second batch. New `modules/mascot/acts-props.mjs` (precached): `dealer` (two deck halves, riffle then a high cascade of flying cards, a fan held high, fumble: nine cards fly up and rain around him), `tower` (stacks twelve chips one by one, the tower sways more and more and collapses on him: flattened, stars), `felt` (unrolls a green mat with two cards and chips, sits, drums his fingers and taps his foot, looks around, « Anyone? », sighs, rolls it back up), `umbrella` (a rain cloud pops over him, follows him when he steps aside, the umbrella opens and the cloud moves next door, he closes it and it comes back), `selfie` (phone held high, three poses, « Cheese! », a flash that dazzles him, laughs at the photo), `bubbles` (blows small bubbles, then a big one grows around him and lifts him, heart eyes, pop, falls), `guitar` (strums with notes, head bobbing, foot tapping; a string snaps), `dance` (twist, disco pointing with the corners flicking through the suits, the splits with tears). New keys `mascotAnyone`, `mascotCheese` (used here) and `mascotTable`, `mascotMail`, `mascotBravo` (for the lobby reactions of the next batch) in all 83 catalogues; es-419 derived from es with one new reviewed rule (« ¡Patata! » → « ¡Whisky! », the photo word in Latin America). `plan.mjs` costumes (cowboy hat for the guitar, fedora for the dance). Test panel lists the new acts.
- **Mascot — six new gags: banana peel, bluff, ledge, hang, knock, push** (`web.230`, narmod) — first of three batches narmod asked for (« je veux bien tout ce que tu as proposé »). New `modules/mascot/acts-extra.mjs` (acts as `async (H, where)`, precached): `banana` (a peel pops up on his path, he walks along whistling, slips, full backflip, lands flat on his back with stars, the peel shoots away, he glares and shakes his fist), `bluff` (two cards held against his chest, side-eyes left and right, a chip stack appears, « All-in! » with shades and a shove, reveals 7♥ 2♣, sheepish grin, runs off the screen — the act sets `cur.gone` so the engine skips the exit), `ledge` (leaps onto a window / panel top and sits, legs swinging, whistling notes, looks down, hops down in front), `hang` (walks under a window, jumps and hangs from its bottom edge swinging — lean origin moved to his hands —, one hand slips, drops, dizzy), `knock` (walks up to the glass: grows ×1.45, knocks three times with rings, face squashed with fog, pops off and wipes the fog), `push` (walks to the nearest screen edge, pushes with everything he has, feet slipping with dust, red and shaking, gives up, wipes his brow, shrugs). `plan.mjs`: `ledgePlan`, `hangPlan`, `pickWith` (open windows first), `NEEDS` (climb / ledge / hang only when a panel allows it). `engine.mjs`: toolkit `H` handed to the acts, hand prop groups (`.mc-hl` / `.mc-hr`), body / back prop layers, `worldProp()` (page props in the Ace's scale), `clearProps()` after every act, side-eye faces (`el` / `er`), whistling notes FX. « All-in! » stays in English (poker action term). Test panel lists the new acts. `scripts/test-mascot.mjs`: 64 checks.
- **Mascot — smaller, plays on open windows, cowboy and skipping rope, suits that change** (`web.229`, narmod) — after narmod's screenshots. `plan.mjs`: size ~15 % of the short side, 70–140 px (was 17 %, 80–160). `climbPlan` gets a FRONT fallback when no side of the panel is reachable (a phone's home card is as wide as the screen, so the climb-and-fall always fell back to grimaces): he climbs its face with his back to us, walks to the edge and falls in front of it. `engine.mjs`: the overlay moves to z-index 395, above the floating-window band (300–390, `ui/z-order.mjs`) and under game animations / toasts / modals; `panelRects()` adds the visible `.floating-win` cards, which climb / peek / magic prefer. `index.mjs`: an open floating window (or the music / hands panel) no longer stops him — only a modal, menu or page does, via the new read-only `openSurfaces()` in `ui/keynav.mjs` (`window.keynavOpenSurfaces`). Face: the centre spade is gone; the corner index is one of four suit groups (♠ ♥ ♦ ♣, red letters for ♥ ♦) switched by `suitWin()`; new face parts heart eyes (`eh`), tears (`et`), teeth (`mg`), red flush (`fl`). Grimaces run 8 faces — wink, cross-eyed, love (beating heart eyes, ♥ corners), anger (flush + shake, ♣), tears (♦), big grin (corners flick through the four suits), dizzy, smile. New acts `pistol` (cowboy hat; quick draw with a double twirl, aim, a « BANG! » flag pops out of the barrel, droops, sheepish shrug; the flag text is un-mirrored when he shoots to the left) and `rope` (a yellow rope drawn behind him on the upper half of its turn and in front on the lower half; six jumps, four faster ones, then he trips and goes flat with stars). Test panel: z-index 393, the new acts, hat and tool. `scripts/test-mascot.mjs`: 58 checks.
- **Mascot — hidden test panel** (`web.228`, narmod) — no more waiting for the 45 s idle timer to see an act. New `modules/mascot/panel.mjs`, loaded on demand by `index.mjs` through `?mascot=panel` or `mascotPanel()` in the console (never linked from the UI): one-tap buttons per act (and Peek), selects for entry / action (incl. « greeting only ») / exit / hat / tool (each « auto » by default), speed ×0.25–×2, 🎲 all-auto, ■ stop, loop (chains appearances, 700 ms apart); the resulting sequence is shown (and whether a panel was found to peek from / climb). Draggable, can be minimised; settings kept in `localStorage` (`pth_mascot_panel`); sits under the Ace (z-index 240 < 250) and fades while he plays. While it is open the idle timer is off, and taps inside it do not dismiss the Ace (taps elsewhere still do). `engine.mjs`: `appear()` takes `hat`, `tool`, `speed` (every animation's `playbackRate` and every wait scaled) and `action: 'none'`; exports `CATALOG`; the returned sequence carries `peekable` / `climbable`. English only (developer tool, like the admin page). Precached; `scripts/test-mascot.mjs`: 55 checks.
- **Mascot — smaller, hello from a window's top edge, nap and juggling** (`web.218`, narmod) — `modules/mascot/plan.mjs`: size ~17 % of the short side, 80–160 px (was 20 %, 96–190). New entry `peek` (`peekPlan` / `pickPeek`: a panel at least 1.4 × his width with room above its top line): the overlay is clipped under the panel's top line (`clip-path: inset()`), so the Ace pops up behind the panel, looks left and right, waves « Hi! », then either ducks back down (new exit `duck`, a short visit with no action, ~45 % of peeks) or climbs over, stands on the panel and jumps down in front of it (`hopDown`, dust on landing) before his act. New actions `sleep` (yawn, sits down, nodding head with rising zZz, wakes with a start; new nightcap hat and sleeping eyes) and `juggle` (three poker chips in a shower pattern, then « Ta-da! »). No new i18n key. Preview `?mascot=peek|sleep|juggle`, console `mascotDemo('peek')`. `scripts/test-mascot.mjs` extended.
- **Animated mascot « the Ace »** (`web.217`, narmod) — web extension, OFF by default (Advanced options › User interface › Appearance, `pth_mascot`). New module `modules/mascot/`: `index.mjs` (always loaded, tiny: 45 s idle timer, then at most once every 3 min; only `#s-connect` / `#s-lobby`, never at a table; skipped while a window is open — new read-only `hasOpenSurface()` in `ui/keynav.mjs` —, tab hidden, Reduced effects, prefers-reduced-motion, live embed; any pointer / key / wheel input dismisses him in a puff), `engine.mjs` (imported on first appearance only: SVG card with limbs, front = ace of spades with 14 face parts, back = PokerTH chip with a 3D flip; hats top hat / wizard / crown / helmet / fedora, tools wand / scepter / sword / cane; entries door / puff / edge, greeting, actions moonwalk, climb-and-fall on a real panel with squash-and-stretch splat, magic teleport, king, knight, grimaces; exits door / puff / edge — all Web Animations, no library), `plan.mjs` (pure geometry: size ~20 % of the short side, 96–190 px; climbable panel choice; sequences). Preview: `?mascot=1` or `?mascot=<action>`, console `mascotDemo()`. 5 new keys in the 83 catalogues (es-419 derived). `scripts/test-mascot.mjs`.
- **Avatar toon portraits — starter characters, lot 3 (the fun ones)** (`web.215`, narmod) — after narmod asked for more characters, « plutôt fun marrant ». `avatar-parts/presets.mjs`: fish (expression fear, chip badge), maniac (bed head, tilt), surfer (hawaiian shirt, playful), granny (white braided bun, gold round glasses, pearls, cardigan), grandpa (senior sweep, moustache, pipe, vest), tycoon (balding, monocle, cigar, tux, stack), clown (blue curls, red nose, laugh, clown suit), tourist (bald, panama, sunglasses, hawaiian shirt), ninja (balaclava, narrowed eyes), king (pompadour, sunglasses, rhinestone jumpsuit, dice) — 30 presets. New parts: `face-parts.mjs` nose `clown` (red ball, dice weight 0.12); `extras.mjs` hat `balaclava` — built on the outline (`_headScaled` ×1.12 / ×1.05, `data-fit`, evenodd eye slit 69–131 × 89–105, neck piece) with the new engine flag `hideHair: true` (`avatar-vector.mjs`: `clipHair` returns nothing, the head is wrapped so no hair shows beside or under it); `outfits.mjs` `hawaiian` / `hawaiian-f` (teal, hibiscus print via `hibiscus()`, open collar), `clown-suit` / `clown-suit-f` (yellow, polka dots, ruffled collar, giant red bow, pompom buttons), `vegas-jumpsuit` (white, deep V, flared collar edged with rhinestones, gold belt) — 59 outfits, 22 hats, 6 noses. Labels `avmPreFish` … `avmPreKing` in the 83 language files. `scripts/test-avatar-studio.mjs`: 143 checks. `docs/AVATAR_PARTS.md`: `hideHair`.
- **Avatar toon portraits — starter characters, lot 2** (`web.211`, narmod) — `modules/ui/avatar-parts/presets.mjs`: detective, magician, vampire, witch, chef, sailor, popstar, rapper, boxer, streamer (20 characters). `extras.mjs` hats 16–20: headphones (band over the hair, cups on the ears — leaves the hair), witch hat (bent tip, purple band), chef's toque (pleated), sailor cap (white « bachi », navy band, red pompom), headset mic (thin band, ear piece, boom to the mouth — leaves the hair). `outfits.mjs` 43–53, in pairs where both silhouettes make sense: trench coat (double-breasted, belted, dark shirt), cape (high collar rising beside the neck, red lining, gold clasp), breton top (navy stripes, crew / scoop neck), chef's jacket (stand collar, two rows of buttons), sequin dress, tracksuit with white piping and a gold chain (spade pendant), boxing robe (shawl collar on a bare chest, white belt) — the trench, cape, sequin dress, tracksuit and robe are colourable. `face-parts.mjs`: mouth `pipe` (stem, bowl, smoke), mark `wart`. `modules/lang/*.mjs` (83): `avmPre*` (10). `scripts/test-avatar-studio.mjs`: 141 checks.
- **Avatar toon portraits — starter characters, three expressions, unlock plumbing** (`web.210`, narmod) — after narmod picked the « presets » and « starter characters » ideas and asked for options to be earnable « à terme ». `modules/ui/avatar-parts/presets.mjs` (new, precached): ten archetypes `{ id, label, recipe }` — godfather, cowboy, diva, shark, dealer, pirate, rocker, geek, queen, pro — whole v3 recipes coherent with their silhouette (the test normalises, sanitises and renders each). `modules/ui/avatar-studio.mjs`: a first group « Characters » (🎭, `presets: true`) renders them as portrait cards (`avSvg` 72 px + name, `.avm-preset`); tapping one loads the recipe; six steps now. `expressions.mjs`: `proud` (raised brows, closed eyes, smirk), `bored` (heavy lids, flat mouth), `playful` (wink, tongue) → 15. Unlocks: a part or a preset may carry `unlock: '<requirement id>'`; `avLocked(axis, id)` / `avPresetLocked(id)` read `window._avUnlocks` (array, Set or function) — locked options stay visible but greyed out with a lock (`.avm-locked`), a tap shows the « To unlock » toast, the dice skips them, saved portraits still render them; nothing is locked today. `avatar-vector.mjs`: `_migrate` kept string ids of unversioned recipes for every axis except the skin (dropped) — fixed. `modules/lang/*.mjs` (83): `avmGrpPresets`, `avmLocked`, `avmPre*` (10). `pokerth.css`: preset cards, locked chips. `docs/AVATAR_PARTS.md`: characters and unlocks. `scripts/test-avatar-studio.mjs`: 139 checks.
- **Avatar « From a photo » — eyebrows, long beard, felt backdrop** (`web.207`, narmod) — `modules/ui/avatar-photo.mjs`, guided and free modes with both pupils: (1) brows — in the band 0.12–0.62 E above each pupil, every column's dark run (< 72 % of the lit skin, not skin) whose centre is nearest the expected brow height (0.35 E) is the brow, kept when 2.5–35 % of E long (a fringe is longer) and found on ≥ 60 % of the columns; from the inner and outer quarters, the middle third and the median thickness: both inner ends lower than the outer by > 0.12 E → angry V (1); heights over their own pupils (tilt-proof) differing by > 0.16 E → one raised (2); thicker than 0.15 E → thick (3); thinner than 0.06 E with the middle riding > 0.05 E above the ends → thin arched (4, feminine — neutral on a man); two "brows" more than 0.25 E apart are not a pair (hair or a shadow on one side) → neutral; (2) long beard — on a bearded guided face, the zone 0.05–0.6 E below the oval bottom (±0.2 fw) must be ≥ 60 % beard-dark, within 16 ΔE of the chin's dark colour, < 30 % skin and grainy (std ≥ 4) while the zones beside the face stay < 35 % dark (a dark garment fills them too and is smooth) → beard 6; (3) backdrop — a green corner (hue 80–170, sat ≥ 0.3, l 0.12–0.55) → the green felt (11), a saturated deep red one (sat ≥ 0.45) → the burgundy felt (12). `debug.browsDbg`. `scripts/test-avatar-studio.mjs`: 123 checks (painted angry / thick / flat brows, a grainy mass below the oval, a green backdrop); the real-photo benches keep neutral brows and their backdrops.
- **Avatar toon portraits — poker / « meaner » catalogue, lot 3: backdrops, badge axis, eyes, piercings** (`web.206`, narmod) — `modules/ui/avatar-vector.mjs`: `AV_FELT` 11–14 are patterned backdrops drawn by `_bgPattern()` over their gradient (a chip stack beside the shoulder on green felt, gold suits at 30 % on burgundy felt, a card back — white margin, red inside, lattice clipped to it —, neon lines on purple); their studio swatch is a CSS gradient (`AV_BG_CSS`, returned by `avSwatch`). New axis `badge` (last, optional): `_badge(i)` pins a token in the bottom-left corner over everything — dealer button (« D »), red chip with edge marks, pair of aces (two `_card`s), two dice, a four-colour chip stack; `AV_CROP.badge`, `avPartSvg('badge')`, dice 80 % none. Eyes 7–9: scarred shut left eye (flat lid + pale scar, lashes only on the open eye), bloodshot (pink sclera, veins, dark circles — `_eye` takes a sclera colour), side glance (irises shifted 3.5 px under heavy lids — `_eye` takes an iris shift). Mouths 13–14: toothpick, wide grin with a gold tooth. Earrings 6–7: skull studs on both lobes, gold ring on the right brow (`BROW_RING`, drawn after the brows) — both shared with the masculine silhouette, so the Extras step shows the row to men again (3 options). `modules/ui/avatar-studio.mjs`: badge row in the Extras group. `modules/lang/*.mjs` (83): `avmBadge`. `scripts/test-avatar-studio.mjs`: 116 checks (20 axes).
- **Avatar toon portraits — poker / « meaner » catalogue, lot 2: outfits and hats** (`web.205`, narmod) — `modules/ui/avatar-vector.mjs`: `_suit(kind, x, y, s, fill)` draws a spade / heart / diamond / club glyph and `_card(x, y, w, kind, red)` a small playing card, for every poker motif to come; `_mapD(d, X, Y, RX, RY)` generalises the path-data mapper `_warp` used (`_headScaled(k, sx, sy, cx, cy)` gives the head outline scaled as path data). Outfits 33–42, in masculine / feminine pairs so the « one silhouette per outfit » rule holds: dealer vest over a white shirt with bow tie and sleeve garters (black / burgundy), « Royal Flush » tee with five cards fanned on the chest (crew / scoop neck), white shirt / V-neck blouse scattered with the four suits, pinstripe suit with a red tie and pocket square / pinstripe blazer, biker leather vest with a spade patch over a tee / a red tank; the vests, tees, suits and biker tees are colourable. Hats 10–15: hood up — its opening is the face outline grown (1.17, 1.15) around (100, 108) as an even-odd hole, so it hugs every face, the hair shows inside it (`_hatCovers` false), a dark inside is drawn BEHIND the hair and head (`_hatBack`), it lies on the shoulders round a chest cut-out, `data-fit` so it is not warped; black stetson; top hat (masculine); black cap with a spade; fedora with an ace of spades tucked in the band; crown that sits on the hair without covering it. Dice: the hood, top hat and crown rare. `scripts/test-avatar-studio.mjs`: 111 checks.
- **Avatar toon portraits — « meaner » catalogue, lot 1: eyebrows axis, eye patch, sneer, scars** (`web.204`, narmod) — after narmod asked for a pirate eye patch and « other things that look meaner or more vicious ». `modules/ui/avatar-vector.mjs`: new axis `brows` (5 shapes, after the eye colour, no « none »; `AV_DEFAULT.brows = 0` so every saved recipe keeps its former fixed brows): `_brows(i, colour, fem)` draws neutral (the former strokes), an angry V (inner ends down on the lids), one raised brow, low thick brows (7.2 / 5.5 wide) and thin arched brows (feminine tag). Glasses 6–8: eye patch over the right eye with its strap across the forehead (drawn in the glasses layer, so over the front hair), monocle on a dashed gold chain (masculine tag), mirrored aviators (teardrop lenses, glare, gold frame — the eye colour row hides behind them like behind sunglasses). Mouths 11–12: sneer (lip curled up on one side, a canine) and gritted teeth. Marks 7–9: scar across the bridge of the nose, black eye (yellow rim + purple bruise under the eyes layer), tribal tattoo on the right temple placed from the outline's ear-level landmark (`_marks(i, sh, hw)`). Dice weights keep the striking options rare. `AV_CROP.brows`, `avPartSvg('brows')`. `modules/ui/avatar-studio.mjs`: the row sits in the Face group between eye colour and nose. `modules/lang/*.mjs` (83 files): `avmBrows`. `scripts/test-avatar-studio.mjs`: 106 checks (19 axes).
- **Avatar catalogue: bed head; beards and long curls redrawn** (`web.201`, narmod) — `modules/ui/avatar-vector.mjs`: hair 50 (masculine, `AV_SHORT_HAIR`) is a cap with an irregular crown of tufts (spikes of uneven height and lean) and three stray strands at the sides; hair 51 (feminine) a tousled mid-length mass with five short flyaway strands and a spiky crown. `hair` axis 50 → 52 (24 / 28). `BEARD_SHORT` / `BEARD_FULL`: the sideburn edge now starts at y 102–106 (ear-lobe level) instead of 90–96, which drew the full beard as a frame up to the eyes beside long hair; hair 30 (long curly, masculine) loses its side sausage curls for a wavy mass to y 164 with curls at the ends and two dark wave strokes. `scripts/test-avatar-studio.mjs`: counts updated (95 checks).
- **Avatar catalogue: 5 face shapes per silhouette** (`web.197`, narmod) — `modules/ui/avatar-vector.mjs`: `face` axis 3 → 5, face key `k = face + (feminine ? AV_FACE_N : 0)` (0–9): masculine 3 long rectangular (±50, straight sides down to y 122, flat chin at 155) and 4 rugged (cheekbones ±57 at y 96 narrowing in straight lines to an angular chin); feminine 3 long slim (±49, tapered chin at 158) and 4 soft diamond (cheekbones ±53 at y 96, small rounded chin); `HEAD_HW` extended to the ten outlines, so hair, hats, underlay, ears and beards fit them all (fit grid checked: 5 faces × 4 hairstyles × beards per silhouette). `modules/ui/avatar-photo.mjs`: guided mode maps a width ratio < 0.8 (face clearly narrower than the template oval) to the long shape (3). `scripts/test-avatar-studio.mjs`: 94 checks.
- **Avatar catalogue: 11 hairstyles** (`web.192`, narmod) — `modules/ui/avatar-vector.mjs`, `hair` axis 39 → 50. Masculine 39–43: short voluminous curls (a taller, wider mop with two rings of curls), side part with a wavy quiff (the top swept up and over to one side), fade (hair on top, the sides shaved down to two translucent scalp bands, no temple underlay), man bun (slicked back, a knot at the crown in the back layer — hats hidden like the other buns), long straight hair with a middle part. Feminine 44–49: curly ponytail (a tied cluster of curls behind one side), wavy lob (mid-length with waved edges), long curls with a curly fringe, low braided bun (a plaited knot at the nape, one side), short natural afro (a fuzzy outline of small curls), half-up (a topknot, the rest down). `AV_SEXTAG` 23 / 27, `AV_SHORT_HAIR` + 39 40 41 48, `AV_NO_UNDERLAY` + 41, dice weights 42 0.4 / 48 0.6. `modules/ui/avatar-photo.mjs`: a man's hair over the shoulders maps to 43 (long straight) instead of 27 (mid-length).
- **Avatar « From a photo » — zone-based hair in guided mode; 4 hair colours** (`web.189`, narmod) — `modules/ui/avatar-photo.mjs`: with the template, hair is no longer flood-filled from a seed row but read in ZONES the player's own framing defines. The crown band right above the oval top (0.03–0.45 ry, ±0.7 rx) is the hair by construction: its pixels clearly off the face colour (ΔE > 24, the larger of the darker / brighter groups, so a forehead shine never seeds white hair) give the hair centre `hairC`; without such pixels the band's median decides, blonde and light brown hair differing from the skin in chroma (Δab ≥ 6, or ΔE ≥ 12; 4 / 9 on the feminine silhouette, which is rarely bald) while a bald crown does not. A pixel is hair when nearer `hairC` than the face (or within 18), or a skin-coloured strand with hair texture (local std over 5×5 > 2.2 × the cheeks'). Side zones (1.03–1.38 rx, −0.3…+0.5 ry) and low zones (below the chin, clothes colour excluded) give the length; a hair-coloured top of the forehead (inside the oval, 0.05–0.22 ry) is a fringe → curtain fringe (31) for a mid masculine cut, straight fringe (34) for mid/long feminine hair. Bald = no hair colour and the centre band is skin (≥ 40 %), or a mostly-skin centre with < 30 % hair. Backdrop handling: a top corner whose colour fills ≥ 70 % of the band and has hair texture (median local std > max(6, 2.5 × the corner's)) is a big hairdo, not a wall; a band that is a DARK backdrop colour (L < 45) with no skin is read as hair of that colour (dark hair on a dark wall, crushed blacks — length stays unknown); a light wall above the head says nothing (default hair, never bald). `guide.valid` (new, from `avatar-capture.mjs`: the fraction of the 400 px frame a panned photo covers) keeps the plain fill around a photo out of every zone, and a crown band more than half outside the photo leaves the default hair. `P_HAIR` (photo palette) now lists what each swatch looks like as the median of real hair pixels (blonde in a photo is far less saturated than the drawn swatch) and gains the 4 new colours. The « volume » styles are never claimed in guided mode (the frame stops 0.45 ry above the hairline). `modules/ui/avatar-vector.mjs`: `AV_HAIRC` 8 → 12 (light brown `#9c7b52`, light red `#d2874f`, blue `#3b6fd6`, pink `#e88ac2`); brows and beards use dark brown on the two fantasy colours (`_hcNatural`); the dice draws blue / pink at 0.25 weight. `scripts/test-avatar-studio.mjs`: 85 checks (12 colours, natural brows on blue hair, guided bald / blonde / fringe / cut-photo synthetic faces).
- **Avatar catalogue, delivery 1: outfits, outfit colour, hairstyles** (`web.187`, narmod) — `modules/ui/avatar-vector.mjs`: outfits 17–32 (8 masculine: plain tee, polo, plaid shirt with a body-clipped grid, crew-neck sweater, denim jacket over a tee, tank top, striped football jersey, zip hoodie; 8 feminine: floral blouse, strap dress, pussy-bow blouse, tailored blazer, cardigan over a light top, sweatshirt, one-piece swimsuit, scoop tee) and hairstyles 26–38 (6 masculine: side part, mid-length, low ponytail, buzz cut as a scalp shadow, long curly, curtain fringe; 7 feminine: short bob, crown braid, straight fringe, very long straight, cropped, messy high bun, long locs), all tagged in `AV_SEXTAG` (now 18 / 21 hairstyles, 17 / 16 outfits), short ones in `AV_SHORT_HAIR`, the crown braid and high bun hat-less like the bun. New colour axis `outfitc` (`AV_OUTFITC`, 8 colours; option 0 = as drawn, shown as « Auto » — `avmAuto`, label `avmOutfitColor`, both in all 83 languages) applied through `_outfit(ctx, i, skin, oc)` to the garments in `AV_OUTFIT_COLORABLE` (the new plain ones plus the sweater, V-neck blouse, turtleneck, hoodie and scoop top; details derive from the colour with `_mix`). Helpers `_bodyClip`, `_crew`, `_collarFlaps`. The studio's Style group gets the colour row. `avatar-photo.mjs` maps clothes to a plain garment (hoodie / tee / open shirt, turtleneck / scoop tee) in the nearest outfit colour, mid-length hair to 27, a cropped feminine head to 36. Tests: 18 axes, 33 / 39 options, colour changes the tee and not the suit, catalogue split.
- **Avatar « From a photo » — silhouette guess** (`web.185`, narmod) — `modules/ui/avatar-photo.mjs`: beard and lipstick are now measured on every face (they were skipped on the other silhouette) and the sex-dependent mappings (hairstyle, outfit, beard, lipstick mouth) move to the end of the analysis; `sexGuess` = masculine on a real beard (≥ 3) or a strong moustache, feminine on lipstick or long hair (not bald, no cap), else null — the recipe carries `sex` only when guessed (`opts.guessSex: false` disables it), and the studio no longer forces the chosen silhouette over the recipe. Tests: no cue → no `sex`, synthetic beard → masculine, `guessSex:false` respected.
- **Avatar « From a photo » — guided framing** (`web.184`, narmod) — new module `modules/ui/avatar-capture.mjs`: a full-screen panel (`.avm-cam`, z-index 10050) with a square viewport and a face template (`AV_GUIDE` oval cx .5 / cy .44 / rx .24 / ry .31 of the square, eye line at 45 % of the oval, shoulders arc) over either the front camera (`getUserMedia` facingMode user, `playsinline muted`, preview and capture mirrored) or a photo the player pans / zooms with pointer events (drag, two-finger pinch, wheel; decoded ≤ 1400 px through `createImageBitmap`). Validation renders the viewport square on a 400 px canvas (`AV_CAPTURE_SIZE`) and hands it to the studio with the template; `avPhotoAnalyze(img, { guide })` then takes the face box from the oval (skin pixels inside the oval grown ×1.12 sideways and ×1.7 upwards form the face blob, so a bald crown stays in) instead of the skin-blob search. No camera or permission refused → photo mode, the switch button becomes the file picker; the stream is stopped on close, nothing is stored. The Create tab's 📷 button opens the panel in camera mode; a file from the hidden input (drag-and-drop, tests) opens it in photo mode. Eight i18n keys (`avmCamTitle`, `avmCamHint`, `avmCamHintPhoto`, `avmCamShoot`, `avmCamUse`, `avmCamGallery`, `avmCamCamera`, `avmCamDenied`) in all 83 languages; `cancelBtn` reused. Analysis tweaks for the framed square: sunglasses need a uniformly dark lens (no sclera highlight), teeth are bright AND grey (skin never is) with a lower grin threshold, the glasses rim test accepts a strong thin rim on both sides without a bridge, the skin L offset scales with how dark the photo is. `scripts/test-avatar-studio.mjs` opens / closes the panel in jsdom and runs a guided analysis on the synthetic face.
- **Avatar « From a photo » (beta)** (`web.181`, narmod) — new leaf module `modules/ui/avatar-photo.mjs` (no dependency, no model, no upload): `avPhotoAnalyze(imageData, {sex})` estimates a recipe from a photo with classic image analysis on a ≤ 220 px canvas — YCbCr skin segmentation minus the corner background → most face-like blob; pupil pair (dark spot brighter on both sides, best pair by height and distance) → the face box is rebuilt from the pupil distance (anthropometric ratios); bald when the bright skin blob climbs > 1.4 E above the eyes; hair colour from the hairline (Lab distance to the cheeks) and a flood fill through similar, non-background colours for length / volume / cap (saturated non-hair colour); glasses from dark frame pixels + dark nose bridge, sunglasses from two dark eye zones; mouth from the reddish lip band (width, curvature, teeth, opening, lipstick on the feminine silhouette); beard from a dark hair-like mass under the chin narrower than a shirt, moustache between nose and lip; background → nearest pastel; under-exposed photos are brightened first. `avPhotoRecipe(src, w, h, opts)` draws any CanvasImageSource first. The studio gets a 📷 « From a photo » button with a BETA badge (`.avm-beta`), decoding through `createImageBitmap` (Image() fallback), merging the estimated axes into the recipe (the silhouette is never guessed) and toasting `avmPhotoDone` / `avmPhotoNoFace`. Four i18n keys (`avmFromPhoto`, `avmBeta`, `avmPhotoNoFace`, `avmPhotoDone`) in all 83 languages. `scripts/test-avatar-studio.mjs` runs the analysis headless on a synthetic face (hair / bald / blank).

- **Login screen flourish** (`web.173`) — `public/modules/ui/login-flourish.mjs`: the ♠♥♦♣ row under the title hops in a wave each time the login screen is shown (after the boot splash fades, and on return from the lobby), and a click on the PokerTH chip tosses it like a coin. Since `web.174` the wave also replays after every 30 s idle on the login screen (reset by any click, tap or key press, paused while the tab is hidden). Web Animations only on existing elements (no DOM added); skipped under « Reduced effects » and `prefers-reduced-motion`.
- **Lobby server clock** (`web.128`) — the PokerTH protocol carries no server time, so the proxy now answers `GET /__time` → `{ now, tz }` (never cached, bypassed by the service worker). The zone is the one community events are announced in: admin setting **Lobby clock (players)** (`lobbyClockTz`), else `SERVER_TZ`, else the host's zone — nothing hard-coded. `modules/ui/lobby-clock.mjs` keeps a skew against the server instant (half round-trip corrected, re-synced every 10 min and when the page comes back), shows a chip in the LobbyStatsBar for pokerth.net sessions only, and a tap panel with the player's local time and offset. Advanced option and admin kill switch `lobby_clock`; guarded by `scripts/test-lobby-clock.mjs`.
- **Events tab: Champions of the day** (`web.127`) — the relay (`server/community-events.js`) now also reads `https://www.pokerth.net/pthranking/ranking/cod` (JSON) and ships the top three; the Events tab, now one card per category (`web.126`), opens with them as gold / silver / bronze medals linked to the official leaderboard.
- **Admin: Traffic period selector** (`web.123`) — `GET /admin/visits?days=N`
  (7–90, default 14, clamped in `visitPeriodDays`) sets one window for the
  daily series, `hourProfile`, `cohorts`, `langTrend` (N full days vs the N
  before), a new `period` tile with its previous-period reference, and new
  `envPeriod` / `musicPeriod` aggregates. The proxy now also stores a per-day
  environment dictionary (`bucket.ev`: os / br / combo / pwa) and the
  language × new/returning split (`bucket.lgn` / `bucket.lgr`), same caps and
  retention as `lg`. The page (`<select id="trafPeriod">`, remembered in
  `localStorage`) uses period data wherever a per-day history exists and
  falls back to the running totals otherwise, saying so in the section
  header. Section texts quote the selected period (`.perN`).
  `scripts/test-admin-period.mjs` (25 checks); layout/hours/lang-trend tests
  updated.
- **Admin: phone layout + touch charts** (`web.122`) — `.envrow` folds onto two
  lines under 600 px (name · count · trend / bar · "% new") so names are
  readable again; chart readouts stay put after a tap on touch screens and
  hide on the next tap outside the chart (mouse behaviour unchanged).
- **Admin: per-language trend arrow** (`web.121`) — in "Who visits › Language"
  each row ends with ↗ / → / ↘. The proxy adds `langTrend` to `/admin/visits`
  (per-language pings over the last 14 *full* days, ending yesterday, and the
  14 before, from the existing per-day `lg` series). The page compares the
  language's *share* of pings (denominator excludes header-less pings, i.e.
  bots; the "No language header" row keeps its share of all pings) with a
  two-proportion z-test: an arrow only when |z| ≥ 1.96, "→" otherwise, and
  nothing at all under 10 pings or until both windows are full. Tooltip
  shows both shares, raw counts and σ. `scripts/test-admin-lang-trend.mjs`.
- **Events tab: relative day plus date** (`web.114`) — `evWhen` appends the short
  date to the `Intl.RelativeTimeFormat` word, with the line's own neutral
  separator (a comma reads wrong in Japanese or Arabic): "today · 21 Sep ·
  23:15", "demain · 22 sept. · 01:00". Still all `Intl`, no new UI string.
- **Events tab: BBC sign-ups as `n/10`** (`web.113`) — the BBC calendar field `num`
  was checked against the site's own code and against
  `/registration/date/get/<id>`: it is the number of advance sign-ups, which the
  site labels "Players: n/10", not the attendance (played games list 10 players
  with 1–4 sign-ups). The relay now sends `seats: 10` with BBC entries and the
  tab prints `4/10`; entries without a table size (Monthly Cup) keep the
  translated "Signed up: {n}". No new UI string. The same endpoint returns the
  date in UTC, confirming the Europe/Berlin reading of BBC times.
- **Events tab: ranking leaders** (`web.112`) — `/api/events` gains a `leaders`
  array: the BBC season leader (`ranking-component :results` + `:season`) and
  the WEC leader of the month (`:stats` + `:stats_year` / `:stats_month`), each
  with points, games and two runners-up. The tab shows them in a third section
  titled with the existing `rankingTitle`; season / points / games reuse the
  ranking keys, the month comes from `Intl` — no new UI string. WEC was audited
  again (2026-09-21): it has no public schedule (every planning path is 404
  without a login, `/register` is the account form), so it contributes results
  and ranking only. `proxy.js` itself is unchanged, but
  `server/community-events.js` is loaded at start: container restart needed.
- **Forum news: "Events" tab** (`web.110`) — web addition, not in the QML
  client. A tab bar (`Posts` / `Events`, reusing `.rk-tabs`) sits under the
  window title; `Events` lists what `/api/events` returns: upcoming BBC step
  games and the next Monthly Cup with their sign-up count, then the latest
  BBC / WEC / Monthly Cup winner with the runners-up. Rows reuse the post list
  look (`.fn-row`, forum colour code) but are links to the community sites
  only (`evSafeUrl` whitelist). Times arrive as epoch ms and are rendered in the
  player's zone and UI language through `Intl` ("today" / "tomorrow" on local
  calendar days, month names) — no date strings to translate. The existing
  "Show community content (BBC / WEC)" option hides the tab bar, and the bar is
  hidden while a post is being read; "Mark all as read" only shows on `Posts`.
  New `public/modules/ui/forum-events.mjs` (precached), wiring in
  `forumnews.mjs`; 8 new keys in all 64 catalogues (`rankingStep` reused for
  "Step"), one help paragraph in all 64 corpora,
  `scripts/test-forum-events.mjs`.
- **Community events relay `GET /api/events`** (`web.109`) — web addition, not
  in the QML client; server side only for now, the "Events" tab of the Forum
  news window follows. One payload with what is coming up on the community
  sites and who won last: BBC step games with their sign-up count, the next
  Monthly Cup with its accepted players, and the latest BBC / WEC / Monthly Cup
  podium. None of these sites has an API: the data is read from the props of
  the Vue component each page renders (`registration-component`,
  `results-component`, `home-component` — the latter as Laravel
  `JSON.parse('…')` literals rather than HTML entities). Naive BBC/WEC dates are
  read as Europe/Berlin, the zone the Monthly Cup ISO dates carry. Parsing is a
  pure module, `server/community-events.js`, pinned by
  `scripts/test-community-events.mjs` against fixtures cut from the live pages;
  `proxy.js` only fetches (same User-Agent as the ranking relay) and caches for
  5 minutes, one upstream round for all clients. One site down never hides the
  others, and the route never answers 5xx. WEC has no public schedule, so it
  only contributes results. `proxy.js` changed: container restart needed.
- **Mobile magnifier: mini-board on "my turn"** (`web.91`) — web addition, not
  in the QML client. The QML "my turn" pan shows the lower half of the table,
  so the community cards sit on the upper edge with their index corners cut
  off. Pan and ×2 factor stay untouched; instead a small fixed copy of the
  board (70 % of the normal card size, 78 % with larger Interface sizes) is
  shown at the top of the table zone, outside the zoom layer, only while the
  loupe is active, it is the player's turn and a dealt card is out of view.
  Tap toggles the view between the real cards and the self box
  (`_loupeToggleBoard`). New `public/modules/ui/mini-board.mjs`; cards come from
  `cardToHtml` in a `.comm-row` context, so deck, four-colour suits, Interface
  size and High contrast apply as is; `aria-label` reads the board aloud
  (existing `communityCards` key — no new UI string). Help updated in all 64
  languages.
- **Offline mode: bot text banter** (`web.54`) — bots occasionally send a real (non-`[R]`) chat line matched to their archetype voice (rock/tag/lag/station/maniac) at key moments (table greet, big win, bad beat, uncontested steal, bust, tournament win/runner-up). New `public/modules/offline/banter.mjs` (key pools only, no text); i18n keys `bnt<Archetype><Kind><n>` shipped in `en.mjs`/`fr.mjs` first (`web.54`), then translated into the remaining 53 interface languages (`web.55`) — 140 keys per catalogue, parity-checked against English. Independent toggle `pth_bot_banter` (default on), capped at one line per hand (bypassed for the table-greet and end-of-tournament moments).
- **`/live` one expanded game row at a time** (`web.47`, requested by sp0ck)
  — expanding a table's detail panel now closes whichever other one was
  open, instead of letting several stack up at once.
- `/rules` and `/faq` translated into the 10 languages that still fell
  back to English (et, lv, sl, bs, mk, ms, sq, pa, am, km) — both pages
  now exist in all 55 languages and are advertised in hreflang and the
  sitemap (`web.43`).
- **Slovenian**, full UI catalogue, help corpus and SEO content pages
  (`web.5`–`6`) — 48 languages total.
- **Bosnian**, full UI catalogue, help corpus, SEO content pages and
  guest/registered/LAN broadcast notices (`web.9`–`10`) — 49 languages
  total.
- **Macedonian**, full UI catalogue, help corpus, SEO content pages and
  guest/registered/LAN broadcast notices (`web.11`–`12`) — 50 languages
  total.
- **Malay**, full UI catalogue, help corpus, SEO content pages and
  guest/registered/LAN broadcast notices (`web.13`–`14`) — 51 languages
  total. This completes the six-language rollout planned on 2026-09-11
  (et, lv, sl, bs, mk, ms).
- **Albanian**, full UI catalogue, help corpus, SEO content pages and
  guest/registered/LAN broadcast notices (`web.16`–`17`) — 52 languages
  total.
- **Punjabi**, full UI catalogue, help corpus, SEO content pages and
  guest/registered/LAN broadcast notices (`web.19`–`21`) — 53 languages
  total.
- **Amharic**, full UI catalogue, help corpus, SEO content pages and
  guest/registered/LAN broadcast notices (`web.22`–`24`) — 54 languages
  total.
- **Latin-American Spanish (`es-419`)**, a regional catalogue derived from `es`
  (computadora, celular, presionar, mouse, pozo…) with its help corpus and
  guest/registered/LAN notices and SEO content pages (`web.82`–`83`) — 62 languages total. The hreflang
  aliases of the Americas (`es-MX`, `es-AR`, `es-CO`, `es-CL`, `es-PE`, `es-VE`,
  `es-US`) now point at `es-419`, itself advertised as a page language, and
  `es-ES` at `es`. One catalogue for the whole region: the picker flag follows
  the visitor's country (`es-AR` → Argentina…, `/flags/<cc>.svg`), Mexico by
  default, and `es-<country>` browser locales of the Americas resolve to it.
  `es` is now labelled "Español (España)".
- **Language tooling** — `scripts/lang-tools/`: catalogue and help-corpus
  extraction/rebuild, parity check, wiring and a `\uXXXX`-aware language-count
  bump for the SEO tables. Replays the Uzbek rollout byte for byte (docs/tools
  only, no version bump).
- **Language tooling** — `seo-dump.mjs` / `seo-build.mjs`: step 3 is no longer
  done by hand. The SEO strings are extracted to a flat list and the entries of
  `seo-i18n/` and `proxy.js` are rebuilt from translation chunks, with path,
  token, tag and hand-name checks. Replays the Kazakh SEO commit byte for byte
  (docs/tools only, no version bump).
- **Language tooling** — `wire-language.mjs` now bumps the language count only
  where it stands alone: `65` also sits inside "365 days" (log retention) and
  inside `\uXXXX` escapes, which stopped the 65 → 66 rollout (tools only).
- **Language count audit** (`web.166`): every catalogue, help corpus and SEO
  table carries 83 (digits or spelled out in Arabic/Urdu). Two English
  strings in `proxy.js` had been stuck at 64 since the 64-language build —
  the `/glossary` intro ("every one of the 64 interface languages") and
  `/llms.txt` — because the count bump only matches "NN languages". Both now
  read `supportedLangCount()` (catalogue files on disk), so they can no longer
  drift. CONTRIBUTING.md updated (docs).
- **Traditional Chinese, Hong Kong** (`zh-HK`, file `zh-hk.mjs`), full UI
  catalogue, help corpus and guest/registered/LAN broadcast notices
  (`web.164`), then SEO content pages (incl. `/rules` and `/faq`, `web.165`; og `zh_HK`, hreflang zh-MO now points to zh-HK) — 83 languages total. `seo-build.mjs` now quotes region codes used as object keys (a bare `zh-HK:` broke the build).
  Derived from the Taiwan catalogue with Hong Kong vocabulary (用戶, 客戶端,
  網絡, 帳戶, 軟件, 網上, 帖子). Browsers set to zh-HK, zh-MO, zh-Hant-HK or
  zh-Hant-MO now get this catalogue instead of zh-TW; bare zh-Hant keeps
  zh-TW. Speech and translation targets map zh-hk like zh-tw. To be reviewed
  by a native speaker.
- **Mongolian** (`mn`, Cyrillic script), full UI catalogue, help corpus and
  guest/registered/LAN broadcast notices (`web.162`), then SEO content pages
  (incl. `/rules` and `/faq`, `web.163`) — 82 languages total. Hand and street names follow the
  Russian-derived poker vocabulary used in Mongolia (роял флэш, фулл хаус,
  префлоп), with Mongolian forms for the simple hands (гурвал, хоёр хос, хос,
  өндөр хөзөр); action terms stay in English. Terminology to be reviewed by a
  native speaker.
- **Arabic FAQ language count** (`web.161`): the spelled-out count in the
  Arabic `/faq` answer lives in `proxy.js` as `\uXXXX` escapes, so the plain-text
  replacements of the Yoruba → Turkmen rollouts missed it and it stayed at 76.
  Now 81; later rollouts must patch the escaped form as well.
- **Turkmen** (`tk`, Latin script), full UI catalogue, help corpus and
  guest/registered/LAN broadcast notices (`web.159`), then SEO content pages
  (incl. `/rules` and `/faq`, `web.160`) — 81 languages total. Hand and street names follow the
  Russian-derived poker vocabulary in Turkmen Latin spelling (roýal-fleş,
  full-haus, tern, riwer), with Turkmen forms for the simple hands (üçlük,
  iki jübüt, jübüt); action terms stay in English. Terminology to be reviewed
  by a native speaker.
- **Tajik** (`tg`, Cyrillic script), full UI catalogue, help corpus and
  guest/registered/LAN broadcast notices (`web.157`), then SEO content pages
  (incl. `/rules` and `/faq`, `web.158`) — 80 languages total. Hand and street names follow the
  Russian-derived poker vocabulary used in Tajikistan (роял-флеш, фулл-хаус,
  префлоп), with Tajik forms for the simple hands (сеягӣ, ду ҷуфт, ҷуфт);
  action terms stay in English. Terminology to be reviewed by a native speaker.
- **Kyrgyz** (`ky`, Cyrillic script), full UI catalogue, help corpus and
  guest/registered/LAN broadcast notices (`web.155`), then SEO content pages
  (incl. `/rules` and `/faq`, `web.156`) — 79 languages total. Hand and street names follow the
  Russian-derived poker vocabulary used in Kyrgyzstan, as in the Kazakh
  catalogue (роял-флеш, фулл-хаус, префлоп); action terms stay in English.
  Terminology to be reviewed by a native speaker.
- **Zulu** (`zu`, Latin script), full UI catalogue, help corpus and
  guest/registered/LAN broadcast notices (`web.153`), then SEO content pages
  (incl. `/rules` and `/faq`, `web.154`) — 78 languages total. As for Hausa and Yoruba, hand, street
  and action names stay in English. Terminology to be reviewed by a native
  speaker. `wire-language.mjs` now handles an anchor that is the last entry
  of a notice table (no trailing comma), as `zh-tw` is.
- **Yoruba** (`yo`, Latin script with tone marks), full UI catalogue, help
  corpus and guest/registered/LAN broadcast notices (`web.151`), then SEO content
  pages (incl. `/rules` and `/faq`, `web.152`) — 77 languages total. As for Hausa, hand, street
  and action names stay in English; the interface is in standard Yoruba with
  full diacritics. Terminology to be reviewed by a native speaker.
- **Hausa** (`ha`, Latin script with hooked letters), full UI catalogue, help
  corpus and guest/registered/LAN broadcast notices (`web.149`), then SEO content
  pages (incl. `/rules` and `/faq`, `web.150`) — 76 languages total. Hausa has no established
  poker vocabulary, so hand, street and action names stay in English (as in
  the Marathi catalogue). Terminology to be reviewed by a native speaker.
  `wire-language.mjs` now scopes the help-corpus count bump to the
  start.language section: at 75 the count collided with the WeCup scale
  (75 points) elsewhere in the corpus.
- **Esperanto** (`eo`, Latin script), full UI catalogue, help corpus and
  guest/registered/LAN broadcast notices (`web.146`), then SEO content pages
  (incl. `/rules` and `/faq`, `web.148`; `web.147` shipped only the count bump
  because the SEO build aborted on an invalid anchor) — 75 languages total. Hand names follow the Esperanto card
  vocabulary (vico, samkoloro, plena domo, kvaropo); action terms stay in
  English. Terminology to be reviewed by a native speaker.
- **Irish** (`ga`, Latin script), full UI catalogue, help corpus and
  guest/registered/LAN broadcast notices (`web.144`), then SEO content pages
  (incl. `/rules` and `/faq`, `web.145`) — 74 languages total. Hand names follow the Irish card
  vocabulary (sruth, dath, teach lán, péire); action terms stay in English.
  Terminology to be reviewed by a native speaker.
- **Welsh** (`cy`, Latin script), full UI catalogue, help corpus and
  guest/registered/LAN broadcast notices (`web.142`), then SEO content pages
  (incl. `/rules` and `/faq`, `web.143`) — 73 languages total. Hand names follow the Welsh card
  vocabulary (fflysh, syth, tŷ llawn, pâr); action terms stay in English.
  Terminology to be reviewed by a native speaker.
- **Basque** (`eu`, Latin script), full UI catalogue, help corpus and
  guest/registered/LAN broadcast notices (`web.140`), then SEO content pages
  (incl. `/rules` and `/faq`, `web.141`) — 72 languages total. Completes the languages of Spain next
  to Spanish, Catalan and Galician; hand names follow the Spanish tradition in
  Basque (eskailera, kolorea, pokerra, full); action terms stay in English.
  Terminology to be reviewed by a native speaker.
- **Nepali** (`ne`, Devanagari script), full UI catalogue, help corpus and
  guest/registered/LAN broadcast notices (`web.138`), then SEO content pages
  (incl. `/rules` and `/faq`, `web.139`) — 71 languages total. Hand and street names are
  transliterated as in the Hindi catalogue (रोयल फ्लस, स्ट्रेट, प्रि-फ्लप, रिभर);
  action terms stay in English. Terminology to be reviewed by a native speaker.
  The admin environment-key cap (`ENV_KEY_CAP`) goes from 90 to 120 so it stays
  20 codes above the number of translated catalogues.
- **Belarusian** (`be`, Cyrillic script), full UI catalogue, help corpus and
  guest/registered/LAN broadcast notices (`web.135`), then SEO content pages
  (incl. `/rules` and `/faq`, `web.136`; three glossary definitions that still
  held English words fixed in `web.137`) — 70 languages total. Hand and street names follow the
  Russian-style vocabulary in Belarusian spelling (флэш, стрыт, карэ, фул-хаўс,
  прэфлоп, тэрн, рывер); action terms stay in English. Terminology to be
  reviewed by a native speaker.
- **Armenian** (`hy`, Armenian script), full UI catalogue, help corpus and
  guest/registered/LAN broadcast notices (`web.133`), then SEO content pages
  (incl. `/rules` and `/faq`, `web.134`) — 69 languages total. Hand names follow the loanwords
  Armenian players use (ռոյալ ֆլեշ, սթրիթ, կարե, ֆուլ հաուս); action terms and
  street names stay in English. Terminology to be reviewed by a native speaker.
- **Azerbaijani** (`az`, Latin script), full UI catalogue, help corpus and
  guest/registered/LAN broadcast notices (`web.131`), then SEO content pages
  (incl. `/rules` and `/faq`, `web.132`) — 68 languages total. Hand and street names use the
  loanwords Azerbaijani players use (flaş, streyt, kare, full-hauz, tern);
  action terms stay in English. Terminology to be reviewed by a native speaker.
- **Sinhala** (`si`, Sinhala script), full UI catalogue, help corpus, SEO content
  pages (incl. `/rules` and `/faq`) and guest/registered/LAN broadcast notices
  (`web.119`–`120`) — 67 languages total. Hand names and action terms stay in
  English, as in the other South Asian catalogues; street names are
  transliterated (ප්‍රී-ෆ්ලොප්, ෆ්ලොප්, ටර්න්, රිවර්).
- **Kazakh** (`kk`, Cyrillic script), full UI catalogue, help corpus, SEO content
  pages (incl. `/rules` and `/faq`) and guest/registered/LAN broadcast notices
  (`web.117`–`118`) — 66 languages total. Hand and street names follow the
  Russian-style poker vocabulary Kazakh players use (флеш, стрит, каре, префлоп);
  action terms stay in English.
- **Georgian** (`ka`, Mkhedruli script), full UI catalogue, help corpus, SEO content
  pages (incl. `/rules` and `/faq`) and guest/registered/LAN broadcast notices
  (`web.115`–`116`) — 65 languages total. Hand names are translated and declined
  in running text; action terms and street names stay in English. Translated
  with ChatGPT from a spreadsheet kit, then checked mechanically (scripts,
  placeholders, label parity between help and UI) before the build.
- **Burmese** (`my`, Myanmar script), full UI catalogue, help corpus, SEO content
  pages (incl. `/rules` and `/faq`) and guest/registered/LAN broadcast notices
  (`web.87`–`88`) — 64 languages total. Action
  terms, street names and hand names stay in English, as in the other
  non-Latin catalogues; the language count is written in Myanmar digits in its
  own help corpus.
- **Uzbek** (`uz`, Latin script), full UI catalogue, help corpus, SEO content
  pages (incl. `/rules` and `/faq`) and guest/registered/LAN broadcast notices
  (`web.85`–`86`) — 63 languages total.
- **Icelandic**, full UI catalogue, help corpus, SEO content pages (incl.
  `/rules` and `/faq`) and guest/registered/LAN broadcast notices
  (`web.78`–`79`) — 61 languages total.
- **Gujarati**, full UI catalogue, help corpus, SEO content pages (incl.
  `/rules` and `/faq`) and guest/registered/LAN broadcast notices
  (`web.76`–`77`) — 60 languages total.
- **Kannada**, full UI catalogue, help corpus, SEO content pages (incl.
  `/rules` and `/faq`) and guest/registered/LAN broadcast notices
  (`web.74`–`75`) — 59 languages total.
- **Marathi**, full UI catalogue, help corpus, SEO content pages (incl.
  `/rules` and `/faq`) and guest/registered/LAN broadcast notices
  (`web.72`–`73`) — 58 languages total.
- **Malayalam**, full UI catalogue, help corpus, SEO content pages (incl.
  `/rules` and `/faq`) and guest/registered/LAN broadcast notices
  (`web.70`–`71`) — 57 languages total.
- **Telugu**, full UI catalogue, help corpus, SEO content pages (incl.
  `/rules` and `/faq`) and guest/registered/LAN broadcast notices
  (`web.67`–`68`) — 56 languages total.
- **Khmer**, full UI catalogue, help corpus, SEO content pages and
  guest/registered/LAN broadcast notices (`web.39`–`41`) — 55 languages
  total.
- **`/live` Players tab shows "Currently idle"** (`web.28`, parity with the
  old spectool's `PlayerListItem.vue`, requested by sp0ck) — a player seated
  and spectating nowhere now gets an italic green label where the
  Watching/Playing line would go, matching `pokerth/pokerth-live`'s wording
  and colour (`--pth-green`, mapped to our own `--green` var). English and
  French only for now; the other 52 languages fall back to the English text
  via the existing `t()` chain until translated.
- **`liveIdlePlayer` translated into all remaining 52 languages** (`web.29`)
  — closes the gap left by `web.28`; every UI catalogue now carries its own
  wording instead of falling back to English.
- **Chat notification-sound mute buttons, per panel** (`web.37`, requested by
  narmod) — a small bell icon next to the "Clear chat" trash icon in both the
  table chat and the lobby chat headers, flat/plain style matching the trash
  icon, greyed out when muted. Each panel has its own independent toggle
  (`pth_gamechat_snd_muted` / `pth_lobbychat_snd_muted`) — separate from the
  existing shared Advanced Options → Sound → "Lobby chat notification"
  setting (`PlayLobbyChatNotification`), which still governs both sounds by
  default. English and French only for now; the other 52 languages fall back
  to the English tooltip via the existing `t()` chain until translated.

### Changed

- **Champions of the day moved to the Ranking window** (`web.130`) — the podium now opens the PokerTH tab of the Ranking window (`#rk-cod`, above Season / search) and is gone from the forum news Events tab. `forum-events.mjs` exposes `evShowChampions` (same `/api/events` data and client cache); the ranking script flags the box with `data-on` for the PokerTH tab only and hides it on BBC / WEC / LAN / Trophies, re-checked when the fetch lands. Lower steps (38 / 26 / 18 px) in that window.
- **Events tab: Champions of the day as a podium** (`web.129`) — the three medals on one line become a small 2 · 1 · 3 podium: tinted steps with a gold / silver / bronze top border and the rank inside, a crown over the winner. DOM order stays 1 · 2 · 3; the podium order comes from CSS grid columns, so one or two champions still render in place. Light-theme variants for contrast.
- **Offline mode: bot text banter removed** (`web.107`) — the chat lines added
  in `web.54` were generic, repetitive and unrelated to the hand in progress,
  so the feature is withdrawn rather than kept half-good. Removed
  `public/modules/offline/banter.mjs`, its `sw.js` precache entry, every
  `_banter()` call site in `offline/server.mjs` and the `bnt<Archetype><Kind><n>`
  keys from all 64 catalogues. Emoji reactions (`[R]`) and chat keyword replies
  are untouched. The `pth_bot_banter` localStorage flag is no longer read.
- **Language catalogues load on demand** (`web.62`) — `modules/i18n.mjs`
  statically imported all 55 catalogues: a 56-request, ~5 MB module graph
  fetched by every visitor, in which a single flaky request failed the whole
  module and the ~50 modules importing it (top entry of the error journal:
  `Failed to load script /modules/i18n.mjs`, whose probe then answered
  HTTP 200 because the culprit was one of the imports). Only English is
  static now; the active language is fetched at boot, the others when the
  player switches, each with two cache-busted retries. If the active
  catalogue cannot be fetched the client starts in English without
  overwriting the saved choice. The boot splash waits for the catalogue
  (capped at 4 s), so there is no flash of English. New generated registry
  `modules/lang-meta.mjs` (code, label, direction, flag — 22 KB) feeds the
  picker and locale detection: **adding a language is now
  `node scripts/gen-lang-meta.mjs`**, no import to write. `loadAllLangs()`
  serves the tools that need the whole table (dev parity check,
  `seo-i18n/catalog-dump.mjs`). The service worker still precaches every
  catalogue, so switching language offline keeps working. Guarded by
  `scripts/test-lang-lazy.mjs`.

- **Avatar import hint and "Backup & reset" category** (`web.60`) — players
  believed avatars had to be pre-converted to 96×96 / 30 KB because the Import
  tab hint listed the internal output constraints; `avImportHint` now states
  that any image is cropped and resized automatically. The `advCatReset`
  category is relabelled "Backup & reset" (config.xml and full-backup
  import/export live there), and the help `where`/`cfgxml` sections, which
  still pointed at "Log messages", follow. All 55 catalogues and help files.
- **High Roller & Onyx-Pill aligned on the same generic avatar-placement
  mechanism as Boardwalk** (`web.53`, narmod) — the `html[data-seat-avatar="overlay"]`
  block in `pokerth.css` is generalised from a single fixed "above the bar"
  recipe into raw position slots (`--seat-avatar-top/bottom/left/right/
  transform`, same for hole-cards), so it now also covers an avatar
  anchored to a side and vertically centered (High Roller: left edge,
  Onyx-Pill: right edge) and centered, non-overlapping hole-cards
  (Onyx-Pill). Both packs' `style.css` now declare only their placement
  variables and decoration — no `position:absolute`/`bottom:`/`transform:`
  left to duplicate. No visual change; all three imported seat packs
  (Boardwalk included) now share one placement mechanism, making a future
  seat pack a matter of `seat.json` traits + colors, not layout code.
- **Boardwalk: avatar/hole-cards placement moved off hardcoded
  `position:absolute`/`bottom:` values onto a new shared, pack-agnostic
  mechanism** (`web.52`, narmod) — a `avatarOverlay` seat trait now drives a
  generic `html[data-seat-avatar="overlay"]` block in `pokerth.css`,
  parameterised by CSS custom properties (avatar size/gap, hole-card
  offset/rotation, plate margin) that a pack simply declares. Boardwalk's
  `style.css` keeps only its variables and decoration (colors, borders,
  glow tokens) — no visual change on screen. Pilot for aligning High
  Roller and Onyx-Pill the same way before they leave beta.

### Fixed

- **iOS installed app: stray band after reload** (`web.124`) — the `--app-h` viewport measurement now runs a 30 s long tail (every 2 s), on `visibilitychange` and on the first three taps/clicks, so a stale viewport after `location.reload()` is corrected without a rotation.
- **Music on iPhone: no more one-second play/stop loop with CarPlay /
  Bluetooth** (`web.111`). CarPlay, a Bluetooth route or the lock screen make
  iOS park the `AudioContext` in `interrupted` for as long as the external route
  holds the output, so an `<audio>` element captured by
  `createMediaElementSource()` plays into a dead graph. Two bugs turned that
  into a loop: `_rebuildWebAudio()` refilled its own budget on the `playing`
  event that every freshly rebuilt element fires, and the watchdog treated the
  normal `suspend` event ("enough buffered") as a transport failure. Now, on
  iPhone / iPad (`_isIOS`, iPadOS desktop UA included) the player uses a bare
  `<audio>` element by default — the only path iOS keeps alive there; the
  volume row and the VU meter are hidden since they need the graph, and
  play / pause fades are skipped. A new iOS-only checkbox in the player
  ("In-app volume", `musicIosVolume`, `pokerth.music.iosGraph`) opts back into
  the graph; switching it off tears the graph down from inside the click
  gesture (`_rebuildWebAudio(true)`). For the graph path: `suspend` no longer
  triggers the watchdog, the rebuild budget refills only after 10 s of real
  progress (`WA_REFILL_MS`), or on a user gesture / return to the foreground.
  Android and desktop are unchanged. One key in all 64 catalogues, one help
  paragraph in all 64 corpora, `scripts/test-music-ios.mjs`.
- **Eleven keys left in English in ~40 catalogues** (`web.108`) — `unitMinutes`,
  `gipTabStats`, `infoTypeLabel`, `infoCapitalLabel`, `buttonsAuto`,
  `pucksAuto`, `sectionPucks`, `buttonsGlossy`, `buttonsFlat`, `pucksCasino`,
  `presetCasino`: 387 values filled in. No new terminology: each value is built
  from what the SAME catalogue already says — `nMinutes` (so the grammatical
  form matches `unitHands`: genitive / partitive after a number in the Slavic
  and Finnic languages), `hlStatsTitle`, `piType`, `startCash`,
  `modeAuto` + `sectionTable`, `sectionButtons` + `D/SB/BB`; only the two
  adjectives and "(green) casino" were written per language. A value that was
  already translated is never touched (the ~20 recent catalogues had them).
  Full-width brackets in ja / zh, Cyrillic for sr. Slovak typo `hlHandPlur`
  `rák` → `rúk`.
- **Two lobby strings stuck in English** (`web.106`) — `lobby.mjs` wrote the
  literal `n + ' table(s)'` over the page's translated
  `<span data-i18n="tableCount">`, and the chat panel heading had no `data-i18n`
  (`chatTooltip` exists in every catalogue). Seen while checking Japanese.
  `test:i18n-overflow`: the create-table screen was opened with
  `show('s-create')`, which leaves the form out of the page — the test audited
  an empty screen; it now uses `App.openCreatePage()` and scrolls through the
  whole form.
- **Operator notices unreachable on iPhone** (`web.105`, reported by narmod) —
  the broadcast toast (`top: 16px`) and the restart notice (`top: 10px`) ignored
  `safe-area-inset-top`: in the installed app they sat under the status bar /
  Dynamic Island, close cross included, where no tap lands; the cross itself was
  a bare 17×20 px glyph. Both now start below the inset, are capped to the
  usable height (`100dvh` minus insets, internal scroll), get a 36 px sticky
  close target and `width: max-content` (a `left: 50%` fixed box only had half
  the screen to shrink-to-fit in). A broadcast under a restart notice is placed
  below the notice's real bottom edge (it was a fixed 76 px, right for one line
  only). The four notice windows (welcome, guest, account, LAN): backdrop padding
  includes both insets and the card is `max-height: min(84vh, 100%)` — `84vh`
  alone is the LARGE viewport on iOS, the button could end under the toolbar.
  Insets exposed as `--pth-sat` / `--pth-sab`. New `test:notices-browser`.
- **14 px of felt lost under the self box in phone portrait** (`web.104`) — the
  space kept under the table (`.game-area` padding-bottom, measured by
  `updateBottomLayout`) was measured once, BEFORE the first `renderSeats` sets
  `data-abar="portrait"` and compacts the action bar (139 → 125 px), and never
  again: 139 px kept for a 125 px bar during the whole game, until something
  else (opening the bet keypad) forced a new measure - hence the table that
  "did not come back" by 12–14 px. `renderSeats` now calls
  `updateBottomLayout` when the attribute CHANGES (once per orientation, not per
  render; the existing `_cur !== _res` guard prevents any loop). `test:mobile`
  checks reserve == bar height and restores the strict 2 px keypad round trip;
  verified by mutation.
- **Bet keypad cut off on landscape phones** (`web.103`, reported by narmod) —
  on touch screens the keypad replaces the action rows in place (~275 px: head,
  4×4 grid of 42 px keys, foot); a landscape phone has ~330 px under the header
  and the table keeps 160: OK / Cancel were below the screen. Under
  `max-height: 500px` landscape it lies flat (head + Cancel/OK on one line, the
  twelve keys on one line, the quick amounts below; 32 px keys, 29 px under
  360 px), the amount + slider row is hidden meanwhile. Image themes: the
  9-slice key image does not survive a 32×40 px key, the digit keys use the
  plain key style there. `bet-keypad.mjs` now re-renders the seats on open /
  close so the player's own box stays visible above the taller panel (it only
  happened by itself in portrait). New check in `test:mobile`.
- **Login card off-centre on iPhone** (`web.102`, regression of `web.97`,
  reported by narmod) — the in-flow footer reserved a flat 48 px for the header
  (82 px on an iPhone: 38 px bar + status-bar inset) and stacked its own
  safe-area padding on the screen's 20 px (54 px under the footer instead of
  34). Top reserve = real header height + 14 px, bottom = `max(10px, inset)`
  once; `test:mobile` now checks the centring with and without emulated insets.
- **Action bar inert while the link is down; notice stuck on my own turn**
  (`web.101`) — `_showBanner` now sets `body.conn-lost` while the socket is not
  open (CSS: action grid greyed out, `pointer-events: none`, no height change);
  it follows the *socket*, not the notice, so the bar is live again from the
  retry socket's `onopen` — after a rebind on the player's own turn the server
  says nothing more and every greyed second would come off the thinking time.
  For the same reason the "re-authenticating" pill, only ever hidden by the next
  server frame, stayed over the community cards for the whole turn: the 10 s
  "connection is stable" timer now hides it too. Scenario D of
  `test:reconnect-browser`, verified by mutation.
- **Reconnection, found by the new `test:reconnect-browser`** (`web.100`) —
  after the last failed attempt the app did `show('s-connect')` +
  `setStatus(reconnFailed)`, but the status line only exists inside the login
  *form*: the player thrown out of his table landed on the mode picker with no
  explanation at all. Both give-up paths now also open the "Connection lost"
  window (`_connLostShow`, the one used for server-side rejections, QML
  parity). The first attempt displayed `(1/3)` while every following one, led by
  `_reconnectContinue`, displayed `(n/6)`: the label now reads `/6` from the
  start; the policy itself (6 attempts, 5 s then 6·12·24·30·30 s, rebind-first)
  is unchanged.
- **Pot badge against the top box in compact landscape** (`web.100`) — the QML
  centres the card ROW; the pot badge still draws above it, leaving 3–5 px
  under the top box against ~25 px below the cards on a 200 px-high zone: with
  Safari's font metrics the box covered the pot (WebKit table sweep, heads-up).
  In compact landscape the pot+cards BLOCK is now centred between the top box
  and the self box (shift down, capped at 14 px, never up): ~15 px on each side.
- **Update banner squeezed on phones** (`web.99`) — `#update-banner` is
  `position: fixed; left: 50%`: a fixed box only has half the screen to
  shrink-to-fit in, so "New version available" wrapped onto three lines beside
  the button. `width: max-content` (still capped by `max-width`). Found by the
  new `test:pwa-browser`.
- **Short-landscape bet panel, language-independent** (`web.98`) — first WebKit
  run of `test:i18n-overflow`: in et / km / lv / mk the play-mode `<select>`
  label is long, Safari sized the grid's `auto` column on it and the slider slid
  under the 1/3 button. The select wrapper has a fixed 104 px width (label
  ellipsised) and the left column a 170 px floor.
- **Text overflow on narrow phones, found by the new `test:i18n-overflow`**
  (`web.97`) — (1) phone portrait: `Raise $2,990` was wider than its button in
  every language at 360 px (last digit cut); the amount now sits on a second
  line, as the QML client does in portrait (Bible §5.1) — the web only did so
  on desktop; (2) the `Create a table` / `Privacy` screen title, centred
  absolutely with `max-width: 60%`, was written across the forum and ranking
  buttons in every language — below 560 px it joins the header flex flow, on
  up to two lines; (3) the login footer (credits, Discord / site / GitHub),
  pinned to the screen bottom, was covered by the tall Internet login card on a
  360×780 phone — on phones it follows the card and the screen scrolls, the
  card clears the 39 px header bar; (4) `<label>Password</label>` of the login
  form had no `data-i18n` (key `passwordLabel` already in every catalogue).
- **Safari follow-up of `web.94` / `web.92`** (`web.96`) — the WebKit CI run
  still failed the seated iPhone-landscape tables that Chromium passed: the
  diagnostics showed a 105 px action panel (86 in Chromium) — the quick-bet
  group wrapped back to its own line beside Safari's wider native controls. The
  short-landscape panel is now a 2-column **grid** (cannot wrap) instead of a
  wrapping flex row. Mini-board: it re-places itself on the layer's
  `transitionend`, not only on a 280 ms timer (on a slow device the pan was
  still running and it ended up over the hole cards).
- **End of hand, found by the new `test:showdown-browser`** (`web.95`) —
  `renderGameWaiting('Prochaine main...')` was a hard-coded French string in
  every language (now `t('nextHand')`, key already in all catalogues); a loss
  in the winner window and the end-of-game summary read `$-20` (`'$' +
  _groupThousands(negative)`), now `-$20`; on a 343 px-high landscape screen the
  winner window's fixed parts (header, stats, board, best hand) were taller than
  its `88dvh` box, the scrollable results list got 0 px and **Continue** fell
  below the fold — under `max-height: 400px` landscape the whole card scrolls
  and Continue is sticky.
- **Very short landscape phones (734×343)** (`web.94`) — three defects found by
  `test:mobile` / `test:table-sweep`: (1) `.game-area` kept a 300 px
  `min-height` flex fallback, so header 59 + 300 overflowed a 343 px screen and
  Fold / Check / Bet were cut off; (2) the action panel took 118 px and left the
  table 166: the seat bisection sat on its 0.55 floor and still overlapped
  (boxes at 9–10 players, pot badge under the top box) — under
  `max-height: 400px` landscape the amount+slider row and the quick-bet /
  All-In / mode row now share one line in a wider panel (every control kept,
  standard Interface size only), the table gets ~40 px back; (3) compact
  landscape **spectator** with 3–4 players had no height bound: boxes grew to
  ~1.0–1.15 and covered the community cards and the pot (also on 1040×480) —
  new web cap in `layout.mjs`, box ≤ 30 % of the zone height, the counterpart
  of the seated "self ≤ 28 %" cap. Table sweep: 90/90.
- **Pucks over the neighbouring box in portrait** (`web.93`) — with 3 or 5
  opponents (TL · TC · TR) the box scale only tests ring neighbours, so TL and
  TR grow until they almost touch and both push their puck into the gap: BB on
  the other box, D hidden under BB, the top-centre puck on TR's corner. New
  `public/modules/game/puck-dodge.mjs`: after the seats are in the DOM, a seat
  whose puck group collides (another box, a community card, another puck, the
  zone edge) moves to the first free side of a short list - default side first,
  so nothing changes where there is room; seat geometry untouched. Found by
  `npm run test:table-sweep` (4 and 6 players, seated and spectator, every
  portrait phone); unit test `scripts/test-puck-dodge.mjs`.
- **Mobile magnifier: mini-board over the player's own cards** (`web.92`) — on
  short landscape phones (iPhone 15 landscape, 734×343) the magnified self box
  reaches the top of the zone and the centred mini-board sat on the hole cards.
  It now docks beside the self box (right, else left, else hidden). Found by
  the new `npm run test:mobile` on its first CI run (WebKit and Chromium alike).
- **Mobile magnifier: self box off-screen on "my turn"** (`web.90`) —
  `renderSeats` anchors the self box on the felt centre, measured with
  `getBoundingClientRect()`; `.felt-oval` sits inside `#g-zoom-layer`, so under
  the loupe the measure included the ×2 scale and the current pan: the self box
  landed at `left = W/2 + panX` (0 px or W px after following a side seat) and
  the "my turn" pan showed empty felt. The felt rect is now un-transformed
  through the layer's own rect (exact even mid-transition). Latent since the
  loupe port; masked until `web.89` by the counter-transform.
- **Mobile magnifier: self box inside the zoom layer** (`web.89`) — QML parity
  fix. The official client keeps the self box *inside* `zoomContent`
  (`GamePage.qml`, already true in 2.1.4); the web client counter-transformed
  it to stay pinned at ×1 (from an inaccurate early reference), so it floated
  over a ×2 ring — odd overlaps in portrait, and the "my turn" pan showed no
  enlarged self box. The counter-transform is gone: the self box is magnified
  and panned with the ring; only the action bar stays fixed. Help text updated
  in all 64 languages; `scripts/test-loupe-reanchor.mjs` asserts it.
- **`es-419`: one string escaped the derivation** (`web.84`) — `timeoutWarnHint`
  is stored with `\uXXXX` escapes in `es.mjs`, so the source-level substitution
  missed it. The rule list now lives in `scripts/es-419-rules.mjs` and
  `scripts/test-es-419-derivation.mjs` checks, on evaluated strings, that the
  `es-419` catalogue and help corpus are exactly `derive(es)` — a key added to
  `es` and not carried over fails the suite.
- **Translation backlog of the private-message feature closed** (`web.81`) —
  the help section `chat/privatemsg` existed in 18 corpora only and the
  catalogue key `chatMuteTitle` in 9 catalogues only; the help loader falls
  back per file, not per section, so 43 languages simply had no such chapter.
  Both are now present in all 61 languages: every catalogue has the 1663 keys
  of `en`, every help corpus the same chapters, sections and field shapes.
- **Traditional Chinese browsers landed on Simplified Chinese** (`web.80`) —
  first-visit detection only knew the `pt-BR` / `pt-PT` region pair, so
  `zh-TW`, `zh-HK`, `zh-MO` and `zh-Hant*` fell through to the primary subtag
  `zh`. They now resolve to the `zh-TW` catalogue, for the browser locale, a
  saved legacy code and the `?lang=` landing parameter alike.
- **Multilingual admin notices and polls no longer drop the 61st language**
  (`web.79`) — the welcome / guest / registered / LAN notice maps and the poll
  label maps were capped at 60 language entries when saved; with Icelandic the
  client now has 61, so the last language would have been discarded silently.
  The cap is now 90, in line with the language-cardinality cap.
- **Mobile loupe: follow logic brought to parity with QML 2.1.9** (`web.66`,
  `GamePage.qml` `tableZone`, checked against the 2.1.9 build 1223 Android APK
  — its `GamePage.qml` is upstream `stable` minus the `a6d4f05` hunk). The
  loupe's follow code is now a straight port of the QML state machine
  (`_scheduleFollow` / `_doFollow` / `_panToPoint`, planned seat vs. seat
  already panned to) instead of a render-driven approximation:
  - **my turn** → the planned opponent pan is dropped and the self box zone
    (bottom of the table, centred) is shown at once (`onMyTurnChanged`);
  - **new street** → pan to the community cards (`communityCenterY`, now
    exported by `renderSeats` as `window._commCenterY`) and the "already
    panned to" mark is reset, so the same seat acting first on the next
    street — routine heads-up — is followed again (`onBoardCardsChanged`);
  - **the planned player acts** → pan there immediately instead of waiting for
    the ¼-thinking-time timer (`onRefreshActionTriggered`; the existing
    `_zoomFollowActed` hook had only ever driven the retired +/− zoom);
  - **showdown** → pan and follow marks are reset with the zoom-out, so the
    next hand reopens centred rather than on a stale seat;
  - the follow delay uses the QML 8 s fallback when no timeout is known, and
    the re-anchor of `web.65` now falls back to the community-card centre and
    leaves the self box zone alone, as upstream does.
  Not ported: `onWinningHandTextChanged` — on the web that text only shows
  during the showdown, where the loupe is suspended, so it could never act.
  `scripts/test-loupe-reanchor.mjs` rewritten to cover the whole state machine
  (22 checks).

- **Mobile loupe: view re-anchored when the ring is redistributed** (`web.65`,
  parity with upstream `a6d4f05`, `GamePage.qml` `_reanchorZoom`) — the ×2
  loupe keeps its pan in absolute zone pixels of the ring layout that was
  current when the pan was made. With "Remove departed players" on
  (`remove_gone`, the web counterpart of QML `keepEmptySeats` off), a player
  leaving — or the option being toggled mid-hand — redistributes the ring, and
  the excerpt kept showing a spot where no seat sits any more until a
  *different* opponent came to act. `_loupeOnRender` now watches the ring count
  (`window._seatCount`, parity with `onRingCountChanged`) and, deferred past
  the overlap guard, re-anchors the pan onto the seat it was computed for
  (new `_loupe.panSeat`), or onto the table centre if that seat left the ring.
  Never during a manual drag; no effect with `remove_gone` off (ghost seats
  keep their slot, the count never moves). New `scripts/test-loupe-reanchor.mjs`.
  The legacy `_zoomPanX/Y` follow code is untouched: it is inert since the +/−
  table zoom was retired (`_getTableZoom()` always returns 1).

- **Offline mode: nobody posts the big blind twice in a row** (`web.64`,
  parity with upstream `b6f5f7c`, pokerth#541) — on the way down to heads-up
  the plain "next live seat" button shift could make the previous big blind
  post it again (typically when the button busted: 73 of 261 heads-up
  transitions in a 300-game bot run). `OfflineTable.nextHand()` now hands that
  player the button (small blind) instead; nothing changes with three or more
  players nor in a heads-up already running. New `scripts/test-offline-button.mjs`.
  Online play needed no change: the client already takes the button from
  `HandStartMessage.dealerPlayerId` rather than computing it. Reviewed and not
  applicable from the same upstream batch: `8d2fc74` (Qt audio device crash),
  `4ad9b5f` (server avatar cache), `58d072c`/`7bbb730` (Android build).
  `a6d4f05` was first filed here as not applicable, wrongly — see `web.65`.

- **Error journal: two more sources of injected-script noise filtered**
  (`web.63`) — the script UC Browser injects into every page (served under a
  fake same-origin path, `/u.c.b.r.o.w.s.e.r/ucbrowser_script.js`) and
  extension content scripts failing on `wrappedJSObject` (seen on Safari iOS).
  Neither string exists in the client.

- **Fallback build id bumped to 2.1.9** (`web.61`) — the hard-coded fallback
  triple in `public/proto/index.mjs` and `modules/net/messages.mjs` (used only
  when `BUILD_VERSION` is missing) was still 2.1.8; `test-build-id` now passes.
- **Portrait board cards ~17 % smaller than the QML client** (narmod,
  measured directly off side-by-side screenshots of the real QML app —
  both the desktop AppImage and the Android APK compile `GamePage.qml`
  to bytecode, so the exact formula isn't extractable as source; the
  actual pixel sizes are, and that's what was compared) — self hole
  cards already matched within ~3%, but board cards measured ~14-20%
  smaller than QML across two independent screenshots at matched
  screen proportions. The existing portrait autofit compensation
  (`web` history) closed most of the gap but not all of it; added a
  measured 1.17× correction on top (`web.59`).
- **Red X on folded players' avatars** (`web.58`, reported by sp0ck) — the
  fold state was already shown by the fold badge and the dimmed hole
  cards, and the X was barely visible against some avatar seat packs
  (looked like a broken image). Dropped the `::before` overlay,
  `seat.folded .seat-avatar` still gets the badge/dim treatment.
- **Offline mode could fail to boot with no network** (`web.57`) —
  `offline/banter.mjs`, added in `web.54` and imported by
  `offline/server.mjs`, was never listed in the service worker's `ASSETS`.
  After a `CACHE_VERSION` bump the lazy import of the offline mode would die
  with no connection ("Offline init failed"), the same failure the
  achievements modules are precached to avoid. `test-precache.mjs` was
  already catching this.
- **Seat geometry only measured `.seat-plate`, ignoring an avatar or hole
  cards that overflow outside it** (reported by narmod, all three
  imported seat packs except PokerTH) — Boardwalk, High Roller and Onyx
  Pill each position the avatar (and sometimes the cards) with
  `position: absolute` outside `.seat-plate` — biting into an edge or
  sitting above it — while every geometry calculation in
  `seat-render.mjs` (community-row centering/bounds, self-box baseline,
  ghost-seat median height) only read `.seat-plate`'s own bounding box.
  That undercounted the seat's true on-screen size for these three
  packs, let the layout draw them larger than the space they actually
  occupy, and re-measuring every render (i.e. every action) made the
  felt/table visibly jitter. Same failure mode already fixed for
  PokerTH's bet socle, generalized: a new `_seatVisualRect()` unions
  the plate, avatar and hole cards, used everywhere seat size is
  measured. No change for PokerTH, where these already live inside the
  plate (`web.46`).

- **Shade widget still too wide on mobile** (narmod, screenshot on iPhone)
  — the narrower width from the previous entry was gated to `>=900px`,
  leaving the mobile fixed-sheet mode's `width: auto` (nearly edge to
  edge) untouched. Removed the gate; `.music-shade` now wins on every
  screen size and anchors to the right instead of stretching (`web.51`).

- **Music player follow-up: LCD title/time merge reverted, shade widget
  narrowed** (narmod tried the previous build and asked for two
  adjustments) — the merged title+time LCD line didn't read well, so the
  full player is back to two lines (time+VU on top, title below), with
  the vote thumbs now on the time/VU line instead, right-aligned. The
  collapsed/shade widget's panel width dropped from the shared 340px to
  230px (desktop/floating only) since its content never needed the full
  player's width (`web.50`).

- **Music player: thumbs up/down on the collapsed widget, condensed full
  player** (requested by narmod, mockups A-D, picked C and D) — the
  collapsed/shade widget now shows the track title on its own line with
  transport + vote thumbs on a second row (`_renderVote()` now updates
  every `.music-vote` row, since there can be two now). The full player
  merges title+time onto one LCD line, collapses the two transport rows
  into one, and merges volume + L/R balance onto a single row — nothing
  removed, just regrouped, so the visible height drops by roughly a
  third (`web.49`).

- **Card flip animation didn't match the QML client** (reported by
  narmod) — QML's `CardImage` component does a plain 2D horizontal scale
  squash on a centred `Scale{xScale}` transform, not a 3D rotation:
  phase 1 shrinks `xScale` 1→0 over 170ms (`Easing.InQuad`), phase 2
  grows it back 0→1 over 300ms with a slight bounce
  (`Easing.OutBack`, overshoot 1.15) — 470ms total, extracted verbatim
  from the plain-text QML source embedded in the 2.1.9 AppImage narmod
  provided. The web client instead ran a fake `rotateY` 3D wobble at a
  flat 260ms, and staggered the flop cards by 120/240ms instead of
  QML's 220/440ms. `@keyframes cardFlip` now reproduces the exact
  2-phase squash (via per-keyframe `animation-timing-function` against
  a 470ms linear total), with the correct flop stagger; `.pk-river` and
  `.pk-showdown` (QML reuses the same `CardImage` component for both)
  now use the same 470ms so the keyframe percentages stay meaningful
  (`web.48`).

- **Community-card row didn't group Flop/Turn/River like the QML client,
  and the pot badge used a hand-drawn circle instead of the chipStack.svg
  icon** (reported by narmod, side-by-side screenshots) — the QML source
  (extracted from the 2.1.9 AppImage) lays the 5 board slots out as
  `Flop(0-2) | 14px gap | Turn(3) | 14px gap | River(4)`; the web row only
  had a uniform 3px gap. The pot badge's icon is now the same
  `chipStack.svg` already used for each player's bet chip, sized to match
  the QML original (14px base) (`web.45`).

- **Seat/board geometry could inherit a previous game's player count**
  (reported by narmod, screenshots QML vs web at 4 and 10 players) —
  `S._peakSeatCount` (parity with QML `_peakSeatCount`, used to keep box
  sizing stable while players get knocked out) was never reset when
  leaving a table (`closeTable()`/`leaveGame()`/`_resetGameState()`), so
  starting a new game with fewer players than a previous one on the same
  page session kept the old, larger geometry. Also, the community-card
  row's scale calculation (landscape wide layout) only reserved space for
  the row itself above the top opponent box, never for the pot badge that
  renders further up via `--pot-badge-lift` — this let the row grow
  oversized versus the QML client and, with few players, let the pot
  badge overlap the top seat box outright. Both now reserve/reset
  correctly (`web.44`).

- The interface-language count quoted in the help corpus, the public
  glossary / how-to pages, the FAQ, the SEO description and `llms.txt` had
  drifted (45 to 54 depending on when each language was added); every
  mention now says 55, in the numeral system of each language (`web.42`).

- **Lobby chat mute button (`web.37`) was hidden by its own CSS selector**
  (`web.38`, reported by narmod) — `#lobby-chat-panel .g-chat-panel-header
  button[onclick*="toggleLobbyChat"]` used a substring match meant to hide
  only the legacy close button (`onclick="toggleLobbyChat()"`), but
  `App.toggleLobbyChatMute()` also contains `toggleLobbyChat` as a substring,
  so the new mute button was caught by the same rule and hidden alongside it.
  Selector changed to an exact match (`[onclick="toggleLobbyChat()"]`). The
  table chat mute button was unaffected — no equivalent rule exists for
  `toggleGameChat`.
- **`/live` tab bar not pinning to the top — happened in Chrome too, not
  just Safari** (`web.36`, reported by sp0ck) — `.llb-tabs` cancelled
  `.llb-main`'s padding with a negative margin so it could sit flush at the
  top; combined with `position: sticky` (added in `web.30`) that's an
  unreliable combination across engines, and it's what actually broke the
  bar's pinning generally, not a Safari-specific clipping quirk as
  `web.34`'s fix assumed. `.llb-main` now carries no padding at all — the
  `sp-3` inset moved to the new `.llb-body` node instead — so the tab bar
  sits flush with nothing to cancel out and no negative margin involved.
- **`/live` the sliver only appeared while scrolling AND expanding a row —
  root cause was DOM recreation, not clipping** (`web.35`, reported by
  sp0ck) — `render()` rebuilt `.llb-tabs` via `innerHTML` on every call,
  including the one triggered by expanding/collapsing a row. Recreating a
  `position: sticky` node forces Safari to reestablish its sticky context
  from scratch, which is what flashed a stale scrolled frame exactly when a
  row was toggled (`web.34`'s reclip fix addressed a real but different
  Safari quirk and left this one untouched). `.llb-tabs` is now a stable
  DOM node built once and never replaced; only its label text/counts update
  in place, and a separate `.llb-body` node under it takes the row content.
- **`/live` a sliver of the scrolled-past row still peeked above the sticky
  tab bar on iOS Safari** (`web.34`, reported by sp0ck) — a known WebKit bug:
  an element with both `border-radius` and its own `overflow-y: auto` scroll
  fails to reclip a `position: sticky` child to its rounded corner during
  momentum scroll, so the row just above the tab bar could still show a
  thin strip past the top edge even with `web.33`'s opaque background.
  Added the standard `-webkit-mask-image` workaround, which forces Safari
  to reclip to the box's actual shape every frame instead of only at rest.
- **`/live` sticky tab bar let the row beneath it show through** (`web.33`,
  reported by sp0ck) — `web.30` made `.llb-tabs` `position: sticky` so it
  stays reachable while scrolling, but its background (`--chrome-tint`) is
  only 6–35% opaque depending on theme — fine while it scrolled in-flow,
  but now that it's pinned on top of the rows below, that transparency let
  the scrolled-past row show through underneath it. Switched to `--field-bg`,
  a solid colour in every palette and already what the rows themselves use.
- **`/live` folded seats' action badge was still dimmed after `web.27`**
  (`web.32`, reported by sp0ck) — `web.27` reset `.seat.folded`'s own
  opacity, but the badge is injected inside `.seat-holecards`, and it is
  `.seat-holecards` — not `.seat` — that actually carries the fold-dimming
  opacity (0.3). That container's own opacity still dimmed the badge as
  part of its compositing group. Now `.seat-holecards` itself stays at 1 on
  `/live`, and only its `.pk` card children get the 0.3 fade, leaving the
  badge untouched.
- **`/live` theme toggle cycled a confusing third "automatic" step**
  (`web.31`, reported by sp0ck — "what does default stand for?") — the
  header button cycled `auto → light → dark`, but a visitor has no reference
  for what the OS-follow step currently shows. Now light/dark only; the
  toggle reads the actually-applied `data-theme` attribute (never the raw,
  possibly still-`'auto'` stored preference) so the icon and the next click
  always match what's on screen.
- **`/live` Tables/Players tab bar scrolled away with the list** (`web.30`,
  reported by sp0ck) — `.llb-tabs` was an ordinary first child inside
  `.llb-main`'s own `overflow-y: auto` scroll, so scrolling down the row
  list carried it off-screen too; switching tabs meant scrolling all the
  way back up first. Now `position: sticky; top: 0`, so it stays reachable
  regardless of scroll position.
- **`/live` folded seats dimmed the action badge along with everything else**
  (`web.27`, reported by sp0ck) — the QML-parity rule that fades a folded
  seat to 0.72/0.78 opacity (`.seat.folded`, `.seat.me.folded`) dims the whole
  seat as a compositing group, badge included, since CSS opacity can't be
  selectively undone on a descendant. On `/live` the badge is now excluded by
  resetting the seat's own opacity to 1 there and leaving `.seat-holecards`'
  own 0.3 opacity as the only fade — so a folded player's cards grey out but
  their name, avatar and "Fold" tag stay fully readable. Scoped to
  `:root[data-live="1"]`; the ordinary client's QML parity is untouched.
- **`/live` lobby-chat notification sound firing on every message** (`web.26`,
  reported by sp0ck) — `onChat()` in `modules/net/msg-social.mjs` plays
  `lobbychatnotify.mp3` for any lobby chat line from someone else while the
  game screen isn't visible. On the ordinary client that's an occasional
  ping; a `/live` visitor sits on the lobby view almost permanently, so the
  sound played on nearly every message. Now skipped outright in `LIVE_MODE`.
- Admin: the language pickers of the welcome message, guest / registered /
  LAN notice and poll editors were missing seven catalogue languages (am,
  bn, fil, id, pa, sw, th) — operators could not author those messages in
  them (`web.25`).
- **`/live` showed the game-invite banner to spectators** (`web.18`) —
  `onInviteNotify()` in `modules/net/msg-social.mjs` displayed the accept/
  decline banner for any `InviteNotify` addressed to our player id, with no
  `LIVE_MODE` guard. A regular player inviting a guest spectator (reported by
  sp0ck, invited by another player while watching as a guest) surfaced a
  banner a spectator can't act on — joining a game isn't possible from
  `/live`. Now short-circuited in `LIVE_MODE`, alongside the other popups
  already silenced there (`test-live-quiet.mjs`, extended with a matching
  check).
- **`/live` Players tab showed reconnected players multiple times** (`web.15`)
  — `renderPlayers()` in `modules/live/lobby.mjs` enumerated `S.players`, a
  pid→name cache that only ever grows (no entry is dropped when a player
  disconnects from the server, only on a pid remap). A player who reconnects
  gets a new pid, so the old pid's name stayed listed forever, e.g. "Charro"
  shown three times after three reconnects. Filtered the list — and the tab's
  player count — through `S._lobbyPids`, the set already kept in sync with
  `PlayerList` join/leave notifications and used by the ordinary lobby's own
  players panel (`renderPlayersList` in `pokerth.js`). Regression case added
  to `test-live-lobby.mjs`.
- **Guest / registered-account / LAN broadcast notices missing Estonian,
  Latvian and Slovenian** (`web.7`–`8`) — `GUEST_NOTICE_DEFAULT_LANGS`,
  `AUTH_NOTICE_DEFAULT_LANGS` and `LAN_NOTICE_DEFAULT_LANGS` in `proxy.js`
  were last filled in for the original 45 languages; `et` and `lv` were
  never added when they shipped. Added `sl` (`web.7`), then wrote and added
  `et` and `lv` to close the gap entirely (`web.8`) — all three tables now
  cover the full 48-language set. `test-authnotice.mjs` /
  `test-guestnotice.mjs` hardcoded expected count bumped 45 -> 46 -> 48
  across the two commits.
- **LAN / dedicated server notice** (`web.2`) — a new operator-authored popup,
  mirroring the guest/registered-account notices, shown once per version to
  everyone connecting in LAN / dedicated-server mode on this instance. Built-in
  English default text (translated into all 45 client languages, same overlay
  mechanism as the other two notices) explains that this instance only dials a
  single pre-configured LAN server and points players toward self-hosting the
  client for any other address. Disabled by default; enable and edit under
  Admin → Broadcasts → "LAN / dedicated server notice".

### Fixed
- **About → Changelog tab merging by exact build label instead of by
  release** (`web.4`) — `_abClRender()`'s per-version merge (added `web.87`,
  09/09) grouped entries whose raw header text matched exactly. Once
  per-build headers started carrying their `.N` counter (`web.121` onward),
  each build got a distinct key and rendered as its own tiny block instead of
  joining the rest of its release — the opposite of the clean, one-block-per-
  version layout the upstream tab already had. The merge key now drops the
  trailing `.N` before comparing, and the displayed header is rebuilt from the
  most recent build's date plus the bare `X.Y.Z-web` (with `(current series)`
  where it applies) instead of being copied verbatim from one specific build.
- **SVG-skinned table style buttons reverting to default colours on reload**
  (`web.3`) — table styles with their own Fold/Check/Call/Raise/All-In
  artwork (Ivoire & Chêne, Casino, imported skins) render them via the
  `data-btn-img` attribute on `<html>`. `_injectButtons()` set it correctly
  in-session, but the zero-flash boot snippet only replayed the persisted CSS
  custom properties (`pth_buttons_css`) — the attribute itself was never
  part of that replay, so it silently stayed unset after any reload and the
  buttons fell back to the plain default gradient. The boot snippet now also
  restores the attribute when the persisted CSS carries its marker.
- **Redundant floating chat button** (`web.3`) — a third chat toggle
  (`#gchat-fab`, bottom-right FAB) duplicated the felt's own chat button
  (`#chat-toggle-btn`); a leftover from an old off-screen-focus fix. Removed.
- **Silent avatar-upload failures** (`web.1`, parity with upstream `665d80a`)
  — the file picker (`_processAvatarFile`) already warned on an unusable
  image, but the PNG re-encode done for the *network* upload
  (`_pthCanvasToUpload`, gated on the server's `[32, 30720]` byte window)
  ran again on every login and only ever failed silently. An image that
  passed the picker (JPEG, resized) could still miss that tighter PNG bound
  and quietly stop announcing an avatar on every future connection. It now
  surfaces the existing `avImgTooLarge`/`avImgInvalid`/`avImgFailed` toasts
  (already translated in all 47 languages), de-duped per avatar choice so a
  reconnect loop doesn't repeat the warning.

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

