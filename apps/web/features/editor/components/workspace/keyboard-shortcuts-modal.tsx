import React from "react";
import { CloseIcon } from "../../../onboarding/components/wizard-icons";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(15,23,42,0.35)] p-4 sm:p-6">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-[color:var(--page-line)] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-[color:var(--page-line)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[color:var(--page-text)]">Keyboard Shortcuts</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="flex flex-col gap-3">
            {[
              { keys: "Ctrl + Z", action: "Undo" },
              { keys: "Ctrl + Y", action: "Redo" },
              { keys: "Ctrl + Shift + Z", action: "Redo" },
              { keys: "Ctrl + P", action: "Print resume" },
            ].map((shortcut) => (
              <div key={shortcut.keys} className="flex items-center justify-between rounded-lg bg-[color:var(--page-bg)] px-4 py-3">
                <span className="text-sm text-[color:var(--page-text)]">{shortcut.action}</span>
                <kbd className="rounded-md border border-[color:var(--page-line)] bg-white px-2 py-1 text-xs font-mono font-semibold text-[color:var(--page-muted)]">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[color:var(--page-muted)]">Changes are auto-saved to your browser every 800ms.</p>
        </div>
      </div>
    </div>
  );
}
