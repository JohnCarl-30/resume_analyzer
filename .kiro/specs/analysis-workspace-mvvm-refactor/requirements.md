# Requirements Document: Analysis Workspace MVVM Refactor

## Introduction

This document specifies the requirements for refactoring the `analysis-workspace` feature from a 1224-line monolithic React component into a clean MVVM (Model-View-ViewModel) architecture. The refactoring will separate concerns by extracting business logic into custom hooks (ViewModels), breaking down the view into smaller focused components, and maintaining all existing functionality while improving testability, maintainability, and code organization.

The current implementation violates MVVM principles by mixing view logic (React components, JSX), business logic (state management, data transformations, API calls), and presentation logic (event handlers, form validation, modal management) within a single component. This refactoring will establish clear architectural boundaries following the MVVM pattern already established in the codebase (e.g., `use-resume-editor.ts`).

## Glossary

- **MVVM**: Model-View-ViewModel architectural pattern separating data (Model), presentation (View), and business logic (ViewModel)
- **ViewModel**: Custom React hooks that encapsulate business logic, state management, and side effects
- **View**: Pure presentational React components with minimal logic
- **Model**: TypeScript interfaces and types representing data structures (already exists in `model/` directory)
- **Analysis_Workspace**: The main feature component for editing and previewing resumes
- **Modal_Manager**: ViewModel responsible for managing modal state and transitions
- **Project_Form**: ViewModel handling project creation form logic
- **Preview_Manager**: ViewModel managing document preview modes and zoom
- **Tailor_Analysis**: ViewModel handling job description analysis updates
- **Resume_Editor**: Existing ViewModel for resume form state management
- **Monolithic_Component**: A single component containing multiple responsibilities (anti-pattern)
- **Custom_Hook**: React hook encapsulating reusable stateful logic (ViewModel implementation)
- **Pure_Component**: React component with no business logic, only rendering based on props
- **State_Hook**: React useState hook for managing component state
- **Side_Effect**: Operations like API calls, subscriptions, or DOM manipulation
- **Form_Validation**: Logic for validating user input in forms
- **Modal_View**: Overlay UI component for focused user interactions
- **Preview_Mode**: Display mode for resume document (uploaded, structured, parsed, empty)
- **Zoom_Level**: Percentage scale for document preview display
- **Project_Draft**: Temporary state for project creation before saving
- **Content_Option**: Selectable resume section type (summary, objective, projects, etc.)
- **Editor_Section**: Editable resume section (personal, education, experience, leadership, awards, projects)
- **Template_Variant**: Resume layout template identifier
- **Analysis_Result**: Data structure containing resume analysis scores and suggestions
- **Extracted_Profile**: Structured resume data extracted from uploaded document
- **Job_Description**: Text describing target job role and requirements
- **Bullet_Point**: Individual achievement or responsibility line item
- **Test_Suite**: Collection of automated tests verifying component behavior
- **Property_Based_Test**: Test using generated inputs to verify properties hold for all cases
- **Integration_Test**: Test verifying multiple components work together correctly
- **Unit_Test**: Test verifying individual function or component behavior

## Requirements

### Requirement 1: Extract Modal Management ViewModel

**User Story:** As a developer, I want modal state management extracted into a dedicated ViewModel, so that modal logic is reusable and testable independently.

#### Acceptance Criteria

1. THE Modal_Manager SHALL provide a `useModalManager` custom hook
2. WHEN the hook is initialized, THE Modal_Manager SHALL expose `modalView`, `openModal`, `closeModal`, and `isModalOpen` functions
3. WHEN `openModal` is called with a modal type, THE Modal_Manager SHALL set the active modal view
4. WHEN `closeModal` is called, THE Modal_Manager SHALL clear the active modal view
5. THE Modal_Manager SHALL support modal types: "content", "project", "templates", "tailor", and null
6. WHEN a modal is opened, THE Modal_Manager SHALL reset any pending close state
7. THE Modal_Manager SHALL provide a `setPendingModalClose` function for delayed modal transitions
8. WHEN `pendingModalClose` is true, THE Modal_Manager SHALL automatically close the modal on next render
9. THE Modal_Manager SHALL be implemented in `apps/web/features/editor/view-models/use-modal-manager.ts`
10. THE Modal_Manager SHALL have no dependencies on React components or JSX

### Requirement 2: Extract Project Form ViewModel

**User Story:** As a developer, I want project form logic extracted into a dedicated ViewModel, so that project creation logic is reusable and testable independently.

