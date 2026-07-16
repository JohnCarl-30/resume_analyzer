# Agent Instructions

## Monorepo Basics

- pnpm workspace with `apps/api` (Express) and `apps/web` (Next.js).
- Run everything: `corepack pnpm dev`
- Run separately: `corepack pnpm dev:api` / `corepack pnpm dev:web`
- Verification: `corepack pnpm typecheck` (runs across both apps; there is no lint or formatter).

## Environment Setup

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Fill in `apps/api/.env` if you need to override defaults or configure optional features (database, OpenAI, R2). No variables are strictly required — `PORT` defaults to `4000` and `APP_ORIGIN` defaults to `http://localhost:3000`, so the API will start without an `.env` file.

> **Do not trust the README for env var names.** The README mentions `VERTEX_AI_MODEL` but the actual code reads `AI_EXTRACTION_MODEL`. The real source of truth is `apps/api/src/config/env.ts` — check there for the exact schema, defaults, and required fields. Production deploy steps are in `docs/DEPLOY.md`.

## App-Level Quirks

### API (`apps/api`)

- **ESM only**: `"type": "module"` in package.json. Always use `.js` extensions in imports, even for TypeScript files.
- **Dev server**: `tsx watch src/server.ts`. Production build is `tsc` output to `dist/`.
- **Entrypoint**: `src/server.ts` starts the HTTP server; `src/app.ts` wires middleware and routes.
- **Conditional database**: If `DATABASE_URL` is set, the API uses Neon + Drizzle. If not, it silently falls back to in-memory storage. Analysis persistence only survives the process lifetime without a database. There are no migration files or `db:migrate` scripts yet.
- **Conditional AI**: If `OPENAI_API_KEY` is set, the API uses OpenAI (`gpt-4o-mini` default) for extraction, analysis, and bullet enhancement. Otherwise parser-only mode. Embeddings also use `OPENAI_API_KEY`. When AI is enabled, keyword matching, ATS suggestions, writing/impact feedback, and the overall score are produced by `resumeAnalysisService` via structured LLM output; rule-based analyzers are used as fallback when AI is off or fails.
- **R2 uploads**: When `R2_BUCKET_NAME`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` are all set, `POST /api/uploads/sign` returns real presigned PUT URLs. Without full R2 config, it returns a mock URL (`example-upload.invalid`) for local dev.
- **No automated test runner**: `package.json` has no root `test` script. The API uses Vitest (`corepack pnpm --filter @resume-analyzer/api test`). Manual sanity/regression scripts also live in `src/tests/` and are run directly with `corepack pnpm exec tsx` (e.g., `corepack pnpm exec tsx src/tests/analyzer-sanity.ts`).
- **Dockerfile**: `CMD ["node", "dist/server.js"]` matches `package.json`'s `start` script. `PORT` defaults to `8080` in the container.

### Web (`apps/web`)

- **Next.js 15 + React 19 + Tailwind CSS v4**. Tailwind v4 does not use a `tailwind.config` file; configuration lives in CSS.
- **Path alias**: `@/*` maps to the web app root.
- **Feature structure**: MVVM-style organization inside `features/*/`. Views render UI, view-models hold state and async logic, models define shared types.
- **Tests**: Vitest with jsdom and `@testing-library/react`. Property-based tests use `fast-check`. Setup file is `vitest.setup.ts`. There is no `test` script in `package.json`; run tests with `npx vitest` from inside `apps/web/`.
- **CI note**: The CI workflow (`pnpm run typecheck`, `pnpm run build:web`, `pnpm run build:api`) does not run tests. Tests are currently local-only.

## Build Order

If you change shared types or frontend models, run `typecheck` first. The API build is plain `tsc`, so type errors will block it immediately.

## What NOT to Guess

- Do not add a `tailwind.config.js` — this repo uses Tailwind v4 CSS-based config.
- Do not assume Postgres is required — the API works fine in-memory for local dev.
- Do not add CommonJS syntax to the API — it is strictly ESM.
- Do not look for eslint or prettier configs — none exist yet.
- Do not run `corepack pnpm test` or `corepack pnpm db:migrate` — these scripts do not exist (the README is stale).
- Do not run `corepack pnpm build` — the root package.json has no `build` script; use `build:api` or `build:web` instead.
- Do not assume the R2 upload endpoint generates real presigned URLs — it returns a mocked URL regardless of configuration.
