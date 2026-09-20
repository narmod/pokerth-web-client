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
```

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
