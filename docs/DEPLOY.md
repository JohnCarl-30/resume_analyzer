# Deploy Resumae

Vercel (web) + Azure Container Apps (API) + Clerk (auth) + Neon Postgres + OpenAI (AI).

Production as of September 2026:

```text
User → Vercel (Next.js) → Azure Container Apps (NestJS API) → Neon Postgres
```

## Prerequisites

- [Clerk](https://clerk.com) application
- [OpenAI API key](https://platform.openai.com/api-keys)
- [Azure](https://portal.azure.com) subscription with the `az` CLI logged in
- [Vercel](https://vercel.com) account
- [Neon](https://neon.tech) Postgres database
- Docker running locally (the API image is built here and pushed to ACR)

## 1. Clerk

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Enable **Email** and **Password** sign-in.
3. Copy **Publishable key** and **Secret key**.
4. Add allowed origins for your Vercel domain in Clerk → **Domains**.

## 2. Neon Postgres

1. Create a database and copy the **direct (non-pooled)** connection string → `DATABASE_URL`.
   TypeORM keeps its own pool, and DDL through Neon's transaction pooler is unreliable —
   use the host without the `-pooler` segment.
2. Schema changes go through TypeORM migrations (never `synchronize`):

```bash
cd apps/api
corepack pnpm migration:generate src/database/migrations/<Name>
corepack pnpm migration:run
```

The entities currently mirror the live schema exactly, so `migration:generate`
reporting "No changes" is the healthy state.

## 3. API (Azure Container Apps)

Existing resources: resource group `rg-resumae`, registry `acrresumae18839`,
environment `resumae-env`, app `resumae-api` — all in **Malaysia West**
(the student subscription's region policy allows five APAC regions only).

Build, push, roll:

```bash
docker build --platform linux/amd64 -f apps/api/Dockerfile -t resumae-api:vN .
az acr login -n acrresumae18839
docker tag resumae-api:vN acrresumae18839.azurecr.io/resumae-api:vN
docker push acrresumae18839.azurecr.io/resumae-api:vN
az containerapp update -g rg-resumae -n resumae-api \
  --image acrresumae18839.azurecr.io/resumae-api:vN
```

Rollback is re-pointing at the previous tag with the same `update` command.

### API secrets

Secrets live on the container app, referenced by env vars:

```bash
az containerapp secret set -g rg-resumae -n resumae-api --secrets "openai-key=sk-..."
az containerapp update -g rg-resumae -n resumae-api \
  --set-env-vars "OPENAI_API_KEY=secretref:openai-key"
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon direct connection string (secret) |
| `CLERK_SECRET_KEY` | Clerk backend key (secret) |
| `OPENAI_API_KEY` | AI analysis, enhancement, tailoring (secret). Without it every AI feature degrades to its rule-based fallback rather than failing. |
| `APP_ORIGIN` | Comma-separated allowed web origins (CORS + Clerk `azp`) |
| `AI_EXTRACTION_MODEL` | Defaults to `gpt-4o-mini` |
| `PORT` | 8080 |

### Scale

The app runs scale-to-zero (0–2 replicas, 0.5 CPU / 1 Gi). First request after
idle pays a cold start of roughly 15–25 s. To keep one replica warm:

```bash
az containerapp update -g rg-resumae -n resumae-api --min-replicas 1
```

## 4. Web (Vercel)

Set for **Production** (baked at build time — changing a value does nothing
until the next deploy):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | The container app URL, e.g. `https://resumae-api.<env-id>.malaysiawest.azurecontainerapps.io` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From Clerk |
| `CLERK_SECRET_KEY` | From Clerk |
| Clerk URL variables | `/auth/sign-in`, `/auth/sign-up`, fallbacks `/home` |

Deploy with `npx vercel deploy --prod`, then verify the cutover the reliable
way — read the deployed bundle, not the dashboard:

```bash
# The chunk that contains the API client must name the Azure host
curl -s https://resumae.tech/create-resume | grep -ohE 'src="[^"]+\.js"' | ...
```

## 5. Smoke test

1. `/health` → `{"status":"ok"}`
2. `/api/analysis` unauthenticated → 401 with `"Sign in to check your resume."`
3. `OPTIONS /api/analysis` with `Origin: https://resumae.tech` → 204 with the
   origin echoed in `access-control-allow-origin`
4. Sign in on the site and run one real check end to end.

## History

The API previously ran as a Docker container behind a Cloudflare Worker
(`cloudflare-api/`, kept only until that deployment is torn down). The stack
walked Express → Hono → NestJS + TypeORM during August 2026; `main` is the
only backend, and the old Cloudflare deployment should be deleted once
`wrangler` access is restored.
