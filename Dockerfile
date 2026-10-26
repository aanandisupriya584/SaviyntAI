FROM node:22-bookworm-slim AS frontend-build
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

FROM node:22-bookworm-slim AS server-dependencies
WORKDIR /build/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund && npm cache clean --force

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=3003 HOST=0.0.0.0 \
    DIST_DIR=/app/frontend/dist DATA_DIR=/app/data \
    DOCS_DIR=/app/documents LOGS_DIR=/app/logs
WORKDIR /app
COPY --from=server-dependencies --chown=node:node /build/server/node_modules ./server/node_modules
COPY --chown=node:node server/package.json server/server.cjs ./server/
COPY --from=frontend-build --chown=node:node /build/frontend/dist ./frontend/dist
RUN mkdir -p /app/data /app/documents /app/logs && chown node:node /app/data /app/documents /app/logs
USER node
EXPOSE 3003
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node", "server/server.cjs"]
