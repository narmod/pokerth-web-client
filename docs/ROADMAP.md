# Roadmap

## Phase 1: Stabilize the prototype

- Fix known protocol mappings.
- Improve join-game error handling.
- Improve proxy TLS defaults.
- Add clearer runtime logs.
- Test lobby, game creation, joining, and gameplay flows.

## Phase 2: Protocol layer

- Add `pokerth.proto` to the project or fetch it during build.
- Replace manual Protobuf handling with generated JavaScript or TypeScript classes.
- Add binary fixtures for common server messages.
- Add automated encode/decode tests.

## Phase 3: Code organization

- Split the HTML monolith into modules.
- Separate network, protocol, state management, and rendering logic.
- Consider a lightweight build system.
- Add linting and formatting.

## Phase 4: User experience

- Improve mobile layout.
- Improve table animations.
- Add better connection and error messages.
- Add theme support.
- Improve accessibility.

## Phase 5: Advanced features

- Complete registered account authentication.
- Add reconnection support.
- Add spectator mode.
- Add invitation handling.
- Add hand history.
- Add Docker deployment.
