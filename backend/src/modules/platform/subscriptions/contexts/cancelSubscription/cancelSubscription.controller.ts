import { Controller, Post, Request } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { CancelSubscriptionUseCase } from "./cancelSubscription.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.SUBSCRIPTIONS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class CancelSubscriptionController {
  constructor(private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase) {}

  @ApiOperation({ summary: "Cancel subscription at period end" })
  @Post("cancel")
  async handle(@Request() req: { user: { personalId: string } }) {
    return this.cancelSubscriptionUseCase.execute(req.user.personalId);
  }
}
