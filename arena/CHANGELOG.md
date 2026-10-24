# Arena — changelog

The Arena was called « tournaments » (module `tournament/`) until 0.18.0.

The tournament director (`tournament/`) is a service of its own, launched by
the PokerTH web client. It has its own version (`tournament/package.json`,
semantic versioning) and this changelog. A change that only touches
`tournament/` bumps this version and is listed here; the web client's version
does not move for it, and the web client restarts the service alone when the
new code lands (see `docs/TOURNAMENT_DIRECTOR.md`, « Updating the director »).
The web client's own `CHANGELOG.md` keeps the history up to `2.1.10-web.299`.

## 0.21.1 — 2026-10-24 (web client `2.1.10-web.319`)

### Removed
- Organizer keys (Admin › Keys, category « Arena (organizer) »): organizers
  sign in with their account only; the master key remains the super admin's.

## 0.21.0 — 2026-10-24 (web client `2.1.10-web.318`)

### Added
- **Organizer accounts** with a login and a password. The super admin (the
  master key) creates them in Arena › Accounts and hands over a one-time
  invitation link (7 days) where the organizer chooses a password. Roles:
  organizer (creates and runs tournaments and cups), referee (validates,
  handles corrections and the collusion check, creates nothing), read only.
  The service checks the role on every request; the page hides what a role
  cannot use. Accounts can be turned off, given a new link (password
  cleared) or deleted; each changes its own password. Passwords as scrypt
  hashes, tokens as SHA-256; sign-in attempts limited.
- **Deleting a tournament** — the super admin only, the name typed again
  (with its tables for a tournament on several tables); its medals go, a cup
  that used it shows it as missing. A line is kept in
  `tournaments/deleted.jsonl`.

## 0.20.0 — 2026-10-24 (web client `2.1.10-web.317`)

### Added
- **Deleting a cup** — the super admin only (master key; an organizer key is
  refused), with the cup's name typed again: the cup and all its data go
  (journal, signed standings, medals); its tournaments stay. A line is kept in
  `cups/deleted.jsonl`. Organizer page: « Delete this cup » in the cup.

### Removed
- Everything kept for the old « tournaments » names (fresh start, decided
  2026-10-24): the redirects from `/tournament…`, the `/admin/tournaments`
  path, the `tournaments` key scope and config key, `TD_DIR`, the move of the
  old data folder.

## 0.19.0 — 2026-10-24 (web client `2.1.10-web.316`)

### Changed
- **Renamed « Arena »** (it holds tournaments, cups and medals): folder
  `arena/`, pages and API under `/arena` (the old `/tournament…` addresses
  are sent on by the web client), organizer API `/admin/arena/*` (the old
  path still answers), key scope `arena` (old keys keep working), environment
  `ARENA_*` (`TD_DIR` still honoured), data folder `arena-data/` or
  `/data/arena` (the old one is moved once). Page header and title « Arena ».
  Mapping in `docs/ARENA.md`.

## 0.18.0 — 2026-10-24

### Added
- **Players who do not come to the table** — a rule per tournament
  (organizer page, « Players who do not come to the table »). Automatic (the
  default): a refusal, an invitation left unanswered for a minute, « busy »
  in another game or a seat left before the start is a failure, and the
  player is invited again a minute later; coming back to the server or out
  of another game, he is invited at once without a failure. From 10 min past
  the start, 3 failures or not connected = absent (told privately, not
  ranked) and the table goes on with the others. Custom: the organizer's
  numbers. Manual: nothing automatic, as before.

### Fixed (audit of the director's scenarios, `test-td-scenarios.mjs`)
- The admin started before every registered player sat (ten players, or the
  director lost its seat): the result was refused (« not in the result ») —
  the missing players are now absent at the start.
- Only the first admin was asked to start: each new admin is asked too.
- Someone not registered let in after the hand-over: the admin is now asked
  to remove them, and a start with strangers or computer players is said in
  the table chat.
- « Bob » and « bob » are two players for the server: the director could
  invite the wrong one; the exact spelling now comes first.
- Closing the table before the start left the players at a table nobody
  followed: the director now tells them, removes them and leaves.

## 0.17.1 — 2026-10-24 (web client `2.1.10-web.315`)

### Changed
- **Never indexed by search engines:** every answer under `/tournament`
  (pages, images, API, errors) carries `X-Robots-Tag: noindex, nofollow,
  noimageindex`; the web client forces it again when relaying.

## 0.17.0 — 2026-10-24 (web client `2.1.10-web.314`)

