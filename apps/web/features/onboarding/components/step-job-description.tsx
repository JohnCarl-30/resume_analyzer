import React from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

interface StepJobDescriptionProps {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  onNext: () => void;
  canContinue: boolean;
}

export function StepJobDescription({
  jobDescription,
  setJobDescription,
  onNext,
  canContinue,
}: StepJobDescriptionProps) {
  const MAX_LENGTH = 10000;
  const trimmedLength = jobDescription.trim().length;
  const jobDescriptionError =
    trimmedLength > 0 && trimmedLength < 30
      ? "Paste at least 30 characters from the job description."
      : trimmedLength > MAX_LENGTH
        ? `Job description must be ${MAX_LENGTH} characters or less.`
        : "";
  const isNearLimit = trimmedLength > MAX_LENGTH * 0.9;

  return (
    <section className="section-reveal flex flex-1 flex-col items-center justify-center overflow-y-auto bg-background px-4 py-8 sm:px-8">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col gap-3 text-left sm:items-center sm:text-center">
          <span className="sr-only">STEP 2 OF 5</span>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Paste the job post
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Copy the responsibilities, requirements, and tools from the job post.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-lg border bg-background p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4 border-b pb-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">Job post</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste responsibilities, requirements, and qualifications from the posting.
              </p>
            </div>
            {jobDescription.length > 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setJobDescription("")}>
                Clear
              </Button>
            ) : null}
          </div>

          <div className="pt-4">
            <FieldGroup>
              <Field data-invalid={jobDescriptionError ? "true" : undefined}>
                <FieldLabel htmlFor="job-description">Job post text</FieldLabel>
                <Textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the job post here..."
                  rows={10}
                  aria-invalid={Boolean(jobDescriptionError)}
                  className="min-h-60 resize-y"
                />
                {jobDescriptionError ? (
                  <FieldError>{jobDescriptionError}</FieldError>
                ) : (
                  <FieldDescription>Include required skills, tools, and responsibilities when available.</FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </div>

          <div className="mt-5 flex flex-col items-stretch gap-4 border-t pt-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className={isNearLimit ? "font-semibold text-destructive" : "text-muted-foreground"}>
                {trimmedLength} / {MAX_LENGTH} characters
              </span>
              <Badge variant={canContinue ? "secondary" : "outline"}>
                {canContinue ? "Ready" : "Minimum 30 characters"}
              </Badge>
            </div>
            <Button type="button" onClick={onNext} disabled={!canContinue} className="w-full">
              Next: Add Resume
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
