import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { AddWorkoutDayRequestDTO } from "./dtos/request.dto";
import { AddWorkoutDayResponseDTO } from "./dtos/response.dto";
import { AddWorkoutDayUseCase } from "./addWorkoutDay.useCase";

@ApiTags(API_TAGS.WORKOUT_PLANS)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: ":studentProgramId/workout-days" })
export class AddWorkoutDayController {
  constructor(private readonly addWorkoutDayUseCase: AddWorkoutDayUseCase) {}

  @ApiOperation({ summary: "Add a workout day to a student program" })
  @ApiCreatedResponse({ type: AddWorkoutDayResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Param("studentProgramId") studentProgramId: string,
    @Body() body: AddWorkoutDayRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.addWorkoutDayUseCase.execute(studentProgramId, body, user.personalId!);
  }
}
