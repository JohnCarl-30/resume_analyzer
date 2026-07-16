# Resume Analyzer

Resume Analyzer is a full-stack monorepo for AI-powered resume creation and analysis. Upload a resume and job description to get structured feedback, or build a resume from scratch with AI-guided editing, multiple templates, and PDF export.

## Why This Project

- Upload resumes (PDF or DOCX) and get AI-powered analysis against job descriptions
- Create resumes from scratch with a live preview and 4 templates
- AI-enhance experience bullet points with structured suggestions
- Edit resume sections inline with undo/redo support
- Export to PDF via browser print
- Backend supports both Neon PostgreSQL and in-memory storage

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Express, TypeScript, ESM |
| AI | OpenAI via Vercel AI SDK |
| Validation | Zod |
| Database | Neon, Drizzle ORM (optional) |
| Storage | Cloudflare R2 (optional, mocked locally) |
| Workspace | pnpm monorepo |

## Monorepo Structure

```text
apps/
  api/   Express backend
  web/   Next.js frontend
infra/   deployment and infrastructure config
```

## Current Features

- **Resume Analysis**: Upload PDF/DOCX, extract text, and compare against a job description
- **Create Resume**: Build a resume from scratch without a job description
- **Live Preview**: See changes in real-time with 4 templates (Harvard, Modern Sans, Ruby Accent, Minimalist Grid)
- **AI Bullet Enhancement**: Improve experience bullet points with one click
- **Undo/Redo**: Full history support (Ctrl+Z / Ctrl+Y)
- **Auto-save**: Form state persists to localStorage automatically
- **PDF Export**: Print-to-PDF via browser print dialog
- **Inline Editing**: Click any section to edit; inline title renaming

## API Endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/api/analysis` | Run resume-vs-job analysis |
| `POST` | `/api/analysis/upload` | Upload PDF/DOCX, extract, analyze, and save |
| `GET` | `/api/analysis/:id` | Fetch a saved analysis |
| `PATCH` | `/api/analysis/:id` | Update job description and re-analyze |
| `POST` | `/api/enhance/bullets` | AI-enhance experience bullet points |
| `POST` | `/api/uploads/sign` | Create a presigned R2 upload URL |
| `POST` | `/api/resumes` | Save resume metadata |
| `GET` | `/api/resumes` | List resumes |
| `GET` | `/api/resumes/:resumeId` | Get one resume |

## Getting Started

### 1. Install dependencies

```bash
corepack pnpm install
```

### 2. Create environment files

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 3. Fill in optional values

The API starts without any environment variables. To enable features:

#### API environment (`apps/api/.env`)

```env
PORT=4000
APP_ORIGIN=http://localhost:3000

# Optional: enables AI extraction and analysis
OPENAI_API_KEY=sk-...
AI_EXTRACTION_MODEL=gpt-4o-mini

# Optional: enables database persistence
DATABASE_URL=postgres://user:password@host/database?sslmode=require

# Optional: enables real R2 uploads (otherwise mocked)
R2_BUCKET_NAME=resume-analyzer
R2_PUBLIC_BASE_URL=https://your-bucket.r2.dev
```

#### Web environment (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 4. Start development servers

Run both apps:

```bash
corepack pnpm dev
```

Or run them separately:

```bash
corepack pnpm dev:api
corepack pnpm dev:web
```

### 5. Try the API

Upload and analyze a resume:

```bash
curl -X POST http://localhost:4000/api/analysis/upload \
  -F "targetRole=Senior Backend Engineer" \
  -F "selectedTemplateId=minimalist-grid" \
  -F "jobDescription=We are hiring a Senior Backend Engineer with strong Node.js, Express, PostgreSQL, Docker, AWS, CI/CD, and leadership experience." \
  -F "resume=@./resume.pdf;type=application/pdf"
```

Enhance bullet points:

```bash
curl -X POST http://localhost:4000/api/enhance/bullets \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Backend Engineer",
    "bullets": ["Built APIs with Node.js"]
  }'
```

## Available Scripts

| Command | Description |
| --- | --- |
| `corepack pnpm dev` | Run frontend and backend together |
| `corepack pnpm dev:api` | Run only the API |
| `corepack pnpm dev:web` | Run only the frontend |
| `corepack pnpm typecheck` | Run TypeScript checks across the workspace |
| `corepack pnpm build:api` | Build the API to `dist/` |
| `corepack pnpm build:web` | Build the Next.js frontend |

> **Note:** `test` and `db:migrate` scripts do not exist yet. Use `corepack pnpm exec tsx src/tests/<script>.ts` to run manual API sanity checks.

## Development Notes

- The API is strictly ESM (`"type": "module"`). Always use `.js` extensions in imports, even for TypeScript files.
- The API uses Zod for environment validation but starts gracefully with defaults (`PORT=4000`, `APP_ORIGIN=http://localhost:3000`).
- Without `DATABASE_URL`, the API falls back to in-memory storage. Analysis persistence only lasts while the process is running.
- Without `OPENAI_API_KEY`, AI extraction and analysis fall back to parser-only mode.
- Uploaded files go directly from the browser to R2 after the API signs the upload request. Without R2 credentials, a mocked public URL is returned.
- The frontend uses an MVVM-style feature structure: `views/` for UI, `view-models/` for state, and `model/` for types.

## Backend Walkthrough

The Express backend in `apps/api` is split into small layers:

- `src/server.ts`: starts the HTTP server with graceful shutdown
- `src/app.ts`: creates the Express app, middleware, and top-level routes
- `src/routes/*.routes.ts`: maps URLs and HTTP verbs
- `src/controllers/*.controller.ts`: reads the request and shapes the HTTP response
- `src/services/*.service.ts`: holds business logic
- `src/schemas/*.schema.ts`: validates input with Zod

## Troubleshooting

| Problem | What to check |
| --- | --- |
| API fails with `ZodError` on startup | Confirm `apps/api/.env` values match the Zod schema |
| Frontend cannot connect to API | Confirm `apps/web/.env.local` points to the API base URL |
| AI extraction returns empty profile | Confirm `OPENAI_API_KEY` is set in `apps/api/.env` |
| Upload request fails | Confirm R2 credentials and bucket name if using real R2 |
| Type errors in `apps/web` tests | Tests are excluded from `tsc`; run `npx vitest` from `apps/web/` instead |

## Deployment

- See [`docs/DEPLOY.md`](docs/DEPLOY.md) for Vercel (web) + Cloudflare (API/R2) + Supabase setup.

## Roadmap Ideas

- Authentication and user accounts
- OCR and image-based text extraction
- Embeddings and semantic job matching
- Collaborative editing
- More resume templates

## Repository Goal

This repository is a practical full-stack foundation for AI-powered resume creation and analysis.
