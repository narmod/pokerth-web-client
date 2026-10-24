# The link with a PokerTH Arena

The **Arena** (tournaments, cups and medals for PokerTH LAN servers, with a
tournament director) is an application of its own since `2.1.10-web.327`:
`narmod/pokerth-arena` (private for now). It grew up in this repository
(`tournament/` from `web.297`, then `arena/`) and moved out with its history;
its design notes are that repository's `docs/ARENA.md`.

The web client no longer runs it. All it keeps is the link, in
`server/arena-link.js`, set in **Admin › Community › Arena** (off by default).

## Linking

Only the Arena has an API; the web client exposes nothing for it and makes no
key.

1. On the Arena: `/arena/organize`, signed in with its master key, tab
   **Web client** — the **link key** (`alk_…`).
2. Here: the Arena's address (an origin such as `https://arena.example.org`,
   no path) and that key, then **Test and save**. The web client sends a first
   `POST <Arena>/arena/api/link/sync`; accepted, the address and the key are
   saved and the link is on. The switch pauses it (nothing sent, `/arena`
   answers 404) without forgetting them.

## What the web client does while linked

- **Sends** `POST <Arena>/arena/api/link/sync` (`Authorization: Bearer <key>`)
  every minute: `{ url, version, servers, events? }` — this site's public
  address (Admin › SEO, else the address the admin used for « Test and
  save »), its version (the PokerTH release the director says it speaks), the
  servers the Arena may use (the LAN directory and the local server; never
  pokerth.net or Internet-mode servers) and, every fifth time, the community
  events (BBC, WEC, Monthly Cup, the Events relay's cache). The admin card
  shows the last test and the last send, or its error (a key renewed on the
  Arena: « the Arena refused the key »).
- **`/arena` on this site:** pages answer 302 to the Arena's address; the
  players' API (`/arena/api/…`) is relayed server-side to the Arena with the
  key (`x-arena-link`) and the player's address (`x-td-client`), so the
  tournament witness (`public/modules/arena-witness.mjs`) stays on this site
  (no CORS, `sendBeacon` works). Bodies over the limits are refused here (8 KB,
  64 KB for a witness report, 14 MB for a log).
- **The personal codes** of tournament players are kept by the Arena's pages,
  on the Arena's site. Its « Play on the web client » button opens this site
  with them in the fragment (`#arena=<base64url JSON { v: 1, regs }>`, never
  sent to a server); `arena-witness.mjs` (`takeHandoff`) files them under
  `pth_td_regs` and removes them from the address.
- `/admin/arena/settings` and `/admin/arena/link-test` only; the rest of
  `/admin/arena` answers 404 with the Arena's organizer page. The key is never
  sent back to the admin page (a hint only) and is left out of configuration
  exports (`arena.key`).

## Moving from the Arena that ran inside the web client

Until `web.326` the web client could run the Arena itself (« Inside this web
client »). That mode is gone: install the Arena apart (its README: Docker or
`install.sh`), copy the old data folder (`arena-data/`, `/data/arena` in the
Docker image) into the Arena's `ARENA_DIR`, then link it as above. Old
settings (`mode`) are ignored and dropped at the next save.

## Languages

A language added to the web client is added to the Arena too, in its
repository (`docs/ADDING_A_LANGUAGE.md`).

Tests: `scripts/test-arena-link-host.mjs` (a fake Arena), `scripts/test-arena-witness-client.mjs`.
