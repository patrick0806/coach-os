import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { GetStudentWorkoutPlansService } from "./get-student-workout-plans.service";
import { WorkoutPlanDTO } from "@modules/workouts/workout-plans/shared/dtos/workout-plan.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.STUDENTS)
@Controller({ version: "1", path: "" })
export class GetStudentWorkoutPlansController {
  constructor(
    private readonly getStudentWorkoutPlansService: GetStudentWorkoutPlansService,
  ) {}

  @Get(":id/workout-plans")
  @ApiOperation({ summary: "List workout plans assigned to a specific student" })
  @ApiOkResponse({ type: [WorkoutPlanDTO] })
  handle(
    @Param("id") studentId: string,
    @CurrentUser() user: IAccessToken,
  ): Promise<WorkoutPlanDTO[]> {
    return this.getStudentWorkoutPlansService.execute(studentId, user);
  }
}
