# PokerTH Web Client

> A modern, mobile-friendly browser client for [PokerTH](https://github.com/pokerth/pokerth) — the legendary open-source Texas Hold'em poker game.

---

## Why this project exists

I have been playing PokerTH for years and have a deep appreciation for the incredible work the PokerTH team has put into this game over so many years. **Thank you** to every contributor who built and maintained it. ❤️

One day I wanted to play a family LAN game with my wife and teach poker to my kids — on tablets and phones, without installing anything. The problem: **there is no official web client for PokerTH**. You need the native desktop app, which does not run on iOS or Android.

So I sat down and built one.

This project is a **web frontend** that connects to any PokerTH server directly from the browser, with no app installation needed. It is designed to work great on phones and tablets so that family poker nights are just a URL away.

---

## Screenshots / Demo

> *(add screenshots here once you have them)*

---

## Features

### Connection
- **4 login modes**: LAN (free nickname), Private server – Guest, pokerth.net – Guest, pokerth.net – Registered account
- TLS support (required for pokerth.net, optional for LAN)
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
- Pre-flop hand-strength hint displayed below the table
- Pot strip showing hand number, total pot, and current betting round

### Player experience
- **Emoji avatar** selector: 🎭 button → 43 avatars (animals, fantasy, fun characters…)
- Avatars visible by all players in real time (broadcast via proxy `AVATAR:pid:emoji`)
- Anti-flicker cache so avatars survive seat re-renders
- Bots always show 🤖
- **Session statistics** panel (click your avatar): hands played, wins, win rate, net gain/loss, best/worst hand, last 5 hands with card history

### Chat & reactions
- In-lobby chat and in-game chat (dropdown panels)
- 25 emoji reactions with 6-second counter, broadcast to all players

### Comfort features
- Browser notifications when it is your turn (background tab)
- Tab title flashes: ⚡ YOUR TURN — PokerTH
- Keyboard shortcuts: **F** = Fold, **C** / Space = Call, **R** = Raise, **A** = All-in
- Sound effects: actions, win fanfare, urgent-timer warning
- Full EN / FR language toggle (complete i18n)
- Fullscreen mode on all screens
- Poker hand reference overlay (? button)

### PWA
- `manifest.json` + Service Worker (`sw.js`) for offline caching
- Installable on mobile and desktop ("Add to Home Screen")

---

## Architecture

Browsers cannot open raw TCP/TLS connections to classic PokerTH servers. This project bridges the gap with a tiny Node.js proxy:

```text
Browser WebSocket  ⇄  proxy.js (Node.js)  ⇄  PokerTH TCP/TLS server
```

The proxy also serves the static files and relays two custom broadcast messages to all connected clients:

| Message | Purpose |
|---|---|
| `REACT:pid:emoji` | Emoji reaction from a player |
| `AVATAR:pid:emoji` | Avatar emoji update |

### Repository layout

```text
pokerth-web-client/
├── proxy.js                 # WS→TCP proxy + static HTTP server
├── public/
│   ├── pokerth-client.html  # HTML shell + inline head scripts (72 KB)
│   ├── pokerth.js           # Full application logic (164 KB)
│   ├── pokerth.css          # Styles (65 KB)
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service Worker
├── package.json
├── .gitignore
├── LICENSE
└── README.md
```

---

## Requirements

- **Node.js 18** or newer
- **npm**
- A modern browser (Chrome, Firefox, Safari, Edge)
- A running PokerTH server (local LAN or remote)

---

## Installation

```bash
git clone https://github.com/narmod/pokerth-web-client.git
cd pokerth-web-client
npm install
```

---

## Running

### Standard (with TLS, for pokerth.net)

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

---

## Quick start — LAN family game

1. Run the proxy on any computer on your local network.
2. Find that computer's local IP (e.g. `192.168.1.10`).
3. Open `http://192.168.1.10:8080` on any phone or tablet on the same Wi-Fi.
4. Choose **LAN** login mode, pick a nickname, and join or create a table.
5. Deal cards and enjoy!

---

## Known limitations

- Registered-account authentication is not fully implemented.
- The PokerTH Protobuf protocol is still handled manually in parts of the code.
- Reconnection handling can be improved.
- The client code is mostly contained in a single HTML/JS file and would benefit from a module split.
- More protocol tests are needed before calling the client production-ready.

---

## Roadmap / Suggested next steps

1. Replace manual Protobuf parsing with generated classes from `pokerth.proto`.
2. Split the client into maintainable ES modules.
3. Add automated protocol tests.
4. Improve reconnection and error handling.
5. Docker image for easy self-hosting.
6. Complete registered-account authentication.
7. More avatar options and customisation.

---

## License

This project is licensed under the **GNU Affero General Public License v3.0 or later** — the same license as PokerTH itself.

---

## Acknowledgements

A huge thank you to the entire **PokerTH team** for creating and maintaining such a wonderful open-source poker game over all these years. This project would not exist without your work. 🙏
