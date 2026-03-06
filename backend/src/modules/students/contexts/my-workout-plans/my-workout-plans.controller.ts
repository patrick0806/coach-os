import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { MyWorkoutPlansService } from "./my-workout-plans.service";
import { WorkoutPlanDTO } from "@modules/workouts/workout-plans/shared/dtos/workout-plan.dto";

@Roles(ApplicationRoles.STUDENT)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "me/workout-plans" })
export class MyWorkoutPlansController {
  constructor(private readonly myWorkoutPlansService: MyWorkoutPlansService) {}

  @Get()
  @ApiOperation({ summary: "List workout plans assigned to the authenticated student" })
  @ApiOkResponse({ type: [WorkoutPlanDTO] })
  handle(@CurrentUser() user: IAccessToken): Promise<WorkoutPlanDTO[]> {
    return this.myWorkoutPlansService.execute(user);
  }
}
