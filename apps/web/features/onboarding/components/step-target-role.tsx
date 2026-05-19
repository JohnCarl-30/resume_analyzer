import React from "react";
import { BriefcaseIcon, ArrowRightIcon } from "./wizard-icons";

interface StepTargetRoleProps {
  targetRole: string;
  setTargetRole: (role: string) => void;
  onNext: () => void;
  canContinue: boolean;
}

export function StepTargetRole({
  targetRole,
  setTargetRole,
  onNext,
  canContinue,
}: StepTargetRoleProps) {
  const trimmedTargetRole = targetRole.trim();
  const roleError =
    trimmedTargetRole.length > 0 && trimmedTargetRole.length < 2
      ? "Enter at least 2 characters for the target role."
      : "";

  return (
    <section className="section-reveal flex flex-1 flex-col items-center justify-center px-5 py-8 sm:px-8">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <span className="step-pill">Resume analysis flow</span>

          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-[color:var(--page-text)] sm:text-5xl">
            What role are you targeting?
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[color:var(--page-muted)]">
            We&apos;ll tailor your resume analysis to this specific position.
          </p>
        </div>

        <div className="mt-10">
          <div className="rounded-[24px] border border-[color:var(--page-line)] bg-white p-8 shadow-[0_12px_40px_rgba(26,32,61,0.06)] sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] bg-[color:var(--brand-soft)] text-[color:var(--brand)]">
              <BriefcaseIcon />
            </div>

            <div className="mt-6 text-center">
              <h2 className="text-2xl font-semibold text-[color:var(--page-text)]">
                Target Role
              </h2>
              <p className="mt-2 text-sm text-[color:var(--page-muted)]">
                Enter the position you want to apply for
              </p>
            </div>

            <div className="mt-6">
              <label
                className="flex items-center gap-3 rounded-[16px] border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] px-4 py-3.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition focus-within:border-[color:var(--brand)] focus-within:bg-white focus-within:ring-2 focus-within:ring-[color:var(--brand-soft)]"
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
                  }}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full border-none bg-transparent text-[color:var(--page-text)] outline-none placeholder:text-[#b4bfd3]"
                />
              </label>

              <p className="mt-2 min-h-5 text-sm text-[#e16f62]">{roleError}</p>
            </div>

            <button
              type="button"
              onClick={onNext}
              disabled={!canContinue}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[color:var(--brand)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,107,255,0.24)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:bg-[#c4ccf0] disabled:shadow-none"
            >
              Next: Job Details
              <ArrowRightIcon />
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[color:var(--page-muted)]">
          Next: paste the job description → upload your resume → choose a template → review AI suggestions
        </p>
      </div>
    </section>
  );
}
