# Implementation Plan: Resume Editor Flow

## Overview

Restructure the onboarding wizard from a 3-step flow (target role → upload+JD → template) into a 4-step wizard (JD → PDF upload → template → suggestions) followed by a simplified workspace (left editor + full-width preview). All changes are front-end only; the backend API is unchanged.

## Tasks

- [x] 1. Create `StepJobDescription` component (step 1 of 4)
  - [x] 1.1 Create `apps/web/features/onboarding/components/step-job-description.tsx`
    - Implement `StepJobDescriptionProps` interface: `jobDescription`, `setJobDescription`, `onNext`, `canContinue`
    - Render step pill "STEP 1 OF 4", heading, textarea, live character count, inline validation error, and Continue button
    - Show inline error "Paste at least 30 characters from the job description." when `trimmedLength > 0 && trimmedLength < 30`
    - Disable Continue button when `trimmedLength < 30`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 Write property test: JD validation gate (Property 1)
    - **Property 1: Job description validation gate**
    - Use `fc.string()` of varying length; assert continue is enabled iff `trim().length >= 30`
    - **Validates: Requirements 1.2, 6.5**

  - [x] 1.3 Write property test: live character count accuracy (Property 2)
    - **Property 2: Live character count accuracy**
    - Use `fc.string()`; assert displayed count equals `trim().length`
    - **Validates: Requirements 1.5**

  - [x] 1.4 Write unit tests for `StepJobDescription`
    - Renders "STEP 1 OF 4" step indicator
    - Continue disabled on empty input
    - Error shown for 1–29 char input; no error on empty
    - Continue enabled at exactly 30 chars
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 2. Modify `StepDocumentUpload` to PDF-only step 2 of 4
  - [x] 2.1 Update `apps/web/features/onboarding/components/step-document-upload.tsx`
    - Remove `jobDescription`, `setJobDescription`, `targetRole` props from the interface
    - Change `accept` attribute to `.pdf` only
    - Update step pill to "STEP 2 OF 4"
    - Update `isSupportedFile` call / inline check to PDF-only (`application/pdf`)
    - Update helper text to "Supports PDF up to 10 MB"
    - Remove the job description textarea and its surrounding layout column
    - Simplify the Flow Summary aside to show only resume status
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 2.2 Write property test: file acceptance rule (Property 3)
    - **Property 3: File acceptance rule**
    - Use `fc.record({ type: fc.string(), size: fc.nat() })`; assert accepted iff `type === "application/pdf" && size <= 10_485_760`
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.7**

  - [-] 2.3 Write property test: file confirmation display (Property 4)
    - **Property 4: File confirmation display**
    - Use `fc.record({ name: fc.string({ minLength: 1 }), size: fc.nat(10_485_760) })`; assert file name and formatted size are rendered after valid selection
    - **Validates: Requirements 2.6**

  - [~] 2.4 Write unit tests for modified `StepDocumentUpload`
    - Renders "STEP 2 OF 4" step indicator
    - Non-PDF file shows error; oversized file shows error
    - Drag-and-drop handlers are wired
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Update `StepTemplateSelection` step label to "STEP 3 OF 4"
  - [~] 3.1 Edit `apps/web/features/onboarding/components/step-template-selection.tsx`
    - Change step pill text from "STEP 3 OF 3" to "STEP 3 OF 4"
    - No other interface or logic changes required
    - _Requirements: 3.1, 6.1_

  - [~] 3.2 Write property test: template cards completeness (Property 5)
    - **Property 5: Template cards completeness**
    - Use `fc.array(templateArbitrary)`; assert exactly one card per template, each showing name and ATS label
    - **Validates: Requirements 3.2, 3.4**

  - [~] 3.3 Write unit tests for `StepTemplateSelection`
    - Renders "STEP 3 OF 4" step indicator
    - Default template pre-selected when none chosen
    - _Requirements: 3.1, 3.7_

