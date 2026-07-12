"use client";

import React, {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, BrandMark } from "../components/wizard-icons";
import { StepTargetRole } from "../components/step-target-role";
import { StepJobDescription } from "../components/step-job-description";
import { StepDocumentUpload } from "../components/step-document-upload";
import { StepTemplateSelection } from "../components/step-template-selection";
import { StepSuggestions } from "../components/step-suggestions";
import { AnalysisWorkspace } from "../../editor/views/analysis-workspace";
import type { ResumeAnalysisResult } from "../../editor/model/resume-analysis";
import {
  emptyResumeForm,
  resumeFormFromExtractedProfile,
  defaultResumeForm,
  resumeFormToText,
} from "../../editor/model/resume-form";
import {
  isResumeTemplateVariant,
  sampleTemplates,
  type ResumeTemplateVariant,
} from "../../templates/model/template";
import {
  createResumeAnalysis,
  createAnalysisFromTemplate,
  getResumeAnalysis,
  getResumeAnalysisSourceUrl,
} from "../utils/analysis-api";
import { formatFileSize, isSupportedFile, maxFileSize } from "../utils/wizard-utils";

type WizardStep = 1 | 2 | 3 | 4 | 5;
type ViewMode = "wizard" | "workspace";
const analysisScratchAutosaveKey = "resume-editor:analysis-new:scratch-draft";

interface DeepFocusWizardProps {
  onExit?: () => void;
  initialAnalysisId?: string;
}

function normalizeTemplateId(
  templateId: string | undefined,
  fallbackTemplateId: ResumeTemplateVariant,
): ResumeTemplateVariant {
  return templateId && isResumeTemplateVariant(templateId)
    ? templateId
    : fallbackTemplateId;
}

