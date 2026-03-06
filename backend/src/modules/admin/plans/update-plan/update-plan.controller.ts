import { Body, Controller, Param, Patch } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { API_TAGS } from "@shared/constants";

import { UpdatePlanService } from "./update-plan.service";
import { UpdatePlanDTO } from "./dtos/request.dto";

@Roles(ApplicationRoles.ADMIN)
@ApiTags(API_TAGS.ADMIN)
@Controller({ version: "1", path: "plans" })
export class UpdatePlanController {
  constructor(private readonly updatePlanService: UpdatePlanService) {}

  @Patch(":id")
  @ApiOperation({ summary: "Update a SaaS plan (admin only)" })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  handle(@Param("id") id: string, @Body() dto: UpdatePlanDTO) {
    return this.updatePlanService.execute(id, dto);
  }
}
