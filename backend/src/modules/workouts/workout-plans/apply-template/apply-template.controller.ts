import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { ApplyTemplateService } from "./apply-template.service";
import { ApplyTemplateDTO } from "./dtos/request.dto";
import { WorkoutPlanDTO } from "../shared/dtos/workout-plan.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.WORKOUT_PLANS)
@Controller({ version: "1", path: "" })
export class ApplyTemplateController {
  constructor(private readonly applyTemplateService: ApplyTemplateService) {}

  @Post(":id/apply")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Apply a workout template to create an independent student plan" })
  @ApiCreatedResponse({ type: WorkoutPlanDTO })
  handle(
    @Param("id") id: string,
    @Body() dto: ApplyTemplateDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<WorkoutPlanDTO> {
    return this.applyTemplateService.execute(id, dto, user);
  }
}
