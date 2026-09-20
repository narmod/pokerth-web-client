# Mobile verification (iOS Safari / Android Chrome)

`scripts/test-mobile-browser.mjs` runs the client in real browser engines with
phone profiles and checks the geometry a player depends on. Run it before every
push that touches the table, the seats, the loupe, the action bar or the CSS.

```sh
npx playwright install chromium webkit   # once per machine
npm run test:mobile                      # all profiles
PTH_MOBILE=ios npm run test:mobile       # iPhone profiles only (WebKit)
PTH_MOBILE=android npm run test:mobile   # Pixel / Galaxy profiles only (Chromium)
PTH_DEVICES="iPhone 15,Pixel 7" npm run test:mobile
PTH_ENGINE=chromium npm run test:mobile  # every profile in one engine (iPhone viewports without WebKit)
```

On GitHub the `Mobile verification` workflow runs the same command on every push
that touches `public/`; failed checks appear as annotations on the run page and
the screenshots are attached as the `mobile-screenshots` artifact.

| Family | Engine | Profiles |
|---|---|---|
| iOS Safari | Playwright WebKit | iPhone SE (3rd gen), iPhone 15, iPhone 15 landscape |
| Android Chrome | Playwright Chromium | Pixel 7, Galaxy S24, Galaxy A55 landscape |

Any other Playwright device name can be passed through `PTH_DEVICES`. An engine
that is not installed is skipped with a notice.

## What is checked, per phone

A 10-seat hand is driven through a fixture WebSocket (flop dealt, my turn) -
deterministic, no bots, no network.

1. Boot without a JavaScript error; no horizontal page overflow.
2. Table: every seat inside the zone; self box centred and clear of the action
   bar; action buttons on screen and finger-sized (36 px, 28 px in the flattened
   landscape row); community cards inside the zone and under no seat.
3. Loupe: button offered; layer at x2; the view follows a side seat; then on
   **my turn the self box is centred and magnified** (the `web.90` regression:
   it landed at `left = W/2 + panX`, off-screen).
4. Mini-board (`web.91`): shown on my turn when the board is out of view,
   inside the zone, clear of the floating buttons and of the self box, mirrors
   the dealt cards (flop, then turn), tap = cards <-> self box; on a wide screen
   it hides once every real card is readable.
5. Loupe off: mini-board hidden and the layout back to the pixel.

Screenshots of every step land in `test-artifacts/mobile/` (git-ignored):
`<device>-1-table`, `-2-loupe-follow`, `-3-loupe-my-turn`, `-4-loupe-board`.
The assertions catch geometry; look at the pictures for everything else.

## Table sweep: every table size, seated and spectator

`npm run test:table-sweep` (`scripts/test-table-sweep.mjs`) opens the table for
**2 to 10 players, seated and as a spectator**, on portrait and landscape phones
(iPhone SE, iPhone 15, iPhone 15 landscape, Pixel 7, Galaxy A55 landscape) with
the full board dealt - 18 configurations per phone, about 10 s each. Per
configuration:

- the expected number of seats is drawn, each box inside the table zone;
- no two player boxes overlap;
- no player box covers a community card or the pot badge, none sits under a
  floating zone button;
- dealer / blind pucks and bet chips stay inside the zone and cover neither
  another player's box nor a community card;
- seated: self box centred and clear of the action bar; spectator: no self
  box, no action button.

Narrow it while working on one case:

```sh
PTH_DEVICES="Pixel 7" PTH_SEATS="4,6" PTH_MODES=seated npm run test:table-sweep
```

Screenshots: `test-artifacts/mobile/<device>-sweep-<mode>-<nn>.png`. Both tests
share `scripts/lib/mobile-harness.mjs` (server, phone profiles, fixture hand,
reporter, screenshots).

## Limits - what still needs a real phone

Playwright WebKit is the Safari engine, not Safari on an iPhone, and Chromium
with a Galaxy profile is not a Galaxy. Not covered here, to be checked on a real
device before a release: audio (`AudioContext` closed / interrupted on iOS),
the collapsing Safari toolbar and `100vh`, the notch / home-indicator safe area,
the on-screen keyboard over the bet field, PWA install and the service worker,
real touch latency and scrolling inertia.

## Adding a check

Add an `await check('label', async () => { ... })` block in `runDevice()`. Use
`geometry(page)` for rectangles, `turnTo / acted / dealTurn` to move the hand,
and `settle(page)` after anything that re-renders or pans. A good check fails
when the bug is put back: verify that once before relying on it.
