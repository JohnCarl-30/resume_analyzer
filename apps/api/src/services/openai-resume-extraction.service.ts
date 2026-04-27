import { env } from "../config/env.js";
import { openAiClient } from "../lib/openai-client.js";
import type { ExtractedResumeProfile } from "../types/resume-extraction.js";
import { z } from "zod";

const extractionSchema = {
  name: "resume_profile_extraction",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      fullName: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      summary: { type: "string" },
      skills: {
        type: "array",
        items: { type: "string" },
      },
      education: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            institution: { type: "string" },
            degree: { type: "string" },
            location: { type: "string" },
            dateRange: { type: "string" },
          },
          required: ["institution", "degree", "location", "dateRange"],
        },
      },
      experience: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            role: { type: "string" },
            location: { type: "string" },
            dateRange: { type: "string" },
            bullets: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["role", "location", "dateRange", "bullets"],
        },
      },
      leadership: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            role: { type: "string" },
            organization: { type: "string" },
            location: { type: "string" },
            dateRange: { type: "string" },
            bullets: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["role", "organization", "location", "dateRange", "bullets"],
        },
      },
      projects: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            technologies: { type: "string" },
            link: { type: "string" },
            startDate: { type: "string" },
            endDate: { type: "string" },
            bullets: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: [
            "name",
            "technologies",
            "link",
            "startDate",
            "endDate",
            "bullets",
          ],
        },
      },
      awards: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: [
      "fullName",
      "email",
      "phone",
      "summary",
      "skills",
      "education",
      "experience",
      "leadership",
      "projects",
      "awards",
    ],
  },
} as const;

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

function parseExtractionPayload(content: string): Record<string, unknown> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown JSON parse error";
    throw new Error(`Invalid JSON payload from OpenAI (${message}).`);
  }

  const result = extractionPayloadSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error(`Schema validation failed: ${result.error.issues[0]?.message ?? "Unknown validation error"}`);
  }

  return result.data;
}

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

export const openAiResumeExtractionService = {
  isEnabled() {
    return openAiClient.isEnabled();
  },

  async extractProfile(input: { resumeText: string; targetRole: string }) {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const content = await openAiClient.createStructuredChatCompletion({
        model: env.OPENAI_EXTRACTION_MODEL,
        temperature: 0.1,
        response_format: {
          type: "json_schema",
          json_schema: extractionSchema,
        },
        messages: [
          {
            role: "system",
            content:
              "You extract resume information into a strict JSON schema. Use only information explicitly present in the resume text. Do not invent facts. If a field is unknown, return an empty string or empty array.",
          },
          {
            role: "user",
            content: [
              `Target role: ${input.targetRole}`,
              "Resume text:",
              input.resumeText,
            ].join("\n\n"),
          },
        ],
      });

      return sanitizeProfile(parseExtractionPayload(content));
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      console.warn(
        `[resume-extraction] OpenAI enrichment skipped for model "${env.OPENAI_EXTRACTION_MODEL}". Falling back to parser-only mode. Reason: ${reason}`,
      );

      return null;
    }
  },
};
