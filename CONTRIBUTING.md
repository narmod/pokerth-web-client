# Contributing

Thanks for your interest in the PokerTH Web Client! This is a small, friendly
project — contributions of all sizes are welcome, from typo fixes to new
features.

## Ways to help

- **Report a bug** — open an issue with steps to reproduce, your browser/OS, and
  whether you connect via the public demo or your own server.
- **Suggest a feature** — open a feature request and describe the use case.
- **Improve a translation** — the 36 language catalogues are largely
  machine-assisted, so native review is especially valuable (see below).
- **Send a pull request** — see the workflow further down.

For questions and ideas that aren't quite issues, use **Discussions** if it's
enabled on the repo.

## Development setup

```bash
git clone https://github.com/narmod/pokerth-web-client.git
cd pokerth-web-client
npm install
npm run start:lan        # local proxy without TLS, good for development
```

Then open `http://localhost:8080/`. See the **Development (running from source)**
section of the [README](README.md) for the TLS / custom-port / `--insecure`
variants, and [`docs/PROJECT.md`](docs/PROJECT.md) for an architecture overview.

The codebase is intentionally dependency-light:

- `proxy.js` — the WebSocket→TCP/TLS proxy and static HTTP server (Node — `ws` at
  runtime, plus `mysql2` only for the optional database mirror).
- `public/pokerth.js` — the bulk of the client logic (vanilla JS, no framework).
- `public/modules/` — extracted ES modules: `i18n` (36 languages), `theme`
  (theming engine), `sounds`, `music`, and the offline game engine under
  `public/modules/offline/`; plus the Protobuf bindings under `public/proto/`.

## Adding or fixing a translation

1. Catalogues live in `public/modules/lang/<code>.mjs`. The source of truth is
   `en.mjs` (every key must exist in each language).
2. To add a language, copy `en.mjs`, translate the `strings`, then register it
   in `public/modules/i18n.mjs` (add the `import` and an entry in
   `LANG_MODULES`).
3. Poker action verbs (Fold / Check / Call / Raise / All-In) are kept in English
   by convention in most languages; hand names and UI text are translated.
4. Keep placeholders intact: `{name}`, `{n}`, `{s}`, `{r}`, `{a}`, etc.

## Pull request workflow

1. Fork and create a topic branch (`fix/seat-overlap`, `feat/spectator-embed`…).
2. Keep PRs small and focused; one logical change per PR is easiest to review.
3. Describe **what** changed and **how you tested** it (browser, server mode).
4. Reference any related issue (`Fixes #123`).
5. Match the existing code style — no build step or linter is enforced; just keep
   it readable and consistent with the surrounding code.

Commit messages loosely follow the conventional style already in the history:
`feat:`, `fix:`, `docs:`, `ci:`, `style:`, `refactor:`.

## Code of Conduct

By participating you agree to abide by our
[Code of Conduct](CODE_OF_CONDUCT.md). Be kind.
