import type { AnalysisSuggestion } from "../types/analysis.js";

export interface ParseabilityAnalysisResult {
  suggestions: AnalysisSuggestion[];
  penalty: number;
  checks: {
    hasEmail: boolean;
    hasPhone: boolean;
    extractLooksThin: boolean;
    hasExcessiveNoise: boolean;
    looksVeryLong: boolean;
  };
}

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_PATTERN = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,4}\d{2,4}/;
const THIN_EXTRACT_CHARS = 400;
const VERY_LONG_CHARS = 9_000;
const NOISE_RATIO_THRESHOLD = 0.08;

function countLetters(text: string) {
  return (text.match(/[A-Za-z0-9]/g) ?? []).length;
}

function countNoiseChars(text: string) {
  // Ignore normal whitespace/punctuation; flag decorative symbols and control chars.
  return (text.match(/[^\w\s@.+#/,&()\-:;'"%]/g) ?? []).length;
}

/**
 * Seeker-facing scanner readiness: contact signals, extract health, and noise.
 * Uses plain-language copy — not employer ATS jargon.
 */
export function analyzeParseability(resumeText: string): ParseabilityAnalysisResult {
  const trimmed = resumeText.trim();
  const suggestions: AnalysisSuggestion[] = [];
  const hasEmail = EMAIL_PATTERN.test(trimmed);
  const hasPhone = PHONE_PATTERN.test(trimmed);
  const extractLooksThin = trimmed.length > 0 && trimmed.length < THIN_EXTRACT_CHARS;
  const looksVeryLong = trimmed.length >= VERY_LONG_CHARS;

  const letterCount = countLetters(trimmed);
  const noiseCount = countNoiseChars(trimmed);
  const noiseRatio = letterCount > 0 ? noiseCount / letterCount : 0;
  const hasExcessiveNoise = letterCount >= 120 && noiseRatio >= NOISE_RATIO_THRESHOLD;

  if (!hasEmail) {
    suggestions.push({
      id: "parse-missing-email",
      title: "Add a clear email near the top",
      detail:
        "Resume scanners look for a plain email address in the header. Put yours on its own line near your name so it is easy to find.",
      severity: "high",
      category: "writing",
    });
  }

  if (!hasPhone) {
    suggestions.push({
      id: "parse-missing-phone",
      title: "Add a phone number near the top",
      detail:
        "Include a phone number in a simple format near your contact details so recruiters and scanners can reach you.",
      severity: "medium",
      category: "writing",
    });
  }

  if (extractLooksThin) {
    suggestions.push({
      id: "parse-thin-extract",
      title: "This file looks hard to read as text",
      detail:
        "We only extracted a little text from your upload. Image-heavy or complex PDFs often fail scanner checks. Export a simpler PDF or DOCX with selectable text, then run the resume check again.",
      severity: "high",
      category: "writing",
    });
  }

  if (hasExcessiveNoise) {
    suggestions.push({
      id: "parse-special-char-noise",
      title: "Simplify unusual characters and layout",
      detail:
        "The extracted text has a lot of symbols or broken spacing. Prefer standard fonts, simple bullets, and fewer icons or decorative lines so scanners can read the words cleanly.",
      severity: "medium",
      category: "writing",
    });
  }

  if (looksVeryLong) {
    suggestions.push({
      id: "parse-resume-length",
      title: "Shorten the resume for a quicker scan",
      detail:
        "This resume is very long for most early-career roles. Aim for one or two focused pages so both scanners and recruiters see the strongest evidence first.",
      severity: "low",
      category: "writing",
    });
  }

  const penalty =
    (hasEmail ? 0 : 4) +
    (hasPhone ? 0 : 2) +
    (extractLooksThin ? 6 : 0) +
    (hasExcessiveNoise ? 3 : 0) +
    (looksVeryLong ? 1 : 0);

  return {
    suggestions,
    penalty,
    checks: {
      hasEmail,
      hasPhone,
      extractLooksThin,
      hasExcessiveNoise,
      looksVeryLong,
    },
  };
}
