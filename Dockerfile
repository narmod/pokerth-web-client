FROM node:20-alpine
WORKDIR /app

# git enables in-place self-update from the admin page when the app dir is a
# bind-mounted git checkout (compose volume `.:/app` — mode "docker-git").
# Harmless for the default image-baked install.
RUN apk add --no-cache git

# Install production dependencies only. The Protobuf bundle is pre-generated
# under public/proto/, so the proxy runtime needs just "ws" — no dev deps.
COPY package*.json ./
RUN npm install --omit=dev

# Copy the application source (node_modules is excluded via .dockerignore,
# so the clean production install above is preserved). --chown so the runtime
# user can write under /app (gallery deck/theme/table imports land in public/).
COPY --chown=node:node . .

# Writable directory for ALL persisted state. A named volume is mounted here
# by docker-compose so everything survives container recreation: leaderboard,
# admin-panel config, broadcasts, polls, visit counters, MySQL mirror config,
# delegate API keys and per-player preferences.
RUN mkdir -p /data && chown -R node:node /data
ENV STATS_FILE=/data/stats.json
ENV STATS_META_FILE=/data/stats.meta.json
ENV ADMIN_CONFIG_FILE=/data/admin-config.json
ENV BROADCASTS_FILE=/data/broadcasts.json
ENV POLLS_FILE=/data/polls.json
ENV VISITS_FILE=/data/visits.json
ENV DB_CONFIG_FILE=/data/db-config.json
ENV SCOPED_TOKENS_FILE=/data/scoped-tokens.json
ENV PREFS_DIR=/data/prefs

# Live directory for the optional self-updating mode (SELF_UPDATE=1): the
# entrypoint provisions a git checkout here and runs the app from it, so the
# admin "Update" button can pull in place. Mount a named volume on it to make
# updates persistent (see docker-compose.selfupdate.example.yml). Unused —
# and untouched — in the default image-baked mode.
RUN mkdir -p /srv/app && chown node:node /srv/app
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod 755 /usr/local/bin/docker-entrypoint.sh

# Drop root privileges.
USER node

# The proxy always listens on 8080 inside the container; remap the host port
# in docker-compose if you need a different external port.
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "start"]
