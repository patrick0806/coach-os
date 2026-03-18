import { Controller, ForbiddenException, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { API_TAGS } from "@shared/constants";
import { CurrentUser, Roles } from "@shared/decorators";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";

import { ListWorkoutSessionsUseCase } from "./listSessions.useCase";

@ApiTags(API_TAGS.WORKOUT_EXECUTION)
@Roles(ApplicationRoles.PERSONAL, ApplicationRoles.STUDENT)
@Controller({ version: "1", path: "students/:studentId/workout-sessions" })
export class ListWorkoutSessionsController {
  constructor(private readonly listWorkoutSessionsUseCase: ListWorkoutSessionsUseCase) {}

  @ApiOperation({ summary: "List workout sessions for a student" })
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(
    @Param("studentId") studentId: string,
    @Query() query: Record<string, string>,
    @CurrentUser() user: IAccessToken,
  ) {
    // For students, always use their own profileId — ignore the URL param
    const resolvedStudentId = user.role === ApplicationRoles.STUDENT ? user.profileId : studentId;

    return this.listWorkoutSessionsUseCase.execute(resolvedStudentId, query, user.personalId!);
  }
}
