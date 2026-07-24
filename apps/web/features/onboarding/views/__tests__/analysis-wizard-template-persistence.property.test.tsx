/**
 * Property-Based Test — Property 6: Template selection persistence
 *
 * Feature: resume-editor-flow, Property 6: Template selection persistence
 *
 * For any template selected in the template picker, that template's ID should
 * be the one used to render the resume preview in the workspace, and should be
 * restored when navigating back from the workspace to the wizard.
 *
 * Since testing the full wizard flow (including API calls) is complex, this
 * test focuses on the StepTemplateSelection component's selection behavior:
 *
 * 1. Render StepTemplateSelection with a given selectedTemplateId
 * 2. Assert the selected template card is exposed as pressed
 * 3. Assert the selected card shows the selected template's name and ATS label
 *
 * Validates: Requirements 3.3, 3.5, 3.6, 5.1, 6.3
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, within } from "@testing-library/react";
import * as fc from "fast-check";
import { StepTemplateSelection } from "../../components/step-template-selection";
import { sampleTemplates } from "../../../templates/model/template";

describe(
  "Feature: resume-editor-flow, Property 6: Template selection persistence",
  () => {
    /**
     * Property 6: Selected template ID is preserved and reflected in the UI
     *
     * Validates: Requirements 3.3, 3.5, 3.6, 5.1, 6.3
     */
    it(
      "reflects the selected template ID in the selected template card",
      () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...sampleTemplates).map((t) => t.id),
            (selectedTemplateId) => {
              const iterContainer = document.createElement("div");
              document.body.appendChild(iterContainer);

              const { unmount } = render(
                <StepTemplateSelection
                  selectedTemplateId={selectedTemplateId}
                  setSelectedTemplateId={vi.fn()}
                  useTemplateContent={false}
                  setUseTemplateContent={vi.fn()}
                  hasResumeFile={false}
                  onNext={vi.fn()}
                />,
                { container: iterContainer },
              );

              // Find the expected template definition
              const expectedTemplate = sampleTemplates.find(
                (t) => t.id === selectedTemplateId,
              );
              expect(expectedTemplate).toBeDefined();

              // Assert the selected template button is exposed as pressed.
              const selectedCard = iterContainer.querySelector("button[aria-pressed='true']");
              expect(selectedCard).toBeTruthy();

              // The selected card should contain the template's name
              expect(selectedCard!.textContent).toContain(expectedTemplate!.name);

              // Assert the selected card shows the scanner-friendly label.
              const selectionLabel = within(selectedCard as HTMLElement).getByText(
                expectedTemplate!.atsLabel ?? "Good for scanners",
                { exact: false },
              );
              expect(selectionLabel).toBeTruthy();

              unmount();
              document.body.removeChild(iterContainer);
            },
          ),
          { numRuns: 100 },
        );
      },
    );
  },
);
