import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { ListPlansUseCase } from "./listPlans.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class ListPlansController {
  constructor(private readonly listPlansUseCase: ListPlansUseCase) {}

  @ApiOperation({ summary: "List all plans (admin)" })
  @ApiOkResponse()
  @Get("plans")
  async handle() {
    return this.listPlansUseCase.execute();
  }
}
