import { Controller, Get, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { GetTenantUseCase } from "./getTenant.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class GetTenantController {
  constructor(private readonly getTenantUseCase: GetTenantUseCase) {}

  @ApiOperation({ summary: "Get tenant details (admin)" })
  @ApiOkResponse()
  @Get("tenants/:id")
  async handle(@Param("id") id: string) {
    return this.getTenantUseCase.execute(id);
  }
}
