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
} from "../../editor/model/resume-form";
import {
  isResumeTemplateVariant,
  sampleTemplates,
  type ResumeTemplateVariant,
} from "../../templates/model/template";
import {
  createResumeAnalysis,
  getResumeAnalysis,
  getResumeAnalysisSourceUrl,
} from "../utils/analysis-api";
import { formatFileSize, isSupportedFile, maxFileSize } from "../utils/wizard-utils";

type WizardStep = 1 | 2 | 3 | 4 | 5;
type ViewMode = "wizard" | "workspace";

interface DeepFocusWizardProps {
  onExit?: () => void;
  initialAnalysisId?: string;
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

  const trimmedTargetRole = targetRole.trim();
  const trimmedJobDescription = jobDescription.trim();
  const canContinueFromTargetRole = trimmedTargetRole.length >= 2;
  const canContinueFromJobDescription = trimmedJobDescription.length >= 30;
  const canContinueFromUpload = resumeFile !== null;
  const initialWorkspaceForm = useMemo(
    () =>
      analysisResult?.extractedProfile
        ? resumeFormFromExtractedProfile(analysisResult.extractedProfile)
        : emptyResumeForm,
    [analysisResult?.extractedProfile],
  );

  const stepOverview = [
    {
      id: "01",
      title: "Target role",
      description: "Choose the exact role this resume should be optimized for.",
    },
    {
      id: "02",
      title: "Paste job description",
      description: "Anchor the entire session to the role you're targeting.",
    },
    {
      id: "03",
      title: "Upload your resume",
      description: "Provide the PDF so the system can parse and analyze your content.",
    },
    {
      id: "04",
      title: "Choose a template",
      description: "Select the visual layout for your final resume output.",
    },
    {
      id: "05",
      title: "Review suggestions",
      description: "See AI-generated improvements before entering the editor.",
    },
  ] as const;

  function replaceAnalysisParam(analysisId: string | null) {
    if (analysisId) {
      router.replace(`/analysis/${analysisId}`);
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
      setStep(5);
      return;
    }
    if (step === 5) {
      setStep(4);
      return;
    }
    if (step === 4) {
      setStep(3);
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

  async function handleGenerateAnalysis() {
    if (isGeneratingAnalysis) {
      return;
    }

    setAnalysisError("");
    setIsGeneratingAnalysis(true);

    try {
      if (!resumeFile) {
        throw new Error("Please upload a PDF resume first.");
      }

      const nextAnalysis = await createResumeAnalysis({
        targetRole,
        jobDescription,
        selectedTemplateId,
        resumeFile,
      });

      restoredAnalysisIdRef.current = nextAnalysis.id ?? null;
      setAnalysisResult(nextAnalysis);
      setSelectedTemplateId(
        nextAnalysis.selectedTemplateId &&
          isResumeTemplateVariant(nextAnalysis.selectedTemplateId)
          ? nextAnalysis.selectedTemplateId
          : selectedTemplateId,
      );
      replaceAnalysisParam(nextAnalysis.id ?? null);
      setStep(5);
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Unable to generate analysis right now.",
      );
    } finally {
      setIsGeneratingAnalysis(false);
    }
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
        setSelectedTemplateId(
          savedAnalysis.selectedTemplateId &&
            isResumeTemplateVariant(savedAnalysis.selectedTemplateId)
            ? savedAnalysis.selectedTemplateId
            : defaultTemplateId,
        );
        setViewMode("workspace");
        setStep(5);
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        replaceAnalysisParam(null);
        setAnalysisResult(null);
        setViewMode("wizard");
        setStep(1);
        setAnalysisError(
          error instanceof Error ? error.message : "Unable to load the saved analysis right now.",
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
    step === 5
      ? "Back to Templates"
      : step === 4
        ? "Back to Upload"
        : step === 3
          ? "Back to Job Description"
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
                analysisResult?.sourceFileName ?? resumeFile?.name ?? "resume.pdf"
              }
              resumeSourceUrl={resumeSourceUrl}
              resumePreviewUrl={resumePreviewUrl}
              analysisResult={analysisResult}
              initialForm={initialWorkspaceForm}
              onBack={handleBack}
              onTemplateChange={setSelectedTemplateId}
              onAnalysisUpdate={setAnalysisResult}
              onJobDescriptionChange={setJobDescription}
            />
          ) : (
            <>
              <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-[color:var(--page-line)] px-4 py-4 sm:px-6">
                <div className="justify-self-start flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExitToDashboard}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--page-line)] text-[color:var(--page-muted)] transition hover:bg-[color:var(--page-bg-strong)] hover:text-[color:var(--page-text)]"
                    aria-label="Exit to dashboard"
                  >
                    <ArrowLeftIcon />
                  </button>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-medium text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
                    >
                      {backLabel}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 justify-self-center text-sm font-semibold text-[color:var(--page-text)]">
                  <BrandMark />
                  Deep Focus
                </div>

                <div className="justify-self-end">
                  <span className="step-pill">{`STEP ${step} OF 5`}</span>
                </div>
              </header>

              <div className="flex flex-1 flex-col">
                {analysisIdFromUrl && isRestoringAnalysis ? (
                  <div className="flex flex-1 items-center justify-center px-6 py-16">
                    <div className="max-w-md space-y-3 text-center">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">
                        Restoring
                      </p>
                      <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--page-text)]">
                        Loading your saved analysis
                      </h2>
                      <p className="text-base text-[color:var(--page-muted)]">
                        We&apos;re pulling the last generated result from the API so you can keep
                        working after a refresh.
                      </p>
                    </div>
                  </div>
                ) : step === 1 ? (
                  <StepTargetRole
                    targetRole={targetRole}
                    setTargetRole={setTargetRole}
                    onNext={handleNext}
                    canContinue={canContinueFromTargetRole}
                    stepOverview={stepOverview}
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
                  />
                ) : null}
                {step === 4 ? (
                  <StepTemplateSelection
                    selectedTemplateId={selectedTemplateId}
                    setSelectedTemplateId={setSelectedTemplateId}
                    onNext={handleNext}
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
