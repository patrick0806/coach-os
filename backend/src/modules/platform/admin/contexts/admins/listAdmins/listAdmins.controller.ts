import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { ListAdminsUseCase } from "./listAdmins.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class ListAdminsController {
  constructor(private readonly listAdminsUseCase: ListAdminsUseCase) {}

  @ApiOperation({ summary: "List all admins" })
  @ApiOkResponse()
  @Get("admins")
  async handle() {
    return this.listAdminsUseCase.execute();
  }
}
