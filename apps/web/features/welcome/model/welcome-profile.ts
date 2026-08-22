export const TARGET_FIELDS = [
  "Engineering",
  "Data & analytics",
  "Design",
  "Product",
  "Marketing",
  "Operations",
  "Something else",
] as const;

export const EXPERIENCE_LEVELS = [
  "Student or intern",
  "0–2 years",
  "3–5 years",
  "6–10 years",
  "10+ years",
] as const;

export const INTENTS = [
  { value: "check", label: "Check a resume I already have" },
  { value: "build", label: "Build one from scratch" },
] as const;

export type TargetField = (typeof TARGET_FIELDS)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type WelcomeIntent = (typeof INTENTS)[number]["value"];

/** Stored on the Clerk user under unsafeMetadata.welcome. */
export interface WelcomeProfile {
  targetField: TargetField;
  experienceLevel: ExperienceLevel;
  intent: WelcomeIntent;
  completedAt: string;
}

/** Where someone lands once the questions are answered. */
export function destinationForIntent(intent: WelcomeIntent): string {
  return intent === "build" ? "/create-resume" : "/analysis/new";
}

export function isWelcomeComplete(metadata: unknown): boolean {
  if (typeof metadata !== "object" || metadata === null) {
    return false;
  }

  const welcome = (metadata as { welcome?: { completedAt?: unknown } }).welcome;
  return typeof welcome?.completedAt === "string" && welcome.completedAt.length > 0;
}
