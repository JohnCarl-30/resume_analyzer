import React from "react";

interface PersonalInfoEditorProps {
  data: { fullName: string; phone: string; email: string };
  onChange: (data: Partial<{ fullName: string; phone: string; email: string }>) => void;
  onBack: () => void;
}

export function PersonalInfoEditor({ data, onChange, onBack }: PersonalInfoEditorProps) {
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
        <h3 className="text-xl font-bold text-[color:var(--page-text)] tracking-tight">Personal Info</h3>
      </div>

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
      </div>
    </div>
  );
}
