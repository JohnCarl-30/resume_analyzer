import React from "react";
import { ArrowRightIcon } from "./wizard-icons";

interface StepJobDescriptionProps {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  onNext: () => void;
  canContinue: boolean;
}

export function StepJobDescription({
  jobDescription,
  setJobDescription,
  onNext,
  canContinue,
}: StepJobDescriptionProps) {
  const MAX_LENGTH = 10000;
  const trimmedLength = jobDescription.trim().length;
  const jobDescriptionError =
    trimmedLength > 0 && trimmedLength < 30
      ? "Paste at least 30 characters from the job description."
      : trimmedLength > MAX_LENGTH
        ? `Job description must be ${MAX_LENGTH} characters or less.`
        : "";

  return (
    <section className="section-reveal flex flex-1 flex-col px-5 py-8 sm:px-8 lg:px-12">
      <div className="w-full">
        <div className="space-y-3 text-left sm:text-center">
          <div className="sm:flex sm:justify-center">
            <span className="step-pill">STEP 2 OF 5</span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-[color:var(--page-text)]">
            Paste the job description
          </h1>
          <p className="max-w-[42rem] text-sm leading-6 text-[color:var(--page-muted)] sm:mx-auto">
            Start by pasting the full job description for the role you&apos;re
            targeting. We&apos;ll tailor every step of the analysis around it.
          </p>
        </div>

        <div className="mx-auto mt-9 max-w-2xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[color:var(--page-text)]">
              Target Job Description
            </p>
            <button
              type="button"
              onClick={() => setJobDescription("")}
              className="text-sm font-semibold text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
            >
              Clear text
            </button>
          </div>

          <textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the full job description here to optimize your resume against it..."
            rows={12}
            className="w-full rounded-[20px] border border-[color:var(--page-line)] bg-white px-5 py-4 text-sm leading-6 text-[color:var(--page-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition placeholder:text-[#b4bfd3] focus:border-[color:var(--brand)]"
          />

          <div className="mt-3 flex items-center justify-between text-sm text-[color:var(--page-muted)]">
            <p className="min-h-6 text-sm text-[#e16f62]">{jobDescriptionError}</p>
            <span className={trimmedLength > MAX_LENGTH * 0.9 ? "text-[#e16f62] font-semibold" : ""}>
              {trimmedLength} / {MAX_LENGTH} characters
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-[color:var(--page-line)] pt-6">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onNext}
            disabled={!canContinue}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,107,255,0.22)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:bg-[#c4ccf0] disabled:shadow-none"
          >
            Continue to Resume Upload
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
