import { generateObject } from "ai";
import { z } from "zod";

import { aiProvider } from "../lib/ai-provider.js";
import type { TailorResumeDraft, TailorResumeInput } from "../schemas/tailor-resume.schema.js";

const tailorOutputSchema = z.object({
  summary: z.string(),
  skills: z.string(),
  experience: z.array(
    z.object({
      id: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
});

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+.#]+/g, " ").replace(/\s+/g, " ").trim();
}

function dedupeKeywords(values: string[], limit = 8): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    const key = normalize(trimmed);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(trimmed);
    if (result.length >= limit) {
      break;
    }
  }

  return result;
}

function mergeCommaList(existing: string, additions: string[]): string {
  const seen = new Set<string>();
  const parts: string[] = [];

  for (const value of [...existing.split(","), ...additions]) {
    const trimmed = value.trim();
    const key = normalize(trimmed);
    if (!trimmed || seen.has(key)) {
      continue;
    }
    seen.add(key);
    parts.push(trimmed);
  }

  return parts.join(", ");
}

function buildFallbackSummary(input: TailorResumeInput): { before: string; after: string } {
  const before = input.form.personalInfo.summary.trim();
  const role = input.targetRole.trim();
  const keywords = dedupeKeywords(input.missingKeywords, 4);
  const keywordPhrase =
    keywords.length > 0 ? ` with experience related to ${keywords.join(", ")}` : "";

  if (!before) {
    return {
      before,
      after: `${role} candidate${keywordPhrase}. Add one real result here so recruiters can see your impact.`,
    };
  }

  const normalizedSummary = normalize(before);
  const normalizedRole = normalize(role);
  let after = before;

  if (normalizedRole && !normalizedSummary.includes(normalizedRole)) {
    after = `${role}. ${after}`;
  }

  if (keywords.length > 0) {
    const missingInSummary = keywords.filter(
      (keyword) => !normalizedSummary.includes(normalize(keyword)),
    );
    if (missingInSummary.length > 0) {
      after = `${after} Relevant strengths include ${missingInSummary.join(", ")}.`;
    }
  }

  return { before, after };
}

function buildFallbackSkills(input: TailorResumeInput): { before: string; after: string } {
  const before = input.form.personalInfo.skills.trim();
  const additions = dedupeKeywords([...input.missingKeywords, ...input.matchedKeywords], 8);
  const after = mergeCommaList(before, additions);

  return { before, after };
}

function weaveKeywordIntoBullet(bullet: string, keyword: string): string {
  const trimmedBullet = bullet.trim();
  const trimmedKeyword = keyword.trim();
  if (!trimmedBullet || !trimmedKeyword) {
    return trimmedBullet;
  }

  if (normalize(trimmedBullet).includes(normalize(trimmedKeyword))) {
    return trimmedBullet;
  }

  if (trimmedBullet.endsWith(".")) {
    return `${trimmedBullet.slice(0, -1)} using ${trimmedKeyword}.`;
  }

  return `${trimmedBullet} using ${trimmedKeyword}.`;
}

function buildFallbackExperience(input: TailorResumeInput): TailorResumeDraft["experience"] {
  const keywords = dedupeKeywords(input.missingKeywords, 6);

  return input.form.experience.map((entry) => {
    const before = [...entry.bullets];
    if (before.length === 0) {
      const role = entry.role.trim() || input.targetRole.trim();
      const keywordPhrase = keywords.length > 0 ? keywords.slice(0, 3).join(", ") : "relevant tools";
      return {
        id: entry.id,
        role: entry.role,
        bullets: {
          before,
          after: [
            `Used ${keywordPhrase} to improve [specific result] for [team/users] in a ${role} context. Replace brackets with a real outcome.`,
          ],
        },
      };
    }

    const after = before.map((bullet, index) => {
      const keyword = keywords[index % Math.max(keywords.length, 1)];
      return keyword ? weaveKeywordIntoBullet(bullet, keyword) : bullet;
    });

    return {
      id: entry.id,
      role: entry.role,
      bullets: { before, after },
    };
  });
}

function buildFallbackDraft(input: TailorResumeInput): TailorResumeDraft {
  return {
    summary: buildFallbackSummary(input),
    skills: buildFallbackSkills(input),
    experience: buildFallbackExperience(input),
  };
}

function hasChanges(draft: TailorResumeDraft): boolean {
  if (draft.summary.before !== draft.summary.after) {
    return true;
  }
  if (draft.skills.before !== draft.skills.after) {
    return true;
  }

  return draft.experience.some(
    (entry) => entry.bullets.before.join("\n") !== entry.bullets.after.join("\n"),
  );
}

export const resumeTailoringService = {
  isEnabled() {
    return aiProvider.isEnabled();
  },

  async tailorResume(input: TailorResumeInput): Promise<TailorResumeDraft> {
    const fallback = buildFallbackDraft(input);

    if (!this.isEnabled()) {
      return fallback;
    }

    try {
      const { object } = await generateObject({
        model: aiProvider.getModel(),
        schema: tailorOutputSchema,
        temperature: 0.3,
        system:
          "You are an expert resume editor. Lightly tailor resume content to a job description. Preserve employers, titles, dates, and factual claims. Do not invent metrics, companies, or tools the candidate did not plausibly use. Improve summary, skills, and bullet wording only.",
        prompt: `Target role: ${input.targetRole}

Job description:
${input.jobDescription}

Missing job keywords:
${input.missingKeywords.join(", ") || "None"}

Matched job keywords:
${input.matchedKeywords.join(", ") || "None"}

Current summary:
${input.form.personalInfo.summary || "(empty)"}

Current skills:
${input.form.personalInfo.skills || "(empty)"}

Current experience JSON:
${JSON.stringify(
  input.form.experience.map((entry) => ({
    id: entry.id,
    role: entry.role,
    bullets: entry.bullets,
  })),
  null,
  2,
)}

Return:
- summary: lightly tailored summary text
- skills: comma-separated skills list with missing job words added naturally
- experience: same ids, same number of bullets per role, lightly reworded bullets`,
      });

      const experience = input.form.experience.map((entry) => {
        const aiEntry = object.experience.find((candidate) => candidate.id === entry.id);
        const before = [...entry.bullets];
        const after =
          aiEntry && aiEntry.bullets.length === before.length
            ? aiEntry.bullets.map((bullet) => bullet.trim()).filter(Boolean)
            : fallback.experience.find((candidate) => candidate.id === entry.id)?.bullets.after ??
              before;

        return {
          id: entry.id,
          role: entry.role,
          bullets: {
            before,
            after: after.length > 0 ? after : before,
          },
        };
      });

      const draft: TailorResumeDraft = {
        summary: {
          before: fallback.summary.before,
          after: object.summary.trim() || fallback.summary.after,
        },
        skills: {
          before: fallback.skills.before,
          after: object.skills.trim() || fallback.skills.after,
        },
        experience,
      };

      return hasChanges(draft) ? draft : fallback;
    } catch {
      return fallback;
    }
  },
};
