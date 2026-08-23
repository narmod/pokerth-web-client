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
release.

### Fixed
- **Dead lobby connection went unnoticed** (`web.57`) — the RX watchdog only
  ran at a table (`s-game`). A zombie socket in the lobby — `readyState` still
  `OPEN` while the TCP underneath is gone, which is what happens when the server
  closes the session behind the proxy, or on a network switch — fired no
  `onclose`, so nothing reconnected and the lobby sat there indefinitely with a
  frozen table list. Reported on the forum.
  The table threshold could not simply be reused: a quiet lobby is legitimately
  silent. It is now anchored on the server's own heartbeat — since 2.1.0 a
  `StatisticsMessage` goes to every session every 45 s
  (`SERVER_SAVE_STATISTICS_INTERVAL_SEC`, upstream comment: *keeps NAT alive,
  feeds client connection monitor*). The interval is measured rather than
  assumed, so the client follows the server if it ever changes, and the
  threshold is `max(110 s, 2.5 × interval)`.
  Crucially, the lobby watchdog only arms after **two observed heartbeats**: a
  pre-2.1.0 server sends none, and arming there would have had a quiet lobby
  reconnect in a loop. The counter resets on every `InitAck`, since the next
  session may be a different server. The table path is untouched.

### Changed
- **Inactivity warning as a real dialog** (`web.56`) — the server warns 60 s
  before dropping an idle session (`SERVER_TIMEOUT_WARNING_REMAINING_SEC`), and
  only deliberate packets reset the clock: `PlayerInfoRequest` and
  `AvatarRequest` are explicitly excluded server-side, so watching a busy lobby
  does not keep a session alive. We rendered that warning as a chat line, which
  goes unnoticed in the lobby — the player simply found himself disconnected
  with the lobby still on screen. It is now a modal countdown above every page,
  with a sound, wording per `timeoutReason` (idle connection / open-game admin /
  did not act in the game), and an OK button that sends `ResetTimeout` through
  the existing `_afkActivity` path, so there is still a single place emitting
  that packet. Escape dismisses without answering, as in QML, and the socket's
  `onclose` closes the popup so no dead countdown outlives its session. The chat
  line stays — it leaves a trace in the log. Parity with `timeoutWarningPopup`
  in `pokerth.qml`. Eight new keys, all 45 languages.

### Fixed
- **Rejoining a running game after a disconnect** (`web.54`) — a player thrown
  off mid-game could never get back to the table, even within the five minutes
  the server holds the seat (`SERVER_OFFLINE_RECONNECT_TIMEOUT_SEC`). The web
  client had its own rejoin path (`pth_resume` → `RejoinExistingGameMessage`)
  but never sent `InitMessage.myLastSessionId`, so the server saw an empty
  `OldGuid` and refused every attempt with `removedAlreadyRunning`
  (`servergamestate.cpp`, `AbstractServerGameStateRunning::HandleNewPlayer` —
  whose comment names this client explicitly). The session GUID from
  `InitAck` field 1 is now kept and replayed, mirroring the QML client's
  `guid.tmp`; `InitAck.rejoinGameId` (field 4) is honoured as the authoritative
  offer, outranking the local marker, which cannot know whether the seat was
  invalidated meanwhile. The GUID lives inside `pth_resume`, so it inherits
  that key's handling: kept across a factory reset, never exported to a backup
  and never carried to another device. Reported on the forum by *il Buono*.

### Added
- **`/rules` is complete: all 45 languages** (`web.55`) — final batch adds
  Hindi, Urdu, Bengali, Tamil, Filipino, Swahili, Bulgarian and Scottish
  Gaelic. Bulgarian had been skipped in an earlier batch; a check now compares
  the table against `SEO_I18N`, so a gap cannot pass unnoticed again. Every
  variant self-canonicalizes, carries 91 hreflang links and appears in the
  sitemap.
  Caveat worth recording: for Hindi, Urdu, Bengali, Tamil and especially
  Scottish Gaelic there is no settled poker vocabulary to draw on, so the hand
  names mix transliteration with description (*ceathrar co-ionann* for four of
  a kind in Gaelic). Those five deserve a native reader before being treated
  as final; the other forty are on firmer ground.

