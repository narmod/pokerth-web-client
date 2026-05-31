FROM node:20-alpine
WORKDIR /app

# Install production dependencies only. The Protobuf bundle is pre-generated
# under public/proto/, so the proxy runtime needs just "ws" — no dev deps.
COPY package*.json ./
RUN npm install --omit=dev

# Copy the application source (node_modules is excluded via .dockerignore,
# so the clean production install above is preserved).
COPY . .

# Writable directory for the persisted session-stats file. A named volume is
# mounted here by docker-compose so stats survive container recreation.
RUN mkdir -p /data && chown -R node:node /data
ENV STATS_FILE=/data/stats.json
ENV STATS_META_FILE=/data/stats.meta.json

# Drop root privileges.
USER node

# The proxy always listens on 8080 inside the container; remap the host port
# in docker-compose if you need a different external port.
EXPOSE 8080

CMD ["npm", "start"]
