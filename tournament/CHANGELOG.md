# Tournament director — changelog

The tournament director (`tournament/`) is a service of its own, launched by
the PokerTH web client. It has its own version (`tournament/package.json`,
semantic versioning) and this changelog. A change that only touches
`tournament/` bumps this version and is listed here; the web client's version
does not move for it, and the web client restarts the service alone when the
new code lands (see `docs/TOURNAMENT_DIRECTOR.md`, « Updating the director »).
The web client's own `CHANGELOG.md` keeps the history up to `2.1.10-web.299`.

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
