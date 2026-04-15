# Resume Template UI Fix — Bugfix Design

## Overview

Two UI bugs affect the editor workspace after onboarding. The first bug prevents the resume preview and template card highlight from updating when the user selects a different template in the "Switch Template" modal. The second bug causes the analysis panel (match score, suggestions, extracted snapshot) to remain empty after the onboarding wizard completes and the API returns a result.

Both bugs are state-propagation failures: the UI holds stale or missing state rather than reflecting the latest data. The fixes are targeted and minimal — no architectural changes are required.

---

## Glossary

- **Bug_Condition (C)**: The condition that triggers a bug — the specific input or event that causes incorrect UI behavior.
- **Property (P)**: The desired correct behavior when the bug condition holds.
- **Preservation**: Existing behaviors that must remain unchanged after the fix is applied.
- **AnalysisWorkspace**: The component in `apps/web/features/editor/views/analysis-workspace.tsx` that renders the three-column editor, preview, and analysis panel.
- **DeepFocusWizard**: The parent component in `apps/web/features/onboarding/views/deep-focus-wizard.tsx` that owns wizard state and renders `AnalysisWorkspace` in workspace mode.
- **selectedTemplateId**: The `ResumeTemplateVariant` string identifying the active resume layout. Owned as state in `DeepFocusWizard`, passed as a prop to `AnalysisWorkspace`.
- **analysisResult**: The `ResumeAnalysisResult` object returned by the API after upload. Owned as state in `DeepFocusWizard`, passed as a prop to `AnalysisWorkspace`.
- **handleSelectTemplate**: The function inside `AnalysisWorkspace` that fires when a template card is clicked in the modal.
- **handleGenerateAnalysis**: The async function in `DeepFocusWizard` that calls the upload API and transitions to workspace mode.
- **onTemplateChange**: The callback prop on `AnalysisWorkspace` that notifies the parent of a template selection.
- **onAnalysisUpdate**: The callback prop on `AnalysisWorkspace` that notifies the parent of a re-analysis result (used by "Tailor to Job").

---

## Bug Details

### Bug 1 — Template Switching Does Not Update Preview or Highlight

#### Bug Condition

The bug manifests when the user opens the "Switch Template" modal and clicks a template card that differs from the currently active template. `handleSelectTemplate` calls `onTemplateChange?.(templateId)` to notify the parent, then immediately calls `setPreviewMode("structured")` and `setModalView(null)`. Because `AnalysisWorkspace` holds no local copy of `selectedTemplateId`, the preview and the card highlight both depend entirely on the prop value flowing back from the parent after a re-render cycle. When `previewMode` is already `"structured"`, `setPreviewMode("structured")` is a no-op and React may not schedule a re-render of the preview subtree in the same tick. The modal closes before the parent's updated `selectedTemplateId` prop reaches `ResumeRenderer`, leaving the preview on the old layout.

**Formal Specification:**
```
FUNCTION isBugCondition_templateSwitch(event)
  INPUT: event — a template card click in the "Switch Template" modal
  OUTPUT: boolean

  RETURN event.clickedTemplateId != currentSelectedTemplateId
         AND AnalysisWorkspace has no local state copy of selectedTemplateId
         AND previewMode is already "structured"
         AND ResumeRenderer receives stale selectedTemplateId prop after modal closes
END FUNCTION
```

**Examples:**
- User is on "Minimalist Grid". Opens modal, clicks "Harvard Classic". Modal closes. Preview still shows Minimalist Grid layout. (Bug manifests.)
- User opens modal again. "Minimalist Grid" card still shows the checkmark instead of "Harvard Classic". (Highlight bug manifests.)
- User is on "Minimalist Grid". Opens modal, clicks "Minimalist Grid" again. No change expected. (No bug — same template.)

---

### Bug 2 — Analysis Panel Empty After Onboarding Wizard Completes

#### Bug Condition

The bug manifests when the user completes the onboarding wizard and `handleGenerateAnalysis` resolves with a valid `ResumeAnalysisResult`. In `DeepFocusWizard`, `AnalysisWorkspace` is rendered with `onAnalysisUpdate` and `onJobDescriptionChange` props omitted from the JSX. This means the "Tailor to Job" re-analysis flow inside `AnalysisWorkspace` calls `onAnalysisUpdate?.(updated)` as a no-op — the parent's `analysisResult` state is never updated after tailoring, so the panel goes stale. Additionally, `initialWorkspaceForm` is computed as a plain `const` in the render body rather than a stable memoized value, which can cause `useResumeEditor`'s `useState(initialForm)` to receive a new object reference on every render without the form state actually updating (since `useState` ignores subsequent `initialState` changes after mount).

