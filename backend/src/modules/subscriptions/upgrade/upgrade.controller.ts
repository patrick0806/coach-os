import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { UpgradeService } from "./upgrade.service";
import { UpgradeSubscriptionDTO } from "./dtos/request.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.SUBSCRIPTIONS)
@Controller({ version: "1", path: "upgrade" })
export class UpgradeController {
  constructor(private readonly upgradeService: UpgradeService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Upgrade subscription to a higher tier plan" })
  @ApiNoContentResponse()
  handle(
    @Body() dto: UpgradeSubscriptionDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<void> {
    return this.upgradeService.execute(dto.planId, user);
  }
}
