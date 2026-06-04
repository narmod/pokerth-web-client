# Roadmap

This is a living document. The client began as a way to play poker with family on
phones and tablets, and is growing toward something the wider PokerTH community can
use too. Items are grouped by status rather than fixed phases.

## ✅ Shipped

**Core gameplay**
- Full flow: lobby, table creation, joining, betting, showdown.
- Three connection choices (LAN / Dedicated, pokerth.net, Training) + Guest-mode toggle.
- TLS support (required for pokerth.net, optional for LAN) with smart auto-toggle.
- Exponential-backoff auto-reconnect with live countdown.
- Spectator mode.
- Advanced table setup: blinds, timeout, max players, password, fill-with-bots.

**Training mode (offline)**
- 100% offline solo play in the browser — local engine, no server or connection.
- Bot AI using Monte-Carlo equity vs the real number of opponents.
- Correct short-stack push/fold play.
- Difficulty levels (Easy / Mixed / Normal / Hard), chosen per table.
- Five bot archetypes (Rock, TAG, LAG, Calling-station, Maniac) — each with its own
  pre-flop range, raising tendency, calling threshold and bluff rate, orthogonal to
  difficulty, and with bot names that match their play-style.
- Position-aware pre-flop play: steal wider from the button/cutoff, tighten under the gun.
- Post-flop aggression: continuation bets by the pre-flop aggressor and semi-bluffs on strong draws.

**Experience**
- Mobile-first design for phones and tablets.
- Emoji avatars (500+), broadcast live, with anti-flicker caching.
- Session statistics panel (hands, wins, win rate, net result, best/worst hands).
- In-game chat and 30 emoji reactions.
- Sound effects for every action.
- Internationalisation in 36 languages, auto-detected and switchable on the fly.

**Platform**
- Installable PWA (mobile and desktop; works offline in Training mode).
- Docker image (multi-arch) + one-liner installer / updater / uninstaller.

## 🔨 Now (in progress)

- Finish registered-account authentication (the pokerth.net login flow) and make it
  robust end to end.

## ⏭️ Next

- **Code health**
  - Split the large `pokerth.js` into focused modules (network, protocol, state, UI).
  - Add linting, formatting, and a small automated test suite.
  - Move hand-written Protobuf handling toward generated classes + encode/decode tests.

## 🌅 Later / Ideas

- Mobile polish and visual themes (felts, light/dark), plus accessibility passes.
- Persistent hand history and export (beyond the current last-5-hands view).
- In-game invitations.
- Tournaments / multi-table.
- Native translation passes for languages currently falling back to English.
- Toward a community release: stable tagged releases, docs/screenshots, public demo.

---
Have an idea or hit a bug? Open an issue — feedback from real games is what shaped
this client.
