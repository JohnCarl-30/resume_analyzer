import { type DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule } from "../database/database.module.js";
import { JobApplicationEntity } from "../database/entities/job-application.entity.js";
import { JobApplicationsController } from "./job-applications.controller.js";
import { JobApplicationsService } from "./job-applications.service.js";
import { InMemoryJobApplicationRepository } from "./repositories/in-memory-job-application.repository.js";
import { JOB_APPLICATION_REPOSITORY } from "./repositories/job-application.repository.js";
import { TypeOrmJobApplicationRepository } from "./repositories/typeorm-job-application.repository.js";

@Module({})
export class JobApplicationsModule {
  static register(): DynamicModule {
    const usePostgres = DatabaseModule.isConfigured;

    return {
      module: JobApplicationsModule,
      imports: usePostgres ? [TypeOrmModule.forFeature([JobApplicationEntity])] : [],
      controllers: [JobApplicationsController],
      providers: [
        JobApplicationsService,
        {
          provide: JOB_APPLICATION_REPOSITORY,
          useClass: usePostgres
            ? TypeOrmJobApplicationRepository
            : InMemoryJobApplicationRepository,
        },
      ],
    };
  }
}
