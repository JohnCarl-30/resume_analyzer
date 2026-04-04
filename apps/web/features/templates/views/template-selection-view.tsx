"use client";

import { TemplateCard } from "../components/template-card";
import { useTemplateSelection } from "../view-models/use-template-selection";

export function TemplateSelectionView() {
  const { heading, description, templates, selectedTemplateId, selectTemplate } = useTemplateSelection();
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);

  return (
    <section className="px-5 py-6 sm:px-8 sm:py-8">
      <div className="space-y-3 border-b border-[color:var(--app-line)] pb-6">
        <p className="utility-label text-[color:var(--app-accent)]">Output templates</p>
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{heading}</h2>
        <p className="max-w-3xl text-sm leading-6 text-[color:var(--app-muted)] sm:text-base">
          {description}
        </p>
      </div>

      <div className="grid gap-5 pt-6 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={template.id === selectedTemplateId}
            onSelect={selectTemplate}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-[color:var(--app-line)] pt-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="utility-label text-[color:var(--app-accent)]">Selected for next export</p>
          <h3 className="text-2xl text-[color:var(--app-text)]">{selectedTemplate?.name}</h3>
          <p className="max-w-2xl text-sm leading-6 text-[color:var(--app-muted)]">
            {selectedTemplate?.description}
          </p>
        </div>
        <p className="max-w-md text-sm leading-6 text-[color:var(--app-muted)]">
          Switch layouts at any point without affecting intake status or role scoring. The
          presentation layer stays independent from the analysis pipeline.
        </p>
      </div>
    </section>
  );
}