### Added
- **`/rules` in Korean, Vietnamese, Thai, Arabic, Hebrew and Persian**
  (`web.53`) — seventh batch, thirty-seven languages live, 8 to go. Vietnamese
  uses its own vocabulary for hands (*tứ quý*, *cù lũ*, *mậu thầu*), which has
  nothing to do with the English terms; Korean and Thai use the established
  transliterations. The right-to-left variants were checked for stray Latin
  words beyond the action names, which stay English by convention.

### Added
- **`/rules` in European Portuguese, Catalan, Galician, Lithuanian, Serbian
  and Afrikaans** (`web.52`) — sixth batch, thirty-one languages live, 14 to
  go. `pt-PT` is not a copy of `pt-BR`: *ronda* not *rodada*, *póquer* not
  *pôquer*, and quads are *poker* there as in Catalan and Galician. Serbian is
  written in Cyrillic to match its interface translation.

### Added
- **`/rules` in Danish, Finnish, Norwegian, Slovak, Croatian and Indonesian**
  (`web.51`) — fifth batch, twenty-five languages live, 20 to go. Croatian
  joins the *poker means quads* group. Finnish keeps the native hand names
  (*värisuora*, *neloset*, *täyskäsi*, and *hai* for high card) rather than
  the English borrowings, which is what Finnish players use.

### Added
- **`/rules` in Ukrainian, Czech, Swedish, Romanian, Hungarian and Greek**
  (`web.50`) — fourth batch, nineteen languages live, 26 to go. Hungarian is
  the third language after Italian and Polish where *póker* names four of a
  kind rather than the game; Greek uses the transliterated ρουαγιάλ φλος and
  καρέ, which is what players there actually write.

### Added
- **`/rules` in Italian, Polish, Dutch and Turkish** (`web.49`) — third batch,
  thirteen languages live. Two false friends worth naming: in Italian
  *poker* is four of a kind, not the game, so the royal flush is *scala reale*
  and quads are *poker*; in Polish *poker królewski* is the royal flush while
  a plain *poker* is the straight flush. Translating either from English
  one-to-one would have produced a page that reads wrong to a player.

### Added
- **`/rules` in German, Russian, Brazilian Portuguese and Japanese**
  (`web.48`) — second batch, nine languages live. Hand names follow local
  usage rather than a literal gloss: German keeps *Royal Flush* and *Full
  House* as they are used at the table but translates *Vierling* and *Straße*,
  Russian uses the borrowed *флеш-рояль* and *каре*, Japanese the katakana
  forms. Same structural check as the first batch — every translation carries
  the same tag counts as the English page.

### Added
- **`/rules` in French, Spanish and Chinese** (`web.47`) — first translation
  batch: `fr`, `es`, `zh` and `zh-TW`, each with its own title, meta
  description and JSON-LD. The action names stay in English
  (`Fold`, `Check`, `Call`, `Raise`, `All-In`) per project convention, with a
  gloss in parentheses for the Chinese variants; hand rankings are translated,
  since 德州扑克规则 and *quinte flush royale* are what people actually search
  for. The English page is unchanged except that it now advertises the four
  variants, which is the point. 40 languages to go.

### Added
- **`/rules` and `/faq` can be served per language** (`web.46`) — both pages
  now take a language, self-canonicalize on `?lang=`, carry `<html lang>`,
  `og:locale` and their own hreflang set, and appear in the sitemap once per
  language. The text itself is still English everywhere: `SEO_RULES_I18N` and
  `SEO_FAQ_I18N` ship empty and are filled in batches. A language is
  advertised only once its entry exists — publishing 44 URLs that all serve
  the same English text would be duplicate content, which costs more than it
  earns, so an empty table produces exactly the sitemap and the markup we had
  before. The English page is byte-identical apart from the new `og:locale`.

