import { Controller, Delete, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { RemoveExerciseService } from "./remove-exercise.service";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.WORKOUT_PLANS)
@Controller({ version: "1", path: ":id/exercises" })
export class RemoveExerciseController {
  constructor(private readonly removeExerciseService: RemoveExerciseService) {}

  @Delete(":workoutExerciseId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove an exercise from a workout plan" })
  @ApiNoContentResponse()
  handle(
    @Param("id") planId: string,
    @Param("workoutExerciseId") workoutExerciseId: string,
    @CurrentUser() user: IAccessToken,
  ): Promise<void> {
    return this.removeExerciseService.execute(planId, workoutExerciseId, user);
  }
}
