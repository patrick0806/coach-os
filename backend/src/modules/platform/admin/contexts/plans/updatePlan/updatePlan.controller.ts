import { Body, Controller, Param, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { UpdatePlanUseCase } from "./updatePlan.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class UpdatePlanController {
  constructor(private readonly updatePlanUseCase: UpdatePlanUseCase) {}

  @ApiOperation({ summary: "Update plan (admin)" })
  @ApiOkResponse()
  @Put("plans/:id")
  async handle(@Param("id") id: string, @Body() body: unknown) {
    return this.updatePlanUseCase.execute(id, body);
  }
}
