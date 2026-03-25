import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess, Public } from "@shared/decorators";

import { AcceptCoachInviteUseCase } from "./acceptCoachInvite.useCase";

@ApiTags(API_TAGS.AUTH)
@Public()
@BypassTenantAccess()
@Controller({ version: "1" })
export class AcceptCoachInviteController {
  constructor(private readonly acceptCoachInviteUseCase: AcceptCoachInviteUseCase) {}

  @ApiOperation({ summary: "Accept coach invitation and create account" })
  @ApiCreatedResponse({ description: "Account created successfully" })
  @Post("auth/accept-coach-invite")
  @HttpCode(HttpStatus.CREATED)
  async handle(@Body() body: unknown): Promise<{ message: string }> {
    return this.acceptCoachInviteUseCase.execute(body);
  }
}