#### Acceptance Criteria

1. THE Project_Form SHALL provide a `useProjectForm` custom hook
2. WHEN the hook is initialized, THE Project_Form SHALL manage `projectDraft` state with fields: name, technologies, link, startDate, endDate, current, bulletInput, bullets
3. THE Project_Form SHALL expose `updateProjectDraft`, `handleAddBullet`, `handleRemoveBullet`, `handleCompleteBullet`, `handleSaveProject`, and `resetForm` functions
4. WHEN `updateProjectDraft` is called, THE Project_Form SHALL update the specified field in the draft
5. WHEN `handleAddBullet` is called with valid input, THE Project_Form SHALL add the bullet to the bullets array and clear bulletInput
6. WHEN `handleAddBullet` is called with empty input, THE Project_Form SHALL not modify the bullets array
7. WHEN `handleAddBullet` is called and bullets array has 3 items, THE Project_Form SHALL not add more bullets
8. WHEN `handleRemoveBullet` is called with an index, THE Project_Form SHALL remove the bullet at that index
9. WHEN `handleCompleteBullet` is called, THE Project_Form SHALL auto-complete the current bullet text with proper formatting
10. WHEN `handleSaveProject` is called with empty project name, THE Project_Form SHALL return validation error "Project name is required."
11. WHEN `handleSaveProject` is called with valid data, THE Project_Form SHALL invoke the provided `onSave` callback with normalized project data
12. WHEN `handleSaveProject` succeeds, THE Project_Form SHALL reset the form to empty state
13. THE Project_Form SHALL normalize bullets by including bulletInput if present and limiting to 3 bullets maximum
14. THE Project_Form SHALL set endDate to "Present" when current checkbox is true
15. THE Project_Form SHALL be implemented in `apps/web/features/editor/view-models/use-project-form.ts`
16. THE Project_Form SHALL expose `formError` state for validation messages
17. THE Project_Form SHALL clear `formError` when form is reset

### Requirement 3: Extract Preview Manager ViewModel

**User Story:** As a developer, I want preview management logic extracted into a dedicated ViewModel, so that preview mode and zoom logic is reusable and testable independently.

#### Acceptance Criteria

1. THE Preview_Manager SHALL provide a `usePreviewManager` custom hook
2. WHEN the hook is initialized with `resumePreviewUrl`, `extractedProfile`, and `parsedResumeText`, THE Preview_Manager SHALL determine initial preview mode
3. THE Preview_Manager SHALL support preview modes: "uploaded", "structured", "parsed", "empty"
4. WHEN `resumePreviewUrl` is provided, THE Preview_Manager SHALL default to "uploaded" mode
5. WHEN `resumePreviewUrl` is null and `extractedProfile` exists, THE Preview_Manager SHALL default to "structured" mode
6. WHEN `resumePreviewUrl` is null and `extractedProfile` is null and `parsedResumeText` exists, THE Preview_Manager SHALL default to "parsed" mode
7. WHEN `resumePreviewUrl` is null and `extractedProfile` is null and `parsedResumeText` is null, THE Preview_Manager SHALL default to "empty" mode
8. THE Preview_Manager SHALL expose `previewMode`, `setPreviewMode`, `previewZoom`, `adjustPreviewZoom`, `canZoomDocument`, and `hasStructuredPreview` values
9. WHEN `adjustPreviewZoom` is called with a delta, THE Preview_Manager SHALL adjust zoom by that amount
10. THE Preview_Manager SHALL constrain zoom between 70% and 160%
11. WHEN preview mode is "uploaded", THE Preview_Manager SHALL set `canZoomDocument` to false
12. WHEN preview mode is not "uploaded", THE Preview_Manager SHALL set `canZoomDocument` to true
13. WHEN preview mode is "structured", THE Preview_Manager SHALL set `hasStructuredPreview` to true
14. WHEN preview mode is not "structured", THE Preview_Manager SHALL set `hasStructuredPreview` to false
15. WHEN `resumePreviewUrl` changes from null to a value, THE Preview_Manager SHALL switch to "uploaded" mode
16. WHEN `resumePreviewUrl` changes from a value to null, THE Preview_Manager SHALL switch to appropriate fallback mode
17. THE Preview_Manager SHALL be implemented in `apps/web/features/editor/view-models/use-preview-manager.ts`

### Requirement 4: Extract Tailor Analysis ViewModel

**User Story:** As a developer, I want job description analysis logic extracted into a dedicated ViewModel, so that analysis update logic is reusable and testable independently.

