export interface JobMatchSnapshot {
  role: string;
  fitScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export const sampleJobMatch: JobMatchSnapshot = {
  role: "AI Software Engineer",
  fitScore: 82,
  matchedSkills: ["TypeScript", "Express", "OpenAI", "Vector Search"],
  missingSkills: ["Evals", "Workers", "Observability"],
};