### Added
- **Images of tournaments and cups.** A library: two shipped images
  (« Tournament », the default of a tournament; « Cup », the default of a
  cup) and the ones organizers add — any organizer, from the organizer page:
  the image is made in the browser into a JPEG of 800 px at most and a
  192 px thumbnail; images are added, never replaced or removed. A
  tournament or a cup picks one when created or later (also once validated
  or closed); the tables of a tournament on several tables take its image.
  Players' page: the picture at the top of the tournament's or cup's page,
  the thumbnail on its card. A shared link shows it (og:image, built from the
  address the web client is reached at; private ones say nothing). Public
  API: `image` and `thumb` on every tournament and cup; the images at
  `/tournament/img/<id>.jpg` and `<id>.t.jpg` (any origin).

## 0.16.0 — 2026-10-24 (web client `2.1.10-web.313`)

### Changed
- **Table settings = the web client's « Create a table » form.** The game
  styles (Relaxed, Normal, Fast, Ranking, We Cup, BBC), the community
  templates (BBC Step 1–4, Monthly Cup, WEC…), the blind increase interval,
  the blinds order (always double, or a manual list and what comes after it),
  time to act and pause between hands, with the same limits. Both read
  `public/modules/create-presets.mjs`; the organizer page gets the lists from
  `GET /admin/tournaments/table-presets`, so a change in the web client
  reaches the tournaments by itself. The director now sends the manual blinds
  order to the server. Defaults: the « Normal » style.
- The limits are the game server's (`netpacketvalidator`): the old ones let
  an organizer ask for 120 s to act or 3 s between hands, which the server
  refuses (it closes the session); a table stored that way is brought back
  inside the limits when the director opens it.
- **The director's avatar: one of the four robots only.** Sending an image of
  one's own is removed (an image left by 0.11–0.15 is ignored).

## 0.15.0 — 2026-10-24

### Changed
- **The director's avatar: four robots to pick from.** New robots replace the
  old one; robot 3 (chip and checklist) is the default. The organizer page
  shows the four and picks one with a click; sending an image of one's own
  still works and wins over the robot; « Back to the default » returns to
  robot 3. Tables opened afterwards use the choice.

## 0.14.0 — 2026-10-24 (web client `2.1.10-web.311`)

### Added
- **Medals**: gold, silver and bronze for the first three of a validated
  tournament (Club, Official or Custom, at least 4 players ranked; not the
  tables of a tournament on several tables) and of a closed cup (at least 2
  validated tournaments). A shared place shares the medal. Derived from the
  signed results each time, so a correction moves a medal by itself; private
  tournaments and cups give none, unlisted ones give the medal without the
  link.
- **Players' page** `/tournament/p/<nick>`: medals, then every tournament and
  cup with its place. Every nickname in a ranking or cup standings links to
  it, with its medals after it.
- **Open API** for other clients and sites (any origin, versioned `v: 1`):
  `/tournament/api/players/<nick>`, `/tournament/api/badges?nicks=…` (up to
  100 players), `/tournament/api/badges` (everyone with a medal). Format in
  `docs/TOURNAMENT_DIRECTOR.md`, « Medals ».

## 0.13.0 — 2026-10-24 (web client `2.1.10-web.310`)

### Added
- **Cups**, by points, by stages, or both. Points: each counted tournament
  gives every player the number of players finished behind him, plus one (a
  shared place: the average) — it grows with the field by itself and anyone
  can check it; the standings add up each player's best N results (0 = all).
  Stages: the first Q of a validated tournament go on to the next one by
  themselves (several tournaments may feed the same one), up to a final; a
  final may also take the top K of the points standings. Ranking of the cup:
  the final's places, then the furthest stage, the points, the best single
  results one by one. Only validated results count; a corrected tournament
  changes the standings by itself. Closing the cup signs its standings.
  Organizer page: a « Cups » tab. Players' page: the cups on the start page,
  a page per cup (`/tournament/c/<key>`: rules, tournaments, standings), and
  a link from each tournament to its cups.

## 0.12.0 — 2026-10-24 (web client `2.1.10-web.309`)

### Added
- **Several tables + final table** (format « multi », 11 to 40 players): the
  players (those who checked in, with the identity « code ») are drawn at
  random into tables of at most 10 — keeping apart the pairs the collusion
  check flagged before, with « separate » — each played as a Sit & Go of its
  own (director, witnesses, collusion check, result, validation). Once every
  table is validated, the first N of each (1 to 5, 2 by default) play the
  final table — opened by itself when the tournament opens by itself, else
  « Open the final table ». The final's ranking comes first, then the others
  by their place at their table (the same place shared); the tournament's
  result is then validated and signed; a table corrected later recomputes it.
  Organizer page: format and finalists in the form, « Draw the tables »,
  « Open the tables », the tables under their tournament in the list.
  Players' page: the tables and the final, each with its own page.
