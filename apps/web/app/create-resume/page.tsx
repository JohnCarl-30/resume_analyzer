"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisWorkspace } from "@/features/editor/views/analysis-workspace";
import { emptyResumeForm } from "@/features/editor/model/resume-form";
import { sampleTemplates } from "@/features/templates/model/template";

export default function CreateResumePage() {
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    sampleTemplates[0]?.id ?? "minimalist-grid",
  );
  const [resumeFileName, setResumeFileName] = useState("New Resume");

  return (
    <div className="h-screen w-full overflow-hidden">
      <AnalysisWorkspace
        targetRole=""
        selectedTemplateId={selectedTemplateId}
        resumeFileName={resumeFileName}
        resumeSourceUrl={null}
        resumePreviewUrl={null}
        analysisResult={null}
        initialForm={emptyResumeForm}
        createMode
        onBack={() => router.push("/")}
        onTemplateChange={setSelectedTemplateId}
        onRename={setResumeFileName}
      />
    </div>
  );
}
