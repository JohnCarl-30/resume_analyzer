import type { AnalysisSuggestion } from "../types/analysis.js";

interface AtsSuggestionInput {
  resumeText: string;
  targetRole: string;
  jdKeywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  requiredSkills: string[];
}

const ROLE_STOP_WORDS = new Set([
  "and",
  "for",
  "the",
  "with",
  "role",
  "position",
  "senior",
  "junior",
  "lead",
  "staff",
  "principal",
  "engineer",
  "developer",
  "manager",
  "analyst",
  "specialist",
  "associate",
  "consultant",
]);

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function uniqueTerms(terms: string[]) {
  const seen = new Set<string>();
  return terms
    .map((term) => term.trim())
    .filter((term) => {
      const key = term.toLowerCase();
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function roleTokens(targetRole: string) {
  return normalize(targetRole)
    .replace(/[^a-z0-9+#./ -]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !ROLE_STOP_WORDS.has(token));
}

function hasStandardHeading(resumeText: string, heading: string) {
  const headingPattern = new RegExp(`(^|\\n)\\s*${heading}\\s*(:|\\n|$)`, "i");
  return headingPattern.test(resumeText);
}

export function analyzeAtsAlignment({
  resumeText,
  targetRole,
  jdKeywords,
  matchedKeywords,
  missingKeywords,
  requiredSkills,
}: AtsSuggestionInput): AnalysisSuggestion[] {
  const normalizedResume = normalize(resumeText);
  const normalizedTargetRole = normalize(targetRole);
  const suggestions: AnalysisSuggestion[] = [];
  const priorityTerms = uniqueTerms([
    ...requiredSkills,
    ...missingKeywords,
    ...jdKeywords,
    ...matchedKeywords,
  ]).slice(0, 6);

  const targetRoleAppears =
    normalizedTargetRole.length > 0 &&
    (normalizedResume.includes(normalizedTargetRole) ||
      roleTokens(targetRole).some((token) => normalizedResume.includes(token)));

  if (!targetRoleAppears) {
    suggestions.push({
      id: "ats-target-role-alignment",
      title: `Add ${targetRole} near the top`,
      detail:
        priorityTerms.length > 0
          ? `Company resume scanners compare your resume to the job title. Add "${targetRole}" or a close title near the top, then naturally include job post words such as ${priorityTerms.slice(0, 4).join(", ")}.`
          : `Company resume scanners compare your resume to the job title. Add "${targetRole}" or a close title near the top of the resume.`,
      severity: "medium",
      category: "keywords",
    });
  }

  if (missingKeywords.length > 0) {
    suggestions.push({
      id: "ats-keyword-placement",
      title: "Add missing job post words to real bullets",
      detail: `For ${targetRole}, company resume scanners look for job post words in context, not just in a keyword list. Add ${missingKeywords.slice(0, 5).join(", ")} to relevant experience, project, or skills bullets only where they are truthful.`,
      severity: requiredSkills.some((skill) =>
        missingKeywords.some((keyword) => keyword.toLowerCase() === skill.toLowerCase()),
      )
        ? "high"
        : "medium",
      category: "keywords",
    });
  }

  const missingHeadings = [
    { label: "Skills", heading: "skills" },
    { label: "Experience", heading: "experience" },
    { label: "Education", heading: "education" },
  ].filter(({ heading }) => !hasStandardHeading(resumeText, heading));

  if (missingHeadings.length > 0) {
    suggestions.push({
      id: "ats-standard-headings",
      title: "Use simple resume section headings",
      detail: `Add clear headings for ${missingHeadings.map((item) => item.label).join(", ")}. Company resume scanners understand standard labels more reliably than creative section names or visually implied sections.`,
      severity: missingHeadings.length >= 2 ? "high" : "medium",
      category: "writing",
    });
  }

  return suggestions;
}