### Added
- **Regional hreflang aliases** (`web.45`) — 45 aliases mapping onto the
  existing language variants, so `zh-Hant`, `es-MX`, `fr-CA`, `pt`, `no` and
  the rest resolve instead of falling through. No new URLs and no new
  translations: several hreflang values may point at the same page, which is
  what the spec is for. `pt` had no target at all, since the catalogue only
  held `pt-BR` and `pt-PT`. The legacy ISO codes `iw`, `in` and `tl` are
  mapped too, as older clients and directories still emit them.
  `?lang=` resolves aliases as well — advertising a code we then ignore would
  send those visitors to the English page.

### Changed
- **Single source for the hreflang set** (`web.45`) — the `<head>` alternates
  and the sitemap's `xhtml:link` set were built by two separate loops over
  `SEO_I18N`. They agreed only by luck, and a crawler that sees two different
  alternate sets for one page trusts neither. Both now come from
  `seoHreflangPairs`.

### Changed
- **Localized crawler text for all 45 languages** (`web.44`) — every language
  variant served an English `<h1>` and an English body under its own
  `<html lang>`, so a search engine reading `/?lang=zh` found Chinese metadata
  wrapped around English prose and could reasonably treat the page as a
  near-duplicate of the English one. `seoBodyBlock` and `seoFooterBlock` now
  take the language. The heading and lead paragraph reuse the already
  translated `SEO_I18N` title and description; a new `SEO_BODY_I18N` table
  carries only what was missing — how you play, the free/open-source line, and
  the two link labels. The English output is byte-identical to before, since
  changing visible footer text was not the point of this. `og:image:alt` is
  localized too. The GitHub attribution line stays English: it is mostly
  proper nouns.

### Changed
- **Open Graph locale and language count** (`web.43`) — shared links now carry
  `og:locale`. Facebook, LINE and WeChat read that property to pick the preview
  language and fall back to `en_US` when it is absent, so a link posted to a
  Taiwanese or Hong Kong group previewed in English however Chinese the page
  itself was. The property is defined as `language_TERRITORY`, which a bare
  `zh` or `fr` does not satisfy, so the mapping is an explicit table with one
  entry per `SEO_I18N` language rather than a transformation of the hreflang
  code. The crawler text block and `llms.txt` also claimed 40 interface
  languages; there are 45.

### Added
- **Copy a log to the clipboard** (`web.35`) — *Recent logs* and *Last action
  log* each get a Copy button. `navigator.clipboard` needs a secure context,
  which a panel served over plain http on a LAN is not, so there is a selection
  fallback for those. The button reports what happened — copied, nothing to
  copy, or refused — since otherwise a successful copy and a dead click look
  exactly alike.

### Fixed
- **Wrong panel on opening the dashboard** (`web.38`) — the Server family and
  its *Health & logs* tab were correctly marked active, but the page showed
  *Modes & features*. Splitting the panels in `web.33` left the first panel of
  *each* family open, and `panel-clients` sits earlier in the document than
  `panel-server`, so it was the one on screen until the first tab click. Only
  the panel the active tab points at is open now, and a guard counts them.

### Added
- **Weekly leaderboard reset** (`web.40`) — `STATS_RESET_PERIOD` now takes
  `weekly` next to `off`, `daily`, `monthly` and `yearly`, and the Leaderboard
  card offers it. Weeks follow ISO-8601: Monday to Sunday, belonging to the
  year of their Thursday. That rule is the whole point — 1 January 2027 is a
  Friday and belongs to `2026-W53`, so a naive week number would roll the
  marker over twice at the turn of the year and wipe real scores a week early.
  Keys read `2026-W34` and sort as text. Updated in both server-side
  validations, `install.sh` and the README; 24 guards in
  `scripts/test-reset-period.mjs` covering the week boundaries, both year
  boundaries and the count of changes across a full year.

