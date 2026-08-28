import { CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";

interface WizardProgressProps {
  /** 1-based index of the step being shown. */
  current: number;
  steps: readonly string[];
  className?: string;
}

/**
 * Where you are in the five steps, and what is still to come.
 *
 * The bars this replaces coloured completed and current steps identically, so
 * they showed how far along you were but not where you actually stood — and on
 * a phone they carried no words at all. Completed steps now take a check, and
 * the small layout names the current step and the next one.
 *
 * Deliberately not clickable: the wizard resets state as it moves between
 * steps, so jumping straight from four to one would skip that.
 */
export function WizardProgress({ current, steps, className }: WizardProgressProps) {
  const total = steps.length;
  const currentLabel = steps[current - 1] ?? steps[0];
  const nextLabel = steps[current];

  return (
    <nav aria-label="Progress" className={className}>
      {/* Phone: the same information without room for the full stepper. */}
      <div className="sm:hidden">
        <p className="flex items-baseline justify-between gap-3 text-caption">
          <span className="font-medium text-foreground">
            Step {current} of {total} · {currentLabel}
          </span>
          {nextLabel ? <span className="text-muted-foreground">Next: {nextLabel}</span> : null}
        </p>
        <div
          className="mt-2 h-1 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          // The surrounding nav is labelled, but that does not name the bar
          // itself, which is announced as its own widget.
          aria-label="Steps completed"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={current}
          aria-valuetext={`Step ${current} of ${total}: ${currentLabel}`}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-[var(--ease-out-quart)]"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
      </div>

      <ol className="hidden items-center gap-2 sm:flex">
        {steps.map((label, index) => {
          const position = index + 1;
          const isComplete = position < current;
          const isCurrent = position === current;

          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className="flex items-center gap-2"
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-semibold transition-colors",
                    isComplete && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground",
                    !isComplete && !isCurrent && "border border-border text-muted-foreground",
                  )}
                >
                  {isComplete ? <CheckIcon aria-hidden="true" /> : position}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-caption transition-colors",
                    isCurrent ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </span>

              {position < total ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px min-w-4 flex-1 transition-colors",
                    isComplete ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
