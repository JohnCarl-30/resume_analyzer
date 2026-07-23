import React from "react";
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
  hasSourcePreviewChoice,
}: DocumentPreviewProps) {
  const previewCardClassName =
    "mx-auto w-full max-w-[860px] rounded-lg border border-[color:var(--page-line)] bg-white shadow-sm";
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
              ? "Loading original…"
              : sourcePreviewError || "Original file unavailable."}
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
      <div className="mx-auto flex aspect-[1/1.414] w-full max-w-[860px] items-center justify-center rounded-lg border border-dashed border-[color:var(--page-line)] bg-white px-8 py-10 text-center shadow-sm">
        <div className="max-w-md space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
            Preview unavailable
          </p>
          <h3 className="display-serif text-2xl text-[color:var(--page-text)]">
            We parsed the file, but there isn&apos;t enough structured content to draw the page yet.
          </h3>
          <p className="text-base leading-7 text-[color:var(--page-muted)]">
            Try a clearer PDF, enable OpenAI extraction, or upload a resume with selectable text so the preview
            can mirror your content more closely.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-[color:var(--page-bg-strong)]">
      <div className="pointer-events-none absolute inset-x-2 top-3 z-20 flex justify-center">
        <div className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-[color:var(--page-line)] bg-white/95 px-2 py-1.5 shadow-sm [scrollbar-width:none] sm:gap-2 sm:px-2.5 [&::-webkit-scrollbar]:hidden">
          {hasSourcePreviewChoice ? (
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-slate-50 p-0.5">
              {canLoadSourcePreview ? (
                <button
                  type="button"
                  onClick={onShowOriginalPreview}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium transition ${
                    previewMode === "uploaded"
                      ? "bg-white text-[color:var(--brand)] shadow-sm"
                      : "text-[color:var(--page-muted)] hover:text-[color:var(--page-text)]"
                  }`}
                >
                  <span>📄</span>
                  Original
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {/* handled by parent */}}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium transition ${
                  previewMode === "structured"
                    ? "bg-white text-[color:var(--brand)] shadow-sm"
                    : "text-[color:var(--page-muted)] hover:text-[color:var(--page-text)]"
                }`}
              >
                <span>✨</span>
                Layout
              </button>
            </div>
          ) : null}

          {hasSourcePreviewChoice && (
            <div className="mx-0.5 h-7 w-px shrink-0 bg-[color:var(--page-line)] sm:mx-1" />
          )}

          <button
            type="button"
            onClick={() => onAdjustZoom(-10)}
            disabled={!canZoomDocument}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[color:var(--page-muted)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Zoom out"
          >
            🔍
          </button>
          <span className="min-w-10 shrink-0 text-center text-xs font-semibold text-[color:var(--page-muted)]">
            {previewZoom}%
          </span>
          <button
            type="button"
            onClick={() => onAdjustZoom(10)}
            disabled={!canZoomDocument}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[color:var(--page-muted)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Zoom in"
          >
            ➕
          </button>
          <div className="mx-1 h-7 w-px bg-[color:var(--page-line)]" />
          {showDownloadButton && (
            <button
              type="button"
              onClick={onDownloadOriginal}
              disabled={sourcePreviewLoading || (!resumePreviewUrl && !canLoadSourcePreview)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--page-muted)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Download source file"
            >
              📥
            </button>
          )}
        </div>
      </div>

      <div className="absolute inset-0 overflow-y-auto px-4 pb-8 pt-16 sm:px-6 sm:pt-[4.5rem]">
        {renderDocumentContent()}
      </div>
    </div>
  );
}
