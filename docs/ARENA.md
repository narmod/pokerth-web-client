# Arena — tournaments, cups, medals and the tournament director

Called « tournaments » until 2.1.10-web.315 (module `tournament/`, page
`/tournament`); renamed **Arena** on 2026-10-24 (web.316, service 0.19.0)
because it holds more than tournaments: cups, medals, players' pages. Since
web.317 (service 0.20.0) only the new names exist (decided 2026-10-24: a
fresh start, no redirect from `/tournament`, no old scope, config key,
environment variable or data folder): `arena/`, `server/arena-host.js`,
`/arena…`, `/admin/arena/*`, key scope `arena`, `admin-config.json` › `arena`,
`ARENA_DIR` (`/data/arena` in Docker, `arena-data/` beside the proxy),
`ARENA_*`, Admin › Community › Arena.

Unchanged on purpose: the concept files (`lib/tournaments.mjs`, `cups.mjs`,
`badges.mjs`, `host.mjs` — a tournament is still a tournament), the
director's name on the servers (`TD-…`), the files inside the data folder
(`td-key.pem`, `tournaments/`, `cups/`), the browser keys (`pth_td_*`,
`td_witness`) and the internal headers between the web client and the
service (`X-TD-*`).

## Tournament director

An automatic organizer for games and tournaments on the LAN servers of the
directory. **LAN only for now** (decided 2026-10-23): nothing for
pokerth.net or the Internet-mode game servers. This page is the design
reference and the status of the work.

**Status (2026-10-23, `2.1.10-web.292`):** the spectator that watches one
table and seals its journal and ranking, and the **« Table check »** tool on
`/arena` to run it against a server this install knows. Off by
default; nothing changes for players.

## Ground rules

- **Work with the PokerTH ecosystem, never against it.** Chat moderation is
  the server's `chatcleaner`; kicks and bans stay the operator's tools (vote
  kick, server bans, `GameNameBadWordList`); the official ranking, the BBC,
  WEC and Monthly Cup sites and the log analysis stay the reference. The
  director recreates none of them. Anything that would need the server or
  the QML client to change is a proposal to the upstream maintainers, never
  a workaround.
- **Off by default.** Module and `/arena` page are enabled with the
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
protocol header); `/arena` sees every player's address at check-in.
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
message to every table from `/arena`. One language per tournament,
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
  in the web client or on `/arena`, so QML players are covered), or
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
- `/arena`: **everything else** — public list, registration,
  check-in, brackets, results, hashes and downloadable journal; requests to
  organize; an organizer view opened with a `tournaments` key or an
  organizer account. Same stylesheet and poker colours as `/rules` and
  `/faq`. All the app's languages: catalogues in
  `arena/public/lang/`, the list read from `lang-meta.mjs`, and
  `test-lang-count` requiring one catalogue per language.
- **Approval:** each server's operator approves its tournaments or delegates
  to the install's admin. A delegate `tournaments` key is bound to **one**
  server.

## Storage and accounts

JSON files by default; optionally a **dedicated** SQL database (MySQL /
MariaDB or PostgreSQL, `ARENA_DB_*`, through `server/db-dialects.js`), which
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

## Table check (`/arena`, first organizer tool)

- **Admin › Community › Tournaments** — settings only: the module switch
  (off by default; while off `/arena` and `/arena.html` answer
  404), the service's state and version, the install's public key
  (created on first enable), the number of running watches.
- **`/arena`** — master token for now (the browser key of `/admin`, so a
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
- Each watch is a **detached process** (`arena/lib/worker.mjs`): the
  task (table password included) is handed over once through IPC, never
  written to disk; then the process lives on its own, survives an update of
  the web client and of the tournament service, and writes `state.json`, `journal.json`, `result.json` in
  `ARENA_DIR/watches/<id>/` (`/data/tournament` in the Docker image; the key is
  `ARENA_DIR/td-key.pem`, mode 600). At most 4 watches at once.
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
  scroll), and installs as its own app (`/arena/manifest.json`, scope
  `/arena`, standalone), like `/admin`.
- Routes (`arena/lib/service.mjs`), all behind the admin token:
  `GET/POST /admin/arena/settings` (answered by the web client),
  `GET …/status`, `GET …/servers`,
  `POST …/lobby {ref}`, `POST …/watch {ref, gameId, gamePassword?, nick?}`,
  `GET …/watches`, `GET …/watch?id=`, `POST …/watch/stop {id}`,
  `GET …/watch/file?id=&which=journal|result`.

## Tournaments, manual mode (`/arena`, « Tournaments » tab)

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
- Storage: `ARENA_DIR/tournaments/<id>/` — `tournament.json`, `journal.json`,
  `result.json`, `log.pdb`.
- Routes, behind the admin token: `GET /admin/arena/t/list`,
  `GET …/t/get?id=`, `GET …/t/file?id=&which=journal|result|pdb`,
  `POST …/t/create`, `…/t/update {id, patch}`, `…/t/player {id, action, nick}`,
  `…/t/result {id, source, ranking | watchId | uniqueGameId}`,
  `…/t/validate {id}`, `…/t/correct {id, ranking, reason}`, and
  `POST …/t/pdb?id=` (raw body).

## Images of tournaments and cups (service `0.17.0`, web client `2.1.10-web.314`)

`arena/lib/images.mjs`, decided 2026-10-24 (any organizer adds images;
shown at the top of the page, on the cards, as og:image).

- Library: `tournament` and `cup` shipped (`arena/public/img/events/`,
  `<id>.jpg` 800 px and `<id>.t.jpg` 192 px), plus the organizers' in
  `ARENA_DIR/images/` (`u<10 hex>.jpg`, `.t.jpg`, index `images.json` with name,
  who added it and when). Added, never replaced or removed: an id always
  shows the same picture. JPEG only, picture ≤ 400 KB and 1600 px, thumbnail
  ≤ 48 KB and 400 px, 200 images at most. The organizer page makes both
  JPEGs in the browser (800 / 192 px).
- `image` on a tournament or a cup: a library id, or null for the default
  (`tournament`, `cup`); unknown ids are refused. It may change at any time,
  also once validated or closed. The tables of a tournament on several tables
  take its image.
