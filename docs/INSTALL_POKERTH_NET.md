# Installing the web client on the pokerth.net server

Step-by-step guide for deploying **pokerth-web-client** on the same machine that runs the
official **pokerth.net** game server. In this setup the web client's proxy bridges browser
WebSockets to the game server over **loopback TCP** — no external hop, and players get the
proxy's **session persistence** (a wifi micro-drop no longer kicks them from the table:
the proxy keeps their PokerTH session alive for a grace window, buffers server messages
and re-attaches the browser when it comes back).

```text
Player browser ⇄ WSS ⇄ proxy.js (this project) ⇄ TCP 127.0.0.1:7234 ⇄ pokerth.net game server
```

The game server itself is **not touched**: it keeps serving the classic Qt/QML clients on
its public TCP port exactly as today. The web client is a pure add-on.

Requires web-client **v0.3.756-beta or newer** (the *Internet transport* switch).

---

## 1. Prerequisites

- Debian/Ubuntu with shell access on the pokerth.net machine.
- The PokerTH game server listening on `127.0.0.1:7234` (default protobuf port; adjust
  below if different, and note whether that listener uses TLS).
- A free HTTP port for the proxy (default `8080` — the installer asks).
- A hostname for players (e.g. `play.pokerth.net`) pointing at the machine, for HTTPS.
  HTTPS/WSS is strongly recommended: many mobile browsers refuse plain `ws://`, and the
  PWA install + offline training require a secure origin.

## 2. Install

```bash
curl -sSL https://raw.githubusercontent.com/narmod/pokerth-web-client/HEAD/install.sh | bash
```

The installer sets up Node.js 20, PM2 and a boot-persistent `pokerth-web` service under a
non-root user. It is idempotent — re-running updates an existing install. Prefer reviewing
first? Download `install.sh`, read it, then run it. Non-interactive installs are driven by
environment variables (`PORT`, `RUN_USER`, `INSTALL_DIR`…) — see the README.

## 3. HTTPS

Put Nginx + Let's Encrypt in front of the proxy (full walkthrough in the README's
*Manual installation → step 8*). One server block proxying `https://play.pokerth.net` →
`http://127.0.0.1:8080` with WebSocket upgrade headers is all it takes.

## 4. Set the admin token

```bash
pokerth-web set-token   # prompts for a token; guards /admin and the admin API
```

Then open `https://play.pokerth.net/admin`, paste the token and log in.

## 5. Configure for co-hosting (the important part)

All in the admin panel — applied live, no restart:

1. **Game servers tab → registry**: *+ Add server* —
   - Name: `PokerTH.net (local)`
   - Host: `127.0.0.1` — Port: `7234`
   - TLS: tick **only if** the local listener actually speaks TLS on that port
   - Mark it **Active**, then *Save all*. Saving auto-adds host+port to the proxy's dial
     allowlist (`127.0.0.1` is also allowed out of the box).
   - Use **Check** to confirm reachability and live player/game counts.
2. **Game servers tab → Internet / PokerTH.net — source**: **Manual** (the active server
   above). Auto/serverlist is pointless here — the target is the local machine.
3. **Game servers tab → Internet / PokerTH.net — transport**: **Via proxy**.
   This is what routes the web client's *Internet* mode through the proxy (and its
   session-grace protection) instead of the browser dialing `wss://www.pokerth.net/pthlive`
   directly. With a `127.0.0.1` target the client would fall back to the proxy anyway,
   but setting it explicitly makes the intent unambiguous.
4. **Clients tab → login modes**: untick **LAN** (and **Offline** if you don't want the
   local bot-training mode). On this install the LAN mode has no legitimate target — every
   player should land on the *Internet* choice, which now means "the pokerth.net server
   next door". Untucked modes disappear from the connect screen entirely.
5. Optional, same tab: set the **default login form** to the Internet mode, and a
   **server identity** (name + tagline) for the login screen.
6. Optional, **Server tab → Proxy**: tune the **session-grace window** (default 120 s —
   how long a dropped player's seat survives a disconnection).

Registered pokerth.net accounts log in through the proxy with SCRAM; the password is
protected end-to-end (WSS on the browser leg, SCRAM challenge–response beyond), and card
decryption for authenticated players works as with the official clients.

## 6. Verify

- Open the site → only the intended modes appear on the connect screen.
- Connect as **Guest** → lobby lists the real pokerth.net tables; the status line should
  say *proxy*, not *direct*.
- Join a table, then toggle airplane mode for ~10 s on a phone: on return you are
  re-attached to your seat with your stack — no disconnect on the server side.
- Registered login: sign in with a pokerth.net account, play a hand, check your own
  cards decrypt correctly.

## 7. Updating later

```bash
pokerth-web update      # or: curl -sSL https://play.pokerth.net/install.sh | bash -s -- update
```

Static file changes apply immediately (players see the update banner); `proxy.js` changes
need `pm2 restart pokerth-web` — the admin panel's *Server* tab can do a one-click update
with or without restart, including a scheduled restart with a countdown banner shown to
players at the tables.

## Notes & scope

- **No open relay**: the proxy only dials allowlisted host:port pairs — on this install,
  effectively the loopback game server.
- **The game server is unchanged**: Qt/QML clients keep connecting to the public TCP port
  as always; the proxy is just another local client as far as it is concerned.
- **Longer term**: if a native WebSocket listener is ever added to the PokerTH server
  itself, the proxy could be dropped — until then, this co-hosted bridge is the
  zero-upstream-work path, and the session-grace behaviour is a feature the direct
  `/pthlive` endpoint does not provide.
