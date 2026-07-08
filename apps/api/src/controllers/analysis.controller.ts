import type { Request, Response } from "express";

import { analysisService } from "../services/analysis.service.js";
import { llmPipelineService } from "../services/llm-pipeline.service.js";
import { semanticSearchService } from "../services/semantic-search.service.js";
import { evaluationService } from "../services/evaluation.service.js";
import { fewShotService } from "../services/few-shot.service.js";

export const analysisController = {
  async list(_req: Request, res: Response) {
    const analyses = await analysisService.listAnalyses();
    res.json({ data: analyses });
  },

  async create(req: Request, res: Response) {
    const analysis = await analysisService.createAnalysis(req.body);
    res.status(201).json({ data: analysis });
  },

  async getById(req: Request, res: Response) {
    const analysisId = Array.isArray(req.params.analysisId)
      ? req.params.analysisId[0]
      : req.params.analysisId;

    const analysis = await analysisService.getAnalysisById(analysisId);
    res.json({ data: analysis });
  },

  async update(req: Request, res: Response) {
    const analysisId = Array.isArray(req.params.analysisId)
      ? req.params.analysisId[0]
      : req.params.analysisId;

    const updated = await analysisService.updateAnalysis(analysisId, req.body);
    res.json({ data: updated });
  },

  async createFromUpload(req: Request, res: Response) {
    const analysis = await analysisService.createAnalysisFromUpload({
      targetRole: req.body.targetRole,
      jobDescription: req.body.jobDescription,
      selectedTemplateId: req.body.selectedTemplateId,
      resumeFile: req.file,
    });

    res.status(201).json({ data: analysis });
  },

  async createFromTemplate(req: Request, res: Response) {
    const analysis = await analysisService.createAnalysisFromTemplate({
      targetRole: req.body.targetRole,
      jobDescription: req.body.jobDescription,
      selectedTemplateId: req.body.selectedTemplateId,
      resumeText: req.body.resumeText,
    });

    res.status(201).json({ data: analysis });
  },

  async getSourceFile(req: Request, res: Response) {
    const analysisId = Array.isArray(req.params.analysisId)
      ? req.params.analysisId[0]
      : req.params.analysisId;

    const sourceFile = await analysisService.getAnalysisSourceFile(analysisId);

    res.setHeader("Content-Type", sourceFile.contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(sourceFile.fileName)}"`,
    );
    res.send(Buffer.from(sourceFile.dataBase64, "base64"));
  },

  async runPipeline(req: Request, res: Response) {
    const result = await llmPipelineService.runPipeline({
      targetRole: req.body.targetRole,
      jobDescription: req.body.jobDescription,
      resumeFile: req.file,
      resumeText: req.body.resumeText,
      useFewShot: req.body.useFewShot ?? false,
      generateEmbedding: req.body.generateEmbedding ?? false,
    });

    res.status(201).json({ data: result });
  },

  async semanticSearch(req: Request, res: Response) {
    const { jobDescription, resumeText, topK = 5 } = req.body;

    const analyses = await analysisService.listAnalyses();

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

    res.json({ data: results });
  },

  async evaluate(req: Request, res: Response) {
    const result = evaluationService.runEvaluation({
      groundTruthKeywords: req.body.groundTruthKeywords,
      matchedKeywords: req.body.matchedKeywords,
      missingKeywords: req.body.missingKeywords,
    });

    res.json({ data: result });
  },

  async getFewShotExamples(_req: Request, res: Response) {
    const examples = fewShotService.getAllExamples();
    res.json({ data: examples });
  },

  async createFewShotExample(req: Request, res: Response) {
    const example = await fewShotService.storeExample({
      resumeText: req.body.resumeText,
      targetRole: req.body.targetRole,
      extractedProfile: req.body.extractedProfile,
      quality: req.body.quality,
    });

    res.status(201).json({ data: example });
  },
};
