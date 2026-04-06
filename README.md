# Resume Analyzer

Resume Analyzer is a full-stack monorepo for uploading resumes, storing files in Cloudflare R2, and managing resume metadata through an Express API backed by Neon and Drizzle.

It is designed as a strong starter for building a larger AI-powered resume analysis platform.

## Why This Project

- Upload resumes directly from the browser to Cloudflare R2
- Register and list uploaded resumes through a typed Express API
- Validate configuration safely with Zod
- Keep the frontend organized with an MVVM-style feature structure
- Provide a clean foundation for future OCR, parsing, embeddings, and analysis workflows

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript |
| Backend | Express, TypeScript |
| Validation | Zod |
| Database | Neon, Drizzle ORM |
| Storage | Cloudflare R2 |
| Workspace | pnpm monorepo |

## Monorepo Structure

```text
apps/
  api/   Express backend
  web/   Next.js frontend
infra/   deployment and infrastructure config
```

## Architecture Overview

### Frontend

The frontend lives in `apps/web` and uses an MVVM-style structure for the resume feature.

| Layer | Path | Responsibility |
| --- | --- | --- |
| View | `apps/web/features/resumes/views` | UI rendering and presentation |
| ViewModel | `apps/web/features/resumes/view-models` | State, async actions, and event handling |
| Model | `apps/web/features/resumes/model.ts` | Shared frontend types |

### Backend

The backend lives in `apps/api` and is responsible for:

- validating environment configuration
- generating presigned upload URLs for R2
- creating resume records in the database
- listing and fetching uploaded resumes

## Current Features

- Resume upload flow from browser to R2
- Resume metadata registration through API
- Resume listing in the frontend
- Zod-based environment validation
- Separate web and API apps inside one workspace

## API Endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/api/analysis` | Run a starter resume-vs-job analysis |
| `POST` | `/api/analysis/upload` | Upload a PDF or DOCX resume, extract text, and analyze it |
| `POST` | `/api/uploads/sign` | Create a presigned upload URL |
| `POST` | `/api/resumes` | Save uploaded resume metadata |
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

### 3. Fill in the required values

#### API environment

```env
PORT=4000
APP_ORIGIN=http://localhost:3000
OPENAI_API_KEY=
OPENAI_EXTRACTION_MODEL=gpt-5.4-mini
DATABASE_URL=postgres://user:password@host/database?sslmode=require
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_BUCKET_NAME=resume-analyzer
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_PUBLIC_BASE_URL=
```

#### Web environment

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

### 5. Try the Express backend

Once `corepack pnpm dev:api` is running, you can hit the JSON analysis endpoint:

```bash
curl -X POST http://localhost:4000/api/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "targetRole": "Senior Backend Engineer",
    "jobDescription": "We are hiring a Senior Backend Engineer with strong Node.js, Express, PostgreSQL, Docker, AWS, CI/CD, and leadership experience.",
    "resumeText": "Backend engineer with Node.js, Express, PostgreSQL, Docker, and AWS experience. Led API work and improved deployment times by 35%."
  }'
```

It returns a starter analysis payload with:

- a heuristic match score
- matched keywords
- missing keywords
- practical writing suggestions

You can also upload an actual resume file for parsing:

```bash
curl -X POST http://localhost:4000/api/analysis/upload \
  -F "targetRole=Senior Backend Engineer" \
  -F "selectedTemplateId=minimalist-grid" \
  -F "jobDescription=We are hiring a Senior Backend Engineer with strong Node.js, Express, PostgreSQL, Docker, AWS, CI/CD, and leadership experience." \
  -F "resume=@./resume.docx;type=application/vnd.openxmlformats-officedocument.wordprocessingml.document"
```

This route:

- accepts `multipart/form-data`
- parses PDF and DOCX resumes on the backend
- extracts text before running the same analysis logic
- optionally enriches the parsed text with OpenAI structured extraction when `OPENAI_API_KEY` is set
- saves the parsed text and analysis result to Postgres when `DATABASE_URL` is configured
- returns an analysis `id` that the web app uses to restore the workspace after refresh

You can reload a saved analysis directly:

```bash
curl http://localhost:4000/api/analysis/<analysis-id>
```

Without `DATABASE_URL`, the API falls back to in-memory storage, so refresh persistence only lasts while the API process is still running.

## Available Scripts

| Command | Description |
| --- | --- |
| `corepack pnpm dev` | Run frontend and backend together |
| `corepack pnpm dev:api` | Run only the API |
| `corepack pnpm dev:web` | Run only the frontend |
| `corepack pnpm typecheck` | Run TypeScript checks across the workspace |
| `corepack pnpm test` | Run backend tests |
| `corepack pnpm build` | Build backend and frontend |
| `corepack pnpm db:generate` | Generate Drizzle migrations |
| `corepack pnpm db:migrate` | Apply database migrations |

## Development Notes

- The API uses Zod to fail fast when required environment variables are missing.
- The frontend expects `NEXT_PUBLIC_API_BASE_URL` to point to the running API.
- Uploaded files go directly from the browser to R2 after the API signs the upload request.
- The analysis endpoint is intentionally heuristic-first so you can wire the frontend now and swap in OpenAI or a queue worker later without changing the route shape.
- The upload analysis route parses PDF text with `unpdf` and DOCX text with `mammoth` before scoring.

## Backend Walkthrough

The Express backend in `apps/api` is split into small layers so each file has one job:

- `src/server.ts`: starts the HTTP server
- `src/app.ts`: creates the Express app, middleware, and top-level routes
- `src/routes/*.routes.ts`: maps URLs and HTTP verbs
- `src/controllers/*.controller.ts`: reads the request and shapes the HTTP response
- `src/services/*.service.ts`: holds business logic
- `src/schemas/*.schema.ts`: validates input with Zod

Why Express here:

- it is simple to read if you are still learning backend flow
- it adds very little framework magic, so request flow is easier to trace
- it fits well for a small monorepo where the frontend and API evolve together
- it is easy to replace internals later, like moving from in-memory logic to a database or queue

## Troubleshooting

| Problem | What to check |
| --- | --- |
| API fails with `ZodError` on startup | Confirm `apps/api/.env` exists and all required variables are filled in |
| Frontend cannot load resumes | Confirm `apps/web/.env.local` points to the API base URL |
| Upload request fails | Confirm R2 credentials, bucket name, and API env values |

## Deployment

- The frontend is intended for Vercel deployment.
- The backend is built and deployed through GitHub Actions.
- Production infrastructure includes Caddy and Docker-based backend deployment.

## Roadmap Ideas

- authentication and user accounts
- OCR and text extraction
- resume parsing pipeline
- embeddings and semantic search
- AI-driven resume feedback and scoring

## Repository Goal

This repository is a practical full-stack foundation for turning a simple upload flow into a complete resume analysis platform.
