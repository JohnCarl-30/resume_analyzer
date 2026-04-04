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
