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
    <section className="section-reveal flex flex-1 flex-col items-center justify-center px-5 py-8 sm:px-8">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <span className="step-pill">STEP 2 OF 5</span>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-[color:var(--page-text)] sm:text-5xl">
            Paste the job description
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[color:var(--page-muted)]">
            We&apos;ll tailor every step of the analysis around it.
          </p>
        </div>

        <div className="mt-10">
          <div className="rounded-[24px] border border-[color:var(--page-line)] bg-white p-6 shadow-[0_12px_40px_rgba(26,32,61,0.06)] sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[color:var(--page-text)]">
                Job Description
              </p>
              <button
                type="button"
                onClick={() => setJobDescription("")}
                className="text-sm font-medium text-[color:var(--page-muted)] transition hover:text-[color:var(--brand)]"
              >
                Clear
              </button>
            </div>

            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the full job description here..."
              rows={10}
              className="w-full rounded-[16px] border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] px-4 py-3 text-sm leading-6 text-[color:var(--page-text)] outline-none transition placeholder:text-[#b4bfd3] focus:border-[color:var(--brand)] focus:bg-white focus:ring-2 focus:ring-[color:var(--brand-soft)]"
            />

            <div className="mt-3 flex items-center justify-between text-sm">
              <p className="min-h-5 text-[#e16f62]">{jobDescriptionError}</p>
              <span className={trimmedLength > MAX_LENGTH * 0.9 ? "text-[#e16f62] font-semibold" : "text-[color:var(--page-muted)]"}>
                {trimmedLength} / {MAX_LENGTH} characters
              </span>
            </div>

            <button
              type="button"
              onClick={onNext}
              disabled={!canContinue}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[color:var(--brand)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,107,255,0.22)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:bg-[#c4ccf0] disabled:shadow-none"
            >
              Continue to Resume Upload
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
