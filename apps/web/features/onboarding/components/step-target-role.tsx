import React from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GAP, PADDING, PADDING_Y, MARGIN_TOP } from "@/lib/design-tokens";

interface StepTargetRoleProps {
  targetRole: string;
  setTargetRole: (role: string) => void;
  onNext: () => void;
  canContinue: boolean;
}

const roleExamples = [
  "Senior Software Engineer",
  "Full Stack Developer",
  "Backend Engineer",
  "Staff Engineer",
  "DevOps Engineer",
  "Machine Learning Engineer",
];

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
    <section className="section-reveal flex flex-1 flex-col items-center justify-center overflow-y-auto bg-background px-4 py-8 sm:px-8">
      <div className="w-full max-w-3xl">
        <div className={`flex flex-col ${GAP.compact} text-left sm:items-center sm:text-center`}>
          <span className="sr-only">STEP 1 OF 5</span>
          <h1 className="display-serif text-3xl text-foreground sm:text-5xl">
            What job are you applying for?
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Use the job title from the posting so the advice matches the role.
          </p>
        </div>

        <div className={`mx-auto ${MARGIN_TOP.major} max-w-xl rounded-lg border bg-background ${PADDING.default} sm:p-5`}>
          <div className={`mb-4 border-b pb-4`}>
            <h2 className="text-base font-semibold text-foreground">Job title</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use the same title the company uses in the job post.</p>
          </div>
          <div>
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
          </div>

          <div className={`mt-5 flex flex-col items-stretch ${GAP.compact} border-t ${PADDING_Y.default}`}>
            <Button type="button" onClick={onNext} disabled={!canContinue} className="w-full">
              Next: Paste Job Post
              <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
            </Button>
            <div className={`flex flex-wrap justify-center ${GAP.inline}`}>
              {roleExamples.map((example) => (
                <Button
                  key={example}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTargetRole(example)}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <p className={`${MARGIN_TOP.default} text-center text-sm text-muted-foreground`}>
          Next, paste the job post so we can find the right job words.
        </p>
      </div>
    </section>
  );
}
