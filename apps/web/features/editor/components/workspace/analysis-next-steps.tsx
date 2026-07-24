import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircleIcon } from "../../../onboarding/components/wizard-icons";
import type { AnalysisNextStepAction, AnalysisNextStepsState } from "../../view-models/analysis-next-steps";

interface AnalysisNextStepsTailor {
  isLoading: boolean;
  pendingCount: number;
  available?: boolean;
  onReview: () => void;
}

interface AnalysisNextStepsProps {
  guide: AnalysisNextStepsState;
  onAction: (action: AnalysisNextStepAction) => void;
  onApply?: (action: AnalysisNextStepAction) => void;
  tailor?: AnalysisNextStepsTailor;
  preferTailorFlow?: boolean;
}

const statusVariant: Record<AnalysisNextStepsState["statusTone"], React.ComponentProps<typeof Badge>["variant"]> = {
  strong: "secondary",
  close: "outline",
  "needs-work": "outline",
};

const MAX_VISIBLE_INCOMPLETE = 3;

export function AnalysisNextSteps({
  guide,
  onAction,
  onApply,
  tailor,
  preferTailorFlow = false,
}: AnalysisNextStepsProps) {
  const visibleKeywords = guide.missingKeywordPreview.slice(0, 4);
  const hiddenKeywordCount = Math.max(guide.missingKeywordPreview.length - visibleKeywords.length, 0);
  const incompleteSteps = guide.steps.filter((step) => !step.complete);
  const incompleteCount = incompleteSteps.length;
  const visibleSteps =
    incompleteCount > 0
      ? incompleteSteps.slice(0, MAX_VISIBLE_INCOMPLETE)
      : guide.steps.filter((step) => step.complete).slice(0, 1);
  const hiddenIncompleteCount = Math.max(incompleteCount - visibleSteps.length, 0);
  const showTailorBanner = Boolean(
    tailor && (tailor.isLoading || tailor.pendingCount > 0 || tailor.available),
  );

  return (
    <div className="rounded-lg border border-[color:var(--page-line)] bg-white">
      {showTailorBanner ? (
        <div className="border-b border-[color:var(--brand)]/15 bg-[color:var(--brand-soft)] px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[color:var(--page-text)]">
                {tailor?.pendingCount || tailor?.isLoading
                  ? "Job-tailored edits ready"
                  : "Job-tailored edits"}
              </p>
              <p className="mt-1 text-xs leading-5 text-[color:var(--page-muted)]">
                {tailor?.isLoading
                  ? "Preparing light edits for your summary, skills, and bullets."
                  : tailor?.pendingCount
                    ? "Start here — approve the edits you want in the layout."
                    : "Start here with light edits for this job."}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={tailor?.onReview}
              disabled={tailor?.isLoading}
              className="shrink-0"
            >
              {tailor?.isLoading
                ? "Preparing…"
                : tailor?.pendingCount === 1
                  ? "Review edit"
                  : tailor?.pendingCount
                    ? `Review ${tailor.pendingCount} edits`
                    : "Review job edits"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="border-b border-[color:var(--page-line)] px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[color:var(--page-text)]">Top fixes</h3>
            <p className="mt-1 text-xs leading-5 text-[color:var(--page-muted)]">
              {incompleteCount > 0
                ? showTailorBanner
                  ? "After reviewing edits, finish these remaining items."
                  : `Focus on these ${Math.min(incompleteCount, MAX_VISIBLE_INCOMPLETE)} next.`
                : "Your main fixes are done. Give the resume one final read."}
            </p>
          </div>
          <Badge variant={statusVariant[guide.statusTone]} className="shrink-0 normal-case tracking-normal">
            {guide.statusLabel}
          </Badge>
        </div>
      </div>

      <div className="px-3 py-3">
        <div className="flex flex-col gap-1">
          <Progress value={guide.progress} aria-label="Resume check progress" />
          <p className="text-xs text-[color:var(--page-muted)]">
            {guide.completedCount} of {guide.totalCount} ready
          </p>
        </div>

        {guide.scoreBreakdown && !showTailorBanner ? (
          <dl className="mt-2.5 grid grid-cols-3 gap-2 border-t border-[color:var(--page-line)] pt-2.5">
            <div>
              <dt className="text-xs text-[color:var(--page-muted)]">Job words</dt>
              <dd className="mt-0.5 text-sm font-semibold text-[color:var(--page-text)]">
                {guide.scoreBreakdown.jobWords}%
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[color:var(--page-muted)]">Must-haves</dt>
              <dd className="mt-0.5 text-sm font-semibold text-[color:var(--page-text)]">
                {guide.scoreBreakdown.mustHaves}%
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[color:var(--page-muted)]">Clarity</dt>
              <dd className="mt-0.5 text-sm font-semibold text-[color:var(--page-text)]">
                {guide.scoreBreakdown.clarity}%
              </dd>
            </div>
          </dl>
        ) : null}

        {!showTailorBanner && guide.missingKeywordPreview.length > 0 ? (
          <div className="mt-2.5 border-t border-[color:var(--page-line)] pt-2.5">
            <p className="text-xs font-medium text-[color:var(--page-text)]">Job words to add</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {visibleKeywords.map((keyword) => (
                <Badge key={keyword} variant="outline" className="text-[0.68rem] normal-case tracking-normal">
                  {keyword}
                </Badge>
              ))}
              {hiddenKeywordCount > 0 ? (
                <Badge variant="outline" className="text-[0.68rem] normal-case tracking-normal">
                  +{hiddenKeywordCount} more
                </Badge>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-2.5 flex flex-col border-t border-[color:var(--page-line)]">
          {visibleSteps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-start gap-3 border-b border-[color:var(--page-line)] py-2.5 last:border-b-0"
            >
              <span
                className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.65rem] font-semibold ${
                  step.complete
                    ? "border-[color:var(--brand)] text-[color:var(--brand)]"
                    : "border-[color:var(--page-line)] text-[color:var(--page-muted)]"
                }`}
                aria-hidden="true"
              >
                {step.complete ? <CheckCircleIcon /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[color:var(--page-text)]">{step.title}</p>
                <p className="mt-0.5 text-xs leading-4 text-[color:var(--page-muted)]">
                  {step.description}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    variant={step.complete ? "ghost" : "outline"}
                    size="sm"
                    onClick={() => onAction(step.action)}
                    className="h-7 px-2.5 text-xs"
                  >
                    {step.buttonLabel}
                  </Button>
                  {!step.complete && step.applyLabel && onApply && !preferTailorFlow ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onApply(step.action)}
                      aria-label={`Add suggestion for ${step.title}`}
                      className="h-7 px-2.5 text-xs"
                    >
                      {step.applyLabel}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          {hiddenIncompleteCount > 0 ? (
            <p className="py-2 text-xs text-[color:var(--page-muted)]">
              +{hiddenIncompleteCount} more after these
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
