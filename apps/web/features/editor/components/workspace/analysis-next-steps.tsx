import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircleIcon } from "../../../onboarding/components/wizard-icons";
import type { AnalysisNextStepAction, AnalysisNextStepsState } from "../../view-models/analysis-next-steps";

interface AnalysisNextStepsProps {
  guide: AnalysisNextStepsState;
  onAction: (action: AnalysisNextStepAction) => void;
}

const statusClassName: Record<AnalysisNextStepsState["statusTone"], string> = {
  strong: "border-emerald-200 bg-emerald-50 text-emerald-700",
  close: "border-amber-200 bg-amber-50 text-amber-800",
  "needs-work": "border-rose-200 bg-rose-50 text-rose-700",
};

export function AnalysisNextSteps({ guide, onAction }: AnalysisNextStepsProps) {
  const visibleKeywords = guide.missingKeywordPreview.slice(0, 4);
  const hiddenKeywordCount = Math.max(guide.missingKeywordPreview.length - visibleKeywords.length, 0);

  return (
    <div className="rounded-[14px] border border-[color:var(--page-line)] bg-white p-3 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[color:var(--page-text)]">ATS checklist</h3>
          <p className="mt-1 text-xs leading-5 text-[color:var(--page-muted)]">{guide.summary}</p>
        </div>
        <Badge variant="outline" className={`shrink-0 ${statusClassName[guide.statusTone]}`}>
          {guide.statusLabel}
        </Badge>
      </div>

      <div className="mt-2.5 space-y-1">
        <Progress value={guide.progress} aria-label="ATS checklist progress" />
        <p className="text-xs text-[color:var(--page-muted)]">
          {guide.completedCount} of {guide.totalCount} ready
        </p>
      </div>

      {guide.missingKeywordPreview.length > 0 ? (
        <div className="mt-2.5 rounded-[10px] bg-[color:var(--page-bg)] px-3 py-2">
          <p className="text-xs font-medium text-[color:var(--page-text)]">Job words to add</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {visibleKeywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-[color:var(--page-line)] bg-white px-2 py-1 text-[0.68rem] font-medium text-[color:var(--page-muted)]"
              >
                {keyword}
              </span>
            ))}
            {hiddenKeywordCount > 0 ? (
              <span className="rounded-full border border-[color:var(--page-line)] bg-white px-2 py-1 text-[0.68rem] font-medium text-[color:var(--page-muted)]">
                +{hiddenKeywordCount} more
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-2.5 space-y-1.5">
        {guide.steps.map((step, index) => (
          <div
            key={step.id}
            className="rounded-[12px] border border-[color:var(--page-line)] bg-[color:var(--page-surface)] px-2.5 py-2"
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.65rem] font-semibold ${
                  step.complete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-[color:var(--page-line)] bg-white text-[color:var(--page-muted)]"
                }`}
                aria-hidden="true"
              >
                {step.complete ? <CheckCircleIcon /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[color:var(--page-text)]">{step.title}</p>
                <p className="mt-0.5 overflow-hidden text-xs leading-4 text-[color:var(--page-muted)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                  {step.description}
                </p>
                <Button
                  type="button"
                  variant={step.complete ? "ghost" : "outline"}
                  size="sm"
                  onClick={() => onAction(step.action)}
                  className="mt-1.5 h-7 px-2.5 text-xs"
                >
                  {step.buttonLabel}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
