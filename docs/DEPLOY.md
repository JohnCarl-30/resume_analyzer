# Deploy Deep Focus (Path C)

Vercel (web) + Cloudflare Containers (API) + Cloudflare R2 (storage) + Supabase (auth/DB) + OpenAI (AI).

## Prerequisites

- [Supabase](https://supabase.com) project
- [OpenAI API key](https://platform.openai.com/api-keys)
- [Cloudflare](https://dash.cloudflare.com) account with R2 and Workers/Containers enabled
- [Vercel](https://vercel.com) account
- Docker running locally (for `wrangler deploy`)

## 1. Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. **Authentication → URL configuration**: add redirect URL `https://YOUR-VERCEL-DOMAIN/auth/callback` (and `http://localhost:3000/auth/callback` for local dev).
3. Copy **Project URL** and **anon key** (for web) and **service role** if needed.
4. Copy the **Postgres connection string** (Settings → Database → Connection string, URI mode) → `DATABASE_URL`.

### Push database schema

From the repo root, with `DATABASE_URL` set:

```bash
cd apps/api
corepack pnpm exec drizzle-kit push
```

There are no migration files in the repo yet; `drizzle-kit push` applies the schema in `apps/api/src/db/schema.ts` directly.

## 2. Cloudflare R2

1. Create an R2 bucket (e.g. `resume-analyzer`).
2. Create an R2 API token with Object Read & Write.
3. Apply CORS so the browser can `PUT` uploads from your Vercel origin. Edit [`infra/r2/cors.json`](../infra/r2/cors.json) to include your production domain, then:

```bash
wrangler r2 bucket cors set resume-analyzer --file infra/r2/cors.json
```

4. Optional: enable public access or a custom domain → set `R2_PUBLIC_BASE_URL`.

## 3. Deploy API (Cloudflare Containers)

The Express API runs in a Docker container behind a Cloudflare Worker proxy.

```bash
cd cloudflare-api
corepack pnpm install
corepack pnpm deploy
```

Requires Docker. First deploy takes several minutes (image build + push). The Worker URL will look like `https://resume-analyzer-api.<subdomain>.workers.dev`.

### API secrets (Cloudflare dashboard or `wrangler secret put`)

| Variable | Value |
|----------|-------|
| `PORT` | `8080` |
| `APP_ORIGIN` | `https://YOUR-VERCEL-DOMAIN.vercel.app` |
| `SUPABASE_URL` | Supabase project URL |
| `DATABASE_URL` | Supabase Postgres connection string |
| `OPENAI_API_KEY` | OpenAI secret key |
| `AI_EXTRACTION_MODEL` | `gpt-4o-mini` (default) |
| `R2_BUCKET_NAME` | Your bucket name |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 token access key |
| `R2_SECRET_ACCESS_KEY` | R2 token secret |
| `R2_PUBLIC_BASE_URL` | Optional public URL prefix |

Set secrets from repo root:

```bash
wrangler secret put OPENAI_API_KEY --config cloudflare-api/wrangler.jsonc
# repeat for each secret above
```

Container env vars can also be set via the Cloudflare dashboard under Workers & Pages → your worker → Settings → Variables.

## 4. Deploy Web (Vercel)

1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Add environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | Cloudflare Worker URL from step 3 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

4. Deploy. Update `APP_ORIGIN` on the API to match the final Vercel URL if it differs from what you set earlier.

## 5. Smoke test

1. Open the Vercel URL → sign up / sign in via Supabase.
2. Run an analysis with pasted resume text.
3. Test file upload (requires R2 credentials on the API).
4. Confirm CORS: browser requests from Vercel origin should succeed against the Worker URL.

## Architecture

```
User → Vercel (Next.js) → CF Worker → CF Container (Express API)
                              ↓
                    Supabase / Postgres / OpenAI / R2
```

## Local development

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
corepack pnpm dev
```

Without `DATABASE_URL`, the API uses in-memory storage. Without `OPENAI_API_KEY`, extraction falls back to parser-only mode. Without R2 credentials, upload signing returns a mock URL (`example-upload.invalid`).

## Alternative: Railway API (no R2)

If you prefer a always-warm API without Cloudflare Containers cold starts, deploy the same Docker image from GHCR (built by CI on push to `main`) to Railway or Render. Set the same API env vars and point `NEXT_PUBLIC_API_BASE_URL` at the Railway URL.

## Cost (hobby)

- Vercel + Supabase: free tiers
- Cloudflare Workers/Containers + R2: low pay-per-use
- OpenAI: pay-per-use (`gpt-4o-mini` is inexpensive for extraction)
