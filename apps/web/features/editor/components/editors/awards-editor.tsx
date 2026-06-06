import React from "react";
import { SectionEditorHeader } from "./section-editor-header";

interface AwardsEditorProps {
  entries: string[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onBack: () => void;
  title?: string;
  addLabel?: string;
  placeholder?: string;
}

export function AwardsEditor({
  entries,
  onAdd,
  onUpdate,
  onRemove,
  onBack,
  title = "Awards & Honors",
  addLabel = "Add Award",
  placeholder = "e.g. Dean's Lister - 2023",
}: AwardsEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <SectionEditorHeader title={title} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {entries.map((award, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="text"
              value={award}
              onChange={(e) => onUpdate(index, e.target.value)}
              className="flex-1 rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white"
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2 text-rose-500 hover:bg-rose-50 transition rounded-lg"
              aria-label="Remove award"
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
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
