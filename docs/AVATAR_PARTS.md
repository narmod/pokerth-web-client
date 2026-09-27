# Avatar parts — how the toon portrait catalogue works, and how to extend it

Since `2.1.9-web.209` the portrait engine (`public/modules/ui/avatar-vector.mjs`)
is a fixed **layer pipeline** fed by a **declarative catalogue**
(`public/modules/ui/avatar-parts/`). Every option of every axis is one object
with a stable id and its own `draw`. Adding a hat, a mouth or a hairstyle is
one object in one file; nothing else changes.

## Files

| File | Holds |
|---|---|
| `avatar-parts/index.mjs` | the axes: id, i18n label key, kind (`shape` / `color`), `none`, default id, `opts`, vignette `crop`, dice `pNone` |
| `avatar-parts/helpers.mjs` | drawing helpers shared by the parts: colour mixing, body / garment primitives, card-suit glyphs, hair caps and curl helpers, eye primitives, the ten head outlines + landmarks (`FACE_PTS`), the height-dependent warp, the head clip |
| `avatar-parts/faces.mjs` | the 10 face shapes (5 per silhouette: `id`, `sex`, `slot`, `key`) |
| `avatar-parts/colors.mjs` | skin tones, hair colours, eye colours, outfit colours, backdrops (with their SVG `pattern`) |
| `avatar-parts/hair.mjs` | 52 hairstyles |
| `avatar-parts/outfits.mjs` | 43 garments |
| `avatar-parts/face-parts.mjs` | eyes, eyebrows, noses, mouths, skin marks, beards |
| `avatar-parts/extras.mjs` | glasses, earrings / piercings, hats, badges, the retired shoulder axis |
| `avatar-parts/expressions.mjs` | the 12 expressions (brows + eyes + mouth presets) and their overlays (`FX`) |
| `avatar-parts/legacy.mjs` | frozen v1 / v2 index tables — the migration of portraits saved before web.209. **Never edit an existing row.** |

`scripts/test-avatar-studio.mjs` renders every part on both silhouettes and
three face slots and checks the catalogue (unique ids, defaults, labels in
every language). `scripts/test-precache.mjs` fails if a new module file is
not listed in `public/sw.js` → `ASSETS`.

## A part

```js
{ id: 'fedora',          // stable string id — what saved portraits store; never reuse or rename one
  sex: 0,                // 0 masculine / 1 feminine / absent = shared (every hairstyle and outfit belongs to ONE silhouette)
  weight: 0.5,           // dice weight, default 1 (rare / striking options)
  covers: true,          // hats: hides the hair above the hat line (visor, bandana, hood, crown leave it)
  draw: function (ctx, r, L) { return '<path d="…" fill="' + ctx.v('#3a3a42') + '"/>'; } }
```

`draw(ctx, r, L)` returns an SVG snippet in the 200×200 portrait space:

- `ctx` — the render context: `ctx.v(hex)` registers a vertical volume
  gradient and returns its `url(#…)`; `ctx.cid` is the SVG's unique prefix
  for your own `<clipPath>` ids; `ctx.defs.push(...)` adds a def.
- `r` — the normalised recipe (ids), e.g. `r.sex`, `r.hair`.
- `L` — palette + landmarks: `L.fem`, `L.k` (face key 0–9), `L.pts`
  (`FACE_PTS[k]`: half-widths at the temples / ears / under the ear / cheek /
  jaw angle / jaw, then the chin's y), `L.hw` (ear-level half-width),
  `L.skin` `[base, shadow]`, `L.hc` `[base, highlight]`, `L.hcN` (natural
  hair colour for brows and beards), `L.ec` (iris), `L.oc` (outfit colour
  chosen by the player, or `null`).

Per family:

- **hair** — `draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) { return [back, front, scalp]; })`
  (`f` gradient fill, `dk` / `bk` darker tones, `hl` highlight, `P(d, fill)` a
  filled path). Draw for the ±53 oval: the engine **warps** every hair to the
  outline (temple width above the brow line, ear width at ear level).
  Flags: `underlay: false` (no temple underlay), `short: true` (a thin band
  under a hat), `noHat: true` (fits under no hat), `noHatDice: true`.
- **outfit** — `draw: outfitDraw(function (ctx, sk, C, skin) { … })` (`sk` skin
  gradient for collar openings, `C(def)` the outfit colour when `colorable:
  true`). Torso y 157–204; the feminine body is scaled ×0.86 by the engine.
- **hats** — drawn for the ±53 oval, scaled to the skull's ear-level width.
  Optional `back(ctx, r, L)`: a layer behind the hair and the head (the
  hood's inside). A hat built from the outline itself (`_headScaled`) returns
  a `<g data-fit="1">` so the engine leaves it alone.
- **beards** — `beardDraw(function (ctx, f, hc, MOUS, jaw, chin, w, dy) { … })`;
  `jaw(full, [sx, sy])` is the jaw beard built from the landmarks
  (`_beardMask`) and clipped to the grown outline.
- **eyes** — draw both eyes (L = 78, R = 122, y = 98); `lashes: 'both' | 'left' |
  'right' | null` (feminine lashes), `hidesEyec: true` when no iris shows.
- **colours** — `{ id, colors: [...], swatch?, pattern?(ctx) }`; `swatch` is
  the CSS background of the studio chip (a gradient for a patterned backdrop).
- **expressions** — `{ id, weight, set: { brows, eyes, mouth }, fx: ['vein', …] }`;
  an overlay is an `FX` entry `{ id, draw }` drawn over the hat, under the
  badge. `avSvg(recipe, size, { expression: 'tilt' })` overrides the recipe's
  expression at render time (table reactions).
- **faces** — an outline is a `_headD(k)` case + a `FACE_PTS` row in
  helpers.mjs, then `{ id, sex, slot, key }` in faces.mjs.

## Adding a part, step by step

1. Append the object to the family's list with a **new** id (kebab-case).
2. Run `node scripts/test-avatar-studio.mjs` — it renders the part on every
   outline; then look at it with the benches (`fit.html`, `hats.html`, …).
3. Nothing else: the studio row, the dice, the vignette, the silhouette
   filter and the migration tables pick it up. The photo analysis emits ids
   from `legacy.mjs` — extend its rules only when it should recognise the
   new part.

## Adding an axis

1. An entry in `index.mjs` (label key, kind, none, def, opts, crop, pNone).
2. Its label in **every** `public/modules/lang/*.mjs` (the test lists the
   keys) and its row in a studio group (`AV_GROUPS` in `avatar-studio.mjs`).
3. A draw slot in the engine's pipeline (`_render` in `avatar-vector.mjs`)
   and, if the recipe should migrate from an older format, a row in
   `legacy.mjs`.

## Recipes

`{ v: 3, sex: 0, face: 'm-oval', hair: 'short', … }` — ids, one key per
axis. `avNormalize()` accepts any older recipe (v1 without `v`, v2 numeric)
and migrates it; `avSanitize()` replaces options hidden for the silhouette
(same slot for the face, first visible otherwise) and keeps values whose
rows are hidden by an expression.