- Players' page: the picture at the top of the tournament's or cup's page
  (the director's avatar elsewhere), the thumbnail on the cards. Public API:
  `image` and `thumb` (paths) on every tournament and cup.
- Shared links: the page of a tournament or a cup carries `og:title`,
  `og:image` (absolute), `og:url` and `twitter:card`, built from
  `x-td-origin`, which the web client sets from Admin › SEO's public address,
  else from the request's host; private ones carry nothing.
- Routes: `GET /admin/arena/images`, `POST …/images/add {name, full,
  thumb}` (base64 JPEGs), `POST …/t/update` and `…/cups/update` with
  `{patch: {image}}`, public `GET /arena/img/<id>.jpg` and
  `/arena/img/<id>.t.jpg` (cached a day, any origin).

## Table settings (service `0.16.0`, web client `2.1.10-web.313`)

The director opens its tables with the same choices as the web client's
« Create a table » form, from one source: `public/modules/create-presets.mjs`
(`STYLES`, `TEMPLATES`, `LIMITS`, `TEMPLATE_DELAY`). The form reads it
(`pokerth.js` `applyPreset`, `botsuggest.mjs` for the templates), the service
imports it from disk (`arena/lib/table.mjs`) and serves it to the
organizer page (`GET /admin/arena/table-presets`: `{v, limits, styles,
defaultStyle, templates, templateDelay, defaults}`); change a style, a
template or a limit there and both follow (`scripts/test-create-presets.mjs`
checks the form's min/max).

- Table: `{startMoney, firstSmallBlind, raiseMode ('hands'|'minutes'),
  raiseEvery, manualBlinds [ascending], endRaiseMode ('double'|'value'|'keep',
  only after a manual list), endRaiseValue, actionTimeout, delayBetweenHands,
  preset ('style:<id>'|'template:<name>'|null)}`. `preset` is a label, kept
  while the values still match it. Default: the « Normal » style.
- Limits = the game server's (`netpacketvalidator.cpp` `ValidateGameInfo`): a
  request outside them is refused and the session closed. A table stored
  with the older, wider limits (120 s to act, 3 s between hands) is brought
  back inside them when the director opens it (`gameInfoFor`).
- The manual blinds order goes to the server (NetGameInfo field 14).

## Players who do not come, and other cases at the table (service `0.18.0`)

Audit of 2026-10-24 (`arena/test/test-arena-scenarios.mjs`, one scenario
each, against a fake server that behaves like `servergamestate.cpp` /
`serverlobbythread.cpp`). Server facts: an invitation to a player in another
game is answered « busy » at once; a « no » removes the invitation, « busy »
keeps it; an unanswered invitation stays valid, without any notice; the server
refuses a 7th join of the same player at a table; nicknames are case
sensitive (« Bob » and « bob » are two players); the admin may start with
computer players (« fill with computer players »); before the start only the
admin kicks; on a non-LAN server the admin is moved out after 30 min without
starting and the next player becomes admin.

- **Absence rule** (per tournament, `run.absence`, decided 2026-10-24):
  - `auto` (default): every refusal, invitation unanswered for 60 s, « busy »
    answer and seat left before the start is a **failure**; the player is
    invited again 60 s later (a seat left: at once). Back on the server after
    a drop, or out of another game: invited again at once, **no failure**.
    Nobody is absent before **10 min past the start** (the opening when there
    is no date); from then on, **3 failures**, or not connected for 60 s
    (never connected included), = **absent**: told privately, not invited,
    not ranked; the table goes on as soon as the others are seated (2 at
    least; with fewer, the organizer decides). An absent player who sits
    before the start after all (an invitation still valid) is welcome again.
  - `custom`: the same with the organizer's numbers (failures 1–10, seconds
    between invitations 20–600, minutes after the start 0–120).
  - `manual`: nothing automatic (as before 0.18.0): a refusal stays, the
    organizer clicks « Start without the absent ».
  - Organizer page: the rule in the form and in Edit; at the table, each
    player's failures and why an absent player is absent.
- **The admin starts before every registered player is seated** (after the
  hand-over: ten players, the director made room at eight; or the director
  lost its seat): the missing players are marked absent at the start, so the
  result fits the tournament.
- **Each new admin is asked to start** (the previous one left or was timed
  out), not only the first one.
- **Someone not registered sits after the hand-over** (the admin, a player,
  may invite anyone; the director cannot kick then): the admin is asked
  privately to remove them, they are told; started anyway (or with computer
  players): said in the table chat, the seat check fails and the result waits
  for an organizer.
- **Nicknames:** a registered name matches its exact spelling first; another
  case only when every name on the server is known and nobody has the exact
  one, and only the player invited for it may take the seat.
- **Closed by the organizer before the start:** the director tells every
  player privately, removes them (seated, as admin) and leaves, so the table
  goes away instead of a game nobody follows; after the hand-over it can only
  tell them.
- Director lines (83 languages, `lib/botlang/`): `absentMarked`,
  `closedByOrganizer`, `strangerSeated`, `strangersAtStart`.
- Journal: `absenceRule`, `inviteFailed {nick, reason, failures}`,
  `inviteUnanswered`, `markedAbsent {nick, reason}`, `absentBack`,
  `strangerSeated`, `closedByOrganizer`.

## The director opens the table (`web.299`, service `0.2.0`)

From a tournament on `/arena` (« Table on the server »), with its LAN
server chosen and at least two players: **Open the table**
(`arena/lib/host.mjs`, `HostDirector`, in its own detached process like
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

**Opening by itself** (service `0.3.0`): « Open the table by itself, N
minutes before the start » (0 to 120, default 10; needs a start date). The
service's sweep (every 5 s) opens it in that window, as « scheduler » in the
journal. A failure is said once and kept on the tournament, then tried again
every 2 minutes; a start more than an hour past is not opened (said once).
Opening by hand, then closing, does not make it reopen for the same start.
The sweep reads the tournaments from disk, so a restart changes nothing.

**Announcements** (per tournament, on by default): who is out and how many
are left, heads-up, the winner and the second (not the blinds: every client
shows them, service `0.3.1`).

**Chat language** (per tournament, service `0.6.0`): the director writes its
lines — welcome, kick reason, admin notices, start, players out, heads-up,
winner — in one of the app's 83 languages, English by default (« Language of
the director in the chat », in the form and in Edit). The lines live in
`arena/lib/botlang/<code>.mjs` (13 keys, `en.mjs` the reference, English
filling any gap); the manager loads them and hands them to the director with
its task. They start in lowercase: the server's chat filter mutes capitals.
The organizer's own messages go out as typed.

**128 bytes a line** (service `0.6.0`): the server takes a chat line or a
private message of 1 to 128 bytes (UTF-8, `netpacketvalidator.cpp`); a longer
one is an invalid packet and the server **closes the session** — the director
would drop off its table. Every line is split into parts of at most 118 bytes
(room for the « (hh:mm) » added to a line repeated word for word): after a
sentence when it can, else between words — found by `Intl.Segmenter` for
languages written without spaces (Thai, Chinese, Japanese…) — never inside a
character (`lib/botchat.mjs`).

**Where its lines go** (service `0.3.2`): before the start, a waiting
player reads the lobby chat and private messages (QML GameWaitPage « Lobby
Chat »; the web client the same), not the table chat. So until the game runs
the director writes privately: welcome to the player who sits, the reason of a
kick to the kicked player, « you are the table admin now » (and reminders) to
the new admin, « X is now the table admin » to the others, the organizer's
messages to everyone seated. Once the game runs — the server refuses private
messages to its players — everything goes to the table chat.

**Invited again by itself** (service `0.3.1`): an invitation belongs to a
player id, and a reconnection brings a new one. A registered player who drops
from the server is invited again when back; one who leaves the table before
the start is invited again at once — before and after the hand-over, until the
game starts. **Message to the
table** from the page while the director runs it (« say »); a line with a link
or mostly capitals is refused, as the server's chat filter would mute the
director for it.

Routes: `POST /admin/arena/t/table/open {id}`, `…/t/table/go {id}`,
`…/t/table/reinvite {id}`, `…/t/table/say {id, text}`, `…/t/table/close {id}`.

## The players' page (`/arena`, service `0.4.0`)

- `/arena`: the public tournaments — playing now, open for
  registration, coming up, finished. `/arena/t/<key>`: one tournament;
  the key is random (`publicKey`, 12 bytes), so an unlisted tournament is
  reached by its link only, and a private one answers as if it did not exist
  until its invitation code is given (`?invite=`).
- **Never indexed** (decided 2026-10-24, not only during the beta): the web
  client's SEO leaves `/arena` out (no sitemap entry, nothing in
  `robots.txt` or `llms.txt`), and every answer under `/arena` — pages,
  images, API, errors — carries `X-Robots-Tag: noindex, nofollow,
  noimageindex`, set by the service and forced again by the relay
  (`server/arena-host.js`). It is not `Disallow`ed in `robots.txt`, so
  that crawlers can read the noindex. Link previews (og:image) still work:
  they do not index.
- A tournament page: date, server, table settings, how it works (with the time
  the table opens when it opens by itself), the players, the table to join
  once the director has opened it (its name; « waiting for the admin »; « hand
  N »), the ranking, corrections, the signature check and the journal / signed
  result to download.
- **Registration** by the players when « Players can register themselves »
  is on (default): a PokerTH nickname the server would accept (2 to 64 bytes,
  first byte a plain printable character), once per tournament in any case.
  Closed when the table is full (10), once the director has opened the table,
  or when the tournament is over. Each registration returns a **personal
  code** (8 characters, no 0/O/1/I), shown once and kept in the browser
  (`pth_td_regs`); unregistering needs it; only a SHA-256 of it is stored.
  The same code serves the check-in of the Official profile (below).
- Limits per player address (set by the web client, `x-td-client`): six
  registrations, twelve unregistration attempts and twelve check-in attempts
  in ten minutes.
- Every language of the app: the list and the flags come from
  `/arena/lang-meta.mjs` (served by the Arena, the web client's list through
  `platform.mjs`), the texts from `arena/public/lang/<code>.mjs`
  (falling back to English, then the key); the choice is the app's
  (`pth_lang`); Arabic, Persian, Hebrew and Urdu read right to left, as on the
  public pages. The organizer tools stay in English, at `/arena/organize`.
- API, without a token, relayed by the web client: `GET /arena/api/list`,
  `GET …/t/<key>[?invite=]`, `POST …/t/<key>/register {nick, invite?}`,
  `POST …/t/<key>/unregister {nick, code, invite?}`,
  `POST …/t/<key>/checkin {nick, code, invite?}`,
  `GET …/t/<key>/file?which=journal|result`. Errors carry a `code` the page
  translates. The web client relays `…/t/<key>/<word>` (lowercase letters),
  so a new player action needs no web client release.

## Check-in (identity « Personal code », Official; service `0.5.0`)

- Proves that the player at the table is the one who registered: in a window
  before the start, each player confirms on the players' page with their
  nickname and **personal code** (one click when the code is kept in the
  browser). Applies when the identity is *Personal code* (Official profile,
  or Custom).
- The window opens `checkInBefore` minutes before the start (5 to 240, 30 by
  default, « Edit » on the organizer page); at once when the tournament has no
  date. It closes when the table opens or a result is set.
