# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN npm install -g pnpm@9 --silent

WORKDIR /app

# Copy workspace manifests first (better layer caching)
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY apps/api/package.json ./apps/api/

# Install all workspace dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source
COPY packages/shared/ ./packages/shared/
COPY packages/database/ ./packages/database/
COPY apps/api/ ./apps/api/

# Build shared types first
RUN cd packages/shared && npx tsc

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build NestJS API
RUN cd apps/api && npx nest build

# ── Stage 2: Runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN npm install -g pnpm@9 --silent

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY apps/api/package.json ./apps/api/

# Production deps only
RUN pnpm install --no-frozen-lockfile --prod

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared/src ./packages/shared/src
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY apps/api/start.sh ./apps/api/start.sh

RUN chmod +x ./apps/api/start.sh

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["sh", "start.sh"]
