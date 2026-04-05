import type { ExtractedResumeProfile } from "./resume-extraction";

export interface PersonalInfo {
  fullName: string;
  phone: string;
  email: string;
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
}

export interface LeadershipEntry {
  id: string;
  role: string;
  organization: string;
  location: string;
  dateRange: string;
}

export interface ResumeForm {
  personalInfo: PersonalInfo;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  leadership: LeadershipEntry[];
  awards: string[];
}

export const emptyResumeForm: ResumeForm = {
  personalInfo: {
    fullName: "",
    phone: "",
    email: "",
  },
  education: [],
  experience: [],
  leadership: [],
  awards: [],
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
    })),
    leadership: extractedProfile.leadership.map((entry, index) => ({
      id: `lead_ai_${index + 1}`,
      role: entry.role,
      organization: entry.organization,
      location: entry.location,
      dateRange: entry.dateRange,
    })),
    awards: extractedProfile.awards,
  };
}

export const defaultResumeForm: ResumeForm = {
  personalInfo: {
    fullName: "BEA ANGELI C. VICENTE",
    phone: "+639260295375",
    email: "beavicente1113@gmail.com",
  },
  education: [
    {
      id: "edu_1",
      institution: "Bulacan State University",
      degree: "Bachelor of Library and Information Science",
      location: "Guinhawa, Malolos, Bulacan",
      dateRange: "Jan 2023 — Present",
    },
    {
      id: "edu_2",
      institution: "Marcelo H. Del Pilar National High School",
      degree: "Science, Technology, Engineering, and Mathematics",
      location: "Bagong Bayan, Malolos, Bulacan",
      dateRange: "Jan 2021 — Jan 2023",
    },
  ],
  experience: [
    {
      id: "exp_1",
      role: "Business Entrepreneur",
      location: "Bagong Bayan, City of Malolos, Bulacan",
      dateRange: "Jan 2022 — Jan 2023",
    },
  ],
  leadership: [
    {
      id: "lead_1",
      role: "Member",
      organization: "Brigade of Library Information Science Students Organization",
      location: "Bulacan State University",
      dateRange: "Jan 2023 — Present",
    },
  ],
  awards: ["Dean's Lister - First Semester 2023"],
};
