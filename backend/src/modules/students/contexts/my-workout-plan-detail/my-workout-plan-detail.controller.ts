import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { MyWorkoutPlanDetailService } from "./my-workout-plan-detail.service";
import { WorkoutPlanDetailDTO } from "@modules/workouts/workout-plans/shared/dtos/workout-plan.dto";

@Roles(ApplicationRoles.STUDENT)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "me/workout-plans" })
export class MyWorkoutPlanDetailController {
  constructor(private readonly myWorkoutPlanDetailService: MyWorkoutPlanDetailService) {}

  @Get(":planId")
  @ApiOperation({ summary: "Get workout plan detail for the authenticated student" })
  @ApiOkResponse({ type: WorkoutPlanDetailDTO })
  handle(
    @Param("planId") planId: string,
    @CurrentUser() user: IAccessToken,
  ): Promise<WorkoutPlanDetailDTO> {
    return this.myWorkoutPlanDetailService.execute(planId, user);
  }
}
