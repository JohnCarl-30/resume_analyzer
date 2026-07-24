import React from "react";
import {
  ArrowLeftIcon,
  PencilIcon,
  ClockIcon,
  EyeIcon,
  GridIcon,
  DownloadIcon,
  KeyboardIcon,
  CheckCircleIcon,
  MenuIcon,
  UndoIcon,
  RedoIcon,
} from "../../../onboarding/components/wizard-icons";
import { AccountMenu } from "@/features/auth/components/account-menu";
import { ScoreRing } from "./score-ring";
import type { ResumeAnalysisResult } from "../../model/resume-analysis";
import type { ResumeTemplateVariant } from "../../../templates/model/template";

interface WorkspaceHeaderProps {
  createMode: boolean;
  resumeTitle: string;
  editedTitle: string;
  isEditingTitle: boolean;
  draftStatusLabel: string;
  showPrimaryReviewButton: boolean;
  analysisResult: ResumeAnalysisResult | null;
  selectedTemplateName: string;
  canUndo: boolean;
  canRedo: boolean;
  sourcePreviewLoading: boolean;
  resumeSourceUrl: string | null | undefined;
  canLoadSourcePreview: boolean;
  onBack: () => void;
  onEditTitleChange: (value: string) => void;
  onStartEditTitle: () => void;
  onStopEditTitle: () => void;
  onSaveTitle: () => void;
  onOpenPrimaryReview: () => void;
  onOpenTailorModal: () => void;
  onOpenTemplatesModal: () => void;
  onOpenShortcutsModal: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPrint: () => void;
  onDownloadOriginal: () => void;
  onMobileSidebarOpen: () => void;
}

  const controlClass =
    "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[color:var(--page-line)] bg-white px-2.5 py-2 text-sm text-[color:var(--page-text)] transition-all duration-140 ease-out hover:border-[color:var(--page-line-strong)] hover:bg-[color:var(--page-bg)] hover:shadow-[0_1px_4px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/25 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95";

