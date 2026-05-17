# GCP + Cloud Run Setup Guide

This guide walks you through setting up GCP, creating the required secrets, and deploying the API to Cloud Run with Cloud SQL.

---

## Step 1: Create GCP Project

```bash
# Install gcloud CLI first: https://cloud.google.com/sdk/docs/install

gcloud projects create resume-analyzer-api --name="Resume Analyzer API"
gcloud config set project resume-analyzer-api
```

## Step 2: Link Your $300 Credit

```bash
# List your billing accounts
gcloud billing accounts list

# Link billing to project (replace YOUR_BILLING_ACCOUNT_ID)
gcloud billing projects link resume-analyzer-api --billing-account=YOUR_BILLING_ACCOUNT_ID
```

## Step 3: Enable Required APIs

```bash
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

## Step 4: Create Artifact Registry Repository

```bash
gcloud artifacts repositories create resume-analyzer \
  --repository-format=docker \
  --location=us-central1 \
  --description="Resume Analyzer API images"
```

## Step 5: Create Cloud SQL Instance

```bash
# Create instance (this takes a few minutes)
gcloud sql instances create resume-analyzer-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-size=10GB \
  --root-password=YOUR_STRONG_ROOT_PASSWORD

# Create database
gcloud sql databases create resume_analyzer --instance=resume-analyzer-db

# Create application user
gcloud sql users create api_user \
  --instance=resume-analyzer-db \
  --password=YOUR_STRONG_API_PASSWORD

# Get connection name (save this!)
gcloud sql instances describe resume-analyzer-db --format='value(connectionName)'
# Example output: resume-analyzer-api:us-central1:resume-analyzer-db
```

## Step 6: Create Service Accounts

### 6a. Cloud Run Service Account
```bash
# Create service account for the running app
gcloud iam service-accounts create cloudrun-api \
  --display-name="Cloud Run API Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding resume-analyzer-api \
  --member="serviceAccount:cloudrun-api@resume-analyzer-api.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding resume-analyzer-api \
  --member="serviceAccount:cloudrun-api@resume-analyzer-api.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

### 6b. GitHub Actions Service Account
```bash
# Create service account for CI/CD
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer"

# Grant permissions
gcloud projects add-iam-policy-binding resume-analyzer-api \
  --member="serviceAccount:github-actions@resume-analyzer-api.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding resume-analyzer-api \
  --member="serviceAccount:github-actions@resume-analyzer-api.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding resume-analyzer-api \
  --member="serviceAccount:github-actions@resume-analyzer-api.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.builder"

# Grant permission to act as Cloud Run service account
gcloud iam service-accounts add-iam-policy-binding \
  cloudrun-api@resume-analyzer-api.iam.gserviceaccount.com \
  --member="serviceAccount:github-actions@resume-analyzer-api.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### 6c. Create and Download Service Account Key
```bash
# Create JSON key for GitHub Actions
gcloud iam service-accounts keys create ~/github-actions-key.json \
  --iam-account=github-actions@resume-analyzer-api.iam.gserviceaccount.com

# View the key (you'll copy this into GitHub Secrets)
cat ~/github-actions-key.json
```

## Step 7: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `GCP_PROJECT_ID` | `resume-analyzer-api` |
| `GCP_SA_KEY` | Paste the **entire contents** of `~/github-actions-key.json` |
| `APP_ORIGIN` | Your web app URL (e.g., `https://your-app.vercel.app` or `http://localhost:3000` for now) |
| `CLOUD_SQL_DATABASE_URL` | `postgresql://api_user:YOUR_API_PASSWORD@/resume_analyzer?host=/cloudsql/resume-analyzer-api:us-central1:resume-analyzer-db` |
| `CLOUD_SQL_CONNECTION_NAME` | `resume-analyzer-api:us-central1:resume-analyzer-db` |
| `GCP_LOCATION` | `us-central1` |
| `AI_EXTRACTION_MODEL` | `gemini-2.5-flash` |

## Step 8: Deploy!

Push any commit to `main` branch, or go to GitHub Actions tab and manually trigger the "Deploy API to Cloud Run" workflow.

```bash
git add .
git commit -m "Setup Cloud Run deployment"
git push origin main
```

## Step 9: Verify Deployment

```bash
# Get the deployed service URL
gcloud run services describe resume-analyzer-api --region=us-central1 --format='value(status.url)'

# Test the API
curl https://YOUR_SERVICE_URL/api/analysis
```

---

## Local Development with Vertex AI

For local development, authenticate with GCP:

```bash
# This sets up Application Default Credentials (ADC)
gcloud auth application-default login

# Add to apps/api/.env
GCP_PROJECT_ID=resume-analyzer-api
GCP_LOCATION=us-central1
AI_EXTRACTION_MODEL=gemini-2.5-flash
```

Then run:
```bash
corepack pnpm dev:api
```

---

## Cost Summary

| Service | Monthly Cost |
|---------|-------------|
| Cloud Run | $0 (free tier) |
| Vertex AI | ~$0.50 (per 1,000 analyses) |
| Cloud SQL (db-f1-micro) | ~$7–$10 |
| **Total** | **~$8–$11/month** |

Your **$300 credit** will last **2–3 years** at this scale.
