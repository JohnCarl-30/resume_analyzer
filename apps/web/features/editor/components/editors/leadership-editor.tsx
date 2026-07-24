import React from "react";
import { LeadershipEntry } from "../../model/resume-form";
import { SectionEditorHeader } from "./section-editor-header";
import {
  EditorAddButton,
  EditorEntryCard,
  EditorField,
  EditorScrollBody,
  editorControlClass,
} from "./editor-field";

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
  addLabel = "Add another entry",
  roleLabel = "Role",
  rolePlaceholder = "President",
  organizationLabel = "Organization",
  organizationPlaceholder = "Student Council",
  locationLabel = "Location",
  locationPlaceholder = "City, Province",
  dateLabel = "Dates",
  datePlaceholder = "Jan 2023 — Present",
}: LeadershipEditorProps) {
  return (
    <div className="flex h-full flex-col">
      <SectionEditorHeader title={title} onBack={onBack} />

      <EditorScrollBody>
        {entries.map((entry, index) => {
          const roleId = `${entry.id}-role`;
          const orgId = `${entry.id}-org`;
          const locationId = `${entry.id}-location`;
          const dateId = `${entry.id}-date`;
          const cardTitle = entry.role.trim() || `Entry ${index + 1}`;

          return (
            <EditorEntryCard key={entry.id} title={cardTitle} onRemove={() => onRemove(entry.id)}>
              <EditorField id={roleId} label={roleLabel}>
                <input
                  id={roleId}
                  type="text"
                  value={entry.role}
                  onChange={(e) => onUpdate(entry.id, { role: e.target.value })}
                  className={editorControlClass}
                  placeholder={rolePlaceholder}
                />
              </EditorField>

              <EditorField id={orgId} label={organizationLabel}>
                <input
                  id={orgId}
                  type="text"
                  value={entry.organization}
                  onChange={(e) => onUpdate(entry.id, { organization: e.target.value })}
                  className={editorControlClass}
                  placeholder={organizationPlaceholder}
                />
              </EditorField>

              <div className="grid gap-4 sm:grid-cols-2">
                <EditorField id={locationId} label={locationLabel}>
                  <input
                    id={locationId}
                    type="text"
                    value={entry.location}
                    onChange={(e) => onUpdate(entry.id, { location: e.target.value })}
                    className={editorControlClass}
                    placeholder={locationPlaceholder}
                  />
                </EditorField>
                <EditorField id={dateId} label={dateLabel}>
                  <input
                    id={dateId}
                    type="text"
                    value={entry.dateRange}
                    onChange={(e) => onUpdate(entry.id, { dateRange: e.target.value })}
                    className={editorControlClass}
                    placeholder={datePlaceholder}
                  />
                </EditorField>
              </div>
            </EditorEntryCard>
          );
        })}

        <EditorAddButton label={addLabel} onClick={onAdd} />
      </EditorScrollBody>
    </div>
  );
}
