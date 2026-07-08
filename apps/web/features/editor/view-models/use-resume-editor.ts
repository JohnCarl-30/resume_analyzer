import { useState, useEffect, useCallback, useRef } from "react";
import { ResumeForm, defaultResumeForm } from "../model/resume-form";

interface ResumeEditorOptions {
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
    if (raw) return JSON.parse(raw) as ResumeForm;
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

export function useResumeEditor(
  initialForm: ResumeForm = defaultResumeForm,
  options: ResumeEditorOptions = {},
) {
  const storageKey = options.storageKey ?? null;
  const autosave = options.autosave ?? storageKey !== null;
  const [form, setForm] = useState<ResumeForm>(initialForm);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryState>({ past: [], future: [] });
  const isUndoRedo = useRef(false);
  const skipNextAutosave = useRef(false);
  const hasLoadedSavedForm = useRef(storageKey === null);

  useEffect(() => {
    if (!storageKey) {
      hasLoadedSavedForm.current = true;
      return;
    }

    hasLoadedSavedForm.current = false;
    const savedForm = loadSavedForm(storageKey);
    hasLoadedSavedForm.current = true;
    if (savedForm) {
      setForm(savedForm);
    }
  }, [storageKey]);

  // Auto-save to localStorage
  useEffect(() => {
    if (!autosave || !storageKey) return;
    if (!hasLoadedSavedForm.current) return;
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }

    const timeout = setTimeout(() => saveForm(storageKey, form), 800);
    return () => clearTimeout(timeout);
  }, [autosave, form, storageKey]);

  const pushHistory = useCallback((prevForm: ResumeForm) => {
    setHistory((h) => ({
      past: [...h.past.slice(-HISTORY_LIMIT), prevForm],
      future: [],
    }));
  }, []);

  const setFormWithHistory = useCallback(
    (updater: React.SetStateAction<ResumeForm>) => {
      if (isUndoRedo.current) {
        setForm(updater);
        return;
      }
      setForm((prev) => {
        const next = typeof updater === "function" ? (updater as (prev: ResumeForm) => ResumeForm)(prev) : updater;
        if (next !== prev) {
          pushHistory(prev);
        }
        return next;
      });
    },
    [pushHistory],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      isUndoRedo.current = true;
      setForm(previous);
      requestAnimationFrame(() => {
        isUndoRedo.current = false;
      });
      return {
        past: h.past.slice(0, -1),
        future: [form, ...h.future],
      };
    });
  }, [form]);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      isUndoRedo.current = true;
      setForm(next);
      requestAnimationFrame(() => {
        isUndoRedo.current = false;
      });
      return {
        past: [...h.past, form],
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
      setForm(nextForm);
      setActiveSectionId(null);
      setHistory({ past: [], future: [] });
    },
    [initialForm, storageKey],
  );

  const updatePersonalInfo = (data: Partial<ResumeForm["personalInfo"]>) => {
    setFormWithHistory((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...data },
    }));
  };

  const updateEducation = (id: string, data: Partial<ResumeForm["education"][number]>) => {
    setFormWithHistory((prev) => ({
      ...prev,
      education: prev.education.map((item) => (item.id === id ? { ...item, ...data } : item)),
    }));
  };

  const addEducation = (draft: Partial<ResumeForm["education"][number]> = {}) => {
    const newEntry = {
      id: `edu_${Date.now()}`,
      institution: "",
      degree: "",
      location: "",
      dateRange: "",
      ...draft,
    };
    setFormWithHistory((prev) => ({ ...prev, education: [...prev.education, newEntry] }));
    return newEntry.id;
  };

  const removeEducation = (id: string) => {
    setFormWithHistory((prev) => ({ ...prev, education: prev.education.filter((item) => item.id !== id) }));
  };

  const updateExperience = (id: string, data: Partial<ResumeForm["experience"][number]>) => {
    setFormWithHistory((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => (item.id === id ? { ...item, ...data } : item)),
    }));
  };

  const addExperience = (draft: Partial<ResumeForm["experience"][number]> = {}) => {
    const newEntry = {
      id: `exp_${Date.now()}`,
      role: "",
      location: "",
      dateRange: "",
      bullets: [] as string[],
      ...draft,
    };
    setFormWithHistory((prev) => ({ ...prev, experience: [...prev.experience, newEntry] }));
    return newEntry.id;
  };

  const addExperienceBullet = (id: string, bullet: string) => {
    setFormWithHistory((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, bullets: [...item.bullets, bullet] } : item,
      ),
    }));
  };

  const updateExperienceBullet = (id: string, index: number, bullet: string) => {
    setFormWithHistory((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id
          ? { ...item, bullets: item.bullets.map((b, i) => (i === index ? bullet : b)) }
          : item,
      ),
    }));
  };

  const removeExperienceBullet = (id: string, index: number) => {
    setFormWithHistory((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, bullets: item.bullets.filter((_, i) => i !== index) } : item,
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setFormWithHistory((prev) => ({ ...prev, experience: prev.experience.filter((item) => item.id !== id) }));
  };

  const updateLeadership = (id: string, data: Partial<ResumeForm["leadership"][number]>) => {
    setFormWithHistory((prev) => ({
      ...prev,
      leadership: prev.leadership.map((item) => (item.id === id ? { ...item, ...data } : item)),
    }));
  };

  const addLeadership = () => {
    const newEntry = {
      id: `lead_${Date.now()}`,
      role: "",
      organization: "",
      location: "",
      dateRange: "",
    };
    setFormWithHistory((prev) => ({ ...prev, leadership: [...prev.leadership, newEntry] }));
  };

  const removeLeadership = (id: string) => {
    setFormWithHistory((prev) => ({ ...prev, leadership: prev.leadership.filter((item) => item.id !== id) }));
  };

  const updateAwards = (index: number, value: string) => {
    setFormWithHistory((prev) => {
      const newAwards = [...prev.awards];
      newAwards[index] = value;
      return { ...prev, awards: newAwards };
    });
  };

  const addAward = () => {
    setFormWithHistory((prev) => ({ ...prev, awards: [...prev.awards, ""] }));
  };

  const removeAward = (index: number) => {
    setFormWithHistory((prev) => ({ ...prev, awards: prev.awards.filter((_, i) => i !== index) }));
  };

  const addProject = (project: ResumeForm["projects"][number]) => {
    setFormWithHistory((prev) => ({
      ...prev,
      projects: [...prev.projects, project],
    }));
  };

  const removeProject = (id: string) => {
    setFormWithHistory((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  };

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
