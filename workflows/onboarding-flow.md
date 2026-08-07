# Workflow: Onboarding Flow

Guide new users through a 5-question onboarding that personalizes their experience.

## Trigger

New user signs up (detected via Clerk webhook or first login).

## Process

### Screen 1: Target Role
- **Question:** "What role are you targeting?"
- **Type:** Text input with autocomplete suggestions (Software Engineer, Product Manager, Data Analyst, etc.)
- **Purpose:** Seeds the analysis wizard with a default target role

### Screen 2: Experience Level
- **Question:** "What's your experience level?"
- **Type:** Single select
- **Options:** Student · Entry-level · Mid · Senior
- **Purpose:** Adjusts score thresholds and keyword expectations in analysis

### Screen 3: Existing Resume
- **Question:** "Do you have an existing resume?"
- **Type:** Toggle
- **Options:** "Yes, I have one" · "No, starting fresh"
- **Purpose:** Routes to upload flow vs. create-from-scratch flow

### Screen 4: Priorities
- **Question:** "What matters most to you right now?"
- **Type:** Multi-select (pick 1-3)
- **Options:** Get past ATS · Improve bullet points · Tailor for a specific job · Build from scratch
- **Purpose:** Prioritizes which features surface first on the dashboard

### Screen 5: Timeline
- **Question:** "When are you planning to apply?"
- **Type:** Single select
- **Options:** Actively applying · Within a month · Just preparing
- **Purpose:** Could trigger follow-up reminders or urgency cues

### After Screen 5

Drop into `/home` with pre-filled context:
- Default target role in the analysis wizard (from Q1)
- Recommended starting action on the dashboard (from Q4)
- Template recommendation: ATS-focused for "get past ATS", creative for other goals
- Resume creation vs. upload routing (from Q3)

## Checkpoint

User answers each question (5 total). The flow is fast — ~30 seconds total. No backtracking required; users can change answers later in settings.

## Push Right

All 5 answers are collected before any personalization happens. No mid-flow branching, no conditional screens. The user completes the full flow, then sees a personalized dashboard.

## Brief

After completing the flow:

```
You're all set!

Based on your goals, we recommend:
- Target role: <role from Q1>
- Start with: <action based on Q4> (e.g., "Upload your resume" or "Build from scratch")
- Template: <recommendation based on Q3 + Q4>

[Get started →]
```

The CTA leads to the recommended starting point (upload wizard, create-resume, or analysis).
