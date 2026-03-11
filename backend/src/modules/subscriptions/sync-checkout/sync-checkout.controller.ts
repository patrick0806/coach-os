import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { BypassTenantAccess, CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { SyncCheckoutService } from "./sync-checkout.service";
import { SyncCheckoutDTO } from "./dtos/request.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.SUBSCRIPTIONS)
@Controller({ version: "1", path: "sync-checkout" })
export class SyncCheckoutController {
  constructor(private readonly syncCheckoutService: SyncCheckoutService) {}

  @Post()
  @BypassTenantAccess()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Sync subscription status from a completed Stripe checkout session" })
  @ApiNoContentResponse()
  handle(
    @Body() dto: SyncCheckoutDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<void> {
    return this.syncCheckoutService.execute(dto.sessionId, user);
  }
}
