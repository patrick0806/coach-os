import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { StartWorkoutSessionRequestDTO } from "./dtos/request.dto";
import { StartWorkoutSessionResponseDTO } from "./dtos/response.dto";
import { StartWorkoutSessionUseCase } from "./startSession.useCase";

@ApiTags(API_TAGS.WORKOUT_EXECUTION)
@Roles(ApplicationRoles.PERSONAL, ApplicationRoles.STUDENT)
@Controller({ version: "1" })
export class StartWorkoutSessionController {
  constructor(private readonly startWorkoutSessionUseCase: StartWorkoutSessionUseCase) {}

  @ApiOperation({ summary: "Start a workout session for a student" })
  @ApiCreatedResponse({ type: StartWorkoutSessionResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body() body: StartWorkoutSessionRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    // Students can only start sessions for themselves
    if (user.role === ApplicationRoles.STUDENT && body.studentId !== user.profileId) {
      throw new ForbiddenException("Students can only start sessions for themselves");
    }

    return this.startWorkoutSessionUseCase.execute(body, user.personalId!);
  }
}
