# Requirements Document

## Introduction

This feature redesigns the onboarding wizard and editor workspace of the resume builder app into a streamlined, five-step flow. The new flow guides the user from pasting a job description and uploading a PDF resume, through template selection, to an AI-powered improvement suggestions panel alongside a live resume preview with a left-side editor panel. The redesign replaces the existing three-step wizard (target role → document upload → template selection) and the separate analysis workspace with a unified, cohesive experience.

## Glossary

- **Wizard**: The multi-step onboarding flow that collects user inputs before entering the editor workspace.
- **Job_Description_Input**: The text area where the user pastes the target job description.
- **Resume_Upload**: The file upload control that accepts a PDF resume.
- **Template_Picker**: The step where the user selects a resume layout template.
- **Template**: A named visual layout variant used to render the resume (e.g., "Minimalist Grid", "Harvard Classic").
- **Analysis_Engine**: The backend service that parses the uploaded resume, scores it against the job description, and produces improvement suggestions.
- **Suggestions_Panel**: The right-side panel in the editor workspace that displays AI-generated improvement suggestions.
- **Editor_Panel**: The left-side panel in the editor workspace where the user edits resume sections and adds additional content.
- **Resume_Preview**: The center area of the editor workspace that renders the resume using the selected template.
- **Workspace**: The full-screen editor view composed of the Editor_Panel, Resume_Preview, and Suggestions_Panel.
- **Section**: A named block of resume content (e.g., Personal Info, Education, Work Experience, Leadership, Awards, Projects).

---

## Requirements

### Requirement 1: Job Description Input Step

**User Story:** As a job seeker, I want to paste a job description as the first step, so that the entire flow is tailored to the specific role I am targeting.

#### Acceptance Criteria

1. THE Wizard SHALL display the Job_Description_Input as the first step of the onboarding flow.
2. THE Job_Description_Input SHALL accept plain text of at least 30 characters before the user can proceed.
3. WHEN the user submits fewer than 30 characters in the Job_Description_Input, THE Wizard SHALL display an inline validation error message.
4. WHEN the user clears the Job_Description_Input, THE Wizard SHALL reset the character count and disable the continue button.
5. THE Wizard SHALL display a live character count below the Job_Description_Input.

---

### Requirement 2: Resume PDF Upload Step

**User Story:** As a job seeker, I want to upload my PDF resume as the second step, so that the system can parse and analyze my existing content.

#### Acceptance Criteria

1. THE Wizard SHALL display the Resume_Upload control as the second step, after the job description is submitted.
2. THE Resume_Upload SHALL accept files with the `.pdf` extension only, up to 10 MB in size.
3. WHEN the user selects a non-PDF file, THE Resume_Upload SHALL display an error message stating the accepted file type.
4. WHEN the user selects a file exceeding 10 MB, THE Resume_Upload SHALL display an error message stating the size limit.
5. THE Resume_Upload SHALL support drag-and-drop in addition to file browser selection.
6. WHEN a valid PDF file is selected, THE Resume_Upload SHALL display the file name and file size as confirmation.
7. WHEN a valid PDF file is selected, THE Wizard SHALL enable the continue button for the next step.

---

### Requirement 3: Template Selection Step

**User Story:** As a job seeker, I want to choose a resume template as the third step, so that my final resume uses the layout I prefer.

#### Acceptance Criteria

1. THE Wizard SHALL display the Template_Picker as the third step, after the resume is uploaded.
2. THE Template_Picker SHALL display all available Template options as visual cards with a live preview thumbnail.
3. WHEN the user clicks a Template card, THE Template_Picker SHALL mark that Template as selected with a visible highlight.
4. THE Template_Picker SHALL display the name and ATS-friendliness label for each Template card.
5. THE Wizard SHALL persist the selected Template throughout the remainder of the flow.
6. WHEN the user proceeds from the Template_Picker, THE Wizard SHALL use the selected Template to render the Resume_Preview in the Workspace.
7. IF no Template has been explicitly selected, THEN THE Wizard SHALL apply the default Template ("minimalist-grid") before proceeding.

---

### Requirement 4: AI-Powered Improvement Suggestions

