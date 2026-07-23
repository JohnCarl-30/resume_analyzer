import React from "react";
import { PlusIcon, TrashIcon, CalendarIcon, SparklesIcon, CloseIcon } from "../../../onboarding/components/wizard-icons";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export interface ProjectDraft {
  name: string;
  technologies: string;
  link: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bulletInput: string;
  bullets: string[];
}

const maxProjectBullets = 3;

export const emptyProjectDraft: ProjectDraft = {
  name: "",
  technologies: "",
  link: "",
  startDate: "",
  endDate: "",
  current: false,
  bulletInput: "",
  bullets: [],
};

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: ProjectDraft;
  onDraftChange: <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) => void;
  formError: string;
  onSave: () => void;
  onClearError: () => void;
}

export function ProjectModal({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  formError,
  onSave,
  onClearError,
}: ProjectModalProps) {
  function handleCompleteBullet() {
    const baseText = draft.bulletInput.trim();
    const autoCompletedText = baseText
      ? `${baseText.replace(/[.]+$/, "")}.`
      : draft.name.trim()
        ? `Built ${draft.name.trim()} using ${draft.technologies.trim() || "modern tools"} and shipped a measurable improvement.`
        : "Built a feature that improved usability, speed, or delivery for the team.";

    onDraftChange("bulletInput", autoCompletedText);
  }

  function handleAddBullet() {
    const nextBullet = draft.bulletInput.trim();
    if (!nextBullet || draft.bullets.length >= maxProjectBullets) return;

    onDraftChange("bullets", [...draft.bullets, nextBullet]);
    onDraftChange("bulletInput", "");
  }

  function handleRemoveBullet(index: number) {
    onDraftChange("bullets", draft.bullets.filter((_, bulletIndex) => bulletIndex !== index));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[92vh] max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-xl border border-[color:var(--page-line)] bg-white p-0 text-[color:var(--page-text)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:max-w-5xl"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--page-line)] px-5 py-4 sm:px-6">
          <DialogTitle className="text-xl font-semibold tracking-tight text-[color:var(--page-text)]">
            Add Project
          </DialogTitle>
          <DialogDescription className="sr-only">
            Add a project with technologies, dates, links, and bullet details.
          </DialogDescription>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-surface)] text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
            aria-label="Close add projects"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[calc(92vh-5rem)] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                Project Name *
              </label>
              <input
                type="text"
                value={draft.name}
                onChange={(event) => onDraftChange("name", event.target.value)}
                placeholder="E-Commerce Platform"
                className="w-full rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                Technologies
              </label>
              <input
                type="text"
                value={draft.technologies}
                onChange={(event) => onDraftChange("technologies", event.target.value)}
                placeholder="React, Node.js, PostgreSQL"
                className="w-full rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                Project Link <span className="text-[color:var(--page-muted)]">(Optional)</span>
              </label>
              <input
                type="url"
                value={draft.link}
                onChange={(event) => onDraftChange("link", event.target.value)}
                placeholder="https://github.com/username/project"
                className="w-full rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                  Start Date
                </label>
                <div className="flex items-center justify-between rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3">
                  <input
                    type="text"
                    value={draft.startDate}
                    onChange={(event) => onDraftChange("startDate", event.target.value)}
                    placeholder="January 2024"
                    className="w-full bg-transparent text-base text-[color:var(--page-text)] outline-none placeholder:text-[color:var(--page-muted)]"
                  />
                  <span className="ml-4 text-[color:var(--page-muted)]">
                    <CalendarIcon />
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                  End Date
                </label>
                <div className="flex items-center justify-between rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3">
                  <input
                    type="text"
                    value={draft.endDate}
                    onChange={(event) => onDraftChange("endDate", event.target.value)}
                    placeholder="March 2024"
                    disabled={draft.current}
                    className="w-full bg-transparent text-base text-[color:var(--page-text)] outline-none placeholder:text-[color:var(--page-muted)] disabled:opacity-50"
                  />
                  <span className="ml-4 text-[color:var(--page-muted)]">
                    <CalendarIcon />
                  </span>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-[color:var(--page-text)]">
              <input
                type="checkbox"
                checked={draft.current}
                onChange={(event) => onDraftChange("current", event.target.checked)}
                className="size-4 rounded border border-[color:var(--page-line)]"
              />
              Currently working on this project
            </label>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                  Project Description
                </label>
                <button
                  type="button"
                  onClick={handleAddBullet}
                  className="inline-flex h-8 items-center gap-2 rounded-lg border border-[color:var(--page-line)] bg-white px-3 text-sm font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                >
                  <PlusIcon />
                  Add Bullet
                </button>
              </div>

              {draft.bullets.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {draft.bullets.map((bullet, index) => (
                    <div
                      key={`${bullet}-${index}`}
                      className="flex items-start justify-between gap-3 rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-surface)] px-4 py-3"
                    >
                      <p className="text-base leading-7 text-[color:var(--page-text)]">{bullet}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(index)}
                        className="text-[color:var(--page-muted)] transition hover:text-rose-500"
                        aria-label="Remove bullet"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] p-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onDraftChange("bulletInput", "")}
                    className="text-[color:var(--page-muted)] transition hover:text-rose-500"
                    aria-label="Clear current bullet"
                  >
                    <TrashIcon />
                  </button>
                </div>

                <textarea
                  value={draft.bulletInput}
                  onChange={(event) => onDraftChange("bulletInput", event.target.value)}
                  placeholder="Built a feature that..."
                  className="mt-3 min-h-[8rem] w-full resize-none bg-transparent text-base leading-7 text-[color:var(--page-text)] outline-none placeholder:text-[color:var(--page-muted)]"
                />

                <div className="mt-5 flex flex-col gap-4 border-t border-[color:var(--page-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-base text-[color:var(--page-muted)]">
                    {Math.max(0, maxProjectBullets - draft.bullets.length)} left
                  </p>
                  <button
                    type="button"
                    onClick={handleCompleteBullet}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-[color:var(--page-line)] bg-white px-3 text-sm font-semibold text-[color:var(--brand)] transition hover:border-[color:var(--brand)]"
                  >
                    <SparklesIcon />
                    Complete Bullet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[color:var(--page-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-h-6 text-sm text-rose-500">{formError}</div>
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-white px-4 text-sm font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--page-line-strong)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[color:var(--brand)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-strong)]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
