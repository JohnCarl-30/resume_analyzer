import React, { useState } from "react";
import { ExperienceEntry } from "../../model/resume-form";
import { PlusIcon } from "../../../onboarding/components/wizard-icons";
import { SectionEditorHeader } from "./section-editor-header";
import {
  EditorAddButton,
  EditorEntryCard,
  EditorField,
  EditorScrollBody,
  editorControlClass,
  editorLabelClass,
  editorTextareaClass,
} from "./editor-field";

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
    <div className="flex h-full flex-col">
      <SectionEditorHeader title="Work Experience" onBack={onBack} />

      <EditorScrollBody>
        {entries.map((entry, index) => {
          const roleId = `${entry.id}-role`;
          const locationId = `${entry.id}-location`;
          const dateId = `${entry.id}-date`;
          const title = entry.role.trim() || `Role ${index + 1}`;

          return (
            <EditorEntryCard key={entry.id} title={title} onRemove={() => onRemove(entry.id)}>
              <EditorField id={roleId} label="Role">
                <input
                  id={roleId}
                  type="text"
                  value={entry.role}
                  onChange={(e) => onUpdate(entry.id, { role: e.target.value })}
                  className={editorControlClass}
                  placeholder="Senior Product Designer"
                />
              </EditorField>

              <div className="grid gap-4 sm:grid-cols-2">
                <EditorField id={locationId} label="Location">
                  <input
                    id={locationId}
                    type="text"
                    value={entry.location}
                    onChange={(e) => onUpdate(entry.id, { location: e.target.value })}
                    className={editorControlClass}
                    placeholder="Remote / San Francisco"
                  />
                </EditorField>
                <EditorField id={dateId} label="Dates">
                  <input
                    id={dateId}
                    type="text"
                    value={entry.dateRange}
                    onChange={(e) => onUpdate(entry.id, { dateRange: e.target.value })}
                    className={editorControlClass}
                    placeholder="Jan 2022 — Present"
                  />
                </EditorField>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className={editorLabelClass}>Bullets</p>
                  <button
                    type="button"
                    onClick={() => void handleEnhance(entry)}
                    disabled={enhancingId === entry.id || entry.bullets.length === 0}
                    className="shrink-0 rounded-md border border-[color:var(--page-line)] bg-white px-2.5 py-1.5 text-xs font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--page-line-strong)] hover:bg-[color:var(--page-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {enhancingId === entry.id ? "Improving…" : "Improve bullets"}
                  </button>
                </div>

                <ul className="flex flex-col gap-2">
                  {entry.bullets.map((bullet, bulletIndex) => {
                    const bulletFieldId = `${entry.id}-bullet-${bulletIndex}`;
                    return (
                      <li key={bulletFieldId} className="flex items-start gap-2">
                        <span
                          className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[color:var(--page-line-strong)]"
                          aria-hidden="true"
                        />
                        <textarea
                          id={bulletFieldId}
                          value={bullet}
                          onChange={(e) => onUpdateBullet(entry.id, bulletIndex, e.target.value)}
                          className={`${editorTextareaClass} min-h-[3.25rem]`}
                          rows={2}
                          placeholder="Describe what you did and the result…"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveBullet(entry.id, bulletIndex)}
                          className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[color:var(--page-muted)] transition hover:bg-[color:var(--page-bg)] hover:text-[color:var(--page-text)]"
                          aria-label="Remove bullet"
                        >
                          <TrashGlyph />
                        </button>
                      </li>
                    );
                  })}

                  <li className="flex items-start gap-2">
                    <span
                      className="mt-2.5 size-1.5 shrink-0 rounded-full border border-dashed border-[color:var(--page-line-strong)]"
                      aria-hidden="true"
                    />
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
                      className={`${editorTextareaClass} min-h-[3.25rem] border-dashed`}
                      rows={2}
                      placeholder="Add a bullet, then press Enter"
                      aria-label="New achievement bullet"
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
                      className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[color:var(--brand)] transition hover:bg-[color:var(--brand-soft)]"
                      aria-label="Add bullet"
                    >
                      <PlusIcon />
                    </button>
                  </li>
                </ul>
              </div>
            </EditorEntryCard>
          );
        })}

        <EditorAddButton label="Add another role" onClick={onAdd} />
      </EditorScrollBody>
    </div>
  );
}

function TrashGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-4">
      <path
        d="M5.75 6.5h8.5M8 6.5V5.2c0-.66.54-1.2 1.2-1.2h1.6c.66 0 1.2.54 1.2 1.2v1.3M7.1 8.25v6M10 8.25v6M12.9 8.25v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
