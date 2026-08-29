import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { ClerkAuthGuard } from "../auth/clerk-auth.guard.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import {
  createJobApplicationSchema,
  updateJobApplicationSchema,
  type CreateJobApplicationInput,
  type UpdateJobApplicationInput,
} from "../schemas/job-application.schema.js";
import { JobApplicationsService } from "./job-applications.service.js";

@Controller("api/applications")
@UseGuards(ClerkAuthGuard)
export class JobApplicationsController {
  constructor(private readonly jobApplications: JobApplicationsService) {}

  @Get()
  async list(@CurrentUser() userId: string) {
    return { data: await this.jobApplications.list(userId) };
  }

  @Get(":applicationId")
  async getById(@CurrentUser() userId: string, @Param("applicationId") id: string) {
    return { data: await this.jobApplications.getById(id, userId) };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() userId: string,
    // Bound to the body, not the method: a method-level pipe also validates
    // the injected userId string against the object schema.
    @Body(new ZodValidationPipe(createJobApplicationSchema)) body: CreateJobApplicationInput,
  ) {
    return { data: await this.jobApplications.create(userId, body) };
  }

  @Patch(":applicationId")
  async update(
    @CurrentUser() userId: string,
    @Param("applicationId") id: string,
    @Body(new ZodValidationPipe(updateJobApplicationSchema)) body: UpdateJobApplicationInput,
  ) {
    return { data: await this.jobApplications.update(id, userId, body) };
  }

  @Delete(":applicationId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() userId: string, @Param("applicationId") id: string) {
    await this.jobApplications.remove(id, userId);
  }
}
