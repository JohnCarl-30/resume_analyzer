# Resume Analyzer - Deployment Guide

## Overview

This is a production-ready Resume Analyzer frontend built with Next.js, TypeScript, and Tailwind CSS. It provides a complete user experience for resume analysis: Dashboard → New Analysis Wizard → Analysis Workspace.

## Architecture

### Page Structure
- `/` - Dashboard with recent analyses and metrics
- `/analysis/new` - 5-step onboarding wizard
- `/analysis/:analysisId` - Analysis workspace with editable resume sections
- `/analyses` - All analyses view

### Feature Structure
```
apps/web/
├── app/                          # App Router pages
├── features/
│   ├── dashboard/               # Dashboard view and utilities
│   ├── onboarding/              # 5-step wizard components
│   ├── editor/                  # Analysis workspace and editors
│   ├── job-match/               # Job matching and scoring
│   ├── templates/               # Resume template system
│   └── resumes/                 # Resume list and models
├── lib/                         # Core utilities
│   ├── api-client.ts           # API client with retry/timeout
│   ├── api-instance.ts         # API client singleton
│   ├── api.ts                  # Base URL builder
│   └── types.ts                # Shared types
└── components/                  # Shared UI components
```

## API Integration

### Environment Setup

The frontend connects to a backend API via environment variables:

```bash
# .env.local or in your deployment platform
NEXT_PUBLIC_API_BASE_URL=http://your-api-base-url
```

**Default**: `http://localhost:4000` (see `.env.example`)

### API Endpoints Required

The backend must implement these endpoints:

#### 1. Health Check
```
GET /health
```
Optional - used to verify API connectivity

#### 2. List Analyses
```
GET /api/analysis
Response: ResumeAnalysisResult[]
```
Returns all analyses for the current user.

#### 3. Get Single Analysis
```
GET /api/analysis/:analysisId
Response: ResumeAnalysisResult
```
Returns detailed analysis including extracted profile and job match data.

#### 4. Create Analysis
```
POST /api/analysis/upload
Content-Type: multipart/form-data

Fields:
- targetRole: string (min 2 chars)
- jobDescription: string (min 30 chars, max 10000 chars)
- selectedTemplateId: string (one of: "minimalist-grid", "classic-format", "modern-blue")
- resume: File (PDF or DOCX, max 10MB)

Response: ResumeAnalysisResult
```
Uploads a resume and generates analysis.

#### 5. Update Analysis
```
PATCH /api/analysis/:analysisId
Content-Type: application/json

Body:
{
  "jobDescription": string (min 30 chars),
  "targetRole"?: string (optional)
}

Response: ResumeAnalysisResult
```
Re-analyzes the existing resume with a new job description.

#### 6. Get Source Document
```
GET /api/analysis/:analysisId/source
Response: Binary (PDF or DOCX file)
```
Returns the original uploaded resume file.

### Data Models

#### ResumeAnalysisResult
```typescript
interface ResumeAnalysisResult {
  id: string;
  targetRole: string;
  jobDescription: string;
  score: number; // 0-100
  sourceFileName: string;
  createdAt: string; // ISO date
  generatedAt?: string;
  extractedProfile?: ExtractedProfile;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  suggestions?: Suggestion[];
  resumeText?: string;
  templateId: string;
}

interface ExtractedProfile {
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  personalInfo?: Record<string, string>;
  education?: Education[];
  experience?: Experience[];
  skills?: string[];
  // ... other sections
}

interface Suggestion {
  id: string;
  category: string; // "critical", "important", "nice-to-have"
  title: string;
  description: string;
  impact: number; // 0-100
}
```

## API Client Features

### Timeout & Retry

The frontend includes a robust API client (`lib/api-client.ts`) with:

- **Timeout**: 30 seconds (AbortController-based)
- **Retry**: Automatic 3 attempts for GET requests
- **Backoff**: Exponential backoff (100ms, 500ms, 2500ms)
- **Scope**: Only retries on network errors and 5xx responses

### Error Handling

The API client normalizes errors with structured error objects:

```typescript
interface ApiError extends Error {
  status?: number;
  message: string;
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
}
```

Form validation errors are parsed and made available for field-level feedback in the UI.

## Running Locally

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)

### Setup
```bash
cd apps/web

# Install dependencies
pnpm install

# Create .env.local
cp .env.example .env.local

# Edit .env.local to point to your backend
# NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Start dev server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Development Commands
```bash
# Type checking
pnpm typecheck

# Build
pnpm build:web

# Build (with optimizations)
pnpm build

# Run tests
pnpm test

# Format code
pnpm format
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variable: `NEXT_PUBLIC_API_BASE_URL`
3. Deploy with one-click or automatic deployments on push

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app