export function DeepFocusWizard({ onExit, initialAnalysisId }: DeepFocusWizardProps) {
  const router = useRouter();
  const resumeInputId = useId();
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const restoredAnalysisIdRef = useRef<string | null>(null);
  const defaultTemplateId = sampleTemplates[0]?.id ?? "minimalist-grid";

  const [step, setStep] = useState<WizardStep>(1);
  const [viewMode, setViewMode] = useState<ViewMode>("wizard");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<ResumeTemplateVariant>(defaultTemplateId);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [isRestoringAnalysis, setIsRestoringAnalysis] = useState(false);
  const [analysisIdFromUrl, setAnalysisIdFromUrl] = useState<string | null>(initialAnalysisId ?? null);
  const [resumeSourceUrl, setResumeSourceUrl] = useState<string | null>(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [useTemplateContent, setUseTemplateContent] = useState(false);
  const [createFromScratch, setCreateFromScratch] = useState(false);

  const trimmedTargetRole = targetRole.trim();
  const trimmedJobDescription = jobDescription.trim();
  const canContinueFromTargetRole = trimmedTargetRole.length >= 2;
  const canContinueFromJobDescription = trimmedJobDescription.length >= 30;
  const canContinueFromUpload = resumeFile !== null || useTemplateContent || createFromScratch;
  const initialWorkspaceForm = useMemo(
    () =>
      createFromScratch
        ? emptyResumeForm
        : useTemplateContent
          ? defaultResumeForm
          : analysisResult?.extractedProfile
            ? resumeFormFromExtractedProfile(analysisResult.extractedProfile)
            : emptyResumeForm,
    [analysisResult?.extractedProfile, useTemplateContent, createFromScratch],
  );

  const stepOverview = [
    {
      id: "01",
      title: "Job title",
      description: "Choose the job this resume should match.",
    },
    {
      id: "02",
      title: "Paste job post",
      description: "Add the post so we know what the company wants.",
    },
    {
      id: "03",
      title: "Add resume",
      description: "Upload a file or start with a blank resume.",
    },
    {
      id: "04",
      title: "Pick layout",
      description: "Choose a clean layout for the final resume.",
    },
    {
      id: "05",
      title: "Review suggestions",
      description: "See AI-generated improvements before entering the editor.",
    },
  ] as const;

  function replaceAnalysisParam(analysisId: string | null, options?: { soft?: boolean }) {
    if (analysisId) {
      if (options?.soft && typeof window !== "undefined") {
        window.history.replaceState(null, "", `/analysis/${analysisId}`);
      } else {
        router.replace(`/analysis/${analysisId}`);
      }
    } else {
      router.replace("/analysis/new");
    }
    setAnalysisIdFromUrl(analysisId);
  }

  function handleExitToDashboard() {
    router.push("/");
    onExit?.();
  }

  function handleValidatedFile(fileList: FileList | null) {
    const candidateFile = fileList?.[0];
    if (!candidateFile) return;

    if (!isSupportedFile(candidateFile)) {
      setUploadError("Please choose a PDF resume.");
      return;
    }

    if (candidateFile.size > maxFileSize) {
      setUploadError("Your resume must be 10 MB or smaller.");
      return;
    }

    setUploadError("");
    setResumeFile(candidateFile);
    setCreateFromScratch(false);
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
    if (step === 1 && canContinueFromTargetRole) {
      setStep(2);
      return;
    }
    if (step === 2 && canContinueFromJobDescription) {
      setStep(3);
      return;
    }
    if (step === 3 && canContinueFromUpload) {
      if (createFromScratch) {
        setViewMode("workspace");
        return;
      }
      setStep(4);
      return;
    }
    if (step === 4) {
      void handleGenerateAnalysis();
      return;
    }
    if (step === 5) {
      setViewMode("workspace");
    }
  }

  function handleBack() {
    if (viewMode === "workspace") {
      setViewMode("wizard");
      if (createFromScratch) {
        setStep(3);
        setCreateFromScratch(false);
      } else {
        setStep(5);
      }
      return;
    }
    if (step === 5) {
      setStep(4);
      return;
    }
    if (step === 4) {
      setStep(3);
      setUseTemplateContent(false);
      setCreateFromScratch(false);
      return;
    }
    if (step === 3) {
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(1);
      return;
    }
  }

  function openFilePicker() {
    resumeInputRef.current?.click();
  }

  async function handleGenerateAnalysis(skipTemplate = false) {
    if (isGeneratingAnalysis) {
      return;
    }

    setAnalysisError("");
    setIsGeneratingAnalysis(true);

    try {
      let nextAnalysis;
      const templateIdToUse = skipTemplate
        ? defaultTemplateId
        : selectedTemplateId;

      if (useTemplateContent) {
        const resumeText = resumeFormToText(defaultResumeForm);
        nextAnalysis = await createAnalysisFromTemplate({
          targetRole,
          jobDescription,
          selectedTemplateId: templateIdToUse,
          resumeText,
        });
      } else {
        if (!resumeFile) {
          throw new Error("Please upload a PDF resume first.");
        }

        nextAnalysis = await createResumeAnalysis({
          targetRole,
          jobDescription,
          selectedTemplateId: templateIdToUse,
          resumeFile,
        });
      }

      restoredAnalysisIdRef.current = nextAnalysis.id ?? null;
      setAnalysisResult(nextAnalysis);
      setSelectedTemplateId(
        normalizeTemplateId(nextAnalysis.selectedTemplateId, templateIdToUse),
      );
      replaceAnalysisParam(nextAnalysis.id ?? null, { soft: true });
      setStep(5);
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Unable to generate analysis right now.",
      );
    } finally {
      setIsGeneratingAnalysis(false);
    }
  }

  function handleSkipTemplate() {
    void handleGenerateAnalysis(true);
  }

  useEffect(() => {
    if (!resumeFile) {
      return;
    }

    const nextSourceUrl = URL.createObjectURL(resumeFile);
    setResumeSourceUrl(nextSourceUrl);
    setResumePreviewUrl(resumeFile.type === "application/pdf" ? nextSourceUrl : null);

    return () => {
      URL.revokeObjectURL(nextSourceUrl);
    };
  }, [resumeFile]);

  useEffect(() => {
    if (resumeFile) {
      return;
    }

    if (!analysisResult?.id || !analysisResult.sourceFileContentType) {
      setResumeSourceUrl(null);
      setResumePreviewUrl(null);
      return;
    }

    const nextSourceUrl = getResumeAnalysisSourceUrl(analysisResult.id);
    setResumeSourceUrl(nextSourceUrl);
    setResumePreviewUrl(
      analysisResult.sourceFileContentType === "application/pdf" ? nextSourceUrl : null,
    );
  }, [analysisResult, resumeFile]);

  useEffect(() => {
    setAnalysisIdFromUrl(initialAnalysisId ?? null);
  }, [initialAnalysisId]);

  useEffect(() => {
    if (!analysisIdFromUrl || restoredAnalysisIdRef.current === analysisIdFromUrl) {
      return;
    }

    let isCancelled = false;

    setIsRestoringAnalysis(true);
    setAnalysisError("");

    void getResumeAnalysis(analysisIdFromUrl)
      .then((savedAnalysis) => {
        if (isCancelled) {
          return;
        }

        restoredAnalysisIdRef.current = analysisIdFromUrl;
        setAnalysisResult(savedAnalysis);
        setTargetRole(savedAnalysis.targetRole ?? "");
        setJobDescription(savedAnalysis.jobDescription ?? "");
        setSelectedTemplateId(normalizeTemplateId(savedAnalysis.selectedTemplateId, defaultTemplateId));
        setCreateFromScratch(false);
        setViewMode("workspace");
        setStep(5);
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        replaceAnalysisParam(null);
        setAnalysisResult(null);
        setCreateFromScratch(false);
        setViewMode("wizard");
        setStep(1);
        setAnalysisError(
          error instanceof Error ? error.message : "Unable to load the saved resume check right now.",
        );
      })
      .finally(() => {
        if (!isCancelled) {
          setIsRestoringAnalysis(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [analysisIdFromUrl, defaultTemplateId]);

  const backLabel =
    step === 4
      ? "Back to Resume"
      : step === 3
        ? "Back to Job Post"
        : "Back";

  return (
    <main className="relative min-h-screen bg-[color:var(--page-bg)] text-[color:var(--page-text)]">
      <div className="relative flex min-h-screen w-full">
        <div className="flex w-full flex-col overflow-hidden bg-[color:var(--page-surface)]">
          {viewMode === "workspace" ? (
            <AnalysisWorkspace
              targetRole={targetRole}
              selectedTemplateId={selectedTemplateId}
              resumeFileName={
                createFromScratch
                  ? "New Resume"
                  : analysisResult?.sourceFileName ?? resumeFile?.name ?? "resume.pdf"
              }
              resumeSourceUrl={resumeSourceUrl}
              resumePreviewUrl={resumePreviewUrl}
              analysisResult={analysisResult}
              initialForm={initialWorkspaceForm}
              createMode={createFromScratch}
              autosaveKey={createFromScratch ? analysisScratchAutosaveKey : null}
              onBack={handleBack}
              onTemplateChange={setSelectedTemplateId}
              onAnalysisUpdate={setAnalysisResult}
              onJobDescriptionChange={setJobDescription}
            />
          ) : (
            <>
              <header className="flex items-center justify-between border-b border-[color:var(--page-line)] bg-white px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={step > 1 ? handleBack : handleExitToDashboard}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-[color:var(--page-line)] bg-white px-3 text-sm font-medium text-[color:var(--page-muted)] transition hover:bg-[color:var(--page-bg-strong)] hover:text-[color:var(--page-text)]"
                  >
                    <ArrowLeftIcon />
                    {step > 1 ? backLabel : "Exit"}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--page-text)]">
                  <BrandMark />
                  Deep Focus
                </div>

                <div className="hidden sm:block">
                  <span className="step-pill">{`STEP ${step} OF 5`}</span>
                </div>
              </header>

              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="shrink-0 border-b border-[color:var(--page-line)] bg-white px-4 py-3 sm:px-6">
                  <nav aria-label="Onboarding progress">
                    <div className="sr-only" aria-live="polite" aria-atomic="true">
                      Step {step} of {stepOverview.length}: {stepOverview[step - 1]?.title}
                    </div>
                    <div className="mx-auto grid max-w-5xl grid-cols-5 gap-2">
                      {stepOverview.map((stepItem, index) => {
                        const stepNum = index + 1;
                        const isActive = step === stepNum;
                        const isCompleted = step > stepNum;

                        return (
                          <div key={stepItem.id} className="min-w-0">
                            <div
                              className={`h-1.5 rounded-full transition ${
                                isCompleted || isActive
                                  ? "bg-[color:var(--brand)]"
                                  : "bg-[color:var(--page-line)]"
                              }`}
                              role="progressbar"
                              aria-valuenow={isCompleted ? 100 : isActive ? 50 : 0}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${stepItem.title}: ${isCompleted ? "completed" : isActive ? "in progress" : "not started"}`}
                            />
                            <div className="mt-2 hidden min-w-0 items-center justify-between gap-2 text-xs sm:flex">
                              <span
                                className={`truncate font-medium ${
                                  isActive
                                    ? "text-[color:var(--brand)]"
                                    : isCompleted
                                      ? "text-[color:var(--page-text)]"
                                      : "text-[color:var(--page-muted)]"
                                }`}
                              >
                                {stepItem.title}
                              </span>
                              <span className="shrink-0 text-[color:var(--page-muted)]">{stepNum}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </nav>
                </div>

                {analysisIdFromUrl && isRestoringAnalysis ? (
                  <div className="flex flex-1 items-center justify-center px-6 py-16">
                    <div className="max-w-md space-y-3 text-center">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">
                        Restoring
                      </p>
                      <h2 className="display-serif text-3xl text-[color:var(--page-text)]">
                        Loading your saved check
                      </h2>
                      <p className="text-base text-[color:var(--page-muted)]">
                        We&apos;re loading the last result so you can keep working after a refresh.
                      </p>
                    </div>
                  </div>
                ) : step === 1 ? (
                  <StepTargetRole
                    targetRole={targetRole}
                    setTargetRole={setTargetRole}
                    onNext={handleNext}
                    canContinue={canContinueFromTargetRole}
                  />
                ) : step === 2 ? (
                  <StepJobDescription
                    jobDescription={jobDescription}
                    setJobDescription={setJobDescription}
                    onNext={handleNext}
                    canContinue={canContinueFromJobDescription}
                  />
                ) : null}
                {step === 3 ? (
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
                    onNext={handleNext}
                    canContinue={canContinueFromUpload}
                    createFromScratch={createFromScratch}
                    setCreateFromScratch={setCreateFromScratch}
                  />
                ) : null}
                {step === 4 ? (
                  <StepTemplateSelection
                    selectedTemplateId={selectedTemplateId}
                    setSelectedTemplateId={setSelectedTemplateId}
                    useTemplateContent={useTemplateContent}
                    setUseTemplateContent={setUseTemplateContent}
                    hasResumeFile={resumeFile !== null}
                    onNext={handleNext}
                    onSkipTemplate={handleSkipTemplate}
                    isSubmitting={isGeneratingAnalysis}
                    errorMessage={analysisError}
                  />
                ) : null}
                {step === 5 && analysisResult !== null ? (
                  <StepSuggestions
                    analysisResult={analysisResult}
                    onEnterEditor={() => setViewMode("workspace")}
                    onBack={handleBack}
                  />
                ) : null}
              </div>

            </>
          )}
        </div>
      </div>
    </main>
  );
}
