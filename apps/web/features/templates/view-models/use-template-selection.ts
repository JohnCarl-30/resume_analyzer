import { useState } from "react";
import type { ResumeTemplate } from "../model/template";
import { sampleTemplates } from "../model/template";

export function useTemplateSelection() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(sampleTemplates[0]?.id ?? "");

  const templates: ResumeTemplate[] = sampleTemplates;

  const selectTemplate = (id: string) => {
    setSelectedTemplateId(id);
  };

  return {
    heading: "Pick the export layout without interrupting analysis",
    description:
      "Template choice stays separate from scoring so the final look can change without re-running the pipeline.",
    templates,
    selectedTemplateId,
    selectTemplate,
  };
}
