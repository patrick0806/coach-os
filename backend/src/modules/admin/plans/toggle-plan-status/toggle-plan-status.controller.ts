import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { API_TAGS } from "@shared/constants";

import { TogglePlanStatusService } from "./toggle-plan-status.service";
import { TogglePlanStatusDTO } from "./dtos/request.dto";

@Roles(ApplicationRoles.ADMIN)
@ApiTags(API_TAGS.ADMIN)
@Controller({ version: "1", path: "plans" })
export class TogglePlanStatusController {
  constructor(private readonly togglePlanStatusService: TogglePlanStatusService) {}

  @Patch(":id/status")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Activate or deactivate a SaaS plan (admin only)" })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  handle(@Param("id") id: string, @Body() dto: TogglePlanStatusDTO): Promise<void> {
    return this.togglePlanStatusService.execute(id, dto.isActive);
  }
}
