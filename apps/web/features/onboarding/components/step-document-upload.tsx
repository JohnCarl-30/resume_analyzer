import React from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircledIcon,
  FilePlusIcon,
  Pencil1Icon,
  UploadIcon,
} from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GAP, PADDING, PADDING_Y, MARGIN_TOP } from "@/lib/design-tokens";

interface StepDocumentUploadProps {
  resumeInputId: string;
  resumeInputRef: React.RefObject<HTMLInputElement | null>;
  isDragActive: boolean;
  setIsDragActive: (active: boolean) => void;
  handleDrop: (event: React.DragEvent<HTMLLabelElement>) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resumeFile: File | null;
  formatFileSize: (size: number) => string;
  openFilePicker: () => void;
  uploadError: string;
  onNext: () => void;
  canContinue: boolean;
  createFromScratch: boolean;
  onChooseScratchBuilder: () => void;
  uploadDisabled?: boolean;
  quotaLoading?: boolean;
  quotaExhausted?: boolean;
  quotaExhaustedMessage?: string;
  savedCheckPath?: string | null;
}

export function StepDocumentUpload({
  resumeInputId,
  resumeInputRef,
  isDragActive,
  setIsDragActive,
  handleDrop,
  handleFileChange,
  resumeFile,
  formatFileSize,
  openFilePicker,
  uploadError,
  onNext,
  canContinue,
  createFromScratch,
  onChooseScratchBuilder,
  uploadDisabled = false,
  quotaLoading = false,
  quotaExhausted = false,
  quotaExhaustedMessage,
  savedCheckPath = null,
}: StepDocumentUploadProps) {
  const uploadAreaClassName = uploadDisabled
    ? "flex min-h-72 cursor-not-allowed flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-8 text-center opacity-70"
    : cn(
        "flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-8 text-center transition-colors",
        isDragActive ? "border-primary bg-accent" : "border-border bg-background hover:bg-muted/40",
      );

  return (
    <section className="section-reveal flex flex-1 flex-col overflow-y-auto bg-background px-4 py-8 sm:px-8 lg:px-10">
      <div
        className={`mx-auto flex w-full max-w-6xl flex-1 flex-col ${GAP.section} ${
          quotaExhausted ? "justify-center" : ""
        }`}
      >
        <div className={`flex flex-col ${GAP.compact} text-left sm:items-center sm:text-center`}>
          <span className="sr-only">STEP 3 OF 5</span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
            {quotaExhausted ? "Start a blank resume" : "Add your resume"}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground text-pretty">
            {quotaExhausted
              ? "Your free check is used, so uploading for a new one is unavailable. You can still build a resume here and export it."
              : "Upload your current resume, or start with a blank one if you want to build it here."}
          </p>
        </div>

        <div className={`mx-auto flex w-full max-w-3xl flex-col ${GAP.default}`}>
          {quotaExhausted && savedCheckPath ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
              <p className="text-sm leading-6 text-muted-foreground">
                Your earlier check is still saved and editable.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={savedCheckPath}>Open saved check</Link>
              </Button>
            </div>
          ) : null}

          {quotaLoading ? (
            <Alert>
              <AlertTitle>Checking your allowance</AlertTitle>
              <AlertDescription>
                Confirming whether your free resume check is available before you upload.
              </AlertDescription>
            </Alert>
          ) : null}

          {!quotaExhausted ? (
            <div className={`flex flex-col ${GAP.inline} border-b ${PADDING_Y.default}`}>
              <h2 className="text-base font-semibold text-foreground">Your resume</h2>
              <p className="text-sm text-muted-foreground">Use a PDF or Word file up to 10 MB.</p>
            </div>
          ) : null}
          <div className={`flex flex-col ${GAP.default}`}>
            {!quotaExhausted ? (
            <label
              htmlFor={resumeInputId}
              onDragOver={(event) => {
                if (uploadDisabled) {
                  return;
                }
                event.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => {
                if (!uploadDisabled) {
                  setIsDragActive(false);
                }
              }}
              onDrop={(event) => {
                if (uploadDisabled) {
                  event.preventDefault();
                  return;
                }
                handleDrop(event);
              }}
              className={uploadAreaClassName}
            >
              <input
                id={resumeInputId}
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                onChange={handleFileChange}
                disabled={uploadDisabled}
              />

              <div className="flex size-12 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
                {resumeFile ? <CheckCircledIcon aria-hidden="true" /> : <UploadIcon aria-hidden="true" />}
              </div>

              {resumeFile ? (
                <div className={`mt-5 flex max-w-md flex-col items-center ${GAP.inline}`}>
                  <p className="text-lg font-semibold text-foreground">{resumeFile.name}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(resumeFile.size)} ready to check</p>
                  <span
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                    onClick={(event) => {
                      event.preventDefault();
                      if (!uploadDisabled) {
                        openFilePicker();
                      }
                    }}
                  >
                    Replace file
                  </span>
                </div>
              ) : (
                <div className={`mt-5 flex max-w-md flex-col items-center ${GAP.inline}`}>
                  <p className="text-lg font-semibold text-foreground">
                    {uploadDisabled ? "Upload unavailable" : "Drag your resume here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {uploadDisabled
                      ? "Start with a blank resume below, or open your saved check."
                      : "PDF or Word file, up to 10 MB"}
                  </p>
                  <span
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                    onClick={(event) => {
                      event.preventDefault();
                      if (!uploadDisabled) {
                        openFilePicker();
                      }
                    }}
                  >
                    <FilePlusIcon data-icon="inline-start" aria-hidden="true" />
                    Browse files
                  </span>
                </div>
              )}
            </label>
            ) : null}

            {/* With upload unavailable this is the only route forward, so it
                carries the page rather than trailing a dropzone that cannot
                be used. */}
            <button
              type="button"
              onClick={onChooseScratchBuilder}
              aria-pressed={createFromScratch}
              className={cn(
                "group flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                createFromScratch
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card hover:border-foreground/20",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                  createFromScratch
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:text-foreground",
                )}
              >
                <Pencil1Icon />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-base font-semibold text-foreground">
                  Start with a blank resume
                </span>
                <span className="text-sm leading-6 text-muted-foreground">
                  Open the builder, fill in your details, and export when you&rsquo;re done.
                </span>
              </span>
            </button>

            {uploadError ? (
              <Alert variant="destructive">
                <AlertTitle>Upload issue</AlertTitle>
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            ) : (
              <p className="sr-only text-[#e16f62]" />
            )}
          </div>
        </div>
      </div>

      <div className={`mx-auto ${MARGIN_TOP.section} flex w-full max-w-3xl flex-col ${GAP.compact} border-t ${PADDING_Y.default} sm:flex-row sm:items-center sm:justify-between`}>
        <p className="text-sm leading-6 text-muted-foreground">
          {createFromScratch
            ? quotaExhausted
              ? ""
              : "You'll start with a blank resume and build it in the editor."
            : quotaLoading
              ? "Checking your free check allowance…"
              : quotaExhausted
                ? "Uploading for a new check is unavailable on this account."
                : resumeFile
                  ? `Selected file: ${resumeFile.name}`
                  : "Add a PDF or Word resume to continue."}
        </p>
        <Button type="button" onClick={onNext} disabled={!canContinue || quotaLoading}>
          {createFromScratch ? "Open Builder" : "Next: Pick Layout"}
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
