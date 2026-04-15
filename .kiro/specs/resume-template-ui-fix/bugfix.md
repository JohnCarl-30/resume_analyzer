# Bugfix Requirements Document

## Introduction

Two UI bugs exist in the resume template editor workspace. First, clicking a template card in the "Switch Template" modal does not update the resume preview — the displayed layout stays on the previously selected template. Second, after uploading a resume and completing the onboarding wizard, the analysis result (extracted profile data and AI-generated suggestions based on the job description) does not appear in the workspace panel.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the user opens the "Switch Template" modal in the editor workspace and clicks a different template card THEN the resume preview continues to display the previously selected template layout without switching

1.2 WHEN the user clicks a template card in the "Switch Template" modal THEN the selected template card does not visually reflect the new selection (the checkmark/highlight stays on the old template)

1.3 WHEN the user completes the onboarding wizard (uploads a resume, enters a job description, selects a template, and submits) THEN the editor workspace displays no extracted profile data and no AI-generated suggestions in the right-hand analysis panel

1.4 WHEN the analysis result is returned from the API after upload THEN the suggestions list, match score, and extracted snapshot section remain empty or absent in the workspace

### Expected Behavior (Correct)

2.1 WHEN the user clicks a template card in the "Switch Template" modal THEN the system SHALL immediately update the resume preview to render the selected template layout

2.2 WHEN the user clicks a template card in the "Switch Template" modal THEN the system SHALL visually mark the newly selected card as active (checkmark/highlight) and deselect the previously selected card

2.3 WHEN the user completes the onboarding wizard and the API returns an analysis result THEN the system SHALL display the extracted profile data (name, skills, summary) and AI-generated suggestions in the right-hand analysis panel of the editor workspace

2.4 WHEN the analysis result contains suggestions THEN the system SHALL render each suggestion card with its title, detail, severity badge, and category in the suggestions list

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the user is already on the correct template and opens the "Switch Template" modal THEN the system SHALL CONTINUE TO show the current template as selected

3.2 WHEN the user closes the "Switch Template" modal without selecting a new template THEN the system SHALL CONTINUE TO display the previously active template unchanged

3.3 WHEN the analysis result contains no suggestions THEN the system SHALL CONTINUE TO display the "No immediate edits suggested" fallback message

3.4 WHEN the user uploads a resume without a job description that meets the minimum length THEN the system SHALL CONTINUE TO prevent form submission and show the appropriate validation state

3.5 WHEN the user switches templates THEN the system SHALL CONTINUE TO preserve all edited resume form data (personal info, education, experience, etc.)
