import React from "react";
import { LeadershipEntry } from "../../model/resume-form";
import { SectionEditorHeader } from "./section-editor-header";

interface LeadershipEditorProps {
  entries: LeadershipEntry[];
  onAdd: () => void;
  onUpdate: (id: string, data: Partial<LeadershipEntry>) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
  title?: string;
  addLabel?: string;
  roleLabel?: string;
  rolePlaceholder?: string;
  organizationLabel?: string;
  organizationPlaceholder?: string;
  locationLabel?: string;
  locationPlaceholder?: string;
  dateLabel?: string;
  datePlaceholder?: string;
}

export function LeadershipEditor({
  entries,
  onAdd,
  onUpdate,
  onRemove,
  onBack,
  title = "Leadership",
  addLabel = "Add another Entry",
  roleLabel = "Leadership Role",
  rolePlaceholder = "President",
  organizationLabel = "Organization",
  organizationPlaceholder = "Student Council",
  locationLabel = "Location",
  locationPlaceholder = "City, Province",
  dateLabel = "Date Range",
  datePlaceholder = "Jan 2023 — Present",
}: LeadershipEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <SectionEditorHeader title={title} onBack={onBack} />

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
                {roleLabel}
              </label>
              <input
                type="text"
                value={entry.role}
                onChange={(e) => onUpdate(entry.id, { role: e.target.value })}
                className="w-full rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white"
                placeholder={rolePlaceholder}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[color:var(--page-muted)] uppercase tracking-wider">
                {organizationLabel}
              </label>
              <input
                type="text"
                value={entry.organization}
                onChange={(e) => onUpdate(entry.id, { organization: e.target.value })}
                className="w-full rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white"
                placeholder={organizationPlaceholder}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[color:var(--page-muted)] uppercase tracking-wider">
                {locationLabel}
              </label>
              <input
                type="text"
                value={entry.location}
                onChange={(e) => onUpdate(entry.id, { location: e.target.value })}
                className="w-full rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white"
                placeholder={locationPlaceholder}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[color:var(--page-muted)] uppercase tracking-wider">
                {dateLabel}
              </label>
              <input
                type="text"
                value={entry.dateRange}
                onChange={(e) => onUpdate(entry.id, { dateRange: e.target.value })}
                className="w-full rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white"
                placeholder={datePlaceholder}
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
          {addLabel}
        </button>
      </div>
    </div>
  );
}
