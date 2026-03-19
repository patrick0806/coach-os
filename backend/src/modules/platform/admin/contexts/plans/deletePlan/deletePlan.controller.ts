import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { DeletePlanUseCase } from "./deletePlan.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class DeletePlanController {
  constructor(private readonly deletePlanUseCase: DeletePlanUseCase) {}

  @ApiOperation({ summary: "Soft delete plan (admin)" })
  @ApiNoContentResponse()
  @Delete("plans/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@Param("id") id: string): Promise<void> {
    return this.deletePlanUseCase.execute(id);
  }
}
