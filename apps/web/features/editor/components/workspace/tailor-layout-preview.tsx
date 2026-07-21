"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { ResumeForm } from "../../model/resume-form";
import type { TailorProposalType } from "../../model/resume-tailor-draft";
import type { ResumeTemplateVariant } from "../../../templates/model/template";
import { ResumeRenderer } from "../resume-renderer";

const PREVIEW_SCALE = 0.62;

const FOCUS_LABELS: Record<TailorProposalType, string> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
};

interface TailorLayoutPreviewProps {
  form: ResumeForm;
  variantId: ResumeTemplateVariant;
  focusSection?: TailorProposalType | null;
  className?: string;
  /** Compact strip for narrow viewports */
  compact?: boolean;
}

export function TailorLayoutPreview({
  form,
  variantId,
  focusSection = null,
  className = "",
  compact = false,
}: TailorLayoutPreviewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = useState(0);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const update = () => {
      setPageHeight(page.scrollHeight * PREVIEW_SCALE);
    };

    update();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(update);
    observer.observe(page);
    return () => observer.disconnect();
  }, [form, variantId]);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    root.querySelectorAll("[data-resume-section]").forEach((el) => {
      el.removeAttribute("data-preview-focus");
    });

    if (!focusSection) return;

    const target = root.querySelector(`[data-resume-section="${focusSection}"]`);
    if (!target) return;

    target.setAttribute("data-preview-focus", "true");

    const scrollRoot = scrollRef.current;
    if (!scrollRoot) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Wait a frame so scale + focus styles settle before scrolling.
    const frame = window.requestAnimationFrame(() => {
      const targetRect = target.getBoundingClientRect();
      const rootRect = scrollRoot.getBoundingClientRect();
      const nextTop =
        scrollRoot.scrollTop + (targetRect.top - rootRect.top) - rootRect.height * 0.18;
      scrollRoot.scrollTo({
        top: Math.max(0, nextTop),
        behavior: prefersReduced ? "auto" : "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusSection, form, variantId, pageHeight]);

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div
        ref={scrollRef}
        className={`min-h-0 flex-1 overflow-auto ${compact ? "max-h-52" : ""}`}
        aria-label={
          focusSection
            ? `Layout preview, focused on ${FOCUS_LABELS[focusSection]}`
            : "Layout preview"
        }
      >
        <div className="flex justify-center px-1 pb-4 pt-1">
          <div
            className="w-full overflow-hidden rounded-sm bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/8"
            style={{ height: pageHeight || undefined, maxWidth: compact ? 280 : 360 }}
          >
            <div
              ref={pageRef}
              className="origin-top-left p-6 [&_[data-preview-focus=true]]:rounded-sm [&_[data-preview-focus=true]]:bg-[#f4f6f3] [&_[data-preview-focus=true]]:ring-2 [&_[data-preview-focus=true]]:ring-[#c5d4c2] [&_[data-preview-focus=true]]:ring-offset-2 [&_[data-preview-focus=true]]:ring-offset-white"
              style={{
                width: `${100 / PREVIEW_SCALE}%`,
                transform: `scale(${PREVIEW_SCALE})`,
              }}
            >
              <ResumeRenderer form={form} variantId={variantId} showPlaceholders />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
