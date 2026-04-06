import { TemplatePreview } from "./template-preview";
import type { ResumeTemplate } from "../model/template";

interface TemplateCardProps {
  template: ResumeTemplate;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      aria-pressed={isSelected}
      className={`group relative flex w-full flex-col overflow-hidden rounded-[28px] border text-left transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--app-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
        isSelected
          ? "translate-y-[-4px] border-[rgba(152,229,195,0.42)] bg-white/[0.06] shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
          : "border-white/10 bg-white/[0.025] hover:translate-y-[-2px] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <div
        className={`relative flex h-40 w-full items-center justify-center overflow-hidden p-4 ${template.thumbnailClass}`}
      >
        <TemplatePreview variant={template.previewVariant} />
      </div>

      <div className="space-y-3 px-5 py-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-[color:var(--app-text)]">{template.name}</h3>
          {template.isPremium && (
            <span className="rounded-full border border-[rgba(217,255,181,0.18)] bg-[rgba(217,255,181,0.08)] px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--app-accent-strong)]">
              PRO
            </span>
          )}
        </div>
        <p className="text-sm leading-6 text-[color:var(--app-muted)]">{template.description}</p>
      </div>

      {isSelected && (
        <div className="absolute right-4 top-4 rounded-full bg-[color:var(--app-accent)] p-1 text-slate-950 shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