#### Acceptance Criteria

1. THE Tailor_Analysis SHALL provide a `useTailorAnalysis` custom hook
2. WHEN the hook is initialized with `analysisResult`, THE Tailor_Analysis SHALL initialize `newJobDescription` from `analysisResult.jobDescription`
3. THE Tailor_Analysis SHALL expose `newJobDescription`, `setNewJobDescription`, `isUpdating`, `updateError`, and `handleTailorToJob` values
4. WHEN `handleTailorToJob` is called without `analysisResult.id`, THE Tailor_Analysis SHALL not perform any action
5. WHEN `handleTailorToJob` is called with valid `analysisResult.id`, THE Tailor_Analysis SHALL set `isUpdating` to true
6. WHEN `handleTailorToJob` is called, THE Tailor_Analysis SHALL invoke the `updateResumeAnalysis` API function
7. WHEN the API call succeeds, THE Tailor_Analysis SHALL invoke `onAnalysisUpdate` callback with updated result
8. WHEN the API call succeeds, THE Tailor_Analysis SHALL invoke `onJobDescriptionChange` callback with new job description
9. WHEN the API call succeeds, THE Tailor_Analysis SHALL invoke `onSuccess` callback
10. WHEN the API call fails, THE Tailor_Analysis SHALL set `updateError` with error message
11. WHEN the API call completes, THE Tailor_Analysis SHALL set `isUpdating` to false
12. THE Tailor_Analysis SHALL clear `updateError` when `handleTailorToJob` is called
13. THE Tailor_Analysis SHALL be implemented in `apps/web/features/editor/view-models/use-tailor-analysis.ts`
14. THE Tailor_Analysis SHALL accept `onAnalysisUpdate`, `onJobDescriptionChange`, and `onSuccess` callbacks as parameters

### Requirement 5: Create Main Orchestrator ViewModel

**User Story:** As a developer, I want a main orchestrator ViewModel that coordinates all sub-ViewModels, so that the view component remains thin and focused on rendering.

#### Acceptance Criteria

1. THE Analysis_Workspace SHALL provide a `useAnalysisWorkspace` custom hook
2. THE Analysis_Workspace SHALL compose `useResumeEditor`, `useModalManager`, `useProjectForm`, `usePreviewManager`, and `useTailorAnalysis` hooks
3. THE Analysis_Workspace SHALL accept parameters: `initialForm`, `selectedTemplateId`, `resumePreviewUrl`, `analysisResult`, `onTemplateChange`, `onAnalysisUpdate`, `onJobDescriptionChange`
4. THE Analysis_Workspace SHALL manage `activeTemplateId` state initialized from `selectedTemplateId`
5. WHEN `selectedTemplateId` prop changes, THE Analysis_Workspace SHALL update `activeTemplateId`
6. THE Analysis_Workspace SHALL expose all composed ViewModel values and functions
7. THE Analysis_Workspace SHALL coordinate between `useProjectForm` and `useResumeEditor` by passing `addProject` function to project form
8. THE Analysis_Workspace SHALL coordinate between `useTailorAnalysis` and `useModalManager` by passing `closeModal` as `onSuccess` callback
9. THE Analysis_Workspace SHALL provide `handleSelectTemplate` function that updates `activeTemplateId`, calls `onTemplateChange`, sets preview mode to "structured", and triggers pending modal close
10. THE Analysis_Workspace SHALL provide `handleDownloadSource` function that creates download anchor for `resumeSourceUrl`
11. THE Analysis_Workspace SHALL compute `editorSections` by combining base sections with projects section when projects exist
12. THE Analysis_Workspace SHALL be implemented in `apps/web/features/editor/view-models/use-analysis-workspace.ts`

### Requirement 6: Extract Modal Components

**User Story:** As a developer, I want modal UI extracted into separate components, so that modal rendering logic is modular and maintainable.

#### Acceptance Criteria