**Formal Specification:**
```
FUNCTION isBugCondition_analysisPanel(event)
  INPUT: event — wizard completion or "Tailor to Job" submission
  OUTPUT: boolean

  RETURN (
    event.type == "tailor_to_job"
    AND onAnalysisUpdate prop is undefined in DeepFocusWizard JSX
    AND analysisResult in parent state is not updated after re-analysis
  ) OR (
    event.type == "wizard_complete"
    AND analysisResult.suggestions is non-empty
    AND analysis panel renders null because analysisResult prop is stale or missing
  )
END FUNCTION
```

**Examples:**
- User completes wizard. API returns result with 5 suggestions and a score of 72. Workspace opens. Analysis panel shows no score, no suggestions, no extracted snapshot. (Bug manifests on initial load if analysisResult prop is not correctly passed.)
- User clicks "Tailor to Job", submits new job description. API returns updated result with new score. Panel still shows old score. (Bug manifests because `onAnalysisUpdate` is not wired.)
- User completes wizard. API returns result. `analysisResult` prop is non-null. Panel renders correctly. User tailors. Panel updates. (Expected behavior after fix.)

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Closing the "Switch Template" modal without selecting a new template must leave the active template and preview unchanged.
- The currently selected template must remain highlighted when the modal is opened if no new selection has been made.
- All edited resume form data (personal info, education, experience, leadership, awards, projects) must be preserved when switching templates.
- The "No immediate edits suggested" fallback message must continue to appear when `analysisResult.suggestions` is empty.
- Upload validation (minimum job description length, file type/size checks) must continue to prevent form submission when conditions are not met.
- Mouse clicks, keyboard navigation, and all other non-template-switch interactions must be unaffected.

**Scope:**
All inputs that do NOT involve clicking a template card in the modal (Bug 1) or submitting the wizard / tailoring the job description (Bug 2) must be completely unaffected by these fixes.

---

## Hypothesized Root Cause

### Bug 1 — Template Switching

1. **Missing local state in AnalysisWorkspace**: `AnalysisWorkspace` has no local `activeTemplateId` state. It relies entirely on the `selectedTemplateId` prop. When `handleSelectTemplate` fires, it calls `onTemplateChange` (which schedules a parent state update) and immediately closes the modal. The prop update arrives in the next render cycle, but by then the modal is gone and the preview may not re-render if `previewMode` state didn't change.

2. **No-op `setPreviewMode` call**: If `previewMode` is already `"structured"` when a new template is selected, `setPreviewMode("structured")` does not trigger a re-render. React bails out of re-rendering when state is set to the same value. The preview subtree therefore does not re-render with the new `selectedTemplateId` prop in the same cycle.

3. **Prop-only architecture without optimistic update**: The `isSelected` check in the template modal (`isSelected={selectedTemplateId === template.id}`) uses the prop value. Without a local state copy, the highlight cannot update until the parent re-renders and passes the new prop — which happens after the modal is already closed.

### Bug 2 — Analysis Panel Empty

1. **Missing `onAnalysisUpdate` prop in DeepFocusWizard JSX**: The `AnalysisWorkspace` component is rendered in `DeepFocusWizard` without the `onAnalysisUpdate` and `onJobDescriptionChange` props. When `handleTailorToJob` inside `AnalysisWorkspace` calls `onAnalysisUpdate?.(updated)`, it is a no-op. The parent's `analysisResult` state is never updated after re-analysis, so the panel displays stale data.

2. **Unstable `initialWorkspaceForm` reference**: `initialWorkspaceForm` is computed as a plain `const` in the `DeepFocusWizard` render body. On every render, a new object is created. `useResumeEditor` initializes its `form` state with `useState(initialForm)`, which only uses `initialForm` on the first mount. If the component remounts or if the reference instability causes unexpected behavior, the form may not reflect the extracted profile.

3. **Potential race condition with `analysisIdFromUrl` effect**: After `handleGenerateAnalysis` sets `analysisResult` and calls `replaceAnalysisParam`, the `useEffect` watching `analysisIdFromUrl` may fire before `restoredAnalysisIdRef.current` is set, triggering a redundant `getResumeAnalysis` fetch that overwrites the already-set `analysisResult` with a fresh API response — or clears it on error.

---

## Correctness Properties

Property 1: Bug Condition — Template Selection Updates Preview and Highlight

_For any_ template card click in the "Switch Template" modal where the clicked template differs from the currently active template, the fixed `handleSelectTemplate` function SHALL immediately update the resume preview to render the newly selected template layout AND visually mark the newly selected card as active (checkmark/highlight), without waiting for a parent re-render cycle.

