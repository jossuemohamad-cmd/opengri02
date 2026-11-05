# ==============================================================================
# LECASU GridOps — Dockerfile de Produção Multi-Stage
# ==============================================================================

FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Criar utilizador não-root para execução segura
RUN addgroup -g 1001 -S lecasu && \
    adduser -S -G lecasu -u 1001 lecasu

COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY server ./server
COPY public ./public
COPY migrations ./migrations
COPY scripts ./scripts

# Permissões do utilizador seguro
RUN chown -R lecasu:lecasu /app
USER lecasu

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server/server.js"]
