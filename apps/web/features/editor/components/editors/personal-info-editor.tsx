import React from "react";
import { SectionEditorHeader } from "./section-editor-header";

interface PersonalInfoEditorProps {
  data: { fullName: string; phone: string; email: string; summary: string; skills: string };
  onChange: (data: Partial<{ fullName: string; phone: string; email: string; summary: string; skills: string }>) => void;
  onBack: () => void;
}

export function PersonalInfoEditor({ data, onChange, onBack }: PersonalInfoEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <SectionEditorHeader title="Personal Info" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[color:var(--page-muted)] uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            className="w-full rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[color:var(--page-muted)] uppercase tracking-wider">
            Phone Number
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className="w-full rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white"
            placeholder="+1 234 567 890"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[color:var(--page-muted)] uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white"
            placeholder="john@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[color:var(--page-muted)] uppercase tracking-wider">
            Professional Summary / Objective
          </label>
          <textarea
            value={data.summary}
            onChange={(e) => onChange({ summary: e.target.value })}
            className="w-full rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white"
            placeholder="Brief overview of your experience and strengths..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[color:var(--page-muted)] uppercase tracking-wider">
            Skills
          </label>
          <input
            type="text"
            value={data.skills}
            onChange={(e) => onChange({ skills: e.target.value })}
            className="w-full rounded-xl border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)] focus:bg-white"
            placeholder="e.g. JavaScript, React, Node.js, Python"
          />
        </div>
      </div>
    </div>
  );
}
