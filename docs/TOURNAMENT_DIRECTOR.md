# Tournament director

An automatic organizer for games and tournaments on the LAN servers of the
directory, with an optional, off-by-default bridge to pokerth.net. This page
is the design reference and the status of the work.

**Status (2026-10-23): prototype, step 1 of 12.** A spectator that watches
one table and writes its sealed journal and signed ranking. Nothing is
wired into `proxy.js`, `/admin` or the player client yet: nothing changes
for players or operators.

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
- pokerth.net only with a dedicated director account granted, and revocable,
  by its maintainers;
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
  `public/modules/tournament/lang/`, the list read from `lang-meta.mjs`, and
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

## The prototype (step 1)

| File | Role |
|---|---|
| `server/tournament/journal.mjs` | Canonical JSON, hash-chained journal, verification, Ed25519 keys and signatures. Pure. |
| `server/tournament/tracker.mjs` | Ranking of one table from normalized spectator events. Pure. |
| `server/tournament/spectator.mjs` | Network client: login, spectator join, protobuf → events → journal + tracker, timeout keep-alive, reconnect with resync, late player names, sealing. Reads only: never sits, acts, acks a start or chats. |
| `scripts/td-spectate.mjs` | Command line: watch a table, write `<out>.journal.json` and `<out>.result.json`; `--verify` checks chain, signature and replay. |
| `scripts/test-td-core.mjs` | Journal, signatures and ranking cases (normal game, ties, late join, reconnect, id change). |
| `scripts/test-td-spectator.mjs` | End to end against a scripted fake server over TCP, and the command line. |

```sh
node scripts/td-spectate.mjs --host 192.168.1.20 --port 7234 \
     --nick TD-test-T1 --game-name "Friday SnG"
node scripts/td-spectate.mjs --verify td-out.result.json td-out.journal.json
npm run test:td-core && npm run test:td-spectator
```

The install key (`td-key.pem`, created on first use, mode 600) and the
output files are git-ignored. Use it only on a server you run, or with its
operator's agreement.

## Order of work

1. Spectator prototype (this step).
2. Storage layer (JSON and SQL) and migrations.
3. Manual mode on `/tournament`.
4. Witness reports from the web client, compared with the journal.
5. Persistent state machine, separate service, resume after restart.
6. Admin › Tournaments (settings) and per-server `tournaments` keys.
7. `/tournament`: public and organizer views, scheduled Sit & Go end to end
   (table creation, seat check, announcements, message to all tables).
8. Collusion check.
9. Organizer and player accounts.
10. Requests to organize.
11. Multi-table rounds, then leagues.
12. pokerth.net option, with its maintainers' agreement.
