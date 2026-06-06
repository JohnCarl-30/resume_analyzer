import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card size="sm" className="border border-[color:var(--page-line)] bg-white shadow-none ring-0">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-[color:var(--page-text)]">Resume checklist</CardTitle>
            <CardDescription className="mt-1 text-sm leading-5 text-[color:var(--page-muted)]">
              Fill in the basics, preview your resume, and print when you&apos;re ready.
            </CardDescription>
          </div>
          <Badge variant={isComplete ? "default" : "outline"}>
            {guide.completedCount}/{guide.totalCount}
          </Badge>
        </div>
        <div className="flex flex-col gap-2">
          <Progress value={guide.progress} aria-label="Resume completion progress" />
          <p className="text-xs text-[color:var(--page-muted)]">{guide.progress}% complete</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-2">
          {guide.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
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
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
            <p className="text-sm font-medium text-amber-900">Suggestions</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {guide.warnings.map((warning) => (
                <li key={warning} className="text-xs leading-5 text-amber-800">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
            Your draft has the core sections most reviewers expect.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2 sm:flex-row">
        <Button type="button" size="sm" onClick={onPrint} className="w-full sm:w-auto">
          Print / PDF
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onBackupDraft}
          title="Downloads a backup file for this draft"
          className="w-full sm:w-auto"
        >
          Backup draft
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
                This clears the local resume draft, title, selected template, and undo history. Download a backup first
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
      </CardFooter>
    </Card>
  );
}
