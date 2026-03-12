import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";

import { CreateStudentPlanService } from "./create-student-plan.service";
import { CreateStudentPlanDTO } from "./dtos/request.dto";
import { WorkoutPlanDTO } from "../shared/dtos/workout-plan.dto";

@Roles(ApplicationRoles.PERSONAL)
@ApiTags(API_TAGS.WORKOUT_PLANS)
@Controller({ version: "1", path: "student" })
export class CreateStudentPlanController {
  constructor(private readonly createStudentPlanService: CreateStudentPlanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a manual student workout plan and assign it to a student" })
  @ApiCreatedResponse({ type: WorkoutPlanDTO })
  handle(
    @Body() dto: CreateStudentPlanDTO,
    @CurrentUser() user: IAccessToken,
  ): Promise<WorkoutPlanDTO> {
    return this.createStudentPlanService.execute(dto, user);
  }
}
