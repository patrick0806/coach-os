import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateExerciseExecutionRequestDTO } from "./dtos/request.dto";
import { CreateExerciseExecutionResponseDTO } from "./dtos/response.dto";
import { CreateExerciseExecutionUseCase } from "./createExecution.useCase";

@ApiTags(API_TAGS.WORKOUT_EXECUTION)
@Roles(ApplicationRoles.PERSONAL, ApplicationRoles.STUDENT)
@Controller({ version: "1" })
export class CreateExerciseExecutionController {
  constructor(private readonly createExerciseExecutionUseCase: CreateExerciseExecutionUseCase) {}

  @ApiOperation({ summary: "Record an exercise execution in a workout session" })
  @ApiCreatedResponse({ type: CreateExerciseExecutionResponseDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body() body: CreateExerciseExecutionRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createExerciseExecutionUseCase.execute(body, user.personalId!);
  }
}