- The witness lookup of a table gives its tournament's key, where the
  personal code was kept (web client `2.1.10-web.309`).

## 0.11.0 — 2026-10-24 (web client `2.1.10-web.308`)

### Added
- **The director's avatar:** a robot of its own, so that players tell it from
  the others in every PokerTH client — announced by its MD5 at login and sent
  when the server asks for it (PNG, within the server's 30 KB). Any organizer
  can change it on the organizer page (« The director's avatar »: any image,
  made 96×96 in the page) or go back to the robot; tables opened afterwards
  use it. Also shown on the players' page (`/tournament/avatar`).

## 0.10.0 — 2026-10-24

### Added
- **Collusion check** (Club: report; Official: separate, which reports until
  tournaments have several tables): from the director's journal, pairs who
  spare each other or pass chips — soft play heads-up, no pressure, folds to
  one player, chip passing — each signal with its numbers and a minimum
  sample. On the organizer page only (« Check again » also while the table
  runs; a warning above « Validate »); players never see it; the journal
  keeps the counts, not the names. Never a sanction.
- The director records one « hand log » per hand in its journal (actions and
  winners, never hole cards); the ranking does not depend on it.

## 0.9.0 — 2026-10-24 (web client `2.1.10-web.307`)

### Added
- **Organizers.** One key per organizer, made by the admin in Admin › Keys
  (category « Tournaments (organizer) »): it signs in to the organizer page,
  whose sign-out button says who is signed in, and its name is recorded with
  every action in the journal (the master key acts as « admin »).
- **Corrections approved by a second organizer** (Official): a correction is
  proposed; another organizer approves it (then it is applied and signed) or
  rejects it with a reason; its author can withdraw it.

## 0.8.0 — 2026-10-24 (web client `2.1.10-web.306`)

### Added
- **QML players as witnesses**, per tournament (« Accept QML players as
  witnesses », off by default, in the form and in Edit): after the game a
  player of the official client sends his game log (`.pdb`, 10 MB at most)
  from the players' page, with his nickname (and personal code). The
  director's game is found by its server game id (without a director: the
  game of the log with the tournament's players); only the stacks at the
  start of each hand and the winner are read — never the cards — and compared
  like a web client's report. The file is not kept; its SHA-256 goes in the
  journal. The page says where the logs are. `POST /tournament/api/t/<key>/witnesslog`
  (six per address in ten minutes).

## 0.7.0 — 2026-10-24 (web client `2.1.10-web.305`)

### Added
- **Witnesses.** The web clients at the director's table send what they saw
  (stacks at the start of each hand, the winner — never cards); each report
  is compared hand by hand with the director's journal, or — in manual mode —
  with the ranking set: « agrees », « disagrees » (with where), « nothing to
  compare ». Only the tournament's players are witnesses; with the identity
  « Personal code » only reports carrying it count. Reports of a player add
  up (a reloaded client). Every report is in the journal with its
  fingerprint. `GET /tournament/api/table?game=&name=` (is this table a
  tournament's?), `POST /tournament/api/t/<key>/witness` (60 per address in
  ten minutes; a private tournament's report is taken from its table).
- **Witnesses required** (Official): validating needs one witness that
  agrees and none that disagrees, or a reason from the organizer, kept in the
  journal and shown on the players' page. An automatic validation waits for
  its witnesses (Custom).
- Organizer page: the witnesses, their verdicts and differences; players'
  page: how it works, the witnesses and the verdicts.
- A code typed for the check-in is kept in the browser too, so that the web
  client's report carries it.

## 0.6.0 — 2026-10-24

### Added
- **Chat language** per tournament: the director writes its lines (welcome,
  kick reason, admin notices, start, players out, heads-up, winner) in one of
  the app's 83 languages, English by default — « Language of the director in
  the chat » in the form and in Edit; the tournament's page says which.
  Lines in `lib/botlang/<code>.mjs`; `scripts/test-lang-count.mjs` requires
  one for every language of the app.

### Fixed
- The server takes at most 128 bytes per chat line or private message and
  closes the connection of whoever sends more: a long nickname in a welcome,
  or an organizer's message of up to 200 characters, could make the director
  drop off its table. Every line is now split into parts the server accepts,
  between sentences or words (also in languages written without spaces),
  never inside a character.

## 0.5.1 — 2026-10-24

### Changed
- French: normal spaces before « : », « ? », « ! » and « ; », as in the web
  client (no more non-breaking spaces).

## 0.5.0 — 2026-10-23 (web client `2.1.10-web.304`)

### Added
- **Check-in** for the identity « Personal code » (Official profile): in a
  window before the start (30 minutes by default, 5 to 240, « Check-in
  opens » in Edit; at once without a date), each player confirms on the
  players' page with their nickname and personal code — one click when the
  code is kept in the browser. The page shows the window, who checked in and
  the count; « How it works » gets the step.
- Only the players checked in are invited when the table opens (by hand or by
  itself), at least two; the others are marked absent at once, in the journal.
- A player added by the organizer gets a personal code too, shown once to the
  organizer; « New code » replaces a lost one; « Check in » lets the organizer
  check a player in himself. All in the journal.
- Twelve check-in attempts per address in ten minutes.

### Changed
- The players' page no longer refreshes while a player is typing in a form.

## 0.4.0 — 2026-10-23 (web client `2.1.10-web.303`)

### Added
- **The players' page**, `/tournament`, in every language of the app (83):
  public tournaments (playing now, open for registration, coming up,
  finished), each with its own page `/tournament/t/<key>` (a random key: an
  unlisted tournament is reached by its link only; a private one asks for its
  invitation code). How it works, the players, the table to join once the
  director has opened it, the ranking with its signature and the journal to
  download.
- **Registration by the players**, with their PokerTH nickname (checked as
  the server would), per tournament (« Players can register themselves », on
  by default); closed when the table is full (10), once the director has
  opened the table, or when the tournament is over. Each registration gives a
  personal code (kept in the browser too), needed to unregister; only its hash
  is stored. Six registrations and twelve unregistration attempts per address
  in ten minutes. noindex while in beta.
- The organizer tools move to `/tournament/organize`; each tournament shows
  its players' link (with the invitation code when private) and marks the
  players who registered themselves.
- Language files under `tournament/public/lang/`, one per language of the app
  (`scripts/test-lang-count.mjs` requires them); the shared style
  (`td.css`) and theme switch (`theme.mjs`) of both pages.

## 0.3.3 — 2026-10-23

### Changed
- `/tournament` dressed like the public pages (/rules, /faq): the start
  screen's chips and flames behind the title, the four suits, the title in
  heavy Inter, card titles as the forum's section bars; light and dark themes
  kept, phone header on one line.

## 0.3.2 — 2026-10-23

### Changed
- Before the start, the director writes to the players **privately**: the
  waiting room of the official client (and of the web client, `2.1.10-web.302`)
  shows the lobby chat and private messages, not the table chat. Welcome when
  a player sits, the reason of a kick, the new admin asked to start (and
  reminded), the others told who starts, the organizer's messages. Once the
  game runs (the server refuses private messages to its players), the table
  chat as before: start, players out, heads-up, winner, organizer's messages.
- No more line in the chat when the director leaves its seat: the private
  messages above say what matters.

## 0.3.1 — 2026-10-23

### Added
- Invited again by itself: a registered player who drops from the server is
  invited again as soon as they are back (a new connection has a new player
  id, so the old invitation is gone); one who leaves the table before the
  start is invited again at once. Also after the hand-over, until the start.

### Changed
- No more announcement when the blinds rise: every client already shows it.

### Fixed
- The director's lines before the start were not shown in the web client's
  waiting room (only their sound): fixed in the web client `2.1.10-web.301`.

## 0.3.0 — 2026-10-23

### Added
- The director opens the table by itself: « Open the table by itself, N
  minutes before the start » (needs a start date). If it cannot (server
  unknown, fewer than two players…), the page says why and it tries again
  every 2 minutes; a start more than an hour past is not opened.
- Announcements in the table chat, on by default and per tournament: blinds
  rising, who is out and how many are left, heads-up, the winner and the
  second.
- Message to the table from `/tournament` while the director runs it; lines
  with links or in capitals are refused (the server's chat filter would mute
  the director).

## 0.2.1 — 2026-10-23

### Changed
- « beta » badge on `/tournament` (header, title, installed app name).
- From now on the director is updated on its own: an update that only touches
  `tournament/` restarts this service, not the web client (web client
  `2.1.10-web.300`).

## 0.2.0 — 2026-10-23 (web client `2.1.10-web.299`)

### Added
- The director opens the table of a tournament: invite-only table with the
  tournament's table settings, invitations, kicks of players who are not
  registered, hand-over to the first player, then watched to the end; the
  result reaches the tournament by itself.

## 0.1.0 — 2026-10-23 (web client `2.1.10-web.297`)

### Added
- First release as a service of its own: Table check (watch a table as a
  spectator, sealed and signed result) and tournaments in manual mode.
