import { useState } from "react";
import { sampleTemplates, ResumeTemplate } from "../model/template";

export function useTemplateSelection() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("modern");

  const templates: ResumeTemplate[] = sampleTemplates;

  const selectTemplate = (id: string) => {
    setSelectedTemplateId(id);
  };

  return {
    heading: "Choose a Template",
    description: "Start your resume with a professional design. You can always change it later.",
    templates,
    selectedTemplateId,
    selectTemplate,
  };
}