- [ ] 4. Create `StepSuggestions` component (step 4 of 4)
  - [~] 4.1 Create `apps/web/features/onboarding/components/step-suggestions.tsx`
    - Implement `StepSuggestionsProps` interface: `analysisResult: ResumeAnalysisResult`, `onEnterEditor: () => void`, `onBack: () => void`
    - Render step pill "STEP 4 OF 4", heading, summary bar (total, critical, matched keywords, missing keywords)
    - Render scrollable list of suggestion cards with title, detail, and severity badge (Critical/rose, Impact/amber, Edit/slate)
    - Render "Enter Editor" CTA button and Back button
    - Show empty state "No suggestions — your resume looks well-matched to this role." when `suggestions` is empty
    - _Requirements: 4.2, 4.3, 4.6, 6.1, 6.2_

  - [~] 4.2 Write property test: suggestion card rendering (Property 7)
    - **Property 7: Suggestion card rendering**
    - Use `fc.record({ title: fc.string(), detail: fc.string(), severity: fc.constantFrom("high","medium","low"), category: fc.string() })`; assert card renders title, detail, and correct badge label
    - **Validates: Requirements 4.2**

  - [~] 4.3 Write property test: suggestion summary counts (Property 8)
    - **Property 8: Suggestion summary counts**
    - Use `fc.array(suggestionArbitrary)`; assert total count equals array length and critical count equals `filter(s => s.severity === "high").length`
    - **Validates: Requirements 4.3**

  - [~] 4.4 Write property test: keyword counts display (Property 9)
    - **Property 9: Keyword counts display**
    - Use `fc.record({ matchedKeywords: fc.array(fc.string()), missingKeywords: fc.array(fc.string()) })`; assert displayed counts equal array lengths
    - **Validates: Requirements 4.6**

  - [~] 4.5 Write unit tests for `StepSuggestions`
    - Renders "STEP 4 OF 4" step indicator
    - Empty suggestions state renders neutral message
    - "Enter Editor" button calls `onEnterEditor`
    - Back button calls `onBack`
    - _Requirements: 4.2, 4.3, 4.6, 6.1, 6.2_

- [ ] 5. Update `DeepFocusWizard` orchestrator to 4-step flow
  - [~] 5.1 Refactor state and step type in `apps/web/features/onboarding/views/deep-focus-wizard.tsx`
    - Change `WizardStep` type from `1 | 2 | 3` to `1 | 2 | 3 | 4`
    - Remove `targetRole` / `StepTargetRole` — replace step 1 with `StepJobDescription`
    - Move `jobDescription` collection to step 1; remove it from step 2 props
    - Add `canContinueFromJobDescription` guard: `trimmedJobDescription.length >= 30`
    - Update `canContinueFromUpload` to only require `resumeFile !== null` (PDF, ≤10 MB)
    - Update `isSupportedFile` / validation to PDF-only for step 2
    - Update `handleNext` to route: step 1 → 2 (JD valid), step 2 → 3 (file valid), step 3 → 4 (API call), step 4 → workspace
    - Update `handleBack`: workspace → step 4, step 4 → step 3, step 3 → step 2, step 2 → step 1
    - Import and render `StepJobDescription` at step 1, `StepSuggestions` at step 4
    - Pass `analysisResult` to `StepSuggestions`; wire `onEnterEditor` to transition to workspace
    - Update `stepOverview` sidebar entries to reflect 4-step flow
    - Update header step pill to "STEP N OF 4"
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [~] 5.2 Write property test: step indicator accuracy (Property 14)
    - **Property 14: Step indicator accuracy**
    - Use `fc.constantFrom(1, 2, 3, 4)`; for each step N assert the rendered indicator shows "STEP N OF 4"
    - **Validates: Requirements 6.1**

  - [~] 5.3 Write property test: back button presence (Property 15)
    - **Property 15: Back button presence**
    - Use `fc.constantFrom(2, 3, 4)`; assert a back navigation control is rendered on every step > 1
    - **Validates: Requirements 6.2**

  - [~] 5.4 Write property test: template selection persistence (Property 6)
    - **Property 6: Template selection persistence**
    - Use `fc.constantFrom(...sampleTemplates).map(t => t.id)`; assert selected template ID is preserved through back navigation from workspace to wizard and used to render the preview
    - **Validates: Requirements 3.3, 3.5, 3.6, 5.1, 6.3**

  - [~] 5.5 Write unit tests for `DeepFocusWizard` orchestration
    - Back navigation from workspace restores step 4 (suggestions)
    - URL `?analysis=` param triggers analysis restoration and jumps to workspace
    - `handleGenerateAnalysis` transitions from step 3 to step 4 on success
    - _Requirements: 6.3, 6.4_

