import React from "react";
import { cn } from "@/lib/utils";
import { PlusIcon } from "../../../onboarding/components/wizard-icons";

export const editorLabelClass =
  "text-sm font-medium text-[color:var(--page-text)]";

export const editorHintClass = "text-xs text-[color:var(--page-muted)]";

export const editorControlClass =
  "w-full rounded-lg border border-[color:var(--page-line)] bg-white px-3 py-2.5 text-sm leading-5 text-[color:var(--page-text)] outline-none transition-[border-color,background-color] duration-200 ease-out placeholder:text-[color:var(--page-muted)] focus:border-[color:var(--brand)] focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/20";

export const editorTextareaClass = `${editorControlClass} resize-y min-h-[4.5rem]`;

export const editorAddButtonClass =
  "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[color:var(--page-line-strong)] py-3.5 text-sm font-medium text-[color:var(--page-muted)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]";

interface EditorFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}

export function EditorField({ id, label, children, hint, className }: EditorFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={editorLabelClass}>
        {label}
      </label>
      {children}
      {hint ? <p className={editorHintClass}>{hint}</p> : null}
    </div>
  );
}

interface EditorEntryCardProps {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}

export function EditorEntryCard({ title, onRemove, children }: EditorEntryCardProps) {
  return (
    <section className="rounded-lg border border-[color:var(--page-line)] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--page-line)] px-4 py-3">
        <h4 className="min-w-0 truncate text-sm font-semibold text-[color:var(--page-text)]">{title}</h4>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-[color:var(--page-muted)] transition hover:bg-[color:var(--page-bg)] hover:text-[color:var(--page-text)]"
        >
          Remove
        </button>
      </div>
      <div className="flex flex-col gap-4 px-4 py-4">{children}</div>
    </section>
  );
}

interface EditorAddButtonProps {
  label: string;
  onClick: () => void;
}

export function EditorAddButton({ label, onClick }: EditorAddButtonProps) {
  return (
    <button type="button" onClick={onClick} className={editorAddButtonClass}>
      <PlusIcon />
      {label}
    </button>
  );
}

interface EditorScrollBodyProps {
  children: React.ReactNode;
}

export function EditorScrollBody({ children }: EditorScrollBodyProps) {
  return (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
      {children}
    </div>
  );
}