- A player added by the organizer also gets a personal code, shown once to
  the organizer (to hand over); « New code » replaces a lost one (the old one
  stops working); « Check in » lets the organizer check a player in himself
  (seen in the room). Each is in the journal (`codeIssued`, `checkedIn` with
  `by: organizer`).
- Opening the table (by hand or by itself) invites **only the players
  checked in** and refuses with fewer than two; the others are marked absent
  at once (journal `notCheckedIn`) and are not ranked.
- Errors for the page: `noCheckIn`, `checkInNotYet`, `checkInClosed`,
  `badCode`, `alreadyIn`. Organizer routes: `POST /admin/arena/t/code
  {id, nick}`, `…/t/checkin {id, nick}`.

## Medals (service `0.14.0`, web client `2.1.10-web.311`)

Gold, silver and bronze for the first three (`arena/lib/badges.mjs`),
decided 2026-10-24. They are never stored: they are derived from the signed
results (rebuilt as soon as a tournament or a cup is saved), so a correction
moves a medal by itself.

- **A tournament** gives medals when it is validated, its profile is Club,
  Official or Custom (not Friendly), at least **4 players** are ranked, and
  it is the tournament itself — the tables and the final table of a
  tournament on several tables give none (the tournament's own ranking does).
- **A cup** gives medals once closed (standings signed) and made of at least
  **2 validated tournaments**.
- A shared place gives each of its players the medal of that place (two 2nd:
  two silver, no bronze for the 4th).
- Private tournaments and cups give no public medal and are left out of the
  results; unlisted ones give the medal without its link (`key: null`).
- Players' page: `/arena/p/<nick>` (medals, then every tournament and cup
  with its place); every nickname in a ranking or cup standings links to it,
  with its medals after it (one request per page).

**Open API** — for the web client, the QML client or another site later.
Read-only, no key, `Access-Control-Allow-Origin: *`,
`Cache-Control: public, max-age=60`. Every answer carries `v: 1`; fields may
be added, never renamed or removed without a new `v`. Nicknames match
without case.

| Route | Answer |
|---|---|
| `GET /arena/api/players/<nick>` | `{ok, v, nick, counts: {gold, silver, bronze}, medals: [...], results: [...]}` — an unknown player gets empty lists. |
| `GET /arena/api/badges?nicks=a,b,c` | Up to 100 players (a lobby, a table): `{ok, v, players: {<nick>: {counts, latest: [{medal, kind, name, key}] (3 at most)}}}` — only those with a medal. |
| `GET /arena/api/badges` | Everyone with a medal, most gold first: `{ok, v, rules: {minPlayers, profiles, cupsMinTournaments}, players: [{nick, counts}]}`. |

A medal or a result: `{medal ('gold'|'silver'|'bronze', medals only), kind
('tournament'|'cup'), name, key (public key, or null), place, of (players
ranked), at (ms, validated or closed), profile (tournaments) | points
(cups)}`. Links: `/arena/t/<key>`, `/arena/c/<key>`. Medals are
listed cups first, then the latest; results the latest first (200 at most).

## Cups (service `0.13.0`, web client `2.1.10-web.310`)

A cup gathers tournaments of this install (`arena/lib/cups.mjs`).

- **Points** (decided 2026-10-24, « fair and checkable »): a counted
  tournament gives each ranked player `players behind + 1` — the last gets 1,
  the winner as many points as there were players. It grows with the field
  by itself (winning among 10 is worth more than among 4) and needs no table.
  A place shared by k players gives each the average of the k positions
  (3rd–4th of 5 → 2.5). Absent players are not ranked, so get nothing.
- **Best N** (`bestOf`, 0 = all): only each player's N best results count;
  the others are shown in brackets.
- **Stages**: an event may send its first `qualify` players to the `next`
  event — added by « cup » as soon as the tournament is validated (the
  service's sweep, once; refusals noted in the cup's journal). Several events
  may feed one. A **final** (`final: true`) may also take the top
  `fromStandings` of the points standings (« Qualify the top K »), and may
  count for points or not (`counts`).
- **Ranking of the cup**: the final's places first (once validated), then the
  furthest stage reached, then the points, then the best single results one
  by one; still equal: the same place. Only validated (signed) results count;
  the standings are recomputed from the tournaments each time, so a
  correction flows in by itself.
- **Closing** signs the standings (`result.json`, the install key) with the
  sealed head of each tournament; nothing can be added after.
- **Deleting** (service `0.20.0`): the super admin only (the master key;
  an organizer key gets 403), the cup's name typed again; its folder goes
  (journal, signed standings) and its medals with it, the tournaments stay.
  A line is kept in `cups/deleted.jsonl` (who, when, name, tournaments,
  winner). Route `POST /admin/arena/cups/delete {id, confirm}`.
- Organizer page: « Cups » tab (create, add tournaments with their role,
  standings, qualify, close). Players' page: the public cups on the start page,
  `/arena/c/<key>` (rules, tournaments, standings with points per
  tournament), and « Part of the cup … » on each tournament's page.
- Routes: `GET /admin/arena/cups/list`, `…/cups/get?id=`,
  `POST …/cups/create {name, bestOf, visibility, description}`,
  `…/cups/update {id, patch}`, `…/cups/event {id, tournamentId, label?,
  counts?, qualify?, next?, final?, fromStandings?}`, `…/cups/event/remove
  {id, index}`, `…/cups/qualify {id, index}`, `…/cups/close {id}`;
  public `GET /arena/api/cups`, `…/c/<key>[?invite=]`.

## Several tables (service `0.12.0`, web client `2.1.10-web.309`)

PokerTH cannot move a player from one game to another while it runs, so
tables are never merged or balanced: **qualifying tables, then a final table**.

- **Format « multi »** (« Several tables + final table »): 11 to 40 players
  (4 tables of 10 at most — the manager runs 4 directors at once), and how
  many of each table go to the final (`run.finalists`, 1 to 5, 2 by default).
- **The draw** (« Draw the tables », or by itself with « open by itself »):
  the players still in — with the identity « code », those who checked in;
  the others are marked absent — are dealt at random into
  `ceil(players / 10)` tables of balanced sizes. With the collusion setting
  « separate », the draw keeps apart the pairs flagged by an earlier
  collusion check of this install (the fewest such pairs at one table out of
  300 draws). Journal: `tablesDrawn`.
- **Each table is a tournament of its own** (`parentId`, `stage: {kind:
  'qualifier'|'final', index}`): the settings, server, table settings,
  personal codes and check-ins of its tournament; its own director, witnesses,
  collusion check, result, validation, corrections. Not listed on its own;
  its page links to its tournament. « Open the tables » opens them all.
- **The final table**: once every table is validated, the first N of each
  (`finalReady`) — opened by itself when the tournament opens by itself, else
  « Open the final table ». The **tournament's ranking**: the final's places,
  then the others by their place at their table, the same place shared by the
  players of different tables. Set (`resultSet`, source `stages`) and
  validated by the director once the final is validated: every guarantee was
  applied at the tables. A table corrected afterwards recomputes it
  (`stagesRecomputed`, signed again); the ranking is never corrected directly.
- Routes: `POST /admin/arena/t/draw {id}`, `…/t/stages/open {id}`,
  `…/t/final {id, open?}`. The witness lookup of a table answers
  `parentKey` too (the web client looks the personal code up under it).

## The director's avatar (service `0.11.0`, web client `2.1.10-web.308`; four robots in `0.15.0`, robots only in `0.16.0`)

- The director logs in with an avatar so that players tell it from the
  others: its MD5 in the Init (`avatarHash`), then, when the server asks
  (`AvatarRequest`), header, blocks of 256 bytes, end — like any client; an
  unknown hash gets `UnknownAvatar`. The server takes PNG, JPEG or GIF of
  32 B to 30 KB (`MAX_AVATAR_FILE_SIZE`); the director checks the same.
- Four robots ship with the service (`arena/public/img/`, 96×96 PNG,
  each under 20 KB): robot 1 `director-avatar-1.png`, 2 `director-avatar-2.png`,
  3 `director-avatar.png` (the default), 4 `director-avatar-4.png`. Any
  organizer picks one on the organizer page with a click (kept in
  `ARENA_DIR/director-avatar.json`); « Back to the default » returns to robot 3.
  No image of one's own (decided 2026-10-24; a `director-avatar.img` left by
  0.11–0.15 is ignored). Tables opened afterwards use it. Routes:
  `GET /arena/avatar` (public, the current image),
  `GET /admin/arena/avatar[?images=1]` (state; the robots as `data:`
  URLs for the picker), `POST /admin/arena/avatar {preset: 1–4} | {reset: true}`.

## Collusion check (service `0.10.0`)

