import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { GAP, PADDING } from "@/lib/design-tokens";
import { CheckCircleIcon } from "../../../onboarding/components/wizard-icons";
import type { BuilderGuideAction, CreateResumeGuideState } from "../../view-models/create-resume-guide";

interface CreateResumeGuideProps {
  guide: CreateResumeGuideState;
  onAction: (action: BuilderGuideAction) => void;
  onPrint: () => void;
  onBackupDraft: () => void;
  onResetDraft: () => void;
}

export function CreateResumeGuide({
  guide,
  onAction,
  onPrint,
  onBackupDraft,
  onResetDraft,
}: CreateResumeGuideProps) {
  return (
    <section
      className="overflow-hidden rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-surface)]"
      aria-label="Resume draft progress"
    >
      <header className={`flex flex-col ${GAP.compact} border-b border-[color:var(--page-line)] ${PADDING.default}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="display-serif text-lg text-[color:var(--page-text)]">Resume checklist</h3>
            <p className="mt-1 text-sm leading-6 text-[color:var(--page-muted)]">
              Add the basics first. Nothing is final until you print or save a PDF.
            </p>
          </div>
          <span className="shrink-0 tabular-nums text-xs font-medium text-[color:var(--page-muted)]">
            {guide.completedCount}/{guide.totalCount}
          </span>
        </div>
        <div className={`flex flex-col ${GAP.inline}`}>
          <Progress value={guide.progress} aria-label="Resume completion progress" className="h-1.5" />
          <p className="text-xs text-[color:var(--page-muted)]">{guide.progress}% complete</p>
        </div>
      </header>

      <div className={PADDING.default}>
        <ol className="relative m-0 list-none p-0">
          {guide.items.map((item, index) => {
            const isLast = index === guide.items.length - 1;

            return (
              <li key={item.id} className="relative flex items-center justify-between gap-3 pb-4 last:pb-0">
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-[7px] top-5 bottom-0 w-px",
                      item.complete ? "bg-[color:var(--brand)]/25" : "bg-[color:var(--page-line)]",
                    )}
                  />
                ) : null}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className={cn(
                      "relative z-[1] inline-flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                      item.complete
                        ? "border-[color:var(--success)] bg-[color:var(--success-soft)] text-[color:var(--success)]"
                        : "border-[color:var(--page-line-strong)] bg-[color:var(--page-surface)] text-[color:var(--page-muted)]",
                    )}
                    aria-hidden="true"
                  >
                    {item.complete ? <CheckCircleIcon /> : null}
                  </span>
                  <span
                    className={cn(
                      "truncate text-sm font-medium",
                      item.complete
                        ? "text-[color:var(--page-text)]"
                        : "text-[color:var(--page-muted)]",
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                <Button
                  type="button"
                  variant={item.complete ? "ghost" : "outline"}
                  size="sm"
                  onClick={() => onAction(item.id)}
                  className="shrink-0"
                >
                  {item.button}
                </Button>
              </li>
            );
          })}
        </ol>

        {guide.warnings.length > 0 ? (
          <div
            className={cn(
              "mt-4 rounded-md border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)]",
              PADDING.compact,
            )}
          >
            <p className="text-sm font-medium text-[color:var(--page-text)]">Next to add</p>
            <ul className={`mt-2 flex flex-col ${GAP.inline}`}>
              {guide.warnings.map((warning) => (
                <li key={warning} className="text-xs leading-5 text-[color:var(--page-muted)]">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-[color:var(--page-muted)]">
            Your draft has the core sections most reviewers expect.
          </p>
        )}
      </div>

      <footer
        className={`flex flex-col items-stretch ${GAP.compact} border-t border-[color:var(--page-line)] ${PADDING.default}`}
      >
        <Button type="button" size="sm" onClick={onPrint} className="w-full">
          Print / Save PDF
        </Button>
        <div className={`flex flex-col ${GAP.inline} sm:flex-row sm:items-center`}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onBackupDraft}
            title="Downloads a backup copy of this draft"
            className="w-full sm:flex-1"
          >
            Save a copy
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="w-full text-[color:var(--danger-text)] hover:bg-[color:var(--danger-soft)] hover:text-[color:var(--danger-text)] sm:ml-auto sm:w-auto"
              >
                Reset draft
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset this draft?</AlertDialogTitle>
                <AlertDialogDescription>
                  This clears the local resume draft, title, selected resume style, and undo history. Download a backup
                  first if you want to keep a copy.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={onResetDraft}>
                  Reset draft
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </footer>
    </section>
  );
}
