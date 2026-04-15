# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Template Switch Does Not Update Preview or Highlight
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate Bug 1 exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing case — clicking a different template card while `previewMode` is already `"structured"` and `AnalysisWorkspace` holds no local `activeTemplateId` state
  - Render `AnalysisWorkspace` with `selectedTemplateId="minimalist-grid"` and `previewMode` already in `"structured"` state
  - Open the "Switch Template" modal and click the "Harvard Classic" card
  - Assert that `ResumeRenderer` receives `variantId="harvard-classic"` immediately after the click (before parent re-renders)
  - Assert that the "Harvard Classic" `TemplateCard` has `isSelected=true` and "Minimalist Grid" has `isSelected=false` immediately after the click
  - Run test on UNFIXED code — `AnalysisWorkspace` has no local `activeTemplateId` state
  - **EXPECTED OUTCOME**: Test FAILS (proves the bug exists — `ResumeRenderer` still receives the old `variantId` and the old card remains highlighted)
  - Document counterexamples found (e.g., `ResumeRenderer.variantId` is still `"minimalist-grid"` after clicking "Harvard Classic")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Switching Inputs and Fallback Behavior Unaffected
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: closing the modal without clicking a card leaves `selectedTemplateId` and preview unchanged on unfixed code
  - Observe: re-opening the modal after a selection shows the correct card highlighted on unfixed code
  - Observe: editing `form.personalInfo` then switching templates preserves form data on unfixed code
  - Observe: rendering `AnalysisWorkspace` with `analysisResult.suggestions = []` shows "No immediate edits suggested" on unfixed code
  - Write property-based test: for all inputs that do NOT involve clicking a different template card (modal close, form edits, download clicks), the rendered output is identical before and after the fix
  - Write property-based test: for any sequence of template selections, `activeTemplateId` always equals the last selected template and form data is always preserved
  - Verify all preservation tests PASS on UNFIXED code (confirms baseline behavior to preserve)
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 3. Fix Bug 1 — Template switching does not update preview or highlight (`analysis-workspace.tsx`)

  - [x] 3.1 Add local `activeTemplateId` state initialized from `selectedTemplateId` prop
    - Import `useState` is already present; add `const [activeTemplateId, setActiveTemplateId] = useState(selectedTemplateId)` alongside the other state declarations
    - Update `handleSelectTemplate` to call `setActiveTemplateId(templateId)` immediately before `onTemplateChange?.(templateId)` (optimistic update)
    - Replace the `variantId={selectedTemplateId}` prop on `ResumeRenderer` with `variantId={activeTemplateId}`
    - Replace the `isSelected={selectedTemplateId === template.id}` prop on `TemplateCard` with `isSelected={activeTemplateId === template.id}`
    - _Bug_Condition: isBugCondition_templateSwitch(event) — event.clickedTemplateId != currentSelectedTemplateId AND AnalysisWorkspace has no local state copy AND previewMode is already "structured"_
    - _Expected_Behavior: ResumeRenderer.variantId == clickedTemplateId AND TemplateCard(clickedTemplateId).isSelected == true immediately after click_
    - _Preservation: All inputs that do NOT involve clicking a different template card must produce identical behavior_
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.5_

  - [x] 3.2 Sync local `activeTemplateId` state when `selectedTemplateId` prop changes externally
    - Add a `useEffect` that calls `setActiveTemplateId(selectedTemplateId)` whenever the `selectedTemplateId` prop changes (e.g., parent restores a saved analysis with a different template)
    - Place the effect alongside the existing `useEffect` blocks in `AnalysisWorkspace`
    - _Requirements: 3.1_

  - [x] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Template Switch Updates Preview and Highlight
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms `ResumeRenderer` and `TemplateCard` both reflect the new selection immediately
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms Bug 1 is fixed)
    - _Requirements: 2.1, 2.2_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Switching Inputs Unaffected
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions — modal close, form edits, fallback message, and download behavior are all unchanged)
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 4. Fix Bug 2 — Analysis panel empty after wizard completes (`deep-focus-wizard.tsx`)

  - [x] 4.1 Wire `onAnalysisUpdate` and `onJobDescriptionChange` props to `AnalysisWorkspace`
    - In `DeepFocusWizard`, locate the `<AnalysisWorkspace ... onTemplateChange={setSelectedTemplateId} />` JSX
    - Add `onAnalysisUpdate={setAnalysisResult}` so that "Tailor to Job" re-analysis results update the parent's `analysisResult` state
    - Add `onJobDescriptionChange={setJobDescription}` so the parent's `jobDescription` state stays in sync after tailoring
    - _Bug_Condition: isBugCondition_analysisPanel(event) — event.type == "tailor_to_job" AND onAnalysisUpdate prop is undefined AND analysisResult in parent is not updated_
    - _Expected_Behavior: analysisPanel.score == updatedResult.score AND analysisPanel.suggestions.length == updatedResult.suggestions.length after tailoring_
    - _Preservation: Upload validation, empty-suggestions fallback, and all non-tailor interactions must be unaffected_
    - _Requirements: 2.3, 2.4, 3.3, 3.4_

  - [x] 4.2 Stabilize `initialWorkspaceForm` with `useMemo`
    - Add `useMemo` to the existing `React` import in `deep-focus-wizard.tsx`
    - Wrap the `initialWorkspaceForm` computation in `useMemo(() => ..., [analysisResult?.extractedProfile])` to prevent a new object reference on every render
    - This ensures `useResumeEditor`'s `useState(initialForm)` receives a stable initial value and the form does not reset unexpectedly on re-renders
    - _Requirements: 2.3_

- [x] 5. Checkpoint — Ensure all tests pass
  - Re-run the full test suite (unit + property-based tests)
  - Confirm Property 1 (Bug Condition) passes — template switch updates preview and highlight immediately
  - Confirm Property 2 (Preservation) passes — no regressions in non-switching interactions, fallback message, or validation
  - Confirm analysis panel renders score, suggestions, and extracted snapshot after wizard completion
  - Confirm "Tailor to Job" updates the panel with the new result
  - Ensure all tests pass; ask the user if questions arise
