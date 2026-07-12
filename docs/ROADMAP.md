# Roadmap

This is a living document. The client began as a way to play poker with family on
phones and tablets, and is growing toward something the wider PokerTH community can
use too. Items are grouped by status rather than fixed phases.

> **Tracking the official client, continuously.** The in-game screen is kept aligned
> with PokerTH's official QML client on an ongoing basis — as the official client
> evolves (currently the 2.1.3 build), the web client re-syncs to match. See
> *Official client (QML) tracking* below.

## ✅ Shipped

**Core gameplay**
- Full flow: lobby, table creation, joining, betting, showdown.
- Three connection choices (LAN / Dedicated, pokerth.net, Training) + Guest-mode toggle.
- Registered-account login on pokerth.net (account password sent over TLS), alongside guest and LAN.
- TLS support (required for pokerth.net, optional for LAN) with smart auto-toggle.
- Exponential-backoff auto-reconnect with live countdown, plus seamless reconnect across
  Wi-Fi ↔ cellular switches (the proxy keeps the upstream alive for a 2-minute grace period).
- Spectator mode.
- Advanced table setup: blinds, timeout, max players, password, blind-increase schedule,
  game-style presets, and fill-with-bots.

**Training mode (offline)**
- 100% offline solo play in the browser — local engine, no server or connection.
- Bot AI using Monte-Carlo equity vs the real number of opponents.
- Correct short-stack push/fold play.
- Difficulty levels (Easy / Mixed / Normal / Hard), chosen per table.
- Five bot archetypes (Rock, TAG, LAG, Calling-station, Maniac) — each with its own
  pre-flop range, raising tendency, calling threshold and bluff rate, orthogonal to
  difficulty, and with bot names that match their play-style.
- Position-aware pre-flop play: steal wider from the button/cutoff, tighten under the gun.
- Post-flop aggression: continuation bets by the pre-flop aggressor and semi-bluffs on strong draws.

**Appearance & theming**
- Multi-axis customisation, each axis independently selectable: UI palette, table felt,
  card deck, action-button style, chip pucks, and seat style.
