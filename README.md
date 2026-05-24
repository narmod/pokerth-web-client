# PokerTH Web Client

> A modern, mobile-friendly browser client for [PokerTH](https://github.com/pokerth/pokerth) — the legendary open-source Texas Hold'em poker game.

---

## Why this project exists

I have been playing PokerTH for years and have a deep appreciation for the incredible work the PokerTH team has put into this game over so many years. **Thank you** to every contributor who built and maintained it. ❤️

One day I wanted to play a family LAN game with my wife and teach poker to my kids — on tablets and phones, without installing anything. The problem: **there is no official web client for PokerTH**. You need the native desktop app, which does not run on iOS or Android.

So I sat down and built one.

This project is a **web frontend** that connects to any PokerTH server directly from the browser, with no app installation needed. It is designed to work great on phones and tablets so that family poker nights are just a URL away.

---

## Screenshots

<table>
  <tr>
    <td align="center"><strong>Connect screen</strong></td>
    <td align="center"><strong>Lobby</strong></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/01-connect.png" alt="Connect screen" width="240"/></td>
    <td><img src="docs/screenshots/02-lobby.png" alt="Lobby" width="240"/></td>
  </tr>
  <tr>
    <td align="center"><strong>Game table</strong></td>
    <td align="center"><strong>Action bar</strong></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/03-game.png" alt="Game table" width="240"/></td>
    <td><img src="docs/screenshots/04-actions.png" alt="Action bar" width="240"/></td>
  </tr>
</table>

---

## Features

### Connection
- **4 login modes**: LAN (free nickname), Private server – Guest, pokerth.net – Guest, pokerth.net – Registered account
- **Authenticated login on pokerth.net** — credentials are carried in the `InitMessage.clientUserData` field as per the v2.0 protocol (TLS-wrapped, no more SCRAM-SHA-1)
- TLS support (required for pokerth.net, optional for LAN). The TLS box auto-checks itself when you pick the registered-account mode.
- Auto-fill of `host = pokerth.net` and `port = 7234` when a pokerth.net mode is selected — other modes keep the auto-detected hostname
- Remember nickname / credentials via `localStorage`
- Refresh button and fullscreen toggle on every screen

### Lobby
- Real-time table list with player counts and status badges
- **⚡ Join or Create** — one-tap auto-join or table creation
- Advanced table creation: blinds, timeout (default 15 s), max players (default 5), bots fill, optional password
- Spectator mode (👁 Watch)
- Lobby chat

### Poker table
- Seats positioned according to server order, **locked after the first deal** (no mid-game layout jumps)
- Casino-style chip tokens: SB 🔵, BB 🔴, Dealer ⚫ gold — with `chipPop` animation
- SVG arc timer around the active player's avatar + seconds badge below
- **Card deal animation**: cards fly from the centre to each seat at the start of every hand
- **Chip slide animation**: chips glide toward the pot on bet / call / raise
- **3D flip animation** for community cards (flop × 3, turn, river)
- Pre-flop hand-strength hint (Sklansky-Malmuth chart)
- **Post-flop win probability** — Monte Carlo simulation against random opponent ranges
- **Spades vs clubs visual distinction**: spades get a subtle blue tint so ♠ and ♣ never get confused on small screens
- Pot strip showing hand number, total pot, and current betting round

### Player experience
- **Emoji avatar** selector: 🎭 button → 43 avatars (animals, fantasy, fun characters…)
- Avatars visible by all players in real time (broadcast via proxy `AVATAR:pid:emoji`)
- Anti-flicker cache so avatars survive seat re-renders
- Bots always show 🤖
- **Session statistics** panel (click your avatar): hands played, wins, win rate, net gain/loss, best/worst hand, last 5 hands with card history
- **Win streak badge** on seats for players on a hot run

### Chat & reactions
- In-lobby chat and in-game chat (dropdown panels)
- 25 emoji reactions with 6-second counter, broadcast to all players

### Comfort features
- Browser notifications when it is your turn (background tab)
- Tab title flashes: ⚡ YOUR TURN — PokerTH
- Keyboard shortcuts: **F** = Fold, **C** / Space = Call, **R** = Raise, **A** = All-in
- Sound effects: distinct sounds for fold / check / call / raise / all-in / shuffle / drumroll / bad-beat / win fanfare, plus urgent-timer warning
- Full EN / FR language toggle (complete i18n)
- Fullscreen mode on all screens
- Poker hand reference overlay (? button)
- Exponential-backoff auto-reconnect with live countdown

### PWA
- `manifest.json` + Service Worker (`sw.js`) with versioned **network-first** cache
- New-version notification: the page tells the user when an updated service worker is ready and applies the update on the next reload
- Installable on mobile and desktop ("Add to Home Screen")

---

## Login modes & transport

Each login mode uses a different transport. Knowing which is which can save a lot of head-scratching when debugging a connection problem.

| Mode | Target server | Transport | Notes |
|---|---|---|---|
| **LAN** (free nickname) | your local PokerTH server | proxy → TCP raw | TLS off by default |
| **Private server — Guest** (`unauth`) | your private remote PokerTH server | proxy → TCP or TLS (your choice) | The default for self-hosted setups |
| **pokerth.net — Guest** | `wss://www.pokerth.net:443/pthlive` | direct WebSocket (TLS) | Bypasses the proxy entirely |
| **pokerth.net — Registered account** | `wss://www.pokerth.net:443/pthlive` | direct WebSocket (TLS) | Same endpoint as guest; the password is sent in `InitMessage.clientUserData` |

> Notice that for both pokerth.net modes the proxy is **not used** — the browser opens a direct WebSocket to `pokerth.net:443`. The proxy is only needed for LAN and self-hosted servers, which speak raw TCP/TLS.

---

## Architecture

Browsers cannot open raw TCP/TLS connections to classic PokerTH servers. This project bridges the gap with a tiny Node.js proxy:

```text
Browser WebSocket  ⇄  proxy.js (Node.js)  ⇄  PokerTH TCP/TLS server
```

For the pokerth.net public server, the browser connects **directly** to the official `wss://www.pokerth.net:443/pthlive` endpoint and the proxy is bypassed.

The proxy also serves the static files and relays two custom broadcast messages to all connected clients:

| Message | Purpose |
|---|---|
| `REACT:pid:emoji` | Emoji reaction from a player |
| `AVATAR:pid:emoji` | Avatar emoji update |

### Repository layout

```text
pokerth-web-client/
├── proxy.js                 # WS→TCP/TLS proxy + static HTTP server (~11 KB)
├── public/
│   ├── pokerth-client.html  # HTML shell + inline head scripts (~74 KB)
│   ├── pokerth.js           # Full application logic (~174 KB)
│   ├── pokerth.css          # Styles (~66 KB)
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service Worker (versioned cache)
│   └── favicon-*.png        # PWA icons
├── docs/
│   └── screenshots/         # Screenshots used in this README
├── Dockerfile               # Multi-arch image (node:20-alpine base)
├── docker-compose.yml       # One-shot self-host config
├── package.json
├── LICENSE                  # AGPL-3.0-or-later
└── README.md
```

---

## Requirements

- **Node.js 18** or newer
- **npm**
- A modern browser (Chrome, Firefox, Safari, Edge)
- A running PokerTH server (local LAN, your own remote server, or pokerth.net)

---

## Installation

```bash
git clone https://github.com/narmod/pokerth-web-client.git
cd pokerth-web-client
npm install
```

---

## Running

### Standard (TLS enabled, recommended)

```bash
npm start
```

Then open **http://localhost:8080** in your browser.

### LAN (no TLS)

```bash
npm run start:lan
```

### Custom port

```bash
node proxy.js 8090
```

### Development (ignore untrusted TLS certificate)

```bash
npm run start:insecure
```

> ⚠️ `--insecure` disables TLS certificate verification. Use only for local development.

### PM2 (production / persistent)

```bash
pm2 start proxy.js --name pokerth-web
pm2 save
```

### Docker

The repository ships with a `Dockerfile` and a `docker-compose.yml` for one-command self-hosting:

```bash
docker compose up -d
```

The proxy will be available on `http://<host>:8080/`.

---

## Quick start — LAN family game

1. Run the proxy on any computer on your local network.
2. Find that computer's local IP (e.g. `192.168.1.10`).
3. Open `http://192.168.1.10:8080` on any phone or tablet on the same Wi-Fi.
4. Choose **LAN** login mode, pick a nickname, and join or create a table.
5. Deal cards and enjoy!

---

## Protocol notes

PokerTH speaks a length-prefixed Protobuf-based protocol over TCP. This client parses and emits a hand-written subset of those messages — there is no full Protobuf runtime in the browser, which keeps the bundle small.

A few things worth knowing if you plan to hack on this:

- The official PokerTH **v2.0** release (Feb 2026) dropped the `gsasl` dependency and **replaced SCRAM-SHA-1 with plain-text credentials inside the mandatory TLS tunnel**. Authenticated logins now simply set `InitMessage.login = authenticatedLogin (1)` and put the password (UTF-8, ≤ 256 bytes) into `InitMessage.clientUserData`.
- The proxy logs every parsed message in hex with a short description, which makes protocol debugging straightforward (`pm2 logs pokerth-web` if you run under PM2).
- Wire-type field numbers used by this client are documented inline in `public/pokerth.js` next to each `Proto.encode([...])` call, with references to `pokerth.proto` in the upstream repository.

---

## Known limitations

- The Protobuf protocol is still handled by a small hand-written encoder/decoder rather than generated classes.
- The client code is mostly contained in a single JS file and would benefit from a module split.
- More automated protocol tests are needed before calling the client production-ready.
- Spectator mode works but lacks a few quality-of-life touches (e.g. you cannot see other players' cards at showdown the same way the native client does).

---

## Roadmap / Suggested next steps

1. Replace the hand-written Protobuf encoder/decoder with generated classes from `pokerth.proto`.
2. Split the client into maintainable ES modules.
3. Add automated protocol tests with a mock PokerTH server.
4. Polish reconnection edge cases (currently exponential backoff with a 5-attempt cap).
5. More avatar options and a custom-emoji import.
6. Optional spectator-only view (read-only embed for streamers).

---

## License

This project is licensed under the **GNU Affero General Public License v3.0 or later** — the same license as PokerTH itself.

---

## Acknowledgements

A huge thank you to the entire **PokerTH team** for creating and maintaining such a wonderful open-source poker game over all these years. This project would not exist without your work. 🙏
