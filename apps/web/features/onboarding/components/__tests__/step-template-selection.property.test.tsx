/**
 * Property-Based Test — Property 5: Template cards completeness
 *
 * Feature: resume-editor-flow, Property 5: Template cards completeness
 *
 * For any array of template definitions, the template picker should render
 * exactly one card per template, each containing the template's name and
 * ATS label.
 *
 * Note: StepTemplateSelection renders sampleTemplates directly (not via props),
 * so this test verifies that each template in sampleTemplates has exactly one
 * corresponding card showing its name and ATS label.
 *
 * Validates: Requirements 3.2, 3.4
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import * as fc from "fast-check";
import { sampleTemplates, type ResumeTemplate } from "../../../templates/model/template";
import { StepTemplateSelection } from "../step-template-selection";

// Arbitrary that picks a valid template ID from sampleTemplates
const templateIdArbitrary = fc.constantFrom(...sampleTemplates.map((t) => t.id));

/**
 * Renders StepTemplateSelection with the given selectedTemplateId.
 */
function renderStep(selectedTemplateId: ResumeTemplate["id"]) {
  render(
    <StepTemplateSelection
      selectedTemplateId={selectedTemplateId}
      setSelectedTemplateId={vi.fn()}
      onNext={vi.fn()}
    />,
  );
}

describe(
  "Feature: resume-editor-flow, Property 5: Template cards completeness",
  () => {
    /**
     * Property 5: Exactly one card per template, each showing name and ATS label
     *
     * Validates: Requirements 3.2, 3.4
     */
    it(
      "renders exactly one card per template in sampleTemplates, each showing name and ATS label",
      () => {
        fc.assert(
          fc.property(templateIdArbitrary, (selectedTemplateId) => {
            renderStep(selectedTemplateId);

            // Each template in sampleTemplates should have exactly one card button
            for (const template of sampleTemplates) {
              // Find all buttons that contain the template name
              const allButtons = screen.getAllByRole("button");
              const templateButtons = allButtons.filter((btn) =>
                btn.textContent?.includes(template.name),
              );

              // Exactly one card button per template
              expect(templateButtons).toHaveLength(1);

              const card = templateButtons[0];

              // Card shows the template name
              expect(card).toHaveTextContent(template.name);

              // Card shows the ATS label (falls back to "ATS-Friendly" if not set)
              const atsLabel = template.atsLabel ?? "ATS-Friendly";
              expect(card).toHaveTextContent(atsLabel);
            }

            // Total number of template card buttons equals sampleTemplates.length
            const allButtons = screen.getAllByRole("button");
            // Filter to template card buttons (exclude the "Generate Analysis" button)
            const templateCardButtons = allButtons.filter((btn) =>
              sampleTemplates.some((t) => btn.textContent?.includes(t.name)),
            );
            expect(templateCardButtons).toHaveLength(sampleTemplates.length);

            // Cleanup between iterations
            document.body.innerHTML = "";
          }),
          { numRuns: 100 },
        );
      },
    );
  },
);