### Fixed
- **Language names followed the browser locale** (`web.42`) — `web.41` asked
  `Intl.DisplayNames` for the visitor's own locale, so a French browser read
  *chinois*, *anglais*, *allemand* in a dashboard written entirely in English.
  They are now asked for in English, whatever the browser is set to.

### Changed
- **Languages shown by name** (`web.41`) — *What visitors run* listed `en`,
  `zh`, `nl`, which have to be decoded. They now read English, Chinese, Dutch,
  in the language of whoever is looking, from `Intl.DisplayNames` rather than a
  45-entry table that would drift. Only keys shaped like a language code are
  looked up, so `ios` in another view stays `ios`; a code Intl does not know
  stays as it is, and a browser without `Intl.DisplayNames` still shows codes.
  The raw code moves to the hover title, where it does not crowd the row.
- **Proxy sits after Deployment** (`web.39`) — the Server sections now run
  Health & logs, Deployment, Proxy, Access & backup, Identity & reach, Game
  servers, Keys. A guard pins the whole order rather than the position of one
  tab.
- **Readable times in the logs** (`web.37`) — the proxy stamps lines in ISO
  UTC (`2026-08-23T15:53:16.364Z`), which is right for a file and unreadable
  on screen, on top of being off by the reader's own offset. Both logs now
  render `17:53:16` in the viewer's time zone, on a 24-hour clock at a fixed
  width so the stamps line up as a column in the monospace font. A line from
  another day gets `20 Aug` in front, with the month in letters since 08/20
  and 20/08 both read as dates. Display only: the files and pm2 keep ISO UTC,
  which stays the unambiguous reference, and the panel says which zone it is
  showing so the times don't look wrong next to the file.
- **Audit log stops at ten entries** (`web.36`) — the rest is one scroll away
  instead of pushing the page down. The cut is measured rather than assumed
  from a line height, because an entry takes one line on a wide screen and two
  on a phone; it is re-measured when the screen turns, and a hidden list is
  never measured, so an existing cap is not lost.

### Fixed
- **Card header rows overflowed on a phone** (`web.36`) — the row could not
  wrap, so *Recent logs* broke its title across two lines while its Refresh
  button ran off the side of the screen. Actions now drop below the title when
  they no longer fit, take the full width there, and the verbosity selector
  stops being cramped.
- **Identity & reach moved to the Server family** (`web.35`) — server name,
  Discord relay and SEO describe the server itself, not what players are
  offered.
- **Admin dashboard: one spacing, not six** (`web.34`) — card titles and lead
  paragraphs carried their margins in the tags, in six different values, so no
  two cards breathed quite alike. `.muted` only sets a *top* margin, which is
  why all 35 lead paragraphs had to spell out a bottom one or fall back on the
  browser's 1em — that is now a single rule. Sixteen header-row titles, eleven
  header rows repeating a margin the sheet already gave them, eleven action
  rows and one message box that sat 2px off every other message on the page
  followed. 86 `style=` attributes left the HTML (287 → 201); no id, title or
  control changed, and the document still parses with balanced tags.
- **Admin dashboard: one section per subject, not a wall of cards** (`web.33`)
  — Overview held eight cards and Settings ten, which stayed hard to read even
  once grouped by heading. Each group is a section of its own now. **Server**
  offers *Health & logs*, *Proxy*, *Deployment*, *Access & backup*, Game
  servers, Keys; **Client** offers *Modes & features*, *Defaults*, *Identity &
  reach*, Packages, Music, Broadcasts, Polls. Every card kept its title and
  its id, and the whole document still parses with balanced tags.
- **Panel switching derives the id** (`web.33`) — it listed all twelve panels
  by hand, so a new one stayed invisible until someone remembered to add a
  line. It now matches `panel-<data-t>` across every panel on the page. Two
  columns follow the new split: the five *Defaults* cards use them, the
  two-card panels no longer ask for them.
