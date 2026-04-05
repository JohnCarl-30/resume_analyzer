import { useState } from "react";
import { ResumeForm, defaultResumeForm } from "../model/resume-form";

export function useResumeEditor(initialForm: ResumeForm = defaultResumeForm) {
  const [form, setForm] = useState<ResumeForm>(initialForm);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const updatePersonalInfo = (data: Partial<ResumeForm["personalInfo"]>) => {
    setForm((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...data },
    }));
  };

  const updateEducation = (id: string, data: Partial<ResumeForm["education"][number]>) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.map((item) => (item.id === id ? { ...item, ...data } : item)),
    }));
  };

  const addEducation = () => {
    const newEntry = {
      id: `edu_${Date.now()}`,
      institution: "",
      degree: "",
      location: "",
      dateRange: "",
    };
    setForm((prev) => ({ ...prev, education: [...prev.education, newEntry] }));
  };

  const removeEducation = (id: string) => {
    setForm((prev) => ({ ...prev, education: prev.education.filter((item) => item.id !== id) }));
  };

  const updateExperience = (id: string, data: Partial<ResumeForm["experience"][number]>) => {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => (item.id === id ? { ...item, ...data } : item)),
    }));
  };

  const addExperience = () => {
    const newEntry = {
      id: `exp_${Date.now()}`,
      role: "",
      location: "",
      dateRange: "",
    };
    setForm((prev) => ({ ...prev, experience: [...prev.experience, newEntry] }));
  };

  const removeExperience = (id: string) => {
    setForm((prev) => ({ ...prev, experience: prev.experience.filter((item) => item.id !== id) }));
  };

  const updateLeadership = (id: string, data: Partial<ResumeForm["leadership"][number]>) => {
    setForm((prev) => ({
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
    setForm((prev) => ({ ...prev, leadership: [...prev.leadership, newEntry] }));
  };

  const removeLeadership = (id: string) => {
    setForm((prev) => ({ ...prev, leadership: prev.leadership.filter((item) => item.id !== id) }));
  };

  const updateAwards = (index: number, value: string) => {
    setForm((prev) => {
      const newAwards = [...prev.awards];
      newAwards[index] = value;
      return { ...prev, awards: newAwards };
    });
  };

  const addAward = () => {
    setForm((prev) => ({ ...prev, awards: [...prev.awards, ""] }));
  };

  const removeAward = (index: number) => {
    setForm((prev) => ({ ...prev, awards: prev.awards.filter((_, i) => i !== index) }));
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
    updateLeadership,
    addLeadership,
    removeLeadership,
    updateAwards,
    addAward,
    removeAward,
  };
}
