export interface TailorFieldChange {
  before: string;
  after: string;
}

export interface TailorExperienceChange {
  id: string;
  role: string;
  bullets: {
    before: string[];
    after: string[];
  };
}

export interface ResumeTailorDraft {
  summary: TailorFieldChange;
  skills: TailorFieldChange;
  experience: TailorExperienceChange[];
}

export type TailorProposalType = "summary" | "skills" | "experience";

export interface TailorProposal {
  id: string;
  type: TailorProposalType;
  title: string;
  description: string;
  before: string;
  after: string;
  experienceId?: string;
}

export function buildTailorProposals(draft: ResumeTailorDraft): TailorProposal[] {
  const proposals: TailorProposal[] = [];

  if (draft.summary.before !== draft.summary.after) {
    proposals.push({
      id: "tailor-summary",
      type: "summary",
      title: "Summary",
      description: "Add job-relevant language to your summary while keeping your facts.",
      before: draft.summary.before || "(empty)",
      after: draft.summary.after,
    });
  }

  if (draft.skills.before !== draft.skills.after) {
    proposals.push({
      id: "tailor-skills",
      type: "skills",
      title: "Skills",
      description: "Add missing job words to your skills list.",
      before: draft.skills.before || "(empty)",
      after: draft.skills.after,
    });
  }

  for (const entry of draft.experience) {
    const beforeText = entry.bullets.before.join("\n") || "(empty)";
    const afterText = entry.bullets.after.join("\n") || beforeText;
    if (beforeText === afterText) {
      continue;
    }

    proposals.push({
      id: `tailor-exp-${entry.id}`,
      type: "experience",
      title: entry.role.trim() || "Experience bullets",
      description: "Improve bullet wording for this role without changing the facts.",
      before: beforeText,
      after: afterText,
      experienceId: entry.id,
    });
  }

  return proposals;
}
