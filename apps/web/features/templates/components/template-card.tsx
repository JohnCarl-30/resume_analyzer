import { TemplateRealPreview } from "./template-preview";
import type { ResumeTemplate } from "../model/template";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
      aria-label={`${template.name}${isSelected ? ", selected" : ""}`}
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-lg border bg-white text-left transition-all duration-200 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/25 focus-visible:ring-offset-2",
        "active:scale-[0.99] motion-reduce:transition-none",
        isSelected
          ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]"
          : "border-[color:var(--page-line)] hover:border-[color:var(--page-line-strong)] hover:bg-[color:var(--page-bg)] hover:shadow-[0_4px_12px_rgba(21,93,252,0.12)]",
      )}
    >
      <div className="relative flex h-44 w-full shrink-0 items-center justify-center overflow-hidden border-b border-[color:var(--page-line)] bg-[color:var(--page-bg)] p-4">
        <TemplateRealPreview variantId={template.id} />
        {isSelected ? (
          <span
            className="absolute right-3 top-3 inline-flex size-7 items-center justify-center rounded-full bg-[color:var(--brand)] text-white shadow-none"
            aria-hidden="true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight text-[color:var(--page-text)] text-balance">
            {template.name}
          </h3>
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
            {template.atsRecommended ? <Badge variant="secondary">Recommended</Badge> : null}
            {template.isPremium ? <Badge variant="outline">Pro</Badge> : null}
          </div>
        </div>

        <p className="line-clamp-3 text-sm leading-5 text-[color:var(--page-muted)] text-pretty">
          {template.description}
        </p>

        <p className="mt-auto pt-1 text-xs font-medium text-[color:var(--page-muted)]">
          {template.atsLabel ?? "Good for scanners"}
        </p>
      </div>
    </button>
  );
}
