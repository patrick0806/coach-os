import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { InviteCoachUseCase } from "./inviteCoach.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class InviteCoachController {
  constructor(private readonly inviteCoachUseCase: InviteCoachUseCase) { }

  @ApiOperation({ summary: "Invite a coach to the platform (admin)" })
  @ApiCreatedResponse({ description: "Invitation sent successfully" })
  @Post("/coaches/invite")
  @HttpCode(HttpStatus.CREATED)
  async handle(@Body() body: unknown): Promise<{ message: string }> {
    return this.inviteCoachUseCase.execute(body);
  }
}
