import { Controller, Get, Request } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { GetSubscriptionResponseDTO } from "./dtos/response.dto";
import { GetSubscriptionUseCase } from "./getSubscription.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.SUBSCRIPTIONS)
@Roles(ApplicationRoles.PERSONAL)
@BypassTenantAccess()
@Controller({ version: "1" })
export class GetSubscriptionController {
  constructor(private readonly getSubscriptionUseCase: GetSubscriptionUseCase) {}

  @ApiOperation({ summary: "Get current subscription details" })
  @ApiOkResponse()
  @Get("current")
  async handle(@Request() req: { user: { personalId: string } }): Promise<GetSubscriptionResponseDTO> {
    return this.getSubscriptionUseCase.execute(req.user.personalId);
  }
}
