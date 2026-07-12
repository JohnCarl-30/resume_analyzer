import { TemplateRealPreview } from "./template-preview";
import type { ResumeTemplate } from "../model/template";
import { Badge } from "@/components/ui/badge";
import { GAP, PADDING } from "@/lib/design-tokens";

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
      className={`group relative flex w-full flex-col overflow-hidden rounded-lg border bg-white text-left transition-[border-color,box-shadow] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-2 ${
        isSelected
          ? "border-foreground/50"
          : "border-border hover:border-foreground/20 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      }`}
    >
      <div
        className={`relative flex h-44 w-full items-center justify-center overflow-hidden border-b ${PADDING.default} ${template.thumbnailClass}`}
      >
        <TemplateRealPreview variantId={template.id} />
      </div>

      <div className={`flex flex-col ${GAP.default} ${PADDING.default}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{template.name}</h3>
          <div className={`flex flex-wrap justify-end ${GAP.inline}`}>
            {template.atsRecommended ? (
              <Badge variant="secondary">Recommended</Badge>
            ) : null}
            {template.isPremium && (
              <Badge>PRO</Badge>
            )}
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{template.description}</p>
        <span className="inline-flex w-fit text-xs font-medium text-muted-foreground">
          {template.atsLabel ?? "Scanner friendly"}
        </span>
      </div>

      {isSelected && (
        <div className={`absolute right-3 top-3 rounded-full bg-primary ${PADDING.tight} text-primary-foreground`}>
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
