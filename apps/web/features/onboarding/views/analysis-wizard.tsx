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
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, BrandMark } from "../components/wizard-icons";
import { AccountMenu } from "@/features/auth/components/account-menu";
import { StepTargetRole } from "../components/step-target-role";
import { StepJobDescription } from "../components/step-job-description";
import { StepDocumentUpload } from "../components/step-document-upload";
import { StepTemplateSelection } from "../components/step-template-selection";
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
  loadResumeAnalysisSourcePreview,
} from "../utils/analysis-api";
import { useAnalysisQuota } from "@/features/account/view-models/use-analysis-quota";
import { getAnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";
import { Button } from "@/components/ui/button";
import { formatFileSize, isSupportedFile, maxFileSize } from "../utils/wizard-utils";
import { useAnalysisProgress } from "../view-models/use-analysis-progress";
import type { AnalysisProgressMode } from "../model/analysis-progress";

type WizardStep = 1 | 2 | 3 | 4 | 5;
type ViewMode = "wizard" | "workspace";
const analysisScratchAutosaveKey = "resume-editor:analysis-new:scratch-draft";

interface AnalysisWizardProps {
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

export function AnalysisWizard({ onExit, initialAnalysisId }: AnalysisWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scratchMode = searchParams.get("mode") === "scratch";
  const {
    quota: analysisQuota,
    error: quotaError,
    isLoading: quotaLoading,
    refetch: refetchQuota,
  } = useAnalysisQuota();
  const quotaNav = getAnalysisQuotaNavigationState(analysisQuota, {
    isLoading: quotaLoading,
    error: quotaError,
  });
  const uploadBlocked = !initialAnalysisId && !quotaNav.canUpload;
  const awaitingQuota =
    !initialAnalysisId && !scratchMode && quotaLoading;
  const quotaExhausted = !initialAnalysisId && !quotaLoading && !quotaNav.canUpload && !quotaNav.hasError;
  const resumeInputId = useId();
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const restoredAnalysisIdRef = useRef<string | null>(null);
  const resumeObjectUrlRef = useRef<string | null>(null);

  function revokeStoredResumeObjectUrl() {
    if (resumeObjectUrlRef.current) {
      URL.revokeObjectURL(resumeObjectUrlRef.current);
      resumeObjectUrlRef.current = null;
    }
  }
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
  const [openSuggestionsReview, setOpenSuggestionsReview] = useState(false);

  const analysisProgressMode: AnalysisProgressMode = useTemplateContent ? "template" : "upload";
  const analysisProgress = useAnalysisProgress(isGeneratingAnalysis, analysisProgressMode);

  const trimmedTargetRole = targetRole.trim();
  const trimmedJobDescription = jobDescription.trim();
  const canContinueFromTargetRole = trimmedTargetRole.length >= 2;
  const canContinueFromJobDescription = trimmedJobDescription.length >= 30;
  const hasResumeReady = resumeFile !== null || useTemplateContent;
  const canContinueFromUpload =
    createFromScratch || (hasResumeReady && !createFromScratch && !uploadBlocked);
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
    router.push("/home");
    onExit?.();
  }

  function handleValidatedFile(fileList: FileList | null) {
    if (uploadBlocked) {
      setUploadError(quotaNav.uploadBlockedMessage);
      return;
    }

    const candidateFile = fileList?.[0];
    if (!candidateFile) return;

    if (!isSupportedFile(candidateFile)) {
      setUploadError("Please choose a PDF or Word resume.");
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
  }

  function handleBack() {
    if (viewMode === "workspace") {
      // After a completed check, the free quota is used — going back into the
      // wizard traps people on the blocked upload step. Send them home instead.
      if (initialAnalysisId || analysisResult?.id || analysisIdFromUrl) {
        handleExitToDashboard();
        return;
      }

      setViewMode("wizard");
      if (createFromScratch) {
        setStep(3);
        setCreateFromScratch(false);
      } else {
        setStep(4);
      }
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

  function handleChooseScratchBuilder() {
    setCreateFromScratch(true);
    setResumeFile(null);
    setUploadError("");
    setUseTemplateContent(false);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
  }

  async function handleGenerateAnalysis(skipTemplate = false) {
    if (isGeneratingAnalysis) {
      return;
    }

    if (quotaLoading) {
      setAnalysisError("Checking your free check allowance. Try again in a moment.");
      return;
    }

    if (!quotaNav.canUpload) {
      setAnalysisError(
        analysisQuota?.analysisId
          ? "This account already used its one resume analysis. Open your saved check to review or update it."
          : quotaError || quotaNav.uploadBlockedMessage,
      );
      if (analysisQuota?.analysisId) {
        router.replace(`/analysis/${analysisQuota.analysisId}`);
      }
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

      // Commit workspace in memory first. Do not path-change via history.replaceState
      // (Next.js syncs those edits and can remount this wizard, dropping step 5).
      // The saved check remains available at /analysis/:id from Home.
      restoredAnalysisIdRef.current = nextAnalysis.id ?? null;
      setAnalysisResult(nextAnalysis);
      setSelectedTemplateId(
        normalizeTemplateId(nextAnalysis.selectedTemplateId, templateIdToUse),
      );
      setAnalysisIdFromUrl(nextAnalysis.id ?? null);
      setOpenSuggestionsReview(true);
      setStep(5);
      setViewMode("workspace");
      void refetchQuota();
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Unable to generate analysis right now.",
      );
      // The server may have saved the check (and used the free quota) even when
      // the client timed out — recover by opening the saved analysis.
      void refetchQuota();
    } finally {
      setIsGeneratingAnalysis(false);
    }
  }

  function handleSkipTemplate() {
    void handleGenerateAnalysis(true);
  }

  useEffect(() => {
    if (initialAnalysisId || quotaLoading) {
      return;
    }

    if (scratchMode) {
      setStep(3);
      handleChooseScratchBuilder();
      return;
    }

    // Only bounce exhausted accounts to the upload/scratch step on a fresh
    // wizard visit. Never interrupt an in-flight check or completed workspace.
    if (
      uploadBlocked &&
      analysisQuota &&
      viewMode === "wizard" &&
      !isGeneratingAnalysis &&
      !analysisResult &&
      !analysisIdFromUrl
    ) {
      setStep(3);
    }
  }, [
    analysisIdFromUrl,
    analysisQuota,
    analysisResult,
    initialAnalysisId,
    isGeneratingAnalysis,
    quotaLoading,
    scratchMode,
    uploadBlocked,
    viewMode,
  ]);

  // If the check request failed after the server redeemed quota, open the saved result.
  useEffect(() => {
    if (
      initialAnalysisId ||
      isGeneratingAnalysis ||
      viewMode === "workspace" ||
      analysisResult ||
      !analysisError ||
      !analysisQuota?.analysisId ||
      analysisQuota.canAnalyze !== false
    ) {
      return;
    }

    router.replace(`/analysis/${analysisQuota.analysisId}`);
  }, [
    analysisError,
    analysisQuota?.analysisId,
    analysisQuota?.canAnalyze,
    analysisResult,
    initialAnalysisId,
    isGeneratingAnalysis,
    router,
    viewMode,
  ]);

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
      revokeStoredResumeObjectUrl();
      setResumeSourceUrl(null);
      setResumePreviewUrl(null);
      return;
    }

    let isCancelled = false;

    void loadResumeAnalysisSourcePreview(analysisResult.id)
      .then((result) => {
        if (isCancelled) {
          URL.revokeObjectURL(result.sourceUrl);
          return;
        }

        revokeStoredResumeObjectUrl();
        resumeObjectUrlRef.current = result.sourceUrl;
        setResumeSourceUrl(result.sourceUrl);
        setResumePreviewUrl(result.previewUrl);
      })
      .catch(() => {
        if (!isCancelled) {
          revokeStoredResumeObjectUrl();
          setResumeSourceUrl(null);
          setResumePreviewUrl(null);
        }
      });

    return () => {
      isCancelled = true;
      revokeStoredResumeObjectUrl();
    };
  }, [analysisResult?.id, analysisResult?.sourceFileContentType, resumeFile]);

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
        setOpenSuggestionsReview(true);
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
              initialSuggestionsReviewOpen={openSuggestionsReview}
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
                  Resumae
                </div>

                <div className="flex items-center gap-3">
                  <span className="step-pill hidden sm:inline">{`STEP ${step} OF 5`}</span>
                  <AccountMenu />
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

                {!initialAnalysisId && !quotaLoading && quotaNav.hasError && (
                  <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
                    Couldn&apos;t verify your plan status.
                    <button
                      type="button"
                      onClick={() => void refetchQuota()}
                      className="ml-2 underline hover:text-amber-900"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!initialAnalysisId && !quotaLoading && !quotaNav.hasError && !quotaNav.canUpload && (
                  <div className="border-b border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-2 text-center text-sm text-[color:var(--page-muted)]">
                    Free check used.{" "}
                    {quotaNav.savedCheckPath ? (
                      <a href={quotaNav.savedCheckPath} className="underline hover:text-[color:var(--page-text)]">
                        Open your saved check
                      </a>
                    ) : (
                      <span>You can still start a blank draft below.</span>
                    )}
                  </div>
                )}

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
                ) : awaitingQuota ? (
                  <div className="flex flex-1 items-center justify-center px-6 py-16">
                    <div className="max-w-md space-y-3 text-center">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">
                        Loading
                      </p>
                      <h2 className="display-serif text-3xl text-[color:var(--page-text)]">
                        Loading your account status
                      </h2>
                      <p className="text-base leading-7 text-[color:var(--page-muted)]">
                        Checking whether your free resume check is ready.
                      </p>
                    </div>
                  </div>
                ) : !initialAnalysisId && quotaNav.hasError ? (
                  <div className="flex flex-1 items-center justify-center px-6 py-16">
                    <div className="max-w-md space-y-4 text-center">
                      <h2 className="display-serif text-3xl text-[color:var(--page-text)]">
                        Plan status unavailable
                      </h2>
                      <p className="text-base leading-7 text-[color:var(--page-muted)]">
                        {quotaError || quotaNav.uploadBlockedMessage}
                      </p>
                      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                        <Button type="button" onClick={() => void refetchQuota()}>
                          Try again
                        </Button>
                        {quotaNav.canUseScratchBuilder ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setStep(3);
                              handleChooseScratchBuilder();
                            }}
                          >
                            Start blank draft
                          </Button>
                        ) : null}
                      </div>
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
                    onChooseScratchBuilder={handleChooseScratchBuilder}
                    uploadDisabled={uploadBlocked}
                    quotaLoading={quotaLoading}
                    quotaExhausted={quotaExhausted}
                    quotaExhaustedMessage={quotaExhausted ? quotaNav.exhaustedMessage : undefined}
                    savedCheckPath={quotaNav.savedCheckPath}
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
                    isSubmitting={isGeneratingAnalysis || quotaLoading || uploadBlocked}
                    errorMessage={
                      analysisError ||
                      (uploadBlocked && !quotaLoading ? quotaNav.uploadBlockedMessage : "")
                    }
                    analysisProgressSteps={
                      isGeneratingAnalysis ? analysisProgress.steps : undefined
                    }
                    analysisProgressActiveStepIndex={analysisProgress.activeStepIndex}
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
