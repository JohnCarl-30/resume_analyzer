import { useState } from "react";
import type { ResumeTemplate } from "../model/template";
import { sampleTemplates } from "../model/template";

export function useTemplateSelection() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<ResumeTemplate["id"]>(
    sampleTemplates[0]?.id ?? "minimalist-grid",
  );

  const templates: ResumeTemplate[] = sampleTemplates;

  const selectTemplate = (id: ResumeTemplate["id"]) => {
    setSelectedTemplateId(id);
  };

  return {
    heading: "Pick from the finished export layouts",
    description:
      "These templates are the fully supported set right now, so what you preview is the same visual system you get in the editor and export flow.",
    templates,
    selectedTemplateId,
    selectTemplate,
  };
}
