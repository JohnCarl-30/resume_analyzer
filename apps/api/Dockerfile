FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Builder stage
FROM base AS build
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# Build API directly from its directory to avoid root script / corepack recursion
WORKDIR /app/apps/api
RUN pnpm exec tsc -p tsconfig.json
WORKDIR /app

# Production stage
FROM base AS production
WORKDIR /app/apps/api
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/node_modules /app/apps/api/node_modules
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=build /app/apps/api/package.json /app/apps/api/package.json

# Cloud Run requires PORT to be set via env, default to 8080
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/server.js"]
