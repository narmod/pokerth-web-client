# Changelog

All notable changes to this project are summarised here. It loosely follows
[Keep a Changelog](https://keepachangelog.com/) and Semantic Versioning
(currently a `0.x` beta line). Granular, per-build tags are published on the
[GitHub Releases](https://github.com/narmod/pokerth-web-client/releases) page;
this file captures what matters to players and operators.

## [Unreleased]

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
