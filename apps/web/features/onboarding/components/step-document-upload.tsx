import React from "react";
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
  setCreateFromScratch: (value: boolean) => void;
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
  setCreateFromScratch,
}: StepDocumentUploadProps) {
  return (
    <section className="section-reveal flex flex-1 flex-col overflow-y-auto bg-background px-4 py-8 sm:px-8 lg:px-10">
      <div className={`mx-auto flex w-full max-w-6xl flex-1 flex-col ${GAP.section}`}>
        <div className={`flex flex-col ${GAP.compact} text-left sm:items-center sm:text-center`}>
          <span className="sr-only">STEP 3 OF 5</span>
          <h1 className="display-serif text-3xl text-foreground sm:text-5xl">
            Add your resume
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Upload your current resume, or start with a blank one if you want to build it here.
          </p>
        </div>

        <div className={`mx-auto flex w-full max-w-3xl flex-col ${GAP.default}`}>
          <div className={`flex flex-col ${GAP.inline} border-b ${PADDING_Y.default}`}>
            <h2 className="text-base font-semibold text-foreground">Your resume</h2>
            <p className="text-sm text-muted-foreground">Use a PDF or Word file up to 10 MB.</p>
          </div>
          <div className={`flex flex-col ${GAP.default}`}>
            <label
              htmlFor={resumeInputId}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={handleDrop}
              className={cn(
                "flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-8 text-center transition-colors",
                isDragActive ? "border-primary bg-accent" : "border-border bg-background hover:bg-muted/40",
              )}
            >
              <input
                id={resumeInputId}
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                onChange={handleFileChange}
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
                      openFilePicker();
                    }}
                  >
                    Replace file
                  </span>
                </div>
              ) : (
                <div className={`mt-5 flex max-w-md flex-col items-center ${GAP.inline}`}>
                  <p className="text-lg font-semibold text-foreground">Drag your resume here</p>
                  <p className="text-sm text-muted-foreground">PDF or Word file, up to 10 MB</p>
                  <span
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                    onClick={(event) => {
                      event.preventDefault();
                      openFilePicker();
                    }}
                  >
                    <FilePlusIcon data-icon="inline-start" aria-hidden="true" />
                    Browse files
                  </span>
                </div>
              )}
            </label>

            <Button
              type="button"
              variant={createFromScratch ? "secondary" : "outline"}
              className={`h-auto justify-start ${GAP.compact} whitespace-normal ${PADDING.default} py-3 text-left`}
              onClick={() => {
                setCreateFromScratch(true);
              }}
            >
              <Pencil1Icon data-icon="inline-start" aria-hidden="true" />
              <span className={`flex flex-col ${GAP.tight}`}>
                <span>Start with a blank resume</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Open the builder and fill it in yourself.
                </span>
              </span>
            </Button>

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
            ? "You'll start with a blank resume and build it in the editor."
            : resumeFile
              ? `Selected file: ${resumeFile.name}`
              : "Add a PDF or Word resume to continue."}
        </p>
        <Button type="button" onClick={onNext} disabled={!canContinue}>
          {createFromScratch ? "Open Builder" : "Next: Pick Layout"}
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
