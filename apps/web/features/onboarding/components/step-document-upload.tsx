import React from "react";
import { UploadIcon, ArrowRightIcon } from "./wizard-icons";

interface StepDocumentUploadProps {
  resumeInputId: string;
  resumeInputRef: React.RefObject<HTMLInputElement | null>;
  isDragActive: boolean;
  setIsDragActive: (active: boolean) => void;
  handleDrop: (event: React.DragEvent<HTMLLabelElement>) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resumeFile: File | null;
  formatFileSize: (size: number) => string;
  openFilePicker: () => void;
  uploadError: string;
  onNext: () => void;
  canContinue: boolean;
}

export function StepDocumentUpload({
  resumeInputId,
  resumeInputRef,
  isDragActive,
  setIsDragActive,
  handleDrop,
  handleFileChange,
  resumeFile,
  formatFileSize,
  openFilePicker,
  uploadError,
  onNext,
  canContinue,
}: StepDocumentUploadProps) {
  return (
    <section key="step-2" className="section-reveal flex flex-1 flex-col px-5 py-8 sm:px-8 lg:px-12">
      <div className="w-full">
        <div className="space-y-3 text-left sm:text-center">
          <div className="sm:flex sm:justify-center">
            <span className="step-pill">STEP 3 OF 5</span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-[color:var(--page-text)]">
            Document Upload
          </h1>
          <p className="max-w-[42rem] text-sm leading-6 text-[color:var(--page-muted)] sm:mx-auto">
            Upload your current resume so the system can parse and analyze your existing content.
          </p>
        </div>

        <div className="mt-9 grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <div>
            <p className="mb-3 text-sm font-semibold text-[color:var(--page-text)]">
              Current Resume
            </p>
            <label
              htmlFor={resumeInputId}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={handleDrop}
              className={`flex min-h-[18rem] cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed px-6 py-8 text-center transition ${
                isDragActive
                  ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]"
                  : "border-[color:var(--page-line-strong)] bg-[color:var(--page-bg-strong)]"
              }`}
            >
              <input
                id={resumeInputId}
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                onChange={handleFileChange}
              />

              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--page-line)] bg-white text-[color:var(--page-muted)] shadow-sm">
                <UploadIcon />
              </div>

              {resumeFile ? (
                <div className="mt-5 space-y-2">
                  <p className="text-lg font-semibold text-[color:var(--page-text)]">
                    {resumeFile.name}
                  </p>
                  <p className="text-sm text-[color:var(--page-muted)]">
                    {formatFileSize(resumeFile.size)} ready for analysis
                  </p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      openFilePicker();
                    }}
                    className="mt-2 inline-flex items-center justify-center rounded-full border border-[color:var(--page-line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                  >
                    Replace file
                  </button>
                </div>
              ) : (
                <div className="mt-5 space-y-2">
                  <p className="text-lg font-semibold text-[color:var(--page-text)]">
                    Drag &amp; drop your resume here
                  </p>
                  <p className="text-sm text-[color:var(--page-muted)]">
                    Supports PDF, DOCX up to 10 MB
                  </p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      openFilePicker();
                    }}
                    className="mt-2 inline-flex items-center justify-center rounded-full border border-[color:var(--page-line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                  >
                    Browse files
                  </button>
                </div>
              )}
            </label>

            <p className="mt-3 min-h-6 text-sm text-[#e16f62]">
              {uploadError}
            </p>
          </div>

          <aside className="rounded-[20px] border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] p-5 shadow-[0_10px_26px_rgba(0,0,0,0.03)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
              Flow Summary
            </p>
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-sm text-[color:var(--page-muted)]">Resume status</p>
                <p className="mt-1 text-base font-semibold text-[color:var(--page-text)]">
                  {resumeFile ? "Ready to compare" : "No file selected"}
                </p>
              </div>
              <div className="rounded-[16px] border border-[color:var(--page-line)] bg-white px-4 py-4">
                <p className="text-sm font-semibold text-[color:var(--page-text)]">
                  Next up
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--page-muted)]">
                  Once your resume is ready, we&apos;ll move to template selection for
                  the final output.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="mt-auto border-t border-[color:var(--page-line)] pt-6">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-[color:var(--page-muted)]">
            {resumeFile
              ? `Selected file: ${resumeFile.name}`
              : "Add a PDF or DOCX resume to continue."}
          </p>
          <button
            type="button"
            onClick={onNext}
            disabled={!canContinue}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,107,255,0.22)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:bg-[#c4ccf0] disabled:shadow-none"
          >
            Continue to Templates
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
