import { generateObject } from "ai";
import { z } from "zod";
import { env } from "../config/env.js";
import { aiProvider } from "../lib/ai-provider.js";
import type { ExtractedResumeProfile } from "../types/resume-extraction.js";

const extractionPayloadSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  summary: z.string(),
  skills: z.array(z.string()),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    location: z.string(),
    dateRange: z.string(),
  })),
  experience: z.array(z.object({
    role: z.string(),
    location: z.string(),
    dateRange: z.string(),
    bullets: z.array(z.string()),
  })),
  leadership: z.array(z.object({
    role: z.string(),
    organization: z.string(),
    location: z.string(),
    dateRange: z.string(),
    bullets: z.array(z.string()),
  })),
  projects: z.array(z.object({
    name: z.string(),
    technologies: z.string(),
    link: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    bullets: z.array(z.string()),
  })),
  awards: z.array(z.string()),
});

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeString(item))
    .filter(Boolean);
}

function normalizeObjectArray<T>(
  value: unknown,
  mapper: (item: Record<string, unknown>) => T,
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map(mapper);
}

function sanitizeProfile(value: unknown): ExtractedResumeProfile {
  const candidate =
    typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

  return {
    fullName: normalizeString(candidate.fullName),
    email: normalizeString(candidate.email),
    phone: normalizeString(candidate.phone),
    summary: normalizeString(candidate.summary),
    skills: normalizeStringArray(candidate.skills),
    education: normalizeObjectArray(candidate.education, (item) => ({
      institution: normalizeString(item.institution),
      degree: normalizeString(item.degree),
      location: normalizeString(item.location),
      dateRange: normalizeString(item.dateRange),
    })),
    experience: normalizeObjectArray(candidate.experience, (item) => ({
      role: normalizeString(item.role),
      location: normalizeString(item.location),
      dateRange: normalizeString(item.dateRange),
      bullets: normalizeStringArray(item.bullets),
    })),
    leadership: normalizeObjectArray(candidate.leadership, (item) => ({
      role: normalizeString(item.role),
      organization: normalizeString(item.organization),
      location: normalizeString(item.location),
      dateRange: normalizeString(item.dateRange),
      bullets: normalizeStringArray(item.bullets),
    })),
    projects: normalizeObjectArray(candidate.projects, (item) => ({
      name: normalizeString(item.name),
      technologies: normalizeString(item.technologies),
      link: normalizeString(item.link),
      startDate: normalizeString(item.startDate),
      endDate: normalizeString(item.endDate),
      bullets: normalizeStringArray(item.bullets),
    })),
    awards: normalizeStringArray(candidate.awards),
  };
}

export const resumeExtractionService = {
  isEnabled() {
    return aiProvider.isEnabled();
  },

  async extractProfile(input: { resumeText: string; targetRole: string }) {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const { object } = await generateObject({
        model: aiProvider.getModel(),
        schema: extractionPayloadSchema,
        temperature: 0.1,
        system:
          "You extract resume information into a strict JSON schema. Use only information explicitly present in the resume text. Do not invent facts. If a field is unknown, return an empty string or empty array.",
        prompt: [
          `Target role: ${input.targetRole}`,
          "Resume text:",
          input.resumeText,
        ].join("\n\n"),
      });

      return sanitizeProfile(object);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      console.warn(
        `[resume-extraction] Vertex AI enrichment skipped for model "${env.AI_EXTRACTION_MODEL}". Falling back to parser-only mode. Reason: ${reason}`,
      );

      return null;
    }
  },
};
