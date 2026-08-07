---
name: onboarding-flow
description: Build the new user onboarding flow. Use when the user says "build onboarding", "add user onboarding", or wants to collect user preferences on signup.
---

# Onboarding Flow

Build a 5-question onboarding that collects user preferences and personalizes their experience. This is a code generation workflow — you build the actual feature in the codebase.

## Workflow

Read `workflows/onboarding-flow.md` for the full spec. This skill is the implementation of that workflow.

## What you build

A new user onboarding flow with 5 screens:

| # | Question | Type |
|---|---|---|
| 1 | "What role are you targeting?" | Text input with autocomplete |
| 2 | "What's your experience level?" | Single select (Student/Entry/Mid/Senior) |
| 3 | "Do you have an existing resume?" | Toggle (Yes/No) |
| 4 | "What matters most to you right now?" | Multi-select (1-3 options) |
| 5 | "When are you planning to apply?" | Single select |

After completion: redirect to `/home` with pre-filled context.

## Files to create/modify

### 1. Create onboarding page

Create `apps/web/app/onboarding/page.tsx`:
- Next.js page component
- Uses the onboarding wizard view from the feature module
- Redirects to `/home` if onboarding already completed

### 2. Create onboarding feature module

Create `apps/web/features/user-onboarding/` (separate from existing `features/onboarding/` which is the analysis wizard):

```
features/user-onboarding/
├── views/
│   └── onboarding-wizard.tsx      # Main wizard component
├── components/
│   ├── step-target-role.tsx        # Q1: text input with autocomplete
│   ├── step-experience-level.tsx   # Q2: single select
│   ├── step-existing-resume.tsx    # Q3: toggle
│   ├── step-priorities.tsx         # Q4: multi-select
│   ├── step-timeline.tsx           # Q5: single select
│   └── onboarding-complete.tsx     # Completion screen
├── view-models/
│   └── use-onboarding.ts           # State management hook
└── model/
    └── onboarding.ts               # Types (OnboardingAnswers, etc.)
```

### 3. Create onboarding storage

Add utility to save/load onboarding answers:
- Use localStorage for persistence (no API needed for MVP)
- Key: `onboarding-answers`
- Store: `{ targetRole, experienceLevel, hasResume, priorities, timeline, completedAt }`

### 4. Add onboarding check to home page

Modify `apps/web/features/home/views/home-page-view.tsx` or the home page router:
- Check if `onboarding-answers` exists in localStorage
- If not completed, redirect to `/onboarding`
- If completed, load answers and use for personalization

### 5. Personalize dashboard based on answers

Modify the home page to use onboarding answers:
- Pre-fill target role in analysis wizard (from Q1)
- Show recommended starting action based on Q4
- Suggest template based on Q3 + Q4

## Code conventions

- ESM only: `.js` extensions in imports
- Use existing UI components from `apps/web/components/` (Button, Card, etc.)
- Follow MVVM pattern: views render UI, view-models hold state, model defines types
- Use Tailwind v4 for styling
- No comments unless asked
- TanStack Query for any API calls (if needed)

## Steps

### Step 1: Read existing patterns

Read these files to match code style:
- `apps/web/features/onboarding/views/analysis-wizard.tsx` — wizard pattern
- `apps/web/features/onboarding/components/step-target-role.tsx` — step component pattern
- `apps/web/features/onboarding/view-models/use-resume-analysis.ts` — state management pattern
- `apps/web/features/home/views/home-page-view.tsx` — dashboard pattern
- `apps/web/components/button.tsx` — UI components

### Step 2: Create model types

Create `apps/web/features/user-onboarding/model/onboarding.ts`:
```typescript
export interface OnboardingAnswers {
  targetRole: string;
  experienceLevel: "student" | "entry" | "mid" | "senior";
  hasResume: boolean;
  priorities: Array<"ats" | "bullets" | "tailor" | "scratch">;
  timeline: "active" | "month" | "preparing";
  completedAt: string; // ISO date
}
```

### Step 3: Create view model

Create `apps/web/features/user-onboarding/view-models/use-onboarding.ts`:
- State: current step (1-5), answers object
- Actions: setAnswer, nextStep, prevStep, completeOnboarding
- Persistence: save to localStorage on complete

### Step 4: Create step components

Build each step component following the pattern from `step-target-role.tsx`:
- Clean, focused UI for one question
- Clear CTA to proceed
- Back button to go to previous step

### Step 5: Create wizard view

Create `apps/web/features/user-onboarding/views/onboarding-wizard.tsx`:
- Renders current step component
- Shows progress indicator (step 1/5, 2/5, etc.)
- Handles navigation between steps

### Step 6: Create page and route

Create `apps/web/app/onboarding/page.tsx`:
- Import and render the wizard
- Check if already completed → redirect to `/home`

### Step 7: Add home page check

Modify home page to redirect to `/onboarding` if not completed.

### Step 8: Present brief

After all files are created:

```
Built: Onboarding Flow

Created 8 files:
  app/onboarding/page.tsx              — Next.js page
  features/user-onboarding/
    views/onboarding-wizard.tsx        — Main wizard
    components/step-*.tsx              — 5 step components + completion
    view-models/use-onboarding.ts      — State management
    model/onboarding.ts                — Types
  features/home/ (modified)            — Added onboarding check

To test: corepack pnpm dev → sign up as new user → redirected to /onboarding
```

## Rules

- Follow existing code patterns exactly
- Use existing UI components, don't create new ones
- Keep it simple — localStorage for MVP, no API
- 5 questions only, no more
- All answers collected before personalization (push right)
- Redirect to /home after completion
