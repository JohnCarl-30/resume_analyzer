/**
 * Property-Based Test — Property 12: Form edit round-trip
 *
 * Feature: resume-editor-flow, Property 12: Form edit round-trip
 *
 * For any field update applied to the resume form via a section editor,
 * the resume preview should render the updated value.
 *
 * Validates: Requirements 5.5, 5.8
 *
 * Tag format: Feature: resume-editor-flow, Property 12: Form edit round-trip
 * Minimum 100 iterations
 */

import React from "react";
import { describe, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fc from "fast-check";
import type { ResumeForm } from "../../model/resume-form";
import type { ResumeTemplateVariant } from "../../../templates/model/template";

// ---------------------------------------------------------------------------
// Mock ResumeRenderer — capture the form prop it receives
// ---------------------------------------------------------------------------
let capturedForm: ResumeForm | null = null;

vi.mock("../../components/resume-renderer", () => ({
  ResumeRenderer: ({ form, variantId }: { form: ResumeForm; variantId: ResumeTemplateVariant }) => {
    capturedForm = form;
    return (
      <div
        data-testid="resume-renderer"
        data-variant-id={variantId}
        data-form={JSON.stringify(form)}
      >
        ResumeRenderer:{variantId}
      </div>
    );
  },
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
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates a non-empty string safe for use as a name/label value.
 * Avoids empty strings and strings that are only whitespace.
 */
const safeStringArb = fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0);

/**
 * Generates a valid full name string (printable, non-empty).
 */
const fullNameArb = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 20 }),
    fc.string({ minLength: 1, maxLength: 20 }),
  )
  .map(([first, last]) => `${first.trim() || "A"} ${last.trim() || "B"}`)
  .filter((name) => name.trim().length > 0);

// ---------------------------------------------------------------------------
// Minimal analysis result with extractedProfile to force "structured" preview mode
// ---------------------------------------------------------------------------
const minimalAnalysisResult = {
  id: "test-roundtrip",
  targetRole: "Software Engineer",
  score: 72,
  metricsFound: 0,
  matchedKeywords: [],
  missingKeywords: [],
  suggestions: [],
  generatedAt: new Date().toISOString(),
  extractedProfile: {
    fullName: "Original Name",
    email: "original@example.com",
    phone: "555-0000",
    summary: "",
    skills: [],
    education: [],
    experience: [],
    leadership: [],
    projects: [],
    awards: [],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildInitialForm(overrides: Partial<ResumeForm["personalInfo"]> = {}): ResumeForm {
  return {
    personalInfo: {
      fullName: "Original Name",
      phone: "555-0000",
      email: "original@example.com",
      ...overrides,
    },
    education: [],
    experience: [],
    leadership: [],
    awards: [],
    projects: [],
  };
}

function renderWorkspace(initialForm: ResumeForm) {
  return render(
    <AnalysisWorkspace
      targetRole="Software Engineer"
      selectedTemplateId="minimalist-grid"
      resumeFileName="resume.pdf"
      resumeSourceUrl={null}
      resumePreviewUrl={null}
      analysisResult={minimalAnalysisResult}
      initialForm={initialForm}
      onBack={vi.fn()}
    />,
  );
}

// ---------------------------------------------------------------------------
// Property 12: Form edit round-trip
// ---------------------------------------------------------------------------

describe(
  "Feature: resume-editor-flow, Property 12: Form edit round-trip",
  () => {
    beforeEach(() => {
      capturedForm = null;
    });

    /**
     * **Validates: Requirements 5.5, 5.8**
     *
     * For any generated full name value, editing the Full Name field in the
     * Personal Info editor causes ResumeRenderer to receive the updated value.
     *
     * Strategy:
     * 1. Render AnalysisWorkspace in structured preview mode (no resumePreviewUrl)
     * 2. Click "Personal Info" to open the inline editor
     * 3. Clear the Full Name input and type the generated value
     * 4. Assert ResumeRenderer's form prop reflects the new full name
     */
    it(
      "ResumeRenderer receives updated fullName after editing the Personal Info form",
      async () => {
        await fc.assert(
          fc.asyncProperty(fullNameArb, async (generatedName) => {
            const user = userEvent.setup();
            const initialForm = buildInitialForm({ fullName: "Original Name" });
            const { unmount, container } = renderWorkspace(initialForm);

            // Step 1: Open the Personal Info editor by clicking the section button
            const personalInfoButtons = container.querySelectorAll("button");
            const personalInfoBtn = Array.from(personalInfoButtons).find(
              (btn) => btn.textContent?.trim() === "Personal Info",
            );
            if (!personalInfoBtn) {
              unmount();
              return false;
            }
            await user.click(personalInfoBtn);

            // Step 2: Find the Full Name input scoped to this container
            const fullNameInput = container.querySelector<HTMLInputElement>(
              'input[placeholder="John Doe"]',
            );
            if (!fullNameInput) {
              unmount();
              return false;
            }

            // Step 3: Fire a change event with the generated name directly
            // (avoids userEvent.type special-character parsing issues)
            fireEvent.change(fullNameInput, { target: { value: generatedName } });

            // Step 4: Assert ResumeRenderer received the updated form
            const renderer = container.querySelector("[data-testid='resume-renderer']");
            if (!renderer) {
              unmount();
              return false;
            }
            const formData = JSON.parse(renderer.getAttribute("data-form") ?? "{}") as ResumeForm;

            const roundTripOk = formData.personalInfo.fullName === generatedName;

            unmount();
            return roundTripOk;
          }),
          { numRuns: 100 },
        );
      },
    );

    /**
     * **Validates: Requirements 5.5, 5.8**
     *
     * For any generated safe string used as a phone number, editing the Phone
     * Number field in the Personal Info editor causes ResumeRenderer to receive
     * the updated value.
     */
    it(
      "ResumeRenderer receives updated phone after editing the Personal Info form",
      async () => {
        await fc.assert(
          fc.asyncProperty(safeStringArb, async (generatedPhone) => {
            const user = userEvent.setup();
            const initialForm = buildInitialForm({ phone: "000-0000" });
            const { unmount, container } = renderWorkspace(initialForm);

            // Open Personal Info editor
            const personalInfoButtons = container.querySelectorAll("button");
            const personalInfoBtn = Array.from(personalInfoButtons).find(
              (btn) => btn.textContent?.trim() === "Personal Info",
            );
            if (!personalInfoBtn) {
              unmount();
              return false;
            }
            await user.click(personalInfoBtn);

            // Find the Phone Number input scoped to this container
            const phoneInput = container.querySelector<HTMLInputElement>(
              'input[placeholder="+1 234 567 890"]',
            );
            if (!phoneInput) {
              unmount();
              return false;
            }

            // Fire a change event with the generated phone directly
            fireEvent.change(phoneInput, { target: { value: generatedPhone } });

            // Assert ResumeRenderer received the updated form
            const renderer = container.querySelector("[data-testid='resume-renderer']");
            if (!renderer) {
              unmount();
              return false;
            }
            const formData = JSON.parse(renderer.getAttribute("data-form") ?? "{}") as ResumeForm;

            const roundTripOk = formData.personalInfo.phone === generatedPhone;

            unmount();
            return roundTripOk;
          }),
          { numRuns: 100 },
        );
      },
    );
  },
);