**Validates: Requirements 2.1, 2.2**

Property 2: Bug Condition — Analysis Panel Reflects API Result

_For any_ wizard completion event where `handleGenerateAnalysis` resolves with a non-null `ResumeAnalysisResult`, the fixed `DeepFocusWizard` SHALL pass `onAnalysisUpdate` and `onJobDescriptionChange` to `AnalysisWorkspace` so that the analysis panel displays the match score, suggestions, and extracted snapshot from the API result, and continues to update when "Tailor to Job" is submitted.

**Validates: Requirements 2.3, 2.4**

Property 3: Preservation — Non-Switching Inputs Unaffected

_For any_ input that does NOT involve clicking a different template card in the modal (mouse clicks on other UI elements, closing the modal, editing form fields, downloading the source), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing functionality.

**Validates: Requirements 3.1, 3.2, 3.5**

Property 4: Preservation — Analysis Fallback and Validation Unaffected

_For any_ state where `analysisResult.suggestions` is empty or where the upload form fails validation, the fixed code SHALL continue to display the "No immediate edits suggested" fallback and prevent form submission respectively, identical to the original behavior.

**Validates: Requirements 3.3, 3.4**

---

## Fix Implementation

### Changes Required

Assuming the root cause analysis is correct:

---

**File**: `apps/web/features/editor/views/analysis-workspace.tsx`

**Change 1 — Add local `activeTemplateId` state**

Introduce a local state variable initialized from the `selectedTemplateId` prop. Use this local state for `isSelected` checks in the template modal and as the `variantId` passed to `ResumeRenderer`. Call `onTemplateChange` to keep the parent in sync, but update local state immediately (optimistic update).

```
// Before
function handleSelectTemplate(templateId: ResumeTemplateVariant) {
  onTemplateChange?.(templateId);
  setPreviewMode("structured");
  setModalView(null);
}

// After
const [activeTemplateId, setActiveTemplateId] = useState(selectedTemplateId);

function handleSelectTemplate(templateId: ResumeTemplateVariant) {
  setActiveTemplateId(templateId);   // immediate local update
  onTemplateChange?.(templateId);    // notify parent
  setPreviewMode("structured");
  setModalView(null);
}
```

Replace all uses of `selectedTemplateId` prop with `activeTemplateId` local state inside `AnalysisWorkspace` (specifically in `ResumeRenderer` and the `isSelected` prop on `TemplateCard`).

**Change 2 — Sync local state when prop changes externally**

Add a `useEffect` that syncs `activeTemplateId` when the `selectedTemplateId` prop changes from outside (e.g., parent restores a saved analysis with a different template):

```
useEffect(() => {
  setActiveTemplateId(selectedTemplateId);
}, [selectedTemplateId]);
```

---

**File**: `apps/web/features/onboarding/views/deep-focus-wizard.tsx`

**Change 3 — Wire `onAnalysisUpdate` and `onJobDescriptionChange` props**

Pass the missing callback props to `AnalysisWorkspace` so that "Tailor to Job" re-analysis results update the parent's `analysisResult` state and the panel reflects the new data:

```
// Before
<AnalysisWorkspace
  ...
  onTemplateChange={setSelectedTemplateId}
/>

// After
<AnalysisWorkspace
  ...
  onTemplateChange={setSelectedTemplateId}
  onAnalysisUpdate={setAnalysisResult}
  onJobDescriptionChange={setJobDescription}
/>
```

**Change 4 — Stabilize `initialWorkspaceForm` with `useMemo`**

Wrap `initialWorkspaceForm` in `useMemo` to prevent a new object reference on every render, ensuring `useResumeEditor`'s `useState` receives a stable initial value:

```
// Before
const initialWorkspaceForm = analysisResult?.extractedProfile
  ? resumeFormFromExtractedProfile(analysisResult.extractedProfile)
  : emptyResumeForm;

// After
const initialWorkspaceForm = useMemo(
  () =>
    analysisResult?.extractedProfile
      ? resumeFormFromExtractedProfile(analysisResult.extractedProfile)
      : emptyResumeForm,
  [analysisResult?.extractedProfile],
);
```

---

## Testing Strategy

### Validation Approach

Testing follows a two-phase approach: first surface counterexamples on unfixed code to confirm root causes, then verify the fix and check that existing behavior is preserved.

---

### Exploratory Bug Condition Checking

**Goal**: Demonstrate both bugs on unfixed code to confirm the root cause hypotheses. If tests pass unexpectedly on unfixed code, the root cause analysis must be revised.

**Test Plan**: Write unit tests that simulate the exact user interactions described in the bug conditions. Run against the unfixed code and observe failures.