export function WorkspaceHeader({
  createMode,
  resumeTitle,
  editedTitle,
  isEditingTitle,
  draftStatusLabel,
  showPrimaryReviewButton,
  analysisResult,
  selectedTemplateName,
  canUndo,
  canRedo,
  sourcePreviewLoading,
  resumeSourceUrl,
  canLoadSourcePreview,
  onBack,
  onEditTitleChange,
  onStartEditTitle,
  onStopEditTitle,
  onSaveTitle,
  onOpenPrimaryReview,
  onOpenTailorModal,
  onOpenTemplatesModal,
  onOpenShortcutsModal,
  onUndo,
  onRedo,
  onPrint,
  onDownloadOriginal,
  onMobileSidebarOpen,
}: WorkspaceHeaderProps) {
  return (
    <header className="shrink-0 border-b border-[color:var(--page-line)] bg-white px-3 py-2.5 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {!createMode && (
            <button
              type="button"
              onClick={onMobileSidebarOpen}
              className={`${controlClass} xl:hidden`}
              aria-label="Open resume editor"
            >
              <MenuIcon />
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[color:var(--page-line)] bg-white px-2.5 py-2 text-xs font-medium text-[color:var(--page-muted)] transition-all duration-140 ease-out hover:border-[color:var(--page-line-strong)] hover:text-[color:var(--page-text)] hover:shadow-[0_1px_4px_rgba(0,0,0,0.08)] active:scale-95 sm:px-3 sm:text-sm"
          >
            <ArrowLeftIcon />
            Back
          </button>
          {isEditingTitle ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => onEditTitleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onStopEditTitle();
                    onSaveTitle();
                  }
                  if (e.key === "Escape") {
                    onStopEditTitle();
                  }
                }}
                autoFocus
                className="min-w-0 flex-1 rounded-lg border border-[color:var(--brand)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--page-text)] outline-none sm:text-base"
              />
              <button
                type="button"
                onClick={() => {
                  onStopEditTitle();
                  onSaveTitle();
                }}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[color:var(--brand)] hover:bg-[color:var(--brand-soft)]"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onStopEditTitle}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[color:var(--page-muted)] hover:bg-[color:var(--page-bg)]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onStartEditTitle}
              className="group inline-flex min-w-0 max-w-[10rem] items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[color:var(--page-text)] transition hover:bg-[color:var(--page-bg)] sm:max-w-[14rem] md:max-w-[18rem] lg:max-w-[22rem]"
              aria-label={createMode ? "Edit draft title" : "Edit resume title"}
              title={resumeTitle}
            >
              <span className="truncate">{resumeTitle}</span>
              <span className="shrink-0 text-[color:var(--page-muted)] opacity-0 transition group-hover:opacity-100">
                <PencilIcon />
              </span>
            </button>
          )}
        </div>

        {!createMode && analysisResult ? (
          <div className="hidden shrink-0 items-center gap-2 sm:inline-flex">
            <ScoreRing score={analysisResult.score} size={32} />
            <div className="min-w-0 text-xs leading-tight">
              <div className="font-semibold text-[color:var(--page-text)]">
                {Math.round(analysisResult.score)}% match
              </div>
              <div className="truncate text-[color:var(--page-muted)]">
                {analysisResult.matchedKeywords.length}{" "}
                {analysisResult.matchedKeywords.length === 1 ? "job word" : "job words"} found
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {createMode ? (
            <div className="mr-1 hidden items-center gap-1.5 rounded-full bg-[color:var(--brand-soft)] px-2.5 py-1 text-[0.68rem] font-medium text-[color:var(--brand)] sm:inline-flex">
              <span className={draftStatusLabel === "Saving..." ? "text-[color:var(--page-muted)]" : "text-emerald-700"}>
                {draftStatusLabel === "Saving..." ? <ClockIcon /> : <CheckCircleIcon />}
              </span>
              <span>{draftStatusLabel}</span>
            </div>
          ) : null}

          {!createMode ? (
            <div className="hidden items-center md:inline-flex">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className={`${controlClass} rounded-r-none border-r-0`}
                aria-label="Undo"
                title="Undo"
              >
                <UndoIcon />
              </button>
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className={`${controlClass} rounded-l-none`}
                aria-label="Redo"
                title="Redo"
              >
                <RedoIcon />
              </button>
            </div>
          ) : null}

          <div
            className={`hidden max-w-[7.5rem] items-center gap-1.5 truncate text-xs text-[color:var(--page-muted)] lg:inline-flex ${
              draftStatusLabel === "Saved locally" || draftStatusLabel === "Saved"
                ? "font-medium text-emerald-700"
                : ""
            }`}
            title={draftStatusLabel}
          >
            <span className={draftStatusLabel === "Saving..." ? "text-[color:var(--page-muted)]" : "text-emerald-600"}>
              {draftStatusLabel === "Saving..." ? <ClockIcon /> : <CheckCircleIcon />}
            </span>
            <span className="truncate">{draftStatusLabel}</span>
          </div>

          {!createMode && showPrimaryReviewButton ? (
            <button
              type="button"
              onClick={onOpenPrimaryReview}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[color:var(--brand)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/30 sm:px-4"
            >
              <span className="sm:hidden">Review</span>
              <span className="hidden sm:inline">Review job edits</span>
            </button>
          ) : null}

          {!createMode ? (
            <button
              type="button"
              onClick={onOpenTailorModal}
              aria-label="Check resume again"
              className={controlClass}
            >
              <EyeIcon />
              <span className="hidden sm:inline">Check again</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={onOpenTemplatesModal}
            aria-label="Choose resume style"
            className={`${controlClass} ${createMode ? "sm:inline-flex" : "hidden xl:inline-flex"}`}
          >
            <GridIcon />
            <span className="max-w-[8rem] truncate text-xs font-medium sm:text-sm">
              {createMode ? selectedTemplateName || "Choose style" : selectedTemplateName || "Style"}
            </span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            aria-label="Print or save PDF"
            className={controlClass}
          >
            <DownloadIcon />
            <span aria-hidden="true" className="hidden text-xs font-semibold lg:inline">
              Print
            </span>
          </button>

          {!createMode ? (
            <button
              type="button"
              onClick={onDownloadOriginal}
              disabled={sourcePreviewLoading || (!resumeSourceUrl && !canLoadSourcePreview)}
              className={`${controlClass} hidden whitespace-nowrap 2xl:inline-flex`}
            >
              <DownloadIcon />
              {resumeSourceUrl || canLoadSourcePreview ? "Download original" : "Backup copy"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={onOpenShortcutsModal}
            className={`${controlClass} hidden 2xl:inline-flex`}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts"
          >
            <KeyboardIcon />
          </button>

          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