1. THE Analysis_Workspace SHALL extract content modal into `apps/web/features/editor/components/modals/content-modal.tsx`
2. THE Content_Modal SHALL accept props: `isOpen`, `onClose`, `onSelectOption`, `contentOptions`
3. THE Content_Modal SHALL render a grid of content option cards
4. WHEN a content option with `interactive: true` is clicked, THE Content_Modal SHALL invoke `onSelectOption` with the option id
5. THE Analysis_Workspace SHALL extract project modal into `apps/web/features/editor/components/modals/project-modal.tsx`
6. THE Project_Modal SHALL accept props: `isOpen`, `onClose`, `projectDraft`, `onUpdateDraft`, `onAddBullet`, `onRemoveBullet`, `onCompleteBullet`, `onSave`, `formError`, `maxBullets`
7. THE Project_Modal SHALL render project form fields: name, technologies, link, startDate, endDate, current checkbox, bullet input, bullets list
8. THE Project_Modal SHALL display validation error when `formError` is not empty
9. THE Analysis_Workspace SHALL extract template modal into `apps/web/features/editor/components/modals/template-modal.tsx`
10. THE Template_Modal SHALL accept props: `isOpen`, `onClose`, `templates`, `activeTemplateId`, `onSelectTemplate`
11. THE Template_Modal SHALL render a grid of template cards
12. THE Template_Modal SHALL highlight the active template
13. THE Analysis_Workspace SHALL extract tailor modal into `apps/web/features/editor/components/modals/tailor-modal.tsx`
14. THE Tailor_Modal SHALL accept props: `isOpen`, `onClose`, `jobDescription`, `onJobDescriptionChange`, `onSubmit`, `isUpdating`, `updateError`
15. THE Tailor_Modal SHALL render a textarea for job description input
16. THE Tailor_Modal SHALL disable submit button when `isUpdating` is true or job description length is less than 30 characters
17. THE Tailor_Modal SHALL display error message when `updateError` is not empty

### Requirement 7: Extract Preview Components

**User Story:** As a developer, I want preview UI extracted into separate components, so that preview rendering logic is modular and maintainable.

#### Acceptance Criteria

1. THE Analysis_Workspace SHALL extract document preview into `apps/web/features/editor/components/preview/document-preview.tsx`
2. THE Document_Preview SHALL accept props: `previewMode`, `resumePreviewUrl`, `parsedResumeText`, `form`, `activeTemplateId`, `previewZoom`
3. WHEN `previewMode` is "uploaded" and `resumePreviewUrl` exists, THE Document_Preview SHALL render an iframe with the PDF
4. WHEN `previewMode` is "parsed" and `parsedResumeText` exists, THE Document_Preview SHALL render `ParsedTextPreview` component
5. WHEN `previewMode` is "structured", THE Document_Preview SHALL render `ResumeRenderer` component
6. WHEN `previewMode` is "empty", THE Document_Preview SHALL render empty state message
7. THE Document_Preview SHALL apply zoom transformation to non-uploaded preview modes
8. THE Analysis_Workspace SHALL extract preview controls into `apps/web/features/editor/components/preview/preview-controls.tsx`
9. THE Preview_Controls SHALL accept props: `previewMode`, `onPreviewModeChange`, `previewZoom`, `onZoomIn`, `onZoomOut`, `canZoom`, `hasUploadedPreview`, `onDownload`, `canDownload`
10. THE Preview_Controls SHALL render mode toggle buttons for "uploaded" and "structured" modes
11. THE Preview_Controls SHALL render zoom controls with current zoom percentage
12. THE Preview_Controls SHALL disable zoom controls when `canZoom` is false
13. THE Preview_Controls SHALL render download button
14. THE Preview_Controls SHALL disable download button when `canDownload` is false

### Requirement 8: Extract Sidebar Component

**User Story:** As a developer, I want sidebar UI extracted into a separate component, so that editor section navigation is modular and maintainable.

#### Acceptance Criteria

1. THE Analysis_Workspace SHALL extract sidebar into `apps/web/features/editor/components/sidebar/editor-sidebar.tsx`
2. THE Editor_Sidebar SHALL accept props: `sections`, `activeSectionId`, `onSectionOpen`, `onAddContent`, `resumeFileName`
3. THE Editor_Sidebar SHALL render a list of editor sections with icons and labels
4. WHEN a section is clicked, THE Editor_Sidebar SHALL invoke `onSectionOpen` with the section id
5. THE Editor_Sidebar SHALL highlight the active section
6. THE Editor_Sidebar SHALL render appropriate action buttons for each section type
7. WHEN "Add Section" button is clicked, THE Editor_Sidebar SHALL invoke `onAddContent`
8. THE Editor_Sidebar SHALL display resume source file name

### Requirement 9: Refactor Main View Component

**User Story:** As a developer, I want the main view component to be thin and focused on rendering, so that it is easy to understand and maintain.

#### Acceptance Criteria

