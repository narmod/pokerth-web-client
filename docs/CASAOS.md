# Installing on CasaOS

The web client runs as a regular Docker app on [CasaOS](https://casaos.io) (ZimaBoard,
Raspberry Pi, any home server). The published image is multi-arch
(amd64 / arm64 / armv7) and the repo's `docker-compose.yml` already carries the
`x-casaos` metadata CasaOS reads — no separate app-store package needed.

## Install

1. In CasaOS, open **App Store → ⋮ (top right) → Install a customized app**.
2. Switch to the **Import** (Docker Compose) tab.
3. Paste the contents of the project's
   [`docker-compose.yml`](https://raw.githubusercontent.com/narmod/pokerth-web-client/HEAD/docker-compose.yml)
   and submit. CasaOS picks up the name, icon, description and port from the
   embedded `x-casaos` block.
4. Open the app — the client is served on port **8080** (remappable in the
   CasaOS app settings, left side of the port mapping).

## Configuration

Everything from the compose file applies as-is:

- **`ALLOWED_HOSTS`** — comma-separated allowlist of PokerTH servers the proxy
  may dial (`pokerth.net,www.pokerth.net` by default). Add your own server's
  host here. If that server runs on the **same machine** as CasaOS, use the
  host's LAN IP — not `localhost`, which points inside the container.
- **`STATS_ADMIN_TOKEN`** / **`ADMIN_ENABLED`** — set a token to unlock the
  `/admin` panel (game-server registry, login modes, broadcasts, styling…).
- **`STATS_RESET_PERIOD`**, **`PROXY_LOG_LEVEL`**, **`PROXY_MAX_CLIENTS`** —
  same semantics as the bare-metal installer.

Edit these in CasaOS via the app's **Settings → Environment Variables**.

All server-side state (leaderboard, admin config, broadcasts, polls, player
preferences…) lives in the `pokerth-stats` volume mounted at `/data`, so it
survives updates and container recreation.

## HTTPS / remote play

On a LAN, plain HTTP works in most desktop browsers. For play from outside the
home (or iOS Safari, which is strict about `ws://`), put a reverse proxy with
TLS in front — e.g. Nginx Proxy Manager from the CasaOS app store — forwarding
to the app's port with WebSocket upgrade enabled. A secure origin also unlocks
the PWA install and offline training mode.

## Updating

CasaOS: open the app's settings and hit **Update** (re-pulls
`ghcr.io/narmod/pokerth-web-client:latest`), or from a shell:

```bash
docker compose pull && docker compose up -d
```

Data in `/data` is preserved.
