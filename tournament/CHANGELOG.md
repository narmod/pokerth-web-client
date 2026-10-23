# Tournament director — changelog

The tournament director (`tournament/`) is a service of its own, launched by
the PokerTH web client. It has its own version (`tournament/package.json`,
semantic versioning) and this changelog. A change that only touches
`tournament/` bumps this version and is listed here; the web client's version
does not move for it, and the web client restarts the service alone when the
new code lands (see `docs/TOURNAMENT_DIRECTOR.md`, « Updating the director »).
The web client's own `CHANGELOG.md` keeps the history up to `2.1.10-web.299`.

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
