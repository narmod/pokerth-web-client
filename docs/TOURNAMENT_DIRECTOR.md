# Tournament director

An automatic organizer for games and tournaments on the LAN servers of the
directory. **LAN only for now** (decided 2026-10-23): nothing for
pokerth.net or the Internet-mode game servers. This page is the design
reference and the status of the work.

**Status (2026-10-23, `2.1.10-web.292`):** the spectator that watches one
table and seals its journal and ranking, and the **« Table check »** tool on
`/tournament` to run it against a server this install knows. Off by
default; nothing changes for players.

## Ground rules

- **Work with the PokerTH ecosystem, never against it.** Chat moderation is
  the server's `chatcleaner`; kicks and bans stay the operator's tools (vote
  kick, server bans, `GameNameBadWordList`); the official ranking, the BBC,
  WEC and Monthly Cup sites and the log analysis stay the reference. The
  director recreates none of them. Anything that would need the server or
  the QML client to change is a proposal to the upstream maintainers, never
  a workaround.
- **Off by default.** Module and `/tournament` page are enabled with the
  master admin token only.
- **A home install must not be able to harm anyone's server** (§ Abuse).
- **Fair and tamper-evident** (§ Trust).

## How a table is run

The PokerTH server lets only a table's admin start it, and the creator of a
table sits at it. A player who leaves a running game leaves his stack behind,
eaten by the blinds. So the director:

1. creates the table with the tournament settings (it is the admin);
2. kicks anyone seated who is not a confirmed registrant — the admin may do
   so before the start only, and never in a Ranking game;
3. leaves its seat just before the start: admin passes to the first player,
   who starts the game (the director reminds him in the chat);
4. comes back as a **spectator** and watches until the end.

A session can be in one game only, hence one director session per running
table, named `TD-<tag>-T<n>` (`TD-<tag>-Final`). The server rate-limits
logins per IP (5 back to back, then one every 30 s): sessions are opened
early and spread out, or the operator exempts the proxy address
(`ServerBruteForceProtectionExempt`).

## Trust

1. **One source of truth: the spectator.** What it records comes from the
   server, never from a player. A spectator receives the seat order
   (`GameStartInitial`), one seat state per seat at every hand
   (`HandStart.seatStates`, `2` = no money: the server's own elimination
   flag), every player's cash (`PlayersActionDone`, `EndOfHand*`), id changes
   on rejoin (`PlayerIdChanged`) and the winner (`EndOfGame`). A spectator
   joining a running game gets `GameStartRejoin` with the last hand number
   and every seat's cash — that is how a dropped director resynchronises.
2. **Sealed journal.** Every event is appended to a hash chain (each entry
   carries the SHA-256 of the previous one). The final head and the ranking
   are signed with the install's Ed25519 key. Anyone can recompute the chain,
   check the signature and replay the journal to get the same ranking.
3. **Witnesses check, never decide.** Web clients seated at the table send a
   public summary (nicknames, stacks per hand, eliminations, winner — never
   their own cards). Agreement → « confirmed »; disagreement → « disputed »,
   for an organizer. QML players may witness by uploading their `.pdb` log,
   when the tournament allows it (off by default).
4. **Corrections are added, never overwritten,** with author and reason.
5. **Ranking rule** — the one the BBC site applies to a log: the later a
   player went out, the better; players out in the same hand are ordered by
   their stack at the start of that hand. An exact tie is flagged for an
   organizer.

A result is `complete`, `incomplete` (hands the director missed, an
unknown elimination hand, a tie) or `running`.

## Abuse

The code is open source, so the real protections are on the server
(password, connection limits, kicks, bans, `chatcleaner`, accounts). The
director must make nothing easier than today:

- hard caps on tables per server, creation rate and how early sessions open;
  no table without confirmed registrants; public requests rate-limited;
- **the target server's operator must consent**, in one of three ways:
  - **A — DNS TXT** on the server's name: `_pokerth-td.<host>` =
    `v=ptd1; k=<base64 raw Ed25519 public key of the install>` (a generator
    in the admin writes it; it is checked again before every tournament);
  - **B — server password** (`ServerPassword`) handed over by the operator,
    stored encrypted, never shown to players;
  - **C — no proof, admin's decision, for tests only:** the install's own
    server and private / loopback addresses (checked on the resolved
    address), tables tagged `[TEST]`, never pokerth.net;