1. THE Analysis_Workspace view SHALL be reduced to less than 200 lines
2. THE Analysis_Workspace view SHALL use `useAnalysisWorkspace` hook for all business logic
3. THE Analysis_Workspace view SHALL delegate modal rendering to modal components
4. THE Analysis_Workspace view SHALL delegate preview rendering to preview components
5. THE Analysis_Workspace view SHALL delegate sidebar rendering to sidebar component
6. THE Analysis_Workspace view SHALL contain no business logic or state management
7. THE Analysis_Workspace view SHALL only handle JSX rendering and prop passing
8. THE Analysis_Workspace view SHALL maintain the same component interface (props) as the original
9. THE Analysis_Workspace view SHALL render the same UI structure as the original
10. THE Analysis_Workspace view SHALL remain in `apps/web/features/editor/views/analysis-workspace.tsx`

### Requirement 10: Preserve Existing Functionality

**User Story:** As a user, I want all existing features to work exactly as before, so that the refactoring does not break my workflow.

#### Acceptance Criteria

1. WHEN a user opens the analysis workspace, THE Analysis_Workspace SHALL display the resume preview
2. WHEN a user clicks a section in the sidebar, THE Analysis_Workspace SHALL open the corresponding editor
3. WHEN a user edits personal info, THE Analysis_Workspace SHALL update the form state
4. WHEN a user adds an education entry, THE Analysis_Workspace SHALL add it to the form
5. WHEN a user removes an experience entry, THE Analysis_Workspace SHALL remove it from the form
6. WHEN a user clicks "Add Section", THE Analysis_Workspace SHALL open the content modal
7. WHEN a user clicks "Projects" in content modal, THE Analysis_Workspace SHALL open the project modal
8. WHEN a user fills out project form and clicks "Save Changes", THE Analysis_Workspace SHALL add the project to the form
9. WHEN a user clicks "Tailor to Job", THE Analysis_Workspace SHALL open the tailor modal
10. WHEN a user submits a new job description, THE Analysis_Workspace SHALL update the analysis result
11. WHEN a user clicks template name, THE Analysis_Workspace SHALL open the templates modal
12. WHEN a user selects a template, THE Analysis_Workspace SHALL update the active template and switch to structured preview
13. WHEN a user toggles between "Original" and "AI Template" preview modes, THE Analysis_Workspace SHALL switch preview modes
14. WHEN a user clicks zoom in/out buttons, THE Analysis_Workspace SHALL adjust the preview zoom
15. WHEN a user clicks "Download Source", THE Analysis_Workspace SHALL download the original resume file
16. WHEN preview mode is "uploaded", THE Analysis_Workspace SHALL disable zoom controls
17. WHEN a project form is submitted with empty name, THE Analysis_Workspace SHALL display validation error
18. WHEN a project form has 3 bullets, THE Analysis_Workspace SHALL prevent adding more bullets
19. WHEN a user clicks "Complete Bullet", THE Analysis_Workspace SHALL auto-complete the bullet text
20. WHEN analysis update is in progress, THE Analysis_Workspace SHALL display loading overlay

### Requirement 11: Maintain Test Compatibility

**User Story:** As a developer, I want all existing tests to pass after refactoring, so that I can verify the refactoring preserves behavior.

#### Acceptance Criteria

1. THE Analysis_Workspace SHALL pass all tests in `analysis-workspace-form-roundtrip.property.test.tsx`
2. THE Analysis_Workspace SHALL pass all tests in `analysis-workspace-section-activation.property.test.tsx`
3. THE Analysis_Workspace SHALL pass all tests in `analysis-workspace-tailor-prefill.property.test.tsx`
4. THE Analysis_Workspace SHALL pass all tests in `analysis-workspace-zoom.property.test.tsx`
5. THE Analysis_Workspace SHALL pass all tests in `analysis-workspace.bug1.test.tsx`
6. THE Analysis_Workspace SHALL pass all tests in `analysis-workspace.preservation.test.tsx`
7. THE Analysis_Workspace SHALL pass all tests in `analysis-workspace.property.test.tsx`
8. THE Analysis_Workspace SHALL pass all tests in `analysis-workspace.unit.test.tsx`
9. WHEN tests import `AnalysisWorkspace` component, THE Analysis_Workspace SHALL export the same component interface
10. WHEN tests render `AnalysisWorkspace` with props, THE Analysis_Workspace SHALL render without errors

### Requirement 12: Create Project Draft Model

**User Story:** As a developer, I want a TypeScript type for project draft state, so that project form state is type-safe.

#### Acceptance Criteria

