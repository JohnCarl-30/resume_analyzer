import React from "react";
import { BriefcaseIcon, ArrowRightIcon } from "./wizard-icons";

interface StepTargetRoleProps {
  targetRole: string;
  setTargetRole: (role: string) => void;
  onNext: () => void;
  canContinue: boolean;
  stepOverview: readonly {
    id: string;
    title: string;
    description: string;
  }[];
}

export function StepTargetRole({
  targetRole,
  setTargetRole,
  onNext,
  canContinue,
  stepOverview,
}: StepTargetRoleProps) {
  return (
    <section className="section-reveal flex flex-1 px-5 py-10 sm:px-8 lg:px-12 xl:px-14">
      <div className="grid w-full gap-10 xl:grid-cols-[minmax(0,1.1fr)_25rem] xl:items-center">
        <div className="flex max-w-3xl flex-col justify-center">
          <span className="step-pill w-fit">Resume analysis flow</span>

          <div className="mt-7 space-y-4">
            <h1 className="font-display text-5xl font-semibold tracking-tight text-[color:var(--page-text)] sm:text-6xl">
              Build the analysis around one clear target role.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[color:var(--page-muted)]">
              Start with the position you want, then we&apos;ll guide the upload,
              comparison, and layout choice around that goal.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {stepOverview.map((stepItem) => (
              <div
                key={stepItem.id}
                className="rounded-[20px] border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] px-4 py-4 shadow-[0_8px_22px_rgba(0,0,0,0.03)]"
              >
                <p className="font-mono text-sm font-semibold text-[color:var(--brand)]">
                  {stepItem.id}
                </p>
                <h2 className="mt-3 text-lg font-semibold text-[color:var(--page-text)]">
                  {stepItem.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--page-muted)]">
                  {stepItem.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:justify-self-end">
          <section className="w-full rounded-[28px] border border-[color:var(--page-line)] bg-white p-6 text-center shadow-[var(--shadow-md)] sm:p-7">
            <div className="h-1.5 w-20 rounded-full bg-[color:var(--brand-strong)]" />

            <div className="mt-7 space-y-3">
              <h2 className="font-display text-4xl font-semibold tracking-tight text-[color:var(--page-text)]">
                What role are you targeting?
              </h2>
              <p className="text-sm leading-6 text-[color:var(--page-muted)]">
                We&apos;ll tailor your resume analysis to this specific position.
              </p>
            </div>

            <label
              className="mt-7 flex items-center gap-3 rounded-[16px] border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition focus-within:border-[color:var(--brand)] focus-within:bg-white"
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

            <button
              type="button"
              onClick={onNext}
              disabled={!canContinue}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,107,255,0.24)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:bg-[#c4ccf0] disabled:shadow-none"
            >
              Next: Job Details
              <ArrowRightIcon />
            </button>
          </section>
        </div>
      </div>
    </section>
  );
}
