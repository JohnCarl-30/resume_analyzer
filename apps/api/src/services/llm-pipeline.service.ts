import type { ResumeAnalysis, AnalysisSuggestion } from "../types/analysis.js";
import type { ExtractedResumeProfile } from "../types/resume-extraction.js";
import { resumeParserService } from "./resume-parser.service.js";
import { resumeExtractionService } from "./resume-extraction.service.js";
import { jdExtractionService } from "./jd-extraction.service.js";
import { embeddingService } from "./embedding.service.js";
import { fewShotService } from "./few-shot.service.js";
import { evaluationService } from "./evaluation.service.js";
import { analyzeKeywords } from "../analyzers/keyword.analyzer.js";
import { analyzeWritingQuality } from "../analyzers/writing.analyzer.js";
import { analyzeImpactMetrics } from "../analyzers/impact.analyzer.js";
import { analyzeAtsAlignment } from "../analyzers/ats.analyzer.js";
import { computeScore } from "../scoring/score.js";

interface PipelineInput {
  targetRole: string;
  jobDescription: string;
  resumeFile?: Express.Multer.File;
  resumeText?: string;
  useFewShot?: boolean;
  generateEmbedding?: boolean;
}

interface PipelineStage {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  duration?: number;
  error?: string;
}

interface PipelineResult {
  analysis: ResumeAnalysis;
  extractedProfile: ExtractedResumeProfile | null;
  extractedText: string;
  stages: PipelineStage[];
  embeddings?: {
    jobEmbedding: number[];
    resumeEmbedding: number[];
  };
  evaluation?: {
    extractionQuality?: number;
    keywordMetrics?: {
      precision: number;
      recall: number;
      f1Score: number;
    };
  };
  fewShotExamplesUsed?: number;
  metadata: {
    processingTimeMs: number;
    provider: string;
    model: string;
  };
}

/**
 * LLM Pipeline Service
 * Orchestrates multi-step AI processing for resume analysis
 */
