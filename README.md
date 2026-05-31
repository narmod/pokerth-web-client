# PokerTH Web Client

> A modern, mobile-friendly browser client for [PokerTH](https://github.com/pokerth/pokerth) — the legendary open-source Texas Hold'em poker game.

---

## Contents

<sub>📂 = collapsible section — click the **“Show…”** line to expand it.</sub>

- [🎮 Live demo](#live-demo)
- [Why this project exists](#why-this-project-exists)
- [Screenshots](#screenshots)
- [Features](#features)
- [Login modes &amp; transport](#login-modes-transport)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Quick install (one-liner)](#quick-install-one-liner) &nbsp;📂
- [Manual installation (Ubuntu / Debian)](#manual-installation) &nbsp;📂
- [Running locally (development)](#running-locally-development) &nbsp;📂
- [Quick start — LAN family game](#quick-start-lan)
- [Self-hosting on a Raspberry Pi](#raspberry-pi)
- [Protocol notes](#protocol-notes)
- [Known limitations](#known-limitations)
- [Roadmap / Suggested next steps](#roadmap)
- [License](#license)
- [Acknowledgements](#acknowledgements)


<a id="live-demo"></a>
## 🎮 Live demo

**Try it now: [https://pokerth.ddns.net/](https://pokerth.ddns.net/)**

Pick the **Private server — Internet Guest** login mode, choose any nickname, and play right away — no account, no install. The demo is hosted on a small VPS connected to a private PokerTH server, so feel free to create a table and invite friends.

> Tip: it works just as well on mobile — add it to your home screen for a fullscreen app feel.

---

## Why this project exists

I have been playing PokerTH for years and have a deep appreciation for the incredible work the PokerTH team has put into this game over so many years. **Thank you** to every contributor who built and maintained it. ❤️

One day I wanted to play a family LAN game with my wife and teach poker to my kids — on tablets and phones, without installing anything. The problem: **there is no official web client for PokerTH**. You need the native desktop app, which does not run on iOS or Android.

So I sat down and built one.

It started as a very simple interface — just enough to deal a hand around the table. But every family game brought new feedback ("I can't tell the suits apart on my phone", "whose turn is it?", "can we have avatars?"), and little by little those suggestions grew the bare-bones prototype into the much more complete client it is today.

This project is a **web frontend** that connects to any PokerTH server directly from the browser, with no app installation needed. It is designed to work great on phones and tablets so that family poker nights are just a URL away.

---

## Screenshots

<p align="center">
  <img src="docs/screenshots/01-connect.png" alt="Connect screen" width="260"/>
  <br/>
  <em>Connect screen — pick a login mode and join in seconds</em>
</p>

<table>
  <tr>
    <td align="center"><strong>Lobby &amp; chat</strong></td>
    <td align="center"><strong>Profile &amp; avatar</strong></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/02-lobby.png" alt="Lobby and chat" width="240"/></td>
    <td><img src="docs/screenshots/07-avatar.png" alt="Profile and avatar" width="240"/></td>
  </tr>
  <tr>
    <td align="center"><strong>Game table</strong></td>
    <td align="center"><strong>Action bar &amp; hand strength</strong></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/03-game.png" alt="Game table" width="240"/></td>
    <td><img src="docs/screenshots/04-actions.png" alt="Action bar and hand strength" width="240"/></td>
  </tr>
  <tr>
    <td align="center"><strong>Showdown &amp; results</strong></td>
    <td align="center"><strong>Session statistics</strong></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/05-win.png" alt="Showdown and results" width="240"/></td>
    <td><img src="docs/screenshots/06-stats.png" alt="Session statistics" width="240"/></td>
  </tr>
</table>

---

## Features

### Connection
- **4 login modes**: LAN (free nickname), Private server – Guest, pokerth.net – Guest, pokerth.net – Registered account
- Optional authenticated login over TLS
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
- **Emoji avatar** selector: 🎭 button → 500+ icons organised by category (animals, fantasy, fun characters…)
- Avatars visible by all players in real time (broadcast via proxy `AVATAR:pid:emoji`)
- Anti-flicker cache so avatars survive seat re-renders
- Bots always show 🤖
- **Session statistics** panel (click your avatar): hands played, wins, win rate, net gain/loss, best/worst hand, last 5 hands with card history
- **Win streak badge** on seats for players on a hot run

### Chat & reactions
- In-lobby chat and in-game chat (dropdown panels)
- 30 emoji reactions with 6-second counter, broadcast to all players

### Comfort features
- Browser notifications when it is your turn (background tab)
- Tab title flashes: ⚡ YOUR TURN — PokerTH
- Keyboard shortcuts: **F** = Fold, **C** / Space = Call, **R** = Raise, **A** = All-in
- Sound effects: distinct sounds for fold / check / call / raise / all-in / shuffle / drumroll / bad-beat / win fanfare, plus urgent-timer warning
- **Full i18n in 33 languages**, switchable on the fly and auto-detected from the browser locale — the complete official PokerTH language set plus Ukrainian, Romanian, Croatian and Serbian, with Brazilian and European Portuguese shipped as separate catalogues (pt-BR / pt-PT)
- Fullscreen mode on all screens
- Poker hand reference overlay (? button)
- Exponential-backoff auto-reconnect with live countdown

### PWA
- `manifest.json` + Service Worker (`sw.js`) with versioned **network-first** cache
- New-version notification: the page tells the user when an updated service worker is ready and applies the update on the next reload
- Installable on mobile and desktop ("Add to Home Screen")

---

<a id="login-modes-transport"></a>
## Login modes & transport

The client is designed first and foremost for **LAN and private self-hosted servers** — that is its intended use. Each mode uses a different transport, which is handy to know when debugging a connection problem.

| Mode | Target server | Transport | Notes |
|---|---|---|---|
| **LAN** (free nickname) | your local PokerTH server | proxy → TCP raw | TLS off by default |
| **Private server — Guest** (`unauth`) | your private remote PokerTH server | proxy → TCP or TLS (your choice) | The default for self-hosted setups |

The client can also connect to the public **pokerth.net** server (guest or registered account) over a direct TLS WebSocket, bypassing the proxy. Please use that responsibly and prefer your own LAN or private server for regular play, out of respect for the official PokerTH infrastructure.

---

## Architecture

Browsers cannot open raw TCP/TLS connections to classic PokerTH servers. This project bridges the gap with a tiny Node.js proxy:

```text
Browser WebSocket  ⇄  proxy.js (Node.js)  ⇄  PokerTH TCP/TLS server
```

When connecting to the public pokerth.net server, the browser connects directly over a TLS WebSocket and the proxy is bypassed.

The proxy also serves the static files and relays two custom broadcast messages to all connected clients:

| Message | Purpose |
|---|---|
| `REACT:pid:emoji` | Emoji reaction from a player |
| `AVATAR:pid:emoji` | Avatar emoji update |

### Repository layout

```text
pokerth-web-client/
├── proxy.js                 # WS→TCP/TLS proxy + static HTTP server
├── public/
│   ├── pokerth-client.html  # HTML shell + inline head scripts
│   ├── pokerth.js           # Full application logic
│   ├── pokerth.css          # Styles
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service Worker (versioned cache)
│   ├── modules/             # ES modules: i18n, sounds, and lang/ (33 locales)
│   ├── proto/               # Protobuf bundle & helpers
│   └── favicon-*.png        # PWA icons
├── docs/
│   ├── PROJECT.md
│   ├── ROADMAP.md
│   ├── SECURITY.md
│   └── screenshots/         # Screenshots used in this README
├── scripts/
│   └── build-proto.mjs      # Regenerates the protobuf bundle from .proto
├── install.sh               # Installer / updater / uninstaller (one-liner)
├── Dockerfile               # Multi-arch image (node:20-alpine base)
├── docker-compose.yml       # One-shot self-host config
├── package.json
├── LICENSE                  # AGPL-3.0-or-later
└── README.md
```

---

## Requirements

- **Node.js 18** or newer (Node 20 LTS recommended)
- **npm** (shipped with Node.js)
- **git**
- A modern browser (Chrome, Firefox, Safari, Edge)
- A running PokerTH server (local LAN, your own remote server, or pokerth.net)

---

## Quick install (one-liner)

<details>
<summary><b>📂 Show the one-liner install guide</b></summary>

On a fresh **Debian/Ubuntu** machine you can install everything — Node.js, PM2, the project, and a boot-persistent service — with a single command:

```bash
curl -sSL https://raw.githubusercontent.com/narmod/pokerth-web-client/HEAD/install.sh | bash
```

The installer asks a couple of questions (port, LAN/TLS mode, install directory), then runs the proxy under PM2 as a **non-root** user with start-on-boot. It is safe to re-run: an existing install is updated rather than duplicated.

> **Prefer to read before you run?** A healthy instinct for any `curl | bash` installer. Download and inspect it first:
>
> ```bash
> curl -sSL https://raw.githubusercontent.com/narmod/pokerth-web-client/HEAD/install.sh -o install.sh
> less install.sh        # review what it does
> bash install.sh        # then run it
> ```

When run without a terminal (CI / automation) the installer is fully non-interactive and takes its settings from environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | HTTP / WebSocket port |
| `NO_TLS` | _(unset)_ | set to `1` for LAN mode (`--notls`) |
| `INSTALL_DIR` | `<run-user home>/pokerth-web-client` | install location |
| `RUN_USER` | invoking user, or `pokerth` when run as root | non-root user that runs PM2 |
| `APP_NAME` | `pokerth-web` | PM2 process name |
| `SETUP_FIREWALL` | _(unset)_ | set to `1` to open the port in `ufw` |
| `ASSUME_YES` | _(unset)_ | set to `1` to skip the confirmation prompt |

Example:

```bash
PORT=8090 NO_TLS=1 ASSUME_YES=1 \
  bash -c "$(curl -sSL https://raw.githubusercontent.com/narmod/pokerth-web-client/HEAD/install.sh)"
```

### Updating and uninstalling

After a first install, a `pokerth-web` command is available to manage the service:

```bash
sudo pokerth-web update      # pull the latest version, reinstall deps, restart
sudo pokerth-web uninstall   # stop and remove the service
pokerth-web status           # show the PM2 status
```

The same actions work through the one-liner if you prefer not to use the command:

```bash
curl -sSL https://raw.githubusercontent.com/narmod/pokerth-web-client/HEAD/install.sh | bash -s -- update
```

`uninstall` removes the PM2 service, its boot entry, the state file and the `pokerth-web` command, then asks separately before deleting the install directory or the dedicated service user. It never touches Node.js, PM2 or apt packages.

For HTTPS (recommended — many mobile browsers block plain `ws://`), follow the Nginx + Let's Encrypt steps in the manual installation below.

</details>

---

<a id="manual-installation"></a>
## Manual installation (Ubuntu / Debian)

<details>
<summary><b>📂 Show the full step-by-step guide</b></summary>

Prefer to do it by hand, or need a custom setup? These are the full steps the one-liner automates. This walkthrough assumes a clean Ubuntu 22.04 / 24.04 or Debian 12 VPS. Adapt commands for other distributions.

### 1. Update the system

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install build tools, git and curl

```bash
sudo apt install -y curl git build-essential
```

### 3. Install Node.js 20 LTS (via NodeSource)

The Node.js shipped in Ubuntu's default repos is often too old. Use the official NodeSource repo to get a recent LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify:

```bash
node -v   # should print v20.x.x or newer
npm -v    # should print 10.x or newer
```

### 4. Install PM2 globally (process manager)

PM2 keeps the proxy alive in the background and restarts it automatically at boot or after a crash.

```bash
sudo npm install -g pm2
```

### 5. Clone the project and install dependencies

```bash
git clone https://github.com/narmod/pokerth-web-client.git
cd pokerth-web-client
npm install
```

You may see two `npm WARN deprecated` lines about `inflight` and `glob` — these are pulled in by `protobufjs-cli` (a dev-only dependency used to rebuild the protobuf bundle). They are harmless at runtime. `npm audit` should report **0 vulnerabilities**.

### 6. Open the firewall

If `ufw` is active on the server:

```bash
sudo ufw allow 8080/tcp     # if you serve directly on 8080
# OR (recommended) 80/443 if you put Nginx in front
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

Cloud providers (IONOS, OVH, Hetzner, etc.) often have their **own firewall in front of the VPS** that is independent of `ufw`. Make sure to open the same ports in their control panel too, otherwise the port stays unreachable from outside.

### 7. Start the proxy with PM2

```bash
pm2 start proxy.js --name pokerth-web
pm2 save
pm2 startup       # then run the command it prints, to enable boot-time start
```

Verify:

```bash
pm2 status
pm2 logs pokerth-web --lines 30
```

The client is now live at `http://<your-server-ip>:8080`.

### 8. (Recommended) Add HTTPS with Nginx + Let's Encrypt

A direct WebSocket on port 8080 works, but many mobile browsers and corporate networks **block plain `ws://` connections**. Adding HTTPS via Nginx solves this for free and gives you a clean URL.

You need a domain name pointing to the server's IP. Free options include [No-IP](https://www.noip.com/) (`yourname.ddns.net`) or [DuckDNS](https://www.duckdns.org/) (`yourname.duckdns.org`).

Install Nginx and Certbot:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/pokerth` (replace `your-domain.example` with your real hostname):

```nginx
server {
    listen 80;
    server_name your-domain.example;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/pokerth /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Obtain the certificate (Certbot will edit the config to add HTTPS automatically):

```bash
sudo certbot --nginx -d your-domain.example
```

Pick option `2 — Redirect HTTP to HTTPS` when asked. Renewal is automatic via a systemd timer.

The client is now live at `https://your-domain.example`. In the connect form, the WebSocket Proxy URL field will auto-fill with `wss://your-domain.example` (the JS detects the protocol).

### 9. Updating the proxy later

```bash
cd ~/pokerth-web-client
git pull
npm install              # only if package.json changed
pm2 restart pokerth-web
```

</details>

---

## Running locally (development)

<details>
<summary><b>📂 Show the local-development guide</b></summary>

If you only want to play around on your own machine:

```bash
git clone https://github.com/narmod/pokerth-web-client.git
cd pokerth-web-client
npm install
```

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

### Docker

The repository ships with a `Dockerfile` and a `docker-compose.yml` for one-command self-hosting.

**1. Configure the allowlist.** For anti-open-relay reasons the proxy only dials servers on an allowlist. `pokerth.net` works out of the box, but to reach **your own** LAN / private server you must add it. Copy the example env file and edit it:

```bash
cp .env.example .env
# then edit .env and add your server to ALLOWED_HOSTS
```

```dotenv
# .env
PORT=8080
ALLOWED_HOSTS=pokerth.net,www.pokerth.net,mybox.ddns.net,192.168.1.10
```

> If your PokerTH server runs on the **same machine** as Docker, use `host.docker.internal` (Docker Desktop) or the host's LAN IP in both `ALLOWED_HOSTS` and the connect form — **not** `localhost`, which from inside the container points to the container itself.

**2. Start it:**

```bash
docker compose up -d
```

The proxy will be available on `http://<host>:8080/` (or whatever `PORT` you set).

Notes:
- The container runs as the non-root `node` user.
- Per-player session statistics are persisted in a named volume (`pokerth-stats`), so they survive `docker compose down && up`.
- A healthcheck pings the HTTP server every 30 s; `docker ps` shows the container as `healthy` once it is up.
- `PORT` only changes the **published host port** — the container always listens on `8080` internally.

</details>

---

<a id="quick-start-lan"></a>
## Quick start — LAN family game

1. Run the proxy on any computer on your local network.
2. Find that computer's local IP (e.g. `192.168.1.10`).
3. Open `http://192.168.1.10:8080` on any phone or tablet on the same Wi-Fi.
4. Choose **LAN** login mode, pick a nickname, and join or create a table.
5. Deal cards and enjoy!

---

<a id="raspberry-pi"></a>
## Self-hosting on a Raspberry Pi 🥧

Both the PokerTH server **and** this web proxy are extremely light: PokerTH is a turn-based card game exchanging small Protobuf messages, so a 10-player table is a trivial load. The players' phones do all the rendering — the Pi just relays messages and serves static files. That makes a Pi a perfect always-on box for family / LAN games.

**Which model?**

| Model | Verdict |
|---|---|
| **Pi 4 (2 GB)** | ✅ Recommended sweet spot — Gigabit Ethernet, comfortable headroom, smooth `npm install` / `git`. |
| **Pi 5** | Overkill but fastest; great if you want room for other services. |
| **Pi 3B+ (1 GB)** | Works fine for runtime. |
| **Pi Zero 2 W (512 MB, Wi-Fi only)** | Not recommended — tight RAM for `npm install`, no wired Ethernet. |

**For a smooth game, the network matters more than the Pi:**

- Connect the Pi to your router by **wired Ethernet** — the server stays rock-solid.
- The quality of your **Wi-Fi / access point** affects the 10 players more than the Pi's CPU.
- Prefer booting from a **USB SSD** (Pi 4/5) over a microSD for reliability with PM2 logs; otherwise use a good A1/A2 card.

**Install:**

1. Flash a **64-bit, Debian-based OS** — **Raspberry Pi OS (64-bit) is recommended** (Debian arm64 works too). An `apt`-based system is required: the one-liner installer needs `apt` and stops cleanly on non-apt distros (Alpine, Fedora…).
2. Install the PokerTH server — it is packaged for Debian / Ubuntu including ARM:
   ```bash
   sudo apt update && sudo apt install pokerth-server
   ```
   (If your distro doesn't ship it, build it from the [upstream sources](https://github.com/pokerth/pokerth).) Run `pokerth_server`; it listens on TCP **7234** by default.
3. Install the web proxy exactly as in [Manual installation](#manual-installation) (Node 20 LTS + PM2 + this repo). The one-liner installer works on ARM too.
4. From any phone on the same Wi-Fi, open `http://<pi-ip>:8080`, choose **LAN** mode, and deal.

> **PWA extras (install to home screen, offline, notifications) need HTTPS** — see [Known limitations](#known-limitations). The game itself works perfectly over plain `http://` / `ws://` on the LAN.

---

## Protocol notes

PokerTH speaks a length-prefixed Protobuf-based protocol over TCP. This client parses and emits a hand-written subset of those messages — there is no full Protobuf runtime in the browser, which keeps the bundle small.

A few things worth knowing if you plan to hack on this:

- The proxy logs every parsed message in hex with a short description, which makes protocol debugging straightforward (`pm2 logs pokerth-web` if you run under PM2).
- Wire-type field numbers used by this client are documented inline in `public/pokerth.js` next to each `Proto.encode([...])` call, with references to `pokerth.proto` in the upstream repository.

---

## Known limitations

- The Protobuf protocol is still handled by a small hand-written encoder/decoder rather than generated classes.
- The bulk of the logic still lives in a single `pokerth.js` file, though i18n, sounds and the protocol layer have already been extracted into ES modules. Further splitting would help.
- More automated protocol tests are needed before calling the client production-ready.
- Spectator mode works but lacks a few quality-of-life touches (e.g. you cannot see other players' cards at showdown the same way the native client does).
- **PWA features (install to home screen, offline Service Worker, background notifications) require a *secure context*** — i.e. HTTPS, or `localhost`. Over plain `http://` on a LAN IP (e.g. `192.168.1.10:8080`) the game plays perfectly, but the browser disables those three features by design. To get them on a LAN, serve the client over HTTPS — e.g. [`mkcert`](https://github.com/FiloSottile/mkcert) for a locally-trusted certificate, a self-signed cert, a real domain with Let's Encrypt, or a tunnel such as Cloudflare Tunnel / Tailscale.

---

<a id="roadmap"></a>
## Roadmap / Suggested next steps

1. Replace the hand-written Protobuf encoder/decoder with generated classes from `pokerth.proto`.
2. Split the client into maintainable ES modules *(in progress — i18n, sounds and the protocol layer are already extracted)*.
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
