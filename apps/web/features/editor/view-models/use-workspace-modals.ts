import { useState, useEffect, useCallback } from "react";
import { emptyProjectDraft, type ProjectDraft } from "../components/workspace/project-modal";

export type ContentModalView = "content" | "project" | "templates" | "tailor" | null;

export function useWorkspaceModals() {
  const [pendingModalClose, setPendingModalClose] = useState(false);
  const [modalView, setModalView] = useState<ContentModalView>(null);
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(emptyProjectDraft);
  const [projectFormError, setProjectFormError] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [tailorReviewOpen, setTailorReviewOpen] = useState(false);

  useEffect(() => {
    if (pendingModalClose) {
      setModalView(null);
      setPendingModalClose(false);
    }
  }, [pendingModalClose]);

  const openAddContentModal = useCallback(() => {
    setModalView("content");
    setProjectFormError("");
  }, []);

  const openProjectModal = useCallback(() => {
    setModalView("project");
    setProjectFormError("");
  }, []);

  const closeModal = useCallback(() => {
    setModalView(null);
    setProjectFormError("");
    setProjectDraft(emptyProjectDraft);
  }, []);

  const openTailorReview = useCallback(() => {
    setTailorReviewOpen(true);
  }, []);

  const closeTailorReview = useCallback(() => {
    setTailorReviewOpen(false);
  }, []);

  const openShortcuts = useCallback(() => {
    setShowShortcuts(true);
  }, []);

  const closeShortcuts = useCallback(() => {
    setShowShortcuts(false);
  }, []);

  const updateProjectDraft = useCallback((key: keyof ProjectDraft, value: unknown) => {
    setProjectDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const clearProjectError = useCallback(() => {
    setProjectFormError("");
  }, []);

  const setProjectError = useCallback((error: string) => {
    setProjectFormError(error);
  }, []);

  return {
    modalView,
    setModalView,
    projectDraft,
    projectFormError,
    showShortcuts,
    tailorReviewOpen,
    openAddContentModal,
    openProjectModal,
    closeModal,
    openTailorReview,
    closeTailorReview,
    openShortcuts,
    closeShortcuts,
    updateProjectDraft,
    clearProjectError,
    setProjectError,
    setPendingModalClose,
    setTailorReviewOpen,
  };
}
