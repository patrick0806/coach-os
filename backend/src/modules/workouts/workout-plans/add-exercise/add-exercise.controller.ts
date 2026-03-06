import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { AddExerciseService } from "./add-exercise.service";
import { AddExerciseDTO } from "./dtos/request.dto";
import { WorkoutExerciseDTO } from "../shared/dtos/workout-plan.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.WORKOUT_PLANS)
@Controller({ version: "1", path: ":id/exercises" })
export class AddExerciseController {
  constructor(private readonly addExerciseService: AddExerciseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Add an exercise to a workout plan" })
  @ApiCreatedResponse({ type: WorkoutExerciseDTO })
  handle(
    @Param("id") planId: string,
    @Body() dto: AddExerciseDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<WorkoutExerciseDTO> {
    return this.addExerciseService.execute(planId, dto, user);
  }
}
