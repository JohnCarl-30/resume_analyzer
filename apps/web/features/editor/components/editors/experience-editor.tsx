import React, { useState } from "react";
import { ExperienceEntry } from "../../model/resume-form";

interface ExperienceEditorProps {
  entries: ExperienceEntry[];
  onAdd: () => void;
  onUpdate: (id: string, data: Partial<ExperienceEntry>) => void;
  onRemove: (id: string) => void;
  onAddBullet: (id: string, bullet: string) => void;
  onUpdateBullet: (id: string, index: number, bullet: string) => void;
  onRemoveBullet: (id: string, index: number) => void;
  onEnhanceBullets: (id: string, role: string, bullets: string[]) => Promise<string[]>;
  onBack: () => void;
}

export function ExperienceEditor({
  entries,
  onAdd,
  onUpdate,
  onRemove,
  onAddBullet,
  onUpdateBullet,
  onRemoveBullet,
  onEnhanceBullets,
  onBack,
}: ExperienceEditorProps) {
  const [enhancingId, setEnhancingId] = useState<string | null>(null);
  const [newBullets, setNewBullets] = useState<Record<string, string>>({});

  const handleEnhance = async (entry: ExperienceEntry) => {
    setEnhancingId(entry.id);
    try {
      const enhanced = await onEnhanceBullets(entry.id, entry.role, entry.bullets);
      enhanced.forEach((bullet) => onAddBullet(entry.id, bullet));
    } catch (error) {
      console.error("Enhancement failed:", error);
    } finally {
      setEnhancingId(null);
    }
  };

  const getNewBullet = (id: string) => newBullets[id] || "";
  const setNewBullet = (id: string, value: string) =>
    setNewBullets((prev) => ({ ...prev, [id]: value }));

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

            {/* Bullets Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[color:var(--page-muted)] uppercase tracking-wider">
                  Key Achievements
                </label>
                <button
                  type="button"
                  onClick={() => handleEnhance(entry)}
                  disabled={enhancingId === entry.id}
                  className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--brand-soft)] px-3 py-1.5 text-sm font-semibold text-[color:var(--brand)] transition hover:bg-[color:var(--brand)] hover:text-white disabled:opacity-50"
                >
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
                    <path d="M10 3.2l1.4 3.4 3.4 1.4-3.4 1.4L10 13l-1.4-3.6L5.2 8l3.4-1.4L10 3.2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                  {enhancingId === entry.id ? "Enhancing..." : "Enhance with AI"}
                </button>
              </div>

              <div className="space-y-2">
                {entry.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex items-start gap-2">
                    <span className="mt-3 text-[color:var(--brand)]">•</span>
                    <textarea
                      value={bullet}
                      onChange={(e) => onUpdateBullet(entry.id, bulletIndex, e.target.value)}
                      className="flex-1 rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-2 text-sm text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white resize-none"
                      rows={2}
                      placeholder="Describe your achievement..."
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveBullet(entry.id, bulletIndex)}
                      className="mt-2 text-rose-500 hover:text-rose-600 transition"
                    >
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
                        <path d="M5.75 6.5h8.5M8 6.5V5.2c0-.66.54-1.2 1.2-1.2h1.6c.66 0 1.2.54 1.2 1.2v1.3M7.1 8.25v6M10 8.25v6M12.9 8.25v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ))}

                <div className="flex items-start gap-2">
                  <span className="mt-3 text-[color:var(--page-muted)]">•</span>
                  <textarea
                    value={getNewBullet(entry.id)}
                    onChange={(e) => setNewBullet(entry.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const value = getNewBullet(entry.id).trim();
                        if (value) {
                          onAddBullet(entry.id, value);
                          setNewBullet(entry.id, "");
                        }
                      }
                    }}
                    className="flex-1 rounded-xl border border-dashed border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-2 text-sm text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white resize-none"
                    rows={2}
                    placeholder="Add a new achievement and press Enter..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const value = getNewBullet(entry.id).trim();
                      if (value) {
                        onAddBullet(entry.id, value);
                        setNewBullet(entry.id, "");
                      }
                    }}
                    className="mt-2 text-[color:var(--brand)] hover:text-[color:var(--brand-strong)] transition"
                  >
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
                      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
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
