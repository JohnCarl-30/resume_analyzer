import React from "react";
import { CloseIcon } from "../../../onboarding/components/wizard-icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TemplateCard } from "../../../templates/components/template-card";
import { sampleTemplates, type ResumeTemplateVariant } from "../../../templates/model/template";

interface TemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTemplateId: ResumeTemplateVariant;
  onSelectTemplate: (templateId: ResumeTemplateVariant) => void;
}

export function TemplatesModal({
  open,
  onOpenChange,
  activeTemplateId,
  onSelectTemplate,
}: TemplatesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[92vh] max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-xl border border-[color:var(--page-line)] bg-white p-0 text-[color:var(--page-text)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:max-w-5xl"
      >
        <div className="flex h-full max-h-[inherit] flex-col">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[color:var(--page-line)] px-5 py-4 sm:px-6">
            <div className="min-w-0 flex flex-col gap-1">
              <DialogTitle className="text-xl font-semibold tracking-tight text-[color:var(--page-text)] text-balance">
                Choose resume style
              </DialogTitle>
              <DialogDescription className="text-sm leading-5 text-[color:var(--page-muted)] text-pretty">
                Your content stays the same. Only the layout changes.
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-white text-[color:var(--page-muted)] transition-all duration-140 ease-out hover:border-[color:var(--page-line-strong)] hover:bg-[color:var(--page-bg)] hover:text-[color:var(--page-text)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/25 active:scale-95"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sampleTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={activeTemplateId === template.id}
                  onSelect={onSelectTemplate}
                />
              ))}
            </div>
          </div>

          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[color:var(--page-line)] px-5 py-4 sm:px-6">
            <p className="text-xs leading-5 text-[color:var(--page-muted)]">
              Applies to the preview right away.
            </p>
            <Button type="button" variant="outline" size="lg" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
