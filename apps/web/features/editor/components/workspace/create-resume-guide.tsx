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
  const isComplete = guide.warnings.length === 0;

  return (
    <div className="rounded-lg border border-[color:var(--page-line)] bg-white">
      <div className="flex flex-col gap-3 px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[color:var(--page-text)]">Resume checklist</h3>
            <p className="mt-1 text-sm leading-5 text-[color:var(--page-muted)]">
              Add the basics first. Nothing is final until you print or save a PDF.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[color:var(--page-line)] px-2 py-0.5 text-xs font-medium text-[color:var(--page-text)]">
            {guide.completedCount}/{guide.totalCount}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <Progress value={guide.progress} aria-label="Resume completion progress" />
          <p className="text-xs text-[color:var(--page-muted)]">{guide.progress}% complete</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t border-[color:var(--page-line)] px-3 py-3">
        <div className="flex flex-col">
          {guide.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 border-b border-[color:var(--page-line)] py-2 last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    item.complete
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : "border-[color:var(--page-line)] bg-white text-[color:var(--page-muted)]"
                  }`}
                  aria-hidden="true"
                >
                  {item.complete ? <CheckCircleIcon /> : null}
                </span>
                <span className="truncate text-sm font-medium text-[color:var(--page-text)]">{item.label}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAction(item.id)}
                className="shrink-0"
              >
                {item.button}
              </Button>
            </div>
          ))}
        </div>

        {guide.warnings.length > 0 ? (
          <div className="border-t border-[color:var(--page-line)] pt-3">
            <p className="text-sm font-medium text-[color:var(--page-text)]">Next to add</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {guide.warnings.map((warning) => (
                <li key={warning} className="text-xs leading-5 text-[color:var(--page-muted)]">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="border-t border-[color:var(--page-line)] pt-3 text-sm text-[color:var(--page-muted)]">
            Your draft has the core sections most reviewers expect.
          </div>
        )}
      </div>
      <div className="flex flex-col items-stretch gap-2 border-t border-[color:var(--page-line)] px-3 py-3 sm:flex-row">
        <Button type="button" size="sm" onClick={onPrint} className="w-full sm:w-auto">
          Print / Save PDF
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onBackupDraft}
          title="Downloads a backup copy of this draft"
          className="w-full sm:w-auto"
        >
          Save a copy
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" size="sm" variant="destructive" className="w-full sm:ml-auto sm:w-auto">
              Reset draft
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Reset this draft?</AlertDialogTitle>
              <AlertDialogDescription>
                This clears the local resume draft, title, selected resume style, and undo history. Download a backup first
                if you want to keep a copy.
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
    </div>
  );
}
