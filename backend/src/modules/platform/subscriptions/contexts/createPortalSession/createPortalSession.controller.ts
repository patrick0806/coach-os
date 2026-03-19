import { Controller, Post, Request } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { CreatePortalSessionUseCase } from "./createPortalSession.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.SUBSCRIPTIONS)
@Roles(ApplicationRoles.PERSONAL)
@BypassTenantAccess()
@Controller({ version: "1" })
export class CreatePortalSessionController {
  constructor(private readonly createPortalSessionUseCase: CreatePortalSessionUseCase) {}

  @ApiOperation({ summary: "Create Stripe billing portal session" })
  @Post("portal")
  async handle(@Request() req: { user: { personalId: string } }) {
    return this.createPortalSessionUseCase.execute(req.user.personalId);
  }
}
