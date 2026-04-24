import React from "react";
import { sampleTemplates, type ResumeTemplate } from "../../templates/model/template";
import { TemplateRealPreview } from "../../templates/components/template-preview";
import { ArrowRightIcon } from "./wizard-icons";

interface StepTemplateSelectionProps {
  selectedTemplateId: ResumeTemplate["id"];
  setSelectedTemplateId: (id: ResumeTemplate["id"]) => void;
  onNext: () => void;
  isSubmitting?: boolean;
  errorMessage?: string;
}

export function StepTemplateSelection({
  selectedTemplateId,
  setSelectedTemplateId,
  onNext,
  isSubmitting = false,
  errorMessage,
}: StepTemplateSelectionProps) {
  return (
    <section key="step-3" className="section-reveal flex flex-1 flex-col px-5 py-8 sm:px-8 lg:px-10">
      <div className="w-full">
        <div className="space-y-3 text-left sm:text-center">
          <div className="sm:flex sm:justify-center">
            <span className="step-pill">STEP 4 OF 5</span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-[color:var(--page-text)]">
            Select a Template
          </h1>
          <p className="max-w-[42rem] text-sm leading-6 text-[color:var(--page-muted)] sm:mx-auto">
            Choose from a smaller set of finished layouts so the preview and final resume
            view stay consistent.
          </p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {sampleTemplates.map((template) => {
              const isSelected = template.id === selectedTemplateId;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(template.id);
                  }}
                  className={`group relative overflow-hidden rounded-[18px] border bg-white text-left shadow-[0_12px_28px_rgba(59,75,138,0.07)] transition ${
                    isSelected
                      ? "border-[color:var(--brand)] ring-2 ring-[color:var(--brand-soft)]"
                      : "border-[color:var(--page-line)] hover:-translate-y-0.5 hover:border-[color:var(--page-line-strong)]"
                  }`}
                >
                  <div className={`h-[13.5rem] border-b border-[color:var(--page-line)] p-4 overflow-hidden ${template.thumbnailClass}`}>
                    <TemplateRealPreview variantId={template.id} />
                  </div>
                  <div className="space-y-2 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-[color:var(--page-text)]">
                            {template.name}
                          </p>
                          {template.isPremium && (
                            <span className="inline-flex rounded-full bg-[color:var(--brand)] px-2 py-0.5 text-[0.6rem] font-black tracking-widest text-white uppercase transform scale-90 origin-left">
                              PRO
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs font-medium text-[color:var(--page-muted)]">
                          <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-[color:var(--brand)]" : "bg-[color:var(--page-line-strong)]"}`} />
                          {template.atsLabel ?? "ATS-Friendly"}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <aside className="rounded-[24px] border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <p className="text-[0.7rem] font-black uppercase tracking-[0.25em] text-[color:var(--brand)]">
              Current Selection
            </p>
            <div className="mt-6 space-y-8">
              {(() => {
                const selectedTemplate = sampleTemplates.find((t) => t.id === selectedTemplateId);
                if (!selectedTemplate) return null;

                return (
                  <div className="space-y-6">
                    <div className={`aspect-[1/1.25] rounded-[20px] border border-[color:var(--page-line)] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.08)] bg-white overflow-hidden ${selectedTemplate.thumbnailClass} transition-all duration-500`}>
                      <TemplateRealPreview variantId={selectedTemplate.id} />
                    </div>
                    <div className="px-1 text-center sm:text-left">
                      <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                        <h4 className="text-xl font-bold text-[color:var(--page-text)] tracking-tight">
                          {selectedTemplate.name}
                        </h4>
                        {selectedTemplate.isPremium && (
                          <span className="rounded-full bg-[color:var(--brand-soft)] px-2 py-0.5 text-[0.6rem] font-bold text-[color:var(--brand)] uppercase">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-[color:var(--page-muted)] mb-4">
                        {selectedTemplate.description}
                      </p>
                      <div className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[color:var(--brand)] border border-[color:var(--page-line)] shadow-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-[color:var(--brand)] animate-pulse" />
                        {selectedTemplate.atsLabel}
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <div className="rounded-[20px] border border-dashed border-[color:var(--page-line-strong)] bg-[color:var(--brand-soft)]/30 p-5">
                <p className="text-xs font-medium text-[color:var(--page-text)] text-center leading-relaxed italic opacity-80 decoration-[color:var(--brand-soft)]">
                  &quot;The layout dynamically adapts to your content while maintaining high-fidelity design tokens.&quot;
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="mt-auto border-t border-[color:var(--page-line)] pt-6">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          {errorMessage ? (
            <p className="mr-auto text-sm text-[color:#b42318]">{errorMessage}</p>
          ) : (
            <p className="mr-auto text-sm text-[color:var(--page-muted)]">
              The analysis now runs through the Express backend before opening the workspace.
            </p>
          )}
          <button
            type="button"
            onClick={onNext}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[color:var(--brand)] px-8 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,107,255,0.22)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? "Generating Analysis..." : "Generate Analysis"}
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
