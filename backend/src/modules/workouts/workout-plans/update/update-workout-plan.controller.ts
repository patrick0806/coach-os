import { Body, Controller, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { UpdateWorkoutPlanService } from "./update-workout-plan.service";
import { UpdateWorkoutPlanDTO } from "./dtos/request.dto";
import { WorkoutPlanDTO } from "../shared/dtos/workout-plan.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.WORKOUT_PLANS)
@Controller({ version: "1", path: "" })
export class UpdateWorkoutPlanController {
  constructor(private readonly updateWorkoutPlanService: UpdateWorkoutPlanService) {}

  @Patch(":id")
  @ApiOperation({ summary: "Update a workout plan name or description" })
  @ApiOkResponse({ type: WorkoutPlanDTO })
  handle(
    @Param("id") id: string,
    @Body() dto: UpdateWorkoutPlanDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<WorkoutPlanDTO> {
    return this.updateWorkoutPlanService.execute(id, dto, user);
  }
}
