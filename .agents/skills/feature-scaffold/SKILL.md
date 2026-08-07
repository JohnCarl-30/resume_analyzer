---
name: feature-scaffold
description: Scaffold a new feature with all boilerplate files. Use when the user says "scaffold", "add a feature", "create a new [X]", or describes a feature they want to build.
---

# Feature Scaffolding

Generate all boilerplate for a new feature in one shot, following the existing codebase patterns. The user describes what they want; you produce 7 files and a brief.

## Workflow

Read `workflows/feature-scaffold.md` for the full spec. This skill is the implementation of that workflow.

## What you produce

Given a feature description (e.g., "add a company tracker with status"), generate:

| # | File | Location |
|---|---|---|
| 1 | Route | `apps/api/src/routes/<name>.routes.ts` |
| 2 | Controller | `apps/api/src/controllers/<name>.controller.ts` |
| 3 | Service | `apps/api/src/services/<name>.service.ts` |
| 4 | Schema | `apps/api/src/schemas/<name>.schema.ts` |
| 5 | Frontend page | `apps/web/src/app/<path>/page.tsx` |
| 6 | Feature module | `apps/web/src/features/<name>/` |
| 7 | Route mount | Edit `apps/api/src/app.ts` |

## How to generate

### Step 1: Read existing patterns

Before writing anything, read these files to match the exact code style:

- `apps/api/src/routes/analysis.routes.ts` — route pattern
- `apps/api/src/controllers/analysis.controller.ts` — controller pattern
- `apps/api/src/services/analysis.service.ts` — service pattern
- `apps/api/src/schemas/analysis.schema.ts` — schema pattern
- `apps/web/src/app/analysis/new/page.tsx` — frontend page pattern
- `apps/web/src/features/editor/` — feature module structure (views, view-models, model)
- `apps/api/src/app.ts` — route mounting pattern

### Step 2: Generate backend files

**Route** (`<name>.routes.ts`):
- Express router with GET/POST/PATCH/DELETE as appropriate
- Import controller
- Auth middleware via `requireAuth` when needed (read `apps/api/src/middleware/require-auth.ts`)
- Export default router

**Controller** (`<name>.controller.ts`):
- Read request params/body/query
- Call service methods
- Shape HTTP response
- Use `errorHandler` from `apps/api/src/middleware/error-handler.ts`

**Service** (`<name>.service.ts`):
- Business logic
- In-memory repository when `DATABASE_URL` is unset
- DB repository when `DATABASE_URL` is set
- Follow the pattern from `analysis.service.ts` for conditional DB

**Schema** (`<name>.schema.ts`):
- Zod validation for request bodies
- Export types for TypeScript
- Follow naming: `create<X>Schema`, `update<X>Schema`

### Step 3: Generate frontend files

**Page** (`apps/web/src/app/<path>/page.tsx`):
- Next.js page component
- TanStack Query for data fetching
- Import feature module view

**Feature module** (`apps/web/src/features/<name>/`):
- `views/` — UI components
- `view-models/` — state and async logic (hooks)
- `model/` — shared types

Follow the MVVM structure from `apps/web/src/features/editor/`.

### Step 4: Register route in app.ts

Read `apps/api/src/app.ts` and add the route mount following the existing pattern:
```typescript
app.use("/api/<name>", <name>Routes);
```

### Step 5: Present the brief

After all files are written, present:

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

## Rules

- ESM only: `.js` extensions in all imports
- No comments unless asked
- Zod for all input validation
- Services handle both DB and in-memory paths
- Frontend uses `@/*` alias, Tailwind v4, TanStack Query
- Match the exact code style of existing files
- Write ALL files before presenting anything (push right)
