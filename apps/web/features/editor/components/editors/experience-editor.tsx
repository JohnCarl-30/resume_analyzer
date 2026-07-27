import React, { useState } from "react";
import { toast } from "sonner";
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

interface EnhancingBullet {
  entryId: string;
  bulletIndex: number;
}

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
  const [enhancingBullet, setEnhancingBullet] = useState<EnhancingBullet | null>(null);
  const [newBullets, setNewBullets] = useState<Record<string, string>>({});

  const isEnhancing = (entryId: string, bulletIndex: number) =>
    enhancingBullet?.entryId === entryId && enhancingBullet?.bulletIndex === bulletIndex;

  const handleEnhanceSingleBullet = async (entryId: string, bulletIndex: number, bullet: string, role: string) => {
    setEnhancingBullet({ entryId, bulletIndex });
    try {
      const enhanced = await onEnhanceBullets(entryId, role, [bullet]);
      if (enhanced.length > 0) {
        onUpdateBullet(entryId, bulletIndex, enhanced[0]);
      }
    } catch (error) {
      console.error("Enhancement failed:", error);
      toast.error("Unable to enhance bullet. Please try again.");
    } finally {
      setEnhancingBullet(null);
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
                <p className={editorLabelClass}>Bullets</p>

                <ul className="flex flex-col gap-2">
                  {entry.bullets.map((bullet, bulletIndex) => {
                    const bulletFieldId = `${entry.id}-bullet-${bulletIndex}`;
                    const enhancing = isEnhancing(entry.id, bulletIndex);
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
                          data-entry-id={entry.id}
                          data-bullet-index={bulletIndex}
                          className={`${editorTextareaClass} min-h-[3.25rem]`}
                          rows={2}
                          placeholder="Describe what you did and the result…"
                        />
                        <button
                          type="button"
                          onClick={() => void handleEnhanceSingleBullet(entry.id, bulletIndex, bullet, entry.role)}
                          disabled={enhancing || !bullet.trim()}
                          className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[color:var(--brand)] transition hover:bg-[color:var(--brand-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={enhancing ? "Enhancing bullet…" : "Enhance bullet with AI"}
                        >
                          {enhancing ? (
                            <SpinnerIcon />
                          ) : (
                            <SparkleIcon />
                          )}
                        </button>
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

function SparkleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-4">
      <path
        d="M10 2L12.09 7.26L18 8.27L13.82 12.14L14.82 18.02L10 15.27L5.18 18.02L6.18 12.14L2 8.27L7.91 7.26L10 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-4 animate-spin">
      <circle
        className="opacity-25"
        cx="10"
        cy="10"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M10 2a8 8 0 018 8h-2a6 6 0 00-6-6V2z"
      />
    </svg>
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
