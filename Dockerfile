# syntax=docker/dockerfile:1

FROM oven/bun:1 AS build
WORKDIR /app

# Install dependencies (cached unless the lockfile changes)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build the SvelteKit app (adapter-node -> build/index.js)
COPY . .
RUN bun run build

# Strip dev dependencies for the runtime image
RUN bun install --frozen-lockfile --production

FROM oven/bun:1-slim AS runtime
WORKDIR /app

# PORT is configurable: override the default at build time (--build-arg PORT=)
# or at runtime (-e PORT=). adapter-node reads PORT from the environment.
ARG PORT=3000
ENV NODE_ENV=production
ENV PORT=${PORT}

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE ${PORT}
CMD ["bun", "./build/index.js"]
