import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { BypassTenantAccess, CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { GetSubscriptionService } from "./get-subscription.service";
import { SubscriptionStatusDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.SUBSCRIPTIONS)
@Controller({ version: "1", path: "me" })
export class GetSubscriptionController {
  constructor(private readonly getSubscriptionService: GetSubscriptionService) {}

  @Get()
  @BypassTenantAccess()
  @ApiOperation({ summary: "Get current subscription status for the authenticated personal" })
  @ApiOkResponse({ type: SubscriptionStatusDTO })
  handle(@CurrentUser() user: IAccessToken): Promise<SubscriptionStatusDTO> {
    return this.getSubscriptionService.execute(user);
  }
}
