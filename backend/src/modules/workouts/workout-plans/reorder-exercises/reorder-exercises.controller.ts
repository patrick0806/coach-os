import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { ReorderExercisesService } from "./reorder-exercises.service";
import { ReorderExercisesDTO } from "./dtos/request.dto";
import { WorkoutExerciseDTO } from "../shared/dtos/workout-plan.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.WORKOUT_PLANS)
@Controller({ version: "1", path: ":id/exercises" })
export class ReorderExercisesController {
  constructor(private readonly reorderExercisesService: ReorderExercisesService) {}

  @Patch("reorder")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reorder exercises within a workout plan" })
  @ApiOkResponse({ type: [WorkoutExerciseDTO] })
  handle(
    @Param("id") planId: string,
    @Body() dto: ReorderExercisesDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<WorkoutExerciseDTO[]> {
    return this.reorderExercisesService.execute(planId, dto.items, user);
  }
}
