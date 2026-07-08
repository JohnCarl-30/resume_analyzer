import { TemplateRealPreview } from "./template-preview";
import type { ResumeTemplate } from "../model/template";
import { Badge } from "@/components/ui/badge";

interface TemplateCardProps {
  template: ResumeTemplate;
  isSelected: boolean;
  onSelect: (id: ResumeTemplate["id"]) => void;
}

export function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      aria-pressed={isSelected}
      className={`group relative flex w-full flex-col overflow-hidden rounded-lg border bg-white text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isSelected
          ? "border-primary ring-2 ring-primary/15"
          : "border-border hover:border-primary/60 hover:bg-accent/30"
      }`}
    >
      <div
        className={`relative flex h-44 w-full items-center justify-center overflow-hidden border-b p-4 ${template.thumbnailClass}`}
      >
        <TemplateRealPreview variantId={template.id} />
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">{template.name}</h3>
          <div className="flex flex-wrap justify-end gap-1.5">
            {template.atsRecommended ? (
              <Badge variant="secondary">Recommended</Badge>
            ) : null}
            {template.isPremium && (
              <Badge>PRO</Badge>
            )}
          </div>
        </div>
        <span className="inline-flex w-fit rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {template.atsLabel ?? "Scanner friendly"}
        </span>
        <p className="text-sm leading-6 text-muted-foreground">{template.description}</p>
      </div>

      {isSelected && (
        <div className="absolute right-3 top-3 rounded-full bg-primary p-1 text-primary-foreground shadow-sm">
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