**Test Cases**:

1. **Template switch updates preview** (Bug 1): Render `AnalysisWorkspace` with `selectedTemplateId="minimalist-grid"`. Open the template modal. Click the "Harvard Classic" card. Assert that `ResumeRenderer` receives `variantId="harvard-classic"`. Expected to fail on unfixed code because `selectedTemplateId` prop hasn't updated yet.

2. **Template card highlight updates** (Bug 1): Same setup. After clicking "Harvard Classic", assert that the "Harvard Classic" `TemplateCard` has `isSelected=true` and "Minimalist Grid" has `isSelected=false`. Expected to fail on unfixed code.

3. **Analysis panel renders after wizard** (Bug 2): Render `DeepFocusWizard` in workspace mode with a non-null `analysisResult` containing suggestions and an extracted profile. Assert that the match score, suggestion cards, and extracted snapshot section are visible. Expected to fail on unfixed code if `onAnalysisUpdate` is not wired and the panel is stale.

4. **Tailor to Job updates panel** (Bug 2): Render `AnalysisWorkspace` with `onAnalysisUpdate` omitted (as in unfixed code). Simulate a "Tailor to Job" submission. Assert that the analysis panel reflects the updated result. Expected to fail on unfixed code.

**Expected Counterexamples**:
- `ResumeRenderer` still receives the old `variantId` after template card click.
- `TemplateCard` `isSelected` prop does not update to reflect the new selection.
- Analysis panel remains empty or stale after `onAnalysisUpdate` is called as a no-op.

---

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR ALL event WHERE isBugCondition_templateSwitch(event) DO
  result := handleSelectTemplate_fixed(event.clickedTemplateId)
  ASSERT ResumeRenderer.variantId == event.clickedTemplateId
  ASSERT TemplateCard(event.clickedTemplateId).isSelected == true
  ASSERT TemplateCard(previousTemplateId).isSelected == false
END FOR

FOR ALL event WHERE isBugCondition_analysisPanel(event) DO
  result := render_fixed(DeepFocusWizard, { analysisResult: event.result })
  ASSERT analysisPanel.score == event.result.score
  ASSERT analysisPanel.suggestions.length == event.result.suggestions.length
  ASSERT analysisPanel.extractedSnapshot.visible == (event.result.extractedProfile != null)
END FOR
```

---

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed code produces the same result as the original code.

**Pseudocode:**
```
FOR ALL event WHERE NOT isBugCondition_templateSwitch(event) DO
  ASSERT original_behavior(event) == fixed_behavior(event)
END FOR

FOR ALL event WHERE NOT isBugCondition_analysisPanel(event) DO
  ASSERT original_behavior(event) == fixed_behavior(event)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because it generates many input combinations automatically and catches edge cases that manual tests miss.

**Test Cases**:

1. **Close modal without selecting**: Open the template modal, close it without clicking a card. Assert that `activeTemplateId` and the preview are unchanged.
2. **Re-open modal shows correct highlight**: Select a new template, close modal, re-open modal. Assert that the newly selected template card is highlighted.
3. **Form data preserved on template switch**: Edit personal info, then switch templates. Assert that `form.personalInfo` is unchanged.
4. **Empty suggestions fallback**: Render `AnalysisWorkspace` with `analysisResult.suggestions = []`. Assert that "No immediate edits suggested" is displayed.
5. **Upload validation unchanged**: Attempt to submit the wizard with a job description shorter than 30 characters. Assert that submission is blocked.

---

### Unit Tests

- Test `handleSelectTemplate` sets `activeTemplateId` local state immediately.
- Test `ResumeRenderer` receives the correct `variantId` after template selection.
- Test `TemplateCard` `isSelected` reflects the new selection before parent re-renders.
- Test `onAnalysisUpdate` is called with the updated result after "Tailor to Job" submission.
- Test `initialWorkspaceForm` is stable across re-renders when `extractedProfile` is unchanged.

### Property-Based Tests

- Generate random sequences of template selections and assert that `activeTemplateId` always equals the last selected template.
- Generate random `ResumeAnalysisResult` objects and assert that the analysis panel renders all fields correctly.
- Generate random form edits followed by template switches and assert that form data is always preserved.

### Integration Tests

- Full wizard flow: upload resume → enter job description → select template → submit → assert analysis panel shows score, suggestions, and extracted snapshot.
- Template switching flow: open workspace → open modal → select different template → assert preview updates → re-open modal → assert new template is highlighted.
- Tailor to Job flow: open workspace → click "Tailor to Job" → submit new job description → assert analysis panel updates with new score and suggestions.
