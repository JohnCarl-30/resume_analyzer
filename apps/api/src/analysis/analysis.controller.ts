import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile as UploadedFileParam,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";

import { ClerkAuthGuard } from "../auth/clerk-auth.guard.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { evaluationService } from "../services/evaluation.service.js";
import { fewShotService } from "../services/few-shot.service.js";
import { resumeParserService } from "../services/resume-parser.service.js";
import { semanticSearchService } from "../services/semantic-search.service.js";
import type { UploadedFile } from "../types/uploaded-file.js";
import { AnalysisService } from "./analysis.service.js";

const MAX_RESUME_BYTES = 10 * 1024 * 1024;

/**
 * Route order matters for /examples vs /:analysisId, exactly as it did under
 * Hono -- Nest matches static segments before parameters, so the decorator
 * order here is documentation rather than behaviour.
 *
 * /examples and /evaluate are public, as before; everything touching a user's
 * data takes the guard per-route.
 */
@Controller("api/analysis")
export class AnalysisController {
  constructor(private readonly analysis: AnalysisService) {}

  @Get()
  @UseGuards(ClerkAuthGuard)
  async list(@CurrentUser() userId: string) {
    return { data: await this.analysis.listAnalyses(userId) };
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    // The service parses through createAnalysisSchema itself, as before.
    return { data: await this.analysis.createAnalysis(body) };
  }

  @Get("examples")
  getFewShotExamples() {
    return { data: fewShotService.getAllExamples() };
  }

  @Post("examples")
  @HttpCode(HttpStatus.CREATED)
  async createFewShotExample(
    @Body() body: Parameters<typeof fewShotService.storeExample>[0],
  ) {
    const example = await fewShotService.storeExample({
      resumeText: body.resumeText,
      targetRole: body.targetRole,
      extractedProfile: body.extractedProfile,
      quality: body.quality,
    });

    return { data: example };
  }

  @Post("upload")
  @UseGuards(ClerkAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor("resume"))
  async createFromUpload(
    @CurrentUser() userId: string,
    @Body() fields: Record<string, unknown>,
    @UploadedFileParam() file: Express.Multer.File | undefined,
  ) {
    // Size and type checks live here rather than in multer options so the
    // failure bodies keep the exact wording clients already handle. multer
    // buffers to memory either way, as Hono's formData() did.
    if (file && file.size > MAX_RESUME_BYTES) {
      throw new BadRequestException("Resume must be 10 MB or smaller.");
    }

    if (file && !resumeParserService.isSupportedMimeType(file.mimetype)) {
      throw new BadRequestException("Please upload a PDF or DOCX resume so we can parse it.");
    }

    const resumeFile: UploadedFile | undefined = file
      ? { buffer: file.buffer, mimetype: file.mimetype, originalname: file.originalname }
      : undefined;

    const analysis = await this.analysis.createAnalysisFromUpload({
      userId,
      targetRole: fields.targetRole,
      jobDescription: fields.jobDescription,
      selectedTemplateId: fields.selectedTemplateId,
      resumeFile,
    });

    return { data: analysis };
  }

  @Post("template")
  @UseGuards(ClerkAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createFromTemplate(@CurrentUser() userId: string, @Body() body: Record<string, unknown>) {
    const analysis = await this.analysis.createAnalysisFromTemplate({
      userId,
      targetRole: body.targetRole,
      jobDescription: body.jobDescription,
      selectedTemplateId: body.selectedTemplateId,
      // createTemplateAnalysisSchema rejects a non-string before this is read.
      resumeText: body.resumeText as string,
    });

    return { data: analysis };
  }

  @Post("search")
  @UseGuards(ClerkAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async semanticSearch(@CurrentUser() userId: string, @Body() body: Record<string, unknown>) {
    const { jobDescription, resumeText, topK = 5 } = body as {
      jobDescription: string;
      resumeText: string;
      topK?: number;
    };

    const analyses = await this.analysis.listAnalyses(userId);

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

    return { data: results };
  }

  @Post("evaluate")
  @HttpCode(HttpStatus.CREATED)
  evaluate(@Body() body: Record<string, unknown>) {
    const result = evaluationService.runEvaluation({
      groundTruthKeywords: body.groundTruthKeywords as string[] | undefined,
      matchedKeywords: body.matchedKeywords as string[] | undefined,
      missingKeywords: body.missingKeywords as string[] | undefined,
    });

    return { data: result };
  }

  @Get(":analysisId/source")
  @UseGuards(ClerkAuthGuard)
  async getSourceFile(
    @CurrentUser() userId: string,
    @Param("analysisId") analysisId: string,
    @Res() response: Response,
  ) {
    const sourceFile = await this.analysis.getAnalysisSourceFile(analysisId, userId);

    response
      .set({
        "Content-Type": sourceFile.contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(sourceFile.fileName)}"`,
      })
      .send(Buffer.from(sourceFile.dataBase64, "base64"));
  }

  @Get(":analysisId")
  @UseGuards(ClerkAuthGuard)
  async getById(@CurrentUser() userId: string, @Param("analysisId") analysisId: string) {
    return { data: await this.analysis.getAnalysisById(analysisId, userId) };
  }

  @Patch(":analysisId")
  @UseGuards(ClerkAuthGuard)
  async update(
    @CurrentUser() userId: string,
    @Param("analysisId") analysisId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const updated = await this.analysis.updateAnalysis(
      analysisId,
      userId,
      // The service re-validates through createAnalysis, so an unchecked
      // shape still ends up as a 400 rather than reaching the analyzer.
      body as { jobDescription: string; targetRole?: string },
    );

    return { data: updated };
  }
}
