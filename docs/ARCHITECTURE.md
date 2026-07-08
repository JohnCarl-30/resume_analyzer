# Architecture

This repo is a small pnpm monorepo with two apps:

- `apps/web`: Next.js UI for resume creation, analysis onboarding, dashboards, templates, and editor flows.
- `apps/api`: Express API for uploads, parsing, analysis, AI-backed enhancement, and persistence.

## Web App

The web app is organized by feature. Keep new code inside the feature that owns the user flow.

```text
apps/web/features/
  editor/
    model/          Resume form and analysis types.
    view-models/    UI state and pure view-state helpers.
    components/     Reusable editor pieces.
    views/          Route-sized screens that compose components and state.
  onboarding/
    components/     Step UI for the analysis wizard.
    utils/          API adapters and wizard helpers.
    views/          Wizard orchestration.
  resumes/
    view-models/    Dashboard data loading.
    views/          Dashboard page UI.
  templates/
    model/          Template metadata.
    components/     Template cards and previews.
```

### Frontend Boundaries

- `model/` files should stay framework-light: types, constants, and data transforms.
- `view-models/` should own state hooks or pure UI-state helpers.
- `components/` should render focused pieces that can be understood without route context.
- `views/` should compose the flow, wire callbacks, and coordinate route-level state.

When a view grows because it contains a complete sub-surface, extract that sub-surface into `components/<surface>/` and move pure calculations into `view-models/`.

### UI Copy And Layout Rules

The product should feel usable by someone who has never heard the engineering terms behind resume screening. Prefer plain labels in visible UI: "resume check" over "analysis", "resume scanner" over "ATS", "resume style" over "template", "job words" over "keywords", and "Add suggestion" over "Apply draft".

Keep each screen focused on one primary action. Results screens should show the top fixes first, explain that suggestions are editable, and avoid repeating the same advice in multiple panels. Mobile editor screens should use `Editor` / `Preview` tabs and avoid side panels or horizontal overflow.

## API App

The API follows a request pipeline:

```text
routes -> controllers -> services -> analyzers/repositories/storage
```

- `routes/`: Express route registration only.
- `controllers/`: Request/response shape and validation handoff.
- `services/`: Application workflow and orchestration.
- `analyzers/`: Pure resume/job analysis logic.
- `repositories/`: In-memory or Postgres persistence behind the same interface.
- `storage/`: Upload/object storage implementations.
- `schemas/`: Zod request schemas.
- `types/`: Shared API-domain types.

Optional dependencies stay conditional: the API should run locally without database, Vertex AI, R2, or OpenAI credentials.

### Cache Policy

Resume API responses are private by default. Routes under `/api` can include resume text, job descriptions, source files, generated suggestions, and editor data, so they use `privateApiCacheHeaders` to send `private, no-store` cache headers plus `Vercel-CDN-Cache-Control: no-store`.

Do not add Vercel Runtime Cache to resume, analysis, upload, enhancement, or source-file responses unless authentication and per-user cache boundaries exist. Runtime Cache is appropriate only for future public or static data such as public template metadata, ATS rule copy, or app configuration, and it should use explicit tags and TTLs.

## Current Editor Split

`AnalysisWorkspace` is the main editor route surface. It should stay focused on wiring editor state and layout. Extracted pieces now live here:

- `features/editor/components/workspace/create-resume-guide.tsx`: create-mode checklist, reset confirmation, print, and backup controls.
- `features/editor/components/workspace/suggestion-sidebar.tsx`: analysis suggestions sidebar.
- `features/editor/view-models/create-resume-guide.ts`: pure checklist completion and warning logic.

Future editor cleanup should continue this pattern by extracting the project modal, tailor modal, preview toolbar, and section rail into focused workspace components.

## Verification

Use the repo scripts described in `AGENTS.md`:

```bash
corepack pnpm typecheck
corepack pnpm run build:web
corepack pnpm run build:api
```

For web tests, run `npx vitest run` from `apps/web`.
