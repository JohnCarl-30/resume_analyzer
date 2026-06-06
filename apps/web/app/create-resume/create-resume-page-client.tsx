"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisWorkspace } from "@/features/editor/views/analysis-workspace";
import { emptyResumeForm } from "@/features/editor/model/resume-form";
import { sampleTemplates } from "@/features/templates/model/template";

const createResumeAutosaveKey = "resume-editor:create-resume:draft";
const defaultTemplateId = sampleTemplates[0]?.id ?? "minimalist-grid";

export function CreateResumePageClient() {
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplateId);
  const [resumeFileName, setResumeFileName] = useState("New Resume");

  function handleResetDraft() {
    setSelectedTemplateId(defaultTemplateId);
    setResumeFileName("New Resume");
  }

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
        autosaveKey={createResumeAutosaveKey}
        onBack={() => router.push("/")}
        onTemplateChange={setSelectedTemplateId}
        onRename={setResumeFileName}
        onResetDraft={handleResetDraft}
      />
    </div>
  );
}