- [~] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Simplify `AnalysisWorkspace` layout (remove right suggestions column)
  - [~] 7.1 Edit `apps/web/features/editor/views/analysis-workspace.tsx`
    - Remove the right-side suggestions column: change `xl:grid-cols-[minmax(0,1fr)_22rem]` to a single-column layout so the preview takes full remaining width
    - Remove `renderSuggestionCard` function and all suggestion card rendering JSX from the workspace body
    - Remove the suggestions scroll container and its heading from the right column
    - Keep `analysisResult` prop (still needed for "Tailor to Job" re-analysis feature)
    - Keep `feedbackSummary` computation only if still referenced elsewhere; remove if unused after column removal
    - Verify the left editor panel (420px) and center preview remain correctly laid out
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [~] 7.2 Write property test: editor sections completeness (Property 10)
    - **Property 10: Editor sections completeness**
    - Use `fc.record(resumeFormArbitrary)`; assert all five standard sections (Personal Info, Education, Work Experience, Leadership, Awards) are listed in the editor panel
    - **Validates: Requirements 5.3**

  - [~] 7.3 Write property test: section editor activation (Property 11)
    - **Property 11: Section editor activation**
    - Use `fc.constantFrom("personal","education","experience","leadership","awards")`; assert activating each section ID renders the corresponding inline form editor
    - **Validates: Requirements 5.4**

  - [~] 7.4 Write property test: form edit round-trip (Property 12)
    - **Property 12: Form edit round-trip**
    - Use `fc.record(resumeFormArbitrary)` with a random field mutation; assert the resume preview renders the updated value
    - **Validates: Requirements 5.5, 5.8**

  - [~] 7.5 Write property test: zoom bounds enforcement (Property 13)
    - **Property 13: Zoom bounds enforcement**
    - Use `fc.array(fc.integer({ min: -30, max: 30 }))`; apply each delta via `adjustPreviewZoom` and assert the resulting zoom is always in [70, 160]
    - **Validates: Requirements 5.7**

  - [~] 7.6 Write property test: tailor modal pre-fill (Property 16)
    - **Property 16: Tailor modal pre-fill**
    - Use `fc.string({ minLength: 30 })`; assert opening the "Tailor to Job" modal pre-fills the input with the exact current job description string
    - **Validates: Requirements 8.2**

  - [~] 7.7 Write unit tests for simplified `AnalysisWorkspace`
    - Download button present in header
    - Download button disabled with "Export PDF" label when no source URL
    - "Tailor to Job" button present
    - Loading overlay shown when `isUpdatingAnalysis=true`
    - Error shown in tailor modal on failure
    - Right suggestions column is absent from the rendered output
    - _Requirements: 5.1, 5.2, 7.1, 7.2, 7.3, 8.1, 8.2, 8.4, 8.5_

- [~] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) (TypeScript-native PBT library), minimum 100 iterations each
- All 16 correctness properties from the design document are covered by property test sub-tasks
- The backend API (`POST /api/analysis/upload`, `GET /api/analysis/:id`, `PATCH /api/analysis/:id`) is unchanged
- `wizard-utils.ts`, `analysis-api.ts`, `resume-renderer.tsx`, and all editor sub-components are unchanged
