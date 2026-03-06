import { Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { PortalService } from "./portal.service";
import { PortalDTO } from "./dtos/response.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.SUBSCRIPTIONS)
@Controller({ version: "1", path: "portal" })
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate Stripe Customer Portal URL for billing management" })
  @ApiOkResponse({ type: PortalDTO })
  handle(@CurrentUser() user: IAccessToken): Promise<PortalDTO> {
    return this.portalService.execute(user);
  }
}