- nothing for pokerth.net for now; servers with accounts are refused by the
  director itself;
- honest names (`TD-…`) and a chat line saying who organizes.

**Collusion (players in the same place).** The proxy knows web players' real
addresses (it forwards them to the active server only, with the PROXY
protocol header); `/tournament` sees every player's address at check-in.
Without storing any address: an HMAC of the address and of its network
prefix with a per-tournament salt; erased, salt included, when the result
is validated; organizers only see « X and Y: same network ». Actions:
report, separate at table draw, or forbid the same table. Never an automatic
sanction (homes, clubs, mobile CGNAT, VPNs). Off for in-person events.

## Chat

The director's lines go through the server's `chatcleaner` like everyone
else's: no repeated line, no capitals, **no links** (unless the operator
listed the address as an exception), spaced out. It posts: welcome and
rules, blind levels, players left, final table, end. Organizers can send one
message to every table from `/tournament`. One language per tournament,
English by default.

## Tournament settings

Profiles pre-fill independent settings; « Custom » sets each by hand.

| Setting | Friendly | Club | Official |
|---|---|---|---|
| Identity | Simple | Simple | Personal code |
| Witnesses | Off | Informative | Required to validate |
| Validation | Automatic | Automatic | By an organizer |
| Corrections | Free, logged | Free, logged | Approved by a 2nd organizer |
| Visibility | Unlisted (link) | Public | Public |
| Archive | 30 days | 1 year | Permanent |
| Collusion | Off | Report | Report + separate |

- **Identity** on LAN servers without accounts: *Simple* (table password
  shortly before the start, plus the seat check), *Personal code* (check-in
  in the web client or on `/tournament`, so QML players are covered), or
  *Server accounts* where the server has them.
- **Visibility:** public, unlisted (unguessable link, `noindex`), private
  (invitation code or account).
- **Manual mode, no director:** the organizer runs the tables; results are
  typed in, confirmed by witnesses, or recomputed from an imported `.pdb`
  log (the organizer picks the game inside the log). Every entry still goes
  into the sealed journal, marked « manual ». No connection to the game
  server, so no operator consent is needed.
- **Personal data:** nickname and results kept per the archive setting;
  contact erased at validation; codes and passwords at the end; network
  fingerprints at validation; a deleted account's past results stay as
  « deleted player ».

## Interface

- `/admin` › Tournaments: **settings only** — enable the module and the
  page, public requests, formats, profiles, caps, per-server consent and
  « do not offer this server », who approves on each server, storage,
  delegate keys, director health.
- `/tournament`: **everything else** — public list, registration,
  check-in, brackets, results, hashes and downloadable journal; requests to
  organize; an organizer view opened with a `tournaments` key or an
  organizer account. Same stylesheet and poker colours as `/rules` and
  `/faq`. All the app's languages: catalogues in
  `tournament/public/lang/`, the list read from `lang-meta.mjs`, and
  `test-lang-count` requiring one catalogue per language.
- **Approval:** each server's operator approves its tournaments or delegates
  to the install's admin. A delegate `tournaments` key is bound to **one**
  server.

## Storage and accounts

JSON files by default; optionally a **dedicated** SQL database (MySQL /
MariaDB or PostgreSQL, `TD_DB_*`, through `server/db-dialects.js`), which
then holds the truth, with `td_`-prefixed tables and versioned migrations.
Organizer accounts with per-server roles checked on every action; optional
player accounts (PokerTH nickname, Argon2id or scrypt hash).

## BBC

For now the director only runs BBC tables (« usage 1 »): the BBC site keeps
registrations, tickets, points and seasons, and the result goes through its
current channel (result message plus a `.pdb` log sent to the log analysis
through `/pdb-analyse`). To check when we get there: that the BBC site
accepts a log written by the director. The site's code is MIT-licensed
(`pokerth/bbc`); we never write into another application's database.

## Hypothetical (not planned)

These would need upstream changes and are not expected to be built:
a « tournament director » server role (admin while spectating, able to kick
or mute in-game, results stored by the server); a BBC API to post results;
QML clients sending witness reports automatically. Nothing in the design
depends on them.

## Table check (`/tournament`, first organizer tool)

- **Admin › Community › Tournaments** — settings only: the module switch
  (off by default; while off `/tournament` and `/tournament.html` answer
  404), the service's state and version, the install's public key
  (created on first enable), the number of running watches.
