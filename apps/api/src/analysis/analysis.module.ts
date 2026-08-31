import { type DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule } from "../database/database.module.js";
import { ResumeAnalysisEntity } from "../database/entities/resume-analysis.entity.js";
import { AnalysisController } from "./analysis.controller.js";
import { AnalysisService } from "./analysis.service.js";
import { ANALYSIS_REPOSITORY } from "./repositories/analysis.repository.js";
import { InMemoryAnalysisRepository } from "./repositories/in-memory-analysis.repository.js";
import { TypeOrmAnalysisRepository } from "./repositories/typeorm-analysis.repository.js";

@Module({})
export class AnalysisModule {
  static register(): DynamicModule {
    const usePostgres = DatabaseModule.isConfigured;

    return {
      module: AnalysisModule,
      imports: usePostgres ? [TypeOrmModule.forFeature([ResumeAnalysisEntity])] : [],
      controllers: [AnalysisController],
      providers: [
        AnalysisService,
        {
          provide: ANALYSIS_REPOSITORY,
          useClass: usePostgres ? TypeOrmAnalysisRepository : InMemoryAnalysisRepository,
        },
      ],
    };
  }
}
