# PokerTH Arena — tournaments, cups and medals for PokerTH LAN servers,
# run on its own (service 0.37.0). Linked to a PokerTH web client with the
# link key shown on /arena/organize › Web client (see README.md).
#
#   docker build -t pokerth-arena .
#   docker run -d -p 8091:8091 -v arena-data:/data -e ARENA_ADMIN_TOKEN=<secret> pokerth-arena
#
# shared/ (the files the Arena takes from the web client) must be filled
# first: node scripts/sync-shared.mjs <web client folder>.
FROM node:22-alpine

WORKDIR /app
COPY . .
RUN test -f shared/proto/pokerth-bundle.mjs || { echo 'shared/ is empty: run node scripts/sync-shared.mjs <web client folder> first' >&2; exit 1; } \
 && rm -rf test data node_modules \
 && mkdir -p /data && chown node:node /data

ENV NODE_ENV=production \
    ARENA_HOST=0.0.0.0 \
    ARENA_PORT=8091 \
    ARENA_DIR=/data
VOLUME /data
EXPOSE 8091
USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://127.0.0.1:8091/healthz >/dev/null || exit 1
CMD ["node", "server.mjs"]
