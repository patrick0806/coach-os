import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListTrainingSchedulesUseCase } from "./listSchedules.useCase";

@ApiTags(API_TAGS.TRAINING_SCHEDULE)
@Roles(ApplicationRoles.PERSONAL, ApplicationRoles.STUDENT)
@Controller({ version: "1", path: "students/:studentId/training-schedules" })
export class ListTrainingSchedulesController {
  constructor(
    private readonly listTrainingSchedulesUseCase: ListTrainingSchedulesUseCase,
  ) {}

  @ApiOperation({ summary: "List training schedules for a student" })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: "Student not found" })
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(
    @Param("studentId") studentId: string,
    @CurrentUser() user: IAccessToken,
  ) {
    return this.listTrainingSchedulesUseCase.execute(
      studentId,
      user.personalId!,
      { role: user.role, profileId: user.profileId },
    );
  }
}
