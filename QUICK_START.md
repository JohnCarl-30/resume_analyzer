# Resume Analyzer - Quick Start Guide

## 30 Second Setup

```bash
cd apps/web
pnpm install
cp .env.example .env.local
# Edit .env.local to set NEXT_PUBLIC_API_BASE_URL
pnpm dev
```

Visit `http://localhost:3000` ✨

---

## Project Overview

| What | Where |
|------|-------|
| **Dashboard** | `/` (lists analyses, shows metrics) |
| **Wizard** | `/analysis/new` (5-step upload flow) |
| **Workspace** | `/analysis/:id` (edit resume, tailor job) |

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/api-client.ts` | API with timeout/retry/error handling |
| `features/dashboard/` | Dashboard view + hooks |
| `features/onboarding/` | Wizard (5-step components) |
| `features/editor/` | Workspace (editors + renderer) |
| `features/templates/` | Resume template system |

---

## API Contract (Endpoints Needed)

```
GET  /api/analysis                    # List all
GET  /api/analysis/:id                # Get one
POST /api/analysis/upload             # Create (multipart form)
PATCH /api/analysis/:id               # Re-analyze (JSON)
GET  /api/analysis/:id/source         # Download original file
```

**Response Type**: `ResumeAnalysisResult` with score, keywords, suggestions

---

## Common Tasks

### Add a New Resume Section to Editor

1. Create editor component in `features/editor/components/editors/`
2. Add to workspace sections array
3. Add to resume form model

Example:
```tsx
// features/editor/components/editors/certifications-editor.tsx
export function CertificationsEditor({ ... }) { ... }

// Then add to analysis-workspace.tsx workspaceSections
{ id: "certifications", label: "Certifications", icon: "badge", expanded: false }
```

### Modify Dashboard Stats

File: `features/resumes/view-models/use-resume-dashboard.ts`

```typescript
// Update the computedStats calculation
const computedStats: DashboardStats = {
  totalResumes: fetchedAnalyses.length,
  averageMatchRate: /* your calculation */,
  optimizedCount: /* your filter */,
}
```

### Change API Error Handling

File: `lib/api-client.ts`

Edit the `ApiClient` class methods to customize timeout, retry, or error parsing.

### Adjust Wizard Validation

Edit individual step files:
- `step-target-role.tsx` - Min length
- `step-job-description.tsx` - Min/max length
- `step-document-upload.tsx` - File types, size
- `step-template-selection.tsx` - Available templates
- `step-suggestions.tsx` - Suggestion display

---

## Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test -- --watch

# Specific file
pnpm test -- analysis-workspace
```

Test files are co-located with components: `__tests__/` folders

---

## Debugging

### Check API Calls
```typescript
// In api-client.ts, uncomment DEBUG logging
// const DEBUG = true; // at top of file
```

### View Component State
```tsx
// Add console.log in your component
export function MyComponent() {
  const data = useMyHook();
  console.log("[v0] Data:", data); // Will show in DevTools
  return ...
}
```

### Type Errors
```bash
pnpm typecheck  # Full type check
```

---

## Environment Variables

### Required
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### Optional (future)
```
NEXT_PUBLIC_ANALYTICS_ID=
NEXT_PUBLIC_SENTRY_DSN=
```

All `NEXT_PUBLIC_*` variables are visible in the browser.

---

## Build & Deploy

### Local Build
```bash
pnpm build:web
pnpm start:web  # Starts on :3000
```

### Vercel
Push to GitHub → Vercel auto-deploys with env vars

### Docker
```bash
docker build -t resume-analyzer .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=... resume-analyzer
```

---

## Folder Structure Quick Reference

```
apps/web/
├── app/
│   ├── page.tsx                 ← Dashboard route
│   ├── analysis/
│   │   ├── new/page.tsx        ← Wizard route
│   │   └── [analysisId]/       ← Workspace route
│   └── layout.tsx              ← Root layout
├── features/
│   ├── dashboard/
│   │   ├── views/dashboard-view.tsx
│   │   └── view-models/use-resume-dashboard.ts
│   ├── onboarding/
│   │   ├── views/deep-focus-wizard.tsx
│   │   ├── components/step-*.tsx
│   │   └── utils/analysis-api.ts
│   ├── editor/
│   │   ├── views/analysis-workspace.tsx
│   │   ├── components/editors/*-editor.tsx
│   │   ├── components/resume-renderer.tsx
│   │   └── model/resume-form.ts
│   └── templates/
│       ├── components/template-card.tsx
│       └── model/template.ts
├── lib/
│   ├── api-client.ts           ← Core API utilities ⭐
│   ├── api-instance.ts
│   ├── api.ts
│   └── types.ts
└── globals.css                 ← Design tokens
```

---

## Performance Tips

1. **Don't** fetch in useEffect (pass data from parent RSC)
2. **Do** use `useMemo` for expensive computations
3. **Lazy load** heavy components: `dynamic(() => import(...))`
4. **Use** React DevTools Profiler to find bottlenecks

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 404 on API call | Wrong `NEXT_PUBLIC_API_BASE_URL` | Check `.env.local` |
| Type error in component | Missing interface | Check `lib/types.ts` or component props |
| File upload fails | Backend rejects file | Check MIME type and file size |
| Modal doesn't close | Focus trap issue | Check modal component wrapper |
| Build fails | Missing dependency | Run `pnpm install` |

---

## Feature Checklist

Dashboard:
- [ ] Loads analyses from API
- [ ] Shows computed stats
- [ ] Handles errors gracefully

Wizard:
- [ ] All 5 steps complete
- [ ] Validation works
- [ ] File upload accepts PDF/DOCX
- [ ] Analysis loads suggestions

Workspace:
- [ ] Can edit all sections
- [ ] Preview renders correctly
- [ ] Tailor modal updates analysis
- [ ] Zoom controls work

---

## Next Steps

1. **Connect Backend**: Set `NEXT_PUBLIC_API_BASE_URL` to your server
2. **Test Happy Path**: Dashboard → Upload → Analyze → Edit → Tailor
3. **Add Auth**: Implement JWT/OAuth (see DEPLOYMENT_GUIDE.md)
4. **Deploy**: Vercel, Docker, or your preferred platform
5. **Monitor**: Set up error tracking and analytics

---

## Need Help?

1. Check `PROJECT_SUMMARY.md` for architecture overview
2. Read `DEPLOYMENT_GUIDE.md` for backend integration
3. Review `API_CLIENT_GUIDE.md` for API client usage
4. Look at test files in `__tests__/` folders for examples
5. Check component props interfaces in source files

**Happy coding!** 🚀
