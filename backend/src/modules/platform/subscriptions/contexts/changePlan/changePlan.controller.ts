import { Body, Controller, Patch, Request } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { ChangePlanUseCase } from "./changePlan.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.SUBSCRIPTIONS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1" })
export class ChangePlanController {
  constructor(private readonly changePlanUseCase: ChangePlanUseCase) {}

  @ApiOperation({ summary: "Change subscription plan" })
  @Patch("plan")
  async handle(
    @Request() req: { user: { personalId: string } },
    @Body() body: unknown,
  ): Promise<void> {
    await this.changePlanUseCase.execute(req.user.personalId, body);
  }
}