- **Admin dashboard: shorter titles under *Defaults for new visitors*** (`web.32`)
  — five cards each repeated what the section heading above them already said.
  They are now *Theme*, *In-game settings*, *Login form*, *Table settings* and
  *Table name (per mode)*.

### Fixed
- **A renamed card lost its default fold** (`web.32`) — the collapse state is
  keyed on the title text, so renaming a card (or adding one) produced a key
  the store had never seen, and the card opened wide instead of following
  `DEFAULT_FOLDED`. An unknown key now falls back to the default, which is what
  keeps *In-game settings* folded through the rename above.
- **Admin dashboard: the two crowded panels get sub-sections** (`web.31`) —
  Overview carried eight cards and Settings ten, in whatever order they had
  been written. Overview now reads *Health & logs*, *Bridge settings*,
  *Deployment*, *Access & backup*; Settings reads *What players can use*,
  *Defaults for new visitors*, *Identity & reach*. Cards were re-ordered to
  match, which is only safe because the collapse state is keyed on the title
  text rather than on position — so every folded card stays folded. Headings
  span both columns on a wide screen, otherwise they would float above one
  column and stop saying what they cover.
- **Admin dashboard: the families now read as navigation** (`web.30`) — they
  looked like four more buttons under the header ones. The three share the
  width (capped at 520px on desktop, full width on a phone, one tap target per
  third of the screen and no scrolling), while the sections behind them drop
  to plain text until opened, so the two rows no longer look alike.

### Fixed
- **Active family invisible in the light theme** (`web.30`) — `--gold` is dark
  there, and a plain `.gtab` rule outranked `.gtab.on` (0,2,1 against 0,2,0),
  repainting the active family's background and leaving dark text on a dark
  fill. The fill now spares the active family, which gets a light text colour.
- **Admin dashboard: tabs grouped into three families** (`web.29`) — twelve
  flat tabs mixed three unrelated kinds of settings. The family is now picked
  on the top row and the section inside it: **Server** (Overview, Game servers,
  Keys), **Client** — everything players see — (Settings, Packages, Music,
  Broadcasts, Polls) and **Data** (Traffic, Sessions, Errors, Leaderboard).
  Every `data-t` and every `data-scope` came across unchanged, so no panel and
  no scoped key lost its way in; a family left with nothing a scoped key may
  open hides itself rather than offering a button that opens nothing, and such
  a key lands on a family it can actually use. Two tabs were renamed for the
  new shape: *Server* became *Overview* and *Clients* became *Settings*.
- **Admin dashboard: settings rows are a style, not a copy-paste** (`web.28`) —
  the same flex declaration had been retyped into 51 `style=` attributes with
  no CSS rule behind it, so every panel drifted a little. It is one class now.
  On a wide screen the control keeps to 560px instead of drifting to the far
  edge away from its label, and controls on consecutive rows line up. On a
  phone label and control stack full width, which needed the hard-coded widths
  (`width:110px`, `flex:1`) out of the tags first: an inline style beats the
  sheet, so those 34 attributes had quietly defeated every mobile rule written
  against them. No id, handler or control changed. 15 more guards in
  `scripts/test-admin-layout.mjs`.
- **Admin dashboard: wider layout and a tab bar that behaves** (`web.27`) —
  past 1100px the page widens to 1180px and the four busiest panels (Server,
  Traffic, Clients, Broadcasts) lay their cards out in two balanced columns,
  instead of leaving a third of the screen empty while the operator scrolls.
  Cards are never cut across the break, and the ones carrying a chart or a
  grid span both columns. Tabs now size to their label, so *Game servers* no
  longer wraps onto a second line and grows the whole strip; on a phone the
  bar still scrolls, but a fade at the edge says there is more, the fade
  appears only when something is actually out of view, and picking a tab
  scrolls it into view. Nothing changes below 1100px. 24 guards in
  `scripts/test-admin-layout.mjs`.
