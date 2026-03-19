import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { ListWhitelistedUseCase } from "./listWhitelisted.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class ListWhitelistedController {
  constructor(private readonly listWhitelistedUseCase: ListWhitelistedUseCase) {}

  @ApiOperation({ summary: "List whitelisted coaches (admin)" })
  @ApiOkResponse()
  @Get("whitelist")
  async handle() {
    return this.listWhitelistedUseCase.execute();
  }
}
