import type { ResumeTemplate } from "../model/template";

interface TemplateCardProps {
  template: ResumeTemplate;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={() => onSelect(template.id)}
      className={`group relative flex w-full flex-col overflow-hidden text-left transition-all duration-300 focus:outline-none ${
        isSelected
          ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-[1.02]"
          : "hover:scale-[1.01] hover:bg-slate-800/50"
      } rounded-2xl border ${
        isSelected ? "border-cyan-500/50 bg-slate-900 shadow-xl shadow-cyan-900/20" : "border-slate-800 bg-slate-950/80"
      }`}
    >
      <div className={`h-32 w-full flex items-center justify-center ${template.thumbnailClass}`}>
        <div className="h-[80%] w-[60%] rounded bg-slate-900/40 shadow-sm border border-white/5 backdrop-blur-sm flex flex-col p-2 space-y-2">
          {/* Wireframe representation of a resume */}
          <div className="h-1.5 w-1/3 bg-white/20 rounded-full" />
          <div className="h-1 w-full bg-white/10 rounded-full" />
          <div className="h-1 w-4/5 bg-white/10 rounded-full" />
          <div className="h-1 w-full bg-white/10 rounded-full" />
          <div className="mt-2 h-1 w-1/4 bg-white/20 rounded-full" />
          <div className="h-1 w-full bg-white/10 rounded-full" />
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-slate-100">{template.name}</h3>
          {template.isPremium && (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/20">
              PRO
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed line-clamp-2">
          {template.description}
        </p>
      </div>

      {isSelected && (
        <div className="absolute top-3 right-3 rounded-full bg-cyan-500 text-slate-950 p-1 shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
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
