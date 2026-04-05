export interface ExtractedEducationEntry {
  institution: string;
  degree: string;
  location: string;
  dateRange: string;
}

export interface ExtractedExperienceEntry {
  role: string;
  location: string;
  dateRange: string;
}

export interface ExtractedLeadershipEntry {
  role: string;
  organization: string;
  location: string;
  dateRange: string;
}

export interface ExtractedResumeProfile {
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  education: ExtractedEducationEntry[];
  experience: ExtractedExperienceEntry[];
  leadership: ExtractedLeadershipEntry[];
  awards: string[];
}
