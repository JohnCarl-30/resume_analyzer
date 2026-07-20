---
target: analysis workspace
total_score: 24
p0_count: 1
p1_count: 2
timestamp: 2026-07-20T02-44-01Z
slug: s-web-features-editor-views-analysis-workspace-tsx
---
# Critique — Analysis Workspace

**Target:** apps/web/features/editor/views/analysis-workspace.tsx (+ next-steps, tailor review modal)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Reanalyze overlay + tailor skeletons work; match % stays frozen after local edits |
| 2 | Match System / Real World | 3 | “Job words” / Top fixes are coach-like; Layout vs Original and dual review labels still confuse |
| 3 | User Control and Freedom | 3 | Skip / Approve / Review later + undo exist; auto-open review on entry feels trapping |
| 4 | Consistency and Standards | 2 | CTA colors diverge: brand Check again, soft Review job edits, black Approve in tailor modal |
| 5 | Error Prevention | 2 | Add suggestion mutates resume without confirm; review dismiss is sticky |
| 6 | Recognition Rather Than Recall | 2 | JD / missing words live in modal — not co-located with the active editor |
| 7 | Flexibility and Efficiency | 2 | Shortcuts at 2xl only; mobile loses undo; no bulk approve |
| 8 | Aesthetic and Minimalist Design | 2 | Dense header + floating pill + packed Top fixes vs quiet UI / loud document |
| 9 | Error Recovery | 3 | Retry + plain toasts; empty preview mentions OpenAI (dev jargon) |
| 10 | Help and Documentation | 2 | Top fixes coach well; no explainers for Layout/Original or why a modal auto-opened |
| **Total** | | **24/40** | **Acceptable** |

## Anti-Patterns Verdict

**LLM assessment:** Mild–moderate product AI residue. Avoids purple-glow SaaS and marketplace badge spam. Still shows ScoreRing hero metric, Add Content 7-card mosaic, SparklesIcon on non-AI chrome, floating pill toolbar, uppercase “Preview unavailable” eyebrow.

**Deterministic scan:** Clean — `detect.mjs` exit 0, 0 findings across workspace, next-steps, and both review modals.

**Visual overlays:** Not available. Browser MCP could not attach/navigate to localhost:3000; injection skipped. Fallback: CLI-only.

## Overall Impression

The tailor review flow is the best expression of the product promise (light edits, human approval). Arrival into the workspace undermines it: too many next steps speak at once, and an auto-opened modal ambushes an already anxious student. Biggest opportunity: one primary “show match → fix” path after analysis.

## What's Working

1. **ResumeTailorReviewModal** — one edit at a time, Before/After, Skip/Approve, Review later, layout preview.
2. **Plain-language coaching** in Top fixes (“job words,” “Check a different job post”).
3. **Document canvas** is correctly intended as the hero; the system wants quiet chrome even when it currently over-delivers it.

## Priority Issues

### [P0] No single “show match → fix” path
Competing CTAs: Review job edits, tailor banner Review N edits, Top fixes Edit/Add suggestion, and solid Check again.
**Why:** Students abandon when the coach speaks with four mouths.
**Fix:** One primary CTA — “Review N edits for this job.” Demote Check again and Add suggestion until after that review.
**Suggested command:** `$impeccable distill` / `$impeccable clarify`

### [P1] Auto-opened modal gauntlet
`initialSuggestionsReviewOpen` can force tailor review, then chain suggestions review on finish.
**Why:** High-anxiety ambush; feels like a trap.
**Fix:** Inline “Start review” in the sidebar; never auto-chain a second modal.
**Suggested command:** `$impeccable onboard` / `$impeccable polish`

### [P1] Chrome density vs quiet UI / loud document
Header action pile + floating preview pill + dense Top fixes card.
**Why:** Document becomes secondary; hard to find the one safe action on mobile.
**Fix:** Keep Back + score + one primary; overflow Style/Print/Shortcuts; slim Top fixes to 1–3 incomplete steps.
**Suggested command:** `$impeccable quieter` / `$impeccable layout`

### [P2] Add Content card mosaic
Seven identical icon cards.
**Why:** Classic AI grid + 7-option decision wall.
**Fix:** Grouped list (Basics / Experience / Extras).
**Suggested command:** `$impeccable distill`

### [P2] Opaque preview modes + magic iconography
Original vs Layout with SparklesIcon; empty state mentions OpenAI.
**Why:** Breaks plain language; implies black-box AI.
**Fix:** “Your upload” / “Editable version”; remove sparkles from non-AI chrome; student-facing empty copy.
**Suggested command:** `$impeccable clarify`

## Persona Red Flags

**Jordan (first-timer):** Auto-modal before orientation; Layout/Original meaningless; Edit section vs Add suggestion unclear; OpenAI empty-state copy.

**Casey (mobile):** Match chip hidden below sm; primary actions in top header; undo hidden until md; floating pill steals document space.

**Maya (anxious student, one JD):** Red/amber ScoreRing without “this is fixable”; keyword badges feel like a failing grade; fear Add suggestion invents experience; Check again sounds like starting over; second review modal after tailor feels like more judgment.

## Minor Observations

- Zoom-out uses SearchIcon (reads as search)
- Keyboard shortcuts only at 2xl
- Tailor progress bar is 1px — easy to miss
- Empty preview uses display-serif against product sans chrome

## Questions to Consider

1. If the promise is show match → fix, why is the loudest solid button Check again (re-measure) rather than fix the top gap?
2. What if the score never turned red — only “closer / farther” — until the user chooses to re-check?
3. Could post-analysis be one sequential coach thread instead of a mini-dashboard of parallel affordances?
