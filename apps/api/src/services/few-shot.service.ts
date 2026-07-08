import { env } from "../config/env.js";
import { db } from "../db/client.js";
import { inMemoryAnalysisRepository } from "../repositories/in-memory-analysis.repository.js";
import { postgresAnalysisRepository } from "../repositories/postgres-analysis.repository.js";
import type { ExtractedResumeProfile } from "../types/resume-extraction.js";

const analysisRepository = db.isConfigured ? postgresAnalysisRepository : inMemoryAnalysisRepository;

interface FewShotExample {
  id: string;
  resumeText: string;
  targetRole: string;
  extractedProfile: ExtractedResumeProfile;
  quality: number; // 0-100 score
  usageCount: number;
  createdAt: string;
}

/**
 * Few-Shot Prompting Service
 * Stores and retrieves high-quality extraction examples for LLM prompts
 */
export const fewShotService = {
  /**
   * Store a successful extraction as a few-shot example
   */
  async storeExample(params: {
    resumeText: string;
    targetRole: string;
    extractedProfile: ExtractedResumeProfile;
    quality?: number;
  }): Promise<FewShotExample> {
    const example: FewShotExample = {
      id: `example_${Date.now()}`,
      resumeText: params.resumeText.slice(0, 2000), // Truncate for storage
      targetRole: params.targetRole,
      extractedProfile: params.extractedProfile,
      quality: params.quality ?? 80,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Store in memory for now (could be extended to database)
    examples.push(example);

    return example;
  },

  /**
   * Find the best few-shot examples for a given resume and target role
   * Uses a combination of:
   * 1. Role similarity (same or similar job titles)
   * 2. Text similarity (overlapping keywords)
   * 3. Quality score (higher quality examples preferred)
   */
  async findRelevantExamples(
    resumeText: string,
    targetRole: string,
    count: number = 3,
  ): Promise<FewShotExample[]> {
    const normalizedRole = targetRole.toLowerCase();
    const resumeWords = new Set(resumeText.toLowerCase().split(/\s+/));

    const scored = examples.map((example) => {
      // Role similarity score (0-1)
      const exampleRoleWords = example.targetRole.toLowerCase().split(/\s+/);
      const roleOverlap = exampleRoleWords.filter((word) => normalizedRole.includes(word)).length;
      const roleScore = exampleRoleWords.length > 0 ? roleOverlap / exampleRoleWords.length : 0;

      // Text similarity score (0-1)
      const exampleWords = new Set(example.resumeText.toLowerCase().split(/\s+/));
      const overlap = [...resumeWords].filter((word) => exampleWords.has(word)).length;
      const textScore = resumeWords.size > 0 ? overlap / resumeWords.size : 0;

      // Quality score (0-1)
      const qualityScore = example.quality / 100;

      // Combined score: 40% role, 30% text, 30% quality
      const combinedScore = roleScore * 0.4 + textScore * 0.3 + qualityScore * 0.3;

      return { example, score: combinedScore };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map((s) => s.example);
  },

  /**
   * Format examples for inclusion in LLM prompts
   */
  formatExamplesForPrompt(examples: FewShotExample[]): string {
    if (examples.length === 0) return "";

    const formatted = examples.map((ex, index) => {
      return `Example ${index + 1}:
Target Role: ${ex.targetRole}
Resume Text:
${ex.resumeText.slice(0, 500)}

Extracted Profile:
${JSON.stringify(ex.extractedProfile, null, 2)}`;
    });

    return `Here are some examples of high-quality extractions:\n\n${formatted.join("\n\n---\n\n")}\n\nNow extract the profile for the following resume:`;
  },

  /**
   * Get all stored examples
   */
  getAllExamples(): FewShotExample[] {
    return [...examples];
  },

  /**
   * Seed with initial high-quality examples
   */
  async seedExamples(): Promise<void> {
    const seedData: Array<{
      resumeText: string;
      targetRole: string;
      extractedProfile: ExtractedResumeProfile;
      quality: number;
    }> = [
      {
        resumeText:
          "Software Engineer with 5 years of experience in full-stack development. Proficient in React, Node.js, and PostgreSQL. Led a team of 3 developers to build a real-time analytics dashboard processing 1M+ events daily.",
        targetRole: "Senior Full Stack Engineer",
        quality: 95,
        extractedProfile: {
          fullName: "Jane Smith",
          email: "jane.smith@email.com",
          phone: "+1-555-0123",
          summary:
            "Software Engineer with 5 years of full-stack experience, specializing in React, Node.js, and PostgreSQL. Led teams and built high-throughput analytics systems.",
          skills: ["React", "Node.js", "PostgreSQL", "Full-stack development", "Team leadership", "Real-time systems"],
          education: [
            {
              institution: "Stanford University",
              degree: "B.S. Computer Science",
              location: "Stanford, CA",
              dateRange: "2015 — 2019",
            },
          ],
          experience: [
            {
              role: "Software Engineer",
              location: "TechCorp, San Francisco, CA",
              dateRange: "2019 — Present",
              bullets: [
                "Led a team of 3 developers to build real-time analytics dashboard",
                "Processed 1M+ events daily with sub-second latency",
              ],
            },
          ],
          leadership: [
            {
              role: "Team Lead",
              organization: "Engineering Team",
              location: "TechCorp",
              dateRange: "2021 — Present",
              bullets: ["Led team of 3 developers"],
            },
          ],
          projects: [
            {
              name: "Real-time Analytics Dashboard",
              technologies: "React, Node.js, PostgreSQL, WebSocket",
              link: "",
              startDate: "2020",
              endDate: "2021",
              bullets: ["Processes 1M+ events daily"],
            },
          ],
          awards: ["Employee of the Year 2022"],
        },
      },
    ];

    for (const seed of seedData) {
      await this.storeExample(seed);
    }
  },
};

// In-memory storage for examples
const examples: FewShotExample[] = [];
