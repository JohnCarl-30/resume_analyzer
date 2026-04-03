import { TemplateCard } from "../components/template-card";
import { useTemplateSelection } from "../view-models/use-template-selection";

export function TemplateSelectionView() {
  const { heading, description, templates, selectedTemplateId, selectTemplate } = useTemplateSelection();

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-slate-950/30">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">Templates</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h2>
        <p className="max-w-2xl text-base text-slate-300 sm:text-lg">{description}</p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={template.id === selectedTemplateId}
            onSelect={selectTemplate}
          />
        ))}
      </div>
    </section>
  );
}
