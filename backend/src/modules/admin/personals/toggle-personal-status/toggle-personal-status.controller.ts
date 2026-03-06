import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { API_TAGS } from "@shared/constants";

import { TogglePersonalStatusService } from "./toggle-personal-status.service";
import { TogglePersonalStatusDTO } from "./dtos/request.dto";

@Roles(ApplicationRoles.ADMIN)
@ApiTags(API_TAGS.ADMIN)
@Controller({ version: "1", path: "personals" })
export class TogglePersonalStatusController {
  constructor(private readonly togglePersonalStatusService: TogglePersonalStatusService) {}

  @Patch(":id/status")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Activate or deactivate a personal account (admin only)" })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  handle(@Param("id") id: string, @Body() dto: TogglePersonalStatusDTO): Promise<void> {
    return this.togglePersonalStatusService.execute(id, dto.isActive);
  }
}
