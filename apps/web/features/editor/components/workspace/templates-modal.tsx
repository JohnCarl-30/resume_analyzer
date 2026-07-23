import React from "react";
import { CloseIcon } from "../../../onboarding/components/wizard-icons";
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
        <div className="flex h-full flex-col">
          <header className="flex shrink-0 items-center justify-between border-b border-[color:var(--page-line)] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-xl font-semibold tracking-tight text-[color:var(--page-text)]">
                Choose resume style
              </DialogTitle>
              <DialogDescription className="sr-only">
                Choose a resume style and preview your content in that layout.
              </DialogDescription>
              <p className="text-sm text-[color:var(--page-muted)]">Preview your content in another layout.</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="group flex size-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-white transition hover:border-[color:var(--page-line-strong)] hover:bg-[color:var(--page-bg-strong)] active:scale-95"
              aria-label="Close modal"
            >
              <CloseIcon />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sampleTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={activeTemplateId === template.id}
                  onSelect={() => onSelectTemplate(template.id)}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-[color:var(--page-line)] px-5 py-4 sm:px-6">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-white px-4 text-sm font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--page-line-strong)]"
              >
                Close selection
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
