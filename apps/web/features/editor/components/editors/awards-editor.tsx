import React from "react";
import { SectionEditorHeader } from "./section-editor-header";
import {
  EditorAddButton,
  EditorScrollBody,
  editorControlClass,
} from "./editor-field";

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
  addLabel = "Add award",
  placeholder = "e.g. Dean's Lister — 2023",
}: AwardsEditorProps) {
  return (
    <div className="flex h-full flex-col">
      <SectionEditorHeader title={title} onBack={onBack} />

      <EditorScrollBody>
        <ul className="flex flex-col gap-2.5">
          {entries.map((award, index) => (
            <li key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={award}
                onChange={(e) => onUpdate(index, e.target.value)}
                className={editorControlClass}
                placeholder={placeholder}
                aria-label={`Award ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-[color:var(--page-muted)] transition hover:bg-[color:var(--page-bg)] hover:text-[color:var(--page-text)]"
                aria-label="Remove award"
              >
                <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-4">
                  <path
                    d="M15 5L5 15M5 5l10 10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <EditorAddButton label={addLabel} onClick={onAdd} />
      </EditorScrollBody>
    </div>
  );
}
