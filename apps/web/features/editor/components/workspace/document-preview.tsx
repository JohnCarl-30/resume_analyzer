import React from "react";
import { DownloadIcon, MinusIcon, PlusIcon } from "../../../onboarding/components/wizard-icons";
import { ResumeRenderer } from "../resume-renderer";
import { ParsedTextPreview } from "./parsed-text-preview";
import type { ResumeForm } from "../../model/resume-form";
import type { ResumeTemplateVariant } from "../../../templates/model/template";

interface DocumentPreviewProps {
  previewMode: "uploaded" | "structured" | "parsed" | "empty";
  previewZoom: number;
  resumePreviewUrl: string | null | undefined;
  sourcePreviewLoading: boolean;
  sourcePreviewError: string;
  canLoadSourcePreview: boolean;
  canZoomDocument: boolean;
  parsedResumeText?: string;
  form: ResumeForm;
  activeTemplateId: ResumeTemplateVariant;
  showResumePlaceholders: boolean;
  showDownloadButton?: boolean;
  onAdjustZoom: (delta: number) => void;
  onDownloadOriginal: () => void;
  onShowOriginalPreview: () => void;
  onShowLayoutPreview: () => void;
  hasSourcePreviewChoice: boolean;
}

export function DocumentPreview({
  previewMode,
  previewZoom,
  resumePreviewUrl,
  sourcePreviewLoading,
  sourcePreviewError,
  canLoadSourcePreview,
  canZoomDocument,
  parsedResumeText,
  form,
  activeTemplateId,
  showResumePlaceholders,
  showDownloadButton = true,
  onAdjustZoom,
  onDownloadOriginal,
  onShowOriginalPreview,
  onShowLayoutPreview,
  hasSourcePreviewChoice,
}: DocumentPreviewProps) {
  const previewCardClassName =
    "mx-auto w-full max-w-[860px] rounded-lg border border-[color:var(--page-line)] bg-white";
  const previewZoomStyle =
    previewZoom === 100 ? undefined : ({ zoom: previewZoom / 100 } as React.CSSProperties);

  function renderDocumentContent() {
    if (previewMode === "uploaded" && resumePreviewUrl) {
      return (
        <div className={`${previewCardClassName} overflow-hidden`}>
          <iframe
            key={`${resumePreviewUrl}-${previewZoom}`}
            title="Uploaded resume preview"
            src={`${resumePreviewUrl}#toolbar=0&navpanes=0&zoom=${previewZoom}`}
            className="min-h-[calc(100dvh-10rem)] w-full bg-white"
          />
        </div>
      );
    }

    if (previewMode === "uploaded" && (sourcePreviewLoading || canLoadSourcePreview)) {
      return (
        <div className={`${previewCardClassName} px-6 py-16 text-center`}>
          <p className="text-sm text-[color:var(--page-muted)]">
            {sourcePreviewLoading
              ? "Loading your upload…"
              : sourcePreviewError || "Your upload is unavailable right now."}
          </p>
        </div>
      );
    }

    if (previewMode === "parsed" && parsedResumeText) {
      return (
        <div
          className={`print-resume ${previewCardClassName} px-10 py-12 sm:px-14 sm:py-16`}
          style={previewZoomStyle}
        >
          <ParsedTextPreview text={parsedResumeText} />
        </div>
      );
    }

    if (previewMode === "structured") {
      return (
        <div
          className={`print-resume ${previewCardClassName} px-8 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-16`}
          style={previewZoomStyle}
        >
          <ResumeRenderer form={form} variantId={activeTemplateId} showPlaceholders={showResumePlaceholders} />
        </div>
      );
    }

    return (
      <div className="mx-auto flex aspect-[1/1.414] w-full max-w-[860px] items-center justify-center rounded-lg border border-dashed border-[color:var(--page-line)] bg-white px-8 py-10 text-center">
        <div className="max-w-md space-y-3">
          <h3 className="text-lg font-semibold tracking-tight text-[color:var(--page-text)] text-balance">
            Not enough content to draw this page yet
          </h3>
          <p className="text-sm leading-6 text-[color:var(--page-muted)] text-pretty">
            Try a clearer PDF or DOCX with selectable text, then open the editor to fill in any missing sections.
          </p>
        </div>
      </div>
    );
  }

  const modeButtonClass = (active: boolean) =>
    `inline-flex items-center whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
      active
        ? "bg-white text-[color:var(--page-text)]"
        : "text-[color:var(--page-muted)] hover:text-[color:var(--page-text)]"
    }`;

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-[color:var(--page-bg-strong)]">
      <div className="pointer-events-none absolute inset-x-2 top-3 z-20 flex justify-center">
        <div className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-[color:var(--page-line)] bg-white px-2 py-1.5 [scrollbar-width:none] sm:gap-1.5 sm:px-2.5 [&::-webkit-scrollbar]:hidden">
          {hasSourcePreviewChoice ? (
            <div className="flex shrink-0 items-center gap-0.5 rounded-md bg-[color:var(--page-bg)] p-0.5">
              {canLoadSourcePreview ? (
                <button
                  type="button"
                  onClick={onShowOriginalPreview}
                  className={modeButtonClass(previewMode === "uploaded")}
                >
                  Your upload
                </button>
              ) : null}
              <button
                type="button"
                onClick={onShowLayoutPreview}
                className={modeButtonClass(previewMode === "structured")}
              >
                Editable version
              </button>
            </div>
          ) : null}

          {hasSourcePreviewChoice ? (
            <div className="mx-0.5 h-6 w-px shrink-0 bg-[color:var(--page-line)] sm:mx-1" />
          ) : null}

          <button
            type="button"
            onClick={() => onAdjustZoom(-10)}
            disabled={!canZoomDocument}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[color:var(--page-muted)] transition hover:bg-[color:var(--page-bg)] hover:text-[color:var(--page-text)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Zoom out"
          >
            <MinusIcon />
          </button>
          <span className="min-w-10 shrink-0 text-center text-xs font-semibold tabular-nums text-[color:var(--page-muted)]">
            {previewZoom}%
          </span>
          <button
            type="button"
            onClick={() => onAdjustZoom(10)}
            disabled={!canZoomDocument}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[color:var(--page-muted)] transition hover:bg-[color:var(--page-bg)] hover:text-[color:var(--page-text)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Zoom in"
          >
            <PlusIcon />
          </button>
          {showDownloadButton ? (
            <>
              <div className="mx-1 h-6 w-px bg-[color:var(--page-line)]" />
              <button
                type="button"
                onClick={onDownloadOriginal}
                disabled={sourcePreviewLoading || (!resumePreviewUrl && !canLoadSourcePreview)}
                className="inline-flex size-8 items-center justify-center rounded-md text-[color:var(--page-muted)] transition hover:bg-[color:var(--page-bg)] hover:text-[color:var(--page-text)] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Download source file"
              >
                <DownloadIcon />
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="absolute inset-0 overflow-y-auto px-4 pb-8 pt-16 sm:px-6 sm:pt-[4.5rem]">
        {renderDocumentContent()}
      </div>
    </div>
  );
}
