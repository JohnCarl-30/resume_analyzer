/**
 * Property-Based Test — Property 4: File confirmation display
 *
 * Feature: resume-editor-flow, Property 4: File confirmation display
 *
 * For any valid PDF file, after it is selected, the upload step should
 * display both the file's name and its formatted size.
 *
 * Validates: Requirements 2.6
 */

import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import * as fc from "fast-check";
import { formatFileSize } from "../../utils/wizard-utils";
import { StepDocumentUpload } from "../step-document-upload";

/**
 * Custom text normalizer that preserves whitespace exactly as-is,
 * preventing @testing-library from collapsing multiple spaces.
 */
const exactNormalizer = (text: string) => text;

describe(
  "Feature: resume-editor-flow, Property 4: File confirmation display",
  () => {
    afterEach(() => {
      cleanup();
    });

    /**
     * Property 4: File name and formatted size are rendered after valid selection
     *
     * **Validates: Requirements 2.6**
     */
    it(
      "renders file name and formatted size for any valid PDF file",
      () => {
        fc.assert(
          fc.property(
            fc.record({
              // Printable ASCII names without leading/trailing whitespace.
              // Spaces are allowed in the middle (e.g. "my resume.pdf").
              name: fc.stringMatching(/^[!-~]([!-~ ]*[!-~])?$/),
              size: fc.nat(10_485_760),
            }),
            ({ name, size }) => {
              // Create a File with the given name. The File constructor content
              // is empty (size = 0), so we pass a custom formatFileSize that
              // returns the formatted string for the generated size value.
              const resumeFile = new File([], name, { type: "application/pdf" });

              const formattedSize = formatFileSize(size);
              const customFormatFileSize = () => formattedSize;

              const { unmount } = render(
                <StepDocumentUpload
                  resumeInputId="test-input"
                  resumeInputRef={{ current: null }}
                  isDragActive={false}
                  setIsDragActive={vi.fn()}
                  handleDrop={vi.fn()}
                  handleFileChange={vi.fn()}
                  resumeFile={resumeFile}
                  formatFileSize={customFormatFileSize}
                  openFilePicker={vi.fn()}
                  uploadError=""
                  onNext={vi.fn()}
                  canContinue={true}
                />,
              );

              // File name must be visible — use exact normalizer to preserve
              // internal whitespace (e.g. "my  resume" with double space).
              const nameElements = screen.getAllByText(resumeFile.name, {
                normalizer: exactNormalizer,
              });
              expect(nameElements.length).toBeGreaterThan(0);

              // Formatted size must be visible (component appends " ready for analysis")
              const sizeElements = screen.getAllByText(
                `${formattedSize} ready for analysis`,
                { normalizer: exactNormalizer },
              );
              expect(sizeElements.length).toBeGreaterThan(0);

              unmount();
            },
          ),
          { numRuns: 100 },
        );
      },
    );
  },
);