COPY pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build:web

EXPOSE 3000
CMD ["pnpm", "start:web"]
```

### Environment Variables

Set these in your deployment platform:

```
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

This is a public variable (visible to browser), so it's safe to be on the frontend.

## Features Implemented

### Dashboard
- ✅ Hero section with "New Analysis" CTA
- ✅ Computed metrics (Total Resumes, Avg. Match Rate, Optimized count)
- ✅ Recent analyses list with cards
- ✅ Loading, empty, and error states
- ✅ Responsive grid layout

### Wizard (5 Steps)
- ✅ Step 1: Target role (min 2 chars)
- ✅ Step 2: Job description (min 30 chars, max 10,000 with character counter)
- ✅ Step 3: Resume upload (PDF/DOCX support, 10MB max, drag & drop)
- ✅ Step 4: Template selection (visual variants)
- ✅ Step 5: Suggestions summary (score, keywords, missing keywords)
- ✅ Back/next navigation with step progress
- ✅ Form state preservation across steps
- ✅ Error handling with user guidance

### Analysis Workspace
- ✅ Editable resume sections:
  - Personal Info
  - Education
  - Work Experience
  - Leadership
  - Awards & Honors
  - Add optional sections (projects, skills, etc.)
- ✅ Preview modes:
  - Original source document (PDF/DOCX)
  - Structured AI template preview
  - Parsed text fallback
- ✅ Zoom controls (scale resume preview)
- ✅ Template switcher
- ✅ Tailor to Job modal:
  - Job description editor
  - Character count display
  - Validation feedback
  - Loading state during PATCH
  - Error recovery with retry button
  - Cancel option
- ✅ Optimistic UI updates on tailor

### UX Quality
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Keyboard navigation throughout
- ✅ ARIA labels on icon-only buttons
- ✅ Semantic HTML landmarks
- ✅ Loading skeletons and spinners
- ✅ Error messages with recovery paths
- ✅ Empty states with helpful guidance
- ✅ Color system with design tokens (CSS variables)

## Security Notes

### TODO: Future Auth/Authorization
The current implementation assumes a single user. For production with multiple users:

1. Add authentication layer (JWT, OAuth, etc.)
2. Protect `/api/analysis/:analysisId/source` - verify user owns the analysis
3. Filter `/api/analysis` results by authenticated user
4. Add `Authorization` header to all API requests
5. Validate `analysisId` ownership on workspace load

### Recommendations
- Use secure HTTP-only cookies for session tokens
- Validate file types server-side (don't trust client accept attribute)
- Implement CORS properly on backend
- Rate limit file uploads
- Scan uploaded files for malware

## Performance Optimization

### Current Optimizations
- ✅ Lazy-loaded preview components
- ✅ Optimistic UI updates for tailor modal
- ✅ Request deduplication (no duplicate API calls)
- ✅ CSS-in-JS via Tailwind (no runtime CSS generation)
- ✅ Image optimization via Next.js Image component

### Potential Future Improvements
- Add React Query/SWR for advanced caching
- Implement file upload chunking for large files
- Add PDF preview streaming
- Implement resume draft auto-save
- Add analytics for user flow tracking

## Testing

The project includes comprehensive tests:

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test -- --watch

# Coverage
pnpm test -- --coverage
```

Tests cover:
- Wizard navigation and validation
- API error handling
- Editor state management
- Dashboard data computation
- File upload validation

## Troubleshooting

### API Connection Issues
1. Check `NEXT_PUBLIC_API_BASE_URL` is set correctly
2. Verify backend is running and responding
3. Check browser console for CORS errors
4. Verify backend returns proper response format

### File Upload Errors
1. Check max file size (10MB)
2. Verify file is PDF or DOCX
3. Check backend file validation
4. Review uploaded file integrity

### Resume Preview Not Showing
1. Verify `/api/analysis/:analysisId/source` endpoint returns binary
2. Check browser console for rendering errors
3. Ensure PDF/DOCX files are valid
4. Check CORS headers for file download

## Support

For issues or questions:
1. Check the API_CLIENT_GUIDE.md for API client usage
2. Review IMPROVEMENTS.md for recent enhancements
3. Check component test files for usage examples
4. Review backend API implementation guidelines

## Next Steps

To make this production-ready:

1. ✅ Connect real backend API (set `NEXT_PUBLIC_API_BASE_URL`)
2. ⭕ Add authentication/authorization (see Security Notes)
3. ⭕ Configure backend response format per Data Models
4. ⭕ Test full workflow (upload → analyze → edit → tailor)
5. ⭕ Monitor API performance and errors
6. ⭕ Set up analytics/logging
7. ⭕ Deploy to production
