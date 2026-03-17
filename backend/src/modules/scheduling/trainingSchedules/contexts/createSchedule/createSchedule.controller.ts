import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { CreateTrainingScheduleRequestDTO } from "./dtos/request.dto";
import { CreateTrainingScheduleResponseDTO } from "./dtos/response.dto";
import { CreateTrainingScheduleUseCase } from "./createSchedule.useCase";

@ApiTags(API_TAGS.TRAINING_SCHEDULE)
@Roles(ApplicationRoles.PERSONAL)
@Controller({ version: "1", path: "students/:studentId/training-schedules" })
export class CreateTrainingScheduleController {
  constructor(
    private readonly createTrainingScheduleUseCase: CreateTrainingScheduleUseCase,
  ) {}

  @ApiOperation({ summary: "Create a training schedule for a student" })
  @ApiCreatedResponse({ type: CreateTrainingScheduleResponseDTO })
  @ApiNotFoundResponse({ description: "Student not found" })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Param("studentId") studentId: string,
    @Body() body: CreateTrainingScheduleRequestDTO,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.createTrainingScheduleUseCase.execute(
      studentId,
      body,
      user.personalId!,
    );
  }
}