- **`/tournament`** — master token for now (the browser key of `/admin`, so a
  signed-in admin lands straight in). English for now, like the admin; the
  public views will come in every language. Light and dark themes (system
  choice or the header switch), same face and colours as `/rules`.
  1. pick a LAN server: the LAN directory or the local server (never the
     Internet-mode game servers, never a free address), read its lobby;
  2. pick a table (spectators allowed), optional table password and
     director name, « Watch this table »;
  3. follow hands and eliminations; at the end the sealed ranking, its flags
     (tie, unknown hand, missed hands), the checks (chain, signed head,
     signature, replay) and the journal / result downloads. « Stop watching »
     keeps the journal.
- Each watch is a **detached process** (`tournament/lib/worker.mjs`): the
  task (table password included) is handed over once through IPC, never
  written to disk; then the process lives on its own, survives an update of
  the web client and of the tournament service, and writes `state.json`, `journal.json`, `result.json` in
  `TD_DIR/watches/<id>/` (`/data/tournament` in the Docker image; the key is
  `TD_DIR/td-key.pem`, mode 600). At most 4 watches at once.
- A server announcing authenticated logins (pokerth.net) is always refused,
  **by the worker itself** — the browser's word is never taken.
- A watch that fails or crashes shows why: the error in `state.json`, and
  the end of its process output (`worker.log`) on the page.
- **Login rate limit.** With `ServerBruteForceProtection` on (the default),
  the game server accepts 5 logins in a row per address, then one every
  30 s. Every web client player, every lobby read and every director comes
  from the proxy's address, so a refused login (`initBlocked`) is treated as
  temporary: the director waits 31 s and tries again (5 times), and the page
  says so. On your own server, add the proxy's address to
  `ServerBruteForceProtectionExempt` (the upstream setup guide already asks
  for it when players share an address).
- **Any device.** The page works from a phone to a desktop (one column under
  900 px, 44 px touch targets, safe areas of notched phones, no sideways
  scroll), and installs as its own app (`/tournament/manifest.json`, scope
  `/tournament`, standalone), like `/admin`.
- Routes (`tournament/lib/service.mjs`), all behind the admin token:
  `GET/POST /admin/tournaments/settings` (answered by the web client),
  `GET …/status`, `GET …/servers`,
  `POST …/lobby {ref}`, `POST …/watch {ref, gameId, gamePassword?, nick?}`,
  `GET …/watches`, `GET …/watch?id=`, `POST …/watch/stop {id}`,
  `GET …/watch/file?id=&which=journal|result`.

## Tournaments, manual mode (`/tournament`, « Tournaments » tab)

- **Create**: name, LAN server (for the record: nothing is done on it), date,
  Sit & Go (one table, up to 10 players), profile (Friendly, Club, Official,
  Custom), visibility (a private tournament gets an invitation code). Identity,
  witnesses and the collusion check are recorded now and apply once
  registration and witnesses exist.
- **Players** are added and removed by hand until a result is set; with no
  player yet, the result brings them.
- **Result**, three sources:
  1. *typed in* — the players arranged, winner first;
  2. *a Table check* — the sealed result of a finished watch, its signature
     checked before use; its head and signature go into the tournament's
     journal;
  3. *a PokerTH log* (`.pdb`, ≤ 10 MB) — uploaded and kept as evidence (with
     its SHA-256), the organizer picks the game; ranked by the BBC site's rule
     (`server/tournament/pdb.mjs`, read in memory with sql.js).
  A ranking must place every player once and no one else.
- **Validation**: automatic on Friendly / Club when the result is complete;
  by an organizer on Official, or when the result is flagged (tie, unknown
  hand, game not finished). Validating seals and signs (`result.json`:
  tournament id, journal head and length, result, corrections).
- **Corrections**: only on a validated result, with a reason; added to the
  journal (before and after) and signed again. Official: a second organizer
  must approve, so none until organizer accounts exist.
- **Journal**: every action, with its author, in a hash chain
  (`journal.mjs`); a tampered journal is refused on load. `tournament.json`
  is only a convenience copy.
- Storage: `TD_DIR/tournaments/<id>/` — `tournament.json`, `journal.json`,
  `result.json`, `log.pdb`.
