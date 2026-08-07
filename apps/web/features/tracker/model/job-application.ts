export const JOB_APPLICATION_STATUSES = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
] as const;

export type JobApplicationStatus = (typeof JOB_APPLICATION_STATUSES)[number];

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  role: string;
  status: JobApplicationStatus;
  location?: string;
  jobUrl?: string;
  notes?: string;
  appliedAt?: string;
  analysisId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationFormValues {
  company: string;
  role: string;
  status: JobApplicationStatus;
  location: string;
  jobUrl: string;
  notes: string;
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface StatusMeta {
  value: JobApplicationStatus;
  label: string;
  badgeVariant: BadgeVariant;
}

export const STATUS_META: Record<JobApplicationStatus, StatusMeta> = {
  saved: { value: "saved", label: "Saved", badgeVariant: "outline" },
  applied: { value: "applied", label: "Applied", badgeVariant: "secondary" },
  interviewing: {
    value: "interviewing",
    label: "Interviewing",
    badgeVariant: "default",
  },
  offer: { value: "offer", label: "Offer", badgeVariant: "default" },
  rejected: { value: "rejected", label: "Rejected", badgeVariant: "destructive" },
};

export const STATUS_OPTIONS: StatusMeta[] = JOB_APPLICATION_STATUSES.map(
  (status) => STATUS_META[status],
);

export const emptyFormValues: JobApplicationFormValues = {
  company: "",
  role: "",
  status: "saved",
  location: "",
  jobUrl: "",
  notes: "",
};

export function toFormValues(
  application: JobApplication,
): JobApplicationFormValues {
  return {
    company: application.company,
    role: application.role,
    status: application.status,
    location: application.location ?? "",
    jobUrl: application.jobUrl ?? "",
    notes: application.notes ?? "",
  };
}