1. THE Analysis_Workspace SHALL create `apps/web/features/editor/model/project-draft.ts`
2. THE Project_Draft model SHALL export `ProjectDraft` interface with fields: name, technologies, link, startDate, endDate, current, bulletInput, bullets
3. THE Project_Draft model SHALL export `emptyProjectDraft` constant with all fields initialized to empty values
4. THE Project_Draft model SHALL export `maxProjectBullets` constant set to 3
5. THE Project_Draft model SHALL define `name` as string
6. THE Project_Draft model SHALL define `technologies` as string
7. THE Project_Draft model SHALL define `link` as string
8. THE Project_Draft model SHALL define `startDate` as string
9. THE Project_Draft model SHALL define `endDate` as string
10. THE Project_Draft model SHALL define `current` as boolean
11. THE Project_Draft model SHALL define `bulletInput` as string
12. THE Project_Draft model SHALL define `bullets` as string array

### Requirement 13: Preserve Helper Functions

**User Story:** As a developer, I want utility functions extracted into a separate module, so that they are reusable and testable independently.

#### Acceptance Criteria

1. THE Analysis_Workspace SHALL create `apps/web/features/editor/utils/resume-helpers.ts`
2. THE Resume_Helpers SHALL export `humanizeFileName` function that removes file extension and normalizes spacing
3. THE Resume_Helpers SHALL export `isLikelyHeading` function that detects resume section headings
4. THE Resume_Helpers SHALL export `normalizeResumeBlocks` function that splits text into blocks
5. WHEN `humanizeFileName` is called with "my_resume.pdf", THE Resume_Helpers SHALL return "my resume"
6. WHEN `isLikelyHeading` is called with "EXPERIENCE", THE Resume_Helpers SHALL return true
7. WHEN `isLikelyHeading` is called with "regular text", THE Resume_Helpers SHALL return false
8. WHEN `normalizeResumeBlocks` is called with multi-line text, THE Resume_Helpers SHALL return array of line arrays

### Requirement 14: Preserve ParsedTextPreview Component

**User Story:** As a developer, I want the ParsedTextPreview component extracted into a separate file, so that it is reusable and maintainable.

#### Acceptance Criteria

1. THE Analysis_Workspace SHALL create `apps/web/features/editor/components/preview/parsed-text-preview.tsx`
2. THE Parsed_Text_Preview SHALL accept `text` prop as string
3. THE Parsed_Text_Preview SHALL use `normalizeResumeBlocks` to split text into blocks
4. THE Parsed_Text_Preview SHALL limit display to first 28 blocks
5. THE Parsed_Text_Preview SHALL render headings with special styling
6. THE Parsed_Text_Preview SHALL render first block as name header
7. THE Parsed_Text_Preview SHALL render remaining blocks as paragraphs

### Requirement 15: Maintain Code Style and Conventions

**User Story:** As a developer, I want refactored code to follow existing project conventions, so that the codebase remains consistent.

#### Acceptance Criteria

1. THE Analysis_Workspace SHALL use TypeScript for all new files
2. THE Analysis_Workspace SHALL use React functional components
3. THE Analysis_Workspace SHALL use React hooks for state management
4. THE Analysis_Workspace SHALL follow existing naming conventions (kebab-case for files, PascalCase for components, camelCase for functions)
5. THE Analysis_Workspace SHALL use existing icon components from `wizard-icons`
6. THE Analysis_Workspace SHALL use existing CSS custom properties for theming
7. THE Analysis_Workspace SHALL use existing utility classes for styling
8. THE Analysis_Workspace SHALL export components as named exports
9. THE Analysis_Workspace SHALL use `type` keyword for TypeScript type imports
10. THE Analysis_Workspace SHALL maintain existing prop interfaces

### Requirement 16: Document Architecture Changes

**User Story:** As a developer, I want documentation explaining the new architecture, so that I can understand and maintain the refactored code.

#### Acceptance Criteria

1. THE Analysis_Workspace SHALL create `apps/web/features/editor/README.md`
2. THE README SHALL document the MVVM architecture pattern
3. THE README SHALL explain the purpose of each ViewModel
4. THE README SHALL show the directory structure
5. THE README SHALL provide examples of how to use ViewModels
6. THE README SHALL explain the relationship between ViewModels and Views
7. THE README SHALL document the data flow through the architecture
8. THE README SHALL include a diagram showing component relationships
9. THE README SHALL explain how to add new features following the pattern
10. THE README SHALL document testing strategies for ViewModels and Views
