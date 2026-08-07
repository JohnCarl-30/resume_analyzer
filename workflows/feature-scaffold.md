# Workflow: Feature Scaffolding

Generate all boilerplate for a new feature in one shot, following existing codebase patterns.

## Trigger

User describes a new feature in natural language (e.g., "add a company tracker with status", "add a notification system").

## Process

1. Parse the feature description to extract: feature name, core entities, relationships
2. Generate 7 files following existing patterns:

| # | File | Based on |
|---|---|---|
| 1 | `apps/api/src/routes/<name>.routes.ts` | `analysis.routes.ts` |
| 2 | `apps/api/src/controllers/<name>.controller.ts` | `analysis.controller.ts` |
| 3 | `apps/api/src/services/<name>.service.ts` | `analysis.service.ts` |
| 4 | `apps/api/src/schemas/<name>.schema.ts` | `analysis.schema.ts` |
| 5 | `apps/web/src/app/<path>/page.tsx` | `analysis/new/page.tsx` |
| 6 | `apps/web/src/features/<name>/` | `features/editor/` |
| 7 | `apps/api/src/app.ts` (edit) | Add route mount |

### File generation rules

- **Route**: Express router with GET/POST/PATCH/DELETE as appropriate. Auth middleware via `requireAuth` when needed.
- **Controller**: Reads request, calls service, shapes HTTP response. Error handling via `errorHandler`.
- **Service**: Business logic. In-memory repository fallback when `DATABASE_URL` is unset.
- **Schema**: Zod validation for request bodies. Export types for TypeScript.
- **Frontend page**: Next.js page component using TanStack Query for data fetching.
- **Feature module**: MVVM structure — `views/`, `view-models/`, `model/` — following `features/editor/` patterns.
- **Route mount**: Register in `app.ts` following the existing pattern (e.g., `app.use("/api/<name>", <name>Routes)`).

### Code conventions

- ESM only: use `.js` extensions in imports
- No comments unless the user asks for them
- Zod schemas for all input validation
- Services handle both DB and in-memory paths
- Frontend uses `@/*` path alias, Tailwind v4, TanStack Query

## Checkpoint

One. After all 7 files are generated, present the user with:

- File tree of what was created
- One-line description of what each file does
- Any assumptions made (entity names, relationships, auth requirements)

User reviews, approves, or asks for edits.

## Push Right

All 7 files are written before the user sees anything. No partial output, no streaming file creation. The user receives a complete, working scaffold.

## Brief

```
Scaffolded: <feature-name>

Created 7 files:
  api/routes/<name>.routes.ts    — endpoints
  api/controllers/<name>.controller.ts — request/response
  api/services/<name>.service.ts — business logic
  api/schemas/<name>.schema.ts   — Zod validation
  web/app/<path>/page.tsx        — Next.js page
  web/features/<name>/           — views + view-models + model
  api/app.ts (edited)            — route mounted at /api/<name>

To test: corepack pnpm dev
```
