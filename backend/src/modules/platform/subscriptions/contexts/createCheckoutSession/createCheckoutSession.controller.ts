import { Controller, Post, Request } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { CreateCheckoutSessionUseCase } from "./createCheckoutSession.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.SUBSCRIPTIONS)
@Roles(ApplicationRoles.PERSONAL)
@BypassTenantAccess()
@Controller({ version: "1" })
export class CreateCheckoutSessionController {
  constructor(private readonly createCheckoutSessionUseCase: CreateCheckoutSessionUseCase) {}

  @ApiOperation({ summary: "Create Stripe checkout session to subscribe" })
  @Post("checkout")
  async handle(@Request() req: { user: { personalId: string } }) {
    return this.createCheckoutSessionUseCase.execute(req.user.personalId);
  }
}
