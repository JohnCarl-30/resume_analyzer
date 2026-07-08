import React from "react";
import { ArrowRight, CheckCircle2, FileText, Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const selectedTemplate = sampleTemplates.find((t) => t.id === selectedTemplateId);

  return (
    <section className="section-reveal flex flex-1 flex-col overflow-y-auto bg-background px-4 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3 text-left sm:items-center sm:text-center">
          <span className="sr-only">STEP 4 OF 5</span>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Pick a clean resume style
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            These layouts use readable text and familiar section names, which makes them easier
            for resume scanners and hiring managers to read.
          </p>
        </div>

        {/* Resume / Template Toggle */}
        {hasResumeFile ? (
          <Card className="p-4">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">Use your resume or start fresh?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose whether to check your uploaded resume or begin with sample text.
              </p>
            </div>
            <ToggleGroup
              type="single"
              value={useTemplateContent ? "template" : "resume"}
              onValueChange={(value) => {
                if (value === "template") setUseTemplateContent(true);
                if (value === "resume") setUseTemplateContent(false);
              }}
              className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
              variant="outline"
            >
              <ToggleGroupItem
                value="resume"
                className="h-auto justify-start gap-3 px-4 py-3 text-left whitespace-normal"
              >
                <FileText className="shrink-0 text-muted-foreground" />
                <span className="flex flex-col gap-1">
                  <span className="font-medium">Use my uploaded resume</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Check the resume you added.
                  </span>
                </span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="template"
                className="h-auto justify-start gap-3 px-4 py-3 text-left whitespace-normal"
              >
                <Sparkles className="shrink-0 text-muted-foreground" />
                <span className="flex flex-col gap-1">
                  <span className="font-medium">Start fresh</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Use sample resume text first.
                  </span>
                </span>
              </ToggleGroupItem>
            </ToggleGroup>
          </Card>
        ) : null}

        {/* Main Content: Template Grid + Preview Sidebar */}
        <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
          {/* Template Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sampleTemplates.map((template) => {
              const isSelected = template.id === selectedTemplateId;

              return (
                <Card
                  key={template.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedTemplateId(template.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedTemplateId(template.id);
                    }
                  }}
                  className={cn(
                    "group min-w-0 cursor-pointer overflow-hidden transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:-translate-y-0.5 hover:bg-accent/40",
                  )}
                >
                  <div className={cn("h-56 overflow-hidden border-b p-4", template.thumbnailClass)}>
                    <TemplateRealPreview variantId={template.id} />
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-base font-semibold text-foreground">{template.name}</p>
                      <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                        {template.atsRecommended ? (
                          <Badge variant="secondary">Recommended</Badge>
                        ) : null}
                        {template.isPremium ? <Badge>PRO</Badge> : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      {isSelected ? (
                        <CheckCircle2 aria-hidden="true" className="text-primary" />
                      ) : (
                        <span className="size-2 rounded-full bg-border" />
                      )}
                      {template.atsLabel ?? "Scanner friendly"}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Selected Template Preview Sidebar */}
          <aside className="flex flex-col gap-4">
            <Card className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Selected</Badge>
                {selectedTemplate?.isPremium ? <Badge variant="outline">Premium</Badge> : null}
              </div>

              {selectedTemplate ? (
                <>
                  <div
                    className={cn(
                      "aspect-[1/1.25] overflow-hidden rounded-xl border bg-background p-4",
                      selectedTemplate.thumbnailClass,
                    )}
                  >
                    <TemplateRealPreview variantId={selectedTemplate.id} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{selectedTemplate.name}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {selectedTemplate.description}
                    </p>
                    <Badge variant="outline" className="w-fit">
                      <CheckCircle2 className="mr-1 size-3" />
                      {selectedTemplate.atsLabel}
                    </Badge>
                  </div>
                </>
              ) : null}
            </Card>
          </aside>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mx-auto mt-6 flex w-full max-w-6xl flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
        {errorMessage ? (
          <Alert variant="destructive" className="mr-auto">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : (
          <p className="mr-auto text-sm leading-6 text-muted-foreground">
            {useTemplateContent
              ? "Using sample resume text. The resume check will run against sample data."
              : "We'll check for missing job words, familiar section names, and stronger bullet points."}
          </p>
        )}
        <Button type="button" variant="outline" onClick={onSkipTemplate} disabled={isSubmitting}>
          Use recommended style
        </Button>
        <Button type="button" onClick={onNext} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Checking resume...
            </>
          ) : (
            <>
              Check my resume
              <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
