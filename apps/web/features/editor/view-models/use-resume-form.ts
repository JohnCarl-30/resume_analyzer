import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import type { ResumeForm, EducationEntry, ExperienceEntry, LeadershipEntry, ProjectEntry } from "../model/resume-form";
import { defaultResumeForm, normalizeResumeForm } from "../model/resume-form";

interface ResumeFormOptions {
  storageKey?: string | null;
  autosave?: boolean;
}

interface HistoryState {
  past: ResumeForm[];
  future: ResumeForm[];
}

const HISTORY_LIMIT = 50;

function loadSavedForm(storageKey?: string | null): ResumeForm | null {
  if (!storageKey || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return normalizeResumeForm(JSON.parse(raw) as ResumeForm);
  } catch {
    // ignore parse errors
  }
  return null;
}

function saveForm(storageKey: string | null | undefined, form: ResumeForm) {
  if (!storageKey || typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(form));
  } catch {
    // ignore quota errors
  }
}

function clearSavedForm(storageKey?: string | null) {
  if (!storageKey || typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // ignore quota errors
  }
}

export function useResumeForm(
  initialForm: ResumeForm = defaultResumeForm,
  options: ResumeFormOptions = {},
) {
  const storageKey = options.storageKey ?? null;
  const autosave = options.autosave ?? storageKey !== null;
  const isUndoRedo = useRef(false);
  const skipNextAutosave = useRef(false);
  const hasLoadedSavedForm = useRef(storageKey === null);

  const savedForm = loadSavedForm(storageKey);
  hasLoadedSavedForm.current = true;

  const form = useForm({
    defaultValues: savedForm ?? normalizeResumeForm(initialForm),
  });

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryState>({ past: [], future: [] });

  const pushHistory = useCallback((prevForm: ResumeForm) => {
    setHistory((h) => ({
      past: [...h.past.slice(-HISTORY_LIMIT), prevForm],
      future: [],
    }));
  }, []);

  const setFormWithHistory = useCallback(
    (updater: (prev: ResumeForm) => ResumeForm) => {
      if (isUndoRedo.current) {
        const next = updater(form.state.values);
        form.reset(next);
        return;
      }
      const current = form.state.values;
      const next = updater(current);
      if (next !== current) {
        pushHistory(current);
      }
      form.reset(next);
    },
    [form, pushHistory],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      isUndoRedo.current = true;
      form.reset(previous);
      requestAnimationFrame(() => {
        isUndoRedo.current = false;
      });
      return {
        past: h.past.slice(0, -1),
        future: [form.state.values, ...h.future],
      };
    });
  }, [form]);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      isUndoRedo.current = true;
      form.reset(next);
      requestAnimationFrame(() => {
        isUndoRedo.current = false;
      });
      return {
        past: [...h.past, form.state.values],
        future: h.future.slice(1),
      };
    });
  }, [form]);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const resetForm = useCallback(
    (nextForm: ResumeForm = initialForm) => {
      isUndoRedo.current = false;
      skipNextAutosave.current = true;
      clearSavedForm(storageKey);
      form.reset(normalizeResumeForm(nextForm));
      setActiveSectionId(null);
      setHistory({ past: [], future: [] });
    },
    [form, initialForm, storageKey],
  );

  const updatePersonalInfo = useCallback((data: Partial<ResumeForm["personalInfo"]>) => {
    setFormWithHistory((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...data },
    }));
  }, [setFormWithHistory]);

  const updateEducation = useCallback((id: string, data: Partial<EducationEntry>) => {
    setFormWithHistory((prev) => ({
      ...prev,
      education: prev.education.map((item) => (item.id === id ? { ...item, ...data } : item)),
    }));
  }, [setFormWithHistory]);

  const addEducation = useCallback((draft: Partial<EducationEntry> = {}) => {
    const newEntry: EducationEntry = {
      id: `edu_${Date.now()}`,
      institution: "",
      degree: "",
      location: "",
      dateRange: "",
      ...draft,
    };
    setFormWithHistory((prev) => ({ ...prev, education: [...prev.education, newEntry] }));
    return newEntry.id;
  }, [setFormWithHistory]);

  const removeEducation = useCallback((id: string) => {
    setFormWithHistory((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  }, [setFormWithHistory]);

  const updateExperience = useCallback((id: string, data: Partial<ExperienceEntry>) => {
    setFormWithHistory((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => (item.id === id ? { ...item, ...data } : item)),
    }));
  }, [setFormWithHistory]);

  const addExperience = useCallback((draft: Partial<ExperienceEntry> = {}) => {
    const newEntry: ExperienceEntry = {
      id: `exp_${Date.now()}`,
      role: "",
      location: "",
      dateRange: "",
      bullets: [],
      ...draft,
    };
    setFormWithHistory((prev) => ({ ...prev, experience: [...prev.experience, newEntry] }));
    return newEntry.id;
  }, [setFormWithHistory]);

  const removeExperience = useCallback((id: string) => {
    setFormWithHistory((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  }, [setFormWithHistory]);

  const addExperienceBullet = useCallback((id: string, bullet: string) => {
    setFormWithHistory((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, bullets: [...item.bullets, bullet] } : item,
      ),
    }));
  }, [setFormWithHistory]);

  const updateExperienceBullet = useCallback((id: string, index: number, bullet: string) => {
    setFormWithHistory((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id
          ? { ...item, bullets: item.bullets.map((b, i) => (i === index ? bullet : b)) }
          : item,
      ),
    }));
  }, [setFormWithHistory]);

  const removeExperienceBullet = useCallback((id: string, index: number) => {
    setFormWithHistory((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, bullets: item.bullets.filter((_, i) => i !== index) } : item,
      ),
    }));
  }, [setFormWithHistory]);

  const updateLeadership = useCallback((id: string, data: Partial<LeadershipEntry>) => {
    setFormWithHistory((prev) => ({
      ...prev,
      leadership: prev.leadership.map((item) => (item.id === id ? { ...item, ...data } : item)),
    }));
  }, [setFormWithHistory]);

  const addLeadership = useCallback(() => {
    const newEntry: LeadershipEntry = {
      id: `lead_${Date.now()}`,
      role: "",
      organization: "",
      location: "",
      dateRange: "",
    };
    setFormWithHistory((prev) => ({ ...prev, leadership: [...prev.leadership, newEntry] }));
  }, [setFormWithHistory]);

  const removeLeadership = useCallback((id: string) => {
    setFormWithHistory((prev) => ({
      ...prev,
      leadership: prev.leadership.filter((item) => item.id !== id),
    }));
  }, [setFormWithHistory]);

  const updateAwards = useCallback((index: number, value: string) => {
    setFormWithHistory((prev) => {
      const newAwards = [...prev.awards];
      newAwards[index] = value;
      return { ...prev, awards: newAwards };
    });
  }, [setFormWithHistory]);

  const addAward = useCallback(() => {
    setFormWithHistory((prev) => ({ ...prev, awards: [...prev.awards, ""] }));
  }, [setFormWithHistory]);

  const removeAward = useCallback((index: number) => {
    setFormWithHistory((prev) => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index),
    }));
  }, [setFormWithHistory]);

  const addProject = useCallback((project: ProjectEntry) => {
    setFormWithHistory((prev) => ({
      ...prev,
      projects: [...prev.projects, project],
    }));
  }, [setFormWithHistory]);

  const removeProject = useCallback((id: string) => {
    setFormWithHistory((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  }, [setFormWithHistory]);

  // Autosave to localStorage
  useEffect(() => {
    if (!autosave || !storageKey) return;
    if (!hasLoadedSavedForm.current) return;
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }

    const timeout = setTimeout(() => saveForm(storageKey, form.state.values), 800);
    return () => clearTimeout(timeout);
  }, [autosave, storageKey, form.state.values]);

  return {
    form,
    activeSectionId,
    setActiveSectionId,
    updatePersonalInfo,
    updateEducation,
    addEducation,
    removeEducation,
    updateExperience,
    addExperience,
    removeExperience,
    addExperienceBullet,
    updateExperienceBullet,
    removeExperienceBullet,
    updateLeadership,
    addLeadership,
    removeLeadership,
    updateAwards,
    addAward,
    removeAward,
    addProject,
    removeProject,
    undo,
    redo,
    canUndo,
    canRedo,
    resetForm,
  };
}
