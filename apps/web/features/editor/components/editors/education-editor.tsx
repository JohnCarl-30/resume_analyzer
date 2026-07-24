import React from "react";
import { EducationEntry } from "../../model/resume-form";
import { SectionEditorHeader } from "./section-editor-header";
import {
  EditorAddButton,
  EditorEntryCard,
  EditorField,
  EditorScrollBody,
  editorControlClass,
} from "./editor-field";

interface EducationEditorProps {
  entries: EducationEntry[];
  onAdd: () => void;
  onUpdate: (id: string, data: Partial<EducationEntry>) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
}

export function EducationEditor({ entries, onAdd, onUpdate, onRemove, onBack }: EducationEditorProps) {
  return (
    <div className="flex h-full flex-col">
      <SectionEditorHeader title="Education" onBack={onBack} />

      <EditorScrollBody>
        {entries.map((entry, index) => {
          const institutionId = `${entry.id}-institution`;
          const degreeId = `${entry.id}-degree`;
          const locationId = `${entry.id}-location`;
          const dateId = `${entry.id}-date`;
          const title = entry.institution.trim() || `School ${index + 1}`;

          return (
            <EditorEntryCard key={entry.id} title={title} onRemove={() => onRemove(entry.id)}>
              <EditorField id={institutionId} label="School">
                <input
                  id={institutionId}
                  type="text"
                  value={entry.institution}
                  onChange={(e) => onUpdate(entry.id, { institution: e.target.value })}
                  className={editorControlClass}
                  placeholder="Bulacan State University"
                />
              </EditorField>

              <EditorField id={degreeId} label="Degree">
                <input
                  id={degreeId}
                  type="text"
                  value={entry.degree}
                  onChange={(e) => onUpdate(entry.id, { degree: e.target.value })}
                  className={editorControlClass}
                  placeholder="B.S. in Computer Science"
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
                    placeholder="City, Country"
                  />
                </EditorField>
                <EditorField id={dateId} label="Dates">
                  <input
                    id={dateId}
                    type="text"
                    value={entry.dateRange}
                    onChange={(e) => onUpdate(entry.id, { dateRange: e.target.value })}
                    className={editorControlClass}
                    placeholder="Jan 2020 — Dec 2024"
                  />
                </EditorField>
              </div>
            </EditorEntryCard>
          );
        })}

        <EditorAddButton label="Add another school" onClick={onAdd} />
      </EditorScrollBody>
    </div>
  );
}