Signals for an organizer, never a sanction (`arena/lib/collusion.mjs`).

- **What it reads.** The director now records, at the end of each hand, one
  `handLog` event in its journal: every action (player, round, fold … all-in,
  bet in the round) and who won, with or without a showdown — what every
  client sees, never hole cards. The ranking ignores it (`replayJournal` is
  unchanged). Tables run before `0.10.0` have no hand logs.
- **Signals, per pair A–B,** each with a minimum sample (`LIMITS`):
  *soft play* — heads-up after the flop at least 3 times, checked down to the
  end at least 80 % (flagged when they bet against the others: ≤ 50 %);
  *no pressure* — A never raised B in at least 8 bets faced, but raised the
  others at least 20 %; *folds to* — A folded to B at least 85 % of at least 6
  bets faced, to the others at most 50 %; *chip passing* — A put at least 40 %
  of his stack in, then folded to B, who took the pot without a showdown
  (flagged at 60 %, or twice). A pair with two signals is flagged; one
  « note » alone is not.
- **When.** By itself when the director's result arrives, and on demand
  (« Check again », `POST /admin/arena/t/collusion {id}`) — also while
  the table runs. Setting « Collusion check »: *Off*, *Report* (Club),
  *Separate* (Official) — which behaves as *Report* until tournaments have
  several tables (it will keep flagged pairs apart).
- **Who sees it.** The organizer page only, with the numbers behind each
  signal, and a warning above « Validate » when pairs are flagged. Players
  never see it; the journal keeps the counts (`collusionChecked`: hands,
  flags, notes), not the names.

## Organizer accounts and roles (service `0.21.0`, web client `2.1.10-web.318`)

`arena/lib/accounts.mjs`, decided 2026-10-24 (organizers first; login and
password; four roles).

- **Super admin** = the web client's master key: everything, and alone for
  accounts, the module's settings and deletions (tournaments, cups).
- **Accounts** (Arena › Accounts, super admin): login (3–32 lowercase
  letters, digits, `. _ -`), the name the journals record, a role. Creating
  one gives a one-time **invitation link** (`/arena/organize#invite=…`, 7
  days): the organizer chooses a password there (10 characters at least, not
  the login or the name) and is signed in. Then: login + password on
  `/arena/organize`. The super admin changes a role or a name, turns an
  account off (its sessions end), makes a new link (the password is cleared,
  the sessions end) or deletes it (the journals keep the name). An account
  changes its own password (« My account »).
- **Roles**: `organizer` (creates and runs tournaments and cups, validates,
  corrects), `referee` (validates, proposes / approves / rejects corrections,
  runs the collusion check — creates nothing), `viewer` (« read only »:
  reads everything on the organizer side). Checked by the service on every
  request (`allowed(role, method, sub)`); a refusal is 403 with `code: role`
  and the page says so without signing out. The page hides the « New
  tournament » and « New cup » forms from referees and read-only accounts.
  The « Arena (organizer) » category of Admin › Keys is gone (web.319,
  decided 2026-10-24): an organizer signs in with an account only; the
  master key stays the super admin's way in.
- **Sessions**: `as_…` tokens (32 random bytes), 30 days, sent as
  `Authorization: Bearer`; the web client lets them through to the service
  (`X-Arena-Session`), which checks them; an unknown or ended one: 401
  `code: session`. Sign out ends it.
- **Stored** in `ARENA_DIR/accounts.json`, mode 600: passwords as scrypt
  hashes (N 16384, r 8, p 1, a salt each), invitation and session tokens as
  SHA-256 — the file gives neither a password nor a usable session.
- **Sign-in limits**: 8 failures per address or per login, then a quarter of
  an hour (429); the same work whether the login exists or not.
- Routes: public `POST /arena/api/account/login {login, password}`,
  `…/account/invite {token, password}`, `…/account/logout {token}`;
  organizer side `GET /admin/arena/accounts`, `POST …/accounts/create {login,
  name, role}`, `…/accounts/update {id, patch: {role, name, disabled}}`,
  `…/accounts/reinvite {id}`, `…/accounts/delete {id}`, `…/me/password {old,
  password}`; `GET …/status` gives `you`, `role`, `account`.
- Players keep their nickname and personal code for now (player accounts:
  later).

## Groups (service `0.29.0`)

Code: `arena/lib/groups.mjs`, `arena/public/groups-ui.mjs`; tests:
`arena/test/test-arena-groups.mjs`.

- Clubs, teams, lists of guests, made by organizers (Players › Groups):
  a name (unique, any case), a public line, and how a player gets in —
  `invite` (an organizer adds him), `request` (a signed-in player asks, an
  organizer accepts or declines), `code` (8 characters, renewable) or
  `open`. An organizer adds any nickname (an account or not) and takes one
  out, whatever the way in. Stored in `groups.json` (mode 600).
- Members are nicknames, any case. A player acts with his account:
  `POST /arena/api/players/groupjoin { session, id, code? }` and
  `/groupleave { session, id }` (also takes back a request); both answer
  `{ status: member | requested | out, group, mine }`. A banned player is
  refused (`banned`); other refusals: `groupUnknown`, `groupInvite`,
  `groupCode`.
- Public (decided 2026-10-24): `GET /arena/api/players` lists every group
  with its members (never its code); `GET /arena/api/players/<nick>` adds his
  groups; `/players/me` adds `{ member, requested }`.
- Organizer API: `GET /admin/arena/groups`; `POST /admin/arena/groups/`
  `create`, `update { id, patch: { name, about, join, newCode } }`,
  `remove`, `add`, `take`, `approve`, `decline` (`{ id, nick }`).
- Access: `groups: [{ id, name }]` — a member of any one of them; missing:
  `{ code: 'group', name }`. A group asked for by a tournament not yet
  validated or a cup not closed cannot be deleted (`usedBy`).
- A member added without an account can be impersonated on a LAN server:
  combine with the identity « account » or « verified » when it matters.
- Reset: the part `groups` archives `groups.json`.

## One account for everything (service `0.33.0`)

Code: `arena/lib/players.mjs` (`PLAYER_ROLES`, `setRole`), `service.mjs`
(`auth`), `public/organizer.mjs`, `public/players-ui.mjs`; tests:
`arena/test/test-arena-roles.mjs`.

- A player account may carry a role on the organizer side: `organizer`,
  `referee` or `viewer` (read only), given by the super admin:
  `POST /admin/arena/players/role { id, role | null }` (admin only). The
  same rights as the organizer accounts (`accounts.mjs` `allowed()`).
- The player's session (`ps_…`, the players' app) is accepted on
  `/admin/arena/*` (`Authorization: Bearer`, or relayed by the web client
  as `x-arena-session`, web.322): with a role, `who` is the nickname (the
  journals), `/status` adds `player`; without one, 403. `/players/me` and the
  sign-in answer carry the role: the app shows « Organize » (a link to
  `/arena/organize`, a page of the same app, not rebuilt inside the menu's
  page) and the organizer's page reads the same session from this browser.
- The organizer accounts (`as_…`, login and password) keep working; the
  super admin turns them off when their owners have player accounts with a
  role (decided 2026-10-24: no automatic conversion).

## My account (service `0.32.0`)

Code: `arena/lib/players.mjs` (profile, preferences, sessions, closing),
`tournaments.mjs` / `cups.mjs` (`registrationsOf`), `public/public.mjs`;
tests: `arena/test/test-arena-myaccount.mjs`.

- `POST /arena/api/players/profile { session }` → the player, `accountSince`,
  `lastLoginAt`, `sessions` (created, expires, `current`), `prefs`.
- `/players/logoutothers { session }`: every other session of the account
  ends (`ended`).
- `/players/prefs { session, lang?, theme? }`: a language code and `auto` /
  `light` / `dark`, kept with the account; `/players/me` returns them and the
  page applies them on sign-in and at start.
- `/players/mine { session }` → `now` (coming, playing), `past` (the last ten
  finished, with `place`), `cups` (registered for as a whole), `tickets`,
  `season`, `groups` — unlisted and private tournaments included: they are
  the player's own.
- `/players/close { session, password }`: the account, its sessions, its
  verifications and preferences go; the nickname and its results stay, free
  to claim again.

## The home page, a showcase (service `0.31.0`)

Code: `arena/lib/showcase.mjs`, `arena/public/home.mjs`,
`arena/public/home-ui.mjs`; tests: `arena/test/test-arena-showcase.mjs`.

- `GET /arena/api/showcase` → `{ at, sections: [...] }`: the sections the
  super admin turned on, in his order — `message` (title, text), `live`
  (`servers` with their online count, `games`: server, name or null when
  private, mode, players, max, spectators), `tournaments` (`playing`, `open`,
  `coming`: public cards), `community` (`upcoming`, `results`, `champions`),
  `results` (public validated tournaments with their podium), `cups` (running,
  public), `groups` (count, the biggest). A section that fails is left out.
