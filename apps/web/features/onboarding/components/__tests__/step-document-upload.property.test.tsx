/**
 * Property-Based Test — Property 3: File acceptance rule
 *
 * Feature: resume-editor-flow, Property 3: File acceptance rule
 *
 * For any file object, the upload step should accept it (enable continue,
 * show confirmation) if and only if the file's MIME type is `application/pdf`
 * and its size is less than or equal to 10,485,760 bytes (10 MB). For any
 * file that fails either condition, an appropriate error message should be
 * displayed.
 *
 * Validates: Requirements 2.2, 2.3, 2.4, 2.7
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import { isSupportedFile, maxFileSize } from "../../utils/wizard-utils";
import { StepDocumentUpload } from "../step-document-upload";

const MAX_FILE_SIZE = 10_485_760; // 10 MB

/**
 * Derives the upload error message and canContinue flag from a file's
 * type and size — mirroring the validation logic in DeepFocusWizard.
 */
function deriveUploadState(type: string, size: number): { uploadError: string; canContinue: boolean } {
  // Build a minimal File-like object for isSupportedFile
  const mockFile = { type, size } as File;

  if (!isSupportedFile(mockFile)) {
    return { uploadError: "Please choose a PDF resume.", canContinue: false };
  }

  if (size > maxFileSize) {
    return { uploadError: "Your resume must be 10 MB or smaller.", canContinue: false };
  }

  return { uploadError: "", canContinue: true };
}

/**
 * Renders StepDocumentUpload with a mock file (or null) and the derived
 * uploadError / canContinue props.
 */
function renderStep(type: string, size: number) {
  const { uploadError, canContinue } = deriveUploadState(type, size);

  // Only pass a resumeFile when the file is valid so the component shows
  // the file confirmation UI (name + size).
  const resumeFile = canContinue
    ? new File([], "resume.pdf", { type })
    : null;

  render(
    <StepDocumentUpload
      resumeInputId="test-input"
      resumeInputRef={{ current: null }}
      isDragActive={false}
      setIsDragActive={vi.fn()}
      handleDrop={vi.fn()}
      handleFileChange={vi.fn()}
      resumeFile={resumeFile}
      formatFileSize={(bytes) => `${bytes} bytes`}
      openFilePicker={vi.fn()}
      uploadError={uploadError}
      onNext={vi.fn()}
      canContinue={canContinue}
    />,
  );

  return { uploadError, canContinue };
}

describe(
  "Feature: resume-editor-flow, Property 3: File acceptance rule",
  () => {
    /**
     * Property 3: File is accepted iff type === "application/pdf" && size <= 10_485_760
     *
     * Validates: Requirements 2.2, 2.3, 2.4, 2.7
     */
    it(
      "file is accepted iff type === 'application/pdf' && size <= 10_485_760",
      () => {
        fc.assert(
          fc.property(
            fc.record({ type: fc.string(), size: fc.nat() }),
            ({ type, size }) => {
              const expectedAccepted =
                type === "application/pdf" && size <= MAX_FILE_SIZE;

              const { canContinue, uploadError } = renderStep(type, size);

              // canContinue must match the acceptance rule exactly
              expect(canContinue).toBe(expectedAccepted);

              const continueButton = screen.getByRole("button", {
                name: /continue to templates/i,
              });

              if (expectedAccepted) {
                // Accepted: continue button enabled, no error shown
                expect(continueButton).not.toBeDisabled();
                expect(uploadError).toBe("");
              } else {
                // Rejected: continue button disabled, error message shown
                expect(continueButton).toBeDisabled();
                expect(uploadError).not.toBe("");

                // Verify the error message is rendered in the DOM
                const errorEl = screen.getByText(uploadError);
                expect(errorEl).toBeTruthy();
              }

              // Cleanup between iterations
              document.body.innerHTML = "";
            },
          ),
          { numRuns: 100 },
        );
      },
    );
  },
);
