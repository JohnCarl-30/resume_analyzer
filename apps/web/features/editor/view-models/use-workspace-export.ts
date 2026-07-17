"use client";

import { useCallback } from "react";

import type { ResumeForm } from "../model/resume-form";

interface UseWorkspaceExportOptions {
  resumeTitle: string;
  activeTemplateId: string;
  selectedTemplateName: string;
  form: ResumeForm;
  resumeSourceUrl?: string | null;
  resumeFileName: string;
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "resume";
}

function triggerDownload(url: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.click();
}

export function useWorkspaceExport({
  resumeTitle,
  activeTemplateId,
  selectedTemplateName,
  form,
  resumeSourceUrl,
  resumeFileName,
}: UseWorkspaceExportOptions) {
  const exportJson = useCallback(() => {
    const payload = {
      title: resumeTitle,
      selectedTemplateId: activeTemplateId,
      selectedTemplateName,
      form,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${slugify(resumeTitle)}-backup.json`);
    URL.revokeObjectURL(url);
  }, [activeTemplateId, form, resumeTitle, selectedTemplateName]);

  const downloadSource = useCallback(() => {
    if (!resumeSourceUrl) {
      return;
    }

    const fileName = resumeFileName.trim() || `${slugify(resumeTitle)}.pdf`;
    triggerDownload(resumeSourceUrl, fileName);
  }, [resumeFileName, resumeSourceUrl, resumeTitle]);

  return { exportJson, downloadSource };
}
