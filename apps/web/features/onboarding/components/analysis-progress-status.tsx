"use client";

import { cn } from "@/lib/utils";

import type { AnalysisProgressStep } from "../model/analysis-progress";

interface AnalysisProgressStatusProps {
  steps: AnalysisProgressStep[];
  activeStepIndex: number;
  className?: string;
  title?: string;
  variant?: "inline" | "overlay";
}

function progressPercent(activeStepIndex: number, totalSteps: number) {
  if (totalSteps <= 0) {
    return 0;
  }

  const clampedIndex = Math.min(Math.max(activeStepIndex, 0), totalSteps - 1);
  // Leave a little room on the final step so the bar doesn't look finished early.
  const segmentProgress = clampedIndex >= totalSteps - 1 ? 0.82 : 0.55;
  return Math.round(((clampedIndex + segmentProgress) / totalSteps) * 100);
}

export function AnalysisProgressStatus({
  steps,
  activeStepIndex,
  className,
  title = "Running your resume check",
  variant = "inline",
}: AnalysisProgressStatusProps) {
  const activeStep = steps[Math.min(activeStepIndex, Math.max(steps.length - 1, 0))];
  const value = progressPercent(activeStepIndex, steps.length);
  const stageLabel = activeStep?.label ?? "Working";

  return (
    <div
      className={cn(
        "w-full",
        variant === "overlay"
          ? "max-w-sm rounded-2xl border border-[color:var(--page-line)] bg-white/95 px-6 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm"
          : "max-w-md",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`${title}: ${stageLabel}`}
    >
      {variant === "overlay" ? (
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--page-muted)]">
          {title}
        </p>
      ) : null}

      <div
        className={cn(
          "flex items-baseline justify-between gap-3",
          variant === "overlay" && "mt-2",
        )}
      >
        <p
          key={activeStep?.phase ?? "stage"}
          className="font-heading text-[1.05rem] font-semibold tracking-[-0.02em] text-[color:var(--page-text)]"
        >
          <span>{stageLabel}</span>
          <span className="text-[color:var(--brand)]">…</span>
        </p>
        <p className="shrink-0 text-[0.7rem] font-medium tabular-nums tracking-wide text-[color:var(--page-muted)]">
          {Math.min(activeStepIndex + 1, steps.length)} / {steps.length}
        </p>
      </div>

      <div
        className="mt-3 h-[3px] overflow-hidden rounded-full bg-[color:var(--page-line)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={stageLabel}
      >
        <div
          className="h-full rounded-full bg-[color:var(--brand)] transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${value}%` }}
        />
      </div>

      <p className="mt-2.5 text-xs leading-5 text-[color:var(--page-muted)]">
        {activeStep?.description ?? "This usually takes under a minute."}
      </p>

      <ol className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.68rem] font-medium tracking-wide">
        {steps.map((step, index) => {
          const status =
            index < activeStepIndex ? "complete" : index === activeStepIndex ? "active" : "pending";

          return (
            <li key={step.phase} className="flex items-center gap-1.5">
              {index > 0 ? (
                <span className="text-[color:var(--page-line-strong)]" aria-hidden="true">
                  ·
                </span>
              ) : null}
              <span
                className={cn(
                  status === "active" && "text-[color:var(--brand)]",
                  status === "complete" && "text-[color:var(--page-muted)]",
                  status === "pending" && "text-[color:var(--page-line-strong)]",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
