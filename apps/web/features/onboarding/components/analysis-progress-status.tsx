"use client";

import { CheckCircledIcon, CircleIcon, ReloadIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";

import type { AnalysisProgressStep } from "../model/analysis-progress";

interface AnalysisProgressStatusProps {
  steps: AnalysisProgressStep[];
  activeStepIndex: number;
  className?: string;
  title?: string;
  variant?: "inline" | "overlay";
}

function StepStatusIcon({ status }: { status: "complete" | "active" | "pending" }) {
  if (status === "complete") {
    return <CheckCircledIcon className="size-4 shrink-0 text-primary" aria-hidden="true" />;
  }

  if (status === "active") {
    return <ReloadIcon className="size-4 shrink-0 animate-spin text-primary" aria-hidden="true" />;
  }

  return <CircleIcon className="size-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />;
}

export function AnalysisProgressStatus({
  steps,
  activeStepIndex,
  className,
  title = "Running your resume check",
  variant = "inline",
}: AnalysisProgressStatusProps) {
  const activeStep = steps[activeStepIndex];

  return (
    <div
      className={cn(
        variant === "overlay"
          ? "w-full max-w-md rounded-xl border border-border bg-background/95 p-5 shadow-sm backdrop-blur-sm"
          : "rounded-lg border border-border bg-muted/30 p-4",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p
        className={cn(
          "font-medium text-foreground",
          variant === "overlay" ? "text-base" : "text-sm",
        )}
      >
        {title}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {activeStep?.description ?? "This usually takes under a minute."}
      </p>

      <ol className="mt-4 space-y-3">
        {steps.map((step, index) => {
          const status =
            index < activeStepIndex ? "complete" : index === activeStepIndex ? "active" : "pending";

          return (
            <li key={step.phase} className="flex items-start gap-3">
              <StepStatusIcon status={status} />
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm leading-5",
                    status === "active" && "font-medium text-foreground",
                    status === "complete" && "text-muted-foreground",
                    status === "pending" && "text-muted-foreground/70",
                  )}
                >
                  {step.label}
                  {status === "active" ? "…" : null}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
