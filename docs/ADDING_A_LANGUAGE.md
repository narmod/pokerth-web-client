# Adding a language

What it takes to bring the client to one more language, in the order that
keeps the test suite green at every step. Written after the Estonian rollout
(`et`, 2026-09-12, `2.1.8-web.144` and `.145`), which is the reference example:
read its commits if anything below is unclear.

Budget, per language: about 70 KB of UI catalogue, 40 KB of help corpus and
15 KB of SEO copy. It does not fit in one sitting.

## The three steps

The steps are ordered so that the suite is green after each commit. Steps 1
and 2 have to land **together** in the same commit as the wiring —
`scripts/test-lang-count.mjs` requires a help corpus for every UI catalogue,
so registering a catalogue without its help would leave the suite red.

Work in progress can be committed freely as long as the language is **not yet
registered** in `modules/i18n.mjs`: nothing loads the files, nothing is visible
to players, and each commit is a safe resume point. This is how the Estonian
catalogue was built over a dozen commits.

### Step 1 — the UI catalogue

Copy `public/modules/lang/en.mjs` to `<code>.mjs` and translate every value.

- `meta` holds the label, the text direction and an inline flag SVG.
  `LANG_META` is derived from it at load time — there is nothing else to
  declare anywhere.
- Keep `{token}` placeholders and `||` line separators exactly as they are.
- Poker action terms stay in English: `fold`, `check`, `call`, `raise`,
  `allin`, the `actBadge*` and `poker*` keys, and the F-key hints.
- Hand names **are** translated (`h1n`…`h10n`), like every other catalogue.
  Write them down: the SEO page reuses them and a test compares the two.
- Pack names are not translated: table styles, decks, card backs, seat packs
  (`tableSaloon`, `cardbackNobusBlack`…), and the community names Ranking,
  WeCup, BBC.
- A handful of values legitimately stay identical to English — pure templates
  (`logShowdown`), the copyright line, pack names.

Before considering it done, check parity against English — keys **and**
placeholders:

```js
Promise.all([import('./public/modules/lang/xx.mjs'),
             import('./public/modules/lang/en.mjs')]).then(([xx, en]) => {
  const a = new Set(Object.keys(en.strings)), b = new Set(Object.keys(xx.strings));
  console.log('missing:', [...a].filter(k => !b.has(k)));
  console.log('extra:',   [...b].filter(k => !a.has(k)));
  const ph = s => (String(s).match(/\{[a-z0-9]+\}/gi) || []).sort().join();
  console.log('placeholder drift:',
    [...b].filter(k => a.has(k) && ph(en.strings[k]) !== ph(xx.strings[k])));
});
```

This is not optional bookkeeping: on Estonian it caught eight keys silently
skipped halfway through.

### Step 2 — the help corpus and the wiring

`public/modules/help/content/<code>.mjs`, same shape as `en.mjs`: 10 chapters,
68 sections, same ids in the same order, same fields (`t`, `b`, `list`, `keys`,
`note`) with the same list lengths. Compare the two structures before
committing, not just `node --check`.

Then, in a single commit:

- `public/modules/i18n.mjs` — one import, one `LANG_MODULES` entry. The
  inline overlay objects further down do **not** need an entry: with no key
  for the language, nothing is overwritten and the catalogue's own value is
  used, which is already translated.
- `public/sw.js` — precache `/modules/lang/<code>.mjs` and
  `/modules/help/content/<code>.mjs`.
- `public/admin.html` — add the code to `WC_LANGS` (welcome-message editor).
- The language count, everywhere it is claimed: `README.md`,
  `docs/PROJECT.md`, `public/modules/live/lobby.mjs`,
  `public/modules/live/spectate-dialog.mjs` (these four are what
  `test-lang-count` checks), plus source comments and the language section of
  **every** help corpus.
- Version bump in the three served files, `CHANGELOG.md` and
  `public/ChangeLog-web`.

### Step 3 — the SEO content pages

`seo-i18n/hands.js`, `seo-i18n/glossary.js`, `seo-i18n/howto.js`: one entry per
file, inserted among the existing ones. Then in `proxy.js`: the localized
`<title>` and description, the `og:locale` mapping, and the marketing block
(`m` / `g` / `r` / `pv`).

`et` joins the hreflang set and the sitemap by itself — both are built from
`seoPageLangs()`, which advertises a language the moment its entry lands.

Two things that bite here:

- `names[]` in `hands.js` must match `h1n`…`h10n` of the catalogue.
  `test-seo-hands-i18n` enforces it — the page and the in-game hand list have
  to call a full house the same thing.
- `lead` and `faqP` in `howto.js`, and `footer` in `glossary.js`, are
  functions containing `<a href=\"{rules}\">` inside a JS string. Get the
  escaping right or the placeholder survives into the output and the link test
  fails. Write these blocks as literal text, never through a layer that
  re-escapes them.

The SEO copy of every language also states the language count. Update it in
the same pass.

## Tests

All of these must pass before pushing. `npm install` first — `test-boot`
needs jsdom.

```
node scripts/test-lang-count.mjs          # count + one help corpus per catalogue
node scripts/test-boot.mjs                # 19 checks, offline boot
node scripts/test-accessibility-locales.mjs
node scripts/test-admin-langs.mjs
node scripts/test-precache.mjs
node scripts/test-seo-hands-i18n.mjs
node scripts/test-seo-glossary-i18n.mjs
node scripts/test-seo-howto-i18n.mjs
node scripts/test-seo-nav-lang.mjs
node scripts/test-seo-ssr.mjs
```

Plus `node --check` on every modified JS/MJS and a JSON parse of
`package.json`.

## Do not bulk-replace the language count with a bare regex

Raising the count touches ~60 files, so the temptation is a global
`45` → `46`. On Estonian that corrupted an SVG path (`2.45 2.45` became
`2.46 2.45`, breaking the mute icon) and rewrote two comments about a 45-second
watchdog threshold. Restrict the substitution to a digit pair followed by a
word that actually names languages, then **read the diff** before committing.
Those three regressions were caught by eye, not by any test.

## What the tests cannot check

Every catalogue in this repo is machine-assisted (see the README), and the
suite only verifies structure: keys, placeholders, counts, links. It says
nothing about whether a sentence reads naturally, whether a technical term is
the one Estonian or Latvian speakers actually use, or whether a marketing line
says what it meant to say. Pick the terminology for *proxy*, *odds*,
*showdown*, *lobby* early, stay consistent, and flag the choices so a native
speaker can correct them later through an issue or a pull request.
