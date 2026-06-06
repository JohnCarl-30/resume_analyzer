import React from "react";
import { ArrowRight, Briefcase, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface StepTargetRoleProps {
  targetRole: string;
  setTargetRole: (role: string) => void;
  onNext: () => void;
  canContinue: boolean;
}

const roleExamples = ["Senior Frontend Engineer", "Product Manager", "Data Analyst"];

export function StepTargetRole({
  targetRole,
  setTargetRole,
  onNext,
  canContinue,
}: StepTargetRoleProps) {
  const trimmedTargetRole = targetRole.trim();
  const roleError =
    trimmedTargetRole.length > 0 && trimmedTargetRole.length < 2
      ? "Enter at least 2 characters for the target role."
      : "";

  return (
    <section className="section-reveal flex flex-1 flex-col items-center justify-center bg-background px-4 py-6 sm:px-8">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="secondary">STEP 1 OF 5</Badge>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              What job are you applying for?
            </h1>
            <p className="mx-auto max-w-xl text-base leading-7 text-muted-foreground">
              Type the job title from the posting. We&apos;ll use it to make the resume advice specific.
            </p>
          </div>
        </div>

        <Card className="mx-auto mt-8 max-w-xl">
          <CardHeader className="items-center text-center">
            <div className="flex size-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Briefcase aria-hidden="true" />
            </div>
            <CardTitle>Job title</CardTitle>
            <CardDescription>Use the same title the company uses in the job post.</CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <Field data-invalid={roleError ? "true" : undefined}>
                <FieldLabel htmlFor="target-role">Job title</FieldLabel>
                <Input
                  id="target-role"
                  value={targetRole}
                  onChange={(event) => {
                    setTargetRole(event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && canContinue) {
                      onNext();
                    }
                  }}
                  placeholder="e.g. Senior Frontend Engineer"
                  aria-invalid={Boolean(roleError)}
                  autoComplete="organization-title"
                  autoFocus
                />
                {roleError ? (
                  <FieldError>{roleError}</FieldError>
                ) : (
                  <FieldDescription>Use the title from the job post when you have it.</FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex-col items-stretch gap-3">
            <Button type="button" onClick={onNext} disabled={!canContinue} className="w-full">
              Next: Paste Job Post
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
            <div className="flex flex-wrap justify-center gap-2">
              {roleExamples.map((example) => (
                <Badge key={example} variant="outline">
                  <CheckCircle2 aria-hidden="true" />
                  {example}
                </Badge>
              ))}
            </div>
          </CardFooter>
        </Card>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Next: paste the job post, add your resume, choose a layout, then get plain-language tips.
        </p>
      </div>
    </section>
  );
}
