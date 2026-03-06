import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { API_TAGS } from "@shared/constants";

import { CreateWorkoutPlanService } from "./create-workout-plan.service";
import { CreateWorkoutPlanDTO } from "./dtos/request.dto";
import { WorkoutPlanDTO } from "../shared/dtos/workout-plan.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.WORKOUT_PLANS)
@Controller({ version: "1", path: "" })
export class CreateWorkoutPlanController {
  constructor(private readonly createWorkoutPlanService: CreateWorkoutPlanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new workout plan" })
  @ApiCreatedResponse({ type: WorkoutPlanDTO })
  handle(
    @Body() dto: CreateWorkoutPlanDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<WorkoutPlanDTO> {
    return this.createWorkoutPlanService.execute(dto, user);
  }
}
