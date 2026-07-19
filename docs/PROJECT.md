# Project overview

PokerTH Web Client is a modern, browser-based interface for
[PokerTH](https://www.pokerth.net/), the long-running open-source Texas Hold'em
game. It lets players join the existing PokerTH server ecosystem — or play
offline against bots — from any desktop, tablet, or phone browser, with no
native install. It is developed in coordination with the upstream PokerTH
project, aiming to align closely with the official QML client (currently the 2.1.3
build) while staying fully compatible with current PokerTH servers.

This document is a high-level map of *what the project is* and *how it fits
together*. For installation, hosting, and the complete feature list, see the
[README](../README.md); for what's planned, see [ROADMAP.md](ROADMAP.md).

## Vision

Make PokerTH playable from a browser on any device, so a new player can be at a
table in seconds without downloading the historical Qt desktop client — while a
self-hoster can stand up their own instance with a single command. The client is
built to complement the official PokerTH infrastructure, not replace it: it
speaks the same protocol, connects to the same servers, and reuses the official
look and assets.

## Goals

- A modern, mobile-first web interface for PokerTH (phones, tablets, desktop).
- Full compatibility with existing PokerTH servers (public `pokerth.net`,
  dedicated, and LAN).
- Visual and behavioural fidelity to the official QML client (layout, colours,
  poker terms kept in English).
- A zero-dependency offline Training mode, so the app is useful with no server
  at all.
- Dead-simple self-hosting: one-liner installer, Docker image, admin console.
- Open source under the same AGPL licence as PokerTH.

## How it works (architecture)

Browsers can't open raw TCP/TLS sockets, and PokerTH servers speak a binary
Protobuf protocol over TCP (TLS on the public server). A small Node proxy
bridges the two:

```text
Browser  ⇄  WebSocket  ⇄  proxy.js  ⇄  TCP / TLS  ⇄  PokerTH server
(the web client)         (Node + ws)              (pokerth.net, dedicated, or LAN)
```

Besides bridging sockets, `proxy.js` serves the static client over HTTP and
exposes a small set of JSON endpoints (version check, client defaults, deck/
table/theme manifests, the shared leaderboard, and the token-gated `/admin/*`
API). It is hardened against abuse with a host **and** port allowlist, so it
cannot be used as an open relay or to reach local services such as SSH or MySQL.

Training mode is different: it never touches the network. The client's socket
factory returns a **FakeServer** that simulates the lobby and protocol entirely
in the browser, so solo play against bots works fully offline — including as an
installed PWA.

```text
Browser  ⇄  in-memory FakeServer + local engine + bots   (Training mode: no proxy, no network)
```

## Core components

- **Web client** (`public/`) — Vanilla JavaScript, no framework. The application
  logic is split into focused ES modules under `public/modules/` — `net`
  (protocol, session, message handlers), `game` (state, seat rendering, hand
  flow, showdown), `ui` (action bar, chat, panels), `i18n` (36 languages),
  `theme` (multi-axis theming + presets), `sounds`, `music`, and the offline
  engine + bots — with `pokerth.js` reduced to a thin orchestrator loaded as a
  native `type="module"`.
- **Proxy / server** (`proxy.js`) — Node + `ws`. WebSocket↔TCP/TLS bridge,
  static HTTP server, JSON API, and the admin backend: live status, self-update,
  package management, broadcasts, leaderboard, traffic analytics, and an optional
  MySQL/MariaDB mirror.
- **Protocol layer** (`public/proto/`) — The PokerTH wire protocol as a generated
  Protobuf bundle (`pokerth-bundle.mjs`), built from `pokerth.proto` (84 message
  types) via `scripts/build-proto.mjs`.
- **Offline engine** (`public/modules/offline/`) — A self-contained Texas
  Hold'em engine (`engine.mjs`), bot AI using Monte-Carlo equity against the real
  number of opponents (`bots.mjs`), and a `FakeServer` (`server.mjs`) that mimics
  the real lobby/protocol so Training mode reuses the same UI code path.
- **Theming** (`public/modules/theme.mjs`, `public/themes/`, `public/cards/`) —
  Independently selectable axes (UI palette, table felt, card deck, action
  buttons, chip pucks, seat style) with one-click presets, plus a card-deck **Studio** at `/studio`.
- **Admin console** (`public/admin.html`, served at `/admin`) — Token-protected
  maintainer UI over the proxy's `/admin/*` API; can be hidden entirely (returns
  a plain 404 when disabled).
- **Deployment** — `install.sh`, a one-liner installer/updater for Debian/Ubuntu
  (Node 20 + PM2 as a non-root service), plus a multi-arch `Dockerfile` and
  `docker-compose.yml`. A `pokerth-web` CLI wraps day-to-day management.

## Technology

- **Runtime:** Node.js 18+ (20 LTS recommended); `ws` at runtime, plus `mysql2`
  only when the optional database mirror is enabled.
- **Client:** plain HTML / CSS / JavaScript with ES modules — no build step for
  the app itself.
- **Protocol:** PokerTH Protobuf (`protobufjs` is used at build time to generate
  the bundle).
- **Packaging:** PWA (manifest + network-first Service Worker), Docker, PM2.
- **Licence:** AGPL-3.0-or-later.

## Project status

The core is mature and in active use. The full gameplay loop works end to end —
lobby, table creation, joining, betting, and showdown — across guest, registered
(`pokerth.net`), and LAN/dedicated connections, with TLS, auto-reconnect
(including Wi-Fi ↔ cellular hand-off), and spectator mode. The offline Training
mode, 36-language i18n, multi-axis theming, PWA install, shared leaderboard, and
the admin console are all shipped.

Current focus and what's next (see [ROADMAP.md](ROADMAP.md) for detail):

- **Now:** refining the registered-account login flow on `pokerth.net`.
- **Next — code health:** add linting and formatting, replace the remaining
  `window.*` bridges between the orchestrator and the modules with direct ES
  imports, and move the hand-written Protobuf paths toward generated classes
  with encode/decode tests. (The module split and a deterministic test suite are
  already done.)
- **Later:** local multiplayer over WebRTC, voice chat, alternative table shapes,
  persistent hand history, and regular tagged releases.

## See also

- [README.md](../README.md) — features, install, hosting, and configuration.
- [ROADMAP.md](ROADMAP.md) — shipped / in-progress / planned.
- [SECURITY.md](SECURITY.md) — security model and hardening notes.
- [CONTRIBUTING.md](../CONTRIBUTING.md) — how to contribute, including
  translations.
