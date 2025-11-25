# --- Base image ---
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# --- Install dependencies ---
FROM base AS deps
COPY package.json bun.lock /usr/src/app/
RUN bun install --frozen-lockfile --production

# --- Copy source code ---
FROM base AS release
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
EXPOSE 3300
USER bun
ENTRYPOINT ["bun", "run", "start"]