**User Story:** As a job seeker, I want to see AI-generated improvement suggestions after template selection, so that I know exactly what to fix to better match the job description.

#### Acceptance Criteria

1. WHEN the user confirms the selected Template, THE Analysis_Engine SHALL analyze the uploaded resume against the job description and produce a list of improvement suggestions.
2. THE Suggestions_Panel SHALL display each suggestion with a title, detail text, and a severity badge (Critical, Impact, or Edit).
3. THE Suggestions_Panel SHALL display a summary count of total suggestions and the number of critical suggestions.
4. WHEN the Analysis_Engine is processing, THE Workspace SHALL display a loading indicator and prevent user interaction with the Suggestions_Panel.
5. IF the Analysis_Engine returns an error, THEN THE Workspace SHALL display a descriptive error message and offer a retry action.
6. THE Suggestions_Panel SHALL display the matched keyword count and missing keyword count from the job description.

---

### Requirement 5: Resume Preview with Left-Side Editor Panel

**User Story:** As a job seeker, I want to see a live resume preview alongside an editor panel on the left, so that I can make changes and immediately see how they affect the final output.

#### Acceptance Criteria

1. THE Workspace SHALL render the Resume_Preview using the Template selected in the Template_Picker.
2. THE Editor_Panel SHALL be displayed on the left side of the Workspace.
3. THE Editor_Panel SHALL list all resume Sections (Personal Info, Education, Work Experience, Leadership, Awards) as navigable items.
4. WHEN the user selects a Section in the Editor_Panel, THE Editor_Panel SHALL display the inline form editor for that Section.
5. WHEN the user saves changes in a Section editor, THE Resume_Preview SHALL update to reflect the new content without a full page reload.
6. THE Editor_Panel SHALL provide an "Add Section" button that opens a modal for adding optional content (Projects, Summary, Skills, Certifications, etc.).
7. THE Resume_Preview SHALL support zoom controls to increase or decrease the preview scale.
8. WHILE the Resume_Preview is displaying the structured template view, THE Resume_Preview SHALL re-render in real time as the user edits content in the Editor_Panel.

---

### Requirement 6: Wizard Step Navigation and Progress

**User Story:** As a job seeker, I want clear step indicators and the ability to go back, so that I always know where I am in the flow and can correct earlier inputs.

#### Acceptance Criteria

1. THE Wizard SHALL display a step indicator showing the current step number and total step count (e.g., "STEP 2 OF 4").
2. THE Wizard SHALL provide a back navigation control on every step after the first.
3. WHEN the user navigates back from the Workspace to the Wizard, THE Wizard SHALL restore the previously entered job description, uploaded file reference, and selected Template.
4. WHEN the user navigates back from step N to step N-1, THE Wizard SHALL preserve all previously entered values for step N.
5. THE Wizard SHALL disable the continue button on each step until all required inputs for that step are valid.

---

### Requirement 7: Resume Download

**User Story:** As a job seeker, I want to download my resume from the Workspace, so that I can use the final version for job applications.

#### Acceptance Criteria

1. THE Workspace SHALL provide a download button that is visible at all times in the header.
2. WHEN the user clicks the download button and a source file URL is available, THE Workspace SHALL initiate a download of the original uploaded resume file.
3. WHEN no source file URL is available, THE Workspace SHALL display the download button in a disabled state with an "Export PDF" label.

---

### Requirement 8: Tailor Resume to a New Job Description

**User Story:** As a job seeker, I want to re-run the analysis against a different job description from within the Workspace, so that I can optimize my resume for multiple roles without restarting the flow.

#### Acceptance Criteria

1. THE Workspace SHALL provide a "Tailor to Job" action in the header.
2. WHEN the user activates the "Tailor to Job" action, THE Workspace SHALL open a modal containing a Job_Description_Input pre-filled with the current job description.
3. WHEN the user submits a new job description via the modal, THE Analysis_Engine SHALL re-analyze the resume and update the Suggestions_Panel with new results.
4. WHILE the re-analysis is in progress, THE Workspace SHALL display a full-screen loading overlay.
5. IF the re-analysis fails, THEN THE Workspace SHALL display an error message inside the modal and preserve the previous analysis results.
