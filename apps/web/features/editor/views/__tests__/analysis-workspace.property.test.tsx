/**
 * Property-Based Test — Property 10: Editor sections completeness
 *
 * Feature: resume-editor-flow, Property 10: Editor sections completeness
 *
 * For any resume form, the editor panel should list all five standard sections:
 * Personal Info, Education, Work Experience, Leadership, and Awards.
 *
 * Validates: Requirements 5.3
 */

import React from "react";
import { describe, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
// Arbitraries for ResumeForm fields
// ---------------------------------------------------------------------------

const personalInfoArb = fc.record({
  fullName: fc.string({ maxLength: 60 }),
  phone: fc.string({ maxLength: 20 }),
  email: fc.string({ maxLength: 50 }),
});

const educationEntryArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  institution: fc.string({ maxLength: 80 }),
  degree: fc.string({ maxLength: 80 }),
  location: fc.string({ maxLength: 80 }),
  dateRange: fc.string({ maxLength: 40 }),
});

const experienceEntryArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  role: fc.string({ maxLength: 80 }),
  location: fc.string({ maxLength: 80 }),
  dateRange: fc.string({ maxLength: 40 }),
});

const leadershipEntryArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  role: fc.string({ maxLength: 80 }),
  organization: fc.string({ maxLength: 80 }),
  location: fc.string({ maxLength: 80 }),
  dateRange: fc.string({ maxLength: 40 }),
});

const resumeFormArb = fc.record({
  personalInfo: personalInfoArb,
  education: fc.array(educationEntryArb, { maxLength: 5 }),
  experience: fc.array(experienceEntryArb, { maxLength: 5 }),
  leadership: fc.array(leadershipEntryArb, { maxLength: 5 }),
  awards: fc.array(fc.string({ maxLength: 100 }), { maxLength: 5 }),
  // Keep projects empty so the editor panel only shows the five standard sections
  projects: fc.constant([] as ResumeForm["projects"]),
});

// ---------------------------------------------------------------------------
// The five standard section labels that must always appear in the editor panel
// ---------------------------------------------------------------------------
const REQUIRED_SECTIONS = [
  "Personal Info",
  "Education",
  "Work Experience",
  "Leadership",
  "Awards & Honors",
] as const;

// ---------------------------------------------------------------------------
// Helper: render AnalysisWorkspace with a given form and no analysis result
// ---------------------------------------------------------------------------
function renderWorkspaceWithForm(form: ResumeForm) {
  return render(
    <AnalysisWorkspace
      targetRole="Software Engineer"
      selectedTemplateId="minimalist-grid"
      resumeFileName="resume.pdf"
      resumeSourceUrl={null}
      resumePreviewUrl={null}
      analysisResult={null}
      initialForm={form}
      onBack={vi.fn()}
    />,
  );
}

// ---------------------------------------------------------------------------
// Property 10: Editor sections completeness
// ---------------------------------------------------------------------------

describe(
  "Feature: resume-editor-flow, Property 10: Editor sections completeness",
  () => {
    /**
     * Property 10: For any resume form, all five standard sections are listed
     * in the editor panel.
     *
     * Validates: Requirements 5.3
     */
    it(
      "lists all five standard sections in the editor panel for any resume form",
      () => {
        fc.assert(
          fc.property(resumeFormArb, (form) => {
            const container = document.createElement("div");
            document.body.appendChild(container);

            const { unmount } = renderWorkspaceWithForm(form);

            // Assert each required section label is visible in the document
            for (const sectionLabel of REQUIRED_SECTIONS) {
              const elements = screen.getAllByText(sectionLabel);
              if (elements.length === 0) {
                unmount();
                document.body.removeChild(container);
                return false;
              }
            }

            unmount();
            document.body.removeChild(container);
            return true;
          }),
          { numRuns: 100 },
        );
      },
    );
  },
);
