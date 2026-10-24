# PokerTH Arena

Tournaments, cups and medals for PokerTH LAN servers. A tournament director
opens Sit & Go tables for the registered players, watches them as a spectator
and seals signed results; players register, check in and follow the
tournaments on the Arena's app (`/arena`, installable as a PWA); organizers
work on `/arena/organize`.

The Arena grew up inside the [PokerTH web client](https://github.com/narmod/pokerth-web-client)
and is becoming an application of its own. It can run in two ways:

- **inside the web client** — the web client starts it (Admin › Community ›
  Arena, « Inside this web client »); nothing to install;
- **on its own** — this folder, on any server with Node.js 18+, or in Docker,
  linked to a web client.

Design notes, every feature and its history: `docs/ARENA.md` in the web
client's repository, and `CHANGELOG.md` here.

## Run it on its own

The Arena takes a few files from the web client (the PokerTH protocol, the
create-table lists, sql.js, the languages, the start-screen picture, the
Inter font). Copy them once into `shared/`:

```sh
node scripts/sync-shared.mjs /path/to/pokerth-web-client
```

Run it again when the web client changes them (a new PokerTH release, a new
language), and commit `shared/`.

### Docker

```sh
cp .env.example .env        # set ARENA_ADMIN_TOKEN
docker compose up -d --build
```

The Arena listens on `127.0.0.1:8091`; its data is in the `arena-data`
volume.

### Without Docker

```sh
sudo ./install.sh           # install or update; ./install.sh status
```

It copies the Arena to `/opt/pokerth-arena`, keeps its data in
`/var/lib/pokerth-arena`, writes `/etc/pokerth-arena.env` once (with a new
master key) and starts the systemd service `pokerth-arena`.

### Development

```sh
ARENA_ADMIN_TOKEN=dev ARENA_PORT=8091 node server.mjs
```

### HTTPS

Put a reverse proxy (Caddy, nginx…) with HTTPS in front of
`127.0.0.1:8091`, forward `/arena` (or everything) to it, and set
`ARENA_TRUST_PROXY=1` and `ARENA_PUBLIC_URL=https://arena.example.org`.

## Link with a web client

Only the Arena has an API; the web client sends it what it needs.

1. On the Arena: `/arena/organize`, sign in with the master key, tab
   **Web client**: copy the **link key** (`alk_…`).
2. In the web client: Admin › Community › Arena › « Where the Arena runs »:
   **As its own app**, the Arena's address and the key, then **Test and
   save**.

The web client then sends the Arena, every minute, the servers it may use
(its LAN directory and its local server) and the community events (BBC, WEC,
Monthly Cup). `/arena` on the web client's site sends visitors to the Arena,
and the players' witness reports are relayed to the Arena's API by the web
client. On a tournament's page, **Play on the web client** opens the web
client with the player's personal code, so that its witness reports are
checked. A new key on the Arena cuts the link until it is pasted in the web
client.

## Settings

| Variable | Default | |
|---|---|---|
| `ARENA_ADMIN_TOKEN` | — | the super admin's master key (required on its own) |
| `ARENA_DIR` | `data/` | where everything is kept (tournaments, cups, journals, keys) |
| `ARENA_HOST`, `ARENA_PORT` | `127.0.0.1`, any free port | where it listens (Docker: `0.0.0.0:8091`) |
| `ARENA_PUBLIC_URL` | — | its public address (pictures of shared links) |
| `ARENA_TRUST_PROXY` | `0` | `1` behind a reverse proxy: the player's address from `X-Forwarded-For` |
| `ARENA_LINK_KEY` | made once | a fixed link key instead of the one made and kept in `ARENA_DIR` |
| `ARENA_WEBCLIENT_URL` | told by the web client | the web client's address, fixed |
| `ARENA_KEEP_LOOPBACK` | `0` | `1`: keep the web client's `127.0.0.1` servers as they are (same machine) |
| `ARENA_SERVERS` | from the web client | a fixed JSON list of servers instead |
| `ARENA_EVENTS_URL` | from the web client | an `/api/events` address instead |
| `ARENA_CLIENT_VERSION` | from the web client | the PokerTH release the director says it speaks |
| `ARENA_SQL_DIR`, `ARENA_LANG_META`, `ARENA_HERO_IMAGE`, `ARENA_FONTS_DIR` | `shared/` | other places for the shared files |

## Tests

```sh
npm install                 # jsdom, Playwright (browser tests)
npm test
npm run test:browser
```

Tests that need the web client around (`test-arena-route`,
`test-arena-public-browser`) say « skipped » on their own.

## Licence

AGPL-3.0-or-later. The files in `shared/` keep their own licences:
protobuf.js (BSD-3-Clause), sql.js (MIT), Inter (SIL OFL 1.1, `shared/fonts/Inter-OFL.txt`).
