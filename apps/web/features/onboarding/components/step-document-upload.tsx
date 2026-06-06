import React from "react";
import { ArrowRight, FileCheck2, FileUp, Pencil, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <section className="section-reveal flex flex-1 flex-col bg-background px-4 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3 text-left sm:items-center sm:text-center">
          <Badge variant="secondary">STEP 3 OF 5</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Add your resume
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Upload your current resume, or start with a blank one if you want to build it here.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card>
            <CardHeader>
              <CardTitle>Your resume</CardTitle>
              <CardDescription>Use a PDF or Word file up to 10 MB.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <label
                htmlFor={resumeInputId}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-colors",
                  isDragActive ? "border-primary bg-accent" : "border-border bg-muted/40 hover:bg-accent/60",
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
                  {resumeFile ? <FileCheck2 aria-hidden="true" /> : <Upload aria-hidden="true" />}
                </div>

                {resumeFile ? (
                  <div className="mt-5 flex max-w-md flex-col items-center gap-2">
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
                  <div className="mt-5 flex max-w-md flex-col items-center gap-2">
                    <p className="text-lg font-semibold text-foreground">Drag your resume here</p>
                    <p className="text-sm text-muted-foreground">PDF or Word file, up to 10 MB</p>
                    <span
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                      onClick={(event) => {
                        event.preventDefault();
                        openFilePicker();
                      }}
                    >
                      <FileUp data-icon="inline-start" aria-hidden="true" />
                      Browse files
                    </span>
                  </div>
                )}
              </label>

              <Button
                type="button"
                variant={createFromScratch ? "secondary" : "outline"}
                className="h-auto justify-start gap-3 whitespace-normal px-4 py-3 text-left"
                onClick={() => {
                  setCreateFromScratch(true);
                }}
              >
                <Pencil data-icon="inline-start" aria-hidden="true" />
                <span className="flex flex-col gap-1">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What happens next</CardTitle>
              <CardDescription>We&apos;ll use this resume to make your suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">Resume status</p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {resumeFile ? "Ready to check" : createFromScratch ? "Blank resume selected" : "No file selected"}
                </p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium text-foreground">Next up</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Once your resume is ready, choose a clean layout that is easy for companies to read.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mx-auto mt-6 w-full max-w-6xl">
        <CardFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
          <p className="text-sm leading-6 text-muted-foreground">
            {createFromScratch
              ? "You'll start with a blank resume and build it in the editor."
              : resumeFile
                ? `Selected file: ${resumeFile.name}`
                : "Add a PDF or Word resume to continue."}
          </p>
          <Button type="button" onClick={onNext} disabled={!canContinue}>
            {createFromScratch ? "Open Builder" : "Next: Pick Layout"}
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