- Routes, behind the admin token: `GET /admin/tournaments/t/list`,
  `GET …/t/get?id=`, `GET …/t/file?id=&which=journal|result|pdb`,
  `POST …/t/create`, `…/t/update {id, patch}`, `…/t/player {id, action, nick}`,
  `…/t/result {id, source, ranking | watchId | uniqueGameId}`,
  `…/t/validate {id}`, `…/t/correct {id, ranking, reason}`, and
  `POST …/t/pdb?id=` (raw body).

## The director opens the table (`web.299`, service `0.2.0`)

From a tournament on `/tournament` (« Table on the server »), with its LAN
server chosen and at least two players: **Open the table**
(`tournament/lib/host.mjs`, `HostDirector`, in its own detached process like
a watch).

1. The director logs in and creates an **invite-only** table named after the
   tournament (a second name `… #2` if it is in use), with the tournament's
   **table settings** (stack, first small blind, blinds every N hands or N
   minutes, after the last level, time to act, pause between hands; PokerTH
   defaults), spectators allowed, one seat more than the players. It is
   seated and is the table admin.
2. It invites every registered player as soon as it sees them in the lobby
   (again when a busy player comes back from another game; « Invite again »
   on the page), welcomes each one who sits, and **kicks** anyone seated who
   is not registered (the server allows it only to the admin, before the
   start).
3. When every registered player is seated, or when the organizer clicks
   **Start without the absent** (at least two seated; the others are marked
   absent and not ranked), it **leaves its seat** (decided design, option A):
   the server makes the first player admin. It comes straight back as a
   spectator and asks the new admin in the chat to start (reminders after 2
   and 5 minutes).
4. It follows the game like a Table check and seals the result. The service
   carries it into the tournament by itself (validated or waiting for an
   organizer, as the profile says). Strangers seated at the start (a player
   can invite someone once the director has left) are recorded in a seat
   check: the result then needs an organizer.

