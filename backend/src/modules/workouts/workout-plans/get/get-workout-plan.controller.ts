import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { GetWorkoutPlanService } from "./get-workout-plan.service";
import { WorkoutPlanDetailDTO } from "../shared/dtos/workout-plan.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.WORKOUT_PLANS)
@Controller({ version: "1", path: "" })
export class GetWorkoutPlanController {
  constructor(private readonly getWorkoutPlanService: GetWorkoutPlanService) {}

  @Get(":id")
  @ApiOperation({ summary: "Get workout plan detail with exercises" })
  @ApiOkResponse({ type: WorkoutPlanDetailDTO })
  handle(
    @Param("id") id: string,
    @CurrentUser() user: IAccessToken,
  ): Promise<WorkoutPlanDetailDTO> {
    return this.getWorkoutPlanService.execute(id, user);
  }
}