- Lobbies: `lobby()` per LAN server at most once a minute (the first visit
  waits 2.5 s at most). Community events: the web client's Events relay over
  IPC (`{ type: 'events' }`, answered from the relay's cache), or
  `ARENA_EVENTS_URL` (an `/api/events` address) standalone; read at most once
  a minute; links kept only to `https://*.pokerth.net`. The WEC game of every
  evening (22:00 Europe/Berlin, no registration) is added as the web client's
  Events window does.
- `GET /admin/arena/showcase` (every role) and `POST` (the super admin):
  `{ sections: [{ id, on }], message: { title, text }, max }` → `showcase.json`.
- The page refreshes every minute while open and visible.
- `/arena/img/hero.webp`: the start screen's chips and flames, behind the
  titles (`HERO_IMAGE_FILE`, `ARENA_HERO_IMAGE`).

## The players' app (service `0.30.0`)

Step 1 of the redesign decided 2026-10-24 (showcase home page, sign-in
screen, account page, one account with roles: see the steps to come).

- One page, `public.html` + `public.mjs`, with a menu: Home (`/arena/`),
  Tournaments (`/arena/tournaments`), Cups (`/arena/cups`), Groups
  (`/arena/groups`), then Sign in (`/arena/login`) or the player's nickname
  (`/arena/account`). In the top bar on a computer (labels hidden under
  1000 px), as a bar at the bottom on a phone (under 760 px). A tournament,
  a cup or a player's page lights its section of the menu.
- `/arena/login`: sign in, make an account (when the super admin opened
  sign-up), choose the password of an invitation link (`#pinvite=`; the old
  `/arena#pinvite=` links are sent there). `?next=/arena/…` comes back where
  the player was (only paths under `/arena/`). `/arena/account`: the
  nickname, my page, sign out, change the password, the nickname verified on
  a game server, my groups.
- The language list: each language with its flag (`lang-meta`, SVG) and a
  search field; arrows, Enter, Escape. A full-width sheet on phones.
- Installable: `manifest.json` (id, start and scope `/arena/`, shortcuts),
  `arena/public/icons/` (SVG source and the PNG sizes, maskable included),
  `sw.js` served by the service with its version in the cache name
  (`Service-Worker-Allowed: /arena/`): network first, the cache only when the
  network is gone; `/arena/api/…` and `/arena/organize` never cached. An
  offline strip while the device has no network.
- The relay (`server/arena-host.js`, web.320) passes `/arena/<view>` (one
  lowercase segment), `/arena/organize/…`, `sw.js`, `icons/…` and the
  `showcase` API (step 2).

## A nickname proved on a game server (service `0.28.0`)

Code: `arena/lib/verifier.mjs`; tests: `arena/test/test-arena-verify.mjs`.

- A signed-in player asks for a code: `POST /arena/api/players/verify
  { session, ref }` (the servers: `GET /arena/api/players`, the LAN servers
  of this install). 6 characters, 10 minutes, one per account at a time.
- A bot `TD-check-xxxx` logs in (unauthenticated login, never a server with
  accounts) to that server's lobby, learns the players' names, and reads the
  lobby chat and its private messages. A line holding the code from the
  player whose name is the account's nickname (any case) marks the account
  verified on that server (`players.json`, one line per server, the latest)
  and the bot thanks him privately. Anyone else's line does nothing. One
  connection per server while codes wait; it answers the server's timeout
  warnings; it leaves when nothing waits.
- `POST /arena/api/players/verifystatus { session }`: the waiting code (done,
  error) and the servers verified.
- What it proves: the person behind the account could connect under that
  nickname on that server at that time — strong on a server with accounts,
  weaker on a LAN server, where nicknames are not checked.
- Access: `identity: 'verified'` (an account verified on any server).
- pokerth.net: not offered (decided 2026-10-23).

## Tickets and seasons (service `0.27.0`)

After the BBC (Step 1 open; Steps 2 to 4 need a ticket won by the first two
of the step before; the 3rd keeps his; the final starts a new season). Code:
`arena/lib/tickets.mjs`, `arena/public/ticket-form.mjs`; tests:
`arena/test/test-arena-tickets.mjs`. Stored in `ARENA_DIR/tickets.json`
(kinds, balances, the tournaments applied, the seasons, a log of 5000 moves).

- **Kinds** (`/admin/arena/tickets/type/add|update`): a name and a most per
  player (1–100, 10 by default).
- **A tournament's rules** (`tickets`, create and update): `need` (a kind),
  `earn: { type, top }`, `keep: [places]`, `endsSeason`.
- **Registering** (players' page) with `need`: the player must hold one more
  ticket than his registrations still waiting on that kind in other
  tournaments (not validated, not absent); else `code: 'access'` with
  `missing: [{ code: 'ticket', name, have, pending }]`. The organizer adding
  a player is not held back.
- **Once validated** (the service's sweep, each tournament once): a ranked
  player spends the ticket it needed unless his place is in `keep`; the
  first `top` earn one (never above the most). An absent player is not
  ranked and spends nothing. `endsSeason`: then a new season.
- **By hand** (Players tab): give or take a ticket (`/tickets/adjust`); start
  a new season (`/tickets/season`): every balance from zero, the old season
  archived with its balances.
- **Public**: the tournament's page shows its rules (`ticketInfo`), the
  player's page his tickets of the season (`/arena/api/players/<nick>`).

## Who may register (service `0.26.0`)

Conditions an organizer puts on a tournament (`access`, create and update)
or on a cup (`plan.access`, through its programme). Code:
`arena/lib/access.mjs` (pure: `cleanAccess`, `playerFacts`, `missingFor`),
`arena/public/access-form.mjs`; tests: `arena/test/test-arena-access.mjs`.

| Condition | Field |
|---|---|
| A player account (signed in) | `identity: 'account'` |
| At least N tournaments played here | `minTournaments` |
| At most N (beginners) | `maxTournaments` |
| At least X points here | `minPoints` |
| A medal / a gold medal | `medal: 'any' \| 'gold'` |
| No medal yet (beginners) | `noMedal` |
| Within the first N of a cup's standings | `cup: { id, top, name }` |

- **Facts**: this install's validated results only (decided 2026-10-24).
  Tournaments played: validated tournaments (not the tables of a tournament
  on several tables) where the player is ranked. Points: the cups' rule
  (players finished behind + 1, shared places averaged), Friendly excluded.
  Medals: as on the players' page.
- **Checked** at every registration made on the players' page (tournament,
  cup); a refusal is `code: 'access'` with `missing: [{ code, need, have,
  name? }]`. `POST /arena/api/t/<key>/eligible` and the cup's `op:
  'eligible'` answer the same without registering.
- **Not held back**: a player the organizer adds, and the qualifiers of a
  cup's steps or final. A cup's conditions go to the tournaments players
  enter (series, single tournament, step 1), not to the later steps nor the
  final.

## Players and their accounts (service `0.25.0`)

The first step of player management (design: players, identity and access
conditions; next: access conditions, tickets and seasons, nickname
verification, groups). Code: `arena/lib/players.mjs`,
`arena/public/players-ui.mjs`; tests: `arena/test/test-arena-players.mjs`.

- **The register** (`ARENA_DIR/players.json`, mode 600): the nicknames that
  matter — with an account, added by an organizer, or banned. The organizer
  list adds everyone registered somewhere or in a validated result, with
  tournaments played, wins and podiums.
- **Accounts**: nickname + password (8 characters at least, not the
  nickname; scrypt), sessions `ps_` of 30 days (SHA-256 stored). Made by an
  organizer with an invitation link (`/arena#pinvite=…`, 7 days, once), or by
  the player himself when `signup` is `open` (the super admin's choice;
  `invite` by default). An account claims its nickname in any case: a
  registration of that nickname without the session is refused
  (`nickClaimed`). A clash is the organizer's to settle (turn an account off,
  new link, remove the account).
- **Public API** under `/arena/api/players/<op>` (POST: `signup`, `login`,
  `logout`, `invite`, `password`, `me`; GET `/players`: the sign-up mode) —
  the web client already relays that address. Rate limited per address.
- **The session stands for the personal code**: `session` in the body of
  `/t/<key>/register|unregister|checkin|tablepass` and of the cup's
  `register|unregister|choose`; a registration made signed in takes the
  account's nickname and keeps `accountId`. An ended session answers 401
  (`session`), never a silent fallback.
- **Identity « accounts »**: only signed-in players register.
- **Bans**: `{ reason, until | null, by, at }`; refused at every registration
  (tournaments, cups) and when an organizer adds the player.
- **Who**: organizers manage players (`/admin/arena/players/*`); the sign-up
  mode is the super admin's (`/players/settings`); referees and read-only
  accounts read.

## Table password (service `0.24.0`)

On a LAN server nicknames are not checked: someone can connect as a
registered player before him and be invited in his place. With
`run.tablePassword`, the director opens the table with a password. The game
server (`HandleNetPacketJoinGame`) then asks an invite-only table for both
the invitation and the password; a spectator joins without either, so the
director comes back to watch as before.

- **Given on the players' page only**: `POST /arena/api/t/<key>/tablepass`
  with the nickname and the personal code; the player must be registered,
  not absent, and checked in when the tournament has a check-in. A table of
  a tournament on several tables takes the codes copied at the draw. Each
  time it is shown: a `tablePassShown` line in the journal. Rate limited as
  the check-in.
- **Never in the chat**: a private line would go to whoever holds the
  nickname. Each invited player is told once where to find it
  (`tablePassword` line of the chat catalogues).
- **Never stored**: HMAC-SHA256 of the install key over the tournament id and
  a nonce kept with the open table (`host.passNonce`, never shown); 10
  characters from `a–z 2–9` without look-alikes, typed by hand in the QML
  client. It reaches the worker over IPC only. The organizer sees it on the
  open table (`tablePasswordNow`).
- **Default**: on with the identity « personal code » (Official, or Custom
  with that identity), off otherwise; a checkbox on create and edit.
- The web client could fill it in by itself when the player accepts the
  invitation (it knows the code kept in the browser): later.

## A cup's programme (service `0.23.0`)

A cup can say how it runs instead of gathering tournaments added by hand
(a cup made the old way keeps its way; a programmed cup takes no tournament
added by hand). Code: `arena/lib/cupplan.mjs` (pure: checks the programme,
the slots, the events, what each tournament is made with), `cups.mjs`
(stores it, makes and updates the tournaments, registration, the sweep),
`arena/public/cup-plan-ui.mjs`; tests: `arena/test/test-arena-cupplan.mjs`.

| Format | What it is | Events of the cup |
|---|---|---|
| `series` | N tournaments (1–30), points, best of N | each counts |
| `seriesFinal` | the series, then a final for the top K (2–40) of the standings | series count; the final has `fromStandings: K`, no points; more than 10: several tables |
| `stages` | 2–4 steps, the last the final; Q (1–10) go on from each tournament | tournament n of a step feeds tournament n mod k of the next; a tournament of one table may receive 10 at most, the final 40 |
| `single` | one tournament (one table or several) | the final |

- **Dates.** The page works the repetition out in the organizer's own time
  (summer time kept) and sends plain dates; each date can be moved, added or
  taken off. Dates follow one another; each step (and the final) comes after
  the one before.
- **Slots.** `{ key, kind, step, n, at, qualify, tournamentId, auto }`, key
  `1-3`, `2-1`, `final`, `single`. A slot keeps its tournament when the
  programme is saved again (matched by key). A tournament that has started
  (players seated, a table drawn or opened, a result, or past
  « registration ») keeps its date and cannot be taken off.
- **Making the tournaments.** `auto`: the cup makes them all at once
  (« Name #1 », « Name – step 2 #1 », « Name – final »), with the shared
  settings and opening by itself; `organizer`: « Make this tournament » per
  slot (the same settings, changed afterwards on the tournament if wished),
  or attach a tournament of his own (it takes the slot's date); detach.
  Saving again updates the tournaments that have not started (date,
  settings, name of the cup's own); a date taken off discards the cup's own
  tournament (`deleted.jsonl`) or detaches the organizer's.
- **Visibility.** The tournaments of a public or unlisted cup take its
  visibility; those of a private cup are unlisted (reached by their link).
- **Registering for the cup** (`registration: 'cup'`): `POST
  /arena/api/c/<key>` with `op` `register | unregister | choose` (the web
  client relays this address already). One personal code for the cup, stored
  as its hash in the cup and on each tournament the player goes into; the
  page keeps it under `c:<key>` and under each tournament's key. Entry
  tournaments: the series, the single tournament, step 1 (every tournament,
  or the one picked: `stageEntry: 'choose'`, changeable until it starts).
  Capacity: one table 10, several 40 (picking: per tournament). The
  tournaments take no registration of their own and their page points to
  the cup. A player put into a tournament and gone from it is not put back.
- **By itself** (sweep, every 5 s): registered players into tournaments
  made since; the final of a `seriesFinal` takes the top K once the series
  is validated, or an hour before the final with at least one result (the
  missing ones in the journal); steps go on as before; once every slot has
  its tournament and all are validated, the cup closes (`cupClosed`,
  `auto: true`) and signs its standings.
- **Who**: organizers and the super admin (`/admin/arena/cups/plan`,
  `/cups/slot/{create,attach,detach}`); a referee or read-only account
  cannot.

## Starting again from zero (service `0.22.0`)

The super admin (the master key) has a **Reset** tab on `/arena/organize`
(hidden for every account; `GET/POST /admin/arena/reset`, refused to every
role, even to read). It takes away, in one go, any of: the Table check
watches, the tournaments (with their tables, players, results, journals and
witnesses), the cups, and the images organizers added (the two shipped images
stay). Typing `RESET` confirms.

- **Nothing is thrown away.** Everything moves (rename, same disk) to
  `<ARENA_DIR>/reset-<YYYYMMDD-HHMMSS>/`, one folder per reset, never
  overwritten; each reset is a line of `<ARENA_DIR>/resets.jsonl` (when, who,
  what, how many, the folder). Fetching something back is a manual move on the
  server, the service running or not.
- **What is kept stays whole.** Watches only: a watch a kept tournament
  stands on (its table, or the Table check its result came from) stays.
  Images only: an image a kept tournament or cup shows stays.
- **Refused while running**: a watch still connected, or a tournament table
  still open, among what would go. Stop or close it first.
- Medals are derived from the results: they follow at once. Accounts and
  sessions, the install key (`td-key.pem`), the director's avatar and the
  module settings never move.

Code: `arena/lib/reset.mjs`, `arena/public/reset-ui.mjs`; tests:
`arena/test/test-arena-reset.mjs`.

## Organizers (service `0.9.0`, web client `2.1.10-web.307`) — keys replaced by accounts in web.319

*History: the organizer keys below were replaced by organizer accounts
(« Organizer accounts and roles » above); the second-organizer rule for
corrections is unchanged.*

- **One key per organizer.** The admin creates it in Admin › Keys with the
  category « Tournaments (organizer) » (or `pokerth-web token add NAME
  tournaments`). With it, the organizer signs in to `/arena/organize`;
  the master key still works and acts as « admin ». The module's own settings
  (on/off, restart) stay master-only.
- **Who did what.** The web client passes the key's name to the service
  (`X-TD-Author`, URI-encoded); every journal entry carries it. A key named
  like one of the director's own authors (admin, director, scheduler,
  witness, player) is recorded as `org:<name>`. The page shows who is signed
  in (`GET /admin/arena/status` → `you`).
- **Corrections approved by a second organizer** (Official, « Corrections:
  second »): a correction is *proposed* (`correctionProposed`, the result
  unchanged); another organizer approves it — then it is applied and signed
  again (`corrected`, with `proposedBy`) — or rejects it with a reason
  (`correctionRejected`); its author can withdraw it. One correction waits at
  a time. Routes: `POST /admin/arena/t/correct {id, ranking, reason}`,
  `…/t/correct/approve {id}`, `…/t/correct/reject {id, reason}`.
- All organizers see and manage every tournament: there is no ownership yet.

## Witnesses (service `0.7.0`, web client `2.1.10-web.305`)

Witnesses check a result, they never decide it.

- **Who.** A web client seated at a table opened by the director. At the
  start of the game it asks `GET /arena/api/table?game=<id>&name=<table>`
  (the game id and table name the server gave it; only tables the director
  opened answer). Through this site's LAN servers only — never on
  pokerth.net, never in training. Option `td_witness` (Advanced options ›
  Network), on by default; a line in the chat the first time
  (`tdWitnessNotice`); the privacy notice says what is sent (`pvSrvTd`).
- **What.** For each hand, the stack of every player still in at its start,
  by nickname, and the winner — never cards — in a compact form
  (`{players, hands: [[h, stack…]]}`, under 60 KB so that it fits a keepalive
  request), with the player's nickname and, when `/arena` kept it in this
  browser (registration or check-in), the personal code.
- **When.** Every 10 hands, when the player is out, at the end, and when the
  page is hidden (`sendBeacon`). Reports of one player add up on the director
  (a reloaded client only knows the hands since).
- **Compared** (`arena/lib/witness.mjs`): with the director's journal,
  hand by hand — same players, same stacks — and the winner; without a
  director (manual result, log), with the ranking: the winner, and no one
  ranked above a player the witness saw outlast him. Verdict « agrees »,
  « disagrees » (the first difference: hand, player, both values), « nothing
  to compare » or « waiting for the result »; again when the result arrives
  and at validation. Each report goes in the journal (`witnessReport`, with a
  SHA-256 of the report); the report itself in `witness/`.
- **Who counts:** a player of the tournament, not absent; with the identity
  « Personal code », only a report carrying the right code. Others are shown,
  not counted. Anyone else is refused (`notPlayer`); a wrong code too.
- **Witnesses** setting: *Off* (no report taken), *Informative* (shown,
  never blocks), *Required* (Official): validating needs one counting witness
  that agrees and none that disagrees — or the organizer's reason (3 to 200
  characters), kept in the journal (`validated.witnessOverride`) and shown on
  the players' page. With automatic validation (Custom) the result waits and
  validates itself when a witness agrees.
- **API:** `POST /arena/api/t/<key>/witness {nick, code?, game, name,
  report}` — 60 per address in ten minutes; a private tournament takes a
  report from its own table (game id and table name) without the invitation
  code. The web client relays it up to 64 KB (other requests: 8 KB).
- **QML players** (service `0.8.0`), when the tournament accepts them
  (« Accept QML players as witnesses », `run.qmlWitnesses`, off by default):
  after the game, the player sends his game log (`.pdb`, 10 MB at most) from
  the players' page with his nickname (and personal code) —
  `POST /arena/api/t/<key>/witnesslog {nick, code?, invite?, log: base64}`,
  six per address in ten minutes; the web client relays up to 14 MB. The
  game is the one the server numbered like the director's table (`Game.GameID`);
  without a director, the log's game with the most of the tournament's
  players. Only `Seat_N_Cash` per hand and « wins game » are read (never the
  cards); the report is compared like a web client's and marked « log ». The
  file is not kept: its SHA-256 goes in the journal (`logSha256`).

## A service of its own (`tournament/`, decided and done 2026-10-23)

The tournament director has its own audience (organizers), lifecycle,
storage, accounts and processes, so it is a separate service **in this
repository**, with its own `package.json` and version (`0.1.0` first, shown
at the foot of `/arena`).

- **Launched by the web client.** While Admin › Community › Tournaments is
  on, the proxy (`server/arena-host.js`) forks `arena/server.mjs`,
  restarts it if it stops (1 s, 2 s, … up to 30 s), and stops it when the
  switch goes off. Nothing changes for Docker, PM2, the admin page's update
  or pokerth.net. The admin panel shows the service state and version. When
  the proxy goes away (restart, update), the service leaves with it and the
  next proxy starts a new one. Watches are detached processes of their own
  and keep running throughout.
- **Talking.** The service listens on `127.0.0.1` on a port it picks and
  reports over IPC (`ready`). The proxy relays `/arena` and its files
  (strict path pattern, no token) and `/admin/arena/*` (after checking
  the admin token with the admin brute-force limit) to it. A secret made at
  each launch (`X-TD-Secret`) and the author (`X-TD-Author`) tell the service
  the request is genuine. The service asks the proxy which servers it may use
  (IPC `servers`: the LAN directory and the local server) each time.
- **What it gets.** Only `ARENA_DIR`, `ARENA_SECRET`, `ARENA_CLIENT_VERSION` (the
  web client's version: the PokerTH release the director speaks), `ARENA_HOST`,
  `ARENA_PORT` and a few system variables. Not the admin token, nor database
  passwords.
- **On its own** (development, tests): `ARENA_ADMIN_TOKEN=… ARENA_SERVERS='[…]'
  ARENA_PORT=8091 node arena/server.mjs`, Bearer token.
- Accounts of its own come with the « organizer accounts » step; until
  then the web client's admin token is the way in. A separate repository
  stays possible later.

## Ready to stand alone, step by step (service `0.21.2`, decided 2026-10-24)

No split now. Each change to the Arena brings the day it becomes an
application of its own (its own Docker image or install script) a little
closer, without a project of its own.

Rules for every change to `arena/`:

1. **Nothing new outside `arena/`.** What the service takes from the web
   client goes through `arena/lib/platform.mjs` only (the PokerTH protocol,
   the create-table lists and limits, sql.js, the web client's version, the
   default data folder). `test-arena-platform.mjs` fails if another file of
   `arena/lib`, `arena/bin` or `arena/server.mjs` reaches outside.
2. **Everything the proxy provides also works from an `ARENA_*` variable**
   (public address, client address, servers, admin key, protocol version).
3. **The Arena's pages load only files the Arena serves**: no new
   `/modules/…` or `/logo…` of the web client.
4. **New tests run without `proxy.js`** when they can (start the service
   directly).
5. **The web client talks to the Arena through its HTTP API only**: no shared
   browser storage or file for a new feature.
6. **All data stays in `ARENA_DIR`**, portable as is.
7. **New Arena administration goes in `/arena/organize`**, not in the web
   client's admin page.

Links still to cut (tick them off as the code is touched):

- Code, all in `platform.mjs`: `public/proto/pokerth-bundle.mjs`,
  `public/vendor` (sql.js, or `ARENA_SQL_DIR`),
  `public/modules/create-presets.mjs` (later: read from the web client's API
  with a copy as fallback), the root `package.json` version (or
  `ARENA_CLIENT_VERSION`).
- Pages: done — the Inter font (`/arena/fonts/`, 0.37.0), the language list
  (`/arena/lang-meta.mjs`, via `platform.mjs`) and the Arena's own icons
  (0.30.0), the hero picture (`/arena/img/hero.webp`, 0.31.0).
- Running: launched and supervised by `server/arena-host.js`; servers over
  IPC (or, as its own app, sent by the linked web client — 0.35.0); super admin = the web client's master key and its brute-force limit;
  `x-td-origin`, `x-td-client` and noindex set by the relay; the switch and
  the Admin › Community › Arena panel; updates through the web client's admin
  page.
- Web client ↔ Arena: the witness (`arena-witness.mjs`) calls `/arena/api` on
  the same origin and reads the personal code from the same origin's browser
  storage. On another domain: a configured Arena address, CORS, and another
  way to link the personal code (the hardest point). A link from the web
  client to the Arena.
- Tooling: `test-arena-route` and `test-arena-public-browser` start
  `proxy.js`; test dependencies (jsdom, Playwright) come from the root; a
  Dockerfile, a compose file, an install script and a repository of its own
  (`git subtree split` keeps the history) come on the day.

Already done: own `package.json`, version and changelog; all data in
`ARENA_DIR`; organizer accounts and sessions in the service; a standalone mode
(`ARENA_ADMIN_TOKEN`, `ARENA_SERVERS`, `ARENA_HOST`/`ARENA_PORT`); the medals
API open with CORS.

## Its own app: the link with a web client (service `0.35.0`, web client `2.1.10-web.324`)

Decided 2026-10-24: the Arena becomes an application of its own, with its own
(private at first) repository. Until it is ready, the web client keeps both
ways: Admin › Community › Arena › « Where the Arena runs » — **inside this web
client** (the service is launched here, as before) or **its own app**.

**Only the Arena has an API.** The key is made by the Arena; the web client
exposes nothing for it and only sends.

1. The Arena, run on its own, holds a **link key** (`alk_…`):
   `ARENA_LINK_KEY`, or made at the first start and kept in
   `ARENA_DIR/link.json`. The super admin reads it on `/arena/organize` ›
   **Web client** (show, copy, « New key »).
2. In the web client, the Arena's address (an origin, no path) and that key,
   then **Test and save**. Address and key are saved only when the Arena
   accepts them.
3. The web client sends `POST <Arena>/arena/api/link/sync`
   (`Authorization: Bearer <key>`) with `{ url, version, servers, events }`:
   its public address (Admin › SEO, else the address the admin used), its
   version, the servers the Arena may use (LAN directory and local server)
   and the community events — at the test, then every minute (events every
   fifth send). The Arena keeps the last ones (on disk too) and uses the
   servers while under ten minutes old, the events under thirty. A server on
   the web client's loopback is moved to the web client's host
   (`ARENA_KEEP_LOOPBACK=1` keeps it; `ARENA_WEBCLIENT_URL` fixes the
   address). Precedence on the Arena: `ARENA_SERVERS` / `ARENA_EVENTS_URL`
   first, then the link.

In « its own app » mode the web client starts no service, `/arena` pages answer
302 to the Arena, and `/admin/arena/*` other than its settings answers 409 with
the Arena's organizer page.

**The witness across sites** (service `0.36.0`, web client `2.1.10-web.325`).
The players' API on the web client's site (`/arena/api/…`: the witness's
table lookup and reports) is relayed server-side to the Arena's own API, with
the link key (`x-arena-link`) and the player's address (`x-td-client`): the
browser stays on the game's site (no CORS, `sendBeacon` works). The Arena
believes a told address only from a genuine relay (launched by the web
client, or carrying the link key). The personal codes are kept by the
Arena's pages, on the Arena's site: its tournament page shows **Play on the
web client** when it is linked and this browser keeps a code for one of the
players; the link carries the codes in its fragment
(`#arena=<base64url JSON { v: 1, regs: { <key>: [{ nick, code }] } }>`, never
sent to a server), and the web client's `arena-witness.mjs` files them under
`pth_td_regs` and removes them from the address at once. Ten wrong keys from one address block it for ten
minutes on the Arena. The key is never sent back to the web client's admin page
(a hint only). A new key on the Arena cuts the link: the web client's next send
fails and its admin card says so until the new key is pasted.

**Ready to stand alone** (service `0.37.0`). `arena/` runs away from the web
client: `scripts/sync-shared.mjs <web client folder>` copies what it takes
from it into `arena/shared/` (ignored in this repository, committed in the
Arena's own), `lib/platform.mjs` looks there first, and the folder ships its
`Dockerfile`, `docker-compose.yml`, `install.sh` and `README.md`. Moving it to
its own repository: `git subtree split --prefix=arena`, push the result, then
run `sync-shared` there and commit `shared/`.

**Its own repository** (2026-10-24): `narmod/pokerth-arena` (private for
now), with the Arena's history since `tournament/` (web.297) and `shared/`
copied from web client `2.1.10-web.326`. It is the Arena's source of truth from
now on: `arena/` here is **frozen** at service `0.37.0` for the « Inside this
web client » mode, with no new feature, until it is removed.

Next steps: the removal of the embedded Arena from the web client once the app
runs; later a link from the
web client to the Arena and the player accounts' witness (a signed-in player
has no code to hand over).

## Updating the director (`web.300`, service `0.2.1`)

The director has its own version (`arena/package.json`) and changelog
(`arena/CHANGELOG.md`). A change that only touches `tournament/` bumps
that version only: the web client's version, its service worker and its
« new version » banner do not move.

- The web client's update check counts `tournament/` as code that needs no
  restart of the web client, so the update is a static one (the admin's
  « Update without restart », or the automatic one), with no player cut off.
- The web client (`server/arena-host.js`) checks every 15 s whether the
  service's files on disk (entry, `package.json`, `lib/`, `public/`) differ
  from those it started, and restarts **the service alone** if so. Watches and
  tables in progress are processes of their own and go on.
- Admin › Tournaments shows the running version and, if different, the one on
  disk; « Restart the service » restarts it by hand.
- A change to `server/arena-host.js` (the launcher, in the web client)
  is a web client change, with its version bump and restart.
- An install without git (Docker image baked) is still updated with a new
  image.

## Files

| File | Role |
|---|---|
| `arena/server.mjs` | Service entry: HTTP on 127.0.0.1, IPC with the web client. |
| `arena/lib/service.mjs` | HTTP side: page, API routes, auth by secret (or standalone token). |
| `arena/lib/manager.mjs` | Install key, known servers, lobby, watches (detached workers). |
| `arena/lib/journal.mjs` | Canonical JSON, hash-chained journal, verification, Ed25519 keys and signatures. Pure. |
| `arena/lib/tracker.mjs` | Ranking of one table from normalized spectator events. Pure. |
| `arena/lib/spectator.mjs` | Network client: login, spectator join, protobuf → events → journal + tracker, timeout keep-alive, reconnect with resync, late player names, sealing. Reads only: never sits, acts, acks a start or chats. |
| `arena/lib/lobby.mjs` | Lobby reader (guest login, tables, server type). |
| `arena/lib/host.mjs` | The director that opens a tournament table: create, invite, kick, hand over, then watch. |
| `arena/lib/worker.mjs` | One watch in a detached process, state and files on disk. |
| `arena/lib/showcase.mjs` | The home page: its sections, the lobbies and community events it reads. |
| `arena/public/home.mjs` | Draws the home page. |
| `arena/public/home-ui.mjs` | Organizer side, Home page (super admin). |
| `arena/public/sw.js` | The app's service worker (network first, offline fallback). |
| `arena/public/icons/` | The app's icons (SVG source, PNG sizes). |
| `arena/lib/groups.mjs` | Groups: clubs, teams, lists; the four ways in; members for the access conditions. |
| `arena/public/groups-ui.mjs` | Organizer side, Players › Groups. |
| `arena/lib/verifier.mjs` | A nickname proved on a game server: codes, the lobby bot, the account marked verified. |
| `arena/lib/tickets.mjs` | Tickets and seasons: kinds, balances, the moves of a validated tournament, seasons. |
| `arena/lib/access.mjs` | Who may register: conditions, a player's facts from the results, what is missing. Pure. |
| `arena/lib/players.mjs` | Players of the install: accounts (invitation or sign-up), sessions, nicknames claimed, bans. |
| `arena/test/test-arena-tablepass.mjs` | The table password: default, given against the code, never shown nor stored. |
| `arena/lib/cupplan.mjs` | A cup's programme: formats, dates, slots, the events and the tournaments it makes. Pure. |
| `arena/lib/reset.mjs` | Starting again from zero (super admin): moves watches, tournaments, cups and added images to a dated folder, keeping what kept data still uses. |
| `arena/lib/platform.mjs` | Everything taken from the web client, in one place (protocol, create-table lists, sql.js, version, default data folder). The only file of the service that reaches outside `arena/`. |
| `arena/lib/table.mjs`, `arena/lib/images.mjs` | Table settings (the web client's create-game lists, `public/modules/create-presets.mjs`); images of tournaments and cups. |
| `arena/lib/cups.mjs`, `arena/lib/badges.mjs` | Cups (points, stages, signed standings); medals (derived from the signed results, open API). |
| `arena/lib/pdb.mjs`, `arena/lib/tournaments.mjs` | PokerTH log reader (BBC rule); tournaments in manual mode. |
| `arena/public/` | The page: `index.html`, `organizer.mjs` (Table check), `tournaments-ui.mjs` (Tournaments), `manifest.json`. |
| `arena/bin/arena-spectate.mjs` | Command line: watch a table, write `<out>.journal.json` and `<out>.result.json`; `--verify` checks chain, signature and replay. |
| `arena/test/` | `test-arena-core` (journal, ranking cases), `test-arena-spectator` (fake server over TCP, command line), `test-arena-tournaments` (manual mode, `.pdb`), `test-arena-host` (opening a table against a fake server that behaves like the real one, then through the service), `test-arena-service` (workers, the service on its own), `test-arena-route` (real proxy launching the service, the page in jsdom). |
| `server/arena-host.js` | Web client side: the setting, launching and relaying. |

The service shares the repository's protobuf bundle (`public/proto/`), sql.js
(`public/vendor/`) and the create-table lists
(`public/modules/create-presets.mjs`) rather than copying them, all through
`arena/lib/platform.mjs`.

```sh
node arena/bin/arena-spectate.mjs --host 192.168.1.20 --port 7234 \
     --nick TD-test-T1 --game-name "Friday SnG"
node arena/bin/arena-spectate.mjs --verify arena-out.result.json arena-out.journal.json
npm run test:td        # every tournament test (npm --prefix arena test)
```

The install key (`td-key.pem`, created on first use, mode 600) and the
output files are git-ignored. Use it only on a server you run, or with its
operator's agreement.

## Order of work

1. Spectator prototype, and the Table check on `/arena` (done).
2. Storage layer (JSON and SQL) and migrations.
3. Manual mode on `/arena` (done, `web.296`), then the director as a
   service of its own (done, `web.297`, service `0.1.0`).
4. Witness reports from the web client, compared with the journal (done in service `0.7.0`).
5. Persistent state machine, resume after restart.
6. Admin › Tournaments (settings) and per-server `tournaments` keys.
7. `/arena`: public and organizer views, scheduled Sit & Go end to end
   (table creation, seat check and hand-over done in `web.299`; opening at
   the scheduled time, announcements and messages to the table in service
   `0.3.0`; check-in in `0.5.0`; the chat language in `0.6.0`; witnesses
   in `0.7.0`; QML witnesses by their log in `0.8.0`; organizer keys and
   corrections by a second organizer in `0.9.0`; the collusion check in
   `0.10.0`).
8. Collusion check.
9. Organizer and player accounts.
10. Requests to organize.
11. Multi-table rounds, then leagues.
Not planned for now: anything for pokerth.net (it would need its
maintainers' agreement).
