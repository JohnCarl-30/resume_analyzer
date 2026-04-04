import React from "react";

interface AwardsEditorProps {
  entries: string[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onBack: () => void;
}

export function AwardsEditor({ entries, onAdd, onUpdate, onRemove, onBack }: AwardsEditorProps) {
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
        <h3 className="text-xl font-bold text-[color:var(--page-text)] tracking-tight">Awards & Honors</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {entries.map((award, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="text"
              value={award}
              onChange={(e) => onUpdate(index, e.target.value)}
              className="flex-1 rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white"
              placeholder="e.g. Dean's Lister - 2023"
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
          Add Award
        </button>
      </div>
    </div>
  );
}
