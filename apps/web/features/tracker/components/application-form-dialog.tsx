"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  emptyFormValues,
  type JobApplicationFormValues,
  type JobApplicationStatus,
} from "../model/job-application";
import { StatusMenu } from "./status-menu";

interface ApplicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialValues?: JobApplicationFormValues;
  isSubmitting: boolean;
  onSubmit: (values: JobApplicationFormValues) => Promise<void> | void;
}

export function ApplicationFormDialog({
  open,
  onOpenChange,
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
}: ApplicationFormDialogProps) {
  const [values, setValues] = useState<JobApplicationFormValues>(
    initialValues ?? emptyFormValues,
  );
  const [error, setError] = useState("");

  // Reset the form whenever the dialog opens for a new record.
  useEffect(() => {
    if (open) {
      setValues(initialValues ?? emptyFormValues);
      setError("");
    }
  }, [open, initialValues]);

  function setField<Key extends keyof JobApplicationFormValues>(
    key: Key,
    value: JobApplicationFormValues[Key],
  ) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.company.trim() || !values.role.trim()) {
      setError("Company and role are required.");
      return;
    }

    setError("");

    try {
      await onSubmit(values);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Track a new application" : "Edit application"}
          </DialogTitle>
          <DialogDescription>
            Keep tabs on where your resume went and how each conversation is
            progressing.
          </DialogDescription>
        </DialogHeader>

        <form
          id="application-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Field>
            <FieldLabel htmlFor="application-company">Company</FieldLabel>
            <Input
              id="application-company"
              value={values.company}
              onChange={(event) => setField("company", event.target.value)}
              placeholder="Acme Inc."
              autoFocus
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="application-role">Role</FieldLabel>
            <Input
              id="application-role"
              value={values.role}
              onChange={(event) => setField("role", event.target.value)}
              placeholder="Frontend Engineer"
              required
            />
          </Field>

          <Field>
            <FieldLabel>Status</FieldLabel>
            <div>
              <StatusMenu
                value={values.status}
                onChange={(status: JobApplicationStatus) =>
                  setField("status", status)
                }
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="application-location">
              Location <span className="text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              id="application-location"
              value={values.location}
              onChange={(event) => setField("location", event.target.value)}
              placeholder="Remote · Berlin"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="application-url">
              Job posting URL{" "}
              <span className="text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              id="application-url"
              type="url"
              value={values.jobUrl}
              onChange={(event) => setField("jobUrl", event.target.value)}
              placeholder="https://..."
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="application-notes">
              Notes <span className="text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Textarea
              id="application-notes"
              value={values.notes}
              onChange={(event) => setField("notes", event.target.value)}
              placeholder="Referral from Sam, follow up next week…"
            />
          </Field>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="application-form" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving…"
              : mode === "create"
                ? "Add application"
                : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
