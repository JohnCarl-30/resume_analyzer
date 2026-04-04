"use client";

import React, { useState, useId, useRef, type ChangeEvent, type DragEvent } from "react";
import { ArrowLeftIcon, BrandMark } from "../components/wizard-icons";
import { StepTargetRole } from "../components/step-target-role";
import { StepDocumentUpload } from "../components/step-document-upload";
import { StepTemplateSelection } from "../components/step-template-selection";
import { AnalysisWorkspace } from "../../editor/views/analysis-workspace";
import { sampleTemplates } from "../../templates/model/template";
import { formatFileSize, isSupportedFile, maxFileSize } from "../utils/wizard-utils";

type WizardStep = 1 | 2 | 3;
type ViewMode = "wizard" | "workspace";

export function DeepFocusWizard() {
  const resumeInputId = useId();
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<WizardStep>(1);
  const [viewMode, setViewMode] = useState<ViewMode>("wizard");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(sampleTemplates[0]?.id ?? "");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  const selectedTemplate =
    sampleTemplates.find((template) => template.id === selectedTemplateId) ?? sampleTemplates[0];
  const canContinueFromRole = targetRole.trim().length > 0;
  const canContinueFromUpload = Boolean(resumeFile) && jobDescription.trim().length > 0;
  
  const stepOverview = [
    {
      id: "01",
      title: "Target the role",
      description: "Define the position first so the rest of the flow stays tailored.",
    },
    {
      id: "02",
      title: "Upload and compare",
      description: "Bring in the current resume and the target job description together.",
    },
    {
      id: "03",
      title: "Choose the finish",
      description: "Select the final layout once the matching context is already set.",
    },
  ] as const;

  function handleValidatedFile(fileList: FileList | null) {
    const candidateFile = fileList?.[0];
    if (!candidateFile) return;

    if (!isSupportedFile(candidateFile)) {
      setUploadError("Please choose a PDF, DOC, or DOCX resume.");
      return;
    }

    if (candidateFile.size > maxFileSize) {
      setUploadError("Your resume must be 10 MB or smaller.");
      return;
    }

    setUploadError("");
    setResumeFile(candidateFile);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    handleValidatedFile(event.target.files);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragActive(false);
    handleValidatedFile(event.dataTransfer.files);
  }

  function handleNext() {
    if (step === 1 && canContinueFromRole) {
      setStep(2);
      return;
    }
    if (step === 2 && canContinueFromUpload) {
      setStep(3);
      return;
    }
    if (step === 3) {
      setViewMode("workspace");
    }
  }

  function handleBack() {
    if (viewMode === "workspace") {
      setViewMode("wizard");
      setStep(3);
      return;
    }
    if (step === 1) return;
    setStep((currentStep) => (currentStep === 3 ? 2 : 1));
  }

  function openFilePicker() {
    resumeInputRef.current?.click();
  }

  const backLabel = step === 3 ? "Back to Upload" : "Back";

  return (
    <main className="relative min-h-screen bg-[color:var(--page-bg)] text-[color:var(--page-text)]">
      <div className="relative flex min-h-screen w-full">
        <div className="flex w-full flex-col overflow-hidden bg-[color:var(--page-surface)]">
          {viewMode === "workspace" ? (
            <AnalysisWorkspace
              targetRole={targetRole}
              selectedTemplateName={selectedTemplate?.name ?? "Selected template"}
              resumeFileName={resumeFile?.name ?? "resume.pdf"}
              onBack={handleBack}
            />
          ) : (
            <>
              <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-[color:var(--page-line)] px-4 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="inline-flex items-center gap-2 justify-self-start rounded-full px-2 py-1 text-sm font-medium text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)] disabled:cursor-default disabled:opacity-60 disabled:hover:text-[color:var(--page-muted)]"
                >
                  <ArrowLeftIcon />
                  {backLabel}
                </button>

                <div className="flex items-center gap-2 justify-self-center text-sm font-semibold text-[color:var(--page-text)]">
                  <BrandMark />
                  Deep Focus
                </div>

                <div className="justify-self-end">
                  {step > 1 ? <span className="step-pill">{`STEP ${step} OF 3`}</span> : null}
                </div>
              </header>

              <div className="flex flex-1 flex-col">
                {step === 1 && (
                  <StepTargetRole
                    targetRole={targetRole}
                    setTargetRole={setTargetRole}
                    onNext={handleNext}
                    canContinue={canContinueFromRole}
                    stepOverview={stepOverview}
                  />
                )}
                {step === 2 && (
                  <StepDocumentUpload
                    resumeInputId={resumeInputId}
                    resumeInputRef={resumeInputRef}
                    isDragActive={isDragActive}
                    setIsDragActive={setIsDragActive}
                    handleDrop={handleDrop}
                    handleFileChange={handleFileChange}
                    resumeFile={resumeFile}
                    formatFileSize={formatFileSize}
                    openFilePicker={openFilePicker}
                    uploadError={uploadError}
                    jobDescription={jobDescription}
                    setJobDescription={setJobDescription}
                    targetRole={targetRole}
                    onNext={handleNext}
                    canContinue={canContinueFromUpload}
                  />
                )}
                {step === 3 && (
                  <StepTemplateSelection
                    selectedTemplateId={selectedTemplateId}
                    setSelectedTemplateId={setSelectedTemplateId}
                    onNext={handleNext}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
