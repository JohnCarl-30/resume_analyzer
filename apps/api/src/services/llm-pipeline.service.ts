import type { ResumeAnalysis } from "../types/analysis.js";
import type { ExtractedResumeProfile } from "../types/resume-extraction.js";
import { env } from "../config/env.js";
import { aiProvider } from "../lib/ai-provider.js";
import { resumeParserService } from "./resume-parser.service.js";
import { resumeExtractionService } from "./resume-extraction.service.js";
import { jdExtractionService } from "./jd-extraction.service.js";
import { resumeAnalysisService } from "./resume-analysis.service.js";
import { embeddingService } from "./embedding.service.js";
import { fewShotService } from "./few-shot.service.js";
import { evaluationService } from "./evaluation.service.js";

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

    const analysisResult = await resumeAnalysisService.analyze({
      resumeText: extractedText,
      jobDescription: input.jobDescription,
      targetRole: jdExtraction.targetRoleTitle || input.targetRole,
      jdKeywords: jdExtraction.keywords,
      requiredSkills: jdExtraction.requiredSkills,
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
      analysisResult.matchedKeywords,
      analysisResult.missingKeywords,
    );

    stages[stages.length - 1].status = "completed";
    stages[stages.length - 1].duration = Date.now() - evalStart;

    const totalTime = Date.now() - startTime;

    return {
      analysis: {
        targetRole: jdExtraction.targetRoleTitle || input.targetRole,
        score: analysisResult.score,
        metricsFound: analysisResult.metricsFound,
        matchedKeywords: analysisResult.matchedKeywords,
        missingKeywords: analysisResult.missingKeywords,
        suggestions: analysisResult.suggestions,
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
        provider: aiProvider.isEnabled() ? "openai" : "parser",
        model: env.AI_EXTRACTION_MODEL,
      },
    };
  },
};
