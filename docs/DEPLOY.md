# Deploy Deep Focus (Path C)

Vercel (web) + Cloudflare Containers (API) + Cloudflare R2 (storage) + Clerk (auth) + Postgres (optional) + OpenAI (AI).

## Prerequisites

- [Clerk](https://clerk.com) application
- [OpenAI API key](https://platform.openai.com/api-keys)
- [Cloudflare](https://dash.cloudflare.com) account with R2 and Workers/Containers enabled
- [Vercel](https://vercel.com) account
- Postgres provider such as [Neon](https://neon.tech) (optional, for persistence)
- Docker running locally (for `wrangler deploy`)

## 1. Clerk

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Enable **Email** and **Password** sign-in.
3. Copy **Publishable key** and **Secret key**.
4. Add allowed origins for your Vercel domain in Clerk → **Domains**.

## 2. Postgres (optional)

1. Create a Postgres database (Neon, Railway, etc.).
2. Copy the connection string → `DATABASE_URL`.
3. Push the schema:

```bash
cd apps/api
corepack pnpm exec drizzle-kit push
```

Without `DATABASE_URL`, the API uses in-memory storage.

## 3. Cloudflare R2

1. Create an R2 bucket (e.g. `resume-analyzer`).
2. Create an R2 API token with Object Read & Write.
3. Apply CORS so the browser can `PUT` uploads from your Vercel origin. Edit [`infra/r2/cors.json`](../infra/r2/cors.json) to include your production domain, then:

```bash
wrangler r2 bucket cors set resume-analyzer --file infra/r2/cors.json
```

4. Optional: enable public access or a custom domain → set `R2_PUBLIC_BASE_URL`.

## 4. Deploy API (Cloudflare Containers)

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
| `CLERK_SECRET_KEY` | Clerk secret key |
| `DATABASE_URL` | Postgres connection string (optional) |
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

## 5. Deploy Web (Vercel)

1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Add environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | Cloudflare Worker URL from step 4 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key (same Clerk app as the publishable key) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/auth/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/auth/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/home` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/home` |

Remove any legacy `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` values — they are deprecated and trigger Clerk console warnings when both old and new vars are set.

4. Deploy. Update `APP_ORIGIN` on the API to match the final Vercel URL if it differs from what you set earlier. The API `CLERK_SECRET_KEY` must be from the **same** Clerk application as the web publishable key, or authenticated API calls return 401.

## 6. Smoke test

1. Open the Vercel URL → sign up / sign in via Clerk.
2. Run an analysis with pasted resume text.
3. Test file upload (requires R2 credentials on the API).
4. Confirm CORS: browser requests from Vercel origin should succeed against the Worker URL.

## Architecture

```
User → Vercel (Next.js) → CF Worker → CF Container (Express API)
                              ↓
                    Clerk / Postgres / OpenAI / R2
```

## Local development

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
corepack pnpm dev
```

Without `DATABASE_URL`, the API uses in-memory storage. Without `OPENAI_API_KEY`, extraction falls back to parser-only mode. Without R2 credentials, upload signing returns a mock URL (`example-upload.invalid`). Without Clerk keys, protected API routes return 503.

## Alternative: Railway API (no R2)

If you prefer a always-warm API without Cloudflare Containers cold starts, deploy the same Docker image from GHCR (built by CI on push to `main`) to Railway or Render. Set the same API env vars and point `NEXT_PUBLIC_API_BASE_URL` at the Railway URL.

## Cost (hobby)

- Vercel + Clerk: free tiers
- Cloudflare Workers/Containers + R2: low pay-per-use
- OpenAI: pay-per-use (`gpt-4o-mini` is inexpensive for extraction)
