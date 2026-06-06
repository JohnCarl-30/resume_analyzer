import React from "react";
import { ArrowRight, CheckCircle2, FileCheck2, SearchCheck, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { sampleTemplates, type ResumeTemplate } from "../../templates/model/template";
import { TemplateRealPreview } from "../../templates/components/template-preview";

interface StepTemplateSelectionProps {
  selectedTemplateId: ResumeTemplate["id"];
  setSelectedTemplateId: (id: ResumeTemplate["id"]) => void;
  useTemplateContent: boolean;
  setUseTemplateContent: (value: boolean) => void;
  hasResumeFile: boolean;
  onNext: () => void;
  onSkipTemplate?: () => void;
  isSubmitting?: boolean;
  errorMessage?: string;
}

export function StepTemplateSelection({
  selectedTemplateId,
  setSelectedTemplateId,
  useTemplateContent,
  setUseTemplateContent,
  hasResumeFile,
  onNext,
  onSkipTemplate,
  isSubmitting = false,
  errorMessage,
}: StepTemplateSelectionProps) {
  const selectedTemplate = sampleTemplates.find((template) => template.id === selectedTemplateId);
  const atsChecks = [
    "Uses familiar section names.",
    "Keeps contact details as readable text.",
    "Avoids graphics that resume scanners may miss.",
    "Checks job keywords before the editor opens.",
  ];

  return (
    <section className="section-reveal flex flex-1 flex-col bg-background px-4 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3 text-left sm:items-center sm:text-center">
          <Badge variant="secondary">STEP 4 OF 5</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Pick a scanner-friendly layout
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Some companies use resume scanners. This layout keeps your resume easy for scanners and people to read.
          </p>
        </div>

        <Alert>
          <SearchCheck aria-hidden="true" />
          <AlertTitle>Works with company resume scanners</AlertTitle>
          <AlertDescription>
            Applicant Tracking Systems, often called ATS, read resumes before a person sees them. We keep the
            default layout simple so those systems can understand it.
          </AlertDescription>
        </Alert>

        {hasResumeFile ? (
          <Card>
            <CardHeader>
              <CardTitle>Use your resume or start fresh?</CardTitle>
              <CardDescription>Choose whether to check your uploaded resume or begin with sample text.</CardDescription>
            </CardHeader>
            <CardContent>
              <ToggleGroup
                type="single"
                value={useTemplateContent ? "template" : "resume"}
                onValueChange={(value) => {
                  if (value === "template") {
                    setUseTemplateContent(true);
                  }
                  if (value === "resume") {
                    setUseTemplateContent(false);
                  }
                }}
                className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
                variant="outline"
              >
                <ToggleGroupItem value="resume" className="h-auto justify-start px-4 py-3 text-left whitespace-normal">
                  <span className="flex flex-col gap-1">
                    <span>Use my uploaded resume</span>
                    <span className="text-xs font-normal text-muted-foreground">Check the resume you added.</span>
                  </span>
                </ToggleGroupItem>
                <ToggleGroupItem value="template" className="h-auto justify-start px-4 py-3 text-left whitespace-normal">
                  <span className="flex flex-col gap-1">
                    <span>Start fresh</span>
                    <span className="text-xs font-normal text-muted-foreground">Use sample resume text first.</span>
                  </span>
                </ToggleGroupItem>
              </ToggleGroup>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid w-full grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sampleTemplates.map((template) => {
              const isSelected = template.id === selectedTemplateId;

              return (
                <button
                  type="button"
                  key={template.id}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={cn(
                    "block min-w-0 rounded-xl text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "ring-2 ring-primary/20"
                      : "hover:-translate-y-0.5",
                  )}
                >
                  <Card
                    className={cn(
                      "group h-full min-w-0 overflow-hidden transition-all",
                      isSelected ? "border-primary" : "border-border hover:bg-accent/40",
                    )}
                  >
                    <div className={cn("h-56 overflow-hidden border-b p-4", template.thumbnailClass)}>
                      <TemplateRealPreview variantId={template.id} />
                    </div>
                    <div className="flex flex-col gap-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-base font-semibold text-foreground">{template.name}</p>
                        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                          {template.atsRecommended ? <Badge variant="secondary">Recommended</Badge> : null}
                          {template.isPremium ? <Badge>PRO</Badge> : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        {isSelected ? (
                          <CheckCircle2 aria-hidden="true" className="text-primary" />
                        ) : (
                          <span className="size-2 rounded-full bg-border" />
                        )}
                        {template.atsLabel ?? "ATS-Friendly"}
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>

          <aside>
            <Card>
              <CardHeader>
                <Badge variant="secondary">Selected layout</Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {selectedTemplate ? (
                  <>
                    <div className={cn("aspect-[1/1.25] overflow-hidden rounded-xl border bg-background p-4", selectedTemplate.thumbnailClass)}>
                      <TemplateRealPreview variantId={selectedTemplate.id} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xl font-semibold tracking-tight text-foreground">{selectedTemplate.name}</h4>
                        {selectedTemplate.isPremium ? <Badge variant="secondary">Premium</Badge> : null}
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{selectedTemplate.description}</p>
                      <Badge variant="outline" className="w-fit">
                        <Sparkles aria-hidden="true" />
                        {selectedTemplate.atsLabel}
                      </Badge>
                    </div>
                  </>
                ) : null}
                <div className="rounded-lg border border-dashed bg-accent/40 p-4">
                  <div className="flex items-start gap-3">
                    <FileCheck2 aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Scanner-friendly checklist</p>
                      <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-6 text-muted-foreground">
                        {atsChecks.map((item) => (
                          <li key={item} className="flex gap-2">
                            <CheckCircle2 aria-hidden="true" className="mt-1 shrink-0 text-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <Card className="mx-auto mt-6 w-full max-w-6xl">
        <CardFooter className="flex-col gap-3 sm:flex-row sm:justify-end">
          {errorMessage ? (
            <Alert variant="destructive" className="mr-auto">
              <AlertTitle>Resume check failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : (
            <p className="mr-auto text-sm leading-6 text-muted-foreground">
              {useTemplateContent
                ? "Using sample resume text. The resume check will run against sample data."
                : "We'll check for missing job keywords, familiar section names, and stronger bullet points."}
            </p>
          )}
          <Button type="button" variant="outline" onClick={onSkipTemplate} disabled={isSubmitting}>
            Use Default Layout
          </Button>
          <Button type="button" onClick={onNext} disabled={isSubmitting}>
            {isSubmitting ? "Checking Resume..." : "Check My Resume"}
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
