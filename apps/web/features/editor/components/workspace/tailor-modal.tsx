import React from "react";
import { SparklesIcon, CloseIcon } from "../../../onboarding/components/wizard-icons";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface TailorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  isUpdating: boolean;
  updateError: string;
  onTailor: () => void;
  onRetry: () => void;
}

export function TailorModal({
  open,
  onOpenChange,
  jobDescription,
  onJobDescriptionChange,
  isUpdating,
  updateError,
  onTailor,
  onRetry,
}: TailorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[92vh] max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-xl border border-[color:var(--page-line)] bg-white p-0 text-[color:var(--page-text)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:max-w-5xl"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--page-line)] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl font-semibold tracking-tight text-[color:var(--page-text)]">
              Check a different job post
            </DialogTitle>
            <DialogDescription className="text-sm text-[color:var(--page-muted)]">
              Paste a new job post and we&apos;ll refresh the tips for that role.
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-surface)] text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
            aria-label="Close tailor modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                  Job Post
                </label>
                <span className="text-xs text-[color:var(--page-muted)]">
                  {jobDescription.trim().length} characters
                </span>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => onJobDescriptionChange(e.target.value)}
                placeholder="Paste the full job post here..."
                className="min-h-[320px] w-full resize-none rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base leading-7 text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)]"
              />
              {jobDescription.length < 30 && jobDescription.length > 0 && (
                <p className="text-xs text-[#e16f62]">
                  Paste at least 30 characters from the job post.
                </p>
              )}
            </div>

            {updateError && (
              <div className="flex items-start gap-3 rounded-xl bg-rose-50 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-rose-600">
                    {updateError}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onRetry}
                  disabled={isUpdating}
                  className="ml-2 whitespace-nowrap rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                  aria-label="Retry resume check"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-white px-4 text-sm font-semibold text-[color:var(--page-text)] transition hover:bg-[color:var(--page-bg-strong)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating || jobDescription.length < 30}
                onClick={onTailor}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[color:var(--brand)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-strong)] disabled:opacity-50"
              >
                {isUpdating ? "Checking..." : "Check resume"}
                {!isUpdating && <SparklesIcon />}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
