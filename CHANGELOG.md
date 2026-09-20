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

### Added

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

