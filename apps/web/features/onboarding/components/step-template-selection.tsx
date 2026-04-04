import React from "react";
import { sampleTemplates } from "../../templates/model/template";
import { TemplatePreview } from "../../templates/components/template-preview";
import { ArrowRightIcon } from "./wizard-icons";

interface StepTemplateSelectionProps {
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  onNext: () => void;
}

export function StepTemplateSelection({
  selectedTemplateId,
  setSelectedTemplateId,
  onNext,
}: StepTemplateSelectionProps) {
  return (
    <section key="step-3" className="section-reveal flex flex-1 flex-col px-5 py-8 sm:px-8 lg:px-10">
      <div className="w-full">
        <div className="space-y-3 text-left sm:text-center">
          <div className="sm:flex sm:justify-center">
            <span className="step-pill">STEP 3 OF 3</span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-[color:var(--page-text)]">
            Select a Template
          </h1>
          <p className="max-w-[42rem] text-sm leading-6 text-[color:var(--page-muted)] sm:mx-auto">
            Choose an ATS-optimized layout for your final resume. All templates pass
            standard parser checks.
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
                  <div className={`h-[13.5rem] border-b border-[color:var(--page-line)] p-4 ${template.thumbnailClass}`}>
                    <TemplatePreview variant={template.previewVariant} />
                  </div>
                  <div className="space-y-2 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-[color:var(--page-text)]">
                          {template.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-[color:var(--page-muted)]">
                          <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
                          {template.atsLabel ?? "ATS-Friendly"}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <aside className="rounded-[20px] border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] p-5 shadow-[0_10px_26px_rgba(0,0,0,0.03)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
              Selection
            </p>
            <div className="mt-5 space-y-4">
              <div className="rounded-[16px] border border-[color:var(--page-line)] bg-white p-4">
                <p className="text-sm font-semibold text-[color:var(--page-text)] text-center italic">
                  &quot;The layout will be adapted to your unique content structure while keeping these design tokens.&quot;
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="mt-auto border-t border-[color:var(--page-line)] pt-6">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[color:var(--brand)] px-8 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,107,255,0.22)] transition hover:bg-[color:var(--brand-strong)]"
          >
            Finish and Complete
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