Safeguards: on a non-LAN server a full table starts by itself 6 s later, so
the director never stays seated at a full table — it leaves at once, which
cancels that start (ten registered players: it leaves when eight are seated
to make room). Players and the result are locked while the table is open;
**Close the table** stops the director (a running game goes on without it).
The page refreshes the director's block every 2 s; commands reach the
director through `commands.jsonl` in its folder, which survives a restart of
the service. Chat: English for now (the per-tournament language comes with
the public pages), never capitals, links or the same line twice, spaced out
(the server's `chatcleaner`).

Routes: `POST /admin/tournaments/t/table/open {id}`, `…/t/table/go {id}`,
`…/t/table/reinvite {id}`, `…/t/table/close {id}`.

## A service of its own (`tournament/`, decided and done 2026-10-23)

The tournament director has its own audience (organizers), lifecycle,
storage, accounts and processes, so it is a separate service **in this
repository**, with its own `package.json` and version (`0.1.0` first, shown
at the foot of `/tournament`).

- **Launched by the web client.** While Admin › Community › Tournaments is
  on, the proxy (`server/tournament-host.js`) forks `tournament/server.mjs`,
  restarts it if it stops (1 s, 2 s, … up to 30 s), and stops it when the
  switch goes off. Nothing changes for Docker, PM2, the admin page's update
  or pokerth.net. The admin panel shows the service state and version. When
  the proxy goes away (restart, update), the service leaves with it and the
  next proxy starts a new one. Watches are detached processes of their own
  and keep running throughout.
- **Talking.** The service listens on `127.0.0.1` on a port it picks and
  reports over IPC (`ready`). The proxy relays `/tournament` and its files
  (strict path pattern, no token) and `/admin/tournaments/*` (after checking
  the admin token with the admin brute-force limit) to it. A secret made at
  each launch (`X-TD-Secret`) and the author (`X-TD-Author`) tell the service
  the request is genuine. The service asks the proxy which servers it may use
  (IPC `servers`: the LAN directory and the local server) each time.
- **What it gets.** Only `TD_DIR`, `TD_SECRET`, `TD_CLIENT_VERSION` (the
  web client's version: the PokerTH release the director speaks), `TD_HOST`,
  `TD_PORT` and a few system variables. Not the admin token, nor database
  passwords.
- **On its own** (development, tests): `TD_ADMIN_TOKEN=… TD_SERVERS='[…]'
  TD_PORT=8091 node tournament/server.mjs`, Bearer token.
- Accounts of its own come with the « organizer accounts » step; until
  then the web client's admin token is the way in. A separate repository
  stays possible later.

## Updating the director (`web.300`, service `0.2.1`)

The director has its own version (`tournament/package.json`) and changelog
(`tournament/CHANGELOG.md`). A change that only touches `tournament/` bumps
that version only: the web client's version, its service worker and its
« new version » banner do not move.

- The web client's update check counts `tournament/` as code that needs no
  restart of the web client, so the update is a static one (the admin's
  « Update without restart », or the automatic one), with no player cut off.
- The web client (`server/tournament-host.js`) checks every 15 s whether the
  service's files on disk (entry, `package.json`, `lib/`, `public/`) differ
  from those it started, and restarts **the service alone** if so. Watches and
  tables in progress are processes of their own and go on.
- Admin › Tournaments shows the running version and, if different, the one on
  disk; « Restart the service » restarts it by hand.
- A change to `server/tournament-host.js` (the launcher, in the web client)
  is a web client change, with its version bump and restart.
- An install without git (Docker image baked) is still updated with a new
  image.

## Files

| File | Role |
|---|---|
| `tournament/server.mjs` | Service entry: HTTP on 127.0.0.1, IPC with the web client. |
| `tournament/lib/service.mjs` | HTTP side: page, API routes, auth by secret (or standalone token). |
| `tournament/lib/manager.mjs` | Install key, known servers, lobby, watches (detached workers). |
| `tournament/lib/journal.mjs` | Canonical JSON, hash-chained journal, verification, Ed25519 keys and signatures. Pure. |
| `tournament/lib/tracker.mjs` | Ranking of one table from normalized spectator events. Pure. |
| `tournament/lib/spectator.mjs` | Network client: login, spectator join, protobuf → events → journal + tracker, timeout keep-alive, reconnect with resync, late player names, sealing. Reads only: never sits, acts, acks a start or chats. |
| `tournament/lib/lobby.mjs` | Lobby reader (guest login, tables, server type). |
| `tournament/lib/host.mjs` | The director that opens a tournament table: create, invite, kick, hand over, then watch. |
| `tournament/lib/worker.mjs` | One watch in a detached process, state and files on disk. |
| `tournament/lib/pdb.mjs`, `tournament/lib/tournaments.mjs` | PokerTH log reader (BBC rule); tournaments in manual mode. |
| `tournament/public/` | The page: `index.html`, `organizer.mjs` (Table check), `tournaments-ui.mjs` (Tournaments), `manifest.json`. |
| `tournament/bin/td-spectate.mjs` | Command line: watch a table, write `<out>.journal.json` and `<out>.result.json`; `--verify` checks chain, signature and replay. |
| `tournament/test/` | `test-td-core` (journal, ranking cases), `test-td-spectator` (fake server over TCP, command line), `test-td-tournaments` (manual mode, `.pdb`), `test-td-host` (opening a table against a fake server that behaves like the real one, then through the service), `test-td-service` (workers, the service on its own), `test-td-route` (real proxy launching the service, the page in jsdom). |
| `server/tournament-host.js` | Web client side: the setting, launching and relaying. |

The service shares the repository's protobuf bundle (`public/proto/`) and
sql.js (`public/vendor/`) rather than copying them.

```sh
node tournament/bin/td-spectate.mjs --host 192.168.1.20 --port 7234 \
     --nick TD-test-T1 --game-name "Friday SnG"
node tournament/bin/td-spectate.mjs --verify td-out.result.json td-out.journal.json
npm run test:td        # every tournament test (npm --prefix tournament test)
```

The install key (`td-key.pem`, created on first use, mode 600) and the
output files are git-ignored. Use it only on a server you run, or with its
operator's agreement.

## Order of work

1. Spectator prototype, and the Table check on `/tournament` (done).
2. Storage layer (JSON and SQL) and migrations.
3. Manual mode on `/tournament` (done, `web.296`), then the director as a
   service of its own (done, `web.297`, service `0.1.0`).
4. Witness reports from the web client, compared with the journal.
5. Persistent state machine, resume after restart.
6. Admin › Tournaments (settings) and per-server `tournaments` keys.
7. `/tournament`: public and organizer views, scheduled Sit & Go end to end
   (table creation, seat check and hand-over done in `web.299`; next: opening
   at the scheduled time, announcements, message to all tables, the chat
   language).
8. Collusion check.
9. Organizer and player accounts.
10. Requests to organize.
11. Multi-table rounds, then leagues.
Not planned for now: anything for pokerth.net (it would need its
maintainers' agreement).
