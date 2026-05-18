# Project overview

PokerTH Web Client aims to provide a modern browser-based interface for PokerTH while keeping compatibility with the existing PokerTH server ecosystem.

## Vision

The long-term goal is to make PokerTH easier to access from desktop, tablet, and mobile browsers without requiring users to install the historical Qt desktop client.

## Goals

- Provide a modern web interface for PokerTH.
- Keep compatibility with existing PokerTH servers.
- Support private and LAN games.
- Make deployment simple for self-hosted servers.
- Keep the project open source and aligned with PokerTH's AGPL license.

## Core components

### Web client

The web client renders the lobby, tables, cards, actions, chat, and game state.

### Proxy

The proxy bridges browser WebSocket traffic to PokerTH TCP/TLS traffic.

## Current maturity

The project is an alpha prototype. The main gameplay flow is partially implemented, but the protocol layer, authentication, reconnection flow, and tests need more work.
