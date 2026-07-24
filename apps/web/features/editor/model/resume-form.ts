import type { ExtractedResumeProfile } from "./resume-extraction";

export interface PersonalInfo {
  fullName: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
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
    linkedin: "",
    github: "",
    summary: "",
    skills: "",
  },
  education: [],
  experience: [],
  leadership: [],
  awards: [],
  projects: [],
};

export function normalizeResumeForm(form: ResumeForm): ResumeForm {
  return {
    ...form,
    personalInfo: {
      ...emptyResumeForm.personalInfo,
      ...form.personalInfo,
    },
  };
}

export function resumeFormFromExtractedProfile(
  extractedProfile: ExtractedResumeProfile | null | undefined,
): ResumeForm {
  if (!extractedProfile) {
    return defaultResumeForm;
  }

  return {
    personalInfo: {
      fullName: extractedProfile.fullName,
      phone: extractedProfile.phone,
      email: extractedProfile.email,
      linkedin: "",
      github: "",
      summary: extractedProfile.summary ?? "",
      skills: extractedProfile.skills?.join(", ") ?? "",
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
    fullName: "Alex Chen",
    phone: "+1 (415) 555-0192",
    email: "alex.chen@email.com",
    linkedin: "linkedin.com/in/alexchen",
    github: "github.com/alexchen",
    summary:
      "Software engineer with 3+ years building scalable web applications. Experienced in React, Node.js, and cloud infrastructure. Passionate about clean code, system design, and mentoring junior developers.",
    skills:
      "JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, MongoDB, AWS, Docker, Kubernetes, GraphQL, REST APIs, Git, CI/CD, Jest, Cypress",
  },
  education: [
    {
      id: "edu_1",
      institution: "University of California, Berkeley",
      degree: "B.S. Computer Science",
      location: "Berkeley, CA",
      dateRange: "2018 — 2022",
    },
  ],
  experience: [
    {
      id: "exp_1",
      role: "Software Engineer",
      location: "Stripe, San Francisco, CA",
      dateRange: "Jun 2022 — Present",
      bullets: [
        "Built payment processing APIs handling $2M+ daily transactions using Node.js and PostgreSQL",
        "Reduced API latency by 40% through query optimization and Redis caching layer",
        "Led migration from monolith to microservices, improving deployment frequency by 3x",
        "Mentored 2 junior engineers through code reviews and pair programming sessions",
      ],
    },
    {
      id: "exp_2",
      role: "Software Engineering Intern",
      location: "Airbnb, San Francisco, CA",
      dateRange: "May 2021 — Aug 2021",
      bullets: [
        "Developed React components for the booking flow, increasing conversion by 12%",
        "Implemented A/B testing framework for frontend experiments",
      ],
    },
  ],
  leadership: [
    {
      id: "lead_1",
      role: "Tech Lead",
      organization: "Engineering Mentorship Program",
      location: "Stripe",
      dateRange: "2023 — Present",
    },
  ],
  awards: ["Employee of the Quarter — Q2 2023", "Hackathon Winner — Best Developer Tool"],
  projects: [
    {
      id: "proj_1",
      name: "Open Source CLI Tool",
      technologies: "Rust, CLI, GitHub Actions",
      link: "github.com/alexchen/devtool",
      startDate: "Jan 2023",
      endDate: "Present",
      current: true,
      bullets: [
        "Built a developer productivity CLI tool with 500+ GitHub stars",
        "Automated code review checks, saving 10+ hours per week across the team",
      ],
    },
  ],
};

export function resumeFormToText(form: ResumeForm): string {
  const parts: string[] = [];

  parts.push(form.personalInfo.fullName);
  parts.push(form.personalInfo.phone);
  parts.push(form.personalInfo.email);
  if (form.personalInfo.linkedin) {
    parts.push(form.personalInfo.linkedin);
  }
  if (form.personalInfo.github) {
    parts.push(form.personalInfo.github);
  }

  if (form.personalInfo.summary) {
    parts.push(`\nSummary\n${form.personalInfo.summary}`);
  }

  if (form.personalInfo.skills) {
    parts.push(`\nSkills\n${form.personalInfo.skills}`);
  }

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
      for (const bullet of exp.bullets) {
        parts.push(`- ${bullet}`);
      }
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
