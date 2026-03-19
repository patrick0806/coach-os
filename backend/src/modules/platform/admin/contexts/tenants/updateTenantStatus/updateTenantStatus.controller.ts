import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { UpdateTenantStatusUseCase } from "./updateTenantStatus.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class UpdateTenantStatusController {
  constructor(private readonly updateTenantStatusUseCase: UpdateTenantStatusUseCase) {}

  @ApiOperation({ summary: "Update tenant access status (admin)" })
  @ApiNoContentResponse()
  @Patch("tenants/:id/status")
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@Param("id") id: string, @Body() body: unknown): Promise<void> {
    return this.updateTenantStatusUseCase.execute(id, body);
  }
}
