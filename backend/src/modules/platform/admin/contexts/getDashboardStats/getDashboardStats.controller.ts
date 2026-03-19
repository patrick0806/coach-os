import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { BypassTenantAccess } from "@shared/decorators/bypass-tenant-access.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { ApplicationRoles } from "@shared/enums";

import { GetDashboardStatsResponseDTO } from "./dtos/response.dto";
import { GetDashboardStatsUseCase } from "./getDashboardStats.useCase";

@ApiBearerAuth()
@ApiTags(API_TAGS.ADMIN)
@Roles(ApplicationRoles.ADMIN)
@BypassTenantAccess()
@Controller({ version: "1" })
export class GetDashboardStatsController {
  constructor(private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase) {}

  @ApiOperation({ summary: "Get admin dashboard stats" })
  @ApiOkResponse()
  @Get("stats")
  async handle(): Promise<GetDashboardStatsResponseDTO> {
    return this.getDashboardStatsUseCase.execute();
  }
}
