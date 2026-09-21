# lang-tools

Helpers for [docs/ADDING_A_LANGUAGE.md](../../docs/ADDING_A_LANGUAGE.md). They do
the mechanical half of adding a language — extracting what has to be translated,
rebuilding the files in the exact shape of the English reference, wiring, and
raising the language count — so the effort goes into the translation itself.
Written during the Uzbek rollout (`2.1.9-web.85`–`86`); replaying that rollout
with them reproduces its commits byte for byte. The SEO pair (`seo-dump`,
`seo-build`) was added during the Kazakh rollout (`web.117`–`118`) and replays
its SEO commit byte for byte.

Everything runs from the repository root. Work files live in `.lang-work/`
(git-ignored; override with `LANG_WORK=/some/dir`).

| Step | Command | What it does |
|---|---|---|
| 1 | `node scripts/lang-tools/catalogue-dump.mjs` | `en.mjs` → `.lang-work/en.tsv`, one `key<TAB>value` per line |
| 1 | `node scripts/lang-tools/catalogue-build.mjs <code> <native label> <English name> [rtl]` | `.lang-work/<code>1.txt`, `<code>2.txt`… + `<code>.flag` → `lang/<code>.mjs`, with the comments, key order and layout of `en.mjs` |
| 1 | `node scripts/lang-tools/catalogue-parity.mjs <code> [ref]` | keys, `{placeholders}`, `\|\|`, `<b>`/`%1`, trailing spaces; lists what stayed English against a reference catalogue (default `is`) |
| 2 | `node scripts/lang-tools/help-dump.mjs` | English help → `.lang-work/help_en.tsv`, one `path\|field<TAB>text` per line |
| 2 | `node scripts/lang-tools/help-build.mjs <code> <English name> <native label>` | `.lang-work/<code>h1.txt`… → `help/content/<code>.mjs`, then checks the shape against `en.mjs` |
| 2 | `node scripts/lang-tools/wire-language.mjs <code> <old> <new> --after <code2> [--bump <oldVer> <newVer>]` | count in the other help corpora and the docs, `sw.js` precache, `WC_LANGS`, the three notices of `proxy.js` (from `.lang-work/<code>_notices.json`), version bump |
| 3 | `node scripts/lang-tools/seo-dump.mjs [ref]` | every SEO string → `.lang-work/seo_en.tsv`, one `path<TAB>text` per line; English where the site has it as structured text, else the reference language (default `fr`), prefixed `[fr] ` |
| 3 | `node scripts/lang-tools/seo-build.mjs <code> <og_locale> --after <code2>` | `.lang-work/<code>s1.txt`… → the `seo-i18n/` entries and the `proxy.js` entries (`SEO_I18N`, `OG_LOCALE`, `SEO_BODY_I18N`, `SEO_RULES_I18N`, `SEO_FAQ_I18N`), in the shape of `<code2>`'s; checks paths, `{tokens}`, HTML tags and the ten hand names against the catalogue |
| 3 | `node scripts/lang-tools/seo-lang-count.mjs bump <old> <new>` then `check <new>` | the count inside the SEO tables only, `\uXXXX`-aware; `check` evaluates the tables and lists the entries that spell the number out |

## Translation chunks

One entry per line, `key<space>value` — keys never contain a space, values may:

```
pmSend Yuborish
pmDeleteConfirm {name} bilan suhbat oʻchirilsinmi?
start.modes|list0 Internet — rasmiy pokerth.net serverida …
```

Values are raw text: no quoting, no escaping, `{tokens}` and `||` kept as they
are. A key left out of the catalogue chunks keeps its English value, and
`catalogue-build` prints that list — it should hold only what legitimately
stays English (action terms, pack names, the copyright line). The help chunks
are strict: a missing or unknown path is an error.

## What is still done by hand

- The translation, and the terminology choices that go with it.
- The flag (`.lang-work/<code>.flag`, one inline `<svg class="lang-flag" viewBox="0 0 60 30">`).
- `node scripts/gen-lang-meta.mjs` after wiring (it registers every file found in `lang/`).
- `CHANGELOG.md`, `public/ChangeLog-web`, and the smaller-languages note in `docs/ROADMAP.md`.
- Step 3 leftovers: the English "NN languages" phrases of `proxy.js`, and the
  languages that spell the count out (`seo-lang-count.mjs check` lists them).
- Reading the diff before committing. These tools print what they change for
  that reason.
