"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useId, useRef, useState } from "react";

import { sampleTemplates } from "@/features/templates/model/template";

type WizardStep = 1 | 2 | 3;

const maxFileSize = 10 * 1024 * 1024;
const supportedExtensions = [".pdf", ".doc", ".docx"];

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(size >= 1024 * 1024 ? 1 : 2)} MB`;
}

function isSupportedFile(file: File) {
  const normalizedName = file.name.toLowerCase();

  return supportedExtensions.some((extension) => normalizedName.endsWith(extension));
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M11.75 4.25L6 10l5.75 5.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M8.25 4.25L14 10l-5.75 5.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M7 5.75V4.5A1.5 1.5 0 018.5 3h3A1.5 1.5 0 0113 4.5v1.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="3"
        y="5.75"
        width="14"
        height="10.75"
        rx="2.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
      <path
        d="M10 13.5V6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 8.5L10 6l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.75 13.25v1A1.75 1.75 0 006.5 16h7a1.75 1.75 0 001.75-1.75v-1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M5 10.25l3.2 3.2L15 6.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BrandMark() {
  return (
    <div className="flex h-5 w-5 items-end gap-[2px] text-[color:var(--page-text)]" aria-hidden>
      <span className="h-2.5 w-1.5 rounded-sm bg-current" />
      <span className="h-3.5 w-1.5 rounded-sm bg-current" />
      <span className="h-5 w-1.5 rounded-sm bg-current" />
    </div>
  );
}

function TemplatePreview({ variant }: { variant: (typeof sampleTemplates)[number]["previewVariant"] }) {
  if (variant === "minimalist-grid") {
    return (
      <div className="relative h-full w-full rounded-[12px] bg-[#f7f9fc] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.16)]">
        <div className="absolute -left-3 top-4 h-10 w-10 rounded-full border border-white/60 bg-[#d9e0ea]" />
        <div className="grid h-full grid-cols-[0.42fr_0.58fr] gap-3">
          <div className="space-y-2 rounded-[10px] bg-[#e8edf5] p-2.5">
            <div className="h-6 w-6 rounded-full bg-[#8797ab]" />
            <div className="h-1.5 w-4/5 rounded-full bg-[#9daabc]" />
            <div className="h-1.5 w-full rounded-full bg-[#bac4d2]" />
            <div className="h-1.5 w-3/4 rounded-full bg-[#bac4d2]" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-2 w-2/3 rounded-full bg-[#8a95ac]" />
            <div className="h-1.5 w-full rounded-full bg-[#d0d8e5]" />
            <div className="h-1.5 w-5/6 rounded-full bg-[#d0d8e5]" />
            <div className="mt-4 h-2 w-1/2 rounded-full bg-[#8a95ac]" />
            <div className="h-1.5 w-full rounded-full bg-[#d0d8e5]" />
            <div className="h-1.5 w-4/5 rounded-full bg-[#d0d8e5]" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "executive-clean") {
    return (
      <div className="h-full w-full rounded-[12px] bg-[#dae6e8] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.15)]">
        <div className="grid h-full grid-cols-[0.48fr_0.52fr] overflow-hidden rounded-[10px] bg-white">
          <div className="space-y-2 bg-[#6f8f95] px-3 py-3">
            <div className="h-2 w-2/3 rounded-full bg-white/55" />
            <div className="h-1.5 w-full rounded-full bg-white/35" />
            <div className="h-1.5 w-4/5 rounded-full bg-white/35" />
          </div>
          <div className="space-y-2 px-3 py-3">
            <div className="h-1.5 w-full rounded-full bg-[#d8dde6]" />
            <div className="h-1.5 w-5/6 rounded-full bg-[#d8dde6]" />
            <div className="mt-3 h-8 rounded-[8px] bg-[#d9e8ea]" />
            <div className="h-8 rounded-[8px] bg-[#d9e8ea]" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "standard-technical") {
    return (
      <div className="h-full w-full rounded-[12px] bg-[#32404b] p-3 shadow-[0_18px_34px_rgba(18,25,39,0.28)]">
        <div className="space-y-2 rounded-[10px] border border-white/8 bg-[#2c3842] p-3">
          <div className="h-1.5 w-3/5 rounded-full bg-white/35" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="h-14 rounded-[8px] bg-white/8" />
              <div className="h-14 rounded-[8px] bg-white/8" />
            </div>
            <div className="space-y-2">
              <div className="h-14 rounded-[8px] bg-white/8" />
              <div className="h-14 rounded-[8px] bg-white/8" />
            </div>
          </div>
          <div className="h-[3px] w-full rounded-full bg-[#ef7656]" />
        </div>
      </div>
    );
  }

  if (variant === "modern-hybrid") {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[12px] bg-[#dbe4df] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.14)]">
        <div className="w-[76%] rounded-[10px] bg-white p-3 shadow-[0_12px_26px_rgba(50,70,120,0.18)]">
          <div className="flex items-start gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#bfc8d1]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-2/5 rounded-full bg-[#7e8b9b]" />
              <div className="h-1.5 w-full rounded-full bg-[#d8dde7]" />
              <div className="h-1.5 w-4/5 rounded-full bg-[#d8dde7]" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-[0.42fr_0.58fr] gap-2.5">
            <div className="space-y-1.5">
              <div className="h-8 rounded-[8px] bg-[#eef1f6]" />
              <div className="h-8 rounded-[8px] bg-[#eef1f6]" />
            </div>
            <div className="space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-[#d8dde7]" />
              <div className="h-1.5 w-5/6 rounded-full bg-[#d8dde7]" />
              <div className="h-1.5 w-full rounded-full bg-[#d8dde7]" />
              <div className="h-1.5 w-4/5 rounded-full bg-[#d8dde7]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "academic-cv") {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[12px] bg-[#d9edf5] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.14)]">
        <div className="w-[80%] rounded-[8px] bg-white p-3 shadow-[0_12px_26px_rgba(50,70,120,0.16)]">
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="h-3 rounded-[4px] bg-[#eff4fa]" />
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-[#d8dde7]" />
            <div className="h-1.5 w-11/12 rounded-full bg-[#d8dde7]" />
            <div className="h-1.5 w-10/12 rounded-full bg-[#d8dde7]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-[12px] bg-[linear-gradient(145deg,#f29d82_0%,#55637c_78%)] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.18)]">
      <div className="flex h-full w-[44%] flex-col items-center justify-between rounded-[12px] bg-[#404c63] px-3 py-4 text-center text-white shadow-[0_12px_28px_rgba(18,25,39,0.28)]">
        <div className="space-y-1">
          <div className="h-1.5 w-12 rounded-full bg-white/60" />
          <div className="h-1.5 w-8 rounded-full bg-white/35" />
        </div>
        <div className="space-y-2">
          <div className="mx-auto h-1.5 w-16 rounded-full bg-white/50" />
          <div className="mx-auto h-1.5 w-12 rounded-full bg-white/35" />
          <div className="mx-auto h-1.5 w-14 rounded-full bg-white/35" />
        </div>
        <div className="h-4 w-12 rounded-full bg-[#ef8a69]" />
      </div>
    </div>
  );
}

export function DeepFocusWizard() {
  const resumeInputId = useId();
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<WizardStep>(1);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(sampleTemplates[0]?.id ?? "");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [analysisReady, setAnalysisReady] = useState(false);

  const selectedTemplate =
    sampleTemplates.find((template) => template.id === selectedTemplateId) ?? sampleTemplates[0];
  const canContinueFromRole = targetRole.trim().length > 0;
  const canContinueFromUpload = Boolean(resumeFile) && jobDescription.trim().length > 0;

  function handleValidatedFile(fileList: FileList | null) {
    const candidateFile = fileList?.[0];

    if (!candidateFile) {
      return;
    }

    if (!isSupportedFile(candidateFile)) {
      setUploadError("Please choose a PDF, DOC, or DOCX resume.");
      return;
    }

    if (candidateFile.size > maxFileSize) {
      setUploadError("Your resume must be 10 MB or smaller.");
      return;
    }

    setUploadError("");
    setResumeFile(candidateFile);
    setAnalysisReady(false);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    handleValidatedFile(event.target.files);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragActive(false);
    handleValidatedFile(event.dataTransfer.files);
  }

  function handleNext() {
    setAnalysisReady(false);

    if (step === 1 && canContinueFromRole) {
      setStep(2);
      return;
    }

    if (step === 2 && canContinueFromUpload) {
      setStep(3);
      return;
    }

    if (step === 3) {
      setAnalysisReady(true);
    }
  }

  function handleBack() {
    setAnalysisReady(false);

    if (step === 1) {
      return;
    }

    setStep((currentStep) => (currentStep === 3 ? 2 : 1));
  }

  function openFilePicker() {
    resumeInputRef.current?.click();
  }

  const backLabel = step === 3 ? "Back to Upload" : "Back";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[color:var(--page-bg)] text-[color:var(--page-text)]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_1px_1px,rgba(79,107,255,0.14)_1px,transparent_0)] [background-size:24px_24px]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(79,107,255,0.16),transparent_68%)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1160px] px-2 py-2 sm:px-4 sm:py-4">
        <div className="flex min-h-[calc(100svh-1rem)] w-full flex-col overflow-hidden rounded-[22px] border-[4px] border-[color:var(--brand)] bg-[color:var(--page-surface)] shadow-[var(--shadow-lg)] sm:min-h-[calc(100svh-2rem)] sm:rounded-[28px]">
          <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-[color:var(--page-line)] px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="inline-flex items-center gap-2 justify-self-start rounded-full px-2 py-1 text-sm font-medium text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)] disabled:cursor-default disabled:opacity-60 disabled:hover:text-[color:var(--page-muted)]"
            >
              <ArrowLeftIcon />
              {backLabel}
            </button>

            <div className="flex items-center gap-2 justify-self-center text-sm font-semibold text-[color:var(--page-text)]">
              <BrandMark />
              Deep Focus
            </div>

            <div className="justify-self-end">
              {step > 1 ? <span className="step-pill">{`STEP ${step} OF 3`}</span> : null}
            </div>
          </header>

          <div className="flex flex-1 flex-col">
            {step === 1 ? (
              <div className="grid flex-1 place-items-center px-5 py-10 sm:px-10">
                <section className="section-reveal w-full max-w-[22rem] rounded-[28px] border border-[color:var(--page-line)] bg-white p-6 text-center shadow-[var(--shadow-md)] sm:p-7">
                  <div className="h-1.5 w-20 rounded-full bg-[color:var(--brand-strong)]" />

                  <div className="mt-7 space-y-3">
                    <h1 className="font-display text-4xl font-semibold tracking-tight text-[color:var(--page-text)]">
                      What role are you targeting?
                    </h1>
                    <p className="text-sm leading-6 text-[color:var(--page-muted)]">
                      We&apos;ll tailor your resume analysis to this specific position.
                    </p>
                  </div>

                  <label
                    className="mt-7 flex items-center gap-3 rounded-[16px] border border-[color:var(--page-line)] bg-[#f8faff] px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition focus-within:border-[color:var(--brand)] focus-within:bg-white"
                    htmlFor="target-role"
                  >
                    <span className="text-[color:var(--page-muted)]">
                      <BriefcaseIcon />
                    </span>
                    <input
                      id="target-role"
                      value={targetRole}
                      onChange={(event) => {
                        setTargetRole(event.target.value);
                        setAnalysisReady(false);
                      }}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full border-none bg-transparent text-[color:var(--page-text)] outline-none placeholder:text-[#b4bfd3]"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canContinueFromRole}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,107,255,0.24)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:bg-[#c4ccf0] disabled:shadow-none"
                  >
                    Next: Job Details
                    <ArrowRightIcon />
                  </button>
                </section>
              </div>
            ) : null}

            {step === 2 ? (
              <section key="step-2" className="section-reveal flex flex-1 flex-col px-5 py-8 sm:px-8 lg:px-12">
                <div className="mx-auto w-full max-w-[920px]">
                  <div className="space-y-3 text-left sm:text-center">
                    <div className="sm:flex sm:justify-center">
                      <span className="step-pill">STEP 2 OF 3</span>
                    </div>
                    <h1 className="font-display text-4xl font-semibold tracking-tight text-[color:var(--page-text)]">
                      Document Upload
                    </h1>
                    <p className="max-w-[42rem] text-sm leading-6 text-[color:var(--page-muted)] sm:mx-auto">
                      Upload your current resume and paste the target job description to begin
                      the analysis.
                    </p>
                  </div>

                  <div className="mt-9 grid gap-6 lg:grid-cols-2">
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
                            : "border-[color:var(--page-line-strong)] bg-[#fbfcff]"
                        }`}
                      >
                        <input
                          id={resumeInputId}
                          ref={resumeInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
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

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[color:var(--page-text)]">
                          Target Job Description
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setJobDescription("");
                            setAnalysisReady(false);
                          }}
                          className="text-sm font-semibold text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
                        >
                          Clear text
                        </button>
                      </div>

                      <textarea
                        value={jobDescription}
                        onChange={(event) => {
                          setJobDescription(event.target.value);
                          setAnalysisReady(false);
                        }}
                        placeholder="Paste the full job description here to optimize your resume against it..."
                        className="min-h-[18rem] w-full rounded-[20px] border border-[color:var(--page-line)] bg-white px-5 py-4 text-sm leading-6 text-[color:var(--page-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition placeholder:text-[#b4bfd3] focus:border-[color:var(--brand)]"
                      />

                      <div className="mt-3 flex items-center justify-between text-sm text-[color:var(--page-muted)]">
                        <span>Role target: {targetRole || "Not set"}</span>
                        <span>{jobDescription.trim().length} characters</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t border-[color:var(--page-line)] pt-6">
                  <div className="mx-auto flex w-full max-w-[920px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-6 text-[color:var(--page-muted)]">
                      {resumeFile
                        ? `Selected file: ${resumeFile.name}`
                        : "Add a resume and a target job description to unlock templates."}
                    </p>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!canContinueFromUpload}
                      className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,107,255,0.22)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:bg-[#c4ccf0] disabled:shadow-none"
                    >
                      Continue to Templates
                      <ArrowRightIcon />
                    </button>
                  </div>
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <section key="step-3" className="section-reveal flex flex-1 flex-col px-5 py-8 sm:px-8 lg:px-10">
                <div className="mx-auto w-full max-w-[980px]">
                  <div className="space-y-3 text-left sm:text-center">
                    <div className="sm:flex sm:justify-center">
                      <span className="step-pill">STEP 3 OF 3</span>
                    </div>
                    <h1 className="font-display text-4xl font-semibold tracking-tight text-[color:var(--page-text)]">
                      Select a Template
                    </h1>
                    <p className="max-w-[42rem] text-sm leading-6 text-[color:var(--page-muted)] sm:mx-auto">
                      Choose an ATS-optimized layout for your final resume. All templates pass
                      standard parser checks.
                    </p>
                  </div>

                  <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {sampleTemplates.map((template) => {
                      const isSelected = template.id === selectedTemplateId;

                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => {
                            setSelectedTemplateId(template.id);
                            setAnalysisReady(false);
                          }}
                          className={`group relative overflow-hidden rounded-[18px] border bg-white text-left shadow-[0_12px_28px_rgba(59,75,138,0.07)] transition ${
                            isSelected
                              ? "border-[color:var(--brand)] ring-2 ring-[color:var(--brand-soft)]"
                              : "border-[color:var(--page-line)] hover:-translate-y-0.5 hover:border-[color:var(--page-line-strong)]"
                          }`}
                        >
                          <div className={`h-[13.5rem] border-b border-[color:var(--page-line)] p-4 ${template.thumbnailClass}`}>
                            <TemplatePreview variant={template.previewVariant} />
                          </div>
                          <div className="space-y-2 px-4 py-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-lg font-semibold text-[color:var(--page-text)]">
                                  {template.name}
                                </p>
                                <div className="mt-1 flex items-center gap-2 text-sm text-[color:var(--page-muted)]">
                                  <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
                                  {template.atsLabel ?? "ATS-Friendly"}
                                </div>
                              </div>

                              {isSelected ? (
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--brand)] text-white shadow-[0_10px_20px_rgba(79,107,255,0.22)]">
                                  <CheckIcon />
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-auto border-t border-[color:var(--page-line)] pt-6">
                  <div className="mx-auto flex w-full max-w-[980px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[color:var(--page-text)]">
                        {selectedTemplate?.name}
                      </p>
                      <p className="text-sm leading-6 text-[color:var(--page-muted)]">
                        Ready for {targetRole || "your target role"} with {resumeFile?.name ?? "your selected resume"}.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,107,255,0.22)] transition hover:bg-[color:var(--brand-strong)]"
                    >
                      Generate Analysis
                      <ArrowRightIcon />
                    </button>
                  </div>

                  {analysisReady ? (
                    <div className="mx-auto mt-4 w-full max-w-[980px] rounded-[16px] border border-[color:var(--page-line)] bg-[color:var(--brand-soft)] px-4 py-3 text-sm text-[color:var(--page-text)]">
                      Analysis is ready to generate for <strong>{targetRole}</strong> using the{" "}
                      <strong>{selectedTemplate?.name}</strong> template.
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
