import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { ListTenantsUseCase } from "./listTenants.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class ListTenantsController {
  constructor(private readonly listTenantsUseCase: ListTenantsUseCase) {}

  @ApiOperation({ summary: "List tenants (admin)" })
  @ApiOkResponse()
  @Get("tenants")
  async handle(@Query() query: unknown) {
    return this.listTenantsUseCase.execute(query);
  }
}
