import type { ExtractedResumeProfile } from "./resume-extraction";

export interface PersonalInfo {
  fullName: string;
  phone: string;
  email: string;
  summary: string;
  skills: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  location: string;
  dateRange: string;
}

export interface ExperienceEntry {
  id: string;
  role: string;
  location: string;
  dateRange: string;
  bullets: string[];
}

export interface LeadershipEntry {
  id: string;
  role: string;
  organization: string;
  location: string;
  dateRange: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  technologies: string;
  link: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface ResumeForm {
  personalInfo: PersonalInfo;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  leadership: LeadershipEntry[];
  awards: string[];
  projects: ProjectEntry[];
}

export const emptyResumeForm: ResumeForm = {
  personalInfo: {
    fullName: "",
    phone: "",
    email: "",
    summary: "",
    skills: "",
  },
  education: [],
  experience: [],
  leadership: [],
  awards: [],
  projects: [],
};

export function resumeFormFromExtractedProfile(
  extractedProfile: ExtractedResumeProfile | null | undefined,
) {
  if (!extractedProfile) {
    return defaultResumeForm;
  }

    return {
    personalInfo: {
      fullName: extractedProfile.fullName,
      phone: extractedProfile.phone,
      email: extractedProfile.email,
      summary: "",
      skills: "",
    },
    education: extractedProfile.education.map((entry, index) => ({
      id: `edu_ai_${index + 1}`,
      institution: entry.institution,
      degree: entry.degree,
      location: entry.location,
      dateRange: entry.dateRange,
    })),
    experience: extractedProfile.experience.map((entry, index) => ({
      id: `exp_ai_${index + 1}`,
      role: entry.role,
      location: entry.location,
      dateRange: entry.dateRange,
      bullets: entry.bullets || [],
    })),
    leadership: extractedProfile.leadership.map((entry, index) => ({
      id: `lead_ai_${index + 1}`,
      role: entry.role,
      organization: entry.organization,
      location: entry.location,
      dateRange: entry.dateRange,
      bullets: entry.bullets || [],
    })),
    awards: extractedProfile.awards,
    projects: extractedProfile.projects.map((entry, index) => ({
      id: `proj_ai_${index + 1}`,
      name: entry.name,
      technologies: entry.technologies,
      link: entry.link,
      startDate: entry.startDate,
      endDate: entry.endDate,
      current: false,
      bullets: entry.bullets || [],
    })),
  };
}


export const defaultResumeForm: ResumeForm = {
  personalInfo: {
    fullName: "Your Full Name",
    phone: "+1 (555) 000-0000",
    email: "you@example.com",
    summary: "",
    skills: "",
  },
  education: [
    {
      id: "edu_1",
      institution: "University Name",
      degree: "Degree Title",
      location: "City, State",
      dateRange: "2020 — 2024",
    },
  ],
  experience: [
    {
      id: "exp_1",
      role: "Job Title",
      location: "Company Name, Location",
      dateRange: "Jan 2022 — Present",
      bullets: [],
    },
  ],
  leadership: [
    {
      id: "lead_1",
      role: "Role",
      organization: "Organization Name",
      location: "Location",
      dateRange: "2023 — Present",
    },
  ],
  awards: ["Academic Achievement Award"],
  projects: [],
};

export function resumeFormToText(form: ResumeForm): string {
  const parts: string[] = [];

  parts.push(form.personalInfo.fullName);
  parts.push(form.personalInfo.phone);
  parts.push(form.personalInfo.email);

  if (form.education.length > 0) {
    parts.push("\nEducation");
    for (const edu of form.education) {
      parts.push(`${edu.degree} at ${edu.institution}, ${edu.location}, ${edu.dateRange}`);
    }
  }

  if (form.experience.length > 0) {
    parts.push("\nExperience");
    for (const exp of form.experience) {
      parts.push(`${exp.role} at ${exp.location}, ${exp.dateRange}`);
    }
  }

  if (form.leadership.length > 0) {
    parts.push("\nLeadership");
    for (const lead of form.leadership) {
      parts.push(`${lead.role} at ${lead.organization}, ${lead.location}, ${lead.dateRange}`);
    }
  }

  if (form.awards.length > 0) {
    parts.push("\nAwards");
    for (const award of form.awards) {
      parts.push(award);
    }
  }

  if (form.projects.length > 0) {
    parts.push("\nProjects");
    for (const proj of form.projects) {
      parts.push(`${proj.name} - ${proj.technologies}`);
      for (const bullet of proj.bullets) {
        parts.push(`- ${bullet}`);
      }
    }
  }

  return parts.join("\n\n");
}
