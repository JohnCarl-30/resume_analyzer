import React from "react";
import { SectionEditorHeader } from "./section-editor-header";
import type { PersonalInfo } from "../../model/resume-form";
import {
  EditorField,
  EditorScrollBody,
  editorControlClass,
  editorTextareaClass,
} from "./editor-field";

interface PersonalInfoEditorProps {
  data: PersonalInfo;
  onChange: (data: Partial<PersonalInfo>) => void;
  onBack: () => void;
}

export function PersonalInfoEditor({ data, onChange, onBack }: PersonalInfoEditorProps) {
  return (
    <div className="flex h-full flex-col">
      <SectionEditorHeader title="Personal Info" onBack={onBack} />

      <EditorScrollBody>
        <EditorField id="personal-full-name" label="Full name">
          <input
            id="personal-full-name"
            type="text"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            className={editorControlClass}
            placeholder="John Doe"
          />
        </EditorField>

        <div className="grid gap-4 sm:grid-cols-2">
          <EditorField id="personal-phone" label="Phone">
            <input
              id="personal-phone"
              type="tel"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              className={editorControlClass}
              placeholder="+1 234 567 890"
            />
          </EditorField>
          <EditorField id="personal-email" label="Email">
            <input
              id="personal-email"
              type="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className={editorControlClass}
              placeholder="john@example.com"
            />
          </EditorField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <EditorField id="personal-linkedin" label="LinkedIn">
            <input
              id="personal-linkedin"
              type="url"
              value={data.linkedin}
              onChange={(e) => onChange({ linkedin: e.target.value })}
              className={editorControlClass}
              placeholder="linkedin.com/in/your-name"
            />
          </EditorField>
          <EditorField id="personal-github" label="GitHub">
            <input
              id="personal-github"
              type="url"
              value={data.github}
              onChange={(e) => onChange({ github: e.target.value })}
              className={editorControlClass}
              placeholder="github.com/your-username"
            />
          </EditorField>
        </div>

        <EditorField id="personal-summary" label="Summary">
          <textarea
            id="personal-summary"
            value={data.summary}
            onChange={(e) => onChange({ summary: e.target.value })}
            className={editorTextareaClass}
            placeholder="Brief overview of your experience and strengths…"
            rows={4}
          />
        </EditorField>

        <EditorField
          id="personal-skills"
          label="Skills"
          hint="Separate skills with commas."
        >
          <input
            id="personal-skills"
            type="text"
            value={data.skills}
            onChange={(e) => onChange({ skills: e.target.value })}
            className={editorControlClass}
            placeholder="JavaScript, React, Node.js, Python"
          />
        </EditorField>
      </EditorScrollBody>
    </div>
  );
}