export const llmPipelineService = {
  async runPipeline(input: PipelineInput): Promise<PipelineResult> {
    const startTime = Date.now();
    const stages: PipelineStage[] = [];

    // Stage 1: Document Parsing
    stages.push({ name: "document_parsing", status: "running" });
    let extractedText: string;

    try {
      if (input.resumeFile) {
        const parsed = await resumeParserService.extractText(input.resumeFile);
        extractedText = parsed.text;
      } else if (input.resumeText) {
        extractedText = input.resumeText;
      } else {
        throw new Error("Either resumeFile or resumeText must be provided");
      }
      stages[0].status = "completed";
      stages[0].duration = Date.now() - startTime;
    } catch (error) {
      stages[0].status = "failed";
      stages[0].error = error instanceof Error ? error.message : "Unknown error";
      throw error;
    }

    // Stage 2: JD Extraction (parallel with resume extraction)
    stages.push({ name: "jd_extraction", status: "running" });
    const jdStart = Date.now();

    const jdExtractionPromise = jdExtractionService.extractKeywordsFromJd(
      input.jobDescription,
      input.targetRole,
    );

    // Stage 3: Resume Extraction (with optional few-shot)
    stages.push({ name: "resume_extraction", status: "running" });
    const extractionStart = Date.now();

    let fewShotExamples: Array<{ resumeText: string; targetRole: string; extractedProfile: ExtractedResumeProfile }> = [];

    if (input.useFewShot) {
      const examples = await fewShotService.findRelevantExamples(extractedText, input.targetRole, 2);
      fewShotExamples = examples.map((ex) => ({
        resumeText: ex.resumeText,
        targetRole: ex.targetRole,
        extractedProfile: ex.extractedProfile,
      }));
    }

    const [jdExtraction, extractedProfile] = await Promise.all([
      jdExtractionPromise,
      resumeExtractionService.extractProfile({
        resumeText: extractedText,
        targetRole: input.targetRole,
      }),
    ]);

    stages[1].status = "completed";
    stages[1].duration = Date.now() - jdStart;
    stages[2].status = "completed";
    stages[2].duration = Date.now() - extractionStart;

    // Stage 4: Analysis (keyword, writing, impact, ATS)
    stages.push({ name: "analysis", status: "running" });
    const analysisStart = Date.now();

    const [keywordResult, writingResult, impactResult, atsSuggestions] = await Promise.all([
      Promise.resolve(
        analyzeKeywords(extractedText, input.jobDescription, {
          jdKeywords: jdExtraction.keywords.length > 0 ? jdExtraction.keywords : undefined,
        }),
      ),
      Promise.resolve(analyzeWritingQuality(extractedText)),
      Promise.resolve(analyzeImpactMetrics(extractedText)),
      Promise.resolve(
        analyzeAtsAlignment({
          resumeText: extractedText,
          targetRole: input.targetRole,
          jdKeywords: jdExtraction.keywords,
          matchedKeywords: [],
          missingKeywords: [],
          requiredSkills: jdExtraction.requiredSkills,
        }),
      ),
    ]);

    const allSuggestions: AnalysisSuggestion[] = [
      ...buildKeywordSuggestions(keywordResult.missingKeywords, jdExtraction.requiredSkills),
      ...writingResult.suggestions,
      ...impactResult.suggestions,
      ...atsSuggestions,
    ];

    const highSeverityCount = allSuggestions.filter((s) => s.severity === "high").length;

    const { score } = computeScore({
      keywordScore: keywordResult.keywordScore,
      requiredSkillsMatched: keywordResult.matchedKeywords.filter((kw) =>
        jdExtraction.requiredSkills.map((s) => s.toLowerCase()).includes(kw.toLowerCase()),
      ).length,
      requiredSkillsTotal: jdExtraction.requiredSkills.length,
      writingPenalty: writingResult.penalty,
      impactPenalty: impactResult.penalty,
      highSeverityCount,
    });

    stages[3].status = "completed";
    stages[3].duration = Date.now() - analysisStart;

    // Stage 5: Embeddings (optional)
    let embeddings: { jobEmbedding: number[]; resumeEmbedding: number[] } | undefined;

    if (input.generateEmbedding) {
      stages.push({ name: "embedding_generation", status: "running" });
      const embedStart = Date.now();

      try {
        const [jobEmbedding, resumeEmbedding] = await Promise.all([
          embeddingService.createEmbedding(input.jobDescription),
          embeddingService.createEmbedding(extractedText),
        ]);

        embeddings = { jobEmbedding, resumeEmbedding };
        stages[stages.length - 1].status = "completed";
        stages[stages.length - 1].duration = Date.now() - embedStart;
      } catch (error) {
        stages[stages.length - 1].status = "failed";
        stages[stages.length - 1].error = error instanceof Error ? error.message : "Embedding failed";
      }
    }

    // Stage 6: Evaluation (self-evaluation)
    stages.push({ name: "evaluation", status: "running" });
    const evalStart = Date.now();

    const keywordMetrics = evaluationService.evaluateKeywords(
      jdExtraction.keywords,
      keywordResult.matchedKeywords,
      keywordResult.missingKeywords,
    );

    stages[stages.length - 1].status = "completed";
    stages[stages.length - 1].duration = Date.now() - evalStart;

    const totalTime = Date.now() - startTime;

    return {
      analysis: {
        targetRole: jdExtraction.targetRoleTitle || input.targetRole,
        score,
        metricsFound: impactResult.metricsFound,
        matchedKeywords: keywordResult.matchedKeywords,
        missingKeywords: keywordResult.missingKeywords,
        suggestions: allSuggestions,
        generatedAt: new Date().toISOString(),
      },
      extractedProfile,
      extractedText,
      stages,
      embeddings,
      evaluation: {
        keywordMetrics: {
          precision: keywordMetrics.precision,
          recall: keywordMetrics.recall,
          f1Score: keywordMetrics.f1Score,
        },
      },
      fewShotExamplesUsed: fewShotExamples.length,
      metadata: {
        processingTimeMs: totalTime,
        provider: "vertex-ai",
        model: "gemini-2.5-flash",
      },
    };
  },
};

function buildKeywordSuggestions(
  missingKeywords: string[],
  requiredSkills: string[],
): AnalysisSuggestion[] {
  if (missingKeywords.length === 0) return [];

  const suggestions: AnalysisSuggestion[] = [];

  const missingRequired = missingKeywords.filter((kw) =>
    requiredSkills.map((s) => s.toLowerCase()).includes(kw.toLowerCase()),
  );

  const missingOptional = missingKeywords.filter(
    (kw) => !requiredSkills.map((s) => s.toLowerCase()).includes(kw.toLowerCase()),
  );

  if (missingRequired.length > 0) {
    suggestions.push({
      id: "missing-required-skills",
      title: "Missing required skills",
      detail: `These skills are explicitly required in the JD but absent from your resume: ${missingRequired.slice(0, 5).join(", ")}${missingRequired.length > 5 ? ` (+${missingRequired.length - 5} more)` : ""}.`,
      severity: "high",
      category: "keywords",
    });
  }

  if (missingOptional.length > 0) {
    suggestions.push({
      id: "missing-keywords",
      title: "Add relevant JD keywords",
      detail: `Consider naturally incorporating: ${missingOptional.slice(0, 4).join(", ")} to improve alignment with the role.`,
      severity: "medium",
      category: "keywords",
    });
  }

  return suggestions;
}