- **Play counts moved next to the track titles** (`web.26`) — the ranked list
  in the traffic tab answered "which tracks are popular" but not "how is *this*
  track doing", which is the question you have while looking at the library.
  `/admin/music-list` now carries the counts, and each row in the Music tab
  shows them beside the title. Radios show nothing (they are not measured), and
  a proxy too old to count shows nothing rather than a misleading zero — a
  track that *is* counted but never played shows `0 plays`, which is real
  information. The traffic tab keeps the 14-day chart and drops the list.

### Fixed
- **Update banner shown for an update already applied** (`web.25`) — the
  service worker routed `/__ver` through its stale-while-revalidate handler, so
  the marker driving the in-app update check was answered from Cache Storage.
  `cache: 'no-store'` on the page and `Cache-Control: no-store` on the proxy
  response are both ignored once a cached entry is returned, so the first poll
  after a deploy read the *previous* marker, the background revalidation stored
  the fresh one, and the next poll saw a change and prompted for an update the
  page had already loaded (HTML and code are network-first). `/__ver` and the
  other live-state endpoints (`/__visit`, `/__music`, `/__poll-vote`, `/prefs`,
  `/prefs-web`, `/stats`, `/api/*`) are now left untouched by the SW, the same
  way `/admin` already was.
- **Newly imported seat packs invisible until the cache renewed** (`web.25`) —
  `/seats/seats.json` was missing from the network-first manifest list, which
  already covered `table/tables`, `cards/decks`, `themes/themes` and
  `music/tracks`, so the seat gallery was served stale after an import.
- **Stale language counts** (`web.20`) — the admin traffic card still read
  "of 40 translated" and "which of the 40 languages are actually used", while
  `CONTRIBUTING.md`, `docs/PROJECT.md`, the `docker-compose.yml` service
  description and the avatar-studio test label were stuck at 36 or 40. All of
  them now say 45, matching the 45 catalogues in `public/modules/lang/`. The
  inline dictionaries in `i18n.mjs` that only cover part of the catalogue no
  longer claim a count at all, since the missing languages fall back to
  English through `t()`. README, ROADMAP, the help corpus and the FAQ page
  were already correct.

### Added
- **Keyboard selection in the session logs** (`web.24`) — the list had no
  arrow-key navigation at all, only Tab. `Up`/`Down` now move from entry to
  entry, and `Shift` + `Up`/`Down` extends the selection from the anchor, the
  keyboard counterpart of `Shift` + click. In selection mode the arrows move
  the focus without ticking anything; `Space` ticks, as it already did. The
  anchor is the focused entry rather than the previewed one, since the two
  part company as soon as the focus moves. Arrows carrying `Ctrl`, `Cmd` or
  `Alt` are left to the browser. `jrSelectHint` updated in all 45 languages.
- **Music play counter** (`web.23`) — the dashboard could say what visitors
  run but not what they listen to. The music player now posts an anonymous
  `POST /__music {id}` beacon each time a track *starts* (a resume after a
  pause is not a play), and the traffic tab ranks tracks by plays with a
  14-day per-day chart. No visitor id, no listening time, no caller address:
  the id is validated against the served catalogue, so unknown ids create no
  key and `visits.json` can never grow past the playlist. Radio stations are
  excluded — a live stream has no track end. Counting stops while the music
  player is switched off. 30 guards in `scripts/test-music-stats.mjs`.
- **Multi-select in the session logs** (`web.21`) — deleting old logs one by
  one was the only option (community request from *Spitessbir* on the forum).
  The log window now has a **Select…** button that reveals a checkbox on every
  entry; `Delete` then turns into `Delete (n)` and removes the whole batch
  after a single confirmation. On desktop, `Ctrl`/`Cmd` + click toggles one
  entry and `Shift` + click takes a range, both switching the mode on by
  themselves, file-explorer style. Leaving the mode (or closing the window)
  clears the ticks. Five new i18n keys, translated in all 45 catalogues.
  The help corpus describes the batch deletion and both keyboard shortcuts
  in all 45 languages (`web.22`).
