# Card deck assets — attribution

The vector card deck served from `public/cards/pokerth-new/` (the 52 face
SVGs `0.svg`–`51.svg` and the back `flipside.svg`) is the default deck of
the official PokerTH QML client, taken from the **PokerTH** project and
redistributed here under the terms of the AGPL-3.0.

- Source: https://github.com/pokerth/pokerth (branch `qt6-qml`,
  `src/gui/qt6-qml/resources/cards-simple/` and `cardBackground.svg`)
- Origin: rank and suit glyphs extracted upstream from
  https://github.com/digitaldesignlabs/responsive-playing-cards
- Copyright: © the PokerTH Development Team
- License: GNU Affero General Public License v3.0 (AGPL-3.0)

These assets are used only for the imported PokerTH vector deck
("PokerTH Royal Classic", Settings → Theme → Cards); the client's own
glyph-based deck contains no third-party assets.

The raster card deck served from `public/cards/pokerth-1-0/` (the 52 face
PNGs `0.png`–`51.png` and the back `flipside.png`) is the PokerTH "1.0"
big-index deck (shown on small screens), taken from the **PokerTH** project
and redistributed here under the terms of the AGPL-3.0.

- Source: https://github.com/pokerth/pokerth (branch `stable`,
  `data/gfx/cards/default_800x480/`)
- Origin: http://commons.wikimedia.org/wiki/Poker_(cards_deck) (Wikimedia Commons)
- Copyright: © the PokerTH development team
- License: GNU Affero General Public License v3.0 (AGPL-3.0)

## Additional QML card decks (ported for parity with the official client)

The following vector decks (each `0.svg`–`51.svg` + `flipside.svg`) are taken
from the **PokerTH** project (`src/gui/qt6-qml/data/gfx/qml/cards/` and
`.../backside/`) and redistributed under the AGPL-3.0:

- Stardust Light / Stardust Dark, Nobus 4 colours classic, Star Trek, Lemming,
  Xanax parchment — © the PokerTH development team.
- Bella Union 4 colours — © Julio Gomez (julio.go83@gmail.com).

- Source: https://github.com/pokerth/pokerth (branch `stable`,
  `src/gui/qt6-qml/` data resources)
- License: GNU Affero General Public License v3.0 (AGPL-3.0)

## Standalone card backs added with PokerTH 2.1.5

Three backs matching the table styles shipped in 2.1.5, each a single
`flipside.svg` under `public/cards/back-*/` taken from
`data/gfx/qml/backside/` and redistributed under the AGPL-3.0:

- Pirates — © the PokerTH Development Team.
- Mile High Club, Terminus Hotel 2 WoA — © BaShFX, the author credited
  upstream in each `*backsidestyle.xml`.

- Source: https://github.com/pokerth/pokerth (tag `v2.1.5`,
  `data/gfx/qml/backside/{pirates,mile_high_club,terminus_hotel_2}/`)
- License: GNU Affero General Public License v3.0 (AGPL-3.0)

## Blacklight 4c deck and Disco card back (PokerTH 2.1.8)

The vector deck `public/cards/blacklight-4c/` (`0.svg`–`51.svg`) is the
"Blacklight 4c" deck introduced alongside PokerTH 2.1.8: the geometry (rank
glyphs, suit symbols, layout) is inherited upstream from `default4c`, with the
blacklight colours and glow being original work.

The mirror-ball back served as `public/cards/back-disco/flipside.svg` (also
used as the deck's `flipside.svg`) is the matching "Disco" card back from
`data/gfx/qml/backside/disco/backside.svg`.

- © the PokerTH Development Team.
- Source: https://github.com/pokerth/pokerth (branch `stable`,
  `data/gfx/qml/cards/blacklight_4c/` and `data/gfx/qml/backside/disco/`)
- License: GNU Affero General Public License v3.0 (AGPL-3.0)
