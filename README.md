# PokerTH Web Client

An experimental modern web client for [PokerTH](https://github.com/pokerth/pokerth), the open-source Texas Hold'em poker game.

The goal of this project is to let players connect to existing PokerTH servers directly from a browser through a small WebSocket-to-TCP/TLS proxy.

## Project status

This project is currently an **alpha prototype**. It is suitable for testing, development, and experimentation, but it should not yet be considered production-ready.

Current capabilities include:

- Browser-based PokerTH interface
- WebSocket-to-TCP/TLS Node.js proxy
- Guest connection flow
- Lobby display
- Player list
- Game list
- Join existing games
- Create new games
- Basic poker table interface
- Game and lobby chat
- Responsive interface foundations

## Architecture

Browsers cannot directly open raw TCP/TLS connections to classic PokerTH servers. This project uses a Node.js proxy as a bridge:

```text
Browser WebSocket <-> Node.js proxy <-> PokerTH TCP/TLS server
```

## Requirements

- Node.js 18 or newer
- npm
- A modern browser

## Installation

```bash
npm install
```

## Run

Start the proxy:

```bash
npm start
```

Then open:

```text
http://localhost:8080
```

You can also choose a custom port:

```bash
node proxy.js 8090
```

For a LAN server without TLS:

```bash
npm run start:lan
```

For development against a server with an untrusted certificate:

```bash
npm run start:insecure
```

> Warning: `--insecure` disables TLS certificate verification and should only be used for local development.

## Repository layout

```text
pokerth-web-client/
├── public/
│   ├── pokerth-client.html
│   └── favicon files
├── docs/
│   ├── PROJECT.md
│   ├── ROADMAP.md
│   └── SECURITY.md
├── proxy.js
├── package.json
├── .gitignore
├── LICENSE
└── README.md
```

## Known limitations

- The PokerTH Protobuf protocol is still handled manually in parts of the client.
- Registered account authentication is not fully implemented.
- Reconnection handling needs improvement.
- The client code is currently mostly contained in one HTML file and should be refactored into modules.
- More protocol tests are needed before considering the client stable.

## Recommended next steps

1. Replace manual Protobuf parsing with generated classes from `pokerth.proto`.
2. Split the client into maintainable JavaScript modules.
3. Add automated protocol tests.
4. Improve reconnection and error handling.
5. Add Docker support.
6. Improve the mobile interface.
7. Complete authentication support.

## License

This project is licensed under the GNU Affero General Public License v3.0 or later.

PokerTH is also licensed under AGPL-3.0.
