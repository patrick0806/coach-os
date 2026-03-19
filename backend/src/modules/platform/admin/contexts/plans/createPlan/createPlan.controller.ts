import { Body, Controller, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { CreatePlanUseCase } from "./createPlan.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class CreatePlanController {
  constructor(private readonly createPlanUseCase: CreatePlanUseCase) {}

  @ApiOperation({ summary: "Create plan (admin)" })
  @ApiCreatedResponse()
  @Post("plans")
  async handle(@Body() body: unknown) {
    return this.createPlanUseCase.execute(body);
  }
}
