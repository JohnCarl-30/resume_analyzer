/**
 * Property-Based Test — Property 11: Section editor activation
 *
 * Feature: resume-editor-flow, Property 11: Section editor activation
 *
 * For any section ID in the editor panel, activating that section should render
 * the corresponding inline form editor for that section.
 *
 * Validates: Requirements 5.4
 */

import React from "react";
import { describe, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fc from "fast-check";
import type { ResumeForm } from "../../model/resume-form";
import type { ResumeTemplateVariant } from "../../../templates/model/template";

// ---------------------------------------------------------------------------
// Mock ResumeRenderer to avoid rendering complexity in jsdom
// ---------------------------------------------------------------------------
vi.mock("../../components/resume-renderer", () => ({
  ResumeRenderer: ({ variantId }: { variantId: ResumeTemplateVariant; form: ResumeForm }) => (
    <div data-testid="resume-renderer" data-variant-id={variantId} />
  ),
}));

// Mock TemplateRealPreview to avoid image loading issues in jsdom
vi.mock("../../../templates/components/template-preview", () => ({
  TemplateRealPreview: ({ variantId }: { variantId: string }) => (
    <div data-testid={`template-preview-${variantId}`}>{variantId}</div>
  ),
}));

// Import AFTER mocks are set up
import { AnalysisWorkspace } from "../analysis-workspace";

// ---------------------------------------------------------------------------
// Section → editor heading mapping
// ---------------------------------------------------------------------------
const SECTION_EDITOR_HEADINGS: Record<string, string> = {
  personal: "Personal Info",
  education: "Education",
  experience: "Work Experience",
  leadership: "Leadership",
  awards: "Awards & Honors",
};

// Section label as shown in the section list (used to find the clickable button)
const SECTION_BUTTON_LABELS: Record<string, string> = {
  personal: "Personal Info",
  education: "Education",
  experience: "Work Experience",
  leadership: "Leadership",
  awards: "Awards & Honors",
};

// ---------------------------------------------------------------------------
// Minimal default form
// ---------------------------------------------------------------------------
const defaultForm: ResumeForm = {
  personalInfo: { fullName: "Jane Doe", phone: "555-0100", email: "jane@example.com" },
  education: [],
  experience: [],
  leadership: [],
  awards: [],
  projects: [],
};

// ---------------------------------------------------------------------------
// Helper: render AnalysisWorkspace with the default form
// ---------------------------------------------------------------------------
function renderWorkspace() {
  return render(
    <AnalysisWorkspace
      targetRole="Software Engineer"
      selectedTemplateId="minimalist-grid"
      resumeFileName="resume.pdf"
      resumeSourceUrl={null}
      resumePreviewUrl={null}
      analysisResult={null}
      initialForm={defaultForm}
      onBack={vi.fn()}
    />,
  );
}

// ---------------------------------------------------------------------------
// Property 11: Section editor activation
// ---------------------------------------------------------------------------

describe(
  "Feature: resume-editor-flow, Property 11: Section editor activation",
  () => {
    /**
     * Property 11: For any section ID, clicking the section button renders
     * the corresponding inline form editor.
     *
     * Validates: Requirements 5.4
     */
    it(
      "renders the corresponding inline form editor when a section button is activated",
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.constantFrom("personal", "education", "experience", "leadership", "awards"),
            async (sectionId) => {
              const user = userEvent.setup();
              const { unmount } = renderWorkspace();

              const buttonLabel = SECTION_BUTTON_LABELS[sectionId];
              const editorHeading = SECTION_EDITOR_HEADINGS[sectionId];

              // Find the section button by its label text and click it
              // There may be multiple elements with the same text (icon + label button),
              // so we use getAllByText and click the first button element
              const buttons = screen.getAllByRole("button", { name: buttonLabel });
              await user.click(buttons[0]);

              // Assert the corresponding editor heading is now visible
              const headings = screen.getAllByText(editorHeading);
              const found = headings.length > 0;

              unmount();
              return found;
            },
          ),
          { numRuns: 100 },
        );
      },
      30000,
    );
  },
);
