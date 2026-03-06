import { Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { CancelSubscriptionService } from "./cancel-subscription.service";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.SUBSCRIPTIONS)
@Controller({ version: "1", path: "cancel" })
export class CancelSubscriptionController {
  constructor(private readonly cancelSubscriptionService: CancelSubscriptionService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Cancel subscription at end of current billing period" })
  @ApiNoContentResponse()
  handle(@CurrentUser() user: IAccessToken): Promise<void> {
    return this.cancelSubscriptionService.execute(user);
  }
}