- One-click presets — PokerTH Dark (the default, reproducing the official client's look),
  PokerTH Light, and Green Casino — plus gallery themes (Midnight Blue, Graphite,
  Royal Purple, Sleek).
- Light/dark aware: per-theme `color-scheme` and a dynamic browser `theme-color` that
  follows the active theme.
- Theme panel fully localised in all 36 languages, with live switching and a live preview
  of each deck.
- Semantic-colour system so the whole UI recolours consistently per theme — gold uses the
  official QML accent (`#E3C800`) and is kept only for deliberate game assets (dealer
  button, chip denominations, win bursts).
- Official card decks: seven decks ported straight from the QML 2.1.3 client, alongside the
  gallery decks, each with a live preview.
- Official table style: the default "PokerTH" felt now points to the client's own
  `default` table asset, and the Matrix table is kept re-synced with the 2.1.3 build.
- Style import: install a table/deck/back from a `.zip`, parsing the four 2.1.3 style keys.
- Coloured glossy action buttons (Fold red / Check-Call blue / Raise green / All-In orange)
  and an animated flaming-chip emblem on the login screen (respects reduced-motion).
- Six theme-aware seat "packs" (Classic, Chip, Plate, Card, Compact, Bar), switchable like
  decks and adapting to dark/light; pack names kept in English across all languages. The
  default adapts to the device (Compact on phones, Plate on tablet/desktop); an explicit
  choice is saved and always wins.
- Responsive seat layout: on phones and tablets the seats tighten around the felt so players
  stay close to the table; desktop keeps the wider layout.

**Server administration**
- Token-protected web admin panel at `/admin`, which can be completely hidden
  (`/admin*` returns a plain 404 when disabled).
- Server tab: live status (version, uptime, players, sockets); one-click self-update with
  or without a restart; scheduled restart/update with an advance countdown shown to players;
  app-mode toggles to show/hide Offline, LAN and pokerth.net on the connect screen; proxy
  settings (extra allowed hosts, session-grace window, connection gap).
- Client defaults pushed to new visitors: default login form, default theme, default
  in-game settings, default table-creation settings, and a server identity (name + tagline)
  shown on the login screen.
- Broadcasts: send a message now or on a recurring schedule (interval / daily / every-N-days /
  weekly / monthly / once), plus a multilingual first-visit welcome/rules modal with on-device
  auto-translation (Chromium Translator / LanguageDetector APIs, graceful fallback to the
  operator's text).
- Packages: install or remove card decks and table styles from a `.zip` or URL, and
  enable/disable each one without deleting its files.
- Shared family leaderboard persisted on the server, sortable, with a configurable auto-reset
  (off / daily / monthly / yearly) and on-demand reset.
- Traffic analytics: privacy-friendly visit and unique-visitor counts over rolling windows
  (today → 365 days), a daily trend chart, new-vs-returning split, and a per-server breakdown
  (pokerth.net / LAN / Offline); CSV/JSON export and reset, with a `/privacy` page documenting
  what is and isn't collected.
- Optional MySQL/MariaDB mirror of the traffic, leaderboard and broadcasts tables (the JSON
  files stay the live source of truth); configurable from the admin panel, the
  `pokerth-web db-config` CLI, or `MYSQL_*` environment variables, with a live "Test connection"
  and reconnect-on-save.
- Music tab: manage the in-app background-music playlist — upload tracks, edit titles/credits/
  licence links, reorder, and enable/disable each one.
- Delegate API keys: issue named keys that unlock only chosen admin sections (Broadcasts, Music,
  Packages, Leaderboard) from the admin **Keys** tab or `pokerth-web token`; created/revoked with the
  master token only, hot-reloaded with no restart.
- Clickable links in broadcasts and the welcome/rules message; an operator-set per-mode default
  table name.

**Experience**
- Mobile-first design for phones and tablets.
- Adaptive seat layout that scales from 2 to 10 players per screen size, with four distinct
  portrait renderings — automatic ring, official fixed slots, elliptical "necklace", and a
  free drag-and-drop custom layout — and seat sizing tuned to the official 2.1.3 client.
- Accessibility & mobile polish: honours `prefers-reduced-motion` and reduced-transparency,
  with touch-comfort tweaks (overscroll containment, touch-callout suppression on cards/buttons).
- Emoji avatars (500+) and custom image avatars, broadcast live, with anti-flicker caching.
- Session statistics panel (hands, wins, win rate, net result, best/worst hands).
- In-game and lobby chat, plus 30 emoji reactions that now interoperate cross-client through a
  shared `/emoji` chat channel (and work on pokerth.net too).
- Unified header banner across the connect, lobby and in-game screens, with frameless
  monochrome SVG icons (identical on every device) and floating drop-down menus. The in-game
  header centres the table name and shows Admin / Public-Private status badges in the
  official palette.
- Redesigned waiting room: your details and chat sit centre-stage with the game list beside
  them on desktop, an animated "waiting for players" status, and a tap-to-expand accordion
  listing each table's seated players.
- In-game panels open as compact floating windows anchored under their round on-felt button
  (chat, emoji, hand log) instead of taking over the screen — each movable, resizable and
  snap-back-able. A new draggable **Hand-odds (Combinaisons)** window joins them, and the
  table zoom is collapsible everywhere. On phone portrait the action bar hugs the bottom
  edge for a full-screen table.
- Music and sound split: a dedicated **Music player** panel (with game-sound settings moved
  out to Advanced options).
- Ranking modal (PokerTH / BBC / WEC leaderboards with seasons, All-Time, search and
  pagination) plus per-player profile cards, via same-origin `/api/ranking` and
  `/api/player` relays.
- In-game invitations from the lobby players list (native protocol — reaches official
  clients too), community vote-kick petitions, and country flags on avatars.
- Player-comfort moderation: ignore a player (persisted), locally mute reactions, and an
  option to strip emojis from received chat.
- Lobby game cards show player counts, status, and each table's blind level and raise schedule.
- Sound effects for every action.
- Internationalisation in 36 languages, auto-detected and switchable on the fly.

**Official client (QML) tracking — kept aligned on an ongoing basis**
- The in-game screen is audited feature-by-feature against PokerTH's official QML client
  (sources extracted from the official desktop AppImage and Android APK builds) and
  re-synced as that client evolves. Feature parity was first reached in the `v0.3.166`
  series; work since has been fidelity tuning against the newer **2.1.3** build. Feature
  coverage includes:
  - F1–F8 keyboard shortcuts matching the official client (fold / check-call / bet-raise /
    all-in, alternate key order, playing-mode switches), plus F5 to show your cards after
    a hand that ended with no showdown.
  - Game status bar: hand number, game ID, total pot with the current round's bets on
    their own line, and a live players-remaining count.
  - Winning-hand badge under the community cards at showdown.
  - Zoom-follow (opt-in, mobile): the table view auto-pans to the active seat and steps
    back out to the full table at showdown.
  - Full chat: Tab nickname-completion with cycling, ↑ / ↓ message history, and a
    1,000+ emoji picker (frequent + full grid) alongside the original 30 reactions.
  - Admin "Kickban" button in the player card.
  - Sound categories (actions / blind raises / lobby chat / network events), each
    independently toggleable, plus three additional official sound samples.
  - Card-back as its own axis, independent from the card deck, with custom-image import.
  - Reduced-effects mode for low-powered devices, a gallery of 89 official PokerTH
    avatars, a lobby stats bar (players / running / open games), and hand-category icons
    in the win-probability panel.
  - Ping indicator on your own avatar, and an optional auto-return to the lobby when a
    game ends.
- Fidelity pass against the **2.1.3** build:
  - Action bar matched to the official layout: localized "Suivre \$X / Relancer \$X"
    labels, a compact All-In / "Tapis" button (~52 px, no amount shown), quick-bet
    1/3 · 1/2 · Pot buttons in the official dark green with no amount labels, the official
    card ratio, and a crisp pulsed gold turn-glow.
  - Pre-selection preview desaturated uniformly when it is not your turn.
  - App header height matched to the official topBar (38 px, 30 px in landscape-compact).
  - Seat geometry tuned to 2.1.3: self-weight 0.5, fill-cap 1.9 / 2.3, and mode-dependent
    self-box sizing.
- Follow-up fixes from official-client community feedback: chat length capped to match
  the server limit, a player's current table shown in the lobby players list, and the
  players-remaining counter above.
- Client kept compatible with server-side PokerTH 2.1.0 (build-ID check).

**Platform**
- Installable PWA (mobile and desktop; works offline in Training mode).
- Versioned, network-first Service Worker with a "new version" banner.
- Docker image (multi-arch) + one-liner installer / updater / uninstaller.

## 🔨 Now (in progress)

- **Registered-account authentication** — refining the pokerth.net login flow; this is the
  current focus, with the Code-health work below up next.

## ⏭️ Next

- **Code health**
  - Split the large `pokerth.js` into focused modules (network, protocol, state, UI). The
    modularisation is mapped out; the main blocker is the many inline `onclick=` handlers in
    the HTML.
  - Add linting, formatting, and a small automated test suite.
  - Move hand-written Protobuf handling toward generated classes + encode/decode tests.

## 🌅 Later / Ideas

- **Local multiplayer over WebRTC** — peer-to-peer play over a local Wi-Fi hotspot with
  QR-code signalling, no server needed.
- **Voice chat** at the table (WebRTC).
- Alternative table shapes (e.g. a D-shaped / trapezoidal table).
- Persistent hand history and export (beyond the current last-5-hands view).
- In-game invitations.
- Tournaments / multi-table.
- Native translation passes for languages currently falling back to English.
- Continued polish toward a wider community release (regular tagged releases).

---
Have an idea or hit a bug? Open an issue — feedback from real games is what shaped
this client.