- **Custom sounds** (`web.19`) — every one of the 14 game samples (fold,
  check, call, bet, raise, all-in, dealing, your turn, the three blind-raise
  levels, player connected, game ready, lobby chat) can be replaced with the
  player's own audio file, the browser equivalent of swapping the files in
  `data/sounds/default/` on the desktop client. New list in *Advanced
  options → Sound*: preview (▶), import, restore one, restore all. Files are
  checked with `decodeAudioData` at import time (an unreadable file is
  refused, not silently mute), capped at 2 MB each, and kept in IndexedDB
  `pth_imports` — the same store as the imported style packs — so nothing is
  ever uploaded. Playback goes through the existing path, so the master
  volume, the mute button and the four sound categories keep working
  unchanged; a missing custom buffer falls back to the original sample and
  then to the synthesised beep. UI lives in the new lazily-loaded
  `modules/ui/sound-import.mjs` (nothing is downloaded until the Sound tab is
  opened).

### Changed
- **Admin traffic: one colour per language** (`web.18`) — the ranking is
  ordered by the running total and the per-day chart by the last 14 days, so
  the same language used to get two different hues. Colours are now keyed by
  language code from the ranking order; a tail language that would collide
  takes the first free hue instead, and the grouped line is labelled
  "N others" like the list (a language literally reported as "other" exists,
  and two "other" legends read as one).
### Changed
- **Language count refreshed everywhere** (`web.16`) — the help chapter
  "Language" in all 40 original catalogues, plus README, ROADMAP, the
  server-rendered FAQ page (/faq) and the default SEO description, now
  states 45 languages (was 40).

### Added
- **Automatic updates** (`web.17`) — opt-in switch in the admin *Maintenance*
  card. The server polls its own branch every 15 min (`git fetch` +
  `git diff --name-only HEAD FETCH_HEAD`); a changeset that only touches
  `public/` (or documentation) is deployed immediately through the existing
  static path, with no restart and no dropped connection. Anything touching
  `proxy.js`, dependencies or scripts waits for a **completely idle** server
  (zero WebSocket), then arms the regular restart notice (60 s by default,
  10–3600); if a client connects before the deadline, the action is called off
  and retried later, so an open connection is never cut this way. New routes
  `/admin/update-check` (cached, `?force=1` to poll) and `/admin/auto-update`
  (GET/POST); the cached result and the toggle are also exposed in
  `/admin/status`. Nothing runs during the first 5 minutes of uptime, and
  `autoUpdate` is part of the settings backup. Covered by
  `scripts/test-autoupdate.mjs`.
- **Swahili language (sw)** (`web.15`) — 45th interface language and first
  East-African language: full UI catalogue, complete in-app help corpus,
  SEO variant and offline precache.
- **Bengali language (bn)** (`web.14`) — 44th interface language: full UI
  catalogue, complete in-app help corpus, SEO variant and offline precache.
- **Filipino language (fil)** (`web.13`) — 43rd interface language: full UI
  catalogue, complete in-app help corpus, SEO variant and offline precache.
- **Thai language (th)** (`web.12`) — 42nd interface language: full UI
  catalogue, complete in-app help corpus, SEO variant (localized
  title/description, hreflang, sitemap) and offline precache.
- **Indonesian language (id)** (`web.11`) — 41st interface language:
  full UI catalogue and complete in-app help corpus in Bahasa Indonesia,
  registered in the language picker and precached for offline use.

### Changed
- **Admin traffic charts: bars → line charts** (`web.10`) — the three
  per-day charts (visits, new vs returning, languages) are now SVG line
  charts with a numbered vertical axis and gridlines, so the trend reads
  in figures at a glance — especially on phones, where the old
  hover-tooltips never worked. Date labels thin out automatically on
  narrow screens; points keep desktop tooltips as a bonus.

