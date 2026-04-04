import React from "react";
import { ExperienceEntry } from "../../model/resume-form";

interface ExperienceEditorProps {
  entries: ExperienceEntry[];
  onAdd: () => void;
  onUpdate: (id: string, data: Partial<ExperienceEntry>) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
}

export function ExperienceEditor({ entries, onAdd, onUpdate, onRemove, onBack }: ExperienceEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-[color:var(--page-line)] px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-full text-[color:var(--page-muted)] hover:bg-[color:var(--page-bg)] hover:text-[color:var(--page-text)] transition"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h3 className="text-xl font-bold text-[color:var(--page-text)] tracking-tight">Work Experience</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {entries.map((entry, index) => (
          <div key={entry.id} className="relative p-6 rounded-2xl border border-[color:var(--page-line)] bg-white shadow-sm space-y-5">
            <button
              type="button"
              onClick={() => onRemove(entry.id)}
              className="absolute top-4 right-4 text-sm font-semibold text-rose-500 hover:text-rose-600 transition"
            >
              Remove
            </button>
            <p className="text-sm font-bold text-[color:var(--brand)] uppercase tracking-wider">Entry #{index + 1}</p>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[color:var(--page-muted)] uppercase tracking-wider">
                Role Name
              </label>
              <input
                type="text"
                value={entry.role}
                onChange={(e) => onUpdate(entry.id, { role: e.target.value })}
                className="w-full rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white"
                placeholder="Senior Product Designer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[color:var(--page-muted)] uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                value={entry.location}
                onChange={(e) => onUpdate(entry.id, { location: e.target.value })}
                className="w-full rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white"
                placeholder="Remote / San Francisco"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[color:var(--page-muted)] uppercase tracking-wider">
                Date Range
              </label>
              <input
                type="text"
                value={entry.dateRange}
                onChange={(e) => onUpdate(entry.id, { dateRange: e.target.value })}
                className="w-full rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white"
                placeholder="Jan 2022 — Present"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[color:var(--page-line-strong)] py-6 text-base font-semibold text-[color:var(--page-muted)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] transition"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add another Experience
        </button>
      </div>
    </div>
  );
}
