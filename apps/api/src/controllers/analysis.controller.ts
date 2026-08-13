import type { Context } from "hono";

import { analysisService } from "../services/analysis.service.js";
import { evaluationService } from "../services/evaluation.service.js";
import { fewShotService } from "../services/few-shot.service.js";
import { resumeParserService } from "../services/resume-parser.service.js";
import { semanticSearchService } from "../services/semantic-search.service.js";
import type { AppEnv } from "../types/hono.js";
import { readMultipartForm } from "../utils/multipart.js";
import { readJsonBody } from "../utils/request-body.js";

const MAX_RESUME_BYTES = 10 * 1024 * 1024;

// Headroom over the file limit for the job description and other text fields.
const MAX_UPLOAD_REQUEST_BYTES = MAX_RESUME_BYTES + 1024 * 1024;

export const analysisController = {
  async list(c: Context<AppEnv>) {
    const analyses = await analysisService.listAnalyses(c.get("userId"));
    return c.json({ data: analyses });
  },

  async create(c: Context<AppEnv>) {
    const analysis = await analysisService.createAnalysis(await readJsonBody(c));
    return c.json({ data: analysis }, 201);
  },

  async getById(c: Context<AppEnv, "/:analysisId">) {
    const analysis = await analysisService.getAnalysisById(
      c.req.param("analysisId"),
      c.get("userId"),
    );
    return c.json({ data: analysis });
  },

  async update(c: Context<AppEnv, "/:analysisId">) {
    const body = await readJsonBody(c);

    const updated = await analysisService.updateAnalysis(
      c.req.param("analysisId"),
      c.get("userId"),
      // The service re-validates through createAnalysis, so an unchecked shape
      // here still ends up as a 400 rather than reaching the analyzer.
      body as { jobDescription: string; targetRole?: string },
    );

    return c.json({ data: updated });
  },

  async createFromUpload(c: Context<AppEnv>) {
    const { fields, file } = await readMultipartForm(c, "resume", {
      maxFileBytes: MAX_RESUME_BYTES,
      maxRequestBytes: MAX_UPLOAD_REQUEST_BYTES,
      isSupportedMimeType: resumeParserService.isSupportedMimeType,
      tooLargeMessage: "Resume must be 10 MB or smaller.",
      unsupportedTypeMessage:
        "Please upload a PDF or DOCX resume so we can parse it.",
    });

    const analysis = await analysisService.createAnalysisFromUpload({
      userId: c.get("userId"),
      targetRole: fields.targetRole,
      jobDescription: fields.jobDescription,
      selectedTemplateId: fields.selectedTemplateId,
      resumeFile: file,
    });

    return c.json({ data: analysis }, 201);
  },

  async createFromTemplate(c: Context<AppEnv>) {
    const body = await readJsonBody(c);

    const analysis = await analysisService.createAnalysisFromTemplate({
      userId: c.get("userId"),
      targetRole: body.targetRole,
      jobDescription: body.jobDescription,
      selectedTemplateId: body.selectedTemplateId,
      // createTemplateAnalysisSchema rejects a non-string before this is read,
      // which is the same guarantee the untyped Express body had.
      resumeText: body.resumeText as string,
    });

    return c.json({ data: analysis }, 201);
  },

  async getSourceFile(c: Context<AppEnv, "/:analysisId/source">) {
    const sourceFile = await analysisService.getAnalysisSourceFile(
      c.req.param("analysisId"),
      c.get("userId"),
    );

    c.header("Content-Type", sourceFile.contentType);
    c.header(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(sourceFile.fileName)}"`,
    );

    return c.body(Buffer.from(sourceFile.dataBase64, "base64"));
  },

  async semanticSearch(c: Context<AppEnv>) {
    const body = await readJsonBody(c);
    const { jobDescription, resumeText, topK = 5 } = body as {
      jobDescription: string;
      resumeText: string;
      topK?: number;
    };

    const analyses = await analysisService.listAnalyses(c.get("userId"));

    const results = await semanticSearchService.hybridSearch(
      jobDescription,
      resumeText,
      analyses.map((a) => ({
        id: a.id,
        jobEmbedding: a.jobEmbedding ?? [],
        resumeEmbedding: a.resumeEmbedding ?? [],
        targetRole: a.targetRole,
        score: a.score,
        matchedKeywords: a.matchedKeywords,
        missingKeywords: a.missingKeywords,
      })),
      topK,
    );

    return c.json({ data: results });
  },

  async evaluate(c: Context<AppEnv>) {
    const body = (await readJsonBody(c)) as {
      groundTruthKeywords?: string[];
      matchedKeywords?: string[];
      missingKeywords?: string[];
    };

    const result = evaluationService.runEvaluation({
      groundTruthKeywords: body.groundTruthKeywords,
      matchedKeywords: body.matchedKeywords,
      missingKeywords: body.missingKeywords,
    });

    return c.json({ data: result });
  },

  async getFewShotExamples(c: Context<AppEnv>) {
    const examples = fewShotService.getAllExamples();
    return c.json({ data: examples });
  },

  async createFewShotExample(c: Context<AppEnv>) {
    const body = (await readJsonBody(c)) as Parameters<
      typeof fewShotService.storeExample
    >[0];

    const example = await fewShotService.storeExample({
      resumeText: body.resumeText,
      targetRole: body.targetRole,
      extractedProfile: body.extractedProfile,
      quality: body.quality,
    });

    return c.json({ data: example }, 201);
  },
};
