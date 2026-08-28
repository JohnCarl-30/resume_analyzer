import { Controller, Get, UseGuards } from "@nestjs/common";

import { ClerkAuthGuard } from "../auth/clerk-auth.guard.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { AccountService } from "./account.service.js";

@Controller("api/account")
@UseGuards(ClerkAuthGuard)
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Get("analysis-quota")
  async getAnalysisQuota(@CurrentUser() userId: string) {
    return { data: await this.account.getAnalysisQuota(userId) };
  }
}