### Added
- **Admin traffic: bot-noise estimate** (`web.9`) — each visit ping is
  classified bot-like (automated user-agent, or no usable
  `Accept-Language` header) or clean, into a separate counter; the
  "What visitors run" highlight line shows the share as a noise-floor
  estimate. Nothing is filtered — visit counters are unchanged.
- **Invite-friends dialog + invite landing** (`web.7`; `web.8` ships the
  dialog stylesheet that was missing from the `web.7` push, plus inline
  critical styles and a native-share fallback so the dialog can never
  again fail invisibly) — the waiting-room
  "Invite friends" button now opens a share dialog with a QR code (scan
  across the room), the link with a copy button, WhatsApp / Telegram /
  e-mail / SMS shortcuts, and the native share sheet on phones (vendored
  MIT `qrcode-generator`, lazy-loaded). On the invitee side, opening a
  share link shows a banner on the login screen naming the table and
  pre-focuses the nickname field. The password is still never part of
  the link.
- **Admin traffic breakdowns: expand + language trend** (`web.6`) — a
  "Show all" button unfolds the full ranking (all languages / systems /
  browsers) behind the top-8 view, and the Language view gains a per-day
  stacked chart over the last 14 days. The proxy now records a per-day
  language counter alongside the cumulative one (same anonymous ping, same
  retention and cardinality cap); history starts when the proxy restarts on
  this version.
- **BBC Anthem table theme and its matching card back** (by BaShFX), following
  the upstream 2.1.7 release (`web.1`).
- **Automatic backup to a local folder** (`web.5`) — the full web backup file
  (`pokerth-web-backup.json`) is kept up to date in a folder picked once via
  the File System Access API (same mechanism as the automatic `.pdb` log). If
  the browser storage comes up empty at startup while a folder is remembered,
  a banner offers a one-click restore. Desktop Chrome, Edge and Opera only;
  the manual export/import path is unchanged everywhere else. The client also
  now requests **persistent storage** (`navigator.storage.persist()`), so
  settings, achievements and stats survive the browser's automatic cleanup.

### Security
- **Proxy hardened against connection floods** (`web.3`). Two new guards in
  `proxy.js`, complementing the existing per-IP upgrade rate limit and
  per-connection frame limits:
  - *Per-IP concurrent socket cap* — one IP may hold at most 20 open
    WebSockets (game bridges + notify channels); further upgrades are refused
    with 429 before any upstream bridge is built. Configurable via
    `PROXY_MAX_WS_PER_IP` (0 disables).
  - *First-packet timeout* — a bridge whose client sends no data within 20 s
    is closed and its upstream TCP connection destroyed immediately (no
    reconnect grace), so mute-connection floods cannot pin resources.

### Fixed
- **White launch screen on iOS home-screen app** (`web.4`). iOS ignores the
  manifest `background_color` and showed a plain white screen while the PWA
  booted. Dedicated `apple-touch-startup-image` launch screens (dark
  background + logo, one per device size and orientation) now cover the boot
  phase, matching the in-app boot splash.
- **Admin panel caught up with the 40-language catalogue.** The welcome-message
  and poll editors were missing the four newest languages (Arabic, Persian,
  Hebrew, Urdu), so those messages could not be written for them; the
  environment-stats blurb also still said "36 languages" (`web.2`).
- **Two web players can now sit at the same table.** The server refuses two
  players joining a table from the same IP address (anti-collusion check), and
  every web player used to reach the server with the proxy's address — so any
  two web players collided ("IP address blocked"). The proxy now forwards each
  player's real address to the server (PROXY protocol v1, trusted-proxy setup
  on the official server side with the 2.1.7 deployment), and the ranking no
  longer treats all web players as a single player.

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
