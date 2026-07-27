import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutGroup {
  label: string;
  shortcuts: { keys: string; action: string }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    label: "Editing",
    shortcuts: [
      { keys: "⌘+Z", action: "Undo" },
      { keys: "⌘+Shift+Z", action: "Redo" },
      { keys: "⌘+Y", action: "Redo (alt)" },
    ],
  },
  {
    label: "Actions",
    shortcuts: [
      { keys: "⌘+S", action: "Save" },
      { keys: "⌘+E", action: "Enhance focused bullet" },
    ],
  },
  {
    label: "Navigation",
    shortcuts: [
      { keys: "⌘+K", action: "Keyboard shortcuts" },
      { keys: "⌘+P", action: "Print resume" },
    ],
  },
];

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Quick actions you can use while editing your resume.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {shortcutGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[color:var(--page-muted)]">
                {group.label}
              </p>
              <div className="flex flex-col gap-1.5">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between rounded-lg bg-[color:var(--page-bg)] px-3 py-2"
                  >
                    <span className="text-sm text-[color:var(--page-text)]">
                      {shortcut.action}
                    </span>
                    <kbd className="rounded-md border border-[color:var(--page-line)] bg-white px-2 py-0.5 text-xs font-mono font-semibold text-[color:var(--page-muted)]">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-[color:var(--page-muted)]">
          Changes are auto-saved to your browser every 800ms.
        </p>
      </DialogContent>
    </Dialog>
  );
}
